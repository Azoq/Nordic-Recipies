"use client";

import { createContext, useContext, useEffect, useState, ReactNode } from "react";
import type { AppLocale } from "./types";

type LocaleContextValue = {
  locale: AppLocale;
  setLocale: (locale: AppLocale) => void;
};

const LocaleContext = createContext<LocaleContextValue | null>(null);

const STORAGE_KEY = "nordic-recipes-locale";

export function LocaleProvider({ children }: { children: ReactNode }) {
  const [locale, setLocaleState] = useState<AppLocale>("sv");
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    const stored = localStorage.getItem(STORAGE_KEY) as AppLocale | null;
    if (stored && ["sv", "no", "da", "en"].includes(stored)) {
      setLocaleState(stored);
    }
    setHydrated(true);
  }, []);

  const setLocale = (next: AppLocale) => {
    setLocaleState(next);
    localStorage.setItem(STORAGE_KEY, next);
  };

  // Avoid hydration mismatch: render with default until client state is loaded
  if (!hydrated) {
    return <LocaleContext.Provider value={{ locale: "sv", setLocale }}>{children}</LocaleContext.Provider>;
  }

  return <LocaleContext.Provider value={{ locale, setLocale }}>{children}</LocaleContext.Provider>;
}

export function useLocale(): LocaleContextValue {
  const ctx = useContext(LocaleContext);
  if (!ctx) throw new Error("useLocale must be used inside LocaleProvider");
  return ctx;
}
