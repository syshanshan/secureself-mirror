"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ResultDisplay } from "@/components/ResultDisplay";
import { LoadingSpinner } from "@/components/LoadingSpinner";
import { useLanguage } from "@/components/LanguageProvider";
import { getLocalEntryById } from "@/lib/local-entries";
import { mergeActionTracking } from "@/lib/merge-action-tracking";
import { normalizeMirrorEntry } from "@/lib/normalize-mirror-entry";
import type { MirrorEntry } from "@/types/analysis";

interface ResultPageClientProps {
  id: string;
  entry?: MirrorEntry;
}

function resolveEntry(id: string, serverEntry?: MirrorEntry): MirrorEntry | null {
  const localEntry = getLocalEntryById(id);

  if (serverEntry) {
    return mergeActionTracking(
      normalizeMirrorEntry(serverEntry),
      localEntry
    );
  }

  return localEntry;
}

export function ResultPageClient({ id, entry: serverEntry }: ResultPageClientProps) {
  const router = useRouter();
  const { t } = useLanguage();
  const [entry, setEntry] = useState<MirrorEntry | null>(() =>
    resolveEntry(id, serverEntry)
  );
  const [loading, setLoading] = useState(!serverEntry && id.startsWith("local-"));

  useEffect(() => {
    const resolved = resolveEntry(id, serverEntry);

    if (resolved) {
      setEntry(resolved);
      setLoading(false);
      return;
    }

    if (id.startsWith("local-")) {
      router.replace("/input");
      setLoading(false);
    }
  }, [id, router, serverEntry]);

  function handleEntryUpdate(updated: MirrorEntry) {
    setEntry(updated);
  }

  if (loading) {
    return <LoadingSpinner message={t.result.loading} />;
  }

  if (!entry) {
    return (
      <div className="flex flex-1 flex-col items-center justify-center text-center">
        <span className="mb-4 text-4xl">🪞</span>
        <h1 className="font-display text-xl font-semibold">
          {t.result.notFoundTitle}
        </h1>
        <p className="mt-2 text-sm text-text-muted">{t.result.notFoundDesc}</p>
        <Link href="/input" className="btn-primary mt-6 px-8 py-3">
          {t.result.notFoundCta}
        </Link>
      </div>
    );
  }

  return (
    <div className="flex flex-1 flex-col">
      <header className="mb-6">
        <h1 className="font-display text-2xl font-semibold text-text">
          {t.result.title}
        </h1>
        <p className="mt-1 text-sm text-text-muted">{t.result.subtitle}</p>
      </header>

      <ResultDisplay entry={entry} onEntryUpdate={handleEntryUpdate} />
    </div>
  );
}
