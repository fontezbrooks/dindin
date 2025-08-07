// User API Routes
// Handles user profile management

import { Router, Request, Response, NextFunction } from "express";
import { body, param, validationResult } from "express-validator";
import User from "../models/User.js";
import type { ApiResponse, IUser } from "../types/index.js";

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
      errors: errors.array().map(error => {
        if (error.type === 'field') {
          return {
            field: error.path,
            message: error.msg,
            value: error.value,
            location: error.location
          };
        }
        return {
          field: 'unknown',
          message: error.msg,
        };
      }),
    } as ApiResponse);
    return;
  }
  next();
};

// GET /api/users/:id - Get user profile
router.get(
  "/:id",
  [param("id").notEmpty().withMessage("User ID is required")],
  handleValidationErrors,
  async (req: Request<{ id: string }>, res: Response<ApiResponse<IUser>>) => {
    try {
      const user = await User.findById(req.params.id).select(
        "-password -refreshTokens"
      );

      if (!user) {
        res.status(404).json({
          success: false,
          message: "User not found",
        });
        return;
      }

      res.json({
        success: true,
        data: user,
        message: "User profile retrieved successfully",
      });
    } catch (error) {
      console.error("Error fetching user:", error);
      res.status(500).json({
        success: false,
        message: "Internal server error",
        error:
          process.env.NODE_ENV === "development" && error instanceof Error ? error.message : undefined,
      });
    }
  }
);

// Define the update request body type
interface UpdateUserRequest {
  name?: string;
  profilePicture?: string;
  preferences?: Partial<IUser['preferences']>;
}

// PUT /api/users/:id - Update user profile
router.put(
  "/:id",
  [
    param("id").notEmpty().withMessage("User ID is required"),
    body("name").optional().trim().isLength({ max: 100 }),
    body("profilePicture").optional().isURL(),
    body("preferences.dietary_restrictions").optional().isArray(),
    body("preferences.cuisine_preferences").optional().isArray(),
    body("preferences.difficulty_preference")
      .optional()
      .isIn(["easy", "medium", "hard", "any"]),
    body("preferences.max_cook_time").optional().isInt({ min: 5, max: 300 }),
    body("preferences.spice_tolerance")
      .optional()
      .isIn(["none", "mild", "medium", "hot", "very-hot"]),
  ],
  handleValidationErrors,
  async (req: Request<{ id: string }, ApiResponse<IUser>, UpdateUserRequest>, res: Response<ApiResponse<IUser>>) => {
    try {
      const updates = { ...req.body };

      // Remove sensitive fields that shouldn't be updated via this endpoint
      const sensitiveFields = ['password', 'email', 'refreshTokens', 'stats'] as const;
      sensitiveFields.forEach(field => {
        delete updates[field as keyof typeof updates];
      });

      const user = await User.findByIdAndUpdate(req.params.id, updates, {
        new: true,
        runValidators: true,
      }).select("-password -refreshTokens");

      if (!user) {
        res.status(404).json({
          success: false,
          message: "User not found",
        });
        return;
      }

      res.json({
        success: true,
        data: user,
        message: "Profile updated successfully",
      });
    } catch (error) {
      console.error("Error updating user:", error);
      res.status(500).json({
        success: false,
        message: "Internal server error",
        error:
          process.env.NODE_ENV === "development" && error instanceof Error ? error.message : undefined,
      });
    }
  }
);

export default router;
