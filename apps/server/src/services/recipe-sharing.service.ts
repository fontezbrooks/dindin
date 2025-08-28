import crypto from "crypto";
import mongoose from "mongoose";
import { Notification } from "../models/notification.model";
import { SharedRecipe } from "../models/shared-recipe.model";

export class RecipeSharingService {
	private static readonly BASE_URL =
		process.env.BASE_URL || "https://dindin.app";

	/**
	 * Generate a unique share token for a recipe
	 */
	private static generateShareToken(): string {
		return crypto.randomBytes(16).toString("hex");
	}

	/**
	 * Create a shareable link for a recipe
	 */
	static async createShareableLink(
		recipeId: string,
		userId: string,
		options: {
			shareType?: "public" | "friends_only" | "private" | "specific_users";
			sharedWith?: string[];
			expiresAt?: Date;
			metadata?: {
				title?: string;
				description?: string;
				imageUrl?: string;
			};
		} = {},
	): Promise<{
		shareToken: string;
		shareUrl: string;
		sharedRecipe: any;
	}> {
		const {
			shareType = "public",
			sharedWith = [],
			expiresAt,
			metadata = {},
		} = options;

		// Check if recipe is already shared by this user
		const existingShare = await SharedRecipe.findOne({
			recipeId: new mongoose.Types.ObjectId(recipeId),
			sharedBy: new mongoose.Types.ObjectId(userId),
			isActive: true,
		});

		if (existingShare) {
			return {
				shareToken: existingShare.shareToken,
				shareUrl: existingShare.shareUrl,
				sharedRecipe: existingShare,
			};
		}

		const shareToken = RecipeSharingService.generateShareToken();
		const shareUrl = `${RecipeSharingService.BASE_URL}/recipe/shared/${shareToken}`;

		const sharedWithData = sharedWith.map((userId) => ({
			userId: new mongoose.Types.ObjectId(userId),
			sharedAt: new Date(),
		}));

		const sharedRecipe = new SharedRecipe({
			recipeId: new mongoose.Types.ObjectId(recipeId),
			sharedBy: new mongoose.Types.ObjectId(userId),
			shareToken,
			shareType,
			sharedWith: sharedWithData,
			shareUrl,
			metadata,
			expiresAt,
		});

		await sharedRecipe.save();

		// Create notifications for specific users
		if (shareType === "specific_users" && sharedWith.length > 0) {
			await RecipeSharingService.notifyUsersOfSharedRecipe(
				sharedRecipe,
				sharedWith,
			);
		}

		return {
			shareToken,
			shareUrl,
			sharedRecipe,
		};
	}

	/**
	 * Get shareable recipe by token
	 */
	static async getSharedRecipe(
		shareToken: string,
		viewerUserId?: string,
	): Promise<any> {
		const sharedRecipe = await SharedRecipe.findOne({
			shareToken,
			isActive: true,
		}).populate([
			{
				path: "recipeId",
				select:
					"title description ingredients instructions image_url cook_time prep_time servings difficulty cuisine tags",
			},
			{
				path: "sharedBy",
				select: "name username avatar",
			},
		]);

		if (!sharedRecipe) {
			throw new Error("Shared recipe not found or no longer active");
		}

		// Check if share is expired
		if (sharedRecipe.isExpired) {
			throw new Error("Shared recipe has expired");
		}

		// Check privacy permissions
		if (!RecipeSharingService.canViewSharedRecipe(sharedRecipe, viewerUserId)) {
			throw new Error("You do not have permission to view this shared recipe");
		}

		// Increment view count
		await sharedRecipe.incrementView(viewerUserId);

		return sharedRecipe;
	}

	/**
	 * Check if user can view shared recipe based on privacy settings
	 */
	private static canViewSharedRecipe(
		sharedRecipe: any,
		viewerUserId?: string,
	): boolean {
		switch (sharedRecipe.shareType) {
			case "public":
				return true;

			case "private":
				return viewerUserId === sharedRecipe.sharedBy._id?.toString();

			case "specific_users":
				return (
					viewerUserId &&
					sharedRecipe.sharedWith.some(
						(sw: any) => sw.userId?.toString() === viewerUserId,
					)
				);

			case "friends_only":
				// TODO: Implement friends relationship check
				// For now, allow if user is logged in
				return !!viewerUserId;

			default:
				return false;
		}
	}

	/**
	 * Generate social media sharing URLs
	 */
	static generateSocialSharingUrls(
		shareUrl: string,
		recipe: any,
	): {
		whatsapp: string;
		facebook: string;
		twitter: string;
		email: string;
	} {
		const text = encodeURIComponent(
			`Check out this amazing recipe: ${recipe.title}`,
		);
		const url = encodeURIComponent(shareUrl);

		return {
			whatsapp: `https://wa.me/?text=${text}%20${url}`,
			facebook: `https://www.facebook.com/sharer/sharer.php?u=${url}`,
			twitter: `https://twitter.com/intent/tweet?text=${text}&url=${url}`,
			email: `mailto:?subject=${encodeURIComponent(`Recipe: ${recipe.title}`)}&body=${text}%20${url}`,
		};
	}

	/**
	 * Track social media share
	 */
	static async trackSocialShare(
		shareToken: string,
		platform: "whatsapp" | "facebook" | "twitter" | "email" | "direct",
	): Promise<void> {
		const sharedRecipe = await SharedRecipe.findOne({ shareToken });
		if (sharedRecipe) {
			await sharedRecipe.incrementShare(platform);
		}
	}

