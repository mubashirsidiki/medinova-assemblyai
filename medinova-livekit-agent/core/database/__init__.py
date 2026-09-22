import os
import re
from datetime import UTC, datetime

from bson import ObjectId
from dotenv import load_dotenv
from pymongo import MongoClient
from pymongo.database import Database

from constants import DEFAULT_MONGODB_DATABASE
from core.logging.logger import LOG

load_dotenv(".env.local")
load_dotenv()

MONGODB_URI = os.getenv("MONGODB_URI", "")
ORGANIZATION_ID = os.getenv("ORGANIZATION_ID", "")
MONGODB_DB_NAME = os.getenv("MONGODB_DB_NAME", DEFAULT_MONGODB_DATABASE)

LOG.info(f"MONGODB_URI set: {bool(MONGODB_URI)} (length={len(MONGODB_URI)})")
LOG.info(f"ORGANIZATION_ID set: {bool(ORGANIZATION_ID)} (value={ORGANIZATION_ID})")
LOG.info(f"MONGODB_DB_NAME set: {MONGODB_DB_NAME}")

_client: MongoClient | None = MongoClient(MONGODB_URI) if MONGODB_URI else None


def _resolve_database(client: MongoClient) -> Database:
    try:
        default_db = client.get_default_database()
        if default_db is not None:
            return default_db
    except Exception as e:
        LOG.debug(f"No default database in MongoDB URI, using {MONGODB_DB_NAME}: {e}")
    return client.get_database(MONGODB_DB_NAME)


_db = _resolve_database(_client) if _client else None


def fetch_agent_config() -> dict:
    """Fetch BotSettings from MongoDB. Returns instructions and voice model name."""
    if _db is None:
        return {}
    try:
        settings = _db.get_collection("BotSettings")
        doc = settings.find_one(sort=[("updatedAt", -1)])
        if doc:
            return {
                "instructions": doc.get("instructions", ""),
                "voice_model_name": doc.get("voiceModelName", ""),
            }
    except Exception as e:
        LOG.warning(f"Could not fetch agent config from MongoDB: {e}")
    return {}


def _parse_scheduled_at(date_str: str | None, time_str: str | None) -> datetime | None:
    """Parse appointment date and time strings into a timezone-aware UTC datetime."""
    if not date_str:
        return None
    clean_date = date_str.strip()
    clean_time = (time_str or "09:00").strip()

    formats = [
        "%Y-%m-%d %H:%M",
        "%Y-%m-%d %H:%M:%S",
        "%Y-%m-%d %I:%M %p",
        "%Y-%m-%d %I:%M%p",
        "%Y-%m-%d",
    ]
    for fmt in formats:
        try:
            dt = datetime.strptime(f"{clean_date} {clean_time}", fmt)  # noqa: DTZ007
            return dt.replace(tzinfo=UTC)
        except ValueError:
            continue

    try:
        dt = datetime.strptime(clean_date, "%Y-%m-%d")  # noqa: DTZ007
        return dt.replace(hour=9, minute=0, second=0, tzinfo=UTC)
    except Exception:
        return None


