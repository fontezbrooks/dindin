import { MealPlan } from '../models/meal-plan.model';
import { ShoppingList } from '../models/shopping-list.model';
import { Recipe } from '../db/models/recipe.model';
import { DindinUser } from '../db/models/user.model';
import mongoose from 'mongoose';

export interface CreateMealPlanInput {
  title: string;
  description?: string;
  planType: 'weekly' | 'monthly' | 'custom';
  startDate: Date;
  endDate?: Date;
  templateId?: string;
  budgetSettings?: {
    weeklyBudget?: number;
    monthlyBudget?: number;
    trackSpending?: boolean;
  };
  notifications?: {
    mealReminders?: {
      enabled: boolean;
      timing: number;
    };
    prepReminders?: {
      enabled: boolean;
      timing: number;
    };
    shoppingReminders?: {
      enabled: boolean;
      daysBefore: number;
    };
  };
}

export interface AssignMealInput {
  mealPlanId: string;
  date: Date;
  mealType: 'breakfast' | 'lunch' | 'dinner' | 'snack';
  recipeId?: string;
  customMeal?: {
    name: string;
    description?: string;
    calories?: number;
    notes?: string;
  };
  plannedServings?: number;
  notes?: string;
}

export interface UpdateMealPlanInput {
  title?: string;
  description?: string;
  status?: 'draft' | 'active' | 'completed' | 'paused' | 'archived';
  budgetSettings?: any;
  notifications?: any;
  tags?: string[];
}

export class MealPlanningService {
  /**
   * Create a new meal plan for a user
   */
  async createMealPlan(userId: string, input: CreateMealPlanInput) {
    try {
      // Calculate end date if not provided
      let endDate = input.endDate;
      if (!endDate) {
        const startDate = new Date(input.startDate);
        switch (input.planType) {
          case 'weekly':
            endDate = new Date(startDate.getTime() + (7 * 24 * 60 * 60 * 1000));
            break;
          case 'monthly':
            endDate = new Date(startDate.getFullYear(), startDate.getMonth() + 1, startDate.getDate());
            break;
          default:
            endDate = new Date(startDate.getTime() + (7 * 24 * 60 * 60 * 1000));
        }
      }

      // If creating from template, duplicate the template
      if (input.templateId) {
        const duplicatedPlan = await MealPlan.duplicatePlan(input.templateId, userId, input.startDate);
        
        // Update with custom settings
        duplicatedPlan.title = input.title;
        if (input.description) duplicatedPlan.description = input.description;
        if (input.budgetSettings) duplicatedPlan.budgetSettings = input.budgetSettings;
        if (input.notifications) duplicatedPlan.notifications = input.notifications;
        
        await duplicatedPlan.save();
        return duplicatedPlan;
      }

      // Generate daily plans
      const dailyPlans = [];
      const currentDate = new Date(input.startDate);
      
      while (currentDate <= endDate) {
        const dayOfWeek = currentDate.toLocaleLowerCase().slice(0, 3);
        const dayNames = ['sun', 'mon', 'tue', 'wed', 'thu', 'fri', 'sat'];
        const fullDayNames = ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'];
        
        dailyPlans.push({
          date: new Date(currentDate),
          dayOfWeek: fullDayNames[currentDate.getDay()],
          meals: {
            breakfast: {
              mealType: 'breakfast',
              plannedServings: 1,
            },
            lunch: {
              mealType: 'lunch',
              plannedServings: 1,
            },
            dinner: {
              mealType: 'dinner',
              plannedServings: 1,
            },
            snacks: [],
          },
          shoppingCompleted: false,
          prepTasks: [],
          dailyNutrition: {
            targetCalories: 2000, // Default target
          },
        });
        
        currentDate.setDate(currentDate.getDate() + 1);
      }

      const mealPlan = new MealPlan({
        userId: new mongoose.Types.ObjectId(userId),
        title: input.title,
        description: input.description,
        planType: input.planType,
        startDate: input.startDate,
        endDate,
        dailyPlans,
        budgetSettings: input.budgetSettings || {},
        notifications: input.notifications || {},
        status: 'draft',
        analytics: {
          totalMealsPlanned: dailyPlans.length * 3, // 3 main meals per day
        },
      });

      await mealPlan.save();
      return mealPlan;
    } catch (error) {
      throw new Error(`Failed to create meal plan: ${error.message}`);
    }
  }

