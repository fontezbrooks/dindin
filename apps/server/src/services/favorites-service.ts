import { TRPCError } from "@trpc/server";
import mongoose, { type Types } from "mongoose";
import { DindinUser, Recipe } from "../db";
import logger from "../lib/logger";
import {
  FavoritesService,
  FavoritesOperationContext,
  AddToFavoritesResponse,
  RemoveFromFavoritesResponse,
  IsFavoriteResponse,
  FavoriteValidationResult,
  FavoritesErrorCode,
  AtomicFavoriteUpdate,
} from "../types/favorites.types";

/**
 * Service class for managing user favorites operations
 * Provides atomic operations and comprehensive error handling
 */
export class FavoritesServiceImpl implements FavoritesService {
  
  /**
   * Add a recipe to user's favorites
   */
  async addToFavorites(
    context: FavoritesOperationContext,
    recipeId: string
  ): Promise<AddToFavoritesResponse> {
    
    // Validate inputs
    const validation = await this.validateFavoritesOperation(context, recipeId);
    if (!validation.isValid) {
      throw new TRPCError({
        code: "BAD_REQUEST",
        message: validation.error || "Invalid operation",
      });
    }

    const { user, recipe } = validation;
    const recipeObjectId = new mongoose.Types.ObjectId(recipeId);

    // Check if already in favorites
    const isAlreadyFavorite = user.likedRecipes.some((likedId: Types.ObjectId) => 
      likedId.equals(recipeObjectId)
    );

    if (isAlreadyFavorite) {
      throw new TRPCError({
        code: "BAD_REQUEST",
        message: "Recipe already in favorites",
      });
    }

    try {
      // Perform atomic operation to add to favorites
      const updateResult = await this.performAtomicUpdate({
        userId: user._id,
        recipeId: recipeObjectId,
        operation: 'add'
      });

      return {
        success: true,
        message: "Recipe added to favorites successfully",
        recipeId: recipeId,
        totalFavoritesCount: updateResult.totalCount,
      };

    } catch (error) {
      throw this.handleServiceError(error, "adding recipe to favorites");
    }
  }

  /**
   * Remove a recipe from user's favorites
   */
  async removeFromFavorites(
    context: FavoritesOperationContext,
    recipeId: string
  ): Promise<RemoveFromFavoritesResponse> {
    
    // Validate inputs
    const validation = await this.validateFavoritesOperation(context, recipeId);
    if (!validation.isValid) {
      throw new TRPCError({
        code: "BAD_REQUEST", 
        message: validation.error || "Invalid operation",
      });
    }

    const { user, recipe } = validation;
    const recipeObjectId = new mongoose.Types.ObjectId(recipeId);

    // Check if recipe is in favorites
    const isInFavorites = user.likedRecipes.some((likedId: Types.ObjectId) => 
      likedId.equals(recipeObjectId)
    );

    if (!isInFavorites) {
      throw new TRPCError({
        code: "NOT_FOUND",
        message: "Recipe not found in favorites",
      });
    }

    try {
      // Perform atomic operation to remove from favorites
      const updateResult = await this.performAtomicUpdate({
        userId: user._id,
        recipeId: recipeObjectId,
        operation: 'remove'
      });

      return {
        success: true,
        message: "Recipe removed from favorites successfully",
        recipeId: recipeId,
        remainingFavoritesCount: updateResult.totalCount,
      };

    } catch (error) {
      throw this.handleServiceError(error, "removing recipe from favorites");
    }
  }

  /**
   * Check if a recipe is in user's favorites
   */
  async isFavorite(
    context: FavoritesOperationContext,
    recipeId: string
  ): Promise<IsFavoriteResponse> {
    
    // Validate inputs
    const validation = await this.validateFavoritesOperation(context, recipeId, false);
    if (!validation.isValid) {
      throw new TRPCError({
        code: "BAD_REQUEST",
        message: validation.error || "Invalid operation",
      });
    }

    const { user } = validation;
    const recipeObjectId = new mongoose.Types.ObjectId(recipeId);

    const isFavorite = user.likedRecipes?.some((likedId: Types.ObjectId) => 
      likedId.equals(recipeObjectId)
    ) || false;

    return {
      isFavorite,
      recipeId: recipeId,
    };
  }

