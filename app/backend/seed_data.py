#!/usr/bin/env python3
"""
Seed script to populate DinDin database with sample recipes
"""

import asyncio
from motor.motor_asyncio import AsyncIOMotorClient
from dotenv import load_dotenv
import os
from pathlib import Path

# Load environment variables
ROOT_DIR = Path(__file__).parent
load_dotenv(ROOT_DIR / '.env')

# MongoDB connection
mongo_url = os.environ['MONGO_URL']
client = AsyncIOMotorClient(mongo_url)
db = client[os.environ.get('DB_NAME', 'dindin_db')]

# Sample recipes data
SAMPLE_RECIPES = [
    {
        "id": "1",
        "title": "Classic Chicken Parmesan",
        "description": "Crispy breaded chicken breast topped with marinara sauce and melted mozzarella cheese.",
        "image_url": "https://images.unsplash.com/photo-1565299624946-b28f40a0ca4b?w=400&h=300&fit=crop",
        "prep_time": 20,
        "cook_time": 25,
        "difficulty": "medium",
        "cuisine_type": "Italian",
        "dietary_tags": [],
        "ingredients": [
            {"name": "chicken breast", "amount": "4", "unit": "pieces"},
            {"name": "breadcrumbs", "amount": "1", "unit": "cup"},
            {"name": "marinara sauce", "amount": "2", "unit": "cups"},
            {"name": "mozzarella cheese", "amount": "1", "unit": "cup"},
            {"name": "parmesan cheese", "amount": "1/2", "unit": "cup"},
            {"name": "eggs", "amount": "2", "unit": "large"},
            {"name": "flour", "amount": "1", "unit": "cup"}
        ],
        "instructions": [
            {"step": 1, "description": "Preheat oven to 400°F (200°C)", "duration": 5},
            {"step": 2, "description": "Set up breading station with flour, beaten eggs, and breadcrumbs", "duration": 5},
            {"step": 3, "description": "Pound chicken breasts to even thickness and season with salt and pepper", "duration": 10},
            {"step": 4, "description": "Bread chicken by coating in flour, then egg, then breadcrumbs", "duration": 10},
            {"step": 5, "description": "Bake chicken for 20 minutes until golden and cooked through", "duration": 20},
            {"step": 6, "description": "Top with marinara sauce and cheeses, bake 5 more minutes", "duration": 5}
        ],
        "nutrition": {
            "calories": 485,
            "protein": 45,
            "carbs": 25,
            "fat": 22,
            "fiber": 2,
            "sugar": 8
        }
    },
    {
        "id": "2",
        "title": "Vegetarian Buddha Bowl",
        "description": "A colorful and nutritious bowl packed with quinoa, roasted vegetables, and tahini dressing.",
        "image_url": "https://images.unsplash.com/photo-1512621776951-a57141f2eefd?w=400&h=300&fit=crop",
        "prep_time": 15,
        "cook_time": 30,
        "difficulty": "easy",
        "cuisine_type": "Mediterranean",
        "dietary_tags": ["vegetarian", "gluten-free", "healthy"],
        "ingredients": [
            {"name": "quinoa", "amount": "1", "unit": "cup"},
            {"name": "sweet potato", "amount": "2", "unit": "medium"},
            {"name": "chickpeas", "amount": "1", "unit": "can"},
            {"name": "tahini", "amount": "3", "unit": "tbsp"},
            {"name": "lemon juice", "amount": "2", "unit": "tbsp"},
            {"name": "kale", "amount": "2", "unit": "cups"},
            {"name": "avocado", "amount": "1", "unit": "large"}
        ],
        "instructions": [
            {"step": 1, "description": "Cook quinoa according to package instructions", "duration": 15},
            {"step": 2, "description": "Dice sweet potato and roast at 400°F for 25 minutes", "duration": 30},
            {"step": 3, "description": "Drain and rinse chickpeas, toss with olive oil and roast for 20 minutes", "duration": 25},
            {"step": 4, "description": "Make tahini dressing by whisking tahini, lemon juice, and water", "duration": 5},
            {"step": 5, "description": "Massage kale with a bit of olive oil until tender", "duration": 5},
            {"step": 6, "description": "Assemble bowls with quinoa, vegetables, chickpeas, and dressing", "duration": 10}
        ],
        "nutrition": {
            "calories": 420,
            "protein": 18,
            "carbs": 55,
            "fat": 16,
            "fiber": 12,
            "sugar": 9
        }
    },
    {
        "id": "3",
        "title": "Spicy Thai Basil Stir Fry",
        "description": "Quick and flavorful stir fry with fresh basil, chilies, and your choice of protein.",
        "image_url": "https://images.unsplash.com/photo-1559314809-0f31657def3e?w=400&h=300&fit=crop",
        "prep_time": 10,
        "cook_time": 15,
        "difficulty": "easy",
        "cuisine_type": "Thai",
        "dietary_tags": ["spicy", "gluten-free"],
        "ingredients": [
            {"name": "ground beef", "amount": "1", "unit": "lb"},
            {"name": "thai basil", "amount": "1", "unit": "cup"},
            {"name": "thai chilies", "amount": "2-3", "unit": "pieces"},
            {"name": "fish sauce", "amount": "2", "unit": "tbsp"},
            {"name": "soy sauce", "amount": "1", "unit": "tbsp"},
            {"name": "garlic", "amount": "4", "unit": "cloves"},
            {"name": "jasmine rice", "amount": "2", "unit": "cups"}
        ],
        "instructions": [
            {"step": 1, "description": "Cook jasmine rice according to package instructions", "duration": 20},
            {"step": 2, "description": "Heat oil in wok or large skillet over high heat", "duration": 2},
            {"step": 3, "description": "Add minced garlic and chilies, stir fry for 30 seconds", "duration": 1},
            {"step": 4, "description": "Add ground beef and cook, breaking it up, until browned", "duration": 8},
            {"step": 5, "description": "Add fish sauce and soy sauce, stir to combine", "duration": 2},
            {"step": 6, "description": "Add thai basil and stir until wilted, serve over rice", "duration": 2}
        ],
        "nutrition": {
            "calories": 520,
            "protein": 35,
            "carbs": 45,
            "fat": 22,
            "fiber": 2,
            "sugar": 3
        }
    },
    {
        "id": "4",
        "title": "Mediterranean Salmon with Lemon",
        "description": "Baked salmon with herbs, lemon, and olive oil served with roasted vegetables.",
        "image_url": "https://images.unsplash.com/photo-1467003909585-2f8a72700288?w=400&h=300&fit=crop",
        "prep_time": 15,
        "cook_time": 20,
        "difficulty": "easy",
        "cuisine_type": "Mediterranean",
        "dietary_tags": ["healthy", "keto", "gluten-free"],
        "ingredients": [
            {"name": "salmon fillets", "amount": "4", "unit": "pieces"},
            {"name": "lemon", "amount": "2", "unit": "large"},
            {"name": "olive oil", "amount": "3", "unit": "tbsp"},
            {"name": "fresh dill", "amount": "2", "unit": "tbsp"},
            {"name": "cherry tomatoes", "amount": "1", "unit": "pint"},
            {"name": "zucchini", "amount": "2", "unit": "medium"},
            {"name": "red onion", "amount": "1", "unit": "medium"}
        ],
        "instructions": [
            {"step": 1, "description": "Preheat oven to 425°F (220°C)", "duration": 5},
            {"step": 2, "description": "Cut vegetables into bite-sized pieces", "duration": 10},
            {"step": 3, "description": "Toss vegetables with olive oil, salt, and pepper", "duration": 5},
            {"step": 4, "description": "Place salmon on baking sheet with vegetables", "duration": 3},
            {"step": 5, "description": "Drizzle salmon with lemon juice and sprinkle with dill", "duration": 3},
            {"step": 6, "description": "Bake for 15-18 minutes until salmon flakes easily", "duration": 18}
        ],
        "nutrition": {
            "calories": 380,
            "protein": 42,
            "carbs": 12,
            "fat": 18,
            "fiber": 4,
            "sugar": 8
        }
    },
    {
        "id": "5",
        "title": "Classic Beef Tacos",
        "description": "Authentic Mexican street-style tacos with seasoned ground beef and fresh toppings.",
        "image_url": "https://images.unsplash.com/photo-1565299507177-b0ac66763376?w=400&h=300&fit=crop",
        "prep_time": 15,
        "cook_time": 20,
        "difficulty": "easy",
        "cuisine_type": "Mexican",
        "dietary_tags": ["gluten-free"],
        "ingredients": [
            {"name": "ground beef", "amount": "1", "unit": "lb"},
            {"name": "taco seasoning", "amount": "1", "unit": "packet"},
            {"name": "corn tortillas", "amount": "8", "unit": "small"},
            {"name": "white onion", "amount": "1", "unit": "medium"},
            {"name": "cilantro", "amount": "1/2", "unit": "cup"},
            {"name": "lime", "amount": "2", "unit": "limes"},
            {"name": "mexican cheese", "amount": "1", "unit": "cup"}
        ],
        "instructions": [
            {"step": 1, "description": "Brown ground beef in a large skillet over medium heat", "duration": 8},
            {"step": 2, "description": "Add taco seasoning and water, simmer for 5 minutes", "duration": 5},
            {"step": 3, "description": "Warm tortillas in a dry skillet or microwave", "duration": 3},
            {"step": 4, "description": "Dice onion finely and chop cilantro", "duration": 5},
            {"step": 5, "description": "Cut limes into wedges", "duration": 2},
            {"step": 6, "description": "Assemble tacos with meat, onion, cilantro, and cheese", "duration": 5}
        ],
        "nutrition": {
            "calories": 445,
            "protein": 28,
            "carbs": 35,
            "fat": 20,
            "fiber": 5,
            "sugar": 4
        }
    },
    {
        "id": "6",
        "title": "Creamy Mushroom Risotto",
        "description": "Rich and creamy Italian risotto with mixed mushrooms and parmesan cheese.",
        "image_url": "https://images.unsplash.com/photo-1476124369491-e7addf5db371?w=400&h=300&fit=crop",
        "prep_time": 15,
        "cook_time": 30,
        "difficulty": "hard",
        "cuisine_type": "Italian",
        "dietary_tags": ["vegetarian"],
        "ingredients": [
            {"name": "arborio rice", "amount": "1.5", "unit": "cups"},
            {"name": "mixed mushrooms", "amount": "1", "unit": "lb"},
            {"name": "vegetable broth", "amount": "6", "unit": "cups"},
            {"name": "white wine", "amount": "1/2", "unit": "cup"},
            {"name": "parmesan cheese", "amount": "1", "unit": "cup"},
            {"name": "butter", "amount": "4", "unit": "tbsp"},
            {"name": "shallot", "amount": "1", "unit": "large"}
        ],
        "instructions": [
            {"step": 1, "description": "Heat broth in a saucepan and keep warm", "duration": 5},
            {"step": 2, "description": "Sauté sliced mushrooms until golden, set aside", "duration": 8},
            {"step": 3, "description": "Sauté minced shallot in butter until translucent", "duration": 3},
            {"step": 4, "description": "Add rice and stir to coat with butter, toast for 2 minutes", "duration": 2},
            {"step": 5, "description": "Add wine and stir until absorbed", "duration": 3},
            {"step": 6, "description": "Add broth one ladle at a time, stirring constantly, for 18-20 minutes", "duration": 20},
            {"step": 7, "description": "Stir in mushrooms, parmesan, and butter to finish", "duration": 3}
        ],
        "nutrition": {
            "calories": 420,
            "protein": 15,
            "carbs": 58,
            "fat": 14,
            "fiber": 3,
            "sugar": 6
        }
    }
]

async def seed_database():
    """Seed the database with sample recipes"""
    try:
        # Clear existing recipes (optional - comment out to keep existing data)
        await db.recipes.delete_many({})
        print("Cleared existing recipes")
        
        # Insert sample recipes
        result = await db.recipes.insert_many(SAMPLE_RECIPES)
        print(f"Inserted {len(result.inserted_ids)} recipes")
        
        # Create indexes for better performance
        await db.recipes.create_index("difficulty")
        await db.recipes.create_index("cuisine_type")
        await db.recipes.create_index("dietary_tags")
        await db.users.create_index("google_id", unique=True)
        await db.users.create_index("email", unique=True)
        await db.swipe_history.create_index([("user_id", 1), ("recipe_id", 1)], unique=True)
        await db.matches.create_index([("user1_id", 1), ("user2_id", 1), ("recipe_id", 1)])
        
        print("Created database indexes")
        print("Database seeding completed successfully!")
        
    except Exception as e:
        print(f"Error seeding database: {e}")
    finally:
        client.close()

if __name__ == "__main__":
    asyncio.run(seed_database())