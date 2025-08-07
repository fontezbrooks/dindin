// Swipe API Routes - TypeScript version

import { Router, Request, Response, NextFunction } from "express";
import { body, param, validationResult } from "express-validator";
import { Types } from "mongoose";
import Swipe from "../models/Swipe.js";
import User from "../models/User.js";
import type { ApiResponse, ISwipe, SwipeDirection, DatabaseError } from "../types/index.js";

const router = Router();

// Validation middleware
const handleValidationErrors = (req: Request, res: Response, next: NextFunction): void => {
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

// Request body for recording swipes
interface RecordSwipeRequest {
  userId: string;
  recipeId: string;
  direction: SwipeDirection;
  sessionId?: string;
  deviceInfo?: {
    platform?: string;
    version?: string;
    model?: string;
    userAgent?: string;
  };
}

// POST /api/swipes - Record a swipe action
router.post(
  "/",
  [
    body("userId").notEmpty().withMessage("User ID is required"),
    body("recipeId").notEmpty().withMessage("Recipe ID is required"),
    body("direction")
      .isIn(["left", "right", "up", "down"])
      .withMessage("Direction must be left, right, up, or down"),
  ],
  handleValidationErrors,
  async (req: Request<object, ApiResponse<{ swipe: ISwipe; match?: unknown }>, RecordSwipeRequest>, res: Response<ApiResponse<{ swipe: ISwipe; match?: unknown }>>) => {
    try {
      const { userId, recipeId, direction, sessionId, deviceInfo } = req.body;

      // Create new swipe record
      const swipe = new Swipe({
        userId,
        recipeId,
        direction,
        sessionId,
        deviceInfo,
        timestamp: new Date(),
      });

      await swipe.save();

      // Update user statistics
      const user = await User.findById(userId);
      if (user) {
        await user.recordSwipe(direction);
      }

      // Check for potential matches
      const match = await swipe.checkForMatch();
      
      if (match && user) {
        await user.recordMatch();
      }

      res.status(201).json({
        success: true,
        data: {
          swipe,
          ...(match && { match }),
        },
        message: match ? "Swipe recorded and match found!" : "Swipe recorded successfully",
      });
    } catch (error) {
      // Handle duplicate swipe error
      if (error instanceof Error && 'code' in error && (error as DatabaseError).code === 11000) {
        res.status(409).json({
          success: false,
          message: "You have already swiped on this recipe",
        });
        return;
      }

      console.error("Error recording swipe:", error);
      res.status(500).json({
        success: false,
        message: "Internal server error",
        error: process.env.NODE_ENV === "development" && error instanceof Error ? error.message : undefined,
      });
    }
  }
);

// GET /api/swipes/history/:userId - Get user's swipe history
router.get(
  "/history/:userId",
  [param("userId").notEmpty().withMessage("User ID is required")],
  handleValidationErrors,
  async (req: Request<{ userId: string }>, res: Response<ApiResponse<ISwipe[]>>) => {
    try {
      const { userId } = req.params;
      const limit = parseInt(req.query.limit as string) || 50;
      const skip = parseInt(req.query.skip as string) || 0;

      const swipes = await Swipe.getSwipeHistory(
        new Types.ObjectId(userId),
        limit,
        skip
      );

      res.json({
        success: true,
        data: swipes,
        message: `Retrieved ${swipes.length} swipe records`,
      });
    } catch (error) {
      console.error("Error fetching swipe history:", error);
      res.status(500).json({
        success: false,
        message: "Internal server error",
        error: process.env.NODE_ENV === "development" && error instanceof Error ? error.message : undefined,
      });
    }
  }
);

export default router;
