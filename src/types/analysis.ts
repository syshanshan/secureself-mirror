export interface AnalysisResult {
  anxiousPatternAnalysis: string;
  anxietyScore: number;
  secureRewrite: string;
  boundaryStatement: string;
  suggestedNextAction: string;
  whatNotToDo: string;
}

export interface MirrorEntry extends AnalysisResult {
  id: string;
  sessionId: string;
  situation: string;
  originalMessage: string;
  createdAt: string;
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
