export function normalizeSelfCareSteps(value: unknown): string[] {
  if (!Array.isArray(value)) return [];

  return value
    .filter((item): item is string => typeof item === "string")
    .map((item) => item.trim())
    .filter(Boolean)
    .slice(0, 3);
}

export function normalizeNextSteps(data: Record<string, unknown>): {
  relationshipNextStep: string;
  selfCareSteps: string[];
} {
  if (typeof data.relationshipNextStep === "string" && data.relationshipNextStep.trim()) {
    return {
      relationshipNextStep: data.relationshipNextStep.trim(),
      selfCareSteps: normalizeSelfCareSteps(data.selfCareSteps),
    };
  }

  if (typeof data.suggestedNextAction === "string" && data.suggestedNextAction.trim()) {
    return {
      relationshipNextStep: data.suggestedNextAction.trim(),
      selfCareSteps: [],
    };
  }

  return { relationshipNextStep: "", selfCareSteps: [] };
}
