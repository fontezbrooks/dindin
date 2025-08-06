#!/usr/bin/env node

/**
 * Recipe Seed Data Script
 * Populates the recipes table with sample data for testing
 */

const { query, testConnection } = require("../config/database");
const { logger } = require("../config/logger");

const sampleRecipes = [
  {
    title: "Classic Spaghetti Carbonara",
    description:
      "Authentic Italian pasta dish with eggs, cheese, pancetta, and black pepper. Simple yet elegant.",
    image_url:
      "https://images.unsplash.com/photo-1612874742237-6526221588e3?w=500",
    prep_time: 15,
    cook_time: 20,
    servings: 4,
    difficulty: "Medium",
    cuisine_type: "Italian",
    ingredients: [
      "400g spaghetti",
      "200g pancetta or guanciale, diced",
      "4 large eggs",
      "100g Pecorino Romano cheese, grated",
      "50g Parmesan cheese, grated",
      "Black pepper to taste",
      "Salt for pasta water",
    ],
    instructions: [
      "Bring a large pot of salted water to boil and cook spaghetti according to package directions.",
      "While pasta cooks, fry pancetta in a large skillet until crispy.",
      "In a bowl, whisk together eggs, cheeses, and plenty of black pepper.",
      "Reserve 1 cup pasta water, then drain pasta.",
      "Add hot pasta to pancetta in skillet, remove from heat.",
      "Quickly stir in egg mixture, adding pasta water gradually to create creamy sauce.",
      "Serve immediately with extra cheese and black pepper.",
    ],
    nutritional_info: {
      calories: 580,
      protein: "28g",
      carbs: "72g",
      fat: "20g",
      fiber: "3g",
    },
    dietary_info: ["gluten_free"],
  },
  {
    title: "Thai Green Curry with Chicken",
    description:
      "Aromatic and spicy Thai curry with tender chicken, vegetables, and coconut milk.",
    image_url:
      "https://images.unsplash.com/photo-1455619452474-d2be8b1e70cd?w=500",
    prep_time: 20,
    cook_time: 25,
    servings: 4,
    difficulty: "Medium",
    cuisine_type: "Thai",
    ingredients: [
      "500g chicken thigh, sliced",
      "2 tbsp green curry paste",
      "400ml coconut milk",
      "1 cup chicken stock",
      "1 eggplant, cubed",
      "1 red bell pepper, sliced",
      "100g green beans, trimmed",
      "2 tbsp fish sauce",
      "1 tbsp palm sugar",
      "Thai basil leaves",
      "2 kaffir lime leaves",
      "1 red chili, sliced",
    ],
    instructions: [
      "Heat half the coconut milk in a wok until oil separates.",
      "Add green curry paste and fry until fragrant.",
      "Add chicken and cook until nearly done.",
      "Add remaining coconut milk and stock, bring to simmer.",
      "Add vegetables and cook until tender.",
      "Season with fish sauce and palm sugar.",
      "Garnish with basil, lime leaves, and chili.",
      "Serve with jasmine rice.",
    ],
    nutritional_info: {
      calories: 420,
      protein: "35g",
      carbs: "18g",
      fat: "24g",
      fiber: "4g",
    },
    dietary_info: ["gluten_free", "dairy_free"],
  },
  {
    title: "Mediterranean Quinoa Salad",
    description:
      "Fresh and healthy salad with quinoa, vegetables, herbs, and feta cheese.",
    image_url:
      "https://images.unsplash.com/photo-1512621776951-a57141f2eefd?w=500",
    prep_time: 30,
    cook_time: 15,
    servings: 6,
    difficulty: "Easy",
    cuisine_type: "Mediterranean",
    ingredients: [
      "2 cups quinoa, rinsed",
      "3 cups vegetable broth",
      "1 cucumber, diced",
      "2 tomatoes, diced",
      "1/2 red onion, finely chopped",
      "1/2 cup Kalamata olives, pitted",
      "100g feta cheese, crumbled",
      "1/4 cup fresh parsley, chopped",
      "2 tbsp fresh mint, chopped",
      "3 tbsp olive oil",
      "2 tbsp lemon juice",
      "Salt and pepper to taste",
    ],
    instructions: [
      "Cook quinoa in vegetable broth until tender, about 15 minutes.",
      "Let quinoa cool completely.",
      "Combine cucumber, tomatoes, onion, and olives in large bowl.",
      "Add cooled quinoa and mix well.",
      "Whisk together olive oil, lemon juice, salt, and pepper.",
      "Pour dressing over salad and toss.",
      "Add feta cheese and herbs, mix gently.",
      "Chill for at least 30 minutes before serving.",
    ],
    nutritional_info: {
      calories: 320,
      protein: "12g",
      carbs: "45g",
      fat: "12g",
      fiber: "6g",
    },
    dietary_info: ["vegetarian", "gluten_free"],
  },
  {
    title: "Korean Beef Bulgogi",
    description:
      "Marinated Korean BBQ beef that's sweet, savory, and incredibly flavorful.",
    image_url:
      "https://images.unsplash.com/photo-1590301157890-4810ed352733?w=500",
    prep_time: 25,
    cook_time: 15,
    servings: 4,
    difficulty: "Easy",
    cuisine_type: "Korean",
    ingredients: [
      "700g ribeye steak, thinly sliced",
      "1 Asian pear, grated",
      "1/2 onion, sliced",
      "4 cloves garlic, minced",
      "1 tbsp fresh ginger, grated",
      "1/4 cup soy sauce",
      "2 tbsp brown sugar",
      "2 tbsp sesame oil",
      "1 tbsp rice wine",
      "2 green onions, chopped",
      "1 tbsp sesame seeds",
      "Lettuce leaves for serving",
    ],
    instructions: [
      "Combine pear, garlic, ginger, soy sauce, sugar, sesame oil, and rice wine.",
      "Marinate sliced beef in mixture for at least 2 hours.",
      "Heat a large skillet or grill pan over high heat.",
      "Cook marinated beef in batches, 2-3 minutes per side.",
      "Add onions in last minute of cooking.",
      "Garnish with green onions and sesame seeds.",
      "Serve with rice and lettuce wraps.",
    ],
    nutritional_info: {
      calories: 450,
      protein: "42g",
      carbs: "15g",
      fat: "25g",
      fiber: "2g",
    },
    dietary_info: ["gluten_free", "dairy_free"],
  },
  {
    title: "Vegan Buddha Bowl",
    description:
      "Nutritious and colorful bowl with roasted vegetables, quinoa, and tahini dressing.",
    image_url:
      "https://images.unsplash.com/photo-1546793665-c74683f339c1?w=500",
    prep_time: 20,
    cook_time: 35,
    servings: 4,
    difficulty: "Easy",
    cuisine_type: "International",
    ingredients: [
      "1 cup quinoa",
      "2 cups sweet potato, cubed",
      "2 cups broccoli florets",
      "1 cup chickpeas, cooked",
      "2 cups kale, massaged",
      "1 avocado, sliced",
      "1/4 cup pumpkin seeds",
      "3 tbsp tahini",
      "2 tbsp lemon juice",
      "1 tbsp maple syrup",
      "2 tsp olive oil",
      "Salt and pepper to taste",
    ],
    instructions: [
      "Preheat oven to 400°F (200°C).",
      "Roast sweet potato and broccoli with olive oil for 25-30 minutes.",
      "Cook quinoa according to package directions.",
      "Massage kale with a pinch of salt until softened.",
      "Whisk together tahini, lemon juice, maple syrup, and water for dressing.",
      "Assemble bowls with quinoa, roasted vegetables, chickpeas, and kale.",
      "Top with avocado and pumpkin seeds.",
      "Drizzle with tahini dressing before serving.",
    ],
    nutritional_info: {
      calories: 520,
      protein: "18g",
      carbs: "65g",
      fat: "22g",
      fiber: "14g",
    },
    dietary_info: ["vegan", "gluten_free", "dairy_free"],
  },
  {
    title: "Classic Chocolate Chip Cookies",
    description:
      "Perfect chewy chocolate chip cookies that are crispy on the edges and soft in the center.",
    image_url:
      "https://images.unsplash.com/photo-1499636136210-6f4ee915583e?w=500",
    prep_time: 15,
    cook_time: 12,
    servings: 24,
    difficulty: "Easy",
    cuisine_type: "American",
    ingredients: [
      "2 1/4 cups all-purpose flour",
      "1 tsp baking soda",
      "1 tsp salt",
      "1 cup butter, softened",
      "3/4 cup brown sugar",
      "3/4 cup white sugar",
      "2 large eggs",
      "2 tsp vanilla extract",
      "2 cups chocolate chips",
    ],
    instructions: [
      "Preheat oven to 375°F (190°C).",
      "Mix flour, baking soda, and salt in a bowl.",
      "Cream butter and both sugars until fluffy.",
      "Beat in eggs and vanilla.",
      "Gradually mix in flour mixture.",
      "Stir in chocolate chips.",
      "Drop rounded tablespoons onto ungreased baking sheets.",
      "Bake 9-11 minutes until golden brown.",
      "Cool on baking sheets for 2 minutes before transferring.",
    ],
    nutritional_info: {
      calories: 180,
      protein: "2g",
      carbs: "26g",
      fat: "8g",
      fiber: "1g",
    },
    dietary_info: ["vegetarian"],
  },
  {
    title: "Moroccan Chicken Tagine",
    description:
      "Aromatic slow-cooked Moroccan stew with chicken, vegetables, and warm spices.",
    image_url:
      "https://images.unsplash.com/photo-1547592180-85f173990554?w=500",
    prep_time: 30,
    cook_time: 90,
    servings: 6,
    difficulty: "Medium",
    cuisine_type: "Moroccan",
    ingredients: [
      "1.5kg chicken, cut into pieces",
      "2 onions, sliced",
      "3 carrots, chunked",
      "1 can diced tomatoes",
      "1/2 cup dried apricots",
      "1/4 cup green olives",
      "2 tsp ground ginger",
      "1 tsp cinnamon",
      "1 tsp turmeric",
      "1/2 tsp saffron",
      "2 tbsp honey",
      "3 tbsp olive oil",
      "Salt and pepper to taste",
      "Fresh cilantro for garnish",
    ],
    instructions: [
      "Heat olive oil in tagine or heavy pot.",
      "Brown chicken pieces on all sides, then remove.",
      "Sauté onions until softened.",
      "Add spices and cook until fragrant.",
      "Return chicken to pot with tomatoes and 1 cup water.",
      "Add carrots, apricots, and olives.",
      "Cover and simmer for 1.5 hours until tender.",
      "Stir in honey in last 10 minutes.",
      "Garnish with cilantro and serve with couscous.",
    ],
    nutritional_info: {
      calories: 380,
      protein: "35g",
      carbs: "22g",
      fat: "18g",
      fiber: "4g",
    },
    dietary_info: ["gluten_free", "dairy_free"],
  },
  {
    title: "Japanese Miso Ramen",
    description:
      "Rich and flavorful ramen soup with miso broth, tender pork, and perfectly soft-boiled eggs.",
    image_url:
      "https://images.unsplash.com/photo-1557872943-16a5ac26437e?w=500",
    prep_time: 45,
    cook_time: 60,
    servings: 4,
    difficulty: "Hard",
    cuisine_type: "Japanese",
    ingredients: [
      "4 portions fresh ramen noodles",
      "4 soft-boiled eggs",
      "300g pork belly, sliced",
      "4 cups chicken stock",
      "3 tbsp miso paste",
      "2 tbsp soy sauce",
      "1 tbsp sesame oil",
      "2 green onions, sliced",
      "1 sheet nori, cut into strips",
      "1 cup bean sprouts",
      "2 cloves garlic, minced",
      "1 tbsp mirin",
    ],
    instructions: [
      "Prepare soft-boiled eggs and marinate in soy sauce mixture.",
      "Cook pork belly until golden and set aside.",
      "Heat chicken stock and whisk in miso paste until smooth.",
      "Add soy sauce, sesame oil, and mirin to broth.",
      "Cook ramen noodles according to package directions.",
      "Divide noodles between bowls.",
      "Pour hot broth over noodles.",
      "Top with pork, halved eggs, green onions, nori, and bean sprouts.",
      "Serve immediately while hot.",
    ],
    nutritional_info: {
      calories: 620,
      protein: "32g",
      carbs: "58g",
      fat: "28g",
      fiber: "4g",
    },
    dietary_info: ["dairy_free"],
  },
  {
    title: "Indian Palak Paneer",
    description:
      "Creamy spinach curry with soft paneer cheese, aromatic spices, and rich flavors.",
    image_url:
      "https://images.unsplash.com/photo-1565557623262-b51c2513a641?w=500",
    prep_time: 25,
    cook_time: 30,
    servings: 4,
    difficulty: "Medium",
    cuisine_type: "Indian",
    ingredients: [
      "500g fresh spinach",
      "250g paneer, cubed",
      "1 large onion, chopped",
      "4 cloves garlic, minced",
      "1 inch ginger, grated",
      "2 tomatoes, chopped",
      "1 tsp cumin seeds",
      "1 tsp garam masala",
      "1/2 tsp turmeric",
      "1/4 cup heavy cream",
      "3 tbsp ghee or oil",
      "Salt to taste",
    ],
    instructions: [
      "Blanch spinach in boiling water, then blend to smooth puree.",
      "Heat ghee and lightly fry paneer cubes until golden.",
      "In same pan, add cumin seeds and let splutter.",
      "Add onions and cook until golden brown.",
      "Add garlic, ginger, and tomatoes, cook until soft.",
      "Add spices and cook for 2 minutes.",
      "Add spinach puree and simmer for 10 minutes.",
      "Stir in cream and paneer, cook for 5 more minutes.",
      "Serve hot with rice or naan bread.",
    ],
    nutritional_info: {
      calories: 290,
      protein: "16g",
      carbs: "14g",
      fat: "20g",
      fiber: "6g",
    },
    dietary_info: ["vegetarian", "gluten_free"],
  },
  {
    title: "Greek Moussaka",
    description:
      "Traditional Greek casserole with layers of eggplant, meat sauce, and creamy béchamel.",
    image_url:
      "https://images.unsplash.com/photo-1621587084254-3c0b5540b7de?w=500",
    prep_time: 45,
    cook_time: 75,
    servings: 8,
    difficulty: "Hard",
    cuisine_type: "Greek",
    ingredients: [
      "3 large eggplants, sliced",
      "500g ground lamb or beef",
      "1 large onion, chopped",
      "3 cloves garlic, minced",
      "400g canned tomatoes",
      "2 tbsp tomato paste",
      "1/2 cup red wine",
      "1 tsp oregano",
      "1/2 cup olive oil",
      "4 tbsp butter",
      "4 tbsp flour",
      "2 cups milk",
      "100g Parmesan cheese",
      "2 egg yolks",
      "Salt and pepper to taste",
    ],
    instructions: [
      "Salt eggplant slices and let drain for 30 minutes.",
      "Brush with olive oil and grill until golden.",
      "Brown meat with onions and garlic.",
      "Add tomatoes, wine, and oregano, simmer 20 minutes.",
      "Make béchamel: melt butter, add flour, then milk gradually.",
      "Stir in cheese and egg yolks off heat.",
      "Layer eggplant, meat sauce, and béchamel in baking dish.",
      "Bake at 375°F (190°C) for 45 minutes until golden.",
      "Rest for 15 minutes before serving.",
    ],
    nutritional_info: {
      calories: 420,
      protein: "22g",
      carbs: "18g",
      fat: "28g",
      fiber: "8g",
    },
    dietary_info: ["gluten_free"],
  },
];

