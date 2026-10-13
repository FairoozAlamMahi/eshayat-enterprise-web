"use client";

import React, { createContext, useContext, useState, useEffect } from "react";
import { BilingualText } from "@/data/divisions";
import { trackEvent } from "@/lib/trackClient";

export type Language = "en" | "bn";

interface LanguageContextType {
  lang: Language;
  setLang: (lang: Language) => void;
  toggleLang: () => void;
  t: (textObj: BilingualText | undefined, fallback?: string) => string;
}

const LanguageContext = createContext<LanguageContextType | undefined>(
  undefined
);

export function LanguageProvider({ children }: { children: React.ReactNode }) {
  const [lang, setLangState] = useState<Language>("en");

  useEffect(() => {
    if (typeof window !== "undefined") {
      const urlParams = new URLSearchParams(window.location.search);
      const urlLang = urlParams.get("lang");
      if (urlLang === "bn" || urlLang === "en") {
        setLangState(urlLang);
        localStorage.setItem("eshayat_lang", urlLang);
        return;
      }
      const saved = localStorage.getItem("eshayat_lang");
      if (saved === "bn" || saved === "en") {
        setLangState(saved);
      }
    }
  }, []);

  const setLang = (newLang: Language) => {
    setLangState(newLang);
    if (typeof window !== "undefined") {
      localStorage.setItem("eshayat_lang", newLang);
      trackEvent({ type: "language_switch", lang: newLang });
    }
  };

  const toggleLang = () => {
    setLang(lang === "en" ? "bn" : "en");
  };

  const t = (textObj: BilingualText | undefined, fallback = ""): string => {
    if (!textObj) return fallback;
    return (lang === "bn" ? textObj.bn || textObj.en : textObj.en) || fallback;
  };

  return (
    <LanguageContext.Provider value={{ lang, setLang, toggleLang, t }}>
      {children}
    </LanguageContext.Provider>
  );
}

export function useLanguage() {
  const ctx = useContext(LanguageContext);
  if (!ctx) {
    throw new Error("useLanguage must be used within a LanguageProvider");
  }
  return ctx;
}
