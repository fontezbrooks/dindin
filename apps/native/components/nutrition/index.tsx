// Nutrition Components Export Index
// Comprehensive nutrition tracking and display system

export { DailyNutritionTracker } from "./daily-nutrition-tracker";
export {
	CompactDietaryTags,
	DietaryTagsBadge,
	FeaturedDietaryBadge,
	useDietaryFilter,
} from "./dietary-tags-badge";
export { MacroBarChart, MacroChart } from "./macro-chart";
export { NutritionComparison } from "./nutrition-comparison";
// Core Components
export { NutritionFactsLabel } from "./nutrition-facts-label";
export {
	CompactNutritionProgress,
	NutritionProgressBar,
	RingNutritionProgress,
} from "./nutrition-progress-bar";
export {
	CompactWaterTracker,
	WaterIntakeTracker,
	WaterReminder,
} from "./water-intake-tracker";

// Types and Interfaces
export interface NutritionData {
	recipeId?: string;
	servings: number;
	calories: number;
	protein: number;
	carbohydrates: number;
	fat: number;
	fiber?: number;
	sugar?: number;
	saturatedFat?: number;
	unsaturatedFat?: number;
	transFat?: number;
	cholesterol?: number;
	sodium: number;
	// Micronutrients
	vitaminA?: number;
	vitaminC?: number;
	vitaminD?: number;
	vitaminE?: number;
	vitaminK?: number;
	thiamin?: number;
	riboflavin?: number;
	niacin?: number;
	vitaminB6?: number;
	folate?: number;
	vitaminB12?: number;
	biotin?: number;
	pantothenicAcid?: number;
	calcium?: number;
	iron?: number;
	magnesium?: number;
	phosphorus?: number;
	potassium?: number;
	zinc?: number;
	copper?: number;
	manganese?: number;
	selenium?: number;
	// Dietary indicators
	dietaryTags?: string[];
	allergens?: string[];
	// Metadata
	dataSource?: string;
	accuracy?: number;
	lastCalculated?: Date;
}

export interface DailyNutritionData {
	_id: string;
	userId: string;
	date: Date;
	totalCalories: number;
	totalProtein: number;
	totalCarbohydrates: number;
	totalFat: number;
	totalFiber: number;
	totalSugar: number;
	totalSodium: number;
	waterIntake: number;
	waterGoal: number;
	goals: {
		calories: number;
		protein: number;
		carbohydrates: number;
		fat: number;
		fiber: number;
		sodium: number;
	};
	meals: Array<{
		_id: string;
		mealType: string;
		recipeId: any;
		servings: number;
		consumedAt: Date;
		nutrition: NutritionData;
	}>;
	completed: boolean;
	goalPercentages?: { [key: string]: number };
	remaining?: { [key: string]: number };
}

export interface NutritionRecommendation {
	type: string;
	message: string;
	priority: "low" | "medium" | "high";
	suggestions?: string[];
}

export interface MacroData {
	protein: number;
	carbohydrates: number;
	fat: number;
	calories: number;
}

