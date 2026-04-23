"use client";

import { useState } from "react";
import { useLocale } from "@/lib/locale-context";
import { ALL_LOCALES, LOCALE_DISPLAY_NAME, type AppLocale } from "@/lib/types";
import { UI } from "@/lib/ui-strings";

export function LocaleButton() {
  const { locale, setLocale } = useLocale();
  const [open, setOpen] = useState(false);
  const ui = UI[locale];

  return (
    <>
      <button
        onClick={() => setOpen(true)}
        className="rounded-md px-2 py-1 text-xs font-medium text-stone-600 active:bg-stone-100"
      >
        {locale.toUpperCase()}
      </button>

      {open && (
        <div
          className="fixed inset-0 z-50 flex items-end bg-black/30"
          onClick={() => setOpen(false)}
        >
          <div
            className="w-full rounded-t-2xl bg-white px-5 pb-8 pt-4"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="mx-auto mb-4 h-1 w-10 rounded-full bg-stone-300" />
            <h2 className="mb-4 text-lg font-medium">{ui.language}</h2>
            <ul className="flex flex-col gap-1">
              {ALL_LOCALES.map((l) => (
                <li key={l}>
                  <button
                    onClick={() => {
                      setLocale(l);
                      setOpen(false);
                    }}
                    className={`flex w-full items-center justify-between rounded-md px-3 py-3 text-left text-sm ${
                      locale === l ? "bg-stone-100 font-medium" : "active:bg-stone-50"
                    }`}
                  >
                    <span>{LOCALE_DISPLAY_NAME[l]}</span>
                    {locale === l && <span>✓</span>}
                  </button>
                </li>
              ))}
            </ul>
          </div>
        </div>
      )}
    </>
  );
}
