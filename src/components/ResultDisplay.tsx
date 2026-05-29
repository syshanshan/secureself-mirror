"use client";

import Link from "next/link";
import { Card } from "@/components/Card";
import type { AnalysisResult } from "@/types/analysis";
import { AnxietyScore } from "@/components/AnxietyScore";
import { CopyButton } from "@/components/CopyButton";

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
  return (
    <div className="space-y-4 animate-fade-in-up">
      <Card>
        <AnxietyScore score={result.anxietyScore} />
      </Card>

      <Card>
        <div className="mb-2 flex items-center gap-2">
          <span className="text-lg">🔍</span>
          <h3 className="font-display text-lg font-semibold">Pattern Analysis</h3>
        </div>
        <p className="leading-relaxed text-text">{result.anxiousPatternAnalysis}</p>
      </Card>

      <Card className="border-rose/20 bg-gradient-to-br from-card to-blush/30">
        <div className="mb-3 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="text-lg">✨</span>
            <h3 className="font-display text-lg font-semibold">Secure Rewrite</h3>
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
          <h3 className="font-display text-lg font-semibold">Boundary Statement</h3>
        </div>
        <p className="leading-relaxed text-text">{result.boundaryStatement}</p>
      </Card>

      <Card>
        <div className="mb-2 flex items-center gap-2">
          <span className="text-lg">🌱</span>
          <h3 className="font-display text-lg font-semibold">Suggested Next Step</h3>
        </div>
        <p className="leading-relaxed text-text">{result.suggestedNextAction}</p>
      </Card>

      <Card className="border-rose/10">
        <div className="mb-2 flex items-center gap-2">
          <span className="text-lg">🚫</span>
          <h3 className="font-display text-lg font-semibold">What Not To Do</h3>
        </div>
        <p className="leading-relaxed text-text-muted">{result.whatNotToDo}</p>
      </Card>

      {originalMessage && (
        <details className="card p-4">
          <summary className="cursor-pointer text-sm font-medium text-text-muted">
            View original message
          </summary>
          <p className="mt-3 text-sm leading-relaxed text-text-muted italic">
            &ldquo;{originalMessage}&rdquo;
          </p>
          {situation && (
            <p className="mt-2 text-xs text-text-muted">
              Situation: {situation}
            </p>
          )}
        </details>
      )}

      {showActions && (
        <div className="flex flex-col gap-3 pt-2">
          <Link href="/input" className="btn-primary block py-3.5 text-center">
            Reflect on Another Message
          </Link>
          <Link
            href="/history"
            className="btn-secondary block py-3.5 text-center"
          >
            View History
          </Link>
        </div>
      )}
    </div>
  );
}
