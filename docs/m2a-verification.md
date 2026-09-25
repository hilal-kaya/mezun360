# M2A — Alumni Profile delivery and verification

Date: 2026-09-25. Branch: `codex/m2a-alumni-profile`. No commit, push, deployment or M2B implementation.

## Delivered behavior

The first business module is an owner-only alumni profile, separate from authentication accounts. `/app/profile` loads PostgreSQL data, provides explicit onboarding and section dialogs, validates/saves edits, updates TanStack Query and shows an automatically dismissed success toast. It includes professional core fields, plain-text biography, chronological employment/education, normalized skill chips, structured certifications and four contribution preferences. The responsive alumni shell labels future destinations Yakında; public/login/admin behavior is preserved.

No directory, other-alumni viewing, visibility controls, verification workflow, admin inspection, contact fields, files, notifications or other business modules were introduced. Education is labelled user-entered. Community interests do not grant permissions or enroll participants.

## Schema and API

- New migration: [V0004__owner_alumni_profile.sql](../backend/src/main/resources/db/migration/V0004__owner_alumni_profile.sql). Applied M1 migrations are unchanged; `ddl-auto=validate` remains active.
- Six tables: `alumni_profiles`, `employment_records`, `education_records`, `skills`, `alumni_profile_skills`, `certifications`. Contribution booleans belong to the profile aggregate. See [schema and upgrade/delete semantics](database.md).
- Endpoints: `GET /api/v1/me/profile`, `PUT /api/v1/me/profile`, ALUMNI owner only. Aggregate replacement is atomic and requires CSRF plus exact `If-Match`; absent/stale preconditions return 428/412. Child IDs cannot select another owner's records. Unknown/privileged properties are rejected. GET returns a nonmutating onboarding representation before creation.
- Completion: five categories × 20 points: complete core (first/last name, department, graduation year, city), biography, at least one career record, education record and skill. Certifications and contribution preferences do not affect the percentage. No percentage is stored or seeded. See [contract](api.md).
- Audit: successful changes append `PROFILE_UPDATED` with actor/profile/correlation IDs in the same transaction; no profile contents or credentials are logged. No unused notification/outbox system is introduced.

## Frontend and design

New `AlumniLayout`, `AlumniHome`, `UpcomingAlumniPage`, `ProfilePage`, `ProfileEditor`, profile API hooks/constants and scoped styles. Routes: `/app`, `/app/profile`; explicit upcoming stubs `/app/network`, `/app/jobs`, `/app/mentorship`, `/app/events`, `/app/news`, `/app/settings`. Existing `/admin` placeholder remains separate. Profile data is never stored in browser local storage; query keys include owner identity and existing session cache clearing remains intact.

[Figma evidence](design/m2a-alumni-profile.md) records the reviewed Mezun/Profilim screen and edit dialog. Preserved left profile/contribution cards, right biography/timeline/education/skills/certification cards, navy/pastel palette and Barlow. Structured chip/record controls replace the prototype's comma-separated fields as explicitly requested. Prototype contact details and sample metrics are excluded.

## Automated verification actually run

Toolchain: Java 21, Maven Wrapper, Node 24, npm lockfile; real PostgreSQL 17.9 Testcontainers. No H2 replacement or skipped Docker checks.

| Check | Result |
| --- | --- |
| Backend `./mvnw verify` | 38 tests passed; 0 failures/errors/skips; executable JAR built |
| Existing backend regressions | All 30 M1 tests retained and passing |
| New profile integration suite | 8 tests passing: onboarding/persistence, account isolation, guest/admin/CSRF, foreign child IDs/mass assignment, date/year/URL/markup/duplicate validation, concurrency, nested update/removal/skill reuse, completion and upgrade |
| Flyway | Empty database through V0004, repeat migrate with zero changes, checksum validation; separate V0003 → V0004 upgrade preserves the existing identity row |
| Expanded contract checks | Final targeted TechnicalFoundationTest: 5 tests passed, including nullable unions and validation bounds |
| Markdown/link/format checks | `python3 scripts/check-docs.py`: 21 Markdown files, 334 local links, fences/JSON/whitespace passed; `git diff --check` clean |
| Frontend `npm run api:check` | Generated OpenAPI types match the reviewed contract, including nullable onboarding data |
| Frontend `npm run test` | 41 tests passed across 6 files; 31 existing regressions + 10 profile behavior tests |
| Frontend `npm run lint` | Passed, no warnings |
| Frontend `npm run typecheck` | Passed |
| Frontend `npm run build` | Passed; production JavaScript approximately 431 kB / 135 kB gzip |