def save_call_record(payload: dict):
    """Save call classification directly to CallRecord collection (Prisma-managed),

    and automatically create Patient, Appointment, and Notification if a slot was booked.
    """
    if _db is None:
        LOG.warning("Cannot save call record: MongoDB not connected")
        return
    if not ORGANIZATION_ID:
        LOG.warning("ORGANIZATION_ID not set, cannot save call record")
        return

    now = datetime.now(UTC)
    classification = payload.get("_classification")
    duration = payload.get("duration_seconds", 0) or 0

    try:
        org_oid = ObjectId(ORGANIZATION_ID)
        caller_name = (
            (
                classification.caller_name
                if classification
                and classification.caller_name
                and classification.caller_name.strip().lower()
                not in ("unknown", "unknown caller", "user", "n/a", "none")
                else None
            )
            or payload.get("caller_name")
            or payload.get("known_caller_name")
            or "Unknown"
        )
        caller_phone = payload.get("caller_phone") or (
            classification.caller_phone_number if classification else None
        )
        caller_lang = (
            (classification.caller_language or "English")
            if classification
            else "English"
        )
        urgency_val = (
            (classification.urgency.value)
            if classification and classification.urgency
            else "LOW"
        )

        # Resolve or create Patient record if caller name is provided
        patient_id = None
        if caller_name and caller_name not in ("Unknown", "Unknown Caller"):
            try:
                patient_col = _db.get_collection("Patient")
                existing_patient = patient_col.find_one(
                    {
                        "organizationId": org_oid,
                        "name": {
                            "$regex": f"^{re.escape(caller_name)}$",
                            "$options": "i",
                        },
                    }
                )
                if existing_patient:
                    patient_id = existing_patient["_id"]
                else:
                    risk_level = (
                        "urgent"
                        if urgency_val == "URGENT"
                        else "high" if urgency_val == "HIGH" else "standard"
                    )
                    new_patient = {
                        "organizationId": org_oid,
                        "name": caller_name,
                        "preferredLanguage": caller_lang,
                        "riskLevel": risk_level,
                        "createdAt": now,
                        "updatedAt": now,
                    }
                    res = patient_col.insert_one(new_patient)
                    patient_id = res.inserted_id
                    LOG.info(f"Created new Patient: {patient_id} ({caller_name})")
            except Exception as e:
                LOG.error(f"Error resolving or creating patient: {e}")

        appt_date_str = classification.appointment_date if classification else None
        appt_time_str = classification.appointment_time if classification else None
        dept = (
            (classification.recommended_department or "General Medicine")
            if classification
            else "General Medicine"
        )

        call_record = {
            "organizationId": org_oid,
            "patientId": patient_id,
            "callerName": caller_name,
            "callerPhone": caller_phone,
            "callerLanguage": caller_lang,
            "intent": (
                classification.reason_for_call[:120]
                if classification and classification.reason_for_call
                else "General inquiry"
            ),
            "isSpam": (
                (classification.is_spam.value)
                if classification and classification.is_spam
                else "NOT_SURE"
            ),
            "urgency": urgency_val,
            "callbackRequired": (
                (classification.callback_required.value)
                if classification and classification.callback_required
                else "NOT_SURE"
            ),
            "callbackRequiredReason": (
                (classification.callback_required_reason or "")
                if classification
                else ""
            ),
            "recommendedDepartment": (
                (classification.recommended_department or "") if classification else ""
            ),
            "appointmentDate": appt_date_str,
            "appointmentTime": appt_time_str,
            "recommendedNextSteps": (
                (classification.recommended_next_steps)
                if classification and classification.recommended_next_steps
                else []
            ),
            "transcript": payload.get("transcript", ""),
            "channel": "voice",
            "startedAt": payload.get("started_at", now),
            "endedAt": now,
            "durationSeconds": int(duration),
            "latencyMs": 0,
            "costUsd": round((duration / 60) * 0.025, 2),
            "createdAt": now,
            "updatedAt": now,
        }

        result = _db.get_collection("CallRecord").insert_one(call_record)
        call_record_id = result.inserted_id
        LOG.info(f"CallRecord saved: {call_record_id}")

        # If call agreed on appointment slot and patient exists, create Appointment & Notification
        if appt_date_str and patient_id:
            try:
                scheduled_at = _parse_scheduled_at(appt_date_str, appt_time_str)
                if scheduled_at:
                    appt_col = _db.get_collection("Appointment")
                    # Idempotency check: see if appointment already scheduled for this patient at this time
                    existing_appt = appt_col.find_one(
                        {
                            "organizationId": org_oid,
                            "patientId": patient_id,
                            "scheduledAt": scheduled_at,
                        }
                    )
                    if not existing_appt:
                        appt_doc = {
                            "organizationId": org_oid,
                            "patientId": patient_id,
                            "providerId": None,
                            "department": dept,
                            "status": "scheduled",
                            "channel": "voice",
                            "scheduledAt": scheduled_at,
                            "durationMinutes": 30,
                            "confirmationSent": True,
                            "calendarSynced": True,
                            "createdAt": now,
                            "updatedAt": now,
                        }
                        appt_res = appt_col.insert_one(appt_doc)
                        appointment_id = appt_res.inserted_id
                        LOG.info(
                            f"Created Appointment from call: {appointment_id} for {scheduled_at}"
                        )

                        notif_col = _db.get_collection("Notification")
                        time_display = appt_time_str or scheduled_at.strftime("%H:%M")
                        notif_doc = {
                            "organizationId": org_oid,
                            "patientId": patient_id,
                            "appointmentId": appointment_id,
                            "kind": "sms_confirmation",
                            "channel": "sms",
                            "title": "Appointment confirmed",
                            "body": f"Your visit with {dept} is scheduled for {appt_date_str} at {time_display}.",
                            "status": "unread",
                            "scheduledAt": scheduled_at,
                            "createdAt": now,
                            "updatedAt": now,
                        }
                        notif_col.insert_one(notif_doc)
                        LOG.info(
                            f"Created Notification for Appointment: {appointment_id}"
                        )
            except Exception as e:
                LOG.error(f"Failed to create Appointment from call booking: {e}")

    except Exception as e:
        LOG.error(f"Failed to save call record to MongoDB: {e}")


def normalize_phone_number(raw: str | None) -> str:
    """Normalize phone number into standard E.164-like digits (e.g. +14844812043)."""
    if not raw:
        return ""
    cleaned = raw.strip()
    if cleaned.lower().startswith("sip:"):
        cleaned = cleaned[4:]
    if "@" in cleaned:
        cleaned = cleaned.split("@")[0]
    if cleaned.lower().startswith("tel:"):
        cleaned = cleaned[4:]

    has_plus = cleaned.startswith("+")
    digits = re.sub(r"[^\d]", "", cleaned)
    if not digits:
        return ""
    if has_plus:
        return f"+{digits}"
    if len(digits) == 10:
        return f"+1{digits}"
    return f"+{digits}" if len(digits) >= 11 else digits


