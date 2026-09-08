import os
from datetime import UTC, datetime

from bson import ObjectId
from pymongo import MongoClient
from pymongo.database import Database

from constants import DEFAULT_MONGODB_DATABASE
from core.logging.logger import LOG

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


def save_call_record(payload: dict):
    """Save call classification directly to CallRecord collection (Prisma-managed)."""
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
        call_record = {
            "organizationId": ObjectId(ORGANIZATION_ID),
            "patientId": None,
            "callerName": payload.get("caller_name") or "Unknown",
            "callerPhone": payload.get("caller_phone") or None,
            "callerLanguage": (
                (classification.caller_language or "English")
                if classification
                else "English"
            ),
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
            "urgency": (
                (classification.urgency.value)
                if classification and classification.urgency
                else "LOW"
            ),
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
            "appointmentDate": (
                (classification.appointment_date) if classification else None
            ),
            "appointmentTime": (
                (classification.appointment_time) if classification else None
            ),
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

    except Exception as e:
        LOG.error(f"Failed to save call record to MongoDB: {e}")
