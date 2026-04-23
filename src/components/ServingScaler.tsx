"use client";

import { useLocale } from "@/lib/locale-context";
import { UI } from "@/lib/ui-strings";
import type { Recipe } from "@/lib/types";

// Portions-based recipes get a fixed set of people counts.
// Count-based recipes (buns, pieces) get multiples of the recipe's default.
function servingPresets(recipe: Recipe): number[] {
  if (recipe.servings_unit === "portions") {
    return [2, 4, 6, 8, 10];
  }
  const base = recipe.servings;
  const raw = [base / 4, base / 2, base, base * 1.5, base * 2];
  const rounded = raw.map((v) => Math.max(1, Math.round(v)));
  return Array.from(new Set(rounded)).sort((a, b) => a - b);
}

export function ServingScaler({
  recipe,
  value,
  onChange,
}: {
  recipe: Recipe;
  value: number;
  onChange: (servings: number) => void;
}) {
  const { locale } = useLocale();
  const ui = UI[locale];
  const presets = servingPresets(recipe);

  return (
    <div className="flex flex-wrap items-center justify-center gap-2">
      {presets.map((n) => {
        const active = n === value;
        const unit = ui.servingsUnit(recipe.servings_unit, n);
        return (
          <button
            key={n}
            onClick={() => onChange(n)}
            aria-pressed={active}
            className={`rounded-full border px-3 py-1.5 text-sm transition-colors ${
              active
                ? "border-stone-800 bg-stone-800 text-white"
                : "border-stone-300 bg-white text-stone-700 active:bg-stone-100"
            }`}
          >
            {n} <span className={active ? "text-stone-200" : "text-stone-500"}>{unit}</span>
          </button>
        );
      })}
    </div>
  );
}
