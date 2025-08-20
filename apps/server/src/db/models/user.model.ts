import mongoose from 'mongoose';

const { Schema, model } = mongoose;

// DinDin-specific user profile schema that extends the auth user
const dindinUserSchema = new Schema({
  id: {
    type: mongoose.Schema.Types.ObjectId,
    auto: true,
  },
  // Reference to the auth user
  authUserId: {
    type: String,
    ref: 'User',
    required: true,
    unique: true,
  },
  // Profile information
  name: {
    type: String,
    required: true,
    trim: true,
  },
  email: {
    type: String,
    required: true,
    unique: true,
    lowercase: true,
    trim: true,
  },
  profileImage: {
    type: String,
  },
  // Dietary preferences
  dietaryRestrictions: [{
    type: String,
    enum: ['vegetarian', 'vegan', 'gluten-free', 'dairy-free', 'nut-free', 'halal', 'kosher', 'low-carb', 'keto', 'paleo'],
  }],
  allergies: [{
    type: String,
    trim: true,
  }],
  cookingSkill: {
    type: String,
    enum: ['beginner', 'intermediate', 'expert'],
    default: 'beginner',
  },
  // Partner system
  partnerCode: {
    type: String,
    unique: true,
    sparse: true, // Allow null values
    uppercase: true,
    minlength: 6,
    maxlength: 6,
  },
  partnerId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'DindinUser',
    default: null,
  },
  partnerConnectedAt: {
    type: Date,
    default: null,
  },
  // Recipe interactions
  likedRecipes: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Recipe',
  }],
  dislikedRecipes: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Recipe',
  }],
  cookedRecipes: [{
    recipeId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Recipe',
    },
    cookedAt: {
      type: Date,
      default: Date.now,
    },
    rating: {
      type: Number,
      min: 1,
      max: 5,
    },
    notes: String,
  }],
  // User preferences
  preferences: {
    maxCookTime: {
      type: Number,
      default: 60, // minutes
      min: 15,
      max: 480,
    },
    preferredCuisines: [{
      type: String,
      trim: true,
    }],
    avoidIngredients: [{
      type: String,
      trim: true,
      lowercase: true,
    }],
    servingSize: {
      type: Number,
      default: 2,
      min: 1,
      max: 12,
    },
    spiceLevel: {
      type: String,
      enum: ['mild', 'medium', 'hot', 'very-hot'],
      default: 'medium',
    },
    mealTypes: [{
      type: String,
      enum: ['breakfast', 'lunch', 'dinner', 'snack', 'dessert', 'appetizer'],
    }],
  },
  // App settings
  settings: {
    notifications: {
      newMatches: {
        type: Boolean,
        default: true,
      },
      dailyRecipe: {
        type: Boolean,
        default: true,
      },
      partnerActivity: {
        type: Boolean,
        default: true,
      },
    },
    privacy: {
      shareProfile: {
        type: Boolean,
        default: true,
      },
      showCookingHistory: {
        type: Boolean,
        default: true,
      },
    },
  },
  // Statistics
  stats: {
    totalSwipes: {
      type: Number,
      default: 0,
    },
    totalMatches: {
      type: Number,
      default: 0,
    },
    recipesCooked: {
      type: Number,
      default: 0,
    },
    favoriteIngredient: String,
    favoriteCuisine: String,
  },
  // Account status
  isActive: {
    type: Boolean,
    default: true,
  },
  onboardingCompleted: {
    type: Boolean,
    default: false,
  },
  lastActiveAt: {
    type: Date,
    default: Date.now,
  },
}, {
  collection: 'dindin_users',
  timestamps: true,
});

// Index for efficient querying (others are handled by unique: true in schema)
dindinUserSchema.index({ partnerId: 1 });

// Virtual for full name display
dindinUserSchema.virtual('displayName').get(function() {
  return this.name;
});

// Method to generate unique partner code
dindinUserSchema.methods.generatePartnerCode = function() {
  const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
  let code = '';
  for (let i = 0; i < 6; i++) {
    code += characters.charAt(Math.floor(Math.random() * characters.length));
  }
  return code;
};

// Method to check if user can match with a recipe
dindinUserSchema.methods.canSwipeRecipe = function(recipeId: string) {
  const hasLiked = this.likedRecipes.some((id: any) => id.toString() === recipeId);
  const hasDisliked = this.dislikedRecipes.some((id: any) => id.toString() === recipeId);
  return !hasLiked && !hasDisliked;
};

const DindinUser = model('DindinUser', dindinUserSchema);

export { DindinUser };