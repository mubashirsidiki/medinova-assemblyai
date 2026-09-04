# 01. Agent Architecture & Runtime Lifecycle

## 1. System Overview
`medinova-livekit-agent` is an autonomous real-time voice worker that connects to LiveKit rooms, interacts directly with callers using bi-directional streaming audio, executes clinical routing logic, and persists post-call records.

```
┌────────────────────────────────────────┐
│             Caller                     │
│  (Browser WebRTC or Telephone SIP)     │
└──────────────────┬─────────────────────┘
                   │ Audio Stream
                   ▼
┌────────────────────────────────────────┐
│           LiveKit Cloud                │
│    (SFU / Room Dispatch / WebRTC)      │
└──────────────────┬─────────────────────┘
                   │
                   ▼
┌────────────────────────────────────────┐
│       medinova-livekit-agent           │
│  ┌──────────────────────────────────┐  │
│  │ Silero VAD + BVC Noise Cancel    │  │
│  └──────────────────┬───────────────┘  │
│                     │                  │
│  ┌──────────────────▼───────────────┐  │
│  │ OpenAI Realtime API (Voice)      │  │
│  └──────────────────┬───────────────┘  │
│                     │                  │
│  ┌──────────────────▼───────────────┐  │
│  │ Post-Call Triage (GPT-4.1-mini)  │  │
│  └──────────────────┬───────────────┘  │
└─────────────────────┼──────────────────┘
                      │
           ┌──────────┴──────────┐
           ▼                     ▼
┌────────────────────┐ ┌───────────────────┐
│ MongoDB Atlas      │ │ Next.js Dashboard │
│ (CallRecord table) │ │ (/api/livekit/    │
│                    │ │       notify)     │
└────────────────────┘ └───────────────────┘
```

---

## 2. Process Prewarming (`prewarm`)
To achieve sub-second response times upon user connection, models are pre-loaded in the parent process:
```python
def prewarm(proc: JobProcess):
    proc.userdata["vad"] = silero.VAD.load()
```
- Silero Voice Activity Detection (VAD) is loaded once per process.
- Avoids cold-start latency when a room dispatch arrives.

---

## 3. Worker Session Lifecycle (`agent.py`)

### 1. Connection & Dispatch (`@server.rtc_session()`)
- Worker initializes with `AgentServer(initialize_process_timeout=60)`.
- Connects to room via `await ctx.connect()`.
- Awaits incoming participant with 90-second timeout (`ctx.wait_for_participant()`).

### 2. Configuration Bootstrapping
- Checks MongoDB for custom instructions (`fetch_agent_config()`).
- If found, prefixes instructions with live UTC timestamp:
  ```python
  instructions = f"Current date and time: {datetime.now(timezone.utc).isoformat()}\n\n{instructions}"
  ```
- Falls back to `ASSISTANT_DEFAULT_INSTRUCTIONS` if database is unpopulated or unreachable.

### 3. Session Initialization
- Instantiates `AgentSession`:
  - LLM: `openai.realtime.RealtimeModel` (`model="gpt-realtime-1.5"`, `voice="marin"`, `temperature=0.8`).
  - VAD: Prewarmed Silero instance.
  - Inactivity Timeout: `WAIT_FOR_USER_SECONDS = 15`.
- Starts room audio pipeline (`session.start(...)`):
  - `delete_room_on_close=True` (Destroys room when call terminates).
  - Dynamic noise cancellation based on participant kind.

### 4. Active Call Event Listeners
- `conversation_item_added`: Logs full conversational turns (`role` and `content`).
- `user_state_changed`: Detects when caller becomes idle/away (`ev.new_state == "away"`). Triggers inactivity recovery loop.
- `close`: Calculates call duration in seconds and cancels any active inactivity watchdog tasks.

### 5. Shutdown Callback (`classify_on_shutdown`)
- Registered via `ctx.add_shutdown_callback(...)`.
- Executes when the session ends before worker teardown:
  1. Extracts call transcript from session history.
  2. Runs structured classification via GPT-4.1-mini.
  3. Writes complete `CallRecord` directly to MongoDB.
  4. Dispatches asynchronous webhook notification to Next.js dashboard.
