# M1A technical foundation — completion report

Date: 2026-09-23. Repository: `/Users/hilalkaya/Desktop/mezun360`. Branch: `codex/m1a-technical-foundation`. No commits or pushes were made. The repository had no initial commit; pre-existing architecture files and the new foundation remain untracked until the user chooses to commit.

## Implemented scope

- React/TypeScript/Vite application with Router, Query provider, future route catalog, placeholder/not-found shell, environment-based JSON API transport and generated OpenAPI types.
- Barlow and the requested palette, shared typography/spacing/radius tokens, accessible button/input/label/card/badge/dialog/loading primitives, and shadcn/ui configuration. Recharts is installed for future real metrics; no chart fixture or hardcoded dashboard metric was added.
- Development-only connection/palette page, excluded from production JavaScript. It calls the real backend through Vite's same-origin proxy.
- Java 21 Spring Boot modular monolith bootstrap, thin health controller/service/DTO, server-issued request IDs, centralized safe RFC 9457 errors and Bean Validation foundation. No Spring Security/authentication or business modules.
- Root PostgreSQL-only Compose, environment examples, Flyway-owned technical schema, JPA validation and local-only OpenAPI documentation by default.
- JUnit 5/Mockito/Testcontainers and Vitest baseline tests, contract-drift checks, CI configuration, reproducible setup and Markdown validation.

## Verified toolchain

| Area | Selected / exercised |
| --- | --- |
| Java | Temurin 21.0.12.1; compiler/enforcer require major 21 |
| Backend | Spring Boot 3.5.16; springdoc 2.8.17; JUnit 5/Mockito from Boot's dependency management |
| Maven | Wrapper 3.3.4, Maven 3.9.16 distribution with pinned SHA-256 |
| Database/tests | PostgreSQL `17.9-alpine`; Testcontainers 2.0.5 |
| Local containers | Docker Engine 29.5.3, Compose 5.1.4 |
| JavaScript runtime | Node 24.21.0, npm 11.19.0 |
| Frontend | React 19.3.0, Vite 8.3.0, TypeScript 5.9.3, Tailwind 4.3.3 |
| Frontend infrastructure | Router 7.18.4, TanStack Query 5.103.2, Recharts 3.10.1 |
| Frontend validation | Vitest 5.0.1, ESLint 10.11.0, openapi-typescript 7.13.0 |

Exact frontend direct/transitive versions are pinned in `package.json`/`package-lock.json`; backend compatible transitive versions come from the pinned Boot/Testcontainers BOMs. Spring Boot 3.5 preserves the requested JUnit 5 baseline. TypeScript 5.9 satisfies both the OpenAPI generator and lint tooling peer ranges.

This workstation originally defaulted to Java 24 and Node 26. Verified official portable tools were downloaded outside the repository without changing global defaults. To reuse them on this workstation:

```sh
export JAVA_HOME="$HOME/Library/Caches/mezun360-tools/jdk-21.0.12.1+1/Contents/Home"
export PATH="$JAVA_HOME/bin:$HOME/Library/Caches/mezun360-tools/node-v24.21.0-darwin-arm64/bin:$PATH"
```

Other developers should install their own JDK 21/Node 24 and follow the portable [root README](../README.md).

## Commands actually executed and results

Commands below ran from the indicated directory with the selected toolchain. Failed intermediate attempts were fixed and relevant commands rerun; final results follow.

