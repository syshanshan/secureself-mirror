-- SecureSelf Mirror database schema
-- Run this in your Supabase SQL editor

create table if not exists public.mirror_entries (
  id uuid primary key default gen_random_uuid(),
  session_id text not null,
  situation text not null,
  original_message text not null,
  anxious_pattern_analysis text not null,
  anxiety_score integer not null check (anxiety_score >= 0 and anxiety_score <= 100),
  secure_rewrite text not null,
  boundary_statement text not null,
  suggested_next_action text not null,
  what_not_to_do text not null,
  created_at timestamptz not null default now()
);

create index if not exists mirror_entries_session_created_idx
  on public.mirror_entries (session_id, created_at desc);

alter table public.mirror_entries enable row level security;

create policy "Allow read mirror entries"
  on public.mirror_entries for select
  using (true);

create policy "Allow insert mirror entries"
  on public.mirror_entries for insert
  with check (true);

-- For production, tighten RLS to match session_id from a signed cookie or auth uid.
