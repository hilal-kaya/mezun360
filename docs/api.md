# API design

Status: M1A health/errors and M1B authentication/security probes are implemented in the [machine-readable contract](../contracts/openapi/mezun360.yaml). M2A implements owner-only GET/PUT profile; M2B implements privacy preferences and manual alumni verification as specified below. The implemented sections supersede earlier route proposals. Other business inventory remains target-only. Registration, email verification/reset delivery and MFA APIs remain unimplemented. [M1B security](m1b-security.md) describes production blockers and the exact local runtime.

The health service executes `SELECT 1` against PostgreSQL and returns `{status: "UP", service: "mezun360-api"}` or a sanitized `503 SERVICE_UNAVAILABLE`. Every request receives a server-generated `X-Request-ID`; health/errors use `Cache-Control: no-store`. Local OpenAPI JSON/UI is available at `/v3/api-docs` and `/swagger-ui/index.html`; disabled by default outside the local profile. No authentication requirement is implied for M1A readiness.

Current errors cover invalid DTOs, malformed JSON, unknown fields, missing routes, unsupported methods/media types, dependency failures and unexpected exceptions. Test-only controllers exercise payload validation without adding production write endpoints. M1B extends the same format to authentication, authorization, CSRF, CORS, rate-limit and filter failures. Unknown routes are denied by default before MVC routing; anonymous access returns 401. Vite uses a same-origin `/api` proxy; no backend wildcard CORS is configured.

## Conventions

- Base path `/api/v1`; JSON uses `camelCase`, stable English property names and uppercase enum values. Resource IDs are UUID strings; enum values are never numeric ordinals.
- Use plural nouns for resources and explicit commands for decisions/state transitions. `POST` creates or executes commands; `PUT` replaces a defined editable projection or performs a documented idempotent operation; `DELETE` removes a bookmark or cancels an explicitly documented relationship. Do not provide generic entity patching.
- Authentication uses the secure session cookie, not a token returned to JavaScript. Unsafe methods require `X-CSRF-TOKEN`, including unauthenticated registration/login/reset commands. CORS is same-origin by default; any additional origin is explicitly allowlisted with credentials, never `*`.
- Success: `200` for reads/updates, `201` plus `Location` for newly created resources, `202` for accepted asynchronous/security-enumeration-safe requests, `204` for documented no-body operations. Do not wrap successful DTOs in a redundant universal envelope; lists use the page shape below.
- Date/time values: ISO 8601 UTC instants such as `2026-09-22T09:00:00Z`; date-only values use `YYYY-MM-DD`. Store/display event timezone explicitly. Server clock decides deadlines. Time intervals use inclusive `from`, exclusive `to`.
- Lists accept `page` (zero-based, default 0), `size` (default 20, max 100), and allowlisted `sort` values such as `startsAt,asc`. Reject negative pages, unknown sort/filter keys and oversize limits; append ID as a deterministic tie-breaker. Search text is bounded (proposed 100 characters). Apply visibility filters before counting/pagination.
- Return `ETag` for editable aggregate representations. Require `If-Match` on their updates and transition commands where a prior version is required; return `428` if missing and `412` if stale. Include this requirement per operation in OpenAPI. Never accept a body `version` as a writable entity property.
- Natural uniqueness protects bookmarks, registrations and mentor pairs in `REQUESTED`/`ACCEPTED`. Repeated bookmark `PUT`/`DELETE` is idempotent. Other create commands may return `409` on a duplicate; the client refetches after an ambiguous timeout instead of automatically replaying non-idempotent writes. If a future endpoint accepts an idempotency key, specify actor/route/payload binding, storage and expiry before enabling it.
- Private, identity and admin responses use `Cache-Control: no-store`; do not let a CDN cache authenticated data. Sensitive inputs never go in query strings. URLs contain IDs, not email addresses or phone numbers. Redact query strings on authentication landing routes from access logs.
- The server generates a request/correlation ID or validates a trusted upstream ID; return `X-Request-ID` on success and error. Do not trust arbitrary client strings as log content.

