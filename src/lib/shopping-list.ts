"use client";

import { createContext, createElement, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from "react";
import type { AppLocale, Ingredient, Recipe } from "./types";
import { getIngredient, RECIPES } from "./data";

const ITEMS_KEY = "nordic-recipes-shopping-items-v2";
const LEGACY_RECIPES_KEY = "nordic-recipes-shopping-recipes";
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

export type ShoppingInput = {
  recipe: Recipe;
  servings: number; // target servings (may differ from recipe.servings)
};

export function aggregateShoppingList(inputs: ShoppingInput[]): AggregatedLine[] {
  const map = new Map<
    string,
    { ingredient: Ingredient; canonicalUnit: string; amount: number; recipeIds: Set<string> }
  >();

  for (const { recipe, servings } of inputs) {
    const factor = Math.max(servings, 1) / Math.max(recipe.servings, 1);
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
      entry.amount += usage.amount * factor;
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

export type ShoppingItem = {
  recipeId: string;
  servings: number;
};

type ShoppingListContextValue = {
  items: ShoppingItem[];
  recipeIds: string[]; // derived — kept for the header indicator count
  hasRecipe: (id: string) => boolean;
  getServings: (id: string) => number | undefined;
  addRecipe: (id: string) => void;
  removeRecipe: (id: string) => void;
  toggleRecipe: (id: string) => void;
  setServings: (id: string, servings: number) => void;
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

function loadItems(): ShoppingItem[] {
  const validIds = new Set(RECIPES.map((r) => r.id));

  // Preferred: new format
  try {
    const raw = localStorage.getItem(ITEMS_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed)) {
        return parsed
          .filter(
            (x): x is ShoppingItem =>
              x &&
              typeof x === "object" &&
              typeof x.recipeId === "string" &&
              typeof x.servings === "number" &&
              Number.isFinite(x.servings) &&
              x.servings > 0 &&
              validIds.has(x.recipeId)
          )
          .map((x) => ({ recipeId: x.recipeId, servings: Math.max(1, Math.round(x.servings)) }));
      }
    }
  } catch {
    // fall through to legacy
  }

  // Legacy: array of recipe IDs; seed target servings from each recipe's default
  const legacy = readStringArray(LEGACY_RECIPES_KEY);
  return legacy
    .filter((id) => validIds.has(id))
    .map((id) => {
      const recipe = RECIPES.find((r) => r.id === id);
      return { recipeId: id, servings: recipe?.servings ?? 1 };
    });
}

export function ShoppingListProvider({ children }: { children: ReactNode }) {
  const [items, setItems] = useState<ShoppingItem[]>([]);
  const [checked, setChecked] = useState<Set<string>>(new Set());
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    setItems(loadItems());
    setChecked(new Set(readStringArray(CHECKED_KEY)));
    setHydrated(true);
  }, []);

  useEffect(() => {
    if (!hydrated) return;
    localStorage.setItem(ITEMS_KEY, JSON.stringify(items));
    // Remove legacy key once we've written the new format at least once
    localStorage.removeItem(LEGACY_RECIPES_KEY);
  }, [items, hydrated]);

  useEffect(() => {
    if (!hydrated) return;
    localStorage.setItem(CHECKED_KEY, JSON.stringify(Array.from(checked)));
  }, [checked, hydrated]);

  const recipeIds = useMemo(() => items.map((i) => i.recipeId), [items]);

  const hasRecipe = useCallback(
    (id: string) => items.some((i) => i.recipeId === id),
    [items]
  );

  const getServings = useCallback(
    (id: string) => items.find((i) => i.recipeId === id)?.servings,
    [items]
  );

  const addRecipe = useCallback((id: string) => {
    setItems((prev) => {
      if (prev.some((i) => i.recipeId === id)) return prev;
      const recipe = RECIPES.find((r) => r.id === id);
      return [...prev, { recipeId: id, servings: recipe?.servings ?? 1 }];
    });
  }, []);

  const removeRecipe = useCallback((id: string) => {
    setItems((prev) => prev.filter((i) => i.recipeId !== id));
  }, []);

  const toggleRecipe = useCallback((id: string) => {
    setItems((prev) => {
      if (prev.some((i) => i.recipeId === id)) {
        return prev.filter((i) => i.recipeId !== id);
      }
      const recipe = RECIPES.find((r) => r.id === id);
      return [...prev, { recipeId: id, servings: recipe?.servings ?? 1 }];
    });
  }, []);

  const setServings = useCallback((id: string, servings: number) => {
    const clamped = Math.max(1, Math.round(servings));
    setItems((prev) =>
      prev.map((i) => (i.recipeId === id ? { ...i, servings: clamped } : i))
    );
  }, []);

  const clearRecipes = useCallback(() => {
    setItems([]);
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
      items,
      recipeIds,
      hasRecipe,
      getServings,
      addRecipe,
      removeRecipe,
      toggleRecipe,
      setServings,
      clearRecipes,
      checked,
      isChecked,
      toggleChecked,
      clearChecked,
    }),
    [
      items,
      recipeIds,
      hasRecipe,
      getServings,
      addRecipe,
      removeRecipe,
      toggleRecipe,
      setServings,
      clearRecipes,
      checked,
      isChecked,
      toggleChecked,
      clearChecked,
    ]
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
