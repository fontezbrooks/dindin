import mongoose from "mongoose";
import { Notification } from "../models/notification.model";
import logger from "../lib/logger";

export class NotificationService {
	/**
	 * Get user notifications with filtering and pagination
	 */
	static async getUserNotifications(
		userId: string,
		options: {
			page?: number;
			limit?: number;
			unreadOnly?: boolean;
			types?: string[];
		} = {},
	): Promise<{
		notifications: any[];
		unreadCount: number;
		pagination: {
			page: number;
			limit: number;
			total: number;
			pages: number;
		};
	}> {
		const { page = 1, limit = 20, unreadOnly = false, types } = options;

		// Get unread count
		const unreadCount = await Notification.getUnreadCount(userId);

		// Get notifications
		const notifications = await Notification.getUserNotifications(userId, {
			page,
			limit,
			unreadOnly,
			types,
		});

		// Get total count for pagination
		const match: any = {
			userId: new mongoose.Types.ObjectId(userId),
		};

		if (unreadOnly) {
			match.isRead = false;
		}

		if (types && types.length > 0) {
			match.type = { $in: types };
		}

		const total = await Notification.countDocuments(match);
		const pages = Math.ceil(total / limit);

		return {
			notifications,
			unreadCount,
			pagination: {
				page,
				limit,
				total,
				pages,
			},
		};
	}

	/**
	 * Mark notification as read
	 */
	static async markAsRead(
		notificationId: string,
		userId: string,
	): Promise<any> {
		const notification = await Notification.findOne({
			_id: new mongoose.Types.ObjectId(notificationId),
			userId: new mongoose.Types.ObjectId(userId),
		});

		if (!notification) {
			throw new Error("Notification not found");
		}

		if (!notification.isRead) {
			await notification.markAsRead();
		}

		return notification;
	}

	/**
	 * Mark multiple notifications as read
	 */
	static async markMultipleAsRead(
		notificationIds: string[],
		userId: string,
	): Promise<{ modifiedCount: number }> {
		const result = await Notification.markMultipleAsRead(
			userId,
			notificationIds,
		);
		return { modifiedCount: result.modifiedCount };
	}

	/**
	 * Mark all notifications as read
	 */
	static async markAllAsRead(
		userId: string,
	): Promise<{ modifiedCount: number }> {
		const result = await Notification.updateMany(
			{
				userId: new mongoose.Types.ObjectId(userId),
				isRead: false,
			},
			{
				$set: {
					isRead: true,
					readAt: new Date(),
				},
			},
		);

		return { modifiedCount: result.modifiedCount };
	}

	/**
	 * Delete notification
	 */
	static async deleteNotification(
		notificationId: string,
		userId: string,
	): Promise<void> {
		const result = await Notification.deleteOne({
			_id: new mongoose.Types.ObjectId(notificationId),
			userId: new mongoose.Types.ObjectId(userId),
		});

		if (result.deletedCount === 0) {
			throw new Error("Notification not found or already deleted");
		}
	}

	/**
	 * Get notification settings/preferences for user
	 */
	static async getNotificationSettings(userId: string): Promise<{
		types: { [key: string]: boolean };
	}> {
		// TODO: Implement user notification preferences
		// For now, return default settings
		return {
			types: {
				recipe_shared: true,
				recipe_comment: true,
				comment_reply: true,
				comment_helpful_vote: true,
				recipe_rated: true,
				shared_recipe_viewed: true,
				collaboration_invite: true,
				collaboration_accepted: true,
				recipe_tips_added: true,
				recipe_liked: true,
				follower_shared_recipe: true,
			},
		};
	}

	/**
	 * Update notification settings/preferences
	 */
	static async updateNotificationSettings(
		userId: string,
		settings: { [key: string]: boolean },
	): Promise<void> {
		// TODO: Implement user notification preferences storage
		// This would typically be stored in user profile or separate preferences table
		logger.log(`Updated notification settings for user ${userId}:`, settings);
	}

	/**
	 * Create bulk notifications for multiple users
	 */
	static async createBulkNotifications(
		notifications: Array<{
			userId: string;
			type: string;
			title: string;
			message: string;
			data?: any;
			priority?: string;
			actionUrl?: string;
			expiresAt?: Date;
		}>,
	): Promise<void> {
		const notificationDocs = notifications.map((notif) => ({
			...notif,
			userId: new mongoose.Types.ObjectId(notif.userId),
		}));

		await Notification.insertMany(notificationDocs);
	}

	/**
	 * Get notification analytics
	 */
	static async getNotificationAnalytics(
		userId: string,
		timeframe: "day" | "week" | "month" | "year" = "month",
	): Promise<{
		totalReceived: number;
		totalRead: number;
		readRate: number;
		byType: { [key: string]: number };
		byPriority: { [key: string]: number };
	}> {
		const now = new Date();
		let startDate: Date;

		switch (timeframe) {
			case "day":
				startDate = new Date(now.getTime() - 24 * 60 * 60 * 1000);
				break;
			case "week":
				startDate = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
				break;
			case "year":
				startDate = new Date(now.getTime() - 365 * 24 * 60 * 60 * 1000);
				break;
			default: // month
				startDate = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
		}

		const analytics = await Notification.aggregate([
			{
				$match: {
					userId: new mongoose.Types.ObjectId(userId),
					createdAt: { $gte: startDate },
				},
			},
			{
				$group: {
					_id: null,
					totalReceived: { $sum: 1 },
					totalRead: {
						$sum: {
							$cond: [{ $eq: ["$isRead", true] }, 1, 0],
						},
					},
					byType: {
						$push: "$type",
					},
					byPriority: {
						$push: "$priority",
					},
				},
			},
		]);

		if (!analytics.length) {
			return {
				totalReceived: 0,
				totalRead: 0,
				readRate: 0,
				byType: {},
				byPriority: {},
			};
		}

		const result = analytics[0];

		const byType = result.byType.reduce((acc: any, type: string) => {
			acc[type] = (acc[type] || 0) + 1;
			return acc;
		}, {});

		const byPriority = result.byPriority.reduce(
			(acc: any, priority: string) => {
				acc[priority] = (acc[priority] || 0) + 1;
				return acc;
			},
			{},
		);

		return {
			totalReceived: result.totalReceived,
			totalRead: result.totalRead,
			readRate:
				result.totalReceived > 0
					? (result.totalRead / result.totalReceived) * 100
					: 0,
			byType,
			byPriority,
		};
	}

	/**
	 * Clean up expired notifications
	 */
	static async cleanupExpiredNotifications(): Promise<{
		deletedCount: number;
	}> {
		const result = await Notification.deleteMany({
			expiresAt: { $lte: new Date() },
		});

		return { deletedCount: result.deletedCount };
	}

	/**
	 * Get real-time notification count for user
	 */
	static async getUnreadCount(userId: string): Promise<number> {
		return Notification.getUnreadCount(userId);
	}
}
