"use client";

import { useLanguage } from "@/components/LanguageProvider";

export function LanguageToggle() {
  const { language, setLanguage } = useLanguage();

  return (
    <div
      className="flex items-center gap-0.5 rounded-full border border-rose/30 bg-card p-0.5 text-xs font-medium"
      role="group"
      aria-label="Language"
    >
      <ToggleButton
        active={language === "en"}
        onClick={() => setLanguage("en")}
        label="EN"
      />
      <ToggleButton
        active={language === "zh"}
        onClick={() => setLanguage("zh")}
        label="中文"
      />
    </div>
  );
}

function ToggleButton({
  active,
  onClick,
  label,
}: {
  active: boolean;
  onClick: () => void;
  label: string;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`rounded-full px-2.5 py-1 transition-colors ${
        active
          ? "bg-rose-deep text-cream"
          : "text-text-muted hover:text-text"
      }`}
      aria-pressed={active}
    >
      {label}
    </button>
  );
}
