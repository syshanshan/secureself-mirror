"use client";

import {
  createContext,
  useContext,
  useEffect,
  useState,
  type ReactNode,
} from "react";
import { getStoredLanguage, setStoredLanguage } from "@/lib/i18n/language";
import { translations } from "@/lib/i18n/translations";
import type { Language, Translations } from "@/lib/i18n/types";

interface LanguageContextValue {
  language: Language;
  setLanguage: (language: Language) => void;
  t: Translations;
}

const LanguageContext = createContext<LanguageContextValue | null>(null);

export function LanguageProvider({ children }: { children: ReactNode }) {
  const [language, setLanguageState] = useState<Language>("en");

  useEffect(() => {
    const stored = getStoredLanguage();
    setLanguageState(stored);
    document.documentElement.lang = stored === "zh" ? "zh-CN" : "en";
  }, []);

  function setLanguage(next: Language) {
    setLanguageState(next);
    setStoredLanguage(next);
    document.documentElement.lang = next === "zh" ? "zh-CN" : "en";
  }

  const t = translations[language];

  return (
    <LanguageContext.Provider value={{ language, setLanguage, t }}>
      {children}
    </LanguageContext.Provider>
  );
}

export function useLanguage(): LanguageContextValue {
  const context = useContext(LanguageContext);
  if (!context) {
    throw new Error("useLanguage must be used within LanguageProvider");
  }
  return context;
}
