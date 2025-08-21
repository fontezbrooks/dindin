import mongoose from 'mongoose';

const { Schema, model } = mongoose;

// Comprehensive nutrition data model for recipes
const nutritionSchema = new Schema({
  recipeId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Recipe',
    required: true,
  },
  servings: {
    type: Number,
    required: true,
    min: 1,
    default: 1,
  },
  // Macronutrients (per serving)
  calories: {
    type: Number,
    required: true,
    min: 0,
  },
  protein: {
    type: Number,
    required: true,
    min: 0,
    // in grams
  },
  carbohydrates: {
    type: Number,
    required: true,
    min: 0,
    // in grams
  },
  fat: {
    type: Number,
    required: true,
    min: 0,
    // in grams
  },
  fiber: {
    type: Number,
    min: 0,
    // in grams
  },
  sugar: {
    type: Number,
    min: 0,
    // in grams
  },
  saturatedFat: {
    type: Number,
    min: 0,
    // in grams
  },
  unsaturatedFat: {
    type: Number,
    min: 0,
    // in grams
  },
  transFat: {
    type: Number,
    min: 0,
    // in grams
  },
  cholesterol: {
    type: Number,
    min: 0,
    // in milligrams
  },
  sodium: {
    type: Number,
    min: 0,
    // in milligrams
  },
  // Micronutrients (per serving)
  vitaminA: {
    type: Number,
    min: 0,
    // in IU (International Units)
  },
  vitaminC: {
    type: Number,
    min: 0,
    // in milligrams
  },
  vitaminD: {
    type: Number,
    min: 0,
    // in IU
  },
  vitaminE: {
    type: Number,
    min: 0,
    // in milligrams
  },
  vitaminK: {
    type: Number,
    min: 0,
    // in micrograms
  },
  thiamin: {
    type: Number,
    min: 0,
    // in milligrams
  },
  riboflavin: {
    type: Number,
    min: 0,
    // in milligrams
  },
  niacin: {
    type: Number,
    min: 0,
    // in milligrams
  },
  vitaminB6: {
    type: Number,
    min: 0,
    // in milligrams
  },
  folate: {
    type: Number,
    min: 0,
    // in micrograms
  },
  vitaminB12: {
    type: Number,
    min: 0,
    // in micrograms
  },
  biotin: {
    type: Number,
    min: 0,
    // in micrograms
  },
  pantothenicAcid: {
    type: Number,
    min: 0,
    // in milligrams
  },
  calcium: {
    type: Number,
    min: 0,
    // in milligrams
  },
  iron: {
    type: Number,
    min: 0,
    // in milligrams
  },
  magnesium: {
    type: Number,
    min: 0,
    // in milligrams
  },
  phosphorus: {
    type: Number,
    min: 0,
    // in milligrams
  },
  potassium: {
    type: Number,
    min: 0,
    // in milligrams
  },
  zinc: {
    type: Number,
    min: 0,
    // in milligrams
  },
  copper: {
    type: Number,
    min: 0,
    // in milligrams
  },
  manganese: {
    type: Number,
    min: 0,
    // in milligrams
  },
  selenium: {
    type: Number,
    min: 0,
    // in micrograms
  },
  // Dietary indicators
  dietaryTags: [{
    type: String,
    enum: [
      'vegan',
      'vegetarian',
      'gluten-free',
      'dairy-free',
      'nut-free',
      'soy-free',
      'egg-free',
      'keto',
      'low-carb',
      'high-protein',
      'low-fat',
      'low-sodium',
      'paleo',
      'whole30',
      'mediterranean',
      'dash',
      'anti-inflammatory',
      'diabetic-friendly',
      'heart-healthy'
    ]
  }],
  allergens: [{
    type: String,
    enum: [
      'milk',
      'eggs',
      'fish',
      'crustacean_shellfish',
      'tree_nuts',
      'peanuts',
      'wheat',
      'soybeans',
      'sesame'
    ]
  }],
  // Nutrition source and confidence
  dataSource: {
    type: String,
    enum: ['spoonacular', 'usda', 'manual', 'calculated'],
    default: 'calculated'
  },
  accuracy: {
    type: Number,
    min: 0,
    max: 1,
    default: 0.8 // confidence score
  },
  lastCalculated: {
    type: Date,
    default: Date.now
  },
}, {
  collection: 'nutrition_data',
  timestamps: true,
});

// Indexes for efficient querying
nutritionSchema.index({ recipeId: 1 });
nutritionSchema.index({ calories: 1 });
nutritionSchema.index({ dietaryTags: 1 });
nutritionSchema.index({ allergens: 1 });

