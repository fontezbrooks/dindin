import mongoose from "mongoose";

const { Schema, model } = mongoose;

// Daily nutrition tracking model for users
const dailyNutritionSchema = new Schema(
	{
		userId: {
			type: mongoose.Schema.Types.ObjectId,
			ref: "DindinUser",
			required: true,
		},
		date: {
			type: Date,
			required: true,
			// Store as start of day for consistent querying
		},
		// Daily totals
		totalCalories: {
			type: Number,
			default: 0,
			min: 0,
		},
		totalProtein: {
			type: Number,
			default: 0,
			min: 0,
		},
		totalCarbohydrates: {
			type: Number,
			default: 0,
			min: 0,
		},
		totalFat: {
			type: Number,
			default: 0,
			min: 0,
		},
		totalFiber: {
			type: Number,
			default: 0,
			min: 0,
		},
		totalSugar: {
			type: Number,
			default: 0,
			min: 0,
		},
		totalSodium: {
			type: Number,
			default: 0,
			min: 0,
		},
		// Meals consumed today
		meals: [
			{
				mealType: {
					type: String,
					enum: ["breakfast", "lunch", "dinner", "snack"],
					required: true,
				},
				recipeId: {
					type: mongoose.Schema.Types.ObjectId,
					ref: "Recipe",
					required: true,
				},
				servings: {
					type: Number,
					required: true,
					min: 0.1,
					default: 1,
				},
				consumedAt: {
					type: Date,
					default: Date.now,
				},
				// Nutrition for this meal (cached for performance)
				nutrition: {
					calories: Number,
					protein: Number,
					carbohydrates: Number,
					fat: Number,
					fiber: Number,
					sugar: Number,
					sodium: Number,
				},
			},
		],
		// Water intake tracking
		waterIntake: {
			type: Number,
			default: 0,
			min: 0,
			// in ounces
		},
		waterGoal: {
			type: Number,
			default: 64,
			min: 0,
			// in ounces
		},
		// User's daily goals
		goals: {
			calories: {
				type: Number,
				default: 2000,
				min: 800,
				max: 5000,
			},
			protein: {
				type: Number,
				default: 150, // grams
				min: 10,
			},
			carbohydrates: {
				type: Number,
				default: 225, // grams
				min: 20,
			},
			fat: {
				type: Number,
				default: 65, // grams
				min: 10,
			},
			fiber: {
				type: Number,
				default: 25, // grams
				min: 5,
			},
			sodium: {
				type: Number,
				default: 2300, // milligrams
				max: 5000,
			},
		},
		// Tracking metadata
		lastUpdated: {
			type: Date,
			default: Date.now,
		},
		completed: {
			type: Boolean,
			default: false,
		},
	},
	{
		collection: "daily_nutrition",
		timestamps: true,
	},
);

// Indexes for efficient querying
dailyNutritionSchema.index({ userId: 1, date: 1 }, { unique: true });
dailyNutritionSchema.index({ userId: 1, date: -1 });
dailyNutritionSchema.index({ date: 1 });

// Virtual for goal percentages
dailyNutritionSchema.virtual("goalPercentages").get(function () {
	return {
		calories: Math.round((this.totalCalories / this.goals.calories) * 100),
		protein: Math.round((this.totalProtein / this.goals.protein) * 100),
		carbohydrates: Math.round(
			(this.totalCarbohydrates / this.goals.carbohydrates) * 100,
		),
		fat: Math.round((this.totalFat / this.goals.fat) * 100),
		fiber: Math.round((this.totalFiber / this.goals.fiber) * 100),
		sodium: Math.round((this.totalSodium / this.goals.sodium) * 100),
		water: Math.round((this.waterIntake / this.waterGoal) * 100),
	};
});

// Virtual for remaining nutrients to reach goals
dailyNutritionSchema.virtual("remaining").get(function () {
	return {
		calories: Math.max(0, this.goals.calories - this.totalCalories),
		protein: Math.max(0, this.goals.protein - this.totalProtein),
		carbohydrates: Math.max(
			0,
			this.goals.carbohydrates - this.totalCarbohydrates,
		),
		fat: Math.max(0, this.goals.fat - this.totalFat),
		fiber: Math.max(0, this.goals.fiber - this.totalFiber),
		water: Math.max(0, this.waterGoal - this.waterIntake),
	};
});

// Method to add a meal to the day
dailyNutritionSchema.methods.addMeal = function (
	mealType: string,
	recipeId: string,
	servings: number,
	nutrition: any,
) {
	// Add meal to meals array
	this.meals.push({
		mealType,
		recipeId,
		servings,
		nutrition,
		consumedAt: new Date(),
	});

	// Update daily totals
	this.totalCalories += nutrition.calories || 0;
	this.totalProtein += nutrition.protein || 0;
	this.totalCarbohydrates += nutrition.carbohydrates || 0;
	this.totalFat += nutrition.fat || 0;
	this.totalFiber += nutrition.fiber || 0;
	this.totalSugar += nutrition.sugar || 0;
	this.totalSodium += nutrition.sodium || 0;

	this.lastUpdated = new Date();

	return this.save();
};

