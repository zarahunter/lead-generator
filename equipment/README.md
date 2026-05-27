# Equipment

Executable code for the AI Lead Generator. Two subprojects in one repo:

| Folder | What | Deploys to |
|---|---|---|
| [`frontend/`](./frontend/) | Next.js 15 (App Router) — form, results view, password gate | Vercel |
| [`trigger/`](./trigger/) | Trigger.dev v3 project — the `generate-leads` task | Trigger.dev cloud |

## How they connect

```
Browser ──► frontend (Next.js server action)
              │
              ▼  tasks.trigger("generate-leads", payload)
           trigger (Trigger.dev task)
              │
              ▼  Firecrawl + LLM
           Supabase (runs, leads)
              │
              ▼
           frontend (Realtime / read by runId)
```

The frontend never talks to Firecrawl or the LLM directly — those live behind the Trigger.dev task. The frontend only triggers the task and reads its output.

## Dev

```bash
# In one terminal — frontend
cd frontend && pnpm dev

# In another — Trigger.dev dev server
cd trigger && npx trigger.dev@latest dev
```

Env vars (in each app's `.env.local`): see the table in [`../CLAUDE.md`](../CLAUDE.md).

## Deploy

```bash
# Trigger.dev tasks
cd trigger && npx trigger.dev@latest deploy

# Frontend
cd frontend && vercel --prod
```

## Read the Blueprint first

Before changing anything here, read [`../blueprints/lead-generation-workflow.md`](../blueprints/lead-generation-workflow.md). When you change behavior, update that file in the same commit.
