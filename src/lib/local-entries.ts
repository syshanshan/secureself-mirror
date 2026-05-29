import type { AnalysisResult, MirrorEntry } from "@/types/analysis";

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
  const fullEntry: MirrorEntry = {
    ...entry,
    createdAt: entry.createdAt ?? new Date().toISOString(),
  };

  const existing = getLocalEntries();
  const next = [fullEntry, ...existing.filter((item) => item.id !== fullEntry.id)].slice(
    0,
    50
  );
  localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
  return fullEntry;
}

export function getLocalEntries(): MirrorEntry[] {
  if (typeof window === "undefined") return [];

  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    return JSON.parse(raw) as MirrorEntry[];
  } catch {
    return [];
  }
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
  return {
    id,
    sessionId,
    situation,
    originalMessage,
    createdAt: new Date().toISOString(),
    ...result,
  };
}
