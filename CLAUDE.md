# AI Lead Generator — Architect's Brief

## Mission

Generate up to 10 qualified sales leads on demand. A user describes their business and the type of lead they want; the system scrapes the open web with Firecrawl, extracts structured contacts with an LLM, persists them in Supabase, and renders them in the UI.

## The ABE Model

This project runs on the **Three-Engine ABE Model**:

- **A — Architect (you, Claude Code).** Reads Blueprints, operates on Equipment, keeps both in sync.
- **B — Blueprints ([`/blueprints`](./blueprints/)).** Workflow plans and SOPs. The source of truth for *how* the system should behave.
- **E — Equipment ([`/equipment`](./equipment/)).** The executable code — Trigger.dev tasks and the Next.js frontend. The source of truth for *what* the system does.

**The working rule:** read the Blueprint → operate on Equipment → update the Blueprint in the same change when behavior changes. A Blueprint that disagrees with its Equipment is a bug.

## System Flow

```
Form (Next.js)
   → server action
   → tasks.trigger("generate-leads", payload)
   → Firecrawl /search + /scrape
   → LLM extracts structured leads
   → Supabase upsert (runs + leads)
   → frontend reads run output (Trigger.dev Realtime)
   → render ≤10 leads
```

## Tech Stack

- **Frontend:** Next.js 15 (App Router, TypeScript), Tailwind, deployed to **Vercel**
- **Background work:** Trigger.dev v3
- **Scraping:** Firecrawl SDK
- **Storage:** Supabase (Postgres)
- **LLM:** OpenAI or Anthropic SDK (extraction step)

## Repo Map

```
.
├── CLAUDE.md                              ← this file
├── blueprints/
│   └── lead-generation-workflow.md        ← the SOP
└── equipment/
    ├── frontend/                          ← Next.js app  → Vercel
    └── trigger/                           ← Trigger.dev tasks
```

## Operating Rules for the Architect

1. **Read the Blueprint first.** Before editing anything in `/equipment`, read [`blueprints/lead-generation-workflow.md`](./blueprints/lead-generation-workflow.md).
2. **Keep them in sync.** When you change behavior in `/equipment`, update the matching section of the Blueprint in the same change.
3. **No hardcoded secrets.** Every secret is an env var (list below). Values live in `.env.local`, which is gitignored.
4. **Cap at 10.** The 10-lead limit is enforced *inside* the Trigger.dev task, not in the UI. The UI trusts what it receives.
5. **One workflow today.** If a second user-facing flow appears (e.g. "enrich existing leads"), give it its own Blueprint — do not bolt it onto this one.

## Key Commands

```bash
# Frontend dev server
pnpm --filter frontend dev

# Trigger.dev dev server (run from /equipment/trigger)
npx trigger.dev@latest dev

# Deploy Trigger.dev tasks
npx trigger.dev@latest deploy

# Deploy frontend
vercel --prod
```

## Environment Variables

Names only. Values live in `.env.local` (gitignored).

| Variable | Used by |
|---|---|
| `TRIGGER_SECRET_KEY` | Frontend (server-side) — to trigger tasks |
| `TRIGGER_PROJECT_REF` | Trigger.dev project ref |
| `FIRECRAWL_API_KEY` | Trigger.dev task |
| `SUPABASE_URL` | Frontend + task |
| `SUPABASE_SERVICE_ROLE_KEY` | Task (writes), frontend server actions (reads) |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Frontend client (read-only via RLS) |
| `APP_PASSWORD` | Next.js middleware — shared-secret gate |
| `OPENAI_API_KEY` *or* `ANTHROPIC_API_KEY` | Task — lead extraction |

## Pointer

The single Blueprint: [`blueprints/lead-generation-workflow.md`](./blueprints/lead-generation-workflow.md)
