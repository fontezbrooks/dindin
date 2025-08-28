import mongoose from "mongoose";
import { DailyNutrition } from "../models/daily-nutrition.model.js";
import { Nutrition } from "../models/nutrition.model.js";
import logger from "../lib/logger";
import { NutritionCalculationService } from "./nutrition-calculation.service.js";

// Daily nutrition tracking service
export class DailyNutritionService {
	// Get or create daily nutrition record for a user
	static async getDailyNutrition(userId: string, date?: Date) {
		const targetDate = date || new Date();
		// Set to start of day for consistent querying
		targetDate.setHours(0, 0, 0, 0);

		let dailyNutrition = await DailyNutrition.findOne({
			userId: new mongoose.Types.ObjectId(userId),
			date: targetDate,
		}).populate("meals.recipeId", "title image_url cook_time");

		if (!dailyNutrition) {
			// Create new daily nutrition record with default goals
			dailyNutrition = await DailyNutrition.create({
				userId,
				date: targetDate,
				goals: {
					calories: 2000,
					protein: 150,
					carbohydrates: 225,
					fat: 65,
					fiber: 25,
					sodium: 2300,
				},
				waterGoal: 64,
			});
		}

		return dailyNutrition;
	}

	// Add a meal to daily nutrition tracking
	static async addMeal(
		userId: string,
		mealType: string,
		recipeId: string,
		servings: number = 1,
		date?: Date,
	) {
		try {
			const dailyNutrition = await DailyNutritionService.getDailyNutrition(
				userId,
				date,
			);

			// Get nutrition data for the recipe
			const recipeNutrition =
				await NutritionCalculationService.getNutritionForServings(
					recipeId,
					servings,
				);

			// Add meal to daily nutrition
			await dailyNutrition.addMeal(
				mealType,
				recipeId,
				servings,
				recipeNutrition,
			);

			// Return updated daily nutrition with populated meals
			return await DailyNutritionService.getDailyNutrition(userId, date);
		} catch (error) {
			logger.error("Error adding meal to daily nutrition:", error);
			throw new Error("Failed to add meal to daily tracking");
		}
	}

	// Remove a meal from daily nutrition tracking
	static async removeMeal(userId: string, mealId: string, date?: Date) {
		try {
			const dailyNutrition = await DailyNutritionService.getDailyNutrition(
				userId,
				date,
			);
			await dailyNutrition.removeMeal(mealId);

			return await DailyNutritionService.getDailyNutrition(userId, date);
		} catch (error) {
			logger.error("Error removing meal from daily nutrition:", error);
			throw new Error("Failed to remove meal from daily tracking");
		}
	}

	// Update water intake
	static async addWaterIntake(userId: string, ounces: number, date?: Date) {
		try {
			const dailyNutrition = await DailyNutritionService.getDailyNutrition(
				userId,
				date,
			);
			await dailyNutrition.addWater(ounces);

			return dailyNutrition;
		} catch (error) {
			logger.error("Error updating water intake:", error);
			throw new Error("Failed to update water intake");
		}
	}

	// Update daily nutrition goals
	static async updateGoals(userId: string, goals: any) {
		try {
			const today = new Date();
			today.setHours(0, 0, 0, 0);

			const dailyNutrition = await DailyNutritionService.getDailyNutrition(
				userId,
				today,
			);

			// Update goals
			Object.keys(goals).forEach((key) => {
				if (dailyNutrition.goals[key] !== undefined) {
					dailyNutrition.goals[key] = goals[key];
				}
			});

			// Update water goal if provided
			if (goals.waterGoal !== undefined) {
				dailyNutrition.waterGoal = goals.waterGoal;
			}

			await dailyNutrition.save();
			return dailyNutrition;
		} catch (error) {
			logger.error("Error updating nutrition goals:", error);
			throw new Error("Failed to update nutrition goals");
		}
	}

	// Mark day as completed
	static async markDayCompleted(userId: string, date?: Date) {
		try {
			const dailyNutrition = await DailyNutritionService.getDailyNutrition(
				userId,
				date,
			);
			dailyNutrition.completed = true;
			await dailyNutrition.save();

			return dailyNutrition;
		} catch (error) {
			logger.error("Error marking day as completed:", error);
			throw new Error("Failed to mark day as completed");
		}
	}

	// Get nutrition history for a date range
	static async getNutritionHistory(
		userId: string,
		startDate: Date,
		endDate: Date,
	) {
		try {
			startDate.setHours(0, 0, 0, 0);
			endDate.setHours(23, 59, 59, 999);

			return await DailyNutrition.find({
				userId: new mongoose.Types.ObjectId(userId),
				date: { $gte: startDate, $lte: endDate },
			})
				.sort({ date: -1 })
				.populate("meals.recipeId", "title image_url");
		} catch (error) {
			logger.error("Error fetching nutrition history:", error);
			throw new Error("Failed to fetch nutrition history");
		}
	}

