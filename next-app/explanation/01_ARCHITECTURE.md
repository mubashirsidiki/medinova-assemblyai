# 01. Application Architecture

## 1. Overview
Medinova is a production-grade healthcare voice AI platform. It pairs with an external LiveKit Python voice agent worker (`medinova-livekit-agent`) to provide automated patient intake, triage, call summarization, doctor scheduling, and emergency escalations.

The `next-app` serves as the frontend dashboard, management portal, and API server for:
1. Patient call triage and live call logging.
2. Clinical staff appointment scheduling.
3. Live voice testing lab in the browser using WebRTC.
4. AI assistant prompt instructions, voice persona, and escalation management.
5. Practice cost and usage analytics.

---

## 2. Directory Structure

```
next-app/
├── prisma/
│   └── schema.prisma        # MongoDB datasource and Prisma data models
├── public/                  # Static assets and icons
├── docs/                    # Development notes and testing specifications
├── explanation/             # Persistent architecture documentation for LLMs & engineers
└── src/
    ├── proxy.ts             # Custom route protection proxy / Next.js middleware
    ├── app/
    │   ├── layout.tsx       # Root HTML layout, Geist font configuration, Vercel analytics
    │   ├── globals.css      # Design system variables, color tokens, and utility classes
    │   ├── actions.ts       # Next.js Server Actions (Auth, Bot updates, Appointments)
    │   ├── (public)/        # Unauthenticated routes (Landing, Login, Legal, Contact)
    │   ├── (auth)/          # Authenticated app shells
    │   │   ├── user/        # Clinical staff / practice user dashboard and management
    │   │   └── admin/       # Executive / clinic admin controls, routing, and bot orchestration
    │   └── api/
    │       └── livekit/
    │           ├── token/   # Issues WebRTC access tokens for browser voice testing
    │           └── notify/  # Ingestion webhook for LiveKit Python agent call records
    ├── components/
    │   ├── app-shell.tsx    # Responsive side navigation, header bar, and user account status
    │   ├── bot-test-lab.tsx # Browser-based voice session tester
    │   ├── livekit/         # LiveKit audio visualizers, session providers, and call controls
    │   ├── ui.tsx           # Reusable badge, card, and button primitives
    │   └── ...              # Domain-specific UI cards (Booking calendar, Voice picker, Rules)
    └── lib/
        ├── auth.ts          # Session retrieval, PBKDF2 password hashing, and cookie helpers
        ├── session.ts       # Role types, cookie serialization, and route normalization
        ├── prisma.ts        # Global singleton PrismaClient instance
        ├── data.ts          # Server-side data fetchers and analytical aggregation logic
        ├── validators.ts    # Zod validation schemas for forms and server actions
        ├── format.ts        # Currency, date, and numeric formatters
        └── motion-config.ts # Framer motion animation presets
```

---

## 3. Technology Choices and Rationale

1. **Next.js 16 (App Router)**:
   - Server Components handle database aggregation directly using Prisma without exposing unnecessary API endpoints.
   - Server Actions handle form mutations with type safety and cache revalidation (`revalidatePath`).
2. **Prisma ORM with MongoDB**:
   - MongoDB documents accommodate rich JSON payloads (call transcripts, AI-extracted next steps).
   - Prisma provides strict TypeScript definitions across database calls.
3. **LiveKit Realtime Stack**:
   - `livekit-server-sdk` securely signs participant JWTs on the server.
   - `@livekit/components-react` provides reactive audio track subscription, microphone controls, and voice visualizers directly in the browser.
4. **Vanilla CSS & CSS Modules**:
   - High performance without Tailwind dependency bloat.
   - Scoped styling in `landing.module.css`, `voice-session.css`, and CSS variables in `globals.css`.
5. **Motion (React Motion)**:
   - Smooth fluid transitions between tabs, modal drawers, and audio connection states.
