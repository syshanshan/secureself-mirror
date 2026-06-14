import OpenAI from "openai";
import type { AnalysisResult } from "@/types/analysis";
import type { Language } from "@/lib/i18n/types";
import {
  analysisHasChinese,
  logChineseInAnalysis,
} from "@/lib/ensure-english-output";
import { getMockAnalysis } from "@/lib/mock-analysis";
import { buildSelfCareSteps } from "@/lib/build-self-care-steps";
import { normalizeEmotions } from "@/lib/normalize-emotions";
import { normalizeNextSteps } from "@/lib/normalize-next-steps";
import {
  ANALYSIS_QUALITY_RULES,
  CHINESE_ANALYSIS_RULES,
  SCORING_RUBRIC,
} from "@/lib/scoring-rubric";

const JSON_SCHEMA = `{
  "emotions": ["string"] — 3-5 brief, compassionate feeling labels specific to THIS message. Validating, not generic.",
  "anxiousPatternAnalysis": "string — 2-4 sentences. Name specific patterns ONLY if present; cite phrases from the message. If the message is secure, affirm what works. Warm, zero shame.",
  "anxietyScore": number — integer 0-100 using the rubric below,
  "secureRewrite": "string — rewritten message in secure tone. If already secure, a light polish is enough.",
  "boundaryStatement": "string — one calm boundary in first person",
  "relationshipNextStep": "string — ONE secure relationship step focused on YOUR communication choice, NOT on controlling their response. Do NOT say wait for their reply, do not contact them, or check if they read your message.",
  "selfCareSteps": ["string"] — 2-3 personalized self-care actions based on detected emotions. Focus on regulating yourself RIGHT NOW. NOT about the other person.",
  "whatNotToDo": "string — 2-3 behaviors to avoid, separated by semicolons (only those relevant to THIS message)"
}`;

function buildSystemPrompt(language: Language): string {
  const languageRule =
    language === "en"
      ? `CRITICAL LANGUAGE RULE (English mode):
- You MUST write ALL string values in English only.
- NEVER use Chinese characters anywhere in the JSON — even if the user's situation or message is in Chinese.
- Emotion labels MUST be English words only (e.g. "anxious", "hurt", "afraid", "angry", "abandoned", "uncertain").
- NEVER use Chinese emotion words such as 焦虑, 委屈, 害怕, 愤怒, 被遗弃, or any other Chinese text.`
      : `LANGUAGE RULE (Chinese mode):
- Write ALL string values in Simplified Chinese (简体中文).
- Emotion labels should be natural Chinese (e.g. 焦虑, 不确定, 被遗弃, 想重新建立连接).`;

  const emotionExamples =
    language === "en"
      ? 'e.g. "abandoned", "anxious", "uncertain", "longing to reconnect"'
      : 'e.g. "被遗弃", "焦虑", "不确定", "想重新建立连接"';

  const chineseRules =
    language === "zh" ? `\n${CHINESE_ANALYSIS_RULES}\n` : "";

  return `You are a compassionate attachment-focused communication coach helping people with anxious attachment patterns transform their relationship messages into secure, grounded communication.

${languageRule}

Analyze the user's relationship situation and draft message. Return ONLY valid JSON matching this exact schema:
${JSON_SCHEMA.replace(
  '"emotions": ["string"] — 3-5 brief, compassionate feeling labels specific to THIS message. Validating, not generic."',
  `"emotions": ["string"] — 3-5 brief, compassionate feeling labels (${emotionExamples}). Validating and specific to THIS message — not generic. Write in the user's requested language."`
)}

${SCORING_RUBRIC}

${ANALYSIS_QUALITY_RULES}
${chineseRules}
Additional guidelines:
- Be warm, validating, and non-judgmental
- Never diagnose or use clinical labels harshly
- Keep secure rewrite natural and sendable (not therapy-speak)
- Write ALL string values in the language specified by the user (English or Chinese)
- relationshipNextStep must help the user with their own secure choice — never chase, monitor, or punish the other person
- selfCareSteps must answer: "What can I do for myself right now?"`;
}

function buildUserPrompt(
  situation: string,
  originalMessage: string,
  language: Language,
  strictEnglishRetry = false
): string {
  const languageInstruction =
    language === "zh"
      ? "Respond in Simplified Chinese (简体中文) for all string fields. Apply the Chinese analysis distinctions above."
      : strictEnglishRetry
        ? "STRICT ENGLISH ONLY: Your previous response contained Chinese characters. Regenerate the entire JSON with ALL string fields in English only. Emotion labels must be English words (anxious, hurt, afraid, angry) — NEVER 焦虑, 委屈, 害怕, 愤怒 or any Chinese characters."
        : "Respond in English only for ALL string fields. Do NOT use Chinese characters. Emotion labels must be English only (e.g. anxious, hurt, afraid, angry — NOT 焦虑, 委屈, 害怕, 愤怒).";

  return `${languageInstruction}

