import { z } from 'zod';
import { protectedProcedure, publicProcedure, router } from '../lib/trpc';
import { RecipeSharingService } from '../services/recipe-sharing.service';

// Input validation schemas
const createShareSchema = z.object({
  recipeId: z.string(),
  shareType: z.enum(['public', 'friends_only', 'private', 'specific_users']).default('public'),
  sharedWith: z.array(z.string()).optional(),
  expiresAt: z.date().optional(),
  metadata: z.object({
    title: z.string().optional(),
    description: z.string().optional(),
    imageUrl: z.string().optional(),
  }).optional(),
});

const shareWithUsersSchema = z.object({
  recipeId: z.string(),
  userIds: z.array(z.string()),
  message: z.string().optional(),
});

const updatePrivacySchema = z.object({
  shareToken: z.string(),
  shareType: z.enum(['public', 'friends_only', 'private', 'specific_users']),
  sharedWith: z.array(z.string()).optional(),
});

const trackShareSchema = z.object({
  shareToken: z.string(),
  platform: z.enum(['whatsapp', 'facebook', 'twitter', 'email', 'direct']),
});

const getPaginationSchema = z.object({
  page: z.number().min(1).default(1),
  limit: z.number().min(1).max(100).default(20),
  includeStats: z.boolean().default(false),
});

const analyticsTimeframeSchema = z.object({
  timeframe: z.enum(['day', 'week', 'month', 'year']).default('month'),
});

export const sharingRouter = router({
  /**
   * Create a shareable link for a recipe
   */
  createShare: protectedProcedure
    .input(createShareSchema)
    .mutation(async ({ input, ctx }) => {
      const userId = ctx.session.user.id;
      
      try {
        const result = await RecipeSharingService.createShareableLink(
          input.recipeId,
          userId,
          {
            shareType: input.shareType,
            sharedWith: input.sharedWith,
            expiresAt: input.expiresAt,
            metadata: input.metadata,
          }
        );
        
        // Generate social sharing URLs
        const socialUrls = RecipeSharingService.generateSocialSharingUrls(
          result.shareUrl,
          { title: input.metadata?.title || 'Check out this recipe!' }
        );
        
        return {
          ...result,
          socialUrls,
        };
      } catch (error) {
        throw new Error(`Failed to create share: ${error.message}`);
      }
    }),
  
  /**
   * Get shared recipe by token (public endpoint)
   */
  getSharedRecipe: publicProcedure
    .input(z.object({ shareToken: z.string() }))
    .query(async ({ input, ctx }) => {
      const viewerUserId = ctx.session?.user?.id;
      
      try {
        const sharedRecipe = await RecipeSharingService.getSharedRecipe(
          input.shareToken,
          viewerUserId
        );
        
        // Generate Open Graph metadata
        const ogMetadata = RecipeSharingService.generateOGMetadata(
          sharedRecipe.recipeId,
          sharedRecipe.sharedBy
        );
        
        return {
          ...sharedRecipe.toObject(),
          ogMetadata,
        };
      } catch (error) {
        throw new Error(`Failed to get shared recipe: ${error.message}`);
      }
    }),
  
  /**
   * Share recipe with specific users in-app
   */
  shareWithUsers: protectedProcedure
    .input(shareWithUsersSchema)
    .mutation(async ({ input, ctx }) => {
      const userId = ctx.session.user.id;
      
      try {
        await RecipeSharingService.shareWithUsers(
          input.recipeId,
          userId,
          input.userIds,
          input.message
        );
        
        return {
          success: true,
          message: `Recipe shared with ${input.userIds.length} user(s)`,
        };
      } catch (error) {
        throw new Error(`Failed to share with users: ${error.message}`);
      }
    }),
  
  /**
   * Track social media share
   */
  trackShare: publicProcedure
    .input(trackShareSchema)
    .mutation(async ({ input }) => {
      try {
        await RecipeSharingService.trackSocialShare(
          input.shareToken,
          input.platform
        );
        
        return { success: true };
      } catch (error) {
        throw new Error(`Failed to track share: ${error.message}`);
      }
    }),
  
  /**
   * Get user's shared recipes
   */
  getUserShares: protectedProcedure
    .input(getPaginationSchema)
    .query(async ({ input, ctx }) => {
      const userId = ctx.session.user.id;
      
      try {
        const sharedRecipes = await RecipeSharingService.getUserSharedRecipes(
          userId,
          {
            page: input.page,
            limit: input.limit,
            includeStats: input.includeStats,
          }
        );
        
        return {
          shares: sharedRecipes,
          pagination: {
            page: input.page,
            limit: input.limit,
            total: sharedRecipes.length, // This would need to be calculated properly
          },
        };
      } catch (error) {
        throw new Error(`Failed to get user shares: ${error.message}`);
      }
    }),
  
  /**
   * Update share privacy settings
   */
  updatePrivacy: protectedProcedure
    .input(updatePrivacySchema)
    .mutation(async ({ input, ctx }) => {
      const userId = ctx.session.user.id;
      
      try {
        const updatedShare = await RecipeSharingService.updateSharePrivacy(
          input.shareToken,
          userId,
          input.shareType,
          input.sharedWith
        );
        
        return updatedShare;
      } catch (error) {
        throw new Error(`Failed to update privacy: ${error.message}`);
      }
    }),
  
  /**
   * Deactivate a shared recipe
   */
  deactivateShare: protectedProcedure
    .input(z.object({ shareToken: z.string() }))
    .mutation(async ({ input, ctx }) => {
      const userId = ctx.session.user.id;
      
      try {
        await RecipeSharingService.deactivateShare(input.shareToken, userId);
        
        return {
          success: true,
          message: 'Share deactivated successfully',
        };
      } catch (error) {
        throw new Error(`Failed to deactivate share: ${error.message}`);
      }
    }),
  
  /**
   * Get sharing analytics for user
   */
  getAnalytics: protectedProcedure
    .input(analyticsTimeframeSchema)
    .query(async ({ input, ctx }) => {
      const userId = ctx.session.user.id;
      
      try {
        const analytics = await RecipeSharingService.getSharingAnalytics(userId);
        
        return analytics;
      } catch (error) {
        throw new Error(`Failed to get analytics: ${error.message}`);
      }
    }),
  
  /**
   * Generate social sharing URLs for a recipe
   */
  getSocialUrls: publicProcedure
    .input(z.object({
      shareToken: z.string(),
    }))
    .query(async ({ input }) => {
      try {
        const sharedRecipe = await RecipeSharingService.getSharedRecipe(input.shareToken);
        
        const socialUrls = RecipeSharingService.generateSocialSharingUrls(
          sharedRecipe.shareUrl,
          sharedRecipe.recipeId
        );
        
        return socialUrls;
      } catch (error) {
        throw new Error(`Failed to generate social URLs: ${error.message}`);
      }
    }),
});