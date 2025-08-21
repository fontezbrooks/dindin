import { Nutrition } from '../models/nutrition.model.js';

// Comprehensive nutrition calculation service
export class NutritionCalculationService {
  
  // Estimate nutrition from ingredients using USDA database approximations
  static async calculateFromIngredients(ingredients: any[], servings: number = 1) {
    let totalNutrition = {
      calories: 0,
      protein: 0,
      carbohydrates: 0,
      fat: 0,
      fiber: 0,
      sugar: 0,
      saturatedFat: 0,
      sodium: 0,
      cholesterol: 0,
      // Micronutrients
      vitaminA: 0,
      vitaminC: 0,
      calcium: 0,
      iron: 0,
      potassium: 0,
    };

    // Basic ingredient nutrition database (simplified)
    const ingredientNutrition = this.getIngredientNutritionDatabase();

    for (const ingredient of ingredients) {
      const nutrition = this.estimateIngredientNutrition(ingredient, ingredientNutrition);
      
      // Add to totals
      Object.keys(totalNutrition).forEach(key => {
        totalNutrition[key] += nutrition[key] || 0;
      });
    }

    // Divide by servings to get per-serving nutrition
    Object.keys(totalNutrition).forEach(key => {
      totalNutrition[key] = Math.round((totalNutrition[key] / servings) * 10) / 10;
    });

    return {
      ...totalNutrition,
      servings,
      dataSource: 'calculated',
      accuracy: 0.7, // Estimated accuracy
      lastCalculated: new Date(),
    };
  }

  // Estimate individual ingredient nutrition
  private static estimateIngredientNutrition(ingredient: any, database: any) {
    const name = ingredient.name?.toLowerCase() || '';
    const amount = ingredient.amount || 1;
    const unit = ingredient.unit?.toLowerCase() || 'serving';
    
    // Find best match in database
    let nutritionData = database['generic'] || {}; // fallback
    
    // Look for exact matches first
    if (database[name]) {
      nutritionData = database[name];
    } else {
      // Look for partial matches
      const partialMatch = Object.keys(database).find(key => 
        name.includes(key) || key.includes(name)
      );
      if (partialMatch) {
        nutritionData = database[partialMatch];
      }
    }

    // Convert amount to standard serving size
    const servingMultiplier = this.convertToServingMultiplier(amount, unit);
    
    // Scale nutrition data
    const scaledNutrition = {};
    Object.keys(nutritionData).forEach(key => {
      scaledNutrition[key] = (nutritionData[key] || 0) * servingMultiplier;
    });

    return scaledNutrition;
  }

  // Convert various units to serving multipliers
  private static convertToServingMultiplier(amount: number, unit: string): number {
    const conversions = {
      // Volume
      'cup': 1,
      'cups': 1,
      'tablespoon': 1/16,
      'tablespoons': 1/16,
      'tbsp': 1/16,
      'teaspoon': 1/48,
      'teaspoons': 1/48,
      'tsp': 1/48,
      'ounce': 1/8,
      'ounces': 1/8,
      'oz': 1/8,
      'fluid ounce': 1/8,
      'fl oz': 1/8,
      'pint': 2,
      'pints': 2,
      'quart': 4,
      'quarts': 4,
      'gallon': 16,
      'gallons': 16,
      'liter': 4.23,
      'liters': 4.23,
      'milliliter': 1/240,
      'milliliters': 1/240,
      'ml': 1/240,
      
      // Weight
      'pound': 2,
      'pounds': 2,
      'lb': 2,
      'lbs': 2,
      'kilogram': 4.4,
      'kilograms': 4.4,
      'kg': 4.4,
      'gram': 1/227,
      'grams': 1/227,
      'g': 1/227,
      
      // Count
      'piece': 1,
      'pieces': 1,
      'item': 1,
      'items': 1,
      'serving': 1,
      'servings': 1,
      'slice': 0.5,
      'slices': 0.5,
      'clove': 0.1,
      'cloves': 0.1,
    };

    const multiplier = conversions[unit] || 1;
    return amount * multiplier;
  }

