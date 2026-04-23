"use client";

import { useMemo } from "react";
import { RECIPES } from "@/lib/data";
import { useLocale } from "@/lib/locale-context";
import { UI } from "@/lib/ui-strings";
import { CATEGORY_IDS, categoryName, type CategoryId } from "@/lib/categories";
import { LocaleButton } from "@/components/LocaleButton";
import { ShoppingListIndicator } from "@/components/ShoppingListIndicator";
import { RecipeSection } from "@/components/RecipeSection";

const NEW_RECIPES_LIMIT = 6;

export default function HomePage() {
  const { locale } = useLocale();
  const ui = UI[locale];

  // Newest N recipes across all categories
  const newRecipes = useMemo(() => {
    return [...RECIPES]
      .sort((a, b) => b.added_at.localeCompare(a.added_at))
      .slice(0, NEW_RECIPES_LIMIT);
  }, []);

  // Recipes grouped by category, preserving CATEGORY_IDS order
  const byCategory = useMemo(() => {
    const map = new Map<CategoryId, typeof RECIPES>();
    for (const id of CATEGORY_IDS) map.set(id, []);
    for (const recipe of RECIPES) {
      if ((CATEGORY_IDS as readonly string[]).includes(recipe.category)) {
        map.get(recipe.category as CategoryId)!.push(recipe);
      }
    }
    // Sort within each category: newest first
    for (const [, list] of map) {
      list.sort((a, b) => b.added_at.localeCompare(a.added_at));
    }
    return map;
  }, []);

  return (
    <main className="min-h-screen bg-white pb-12">
      <header className="sticky top-0 z-10 border-b border-stone-200 bg-white/90 backdrop-blur">
        <div className="flex items-center justify-between px-5 py-4">
          <h1 className="text-lg font-medium">{ui.recipes}</h1>
          <div className="flex items-center gap-1">
            <ShoppingListIndicator />
            <LocaleButton />
          </div>
        </div>
      </header>

      <RecipeSection title={ui.newRecipes} recipes={newRecipes} />

      {CATEGORY_IDS.map((id) => {
        const recipes = byCategory.get(id) ?? [];
        if (recipes.length === 0) return null;
        return (
          <RecipeSection
            key={id}
            title={categoryName(id, locale)}
            recipes={recipes}
          />
        );
      })}
    </main>
  );
}
