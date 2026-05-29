import Link from "next/link";
import { type ReactNode } from "react";
import { BottomNav } from "@/components/BottomNav";

interface AppShellProps {
  children: ReactNode;
}

export function AppShell({ children }: AppShellProps) {
  return (
    <div className="mx-auto flex min-h-dvh max-w-lg flex-col px-5 pb-24 pt-6">
      <header className="mb-6 flex items-center justify-between">
        <Link href="/" className="group flex flex-col">
          <span className="font-display text-xl font-medium tracking-tight text-warm">
            SecureSelf
          </span>
          <span className="text-xs text-rose-deep/80 group-hover:text-rose-deep">
            Mirror
          </span>
        </Link>
        <Link
          href="/input"
          className="btn-primary px-4 py-2 text-sm"
        >
          Reflect
        </Link>
      </header>
      <main className="flex flex-1 flex-col">{children}</main>
      <footer className="mt-10 text-center text-xs text-warm-muted/80">
        For reflection only — not a substitute for therapy or crisis care.
      </footer>
      <BottomNav />
    </div>
  );
}
