/**
 * Central export for all validation schemas and middleware
 */

// Export all schemas
export * from "./schemas";

// Export auth validation
export * from "./auth-validation";

// Export middleware
export {
  validateRequest,
  validateMultiple,
  globalErrorHandler,
  createErrorResponse,
  createSuccessResponse,
  ErrorType,
} from "./middleware";

// Re-export commonly used validators as a namespace for convenience
import * as schemas from "./schemas";
import * as authValidation from "./auth-validation";
import * as middleware from "./middleware";

export const validation = {
  schemas,
  auth: authValidation,
  middleware,
};

// Export pre-configured validators for common use cases
export const validators = {
  // Authentication
  signUp: schemas.signUpSchema,
  signIn: schemas.signInSchema,
  forgotPassword: schemas.forgotPasswordSchema,
  resetPassword: schemas.resetPasswordSchema,
  changePassword: schemas.changePasswordSchema,
  
  // User profile
  updateProfile: schemas.updateProfileSchema,
  updateSettings: schemas.userSettingsSchema,
  
  // Partner connection
  connectPartner: schemas.connectPartnerSchema,
  
  // Recipes
  createRecipe: schemas.createRecipeSchema,
  updateRecipe: schemas.updateRecipeSchema,
  searchRecipe: schemas.recipeSearchSchema,
  swipeRecipe: schemas.recipeSwipeSchema,
  rateRecipe: schemas.rateRecipeSchema,
  
  // Comments
  createComment: schemas.createCommentSchema,
  updateComment: schemas.updateCommentSchema,
  
  // Meal planning
  createMealPlan: schemas.createMealPlanSchema,
  
  // Shopping list
  createShoppingList: schemas.createShoppingListSchema,
  
  // Common
  pagination: schemas.paginationSchema,
  mongoId: schemas.mongoIdSchema,
  email: schemas.emailSchema,
  password: schemas.passwordSchema,
};

export default validation;