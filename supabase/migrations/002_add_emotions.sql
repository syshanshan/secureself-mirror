-- Add emotions column to mirror_entries (for existing projects)
alter table public.mirror_entries
  add column if not exists emotions jsonb not null default '[]'::jsonb;
