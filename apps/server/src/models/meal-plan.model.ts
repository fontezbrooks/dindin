import mongoose from 'mongoose';

const { Schema, model } = mongoose;

// Meal slot schema for individual meal assignments
const mealSlotSchema = new Schema({
  mealType: {
    type: String,
    enum: ['breakfast', 'lunch', 'dinner', 'snack'],
    required: true,
  },
  recipeId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Recipe',
    default: null,
  },
  customMeal: {
    name: String,
    description: String,
    calories: Number,
    notes: String,
  },
  plannedServings: {
    type: Number,
    default: 1,
    min: 0.5,
    max: 10,
  },
  notes: {
    type: String,
    trim: true,
    maxlength: 500,
  },
  completed: {
    type: Boolean,
    default: false,
  },
  completedAt: {
    type: Date,
  },
  rating: {
    type: Number,
    min: 1,
    max: 5,
  },
  modifications: [{
    type: String,
    trim: true,
  }],
  leftovers: {
    hasLeftovers: {
      type: Boolean,
      default: false,
    },
    servingsRemaining: {
      type: Number,
      min: 0,
    },
    expiresAt: {
      type: Date,
    },
    fridgeLocation: {
      type: String,
      enum: ['fridge', 'freezer', 'pantry'],
    },
    reheatingInstructions: String,
  },
}, {
  _id: false,
});

// Daily meal plan schema
const dailyPlanSchema = new Schema({
  date: {
    type: Date,
    required: true,
  },
  dayOfWeek: {
    type: String,
    enum: ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'],
    required: true,
  },
  meals: {
    breakfast: mealSlotSchema,
    lunch: mealSlotSchema,
    dinner: mealSlotSchema,
    snacks: [mealSlotSchema],
  },
  shoppingCompleted: {
    type: Boolean,
    default: false,
  },
  prepTasks: [{
    task: {
      type: String,
      required: true,
    },
    completed: {
      type: Boolean,
      default: false,
    },
    scheduledTime: Date,
    estimatedDuration: Number, // minutes
    notes: String,
  }],
  dailyNutrition: {
    targetCalories: Number,
    actualCalories: Number,
    protein: Number,
    carbs: Number,
    fat: Number,
    fiber: Number,
    sugar: Number,
  },
}, {
  _id: false,
});

// Main meal plan schema
const mealPlanSchema = new Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'DindinUser',
    required: true,
  },
  partnerId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'DindinUser',
  },
  title: {
    type: String,
    required: true,
    trim: true,
    maxlength: 100,
  },
  description: {
    type: String,
    trim: true,
    maxlength: 500,
  },
  planType: {
    type: String,
    enum: ['weekly', 'monthly', 'custom'],
    required: true,
    default: 'weekly',
  },
  startDate: {
    type: Date,
    required: true,
  },
  endDate: {
    type: Date,
    required: true,
  },
  dailyPlans: [dailyPlanSchema],
  
  // Template and sharing settings
  isTemplate: {
    type: Boolean,
    default: false,
  },
  templateCategory: {
    type: String,
    enum: ['weight-loss', 'muscle-gain', 'family-friendly', 'quick-meals', 'budget-friendly', 'vegetarian', 'keto', 'meal-prep', 'custom'],
  },
  isShared: {
    type: Boolean,
    default: false,
  },
  sharedWith: [{
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'DindinUser',
    },
    permission: {
      type: String,
      enum: ['view', 'edit'],
      default: 'view',
    },
    sharedAt: {
      type: Date,
      default: Date.now,
    },
  }],
  
  // Shopping list integration
  generatedShoppingLists: [{
    listId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'ShoppingList',
    },
    generatedAt: {
      type: Date,
      default: Date.now,
    },
    dateRange: {
      start: Date,
      end: Date,
    },
  }],
  
  // Budget tracking
  budgetSettings: {
    weeklyBudget: {
      type: Number,
      min: 0,
    },
    monthlyBudget: {
      type: Number,
      min: 0,
    },
    trackSpending: {
      type: Boolean,
      default: false,
    },
  },
  
  // Meal prep scheduling
  mealPrepSchedule: [{
    prepDay: {
      type: String,
      enum: ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'],
    },
    prepTime: {
      type: String, // HH:MM format
    },
    recipes: [{
      recipeId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Recipe',
      },
      servings: Number,
      containers: Number,
      storageInstructions: String,
    }],
    estimatedDuration: Number, // minutes
    notes: String,
  }],
  
  // Analytics and tracking
  analytics: {
    completionRate: {
      type: Number,
      default: 0,
      min: 0,
      max: 100,
    },
    averageRating: {
      type: Number,
      min: 1,
      max: 5,
    },
    totalMealsPlanned: {
      type: Number,
      default: 0,
    },
    totalMealsCompleted: {
      type: Number,
      default: 0,
    },
    favoriteRecipes: [{
      recipeId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Recipe',
      },
      frequency: {
        type: Number,
        default: 1,
      },
    }],
    nutritionConsistency: {
      type: Number,
      min: 0,
      max: 100,
    },
  },
  
  // Notification settings
  notifications: {
    mealReminders: {
      enabled: {
        type: Boolean,
        default: true,
      },
      timing: {
        type: Number, // minutes before meal
        default: 30,
      },
    },
    prepReminders: {
      enabled: {
        type: Boolean,
        default: true,
      },
      timing: {
        type: Number, // minutes before prep time
        default: 60,
      },
    },
    shoppingReminders: {
      enabled: {
        type: Boolean,
        default: true,
      },
      daysBefore: {
        type: Number,
        default: 1,
      },
    },
  },
  
  // Status and metadata
  status: {
    type: String,
    enum: ['draft', 'active', 'completed', 'paused', 'archived'],
    default: 'draft',
  },
  isActive: {
    type: Boolean,
    default: true,
  },
  version: {
    type: Number,
    default: 1,
  },
  tags: [{
    type: String,
    lowercase: true,
    trim: true,
  }],
}, {
  collection: 'meal_plans',
  timestamps: true,
});

