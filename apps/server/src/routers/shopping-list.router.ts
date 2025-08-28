import { Router } from "express";
import { z } from "zod";
import { authMiddleware } from "../lib/auth-middleware";
import { validateRequest } from "../lib/validation-middleware";
import { ShoppingListService } from "../services/shopping-list.service";
import logger from "../lib/logger";

const router = Router();
const shoppingListService = new ShoppingListService();

// Validation schemas
const createShoppingListSchema = z.object({
	title: z.string().min(1).max(100),
	description: z.string().max(300).optional(),
	mealPlanId: z.string().optional(),
	dateRange: z.object({
		startDate: z.string().datetime(),
		endDate: z.string().datetime(),
	}),
	preferredStores: z
		.array(
			z.object({
				name: z.string(),
				address: z.string().optional(),
				priority: z.number().min(1).max(10),
				categories: z.array(z.string()),
			}),
		)
		.optional(),
	budget: z
		.object({
			planned: z.number().min(0),
			categoryBreakdown: z
				.array(
					z.object({
						category: z.string(),
						planned: z.number().min(0),
					}),
				)
				.optional(),
		})
		.optional(),
	scheduledShoppingDate: z.string().datetime().optional(),
	generationSettings: z
		.object({
			aggregateQuantities: z.boolean().optional(),
			includePantryCheck: z.boolean().optional(),
			addBufferItems: z.boolean().optional(),
			excludeCategories: z.array(z.string()).optional(),
			customInstructions: z.string().optional(),
		})
		.optional(),
});

const addCustomItemSchema = z.object({
	name: z.string().min(1),
	category: z.enum([
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
	]),
	quantity: z.string().min(1),
	unit: z.string().optional(),
	estimatedPrice: z.number().min(0).optional(),
	priority: z.enum(["low", "medium", "high"]).optional(),
	notes: z.string().max(200).optional(),
	substituteOptions: z
		.array(
			z.object({
				name: z.string(),
				notes: z.string().optional(),
			}),
		)
		.optional(),
});

const updateItemSchema = z.object({
	quantity: z.string().optional(),
	unit: z.string().optional(),
	estimatedPrice: z.number().min(0).optional(),
	actualPrice: z.number().min(0).optional(),
	isPurchased: z.boolean().optional(),
	store: z.string().optional(),
	notes: z.string().max(200).optional(),
	priority: z.enum(["low", "medium", "high"]).optional(),
});

const purchaseItemSchema = z.object({
	actualPrice: z.number().min(0).optional(),
	store: z.string().optional(),
});

const shareShoppingListSchema = z.object({
	shareWithUserId: z.string(),
	permission: z.enum(["view", "edit"]).default("view"),
	canPurchase: z.boolean().default(false),
});

const updateSettingsSchema = z.object({
	preferredStores: z
		.array(
			z.object({
				name: z.string(),
				address: z.string().optional(),
				priority: z.number().min(1).max(10),
				categories: z.array(z.string()),
			}),
		)
		.optional(),
	budget: z
		.object({
			planned: z.number().min(0).optional(),
			categoryBreakdown: z
				.array(
					z.object({
						category: z.string(),
						planned: z.number().min(0),
					}),
				)
				.optional(),
		})
		.optional(),
	scheduledShoppingDate: z.string().datetime().optional(),
	reminderSettings: z
		.object({
			enabled: z.boolean(),
			reminderTime: z.number().min(0).max(24), // hours before
		})
		.optional(),
	smartFeatures: z
		.object({
			pantryIntegration: z
				.object({
					enabled: z.boolean(),
				})
				.optional(),
			priceTracking: z
				.object({
					enabled: z.boolean(),
					alertThreshold: z.number().min(0).max(100), // percentage
				})
				.optional(),
		})
		.optional(),
});

const completeSessionSchema = z.object({
	paymentMethod: z.enum(["cash", "card", "mobile", "other"]).optional(),
	notes: z.string().max(500).optional(),
});

// Apply authentication middleware to all routes
router.use(authMiddleware);

