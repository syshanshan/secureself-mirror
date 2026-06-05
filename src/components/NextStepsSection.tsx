"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Card } from "@/components/Card";
import { useLanguage } from "@/components/LanguageProvider";
import { computeAnxietyReduction } from "@/lib/action-anxiety";
import {
  isLocalEntryId,
  persistActionCompletion,
  saveLocalEntry,
} from "@/lib/local-entries";
import { normalizeMirrorEntry } from "@/lib/normalize-mirror-entry";
import { getSessionId } from "@/lib/session";
import type { MirrorEntry, MoodAfterAction } from "@/types/analysis";

const MOOD_OPTIONS: MoodAfterAction[] = [
  "calm",
  "relaxed",
  "still_anxious",
  "sad",
  "empowered",
  "clearer",
];

const ANXIETY_LEVELS = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10] as const;

type ActionPhase = "select" | "inProgress" | "reflect";

interface ActionPatchResponse {
  success?: boolean;
  entry?: MirrorEntry;
  error?: string;
  fallback?: string;
}

function logActionSaveError(error: unknown) {
  console.error("Action save failed", {
    message: error instanceof Error ? error.message : String(error),
    error,
  });
}

function safeRefresh(router: { refresh: () => void }) {
  try {
    router.refresh();
  } catch (refreshError) {
    console.warn("router.refresh failed after action save", {
      message:
        refreshError instanceof Error
          ? refreshError.message
          : String(refreshError),
      error: refreshError,
    });
  }
}

async function parseActionPatchResponse(
  res: Response
): Promise<ActionPatchResponse> {
  try {
    const text = await res.text();
    if (!text.trim()) {
      console.warn("PATCH /api/entries/[id]/action returned empty body", {
        status: res.status,
        statusText: res.statusText,
      });
      return {};
    }
    return JSON.parse(text) as ActionPatchResponse;
  } catch (parseError) {
    logActionSaveError(parseError);
    console.warn("PATCH /api/entries/[id]/action response JSON parse failed", {
      status: res.status,
      statusText: res.statusText,
    });
    return {};
  }
}

interface NextStepsSectionProps {
  entry: MirrorEntry;
  selfCareSteps: string[];
  onEntryUpdate: (entry: MirrorEntry) => void;
}

function AnxietyScale({
  label,
  value,
  onChange,
}: {
  label: string;
  value: number | null;
  onChange: (level: number) => void;
}) {
  return (
    <div>
      <p className="text-sm font-medium text-text">{label}</p>
      <div className="mt-3 flex flex-wrap gap-2">
        {ANXIETY_LEVELS.map((level) => (
          <button
            key={level}
            type="button"
            onClick={() => onChange(level)}
            className={`flex h-9 w-9 items-center justify-center rounded-full text-sm font-medium transition-colors ${
              value === level
                ? "bg-rose-deep text-cream"
                : "border border-rose/25 bg-card text-text-muted hover:border-rose/40"
            }`}
          >
            {level}
          </button>
        ))}
      </div>
    </div>
  );
}

