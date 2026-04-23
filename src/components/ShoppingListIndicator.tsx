"use client";

import Link from "next/link";
import { useShoppingList } from "@/lib/shopping-list";
import { useLocale } from "@/lib/locale-context";
import { UI } from "@/lib/ui-strings";

export function ShoppingListIndicator() {
  const { recipeIds } = useShoppingList();
  const { locale } = useLocale();
  const ui = UI[locale];
  const count = recipeIds.length;

  return (
    <Link
      href="/shopping-list"
      aria-label={ui.shoppingList}
      className="relative flex h-9 w-9 items-center justify-center rounded-md text-stone-700 active:bg-stone-100"
    >
      <svg
        className="h-5 w-5"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.75"
        strokeLinecap="round"
        strokeLinejoin="round"
        aria-hidden="true"
      >
        <path d="M3 4h2l2.4 11.2a2 2 0 0 0 2 1.6h8.2a2 2 0 0 0 2-1.6L21 7H6" />
        <circle cx="9" cy="20" r="1.5" />
        <circle cx="17" cy="20" r="1.5" />
      </svg>
      {count > 0 && (
        <span className="absolute -right-0.5 -top-0.5 flex h-4 min-w-[16px] items-center justify-center rounded-full bg-emerald-700 px-1 text-[10px] font-semibold leading-none text-white">
          {count}
        </span>
      )}
    </Link>
  );
}
