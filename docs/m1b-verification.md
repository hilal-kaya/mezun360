# M1B delivery and verification — 2026-09-24

Branch: `codex/m1b-auth-security`. No commit, push, deployment or M2 business implementation was performed. The repository still has no initial commit; all original M1A files were already untracked. This report distinguishes M1B edits using a SHA-256 snapshot captured before implementation, rather than treating every untracked file as newly created.

## Delivery

1. **Implemented:** local login/logout/current identity, validated DTOs, ALUMNI/ADMIN server authorization, deny-default routing, security probes, minimal account/audit model, secure development bootstrap and frontend login/guards/placeholders. No alumni/profile/job/mentorship/event/analytics/notification feature was added.
2. **Files:** the complete M1B-created/changed manifest is below. Ignored local `.env` was also extended with synthetic development settings and random credentials; secret values are intentionally absent from this report. Builds/test outputs remain ignored.
3. **Migrations:** V0002 identity/security audit and V0003 JDBC sessions. V0001 remains byte-identical to the pre-M1B snapshot. The existing local V0001 database upgraded to V0003; subsequent startup validated checksums and performed no further migration. Testcontainers also exercised clean migrations and repeated validation.
4. **Authentication:** Spring Security 6.5.11 with Spring Session JDBC 3.5.7 / PostgreSQL; server-side sessions, no JWT or browser-storage authentication. `/auth/me` is authoritative. Stored account states remain PENDING_EMAIL/ACTIVE/SUSPENDED/DEACTIVATED; alumni verification is not implemented.
5. **Hashing:** Spring Argon2id via Bouncy Castle 1.86; 64 MiB, 3 iterations, parallelism 1, random 16-byte salt, 32-byte output, delegating identifier. Hashes never appear in API output. Production concurrency benchmarking remains required.
6. **CSRF:** session-backed tokens with Spring XOR masking, obtained immediately before every unsafe frontend request. Login/logout protected; old token rejected after session rotation. No global CSRF disablement or automatic write replay.
7. **Cookie/session policy:** HttpOnly, Path=/, no Domain, SameSite=Lax; production Secure `__Host-mezun360-session`. Local HTTP uses `mezun360-session`. ALUMNI idle/absolute 30m/8h; ADMIN 15m/4h; configurable and server-enforced. Database security-version changes invalidate stale sessions; explicit all-session revocation is available to future service commands.
8. **Backend checks:** Java 21 Maven `verify` runs JUnit 5, Mockito and actual PostgreSQL Testcontainers; results are recorded below. Coverage includes login for both roles, unknown/wrong/inactive credentials, validation/mass assignment, guest denial, role authorization, safe identity, hashing, CSRF, logout, fixation, revocation, idle/absolute expiry, production cookie/policy guards, pre-MFA denial, rate limits, Flyway and OpenAPI drift.
9. **Frontend checks:** Node 24; 22 Vitest tests across 4 files passed. `npm run api:check`, `npm run lint`, `npm run typecheck`, `npm run build` all passed. Login form/validation/show-password, both role redirects, safe failure, anonymous guards, alumni admin exclusion and logout were exercised. Production bundle built successfully and does not include the development foundation page.
10. **Real local verification:** browser ALUMNI login reached `/app`; visiting `/admin` as ALUMNI returned to `/app` without admin UI; browser ADMIN login reached `/admin`; logout returned to `/login`. Separate real HTTP requests through the Vite proxy verified ALUMNI admin API 403, ADMIN 200, `/auth/me` identity and 401 after logout. Credentials/cookies/CSRF values were not printed. A browser direct navigation to the denied API was blocked by the browser tooling; HTTP verification supplied the authoritative status. A logout attempted during backend restart showed a safe retry message; after restart logout succeeded. Desktop login appearance was visually inspected.
11. **Remaining MFA:** real TOTP factor storage/enrollment/challenge/replay protection, hashed recovery codes, audited recovery and operator provisioning, institutional recovery policy and full HTTP factor tests. Production startup currently refuses the absent implementation; this is a deliberate blocker, not completed MFA.
12. **Remaining SSO:** provider protocol adapter, trusted issuer/subject mapping, secure linking/provisioning policy, assertion validation/assurance, logout and contract tests. Existing internal identity/session/service boundaries remain; no BTÜ SSO, OBS or e-Devlet integration was added.
13. **Architecture refinements:** latest M1B task uses `/auth/me` with anonymous 401 instead of proposed `/auth/session`. Full MFA/operator provisioning and notification/outbox work from the broader original roadmap remain deferred in this delivery; this deviation is explicit in the decision register and production is blocked. Minimal security audit was implemented. Login-specific Figma screen was not reachable, so existing reviewed Barlow/navy/pastel tokens were reused with a provisional layout. No stack/module deployment change or microservice was introduced.
14. **Before M2:** no technical blocker for local M2 development; M2 still needs separate authorization and must add real verification/privacy/ownership rules rather than treating the ALUMNI probe as member eligibility. BTÜ I-02 verification evidence and I-03 privacy notices/purposes are needed before rollout. Public onboarding requires registration/verification/reset delivery; production additionally requires MFA/operator recovery, trusted edge/shared rate limits, TLS/SPA headers, least-privileged DB roles and operational readiness.
15. **Readiness:** ready as a local authentication/security foundation for the next separately authorized milestone. **Not production-ready.** Detailed settings and limitations: [M1B security](m1b-security.md). Institutional inputs remain in [decisions](decisions.md), without invented KVKK retention periods.

