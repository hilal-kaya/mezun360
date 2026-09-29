# M2B — Privacy & Alumni Verification delivery and verification

Date: 2026-09-29. Branch: `codex/m2b-privacy-verification`.

## Delivered behavior

The second alumni milestone introduces owner privacy controls and audited manual alumni verification, preserving all M1A–M2A safeguards:

1. **Owner privacy preferences (`/app/settings`):** Authenticated ALUMNI owners control `directoryOptIn` (default false) and `profileVisibility` (`PRIVATE` default, `ALUMNI_MEMBERS`). Missing-profile reads return private defaults without writing database rows; saving requires an existing profile. Personal email, phone and contact details remain completely hidden from peer and public responses.
2. **Alumni verification submission (`/app/profile`):** Separates profile completion from official verification. Unsubmitted onboarding is distinguished from submitted review. Submitting requires department, graduation year and at least one completed education record, capturing an immutable snapshot of current evidence.
3. **Evidence revision tracking:** Editing first/last name, department, graduation year or education records increments `evidence_revision` and invalidates any previous verification back to unsubmitted PENDING. Unrelated professional fields, biography, skills or certifications do not invalidate verified status.
4. **Manual ADMIN verification queue & review (`/admin/verifications`):** Authorized staff inspect paginated queues of submitted requests, review minimal immutable snapshots without contact data, and issue terminal `VERIFIED` or `REJECTED` decisions. Rejection requires a 10–500 character plain-text explanation displayed safely to the alumni. Self-review is strictly denied.
5. **Durable immutability & audit:** Completed verification decisions and submitted snapshots cannot be altered via SQL updates (`protect_verification_history` trigger). Sensitive actions (`VERIFICATION_SUBMITTED`, `VERIFICATION_QUEUE_READ`, `VERIFICATION_DETAIL_READ`, `VERIFY`, `REJECT`, `PRIVACY_UPDATED`, `VERIFICATION_EVIDENCE_CHANGED`) commit to `audit_events` in the same transaction.

No directory browsing, peer profiles, external connectors (OBS/SSO/e-Devlet), employer portal, or notification outbox consumers are activated in this milestone.

## Schema and API

- Migrations:
  - [V0005__alumni_privacy_verification.sql](../backend/src/main/resources/db/migration/V0005__alumni_privacy_verification.sql): Adds `evidence_revision` to `alumni_profiles`, creates `alumni_privacy_settings` and `alumni_verification_requests` tables, partial unique index for single pending request per revision, and the `protect_verification_history()` trigger.
  - [V0006__verification_reason_constraint.sql](../backend/src/main/resources/db/migration/V0006__verification_reason_constraint.sql): Adds strict non-null and length constraint for rejection reasons.
- API Endpoints:
  - `GET /api/v1/me/privacy-preferences`: Returns own directory opt-in, visibility and ETag.
  - `PUT /api/v1/me/privacy-preferences`: Updates directory opt-in and visibility with exact `If-Match`.
  - `GET /api/v1/me/verification-requests`: Returns current revision verification summary and ETag.
  - `POST /api/v1/me/verification-requests`: Submits `{confirmAccuracy: true}` snapshot with exact `If-Match`.
  - `GET /api/v1/admin/verification-requests`: Paginated queue filtered by status (`PENDING`, `VERIFIED`, `REJECTED`).
  - `GET /api/v1/admin/verification-requests/{id}`: Detailed minimal evidence snapshot and current revision check.
  - `POST /api/v1/admin/verification-requests/{id}/decisions`: Records `VERIFIED` or `REJECTED` decision with exact `If-Match`.
- Concurrency & Transactions:
  - Per-owner PostgreSQL transaction advisory lock (`pg_advisory_xact_lock`) serializes profile updates, privacy writes, verification submission and admin review.
  - Exact strong ETags and `If-Match` headers protect against stale writes and mid-flight evidence changes.

## Frontend and design

