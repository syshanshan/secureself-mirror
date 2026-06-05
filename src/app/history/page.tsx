"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { GrowthDashboard } from "@/components/history/GrowthDashboard";
import { HistoryEntryCard } from "@/components/history/HistoryEntryCard";
import { LoadingSpinner } from "@/components/LoadingSpinner";
import { useLanguage } from "@/components/LanguageProvider";
import { getLocalEntries } from "@/lib/local-entries";
import { mergeHistoryEntries } from "@/lib/merge-action-tracking";
import { normalizeMirrorEntry } from "@/lib/normalize-mirror-entry";
import { getSessionId } from "@/lib/session";
import type { MirrorEntry } from "@/types/analysis";

export default function HistoryPage() {
  const { t, language } = useLanguage();
  const [entries, setEntries] = useState<MirrorEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    async function loadHistory() {
      const sessionId = getSessionId();
      const sessionLocal = getLocalEntries().filter(
        (entry) => entry.sessionId === sessionId
      );

      try {
        const res = await fetch(
          `/api/history?sessionId=${sessionId}&language=${language}`
        );
        const data = await res.json();

        let loaded: MirrorEntry[] = [];

        if (data.success && data.source === "supabase") {
          loaded = mergeHistoryEntries(
            (data.entries ?? []).map((entry: MirrorEntry) =>
              normalizeMirrorEntry(entry)
            ),
            sessionLocal
          );
        } else if (data.success) {
          loaded = sessionLocal;
        } else {
          console.warn("History API failed, using localStorage only", data.error);
          loaded = sessionLocal;
        }

        const completedEntries = loaded.filter(
          (entry) => entry.actionCompleted === true
        );
        console.log("Completed action entries", completedEntries);
        setEntries(loaded);
        setError("");
      } catch (err) {
        console.warn("History load failed, using localStorage only", err);
        if (sessionLocal.length > 0) {
          setEntries(sessionLocal);
          setError("");
        } else {
          setError(err instanceof Error ? err.message : t.history.errorGeneric);
        }
      } finally {
        setLoading(false);
      }
    }

    loadHistory();
  }, [language, t.history.errorGeneric]);

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
        <>
          <GrowthDashboard entries={entries} />

          <h2 className="mb-3 font-display text-lg font-semibold text-text">
            {t.history.listTitle}
          </h2>
          <div className="space-y-3">
            {entries.map((item) => (
              <HistoryEntryCard
                key={item.id}
                entry={item}
                formattedDate={formatDate(item.createdAt, language)}
              />
            ))}
          </div>
        </>
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