// GET /shopping-lists - Get user's shopping lists
router.get("/", async (req, res) => {
	try {
		const userId = req.user.id;
		const { status, mealPlanId, scheduledDate, limit, offset } = req.query;

		const options = {
			status: status as string,
			mealPlanId: mealPlanId as string,
			scheduledDate: scheduledDate
				? new Date(scheduledDate as string)
				: undefined,
			limit: limit ? parseInt(limit as string) : undefined,
			offset: offset ? parseInt(offset as string) : undefined,
		};

		const shoppingLists = await shoppingListService.getUserShoppingLists(
			userId,
			options,
		);
		res.json(shoppingLists);
	} catch (error) {
		res.status(400).json({ error: error.message });
	}
});

// POST /shopping-lists - Create a new shopping list
router.post(
	"/",
	validateRequest(createShoppingListSchema),
	async (req, res) => {
		try {
			const userId = req.user.id;
			const input = {
				...req.body,
				dateRange: {
					startDate: new Date(req.body.dateRange.startDate),
					endDate: new Date(req.body.dateRange.endDate),
				},
				scheduledShoppingDate: req.body.scheduledShoppingDate
					? new Date(req.body.scheduledShoppingDate)
					: undefined,
			};

			const shoppingList = await shoppingListService.createShoppingList(
				userId,
				input,
			);
			res.status(201).json(shoppingList);
		} catch (error) {
			res.status(400).json({ error: error.message });
		}
	},
);

// GET /shopping-lists/templates - Get shopping list templates
router.get("/templates", async (req, res) => {
	try {
		const { category, limit } = req.query;
		const templates = await shoppingListService.getTemplates(
			category as string,
			limit ? parseInt(limit as string) : undefined,
		);
		res.json(templates);
	} catch (error) {
		res.status(400).json({ error: error.message });
	}
});

// GET /shopping-lists/analytics - Get shopping analytics
router.get("/analytics", async (req, res) => {
	try {
		const userId = req.user.id;
		const { startDate, endDate } = req.query;

		let dateRange;
		if (startDate && endDate) {
			dateRange = {
				startDate: new Date(startDate as string),
				endDate: new Date(endDate as string),
			};
		}

		const analytics = await shoppingListService.getShoppingAnalytics(
			userId,
			dateRange,
		);
		res.json(analytics);
	} catch (error) {
		res.status(400).json({ error: error.message });
	}
});

// GET /shopping-lists/:id - Get a specific shopping list
router.get("/:id", async (req, res) => {
	try {
		const userId = req.user.id;
		const { id } = req.params;

		const shoppingList = await shoppingListService.getShoppingList(id, userId);
		res.json(shoppingList);
	} catch (error) {
		res.status(400).json({ error: error.message });
	}
});

// PUT /shopping-lists/:id/settings - Update shopping list settings
router.put(
	"/:id/settings",
	validateRequest(updateSettingsSchema),
	async (req, res) => {
		try {
			const userId = req.user.id;
			const { id } = req.params;
			const settings = {
				...req.body,
				scheduledShoppingDate: req.body.scheduledShoppingDate
					? new Date(req.body.scheduledShoppingDate)
					: undefined,
			};

			const updatedList = await shoppingListService.updateShoppingListSettings(
				userId,
				id,
				settings,
			);
			res.json(updatedList);
		} catch (error) {
			res.status(400).json({ error: error.message });
		}
	},
);

// POST /shopping-lists/:id/items - Add custom item to shopping list
router.post(
	"/:id/items",
	validateRequest(addCustomItemSchema),
	async (req, res) => {
		try {
			const userId = req.user.id;
			const { id } = req.params;

			const updatedList = await shoppingListService.addCustomItem(
				userId,
				id,
				req.body,
			);
			res.json(updatedList);
		} catch (error) {
			res.status(400).json({ error: error.message });
		}
	},
);

// PUT /shopping-lists/:id/items/:itemIndex - Update an item in the shopping list
router.put(
	"/:id/items/:itemIndex",
	validateRequest(updateItemSchema),
	async (req, res) => {
		try {
			const userId = req.user.id;
			const { id, itemIndex } = req.params;
			const index = parseInt(itemIndex);

			if (isNaN(index) || index < 0) {
				return res.status(400).json({ error: "Invalid item index" });
			}

			const updatedList = await shoppingListService.updateShoppingItem(
				userId,
				id,
				index,
				req.body,
			);
			res.json(updatedList);
		} catch (error) {
			res.status(400).json({ error: error.message });
		}
	},
);