// Virtual for total macro calories
nutritionSchema.virtual('macroCalories').get(function() {
  return (this.protein * 4) + (this.carbohydrates * 4) + (this.fat * 9);
});

// Virtual for macro percentages
nutritionSchema.virtual('macroPercentages').get(function() {
  const totalCals = this.calories || 1;
  return {
    protein: Math.round((this.protein * 4 / totalCals) * 100),
    carbs: Math.round((this.carbohydrates * 4 / totalCals) * 100),
    fat: Math.round((this.fat * 9 / totalCals) * 100)
  };
});

// Method to scale nutrition for different serving sizes
nutritionSchema.methods.scaleForServings = function(targetServings: number) {
  const scalingFactor = targetServings / this.servings;
  
  const scaledNutrition = {
    ...this.toObject(),
    servings: targetServings,
    calories: Math.round(this.calories * scalingFactor),
    protein: Math.round((this.protein * scalingFactor) * 10) / 10,
    carbohydrates: Math.round((this.carbohydrates * scalingFactor) * 10) / 10,
    fat: Math.round((this.fat * scalingFactor) * 10) / 10,
    fiber: Math.round((this.fiber * scalingFactor) * 10) / 10,
    sugar: Math.round((this.sugar * scalingFactor) * 10) / 10,
    saturatedFat: Math.round((this.saturatedFat * scalingFactor) * 10) / 10,
    sodium: Math.round(this.sodium * scalingFactor),
    cholesterol: Math.round(this.cholesterol * scalingFactor),
  };
  
  // Scale micronutrients
  const micronutrients = [
    'vitaminA', 'vitaminC', 'vitaminD', 'vitaminE', 'vitaminK',
    'thiamin', 'riboflavin', 'niacin', 'vitaminB6', 'folate', 'vitaminB12',
    'biotin', 'pantothenicAcid', 'calcium', 'iron', 'magnesium',
    'phosphorus', 'potassium', 'zinc', 'copper', 'manganese', 'selenium'
  ];
  
  micronutrients.forEach(nutrient => {
    if (this[nutrient]) {
      scaledNutrition[nutrient] = Math.round((this[nutrient] * scalingFactor) * 10) / 10;
    }
  });
  
  return scaledNutrition;
};

// Static method to get daily value percentages
nutritionSchema.statics.getDailyValuePercentages = function(nutritionData: any) {
  // Daily values based on 2000-calorie diet
  const dailyValues = {
    calories: 2000,
    protein: 50, // grams
    carbohydrates: 300, // grams
    fat: 65, // grams
    fiber: 25, // grams
    saturatedFat: 20, // grams
    cholesterol: 300, // mg
    sodium: 2300, // mg
    vitaminA: 5000, // IU
    vitaminC: 60, // mg
    vitaminD: 400, // IU
    calcium: 1000, // mg
    iron: 18, // mg
    potassium: 3500, // mg
  };
  
  const percentages: any = {};
  
  Object.keys(dailyValues).forEach(nutrient => {
    if (nutritionData[nutrient] && dailyValues[nutrient]) {
      percentages[nutrient] = Math.round((nutritionData[nutrient] / dailyValues[nutrient]) * 100);
    }
  });
  
  return percentages;
};

// Static method to compare nutrition between recipes
nutritionSchema.statics.compareNutrition = function(nutrition1: any, nutrition2: any) {
  const comparison = {
    calories: {
      recipe1: nutrition1.calories,
      recipe2: nutrition2.calories,
      difference: nutrition2.calories - nutrition1.calories,
      percentDifference: Math.round(((nutrition2.calories - nutrition1.calories) / nutrition1.calories) * 100)
    },
    protein: {
      recipe1: nutrition1.protein,
      recipe2: nutrition2.protein,
      difference: Math.round((nutrition2.protein - nutrition1.protein) * 10) / 10,
      percentDifference: Math.round(((nutrition2.protein - nutrition1.protein) / nutrition1.protein) * 100)
    },
    carbohydrates: {
      recipe1: nutrition1.carbohydrates,
      recipe2: nutrition2.carbohydrates,
      difference: Math.round((nutrition2.carbohydrates - nutrition1.carbohydrates) * 10) / 10,
      percentDifference: Math.round(((nutrition2.carbohydrates - nutrition1.carbohydrates) / nutrition1.carbohydrates) * 100)
    },
    fat: {
      recipe1: nutrition1.fat,
      recipe2: nutrition2.fat,
      difference: Math.round((nutrition2.fat - nutrition1.fat) * 10) / 10,
      percentDifference: Math.round(((nutrition2.fat - nutrition1.fat) / nutrition1.fat) * 100)
    }
  };
  
  return comparison;
};

const Nutrition = model('Nutrition', nutritionSchema);

export { Nutrition };