import asyncio
import json
import os
import threading
import urllib.request
from datetime import UTC, datetime

from dotenv import load_dotenv
from livekit import agents, rtc
from livekit.agents import (
    Agent,
    AgentServer,
    AgentSession,
    ChatContext,
    CloseEvent,
    ConversationItemAddedEvent,
    JobProcess,
    UserStateChangedEvent,
    inference,
    room_io,
)
from livekit.agents.beta import EndCallTool
from livekit.plugins import (  # type: ignore[attr-defined]
    noise_cancellation,
    openai,
    silero,
)

from constants import (
    ASSISTANT_DEFAULT_INSTRUCTIONS,
    CALL_CLASSIFICATION_PROMPT,
    CLASSIFICATION_MODEL,
    GENERATE_REPLY_INSTRUCTIONS,
    OPENAI_MODEL,
    OPENAI_TEMPERATURE,
    OPENAI_VOICE,
    USER_AWAY_GOODBYE_PROMPT,
    USER_AWAY_PROMPT,
    WAIT_FOR_USER_SECONDS,
)
from core.database import fetch_agent_config, save_call_record
from core.logging.logger import LOG
from core.models import CallClassification

load_dotenv(".env.local")

# --- Urgency notification ---

DASHBOARD_URL = os.getenv("DASHBOARD_URL", "https://medinova-health.vercel.app")
JWT_SECRET = os.getenv("JWT_SECRET", "")

LOG.info(f"DASHBOARD_URL: {DASHBOARD_URL}")
LOG.info(f"JWT_SECRET set: {bool(JWT_SECRET)} (length={len(JWT_SECRET)})")


def _notify_dashboard(classification: CallClassification):
    if not JWT_SECRET:
        LOG.warning("JWT_SECRET not set, skipping notification")
        return
    try:
        url = f"{DASHBOARD_URL}/api/livekit/notify"
        payload = json.dumps(
            {
                "callerName": classification.caller_name or "Unknown",
                "callerPhone": classification.caller_phone_number or "N/A",
                "urgency": (
                    classification.urgency.value if classification.urgency else None
                ),
                "reason": classification.reason_for_call,
                "callerLanguage": classification.caller_language,
                "appointmentDate": classification.appointment_date,
                "appointmentTime": classification.appointment_time,
                "recommendedDepartment": classification.recommended_department,
                "callbackRequired": (
                    classification.callback_required.value
                    if classification.callback_required
                    else None
                ),
                "callbackRequiredReason": classification.callback_required_reason,
                "isSpam": (
                    classification.is_spam.value if classification.is_spam else None
                ),
            }
        ).encode()
        LOG.info(f"Sending notification to {url}")
        req = urllib.request.Request(
            url,
            data=payload,
            headers={
                "Content-Type": "application/json",
                "Authorization": f"Bearer {JWT_SECRET}",
            },
            method="POST",
        )
        with urllib.request.urlopen(req, timeout=5) as resp:
            body = resp.read().decode()
            LOG.info(f"Notification sent: {resp.status} — {body}")
    except urllib.error.HTTPError as e:
        body = e.read().decode() if e.fp else ""
        LOG.error(f"Notification failed: {e.code} {e.reason} — body={body}")
    except Exception as e:
        LOG.error(f"Failed to send notification: {e}")


# --- Post-call classification helpers ---


def _build_transcript(chat_ctx: ChatContext) -> str:
    items = [
        f"{item.role}: {item.text_content}"
        for item in chat_ctx.items
        if item.type == "message"
        and item.role in ("user", "assistant")
        and not item.extra.get("is_summary")
        and item.text_content
    ]
    return "\n".join(items)


async def _classify_call(chat_ctx: ChatContext) -> CallClassification | None:
    transcript = _build_transcript(chat_ctx)
    if not transcript:
        return None

    classification_ctx = ChatContext()
    classification_ctx.add_message(
        role="system",
        content=(
            f"Current date and time: {datetime.now(UTC).isoformat()}\n\n"
            f"{CALL_CLASSIFICATION_PROMPT}"
        ),
    )
    classification_ctx.add_message(role="user", content=transcript)

    try:
        async with inference.LLM(model=CLASSIFICATION_MODEL) as llm, llm.chat(
            chat_ctx=classification_ctx,
            response_format=CallClassification,  # type: ignore[call-arg]
        ) as stream:
            collected = await stream.collect()
            if collected.text:
                return CallClassification.model_validate_json(collected.text)
    except Exception as e:
        LOG.error(f"Failed to extract call metadata: {e}")

    return None


# --- Agent ---


class Assistant(Agent):
    def __init__(self, *, instructions: str | None = None) -> None:
        super().__init__(
            instructions=instructions or ASSISTANT_DEFAULT_INSTRUCTIONS,
            tools=[
                EndCallTool(
                    end_instructions="say a brief, warm goodbye to the user",
                    delete_room=False,
                ),
            ],
        )

    async def on_enter(self) -> None:
        self.session.generate_reply(
            instructions=GENERATE_REPLY_INSTRUCTIONS,
            allow_interruptions=True,
        )


