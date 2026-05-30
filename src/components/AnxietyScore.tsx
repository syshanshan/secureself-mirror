"use client";

import { useLanguage } from "@/components/LanguageProvider";

interface AnxietyScoreProps {
  score: number;
}

function scoreColor(score: number): string {
  if (score <= 20) return "text-sage";
  if (score <= 40) return "text-sage";
  if (score <= 60) return "text-rose";
  return "text-rose-deep";
}

export function AnxietyScore({ score }: AnxietyScoreProps) {
  const { t } = useLanguage();

  function scoreLabel(value: number): string {
    if (value <= 20) return t.anxiety.secure;
    if (value <= 40) return t.anxiety.mild;
    if (value <= 60) return t.anxiety.moderate;
    if (value <= 80) return t.anxiety.high;
    return t.anxiety.veryHigh;
  }

  return (
    <div className="flex flex-col items-center gap-3 py-2">
      <div className="relative flex h-28 w-28 items-center justify-center">
        <svg className="absolute inset-0 -rotate-90" viewBox="0 0 100 100">
          <circle
            cx="50"
            cy="50"
            r="42"
            fill="none"
            stroke="currentColor"
            strokeWidth="8"
            className="text-blush"
          />
          <circle
            cx="50"
            cy="50"
            r="42"
            fill="none"
            stroke="currentColor"
            strokeWidth="8"
            strokeLinecap="round"
            strokeDasharray={`${(score / 100) * 264} 264`}
            className="text-rose transition-all duration-700"
          />
        </svg>
        <div className="text-center">
          <span className={`font-display text-3xl font-medium ${scoreColor(score)}`}>
            {score}
          </span>
          <p className="text-[10px] uppercase tracking-wider text-text-muted">
            {t.anxiety.label}
          </p>
        </div>
      </div>
      <p className={`text-sm font-medium ${scoreColor(score)}`}>
        {scoreLabel(score)}
      </p>
    </div>
  );
}
