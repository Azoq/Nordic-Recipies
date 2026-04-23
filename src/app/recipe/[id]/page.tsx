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

type GroupedUsages = { group: string | undefined; usages: ReturnType<typeof getRecipe> extends infer R ? R extends { ingredients: infer U } ? U : never : never }[];

export default function RecipeDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const recipe = getRecipe(id);
  const { locale } = useLocale();
  const ui = UI[locale];

  if (!recipe) return notFound();

  // Group ingredients, preserving first-seen order
  const groups: { group: string | undefined; usages: typeof recipe.ingredients }[] = [];
  for (const usage of recipe.ingredients) {
    const existing = groups.find((g) => g.group === usage.group);
    if (existing) existing.usages.push(usage);
    else groups.push({ group: usage.group, usages: [usage] });
  }

  const showAuthorshipLabel = recipe.locale_of_authorship !== locale;

  return (
    <main className="min-h-screen bg-white pb-12">
      <header className="sticky top-0 z-10 flex items-center gap-3 border-b border-stone-200 bg-white/90 px-5 py-4 backdrop-blur">
        <Link href="/" className="text-stone-600 active:text-stone-900" aria-label="Back">
          ←
        </Link>
        <h1 className="truncate text-base font-medium">{recipeTitle(recipe, locale)}</h1>
      </header>

      {/* Hero placeholder */}
      <div className="h-40 w-full" style={{ backgroundColor: "#FAC775" }} />

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
