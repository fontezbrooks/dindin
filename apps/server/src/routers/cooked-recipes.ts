import { z } from "zod";
import { router, protectedProcedure } from "../lib/trpc";
import { Recipe, DindinUser, CookedRecipe } from "../db";
import { TRPCError } from "@trpc/server";
import mongoose from 'mongoose';

export const cookedRecipesRouter = router({
  markAsCooked: protectedProcedure
    .input(
      z.object({
        recipeId: z.string(),
        rating: z.number().min(1).max(5).optional(),
        notes: z.string().max(1000).optional(),
        difficulty: z.enum(['easier_than_expected', 'as_expected', 'harder_than_expected']).optional(),
        timeSpent: z.number().min(0).optional(),
        modifications: z.array(z.string()).optional(),
        wouldCookAgain: z.boolean().optional(),
        servings: z.number().min(1).optional(),
        cookingMethod: z.enum(['followed_exactly', 'modified_slightly', 'major_modifications', 'inspired_by']).optional(),
        mealType: z.enum(['breakfast', 'lunch', 'dinner', 'snack', 'dessert', 'appetizer', 'brunch']).optional(),
        occasion: z.enum(['weekday', 'weekend', 'special_occasion', 'date_night', 'meal_prep']).optional(),
        tags: z.array(z.string()).optional(),
        cookedWithPartner: z.boolean().optional(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      // Get user profile
      const user = await DindinUser.findOne({ authUserId: ctx.session.user.id });
      
      if (!user) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "User profile not found",
        });
      }

      // Verify recipe exists
      const recipe = await Recipe.findById(input.recipeId);
      if (!recipe) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Recipe not found",
        });
      }

      // Create cooking session record
      const cookedRecipeData: any = {
        userId: user._id,
        recipeId: recipe._id,
        cookedAt: new Date(),
        ...input
      };

      // Handle partner cooking if user has a partner and specified
      if (input.cookedWithPartner && user.partnerId) {
        cookedRecipeData.partnerId = user.partnerId;
      }

      const cookedRecipe = await CookedRecipe.create(cookedRecipeData);

      // Update user's cooked recipes array (for backward compatibility)
      user.cookedRecipes.push({
        recipeId: recipe._id,
        cookedAt: new Date(),
        rating: input.rating,
        notes: input.notes,
      });

      // Update user stats
      user.stats.recipesCooked += 1;
      await user.save();

      // If cooked with partner, also create a record for partner
      if (input.cookedWithPartner && user.partnerId) {
        const partner = await DindinUser.findById(user.partnerId);
        if (partner) {
          await CookedRecipe.create({
            ...cookedRecipeData,
            userId: user.partnerId,
            cookedWithPartner: true,
            partnerId: user._id,
          });

          // Update partner's stats and cooked recipes
          partner.cookedRecipes.push({
            recipeId: recipe._id,
            cookedAt: new Date(),
            rating: input.rating,
            notes: `Cooked with ${user.name}`,
          });
          partner.stats.recipesCooked += 1;
          await partner.save();
        }
      }

      return {
        success: true,
        cookedRecipe: {
          id: cookedRecipe._id.toString(),
          recipeId: recipe._id.toString(),
          cookedAt: cookedRecipe.cookedAt,
          rating: cookedRecipe.rating,
        }
      };
    }),

  getRecentlyCooked: protectedProcedure
    .input(
      z.object({
        limit: z.number().min(1).max(50).default(20),
        offset: z.number().min(0).default(0),
        dateFrom: z.date().optional(),
        dateTo: z.date().optional(),
        minRating: z.number().min(1).max(5).optional(),
        includePartner: z.boolean().default(false),
        sortBy: z.enum(['recent', 'rating', 'cookCount']).default('recent'),
      })
    )
    .query(async ({ ctx, input }) => {
      // Get user profile
      const user = await DindinUser.findOne({ authUserId: ctx.session.user.id });
      
      if (!user) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "User profile not found",
        });
      }

      // Build query
      const matchConditions: any = { userId: user._id };

      // Date range filtering
      if (input.dateFrom || input.dateTo) {
        matchConditions.cookedAt = {};
        if (input.dateFrom) {
          matchConditions.cookedAt.$gte = input.dateFrom;
        }
        if (input.dateTo) {
          matchConditions.cookedAt.$lte = input.dateTo;
        }
      }

      // Rating filtering
      if (input.minRating) {
        matchConditions.rating = { $gte: input.minRating };
      }

      // Include partner's cooking sessions if requested and partner exists
      if (input.includePartner && user.partnerId) {
        matchConditions.$or = [
          { userId: user._id },
          { userId: user.partnerId, cookedWithPartner: true }
        ];
        delete matchConditions.userId;
      }

      // Build aggregation pipeline
      const pipeline: any[] = [
        { $match: matchConditions },
        {
          $lookup: {
            from: 'recipes',
            localField: 'recipeId',
            foreignField: '_id',
            as: 'recipe'
          }
        },
        { $unwind: '$recipe' },
        {
          $lookup: {
            from: 'dindin_users',
            localField: 'userId',
            foreignField: '_id',
            as: 'cookedBy'
          }
        },
        { $unwind: '$cookedBy' },
      ];

      // Add cooking frequency calculation
      pipeline.push(
        {
          $lookup: {
            from: 'cooked_recipes',
            let: { recipeId: '$recipeId', userId: '$userId' },
            pipeline: [
              {
                $match: {
                  $expr: {
                    $and: [
                      { $eq: ['$recipeId', '$$recipeId'] },
                      { $eq: ['$userId', '$$userId'] }
                    ]
                  }
                }
              },
              { $count: 'count' }
            ],
            as: 'cookingFrequency'
          }
        },
        {
          $addFields: {
            cookingFrequency: {
              $ifNull: [{ $arrayElemAt: ['$cookingFrequency.count', 0] }, 1]
            }
          }
        }
      );

      // Sorting
      let sortStage: any = {};
      switch (input.sortBy) {
        case 'recent':
          sortStage = { cookedAt: -1 };
          break;
        case 'rating':
          sortStage = { rating: -1, cookedAt: -1 };
          break;
        case 'cookCount':
          sortStage = { cookingFrequency: -1, cookedAt: -1 };
          break;
      }
      pipeline.push({ $sort: sortStage });

      // Pagination
      pipeline.push({ $skip: input.offset });
      pipeline.push({ $limit: input.limit });

      // Project final structure
      pipeline.push({
        $project: {
          _id: 1,
          cookedAt: 1,
          rating: 1,
          notes: 1,
          difficulty: 1,
          timeSpent: 1,
          modifications: 1,
          wouldCookAgain: 1,
          servings: 1,
          cookedWithPartner: 1,
          cookingMethod: 1,
          mealType: 1,
          occasion: 1,
          tags: 1,
          cookingFrequency: 1,
          recipe: {
            _id: 1,
            title: 1,
            description: 1,
            image_url: 1,
            cook_time: 1,
            prep_time: 1,
            difficulty: 1,
            cuisine: 1,
            servings: 1,
            tags: 1
          },
          cookedBy: {
            _id: 1,
            name: 1,
            profileImage: 1
          }
        }
      });

      // Execute aggregation
      const results = await CookedRecipe.aggregate(pipeline);

      // Get total count for pagination
      const totalPipeline = [
        { $match: matchConditions },
        { $count: 'total' }
      ];
      const totalResult = await CookedRecipe.aggregate(totalPipeline);
      const total = totalResult[0]?.total || 0;

      return {
        cookedRecipes: results,
        total,
        hasMore: input.offset + results.length < total,
        offset: input.offset,
        limit: input.limit,
      };
    }),

  getCookingStats: protectedProcedure
    .query(async ({ ctx }) => {
      // Get user profile
      const user = await DindinUser.findOne({ authUserId: ctx.session.user.id });
      
      if (!user) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "User profile not found",
        });
      }

      // Get comprehensive cooking stats
      const stats = await CookedRecipe.getUserCookingStats(user._id.toString());
      
      // Get most cooked recipes
      const mostCooked = await CookedRecipe.getMostCookedRecipes(user._id.toString(), 5);

      // Get recent activity (last 30 days)
      const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
      const recentActivity = await CookedRecipe.aggregate([
        {
          $match: {
            userId: user._id,
            cookedAt: { $gte: thirtyDaysAgo }
          }
        },
        {
          $group: {
            _id: {
              $dateToString: { format: '%Y-%m-%d', date: '$cookedAt' }
            },
            count: { $sum: 1 }
          }
        },
        { $sort: { '_id': 1 } }
      ]);

      // Get cooking streak
      const cookingStreak = await CookedRecipe.aggregate([
        {
          $match: { userId: user._id }
        },
        {
          $group: {
            _id: {
              $dateToString: { format: '%Y-%m-%d', date: '$cookedAt' }
            },
            count: { $sum: 1 }
          }
        },
        { $sort: { '_id': -1 } },
        { $limit: 30 } // Check last 30 days for streak
      ]);

      // Calculate streak
      let currentStreak = 0;
      const today = new Date().toISOString().split('T')[0];
      const yesterday = new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString().split('T')[0];
      
      // Start from today or yesterday
      let startDate = cookingStreak.find(day => day._id === today || day._id === yesterday)?._id;
      if (startDate) {
        let checkDate = new Date(startDate);
        for (const day of cookingStreak) {
          if (day._id === checkDate.toISOString().split('T')[0]) {
            currentStreak++;
            checkDate.setDate(checkDate.getDate() - 1);
          } else {
            break;
          }
        }
      }

      return {
        basicStats: stats[0] || {
          totalCookingSessions: 0,
          uniqueRecipesCount: 0,
          avgRating: 0,
          totalTimeSpent: 0,
          recentSessions: 0
        },
        mostCookedRecipes: mostCooked,
        recentActivity,
        currentStreak,
      };
    }),

  getCookingHistory: protectedProcedure
    .input(
      z.object({
        recipeId: z.string(),
        limit: z.number().min(1).max(20).default(10),
        offset: z.number().min(0).default(0),
      })
    )
    .query(async ({ ctx, input }) => {
      // Get user profile
      const user = await DindinUser.findOne({ authUserId: ctx.session.user.id });
      
      if (!user) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "User profile not found",
        });
      }

      // Get cooking history for specific recipe
      const history = await CookedRecipe.find({
        userId: user._id,
        recipeId: input.recipeId
      })
        .populate('recipeId', 'title image_url')
        .sort({ cookedAt: -1 })
        .skip(input.offset)
        .limit(input.limit)
        .lean();

      const total = await CookedRecipe.countDocuments({
        userId: user._id,
        recipeId: input.recipeId
      });

      return {
        history,
        total,
        hasMore: input.offset + history.length < total,
      };
    }),

  updateCookingSession: protectedProcedure
    .input(
      z.object({
        sessionId: z.string(),
        rating: z.number().min(1).max(5).optional(),
        notes: z.string().max(1000).optional(),
        difficulty: z.enum(['easier_than_expected', 'as_expected', 'harder_than_expected']).optional(),
        timeSpent: z.number().min(0).optional(),
        modifications: z.array(z.string()).optional(),
        wouldCookAgain: z.boolean().optional(),
        tags: z.array(z.string()).optional(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      // Get user profile
      const user = await DindinUser.findOne({ authUserId: ctx.session.user.id });
      
      if (!user) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "User profile not found",
        });
      }

      // Find and update the cooking session
      const session = await CookedRecipe.findOneAndUpdate(
        { 
          _id: input.sessionId,
          userId: user._id 
        },
        { 
          $set: {
            ...input,
            sessionId: undefined, // Remove sessionId from update data
          }
        },
        { new: true }
      ).populate('recipeId', 'title image_url');

      if (!session) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Cooking session not found",
        });
      }

      return {
        success: true,
        session,
      };
    }),

  deleteCookingSession: protectedProcedure
    .input(z.object({
      sessionId: z.string(),
    }))
    .mutation(async ({ ctx, input }) => {
      // Get user profile
      const user = await DindinUser.findOne({ authUserId: ctx.session.user.id });
      
      if (!user) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "User profile not found",
        });
      }

      // Delete the cooking session
      const session = await CookedRecipe.findOneAndDelete({
        _id: input.sessionId,
        userId: user._id
      });

      if (!session) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Cooking session not found",
        });
      }

      // Update user stats
      user.stats.recipesCooked = Math.max(0, user.stats.recipesCooked - 1);
      
      // Remove from user's cookedRecipes array
      user.cookedRecipes = user.cookedRecipes.filter(
        (cooked: any) => !cooked.recipeId.equals(session.recipeId) || 
        cooked.cookedAt.getTime() !== session.cookedAt.getTime()
      );
      
      await user.save();

      return {
        success: true,
      };
    }),
});