Profile UI tests cover loading, onboarding/required names, server data/completion, edit/save/cache, skill keyboard add/deduplicate/remove, career/certification add/edit/remove, field errors, stale edit handling, retry and Escape/focus restoration. Existing public landing/login/logout/role redirect and primitive/transport tests pass. Real HTTP integration tests exercise session cookies and CSRF rather than bypassing filters with mocked authentication. Concurrent initial creation produces one 200 and one 412, never two profiles.

The nullable-record schema needed an explicit OpenAPI 3.1 union because the library emitted an invalid nullable `$ref`; the runtime customizer and generated contract now agree. Integer coercion from decimal JSON is disabled so year validation cannot silently truncate a number.

## Local manual and HTTP verification

Using only the existing local synthetic ALUMNI account:

1. Logged in through the real UI, opened Profilim, observed “Profilini tamamla” and 0 completion.
2. Created the synthetic Deniz Örnek profile through the dialog; first/last name, department, graduation year, company, position and city persisted. Completion became 20 from the backend.
3. Saved biography, added Java/React/PostgreSQL chips with keyboard/buttons, added user-entered education and a structured certificate, selected mentor interest and saved each section. Completion advanced through 40/60/80; the optional certificate/preference did not increase it.
4. Reloaded the browser: saved core, biography, education, skills, certificate and preference remained. Logged out, requested `/app/profile` and verified redirect to login. Logged in again and confirmed the saved profile remained.
5. A separate local HTTP session verified guest profile 401, authenticated profile GET/PUT 200, ALUMNI admin probe 403, logout 204 and subsequent profile 401. It added one synthetic career record to the local development account only, preserving all other fields; completion became 100 and browser readback displayed the chronological record.
6. Inspected desktop 1280px, mobile 390×844 and tablet 768×1024. Mobile menu exposes all eight destinations; dialog focus/labels and single-column forms work. Document width matched viewport at 390 and 768, with no horizontal overflow. Reset the temporary viewport override after checking.

**Manual-test limitation:** the Codex in-app browser crashed when opening its native date picker. Career/date validation and add/edit/remove behavior pass backend and Vitest tests, and a real dated career record passes HTTP persistence/browser rendering. The native date-picker interaction itself is not claimed as a passing manual check. Recheck that picker in the supported release browsers during UI acceptance; do not treat the embedded-browser crash as proven application failure or claim another browser was tested.

The synthetic local data is marked as test content in its biography/description. It is neither production seed data nor a committed fixture. Passwords were read internally from the ignored local environment and never printed. No real alumni contact information was used.

## Architectural refinements and remaining work

The modular monolith and security baseline are preserved. Explicitly documented refinements: the user-authorized aggregate API supersedes previously proposed independent history endpoints; CareerExperience uses the established `employment_records` name; contribution flags stay on their owning aggregate; department is bounded self-reported text until BTÜ supplies approved references; no outbox is added without an authorized consumer. These are recorded in [decisions](decisions.md), not hidden changes to product scope.

M2A provides a foundation for **M2B – Privacy & Alumni Verification**; M2B was not started. Future work must protect institutionally sourced education from owner edits before enabling it and add visibility/verification through forward migrations and separate authorized commands. Institutional inputs I-01–I-05 and production ADMIN MFA/provisioning remain unchanged. This is not a production release. The native date-picker manual limitation above remains a release-browser QA item; no other known failing application check remains.

## Changed-file inventory

Generated below from the working tree, including untracked deliverables; local ignored secrets/build outputs are excluded.