async function seedRecipes() {
  try {
    // Test database connection
    const connected = await testConnection();
    if (!connected) {
      throw new Error("Database connection failed");
    }

    logger.info("Starting recipe seeding...");

    // Check if recipes already exist
    const existingRecipes = await query(
      "SELECT COUNT(*) as count FROM recipes"
    );
    const recipeCount = parseInt(existingRecipes.rows[0].count);

    if (recipeCount > 0) {
      logger.info(
        `Database already contains ${recipeCount} recipes. Skipping seed.`
      );
      return;
    }

    // Create a default user for recipes if needed
    let defaultUserId = 1;
    const userResult = await query("SELECT id FROM users LIMIT 1");
    if (userResult.rows.length > 0) {
      defaultUserId = userResult.rows[0].id;
    } else {
      // Create a system user for seeded recipes
      const systemUser = await query(`
        INSERT INTO users (google_id, name, email, avatar)
        VALUES ('system', 'Recipe System', 'system@dindin.app', null)
        RETURNING id
      `);
      defaultUserId = systemUser.rows[0].id;
      logger.info("Created system user for recipe seeding");
    }

    // Insert recipes
    let insertedCount = 0;

    for (const recipe of sampleRecipes) {
      try {
        const totalTime = recipe.prep_time + recipe.cook_time;

        await query(
          `
          INSERT INTO recipes (
            title, description, image_url, prep_time, cook_time, total_time,
            servings, difficulty, cuisine_type, ingredients, instructions,
            nutritional_info, dietary_info, created_by, is_active
          ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15)
        `,
          [
            recipe.title,
            recipe.description,
            recipe.image_url,
            recipe.prep_time,
            recipe.cook_time,
            totalTime,
            recipe.servings,
            recipe.difficulty,
            recipe.cuisine_type,
            JSON.stringify(recipe.ingredients),
            JSON.stringify(recipe.instructions),
            JSON.stringify(recipe.nutritional_info),
            JSON.stringify(recipe.dietary_info),
            defaultUserId,
            true,
          ]
        );

        insertedCount++;
        logger.info(`Inserted recipe: ${recipe.title}`);
      } catch (error) {
        logger.error(`Failed to insert recipe ${recipe.title}:`, error.message);
      }
    }

    logger.info(`Recipe seeding completed. Inserted ${insertedCount} recipes.`);

    // Display summary
    const finalCount = await query(
      "SELECT COUNT(*) as count FROM recipes WHERE is_active = true"
    );
    const cuisineStats = await query(`
      SELECT cuisine_type, COUNT(*) as count
      FROM recipes
      WHERE is_active = true
      GROUP BY cuisine_type
      ORDER BY count DESC
    `);

    console.log("\n📊 Recipe Database Summary:");
    console.log(`Total active recipes: ${finalCount.rows[0].count}`);
    console.log("\nCuisine distribution:");
    cuisineStats.rows.forEach((row) => {
      console.log(`  ${row.cuisine_type}: ${row.count} recipes`);
    });
  } catch (error) {
    logger.error("Recipe seeding failed:", error);
    throw error;
  }
}

// Run seeding if this file is executed directly
if (require.main === module) {
  seedRecipes()
    .then(() => {
      console.log("✅ Recipe seeding completed successfully!");
      process.exit(0);
    })
    .catch((error) => {
      console.error("❌ Recipe seeding failed:", error.message);
      process.exit(1);
    });
}

module.exports = { seedRecipes, sampleRecipes };
