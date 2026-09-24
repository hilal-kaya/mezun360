# Infrastructure

M1A uses the root [compose.yaml](../compose.yaml), as explicitly requested, with PostgreSQL only. Run Compose from the repository root using the [setup instructions](../README.md). Credentials come from the ignored root `.env`; the example contains a placeholder. Host-bound development services use loopback addresses.

This directory is reserved for later provider-neutral deployment configuration: built frontend/backend images, same-origin TLS proxy, one-shot Flyway migration and operations runbooks. Do not precreate Kubernetes, microservices, brokers, Redis or storage services. No production deployment is provided by M1A.

Production secrets, TLS, real email transport, monitoring/recovery ownership and retention configuration still require [institutional inputs](../docs/decisions.md). Later security implementation must enforce ADMIN MFA in production and reject mock security/email bindings there. Retention is institutional configuration, not a hard-coded period.
