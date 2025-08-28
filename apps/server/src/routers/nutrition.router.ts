import { Hono } from "hono";
import mongoose from "mongoose";
import { z } from "zod";
import { Nutrition } from "../models/nutrition.model.js";
import { DailyNutritionService } from "../services/daily-nutrition.service.js";
import { NutritionCalculationService } from "../services/nutrition-calculation.service.js";
import logger from "../lib/logger";

const nutrition = new Hono();

// Validation schemas
const addMealSchema = z.object({
	mealType: z.enum(["breakfast", "lunch", "dinner", "snack"]),
	recipeId: z.string(),
	servings: z.number().min(0.1).default(1),
	date: z
		.string()
		.optional()
		.transform((val) => (val ? new Date(val) : undefined)),
});

const updateGoalsSchema = z.object({
	calories: z.number().min(800).max(5000).optional(),
	protein: z.number().min(10).optional(),
	carbohydrates: z.number().min(20).optional(),
	fat: z.number().min(10).optional(),
	fiber: z.number().min(5).optional(),
	sodium: z.number().max(5000).optional(),
	waterGoal: z.number().min(20).max(200).optional(),
});

// Get nutrition data for a specific recipe
nutrition.get("/recipe/:recipeId", async (c) => {
	try {
		const recipeId = c.req.param("recipeId");
		const servings = Number(c.req.query("servings")) || 1;

		if (!mongoose.Types.ObjectId.isValid(recipeId)) {
			return c.json({ error: "Invalid recipe ID" }, 400);
		}

		const nutritionData =
			await NutritionCalculationService.getNutritionForServings(
				recipeId,
				servings,
			);

		if (!nutritionData) {
			return c.json({ error: "Nutrition data not found" }, 404);
		}

		// Calculate additional metrics
		const macroPercentages =
			NutritionCalculationService.calculateMacroPercentages(nutritionData);
		const dailyValuePercentages =
			Nutrition.getDailyValuePercentages(nutritionData);

		return c.json({
			nutrition: nutritionData,
			macroPercentages,
			dailyValuePercentages,
			servings,
		});
	} catch (error) {
		logger.error("Error fetching recipe nutrition:", error);
		return c.json({ error: "Failed to fetch nutrition data" }, 500);
	}
});

// Compare nutrition between two recipes
nutrition.get("/compare/:recipeId1/:recipeId2", async (c) => {
	try {
		const recipeId1 = c.req.param("recipeId1");
		const recipeId2 = c.req.param("recipeId2");
		const servings1 = Number(c.req.query("servings1")) || 1;
		const servings2 = Number(c.req.query("servings2")) || 1;

		if (
			!mongoose.Types.ObjectId.isValid(recipeId1) ||
			!mongoose.Types.ObjectId.isValid(recipeId2)
		) {
			return c.json({ error: "Invalid recipe IDs" }, 400);
		}

		const [nutrition1, nutrition2] = await Promise.all([
			NutritionCalculationService.getNutritionForServings(recipeId1, servings1),
			NutritionCalculationService.getNutritionForServings(recipeId2, servings2),
		]);

		if (!nutrition1 || !nutrition2) {
			return c.json(
				{ error: "Nutrition data not found for one or both recipes" },
				404,
			);
		}

		const comparison = Nutrition.compareNutrition(nutrition1, nutrition2);
		const macros1 =
			NutritionCalculationService.calculateMacroPercentages(nutrition1);
		const macros2 =
			NutritionCalculationService.calculateMacroPercentages(nutrition2);

		return c.json({
			recipe1: {
				nutrition: nutrition1,
				macroPercentages: macros1,
				servings: servings1,
			},
			recipe2: {
				nutrition: nutrition2,
				macroPercentages: macros2,
				servings: servings2,
			},
			comparison,
		});
	} catch (error) {
		logger.error("Error comparing recipe nutrition:", error);
		return c.json({ error: "Failed to compare nutrition data" }, 500);
	}
});

// Get daily nutrition tracking for a user
nutrition.get("/daily/:userId", async (c) => {
	try {
		const userId = c.req.param("userId");
		const dateParam = c.req.query("date");
		const date = dateParam ? new Date(dateParam) : new Date();

		if (!mongoose.Types.ObjectId.isValid(userId)) {
			return c.json({ error: "Invalid user ID" }, 400);
		}

		const dailyNutrition = await DailyNutritionService.getDailyNutrition(
			userId,
			date,
		);
		const recommendations =
			await DailyNutritionService.getNutritionRecommendations(userId, date);

		return c.json({
			dailyNutrition,
			recommendations,
			goalPercentages: dailyNutrition.goalPercentages,
			remaining: dailyNutrition.remaining,
		});
	} catch (error) {
		logger.error("Error fetching daily nutrition:", error);
		return c.json({ error: "Failed to fetch daily nutrition data" }, 500);
	}
});

