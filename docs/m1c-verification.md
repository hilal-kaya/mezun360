# M1C public experience — delivery and verification

Date: 2026-09-24. Branch: `codex/m1c-public-experience`. No commit, push or deployment was performed. M2A was not started.

## Delivered scope and routes

The root technical placeholder is replaced with a public BTÜ Mezun360 landing: text identity, five section-navigation links, required hero and CTAs, community illustration, four value areas, lightweight three-step explanation, career ecosystem, two labelled product-preview compositions, privacy principles, institutional value, final CTA and footer. Barlow and the existing navy/pastel/warm-background tokens are preserved.

There are no new URL paths or API endpoints. `/` now serves the public product entry; `/login` has matching text identity and mobile form-first presentation; `/app` and `/admin` remain guarded placeholders. The public landing is not gated by authentication or successful identity lookup. Signed-in visitors get “Alanıma dön”; login retains ALUMNI → `/app` and ADMIN → `/admin`. No role choice appears in public UI.

“Mezun Ağına Katıl” leads to existing login, with public copy clarifying that profile/network features are planned. “Şifremi Unuttum” is disabled and marked Yakında. The direct `/forgot-password` informational fallback remains for existing links. Legal/contact footer items are inactive text marked Yakında, with no invented legal documents or contact details.

No alumni profile/directory/connections, jobs, mentorship/events backend, analytics, notifications, portals, SSO/OBS/e-Devlet, password-reset delivery or MFA enrollment was implemented. No schema, backend source/test, API contract, package manifest, lockfile or production dependency was changed.

## Figma reference and visual differences

