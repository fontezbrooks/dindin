import { ShoppingList } from '../models/shopping-list.model';
import { MealPlan } from '../models/meal-plan.model';
import { DindinUser } from '../db/models/user.model';
import mongoose from 'mongoose';

export interface CreateShoppingListInput {
  title: string;
  description?: string;
  mealPlanId?: string;
  dateRange: {
    startDate: Date;
    endDate: Date;
  };
  preferredStores?: Array<{
    name: string;
    address?: string;
    priority: number;
    categories: string[];
  }>;
  budget?: {
    planned: number;
    categoryBreakdown?: Array<{
      category: string;
      planned: number;
    }>;
  };
  scheduledShoppingDate?: Date;
  generationSettings?: {
    aggregateQuantities?: boolean;
    includePantryCheck?: boolean;
    addBufferItems?: boolean;
    excludeCategories?: string[];
    customInstructions?: string;
  };
}

export interface AddCustomItemInput {
  name: string;
  category: string;
  quantity: string;
  unit?: string;
  estimatedPrice?: number;
  priority?: 'low' | 'medium' | 'high';
  notes?: string;
  substituteOptions?: Array<{
    name: string;
    notes?: string;
  }>;
}

export interface UpdateShoppingItemInput {
  quantity?: string;
  unit?: string;
  estimatedPrice?: number;
  actualPrice?: number;
  isPurchased?: boolean;
  store?: string;
  notes?: string;
  priority?: 'low' | 'medium' | 'high';
}

export class ShoppingListService {
  /**
   * Create a new shopping list
   */
  async createShoppingList(userId: string, input: CreateShoppingListInput) {
    try {
      // If creating from meal plan, use the existing generation method
      if (input.mealPlanId) {
        return await ShoppingList.generateFromMealPlan(
          input.mealPlanId,
          userId,
          input.generationSettings || {}
        );
      }

      // Create empty shopping list
      const shoppingList = new ShoppingList({
        userId: new mongoose.Types.ObjectId(userId),
        title: input.title,
        description: input.description,
        dateRange: input.dateRange,
        items: [],
        preferredStores: input.preferredStores || [],
        budget: input.budget || {},
        scheduledShoppingDate: input.scheduledShoppingDate,
        generationSettings: input.generationSettings || {},
        status: 'draft',
      });

      await shoppingList.save();
      return shoppingList;
    } catch (error) {
      throw new Error(`Failed to create shopping list: ${error.message}`);
    }
  }

  /**
   * Get shopping lists for a user
   */
  async getUserShoppingLists(userId: string, options: {
    status?: string;
    mealPlanId?: string;
    scheduledDate?: Date;
    limit?: number;
    offset?: number;
  } = {}) {
    try {
      const query: any = { userId: new mongoose.Types.ObjectId(userId) };
      
      if (options.status) query.status = options.status;
      if (options.mealPlanId) query.mealPlanId = new mongoose.Types.ObjectId(options.mealPlanId);
      if (options.scheduledDate) {
        const date = new Date(options.scheduledDate);
        query.scheduledShoppingDate = {
          $gte: new Date(date.setHours(0, 0, 0, 0)),
          $lte: new Date(date.setHours(23, 59, 59, 999)),
        };
      }
      
      const shoppingLists = await ShoppingList.find(query)
        .sort({ createdAt: -1 })
        .limit(options.limit || 20)
        .skip(options.offset || 0)
        .populate('mealPlanId', 'title description');
      
      return shoppingLists;
    } catch (error) {
      throw new Error(`Failed to get shopping lists: ${error.message}`);
    }
  }

  /**
   * Get a specific shopping list by ID
   */
  async getShoppingList(shoppingListId: string, userId: string) {
    try {
      const shoppingList = await ShoppingList.findOne({
        _id: new mongoose.Types.ObjectId(shoppingListId),
        $or: [
          { userId: new mongoose.Types.ObjectId(userId) },
          { 'sharedWith.userId': new mongoose.Types.ObjectId(userId) },
        ],
      }).populate('mealPlanId', 'title description');
      
      if (!shoppingList) {
        throw new Error('Shopping list not found or access denied');
      }
      
      return shoppingList;
    } catch (error) {
      throw new Error(`Failed to get shopping list: ${error.message}`);
    }
  }

