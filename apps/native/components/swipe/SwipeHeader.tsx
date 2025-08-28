import React from "react";
import { View, Text } from "react-native";

export function SwipeHeader() {
  return (
    <View className="px-6 py-4">
      <Text className="text-3xl font-bold text-gray-900">Discover</Text>
      <Text className="text-gray-600 mt-1">
        Swipe to find recipes you both love
      </Text>
    </View>
  );
}