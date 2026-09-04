# Medinova LiveKit Voice Agent — System Knowledge Base

This directory contains persistent, comprehensive technical documentation for the `medinova-livekit-agent` Python service. It explains how the voice worker interfaces with LiveKit Cloud, streams audio with the OpenAI Realtime API, classifies patient calls, and syncs data with MongoDB and the Next.js clinical dashboard.

---

## Document Index

| File | Description |
| :--- | :--- |
| [**`01_AGENT_ARCHITECTURE.md`**](file:///C:/Users/Hp/Desktop/Stuff/Clout/medinova-assemblyai/medinova-livekit-agent/explanation/01_AGENT_ARCHITECTURE.md) | LiveKit Agents SDK lifecycle, WebRTC worker session model, process prewarming, and SIP telephony support. |
| [**`02_SPEECH_AND_AI_PIPELINE.md`**](file:///C:/Users/Hp/Desktop/Stuff/Clout/medinova-assemblyai/medinova-livekit-agent/explanation/02_SPEECH_AND_AI_PIPELINE.md) | OpenAI Realtime speech pipeline (`gpt-realtime-1.5`), Silero VAD, BVC noise cancellation, and bilingual audio handling. |
| [**`03_CONVERSATIONAL_FLOW_AND_PROMPTS.md`**](file:///C:/Users/Hp/Desktop/Stuff/Clout/medinova-assemblyai/medinova-livekit-agent/explanation/03_CONVERSATIONAL_FLOW_AND_PROMPTS.md) | Healthcare intake protocol, department routing, emergency triage (999/112), inactivity watchdog, and call termination rules. |
| [**`04_POST_CALL_CLASSIFICATION.md`**](file:///C:/Users/Hp/Desktop/Stuff/Clout/medinova-assemblyai/medinova-livekit-agent/explanation/04_POST_CALL_CLASSIFICATION.md) | Post-call analysis using GPT-4.1-mini, Pydantic schema (`CallClassification`), urgency ratings, spam detection, and extracted next steps. |
| [**`05_INTEGRATION_AND_PERSISTENCE.md`**](file:///C:/Users/Hp/Desktop/Stuff/Clout/medinova-assemblyai/medinova-livekit-agent/explanation/05_INTEGRATION_AND_PERSISTENCE.md) | Direct MongoDB persistence (`CallRecord`), dynamic `BotSettings` synchronization, and webhook notification to `next-app`. |
| [**`06_DEPLOYMENT_AND_CLI.md`**](file:///C:/Users/Hp/Desktop/Stuff/Clout/medinova-assemblyai/medinova-livekit-agent/explanation/06_DEPLOYMENT_AND_CLI.md) | LiveKit CLI commands (`lk agent deploy`), Docker container setup via `uv`, and environment variable configuration. |

---

## Quick Reference

### 1. Technology Stack
- **Framework**: LiveKit Agents Python SDK `>=1.5.1` (`livekit-agents[openai,silero]`)
- **Package Manager**: UV (`uv`)
- **Voice Realtime Model**: OpenAI Realtime API (`gpt-realtime-1.5`, voice: `marin`, temperature: `0.8`)
- **VAD**: Silero VAD
- **Noise Suppression**: LiveKit Noise Cancellation (`BVC` for web, `BVCTelephony` for SIP)
- **Classification Model**: OpenAI GPT-4.1-mini via LiveKit Inference
- **Database**: MongoDB Atlas (`pymongo`)
- **Python Version**: `>=3.12`

### 2. Common Commands
```bash
# Install dependencies with exact lockfile
uv sync --locked

# Run the agent in local development mode (listens to LiveKit room dispatch)
uv run python agent.py dev

# Start worker in production mode
uv run python agent.py start

# Deploy updates to LiveKit Cloud
lk agent deploy

# Tail runtime logs on LiveKit Cloud
lk agent logs --log-type=runtime
```

### 3. Required Environment Variables (`.env.local` / `.env`)
```env
LIVEKIT_URL="wss://medinova-6ynzszog.livekit.cloud"
LIVEKIT_API_KEY="AP..."
LIVEKIT_API_SECRET="..."
OPENAI_API_KEY="sk-..."
MONGODB_URI="mongodb+srv://..."
ORGANIZATION_ID="<mongo_object_id>"
JWT_SECRET="<shared_dashboard_auth_secret>"
DASHBOARD_URL="https://medinova-health.vercel.app"
```
