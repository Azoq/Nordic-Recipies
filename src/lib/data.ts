import type { Ingredient, Recipe } from "./types";
import ingredientsJson from "../app/ingredients.json";
import recipesJson from "../app/recipes.json";

const ingredientsList = (ingredientsJson as { ingredients: Ingredient[] }).ingredients;
const recipesList = (recipesJson as { recipes: Recipe[] }).recipes;

export const INGREDIENTS: Record<string, Ingredient> = Object.fromEntries(
  ingredientsList.map((i) => [i.id, i])
);

export const RECIPES: Recipe[] = recipesList;

export function getRecipe(id: string): Recipe | undefined {
  return RECIPES.find((r) => r.id === id);
}

export function getIngredient(id: string): Ingredient | undefined {
  return INGREDIENTS[id];
}