def fetch_caller_history(caller_phone: str) -> dict | None:
    """Query MongoDB for historical calls associated with this phone number.

    Returns structured summary if prior calls exist, else None.
    """
    if _db is None or not caller_phone:
        return None

    normalized = normalize_phone_number(caller_phone)
    if not normalized:
        return None

    digits = re.sub(r"[^\d]", "", normalized)
    last_10 = digits[-10:] if len(digits) >= 10 else digits

    # Regex matching significant digits across spaces/dashes/brackets
    regex_pattern = ".*".join(list(last_10))

    try:
        call_col = _db.get_collection("CallRecord")
        query: dict = {
            "$or": [
                {"callerPhone": {"$regex": regex_pattern, "$options": "i"}},
                {"callerPhone": caller_phone},
                {"callerPhone": normalized},
            ]
        }
        if ORGANIZATION_ID:
            query["organizationId"] = ObjectId(ORGANIZATION_ID)

        cursor = call_col.find(query).sort("startedAt", -1).limit(5)
        records = list(cursor)

        if not records:
            return None

        # Resolve best known caller name (latest non-empty, non-Unknown name)
        caller_name: str | None = None
        for r in records:
            name = (r.get("callerName") or "").strip()
            if name and name.lower() not in (
                "unknown",
                "unknown caller",
                "user",
                "n/a",
                "none",
            ):
                caller_name = name
                break

        # Check linked Patient collection if patientId exists and no name resolved yet
        if not caller_name:
            for r in records:
                p_id = r.get("patientId")
                if p_id:
                    p_doc = _db.get_collection("Patient").find_one({"_id": p_id})
                    if p_doc and p_doc.get("name"):
                        p_name = p_doc["name"].strip()
                        if p_name and p_name.lower() not in (
                            "unknown",
                            "unknown caller",
                        ):
                            caller_name = p_name
                            break

        past_calls = []
        for r in records:
            started = r.get("startedAt")
            date_str = (
                started.strftime("%Y-%m-%d")
                if isinstance(started, datetime)
                else str(started or "")
            )
            dept = r.get("recommendedDepartment") or ""
            appt_d = r.get("appointmentDate") or ""
            appt_t = r.get("appointmentTime") or ""
            appt_info = f"{appt_d} at {appt_t}".strip() if appt_d else "None"

            past_calls.append(
                {
                    "date": date_str,
                    "intent": r.get("intent") or "General inquiry",
                    "department": dept,
                    "appointment": appt_info,
                    "urgency": r.get("urgency") or "LOW",
                    "callback_required": r.get("callbackRequired") or "NO",
                }
            )

        last_call = records[0]
        last_started = last_call.get("startedAt")
        last_date = (
            last_started.strftime("%Y-%m-%d %H:%M UTC")
            if isinstance(last_started, datetime)
            else ""
        )

        return {
            "caller_phone": caller_phone,
            "normalized_phone": normalized,
            "caller_name": caller_name,
            "total_calls": len(records),
            "last_call_date": last_date,
            "past_calls": past_calls,
        }
    except Exception as e:
        LOG.warning(f"Failed to fetch caller history for {caller_phone}: {e}")
        return None


def build_returning_caller_context(history: dict) -> str:
    """Format returning caller history into a clean system instruction block."""
    name_display = history.get("caller_name") or "Name not on file"
    phone_display = history.get("caller_phone") or history.get("normalized_phone")
    total = history.get("total_calls", 1)

    lines = [
        "## RETURNING PATIENT PROFILE & CALL HISTORY:",
        f"- Phone: {phone_display}",
        f"- Recognized Patient Name: {name_display}",
        f"- Total Prior Calls Recorded: {total}",
        f"- Most Recent Call: {history.get('last_call_date')}",
        "- Recent Call History (most recent first):",
    ]

    for i, c in enumerate(history.get("past_calls", []), 1):
        lines.append(
            f"  * Call {i} ({c['date']}): Concern: {c['intent']} | Dept: {c['department'] or 'N/A'} | Appt: {c['appointment']} | Urgency: {c['urgency']}"
        )

    lines.extend(
        [
            "",
            "RETURNING CALLER INTAKE RULES:",
            "- You recognize this caller. Do NOT ask for information you already have unless they wish to change it.",
            f"- The patient's name on file is: {name_display}.",
            "- If the caller asks about previous visits, appointments, or ongoing symptoms, reference the details above.",
            "- Maintain clinical warmth, efficiency, and continuity of care.",
        ]
    )

    return "\n".join(lines)
