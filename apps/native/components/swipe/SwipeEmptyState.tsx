import React from "react";
import { View, Text, Pressable, ActivityIndicator } from "react-native";
import { Ionicons } from "@expo/vector-icons";

interface SwipeEmptyStateProps {
  isLoading?: boolean;
  hasRecipes?: boolean;
  currentIndex?: number;
  recipesLength?: number;
  onRefresh?: () => void;
  onStartOver?: () => void;
}

export function SwipeEmptyState({
  isLoading,
  hasRecipes,
  currentIndex = 0,
  recipesLength = 0,
  onRefresh,
  onStartOver,
}: SwipeEmptyStateProps) {
  // Loading state
  if (isLoading) {
    return (
      <View className="flex-1 items-center justify-center bg-gray-50">
        <ActivityIndicator size="large" color="#FF6B6B" />
        <Text className="text-gray-600 mt-4">Loading recipes...</Text>
      </View>
    );
  }

  // Empty state
  if (!hasRecipes || recipesLength === 0) {
    return (
      <View className="flex-1 items-center justify-center bg-gray-50 px-8">
        <Ionicons name="restaurant-outline" size={80} color="#9CA3AF" />
        <Text className="text-xl font-bold text-gray-900 mt-4">
          No Recipes Available
        </Text>
        <Text className="text-gray-600 text-center mt-2">
          Check back later for new recipes to swipe through!
        </Text>
        {onRefresh && (
          <Pressable
            onPress={onRefresh}
            className="mt-6 px-6 py-3 bg-pink-500 rounded-full"
          >
            <Text className="text-white font-semibold">Refresh</Text>
          </Pressable>
        )}
      </View>
    );
  }

  // All caught up state
  if (currentIndex >= recipesLength) {
    return (
      <View className="flex-1 items-center justify-center bg-gray-50 px-8">
        <Ionicons name="checkmark-circle-outline" size={80} color="#10B981" />
        <Text className="text-xl font-bold text-gray-900 mt-4">
          All Caught Up!
        </Text>
        <Text className="text-gray-600 text-center mt-2">
          You've seen all available recipes. Check your matches or come back
          later!
        </Text>
        {onStartOver && (
          <Pressable
            onPress={onStartOver}
            className="mt-6 px-6 py-3 bg-pink-500 rounded-full"
          >
            <Text className="text-white font-semibold">Start Over</Text>
          </Pressable>
        )}
      </View>
    );
  }

  return null;
}