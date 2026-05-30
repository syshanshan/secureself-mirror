/** Shared anxiety score bands used in prompts and UI. */
export const ANXIETY_SCORE_BANDS = {
  secure: { min: 0, max: 20 },
  mild: { min: 21, max: 40 },
  moderate: { min: 41, max: 60 },
  high: { min: 61, max: 80 },
  veryHigh: { min: 81, max: 100 },
} as const;

export const SCORING_RUBRIC = `
ANXIETY SCORE RUBRIC (apply strictly — do NOT inflate scores for healthy connection):

0–20 = Secure:
- clear, calm, respectful
- no blame
- no repeated reassurance seeking
- accepts the other person's choice
- expresses needs without pressure
Examples scoring 15–25: "I'm moving soon. Maybe we could grab coffee before I leave if you're open to it." / "I'd love to connect when you have time — no pressure either way."

21–40 = Mild activation:
- some emotional need visible
- still respectful overall
- no protest behavior

41–60 = Moderate anxiety:
- indirect pressure
- hidden expectation
- mild reassurance seeking

61–80 = High anxiety:
- blaming
- repeated questioning
- urgency
- fear of abandonment

81–100 = Very high anxiety:
- panic, threats, begging, multiple messages implied, manipulation, self-abandonment

SCORING RULES — only raise the score when the message includes one or more of:
- repeated follow-ups or double-texting energy
- blame or accusation
- guilt-tripping
- desperation
- sexual pressure
- trying to force a response
- emotional collapse
- stalking/checking behavior ("why haven't you read my message", location checking, etc.)

DO NOT raise the score merely because the message:
- expresses a wish for connection
- invites a meeting or conversation
- states a need calmly
- uses words like "maybe", "if you're open", "when you have time", "no pressure"
- shows vulnerability without pressure

If the message is already secure (0–25), say so warmly in anxiousPatternAnalysis — do not invent problems.
`.trim();

export const ANALYSIS_QUALITY_RULES = `
ANALYSIS QUALITY:
- Quote or reference specific phrases from the user's message
- Be precise, not generic — avoid boilerplate that could apply to any message
- Name only patterns actually present; if none, affirm what is secure
- Tailor secureRewrite lightly — if the message is already secure, polish rather than overhaul
`.trim();

export const CHINESE_ANALYSIS_RULES = `
CHINESE ANALYSIS (when responding in 简体中文):
In anxiousPatternAnalysis, clearly distinguish when relevant:
1. 健康的连接需求 — a normal, respectful wish for closeness or contact (do NOT treat as anxious)
2. 焦虑型抗议行为 — protest behavior such as追讨回复、读心、指责、情绪绑架 (only if actually present)
3. 安全型边界表达 — calm limits or respect for the other's choice (acknowledge positively)

Use concrete references to the user's wording. Avoid vague模板式反馈.
`.trim();
