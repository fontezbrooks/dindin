import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { useCallback, useEffect, useState } from "react";
import {
	Alert,
	Modal,
	Pressable,
	RefreshControl,
	SafeAreaView,
	ScrollView,
	Switch,
	Text,
	TextInput,
	View,
} from "react-native";
import { CookingStatsCard } from "../../components/cooking-stats-card";
import { RecentlyCookedList } from "../../components/recently-cooked-list";
import { trpc } from "../../utils/trpc";

interface FilterOptions {
	dateFrom?: Date;
	dateTo?: Date;
	minRating?: number;
	includePartner: boolean;
	sortBy: "recent" | "rating" | "cookCount";
}

export default function CookingHistoryScreen() {
	const router = useRouter();
	const [refreshing, setRefreshing] = useState(false);
	const [showFilters, setShowFilters] = useState(false);
	const [filters, setFilters] = useState<FilterOptions>({
		includePartner: false,
		sortBy: "recent",
	});

	// tRPC queries
	const {
		data: recentlyCooked,
		isLoading: isLoadingRecent,
		refetch: refetchRecent,
		fetchNextPage,
		hasNextPage,
	} = trpc.cookedRecipes.getRecentlyCooked.useInfiniteQuery(
		{
			limit: 20,
			...filters,
			dateFrom: filters.dateFrom?.toISOString(),
			dateTo: filters.dateTo?.toISOString(),
		},
		{
			getNextPageParam: (lastPage) =>
				lastPage.hasMore ? lastPage.offset + lastPage.limit : undefined,
		},
	);

	const {
		data: cookingStats,
		isLoading: isLoadingStats,
		refetch: refetchStats,
	} = trpc.cookedRecipes.getCookingStats.useQuery();

	// Mutations
	const updateSessionMutation =
		trpc.cookedRecipes.updateCookingSession.useMutation({
			onSuccess: () => {
				refetchRecent();
				refetchStats();
			},
		});

	const deleteSessionMutation =
		trpc.cookedRecipes.deleteCookingSession.useMutation({
			onSuccess: () => {
				refetchRecent();
				refetchStats();
			},
		});

	// Flatten infinite query data
	const allCookedRecipes =
		recentlyCooked?.pages.flatMap((page) => page.cookedRecipes) || [];
	const total = recentlyCooked?.pages[0]?.total || 0;

	const handleRefresh = useCallback(async () => {
		setRefreshing(true);
		await Promise.all([refetchRecent(), refetchStats()]);
		setRefreshing(false);
	}, [refetchRecent, refetchStats]);

	const handleLoadMore = useCallback(async () => {
		if (hasNextPage && !isLoadingRecent) {
			await fetchNextPage();
		}
	}, [fetchNextPage, hasNextPage, isLoadingRecent]);

	const handleRecipePress = useCallback(
		(recipe: any) => {
			router.push(`/recipe/${recipe._id}`);
		},
		[router],
	);

	const handleUpdateSession = useCallback((sessionId: string) => {
		// Navigate to update session screen or show modal
		// For now, we'll show a simple alert
		Alert.alert(
			"Update Session",
			"This would open an update form for the cooking session",
			[
				{ text: "Cancel", style: "cancel" },
				{
					text: "Edit",
					onPress: () => console.log("Edit session:", sessionId),
				},
			],
		);
	}, []);

	const handleDeleteSession = useCallback(
		(sessionId: string) => {
			deleteSessionMutation.mutate({ sessionId });
		},
		[deleteSessionMutation],
	);

	const handleApplyFilters = useCallback(() => {
		setShowFilters(false);
		refetchRecent();
	}, [refetchRecent]);

	const resetFilters = useCallback(() => {
		setFilters({
			includePartner: false,
			sortBy: "recent",
		});
	}, []);

	if (isLoadingRecent && allCookedRecipes.length === 0) {
		return (
			<SafeAreaView className="flex-1 bg-gray-50">
				<View className="flex-1 items-center justify-center">
					<Text className="text-gray-500">Loading cooking history...</Text>
				</View>
			</SafeAreaView>
		);
	}

	return (
		<SafeAreaView className="flex-1 bg-gray-50">
			{/* Header */}
			<View className="bg-white border-b border-gray-100 px-4 py-3">
				<View className="flex-row items-center justify-between">
					<Text className="text-2xl font-bold text-gray-900">
						Cooking History
					</Text>
					<View className="flex-row items-center space-x-3">
						<Pressable onPress={() => setShowFilters(true)} className="p-2">
							<Ionicons name="filter" size={24} color="#6b7280" />
						</Pressable>
						<Pressable
							onPress={() => router.push("/cooking-stats")}
							className="p-2"
						>
							<Ionicons name="stats-chart" size={24} color="#6b7280" />
						</Pressable>
					</View>
				</View>

				{total > 0 && (
					<Text className="text-sm text-gray-600 mt-1">
						{total} cooking session{total !== 1 ? "s" : ""} total
					</Text>
				)}
			</View>

			<ScrollView
				className="flex-1"
				refreshControl={
					<RefreshControl
						refreshing={refreshing}
						onRefresh={handleRefresh}
						tintColor="#3b82f6"
					/>
				}
			>
				{/* Stats Card */}
				{cookingStats && (
					<View className="px-4 py-3">
						<CookingStatsCard
							stats={cookingStats.basicStats}
							mostCookedRecipes={cookingStats.mostCookedRecipes}
							currentStreak={cookingStats.currentStreak}
							onViewDetails={() => router.push("/cooking-stats")}
							onViewMostCooked={() => router.push("/most-cooked")}
						/>
					</View>
				)}

				{/* Recently Cooked List */}
				<View className="px-4 pb-4">
					<Text className="text-lg font-semibold text-gray-900 mb-3">
						Recent Sessions
					</Text>
					<RecentlyCookedList
						data={allCookedRecipes}
						isLoading={isLoadingRecent}
						isRefreshing={refreshing}
						hasMore={hasNextPage || false}
						onRefresh={handleRefresh}
						onLoadMore={handleLoadMore}
						onRecipePress={handleRecipePress}
						onUpdateSession={handleUpdateSession}
						onDeleteSession={handleDeleteSession}
						showActions={true}
						emptyTitle="No cooking history yet"
						emptyMessage="Start cooking some recipes to track your culinary journey!"
					/>
				</View>
			</ScrollView>

			{/* Filter Modal */}
			<Modal
				visible={showFilters}
				animationType="slide"
				presentationStyle="pageSheet"
			>
				<SafeAreaView className="flex-1 bg-white">
					<View className="flex-row items-center justify-between p-4 border-b border-gray-100">
						<Text className="text-lg font-semibold">Filters</Text>
						<Pressable onPress={() => setShowFilters(false)}>
							<Ionicons name="close" size={24} color="#6b7280" />
						</Pressable>
					</View>

					<ScrollView className="flex-1 p-4">
						{/* Sort By */}
						<View className="mb-6">
							<Text className="text-base font-medium text-gray-900 mb-3">
								Sort By
							</Text>
							<View className="space-y-2">
								{[
									{ value: "recent", label: "Most Recent" },
									{ value: "rating", label: "Highest Rated" },
									{ value: "cookCount", label: "Most Cooked" },
								].map((option) => (
									<Pressable
										key={option.value}
										onPress={() =>
											setFilters((f) => ({ ...f, sortBy: option.value as any }))
										}
										className={`flex-row items-center p-3 rounded-lg border ${
											filters.sortBy === option.value
												? "border-blue-500 bg-blue-50"
												: "border-gray-200"
										}`}
									>
										<View
											className={`w-4 h-4 rounded-full border-2 mr-3 ${
												filters.sortBy === option.value
													? "border-blue-500 bg-blue-500"
													: "border-gray-300"
											}`}
										>
											{filters.sortBy === option.value && (
												<View className="w-2 h-2 rounded-full bg-white self-center mt-0.5" />
											)}
										</View>
										<Text
											className={`${
												filters.sortBy === option.value
													? "text-blue-700"
													: "text-gray-700"
											}`}
										>
											{option.label}
										</Text>
									</Pressable>
								))}
							</View>
						</View>

						{/* Include Partner */}
						<View className="mb-6">
							<View className="flex-row items-center justify-between">
								<Text className="text-base font-medium text-gray-900">
									Include Partner's Cooking
								</Text>
								<Switch
									value={filters.includePartner}
									onValueChange={(value) =>
										setFilters((f) => ({ ...f, includePartner: value }))
									}
									trackColor={{ false: "#e5e7eb", true: "#3b82f6" }}
									thumbColor={filters.includePartner ? "#ffffff" : "#f3f4f6"}
								/>
							</View>
							<Text className="text-sm text-gray-600 mt-1">
								Show cooking sessions from your partner
							</Text>
						</View>

						{/* Minimum Rating */}
						<View className="mb-6">
							<Text className="text-base font-medium text-gray-900 mb-3">
								Minimum Rating
							</Text>
							<View className="flex-row space-x-2">
								{[1, 2, 3, 4, 5].map((rating) => (
									<Pressable
										key={rating}
										onPress={() =>
											setFilters((f) => ({
												...f,
												minRating: f.minRating === rating ? undefined : rating,
											}))
										}
										className={`flex-1 p-3 rounded-lg border ${
											filters.minRating === rating
												? "border-yellow-400 bg-yellow-50"
												: "border-gray-200"
										}`}
									>
										<View className="items-center">
											<Ionicons
												name="star"
												size={20}
												color={
													filters.minRating === rating ? "#fbbf24" : "#d1d5db"
												}
											/>
											<Text
												className={`text-xs mt-1 ${
													filters.minRating === rating
														? "text-yellow-700"
														: "text-gray-600"
												}`}
											>
												{rating}+
											</Text>
										</View>
									</Pressable>
								))}
							</View>
						</View>
					</ScrollView>

					{/* Filter Actions */}
					<View className="p-4 border-t border-gray-100">
						<View className="flex-row space-x-3">
							<Pressable
								onPress={resetFilters}
								className="flex-1 p-3 rounded-lg border border-gray-300"
							>
								<Text className="text-center font-medium text-gray-700">
									Reset
								</Text>
							</Pressable>
							<Pressable
								onPress={handleApplyFilters}
								className="flex-1 p-3 rounded-lg bg-blue-600"
							>
								<Text className="text-center font-medium text-white">
									Apply Filters
								</Text>
							</Pressable>
						</View>
					</View>
				</SafeAreaView>
			</Modal>
		</SafeAreaView>
	);
}