// Utility Functions
export const nutritionUtils = {
	calculateMacroPercentages: (nutrition: NutritionData) => {
		const totalCals = nutrition.calories || 1;
		const proteinCals = (nutrition.protein || 0) * 4;
		const carbCals = (nutrition.carbohydrates || 0) * 4;
		const fatCals = (nutrition.fat || 0) * 9;

		return {
			protein: Math.round((proteinCals / totalCals) * 100),
			carbohydrates: Math.round((carbCals / totalCals) * 100),
			fat: Math.round((fatCals / totalCals) * 100),
		};
	},

	scaleNutrition: (nutrition: NutritionData, targetServings: number) => {
		const scalingFactor = targetServings / nutrition.servings;

		const scaledNutrition: NutritionData = {
			...nutrition,
			servings: targetServings,
			calories: Math.round(nutrition.calories * scalingFactor),
			protein: Math.round(nutrition.protein * scalingFactor * 10) / 10,
			carbohydrates:
				Math.round(nutrition.carbohydrates * scalingFactor * 10) / 10,
			fat: Math.round(nutrition.fat * scalingFactor * 10) / 10,
			fiber: nutrition.fiber
				? Math.round(nutrition.fiber * scalingFactor * 10) / 10
				: undefined,
			sugar: nutrition.sugar
				? Math.round(nutrition.sugar * scalingFactor * 10) / 10
				: undefined,
			sodium: Math.round((nutrition.sodium || 0) * scalingFactor),
		};

		return scaledNutrition;
	},

	getDailyValuePercentages: (nutrition: NutritionData) => {
		// Daily values based on 2000-calorie diet
		const dailyValues = {
			calories: 2000,
			protein: 50, // grams
			carbohydrates: 300, // grams
			fat: 65, // grams
			fiber: 25, // grams
			saturatedFat: 20, // grams
			cholesterol: 300, // mg
			sodium: 2300, // mg
			vitaminA: 5000, // IU
			vitaminC: 60, // mg
			vitaminD: 400, // IU
			calcium: 1000, // mg
			iron: 18, // mg
			potassium: 3500, // mg
		};

		const percentages: { [key: string]: number } = {};

		Object.keys(dailyValues).forEach((nutrient) => {
			const nutritionValue = nutrition[
				nutrient as keyof NutritionData
			] as number;
			const dailyValue = dailyValues[nutrient as keyof typeof dailyValues];

			if (nutritionValue && dailyValue) {
				percentages[nutrient] = Math.round((nutritionValue / dailyValue) * 100);
			}
		});

		return percentages;
	},

	formatNutrientValue: (
		value: number | undefined,
		unit: string = "g",
		showUnit: boolean = true,
	): string => {
		if (!value && value !== 0) return "--";

		if (unit === "mg" && value >= 1000) {
			return `${(value / 1000).toFixed(1)}g`;
		}

		const formatted = typeof value === "number" ? value.toFixed(1) : "0.0";
		return showUnit ? `${formatted}${unit}` : formatted;
	},

	isHighProtein: (nutrition: NutritionData): boolean => {
		return nutrition.protein > 20;
	},

	isLowCarb: (nutrition: NutritionData): boolean => {
		return nutrition.carbohydrates < 20;
	},

	isKeto: (nutrition: NutritionData): boolean => {
		return nutrition.carbohydrates < 10 && nutrition.fat > 15;
	},

	isLowFat: (nutrition: NutritionData): boolean => {
		return nutrition.fat < 10;
	},

	isLowSodium: (nutrition: NutritionData): boolean => {
		return nutrition.sodium < 140;
	},

	calculateGoalProgress: (
		current: number,
		goal: number,
	): {
		percentage: number;
		remaining: number;
		isComplete: boolean;
		isOverGoal: boolean;
	} => {
		const percentage = goal > 0 ? Math.min((current / goal) * 100, 100) : 0;
		const remaining = Math.max(0, goal - current);
		const isComplete = current >= goal;
		const isOverGoal = current > goal;

		return { percentage, remaining, isComplete, isOverGoal };
	},
};

// Constants
export const MEAL_TYPES = ["breakfast", "lunch", "dinner", "snack"] as const;
export type MealType = (typeof MEAL_TYPES)[number];

export const DIETARY_TAGS = [
	"vegan",
	"vegetarian",
	"gluten-free",
	"dairy-free",
	"nut-free",
	"soy-free",
	"egg-free",
	"keto",
	"low-carb",
	"high-protein",
	"low-fat",
	"low-sodium",
	"paleo",
	"whole30",
	"mediterranean",
	"dash",
	"anti-inflammatory",
	"diabetic-friendly",
	"heart-healthy",
] as const;
export type DietaryTag = (typeof DIETARY_TAGS)[number];

export const ALLERGENS = [
	"milk",
	"eggs",
	"fish",
	"crustacean_shellfish",
	"tree_nuts",
	"peanuts",
	"wheat",
	"soybeans",
	"sesame",
] as const;
export type Allergen = (typeof ALLERGENS)[number];

export const NUTRIENT_UNITS = {
	calories: "",
	protein: "g",
	carbohydrates: "g",
	fat: "g",
	fiber: "g",
	sugar: "g",
	saturatedFat: "g",
	transFat: "g",
	cholesterol: "mg",
	sodium: "mg",
	vitaminA: "IU",
	vitaminC: "mg",
	vitaminD: "IU",
	calcium: "mg",
	iron: "mg",
	potassium: "mg",
} as const;

// Default nutrition goals
export const DEFAULT_NUTRITION_GOALS = {
	calories: 2000,
	protein: 150,
	carbohydrates: 225,
	fat: 65,
	fiber: 25,
	sodium: 2300,
};

export const DEFAULT_WATER_GOAL = 64; // ounces
