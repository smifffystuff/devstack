# Auth Security Review

**Last audited:** 2026-03-21
**Auditor:** auth-auditor agent
**Scope:** Authentication, authorization, password management, token security, profile management

---

## Critical Issues

> No critical issues found.

---

## Warnings

### 1. Tokens stored in plaintext in the database

- **File:** `src/lib/tokens.ts:8`, `src/lib/tokens.ts:30`
- **Issue:** Both `generatePasswordResetToken` and `generateVerificationToken` store the raw UUID token value directly in the `VerificationToken.token` column. If the database is read by an attacker (SQL injection, leaked backup, compromised credentials), every outstanding reset and verification token is immediately usable.
- **Impact:** A database read gives an attacker valid, unexpired tokens that allow them to verify arbitrary email accounts or reset passwords without access to the victim's email inbox.
- **Fix:** Hash the token before storing. Generate the raw value, email it, and store only `sha256(token)` in the database. On use, hash the incoming token and compare to the stored hash. `randomUUID()` tokens are too long to brute-force, so this is defence-in-depth against database compromise specifically.

  ```ts
  import { createHash, randomUUID } from "crypto"

  function hashToken(token: string) {
    return createHash("sha256").update(token).digest("hex")
  }

  export async function generatePasswordResetToken(email: string) {
    const token = randomUUID()           // sent in email link
    const tokenHash = hashToken(token)   // stored in DB
    // ...store tokenHash, return { token, ... }
  }
  ```

  Lookup and deletion in the route handlers must then query by `tokenHash` instead of the raw value.

---

### 2. No rate limiting on any auth endpoint

- **File:** `src/app/api/auth/reset-password/route.ts`, `src/app/api/auth/register/route.ts`, `src/app/api/auth/verify/route.ts`, `src/app/api/auth/change-password/route.ts`
- **Issue:** None of the custom auth API routes implement rate limiting. The NextAuth credentials sign-in handler also has no application-level rate limiting configured.
- **Impact:**
  - `POST /api/auth/reset-password`: Unlimited password-reset emails can be triggered for any address, spamming victims and burning through Resend sending quota.
  - `POST /api/auth/register`: Mass account creation is unconstrained.
  - `PUT /api/auth/change-password`: No throttle on current-password guessing (though the attacker needs a valid session, which limits practical risk here).
- **Fix:** Add rate limiting at the edge or in each route. For this stack (Next.js + Vercel + optional Redis), `@upstash/ratelimit` is the most practical option. At minimum, rate-limit the password reset and registration endpoints by IP — e.g. 5 requests per 15 minutes.

---

### 3. Email verification and password reset tokens share the same table and namespace

- **File:** `src/lib/tokens.ts:14`, `src/lib/tokens.ts:36`
- **Issue:** Both token generators use the `VerificationToken` table keyed only by `identifier` (email). Both call `deleteMany({ where: { identifier: email } })` before inserting. This means requesting a password reset silently deletes any pending email verification token for the same address, and vice versa.

  Additionally, the token lookup in both endpoint handlers (`verify/route.ts:13`, `reset-password/route.ts:49`) is by `token` value alone with no type check. A valid password-reset token could be submitted to `/api/auth/verify` and would successfully mark the user's email as verified, even though the token was issued for a different purpose.

- **Impact:** A user who has not yet verified their email can have their verification token clobbered by a third party who knows their email address triggering a password reset. The cross-type token acceptance is a low-severity logic error.
- **Fix:** Add a `type` discriminator field to `VerificationToken` (e.g. `"email_verification" | "password_reset"`), filter on it in `deleteMany` calls, and assert the correct type in each endpoint handler before proceeding.

---

## Suggestions

### 1. No maximum password length (bcrypt silent truncation)

- **Files:** `src/app/api/auth/register/route.ts`, `src/app/api/auth/reset-password/route.ts:42`, `src/app/api/auth/change-password/route.ts:22`
- A minimum of 8 characters is enforced server-side, but there is no maximum. bcrypt silently truncates input at 72 bytes. A user who sets a password longer than 72 bytes can later authenticate with any truncation of it — a subtle behaviour most users will not expect. Enforce a server-side maximum (e.g. 128 characters) and surface it clearly in error messages.

### 2. Email not normalised at registration time

- **File:** `src/app/api/auth/register/route.ts:28`, compared to `src/app/api/auth/reset-password/route.ts:18,26`
- The password reset endpoint normalises the email to lowercase before querying and storing. The registration endpoint does not. If a user registers with `User@Example.com`, the password reset flow for `user@example.com` may fail to find the account (depending on database collation). Normalise email to lowercase during registration so the stored value is consistent everywhere.

### 3. Password change does not invalidate other active sessions

- **File:** `src/app/api/auth/change-password/route.ts`
- After a successful password change, all existing JWT sessions for the user remain valid until natural expiry. An attacker who obtained a session cookie before the password change retains access. Because the project uses the JWT strategy (stateless tokens), true revocation requires additional work: store a `passwordChangedAt` timestamp on `User`, include it in the JWT payload, and reject tokens issued before the latest password change in the `jwt` callback.

### 4. `NEXT_PUBLIC_APP_URL` used in security-sensitive emails without a validation guard

