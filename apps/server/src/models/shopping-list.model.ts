import mongoose from "mongoose";

const { Schema, model } = mongoose;

// Shopping list item schema
const shoppingItemSchema = new Schema(
	{
		name: {
			type: String,
			required: true,
			trim: true,
		},
		category: {
			type: String,
			enum: [
				"produce",
				"meat-seafood",
				"dairy-eggs",
				"pantry",
				"spices-seasonings",
				"frozen",
				"bakery",
				"beverages",
				"snacks",
				"household",
				"other",
			],
			default: "other",
		},
		quantity: {
			type: String,
			required: true,
			trim: true,
		},
		unit: {
			type: String,
			trim: true,
		},
		estimatedPrice: {
			type: Number,
			min: 0,
		},
		actualPrice: {
			type: Number,
			min: 0,
		},
		isPurchased: {
			type: Boolean,
			default: false,
		},
		purchasedAt: {
			type: Date,
		},
		store: {
			type: String,
			trim: true,
		},
		notes: {
			type: String,
			trim: true,
			maxlength: 200,
		},
		priority: {
			type: String,
			enum: ["low", "medium", "high"],
			default: "medium",
		},
		// Recipe associations for this ingredient
		recipeAssociations: [
			{
				recipeId: {
					type: mongoose.Schema.Types.ObjectId,
					ref: "Recipe",
				},
				recipeName: String,
				mealDate: Date,
				servings: Number,
			},
		],
		// Aggregation info when combining similar items
		aggregatedFrom: [
			{
				originalQuantity: String,
				originalUnit: String,
				recipeId: {
					type: mongoose.Schema.Types.ObjectId,
					ref: "Recipe",
				},
			},
		],
		isCustomItem: {
			type: Boolean,
			default: false,
		},
		substituteOptions: [
			{
				name: String,
				notes: String,
			},
		],
	},
	{
		_id: false,
	},
);

