import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import type React from "react";
import { Alert, Image, Text, TouchableOpacity, View } from "react-native";

interface MealPlanCardProps {
	mealPlan: {
		_id: string;
		title: string;
		description?: string;
		planType: "weekly" | "monthly" | "custom";
		status: "draft" | "active" | "completed" | "paused" | "archived";
		startDate: string;
		endDate: string;
		analytics: {
			completionRate: number;
			totalMealsPlanned: number;
			totalMealsCompleted: number;
		};
		dailyPlans: any[];
		isTemplate?: boolean;
		templateCategory?: string;
	};
	onPress: () => void;
	onMenuPress?: () => void;
	onShare?: () => void;
	onDuplicate?: () => void;
	onDelete?: () => void;
	showMenu?: boolean;
}

export const MealPlanCard: React.FC<MealPlanCardProps> = ({
	mealPlan,
	onPress,
	onMenuPress,
	onShare,
	onDuplicate,
	onDelete,
	showMenu = true,
}) => {
	const getStatusColor = (status: string) => {
		switch (status) {
			case "active":
				return "#34C759";
			case "completed":
				return "#007AFF";
			case "paused":
				return "#FF9500";
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
			case "active":
				return "play-circle";
			case "completed":
				return "checkmark-circle";
			case "paused":
				return "pause-circle";
			case "draft":
				return "document-text-outline";
			case "archived":
				return "archive-outline";
			default:
				return "document-outline";
		}
	};

	const formatDateRange = (startDate: string, endDate: string) => {
		const start = new Date(startDate);
		const end = new Date(endDate);

		const formatOptions: Intl.DateTimeFormatOptions = {
			month: "short",
			day: "numeric",
		};

		const startFormatted = start.toLocaleDateString("en-US", formatOptions);
		const endFormatted = end.toLocaleDateString("en-US", formatOptions);

		return `${startFormatted} - ${endFormatted}`;
	};

	const getDaysRemaining = () => {
		const today = new Date();
		const endDate = new Date(mealPlan.endDate);
		const diffTime = endDate.getTime() - today.getTime();
		const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

		if (diffDays < 0) return "Ended";
		if (diffDays === 0) return "Today";
		if (diffDays === 1) return "1 day left";
		return `${diffDays} days left`;
	};

	const getUpcomingMeals = () => {
		const today = new Date().toISOString().slice(0, 10);
		const todayPlan = mealPlan.dailyPlans?.find(
			(plan) => plan.date.substring(0, 10) === today,
		);

		if (!todayPlan) return [];

		const meals = [];
		const mealTypes = ["breakfast", "lunch", "dinner"];

		mealTypes.forEach((type) => {
			const meal = todayPlan.meals[type];
			if (meal && (meal.recipeId || meal.customMeal) && !meal.completed) {
				meals.push({
					type: type.charAt(0).toUpperCase() + type.slice(1),
					name: meal.recipeId?.title || meal.customMeal?.name || "Planned Meal",
				});
			}
		});

		return meals.slice(0, 2); // Show max 2 upcoming meals
	};

	const handleMenuPress = () => {
		Alert.alert("Meal Plan Options", "", [
			{ text: "Share", onPress: onShare },
			{ text: "Duplicate", onPress: onDuplicate },
			{ text: "Delete", style: "destructive", onPress: onDelete },
			{ text: "Cancel", style: "cancel" },
		]);
	};

	const upcomingMeals = getUpcomingMeals();
	const statusColor = getStatusColor(mealPlan.status);
	const statusIcon = getStatusIcon(mealPlan.status);

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
			<LinearGradient
				colors={
					mealPlan.isTemplate ? ["#6366F1", "#8B5CF6"] : ["#3B82F6", "#1D4ED8"]
				}
				className="p-4"
			>
				<View className="flex-row justify-between items-start">
					<View className="flex-1 mr-3">
						<View className="flex-row items-center mb-2">
							<Ionicons name={statusIcon as any} size={16} color="white" />
							<Text className="text-white text-xs font-medium ml-2 uppercase tracking-wide">
								{mealPlan.isTemplate
									? mealPlan.templateCategory || "Template"
									: mealPlan.status}
							</Text>
						</View>

						<Text className="text-white text-xl font-bold mb-1">
							{mealPlan.title}
						</Text>

						{mealPlan.description && (
							<Text className="text-white/80 text-sm" numberOfLines={2}>
								{mealPlan.description}
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
				{/* Date and duration info */}
				<View className="flex-row justify-between items-center mb-3">
					<View className="flex-row items-center">
						<Ionicons name="calendar-outline" size={16} color="#6B7280" />
						<Text className="text-gray-600 text-sm ml-2">
							{formatDateRange(mealPlan.startDate, mealPlan.endDate)}
						</Text>
					</View>

					<View className="flex-row items-center">
						<Ionicons name="time-outline" size={16} color="#6B7280" />
						<Text className="text-gray-600 text-sm ml-2">
							{getDaysRemaining()}
						</Text>
					</View>
				</View>

				{/* Progress bar */}
				<View className="mb-4">
					<View className="flex-row justify-between items-center mb-2">
						<Text className="text-sm font-medium text-gray-800">Progress</Text>
						<Text className="text-sm text-gray-600">
							{mealPlan.analytics.totalMealsCompleted}/
							{mealPlan.analytics.totalMealsPlanned} meals
						</Text>
					</View>

					<View className="h-2 bg-gray-200 rounded-full overflow-hidden">
						<View
							className="h-full rounded-full"
							style={{
								width: `${mealPlan.analytics.completionRate || 0}%`,
								backgroundColor: statusColor,
							}}
						/>
					</View>

					<Text className="text-xs text-gray-500 mt-1">
						{Math.round(mealPlan.analytics.completionRate || 0)}% complete
					</Text>
				</View>

				{/* Upcoming meals */}
				{upcomingMeals.length > 0 && (
					<View>
						<Text className="text-sm font-medium text-gray-800 mb-2">
							Today's Meals
						</Text>
						{upcomingMeals.map((meal, index) => (
							<View key={index} className="flex-row items-center mb-1">
								<View
									className="w-2 h-2 rounded-full mr-2"
									style={{ backgroundColor: statusColor }}
								/>
								<Text className="text-sm text-gray-600">
									<Text className="font-medium">{meal.type}:</Text> {meal.name}
								</Text>
							</View>
						))}
					</View>
				)}

				{/* Plan type and template info */}
				<View className="flex-row justify-between items-center mt-3 pt-3 border-t border-gray-100">
					<View className="flex-row items-center">
						<Ionicons
							name={
								mealPlan.planType === "weekly"
									? "calendar"
									: mealPlan.planType === "monthly"
										? "calendar"
										: "calendar-outline"
							}
							size={14}
							color="#9CA3AF"
						/>
						<Text className="text-gray-500 text-xs ml-1 capitalize">
							{mealPlan.planType} Plan
						</Text>
					</View>

					{mealPlan.isTemplate && (
						<View className="flex-row items-center">
							<Ionicons name="copy-outline" size={14} color="#8B5CF6" />
							<Text className="text-purple-600 text-xs ml-1 font-medium">
								Template
							</Text>
						</View>
					)}
				</View>
			</View>
		</TouchableOpacity>
	);
};

// Compact version for lists
export const MealPlanCardCompact: React.FC<MealPlanCardProps> = ({
	mealPlan,
	onPress,
	onMenuPress,
	showMenu = false,
}) => {
	const statusColor = getStatusColor(mealPlan.status);
	const statusIcon = getStatusIcon(mealPlan.status);

	const getStatusColor = (status: string) => {
		switch (status) {
			case "active":
				return "#34C759";
			case "completed":
				return "#007AFF";
			case "paused":
				return "#FF9500";
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
			case "active":
				return "play-circle";
			case "completed":
				return "checkmark-circle";
			case "paused":
				return "pause-circle";
			case "draft":
				return "document-text-outline";
			case "archived":
				return "archive-outline";
			default:
				return "document-outline";
		}
	};

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
						{mealPlan.title}
					</Text>
					<Text className="text-xs text-gray-500 uppercase tracking-wide">
						{mealPlan.status}
					</Text>
				</View>

				<Text className="text-sm text-gray-600 mb-2" numberOfLines={1}>
					{new Date(mealPlan.startDate).toLocaleDateString("en-US", {
						month: "short",
						day: "numeric",
					})}{" "}
					-{" "}
					{new Date(mealPlan.endDate).toLocaleDateString("en-US", {
						month: "short",
						day: "numeric",
					})}
				</Text>

				{/* Progress bar */}
				<View className="flex-row items-center">
					<View className="flex-1 h-1.5 bg-gray-200 rounded-full overflow-hidden mr-2">
						<View
							className="h-full rounded-full"
							style={{
								width: `${mealPlan.analytics.completionRate || 0}%`,
								backgroundColor: statusColor,
							}}
						/>
					</View>
					<Text className="text-xs text-gray-500">
						{Math.round(mealPlan.analytics.completionRate || 0)}%
					</Text>
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
