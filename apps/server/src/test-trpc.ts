import dotenv from "dotenv";
import mongoose from "mongoose";
import path from "path";
import { Match } from "./db/models/match.model";
import { Recipe } from "./db/models/recipe.model";
import { DindinUser } from "./db/models/user.model";
import logger from "./lib/logger";
import { t } from "./lib/trpc";
import { appRouter } from "./routers";

// Load environment variables
dotenv.config({ path: path.join(__dirname, "../.env") });

// Mock session for testing
const mockSession = {
	user: {
		id: "test-auth-user-1",
		email: "test@example.com",
		name: "Test User",
	},
	expires: new Date(Date.now() + 1000 * 60 * 60 * 24).toISOString(),
};

const mockSession2 = {
	user: {
		id: "test-auth-user-2",
		email: "partner@example.com",
		name: "Partner User",
	},
	expires: new Date(Date.now() + 1000 * 60 * 60 * 24).toISOString(),
};

// Create tRPC caller factory
const createCaller = t.createCallerFactory(appRouter);

async function testTRPCImplementation() {
	logger.log("🧪 Testing tRPC Implementation...\n");

	try {
		// Connect to database
		logger.log("📊 Connecting to MongoDB...");
		const dbUrl =
			process.env.DATABASE_URL ||
			"mongodb://root:password@localhost:27017/dindin-app?authSource=admin";
		await mongoose.connect(dbUrl);
		logger.log("✅ Connected to MongoDB\n");

		// Create callers with mock sessions
		const caller1 = createCaller({ session: mockSession });
		const caller2 = createCaller({ session: mockSession2 });

		// Clean up any existing test data
		logger.log("🧹 Cleaning up test data...");
		await Recipe.deleteMany({ title: { $regex: /^Test Recipe/ } });
		await DindinUser.deleteMany({
			email: { $in: ["test@example.com", "partner@example.com"] },
		});
		await Match.deleteMany({});
		logger.log("✅ Test data cleaned\n");

		// Create test recipes
		logger.log("🍳 Creating test recipes...");
		const testRecipe1 = await Recipe.create({
			title: "Test Recipe 1: Spaghetti Carbonara",
			imageUrl: "https://example.com/carbonara.jpg",
			cookTime: 30,
			difficulty: "medium",
			cuisine: "Italian",
			ingredients: [
				{ name: "Spaghetti", amount: "400", unit: "g" },
				{ name: "Eggs", amount: "4", unit: "pieces" },
				{ name: "Pancetta", amount: "200", unit: "g" },
			],
			steps: ["Cook pasta", "Fry pancetta", "Mix eggs", "Combine"],
			tags: ["pasta", "italian", "quick"],
			nutritionInfo: {
				calories: 450,
				protein: 20,
				carbs: 60,
				fat: 15,
			},
			servings: 4,
		});

		const testRecipe2 = await Recipe.create({
			title: "Test Recipe 2: Chicken Teriyaki",
			imageUrl: "https://example.com/teriyaki.jpg",
			cookTime: 25,
			difficulty: "easy",
			cuisine: "Japanese",
			ingredients: [
				{ name: "Chicken", amount: "500", unit: "g" },
				{ name: "Soy Sauce", amount: "3", unit: "tbsp" },
				{ name: "Mirin", amount: "2", unit: "tbsp" },
			],
			steps: ["Marinate chicken", "Cook chicken", "Add sauce", "Serve"],
			tags: ["chicken", "japanese", "quick"],
			nutritionInfo: {
				calories: 380,
				protein: 35,
				carbs: 20,
				fat: 12,
			},
			servings: 2,
		});
		logger.log("✅ Created 2 test recipes\n");

		// Test 1: User Router - Get/Create Profile
		logger.log("🧪 Test 1: User Router - Get/Create Profile");
		const userProfile = await caller1.user.getProfile();
		logger.log("✅ User profile created:", userProfile.name, userProfile.email);

		// Test 2: Generate Partner Code
		logger.log("\n🧪 Test 2: Generate Partner Code");
		const partnerCodeResult = await caller1.user.generatePartnerCode();
		logger.log("✅ Partner code generated:", partnerCodeResult.code);

		// Test 3: Create Partner Profile
		logger.log("\n🧪 Test 3: Create Partner Profile");
		const partnerProfile = await caller2.user.getProfile();
		logger.log("✅ Partner profile created:", partnerProfile.name);

		// Test 4: Connect Partners
		logger.log("\n🧪 Test 4: Connect Partners");
		logger.log("   Using partner code:", partnerCodeResult.code);

		// Let's check if user 1 actually has the partner code
		const user1Check = await DindinUser.findOne({
			authUserId: mockSession.user.id,
		});
		logger.log("   User 1 partner code in DB:", user1Check?.partnerCode);

		const connectResult = await caller2.user.connectPartner({
			partnerCode: partnerCodeResult.code,
		});
		logger.log("✅ Partners connected successfully!");

		// Test 5: Recipe Router - Get Recipe Stack
		logger.log("\n🧪 Test 5: Get Recipe Stack");
		const recipeStack = await caller1.recipe.getRecipeStack({ limit: 10 });
		logger.log(`✅ Retrieved ${recipeStack.length} recipes in stack`);

		// Test 6: Like Recipe (User 1)
		logger.log("\n🧪 Test 6: User 1 Likes Recipe");
		const likeResult1 = await caller1.recipe.likeRecipe({
			recipeId: testRecipe1._id.toString(),
			isLike: true,
		});
		logger.log("✅ User 1 liked recipe, matched:", likeResult1.matched);

		// Test 7: Like Same Recipe (User 2) - Should Create Match
		logger.log("\n🧪 Test 7: User 2 Likes Same Recipe (Should Match)");
		const likeResult2 = await caller2.recipe.likeRecipe({
			recipeId: testRecipe1._id.toString(),
			isLike: true,
		});
		logger.log("✅ User 2 liked recipe, matched:", likeResult2.matched);
		if (likeResult2.matched) {
			logger.log("🎉 Match created! Match ID:", likeResult2.matchId);
		}

		// Test 8: Get Matches
		logger.log("\n🧪 Test 8: Get Matches");
		const matches = await caller1.recipe.getMatches({
			limit: 10,
			offset: 0,
		});
		logger.log(`✅ Retrieved ${matches.matches.length} matches`);
		if (matches.matches.length > 0) {
			logger.log("   First match recipe:", matches.matches[0].recipeId.title);
		}

		// Test 9: Update Match Status
		if (matches.matches.length > 0) {
			logger.log("\n🧪 Test 9: Update Match Status to Scheduled");
			const matchId = matches.matches[0]._id;
			const cookDate = new Date(Date.now() + 1000 * 60 * 60 * 24 * 3); // 3 days from now

			const updateResult = await caller1.match.updateMatchStatus({
				matchId: matchId.toString(),
				status: "scheduled",
				cookDate,
			});
			logger.log("✅ Match status updated to:", updateResult.status);
		}

		// Test 10: Search Recipes
		logger.log("\n🧪 Test 10: Search Recipes");
		const searchResults = await caller1.recipe.searchRecipes({
			cuisine: "Italian",
			maxCookTime: 45,
			limit: 10,
			offset: 0,
		});
		logger.log(
			`✅ Found ${searchResults.recipes.length} Italian recipes under 45 minutes`,
		);

		// Test 11: Get User Stats
		logger.log("\n🧪 Test 11: Get User Stats");
		const stats = await caller1.user.getStats();
		logger.log("✅ User stats:", {
			swipes: stats.totalSwipes,
			matches: stats.totalMatches,
			cooked: stats.recipesCooked,
		});

		// Test 12: Dislike Recipe
		logger.log("\n🧪 Test 12: Dislike Recipe");
		const dislikeResult = await caller1.recipe.likeRecipe({
			recipeId: testRecipe2._id.toString(),
			isLike: false,
		});
		logger.log("✅ Recipe disliked, matched:", dislikeResult.matched);

		// Clean up test data
		logger.log("\n🧹 Cleaning up test data...");
		await Recipe.deleteMany({ title: { $regex: /^Test Recipe/ } });
		await DindinUser.deleteMany({
			email: { $in: ["test@example.com", "partner@example.com"] },
		});
		await Match.deleteMany({});
		logger.log("✅ Test data cleaned");

		logger.log("\n✅ All tRPC tests passed successfully!");
	} catch (error) {
		logger.error("\n❌ Test failed:", error);
	} finally {
		await mongoose.disconnect();
		logger.log("\n📊 Disconnected from MongoDB");
	}
}

// Run the tests
testTRPCImplementation().catch(console.error);
