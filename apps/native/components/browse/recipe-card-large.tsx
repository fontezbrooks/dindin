import { Ionicons } from "@expo/vector-icons";
import React, { useCallback, useState } from "react";
import {
	Dimensions,
	Image,
	Platform,
	Text,
	TouchableOpacity,
	View,
} from "react-native";

// Note: Install expo-linear-gradient: expo install expo-linear-gradient
// import { LinearGradient } from 'expo-linear-gradient';

// Temporary LinearGradient replacement
const LinearGradient = ({ colors, className, ...props }: any) => {
	return (
		<View
			className={className}
			style={{ backgroundColor: "rgba(0,0,0,0.2)" }}
			{...props}
		/>
	);
};

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

interface RecipeCardLargeProps {
	recipe: Recipe;
	onPress: () => void;
	onBookmarkPress?: () => void;
	style?: any;
}

const { width } = Dimensions.get("window");
const CARD_WIDTH = width - 32;

export default function RecipeCardLarge({
	recipe,
	onPress,
	onBookmarkPress,
	style,
}: RecipeCardLargeProps) {
	const [imageLoaded, setImageLoaded] = useState(false);
	const [imageError, setImageError] = useState(false);

	const handleImageLoad = useCallback(() => {
		setImageLoaded(true);
	}, []);

	const handleImageError = useCallback(() => {
		setImageError(true);
		setImageLoaded(true);
	}, []);

	const getDifficultyColor = () => {
		switch (recipe.difficulty) {
			case "easy":
				return "#10B981";
			case "medium":
				return "#F59E0B";
			case "hard":
				return "#EF4444";
			default:
				return "#6B7280";
		}
	};

	const formatCookTime = (minutes: number) => {
		if (minutes < 60) return `${minutes}m`;
		const hours = Math.floor(minutes / 60);
		const mins = minutes % 60;
		return mins > 0 ? `${hours}h ${mins}m` : `${hours}h`;
	};

	const cuisineText = Array.isArray(recipe.cuisine)
		? recipe.cuisine.slice(0, 2).join(", ")
		: recipe.cuisine;

	const renderStars = (rating: number) => {
		const stars = [];
		const fullStars = Math.floor(rating);
		const hasHalfStar = rating % 1 !== 0;

		for (let i = 0; i < 5; i++) {
			if (i < fullStars) {
				stars.push(<Ionicons key={i} name="star" size={14} color="#FCD34D" />);
			} else if (i === fullStars && hasHalfStar) {
				stars.push(
					<Ionicons key={i} name="star-half" size={14} color="#FCD34D" />,
				);
			} else {
				stars.push(
					<Ionicons key={i} name="star-outline" size={14} color="#D1D5DB" />,
				);
			}
		}
		return stars;
	};

	return (
		<TouchableOpacity
			onPress={onPress}
			style={[{ width: CARD_WIDTH }, style]}
			activeOpacity={0.95}
			className="bg-white rounded-2xl shadow-sm mb-4 overflow-hidden"
		>
			{/* Recipe Image */}
			<View className="relative">
				{!imageError ? (
					<>
						<Image
							source={{ uri: recipe.imageUrl }}
							className="w-full h-48"
							resizeMode="cover"
							onLoad={handleImageLoad}
							onError={handleImageError}
						/>
						{!imageLoaded && (
							<View className="absolute inset-0 bg-gray-200 items-center justify-center">
								<Ionicons name="image-outline" size={32} color="#9CA3AF" />
							</View>
						)}
					</>
				) : (
					<View className="w-full h-48 bg-gray-200 items-center justify-center">
						<Ionicons name="image-outline" size={48} color="#9CA3AF" />
						<Text className="text-gray-500 text-sm mt-2">
							Image unavailable
						</Text>
					</View>
				)}

				{/* Bookmark Button */}
				<TouchableOpacity
					onPress={(e) => {
						e.stopPropagation();
						onBookmarkPress?.();
					}}
					className="absolute top-3 right-3 bg-white/90 rounded-full p-2"
					hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
				>
					<Ionicons
						name={recipe.isBookmarked ? "bookmark" : "bookmark-outline"}
						size={20}
						color={recipe.isBookmarked ? "#EC4899" : "#6B7280"}
					/>
				</TouchableOpacity>

				{/* Difficulty Badge */}
				<View
					className="absolute top-3 left-3 px-2 py-1 rounded-full"
					style={{ backgroundColor: getDifficultyColor() }}
				>
					<Text className="text-white text-xs font-semibold capitalize">
						{recipe.difficulty}
					</Text>
				</View>

				{/* Gradient Overlay */}
				{imageLoaded && !imageError && (
					<LinearGradient
						colors={["transparent", "rgba(0,0,0,0.3)"]}
						className="absolute bottom-0 left-0 right-0 h-16"
					/>
				)}
			</View>

			{/* Recipe Info */}
			<View className="p-4">
				{/* Title */}
				<Text
					className="text-lg font-bold text-gray-800 mb-1"
					numberOfLines={2}
				>
					{recipe.title}
				</Text>

				{/* Description */}
				{recipe.description && (
					<Text className="text-gray-600 text-sm mb-2" numberOfLines={2}>
						{recipe.description}
					</Text>
				)}

				{/* Rating */}
				{recipe.rating && (
					<View className="flex-row items-center mb-2">
						<View className="flex-row items-center mr-2">
							{renderStars(recipe.rating)}
						</View>
						<Text className="text-sm text-gray-600">
							{recipe.rating.toFixed(1)}
						</Text>
						{recipe.reviewCount && (
							<Text className="text-sm text-gray-500 ml-1">
								({recipe.reviewCount})
							</Text>
						)}
					</View>
				)}

				{/* Meta Info */}
				<View className="flex-row items-center justify-between mb-2">
					<View className="flex-row items-center flex-1">
						<View className="flex-row items-center mr-4">
							<Ionicons name="time-outline" size={16} color="#6B7280" />
							<Text className="text-gray-600 text-sm ml-1">
								{formatCookTime(recipe.cookTime)}
							</Text>
						</View>
						<View className="flex-row items-center flex-1">
							<Ionicons name="location-outline" size={16} color="#6B7280" />
							<Text className="text-gray-600 text-sm ml-1" numberOfLines={1}>
								{cuisineText}
							</Text>
						</View>
					</View>
				</View>

				{/* Tags */}
				{recipe.tags && recipe.tags.length > 0 && (
					<View className="flex-row flex-wrap gap-1">
						{recipe.tags.slice(0, 3).map((tag, index) => (
							<View key={index} className="bg-gray-100 px-2 py-1 rounded-full">
								<Text className="text-xs text-gray-600">{tag}</Text>
							</View>
						))}
						{recipe.tags.length > 3 && (
							<View className="bg-gray-100 px-2 py-1 rounded-full">
								<Text className="text-xs text-gray-600">
									+{recipe.tags.length - 3}
								</Text>
							</View>
						)}
					</View>
				)}
			</View>
		</TouchableOpacity>
	);
}
