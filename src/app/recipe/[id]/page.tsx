"use client";

import { use } from "react";
import Link from "next/link";
import { notFound } from "next/navigation";
import { getIngredient, getRecipe } from "@/lib/data";
import { useLocale } from "@/lib/locale-context";
import {
  recipeTitle,
  recipeDescription,
  stepTitle,
  stepText,
  LOCALE_DISPLAY_NAME,
} from "@/lib/types";
import { UI } from "@/lib/ui-strings";
import { formatIngredient } from "@/lib/format";
import { unsplashImageUrl, unsplashUserPageUrl } from "@/lib/unsplash";
import { NutritionPanel } from "@/components/NutritionPanel";

// Deterministic pastel color per recipe ID, used when there is no hero image.
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

  if (!recipe) return notFound();

  const groups: { group: string | undefined; usages: typeof recipe.ingredients }[] = [];
  for (const usage of recipe.ingredients) {
    const existing = groups.find((g) => g.group === usage.group);
    if (existing) existing.usages.push(usage);
    else groups.push({ group: usage.group, usages: [usage] });
  }

  const showAuthorshipLabel = recipe.locale_of_authorship !== locale;
  const hero = recipe.hero_image;

  return (
    <main className="min-h-screen bg-white pb-12">
      <header className="sticky top-0 z-10 flex items-center gap-3 border-b border-stone-200 bg-white/90 px-5 py-4 backdrop-blur">
        <Link href="/" className="text-stone-600 active:text-stone-900" aria-label="Back">
          ←
        </Link>
        <h1 className="truncate text-base font-medium">{recipeTitle(recipe, locale)}</h1>
      </header>

      {/* Hero image or colored fallback */}
      {hero ? (
        <div className="relative h-56 w-full overflow-hidden bg-stone-100">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={unsplashImageUrl(hero.unsplash_id, { width: 1200, height: 600 })}
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

      <div className="px-5 pt-4">
        {showAuthorshipLabel && (
          <p className="mb-1 text-[11px] font-medium uppercase tracking-wider text-stone-500">
            {ui.writtenIn} {LOCALE_DISPLAY_NAME[recipe.locale_of_authorship].toLowerCase()}
          </p>
        )}
        <h2 className="text-xl font-medium">{recipeTitle(recipe, locale)}</h2>
        <p className="mt-2 text-sm text-stone-600">{recipeDescription(recipe, locale)}</p>

        {/* Timings */}
        <div className="mt-4 flex gap-2">
          <TimingPill label={ui.prep} value={`${recipe.time_prep_minutes} min`} />
          {recipe.time_rest_minutes > 0 && (
            <TimingPill label={ui.rest} value={`${recipe.time_rest_minutes} min`} />
          )}
          <TimingPill label={ui.cook} value={`${recipe.time_cook_minutes} min`} />
        </div>

        {/* Ingredients */}
        <section className="mt-6">
          <h3 className="mb-3 text-base font-medium">{ui.ingredients}</h3>
          {groups.map(({ group, usages }, idx) => (
            <div key={group ?? `g-${idx}`} className={idx === 0 ? "" : "mt-4"}>
              {group && (
                <p className="mb-1 text-sm font-medium text-stone-600">
                  {ui.groupName(group)}
                </p>
              )}
              <ul>
                {usages.map((usage) => {
                  const ing = getIngredient(usage.ingredient_id);
                  return (
                    <li
                      key={`${group}-${usage.ingredient_id}-${usage.amount}`}
                      className="flex justify-between border-b border-stone-100 py-1.5 text-sm"
                    >
                      {ing ? (
                        <span>{formatIngredient(usage, ing, locale)}</span>
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

        {/* Steps */}
        <section className="mt-8">
          <h3 className="mb-3 text-base font-medium">{ui.instructions}</h3>
          <ol className="flex flex-col gap-5">
            {recipe.steps.map((step) => (
              <li key={step.order}>
                <div className="flex gap-2">
                  <span className="text-sm font-medium text-stone-500">{step.order}.</span>
                  <span className="text-sm font-medium">{stepTitle(step, locale)}</span>
                </div>
                <p className="ml-5 mt-1 text-sm leading-relaxed text-stone-700">
                  {stepText(step, locale)}
                </p>
              </li>
            ))}
          </ol>
        </section>

        {/* Nutrition */}
        <NutritionPanel recipe={recipe} />
      </div>
    </main>
  );
}

function TimingPill({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex flex-1 flex-col items-center rounded-md bg-stone-100 py-2">
      <span className="text-[11px] text-stone-500">{label}</span>
      <span className="text-sm font-medium">{value}</span>
    </div>
  );
}
