# M1B authentication and security

Implemented scope: local login/logout/current account, role probes, Argon2id, PostgreSQL sessions, CSRF, bounded login limits, minimal security audit, development accounts and login UI. No business domain, registration/reset delivery, notification worker, MFA enrollment or institutional integration is implemented. The latest M1B request narrows the original roadmap; see [decisions](decisions.md).

## Identity and authentication

`identity` owns account persistence, local credential verification, session establishment/revocation and current-account services. `audit.application.SecurityAudit` is its append-only service boundary. Controllers accept validated DTOs and call services. Spring Security `AuthenticationProvider` separates credential proof from internal account authority. No role-setting HTTP endpoint exists. Reject unknown request properties, including `role` on login. Session principals contain account UUID, role snapshot, security version, authentication instant and MFA assurance; no password/hash/email is serialized into the principal.

Stored roles are ALUMNI and ADMIN. GUEST is anonymous; EMPLOYER is absent. Account states remain PENDING_EMAIL, ACTIVE, SUSPENDED and DEACTIVATED; the latter two represent disabled access. Only ACTIVE accounts with verified email can log in. Alumni verification remains a separate M2 domain and is not implied by a successful login or technical ALUMNI probe.

Local email normalization is ASCII address validation, stripping surrounding whitespace at the canonicalization boundary and locale-independent lowercase; the HTTP DTO rejects whitespace. Dots and plus tags are preserved. Internationalized addresses require an explicit later normalization/migration change. Login failures for unknown, wrong-password and inactive accounts have the same status/code/detail; unknown accounts undergo a dummy Argon2 comparison. This reduces enumeration signals without claiming constant network timing.

Spring Security's delegating encoder stores `{argon2id}` with Argon2id v19, 64 MiB memory, 3 iterations, parallelism 1, 16-byte salt and 32-byte output. Bouncy Castle 1.86 supplies the implementation without a native binary dependency. Random salts and hashes are exercised in integration tests. Benchmark throughput/memory under the target production concurrency before release; local tests are not a production capacity benchmark. Future parameter/algorithm upgrades require a deliberate rehash policy and, for a new algorithm identifier, a forward migration adjusting the hash-format constraint.

## Session and request lifecycle

1. GET `/api/v1/auth/csrf` creates/uses an anonymous server session and returns a masked token. The underlying token stays in that session. Spring's XOR handler decodes the masked `X-CSRF-TOKEN` header; no readable auth cookie is needed.
2. The frontend obtains a fresh masked token before **each** unsafe request, holds it only for that request and sends credentials. Login and logout both require CSRF. It never automatically replays a failed write. No token, role or identity is kept in localStorage/sessionStorage.
3. POST login validates email/password, applies account/source rate limits and verifies current database state. The old session is invalidated and a new session/context is explicitly saved. Old CSRF tokens are invalid after this rotation. JavaScript receives only `{authenticated,mfaRequired}`; it obtains identity separately from GET `/auth/me`.
4. Every authenticated request reloads current account status, role and security version and checks absolute expiry. The database trigger increments `security_version` when security fields change; stale sessions fail on their next request. `SessionRevocationService` supports deleting all indexed sessions by stable account UUID for future audited security commands. Future mutations must recheck authority inside their transaction and use this revocation boundary.
5. Logout invalidates full/pending sessions, expires the cookie and records the authenticated logout. Frontend cancels requests, clears Query caches and navigates to `/login`. Identity refetch on focus/every minute and protected-query 401 handling remove expired identity/private caches; server checks remain authoritative between refetches. Pending/error/anonymous/authenticated UI states are distinct.

| Setting | Default / behavior |
| --- | --- |
| `SESSION_COOKIE_NAME` | Production `__Host-mezun360-session`; explicit local profile `mezun360-session` |
| `SESSION_COOKIE_SECURE` | Production true; local false for loopback HTTP |
| Cookie scope | HttpOnly, Path=/, no Domain; session cookie, no persistent remember-me |
| `SESSION_COOKIE_SAME_SITE` | Lax; only Lax or Strict accepted |
| `ALUMNI_SESSION_IDLE` / `ALUMNI_SESSION_ABSOLUTE` | 30m / 8h |
| `ADMIN_SESSION_IDLE` / `ADMIN_SESSION_ABSOLUTE` | 15m / 4h |
| Pending MFA | 5-minute restricted context; no normal authorities |
| Session persistence | Spring Session JDBC 3.5.7; Flyway schema only; expired rows cleaned once per minute |
| `AUTH_ALLOWED_ORIGINS` | Empty by default; comma-separated exact origins if needed; HTTPS outside local |
| `AUTH_ACCOUNT_ATTEMPTS` / `AUTH_SOURCE_ATTEMPTS` / `AUTH_RATE_WINDOW` | 5 / 30 / 5m |

Idle and absolute timeouts are technical security defaults, configurable within validated bounds (at least one second, at most one day; idle <= absolute). They are **not legal data-retention periods**. Session expiry is checked independently of asynchronous expired-row cleanup.

The fixed-window login limiter is synchronized, process-local and bounded to 10,000 pseudonymous salted keys. It counts successes and failures, returns 429 plus Retry-After, expires buckets and fails closed at capacity. Restart resets counters; instances do not share them. Source uses the immediate remote address and never blindly trusts forwarded headers. Vite/reverse proxies can aggregate users under one source; deploy a trusted proxy/edge configuration and shared enforcement before multiple instances or public production traffic. No Redis is introduced.

## Authorization, errors and headers

