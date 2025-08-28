import { Router } from "express";
import { z } from "zod";
import { authMiddleware } from "../lib/auth-middleware";
import { validateRequest } from "../lib/validation-middleware";
import { MealPlanningService } from "../services/meal-planning.service";
import logger from "../lib/logger";

const router = Router();
const mealPlanningService = new MealPlanningService();

// Validation schemas
const createMealPlanSchema = z.object({
	title: z.string().min(1).max(100),
	description: z.string().max(500).optional(),
	planType: z.enum(["weekly", "monthly", "custom"]),
	startDate: z.string().datetime(),
	endDate: z.string().datetime().optional(),
	templateId: z.string().optional(),
	budgetSettings: z
		.object({
			weeklyBudget: z.number().min(0).optional(),
			monthlyBudget: z.number().min(0).optional(),
			trackSpending: z.boolean().optional(),
		})
		.optional(),
	notifications: z
		.object({
			mealReminders: z
				.object({
					enabled: z.boolean(),
					timing: z.number().min(0).max(120), // minutes before meal
				})
				.optional(),
			prepReminders: z
				.object({
					enabled: z.boolean(),
					timing: z.number().min(0).max(1440), // minutes before prep time
				})
				.optional(),
			shoppingReminders: z
				.object({
					enabled: z.boolean(),
					daysBefore: z.number().min(0).max(7),
				})
				.optional(),
		})
		.optional(),
});

const assignMealSchema = z
	.object({
		mealPlanId: z.string(),
		date: z.string().datetime(),
		mealType: z.enum(["breakfast", "lunch", "dinner", "snack"]),
		recipeId: z.string().optional(),
		customMeal: z
			.object({
				name: z.string(),
				description: z.string().optional(),
				calories: z.number().min(0).optional(),
				notes: z.string().optional(),
			})
			.optional(),
		plannedServings: z.number().min(0.5).max(10).optional(),
		notes: z.string().max(500).optional(),
	})
	.refine((data) => data.recipeId || data.customMeal, {
		message: "Either recipeId or customMeal must be provided",
	});

const updateMealPlanSchema = z.object({
	title: z.string().min(1).max(100).optional(),
	description: z.string().max(500).optional(),
	status: z
		.enum(["draft", "active", "completed", "paused", "archived"])
		.optional(),
	budgetSettings: z
		.object({
			weeklyBudget: z.number().min(0).optional(),
			monthlyBudget: z.number().min(0).optional(),
			trackSpending: z.boolean().optional(),
		})
		.optional(),
	notifications: z
		.object({
			mealReminders: z
				.object({
					enabled: z.boolean(),
					timing: z.number().min(0).max(120),
				})
				.optional(),
			prepReminders: z
				.object({
					enabled: z.boolean(),
					timing: z.number().min(0).max(1440),
				})
				.optional(),
			shoppingReminders: z
				.object({
					enabled: z.boolean(),
					daysBefore: z.number().min(0).max(7),
				})
				.optional(),
		})
		.optional(),
	tags: z.array(z.string()).optional(),
});

const completeMealSchema = z.object({
	mealPlanId: z.string(),
	date: z.string().datetime(),
	mealType: z.enum(["breakfast", "lunch", "dinner", "snack"]),
	rating: z.number().min(1).max(5).optional(),
	notes: z.string().max(1000).optional(),
	modifications: z.array(z.string()).optional(),
});

const shareMealPlanSchema = z.object({
	shareWithUserId: z.string(),
	permission: z.enum(["view", "edit"]).default("view"),
});

const addPrepTaskSchema = z.object({
	date: z.string().datetime(),
	task: z.string().min(1),
	scheduledTime: z.string().datetime().optional(),
	estimatedDuration: z.number().min(0).max(480).optional(), // max 8 hours
	notes: z.string().max(500).optional(),
});

// Apply authentication middleware to all routes
router.use(authMiddleware);