- **File:** `src/lib/email.ts:8,38`
- The reset and verification URLs are built from `process.env.NEXT_PUBLIC_APP_URL` with no null or format check. If the variable is missing or misconfigured, links silently become `undefined/reset-password?token=...`. Add a startup guard (consistent with the existing `DATABASE_URL` guard pattern in the project) that throws at startup if the value is absent or is not a valid HTTPS URL.

---

## Passed Checks

### Password Security

- Passwords are hashed with bcrypt at cost factor 12 in all three places where hashing occurs: registration (`register/route.ts:41`), password reset (`reset-password/route.ts:70`), and password change (`change-password/route.ts:50`). Cost factor 12 exceeds the recommended minimum of 10.
- All password comparisons use `bcrypt.compare`, which is timing-safe by design (`auth.ts:49`, `change-password/route.ts:41`).
- No passwords appear in logs, error messages, or API response bodies across all audited files. The Prisma `select` in `change-password/route.ts:30-32` limits the query to only the `password` field, avoiding inadvertent exposure of other sensitive columns.
- Password minimum length of 8 characters is enforced server-side in registration, reset, and change-password handlers — not only client-side.
- OAuth-only users are correctly blocked from the change-password flow: the UI only renders `ChangePasswordButton` when `user.hasPassword` is true (`profile/page.tsx:131`), and the API independently returns a clear error if the user has no password set (`change-password/route.ts:34-38`).

### Token Security

- Tokens are generated with `randomUUID()` from Node's built-in `crypto` module (`tokens.ts:1`), which is backed by the OS CSPRNG and is cryptographically secure.
- Password reset tokens expire in 1 hour; email verification tokens expire in 24 hours. Both are appropriate and are communicated to users in the email body (`email.ts:30,60`).
- Tokens are single-use: both the verify route (`verify/route.ts:37-39`) and the reset-password PUT handler (`reset-password/route.ts:77-79`) delete the token immediately after successful use.
- Expired tokens are explicitly deleted from the database on attempted use, preventing accumulation of stale records (`verify/route.ts:24-30`, `reset-password/route.ts:60-68`).
- Existing tokens for the same email are invalidated before a new token is issued, ensuring only the most recent link is ever valid (`tokens.ts:14`, `tokens.ts:36`).

### Password Reset Flow

- The POST handler always returns `{ success: true }` regardless of whether the email address is registered (`reset-password/route.ts:22-24`). The UI message also uses careful wording ("If an account exists with that email…"). Email enumeration through the reset flow is correctly prevented.
- The token is validated for existence and checked against its expiry before the password update is applied (`reset-password/route.ts:49-68`).
- The token is deleted immediately after a successful password reset, making it single-use (`reset-password/route.ts:77-79`).
- The new password in the reset flow is validated server-side (minimum 8 characters) before hashing, consistent with registration requirements (`reset-password/route.ts:42-46`).

### Email Verification

- The verification endpoint validates the token, checks expiry, marks the user as verified, and then deletes the token — all in the correct order (`verify/route.ts:13-43`).
- Unverified users are blocked at sign-in when `ENABLE_EMAIL_VERIFICATION=true`; the `authorize` callback throws `EmailNotVerifiedError` before issuing a session (`auth.ts:53-58`).
- The feature is cleanly toggled via the `ENABLE_EMAIL_VERIFICATION` environment variable, and users are auto-marked as verified at registration when the flag is off — no security gap is introduced by disabling the feature (`register/route.ts:25-26,47-49`).

### Session and Authorization

- The middleware at `src/middleware.ts` is correctly named and structured — it exports `middleware` as a named export and `config` with the appropriate matcher, so Next.js will execute it for all `/dashboard/*` routes.
- The profile page performs a redundant but correct server-side `auth()` check (`profile/page.tsx:12-16`), providing defence-in-depth in case the middleware is bypassed.
- The change-password and delete-account API routes both call `auth()` server-side and return HTTP 401 before performing any database operations (`change-password/route.ts:7-11`, `delete-account/route.ts:6-10`).
- All database operations in profile management are scoped to `session.user.id` (obtained from the server session, not from a client-supplied parameter). There is no IDOR vulnerability.
- Session data exposed to the client is limited to `id`, `name`, `email`, and `image` — no password hash, no `isPro` flag, no Stripe IDs (`auth.ts:60`, `next-auth.d.ts`).
- JWT strategy is used correctly alongside `PrismaAdapter`, which is the required configuration for NextAuth v5 when using the credentials provider.

### Profile Management

- Account deletion cascades correctly through all child models. The Prisma schema has `onDelete: Cascade` on `Account`, `Session`, `Item`, `Collection`, `Tag`, and `ItemType` references to `User`, and `ItemTag` cascades from both `Item` and `Tag`. No orphaned records will remain after a user is deleted (`schema.prisma`).
- The "DELETE" confirmation input in `DeleteAccountButton.tsx` provides a meaningful friction barrier against accidental deletion (`DeleteAccountButton.tsx:84`).

---

## Summary

| Severity   | Count |
|------------|-------|
| Critical   | 0     |
| Warning    | 3     |
| Suggestion | 4     |
| Passed     | 22    |
