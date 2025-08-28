import React from "react";
import { View, Text, Image, TouchableOpacity } from "react-native";
import { Ionicons } from "@expo/vector-icons";

interface Match {
  _id: string;
  recipeId: {
    _id: string;
    title: string;
    imageUrl: string;
    cookTime: number;
    difficulty: string;
    cuisine: string;
  };
  status: string;
  matchedAt: string;
  cookDate?: string;
  ratings?: Array<{ userId: string; rating: number }>;
}

interface MatchCardProps {
  match: Match;
  onPress: (match: Match) => void;
}

export function MatchCard({ match, onPress }: MatchCardProps) {
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffTime = Math.abs(now.getTime() - date.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    if (diffDays === 0) return "Today";
    if (diffDays === 1) return "Yesterday";
    if (diffDays < 7) return `${diffDays} days ago`;
    return date.toLocaleDateString();
  };

  return (
    <TouchableOpacity
      onPress={() => onPress(match)}
      className="bg-white rounded-xl mb-3 shadow-sm overflow-hidden"
    >
      <View className="flex-row">
        <Image
          source={{ uri: match.recipeId.imageUrl }}
          className="w-24 h-24"
        />
        <View className="flex-1 p-3">
          <Text className="text-lg font-semibold text-gray-800">
            {match.recipeId.title}
          </Text>
          <View className="flex-row items-center mt-1">
            <Ionicons name="time-outline" size={14} color="#6B7280" />
            <Text className="text-gray-600 text-sm ml-1">
              {match.recipeId.cookTime} min
            </Text>
            <Text className="text-gray-400 mx-2">•</Text>
            <Text className="text-gray-600 text-sm">
              {match.recipeId.difficulty}
            </Text>
          </View>
          <Text className="text-gray-500 text-xs mt-2">
            Matched {formatDate(match.matchedAt)}
          </Text>
        </View>
        <View className="p-3">
          <Ionicons name="chevron-forward" size={20} color="#9CA3AF" />
        </View>
      </View>

      {match.status === "scheduled" && match.cookDate && (
        <View className="bg-blue-50 px-3 py-2 border-t border-gray-100">
          <Text className="text-blue-600 text-sm">
            <Ionicons name="calendar" size={14} /> Scheduled for{" "}
            {formatDate(match.cookDate)}
          </Text>
        </View>
      )}

      {match.status === "cooked" && (
        <View className="bg-green-50 px-3 py-2 border-t border-gray-100">
          <Text className="text-green-600 text-sm">
            <Ionicons name="checkmark-circle" size={14} /> Cooked!
          </Text>
        </View>
      )}
    </TouchableOpacity>
  );
}