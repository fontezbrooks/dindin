import React, { useState, useRef, useEffect } from "react";
import { View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { MatchCelebration } from "@/components/match-celebration";
import { FeatureErrorBoundary } from "@/components/error-boundaries";
import { useSwipeLogic } from "@/hooks/useSwipeLogic";
import { useRecipeData } from "@/hooks/useRecipeData";
import { SwipeCard } from "@/components/swipe/SwipeCardCompat"; // TODO: Migrate to main SwipeCard after testing
import { SwipeControls } from "@/components/swipe/SwipeControls";
import { SwipeHeader } from "@/components/swipe/SwipeHeader";
import { SwipeEmptyState } from "@/components/swipe/SwipeEmptyState";
import logger from "@/utils/logger";

function OptimizedSwipeScreen() {
  const [matchCelebration, setMatchCelebration] = useState<any>(null);
  const [showMatchModal, setShowMatchModal] = useState(false);

  // Track processed match IDs to prevent duplicates
  const processedMatchesRef = useRef<Set<string>>(new Set());

  const handleMatchCelebration = (match: any) => {
    // Generate a unique match ID from recipe ID and timestamp
    const matchId = match?.recipe?._id || match?.recipe?.id;

    if (!matchId) {
      logger.warn("[SwipeScreen] Match celebration called without recipe ID");
      return;
    }

    // Check if we've already processed this match
    if (processedMatchesRef.current.has(matchId)) {
      logger.log(`[SwipeScreen] Duplicate match celebration prevented for recipe ${matchId}`);
      return;
    }

    // Mark this match as processed
    processedMatchesRef.current.add(matchId);

    // Clean up old match IDs if the set gets too large (keep last 20)
    if (processedMatchesRef.current.size > 20) {
      const matchArray = Array.from(processedMatchesRef.current);
      processedMatchesRef.current = new Set(matchArray.slice(-20));
    }

    setMatchCelebration(match);
    setShowMatchModal(true);
  };

  // Create a state for currentIndex that can be shared
  const [currentIndexState, setCurrentIndexState] = useState(0);

  // Get recipe data first
  const { recipes, isLoading, refetch, isFetching } = useRecipeData({
    currentIndex: currentIndexState,
  });

  // Single instance of useSwipeLogic with proper data
  const swipeLogic = useSwipeLogic({
    recipes: recipes || [], // Use empty array instead of undefined
    onMatchCelebration: handleMatchCelebration,
  });

  const {
    currentIndex,
    setCurrentIndex,
    currentRecipe,
    nextRecipe,
    isProcessing,
    gestureHandler,
    handleButtonPress,
    handleSwipe,
    currentCardStyle,
    nextCardStyle,
    translateX,
    translateY,
    nextCardTranslateX,
    nextCardTranslateY,
  } = swipeLogic;

  // Sync the currentIndex from swipeLogic to currentIndexState
  useEffect(() => {
    setCurrentIndexState(currentIndex);
  }, [currentIndex]);

  const handleStartOver = () => {
    setCurrentIndex(0);
    setCurrentIndexState(0); // Sync both index states
    // Clear processed matches when starting over
    processedMatchesRef.current.clear();
    refetch();
  };

  // Show empty states if needed
  if (
    isLoading ||
    !recipes ||
    recipes.length === 0 ||
    currentIndex >= recipes.length
  ) {
    return (
      <SwipeEmptyState
        isLoading={isLoading}
        hasRecipes={!!recipes && recipes.length > 0}
        currentIndex={currentIndex}
        recipesLength={recipes?.length || 0}
        onRefresh={refetch}
        onStartOver={handleStartOver}
      />
    );
  }

  return (
    <SafeAreaView className="flex-1 bg-gray-50">
      <View className="flex-1">
        <SwipeHeader />

        {/* Cards Container */}
        <View className="flex-1 items-center pt-4">
          {/* Next card (underneath) */}
          {nextRecipe && (
            <SwipeCard
              recipe={nextRecipe}
              style={nextCardStyle}
              translateX={nextCardTranslateX}
              translateY={nextCardTranslateY}
              isTop={false}
            />
          )}

          {/* Current card (on top) */}
          {currentRecipe && (
            <SwipeCard
              recipe={currentRecipe}
              style={currentCardStyle}
              gestureHandler={gestureHandler}
              translateX={translateX}
              translateY={translateY}
              isTop={true}
              enabled={!isProcessing}
            />
          )}
        </View>

        {/* Action Buttons */}
        <SwipeControls
          onLike={() => handleButtonPress(true)}
          onPass={() => handleButtonPress(false)}
          isProcessing={isProcessing}
        />
      </View>

      {/* Match Celebration Modal */}
      <MatchCelebration
        visible={showMatchModal}
        match={matchCelebration}
        onClose={() => {
          setShowMatchModal(false);
          setMatchCelebration(null);
          // Optional: Clear the specific match from the set after modal closes
          // This allows re-showing if user matches the same recipe in a different session
          const matchId = matchCelebration?.recipe?._id || matchCelebration?.recipe?.id;
          if (matchId) {
            setTimeout(() => {
              processedMatchesRef.current.delete(matchId);
            }, 5000); // Allow re-celebration after 5 seconds
          }
        }}
      />
    </SafeAreaView>
  );
}

export default function SwipeScreenWithErrorBoundary() {
  return (
    <FeatureErrorBoundary
      feature="swipe"
      onRetry={() => {
        logger.log("[SwipeScreen] Retrying after error");
      }}
    >
      <OptimizedSwipeScreen />
    </FeatureErrorBoundary>
  );
}