// Method to remove a meal from the day
dailyNutritionSchema.methods.removeMeal = function (mealId: string) {
	const meal = this.meals.id(mealId);
	if (!meal) return Promise.reject(new Error("Meal not found"));

	// Subtract from daily totals
	this.totalCalories -= meal.nutrition.calories || 0;
	this.totalProtein -= meal.nutrition.protein || 0;
	this.totalCarbohydrates -= meal.nutrition.carbohydrates || 0;
	this.totalFat -= meal.nutrition.fat || 0;
	this.totalFiber -= meal.nutrition.fiber || 0;
	this.totalSugar -= meal.nutrition.sugar || 0;
	this.totalSodium -= meal.nutrition.sodium || 0;

	// Ensure no negative values
	this.totalCalories = Math.max(0, this.totalCalories);
	this.totalProtein = Math.max(0, this.totalProtein);
	this.totalCarbohydrates = Math.max(0, this.totalCarbohydrates);
	this.totalFat = Math.max(0, this.totalFat);
	this.totalFiber = Math.max(0, this.totalFiber);
	this.totalSugar = Math.max(0, this.totalSugar);
	this.totalSodium = Math.max(0, this.totalSodium);

	meal.remove();
	this.lastUpdated = new Date();

	return this.save();
};

// Method to update water intake
dailyNutritionSchema.methods.addWater = function (ounces: number) {
	this.waterIntake += ounces;
	this.lastUpdated = new Date();
	return this.save();
};

// Static method to get nutrition streak
dailyNutritionSchema.statics.getNutritionStreak = async function (
	userId: string,
) {
	const thirtyDaysAgo = new Date();
	thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

	const records = await this.find({
		userId: new mongoose.Types.ObjectId(userId),
		date: { $gte: thirtyDaysAgo },
	}).sort({ date: -1 });

	let currentStreak = 0;
	let maxStreak = 0;
	let tempStreak = 0;

	const today = new Date();
	today.setHours(0, 0, 0, 0);

	for (let i = 0; i < 30; i++) {
		const checkDate = new Date(today);
		checkDate.setDate(checkDate.getDate() - i);

		const dayRecord = records.find(
			(r) => r.date.getTime() === checkDate.getTime(),
		);

		if (dayRecord && dayRecord.completed) {
			if (i === 0 || tempStreak > 0) {
				tempStreak++;
				if (i === 0) currentStreak = tempStreak;
			}
			maxStreak = Math.max(maxStreak, tempStreak);
		} else {
			tempStreak = 0;
		}
	}

	return { currentStreak, maxStreak };
};

// Static method to get weekly nutrition summary
dailyNutritionSchema.statics.getWeeklySummary = async function (
	userId: string,
	startDate?: Date,
) {
	const start = startDate || new Date();
	start.setDate(start.getDate() - 7);
	start.setHours(0, 0, 0, 0);

	const end = new Date(start);
	end.setDate(end.getDate() + 7);

	return this.aggregate([
		{
			$match: {
				userId: new mongoose.Types.ObjectId(userId),
				date: { $gte: start, $lt: end },
			},
		},
		{
			$group: {
				_id: null,
				avgCalories: { $avg: "$totalCalories" },
				avgProtein: { $avg: "$totalProtein" },
				avgCarbs: { $avg: "$totalCarbohydrates" },
				avgFat: { $avg: "$totalFat" },
				avgFiber: { $avg: "$totalFiber" },
				avgWater: { $avg: "$waterIntake" },
				daysTracked: { $sum: 1 },
				daysCompleted: {
					$sum: { $cond: ["$completed", 1, 0] },
				},
			},
		},
		{
			$project: {
				_id: 0,
				avgCalories: { $round: ["$avgCalories", 0] },
				avgProtein: { $round: ["$avgProtein", 1] },
				avgCarbs: { $round: ["$avgCarbs", 1] },
				avgFat: { $round: ["$avgFat", 1] },
				avgFiber: { $round: ["$avgFiber", 1] },
				avgWater: { $round: ["$avgWater", 0] },
				daysTracked: 1,
				daysCompleted: 1,
				completionRate: {
					$round: [
						{
							$multiply: [{ $divide: ["$daysCompleted", "$daysTracked"] }, 100],
						},
						0,
					],
				},
			},
		},
	]);
};

const DailyNutrition = model("DailyNutrition", dailyNutritionSchema);

export { DailyNutrition };
