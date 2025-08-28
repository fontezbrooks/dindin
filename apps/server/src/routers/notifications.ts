import { z } from "zod";
import { protectedProcedure, router } from "../lib/trpc";
import { NotificationService } from "../services/notification.service";

// Input validation schemas
const getNotificationsSchema = z.object({
	page: z.number().min(1).default(1),
	limit: z.number().min(1).max(50).default(20),
	unreadOnly: z.boolean().default(false),
	types: z
		.array(
			z.enum([
				"recipe_shared",
				"recipe_comment",
				"comment_reply",
				"comment_helpful_vote",
				"recipe_rated",
				"shared_recipe_viewed",
				"collaboration_invite",
				"collaboration_accepted",
				"recipe_tips_added",
				"recipe_liked",
				"follower_shared_recipe",
			]),
		)
		.optional(),
});

const markMultipleAsReadSchema = z.object({
	notificationIds: z.array(z.string()),
});

const updateSettingsSchema = z.object({
	types: z.record(z.string(), z.boolean()),
});

const analyticsSchema = z.object({
	timeframe: z.enum(["day", "week", "month", "year"]).default("month"),
});

export const notificationsRouter = router({
	/**
	 * Get user notifications with filtering and pagination
	 */
	getNotifications: protectedProcedure
		.input(getNotificationsSchema)
		.query(async ({ input, ctx }) => {
			const userId = ctx.session.user.id;

			try {
				const result = await NotificationService.getUserNotifications(userId, {
					page: input.page,
					limit: input.limit,
					unreadOnly: input.unreadOnly,
					types: input.types,
				});

				return result;
			} catch (error: any) {
				throw new Error(`Failed to get notifications: ${error.message}`);
			}
		}),

	/**
	 * Get unread notification count
	 */
	getUnreadCount: protectedProcedure.query(async ({ ctx }) => {
		const userId = ctx.session.user.id;

		try {
			const count = await NotificationService.getUnreadCount(userId);

			return { count };
		} catch (error: any) {
			throw new Error(`Failed to get unread count: ${error.message}`);
		}
	}),

	/**
	 * Mark notification as read
	 */
	markAsRead: protectedProcedure
		.input(z.object({ notificationId: z.string() }))
		.mutation(async ({ input, ctx }) => {
			const userId = ctx.session.user.id;

			try {
				const notification = await NotificationService.markAsRead(
					input.notificationId,
					userId,
				);

				return notification;
			} catch (error: any) {
				throw new Error(
					`Failed to mark notification as read: ${error.message}`,
				);
			}
		}),

	/**
	 * Mark multiple notifications as read
	 */
	markMultipleAsRead: protectedProcedure
		.input(markMultipleAsReadSchema)
		.mutation(async ({ input, ctx }) => {
			const userId = ctx.session.user.id;

			try {
				const result = await NotificationService.markMultipleAsRead(
					input.notificationIds,
					userId,
				);

				return result;
			} catch (error: any) {
				throw new Error(
					`Failed to mark notifications as read: ${error.message}`,
				);
			}
		}),

	/**
	 * Mark all notifications as read
	 */
	markAllAsRead: protectedProcedure.mutation(async ({ ctx }) => {
		const userId = ctx.session.user.id;

		try {
			const result = await NotificationService.markAllAsRead(userId);

			return result;
		} catch (error: any) {
			throw new Error(
				`Failed to mark all notifications as read: ${error.message}`,
			);
		}
	}),

	/**
	 * Delete notification
	 */
	deleteNotification: protectedProcedure
		.input(z.object({ notificationId: z.string() }))
		.mutation(async ({ input, ctx }) => {
			const userId = ctx.session.user.id;

			try {
				await NotificationService.deleteNotification(
					input.notificationId,
					userId,
				);

				return {
					success: true,
					message: "Notification deleted successfully",
				};
			} catch (error: any) {
				throw new Error(`Failed to delete notification: ${error.message}`);
			}
		}),

	/**
	 * Get notification settings/preferences
	 */
	getSettings: protectedProcedure.query(async ({ ctx }) => {
		const userId = ctx.session.user.id;

		try {
			const settings =
				await NotificationService.getNotificationSettings(userId);

			return settings;
		} catch (error: any) {
			throw new Error(`Failed to get notification settings: ${error.message}`);
		}
	}),

	/**
	 * Update notification settings/preferences
	 */
	updateSettings: protectedProcedure
		.input(updateSettingsSchema)
		.mutation(async ({ input, ctx }) => {
			const userId = ctx.session.user.id;

			try {
				await NotificationService.updateNotificationSettings(
					userId,
					input.types,
				);

				return {
					success: true,
					message: "Notification settings updated successfully",
				};
			} catch (error: any) {
				throw new Error(
					`Failed to update notification settings: ${error.message}`,
				);
			}
		}),

	/**
	 * Get notification analytics
	 */
	getAnalytics: protectedProcedure
		.input(analyticsSchema)
		.query(async ({ input, ctx }) => {
			const userId = ctx.session.user.id;

			try {
				const analytics = await NotificationService.getNotificationAnalytics(
					userId,
					input.timeframe,
				);

				return analytics;
			} catch (error: any) {
				throw new Error(
					`Failed to get notification analytics: ${error.message}`,
				);
			}
		}),
});
