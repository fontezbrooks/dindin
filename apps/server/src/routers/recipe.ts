import { TRPCError } from "@trpc/server";
import { z } from "zod";
import { DindinUser, Match, Recipe } from "../db";
import { protectedProcedure, publicProcedure, router } from "../lib/trpc";
import { MatchService } from "../services/match-service";
import { getWebSocketServer } from "../websocket-enhanced";

export const recipeRouter = router({
	getRecipeStack: protectedProcedure
		.input(
			z.object({
				limit: z.number().min(1).max(50).default(10),
			}),
		)
		.query(async ({ ctx, input }) => {
			// Get or create the authenticated user's profile
			let user = await DindinUser.findOne({ authUserId: ctx.session.user.id });

			if (!user) {
				// Auto-create profile for authenticated user
				user = await DindinUser.create({
					authUserId: ctx.session.user.id,
					name: ctx.session.user.name || "User",
					email: ctx.session.user.email,
					likedRecipes: [],
					dislikedRecipes: [],
					cookedRecipes: [],
					dietaryRestrictions: [],
					allergies: [],
					cookingSkill: "beginner",
					preferences: {
						maxCookTime: 60,
						preferredCuisines: [],
						ingredientsToAvoid: [],
						spiceLevel: "medium",
					},
					settings: {
						notifications: {
							newMatches: true,
							partnerActivity: true,
							weeklyReport: false,
						},
						privacy: {
							shareProfile: true,
							showCookingHistory: true,
						},
					},
					stats: {
						totalSwipes: 0,
						totalMatches: 0,
						recipesCooked: 0,
					},
				});
			}

			// Get all recipes the user has already seen (liked or disliked)
			const seenRecipeIds = [...user.likedRecipes, ...user.dislikedRecipes];

			// Find active recipes the user hasn't seen yet
			const recipes = await Recipe.find({
				_id: { $nin: seenRecipeIds },
				isActive: true,
			})
				.limit(input.limit)
				.lean();

			return recipes;
		}),

	likeRecipe: protectedProcedure
		.input(
			z.object({
				recipeId: z.string(),
				isLike: z.boolean(),
			}),
		)
		.mutation(async ({ ctx, input }) => {
			// Get or create the authenticated user's profile
			let user = await DindinUser.findOne({ authUserId: ctx.session.user.id });

			if (!user) {
				// Auto-create profile for authenticated user
				user = await DindinUser.create({
					authUserId: ctx.session.user.id,
					name: ctx.session.user.name || "User",
					email: ctx.session.user.email,
					likedRecipes: [],
					dislikedRecipes: [],
					cookedRecipes: [],
					dietaryRestrictions: [],
					allergies: [],
					cookingSkill: "beginner",
					preferences: {
						maxCookTime: 60,
						preferredCuisines: [],
						ingredientsToAvoid: [],
						spiceLevel: "medium",
					},
					settings: {
						notifications: {
							newMatches: true,
							partnerActivity: true,
							weeklyReport: false,
						},
						privacy: {
							shareProfile: true,
							showCookingHistory: true,
						},
					},
					stats: {
						totalSwipes: 0,
						totalMatches: 0,
						recipesCooked: 0,
					},
				});
			}

			// Check if recipe exists
			const recipe = await Recipe.findById(input.recipeId);
			if (!recipe) {
				throw new TRPCError({
					code: "NOT_FOUND",
					message: "Recipe not found",
				});
			}

			// Check if user can swipe this recipe
			const canSwipe = await user.canSwipeRecipe(input.recipeId);
			if (!canSwipe) {
				throw new TRPCError({
					code: "BAD_REQUEST",
					message: "Recipe already swiped",
				});
			}

			// Update user's liked or disliked recipes
			if (input.isLike) {
				user.likedRecipes.push(recipe._id);

				// Check if user has a partner
				if (user.partnerId) {
					// Notify partner that user is swiping (real-time activity)
					const wsServer = getWebSocketServer();
					if (wsServer) {
						wsServer.sendToUser(user.partnerId.toString(), {
							type: "partnerSwiping",
							payload: {
								userId: user._id.toString(),
								userName: user.name,
								recipeId: input.recipeId,
								recipeTitle: recipe.title,
								action: "liked",
							},
						});
					}

					// Check for match using MatchService
					const isMatch = await MatchService.checkForMatch(
						user._id,
						user.partnerId,
						recipe._id,
					);

					if (isMatch) {
						// Create match with all notifications
						const match = await MatchService.createMatch(
							user._id,
							user.partnerId,
							recipe._id,
						);

						// Save user and return match information
						await user.save();

						return {
							success: true,
							matched: true,
							matchId: match._id.toString(),
							recipe: {
								id: recipe._id.toString(),
								title: recipe.title,
								imageUrl: recipe.imageUrl,
								cookTime: recipe.cook_time,
								difficulty: recipe.difficulty,
								cuisine: recipe.cuisine,
							},
						};
					}
				}
			} else {
				user.dislikedRecipes.push(recipe._id);

				// Notify partner about dislike if connected
				if (user.partnerId) {
					const wsServer = getWebSocketServer();
					if (wsServer) {
						wsServer.sendToUser(user.partnerId.toString(), {
							type: "partnerSwiping",
							payload: {
								userId: user._id.toString(),
								userName: user.name,
								recipeId: input.recipeId,
								action: "passed",
							},
						});
					}
				}
			}

			// Update user stats
			user.stats.totalSwipes += 1;
			await user.save();

			return {
				success: true,
				matched: false,
			};
		}),

	getMatches: protectedProcedure
		.input(
			z.object({
				status: z
					.enum([
						"pending",
						"matched",
						"scheduled",
						"cooked",
						"archived",
						"expired",
					])
					.optional(),
				limit: z.number().min(1).max(100).default(20),
				offset: z.number().min(0).default(0),
			}),
		)
		.query(async ({ ctx, input }) => {
			// Get the authenticated user's profile
			const user = await DindinUser.findOne({
				authUserId: ctx.session.user.id,
			});

			if (!user) {
				throw new TRPCError({
					code: "NOT_FOUND",
					message: "User profile not found",
				});
			}

			// Build query
			const query: any = { users: user._id };
			if (input.status) {
				query.status = input.status;
			}

			// Get matches with populated recipe data
			const matches = await Match.find(query)
				.populate("recipeId")
				.populate("users", "name email")
				.sort("-matchedAt")
				.skip(input.offset)
				.limit(input.limit)
				.lean();

			// Get total count for pagination
			const total = await Match.countDocuments(query);

			return {
				matches,
				total,
				hasMore: input.offset + matches.length < total,
			};
		}),

	getRecipeById: protectedProcedure
		.input(z.object({ id: z.string() }))
		.query(async ({ input }) => {
			const recipe = await Recipe.findById(input.id).lean();

			if (!recipe) {
				throw new TRPCError({
					code: "NOT_FOUND",
					message: "Recipe not found",
				});
			}

			return recipe;
		}),

	searchRecipes: protectedProcedure
		.input(
			z.object({
				query: z.string().optional(),
				cuisine: z.string().optional(),
				difficulty: z.enum(["easy", "medium", "hard"]).optional(),
				maxCookTime: z.number().optional(),
				tags: z.array(z.string()).optional(),
				limit: z.number().min(1).max(50).default(20),
				offset: z.number().min(0).default(0),
			}),
		)
		.query(async ({ input }) => {
			// Build search query
			const searchQuery: any = {};

			if (input.query) {
				searchQuery.$text = { $search: input.query };
			}

			if (input.cuisine) {
				searchQuery.cuisine = input.cuisine;
			}

			if (input.difficulty) {
				searchQuery.difficulty = input.difficulty;
			}

			if (input.maxCookTime) {
				searchQuery.cook_time = { $lte: input.maxCookTime };
			}

			if (input.tags && input.tags.length > 0) {
				searchQuery.tags = { $in: input.tags };
			}

			// Execute search
			const recipes = await Recipe.find(searchQuery)
				.skip(input.offset)
				.limit(input.limit)
				.lean();

			const total = await Recipe.countDocuments(searchQuery);

			return {
				recipes,
				total,
				hasMore: input.offset + recipes.length < total,
			};
		}),

	// Enhanced browse all recipes endpoint
	browseAllRecipes: publicProcedure
		.input(
			z.object({
				query: z.string().optional(),
				category: z.string().optional(),
				cuisine: z.string().optional(),
				difficulty: z.enum(["easy", "medium", "hard"]).optional(),
				maxCookTime: z.number().optional(),
				dietaryRestrictions: z.array(z.string()).optional(),
				sortBy: z
					.enum(["popularity", "rating", "newest", "cookTime"])
					.default("popularity"),
				limit: z.number().min(1).max(50).default(20),
				offset: z.number().min(0).default(0),
			}),
		)
		.query(async ({ input }) => {
			// Build search query
			const searchQuery: any = { isActive: true };

			// Text search across title, description, and ingredients
			if (input.query) {
				searchQuery.$or = [
					{ title: { $regex: input.query, $options: "i" } },
					{ description: { $regex: input.query, $options: "i" } },
					{ "ingredients.name": { $regex: input.query, $options: "i" } },
					{ tags: { $in: [new RegExp(input.query, "i")] } },
				];
			}

			// Filter by category
			if (input.category && input.category !== "All") {
				searchQuery.category = input.category;
			}

			// Filter by cuisine
			if (input.cuisine && input.cuisine !== "All") {
				searchQuery.cuisine = { $regex: input.cuisine, $options: "i" };
			}

			// Filter by difficulty
			if (input.difficulty) {
				searchQuery.difficulty = input.difficulty;
			}

			// Filter by cook time
			if (input.maxCookTime) {
				searchQuery.cook_time = { $lte: input.maxCookTime };
			}

			// Filter by dietary restrictions
			if (input.dietaryRestrictions && input.dietaryRestrictions.length > 0) {
				searchQuery.tags = {
					$in: input.dietaryRestrictions.map((diet) => new RegExp(diet, "i")),
				};
			}

			// Build sort options
			let sortOptions: any = {};
			switch (input.sortBy) {
				case "popularity":
					sortOptions = { viewCount: -1, createdAt: -1 };
					break;
				case "rating":
					sortOptions = { averageRating: -1, reviewCount: -1 };
					break;
				case "newest":
					sortOptions = { createdAt: -1 };
					break;
				case "cookTime":
					sortOptions = { cook_time: 1 };
					break;
				default:
					sortOptions = { createdAt: -1 };
			}

			// Execute search with aggregation for better performance
			const recipes = await Recipe.aggregate([
				{ $match: searchQuery },
				{
					$addFields: {
						// Add computed fields for sorting
						averageRating: { $ifNull: ["$rating", 0] },
						reviewCount: { $ifNull: ["$reviews", 0] },
						viewCount: { $ifNull: ["$views", 0] },
					},
				},
				{ $sort: sortOptions },
				{ $skip: input.offset },
				{ $limit: input.limit },
				{
					$project: {
						_id: 1,
						title: 1,
						description: 1,
						imageUrl: 1,
						image_url: 1,
						cookTime: { $ifNull: ["$cook_time", "$cookTime"] },
						cook_time: 1,
						difficulty: 1,
						cuisine: 1,
						category: 1,
						tags: 1,
						ingredients: 1,
						instructions: 1,
						steps: 1,
						averageRating: 1,
						reviewCount: 1,
						createdAt: 1,
						updatedAt: 1,
					},
				},
			]);

			// Get total count for pagination
			const totalCount = await Recipe.countDocuments(searchQuery);

			// Format recipes for consistent response
			const formattedRecipes = recipes.map((recipe) => ({
				...recipe,
				id: recipe._id.toString(),
				imageUrl: recipe.image_url || recipe.imageUrl,
				cookTime: recipe.cook_time || recipe.cookTime || 0,
				rating: recipe.averageRating || 0,
				reviewCount: recipe.reviewCount || 0,
			}));

			return {
				recipes: formattedRecipes,
				total: totalCount,
				hasMore: input.offset + recipes.length < totalCount,
				offset: input.offset,
				limit: input.limit,
			};
		}),

	// Get recipe suggestions for search autocomplete
	getRecipeSuggestions: publicProcedure
		.input(
			z.object({
				query: z.string().min(1),
				limit: z.number().min(1).max(10).default(5),
			}),
		)
		.query(async ({ input }) => {
			if (input.query.length < 2) return { suggestions: [] };

			// Get title suggestions
			const titleSuggestions = await Recipe.find(
				{
					title: { $regex: input.query, $options: "i" },
					isActive: true,
				},
				{ title: 1 },
			)
				.limit(input.limit)
				.lean();

			// Get ingredient suggestions
			const ingredientSuggestions = await Recipe.aggregate([
				{ $match: { isActive: true } },
				{ $unwind: "$ingredients" },
				{
					$match: {
						"ingredients.name": { $regex: input.query, $options: "i" },
					},
				},
				{
					$group: {
						_id: "$ingredients.name",
						count: { $sum: 1 },
					},
				},
				{ $sort: { count: -1 } },
				{ $limit: 3 },
			]);

			const suggestions = [
				...titleSuggestions.map((r) => r.title),
				...ingredientSuggestions.map((i) => i._id),
			].slice(0, input.limit);

			return { suggestions };
		}),

	getUserFavorites: protectedProcedure
		.input(
			z.object({
				limit: z.number().min(1).max(50).default(20),
				offset: z.number().min(0).default(0),
				sortBy: z
					.enum(["newest", "oldest", "alphabetical", "cookTime"])
					.optional(),
				filterBy: z
					.object({
						cuisine: z.string().optional(),
						difficulty: z.enum(["easy", "medium", "hard"]).optional(),
						maxCookTime: z.number().optional(),
						tags: z.array(z.string()).optional(),
					})
					.optional(),
			}),
		)
		.query(async ({ input, ctx }) => {
			// Get user from context or session
			const userId = ctx.session.user.id;
			if (!userId) {
				throw new TRPCError({
					code: "UNAUTHORIZED",
					message: "User not authenticated",
				});
			}

			// Find user with populated liked recipes
			const user = await DindinUser.findOne({ authUserId: userId })
				.populate({
					path: "likedRecipes",
					model: Recipe,
					options: {
						skip: input.offset,
						limit: input.limit,
					},
				})
				.lean();

			if (!user) {
				throw new TRPCError({
					code: "NOT_FOUND",
					message: "User not found",
				});
			}

			// Apply filters if provided
			let favorites = user.likedRecipes || [];

			if (input.filterBy) {
				if (input.filterBy.cuisine) {
					favorites = favorites.filter(
						(recipe) => recipe.cuisine === input.filterBy.cuisine,
					);
				}
				if (input.filterBy.difficulty) {
					favorites = favorites.filter(
						(recipe) => recipe.difficulty === input.filterBy.difficulty,
					);
				}
				if (input.filterBy.maxCookTime) {
					favorites = favorites.filter(
						(recipe) => recipe.cook_time <= input.filterBy.maxCookTime,
					);
				}
				if (input.filterBy.tags && input.filterBy.tags.length > 0) {
					favorites = favorites.filter((recipe) =>
						recipe.tags.some((tag) => input.filterBy.tags.includes(tag)),
					);
				}
			}

			// Apply sorting
			if (input.sortBy) {
				switch (input.sortBy) {
					case "newest":
						// Favorites are already in order of when they were liked (newest last)
						favorites.reverse();
						break;
					case "oldest":
						// Keep default order
						break;
					case "alphabetical":
						favorites.sort((a, b) => a.title.localeCompare(b.title));
						break;
					case "cookTime":
						favorites.sort((a, b) => a.cook_time - b.cook_time);
						break;
				}
			}

			// Get total count for pagination
			const totalFavorites = user.likedRecipes?.length || 0;

			return {
				recipes: favorites,
				total: totalFavorites,
				hasMore: input.offset + favorites.length < totalFavorites,
				offset: input.offset,
				limit: input.limit,
			};
		}),
});
