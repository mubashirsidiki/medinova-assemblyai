# 06. Server Actions & Data Flow

## 1. Overview
Medinova leverages Next.js Server Actions (`"use server"`) for mutations and direct Prisma queries in Server Components for reads. This eliminates the need for boilerplate REST route handlers.

---

## 2. Server Actions (`src/app/actions.ts`)

All form submissions in the application are executed via Server Actions:

| Action Function | Target Path | Purpose |
| :--- | :--- | :--- |
| **`loginAction`** | `/login` | Validates credentials, verifies PBKDF2 hash, writes `voicecare_session` cookie, and redirects to role dashboard. |
| **`logoutAction`** | Header / App Shell | Clears session cookie and redirects user to `/login`. |
| **`updateBotBasicSettings`** | `/user/ai-bot-settings` | Updates assistant name, primary language, accent, and selected voice model persona. |
| **`updateBotBehavior`** | `/user/ai-bot-settings` | Modifies the system prompt instructions defining conversational boundaries and clinical rules. |
| **`updateBotIntegration`** | `/user/ai-bot-settings` | Toggles CRM synchronization and Google/Outlook calendar synchronization flags. |
| **`updateUrgentNotification`** | `/user/ai-bot-settings` | Sets on-call doctor ID, notification target type, and custom SMS/email alert templates. |
| **`addBotLiveNumber`** | `/user/ai-bot-settings` | Adds a newly assigned phone number and binds it to a clinic department workflow. |
| **`deleteBotLiveNumber`** | `/user/ai-bot-settings` | Deletes an inbound phone number from the assistant profile. |
| **`createAppointmentAction`** | `/user/booking` | Books an appointment with a patient and provider; triggers confirmation dispatch. |
| **`toggleNotificationStatus`** | Dashboard / Header | Marks triage and system notifications as `read` or `unread`. |

---

## 3. Data Validation (`src/lib/validators.ts`)

Every action validates incoming `FormData` using Zod schemas before querying the database:

- `loginSchema`: Requires valid email and non-empty password.
- `botBasicSettingsSchema`: Enforces `botSettingsId`, `botName` (min 2 chars), `language`, `accent`, and `voiceModelName`.
- `botBehaviorSchema`: Validates system prompt `instructions` (min 20 chars).
- `botIntegrationSchema`: Enforces boolean flags for CRM and Calendar sync.
- `urgentNotificationSchema`: Validates recipient ID, email/SMS template formatting.
- `botLiveNumberSchema`: Validates phone number format and department assignment.
- `createAppointmentSchema`: Validates patient ID, provider ID, department, and valid future ISO date.

---

## 4. Server-Side Data Layer (`src/lib/data.ts`)

Used by Next.js Server Components for high-performance server-side data loading:

- **`getDashboardData()`**: Aggregates 30-day call records, calculates active triage queues, unread notifications, upcoming appointments, average response latency, and MTD cost trends.
- **`getCallsData(filters)`**: Performs paginated queries on `CallRecord` with optional text search, urgency filtering, spam filtering, and date ordering.
- **`getCallRecord(id)`**: Fetches a specific call document with full transcript and AI-generated clinical action items.
- **`getBookingData()`**: Loads clinic appointment schedules, doctor availability, and patient profiles.
- **`getAnalyticsData()`**: Computes intent distribution, hourly call volume histograms, and latency percentiles.
- **`getCostsData()`**: Aggregates usage events across voice minutes and model providers.
- **`getBotSettingsData(userId)`**: Loads user-specific assistant prompt configuration, voice models, and assigned live numbers.

---

## 5. Cache Revalidation Pattern
Whenever an action mutates data, it invokes `revalidatePath` to purge stale server caches and instantly update UI views:
```ts
revalidatePath("/user/ai-bot-settings");
revalidatePath("/user/dashboard");
```
