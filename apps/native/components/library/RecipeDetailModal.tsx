import React from "react";
import {
  Modal,
  ScrollView,
  View,
  Text,
  Image,
  TouchableOpacity,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";

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
}

interface RecipeDetailModalProps {
  visible: boolean;
  recipe: RecipeDetail | null;
  onClose: () => void;
  onStartCooking?: (recipe: RecipeDetail) => void;
  onShareRecipe?: (recipe: RecipeDetail) => void;
}

export function RecipeDetailModal({
  visible,
  recipe,
  onClose,
  onStartCooking,
  onShareRecipe,
}: RecipeDetailModalProps) {
  if (!recipe) return null;

  const getDifficultyColors = (difficulty: string) => {
    switch (difficulty) {
      case "easy":
        return { bg: "bg-green-100", text: "text-green-700" };
      case "medium":
        return { bg: "bg-yellow-100", text: "text-yellow-700" };
      case "hard":
        return { bg: "bg-red-100", text: "text-red-700" };
      default:
        return { bg: "bg-gray-100", text: "text-gray-700" };
    }
  };

  const difficultyColors = getDifficultyColors(recipe.difficulty);

  return (
    <Modal
      visible={visible}
      animationType="slide"
      presentationStyle="pageSheet"
      onRequestClose={onClose}
    >
      <SafeAreaView className="flex-1 bg-white">
        <ScrollView className="flex-1">
          {/* Modal Header */}
          <View className="flex-row justify-between items-center p-4 border-b border-gray-200">
            <Text className="text-xl font-bold text-gray-800">
              Recipe Details
            </Text>
            <TouchableOpacity onPress={onClose}>
              <Ionicons name="close" size={28} color="#6B7280" />
            </TouchableOpacity>
          </View>

          {/* Recipe Image */}
          <Image
            source={{ uri: recipe.imageUrl }}
            className="w-full h-64"
            resizeMode="cover"
          />

          {/* Recipe Info */}
          <View className="p-4">
            <Text className="text-2xl font-bold text-gray-800 mb-2">
              {recipe.title}
            </Text>

            {/* Meta Info */}
            <View className="flex-row flex-wrap gap-2 mb-4">
              <View className="bg-gray-100 rounded-full px-3 py-1">
                <Text className="text-sm text-gray-600">
                  {Array.isArray(recipe.cuisine)
                    ? recipe.cuisine.join(", ")
                    : recipe.cuisine}
                </Text>
              </View>
              <View className="bg-gray-100 rounded-full px-3 py-1 flex-row items-center">
                <Ionicons name="time-outline" size={16} color="#6B7280" />
                <Text className="text-sm text-gray-600 ml-1">
                  {recipe.cookTime}m
                </Text>
              </View>
              <View className={`rounded-full px-3 py-1 ${difficultyColors.bg}`}>
                <Text className={`text-sm capitalize ${difficultyColors.text}`}>
                  {recipe.difficulty}
                </Text>
              </View>
            </View>

            {/* Description */}
            {recipe.description && (
              <Text className="text-gray-600 mb-4">{recipe.description}</Text>
            )}

            {/* Ingredients */}
            <Text className="text-lg font-semibold text-gray-800 mb-2">
              Ingredients
            </Text>
            {recipe.ingredients?.map((ingredient, index) => (
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
            {recipe.steps?.map((step, index) => (
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
              <TouchableOpacity
                onPress={() => onStartCooking?.(recipe)}
                className="flex-1 bg-pink-500 rounded-xl py-3 items-center"
              >
                <Text className="text-white font-semibold">Start Cooking</Text>
              </TouchableOpacity>
              <TouchableOpacity
                onPress={() => onShareRecipe?.(recipe)}
                className="flex-1 bg-gray-200 rounded-xl py-3 items-center"
              >
                <Text className="text-gray-700 font-semibold">Share Recipe</Text>
              </TouchableOpacity>
            </View>
          </View>
        </ScrollView>
      </SafeAreaView>
    </Modal>
  );
}