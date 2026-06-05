import { createClient, type SupabaseClient } from "@supabase/supabase-js";
import { computeAnxietyReduction } from "@/lib/action-anxiety";
import { normalizeEmotions } from "@/lib/normalize-emotions";
import { normalizeSelfCareSteps } from "@/lib/normalize-next-steps";
import type {
  AnalysisResult,
  CompleteActionRequest,
  MirrorEntry,
  MoodAfterAction,
} from "@/types/analysis";

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
  result: AnalysisResult;
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
      suggested_next_action: input.result.relationshipNextStep,
      self_care_steps: input.result.selfCareSteps,
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

function getSupabaseKeyType(): "service_role" | "anon" | "none" {
  if (process.env.SUPABASE_SERVICE_ROLE_KEY) return "service_role";
  if (process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY) return "anon";
  return "none";
}

function logSupabaseError(context: string, id: string, error: unknown) {
  if (!error || typeof error !== "object") {
    console.error(`[action-update] ${context}`, { id, error });
    return;
  }
  const err = error as Record<string, unknown>;
  console.error(`[action-update] ${context}`, {
    id,
    message: err.message,
    code: err.code,
    details: err.details,
    hint: err.hint,
  });
}

export async function updateMirrorEntryAction(
  id: string,
  input: CompleteActionRequest
): Promise<MirrorEntry | null> {
  console.log("[action-update] incoming entry id", id);
  console.log("[action-update] id details", {
    raw: id,
    length: id.length,
    isLocal: id.startsWith("local-"),
    looksLikeUuid:
      /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(id),
  });

  if (id.startsWith("local-")) {
    console.log("[action-update] skipping Supabase — local entry id");
    return null;
  }

  const supabase = createSupabaseClient();
  if (!supabase) {
    console.error("[action-update] Supabase client not configured", {
      hasUrl: Boolean(getSupabaseUrl()),
      keyType: getSupabaseKeyType(),
    });
    return null;
  }

  console.log("[action-update] Supabase client ready", {
    url: getSupabaseUrl(),
    keyType: getSupabaseKeyType(),
  });

  const { data: existingRows, error: lookupError } = await supabase
    .from("mirror_entries")
    .select("id, session_id, action_completed, created_at")
    .eq("id", id);

  console.log("[action-update] entry existence check", {
    id,
    entryExists: (existingRows?.length ?? 0) > 0,
    rowsFound: existingRows?.length ?? 0,
    rows: existingRows ?? null,
    lookupError: lookupError
      ? {
          message: lookupError.message,
          code: lookupError.code,
          details: lookupError.details,
          hint: lookupError.hint,
        }
      : null,
  });

  const completedAt = input.completedAt || new Date().toISOString();
  const anxietyReduction =
    input.anxietyReduction ??
    computeAnxietyReduction(input.anxietyBefore, input.anxietyAfter);

  const updatePayload = {
    selected_self_care_step: input.selectedSelfCareStep,
    action_completed: input.actionCompleted,
    mood_before_action: input.moodBeforeAction,
    mood_after_action: input.moodAfterAction,
    reflection_after_action: input.reflectionAfterAction,
    anxiety_before: input.anxietyBefore,
    anxiety_after: input.anxietyAfter,
    anxiety_reduction: anxietyReduction,
    completed_at: completedAt,
  };

  console.log("[action-update] Supabase update query", {
    table: "mirror_entries",
    filter: { id },
    payload: updatePayload,
    select: "*",
  });

  const { data, error, count, status, statusText } = await supabase
    .from("mirror_entries")
    .update(updatePayload)
    .eq("id", id)
    .select("*");

  console.log("[action-update] Supabase update response", {
    id,
    rowsReturned: data?.length ?? 0,
    affectedZeroRows: !data || data.length === 0,
    status,
    statusText,
    count,
    data: data ?? null,
    error: error
      ? {
          message: error.message,
          code: error.code,
          details: error.details,
          hint: error.hint,
        }
      : null,
  });

  if (error) {
    logSupabaseError("update failed with error", id, error);
    return null;
  }

  if (!data || data.length === 0) {
    console.error("[action-update] update affected 0 rows", {
      id,
      entryExistsBeforeUpdate: (existingRows?.length ?? 0) > 0,
      possibleCauses: [
        "Row id does not exist in mirror_entries",
        "RLS policy blocked UPDATE (check Allow update mirror entries policy)",
        "Using anon key without UPDATE permission",
        "Id format mismatch (client id vs database uuid)",
      ],
    });
    return null;
  }

  console.log("[action-update] update succeeded", {
    id,
    actionCompleted: data[0].action_completed,
    completedAt: data[0].completed_at,
  });

  return mapRowToEntry(data[0] as Record<string, unknown>);
}

function parseMoodAfterAction(value: unknown): MoodAfterAction | null {
  const moods: MoodAfterAction[] = [
    "calm",
    "relaxed",
    "still_anxious",
    "sad",
    "empowered",
    "clearer",
  ];
  return moods.includes(value as MoodAfterAction)
    ? (value as MoodAfterAction)
    : null;
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
    relationshipNextStep:
      (row.relationship_next_step as string | undefined) ??
      (row.suggested_next_action as string),
    selfCareSteps: normalizeSelfCareSteps(row.self_care_steps),
    whatNotToDo: row.what_not_to_do as string,
    createdAt: row.created_at as string,
    selectedSelfCareStep: (row.selected_self_care_step as string) ?? null,
    actionCompleted: Boolean(row.action_completed),
    moodBeforeAction: (row.mood_before_action as string) ?? null,
    moodAfterAction: parseMoodAfterAction(row.mood_after_action),
    reflectionAfterAction: (row.reflection_after_action as string) ?? null,
    completedAt: (row.completed_at as string) ?? null,
    anxietyBefore: (row.anxiety_before as number) ?? null,
    anxietyAfter: (row.anxiety_after as number) ?? null,
    anxietyReduction: (row.anxiety_reduction as number) ?? null,
  };
}
