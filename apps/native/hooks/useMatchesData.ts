import { useCallback, useEffect, useState } from "react";
import { trpc } from "@/utils/trpc";

export function useMatchesData() {
  const [refreshing, setRefreshing] = useState(false);
  const [newMatchAlert, setNewMatchAlert] = useState(false);

  // Fetch matches query
  const { data, isLoading, refetch } = trpc.recipe.getMatches.useQuery({
    status: "matched",
    limit: 20,
    offset: 0,
  });

  // Auto-refresh matches periodically as a fallback for real-time updates
  useEffect(() => {
    // Refresh every 30 seconds
    const interval = setInterval(() => {
      refetch();
    }, 30000);

    return () => clearInterval(interval);
  }, [refetch]);

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await refetch();
    setRefreshing(false);
  }, [refetch]);

  const showNewMatchAlert = useCallback(() => {
    setNewMatchAlert(true);
    setTimeout(() => setNewMatchAlert(false), 3000);
  }, []);

  return {
    matches: data?.matches || [],
    total: data?.total || 0,
    hasMore: data?.hasMore || false,
    isLoading,
    refreshing,
    newMatchAlert,
    onRefresh,
    refetch,
    showNewMatchAlert,
  };
}