| Directory | Command / check | Result |
| --- | --- | --- |
| Root | `docker desktop start`, `docker info`, `docker compose version` | Docker started and versions checked |
| Root | `docker compose up -d --wait` | PostgreSQL healthy; development volume preserved |
| Backend | `mvn -B wrapper:wrapper -Dmaven=3.9.16 -Dtype=only-script` | Official Maven Wrapper generated; distribution checksum pinned afterward |
| Backend | `./mvnw -B -ntp test` | **12 tests passed**, zero failures/errors/skips |
| Backend | `./mvnw -B -ntp verify` | **12 tests passed**; executable jar built successfully |
| Backend | `./mvnw -B -ntp -Dspring.config.import=optional:file:/tmp/mezun360-absent-ci-env.properties test` | **12 tests passed** without relying on local `.env`, matching fresh-checkout CI conditions |
| Backend | `./mvnw -B -ntp spring-boot:run` | Started on loopback port 8080 with local profile |
| Frontend | `npm install`, then clean `npm ci` | Lockfile installation succeeded; npm reported zero vulnerabilities at execution time |
| Frontend | `npm run api:generate`, `npm run api:check` | Contract types generated and confirmed current |
| Frontend | `npm run test` | **14 tests passed** in 3 files |
| Frontend | `npm run lint` | Passed without lint warnings/errors |
| Frontend | `npm run build` | Strict TypeScript check and Vite production build passed |
| Frontend | `npm run dev`, restarted as `npm run dev -- --force` after reinstall | Vite running on loopback port 5173 |
| Root | `curl` direct and proxied `/api/v1/health` | Both returned 200 and only `{status: "UP", service: "mezun360-api"}` |
| Root | `curl` `/v3/api-docs` and `/swagger-ui/index.html` | Both returned 200 with local profile |
| Root | Compose `psql` queries against history/information schema | Version `0001` successful; only `flyway_schema_history` in the application schema |
| Root | Stop only the new project's PostgreSQL service; repeat proxied health; restart with `docker compose up -d --wait` | Real dependency failure returned sanitized 503; recovery returned 200; database left healthy |
| Browser | Technical page at normal width and 390 × 844 | Real connection displayed; Barlow rendered; no horizontal overflow at 390 px |
| Browser | Open dialog, Escape | Accessible title/description, close focus, focus restored to trigger |
| Browser | Retry while PostgreSQL stopped; reopen after restart | Loading/error text and safe code/trace observed; connection recovered |
| Root | Production JavaScript content check | No development route, query key or connection-page content in the bundle |
| Root | `python3 scripts/check-docs.py`, `git diff --check` | **Passed**: 15 Markdown files, 151 local links, balanced fences, fenced JSON and whitespace; Git whitespace check passed (untracked files additionally checked directly) |

The backend suite covers Spring context, real PostgreSQL health, empty domain schema, migration validation/re-execution, OpenAPI path/status/schema agreement, missing routes, forged trace-header replacement, lack of wildcard CORS, payload/unknown-field/malformed JSON errors, safe unexpected failures, 503 handling and retained `Allow` headers. Frontend tests cover routing, JSON verbs, configured transport, problem/network/invalid-response/cancellation handling, 204 responses and accessible dialog behavior.

Additional format checks passed: four JSON files, Maven XML, Compose configuration and source whitespace (upstream Maven Wrapper formatting preserved). Credential/build/dependency paths were confirmed ignored by Git.

CI was added but no remote CI run was triggered because this task prohibits pushing. There are no implemented product journeys to exercise in a repository Playwright suite yet; current browser checks used the configured browser tooling. This is not production security or full product accessibility certification.

## Database and migration state

Flyway creates the `mezun360` schema/history and applies `V0001__foundation_schema.sql`. The SQL adds only the schema/comment; the history contains Flyway's own schema-creation record and successful version `0001`. No account, role, session, profile, job, mentorship, event, notification, audit or outbox table exists. Hibernate uses `ddl-auto=validate`; automatic SQL initialization is disabled. Migration checksum validation/re-execution and a backend restart both confirmed that the schema was already up to date.

Credentials are in the ignored local `.env`, generated for this development database. No password is included in this report. The container volume was not deleted during failure/recovery checks.

## Local URLs and final state

Frontend, backend and PostgreSQL are left running locally:

