"use client";

import Link from "next/link";
import { BottomNav } from "@/components/BottomNav";
import { LanguageToggle } from "@/components/LanguageToggle";
import { useLanguage } from "@/components/LanguageProvider";
import { type ReactNode } from "react";

interface AppShellProps {
  children: ReactNode;
}

export function AppShell({ children }: AppShellProps) {
  const { t, language } = useLanguage();
  const brandLine1 = language === "zh" ? "安全型" : "SecureSelf";
  const brandLine2 = language === "zh" ? "对话镜子" : t.productNameShort;

  return (
    <div className="mx-auto flex min-h-dvh max-w-lg flex-col px-5 pb-24 pt-6">
      <header className="mb-6 flex items-center justify-between gap-3">
        <Link href="/" className="group min-w-0 flex flex-col">
          <span className="font-display text-xl font-medium tracking-tight text-warm">
            {brandLine1}
          </span>
          <span className="text-xs text-rose-deep/80 group-hover:text-rose-deep">
            {brandLine2}
          </span>
        </Link>
        <div className="flex shrink-0 items-center gap-2">
          <LanguageToggle />
          <Link href="/input" className="btn-primary px-4 py-2 text-sm">
            {t.nav.reflect}
          </Link>
        </div>
      </header>
      <main className="flex flex-1 flex-col">{children}</main>
      <footer className="mt-10 text-center text-xs text-warm-muted/80">
        {t.footer.privacy}
      </footer>
      <BottomNav />
    </div>
  );
}