	// Get weekly nutrition summary
	static async getWeeklySummary(userId: string, startDate?: Date) {
		try {
			return await DailyNutrition.getWeeklySummary(userId, startDate);
		} catch (error) {
			logger.error("Error fetching weekly summary:", error);
			throw new Error("Failed to fetch weekly nutrition summary");
		}
	}

	// Get nutrition streak data
	static async getNutritionStreak(userId: string) {
		try {
			return await DailyNutrition.getNutritionStreak(userId);
		} catch (error) {
			logger.error("Error fetching nutrition streak:", error);
			throw new Error("Failed to fetch nutrition streak");
		}
	}

	// Get nutrition recommendations based on current intake
	static async getNutritionRecommendations(userId: string, date?: Date) {
		try {
			const dailyNutrition = await DailyNutritionService.getDailyNutrition(
				userId,
				date,
			);
			const remaining = dailyNutrition.remaining;
			const goalPercentages = dailyNutrition.goalPercentages;

			const recommendations = [];

			// Calorie recommendations
			if (goalPercentages.calories < 50) {
				recommendations.push({
					type: "calories",
					message: `You need ${remaining.calories} more calories today. Consider adding a healthy snack.`,
					priority: "medium",
					suggestions: [
						"nuts",
						"fruit with nut butter",
						"whole grain crackers",
					],
				});
			} else if (goalPercentages.calories > 100) {
				recommendations.push({
					type: "calories",
					message:
						"You've exceeded your calorie goal. Consider lighter options for remaining meals.",
					priority: "low",
					suggestions: ["vegetables", "lean proteins", "broth-based soups"],
				});
			}

			// Protein recommendations
			if (goalPercentages.protein < 80) {
				recommendations.push({
					type: "protein",
					message: `You need ${Math.round(remaining.protein)}g more protein today.`,
					priority: "high",
					suggestions: [
						"lean meats",
						"eggs",
						"legumes",
						"Greek yogurt",
						"tofu",
					],
				});
			}

			// Fiber recommendations
			if (goalPercentages.fiber < 70) {
				recommendations.push({
					type: "fiber",
					message: `Increase your fiber intake by ${Math.round(remaining.fiber)}g.`,
					priority: "medium",
					suggestions: [
						"whole grains",
						"beans",
						"vegetables",
						"fruits with skin",
					],
				});
			}

			// Sodium warnings
			if (goalPercentages.sodium > 90) {
				recommendations.push({
					type: "sodium",
					message: "Your sodium intake is high. Choose lower-sodium options.",
					priority: "high",
					suggestions: [
						"fresh fruits",
						"unsalted nuts",
						"herbs instead of salt",
					],
				});
			}

			// Water recommendations
			if (goalPercentages.water < 75) {
				recommendations.push({
					type: "hydration",
					message: `Drink ${remaining.water} more ounces of water today.`,
					priority: "medium",
					suggestions: ["water", "herbal tea", "sparkling water with lemon"],
				});
			}

			// Macro balance recommendations
			const macros = dailyNutrition.macroPercentages || {
				protein: 0,
				carbs: 0,
				fat: 0,
			};
			if (macros.fat > 40) {
				recommendations.push({
					type: "macros",
					message:
						"Your fat intake is high. Balance with more proteins and complex carbs.",
					priority: "medium",
					suggestions: ["lean proteins", "whole grains", "vegetables"],
				});
			}

			return recommendations;
		} catch (error) {
			logger.error("Error generating nutrition recommendations:", error);
			throw new Error("Failed to generate nutrition recommendations");
		}
	}

	// Get meal suggestions based on remaining nutrients
	static async getMealSuggestions(
		userId: string,
		mealType: string,
		date?: Date,
	) {
		try {
			const dailyNutrition = await DailyNutritionService.getDailyNutrition(
				userId,
				date,
			);
			const remaining = dailyNutrition.remaining;
			const goalPercentages = dailyNutrition.goalPercentages;

			const suggestions = {
				targetCalories: Math.min(
					remaining.calories,
					DailyNutritionService.getMealCalorieTarget(mealType),
				),
				targetProtein: Math.max(remaining.protein * 0.3, 10),
				targetCarbs: Math.max(remaining.carbohydrates * 0.3, 20),
				targetFat: Math.max(remaining.fat * 0.3, 5),
				recommendations: [],
				dietaryFocus: [],
			};

			// Add dietary focus based on what's needed
			if (goalPercentages.protein < 70) {
				suggestions.dietaryFocus.push("high-protein");
			}
			if (goalPercentages.fiber < 70) {
				suggestions.dietaryFocus.push("high-fiber");
			}
			if (goalPercentages.sodium > 80) {
				suggestions.dietaryFocus.push("low-sodium");
			}
			if (remaining.calories < 300) {
				suggestions.dietaryFocus.push("low-calorie");
			}

			return suggestions;
		} catch (error) {
			logger.error("Error generating meal suggestions:", error);
			throw new Error("Failed to generate meal suggestions");
		}
	}

	// Helper method to get meal calorie targets
	private static getMealCalorieTarget(mealType: string): number {
		const targets = {
			breakfast: 400,
			lunch: 500,
			dinner: 600,
			snack: 200,
		};
		return targets[mealType] || 300;
	}

