import type { AppLocale, Ingredient, IngredientUsage } from "./types";
import { ingredientName } from "./types";

/**
 * Renders "2½ dl vetemjöl" from a usage + ingredient + locale.
 */
export function formatIngredient(
  usage: IngredientUsage,
  ingredient: Ingredient,
  locale: AppLocale,
  servingMultiplier = 1
): string {
  const scaledAmount = usage.amount * servingMultiplier;
  const amountString = formatAmount(scaledAmount);
  const unitString = localizeUnit(usage.unit, locale);
  const name = ingredientName(ingredient, locale);

  if (unitString === "") {
    return `${amountString} ${name}`;
  }
  return `${amountString} ${unitString} ${name}`;
}

/**
 * Formats amounts using Nordic conventions: fractions for half values,
 * whole numbers where possible, decimals only when necessary.
 */
function formatAmount(amount: number): string {
  if (amount === Math.floor(amount)) {
    return String(Math.floor(amount));
  }

  const whole = Math.floor(amount);
  const fraction = amount - whole;

  let fractionString: string | null = null;
  if (Math.abs(fraction - 0.25) < 0.001) fractionString = "¼";
  else if (Math.abs(fraction - 0.5) < 0.001) fractionString = "½";
  else if (Math.abs(fraction - 0.75) < 0.001) fractionString = "¾";

  if (fractionString) {
    return whole === 0 ? fractionString : `${whole}${fractionString}`;
  }

  return amount.toFixed(1);
}

/**
 * Maps canonical unit strings to locale-specific display.
 * Canonical units in the data: g, kg, dl, ml, l, tsk, msk, krm, st
 */
function localizeUnit(unit: string, locale: AppLocale): string {
  switch (locale) {
    case "sv":
      return swedishUnit(unit);
    case "no":
      return norwegianUnit(unit);
    case "da":
      return danishUnit(unit);
    case "en":
      return englishUnit(unit);
  }
}

function swedishUnit(unit: string): string {
  const map: Record<string, string> = {
    g: "g", kg: "kg", ml: "ml", dl: "dl", l: "l",
    tsk: "tsk", msk: "msk", krm: "krm", st: "st",
  };
  return map[unit] ?? unit;
}

function norwegianUnit(unit: string): string {
  const map: Record<string, string> = {
    tsk: "ts",      // tsk → ts (teskje)
    msk: "ss",      // msk → ss (spiseskje)
    krm: "krm",
    st: "stk",
  };
  return map[unit] ?? unit;
}

function danishUnit(unit: string): string {
  const map: Record<string, string> = {
    tsk: "tsk",
    msk: "spsk",    // msk → spsk (spiseske)
    krm: "knsp",    // krm → knsp (knivspids)
    st: "stk",
  };
  return map[unit] ?? unit;
}

function englishUnit(unit: string): string {
  const map: Record<string, string> = {
    tsk: "tsp",
    msk: "tbsp",
    krm: "pinch",
    dl: "dl",       // keep dl for English — Nordic recipes read better this way
    st: "",         // "2 eggs" not "2 whole eggs"
  };
  return map[unit] ?? unit;
}
