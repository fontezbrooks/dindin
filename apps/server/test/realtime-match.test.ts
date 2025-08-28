import { WebSocket } from "ws";
import { DindinUser, Match, Recipe } from "../src/db";
import { MatchService } from "../src/services/match-service";
import logger from "../src/lib/logger";

/**
 * Test script for real-time match creation
 *
 * This test simulates two users liking the same recipe
 * and verifies that both receive real-time match notifications
 */

async function testRealtimeMatchCreation() {
	logger.log("\n🧪 Testing Real-Time Match Creation...\n");

	try {
		// 1. Setup test data
		logger.log("1️⃣ Setting up test data...");

		// Create a test recipe
		const testRecipe = await Recipe.findOne({ isActive: true });
		if (!testRecipe) {
			logger.error("❌ No active recipes found in database");
			process.exit(1);
		}
		logger.log(`   Using recipe: ${testRecipe.title}`);

		// Get or create test users
		const user1 = await DindinUser.findOne({ name: "Test User 1" });
		const user2 = await DindinUser.findOne({ name: "Test User 2" });

		if (!user1 || !user2) {
			logger.error("❌ Test users not found. Please create them first.");
			process.exit(1);
		}

		// Make sure users are partners
		if (
			!user1.partnerId ||
			user1.partnerId.toString() !== user2._id.toString()
		) {
			user1.partnerId = user2._id;
			user2.partnerId = user1._id;
			await user1.save();
			await user2.save();
			logger.log("   Users connected as partners");
		}

		// Clear previous likes for this recipe
		user1.likedRecipes = user1.likedRecipes.filter(
			(id) => id.toString() !== testRecipe._id.toString(),
		);
		user2.likedRecipes = user2.likedRecipes.filter(
			(id) => id.toString() !== testRecipe._id.toString(),
		);
		await user1.save();
		await user2.save();

		// 2. Connect WebSocket clients
		logger.log("\n2️⃣ Connecting WebSocket clients...");

		// For testing, we'll use simple tokens
		const ws1 = new WebSocket("ws://localhost:3001?token=test-user-1");
		const ws2 = new WebSocket("ws://localhost:3001?token=test-user-2");

		const connectPromise = new Promise<void>((resolve) => {
			let connected = 0;

			ws1.on("open", () => {
				logger.log("   User 1 connected");
				connected++;
				if (connected === 2) resolve();
			});

			ws2.on("open", () => {
				logger.log("   User 2 connected");
				connected++;
				if (connected === 2) resolve();
			});
		});

		await connectPromise;

		// 3. Setup message listeners
		logger.log("\n3️⃣ Setting up message listeners...");

		let user1ReceivedMatch = false;
		let user2ReceivedMatch = false;

		ws1.on("message", (data) => {
			const message = JSON.parse(data.toString());
			logger.log("   User 1 received:", message.type);

			if (message.type === "newMatch") {
				user1ReceivedMatch = true;
				logger.log("   ✅ User 1 received match notification!");
				logger.log("      Recipe:", message.payload.recipe.title);
			}
		});

		ws2.on("message", (data) => {
			const message = JSON.parse(data.toString());
			logger.log("   User 2 received:", message.type);

			if (message.type === "newMatch") {
				user2ReceivedMatch = true;
				logger.log("   ✅ User 2 received match notification!");
				logger.log("      Recipe:", message.payload.recipe.title);
			}

			if (message.type === "partnerSwiping") {
				logger.log(
					"   📱 User 2 sees partner is swiping:",
					message.payload.action,
				);
			}
		});

		// 4. Simulate User 1 liking the recipe
		logger.log("\n4️⃣ User 1 likes the recipe...");
		user1.likedRecipes.push(testRecipe._id);
		await user1.save();
		logger.log("   User 1 liked recipe");

		// 5. Simulate User 2 liking the same recipe (triggers match)
		logger.log("\n5️⃣ User 2 likes the same recipe...");
		user2.likedRecipes.push(testRecipe._id);
		await user2.save();

		// Check for match and create it
		const isMatch = await MatchService.checkForMatch(
			user2._id,
			user1._id,
			testRecipe._id,
		);

		if (isMatch) {
			logger.log("   Match detected! Creating match...");
			const match = await MatchService.createMatch(
				user1._id,
				user2._id,
				testRecipe._id,
			);
			logger.log(`   ✅ Match created: ${match._id}`);
		}

		// 6. Wait for WebSocket messages to be delivered
		logger.log("\n6️⃣ Waiting for WebSocket notifications...");
		await new Promise((resolve) => setTimeout(resolve, 2000));

		// 7. Verify results
		logger.log("\n7️⃣ Verifying results...");

		if (user1ReceivedMatch && user2ReceivedMatch) {
			logger.log("   ✅ Both users received match notifications!");
		} else {
			logger.log("   ⚠️ Not all users received notifications:");
			logger.log(`      User 1: ${user1ReceivedMatch ? "✅" : "❌"}`);
			logger.log(`      User 2: ${user2ReceivedMatch ? "✅" : "❌"}`);
		}

		// Check database for match
		const dbMatch = await Match.findOne({
			users: { $all: [user1._id, user2._id] },
			recipeId: testRecipe._id,
		}).populate("recipeId");

		if (dbMatch) {
			logger.log(`   ✅ Match found in database: ${dbMatch._id}`);
			logger.log(`      Recipe: ${(dbMatch.recipeId as any).title}`);
			logger.log(`      Status: ${dbMatch.status}`);
		} else {
			logger.log("   ❌ Match not found in database");
		}

		// 8. Cleanup
		logger.log("\n8️⃣ Cleaning up...");
		ws1.close();
		ws2.close();

		logger.log("\n✅ Real-time match test completed!\n");
		process.exit(0);
	} catch (error) {
		logger.error("❌ Test failed:", error);
		process.exit(1);
	}
}

// Add delay to ensure server is ready
logger.log("Starting real-time match test...");
logger.log("Make sure the server is running on port 3001");
logger.log("Run: bun run dev in the server directory\n");

setTimeout(() => {
	testRealtimeMatchCreation();
}, 2000);
