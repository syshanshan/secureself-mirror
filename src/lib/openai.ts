import OpenAI from "openai";
import type { AnalysisResult } from "@/types/analysis";
import type { Language } from "@/lib/i18n/types";
import { getMockAnalysis } from "@/lib/mock-analysis";

const SYSTEM_PROMPT = `You are a compassionate attachment-focused communication coach helping people with anxious attachment patterns transform their relationship messages into secure, grounded communication.

Analyze the user's relationship situation and draft message. Return ONLY valid JSON matching this exact schema:
{
  "anxiousPatternAnalysis": "string — 2-4 sentences naming specific anxious patterns you notice (e.g. protest behavior, mind-reading, reassurance-seeking, catastrophizing) with warmth and zero shame",
  "anxietyScore": number — integer 0-100 reflecting how activated/anxious the draft message reads,
  "secureRewrite": "string — a rewritten message in secure attachment tone: clear, direct, emotionally honest, non-punitive, no ultimatums unless truly needed",
  "boundaryStatement": "string — one calm boundary the user can hold if needed, in first person",
  "suggestedNextAction": "string — one concrete, kind next step (not chasing or testing)",
  "whatNotToDo": "string — 2-3 bullet-style behaviors to avoid, separated by semicolons"
}

Guidelines:
- Be warm, validating, and non-judgmental
- Never diagnose or use clinical labels harshly
- Keep secure rewrite natural and sendable (not therapy-speak)
- anxietyScore: 0 = very secure/calm, 100 = highly anxious/activated
- Write ALL string values in the language specified by the user (English or Chinese)`;

function buildUserPrompt(
  situation: string,
  originalMessage: string,
  language: Language
): string {
  const languageInstruction =
    language === "zh"
      ? "Respond in Simplified Chinese (简体中文) for all string fields."
      : "Respond in English for all string fields.";

  return `${languageInstruction}

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
    temperature: 0.7,
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
    return getMockAnalysis(language);
  }

  try {
    return await callOpenAI(situation, originalMessage, language);
  } catch (error) {
    console.error("OpenAI analysis failed — falling back to mock:", error);
    return getMockAnalysis(language);
  }
}
