# 03. Authentication & Role-Based Access Control (RBAC)

## 1. Authentication Mechanism
Authentication uses a secure, lightweight cookie-based session scheme managed by Next.js Server Actions and middleware.

- **Cookie Name**: `voicecare_session`
- **Cookie Security**:
  - `httpOnly: true` (Prevents client-side XSS inspection)
  - `sameSite: "lax"`
  - `secure: true` in production environments
  - `maxAge: 43200` (12 hours)
- **Session Payload Schema**:
  ```ts
  type SessionPayload = {
    userId: string;
    email: string;
    displayName: string;
    role: "admin" | "user";
    defaultRoute: string;
  };
  ```

---

## 2. Password Security
Implemented in `src/lib/auth.ts`:
- **Algorithm**: PBKDF2 (`crypto.pbkdf2Sync`)
- **Digest**: SHA-512
- **Iterations**: 120,000
- **Salt**: 16 cryptographically secure random bytes generated with `crypto.randomBytes(16)`.
- **Comparison**: Constant-time comparison (`crypto.timingSafeEqual`) to prevent timing side-channel attacks.

---

## 3. Roles and Default Landing Routes

The system enforces two roles defined in `src/lib/session.ts`:

| Role | Landing Route | Description |
| :--- | :--- | :--- |
| **`user`** | `/user/dashboard` | Clinical staff, doctors, and practice operators. Access to live calls, triage queues, appointment scheduling, personal assistant settings, and practice analytics. |
| **`admin`** | `/admin/dashboard` | Practice directors and technical managers. Access to multi-clinic routing, team rosters, staff shifts, bot provisioning, and cloud infrastructure cost management. |

---

## 4. Route Protection Middleware (`src/proxy.ts`)

Next.js intercepts requests prior to rendering:
1. **Public Routes (Bypassed)**:
   - `/`, `/login`, `/privacy`, `/terms`, `/contact`
   - Static assets (`_next`, `favicon.ico`, SVGs, etc.)
2. **Unauthenticated Redirect**:
   - If `voicecare_session` is missing or corrupted, redirects to `/login?next=<requested_path>`.
3. **Role Enforcement**:
   - Non-admin sessions attempting to access `/admin/*` are automatically redirected to their allowed `defaultRoute` (`/user/dashboard`).
   - Server components reinforce this via `requireSession("admin")` or `requireSession("user")`.

---

## 5. Server-Side Session Helpers

In `src/lib/auth.ts`:
- `getSessionFromCookies()`: Asynchronously reads and verifies session cookie against the active MongoDB `AuthUser` document.
- `requireSession(role?: Role)`: Asserts valid session; redirects immediately to `/login` or default role route if invalid.
- `loginAction(prevState, formData)`: Server action validating input via Zod, verifying PBKDF2 hash, and setting cookie.
- `logoutAction()`: Clears cookie and redirects to `/login`.
