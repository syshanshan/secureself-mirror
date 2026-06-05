"use client";

import Link from "next/link";
import { Card } from "@/components/Card";
import { useLanguage } from "@/components/LanguageProvider";
import type { MirrorEntry } from "@/types/analysis";

interface HistoryEntryCardProps {
  entry: MirrorEntry;
  formattedDate: string;
}

export function HistoryEntryCard({ entry, formattedDate }: HistoryEntryCardProps) {
  const { t } = useLanguage();
  const h = t.history;

  const emotionsText =
    entry.moodBeforeAction ||
    entry.emotions.slice(0, 3).join(" / ") ||
    h.noEmotions;

  return (
    <Card className="overflow-hidden">
      <div className="space-y-3 text-sm">
        <div>
          <p className="text-xs font-medium uppercase tracking-wide text-text-muted">
            {h.feltThen}
          </p>
          <p className="mt-1 leading-relaxed text-text">{emotionsText}</p>
        </div>

        {entry.actionCompleted && entry.selectedSelfCareStep ? (
          <>
            <div>
              <p className="text-xs font-medium uppercase tracking-wide text-text-muted">
                {h.completedAction}
              </p>
              <p className="mt-1 text-text">{entry.selectedSelfCareStep}</p>
            </div>

            {entry.moodAfterAction && (
              <div>
                <p className="text-xs font-medium uppercase tracking-wide text-text-muted">
                  {h.feltAfter}
                </p>
                <p className="mt-1 text-text">
                  {t.result.moods[entry.moodAfterAction]}
                </p>
              </div>
            )}

            {entry.reflectionAfterAction && (
              <div>
                <p className="text-xs font-medium uppercase tracking-wide text-text-muted">
                  {h.myReflection}
                </p>
                <p className="mt-1 leading-relaxed text-text-muted italic">
                  &ldquo;{entry.reflectionAfterAction}&rdquo;
                </p>
              </div>
            )}
          </>
        ) : (
          <p className="text-xs text-text-muted">{h.actionNotCompleted}</p>
        )}

        <details className="rounded-xl border border-rose/10 bg-cream/30 px-3 py-2">
          <summary className="cursor-pointer text-xs font-medium text-rose-deep">
            {h.viewDetails}
          </summary>
          <div className="mt-3 space-y-3 text-xs leading-relaxed text-text-muted">
            <div>
              <p className="font-medium text-text">{h.detailSituation}</p>
              <p className="mt-1">{entry.situation}</p>
            </div>
            <div>
              <p className="font-medium text-text">{h.detailMessage}</p>
              <p className="mt-1 italic">&ldquo;{entry.originalMessage}&rdquo;</p>
            </div>
            <div>
              <p className="font-medium text-text">{h.detailPattern}</p>
              <p className="mt-1">{entry.anxiousPatternAnalysis}</p>
            </div>
            <div>
              <p className="font-medium text-text">{h.detailRewrite}</p>
              <p className="mt-1 italic">&ldquo;{entry.secureRewrite}&rdquo;</p>
            </div>
            <div>
              <p className="font-medium text-text">{h.detailRelationshipStep}</p>
              <p className="mt-1">{entry.relationshipNextStep}</p>
            </div>
          </div>
        </details>
      </div>

      <div className="mt-4 flex items-center justify-between border-t border-rose/10 pt-3">
        <span className="text-[11px] text-text-muted">{formattedDate}</span>
        <Link
          href={`/result/${entry.id}`}
          className="text-xs font-medium text-rose-deep hover:underline"
        >
          {h.openResult}
        </Link>
      </div>
    </Card>
  );
}
