"use client";

import { Card } from "@/components/Card";
import { useLanguage } from "@/components/LanguageProvider";

interface EmotionRecognitionProps {
  emotions: string[];
}

export function EmotionRecognition({ emotions }: EmotionRecognitionProps) {
  const { t } = useLanguage();

  if (emotions.length === 0) return null;

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

      <div className="flex flex-wrap gap-2">
        {emotions.map((emotion) => (
          <span
            key={emotion}
            className="rounded-full border border-rose/25 bg-blush/40 px-3.5 py-1.5 text-sm font-medium text-text"
          >
            {emotion}
          </span>
        ))}
      </div>

      <p className="mt-4 text-xs leading-relaxed text-text-muted/90">
        {t.result.emotionHint}
      </p>
    </Card>
  );
}