- New components in `frontend/src/features/privacy-verification/`:
  - `PrivacyPage` (`/app/settings`): Form for directory opt-in switch and profile visibility radio choices with save toast and conflict handling.
  - `VerificationCard` (embedded in `/app/profile`): Status badge, submission dialog with explicit confirmation, and rejection reason alerts.
  - `AdminVerificationsPage` (`/admin/verifications`): Queue table with status filtering, pagination, accessible review dialog and rejection reason form.
  - Supporting modules: `queries.ts`, `display.ts`, `shared.tsx`.
- Design alignments:
  - Follows [M2B design mapping](design/m2b-privacy-verification.md) and Figma Make visual tokens (Barlow font, navy `#233A85`, pastel mint `#E4F4EA`, pastel peach `#FCE9DE`, pastel blue `#DDE7FF`).
  - Non-functional prototype elements (unsupported employer visibility toggles, notification preferences, direct contact data) are deliberately excluded.

## Automated verification actually run

Toolchain: Java 24 runtime, Maven Wrapper 3.9.16, Node 24, npm lockfile; real PostgreSQL 17.9 Testcontainers.

| Check | Result |
| --- | --- |
| Backend `./mvnw test` | 48 tests passed; 0 failures/errors/skips across 8 test suites |
| Backend M2B integration suite | `PrivacyVerificationIntegrationTest`: 8 tests passed covering privacy defaults, submission invariants, admin decisions, rejection reasons, evidence invalidation, advisory lock concurrency, upgrade backfill and audit rollback |
| Flyway migrations | Clean database migration through V0006; upgrade from V0004 with populated profile and backfilled privacy defaults; idempotency validated |
| OpenAPI contract check | `TechnicalFoundationTest`: 13 runtime paths verified against OpenAPI specification |
| Frontend `npm test` | 51 tests passed across 7 test suites; 10 dedicated privacy/verification tests |
| Frontend `npm run api:check` | Generated TypeScript schema matches OpenAPI contract (0 drift) |
| Frontend `npm run lint` | Passed, zero warnings |
| Frontend `npm run typecheck` | Passed, zero type errors |
| Frontend `npm run build` | Passed; production client bundle created in `dist/` |
| Markdown/link/format checks | `python3 scripts/check-docs.py` passed clean; `git diff --check` clean |

## Architectural refinements and remaining work

- Institutional verification port (`InstitutionalAlumniVerificationPort`) is defined as an interface only; manual ADMIN review is implemented directly in `VerificationService` with zero external calls.
- Full notification outbox and event consumers remain deferred until downstream modules require notifications.
- Real production TOTP MFA, operator recovery workflows, and public user registration/password reset remain prerequisites for release readiness.
- Institutional inputs I-01 through I-05 remain in the decision register.

## Changed-file inventory

- Documentation:
  - [AGENTS.md](../AGENTS.md)
  - [README.md](../README.md)
  - [docs/api.md](api.md)
  - [docs/architecture.md](architecture.md)
  - [docs/database.md](database.md)
  - [docs/decisions.md](decisions.md)
  - [docs/requirements.md](requirements.md)
  - [docs/roadmap.md](roadmap.md)
  - [docs/design/m2b-privacy-verification.md](design/m2b-privacy-verification.md)
  - [docs/m2b-verification.md](m2b-verification.md)
- Contracts:
  - [contracts/openapi/mezun360.yaml](../contracts/openapi/mezun360.yaml)
- Database migrations:
  - [backend/src/main/resources/db/migration/V0005__alumni_privacy_verification.sql](../backend/src/main/resources/db/migration/V0005__alumni_privacy_verification.sql)
  - [backend/src/main/resources/db/migration/V0006__verification_reason_constraint.sql](../backend/src/main/resources/db/migration/V0006__verification_reason_constraint.sql)