// Shopping list schema
const shoppingListSchema = new Schema(
	{
		userId: {
			type: mongoose.Schema.Types.ObjectId,
			ref: "DindinUser",
			required: true,
		},
		partnerId: {
			type: mongoose.Schema.Types.ObjectId,
			ref: "DindinUser",
		},
		title: {
			type: String,
			required: true,
			trim: true,
			maxlength: 100,
		},
		description: {
			type: String,
			trim: true,
			maxlength: 300,
		},

		// Meal plan associations
		mealPlanId: {
			type: mongoose.Schema.Types.ObjectId,
			ref: "MealPlan",
		},
		dateRange: {
			startDate: {
				type: Date,
				required: true,
			},
			endDate: {
				type: Date,
				required: true,
			},
		},

		// Shopping list items organized by category
		items: [shoppingItemSchema],

		// Store and shopping preferences
		preferredStores: [
			{
				name: {
					type: String,
					required: true,
				},
				address: String,
				priority: {
					type: Number,
					min: 1,
					max: 10,
					default: 1,
				},
				categories: [
					{
						type: String,
						enum: [
							"produce",
							"meat-seafood",
							"dairy-eggs",
							"pantry",
							"spices-seasonings",
							"frozen",
							"bakery",
							"beverages",
							"snacks",
							"household",
						],
					},
				],
			},
		],

		shoppingRoute: {
			optimized: {
				type: Boolean,
				default: false,
			},
			storeOrder: [
				{
					storeName: String,
					categories: [String],
					estimatedTime: Number, // minutes
				},
			],
			totalEstimatedTime: Number, // minutes
		},

		// Budget tracking
		budget: {
			planned: {
				type: Number,
				min: 0,
			},
			actual: {
				type: Number,
				min: 0,
				default: 0,
			},
			categoryBreakdown: [
				{
					category: String,
					planned: Number,
					actual: {
						type: Number,
						default: 0,
					},
				},
			],
		},

		// Shopping session tracking
		shoppingSessions: [
			{
				startedAt: {
					type: Date,
					default: Date.now,
				},
				completedAt: Date,
				store: String,
				itemsPurchased: Number,
				totalSpent: Number,
				paymentMethod: {
					type: String,
					enum: ["cash", "card", "mobile", "other"],
				},
				notes: String,
			},
		],

		// Sharing and collaboration
		isShared: {
			type: Boolean,
			default: false,
		},
		sharedWith: [
			{
				userId: {
					type: mongoose.Schema.Types.ObjectId,
					ref: "DindinUser",
				},
				permission: {
					type: String,
					enum: ["view", "edit"],
					default: "view",
				},
				canPurchase: {
					type: Boolean,
					default: false,
				},
				sharedAt: {
					type: Date,
					default: Date.now,
				},
			},
		],

		// Smart features
		smartFeatures: {
			pantryIntegration: {
				enabled: {
					type: Boolean,
					default: false,
				},
				lastSyncAt: Date,
			},
			priceTracking: {
				enabled: {
					type: Boolean,
					default: true,
				},
				alertThreshold: {
					type: Number, // percentage increase
					default: 20,
				},
			},
			substitutesSuggested: {
				type: Boolean,
				default: false,
			},
		},

		// Generation settings and metadata
		generationSettings: {
			aggregateQuantities: {
				type: Boolean,
				default: true,
			},
			includePantryCheck: {
				type: Boolean,
				default: true,
			},
			addBufferItems: {
				type: Boolean,
				default: false,
			},
			excludeCategories: [String],
			customInstructions: String,
		},

		// Analytics and insights
		analytics: {
			completionRate: {
				type: Number,
				default: 0,
				min: 0,
				max: 100,
			},
			averageItemPrice: Number,
			mostExpensiveItem: String,
			frequentlyForgottenItems: [String],
			shoppingEfficiency: Number, // time spent vs. items purchased
		},

		// Status and workflow
		status: {
			type: String,
			enum: ["draft", "ready", "in-progress", "completed", "archived"],
			default: "draft",
		},
		isTemplate: {
			type: Boolean,
			default: false,
		},
		templateCategory: {
			type: String,
			enum: [
				"weekly-essentials",
				"monthly-bulk",
				"special-occasion",
				"dietary-specific",
				"budget-friendly",
			],
		},
		tags: [
			{
				type: String,
				lowercase: true,
				trim: true,
			},
		],

		// Scheduling
		scheduledShoppingDate: {
			type: Date,
		},
		reminderSettings: {
			enabled: {
				type: Boolean,
				default: true,
			},
			reminderTime: {
				type: Number, // hours before scheduled date
				default: 2,
			},
		},
	},
	{
		collection: "shopping_lists",
		timestamps: true,
	},
);

// Indexes for efficient querying
shoppingListSchema.index({ userId: 1, createdAt: -1 });
shoppingListSchema.index({ mealPlanId: 1 });
shoppingListSchema.index({ status: 1, scheduledShoppingDate: 1 });
shoppingListSchema.index({ partnerId: 1, isShared: 1 });
shoppingListSchema.index({ isTemplate: 1, templateCategory: 1 });

// Compound indexes
shoppingListSchema.index({ userId: 1, status: 1, scheduledShoppingDate: 1 });
shoppingListSchema.index({ "dateRange.startDate": 1, "dateRange.endDate": 1 });

// Virtual for total items count
shoppingListSchema.virtual("totalItems").get(function () {
	return this.items ? this.items.length : 0;
});

// Virtual for purchased items count
shoppingListSchema.virtual("purchasedItems").get(function () {
	return this.items
		? this.items.filter((item: any) => item.isPurchased).length
		: 0;
});

// Virtual for completion percentage
shoppingListSchema.virtual("completionPercentage").get(function () {
	if (!this.items || this.items.length === 0) return 0;
	const purchased = this.items.filter((item: any) => item.isPurchased).length;
	return Math.round((purchased / this.items.length) * 100);
});

