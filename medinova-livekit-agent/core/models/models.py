from enum import StrEnum

from pydantic import BaseModel


class IsSpam(StrEnum):
    SPAM = "SPAM"
    NOT_SPAM = "NOT_SPAM"
    NOT_SURE = "NOT_SURE"


class CallbackRequired(StrEnum):
    YES = "YES"
    NO = "NO"
    NOT_SURE = "NOT_SURE"


class Urgency(StrEnum):
    URGENT = "URGENT"
    HIGH = "HIGH"
    MEDIUM = "MEDIUM"
    LOW = "LOW"


class CallClassification(BaseModel):
    is_spam: IsSpam
    reason_for_call: str
    callback_required: CallbackRequired
    callback_required_reason: str
    caller_name: str | None = None
    caller_phone_number: str | None = None
    caller_language: str | None = None
    urgency: Urgency | None = None
    recommended_next_steps: list[str] | None = None
    recommended_department: str | None = None
    appointment_date: str | None = None
    appointment_time: str | None = None
