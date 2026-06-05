"use client";

import Link from "next/link";
import { Card } from "@/components/Card";
import type { AnalysisResult, MirrorEntry } from "@/types/analysis";
import { AnxietyScore } from "@/components/AnxietyScore";
import { CopyButton } from "@/components/CopyButton";
import { EmotionRecognition } from "@/components/EmotionRecognition";
import { NextStepsSection } from "@/components/NextStepsSection";
import { useLanguage } from "@/components/LanguageProvider";
import { buildSelfCareSteps } from "@/lib/build-self-care-steps";

interface ResultDisplayProps {
  entry: MirrorEntry;
  showActions?: boolean;
  onEntryUpdate: (entry: MirrorEntry) => void;
}

export function ResultDisplay({
  entry,
  showActions = true,
  onEntryUpdate,
}: ResultDisplayProps) {
  const result: AnalysisResult = entry;
  const { t, language } = useLanguage();
  const selfCareSteps =
    (result.selfCareSteps?.length ?? 0) > 0
      ? result.selfCareSteps
      : buildSelfCareSteps(result.emotions ?? [], language);

  return (
    <div className="space-y-4 animate-fade-in-up">
      <EmotionRecognition emotions={result.emotions ?? []} />

      <Card>
        <AnxietyScore score={result.anxietyScore} />
      </Card>

      <Card>
        <div className="mb-2 flex items-center gap-2">
          <span className="text-lg">🔍</span>
          <h3 className="font-display text-lg font-semibold">
            {t.result.patternAnalysis}
          </h3>
        </div>
        <p className="leading-relaxed text-text">{result.anxiousPatternAnalysis}</p>
      </Card>

      <Card className="border-rose/20 bg-gradient-to-br from-card to-blush/30">
        <div className="mb-3 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="text-lg">✨</span>
            <h3 className="font-display text-lg font-semibold">
              {t.result.secureRewrite}
            </h3>
          </div>
          <CopyButton text={result.secureRewrite} />
        </div>
        <p className="leading-relaxed text-text italic">
          &ldquo;{result.secureRewrite}&rdquo;
        </p>
      </Card>

      <Card>
        <div className="mb-2 flex items-center gap-2">
          <span className="text-lg">🛡️</span>
          <h3 className="font-display text-lg font-semibold">
            {t.result.boundaryStatement}
          </h3>
        </div>
        <p className="leading-relaxed text-text">{result.boundaryStatement}</p>
      </Card>

      <NextStepsSection
        entry={entry}
        selfCareSteps={selfCareSteps}
        onEntryUpdate={onEntryUpdate}
      />

      <Card className="border-rose/10">
        <div className="mb-2 flex items-center gap-2">
          <span className="text-lg">🚫</span>
          <h3 className="font-display text-lg font-semibold">
            {t.result.whatNotToDo}
          </h3>
        </div>
        <p className="leading-relaxed text-text-muted">{result.whatNotToDo}</p>
      </Card>

      {entry.originalMessage && (
        <details className="card p-4">
          <summary className="cursor-pointer text-sm font-medium text-text-muted">
            {t.result.viewOriginal}
          </summary>
          <p className="mt-3 text-sm leading-relaxed text-text-muted italic">
            &ldquo;{entry.originalMessage}&rdquo;
          </p>
          {entry.situation && (
            <p className="mt-2 text-xs text-text-muted">
              {t.result.situationLabel}: {entry.situation}
            </p>
          )}
        </details>
      )}

      {showActions && (
        <div className="flex flex-col gap-3 pt-2">
          <Link href="/input" className="btn-primary block py-3.5 text-center">
            {t.result.reflectAnother}
          </Link>
          <Link
            href="/history"
            className="btn-secondary block py-3.5 text-center"
          >
            {t.result.viewHistory}
          </Link>
        </div>
      )}
    </div>
  );
}
