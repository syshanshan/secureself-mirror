"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Card } from "@/components/Card";
import { LoadingSpinner } from "@/components/LoadingSpinner";
import { useLanguage } from "@/components/LanguageProvider";
import { getLocalEntries } from "@/lib/local-entries";
import { getSessionId } from "@/lib/session";
import type { MirrorEntry } from "@/types/analysis";

export default function HistoryPage() {
  const { t, language } = useLanguage();
  const [entries, setEntries] = useState<MirrorEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    async function loadHistory() {
      try {
        const sessionId = getSessionId();
        const res = await fetch(
          `/api/history?sessionId=${sessionId}&language=${language}`
        );
        const data = await res.json();

        if (!data.success) {
          throw new Error(data.error || t.history.errorLoad);
        }

        if (data.source === "supabase") {
          setEntries(data.entries ?? []);
        } else {
          setEntries(
            getLocalEntries().filter((entry) => entry.sessionId === sessionId)
          );
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : t.history.errorGeneric);
      } finally {
        setLoading(false);
      }
    }

    loadHistory();
  }, [language, t.history.errorGeneric, t.history.errorLoad]);

  if (loading) {
    return <LoadingSpinner message={t.history.loading} />;
  }

  return (
    <div className="flex flex-1 flex-col">
      <header className="mb-6">
        <h1 className="font-display text-2xl font-semibold text-text">
          {t.history.title}
        </h1>
        <p className="mt-1 text-sm text-text-muted">{t.history.subtitle}</p>
      </header>

      {error && (
        <p className="mb-4 rounded-xl bg-rose/10 px-4 py-3 text-sm text-rose-deep">
          {error}
        </p>
      )}

      {entries.length === 0 ? (
        <div className="flex flex-1 flex-col items-center justify-center text-center">
          <span className="mb-4 text-4xl">📖</span>
          <h2 className="font-display text-lg font-semibold">
            {t.history.emptyTitle}
          </h2>
          <p className="mt-2 max-w-xs text-sm text-text-muted">
            {t.history.emptyDesc}
          </p>
          <Link href="/input" className="btn-primary mt-6 px-8 py-3">
            {t.history.emptyCta}
          </Link>
        </div>
      ) : (
        <div className="space-y-3">
          {entries.map((item) => (
            <Link key={item.id} href={`/result/${item.id}`}>
              <Card className="transition-transform hover:-translate-y-0.5">
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-medium text-text">
                      {item.situation}
                    </p>
                    <p className="mt-1 truncate text-xs text-text-muted italic">
                      &ldquo;{item.originalMessage}&rdquo;
                    </p>
                    <p className="mt-2 text-xs text-text-muted">
                      {formatDate(item.createdAt, language)}
                    </p>
                  </div>
                  <div className="flex shrink-0 flex-col items-center">
                    <span className="font-display text-xl font-semibold text-rose-deep">
                      {item.anxietyScore}
                    </span>
                    <span className="text-[10px] text-text-muted">
                      {t.history.anxietyLabel}
                    </span>
                  </div>
                </div>
              </Card>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}

function formatDate(iso: string, language: "en" | "zh"): string {
  return new Date(iso).toLocaleDateString(language === "zh" ? "zh-CN" : "en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
    hour: "numeric",
    minute: "2-digit",
  });
}
