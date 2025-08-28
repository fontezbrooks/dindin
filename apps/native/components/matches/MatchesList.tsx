import React from "react";
import { View, Text, TouchableOpacity } from "react-native";
import { MatchCard } from "./MatchCard";
import logger from "@/utils/logger";

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

interface MatchesListProps {
  matches: Match[];
  total: number;
  hasMore: boolean;
  onMatchPress?: (match: Match) => void;
  onLoadMore?: () => void;
}

export function MatchesList({
  matches,
  total,
  hasMore,
  onMatchPress,
  onLoadMore,
}: MatchesListProps) {
  const handleMatchPress = (match: Match) => {
    logger.log("Match pressed:", match._id);
    onMatchPress?.(match);
  };

  if (matches.length === 0) {
    return (
      <>
        <View className="bg-white rounded-xl p-4 mb-3 shadow-sm">
          <Text className="text-lg font-semibold text-gray-800">
            No matches yet
          </Text>
          <Text className="text-gray-600 mt-1">
            Start swiping to find recipes you and your partner both love!
          </Text>
        </View>

        <Text className="text-gray-500 text-center mt-8">
          When you and your partner both like the same recipe, it will appear here
        </Text>
      </>
    );
  }

  return (
    <>
      <Text className="text-gray-600 mb-4">
        {total} {total === 1 ? "recipe" : "recipes"} you both love
      </Text>

      {matches.map((match) => (
        <MatchCard
          key={match._id}
          match={match}
          onPress={handleMatchPress}
        />
      ))}

      {hasMore && onLoadMore && (
        <TouchableOpacity onPress={onLoadMore} className="mt-4 py-3">
          <Text className="text-center text-blue-600 font-semibold">
            Load More
          </Text>
        </TouchableOpacity>
      )}
    </>
  );
}