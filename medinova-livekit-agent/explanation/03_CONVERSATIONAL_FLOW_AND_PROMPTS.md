# 03. Conversational Flow & Behavioral Rules

## 1. System Prompt & Persona (`constants.py`)

The assistant operates under strict clinical boundaries encoded in `ASSISTANT_DEFAULT_INSTRUCTIONS`:

### Persona & Tone:
- Friendly, calm, empathetic healthcare voice assistant for Medinova Health Network.
- Responses are kept short: **1 to 2 sentences max** to maintain natural voice cadence.
- Asks one focused question at a time.

### Non-Negotiable Clinical Safeguards:
1. **No Medical Advice**:
   - The assistant is explicitly prohibited from diagnosing diseases, prescribing medication, or offering clinical opinions.
   - Refusal script: *"I'm not able to provide medical advice, but I can make sure the right department reviews your case."*
2. **Emergency Triage Protocol**:
   - Symptoms: Chest pain, shortness of breath, severe bleeding, signs of stroke, acute allergic reactions.
   - Script (UK): Directs caller to dial **999** immediately.
   - Script (German): *"Bitte rufen Sie sofort den Notruf 112 an."*

---

## 2. Standard Patient Intake Sequence

```
1. Warm Greeting & Offer Help
       │
       ▼
2. Collect & Confirm Caller Name
       │
       ▼
3. Inquire About Symptoms / Concerns
       │
       ▼
4. Symptom Duration / Severity Check
       │
       ▼
5. Evaluate Department Match & Explain Reason
       │
       ▼
6. Propose Available Appointment Slot
       │
       ▼
7. Confirm Booking Details
       │
       ▼
8. Mandatory Final Check ("Is there anything else I can help you with today?")
       │
       ▼
9. Warm Goodbye -> End Call Tool
```

*Note: If the caller immediately asks to book with a specific department, the agent skips symptom deep-dive and proceeds directly to appointment scheduling.*

---

## 3. Department Routing Catalog

| Department | Clinical Scope | Operating Availability |
| :--- | :--- | :--- |
| **Cardiology** | Heart, blood pressure, cardiovascular conditions | Mon–Fri 09:00–17:00 |
| **General Medicine** | Routine checkups, common illnesses, primary care (Default fallback) | Mon–Sat 08:00–20:00 |
| **Endocrinology** | Diabetes, thyroid disorders, hormonal imbalances | Mon–Fri 09:00–17:00 |
| **Obstetrics** | Pregnancy, prenatal care, women's reproductive health | Mon–Fri 09:00–17:00, Sat 10:00–14:00 |
| **Pediatrics** | Infant/child health, vaccinations, developmental concerns | Mon–Fri 09:00–18:00, Sat 10:00–14:00 |

---

## 4. Call Ending Rules (`EndCallTool`)
The assistant terminates calls using LiveKit's built-in `EndCallTool`:
```python
tools=[
    EndCallTool(
        end_instructions="say a brief, warm goodbye to the user",
        delete_room=False,
    ),
]
```

### Mandatory Termination Criteria:
1. **Off-Topic**: Caller persistently talks about non-healthcare subjects after one redirection attempt.
2. **Caller Requests to End**: Caller indicates they wish to hang up.
3. **Intake Complete**: Name, symptoms, and appointment/routing steps are confirmed.

**Mandatory Pre-End Check**: Before ending under any circumstance, the assistant must ask:  
*"Is there anything else I can help you with today?"*

---

## 5. Inactivity Watchdog (`_user_presence_loop`)
Handles dropped connections or caller silence without hanging up abruptly:
- `WAIT_FOR_USER_SECONDS = 15`
1. After 15 seconds of silence:
   - Agent prompts: *"Are you still there? Please let me know if you need any help, otherwise I'll have to end the call shortly."*
2. After an additional 15 seconds of silence:
   - Agent says goodbye: *"Thank you for calling Medinova Health. Take care, and goodbye!"*
   - Invokes `session.shutdown(drain=True)` to close connection.
3. If the user speaks at any point during the countdown, the watchdog task is immediately cancelled.
