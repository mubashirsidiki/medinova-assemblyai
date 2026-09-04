# Medinova Health Testing And Verification

This document records the testing setup, commands, browser checks, and database validation used for the Next.js version of the healthcare voice platform.

## Project Overview

- App location: `next-app/`
- Framework: Next.js App Router
- Language: TypeScript
- ORM: Prisma
- Database: MongoDB Atlas
- Runtime data: persisted clinic operations data plus frontend-only AI/Twilio surfaces for now

## What Was Tested

The following product areas were verified during implementation:

- Dashboard rendering and layout
- Role-based login screen and session flow
- Voice desk screen
- Call routing and classification screens
- Appointment booking screen
- Notifications screen
- Admin screen
- Patient dashboard screen
- Integrations screen
- MongoDB persistence for appointments
- MongoDB persistence for notification state updates
- Production build output

## Environment And Setup

### Local Environment

- Node.js: `v24.13.1`
- npm: `11.10.1`
- Project root: `c:\Users\Hp\Desktop\Stuff\Clout\Potfolio\Health Bot\next-app`

### Required Environment Variables

The app expects these values in `next-app/.env`:

- `DATABASE_URL`
- `MONGODB_URI`
- `LIVEKIT_API_KEY`
- `LIVEKIT_API_SECRET`
- `LIVEKIT_URL`
- `JWT_SECRET`

See `.env.example` for the full list.

## Database Verification

### Schema Push

Command:

```bash
npm run db:push
```

Result:

- Prisma schema synchronized with MongoDB
- Collections created:
  - `Organization`
  - `TeamMember`
  - `Patient`
  - `CallRecord`
  - `CallClassification`
  - `Appointment`
  - `Notification`
  - `UsageEvent`
  - `AuthUser`

### Seed Data

Command:

```bash
npm run db:seed
```

Seed result:

- 1 organization
- 5 team members
- 2 auth users
- 5 patients
- 100 call records
- 2 appointments
- notification history for admin and caller flows
- usage events

### Verified Database Behaviors

- Appointment creation writes a new appointment record.
- Appointment creation also creates a linked SMS confirmation notification.
- Notification status updates persist to MongoDB.
- Admin test account lands on `/admin`.
- User test account lands on `/dashboard`.
- Cross-access is blocked:
  - admin users are redirected away from user routes
  - user accounts are redirected away from admin routes

## Latest Verification

Verified on the current build:

- `npm run build`
- `npm run db:seed`
- Playwright MCP login checks
- Playwright MCP role-guard checks

Observed behavior:

- `marc_margulan@user.medinova.de` / `MediNova#2026User` opens the staff dashboard
- `marc_margulan@admin.medinova.de` / `MediNova#2026Admin` opens the admin console
- `/admin` redirects back to `/dashboard` for a user session
- `/dashboard` redirects back to `/admin` for an admin session
- No browser console errors were present during the final Playwright MCP check

## Build Verification

### Production Build

Command:

```bash
npm run build
```

Verified outcome:

- Prisma client generation completed
- Next.js production build completed successfully
- App routes compiled cleanly
- App is configured for dynamic rendering so MongoDB data loads at request time instead of build time

### Runtime Start

Command:

```bash
npm start -- --port 3001
```

Note:

- The app was run locally on `http://127.0.0.1:3001`
- The browser checks below used that port

## Browser Verification

Browser testing was done with Playwright MCP and confirmed the live app pages rendered correctly.

### Verified Routes

- `/login`
- `/dashboard`
- `/voice-desk`
- `/calls`
- `/booking`
- `/analytics`
- `/reports`
- `/costs`
- `/notifications`
- `/admin`
- `/patients`
- `/integrations`

### Verified Screenshots

- Dashboard full-page screenshot captured and visually checked
- Confirmed the dashboard shell, sidebar, charts, tables, and summary cards rendered cleanly

### Verified Interactive Flows

#### Login Flow

Steps checked:

1. Opened `/login`
2. Signed in with `marc_margulan@user.medinova.de` and `MediNova#2026User`
3. Confirmed the user lands on `/dashboard`
4. Signed out
5. Signed in with `marc_margulan@admin.medinova.de` and `MediNova#2026Admin`
6. Confirmed the admin lands on `/admin`

Expected outcome:

- Each role opens its own experience
- Login state persists in a cookie-backed session
- Direct access to the wrong area redirects to the correct landing screen

#### Booking Flow

Steps checked:

1. Opened `/booking`
2. Selected patient, provider, department, and channel
3. Filled scheduled time and notes
4. Submitted the form
5. Confirmed the appointment list reflected the new booking

Expected outcome:

- A new appointment is stored in MongoDB
- The appointment list updates in the UI
- A confirmation notification is created

#### Notification Update Flow

Steps checked:

1. Opened `/notifications`
2. Toggled the first notification from unread to read
3. Confirmed the label changed in the UI

Expected outcome:

- Notification `status` persists to MongoDB
- The UI updates to show the new state

## Visual Checks

The browser review focused on these items:

- Sidebar density and navigation consistency
- Top bar spacing and search placement
- Login screen structure and role-based access panel
- Dashboard title hierarchy
- KPI card spacing and readability
- Chart balance and line styling
- Table layout and row clarity
- Notification card spacing
- Mobile and narrow layout behavior
- Role-specific nav labels and session badge copy

## Current Test Commands

Run these from `next-app/`:

```bash
npm run db:push
npm run db:seed
npm run build
npm start -- --port 3001
```

Optional development command:

```bash
npm run dev
```

## Acceptance Criteria Met

- Next.js app is in a separate folder and ready for deployment
- MongoDB persistence is wired through Prisma
- Core healthcare operations screens are routed and working
- Login is role-aware and session-backed
- Booking writes persist
- Notification updates persist
- Production build passes
- Browser screenshots confirmed the visual system is stable

## Notes And Limitations

- AI and Twilio behavior remain frontend-only for now.
- The app is data-backed, but the integration surfaces are operational UI only.
- Prisma seed and CLI commands should be run from `next-app/`.
- The project uses dynamic server rendering so DB reads happen at request time.
