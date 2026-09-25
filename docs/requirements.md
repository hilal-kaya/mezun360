# Requirements

Status: updated MVP requirements, 2026-09-22. The [accepted decision register](decisions.md) resolves the original architecture alternatives. Detailed engineering choices explicitly labeled **proposed** remain refinements, not unresolved product scope. M1A technical foundation, M1B local authentication/security and M1C public experience are authorized and implemented; see [M1B security](m1b-security.md) for exact scope and production blockers; M2A now implements the owner-profile slice described at the end; other business capabilities below remain future requirements. See the [M1A evidence](m1a-verification.md) and [roadmap](roadmap.md).

## Sources and evidence

- The user brief defines the purpose, technology, two MVP experiences, roles and mandatory engineering rules.
- [GitHub repository](https://github.com/hilal-kaya/mezun360): empty on initial inspection; no existing implementation or product behavior to preserve.
- [Figma Make](https://www.figma.com/make/7AqVYRogPUjTclUHbML9IW/Finalize-Mezun360-Design?fullscreen=1): the new fullscreen link opened successfully on 2026-09-22. Reviewed the alumni home, job/internship list, mentor list/request form, privacy settings and admin overview/navigation. This supersedes the initial sign-in blocker. An exact immutable revision and complete responsive/state inventory have not yet been captured.
- M1A access was rechecked on 2026-09-23: alumni home and admin overview/navigation loaded. The [design record](design/m1a-foundation.md) distinguishes this evidence from the broader 2026-09-22 review and lists remaining visual gaps.
- Figma governs visual behavior and layout; it cannot weaken authorization, privacy or data integrity requirements. Surface any conflict before implementation.

## Purpose and success

BTÜ Mezun360 connects alumni with career opportunities, mentors, events and the university career center. MVP users should be able to maintain a verified alumni identity and participate in these activities. Career center staff should manage the ecosystem and see accurate, privacy-preserving operational reporting.

Success is demonstrated through the accepted journeys and security tests below. Numeric adoption targets and service-level objectives require university input; no invented targets or sample metrics may appear as production facts.

## Roles and account state

| Role | Meaning | Scope |
| --- | --- | --- |
| `GUEST` | Unauthenticated visitor; no database role | Public landing/authentication and explicitly public content only |
| `ALUMNI` | Registered alumni account | Own account; verified alumni can use member features |
| `ADMIN` | Explicitly provisioned career center staff | Staff workflows and purpose-limited operational access |
| `EMPLOYER` | Future organization representative | No MVP login path, assignment, dashboard or permissions |

Preserve one persisted application role per account (`ALUMNI` or `ADMIN`). Administrators are not implicitly alumni; multi-role support is future scope, not an MVP blocker. Account role, email verification and alumni verification are separate facts. No user-facing payload or role switch can grant ADMIN.

Account status stays `PENDING_EMAIL`, `ACTIVE`, `SUSPENDED`, `DEACTIVATED`. Alumni verification uses exactly `PENDING`, `VERIFIED`, `REJECTED`, initially `PENDING`. Submission timestamps/request existence distinguish incomplete onboarding from a submitted pending review without a fourth verification state. Email verification activates the account but does not verify alumni eligibility. Active unverified alumni can use their own onboarding, verification, privacy settings and account notifications; member features require `VERIFIED`. Suspension/deactivation blocks authenticated use and revokes sessions. Only authorized ADMIN reviewers decide MVP verification; the future OBS adapter cannot directly mutate accounts or roles.

## Functional scope

These capabilities follow the confirmed scope. Validate complete screen coverage against Figma during implementation planning; missing screens do not reopen security/privacy decisions.

| ID | Capability | Alumni / visitor journey | Career center journey |
| --- | --- | --- | --- |
| FR-01 | Identity and verification | Local email/password registration, email verification, session login/logout, password reset; submit graduation details | ADMIN verifies/rejects alumni; production ADMIN access requires MFA; local development may disable MFA explicitly |
| FR-02 | Alumni profile | Edit own professional profile, education and work history; private contact settings | Review necessary verification/profile information; corrections recorded with a reason |
| FR-03 | Career opportunities | Browse member-only published jobs, filter/save, follow a validated external application link | Maintain organizations/jobs and application mode; publish/close external-application jobs; internal submission/review deferred |
| FR-04 | Mentorship | Explicit mentor opt-in; requests with topic, message, preferred meeting method/time and status; standard and Hızlı Mentörlük sessions | Review mentor participation and moderate the same request lifecycle for both session types |
| FR-05 | Events | Browse member-only published events, register/cancel own attendance | Manage capacity, registration, cancellation and attendance; future waitlist seam, no MVP waitlist workflow |
| FR-06 | Dashboard/reporting | View own activities and relevant upcoming opportunities | View real aggregate counts and trends with documented definitions and filters |
| FR-07 | Notifications | Provider-independent `IN_APP`/`EMAIL` updates and preferences | Sanitized delivery failures and controlled retries; mock/log sender allowed in local development |
| FR-08 | Alumni directory | Included with voluntary opt-in and owner-controlled visibility; default private | Limited operational alumni search; audited private-data access; no default contact export |
| FR-09 | Privacy/account requests | Request correction, export or deletion through a tracked request | Verify requester and process requests under an approved university policy |
| FR-10 | Public content | Guests read landing/platform information and selected published university announcements/news | Authorized staff curate and explicitly publish content; no general-purpose CMS or public member data |

FR-03 models both `EXTERNAL_APPLICATION` and `INTERNAL_APPLICATION`, but MVP only enables the external flow. Do not create internal application endpoints/tables or pretend an external click is a completed application. FR-08 participation is optional for each alumni user, not an undecided product feature. Mentor discovery has a separate explicit opt-in.

Mentorship states are `REQUESTED`, `ACCEPTED`, `REJECTED`, `CANCELLED`, `COMPLETED`; status is server-controlled. `STANDARD` and `QUICK` are session types in the same module. The reviewed Figma form has video/phone/in-person methods and relative preferred-time windows; those preferences do not automatically book a meeting or disclose contact information. See the [workflow/data model](database.md).

## Authorization matrix

"Verified alumni" means authenticated, email verified, active, and alumni verification `VERIFIED`. All access is checked server-side, including resource ownership and publication state.

| Resource/action | Guest | Unverified active alumni | Verified alumni | Admin |
| --- | --- | --- | --- | --- |
| Landing, authentication | Yes | Yes | Yes | Yes |
| Landing/platform information and selected published announcements/news | Yes | Yes | Yes | Manage through staff API |
| Drafts, staff notes, unpublished content | No | No | No | Authorized staff only |
| Own account/profile/verification/privacy request | No | Own only | Own only | Own account; staff endpoints for alumni |
| Member job/event lists | No | No | Read published | Manage |
| External job application link / saved job | No | No | Published eligible link / own bookmarks | Manage job destination; no private bookmark access |
| Event registration | No | No | Own only | Manage roster and attendance |
| Mentor discovery/request | No | No | Opt-in profiles / own participation | Moderate |
| Alumni directory | No | No | Opt-in professional projection | Operational projection via admin API |
| Personal contact details | No | Own only | Own only | Specific audited operational lookup |
| Notifications/preferences | No | Own only | Own only | Own only; sanitized delivery operations |
| Aggregate dashboards | No | No | Own activity only | Approved aggregate queries |
| Audit records | No | No | No | Read sanitized events; access itself audited |
| Assign/revoke `ADMIN` via web/API | No | No | No | No MVP HTTP endpoint |

Public content is an allowlist: landing/platform information and selected university publications that are both `PUBLISHED` and `PUBLIC`. Jobs and events remain member-only; there are no MVP public job/event APIs. No anonymous directory, alumni profile, contact, analytics or admin access exists. Authentication bootstrap endpoints are public only for their identity purpose. A hidden or non-owned sensitive resource returns a generic not-found response.

## Privacy rules

- Never publish alumni email, phone, home address, private links, CVs, verification details, job applications or mentor-request notes. No public alumni profile endpoint.
- Private contact data is separated from professional profile fields. Authenticated directory opt-in is separate from mentorship opt-in. Neither consent exposes contact data, even after a mentor match is accepted.
- Owners control directory/profile visibility through `PRIVATE` or `ALUMNI_MEMBERS`; default `PRIVATE`. This restricts peer discovery and profile detail, not purpose-limited audited staff operations. Directory opt-out also blocks peer detail access by known UUID. Explicit mentor opt-in permits only the separate mentor-card projection.
- Personal email, phone and detailed contact information are hidden by default and remain absent from peer/public DTOs. A separate owner-controlled `employerVisibilityOptIn` defaults false; it has no access effect while employer functionality is absent. No employer account, endpoint or automatic data sharing is introduced in MVP.
- Directory/mentor cards use allowlisted professional fields. Free-text bios must discourage personal contact details; do not treat free text as inherently safe or publish it to guests.
- Peers receive only data needed for a specific interaction. Admin list screens omit contact data; a dedicated contact lookup requires an operational reason and produces an audit record. `ADMIN` does not authorize unrestricted data extraction.
- Defaults: directory hidden; mentor profile hidden until opted in and approved; optional promotional messages disabled. Security and service messages remain separate from optional communications.
- Do not include personal data in analytics, URLs, trace fields, exception details, audit snapshots or email subjects. Notification messages use minimal information and link to authenticated pages.
- Private APIs and identity endpoints use `Cache-Control: no-store`. Clear client query caches when identity changes; do not persist private query data in browser storage. Avoid third-party session replay on authenticated pages.
- Aggregate reporting must avoid re-identification through tiny cohorts, including complementary suppression. BTÜ must set the configurable threshold and allowed demographic filters before enabling those breakdowns; do not use an invented production threshold. Own counts and authorized operational totals are separate use cases; guests receive neither.
- Privacy notice version and preferences are recorded separately. Optional consent must be revocable. University privacy/legal owners must decide purposes, retention, deletion exceptions and providers; these documents do not assert legal compliance or a legal basis.
- Retention periods: “TBD – to be defined by Bursa Technical University according to institutional policy and applicable KVKK requirements.” Store configurable category policies later; do not hard-code legal periods. See [retention strategy](database.md).

## Business invariants and acceptance criteria

| ID | Rule / example of required evidence |
| --- | --- |
| AC-01 | Registration/profile requests containing `role=ADMIN`, `verified=true`, `status` or another privileged field are rejected; stored authority remains unchanged. |
| AC-02 | A guest receives 401 on protected APIs; an alumni session receives 403 on admin APIs. Direct service calls also enforce permissions. |
| AC-03 | Changing a resource UUID never reveals or modifies another user's private profile, saved job, registration, mentorship request, privacy request or notification. |
| AC-04 | Public and peer response schemas exclude contact fields; directory opt-out removes discoverability; authenticated query caches clear on logout/account switch. |
| AC-05 | Only email-verified, active alumni with status `VERIFIED` can open an external application destination, register, discover members or request mentorship. An admin cannot verify their own eligibility or review their own case. |
| AC-06 | External jobs require a safe destination; closed/expired/draft jobs cannot initiate a new platform handoff. MVP rejects `INTERNAL_APPLICATION` activation and exposes no internal submission/review routes or completed-application metrics. |
| AC-07 | Event registration is unique per alumni/event and capacity-safe under concurrency. Cancellation releases a place once; start/cancel/cutoff rules apply using server time. |
| AC-08 | Users cannot request themselves, duplicate a pair in `REQUESTED`/`ACCEPTED`, or accept another mentor's request. Both users remain eligible; mentor opt-in is required. Standard/quick requests share validation, lifecycle and capacity checks. |
| AC-09 | Dashboard numbers come from authorized queries with definitions, period, timezone and freshness metadata. No fallback to sample counts on failure. |
| AC-10 | Business mutations, required audit events and notification outbox records commit together. A retried event cannot create duplicate in-app notifications. |
| AC-11 | Reset/verification tokens expire, are stored as digests and are single-use under concurrent requests. Password reset invalidates existing sessions. |
| AC-12 | Every persisted schema change is a Flyway migration; both empty-database and upgrade-path tests run against PostgreSQL. |
| AC-13 | Production refuses an ADMIN-MFA-disabled configuration; pre-MFA sessions cannot access admin services. Only explicit local development can disable MFA, never authorization or CSRF. |
| AC-14 | Authentication and institutional-verification adapters return normalized results; business services retain account/role/verification authority. No SSO, e-Devlet or OBS connector is enabled in MVP. |
| AC-15 | `IN_APP`/`EMAIL` dispatch uses provider contracts; local mock/log delivery avoids secrets and production cannot silently use a mock. Full events return a capacity conflict, not an undocumented waitlist success. |
| AC-16 | Guests can read selected published news/announcements but cannot access member data, analytics or admin APIs. Employer opt-in cannot enable an unavailable future role. Unset retention policy cannot trigger age-based deletion. |

## Nonfunctional requirements

- Proposed UI language: Turkish (`tr-TR`); server codes and API property names: English. Store instants in UTC, display university schedules in `Europe/Istanbul`. Preserve Turkish characters; do not use locale-dependent case conversion for security identifiers.
- Support responsive desktop/mobile layouts and keyboard/screen-reader use. Proposed accessibility target: WCAG 2.2 AA. Confirm layout details from Figma and add loading, empty, validation, unavailable and forbidden states where designs are incomplete.
- Paginate lists, bound search/sort inputs, index common queries and prevent N+1 data access. Agree a representative dataset and measurable latency/concurrency objectives in M0 before performance acceptance.
- Fail closed on security or migration errors. Delivery-provider failure must not lose a successful business action; failed background work must remain visible to operators.
- Use HTTPS, secret management, backups, restore exercises and auditable Docker/Compose deployments. Remain cloud/provider neutral; no Kubernetes or microservices. Confirm institutional operational inputs before production.

## Explicit exclusions

Employer accounts/self-service posting; internal application submission/review; BTÜ SSO implementation; e-Devlet; OBS integration; active waitlists; multi-university tenancy; real-time chat; AI matching/ranking; payments; native mobile clients; full applicant-tracking system; CV/document uploads; unrestricted alumni exports; arbitrary user-authored automation; automatic admission or hiring decisions. Appointment booking, surveys, ratings, certificate uploads and university imports are not added merely because a prototype references them.

## Design observations and remaining reconciliation

| Observed prototype area | Requirement / interpretation |
| --- | --- |
| Alumni navigation: Ana Sayfa, Mezunlar Ağı, İş & Staj, Mentörler, Etkinlikler, Haberler, Profilim, Ayarlar | Maps to FR-01–FR-10; navigation presence alone does not authorize guest access |
| Mentorship request: topic, short message, Video/Telefon/Yüz Yüze, Bu hafta/Önümüzdeki hafta/2 hafta içinde | Structured request fields in FR-04; no automatic phone/email disclosure |
| Hızlı Mentörlük describes a 20-minute career conversation | `QUICK` session type with a configurable 20-minute design default; same request/service lifecycle |
| Privacy settings mention career-center-only, BTÜ alumni and approved employers, plus mentor opt-in | Default private and owner-controlled peer visibility; employer option must be marked unavailable for MVP, never presented as active access |
| Admin overview/navigation includes alumni analytics/management, mentorship, jobs/events, employers, surveys and reports | Accepted core screens map to staff modules; employer workflows and surveys remain deferred |
| Dashboard displays demo counts, match percentages and ratings | Layout references only; do not copy sample metrics or invent matching/rating capabilities |

This was a functional preview review, not a complete visual or responsive audit. Next record an immutable revision/screen map, verified tokens/breakpoints, forms/tables and loading/empty/error/forbidden states. Reconcile publication screens and the missing production authentication/MFA states against accepted scope. The prototype's demo role toggle never becomes a server authority control. See [M0](roadmap.md) and [D-01](decisions.md).

## M1B design and implementation evidence

On 2026-09-24 the linked Figma Make preview again loaded the alumni home and established navy/pastel/Barlow visual language. A dedicated login view was not reachable through the prototype logout control. The implemented login uses the existing reviewed tokens and primitives; its split composition is provisional, not claimed as an exact Figma login reproduction. Only login and minimal authenticated placeholders were built. No prototype role switch, metric, personal record or dashboard was copied into production code. See [verification](m1b-verification.md).

## M1C public entry acceptance

The public landing now introduces the platform, four value areas, three planned participation steps, the university career ecosystem, illustrative product/center views and privacy principles. The five navigation anchors and login CTAs work on desktop/tablet/mobile. Legal/contact text is unavailable rather than fabricated. Join leads to existing login, reset is marked Yakında, and no business feature is implied to be active merely because its planned experience is illustrated.

The live Figma alumni/home/network/jobs/mentors/admin views were reviewed again on 2026-09-24; see [M1C design evidence](design/m1c-public-experience.md). There was no dedicated public landing or official logo asset to reproduce. The user's public-site brief supplies the composition; exact existing palette and Barlow are preserved. [Verification](m1c-verification.md) records the tested current behavior without replacing the future business acceptance criteria above.

## M2A implemented owner-profile slice

The explicit M2A request implements FR-02 only for the authenticated ALUMNI owner: professional core fields, plain-text biography, chronological multiple employment/education records, normalized skill chips, structured certifications, four community contribution preferences and backend-calculated completion. `/app/profile` supports read-only onboarding, create/edit/save, validation, conflict, retry, loading and success feedback. Refresh and new sessions load saved PostgreSQL data. [Design evidence](design/m2a-alumni-profile.md) maps the reviewed profile screen.

No email/phone/contact fields are added, and no other alumni or ADMIN can inspect this profile. Request ownership and privileged fields cannot be assigned by the client. User-entered education explicitly remains unverified. Contribution choices do not enroll users in programs or grant permissions. M2B will add privacy choices and the PENDING/VERIFIED/REJECTED workflow; neither is implemented here. Directory/connections and all other business modules remain future work. The broader requirements above are the product target, not a claim of completed functionality. See [M2A verification](m2a-verification.md).
