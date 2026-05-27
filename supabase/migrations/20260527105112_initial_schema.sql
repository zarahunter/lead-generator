-- Schema for the Lead Generator project.
-- Source of truth: blueprints/lead-generation-workflow.md (Supabase tables section).
-- Safe to re-run.

create extension if not exists pgcrypto;

create table if not exists runs (
  id uuid primary key default gen_random_uuid(),
  trigger_run_id text not null unique,
  input jsonb not null,
  status text not null default 'pending',  -- pending | success | error
  created_at timestamptz not null default now()
);

create table if not exists leads (
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

create index if not exists leads_run_id_idx on leads (run_id);

-- RLS: writes go through the service role (Trigger.dev task + Next.js server
-- actions), which bypasses RLS. Enable RLS so the anon key cannot write.
alter table runs  enable row level security;
alter table leads enable row level security;
