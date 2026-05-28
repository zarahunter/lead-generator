# Setup

How to get the Lead Generator running on a fresh machine after `git clone`.

The repo contains **everything except the two `.env` files** — those are gitignored on purpose because they hold secrets. You'll need to recreate them by hand using the values from each service's dashboard.

## Prerequisites

```bash
# Node 20+
node --version

# Supabase CLI — only if you'll push schema migrations from this machine
brew install supabase/tap/supabase
```

The Trigger.dev CLI runs via `npx`, no install needed.

## 1. Clone and install dependencies

```bash
git clone https://github.com/zarahunter/lead-generator.git
cd lead-generator

# Two independent projects — install each
cd equipment/trigger  && npm install && cd -
cd equipment/frontend && npm install && cd -
```

## 2. Create the two `.env` files

Both gitignored. Both required. Copy the `.env.example` templates already in the repo and fill them in.

### `equipment/trigger/.env`

Used by the Trigger.dev task at runtime. The `syncEnvVars` extension in [`trigger.config.ts`](./equipment/trigger/trigger.config.ts) forwards these to the Trigger.dev cloud on every `trigger deploy`.

```env
FIRECRAWL_API_KEY=fc-...
SUPABASE_URL=https://<projectref>.supabase.co
SUPABASE_SERVICE_ROLE_KEY=eyJ...
ANTHROPIC_API_KEY=sk-ant-...

# Only used locally for `supabase link`. Not synced to Trigger.dev.
SUPABASE_DB_PASSWORD=...
```

| Variable | Where to find it |
|---|---|
| `FIRECRAWL_API_KEY` | https://www.firecrawl.dev/app/api-keys |
| `SUPABASE_URL` | Supabase dashboard → Project Settings → API → "Project URL" |
| `SUPABASE_SERVICE_ROLE_KEY` | Supabase dashboard → Project Settings → API → **service_role** **secret** (NOT the anon key — click "Reveal") |
| `SUPABASE_DB_PASSWORD` | Supabase dashboard → Project Settings → Database → "Database password" (reset if forgotten) |
| `ANTHROPIC_API_KEY` | https://console.anthropic.com/settings/keys |

### `equipment/frontend/.env.local`

Used by the Next.js app.

```env
TRIGGER_SECRET_KEY=tr_prod_...
APP_PASSWORD=...
```

| Variable | Where to find it |
|---|---|
| `TRIGGER_SECRET_KEY` | Trigger.dev dashboard → Lead_generator project → API Keys → environment toggle set to **Prod** → copy the secret key |
| `APP_PASSWORD` | Any string of your choice (32+ chars recommended). This is the shared password to access the UI — set it once, remember it, use it at `/login`. |

> Use a `tr_prod_*` key to trigger the deployed cloud task. Use a `tr_dev_*` key if you'd rather run `npx trigger.dev@latest dev` in a second terminal and iterate on task code locally.

## 3. One-time CLI auths (only if you'll deploy/migrate from this machine)

Skip both of these if you only plan to run the frontend locally against the already-deployed cloud task.

```bash
# Trigger.dev — needed for `trigger deploy`
npx trigger.dev@latest login

# Supabase — needed for `supabase db push`
supabase login
supabase link --project-ref <projectref>
```

## 4. Run it

```bash
# Frontend (against the cloud-deployed task)
cd equipment/frontend
npm run dev
# → http://localhost:3000
```

Open the URL, log in with your `APP_PASSWORD`, fill the form, watch the run page light up.

### Optional: iterate on task code locally

```bash
# Terminal 1
cd equipment/trigger
npx trigger.dev@latest dev

# Terminal 2 (only needed if you swapped TRIGGER_SECRET_KEY to a tr_dev_* key)
cd equipment/frontend
npm run dev
```

## Architecture pointer

The system, contracts, and failure modes are documented in [`blueprints/lead-generation-workflow.md`](./blueprints/lead-generation-workflow.md). Read it before changing anything in `/equipment`.