Example page shape (illustrative empty result, not production metrics):

```json
{
  "items": [],
  "page": 0,
  "size": 20,
  "totalElements": 0,
  "totalPages": 0
}
```

## Permission definitions

- **Public**: explicitly unauthenticated operation; content rules still apply.
- **Account**: active authenticated account, even if alumni verification is pending; owner checks apply. Email-confirmation/login operations are exceptions needed to activate an account.
- **Alumni**: active, email-verified `ALUMNI` with alumni verification `VERIFIED`; `PENDING`/`REJECTED` cannot use member features.
- **Admin**: active `ADMIN`, with the production MFA policy satisfied. Staff endpoints require both route and service checks.
- **Owner/participant** means resolved from the session and stored relationship, never a submitted `userId` or `ownerId`. Admin is not implicitly a member/participant role.

No MVP route grants roles, impersonates another account or accepts an `EMPLOYER` authority. Reject unknown request properties (including nested objects) to prevent mass assignment. Ignore no privileged input silently.

## Authentication/account routes

Paths below are relative to `/api/v1`. Only csrf, login, me and logout are implemented in this table; all other rows describe future contracts.

| Method and path | Access | Input / response and invariants |
| --- | --- | --- |
| `GET /auth/csrf` | Public | No input; returns `{token, headerName}` with no-store; client keeps token in memory |
| `POST /auth/registrations` | Public + CSRF | Name, email, password, current notice version; generic `202`; role always assigned server-side |
| `POST /auth/email-verification-requests` | Public + CSRF | Email; generic `202`; limited rate; no account existence disclosure |
| `POST /auth/email-verifications` | Public + CSRF | Token; `204` on valid atomic consumption; generic invalid/expired token failure |
| `POST /auth/login` | Public + CSRF | Email/password; `200` authenticated session DTO when complete, or `{authenticated:false,mfaRequired:true}` in restricted pre-MFA context for staff; generic credential error |
| `POST /auth/mfa/verifications` | Restricted pre-MFA context + CSRF | Single-use/rate-limited second-factor proof bound to the pending login; on success rotate cookie and return authenticated session DTO; no admin access beforehand |
| `GET /auth/me` | Account | 200 own identity DTO; 401 without a valid completed session |
| `POST /auth/logout` | Account or restricted pre-MFA context + CSRF | `204`, invalidate full/pending session and cookie; client clears private caches and refreshes CSRF |
| `POST /auth/password-reset-requests` | Public + CSRF | Email; generic `202`; rate-limited, no existence disclosure |
| `POST /auth/password-resets` | Public + CSRF | Token/new password; `204`; consume token and revoke all sessions; no automatic login |
| `GET /me/account` | Account | Own account identity/settings DTO; never hash/token/session ID |

Login response: `authenticated`, `mfaRequired`. Current-account DTO: `userId`, `email`, `role`, `accountStatus`, `mfaSatisfied`, `absoluteExpiresAt`; email is returned only to its authenticated owner. No alumni profile/verification fields are invented. Refresh CSRF after authentication/logout. Pre-MFA session responses contain only the restricted challenge-stage indicator, no application authorities or profile details. A pending-email user cannot obtain normal authenticated access; login returns a generic failure without revealing verification status to an unauthenticated caller.

Local authentication is settled for MVP. A future BTÜ SSO adapter may add protocol-specific endpoints and account linking behind the same internal account/session contract; it does not replace business APIs or accept ADMIN from arbitrary claims. No SSO, e-Devlet or OBS routes exist in MVP. Before production, separately authorized work must finalize factor-specific enrollment/recovery DTOs with a maintained MFA implementation and BTÜ staff-recovery policy; restricted setup/recovery contexts never grant normal admin access. MFA may be disabled only by explicit local-development configuration, never by a request field; production must refuse disabled/mock MFA.

## Public content routes

