# Architecture decisions

Status: accepted product decisions from the user's follow-up on 2026-09-22. This record supersedes the open alternatives in the initial foundation. The subsequent requests authorize M1A, M1B authentication/security and M1C public experience. The subsequent M2A request authorizes owner-only profiles. Other business features, commits and pushes remain unauthorized. Detailed contracts remain in their owning documents; [roadmap](roadmap.md) maps delivery to milestones.

## Accepted decisions

| ID | Decision | Consequence and owning document |
| --- | --- | --- |
| D-02 | Local email/password authentication for MVP, securely hashed passwords, server-side authorization and secure HttpOnly cookie sessions | Preserve PostgreSQL-backed sessions, CSRF and current-account checks. BTÜ SSO is a future identity adapter; e-Devlet is roadmap-only. ADMIN MFA is mandatory in production and may be disabled only in explicit local development. See [architecture](architecture.md). |
| D-03 | Alumni verification states are exactly `PENDING`, `VERIFIED`, `REJECTED`; authorized ADMIN users make MVP decisions | Keep email verification separate. An institutional verification port admits a future BTÜ OBS adapter without replacing the workflow; no OBS integration in MVP. See [database](database.md). |
| D-04 | Job model supports `EXTERNAL_APPLICATION` and `INTERNAL_APPLICATION`; MVP delivers external applications | Validate external URLs. Internal submission/review/storage and completed-application metrics are deferred. Outbound navigation is never proof of an application. See [API](api.md). |
| D-05 | Opt-in alumni directory, owner-controlled visibility and hidden personal contact data | No anonymous profiles. Employer visibility remains owner-controlled and defaults off, but grants no access while EMPLOYER is future-only. ADMIN private-data reads are auditable. See [requirements](requirements.md). |
| D-06 | Retention periods require BTÜ policy; they must be configurable, never invented or hard-coded | Each category has the exact unresolved policy statement below; technical credential expiry is a separate security setting. See [database](database.md). |
| D-07 | Provider-neutral modular monolith using Docker and Docker Compose for local/deployment foundations | Keep React/TypeScript, Java 21/Spring Boot, PostgreSQL and Flyway plus the rest of the agreed stack. No microservices, Kubernetes or mandatory commercial cloud/email dependency. See [architecture](architecture.md). |
| D-08 | Mentorship uses `REQUESTED`, `ACCEPTED`, `REJECTED`, `CANCELLED`, `COMPLETED`, explicit mentor opt-in and structured requests | Topic, message, preferred meeting method/time and server-managed status belong to one workflow. `QUICK` (Hızlı Mentörlük) is a session type, not another subsystem. Events retain capacity, registration, cancellation and attendance with a future waitlist extension seam only. See [database](database.md). |
| D-09 | Guests can access landing/platform information and selected university announcements/news | Directory, profiles, contacts, analytics and admin functionality require appropriate authenticated access. MVP job/event content remains member-only. Add a small content module for staff-managed publications, not a general CMS. See [requirements](requirements.md). |
| D-10 | Notifications are provider-independent, with `IN_APP` and `EMAIL` channels | Preserve the durable outbox and retry/deduplication design. Use a mock/log or local mail-sink adapter in development; do not select a commercial provider. See [architecture](architecture.md). |