- Backend code:
  - [backend/src/main/java/tr/edu/btu/mezun360/alumni/api/AdminVerification.java](../backend/src/main/java/tr/edu/btu/mezun360/alumni/api/AdminVerification.java)
  - [backend/src/main/java/tr/edu/btu/mezun360/alumni/api/AdminVerificationController.java](../backend/src/main/java/tr/edu/btu/mezun360/alumni/api/AdminVerificationController.java)
  - [backend/src/main/java/tr/edu/btu/mezun360/alumni/api/PrivacyController.java](../backend/src/main/java/tr/edu/btu/mezun360/alumni/api/PrivacyController.java)
  - [backend/src/main/java/tr/edu/btu/mezun360/alumni/api/PrivacyResponse.java](../backend/src/main/java/tr/edu/btu/mezun360/alumni/api/PrivacyResponse.java)
  - [backend/src/main/java/tr/edu/btu/mezun360/alumni/api/PrivacyWrite.java](../backend/src/main/java/tr/edu/btu/mezun360/alumni/api/PrivacyWrite.java)
  - [backend/src/main/java/tr/edu/btu/mezun360/alumni/api/VerificationController.java](../backend/src/main/java/tr/edu/btu/mezun360/alumni/api/VerificationController.java)
  - [backend/src/main/java/tr/edu/btu/mezun360/alumni/api/VerificationDecision.java](../backend/src/main/java/tr/edu/btu/mezun360/alumni/api/VerificationDecision.java)
  - [backend/src/main/java/tr/edu/btu/mezun360/alumni/api/VerificationEvidence.java](../backend/src/main/java/tr/edu/btu/mezun360/alumni/api/VerificationEvidence.java)
  - [backend/src/main/java/tr/edu/btu/mezun360/alumni/api/VerificationQueue.java](../backend/src/main/java/tr/edu/btu/mezun360/alumni/api/VerificationQueue.java)
  - [backend/src/main/java/tr/edu/btu/mezun360/alumni/api/VerificationSubmission.java](../backend/src/main/java/tr/edu/btu/mezun360/alumni/api/VerificationSubmission.java)
  - [backend/src/main/java/tr/edu/btu/mezun360/alumni/api/VerificationSummary.java](../backend/src/main/java/tr/edu/btu/mezun360/alumni/api/VerificationSummary.java)
  - [backend/src/main/java/tr/edu/btu/mezun360/alumni/application/AlumniAccess.java](../backend/src/main/java/tr/edu/btu/mezun360/alumni/application/AlumniAccess.java)
  - [backend/src/main/java/tr/edu/btu/mezun360/alumni/application/InstitutionalAlumniVerificationPort.java](../backend/src/main/java/tr/edu/btu/mezun360/alumni/application/InstitutionalAlumniVerificationPort.java)
  - [backend/src/main/java/tr/edu/btu/mezun360/alumni/application/PrivacyService.java](../backend/src/main/java/tr/edu/btu/mezun360/alumni/application/PrivacyService.java)
  - [backend/src/main/java/tr/edu/btu/mezun360/alumni/application/ProfileService.java](../backend/src/main/java/tr/edu/btu/mezun360/alumni/application/ProfileService.java)
  - [backend/src/main/java/tr/edu/btu/mezun360/alumni/application/VerificationService.java](../backend/src/main/java/tr/edu/btu/mezun360/alumni/application/VerificationService.java)
  - [backend/src/main/java/tr/edu/btu/mezun360/alumni/domain/AlumniProfile.java](../backend/src/main/java/tr/edu/btu/mezun360/alumni/domain/AlumniProfile.java)
  - [backend/src/main/java/tr/edu/btu/mezun360/alumni/domain/AlumniVerificationRequest.java](../backend/src/main/java/tr/edu/btu/mezun360/alumni/domain/AlumniVerificationRequest.java)
  - [backend/src/main/java/tr/edu/btu/mezun360/alumni/domain/PrivacySettings.java](../backend/src/main/java/tr/edu/btu/mezun360/alumni/domain/PrivacySettings.java)
  - [backend/src/main/java/tr/edu/btu/mezun360/alumni/domain/ProfileVisibility.java](../backend/src/main/java/tr/edu/btu/mezun360/alumni/domain/ProfileVisibility.java)
  - [backend/src/main/java/tr/edu/btu/mezun360/alumni/domain/VerificationStatus.java](../backend/src/main/java/tr/edu/btu/mezun360/alumni/domain/VerificationStatus.java)
  - [backend/src/main/java/tr/edu/btu/mezun360/alumni/infrastructure/PrivacySettingsRepository.java](../backend/src/main/java/tr/edu/btu/mezun360/alumni/infrastructure/PrivacySettingsRepository.java)
  - [backend/src/main/java/tr/edu/btu/mezun360/alumni/infrastructure/VerificationRequestRepository.java](../backend/src/main/java/tr/edu/btu/mezun360/alumni/infrastructure/VerificationRequestRepository.java)
  - [backend/src/main/java/tr/edu/btu/mezun360/audit/application/SecurityAudit.java](../backend/src/main/java/tr/edu/btu/mezun360/audit/application/SecurityAudit.java)
  - [backend/src/main/java/tr/edu/btu/mezun360/config/OpenApiConfiguration.java](../backend/src/main/java/tr/edu/btu/mezun360/config/OpenApiConfiguration.java)
  - [backend/src/main/java/tr/edu/btu/mezun360/config/SecurityConfiguration.java](../backend/src/main/java/tr/edu/btu/mezun360/config/SecurityConfiguration.java)