Landing/platform information is approved static frontend content. `GET /public/publications` and `GET /public/publications/{id}` return only selected `PUBLISHED` + `PUBLIC` university announcements/news. Filter by allowlisted kind `ANNOUNCEMENT`/`NEWS`; use bounded pagination and explicit title/body/source/publication-time DTOs without alumni information. Hidden/draft items are not found.

This is the complete MVP public business-data surface. There are no public job/event, alumni-directory/profile/contact, analytics or admin APIs. Authentication bootstrap routes remain public solely for their identity purpose; operational health exposes no analytics or sensitive details.

## Alumni and privacy routes

| Method and path | Access | Input / response and invariants |
| --- | --- | --- |
| `GET /me/profile` | Account, alumni owner | Owner profile DTO with editable fields and verification summary; `ETag` |
| `PUT /me/profile` | Account, alumni owner | Editable professional fields only, `If-Match`; cannot change role/owner/verification status |
| `GET /me/contact` | Account, alumni owner | Private contact DTO; separate from profile projection |
| `PUT /me/contact` | Account, alumni owner | Optional phone/private contact email, `If-Match`; never changes login identity implicitly |
| `GET /me/education`, `GET /me/education/{id}`, `GET /me/employment`, `GET /me/employment/{id}` | Account, alumni owner | Own bounded lists and detail DTOs; details return `ETag` for subsequent edits; not a public profile expansion |
| `POST /me/education` and `POST /me/employment` | Account, alumni owner | Validated records; server assigns owner |
| `PUT /me/education/{id}` and `PUT /me/employment/{id}` | Account, alumni owner | Full editable record, `If-Match`; material verified-education changes trigger re-review |
| `DELETE /me/education/{id}` and `DELETE /me/employment/{id}` | Account, alumni owner | `If-Match`; history/verification rules apply; delete is a service operation |
| `POST /me/verification-requests` | Account, alumni owner | M2B: `{confirmAccuracy:true}`, exact own-verification If-Match; server snapshots current evidence; `201`; no client-set result |
| `GET /me/verification-requests` | Account, alumni owner | M2B: current safe summary and ETag; historical list deferred |
| `PUT /me/privacy-preferences` | Account, alumni owner | M2B: directoryOptIn and PRIVATE/ALUMNI_MEMBERS only, exact If-Match; consent/employer fields remain future-only |
| `GET /me/privacy-preferences` | Account, alumni owner | M2B: own preferences, profile existence, private defaults and ETag |
| `GET /alumni` and `GET /alumni/{id}` | Alumni | Only opted-in `ALUMNI_MEMBERS`, active, VERIFIED professional profiles; no contact fields; known IDs do not bypass private visibility |
| `POST /me/privacy-requests` | Account | Kind (`ACCESS`, `CORRECTION`, `DELETION`) and bounded explanation; `201`; no immediate destructive operation |
| `GET /me/privacy-requests` and `GET /me/privacy-requests/{id}` | Account, owner | Own request status and safe outcome; never unrestricted data export |

`DirectoryAlumniDto` proposed allowlist: `id`, `displayName`, `headline`, `departmentName`, `graduationYear`, optional `city` and curated professional summary. `OwnerProfileDto` and `AdminAlumniDto` are independent schemas. No peer/public DTO returns personal email, phone or detailed contact information. Unknown fields/filters such as `include=email` are rejected, not honored. Mentor opt-in uses a separate professional-card projection and does not override private full-profile visibility. Administrative contact access uses the audited route below.

## Careers, mentorship and event routes

