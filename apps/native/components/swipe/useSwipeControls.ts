import { createRef, useCallback, useEffect, useMemo, useRef } from "react";
import { useSharedValue } from "react-native-reanimated";

export type SwipeableCardRefType = {
  swipeRight: () => void;
  swipeLeft: () => void;
  reset: () => void;
};

interface UseSwipeControlsProps {
  recipes: any[];
  onSwipeRight?: (recipe: any, index: number) => void;
  onSwipeLeft?: (recipe: any, index: number) => void;
}

export const useSwipeControls = ({ recipes, onSwipeRight, onSwipeLeft }: UseSwipeControlsProps) => {
  const activeIndex = useSharedValue(0);

  const refs = useMemo(() => {
    const pendingRefs = [];
    for (let i = 0; i < recipes.length; i++) {
      pendingRefs.push(createRef<SwipeableCardRefType>());
    }
    return pendingRefs;
  }, [recipes.length]);

  const swipeRight = useCallback(() => {
    const currentIndex = Math.floor(activeIndex.value);
    if (!refs[currentIndex] || currentIndex >= recipes.length) {
      return;
    }

    // Call the callback with the current recipe
    if (onSwipeRight) {
      onSwipeRight(recipes[currentIndex], currentIndex);
    }

    refs[currentIndex].current?.swipeRight();
  }, [activeIndex.value, refs, recipes, onSwipeRight]);

  const swipeLeft = useCallback(() => {
    const currentIndex = Math.floor(activeIndex.value);
    if (!refs[currentIndex] || currentIndex >= recipes.length) {
      return;
    }

    // Call the callback with the current recipe
    if (onSwipeLeft) {
      onSwipeLeft(recipes[currentIndex], currentIndex);
    }

    refs[currentIndex].current?.swipeLeft();
  }, [activeIndex.value, refs, recipes, onSwipeLeft]);

  const timeouts = useRef<NodeJS.Timeout[]>([]);

  const reset = useCallback(() => {
    // Clear any existing timeouts
    timeouts.current.forEach((timeout) => {
      clearTimeout(timeout);
    });
    timeouts.current = [];

    // Reset active index
    activeIndex.value = 0;

    // Reset all cards in the opposite direction with a delay
    refs.forEach((ref, index) => {
      timeouts.current.push(
        setTimeout(() => {
          ref.current?.reset();
        }, index * 100)
      );
    });
  }, [refs, activeIndex]);

  useEffect(() => {
    return () => {
      // Clear all timeouts on unmount
      timeouts.current.forEach((timeout) => {
        clearTimeout(timeout);
      });
    };
  }, []);

  return {
    activeIndex,
    refs,
    swipeRight,
    swipeLeft,
    reset,
  };
};