import {
  averageAnxietyDrop,
  computeAnxietyReduction,
} from "@/lib/action-anxiety";
import type { Language } from "@/lib/i18n/types";
import type { MirrorEntry, MoodAfterAction } from "@/types/analysis";

const POSITIVE_MOODS: MoodAfterAction[] = [
  "calm",
  "relaxed",
  "empowered",
  "clearer",
];

export interface ActionStats {
  completionCount: number;
  completionRate: number;
  mostCommonMoodAfter: MoodAfterAction | null;
  latestMoodAfter: MoodAfterAction | null;
}

export interface EffectiveAction {
  action: string;
  averageReduction: number;
  averageDrop: number;
  count: number;
}

export interface ActionInsights {
  stats: ActionStats;
  effectiveActions: EffectiveAction[];
  mostHelpfulAction: string | null;
  commonMoodLabel: string | null;
  patternText: string | null;
  aiInsight: string | null;
}

export function computeActionStats(entries: MirrorEntry[]): ActionStats {
  const total = entries.length;
  const completed = entries.filter((e) => e.actionCompleted);

  const moodCounts = new Map<MoodAfterAction, number>();
  for (const entry of completed) {
    if (entry.moodAfterAction) {
      moodCounts.set(
        entry.moodAfterAction,
        (moodCounts.get(entry.moodAfterAction) ?? 0) + 1
      );
    }
  }

  let mostCommonMoodAfter: MoodAfterAction | null = null;
  let maxCount = 0;
  for (const [mood, count] of moodCounts) {
    if (count > maxCount) {
      maxCount = count;
      mostCommonMoodAfter = mood;
    }
  }

  const latestCompleted = [...completed].sort(
    (a, b) =>
      new Date(b.completedAt ?? 0).getTime() -
      new Date(a.completedAt ?? 0).getTime()
  )[0];

  return {
    completionCount: completed.length,
    completionRate: total > 0 ? Math.round((completed.length / total) * 100) : 0,
    mostCommonMoodAfter,
    latestMoodAfter: latestCompleted?.moodAfterAction ?? null,
  };
}

export function computeEffectiveActions(
  completed: MirrorEntry[]
): EffectiveAction[] {
  const byAction = new Map<string, { totalReduction: number; count: number }>();

  for (const entry of completed) {
    if (!entry.selectedSelfCareStep) continue;
    if (entry.anxietyBefore == null || entry.anxietyAfter == null) continue;

    const reduction =
      entry.anxietyReduction ??
      computeAnxietyReduction(entry.anxietyBefore, entry.anxietyAfter);
    const prev = byAction.get(entry.selectedSelfCareStep) ?? {
      totalReduction: 0,
      count: 0,
    };
    byAction.set(entry.selectedSelfCareStep, {
      totalReduction: prev.totalReduction + reduction,
      count: prev.count + 1,
    });
  }

  return [...byAction.entries()]
    .map(([action, { totalReduction, count }]) => {
      const averageReduction = totalReduction / count;
      return {
        action,
        averageReduction,
        averageDrop: averageAnxietyDrop(averageReduction),
        count,
      };
    })
    .filter((item) => item.count > 0)
    .sort((a, b) => a.averageReduction - b.averageReduction)
    .slice(0, 5);
}

function countHelpfulActions(completed: MirrorEntry[]): string | null {
  const effective = computeEffectiveActions(completed);
  if (effective.length > 0 && effective[0].averageDrop > 0) {
    return effective[0].action;
  }

  const positive = completed.filter(
    (e) => e.moodAfterAction && POSITIVE_MOODS.includes(e.moodAfterAction)
  );
  const counts = new Map<string, number>();

  for (const entry of positive) {
    if (!entry.selectedSelfCareStep) continue;
    counts.set(
      entry.selectedSelfCareStep,
      (counts.get(entry.selectedSelfCareStep) ?? 0) + 1
    );
  }

  let best: string | null = null;
  let bestCount = 0;
  for (const [action, count] of counts) {
    if (count > bestCount) {
      bestCount = count;
      best = action;
    }
  }

  return best;
}

function detectEmotionPattern(
  completed: MirrorEntry[],
  language: Language
): string | null {
  const emotionActionMap = new Map<string, Map<string, number>>();

  for (const entry of completed) {
    if (!entry.selectedSelfCareStep || !entry.moodAfterAction) continue;
    if (!POSITIVE_MOODS.includes(entry.moodAfterAction)) continue;

    for (const emotion of entry.emotions) {
      if (!emotionActionMap.has(emotion)) {
        emotionActionMap.set(emotion, new Map());
      }
      const actions = emotionActionMap.get(emotion)!;
      actions.set(
        entry.selectedSelfCareStep,
        (actions.get(entry.selectedSelfCareStep) ?? 0) + 1
      );
    }
  }

  let topEmotion: string | null = null;
  let topAction: string | null = null;
  let topScore = 0;

  for (const [emotion, actions] of emotionActionMap) {
    for (const [action, count] of actions) {
      if (count > topScore) {
        topScore = count;
        topEmotion = emotion;
        topAction = action;
      }
    }
  }

  if (!topEmotion || !topAction || topScore < 1) return null;

  if (language === "zh") {
    return `当你感到「${topEmotion}」时，「${topAction}」最常帮助你感觉更好。`;
  }
  return `When you feel "${topEmotion}", "${topAction}" most often helps you feel better.`;
}

