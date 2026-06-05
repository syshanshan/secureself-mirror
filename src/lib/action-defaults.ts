import type { ActionTracking } from "@/types/analysis";

export const EMPTY_ACTION_TRACKING: ActionTracking = {
  selectedSelfCareStep: null,
  actionCompleted: false,
  moodBeforeAction: null,
  moodAfterAction: null,
  reflectionAfterAction: null,
  completedAt: null,
  anxietyBefore: null,
  anxietyAfter: null,
  anxietyReduction: null,
};
