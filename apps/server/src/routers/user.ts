import { z } from "zod";
import mongoose from "mongoose";
import { router, protectedProcedure } from "../lib/trpc";
import { DindinUser, Recipe } from "../db";
import { TRPCError } from "@trpc/server";

export const userRouter = router({
  getProfile: protectedProcedure.query(async ({ ctx }) => {
    const user = await DindinUser.findOne({ authUserId: ctx.session.user.id })
      .populate("partnerId", "name email")
      .lean();

    if (!user) {
      // Create a new profile if it doesn't exist
      const newUser = await DindinUser.create({
        authUserId: ctx.session.user.id,
        name: ctx.session.user.name || "User",
        email: ctx.session.user.email,
      });
      return newUser.toObject();
    }

    return user;
  }),

  updateProfile: protectedProcedure
    .input(
      z.object({
        name: z.string().min(1).max(100).optional(),
        dietaryRestrictions: z.array(z.string()).optional(),
        allergies: z.array(z.string()).optional(),
        cookingSkill: z.enum(["beginner", "intermediate", "expert"]).optional(),
        preferences: z
          .object({
            maxCookTime: z.number().min(5).max(480).optional(),
            preferredCuisines: z.array(z.string()).optional(),
            avoidIngredients: z.array(z.string()).optional(),
            spiceLevel: z.number().min(0).max(5).optional(),
          })
          .optional(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const user = await DindinUser.findOneAndUpdate(
        { authUserId: ctx.session.user.id },
        { $set: input },
        { new: true, runValidators: true }
      );

      if (!user) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "User profile not found",
        });
      }

      return user.toObject();
    }),

  generatePartnerCode: protectedProcedure.mutation(async ({ ctx }) => {
    const user = await DindinUser.findOne({ authUserId: ctx.session.user.id });

    if (!user) {
      throw new TRPCError({
        code: "NOT_FOUND",
        message: "User profile not found",
      });
    }

    if (user.partnerCode) {
      // Return existing code if already generated
      return {
        code: user.partnerCode,
        alreadyExisted: true,
      };
    }

    // Generate new partner code
    const code = await user.generatePartnerCode();
    user.partnerCode = code;
    await user.save();

    return {
      code,
      alreadyExisted: false,
    };
  }),

  connectPartner: protectedProcedure
    .input(
      z.object({
        partnerCode: z.string().length(6).transform(s => s.toUpperCase()),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const user = await DindinUser.findOne({ authUserId: ctx.session.user.id });

      if (!user) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "User profile not found",
        });
      }

      if (user.partnerId) {
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: "Already connected to a partner",
        });
      }

      // Find partner by code (case-insensitive)
      const partner = await DindinUser.findOne({
        partnerCode: { $regex: new RegExp(`^${input.partnerCode}$`, 'i') },
      });

      if (!partner) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Invalid partner code",
        });
      }

      if (partner._id.equals(user._id)) {
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: "Cannot connect to yourself",
        });
      }

      if (partner.partnerId) {
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: "Partner is already connected to someone else",
        });
      }

      // Link both users
      user.partnerId = partner._id;
      partner.partnerId = user._id;

      await user.save();
      await partner.save();

      return {
        success: true,
        partner: {
          id: partner._id,
          name: partner.name,
          email: partner.email,
        },
      };
    }),

  disconnectPartner: protectedProcedure.mutation(async ({ ctx }) => {
    const user = await DindinUser.findOne({ authUserId: ctx.session.user.id });

    if (!user) {
      throw new TRPCError({
        code: "NOT_FOUND",
        message: "User profile not found",
      });
    }

    if (!user.partnerId) {
      throw new TRPCError({
        code: "BAD_REQUEST",
        message: "Not connected to a partner",
      });
    }

    // Unlink both users
    const partner = await DindinUser.findById(user.partnerId);
    if (partner) {
      partner.partnerId = undefined;
      await partner.save();
    }

    user.partnerId = undefined;
    await user.save();

    return { success: true };
  }),

  getStats: protectedProcedure.query(async ({ ctx }) => {
    const user = await DindinUser.findOne({ authUserId: ctx.session.user.id });

    if (!user) {
      throw new TRPCError({
        code: "NOT_FOUND",
        message: "User profile not found",
      });
    }

    return {
      totalSwipes: user.stats.totalSwipes,
      totalMatches: user.stats.totalMatches,
      recipesCooked: user.stats.recipesCooked,
      favoriteRecipes: user.stats.favoriteRecipes,
      averageRating: user.stats.averageRating,
      joinedAt: user.createdAt,
      lastActiveAt: user.stats.lastActiveAt,
      currentStreak: user.stats.currentStreak,
      longestStreak: user.stats.longestStreak,
    };
  }),

  updateSettings: protectedProcedure
    .input(
      z.object({
        notifications: z
          .object({
            matches: z.boolean().optional(),
            reminders: z.boolean().optional(),
            recommendations: z.boolean().optional(),
          })
          .optional(),
        privacy: z
          .object({
            shareProfile: z.boolean().optional(),
            showStats: z.boolean().optional(),
          })
          .optional(),
        theme: z.enum(["light", "dark", "system"]).optional(),
        language: z.string().optional(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const user = await DindinUser.findOneAndUpdate(
        { authUserId: ctx.session.user.id },
        {
          $set: {
            "settings.notifications": input.notifications,
            "settings.privacy": input.privacy,
            "settings.theme": input.theme,
            "settings.language": input.language,
          },
        },
        { new: true, runValidators: true }
      );

      if (!user) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "User profile not found",
        });
      }

      return user.settings;
    }),

  getLikedRecipes: protectedProcedure
    .input(
      z.object({
        limit: z.number().min(1).max(100).default(20),
        offset: z.number().min(0).default(0),
      })
    )
    .query(async ({ ctx, input }) => {
      const user = await DindinUser.findOne({ authUserId: ctx.session.user.id })
        .populate({
          path: "likedRecipes",
          options: {
            skip: input.offset,
            limit: input.limit,
          },
        })
        .lean();

      if (!user) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "User profile not found",
        });
      }

      return {
        recipes: user.likedRecipes || [],
        total: user.likedRecipes?.length || 0,
      };
    }),

  removeFromFavorites: protectedProcedure
    .input(
      z.object({
        recipeId: z.string().min(1, "Recipe ID is required"),
      })
    )
    .mutation(async ({ ctx, input }) => {
      // Validate recipe ID format (MongoDB ObjectId)
      if (!mongoose.isValidObjectId(input.recipeId)) {
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: "Invalid recipe ID format",
        });
      }

      // Find the user first
      const user = await DindinUser.findOne({ authUserId: ctx.session.user.id });
      
      if (!user) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "User profile not found",
        });
      }

      // Check if recipe exists in user's favorites
      const recipeObjectId = new mongoose.Types.ObjectId(input.recipeId);
      const isInFavorites = user.likedRecipes.some((likedId) => 
        likedId.equals(recipeObjectId)
      );

      if (!isInFavorites) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Recipe not found in favorites",
        });
      }

      // Verify recipe exists in database
      const recipe = await Recipe.findById(input.recipeId).lean();
      if (!recipe) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Recipe not found",
        });
      }

      try {
        // Atomically remove recipe from favorites using $pull operator
        const updateResult = await DindinUser.findOneAndUpdate(
          { 
            authUserId: ctx.session.user.id,
            likedRecipes: recipeObjectId 
          },
          { 
            $pull: { likedRecipes: recipeObjectId },
            $set: { lastActiveAt: new Date() }
          },
          { 
            new: true,
            runValidators: true
          }
        ).lean();

        if (!updateResult) {
          throw new TRPCError({
            code: "INTERNAL_SERVER_ERROR",
            message: "Failed to remove recipe from favorites",
          });
        }

        // Update recipe's like count atomically
        await Recipe.findByIdAndUpdate(
          input.recipeId,
          { $inc: { likes: -1 } },
          { runValidators: true }
        );

        return {
          success: true,
          message: "Recipe removed from favorites successfully",
          recipeId: input.recipeId,
          remainingFavoritesCount: updateResult.likedRecipes?.length || 0,
        };

      } catch (error) {
        // Log error for debugging but don't expose internal details
        console.error("Error removing recipe from favorites:", error);
        
        if (error instanceof TRPCError) {
          throw error;
        }
        
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "An unexpected error occurred while removing recipe from favorites",
        });
      }
    }),

  addToFavorites: protectedProcedure
    .input(
      z.object({
        recipeId: z.string().min(1, "Recipe ID is required"),
      })
    )
    .mutation(async ({ ctx, input }) => {
      // Validate recipe ID format (MongoDB ObjectId)
      if (!mongoose.isValidObjectId(input.recipeId)) {
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: "Invalid recipe ID format",
        });
      }

      // Find the user first
      const user = await DindinUser.findOne({ authUserId: ctx.session.user.id });
      
      if (!user) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "User profile not found",
        });
      }

      // Check if recipe is already in favorites
      const recipeObjectId = new mongoose.Types.ObjectId(input.recipeId);
      const isAlreadyInFavorites = user.likedRecipes.some((likedId) => 
        likedId.equals(recipeObjectId)
      );

      if (isAlreadyInFavorites) {
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: "Recipe already in favorites",
        });
      }

      // Verify recipe exists in database
      const recipe = await Recipe.findById(input.recipeId).lean();
      if (!recipe) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Recipe not found",
        });
      }

      try {
        // Atomically add recipe to favorites using $addToSet operator
        const updateResult = await DindinUser.findOneAndUpdate(
          { authUserId: ctx.session.user.id },
          { 
            $addToSet: { likedRecipes: recipeObjectId },
            $set: { lastActiveAt: new Date() }
          },
          { 
            new: true,
            runValidators: true
          }
        ).lean();

        if (!updateResult) {
          throw new TRPCError({
            code: "INTERNAL_SERVER_ERROR",
            message: "Failed to add recipe to favorites",
          });
        }

        // Update recipe's like count atomically
        await Recipe.findByIdAndUpdate(
          input.recipeId,
          { $inc: { likes: 1 } },
          { runValidators: true }
        );

        return {
          success: true,
          message: "Recipe added to favorites successfully",
          recipeId: input.recipeId,
          totalFavoritesCount: updateResult.likedRecipes?.length || 0,
        };

      } catch (error) {
        // Log error for debugging but don't expose internal details
        console.error("Error adding recipe to favorites:", error);
        
        if (error instanceof TRPCError) {
          throw error;
        }
        
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "An unexpected error occurred while adding recipe to favorites",
        });
      }
    }),

  isFavorite: protectedProcedure
    .input(
      z.object({
        recipeId: z.string().min(1, "Recipe ID is required"),
      })
    )
    .query(async ({ ctx, input }) => {
      // Validate recipe ID format (MongoDB ObjectId)
      if (!mongoose.isValidObjectId(input.recipeId)) {
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: "Invalid recipe ID format",
        });
      }

      const user = await DindinUser.findOne({ authUserId: ctx.session.user.id })
        .select('likedRecipes')
        .lean();

      if (!user) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "User profile not found",
        });
      }

      const recipeObjectId = new mongoose.Types.ObjectId(input.recipeId);
      const isFavorite = user.likedRecipes?.some((likedId) => 
        likedId.equals(recipeObjectId)
      ) || false;

      return {
        isFavorite,
        recipeId: input.recipeId,
      };
    }),
});