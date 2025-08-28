import React from "react";
import { View, Pressable } from "react-native";
import { Ionicons } from "@expo/vector-icons";

interface SwipeControlsProps {
  onLike: () => void;
  onPass: () => void;
  isProcessing: boolean;
}

export function SwipeControls({ onLike, onPass, isProcessing }: SwipeControlsProps) {
  return (
    <View className="flex-row justify-center gap-8 pb-8">
      <Pressable
        onPress={onPass}
        disabled={isProcessing}
        className="w-16 h-16 bg-white rounded-full items-center justify-center shadow-lg"
        style={{ opacity: isProcessing ? 0.5 : 1 }}
      >
        <Ionicons name="close" size={32} color="#EF4444" />
      </Pressable>

      <Pressable
        onPress={onLike}
        disabled={isProcessing}
        className="w-16 h-16 bg-white rounded-full items-center justify-center shadow-lg"
        style={{ opacity: isProcessing ? 0.5 : 1 }}
      >
        <Ionicons name="heart" size={32} color="#10B981" />
      </Pressable>
    </View>
  );
}