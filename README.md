# Submission notes

- **First commit** (`BE: Initial fix to make BE running`): the backend didn't start as shipped —
  `backend/Dockerfile`'s `CMD` invoked `capture_api` (underscore), but the actual installed console
  script is `capture-api` (hyphen). Fixed the `CMD` so `docker compose up` gets the backend past its
  healthcheck; also moved the task brief into `backend/README.md` at this point.

### Running it

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

Comes up on `http://localhost:3000`. Sign in with `ana@quillmere.example` / `demo-analyst`
(analyst, full access) or `oli@quillmere.example` / `demo-observer` (observer, sensitive fields
redacted).

**Captured data window**: as `backend/.env.example` states —

```
# Capture epoch T (ISO-8601 with a zone); history covers [T-72h, T], the live tail grows after T.
CAP_EPOCH=2025-10-27T12:00:00Z
```

so with the default epoch, working dates are **25–26 October 2025**. If a search comes back empty,
this is almost always why — point the search form's time window at that range rather than assuming
something's broken.

### What's done

- **Sign in** — email/password, iron-session-encrypted cookie; the backend access token never
  reaches the browser (checked with a HAR capture).
- **Search** — capture-point picker, time window, condition builder from `/v1/meta/fields`, job
  creation with progress polling and cancel, paginated + virtualized results table (TanStack Table
  + Virtual, so it stays smooth at thousands of rows), sortable once the job is done, click a row
  to open its session detail.
- **Session detail** — full session summary (risk, bytes, detections, carved files, PCAP
  availability), a hand-built HTTP view and a generic
  view for every other protocol built from `/v1/meta/schema/{protocol}`. Redacted fields
  (`{"redacted": true}`) show as "Redacted" for the observer role in both views. A back-link to the
  originating search is carried via a `searchId` query param.

### What's not done - ran out of time

- **The compromised-machine investigation.** 
- SSE/WebSocket live feed, PCAP/file download, saved queries — explicitly optional in the brief,
  skipped in favor of finishing the three required screens properly rather than starting all of
  them.


### Tests

`cd frontend && npm test` — 20 tests across 2 files:

- `src/components/forms/search-form/search-filter/search-filter.test.ts` — the search form's
  filter-tree building logic.
- `src/components/session-detail/resolve-schema-field-value.test.ts` — the generic protocol view's
  schema-path resolver.


### AI usage

Built with Claude Code (Claude Sonnet 5).
