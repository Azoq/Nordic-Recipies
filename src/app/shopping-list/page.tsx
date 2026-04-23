"use client";

import { useMemo } from "react";
import Link from "next/link";
import { useLocale } from "@/lib/locale-context";
import { UI } from "@/lib/ui-strings";
import {
  aggregateShoppingList,
  categorySortKey,
  formatShoppingLine,
  useShoppingList,
  type ShoppingInput,
} from "@/lib/shopping-list";
import { getRecipe } from "@/lib/data";
import { recipeTitle, type Recipe } from "@/lib/types";

export default function ShoppingListPage() {
  const { locale } = useLocale();
  const ui = UI[locale];
  const {
    items,
    removeRecipe,
    setServings,
    clearRecipes,
    isChecked,
    toggleChecked,
  } = useShoppingList();

  // Resolve each item's Recipe and target servings, dropping any orphans.
  const resolved = useMemo<Array<{ recipe: Recipe; servings: number }>>(() => {
    return items
      .map((item) => {
        const recipe = getRecipe(item.recipeId);
        if (!recipe) return null;
        return { recipe, servings: item.servings };
      })
      .filter((x): x is { recipe: Recipe; servings: number } => x !== null);
  }, [items]);

  const groupedLines = useMemo(() => {
    const inputs: ShoppingInput[] = resolved;
    const lines = aggregateShoppingList(inputs);
    const byCategory = new Map<string, typeof lines>();
    for (const line of lines) {
      const cat = line.ingredient.category;
      const bucket = byCategory.get(cat) ?? [];
      bucket.push(line);
      byCategory.set(cat, bucket);
    }
    for (const [, bucket] of byCategory) {
      bucket.sort((a, b) =>
        (a.ingredient.names[locale] ?? a.ingredient.id).localeCompare(
          b.ingredient.names[locale] ?? b.ingredient.id,
          locale
        )
      );
    }
    return Array.from(byCategory.entries()).sort(
      ([a], [b]) => categorySortKey(a) - categorySortKey(b)
    );
  }, [resolved, locale]);

  const empty = resolved.length === 0;

  return (
    <main className="min-h-screen bg-stone-50 pb-16">
      <header className="sticky top-0 z-10 flex items-center justify-between gap-3 border-b border-stone-200 bg-white/90 px-5 py-4 backdrop-blur">
        <div className="flex items-center gap-3">
          <Link href="/" className="text-stone-600 active:text-stone-900" aria-label="Back">
            ←
          </Link>
          <h1 className="text-base font-medium">{ui.shoppingList}</h1>
        </div>
        {!empty && (
          <button
            onClick={clearRecipes}
            className="text-xs font-medium text-stone-600 active:text-stone-900"
          >
            {ui.clearList}
          </button>
        )}
      </header>

      {empty ? (
        <div className="px-5 py-16 text-center">
          <p className="text-sm font-medium text-stone-700">{ui.emptyShoppingList}</p>
          <p className="mt-1 text-xs text-stone-500">{ui.emptyShoppingListHint}</p>
          <Link
            href="/"
            className="mt-6 inline-block rounded-full border border-stone-700 px-4 py-2 text-sm font-medium text-stone-800 active:bg-stone-100"
          >
            {ui.recipes}
          </Link>
        </div>
      ) : (
        <div className="px-5 pt-4">
          <section className="mb-6">
            <h2 className="mb-2 text-xs font-semibold uppercase tracking-wider text-stone-500">
              {ui.selectedRecipes}
            </h2>
            <ul className="flex flex-col gap-2">
              {resolved.map(({ recipe, servings }) => {
                const unit = ui.servingsUnit(recipe.servings_unit, servings);
                const scaled = servings !== recipe.servings;
                return (
                  <li
                    key={recipe.id}
                    className="rounded-md border border-stone-200 bg-white px-3 py-2.5"
                  >
                    <div className="flex items-center justify-between gap-2">
                      <Link
                        href={`/recipe/${recipe.id}`}
                        className="min-w-0 flex-1 truncate text-sm font-medium text-stone-800 active:text-stone-900"
                      >
                        {recipeTitle(recipe, locale)}
                      </Link>
                      <button
                        onClick={() => removeRecipe(recipe.id)}
                        className="text-xs text-stone-500 active:text-stone-900"
                        aria-label={ui.removeRecipe}
                      >
                        {ui.removeRecipe}
                      </button>
                    </div>
                    <div className="mt-2 flex items-center justify-between gap-3">
                      <div className="flex items-center gap-2">
                        <StepButton
                          onClick={() => setServings(recipe.id, servings - 1)}
                          disabled={servings <= 1}
                          label="−"
                        />
                        <span className="min-w-[3.5rem] text-center text-sm font-semibold tabular-nums text-stone-800">
                          {servings} <span className="font-normal text-stone-500">{unit}</span>
                        </span>
                        <StepButton
                          onClick={() => setServings(recipe.id, servings + 1)}
                          label="+"
                        />
                      </div>
                      {scaled && (
                        <button
                          onClick={() => setServings(recipe.id, recipe.servings)}
                          className="text-[11px] text-stone-500 underline-offset-2 hover:underline active:text-stone-800"
                        >
                          ×{(servings / recipe.servings).toFixed(2).replace(/\.?0+$/, "")}
                        </button>
                      )}
                    </div>
                  </li>
                );
              })}
            </ul>
          </section>

          <section>
            <h2 className="mb-3 text-xs font-semibold uppercase tracking-wider text-stone-500">
              {ui.ingredients}
            </h2>
            <div className="flex flex-col gap-6">
              {groupedLines.map(([category, lines]) => (
                <div key={category}>
                  <h3 className="mb-2 text-sm font-semibold text-stone-700">
                    {ui.categoryName(category)}
                  </h3>
                  <ul className="overflow-hidden rounded-lg border border-stone-200 bg-white">
                    {lines.map((line) => {
                      const checked = isChecked(line.key);
                      return (
                        <li
                          key={line.key}
                          className="border-b border-stone-100 last:border-b-0"
                        >
                          <button
                            onClick={() => toggleChecked(line.key)}
                            className="flex w-full items-center gap-3 px-3 py-2.5 text-left active:bg-stone-50"
                          >
                            <span
                              className={`flex h-5 w-5 flex-shrink-0 items-center justify-center rounded border ${
                                checked
                                  ? "border-emerald-700 bg-emerald-700 text-white"
                                  : "border-stone-300 bg-white"
                              }`}
                              aria-hidden="true"
                            >
                              {checked && <Check className="h-3.5 w-3.5" />}
                            </span>
                            <span
                              className={`text-sm ${
                                checked ? "text-stone-400 line-through" : "text-stone-800"
                              }`}
                            >
                              {formatShoppingLine(line, locale)}
                            </span>
                          </button>
                        </li>
                      );
                    })}
                  </ul>
                </div>
              ))}
            </div>
          </section>
        </div>
      )}
    </main>
  );
}

function StepButton({
  onClick,
  label,
  disabled,
}: {
  onClick: () => void;
  label: string;
  disabled?: boolean;
}) {
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className="flex h-8 w-8 items-center justify-center rounded-full border border-stone-300 bg-white text-base font-semibold text-stone-700 active:bg-stone-100 disabled:cursor-not-allowed disabled:opacity-40"
    >
      {label}
    </button>
  );
}

function Check({ className }: { className?: string }) {
  return (
    <svg
      className={className}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="3"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <polyline points="4 12 10 18 20 6" />
    </svg>
  );
}
