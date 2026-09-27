# Medinova LiveKit Voice Agent - System Knowledge Base

This directory contains persistent, comprehensive technical documentation for the `medinova-livekit-agent` Python service. It explains how the voice worker interfaces with LiveKit Cloud, streams audio with AssemblyAI STT, OpenAI LLM, and Inworld TTS, classifies patient calls, and syncs data with MongoDB and the Next.js clinical dashboard.

---

## Document Index

| File | Description |
| :--- | :--- |
| [**`01_AGENT_ARCHITECTURE.md`**](./01_AGENT_ARCHITECTURE.md) | LiveKit Agents SDK lifecycle, WebRTC worker session model, process prewarming, and SIP telephony support. |
| [**`02_SPEECH_AND_AI_PIPELINE.md`**](./02_SPEECH_AND_AI_PIPELINE.md) | Decoupled voice pipeline (AssemblyAI STT, OpenAI LLM, Inworld TTS), Silero VAD, BVC noise cancellation, AssemblyAI multilingual STT, and English voice synthesis. |
| [**`03_CONVERSATIONAL_FLOW_AND_PROMPTS.md`**](./03_CONVERSATIONAL_FLOW_AND_PROMPTS.md) | Healthcare intake protocol, department routing, emergency triage (911), inactivity watchdog, and call termination rules. |
| [**`04_POST_CALL_CLASSIFICATION.md`**](./04_POST_CALL_CLASSIFICATION.md) | Post-call analysis using GPT-4.1-mini, Pydantic schema (`CallClassification`), urgency ratings, spam detection, and extracted next steps. |
| [**`05_INTEGRATION_AND_PERSISTENCE.md`**](./05_INTEGRATION_AND_PERSISTENCE.md) | Direct MongoDB persistence (`CallRecord`), dynamic `BotSettings` synchronization, and webhook notification to `next-app`. |
| [**`06_DEPLOYMENT_AND_CLI.md`**](./06_DEPLOYMENT_AND_CLI.md) | LiveKit CLI commands (`lk agent deploy`), Docker container setup via `uv`, and environment variable configuration. |

---

## Quick Reference

### 1. Technology Stack
- **Framework**: LiveKit Agents Python SDK `>=1.5.1` (`livekit-agents[openai,silero,assemblyai]`)
- **Package Manager**: UV (`uv`)
- **Speech-to-Text**: AssemblyAI Universal 3.5 Pro (`universal-3-5-pro`)
- **Reasoning**: OpenAI Chat Completions (`gpt-4o-mini`)
- **Text-to-Speech**: Inworld Realtime TTS 2.0 Flash (`inworld/inworld-tts-2-flash`, voice: `Ashley`)
- **VAD**: Silero VAD (`activation_threshold=0.3`)
- **Noise Suppression**: LiveKit Noise Cancellation (`BVC` for web, `BVCTelephony` for SIP)
- **Classification Model**: OpenAI GPT-4.1-mini via LiveKit Inference
- **Database**: MongoDB Atlas (`medinova-assembly-ai`)
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
LIVEKIT_URL="wss://<subdomain>.livekit.cloud"
LIVEKIT_API_KEY="AP..."
LIVEKIT_API_SECRET="..."
OPENAI_API_KEY="sk-..."
ASSEMBLYAI_API_KEY="..."
MONGODB_URI="mongodb+srv://..."
ORGANIZATION_ID="<mongo_object_id>"
JWT_SECRET="<shared_dashboard_auth_secret>"
DASHBOARD_URL="https://<dashboard-domain>.vercel.app"
```