// Indexes for efficient querying
mealPlanSchema.index({ userId: 1, startDate: -1 });
mealPlanSchema.index({ userId: 1, status: 1 });
mealPlanSchema.index({ partnerId: 1, isShared: 1 });
mealPlanSchema.index({ isTemplate: 1, templateCategory: 1 });
mealPlanSchema.index({ 'dailyPlans.date': 1 });
mealPlanSchema.index({ tags: 1 });

// Compound index for active meal plans
mealPlanSchema.index({ userId: 1, status: 1, isActive: 1, startDate: -1 });

// Virtual for duration in days
mealPlanSchema.virtual('durationDays').get(function() {
  if (this.startDate && this.endDate) {
    const diffTime = Math.abs(this.endDate.getTime() - this.startDate.getTime());
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  }
  return 0;
});

// Virtual for progress percentage
mealPlanSchema.virtual('progressPercentage').get(function() {
  if (this.analytics.totalMealsPlanned === 0) return 0;
  return Math.round((this.analytics.totalMealsCompleted / this.analytics.totalMealsPlanned) * 100);
});

// Method to get current day's plan
mealPlanSchema.methods.getCurrentDayPlan = function() {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  
  return this.dailyPlans.find((plan: any) => {
    const planDate = new Date(plan.date);
    planDate.setHours(0, 0, 0, 0);
    return planDate.getTime() === today.getTime();
  });
};

// Method to calculate nutrition totals for a day
mealPlanSchema.methods.calculateDayNutrition = function(dayPlan: any) {
  let totalNutrition = {
    calories: 0,
    protein: 0,
    carbs: 0,
    fat: 0,
    fiber: 0,
    sugar: 0,
  };
  
  // This would be populated when recipes are populated
  // Implementation would aggregate nutrition from all meals in the day
  return totalNutrition;
};

// Static method to get active meal plans for user
mealPlanSchema.statics.getActivePlansForUser = async function(userId: string) {
  const today = new Date();
  return this.find({
    userId: new mongoose.Types.ObjectId(userId),
    status: 'active',
    isActive: true,
    startDate: { $lte: today },
    endDate: { $gte: today },
  }).sort({ startDate: -1 });
};

// Static method to get meal plan templates
mealPlanSchema.statics.getTemplates = async function(category?: string, limit = 20) {
  const query: any = { isTemplate: true, isActive: true };
  if (category) {
    query.templateCategory = category;
  }
  
  return this.find(query)
    .sort({ 'analytics.completionRate': -1, createdAt: -1 })
    .limit(limit);
};

// Static method to duplicate a meal plan
mealPlanSchema.statics.duplicatePlan = async function(originalPlanId: string, userId: string, startDate: Date) {
  const originalPlan = await this.findById(originalPlanId);
  if (!originalPlan) throw new Error('Original plan not found');
  
  const planData = originalPlan.toObject();
  delete planData._id;
  delete planData.createdAt;
  delete planData.updatedAt;
  delete planData.analytics;
  
  // Update dates and user
  planData.userId = new mongoose.Types.ObjectId(userId);
  planData.startDate = startDate;
  planData.isTemplate = false;
  planData.status = 'draft';
  
  // Calculate new end date based on original duration
  const originalDuration = originalPlan.durationDays;
  planData.endDate = new Date(startDate.getTime() + (originalDuration * 24 * 60 * 60 * 1000));
  
  // Update daily plan dates
  if (planData.dailyPlans) {
    planData.dailyPlans.forEach((dayPlan: any, index: number) => {
      const newDate = new Date(startDate.getTime() + (index * 24 * 60 * 60 * 1000));
      dayPlan.date = newDate;
      dayPlan.shoppingCompleted = false;
      
      // Reset completion status for all meals
      if (dayPlan.meals) {
        Object.values(dayPlan.meals).forEach((meal: any) => {
          if (meal && typeof meal === 'object') {
            if (Array.isArray(meal)) {
              meal.forEach(snack => {
                snack.completed = false;
                snack.completedAt = null;
              });
            } else {
              meal.completed = false;
              meal.completedAt = null;
            }
          }
        });
      }
      
      // Reset prep task completion
      if (dayPlan.prepTasks) {
        dayPlan.prepTasks.forEach((task: any) => {
          task.completed = false;
        });
      }
    });
  }
  
  return this.create(planData);
};

const MealPlan = model('MealPlan', mealPlanSchema);

export { MealPlan };