// Virtual for estimated total cost
shoppingListSchema.virtual("estimatedTotal").get(function () {
	if (!this.items) return 0;
	return this.items.reduce((total: number, item: any) => {
		return total + (item.estimatedPrice || 0);
	}, 0);
});

// Method to mark item as purchased
shoppingListSchema.methods.purchaseItem = function (
	itemIndex: number,
	actualPrice?: number,
	store?: string,
) {
	if (this.items && this.items[itemIndex]) {
		this.items[itemIndex].isPurchased = true;
		this.items[itemIndex].purchasedAt = new Date();
		if (actualPrice !== undefined) {
			this.items[itemIndex].actualPrice = actualPrice;
		}
		if (store) {
			this.items[itemIndex].store = store;
		}

		// Update budget actual if price provided
		if (actualPrice !== undefined) {
			this.budget.actual = (this.budget.actual || 0) + actualPrice;
		}

		// Update completion rate
		this.analytics.completionRate = this.completionPercentage;
	}
};

// Method to add custom item
shoppingListSchema.methods.addCustomItem = function (itemData: any) {
	const customItem = {
		...itemData,
		isCustomItem: true,
		recipeAssociations: [],
		aggregatedFrom: [],
	};

	this.items.push(customItem);
};

// Method to optimize shopping route
shoppingListSchema.methods.optimizeShoppingRoute = function () {
	if (!this.preferredStores || this.preferredStores.length === 0) {
		return false;
	}

	const storeRoute: any[] = [];
	const itemsByCategory = this.items.reduce((acc: any, item: any) => {
		if (!acc[item.category]) {
			acc[item.category] = [];
		}
		acc[item.category].push(item);
		return acc;
	}, {});

	// Create optimized route based on store categories and priorities
	this.preferredStores
		.sort((a: any, b: any) => a.priority - b.priority)
		.forEach((store: any) => {
			const storeCategories = store.categories.filter(
				(cat: string) => itemsByCategory[cat],
			);
			if (storeCategories.length > 0) {
				storeRoute.push({
					storeName: store.name,
					categories: storeCategories,
					estimatedTime: storeCategories.length * 5, // 5 minutes per category
				});
			}
		});

	this.shoppingRoute = {
		optimized: true,
		storeOrder: storeRoute,
		totalEstimatedTime: storeRoute.reduce(
			(total: number, store: any) => total + store.estimatedTime,
			0,
		),
	};

	return true;
};

