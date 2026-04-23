"use client";

import Link from "next/link";
import { useLocale } from "@/lib/locale-context";
import { unsplashImageUrl } from "@/lib/unsplash";
import { recipeTitle, type Recipe } from "@/lib/types";

// Deterministic pastel color fallback when a recipe has no hero image.
function tileColor(id: string): string {
  const palette = ["#FAC775", "#C0DD97", "#F5C4B3", "#B5D4F4"];
  let hash = 0;
  for (let i = 0; i < id.length; i++) hash = (hash * 31 + id.charCodeAt(i)) | 0;
  return palette[Math.abs(hash) % palette.length];
}

function RecipeCard({ recipe }: { recipe: Recipe }) {
  const { locale } = useLocale();
  return (
    <Link
      href={`/recipe/${recipe.id}`}
      className="flex w-[160px] flex-shrink-0 snap-start flex-col sm:w-[200px]"
    >
      <div className="relative aspect-square overflow-hidden rounded-t-sm bg-stone-100">
        {recipe.hero_image ? (
          /* eslint-disable-next-line @next/next/no-img-element */
          <img
            src={unsplashImageUrl(recipe.hero_image.unsplash_id, { width: 400, height: 400 })}
            alt={recipe.hero_image.alt}
            className="h-full w-full object-cover"
            loading="lazy"
          />
        ) : (
          <div className="h-full w-full" style={{ backgroundColor: tileColor(recipe.id) }} />
        )}
      </div>
      <div className="flex min-h-[48px] items-center justify-center border border-t-0 border-stone-200 bg-stone-50 px-2 py-2">
        <p className="line-clamp-2 text-center text-[10.5px] font-medium uppercase tracking-[0.08em] text-stone-700">
          {recipeTitle(recipe, locale)}
        </p>
      </div>
    </Link>
  );
}

export function RecipeSection({
  title,
  recipes,
}: {
  title: string;
  recipes: Recipe[];
}) {
  if (recipes.length === 0) return null;

  return (
    <section className="mt-10 first:mt-6">
      <div className="flex items-center gap-3 px-5">
        <div className="h-px flex-1 bg-stone-300" />
        <h2 className="text-[11px] font-semibold uppercase tracking-[0.15em] text-stone-600">
          {title}
        </h2>
        <div className="h-px flex-1 bg-stone-300" />
      </div>
      <div className="mt-4 flex snap-x gap-3 overflow-x-auto scroll-px-5 px-5 pb-4 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
        {recipes.map((recipe) => (
          <RecipeCard key={recipe.id} recipe={recipe} />
        ))}
      </div>
    </section>
  );
}
