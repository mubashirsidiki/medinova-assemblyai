# 04. Post-Call Clinical Triage & Classification

## 1. Overview
When a voice call terminates, the agent compiles the complete dialog history and executes an asynchronous structured classification job using `openai/gpt-4.1-mini`.

This extracts structured clinical parameters without delaying in-call voice response latency.

---

## 2. Classification Schema (`core/models/models.py`)

The extracted data is strongly validated using Pydantic:

```python
class IsSpam(StrEnum):
    SPAM = "SPAM"
    NOT_SPAM = "NOT_SPAM"
    NOT_SURE = "NOT_SURE"

class CallbackRequired(StrEnum):
    YES = "YES"
    NO = "NO"
    NOT_SURE = "NOT_SURE"

class Urgency(StrEnum):
    URGENT = "URGENT"    # Emergency symptoms (chest pain, stroke signs)
    HIGH = "HIGH"        # Acute symptoms needing same-day attention
    MEDIUM = "MEDIUM"    # General consultations or routine concerns
    LOW = "LOW"          # Administrative, informational, or follow-up

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
```

---

## 3. Extraction Execution (`_classify_call`)

- **Model**: `CLASSIFICATION_MODEL = "openai/gpt-4.1-mini"` via LiveKit Inference
- **Prompt**: `CALL_CLASSIFICATION_PROMPT` in `constants.py`
- **Context Construction**:
  1. Filters out non-conversational messages and summaries.
  2. Formats dialog as:
     ```
     user: Hello, I have had a severe rash on my arm for three days.
     assistant: I understand. Let me help you find the right clinic department...
     ```
  3. Uses OpenAI structured outputs (`response_format=CallClassification`).
  4. Returns parsed `CallClassification` instance or `None` on timeout (8-second threshold).