| Method and path | Access | Behavior |
| --- | --- | --- |
| `GET /jobs`, `GET /jobs/{id}` | Alumni | Member-only job DTO with lifecycle, `applicationMode` and `canApply`; closed historical items cannot initiate new handoffs |
| `GET /me/saved-jobs` | Alumni | Own bookmarks; removed/unavailable jobs receive a safe unavailable representation |
| `PUT /me/saved-jobs/{jobId}`, `DELETE /me/saved-jobs/{jobId}` | Alumni | Idempotent own bookmark add/remove; eligibility checked on add |
| `POST /jobs/{id}/application-handoffs` | Alumni | No user-provided redirect/body data; recheck open external-mode job and current eligibility; `200` destination DTO resolved from stored URL; no application is created |
| `GET /mentors`, `GET /mentors/{id}` | Alumni | Approved opted-in eligible professional cards; no personal contact information |
| `GET /me/mentor-profile`, `PUT /me/mentor-profile` | Alumni, owner | Read/create/update own expertise, capacity and opt-in; update uses `If-Match`, initial create uses `If-None-Match: *`; approval not writable |
| `POST /me/mentor-profile/review-requests` | Alumni, owner | Submit own mentor profile for staff review; `If-Match` |
| `POST /mentors/{id}/requests` | Alumni | Required topic, message, preferred meeting method/time and session type; service sets `REQUESTED`; no self-request or duplicate REQUESTED/ACCEPTED pair |
| `GET /me/mentorships`, `GET /me/mentorships/{id}` | Alumni, participant | Own incoming/outgoing requests and matches; peer has no access to private staff notes |
| `POST /mentorships/{id}/decisions` | Alumni, receiving mentor | Decision `ACCEPT`/`REJECT`, `If-Match`; only REQUESTED; acceptance rechecks eligibility/capacity, rejection does not require a free place |
| `POST /mentorships/{id}/cancellation` | Alumni, participant under state policy | Requester may cancel REQUESTED; either participant may cancel ACCEPTED; sets CANCELLED, `If-Match` |
| `POST /mentorships/{id}/completion` | Alumni, participant | Confirm completion of ACCEPTED session; sets COMPLETED, `If-Match`; same route for standard/quick |
| `GET /events`, `GET /events/{id}` | Alumni | Published events, safe remaining-capacity information; no roster |
| `POST /events/{id}/registrations` | Alumni | No participant ID; create/reactivate own registration, atomic capacity check; `201` new, `200` reactivated; already registered is `409` |
| `GET /me/event-registrations`, `GET /me/event-registrations/{id}` | Alumni, owner | Own registrations, including cancelled/completed history; detail returns `ETag` for cancellation |
| `POST /me/event-registrations/{id}/cancellation` | Alumni, owner | `If-Match`; release place once; enforce cutoff/start rules |
| `GET /me/dashboard` | Alumni | Authorized personal aggregates/activity summaries with freshness metadata |

MVP application mode is `EXTERNAL_APPLICATION`. The domain discriminator also reserves `INTERNAL_APPLICATION`, but MVP create/update/publication commands reject its activation with `409 APPLICATION_MODE_UNAVAILABLE`. External job creation requires a validated HTTPS `externalApplicationUrl`; it is returned to staff and to an eligible alumni handoff only. The handoff response is `{applicationMode, externalApplicationUrl}`; the frontend opens that destination without sending alumni data, tokens or identifiers. Use no-referrer/noopener link behavior. Do not accept a `returnUrl`/`redirectUrl` input or proxy arbitrary destinations through the server. Handoff completion means navigation only, never application submission.

Internal submission, withdrawal, staff review and application-history routes/DTOs remain future scope in `careers`; they are not registered in MVP. No CV upload is accepted. Future internal jobs will use their own DTO variant without an external URL.

`MentorshipRequestCreateDto` contains `topic`, `message`, `preferredMeetingMethod` (`VIDEO`, `PHONE`, `IN_PERSON`), `preferredTime` (`THIS_WEEK`, `NEXT_WEEK`, `WITHIN_TWO_WEEKS`) and `sessionType` (`STANDARD`, `QUICK`). The response adds ID, canonical `status`, server-resolved time window/timezone and version. Status is output-only; a submitted status is rejected. QUICK uses the same endpoint and the configured duration default (currently 20 minutes in Figma); no quick-request bypass or automatic contact exchange exists.

Full events return `409 EVENT_FULL`; no MVP waitlist endpoint, `WAITLISTED` response or silent enqueue exists. Future waitlists extend the events contract deliberately. All mutations use CSRF and validation even without a request body; a demo role switch never changes server authority.

## Admin routes

