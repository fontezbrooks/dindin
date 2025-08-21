import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import type React from "react";
import { Alert, Text, TouchableOpacity, View } from "react-native";

interface ShoppingListCardProps {
	shoppingList: {
		_id: string;
		title: string;
		description?: string;
		status: "draft" | "ready" | "in-progress" | "completed" | "archived";
		items: Array<{
			name: string;
			quantity: string;
			category: string;
			isPurchased: boolean;
			estimatedPrice?: number;
		}>;
		budget?: {
			planned?: number;
			actual?: number;
		};
		scheduledShoppingDate?: string;
		dateRange: {
			startDate: string;
			endDate: string;
		};
		analytics?: {
			completionRate: number;
		};
	};
	onPress: () => void;
	onMenuPress?: () => void;
	onShare?: () => void;
	onDuplicate?: () => void;
	onDelete?: () => void;
	showMenu?: boolean;
}

export const ShoppingListCard: React.FC<ShoppingListCardProps> = ({
	shoppingList,
	onPress,
	onMenuPress,
	onShare,
	onDuplicate,
	onDelete,
	showMenu = true,
}) => {
	const getStatusColor = (status: string) => {
		switch (status) {
			case "ready":
				return "#34C759";
			case "in-progress":
				return "#FF9500";
			case "completed":
				return "#007AFF";
			case "draft":
				return "#8E8E93";
			case "archived":
				return "#636366";
			default:
				return "#8E8E93";
		}
	};

	const getStatusIcon = (status: string) => {
		switch (status) {
			case "ready":
				return "checkmark-circle-outline";
			case "in-progress":
				return "time-outline";
			case "completed":
				return "checkmark-circle";
			case "draft":
				return "document-outline";
			case "archived":
				return "archive-outline";
			default:
				return "list-outline";
		}
	};

	const getCompletionStats = () => {
		const totalItems = shoppingList.items.length;
		const purchasedItems = shoppingList.items.filter(
			(item) => item.isPurchased,
		).length;
		const completionRate =
			totalItems > 0 ? Math.round((purchasedItems / totalItems) * 100) : 0;

		return { totalItems, purchasedItems, completionRate };
	};

	const getBudgetInfo = () => {
		const planned = shoppingList.budget?.planned || 0;
		const actual = shoppingList.budget?.actual || 0;
		const estimatedTotal = shoppingList.items.reduce(
			(sum, item) => sum + (item.estimatedPrice || 0),
			0,
		);

		return { planned, actual, estimatedTotal };
	};

	const formatDate = (dateString: string) => {
		const date = new Date(dateString);
		return date.toLocaleDateString("en-US", {
			month: "short",
			day: "numeric",
			year:
				date.getFullYear() !== new Date().getFullYear() ? "numeric" : undefined,
		});
	};

	const getDaysUntilShopping = () => {
		if (!shoppingList.scheduledShoppingDate) return null;

		const today = new Date();
		const shoppingDate = new Date(shoppingList.scheduledShoppingDate);
		const diffTime = shoppingDate.getTime() - today.getTime();
		const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

		if (diffDays < 0) return "Overdue";
		if (diffDays === 0) return "Today";
		if (diffDays === 1) return "Tomorrow";
		return `in ${diffDays} days`;
	};

	const handleMenuPress = () => {
		Alert.alert("Shopping List Options", "", [
			{ text: "Share", onPress: onShare },
			{ text: "Duplicate", onPress: onDuplicate },
			{ text: "Delete", style: "destructive", onPress: onDelete },
			{ text: "Cancel", style: "cancel" },
		]);
	};

	const { totalItems, purchasedItems, completionRate } = getCompletionStats();
	const { planned, actual, estimatedTotal } = getBudgetInfo();
	const statusColor = getStatusColor(shoppingList.status);
	const statusIcon = getStatusIcon(shoppingList.status);
	const daysUntilShopping = getDaysUntilShopping();

	return (
		<TouchableOpacity
			className="mx-4 mb-4 rounded-2xl overflow-hidden bg-white shadow-lg"
			style={{
				shadowColor: "#000",
				shadowOffset: { width: 0, height: 4 },
				shadowOpacity: 0.1,
				shadowRadius: 8,
				elevation: 5,
			}}
			onPress={onPress}
		>
			{/* Header with gradient */}
			<LinearGradient colors={["#10B981", "#059669"]} className="p-4">
				<View className="flex-row justify-between items-start">
					<View className="flex-1 mr-3">
						<View className="flex-row items-center mb-2">
							<Ionicons name={statusIcon as any} size={16} color="white" />
							<Text className="text-white text-xs font-medium ml-2 uppercase tracking-wide">
								{shoppingList.status}
							</Text>
						</View>

						<Text className="text-white text-xl font-bold mb-1">
							{shoppingList.title}
						</Text>

						{shoppingList.description && (
							<Text className="text-white/80 text-sm" numberOfLines={2}>
								{shoppingList.description}
							</Text>
						)}
					</View>

					{showMenu && onMenuPress && (
						<TouchableOpacity
							className="p-2 rounded-full bg-white/20"
							onPress={handleMenuPress}
						>
							<Ionicons name="ellipsis-horizontal" size={20} color="white" />
						</TouchableOpacity>
					)}
				</View>
			</LinearGradient>

			{/* Content */}
			<View className="p-4">
				{/* Stats row */}
				<View className="flex-row justify-between items-center mb-4">
					<View className="flex-row items-center">
						<Ionicons name="list-outline" size={16} color="#6B7280" />
						<Text className="text-gray-600 text-sm ml-2">
							{totalItems} items
						</Text>
					</View>

					{daysUntilShopping && (
						<View className="flex-row items-center">
							<Ionicons name="calendar-outline" size={16} color="#6B7280" />
							<Text className="text-gray-600 text-sm ml-2">
								{daysUntilShopping}
							</Text>
						</View>
					)}

					{planned > 0 && (
						<View className="flex-row items-center">
							<Ionicons name="wallet-outline" size={16} color="#6B7280" />
							<Text className="text-gray-600 text-sm ml-2">
								${planned.toFixed(0)}
							</Text>
						</View>
					)}
				</View>

				{/* Progress */}
				<View className="mb-4">
					<View className="flex-row justify-between items-center mb-2">
						<Text className="text-sm font-medium text-gray-800">
							Shopping Progress
						</Text>
						<Text className="text-sm text-gray-600">
							{purchasedItems}/{totalItems}
						</Text>
					</View>

					<View className="h-2 bg-gray-200 rounded-full overflow-hidden">
						<View
							className="h-full rounded-full"
							style={{
								width: `${completionRate}%`,
								backgroundColor: statusColor,
							}}
						/>
					</View>

					<Text className="text-xs text-gray-500 mt-1">
						{completionRate}% complete
					</Text>
				</View>

				{/* Categories preview */}
				{totalItems > 0 && (
					<View className="mb-3">
						<Text className="text-sm font-medium text-gray-800 mb-2">
							Categories
						</Text>
						<View className="flex-row flex-wrap">
							{getTopCategories(shoppingList.items).map((category, index) => (
								<View
									key={category.name}
									className="flex-row items-center mr-3 mb-1"
								>
									<View
										className="w-2 h-2 rounded-full mr-1"
										style={{ backgroundColor: getCategoryColor(category.name) }}
									/>
									<Text className="text-xs text-gray-600">
										{category.name} ({category.count})
									</Text>
								</View>
							))}
						</View>
					</View>
				)}

				{/* Budget info */}
				{(planned > 0 || actual > 0 || estimatedTotal > 0) && (
					<View className="pt-3 border-t border-gray-100">
						<View className="flex-row justify-between">
							{estimatedTotal > 0 && (
								<View>
									<Text className="text-xs text-gray-500">Estimated</Text>
									<Text className="text-sm font-medium text-gray-800">
										${estimatedTotal.toFixed(2)}
									</Text>
								</View>
							)}

							{actual > 0 && (
								<View>
									<Text className="text-xs text-gray-500">Spent</Text>
									<Text className="text-sm font-medium text-gray-800">
										${actual.toFixed(2)}
									</Text>
								</View>
							)}

							{planned > 0 && actual > 0 && (
								<View>
									<Text className="text-xs text-gray-500">
										{actual > planned ? "Over" : "Under"} Budget
									</Text>
									<Text
										className={`text-sm font-medium ${
											actual > planned ? "text-red-600" : "text-green-600"
										}`}
									>
										${Math.abs(actual - planned).toFixed(2)}
									</Text>
								</View>
							)}
						</View>
					</View>
				)}
			</View>
		</TouchableOpacity>
	);
};

