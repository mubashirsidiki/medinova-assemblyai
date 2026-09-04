# 05. LiveKit Voice Integration

## 1. Overview
Medinova uses LiveKit to power real-time, bi-directional voice streaming between patients/users and the AI medical assistant.

The voice stack consists of two parts:
1. **Frontend App (`next-app`)**:
   - Mints secure room tokens for client browsers (`/api/livekit/token`).
   - Renders the interactive in-browser voice test lab (`src/components/bot-test-lab.tsx` and `src/components/livekit/*`).
   - Receives post-call summaries and transcripts from the agent worker (`/api/livekit/notify`).
2. **Backend Agent (`medinova-livekit-agent`)**:
   - Python LiveKit Agents SDK worker.
   - Joins rooms, captures user audio, streams to Speech-to-Text (AssemblyAI / Deepgram), processes conversation with LLM, and streams back synthesized audio (Cartesia / ElevenLabs).

---

## 2. Realtime Token Endpoint (`/api/livekit/token`)

- **File**: `src/app/api/livekit/token/route.ts`
- **Method**: `POST`
- **Authentication**: Requires valid user session (`requireSession("user")`).
- **Required Env Variables**:
  - `LIVEKIT_URL`: WebRTC server URL (e.g., `wss://medinova-xxxx.livekit.cloud`)
  - `LIVEKIT_API_KEY`: LiveKit project API key
  - `LIVEKIT_API_SECRET`: LiveKit project API secret

### Token Generation Flow
1. Client browser sends request to `/api/livekit/token`.
2. Endpoint creates unique participant identity (`voice_assistant_user_XXXX`) and room (`voice_assistant_room_XXXX`).
3. Mints signed JWT using `AccessToken` from `livekit-server-sdk` with 15-minute TTL:
   ```ts
   const grant: VideoGrant = {
     room: roomName,
     roomJoin: true,
     canPublish: true,
     canPublishData: true,
     canSubscribe: true,
   };
   ```
4. Returns JSON:
   ```json
   {
     "serverUrl": "wss://...",
     "roomName": "voice_assistant_room_1234",
     "participantName": "user",
     "participantToken": "eyJhbGciOiJIUz..."
   }
   ```

---

## 3. Webhook Ingress Endpoint (`/api/livekit/notify`)

- **File**: `src/app/api/livekit/notify/route.ts`
- **Method**: `POST`
- **Authentication**: Bearer token validated against `JWT_SECRET` environment variable.
- **Payload Schema**:
  ```json
  {
    "callerName": "Emily Parker",
    "callerPhone": "+44 113 555 1234",
    "reason": "Patient requested cardiology follow up following chest pain",
    "urgency": "HIGH",
    "callerLanguage": "English",
    "appointmentDate": "2026-09-08",
    "appointmentTime": "10:30",
    "recommendedDepartment": "Cardiology",
    "callbackRequired": "YES",
    "callbackRequiredReason": "Requires senior doctor review",
    "isSpam": "NOT_SPAM"
  }
  ```
- **Behavior**: Validates presence of `reason`, logs structured call event, and returns `{ "received": true }`.

---

## 4. In-Browser Test Lab (`src/components/livekit/`)

Located inside `/user/ai-bot-settings`, the test lab enables clinical administrators to test voice assistant responses in real time.

### Key Components:
- **`bot-test-lab.tsx`**: Orchestrator fetching token from `/api/livekit/token`, managing microphone permissions, and mounting `LiveKitRoom`.
- **`voice-session.tsx`**: Active room session controller managing audio track subscriptions and call controls (mute, disconnect).
- **`session-view.tsx`**: Visualizer displaying agent speaking animation and live audio frequency waveforms.
- **`transcription-collector.tsx`**: Real-time transcript renderer that captures incoming data messages and displays speech-to-text turns live.
- **`post-call-view.tsx`**: Displays call summary, total duration, and transcript export after disconnecting.
