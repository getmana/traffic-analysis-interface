@AGENTS.md

# Test task alignment

This app is the frontend for the test task described in the repo root's
[README.md](../README.md). Re-read that file if unsure — it is the source of
truth. `backend/` is a working, deterministic traffic simulator; do not modify
it.

## Hard requirements (do not deviate without flagging it)

- **No direct browser-to-backend calls.** CORS is off on the backend on
  purpose. Every backend call goes through this Next.js server (route
  handlers acting as a BFF) — never `fetch` the backend from client
  components.
- **The backend access token must never reach the browser.** Exchange
  credentials for it server-side, keep it server-side (session store /
  encrypted cookie), and hand the browser only an opaque session. A HAR
  capture of the app must not contain the backend token.
- **Three required screens**, in priority order:
  1. **Sign in** — email + password.
  2. **Search** — pick capture points + time window, build a condition from
     `/v1/meta/fields`, start a search job, follow its progress, and page
     through results while it is still running. Table must stay usable with
     thousands of rows (virtualization/pagination, not "render everything").
  3. **Session detail** — full decoded protocol transaction. One protocol
     gets a hand-built, properly laid-out view; every other protocol falls
     back to a generic view driven by `/v1/meta/schema/{protocol}`.
- Everything else (SSE/WebSocket live feed, PCAP/file download, saved
  queries) is optional, lower priority than finishing the three screens
  above, and only worth starting if time remains. Prefer one fully finished
  thing over several half-started ones.

## Stack

Already scaffolded: Next.js (App Router, `src/`) + TypeScript + Tailwind v4 +
shadcn/ui (on Radix). The task README suggests TanStack Query and Table too —
use them where they fit (job polling, paged/virtualized tables); they are a
recommendation, not a requirement.

## The investigation task

One capture-point machine is compromised. Find it using the built UI, not by
reading backend source. When found, document it in the root README.md: link
to the exact spot in the interface, and a couple of sentences on how it was
found and what was ruled out along the way.

## Submission expectations

- Meaningful commit history (this is graded).
- Root README.md must say how to run the app, what's done, what isn't, and
  why.
- At least one test.
- If AI was used, say where and what was hand-fixed.
- If something in the backend API looks broken or inconsistent, say so
  rather than silently working around it.
