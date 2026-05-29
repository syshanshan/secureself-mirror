import type { Language } from "./types";

const LANGUAGE_KEY = "secureself_language";

export function getStoredLanguage(): Language {
  if (typeof window === "undefined") return "en";

  const stored = localStorage.getItem(LANGUAGE_KEY);
  return stored === "zh" ? "zh" : "en";
}

export function setStoredLanguage(language: Language): void {
  localStorage.setItem(LANGUAGE_KEY, language);
}
