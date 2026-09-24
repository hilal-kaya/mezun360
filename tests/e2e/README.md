# Cross-system acceptance-test boundary

Reserved for Playwright tests against the real frontend/backend with isolated synthetic data and a disposable PostgreSQL database. This directory contains no executable tests yet.

Cover Alumni and Admin journeys, direct unauthorized API calls, object ownership, contact privacy, session expiry/logout and agreed Figma states. Keep Vitest tests with frontend features and JUnit 5/Mockito/Testcontainers tests with backend modules.

Use the [AC-01–AC-16 acceptance criteria](../../docs/requirements.md) and [testing strategy](../../docs/architecture.md): production MFA enforcement, canonical verification/mentorship states, external job handoffs, opt-in visibility, public-content allowlists, provider-independent delivery and unconfigured-retention refusal. Do not use production accounts, fabricate passing test results or mock the backend in the only end-to-end security checks. Internal applications, SSO/OBS/e-Devlet and active waitlists are future scope, not MVP test fixtures.
