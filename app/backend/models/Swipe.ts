// Swipe Model for tracking user swipe actions

import { Schema, model, Model, Types } from "mongoose";
import type { ISwipe, ISwipeStatics, ISwipeStats } from "../types/index.js";

type SwipeModel = Model<ISwipe> & ISwipeStatics;

const SwipeSchema = new Schema<ISwipe, SwipeModel>(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    recipeId: {
      type: Schema.Types.ObjectId,
      ref: "Recipe",
      required: true,
    },
    direction: {
      type: String,
      required: true,
      enum: ["left", "right", "up", "down"],
      lowercase: true,
    },
    timestamp: {
      type: Date,
      default: Date.now,
      required: true,
    },
    sessionId: {
      type: String,
      trim: true,
    },
    deviceInfo: {
      platform: String,
      version: String,
      model: String,
      userAgent: String,
    },
  },
  {
    timestamps: true,
  }
);

// Indexes for performance
SwipeSchema.index({ userId: 1, timestamp: -1 }); // User's swipe history
SwipeSchema.index({ recipeId: 1 }); // Recipe popularity tracking
SwipeSchema.index({ userId: 1, recipeId: 1 }, { unique: true }); // Prevent duplicate swipes
SwipeSchema.index({ timestamp: -1 }); // Recent swipes

// Static method to get user's swipe history
SwipeSchema.statics.getSwipeHistory = function (
  this: SwipeModel,
  userId: Types.ObjectId,
  limit = 100,
  skip = 0
): Promise<ISwipe[]> {
  return this.find({ userId })
    .populate("recipeId", "title image_url")
    .populate("user", "name email")
    .sort({ timestamp: -1 })
    .skip(skip)
    .limit(limit);
};

// Static method to get swipe statistics for a user
SwipeSchema.statics.getSwipeStats = function (
  this: SwipeModel,
  userId: Types.ObjectId
): Promise<ISwipeStats> {
  return this.aggregate([
    { $match: { userId } },
    {
      $group: {
        _id: "$direction",
        count: { $sum: 1 },
      },
    },
    {
      $group: {
        _id: null,
        totalSwipes: { $sum: "$count" },
        directions: {
          $push: {
            direction: "$_id",
            count: "$count",
          },
        },
      },
    },
    {
      $project: {
        _id: 0,
        totalSwipes: 1,
        rightSwipes: {
          $sum: {
            $map: {
              input: {
                $filter: {
                  input: "$directions",
                  cond: { $eq: ["$$this.direction", "right"] },
                },
              },
              as: "item",
              in: "$$item.count",
            },
          },
        },
        leftSwipes: {
          $sum: {
            $map: {
              input: {
                $filter: {
                  input: "$directions",
                  cond: { $eq: ["$$this.direction", "left"] },
                },
              },
              as: "item",
              in: "$$item.count",
            },
          },
        },
        upSwipes: {
          $sum: {
            $map: {
              input: {
                $filter: {
                  input: "$directions",
                  cond: { $eq: ["$$this.direction", "up"] },
                },
              },
              as: "item",
              in: "$$item.count",
            },
          },
        },
        downSwipes: {
          $sum: {
            $map: {
              input: {
                $filter: {
                  input: "$directions",
                  cond: { $eq: ["$$this.direction", "down"] },
                },
              },
              as: "item",
              in: "$$item.count",
            },
          },
        },
      },
    },
    {
      $addFields: {
        swipeRate: {
          $cond: {
            if: { $eq: ["$totalSwipes", 0] },
            then: 0,
            else: { $divide: ["$rightSwipes", "$totalSwipes"] },
          },
        },
      },
    },
  ]).then((result) => {
    if (result.length === 0) {
      return {
        totalSwipes: 0,
        rightSwipes: 0,
        leftSwipes: 0,
        upSwipes: 0,
        downSwipes: 0,
        swipeRate: 0,
      };
    }
    return result[0] as ISwipeStats;
  });
};

// Static method to find potential matches
SwipeSchema.statics.findMatches = function (
  this: SwipeModel,
  userId: Types.ObjectId,
  recipeId: Types.ObjectId
): Promise<ISwipe[]> {
  return this.find({
    recipeId,
    direction: "right",
    userId: { $ne: userId },
  })
    .populate("userId", "name email preferences")
    .populate("recipeId", "title image_url difficulty cuisine_type")
    .limit(10);
};

// Instance method to check if this swipe creates a match
SwipeSchema.methods.checkForMatch = async function (
  this: ISwipe
): Promise<{ recipeId: Types.ObjectId; matchedUserId: Types.ObjectId; matchedAt: Date; confidence: number } | null> {
  if (this.direction !== "right") return null;

  // Simple match simulation - 30% chance for demo purposes
  const shouldMatch = Math.random() < 0.3;

  if (shouldMatch) {
    // In a real app, you'd look for mutual right swipes
    const SwipeModel = this.constructor as SwipeModel;
    const potentialMatches = await SwipeModel.findMatches(
      this.userId,
      this.recipeId
    );

    if (potentialMatches.length > 0) {
      const randomMatch =
        potentialMatches[Math.floor(Math.random() * potentialMatches.length)];

      return {
        recipeId: this.recipeId,
        matchedUserId: randomMatch.userId,
        matchedAt: new Date(),
        confidence: Math.random() * 0.3 + 0.7, // 70-100% confidence
      };
    }
  }

  return null;
};

// Instance method to check if this swipe creates a match
SwipeSchema.methods.checkForMatch = async function (
  this: ISwipe
): Promise<{ recipeId: Types.ObjectId; matchedUserId: Types.ObjectId; matchedAt: Date; confidence: number } | null> {
  if (this.direction !== "right") return null;

  // Simple match simulation - 30% chance for demo purposes
  const shouldMatch = Math.random() < 0.3;

  if (shouldMatch) {
    // In a real app, you'd look for mutual right swipes
    const SwipeModel = this.constructor as SwipeModel;
    const potentialMatches = await SwipeModel.findMatches(
      this.userId,
      this.recipeId
    );

    if (potentialMatches.length > 0) {
      const randomMatch =
        potentialMatches[Math.floor(Math.random() * potentialMatches.length)];

      return {
        recipeId: this.recipeId,
        matchedUserId: randomMatch.userId,
        matchedAt: new Date(),
        confidence: Math.random() * 0.3 + 0.7, // 70-100% confidence
      };
    }
  }

  return null;
};

export default model<ISwipe, SwipeModel>("Swipe", SwipeSchema);
