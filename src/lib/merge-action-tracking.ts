import { normalizeMirrorEntry } from "@/lib/normalize-mirror-entry";
import type { MirrorEntry } from "@/types/analysis";

export function mergeActionTracking(
  primary: MirrorEntry,
  secondary?: MirrorEntry | null
): MirrorEntry {
  const base = normalizeMirrorEntry(primary);
  if (!secondary) return base;

  const alt = normalizeMirrorEntry(secondary);
  if (!base.actionCompleted && !alt.actionCompleted) return base;

  const source = alt.actionCompleted ? alt : base;

  return normalizeMirrorEntry({
    ...base,
    selectedSelfCareStep:
      source.selectedSelfCareStep ?? base.selectedSelfCareStep,
    actionCompleted: base.actionCompleted || alt.actionCompleted,
    moodBeforeAction: source.moodBeforeAction ?? base.moodBeforeAction,
    moodAfterAction: source.moodAfterAction ?? base.moodAfterAction,
    reflectionAfterAction:
      source.reflectionAfterAction ?? base.reflectionAfterAction,
    completedAt: source.completedAt ?? base.completedAt,
    anxietyBefore: source.anxietyBefore ?? base.anxietyBefore,
    anxietyAfter: source.anxietyAfter ?? base.anxietyAfter,
    anxietyReduction: source.anxietyReduction ?? base.anxietyReduction,
  });
}

export function mergeHistoryEntries(
  supabaseEntries: MirrorEntry[],
  localEntries: MirrorEntry[]
): MirrorEntry[] {
  const localById = new Map(localEntries.map((entry) => [entry.id, entry]));
  const mergedSupabase = supabaseEntries.map((entry) =>
    mergeActionTracking(normalizeMirrorEntry(entry), localById.get(entry.id))
  );
  const supabaseIds = new Set(supabaseEntries.map((entry) => entry.id));
  const localOnly = localEntries
    .filter((entry) => !supabaseIds.has(entry.id))
    .map((entry) => normalizeMirrorEntry(entry));

  return [...mergedSupabase, ...localOnly].sort(
    (a, b) =>
      new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
  );
}
