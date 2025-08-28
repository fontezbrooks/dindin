import { useCallback, useEffect, useMemo, useState } from "react";
import { trpc } from "@/utils/trpc";
import { getWebSocketManager } from "@/utils/websocket-manager";

interface LibraryFilters {
  cuisine?: string;
  difficulty?: string;
  maxCookTime?: number;
}

interface UseLibraryDataProps {
  selectedTab: "favorites" | "cooked" | "browse";
  searchQuery: string;
  filters: LibraryFilters;
  limit?: number;
}

export function useLibraryData({ 
  selectedTab, 
  searchQuery, 
  filters,
  limit = 20 
}: UseLibraryDataProps) {
  const [offset, setOffset] = useState(0);
  const wsManager = getWebSocketManager();

  // Fetch user favorites with filters
  const {
    data: favoritesData,
    isLoading,
    isRefetching,
    refetch,
  } = trpc.recipe.getUserFavorites.useQuery(
    {
      limit,
      offset,
      sortBy: "newest",
      filterBy: {
        cuisine: filters.cuisine,
        difficulty: filters.difficulty as "easy" | "medium" | "hard" | undefined,
        maxCookTime: filters.maxCookTime,
      },
    },
    {
      enabled: selectedTab === "favorites",
      staleTime: 30 * 1000, // 30 seconds
    }
  );

  // Filter recipes based on search query
  const filteredRecipes = useMemo(() => {
    if (!favoritesData?.recipes) return [];
    if (!searchQuery) return favoritesData.recipes;

    const query = searchQuery.toLowerCase();
    return favoritesData.recipes.filter((recipe) => {
      // Check title
      if (recipe.title.toLowerCase().includes(query)) return true;

      // Check cuisine (handle both string and array)
      if (Array.isArray(recipe.cuisine)) {
        if (recipe.cuisine.some((c) => c.toLowerCase().includes(query)))
          return true;
      } else if (typeof recipe.cuisine === "string") {
        if (recipe.cuisine.toLowerCase().includes(query)) return true;
      }

      // Check tags
      if (recipe.tags?.some((tag) => tag.toLowerCase().includes(query)))
        return true;

      return false;
    });
  }, [favoritesData?.recipes, searchQuery]);

  // Listen for real-time updates when new recipes are liked
  useEffect(() => {
    const handleNewMatch = () => {
      refetch();
    };

    const handlePartnerSwiping = (data: any) => {
      if (data.payload.action === "liked") {
        refetch(); // Refetch to potentially show new matches
      }
    };

    wsManager.on("newMatch", handleNewMatch);
    wsManager.on("partnerSwiping", handlePartnerSwiping);

    return () => {
      wsManager.off("newMatch", handleNewMatch);
      wsManager.off("partnerSwiping", handlePartnerSwiping);
    };
  }, [refetch, wsManager]);

  const handleRefresh = useCallback(() => {
    setOffset(0);
    refetch();
  }, [refetch]);

  const handleLoadMore = useCallback(() => {
    if (favoritesData?.hasMore && !isLoading) {
      setOffset((prev) => prev + limit);
    }
  }, [favoritesData?.hasMore, isLoading, limit]);

  const resetOffset = useCallback(() => {
    setOffset(0);
  }, []);

  return {
    recipes: filteredRecipes,
    isLoading,
    isRefetching,
    hasMore: favoritesData?.hasMore || false,
    handleRefresh,
    handleLoadMore,
    resetOffset,
    refetch,
  };
}