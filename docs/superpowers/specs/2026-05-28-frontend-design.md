# Frontend Design — Lead Generator UI

**Date:** 2026-05-28
**Status:** Approved
**Architecture source of truth:** [`blueprints/lead-generation-workflow.md`](../../../blueprints/lead-generation-workflow.md)

This spec covers the UX and visual layer only. The page set, server action, realtime subscription, schema, and auth model are all already defined in the Blueprint — this spec does not change them.

## Goals

- Clean, opinionated UI for a single-user internal tool (the operator)
- Fully interactive — no manual refresh, no polling loops, inline validation, live status
- Single workflow: submit form → watch task run live → see ≤10 leads

## Non-goals

- Run history list (out of scope per Blueprint: "one workflow today")
- User management, roles, sharing
- Lead editing, tagging, CRM export
- Mobile-first design (responsive yes, but desktop is the primary target)

## Pages

### `/login`
Centered card. Single password input, one "Sign in" button. POSTs to a server action that compares against `APP_PASSWORD` and sets an HttpOnly cookie. On success → redirect to `/`. On failure → inline error.

### `/` (form)
Single-column vertical layout, max-width ~640px, centered, generous vertical padding.

- **Header:** app title (left), "Logout" link (right, clears cookie)
- **Form card** with five fields, in this order:
  1. Business description — `textarea`, ~3 rows, placeholder hint
  2. ICP (ideal customer profile) — `textarea`, ~3 rows
  3. Lead type — `input text` (e.g. "decision makers", "founders")
  4. Region — `input text`, optional (e.g. "EU", "London")
  5. Count — `input number`, min 1, max 10, default 5
- **Validation:** zod schema mirrors `equipment/trigger/src/lib/schema.ts` exactly (single source of truth for shape). Errors appear inline below each field, debounced.
- **Submit button:** "Generate leads". Disabled while pending. Spinner + label change to "Triggering…" during the server action call.
- **Last-used inputs:** form values persisted to `localStorage` on submit so re-runs are one keystroke away. Auto-restore on mount.

### `/runs/[id]` (results)
Live view of a single Trigger.dev run, subscribed via `useRealtimeRun(id)`.

- **Status banner** at top — pill-shaped, color-coded:
  - `Pending` — gray, pulsing dot
  - `Running` — blue, animated spinner
  - `Success` — green, checkmark
  - `Error` — red, "Try again" link back to `/` (form pre-filled from localStorage)
- **Skeleton cards** (3 placeholder cards with shimmer) shown until `run.output` arrives
- **Lead cards**, one per lead:
  - Top row: `name` (bold) · `title` (subtle, if present)
  - Second row: `company` · source domain pill
  - Third row: `snippet` (1–2 sentences, muted)
  - Hover row: "Copy email" (only if `email` present) · "Open source" (opens `url` in new tab). Toast confirms copy.
- **Empty state** (0 leads returned): friendly "No leads matched" copy + "Try again" link
- **Footer:** "Generate another" button → returns to `/` with last input pre-filled

## Visual baseline

- **Stack:** Tailwind v4 (default Next.js 15 install), no UI library
- **Palette:** neutral grays (Tailwind `slate` or `zinc`) with one accent color for primary actions (default: `indigo-600`). Configurable via single Tailwind theme variable.
- **Typography:** Tailwind defaults (Inter via `next/font`). Tight line-height on inputs, generous on body.
- **Shape:** rounded-lg corners on cards, rounded-md on inputs/buttons. Subtle shadow on cards (`shadow-sm`).
- **Spacing:** generous — 24px gaps between form fields, 16px gaps between lead cards
- **Dark mode:** not in scope for v1
- **Responsive:** layout collapses cleanly on mobile (single column already)

## Interactivity highlights

| Behavior | Implementation |
|---|---|
| Live run status | `useRealtimeRun` from `@trigger.dev/react-hooks` — no polling |
| Inline validation | zod + react-hook-form, errors render below each field |
| Optimistic submit | Button disabled + spinner state set immediately on click |
| Copy email | `navigator.clipboard.writeText` + shadcn-style toast |
| Persisted form state | `localStorage` write on submit, read on mount |
| Keyboard | Enter in any field submits the form (form is the focus parent) |

## File structure (mirrors Blueprint)

```
equipment/frontend/
├── src/
│   ├── app/
│   │   ├── page.tsx                  ← form
│   │   ├── login/page.tsx            ← password gate
│   │   ├── runs/[id]/page.tsx        ← results view
│   │   ├── actions/
│   │   │   ├── generate.ts           ← server action: tasks.trigger
│   │   │   └── auth.ts               ← server action: login + logout
│   │   ├── layout.tsx                ← root layout + fonts
│   │   └── globals.css               ← tailwind
│   ├── components/
│   │   ├── lead-form.tsx             ← client component
│   │   ├── lead-card.tsx
│   │   ├── status-banner.tsx
│   │   ├── skeleton-card.tsx
│   │   └── toast.tsx
│   ├── lib/
│   │   ├── schema.ts                 ← zod (mirrors trigger schema)
│   │   ├── trigger.ts                ← trigger.dev SDK client (server-only)
│   │   └── auth.ts                   ← cookie helpers
│   └── middleware.ts                 ← APP_PASSWORD cookie gate
├── .env.local                        ← already has TRIGGER_SECRET_KEY + APP_PASSWORD
├── package.json
└── tsconfig.json
```

## Env vars used

| Variable | Where |
|---|---|
| `TRIGGER_SECRET_KEY` | server action (`tasks.trigger`) |
| `TRIGGER_PROJECT_REF` | server action (passed to SDK config) |
| `SUPABASE_URL` | reserved (not used in v1 — we read from `run.output` not Supabase) |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | reserved (not used in v1) |
| `APP_PASSWORD` | middleware + login server action |

Per the Blueprint: "frontend reads `run.output.leads` and renders" — Supabase reads are optional fallback, not v1.

## Open decisions deferred

- Theme accent color — picking `indigo-600` for now, easy to swap later
- Toast library — using a hand-rolled minimal toast for v1 (avoid extra deps)
- Run-realtime token — using server-side `TRIGGER_SECRET_KEY` to fetch a public access token at page load, passed to `useRealtimeRun`. Standard Trigger.dev v3 pattern.
