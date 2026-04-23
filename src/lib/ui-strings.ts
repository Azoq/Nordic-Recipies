import type { AppLocale } from "./types";

type UIStrings = {
  recipes: string;
  search: string;
  all: string;
  baking: string;
  fika: string;
  dinner: string;
  ingredients: string;
  instructions: string;
  prep: string;
  rest: string;
  cook: string;
  writtenIn: string;
  language: string;
  volumeUnits: string;
  minutesShort: string;
  hoursShort: string;
  sortLatest: string;
  sortAlphabetical: string;
  noResults: string;
  servingsUnit: (unit: string, count: number) => string;
  groupName: (group: string) => string;
};

export const UI: Record<AppLocale, UIStrings> = {
  sv: {
    recipes: "Recept",
    search: "Sök recept…",
    all: "Alla",
    baking: "Bak",
    fika: "Fika",
    dinner: "Middag",
    ingredients: "Ingredienser",
    instructions: "Gör så här",
    prep: "Förberedelse",
    rest: "Jäsning / vila",
    cook: "Tillagning",
    writtenIn: "Skrivet på",
    language: "Språk",
    volumeUnits: "Volymmått",
    minutesShort: "min",
    hoursShort: "tim",
    sortLatest: "Senast tillagda",
    sortAlphabetical: "A–Ö",
    noResults: "Inga recept i den här kategorin än.",
    servingsUnit: (unit) => ({ buns: "bullar", portions: "portioner", pieces: "st" }[unit] ?? unit),
    groupName: (g) => ({ dough: "Deg", filling: "Fyllning", topping: "Topping", patties: "Köttkakor", frying: "Stekning", gravy: "Sås", meat: "Färs", porridge: "Gröt", balls: "Bollar", coating: "Garnering" }[g] ?? g),
  },
  no: {
    recipes: "Oppskrifter",
    search: "Søk oppskrifter…",
    all: "Alle",
    baking: "Bakst",
    fika: "Kaffepause",
    dinner: "Middag",
    ingredients: "Ingredienser",
    instructions: "Slik gjør du",
    prep: "Forberedelse",
    rest: "Heving / hvile",
    cook: "Tilberedning",
    writtenIn: "Skrevet på",
    language: "Språk",
    volumeUnits: "Volummål",
    minutesShort: "min",
    hoursShort: "t",
    sortLatest: "Sist lagt til",
    sortAlphabetical: "A–Å",
    noResults: "Ingen oppskrifter i denne kategorien ennå.",
    servingsUnit: (unit) => ({ buns: "boller", portions: "porsjoner", pieces: "stk" }[unit] ?? unit),
    groupName: (g) => ({ dough: "Deig", filling: "Fyll", topping: "Pynt", patties: "Kjøttkaker", frying: "Steking", gravy: "Saus", meat: "Kjøttdeig", porridge: "Grøt", balls: "Kuler", coating: "Pynt" }[g] ?? g),
  },
  da: {
    recipes: "Opskrifter",
    search: "Søg opskrifter…",
    all: "Alle",
    baking: "Bagning",
    fika: "Kaffepause",
    dinner: "Aftensmad",
    ingredients: "Ingredienser",
    instructions: "Sådan gør du",
    prep: "Forberedelse",
    rest: "Hævning / hvile",
    cook: "Tilberedning",
    writtenIn: "Skrevet på",
    language: "Sprog",
    volumeUnits: "Volumenmål",
    minutesShort: "min",
    hoursShort: "t",
    sortLatest: "Senest tilføjet",
    sortAlphabetical: "A–Å",
    noResults: "Ingen opskrifter i denne kategori endnu.",
    servingsUnit: (unit) => ({ buns: "snegle", portions: "personer", pieces: "stk" }[unit] ?? unit),
    groupName: (g) => ({ dough: "Dej", filling: "Fyld", topping: "Pynt", patties: "Kødboller", frying: "Stegning", gravy: "Sovs", meat: "Fars", porridge: "Grød", balls: "Kugler", coating: "Pynt" }[g] ?? g),
  },
  en: {
    recipes: "Recipes",
    search: "Search recipes…",
    all: "All",
    baking: "Baking",
    fika: "Coffee break",
    dinner: "Dinner",
    ingredients: "Ingredients",
    instructions: "Instructions",
    prep: "Prep",
    rest: "Rest",
    cook: "Cook",
    writtenIn: "Originally written in",
    language: "Language",
    volumeUnits: "Volume units",
    minutesShort: "min",
    hoursShort: "h",
    sortLatest: "Recently added",
    sortAlphabetical: "A–Z",
    noResults: "No recipes in this category yet.",
    servingsUnit: (unit, count) => {
      if (unit === "buns") return count === 1 ? "bun" : "buns";
      if (unit === "portions") return count === 1 ? "serving" : "servings";
      if (unit === "pieces") return count === 1 ? "piece" : "pieces";
      return unit;
    },
    groupName: (g) => ({ dough: "Dough", filling: "Filling", topping: "Topping", patties: "Patties", frying: "For frying", gravy: "Gravy", meat: "Meat mixture", porridge: "Porridge", balls: "Balls", coating: "Coating" }[g] ?? g),
  },
};

export function formatTime(minutes: number, locale: AppLocale): string {
  const ui = UI[locale];
  const h = Math.floor(minutes / 60);
  const m = minutes % 60;
  if (h === 0) return `${m} ${ui.minutesShort}`;
  if (m === 0) return `${h} ${ui.hoursShort}`;
  return `${h} ${ui.hoursShort} ${m} ${ui.minutesShort}`;
}
