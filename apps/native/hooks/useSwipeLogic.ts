import { useCallback, useEffect, useMemo, useState } from "react";
import { InteractionManager, Alert } from "react-native";
import {
  useAnimatedGestureHandler,
  useAnimatedStyle,
  useSharedValue,
  withDecay,
  withSpring,
  withTiming,
  interpolate,
  runOnJS,
} from "react-native-reanimated";
import {
  useMatchWebSocket,
  useWebSocket,
} from "@/components/providers/websocket-provider";
import { trpc } from "@/utils/trpc";
import { wsManager } from "@/utils/websocket-manager";
import logger from "@/utils/logger";

// Performance constants
const SWIPE_THRESHOLD = 120;
const VELOCITY_THRESHOLD = 800;
const ANIMATION_CONFIG = {
  damping: 15,
  stiffness: 100,
  mass: 1,
  overshootClamping: false,
  restDisplacementThreshold: 0.01,
  restSpeedThreshold: 0.01,
};

interface UseSwipeLogicProps {
  recipes?: any[];
  onMatchCelebration?: (match: any) => void;
}

export function useSwipeLogic({ recipes, onMatchCelebration }: UseSwipeLogicProps = {}) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isProcessing, setIsProcessing] = useState(false);

  // Animation values
  const translateX = useSharedValue(0);
  const translateY = useSharedValue(0);
  const scale = useSharedValue(1);
  const rotation = useSharedValue(0);

  // Next card animation values
  const nextCardScale = useSharedValue(0.95);
  const nextCardOpacity = useSharedValue(0.8);
  
  // Static values for next card (not animated)
  const nextCardTranslateX = useSharedValue(0);
  const nextCardTranslateY = useSharedValue(0);

  // WebSocket connection
  const { isConnected, sendPartnerActivity } = useWebSocket();

  // Like recipe mutation with optimistic updates
  const likeMutation = trpc.recipe.likeRecipe.useMutation({
    onMutate: async ({ recipeId, isLike }) => {
      logger.log(`Optimistically ${isLike ? 'liking' : 'passing'} recipe ${recipeId}`);
    },
    onSuccess: (data) => {
      if (data.matched && data.recipe && onMatchCelebration) {
        InteractionManager.runAfterInteractions(() => {
          onMatchCelebration({
            recipe: data.recipe,
            partner: { name: "Your Partner" },
          });
        });
      }
    },
    onError: (error) => {
      logger.error("Like mutation error:", error);
      InteractionManager.runAfterInteractions(() => {
        Alert.alert("Error", error.message);
      });
    },
    onSettled: () => {
      setIsProcessing(false);
    },
  });

  // Listen for real-time match notifications
  useMatchWebSocket((matchData) => {
    logger.log("Received match notification:", matchData);
    if (matchData && matchData.recipe && onMatchCelebration) {
      InteractionManager.runAfterInteractions(() => {
        onMatchCelebration({
          recipe: matchData.recipe,
          partner: { name: "Your Partner" },
        });
      });
    }
  });

  // Optimized partner activity listener
  useEffect(() => {
    const handlePartnerSwiping = (data: any) => {
      setTimeout(() => {
        logger.log("Partner is swiping:", data);
      }, 0);
    };

    wsManager.on("partnerSwiping", handlePartnerSwiping);
    return () => {
      wsManager.off("partnerSwiping", handlePartnerSwiping);
    };
  }, []);

  // Memoized current and next recipes
  const currentRecipe = useMemo(
    () => recipes?.[currentIndex],
    [recipes, currentIndex]
  );

  const nextRecipe = useMemo(
    () => recipes?.[currentIndex + 1],
    [recipes, currentIndex]
  );

  // Optimized swipe handler
  const handleSwipe = useCallback(
    (isLike: boolean, refetch?: () => void, isFetching?: boolean) => {
      if (!currentRecipe || isProcessing) return;

      setIsProcessing(true);
      setCurrentIndex((prev) => prev + 1);

      // Animate next card
      nextCardScale.value = withSpring(1, ANIMATION_CONFIG);
      nextCardOpacity.value = withSpring(1, ANIMATION_CONFIG);

      // Reset current card for reuse
      translateX.value = 0;
      translateY.value = 0;
      scale.value = 1;
      rotation.value = 0;

      // Defer heavy operations
      InteractionManager.runAfterInteractions(() => {
        // Send partner activity
        if (isConnected && currentRecipe) {
          sendPartnerActivity("swiping", {
            recipeId: currentRecipe._id,
            recipeTitle: currentRecipe.title,
            action: isLike ? "liked" : "passed",
          });
        }

        // Trigger mutation
        if (currentRecipe) {
          likeMutation.mutate({
            recipeId: currentRecipe._id,
            isLike,
          });
        }
      });

      // Prefetch more recipes when running low
      if (recipes && currentIndex >= recipes.length - 3 && !isFetching && refetch) {
        setTimeout(() => refetch(), 100);
      }
    },
    [
      currentRecipe,
      currentIndex,
      recipes,
      likeMutation,
      isConnected,
      sendPartnerActivity,
      isProcessing,
      nextCardScale,
      nextCardOpacity,
      translateX,
      translateY,
      scale,
      rotation,
    ]
  );

  // Optimized gesture handler with velocity support
  const gestureHandler = useAnimatedGestureHandler({
    onStart: (_, ctx: any) => {
      'worklet';
      ctx.startX = translateX.value;
      ctx.startY = translateY.value;
    },
    onActive: (event, ctx) => {
      'worklet';
      translateX.value = ctx.startX + event.translationX;
      translateY.value = ctx.startY + event.translationY;

      rotation.value = interpolate(
        translateX.value,
        [-300, 0, 300],
        [-15, 0, 15]
      );

      scale.value = interpolate(
        Math.abs(translateX.value),
        [0, 100],
        [1, 0.98]
      );

      nextCardScale.value = interpolate(
        Math.abs(translateX.value),
        [0, SWIPE_THRESHOLD],
        [0.95, 1]
      );

      nextCardOpacity.value = interpolate(
        Math.abs(translateX.value),
        [0, SWIPE_THRESHOLD],
        [0.8, 1]
      );
    },
    onEnd: (event) => {
      'worklet';
      const velocityX = event.velocityX;
      const velocityY = event.velocityY;
      const absVelocityX = Math.abs(velocityX);
      const absTranslateX = Math.abs(translateX.value);

      const shouldSwipe =
        absTranslateX > SWIPE_THRESHOLD ||
        absVelocityX > VELOCITY_THRESHOLD;

      if (shouldSwipe) {
        const isLike = translateX.value > 0;

        if (absVelocityX > VELOCITY_THRESHOLD) {
          translateX.value = withDecay(
            {
              velocity: velocityX,
              deceleration: 0.999,
              clamp: [isLike ? 300 : -500, isLike ? 500 : -300],
            },
            (finished) => {
              'worklet';
              if (finished) {
                runOnJS(handleSwipe)(isLike);
              }
            }
          );

          translateY.value = withDecay({
            velocity: velocityY,
            deceleration: 0.999,
          });
        } else {
          translateX.value = withSpring(
            isLike ? 400 : -400,
            ANIMATION_CONFIG,
            (finished) => {
              'worklet';
              if (finished) {
                runOnJS(handleSwipe)(isLike);
              }
            }
          );

          translateY.value = withSpring(0, ANIMATION_CONFIG);
        }

        scale.value = withTiming(0.8, { duration: 200 });
        rotation.value = withSpring(isLike ? 30 : -30, ANIMATION_CONFIG);
      } else {
        // Spring back to center
        translateX.value = withSpring(0, ANIMATION_CONFIG);
        translateY.value = withSpring(0, ANIMATION_CONFIG);
        rotation.value = withSpring(0, ANIMATION_CONFIG);
        scale.value = withSpring(1, ANIMATION_CONFIG);

        // Reset next card
        nextCardScale.value = withSpring(0.95, ANIMATION_CONFIG);
        nextCardOpacity.value = withSpring(0.8, ANIMATION_CONFIG);
      }
    },
  });

  // Button press handler
  const handleButtonPress = useCallback(
    (isLike: boolean) => {
      if (!currentRecipe || isProcessing) return;

      translateX.value = withSpring(
        isLike ? 400 : -400,
        ANIMATION_CONFIG,
        (finished) => {
          'worklet';
          if (finished) {
            runOnJS(handleSwipe)(isLike);
          }
        }
      );

      translateY.value = withSpring(-50, ANIMATION_CONFIG);
      rotation.value = withSpring(isLike ? 30 : -30, ANIMATION_CONFIG);
      scale.value = withTiming(0.8, { duration: 200 });
    },
    [currentRecipe, isProcessing, handleSwipe, translateX, translateY, rotation, scale]
  );

  // Animated styles for current card
  const currentCardStyle = useAnimatedStyle(() => ({
    transform: [
      { translateX: translateX.value },
      { translateY: translateY.value },
      { rotate: `${rotation.value}deg` },
      { scale: scale.value },
    ],
  }));

  // Animated styles for next card
  const nextCardStyle = useAnimatedStyle(() => ({
    transform: [
      { scale: nextCardScale.value },
    ],
    opacity: nextCardOpacity.value,
  }));

  return {
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
    scale,
    rotation,
    nextCardScale,
    nextCardOpacity,
    nextCardTranslateX,
    nextCardTranslateY,
  };
}