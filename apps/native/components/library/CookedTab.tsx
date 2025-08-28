import React from "react";
import { View, Text } from "react-native";
import { Ionicons } from "@expo/vector-icons";

export function CookedTab() {
  return (
    <View className="flex-1 items-center justify-center p-4">
      <Ionicons name="restaurant-outline" size={64} color="#9CA3AF" />
      <Text className="text-gray-500 text-lg font-semibold mt-4">
        Coming Soon
      </Text>
      <Text className="text-gray-400 text-sm mt-2 text-center">
        Track the recipes you've cooked and rate them!
      </Text>
    </View>
  );
}