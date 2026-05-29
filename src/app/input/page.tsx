"use client";

import { FormEvent, useState } from "react";
import { useRouter } from "next/navigation";
import { Card, CardHeader } from "@/components/Card";
import { LoadingSpinner } from "@/components/LoadingSpinner";
import { buildLocalEntry, saveLocalEntry } from "@/lib/local-entries";
import { getSessionId } from "@/lib/session";

export default function InputPage() {
  const router = useRouter();
  const [situation, setSituation] = useState("");
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError("");

    if (!situation.trim() || !message.trim()) {
      setError("Please fill in both fields before continuing.");
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
        }),
      });

      const data = await res.json();

      if (!data.success) {
        throw new Error(data.error || "Analysis failed");
      }

      if (data.source === "local") {
        saveLocalEntry(
          buildLocalEntry(
            data.id,
            data.sessionId,
            situation.trim(),
            message.trim(),
            data.data
          )
        );
      }

      router.push(`/result/${data.id}`);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong");
      setLoading(false);
    }
  }

  if (loading) {
    return <LoadingSpinner message="Your secure self is reflecting..." />;
  }

  return (
    <div className="flex flex-1 flex-col">
      <header className="mb-6">
        <h1 className="font-display text-2xl font-semibold text-text">
          Reflect on Your Message
        </h1>
        <p className="mt-1 text-sm text-text-muted">
          Take a breath. There&apos;s no rush.
        </p>
      </header>

      <form onSubmit={handleSubmit} className="flex flex-1 flex-col gap-5">
        <Card>
          <CardHeader
            icon={<span className="text-sm">💬</span>}
            title="What's happening?"
            subtitle="Briefly describe the relationship situation"
          />
          <textarea
            className="input-field min-h-[100px] resize-none"
            placeholder="e.g., We haven't talked in 2 days after a small disagreement..."
            value={situation}
            onChange={(e) => setSituation(e.target.value)}
            maxLength={1000}
          />
        </Card>

        <Card>
          <CardHeader
            icon={<span className="text-sm">✉️</span>}
            title="Your draft message"
            subtitle="What you want to send (or already sent)"
          />
          <textarea
            className="input-field min-h-[140px] resize-none"
            placeholder="e.g., Why haven't you responded? Do you even care about us anymore?"
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
          Analyze My Message
        </button>
      </form>
    </div>
  );
}
