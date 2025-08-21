import mongoose from "mongoose";

// Import all models
import { Todo } from "./models/todo.model";
import { User, Session, Account, Verification } from "./models/auth.model";
import { Recipe } from "./models/recipe.model";
import { DindinUser } from "./models/user.model";
import { Match } from "./models/match.model";
import { CookedRecipe } from "../models/cooked-recipe.model";

// Database connection
await mongoose.connect(process.env.DATABASE_URL || "").catch((error) => {
  console.log("Error connecting to database:", error);
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
