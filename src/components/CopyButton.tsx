"use client";

import { useState } from "react";
import { useLanguage } from "@/components/LanguageProvider";

interface CopyButtonProps {
  text: string;
}

export function CopyButton({ text }: CopyButtonProps) {
  const { t } = useLanguage();
  const [copied, setCopied] = useState(false);

  async function handleCopy() {
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      setCopied(false);
    }
  }

  return (
    <button
      type="button"
      onClick={handleCopy}
      className="btn-secondary shrink-0 px-4 py-2 text-sm"
    >
      {copied ? t.copy.copied : t.copy.copy}
    </button>
  );
}
