// Database Seeding Script - TypeScript version
// Seeds the database with sample data for development

import { connect, connection } from "mongoose";
import dotenv from "dotenv";
import User from "../models/User.js";
import Recipe from "../models/Recipe.js";
import Swipe from "../models/Swipe.js";

dotenv.config();

// Environment variables
const MONGODB_URI = process.env.MONGODB_URI || "mongodb://localhost:27017/";
const DATABASE_NAME = process.env.DATABASE_NAME || "dindin";

// Sample data
const sampleUsers = [
  {
    name: "John Doe",
    email: "john@example.com",
    password: "password123",
    preferences: {
      dietary_restrictions: ["vegetarian"],
      cuisine_preferences: ["italian", "mediterranean"],
      difficulty_preference: "medium" as const,
      max_cook_time: 45,
      spice_tolerance: "mild" as const,
    },
  },
  {
    name: "Jane Smith",
    email: "jane@example.com",
    password: "password123",
    preferences: {
      dietary_restrictions: [],
      cuisine_preferences: ["asian", "mexican"],
      difficulty_preference: "easy" as const,
      max_cook_time: 30,
      spice_tolerance: "hot" as const,
    },
  },
];

const sampleRecipes = [
  {
    title: "Classic Spaghetti Carbonara",
    description: "A traditional Italian pasta dish with eggs, cheese, and pancetta",
    difficulty: "medium" as const,
    ingredients: [
      { name: "spaghetti", amount: "400g", unit: "g" },
      { name: "pancetta", amount: "200g", unit: "g" },
      { name: "eggs", amount: "4", unit: "pieces" },
      { name: "parmesan cheese", amount: "100g", unit: "g" },
    ],
    instructions: [
      { step: 1, description: "Cook spaghetti according to package directions" },
      { step: 2, description: "Fry pancetta until crispy" },
      { step: 3, description: "Mix eggs and cheese in a bowl" },
      { step: 4, description: "Combine all ingredients and serve hot" },
    ],
    cook_time: 20,
    prep_time: 10,
    cuisine: ["italian"],
    cuisine_type: "italian",
    dietary_tags: [],
    tags: ["pasta", "classic", "comfort-food"],
    servings: 4,
    isActive: true,
  },
  {
    title: "Vegetable Stir Fry",
    description: "Quick and healthy mixed vegetable stir fry",
    difficulty: "easy" as const,
    ingredients: [
      { name: "mixed vegetables", amount: "500g", unit: "g" },
      { name: "soy sauce", amount: "3", unit: "tbsp" },
      { name: "garlic", amount: "2", unit: "cloves" },
      { name: "ginger", amount: "1", unit: "tbsp" },
    ],
    instructions: [
      { step: 1, description: "Heat oil in a large pan" },
      { step: 2, description: "Add garlic and ginger, stir for 30 seconds" },
      { step: 3, description: "Add vegetables and stir fry for 5-7 minutes" },
      { step: 4, description: "Add soy sauce and serve" },
    ],
    cook_time: 10,
    prep_time: 5,
    cuisine: ["asian"],
    cuisine_type: "asian",
    dietary_tags: ["vegetarian", "vegan"],
    tags: ["healthy", "quick", "vegetables"],
    servings: 2,
    isActive: true,
  },
];

async function seedDatabase(): Promise<void> {
  try {
    // Connect to MongoDB
    await connect(`${MONGODB_URI}${DATABASE_NAME}`);
    console.log("✅ Connected to MongoDB");

    // Clear existing data
    console.log("🧹 Clearing existing data...");
    await Promise.all([
      User.deleteMany({}),
      Recipe.deleteMany({}),
      Swipe.deleteMany({}),
    ]);

    // Seed users
    console.log("👥 Seeding users...");
    const createdUsers = await User.insertMany(sampleUsers);
    console.log(`Created ${createdUsers.length} users`);

    // Seed recipes
    console.log("🍳 Seeding recipes...");
    const createdRecipes = await Recipe.insertMany(sampleRecipes);
    console.log(`Created ${createdRecipes.length} recipes`);

    // Create some sample swipes
    console.log("👆 Creating sample swipes...");
    const sampleSwipes = [
      {
        userId: createdUsers[0]._id,
        recipeId: createdRecipes[0]._id,
        direction: "right" as const,
      },
      {
        userId: createdUsers[0]._id,
        recipeId: createdRecipes[1]._id,
        direction: "left" as const,
      },
      {
        userId: createdUsers[1]._id,
        recipeId: createdRecipes[0]._id,
        direction: "right" as const,
      },
    ];

    const createdSwipes = await Swipe.insertMany(sampleSwipes);
    console.log(`Created ${createdSwipes.length} swipes`);

    console.log("🎉 Database seeding completed successfully!");
    console.log("\nSample login credentials:");
    console.log("- john@example.com / password123");
    console.log("- jane@example.com / password123");

  } catch (error) {
    console.error("❌ Error seeding database:", error);
    throw error;
  } finally {
    await connection.close();
    console.log("📡 MongoDB connection closed");
  }
}

// Run the seeding function if this script is executed directly
if (import.meta.url === `file://${process.argv[1]}`) {
  seedDatabase()
    .then(() => {
      console.log("✅ Seeding process completed");
      process.exit(0);
    })
    .catch((error) => {
      console.error("❌ Seeding process failed:", error);
      process.exit(1);
    });
}

export default seedDatabase;