## Final command results

| Check | Result |
| --- | --- |
| Backend `./mvnw verify` | 30 tests, zero failures/errors/skips; executable JAR built |
| Frontend `npm run api:check` | Passed |
| Frontend `npm test` | 22 tests passed |
| Frontend `npm run lint` | Passed |
| Frontend `npm run typecheck` | Passed |
| Frontend `npm run build` | Passed |
| PostgreSQL / Flyway | Existing V0001 upgraded to V0003; clean Testcontainers migration; repeat migrate is a no-op; validation passed |
| Real browser / HTTP | Both roles, routing, logout and server admin denial verified |
| Markdown/link/format | Passed: 17 Markdown files, 233 local links, fences/JSON/whitespace; git diff --check and all-text whitespace scan passed |

The first test run exposed an idle-expiry fixture error (only cleanup expiry, not session last-access time, was changed) and the old health-only OpenAPI contract. The fixture now advances both persisted timestamps into expiry and the reviewed contract contains all seven implemented paths. The final run, rather than that initial failed run, is the reported outcome. No standalone Playwright suite, production load test, production MFA or HTTPS deployment was claimed.

## M1B file manifest

Compared with the pre-M1B snapshot: 44 created files and 28 changed files. No baseline file was deleted.

### Created

- [backend/src/main/java/tr/edu/btu/mezun360/audit/application/SecurityAudit.java](../backend/src/main/java/tr/edu/btu/mezun360/audit/application/SecurityAudit.java)
- [backend/src/main/java/tr/edu/btu/mezun360/config/SecurityConfiguration.java](../backend/src/main/java/tr/edu/btu/mezun360/config/SecurityConfiguration.java)
- [backend/src/main/java/tr/edu/btu/mezun360/config/SecurityPolicy.java](../backend/src/main/java/tr/edu/btu/mezun360/config/SecurityPolicy.java)
- [backend/src/main/java/tr/edu/btu/mezun360/config/SecurityProperties.java](../backend/src/main/java/tr/edu/btu/mezun360/config/SecurityProperties.java)
- [backend/src/main/java/tr/edu/btu/mezun360/identity/api/AuthController.java](../backend/src/main/java/tr/edu/btu/mezun360/identity/api/AuthController.java)
- [backend/src/main/java/tr/edu/btu/mezun360/identity/api/CsrfResponse.java](../backend/src/main/java/tr/edu/btu/mezun360/identity/api/CsrfResponse.java)
- [backend/src/main/java/tr/edu/btu/mezun360/identity/api/CurrentAccountResponse.java](../backend/src/main/java/tr/edu/btu/mezun360/identity/api/CurrentAccountResponse.java)
- [backend/src/main/java/tr/edu/btu/mezun360/identity/api/LoginRequest.java](../backend/src/main/java/tr/edu/btu/mezun360/identity/api/LoginRequest.java)
- [backend/src/main/java/tr/edu/btu/mezun360/identity/api/LoginResponse.java](../backend/src/main/java/tr/edu/btu/mezun360/identity/api/LoginResponse.java)
- [backend/src/main/java/tr/edu/btu/mezun360/identity/api/SecurityCheckController.java](../backend/src/main/java/tr/edu/btu/mezun360/identity/api/SecurityCheckController.java)
- [backend/src/main/java/tr/edu/btu/mezun360/identity/api/SecurityCheckResponse.java](../backend/src/main/java/tr/edu/btu/mezun360/identity/api/SecurityCheckResponse.java)
- [backend/src/main/java/tr/edu/btu/mezun360/identity/application/AccountIdentity.java](../backend/src/main/java/tr/edu/btu/mezun360/identity/application/AccountIdentity.java)
- [backend/src/main/java/tr/edu/btu/mezun360/identity/application/AccountIdentityService.java](../backend/src/main/java/tr/edu/btu/mezun360/identity/application/AccountIdentityService.java)
- [backend/src/main/java/tr/edu/btu/mezun360/identity/application/AdminMfaBoundary.java](../backend/src/main/java/tr/edu/btu/mezun360/identity/application/AdminMfaBoundary.java)
- [backend/src/main/java/tr/edu/btu/mezun360/identity/application/CurrentAccountService.java](../backend/src/main/java/tr/edu/btu/mezun360/identity/application/CurrentAccountService.java)
- [backend/src/main/java/tr/edu/btu/mezun360/identity/application/DevelopmentAccountService.java](../backend/src/main/java/tr/edu/btu/mezun360/identity/application/DevelopmentAccountService.java)
- [backend/src/main/java/tr/edu/btu/mezun360/identity/application/EmailCanonicalizer.java](../backend/src/main/java/tr/edu/btu/mezun360/identity/application/EmailCanonicalizer.java)
- [backend/src/main/java/tr/edu/btu/mezun360/identity/application/LoginRateLimiter.java](../backend/src/main/java/tr/edu/btu/mezun360/identity/application/LoginRateLimiter.java)
- [backend/src/main/java/tr/edu/btu/mezun360/identity/application/LoginService.java](../backend/src/main/java/tr/edu/btu/mezun360/identity/application/LoginService.java)
- [backend/src/main/java/tr/edu/btu/mezun360/identity/application/RateLimitExceededException.java](../backend/src/main/java/tr/edu/btu/mezun360/identity/application/RateLimitExceededException.java)
- [backend/src/main/java/tr/edu/btu/mezun360/identity/application/SecurityCheckService.java](../backend/src/main/java/tr/edu/btu/mezun360/identity/application/SecurityCheckService.java)
- [backend/src/main/java/tr/edu/btu/mezun360/identity/application/SessionRevocationService.java](../backend/src/main/java/tr/edu/btu/mezun360/identity/application/SessionRevocationService.java)
- [backend/src/main/java/tr/edu/btu/mezun360/identity/domain/AccountStatus.java](../backend/src/main/java/tr/edu/btu/mezun360/identity/domain/AccountStatus.java)
- [backend/src/main/java/tr/edu/btu/mezun360/identity/domain/Role.java](../backend/src/main/java/tr/edu/btu/mezun360/identity/domain/Role.java)
- [backend/src/main/java/tr/edu/btu/mezun360/identity/domain/UserAccount.java](../backend/src/main/java/tr/edu/btu/mezun360/identity/domain/UserAccount.java)
- [backend/src/main/java/tr/edu/btu/mezun360/identity/infrastructure/CurrentAccountFilter.java](../backend/src/main/java/tr/edu/btu/mezun360/identity/infrastructure/CurrentAccountFilter.java)
- [backend/src/main/java/tr/edu/btu/mezun360/identity/infrastructure/DevelopmentUsersBootstrap.java](../backend/src/main/java/tr/edu/btu/mezun360/identity/infrastructure/DevelopmentUsersBootstrap.java)
- [backend/src/main/java/tr/edu/btu/mezun360/identity/infrastructure/LocalPasswordAuthenticationProvider.java](../backend/src/main/java/tr/edu/btu/mezun360/identity/infrastructure/LocalPasswordAuthenticationProvider.java)
- [backend/src/main/java/tr/edu/btu/mezun360/identity/infrastructure/SessionAuthenticationService.java](../backend/src/main/java/tr/edu/btu/mezun360/identity/infrastructure/SessionAuthenticationService.java)
- [backend/src/main/java/tr/edu/btu/mezun360/identity/infrastructure/SessionPrincipal.java](../backend/src/main/java/tr/edu/btu/mezun360/identity/infrastructure/SessionPrincipal.java)
- [backend/src/main/java/tr/edu/btu/mezun360/identity/infrastructure/UserAccountRepository.java](../backend/src/main/java/tr/edu/btu/mezun360/identity/infrastructure/UserAccountRepository.java)
- [backend/src/main/java/tr/edu/btu/mezun360/shared/api/ApiFailureFilter.java](../backend/src/main/java/tr/edu/btu/mezun360/shared/api/ApiFailureFilter.java)
- [backend/src/main/java/tr/edu/btu/mezun360/shared/api/ApiProblems.java](../backend/src/main/java/tr/edu/btu/mezun360/shared/api/ApiProblems.java)
- [backend/src/main/resources/db/migration/V0002__identity_and_security_audit.sql](../backend/src/main/resources/db/migration/V0002__identity_and_security_audit.sql)
- [backend/src/main/resources/db/migration/V0003__jdbc_sessions.sql](../backend/src/main/resources/db/migration/V0003__jdbc_sessions.sql)
- [backend/src/test/java/tr/edu/btu/mezun360/config/SecurityPolicyTest.java](../backend/src/test/java/tr/edu/btu/mezun360/config/SecurityPolicyTest.java)
- [backend/src/test/java/tr/edu/btu/mezun360/identity/AuthenticationIntegrationTest.java](../backend/src/test/java/tr/edu/btu/mezun360/identity/AuthenticationIntegrationTest.java)
- [backend/src/test/java/tr/edu/btu/mezun360/identity/SessionSecurityTest.java](../backend/src/test/java/tr/edu/btu/mezun360/identity/SessionSecurityTest.java)
- [docs/m1b-security.md](../docs/m1b-security.md)
- [docs/m1b-verification.md](../docs/m1b-verification.md)
- [frontend/src/features/auth/auth-pages.test.tsx](../frontend/src/features/auth/auth-pages.test.tsx)
- [frontend/src/features/auth/auth-pages.tsx](../frontend/src/features/auth/auth-pages.tsx)
- [frontend/src/features/auth/auth.ts](../frontend/src/features/auth/auth.ts)
- [scripts/setup-dev-users.py](../scripts/setup-dev-users.py)

