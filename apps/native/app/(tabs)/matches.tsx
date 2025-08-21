import { Ionicons } from "@expo/vector-icons";
import { useCallback, useEffect, useState } from "react";
import {
	ActivityIndicator,
	Image,
	RefreshControl,
	ScrollView,
	Text,
	TouchableOpacity,
	View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { trpc } from "../../utils/trpc";

interface Match {
	_id: string;
	recipeId: {
		_id: string;
		title: string;
		imageUrl: string;
		cookTime: number;
		difficulty: string;
		cuisine: string;
	};
	status: string;
	matchedAt: string;
	cookDate?: string;
	ratings?: Array<{ userId: string; rating: number }>;
}

export default function MatchesScreen() {
	const [refreshing, setRefreshing] = useState(false);
	const [newMatchAlert, setNewMatchAlert] = useState(false);

	// Fetch matches query
	const { data, isLoading, refetch } = trpc.recipe.getMatches.useQuery({
		status: "matched",
		limit: 20,
		offset: 0,
	});

	// TODO: Re-enable WebSocket subscription when server is properly configured
	// For now, using polling as a fallback for real-time updates

	// Auto-refresh matches periodically as a fallback for real-time updates
	useEffect(() => {
		// Refresh every 30 seconds
		const interval = setInterval(() => {
			refetch();
		}, 30000);

		return () => clearInterval(interval);
	}, [refetch]);

	const onRefresh = useCallback(async () => {
		setRefreshing(true);
		await refetch();
		setRefreshing(false);
	}, [refetch]);

	const handleMatchPress = (match: Match) => {
		// Navigate to match detail screen
		// This will be implemented when navigation is set up
		console.log("Match pressed:", match._id);
	};

	const formatDate = (dateString: string) => {
		const date = new Date(dateString);
		const now = new Date();
		const diffTime = Math.abs(now.getTime() - date.getTime());
		const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

		if (diffDays === 0) return "Today";
		if (diffDays === 1) return "Yesterday";
		if (diffDays < 7) return `${diffDays} days ago`;
		return date.toLocaleDateString();
	};

	if (isLoading) {
		return (
			<SafeAreaView className="flex-1 bg-gray-50">
				<View className="flex-1 items-center justify-center">
					<ActivityIndicator size="large" color="#FF6B6B" />
					<Text className="text-gray-600 mt-2">Loading matches...</Text>
				</View>
			</SafeAreaView>
		);
	}

	return (
		<SafeAreaView className="flex-1 bg-gray-50">
			{/* New Match Alert */}
			{newMatchAlert && (
				<View className="absolute top-10 left-4 right-4 bg-green-500 rounded-lg p-3 z-50">
					<Text className="text-white text-center font-semibold">
						🎉 New Match! You both liked a recipe!
					</Text>
				</View>
			)}

			<ScrollView
				className="flex-1"
				refreshControl={
					<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
				}
			>
				<View className="p-4">
					<Text className="text-2xl font-bold text-gray-800 mb-4">
						Your Matches 💕
					</Text>

					{data?.matches && data.matches.length > 0 ? (
						<>
							<Text className="text-gray-600 mb-4">
								{data.total} {data.total === 1 ? "recipe" : "recipes"} you both
								love
							</Text>

							{data.matches.map((match: Match) => (
								<TouchableOpacity
									key={match._id}
									onPress={() => handleMatchPress(match)}
									className="bg-white rounded-xl mb-3 shadow-sm overflow-hidden"
								>
									<View className="flex-row">
										<Image
											source={{ uri: match.recipeId.imageUrl }}
											className="w-24 h-24"
										/>
										<View className="flex-1 p-3">
											<Text className="text-lg font-semibold text-gray-800">
												{match.recipeId.title}
											</Text>
											<View className="flex-row items-center mt-1">
												<Ionicons
													name="time-outline"
													size={14}
													color="#6B7280"
												/>
												<Text className="text-gray-600 text-sm ml-1">
													{match.recipeId.cookTime} min
												</Text>
												<Text className="text-gray-400 mx-2">•</Text>
												<Text className="text-gray-600 text-sm">
													{match.recipeId.difficulty}
												</Text>
											</View>
											<Text className="text-gray-500 text-xs mt-2">
												Matched {formatDate(match.matchedAt)}
											</Text>
										</View>
										<View className="p-3">
											<Ionicons
												name="chevron-forward"
												size={20}
												color="#9CA3AF"
											/>
										</View>
									</View>

									{match.status === "scheduled" && match.cookDate && (
										<View className="bg-blue-50 px-3 py-2 border-t border-gray-100">
											<Text className="text-blue-600 text-sm">
												<Ionicons name="calendar" size={14} /> Scheduled for{" "}
												{formatDate(match.cookDate)}
											</Text>
										</View>
									)}

									{match.status === "cooked" && (
										<View className="bg-green-50 px-3 py-2 border-t border-gray-100">
											<Text className="text-green-600 text-sm">
												<Ionicons name="checkmark-circle" size={14} /> Cooked!
											</Text>
										</View>
									)}
								</TouchableOpacity>
							))}

							{data.hasMore && (
								<TouchableOpacity className="mt-4 py-3">
									<Text className="text-center text-blue-600 font-semibold">
										Load More
									</Text>
								</TouchableOpacity>
							)}
						</>
					) : (
						<>
							<View className="bg-white rounded-xl p-4 mb-3 shadow-sm">
								<Text className="text-lg font-semibold text-gray-800">
									No matches yet
								</Text>
								<Text className="text-gray-600 mt-1">
									Start swiping to find recipes you and your partner both love!
								</Text>
							</View>

							<Text className="text-gray-500 text-center mt-8">
								When you and your partner both like the same recipe, it will
								appear here
							</Text>
						</>
					)}
				</View>
			</ScrollView>
		</SafeAreaView>
	);
}