# --- User-away inactivity handler ---


async def _user_presence_loop(session: AgentSession) -> None:
    try:
        await asyncio.sleep(WAIT_FOR_USER_SECONDS)

        await session.generate_reply(
            instructions=USER_AWAY_PROMPT,
            allow_interruptions=True,
        )

        await asyncio.sleep(WAIT_FOR_USER_SECONDS)

        await session.generate_reply(
            instructions=USER_AWAY_GOODBYE_PROMPT,
            allow_interruptions=True,
        )

        session.shutdown(drain=True)
    except asyncio.CancelledError:
        LOG.info("User presence check cancelled - user responded")
        raise
    except Exception as e:
        LOG.error(f"Error in user presence task: {e}")


# --- Server setup ---


def prewarm(proc: JobProcess):
    proc.userdata["vad"] = silero.VAD.load()


server = AgentServer(initialize_process_timeout=60)
server.setup_fnc = prewarm


@server.rtc_session()
async def entrypoint(ctx: agents.JobContext):
    await ctx.connect()

    try:
        participant = await asyncio.wait_for(ctx.wait_for_participant(), timeout=90)
    except (TimeoutError, RuntimeError):
        LOG.warning("No participant joined or room disconnected. Exiting job.")
        return

    LOG.info(
        f"Participant: {participant.sid} {participant.identity} {participant.name} (kind={participant.kind})"
    )

    # Fetch instructions from MongoDB
    config = fetch_agent_config()
    instructions = config.get("instructions")

    if instructions:
        instructions = (
            f"Current date and time: {datetime.now(UTC).isoformat()}\n\n{instructions}"
        )
        LOG.info("Loaded instructions from MongoDB")
    else:
        instructions = ASSISTANT_DEFAULT_INSTRUCTIONS
        LOG.info("Using default instructions from constants")

    call_started_at = datetime.now(tz=UTC)
    inactivity_task: asyncio.Task | None = None

    session: AgentSession = AgentSession(
        llm=openai.realtime.RealtimeModel(
            model=OPENAI_MODEL,
            voice=OPENAI_VOICE,
            temperature=OPENAI_TEMPERATURE,
        ),
        vad=ctx.proc.userdata["vad"],
        user_away_timeout=WAIT_FOR_USER_SECONDS,
    )

    await session.start(
        room=ctx.room,
        agent=Assistant(instructions=instructions),
        room_options=room_io.RoomOptions(
            delete_room_on_close=True,
            audio_input=room_io.AudioInputOptions(
                noise_cancellation=lambda params: (
                    noise_cancellation.BVCTelephony()
                    if params.participant.kind
                    == rtc.ParticipantKind.PARTICIPANT_KIND_SIP
                    else noise_cancellation.BVC()
                ),
            ),
        ),
    )

    @session.on("conversation_item_added")
    def on_conversation_item_added(ev: ConversationItemAddedEvent):
        LOG.info(f"[Chat] {ev.item.role}: {ev.item.content}")  # type: ignore[union-attr]

    @session.on("user_state_changed")
    def _user_state_changed(ev: UserStateChangedEvent):
        nonlocal inactivity_task
        if ev.new_state == "away":
            if inactivity_task is None or inactivity_task.done():
                inactivity_task = asyncio.create_task(_user_presence_loop(session))
            return

        if inactivity_task is not None and not inactivity_task.done():
            inactivity_task.cancel()

    @session.on("close")
    def on_close(ev: CloseEvent):
        nonlocal inactivity_task

        duration = (datetime.now(tz=UTC) - call_started_at).total_seconds()
        LOG.info(f"call duration: {duration:.2f}s")

        if inactivity_task is not None and not inactivity_task.done():
            inactivity_task.cancel()

    async def classify_on_shutdown():
        try:
            classification = await asyncio.wait_for(
                _classify_call(session.history),
                timeout=8,
            )
            if classification:
                LOG.info(f"Call Classification: {classification.model_dump_json()}")

                transcript = _build_transcript(session.history)
                duration = (datetime.now(tz=UTC) - call_started_at).total_seconds()

                record = {
                    "room_name": ctx.room.name,
                    "participant_identity": participant.identity,
                    "caller_name": classification.caller_name,
                    "caller_phone": classification.caller_phone_number,
                    "started_at": call_started_at,
                    "duration_seconds": duration,
                    "transcript": transcript,
                    "_classification": classification,
                }
                save_call_record(record)

                threading.Thread(
                    target=_notify_dashboard,
                    args=(classification,),
                    daemon=True,
                ).start()
            else:
                LOG.info("No classification generated for session")
        except TimeoutError:
            LOG.warning("Skipping call classification: summarization timed out")

    ctx.add_shutdown_callback(classify_on_shutdown)


if __name__ == "__main__":
    agents.cli.run_app(server)
