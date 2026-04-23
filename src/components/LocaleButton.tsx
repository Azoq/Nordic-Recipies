"use client";

import { useEffect, useRef, useState } from "react";
import { useLocale } from "@/lib/locale-context";
import { ALL_LOCALES, LOCALE_DISPLAY_NAME } from "@/lib/types";

export function LocaleButton() {
  const { locale, setLocale } = useLocale();
  const [open, setOpen] = useState(false);
  const wrapperRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    function onDocClick(event: MouseEvent) {
      if (!wrapperRef.current) return;
      if (!wrapperRef.current.contains(event.target as Node)) {
        setOpen(false);
      }
    }
    function onKey(event: KeyboardEvent) {
      if (event.key === "Escape") setOpen(false);
    }
    document.addEventListener("mousedown", onDocClick);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("mousedown", onDocClick);
      document.removeEventListener("keydown", onKey);
    };
  }, [open]);

  return (
    <div ref={wrapperRef} className="relative">
      <button
        onClick={() => setOpen((v) => !v)}
        aria-expanded={open}
        aria-haspopup="listbox"
        className="flex items-center gap-1 rounded-md px-2 py-1 text-xs font-medium text-stone-600 active:bg-stone-100"
      >
        <span>{locale.toUpperCase()}</span>
        <span
          aria-hidden="true"
          className={`text-[10px] transition-transform ${open ? "rotate-180" : ""}`}
        >
          ▾
        </span>
      </button>

      {open && (
        <ul
          role="listbox"
          className="absolute right-0 top-full z-50 mt-1 w-44 overflow-hidden rounded-lg border border-stone-200 bg-white shadow-lg"
        >
          {ALL_LOCALES.map((l) => {
            const active = locale === l;
            return (
              <li key={l} role="option" aria-selected={active}>
                <button
                  onClick={() => {
                    setLocale(l);
                    setOpen(false);
                  }}
                  className={`flex w-full items-center justify-between px-3 py-2.5 text-left text-sm ${
                    active ? "bg-stone-100 font-medium" : "hover:bg-stone-50 active:bg-stone-100"
                  }`}
                >
                  <span>{LOCALE_DISPLAY_NAME[l]}</span>
                  {active && <span aria-hidden="true">✓</span>}
                </button>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}
