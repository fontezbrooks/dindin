import mongoose from "mongoose";
import { CookedRecipe } from "../models/cooked-recipe.model";
import logger from "../lib/logger";
import config from "../config/env.config";
import { Account, Session, User, Verification } from "./models/auth.model";
import { Match } from "./models/match.model";
import { Recipe } from "./models/recipe.model";
// Import all models
import { Todo } from "./models/todo.model";
import { DindinUser } from "./models/user.model";

// Database connection with validated config
await mongoose.connect(config.DATABASE_URL).catch((error) => {
	logger.log("Error connecting to database:", error);
	// In production, exit if database connection fails
	if (config.NODE_ENV === "production") {
		process.exit(1);
	}
});

const client = mongoose.connection.getClient().db("dindin-app");

// Export database client and all models
export {
	client,
	// Todo model (example)
	Todo,
	// Auth models
	User,
	Session,
	Account,
	Verification,
	// DinDin models
	Recipe,
	DindinUser,
	Match,
	CookedRecipe,
};
