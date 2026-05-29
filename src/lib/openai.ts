import type { AnalysisResult } from "@/types/analysis";
import type { Language } from "@/lib/i18n/types";
import { getMockAnalysis } from "@/lib/mock-analysis";

// OpenAI temporarily disabled — always return hardcoded mock analysis.
export async function analyzeMessage(
  _situation: string,
  _originalMessage: string,
  language: Language = "en"
): Promise<AnalysisResult> {
  return getMockAnalysis(language);
}
