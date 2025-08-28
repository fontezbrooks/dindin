import { z } from "zod";
import bcrypt from "bcrypt";
import { emailSchema, passwordSchema, nameSchema } from "./schemas";

// ============================================
// Authentication Request Schemas
// ============================================

/**
 * Sign up validation with enhanced security checks
 */
export const signUpValidation = z.object({
  email: emailSchema,
  password: passwordSchema,
  name: nameSchema,
  acceptTerms: z.boolean().refine((val) => val === true, {
    message: "You must accept the terms and conditions",
  }),
  recaptchaToken: z.string().optional(), // For bot protection
});

/**
 * Sign in validation
 */
export const signInValidation = z.object({
  email: emailSchema,
  password: z.string().min(1, "Password is required"),
  rememberMe: z.boolean().optional().default(false),
  recaptchaToken: z.string().optional(),
});

/**
 * Password reset request validation
 */
export const forgotPasswordValidation = z.object({
  email: emailSchema,
  recaptchaToken: z.string().optional(),
});

/**
 * Password reset confirmation validation
 */
export const resetPasswordValidation = z.object({
  token: z
    .string()
    .min(32, "Invalid reset token")
    .regex(/^[a-zA-Z0-9_-]+$/, "Invalid token format"),
  password: passwordSchema,
  confirmPassword: z.string(),
}).refine((data) => data.password === data.confirmPassword, {
  message: "Passwords do not match",
  path: ["confirmPassword"],
});

/**
 * Email verification validation
 */
export const verifyEmailValidation = z.object({
  token: z
    .string()
    .min(32, "Invalid verification token")
    .regex(/^[a-zA-Z0-9_-]+$/, "Invalid token format"),
});

/**
 * Change password validation (for authenticated users)
 */
export const changePasswordValidation = z.object({
  currentPassword: z.string().min(1, "Current password is required"),
  newPassword: passwordSchema,
  confirmPassword: z.string(),
}).refine((data) => data.newPassword === data.confirmPassword, {
  message: "Passwords do not match",
  path: ["confirmPassword"],
}).refine((data) => data.currentPassword !== data.newPassword, {
  message: "New password must be different from current password",
  path: ["newPassword"],
});

/**
 * Update email validation
 */
export const updateEmailValidation = z.object({
  newEmail: emailSchema,
  password: z.string().min(1, "Password is required for email change"),
});

/**
 * OAuth/Social login validation
 */
export const oauthCallbackValidation = z.object({
  provider: z.enum(["google", "facebook", "apple"]),
  code: z.string().min(1, "Authorization code is required"),
  state: z.string().min(1, "State parameter is required"),
});

/**
 * Two-factor authentication setup validation
 */
export const setup2FAValidation = z.object({
  password: z.string().min(1, "Password is required to enable 2FA"),
});

/**
 * Two-factor authentication verification
 */
export const verify2FAValidation = z.object({
  code: z
    .string()
    .length(6, "2FA code must be 6 digits")
    .regex(/^\d{6}$/, "2FA code must contain only numbers"),
});

/**
 * Session refresh validation
 */
export const refreshTokenValidation = z.object({
  refreshToken: z
    .string()
    .min(32, "Invalid refresh token")
    .regex(/^[a-zA-Z0-9_-]+$/, "Invalid token format"),
});

// ============================================
// Security Helpers
// ============================================

/**
 * Hash password with bcrypt
 */
export const hashPassword = async (password: string): Promise<string> => {
  const saltRounds = 12;
  return bcrypt.hash(password, saltRounds);
};

/**
 * Verify password against hash
 */
export const verifyPassword = async (
  password: string,
  hash: string
): Promise<boolean> => {
  return bcrypt.compare(password, hash);
};

/**
 * Generate secure random token
 */
export const generateSecureToken = (length: number = 32): string => {
  const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789_-";
  let token = "";
  for (let i = 0; i < length; i++) {
    token += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return token;
};

/**
 * Validate password strength and return detailed feedback
 */
export const validatePasswordStrength = (password: string): {
  isValid: boolean;
  score: number;
  feedback: string[];
} => {
  const feedback: string[] = [];
  let score = 0;

  // Length check
  if (password.length >= 8) score += 1;
  if (password.length >= 12) score += 1;
  if (password.length < 8) {
    feedback.push("Password should be at least 8 characters long");
  }

  // Uppercase check
  if (/[A-Z]/.test(password)) {
    score += 1;
  } else {
    feedback.push("Add at least one uppercase letter");
  }

  // Lowercase check
  if (/[a-z]/.test(password)) {
    score += 1;
  } else {
    feedback.push("Add at least one lowercase letter");
  }

  // Number check
  if (/[0-9]/.test(password)) {
    score += 1;
  } else {
    feedback.push("Add at least one number");
  }

  // Special character check
  if (/[^A-Za-z0-9]/.test(password)) {
    score += 1;
  } else {
    feedback.push("Add at least one special character");
  }

  // Common password patterns to avoid
  const commonPatterns = [
    /^(password|123456|qwerty|abc123|letmein|monkey|dragon|baseball|iloveyou|trustno1)/i,
    /^[0-9]+$/, // All numbers
    /^[a-zA-Z]+$/, // All letters
    /(.)\1{3,}/, // Repeated characters (4 or more)
  ];

  for (const pattern of commonPatterns) {
    if (pattern.test(password)) {
      score = Math.max(0, score - 2);
      feedback.push("Avoid common password patterns");
      break;
    }
  }

  return {
    isValid: score >= 4,
    score: Math.min(5, Math.max(0, score)),
    feedback,
  };
};

/**
 * Check if email is from a disposable email service
 */
export const isDisposableEmail = (email: string): boolean => {
  // List of common disposable email domains
  const disposableDomains = [
    "10minutemail.com",
    "guerrillamail.com",
    "mailinator.com",
    "temp-mail.org",
    "throwaway.email",
    "yopmail.com",
    "tempmail.com",
    "trashmail.com",
    "sharklasers.com",
    "getnada.com",
  ];

  const domain = email.split("@")[1]?.toLowerCase();
  return disposableDomains.includes(domain);
};

/**
 * Rate limiting check for authentication attempts
 */
export const authRateLimitKey = (identifier: string, type: string): string => {
  return `auth_rate_limit:${type}:${identifier}`;
};

// ============================================
// Export Validation Middleware Helpers
// ============================================

/**
 * Pre-configured validation middleware for auth endpoints
 */
export const authValidators = {
  signUp: signUpValidation,
  signIn: signInValidation,
  forgotPassword: forgotPasswordValidation,
  resetPassword: resetPasswordValidation,
  verifyEmail: verifyEmailValidation,
  changePassword: changePasswordValidation,
  updateEmail: updateEmailValidation,
  oauthCallback: oauthCallbackValidation,
  setup2FA: setup2FAValidation,
  verify2FA: verify2FAValidation,
  refreshToken: refreshTokenValidation,
};

export default authValidators;