import { create } from "zustand";
import { recipeService } from "../services/recipeService";
import { RecipeUI } from "../models/recipeSchema";

// Use RecipeUI interface from the schema
export interface Recipe extends RecipeUI {}

export interface SwipeResult {
  success: boolean;
  isMatch?: boolean;
  match?: any;
  message?: string;
}

interface RecipeState {
  recipes: Recipe[];
  isLoading: boolean;
  isSwipeLoading: boolean;
  swipeHistory: any[];
  lastMatch: any;
  currentIndex: number;
  matches: string[]; // Changed from number[] to string[] to match MongoDB ObjectIds

  // Actions
  loadRecipes: (isPersonalized?: boolean) => Promise<void>;
  swipeRecipe: (
    recipeId: string, // Changed from number to string for MongoDB ObjectIds
    direction: "left" | "right"
  ) => Promise<boolean>;
  removeRecipeFromDeck: (recipeId: string) => void; // Changed from number to string
  resetSwipes: () => void;
  setCurrentIndex: (index: number) => void;
  addMatch: (recipeId: string) => void; // Changed from number to string
  setLastMatch: (match: any) => void;
  searchRecipes: (searchText: string) => Promise<void>;
}

// Fallback recipes in case of database issues
const fallbackRecipes: Recipe[] = [
  {
    id: "fallback-1",
    title: "Creamy Mushroom Pasta",
    cookTime: "25 mins",
    difficulty: "Easy",
    image: "https://images.unsplash.com/photo-1515516970627-3f00c6f75f5a?w=800&h=600&fit=crop",
    description: "Rich and creamy pasta with wild mushrooms and parmesan cheese",
    rating: 4.8,
    matches: 1240,
    ingredients: ["Pasta", "Mushrooms", "Cream", "Parmesan"],
    tags: ["Italian", "Vegetarian", "Quick"],
  },
  {
    id: "fallback-2",
    title: "Spicy Tuna Poke Bowl",
    cookTime: "15 mins",
    difficulty: "Medium",
    image: "https://images.unsplash.com/photo-1513104890138-7c749659a591?w=800&h=600&fit=crop",
    description: "Fresh ahi tuna with spicy mayo, avocado, and cucumber",
    rating: 4.9,
    matches: 980,
    ingredients: ["Tuna", "Rice", "Avocado", "Cucumber"],
    tags: ["Japanese", "Healthy", "Fresh"],
  },
];

export const useRecipeStore = create<RecipeState>((set, get) => ({
  recipes: [],
  isLoading: false,
  isSwipeLoading: false,
  swipeHistory: [],
  lastMatch: null,
  currentIndex: 0,
  matches: [],

  loadRecipes: async (isPersonalized = true) => {
    set({ isLoading: true });

    try {
      let recipes: Recipe[];

      if (isPersonalized) {
        recipes = await recipeService.getPersonalizedRecipes();
      } else {
        recipes = await recipeService.getRecipes({ 
          isActive: true, 
          limit: 50 
        });
      }

      // If no recipes found or error occurred, use fallback
      if (!recipes || recipes.length === 0) {
        console.warn("No recipes found from database, using fallback recipes");
        recipes = fallbackRecipes;
      }

      set({
        recipes,
        isLoading: false,
      });
    } catch (error) {
      console.error("Failed to load recipes:", error);
      // Use fallback recipes on error
      set({ 
        recipes: fallbackRecipes,
        isLoading: false 
      });
    }
  },

  swipeRecipe: async (recipeId: string, direction: "left" | "right") => {
    set({ isSwipeLoading: true });

    try {
      // Record swipe using the service
      const swipeResult = await recipeService.recordSwipe({
        recipeId,
        direction,
        timestamp: new Date(),
      });

      // Record swipe in local history
      const swipeRecord = {
        recipeId,
        direction,
        timestamp: new Date().toISOString(),
      };

      set((state) => ({
        swipeHistory: [...state.swipeHistory, swipeRecord],
        isSwipeLoading: false,
      }));

      // Remove from deck
      get().removeRecipeFromDeck(recipeId);

      // Handle matches
      if (swipeResult.isMatch) {
        const match = {
          recipeId,
          matchedAt: new Date().toISOString(),
          partnerName: "Alex", // This would come from actual match data
        };

        set({
          lastMatch: match,
          matches: [...get().matches, recipeId],
        });
      }

      return swipeResult.success;
    } catch (error) {
      console.error("Failed to record swipe:", error);
      set({ isSwipeLoading: false });
      return false;
    }
  },

  removeRecipeFromDeck: (recipeId: string) => {
    set((state) => ({
      recipes: state.recipes.filter((recipe) => recipe.id !== recipeId),
    }));
  },

  resetSwipes: async () => {
    try {
      // Reload fresh recipes from database
      const recipes = await recipeService.getRecipes({ 
        isActive: true, 
        limit: 50 
      });

      set({
        recipes: recipes.length > 0 ? recipes : fallbackRecipes,
        currentIndex: 0,
        matches: [],
        swipeHistory: [],
        lastMatch: null,
      });
    } catch (error) {
      console.error("Failed to reset swipes:", error);
      // Use fallback recipes on error
      set({
        recipes: fallbackRecipes,
        currentIndex: 0,
        matches: [],
        swipeHistory: [],
        lastMatch: null,
      });
    }
  },

  setCurrentIndex: (index: number) => {
    set({ currentIndex: index });
  },

  addMatch: (recipeId: string) => {
    set((state) => ({
      matches: [...state.matches, recipeId],
    }));
  },

  setLastMatch: (match: any) => {
    set({ lastMatch: match });
  },

  searchRecipes: async (searchText: string) => {
    set({ isLoading: true });

    try {
      const recipes = await recipeService.searchRecipes(searchText, { 
        isActive: true 
      });

      set({
        recipes: recipes.length > 0 ? recipes : fallbackRecipes,
        isLoading: false,
        currentIndex: 0, // Reset to start
      });
    } catch (error) {
      console.error("Failed to search recipes:", error);
      set({ 
        recipes: fallbackRecipes,
        isLoading: false 
      });
    }
  },
}));
