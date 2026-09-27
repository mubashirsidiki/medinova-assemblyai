# 06. Deployment, CLI & Production Operations

## 1. Local Development Mode
Run the agent locally against a LiveKit Cloud sandbox or local LiveKit server:

```bash
cd medinova-livekit-agent

# Ensure dependencies match uv.lock
uv sync --locked

# Start the agent in development mode
uv run python agent.py dev
```

In `dev` mode:
- LiveKit agent registers with the configured LiveKit Cloud project.
- Listens for room creation events.
- Automatically joins when a user connects via the `next-app` test lab.

---

## 2. LiveKit Cloud Deployment (`livekit.toml`)
The project is configured for serverless hosting on LiveKit Cloud:

```toml
[project]
  subdomain = "<your-project-subdomain>"

[agent]
  id = "<your-agent-id>"
```

### Deployment Commands:
```bash
# Authenticate LiveKit CLI
lk cloud auth

# Deploy code updates to cloud
lk agent deploy

# Stream real-time cloud logs
lk agent logs --log-type=runtime

# Stream build logs
lk agent logs --log-type=build

# Update production cloud secrets
lk agent update-secrets --secrets "OPENAI_API_KEY=...,MONGODB_URI=..." --overwrite
```

---

## 3. Docker Containerization (`Dockerfile`)
For self-hosted Kubernetes or VPS deployments:

- **Base Image**: `ghcr.io/astral-sh/uv:python3.13-bookworm-slim`
- **Security**: Runs under non-privileged user `appuser` (`UID 10001`).
- **Build Strategy**:
  1. Copies `pyproject.toml` and `uv.lock`.
  2. Runs `uv sync --locked` to populate `.venv`.
  3. Copies application source code.
- **Entrypoint**: Runs `uv run python agent.py start`.

### Build & Run Locally:
```bash
docker build -t medinova-voice-agent .
docker run --env-file .env.local medinova-voice-agent
```