  /**
   * Add a custom item to shopping list
   */
  async addCustomItem(userId: string, shoppingListId: string, input: AddCustomItemInput) {
    try {
      const shoppingList = await this.getShoppingList(shoppingListId, userId);
      
      shoppingList.addCustomItem({
        name: input.name,
        category: input.category || 'other',
        quantity: input.quantity,
        unit: input.unit,
        estimatedPrice: input.estimatedPrice,
        priority: input.priority || 'medium',
        notes: input.notes,
        substituteOptions: input.substituteOptions || [],
        isCustomItem: true,
        recipeAssociations: [],
        aggregatedFrom: [],
      });
      
      await shoppingList.save();
      return shoppingList;
    } catch (error) {
      throw new Error(`Failed to add custom item: ${error.message}`);
    }
  }

  /**
   * Update an item in the shopping list
   */
  async updateShoppingItem(userId: string, shoppingListId: string, itemIndex: number, updates: UpdateShoppingItemInput) {
    try {
      const shoppingList = await this.getShoppingList(shoppingListId, userId);
      
      if (!shoppingList.items || itemIndex >= shoppingList.items.length || itemIndex < 0) {
        throw new Error('Invalid item index');
      }
      
      const item = shoppingList.items[itemIndex];
      Object.assign(item, updates);
      
      // If marking as purchased, update purchase timestamp and budget
      if (updates.isPurchased && !item.isPurchased) {
        item.purchasedAt = new Date();
        if (updates.actualPrice !== undefined) {
          shoppingList.budget.actual = (shoppingList.budget.actual || 0) + updates.actualPrice;
        }
      }
      
      // Update analytics
      shoppingList.analytics.completionRate = shoppingList.completionPercentage;
      
      await shoppingList.save();
      return shoppingList;
    } catch (error) {
      throw new Error(`Failed to update shopping item: ${error.message}`);
    }
  }

  /**
   * Remove an item from the shopping list
   */
  async removeShoppingItem(userId: string, shoppingListId: string, itemIndex: number) {
    try {
      const shoppingList = await this.getShoppingList(shoppingListId, userId);
      
      if (!shoppingList.items || itemIndex >= shoppingList.items.length || itemIndex < 0) {
        throw new Error('Invalid item index');
      }
      
      shoppingList.items.splice(itemIndex, 1);
      shoppingList.analytics.completionRate = shoppingList.completionPercentage;
      
      await shoppingList.save();
      return shoppingList;
    } catch (error) {
      throw new Error(`Failed to remove shopping item: ${error.message}`);
    }
  }

  /**
   * Mark an item as purchased
   */
  async purchaseItem(userId: string, shoppingListId: string, itemIndex: number, actualPrice?: number, store?: string) {
    try {
      const shoppingList = await this.getShoppingList(shoppingListId, userId);
      
      shoppingList.purchaseItem(itemIndex, actualPrice, store);
      
      // Start shopping session if not already started
      if (shoppingList.shoppingSessions.length === 0 || 
          shoppingList.shoppingSessions[shoppingList.shoppingSessions.length - 1].completedAt) {
        shoppingList.shoppingSessions.push({
          startedAt: new Date(),
          store: store || 'Unknown',
          itemsPurchased: 1,
          totalSpent: actualPrice || 0,
        });
      } else {
        // Update current session
        const currentSession = shoppingList.shoppingSessions[shoppingList.shoppingSessions.length - 1];
        currentSession.itemsPurchased += 1;
        currentSession.totalSpent += actualPrice || 0;
        if (store) currentSession.store = store;
      }
      
      await shoppingList.save();
      return shoppingList;
    } catch (error) {
      throw new Error(`Failed to purchase item: ${error.message}`);
    }
  }