Every route in this table starts with `/api/v1/admin`, requires `ADMIN` server-side, and must have a service authorization check. Staff operations that change state require a reason where applicable, audit record and `If-Match` on existing aggregates.

| Relative routes | Responsibility / restrictions |
| --- | --- |
| `GET /alumni`, `GET /alumni/{id}` | Operational search/profile projection without contact fields; bound filters; no bulk export |
| `POST /alumni/{id}/contact-access` | Bounded operational `reasonCode` and optional case reference; return minimal contact DTO only after audit succeeds; requires recent authentication |
| `GET /verification-requests`, `GET /verification-requests/{id}`, `POST /verification-requests/{id}/decisions` | Review submitted PENDING evidence; result VERIFIED/REJECTED with reason; no self-review or role change; adapter data cannot bypass the service |
| `POST /alumni/{id}/verification-revocations` | Reason and current profile version; VERIFIED → PENDING with new review; invalidate member access |
| `GET /accounts/{id}` | Minimal operational account status and `ETag` for suspension/reactivation; no credentials or unnecessary contact fields |
| `POST /accounts/{id}/suspension`, `POST /accounts/{id}/reactivation` | Reasoned status changes, revoke sessions; no role input, protect last usable admin and reject self-targeted staff lockout |
| `GET/POST /organizations`, `GET/PUT /organizations/{id}` | Organization reference data only; no employer credentials/memberships |
| `GET/POST /jobs`, `GET/PUT /jobs/{id}`, `POST /jobs/{id}/publication`, `POST /jobs/{id}/closure`, `POST /jobs/{id}/archival` | External-mode jobs with safe stored URL; draft/edit/valid transitions; no anonymous access or internal application review |
| `GET /mentor-profiles`, `GET /mentor-profiles/{id}`, `POST /mentor-profiles/{id}/decisions` | Review mentor opt-in and eligibility; no self-review |
| `GET /mentorships`, `GET /mentorships/{id}`, `POST /mentorships/{id}/moderation` | Reasoned cancellation of REQUESTED/ACCEPTED records; terminal history immutable; no contact-data sharing |
| `GET/POST /events`, `GET/PUT /events/{id}`, `POST /events/{id}/publication`, `POST /events/{id}/cancellation` | Event lifecycle; capacity cannot fall below occupied places; cancellation schedules notifications |
| `GET /events/{id}/registrations`, `GET /event-registrations/{id}`, `POST /event-registrations/{id}/attendance` | Restricted roster, detail with `ETag` and attendance marking; no public roster or arbitrary outcome field update |
| `GET/POST /publications`, `GET/PUT /publications/{id}`, `POST /publications/{id}/publication`, `POST /publications/{id}/archival` | Staff-curated university announcements/news; select PUBLIC explicitly, audit publication; no alumni data or general CMS privileges |
| `GET /reports/overview` | Live, defined aggregates; bounded dates/filter combinations; small-cohort suppression |
| `GET /audit-events` | Sanitized, paginated, purpose-limited audit access; record reads in audit |
| `GET /notification-deliveries`, `POST /notification-deliveries/{id}/retry` | Sanitized failure details and controlled idempotent retry; no viewing arbitrary private messages |
| `GET /privacy-requests`, `GET /privacy-requests/{id}`, `POST /privacy-requests/{id}/decisions` | Approved privacy workflow; verify identity and retain only safe processing evidence |

Compact `GET/PUT` notation denotes separate operations in the future OpenAPI document. Generic CRUD generated from JPA entities is prohibited. An administrator may not alter another user's ownership or notification preferences through these endpoints. Institutional retention policy values are not writable through a generic configuration endpoint.

## Notification routes

`GET /me/notifications` and `GET /me/notifications/{id}` return only the current account's notifications. `PUT /me/notifications/{id}/read` idempotently marks one as read. `GET/PUT /me/notification-preferences` reads/replaces permitted category/channel preferences for `IN_APP`/`EMAIL`; updates use `If-Match`. All require an active account. Unverified alumni receive account/onboarding messages only. Security-message requirements cannot be disabled through an optional-marketing preference. Provider IDs, SDK payloads and local mock mode never appear as user-selectable transport options.

