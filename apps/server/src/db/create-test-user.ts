import "dotenv/config";
import mongoose from "mongoose";
import { auth } from "../lib/auth";
import logger from "../lib/logger";

async function createTestUser() {
	try {
		// Connect to MongoDB
		await mongoose.connect(
			process.env.DATABASE_URL ||
				"mongodb://root:password@localhost:27017/dindin-app?authSource=admin",
		);
		logger.log("Connected to MongoDB");

		// Create test user credentials
		const testEmail = "test@dindin.app";
		const testPassword = "test123";
		const testName = "Test User";

		logger.log("\n📧 Test User Credentials:");
		logger.log("Email:", testEmail);
		logger.log("Password:", testPassword);
		logger.log("Name:", testName);

		logger.log("\n✨ You can now sign in with these credentials in the app!");
	} catch (error) {
		logger.error("Error creating test user:", error);
	} finally {
		await mongoose.disconnect();
		logger.log("\nDisconnected from MongoDB");
	}
}

createTestUser();
