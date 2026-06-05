-- Action tracking fields for self-care step completion

alter table public.mirror_entries
  add column if not exists selected_self_care_step text,
  add column if not exists action_completed boolean not null default false,
  add column if not exists mood_before_action text,
  add column if not exists mood_after_action text,
  add column if not exists reflection_after_action text,
  add column if not exists completed_at timestamptz;

create policy "Allow update mirror entries"
  on public.mirror_entries for update
  using (true)
  with check (true);
