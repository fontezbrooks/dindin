import { z } from "zod";
import { router, protectedProcedure } from "../lib/trpc";
import { Match, DindinUser, Recipe } from "../db";
import { TRPCError } from "@trpc/server";
import { observable } from "@trpc/server/observable";
import { EventEmitter } from "events";

// Event emitter for real-time updates
const matchEventEmitter = new EventEmitter();

export const matchRouter = router({
  getMatchById: protectedProcedure
    .input(z.object({ id: z.string() }))
    .query(async ({ ctx, input }) => {
      const user = await DindinUser.findOne({ authUserId: ctx.session.user.id });
      
      if (!user) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "User profile not found",
        });
      }

      const match = await Match.findById(input.id)
        .populate("recipeId")
        .populate("users", "name email")
        .lean();

      if (!match) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Match not found",
        });
      }

      // Check if user is part of this match
      const isUserInMatch = match.users.some(
        (u: any) => u._id.toString() === user._id.toString()
      );

      if (!isUserInMatch) {
        throw new TRPCError({
          code: "FORBIDDEN",
          message: "You are not part of this match",
        });
      }

      return match;
    }),

  updateMatchStatus: protectedProcedure
    .input(
      z.object({
        matchId: z.string(),
        status: z.enum(["scheduled", "cooked", "archived"]),
        cookDate: z.date().optional(),
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

      const match = await Match.findById(input.matchId);

      if (!match) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Match not found",
        });
      }

      // Check if user is part of this match
      if (!match.includesUser(user._id)) {
        throw new TRPCError({
          code: "FORBIDDEN",
          message: "You are not part of this match",
        });
      }

      // Update status using the model's method
      await match.updateStatus(input.status);

      // Set cook date if scheduling
      if (input.status === "scheduled" && input.cookDate) {
        match.cookDate = input.cookDate;
      }

      // Update analytics if marking as cooked
      if (input.status === "cooked") {
        match.analytics.matchToCookTime = Date.now() - match.matchedAt.getTime();
        
        // Update user stats
        const users = await DindinUser.find({ _id: { $in: match.users } });
        for (const u of users) {
          u.stats.recipesCooked += 1;
          await u.save();
        }
      }

      await match.save();

      // Emit event for real-time updates
      matchEventEmitter.emit(`match:${match._id}`, {
        type: "statusUpdate",
        match: await match.populate("recipeId"),
      });

      return match.toObject();
    }),

  addRating: protectedProcedure
    .input(
      z.object({
        matchId: z.string(),
        rating: z.number().min(1).max(5),
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

      const match = await Match.findById(input.matchId);

      if (!match) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Match not found",
        });
      }

      // Check if user is part of this match
      if (!match.includesUser(user._id)) {
        throw new TRPCError({
          code: "FORBIDDEN",
          message: "You are not part of this match",
        });
      }

      // Add or update rating
      await match.addRating(user._id, input.rating);
      await match.save();

      // Update user's average rating
      const userMatches = await Match.find({
        users: user._id,
        "ratings.userId": user._id,
      });

      const totalRatings = userMatches.reduce((sum, m) => {
        const userRating = m.ratings.find(
          (r) => r.userId.toString() === user._id.toString()
        );
        return sum + (userRating?.rating || 0);
      }, 0);

      const ratingCount = userMatches.filter((m) =>
        m.ratings.some((r) => r.userId.toString() === user._id.toString())
      ).length;

      if (ratingCount > 0) {
        user.stats.averageRating = totalRatings / ratingCount;
        await user.save();
      }

      return { success: true };
    }),

  addNote: protectedProcedure
    .input(
      z.object({
        matchId: z.string(),
        note: z.string().min(1).max(500),
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

      const match = await Match.findById(input.matchId);

      if (!match) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Match not found",
        });
      }

      // Check if user is part of this match
      if (!match.includesUser(user._id)) {
        throw new TRPCError({
          code: "FORBIDDEN",
          message: "You are not part of this match",
        });
      }

      // Add note
      match.notes.push({
        userId: user._id,
        note: input.note,
        createdAt: new Date(),
      });

      match.interactions.lastActivityAt = new Date();
      await match.save();

      return { success: true };
    }),

  addPhoto: protectedProcedure
    .input(
      z.object({
        matchId: z.string(),
        photoUrl: z.string().url(),
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

      const match = await Match.findById(input.matchId);

      if (!match) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Match not found",
        });
      }

      // Check if user is part of this match
      if (!match.includesUser(user._id)) {
        throw new TRPCError({
          code: "FORBIDDEN",
          message: "You are not part of this match",
        });
      }

      // Add photo
      match.photos.push({
        userId: user._id,
        photoUrl: input.photoUrl,
        uploadedAt: new Date(),
      });

      match.interactions.lastActivityAt = new Date();
      await match.save();

      return { success: true };
    }),

  // Real-time subscription for new matches
  onNewMatch: protectedProcedure.subscription(({ ctx }) => {
    return observable<any>((emit) => {
      const handleNewMatch = async (data: any) => {
        // Get user to check if they're part of the match
        const user = await DindinUser.findOne({ authUserId: ctx.session.user.id });
        
        if (user && data.match.users.includes(user._id)) {
          emit.next(data);
        }
      };

      // Subscribe to all match events
      matchEventEmitter.on("newMatch", handleNewMatch);

      // Cleanup
      return () => {
        matchEventEmitter.off("newMatch", handleNewMatch);
      };
    });
  }),

  // Real-time subscription for match updates
  onMatchUpdate: protectedProcedure
    .input(z.object({ matchId: z.string() }))
    .subscription(({ input }) => {
      return observable<any>((emit) => {
        const eventName = `match:${input.matchId}`;

        const handleUpdate = (data: any) => {
          emit.next(data);
        };

        matchEventEmitter.on(eventName, handleUpdate);

        // Cleanup
        return () => {
          matchEventEmitter.off(eventName, handleUpdate);
        };
      });
    }),

  getUpcomingCookDates: protectedProcedure.query(async ({ ctx }) => {
    const user = await DindinUser.findOne({ authUserId: ctx.session.user.id });
    
    if (!user) {
      throw new TRPCError({
        code: "NOT_FOUND",
        message: "User profile not found",
      });
    }

    const upcomingMatches = await Match.find({
      users: user._id,
      status: "scheduled",
      cookDate: { $gte: new Date() },
    })
      .populate("recipeId")
      .sort("cookDate")
      .limit(10)
      .lean();

    return upcomingMatches;
  }),

  getCookedHistory: protectedProcedure
    .input(
      z.object({
        limit: z.number().min(1).max(100).default(20),
        offset: z.number().min(0).default(0),
      })
    )
    .query(async ({ ctx, input }) => {
      const user = await DindinUser.findOne({ authUserId: ctx.session.user.id });
      
      if (!user) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "User profile not found",
        });
      }

      const cookedMatches = await Match.find({
        users: user._id,
        status: "cooked",
      })
        .populate("recipeId")
        .populate("ratings.userId", "name")
        .sort("-cookDate")
        .skip(input.offset)
        .limit(input.limit)
        .lean();

      const total = await Match.countDocuments({
        users: user._id,
        status: "cooked",
      });

      return {
        matches: cookedMatches,
        total,
        hasMore: input.offset + cookedMatches.length < total,
      };
    }),
});

// Export the event emitter for use in other parts of the application
export { matchEventEmitter };