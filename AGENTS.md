# BTÜ Mezun360 — repository instructions

## Current phase

The user has explicitly authorized **M2A – Alumni Profile**: owner-only professional profile, career/education/skills/certifications/contribution preferences, completion and the alumni shell. Preserve M1A/M1B/M1C security and regressions. No directory, visibility settings, verification workflow, notifications, admin inspection, integrations or other business modules. Do not start M2B, commit or push. Profile writes include transactional minimal audit; outbox remains deferred because no notification/event consumers are authorized.

Read [decisions](docs/decisions.md), [requirements](docs/requirements.md), [architecture](docs/architecture.md), [database](docs/database.md), [API](docs/api.md), [repository structure](docs/repository-structure.md) and [roadmap](docs/roadmap.md) before making changes. Keep these documents consistent. The user's finalized decisions supersede the earlier open alternatives; remaining institutional inputs are recorded only in the decision register.

## Product and design

- BTÜ Mezun360 connects Bursa Technical University alumni with career opportunities, mentors, events and the university career center.
- MVP experiences: Alumni and Career Center / Admin. Roles: `GUEST`, `ALUMNI`, `ADMIN`. `GUEST` represents an unauthenticated visitor, not a persisted role. `EMPLOYER` is future scope; do not enable its registration, permissions or dashboard in the MVP.
- The [Figma Make design](https://www.figma.com/make/7AqVYRogPUjTclUHbML9IW/Finalize-Mezun360-Design) is the UI source of truth. Record the reviewed revision and screen mapping before UI implementation. Do not invent visual specifications or claim to have reviewed inaccessible screens.
- See the design-access evidence in requirements before claiming a Figma screen was reviewed. Confirmed product decisions come from the user, not inferred mockup behavior.
- MVP authentication is local email/password with server-side secure HttpOnly cookie sessions. Future BTÜ SSO and OBS use adapter boundaries only; e-Devlet is future roadmap. ADMIN MFA is mandatory in production and may be disabled only in explicit local development.
- Alumni verification is `PENDING`, `VERIFIED`, `REJECTED`. Mentorship is `REQUESTED`, `ACCEPTED`, `REJECTED`, `CANCELLED`, `COMPLETED`; Hızlı Mentörlük is a session type in the same module.
- Jobs support both application-mode concepts; MVP serves `EXTERNAL_APPLICATION`. Internal submission/review is future scope. Guest content is limited to landing/platform information and selected published university announcements/news.

## Agreed technology

- Frontend: React, TypeScript, Vite, React Router, TanStack Query, Tailwind CSS, shadcn/ui, Recharts.
- Backend: Java 21, Spring Boot, Spring Security, Spring Data JPA, Bean Validation, OpenAPI.
- Persistence: PostgreSQL and Flyway. Infrastructure: Docker Compose.
- Tests: JUnit 5, Mockito, Testcontainers, Vitest, Playwright.
- Build tools: Maven Wrapper and npm with a lockfile. Current versions and verification are in the M1A report. Keep Java 21/JUnit 5 and mutually compatible dependencies; do not silently replace the requested stack. Spring Security/session/MFA are M1B work, not present in the M1A artifact.

## Mandatory security and privacy rules

1. Never expose personal alumni contact data publicly. Default profiles to private; the optional authenticated directory also excludes contact details. Enforce field allowlists on the server.
2. A user must never promote themselves to `ADMIN`. Public registration, profile updates, verification requests, imports and client-provided claims must not set roles or privileged fields. There is no MVP HTTP role-management endpoint.
3. Protect admin routes through Spring Security on the server and enforce permissions and ownership in services. UI route guards are only navigation aids. Deny access by default.
4. Check current account status and alumni verification for protected actions. Treat UUIDs as identifiers, never as authorization.
5. Never store or log plaintext passwords. Use a maintained adaptive password encoder. Never log password hashes, reset tokens, session IDs, authorization headers or sensitive request bodies.
6. Use server-side sessions, secure cookies and CSRF protection according to the authentication design. Never place authentication tokens in browser local storage. Only ADMIN MFA has the explicit local-development opt-out; never use that opt-out in production or disable authorization/CSRF for a demo.
7. Do not commit credentials, real alumni records or production exports. All examples and test data must be synthetic.
8. Restrict and audit administrator access to private data. Do not add public contact search, bulk exports or automatic employer access.
9. Profile/directory visibility is owner-controlled and defaults private; personal email, phone and detailed contact data stay hidden. Future employer visibility must be separately opted into and has no active access effect in MVP.

## Implementation rules for the authorized implementation phase

- Controllers translate HTTP requests and responses. Business rules, ownership checks and transaction boundaries live in service classes. Controllers never call repositories directly.
- Use explicit request/response DTOs. Never serialize JPA entities as API responses or bind requests directly to entities. Use allowlisted mapping; reject unknown request properties.
- Validate every request payload, nested payload, path and query input, with Bean Validation plus service-level business validation. Use parameterized persistence queries.
- Organize by business module. Communicate through another module's service contract or domain events; do not use its repositories or entities directly.
- Every database structure change, index, constraint and shared reference-data change goes through Flyway. Use Hibernate schema validation, never schema create/update in deployed environments. Disable competing automatic schema initializers, including session schema initialization.
- Do not hardcode dashboard metrics in production. Compute aggregates from authorized persisted data; display genuine zero, empty, suppressed and error states distinctly. Keep mock data outside production bundles.
- Use RFC 9457 problem responses, bounded pagination, explicit state transitions and optimistic/concurrency controls as documented.
- Write durable audit and outbox records in the same transaction as the business mutation. Make asynchronous handlers retryable and idempotent.
- Never put secrets in frontend environment variables. Never let build-time frontend variables contain privileged credentials.
- Keep notification ports/provider adapters independent of commercial services; channels are `IN_APP` and `EMAIL`. Mock/log senders are local-development tools and must not log credentials, tokens or private content.
- Keep Docker/Compose as the local/deployment foundation. Do not introduce Kubernetes or microservices. Preserve a simple future waitlist seam without implementing a waitlist in MVP.
- Retention periods are configurable policy values: “TBD – to be defined by Bursa Technical University according to institutional policy and applicable KVKK requirements.” Do not invent durations or run unconfigured age-based deletion.

## Verification and delivery

- Add meaningful tests for important business rules, forbidden role changes, object ownership, contact privacy, CSRF, migrations, concurrent capacity limits and notification deduplication.
- Use Testcontainers with PostgreSQL for database behavior; an in-memory substitute does not verify PostgreSQL constraints or Flyway migrations.
- Use Vitest for frontend behavior and Playwright for full Alumni/Admin journeys and Figma review once accessible. Keep tests deterministic; inject clocks and use isolated synthetic data.
- Run the checks relevant to a change and report what ran. For documentation-only work, check links, consistency and whitespace; do not claim application tests passed when no application exists.
- Update the API contract and documentation alongside behavior changes. Document migration/backfill and rollback considerations in relevant reviews.
- Preserve unrelated user changes. Never deploy or start a later milestone merely because a roadmap exists.
- For M2A, do not commit or push. Do not proceed to M2B automatically.