The live [Figma Make file](https://www.figma.com/make/7AqVYRogPUjTclUHbML9IW/Finalize-Mezun360-Design?fullscreen=1) was reviewed before implementation: Ana Sayfa, Mezunlar Ağı, İş & Staj, Mentörler and admin Genel Bakış. The [design record](design/m1c-public-experience.md) documents observed elements and mapping.

The preview sidebar/pastel panels/opportunity categories/mentor panel follow those references. The public editorial layout, CSS/SVG connection visual, navigation and marketing sections are composed from the user's M1C brief because a dedicated public landing was not available. No official university logo asset was available; the authorized text identity is used instead of an invented emblem. No immutable Figma revision was exposed, so this is a dated live-preview review rather than a pixel-exact frozen-revision claim.

Both product compositions say “Tasarım önizlemesi · Temsili içerik”. No personal record or real metric is presented. Career Center bars are explicitly illustrative and have no numeric values. These are static explanatory compositions, not functioning dashboards. Student and employer ecosystem labels introduce no portal or role.

## Verification actually executed

| Check | Result |
| --- | --- |
| Frontend `npm test` | 31 tests across 5 files passed |
| Frontend `npm run lint` | Passed |
| Frontend `npm run typecheck` | Passed |
| Frontend `npm run build` | Passed; production JS 364.47 kB / gzip 114.20 kB; CSS 30.33 kB / gzip 7.08 kB |
| Frontend `npm run api:check` | Passed; existing contract unchanged |
| Backend `./mvnw test` | Full suite: 30 tests, zero failures/errors/skips; real PostgreSQL Testcontainers |
| Security preservation | 65 backend/contract/core frontend auth files match pre-M1C SHA-256 snapshot exactly; UI diff confirms login/logout/guard logic unchanged |
| Documentation | Repository Markdown/link/fence/JSON/whitespace check and `git diff --check` run before delivery |

Added tests cover all public sections, working hero CTA, exploration/join destinations, unavailable legal links, disclosure opening/selection/Escape/focus restoration, both authenticated landing entry links, existing-session login redirects and public content during identity-service failure. The original M1B success/failure/guest/logout/role tests remain. Only the reset-control assertion changes to reflect the expressly requested unavailable UX.

No new production library, image download, stock photograph, tracking script, autoplay media or chart dependency was introduced. Existing self-hosted fonts and tree-shaken Lucide icons are reused. Prettier 3.6.2 was used as a temporary formatting tool on the new source files; it was not added to repository dependencies. Bundle sizes are build outputs, not a production Lighthouse/load-test claim.

## Real browser and HTTP checks

- `/` renders the public landing; hero Giriş Yap opens `/login`.
- Actual local ALUMNI login reaches `/app`. Returning to the landing keeps it public; the account-entry link points to `/app` and works. Logout returns to `/login`.
- Actual local ADMIN login reaches `/admin`. Visiting `/login` again with that session returns to `/admin` without a loop. Logout returns to `/login`.
- Anonymous navigation to `/app` and `/admin` returns to `/login`.
- Real HTTP requests through the Vite proxy: anonymous admin probe 401, ALUMNI admin probe 403, ALUMNI probe 200, logout 204, current identity after logout 401. Credentials, cookies and CSRF tokens were not printed.
- Desktop layout inspected at 1280 × 720. Tablet 768 × 1024, mobile 390 × 844 and narrow phone 320 × 740 were inspected. Document width matched viewport width at 768, 390 and 320; no horizontal page overflow. Narrow product tiles stack at the same horizontal position within the preview.
- Mobile menu opens and Escape closes it; automated tests also verify focus restoration and closing on a navigation selection. The skip link receives keyboard focus with a visible solid outline. Login's mobile form remains visible without the desktop introduction panel above it. Temporary viewport overrides were reset after review.
- Visual review caught and fixed a low-contrast eyebrow on the navy ecosystem section; it now uses pastel turquoise. Small-screen menu height is bounded to the viewport with vertical scrolling. No authentication/security regression was discovered.

These checks are browser interactions plus Vitest and backend integration tests; no standalone Playwright CI suite or full WCAG conformance audit is claimed.

## Remaining work and M2A readiness

Real forgot/reset-password delivery remains pending: purpose-bound expiring token digests, atomic consumption, session revocation, enumeration-safe responses, delivery/outbox integration and security tests. The UI makes no successful reset claim.

The repository is ready for **separately authorized local M2A – Alumni Profile** development. That work must implement ownership, privacy defaults and real profile/verification contracts; public illustrations do not provide those capabilities. Production remains blocked by the existing M1B MFA/provisioning/recovery and deployment prerequisites, with institutional inputs in [decisions](decisions.md). M1C changes none of those safeguards or decisions.

## Files created or changed

8 created, 14 changed. No baseline file deleted.

### Created

- [docs/design/m1c-public-experience.md](../docs/design/m1c-public-experience.md)
- [docs/m1c-verification.md](../docs/m1c-verification.md)
- [frontend/src/components/product-identity.tsx](../frontend/src/components/product-identity.tsx)
- [frontend/src/features/public/landing-page.test.tsx](../frontend/src/features/public/landing-page.test.tsx)
- [frontend/src/features/public/landing-page.tsx](../frontend/src/features/public/landing-page.tsx)
- [frontend/src/features/public/product-previews.tsx](../frontend/src/features/public/product-previews.tsx)
- [frontend/src/features/public/public-header.tsx](../frontend/src/features/public/public-header.tsx)
- [frontend/src/features/public/public.css](../frontend/src/features/public/public.css)

### Changed

- [AGENTS.md](../AGENTS.md)
- [README.md](../README.md)
- [docs/architecture.md](../docs/architecture.md)
- [docs/decisions.md](../docs/decisions.md)
- [docs/repository-structure.md](../docs/repository-structure.md)
- [docs/requirements.md](../docs/requirements.md)
- [docs/roadmap.md](../docs/roadmap.md)
- [frontend/README.md](../frontend/README.md)
- [frontend/index.html](../frontend/index.html)
- [frontend/src/app/app.test.tsx](../frontend/src/app/app.test.tsx)
- [frontend/src/app/app.tsx](../frontend/src/app/app.tsx)
- [frontend/src/features/auth/auth-pages.test.tsx](../frontend/src/features/auth/auth-pages.test.tsx)
- [frontend/src/features/auth/auth-pages.tsx](../frontend/src/features/auth/auth-pages.tsx)
- [frontend/src/layouts/root-layout.tsx](../frontend/src/layouts/root-layout.tsx)
