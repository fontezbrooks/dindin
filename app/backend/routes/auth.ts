// Authentication API Routes
// Handles user registration, login, and token management

import { Router, Request, Response, NextFunction } from "express";
import { body, validationResult } from "express-validator";
import jwt, { JwtPayload } from "jsonwebtoken";
const { sign, verify } = jwt;
// Types import removed as we don't need it - Mongoose handles ObjectId conversion
import User from "../models/User.js";
import type {
  ApiResponse,
  LoginRequest,
  RegisterRequest,
  RefreshTokenRequest,
  AuthResponse,
  AuthTokens,
  UserProfile,
} from "../types/index.js";

const router = Router();

// Validation middleware
const handleValidationErrors = (
  req: Request,
  res: Response,
  next: NextFunction
): void => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    res.status(400).json({
      success: false,
      message: "Validation error",
      errors: errors.array().map((error) => {
        if (error.type === "field") {
          return {
            field: error.path,
            message: error.msg,
            value: error.value,
            location: error.location,
          };
        }
        return {
          field: "unknown",
          message: error.msg,
        };
      }),
    } as ApiResponse);
    return;
  }
  next();
};

// Generate JWT tokens
const generateTokens = (userId: string): AuthTokens => {
  const secret = process.env.JWT_SECRET || "your-secret-key";

  // Note: Using type assertion to work around @types/jsonwebtoken compatibility issue
  const accessToken = (sign as any)({ userId }, secret, {
    expiresIn: process.env.JWT_EXPIRES_IN || "1h",
  });
  const refreshToken = (sign as any)({ userId }, secret, {
    expiresIn: "7d",
  });

  return { accessToken, refreshToken };
};

// POST /api/auth/register - Register new user
router.post(
  "/register",
  [
    body("name")
      .notEmpty()
      .trim()
      .isLength({ max: 100 })
      .withMessage("Name is required and must be less than 100 characters"),
    body("email")
      .isEmail()
      .normalizeEmail()
      .withMessage("Valid email is required"),
    body("password")
      .isLength({ min: 6 })
      .withMessage("Password must be at least 6 characters long"),
  ],
  handleValidationErrors,
  async (
    req: Request<object, ApiResponse<AuthResponse>, RegisterRequest>,
    res: Response<ApiResponse<AuthResponse>>
  ) => {
    try {
      const { name, email, password } = req.body;

      // Check if user already exists
      const existingUser = await User.findOne({ email });
      if (existingUser) {
        res.status(409).json({
          success: false,
          message: "User with this email already exists",
        });
        return;
      }

      // Create new user
      const user = new User({
        name,
        email,
        password, // Will be hashed by pre-save middleware
        preferences: {
          dietary_restrictions: [],
          cuisine_preferences: [],
          difficulty_preference: "any",
          max_cook_time: 60,
          spice_tolerance: "medium",
        },
      });

      await user.save();

      // Generate tokens
      const { accessToken, refreshToken } = generateTokens(user._id.toString());

      // Save refresh token
      user.refreshTokens = user.refreshTokens || [];
      user.refreshTokens.push({ token: refreshToken, createdAt: new Date() });
      await user.save();

      const userProfile: UserProfile = {
        id: user._id.toString(),
        name: user.name,
        email: user.email,
        preferences: user.preferences,
      };

      res.status(201).json({
        success: true,
        data: {
          user: userProfile,
          tokens: {
            accessToken,
            refreshToken,
          },
        },
        message: "User registered successfully",
      });
    } catch (error) {
      console.error("Error registering user:", error);
      res.status(500).json({
        success: false,
        message: "Internal server error",
        error:
          process.env.NODE_ENV === "development" && error instanceof Error
            ? error.message
            : undefined,
      });
    }
  }
);

