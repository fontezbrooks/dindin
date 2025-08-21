import { Ionicons } from "@expo/vector-icons";
import React from "react";
import { Dimensions, Image, Text, TouchableOpacity, View } from "react-native";

const { width } = Dimensions.get("window");
const CARD_WIDTH = (width - 48) / 2; // 2 columns with padding

interface RecipeLibraryCardProps {
	recipe: {
		id: string;
		title: string;
		imageUrl: string;
		cookTime: number;
		difficulty: "easy" | "medium" | "hard";
		cuisine: string;
		isMatched?: boolean;
	};
	onPress: () => void;
	onLongPress?: () => void;
}

export default function RecipeLibraryCard({
	recipe,
	onPress,
	onLongPress,
}: RecipeLibraryCardProps) {
	const getDifficultyColor = (difficulty: string) => {
		switch (difficulty) {
			case "easy":
				return "bg-green-100 text-green-700";
			case "medium":
				return "bg-yellow-100 text-yellow-700";
			case "hard":
				return "bg-red-100 text-red-700";
			default:
				return "bg-gray-100 text-gray-700";
		}
	};

	return (
		<TouchableOpacity
			onPress={onPress}
			onLongPress={onLongPress}
			activeOpacity={0.9}
			className="mb-4"
			style={{ width: CARD_WIDTH }}
		>
			<View className="bg-white rounded-xl shadow-sm overflow-hidden">
				{/* Image Container */}
				<View className="relative">
					<Image
						source={{ uri: recipe.imageUrl }}
						className="w-full h-32"
						resizeMode="cover"
					/>

					{/* Match Indicator */}
					{recipe.isMatched && (
						<View className="absolute top-2 right-2 bg-pink-500 rounded-full p-1.5">
							<Ionicons name="heart" size={14} color="white" />
						</View>
					)}

					{/* Cook Time Badge */}
					<View className="absolute bottom-2 left-2 bg-black/60 rounded-full px-2 py-1 flex-row items-center">
						<Ionicons name="time-outline" size={12} color="white" />
						<Text className="text-white text-xs ml-1">{recipe.cookTime}m</Text>
					</View>
				</View>

				{/* Content */}
				<View className="p-3">
					{/* Title */}
					<Text
						className="text-sm font-semibold text-gray-800 mb-2"
						numberOfLines={2}
						ellipsizeMode="tail"
					>
						{recipe.title}
					</Text>

					{/* Tags */}
					<View className="flex-row flex-wrap gap-1">
						{/* Cuisine */}
						<View className="bg-gray-100 rounded-full px-2 py-0.5">
							<Text className="text-xs text-gray-600">{recipe.cuisine}</Text>
						</View>

						{/* Difficulty */}
						<View
							className={`rounded-full px-2 py-0.5 ${getDifficultyColor(recipe.difficulty)}`}
						>
							<Text className="text-xs capitalize">{recipe.difficulty}</Text>
						</View>
					</View>
				</View>
			</View>
		</TouchableOpacity>
	);
}
