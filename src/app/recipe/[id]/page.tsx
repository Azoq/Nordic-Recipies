"use client";

import { use, useState } from "react";
import Link from "next/link";
import { notFound } from "next/navigation";
import { getIngredient, getRecipe } from "@/lib/data";
import { useLocale } from "@/lib/locale-context";
import {
  recipeTitle,
  recipeDescription,
  stepTitle,
  stepText,
  totalMinutes,
  LOCALE_DISPLAY_NAME,
} from "@/lib/types";
import { UI, formatTime } from "@/lib/ui-strings";
import { formatIngredient } from "@/lib/format";
import { unsplashImageUrl, unsplashUserPageUrl } from "@/lib/unsplash";
import { NutritionPanel } from "@/components/NutritionPanel";
import { ShoppingListToggle } from "@/components/ShoppingListToggle";
import { ServingScaler } from "@/components/ServingScaler";
import { useShoppingList } from "@/lib/shopping-list";

function tileColor(id: string): string {
  const palette = ["#FAC775", "#C0DD97", "#F5C4B3", "#B5D4F4"];
  let hash = 0;
  for (let i = 0; i < id.length; i++) hash = (hash * 31 + id.charCodeAt(i)) | 0;
  return palette[Math.abs(hash) % palette.length];
}

export default function RecipeDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const recipe = getRecipe(id);
  const { locale } = useLocale();
  const ui = UI[locale];
  const { hasRecipe, getServings, setServings } = useShoppingList();

  // Local scaler state for when the recipe is NOT in the shopping list.
  // When it IS in the list, the list's stored value is the source of truth
  // so scaling stays in sync across detail view and list view.
  const [localServings, setLocalServings] = useState<number | null>(null);

  if (!recipe) return notFound();

  const inList = hasRecipe(recipe.id);
  const currentServings = inList
    ? getServings(recipe.id) ?? recipe.servings
    : localServings ?? recipe.servings;

  const handleServingsChange = (n: number) => {
    if (inList) setServings(recipe.id, n);
    else setLocalServings(n);
  };

  const factor = currentServings / recipe.servings;

  const groups: { group: string | undefined; usages: typeof recipe.ingredients }[] = [];
  for (const usage of recipe.ingredients) {
    const existing = groups.find((g) => g.group === usage.group);
    if (existing) existing.usages.push(usage);
    else groups.push({ group: usage.group, usages: [usage] });
  }

  const showAuthorshipLabel = recipe.locale_of_authorship !== locale;
  const hero = recipe.hero_image;
  const totalMin = totalMinutes(recipe);
  const activeMin = recipe.time_prep_minutes + recipe.time_cook_minutes;

  return (
    <main className="min-h-screen bg-stone-50 pb-12">
      <header className="sticky top-0 z-10 flex items-center gap-3 border-b border-stone-200 bg-white/90 px-5 py-4 backdrop-blur">
        <Link href="/" className="text-stone-600 active:text-stone-900" aria-label="Back">
          ←
        </Link>
        <h1 className="truncate text-base font-medium">{recipeTitle(recipe, locale)}</h1>
      </header>

      {hero ? (
        <div className="relative h-56 w-full overflow-hidden bg-stone-100 sm:h-80">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={unsplashImageUrl(hero.unsplash_id, { width: 1600, height: 800 })}
            alt={hero.alt}
            className="h-full w-full object-cover"
            loading="eager"
          />
          <div className="absolute bottom-2 right-2 rounded bg-black/40 px-2 py-1 text-[10px] text-white backdrop-blur-sm">
            {ui.photoBy}{" "}
            <a
              href={unsplashUserPageUrl(hero.photographer_url)}
              target="_blank"
              rel="noopener noreferrer"
              className="underline"
            >
              {hero.photographer}
            </a>{" "}
            {ui.onUnsplash}
          </div>
        </div>
      ) : (
        <div className="h-40 w-full" style={{ backgroundColor: tileColor(recipe.id) }} />
      )}

      <article className="mx-auto -mt-6 max-w-4xl rounded-t-3xl bg-[#fbeae5] px-5 pb-10 pt-8 shadow-sm sm:px-10 sm:pt-10">
        {showAuthorshipLabel && (
          <p className="mb-2 text-center text-[11px] font-medium uppercase tracking-wider text-stone-500">
            {ui.writtenIn} {LOCALE_DISPLAY_NAME[recipe.locale_of_authorship].toLowerCase()}
          </p>
        )}

        <h2 className="text-center text-2xl font-semibold text-stone-800 sm:text-3xl">
          {recipeTitle(recipe, locale)}
        </h2>

        <p className="mx-auto mt-4 max-w-2xl text-center text-[15px] leading-relaxed text-stone-700">
          {recipeDescription(recipe, locale)}
        </p>

        {recipe.source && (
          <p className="mt-3 text-center text-[11px] italic text-stone-500">
            {ui.source}: {recipe.source}
          </p>
        )}

        <div className="mt-6 flex flex-wrap items-center justify-center gap-x-6 gap-y-1 text-sm text-stone-700">
          <MetaItem label={ui.totalTime} value={formatTime(totalMin, locale)} />
          <MetaItem label={ui.activeTime} value={formatTime(activeMin, locale)} />
          <MetaItem
            label={ui.serves}
            value={`${currentServings} ${ui.servingsUnit(recipe.servings_unit, currentServings)}`}
          />
        </div>

        <div className="mt-4">
          <ServingScaler
            recipe={recipe}
            value={currentServings}
            onChange={handleServingsChange}
          />
        </div>

        <div className="mx-auto mt-6 max-w-sm">
          <ShoppingListToggle recipeId={recipe.id} servings={currentServings} />
        </div>

        <div className="mt-10 grid gap-10 md:grid-cols-[2fr_3fr]">
          <section>
            <h3 className="mb-4 border-b border-stone-300/70 pb-2 text-lg font-semibold text-stone-800">
              {ui.ingredients}
            </h3>
            {groups.map(({ group, usages }, idx) => (
              <div key={group ?? `g-${idx}`} className={idx === 0 ? "" : "mt-5"}>
                {group && (
                  <p className="mb-2 text-[15px] font-semibold text-stone-800">
                    {ui.groupName(group)}
                  </p>
                )}
                <ul className="flex flex-col gap-1.5">
                  {usages.map((usage) => {
                    const ing = getIngredient(usage.ingredient_id);
                    const scaledUsage = { ...usage, amount: usage.amount * factor };
                    return (
                      <li
                        key={`${group}-${usage.ingredient_id}-${usage.amount}`}
                        className="text-[15px] leading-relaxed text-stone-700"
                      >
                        {ing ? (
                          formatIngredient(scaledUsage, ing, locale)
                        ) : (
                          <span className="text-red-600">
                            ⚠ missing: {usage.ingredient_id}
                          </span>
                        )}
                      </li>
                    );
                  })}
                </ul>
              </div>
            ))}
          </section>

          <section>
            <h3 className="mb-4 border-b border-stone-300/70 pb-2 text-lg font-semibold text-stone-800">
              {ui.instructions}
            </h3>
            <div className="flex flex-col gap-4">
              {recipe.steps.map((step) => {
                const title = stepTitle(step, locale);
                const text = stepText(step, locale);
                return (
                  <p
                    key={step.order}
                    className="text-[15px] leading-relaxed text-stone-700"
                  >
                    {title && (
                      <span className="font-semibold text-stone-800">{title}. </span>
                    )}
                    {text}
                  </p>
                );
              })}
            </div>
          </section>
        </div>

        <NutritionPanel recipe={recipe} />
      </article>
    </main>
  );
}

function MetaItem({ label, value }: { label: string; value: string }) {
  return (
    <span className="whitespace-nowrap">
      <span className="text-stone-500">{label} </span>
      <span className="font-semibold text-stone-800">{value}</span>
    </span>
  );
}