// POST /api/auth/login - User login
router.post(
  "/login",
  [
    body("email")
      .isEmail()
      .normalizeEmail()
      .withMessage("Valid email is required"),
    body("password").notEmpty().withMessage("Password is required"),
  ],
  handleValidationErrors,
  async (
    req: Request<object, ApiResponse<AuthResponse>, LoginRequest>,
    res: Response<ApiResponse<AuthResponse>>
  ) => {
    try {
      const { email, password } = req.body;

      // Find user
      const user = await User.findOne({ email, isActive: true });
      if (!user) {
        res.status(401).json({
          success: false,
          message: "Invalid email or password",
        });
        return;
      }

      // Check password
      const isMatch = await user.comparePassword(password);
      if (!isMatch) {
        res.status(401).json({
          success: false,
          message: "Invalid email or password",
        });
        return;
      }

      // Generate tokens
      const { accessToken, refreshToken } = generateTokens(user._id.toString());

      // Save refresh token
      user.refreshTokens = user.refreshTokens || [];
      user.refreshTokens.push({ token: refreshToken, createdAt: new Date() });
      await user.updateActivity();

      const userProfile: UserProfile = {
        id: user._id.toString(),
        name: user.name,
        email: user.email,
        preferences: user.preferences,
        stats: user.stats,
      };

      res.json({
        success: true,
        data: {
          user: userProfile,
          tokens: {
            accessToken,
            refreshToken,
          },
        },
        message: "Login successful",
      });
    } catch (error) {
      console.error("Error during login:", error);
      res.status(500).json({
        success: false,
        message: "Internal server error",
        error:
          process.env.NODE_ENV === "development" && error instanceof Error
            ? error.message
            : undefined,
      });
    }
  }
);

// POST /api/auth/refresh - Refresh access token
router.post(
  "/refresh",
  [body("refreshToken").notEmpty().withMessage("Refresh token is required")],
  handleValidationErrors,
  async (
    req: Request<
      object,
      ApiResponse<{ tokens: AuthTokens }>,
      RefreshTokenRequest
    >,
    res: Response<ApiResponse<{ tokens: AuthTokens }>>
  ) => {
    try {
      const { refreshToken } = req.body;

      // Verify refresh token
      let decoded: string | JwtPayload;
      try {
        decoded = verify(
          refreshToken,
          process.env.JWT_SECRET || "your-secret-key"
        );
      } catch {
        res.status(401).json({
          success: false,
          message: "Invalid refresh token",
        });
        return;
      }

      const userId = typeof decoded === "object" && decoded.userId;
      if (!userId) {
        res.status(401).json({
          success: false,
          message: "Invalid refresh token",
        });
        return;
      }

      // Find user and check if refresh token exists
      const user = await User.findOne({
        _id: userId,
        "refreshTokens.token": refreshToken,
        isActive: true,
      });

      if (!user) {
        res.status(401).json({
          success: false,
          message: "Invalid refresh token",
        });
        return;
      }

      // Generate new tokens
      const tokens = generateTokens(user._id.toString());

      // Remove old refresh token and add new one
      user.refreshTokens = user.refreshTokens.filter(
        (t) => t.token !== refreshToken
      );
      user.refreshTokens.push({
        token: tokens.refreshToken,
        createdAt: new Date(),
      });
      await user.save();

      res.json({
        success: true,
        data: {
          tokens,
        },
        message: "Tokens refreshed successfully",
      });
    } catch (error) {
      console.error("Error refreshing token:", error);
      res.status(500).json({
        success: false,
        message: "Internal server error",
        error:
          process.env.NODE_ENV === "development" && error instanceof Error
            ? error.message
            : undefined,
      });
    }
  }
);

// POST /api/auth/logout - User logout
router.post(
  "/logout",
  [body("refreshToken").optional().isString()],
  async (
    req: Request<object, ApiResponse, { refreshToken?: string }>,
    res: Response<ApiResponse>
  ) => {
    try {
      const { refreshToken } = req.body;

      if (refreshToken) {
        // Remove specific refresh token
        await User.updateOne(
          { "refreshTokens.token": refreshToken },
          { $pull: { refreshTokens: { token: refreshToken } } }
        );
      }

      res.json({
        success: true,
        message: "Logout successful",
      });
    } catch (error) {
      console.error("Error during logout:", error);
      res.status(500).json({
        success: false,
        message: "Internal server error",
        error:
          process.env.NODE_ENV === "development" && error instanceof Error
            ? error.message
            : undefined,
      });
    }
  }
);

export default router;
