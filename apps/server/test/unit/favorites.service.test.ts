import { TRPCError } from "@trpc/server";
import mongoose from "mongoose";
import {
	afterAll,
	afterEach,
	beforeAll,
	beforeEach,
	describe,
	expect,
	it,
	vi,
} from "vitest";
import { DindinUser, Recipe } from "../../src/db";
import { FavoritesServiceImpl } from "../../src/services/favorites-service";
import type { FavoritesOperationContext } from "../../src/types/favorites.types";

describe("FavoritesService", () => {
	let favoritesService: FavoritesServiceImpl;
	let testUser: any;
	let testRecipe: any;
	let context: FavoritesOperationContext;

	beforeAll(async () => {
		// Connect to test database
		const MONGODB_URI =
			process.env.MONGODB_TEST_URI || "mongodb://localhost:27017/dindin_test";
		await mongoose.connect(MONGODB_URI);

		favoritesService = new FavoritesServiceImpl();
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
			authUserId: "test-auth-user-123",
			name: "Test User",
			email: "test@example.com",
			likedRecipes: [],
			dislikedRecipes: [],
			cookedRecipes: [],
			dietaryRestrictions: [],
			allergies: [],
			cookingSkill: "beginner",
		});

		// Create test recipe
		testRecipe = await Recipe.create({
			title: "Test Recipe",
			description: "A delicious test recipe",
			image_url: "https://example.com/image.jpg",
			cook_time: 30,
			prep_time: 15,
			difficulty: "easy",
			cuisine: ["Italian"],
			ingredients: [{ name: "Test Ingredient", amount: "1", unit: "cup" }],
			instructions: [{ step: 1, description: "Test instruction" }],
			tags: ["test"],
			servings: 2,
			likes: 0,
		});

		context = {
			userId: testUser._id.toString(),
			authUserId: testUser.authUserId,
		};
	});

	afterEach(() => {
		vi.restoreAllMocks();
	});

	describe("addToFavorites", () => {
		it("should successfully add recipe to favorites", async () => {
			const result = await favoritesService.addToFavorites(
				context,
				testRecipe._id.toString(),
			);

			expect(result.success).toBe(true);
			expect(result.message).toBe("Recipe added to favorites successfully");
			expect(result.recipeId).toBe(testRecipe._id.toString());
			expect(result.totalFavoritesCount).toBe(1);

			// Verify user was updated
			const updatedUser = await DindinUser.findById(testUser._id);
			expect(updatedUser?.likedRecipes).toHaveLength(1);
			expect(updatedUser?.likedRecipes[0].toString()).toBe(
				testRecipe._id.toString(),
			);

			// Verify recipe like count was incremented
			const updatedRecipe = await Recipe.findById(testRecipe._id);
			expect(updatedRecipe?.likes).toBe(1);
		});

		it("should throw error when recipe already in favorites", async () => {
			// Add recipe to favorites first
			await DindinUser.findByIdAndUpdate(testUser._id, {
				$addToSet: { likedRecipes: testRecipe._id },
			});

			await expect(
				favoritesService.addToFavorites(context, testRecipe._id.toString()),
			).rejects.toThrow(TRPCError);

			try {
				await favoritesService.addToFavorites(
					context,
					testRecipe._id.toString(),
				);
			} catch (error) {
				expect(error).toBeInstanceOf(TRPCError);
				expect((error as TRPCError).code).toBe("BAD_REQUEST");
				expect((error as TRPCError).message).toBe(
					"Recipe already in favorites",
				);
			}
		});

		it("should throw error for invalid recipe ID", async () => {
			await expect(
				favoritesService.addToFavorites(context, "invalid-recipe-id"),
			).rejects.toThrow(TRPCError);

			try {
				await favoritesService.addToFavorites(context, "invalid-recipe-id");
			} catch (error) {
				expect(error).toBeInstanceOf(TRPCError);
				expect((error as TRPCError).code).toBe("BAD_REQUEST");
				expect((error as TRPCError).message).toBe("Invalid recipe ID format");
			}
		});

		it("should throw error when recipe does not exist", async () => {
			const nonExistentRecipeId = new mongoose.Types.ObjectId().toString();

			await expect(
				favoritesService.addToFavorites(context, nonExistentRecipeId),
			).rejects.toThrow(TRPCError);

			try {
				await favoritesService.addToFavorites(context, nonExistentRecipeId);
			} catch (error) {
				expect(error).toBeInstanceOf(TRPCError);
				expect((error as TRPCError).code).toBe("BAD_REQUEST");
				expect((error as TRPCError).message).toBe("Recipe not found");
			}
		});

		it("should throw error when user does not exist", async () => {
			const invalidContext: FavoritesOperationContext = {
				userId: "non-existent",
				authUserId: "non-existent-auth-user",
			};

			await expect(
				favoritesService.addToFavorites(
					invalidContext,
					testRecipe._id.toString(),
				),
			).rejects.toThrow(TRPCError);

			try {
				await favoritesService.addToFavorites(
					invalidContext,
					testRecipe._id.toString(),
				);
			} catch (error) {
				expect(error).toBeInstanceOf(TRPCError);
				expect((error as TRPCError).code).toBe("BAD_REQUEST");
				expect((error as TRPCError).message).toBe("User profile not found");
			}
		});
	});

	describe("removeFromFavorites", () => {
		beforeEach(async () => {
			// Add recipe to favorites for removal tests
			await DindinUser.findByIdAndUpdate(testUser._id, {
				$addToSet: { likedRecipes: testRecipe._id },
			});
			await Recipe.findByIdAndUpdate(testRecipe._id, { $inc: { likes: 1 } });
		});

		it("should successfully remove recipe from favorites", async () => {
			const result = await favoritesService.removeFromFavorites(
				context,
				testRecipe._id.toString(),
			);

			expect(result.success).toBe(true);
			expect(result.message).toBe("Recipe removed from favorites successfully");
			expect(result.recipeId).toBe(testRecipe._id.toString());
			expect(result.remainingFavoritesCount).toBe(0);

			// Verify user was updated
			const updatedUser = await DindinUser.findById(testUser._id);
			expect(updatedUser?.likedRecipes).toHaveLength(0);

			// Verify recipe like count was decremented
			const updatedRecipe = await Recipe.findById(testRecipe._id);
			expect(updatedRecipe?.likes).toBe(0);
		});

		it("should throw error when recipe not in favorites", async () => {
			// Remove the recipe from favorites first
			await DindinUser.findByIdAndUpdate(testUser._id, {
				$pull: { likedRecipes: testRecipe._id },
			});

			await expect(
				favoritesService.removeFromFavorites(
					context,
					testRecipe._id.toString(),
				),
			).rejects.toThrow(TRPCError);

			try {
				await favoritesService.removeFromFavorites(
					context,
					testRecipe._id.toString(),
				);
			} catch (error) {
				expect(error).toBeInstanceOf(TRPCError);
				expect((error as TRPCError).code).toBe("NOT_FOUND");
				expect((error as TRPCError).message).toBe(
					"Recipe not found in favorites",
				);
			}
		});

		it("should throw error for invalid recipe ID", async () => {
			await expect(
				favoritesService.removeFromFavorites(context, "invalid-recipe-id"),
			).rejects.toThrow(TRPCError);
		});

		it("should handle multiple recipes in favorites correctly", async () => {
			// Create second recipe and add to favorites
			const secondRecipe = await Recipe.create({
				title: "Second Test Recipe",
				description: "Another test recipe",
				image_url: "https://example.com/image2.jpg",
				cook_time: 25,
				prep_time: 10,
				difficulty: "medium",
				cuisine: ["Mexican"],
				ingredients: [{ name: "Test Ingredient 2", amount: "2", unit: "cups" }],
				instructions: [{ step: 1, description: "Second test instruction" }],
				tags: ["test2"],
				servings: 4,
				likes: 0,
			});

			await DindinUser.findByIdAndUpdate(testUser._id, {
				$addToSet: { likedRecipes: secondRecipe._id },
			});

			// Remove first recipe
			const result = await favoritesService.removeFromFavorites(
				context,
				testRecipe._id.toString(),
			);
			expect(result.remainingFavoritesCount).toBe(1);

			// Verify second recipe still in favorites
			const updatedUser = await DindinUser.findById(testUser._id);
			expect(updatedUser?.likedRecipes).toHaveLength(1);
			expect(updatedUser?.likedRecipes[0].toString()).toBe(
				secondRecipe._id.toString(),
			);
		});
	});

	describe("isFavorite", () => {
		it("should return true when recipe is in favorites", async () => {
			// Add recipe to favorites
			await DindinUser.findByIdAndUpdate(testUser._id, {
				$addToSet: { likedRecipes: testRecipe._id },
			});

			const result = await favoritesService.isFavorite(
				context,
				testRecipe._id.toString(),
			);

			expect(result.isFavorite).toBe(true);
			expect(result.recipeId).toBe(testRecipe._id.toString());
		});

		it("should return false when recipe is not in favorites", async () => {
			const result = await favoritesService.isFavorite(
				context,
				testRecipe._id.toString(),
			);

			expect(result.isFavorite).toBe(false);
			expect(result.recipeId).toBe(testRecipe._id.toString());
		});

		it("should throw error for invalid recipe ID", async () => {
			await expect(
				favoritesService.isFavorite(context, "invalid-recipe-id"),
			).rejects.toThrow(TRPCError);
		});

		it("should work with empty favorites list", async () => {
			const result = await favoritesService.isFavorite(
				context,
				testRecipe._id.toString(),
			);
			expect(result.isFavorite).toBe(false);
		});
	});

	describe("validateFavoritesOperation", () => {
		it("should return valid result for valid inputs", async () => {
			const result = await favoritesService.validateFavoritesOperation(
				context,
				testRecipe._id.toString(),
			);

			expect(result.isValid).toBe(true);
			expect(result.user).toBeTruthy();
			expect(result.recipe).toBeTruthy();
			expect(result.error).toBeUndefined();
		});

		it("should return invalid result for invalid recipe ID", async () => {
			const result = await favoritesService.validateFavoritesOperation(
				context,
				"invalid-id",
			);

			expect(result.isValid).toBe(false);
			expect(result.error).toBe("Invalid recipe ID format");
		});

		it("should return invalid result for non-existent user", async () => {
			const invalidContext: FavoritesOperationContext = {
				userId: "non-existent",
				authUserId: "non-existent-auth-user",
			};

			const result = await favoritesService.validateFavoritesOperation(
				invalidContext,
				testRecipe._id.toString(),
			);

			expect(result.isValid).toBe(false);
			expect(result.error).toBe("User profile not found");
		});

		it("should return invalid result for non-existent recipe", async () => {
			const nonExistentRecipeId = new mongoose.Types.ObjectId().toString();

			const result = await favoritesService.validateFavoritesOperation(
				context,
				nonExistentRecipeId,
			);

			expect(result.isValid).toBe(false);
			expect(result.error).toBe("Recipe not found");
		});

		it("should skip recipe validation when validateRecipe is false", async () => {
			const nonExistentRecipeId = new mongoose.Types.ObjectId().toString();

			const result = await favoritesService.validateFavoritesOperation(
				context,
				nonExistentRecipeId,
				false,
			);

			expect(result.isValid).toBe(true);
			expect(result.user).toBeTruthy();
			expect(result.recipe).toBeNull();
		});
	});

	describe("getFavoritesCount", () => {
		it("should return 0 for user with no favorites", async () => {
			const count = await favoritesService.getFavoritesCount(
				testUser.authUserId,
			);
			expect(count).toBe(0);
		});

		it("should return correct count for user with favorites", async () => {
			// Add recipes to favorites
			await DindinUser.findByIdAndUpdate(testUser._id, {
				$addToSet: { likedRecipes: { $each: [testRecipe._id] } },
			});

			const count = await favoritesService.getFavoritesCount(
				testUser.authUserId,
			);
			expect(count).toBe(1);
		});

		it("should return 0 for non-existent user", async () => {
			const count =
				await favoritesService.getFavoritesCount("non-existent-user");
			expect(count).toBe(0);
		});
	});

	describe("areFavorites", () => {
		beforeEach(async () => {
			// Add test recipe to favorites
			await DindinUser.findByIdAndUpdate(testUser._id, {
				$addToSet: { likedRecipes: testRecipe._id },
			});
		});

		it("should correctly check multiple recipes", async () => {
			// Create another recipe not in favorites
			const anotherRecipe = await Recipe.create({
				title: "Another Recipe",
				description: "Not in favorites",
				image_url: "https://example.com/another.jpg",
				cook_time: 20,
				prep_time: 5,
				difficulty: "easy",
				cuisine: ["American"],
				ingredients: [{ name: "Test", amount: "1", unit: "item" }],
				instructions: [{ step: 1, description: "Test" }],
				tags: ["test"],
				servings: 1,
				likes: 0,
			});

			const result = await favoritesService.areFavorites(testUser.authUserId, [
				testRecipe._id.toString(),
				anotherRecipe._id.toString(),
			]);

			expect(result[testRecipe._id.toString()]).toBe(true);
			expect(result[anotherRecipe._id.toString()]).toBe(false);
		});

		it("should handle invalid recipe IDs gracefully", async () => {
			const result = await favoritesService.areFavorites(testUser.authUserId, [
				"invalid-id",
				testRecipe._id.toString(),
			]);

			expect(result["invalid-id"]).toBe(false);
			expect(result[testRecipe._id.toString()]).toBe(true);
		});

		it("should throw error for non-existent user", async () => {
			await expect(
				favoritesService.areFavorites("non-existent-user", [
					testRecipe._id.toString(),
				]),
			).rejects.toThrow(TRPCError);
		});
	});

	describe("atomic operations", () => {
		it("should handle concurrent add operations correctly", async () => {
			// Simulate concurrent operations
			const promises = Array(5)
				.fill(null)
				.map(async (_, index) => {
					try {
						const recipe = await Recipe.create({
							title: `Recipe ${index}`,
							description: `Description ${index}`,
							image_url: `https://example.com/image${index}.jpg`,
							cook_time: 20,
							prep_time: 5,
							difficulty: "easy",
							cuisine: ["Test"],
							ingredients: [{ name: "Test", amount: "1", unit: "item" }],
							instructions: [{ step: 1, description: "Test" }],
							tags: ["test"],
							servings: 1,
							likes: 0,
						});

						return await favoritesService.addToFavorites(
							context,
							recipe._id.toString(),
						);
					} catch (error) {
						return error;
					}
				});

			const results = await Promise.all(promises);
			const successfulResults = results.filter(
				(result) =>
					result &&
					typeof result === "object" &&
					"success" in result &&
					result.success,
			);

			expect(successfulResults).toHaveLength(5);

			// Verify final state
			const finalUser = await DindinUser.findById(testUser._id);
			expect(finalUser?.likedRecipes).toHaveLength(5);
		});
	});

	describe("error handling", () => {
		it("should handle database errors gracefully", async () => {
			// Mock database error
			const mockFindOne = vi
				.spyOn(DindinUser, "findOne")
				.mockRejectedValueOnce(new Error("Database connection failed"));

			await expect(
				favoritesService.addToFavorites(context, testRecipe._id.toString()),
			).rejects.toThrow(TRPCError);

			mockFindOne.mockRestore();
		});

		it("should handle validation errors", async () => {
			// Mock validation error
			const mockFindByIdAndUpdate = vi
				.spyOn(DindinUser, "findByIdAndUpdate")
				.mockRejectedValueOnce(new mongoose.Error.ValidationError());

			await expect(
				favoritesService.addToFavorites(context, testRecipe._id.toString()),
			).rejects.toThrow(TRPCError);

			mockFindByIdAndUpdate.mockRestore();
		});
	});
});
