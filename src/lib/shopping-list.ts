"use client";

import { createContext, createElement, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from "react";
import type { AppLocale, Ingredient, IngredientUsage, Recipe } from "./types";
import { getIngredient, RECIPES } from "./data";

const RECIPES_KEY = "nordic-recipes-shopping-recipes";
const CHECKED_KEY = "nordic-recipes-shopping-checked";

// Canonicalize units so msk/ss/spsk/tbsp aggregate into one line,
// and st/stk/whole/pieces are treated as the same "count".
const UNIT_ALIASES: Record<string, string> = {
  ml: "ml",
  dl: "dl",
  l: "l",
  tsk: "tsk", ts: "tsk", tsp: "tsk",
  msk: "msk", ss: "msk", spsk: "msk", tbsp: "msk",
  krm: "krm", knsp: "krm", pinch: "krm",
  g: "g",
  kg: "kg",
  st: "count", stk: "count", whole: "count", pieces: "count",
  cup: "cup",
  lb: "lb",
};

function canonicalUnit(unit: string): string {
  const key = unit.trim().toLowerCase();
  return UNIT_ALIASES[key] ?? key;
}

const COUNT_UNIT_BY_LOCALE: Record<AppLocale, string> = {
  sv: "st",
  no: "stk",
  da: "stk",
  en: "",
};

const VOLUME_SPOON_BY_LOCALE: Record<string, Record<AppLocale, string>> = {
  tsk: { sv: "tsk", no: "ts", da: "tsk", en: "tsp" },
  msk: { sv: "msk", no: "ss", da: "spsk", en: "tbsp" },
  krm: { sv: "krm", no: "krm", da: "knsp", en: "pinch" },
};

export function displayUnitForLocale(canonical: string, locale: AppLocale): string {
  if (canonical === "count") return COUNT_UNIT_BY_LOCALE[locale];
  if (canonical in VOLUME_SPOON_BY_LOCALE) return VOLUME_SPOON_BY_LOCALE[canonical][locale];
  return canonical; // g, kg, dl, l, ml, cup, lb
}

function formatAmount(n: number): string {
  // Common fraction rendering for readable small amounts
  if (Math.abs(n - Math.round(n)) < 0.01) return String(Math.round(n));
  const whole = Math.floor(n);
  const frac = n - whole;
  const fractions: [number, string][] = [
    [0.25, "¼"], [0.33, "⅓"], [0.5, "½"], [0.67, "⅔"], [0.75, "¾"],
  ];
  for (const [value, glyph] of fractions) {
    if (Math.abs(frac - value) < 0.02) {
      return whole === 0 ? glyph : `${whole}${glyph}`;
    }
  }
  return n.toFixed(1).replace(/\.0$/, "");
}

export type AggregatedLine = {
  key: string; // ingredient_id + canonical unit, used for checked-off state
  ingredient: Ingredient;
  amount: number;
  canonicalUnit: string;
  recipeIds: string[];
};

export function aggregateShoppingList(recipes: Recipe[]): AggregatedLine[] {
  // key = ingredient_id::canonical_unit
  const map = new Map<
    string,
    { ingredient: Ingredient; canonicalUnit: string; amount: number; recipeIds: Set<string> }
  >();

  for (const recipe of recipes) {
    for (const usage of recipe.ingredients) {
      const ingredient = getIngredient(usage.ingredient_id);
      if (!ingredient) continue;
      const canonical = canonicalUnit(usage.unit);
      const key = `${ingredient.id}::${canonical}`;
      const entry = map.get(key) ?? {
        ingredient,
        canonicalUnit: canonical,
        amount: 0,
        recipeIds: new Set<string>(),
      };
      entry.amount += usage.amount;
      entry.recipeIds.add(recipe.id);
      map.set(key, entry);
    }
  }

  const lines: AggregatedLine[] = [];
  for (const [key, entry] of map) {
    lines.push({
      key,
      ingredient: entry.ingredient,
      amount: entry.amount,
      canonicalUnit: entry.canonicalUnit,
      recipeIds: Array.from(entry.recipeIds),
    });
  }
  return lines;
}

export function formatShoppingLine(line: AggregatedLine, locale: AppLocale): string {
  const name = line.ingredient.names[locale] ?? line.ingredient.names.en ?? line.ingredient.id;
  const unit = displayUnitForLocale(line.canonicalUnit, locale);
  const amount = formatAmount(line.amount);
  return unit ? `${amount} ${unit} ${name}` : `${amount} ${name}`;
}

// Context

type ShoppingListContextValue = {
  recipeIds: string[];
  hasRecipe: (id: string) => boolean;
  addRecipe: (id: string) => void;
  removeRecipe: (id: string) => void;
  toggleRecipe: (id: string) => void;
  clearRecipes: () => void;
  checked: Set<string>;
  isChecked: (key: string) => boolean;
  toggleChecked: (key: string) => void;
  clearChecked: () => void;
};

const ShoppingListContext = createContext<ShoppingListContextValue | null>(null);

function readStringArray(key: string): string[] {
  try {
    const raw = localStorage.getItem(key);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed.filter((x) => typeof x === "string") : [];
  } catch {
    return [];
  }
}

export function ShoppingListProvider({ children }: { children: ReactNode }) {
  const [recipeIds, setRecipeIds] = useState<string[]>([]);
  const [checked, setChecked] = useState<Set<string>>(new Set());
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    const storedRecipes = readStringArray(RECIPES_KEY);
    // Drop any IDs that no longer exist in the recipe dataset
    const validIds = new Set(RECIPES.map((r) => r.id));
    setRecipeIds(storedRecipes.filter((id) => validIds.has(id)));
    setChecked(new Set(readStringArray(CHECKED_KEY)));
    setHydrated(true);
  }, []);

  useEffect(() => {
    if (!hydrated) return;
    localStorage.setItem(RECIPES_KEY, JSON.stringify(recipeIds));
  }, [recipeIds, hydrated]);

  useEffect(() => {
    if (!hydrated) return;
    localStorage.setItem(CHECKED_KEY, JSON.stringify(Array.from(checked)));
  }, [checked, hydrated]);

  const hasRecipe = useCallback((id: string) => recipeIds.includes(id), [recipeIds]);

  const addRecipe = useCallback((id: string) => {
    setRecipeIds((prev) => (prev.includes(id) ? prev : [...prev, id]));
  }, []);

  const removeRecipe = useCallback((id: string) => {
    setRecipeIds((prev) => prev.filter((r) => r !== id));
  }, []);

  const toggleRecipe = useCallback((id: string) => {
    setRecipeIds((prev) => (prev.includes(id) ? prev.filter((r) => r !== id) : [...prev, id]));
  }, []);

  const clearRecipes = useCallback(() => {
    setRecipeIds([]);
    setChecked(new Set());
  }, []);

  const isChecked = useCallback((key: string) => checked.has(key), [checked]);

  const toggleChecked = useCallback((key: string) => {
    setChecked((prev) => {
      const next = new Set(prev);
      if (next.has(key)) next.delete(key);
      else next.add(key);
      return next;
    });
  }, []);

  const clearChecked = useCallback(() => {
    setChecked(new Set());
  }, []);

  const value = useMemo<ShoppingListContextValue>(
    () => ({
      recipeIds,
      hasRecipe,
      addRecipe,
      removeRecipe,
      toggleRecipe,
      clearRecipes,
      checked,
      isChecked,
      toggleChecked,
      clearChecked,
    }),
    [recipeIds, hasRecipe, addRecipe, removeRecipe, toggleRecipe, clearRecipes, checked, isChecked, toggleChecked, clearChecked]
  );

  return createElement(ShoppingListContext.Provider, { value }, children);
}

export function useShoppingList(): ShoppingListContextValue {
  const ctx = useContext(ShoppingListContext);
  if (!ctx) throw new Error("useShoppingList must be used inside ShoppingListProvider");
  return ctx;
}

// Category order for shopping-list display — matches walking through a shop.
export const INGREDIENT_CATEGORY_ORDER = [
  "vegetable",
  "meat",
  "dairy",
  "flour",
  "sugar",
  "spice",
  "seasoning",
  "leavening",
  "pantry",
  "fat",
];

export function categorySortKey(cat: string): number {
  const idx = INGREDIENT_CATEGORY_ORDER.indexOf(cat);
  return idx === -1 ? INGREDIENT_CATEGORY_ORDER.length : idx;
}
