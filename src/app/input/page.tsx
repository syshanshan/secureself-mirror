"use client";

import { FormEvent, useState } from "react";
import { useRouter } from "next/navigation";
import { Card, CardHeader } from "@/components/Card";
import { LoadingSpinner } from "@/components/LoadingSpinner";
import { useLanguage } from "@/components/LanguageProvider";
import { buildLocalEntry, saveLocalEntry } from "@/lib/local-entries";
import { getSessionId } from "@/lib/session";

export default function InputPage() {
  const router = useRouter();
  const { t, language } = useLanguage();
  const [situation, setSituation] = useState("");
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError("");

    if (!situation.trim() || !message.trim()) {
      setError(t.input.errorRequired);
      return;
    }

    setLoading(true);

    try {
      const sessionId = getSessionId();
      const res = await fetch("/api/analyze", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          situation: situation.trim(),
          message: message.trim(),
          sessionId,
          language,
        }),
      });

      const data = await res.json();

      if (!data.success) {
        throw new Error(data.error || t.input.errorAnalysisFailed);
      }

      saveLocalEntry(
        buildLocalEntry(
          data.id,
          data.sessionId,
          situation.trim(),
          message.trim(),
          data.data
        )
      );

      router.push(`/result/${data.id}`);
    } catch (err) {
      setError(err instanceof Error ? err.message : t.input.errorGeneric);
      setLoading(false);
    }
  }

  if (loading) {
    return <LoadingSpinner message={t.input.loading} />;
  }

  return (
    <div className="flex flex-1 flex-col">
      <header className="mb-6">
        <h1 className="font-display text-2xl font-semibold text-text">
          {t.input.title}
        </h1>
        <p className="mt-1 text-sm text-text-muted">{t.input.subtitle}</p>
      </header>

      <form onSubmit={handleSubmit} className="flex flex-1 flex-col gap-5">
        <Card>
          <CardHeader
            icon={<span className="text-sm">💬</span>}
            title={t.input.situationTitle}
            subtitle={t.input.situationSubtitle}
          />
          <textarea
            className="input-field min-h-[100px] resize-none"
            placeholder={t.input.situationPlaceholder}
            value={situation}
            onChange={(e) => setSituation(e.target.value)}
            maxLength={1000}
          />
        </Card>

        <Card>
          <CardHeader
            icon={<span className="text-sm">✉️</span>}
            title={t.input.messageTitle}
            subtitle={t.input.messageSubtitle}
          />
          <textarea
            className="input-field min-h-[140px] resize-none"
            placeholder={t.input.messagePlaceholder}
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            maxLength={2000}
          />
        </Card>

        {error && (
          <p className="rounded-xl bg-rose/10 px-4 py-3 text-sm text-rose-deep">
            {error}
          </p>
        )}

        <button
          type="submit"
          disabled={!situation.trim() || !message.trim()}
          className="btn-primary mt-auto py-4 text-lg"
        >
          {t.input.submit}
        </button>
      </form>
    </div>
  );
}