// GET /meal-plans - Get user's meal plans
router.get("/", async (req, res) => {
	try {
		const userId = req.user.id;
		const { status, planType, isTemplate, limit, offset } = req.query;

		const options = {
			status: status as string,
			planType: planType as string,
			isTemplate: isTemplate === "true",
			limit: limit ? parseInt(limit as string) : undefined,
			offset: offset ? parseInt(offset as string) : undefined,
		};

		const mealPlans = await mealPlanningService.getUserMealPlans(
			userId,
			options,
		);
		res.json(mealPlans);
	} catch (error) {
		res.status(400).json({ error: error.message });
	}
});

// POST /meal-plans - Create a new meal plan
router.post("/", validateRequest(createMealPlanSchema), async (req, res) => {
	try {
		const userId = req.user.id;
		const input = {
			...req.body,
			startDate: new Date(req.body.startDate),
			endDate: req.body.endDate ? new Date(req.body.endDate) : undefined,
		};

		const mealPlan = await mealPlanningService.createMealPlan(userId, input);
		res.status(201).json(mealPlan);
	} catch (error) {
		res.status(400).json({ error: error.message });
	}
});

// GET /meal-plans/active - Get active meal plans
router.get("/active", async (req, res) => {
	try {
		const userId = req.user.id;
		const activePlans = await mealPlanningService.getActiveMealPlans(userId);
		res.json(activePlans);
	} catch (error) {
		res.status(400).json({ error: error.message });
	}
});

// GET /meal-plans/templates - Get meal plan templates
router.get("/templates", async (req, res) => {
	try {
		const { category, limit } = req.query;
		const templates = await mealPlanningService.getTemplates(
			category as string,
			limit ? parseInt(limit as string) : undefined,
		);
		res.json(templates);
	} catch (error) {
		res.status(400).json({ error: error.message });
	}
});

// GET /meal-plans/today - Get today's meals
router.get("/today", async (req, res) => {
	try {
		const userId = req.user.id;
		const todaysMeals = await mealPlanningService.getTodaysMeals(userId);
		res.json(todaysMeals);
	} catch (error) {
		res.status(400).json({ error: error.message });
	}
});

// GET /meal-plans/:id - Get a specific meal plan
router.get("/:id", async (req, res) => {
	try {
		const userId = req.user.id;
		const { id } = req.params;

		const mealPlan = await mealPlanningService.getMealPlan(id, userId);
		res.json(mealPlan);
	} catch (error) {
		res.status(400).json({ error: error.message });
	}
});

// PUT /meal-plans/:id - Update a meal plan
router.put("/:id", validateRequest(updateMealPlanSchema), async (req, res) => {
	try {
		const userId = req.user.id;
		const { id } = req.params;

		const updatedPlan = await mealPlanningService.updateMealPlan(
			userId,
			id,
			req.body,
		);
		res.json(updatedPlan);
	} catch (error) {
		res.status(400).json({ error: error.message });
	}
});

// DELETE /meal-plans/:id - Archive a meal plan
router.delete("/:id", async (req, res) => {
	try {
		const userId = req.user.id;
		const { id } = req.params;

		await mealPlanningService.updateMealPlan(userId, id, {
			status: "archived",
		});
		res.status(204).send();
	} catch (error) {
		res.status(400).json({ error: error.message });
	}
});

// POST /meal-plans/:id/duplicate - Duplicate a meal plan
router.post("/:id/duplicate", async (req, res) => {
	try {
		const userId = req.user.id;
		const { id } = req.params;
		const { startDate, title } = req.body;

		if (!startDate) {
			return res.status(400).json({ error: "startDate is required" });
		}

		const duplicatedPlan = await mealPlanningService.duplicateMealPlan(
			userId,
			id,
			new Date(startDate),
			title,
		);
		res.status(201).json(duplicatedPlan);
	} catch (error) {
		res.status(400).json({ error: error.message });
	}
});

// POST /meal-plans/:id/share - Share a meal plan
router.post(
	"/:id/share",
	validateRequest(shareMealPlanSchema),
	async (req, res) => {
		try {
			const userId = req.user.id;
			const { id } = req.params;
			const { shareWithUserId, permission } = req.body;

			const sharedPlan = await mealPlanningService.shareMealPlan(
				userId,
				id,
				shareWithUserId,
				permission,
			);
			res.json(sharedPlan);
		} catch (error) {
			res.status(400).json({ error: error.message });
		}
	},
);