export function NextStepsSection({
  entry,
  selfCareSteps,
  onEntryUpdate,
}: NextStepsSectionProps) {
  const router = useRouter();
  const { t } = useLanguage();
  const [selectedStep, setSelectedStep] = useState(
    entry.selectedSelfCareStep ?? ""
  );
  const [phase, setPhase] = useState<ActionPhase>("select");
  const [anxietyBefore, setAnxietyBefore] = useState<number | null>(
    entry.anxietyBefore
  );
  const [anxietyAfter, setAnxietyAfter] = useState<number | null>(
    entry.anxietyAfter
  );
  const [moodAfter, setMoodAfter] = useState<MoodAfterAction | "">(
    entry.moodAfterAction ?? ""
  );
  const [reflection, setReflection] = useState(
    entry.reflectionAfterAction ?? ""
  );
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");
  const [saved, setSaved] = useState(entry.actionCompleted);

  async function handleSave(): Promise<void> {
    if (!selectedStep) {
      setError(t.result.actionSelectStep);
      return;
    }
    if (anxietyBefore == null) {
      setError(t.result.actionSelectAnxietyBefore);
      return;
    }
    if (anxietyAfter == null) {
      setError(t.result.actionSelectAnxietyAfter);
      return;
    }
    if (!moodAfter) {
      setError(t.result.actionSelectMood);
      return;
    }

    setSaving(true);
    setError("");
    setNotice("");

    const completedAt = new Date().toISOString();
    const anxietyReduction = computeAnxietyReduction(anxietyBefore, anxietyAfter);

    const requestBody = {
      sessionId: entry.sessionId || getSessionId(),
      selectedSelfCareStep: selectedStep,
      actionCompleted: true,
      moodBeforeAction: (entry.emotions ?? []).join(" / "),
      moodAfterAction: moodAfter,
      reflectionAfterAction: reflection.trim(),
      anxietyBefore,
      anxietyAfter,
      anxietyReduction,
      completedAt,
    };

    const applyLocalSave = (cloudSyncFailed: boolean) => {
      const updated = persistActionCompletion(entry.id, requestBody, entry);
      saveLocalEntry(updated);
      console.log("Action completion saved to localStorage", updated);
      onEntryUpdate(updated);
      setSaved(true);
      setPhase("select");
      if (cloudSyncFailed) {
        setNotice(t.result.actionSavedLocalSyncPending);
      }
      safeRefresh(router);
      return updated;
    };

    try {
      console.log("Entry id for action update", entry.id);
      console.log("Is local entry", isLocalEntryId(entry.id));

      if (isLocalEntryId(entry.id)) {
        applyLocalSave(false);
        return;
      }

      let supabaseSaved = false;

      try {
        const res = await fetch(`/api/entries/${entry.id}/action`, {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(requestBody),
        });
        const data = await parseActionPatchResponse(res);

        if (res.ok && data.success && data.entry) {
          const updated = normalizeMirrorEntry(data.entry);
          saveLocalEntry(updated);
          console.log("Action completion saved to Supabase", updated);
          onEntryUpdate(updated);
          setSaved(true);
          setPhase("select");
          safeRefresh(router);
          supabaseSaved = true;
        } else {
          console.warn(
            "Supabase action sync failed, falling back to localStorage",
            {
              status: res.status,
              statusText: res.statusText,
              error: data.error ?? null,
              fallback: data.fallback ?? null,
            }
          );
        }
      } catch (syncErr) {
        logActionSaveError(syncErr);
        console.warn(
          "Supabase action sync failed, falling back to localStorage"
        );
      }

      if (!supabaseSaved) {
        applyLocalSave(true);
      }
    } catch (err) {
      logActionSaveError(err);
      try {
        applyLocalSave(true);
      } catch (localErr) {
        logActionSaveError(localErr);
        setError(t.result.actionSaveFailed);
      }
    } finally {
      setSaving(false);
    }
  }

  function handleSaveClick(event: React.MouseEvent<HTMLButtonElement>) {
    event.preventDefault();
    void handleSave();
  }

  function handleStartAction() {
    if (!selectedStep) {
      setError(t.result.actionSelectStep);
      return;
    }
    if (anxietyBefore == null) {
      setError(t.result.actionSelectAnxietyBefore);
      return;
    }
    setError("");
    setPhase("inProgress");
  }

  return (
    <Card className="border-sage/10 bg-gradient-to-br from-card to-cream/60">
      <div className="mb-4 flex items-center gap-2">
        <span className="text-lg">🌱</span>
        <h3 className="font-display text-lg font-semibold text-text">
          {t.result.suggestedNextStep}
        </h3>
      </div>

      <div className="space-y-4">
        <div className="rounded-xl border border-rose/15 bg-blush/20 px-4 py-3">
          <p className="text-xs font-medium uppercase tracking-wide text-rose-deep">
            {t.result.relationshipStepTitle}
          </p>
          <p className="mt-2 text-sm leading-relaxed text-text">
            {entry.relationshipNextStep}
          </p>
        </div>

        {!saved && phase === "select" && (
          <div className="rounded-xl border border-rose/15 bg-blush/10 px-4 py-4">
            <AnxietyScale
              label={t.result.actionAnxietyBeforeQuestion}
              value={anxietyBefore}
              onChange={setAnxietyBefore}
            />
          </div>
        )}

        <div className="rounded-xl border border-sage/15 bg-cream/50 px-4 py-3">
          <p className="text-xs font-medium uppercase tracking-wide text-text-muted">
            {t.result.selfCareStepTitle}
          </p>
          <ul className="mt-3 space-y-2">
            {selfCareSteps.map((step) => {
              const isSelected = selectedStep === step;
              return (
                <li key={step}>
                  <button
                    type="button"
                    onClick={() => {
                      if (!saved) setSelectedStep(step);
                    }}
                    disabled={saved}
                    className={`flex w-full items-center gap-3 rounded-xl border px-3 py-2.5 text-left text-sm transition-colors ${
                      isSelected
                        ? "border-rose/30 bg-blush/40 text-text"
                        : "border-rose/10 bg-card/60 text-text-muted hover:border-rose/20"
                    }`}
                  >
                    <span
                      className={`flex h-5 w-5 shrink-0 items-center justify-center rounded-md border text-xs ${
                        isSelected
                          ? "border-rose-deep bg-rose-deep text-cream"
                          : "border-rose/30 bg-card text-transparent"
                      }`}
                    >
                      ✓
                    </span>
                    <span>{step}</span>
                  </button>
                </li>
              );
            })}
          </ul>
        </div>

        {!saved && phase === "select" && selectedStep && (
          <button
            type="button"
            onClick={handleStartAction}
            className="btn-primary w-full py-3.5"
          >
            {t.result.actionStartButton}
          </button>
        )}

        {saved ? (
          <div className="rounded-xl border border-sage/20 bg-sage/5 px-4 py-3 text-sm text-text">
            <p className="font-medium">{t.result.actionCompletedTitle}</p>
            <p className="mt-1 text-text-muted">
              {entry.selectedSelfCareStep ?? selectedStep}
            </p>
            {notice && (
              <p className="mt-2 text-text-muted">{notice}</p>
            )}
            {entry.anxietyBefore != null && entry.anxietyAfter != null && (
              <p className="mt-2 text-text-muted">
                {t.result.actionAnxietySummary
                  .replace("{before}", String(entry.anxietyBefore))
                  .replace("{after}", String(entry.anxietyAfter))
                  .replace(
                    "{reduction}",
                    String(entry.anxietyReduction ?? entry.anxietyAfter - entry.anxietyBefore)
                  )}
              </p>
            )}
            {entry.moodAfterAction && (
              <p className="mt-2 text-text-muted">
                {t.history.feltAfter}:{" "}
                {t.result.moods[entry.moodAfterAction]}
              </p>
            )}
          </div>
        ) : (
          <>
            {phase === "inProgress" && (
              <div className="rounded-xl border border-sage/15 bg-sage/5 px-4 py-4">
                <p className="text-sm leading-relaxed text-text-muted">
                  {t.result.actionInProgressHint}
                </p>
                <button
                  type="button"
                  onClick={() => {
                    setError("");
                    setPhase("reflect");
                  }}
                  className="btn-primary mt-4 w-full py-3.5"
                >
                  {t.result.actionCompleteButton}
                </button>
                <button
                  type="button"
                  onClick={() => setPhase("select")}
                  className="btn-secondary mt-2 w-full py-2.5 text-sm"
                >
                  {t.result.actionCancel}
                </button>
              </div>
            )}

            {phase === "reflect" && (
              <div className="rounded-xl border border-rose/15 bg-blush/10 px-4 py-4">
                <AnxietyScale
                  label={t.result.actionAnxietyAfterQuestion}
                  value={anxietyAfter}
                  onChange={setAnxietyAfter}
                />

                <div className="mt-5">
                  <h4 className="font-display text-base font-semibold text-text">
                    {t.result.actionReflectionTitle}
                  </h4>
                  <p className="mt-1 text-sm text-text-muted">
                    {t.result.actionReflectionQuestion}
                  </p>

                  <div className="mt-4 flex flex-wrap gap-2">
                    {MOOD_OPTIONS.map((mood) => (
                      <button
                        key={mood}
                        type="button"
                        onClick={() => setMoodAfter(mood)}
                        className={`rounded-full px-3 py-1.5 text-xs font-medium transition-colors ${
                          moodAfter === mood
                            ? "bg-rose-deep text-cream"
                            : "border border-rose/25 bg-card text-text-muted hover:border-rose/40"
                        }`}
                      >
                        {t.result.moods[mood]}
                      </button>
                    ))}
                  </div>
                </div>

                <textarea
                  className="input-field mt-4 min-h-[80px] resize-none"
                  placeholder={t.result.actionReflectionPlaceholder}
                  value={reflection}
                  onChange={(e) => setReflection(e.target.value)}
                  maxLength={500}
                />

                <div className="mt-4 flex flex-col gap-2">
                  <button
                    type="button"
                    onClick={handleSaveClick}
                    disabled={saving}
                    className="btn-primary py-3"
                  >
                    {saving ? t.result.actionSaving : t.result.actionSaveButton}
                  </button>
                  <button
                    type="button"
                    onClick={() => setPhase("inProgress")}
                    className="btn-secondary py-2.5 text-sm"
                  >
                    {t.result.actionCancel}
                  </button>
                </div>
              </div>
            )}
          </>
        )}

        {notice && !saved && (
          <p className="rounded-xl bg-sage/10 px-4 py-3 text-sm text-text">
            {notice}
          </p>
        )}

        {error && (
          <p className="rounded-xl bg-rose/10 px-4 py-3 text-sm text-rose-deep">
            {error}
          </p>
        )}
      </div>
    </Card>
  );
}
