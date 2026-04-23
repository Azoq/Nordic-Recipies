import type { AppLocale } from "./types";

/**
 * Canonical category IDs. A recipe has exactly one.
 * Order here is the display order in filter chips.
 */
export const CATEGORY_IDS = [
  "breakfast",
  "bread_bakery",
  "family_meal",
  "dinner",
  "sweet",
  "party",
] as const;

export type CategoryId = typeof CATEGORY_IDS[number];

export const CATEGORY_NAMES: Record<CategoryId, Record<AppLocale, string>> = {
  breakfast: {
    sv: "Frukost & brunch",
    no: "Frokost & brunsj",
    da: "Morgenmad & brunch",
    en: "Breakfast & brunch",
  },
  bread_bakery: {
    sv: "Bröd & bak",
    no: "Brød & bakst",
    da: "Brød & bagværk",
    en: "Bread & bakery",
  },
  family_meal: {
    sv: "Familjemat",
    no: "Familiemat",
    da: "Familiemad",
    en: "Family meals",
  },
  dinner: {
    sv: "Middag",
    no: "Middag",
    da: "Aftensmad",
    en: "Dinner",
  },
  sweet: {
    sv: "Sötsaker",
    no: "Søtsaker",
    da: "Søde sager",
    en: "Sweet stuff",
  },
  party: {
    sv: "Fest",
    no: "Fest",
    da: "Fest",
    en: "Party",
  },
};

export function categoryName(id: CategoryId, locale: AppLocale): string {
  return CATEGORY_NAMES[id][locale];
}
