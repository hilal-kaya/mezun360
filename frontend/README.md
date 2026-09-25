# Frontend

React/TypeScript/Vite foundation. Follow the [root setup](../README.md) for Node 24, run/build/test commands and safe local demo creation.

`features/public` owns the responsive public landing, disclosure navigation and static labelled product illustrations. Shared `components/product-identity.tsx` provides the text identity; no official logo is invented. Public root stays available during optional identity lookup and offers authenticated users “Alanıma dön”.

`features/auth` implements login, GET `/auth/me` identity, guarded alumni shell and `/admin` placeholder and logout. `app` owns routing and Query caches; `lib/api` owns credentialed transport, fresh CSRF bootstrap before unsafe requests and generated types. Nothing stores auth tokens or roles in browser storage. Client guards are UX only; Spring Security remains authoritative.

`components/ui` and `styles` preserve the reviewed Barlow/pastel/navy tokens. Login-specific layout is provisional because the accessible Figma preview did not expose a dedicated login screen. There are no functional dashboards or fake role selectors. Landing illustrations show planned experiences without personal records or real metrics. `src/dev` stays excluded from production builds; Recharts remains unused until real aggregates exist.

Run `npm run api:check`, `npm test`, `npm run lint`, `npm run typecheck`, `npm run build`. See [verification](../docs/m1b-verification.md) for M1B results and [M1C verification](../docs/m1c-verification.md) for public-experience regressions and [security](../docs/m1b-security.md) for session/error handling. Production SPA security headers belong to the future HTTPS reverse proxy, not the Vite development server.

Password reset remains unimplemented: login displays a disabled “Şifremi Unuttum” control with Yakında, and the direct legacy informational route remains honest. Mobile login prioritizes the form by hiding the desktop introduction panel. All existing authentication logic and backend authorization remain unchanged.

M2A `features/profile` implements owner-only `/app/profile`, ETag-aware Query hooks, structured section dialogs and meaningful behavior tests. It uses real persisted data and the [reviewed profile design](../docs/design/m2a-alumni-profile.md). Other alumni destinations are explicit future stubs. No directory, verification or visibility settings are active.
