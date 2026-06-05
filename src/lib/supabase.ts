import { createClient, type SupabaseClient } from "@supabase/supabase-js";
import { normalizeEmotions } from "@/lib/normalize-emotions";
import type { MirrorEntry } from "@/types/analysis";

function getSupabaseUrl() {
  return process.env.NEXT_PUBLIC_SUPABASE_URL ?? "";
}

function getSupabaseKey() {
  return (
    process.env.SUPABASE_SERVICE_ROLE_KEY ??
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ??
    ""
  );
}

export function isSupabaseConfigured(): boolean {
  return Boolean(getSupabaseUrl() && getSupabaseKey());
}

export function createSupabaseClient(): SupabaseClient | null {
  if (!isSupabaseConfigured()) return null;
  return createClient(getSupabaseUrl(), getSupabaseKey());
}

export interface SaveEntryInput {
  sessionId: string;
  situation: string;
  originalMessage: string;
  result: Omit<
    MirrorEntry,
    "id" | "sessionId" | "situation" | "originalMessage" | "createdAt"
  >;
}

export async function saveMirrorEntry(input: SaveEntryInput): Promise<string | null> {
  const supabase = createSupabaseClient();
  if (!supabase) return null;

  const { data, error } = await supabase
    .from("mirror_entries")
    .insert({
      session_id: input.sessionId,
      situation: input.situation,
      original_message: input.originalMessage,
      anxious_pattern_analysis: input.result.anxiousPatternAnalysis,
      anxiety_score: input.result.anxietyScore,
      emotions: input.result.emotions,
      secure_rewrite: input.result.secureRewrite,
      boundary_statement: input.result.boundaryStatement,
      suggested_next_action: input.result.suggestedNextAction,
      what_not_to_do: input.result.whatNotToDo,
    })
    .select("id")
    .single();

  if (error) {
    console.error("Failed to save mirror entry:", error.message);
    return null;
  }

  return data.id as string;
}

export async function getMirrorEntryById(id: string): Promise<MirrorEntry | null> {
  const supabase = createSupabaseClient();
  if (!supabase) return null;

  const { data, error } = await supabase
    .from("mirror_entries")
    .select("*")
    .eq("id", id)
    .single();

  if (error || !data) return null;

  return mapRowToEntry(data);
}

export async function getMirrorHistoryBySession(
  sessionId: string
): Promise<MirrorEntry[]> {
  const supabase = createSupabaseClient();
  if (!supabase) return [];

  const { data, error } = await supabase
    .from("mirror_entries")
    .select("*")
    .eq("session_id", sessionId)
    .order("created_at", { ascending: false })
    .limit(50);

  if (error || !data) return [];

  return data.map(mapRowToEntry);
}

function mapRowToEntry(row: Record<string, unknown>): MirrorEntry {
  return {
    id: row.id as string,
    sessionId: row.session_id as string,
    situation: row.situation as string,
    originalMessage: row.original_message as string,
    anxiousPatternAnalysis: row.anxious_pattern_analysis as string,
    anxietyScore: row.anxiety_score as number,
    emotions: normalizeEmotions(row.emotions),
    secureRewrite: row.secure_rewrite as string,
    boundaryStatement: row.boundary_statement as string,
    suggestedNextAction: row.suggested_next_action as string,
    whatNotToDo: row.what_not_to_do as string,
    createdAt: row.created_at as string,
  };
}
