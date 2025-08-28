import React from "react";
import {
  ActivityIndicator,
  RefreshControl,
  ScrollView,
  Text,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useMatchesData } from "@/hooks/useMatchesData";
import { MatchesList } from "@/components/matches/MatchesList";
import { NewMatchAlert } from "@/components/matches/NewMatchAlert";

export default function MatchesScreen() {
  const {
    matches,
    total,
    hasMore,
    isLoading,
    refreshing,
    newMatchAlert,
    onRefresh,
  } = useMatchesData();

  if (isLoading) {
    return (
      <SafeAreaView className="flex-1 bg-gray-50">
        <View className="flex-1 items-center justify-center">
          <ActivityIndicator size="large" color="#FF6B6B" />
          <Text className="text-gray-600 mt-2">Loading matches...</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView className="flex-1 bg-gray-50">
      <NewMatchAlert visible={newMatchAlert} />

      <ScrollView
        className="flex-1"
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
      >
        <View className="p-4">
          <Text className="text-2xl font-bold text-gray-800 mb-4">
            Your Matches 💕
          </Text>

          <MatchesList
            matches={matches}
            total={total}
            hasMore={hasMore}
            onMatchPress={(match) => {
              // Navigate to match detail screen
              // This will be implemented when navigation is set up
            }}
            onLoadMore={() => {
              // Implement load more functionality
            }}
          />
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}