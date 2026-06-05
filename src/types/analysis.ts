export type MoodAfterAction =
  | "calm"
  | "relaxed"
  | "still_anxious"
  | "sad"
  | "empowered"
  | "clearer";

export interface AnalysisResult {
  emotions: string[];
  anxiousPatternAnalysis: string;
  anxietyScore: number;
  secureRewrite: string;
  boundaryStatement: string;
  relationshipNextStep: string;
  selfCareSteps: string[];
  whatNotToDo: string;
}

export interface ActionTracking {
  selectedSelfCareStep: string | null;
  actionCompleted: boolean;
  moodBeforeAction: string | null;
  moodAfterAction: MoodAfterAction | null;
  reflectionAfterAction: string | null;
  completedAt: string | null;
  anxietyBefore: number | null;
  anxietyAfter: number | null;
  anxietyReduction: number | null;
}

export interface MirrorEntry extends AnalysisResult, ActionTracking {
  id: string;
  sessionId: string;
  situation: string;
  originalMessage: string;
  createdAt: string;
}

export interface CompleteActionRequest {
  sessionId: string;
  selectedSelfCareStep: string;
  actionCompleted: boolean;
  moodBeforeAction: string;
  moodAfterAction: MoodAfterAction;
  reflectionAfterAction: string;
  anxietyBefore: number;
  anxietyAfter: number;
  anxietyReduction: number;
  completedAt: string;
}

export interface AnalyzeRequest {
  situation: string;
  message: string;
  sessionId?: string;
  language?: "en" | "zh";
}

export interface AnalyzeResponse {
  success: true;
  data: AnalysisResult;
  id: string;
  sessionId: string;
  source: "supabase" | "local";
}

export interface AnalyzeErrorResponse {
  success: false;
  error: string;
}