  /**
   * Get meal plans for a user with filtering options
   */
  async getUserMealPlans(userId: string, options: {
    status?: string;
    planType?: string;
    isTemplate?: boolean;
    limit?: number;
    offset?: number;
  } = {}) {
    try {
      const query: any = { userId: new mongoose.Types.ObjectId(userId), isActive: true };
      
      if (options.status) query.status = options.status;
      if (options.planType) query.planType = options.planType;
      if (options.isTemplate !== undefined) query.isTemplate = options.isTemplate;
      
      const mealPlans = await MealPlan.find(query)
        .sort({ createdAt: -1 })
        .limit(options.limit || 20)
        .skip(options.offset || 0)
        .populate('dailyPlans.meals.breakfast.recipeId dailyPlans.meals.lunch.recipeId dailyPlans.meals.dinner.recipeId dailyPlans.meals.snacks.recipeId');
      
      return mealPlans;
    } catch (error) {
      throw new Error(`Failed to get meal plans: ${error.message}`);
    }
  }

  /**
   * Get active meal plans for a user (currently running plans)
   */
  async getActiveMealPlans(userId: string) {
    try {
      return await MealPlan.getActivePlansForUser(userId);
    } catch (error) {
      throw new Error(`Failed to get active meal plans: ${error.message}`);
    }
  }

  /**
   * Get a specific meal plan by ID
   */
  async getMealPlan(mealPlanId: string, userId: string) {
    try {
      const mealPlan = await MealPlan.findOne({
        _id: new mongoose.Types.ObjectId(mealPlanId),
        $or: [
          { userId: new mongoose.Types.ObjectId(userId) },
          { 'sharedWith.userId': new mongoose.Types.ObjectId(userId) },
        ],
        isActive: true,
      }).populate('dailyPlans.meals.breakfast.recipeId dailyPlans.meals.lunch.recipeId dailyPlans.meals.dinner.recipeId dailyPlans.meals.snacks.recipeId');
      
      if (!mealPlan) {
        throw new Error('Meal plan not found or access denied');
      }
      
      return mealPlan;
    } catch (error) {
      throw new Error(`Failed to get meal plan: ${error.message}`);
    }
  }

  /**
   * Assign a recipe or custom meal to a specific meal slot
   */
  async assignMeal(userId: string, input: AssignMealInput) {
    try {
      const mealPlan = await this.getMealPlan(input.mealPlanId, userId);
      
      // Find the daily plan for the specified date
      const targetDate = new Date(input.date);
      targetDate.setHours(0, 0, 0, 0);
      
      const dayPlan = mealPlan.dailyPlans.find(plan => {
        const planDate = new Date(plan.date);
        planDate.setHours(0, 0, 0, 0);
        return planDate.getTime() === targetDate.getTime();
      });
      
      if (!dayPlan) {
        throw new Error('Date not found in meal plan');
      }
      
      // Validate recipe exists if provided
      if (input.recipeId) {
        const recipe = await Recipe.findById(input.recipeId);
        if (!recipe) {
          throw new Error('Recipe not found');
        }
      }
      
      // Create meal assignment
      const mealAssignment = {
        mealType: input.mealType,
        recipeId: input.recipeId ? new mongoose.Types.ObjectId(input.recipeId) : null,
        customMeal: input.customMeal,
        plannedServings: input.plannedServings || 1,
        notes: input.notes,
        completed: false,
      };
      
      // Assign meal based on type
      if (input.mealType === 'snack') {
        dayPlan.meals.snacks.push(mealAssignment);
      } else {
        dayPlan.meals[input.mealType] = mealAssignment;
      }
      
      // Update analytics
      mealPlan.analytics.totalMealsPlanned += 1;
      
      await mealPlan.save();
      return mealPlan;
    } catch (error) {
      throw new Error(`Failed to assign meal: ${error.message}`);
    }
  }