  /**
   * Validate the favorites operation context and inputs
   */
  async validateFavoritesOperation(
    context: FavoritesOperationContext,
    recipeId: string,
    validateRecipe: boolean = true
  ): Promise<FavoriteValidationResult> {
    
    // Validate recipe ID format
    if (!mongoose.isValidObjectId(recipeId)) {
      return {
        isValid: false,
        error: "Invalid recipe ID format",
      };
    }

    // Find user
    const user = await DindinUser.findOne({ authUserId: context.authUserId });
    if (!user) {
      return {
        isValid: false,
        error: "User profile not found",
      };
    }

    // Validate recipe exists (if requested)
    let recipe = null;
    if (validateRecipe) {
      recipe = await Recipe.findById(recipeId).lean();
      if (!recipe) {
        return {
          isValid: false,
          error: "Recipe not found",
        };
      }
    }

    return {
      isValid: true,
      user,
      recipe,
    };
  }

  /**
   * Perform atomic database operations for favorites
   */
  private async performAtomicUpdate(
    operation: AtomicFavoriteUpdate
  ): Promise<{ totalCount: number }> {
    
    const session = await mongoose.startSession();
    
    try {
      await session.withTransaction(async () => {
        let userUpdate;
        let recipeUpdate;

        if (operation.operation === 'add') {
          // Add to user's favorites
          userUpdate = {
            $addToSet: { likedRecipes: operation.recipeId },
            $set: { lastActiveAt: new Date() }
          };
          // Increment recipe like count
          recipeUpdate = { $inc: { likes: 1 } };
        } else {
          // Remove from user's favorites
          userUpdate = {
            $pull: { likedRecipes: operation.recipeId },
            $set: { lastActiveAt: new Date() }
          };
          // Decrement recipe like count
          recipeUpdate = { $inc: { likes: -1 } };
        }

        // Update user
        await DindinUser.findByIdAndUpdate(
          operation.userId,
          userUpdate,
          { 
            new: true, 
            runValidators: true,
            session 
          }
        );

        // Update recipe like count
        await Recipe.findByIdAndUpdate(
          operation.recipeId,
          recipeUpdate,
          { 
            runValidators: true,
            session 
          }
        );
      });

      // Get updated user to return count
      const updatedUser = await DindinUser.findById(operation.userId)
        .select('likedRecipes')
        .lean();

      return {
        totalCount: updatedUser?.likedRecipes?.length || 0,
      };

    } catch (error) {
      throw error;
    } finally {
      await session.endSession();
    }
  }

  /**
   * Handle service errors and convert to appropriate TRPCError
   */
  private handleServiceError(error: any, operation: string): TRPCError {
    logger.error(`Error ${operation}:`, error);
    
    if (error instanceof TRPCError) {
      return error;
    }

    if (error.name === 'ValidationError') {
      return new TRPCError({
        code: "BAD_REQUEST",
        message: "Invalid data provided",
      });
    }

    if (error.name === 'MongoError' || error.name === 'MongoServerError') {
      return new TRPCError({
        code: "INTERNAL_SERVER_ERROR", 
        message: "Database operation failed",
      });
    }

    return new TRPCError({
      code: "INTERNAL_SERVER_ERROR",
      message: `An unexpected error occurred while ${operation}`,
    });
  }

  /**
   * Get user's favorites count without loading all recipes
   */
  async getFavoritesCount(authUserId: string): Promise<number> {
    const user = await DindinUser.findOne({ authUserId })
      .select('likedRecipes')
      .lean();
    
    return user?.likedRecipes?.length || 0;
  }

  /**
   * Batch check if multiple recipes are favorites
   */
  async areFavorites(
    authUserId: string,
    recipeIds: string[]
  ): Promise<Record<string, boolean>> {
    
    const user = await DindinUser.findOne({ authUserId })
      .select('likedRecipes')
      .lean();

    if (!user) {
      throw new TRPCError({
        code: "NOT_FOUND",
        message: "User profile not found",
      });
    }

    const result: Record<string, boolean> = {};
    
    recipeIds.forEach(recipeId => {
      if (!mongoose.isValidObjectId(recipeId)) {
        result[recipeId] = false;
        return;
      }

      const recipeObjectId = new mongoose.Types.ObjectId(recipeId);
      result[recipeId] = user.likedRecipes?.some((likedId: Types.ObjectId) => 
        likedId.equals(recipeObjectId)
      ) || false;
    });

    return result;
  }
}

// Export singleton instance
export const favoritesService = new FavoritesServiceImpl();