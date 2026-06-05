-- Anxiety intensity before/after self-care actions

alter table public.mirror_entries
  add column if not exists anxiety_before integer check (anxiety_before >= 1 and anxiety_before <= 10),
  add column if not exists anxiety_after integer check (anxiety_after >= 1 and anxiety_after <= 10),
  add column if not exists anxiety_reduction integer;
