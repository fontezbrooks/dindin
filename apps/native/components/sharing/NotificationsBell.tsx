import { Ionicons } from "@expo/vector-icons";
import type React from "react";
import { useEffect, useState } from "react";
import {
	Alert,
	FlatList,
	Modal,
	RefreshControl,
	Text,
	TouchableOpacity,
	View,
} from "react-native";
import { trpc } from "../../lib/trpc";
import logger from '@/utils/logger';

interface Notification {
	_id: string;
	type: string;
	title: string;
	message: string;
	isRead: boolean;
	createdAt: string;
	actionUrl?: string;
	fromUser?: {
		name: string;
		username: string;
		avatar?: string;
	};
	recipe?: {
		title: string;
		image_url?: string;
	};
}

interface NotificationsBellProps {
	style?: object;
}

export const NotificationsBell: React.FC<NotificationsBellProps> = ({
	style,
}) => {
	const [showNotifications, setShowNotifications] = useState(false);
	const [page, setPage] = useState(1);
	const [hasMore, setHasMore] = useState(true);
	const [notifications, setNotifications] = useState<Notification[]>([]);

	const unreadCountQuery = trpc.notifications.getUnreadCount.useQuery(
		undefined,
		{
			refetchInterval: 30000, // Refetch every 30 seconds
		},
	);

	const notificationsQuery = trpc.notifications.getNotifications.useQuery(
		{
			page,
			limit: 20,
		},
		{
			enabled: showNotifications,
		},
	);

	const markAsReadMutation = trpc.notifications.markAsRead.useMutation();
	const markAllAsReadMutation = trpc.notifications.markAllAsRead.useMutation();
	const deleteNotificationMutation =
		trpc.notifications.deleteNotification.useMutation();

	useEffect(() => {
		if (notificationsQuery.data) {
			if (page === 1) {
				setNotifications(notificationsQuery.data.notifications);
			} else {
				setNotifications((prev) => [
					...prev,
					...notificationsQuery.data.notifications,
				]);
			}
			setHasMore(
				notificationsQuery.data.pagination.page <
					notificationsQuery.data.pagination.pages,
			);
		}
	}, [notificationsQuery.data, page]);

	const handleNotificationPress = async (notification: Notification) => {
		// Mark as read if unread
		if (!notification.isRead) {
			try {
				await markAsReadMutation.mutateAsync({
					notificationId: notification._id,
				});

				// Update local state
				setNotifications((prev) =>
					prev.map((n) =>
						n._id === notification._id ? { ...n, isRead: true } : n,
					),
				);

				// Refetch unread count
				unreadCountQuery.refetch();
			} catch (error) {
				logger.error("Failed to mark notification as read:", error);
			}
		}

		// Handle navigation based on notification type
		// This would typically involve navigation to specific screens
		// For now, we'll just show an alert with the action URL
		if (notification.actionUrl) {
			Alert.alert("Navigate", `Would navigate to: ${notification.actionUrl}`);
		}
	};

	const handleMarkAllAsRead = async () => {
		try {
			await markAllAsReadMutation.mutateAsync();

			// Update local state
			setNotifications((prev) => prev.map((n) => ({ ...n, isRead: true })));

			// Refetch unread count
			unreadCountQuery.refetch();
		} catch (error) {
			Alert.alert("Error", "Failed to mark all notifications as read");
		}
	};

	const handleDeleteNotification = async (notificationId: string) => {
		try {
			await deleteNotificationMutation.mutateAsync({ notificationId });

			// Remove from local state
			setNotifications((prev) => prev.filter((n) => n._id !== notificationId));

			// Refetch unread count
			unreadCountQuery.refetch();
		} catch (error) {
			Alert.alert("Error", "Failed to delete notification");
		}
	};

	const loadMore = () => {
		if (hasMore && !notificationsQuery.isFetching) {
			setPage((prev) => prev + 1);
		}
	};

	const getNotificationIcon = (type: string) => {
		switch (type) {
			case "recipe_shared":
				return "share";
			case "recipe_comment":
			case "comment_reply":
				return "chatbubble";
			case "comment_helpful_vote":
				return "thumbs-up";
			case "recipe_rated":
				return "star";
			case "shared_recipe_viewed":
				return "eye";
			case "collaboration_invite":
			case "collaboration_accepted":
				return "people";
			case "recipe_tips_added":
				return "bulb";
			case "recipe_liked":
				return "heart";
			default:
				return "notifications";
		}
	};

	const getNotificationIconColor = (type: string) => {
		switch (type) {
			case "recipe_shared":
				return "#007AFF";
			case "recipe_comment":
			case "comment_reply":
				return "#34C759";
			case "comment_helpful_vote":
				return "#007AFF";
			case "recipe_rated":
				return "#FFD700";
			case "shared_recipe_viewed":
				return "#8E8E93";
			case "collaboration_invite":
			case "collaboration_accepted":
				return "#FF9500";
			case "recipe_tips_added":
				return "#FFCC00";
			case "recipe_liked":
				return "#FF3B30";
			default:
				return "#8E8E93";
		}
	};

	const formatTimeAgo = (dateString: string) => {
		const date = new Date(dateString);
		const now = new Date();
		const diffInMinutes = Math.floor(
			(now.getTime() - date.getTime()) / (1000 * 60),
		);

		if (diffInMinutes < 1) return "Just now";
		if (diffInMinutes < 60) return `${diffInMinutes}m ago`;

		const diffInHours = Math.floor(diffInMinutes / 60);
		if (diffInHours < 24) return `${diffInHours}h ago`;

		const diffInDays = Math.floor(diffInHours / 24);
		if (diffInDays < 7) return `${diffInDays}d ago`;

		return date.toLocaleDateString();
	};

	const renderNotification = ({
		item: notification,
	}: {
		item: Notification;
	}) => {
		return (
			<TouchableOpacity
				style={[
					styles.notificationItem,
					!notification.isRead && styles.unreadNotification,
				]}
				onPress={() => handleNotificationPress(notification)}
				onLongPress={() => {
					Alert.alert(
						"Delete Notification",
						"Are you sure you want to delete this notification?",
						[
							{ text: "Cancel", style: "cancel" },
							{
								text: "Delete",
								style: "destructive",
								onPress: () => handleDeleteNotification(notification._id),
							},
						],
					);
				}}
			>
				<View style={styles.notificationIcon}>
					<Ionicons
						name={getNotificationIcon(notification.type) as any}
						size={20}
						color={getNotificationIconColor(notification.type)}
					/>
				</View>

				<View style={styles.notificationContent}>
					<View style={styles.notificationHeader}>
						<Text style={styles.notificationTitle} numberOfLines={1}>
							{notification.title}
						</Text>
						<Text style={styles.notificationTime}>
							{formatTimeAgo(notification.createdAt)}
						</Text>
					</View>

					<Text style={styles.notificationMessage} numberOfLines={2}>
						{notification.message}
					</Text>

					{notification.fromUser && (
						<Text style={styles.notificationFromUser} numberOfLines={1}>
							From: {notification.fromUser.name}
						</Text>
					)}

					{notification.recipe && (
						<Text style={styles.notificationRecipe} numberOfLines={1}>
							Recipe: {notification.recipe.title}
						</Text>
					)}
				</View>

				{!notification.isRead && <View style={styles.unreadDot} />}
			</TouchableOpacity>
		);
	};

	return (
		<>
			<TouchableOpacity
				style={[styles.bellButton, style]}
				onPress={() => setShowNotifications(true)}
				activeOpacity={0.7}
			>
				<Ionicons name="notifications" size={24} color="#1C1C1E" />
				{unreadCountQuery.data && unreadCountQuery.data.count > 0 && (
					<View style={styles.badge}>
						<Text style={styles.badgeText}>
							{unreadCountQuery.data.count > 99
								? "99+"
								: unreadCountQuery.data.count}
						</Text>
					</View>
				)}
			</TouchableOpacity>

			<Modal
				visible={showNotifications}
				animationType="slide"
				presentationStyle="pageSheet"
				onRequestClose={() => setShowNotifications(false)}
			>
				<View style={styles.modalContainer}>
					{/* Header */}
					<View style={styles.modalHeader}>
						<TouchableOpacity onPress={() => setShowNotifications(false)}>
							<Text style={styles.closeButton}>Close</Text>
						</TouchableOpacity>
						<Text style={styles.modalTitle}>Notifications</Text>
						<TouchableOpacity onPress={handleMarkAllAsRead}>
							<Text style={styles.markAllButton}>Mark All Read</Text>
						</TouchableOpacity>
					</View>

					{/* Notifications List */}
					<FlatList
						data={notifications}
						renderItem={renderNotification}
						keyExtractor={(item) => item._id}
						showsVerticalScrollIndicator={false}
						onEndReached={loadMore}
						onEndReachedThreshold={0.5}
						refreshControl={
							<RefreshControl
								refreshing={notificationsQuery.isFetching && page === 1}
								onRefresh={() => {
									setPage(1);
									notificationsQuery.refetch();
								}}
							/>
						}
						ListEmptyComponent={
							<View style={styles.emptyState}>
								<Ionicons
									name="notifications-outline"
									size={48}
									color="#C7C7CC"
								/>
								<Text style={styles.emptyStateText}>No notifications</Text>
								<Text style={styles.emptyStateSubtext}>
									You're all caught up! Notifications will appear here.
								</Text>
							</View>
						}
					/>
				</View>
			</Modal>
		</>
	);
};

