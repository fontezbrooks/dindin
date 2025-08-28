import { useCallback, useState } from "react";
import { Alert } from "react-native";
import logger from "@/utils/logger";

interface Ingredient {
  name: string;
  amount: string;
  unit: string;
  _id?: string;
}

interface RecipeDetail {
  id: string;
  title: string;
  imageUrl: string;
  cookTime: number;
  difficulty: "easy" | "medium" | "hard";
  cuisine: string | string[];
  ingredients: (string | Ingredient)[];
  steps: string[];
  tags: string[];
  description?: string;
  image_url?: string;
  cook_time?: number;
  instructions?: Array<{ step: number; description: string } | string>;
  dietary_tags?: string[];
}

export function useRecipeHandlers() {
  const [selectedRecipe, setSelectedRecipe] = useState<RecipeDetail | null>(null);
  const [showRecipeModal, setShowRecipeModal] = useState(false);

  const handleRecipePress = useCallback((recipe: any) => {
    // Map the recipe data to match the expected format
    const mappedRecipe = {
      ...recipe,
      imageUrl: recipe.image_url || recipe.imageUrl,
      cookTime: recipe.cook_time || recipe.cookTime,
      steps: recipe.instructions
        ? recipe.instructions.map((inst: any) =>
            typeof inst === "string" ? inst : inst.description
          )
        : recipe.steps || [],
      tags: recipe.tags || recipe.dietary_tags || [],
    };
    setSelectedRecipe(mappedRecipe);
    setShowRecipeModal(true);
  }, []);

  const handleRecipeLongPress = useCallback((recipe: any) => {
    Alert.alert(
      "Remove from Favorites?",
      `Remove "${recipe.title}" from your favorites?`,
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Remove",
          style: "destructive",
          onPress: () => {
            // TODO: Implement remove from favorites
            logger.log("Remove recipe:", recipe.id);
          },
        },
      ]
    );
  }, []);

  const handleStartCooking = useCallback((recipe: RecipeDetail) => {
    logger.log("Start cooking:", recipe.title);
    setShowRecipeModal(false);
    // TODO: Navigate to cooking mode or timer
  }, []);

  const handleShareRecipe = useCallback((recipe: RecipeDetail) => {
    logger.log("Share recipe:", recipe.title);
    // TODO: Implement share functionality
  }, []);

  const closeModal = useCallback(() => {
    setShowRecipeModal(false);
  }, []);

  return {
    selectedRecipe,
    showRecipeModal,
    handleRecipePress,
    handleRecipeLongPress,
    handleStartCooking,
    handleShareRecipe,
    closeModal,
  };
}