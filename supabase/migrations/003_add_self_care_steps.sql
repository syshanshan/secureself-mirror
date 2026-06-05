-- Add self-care steps column to mirror_entries (for existing projects)
alter table public.mirror_entries
  add column if not exists self_care_steps jsonb not null default '[]'::jsonb;
