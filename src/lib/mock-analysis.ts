import type { AnalysisResult } from "@/types/analysis";
import type { Language } from "@/lib/i18n/types";

const SECURE_SIGNALS = [
  "maybe",
  "if you're open",
  "if you are open",
  "when you have time",
  "no pressure",
  "no rush",
  "if you want",
  "up to you",
  "your choice",
  "would you like",
  "i'd love to",
  "if you're free",
  "open to it",
  "maybe we could",
  "如果你愿意",
  "如果你有空",
  "不着急",
  "没关系",
  "看你",
  "方便的话",
  "也许",
  "如果你愿意的话",
];

const HIGH_ANXIETY_SIGNALS = [
  "why haven't you",
  "why wont you",
  "why won't you",
  "do you even care",
  "you never",
  "you always",
  "ignore me",
  "read my message",
  "answer me",
  "please please",
  "i need you to",
  "or else",
  "if you loved me",
  "你怎么还不",
  "你到底",
  "不在乎",
  "为什么不回",
  "已读不回",
  "求你了",
  "是不是不爱",
  "最后一次",
];

const MODERATE_ANXIETY_SIGNALS = [
  "where are you",
  "are you mad",
  "did i do something",
  "just checking in again",
  "following up",
  "need to know",
  "where do we stand",
  "还在吗",
  "生气了吗",
  "是不是我做错了",
  "再确认一下",
  "我们到底什么关系",
];

function countMatches(text: string, phrases: string[]): number {
  const lower = text.toLowerCase();
  return phrases.filter((p) => lower.includes(p.toLowerCase())).length;
}

function estimateAnxietyScore(message: string): number {
  const lower = message.toLowerCase();
  const questionMarks = (message.match(/\?/g) || []).length;
  const exclamations = (message.match(/!/g) || []).length;
  const secureHits = countMatches(message, SECURE_SIGNALS);
  const highHits = countMatches(message, HIGH_ANXIETY_SIGNALS);
  const moderateHits = countMatches(message, MODERATE_ANXIETY_SIGNALS);

  if (secureHits >= 2 && highHits === 0 && moderateHits === 0) {
    return Math.min(25, Math.max(15, 16 + secureHits));
  }

  let score = 28;

  if (secureHits >= 1 && highHits === 0 && moderateHits === 0) {
    score = 22;
  }

  score += highHits * 18;
  score += moderateHits * 12;
  score += Math.max(0, questionMarks - 1) * 6;
  score += exclamations * 5;

  if (/\b(please|sorry)\b.*\b(please|sorry)\b/i.test(lower)) score += 10;
  if (message.length > 400) score += 8;

  score -= secureHits * 3;

  return Math.min(100, Math.max(12, Math.round(score)));
}

function buildPatternAnalysis(
  message: string,
  score: number,
  language: Language
): string {
  const secureHits = countMatches(message, SECURE_SIGNALS);
  const highHits = countMatches(message, HIGH_ANXIETY_SIGNALS);

  if (language === "zh") {
    if (score <= 20) {
      return secureHits > 0
        ? "这条信息整体偏安全型：语气尊重、给对方留有选择空间（如邀请式表达），没有指责或追讨回复。这是在表达连接需求，而不是焦虑型抗议行为。"
        : "这条信息整体偏安全型：表达清晰、语气平稳，没有明显的指责、追讨或情绪绑架。";
    }
    if (score <= 40) {
      return "信息里有一些情感需求，但整体仍算尊重。可以留意是否隐含「希望对方立刻回应」的期待，目前尚未构成明显的抗议行为。";
    }
    if (highHits > 0) {
      return "信息中有较明显的焦虑型抗议信号——如追讨、读心或指责——这通常反映的是对连接的安全感不足，而不是你「有问题」。";
    }
    return "信息中有一定的间接压力或隐性期待（例如希望对方读懂你的情绪）。这不是失败，只是依恋系统在被激活。";
  }

  if (score <= 20) {
    return secureHits > 0
      ? "This reads largely secure: respectful tone, choice left with the other person, and no blame or reassurance-chasing. Expressing interest this way is healthy connection — not anxious protest."
      : "This reads largely secure: calm, direct, and without blame, urgency, or repeated reassurance-seeking.";
  }
  if (score <= 40) {
    return "There is some visible emotional need here, but the tone still mostly respects the other person's space. Watch for hidden expectations — protest behavior isn't dominant yet.";
  }
  if (highHits > 0) {
    return "This message shows anxious protest signals — such as chasing a reply, mind-reading, or blame. That reflects activation and a longing for safety, not a character flaw.";
  }
  return "There are signs of indirect pressure or mild reassurance-seeking. Your attachment system may be asking for certainty — naming that is the first step to responding differently.";
}

