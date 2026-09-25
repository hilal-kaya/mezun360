# Backend

Java 21 / Spring Boot 3.5 modular monolith. Use the [root setup](../README.md) and [M1B security runbook](../docs/m1b-security.md).

`identity` owns validated auth DTOs, service rules, accounts, local AuthenticationProvider and JDBC sessions. `config` owns Spring Security/method authorization and fail-closed environment policy; `audit.application` stores minimal security events. `health` and `shared` preserve readiness, safe RFC 9457 errors and generated request IDs. No business modules exist.

Flyway owns all schema changes: V0001 foundation, V0002 identity/audit, V0003 library-compatible sessions. JPA validates only, Open Session in View and competing SQL/session initialization are disabled. Production runtime/migrator grants remain a deployment prerequisite.

Run `./mvnw verify` with Java 21 and Docker. JUnit 5/Mockito plus real PostgreSQL Testcontainers cover auth/roles/CSRF, session lifecycle, policy guards, Flyway and contract drift. Full MFA is not implemented; non-local startup refuses to run. SSO, OBS, registration/reset/email and outbox delivery remain deferred.

M2A adds the `alumni` module: owner-only GET/PUT profile, service validation/transactions/concurrency, V0004 professional-data tables and transactional minimal audit. Integration tests cover ownership, nested records, CSRF, roles, persistence and M1-to-M2A upgrade. See [contract](../docs/api.md), [schema](../docs/database.md) and [verification](../docs/m2a-verification.md).