function getTopEmotion(completed: MirrorEntry[]): string | null {
  const counts = new Map<string, number>();

  for (const entry of completed) {
    for (const emotion of entry.emotions) {
      counts.set(emotion, (counts.get(emotion) ?? 0) + 1);
    }
  }

  let topEmotion: string | null = null;
  let maxCount = 0;
  for (const [emotion, count] of counts) {
    if (count > maxCount) {
      maxCount = count;
      topEmotion = emotion;
    }
  }

  return topEmotion;
}

function generateAiInsight(
  entries: MirrorEntry[],
  stats: ActionStats,
  helpfulAction: string | null,
  effectiveActions: EffectiveAction[],
  patternText: string | null,
  language: Language
): string | null {
  const completed = entries.filter((e) => e.actionCompleted);
  if (completed.length === 0) return null;

  const topEffective = effectiveActions[0];
  const topEmotion = getTopEmotion(completed);
  const paragraphs: string[] = [];

  if (topEffective) {
    if (language === "zh") {
      paragraphs.push(
        `「${topEffective.action}」对你的神经系统最有帮助，平均焦虑下降 ${topEffective.averageDrop.toFixed(1)} 分。`
      );
    } else {
      paragraphs.push(
        `"${topEffective.action}" seems to regulate your nervous system best — anxiety drops by ${topEffective.averageDrop.toFixed(1)} points on average.`
      );
    }
  }

  if (topEmotion && topEffective) {
    if (language === "zh") {
      paragraphs.push(
        `你最常在感到「${topEmotion}」时受困，而「${topEffective.action}」最容易帮助你恢复平静。`
      );
    } else {
      paragraphs.push(
        `You often feel stuck when feeling "${topEmotion}", and "${topEffective.action}" most often helps you feel calmer.`
      );
    }
  } else if (patternText) {
    paragraphs.push(patternText);
  }

  if (paragraphs.length > 0) {
    return paragraphs.join("\n\n");
  }

  const uncertainEmotions = completed.filter((e) =>
    e.emotions.some((em) =>
      /不确定|uncertain|焦虑|anxious|被遗弃|abandon/i.test(em)
    )
  );
  const physicalActions = completed.filter(
    (e) =>
      e.selectedSelfCareStep &&
      /walk|散步|运动|exercise|呼吸|breath/i.test(e.selectedSelfCareStep)
  );

  if (
    uncertainEmotions.length >= 2 &&
    physicalActions.length >= 2 &&
    helpfulAction
  ) {
    if (language === "zh") {
      return "你最容易在感到不确定时焦虑，但当你选择身体活动而不是继续发消息时，情绪通常会下降。";
    }
    return "You often feel anxious when uncertain — but when you choose physical grounding instead of messaging, your mood usually softens.";
  }

  if (stats.mostCommonMoodAfter && helpfulAction) {
    if (language === "zh") {
      return `完成「${helpfulAction}」后，你更常感到情绪缓和。继续相信这些照顾自己的小步骤。`;
    }
    return `After "${helpfulAction}", you often feel more settled. Keep trusting these small acts of self-care.`;
  }

  if (language === "zh") {
    return "每一次暂停和照顾自己，都是在练习安全型依恋。";
  }
  return "Every pause and act of self-care is secure-attachment practice.";
}

export function computeActionInsights(
  entries: MirrorEntry[],
  language: Language,
  moodLabels: Record<MoodAfterAction, string>
): ActionInsights {
  const stats = computeActionStats(entries);
  const completed = entries.filter((e) => e.actionCompleted);
  const effectiveActions = computeEffectiveActions(completed);
  const mostHelpfulAction = countHelpfulActions(completed);
  const commonMoodLabel = stats.mostCommonMoodAfter
    ? moodLabels[stats.mostCommonMoodAfter]
    : null;
  const patternText = detectEmotionPattern(completed, language);
  const aiInsight = generateAiInsight(
    entries,
    stats,
    mostHelpfulAction,
    effectiveActions,
    patternText,
    language
  );

  return {
    stats,
    effectiveActions,
    mostHelpfulAction,
    commonMoodLabel,
    patternText,
    aiInsight,
  };
}
