# 02. Speech & AI Voice Pipeline

## 1. Decoupled Modular Architecture
Medinova utilizes a high-performance decoupled voice pipeline integrating specialized state-of-the-art models for speech recognition, reasoning, and speech synthesis:

- **Speech-to-Text (STT)**: **AssemblyAI Universal 3.5 Pro** (`universal-3-5-pro`) streaming transcription.
- **Reasoning (LLM)**: **OpenAI Chat Completions** (`gpt-4o-mini`).
- **Text-to-Speech (TTS)**: **Inworld Realtime TTS 2.0 Flash** (`inworld/inworld-tts-2-flash`) via LiveKit Cloud Inference (~150ms first-chunk audio latency).
- **Turn Detection**: STT punctuation-based turn detection (`turn_detection="stt"`, `endpointing.min_delay=0`).
- **Voice Activity Detection**: Silero VAD (`activation_threshold=0.3`) matching AssemblyAI's internal VAD to prevent barge-in dead zones.

---

## 2. Voice Pipeline Configuration (`constants.py`)

| Parameter | Value | Description |
| :--- | :--- | :--- |
| **`ASSEMBLYAI_STT_MODEL`** | `universal-3-5-pro` | AssemblyAI low-latency streaming STT foundation model. |
| **`ASSEMBLYAI_MIN_TURN_SILENCE_MS`**| `100` | Minimum silence threshold before turn candidate evaluation. |
| **`ASSEMBLYAI_MAX_TURN_SILENCE_MS`**| `1000`| Maximum silence threshold to prevent premature turn cutoffs. |
| **`ASSEMBLYAI_VAD_THRESHOLD`** | `0.3` | Sensitivity threshold aligned with local Silero VAD. |
| **`CHAT_LLM_MODEL`** | `gpt-4o-mini` | Fast conversational reasoning and clinical adherence. |
| **`CHAT_LLM_TEMPERATURE`** | `0.6` | Deterministic clinical intake with natural conversational flow. |
| **`INWORLD_TTS_MODEL`** | `inworld/inworld-tts-2-flash` | LiveKit Cloud inference ultra-low latency TTS engine. |
| **`INWORLD_TTS_VOICE`** | `Ashley` | Clear, professional synthesized healthcare voice. |
| **`INWORLD_TTS_LANGUAGE`** | `en` | Base synthesis language code. |

---

## 3. Voice Activity Detection (VAD) & Turn-Taking
- **Library**: `livekit-plugins-silero` (`silero.VAD.load(activation_threshold=0.3)`)
- **Turn Detection**: `TurnHandlingOptions(turn_detection="stt", endpointing={"min_delay": 0})`
- **Interruption (Barge-in)**: When caller speaks while assistant talks, audio playback stops immediately.

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
