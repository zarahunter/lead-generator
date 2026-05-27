# Blueprint — Lead Generation Workflow

The single workflow this project ships. Any change to the path *form → task → leads in UI* must be reflected here in the same change that touches `/equipment`.

## When to use this Blueprint

Read this before editing any of:

- `/equipment/frontend/app/**` — form, server actions, results view
- `/equipment/frontend/middleware.ts` — password gate
- `/equipment/trigger/trigger/generate-leads.ts` — the task
- Supabase schema (`runs`, `leads`)

## Input schema

Submitted by the form, passed verbatim as the Trigger.dev task payload.

```ts
type GenerateLeadsInput = {
  businessDescription: string;   // what the user's business does
  icp: string;                   // ideal customer profile, free text
  leadType: string;              // e.g. "decision makers", "agencies"
  region?: string;               // optional geo filter
  count: number;                 // requested leads, clamped to 1..10
};
```

Validation lives in `/equipment/frontend/app/lib/schema.ts` (zod). The Trigger.dev task re-validates — never trust the client.

## Steps

1. **Form submit** — frontend validates with zod and calls a server action.
2. **Trigger the parent task** — server action calls `tasks.trigger("generate-leads", payload)` (Trigger.dev SDK, server-side) and returns the run handle to the client.
3. **Upsert run row** — parent task `upserts` into `runs` keyed on `trigger_run_id` (the unique constraint). Status `pending`. Upsert (not insert) so a retry of the parent doesn't create a duplicate row.
4. **Call the scrape+extract subtask** — parent calls `scrapeAndExtract.triggerAndWait(payload, { idempotencyKey: 'scrape-extract:<ctx.run.id>', idempotencyKeyTTL: '1h' })`. The idempotency key is derived from the parent run id so that on parent retry the subtask's cached output is reused instead of re-burning Firecrawl + LLM credits.
5. **Inside the subtask:**
   1. Firecrawl `/search` with a query built from `businessDescription + icp + leadType + region`.
   2. Firecrawl `/scrape` the top results (markdown mode). Per-URL failures are skipped (not retried — see failure-modes table).
   3. LLM call (Anthropic `claude-sonnet-4-6`) converts scraped markdown into `Lead[]`. Prompt requests strict JSON.
   4. Dedupe by `(domain, email || name)`; **truncate to 10**. The cap is enforced here, never in the UI.
   5. Subtask output: `{ leads: Lead[] }`.
6. **Persist** — parent calls `replaceLeads(runId, leads)`: delete any rows for this `run_id`, then bulk-insert the returned leads. Delete-then-insert keeps the step idempotent on parent retry. Then `updateRunStatus(runId, 'success')`.
7. **Return** — parent task output: `{ runId: string, leads: Lead[] }`.
8. **Render** — frontend subscribes to the run via Trigger.dev Realtime (`useRealtimeRun`). On completion, it reads `run.output.leads` and renders. (Optional fallback: read directly from Supabase by `runId`.)

### Why the subtask split

A parent retry re-executes `run()` from the top. Without the split, every retry would re-call Firecrawl `/search`, re-scrape every URL, and re-call the LLM — minutes of latency and real money per attempt. With `triggerAndWait` + idempotency key, scrape+extract runs **at most once per parent run id**. Retries only re-run the cheap parts (DB writes).

## Output schema

```ts
type Lead = {
  name: string;
  title?: string;
  company: string;
  url: string;          // source page
  email?: string;
  source: string;       // hostname of url
  snippet: string;      // 1–2 sentence context from scrape
};
```

## Supabase tables

```sql
create table runs (
  id uuid primary key default gen_random_uuid(),
  trigger_run_id text not null unique,
  input jsonb not null,
  status text not null default 'pending',  -- pending | success | error
  created_at timestamptz not null default now()
);

create table leads (
  id uuid primary key default gen_random_uuid(),
  run_id uuid not null references runs(id) on delete cascade,
  name text not null,
  title text,
  company text not null,
  url text not null,
  email text,
  source text not null,
  snippet text not null,
  created_at timestamptz not null default now()
);

create index on leads (run_id);
```

**RLS:** writes only via `SUPABASE_SERVICE_ROLE_KEY` (used inside the Trigger.dev task and Next.js server actions). The browser uses the anon key with read-only policies — or doesn't talk to Supabase at all and reads `run.output` instead. Pick one in implementation; do not enable both write paths.

## Auth

Next.js middleware (`middleware.ts`) checks an `APP_PASSWORD` cookie before any server action runs. A simple `/login` route accepts the password and sets the cookie. Failed checks 401.

## Failure modes

| Failure | Handling |
|---|---|
| Firecrawl rate-limit / 429 | Throw. Trigger.dev retries the whole task (3 attempts, exp backoff — configured in `trigger.config.ts`). After final failure, run is marked `error`. |
| LLM returns < 10 leads | Fine. Return what you have. |
| LLM returns > 10 leads | Truncate. |
| LLM returns invalid JSON | Throw. Trigger.dev retries the whole task. |
| Supabase insert fails | Throw. Trigger.dev retries the whole task. |
| Task exceeds Trigger.dev timeout | Trigger.dev marks run failed; frontend shows the error state. |
| Individual scrape URL fails | Skip that URL (not a retry — fault tolerance). The task continues with the remaining scraped pages. |

**Retry policy:** all transient-error retries are delegated to Trigger.dev (see `retries` in `trigger.config.ts`). No hand-rolled backoff loops inside task helpers.

## Verification

After any change to this workflow:

1. `pnpm --filter frontend dev` and `npx trigger.dev@latest dev` both running.
2. Submit the form with a real business description.
3. Trigger.dev dashboard shows the run, with logs from each step.
4. Supabase: `select count(*) from leads where run_id = ...` ≤ 10.
5. UI renders the leads. Refresh: leads still there (read from Supabase by `runId` in the URL).
