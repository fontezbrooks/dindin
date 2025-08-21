import { Ionicons } from "@expo/vector-icons";
import React, { useCallback, useEffect, useMemo, useState } from "react";
import {
	Alert,
	Image,
	Modal,
	ScrollView,
	Text,
	TouchableOpacity,
	View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import BrowseAllRecipes from "../../components/browse/browse-all-recipes";
import RecipeGrid from "../../components/recipe-grid";
import { trpc } from "../../utils/trpc";
import { getWebSocketManager } from "../../utils/websocket-manager";

interface Ingredient {
	name: string;
	amount: string;
	unit: string;
	_id?: string;
}

interface RecipeDetail {
	id: string;
	title: string;
	imageUrl: string;
	cookTime: number;
	difficulty: "easy" | "medium" | "hard";
	cuisine: string | string[];
	ingredients: (string | Ingredient)[];
	steps: string[];
	tags: string[];
	description?: string;
	// Additional fields from DB that might be present
	image_url?: string;
	cook_time?: number;
	instructions?: Array<{ step: number; description: string } | string>;
	dietary_tags?: string[];
}

export default function LibraryScreen() {
	const [selectedTab, setSelectedTab] = useState<
		"favorites" | "cooked" | "browse"
	>("favorites");
	const [searchQuery, setSearchQuery] = useState("");
	const [filters, setFilters] = useState({
		cuisine: undefined as string | undefined,
		difficulty: undefined as string | undefined,
		maxCookTime: undefined as number | undefined,
	});
	const [selectedRecipe, setSelectedRecipe] = useState<RecipeDetail | null>(
		null,
	);
	const [showRecipeModal, setShowRecipeModal] = useState(false);
	const [offset, setOffset] = useState(0);
	const limit = 20;

	// WebSocket connection for real-time updates
	const wsManager = getWebSocketManager();

	// Fetch user favorites with filters
	const {
		data: favoritesData,
		isLoading,
		isRefetching,
		refetch,
	} = trpc.recipe.getUserFavorites.useQuery(
		{
			limit,
			offset,
			sortBy: "newest",
			filterBy: {
				cuisine: filters.cuisine,
				difficulty: filters.difficulty as
					| "easy"
					| "medium"
					| "hard"
					| undefined,
				maxCookTime: filters.maxCookTime,
			},
		},
		{
			enabled: selectedTab === "favorites",
			staleTime: 30 * 1000, // 30 seconds
		},
	);

	// Filter recipes based on search query
	const filteredRecipes = useMemo(() => {
		if (!favoritesData?.recipes) return [];
		if (!searchQuery) return favoritesData.recipes;

		const query = searchQuery.toLowerCase();
		return favoritesData.recipes.filter((recipe) => {
			// Check title
			if (recipe.title.toLowerCase().includes(query)) return true;

			// Check cuisine (handle both string and array)
			if (Array.isArray(recipe.cuisine)) {
				if (recipe.cuisine.some((c) => c.toLowerCase().includes(query)))
					return true;
			} else if (typeof recipe.cuisine === "string") {
				if (recipe.cuisine.toLowerCase().includes(query)) return true;
			}

			// Check tags
			if (recipe.tags?.some((tag) => tag.toLowerCase().includes(query)))
				return true;

			return false;
		});
	}, [favoritesData?.recipes, searchQuery]);

	// Listen for real-time updates when new recipes are liked
	useEffect(() => {
		const handleNewMatch = (data: any) => {
			// Refetch favorites when a new match is created
			refetch();
		};

		const handlePartnerSwiping = (data: any) => {
			// Optionally show notification that partner liked a recipe
			if (data.payload.action === "liked") {
				// Could show a toast notification here
				refetch(); // Refetch to potentially show new matches
			}
		};

		wsManager.on("newMatch", handleNewMatch);
		wsManager.on("partnerSwiping", handlePartnerSwiping);

		return () => {
			wsManager.off("newMatch", handleNewMatch);
			wsManager.off("partnerSwiping", handlePartnerSwiping);
		};
	}, [refetch]);

	const handleRefresh = useCallback(() => {
		setOffset(0);
		refetch();
	}, [refetch]);

	const handleLoadMore = useCallback(() => {
		if (favoritesData?.hasMore && !isLoading) {
			setOffset((prev) => prev + limit);
		}
	}, [favoritesData?.hasMore, isLoading]);

	const handleRecipePress = useCallback((recipe: any) => {
		// Map the recipe data to match the expected format
		const mappedRecipe = {
			...recipe,
			imageUrl: recipe.image_url || recipe.imageUrl,
			cookTime: recipe.cook_time || recipe.cookTime,
			steps: recipe.instructions
				? recipe.instructions.map((inst: any) =>
						typeof inst === "string" ? inst : inst.description,
					)
				: recipe.steps || [],
			tags: recipe.tags || recipe.dietary_tags || [],
		};
		setSelectedRecipe(mappedRecipe);
		setShowRecipeModal(true);
	}, []);

	const handleRecipeLongPress = useCallback((recipe: any) => {
		Alert.alert(
			"Remove from Favorites?",
			`Remove "${recipe.title}" from your favorites?`,
			[
				{ text: "Cancel", style: "cancel" },
				{
					text: "Remove",
					style: "destructive",
					onPress: () => {
						// TODO: Implement remove from favorites
						console.log("Remove recipe:", recipe.id);
					},
				},
			],
		);
	}, []);

	const renderTabButton = (
		tab: "favorites" | "cooked" | "browse",
		label: string,
		icon: string,
	) => (
		<TouchableOpacity
			onPress={() => setSelectedTab(tab)}
			className={`flex-1 py-3 ${selectedTab === tab ? "border-b-2 border-pink-500" : ""}`}
		>
			<View className="items-center">
				<Ionicons
					name={icon as any}
					size={24}
					color={selectedTab === tab ? "#EC4899" : "#6B7280"}
				/>
				<Text
					className={`text-sm mt-1 ${selectedTab === tab ? "text-pink-500 font-semibold" : "text-gray-500"}`}
				>
					{label}
				</Text>
			</View>
		</TouchableOpacity>
	);

	return (
		<SafeAreaView className="flex-1 bg-gray-50">
			{/* Header */}
			<View className="bg-white shadow-sm">
				<Text className="text-2xl font-bold text-gray-800 px-4 pt-4 pb-2">
					Recipe Library 📚
				</Text>

				{/* Tab Navigation */}
				<View className="flex-row">
					{renderTabButton("favorites", "Your Favorites", "heart")}
					{renderTabButton("cooked", "Recently Cooked", "checkmark-circle")}
					{renderTabButton("browse", "Browse All", "search")}
				</View>
			</View>

			{/* Content */}
			{selectedTab === "favorites" && (
				<RecipeGrid
					recipes={filteredRecipes.map((r) => ({
						...r,
						id: r._id || r.id,
						cookTime: r.cook_time || r.cookTime,
						cuisine: Array.isArray(r.cuisine) ? r.cuisine[0] : r.cuisine, // Take first cuisine for grid display
						isMatched: false, // TODO: Check if partner also liked
					}))}
					isLoading={isLoading}
					isRefreshing={isRefetching}
					hasMore={favoritesData?.hasMore || false}
					onRefresh={handleRefresh}
					onLoadMore={handleLoadMore}
					onRecipePress={handleRecipePress}
					onRecipeLongPress={handleRecipeLongPress}
					searchQuery={searchQuery}
					onSearchChange={setSearchQuery}
					filters={filters}
					onFilterChange={setFilters}
				/>
			)}

			{selectedTab === "cooked" && (
				<View className="flex-1 items-center justify-center p-4">
					<Ionicons name="restaurant-outline" size={64} color="#9CA3AF" />
					<Text className="text-gray-500 text-lg font-semibold mt-4">
						Coming Soon
					</Text>
					<Text className="text-gray-400 text-sm mt-2 text-center">
						Track the recipes you've cooked and rate them!
					</Text>
				</View>
			)}

			{selectedTab === "browse" && <BrowseAllRecipes />}

			{/* Recipe Detail Modal */}
			<Modal
				visible={showRecipeModal}
				animationType="slide"
				presentationStyle="pageSheet"
				onRequestClose={() => setShowRecipeModal(false)}
			>
				{selectedRecipe && (
					<SafeAreaView className="flex-1 bg-white">
						<ScrollView className="flex-1">
							{/* Modal Header */}
							<View className="flex-row justify-between items-center p-4 border-b border-gray-200">
								<Text className="text-xl font-bold text-gray-800">
									Recipe Details
								</Text>
								<TouchableOpacity onPress={() => setShowRecipeModal(false)}>
									<Ionicons name="close" size={28} color="#6B7280" />
								</TouchableOpacity>
							</View>

							{/* Recipe Image */}
							<Image
								source={{ uri: selectedRecipe.imageUrl }}
								className="w-full h-64"
								resizeMode="cover"
							/>

							{/* Recipe Info */}
							<View className="p-4">
								<Text className="text-2xl font-bold text-gray-800 mb-2">
									{selectedRecipe.title}
								</Text>

								{/* Meta Info */}
								<View className="flex-row flex-wrap gap-2 mb-4">
									<View className="bg-gray-100 rounded-full px-3 py-1">
										<Text className="text-sm text-gray-600">
											{Array.isArray(selectedRecipe.cuisine)
												? selectedRecipe.cuisine.join(", ")
												: selectedRecipe.cuisine}
										</Text>
									</View>
									<View className="bg-gray-100 rounded-full px-3 py-1 flex-row items-center">
										<Ionicons name="time-outline" size={16} color="#6B7280" />
										<Text className="text-sm text-gray-600 ml-1">
											{selectedRecipe.cookTime}m
										</Text>
									</View>
									<View
										className={`rounded-full px-3 py-1 ${
											selectedRecipe.difficulty === "easy"
												? "bg-green-100"
												: selectedRecipe.difficulty === "medium"
													? "bg-yellow-100"
													: "bg-red-100"
										}`}
									>
										<Text
											className={`text-sm capitalize ${
												selectedRecipe.difficulty === "easy"
													? "text-green-700"
													: selectedRecipe.difficulty === "medium"
														? "text-yellow-700"
														: "text-red-700"
											}`}
										>
											{selectedRecipe.difficulty}
										</Text>
									</View>
								</View>

								{/* Description */}
								{selectedRecipe.description && (
									<Text className="text-gray-600 mb-4">
										{selectedRecipe.description}
									</Text>
								)}

								{/* Ingredients */}
								<Text className="text-lg font-semibold text-gray-800 mb-2">
									Ingredients
								</Text>
								{selectedRecipe.ingredients?.map((ingredient, index) => (
									<View key={index} className="flex-row items-start mb-1">
										<Text className="text-gray-400 mr-2">•</Text>
										<Text className="text-gray-600 flex-1">
											{typeof ingredient === "string"
												? ingredient
												: `${ingredient.amount} ${ingredient.unit} ${ingredient.name}`}
										</Text>
									</View>
								))}

								{/* Steps */}
								<Text className="text-lg font-semibold text-gray-800 mt-4 mb-2">
									Instructions
								</Text>
								{selectedRecipe.steps?.map((step, index) => (
									<View key={index} className="flex-row items-start mb-2">
										<View className="bg-pink-500 rounded-full w-6 h-6 items-center justify-center mr-3">
											<Text className="text-white text-xs font-semibold">
												{index + 1}
											</Text>
										</View>
										<Text className="text-gray-600 flex-1">{step}</Text>
									</View>
								))}

								{/* Actions */}
								<View className="flex-row gap-3 mt-6">
									<TouchableOpacity className="flex-1 bg-pink-500 rounded-xl py-3 items-center">
										<Text className="text-white font-semibold">
											Start Cooking
										</Text>
									</TouchableOpacity>
									<TouchableOpacity className="flex-1 bg-gray-200 rounded-xl py-3 items-center">
										<Text className="text-gray-700 font-semibold">
											Share Recipe
										</Text>
									</TouchableOpacity>
								</View>
							</View>
						</ScrollView>
					</SafeAreaView>
				)}
			</Modal>
		</SafeAreaView>
	);
}