// DELETE /shopping-lists/:id/items/:itemIndex - Remove an item from the shopping list
router.delete("/:id/items/:itemIndex", async (req, res) => {
	try {
		const userId = req.user.id;
		const { id, itemIndex } = req.params;
		const index = parseInt(itemIndex);

		if (isNaN(index) || index < 0) {
			return res.status(400).json({ error: "Invalid item index" });
		}

		const updatedList = await shoppingListService.removeShoppingItem(
			userId,
			id,
			index,
		);
		res.json(updatedList);
	} catch (error) {
		res.status(400).json({ error: error.message });
	}
});

// POST /shopping-lists/:id/items/:itemIndex/purchase - Mark an item as purchased
router.post(
	"/:id/items/:itemIndex/purchase",
	validateRequest(purchaseItemSchema),
	async (req, res) => {
		try {
			const userId = req.user.id;
			const { id, itemIndex } = req.params;
			const index = parseInt(itemIndex);
			const { actualPrice, store } = req.body;

			if (isNaN(index) || index < 0) {
				return res.status(400).json({ error: "Invalid item index" });
			}

			const updatedList = await shoppingListService.purchaseItem(
				userId,
				id,
				index,
				actualPrice,
				store,
			);
			res.json(updatedList);
		} catch (error) {
			res.status(400).json({ error: error.message });
		}
	},
);

// POST /shopping-lists/:id/optimize-route - Optimize shopping route
router.post("/:id/optimize-route", async (req, res) => {
	try {
		const userId = req.user.id;
		const { id } = req.params;

		const optimizedRoute = await shoppingListService.optimizeShoppingRoute(
			userId,
			id,
		);
		res.json(optimizedRoute);
	} catch (error) {
		res.status(400).json({ error: error.message });
	}
});

// POST /shopping-lists/:id/share - Share a shopping list
router.post(
	"/:id/share",
	validateRequest(shareShoppingListSchema),
	async (req, res) => {
		try {
			const userId = req.user.id;
			const { id } = req.params;
			const { shareWithUserId, permission, canPurchase } = req.body;

			const sharedList = await shoppingListService.shareShoppingList(
				userId,
				id,
				shareWithUserId,
				permission,
				canPurchase,
			);
			res.json(sharedList);
		} catch (error) {
			res.status(400).json({ error: error.message });
		}
	},
);

// POST /shopping-lists/:id/complete-session - Complete shopping session
router.post(
	"/:id/complete-session",
	validateRequest(completeSessionSchema),
	async (req, res) => {
		try {
			const userId = req.user.id;
			const { id } = req.params;

			const updatedList = await shoppingListService.completeShoppingSesssion(
				userId,
				id,
				req.body,
			);
			res.json(updatedList);
		} catch (error) {
			res.status(400).json({ error: error.message });
		}
	},
);

// POST /shopping-lists/templates/:templateId/duplicate - Duplicate from template
router.post("/templates/:templateId/duplicate", async (req, res) => {
	try {
		const userId = req.user.id;
		const { templateId } = req.params;
		const { title, dateRange, scheduledShoppingDate } = req.body;

		const customizations = {
			title,
			dateRange: dateRange
				? {
						startDate: new Date(dateRange.startDate),
						endDate: new Date(dateRange.endDate),
					}
				: undefined,
			scheduledShoppingDate: scheduledShoppingDate
				? new Date(scheduledShoppingDate)
				: undefined,
		};

		const duplicatedList = await shoppingListService.duplicateFromTemplate(
			userId,
			templateId,
			customizations,
		);
		res.status(201).json(duplicatedList);
	} catch (error) {
		res.status(400).json({ error: error.message });
	}
});

// Error handling middleware
router.use((error: any, req: any, res: any, next: any) => {
	logger.error("Shopping List Router Error:", error);
	res.status(500).json({ error: "Internal server error" });
});

export { router as shoppingListRouter };