  /**
   * Complete shopping session
   */
  async completeShoppingSesssion(userId: string, shoppingListId: string, sessionData?: {
    paymentMethod?: 'cash' | 'card' | 'mobile' | 'other';
    notes?: string;
  }) {
    try {
      const shoppingList = await this.getShoppingList(shoppingListId, userId);
      
      if (shoppingList.shoppingSessions.length === 0) {
        throw new Error('No active shopping session');
      }
      
      const currentSession = shoppingList.shoppingSessions[shoppingList.shoppingSessions.length - 1];
      if (currentSession.completedAt) {
        throw new Error('Shopping session already completed');
      }
      
      currentSession.completedAt = new Date();
      if (sessionData?.paymentMethod) currentSession.paymentMethod = sessionData.paymentMethod;
      if (sessionData?.notes) currentSession.notes = sessionData.notes;
      
      // Update shopping list status if all items are purchased
      if (shoppingList.completionPercentage === 100) {
        shoppingList.status = 'completed';
      }
      
      await shoppingList.save();
      return shoppingList;
    } catch (error) {
      throw new Error(`Failed to complete shopping session: ${error.message}`);
    }
  }

  /**
   * Optimize shopping route
   */
  async optimizeShoppingRoute(userId: string, shoppingListId: string) {
    try {
      const shoppingList = await this.getShoppingList(shoppingListId, userId);
      
      const optimized = shoppingList.optimizeShoppingRoute();
      
      if (!optimized) {
        throw new Error('Unable to optimize route - no preferred stores configured');
      }
      
      await shoppingList.save();
      return shoppingList.shoppingRoute;
    } catch (error) {
      throw new Error(`Failed to optimize shopping route: ${error.message}`);
    }
  }

  /**
   * Share shopping list with another user
   */
  async shareShoppingList(userId: string, shoppingListId: string, shareWithUserId: string, permission: 'view' | 'edit' = 'view', canPurchase = false) {
    try {
      const shoppingList = await ShoppingList.findOne({
        _id: new mongoose.Types.ObjectId(shoppingListId),
        userId: new mongoose.Types.ObjectId(userId),
      });
      
      if (!shoppingList) {
        throw new Error('Shopping list not found');
      }
      
      // Check if user exists
      const targetUser = await DindinUser.findById(shareWithUserId);
      if (!targetUser) {
        throw new Error('User to share with not found');
      }
      
      // Check if already shared with this user
      const existingShare = shoppingList.sharedWith.find(share => 
        share.userId.toString() === shareWithUserId
      );
      
      if (existingShare) {
        existingShare.permission = permission;
        existingShare.canPurchase = canPurchase;
      } else {
        shoppingList.sharedWith.push({
          userId: new mongoose.Types.ObjectId(shareWithUserId),
          permission,
          canPurchase,
          sharedAt: new Date(),
        });
      }
      
      shoppingList.isShared = true;
      await shoppingList.save();
      
      return shoppingList;
    } catch (error) {
      throw new Error(`Failed to share shopping list: ${error.message}`);
    }
  }

  /**
   * Get shopping list templates
   */
  async getTemplates(category?: string, limit = 20) {
    try {
      const query: any = { isTemplate: true };
      if (category) {
        query.templateCategory = category;
      }
      
      const templates = await ShoppingList.find(query)
        .sort({ 'analytics.completionRate': -1, createdAt: -1 })
        .limit(limit);
      
      return templates;
    } catch (error) {
      throw new Error(`Failed to get shopping list templates: ${error.message}`);
    }
  }

  /**
   * Duplicate shopping list from template
   */
  async duplicateFromTemplate(userId: string, templateId: string, customizations?: {
    title?: string;
    dateRange?: { startDate: Date; endDate: Date };
    scheduledShoppingDate?: Date;
  }) {
    try {
      const template = await ShoppingList.findById(templateId);
      if (!template || !template.isTemplate) {
        throw new Error('Template not found');
      }
      
      const duplicateData = template.toObject();
      delete duplicateData._id;
      delete duplicateData.createdAt;
      delete duplicateData.updatedAt;
      delete duplicateData.shoppingSessions;
      delete duplicateData.analytics;
      
      // Apply customizations
      duplicateData.userId = new mongoose.Types.ObjectId(userId);
      duplicateData.isTemplate = false;
      duplicateData.status = 'draft';
      
      if (customizations?.title) duplicateData.title = customizations.title;
      if (customizations?.dateRange) duplicateData.dateRange = customizations.dateRange;
      if (customizations?.scheduledShoppingDate) duplicateData.scheduledShoppingDate = customizations.scheduledShoppingDate;
      
      // Reset item purchase status
      if (duplicateData.items) {
        duplicateData.items.forEach((item: any) => {
          item.isPurchased = false;
          item.purchasedAt = null;
          item.actualPrice = null;
          item.store = null;
        });
      }
      
      // Reset budget actual
      if (duplicateData.budget) {
        duplicateData.budget.actual = 0;
      }
      
      const newShoppingList = new ShoppingList(duplicateData);
      await newShoppingList.save();
      
      return newShoppingList;
    } catch (error) {
      throw new Error(`Failed to duplicate shopping list: ${error.message}`);
    }
  }

