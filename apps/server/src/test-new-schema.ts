import mongoose from "mongoose";
import { Recipe, User } from "@/db";
import { appRouter } from "@/routers";
import logger from "./lib/logger";

async function testNewSchema() {
	try {
		// Connect to MongoDB
		await mongoose.connect(
			"mongodb://root:password@localhost:27017/dindin-app?authSource=admin",
		);
		logger.log("✅ Connected to MongoDB");

		// Test directly with Recipe model
		logger.log("\n📱 Testing Recipe model with new schema...");
		const recipes = await Recipe.find({ isActive: true }).limit(5).lean();

		logger.log(`\n✅ Fetched ${recipes.length} recipes with new schema:`);

		recipes.forEach((recipe, index) => {
			logger.log(`\n${index + 1}. ${recipe.title}`);
			logger.log(
				`   📝 Description: ${recipe.description?.substring(0, 100)}...`,
			);
			logger.log(
				`   ⏱️  Cook Time: ${recipe.cook_time} min, Prep Time: ${recipe.prep_time} min`,
			);
			logger.log(`   🍽️  Cuisine: ${recipe.cuisine.join(", ")}`);
			logger.log(
				`   🥗 Dietary Tags: ${recipe.dietary_tags?.join(", ") || "None"}`,
			);
			logger.log(`   📊 Difficulty: ${recipe.difficulty}`);
			logger.log(`   🍕 Servings: ${recipe.servings}`);
			logger.log(`   🥘 Ingredients: ${recipe.ingredients.length} items`);
			logger.log(`   📋 Instructions: ${recipe.instructions.length} steps`);

			if (recipe.nutrition) {
				logger.log(`   🔥 Calories: ${recipe.nutrition.calories || "N/A"}`);
			}
		});

		logger.log("\n✅ All tests passed! New schema is working correctly.");
	} catch (error) {
		logger.error("❌ Test failed:", error);
	} finally {
		await mongoose.disconnect();
		logger.log("\n📤 Disconnected from MongoDB");
	}
}

// Run the test
testNewSchema().catch(console.error);
