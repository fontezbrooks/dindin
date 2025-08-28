import { MongoMemoryServer } from "mongodb-memory-server";
import mongoose from "mongoose";
import { setupServer } from "msw/node";
import { createTRPCMsw } from "msw-trpc";
import {
	afterAll,
	afterEach,
	beforeAll,
	beforeEach,
	describe,
	expect,
	it,
} from "vitest";
import { Recipe } from "../../src/db/models/recipe.model";
import { DindinUser } from "../../src/db/models/user.model";
import { createContext } from "../../src/lib/trpc";
import { CookedRecipe } from "../../src/models/cooked-recipe.model";
import { appRouter } from "../../src/routers";

describe("Cooked Recipes Router Integration", () => {
	let mongoServer: MongoMemoryServer;
	let testUser: any;
	let testRecipe: any;
	let partnerUser: any;
	let mockSession: any;

	beforeAll(async () => {
		mongoServer = await MongoMemoryServer.create();
		const mongoUri = mongoServer.getUri();
		await mongoose.connect(mongoUri);
	});

	afterAll(async () => {
		await mongoose.disconnect();
		await mongoServer.stop();
	});

	beforeEach(async () => {
		// Clear all collections
		await CookedRecipe.deleteMany({});
		await Recipe.deleteMany({});
		await DindinUser.deleteMany({});

		// Create test users
		testUser = await DindinUser.create({
			authUserId: "test-auth-user-1",
			name: "Test User",
			email: "test@example.com",
			likedRecipes: [],
			dislikedRecipes: [],
			cookedRecipes: [],
			stats: { recipesCooked: 0, totalSwipes: 0, totalMatches: 0 },
		});

		partnerUser = await DindinUser.create({
			authUserId: "test-auth-user-2",
			name: "Partner User",
			email: "partner@example.com",
			likedRecipes: [],
			dislikedRecipes: [],
			cookedRecipes: [],
			stats: { recipesCooked: 0, totalSwipes: 0, totalMatches: 0 },
		});

		// Create test recipe
		testRecipe = await Recipe.create({
			title: "Test Recipe",
			description: "A delicious test recipe",
			image_url: "https://example.com/test-recipe.jpg",
			cook_time: 30,
			prep_time: 15,
			difficulty: "easy",
			cuisine: ["Italian"],
			ingredients: [
				{ name: "Pasta", amount: "200g" },
				{ name: "Tomato Sauce", amount: "100ml" },
			],
			instructions: [
				{ step: 1, description: "Cook pasta" },
				{ step: 2, description: "Add sauce" },
			],
			servings: 2,
		});

		// Mock session
		mockSession = {
			user: {
				id: testUser.authUserId,
				name: testUser.name,
				email: testUser.email,
			},
		};
	});

	afterEach(async () => {
		await CookedRecipe.deleteMany({});
		await Recipe.deleteMany({});
		await DindinUser.deleteMany({});
	});

	describe("markAsCooked", () => {
		it("should mark a recipe as cooked successfully", async () => {
			const caller = appRouter.createCaller(
				await createContext({ session: mockSession }),
			);

			const result = await caller.cookedRecipes.markAsCooked({
				recipeId: testRecipe._id.toString(),
				rating: 4,
				notes: "Delicious!",
				timeSpent: 45,
				wouldCookAgain: true,
			});

			expect(result.success).toBe(true);
			expect(result.cookedRecipe.rating).toBe(4);

			// Verify database record was created
			const cookedRecipe = await CookedRecipe.findOne({
				userId: testUser._id,
				recipeId: testRecipe._id,
			});
			expect(cookedRecipe).toBeTruthy();
			expect(cookedRecipe!.rating).toBe(4);
			expect(cookedRecipe!.notes).toBe("Delicious!");

			// Verify user stats were updated
			const updatedUser = await DindinUser.findById(testUser._id);
			expect(updatedUser!.stats.recipesCooked).toBe(1);
			expect(updatedUser!.cookedRecipes).toHaveLength(1);
		});

		it("should create partner session when cooking with partner", async () => {
			// Set up partner relationship
			testUser.partnerId = partnerUser._id;
			await testUser.save();

			const caller = appRouter.createCaller(
				await createContext({ session: mockSession }),
			);

			await caller.cookedRecipes.markAsCooked({
				recipeId: testRecipe._id.toString(),
				rating: 5,
				cookedWithPartner: true,
			});

			// Verify both users have cooking records
			const userRecord = await CookedRecipe.findOne({ userId: testUser._id });
			const partnerRecord = await CookedRecipe.findOne({
				userId: partnerUser._id,
			});

			expect(userRecord).toBeTruthy();
			expect(partnerRecord).toBeTruthy();
			expect(userRecord!.cookedWithPartner).toBe(true);
			expect(partnerRecord!.cookedWithPartner).toBe(true);

			// Verify both users' stats were updated
			const updatedUser = await DindinUser.findById(testUser._id);
			const updatedPartner = await DindinUser.findById(partnerUser._id);

			expect(updatedUser!.stats.recipesCooked).toBe(1);
			expect(updatedPartner!.stats.recipesCooked).toBe(1);
		});

		it("should fail when recipe does not exist", async () => {
			const caller = appRouter.createCaller(
				await createContext({ session: mockSession }),
			);

			const fakeRecipeId = new mongoose.Types.ObjectId().toString();

			await expect(
				caller.cookedRecipes.markAsCooked({
					recipeId: fakeRecipeId,
					rating: 4,
				}),
			).rejects.toThrow("Recipe not found");
		});

		it("should fail when user does not exist", async () => {
			const fakeSession = {
				user: {
					id: "fake-user-id",
					name: "Fake User",
					email: "fake@example.com",
				},
			};

			const caller = appRouter.createCaller(
				await createContext({ session: fakeSession }),
			);

			await expect(
				caller.cookedRecipes.markAsCooked({
					recipeId: testRecipe._id.toString(),
					rating: 4,
				}),
			).rejects.toThrow("User profile not found");
		});
	});

	describe("getRecentlyCooked", () => {
		beforeEach(async () => {
			// Create test cooking sessions
			const sessions = [
				{
					userId: testUser._id,
					recipeId: testRecipe._id,
					rating: 4,
					notes: "Great recipe!",
					cookedAt: new Date("2023-12-01"),
					timeSpent: 30,
				},
				{
					userId: testUser._id,
					recipeId: testRecipe._id,
					rating: 5,
					notes: "Even better the second time!",
					cookedAt: new Date("2023-12-15"),
					timeSpent: 25,
				},
				{
					userId: testUser._id,
					recipeId: testRecipe._id,
					rating: 3,
					cookedAt: new Date("2023-12-30"),
					timeSpent: 35,
				},
			];

			await CookedRecipe.insertMany(sessions);
		});

		it("should get recently cooked recipes", async () => {
			const caller = appRouter.createCaller(
				await createContext({ session: mockSession }),
			);

			const result = await caller.cookedRecipes.getRecentlyCooked({
				limit: 10,
				offset: 0,
			});

			expect(result.cookedRecipes).toHaveLength(3);
			expect(result.total).toBe(3);
			expect(result.hasMore).toBe(false);

			// Should be sorted by most recent first
			expect(
				new Date(result.cookedRecipes[0].cookedAt).getTime(),
			).toBeGreaterThan(new Date(result.cookedRecipes[1].cookedAt).getTime());

			// Should include recipe details
			expect(result.cookedRecipes[0].recipe.title).toBe("Test Recipe");
			expect(result.cookedRecipes[0].cookingFrequency).toBe(3);
		});

		it("should filter by date range", async () => {
			const caller = appRouter.createCaller(
				await createContext({ session: mockSession }),
			);

			const result = await caller.cookedRecipes.getRecentlyCooked({
				dateFrom: new Date("2023-12-10"),
				dateTo: new Date("2023-12-20"),
			});

			expect(result.cookedRecipes).toHaveLength(1);
			expect(result.cookedRecipes[0].notes).toBe(
				"Even better the second time!",
			);
		});

		it("should filter by minimum rating", async () => {
			const caller = appRouter.createCaller(
				await createContext({ session: mockSession }),
			);

			const result = await caller.cookedRecipes.getRecentlyCooked({
				minRating: 4,
			});

			expect(result.cookedRecipes).toHaveLength(2);
			expect(result.cookedRecipes.every((recipe) => recipe.rating! >= 4)).toBe(
				true,
			);
		});

		it("should paginate correctly", async () => {
			const caller = appRouter.createCaller(
				await createContext({ session: mockSession }),
			);

			const result = await caller.cookedRecipes.getRecentlyCooked({
				limit: 2,
				offset: 1,
			});

			expect(result.cookedRecipes).toHaveLength(2);
			expect(result.total).toBe(3);
			expect(result.hasMore).toBe(false);
		});

		it("should sort by rating when specified", async () => {
			const caller = appRouter.createCaller(
				await createContext({ session: mockSession }),
			);

			const result = await caller.cookedRecipes.getRecentlyCooked({
				sortBy: "rating",
			});

			expect(result.cookedRecipes[0].rating).toBe(5);
			expect(result.cookedRecipes[1].rating).toBe(4);
			expect(result.cookedRecipes[2].rating).toBe(3);
		});
	});

	describe("getCookingStats", () => {
		beforeEach(async () => {
			// Create multiple recipes for better stats
			const recipe2 = await Recipe.create({
				title: "Second Recipe",
				description: "Another test recipe",
				image_url: "https://example.com/recipe2.jpg",
				cook_time: 20,
				prep_time: 10,
				difficulty: "medium",
				cuisine: ["Mexican"],
				ingredients: [{ name: "Beans", amount: "100g" }],
				instructions: [{ step: 1, description: "Cook beans" }],
				servings: 3,
			});

			const sessions = [
				// Multiple sessions of first recipe
				{
					userId: testUser._id,
					recipeId: testRecipe._id,
					rating: 4,
					timeSpent: 30,
					cookedAt: new Date("2023-12-01"),
				},
				{
					userId: testUser._id,
					recipeId: testRecipe._id,
					rating: 5,
					timeSpent: 25,
					cookedAt: new Date("2023-12-15"),
				},
				// One session of second recipe
				{
					userId: testUser._id,
					recipeId: recipe2._id,
					rating: 3,
					timeSpent: 20,
					cookedAt: new Date("2023-12-20"),
				},
				// Recent session (within 7 days for recent count)
				{
					userId: testUser._id,
					recipeId: testRecipe._id,
					rating: 4,
					timeSpent: 28,
					cookedAt: new Date(), // Today
				},
			];

			await CookedRecipe.insertMany(sessions);
		});

		it("should return comprehensive cooking stats", async () => {
			const caller = appRouter.createCaller(
				await createContext({ session: mockSession }),
			);

			const result = await caller.cookedRecipes.getCookingStats();

			expect(result.basicStats.totalCookingSessions).toBe(4);
			expect(result.basicStats.uniqueRecipesCount).toBe(2);
			expect(result.basicStats.avgRating).toBe(4);
			expect(result.basicStats.totalTimeSpent).toBe(103);
			expect(result.basicStats.recentSessions).toBe(1);

			expect(result.mostCookedRecipes).toHaveLength(2);
			expect(result.mostCookedRecipes[0].cookCount).toBe(3);
			expect(result.mostCookedRecipes[0].recipe.title).toBe("Test Recipe");
		});

		it("should calculate cooking streak correctly", async () => {
			const caller = appRouter.createCaller(
				await createContext({ session: mockSession }),
			);

			const result = await caller.cookedRecipes.getCookingStats();

			// With a session today, streak should be at least 1
			expect(result.currentStreak).toBeGreaterThanOrEqual(1);
		});

		it("should return empty stats for user with no cooking history", async () => {
			// Create a new user with no cooking sessions
			const newUser = await DindinUser.create({
				authUserId: "new-user",
				name: "New User",
				email: "newuser@example.com",
				likedRecipes: [],
				dislikedRecipes: [],
				cookedRecipes: [],
				stats: { recipesCooked: 0, totalSwipes: 0, totalMatches: 0 },
			});

			const newSession = {
				user: {
					id: newUser.authUserId,
					name: newUser.name,
					email: newUser.email,
				},
			};

			const caller = appRouter.createCaller(
				await createContext({ session: newSession }),
			);

			const result = await caller.cookedRecipes.getCookingStats();

			expect(result.basicStats.totalCookingSessions).toBe(0);
			expect(result.basicStats.uniqueRecipesCount).toBe(0);
			expect(result.mostCookedRecipes).toHaveLength(0);
			expect(result.currentStreak).toBe(0);
		});
	});

	describe("getCookingHistory", () => {
		beforeEach(async () => {
			const sessions = [
				{
					userId: testUser._id,
					recipeId: testRecipe._id,
					rating: 4,
					notes: "First time cooking",
					cookedAt: new Date("2023-11-01"),
				},
				{
					userId: testUser._id,
					recipeId: testRecipe._id,
					rating: 5,
					notes: "Much better!",
					cookedAt: new Date("2023-12-01"),
				},
				{
					userId: testUser._id,
					recipeId: testRecipe._id,
					rating: 5,
					notes: "Perfect execution",
					cookedAt: new Date("2023-12-15"),
				},
			];

			await CookedRecipe.insertMany(sessions);
		});

		it("should return cooking history for specific recipe", async () => {
			const caller = appRouter.createCaller(
				await createContext({ session: mockSession }),
			);

			const result = await caller.cookedRecipes.getCookingHistory({
				recipeId: testRecipe._id.toString(),
			});

			expect(result.history).toHaveLength(3);
			expect(result.total).toBe(3);
			expect(result.hasMore).toBe(false);

			// Should be sorted by most recent first
			expect(result.history[0].notes).toBe("Perfect execution");
			expect(result.history[2].notes).toBe("First time cooking");
		});

		it("should paginate cooking history", async () => {
			const caller = appRouter.createCaller(
				await createContext({ session: mockSession }),
			);

			const result = await caller.cookedRecipes.getCookingHistory({
				recipeId: testRecipe._id.toString(),
				limit: 2,
				offset: 1,
			});

			expect(result.history).toHaveLength(2);
			expect(result.total).toBe(3);
			expect(result.hasMore).toBe(false);
		});
	});

	describe("updateCookingSession", () => {
		let testSessionId: string;

		beforeEach(async () => {
			const session = await CookedRecipe.create({
				userId: testUser._id,
				recipeId: testRecipe._id,
				rating: 3,
				notes: "Original notes",
			});
			testSessionId = session._id.toString();
		});

		it("should update cooking session successfully", async () => {
			const caller = appRouter.createCaller(
				await createContext({ session: mockSession }),
			);

			const result = await caller.cookedRecipes.updateCookingSession({
				sessionId: testSessionId,
				rating: 5,
				notes: "Updated notes",
				wouldCookAgain: true,
			});

			expect(result.success).toBe(true);
			expect(result.session.rating).toBe(5);
			expect(result.session.notes).toBe("Updated notes");
			expect(result.session.wouldCookAgain).toBe(true);
		});

		it("should fail when session does not exist", async () => {
			const caller = appRouter.createCaller(
				await createContext({ session: mockSession }),
			);

			const fakeSessionId = new mongoose.Types.ObjectId().toString();

			await expect(
				caller.cookedRecipes.updateCookingSession({
					sessionId: fakeSessionId,
					rating: 4,
				}),
			).rejects.toThrow("Cooking session not found");
		});
	});

	describe("deleteCookingSession", () => {
		let testSessionId: string;

		beforeEach(async () => {
			const session = await CookedRecipe.create({
				userId: testUser._id,
				recipeId: testRecipe._id,
				rating: 4,
			});
			testSessionId = session._id.toString();

			// Update user stats
			testUser.stats.recipesCooked = 1;
			testUser.cookedRecipes.push({
				recipeId: testRecipe._id,
				cookedAt: session.cookedAt,
				rating: 4,
			});
			await testUser.save();
		});

		it("should delete cooking session successfully", async () => {
			const caller = appRouter.createCaller(
				await createContext({ session: mockSession }),
			);

			const result = await caller.cookedRecipes.deleteCookingSession({
				sessionId: testSessionId,
			});

			expect(result.success).toBe(true);

			// Verify session was deleted
			const deletedSession = await CookedRecipe.findById(testSessionId);
			expect(deletedSession).toBe(null);

			// Verify user stats were updated
			const updatedUser = await DindinUser.findById(testUser._id);
			expect(updatedUser!.stats.recipesCooked).toBe(0);
		});

		it("should fail when session does not exist", async () => {
			const caller = appRouter.createCaller(
				await createContext({ session: mockSession }),
			);

			const fakeSessionId = new mongoose.Types.ObjectId().toString();

			await expect(
				caller.cookedRecipes.deleteCookingSession({
					sessionId: fakeSessionId,
				}),
			).rejects.toThrow("Cooking session not found");
		});
	});
});
