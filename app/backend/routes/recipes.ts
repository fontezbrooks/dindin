// Recipe API Routes - TypeScript version with basic endpoints

import { Router, Request, Response, NextFunction } from "express";
import { param, validationResult } from "express-validator";
import Recipe from "../models/Recipe.js";
import type { ApiResponse, IRecipe } from "../types/index.js";

const router = Router();

// Validation middleware
const handleValidationErrors = (req: Request, res: Response, next: NextFunction): void => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    res.status(400).json({
      success: false,
      message: "Validation error",
      errors: errors.array().map(error => {
        if (error.type === 'field') {
          return {
            field: error.path,
            message: error.msg,
            value: error.value,
            location: error.location
          };
        }
        return {
          field: 'unknown',
          message: error.msg,
        };
      }),
    } as ApiResponse);
    return;
  }
  next();
};

// GET /api/recipes - Get recipes with basic filtering
router.get("/", async (_req: Request, res: Response<ApiResponse<IRecipe[]>>) => {
  try {
    const recipes = await Recipe.getRandomRecipes(50);
    res.json({
      success: true,
      data: recipes,
      message: `Found ${recipes.length} recipes`,
    });
  } catch (error) {
    console.error("Error fetching recipes:", error);
    res.status(500).json({
      success: false,
      message: "Internal server error",
      error: process.env.NODE_ENV === "development" && error instanceof Error ? error.message : undefined,
    });
  }
});

// GET /api/recipes/personalized - Get personalized recipes (must come before /:id route)
router.get("/personalized", async (_req: Request, res: Response<ApiResponse<IRecipe[]>>) => {
  try {
    // For now, return random recipes - can be enhanced with user preferences later
    const recipes = await Recipe.getRandomRecipes(50);
    res.json({
      success: true,
      data: recipes,
      message: `Found ${recipes.length} personalized recipes`,
    });
  } catch (error) {
    console.error("Error fetching personalized recipes:", error);
    res.status(500).json({
      success: false,
      message: "Internal server error",
      error: process.env.NODE_ENV === "development" && error instanceof Error ? error.message : undefined,
    });
  }
});

// GET /api/recipes/personalized/:userId - Get personalized recipes for specific user
router.get("/personalized/:userId", 
  [param("userId").notEmpty().withMessage("User ID is required")],
  handleValidationErrors,
  async (req: Request<{ userId: string }>, res: Response<ApiResponse<IRecipe[]>>) => {
    try {
      // For now, return random recipes - can be enhanced with user preferences later
      const recipes = await Recipe.getRandomRecipes(50);
      res.json({
        success: true,
        data: recipes,
        message: `Found ${recipes.length} personalized recipes for user ${req.params.userId}`,
      });
    } catch (error) {
      console.error("Error fetching personalized recipes:", error);
      res.status(500).json({
        success: false,
        message: "Internal server error",
        error: process.env.NODE_ENV === "development" && error instanceof Error ? error.message : undefined,
      });
    }
  }
);

// GET /api/recipes/:id - Get recipe by ID
router.get(
  "/:id",
  [param("id").notEmpty().withMessage("Recipe ID is required")],
  handleValidationErrors,
  async (req: Request<{ id: string }>, res: Response<ApiResponse<IRecipe>>) => {
    try {
      const recipe = await Recipe.findById(req.params.id);
      if (!recipe) {
        res.status(404).json({
          success: false,
          message: "Recipe not found",
        });
        return;
      }
      res.json({
        success: true,
        data: recipe,
        message: "Recipe retrieved successfully",
      });
    } catch (error) {
      console.error("Error fetching recipe:", error);
      res.status(500).json({
        success: false,
        message: "Internal server error",
        error: process.env.NODE_ENV === "development" && error instanceof Error ? error.message : undefined,
      });
    }
  }
);

export default router;