D-01 remains the design-review dependency: the supplied [Figma Make file](https://www.figma.com/make/7AqVYRogPUjTclUHbML9IW/Finalize-Mezun360-Design?fullscreen=1) is authoritative for UI. Its access/review evidence is recorded in [requirements](requirements.md). It does not reopen the accepted product decisions above.

The existing safeguards remain binding: `GUEST` is an unauthenticated context; persisted MVP roles are `ALUMNI` and `ADMIN`; `EMPLOYER` is future-only; users cannot promote themselves; no MVP HTTP role-grant endpoint; server-side authorization, DTOs, validation, service-layer business logic, Flyway and important-rule tests are required. Keep the existing one-role-per-account baseline; additional authority models are not an MVP prerequisite.

## Institutional inputs still required

These are operational or policy details, not requests to reconfirm the architecture.

| ID | BTÜ input | Needed before |
| --- | --- | --- |
| I-01 | Staff roster and provisioning approver; approved MFA/recovery and break-glass policy; audit reviewers and permitted private-data access purposes | Production staff onboarding; policy wired through the M1B security design |
| I-02 | Authoritative graduation evidence, departments/degrees, manual review ownership and handling of disputed or changed records | M2 verification acceptance; OBS connection details only if future integration is separately authorized |
| I-03 | Privacy notices/purposes, consent wording, retention/deletion exceptions by category, permitted professional fields and aggregate disclosure thresholds/filters | Production personal-data processing and M5 privacy/reporting acceptance |
| I-04 | Deployment environment and responsible team, domain/TLS, delivery domain/SMTP or provider credentials, key/secret ownership, backup/recovery and availability/scale targets | M6 release readiness; platform selection remains vendor-neutral |
| I-05 | University publication source/editorial authority, which announcements/news may be public, permitted job destination policy, event cutoffs/attendance rules, mentor session/capacity policy | Relevant M3–M5 workflow acceptance |

For every legal/institutional retention duration, the policy value is:

> TBD – to be defined by Bursa Technical University according to institutional policy and applicable KVKK requirements.

Do not substitute a guessed day/month/year value. Retention processing must consume versioned category policies and decline automatic age-based deletion where the policy is unset. Technical session/token expiration and retry leases protect the system; they do not establish legal retention periods.

## Engineering follow-through, not additional BTÜ decisions

Select compatible dependency versions and a maintained local MFA library; finalize validated DTO bounds, session-security settings and module interfaces during authorized implementation. Review Figma screens and complete missing state designs. These are implementation/design tasks, not reasons to reopen local authentication, external-first jobs, opt-in privacy or the modular monolith.

Future work stays separate: BTÜ SSO, e-Devlet, OBS integration, internal applications, employer accounts and active event waitlists require their own scope authorization. Their boundaries are documented now; no integration or feature is being built in this change.

## M1A execution decisions — 2026-09-23

These apply the explicit technical-foundation request without reopening D-02–D-10:

- Root `compose.yaml` supersedes the proposed `infra/compose.yaml` location. M1A runs only PostgreSQL; host processes run frontend/backend. Deployment images/proxy/migrator remain later work.
- The alumni SPA prefix is `/app/*`, superseding the earlier `/alumni/*` proposal. `routes/paths.ts` catalogs requested destinations; it neither registers product pages nor enables future employer/survey scope.
- `GET /api/v1/health` preserves the existing API version prefix rather than the illustrative `/api/health` in the request. It checks database readiness and discloses only status/service.
- M1 splits into M1A technical foundation and M1B authentication/security (including previously planned audit/outbox and provider ports). No login, role model, session, business table or security mock is introduced in M1A.
- Maven Wrapper/npm/OpenAPI-generated types are adopted. The [verification report](m1a-verification.md) records compatible versions and actual results. TypeScript 5.9 keeps the OpenAPI generator and lint tooling within supported peer ranges.
- The migration establishes only the technical schema; Flyway creates/validates its history. Hibernate never creates/updates schema.

These are authorized engineering choices, not additional BTÜ policy questions. Remaining institutional inputs stay in I-01–I-05 above.

## M1B execution decisions — 2026-09-24

The latest M1B request supersedes the broader original M1B roadmap. Implement local authentication/security, minimal audit and safe development users now. Full MFA enrollment/recovery/operator provisioning, registration/reset/email delivery and notification/outbox processing are deferred; production fails closed until real MFA is available. This is an explicit scope refinement, not a claim that production security delivery is complete.

- Spring Security 6.5.11, Spring Session JDBC 3.5.7 and Bouncy Castle 1.86 support Java 21 / Boot 3.5.16. Argon2id parameters and operational limits are recorded in [M1B security](m1b-security.md).
- GET `/auth/me` replaces the earlier `/auth/session` proposal; anonymous responses are 401. Login returns only completion/MFA-stage flags, then the frontend obtains identity from `/auth/me`.
- Persist ALUMNI/ADMIN and the existing four account states. Do not introduce DISABLED or alumni-verification placeholder tables.
- TOTP is the intended future local MFA factor; no factor adapter or production-ready bypass exists. The production startup guard rejects the missing implementation even when MFA is marked required.
- Process-local bounded login limits are appropriate for this local single-instance foundation. Shared enforcement and target-environment load validation remain production prerequisites.
- No institutional policy input is invented. I-01–I-05 remain the sole institutional decision register.

## M1C execution decisions — 2026-09-24

M1C adds a frontend public landing and authentication experience polish while retaining the M1B security architecture unchanged. Root stays public for all visitors; existing sessions receive an account-entry link rather than a forced redirect. `/login` keeps its role-based redirect and no public admin choice is exposed.

The explicit M1C request authorizes labelled static product-preview compositions on the public site. These are explanatory illustrations of planned features, not dashboard metrics, personal records or business functionality. Text identity is used because no official university logo asset was available. Legal/contact placeholders remain inactive, and the password-reset control is visibly disabled with Yakında. The direct informational reset route is retained for compatibility. No new API, migration, library dependency, role or portal is introduced. Design evidence and layout differences are recorded in [the M1C design review](design/m1c-public-experience.md).

## M2A execution decisions — 2026-09-25

The explicit M2A request authorizes the first business module: owner-only profiles and their professional history, normalized skills, certifications, preferences and server completion. UserAccount remains separate. No verification, privacy settings, directory or admin inspection is activated.

Use aggregate GET/PUT `/me/profile` with strong ETag/If-Match, including an explicit empty onboarding representation. This replaces the earlier unimplemented separate education/employment route proposal; see [API](api.md) for the single authoritative contract. Preserve the documented `employment_records` table name. Contribution flags live on the profile rather than a separate one-to-one table. Education source is server-owned USER_ENTERED, not institutional verification; department remains bounded self-reported text pending BTÜ reference data in I-02.

No notification workflow is in scope, so the existing minimal audit writer records profile updates transactionally without creating an unused outbox. Supporting outbox delivery stays separately authorized work before a consumer needs events. Existing local-only demo accounts are sufficient; no automatic profile fixture/bootstrap is necessary. [Design evidence](design/m2a-alumni-profile.md) records intentional adjustments from prototype comma fields and contact data to the user's explicit brief.