const styles = {
	bellButton: {
		position: "relative" as const,
		padding: 8,
	},
	badge: {
		position: "absolute" as const,
		top: 4,
		right: 4,
		backgroundColor: "#FF3B30",
		borderRadius: 10,
		minWidth: 20,
		height: 20,
		alignItems: "center" as const,
		justifyContent: "center" as const,
	},
	badgeText: {
		color: "white",
		fontSize: 12,
		fontWeight: "bold" as const,
	},
	modalContainer: {
		flex: 1,
		backgroundColor: "#fff",
	},
	modalHeader: {
		flexDirection: "row" as const,
		justifyContent: "space-between" as const,
		alignItems: "center" as const,
		paddingHorizontal: 20,
		paddingVertical: 16,
		borderBottomWidth: 1,
		borderBottomColor: "#E5E5E7",
	},
	closeButton: {
		color: "#666",
		fontSize: 16,
	},
	modalTitle: {
		fontSize: 18,
		fontWeight: "600" as const,
		color: "#1C1C1E",
	},
	markAllButton: {
		color: "#007AFF",
		fontSize: 16,
	},
	notificationItem: {
		flexDirection: "row" as const,
		padding: 16,
		borderBottomWidth: 1,
		borderBottomColor: "#E5E5E7",
		backgroundColor: "#fff",
	},
	unreadNotification: {
		backgroundColor: "#F8F9FA",
	},
	notificationIcon: {
		width: 40,
		height: 40,
		borderRadius: 20,
		backgroundColor: "#F2F2F7",
		alignItems: "center" as const,
		justifyContent: "center" as const,
		marginRight: 12,
	},
	notificationContent: {
		flex: 1,
	},
	notificationHeader: {
		flexDirection: "row" as const,
		justifyContent: "space-between" as const,
		alignItems: "flex-start" as const,
		marginBottom: 4,
	},
	notificationTitle: {
		fontSize: 16,
		fontWeight: "600" as const,
		color: "#1C1C1E",
		flex: 1,
		marginRight: 8,
	},
	notificationTime: {
		fontSize: 12,
		color: "#8E8E93",
	},
	notificationMessage: {
		fontSize: 14,
		color: "#666",
		lineHeight: 20,
		marginBottom: 4,
	},
	notificationFromUser: {
		fontSize: 12,
		color: "#007AFF",
		marginBottom: 2,
	},
	notificationRecipe: {
		fontSize: 12,
		color: "#8E8E93",
		fontStyle: "italic" as const,
	},
	unreadDot: {
		width: 8,
		height: 8,
		borderRadius: 4,
		backgroundColor: "#007AFF",
		marginLeft: 8,
		marginTop: 8,
	},
	emptyState: {
		alignItems: "center" as const,
		justifyContent: "center" as const,
		paddingVertical: 80,
		paddingHorizontal: 40,
	},
	emptyStateText: {
		fontSize: 18,
		fontWeight: "600" as const,
		color: "#8E8E93",
		marginTop: 16,
		textAlign: "center" as const,
	},
	emptyStateSubtext: {
		fontSize: 14,
		color: "#8E8E93",
		textAlign: "center" as const,
		marginTop: 8,
		lineHeight: 20,
	},
};