// Add a meal to daily nutrition tracking
nutrition.post("/daily/:userId/meal", async (c) => {
	try {
		const userId = c.req.param("userId");

		if (!mongoose.Types.ObjectId.isValid(userId)) {
			return c.json({ error: "Invalid user ID" }, 400);
		}

		const body = await c.req.json();
		const validatedData = addMealSchema.parse(body);

		const updatedDailyNutrition = await DailyNutritionService.addMeal(
			userId,
			validatedData.mealType,
			validatedData.recipeId,
			validatedData.servings,
			validatedData.date,
		);

		return c.json({
			dailyNutrition: updatedDailyNutrition,
			message: "Meal added successfully",
		});
	} catch (error) {
		if (error.name === "ZodError") {
			return c.json(
				{ error: "Invalid request data", details: error.errors },
				400,
			);
		}
		logger.error("Error adding meal:", error);
		return c.json({ error: "Failed to add meal to daily tracking" }, 500);
	}
});

// Remove a meal from daily nutrition tracking
nutrition.delete("/daily/:userId/meal/:mealId", async (c) => {
	try {
		const userId = c.req.param("userId");
		const mealId = c.req.param("mealId");
		const dateParam = c.req.query("date");
		const date = dateParam ? new Date(dateParam) : new Date();

		if (!mongoose.Types.ObjectId.isValid(userId)) {
			return c.json({ error: "Invalid user ID" }, 400);
		}

		const updatedDailyNutrition = await DailyNutritionService.removeMeal(
			userId,
			mealId,
			date,
		);

		return c.json({
			dailyNutrition: updatedDailyNutrition,
			message: "Meal removed successfully",
		});
	} catch (error) {
		logger.error("Error removing meal:", error);
		return c.json({ error: "Failed to remove meal from daily tracking" }, 500);
	}
});

// Update water intake
nutrition.post("/daily/:userId/water", async (c) => {
	try {
		const userId = c.req.param("userId");
		const body = await c.req.json();
		const ounces = Number(body.ounces);
		const dateParam = body.date;
		const date = dateParam ? new Date(dateParam) : new Date();

		if (!mongoose.Types.ObjectId.isValid(userId)) {
			return c.json({ error: "Invalid user ID" }, 400);
		}

		if (!ounces || ounces <= 0) {
			return c.json({ error: "Invalid water amount" }, 400);
		}

		const updatedDailyNutrition = await DailyNutritionService.addWaterIntake(
			userId,
			ounces,
			date,
		);

		return c.json({
			dailyNutrition: updatedDailyNutrition,
			message: "Water intake updated successfully",
		});
	} catch (error) {
		logger.error("Error updating water intake:", error);
		return c.json({ error: "Failed to update water intake" }, 500);
	}
});

// Update daily nutrition goals
nutrition.put("/daily/:userId/goals", async (c) => {
	try {
		const userId = c.req.param("userId");

		if (!mongoose.Types.ObjectId.isValid(userId)) {
			return c.json({ error: "Invalid user ID" }, 400);
		}

		const body = await c.req.json();
		const validatedGoals = updateGoalsSchema.parse(body);

		const updatedDailyNutrition = await DailyNutritionService.updateGoals(
			userId,
			validatedGoals,
		);

		return c.json({
			goals: updatedDailyNutrition.goals,
			waterGoal: updatedDailyNutrition.waterGoal,
			message: "Goals updated successfully",
		});
	} catch (error) {
		if (error.name === "ZodError") {
			return c.json({ error: "Invalid goal data", details: error.errors }, 400);
		}
		logger.error("Error updating goals:", error);
		return c.json({ error: "Failed to update nutrition goals" }, 500);
	}
});

// Get nutrition history for a date range
nutrition.get("/history/:userId", async (c) => {
	try {
		const userId = c.req.param("userId");
		const startDateParam = c.req.query("startDate");
		const endDateParam = c.req.query("endDate");
		const days = Number(c.req.query("days")) || 7;

		if (!mongoose.Types.ObjectId.isValid(userId)) {
			return c.json({ error: "Invalid user ID" }, 400);
		}

		let startDate, endDate;

		if (startDateParam && endDateParam) {
			startDate = new Date(startDateParam);
			endDate = new Date(endDateParam);
		} else {
			endDate = new Date();
			startDate = new Date();
			startDate.setDate(startDate.getDate() - days + 1);
		}

		const history = await DailyNutritionService.getNutritionHistory(
			userId,
			startDate,
			endDate,
		);

		return c.json({
			history,
			dateRange: {
				startDate: startDate.toISOString().split("T")[0],
				endDate: endDate.toISOString().split("T")[0],
			},
		});
	} catch (error) {
		logger.error("Error fetching nutrition history:", error);
		return c.json({ error: "Failed to fetch nutrition history" }, 500);
	}
});

