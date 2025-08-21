import { Ionicons } from "@expo/vector-icons";
import { useCallback, useState } from "react";
import {
	ActivityIndicator,
	Alert,
	FlatList,
	Pressable,
	RefreshControl,
	Text,
	View,
} from "react-native";
import { RecentlyCookedItem } from "./recently-cooked-item";

interface Recipe {
	_id: string;
	title: string;
	image_url: string;
	cook_time: number;
	difficulty: string;
	cuisine: string[];
	tags: string[];
}

interface CookedBy {
	_id: string;
	name: string;
	profileImage?: string;
}

interface CookedRecipe {
	_id: string;
	cookedAt: string;
	rating?: number;
	notes?: string;
	difficulty?: "easier_than_expected" | "as_expected" | "harder_than_expected";
	timeSpent?: number;
	modifications?: string[];
	wouldCookAgain?: boolean;
	servings?: number;
	cookedWithPartner?: boolean;
	cookingMethod?: string;
	mealType?: string;
	occasion?: string;
	tags?: string[];
	cookingFrequency: number;
	recipe: Recipe;
	cookedBy: CookedBy;
}

interface RecentlyCookedListProps {
	data: CookedRecipe[];
	isLoading: boolean;
	isRefreshing: boolean;
	hasMore: boolean;
	onRefresh: () => void;
	onLoadMore: () => void;
	onRecipePress?: (recipe: Recipe) => void;
	onUpdateSession?: (sessionId: string) => void;
	onDeleteSession?: (sessionId: string) => void;
	showActions?: boolean;
	emptyTitle?: string;
	emptyMessage?: string;
}

export function RecentlyCookedList({
	data,
	isLoading,
	isRefreshing,
	hasMore,
	onRefresh,
	onLoadMore,
	onRecipePress,
	onUpdateSession,
	onDeleteSession,
	showActions = false,
	emptyTitle = "No cooking history",
	emptyMessage = "Start cooking some recipes to see them here!",
}: RecentlyCookedListProps) {
	const [loadingMore, setLoadingMore] = useState(false);

	const handleLoadMore = useCallback(async () => {
		if (hasMore && !loadingMore && !isLoading) {
			setLoadingMore(true);
			await onLoadMore();
			setLoadingMore(false);
		}
	}, [hasMore, loadingMore, isLoading, onLoadMore]);

	const handleDeleteSession = useCallback(
		(sessionId: string) => {
			Alert.alert(
				"Delete Cooking Session",
				"Are you sure you want to delete this cooking session? This action cannot be undone.",
				[
					{ text: "Cancel", style: "cancel" },
					{
						text: "Delete",
						style: "destructive",
						onPress: () => onDeleteSession?.(sessionId),
					},
				],
			);
		},
		[onDeleteSession],
	);

	const renderItem = useCallback(
		({ item }: { item: CookedRecipe }) => (
			<RecentlyCookedItem
				item={item}
				onPress={() => onRecipePress?.(item.recipe)}
				onUpdate={onUpdateSession}
				onDelete={showActions ? handleDeleteSession : undefined}
				showActions={showActions}
			/>
		),
		[onRecipePress, onUpdateSession, handleDeleteSession, showActions],
	);

	const renderEmpty = () => (
		<View className="flex-1 items-center justify-center py-16">
			<View className="bg-gray-100 rounded-full p-6 mb-4">
				<Ionicons name="restaurant-outline" size={48} color="#9ca3af" />
			</View>
			<Text className="text-xl font-semibold text-gray-900 mb-2 text-center">
				{emptyTitle}
			</Text>
			<Text className="text-gray-600 text-center px-8 leading-relaxed">
				{emptyMessage}
			</Text>
		</View>
	);

	const renderFooter = () => {
		if (!hasMore) {
			return data.length > 0 ? (
				<View className="py-8 items-center">
					<Text className="text-gray-500 text-sm">
						That's all your cooking history!
					</Text>
				</View>
			) : null;
		}

		if (loadingMore) {
			return (
				<View className="py-4 items-center">
					<ActivityIndicator size="small" color="#3b82f6" />
					<Text className="text-gray-500 text-sm mt-2">Loading more...</Text>
				</View>
			);
		}

		return (
			<Pressable
				onPress={handleLoadMore}
				className="py-4 items-center border-t border-gray-100 mt-4"
			>
				<Text className="text-blue-600 font-medium">Load More</Text>
			</Pressable>
		);
	};

	const keyExtractor = useCallback((item: CookedRecipe) => item._id, []);

	if (isLoading && data.length === 0) {
		return (
			<View className="flex-1 items-center justify-center">
				<ActivityIndicator size="large" color="#3b82f6" />
				<Text className="text-gray-500 mt-4">Loading cooking history...</Text>
			</View>
		);
	}

	return (
		<FlatList
			data={data}
			renderItem={renderItem}
			keyExtractor={keyExtractor}
			onEndReached={handleLoadMore}
			onEndReachedThreshold={0.5}
			refreshControl={
				<RefreshControl
					refreshing={isRefreshing}
					onRefresh={onRefresh}
					tintColor="#3b82f6"
					colors={["#3b82f6"]}
				/>
			}
			ListEmptyComponent={renderEmpty}
			ListFooterComponent={renderFooter}
			showsVerticalScrollIndicator={false}
			contentContainerStyle={
				data.length === 0 ? { flexGrow: 1 } : { paddingBottom: 20 }
			}
			className="flex-1"
		/>
	);
}
