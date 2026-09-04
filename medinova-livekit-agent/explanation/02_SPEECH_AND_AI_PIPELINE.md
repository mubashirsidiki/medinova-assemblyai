# 02. Speech & AI Realtime Pipeline

## 1. End-to-End Realtime Architecture
Unlike multi-stage pipelines (STT -> LLM -> TTS) which incur cumulative latency penalties (1.5s - 3s), Medinova utilizes the **OpenAI Realtime API** (`gpt-realtime-1.5`).

- Audio input streams directly to the model.
- Audio output streams back in native speech chunks.
- Enables natural conversational turn-taking, immediate interruptions, and sub-second latency.

---

## 2. Voice Model Configuration (`constants.py`)

| Parameter | Value | Description |
| :--- | :--- | :--- |
| **`OPENAI_MODEL`** | `gpt-realtime-1.5` | Native audio-to-audio multimodal foundation model. |
| **`OPENAI_VOICE`** | `marin` | Warm, clear, professional synthesized voice profile. |
| **`OPENAI_TEMPERATURE`** | `0.8` | Balanced natural conversational inflection and clinical adherence. |

---

## 3. Voice Activity Detection (VAD) & Turn-Taking
- **Library**: `livekit-plugins-silero` (`silero.VAD`)
- Identifies when the caller begins and finishes speaking.
- Allows interruptions: When the user speaks while the assistant is talking, playback stops immediately and the model attends to the user's interruption.

---

## 4. Dynamic Noise Cancellation
Configured in `session.start` via `livekit-plugins-noise-cancellation`:

```python
audio_input=room_io.AudioInputOptions(
    noise_cancellation=lambda params: (
        noise_cancellation.BVCTelephony()
        if params.participant.kind == rtc.ParticipantKind.PARTICIPANT_KIND_SIP
        else noise_cancellation.BVC()
    ),
)
```

- **WebRTC Participants (`BVC`)**: General background noise suppression optimized for laptop/mobile microphones and ambient room noise.
- **SIP Telephony Participants (`BVCTelephony`)**: Tuned for narrowband/wideband phone lines, removing cellular line hiss and acoustic echo.

---

## 5. Multilingual Voice Support
- **Default Language**: British English with clear pronunciation.
- **German Language Handling**:
  - The model auto-detects German callers and switches to fluent German immediately.
  - Switches emergency phrase to: *"Bitte rufen Sie sofort den Notruf 112 an."*
- **Other Languages (e.g., Urdu, Polish, Punjabi)**:
  - Agent attempts to comprehend and respond in the caller's language.
  - If comprehension confidence is low, gently prompts the caller to proceed in English.
