# Medinova Health — Project Summary

**Medinova Health Network** is an enterprise AI healthcare platform designed to automate patient phone intake, clinical triage, department routing, and appointment scheduling.
Live Deployment: [medinova-assemblyai.vercel.app](https://medinova-assemblyai.vercel.app/)

---

## 1. System Overview

Medinova replaces legacy front-desk phone bottlenecks with an ultra-low latency, conversational AI receptionist. The platform pairs a real-time Python voice agent worker with a Next.js clinical dashboard and features persistent caller memory across visits.

```
┌─────────────────────────────────────────────────────────────┐
│                       Caller / Patient                      │
│            (Telephone SIP Trunk or WebRTC Browser)          │
└──────────────────────────────┬──────────────────────────────┘
                               │ Bi-directional Audio
                               ▼
┌─────────────────────────────────────────────────────────────┐
│                        LiveKit Cloud                        │
│                 (WebRTC SFU / Media Server)                 │
└──────────────────────────────┬──────────────────────────────┘
                               │
             ┌─────────────────┴──────────────────┐
             │ Room Events                        │ WebRTC Tokens
             ▼                                    ▼
┌──────────────────────────────┐        ┌─────────────────────┐
│    medinova-livekit-agent    │        │      next-app       │
│  (Python LiveKit Worker)     │        │ (Next.js Dashboard) │
│                              │        │                     │
│  • AssemblyAI STT (U3.5 Pro) │        │ • Clinical Portal   │
│  • Returning Caller Memory   │        │ • Admin Controls    │
│  • OpenAI LLM (gpt-4o-mini)  │        │ • In-Browser Lab    │
│  • Inworld TTS (2.0 Flash)   │        │ • Prisma ORM        │
│  • Silero VAD + BVC Audio    │        │                     │
│  • GPT-4.1-mini Triage       │        │                     │
└──────────────┬───────────────┘        └──────────┬──────────┘
               │                                   │
               │ Direct Writes & Webhooks          │ Queries
               ▼                                   ▼
┌─────────────────────────────────────────────────────────────┐
│                    MongoDB Atlas Database                   │
│      (Call Records, Appointments, Staff, Bot Settings)      │
└─────────────────────────────────────────────────────────────┘
```

---

## 2. Monorepo Structure

| Directory | Role | Description |
| :--- | :--- | :--- |
| [**`next-app/`**](file:///c:/Users/Hp/Desktop/Stuff/Clout/medinova-assemblyai/next-app) | Web Application & API | Next.js 16 App Router application. Houses the patient triage queue, appointment booking calendar, staff rosters, usage metrics, and in-browser voice test lab. |
| [**`medinova-livekit-agent/`**](file:///c:/Users/Hp/Desktop/Stuff/Clout/medinova-assemblyai/medinova-livekit-agent) | Voice AI Agent Service | Python LiveKit Agents SDK worker. Handles bi-directional streaming audio, conversational clinical intake, silence watchdog, caller memory, and post-call classification. |
| [**`brag-output/`**](file:///c:/Users/Hp/Desktop/Stuff/Clout/medinova-assemblyai/brag-output) | Launch Video & Media | Hyperframes 1080p product launch video (`brag.mp4`), poster thumbnail (`brag.jpg`), storyboards, and social launch copy. |
| [**`.agents/`**](file:///c:/Users/Hp/Desktop/Stuff/Clout/medinova-assemblyai/.agents) | Local Agent Customizations | Project-level skills (`assemblyai`, `twilio`, `twilio-skills`, `mongodb-*`, `brag`, `caveman`, `livekit-agents`, `livekit-simulations`) and MCP configurations. |

---

## 3. Core Features & Capabilities

### 1. Conversational Patient Intake
- Greet callers warmly, collect their name, and assess symptoms.
- Route patients to five clinical departments: **Cardiology**, **General Medicine**, **Endocrinology**, **Obstetrics**, and **Pediatrics**.
- Check clinic hours and propose appointment slots directly during the call.

### 2. Caller Memory & Returning Patient Continuity
- Recognizes returning callers by phone number on incoming SIP or WebRTC sessions.
- Injects prior visit context (past call dates, chief complaints, booked appointments, clinical urgency) into the active prompt session.
- Greets recognized patients by name ("Welcome back, Jacob!") and follows up on existing symptoms without asking redundant intake questions.

### 3. Clinical Safeguards & Emergency Escalation
- **Strict Clinical Boundary**: The assistant refuses to provide medical advice, diagnoses, or prescriptions.
- **Emergency Triage**: If callers describe chest pain, severe bleeding, or stroke signs, the assistant immediately instructs them to dial **999** (UK) or **112** (Germany).
- **Multilingual Support**: Default British English with automatic fluent fallback to German or other languages.

### 4. Post-Call AI Triage
- Asynchronously processes transcripts using **OpenAI GPT-4.1-mini**.
- Extracts 12 structured fields: Spam detection (`SPAM`, `NOT_SPAM`), urgency rating (`URGENT`, `HIGH`, `MEDIUM`, `LOW`), callback necessity, and next steps.
- Directly updates MongoDB `CallRecord` collection, automatically creates or updates `Patient` and `Appointment` documents, and dispatches webhooks to the dashboard.

### 5. Healthcare Operations Dashboard
- **User Portal (`/user/*`)**: Active triage queue, call search, transcript inspection, booking calendar, practice analytics, and voice testing lab.
- **Admin Portal (`/admin/*`)**: Multi-clinic routing, bot orchestration, staff duty shifts, and cloud infrastructure cost tracking.
- **Role-Based Access**: PBKDF2 password hashing with secure HTTP-only session cookies.

---

## 4. Technical Architecture

### Web Application (`next-app`)
- **Framework**: Next.js 16.2.4 (App Router) + React 19.2.4 + TypeScript 5
- **ORM**: Prisma 6.19.1
- **Database**: MongoDB Atlas
- **Styling**: Vanilla CSS, CSS Modules, Motion 12, Lucide React
- **Realtime**: `@livekit/components-react`, `livekit-server-sdk`

### Voice Worker (`medinova-livekit-agent`)
- **Framework**: LiveKit Agents Python SDK `>=1.5.1` (`livekit-agents[openai,silero,assemblyai]`)
- **Speech-to-Text**: AssemblyAI Universal 3.5 Pro (`universal-3-5-pro`) with punctuation turn detection
- **Reasoning (LLM)**: OpenAI `gpt-4o-mini`
- **Text-to-Speech**: Inworld Realtime TTS 2.0 Flash (`inworld/inworld-tts-2-flash`, voice: `Ashley`)
- **Speech Tools**: Silero VAD (`threshold=0.3`), BVC noise cancellation, LiveKit `EndCallTool`
- **Database**: MongoDB Atlas (`medinova-assembly-ai`)
- **Package Manager**: UV (`uv`)

---

## 5. Detailed Documentation Suites

For deep technical dives, reference the modular explanation guides created in each subproject:

- **Next.js Web App Documentation**: [**`next-app/explanation/README.md`**](file:///c:/Users/Hp/Desktop/Stuff/Clout/medinova-assemblyai/next-app/explanation/README.md)
  - `01_ARCHITECTURE.md`: Next.js 16 structure and design system.
  - `02_DATABASE_AND_MODELS.md`: Prisma models and schema structure.
  - `03_AUTHENTICATION_AND_ROLES.md`: Session cookies and role security.
  - `04_ROUTES_AND_PAGES.md`: Public, user, and admin route map.
  - `05_LIVEKIT_VOICE_INTEGRATION.md`: WebRTC token minting and test lab.
  - `06_ACTIONS_AND_DATA_FLOW.md`: Server Actions and data fetchers.

- **LiveKit Voice Agent Documentation**: [**`medinova-livekit-agent/explanation/README.md`**](file:///c:/Users/Hp/Desktop/Stuff/Clout/medinova-assemblyai/medinova-livekit-agent/explanation/README.md)
  - `01_AGENT_ARCHITECTURE.md`: Worker lifecycle and session model.
  - `02_SPEECH_AND_AI_PIPELINE.md`: Realtime speech pipeline and noise cancellation.
  - `03_CONVERSATIONAL_FLOW_AND_PROMPTS.md`: Intake rules and emergency protocols.
  - `04_POST_CALL_CLASSIFICATION.md`: Structured extraction and urgency scoring.
  - `05_INTEGRATION_AND_PERSISTENCE.md`: MongoDB schema sync and webhooks.
  - `06_DEPLOYMENT_AND_CLI.md`: LiveKit Cloud deployment and Docker instructions.

---

## 6. Quick Start

### 1. Run the Next.js Dashboard
```bash
cd next-app
npm install
npm run dev
# Dashboard opens on http://localhost:3000
```

### 2. Run the LiveKit Voice Agent
```bash
cd medinova-livekit-agent
uv sync --locked
uv run python agent.py dev
```

### 3. Authentication & Access
User and admin accounts are provisioned through administrative onboarding. Account credentials and database connections are configured using secure environment variables.
