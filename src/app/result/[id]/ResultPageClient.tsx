"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ResultDisplay } from "@/components/ResultDisplay";
import { LoadingSpinner } from "@/components/LoadingSpinner";
import { getLocalEntryById } from "@/lib/local-entries";
import type { MirrorEntry } from "@/types/analysis";

interface ResultPageClientProps {
  id: string;
  entry?: MirrorEntry;
}

export function ResultPageClient({ id, entry: serverEntry }: ResultPageClientProps) {
  const router = useRouter();
  const [entry, setEntry] = useState<MirrorEntry | null>(serverEntry ?? null);
  const [loading, setLoading] = useState(!serverEntry);

  useEffect(() => {
    if (serverEntry) return;

    if (id.startsWith("local-")) {
      const localEntry = getLocalEntryById(id);
      if (localEntry) {
        setEntry(localEntry);
      } else {
        router.replace("/input");
      }
      setLoading(false);
    }
  }, [id, router, serverEntry]);

  if (loading) {
    return <LoadingSpinner message="Loading your reflection..." />;
  }

  if (!entry) {
    return (
      <div className="flex flex-1 flex-col items-center justify-center text-center">
        <span className="mb-4 text-4xl">🪞</span>
        <h1 className="font-display text-xl font-semibold">Reflection not found</h1>
        <p className="mt-2 text-sm text-text-muted">
          This entry may have been cleared from your browser.
        </p>
        <Link href="/input" className="btn-primary mt-6 px-8 py-3">
          Start a New Reflection
        </Link>
      </div>
    );
  }

  return (
    <div className="flex flex-1 flex-col">
      <header className="mb-6">
        <h1 className="font-display text-2xl font-semibold text-text">
          Your Secure Reflection
        </h1>
        <p className="mt-1 text-sm text-text-muted">
          Read slowly. You&apos;re doing the inner work.
        </p>
      </header>

      <ResultDisplay
        result={entry}
        situation={entry.situation}
        originalMessage={entry.originalMessage}
      />
    </div>
  );
}