	/**
	 * Share recipe with specific users in-app
	 */
	static async shareWithUsers(
		recipeId: string,
		fromUserId: string,
		toUserIds: string[],
		message?: string,
	): Promise<void> {
		// Create shareable link for specific users
		const { shareUrl, shareToken } =
			await RecipeSharingService.createShareableLink(recipeId, fromUserId, {
				shareType: "specific_users",
				sharedWith: toUserIds,
			});

		// Create notifications for each user
		for (const toUserId of toUserIds) {
			await Notification.createNotification({
				userId: toUserId,
				type: "recipe_shared",
				title: "Recipe Shared With You",
				message: message || "Someone shared a recipe with you!",
				data: {
					recipeId: new mongoose.Types.ObjectId(recipeId),
					fromUserId: new mongoose.Types.ObjectId(fromUserId),
					sharedRecipeId: shareToken,
				},
				actionUrl: shareUrl,
				priority: "medium",
			});
		}
	}

	/**
	 * Get user's shared recipes
	 */
	static async getUserSharedRecipes(
		userId: string,
		options: {
			page?: number;
			limit?: number;
			includeStats?: boolean;
		} = {},
	): Promise<any[]> {
		const { page = 1, limit = 20, includeStats = false } = options;
		const skip = (page - 1) * limit;

		const query = SharedRecipe.find({
			sharedBy: new mongoose.Types.ObjectId(userId),
			isActive: true,
		})
			.populate("recipeId", "title image_url cuisine difficulty")
			.sort({ createdAt: -1 })
			.skip(skip)
			.limit(limit);

		const sharedRecipes = await query;

		if (includeStats) {
			return sharedRecipes.map((sr) => ({
				...sr.toObject(),
				stats: {
					totalViews: sr.analytics.totalViews,
					uniqueViews: sr.analytics.uniqueViews,
					shares: sr.analytics.shares,
					platforms: sr.analytics.platforms,
				},
			}));
		}

		return sharedRecipes;
	}

	/**
	 * Generate Open Graph metadata for shared recipe
	 */
	static generateOGMetadata(
		recipe: any,
		sharedBy: any,
	): {
		[key: string]: string;
	} {
		return {
			"og:title": recipe.title,
			"og:description":
				recipe.description ||
				`A delicious ${recipe.cuisine} recipe shared by ${sharedBy.name}`,
			"og:image": recipe.image_url || "/default-recipe-image.jpg",
			"og:type": "article",
			"og:site_name": "DinDin Recipe App",
			"twitter:card": "summary_large_image",
			"twitter:title": recipe.title,
			"twitter:description":
				recipe.description || `A delicious ${recipe.cuisine} recipe`,
			"twitter:image": recipe.image_url || "/default-recipe-image.jpg",
		};
	}

	/**
	 * Update share privacy settings
	 */
	static async updateSharePrivacy(
		shareToken: string,
		userId: string,
		shareType: "public" | "friends_only" | "private" | "specific_users",
		sharedWith?: string[],
	): Promise<any> {
		const sharedRecipe = await SharedRecipe.findOne({
			shareToken,
			sharedBy: new mongoose.Types.ObjectId(userId),
		});

		if (!sharedRecipe) {
			throw new Error(
				"Shared recipe not found or you do not have permission to modify it",
			);
		}

		sharedRecipe.shareType = shareType;

		if (shareType === "specific_users" && sharedWith) {
			sharedRecipe.sharedWith = sharedWith.map((userId) => ({
				userId: new mongoose.Types.ObjectId(userId),
				sharedAt: new Date(),
			}));
		} else if (shareType !== "specific_users") {
			sharedRecipe.sharedWith = [];
		}

		return sharedRecipe.save();
	}

	/**
	 * Deactivate a shared recipe
	 */
	static async deactivateShare(
		shareToken: string,
		userId: string,
	): Promise<void> {
		const sharedRecipe = await SharedRecipe.findOne({
			shareToken,
			sharedBy: new mongoose.Types.ObjectId(userId),
		});

		if (!sharedRecipe) {
			throw new Error(
				"Shared recipe not found or you do not have permission to deactivate it",
			);
		}

		sharedRecipe.isActive = false;
		await sharedRecipe.save();
	}

	/**
	 * Get sharing analytics for a user
	 */
	static async getSharingAnalytics(userId: string): Promise<any> {
		const stats = await SharedRecipe.getUserSharingStats(userId);

		const topShares = await SharedRecipe.find({
			sharedBy: new mongoose.Types.ObjectId(userId),
			isActive: true,
		})
			.populate("recipeId", "title image_url")
			.sort({ "analytics.totalViews": -1 })
			.limit(5);

		return {
			overview: stats[0] || {
				totalShares: 0,
				totalViews: 0,
				totalUniqueViews: 0,
				totalShareActions: 0,
				avgViewsPerShare: 0,
			},
			topPerforming: topShares,
		};
	}

	/**
	 * Private method to notify users of shared recipes
	 */
	private static async notifyUsersOfSharedRecipe(
		sharedRecipe: any,
		userIds: string[],
	): Promise<void> {
		for (const userId of userIds) {
			await Notification.createNotification({
				userId,
				type: "recipe_shared",
				title: "New Recipe Shared",
				message: "A recipe has been shared with you",
				data: {
					recipeId: sharedRecipe.recipeId,
					sharedRecipeId: sharedRecipe._id,
					fromUserId: sharedRecipe.sharedBy,
				},
				actionUrl: sharedRecipe.shareUrl,
				priority: "medium",
			});
		}
	}
}
