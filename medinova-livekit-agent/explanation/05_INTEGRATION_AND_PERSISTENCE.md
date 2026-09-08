# 05. Integration, Database Persistence & Webhooks

## 1. Dual Ingestion Model
To ensure maximum reliability, post-call clinical data is synced via two distinct channels:
1. **Direct MongoDB Write**: Immediate low-level persistence to the `CallRecord` collection using `pymongo`.
2. **HTTP Webhook Dispatch**: Secure event notification sent to the Next.js clinical dashboard (`/api/livekit/notify`).

---

## 2. Direct MongoDB Write (`core/database/__init__.py`)

### Prerequisites:
- `MONGODB_URI`: Connection string pointing to the same MongoDB database used by the Next.js app (`medinova-assembly-ai`).
- `ORGANIZATION_ID`: Hex string ObjectId representing the tenant organization.

### Schema Alignment:
The document structure inserted into `CallRecord` matches the Prisma model in `next-app/prisma/schema.prisma`:
```python
call_record = {
    "organizationId": ObjectId(ORGANIZATION_ID),
    "patientId": None,
    "callerName": payload.get("caller_name") or "Unknown",
    "callerPhone": payload.get("caller_phone") or None,
    "callerLanguage": classification.caller_language or "English",
    "intent": classification.reason_for_call[:120],
    "isSpam": classification.is_spam.value,
    "urgency": classification.urgency.value,
    "callbackRequired": classification.callback_required.value,
    "callbackRequiredReason": classification.callback_required_reason or "",
    "recommendedDepartment": classification.recommended_department or "",
    "appointmentDate": classification.appointment_date,
    "appointmentTime": classification.appointment_time,
    "recommendedNextSteps": classification.recommended_next_steps or [],
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
```

---

## 3. Dynamic Configuration Fetching (`fetch_agent_config`)
On startup and room dispatch, the agent inspects the `BotSettings` collection:
```python
def fetch_agent_config() -> dict:
    settings = _db.get_collection("BotSettings")
    doc = settings.find_one(sort=[("updatedAt", -1)])
    if doc:
        return {
            "instructions": doc.get("instructions", ""),
            "voice_model_name": doc.get("voiceModelName", ""),
        }
```
- Allows clinical staff to update system prompt instructions in the Next.js web portal without redeploying the Python worker.

---

## 4. HTTP Webhook Notification (`_notify_dashboard`)
Dispatched in a non-blocking daemon thread:
- **Target URL**: `${DASHBOARD_URL}/api/livekit/notify`
- **Auth Header**: `Authorization: Bearer <JWT_SECRET>`
- **HTTP Method**: `POST`
- **Payload**: JSON matching the `CallClassification` model.
- **Error Handling**: Logged via `medinova-agent` structured JSON logger without disrupting the agent process.