	// Get nutrition analytics for a user
	static async getNutritionAnalytics(userId: string, days: number = 30) {
		try {
			const endDate = new Date();
			const startDate = new Date();
			startDate.setDate(startDate.getDate() - days);

			const records = await DailyNutrition.find({
				userId: new mongoose.Types.ObjectId(userId),
				date: { $gte: startDate, $lte: endDate },
			}).sort({ date: 1 });

			if (records.length === 0) {
				return {
					totalDays: 0,
					averages: {},
					trends: {},
					goalAchievement: {},
					insights: [],
				};
			}

			// Calculate averages
			const totals = records.reduce(
				(acc, record) => {
					acc.calories += record.totalCalories;
					acc.protein += record.totalProtein;
					acc.carbohydrates += record.totalCarbohydrates;
					acc.fat += record.totalFat;
					acc.fiber += record.totalFiber;
					acc.water += record.waterIntake;
					return acc;
				},
				{
					calories: 0,
					protein: 0,
					carbohydrates: 0,
					fat: 0,
					fiber: 0,
					water: 0,
				},
			);

			const averages = {};
			Object.keys(totals).forEach((key) => {
				averages[key] = Math.round((totals[key] / records.length) * 10) / 10;
			});

			// Calculate goal achievement rates
			const goalAchievement = {};
			const firstRecord = records[0];
			if (firstRecord && firstRecord.goals) {
				Object.keys(firstRecord.goals).forEach((nutrient) => {
					const achievedDays = records.filter((record) => {
						const actual =
							record[
								`total${nutrient.charAt(0).toUpperCase() + nutrient.slice(1)}`
							] || record.totalCalories;
						const goal = record.goals[nutrient];
						return actual >= goal * 0.8; // 80% of goal counts as achieved
					}).length;

					goalAchievement[nutrient] = Math.round(
						(achievedDays / records.length) * 100,
					);
				});
			}

			// Generate insights
			const insights = DailyNutritionService.generateNutritionInsights(
				records,
				averages,
				goalAchievement,
			);

			return {
				totalDays: records.length,
				averages,
				goalAchievement,
				insights,
				streak: await DailyNutritionService.getNutritionStreak(userId),
			};
		} catch (error) {
			logger.error("Error generating nutrition analytics:", error);
			throw new Error("Failed to generate nutrition analytics");
		}
	}

	// Generate nutrition insights
	private static generateNutritionInsights(
		records: any[],
		averages: any,
		goalAchievement: any,
	) {
		const insights = [];

		// Calorie consistency insight
		const calorieVariance = DailyNutritionService.calculateVariance(
			records.map((r) => r.totalCalories),
		);
		if (calorieVariance < 200) {
			insights.push({
				type: "positive",
				title: "Consistent Calorie Intake",
				message:
					"You maintain consistent calorie intake, which is great for metabolic health.",
			});
		} else {
			insights.push({
				type: "suggestion",
				title: "Calorie Consistency",
				message:
					"Try to maintain more consistent daily calorie intake for better results.",
			});
		}

		// Protein achievement
		if (goalAchievement.protein > 80) {
			insights.push({
				type: "positive",
				title: "Excellent Protein Intake",
				message: `You hit your protein goals ${goalAchievement.protein}% of the time.`,
			});
		} else if (goalAchievement.protein < 60) {
			insights.push({
				type: "warning",
				title: "Low Protein Achievement",
				message: "Consider adding more protein-rich foods to your meals.",
			});
		}

		// Hydration insight
		if (averages.water < 48) {
			insights.push({
				type: "warning",
				title: "Hydration Alert",
				message:
					"Your average water intake is below recommended levels. Aim for 8 glasses per day.",
			});
		}

		// Weekend vs weekday patterns
		const weekdays = records.filter((r) =>
			[1, 2, 3, 4, 5].includes(r.date.getDay()),
		);
		const weekends = records.filter((r) => [0, 6].includes(r.date.getDay()));

		if (weekdays.length > 0 && weekends.length > 0) {
			const weekdayAvgCals =
				weekdays.reduce((sum, r) => sum + r.totalCalories, 0) / weekdays.length;
			const weekendAvgCals =
				weekends.reduce((sum, r) => sum + r.totalCalories, 0) / weekends.length;

			if (weekendAvgCals > weekdayAvgCals * 1.2) {
				insights.push({
					type: "suggestion",
					title: "Weekend Eating Pattern",
					message:
						"You tend to eat more on weekends. Try to maintain consistency throughout the week.",
				});
			}
		}

		return insights;
	}

	// Calculate variance for an array of numbers
	private static calculateVariance(numbers: number[]): number {
		if (numbers.length === 0) return 0;

		const mean = numbers.reduce((sum, num) => sum + num, 0) / numbers.length;
		const variance =
			numbers.reduce((sum, num) => sum + (num - mean) ** 2, 0) / numbers.length;

		return Math.sqrt(variance); // Return standard deviation
	}
}
