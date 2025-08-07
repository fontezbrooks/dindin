// Type definitions for the DinDin backend API

import { Document, Types } from 'mongoose';
import { Request } from 'express';

// === User Types ===
export interface IUser extends Document {
  _id: Types.ObjectId;
  email: string;
  password: string;
  name: string;
  profilePicture?: string;
  preferences: {
    dietary_restrictions: DietaryRestriction[];
    cuisine_preferences: string[];
    difficulty_preference: DifficultyPreference;
    max_cook_time: number;
    spice_tolerance: SpiceTolerance;
  };
  stats: {
    total_swipes: number;
    right_swipes: number;
    matches: number;
    recipes_cooked: number;
    last_active: Date;
  };
  isActive: boolean;
  emailVerified: boolean;
  refreshTokens: RefreshToken[];
  createdAt: Date;
  updatedAt: Date;
  matchRate: number; // virtual
  
  // Instance methods
  comparePassword(candidatePassword: string): Promise<boolean>;
  updateActivity(): Promise<IUser>;
  recordSwipe(direction: SwipeDirection): Promise<IUser>;
  recordMatch(): Promise<IUser>;
}

export interface IUserStatics {
  findActiveUsers(excludeUserId: Types.ObjectId, limit?: number): Promise<IUser[]>;
}

type DietaryRestriction = 'vegetarian' | 'vegan' | 'gluten-free' | 'dairy-free' | 'nut-free' | 'keto' | 'paleo' | 'pescatarian';
type DifficultyPreference = 'easy' | 'medium' | 'hard' | 'any';
type SpiceTolerance = 'none' | 'mild' | 'medium' | 'hot' | 'very-hot';

export interface RefreshToken {
  token: string;
  createdAt: Date;
}

// === Recipe Types ===
export interface IRecipe extends Document {
  title: string;
  description: string;
  difficulty: 'easy' | 'medium' | 'hard';
  ingredients: IIngredient[];
  instructions: IInstruction[];
  cook_time?: number;
  cookTime?: number;
  prep_time?: number;
  prepTime?: number;
  image?: string;
  image_url?: string;
  cuisine: string[];
  cuisine_type?: string;
  dietary: string[];
  dietary_tags: string[];
  tags: string[];
  likes: number;
  dislikes: number;
  servings: number;
  nutrition?: INutrition;
  import_metadata?: IImportMetadata;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
  totalTime: number; // virtual
  rating: number; // virtual
  
  // Instance methods
  like(): Promise<IRecipe>;
  dislike(): Promise<IRecipe>;
}

export interface IRecipeStatics {
  getRandomRecipes(limit?: number, filters?: Record<string, unknown>): Promise<IRecipe[]>;
  searchRecipes(searchText: string, filters?: Record<string, unknown>, limit?: number): Promise<IRecipe[]>;
}

export interface IIngredient {
  name: string;
  amount: string;
  unit?: string | null;
}

export interface IInstruction {
  step: number;
  description: string;
  duration?: number | null;
}

export interface INutrition {
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
  fiber: number;
  sugar: number;
}

export interface IImportMetadata {
  source_url: string;
  scraper_name: string;
  scraper_version: string;
  confidence_score: number;
  extracted_at: string;
  notes: string;
}

// === Swipe Types ===
export interface ISwipe extends Document {
  userId: Types.ObjectId;
  recipeId: Types.ObjectId;
  direction: SwipeDirection;
  timestamp: Date;
  deviceInfo?: IDeviceInfo;
  sessionId?: string;
  user?: IUser; // populated
  recipe?: IRecipe; // populated
  
  // Instance method
  checkForMatch(): Promise<{ recipeId: Types.ObjectId; matchedUserId: Types.ObjectId; matchedAt: Date; confidence: number } | null>;
}

export interface ISwipeStatics {
  getSwipeHistory(userId: Types.ObjectId, limit?: number, skip?: number): Promise<ISwipe[]>;
  getSwipeStats(userId: Types.ObjectId): Promise<ISwipeStats>;
  findMatches(userId: Types.ObjectId, recipeId: Types.ObjectId): Promise<ISwipe[]>;
}

export type SwipeDirection = 'left' | 'right' | 'up' | 'down';

export interface IDeviceInfo {
  platform?: string;
  version?: string;
  model?: string;
  userAgent?: string;
}

export interface ISwipeStats {
  totalSwipes: number;
  rightSwipes: number;
  leftSwipes: number;
  upSwipes: number;
  downSwipes: number;
  swipeRate: number;
}

// === Request Types ===
export interface AuthenticatedRequest extends Request {
  user?: {
    userId: string;
    [key: string]: unknown;
  };
}

// === API Response Types ===
export interface ApiResponse<T = unknown> {
  success: boolean;
  data?: T;
  message: string;
  error?: string;
  errors?: ValidationError[];
}

export interface ValidationError {
  field: string;
  message: string;
  value?: unknown;
  location?: string;
}

// === Auth Types ===
export interface LoginRequest {
  email: string;
  password: string;
}

export interface RegisterRequest {
  name: string;
  email: string;
  password: string;
}

export interface RefreshTokenRequest {
  refreshToken: string;
}

export interface AuthTokens {
  accessToken: string;
  refreshToken: string;
}

export interface UserProfile {
  id: string;
  name: string;
  email: string;
  preferences: IUser['preferences'];
  stats?: IUser['stats'];
}

export interface AuthResponse {
  user: UserProfile;
  tokens: AuthTokens;
}

// === Environment Variables ===
export interface EnvironmentConfig {
  PORT: number;
  NODE_ENV: string;
  MONGODB_URI: string;
  DATABASE_NAME: string;
  CORS_ORIGIN: string;
  JWT_SECRET: string;
  JWT_EXPIRES_IN: string;
  RATE_LIMIT_WINDOW_MS: number;
  RATE_LIMIT_MAX_REQUESTS: number;
}

// === Error Types ===
export class AppError extends Error {
  statusCode: number;
  isOperational: boolean;
  
  constructor(message: string, statusCode: number) {
    super(message);
    this.statusCode = statusCode;
    this.isOperational = true;
    
    Error.captureStackTrace(this, this.constructor);
  }
}

export interface DatabaseError extends Error {
  code?: number;
  keyValue?: Record<string, unknown>;
}