No public outbox, scheduler, token-envelope or provider callback endpoint exists in the baseline. Provider webhooks, if later needed, require a separate signature-validation and replay-protection contract.

## Payload validation and safe DTOs

Apply Bean Validation to every request DTO/nested collection and path/query input. Proposed bounds: display name 1–100 characters; email up to 254; bio up to 2,000; mentorship topic 1–150 and message 1–1,000; operational explanation up to 1,000. Validate method/time/session enums, time-window resolution and nonblank required fields. Reject unsafe destination schemes, URL credentials, control characters, unapproved/local/internal destinations, invalid ranges, excessive nesting and arrays. Final bounds belong in OpenAPI; no arbitrary URL fetch or external transfer of alumni data is permitted.

Proposed local password bounds: 15–128 characters, permit Unicode/spaces, no trimming or truncation, no arbitrary character-class composition rule. Validate length before expensive hashing and screen known-compromised passwords through an approved privacy-preserving mechanism if selected. Do not echo rejected passwords/tokens in validation errors.

Use a bounded JSON request size (proposed 1 MiB) at ingress and application level; return `413` above it. Rich text needs an allowlist sanitizer; plain text is preferable unless Figma requires formatting. Validate external links and never server-fetch user URLs by default. Test frontend rendering against script/markup injection.

Services validate department existence, deadlines, uniqueness, capacity, workflow state, eligibility, ownership and consent. Database constraints protect races. Actor IDs, role, reviewer, creator, audit fields and timestamps are set by the server. Do not use reflection-based unrestricted object copying.

## Error format

