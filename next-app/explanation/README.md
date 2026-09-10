# Medinova Next.js Web App — System Knowledge Base

This directory provides a persistent, complete technical blueprint of the `next-app` codebase. When starting a new session or switching LLMs, reference these documents to immediately understand architecture, data models, routes, auth rules, and voice integration without scanning the entire code tree.

---

## Document Index

| File | Description |
| :--- | :--- |
| [**`01_ARCHITECTURE.md`**](file:///c:/Users/Hp/Desktop/Stuff/Clout/medinova-assemblyai/next-app/explanation/01_ARCHITECTURE.md) | High-level system design, Next.js 16 App Router setup, directory map, styling, and motion config. |
| [**`02_DATABASE_AND_MODELS.md`**](file:///c:/Users/Hp/Desktop/Stuff/Clout/medinova-assemblyai/next-app/explanation/02_DATABASE_AND_MODELS.md) | MongoDB database layer, Prisma schemas, relationships, and indexing. |
| [**`03_AUTHENTICATION_AND_ROLES.md`**](file:///c:/Users/Hp/Desktop/Stuff/Clout/medinova-assemblyai/next-app/explanation/03_AUTHENTICATION_AND_ROLES.md) | Session cookies (`voicecare_session`), PBKDF2 password hashing, RBAC (`admin` vs `user`), and route protection proxy. |
| [**`04_ROUTES_AND_PAGES.md`**](file:///c:/Users/Hp/Desktop/Stuff/Clout/medinova-assemblyai/next-app/explanation/04_ROUTES_AND_PAGES.md) | Full route map: Public marketing/auth pages, User clinical portal, Admin operations portal, and API endpoints. |
| [**`05_LIVEKIT_VOICE_INTEGRATION.md`**](file:///c:/Users/Hp/Desktop/Stuff/Clout/medinova-assemblyai/next-app/explanation/05_LIVEKIT_VOICE_INTEGRATION.md) | WebRTC voice connection flow, LiveKit room token minting, agent webhook ingress, and browser test lab. |
| [**`06_ACTIONS_AND_DATA_FLOW.md`**](file:///c:/Users/Hp/Desktop/Stuff/Clout/medinova-assemblyai/next-app/explanation/06_ACTIONS_AND_DATA_FLOW.md) | Server Actions, Zod validation schemas, data access layer (`src/lib/data.ts`), and cache revalidation. |

---

## Quick Reference & Cheatsheet

### 1. Technology Stack
- **Framework**: Next.js 16.2.4 (App Router)
- **Runtime / UI**: React 19.2.4, TypeScript 5, Motion 12, Lucide React
- **ORM / Database**: Prisma 6.19.1 + MongoDB Atlas
- **Voice Protocol**: LiveKit Server SDK (`livekit-server-sdk`), `@livekit/components-react`, `@livekit/protocol`
- **Validation**: Zod 4.4.1

### 2. Common Commands
```bash
# Start development server on port 3000
npm run dev

# Regenerate Prisma Client and build production bundle
npm run build

# Push Prisma schema changes to MongoDB
npm run db:push

# Launch Prisma Studio web GUI
npm run db:studio
```

### 3. User Accounts
Accounts are configured directly in MongoDB or provisioned through administrative onboarding.

### 4. Required Environment Variables
```env
MONGODB_URI="mongodb+srv://..."
LIVEKIT_URL="wss://..."
LIVEKIT_API_KEY="AP..."
LIVEKIT_API_SECRET="..."
JWT_SECRET="..."
```
