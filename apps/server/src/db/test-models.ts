// Test script to verify database models

import dotenv from "dotenv";
import mongoose from "mongoose";
import { DindinUser, Match, Recipe } from "./index";
import logger from "../lib/logger";

dotenv.config();

async function testDatabaseModels() {
	logger.log("🔍 Testing DinDin Database Models...\n");

	try {
		// Connect to MongoDB
		const dbUrl =
			process.env.DATABASE_URL ||
			"mongodb://root:password@localhost:27017/dindin-app?authSource=admin";
		await mongoose.connect(dbUrl);
		logger.log("✅ Connected to MongoDB\n");

		// Test Recipe Model
		logger.log("📖 Testing Recipe Model...");
		const testRecipe = new Recipe({
			title: "Spaghetti Carbonara",
			imageUrl: "https://example.com/carbonara.jpg",
			cookTime: 30,
			difficulty: "medium",
			cuisine: "Italian",
			ingredients: [
				{ name: "Spaghetti", amount: "400", unit: "grams" },
				{ name: "Eggs", amount: "4", unit: "whole" },
				{ name: "Bacon", amount: "200", unit: "grams" },
				{ name: "Parmesan", amount: "100", unit: "grams" },
			],
			steps: [
				"Boil the spaghetti according to package instructions",
				"Cook bacon until crispy",
				"Mix eggs and parmesan",
				"Combine hot pasta with egg mixture",
				"Add bacon and serve immediately",
			],
			tags: ["pasta", "italian", "quick", "comfort-food"],
			nutritionInfo: {
				calories: 650,
				protein: 28,
				carbs: 72,
				fat: 26,
			},
			servings: 2,
			prepTime: 10,
			totalTime: 30,
		});

		const savedRecipe = await testRecipe.save();
		logger.log(
			`✅ Recipe created: ${savedRecipe.title} (ID: ${savedRecipe._id})\n`,
		);

		// Test DindinUser Model
		logger.log("👤 Testing DindinUser Model...");
		const testUser1 = new DindinUser({
			authUserId: "auth_user_123",
			name: "John Doe",
			email: "john@example.com",
			dietaryRestrictions: ["vegetarian"],
			cookingSkill: "intermediate",
			preferences: {
				maxCookTime: 45,
				preferredCuisines: ["Italian", "Mexican"],
				spiceLevel: "medium",
			},
		});

		// Generate partner code
		testUser1.partnerCode = testUser1.generatePartnerCode();
		const savedUser1 = await testUser1.save();
		logger.log(
			`✅ User 1 created: ${savedUser1.name} (Partner Code: ${savedUser1.partnerCode})\n`,
		);

		// Create second user for partner system
		const testUser2 = new DindinUser({
			authUserId: "auth_user_456",
			name: "Jane Smith",
			email: "jane@example.com",
			dietaryRestrictions: ["gluten-free"],
			cookingSkill: "expert",
			partnerId: savedUser1._id,
			preferences: {
				maxCookTime: 60,
				preferredCuisines: ["Italian", "Japanese"],
				spiceLevel: "hot",
			},
		});

		testUser2.partnerCode = testUser2.generatePartnerCode();
		const savedUser2 = await testUser2.save();
		logger.log(
			`✅ User 2 created: ${savedUser2.name} (Partner Code: ${savedUser2.partnerCode})`,
		);

		// Update User 1 with partner
		savedUser1.partnerId = savedUser2._id;
		savedUser1.partnerConnectedAt = new Date();
		await savedUser1.save();
		logger.log(
			`✅ Partners connected: ${savedUser1.name} ↔️ ${savedUser2.name}\n`,
		);

		// Simulate recipe swipes
		savedUser1.likedRecipes.push(savedRecipe._id);
		await savedUser1.save();

		savedUser2.likedRecipes.push(savedRecipe._id);
		await savedUser2.save();
		logger.log("✅ Both users liked the same recipe\n");

		// Test Match Model
		logger.log("💕 Testing Match Model...");
		const testMatch = new Match({
			users: [savedUser1._id, savedUser2._id],
			recipeId: savedRecipe._id,
			status: "matched",
			preferences: {
				servingSize: 2,
			},
		});

		const savedMatch = await testMatch.save();
		logger.log(
			`✅ Match created between users for recipe: ${savedRecipe.title}`,
		);
		logger.log(`   Match ID: ${savedMatch._id}`);
		logger.log(`   Status: ${savedMatch.status}\n`);

		// Test match methods
		const includesUser1 = savedMatch.includesUser(savedUser1._id.toString());
		const partnerId = savedMatch.getPartnerId(savedUser1._id.toString());
		logger.log(`✅ Match methods tested:`);
		logger.log(`   Includes User 1: ${includesUser1}`);
		logger.log(`   Partner ID for User 1: ${partnerId}\n`);

		// Test status update
		const scheduled = savedMatch.updateStatus("scheduled");
		savedMatch.cookDate = new Date(Date.now() + 24 * 60 * 60 * 1000); // Tomorrow
		await savedMatch.save();
		logger.log(`✅ Match status updated to: ${savedMatch.status}`);
		logger.log(`   Cook date scheduled for: ${savedMatch.cookDate}\n`);

		// Verify data with population
		logger.log("🔍 Testing data population...");
		const populatedMatch = await Match.findById(savedMatch._id)
			.populate("users", "name email")
			.populate("recipeId", "title cuisine");

		logger.log("✅ Populated match data:");
		logger.log(`   Recipe: ${populatedMatch.recipeId.title}`);
		logger.log(
			`   Users: ${populatedMatch.users.map((u: any) => u.name).join(" & ")}\n`,
		);

		// Test static methods
		const userMatches = await Match.findUserMatches(savedUser1._id.toString());
		logger.log(
			`✅ Found ${userMatches.length} match(es) for ${savedUser1.name}\n`,
		);

		// Clean up test data
		logger.log("🧹 Cleaning up test data...");
		await Match.deleteOne({ _id: savedMatch._id });
		await DindinUser.deleteOne({ _id: savedUser1._id });
		await DindinUser.deleteOne({ _id: savedUser2._id });
		await Recipe.deleteOne({ _id: savedRecipe._id });
		logger.log("✅ Test data cleaned up\n");

		logger.log("✨ All database model tests passed successfully!");
	} catch (error) {
		logger.error("❌ Test failed:", error);
	} finally {
		await mongoose.disconnect();
		logger.log("\n🔌 Disconnected from MongoDB");
	}
}

// Run the test
testDatabaseModels();