All non-success API responses use `application/problem+json` with RFC 9457 fields and stable extensions. `type` identifies the category; `code` is the application code. `detail` is safe for display, never a stack trace. `instance` is a sanitized path without query/token values; `traceId` matches the request header. See [RFC 9457](https://www.rfc-editor.org/rfc/rfc9457.html).

```json
{
  "type": "urn:mezun360:problem:validation",
  "title": "Request validation failed",
  "status": 400,
  "detail": "One or more fields are invalid.",
  "instance": "/api/v1/me/profile",
  "code": "VALIDATION_FAILED",
  "traceId": "4fb26f0a-25db-4fbe-8c85-1ab756201e52",
  "errors": [
    {
      "field": "displayName",
      "code": "SIZE",
      "message": "Use between 1 and 100 characters."
    }
  ]
}
```

| HTTP status | Example codes | Meaning |
| --- | --- | --- |
| `400` | `VALIDATION_FAILED`, `MALFORMED_JSON`, `UNKNOWN_FIELD`, `TOKEN_INVALID` | Invalid payload/input; token errors do not reveal account details |
| `401` | `AUTHENTICATION_REQUIRED`, `INVALID_CREDENTIALS` | Missing/expired session or generic login failure; API sends JSON, not HTML redirect |
| `403` | `FORBIDDEN`, `ALUMNI_VERIFICATION_REQUIRED`, `MFA_REQUIRED`, `CSRF_INVALID` | Permission/eligibility/MFA or CSRF failure; restricted pre-MFA contexts cannot access admin data |
| `404` | `RESOURCE_NOT_FOUND` | Missing, hidden or non-owned sensitive resource; identical response shape |
| `409` | `APPLICATION_MODE_UNAVAILABLE`, `JOB_NOT_OPEN`, `EVENT_FULL`, `INVALID_STATE`, `MENTOR_UNAVAILABLE` | Domain conflict after authorization; full event is not a waitlist success; do not leak database constraint text |
| `412` | `VERSION_CONFLICT` | `If-Match` no longer matches |
| `413` | `PAYLOAD_TOO_LARGE` | Bounded input exceeded |
| `415` | `UNSUPPORTED_MEDIA_TYPE` | Unexpected request format |
| `428` | `PRECONDITION_REQUIRED` | Required version precondition missing |
| `429` | `RATE_LIMITED` | Include a safe `Retry-After` value |
| `500` / `503` | `INTERNAL_ERROR` / `SERVICE_UNAVAILABLE` | Generic message and trace ID; diagnostic details stay in sanitized internal logs |

Implement matching serializers in the Spring Security authentication entry point/access-denied handler and controller advice. Filter failures must not bypass the problem format. Unauthenticated requests with invalid CSRF may receive `403 CSRF_INVALID` before authentication; specify and test that ordering. Unexpected exceptions never leak credentials, contact data, SQL, stack traces or rejected values.

## Contract verification

OpenAPI must specify request/response DTOs, error schemas, bounds, cookies/CSRF requirements, role/ownership notes, pagination, version preconditions, examples and operation IDs. Mark privileged/private schemas separately and fail contract tests if a public projection gains contact fields. Response schemas exclude additional unintended fields; request schemas disallow unknown properties.

Test guest/unverified/verified/admin and restricted pre-MFA access, including direct calls outside the SPA. Test ownership independently of role, public publication filtering, external mode/destination constraints, canonical verification/mentorship states, visibility/employer-denial and channel portability. Breaking contract changes require a new version or compatible migration window; additive fields still receive privacy review. The frontend must not infer privileges from a mutable browser value.

## Implemented technical authorization probes

GET `/api/v1/admin/security-check`: anonymous 401, ALUMNI 403, ADMIN 200. GET `/api/v1/alumni/security-check`: ALUMNI 200; it tests the role only and must not be reused as proof of alumni verification. Both return `{status:"OK"}` without business data and use server route plus service method checks. No account/role mutation route exists.

## Implemented M2A owner profile contract

The two implemented profile operations are `GET /api/v1/me/profile` and `PUT /api/v1/me/profile`. Both require an active authenticated ALUMNI; guest GET receives 401 and ADMIN receives 403. PUT also requires the existing CSRF token. There is no public, peer, admin inspection or ID-addressed profile endpoint.

M2A chooses the user-authorized **aggregate replacement** option. This supersedes the earlier proposed independent `/me/education` and `/me/employment` CRUD routes, which are not registered. Bounded history/skills/certification arrays are saved atomically with the profile and one concurrency token. Each frontend section edits a local copy and submits the aggregate, preserving other fields. Future independently managed institutional evidence will require its own command boundary; it must not become an editable owner property.

GET returns `{exists, data, completionPercentage, createdAt, updatedAt}` and a strong `ETag`. A new account receives `exists:false`, `data:null`, null timestamps, 0 completion and `ETag: "empty"` without a database write. Existing data contains only the editable professional/profile fields and server-assigned child IDs. No userId, role, email, password, session, visibility or verification fields are returned or writable.

PUT sends the complete `ProfileWrite` DTO from OpenAPI. First/last name are required; optional scalar fields clear when omitted/null/blank. All collections and `contribution` must be present, even when empty. Existing child IDs must belong to the current owner's same collection and must not repeat; absent IDs create new server IDs, omitted existing children are removed. Unknown properties at every nesting level are rejected. Never pass response envelope fields back as editable data. The server derives the owner from the current-account service.

Every PUT requires the exact `If-Match` from the GET, including `"empty"` for first creation. A missing precondition returns 428 `PRECONDITION_REQUIRED`; a stale, weak, wildcard or otherwise mismatched token returns 412 `VERSION_CONFLICT`. Successful PUT returns 200 plus updated envelope/ETag. GET/PUT are `Cache-Control: no-store`. Repeating a PUT with an old token cannot overwrite newer content. The UI keeps a conflicted draft visible and requires explicit reload; it does not retry stale writes automatically.

Bean Validation plus service rules produce the existing RFC 9457 `VALIDATION_FAILED` shape with paths such as `career[0].endDate`. Lists and text are bounded as documented in [database](database.md). Plain text excludes markup/control characters. Credential links must be public-host-shaped HTTPS without credentials, numeric IP/local/internal host forms, unsafe characters or nonstandard ports; the server never fetches or resolves them. Browser links use noopener/noreferrer/no-referrer. This is syntactic link validation, not a certification issuer trust check or DNS-based URL reputation service.

Completion is calculated on every response, not stored: 20 points each for (1) first/last name + department + graduation year + city, (2) nonblank about, (3) at least one employment record, (4) at least one education record, (5) at least one skill. Empty profile scores zero. Current company/position, certifications and contribution choices do not independently add or subtract points. The percentage is an onboarding aid, never evidence of verification or authority.

The reviewed [OpenAPI contract](../contracts/openapi/mezun360.yaml) and generated frontend schema contain these DTOs and operations. Existing identity/security contract drift tests now also cover profile schemas/routes. All other business tables/routes in this document remain target scope unless explicitly marked implemented.

## Implemented M2B API contract

Base `/api/v1`. The [OpenAPI contract](../contracts/openapi/mezun360.yaml) and generated frontend types cover these runtime routes. Account must be current ACTIVE ALUMNI for own onboarding/privacy/verification; institutional VERIFIED is not required to perform onboarding. Guest reads return 401, ALUMNI admin access 403 and ADMIN own-alumni access 403. All writes require the session CSRF token. Client-supplied userId, role, status/source/reviewer and other unknown payload fields are rejected; owner is always resolved from the security context.

| Operation | Request / result |
| --- | --- |
| GET `/me/privacy-preferences` | `{profileExists,directoryOptIn,profileVisibility}`; no profile gives false/false/PRIVATE, no writes. Strong ETag and no-store. |
| PUT `/me/privacy-preferences` | Exactly required boolean directoryOptIn and enum profileVisibility. 200 saved representation/new ETag; 409 PROFILE_REQUIRED if no profile. Two preferences are independent and both must permit future discovery. |
| GET `/me/verification-requests` | `{status,submitted,submittedAt,reviewedAt,rejectionReason}` for current evidence revision, ETag/no-store. Null timestamps/reason for unsubmitted onboarding. No reviewer ID, audit, internal note or evidence in the owner summary. |
| POST `/me/verification-requests` | `{confirmAccuracy:true}`, If-Match from preceding own GET, 201 current summary/new ETag. 409 PROFILE_REQUIRED, EDUCATION_REQUIRED or INVALID_TRANSITION. Rejected can resubmit; submitted PENDING/VERIFIED cannot duplicate. |
| GET `/admin/verification-requests` | ADMIN only. status PENDING (default)/VERIFIED/REJECTED, page 0–10000 (default 0), size 1–50 (default 20). `{items,page,size,totalElements}`, ordered submission time then UUID; current evidence revisions only. Each item: id/name/department/graduationYear/submittedAt/status. no-store; no queue ETag. |
| GET `/admin/verification-requests/{id}` | Minimal immutable evidence, status, dates, safe reason and `current` indicator. ETag includes request version and current profile evidence revision; no-store. No self-review. Historical superseded details show current=false and permit no decision. |
| POST `/admin/verification-requests/{id}/decisions` | `{status:VERIFIED|REJECTED,rejectionReason?}`, exact review If-Match, 200 result/new ETag. Only PENDING current evidence; 409 EVIDENCE_CHANGED/INVALID_TRANSITION/ACCOUNT_INELIGIBLE. Ret reason required, plain text 10–500; VERIFIED reason absent. No role changes. |

Privacy, submission and decision writes return 428 PRECONDITION_REQUIRED for missing exact If-Match, 412 VERSION_CONFLICT for stale/wildcard tags; current business eligibility is checked as well. Invalid payload/query/path returns 400 RFC 9457; missing review returns 404; dependency/audit failures fail closed with sanitized 5xx. Errors never echo personal submitted values. Queues and review reads audit disclosed target IDs; decisions audit VERIFY/REJECT in the same transaction. Existing `/me/profile` DTO stays unchanged; privacy/status use separate endpoints and cache entries. No peer profile, directory, contact, employer, export or role-management endpoint is activated.
