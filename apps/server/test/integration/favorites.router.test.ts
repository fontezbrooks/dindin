import { createCallerFactory } from "@trpc/server";
import mongoose from "mongoose";
import {
	afterAll,
	afterEach,
	beforeAll,
	beforeEach,
	describe,
	expect,
	it,
} from "vitest";
import { DindinUser, Recipe } from "../../src/db";
import type { Context } from "../../src/lib/context";
import { userRouter } from "../../src/routers/user";

describe("Favorites Router Integration Tests", () => {
	let testUser: any;
	let testRecipe: any;
	let caller: ReturnType<ReturnType<typeof createCallerFactory>>;

	beforeAll(async () => {
		// Connect to test database
		const MONGODB_URI =
			process.env.MONGODB_TEST_URI || "mongodb://localhost:27017/dindin_test";
		await mongoose.connect(MONGODB_URI);
	});

	afterAll(async () => {
		// Clean up and disconnect
		await DindinUser.deleteMany({});
		await Recipe.deleteMany({});
		await mongoose.connection.close();
	});

	beforeEach(async () => {
		// Clean up test data
		await DindinUser.deleteMany({});
		await Recipe.deleteMany({});

		// Create test user
		testUser = await DindinUser.create({
			authUserId: "test-auth-user-integration",
			name: "Integration Test User",
			email: "integration@example.com",
			likedRecipes: [],
			dislikedRecipes: [],
			cookedRecipes: [],
			dietaryRestrictions: [],
			allergies: [],
			cookingSkill: "beginner",
		});

		// Create test recipe
		testRecipe = await Recipe.create({
			title: "Integration Test Recipe",
			description: "A recipe for integration testing",
			image_url: "https://example.com/integration.jpg",
			cook_time: 45,
			prep_time: 20,
			difficulty: "medium",
			cuisine: ["Italian"],
			ingredients: [
				{ name: "Integration Ingredient", amount: "2", unit: "cups" },
			],
			instructions: [{ step: 1, description: "Integration instruction" }],
			tags: ["integration", "test"],
			servings: 4,
			likes: 0,
		});

		// Create tRPC caller with mock context
		const createCaller = createCallerFactory(userRouter);
		const mockContext: Context = {
			session: {
				user: {
					id: testUser.authUserId,
					name: testUser.name,
					email: testUser.email,
				},
			},
		} as Context;

		caller = createCaller(mockContext);
	});

	describe("addToFavorites mutation", () => {
		it("should successfully add recipe to favorites", async () => {
			const result = await caller.addToFavorites({
				recipeId: testRecipe._id.toString(),
			});

			expect(result.success).toBe(true);
			expect(result.message).toBe("Recipe added to favorites successfully");
			expect(result.recipeId).toBe(testRecipe._id.toString());
			expect(result.totalFavoritesCount).toBe(1);

			// Verify database state
			const updatedUser = await DindinUser.findById(testUser._id);
			expect(updatedUser?.likedRecipes).toHaveLength(1);
			expect(updatedUser?.likedRecipes[0].toString()).toBe(
				testRecipe._id.toString(),
			);

			const updatedRecipe = await Recipe.findById(testRecipe._id);
			expect(updatedRecipe?.likes).toBe(1);
		});

		it("should fail when recipe already in favorites", async () => {
			// Add to favorites first
			await caller.addToFavorites({
				recipeId: testRecipe._id.toString(),
			});

			// Try to add again
			await expect(
				caller.addToFavorites({
					recipeId: testRecipe._id.toString(),
				}),
			).rejects.toThrow("Recipe already in favorites");
		});

		it("should fail with invalid recipe ID", async () => {
			await expect(
				caller.addToFavorites({
					recipeId: "invalid-id",
				}),
			).rejects.toThrow("Invalid recipe ID format");
		});

		it("should fail when recipe does not exist", async () => {
			const nonExistentId = new mongoose.Types.ObjectId().toString();

			await expect(
				caller.addToFavorites({
					recipeId: nonExistentId,
				}),
			).rejects.toThrow("Recipe not found");
		});
	});

	describe("removeFromFavorites mutation", () => {
		beforeEach(async () => {
			// Add recipe to favorites for removal tests
			await caller.addToFavorites({
				recipeId: testRecipe._id.toString(),
			});
		});

		it("should successfully remove recipe from favorites", async () => {
			const result = await caller.removeFromFavorites({
				recipeId: testRecipe._id.toString(),
			});

			expect(result.success).toBe(true);
			expect(result.message).toBe("Recipe removed from favorites successfully");
			expect(result.recipeId).toBe(testRecipe._id.toString());
			expect(result.remainingFavoritesCount).toBe(0);

			// Verify database state
			const updatedUser = await DindinUser.findById(testUser._id);
			expect(updatedUser?.likedRecipes).toHaveLength(0);

			const updatedRecipe = await Recipe.findById(testRecipe._id);
			expect(updatedRecipe?.likes).toBe(0);
		});

		it("should fail when recipe not in favorites", async () => {
			// Remove first
			await caller.removeFromFavorites({
				recipeId: testRecipe._id.toString(),
			});

			// Try to remove again
			await expect(
				caller.removeFromFavorites({
					recipeId: testRecipe._id.toString(),
				}),
			).rejects.toThrow("Recipe not found in favorites");
		});

		it("should fail with invalid recipe ID", async () => {
			await expect(
				caller.removeFromFavorites({
					recipeId: "invalid-id",
				}),
			).rejects.toThrow("Invalid recipe ID format");
		});

		it("should fail when recipe does not exist", async () => {
			const nonExistentId = new mongoose.Types.ObjectId().toString();

			await expect(
				caller.removeFromFavorites({
					recipeId: nonExistentId,
				}),
			).rejects.toThrow("Recipe not found");
		});

		it("should handle multiple recipes correctly", async () => {
			// Create and add second recipe
			const secondRecipe = await Recipe.create({
				title: "Second Integration Recipe",
				description: "Another integration test recipe",
				image_url: "https://example.com/second.jpg",
				cook_time: 30,
				prep_time: 10,
				difficulty: "easy",
				cuisine: ["Mexican"],
				ingredients: [{ name: "Second Ingredient", amount: "1", unit: "lb" }],
				instructions: [{ step: 1, description: "Second instruction" }],
				tags: ["integration", "second"],
				servings: 2,
				likes: 0,
			});

			await caller.addToFavorites({
				recipeId: secondRecipe._id.toString(),
			});

			// Should have 2 favorites now
			const userBefore = await DindinUser.findById(testUser._id);
			expect(userBefore?.likedRecipes).toHaveLength(2);

			// Remove first recipe
			const result = await caller.removeFromFavorites({
				recipeId: testRecipe._id.toString(),
			});

			expect(result.remainingFavoritesCount).toBe(1);

			// Verify second recipe still in favorites
			const userAfter = await DindinUser.findById(testUser._id);
			expect(userAfter?.likedRecipes).toHaveLength(1);
			expect(userAfter?.likedRecipes[0].toString()).toBe(
				secondRecipe._id.toString(),
			);
		});
	});

	describe("isFavorite query", () => {
		it("should return true when recipe is in favorites", async () => {
			// Add to favorites first
			await caller.addToFavorites({
				recipeId: testRecipe._id.toString(),
			});

			const result = await caller.isFavorite({
				recipeId: testRecipe._id.toString(),
			});

			expect(result.isFavorite).toBe(true);
			expect(result.recipeId).toBe(testRecipe._id.toString());
		});

		it("should return false when recipe is not in favorites", async () => {
			const result = await caller.isFavorite({
				recipeId: testRecipe._id.toString(),
			});

			expect(result.isFavorite).toBe(false);
			expect(result.recipeId).toBe(testRecipe._id.toString());
		});

		it("should fail with invalid recipe ID", async () => {
			await expect(
				caller.isFavorite({
					recipeId: "invalid-id",
				}),
			).rejects.toThrow("Invalid recipe ID format");
		});

		it("should work with non-existent recipe ID", async () => {
			const nonExistentId = new mongoose.Types.ObjectId().toString();

			const result = await caller.isFavorite({
				recipeId: nonExistentId,
			});

			expect(result.isFavorite).toBe(false);
			expect(result.recipeId).toBe(nonExistentId);
		});
	});

	describe("getLikedRecipes query", () => {
		beforeEach(async () => {
			// Create multiple recipes and add to favorites
			const recipes = await Promise.all([
				Recipe.create({
					title: "Recipe 1",
					description: "First recipe",
					image_url: "https://example.com/1.jpg",
					cook_time: 20,
					prep_time: 5,
					difficulty: "easy",
					cuisine: ["American"],
					ingredients: [{ name: "Ingredient 1", amount: "1", unit: "cup" }],
					instructions: [{ step: 1, description: "Step 1" }],
					tags: ["test1"],
					servings: 2,
					likes: 0,
				}),
				Recipe.create({
					title: "Recipe 2",
					description: "Second recipe",
					image_url: "https://example.com/2.jpg",
					cook_time: 25,
					prep_time: 10,
					difficulty: "medium",
					cuisine: ["Italian"],
					ingredients: [{ name: "Ingredient 2", amount: "2", unit: "cups" }],
					instructions: [{ step: 1, description: "Step 1" }],
					tags: ["test2"],
					servings: 3,
					likes: 0,
				}),
			]);

			// Add all recipes to favorites
			for (const recipe of recipes) {
				await caller.addToFavorites({
					recipeId: recipe._id.toString(),
				});
			}
		});

		it("should return user's liked recipes", async () => {
			const result = await caller.getLikedRecipes({
				limit: 20,
				offset: 0,
			});

			expect(result.recipes).toHaveLength(2);
			expect(result.total).toBe(2);
		});

		it("should respect pagination parameters", async () => {
			const result = await caller.getLikedRecipes({
				limit: 1,
				offset: 0,
			});

			expect(result.recipes).toHaveLength(1);
			expect(result.total).toBe(2);
		});

		it("should return empty array when no favorites", async () => {
			// Remove all favorites
			const user = await DindinUser.findById(testUser._id);
			if (user) {
				for (const recipeId of user.likedRecipes) {
					await caller.removeFromFavorites({
						recipeId: recipeId.toString(),
					});
				}
			}

			const result = await caller.getLikedRecipes({
				limit: 20,
				offset: 0,
			});

			expect(result.recipes).toHaveLength(0);
			expect(result.total).toBe(0);
		});
	});

	describe("concurrent operations", () => {
		it("should handle concurrent add/remove operations", async () => {
			// Create multiple recipes
			const recipes = await Promise.all([
				Recipe.create({
					title: "Concurrent Recipe 1",
					description: "For concurrency test",
					image_url: "https://example.com/concurrent1.jpg",
					cook_time: 15,
					prep_time: 5,
					difficulty: "easy",
					cuisine: ["Test"],
					ingredients: [{ name: "Test", amount: "1", unit: "item" }],
					instructions: [{ step: 1, description: "Test" }],
					tags: ["concurrent"],
					servings: 1,
					likes: 0,
				}),
				Recipe.create({
					title: "Concurrent Recipe 2",
					description: "For concurrency test",
					image_url: "https://example.com/concurrent2.jpg",
					cook_time: 20,
					prep_time: 8,
					difficulty: "medium",
					cuisine: ["Test"],
					ingredients: [{ name: "Test", amount: "1", unit: "item" }],
					instructions: [{ step: 1, description: "Test" }],
					tags: ["concurrent"],
					servings: 2,
					likes: 0,
				}),
			]);

			// Perform concurrent operations
			const addPromises = recipes.map((recipe) =>
				caller.addToFavorites({
					recipeId: recipe._id.toString(),
				}),
			);

			const results = await Promise.all(addPromises);

			// All operations should succeed
			results.forEach((result) => {
				expect(result.success).toBe(true);
			});

			// Verify final state
			const finalUser = await DindinUser.findById(testUser._id);
			expect(finalUser?.likedRecipes).toHaveLength(2);

			// Verify recipe like counts
			for (const recipe of recipes) {
				const updatedRecipe = await Recipe.findById(recipe._id);
				expect(updatedRecipe?.likes).toBe(1);
			}
		});

		it("should maintain data consistency under concurrent operations", async () => {
			// Add recipe to favorites first
			await caller.addToFavorites({
				recipeId: testRecipe._id.toString(),
			});

			// Perform multiple concurrent remove operations (should only succeed once)
			const removePromises = Array(5)
				.fill(null)
				.map(() =>
					caller
						.removeFromFavorites({
							recipeId: testRecipe._id.toString(),
						})
						.catch((error) => error),
				);

			const results = await Promise.all(removePromises);

			// Only one should succeed, others should fail
			const successCount = results.filter(
				(result) =>
					result &&
					typeof result === "object" &&
					"success" in result &&
					result.success,
			).length;

			expect(successCount).toBe(1);

			// Verify final state
			const finalUser = await DindinUser.findById(testUser._id);
			expect(finalUser?.likedRecipes).toHaveLength(0);

			const finalRecipe = await Recipe.findById(testRecipe._id);
			expect(finalRecipe?.likes).toBeGreaterThanOrEqual(0); // Should not go negative
		});
	});

	describe("data validation and edge cases", () => {
		it("should handle empty recipe ID", async () => {
			await expect(
				caller.addToFavorites({
					recipeId: "",
				}),
			).rejects.toThrow();
		});

		it("should handle whitespace-only recipe ID", async () => {
			await expect(
				caller.addToFavorites({
					recipeId: "   ",
				}),
			).rejects.toThrow();
		});

		it("should update lastActiveAt timestamp", async () => {
			const userBefore = await DindinUser.findById(testUser._id);
			const timeBefore = userBefore?.lastActiveAt;

			// Wait a moment to ensure timestamp difference
			await new Promise((resolve) => setTimeout(resolve, 10));

			await caller.addToFavorites({
				recipeId: testRecipe._id.toString(),
			});

			const userAfter = await DindinUser.findById(testUser._id);
			const timeAfter = userAfter?.lastActiveAt;

			expect(timeAfter).toBeTruthy();
			expect(timeBefore).toBeTruthy();
			expect(timeAfter!.getTime()).toBeGreaterThan(timeBefore!.getTime());
		});
	});
});
