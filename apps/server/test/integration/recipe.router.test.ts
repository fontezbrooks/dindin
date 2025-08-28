import { beforeEach, describe, expect, it } from "bun:test";
import { DindinUser, Match, Recipe } from "../../src/db";
import { createContext } from "../../src/lib/context";
import { appRouter } from "../../src/routers";

describe("Recipe Router Integration Tests", () => {
	let user1: any, user2: any;
	let recipe1: any, recipe2: any, recipe3: any;
	let mockContext: any;

	beforeEach(async () => {
		// Create test users
		user1 = await DindinUser.create({
			authUserId: "auth-test-1",
			name: "Test User 1",
			email: "test1@example.com",
			likedRecipes: [],
			dislikedRecipes: [],
			cookedRecipes: [],
			dietaryRestrictions: [],
			allergies: [],
			cookingSkill: "intermediate",
			preferences: {
				maxCookTime: 60,
				preferredCuisines: ["Italian"],
				ingredientsToAvoid: [],
				spiceLevel: "medium",
			},
			stats: {
				totalSwipes: 0,
				totalMatches: 0,
				recipesCooked: 0,
			},
		});

		user2 = await DindinUser.create({
			authUserId: "auth-test-2",
			name: "Test User 2",
			email: "test2@example.com",
			likedRecipes: [],
			dislikedRecipes: [],
			cookedRecipes: [],
			dietaryRestrictions: [],
			allergies: [],
			cookingSkill: "beginner",
			partnerId: user1._id,
			preferences: {
				maxCookTime: 45,
				preferredCuisines: ["Mexican"],
				ingredientsToAvoid: [],
				spiceLevel: "mild",
			},
			stats: {
				totalSwipes: 0,
				totalMatches: 0,
				recipesCooked: 0,
			},
		});

		// Link users as partners
		user1.partnerId = user2._id;
		await user1.save();

		// Create test recipes
		recipe1 = await Recipe.create({
			title: "Spaghetti Carbonara",
			imageUrl: "https://example.com/carbonara.jpg",
			cookTime: 30,
			difficulty: "medium",
			cuisine: "Italian",
			ingredients: [
				{ name: "Spaghetti", amount: "400", unit: "g" },
				{ name: "Eggs", amount: "4", unit: "pieces" },
				{ name: "Pancetta", amount: "200", unit: "g" },
			],
			steps: [
				"Cook spaghetti",
				"Fry pancetta",
				"Mix eggs with cheese",
				"Combine all ingredients",
			],
			tags: ["pasta", "italian", "classic"],
			nutritionInfo: {
				calories: 550,
				protein: 25,
				carbs: 65,
				fat: 20,
			},
			isActive: true,
		});

		recipe2 = await Recipe.create({
			title: "Chicken Tacos",
			imageUrl: "https://example.com/tacos.jpg",
			cookTime: 25,
			difficulty: "easy",
			cuisine: "Mexican",
			ingredients: [
				{ name: "Chicken", amount: "500", unit: "g" },
				{ name: "Tortillas", amount: "8", unit: "pieces" },
				{ name: "Salsa", amount: "1", unit: "cup" },
			],
			steps: ["Cook chicken", "Warm tortillas", "Assemble tacos"],
			tags: ["mexican", "quick", "spicy"],
			nutritionInfo: {
				calories: 400,
				protein: 35,
				carbs: 40,
				fat: 12,
			},
			isActive: true,
		});

		recipe3 = await Recipe.create({
			title: "Vegetable Stir Fry",
			imageUrl: "https://example.com/stirfry.jpg",
			cookTime: 20,
			difficulty: "easy",
			cuisine: "Asian",
			ingredients: [
				{ name: "Mixed Vegetables", amount: "400", unit: "g" },
				{ name: "Soy Sauce", amount: "3", unit: "tbsp" },
			],
			steps: ["Heat oil", "Stir fry vegetables", "Add sauce"],
			tags: ["vegetarian", "healthy", "quick"],
			nutritionInfo: {
				calories: 250,
				protein: 8,
				carbs: 35,
				fat: 10,
			},
			isActive: true,
		});

		// Create mock context
		mockContext = {
			session: {
				user: {
					id: user1.authUserId,
					name: user1.name,
					email: user1.email,
				},
			},
		};
	});

	describe("getRecipeStack", () => {
		it("should return recipes not yet swiped by user", async () => {
			const caller = appRouter.createCaller(mockContext);

			const result = await caller.recipe.getRecipeStack({ limit: 10 });

			expect(result).toBeInstanceOf(Array);
			expect(result.length).toBeLessThanOrEqual(10);
			expect(result.length).toBe(3); // All 3 recipes should be available
		});

		it("should exclude liked recipes from stack", async () => {
			// User likes recipe1
			user1.likedRecipes.push(recipe1._id);
			await user1.save();

			const caller = appRouter.createCaller(mockContext);
			const result = await caller.recipe.getRecipeStack({ limit: 10 });

			expect(result.length).toBe(2);
			expect(
				result.find((r: any) => r._id.toString() === recipe1._id.toString()),
			).toBeUndefined();
		});

		it("should exclude disliked recipes from stack", async () => {
			// User dislikes recipe2
			user1.dislikedRecipes.push(recipe2._id);
			await user1.save();

			const caller = appRouter.createCaller(mockContext);
			const result = await caller.recipe.getRecipeStack({ limit: 10 });

			expect(result.length).toBe(2);
			expect(
				result.find((r: any) => r._id.toString() === recipe2._id.toString()),
			).toBeUndefined();
		});
	});

	describe("likeRecipe", () => {
		it("should add recipe to liked list", async () => {
			const caller = appRouter.createCaller(mockContext);

			const result = await caller.recipe.likeRecipe({
				recipeId: recipe1._id.toString(),
				isLike: true,
			});

			expect(result.success).toBe(true);
			expect(result.matched).toBe(false);

			const updatedUser = await DindinUser.findById(user1._id);
			expect(updatedUser?.likedRecipes).toContainEqual(recipe1._id);
			expect(updatedUser?.stats.totalSwipes).toBe(1);
		});

		it("should add recipe to disliked list", async () => {
			const caller = appRouter.createCaller(mockContext);

			const result = await caller.recipe.likeRecipe({
				recipeId: recipe2._id.toString(),
				isLike: false,
			});

			expect(result.success).toBe(true);
			expect(result.matched).toBe(false);

			const updatedUser = await DindinUser.findById(user1._id);
			expect(updatedUser?.dislikedRecipes).toContainEqual(recipe2._id);
			expect(updatedUser?.stats.totalSwipes).toBe(1);
		});

		it("should create match when both partners like same recipe", async () => {
			// User 2 likes recipe first
			user2.likedRecipes.push(recipe1._id);
			await user2.save();

			// User 1 likes the same recipe
			const caller = appRouter.createCaller(mockContext);
			const result = await caller.recipe.likeRecipe({
				recipeId: recipe1._id.toString(),
				isLike: true,
			});

			expect(result.success).toBe(true);
			expect(result.matched).toBe(true);
			expect(result.matchId).toBeDefined();
			expect(result.recipe).toBeDefined();

			// Verify match was created
			const match = await Match.findById(result.matchId);
			expect(match).toBeDefined();
			expect(match?.users).toContainEqual(user1._id);
			expect(match?.users).toContainEqual(user2._id);
			expect(match?.recipeId.toString()).toBe(recipe1._id.toString());

			// Verify user stats were updated
			const updatedUser1 = await DindinUser.findById(user1._id);
			const updatedUser2 = await DindinUser.findById(user2._id);
			expect(updatedUser1?.stats.totalMatches).toBe(1);
			expect(updatedUser2?.stats.totalMatches).toBe(1);
		});

		it("should not create duplicate matches", async () => {
			// Both users like the recipe
			user1.likedRecipes.push(recipe1._id);
			user2.likedRecipes.push(recipe1._id);
			await user1.save();
			await user2.save();

			// Create initial match
			await Match.create({
				users: [user1._id, user2._id],
				recipeId: recipe1._id,
			});

			// Try to like again (shouldn't create duplicate)
			const caller = appRouter.createCaller(mockContext);

			try {
				await caller.recipe.likeRecipe({
					recipeId: recipe1._id.toString(),
					isLike: true,
				});
			} catch (error: any) {
				expect(error.message).toContain("already swiped");
			}
		});
	});

	describe("getMatches", () => {
		beforeEach(async () => {
			// Create some matches
			await Match.create({
				users: [user1._id, user2._id],
				recipeId: recipe1._id,
				status: "matched",
			});

			await Match.create({
				users: [user1._id, user2._id],
				recipeId: recipe2._id,
				status: "scheduled",
				cookDate: new Date(Date.now() + 86400000), // Tomorrow
			});

			await Match.create({
				users: [user1._id, user2._id],
				recipeId: recipe3._id,
				status: "cooked",
			});
		});

		it("should return all matches for user", async () => {
			const caller = appRouter.createCaller(mockContext);

			const result = await caller.recipe.getMatches({
				limit: 10,
				offset: 0,
			});

			expect(result.matches).toHaveLength(3);
			expect(result.total).toBe(3);
			expect(result.hasMore).toBe(false);
		});

		it("should filter matches by status", async () => {
			const caller = appRouter.createCaller(mockContext);

			const matchedOnly = await caller.recipe.getMatches({
				status: "matched",
				limit: 10,
				offset: 0,
			});

			expect(matchedOnly.matches).toHaveLength(1);
			expect(matchedOnly.matches[0].status).toBe("matched");
		});

		it("should support pagination", async () => {
			const caller = appRouter.createCaller(mockContext);

			const page1 = await caller.recipe.getMatches({
				limit: 2,
				offset: 0,
			});

			expect(page1.matches).toHaveLength(2);
			expect(page1.hasMore).toBe(true);

			const page2 = await caller.recipe.getMatches({
				limit: 2,
				offset: 2,
			});

			expect(page2.matches).toHaveLength(1);
			expect(page2.hasMore).toBe(false);
		});

		it("should populate recipe data", async () => {
			const caller = appRouter.createCaller(mockContext);

			const result = await caller.recipe.getMatches({
				limit: 10,
				offset: 0,
			});

			const match = result.matches[0];
			expect(match.recipeId).toBeDefined();
			expect(match.recipeId.title).toBeDefined();
			expect(match.recipeId.imageUrl).toBeDefined();
		});
	});

	describe("searchRecipes", () => {
		it("should search recipes by cuisine", async () => {
			const caller = appRouter.createCaller(mockContext);

			const result = await caller.recipe.searchRecipes({
				cuisine: "Italian",
				limit: 10,
				offset: 0,
			});

			expect(result.recipes).toHaveLength(1);
			expect(result.recipes[0].cuisine).toBe("Italian");
		});

		it("should search recipes by difficulty", async () => {
			const caller = appRouter.createCaller(mockContext);

			const result = await caller.recipe.searchRecipes({
				difficulty: "easy",
				limit: 10,
				offset: 0,
			});

			expect(result.recipes).toHaveLength(2);
			result.recipes.forEach((recipe: any) => {
				expect(recipe.difficulty).toBe("easy");
			});
		});

		it("should search recipes by max cook time", async () => {
			const caller = appRouter.createCaller(mockContext);

			const result = await caller.recipe.searchRecipes({
				maxCookTime: 25,
				limit: 10,
				offset: 0,
			});

			expect(result.recipes).toHaveLength(2);
			result.recipes.forEach((recipe: any) => {
				expect(recipe.cookTime).toBeLessThanOrEqual(25);
			});
		});

		it("should search recipes by tags", async () => {
			const caller = appRouter.createCaller(mockContext);

			const result = await caller.recipe.searchRecipes({
				tags: ["quick"],
				limit: 10,
				offset: 0,
			});

			expect(result.recipes).toHaveLength(2);
			result.recipes.forEach((recipe: any) => {
				expect(recipe.tags).toContain("quick");
			});
		});
	});
});