  /**
   * Remove a meal assignment
   */
  async removeMeal(userId: string, mealPlanId: string, date: Date, mealType: string, snackIndex?: number) {
    try {
      const mealPlan = await this.getMealPlan(mealPlanId, userId);
      
      const targetDate = new Date(date);
      targetDate.setHours(0, 0, 0, 0);
      
      const dayPlan = mealPlan.dailyPlans.find(plan => {
        const planDate = new Date(plan.date);
        planDate.setHours(0, 0, 0, 0);
        return planDate.getTime() === targetDate.getTime();
      });
      
      if (!dayPlan) {
        throw new Error('Date not found in meal plan');
      }
      
      if (mealType === 'snack' && typeof snackIndex === 'number') {
        dayPlan.meals.snacks.splice(snackIndex, 1);
      } else {
        dayPlan.meals[mealType] = {
          mealType,
          plannedServings: 1,
        };
      }
      
      // Update analytics
      mealPlan.analytics.totalMealsPlanned = Math.max(0, mealPlan.analytics.totalMealsPlanned - 1);
      
      await mealPlan.save();
      return mealPlan;
    } catch (error) {
      throw new Error(`Failed to remove meal: ${error.message}`);
    }
  }

  /**
   * Mark a meal as completed
   */
  async completeMeal(userId: string, mealPlanId: string, date: Date, mealType: string, rating?: number, notes?: string, modifications?: string[]) {
    try {
      const mealPlan = await this.getMealPlan(mealPlanId, userId);
      
      const targetDate = new Date(date);
      targetDate.setHours(0, 0, 0, 0);
      
      const dayPlan = mealPlan.dailyPlans.find(plan => {
        const planDate = new Date(plan.date);
        planDate.setHours(0, 0, 0, 0);
        return planDate.getTime() === targetDate.getTime();
      });
      
      if (!dayPlan) {
        throw new Error('Date not found in meal plan');
      }
      
      const meal = dayPlan.meals[mealType];
      if (!meal || !meal.recipeId) {
        throw new Error('Meal not found or no recipe assigned');
      }
      
      meal.completed = true;
      meal.completedAt = new Date();
      if (rating) meal.rating = rating;
      if (notes) meal.notes = notes;
      if (modifications) meal.modifications = modifications;
      
      // Update analytics
      mealPlan.analytics.totalMealsCompleted += 1;
      mealPlan.analytics.completionRate = Math.round(
        (mealPlan.analytics.totalMealsCompleted / mealPlan.analytics.totalMealsPlanned) * 100
      );
      
      await mealPlan.save();
      return mealPlan;
    } catch (error) {
      throw new Error(`Failed to complete meal: ${error.message}`);
    }
  }

  /**
   * Update meal plan details
   */
  async updateMealPlan(userId: string, mealPlanId: string, updates: UpdateMealPlanInput) {
    try {
      const mealPlan = await MealPlan.findOne({
        _id: new mongoose.Types.ObjectId(mealPlanId),
        userId: new mongoose.Types.ObjectId(userId),
        isActive: true,
      });
      
      if (!mealPlan) {
        throw new Error('Meal plan not found');
      }
      
      Object.assign(mealPlan, updates);
      await mealPlan.save();
      
      return mealPlan;
    } catch (error) {
      throw new Error(`Failed to update meal plan: ${error.message}`);
    }
  }

  /**
   * Generate shopping list from meal plan
   */
  async generateShoppingList(userId: string, mealPlanId: string, options: any = {}) {
    try {
      const shoppingList = await ShoppingList.generateFromMealPlan(mealPlanId, userId, options);
      
      // Update meal plan with shopping list reference
      const mealPlan = await MealPlan.findById(mealPlanId);
      if (mealPlan) {
        mealPlan.generatedShoppingLists.push({
          listId: shoppingList._id,
          generatedAt: new Date(),
          dateRange: {
            start: shoppingList.dateRange.startDate,
            end: shoppingList.dateRange.endDate,
          },
        });
        await mealPlan.save();
      }
      
      return shoppingList;
    } catch (error) {
      throw new Error(`Failed to generate shopping list: ${error.message}`);
    }
  }

  /**
   * Get meal plan templates
   */
  async getTemplates(category?: string, limit = 20) {
    try {
      return await MealPlan.getTemplates(category, limit);
    } catch (error) {
      throw new Error(`Failed to get templates: ${error.message}`);
    }
  }

