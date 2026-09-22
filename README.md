# Submission notes

- **First commit** (`BE: Initial fix to make BE running`): the backend didn't start as is —
  changed `capture_api` (underscore) to `capture-api` (hyphen) to make it running; also moved the task README into `backend/README.md`.

### How to run

Backend (from the repo root):

```bash
cd backend
uv sync
uv run capture-api serve
```

or `docker compose up -d --build` from the repo root. Comes up on `http://localhost:8700`.

Frontend:

```bash
cd frontend
cp .env.example .env.local   # fill in SESSION_PASSWORD — 32+ random chars, e.g. `openssl rand -base64 32`
npm install
npm run dev
```

Comes up on `http://localhost:3000`. 
Sign in with 
`ana@quillmere.example` / `demo-analyst` (analyst, full access) 
or 
`oli@quillmere.example` / `demo-observer` (observer, sensitive fields redacted).

**Captured data window**: 
as `backend/.env.example` states —
```
# Capture epoch T (ISO-8601 with a zone); history covers [T-72h, T], the live tail grows after T.
CAP_EPOCH=2025-10-27T12:00:00Z
```
so working dates are **25–26 October 2025**. 
If a search comes back empty, try the search form's time window at that range.

### What's done

- **Sign in** — email/password, iron-session-encrypted cookie; the backend access token never
  reaches the browser.
  - `iron-session`: a stateless, encrypted-and-signed cookie session, HTTPonly by default — no session store to run; keeps the backend token server-side by construction. Good fit for a task this size. For production I'd prefer a maintained auth library.
  - A custom `authenticatedBackendFetch` wrapper does the token refresh: checks expiry before each call, refreshes if needed, retries once on a 401. Reasonable for a one-day
    task; in production I'd prefer an existing interceptor-based solution (e.g. an
    axios/fetch interceptor) instead of maintaining this by hand.

- **Search** — capture-point picker, time window, condition builder from `/v1/meta/fields`, job creation with progress polling and cancel, paginated + virtualized results table, sortable once the job is done, clickable row to enter the session detail.
  - TanStack Query for all server state: `useQuery` (with `refetchInterval`) polls job status; `useInfiniteQuery` drives cursor-based result pages. It solves caching, de-duping, and re-fetch timing.
  - The results table pages *while the job is still running* uses a small polling loop that calls `fetchNextPage()` or patches the last page via `queryClient.setQueryData` when there's no next page yet.
  - TanStack Table + TanStack Virtual for the results grid: only visible rows are mounted, so the table stays smooth at thousands of rows instead of degrading with full-DOM rendering.
  - react-hook-form + Zod for the search form: schema-driven validation with minimal re-renders, same pattern as the sign-in form for consistency.

- **Session detail** — full session summary, a hand-built HTTP view and a generic
  view for other protocols built from `/v1/meta/schema/{protocol}`. Redacted fields
  (`{"redacted": true}`) show as "Redacted" for the observer role in both views. A back-link to the originating search is carried via a `searchId` query param.
  - The `searchId` is a query param, not a nested route segment (`/search/[searchId]/[id]`),
    because a session can be fetched independently — `GET /v1/sessions/{id}`; needs no search
    context at all. Nesting it would treat a session as something that only exists within a search, which isn't the case.
  - The Back button only renders when `searchId` is present, so opening a session detail link
    directly doesn't render the button.

- **The compromised machine**: `ws-hb-009.quillmere.example` (10.20.40.18, on the `harbor-branch`
  capture point). Spot it in the interface at
  [`/session-detail/144115231037063169`](http://localhost:3000/session-detail/144115231037063169)
  — its one `smb_mass_read` session, the single clearest piece of evidence.

  How to reproduce this in the built UI (Search screen → condition builder → results table →
  Session detail — the only screens used, no backend source read to get the answer):
  1. Search with all 3 capture points, the full time window, one condition: Field **Detection
     rule**, Operator **exists**. Comes back with 5,000+ matches — detections alone are far too
     noisy to read one by one (this is the brief's "things that look suspicious and are harmless").
  2. Narrow the same condition to Operator **eq**, Value **periodic_tls_beacon**. Scroll the
     results table's **Source** column: `ws-hb-009.quillmere.example` appears far more often than
     any other host. Click a couple of its rows into Session detail — same destination every time,
     `203.0.113.201:443`, flagged high risk for a self-signed cert, a CN/SNI mismatch, and a rare
     domain.
  3. Re-run the same search and open a couple of rows for the *other* hosts that also trip
     `periodic_tls_beacon` (e.g. `ws-hq-081.quillmere.example`) — their destination is
     `updates.vendor.example` every time, a shared vendor-update endpoint. They're tripping the
     same heuristic against a legitimate, widely-used service, not talking to unique C2
     infrastructure. Ruled out.
  4. New search, same condition, Value **smb_mass_read**. Exactly one result, and it's
     `ws-hb-009` again — a mass file read against `\\FS01\finance$`, MITRE T1039 (Data from
     Network Shared Drive). This is the smoking gun linked above.
  5. New search, same condition, Value **lookalike_sender**. Exactly one result: a phishing email
     from `quillrnere-freight.example` (a typosquat — "rn" standing in for "m") to
     `jarek.bellmark@quillmere.example`, with a macro-enabled `.xlsm` attachment, timestamped about
     2.5 hours before `ws-hb-009`'s first beacon — the likely initial-access vector.
  - Also ruled out: `scan-it-01.quillmere.example` dominates `port_scan` (200 hits) but is clearly
    a sanctioned internal scanner by name, with no other correlated detection anywhere in its
    history. `cleartext_credentials` and `rare_user_agent` are both spread thinly across 100+ hosts
    with 1–4 hits each — generic background noise, no standout host.
  - Honesty note: investigation was done by Claude, but every step is what
    the built Search form's condition builder and results table support, and is reproducible by
    hand in the running app.

### What's not done - ran out of time

- SSE/WebSocket live feed, PCAP/file download, saved queries — explicitly optional in the brief, skipped in favor of finishing the three required screens properly rather than starting all of them.


### Tests

`cd frontend && npm test` — 20 tests across 2 files:

- `src/components/forms/search-form/search-filter/search-filter.test.ts` — the search form's
  filter-tree building logic.
- `src/components/session-detail/resolve-schema-field-value.test.ts` — the generic protocol view's
  schema-path resolver.


### AI usage

Built with Claude Code (Claude Sonnet 5).