function buildMockEmotions(message: string, score: number, language: Language): string[] {
  const highHits = countMatches(message, HIGH_ANXIETY_SIGNALS);

  if (language === "zh") {
    if (score <= 30 && highHits === 0) {
      return ["惦记", "温和的不确定", "想保持联系", "希望被看见"];
    }
    if (score <= 50) {
      return ["焦虑", "不确定", "想重新建立连接", "怕被疏远"];
    }
    return ["被遗弃", "焦虑", "不确定", "想重新建立连接"];
  }

  if (score <= 30 && highHits === 0) {
    return ["hopeful", "gentle uncertainty", "longing to connect", "wanting to be seen"];
  }
  if (score <= 50) {
    return ["anxious", "uncertain", "longing to reconnect", "fear of distance"];
  }
  return ["abandoned", "anxious", "uncertain", "longing to reconnect"];
}

function buildMockResult(
  situation: string,
  message: string,
  language: Language
): AnalysisResult {
  const score = estimateAnxietyScore(message);

  if (language === "zh") {
    return {
      emotions: buildMockEmotions(message, score, "zh"),
      anxietyScore: score,
      anxiousPatternAnalysis: buildPatternAnalysis(message, score, "zh"),
      secureRewrite:
        score <= 25
          ? message.trim()
          : "我注意到我们最近联系少了，我有点在意。你方便的时候能简单聊几句吗？不着急，你按自己的节奏来就好。",
      boundaryStatement:
        "我可以表达想念或需求，同时尊重对方的选择与节奏。",
      suggestedNextAction:
        score <= 25
          ? "如果这条信息仍然让你感到真实、平静，可以发送；发送后去做一件让你落地的事。"
          : "发送前先读一遍：有没有给对方留选择？把信息缩短到两三句，再决定是否发送。",
      whatNotToDo:
        score <= 25
          ? "不必因为表达需求而二次道歉；不要追加「你怎么还不回」类追问。"
          : "避免连环发送；不要反复读旧消息找隐藏含义；不要用沉默或撤回来测试对方。",
    };
  }

  return {
    emotions: buildMockEmotions(message, score, "en"),
    anxietyScore: score,
    anxiousPatternAnalysis: buildPatternAnalysis(message, score, "en"),
    secureRewrite:
      score <= 25
        ? message.trim()
        : "I've noticed some distance lately and I feel a little unsettled. When you have space, I'd appreciate a brief check-in — no rush on your end.",
    boundaryStatement:
      "I can express my needs while respecting the other person's choice and timing.",
    suggestedNextAction:
      score <= 25
        ? "If this still feels true and calm, you can send it — then do something grounding afterward."
        : "Before sending, read it once: does it leave them choice? Trim to 2–3 sentences, then decide.",
    whatNotToDo:
      score <= 25
        ? "Don't apologize twice for having a need; avoid adding a follow-up like 'why haven't you replied?'"
        : "Avoid double-texting; don't re-read old threads for hidden meaning; don't test them with silence or unsending.",
  };
}

export function getMockAnalysis(
  situation: string,
  message: string,
  language: Language = "en"
): AnalysisResult {
  void situation;
  return buildMockResult(situation, message, language);
}
