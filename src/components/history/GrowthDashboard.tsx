"use client";

import {
  CartesianGrid,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { Card } from "@/components/Card";
import { useLanguage } from "@/components/LanguageProvider";
import {
  computeGrowthStats,
  getHighestMilestone,
  MILESTONES,
} from "@/lib/growth-stats";
import type { MirrorEntry } from "@/types/analysis";
import type { Language } from "@/lib/i18n/types";

interface GrowthDashboardProps {
  entries: MirrorEntry[];
}

export function GrowthDashboard({ entries }: GrowthDashboardProps) {
  const { t, language } = useLanguage();
  const stats = computeGrowthStats(entries);
  const d = t.history.dashboard;
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
            <div className="h-44 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart
                  data={stats.chartData}
                  margin={{ top: 8, right: 8, left: -20, bottom: 0 }}
                >
                  <CartesianGrid stroke="#e8d5d0" strokeDasharray="3 3" />
                  <XAxis
                    dataKey="index"
                    tick={{ fontSize: 11, fill: "#7a6b68" }}
                    axisLine={{ stroke: "#e8d5d0" }}
                    tickLine={false}
                  />
                  <YAxis
                    domain={[0, 100]}
                    tick={{ fontSize: 11, fill: "#7a6b68" }}
                    axisLine={{ stroke: "#e8d5d0" }}
                    tickLine={false}
                  />
                  <Tooltip
                    contentStyle={{
                      background: "#fffcfa",
                      border: "1px solid #e8d5d0",
                      borderRadius: "12px",
                      fontSize: "12px",
                    }}
                    formatter={(value) => [value, t.history.anxietyLabel]}
                    labelFormatter={(label) =>
                      formatChartLabel(Number(label), language)
                    }
                  />
                  <Line
                    type="monotone"
                    dataKey="score"
                    stroke="#a67f7a"
                    strokeWidth={2.5}
                    dot={{ fill: "#a67f7a", r: 4 }}
                    activeDot={{ r: 6, fill: "#a67f7a" }}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
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
        <MetricCard label={d.averageScore} value={String(stats.averageScore)} />
        <MetricCard label={d.latestScore} value={String(stats.latestScore)} />
        <MetricCard label={d.bestScore} value={String(stats.bestScore)} />
        <MetricCard label={d.reflectionCount} value={String(stats.count)} />
      </div>

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

function formatChartLabel(index: number, language: Language): string {
  return language === "zh" ? `第 ${index} 次` : `Reflection ${index}`;
}
