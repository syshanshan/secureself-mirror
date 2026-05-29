import OpenAI from "openai";
import type { AnalysisResult } from "@/types/analysis";

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
- anxietyScore: 0 = very secure/calm, 100 = highly anxious/activated`;

export async function analyzeMessage(
  situation: string,
  originalMessage: string
): Promise<AnalysisResult> {
  const apiKey = process.env.OPENAI_API_KEY;

  if (!apiKey) {
    return getMockAnalysis(situation, originalMessage);
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
        content: `Relationship situation:\n${situation}\n\nMessage they want to send:\n${originalMessage}`,
      },
    ],
  });

  const content = completion.choices[0]?.message?.content;
  if (!content) {
    throw new Error("No response from OpenAI.");
  }

  const parsed = JSON.parse(content) as AnalysisResult;

  if (
    typeof parsed.anxiousPatternAnalysis !== "string" ||
    typeof parsed.anxietyScore !== "number" ||
    typeof parsed.secureRewrite !== "string" ||
    typeof parsed.boundaryStatement !== "string" ||
    typeof parsed.suggestedNextAction !== "string" ||
    typeof parsed.whatNotToDo !== "string"
  ) {
    throw new Error("Invalid analysis structure from OpenAI.");
  }

  return {
    ...parsed,
    anxietyScore: Math.min(100, Math.max(0, Math.round(parsed.anxietyScore))),
  };
}

function getMockAnalysis(
  situation: string,
  message: string
): AnalysisResult {
  const wordCount = message.split(/\s+/).length;
  const hasQuestionMarks = (message.match(/\?/g) || []).length;
  const hasExclamation = (message.match(/!/g) || []).length;
  const anxiousKeywords = [
    "why",
    "never",
    "always",
    "ignore",
    "care",
    "love me",
    "sorry",
    "please",
    "need you",
    "where are you",
  ];
  const keywordHits = anxiousKeywords.filter((k) =>
    message.toLowerCase().includes(k)
  ).length;

  const anxietyScore = Math.min(
    100,
    30 + wordCount * 2 + hasQuestionMarks * 8 + hasExclamation * 5 + keywordHits * 10
  );

  return {
    anxiousPatternAnalysis: `Your message shows signs of ${anxietyScore > 60 ? "strong" : "moderate"} anxious activation — likely seeking reassurance or connection in a moment of uncertainty. This is a natural response when you care deeply, especially given: "${situation.slice(0, 80)}${situation.length > 80 ? "..." : ""}"`,
    anxietyScore,
    secureRewrite: `I've been thinking about us and wanted to share how I'm feeling. When [specific situation], I notice I feel [emotion]. I'd love to talk when you have a moment — no rush. I'm working on giving you space while honoring what I need too.`,
    boundaryStatement:
      "I can share my feelings without needing an immediate response. My worth isn't determined by how quickly someone replies.",
    suggestedNextAction:
      "Take 10 minutes to breathe, journal what you're really feeling beneath the urgency, then decide if sending anything today serves you.",
    whatNotToDo:
      "Avoid sending multiple follow-up messages; re-reading their last texts for hidden meaning; making this about proving your love. Sit with the discomfort — it will pass.",
  };
}
