// User Model for user profiles and preferences

import { Schema, model, Model, Types } from "mongoose";
import bcrypt from "bcryptjs";
import type { IUser, IUserStatics, SwipeDirection } from "../types/index.js";

type UserModel = Model<IUser> & IUserStatics;

const UserSchema = new Schema<IUser, UserModel>(
  {
    // Basic user info
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
      match: [
        /^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/,
        "Please enter a valid email",
      ],
    },
    password: {
      type: String,
      required: true,
      minlength: 6,
    },
    name: {
      type: String,
      required: true,
      trim: true,
      maxlength: 100,
    },
    profilePicture: {
      type: String,
      trim: true,
    },

    // User preferences for recipe matching
    preferences: {
      dietary_restrictions: [
        {
          type: String,
          enum: [
            "vegetarian",
            "vegan",
            "gluten-free",
            "dairy-free",
            "nut-free",
            "keto",
            "paleo",
            "pescatarian",
          ],
          lowercase: true,
        },
      ],
      cuisine_preferences: [
        {
          type: String,
          lowercase: true,
          trim: true,
        },
      ],
      difficulty_preference: {
        type: String,
        enum: ["easy", "medium", "hard", "any"],
        default: "any",
        lowercase: true,
      },
      max_cook_time: {
        type: Number,
        min: 5,
        max: 300,
        default: 60,
      },
      spice_tolerance: {
        type: String,
        enum: ["none", "mild", "medium", "hot", "very-hot"],
        default: "medium",
        lowercase: true,
      },
    },

    // User activity stats
    stats: {
      total_swipes: {
        type: Number,
        default: 0,
        min: 0,
      },
      right_swipes: {
        type: Number,
        default: 0,
        min: 0,
      },
      matches: {
        type: Number,
        default: 0,
        min: 0,
      },
      recipes_cooked: {
        type: Number,
        default: 0,
        min: 0,
      },
      last_active: {
        type: Date,
        default: Date.now,
      },
    },

    // Account status
    isActive: {
      type: Boolean,
      default: true,
    },
    emailVerified: {
      type: Boolean,
      default: false,
    },

    // Authentication tokens
    refreshTokens: [
      {
        token: String,
        createdAt: {
          type: Date,
          default: Date.now,
          expires: "7d",
        },
      },
    ],
  },
  {
    timestamps: true,
    toJSON: {
      virtuals: true,
      transform: function (_doc: unknown, ret: Record<string, unknown>) {
        delete ret.password;
        delete ret.refreshTokens;
        return ret;
      },
    },
    toObject: { virtuals: true },
  }
);

// Indexes
UserSchema.index({ email: 1 }, { unique: true });
UserSchema.index({ "stats.last_active": -1 });
UserSchema.index({ isActive: 1 });

// Virtual for match rate
UserSchema.virtual("matchRate").get(function (this: IUser): number {
  if (this.stats.right_swipes === 0) return 0;
  return (this.stats.matches / this.stats.right_swipes) * 100;
});

// Hash password before saving
UserSchema.pre<IUser>("save", async function (next) {
  if (!this.isModified("password")) return next();

  try {
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
    next();
  } catch (error) {
    next(error as Error);
  }
});

// Instance method to check password
UserSchema.methods.comparePassword = async function (
  this: IUser,
  candidatePassword: string
): Promise<boolean> {
  return bcrypt.compare(candidatePassword, this.password);
};

// Instance method to update activity
UserSchema.methods.updateActivity = function (this: IUser): Promise<IUser> {
  this.stats.last_active = new Date();
  return this.save();
};

// Instance method to record swipe
UserSchema.methods.recordSwipe = function (
  this: IUser,
  direction: SwipeDirection
): Promise<IUser> {
  this.stats.total_swipes += 1;
  if (direction === "right") {
    this.stats.right_swipes += 1;
  }
  this.updateActivity();
  return this.save();
};

// Instance method to record match
UserSchema.methods.recordMatch = function (this: IUser): Promise<IUser> {
  this.stats.matches += 1;
  this.updateActivity();
  return this.save();
};

// Static method to find users for matching
UserSchema.statics.findActiveUsers = function (
  this: UserModel,
  excludeUserId: Types.ObjectId,
  limit = 50
): Promise<IUser[]> {
  return this.find({
    _id: { $ne: excludeUserId },
    isActive: true,
    "stats.last_active": {
      $gte: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000),
    }, // Active in last 30 days
  }).limit(limit);
};

export default model<IUser, UserModel>("User", UserSchema);
