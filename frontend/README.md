# Frontend

React/TypeScript/Vite foundation. Follow the [root setup](../README.md) for Node 24, run/build/test commands and safe local demo creation.

`features/auth` implements login, GET `/auth/me` identity, guarded `/app` and `/admin` placeholders and logout. `app` owns routing and Query caches; `lib/api` owns credentialed transport, fresh CSRF bootstrap before unsafe requests and generated types. Nothing stores auth tokens or roles in browser storage. Client guards are UX only; Spring Security remains authoritative.

`components/ui` and `styles` preserve the reviewed Barlow/pastel/navy tokens. Login-specific layout is provisional because the accessible Figma preview did not expose a dedicated login screen. There are no dashboards or fake role selectors. `src/dev` stays excluded from production builds; Recharts remains unused until real aggregates exist.

Run `npm run api:check`, `npm test`, `npm run lint`, `npm run typecheck`, `npm run build`. See [verification](../docs/m1b-verification.md) for actual results and [security](../docs/m1b-security.md) for session/error handling. Production SPA security headers belong to the future HTTPS reverse proxy, not the Vite development server.