// Static method to generate shopping list from meal plan
shoppingListSchema.statics.generateFromMealPlan = async function (
	mealPlanId: string,
	userId: string,
	options: any = {},
) {
	const MealPlan = model("MealPlan");
	const Recipe = model("Recipe");

	const mealPlan = await MealPlan.findById(mealPlanId).populate(
		"dailyPlans.meals.breakfast.recipeId dailyPlans.meals.lunch.recipeId dailyPlans.meals.dinner.recipeId dailyPlans.meals.snacks.recipeId",
	);

	if (!mealPlan) {
		throw new Error("Meal plan not found");
	}

	const ingredientMap = new Map();
	const recipeAssociations = new Map();

	// Process each day's meals
	for (const dayPlan of mealPlan.dailyPlans) {
		const date = dayPlan.date;

		// Process each meal type
		const mealsToProcess = [
			{ meal: dayPlan.meals.breakfast, type: "breakfast" },
			{ meal: dayPlan.meals.lunch, type: "lunch" },
			{ meal: dayPlan.meals.dinner, type: "dinner" },
			...dayPlan.meals.snacks.map((snack: any, index: number) => ({
				meal: snack,
				type: `snack-${index}`,
			})),
		];

		for (const { meal, type } of mealsToProcess) {
			if (meal && meal.recipeId) {
				const recipe = await Recipe.findById(meal.recipeId);
				if (recipe) {
					// Process ingredients
					recipe.ingredients.forEach((ingredient: any) => {
						const key = `${ingredient.name.toLowerCase()}-${ingredient.unit || "unit"}`;
						const servingMultiplier =
							(meal.plannedServings || 1) / (recipe.servings || 1);

						if (ingredientMap.has(key)) {
							const existing = ingredientMap.get(key);
							// Aggregate quantities (simplified - would need proper unit conversion)
							existing.aggregatedFrom.push({
								originalQuantity: ingredient.amount,
								originalUnit: ingredient.unit,
								recipeId: recipe._id,
							});
						} else {
							ingredientMap.set(key, {
								name: ingredient.name,
								quantity: ingredient.amount,
								unit: ingredient.unit,
								category: this.categorizeIngredient(ingredient.name),
								recipeAssociations: [
									{
										recipeId: recipe._id,
										recipeName: recipe.title,
										mealDate: date,
										servings: meal.plannedServings || 1,
									},
								],
								aggregatedFrom: [],
								isCustomItem: false,
							});
						}

						// Track recipe associations
						const associationKey = `${ingredient.name.toLowerCase()}-${recipe._id}`;
						if (!recipeAssociations.has(associationKey)) {
							recipeAssociations.set(associationKey, {
								recipeId: recipe._id,
								recipeName: recipe.title,
								mealDate: date,
								servings: meal.plannedServings || 1,
							});
						}
					});
				}
			}
		}
	}

	// Create shopping list
	const shoppingListData = {
		userId: new mongoose.Types.ObjectId(userId),
		partnerId: mealPlan.partnerId,
		title: `Shopping List - ${mealPlan.title}`,
		description: `Generated from meal plan: ${mealPlan.title}`,
		mealPlanId: new mongoose.Types.ObjectId(mealPlanId),
		dateRange: {
			startDate: mealPlan.startDate,
			endDate: mealPlan.endDate,
		},
		items: Array.from(ingredientMap.values()),
		generationSettings: {
			aggregateQuantities: options.aggregateQuantities !== false,
			includePantryCheck: options.includePantryCheck !== false,
			addBufferItems: options.addBufferItems || false,
			excludeCategories: options.excludeCategories || [],
			customInstructions: options.customInstructions || "",
		},
		status: "ready",
	};

	return this.create(shoppingListData);
};

// Helper method to categorize ingredients
shoppingListSchema.statics.categorizeIngredient = (
	ingredientName: string,
): string => {
	const name = ingredientName.toLowerCase();

	// Produce
	if (
		/\b(apple|banana|orange|lettuce|tomato|onion|garlic|carrot|potato|spinach|broccoli|bell pepper|cucumber|mushroom|avocado)\b/.test(
			name,
		)
	) {
		return "produce";
	}

	// Meat & Seafood
	if (
		/\b(chicken|beef|pork|fish|salmon|shrimp|turkey|ham|bacon|sausage)\b/.test(
			name,
		)
	) {
		return "meat-seafood";
	}

	// Dairy & Eggs
	if (
		/\b(milk|cheese|yogurt|butter|cream|egg|sour cream|cottage cheese)\b/.test(
			name,
		)
	) {
		return "dairy-eggs";
	}

	// Pantry
	if (
		/\b(rice|pasta|bread|flour|sugar|oil|vinegar|pasta|beans|lentils|quinoa|oats)\b/.test(
			name,
		)
	) {
		return "pantry";
	}

	// Spices & Seasonings
	if (
		/\b(salt|pepper|paprika|cumin|oregano|basil|thyme|rosemary|cinnamon|vanilla)\b/.test(
			name,
		)
	) {
		return "spices-seasonings";
	}

	// Frozen
	if (/\b(frozen|ice cream)\b/.test(name)) {
		return "frozen";
	}

	// Default
	return "other";
};

const ShoppingList = model("ShoppingList", shoppingListSchema);

export { ShoppingList };
