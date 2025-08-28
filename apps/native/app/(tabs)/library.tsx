import React, { useState } from "react";
import { View, Text } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import BrowseAllRecipes from "@/components/browse/browse-all-recipes";
import RecipeGrid from "@/components/recipe-grid";
import { useLibraryData } from "@/hooks/useLibraryData";
import { useRecipeHandlers } from "@/hooks/useRecipeHandlers";
import { TabNavigation } from "@/components/library/TabNavigation";
import { RecipeDetailModal } from "@/components/library/RecipeDetailModal";
import { CookedTab } from "@/components/library/CookedTab";

interface LibraryFilters {
  cuisine?: string;
  difficulty?: string;
  maxCookTime?: number;
}

export default function LibraryScreen() {
  const [selectedTab, setSelectedTab] = useState<"favorites" | "cooked" | "browse">("favorites");
  const [searchQuery, setSearchQuery] = useState("");
  const [filters, setFilters] = useState<LibraryFilters>({
    cuisine: undefined,
    difficulty: undefined,
    maxCookTime: undefined,
  });

  const {
    recipes,
    isLoading,
    isRefetching,
    hasMore,
    handleRefresh,
    handleLoadMore,
  } = useLibraryData({
    selectedTab,
    searchQuery,
    filters,
  });

  const {
    selectedRecipe,
    showRecipeModal,
    handleRecipePress,
    handleRecipeLongPress,
    handleStartCooking,
    handleShareRecipe,
    closeModal,
  } = useRecipeHandlers();

  const transformedRecipes = recipes.map((r) => ({
    ...r,
    id: r._id || r.id,
    cookTime: r.cook_time || r.cookTime,
    cuisine: Array.isArray(r.cuisine) ? r.cuisine[0] : r.cuisine,
    isMatched: false, // TODO: Check if partner also liked
  }));

  return (
    <SafeAreaView className="flex-1 bg-gray-50">
      {/* Header */}
      <View className="bg-white shadow-sm">
        <Text className="text-2xl font-bold text-gray-800 px-4 pt-4 pb-2">
          Recipe Library 📚
        </Text>
        <TabNavigation selectedTab={selectedTab} onTabChange={setSelectedTab} />
      </View>

      {/* Content */}
      {selectedTab === "favorites" && (
        <RecipeGrid
          recipes={transformedRecipes}
          isLoading={isLoading}
          isRefreshing={isRefetching}
          hasMore={hasMore}
          onRefresh={handleRefresh}
          onLoadMore={handleLoadMore}
          onRecipePress={handleRecipePress}
          onRecipeLongPress={handleRecipeLongPress}
          searchQuery={searchQuery}
          onSearchChange={setSearchQuery}
          filters={filters}
          onFilterChange={setFilters}
        />
      )}

      {selectedTab === "cooked" && <CookedTab />}

      {selectedTab === "browse" && <BrowseAllRecipes />}

      {/* Recipe Detail Modal */}
      <RecipeDetailModal
        visible={showRecipeModal}
        recipe={selectedRecipe}
        onClose={closeModal}
        onStartCooking={handleStartCooking}
        onShareRecipe={handleShareRecipe}
      />
    </SafeAreaView>
  );
}