// POST /meal-plans/meals/assign - Assign a meal to a specific slot
router.post(
	"/meals/assign",
	validateRequest(assignMealSchema),
	async (req, res) => {
		try {
			const userId = req.user.id;
			const input = {
				...req.body,
				date: new Date(req.body.date),
			};

			const updatedPlan = await mealPlanningService.assignMeal(userId, input);
			res.json(updatedPlan);
		} catch (error) {
			res.status(400).json({ error: error.message });
		}
	},
);

// DELETE /meal-plans/:id/meals/:date/:mealType - Remove a meal assignment
router.delete("/:id/meals/:date/:mealType", async (req, res) => {
	try {
		const userId = req.user.id;
		const { id, date, mealType } = req.params;
		const { snackIndex } = req.query;

		const updatedPlan = await mealPlanningService.removeMeal(
			userId,
			id,
			new Date(date),
			mealType,
			snackIndex ? parseInt(snackIndex as string) : undefined,
		);
		res.json(updatedPlan);
	} catch (error) {
		res.status(400).json({ error: error.message });
	}
});

// POST /meal-plans/meals/complete - Mark a meal as completed
router.post(
	"/meals/complete",
	validateRequest(completeMealSchema),
	async (req, res) => {
		try {
			const userId = req.user.id;
			const { mealPlanId, date, mealType, rating, notes, modifications } =
				req.body;

			const updatedPlan = await mealPlanningService.completeMeal(
				userId,
				mealPlanId,
				new Date(date),
				mealType,
				rating,
				notes,
				modifications,
			);
			res.json(updatedPlan);
		} catch (error) {
			res.status(400).json({ error: error.message });
		}
	},
);

// POST /meal-plans/:id/prep-tasks - Add a meal prep task
router.post(
	"/:id/prep-tasks",
	validateRequest(addPrepTaskSchema),
	async (req, res) => {
		try {
			const userId = req.user.id;
			const { id } = req.params;
			const taskData = {
				...req.body,
				date: new Date(req.body.date),
				scheduledTime: req.body.scheduledTime
					? new Date(req.body.scheduledTime)
					: undefined,
			};

			const updatedPlan = await mealPlanningService.addMealPrepTask(
				userId,
				id,
				taskData.date,
				taskData,
			);
			res.json(updatedPlan);
		} catch (error) {
			res.status(400).json({ error: error.message });
		}
	},
);

// GET /meal-plans/:id/shopping-list - Generate shopping list from meal plan
router.get("/:id/shopping-list", async (req, res) => {
	try {
		const userId = req.user.id;
		const { id } = req.params;
		const {
			aggregateQuantities,
			includePantryCheck,
			addBufferItems,
			excludeCategories,
		} = req.query;

		const options = {
			aggregateQuantities: aggregateQuantities !== "false",
			includePantryCheck: includePantryCheck !== "false",
			addBufferItems: addBufferItems === "true",
			excludeCategories: excludeCategories
				? (excludeCategories as string).split(",")
				: [],
		};

		const shoppingList = await mealPlanningService.generateShoppingList(
			userId,
			id,
			options,
		);
		res.json(shoppingList);
	} catch (error) {
		res.status(400).json({ error: error.message });
	}
});

// GET /meal-plans/:id/nutrition - Get nutritional overview for meal plan
router.get("/:id/nutrition", async (req, res) => {
	try {
		const userId = req.user.id;
		const { id } = req.params;

		// Verify user has access to this meal plan
		await mealPlanningService.getMealPlan(id, userId);

		const nutritionalOverview =
			await mealPlanningService.calculateNutritionalOverview(id);
		res.json(nutritionalOverview);
	} catch (error) {
		res.status(400).json({ error: error.message });
	}
});

// Error handling middleware
router.use((error: any, req: any, res: any, next: any) => {
	logger.error("Meal Planning Router Error:", error);
	res.status(500).json({ error: "Internal server error" });
});

export { router as mealPlanningRouter };