- Changed: [AGENTS.md](../AGENTS.md)
- Changed: [README.md](../README.md)
- Changed: [backend/README.md](../backend/README.md)
- Created: [backend/src/main/java/tr/edu/btu/mezun360/alumni/api/ProfileController.java](../backend/src/main/java/tr/edu/btu/mezun360/alumni/api/ProfileController.java)
- Created: [backend/src/main/java/tr/edu/btu/mezun360/alumni/api/ProfileResponse.java](../backend/src/main/java/tr/edu/btu/mezun360/alumni/api/ProfileResponse.java)
- Created: [backend/src/main/java/tr/edu/btu/mezun360/alumni/api/ProfileWrite.java](../backend/src/main/java/tr/edu/btu/mezun360/alumni/api/ProfileWrite.java)
- Created: [backend/src/main/java/tr/edu/btu/mezun360/alumni/application/ProfileRules.java](../backend/src/main/java/tr/edu/btu/mezun360/alumni/application/ProfileRules.java)
- Created: [backend/src/main/java/tr/edu/btu/mezun360/alumni/application/ProfileService.java](../backend/src/main/java/tr/edu/btu/mezun360/alumni/application/ProfileService.java)
- Created: [backend/src/main/java/tr/edu/btu/mezun360/alumni/domain/AlumniProfile.java](../backend/src/main/java/tr/edu/btu/mezun360/alumni/domain/AlumniProfile.java)
- Created: [backend/src/main/java/tr/edu/btu/mezun360/alumni/domain/Certification.java](../backend/src/main/java/tr/edu/btu/mezun360/alumni/domain/Certification.java)
- Created: [backend/src/main/java/tr/edu/btu/mezun360/alumni/domain/EducationRecord.java](../backend/src/main/java/tr/edu/btu/mezun360/alumni/domain/EducationRecord.java)
- Created: [backend/src/main/java/tr/edu/btu/mezun360/alumni/domain/EmploymentRecord.java](../backend/src/main/java/tr/edu/btu/mezun360/alumni/domain/EmploymentRecord.java)
- Created: [backend/src/main/java/tr/edu/btu/mezun360/alumni/domain/Skill.java](../backend/src/main/java/tr/edu/btu/mezun360/alumni/domain/Skill.java)
- Created: [backend/src/main/java/tr/edu/btu/mezun360/alumni/infrastructure/AlumniProfileRepository.java](../backend/src/main/java/tr/edu/btu/mezun360/alumni/infrastructure/AlumniProfileRepository.java)
- Changed: [backend/src/main/java/tr/edu/btu/mezun360/audit/application/SecurityAudit.java](../backend/src/main/java/tr/edu/btu/mezun360/audit/application/SecurityAudit.java)
- Changed: [backend/src/main/java/tr/edu/btu/mezun360/config/OpenApiConfiguration.java](../backend/src/main/java/tr/edu/btu/mezun360/config/OpenApiConfiguration.java)
- Changed: [backend/src/main/java/tr/edu/btu/mezun360/config/SecurityConfiguration.java](../backend/src/main/java/tr/edu/btu/mezun360/config/SecurityConfiguration.java)
- Changed: [backend/src/main/java/tr/edu/btu/mezun360/shared/api/ApiExceptionHandler.java](../backend/src/main/java/tr/edu/btu/mezun360/shared/api/ApiExceptionHandler.java)
- Created: [backend/src/main/java/tr/edu/btu/mezun360/shared/exception/RequestRuleException.java](../backend/src/main/java/tr/edu/btu/mezun360/shared/exception/RequestRuleException.java)
- Changed: [backend/src/main/resources/application.yml](../backend/src/main/resources/application.yml)
- Created: [backend/src/main/resources/db/migration/V0004__owner_alumni_profile.sql](../backend/src/main/resources/db/migration/V0004__owner_alumni_profile.sql)
- Changed: [backend/src/test/java/tr/edu/btu/mezun360/TechnicalFoundationTest.java](../backend/src/test/java/tr/edu/btu/mezun360/TechnicalFoundationTest.java)
- Created: [backend/src/test/java/tr/edu/btu/mezun360/alumni/ProfileIntegrationTest.java](../backend/src/test/java/tr/edu/btu/mezun360/alumni/ProfileIntegrationTest.java)
- Changed: [contracts/openapi/mezun360.yaml](../contracts/openapi/mezun360.yaml)
- Changed: [docs/api.md](../docs/api.md)
- Changed: [docs/architecture.md](../docs/architecture.md)
- Changed: [docs/database.md](../docs/database.md)
- Changed: [docs/decisions.md](../docs/decisions.md)
- Created: [docs/design/m2a-alumni-profile.md](../docs/design/m2a-alumni-profile.md)
- Created: [docs/m2a-verification.md](../docs/m2a-verification.md)
- Changed: [docs/repository-structure.md](../docs/repository-structure.md)
- Changed: [docs/requirements.md](../docs/requirements.md)
- Changed: [docs/roadmap.md](../docs/roadmap.md)
- Changed: [frontend/README.md](../frontend/README.md)
- Changed: [frontend/src/app/app.tsx](../frontend/src/app/app.tsx)
- Created: [frontend/src/features/profile/profile-api.ts](../frontend/src/features/profile/profile-api.ts)
- Created: [frontend/src/features/profile/profile-constants.ts](../frontend/src/features/profile/profile-constants.ts)
- Created: [frontend/src/features/profile/profile-editor.tsx](../frontend/src/features/profile/profile-editor.tsx)
- Created: [frontend/src/features/profile/profile-page.test.tsx](../frontend/src/features/profile/profile-page.test.tsx)
- Created: [frontend/src/features/profile/profile-page.tsx](../frontend/src/features/profile/profile-page.tsx)
- Created: [frontend/src/layouts/alumni-layout.tsx](../frontend/src/layouts/alumni-layout.tsx)
- Created: [frontend/src/layouts/alumni.css](../frontend/src/layouts/alumni.css)
- Changed: [frontend/src/lib/api/client.ts](../frontend/src/lib/api/client.ts)
- Changed: [frontend/src/lib/api/generated/schema.d.ts](../frontend/src/lib/api/generated/schema.d.ts)
- Changed: [frontend/src/routes/paths.ts](../frontend/src/routes/paths.ts)
