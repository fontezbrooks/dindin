import { z } from "zod";
import { protectedProcedure, router } from "../lib/trpc";
import { RecipeCommentsService } from "../services/recipe-comments.service";

// Input validation schemas
const addCommentSchema = z.object({
	recipeId: z.string(),
	content: z.string().min(1).max(2000),
	commentType: z
		.enum(["comment", "tip", "modification", "question", "review"])
		.default("comment"),
	rating: z.number().min(1).max(5).optional(),
	parentCommentId: z.string().optional(),
	sharedRecipeId: z.string().optional(),
	tags: z.array(z.string()).default([]),
});

const getCommentsSchema = z.object({
	recipeId: z.string(),
	page: z.number().min(1).default(1),
	limit: z.number().min(1).max(50).default(20),
	sortBy: z.enum(["newest", "oldest", "helpful"]).default("newest"),
	type: z
		.enum(["comment", "tip", "modification", "question", "review"])
		.optional(),
});

const getRepliesSchema = z.object({
	commentId: z.string(),
	page: z.number().min(1).default(1),
	limit: z.number().min(1).max(20).default(10),
});

const voteCommentSchema = z.object({
	commentId: z.string(),
	vote: z.enum(["helpful", "not_helpful"]),
});

const editCommentSchema = z.object({
	commentId: z.string(),
	content: z.string().min(1).max(2000).optional(),
	tags: z.array(z.string()).optional(),
});

const flagCommentSchema = z.object({
	commentId: z.string(),
	reason: z.enum([
		"spam",
		"inappropriate",
		"offensive",
		"misinformation",
		"other",
	]),
	details: z.string().optional(),
});

const getUserActivitySchema = z.object({
	page: z.number().min(1).default(1),
	limit: z.number().min(1).max(50).default(20),
	type: z
		.enum(["comment", "tip", "modification", "question", "review"])
		.optional(),
});

export const commentsRouter = router({
	/**
	 * Add a comment to a recipe
	 */
	addComment: protectedProcedure
		.input(addCommentSchema)
		.mutation(async ({ input, ctx }) => {
			const userId = ctx.session.user.id;

			try {
				const comment = await RecipeCommentsService.addComment(
					input.recipeId,
					userId,
					{
						content: input.content,
						commentType: input.commentType,
						rating: input.rating,
						parentCommentId: input.parentCommentId,
						sharedRecipeId: input.sharedRecipeId,
						tags: input.tags,
					},
				);

				return comment;
			} catch (error) {
				throw new Error(`Failed to add comment: ${error.message}`);
			}
		}),

	/**
	 * Get comments for a recipe with pagination and filtering
	 */
	getComments: protectedProcedure
		.input(getCommentsSchema)
		.query(async ({ input, ctx }) => {
			const userId = ctx.session.user.id;

			try {
				const result = await RecipeCommentsService.getRecipeComments(
					input.recipeId,
					{
						page: input.page,
						limit: input.limit,
						sortBy: input.sortBy,
						type: input.type,
						userId,
					},
				);

				return result;
			} catch (error) {
				throw new Error(`Failed to get comments: ${error.message}`);
			}
		}),

	/**
	 * Get replies for a specific comment
	 */
	getReplies: protectedProcedure
		.input(getRepliesSchema)
		.query(async ({ input, ctx }) => {
			const userId = ctx.session.user.id;

			try {
				const replies = await RecipeCommentsService.getCommentReplies(
					input.commentId,
					{
						page: input.page,
						limit: input.limit,
						userId,
					},
				);

				return replies;
			} catch (error) {
				throw new Error(`Failed to get replies: ${error.message}`);
			}
		}),

	/**
	 * Vote on comment helpfulness
	 */
	voteComment: protectedProcedure
		.input(voteCommentSchema)
		.mutation(async ({ input, ctx }) => {
			const userId = ctx.session.user.id;

			try {
				const updatedComment = await RecipeCommentsService.voteOnComment(
					input.commentId,
					userId,
					input.vote,
				);

				return updatedComment;
			} catch (error) {
				throw new Error(`Failed to vote on comment: ${error.message}`);
			}
		}),

	/**
	 * Edit a comment
	 */
	editComment: protectedProcedure
		.input(editCommentSchema)
		.mutation(async ({ input, ctx }) => {
			const userId = ctx.session.user.id;

			try {
				const updatedComment = await RecipeCommentsService.editComment(
					input.commentId,
					userId,
					{
						content: input.content,
						tags: input.tags,
					},
				);

				return updatedComment;
			} catch (error) {
				throw new Error(`Failed to edit comment: ${error.message}`);
			}
		}),

	/**
	 * Delete a comment
	 */
	deleteComment: protectedProcedure
		.input(z.object({ commentId: z.string() }))
		.mutation(async ({ input, ctx }) => {
			const userId = ctx.session.user.id;

			try {
				await RecipeCommentsService.deleteComment(
					input.commentId,
					userId,
					false, // isAdmin
				);

				return {
					success: true,
					message: "Comment deleted successfully",
				};
			} catch (error) {
				throw new Error(`Failed to delete comment: ${error.message}`);
			}
		}),

	/**
	 * Flag a comment as inappropriate
	 */
	flagComment: protectedProcedure
		.input(flagCommentSchema)
		.mutation(async ({ input, ctx }) => {
			const userId = ctx.session.user.id;

			try {
				await RecipeCommentsService.flagComment(
					input.commentId,
					userId,
					input.reason,
					input.details,
				);

				return {
					success: true,
					message: "Comment flagged successfully",
				};
			} catch (error) {
				throw new Error(`Failed to flag comment: ${error.message}`);
			}
		}),

	/**
	 * Get comment statistics for a recipe
	 */
	getCommentStats: protectedProcedure
		.input(z.object({ recipeId: z.string() }))
		.query(async ({ input }) => {
			try {
				const stats = await RecipeCommentsService.getCommentStats(
					input.recipeId,
				);

				return stats;
			} catch (error) {
				throw new Error(`Failed to get comment stats: ${error.message}`);
			}
		}),

	/**
	 * Get user's comment activity
	 */
	getUserActivity: protectedProcedure
		.input(getUserActivitySchema)
		.query(async ({ input, ctx }) => {
			const userId = ctx.session.user.id;

			try {
				const activity = await RecipeCommentsService.getUserCommentActivity(
					userId,
					{
						page: input.page,
						limit: input.limit,
						type: input.type,
					},
				);

				return activity;
			} catch (error) {
				throw new Error(`Failed to get user activity: ${error.message}`);
			}
		}),
});
