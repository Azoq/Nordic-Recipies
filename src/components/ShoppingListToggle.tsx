"use client";

import { useShoppingList } from "@/lib/shopping-list";
import { useLocale } from "@/lib/locale-context";
import { UI } from "@/lib/ui-strings";

export function ShoppingListToggle({ recipeId }: { recipeId: string }) {
  const { hasRecipe, toggleRecipe } = useShoppingList();
  const { locale } = useLocale();
  const ui = UI[locale];
  const added = hasRecipe(recipeId);

  return (
    <button
      onClick={() => toggleRecipe(recipeId)}
      aria-pressed={added}
      className={`flex w-full items-center justify-center gap-2 rounded-full border px-4 py-2.5 text-sm font-medium transition-colors ${
        added
          ? "border-emerald-700 bg-emerald-700 text-white active:bg-emerald-800"
          : "border-stone-700 bg-transparent text-stone-800 active:bg-stone-100"
      }`}
    >
      <CartIcon className="h-4 w-4" filled={added} />
      <span>{added ? ui.inShoppingList : ui.addToShoppingList}</span>
      {added && <span aria-hidden="true">✓</span>}
    </button>
  );
}

function CartIcon({ className, filled }: { className?: string; filled?: boolean }) {
  return (
    <svg
      className={className}
      viewBox="0 0 24 24"
      fill={filled ? "currentColor" : "none"}
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
  );
}