// Compact version for lists
export const ShoppingListCardCompact: React.FC<ShoppingListCardProps> = ({
	shoppingList,
	onPress,
	onMenuPress,
	showMenu = false,
}) => {
	const { totalItems, purchasedItems, completionRate } = getCompletionStats();
	const statusColor = getStatusColor(shoppingList.status);
	const statusIcon = getStatusIcon(shoppingList.status);

	function getCompletionStats() {
		const totalItems = shoppingList.items.length;
		const purchasedItems = shoppingList.items.filter(
			(item) => item.isPurchased,
		).length;
		const completionRate =
			totalItems > 0 ? Math.round((purchasedItems / totalItems) * 100) : 0;
		return { totalItems, purchasedItems, completionRate };
	}

	function getStatusColor(status: string) {
		switch (status) {
			case "ready":
				return "#34C759";
			case "in-progress":
				return "#FF9500";
			case "completed":
				return "#007AFF";
			case "draft":
				return "#8E8E93";
			case "archived":
				return "#636366";
			default:
				return "#8E8E93";
		}
	}

	function getStatusIcon(status: string) {
		switch (status) {
			case "ready":
				return "checkmark-circle-outline";
			case "in-progress":
				return "time-outline";
			case "completed":
				return "checkmark-circle";
			case "draft":
				return "document-outline";
			case "archived":
				return "archive-outline";
			default:
				return "list-outline";
		}
	}

	return (
		<TouchableOpacity
			className="flex-row items-center p-4 bg-white border-b border-gray-100"
			onPress={onPress}
		>
			{/* Status indicator */}
			<View className="mr-3">
				<Ionicons name={statusIcon as any} size={24} color={statusColor} />
			</View>

			{/* Content */}
			<View className="flex-1">
				<View className="flex-row items-center justify-between mb-1">
					<Text
						className="text-base font-semibold text-gray-800"
						numberOfLines={1}
					>
						{shoppingList.title}
					</Text>
					<Text className="text-xs text-gray-500 uppercase tracking-wide">
						{shoppingList.status}
					</Text>
				</View>

				<Text className="text-sm text-gray-600 mb-2">
					{totalItems} items • {purchasedItems} purchased
				</Text>

				{/* Progress bar */}
				<View className="flex-row items-center">
					<View className="flex-1 h-1.5 bg-gray-200 rounded-full overflow-hidden mr-2">
						<View
							className="h-full rounded-full"
							style={{
								width: `${completionRate}%`,
								backgroundColor: statusColor,
							}}
						/>
					</View>
					<Text className="text-xs text-gray-500">{completionRate}%</Text>
				</View>
			</View>

			{showMenu && onMenuPress && (
				<TouchableOpacity className="ml-3 p-2" onPress={onMenuPress}>
					<Ionicons name="chevron-forward" size={20} color="#9CA3AF" />
				</TouchableOpacity>
			)}
		</TouchableOpacity>
	);
};

// Helper functions
const getTopCategories = (items: any[]) => {
	const categoryCount = items.reduce(
		(acc, item) => {
			acc[item.category] = (acc[item.category] || 0) + 1;
			return acc;
		},
		{} as Record<string, number>,
	);

	return Object.entries(categoryCount)
		.sort(([, a], [, b]) => b - a)
		.slice(0, 3)
		.map(([name, count]) => ({ name, count }));
};

const getCategoryColor = (category: string): string => {
	const colors: Record<string, string> = {
		produce: "#34C759",
		"meat-seafood": "#FF3B30",
		"dairy-eggs": "#FF9500",
		pantry: "#8E4EC6",
		"spices-seasonings": "#AF52DE",
		frozen: "#5AC8FA",
		bakery: "#FFCC02",
		beverages: "#007AFF",
		snacks: "#FF6B6B",
		household: "#8E8E93",
		other: "#636366",
	};

	return colors[category] || "#636366";
};
