import { Ionicons } from "@expo/vector-icons";
import { useState } from "react";
import { Alert, Image, Pressable, Text, View } from "react-native";

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

interface RecentlyCookedItemProps {
	item: CookedRecipe;
	onPress?: () => void;
	onUpdate?: (sessionId: string) => void;
	onDelete?: (sessionId: string) => void;
	showActions?: boolean;
}

export function RecentlyCookedItem({
	item,
	onPress,
	onUpdate,
	onDelete,
	showActions = false,
}: RecentlyCookedItemProps) {
	const [expanded, setExpanded] = useState(false);

	const formatDate = (dateString: string) => {
		const date = new Date(dateString);
		const now = new Date();
		const diffTime = Math.abs(now.getTime() - date.getTime());
		const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

		if (diffDays === 1) return "Today";
		if (diffDays === 2) return "Yesterday";
		if (diffDays <= 7) return `${diffDays - 1} days ago`;
		return date.toLocaleDateString();
	};

	const getDifficultyColor = (difficulty?: string) => {
		switch (difficulty) {
			case "easier_than_expected":
				return "#10b981"; // green
			case "harder_than_expected":
				return "#ef4444"; // red
			default:
				return "#6b7280"; // gray
		}
	};

	const getDifficultyText = (difficulty?: string) => {
		switch (difficulty) {
			case "easier_than_expected":
				return "Easier than expected";
			case "harder_than_expected":
				return "Harder than expected";
			case "as_expected":
				return "As expected";
			default:
				return null;
		}
	};

	const renderStars = (rating?: number) => {
		if (!rating) return null;
		return (
			<View className="flex-row items-center">
				{[1, 2, 3, 4, 5].map((star) => (
					<Ionicons
						key={star}
						name={star <= rating ? "star" : "star-outline"}
						size={16}
						color="#fbbf24"
					/>
				))}
				<Text className="ml-1 text-sm text-gray-600">({rating})</Text>
			</View>
		);
	};

	const handleDelete = () => {
		Alert.alert(
			"Delete Cooking Session",
			"Are you sure you want to delete this cooking session?",
			[
				{ text: "Cancel", style: "cancel" },
				{
					text: "Delete",
					style: "destructive",
					onPress: () => onDelete?.(item._id),
				},
			],
		);
	};

	return (
		<Pressable
			className="bg-white rounded-lg shadow-sm border border-gray-100 mb-3"
			onPress={onPress}
		>
			<View className="p-4">
				{/* Header */}
				<View className="flex-row items-start justify-between mb-3">
					<View className="flex-1 flex-row items-start">
						<Image
							source={{ uri: item.recipe.image_url }}
							className="w-16 h-16 rounded-lg mr-3"
							resizeMode="cover"
						/>
						<View className="flex-1">
							<Text className="font-semibold text-lg text-gray-900 mb-1">
								{item.recipe.title}
							</Text>
							<Text className="text-sm text-gray-500 mb-1">
								Cooked {formatDate(item.cookedAt)}
							</Text>
							{item.cookingFrequency > 1 && (
								<View className="flex-row items-center">
									<Ionicons name="repeat" size={14} color="#6b7280" />
									<Text className="ml-1 text-sm text-gray-600">
										{item.cookingFrequency}x cooked
									</Text>
								</View>
							)}
						</View>
					</View>

					{showActions && (
						<View className="flex-row">
							{onUpdate && (
								<Pressable
									onPress={() => onUpdate(item._id)}
									className="p-2 ml-1"
								>
									<Ionicons name="pencil" size={18} color="#6b7280" />
								</Pressable>
							)}
							{onDelete && (
								<Pressable onPress={handleDelete} className="p-2 ml-1">
									<Ionicons name="trash-outline" size={18} color="#ef4444" />
								</Pressable>
							)}
						</View>
					)}
				</View>

				{/* Quick Stats */}
				<View className="flex-row items-center justify-between mb-3">
					<View className="flex-row items-center space-x-4">
						{item.rating && renderStars(item.rating)}

						{item.timeSpent && (
							<View className="flex-row items-center">
								<Ionicons name="time-outline" size={16} color="#6b7280" />
								<Text className="ml-1 text-sm text-gray-600">
									{item.timeSpent}min
								</Text>
							</View>
						)}

						{item.cookedWithPartner && (
							<View className="flex-row items-center">
								<Ionicons name="people-outline" size={16} color="#6b7280" />
								<Text className="ml-1 text-sm text-gray-600">With partner</Text>
							</View>
						)}
					</View>

					<Pressable onPress={() => setExpanded(!expanded)} className="p-1">
						<Ionicons
							name={expanded ? "chevron-up" : "chevron-down"}
							size={20}
							color="#6b7280"
						/>
					</Pressable>
				</View>

				{/* Recipe Quick Info */}
				<View className="flex-row items-center justify-between border-t border-gray-100 pt-3">
					<View className="flex-row items-center space-x-4">
						<View className="flex-row items-center">
							<Ionicons name="time" size={14} color="#6b7280" />
							<Text className="ml-1 text-sm text-gray-600">
								{item.recipe.cook_time}min
							</Text>
						</View>

						<View className="bg-gray-100 px-2 py-1 rounded-full">
							<Text className="text-xs text-gray-700 capitalize">
								{item.recipe.difficulty}
							</Text>
						</View>

						{item.recipe.cuisine?.[0] && (
							<View className="bg-blue-100 px-2 py-1 rounded-full">
								<Text className="text-xs text-blue-700">
									{item.recipe.cuisine[0]}
								</Text>
							</View>
						)}
					</View>
				</View>

				{/* Expanded Details */}
				{expanded && (
					<View className="mt-4 pt-4 border-t border-gray-100">
						{item.notes && (
							<View className="mb-3">
								<Text className="font-medium text-gray-900 mb-1">Notes:</Text>
								<Text className="text-gray-700 text-sm">{item.notes}</Text>
							</View>
						)}

						{item.difficulty && (
							<View className="mb-3">
								<Text className="font-medium text-gray-900 mb-1">
									Difficulty:
								</Text>
								<Text
									className="text-sm"
									style={{ color: getDifficultyColor(item.difficulty) }}
								>
									{getDifficultyText(item.difficulty)}
								</Text>
							</View>
						)}

						{item.modifications && item.modifications.length > 0 && (
							<View className="mb-3">
								<Text className="font-medium text-gray-900 mb-1">
									Modifications:
								</Text>
								{item.modifications.map((mod, index) => (
									<Text key={index} className="text-gray-700 text-sm">
										• {mod}
									</Text>
								))}
							</View>
						)}

						{item.wouldCookAgain !== undefined && (
							<View className="mb-3">
								<View className="flex-row items-center">
									<Ionicons
										name={
											item.wouldCookAgain ? "checkmark-circle" : "close-circle"
										}
										size={16}
										color={item.wouldCookAgain ? "#10b981" : "#ef4444"}
									/>
									<Text className="ml-2 text-sm text-gray-700">
										{item.wouldCookAgain
											? "Would cook again"
											: "Wouldn't cook again"}
									</Text>
								</View>
							</View>
						)}

						{(item.mealType || item.occasion || item.cookingMethod) && (
							<View className="flex-row flex-wrap gap-2">
								{item.mealType && (
									<View className="bg-purple-100 px-2 py-1 rounded-full">
										<Text className="text-xs text-purple-700 capitalize">
											{item.mealType.replace("_", " ")}
										</Text>
									</View>
								)}
								{item.occasion && (
									<View className="bg-green-100 px-2 py-1 rounded-full">
										<Text className="text-xs text-green-700 capitalize">
											{item.occasion.replace("_", " ")}
										</Text>
									</View>
								)}
								{item.cookingMethod && (
									<View className="bg-orange-100 px-2 py-1 rounded-full">
										<Text className="text-xs text-orange-700 capitalize">
											{item.cookingMethod.replace("_", " ")}
										</Text>
									</View>
								)}
							</View>
						)}
					</View>
				)}
			</View>
		</Pressable>
	);
}
