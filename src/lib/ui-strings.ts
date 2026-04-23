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
  totalTime: string;
  activeTime: string;
  serves: string;
  writtenIn: string;
  language: string;
  volumeUnits: string;
  minutesShort: string;
  hoursShort: string;
  sortLatest: string;
  sortAlphabetical: string;
  noResults: string;
  nutrition: string;
  nutritionPer100g: string;
  nutritionPerServing: string;
  kcal: string;
  protein: string;
  fat: string;
  carbs: string;
  fiber: string;
  salt: string;
  nutritionIncomplete: string;
  photoBy: string;
  onUnsplash: string;
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
    totalTime: "Tid totalt",
    activeTime: "Aktiv tid",
    serves: "Antal",
    writtenIn: "Skrivet på",
    language: "Språk",
    volumeUnits: "Volymmått",
    minutesShort: "min",
    hoursShort: "tim",
    sortLatest: "Senast tillagda",
    sortAlphabetical: "A–Ö",
    noResults: "Inga recept i den här kategorin än.",
    nutrition: "Näringsvärde",
    nutritionPer100g: "Per 100 g",
    nutritionPerServing: "Per portion",
    kcal: "Energi",
    protein: "Protein",
    fat: "Fett",
    carbs: "Kolhydrater",
    fiber: "Fibrer",
    salt: "Salt",
    nutritionIncomplete: "Ungefärliga värden — vissa ingredienser saknar näringsdata.",
    photoBy: "Foto av",
    onUnsplash: "på Unsplash",
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
    totalTime: "Tid totalt",
    activeTime: "Aktiv tid",
    serves: "Antall",
    writtenIn: "Skrevet på",
    language: "Språk",
    volumeUnits: "Volummål",
    minutesShort: "min",
    hoursShort: "t",
    sortLatest: "Sist lagt til",
    sortAlphabetical: "A–Å",
    noResults: "Ingen oppskrifter i denne kategorien ennå.",
    nutrition: "Næringsinnhold",
    nutritionPer100g: "Per 100 g",
    nutritionPerServing: "Per porsjon",
    kcal: "Energi",
    protein: "Protein",
    fat: "Fett",
    carbs: "Karbohydrater",
    fiber: "Fiber",
    salt: "Salt",
    nutritionIncomplete: "Omtrentlige verdier — noen ingredienser mangler næringsdata.",
    photoBy: "Foto av",
    onUnsplash: "på Unsplash",
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
    totalTime: "Tid i alt",
    activeTime: "Arbejdstid",
    serves: "Antal",
    writtenIn: "Skrevet på",
    language: "Sprog",
    volumeUnits: "Volumenmål",
    minutesShort: "min",
    hoursShort: "t",
    sortLatest: "Senest tilføjet",
    sortAlphabetical: "A–Å",
    noResults: "Ingen opskrifter i denne kategori endnu.",
    nutrition: "Næringsindhold",
    nutritionPer100g: "Per 100 g",
    nutritionPerServing: "Per portion",
    kcal: "Energi",
    protein: "Protein",
    fat: "Fedt",
    carbs: "Kulhydrater",
    fiber: "Fibre",
    salt: "Salt",
    nutritionIncomplete: "Omtrentlige værdier — nogle ingredienser mangler næringsdata.",
    photoBy: "Foto af",
    onUnsplash: "på Unsplash",
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
    totalTime: "Total time",
    activeTime: "Active time",
    serves: "Serves",
    writtenIn: "Originally written in",
    language: "Language",
    volumeUnits: "Volume units",
    minutesShort: "min",
    hoursShort: "h",
    sortLatest: "Recently added",
    sortAlphabetical: "A–Z",
    noResults: "No recipes in this category yet.",
    nutrition: "Nutrition",
    nutritionPer100g: "Per 100 g",
    nutritionPerServing: "Per serving",
    kcal: "Energy",
    protein: "Protein",
    fat: "Fat",
    carbs: "Carbs",
    fiber: "Fibre",
    salt: "Salt",
    nutritionIncomplete: "Approximate values — some ingredients lack nutrition data.",
    photoBy: "Photo by",
    onUnsplash: "on Unsplash",
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