### Changed

- [.env.example](../.env.example)
- [.github/workflows/ci.yml](../.github/workflows/ci.yml)
- [AGENTS.md](../AGENTS.md)
- [README.md](../README.md)
- [backend/README.md](../backend/README.md)
- [backend/pom.xml](../backend/pom.xml)
- [backend/src/main/java/tr/edu/btu/mezun360/config/OpenApiConfiguration.java](../backend/src/main/java/tr/edu/btu/mezun360/config/OpenApiConfiguration.java)
- [backend/src/main/java/tr/edu/btu/mezun360/shared/api/ApiExceptionHandler.java](../backend/src/main/java/tr/edu/btu/mezun360/shared/api/ApiExceptionHandler.java)
- [backend/src/main/resources/application-local.yml](../backend/src/main/resources/application-local.yml)
- [backend/src/main/resources/application.yml](../backend/src/main/resources/application.yml)
- [backend/src/test/java/tr/edu/btu/mezun360/TechnicalFoundationTest.java](../backend/src/test/java/tr/edu/btu/mezun360/TechnicalFoundationTest.java)
- [backend/src/test/java/tr/edu/btu/mezun360/shared/api/ApiExceptionHandlerTest.java](../backend/src/test/java/tr/edu/btu/mezun360/shared/api/ApiExceptionHandlerTest.java)
- [contracts/openapi/mezun360.yaml](../contracts/openapi/mezun360.yaml)
- [docs/api.md](../docs/api.md)
- [docs/architecture.md](../docs/architecture.md)
- [docs/database.md](../docs/database.md)
- [docs/decisions.md](../docs/decisions.md)
- [docs/repository-structure.md](../docs/repository-structure.md)
- [docs/requirements.md](../docs/requirements.md)
- [docs/roadmap.md](../docs/roadmap.md)
- [frontend/README.md](../frontend/README.md)
- [frontend/package.json](../frontend/package.json)
- [frontend/src/app/app.tsx](../frontend/src/app/app.tsx)
- [frontend/src/app/providers.tsx](../frontend/src/app/providers.tsx)
- [frontend/src/layouts/root-layout.tsx](../frontend/src/layouts/root-layout.tsx)
- [frontend/src/lib/api/client.ts](../frontend/src/lib/api/client.ts)
- [frontend/src/lib/api/generated/schema.d.ts](../frontend/src/lib/api/generated/schema.d.ts)
- [frontend/src/lib/api/index.ts](../frontend/src/lib/api/index.ts)