Before scoring, ask: Does this message pressure, blame, or chase reassurance — or does it calmly express interest while leaving choice with the other person? Score accordingly.

Relationship situation:
${situation}

Message they want to send:
${originalMessage}`;
}

function validateAnalysisResult(parsed: unknown): parsed is Record<string, unknown> {
  if (!parsed || typeof parsed !== "object") return false;
  const r = parsed as Record<string, unknown>;
  const { relationshipNextStep } = normalizeNextSteps(r);

  return (
    typeof r.anxiousPatternAnalysis === "string" &&
    typeof r.anxietyScore === "number" &&
    typeof r.secureRewrite === "string" &&
    typeof r.boundaryStatement === "string" &&
    Boolean(relationshipNextStep) &&
    typeof r.whatNotToDo === "string"
  );
}

function parseOpenAIResult(
  parsed: Record<string, unknown>,
  language: Language
): AnalysisResult {
  const { relationshipNextStep, selfCareSteps: rawSelfCare } =
    normalizeNextSteps(parsed);
  const emotions = normalizeEmotions(parsed.emotions);
  const selfCareSteps =
    rawSelfCare.length >= 2
      ? rawSelfCare
      : buildSelfCareSteps(emotions, language);

  return {
    anxiousPatternAnalysis: parsed.anxiousPatternAnalysis as string,
    anxietyScore: Math.min(
      100,
      Math.max(0, Math.round(parsed.anxietyScore as number))
    ),
    secureRewrite: parsed.secureRewrite as string,
    boundaryStatement: parsed.boundaryStatement as string,
    relationshipNextStep,
    selfCareSteps,
    whatNotToDo: parsed.whatNotToDo as string,
    emotions,
  };
}

async function requestOpenAIAnalysis(
  situation: string,
  originalMessage: string,
  language: Language,
  strictEnglishRetry: boolean
): Promise<AnalysisResult> {
  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey) {
    throw new Error("OPENAI_API_KEY is not configured");
  }

  const openai = new OpenAI({ apiKey });

  const completion = await openai.chat.completions.create({
    model: process.env.OPENAI_MODEL ?? "gpt-4o-mini",
    temperature: strictEnglishRetry ? 0.3 : 0.5,
    response_format: { type: "json_object" },
    messages: [
      { role: "system", content: buildSystemPrompt(language) },
      {
        role: "user",
        content: buildUserPrompt(
          situation,
          originalMessage,
          language,
          strictEnglishRetry
        ),
      },
    ],
  });

  const content = completion.choices[0]?.message?.content;
  if (!content) {
    throw new Error("No response from OpenAI");
  }

  const parsed = JSON.parse(content) as Record<string, unknown>;
  if (!validateAnalysisResult(parsed)) {
    throw new Error("Invalid analysis structure from OpenAI");
  }

  return parseOpenAIResult(parsed, language);
}

async function callOpenAI(
  situation: string,
  originalMessage: string,
  language: Language
): Promise<AnalysisResult> {
  let result = await requestOpenAIAnalysis(
    situation,
    originalMessage,
    language,
    false
  );

  if (language === "en" && analysisHasChinese(result)) {
    logChineseInAnalysis(result, "openai-first-attempt");
    console.warn(
      "OpenAI returned Chinese in English mode — retrying with strict English-only prompt"
    );

    result = await requestOpenAIAnalysis(
      situation,
      originalMessage,
      language,
      true
    );

    if (analysisHasChinese(result)) {
      logChineseInAnalysis(result, "openai-retry");
      console.warn(
        "OpenAI still returned Chinese in English mode — falling back to English mock analysis"
      );
      return getMockAnalysis(situation, originalMessage, "en");
    }
  }

  return result;
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
