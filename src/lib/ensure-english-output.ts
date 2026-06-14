import type { AnalysisResult } from "@/types/analysis";

/** CJK Unified Ideographs and common extensions */
const CJK_PATTERN = /[\u4e00-\u9fff\u3400-\u4dbf\uf900-\ufaff]/;

export function containsChinese(text: string): boolean {
  return CJK_PATTERN.test(text);
}

export function analysisHasChinese(result: AnalysisResult): boolean {
  const strings = [
    ...result.emotions,
    result.anxiousPatternAnalysis,
    result.secureRewrite,
    result.boundaryStatement,
    result.relationshipNextStep,
    ...result.selfCareSteps,
    result.whatNotToDo,
  ];
  return strings.some((value) => containsChinese(value));
}

export function logChineseInAnalysis(
  result: AnalysisResult,
  source: string
): void {
  const fields: Record<string, string | string[]> = {
    emotions: result.emotions,
    anxiousPatternAnalysis: result.anxiousPatternAnalysis,
    secureRewrite: result.secureRewrite,
    boundaryStatement: result.boundaryStatement,
    relationshipNextStep: result.relationshipNextStep,
    selfCareSteps: result.selfCareSteps,
    whatNotToDo: result.whatNotToDo,
  };

  for (const [field, value] of Object.entries(fields)) {
    const values = Array.isArray(value) ? value : [value];
    for (const text of values) {
      if (containsChinese(text)) {
        console.warn(`[english-only] Chinese detected in ${source}.${field}:`, text);
      }
    }
  }
}
