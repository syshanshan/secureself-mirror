import OpenAI from "openai";
import type { AnalysisResult } from "@/types/analysis";
import type { Language } from "@/lib/i18n/types";
import { getMockAnalysis } from "@/lib/mock-analysis";
import {
  ANALYSIS_QUALITY_RULES,
  CHINESE_ANALYSIS_RULES,
  SCORING_RUBRIC,
} from "@/lib/scoring-rubric";

const SYSTEM_PROMPT = `You are a compassionate attachment-focused communication coach helping people with anxious attachment patterns transform their relationship messages into secure, grounded communication.

Analyze the user's relationship situation and draft message. Return ONLY valid JSON matching this exact schema:
{
  "anxiousPatternAnalysis": "string — 2-4 sentences. Name specific patterns ONLY if present; cite phrases from the message. If the message is secure, affirm what works. Warm, zero shame.",
  "anxietyScore": number — integer 0-100 using the rubric below,
  "secureRewrite": "string — rewritten message in secure tone. If already secure, a light polish is enough.",
  "boundaryStatement": "string — one calm boundary in first person",
  "suggestedNextAction": "string — one concrete, kind next step",
  "whatNotToDo": "string — 2-3 behaviors to avoid, separated by semicolons (only those relevant to THIS message)"
}

${SCORING_RUBRIC}

${ANALYSIS_QUALITY_RULES}

${CHINESE_ANALYSIS_RULES}

Additional guidelines:
- Be warm, validating, and non-judgmental
- Never diagnose or use clinical labels harshly
- Keep secure rewrite natural and sendable (not therapy-speak)
- Write ALL string values in the language specified by the user (English or Chinese)`;

function buildUserPrompt(
  situation: string,
  originalMessage: string,
  language: Language
): string {
  const languageInstruction =
    language === "zh"
      ? "Respond in Simplified Chinese (简体中文) for all string fields. Apply the Chinese analysis distinctions above."
      : "Respond in English for all string fields.";

  return `${languageInstruction}

Before scoring, ask: Does this message pressure, blame, or chase reassurance — or does it calmly express interest while leaving choice with the other person? Score accordingly.

Relationship situation:
${situation}

Message they want to send:
${originalMessage}`;
}

function validateAnalysisResult(parsed: unknown): parsed is AnalysisResult {
  if (!parsed || typeof parsed !== "object") return false;
  const r = parsed as Record<string, unknown>;
  return (
    typeof r.anxiousPatternAnalysis === "string" &&
    typeof r.anxietyScore === "number" &&
    typeof r.secureRewrite === "string" &&
    typeof r.boundaryStatement === "string" &&
    typeof r.suggestedNextAction === "string" &&
    typeof r.whatNotToDo === "string"
  );
}

async function callOpenAI(
  situation: string,
  originalMessage: string,
  language: Language
): Promise<AnalysisResult> {
  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey) {
    throw new Error("OPENAI_API_KEY is not configured");
  }

  const openai = new OpenAI({ apiKey });

  const completion = await openai.chat.completions.create({
    model: process.env.OPENAI_MODEL ?? "gpt-4o-mini",
    temperature: 0.5,
    response_format: { type: "json_object" },
    messages: [
      { role: "system", content: SYSTEM_PROMPT },
      {
        role: "user",
        content: buildUserPrompt(situation, originalMessage, language),
      },
    ],
  });

  const content = completion.choices[0]?.message?.content;
  if (!content) {
    throw new Error("No response from OpenAI");
  }

  const parsed: unknown = JSON.parse(content);
  if (!validateAnalysisResult(parsed)) {
    throw new Error("Invalid analysis structure from OpenAI");
  }

  return {
    ...parsed,
    anxietyScore: Math.min(100, Math.max(0, Math.round(parsed.anxietyScore))),
  };
}

export async function analyzeMessage(
  situation: string,
  originalMessage: string,
  language: Language = "en"
): Promise<AnalysisResult> {
  if (!process.env.OPENAI_API_KEY) {
    console.warn("OPENAI_API_KEY not set — using mock analysis");
    return getMockAnalysis(situation, originalMessage, language);
  }

  try {
    return await callOpenAI(situation, originalMessage, language);
  } catch (error) {
    console.error("OpenAI analysis failed — falling back to mock:", error);
    return getMockAnalysis(situation, originalMessage, language);
  }
}
