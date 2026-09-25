# Repository structure

Status: M1A/M1B foundations and M1C public experience exist. M2A adds the alumni/profile module and shell. Further business modules are added incrementally when authorized; empty placeholder module trees are intentionally absent.

## Current layout

```text
mezun360/
├── AGENTS.md
├── README.md
├── .editorconfig / .gitignore / .env.example
├── compose.yaml                         # PostgreSQL only, root as requested
├── .github/workflows/ci.yml              # Frontend, backend, documentation checks
├── scripts/check-docs.py / setup-dev-users.py
├── docs/
│   ├── requirements.md / decisions.md / architecture.md
│   ├── database.md / api.md / roadmap.md / repository-structure.md
│   ├── m1a-verification.md / m1b-verification.md / m1b-security.md
│   ├── m1c-verification.md
│   └── design/                        # M1A tokens and M1C public review
├── contracts/openapi/mezun360.yaml       # Health/auth/security and owner-profile contract
├── frontend/
│   ├── package.json / package-lock.json / .nvmrc / .env.example
│   ├── index.html / vite.config.ts / tsconfig.json / eslint.config.js
│   ├── components.json                  # shadcn/ui tooling configuration
│   ├── README.md
│   └── src/
│       ├── main.tsx
│       ├── app/                         # Router, Query provider, app tests
│       ├── layouts/                     # Technical root shell
│       ├── routes/paths.ts              # Future public, /app and /admin catalog
│       ├── components/product-identity.tsx # Shared text product identity
│       ├── components/ui/               # Primitives and dialog behavior test
│       ├── features/public/             # Landing, navigation, labelled preview illustrations/tests
│       ├── features/profile/            # Owner API/hooks, profile page, section dialogs and tests
│       ├── features/auth/               # Login, session identity, UX guards and tests
│       ├── dev/                         # DEV-only health/palette controls
│       ├── lib/api/                     # Fetch transport, tests, generated types
│       ├── lib/utils.ts
│       ├── services/health.ts
│       ├── styles/globals.css
│       └── test/setup.ts
├── backend/
│   ├── pom.xml / mvnw / mvnw.cmd / .mvn/wrapper/
│   ├── README.md
│   └── src/
│       ├── main/
│       │   ├── java/tr/edu/btu/mezun360/
│       │   │   ├── Mezun360Application.java
│       │   │   ├── config/              # OpenAPI and Spring Security policy
│       │   │   ├── identity/            # api/application/domain/infrastructure
│       │   │   ├── alumni/               # api/application/domain/infrastructure; owner-only
│       │   │   ├── audit/application/   # Minimal security audit service
│       │   │   ├── health/              # Controller, service, response DTO
│       │   │   └── shared/              # API errors, request IDs, exceptions
│       │   └── resources/
│       │       ├── application.yml / application-local.yml
│       │       └── db/migration/               # V0001 foundation; V0002 identity/audit; V0003 sessions; V0004 profile
│       └── test/java/tr/edu/btu/mezun360/
├── infra/README.md                      # Future deployment responsibilities
└── tests/e2e/README.md                   # Future Playwright journeys
```

Builds remain independent: Maven for backend, npm for frontend. Compose runs from the repository root. No orchestration framework or root JavaScript workspace is needed. A later Playwright package belongs in `tests/e2e/` when actual cross-system journeys exist.

## Incremental target

Backend business capabilities will follow the [module ownership table](architecture.md), using `api`, `application`, `domain` and `infrastructure` packages only as needed. Services own use cases, transactions and authorization. Cross-module DTO contracts must not expose JPA entities or repositories. Do not create interfaces for every class without a useful boundary.

Frontend features will own `api`, `components`, `pages`, `schemas` and colocated behavior tests as needed. Staff/alumni screens compose feature contracts under their eventual layouts. `app/` owns the router/providers; `routes/` owns destination constants. A path in the catalog is not an implemented page or a promise to activate future employer/survey scope.

M1B adds identity/security and minimal security audit. Full audit/outbox/notification ports are deferred until separately authorized delivery. Later capabilities include alumni, careers, mentoring, events, content, notifications, reporting and privacy. Hızlı Mentörlük remains in `mentoring`. SSO, OBS, e-Devlet, internal applications and waitlist integrations are not precreated.

Later deployment work adds frontend/backend Dockerfiles, same-origin proxy and migration-job configuration. The root Compose file is authoritative; `infra/` hosts supplementary deployment material. No Kubernetes or microservices are introduced.

## Repository hygiene

Ignore `node_modules`, `dist`, `target`, coverage, logs, IDE metadata and real `.env` files. Keep manifests/lockfiles, wrappers, migrations, reviewed contracts and generated transport types under version control. CI checks type generation drift. No build artifact, local secret or real alumni record belongs in Git.

The [decision register](decisions.md) owns accepted choices and institutional inputs. The [roadmap](roadmap.md) owns delivery scope. The [root README](../README.md) owns executable setup instructions; avoid copying those commands into multiple module documents.
