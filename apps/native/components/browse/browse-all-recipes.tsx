import { Ionicons } from "@expo/vector-icons";
import React, { useCallback, useEffect, useMemo, useState } from "react";
import { Alert, Text, TouchableOpacity, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { trpc } from "../../utils/trpc";
import RecipeBrowseGrid from "./recipe-browse-grid";
import RecipeFilters from "./recipe-filters";
import RecipeSearchBar from "./recipe-search-bar";
import logger from '@/utils/logger';

interface RecipeFilters {
	category?: string;
	cuisine?: string;
	difficulty?: "easy" | "medium" | "hard";
	maxCookTime?: number;
	dietaryRestrictions?: string[];
	sortBy?: "popularity" | "rating" | "newest" | "cookTime";
}

interface Recipe {
	id: string;
	title: string;
	imageUrl: string;
	cookTime: number;
	difficulty: "easy" | "medium" | "hard";
	cuisine: string | string[];
	rating?: number;
	reviewCount?: number;
	description?: string;
	tags?: string[];
	isBookmarked?: boolean;
}

type ViewMode = "list" | "grid";

export default function BrowseAllRecipes() {
	const [searchQuery, setSearchQuery] = useState("");
	const [debouncedQuery, setDebouncedQuery] = useState("");
	const [filters, setFilters] = useState<RecipeFilters>({
		sortBy: "popularity",
	});
	const [showFilters, setShowFilters] = useState(false);
	const [viewMode, setViewMode] = useState<ViewMode>("grid");
	const [offset, setOffset] = useState(0);
	const [allRecipes, setAllRecipes] = useState<Recipe[]>([]);
	const [suggestions, setSuggestions] = useState<string[]>([]);
	const limit = 20;

	// Debounce search query
	useEffect(() => {
		const timer = setTimeout(() => {
			setDebouncedQuery(searchQuery);
		}, 300);
		return () => clearTimeout(timer);
	}, [searchQuery]);

	// Reset offset when search or filters change
	useEffect(() => {
		setOffset(0);
		setAllRecipes([]);
	}, [debouncedQuery, filters]);

	// Fetch browse recipes
	const {
		data: recipesData,
		isLoading,
		isRefetching,
		refetch,
	} = trpc.recipe.browseAllRecipes.useQuery(
		{
			query: debouncedQuery || undefined,
			category: filters.category,
			cuisine: filters.cuisine,
			difficulty: filters.difficulty,
			maxCookTime: filters.maxCookTime,
			dietaryRestrictions: filters.dietaryRestrictions,
			sortBy: filters.sortBy || "popularity",
			limit,
			offset,
		},
		{
			enabled: true,
			staleTime: 30 * 1000, // 30 seconds
			keepPreviousData: true,
		},
	);

	// Fetch search suggestions
	const { data: suggestionsData } = trpc.recipe.getRecipeSuggestions.useQuery(
		{
			query: searchQuery,
			limit: 5,
		},
		{
			enabled: searchQuery.length >= 2,
			staleTime: 60 * 1000, // 1 minute
		},
	);

	// Update suggestions when data changes
	useEffect(() => {
		if (suggestionsData?.suggestions) {
			setSuggestions(suggestionsData.suggestions);
		}
	}, [suggestionsData]);

	// Merge new recipes with existing ones for infinite scroll
	useEffect(() => {
		if (recipesData?.recipes) {
			if (offset === 0) {
				setAllRecipes(recipesData.recipes);
			} else {
				setAllRecipes((prev) => [...prev, ...recipesData.recipes]);
			}
		}
	}, [recipesData, offset]);

	const handleRefresh = useCallback(() => {
		setOffset(0);
		setAllRecipes([]);
		refetch();
	}, [refetch]);

	const handleLoadMore = useCallback(() => {
		if (recipesData?.hasMore && !isLoading) {
			setOffset((prev) => prev + limit);
		}
	}, [recipesData?.hasMore, isLoading]);

	const handleRecipePress = useCallback((recipe: Recipe) => {
		// Navigate to recipe detail or open modal
		// For now, show a simple alert
		Alert.alert(
			recipe.title,
			`Cook Time: ${recipe.cookTime}m\nDifficulty: ${recipe.difficulty}\nCuisine: ${Array.isArray(recipe.cuisine) ? recipe.cuisine.join(", ") : recipe.cuisine}`,
			[{ text: "OK" }],
		);
	}, []);

	const handleBookmarkPress = useCallback((recipe: Recipe) => {
		// Toggle bookmark status
		Alert.alert(
			"Bookmark",
			`${recipe.isBookmarked ? "Remove from" : "Add to"} favorites?`,
			[
				{ text: "Cancel", style: "cancel" },
				{
					text: "Yes",
					onPress: () => {
						// TODO: Implement bookmark toggle
						logger.log("Toggle bookmark for:", recipe.id);
					},
				},
			],
		);
	}, []);

	const handleSearchChange = useCallback((text: string) => {
		setSearchQuery(text);
	}, []);

	const handleSuggestionPress = useCallback((suggestion: string) => {
		setSearchQuery(suggestion);
		setSuggestions([]);
	}, []);

	const handleFiltersChange = useCallback((newFilters: RecipeFilters) => {
		setFilters(newFilters);
	}, []);

	const activeFiltersCount = useMemo(() => {
		let count = 0;
		if (filters.category && filters.category !== "All") count++;
		if (filters.cuisine && filters.cuisine !== "All") count++;
		if (filters.difficulty) count++;
		if (filters.maxCookTime) count++;
		if (filters.dietaryRestrictions && filters.dietaryRestrictions.length > 0)
			count++;
		return count;
	}, [filters]);

	return (
		<SafeAreaView className="flex-1 bg-gray-50">
			{/* Header with Search */}
			<View className="bg-white shadow-sm">
				<View className="px-4 py-4">
					<Text className="text-2xl font-bold text-gray-800 mb-4">
						Browse All Recipes 🔍
					</Text>

					{/* Search Bar */}
					<RecipeSearchBar
						value={searchQuery}
						onChangeText={handleSearchChange}
						placeholder="Search recipes, ingredients..."
						showSuggestions={true}
						suggestions={suggestions}
						onSuggestionPress={handleSuggestionPress}
					/>

					{/* Filter Button */}
					<View className="flex-row justify-between items-center mt-4">
						<TouchableOpacity
							onPress={() => setShowFilters(true)}
							className="flex-row items-center bg-gray-100 rounded-xl px-4 py-3 flex-1 mr-3"
						>
							<Ionicons name="filter" size={20} color="#6B7280" />
							<Text className="text-gray-700 ml-2 font-medium">
								Filters
								{activeFiltersCount > 0 && (
									<Text className="text-pink-500"> ({activeFiltersCount})</Text>
								)}
							</Text>
						</TouchableOpacity>

						{/* Sort indicator */}
						<View className="bg-gray-100 rounded-xl px-4 py-3">
							<Text className="text-gray-700 text-sm">
								{filters.sortBy === "popularity" && "🔥 Popular"}
								{filters.sortBy === "rating" && "⭐ Rated"}
								{filters.sortBy === "newest" && "🆕 Newest"}
								{filters.sortBy === "cookTime" && "⚡ Quick"}
							</Text>
						</View>
					</View>
				</View>
			</View>

			{/* Recipe Grid */}
			<RecipeBrowseGrid
				recipes={allRecipes}
				isLoading={isLoading}
				isRefreshing={isRefetching}
				hasMore={recipesData?.hasMore || false}
				onRefresh={handleRefresh}
				onLoadMore={handleLoadMore}
				onRecipePress={handleRecipePress}
				onBookmarkPress={handleBookmarkPress}
				viewMode={viewMode}
				onViewModeChange={setViewMode}
				emptyStateMessage={
					debouncedQuery || activeFiltersCount > 0
						? "No recipes match your search"
						: "No recipes available"
				}
				emptyStateSubtitle={
					debouncedQuery || activeFiltersCount > 0
						? "Try adjusting your search or filters"
						: "Check back later for new recipes"
				}
			/>

			{/* Filters Modal */}
			<RecipeFilters
				filters={filters}
				onFiltersChange={handleFiltersChange}
				visible={showFilters}
				onClose={() => setShowFilters(false)}
			/>
		</SafeAreaView>
	);
}