- [Technical controls](http://127.0.0.1:5173/__dev/foundation)
- [Frontend placeholder](http://127.0.0.1:5173/)
- [Backend health](http://127.0.0.1:8080/api/v1/health)
- [Swagger UI](http://127.0.0.1:8080/swagger-ui/index.html)

Use Ctrl-C in the relevant server terminal to stop a host process and `docker compose stop` to stop the database without deleting its data. Tool-managed processes may need restarting in a later app session using the README commands.

## Adjustments, fixes and remaining scope

Authorized architecture refinements are recorded in [decisions](decisions.md): root Compose rather than `infra/compose.yaml`, `/app/*` rather than the proposed `/alumni/*`, versioned `/api/v1/health`, M1A/M1B split and schema-only migration. The modular monolith, requested technologies and settled privacy/security product decisions are preserved.

Installation/verification uncovered and resolved:

- TypeScript 7 was outside supported OpenAPI/lint peer ranges; pinned 5.9.3 without bypassing dependency checks.
- A transient Docker registry 502 and a slow JDK download; retried official downloads, keeping TLS verification enabled.
- Uppercase profile selection in imported `.env` needed explicit Spring configuration binding; local OpenAPI was then verified live.
- An OpenAPI comparison initially treated required-field ordering as significant; corrected to compare sets, then passed schema checks.
- Reinstalling dependencies while Vite was running invalidated its prebundled dependency hashes; restarted with `--force` and verified the rendered application.

No unresolved M1A blocker remains. The Figma Make preview is accessible; exact immutable revision, complete responsive/state mapping and provisional spacing/radii remain later visual-design work, as recorded in the [design evidence](design/m1a-foundation.md). No complete Figma product page has been implemented.

The repository is ready for a separately authorized **M1B – Authentication & Security**. M1B must add actual server-side security, validated identity flows, password hashing, sessions/CSRF, production staff MFA, controlled provisioning and security tests before protected data/features are introduced. No M1B implementation was started automatically.

Remaining BTÜ policy inputs are still I-01–I-05 in the [decision register](decisions.md): staff/MFA/recovery/audit authority; authoritative alumni evidence; privacy/retention/disclosure policy; hosting/email/recovery ownership; editorial/job/event/mentor workflow rules. No legal retention duration has been invented.

## Files created or changed

The following inventory covers all delivered source/configuration/documentation files added or edited in this task. The pre-existing `tests/e2e/README.md` was left unchanged. Dependencies, build artifacts, logs and ignored local credentials are excluded.

- [.editorconfig](../.editorconfig)
- [.env.example](../.env.example)
- [.github/workflows/ci.yml](../.github/workflows/ci.yml)
- [.gitignore](../.gitignore)
- [AGENTS.md](../AGENTS.md)
- [README.md](../README.md)
- [backend/.mvn/wrapper/maven-wrapper.properties](../backend/.mvn/wrapper/maven-wrapper.properties)
- [backend/README.md](../backend/README.md)
- [backend/mvnw](../backend/mvnw)
- [backend/mvnw.cmd](../backend/mvnw.cmd)
- [backend/pom.xml](../backend/pom.xml)
- [backend/src/main/java/tr/edu/btu/mezun360/Mezun360Application.java](../backend/src/main/java/tr/edu/btu/mezun360/Mezun360Application.java)
- [backend/src/main/java/tr/edu/btu/mezun360/config/OpenApiConfiguration.java](../backend/src/main/java/tr/edu/btu/mezun360/config/OpenApiConfiguration.java)
- [backend/src/main/java/tr/edu/btu/mezun360/health/HealthController.java](../backend/src/main/java/tr/edu/btu/mezun360/health/HealthController.java)
- [backend/src/main/java/tr/edu/btu/mezun360/health/HealthResponse.java](../backend/src/main/java/tr/edu/btu/mezun360/health/HealthResponse.java)
- [backend/src/main/java/tr/edu/btu/mezun360/health/HealthService.java](../backend/src/main/java/tr/edu/btu/mezun360/health/HealthService.java)
- [backend/src/main/java/tr/edu/btu/mezun360/shared/api/ApiExceptionHandler.java](../backend/src/main/java/tr/edu/btu/mezun360/shared/api/ApiExceptionHandler.java)
- [backend/src/main/java/tr/edu/btu/mezun360/shared/api/ApiProblem.java](../backend/src/main/java/tr/edu/btu/mezun360/shared/api/ApiProblem.java)
- [backend/src/main/java/tr/edu/btu/mezun360/shared/api/FieldViolation.java](../backend/src/main/java/tr/edu/btu/mezun360/shared/api/FieldViolation.java)
- [backend/src/main/java/tr/edu/btu/mezun360/shared/api/RequestIdFilter.java](../backend/src/main/java/tr/edu/btu/mezun360/shared/api/RequestIdFilter.java)
- [backend/src/main/java/tr/edu/btu/mezun360/shared/exception/ResourceNotFoundException.java](../backend/src/main/java/tr/edu/btu/mezun360/shared/exception/ResourceNotFoundException.java)
- [backend/src/main/java/tr/edu/btu/mezun360/shared/exception/ServiceUnavailableException.java](../backend/src/main/java/tr/edu/btu/mezun360/shared/exception/ServiceUnavailableException.java)
- [backend/src/main/resources/application-local.yml](../backend/src/main/resources/application-local.yml)
- [backend/src/main/resources/application.yml](../backend/src/main/resources/application.yml)
- [backend/src/main/resources/db/migration/V0001__foundation_schema.sql](../backend/src/main/resources/db/migration/V0001__foundation_schema.sql)
- [backend/src/test/java/tr/edu/btu/mezun360/TechnicalFoundationTest.java](../backend/src/test/java/tr/edu/btu/mezun360/TechnicalFoundationTest.java)
- [backend/src/test/java/tr/edu/btu/mezun360/health/HealthServiceTest.java](../backend/src/test/java/tr/edu/btu/mezun360/health/HealthServiceTest.java)
- [backend/src/test/java/tr/edu/btu/mezun360/shared/api/ApiExceptionHandlerTest.java](../backend/src/test/java/tr/edu/btu/mezun360/shared/api/ApiExceptionHandlerTest.java)
- [compose.yaml](../compose.yaml)
- [contracts/openapi/mezun360.yaml](../contracts/openapi/mezun360.yaml)
- [docs/api.md](../docs/api.md)
- [docs/architecture.md](../docs/architecture.md)
- [docs/database.md](../docs/database.md)
- [docs/decisions.md](../docs/decisions.md)
- [docs/design/m1a-foundation.md](../docs/design/m1a-foundation.md)
- [docs/m1a-verification.md](../docs/m1a-verification.md)
- [docs/repository-structure.md](../docs/repository-structure.md)
- [docs/requirements.md](../docs/requirements.md)
- [docs/roadmap.md](../docs/roadmap.md)
- [frontend/.env.example](../frontend/.env.example)
- [frontend/.nvmrc](../frontend/.nvmrc)
- [frontend/README.md](../frontend/README.md)
- [frontend/components.json](../frontend/components.json)
- [frontend/eslint.config.js](../frontend/eslint.config.js)
- [frontend/index.html](../frontend/index.html)
- [frontend/package-lock.json](../frontend/package-lock.json)
- [frontend/package.json](../frontend/package.json)
- [frontend/src/app/app.test.tsx](../frontend/src/app/app.test.tsx)
- [frontend/src/app/app.tsx](../frontend/src/app/app.tsx)
- [frontend/src/app/providers.tsx](../frontend/src/app/providers.tsx)
- [frontend/src/components/ui/badge.tsx](../frontend/src/components/ui/badge.tsx)
- [frontend/src/components/ui/button.tsx](../frontend/src/components/ui/button.tsx)
- [frontend/src/components/ui/card.tsx](../frontend/src/components/ui/card.tsx)
- [frontend/src/components/ui/dialog.test.tsx](../frontend/src/components/ui/dialog.test.tsx)
- [frontend/src/components/ui/dialog.tsx](../frontend/src/components/ui/dialog.tsx)
- [frontend/src/components/ui/input.tsx](../frontend/src/components/ui/input.tsx)
- [frontend/src/components/ui/loading.tsx](../frontend/src/components/ui/loading.tsx)
- [frontend/src/dev/foundation-page.tsx](../frontend/src/dev/foundation-page.tsx)
- [frontend/src/layouts/root-layout.tsx](../frontend/src/layouts/root-layout.tsx)
- [frontend/src/lib/api/client.test.ts](../frontend/src/lib/api/client.test.ts)
- [frontend/src/lib/api/client.ts](../frontend/src/lib/api/client.ts)
- [frontend/src/lib/api/generated/schema.d.ts](../frontend/src/lib/api/generated/schema.d.ts)
- [frontend/src/lib/api/index.ts](../frontend/src/lib/api/index.ts)
- [frontend/src/lib/utils.ts](../frontend/src/lib/utils.ts)
- [frontend/src/main.tsx](../frontend/src/main.tsx)
- [frontend/src/routes/paths.ts](../frontend/src/routes/paths.ts)
- [frontend/src/services/health.ts](../frontend/src/services/health.ts)
- [frontend/src/styles/globals.css](../frontend/src/styles/globals.css)
- [frontend/src/test/setup.ts](../frontend/src/test/setup.ts)
- [frontend/tsconfig.json](../frontend/tsconfig.json)
- [frontend/vite.config.ts](../frontend/vite.config.ts)
- [infra/README.md](../infra/README.md)
- [scripts/check-docs.py](../scripts/check-docs.py)
