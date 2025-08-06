#!/usr/bin/env node

/**
 * Recipe Seed Data Script
 * Populates the recipes table with sample data for testing
 */

import { testConnection, query } from "./database.js";

const sampleRecipes = [
  {
    title: "Marry Me Beef Stroganoff",
    ingredients: [
      {
        name: "ribeye steak",
        amount: "1.5",
        unit: "lbs",
      },
      {
        name: "egg noodles",
        amount: "12",
        unit: "oz",
      },
      {
        name: "cremini mushrooms",
        amount: "8",
        unit: "oz",
      },
      {
        name: "yellow onion",
        amount: "1",
        unit: "medium",
      },
      {
        name: "beef broth",
        amount: "1",
        unit: "cup",
      },
      {
        name: "sour cream",
        amount: "1/2",
        unit: "cup",
      },
      {
        name: "heavy cream",
        amount: "1/4",
        unit: "cup",
      },
      {
        name: "dijon mustard",
        amount: "1",
        unit: "tbsp",
      },
      {
        name: "worcestershire sauce",
        amount: "1",
        unit: "tbsp",
      },
      {
        name: "garlic",
        amount: "3",
        unit: "cloves",
      },
      {
        name: "flour",
        amount: "2",
        unit: "tbsp",
      },
      {
        name: "olive oil",
        amount: "2",
        unit: "tbsp",
      },
      {
        name: "butter",
        amount: "2",
        unit: "tbsp",
      },
      {
        name: "salt",
        amount: "1",
        unit: "tsp",
      },
      {
        name: "black pepper",
        amount: "1/2",
        unit: "tsp",
      },
      {
        name: "fresh parsley",
        amount: "2",
        unit: "tbsp",
      },
    ],
    instructions: [
      {
        step: 1,
        description:
          "Cut ribeye steak into thin strips and season with salt and pepper",
        duration: 5,
      },
      {
        step: 2,
        description:
          "Heat olive oil in large skillet over medium-high heat, sear beef strips until golden brown, about 3-4 minutes",
        duration: 4,
      },
      {
        step: 3,
        description: "Remove beef and set aside, add butter to same pan",
        duration: 1,
      },
      {
        step: 4,
        description:
          "Saut sliced mushrooms and onions until golden, about 5 minutes",
        duration: 5,
      },
      {
        step: 5,
        description: "Add minced garlic and flour, cook for 1 minute",
        duration: 1,
      },
      {
        step: 6,
        description: "Gradually whisk in beef broth, bring to simmer",
        duration: 3,
      },
      {
        step: 7,
        description: "Add heavy cream, dijon mustard, and worcestershire sauce",
        duration: 2,
      },
      {
        step: 8,
        description:
          "Return beef to pan, simmer until sauce thickens, about 5 minutes",
        duration: 5,
      },
      {
        step: 9,
        description:
          "Meanwhile, cook egg noodles according to package directions",
        duration: 8,
      },
      {
        step: 10,
        description: "Remove from heat, stir in sour cream and fresh parsley",
        duration: 1,
      },
      {
        step: 11,
        description: "Serve over egg noodles immediately",
        duration: 2,
      },
    ],
    difficulty: "medium",
    description:
      "A rich and creamy beef stroganoff with tender ribeye steak, mushrooms, and a luscious sour cream sauce served over egg noodles.",
    image_url:
      "https://images.unsplash.com/photo-1565299624946-b28f40a0ca4b?ixlib=rb-4.0.3&auto=format&fit=crop&w=1000&q=80",
    prep_time: 15,
    cook_time: 25,
    cuisine_type: "American",
    dietary_tags: ["gluten-free option"],
    nutrition: {
      calories: 485,
      protein: 32,
      carbs: 38,
      fat: 22,
      fiber: 3,
      sugar: 6,
    },
    import_metadata: {
      source_url: "https://trending-recipes.com/recipe-1",
      scraper_name: "manual_curation",
      scraper_version: "1.0.0",
      confidence_score: 0.9,
      extracted_at: "2024-08-05T07:00:00Z",
      notes:
        "Curated popular recipe based on trending social media and food blog analysis",
    },
  },
  {
    title: "Perfect Pot Roast with Vegetables",
    ingredients: [
      {
        name: "chuck roast",
        amount: "4",
        unit: "lbs",
      },
      {
        name: "baby potatoes",
        amount: "2",
        unit: "lbs",
      },
      {
        name: "carrots",
        amount: "1",
        unit: "lb",
      },
      {
        name: "yellow onions",
        amount: "2",
        unit: "large",
      },
      {
        name: "celery stalks",
        amount: "3",
        unit: "stalks",
      },
      {
        name: "beef broth",
        amount: "3",
        unit: "cups",
      },
      {
        name: "red wine",
        amount: "1",
        unit: "cup",
      },
      {
        name: "tomato paste",
        amount: "2",
        unit: "tbsp",
      },
      {
        name: "fresh thyme",
        amount: "4",
        unit: "sprigs",
      },
      {
        name: "fresh rosemary",
        amount: "2",
        unit: "sprigs",
      },
      {
        name: "bay leaves",
        amount: "2",
        unit: "leaves",
      },
      {
        name: "garlic",
        amount: "6",
        unit: "cloves",
      },
      {
        name: "flour",
        amount: "3",
        unit: "tbsp",
      },
      {
        name: "olive oil",
        amount: "3",
        unit: "tbsp",
      },
      {
        name: "salt",
        amount: "2",
        unit: "tsp",
      },
      {
        name: "black pepper",
        amount: "1",
        unit: "tsp",
      },
    ],
    instructions: [
      {
        step: 1,
        description:
          "Preheat oven to 325F and season chuck roast generously with salt and pepper",
        duration: 5,
      },
      {
        step: 2,
        description:
          "Heat oil in Dutch oven, sear roast on all sides until golden brown, about 10 minutes total",
        duration: 10,
      },
      {
        step: 3,
        description:
          "Remove roast and saut onions until caramelized, about 8 minutes",
        duration: 8,
      },
      {
        step: 4,
        description: "Add garlic and tomato paste, cook for 1 minute",
        duration: 1,
      },
      {
        step: 5,
        description:
          "Add flour and cook for 1 minute, then deglaze with red wine",
        duration: 3,
      },
      {
        step: 6,
        description: "Add beef broth, herbs, and return roast to pot",
        duration: 3,
      },
      {
        step: 7,
        description: "Cover and braise in oven for 2 hours",
        duration: 120,
      },
      {
        step: 8,
        description: "Add potatoes, carrots, and celery around roast",
        duration: 5,
      },
      {
        step: 9,
        description: "Continue cooking for 1 hour until vegetables are tender",
        duration: 60,
      },
      {
        step: 10,
        description: "Remove herbs and let rest 10 minutes before slicing",
        duration: 10,
      },
    ],
    difficulty: "easy",
    description:
      "A classic Sunday pot roast with tender chuck roast and vegetables slow-braised in a rich wine and herb broth.",
    image_url:
      "https://images.unsplash.com/photo-1574484284002-952d92456975?ixlib=rb-4.0.3&auto=format&fit=crop&w=1000&q=80",
    prep_time: 20,
    cook_time: 200,
    cuisine_type: "American",
    dietary_tags: ["gluten-free option"],
    nutrition: {
      calories: 420,
      protein: 45,
      carbs: 28,
      fat: 15,
      fiber: 4,
      sugar: 8,
    },
    import_metadata: {
      source_url: "https://trending-recipes.com/recipe-2",
      scraper_name: "manual_curation",
      scraper_version: "1.0.0",
      confidence_score: 0.9,
      extracted_at: "2024-08-05T07:00:00Z",
      notes:
        "Curated popular recipe based on trending social media and food blog analysis",
    },
  },
  {
    title: "Texas-Style Beef Chili",
    ingredients: [
      {
        name: "ground beef",
        amount: "2",
        unit: "lbs",
      },
      {
        name: "beef chuck",
        amount: "1",
        unit: "lb",
      },
      {
        name: "yellow onions",
        amount: "2",
        unit: "large",
      },
      {
        name: "bell peppers",
        amount: "2",
        unit: "peppers",
      },
      {
        name: "jalapeo peppers",
        amount: "2",
        unit: "peppers",
      },
      {
        name: "garlic",
        amount: "6",
        unit: "cloves",
      },
      {
        name: "diced tomatoes",
        amount: "28",
        unit: "oz can",
      },
      {
        name: "tomato paste",
        amount: "3",
        unit: "tbsp",
      },
      {
        name: "beef broth",
        amount: "2",
        unit: "cups",
      },
      {
        name: "dark beer",
        amount: "12",
        unit: "oz",
      },
      {
        name: "chili powder",
        amount: "3",
        unit: "tbsp",
      },
      {
        name: "cumin",
        amount: "2",
        unit: "tbsp",
      },
      {
        name: "smoked paprika",
        amount: "1",
        unit: "tbsp",
      },
      {
        name: "oregano",
        amount: "1",
        unit: "tsp",
      },
      {
        name: "cayenne pepper",
        amount: "1/4",
        unit: "tsp",
      },
      {
        name: "cocoa powder",
        amount: "1",
        unit: "tbsp",
      },
      {
        name: "olive oil",
        amount: "2",
        unit: "tbsp",
      },
      {
        name: "salt",
        amount: "2",
        unit: "tsp",
      },
      {
        name: "black pepper",
        amount: "1",
        unit: "tsp",
      },
    ],
    instructions: [
      {
        step: 1,
        description:
          "Cut chuck roast into 1/2-inch cubes and season with salt and pepper",
        duration: 10,
      },
      {
        step: 2,
        description:
          "Heat oil in large Dutch oven, brown beef cubes in batches, about 8 minutes per batch",
        duration: 16,
      },
      {
        step: 3,
        description:
          "Remove beef, add ground beef and cook until browned, breaking up with spoon",
        duration: 8,
      },
      {
        step: 4,
        description:
          "Add onions, bell peppers, and jalapeos, cook until softened, about 6 minutes",
        duration: 6,
      },
      {
        step: 5,
        description:
          "Add garlic, chili powder, cumin, paprika, oregano, and cayenne, cook 1 minute",
        duration: 1,
      },
      {
        step: 6,
        description: "Stir in tomato paste and cocoa powder, cook 1 minute",
        duration: 1,
      },
      {
        step: 7,
        description:
          "Add diced tomatoes, beef broth, beer, and browned beef cubes",
        duration: 3,
      },
      {
        step: 8,
        description:
          "Bring to boil, then reduce heat and simmer covered for 1.5 hours",
        duration: 90,
      },
      {
        step: 9,
        description: "Remove lid and simmer 30 minutes more until thick",
        duration: 30,
      },
      {
        step: 10,
        description: "Adjust seasoning with salt and pepper before serving",
        duration: 2,
      },
    ],
    difficulty: "medium",
    description:
      "An authentic Texas-style chili with no beans, featuring chunks of beef chuck and ground beef in a rich, spicy sauce.",
    image_url:
      "https://images.unsplash.com/photo-1578662996442-48f60103fc96?ixlib=rb-4.0.3&auto=format&fit=crop&w=1000&q=80",
    prep_time: 25,
    cook_time: 165,
    cuisine_type: "Tex-Mex",
    dietary_tags: ["gluten-free", "dairy-free", "keto-friendly"],
    nutrition: {
      calories: 380,
      protein: 35,
      carbs: 12,
      fat: 20,
      fiber: 4,
      sugar: 8,
    },
    import_metadata: {
      source_url: "https://trending-recipes.com/recipe-3",
      scraper_name: "manual_curation",
      scraper_version: "1.0.0",
      confidence_score: 0.9,
      extracted_at: "2024-08-05T07:00:00Z",
      notes:
        "Curated popular recipe based on trending social media and food blog analysis",
    },
  },
  {
    title: "Indian Butter Chickpeas (Chole Makhani)",
    ingredients: [
      {
        name: "chickpeas",
        amount: "2",
        unit: "15-oz cans",
      },
      {
        name: "crushed tomatoes",
        amount: "14",
        unit: "oz can",
      },
      {
        name: "coconut milk",
        amount: "1",
        unit: "13.5-oz can",
      },
      {
        name: "yellow onion",
        amount: "1",
        unit: "large",
      },
      {
        name: "ginger",
        amount: "2",
        unit: "inches",
      },
      {
        name: "garlic",
        amount: "6",
        unit: "cloves",
      },
      {
        name: "tomato paste",
        amount: "2",
        unit: "tbsp",
      },
      {
        name: "garam masala",
        amount: "2",
        unit: "tsp",
      },
      {
        name: "ground cumin",
        amount: "1",
        unit: "tsp",
      },
      {
        name: "turmeric",
        amount: "1/2",
        unit: "tsp",
      },
      {
        name: "smoked paprika",
        amount: "1",
        unit: "tsp",
      },
      {
        name: "cayenne pepper",
        amount: "1/4",
        unit: "tsp",
      },
      {
        name: "coconut oil",
        amount: "2",
        unit: "tbsp",
      },
      {
        name: "fresh cilantro",
        amount: "1/4",
        unit: "cup",
      },
      {
        name: "lime juice",
        amount: "2",
        unit: "tbsp",
      },
      {
        name: "salt",
        amount: "1",
        unit: "tsp",
      },
      {
        name: "brown sugar",
        amount: "1",
        unit: "tbsp",
      },
    ],
    instructions: [
      {
        step: 1,
        description: "Drain and rinse chickpeas, set aside",
        duration: 2,
      },
      {
        step: 2,
        description: "Heat coconut oil in large skillet over medium heat",
        duration: 2,
      },
      {
        step: 3,
        description: "Saut diced onion until golden, about 6 minutes",
        duration: 6,
      },
      {
        step: 4,
        description:
          "Add minced ginger and garlic, cook until fragrant, 1 minute",
        duration: 1,
      },
      {
        step: 5,
        description: "Stir in tomato paste and all spices, cook 1 minute",
        duration: 1,
      },
      {
        step: 6,
        description: "Add crushed tomatoes and bring to simmer, cook 5 minutes",
        duration: 5,
      },
      {
        step: 7,
        description: "Add chickpeas and coconut milk, bring to gentle boil",
        duration: 3,
      },
      {
        step: 8,
        description: "Reduce heat and simmer 15 minutes until thickened",
        duration: 15,
      },
      {
        step: 9,
        description: "Stir in brown sugar, lime juice, and half the cilantro",
        duration: 2,
      },
      {
        step: 10,
        description: "Season with salt and garnish with remaining cilantro",
        duration: 1,
      },
    ],
    difficulty: "easy",
    description:
      "A rich and creamy Indian-inspired chickpea curry with warming spices, perfect served over basmati rice or with naan bread.",
    image_url:
      "https://images.unsplash.com/photo-1565557623262-b51c2513a641?ixlib=rb-4.0.3&auto=format&fit=crop&w=1000&q=80",
    prep_time: 15,
    cook_time: 29,
    cuisine_type: "Indian",
    dietary_tags: ["vegan", "gluten-free", "dairy-free"],
    nutrition: {
      calories: 320,
      protein: 12,
      carbs: 42,
      fat: 14,
      fiber: 12,
      sugar: 15,
    },
    import_metadata: {
      source_url: "https://trending-recipes.com/recipe-4",
      scraper_name: "manual_curation",
      scraper_version: "1.0.0",
      confidence_score: 0.9,
      extracted_at: "2024-08-05T07:00:00Z",
      notes:
        "Curated popular recipe based on trending social media and food blog analysis",
    },
  },
  {
    title: "Mediterranean White Bean Spinach Skillet",
    ingredients: [
      {
        name: "cannellini beans",
        amount: "2",
        unit: "15-oz cans",
      },
      {
        name: "baby spinach",
        amount: "5",
        unit: "oz",
      },
      {
        name: "cherry tomatoes",
        amount: "1",
        unit: "pint",
      },
      {
        name: "red onion",
        amount: "1",
        unit: "medium",
      },
      {
        name: "garlic",
        amount: "4",
        unit: "cloves",
      },
      {
        name: "vegetable broth",
        amount: "1/2",
        unit: "cup",
      },
      {
        name: "white wine",
        amount: "1/4",
        unit: "cup",
      },
      {
        name: "lemon juice",
        amount: "3",
        unit: "tbsp",
      },
      {
        name: "lemon zest",
        amount: "1",
        unit: "lemon",
      },
      {
        name: "feta cheese",
        amount: "4",
        unit: "oz",
      },
      {
        name: "kalamata olives",
        amount: "1/3",
        unit: "cup",
      },
      {
        name: "fresh oregano",
        amount: "2",
        unit: "tbsp",
      },
      {
        name: "fresh parsley",
        amount: "1/4",
        unit: "cup",
      },
      {
        name: "olive oil",
        amount: "3",
        unit: "tbsp",
      },
      {
        name: "red pepper flakes",
        amount: "1/4",
        unit: "tsp",
      },
      {
        name: "salt",
        amount: "1/2",
        unit: "tsp",
      },
      {
        name: "black pepper",
        amount: "1/4",
        unit: "tsp",
      },
    ],
    instructions: [
      {
        step: 1,
        description: "Drain and rinse beans, halve cherry tomatoes",
        duration: 3,
      },
      {
        step: 2,
        description: "Heat olive oil in large skillet over medium heat",
        duration: 2,
      },
      {
        step: 3,
        description: "Saut sliced red onion until softened, about 4 minutes",
        duration: 4,
      },
      {
        step: 4,
        description: "Add garlic and red pepper flakes, cook 1 minute",
        duration: 1,
      },
      {
        step: 5,
        description:
          "Add cherry tomatoes, cook until they start to break down, 3 minutes",
        duration: 3,
      },
      {
        step: 6,
        description:
          "Add white wine and let it reduce by half, about 2 minutes",
        duration: 2,
      },
      {
        step: 7,
        description:
          "Add beans, broth, oregano, salt and pepper, simmer 5 minutes",
        duration: 5,
      },
      {
        step: 8,
        description: "Add spinach in batches, stirring until wilted",
        duration: 3,
      },
      {
        step: 9,
        description: "Remove from heat, stir in lemon juice and zest",
        duration: 1,
      },
      {
        step: 10,
        description: "Top with crumbled feta, olives, and fresh parsley",
        duration: 2,
      },
    ],
    difficulty: "medium",
    description:
      "A vibrant Mediterranean one-pan meal with creamy white beans, fresh spinach, cherry tomatoes, and tangy feta cheese.",
    image_url:
      "https://images.unsplash.com/photo-1512621776951-a57141f2eefd?ixlib=rb-4.0.3&auto=format&fit=crop&w=1000&q=80",
    prep_time: 10,
    cook_time: 36,
    cuisine_type: "Mediterranean",
    dietary_tags: ["vegetarian", "gluten-free"],
    nutrition: {
      calories: 285,
      protein: 15,
      carbs: 35,
      fat: 12,
      fiber: 10,
      sugar: 8,
    },
    import_metadata: {
      source_url: "https://trending-recipes.com/recipe-5",
      scraper_name: "manual_curation",
      scraper_version: "1.0.0",
      confidence_score: 0.9,
      extracted_at: "2024-08-05T07:00:00Z",
      notes:
        "Curated popular recipe based on trending social media and food blog analysis",
    },
  },
  {
    title: "Marry Me Chickpeas with Sun-Dried Tomatoes",
    ingredients: [
      {
        name: "chickpeas",
        amount: "2",
        unit: "15-oz cans",
      },
      {
        name: "heavy cream",
        amount: "1/2",
        unit: "cup",
      },
      {
        name: "vegetable broth",
        amount: "3/4",
        unit: "cup",
      },
      {
        name: "sun-dried tomatoes",
        amount: "1/2",
        unit: "cup",
      },
      {
        name: "yellow onion",
        amount: "1",
        unit: "medium",
      },
      {
        name: "garlic",
        amount: "4",
        unit: "cloves",
      },
      {
        name: "parmesan cheese",
        amount: "1/3",
        unit: "cup",
      },
      {
        name: "fresh thyme",
        amount: "1",
        unit: "tbsp",
      },
      {
        name: "fresh basil",
        amount: "1/4",
        unit: "cup",
      },
      {
        name: "baby spinach",
        amount: "2",
        unit: "cups",
      },
      {
        name: "olive oil",
        amount: "2",
        unit: "tbsp",
      },
      {
        name: "red pepper flakes",
        amount: "1/4",
        unit: "tsp",
      },
      {
        name: "salt",
        amount: "1/2",
        unit: "tsp",
      },
      {
        name: "black pepper",
        amount: "1/4",
        unit: "tsp",
      },
    ],
    instructions: [
      {
        step: 1,
        description: "Drain and rinse chickpeas, chop sun-dried tomatoes",
        duration: 3,
      },
      {
        step: 2,
        description: "Heat olive oil in large skillet over medium heat",
        duration: 2,
      },
      {
        step: 3,
        description: "Saut diced onion until translucent, about 5 minutes",
        duration: 5,
      },
      {
        step: 4,
        description: "Add garlic, thyme, and red pepper flakes, cook 1 minute",
        duration: 1,
      },
      {
        step: 5,
        description:
          "Add vegetable broth and sun-dried tomatoes, bring to simmer",
        duration: 3,
      },
      {
        step: 6,
        description: "Add chickpeas and simmer 5 minutes",
        duration: 5,
      },
      {
        step: 7,
        description:
          "Stir in heavy cream and parmesan, cook until creamy, 3 minutes",
        duration: 3,
      },
      {
        step: 8,
        description: "Add spinach and cook until wilted, 2 minutes",
        duration: 2,
      },
      {
        step: 9,
        description: "Season with salt and pepper",
        duration: 1,
      },
      {
        step: 10,
        description: "Garnish with fresh basil before serving",
        duration: 1,
      },
    ],
    difficulty: "easy",
    description:
      "A vegetarian twist on the viral Marry Me Chicken, featuring chickpeas in a creamy sun-dried tomato and parmesan sauce.",
    image_url:
      "https://images.unsplash.com/photo-1544378730-6ad9dc8d8da0?ixlib=rb-4.0.3&auto=format&fit=crop&w=1000&q=80",
    prep_time: 8,
    cook_time: 26,
    cuisine_type: "Mediterranean",
    dietary_tags: ["vegetarian", "gluten-free"],
    nutrition: {
      calories: 295,
      protein: 13,
      carbs: 32,
      fat: 14,
      fiber: 9,
      sugar: 12,
    },
    import_metadata: {
      source_url: "https://trending-recipes.com/recipe-6",
      scraper_name: "manual_curation",
      scraper_version: "1.0.0",
      confidence_score: 0.9,
      extracted_at: "2024-08-05T07:00:00Z",
      notes:
        "Curated popular recipe based on trending social media and food blog analysis",
    },
  },
  {
    title: "Original Marry Me Chicken",
    ingredients: [
      {
        name: "chicken breasts",
        amount: "4",
        unit: "8-oz pieces",
      },
      {
        name: "heavy cream",
        amount: "1/2",
        unit: "cup",
      },
      {
        name: "chicken broth",
        amount: "3/4",
        unit: "cup",
      },
      {
        name: "sun-dried tomatoes",
        amount: "1/2",
        unit: "cup",
      },
      {
        name: "garlic",
        amount: "3",
        unit: "cloves",
      },
      {
        name: "parmesan cheese",
        amount: "1/4",
        unit: "cup",
      },
      {
        name: "fresh thyme",
        amount: "1",
        unit: "tbsp",
      },
      {
        name: "fresh basil",
        amount: "1/4",
        unit: "cup",
      },
      {
        name: "olive oil",
        amount: "3",
        unit: "tbsp",
      },
      {
        name: "red pepper flakes",
        amount: "1/2",
        unit: "tsp",
      },
      {
        name: "salt",
        amount: "1",
        unit: "tsp",
      },
      {
        name: "black pepper",
        amount: "1/2",
        unit: "tsp",
      },
    ],
    instructions: [
      {
        step: 1,
        description:
          "Preheat oven to 375F and season chicken with salt and pepper",
        duration: 3,
      },
      {
        step: 2,
        description:
          "Heat 1 tbsp oil in large oven-safe skillet over medium-high heat",
        duration: 2,
      },
      {
        step: 3,
        description: "Sear chicken until golden brown, 5 minutes per side",
        duration: 10,
      },
      {
        step: 4,
        description: "Remove chicken and set aside",
        duration: 1,
      },
      {
        step: 5,
        description:
          "Add remaining oil, saut garlic, thyme, and red pepper flakes, 1 minute",
        duration: 1,
      },
      {
        step: 6,
        description: "Add broth, sun-dried tomatoes, cream, and parmesan",
        duration: 2,
      },
      {
        step: 7,
        description: "Bring to simmer and season with salt",
        duration: 2,
      },
      {
        step: 8,
        description: "Return chicken to skillet with any juices",
        duration: 1,
      },
      {
        step: 9,
        description:
          "Transfer to oven and bake 10-12 minutes until chicken is cooked through",
        duration: 12,
      },
      {
        step: 10,
        description: "Garnish with fresh basil and serve",
        duration: 2,
      },
    ],
    difficulty: "medium",
    description:
      "The viral TikTok sensation featuring golden chicken in a creamy sun-dried tomato and parmesan sauce that's so good, it might just inspire a proposal!",
    image_url:
      "https://images.unsplash.com/photo-1588166524941-3bf61a9c41db?ixlib=rb-4.0.3&auto=format&fit=crop&w=1000&q=80",
    prep_time: 10,
    cook_time: 36,
    cuisine_type: "Italian-American",
    dietary_tags: ["gluten-free", "keto-friendly"],
    nutrition: {
      calories: 420,
      protein: 48,
      carbs: 8,
      fat: 22,
      fiber: 2,
      sugar: 6,
    },
    import_metadata: {
      source_url: "https://trending-recipes.com/recipe-7",
      scraper_name: "manual_curation",
      scraper_version: "1.0.0",
      confidence_score: 0.9,
      extracted_at: "2024-08-05T07:00:00Z",
      notes:
        "Curated popular recipe based on trending social media and food blog analysis",
    },
  },
  {
    title: "Honey Soy Glazed Chicken Thighs",
    ingredients: [
      {
        name: "chicken thighs",
        amount: "8",
        unit: "bone-in",
      },
      {
        name: "soy sauce",
        amount: "1/3",
        unit: "cup",
      },
      {
        name: "honey",
        amount: "1/4",
        unit: "cup",
      },
      {
        name: "rice vinegar",
        amount: "2",
        unit: "tbsp",
      },
      {
        name: "sesame oil",
        amount: "1",
        unit: "tbsp",
      },
      {
        name: "garlic",
        amount: "4",
        unit: "cloves",
      },
      {
        name: "fresh ginger",
        amount: "1",
        unit: "inch piece",
      },
      {
        name: "green onions",
        amount: "4",
        unit: "stalks",
      },
      {
        name: "sesame seeds",
        amount: "2",
        unit: "tbsp",
      },
      {
        name: "vegetable oil",
        amount: "2",
        unit: "tbsp",
      },
      {
        name: "red pepper flakes",
        amount: "1/4",
        unit: "tsp",
      },
      {
        name: "cornstarch",
        amount: "1",
        unit: "tbsp",
      },
      {
        name: "water",
        amount: "2",
        unit: "tbsp",
      },
    ],
    instructions: [
      {
        step: 1,
        description: "Preheat oven to 425F and pat chicken thighs dry",
        duration: 3,
      },
      {
        step: 2,
        description: "Season chicken with salt and pepper",
        duration: 2,
      },
      {
        step: 3,
        description:
          "Heat vegetable oil in large oven-safe skillet over medium-high heat",
        duration: 2,
      },
      {
        step: 4,
        description:
          "Sear chicken skin-side down until crispy, about 6 minutes",
        duration: 6,
      },
      {
        step: 5,
        description: "Flip chicken and cook 3 minutes more",
        duration: 3,
      },
      {
        step: 6,
        description:
          "Meanwhile, whisk together soy sauce, honey, vinegar, sesame oil, minced garlic, and ginger",
        duration: 3,
      },
      {
        step: 7,
        description: "Pour glaze over chicken and transfer to oven",
        duration: 2,
      },
      {
        step: 8,
        description: "Bake 20-25 minutes until chicken reaches 165F",
        duration: 25,
      },
      {
        step: 9,
        description:
          "Mix cornstarch and water, stir into pan juices to thicken",
        duration: 2,
      },
      {
        step: 10,
        description: "Garnish with sliced green onions and sesame seeds",
        duration: 2,
      },
    ],
    difficulty: "medium",
    description:
      "Crispy-skinned chicken thighs glazed with a sweet and savory honey soy sauce, perfect served over rice with steamed vegetables.",
    image_url:
      "https://images.unsplash.com/photo-1598514982901-ae62764ae7ea?ixlib=rb-4.0.3&auto=format&fit=crop&w=1000&q=80",
    prep_time: 8,
    cook_time: 36,
    cuisine_type: "Asian Fusion",
    dietary_tags: ["gluten-free option", "dairy-free"],
    nutrition: {
      calories: 385,
      protein: 32,
      carbs: 18,
      fat: 22,
      fiber: 0,
      sugar: 16,
    },
    import_metadata: {
      source_url: "https://trending-recipes.com/recipe-8",
      scraper_name: "manual_curation",
      scraper_version: "1.0.0",
      confidence_score: 0.9,
      extracted_at: "2024-08-05T07:00:00Z",
      notes:
        "Curated popular recipe based on trending social media and food blog analysis",
    },
  },
  {
    title: "Crispy Chicken Parmesan",
    ingredients: [
      {
        name: "chicken breasts",
        amount: "4",
        unit: "6-oz pieces",
      },
      {
        name: "panko breadcrumbs",
        amount: "1.5",
        unit: "cups",
      },
      {
        name: "parmesan cheese",
        amount: "1/2",
        unit: "cup",
      },
      {
        name: "mozzarella cheese",
        amount: "1",
        unit: "cup",
      },
      {
        name: "marinara sauce",
        amount: "2",
        unit: "cups",
      },
      {
        name: "eggs",
        amount: "2",
        unit: "large",
      },
      {
        name: "flour",
        amount: "1/2",
        unit: "cup",
      },
      {
        name: "garlic powder",
        amount: "1",
        unit: "tsp",
      },
      {
        name: "Italian seasoning",
        amount: "1",
        unit: "tsp",
      },
      {
        name: "fresh basil",
        amount: "1/4",
        unit: "cup",
      },
      {
        name: "olive oil",
        amount: "1/4",
        unit: "cup",
      },
      {
        name: "salt",
        amount: "1",
        unit: "tsp",
      },
      {
        name: "black pepper",
        amount: "1/2",
        unit: "tsp",
      },
    ],
    instructions: [
      {
        step: 1,
        description:
          "Preheat oven to 425F and pound chicken to 1/2-inch thickness",
        duration: 5,
      },
      {
        step: 2,
        description:
          "Set up breading station: flour in one dish, beaten eggs in another",
        duration: 2,
      },
      {
        step: 3,
        description:
          "Mix panko, half the parmesan, garlic powder, Italian seasoning, salt and pepper",
        duration: 3,
      },
      {
        step: 4,
        description:
          "Dredge chicken in flour, then egg, then breadcrumb mixture",
        duration: 8,
      },
      {
        step: 5,
        description:
          "Heat olive oil in large oven-safe skillet over medium heat",
        duration: 2,
      },
      {
        step: 6,
        description:
          "Cook chicken until golden and crispy, 3-4 minutes per side",
        duration: 8,
      },
      {
        step: 7,
        description: "Spread marinara sauce over chicken",
        duration: 2,
      },
      {
        step: 8,
        description: "Top with mozzarella and remaining parmesan",
        duration: 2,
      },
      {
        step: 9,
        description:
          "Bake 15-20 minutes until cheese is bubbly and chicken reaches 165F",
        duration: 20,
      },
      {
        step: 10,
        description: "Garnish with fresh basil and let rest 5 minutes",
        duration: 5,
      },
    ],
    difficulty: "hard",
    description:
      "Restaurant-quality chicken parmesan with crispy breaded cutlets topped with marinara and melted cheese, baked to perfection.",
    image_url:
      "https://images.unsplash.com/photo-1632778149955-e80f8ceca2e8?ixlib=rb-4.0.3&auto=format&fit=crop&w=1000&q=80",
    prep_time: 15,
    cook_time: 29,
    cuisine_type: "Italian-American",
    dietary_tags: [],
    nutrition: {
      calories: 495,
      protein: 52,
      carbs: 28,
      fat: 21,
      fiber: 3,
      sugar: 8,
    },
    import_metadata: {
      source_url: "https://trending-recipes.com/recipe-9",
      scraper_name: "manual_curation",
      scraper_version: "1.0.0",
      confidence_score: 0.9,
      extracted_at: "2024-08-05T07:00:00Z",
      notes:
        "Curated popular recipe based on trending social media and food blog analysis",
    },
  },
  {
    title: "Pan-Seared Salmon with Lemon Garlic Butter",
    ingredients: [
      {
        name: "salmon fillets",
        amount: "4",
        unit: "6-oz pieces",
      },
      {
        name: "butter",
        amount: "4",
        unit: "tbsp",
      },
      {
        name: "garlic",
        amount: "4",
        unit: "cloves",
      },
      {
        name: "lemon juice",
        amount: "3",
        unit: "tbsp",
      },
      {
        name: "lemon zest",
        amount: "1",
        unit: "lemon",
      },
      {
        name: "fresh dill",
        amount: "2",
        unit: "tbsp",
      },
      {
        name: "capers",
        amount: "2",
        unit: "tbsp",
      },
      {
        name: "white wine",
        amount: "1/4",
        unit: "cup",
      },
      {
        name: "olive oil",
        amount: "2",
        unit: "tbsp",
      },
      {
        name: "salt",
        amount: "1",
        unit: "tsp",
      },
      {
        name: "black pepper",
        amount: "1/2",
        unit: "tsp",
      },
      {
        name: "paprika",
        amount: "1/2",
        unit: "tsp",
      },
    ],
    instructions: [
      {
        step: 1,
        description: "Pat salmon dry and season with salt, pepper, and paprika",
        duration: 3,
      },
      {
        step: 2,
        description: "Heat olive oil in large skillet over medium-high heat",
        duration: 2,
      },
      {
        step: 3,
        description: "Cook salmon skin-side up for 4-5 minutes until golden",
        duration: 5,
      },
      {
        step: 4,
        description: "Flip salmon and cook 3-4 minutes more",
        duration: 4,
      },
      {
        step: 5,
        description: "Remove salmon and keep warm",
        duration: 1,
      },
      {
        step: 6,
        description: "Reduce heat to medium, add butter to same pan",
        duration: 1,
      },
      {
        step: 7,
        description: "Add garlic and cook until fragrant, 30 seconds",
        duration: 1,
      },
      {
        step: 8,
        description: "Add white wine and let reduce by half, 2 minutes",
        duration: 2,
      },
      {
        step: 9,
        description: "Stir in lemon juice, zest, capers, and dill",
        duration: 1,
      },
      {
        step: 10,
        description: "Return salmon to pan and spoon sauce over top",
        duration: 2,
      },
    ],
    difficulty: "easy",
    description:
      "Perfectly seared salmon with crispy skin and a bright lemon garlic butter sauce with capers and fresh dill.",
    image_url:
      "https://images.unsplash.com/photo-1467003909585-2f8a72700288?ixlib=rb-4.0.3&auto=format&fit=crop&w=1000&q=80",
    prep_time: 5,
    cook_time: 41,
    cuisine_type: "Mediterranean",
    dietary_tags: ["gluten-free", "keto-friendly"],
    nutrition: {
      calories: 385,
      protein: 42,
      carbs: 3,
      fat: 22,
      fiber: 0,
      sugar: 1,
    },
    import_metadata: {
      source_url: "https://trending-recipes.com/recipe-10",
      scraper_name: "manual_curation",
      scraper_version: "1.0.0",
      confidence_score: 0.9,
      extracted_at: "2024-08-05T07:00:00Z",
      notes:
        "Curated popular recipe based on trending social media and food blog analysis",
    },
  },
  {
    title: "Garlic Butter Shrimp Scampi",
    ingredients: [
      {
        name: "large shrimp",
        amount: "2",
        unit: "lbs",
      },
      {
        name: "linguine pasta",
        amount: "1",
        unit: "lb",
      },
      {
        name: "butter",
        amount: "6",
        unit: "tbsp",
      },
      {
        name: "garlic",
        amount: "8",
        unit: "cloves",
      },
      {
        name: "white wine",
        amount: "1/2",
        unit: "cup",
      },
      {
        name: "lemon juice",
        amount: "1/4",
        unit: "cup",
      },
      {
        name: "lemon zest",
        amount: "2",
        unit: "lemons",
      },
      {
        name: "fresh parsley",
        amount: "1/2",
        unit: "cup",
      },
      {
        name: "parmesan cheese",
        amount: "1/2",
        unit: "cup",
      },
      {
        name: "olive oil",
        amount: "3",
        unit: "tbsp",
      },
      {
        name: "red pepper flakes",
        amount: "1/2",
        unit: "tsp",
      },
      {
        name: "salt",
        amount: "1",
        unit: "tsp",
      },
      {
        name: "black pepper",
        amount: "1/2",
        unit: "tsp",
      },
    ],
    instructions: [
      {
        step: 1,
        description:
          "Cook linguine according to package directions, reserve 1 cup pasta water",
        duration: 12,
      },
      {
        step: 2,
        description: "Pat shrimp dry and season with salt and pepper",
        duration: 3,
      },
      {
        step: 3,
        description: "Heat olive oil in large skillet over medium-high heat",
        duration: 2,
      },
      {
        step: 4,
        description:
          "Cook shrimp 2 minutes per side until pink, remove and set aside",
        duration: 4,
      },
      {
        step: 5,
        description: "Reduce heat to medium, add butter to same pan",
        duration: 1,
      },
      {
        step: 6,
        description: "Add garlic and red pepper flakes, cook 1 minute",
        duration: 1,
      },
      {
        step: 7,
        description: "Add white wine and cook until reduced by half, 3 minutes",
        duration: 3,
      },
      {
        step: 8,
        description:
          "Add cooked pasta, lemon juice, zest, and 1/2 cup pasta water",
        duration: 2,
      },
      {
        step: 9,
        description: "Return shrimp to pan and toss with parsley",
        duration: 2,
      },
      {
        step: 10,
        description: "Serve immediately with parmesan cheese",
        duration: 1,
      },
    ],
    difficulty: "medium",
    description:
      "Classic Italian-American shrimp scampi with tender shrimp, garlic, white wine, and lemon served over linguine pasta.",
    image_url:
      "https://images.unsplash.com/photo-1563379091339-03246963d14d?ixlib=rb-4.0.3&auto=format&fit=crop&w=1000&q=80",
    prep_time: 10,
    cook_time: 36,
    cuisine_type: "Italian-American",
    dietary_tags: [],
    nutrition: {
      calories: 445,
      protein: 28,
      carbs: 42,
      fat: 16,
      fiber: 2,
      sugar: 3,
    },
    import_metadata: {
      source_url: "https://trending-recipes.com/recipe-11",
      scraper_name: "manual_curation",
      scraper_version: "1.0.0",
      confidence_score: 0.9,
      extracted_at: "2024-08-05T07:00:00Z",
      notes:
        "Curated popular recipe based on trending social media and food blog analysis",
    },
  },
  {
    title: "Crispy Pan-Seared Scallops with Cauliflower Pure",
    ingredients: [
      {
        name: "sea scallops",
        amount: "1.5",
        unit: "lbs",
      },
      {
        name: "cauliflower",
        amount: "1",
        unit: "large head",
      },
      {
        name: "heavy cream",
        amount: "1/2",
        unit: "cup",
      },
      {
        name: "butter",
        amount: "4",
        unit: "tbsp",
      },
      {
        name: "garlic",
        amount: "3",
        unit: "cloves",
      },
      {
        name: "vegetable broth",
        amount: "1/2",
        unit: "cup",
      },
      {
        name: "lemon juice",
        amount: "2",
        unit: "tbsp",
      },
      {
        name: "fresh chives",
        amount: "2",
        unit: "tbsp",
      },
      {
        name: "olive oil",
        amount: "2",
        unit: "tbsp",
      },
      {
        name: "salt",
        amount: "1",
        unit: "tsp",
      },
      {
        name: "white pepper",
        amount: "1/4",
        unit: "tsp",
      },
    ],
    instructions: [
      {
        step: 1,
        description:
          "Cut cauliflower into florets and boil until tender, 15 minutes",
        duration: 15,
      },
      {
        step: 2,
        description:
          "Drain cauliflower and pure with cream, butter, garlic, salt and pepper",
        duration: 5,
      },
      {
        step: 3,
        description: "Pass through fine mesh strainer for smooth texture",
        duration: 3,
      },
      {
        step: 4,
        description: "Remove side muscles from scallops and pat completely dry",
        duration: 5,
      },
      {
        step: 5,
        description: "Season scallops with salt and pepper",
        duration: 2,
      },
      {
        step: 6,
        description: "Heat olive oil in large skillet over high heat",
        duration: 2,
      },
      {
        step: 7,
        description:
          "Sear scallops without moving for 2-3 minutes until golden crust forms",
        duration: 3,
      },
      {
        step: 8,
        description: "Flip scallops and cook 1-2 minutes more",
        duration: 2,
      },
      {
        step: 9,
        description: "Add butter to pan and baste scallops",
        duration: 1,
      },
      {
        step: 10,
        description:
          "Serve scallops over warm cauliflower pure, garnish with chives",
        duration: 2,
      },
    ],
    difficulty: "hard",
    description:
      "Restaurant-quality seared scallops with perfect golden crust served over silky cauliflower pure with fresh herbs.",
    image_url:
      "https://images.unsplash.com/photo-1559847844-d721426d6edc?ixlib=rb-4.0.3&auto=format&fit=crop&w=1000&q=80",
    prep_time: 15,
    cook_time: 29,
    cuisine_type: "French",
    dietary_tags: ["gluten-free", "keto-friendly"],
    nutrition: {
      calories: 285,
      protein: 24,
      carbs: 12,
      fat: 16,
      fiber: 4,
      sugar: 6,
    },
    import_metadata: {
      source_url: "https://trending-recipes.com/recipe-12",
      scraper_name: "manual_curation",
      scraper_version: "1.0.0",
      confidence_score: 0.9,
      extracted_at: "2024-08-05T07:00:00Z",
      notes:
        "Curated popular recipe based on trending social media and food blog analysis",
    },
  },
  {
    title: "30-Minute Pork Piccata",
    ingredients: [
      {
        name: "pork tenderloin",
        amount: "2",
        unit: "lbs",
      },
      {
        name: "flour",
        amount: "1/2",
        unit: "cup",
      },
      {
        name: "butter",
        amount: "4",
        unit: "tbsp",
      },
      {
        name: "olive oil",
        amount: "2",
        unit: "tbsp",
      },
      {
        name: "garlic",
        amount: "3",
        unit: "cloves",
      },
      {
        name: "white wine",
        amount: "1/2",
        unit: "cup",
      },
      {
        name: "chicken broth",
        amount: "1/2",
        unit: "cup",
      },
      {
        name: "lemon juice",
        amount: "1/4",
        unit: "cup",
      },
      {
        name: "capers",
        amount: "3",
        unit: "tbsp",
      },
      {
        name: "fresh parsley",
        amount: "1/4",
        unit: "cup",
      },
      {
        name: "salt",
        amount: "1",
        unit: "tsp",
      },
      {
        name: "black pepper",
        amount: "1/2",
        unit: "tsp",
      },
    ],
    instructions: [
      {
        step: 1,
        description: "Slice pork tenderloin into 1/2-inch medallions",
        duration: 3,
      },
      {
        step: 2,
        description: "Pound pork to 1/4-inch thickness between plastic wrap",
        duration: 5,
      },
      {
        step: 3,
        description: "Season pork with salt and pepper, dredge in flour",
        duration: 3,
      },
      {
        step: 4,
        description:
          "Heat oil and 1 tbsp butter in large skillet over medium-high heat",
        duration: 2,
      },
      {
        step: 5,
        description: "Cook pork 2-3 minutes per side until golden",
        duration: 6,
      },
      {
        step: 6,
        description: "Remove pork and set aside",
        duration: 1,
      },
      {
        step: 7,
        description: "Add garlic to pan and cook 30 seconds",
        duration: 1,
      },
      {
        step: 8,
        description: "Add wine and broth, scraping up browned bits",
        duration: 2,
      },
      {
        step: 9,
        description: "Stir in lemon juice, capers, and remaining butter",
        duration: 2,
      },
      {
        step: 10,
        description: "Return pork to pan, garnish with parsley and serve",
        duration: 2,
      },
    ],
    difficulty: "medium",
    description:
      "Tender pork medallions in a bright lemon-caper sauce that comes together in just 30 minutes for an elegant weeknight dinner.",
    image_url:
      "https://images.unsplash.com/photo-1546833999-b9f581a1996d?ixlib=rb-4.0.3&auto=format&fit=crop&w=1000&q=80",
    prep_time: 8,
    cook_time: 38,
    cuisine_type: "Italian",
    dietary_tags: ["gluten-free option"],
    nutrition: {
      calories: 365,
      protein: 42,
      carbs: 8,
      fat: 16,
      fiber: 1,
      sugar: 2,
    },
    import_metadata: {
      source_url: "https://trending-recipes.com/recipe-13",
      scraper_name: "manual_curation",
      scraper_version: "1.0.0",
      confidence_score: 0.9,
      extracted_at: "2024-08-05T07:00:00Z",
      notes:
        "Curated popular recipe based on trending social media and food blog analysis",
    },
  },
  {
    title: "Maple Glazed Pork Chops with Sweet Potatoes",
    ingredients: [
      {
        name: "bone-in pork chops",
        amount: "4",
        unit: "1-inch thick",
      },
      {
        name: "sweet potatoes",
        amount: "2",
        unit: "large",
      },
      {
        name: "maple syrup",
        amount: "1/4",
        unit: "cup",
      },
      {
        name: "dijon mustard",
        amount: "2",
        unit: "tbsp",
      },
      {
        name: "apple cider vinegar",
        amount: "2",
        unit: "tbsp",
      },
      {
        name: "fresh rosemary",
        amount: "2",
        unit: "tbsp",
      },
      {
        name: "garlic",
        amount: "3",
        unit: "cloves",
      },
      {
        name: "olive oil",
        amount: "2",
        unit: "tbsp",
      },
      {
        name: "salt",
        amount: "1",
        unit: "tsp",
      },
      {
        name: "black pepper",
        amount: "1/2",
        unit: "tsp",
      },
      {
        name: "red pepper flakes",
        amount: "1/4",
        unit: "tsp",
      },
    ],
    instructions: [
      {
        step: 1,
        description: "Preheat oven to 425F",
        duration: 2,
      },
      {
        step: 2,
        description: "Cut sweet potatoes into 1-inch cubes",
        duration: 5,
      },
      {
        step: 3,
        description: "Toss sweet potatoes with oil, salt, and pepper",
        duration: 2,
      },
      {
        step: 4,
        description: "Roast sweet potatoes for 20 minutes",
        duration: 20,
      },
      {
        step: 5,
        description: "Season pork chops with salt and pepper",
        duration: 2,
      },
      {
        step: 6,
        description:
          "Mix maple syrup, mustard, vinegar, garlic, and rosemary for glaze",
        duration: 3,
      },
      {
        step: 7,
        description: "Sear pork chops in oven-safe skillet, 3 minutes per side",
        duration: 6,
      },
      {
        step: 8,
        description:
          "Brush pork with glaze and add to oven with sweet potatoes",
        duration: 2,
      },
      {
        step: 9,
        description: "Roast 12-15 minutes until pork reaches 145F",
        duration: 15,
      },
      {
        step: 10,
        description: "Let rest 5 minutes, brush with remaining glaze",
        duration: 5,
      },
    ],
    difficulty: "easy",
    description:
      "Juicy pork chops with a sweet maple glaze served alongside roasted sweet potatoes for a complete fall-inspired meal.",
    image_url:
      "https://images.unsplash.com/photo-1574484284002-952d92456975?ixlib=rb-4.0.3&auto=format&fit=crop&w=1000&q=80",
    prep_time: 12,
    cook_time: 62,
    cuisine_type: "American",
    dietary_tags: ["gluten-free", "dairy-free"],
    nutrition: {
      calories: 425,
      protein: 38,
      carbs: 35,
      fat: 15,
      fiber: 4,
      sugar: 28,
    },
    import_metadata: {
      source_url: "https://trending-recipes.com/recipe-14",
      scraper_name: "manual_curation",
      scraper_version: "1.0.0",
      confidence_score: 0.9,
      extracted_at: "2024-08-05T07:00:00Z",
      notes:
        "Curated popular recipe based on trending social media and food blog analysis",
    },
  },
  {
    title: "Asian-Style Pork Lettuce Wraps",
    ingredients: [
      {
        name: "ground pork",
        amount: "2",
        unit: "lbs",
      },
      {
        name: "butter lettuce",
        amount: "2",
        unit: "heads",
      },
      {
        name: "water chestnuts",
        amount: "8",
        unit: "oz can",
      },
      {
        name: "shiitake mushrooms",
        amount: "8",
        unit: "oz",
      },
      {
        name: "green onions",
        amount: "6",
        unit: "stalks",
      },
      {
        name: "garlic",
        amount: "4",
        unit: "cloves",
      },
      {
        name: "fresh ginger",
        amount: "2",
        unit: "inches",
      },
      {
        name: "soy sauce",
        amount: "1/4",
        unit: "cup",
      },
      {
        name: "hoisin sauce",
        amount: "3",
        unit: "tbsp",
      },
      {
        name: "rice vinegar",
        amount: "2",
        unit: "tbsp",
      },
      {
        name: "sesame oil",
        amount: "2",
        unit: "tbsp",
      },
      {
        name: "vegetable oil",
        amount: "2",
        unit: "tbsp",
      },
      {
        name: "red pepper flakes",
        amount: "1/4",
        unit: "tsp",
      },
    ],
    instructions: [
      {
        step: 1,
        description: "Separate lettuce leaves and rinse, set aside",
        duration: 5,
      },
      {
        step: 2,
        description: "Dice water chestnuts and mushrooms",
        duration: 5,
      },
      {
        step: 3,
        description:
          "Heat vegetable oil in large skillet over medium-high heat",
        duration: 2,
      },
      {
        step: 4,
        description:
          "Cook ground pork, breaking up with spoon, until browned, 6 minutes",
        duration: 6,
      },
      {
        step: 5,
        description: "Add mushrooms and cook until softened, 4 minutes",
        duration: 4,
      },
      {
        step: 6,
        description: "Add garlic, ginger, and red pepper flakes, cook 1 minute",
        duration: 1,
      },
      {
        step: 7,
        description: "Stir in soy sauce, hoisin sauce, and rice vinegar",
        duration: 2,
      },
      {
        step: 8,
        description: "Add water chestnuts and cook 2 minutes",
        duration: 2,
      },
      {
        step: 9,
        description: "Remove from heat, stir in sesame oil and green onions",
        duration: 1,
      },
      {
        step: 10,
        description: "Serve warm pork mixture in lettuce cups",
        duration: 2,
      },
    ],
    difficulty: "hard",
    description:
      "Fresh and flavorful Asian-inspired pork lettuce wraps with crispy water chestnuts and savory hoisin glaze.",
    image_url:
      "https://images.unsplash.com/photo-1586190848861-99aa4a171e90?ixlib=rb-4.0.3&auto=format&fit=crop&w=1000&q=80",
    prep_time: 15,
    cook_time: 31,
    cuisine_type: "Asian Fusion",
    dietary_tags: ["gluten-free option", "dairy-free", "keto-friendly"],
    nutrition: {
      calories: 285,
      protein: 26,
      carbs: 12,
      fat: 16,
      fiber: 3,
      sugar: 8,
    },
    import_metadata: {
      source_url: "https://trending-recipes.com/recipe-15",
      scraper_name: "manual_curation",
      scraper_version: "1.0.0",
      confidence_score: 0.9,
      extracted_at: "2024-08-05T07:00:00Z",
      notes:
        "Curated popular recipe based on trending social media and food blog analysis",
    },
  },
  {
    title: "Korean BBQ Tacos with Kimchi Slaw",
    ingredients: [
      {
        name: "flank steak",
        amount: "2",
        unit: "lbs",
      },
      {
        name: "corn tortillas",
        amount: "12",
        unit: "tortillas",
      },
      {
        name: "kimchi",
        amount: "1",
        unit: "cup",
      },
      {
        name: "cabbage",
        amount: "2",
        unit: "cups",
      },
      {
        name: "soy sauce",
        amount: "1/4",
        unit: "cup",
      },
      {
        name: "brown sugar",
        amount: "3",
        unit: "tbsp",
      },
      {
        name: "sesame oil",
        amount: "2",
        unit: "tbsp",
      },
      {
        name: "rice vinegar",
        amount: "2",
        unit: "tbsp",
      },
      {
        name: "gochujang",
        amount: "2",
        unit: "tbsp",
      },
      {
        name: "garlic",
        amount: "4",
        unit: "cloves",
      },
      {
        name: "fresh ginger",
        amount: "1",
        unit: "inch",
      },
      {
        name: "green onions",
        amount: "4",
        unit: "stalks",
      },
      {
        name: "cilantro",
        amount: "1/2",
        unit: "cup",
      },
      {
        name: "lime",
        amount: "2",
        unit: "limes",
      },
      {
        name: "vegetable oil",
        amount: "2",
        unit: "tbsp",
      },
    ],
    instructions: [
      {
        step: 1,
        description:
          "Marinate sliced flank steak in soy sauce, brown sugar, sesame oil, garlic, and ginger for 30 minutes",
        duration: 30,
      },
      {
        step: 2,
        description:
          "Make kimchi slaw by mixing chopped kimchi, cabbage, rice vinegar, and lime juice",
        duration: 5,
      },
      {
        step: 3,
        description: "Heat vegetable oil in large skillet over high heat",
        duration: 2,
      },
      {
        step: 4,
        description: "Cook marinated steak in batches, 2-3 minutes per side",
        duration: 6,
      },
      {
        step: 5,
        description: "Remove steak and let rest, then slice against grain",
        duration: 3,
      },
      {
        step: 6,
        description: "Warm tortillas in dry skillet or microwave",
        duration: 2,
      },
      {
        step: 7,
        description: "Mix gochujang with lime juice for spicy sauce",
        duration: 2,
      },
      {
        step: 8,
        description:
          "Assemble tacos with steak, kimchi slaw, and gochujang sauce",
        duration: 5,
      },
      {
        step: 9,
        description: "Garnish with sliced green onions and cilantro",
        duration: 2,
      },
      {
        step: 10,
        description: "Serve immediately with lime wedges",
        duration: 1,
      },
    ],
    difficulty: "medium",
    description:
      "A delicious fusion of Korean flavors and Mexican street food with marinated beef, tangy kimchi slaw, and spicy gochujang sauce.",
    image_url:
      "https://images.unsplash.com/photo-1565299507177-b0ac66763828?ixlib=rb-4.0.3&auto=format&fit=crop&w=1000&q=80",
    prep_time: 40,
    cook_time: 18,
    cuisine_type: "Korean-Mexican Fusion",
    dietary_tags: ["dairy-free", "gluten-free option"],
    nutrition: {
      calories: 345,
      protein: 28,
      carbs: 22,
      fat: 18,
      fiber: 3,
      sugar: 8,
    },
    import_metadata: {
      source_url: "https://trending-recipes.com/recipe-16",
      scraper_name: "manual_curation",
      scraper_version: "1.0.0",
      confidence_score: 0.9,
      extracted_at: "2024-08-05T07:00:00Z",
      notes:
        "Curated popular recipe based on trending social media and food blog analysis",
    },
  },
  {
    title: "Moroccan Spiced Lamb Burgers with Tzatziki",
    ingredients: [
      {
        name: "ground lamb",
        amount: "2",
        unit: "lbs",
      },
      {
        name: "brioche buns",
        amount: "6",
        unit: "buns",
      },
      {
        name: "greek yogurt",
        amount: "1",
        unit: "cup",
      },
      {
        name: "cucumber",
        amount: "1",
        unit: "large",
      },
      {
        name: "red onion",
        amount: "1/2",
        unit: "onion",
      },
      {
        name: "fresh mint",
        amount: "1/4",
        unit: "cup",
      },
      {
        name: "fresh parsley",
        amount: "1/4",
        unit: "cup",
      },
      {
        name: "garlic",
        amount: "3",
        unit: "cloves",
      },
      {
        name: "cumin",
        amount: "2",
        unit: "tsp",
      },
      {
        name: "coriander",
        amount: "1",
        unit: "tsp",
      },
      {
        name: "cinnamon",
        amount: "1/2",
        unit: "tsp",
      },
      {
        name: "paprika",
        amount: "1",
        unit: "tsp",
      },
      {
        name: "lemon juice",
        amount: "2",
        unit: "tbsp",
      },
      {
        name: "olive oil",
        amount: "2",
        unit: "tbsp",
      },
      {
        name: "feta cheese",
        amount: "4",
        unit: "oz",
      },
      {
        name: "arugula",
        amount: "2",
        unit: "cups",
      },
    ],
    instructions: [
      {
        step: 1,
        description: "Grate cucumber and drain in colander for 10 minutes",
        duration: 10,
      },
      {
        step: 2,
        description:
          "Mix drained cucumber with yogurt, minced garlic, and lemon juice for tzatziki",
        duration: 3,
      },
      {
        step: 3,
        description:
          "Combine ground lamb with cumin, coriander, cinnamon, paprika, salt, and pepper",
        duration: 3,
      },
      {
        step: 4,
        description: "Add minced onion, mint, and parsley to lamb mixture",
        duration: 2,
      },
      {
        step: 5,
        description: "Form into 6 patties and chill 15 minutes",
        duration: 15,
      },
      {
        step: 6,
        description: "Heat olive oil in large skillet over medium-high heat",
        duration: 2,
      },
      {
        step: 7,
        description: "Cook lamb burgers 4-5 minutes per side for medium",
        duration: 10,
      },
      {
        step: 8,
        description: "Toast brioche buns lightly",
        duration: 2,
      },
      {
        step: 9,
        description:
          "Assemble burgers with tzatziki, arugula, and crumbled feta",
        duration: 3,
      },
      {
        step: 10,
        description: "Serve immediately with extra tzatziki on side",
        duration: 1,
      },
    ],
    difficulty: "hard",
    description:
      "Juicy lamb burgers seasoned with warm Moroccan spices, topped with cool tzatziki and fresh Mediterranean flavors.",
    image_url:
      "https://images.unsplash.com/photo-1568901346375-23c9450c58cd?ixlib=rb-4.0.3&auto=format&fit=crop&w=1000&q=80",
    prep_time: 25,
    cook_time: 19,
    cuisine_type: "Moroccan-Greek Fusion",
    dietary_tags: ["gluten-free option"],
    nutrition: {
      calories: 485,
      protein: 35,
      carbs: 28,
      fat: 26,
      fiber: 2,
      sugar: 8,
    },
    import_metadata: {
      source_url: "https://trending-recipes.com/recipe-17",
      scraper_name: "manual_curation",
      scraper_version: "1.0.0",
      confidence_score: 0.9,
      extracted_at: "2024-08-05T07:00:00Z",
      notes:
        "Curated popular recipe based on trending social media and food blog analysis",
    },
  },
  {
    title: "Classic Beef Stroganoff over Egg Noodles",
    ingredients: [
      {
        name: "beef sirloin",
        amount: "2",
        unit: "lbs",
      },
      {
        name: "egg noodles",
        amount: "12",
        unit: "oz",
      },
      {
        name: "cremini mushrooms",
        amount: "1",
        unit: "lb",
      },
      {
        name: "yellow onion",
        amount: "1",
        unit: "large",
      },
      {
        name: "sour cream",
        amount: "1",
        unit: "cup",
      },
      {
        name: "beef broth",
        amount: "2",
        unit: "cups",
      },
      {
        name: "flour",
        amount: "3",
        unit: "tbsp",
      },
      {
        name: "dijon mustard",
        amount: "2",
        unit: "tbsp",
      },
      {
        name: "worcestershire sauce",
        amount: "1",
        unit: "tbsp",
      },
      {
        name: "garlic",
        amount: "4",
        unit: "cloves",
      },
      {
        name: "butter",
        amount: "4",
        unit: "tbsp",
      },
      {
        name: "olive oil",
        amount: "2",
        unit: "tbsp",
      },
      {
        name: "fresh parsley",
        amount: "1/4",
        unit: "cup",
      },
      {
        name: "salt",
        amount: "1.5",
        unit: "tsp",
      },
      {
        name: "black pepper",
        amount: "3/4",
        unit: "tsp",
      },
    ],
    instructions: [
      {
        step: 1,
        description: "Cut beef into strips and season with salt and pepper",
        duration: 5,
      },
      {
        step: 2,
        description: "Cook egg noodles according to package directions",
        duration: 10,
      },
      {
        step: 3,
        description:
          "Heat oil in large skillet, sear beef in batches until browned",
        duration: 8,
      },
      {
        step: 4,
        description:
          "Remove beef, add butter and saut sliced mushrooms and onion",
        duration: 6,
      },
      {
        step: 5,
        description: "Add garlic and cook 1 minute",
        duration: 1,
      },
      {
        step: 6,
        description: "Sprinkle flour over vegetables and cook 2 minutes",
        duration: 2,
      },
      {
        step: 7,
        description: "Gradually whisk in beef broth until smooth",
        duration: 3,
      },
      {
        step: 8,
        description: "Add worcestershire and dijon, bring to simmer",
        duration: 2,
      },
      {
        step: 9,
        description: "Return beef to pan and simmer until tender, 5 minutes",
        duration: 5,
      },
      {
        step: 10,
        description: "Remove from heat, stir in sour cream and parsley",
        duration: 2,
      },
    ],
    difficulty: "medium",
    description:
      "The ultimate comfort food classic with tender beef strips, mushrooms, and a rich sour cream sauce served over buttery egg noodles.",
    image_url:
      "https://images.unsplash.com/photo-1565299624946-b28f40a0ca4b?ixlib=rb-4.0.3&auto=format&fit=crop&w=1000&q=80",
    prep_time: 15,
    cook_time: 29,
    cuisine_type: "Russian-American",
    dietary_tags: [],
    nutrition: {
      calories: 475,
      protein: 38,
      carbs: 35,
      fat: 22,
      fiber: 3,
      sugar: 6,
    },
    import_metadata: {
      source_url: "https://trending-recipes.com/recipe-18",
      scraper_name: "manual_curation",
      scraper_version: "1.0.0",
      confidence_score: 0.9,
      extracted_at: "2024-08-05T07:00:00Z",
      notes:
        "Curated popular recipe based on trending social media and food blog analysis",
    },
  },
  {
    title: "Ultimate Mac and Cheese with Crispy Breadcrumbs",
    ingredients: [
      {
        name: "elbow macaroni",
        amount: "1",
        unit: "lb",
      },
      {
        name: "sharp cheddar",
        amount: "8",
        unit: "oz",
      },
      {
        name: "gruyere cheese",
        amount: "4",
        unit: "oz",
      },
      {
        name: "cream cheese",
        amount: "4",
        unit: "oz",
      },
      {
        name: "heavy cream",
        amount: "1",
        unit: "cup",
      },
      {
        name: "milk",
        amount: "2",
        unit: "cups",
      },
      {
        name: "butter",
        amount: "6",
        unit: "tbsp",
      },
      {
        name: "flour",
        amount: "1/4",
        unit: "cup",
      },
      {
        name: "panko breadcrumbs",
        amount: "1",
        unit: "cup",
      },
      {
        name: "parmesan cheese",
        amount: "1/2",
        unit: "cup",
      },
      {
        name: "garlic powder",
        amount: "1",
        unit: "tsp",
      },
      {
        name: "mustard powder",
        amount: "1",
        unit: "tsp",
      },
      {
        name: "paprika",
        amount: "1/2",
        unit: "tsp",
      },
      {
        name: "salt",
        amount: "1",
        unit: "tsp",
      },
      {
        name: "white pepper",
        amount: "1/4",
        unit: "tsp",
      },
    ],
    instructions: [
      {
        step: 1,
        description:
          "Preheat oven to 375F and cook pasta until just shy of al dente",
        duration: 8,
      },
      {
        step: 2,
        description: "Melt 4 tbsp butter in large saucepan over medium heat",
        duration: 2,
      },
      {
        step: 3,
        description: "Whisk in flour and cook for 2 minutes",
        duration: 2,
      },
      {
        step: 4,
        description: "Gradually whisk in milk and cream, cook until thickened",
        duration: 5,
      },
      {
        step: 5,
        description:
          "Add cream cheese, mustard powder, garlic powder, salt, and pepper",
        duration: 2,
      },
      {
        step: 6,
        description:
          "Remove from heat, stir in cheddar and gruyere until melted",
        duration: 3,
      },
      {
        step: 7,
        description:
          "Combine pasta and cheese sauce, transfer to buttered baking dish",
        duration: 3,
      },
      {
        step: 8,
        description: "Mix breadcrumbs with remaining butter and parmesan",
        duration: 2,
      },
      {
        step: 9,
        description: "Top pasta with breadcrumb mixture and bake 25 minutes",
        duration: 25,
      },
      {
        step: 10,
        description: "Let rest 5 minutes before serving",
        duration: 5,
      },
    ],
    difficulty: "easy",
    description:
      "The ultimate comfort food with creamy three-cheese sauce, perfectly cooked pasta, and golden crispy breadcrumb topping.",
    image_url:
      "https://images.unsplash.com/photo-1543339494-b4cd4f7ba686?ixlib=rb-4.0.3&auto=format&fit=crop&w=1000&q=80",
    prep_time: 15,
    cook_time: 57,
    cuisine_type: "American",
    dietary_tags: ["vegetarian"],
    nutrition: {
      calories: 520,
      protein: 22,
      carbs: 48,
      fat: 28,
      fiber: 2,
      sugar: 8,
    },
    import_metadata: {
      source_url: "https://trending-recipes.com/recipe-19",
      scraper_name: "manual_curation",
      scraper_version: "1.0.0",
      confidence_score: 0.9,
      extracted_at: "2024-08-05T07:00:00Z",
      notes:
        "Curated popular recipe based on trending social media and food blog analysis",
    },
  },
  {
    title: "Loaded Baked Potato Soup",
    ingredients: [
      {
        name: "russet potatoes",
        amount: "6",
        unit: "large",
      },
      {
        name: "bacon",
        amount: "8",
        unit: "strips",
      },
      {
        name: "butter",
        amount: "4",
        unit: "tbsp",
      },
      {
        name: "flour",
        amount: "1/4",
        unit: "cup",
      },
      {
        name: "chicken broth",
        amount: "4",
        unit: "cups",
      },
      {
        name: "heavy cream",
        amount: "1",
        unit: "cup",
      },
      {
        name: "sour cream",
        amount: "1/2",
        unit: "cup",
      },
      {
        name: "sharp cheddar",
        amount: "2",
        unit: "cups",
      },
      {
        name: "green onions",
        amount: "4",
        unit: "stalks",
      },
      {
        name: "garlic",
        amount: "3",
        unit: "cloves",
      },
      {
        name: "yellow onion",
        amount: "1",
        unit: "medium",
      },
      {
        name: "salt",
        amount: "1",
        unit: "tsp",
      },
      {
        name: "black pepper",
        amount: "1/2",
        unit: "tsp",
      },
      {
        name: "paprika",
        amount: "1/2",
        unit: "tsp",
      },
    ],
    instructions: [
      {
        step: 1,
        description: "Bake potatoes at 425F for 45 minutes until tender",
        duration: 45,
      },
      {
        step: 2,
        description: "Cook bacon until crispy, reserve drippings",
        duration: 8,
      },
      {
        step: 3,
        description: "Cool potatoes, scoop out flesh, and roughly mash",
        duration: 10,
      },
      {
        step: 4,
        description:
          "Saut diced onion and garlic in bacon drippings until soft",
        duration: 5,
      },
      {
        step: 5,
        description: "Add butter and flour, cook for 2 minutes",
        duration: 2,
      },
      {
        step: 6,
        description: "Gradually whisk in chicken broth until smooth",
        duration: 3,
      },
      {
        step: 7,
        description: "Add mashed potatoes and simmer 10 minutes",
        duration: 10,
      },
      {
        step: 8,
        description: "Stir in heavy cream and heat through",
        duration: 3,
      },
      {
        step: 9,
        description: "Remove from heat, add sour cream and most of the cheese",
        duration: 2,
      },
      {
        step: 10,
        description: "Serve topped with bacon, cheese, and green onions",
        duration: 2,
      },
    ],
    difficulty: "easy",
    description:
      "Rich and creamy potato soup loaded with bacon, cheese, and green onions - like a baked potato in soup form!",
    image_url:
      "https://images.unsplash.com/photo-1547592166-23ac45744acd?ixlib=rb-4.0.3&auto=format&fit=crop&w=1000&q=80",
    prep_time: 15,
    cook_time: 90,
    cuisine_type: "American",
    dietary_tags: ["gluten-free option"],
    nutrition: {
      calories: 445,
      protein: 18,
      carbs: 35,
      fat: 28,
      fiber: 4,
      sugar: 8,
    },
    import_metadata: {
      source_url: "https://trending-recipes.com/recipe-20",
      scraper_name: "manual_curation",
      scraper_version: "1.0.0",
      confidence_score: 0.9,
      extracted_at: "2024-08-05T07:00:00Z",
      notes:
        "Curated popular recipe based on trending social media and food blog analysis",
    },
  },
];

async function seedRecipes() {
  try {
    // Test database connection
    const connected = await testConnection();
    if (!connected) {
      throw new Error("Database connection failed");
    }

    console.log("Starting recipe seeding...");

    // Check if recipes already exist
    const existingRecipes = await query(
      "SELECT COUNT(*) as count FROM recipes"
    );
    const recipeCount = parseInt(existingRecipes.rows[0].count);

    if (recipeCount > 0) {
      console.log(
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
      console.log("Created system user for recipe seeding");
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
        console.log(`Inserted recipe: ${recipe.title}`);
      } catch (error) {
        console.error(
          `Failed to insert recipe ${recipe.title}:`,
          error.message
        );
      }
    }

    console.log(`Recipe seeding completed. Inserted ${insertedCount} recipes.`);

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
    console.error("Recipe seeding failed:", error);
    throw error;
  }
}

seedRecipes()
  .then(() => {
    console.log("✅ Recipe seeding completed successfully!");
    process.exit(0);
  })
  .catch((error) => {
    console.error("❌ Recipe seeding failed:", error.message);
    process.exit(1);
  });

export default { seedRecipes, sampleRecipes };
