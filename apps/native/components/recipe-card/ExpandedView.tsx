import React from "react";
import { Image, Pressable, ScrollView, Text, View } from "react-native";
import { Ionicons } from "@expo/vector-icons";

interface ExpandedViewProps {
  recipe: {
    _id: string;
    title: string;
    description?: string;
    image_url: string;
    cook_time: number;
    prep_time?: number;
    difficulty: string;
    cuisine: string[];
    cuisine_type?: string;
    dietary_tags?: string[];
    servings: number;
    ingredients: Array<{
      name: string;
      amount: string;
      unit?: string;
    }>;
    instructions?: Array<{ step: number; description: string }>;
    nutrition?: {
      calories?: number;
      protein?: number;
      carbs?: number;
      fat?: number;
      fiber?: number;
      sugar?: number;
    };
    tags?: string[];
  };
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

export const ExpandedView = React.memo<ExpandedViewProps>(
  ({ recipe, onToggleExpanded }) => {
    return (
      <ScrollView className="flex-1" showsVerticalScrollIndicator={false}>
        {/* Header with Image */}
        <View className="h-[250px] relative">
          <Image
            source={{ uri: recipe.image_url }}
            className="w-full h-full"
            resizeMode="cover"
          />

          {/* Back Button */}
          <Pressable
            onPress={onToggleExpanded}
            className="absolute top-4 left-4 w-10 h-10 bg-white/90 rounded-full items-center justify-center shadow-lg"
            accessibilityLabel="Close recipe details"
            accessibilityRole="button"
            accessibilityHint="Double tap to close recipe information"
          >
            <Ionicons name="arrow-back" size={24} color="#374151" />
          </Pressable>
        </View>

        {/* Content */}
        <View className="p-5">
          {/* Title */}
          <Text
            className="text-2xl font-bold text-gray-900 mb-3"
            accessibilityRole="header"
          >
            {recipe.title}
          </Text>

          {/* Basic Info */}
          <View className="flex-row flex-wrap gap-2 mb-4">
            <View className="px-3 py-1.5 bg-gray-100 rounded-full">
              <Text className="text-gray-700 font-medium text-sm">
                ⏱ Total: {recipe.cook_time + (recipe.prep_time || 0)} min
              </Text>
            </View>

            {recipe.prep_time && recipe.prep_time > 0 && (
              <View className="px-3 py-1.5 bg-gray-100 rounded-full">
                <Text className="text-gray-700 font-medium text-sm">
                  Prep: {recipe.prep_time} min
                </Text>
              </View>
            )}

            <View
              className={`px-3 py-1.5 rounded-full ${getDifficultyColor(
                recipe.difficulty
              )}`}
            >
              <Text className="font-medium capitalize text-sm">
                {recipe.difficulty}
              </Text>
            </View>

            <View className="px-3 py-1.5 bg-gray-100 rounded-full">
              <Text className="text-gray-700 font-medium text-sm">
                👥 {recipe.servings} servings
              </Text>
            </View>
          </View>

          {/* Cuisine and Type */}
          {(recipe.cuisine.length > 0 || recipe.cuisine_type) && (
            <View className="flex-row flex-wrap gap-2 mb-4">
              {recipe.cuisine.map((c) => (
                <View key={c} className="px-3 py-1.5 bg-blue-100 rounded-full">
                  <Text className="text-blue-700 font-medium text-sm">{c}</Text>
                </View>
              ))}
              {recipe.cuisine_type && (
                <View className="px-3 py-1.5 bg-purple-100 rounded-full">
                  <Text className="text-purple-700 font-medium text-sm">
                    {recipe.cuisine_type}
                  </Text>
                </View>
              )}
            </View>
          )}

          {/* Dietary Tags */}
          {recipe.dietary_tags && recipe.dietary_tags.length > 0 && (
            <View className="flex-row flex-wrap gap-2 mb-4">
              {recipe.dietary_tags.map((tag) => (
                <View
                  key={tag}
                  className="px-3 py-1.5 bg-green-100 rounded-full"
                >
                  <Text className="text-green-700 text-sm font-medium capitalize">
                    {tag}
                  </Text>
                </View>
              ))}
            </View>
          )}

          {/* Description */}
          {recipe.description && (
            <View className="mb-4">
              <Text
                className="text-gray-600 text-sm leading-5"
                accessibilityRole="text"
              >
                {recipe.description}
              </Text>
            </View>
          )}

          {/* Full Nutrition Info */}
          {recipe.nutrition && (
            <View
              className="bg-gray-50 rounded-xl p-4 mb-4"
              accessibilityRole="text"
              accessibilityLabel="Nutrition information"
            >
              <Text className="text-gray-700 font-semibold text-base mb-3">
                Nutrition per serving
              </Text>
              <View className="flex-row flex-wrap">
                <View className="w-1/3 mb-3">
                  <Text className="text-lg font-bold text-gray-900">
                    {recipe.nutrition.calories || "--"}
                  </Text>
                  <Text className="text-xs text-gray-600">Calories</Text>
                </View>
                <View className="w-1/3 mb-3">
                  <Text className="text-lg font-bold text-gray-900">
                    {recipe.nutrition.protein || "--"}g
                  </Text>
                  <Text className="text-xs text-gray-600">Protein</Text>
                </View>
                <View className="w-1/3 mb-3">
                  <Text className="text-lg font-bold text-gray-900">
                    {recipe.nutrition.fat || "--"}g
                  </Text>
                  <Text className="text-xs text-gray-600">Fat</Text>
                </View>
                <View className="w-1/3">
                  <Text className="text-lg font-bold text-gray-900">
                    {recipe.nutrition.carbs || "--"}g
                  </Text>
                  <Text className="text-xs text-gray-600">Carbs</Text>
                </View>
                <View className="w-1/3">
                  <Text className="text-lg font-bold text-gray-900">
                    {recipe.nutrition.fiber || "--"}g
                  </Text>
                  <Text className="text-xs text-gray-600">Fiber</Text>
                </View>
                <View className="w-1/3">
                  <Text className="text-lg font-bold text-gray-900">
                    {recipe.nutrition.sugar || "--"}g
                  </Text>
                  <Text className="text-xs text-gray-600">Sugar</Text>
                </View>
              </View>
            </View>
          )}

          {/* Ingredients */}
          <View className="mb-4">
            <Text
              className="text-gray-900 font-semibold text-lg mb-3"
              accessibilityRole="header"
            >
              Ingredients ({recipe.ingredients.length})
            </Text>
            {recipe.ingredients.map((ingredient) => (
              <View
                key={ingredient.name}
                className="flex-row items-start mb-2"
                accessibilityRole="text"
              >
                <Text className="text-gray-400 mr-2">•</Text>
                <Text className="text-gray-700 flex-1">
                  <Text className="font-medium">{ingredient.amount}</Text>
                  {ingredient.unit && ` ${ingredient.unit}`} {ingredient.name}
                </Text>
              </View>
            ))}
          </View>

          {/* Instructions */}
          {recipe.instructions && recipe.instructions.length > 0 && (
            <View className="mb-4">
              <Text
                className="text-gray-900 font-semibold text-lg mb-3"
                accessibilityRole="header"
              >
                Instructions
              </Text>
              {recipe.instructions.map((instruction) => (
                <View
                  key={instruction.step}
                  className="flex-row items-start mb-3"
                  accessibilityRole="text"
                  accessibilityLabel={`Step ${instruction.step}: ${instruction.description}`}
                >
                  <View className="w-7 h-7 bg-pink-500 rounded-full items-center justify-center mr-3">
                    <Text className="text-white font-bold text-sm">
                      {instruction.step}
                    </Text>
                  </View>
                  <Text className="text-gray-700 flex-1 leading-5">
                    {instruction.description}
                  </Text>
                </View>
              ))}
            </View>
          )}

          {/* Tags */}
          {recipe.tags && recipe.tags.length > 0 && (
            <View className="mb-4">
              <Text
                className="text-gray-900 font-semibold text-base mb-2"
                accessibilityRole="header"
              >
                Tags
              </Text>
              <View className="flex-row flex-wrap gap-2">
                {recipe.tags.map((tag) => (
                  <View key={tag} className="px-2 py-1 bg-gray-100 rounded-md">
                    <Text className="text-gray-600 text-xs">{tag}</Text>
                  </View>
                ))}
              </View>
            </View>
          )}
        </View>
      </ScrollView>
    );
  }
);

ExpandedView.displayName = "ExpandedView";
