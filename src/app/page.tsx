"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { RECIPES } from "@/lib/data";
import { useLocale } from "@/lib/locale-context";
import { recipeTitle, totalMinutes } from "@/lib/types";
import { UI, formatTime } from "@/lib/ui-strings";
import { CATEGORY_IDS, type CategoryId } from "@/lib/categories";
import { LocaleButton } from "@/components/LocaleButton";
import { CategoryFilter } from "@/components/CategoryFilter";
import { ShoppingListIndicator } from "@/components/ShoppingListIndicator";
import { unsplashImageUrl } from "@/lib/unsplash";

type SortMode = "latest" | "alphabetical";

// Deterministic pastel color per recipe ID
function tileColor(id: string): string {
  const palette = ["#FAC775", "#C0DD97", "#F5C4B3", "#B5D4F4"];
  let hash = 0;
  for (let i = 0; i < id.length; i++) hash = (hash * 31 + id.charCodeAt(i)) | 0;
  return palette[Math.abs(hash) % palette.length];
}

export default function HomePage() {
  const { locale } = useLocale();
  const ui = UI[locale];

  const [selectedCategory, setSelectedCategory] = useState<CategoryId | "all">("all");
  const [sortMode, setSortMode] = useState<SortMode>("latest");

  // Which categories exist in the data? (drives which chips appear)
  const availableCategories = useMemo(() => {
    const set = new Set<CategoryId>();
    for (const recipe of RECIPES) {
      if ((CATEGORY_IDS as readonly string[]).includes(recipe.category)) {
        set.add(recipe.category as CategoryId);
      }
    }
    return set;
  }, []);

  // Filter + sort
  const visibleRecipes = useMemo(() => {
    const filtered =
      selectedCategory === "all"
        ? RECIPES
        : RECIPES.filter((r) => r.category === selectedCategory);

    const sorted = [...filtered];
    if (sortMode === "latest") {
      sorted.sort((a, b) => b.added_at.localeCompare(a.added_at));
    } else {
      sorted.sort((a, b) =>
        recipeTitle(a, locale).localeCompare(recipeTitle(b, locale), locale)
      );
    }
    return sorted;
  }, [selectedCategory, sortMode, locale]);

  return (
    <main className="min-h-screen bg-white">
      <header className="sticky top-0 z-10 border-b border-stone-200 bg-white/90 backdrop-blur">
        <div className="flex items-center justify-between px-5 py-4">
          <h1 className="text-lg font-medium">{ui.recipes}</h1>
          <div className="flex items-center gap-1">
            <ShoppingListIndicator />
            <LocaleButton />
          </div>
        </div>
      </header>

      <div className="px-5 pt-4">
        <div className="mb-3 rounded-lg bg-stone-100 px-3 py-2 text-sm text-stone-500">
          {ui.search}
        </div>
        <CategoryFilter
          selected={selectedCategory}
          onChange={setSelectedCategory}
          availableCategories={availableCategories}
        />
        <div className="mt-2 flex items-center justify-between text-xs text-stone-500">
          <span>
            {visibleRecipes.length} {ui.recipes.toLowerCase()}
          </span>
          <button
            onClick={() => setSortMode(sortMode === "latest" ? "alphabetical" : "latest")}
            className="flex items-center gap-1 text-stone-600 active:text-stone-900"
          >
            <span>{sortMode === "latest" ? ui.sortLatest : ui.sortAlphabetical}</span>
            <span aria-hidden="true">↕</span>
          </button>
        </div>
      </div>

      {visibleRecipes.length === 0 ? (
        <p className="px-5 py-12 text-center text-sm text-stone-500">{ui.noResults}</p>
      ) : (
        <ul className="flex flex-col gap-3 px-5 py-4">
          {visibleRecipes.map((recipe) => {
            const count = recipe.servings;
            const unit = ui.servingsUnit(recipe.servings_unit, count);
            const time = formatTime(totalMinutes(recipe), locale);
            return (
              <li key={recipe.id}>
                <Link
                  href={`/recipe/${recipe.id}`}
                  className="flex items-center gap-3 rounded-lg py-2 transition-colors active:bg-stone-100"
                >
                  {recipe.hero_image ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={unsplashImageUrl(recipe.hero_image.unsplash_id, { width: 112, height: 112 })}
                      alt={recipe.hero_image.alt}
                      className="h-14 w-14 flex-shrink-0 rounded-md object-cover"
                      loading="lazy"
                    />
                  ) : (
                    <div
                      className="h-14 w-14 flex-shrink-0 rounded-md"
                      style={{ backgroundColor: tileColor(recipe.id) }}
                    />
                  )}
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-medium">
                      {recipeTitle(recipe, locale)}
                    </p>
                    <p className="text-xs text-stone-500">
                      {count} {unit} · {time}
                    </p>
                  </div>
                </Link>
              </li>
            );
          })}
        </ul>
      )}
    </main>
  );
}
