# Trigger — Trigger.dev v3 project (placeholder)

Trigger.dev v3 project hosting the `generate-leads` task. Deployed to Trigger.dev cloud.

**Not initialized yet.** Bootstrap with:

```bash
cd /Users/zara/Lead_generator_triggerdev/equipment/trigger
npx trigger.dev@latest init
```

Run the dev server with `npx trigger.dev@latest dev`.

## What it will contain

- `trigger/generate-leads.ts` — the only task. Payload + output schema in the Blueprint.
- `trigger.config.ts` — project ref, runtime, retries.
- Helpers: Firecrawl client, LLM client, Supabase service-role client.

## Contract

Task name: `generate-leads`. Payload, steps, output schema, dedupe/cap rule, and failure modes are all defined in [`../../blueprints/lead-generation-workflow.md`](../../blueprints/lead-generation-workflow.md). Read it before adding or changing the task.

## Env

See the env-var table in [`../../CLAUDE.md`](../../CLAUDE.md). Task uses: `FIRECRAWL_API_KEY`, `SUPABASE_URL`, `SUPABASE_SERVICE_ROLE_KEY`, `OPENAI_API_KEY` *or* `ANTHROPIC_API_KEY`. Trigger.dev itself injects `TRIGGER_*` at runtime.
