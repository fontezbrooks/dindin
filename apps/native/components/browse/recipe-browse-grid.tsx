import { Ionicons } from "@expo/vector-icons";
import React, { useCallback, useMemo, useState } from "react";
import {
	ActivityIndicator,
	Dimensions,
	FlatList,
	RefreshControl,
	Text,
	TouchableOpacity,
	View,
} from "react-native";
import RecipeLibraryCard from "../recipe-library-card";
import RecipeCardLarge from "./recipe-card-large";

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

interface RecipeBrowseGridProps {
	recipes: Recipe[];
	isLoading: boolean;
	isRefreshing: boolean;
	hasMore: boolean;
	onRefresh: () => void;
	onLoadMore: () => void;
	onRecipePress: (recipe: Recipe) => void;
	onBookmarkPress?: (recipe: Recipe) => void;
	viewMode: ViewMode;
	onViewModeChange: (mode: ViewMode) => void;
	emptyStateMessage?: string;
	emptyStateSubtitle?: string;
}

const { width } = Dimensions.get("window");
const GRID_ITEM_WIDTH = (width - 48) / 2; // Account for padding and gap

export default function RecipeBrowseGrid({
	recipes,
	isLoading,
	isRefreshing,
	hasMore,
	onRefresh,
	onLoadMore,
	onRecipePress,
	onBookmarkPress,
	viewMode,
	onViewModeChange,
	emptyStateMessage = "No recipes found",
	emptyStateSubtitle = "Try adjusting your search or filters",
}: RecipeBrowseGridProps) {
	const [isLoadingMore, setIsLoadingMore] = useState(false);

	const handleLoadMore = useCallback(async () => {
		if (hasMore && !isLoading && !isLoadingMore) {
			setIsLoadingMore(true);
			try {
				await onLoadMore();
			} finally {
				setIsLoadingMore(false);
			}
		}
	}, [hasMore, isLoading, isLoadingMore, onLoadMore]);

	const renderRecipeItem = useCallback(
		({ item, index }: { item: Recipe; index: number }) => {
			if (viewMode === "list") {
				return (
					<RecipeCardLarge
						recipe={item}
						onPress={() => onRecipePress(item)}
						onBookmarkPress={() => onBookmarkPress?.(item)}
						style={{ marginHorizontal: 16 }}
					/>
				);
			}

			// Grid mode
			return (
				<View style={{ width: GRID_ITEM_WIDTH, marginBottom: 16 }}>
					<RecipeLibraryCard
						recipe={{
							...item,
							cuisine: Array.isArray(item.cuisine)
								? item.cuisine[0]
								: item.cuisine,
						}}
						onPress={() => onRecipePress(item)}
						onLongPress={() => onBookmarkPress?.(item)}
					/>
				</View>
			);
		},
		[viewMode, onRecipePress, onBookmarkPress],
	);

	const renderHeader = useCallback(
		() => (
			<View className="bg-white px-4 py-3 border-b border-gray-100">
				<View className="flex-row justify-between items-center">
					<Text className="text-gray-600 text-sm">
						{recipes.length} recipe{recipes.length !== 1 ? "s" : ""} found
					</Text>
					<View className="flex-row gap-2">
						<TouchableOpacity
							onPress={() => onViewModeChange("list")}
							className={`p-2 rounded-lg ${
								viewMode === "list" ? "bg-pink-100" : "bg-gray-100"
							}`}
						>
							<Ionicons
								name="list"
								size={20}
								color={viewMode === "list" ? "#EC4899" : "#6B7280"}
							/>
						</TouchableOpacity>
						<TouchableOpacity
							onPress={() => onViewModeChange("grid")}
							className={`p-2 rounded-lg ${
								viewMode === "grid" ? "bg-pink-100" : "bg-gray-100"
							}`}
						>
							<Ionicons
								name="grid"
								size={20}
								color={viewMode === "grid" ? "#EC4899" : "#6B7280"}
							/>
						</TouchableOpacity>
					</View>
				</View>
			</View>
		),
		[recipes.length, viewMode, onViewModeChange],
	);

	const renderEmpty = useCallback(() => {
		if (isLoading) {
			return (
				<View className="flex-1 items-center justify-center py-20">
					<ActivityIndicator size="large" color="#EC4899" />
					<Text className="text-gray-500 mt-4">Loading recipes...</Text>
				</View>
			);
		}

		return (
			<View className="flex-1 items-center justify-center py-20 px-8">
				<Ionicons name="search-outline" size={64} color="#9CA3AF" />
				<Text className="text-gray-500 text-lg font-semibold mt-4 text-center">
					{emptyStateMessage}
				</Text>
				<Text className="text-gray-400 text-sm mt-2 text-center">
					{emptyStateSubtitle}
				</Text>
			</View>
		);
	}, [isLoading, emptyStateMessage, emptyStateSubtitle]);

	const renderFooter = useCallback(() => {
		if (!hasMore && recipes.length > 0) {
			return (
				<View className="py-6">
					<Text className="text-center text-gray-400 text-sm">
						You've reached the end!
					</Text>
				</View>
			);
		}

		if (isLoadingMore) {
			return (
				<View className="py-6">
					<ActivityIndicator size="small" color="#EC4899" />
					<Text className="text-center text-gray-500 text-sm mt-2">
						Loading more recipes...
					</Text>
				</View>
			);
		}

		return null;
	}, [hasMore, recipes.length, isLoadingMore]);

	const flatListProps = useMemo(() => {
		const baseProps = {
			data: recipes,
			renderItem: renderRecipeItem,
			keyExtractor: (item: Recipe) => item.id,
			ListHeaderComponent: recipes.length > 0 ? renderHeader : undefined,
			ListEmptyComponent: renderEmpty,
			ListFooterComponent: renderFooter,
			refreshControl: (
				<RefreshControl
					refreshing={isRefreshing}
					onRefresh={onRefresh}
					colors={["#EC4899"]}
					tintColor="#EC4899"
				/>
			),
			onEndReached: handleLoadMore,
			onEndReachedThreshold: 0.5,
			showsVerticalScrollIndicator: false,
			contentContainerStyle: recipes.length === 0 ? { flex: 1 } : undefined,
		};

		if (viewMode === "grid") {
			return {
				...baseProps,
				numColumns: 2,
				columnWrapperStyle: {
					paddingHorizontal: 16,
					justifyContent: "space-between",
				},
			};
		}

		return baseProps;
	}, [
		recipes,
		renderRecipeItem,
		renderHeader,
		renderEmpty,
		renderFooter,
		isRefreshing,
		onRefresh,
		handleLoadMore,
		viewMode,
	]);

	return (
		<View className="flex-1 bg-gray-50">
			<FlatList {...flatListProps} />
		</View>
	);
}
