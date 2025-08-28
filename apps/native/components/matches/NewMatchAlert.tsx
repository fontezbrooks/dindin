import React from "react";
import { View, Text } from "react-native";

interface NewMatchAlertProps {
  visible: boolean;
}

export function NewMatchAlert({ visible }: NewMatchAlertProps) {
  if (!visible) return null;

  return (
    <View className="absolute top-10 left-4 right-4 bg-green-500 rounded-lg p-3 z-50">
      <Text className="text-white text-center font-semibold">
        🎉 New Match! You both liked a recipe!
      </Text>
    </View>
  );
}