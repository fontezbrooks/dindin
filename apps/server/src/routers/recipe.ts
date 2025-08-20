import { z } from "zod";
import { router, protectedProcedure } from "../lib/trpc";
import { Recipe, DindinUser, Match } from "../db";
import { TRPCError } from "@trpc/server";

export const recipeRouter = router({
  getRecipeStack: protectedProcedure
    .input(
      z.object({
        limit: z.number().min(1).max(50).default(10),
      })
    )
    .query(async ({ ctx, input }) => {
      // Get or create the authenticated user's profile
      let user = await DindinUser.findOne({ authUserId: ctx.session.user.id });
      
      if (!user) {
        // Auto-create profile for authenticated user
        user = await DindinUser.create({
          authUserId: ctx.session.user.id,
          name: ctx.session.user.name || 'User',
          email: ctx.session.user.email,
          likedRecipes: [],
          dislikedRecipes: [],
          cookedRecipes: [],
          dietaryRestrictions: [],
          allergies: [],
          cookingSkill: 'beginner',
          preferences: {
            maxCookTime: 60,
            preferredCuisines: [],
            ingredientsToAvoid: [],
            spiceLevel: 'medium'
          },
          settings: {
            notifications: {
              newMatches: true,
              partnerActivity: true,
              weeklyReport: false
            },
            privacy: {
              shareProfile: true,
              showCookingHistory: true
            }
          },
          stats: {
            totalSwipes: 0,
            totalMatches: 0,
            recipesCooked: 0
          }
        });
      }

      // Get all recipes the user has already seen (liked or disliked)
      const seenRecipeIds = [
        ...user.likedRecipes,
        ...user.dislikedRecipes,
      ];

      // Find active recipes the user hasn't seen yet
      const recipes = await Recipe.find({
        _id: { $nin: seenRecipeIds },
        isActive: true,
      })
        .limit(input.limit)
        .lean();

      return recipes;
    }),

  likeRecipe: protectedProcedure
    .input(
      z.object({
        recipeId: z.string(),
        isLike: z.boolean(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      // Get or create the authenticated user's profile
      let user = await DindinUser.findOne({ authUserId: ctx.session.user.id });
      
      if (!user) {
        // Auto-create profile for authenticated user
        user = await DindinUser.create({
          authUserId: ctx.session.user.id,
          name: ctx.session.user.name || 'User',
          email: ctx.session.user.email,
          likedRecipes: [],
          dislikedRecipes: [],
          cookedRecipes: [],
          dietaryRestrictions: [],
          allergies: [],
          cookingSkill: 'beginner',
          preferences: {
            maxCookTime: 60,
            preferredCuisines: [],
            ingredientsToAvoid: [],
            spiceLevel: 'medium'
          },
          settings: {
            notifications: {
              newMatches: true,
              partnerActivity: true,
              weeklyReport: false
            },
            privacy: {
              shareProfile: true,
              showCookingHistory: true
            }
          },
          stats: {
            totalSwipes: 0,
            totalMatches: 0,
            recipesCooked: 0
          }
        });
      }

      // Check if recipe exists
      const recipe = await Recipe.findById(input.recipeId);
      if (!recipe) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Recipe not found",
        });
      }

      // Check if user can swipe this recipe
      const canSwipe = await user.canSwipeRecipe(input.recipeId);
      if (!canSwipe) {
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: "Recipe already swiped",
        });
      }

      // Update user's liked or disliked recipes
      if (input.isLike) {
        user.likedRecipes.push(recipe._id);
        
        // Check if partner also liked this recipe (for match creation)
        if (user.partnerId) {
          const partner = await DindinUser.findById(user.partnerId);
          
          if (partner && partner.likedRecipes.includes(recipe._id)) {
            // Check if match already exists
            const existingMatch = await Match.hasExistingMatch(
              [user._id, partner._id],
              recipe._id
            );

            if (!existingMatch) {
              // Create a match!
              const newMatch = await Match.create({
                users: [user._id, partner._id],
                recipeId: recipe._id,
                status: "matched",
                analytics: {
                  swipeToMatchTime: Date.now() - user.createdAt.getTime(),
                },
              });

              // Update user stats
              user.stats.totalMatches += 1;
              partner.stats.totalMatches += 1;
              await partner.save();

              // Import matchEventEmitter from match router
              const { matchEventEmitter } = await import("./match");
              
              // Emit real-time event for new match
              const populatedMatch = await Match.findById(newMatch._id)
                .populate("recipeId")
                .populate("users", "name email")
                .lean();
              
              matchEventEmitter.emit("newMatch", {
                match: populatedMatch,
                timestamp: new Date(),
              });

              // Return match information
              await user.save();
              return {
                success: true,
                matched: true,
                matchId: newMatch._id,
                recipe: recipe,
              };
            }
          }
        }
      } else {
        user.dislikedRecipes.push(recipe._id);
      }

      // Update user stats
      user.stats.totalSwipes += 1;
      await user.save();

      return {
        success: true,
        matched: false,
      };
    }),

  getMatches: protectedProcedure
    .input(
      z.object({
        status: z
          .enum(["pending", "matched", "scheduled", "cooked", "archived", "expired"])
          .optional(),
        limit: z.number().min(1).max(100).default(20),
        offset: z.number().min(0).default(0),
      })
    )
    .query(async ({ ctx, input }) => {
      // Get the authenticated user's profile
      const user = await DindinUser.findOne({ authUserId: ctx.session.user.id });
      
      if (!user) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "User profile not found",
        });
      }

      // Build query
      const query: any = { users: user._id };
      if (input.status) {
        query.status = input.status;
      }

      // Get matches with populated recipe data
      const matches = await Match.find(query)
        .populate("recipeId")
        .populate("users", "name email")
        .sort("-matchedAt")
        .skip(input.offset)
        .limit(input.limit)
        .lean();

      // Get total count for pagination
      const total = await Match.countDocuments(query);

      return {
        matches,
        total,
        hasMore: input.offset + matches.length < total,
      };
    }),

  getRecipeById: protectedProcedure
    .input(z.object({ id: z.string() }))
    .query(async ({ input }) => {
      const recipe = await Recipe.findById(input.id).lean();
      
      if (!recipe) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Recipe not found",
        });
      }

      return recipe;
    }),

  searchRecipes: protectedProcedure
    .input(
      z.object({
        query: z.string().optional(),
        cuisine: z.string().optional(),
        difficulty: z.enum(["easy", "medium", "hard"]).optional(),
        maxCookTime: z.number().optional(),
        tags: z.array(z.string()).optional(),
        limit: z.number().min(1).max(50).default(20),
        offset: z.number().min(0).default(0),
      })
    )
    .query(async ({ input }) => {
      // Build search query
      const searchQuery: any = {};

      if (input.query) {
        searchQuery.$text = { $search: input.query };
      }

      if (input.cuisine) {
        searchQuery.cuisine = input.cuisine;
      }

      if (input.difficulty) {
        searchQuery.difficulty = input.difficulty;
      }

      if (input.maxCookTime) {
        searchQuery.cook_time = { $lte: input.maxCookTime };
      }

      if (input.tags && input.tags.length > 0) {
        searchQuery.tags = { $in: input.tags };
      }

      // Execute search
      const recipes = await Recipe.find(searchQuery)
        .skip(input.offset)
        .limit(input.limit)
        .lean();

      const total = await Recipe.countDocuments(searchQuery);

      return {
        recipes,
        total,
        hasMore: input.offset + recipes.length < total,
      };
    }),
});