Deny routes by default. Public runtime APIs are health, CSRF bootstrap and CSRF-protected login/logout. `/auth/me` requires authentication. `/admin/**` requires ADMIN plus service method authorization; `/alumni/security-check` requires ALUMNI. ADMIN is not automatically ALUMNI. Probes verify technical access only and return no metrics/profile/contact data. Guest GET probes return 401, ALUMNI admin probe 403 and ADMIN admin probe 200. An unsafe request with missing/invalid CSRF can return 403 before credential/role evaluation.

Security filters and controllers use the shared RFC 9457 shape with trace ID and no-store. Codes include AUTHENTICATION_REQUIRED, INVALID_CREDENTIALS, FORBIDDEN, CSRF_INVALID, RATE_LIMITED, VALIDATION_FAILED and UNKNOWN_FIELD. Errors never contain rejected credentials, hashes, stack traces or query strings. Check the [API contract](../contracts/openapi/mezun360.yaml) for the implemented operations.

Spring defaults supply nosniff, frame denial, no-cache and HTTPS-only HSTS. Referrer-Policy is no-referrer; Permissions-Policy disables camera, microphone and geolocation. JSON responses use a restrictive `default-src 'none'` CSP. Local Swagger has a narrow self-hosted exception for its assets/styles. These backend headers do not secure the separately served SPA: the future same-origin HTTPS reverse proxy must apply a tested SPA-specific CSP and security headers. Do not serve production using Vite dev/preview or the local profile. Allowed CORS origins are exact, credentialed and wildcard-free; same-origin deployment is preferred.

## Development users

Set `SPRING_PROFILES_ACTIVE=local` and `DEV_USERS_ENABLED=true` in the ignored root `.env`, then run `python3 scripts/setup-dev-users.py` from the root and restart the backend. The script fills missing/empty DEV_ALUMNI_EMAIL/PASSWORD and DEV_ADMIN_EMAIL/PASSWORD with synthetic addresses and independently random passwords, preserves nonempty values, sets file mode 0600 and prints no secrets. Read credentials locally from `.env`; never copy them into frontend env, screenshots, logs or committed files.

The bootstrap creates only missing development-marked accounts, active and email-verified. It never overwrites passwords, reactivates accounts or promotes an existing account; collisions with another role or non-development account fail closed. Changing the environment password does not reset an existing account. Do not delete a useful database to resolve a credential mismatch. Development accounts cannot authenticate outside the local profile, and enabling the seed outside local is refused. Combining local with any other profile is refused. Production operator provisioning is not implemented.

## MFA and institutional SSO boundaries

ADMIN MFA remains mandatory for production. `AdminMfaBoundary.productionReady()` currently returns false. Every non-local startup refuses to run until a real MFA implementation is integrated; toggling a flag cannot bypass this. `ADMIN_MFA_REQUIRED=false` defaults only in the explicit local profile. Setting it true locally exercises a restricted pending login: `/auth/me` and admin APIs remain inaccessible, and the UI explains the unavailable second-factor flow.

Intended initial factor: TOTP through a maintained library/adapter, with encrypted per-account factor material, limited attempts and replay prevention. A future authenticated operator provisions an administrator; password proof grants only enrollment/challenge context. Enrollment requires successful TOTP proof before activation. Completing MFA rotates the session and records assurance. Recovery codes must be individually hashed and atomically consumed, with audited replacement and full session revocation. Recovery/break-glass cannot grant permanent MFA bypass; BTÜ must approve its staff, approver, recovery and audit-review process (I-01). No MFA enrollment/challenge/recovery endpoint or dummy successful factor exists now.

Future BTÜ SSO adds a Spring AuthenticationProvider/protocol adapter that maps trusted `(issuer, subject)` to a stable internal account and then uses the same account eligibility, session and service authorization. Never auto-link solely by email or accept ADMIN from browser/SSO claims. Provisioning/linking, protocol metadata, institutional MFA assurance and logout policy require separately authorized work and BTÜ input. e-Devlet remains roadmap only. OBS belongs to the later alumni verification adapter, not identity login.

## Audit, migrations and production prerequisites

V0002 adds user accounts and minimal security audit; V0003 adds the exact selected Spring Session PostgreSQL schema. V0001 is unchanged. Successful password proof/account creation records join their transaction; failed credential audits use an independent transaction so they survive rollback. Admin probe access and logout are audited. Audit stores UUIDs, actor type/role, action/outcome/time and correlation ID, with no email, IP, password, token or session cookie. Full business private-data auditing and notification/outbox workflows remain later work.

The development DB user owns its schema. Revoking audit updates from PUBLIC does not make the schema owner tamper-proof. Production must separate a privileged Flyway migration role from a least-privileged runtime role: runtime has necessary account/session DML and audit INSERT (no audit UPDATE/DELETE/TRUNCATE), no schema DDL; audit reading is restricted to approved review roles. Provision/grant changes must use reviewed Flyway deployment migrations once actual institutional role names are known. Do not claim these production grants are already installed.

Back up before migration, apply forward and validate checksums; never edit applied versions, repair casually or automate destructive downgrade. Rolling back code after V0002/V0003 must retain their tables/history. Session serialization changes require a deliberate session invalidation or compatible migration plan; do not silently carry incompatible session attributes between deployments. New deployment schemas must be tested both from empty and from the preceding release.

Retention: “TBD – to be defined by Bursa Technical University according to institutional policy and applicable KVKK requirements.” There is no audit/account age-based deletion or invented legal duration. Retention configuration and privacy workflows remain future work.

M2 development can use this local foundation after separate authorization. Production remains blocked by real MFA, approved operator provisioning/recovery, shared/edge brute-force protection, deployment/TLS/runtime DB grants, production Argon2 capacity testing and the relevant institutional inputs in [decisions](decisions.md). Registration/verification/reset delivery and provider-independent notifications/outbox require their own authorized delivery before public account onboarding.