- Backend tests:
  - [backend/src/test/java/tr/edu/btu/mezun360/TechnicalFoundationTest.java](../backend/src/test/java/tr/edu/btu/mezun360/TechnicalFoundationTest.java)
  - [backend/src/test/java/tr/edu/btu/mezun360/alumni/PrivacyVerificationIntegrationTest.java](../backend/src/test/java/tr/edu/btu/mezun360/alumni/PrivacyVerificationIntegrationTest.java)
  - [backend/src/test/java/tr/edu/btu/mezun360/alumni/ProfileIntegrationTest.java](../backend/src/test/java/tr/edu/btu/mezun360/alumni/ProfileIntegrationTest.java)
- Frontend code:
  - [frontend/src/app/app.tsx](../frontend/src/app/app.tsx)
  - [frontend/src/features/auth/auth-pages.tsx](../frontend/src/features/auth/auth-pages.tsx)
  - [frontend/src/features/privacy-verification/admin-verifications.tsx](../frontend/src/features/privacy-verification/admin-verifications.tsx)
  - [frontend/src/features/privacy-verification/display.ts](../frontend/src/features/privacy-verification/display.ts)
  - [frontend/src/features/privacy-verification/privacy-page.tsx](../frontend/src/features/privacy-verification/privacy-page.tsx)
  - [frontend/src/features/privacy-verification/queries.ts](../frontend/src/features/privacy-verification/queries.ts)
  - [frontend/src/features/privacy-verification/shared.tsx](../frontend/src/features/privacy-verification/shared.tsx)
  - [frontend/src/features/privacy-verification/verification-card.tsx](../frontend/src/features/privacy-verification/verification-card.tsx)
  - [frontend/src/features/profile/profile-api.ts](../frontend/src/features/profile/profile-api.ts)
  - [frontend/src/features/profile/profile-page.tsx](../frontend/src/features/profile/profile-page.tsx)
  - [frontend/src/layouts/alumni-layout.tsx](../frontend/src/layouts/alumni-layout.tsx)
  - [frontend/src/lib/api/generated/schema.d.ts](../frontend/src/lib/api/generated/schema.d.ts)
- Frontend tests:
  - [frontend/src/features/privacy-verification/privacy-verification.test.tsx](../frontend/src/features/privacy-verification/privacy-verification.test.tsx)
  - [frontend/src/features/profile/profile-page.test.tsx](../frontend/src/features/profile/profile-page.test.tsx)
