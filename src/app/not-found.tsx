"use client";

import Link from "next/link";
import { useLanguage } from "@/components/LanguageProvider";

export default function NotFound() {
  const { t } = useLanguage();

  return (
    <div className="flex flex-1 flex-col items-center justify-center text-center">
      <span className="mb-4 text-4xl">🌿</span>
      <h1 className="font-display text-xl font-semibold">{t.notFound.title}</h1>
      <p className="mt-2 text-sm text-text-muted">{t.notFound.description}</p>
      <Link href="/history" className="btn-primary mt-6 px-8 py-3">
        {t.notFound.viewHistory}
      </Link>
    </div>
  );
}
