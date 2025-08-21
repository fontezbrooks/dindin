import { Ionicons } from "@expo/vector-icons";
import React, { useCallback, useState } from "react";
import {
	ActivityIndicator,
	FlatList,
	RefreshControl,
	ScrollView,
	Text,
	TextInput,
	TouchableOpacity,
	View,
} from "react-native";
import RecipeLibraryCard from "./recipe-library-card";

interface Recipe {
	id: string;
	title: string;
	imageUrl: string;
	cookTime: number;
	difficulty: "easy" | "medium" | "hard";
	cuisine: string;
	isMatched?: boolean;
}

interface RecipeGridProps {
	recipes: Recipe[];
	isLoading: boolean;
	isRefreshing: boolean;
	hasMore: boolean;
	onRefresh: () => void;
	onLoadMore: () => void;
	onRecipePress: (recipe: Recipe) => void;
	onRecipeLongPress?: (recipe: Recipe) => void;
	searchQuery: string;
	onSearchChange: (query: string) => void;
	filters: {
		cuisine?: string;
		difficulty?: string;
		maxCookTime?: number;
	};
	onFilterChange: (filters: any) => void;
}

const CUISINES = [
	"Italian",
	"Asian",
	"Mexican",
	"American",
	"Mediterranean",
	"Indian",
];
const DIFFICULTIES = ["easy", "medium", "hard"];

