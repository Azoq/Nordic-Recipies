import type { Ingredient, IngredientUsage, NutritionPer100g, Recipe } from "./types";
import { getIngredient } from "./data";

// Standard weights for unit-based ingredients (grams per one unit).
// Used when an ingredient is counted (egg, onion) rather than weighed/measured.
const UNIT_STANDARD_WEIGHT_G: Record<string, number> = {
  egg_large: 58,
  onion_yellow: 110,
  garlic_clove: 5,
  carrot: 70,
  potato: 150,
};

// Volume unit -> ml conversion. Covers all units used in the recipe dataset.
const VOLUME_UNIT_ML: Record<string, number> = {
  ml: 1,
  dl: 100,
  l: 1000,
  tsk: 5, ts: 5, tsp: 5,
  msk: 15, ss: 15, spsk: 15, tbsp: 15,
  krm: 1, knsp: 1, pinch: 1,
  cup: 240,
};

// Weight unit -> g conversion.
const WEIGHT_UNIT_G: Record<string, number> = {
  g: 1,
  kg: 1000,
  lb: 453.6,
};

// Returns grams for a given usage, or null if we can't confidently convert.
export function usageToGrams(usage: IngredientUsage, ingredient: Ingredient): number | null {
  const unit = usage.unit.toLowerCase();

  if (unit in WEIGHT_UNIT_G) {
    return usage.amount * WEIGHT_UNIT_G[unit];
  }

  if (unit in VOLUME_UNIT_ML) {
    const ml = usage.amount * VOLUME_UNIT_ML[unit];
    if (ingredient.density_g_per_ml) {
      return ml * ingredient.density_g_per_ml;
    }
    // For ingredients without density, treat ml ~ g only for water-like.
    return null;
  }

  if (unit === "st" || unit === "stk" || unit === "whole" || unit === "pieces") {
    const std = UNIT_STANDARD_WEIGHT_G[ingredient.id];
    if (std) return usage.amount * std;
    return null;
  }

  return null;
}

export type NutritionTotals = NutritionPer100g & { total_weight_g: number };

export type NutritionResult = {
  per_100g: NutritionPer100g;
  per_serving: NutritionPer100g;
  total_weight_g: number;
  coverage: number; // 0..1 — share of ingredients by weight with known nutrition
  missing_ingredients: string[];
};

// Compute nutrition for a full recipe by summing per-ingredient contributions
// and dividing by total weight. Coverage < 1 indicates some ingredients had
// no nutrition data or were not convertible to grams.
export function computeRecipeNutrition(recipe: Recipe): NutritionResult | null {
  let totalGrams = 0;
  let coveredGrams = 0;
  let kcal = 0;
  let protein = 0;
  let fat = 0;
  let carbs = 0;
  let fiber = 0;
  let salt = 0;
  const missing: string[] = [];

  for (const usage of recipe.ingredients) {
    const ingredient = getIngredient(usage.ingredient_id);
    if (!ingredient) continue;

    const grams = usageToGrams(usage, ingredient);
    if (grams == null) {
      missing.push(ingredient.id);
      continue;
    }
    totalGrams += grams;

    const nut = ingredient.nutrition_per_100g;
    if (!nut) {
      missing.push(ingredient.id);
      continue;
    }
    coveredGrams += grams;
    const ratio = grams / 100;
    kcal += nut.kcal * ratio;
    protein += nut.protein_g * ratio;
    fat += nut.fat_g * ratio;
    carbs += nut.carbs_g * ratio;
    fiber += (nut.fiber_g ?? 0) * ratio;
    salt += (nut.salt_g ?? 0) * ratio;
  }

  if (totalGrams <= 0) return null;

  const per100g: NutritionPer100g = {
    kcal: Math.round((kcal / totalGrams) * 100),
    protein_g: round1((protein / totalGrams) * 100),
    fat_g: round1((fat / totalGrams) * 100),
    carbs_g: round1((carbs / totalGrams) * 100),
    fiber_g: round1((fiber / totalGrams) * 100),
    salt_g: round2((salt / totalGrams) * 100),
  };

  const servingGrams = totalGrams / Math.max(recipe.servings, 1);
  const servingRatio = servingGrams / 100;
  const perServing: NutritionPer100g = {
    kcal: Math.round(per100g.kcal * servingRatio),
    protein_g: round1(per100g.protein_g * servingRatio),
    fat_g: round1(per100g.fat_g * servingRatio),
    carbs_g: round1(per100g.carbs_g * servingRatio),
    fiber_g: round1((per100g.fiber_g ?? 0) * servingRatio),
    salt_g: round2((per100g.salt_g ?? 0) * servingRatio),
  };

  return {
    per_100g: per100g,
    per_serving: perServing,
    total_weight_g: Math.round(totalGrams),
    coverage: totalGrams > 0 ? coveredGrams / totalGrams : 0,
    missing_ingredients: missing,
  };
}

function round1(n: number): number {
  return Math.round(n * 10) / 10;
}

function round2(n: number): number {
  return Math.round(n * 100) / 100;
}
