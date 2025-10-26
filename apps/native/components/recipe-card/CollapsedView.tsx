import React from "react";
import { Image, Pressable, Text, View } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import Animated from "react-native-reanimated";

interface CollapsedViewProps {
  recipe: {
    _id: string;
    title: string;
    description?: string;
    image_url: string;
    cook_time: number;
    prep_time?: number;
    difficulty: string;
    nutrition?: {
      calories?: number;
      protein?: number;
      fat?: number;
    };
  };
  isTop: boolean;
  isExpanded: boolean;
  likeOpacityStyle: any;
  nopeOpacityStyle: any;
  onToggleExpanded: () => void;
}

const getDifficultyColor = (difficulty: string) => {
  switch (difficulty.toLowerCase()) {
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

export const CollapsedView = React.memo<CollapsedViewProps>(({
  recipe,
  isTop,
  isExpanded,
  likeOpacityStyle,
  nopeOpacityStyle,
  onToggleExpanded,
}) => {
  return (
    <>
      {/* Image Section - 45% height */}
      <View className="h-[45%] relative">
        <Image
          source={{ uri: recipe.image_url }}
          className="w-full h-full rounded-t-3xl"
          resizeMode="cover"
        />

        {/* Info Button */}
        <Pressable
          onPress={onToggleExpanded}
          className="absolute bottom-4 right-4 w-10 h-10 bg-white/90 rounded-full items-center justify-center shadow-lg"
          accessibilityLabel="View recipe details"
          accessibilityRole="button"
          accessibilityHint="Double tap to expand recipe information"
        >
          <Ionicons
            name="information-circle-outline"
            size={24}
            color="#374151"
          />
        </Pressable>

        {/* Like/Nope Indicators */}
        {isTop && !isExpanded && (
          <>
            <Animated.View
              style={[likeOpacityStyle]}
              className="absolute top-8 left-8 px-6 py-3 bg-cyan-500 rounded-full"
            >
              <Text className="text-white text-2xl font-bold">LIKE</Text>
            </Animated.View>

            <Animated.View
              style={[nopeOpacityStyle]}
              className="absolute top-8 right-8 px-6 py-3 bg-red-500 rounded-full"
            >
              <Text className="text-white text-2xl font-bold">NOPE</Text>
            </Animated.View>
          </>
        )}
      </View>

      {/* Content Section - 55% height */}
      <View className="flex-1 p-5">
        {/* Title */}
        <Text
          className="text-xl font-bold text-gray-900 mb-2"
          numberOfLines={2}
          accessibilityRole="header"
        >
          {recipe.title}
        </Text>

        {/* Cook Time and Difficulty Row */}
        <View className="flex-row gap-2 mb-3">
          <View className="px-3 py-1.5 bg-gray-100 rounded-full">
            <Text className="text-gray-700 font-medium text-sm">
              ⏱ {recipe.cook_time + (recipe.prep_time || 0)} min
            </Text>
          </View>

          <View
            className={`px-3 py-1.5 rounded-full ${getDifficultyColor(recipe.difficulty)}`}
          >
            <Text className="font-medium capitalize text-sm">
              {recipe.difficulty}
            </Text>
          </View>
        </View>

        {/* Description */}
        {recipe.description && (
          <Text
            className="text-gray-600 text-sm mb-3"
            numberOfLines={3}
            accessibilityRole="text"
          >
            {recipe.description}
          </Text>
        )}

        {/* Nutrition Info - Only Calories, Protein, Fat */}
        {recipe.nutrition && (
          <View className="bg-gray-50 rounded-xl p-3" accessibilityRole="text">
            <Text className="text-gray-700 font-semibold text-sm mb-2">
              Nutrition per serving
            </Text>
            <View className="flex-row justify-between">
              <View className="items-center">
                <Text className="text-lg font-bold text-gray-900">
                  {recipe.nutrition.calories || "--"}
                </Text>
                <Text className="text-xs text-gray-600">Calories</Text>
              </View>
              <View className="w-px bg-gray-300" />
              <View className="items-center">
                <Text className="text-lg font-bold text-gray-900">
                  {recipe.nutrition.protein || "--"}g
                </Text>
                <Text className="text-xs text-gray-600">Protein</Text>
              </View>
              <View className="w-px bg-gray-300" />
              <View className="items-center">
                <Text className="text-lg font-bold text-gray-900">
                  {recipe.nutrition.fat || "--"}g
                </Text>
                <Text className="text-xs text-gray-600">Fat</Text>
              </View>
            </View>
          </View>
        )}
      </View>
    </>
  );
});

CollapsedView.displayName = "CollapsedView";