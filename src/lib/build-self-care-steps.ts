import type { Language } from "@/lib/i18n/types";

const EMOTION_ACTIONS: Record<
  Language,
  { keywords: string[]; actions: string[] }[]
> = {
  en: [
    {
      keywords: ["anxious", "anxiety", "uncertain", "uncertainty", "worried"],
      actions: [
        "Go for a 20-minute walk",
        "Practice 5 minutes of deep breathing",
        "Journal your fears without sending them",
      ],
    },
    {
      keywords: ["abandon", "abandoned", "rejected", "fear of distance"],
      actions: [
        "Write a letter to your future self",
        "Call or text a trusted friend",
        "Spend 30 minutes outdoors",
      ],
    },
    {
      keywords: ["lonely", "loneliness", "alone", "isolated"],
      actions: [
        "Visit a café or public space",
        "Reach out to a friend for a brief chat",
        "Do a creative activity you enjoy",
      ],
    },
    {
      keywords: ["angry", "anger", "frustrated", "resentment"],
      actions: [
        "Move your body — stretch or exercise",
        "Take a fast 15-minute walk",
        "Do emotional release journaling",
      ],
    },
  ],
  zh: [
    {
      keywords: ["焦虑", "不确定", "担心", "不安"],
      actions: ["散步 20 分钟", "练习 5 分钟深呼吸", "把恐惧写下来（不必发送）"],
    },
    {
      keywords: ["被遗弃", "被抛弃", "被冷落", "怕被疏远"],
      actions: ["给未来的自己写一封信", "联系一位信任的朋友", "在户外待 30 分钟"],
    },
    {
      keywords: ["孤独", "孤单", "寂寞", "孤立"],
      actions: ["去咖啡馆或公共场所坐坐", "给朋友发一条简短消息", "做一件你喜欢的创意活动"],
    },
    {
      keywords: ["愤怒", "生气", "委屈", "挫败"],
      actions: ["动起来——拉伸或运动", "快走 15 分钟", "做一次情绪释放式写日记"],
    },
  ],
};

const DEFAULT_ACTIONS: Record<Language, string[]> = {
  en: [
    "Drink a glass of water and unclench your jaw",
    "Put your phone in another room for 20 minutes",
    "Name three things you can control right now",
  ],
  zh: [
    "喝一杯水，放松下巴和肩膀",
    "把手机放在另一个房间 20 分钟",
    "说出三件此刻你能控制的事",
  ],
};

export function buildSelfCareSteps(
  emotions: string[],
  language: Language
): string[] {
  const pools = EMOTION_ACTIONS[language];
  const combined = emotions.join(" ").toLowerCase();
  const matched: string[] = [];

  for (const pool of pools) {
    const hit = pool.keywords.some((keyword) =>
      combined.includes(keyword.toLowerCase())
    );
    if (hit) {
      matched.push(...pool.actions);
    }
  }

  const unique = [...new Set(matched)];
  if (unique.length >= 2) {
    return unique.slice(0, 3);
  }

  return DEFAULT_ACTIONS[language];
}