// Get weekly nutrition summary
nutrition.get("/weekly/:userId", async (c) => {
	try {
		const userId = c.req.param("userId");
		const startDateParam = c.req.query("startDate");
		const startDate = startDateParam ? new Date(startDateParam) : undefined;

		if (!mongoose.Types.ObjectId.isValid(userId)) {
			return c.json({ error: "Invalid user ID" }, 400);
		}

		const weeklySummary = await DailyNutritionService.getWeeklySummary(
			userId,
			startDate,
		);

		return c.json({
			weeklySummary: weeklySummary[0] || {
				avgCalories: 0,
				avgProtein: 0,
				avgCarbs: 0,
				avgFat: 0,
				avgFiber: 0,
				avgWater: 0,
				daysTracked: 0,
				daysCompleted: 0,
				completionRate: 0,
			},
		});
	} catch (error) {
		logger.error("Error fetching weekly summary:", error);
		return c.json({ error: "Failed to fetch weekly nutrition summary" }, 500);
	}
});

// Get nutrition streak data
nutrition.get("/streak/:userId", async (c) => {
	try {
		const userId = c.req.param("userId");

		if (!mongoose.Types.ObjectId.isValid(userId)) {
			return c.json({ error: "Invalid user ID" }, 400);
		}

		const streak = await DailyNutritionService.getNutritionStreak(userId);

		return c.json({ streak });
	} catch (error) {
		logger.error("Error fetching nutrition streak:", error);
		return c.json({ error: "Failed to fetch nutrition streak" }, 500);
	}
});

// Get nutrition analytics
nutrition.get("/analytics/:userId", async (c) => {
	try {
		const userId = c.req.param("userId");
		const days = Number(c.req.query("days")) || 30;

		if (!mongoose.Types.ObjectId.isValid(userId)) {
			return c.json({ error: "Invalid user ID" }, 400);
		}

		const analytics = await DailyNutritionService.getNutritionAnalytics(
			userId,
			days,
		);

		return c.json({ analytics });
	} catch (error) {
		logger.error("Error fetching nutrition analytics:", error);
		return c.json({ error: "Failed to fetch nutrition analytics" }, 500);
	}
});

// Get meal suggestions based on remaining nutrients
nutrition.get("/suggestions/:userId", async (c) => {
	try {
		const userId = c.req.param("userId");
		const mealType = c.req.query("mealType") || "snack";
		const dateParam = c.req.query("date");
		const date = dateParam ? new Date(dateParam) : new Date();

		if (!mongoose.Types.ObjectId.isValid(userId)) {
			return c.json({ error: "Invalid user ID" }, 400);
		}

		if (!["breakfast", "lunch", "dinner", "snack"].includes(mealType)) {
			return c.json({ error: "Invalid meal type" }, 400);
		}

		const suggestions = await DailyNutritionService.getMealSuggestions(
			userId,
			mealType,
			date,
		);

		return c.json({ suggestions });
	} catch (error) {
		logger.error("Error fetching meal suggestions:", error);
		return c.json({ error: "Failed to fetch meal suggestions" }, 500);
	}
});

// Mark day as completed
nutrition.post("/daily/:userId/complete", async (c) => {
	try {
		const userId = c.req.param("userId");
		const dateParam = c.req.query("date");
		const date = dateParam ? new Date(dateParam) : new Date();

		if (!mongoose.Types.ObjectId.isValid(userId)) {
			return c.json({ error: "Invalid user ID" }, 400);
		}

		const dailyNutrition = await DailyNutritionService.markDayCompleted(
			userId,
			date,
		);

		return c.json({
			dailyNutrition,
			message: "Day marked as completed",
		});
	} catch (error) {
		logger.error("Error marking day as completed:", error);
		return c.json({ error: "Failed to mark day as completed" }, 500);
	}
});

// Update or create nutrition data for a recipe
nutrition.post("/recipe/:recipeId/nutrition", async (c) => {
	try {
		const recipeId = c.req.param("recipeId");
		const body = await c.req.json();

		if (!mongoose.Types.ObjectId.isValid(recipeId)) {
			return c.json({ error: "Invalid recipe ID" }, 400);
		}

		const { ingredients, servings } = body;

		if (!ingredients || !Array.isArray(ingredients)) {
			return c.json({ error: "Ingredients array is required" }, 400);
		}

		const nutritionData =
			await NutritionCalculationService.updateRecipeNutrition(
				recipeId,
				ingredients,
				servings || 1,
			);

		return c.json({
			nutrition: nutritionData,
			message: "Nutrition data updated successfully",
		});
	} catch (error) {
		logger.error("Error updating recipe nutrition:", error);
		return c.json({ error: "Failed to update recipe nutrition data" }, 500);
	}
});

export { nutrition };
