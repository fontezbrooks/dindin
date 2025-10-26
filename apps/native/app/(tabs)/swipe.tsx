import React, { useState } from "react";
import { View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { MatchCelebration } from "@/components/match-celebration";
import { FeatureErrorBoundary } from "@/components/error-boundaries";
import { useSwipeLogic } from "@/hooks/useSwipeLogic";
import { useRecipeData } from "@/hooks/useRecipeData";
import { SwipeCard } from "@/components/swipe/SwipeCardCompat";
import { SwipeControls } from "@/components/swipe/SwipeControls";
import { SwipeHeader } from "@/components/swipe/SwipeHeader";
import { SwipeEmptyState } from "@/components/swipe/SwipeEmptyState";
import logger from "@/utils/logger";

function OptimizedSwipeScreen() {
  const [matchCelebration, setMatchCelebration] = useState<any>(null);
  const [showMatchModal, setShowMatchModal] = useState(false);

  const handleMatchCelebration = (match: any) => {
    setMatchCelebration(match);
    setShowMatchModal(true);
  };

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
  } = useSwipeLogic({ 
    recipes: undefined, // Will be passed from useRecipeData
    onMatchCelebration: handleMatchCelebration 
  });

  const {
    recipes,
    isLoading,
    refetch,
    isFetching,
  } = useRecipeData({ currentIndex });

  // Update the swipe logic with recipe data
  const swipeLogicWithData = useSwipeLogic({ 
    recipes, 
    onMatchCelebration: handleMatchCelebration 
  });

  const handleStartOver = () => {
    setCurrentIndex(0);
    refetch();
  };

  // Show empty states if needed
  if (isLoading || !recipes || recipes.length === 0 || currentIndex >= recipes.length) {
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
          {swipeLogicWithData.nextRecipe && (
            <SwipeCard
              recipe={swipeLogicWithData.nextRecipe}
              style={swipeLogicWithData.nextCardStyle}
              translateX={nextCardTranslateX}
              translateY={nextCardTranslateY}
              isTop={false}
            />
          )}

          {/* Current card (on top) */}
          {swipeLogicWithData.currentRecipe && (
            <SwipeCard
              recipe={swipeLogicWithData.currentRecipe}
              style={swipeLogicWithData.currentCardStyle}
              gestureHandler={swipeLogicWithData.gestureHandler}
              translateX={translateX}
              translateY={translateY}
              isTop={true}
              enabled={!isProcessing}
            />
          )}
        </View>

        {/* Action Buttons */}
        <SwipeControls
          onLike={() => swipeLogicWithData.handleButtonPress(true)}
          onPass={() => swipeLogicWithData.handleButtonPress(false)}
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
        logger.log('[SwipeScreen] Retrying after error');
      }}
    >
      <OptimizedSwipeScreen />
    </FeatureErrorBoundary>
  );
}