  /**
   * Get shopping analytics for user
   */
  async getShoppingAnalytics(userId: string, dateRange?: { startDate: Date; endDate: Date }) {
    try {
      const query: any = { userId: new mongoose.Types.ObjectId(userId) };
      
      if (dateRange) {
        query.createdAt = {
          $gte: dateRange.startDate,
          $lte: dateRange.endDate,
        };
      }
      
      const analytics = await ShoppingList.aggregate([
        { $match: query },
        {
          $group: {
            _id: null,
            totalLists: { $sum: 1 },
            completedLists: {
              $sum: { $cond: [{ $eq: ['$status', 'completed'] }, 1, 0] }
            },
            totalSpent: { $sum: '$budget.actual' },
            averageItemsPerList: { $avg: { $size: '$items' } },
            averageCompletionRate: { $avg: '$analytics.completionRate' },
            mostFrequentCategory: {
              $push: '$items.category'
            },
          }
        },
        {
          $project: {
            _id: 0,
            totalLists: 1,
            completedLists: 1,
            completionRate: {
              $round: [{
                $multiply: [
                  { $divide: ['$completedLists', '$totalLists'] },
                  100
                ]
              }, 1]
            },
            totalSpent: { $round: ['$totalSpent', 2] },
            averageSpentPerList: {
              $round: [{ $divide: ['$totalSpent', '$totalLists'] }, 2]
            },
            averageItemsPerList: { $round: ['$averageItemsPerList', 1] },
            averageCompletionRate: { $round: ['$averageCompletionRate', 1] },
          }
        }
      ]);
      
      return analytics[0] || {
        totalLists: 0,
        completedLists: 0,
        completionRate: 0,
        totalSpent: 0,
        averageSpentPerList: 0,
        averageItemsPerList: 0,
        averageCompletionRate: 0,
      };
    } catch (error) {
      throw new Error(`Failed to get shopping analytics: ${error.message}`);
    }
  }

  /**
   * Update shopping list settings
   */
  async updateShoppingListSettings(userId: string, shoppingListId: string, settings: {
    preferredStores?: Array<{
      name: string;
      address?: string;
      priority: number;
      categories: string[];
    }>;
    budget?: {
      planned?: number;
      categoryBreakdown?: Array<{
        category: string;
        planned: number;
      }>;
    };
    scheduledShoppingDate?: Date;
    reminderSettings?: {
      enabled: boolean;
      reminderTime: number;
    };
    smartFeatures?: {
      pantryIntegration?: { enabled: boolean };
      priceTracking?: { enabled: boolean; alertThreshold: number };
    };
  }) {
    try {
      const shoppingList = await this.getShoppingList(shoppingListId, userId);
      
      if (settings.preferredStores) shoppingList.preferredStores = settings.preferredStores;
      if (settings.budget) Object.assign(shoppingList.budget, settings.budget);
      if (settings.scheduledShoppingDate) shoppingList.scheduledShoppingDate = settings.scheduledShoppingDate;
      if (settings.reminderSettings) shoppingList.reminderSettings = settings.reminderSettings;
      if (settings.smartFeatures) Object.assign(shoppingList.smartFeatures, settings.smartFeatures);
      
      await shoppingList.save();
      return shoppingList;
    } catch (error) {
      throw new Error(`Failed to update shopping list settings: ${error.message}`);
    }
  }
}