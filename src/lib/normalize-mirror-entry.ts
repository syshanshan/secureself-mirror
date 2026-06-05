import { EMPTY_ACTION_TRACKING } from "@/lib/action-defaults";
import { normalizeEmotions } from "@/lib/normalize-emotions";
import { normalizeSelfCareSteps } from "@/lib/normalize-next-steps";
import type { MirrorEntry, MoodAfterAction } from "@/types/analysis";

type LegacyMirrorEntry = Partial<MirrorEntry> & {
  suggestedNextAction?: string;
  action_completed?: boolean;
  selected_self_care_step?: string | null;
  mood_before_action?: string | null;
  mood_after_action?: string | null;
  reflection_after_action?: string | null;
  completed_at?: string | null;
  anxiety_before?: number | null;
  anxiety_after?: number | null;
  anxiety_reduction?: number | null;
};

const MOOD_VALUES: MoodAfterAction[] = [
  "calm",
  "relaxed",
  "still_anxious",
  "sad",
  "empowered",
  "clearer",
];

function parseMoodAfterAction(value: unknown): MoodAfterAction | null {
  return MOOD_VALUES.includes(value as MoodAfterAction)
    ? (value as MoodAfterAction)
    : null;
}

export function normalizeMirrorEntry(entry: LegacyMirrorEntry): MirrorEntry {
  const relationshipNextStep =
    entry.relationshipNextStep?.trim() ||
    entry.suggestedNextAction?.trim() ||
    "";

  const actionCompleted = Boolean(
    entry.actionCompleted ?? entry.action_completed
  );

  return {
    ...EMPTY_ACTION_TRACKING,
    ...entry,
    emotions: normalizeEmotions(entry.emotions),
    anxiousPatternAnalysis: entry.anxiousPatternAnalysis ?? "",
    anxietyScore: entry.anxietyScore ?? 0,
    secureRewrite: entry.secureRewrite ?? "",
    boundaryStatement: entry.boundaryStatement ?? "",
    relationshipNextStep,
    selfCareSteps: normalizeSelfCareSteps(entry.selfCareSteps),
    whatNotToDo: entry.whatNotToDo ?? "",
    selectedSelfCareStep:
      entry.selectedSelfCareStep ?? entry.selected_self_care_step ?? null,
    actionCompleted,
    moodBeforeAction:
      entry.moodBeforeAction ?? entry.mood_before_action ?? null,
    moodAfterAction: parseMoodAfterAction(
      entry.moodAfterAction ?? entry.mood_after_action
    ),
    reflectionAfterAction:
      entry.reflectionAfterAction ?? entry.reflection_after_action ?? null,
    completedAt: entry.completedAt ?? entry.completed_at ?? null,
    anxietyBefore: entry.anxietyBefore ?? entry.anxiety_before ?? null,
    anxietyAfter: entry.anxietyAfter ?? entry.anxiety_after ?? null,
    anxietyReduction:
      entry.anxietyReduction ?? entry.anxiety_reduction ?? null,
    id: entry.id ?? "",
    sessionId: entry.sessionId ?? "",
    situation: entry.situation ?? "",
    originalMessage: entry.originalMessage ?? "",
    createdAt: entry.createdAt ?? new Date().toISOString(),
  };
}
