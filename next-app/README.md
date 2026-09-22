# Medinova Health — Clinical Dashboard & Web App

The Next.js 16 web application and clinical management portal for **Medinova Health Network**.

This application serves as the command center for clinic staff and administrators, providing real-time patient triage, appointment calendar synchronization, voice bot orchestration, and an in-browser WebRTC voice test lab.

---

## 🌟 Key Features

### 1. Active Patient Triage Queue (`/user/triage`)
- Real-time list of all incoming and completed patient calls.
- Automated clinical urgency tags: `URGENT`, `HIGH`, `MEDIUM`, `LOW`.
- Spam detection flags (`SPAM` vs `NOT_SPAM`).
- Full transcript viewer with structured clinical summaries and recommended next actions.

### 2. Appointment Booking & Calendar (`/user/appointments`)
- Multi-department scheduling matrix (Cardiology, General Medicine, Endocrinology, Obstetrics, Pediatrics).
- Real-time sync with verbal bookings made by the voice AI agent.
- Doctor assignment and appointment status management (`CONFIRMED`, `PENDING`, `CANCELLED`).

### 3. In-Browser Voice Testing Lab (`/user/voice-lab`)
- Test the voice receptionist directly in Google Chrome or Edge via WebRTC.
- Live bi-directional streaming audio with AssemblyAI Universal 3.5 Pro speech-to-text and Inworld TTS.
- Visual audio frequency visualizer and real-time conversational item display.

### 4. Assistant Orchestration (`/admin/bot-settings`)
- Dynamically customize the AI assistant's system instructions and clinical routing rules.
- Select voice models and clinical personas without redeploying the Python voice worker.
- Changes propagate instantly to active agents via MongoDB `BotSettings`.

### 5. Practice & Telephony Analytics (`/admin/analytics`)
- Track daily patient call volume, average call duration, and triage urgency distributions.
- Telephony and LLM inference cost tracking broken down per call and per department.

### 6. Role-Based Access Control (RBAC)
- Secure session-based authentication using PBKDF2 password hashing and HTTP-only cookies.
- Two distinct portal shells:
  - **Clinical Staff Portal (`/user/*`)**: Daily clinic operations, triage queue, calendar, and voice lab.
  - **Executive Admin Portal (`/admin/*`)**: Bot settings, staff rosters, multi-clinic routing, and cost metrics.

---

## 🛠️ Technology Stack

- **Framework**: [Next.js 16](https://nextjs.org/) (App Router)
- **UI Library**: React 19 + TypeScript 5
- **Database ORM**: [Prisma 6](https://www.prisma.io/)
- **Database**: MongoDB Atlas
- **Realtime WebRTC**: `@livekit/components-react` & `livekit-server-sdk`
- **Styling**: Vanilla CSS Modules + Design System Tokens (`globals.css`)
- **Animations**: Motion 12 + Lucide React icons

---

## 🚀 Getting Started

### 1. Install Dependencies
```bash
cd next-app
npm install
```

### 2. Configure Environment Variables
Create a `.env` file in `next-app/`:
```ini
# MongoDB Atlas Database
DATABASE_URL="mongodb+srv://<username>:<password>@<cluster>.mongodb.net/medinova-assembly-ai"

# LiveKit Cloud Credentials
LIVEKIT_URL="wss://<your-project>.livekit.cloud"
LIVEKIT_API_KEY="<your-livekit-api-key>"
LIVEKIT_API_SECRET="<your-livekit-api-secret>"

# Authentication & Application
JWT_SECRET="<generate-a-secure-random-secret>"
NEXT_PUBLIC_APP_URL="http://localhost:3000"
```

### 3. Generate Prisma Client
```bash
npx prisma generate
```

### 4. Run Development Server
```bash
npm run dev
```
Open [http://localhost:3000](http://localhost:3000) in your browser.

---

## 📁 Key Directories

```
next-app/
├── prisma/
│   └── schema.prisma        # MongoDB Prisma models (CallRecord, Patient, Appointment, etc.)
├── public/                  # Static assets and icons
├── docs/                    # Development notes and testing specifications
├── explanation/             # In-depth architectural explanation guides
└── src/
    ├── app/
    │   ├── (public)/        # Landing page and login routes
    │   ├── (auth)/          # Authenticated application shells
    │   │   ├── user/        # Clinical staff portal
    │   │   └── admin/       # Administrator portal
    │   └── api/
    │       └── livekit/     # WebRTC token minting & agent webhook endpoints
    ├── components/          # Reusable UI primitives and domain components
    └── lib/                 # Auth, Prisma client, and data aggregation utilities
```

---

## 🧪 Testing & Verification
For full testing procedures, refer to [**`docs/testing.md`**](./docs/testing.md).