  // Basic nutrition database (simplified version)
  private static getIngredientNutritionDatabase() {
    return {
      // Proteins
      'chicken breast': {
        calories: 165, protein: 31, fat: 3.6, carbohydrates: 0,
        sodium: 74, cholesterol: 85, iron: 1.04, potassium: 256
      },
      'salmon': {
        calories: 206, protein: 28.8, fat: 9.9, carbohydrates: 0,
        sodium: 54, cholesterol: 63, calcium: 12, potassium: 384
      },
      'ground beef': {
        calories: 250, protein: 26, fat: 15, carbohydrates: 0,
        sodium: 75, cholesterol: 80, iron: 2.5, potassium: 318
      },
      'eggs': {
        calories: 155, protein: 13, fat: 11, carbohydrates: 1.1,
        sodium: 124, cholesterol: 373, calcium: 50, iron: 1.75
      },
      'tofu': {
        calories: 94, protein: 10, fat: 6, carbohydrates: 2.3,
        sodium: 7, calcium: 201, iron: 2.66, potassium: 148
      },
      
      // Grains
      'rice': {
        calories: 130, protein: 2.7, fat: 0.3, carbohydrates: 28,
        fiber: 0.4, sodium: 1, potassium: 55, iron: 0.8
      },
      'quinoa': {
        calories: 222, protein: 8.1, fat: 3.6, carbohydrates: 39,
        fiber: 5.2, sodium: 13, potassium: 318, iron: 2.8
      },
      'pasta': {
        calories: 131, protein: 5, fat: 1.1, carbohydrates: 25,
        fiber: 1.8, sodium: 1, potassium: 44, iron: 1.3
      },
      'bread': {
        calories: 67, protein: 2.3, fat: 1.2, carbohydrates: 12,
        fiber: 0.8, sodium: 127, potassium: 50, iron: 0.9
      },
      
      // Vegetables
      'broccoli': {
        calories: 25, protein: 3, fat: 0.4, carbohydrates: 5,
        fiber: 2.3, sodium: 33, vitaminC: 89, calcium: 47, potassium: 316
      },
      'spinach': {
        calories: 7, protein: 0.9, fat: 0.1, carbohydrates: 1.1,
        fiber: 0.7, sodium: 24, vitaminA: 469, calcium: 30, iron: 0.81
      },
      'carrots': {
        calories: 25, protein: 0.6, fat: 0.1, carbohydrates: 6,
        fiber: 1.7, sugar: 2.9, sodium: 42, vitaminA: 835, potassium: 195
      },
      'tomatoes': {
        calories: 11, protein: 0.5, fat: 0.1, carbohydrates: 2.4,
        fiber: 0.7, sugar: 1.6, sodium: 3, vitaminC: 7, potassium: 147
      },
      'onions': {
        calories: 25, protein: 0.7, fat: 0.1, carbohydrates: 5.8,
        fiber: 1.1, sugar: 2.6, sodium: 2, potassium: 89, vitaminC: 4.7
      },
      
      // Fruits
      'banana': {
        calories: 89, protein: 1.1, fat: 0.3, carbohydrates: 23,
        fiber: 2.6, sugar: 12.2, sodium: 1, potassium: 358, vitaminC: 8.7
      },
      'apple': {
        calories: 52, protein: 0.3, fat: 0.2, carbohydrates: 14,
        fiber: 2.4, sugar: 10.4, sodium: 1, potassium: 107, vitaminC: 4.6
      },
      'orange': {
        calories: 47, protein: 0.9, fat: 0.1, carbohydrates: 12,
        fiber: 2.4, sugar: 9.4, sodium: 0, vitaminC: 53.2, calcium: 40
      },
      
      // Dairy
      'milk': {
        calories: 61, protein: 3.2, fat: 3.5, carbohydrates: 4.5,
        sugar: 4.5, sodium: 44, calcium: 113, potassium: 143
      },
      'cheese': {
        calories: 113, protein: 7, fat: 9, carbohydrates: 1,
        sodium: 180, calcium: 202, cholesterol: 29
      },
      'yogurt': {
        calories: 61, protein: 3.5, fat: 3.3, carbohydrates: 4.7,
        sugar: 4.7, sodium: 46, calcium: 121, potassium: 155
      },
      
      // Oils and Fats
      'olive oil': {
        calories: 884, fat: 100, saturatedFat: 13.8, sodium: 2
      },
      'butter': {
        calories: 717, protein: 0.9, fat: 81, saturatedFat: 51,
        cholesterol: 215, sodium: 11, calcium: 24
      },
      
      // Generic fallback
      'generic': {
        calories: 50, protein: 2, fat: 1, carbohydrates: 10,
        sodium: 10
      }
    };
  }

  // Calculate macro percentages
  static calculateMacroPercentages(nutrition: any) {
    const totalCals = nutrition.calories || 1;
    const proteinCals = (nutrition.protein || 0) * 4;
    const carbCals = (nutrition.carbohydrates || 0) * 4;
    const fatCals = (nutrition.fat || 0) * 9;
    
    return {
      protein: Math.round((proteinCals / totalCals) * 100),
      carbohydrates: Math.round((carbCals / totalCals) * 100),
      fat: Math.round((fatCals / totalCals) * 100)
    };
  }

