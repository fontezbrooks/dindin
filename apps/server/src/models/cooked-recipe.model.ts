import mongoose from 'mongoose';

const { Schema, model } = mongoose;

// Dedicated model for tracking cooking sessions with enhanced analytics
const cookedRecipeSchema = new Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'DindinUser',
    required: true,
  },
  recipeId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Recipe',
    required: true,
  },
  cookedAt: {
    type: Date,
    required: true,
    default: Date.now,
  },
  rating: {
    type: Number,
    min: 1,
    max: 5,
  },
  notes: {
    type: String,
    trim: true,
    maxlength: 1000,
  },
  difficulty: {
    type: String,
    enum: ['easier_than_expected', 'as_expected', 'harder_than_expected'],
  },
  timeSpent: {
    type: Number, // minutes
    min: 0,
  },
  modifications: [{
    type: String,
    trim: true,
  }],
  wouldCookAgain: {
    type: Boolean,
  },
  servings: {
    type: Number,
    min: 1,
  },
  // Partner cooking session tracking
  cookedWithPartner: {
    type: Boolean,
    default: false,
  },
  partnerId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'DindinUser',
  },
  // Analytics tracking
  cookingMethod: {
    type: String,
    enum: ['followed_exactly', 'modified_slightly', 'major_modifications', 'inspired_by'],
    default: 'followed_exactly',
  },
  mealType: {
    type: String,
    enum: ['breakfast', 'lunch', 'dinner', 'snack', 'dessert', 'appetizer', 'brunch'],
  },
  occasion: {
    type: String,
    enum: ['weekday', 'weekend', 'special_occasion', 'date_night', 'meal_prep'],
  },
  tags: [{
    type: String,
    lowercase: true,
    trim: true,
  }],
}, {
  collection: 'cooked_recipes',
  timestamps: true,
});

// Indexes for efficient querying
cookedRecipeSchema.index({ userId: 1, cookedAt: -1 });
cookedRecipeSchema.index({ recipeId: 1, cookedAt: -1 });
cookedRecipeSchema.index({ userId: 1, recipeId: 1, cookedAt: -1 });
cookedRecipeSchema.index({ cookedAt: -1 });

// Compound index for recently cooked queries with pagination
cookedRecipeSchema.index({ userId: 1, cookedAt: -1, _id: 1 });

// Virtual for cooking frequency per recipe
cookedRecipeSchema.virtual('cookingFrequency').get(function() {
  // This would be calculated in aggregation queries
  return this._cookingFrequency || 1;
});

// Method to calculate time since last cooked
cookedRecipeSchema.methods.daysSinceCooked = function() {
  const now = new Date();
  const diffTime = Math.abs(now.getTime() - this.cookedAt.getTime());
  return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
};

// Static method to get cooking stats for a user
cookedRecipeSchema.statics.getUserCookingStats = async function(userId: string) {
  return this.aggregate([
    { $match: { userId: new mongoose.Types.ObjectId(userId) } },
    {
      $group: {
        _id: null,
        totalCookingSessions: { $sum: 1 },
        uniqueRecipes: { $addToSet: '$recipeId' },
        avgRating: { $avg: '$rating' },
        totalTimeSpent: { $sum: '$timeSpent' },
        recentSessions: {
          $sum: {
            $cond: {
              if: { $gte: ['$cookedAt', new Date(Date.now() - 7 * 24 * 60 * 60 * 1000)] },
              then: 1,
              else: 0
            }
          }
        }
      }
    },
    {
      $project: {
        _id: 0,
        totalCookingSessions: 1,
        uniqueRecipesCount: { $size: '$uniqueRecipes' },
        avgRating: { $round: ['$avgRating', 1] },
        totalTimeSpent: 1,
        recentSessions: 1
      }
    }
  ]);
};

// Static method to get most cooked recipes
cookedRecipeSchema.statics.getMostCookedRecipes = async function(userId: string, limit = 10) {
  return this.aggregate([
    { $match: { userId: new mongoose.Types.ObjectId(userId) } },
    {
      $group: {
        _id: '$recipeId',
        cookCount: { $sum: 1 },
        lastCooked: { $max: '$cookedAt' },
        avgRating: { $avg: '$rating' },
        totalTimeSpent: { $sum: '$timeSpent' }
      }
    },
    { $sort: { cookCount: -1, lastCooked: -1 } },
    { $limit: limit },
    {
      $lookup: {
        from: 'recipes',
        localField: '_id',
        foreignField: '_id',
        as: 'recipe'
      }
    },
    { $unwind: '$recipe' },
    {
      $project: {
        recipeId: '$_id',
        cookCount: 1,
        lastCooked: 1,
        avgRating: { $round: ['$avgRating', 1] },
        totalTimeSpent: 1,
        recipe: {
          title: 1,
          image_url: 1,
          cook_time: 1,
          difficulty: 1,
          cuisine: 1
        }
      }
    }
  ]);
};

const CookedRecipe = model('CookedRecipe', cookedRecipeSchema);

export { CookedRecipe };