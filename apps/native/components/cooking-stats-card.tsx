import { Ionicons } from "@expo/vector-icons";
import { Pressable, Text, View } from "react-native";

interface CookingStats {
	totalCookingSessions: number;
	uniqueRecipesCount: number;
	avgRating: number;
	totalTimeSpent: number;
	recentSessions: number;
}

interface MostCookedRecipe {
	recipeId: string;
	cookCount: number;
	lastCooked: string;
	avgRating: number;
	totalTimeSpent: number;
	recipe: {
		title: string;
		image_url: string;
		cook_time: number;
		difficulty: string;
		cuisine: string[];
	};
}

interface CookingStatsCardProps {
	stats: CookingStats;
	mostCookedRecipes: MostCookedRecipe[];
	currentStreak: number;
	onViewDetails?: () => void;
	onViewMostCooked?: () => void;
}

export function CookingStatsCard({
	stats,
	mostCookedRecipes,
	currentStreak,
	onViewDetails,
	onViewMostCooked,
}: CookingStatsCardProps) {
	const formatTime = (minutes: number) => {
		if (minutes < 60) return `${minutes}m`;
		const hours = Math.floor(minutes / 60);
		const remainingMinutes = minutes % 60;
		return remainingMinutes > 0
			? `${hours}h ${remainingMinutes}m`
			: `${hours}h`;
	};

	const formatDate = (dateString: string) => {
		return new Date(dateString).toLocaleDateString("en-US", {
			month: "short",
			day: "numeric",
		});
	};

	return (
		<View className="bg-white rounded-lg shadow-sm border border-gray-100 p-4 mb-4">
			{/* Header */}
			<View className="flex-row items-center justify-between mb-4">
				<View className="flex-row items-center">
					<View className="bg-blue-100 rounded-full p-2 mr-3">
						<Ionicons name="stats-chart" size={20} color="#3b82f6" />
					</View>
					<Text className="text-lg font-semibold text-gray-900">
						Cooking Stats
					</Text>
				</View>
				{onViewDetails && (
					<Pressable onPress={onViewDetails}>
						<Text className="text-blue-600 text-sm font-medium">View All</Text>
					</Pressable>
				)}
			</View>

			{/* Main Stats Grid */}
			<View className="flex-row flex-wrap -mx-2 mb-4">
				{/* Total Sessions */}
				<View className="w-1/2 px-2 mb-3">
					<View className="bg-gray-50 rounded-lg p-3">
						<View className="flex-row items-center mb-1">
							<Ionicons name="restaurant" size={16} color="#6b7280" />
							<Text className="ml-1 text-xs text-gray-600 uppercase tracking-wide">
								Total Sessions
							</Text>
						</View>
						<Text className="text-xl font-bold text-gray-900">
							{stats.totalCookingSessions}
						</Text>
					</View>
				</View>

				{/* Unique Recipes */}
				<View className="w-1/2 px-2 mb-3">
					<View className="bg-gray-50 rounded-lg p-3">
						<View className="flex-row items-center mb-1">
							<Ionicons name="book" size={16} color="#6b7280" />
							<Text className="ml-1 text-xs text-gray-600 uppercase tracking-wide">
								Unique Recipes
							</Text>
						</View>
						<Text className="text-xl font-bold text-gray-900">
							{stats.uniqueRecipesCount}
						</Text>
					</View>
				</View>

				{/* Average Rating */}
				<View className="w-1/2 px-2 mb-3">
					<View className="bg-gray-50 rounded-lg p-3">
						<View className="flex-row items-center mb-1">
							<Ionicons name="star" size={16} color="#fbbf24" />
							<Text className="ml-1 text-xs text-gray-600 uppercase tracking-wide">
								Avg Rating
							</Text>
						</View>
						<Text className="text-xl font-bold text-gray-900">
							{stats.avgRating > 0 ? stats.avgRating.toFixed(1) : "—"}
						</Text>
					</View>
				</View>

				{/* Current Streak */}
				<View className="w-1/2 px-2 mb-3">
					<View className="bg-gray-50 rounded-lg p-3">
						<View className="flex-row items-center mb-1">
							<Ionicons name="flame" size={16} color="#ef4444" />
							<Text className="ml-1 text-xs text-gray-600 uppercase tracking-wide">
								Streak
							</Text>
						</View>
						<Text className="text-xl font-bold text-gray-900">
							{currentStreak} {currentStreak === 1 ? "day" : "days"}
						</Text>
					</View>
				</View>
			</View>

			{/* Additional Stats Row */}
			<View className="flex-row justify-between items-center py-3 border-t border-gray-100">
				<View className="flex-1 items-center">
					<Text className="text-sm text-gray-600">Time Spent</Text>
					<Text className="font-semibold text-gray-900">
						{formatTime(stats.totalTimeSpent)}
					</Text>
				</View>
				<View className="w-px h-8 bg-gray-200 mx-4" />
				<View className="flex-1 items-center">
					<Text className="text-sm text-gray-600">This Week</Text>
					<Text className="font-semibold text-gray-900">
						{stats.recentSessions}{" "}
						{stats.recentSessions === 1 ? "session" : "sessions"}
					</Text>
				</View>
			</View>

			{/* Most Cooked Recipes */}
			{mostCookedRecipes.length > 0 && (
				<View className="mt-4 pt-4 border-t border-gray-100">
					<View className="flex-row items-center justify-between mb-3">
						<Text className="font-medium text-gray-900">Most Cooked</Text>
						{onViewMostCooked && mostCookedRecipes.length > 2 && (
							<Pressable onPress={onViewMostCooked}>
								<Text className="text-blue-600 text-sm">View All</Text>
							</Pressable>
						)}
					</View>

					<View className="space-y-2">
						{mostCookedRecipes.slice(0, 3).map((recipe, index) => (
							<View
								key={recipe.recipeId}
								className="flex-row items-center justify-between"
							>
								<View className="flex-1">
									<Text className="font-medium text-gray-900" numberOfLines={1}>
										{recipe.recipe.title}
									</Text>
									<View className="flex-row items-center mt-1">
										<Text className="text-sm text-gray-600">
											{recipe.cookCount}x cooked
										</Text>
										<Text className="text-gray-400 mx-2">•</Text>
										<Text className="text-sm text-gray-600">
											Last: {formatDate(recipe.lastCooked)}
										</Text>
									</View>
								</View>

								{recipe.avgRating > 0 && (
									<View className="flex-row items-center ml-2">
										<Ionicons name="star" size={14} color="#fbbf24" />
										<Text className="ml-1 text-sm text-gray-600">
											{recipe.avgRating.toFixed(1)}
										</Text>
									</View>
								)}
							</View>
						))}
					</View>
				</View>
			)}
		</View>
	);
}