  // Determine dietary tags based on nutrition and ingredients
  static determineDietaryTags(ingredients: any[], nutrition: any) {
    const tags = [];
    const ingredientNames = ingredients.map(i => i.name?.toLowerCase() || '').join(' ');
    
    // Vegan check
    const animalProducts = ['chicken', 'beef', 'pork', 'fish', 'salmon', 'tuna', 'milk', 'cheese', 'butter', 'eggs', 'yogurt', 'cream'];
    if (!animalProducts.some(product => ingredientNames.includes(product))) {
      tags.push('vegan');
      tags.push('vegetarian');
    } else if (!['chicken', 'beef', 'pork', 'fish', 'salmon', 'tuna'].some(meat => ingredientNames.includes(meat))) {
      tags.push('vegetarian');
    }
    
    // Gluten-free check (simplified)
    const glutenSources = ['wheat', 'flour', 'bread', 'pasta', 'barley', 'rye'];
    if (!glutenSources.some(gluten => ingredientNames.includes(gluten))) {
      tags.push('gluten-free');
    }
    
    // Dairy-free check
    const dairyProducts = ['milk', 'cheese', 'butter', 'yogurt', 'cream'];
    if (!dairyProducts.some(dairy => ingredientNames.includes(dairy))) {
      tags.push('dairy-free');
    }
    
    // Low-carb check
    if (nutrition.carbohydrates < 20) {
      tags.push('low-carb');
    }
    
    // High-protein check
    if (nutrition.protein > 20) {
      tags.push('high-protein');
    }
    
    // Keto check (very low carb, high fat)
    if (nutrition.carbohydrates < 10 && nutrition.fat > 15) {
      tags.push('keto');
    }
    
    // Low-fat check
    if (nutrition.fat < 10) {
      tags.push('low-fat');
    }
    
    // Low-sodium check
    if (nutrition.sodium < 140) {
      tags.push('low-sodium');
    }
    
    return tags;
  }

  // Detect allergens
  static detectAllergens(ingredients: any[]) {
    const allergens = [];
    const ingredientNames = ingredients.map(i => i.name?.toLowerCase() || '').join(' ');
    
    const allergenMap = {
      'milk': ['milk', 'cheese', 'butter', 'yogurt', 'cream', 'whey', 'casein'],
      'eggs': ['egg', 'eggs', 'mayonnaise'],
      'fish': ['fish', 'salmon', 'tuna', 'cod', 'bass', 'trout'],
      'crustacean_shellfish': ['shrimp', 'crab', 'lobster', 'crawfish'],
      'tree_nuts': ['almond', 'walnut', 'pecan', 'cashew', 'pistachio', 'hazelnut'],
      'peanuts': ['peanut', 'peanuts'],
      'wheat': ['wheat', 'flour', 'bread', 'pasta', 'gluten'],
      'soybeans': ['soy', 'soybean', 'tofu', 'tempeh', 'miso'],
      'sesame': ['sesame', 'tahini']
    };
    
    Object.keys(allergenMap).forEach(allergen => {
      if (allergenMap[allergen].some(trigger => ingredientNames.includes(trigger))) {
        allergens.push(allergen);
      }
    });
    
    return allergens;
  }

  // Create comprehensive nutrition data for a recipe
  static async createNutritionProfile(recipeId: string, ingredients: any[], servings: number = 1) {
    const calculatedNutrition = await this.calculateFromIngredients(ingredients, servings);
    const dietaryTags = this.determineDietaryTags(ingredients, calculatedNutrition);
    const allergens = this.detectAllergens(ingredients);
    
    return {
      recipeId,
      ...calculatedNutrition,
      dietaryTags,
      allergens,
    };
  }

  // Update nutrition data for existing recipe
  static async updateRecipeNutrition(recipeId: string, ingredients: any[], servings: number = 1) {
    const nutritionProfile = await this.createNutritionProfile(recipeId, ingredients, servings);
    
    try {
      const existingNutrition = await Nutrition.findOne({ recipeId });
      
      if (existingNutrition) {
        Object.assign(existingNutrition, nutritionProfile);
        existingNutrition.lastCalculated = new Date();
        return await existingNutrition.save();
      } else {
        return await Nutrition.create(nutritionProfile);
      }
    } catch (error) {
      console.error('Error updating recipe nutrition:', error);
      throw new Error('Failed to update nutrition data');
    }
  }

  // Get nutrition with serving size adjustment
  static async getNutritionForServings(recipeId: string, targetServings: number = 1) {
    const nutrition = await Nutrition.findOne({ recipeId });
    if (!nutrition) {
      throw new Error('Nutrition data not found for recipe');
    }
    
    return nutrition.scaleForServings(targetServings);
  }
}