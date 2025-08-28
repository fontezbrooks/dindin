import { useEffect } from "react";
import { Image } from "react-native";
import { trpc } from "@/utils/trpc";

interface UseRecipeDataProps {
  currentIndex: number;
}

export function useRecipeData({ currentIndex }: UseRecipeDataProps) {
  // Fetch recipe stack with optimized query
  const {
    data: recipes,
    isLoading,
    refetch,
    isFetching,
  } = trpc.recipe.getRecipeStack.useQuery(
    { limit: 10 },
    {
      staleTime: 5 * 60 * 1000, // 5 minutes
      cacheTime: 10 * 60 * 1000, // 10 minutes
      keepPreviousData: true,
      refetchOnWindowFocus: false,
      refetchOnReconnect: 'always',
    }
  );

  // Prefetch images for next recipes
  useEffect(() => {
    if (recipes && currentIndex < recipes.length - 2) {
      const nextImages = recipes
        .slice(currentIndex + 1, currentIndex + 3)
        .map(r => r.image_url);

      nextImages.forEach(url => {
        if (url) {
          Image.prefetch(url).catch(() => {
            // Silently fail for prefetch errors
          });
        }
      });
    }
  }, [currentIndex, recipes]);

  return {
    recipes,
    isLoading,
    refetch,
    isFetching,
  };
}