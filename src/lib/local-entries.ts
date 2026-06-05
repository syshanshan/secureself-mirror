import { EMPTY_ACTION_TRACKING } from "@/lib/action-defaults";
import { computeAnxietyReduction } from "@/lib/action-anxiety";
import { normalizeMirrorEntry } from "@/lib/normalize-mirror-entry";
import type {
  AnalysisResult,
  CompleteActionRequest,
  MirrorEntry,
} from "@/types/analysis";

const STORAGE_KEY = "secureself_mirror_entries";

export function isLocalEntryId(id: string): boolean {
  return id.startsWith("local-");
}

export function createLocalEntryId(): string {
  return `local-${crypto.randomUUID()}`;
}

export function saveLocalEntry(
  entry: Omit<MirrorEntry, "createdAt"> & { createdAt?: string }
): MirrorEntry {
  const fullEntry = normalizeMirrorEntry({
    ...entry,
    createdAt: entry.createdAt ?? new Date().toISOString(),
  });

  const existing = getLocalEntriesRaw();
  const next = [
    fullEntry,
    ...existing.filter((item) => item.id !== fullEntry.id),
  ].slice(0, 50);
  localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
  return fullEntry;
}

export function persistActionCompletion(
  id: string,
  input: CompleteActionRequest,
  fallbackEntry: MirrorEntry
): MirrorEntry {
  const completedAt = input.completedAt || new Date().toISOString();
  const entries = getLocalEntriesRaw();
  const index = entries.findIndex((entry) => entry.id === id);
  const base = index >= 0 ? entries[index] : fallbackEntry;

  const anxietyReduction =
    input.anxietyReduction ??
    computeAnxietyReduction(input.anxietyBefore, input.anxietyAfter);

  const updated = normalizeMirrorEntry({
    ...base,
    selectedSelfCareStep: input.selectedSelfCareStep,
    actionCompleted: input.actionCompleted ?? true,
    moodBeforeAction: input.moodBeforeAction,
    moodAfterAction: input.moodAfterAction,
    reflectionAfterAction: input.reflectionAfterAction,
    anxietyBefore: input.anxietyBefore,
    anxietyAfter: input.anxietyAfter,
    anxietyReduction,
    completedAt,
  });

  const next =
    index >= 0
      ? entries.map((entry, i) => (i === index ? updated : entry))
      : [updated, ...entries];

  localStorage.setItem(STORAGE_KEY, JSON.stringify(next.slice(0, 50)));
  return updated;
}

/** @deprecated Use persistActionCompletion */
export function updateLocalEntryAction(
  id: string,
  input: CompleteActionRequest,
  fallbackEntry?: MirrorEntry
): MirrorEntry | null {
  if (!fallbackEntry) {
    const entries = getLocalEntriesRaw();
    const existing = entries.find((entry) => entry.id === id);
    if (!existing) return null;
    return persistActionCompletion(id, input, existing);
  }
  return persistActionCompletion(id, input, fallbackEntry);
}

function getLocalEntriesRaw(): MirrorEntry[] {
  if (typeof window === "undefined") return [];

  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw) as MirrorEntry[];
    return parsed.map((entry) => normalizeMirrorEntry(entry));
  } catch {
    return [];
  }
}

export function getLocalEntries(): MirrorEntry[] {
  return getLocalEntriesRaw();
}

export function getLocalEntryById(id: string): MirrorEntry | null {
  return getLocalEntries().find((entry) => entry.id === id) ?? null;
}

export function buildLocalEntry(
  id: string,
  sessionId: string,
  situation: string,
  originalMessage: string,
  result: AnalysisResult
): MirrorEntry {
  return normalizeMirrorEntry({
    id,
    sessionId,
    situation,
    originalMessage,
    createdAt: new Date().toISOString(),
    ...EMPTY_ACTION_TRACKING,
    ...result,
  });
}
