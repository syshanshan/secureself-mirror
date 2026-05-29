"use client";

import Link from "next/link";
import { Card } from "@/components/Card";
import { useLanguage } from "@/components/LanguageProvider";

export default function HomePage() {
  const { t } = useLanguage();

  return (
    <div className="flex flex-1 flex-col">
      <header className="mb-8 text-center">
        <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-blush">
          <span className="text-3xl">🪞</span>
        </div>
        <h1 className="font-display text-3xl font-semibold tracking-tight text-text">
          {t.productName}
        </h1>
        <p className="mt-2 text-text-muted">{t.home.tagline}</p>
      </header>

      <Card className="mb-6">
        <p className="leading-relaxed text-text">{t.home.intro}</p>
      </Card>

      <div className="mb-8 space-y-3">
        <FeatureItem
          emoji="💭"
          title={t.home.feature1Title}
          description={t.home.feature1Desc}
        />
        <FeatureItem
          emoji="✍️"
          title={t.home.feature2Title}
          description={t.home.feature2Desc}
        />
        <FeatureItem
          emoji="🌸"
          title={t.home.feature3Title}
          description={t.home.feature3Desc}
        />
      </div>

      <Link
        href="/input"
        className="btn-primary mb-4 block py-4 text-center text-lg"
      >
        {t.home.cta}
      </Link>

      <p className="text-center text-xs text-text-muted">{t.home.closing}</p>
    </div>
  );
}

function FeatureItem({
  emoji,
  title,
  description,
}: {
  emoji: string;
  title: string;
  description: string;
}) {
  return (
    <div className="flex items-start gap-3 rounded-2xl bg-card/60 px-4 py-3">
      <span className="text-xl">{emoji}</span>
      <div>
        <p className="font-medium text-text">{title}</p>
        <p className="text-sm text-text-muted">{description}</p>
      </div>
    </div>
  );
}
