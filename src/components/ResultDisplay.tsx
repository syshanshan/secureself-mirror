"use client";

import Link from "next/link";
import { Card } from "@/components/Card";
import type { AnalysisResult } from "@/types/analysis";
import { AnxietyScore } from "@/components/AnxietyScore";
import { CopyButton } from "@/components/CopyButton";
import { useLanguage } from "@/components/LanguageProvider";

interface ResultDisplayProps {
  result: AnalysisResult;
  situation?: string;
  originalMessage?: string;
  showActions?: boolean;
}

export function ResultDisplay({
  result,
  situation,
  originalMessage,
  showActions = true,
}: ResultDisplayProps) {
  const { t } = useLanguage();

  return (
    <div className="space-y-4 animate-fade-in-up">
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

      <Card>
        <div className="mb-2 flex items-center gap-2">
          <span className="text-lg">🌱</span>
          <h3 className="font-display text-lg font-semibold">
            {t.result.suggestedNextStep}
          </h3>
        </div>
        <p className="leading-relaxed text-text">{result.suggestedNextAction}</p>
      </Card>

      <Card className="border-rose/10">
        <div className="mb-2 flex items-center gap-2">
          <span className="text-lg">🚫</span>
          <h3 className="font-display text-lg font-semibold">
            {t.result.whatNotToDo}
          </h3>
        </div>
        <p className="leading-relaxed text-text-muted">{result.whatNotToDo}</p>
      </Card>

      {originalMessage && (
        <details className="card p-4">
          <summary className="cursor-pointer text-sm font-medium text-text-muted">
            {t.result.viewOriginal}
          </summary>
          <p className="mt-3 text-sm leading-relaxed text-text-muted italic">
            &ldquo;{originalMessage}&rdquo;
          </p>
          {situation && (
            <p className="mt-2 text-xs text-text-muted">
              {t.result.situationLabel}: {situation}
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