  /**
   * Duplicate an existing meal plan
   */
  async duplicateMealPlan(userId: string, sourcePlanId: string, startDate: Date, newTitle?: string) {
    try {
      const duplicatedPlan = await MealPlan.duplicatePlan(sourcePlanId, userId, startDate);
      
      if (newTitle) {
        duplicatedPlan.title = newTitle;
        await duplicatedPlan.save();
      }
      
      return duplicatedPlan;
    } catch (error) {
      throw new Error(`Failed to duplicate meal plan: ${error.message}`);
    }
  }

  /**
   * Share meal plan with another user
   */
  async shareMealPlan(userId: string, mealPlanId: string, shareWithUserId: string, permission: 'view' | 'edit' = 'view') {
    try {
      const mealPlan = await MealPlan.findOne({
        _id: new mongoose.Types.ObjectId(mealPlanId),
        userId: new mongoose.Types.ObjectId(userId),
        isActive: true,
      });
      
      if (!mealPlan) {
        throw new Error('Meal plan not found');
      }
      
      // Check if user exists
      const targetUser = await DindinUser.findById(shareWithUserId);
      if (!targetUser) {
        throw new Error('User to share with not found');
      }
      
      // Check if already shared with this user
      const existingShare = mealPlan.sharedWith.find(share => 
        share.userId.toString() === shareWithUserId
      );
      
      if (existingShare) {
        existingShare.permission = permission;
      } else {
        mealPlan.sharedWith.push({
          userId: new mongoose.Types.ObjectId(shareWithUserId),
          permission,
          sharedAt: new Date(),
        });
      }
      
      mealPlan.isShared = true;
      await mealPlan.save();
      
      return mealPlan;
    } catch (error) {
      throw new Error(`Failed to share meal plan: ${error.message}`);
    }
  }

  /**
   * Get today's meal plan for a user
   */
  async getTodaysMeals(userId: string) {
    try {
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      
      const activePlans = await MealPlan.find({
        userId: new mongoose.Types.ObjectId(userId),
        status: 'active',
        isActive: true,
        startDate: { $lte: today },
        endDate: { $gte: today },
      }).populate('dailyPlans.meals.breakfast.recipeId dailyPlans.meals.lunch.recipeId dailyPlans.meals.dinner.recipeId dailyPlans.meals.snacks.recipeId');
      
      const todaysMeals = [];
      
      for (const plan of activePlans) {
        const dayPlan = plan.dailyPlans.find(daily => {
          const planDate = new Date(daily.date);
          planDate.setHours(0, 0, 0, 0);
          return planDate.getTime() === today.getTime();
        });
        
        if (dayPlan) {
          todaysMeals.push({
            planId: plan._id,
            planTitle: plan.title,
            date: dayPlan.date,
            meals: dayPlan.meals,
            prepTasks: dayPlan.prepTasks,
            dailyNutrition: dayPlan.dailyNutrition,
          });
        }
      }
      
      return todaysMeals;
    } catch (error) {
      throw new Error(`Failed to get today's meals: ${error.message}`);
    }
  }

  /**
   * Add meal prep task to a specific day
   */
  async addMealPrepTask(userId: string, mealPlanId: string, date: Date, task: {
    task: string;
    scheduledTime?: Date;
    estimatedDuration?: number;
    notes?: string;
  }) {
    try {
      const mealPlan = await this.getMealPlan(mealPlanId, userId);
      
      const targetDate = new Date(date);
      targetDate.setHours(0, 0, 0, 0);
      
      const dayPlan = mealPlan.dailyPlans.find(plan => {
        const planDate = new Date(plan.date);
        planDate.setHours(0, 0, 0, 0);
        return planDate.getTime() === targetDate.getTime();
      });
      
      if (!dayPlan) {
        throw new Error('Date not found in meal plan');
      }
      
      dayPlan.prepTasks.push({
        task: task.task,
        completed: false,
        scheduledTime: task.scheduledTime,
        estimatedDuration: task.estimatedDuration,
        notes: task.notes,
      });
      
      await mealPlan.save();
      return mealPlan;
    } catch (error) {
      throw new Error(`Failed to add meal prep task: ${error.message}`);
    }
  }

