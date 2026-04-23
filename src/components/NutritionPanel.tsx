"use client";

import { useState } from "react";
import type { Recipe } from "@/lib/types";
import { useLocale } from "@/lib/locale-context";
import { UI } from "@/lib/ui-strings";
import { computeRecipeNutrition } from "@/lib/nutrition";

type Mode = "per_100g" | "per_serving";

export function NutritionPanel({ recipe }: { recipe: Recipe }) {
  const { locale } = useLocale();
  const ui = UI[locale];
  const [mode, setMode] = useState<Mode>("per_100g");

  const result = computeRecipeNutrition(recipe);
  if (!result) return null;

  const values = mode === "per_100g" ? result.per_100g : result.per_serving;
  const incomplete = result.coverage < 0.9;

  return (
    <section className="mt-8">
      <div className="mb-3 flex items-center justify-between">
        <h3 className="text-base font-medium">{ui.nutrition}</h3>
        <div className="flex rounded-md bg-stone-100 p-0.5 text-[11px]">
          <button
            onClick={() => setMode("per_100g")}
            className={`rounded px-2 py-1 ${
              mode === "per_100g" ? "bg-white font-medium shadow-sm" : "text-stone-600"
            }`}
          >
            {ui.nutritionPer100g}
          </button>
          <button
            onClick={() => setMode("per_serving")}
            className={`rounded px-2 py-1 ${
              mode === "per_serving" ? "bg-white font-medium shadow-sm" : "text-stone-600"
            }`}
          >
            {ui.nutritionPerServing}
          </button>
        </div>
      </div>

      <dl className="overflow-hidden rounded-lg border border-stone-200">
        <Row label={ui.kcal} value={`${values.kcal} kcal`} bold />
        <Row label={ui.protein} value={formatG(values.protein_g)} />
        <Row label={ui.fat} value={formatG(values.fat_g)} />
        <Row label={ui.carbs} value={formatG(values.carbs_g)} />
        {values.fiber_g != null && values.fiber_g > 0 && (
          <Row label={ui.fiber} value={formatG(values.fiber_g)} />
        )}
        {values.salt_g != null && values.salt_g > 0 && (
          <Row label={ui.salt} value={formatG(values.salt_g)} last />
        )}
      </dl>

      {incomplete && (
        <p className="mt-2 text-[11px] text-stone-500">{ui.nutritionIncomplete}</p>
      )}
    </section>
  );
}

function Row({
  label,
  value,
  bold,
  last,
}: {
  label: string;
  value: string;
  bold?: boolean;
  last?: boolean;
}) {
  return (
    <div
      className={`flex items-center justify-between px-4 py-2.5 text-sm ${
        last ? "" : "border-b border-stone-100"
      }`}
    >
      <dt className={bold ? "font-medium" : "text-stone-600"}>{label}</dt>
      <dd className={bold ? "font-medium" : ""}>{value}</dd>
    </div>
  );
}

function formatG(value: number): string {
  return `${value} g`;
}
