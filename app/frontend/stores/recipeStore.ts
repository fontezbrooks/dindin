import { create } from "zustand";

export interface Recipe {
  id: number;
  title: string;
  cookTime: string;
  difficulty: string;
  image: string;
  description: string;
  rating: number;
  matches: number;
  ingredients: string[];
  tags: string[];
}

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
  matches: number[];

  // Actions
  loadRecipes: (isPersonalized?: boolean) => Promise<void>;
  swipeRecipe: (
    recipeId: number,
    direction: "left" | "right"
  ) => Promise<boolean>;
  removeRecipeFromDeck: (recipeId: number) => void;
  resetSwipes: () => void;
  setCurrentIndex: (index: number) => void;
  addMatch: (recipeId: number) => void;
  setLastMatch: (match: any) => void;
}

// Mock recipe data
const mockRecipes: Recipe[] = [
  {
    id: 1,
    title: "Creamy Mushroom Pasta",
    cookTime: "25 mins",
    difficulty: "Easy",
    image:
      "https://images.unsplash.com/photo-1515516970627-3f00c6f75f5a?w=800&h=600&fit=crop",
    description:
      "Rich and creamy pasta with wild mushrooms and parmesan cheese",
    rating: 4.8,
    matches: 1240,
    ingredients: ["Pasta", "Mushrooms", "Cream", "Parmesan"],
    tags: ["Italian", "Vegetarian", "Quick"],
  },
  {
    id: 2,
    title: "Spicy Tuna Poke Bowl",
    cookTime: "15 mins",
    difficulty: "Medium",
    image:
      "https://images.unsplash.com/photo-1513104890138-7c749659a591?w=800&h=600&fit=crop",
    description: "Fresh ahi tuna with spicy mayo, avocado, and cucumber",
    rating: 4.9,
    matches: 980,
    ingredients: ["Tuna", "Rice", "Avocado", "Cucumber"],
    tags: ["Japanese", "Healthy", "Fresh"],
  },
  {
    id: 3,
    title: "BBQ Chicken Pizza",
    cookTime: "30 mins",
    difficulty: "Medium",
    image:
      "https://images.unsplash.com/photo-1513104890138-7c749659a591?w=800&h=600&fit=crop",
    description: "Homemade pizza with smoky BBQ chicken and melted cheese",
    rating: 4.7,
    matches: 1560,
    ingredients: ["Pizza dough", "Chicken", "BBQ sauce", "Cheese"],
    tags: ["American", "Comfort", "Party"],
  },
  {
    id: 4,
    title: "Vegetable Stir Fry",
    cookTime: "20 mins",
    difficulty: "Easy",
    image:
      "https://images.unsplash.com/photo-1512621776951-a57141f2eefd?w=800&h=600&fit=crop",
    description: "Colorful vegetables in a savory sauce served over rice",
    rating: 4.6,
    matches: 870,
    ingredients: ["Mixed vegetables", "Soy sauce", "Rice", "Ginger"],
    tags: ["Asian", "Vegan", "Healthy"],
  },
  {
    id: 5,
    title: "Beef Tacos",
    cookTime: "35 mins",
    difficulty: "Easy",
    image:
      "https://images.unsplash.com/photo-1565299624946-b28f40a0ae38?w=800&h=600&fit=crop",
    description:
      "Authentic Mexican tacos with seasoned beef and fresh toppings",
    rating: 4.9,
    matches: 2100,
    ingredients: ["Ground beef", "Tortillas", "Tomatoes", "Onion"],
    tags: ["Mexican", "Spicy", "Family"],
  },
];

export const useRecipeStore = create<RecipeState>((set, get) => ({
  recipes: mockRecipes,
  isLoading: false,
  isSwipeLoading: false,
  swipeHistory: [],
  lastMatch: null,
  currentIndex: 0,
  matches: [],

  loadRecipes: async (isPersonalized = true) => {
    set({ isLoading: true });

    try {
      // Simulate API call delay
      await new Promise((resolve) => setTimeout(resolve, 1000));

      // In a real app, this would be an API call
      // const response = isPersonalized
      //   ? await recipeService.getPersonalizedRecipes()
      //   : await recipeService.getRecipes();

      set({
        recipes: mockRecipes,
        isLoading: false,
      });
    } catch (error) {
      console.error("Failed to load recipes:", error);
      set({ isLoading: false });
    }
  },

  swipeRecipe: async (recipeId: number, direction: "left" | "right") => {
    set({ isSwipeLoading: true });

    try {
      // Simulate API call delay
      await new Promise((resolve) => setTimeout(resolve, 500));

      // Record swipe in history
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

      // Handle matches (simulate 30% match rate for right swipes)
      if (direction === "right") {
        const isMatch = Math.random() < 0.3;
        if (isMatch) {
          const match = {
            recipeId,
            matchedAt: new Date().toISOString(),
            partnerName: "Alex",
          };

          set({
            lastMatch: match,
            matches: [...get().matches, recipeId],
          });
        }
      }

      return true;
    } catch (error) {
      console.error("Failed to record swipe:", error);
      set({ isSwipeLoading: false });
      return false;
    }
  },

  removeRecipeFromDeck: (recipeId: number) => {
    set((state) => ({
      recipes: state.recipes.filter((recipe) => recipe.id !== recipeId),
    }));
  },

  resetSwipes: () => {
    set({
      recipes: mockRecipes,
      currentIndex: 0,
      matches: [],
      swipeHistory: [],
      lastMatch: null,
    });
  },

  setCurrentIndex: (index: number) => {
    set({ currentIndex: index });
  },

  addMatch: (recipeId: number) => {
    set((state) => ({
      matches: [...state.matches, recipeId],
    }));
  },

  setLastMatch: (match: any) => {
    set({ lastMatch: match });
  },
}));
