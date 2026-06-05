"use client";

import { useState } from "react";
import { Card } from "@/components/Card";
import { useLanguage } from "@/components/LanguageProvider";

interface EmotionRecognitionProps {
  emotions: string[];
}

export function EmotionRecognition({ emotions }: EmotionRecognitionProps) {
  const { t } = useLanguage();
  const [selected, setSelected] = useState<Set<string>>(
    () => new Set(emotions)
  );

  if (emotions.length === 0) return null;

  function toggle(emotion: string) {
    setSelected((prev) => {
      const next = new Set(prev);
      if (next.has(emotion)) {
        next.delete(emotion);
      } else {
        next.add(emotion);
      }
      return next;
    });
  }

  return (
    <Card className="border-rose/15 bg-gradient-to-br from-blush/40 via-card to-cream/80">
      <div className="mb-4">
        <div className="mb-1 flex items-center gap-2">
          <span className="text-lg">💗</span>
          <h3 className="font-display text-lg font-semibold text-text">
            {t.result.emotionTitle}
          </h3>
        </div>
        <p className="text-sm text-text-muted">{t.result.emotionSubtitle}</p>
      </div>

      <ul className="space-y-2">
        {emotions.map((emotion) => {
          const isSelected = selected.has(emotion);
          return (
            <li key={emotion}>
              <button
                type="button"
                onClick={() => toggle(emotion)}
                className={`flex w-full items-center gap-3 rounded-xl border px-4 py-3 text-left text-sm transition-colors ${
                  isSelected
                    ? "border-rose/30 bg-blush/50 text-text"
                    : "border-rose/10 bg-card/60 text-text-muted hover:border-rose/20 hover:bg-blush/20"
                }`}
                aria-pressed={isSelected}
              >
                <span
                  className={`flex h-5 w-5 shrink-0 items-center justify-center rounded-md border text-xs ${
                    isSelected
                      ? "border-rose-deep bg-rose-deep text-cream"
                      : "border-rose/30 bg-card text-transparent"
                  }`}
                  aria-hidden
                >
                  ✓
                </span>
                <span className={isSelected ? "font-medium" : ""}>{emotion}</span>
              </button>
            </li>
          );
        })}
      </ul>

      <p className="mt-4 text-xs leading-relaxed text-text-muted/90">
        {t.result.emotionHint}
      </p>
    </Card>
  );
}
