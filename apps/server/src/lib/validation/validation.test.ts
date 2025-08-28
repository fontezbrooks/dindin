import { describe, it, expect, beforeEach } from "vitest";
import { z } from "zod";
import {
  emailSchema,
  passwordSchema,
  mongoIdSchema,
  partnerCodeSchema,
  signUpSchema,
  updateProfileSchema,
  recipeSwipeSchema,
  validateEmail,
  validatePassword,
  sanitizeHtml,
} from "./schemas";
import { validatePasswordStrength, isDisposableEmail } from "./auth-validation";

describe("Validation Schemas", () => {
  describe("Email Validation", () => {
    it("should accept valid email addresses", () => {
      const validEmails = [
        "user@example.com",
        "test.user@example.co.uk",
        "user+tag@example.com",
        "123@example.com",
      ];

      validEmails.forEach((email) => {
        const result = validateEmail(email);
        expect(result.success).toBe(true);
      });
    });

    it("should reject invalid email addresses", () => {
      const invalidEmails = [
        "notanemail",
        "@example.com",
        "user@",
        "user@.com",
        "user @example.com",
        "",
      ];

      invalidEmails.forEach((email) => {
        const result = validateEmail(email);
        expect(result.success).toBe(false);
      });
    });

    it("should convert email to lowercase", () => {
      const result = emailSchema.parse("USER@EXAMPLE.COM");
      expect(result).toBe("user@example.com");
    });

    it("should trim whitespace from email", () => {
      const result = emailSchema.parse("  user@example.com  ");
      expect(result).toBe("user@example.com");
    });
  });

  describe("Password Validation", () => {
    it("should accept strong passwords", () => {
      const validPasswords = [
        "MyP@ssw0rd123",
        "Str0ng!Pass",
        "C0mpl3x#Password",
        "Valid123!Pass",
      ];

      validPasswords.forEach((password) => {
        const result = validatePassword(password);
        expect(result.success).toBe(true);
      });
    });

    it("should reject weak passwords", () => {
      const invalidPasswords = [
        "short", // Too short
        "alllowercase123!", // No uppercase
        "ALLUPPERCASE123!", // No lowercase
        "NoNumbers!", // No numbers
        "NoSpecial123", // No special characters
        "a".repeat(129), // Too long
      ];

      invalidPasswords.forEach((password) => {
        const result = validatePassword(password);
        expect(result.success).toBe(false);
      });
    });

    it("should provide meaningful password strength feedback", () => {
      const weakPassword = "password";
      const result = validatePasswordStrength(weakPassword);
      
      expect(result.isValid).toBe(false);
      expect(result.feedback.length).toBeGreaterThan(0);
      expect(result.score).toBeLessThan(4);
    });

    it("should give high score for strong passwords", () => {
      const strongPassword = "MyStr0ng!P@ssw0rd";
      const result = validatePasswordStrength(strongPassword);
      
      expect(result.isValid).toBe(true);
      expect(result.score).toBeGreaterThanOrEqual(4);
    });
  });

  describe("MongoDB ObjectId Validation", () => {
    it("should accept valid MongoDB ObjectIds", () => {
      const validIds = [
        "507f1f77bcf86cd799439011",
        "507f191e810c19729de860ea",
        "5f9d88b9e3a3d10017e5c6a8",
      ];

      validIds.forEach((id) => {
        const result = mongoIdSchema.safeParse(id);
        expect(result.success).toBe(true);
      });
    });

    it("should reject invalid MongoDB ObjectIds", () => {
      const invalidIds = [
        "123",
        "not-an-id",
        "507f1f77bcf86cd79943901", // Too short
        "507f1f77bcf86cd7994390111", // Too long
        "507f1f77bcf86cd79943901g", // Invalid character
      ];

      invalidIds.forEach((id) => {
        const result = mongoIdSchema.safeParse(id);
        expect(result.success).toBe(false);
      });
    });
  });

  describe("Partner Code Validation", () => {
    it("should accept valid partner codes", () => {
      const validCodes = ["ABC123", "XYZ789", "123456", "ABCDEF"];

      validCodes.forEach((code) => {
        const result = partnerCodeSchema.safeParse(code);
        expect(result.success).toBe(true);
        if (result.success) {
          expect(result.data).toBe(code.toUpperCase());
        }
      });
    });

    it("should reject invalid partner codes", () => {
      const invalidCodes = [
        "ABC12", // Too short
        "ABC1234", // Too long
        "ABC@23", // Invalid character
        "ABC 23", // Contains space
      ];

      invalidCodes.forEach((code) => {
        const result = partnerCodeSchema.safeParse(code);
        expect(result.success).toBe(false);
      });
    });

    it("should convert partner code to uppercase", () => {
      const result = partnerCodeSchema.parse("abc123");
      expect(result).toBe("ABC123");
    });
  });

  describe("Sign Up Schema", () => {
    it("should accept valid sign up data", () => {
      const validData = {
        email: "user@example.com",
        password: "MyP@ssw0rd123",
        name: "John Doe",
        confirmPassword: "MyP@ssw0rd123",
      };

      const result = signUpSchema.safeParse(validData);
      expect(result.success).toBe(true);
    });

    it("should reject when passwords don't match", () => {
      const invalidData = {
        email: "user@example.com",
        password: "MyP@ssw0rd123",
        name: "John Doe",
        confirmPassword: "DifferentP@ss123",
      };

      const result = signUpSchema.safeParse(invalidData);
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.issues[0].message).toContain("Passwords do not match");
      }
    });

    it("should reject invalid name formats", () => {
      const invalidData = {
        email: "user@example.com",
        password: "MyP@ssw0rd123",
        name: "John123", // Contains numbers
        confirmPassword: "MyP@ssw0rd123",
      };

      const result = signUpSchema.safeParse(invalidData);
      expect(result.success).toBe(false);
    });
  });

  describe("Update Profile Schema", () => {
    it("should accept valid profile updates", () => {
      const validData = {
        name: "Jane Doe",
        dietaryRestrictions: ["vegetarian", "gluten-free"],
        allergies: ["peanuts", "milk"],
        cookingSkill: "intermediate",
        preferences: {
          maxCookTime: 60,
          preferredCuisines: ["italian", "mexican"],
          spiceLevel: 3,
        },
      };

      const result = updateProfileSchema.safeParse(validData);
      expect(result.success).toBe(true);
    });

    it("should accept partial updates", () => {
      const partialData = {
        name: "Jane Doe",
      };

      const result = updateProfileSchema.safeParse(partialData);
      expect(result.success).toBe(true);
    });

    it("should reject invalid dietary restrictions", () => {
      const invalidData = {
        dietaryRestrictions: ["vegetarian", "invalid-restriction"],
      };

      const result = updateProfileSchema.safeParse(invalidData);
      expect(result.success).toBe(false);
    });

    it("should reject cook time outside valid range", () => {
      const invalidData = {
        preferences: {
          maxCookTime: 500, // Max is 480
        },
      };

      const result = updateProfileSchema.safeParse(invalidData);
      expect(result.success).toBe(false);
    });
  });

  describe("Recipe Swipe Schema", () => {
    it("should accept valid swipe data", () => {
      const validData = {
        recipeId: "507f1f77bcf86cd799439011",
        isLike: true,
        swipeDirection: "right",
      };

      const result = recipeSwipeSchema.safeParse(validData);
      expect(result.success).toBe(true);
    });

    it("should accept swipe without direction", () => {
      const validData = {
        recipeId: "507f1f77bcf86cd799439011",
        isLike: false,
      };

      const result = recipeSwipeSchema.safeParse(validData);
      expect(result.success).toBe(true);
    });

    it("should reject invalid recipe ID", () => {
      const invalidData = {
        recipeId: "invalid-id",
        isLike: true,
      };

      const result = recipeSwipeSchema.safeParse(invalidData);
      expect(result.success).toBe(false);
    });
  });

  describe("HTML Sanitization", () => {
    it("should remove script tags", () => {
      const dirty = '<script>alert("XSS")</script>Hello World';
      const clean = sanitizeHtml(dirty);
      expect(clean).toBe("Hello World");
    });

    it("should remove HTML tags", () => {
      const dirty = '<div onclick="alert(1)">Hello <b>World</b></div>';
      const clean = sanitizeHtml(dirty);
      expect(clean).toBe("Hello World");
    });

    it("should trim whitespace", () => {
      const dirty = "  Hello World  ";
      const clean = sanitizeHtml(dirty);
      expect(clean).toBe("Hello World");
    });
  });

  describe("Disposable Email Detection", () => {
    it("should detect disposable email addresses", () => {
      const disposableEmails = [
        "user@10minutemail.com",
        "test@guerrillamail.com",
        "temp@mailinator.com",
      ];

      disposableEmails.forEach((email) => {
        expect(isDisposableEmail(email)).toBe(true);
      });
    });

    it("should not flag legitimate email addresses", () => {
      const legitimateEmails = [
        "user@gmail.com",
        "test@company.com",
        "admin@example.org",
      ];

      legitimateEmails.forEach((email) => {
        expect(isDisposableEmail(email)).toBe(false);
      });
    });
  });
});

describe("Pagination Validation", () => {
  it("should provide default values", () => {
    const result = z.object({
      limit: z.number().int().min(1).max(100).default(20),
      offset: z.number().int().min(0).default(0),
    }).parse({});

    expect(result.limit).toBe(20);
    expect(result.offset).toBe(0);
  });

  it("should reject invalid pagination values", () => {
    const schema = z.object({
      limit: z.number().int().min(1).max(100),
      offset: z.number().int().min(0),
    });

    const invalidData = [
      { limit: 0, offset: 0 }, // Limit too small
      { limit: 101, offset: 0 }, // Limit too large
      { limit: 20, offset: -1 }, // Negative offset
    ];

    invalidData.forEach((data) => {
      const result = schema.safeParse(data);
      expect(result.success).toBe(false);
    });
  });
});