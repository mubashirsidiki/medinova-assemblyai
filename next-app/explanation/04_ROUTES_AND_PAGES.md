# 04. Routes & Page Architecture

## 1. Route Map Overview

```
src/app/
├── (public)/                      # Unauthenticated Public Flow
│   ├── page.tsx                  # Public marketing & feature landing page (/)
│   ├── login/page.tsx            # Login portal (/login)
│   ├── contact/page.tsx          # Contact inquiries (/contact)
│   ├── privacy/page.tsx          # Privacy policy (/privacy)
│   └── terms/page.tsx            # Terms of service (/terms)
│
├── (auth)/                       # Authenticated Shells
│   ├── user/                     # Practice Staff App (/user/*)
│   │   ├── dashboard/page.tsx    # Live KPI summary & patient triage queue
│   │   ├── calls/page.tsx        # Call logs, filtering, transcript inspection
│   │   ├── booking/page.tsx      # Clinic appointment calendar
│   │   ├── analytics/page.tsx    # Call volume, intents, and latency charts
│   │   ├── costs/page.tsx        # Voice minutes and budget consumption
│   │   └── ai-bot-settings/      # Voice assistant prompt & WebRTC test lab
│   │
│   └── admin/                    # System Administration (/admin/*)
│       ├── dashboard/page.tsx    # Practice network performance overview
│       ├── bots/page.tsx         # Voice bot deployment & provisioning
│       ├── routing/page.tsx      # SIP & LiveKit call distribution rules
│       ├── staff/page.tsx        # Staff members, roles, and shift assignments
│       ├── team/page.tsx         # Team roster view
│       └── cost/page.tsx         # Infrastructure usage & provider breakdown
│
└── api/                          # Backend API Endpoints
    └── livekit/
        ├── token/route.ts        # POST: Generates WebRTC tokens for voice test lab
        └── notify/route.ts       # POST: Webhook receiver for completed voice calls
```

---

## 2. Public Routes `src/app/(public)`

### `/` (Landing Page)
- File: `src/app/(public)/page.tsx`
- Styling: `src/app/(public)/landing.module.css`
- Components:
  - Hero with animated sound wave simulation.
  - Interactive Voice AI demo simulation.
  - Clinical safety & triage benchmarks.
  - Testimonials, architecture diagrams, and pricing tiers.
  - Header with direct deep-links to `/login`.

### `/login` (Sign In Portal)
- File: `src/app/(public)/login/page.tsx`
- Component: `src/components/login-form.tsx`
- Features:
  - Supports manual email/password input.
  - One-click demo credentials switcher between `admin` (`marc_margulan@admin.medinova.de`) and `user` (`marc_margulan@user.medinova.de`).
  - Calls `loginAction` server action.

---

## 3. User Portal `src/app/(auth)/user`

Protected by `requireSession("user")`. Rendered within `src/components/app-shell.tsx`.

### `/user/dashboard`
- Summary KPIs: Active triage queue count, urgent alerts, calls today, avg latency.
- Hero Stats: Monthly-to-date spend, average cost per patient call.
- Recent Calls: List of recent calls with caller name, phone, duration, triage status badge.
- Active Triage Queue: Warm transferred calls and callbacks requiring doctor review.
- Mini Calendar: Today's scheduled patient visits.

### `/user/calls`
- Paginated table of all historical call records.
- Filtering: Search by caller name/phone, filter by urgency (`URGENT`, `HIGH`, `MEDIUM`, `LOW`), spam state, or followup status.
- Modal: Click any call row to open `src/components/transcript-modal.tsx`:
  - Full conversational transcript.
  - Audio latency and duration metrics.
  - Extracted clinical recommendations and follow-up reason.

### `/user/booking`
- File: `src/app/(auth)/user/booking/page.tsx`
- Interactive calendar (`src/components/booking-calendar-card.tsx`).
- Allows clinical staff to schedule patient visits with specific doctors and departments.
- Calls `createAppointmentAction` server action.

### `/user/analytics`
- Call volume distribution across days and hours.
- Breakdown of caller intents (Prescriptions, Cardiology, Urgent Triage, Billing).
- Latency percentiles and average response time tracking.
- Caller language breakdown (English, Polish, Urdu, Punjabi).

### `/user/costs`
- Daily cost history and cumulative monthly spending.
- Unit cost breakdown per provider (LiveKit WebRTC, Deepgram STT, AssemblyAI, Cartesia TTS, LLM tokens).
- Efficiency metrics comparing AI receptionist cost against human staff hours.

### `/user/ai-bot-settings`
- **Voice Assistant Playground** (`src/components/bot-test-lab.tsx`):
  - In-browser LiveKit WebRTC testing session with microphone access.
  - Displays real-time connection status, audio visualizer, and live transcription stream.
- **System Instructions Editor** (`src/components/behavioral-rules-editor.tsx`):
  - Edit system prompt rules and instructions.
- **Voice Persona Selector** (`src/components/voice-model-selector.tsx`):
  - Choose synthetic voice model, accent, and preview sample audio.
- **Escalation Rules**:
  - Configure on-call team member for urgent call transfers.
  - Edit email and SMS notification dispatch templates.
- **Inbound Phone Numbers**:
  - Assign numbers to clinic workflows or departments.

---

## 4. Admin Portal `src/app/(auth)/admin`

Protected by `requireSession("admin")`.

### `/admin/dashboard`
- Multi-clinic operational overview.
- System health, concurrent call capacity, and active bot instances.

### `/admin/bots`
- Provisioning and configuration of assistant instances across clinics.

### `/admin/routing`
- Inbound call distribution rules.
- Fallback routing when clinic queues are full or after operating hours.

### `/admin/staff` & `/admin/team`
- Manage clinic staff profiles, roles, and shifts.
- View on-call coverage for emergency call escalations.

### `/admin/cost`
- Practice-wide infrastructure billing across all clinic branches.
- Provider contract tracking and usage thresholds.
