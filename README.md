# BTÜ Mezun360

Alumni and career ecosystem for Bursa Technical University.

**M1A technical foundation, M1B local authentication/security and M1C public landing experience are implemented. Alumni business features remain deferred. Production startup is blocked until real ADMIN MFA is delivered.** This is a local development foundation, not a production release.

One React/TypeScript SPA, one Java 21 Spring Boot modular monolith, PostgreSQL and Flyway. The [Figma Make design](https://www.figma.com/make/7AqVYRogPUjTclUHbML9IW/Finalize-Mezun360-Design?fullscreen=1) remains the UI source of truth; the current interface contains a responsive public landing, login and guarded alumni/admin placeholders. See [M1C verification](docs/m1c-verification.md), [M1C design review](docs/design/m1c-public-experience.md), [M1B verification](docs/m1b-verification.md), [security/runbook](docs/m1b-security.md), [M1A verification](docs/m1a-verification.md) and [design evidence](docs/design/m1a-foundation.md).

## Prerequisites

- JDK **21**; set `JAVA_HOME` to that installation. Maven Enforcer rejects other Java majors. A global Maven installation is unnecessary: the wrapper downloads Maven 3.9.16.
- Node.js **24 LTS** and its npm. `frontend/.nvmrc` selects major 24; run `nvm use` in `frontend/` if you use nvm.
- Docker Engine/Desktop running, with Docker Compose v2 or newer. Backend integration tests also require Docker; they create isolated PostgreSQL containers rather than using the development database.
- Git; Python 3.10+ for documentation checks. First setup needs network access for dependencies and container images.

Check `java -version`, `node --version`, `npm --version`, `docker info` and `docker compose version` before starting. On macOS with a registered JDK 21, select it with `export JAVA_HOME=$(/usr/libexec/java_home -v 21)`.

## First setup and database

From your checkout root (only copy examples on first setup; preserve an existing `.env`):

```sh
cp .env.example .env
cp frontend/.env.example frontend/.env
```

Set `POSTGRES_PASSWORD` in the root `.env` to a locally generated password. Do not use the placeholder for a shared environment or commit this file. Compose and the backend use the same root file. Frontend variables are public build inputs and must never contain secrets.

```sh
docker compose up -d --wait
docker compose ps
```

Compose starts only PostgreSQL 17.9. Its port is bound to `127.0.0.1`, and its data persists in the `mezun360_postgres_data` volume. Stop with `docker compose stop`; `docker compose down` also preserves the named volume. Changing a password in `.env` does not alter credentials inside an already initialized database; update that database deliberately rather than deleting a volume containing useful data.

## Start the backend

In a terminal, from the checkout root:

```sh
cd backend
./mvnw spring-boot:run
```

On Windows use `mvnw.cmd`. The backend imports `../.env` when launched from `backend/`; OS environment variables override file values. The example enables the `local` profile, which exposes OpenAPI documentation. Without it, API docs are disabled by default. Flyway runs before JPA schema validation. M1B adds identity, minimal audit and JDBC session tables through Flyway; no business tables.

## Local login setup

In root `.env`, use only `SPRING_PROFILES_ACTIVE=local` and explicitly set `DEV_USERS_ENABLED=true`. Then run:

```sh
python3 scripts/setup-dev-users.py
```

Restart the backend. Read the generated DEV_ALUMNI_EMAIL/PASSWORD and DEV_ADMIN_EMAIL/PASSWORD locally from the ignored `.env`; credentials are random and never printed by the script. Existing users/passwords are preserved, never promoted or reset. ALUMNI logs into `/app`, ADMIN into `/admin`; both have real logout. There is no public registration or password-reset delivery yet.

The local profile uses a HttpOnly SameSite=Lax cookie over loopback HTTP and may disable ADMIN MFA. Every non-local startup refuses missing real MFA or unsafe cookie/seed settings. Production requires HTTPS, a Secure `__Host-` cookie and actual MFA; using the local profile in production is forbidden. See [security configuration, limits and remaining work](docs/m1b-security.md).

## Start the frontend

In another terminal, from the checkout root:

```sh
cd frontend
npm ci
npm run dev
```

Open [the technical page](http://127.0.0.1:5173/__dev/foundation) to check the real API connection, palette and accessible primitives. It is excluded from production JavaScript. Start at [the public landing](http://127.0.0.1:5173/) and choose Giriş Yap after local demo setup above. `/app` and `/admin` are guarded placeholders; future business paths remain absent.

| Local URL | Purpose |
| --- | --- |
| [Frontend](http://127.0.0.1:5173/) | Public landing and platform introduction |
| [Login](http://127.0.0.1:5173/login) | Local email/password login |
| [Development controls](http://127.0.0.1:5173/__dev/foundation) | Live connection and primitive checks |
| [Backend readiness](http://127.0.0.1:8080/api/v1/health) | Backend plus real PostgreSQL query |
| [Proxied readiness](http://127.0.0.1:5173/api/v1/health) | Same-origin frontend → backend transport |
| [OpenAPI JSON](http://127.0.0.1:8080/v3/api-docs) | Local profile only |
| [Swagger UI](http://127.0.0.1:8080/swagger-ui/index.html) | Local profile only |

Successful readiness returns `{"status":"UP","service":"mezun360-api"}` with `Cache-Control: no-store` and a server-generated `X-Request-ID`. Database unavailability returns a sanitized `503` problem response. This dependency-aware endpoint is readiness, not a process-only liveness probe.

## Configuration

| Variable | Default / purpose |
| --- | --- |
| `POSTGRES_DB`, `POSTGRES_USER` | `mezun360`; local database and username |
| `POSTGRES_PASSWORD` | Required; root `.env`, never a committed credential |
| `POSTGRES_HOST`, `POSTGRES_PORT` | `localhost`, `5432` for the host-run backend |
| `DB_URL`, `DB_USERNAME`, `DB_PASSWORD` | Optional backend datasource overrides; leave unset for Compose development |
| `SERVER_ADDRESS`, `SERVER_PORT` | `127.0.0.1`, `8080`; local binding |
| `SPRING_PROFILES_ACTIVE` | `local` in the example; otherwise `default` |
| `OPENAPI_ENABLED` | Explicit override for API docs; local profile otherwise enables them |
| `FLYWAY_ENABLED` | `true`; only disable later when an approved external Flyway migrator owns deployment |
| `VITE_API_BASE_URL` | `/api/v1`; frontend API base |
| `API_PROXY_TARGET` | `http://127.0.0.1:8080`; Vite server-only proxy destination |

Use the relative API base locally. Vite proxies `/api` without wildcard backend CORS. If you change the backend port, change `API_PROXY_TARGET` and restart Vite. A later deployment should keep frontend and API on one HTTPS origin; `vite preview` is a build inspection tool and does not provide the development API proxy.

## Tests, lint and builds

From `backend/` with JDK 21 and Docker running:

```sh
./mvnw test
./mvnw verify
```

`verify` runs tests and creates `backend/target/mezun360-api-0.1.0-SNAPSHOT.jar`. Tests cover Spring startup, real PostgreSQL readiness, clean/repeated Flyway migration, safe errors, request validation and OpenAPI schema drift. Test-only probe endpoints are excluded from the application artifact.

From `frontend/` with Node 24:

```sh
npm run api:check
npm run test
npm run lint
npm run typecheck
npm run build
```

The build is in `frontend/dist/`. Use `npm run test:watch` for interactive testing and `npm run preview` to inspect the production frontend build (without an API proxy). After editing the reviewed [OpenAPI contract](contracts/openapi/mezun360.yaml), run `npm run api:generate`; never edit generated transport types manually.

From the checkout root:

```sh
python3 scripts/check-docs.py
git diff --check
```

The documentation check includes untracked files, local Markdown links, fenced JSON, code-fence balance and whitespace. CI runs the same baseline application/documentation checks on pushes and pull requests. M1B login/role/logout journeys were also exercised in the real local browser; a standalone Playwright runner remains future work.

## Troubleshooting

- **Java version error:** point `JAVA_HOME` and `PATH` at JDK 21; the system's default Java may be a different version.
- **Docker connection/Testcontainers error:** start Docker and verify `docker info`. Tests must not silently skip when Docker is unavailable. Testcontainers 2 is selected for compatibility with current Docker Engine releases.
- **Container registry/download error:** retry the failed download after the network recovers; do not disable TLS checks or dependency peer checks.
- **Database authentication/startup failure:** compare root `.env` with the initialized database credentials and check `docker compose logs postgres`. Ensure port 5432 is free, or change `POSTGRES_PORT` before startup.
- **Health page unavailable:** check the backend terminal, `curl http://127.0.0.1:8080/api/v1/health`, then the same path through port 5173. A live backend with unavailable PostgreSQL returns 503; an unreachable backend yields a proxy/network error.
- **OpenAPI returns 404:** select `SPRING_PROFILES_ACTIVE=local` in root `.env` and restart the backend. Explicit `OPENAPI_ENABLED=false` overrides the local default.
- **Flyway checksum mismatch:** restore the applied migration; add a new version for schema changes. Do not use automatic Hibernate updates or casually repair migration history.
- **Port 5173 occupied:** stop the other development process or explicitly choose a different Vite port. `strictPort` prevents silent port changes.

## Architecture and scope

| Document | Purpose |
| --- | --- |
| [AGENTS.md](AGENTS.md) | Repository rules and authorized scope |
| [Decisions](docs/decisions.md) | Accepted decisions and BTÜ institutional inputs |
| [Requirements](docs/requirements.md) | MVP roles, privacy and acceptance criteria |
| [Architecture](docs/architecture.md) | Module boundaries, future security and operations |
| [Database](docs/database.md) | Current migration and future conceptual model |
| [API](docs/api.md) | Implemented foundation versus future contracts |
| [Repository structure](docs/repository-structure.md) | Present files and incremental expansion |
| [Roadmap](docs/roadmap.md) | M1A/M1B and M2–M6 delivery boundaries |

Local password/session authentication and role enforcement are implemented. Full production ADMIN MFA and operator recovery/provisioning are outstanding release blockers. Alumni verification, opt-in privacy and all business workflows remain later milestones. SSO/OBS, e-Devlet, employers and internal applications remain deferred. No commit, push or deployment is part of this task.

## Public experience (M1C)

The public landing stays available without login and even when identity lookup is unavailable. Navigation links reach its Platform, Mezun Ağı, Kariyer, Mentörlük and Hakkında sections. “Mezun Ağına Katıl” opens the existing login entry; it does not create an account. Signed-in visitors can choose “Alanıma dön”; `/login` still redirects ALUMNI to `/app` and ADMIN to `/admin`.

Product previews are static, clearly labelled illustrations of planned capabilities, without real people or metric data. They do not implement private dashboards or business APIs. Official logo assets were not available, so the interface uses the authorized text identity. Legal/contact items are visibly marked Yakında; no legal text or contact address was invented.

“Şifremi Unuttum” is disabled and marked Yakında. The direct `/forgot-password` informational fallback remains for existing links. Real token/reset/email workflows and production MFA remain pending. [M1C verification](docs/m1c-verification.md) records responsive/manual checks and security regression results. Do not start M2A automatically.