  /**
   * Calculate nutritional overview for a meal plan
   */
  async calculateNutritionalOverview(mealPlanId: string) {
    try {
      const mealPlan = await MealPlan.findById(mealPlanId)
        .populate('dailyPlans.meals.breakfast.recipeId dailyPlans.meals.lunch.recipeId dailyPlans.meals.dinner.recipeId dailyPlans.meals.snacks.recipeId');
      
      if (!mealPlan) {
        throw new Error('Meal plan not found');
      }
      
      const nutritionalOverview = {
        totalDays: mealPlan.dailyPlans.length,
        averageDaily: {
          calories: 0,
          protein: 0,
          carbs: 0,
          fat: 0,
          fiber: 0,
          sugar: 0,
        },
        dailyBreakdown: [],
        weeklyTotals: {
          calories: 0,
          protein: 0,
          carbs: 0,
          fat: 0,
          fiber: 0,
          sugar: 0,
        },
      };
      
      // Calculate nutrition for each day
      for (const dayPlan of mealPlan.dailyPlans) {
        const dayNutrition = {
          date: dayPlan.date,
          calories: 0,
          protein: 0,
          carbs: 0,
          fat: 0,
          fiber: 0,
          sugar: 0,
        };
        
        // Process each meal
        const meals = [
          dayPlan.meals.breakfast,
          dayPlan.meals.lunch,
          dayPlan.meals.dinner,
          ...dayPlan.meals.snacks,
        ].filter(meal => meal && meal.recipeId);
        
        for (const meal of meals) {
          if (meal.recipeId && meal.recipeId.nutrition) {
            const servingMultiplier = meal.plannedServings || 1;
            const recipe = meal.recipeId;
            
            if (recipe.nutrition) {
              dayNutrition.calories += (recipe.nutrition.calories || 0) * servingMultiplier;
              dayNutrition.protein += (recipe.nutrition.protein || 0) * servingMultiplier;
              dayNutrition.carbs += (recipe.nutrition.carbs || 0) * servingMultiplier;
              dayNutrition.fat += (recipe.nutrition.fat || 0) * servingMultiplier;
              dayNutrition.fiber += (recipe.nutrition.fiber || 0) * servingMultiplier;
              dayNutrition.sugar += (recipe.nutrition.sugar || 0) * servingMultiplier;
            }
          }
        }
        
        nutritionalOverview.dailyBreakdown.push(dayNutrition);
        
        // Add to weekly totals
        nutritionalOverview.weeklyTotals.calories += dayNutrition.calories;
        nutritionalOverview.weeklyTotals.protein += dayNutrition.protein;
        nutritionalOverview.weeklyTotals.carbs += dayNutrition.carbs;
        nutritionalOverview.weeklyTotals.fat += dayNutrition.fat;
        nutritionalOverview.weeklyTotals.fiber += dayNutrition.fiber;
        nutritionalOverview.weeklyTotals.sugar += dayNutrition.sugar;
      }
      
      // Calculate averages
      if (nutritionalOverview.totalDays > 0) {
        nutritionalOverview.averageDaily.calories = Math.round(nutritionalOverview.weeklyTotals.calories / nutritionalOverview.totalDays);
        nutritionalOverview.averageDaily.protein = Math.round(nutritionalOverview.weeklyTotals.protein / nutritionalOverview.totalDays);
        nutritionalOverview.averageDaily.carbs = Math.round(nutritionalOverview.weeklyTotals.carbs / nutritionalOverview.totalDays);
        nutritionalOverview.averageDaily.fat = Math.round(nutritionalOverview.weeklyTotals.fat / nutritionalOverview.totalDays);
        nutritionalOverview.averageDaily.fiber = Math.round(nutritionalOverview.weeklyTotals.fiber / nutritionalOverview.totalDays);
        nutritionalOverview.averageDaily.sugar = Math.round(nutritionalOverview.weeklyTotals.sugar / nutritionalOverview.totalDays);
      }
      
      return nutritionalOverview;
    } catch (error) {
      throw new Error(`Failed to calculate nutritional overview: ${error.message}`);
    }
  }
}