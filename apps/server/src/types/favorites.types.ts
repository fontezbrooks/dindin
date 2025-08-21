import { Types } from "mongoose";

/**
 * Input types for favorites-related mutations
 */
export interface RemoveFromFavoritesInput {
  recipeId: string;
}

export interface AddToFavoritesInput {
  recipeId: string;
}

export interface IsFavoriteInput {
  recipeId: string;
}

/**
 * Response types for favorites-related mutations
 */
export interface RemoveFromFavoritesResponse {
  success: boolean;
  message: string;
  recipeId: string;
  remainingFavoritesCount: number;
}

export interface AddToFavoritesResponse {
  success: boolean;
  message: string;
  recipeId: string;
  totalFavoritesCount: number;
}

export interface IsFavoriteResponse {
  isFavorite: boolean;
  recipeId: string;
}

/**
 * Internal service types
 */
export interface FavoritesOperationContext {
  userId: string;
  authUserId: string;
}

export interface FavoriteValidationResult {
  isValid: boolean;
  user?: any;
  recipe?: any;
  error?: string;
}

/**
 * Database operation types
 */
export interface AtomicFavoriteUpdate {
  userId: Types.ObjectId;
  recipeId: Types.ObjectId;
  operation: 'add' | 'remove';
}

/**
 * Error types specific to favorites operations
 */
export enum FavoritesErrorCode {
  RECIPE_NOT_FOUND = 'RECIPE_NOT_FOUND',
  USER_NOT_FOUND = 'USER_NOT_FOUND',
  ALREADY_IN_FAVORITES = 'ALREADY_IN_FAVORITES',
  NOT_IN_FAVORITES = 'NOT_IN_FAVORITES',
  INVALID_RECIPE_ID = 'INVALID_RECIPE_ID',
  DATABASE_ERROR = 'DATABASE_ERROR'
}

export interface FavoritesError {
  code: FavoritesErrorCode;
  message: string;
  details?: any;
}

/**
 * Service method types
 */
export interface FavoritesService {
  addToFavorites(context: FavoritesOperationContext, recipeId: string): Promise<AddToFavoritesResponse>;
  removeFromFavorites(context: FavoritesOperationContext, recipeId: string): Promise<RemoveFromFavoritesResponse>;
  isFavorite(context: FavoritesOperationContext, recipeId: string): Promise<IsFavoriteResponse>;
  validateFavoritesOperation(context: FavoritesOperationContext, recipeId: string): Promise<FavoriteValidationResult>;
}

/**
 * Utility types
 */
export type RecipeIdString = string;
export type UserIdString = string;
export type FavoritesCount = number;

/**
 * Database query types
 */
export interface FavoritesQuery {
  authUserId: string;
  likedRecipes?: Types.ObjectId;
}

export interface FavoritesUpdateOperation {
  $pull?: { likedRecipes: Types.ObjectId };
  $addToSet?: { likedRecipes: Types.ObjectId };
  $set?: { lastActiveAt: Date };
}

/**
 * Configuration types
 */
export interface FavoritesConfig {
  maxFavorites?: number;
  enableRecipeLikeCount: boolean;
  enableUserActivityTracking: boolean;
  atomicOperations: boolean;
}