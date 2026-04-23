// Locale

export type AppLocale = "sv" | "no" | "da" | "en";

export const ALL_LOCALES: AppLocale[] = ["sv", "no", "da", "en"];

export const LOCALE_DISPLAY_NAME: Record<AppLocale, string> = {
  sv: "Svenska",
  no: "Norsk (bokmål)",
  da: "Dansk",
  en: "English",
};

// Ingredient

export type NutritionPer100g = {
  kcal: number;
  protein_g: number;
  fat_g: number;
  carbs_g: number;
  fiber_g?: number;
  salt_g?: number;
};

export type Ingredient = {
  id: string;
  category: string;
  names: Partial<Record<AppLocale, string>>;
  density_g_per_ml?: number;
  default_unit_by_locale?: Partial<Record<AppLocale, string>>;
  fat_percentage?: number;
  substitutions?: string[];
  notes?: Partial<Record<AppLocale, string>>;
  nutrition_per_100g?: NutritionPer100g;
};

export function ingredientName(ing: Ingredient, locale: AppLocale): string {
  return ing.names[locale] ?? ing.names.en ?? ing.id;
}

// Recipe

export type Oven = {
  type: string;
  temp_c: number;
  fan_temp_c?: number;
};

export type IngredientUsage = {
  ingredient_id: string;
  amount: number;
  unit: string;
  group?: string;
  note_locale?: Partial<Record<AppLocale, string>>;
};

export type Step = {
  order: number;
  title: Partial<Record<AppLocale, string>>;
  text: Partial<Record<AppLocale, string>>;
  timer_seconds: number | null;
};

export type HeroImage = {
  unsplash_id: string;
  photographer: string;
  photographer_url: string;
  alt: string;
};

export type Recipe = {
  id: string;
  locale_of_authorship: AppLocale;
  category: string;                  // CategoryId — kept as string in JSON, narrowed in code
  added_at: string;                  // ISO date, used for "new" sort
  title: Partial<Record<AppLocale, string>>;
  description: Partial<Record<AppLocale, string>>;
  servings: number;
  servings_unit: string;
  time_prep_minutes: number;
  time_rest_minutes: number;
  time_cook_minutes: number;
  oven: Oven | null;
  yeast_type: string | null;
  tags: string[];
  ingredients: IngredientUsage[];
  steps: Step[];
  hero_image?: HeroImage;
  verified_by?: string;
  verified_at?: string;
};

export function recipeTitle(recipe: Recipe, locale: AppLocale): string {
  return recipe.title[locale] ?? recipe.title.en ?? recipe.id;
}

export function recipeDescription(recipe: Recipe, locale: AppLocale): string {
  return recipe.description[locale] ?? recipe.description.en ?? "";
}

export function stepTitle(step: Step, locale: AppLocale): string {
  return step.title[locale] ?? step.title.en ?? "";
}

export function stepText(step: Step, locale: AppLocale): string {
  return step.text[locale] ?? step.text.en ?? "";
}

export function totalMinutes(recipe: Recipe): number {
  return recipe.time_prep_minutes + recipe.time_rest_minutes + recipe.time_cook_minutes;
}
