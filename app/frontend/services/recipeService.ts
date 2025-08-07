// Recipe Service for MongoDB Integration
import { Recipe, RecipeUI, RecipeConverter } from '../models/recipeSchema';
import { apiRequest, ENDPOINTS } from '../config/api';

export interface RecipeQuery {
  difficulty?: string;
  cuisine_type?: string;
  dietary_tags?: string[];
  tags?: string[];
  isActive?: boolean;
  limit?: number;
  skip?: number;
}

export interface SwipeRecord {
  userId?: string;
  recipeId: string;
  direction: 'left' | 'right';
  timestamp: Date;
}

class RecipeService {
  constructor() {
    // Service configuration is now handled by the API config
  }

  // Get recipes with optional filtering
  async getRecipes(query: RecipeQuery = {}): Promise<RecipeUI[]> {
    try {
      const queryParams = new URLSearchParams();
      
      if (query.difficulty) queryParams.append('difficulty', query.difficulty);
      if (query.cuisine_type) queryParams.append('cuisine_type', query.cuisine_type);
      if (query.dietary_tags?.length) {
        query.dietary_tags.forEach(tag => queryParams.append('dietary_tags', tag));
      }
      if (query.tags?.length) {
        query.tags.forEach(tag => queryParams.append('tags', tag));
      }
      if (query.isActive !== undefined) queryParams.append('isActive', query.isActive.toString());
      if (query.limit) queryParams.append('limit', query.limit.toString());
      if (query.skip) queryParams.append('skip', query.skip.toString());

      const endpoint = `${ENDPOINTS.recipes}?${queryParams}`;
      const response = await apiRequest(endpoint);
      
      if (response.success && response.data) {
        const mongoRecipes: Recipe[] = response.data;
        return mongoRecipes.map(recipe => RecipeConverter.toUI(recipe));
      }
      return [];
    } catch (error) {
      console.error('Error fetching recipes:', error);
      throw error;
    }
  }

  // Get personalized recipes for a user
  async getPersonalizedRecipes(userId?: string): Promise<RecipeUI[]> {
    try {
      const endpoint = userId 
        ? `${ENDPOINTS.recipesPersonalized}/${userId}`
        : ENDPOINTS.recipesPersonalized;
        
      const response = await apiRequest(endpoint);
      
      if (response.success && response.data) {
        const mongoRecipes: Recipe[] = response.data;
        return mongoRecipes.map(recipe => RecipeConverter.toUI(recipe));
      }
      return [];
    } catch (error) {
      console.error('Error fetching personalized recipes:', error);
      throw error;
    }
  }

  // Get a single recipe by ID
  async getRecipeById(recipeId: string): Promise<RecipeUI | null> {
    try {
      const response = await apiRequest(ENDPOINTS.recipeById(recipeId));
      
      if (response.success && response.data) {
        return RecipeConverter.toUI(response.data);
      }
      return null;
    } catch (error) {
      console.error('Error fetching recipe by ID:', error);
      if (error instanceof Error && error.message.includes('404')) {
        return null;
      }
      throw error;
    }
  }

  // Record a swipe action
  async recordSwipe(swipeData: SwipeRecord): Promise<{ success: boolean; isMatch?: boolean; match?: any }> {
    try {
      // Validate required fields
      if (!swipeData.recipeId || !swipeData.direction) {
        throw new Error('Missing required fields: recipeId and direction are required');
      }

      // Ensure userId is present
      if (!swipeData.userId) {
        console.warn('userId missing in swipe data, using anonymous');
        swipeData.userId = 'anonymous';
      }

      const result = await apiRequest(ENDPOINTS.swipes, {
        method: 'POST',
        body: JSON.stringify(swipeData),
      });
      
      return result;
    } catch (error) {
      console.error('Error recording swipe:', error);
      
      // Return mock success for development when backend is unavailable
      const isMockMatch = Math.random() < 0.3; // 30% match rate
      return { 
        success: true, // Return true so UI continues working
        isMatch: swipeData.direction === 'right' && isMockMatch,
        match: isMockMatch ? { partnerName: 'Alex' } : undefined 
      };
    }
  }

  // Get user's swipe history
  async getSwipeHistory(userId: string): Promise<SwipeRecord[]> {
    try {
      const response = await apiRequest(ENDPOINTS.swipeHistory(userId));
      return response.data || [];
    } catch (error) {
      console.error('Error fetching swipe history:', error);
      return [];
    }
  }

  // Get user's matches
  async getMatches(userId: string): Promise<RecipeUI[]> {
    try {
      const response = await apiRequest(ENDPOINTS.matches(userId));
      
      if (response.success && response.data) {
        const mongoRecipes: Recipe[] = response.data;
        return mongoRecipes.map(recipe => RecipeConverter.toUI(recipe));
      }
      return [];
    } catch (error) {
      console.error('Error fetching matches:', error);
      return [];
    }
  }

  // Search recipes by text
  async searchRecipes(searchText: string, filters: RecipeQuery = {}): Promise<RecipeUI[]> {
    try {
      const queryParams = new URLSearchParams();
      queryParams.append('search', searchText);
      
      // Add filters
      Object.entries(filters).forEach(([key, value]) => {
        if (value !== undefined) {
          if (Array.isArray(value)) {
            value.forEach(v => queryParams.append(key, v));
          } else {
            queryParams.append(key, value.toString());
          }
        }
      });

      const endpoint = `${ENDPOINTS.recipesSearch}?${queryParams}`;
      const response = await apiRequest(endpoint);
      
      if (response.success && response.data) {
        const mongoRecipes: Recipe[] = response.data;
        return mongoRecipes.map(recipe => RecipeConverter.toUI(recipe));
      }
      return [];
    } catch (error) {
      console.error('Error searching recipes:', error);
      return [];
    }
  }

  // Update recipe (admin function)
  async updateRecipe(recipeId: string, updates: Partial<Recipe>): Promise<boolean> {
    try {
      const response = await apiRequest(ENDPOINTS.recipeById(recipeId), {
        method: 'PUT',
        body: JSON.stringify(updates),
      });

      return response.success;
    } catch (error) {
      console.error('Error updating recipe:', error);
      return false;
    }
  }

  // Create new recipe (admin function)
  async createRecipe(recipe: Omit<Recipe, '_id' | 'createdAt' | 'updatedAt'>): Promise<string | null> {
    try {
      const response = await apiRequest(ENDPOINTS.recipes, {
        method: 'POST',
        body: JSON.stringify(recipe),
      });

      if (response.success && response.data?._id) {
        return response.data._id;
      }
      return null;
    } catch (error) {
      console.error('Error creating recipe:', error);
      return null;
    }
  }

  // Delete recipe (admin function)
  async deleteRecipe(recipeId: string): Promise<boolean> {
    try {
      const response = await apiRequest(ENDPOINTS.recipeById(recipeId), {
        method: 'DELETE',
      });

      return response.success;
    } catch (error) {
      console.error('Error deleting recipe:', error);
      return false;
    }
  }
}

// Export singleton instance
export const recipeService = new RecipeService();
export default recipeService;