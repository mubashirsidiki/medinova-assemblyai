# Medinova Health — Clinical Voice AI & Triage Platform

> **Never put a patient on hold again.**  
> Medinova Health is an enterprise clinical voice AI platform that automates patient phone intake, recognizes returning callers with full medical context, performs real-time clinical triage, and schedules appointments directly into the clinic calendar.

[![Live Demo](https://img.shields.io/badge/Live%20Demo-medinova--assemblyai.vercel.app-blue)](https://medinova-assemblyai.vercel.app/)
[![AssemblyAI](https://img.shields.io/badge/STT-AssemblyAI%20Universal%203.5%20Pro-7c3aed)](https://www.assemblyai.com/)
[![LiveKit](https://img.shields.io/badge/Realtime-LiveKit%20Agents%20SDK-00e599)](https://livekit.io/)
[![Next.js](https://img.shields.io/badge/Dashboard-Next.js%2016-000000)](https://nextjs.org/)
[![MongoDB](https://img.shields.io/badge/Database-MongoDB%20Atlas-00ed64)](https://www.mongodb.com/)

---

## 🎬 Product Launch Video

Check out the product launch video generated via Hyperframes:
- **Video**: [brag-output/brag.mp4](file:///c:/Users/Hp/Desktop/Stuff/Clout/medinova-assemblyai/brag-output/brag.mp4) (1080p, 20s, H.264 + AAC, studio voiceover + sound design)
- **Poster Thumbnail**: [brag-output/brag.jpg](file:///c:/Users/Hp/Desktop/Stuff/Clout/medinova-assemblyai/brag-output/brag.jpg)
- **Social Launch Copy**: [brag-output/share-copy.txt](file:///c:/Users/Hp/Desktop/Stuff/Clout/medinova-assemblyai/brag-output/share-copy.txt)

---

## 🏥 System Architecture

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
┌──────────────────────────────┐       ┌───────────────────────┐
│    medinova-livekit-agent    │       │       next-app        │
│    (Python LiveKit Worker)   │       │  (Next.js Dashboard)  │
│                              │       │                       │
│  • AssemblyAI Universal 3.5  │       │ • Triage Queue        │
│  • Returning Caller Memory   │       │ • Booking Calendar    │
│  • OpenAI gpt-4o-mini LLM    │       │ • In-Browser Voice Lab│
│  • Inworld TTS 2.0 Flash     │       │ • Admin Orchestration │
│  • Silero VAD + BVC Audio    │       │ • Prisma ORM          │
│  • GPT-4.1-mini Triage       │       │                       │
└──────────────┬───────────────┘       └──────────┬────────────┘
               │                                  │
               │ Direct Writes & Webhooks         │ Queries
               ▼                                  ▼
┌─────────────────────────────────────────────────────────────┐
│                    MongoDB Atlas Database                   │
│      (Call Records, Appointments, Staff, Bot Settings)      │
└─────────────────────────────────────────────────────────────┘
```

---

## ⚡ Key Capabilities

### 1. Caller Memory & Historical Continuity
- Automatically extracts the caller's phone number on incoming SIP or WebRTC sessions.
- Queries MongoDB Atlas to identify returning patients and injects past call summaries, previously booked appointments, and chief complaints into live system prompts.
- Greets returning callers naturally by name without redundant questions.

### 2. Speech-to-Text via AssemblyAI Universal 3.5 Pro
- Uses AssemblyAI's cutting-edge `universal-3-5-pro` model with punctuation-based turn detection.
- Sub-second turnaround for conversational real-time voice AI.

### 3. Automated Clinical Department Routing
- Dynamically routes callers to five specialized departments:
  - **Cardiology**: Chest concerns, hypertension, palpitations.
  - **General Medicine**: Fever, general ailments, routine follow-ups.
  - **Endocrinology**: Diabetes, thyroid disorders, hormone therapies.
  - **Obstetrics & Gynecology**: Prenatal intake, women's health.
  - **Pediatrics**: Child healthcare, immunizations.

### 4. Appointment Scheduling directly from Voice
- Proposes available doctor calendar slots during the conversation.
- Upon verbal confirmation, automatically creates the `Appointment` and `Patient` records in MongoDB.

### 5. Strict Clinical Boundaries & Emergency Escalation
- Refuses to give diagnoses or prescribe medication.
- Immediately identifies emergency keywords and directs the patient to call emergency services (**999** in the UK, **112** in Germany/EU).

### 6. Post-Call AI Triage
- Automatically processes call transcripts via GPT-4.1-mini into 12 structured fields: spam detection, clinical urgency (`URGENT`, `HIGH`, `MEDIUM`, `LOW`), callback necessity, and recommended doctor actions.

---

## 📁 Repository Structure

| Path | Description |
|---|---|
| [**`next-app/`**](file:///c:/Users/Hp/Desktop/Stuff/Clout/medinova-assemblyai/next-app) | Next.js 16 App Router clinical dashboard, staff portal, and in-browser voice testing lab. |
| [**`medinova-livekit-agent/`**](file:///c:/Users/Hp/Desktop/Stuff/Clout/medinova-assemblyai/medinova-livekit-agent) | Python LiveKit Agents voice worker with AssemblyAI STT, Inworld TTS, and caller memory. |
| [**`brag-output/`**](file:///c:/Users/Hp/Desktop/Stuff/Clout/medinova-assemblyai/brag-output) | Product launch video composition, 1080p rendered video, poster frame, and social media copy. |
| [**`.agents/`**](file:///c:/Users/Hp/Desktop/Stuff/Clout/medinova-assemblyai/.agents) | Project skills (`assemblyai`, `twilio`, `mongodb-*`, `livekit-agents`, `brag`). |
| [**`PROJECT_SUMMARY.md`**](file:///c:/Users/Hp/Desktop/Stuff/Clout/medinova-assemblyai/PROJECT_SUMMARY.md) | Technical architecture overview and system specifications. |

---

## 🚀 Quickstart

### 1. Prerequisites
- Node.js `v20+` & npm
- Python `3.12+` & [uv](https://docs.astral.sh/uv/)
- LiveKit Cloud account
- AssemblyAI API Key
- OpenAI API Key
- MongoDB Atlas cluster

### 2. Next.js Dashboard Setup
```bash
cd next-app
npm install
npx prisma generate
npm run dev
```
Open [http://localhost:3000](http://localhost:3000) to view the clinical dashboard.

### 3. Voice Agent Worker Setup
```bash
cd medinova-livekit-agent
uv sync
uv run python agent.py dev
```
To connect the voice agent to your LiveKit Cloud room, use the LiveKit CLI or launch a test call directly from the Next.js **Voice Lab** (`/user/voice-lab`).

---

## 🔐 Environment Variables

### `next-app/.env`
```ini
DATABASE_URL="mongodb+srv://<user>:<password>@<cluster>.mongodb.net/medinova-assembly-ai"
LIVEKIT_URL="wss://<your-project>.livekit.cloud"
LIVEKIT_API_KEY="<your-api-key>"
LIVEKIT_API_SECRET="<your-api-secret>"
JWT_SECRET="<your-secret-key>"
NEXT_PUBLIC_APP_URL="http://localhost:3000"
```

### `medinova-livekit-agent/.env.local`
```ini
LIVEKIT_URL="wss://<your-project>.livekit.cloud"
LIVEKIT_API_KEY="<your-api-key>"
LIVEKIT_API_SECRET="<your-api-secret>"
ASSEMBLYAI_API_KEY="<your-assemblyai-key>"
OPENAI_API_KEY="<your-openai-key>"
MONGODB_URI="mongodb+srv://<user>:<password>@<cluster>.mongodb.net/medinova-assembly-ai"
ORGANIZATION_ID="<mongo-object-id>"
DASHBOARD_URL="http://localhost:3000"
```

---

## 📄 License
Internal project for Medinova Health Network.
