# Frontend — Next.js (placeholder)

Next.js 15 (App Router, TypeScript) app deployed to Vercel.

**Not initialized yet.** Bootstrap with:

```bash
cd /Users/zara/Lead_generator_triggerdev/equipment/frontend
npx create-next-app@latest . --ts --tailwind --app --eslint --src-dir --import-alias "@/*"
```

## What it will contain

- `app/page.tsx` — the lead-generation form
- `app/runs/[id]/page.tsx` — results view (renders ≤10 leads for a given run)
- `app/actions/generate.ts` — server action calling `tasks.trigger("generate-leads", ...)`
- `middleware.ts` — `APP_PASSWORD` cookie gate
- `app/login/page.tsx` — sets the password cookie
- `lib/schema.ts` — zod schema for the form input

## Contract

Inputs/outputs and behavior are defined in [`../../blueprints/lead-generation-workflow.md`](../../blueprints/lead-generation-workflow.md). Read it before adding or changing pages.

## Env

See the env-var table in [`../../CLAUDE.md`](../../CLAUDE.md). Frontend uses: `TRIGGER_SECRET_KEY`, `TRIGGER_PROJECT_REF`, `SUPABASE_URL`, `SUPABASE_SERVICE_ROLE_KEY`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`, `APP_PASSWORD`.
