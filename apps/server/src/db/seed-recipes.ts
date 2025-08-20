import 'dotenv/config';
import { Recipe } from './models/recipe.model';
import mongoose from 'mongoose';

const sampleRecipes = [
  {
    title: "Creamy Mushroom Risotto",
    imageUrl: "https://images.unsplash.com/photo-1476124369491-e7addf5db371?w=800",
    cookTime: 35,
    prepTime: 10,
    difficulty: "medium" as const,
    cuisine: "Italian",
    servings: 4,
    ingredients: [
      { name: "Arborio rice", amount: 1.5, unit: "cups" },
      { name: "Mushrooms", amount: 300, unit: "g" },
      { name: "Vegetable broth", amount: 4, unit: "cups" },
      { name: "White wine", amount: 0.5, unit: "cup" },
      { name: "Parmesan cheese", amount: 0.5, unit: "cup" },
      { name: "Butter", amount: 2, unit: "tbsp" },
      { name: "Onion", amount: 1, unit: "whole" },
      { name: "Garlic", amount: 2, unit: "cloves" },
    ],
    steps: [
      "Heat broth in a separate pot and keep warm",
      "Sauté onions and garlic in butter until soft",
      "Add mushrooms and cook until golden",
      "Add rice and toast for 2 minutes",
      "Add wine and stir until absorbed",
      "Add broth one ladle at a time, stirring continuously",
      "Finish with parmesan and butter",
      "Season with salt and pepper to taste",
    ],
    tags: ["vegetarian", "comfort food", "dinner"],
    nutritionInfo: {
      calories: 420,
      protein: 12,
      carbs: 58,
      fat: 14,
    },
  },
  {
    title: "Spicy Thai Basil Chicken",
    imageUrl: "https://images.unsplash.com/photo-1455619452474-d2be8b1e70cd?w=800",
    cookTime: 20,
    prepTime: 15,
    difficulty: "easy" as const,
    cuisine: "Thai",
    servings: 2,
    ingredients: [
      { name: "Chicken breast", amount: 500, unit: "g" },
      { name: "Thai basil", amount: 2, unit: "cups" },
      { name: "Garlic", amount: 4, unit: "cloves" },
      { name: "Thai chili", amount: 3, unit: "whole" },
      { name: "Fish sauce", amount: 2, unit: "tbsp" },
      { name: "Soy sauce", amount: 1, unit: "tbsp" },
      { name: "Sugar", amount: 1, unit: "tsp" },
      { name: "Vegetable oil", amount: 2, unit: "tbsp" },
    ],
    steps: [
      "Cut chicken into bite-sized pieces",
      "Heat oil in wok over high heat",
      "Add garlic and chili, stir fry for 30 seconds",
      "Add chicken and cook until done",
      "Add sauces and sugar, mix well",
      "Toss in basil leaves and stir until wilted",
      "Serve immediately with jasmine rice",
    ],
    tags: ["spicy", "quick", "asian"],
    nutritionInfo: {
      calories: 380,
      protein: 45,
      carbs: 12,
      fat: 16,
    },
  },
  {
    title: "Classic Margherita Pizza",
    imageUrl: "https://images.unsplash.com/photo-1574071318508-1cdbab80d002?w=800",
    cookTime: 15,
    prepTime: 120,
    difficulty: "medium" as const,
    cuisine: "Italian",
    servings: 2,
    ingredients: [
      { name: "Pizza dough", amount: 400, unit: "g" },
      { name: "Tomato sauce", amount: 200, unit: "ml" },
      { name: "Fresh mozzarella", amount: 250, unit: "g" },
      { name: "Fresh basil", amount: 1, unit: "bunch" },
      { name: "Olive oil", amount: 2, unit: "tbsp" },
      { name: "Salt", amount: 1, unit: "tsp" },
    ],
    steps: [
      "Let dough come to room temperature",
      "Preheat oven to 250°C (480°F)",
      "Stretch dough to desired size",
      "Spread tomato sauce evenly",
      "Add torn mozzarella pieces",
      "Drizzle with olive oil",
      "Bake for 12-15 minutes until crust is golden",
      "Top with fresh basil before serving",
    ],
    tags: ["classic", "vegetarian", "italian"],
    nutritionInfo: {
      calories: 285,
      protein: 12,
      carbs: 36,
      fat: 10,
    },
  },
  {
    title: "Honey Garlic Salmon",
    imageUrl: "https://images.unsplash.com/photo-1467003909585-2f8a72700288?w=800",
    cookTime: 20,
    prepTime: 10,
    difficulty: "easy" as const,
    cuisine: "American",
    servings: 2,
    ingredients: [
      { name: "Salmon fillets", amount: 2, unit: "pieces" },
      { name: "Honey", amount: 3, unit: "tbsp" },
      { name: "Soy sauce", amount: 2, unit: "tbsp" },
      { name: "Garlic", amount: 3, unit: "cloves" },
      { name: "Lemon", amount: 1, unit: "whole" },
      { name: "Olive oil", amount: 2, unit: "tbsp" },
    ],
    steps: [
      "Mix honey, soy sauce, and minced garlic",
      "Season salmon with salt and pepper",
      "Heat oil in pan over medium-high heat",
      "Sear salmon skin-side down for 4 minutes",
      "Flip and cook for 3 more minutes",
      "Pour honey garlic sauce over salmon",
      "Cook until sauce thickens and glazes the fish",
      "Squeeze lemon juice before serving",
    ],
    tags: ["healthy", "quick", "seafood"],
    nutritionInfo: {
      calories: 367,
      protein: 34,
      carbs: 20,
      fat: 16,
    },
  },
  {
    title: "Vegetable Pad Thai",
    imageUrl: "https://images.unsplash.com/photo-1559314809-0d155014e29e?w=800",
    cookTime: 25,
    prepTime: 20,
    difficulty: "medium" as const,
    cuisine: "Thai",
    servings: 3,
    ingredients: [
      { name: "Rice noodles", amount: 250, unit: "g" },
      { name: "Tofu", amount: 200, unit: "g" },
      { name: "Bean sprouts", amount: 2, unit: "cups" },
      { name: "Eggs", amount: 2, unit: "whole" },
      { name: "Tamarind paste", amount: 2, unit: "tbsp" },
      { name: "Fish sauce", amount: 2, unit: "tbsp" },
      { name: "Sugar", amount: 2, unit: "tbsp" },
      { name: "Peanuts", amount: 0.5, unit: "cup" },
      { name: "Lime", amount: 2, unit: "whole" },
    ],
    steps: [
      "Soak rice noodles in warm water for 30 minutes",
      "Mix tamarind, fish sauce, and sugar for sauce",
      "Fry tofu until golden and set aside",
      "Scramble eggs in wok and set aside",
      "Stir fry noodles with sauce",
      "Add tofu, eggs, and bean sprouts",
      "Toss everything together",
      "Garnish with peanuts and lime wedges",
    ],
    tags: ["vegetarian", "noodles", "asian"],
    nutritionInfo: {
      calories: 425,
      protein: 18,
      carbs: 62,
      fat: 14,
    },
  },
  {
    title: "Beef Tacos",
    imageUrl: "https://images.unsplash.com/photo-1565299585323-38d6b0865b47?w=800",
    cookTime: 20,
    prepTime: 15,
    difficulty: "easy" as const,
    cuisine: "Mexican",
    servings: 4,
    ingredients: [
      { name: "Ground beef", amount: 500, unit: "g" },
      { name: "Taco shells", amount: 8, unit: "pieces" },
      { name: "Lettuce", amount: 2, unit: "cups" },
      { name: "Tomatoes", amount: 2, unit: "whole" },
      { name: "Cheddar cheese", amount: 1, unit: "cup" },
      { name: "Sour cream", amount: 0.5, unit: "cup" },
      { name: "Taco seasoning", amount: 2, unit: "tbsp" },
    ],
    steps: [
      "Brown ground beef in a pan",
      "Add taco seasoning and water",
      "Simmer until sauce thickens",
      "Warm taco shells in oven",
      "Chop lettuce and tomatoes",
      "Grate cheese",
      "Assemble tacos with all ingredients",
      "Top with sour cream",
    ],
    tags: ["mexican", "quick", "family-friendly"],
    nutritionInfo: {
      calories: 310,
      protein: 22,
      carbs: 24,
      fat: 14,
    },
  },
  {
    title: "Mediterranean Quinoa Bowl",
    imageUrl: "https://images.unsplash.com/photo-1543339308-43e59d6b73a6?w=800",
    cookTime: 20,
    prepTime: 10,
    difficulty: "easy" as const,
    cuisine: "Mediterranean",
    servings: 2,
    ingredients: [
      { name: "Quinoa", amount: 1, unit: "cup" },
      { name: "Cucumber", amount: 1, unit: "whole" },
      { name: "Cherry tomatoes", amount: 1, unit: "cup" },
      { name: "Feta cheese", amount: 100, unit: "g" },
      { name: "Olives", amount: 0.5, unit: "cup" },
      { name: "Red onion", amount: 0.5, unit: "whole" },
      { name: "Lemon", amount: 1, unit: "whole" },
      { name: "Olive oil", amount: 3, unit: "tbsp" },
    ],
    steps: [
      "Cook quinoa according to package instructions",
      "Dice cucumber, tomatoes, and onion",
      "Mix vegetables with cooked quinoa",
      "Add crumbled feta and olives",
      "Dress with lemon juice and olive oil",
      "Season with salt and pepper",
      "Chill for 30 minutes before serving",
    ],
    tags: ["healthy", "vegetarian", "salad"],
    nutritionInfo: {
      calories: 380,
      protein: 14,
      carbs: 48,
      fat: 16,
    },
  },
  {
    title: "Chicken Tikka Masala",
    imageUrl: "https://images.unsplash.com/photo-1565557623262-b51c2513a641?w=800",
    cookTime: 40,
    prepTime: 30,
    difficulty: "medium" as const,
    cuisine: "Indian",
    servings: 4,
    ingredients: [
      { name: "Chicken thighs", amount: 750, unit: "g" },
      { name: "Yogurt", amount: 1, unit: "cup" },
      { name: "Heavy cream", amount: 200, unit: "ml" },
      { name: "Tomato puree", amount: 400, unit: "g" },
      { name: "Garam masala", amount: 2, unit: "tbsp" },
      { name: "Ginger", amount: 2, unit: "tbsp" },
      { name: "Garlic", amount: 4, unit: "cloves" },
      { name: "Butter", amount: 3, unit: "tbsp" },
    ],
    steps: [
      "Marinate chicken in yogurt and spices for 30 minutes",
      "Grill or pan-fry chicken until cooked",
      "Make sauce with butter, tomato puree, and cream",
      "Add garam masala and ginger-garlic paste",
      "Simmer sauce for 15 minutes",
      "Add cooked chicken to sauce",
      "Simmer for 10 more minutes",
      "Garnish with cilantro and serve with naan",
    ],
    tags: ["indian", "curry", "spicy"],
    nutritionInfo: {
      calories: 445,
      protein: 38,
      carbs: 18,
      fat: 24,
    },
  },
];

async function seedRecipes() {
  try {
    // Connect to MongoDB
    await mongoose.connect(process.env.DATABASE_URL || 'mongodb://root:password@localhost:27017/dindin-app?authSource=admin');
    console.log('Connected to MongoDB');

    // Clear existing recipes
    await Recipe.deleteMany({});
    console.log('Cleared existing recipes');

    // Insert sample recipes
    const recipes = await Recipe.insertMany(sampleRecipes);
    console.log(`✅ Successfully added ${recipes.length} sample recipes`);

    // Display the recipes
    recipes.forEach(recipe => {
      console.log(`- ${recipe.title} (${recipe.cuisine}, ${recipe.difficulty})`);
    });

  } catch (error) {
    console.error('Error seeding recipes:', error);
  } finally {
    await mongoose.disconnect();
    console.log('Disconnected from MongoDB');
  }
}

// Run the seed function
seedRecipes();