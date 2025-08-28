import { z } from "zod";

// ============================================
// Common Validation Schemas
// ============================================

// MongoDB ObjectId validation
export const mongoIdSchema = z
  .string()
  .regex(/^[0-9a-fA-F]{24}$/, "Invalid MongoDB ObjectId format");

// Email validation with proper format
export const emailSchema = z
  .string()
  .email("Invalid email format")
  .toLowerCase()
  .trim();

// Password validation with security requirements
export const passwordSchema = z
  .string()
  .min(8, "Password must be at least 8 characters")
  .max(128, "Password must not exceed 128 characters")
  .regex(/[A-Z]/, "Password must contain at least one uppercase letter")
  .regex(/[a-z]/, "Password must contain at least one lowercase letter")
  .regex(/[0-9]/, "Password must contain at least one number")
  .regex(/[^A-Za-z0-9]/, "Password must contain at least one special character");

// Username validation
export const usernameSchema = z
  .string()
  .min(3, "Username must be at least 3 characters")
  .max(30, "Username must not exceed 30 characters")
  .regex(/^[a-zA-Z0-9_-]+$/, "Username can only contain letters, numbers, underscores, and hyphens")
  .trim();

// Name validation
export const nameSchema = z
  .string()
  .min(1, "Name is required")
  .max(100, "Name must not exceed 100 characters")
  .regex(/^[a-zA-Z\s'-]+$/, "Name can only contain letters, spaces, hyphens, and apostrophes")
  .trim();

// Phone number validation (international format)
export const phoneSchema = z
  .string()
  .regex(/^\+?[1-9]\d{1,14}$/, "Invalid phone number format")
  .optional();

// URL validation
export const urlSchema = z
  .string()
  .url("Invalid URL format")
  .trim();

// Date validation
export const dateSchema = z
  .string()
  .datetime({ message: "Invalid date format" })
  .or(z.date());

// Pagination schemas
export const paginationSchema = z.object({
  limit: z.number().int().min(1).max(100).default(20),
  offset: z.number().int().min(0).default(0),
  sortBy: z.string().optional(),
  sortOrder: z.enum(["asc", "desc"]).default("desc"),
});

// ============================================
// Authentication Schemas
// ============================================

export const signUpSchema = z.object({
  email: emailSchema,
  password: passwordSchema,
  name: nameSchema,
  confirmPassword: z.string(),
}).refine(data => data.password === data.confirmPassword, {
  message: "Passwords do not match",
  path: ["confirmPassword"],
});

export const signInSchema = z.object({
  email: emailSchema,
  password: z.string().min(1, "Password is required"),
});

export const forgotPasswordSchema = z.object({
  email: emailSchema,
});

export const resetPasswordSchema = z.object({
  token: z.string().min(1, "Reset token is required"),
  password: passwordSchema,
  confirmPassword: z.string(),
}).refine(data => data.password === data.confirmPassword, {
  message: "Passwords do not match",
  path: ["confirmPassword"],
});

export const changePasswordSchema = z.object({
  currentPassword: z.string().min(1, "Current password is required"),
  newPassword: passwordSchema,
  confirmPassword: z.string(),
}).refine(data => data.newPassword === data.confirmPassword, {
  message: "Passwords do not match",
  path: ["confirmPassword"],
}).refine(data => data.currentPassword !== data.newPassword, {
  message: "New password must be different from current password",
  path: ["newPassword"],
});

// ============================================
// User Profile Schemas
// ============================================

export const dietaryRestrictionSchema = z.enum([
  "vegetarian",
  "vegan",
  "gluten-free",
  "dairy-free",
  "nut-free",
  "shellfish-free",
  "egg-free",
  "soy-free",
  "low-sodium",
  "low-carb",
  "keto",
  "paleo",
  "halal",
  "kosher",
  "pescatarian",
]);

export const allergySchema = z.enum([
  "milk",
  "eggs",
  "fish",
  "shellfish",
  "tree-nuts",
  "peanuts",
  "wheat",
  "soybeans",
  "sesame",
]);

export const cuisineTypeSchema = z.enum([
  "italian",
  "mexican",
  "chinese",
  "japanese",
  "indian",
  "thai",
  "greek",
  "french",
  "spanish",
  "american",
  "mediterranean",
  "middle-eastern",
  "korean",
  "vietnamese",
  "brazilian",
  "caribbean",
  "african",
  "german",
  "british",
  "other",
]);

export const skillLevelSchema = z.enum(["beginner", "intermediate", "expert"]);

export const spiceLevelSchema = z.enum(["none", "mild", "medium", "hot", "extra-hot"]);

export const userPreferencesSchema = z.object({
  maxCookTime: z.number().int().min(5).max(480).optional(),
  preferredCuisines: z.array(cuisineTypeSchema).max(10).optional(),
  avoidIngredients: z.array(z.string().max(50)).max(20).optional(),
  spiceLevel: z.number().int().min(0).max(5).optional(),
});

export const updateProfileSchema = z.object({
  name: nameSchema.optional(),
  dietaryRestrictions: z.array(dietaryRestrictionSchema).max(10).optional(),
  allergies: z.array(allergySchema).max(10).optional(),
  cookingSkill: skillLevelSchema.optional(),
  preferences: userPreferencesSchema.optional(),
  bio: z.string().max(500).optional(),
  avatarUrl: urlSchema.optional(),
});

export const userSettingsSchema = z.object({
  notifications: z.object({
    matches: z.boolean().optional(),
    reminders: z.boolean().optional(),
    recommendations: z.boolean().optional(),
    partnerActivity: z.boolean().optional(),
    weeklyReport: z.boolean().optional(),
  }).optional(),
  privacy: z.object({
    shareProfile: z.boolean().optional(),
    showStats: z.boolean().optional(),
    showCookingHistory: z.boolean().optional(),
  }).optional(),
  theme: z.enum(["light", "dark", "system"]).optional(),
  language: z.string().max(5).optional(),
});

// ============================================
// Partner Connection Schemas
// ============================================

export const partnerCodeSchema = z
  .string()
  .length(6, "Partner code must be exactly 6 characters")
  .toUpperCase()
  .regex(/^[A-Z0-9]{6}$/, "Partner code must contain only letters and numbers");

export const connectPartnerSchema = z.object({
  partnerCode: partnerCodeSchema,
});

// ============================================
// Recipe Schemas
// ============================================

export const difficultyLevelSchema = z.enum(["easy", "medium", "hard"]);

export const mealTypeSchema = z.enum([
  "breakfast",
  "lunch",
  "dinner",
  "snack",
  "dessert",
  "appetizer",
  "drink",
]);

export const ingredientSchema = z.object({
  name: z.string().min(1).max(100),
  amount: z.number().positive(),
  unit: z.string().max(20),
  notes: z.string().max(200).optional(),
});

export const nutritionSchema = z.object({
  calories: z.number().int().min(0).max(10000),
  protein: z.number().min(0).max(1000),
  carbs: z.number().min(0).max(1000),
  fat: z.number().min(0).max(1000),
  fiber: z.number().min(0).max(100).optional(),
  sugar: z.number().min(0).max(500).optional(),
  sodium: z.number().min(0).max(10000).optional(),
});

export const createRecipeSchema = z.object({
  title: z.string().min(3).max(200).trim(),
  description: z.string().min(10).max(1000).trim(),
  imageUrl: urlSchema,
  cookTime: z.number().int().min(1).max(1440), // in minutes, max 24 hours
  prepTime: z.number().int().min(0).max(1440),
  servings: z.number().int().min(1).max(100),
  difficulty: difficultyLevelSchema,
  cuisine: cuisineTypeSchema,
  mealType: z.array(mealTypeSchema).min(1).max(3),
  ingredients: z.array(ingredientSchema).min(1).max(50),
  steps: z.array(z.string().min(5).max(500)).min(1).max(30),
  tags: z.array(z.string().max(30)).max(10).optional(),
  nutrition: nutritionSchema.optional(),
  videoUrl: urlSchema.optional(),
  sourceUrl: urlSchema.optional(),
});

export const updateRecipeSchema = createRecipeSchema.partial();

export const recipeSearchSchema = z.object({
  query: z.string().max(100).optional(),
  cuisine: cuisineTypeSchema.optional(),
  difficulty: difficultyLevelSchema.optional(),
  maxCookTime: z.number().int().min(1).max(1440).optional(),
  mealType: mealTypeSchema.optional(),
  dietaryRestrictions: z.array(dietaryRestrictionSchema).optional(),
  excludeIngredients: z.array(z.string()).max(20).optional(),
  ...paginationSchema.shape,
});

export const recipeSwipeSchema = z.object({
  recipeId: mongoIdSchema,
  isLike: z.boolean(),
  swipeDirection: z.enum(["left", "right", "up", "down"]).optional(),
});

export const rateRecipeSchema = z.object({
  recipeId: mongoIdSchema,
  rating: z.number().min(1).max(5),
  review: z.string().max(1000).optional(),
  wouldMakeAgain: z.boolean().optional(),
});

// ============================================
// Match Schemas
// ============================================

export const matchFilterSchema = z.object({
  status: z.enum(["pending", "matched", "cooked", "archived"]).optional(),
  dateFrom: dateSchema.optional(),
  dateTo: dateSchema.optional(),
  ...paginationSchema.shape,
});

// ============================================
// Comment Schemas
// ============================================

export const createCommentSchema = z.object({
  recipeId: mongoIdSchema,
  content: z.string().min(1).max(1000).trim(),
  parentCommentId: mongoIdSchema.optional(),
});

export const updateCommentSchema = z.object({
  content: z.string().min(1).max(1000).trim(),
});

// ============================================
// Notification Schemas
// ============================================

export const notificationTypeSchema = z.enum([
  "match",
  "partner-activity",
  "recipe-recommendation",
  "achievement",
  "system",
]);

export const markNotificationReadSchema = z.object({
  notificationId: mongoIdSchema,
});

export const notificationPreferencesSchema = z.object({
  email: z.boolean(),
  push: z.boolean(),
  inApp: z.boolean(),
});

// ============================================
// Meal Planning Schemas
// ============================================

export const mealPlanSchema = z.object({
  date: dateSchema,
  breakfast: mongoIdSchema.optional(),
  lunch: mongoIdSchema.optional(),
  dinner: mongoIdSchema.optional(),
  snacks: z.array(mongoIdSchema).max(3).optional(),
});

export const createMealPlanSchema = z.object({
  weekStartDate: dateSchema,
  meals: z.array(mealPlanSchema).min(1).max(7),
});

// ============================================
// Shopping List Schemas
// ============================================

export const shoppingItemSchema = z.object({
  name: z.string().min(1).max(100).trim(),
  quantity: z.number().positive(),
  unit: z.string().max(20),
  category: z.enum([
    "produce",
    "meat",
    "dairy",
    "bakery",
    "pantry",
    "frozen",
    "beverages",
    "other",
  ]).optional(),
  checked: z.boolean().default(false),
});

export const createShoppingListSchema = z.object({
  name: z.string().min(1).max(100).trim(),
  items: z.array(shoppingItemSchema).min(1).max(200),
  recipeIds: z.array(mongoIdSchema).optional(),
});

// ============================================
// Sanitization Helpers
// ============================================

export const sanitizeHtml = (value: string): string => {
  // Remove any HTML tags and scripts
  return value
    .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, "")
    .replace(/<[^>]+>/g, "")
    .trim();
};

export const sanitizeInput = <T>(schema: z.ZodSchema<T>) => {
  return schema.transform((data) => {
    if (typeof data === "string") {
      return sanitizeHtml(data);
    }
    if (typeof data === "object" && data !== null) {
      const sanitized: any = {};
      for (const [key, value] of Object.entries(data)) {
        if (typeof value === "string") {
          sanitized[key] = sanitizeHtml(value);
        } else {
          sanitized[key] = value;
        }
      }
      return sanitized;
    }
    return data;
  });
};

// ============================================
// Export Validation Helpers
// ============================================

export const validateEmail = (email: string) => emailSchema.safeParse(email);
export const validatePassword = (password: string) => passwordSchema.safeParse(password);
export const validateMongoId = (id: string) => mongoIdSchema.safeParse(id);
export const validatePartnerCode = (code: string) => partnerCodeSchema.safeParse(code);