import type { MirrorEntry } from "@/types/analysis";

export type ProgressLabel = "improving" | "stable" | "moreActivated";

export interface GrowthStats {
  count: number;
  averageScore: number;
  latestScore: number;
  bestScore: number;
  scoreChange: number;
  progressLabel: ProgressLabel;
  chronological: MirrorEntry[];
  chartData: { index: number; score: number; label: string }[];
}

export function sortChronological(entries: MirrorEntry[]): MirrorEntry[] {
  return [...entries].sort(
    (a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
  );
}

export function getProgressLabel(
  firstScore: number,
  latestScore: number
): ProgressLabel {
  const change = latestScore - firstScore;
  if (change < 0) return "improving";
  if (change > 5) return "moreActivated";
  return "stable";
}

export function computeGrowthStats(entries: MirrorEntry[]): GrowthStats {
  const chronological = sortChronological(entries);
  const scores = chronological.map((e) => e.anxietyScore);
  const count = scores.length;

  if (count === 0) {
    return {
      count: 0,
      averageScore: 0,
      latestScore: 0,
      bestScore: 0,
      scoreChange: 0,
      progressLabel: "stable",
      chronological,
      chartData: [],
    };
  }

  const firstScore = scores[0];
  const latestScore = scores[count - 1];
  const averageScore = Math.round(
    scores.reduce((sum, s) => sum + s, 0) / count
  );
  const bestScore = Math.min(...scores);

  return {
    count,
    averageScore,
    latestScore,
    bestScore,
    scoreChange: latestScore - firstScore,
    progressLabel: getProgressLabel(firstScore, latestScore),
    chronological,
    chartData: chronological.map((entry, index) => ({
      index: index + 1,
      score: entry.anxietyScore,
      label: `#${index + 1}`,
    })),
  };
}

export const MILESTONE_THRESHOLDS = [1, 3, 7, 14, 30] as const;

export type MilestoneKey =
  | "firstPause"
  | "patternAwareness"
  | "securePracticeHabit"
  | "emotionalRegulationStreak"
  | "secureCommunicationBuilder";

export const MILESTONES: { count: number; key: MilestoneKey }[] = [
  { count: 1, key: "firstPause" },
  { count: 3, key: "patternAwareness" },
  { count: 7, key: "securePracticeHabit" },
  { count: 14, key: "emotionalRegulationStreak" },
  { count: 30, key: "secureCommunicationBuilder" },
];

export function getHighestMilestone(count: number): MilestoneKey | null {
  let achieved: MilestoneKey | null = null;
  for (const milestone of MILESTONES) {
    if (count >= milestone.count) {
      achieved = milestone.key;
    }
  }
  return achieved;
}
