import React from "react";
import { View, Text, TouchableOpacity } from "react-native";
import { Ionicons } from "@expo/vector-icons";

interface TabNavigationProps {
  selectedTab: "favorites" | "cooked" | "browse";
  onTabChange: (tab: "favorites" | "cooked" | "browse") => void;
}

export function TabNavigation({ selectedTab, onTabChange }: TabNavigationProps) {
  const renderTabButton = (
    tab: "favorites" | "cooked" | "browse",
    label: string,
    icon: string
  ) => (
    <TouchableOpacity
      onPress={() => onTabChange(tab)}
      className={`flex-1 py-3 ${selectedTab === tab ? "border-b-2 border-pink-500" : ""}`}
    >
      <View className="items-center">
        <Ionicons
          name={icon as any}
          size={24}
          color={selectedTab === tab ? "#EC4899" : "#6B7280"}
        />
        <Text
          className={`text-sm mt-1 ${selectedTab === tab ? "text-pink-500 font-semibold" : "text-gray-500"}`}
        >
          {label}
        </Text>
      </View>
    </TouchableOpacity>
  );

  return (
    <View className="flex-row">
      {renderTabButton("favorites", "Your Favorites", "heart")}
      {renderTabButton("cooked", "Recently Cooked", "checkmark-circle")}
      {renderTabButton("browse", "Browse All", "search")}
    </View>
  );
}