export default function RecipeGrid({
	recipes,
	isLoading,
	isRefreshing,
	hasMore,
	onRefresh,
	onLoadMore,
	onRecipePress,
	onRecipeLongPress,
	searchQuery,
	onSearchChange,
	filters,
	onFilterChange,
}: RecipeGridProps) {
	const [showFilters, setShowFilters] = useState(false);

	const renderRecipeCard = useCallback(
		({ item }: { item: Recipe }) => (
			<RecipeLibraryCard
				recipe={item}
				onPress={() => onRecipePress(item)}
				onLongPress={() => onRecipeLongPress?.(item)}
			/>
		),
		[onRecipePress, onRecipeLongPress],
	);

	const renderFooter = () => {
		if (!hasMore) return null;
		return (
			<View className="py-4">
				<ActivityIndicator size="small" color="#FF6B6B" />
			</View>
		);
	};

	const renderEmpty = () => {
		if (isLoading) return null;

		return (
			<View className="flex-1 items-center justify-center py-20">
				<Ionicons name="restaurant-outline" size={64} color="#9CA3AF" />
				<Text className="text-gray-500 text-lg font-semibold mt-4">
					{searchQuery || filters.cuisine || filters.difficulty
						? "No recipes match your filters"
						: "No favorite recipes yet"}
				</Text>
				<Text className="text-gray-400 text-sm mt-2 text-center px-8">
					{searchQuery || filters.cuisine || filters.difficulty
						? "Try adjusting your search or filters"
						: "Start swiping to add recipes to your favorites!"}
				</Text>
			</View>
		);
	};

	const renderHeader = () => (
		<View className="bg-white">
			{/* Search Bar */}
			<View className="px-4 pt-4 pb-2">
				<View className="bg-gray-100 rounded-xl flex-row items-center px-4 py-3">
					<Ionicons name="search" size={20} color="#9CA3AF" />
					<TextInput
						value={searchQuery}
						onChangeText={onSearchChange}
						placeholder="Search your favorites..."
						placeholderTextColor="#9CA3AF"
						className="flex-1 ml-2 text-gray-800"
					/>
					{searchQuery.length > 0 && (
						<TouchableOpacity onPress={() => onSearchChange("")}>
							<Ionicons name="close-circle" size={20} color="#9CA3AF" />
						</TouchableOpacity>
					)}
				</View>
			</View>

			{/* Filter Toggle */}
			<TouchableOpacity
				onPress={() => setShowFilters(!showFilters)}
				className="px-4 pb-2"
			>
				<View className="flex-row items-center">
					<Ionicons
						name={showFilters ? "chevron-up" : "chevron-down"}
						size={20}
						color="#6B7280"
					/>
					<Text className="text-gray-600 ml-1">
						{showFilters ? "Hide" : "Show"} Filters
					</Text>
					{(filters.cuisine || filters.difficulty) && (
						<View className="ml-2 bg-pink-500 rounded-full px-2 py-0.5">
							<Text className="text-white text-xs">
								{Object.keys(filters).filter((k) => filters[k]).length}
							</Text>
						</View>
					)}
				</View>
			</TouchableOpacity>

			{/* Filters */}
			{showFilters && (
				<View className="px-4 pb-4">
					{/* Cuisine Filter */}
					<Text className="text-sm font-semibold text-gray-700 mb-2">
						Cuisine
					</Text>
					<ScrollView
						horizontal
						showsHorizontalScrollIndicator={false}
						className="mb-3"
					>
						<TouchableOpacity
							onPress={() => onFilterChange({ ...filters, cuisine: undefined })}
							className={`mr-2 px-3 py-1.5 rounded-full ${
								!filters.cuisine ? "bg-pink-500" : "bg-gray-200"
							}`}
						>
							<Text
								className={!filters.cuisine ? "text-white" : "text-gray-700"}
							>
								All
							</Text>
						</TouchableOpacity>
						{CUISINES.map((cuisine) => (
							<TouchableOpacity
								key={cuisine}
								onPress={() => onFilterChange({ ...filters, cuisine })}
								className={`mr-2 px-3 py-1.5 rounded-full ${
									filters.cuisine === cuisine ? "bg-pink-500" : "bg-gray-200"
								}`}
							>
								<Text
									className={
										filters.cuisine === cuisine ? "text-white" : "text-gray-700"
									}
								>
									{cuisine}
								</Text>
							</TouchableOpacity>
						))}
					</ScrollView>

					{/* Difficulty Filter */}
					<Text className="text-sm font-semibold text-gray-700 mb-2">
						Difficulty
					</Text>
					<View className="flex-row gap-2">
						<TouchableOpacity
							onPress={() =>
								onFilterChange({ ...filters, difficulty: undefined })
							}
							className={`px-3 py-1.5 rounded-full ${
								!filters.difficulty ? "bg-pink-500" : "bg-gray-200"
							}`}
						>
							<Text
								className={!filters.difficulty ? "text-white" : "text-gray-700"}
							>
								All
							</Text>
						</TouchableOpacity>
						{DIFFICULTIES.map((difficulty) => (
							<TouchableOpacity
								key={difficulty}
								onPress={() => onFilterChange({ ...filters, difficulty })}
								className={`px-3 py-1.5 rounded-full ${
									filters.difficulty === difficulty
										? "bg-pink-500"
										: "bg-gray-200"
								}`}
							>
								<Text
									className={`capitalize ${
										filters.difficulty === difficulty
											? "text-white"
											: "text-gray-700"
									}`}
								>
									{difficulty}
								</Text>
							</TouchableOpacity>
						))}
					</View>
				</View>
			)}
		</View>
	);

	return (
		<FlatList
			data={recipes}
			renderItem={renderRecipeCard}
			keyExtractor={(item) => item.id}
			numColumns={2}
			columnWrapperStyle={{
				paddingHorizontal: 16,
				justifyContent: "space-between",
			}}
			ListHeaderComponent={renderHeader}
			ListEmptyComponent={renderEmpty}
			ListFooterComponent={renderFooter}
			refreshControl={
				<RefreshControl
					refreshing={isRefreshing}
					onRefresh={onRefresh}
					colors={["#FF6B6B"]}
					tintColor="#FF6B6B"
				/>
			}
			onEndReached={onLoadMore}
			onEndReachedThreshold={0.5}
			showsVerticalScrollIndicator={false}
			contentContainerStyle={recipes.length === 0 ? { flex: 1 } : undefined}
		/>
	);
}
