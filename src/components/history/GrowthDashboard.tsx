"use client";

import dynamic from "next/dynamic";
import { Card } from "@/components/Card";
import { useLanguage } from "@/components/LanguageProvider";
import { useEffect, useMemo } from "react";
import { computeActionInsights } from "@/lib/action-insights";
import {
  computeGrowthStats,
  getHighestMilestone,
  MILESTONES,
} from "@/lib/growth-stats";
import type { MirrorEntry } from "@/types/analysis";

const AnxietyTrendChart = dynamic(
  () =>
    import("@/components/history/AnxietyTrendChart").then(
      (mod) => mod.AnxietyTrendChart
    ),
  { ssr: false }
);

interface GrowthDashboardProps {
  entries: MirrorEntry[];
}

export function GrowthDashboard({ entries }: GrowthDashboardProps) {
  const { t, language } = useLanguage();
  const stats = computeGrowthStats(entries);
  const d = t.history.dashboard;
  const actionInsights = computeActionInsights(
    entries,
    language,
    t.result.moods
  );
  const { stats: actionStats } = actionInsights;
  const completedEntries = useMemo(
    () => entries.filter((entry) => entry.actionCompleted === true),
    [entries]
  );

  useEffect(() => {
    console.log("Completed action entries", completedEntries);
  }, [completedEntries]);

  const milestone = getHighestMilestone(stats.count);
  const canShowTrend = stats.count >= 2;
  const changeAbs = Math.abs(stats.scoreChange);

  return (
    <section className="mb-8 space-y-4">
      <div>
        <h2 className="font-display text-lg font-semibold text-text">
          {d.title}
        </h2>
        <p className="mt-0.5 text-sm text-text-muted">{d.subtitle}</p>
      </div>

      <Card className="bg-gradient-to-br from-card to-blush/20">
        <div className="flex items-center justify-between gap-3">
          <div>
            <p className="text-xs font-medium uppercase tracking-wide text-text-muted">
              {d.progressLabel}
            </p>
            <p className="mt-1 font-display text-lg font-semibold text-text">
              {d.progressValues[stats.progressLabel]}
            </p>
          </div>
          {canShowTrend && (
            <div className="text-right">
              <p className="text-xs text-text-muted">{d.scoreChange}</p>
              <p
                className={`font-display text-xl font-semibold ${
                  stats.scoreChange < 0
                    ? "text-sage"
                    : stats.scoreChange > 5
                      ? "text-rose-deep"
                      : "text-rose"
                }`}
              >
                {stats.scoreChange > 0 ? "+" : ""}
                {stats.scoreChange}
              </p>
            </div>
          )}
        </div>
      </Card>

      {canShowTrend ? (
        <>
          <Card>
            <p className="mb-3 text-sm font-medium text-text">{d.chartTitle}</p>
            <AnxietyTrendChart
              data={stats.chartData}
              anxietyLabel={t.history.anxietyLabel}
              language={language}
            />
          </Card>

          <Card className="border-rose/15 bg-blush/20">
            <p className="text-sm leading-relaxed text-text">
              {getInsightText(d.insights, stats.progressLabel, changeAbs)}
            </p>
          </Card>
        </>
      ) : (
        <Card className="border-dashed border-rose/25 bg-card/60 text-center">
          <p className="text-sm text-text-muted">{d.trendEmpty}</p>
        </Card>
      )}

      <div className="grid grid-cols-2 gap-3">
        <MetricCard label={d.reflectionCount} value={String(stats.count)} />
        <MetricCard
          label={d.actionCompletionCount}
          value={String(actionStats.completionCount)}
        />
        <MetricCard
          label={d.actionCompletionRate}
          value={`${actionStats.completionRate}%`}
        />
        <MetricCard
          label={d.mostCommonMoodAfter}
          value={
            actionStats.mostCommonMoodAfter
              ? t.result.moods[actionStats.mostCommonMoodAfter]
              : d.noMoodData
          }
        />
      </div>

      <Card className="border-sage/15 bg-gradient-to-br from-card to-cream/50">
        <p className="mb-4 font-display text-base font-semibold text-text">
          {d.healingInsightsTitle}
        </p>
        {actionStats.completionCount === 0 ? (
          <p className="text-sm text-text-muted">{d.noActionData}</p>
        ) : (
          <div className="space-y-4 text-sm">
            {actionInsights.aiInsight && (
              <div className="rounded-xl border border-rose/15 bg-blush/20 px-3 py-3">
                <p className="text-xs font-medium uppercase tracking-wide text-rose-deep">
                  💡 {d.aiInsight}
                </p>
                <p className="mt-2 whitespace-pre-line leading-relaxed text-text">
                  {actionInsights.aiInsight}
                </p>
              </div>
            )}

            {actionInsights.effectiveActions.length > 0 && (
              <div>
                <p className="text-xs font-medium uppercase tracking-wide text-text-muted">
                  {d.mostEffectiveActions}
                </p>
                <div className="mt-3 space-y-3">
                  {actionInsights.effectiveActions.map((item) => (
                    <div
                      key={item.action}
                      className="rounded-xl border border-rose/10 bg-blush/15 px-3 py-3"
                    >
                      <p className="font-medium text-text">{item.action}</p>
                      <p className="mt-1 text-text-muted">
                        {d.avgAnxietyDrop.replace(
                          "{points}",
                          item.averageDrop.toFixed(1)
                        )}
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {actionInsights.commonMoodLabel && (
              <InsightRow
                label={d.commonMoodAfter}
                value={actionInsights.commonMoodLabel}
              />
            )}
            {actionInsights.patternText && (
              <InsightRow
                label={d.myPattern}
                value={actionInsights.patternText}
              />
            )}
          </div>
        )}
      </Card>

      <Card>
        <p className="mb-3 text-sm font-medium text-text">{d.milestoneTitle}</p>
        <div className="space-y-2">
          {MILESTONES.map((item) => (
            <MilestoneRow
              key={item.key}
              label={d.milestones[item.key]}
              achieved={stats.count >= item.count}
              isCurrent={milestone === item.key}
              countLabel={d.milestoneCount.replace("{count}", String(item.count))}
            />
          ))}
        </div>
      </Card>
    </section>
  );
}

function InsightRow({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <p className="text-xs font-medium uppercase tracking-wide text-text-muted">
        {label}
      </p>
      <p className="mt-1 leading-relaxed text-text">{value}</p>
    </div>
  );
}

function MetricCard({ label, value }: { label: string; value: string }) {
  return (
    <Card className="p-4">
      <p className="text-[11px] font-medium uppercase tracking-wide text-text-muted">
        {label}
      </p>
      <p className="mt-1 font-display text-2xl font-semibold text-rose-deep">
        {value}
      </p>
    </Card>
  );
}

function MilestoneRow({
  label,
  achieved,
  isCurrent,
  countLabel,
}: {
  label: string;
  achieved: boolean;
  isCurrent: boolean;
  countLabel: string;
}) {
  return (
    <div
      className={`flex items-center gap-3 rounded-xl px-3 py-2 ${
        isCurrent ? "bg-blush/50 ring-1 ring-rose/20" : "bg-cream/40"
      }`}
    >
      <span className="text-base">{achieved ? "🌸" : "○"}</span>
      <div className="min-w-0 flex-1">
        <p
          className={`text-sm ${
            achieved ? "font-medium text-text" : "text-text-muted"
          }`}
        >
          {label}
        </p>
        <p className="text-xs text-text-muted">{countLabel}</p>
      </div>
    </div>
  );
}

function getInsightText(
  insights: {
    improving: string;
    stable: string;
    moreActivated: string;
  },
  label: "improving" | "stable" | "moreActivated",
  points: number
): string {
  return insights[label].replace("{points}", String(points));
}
