import React from "react";
import { View } from "react-native";
import { GestureDetector } from "react-native-gesture-handler";
import Animated from "react-native-reanimated";
import { RecipeCard } from "@/components/recipe-card";

interface SwipeCardCompatProps {
  recipe: any;
  style: any;
  gestureHandler?: any; // This will be a Gesture object now, not the old handler
  translateX: any;
  translateY: any;
  isTop: boolean;
  enabled?: boolean;
}

// Compatibility wrapper for the existing swipe screen
export function SwipeCard({
  recipe,
  style,
  gestureHandler,
  translateX,
  translateY,
  isTop,
  enabled = true,
}: SwipeCardCompatProps) {
  const cardContent = (
    <Animated.View
      style={[
        style,
        {
          position: "absolute",
          top: 16,
          width: "90%",
          height: "75%",
          alignSelf: "center",
        },
      ]}
      pointerEvents={isTop ? "auto" : "none"}
    >
      <RecipeCard
        recipe={recipe}
        translateX={translateX}
        translateY={translateY}
        isTop={isTop}
      />
    </Animated.View>
  );

  // If we have a gesture handler and this is the top card, wrap with GestureDetector
  if (isTop && gestureHandler) {
    return (
      <GestureDetector gesture={gestureHandler}>
        {cardContent}
      </GestureDetector>
    );
  }

  return cardContent;
}