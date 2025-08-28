import React from "react";
import { View } from "react-native";
import { PanGestureHandler } from "react-native-gesture-handler";
import Animated from "react-native-reanimated";
import { RecipeCard } from "@/components/recipe-card";

interface SwipeCardProps {
  recipe: any;
  style: any;
  gestureHandler?: any;
  translateX: any;
  translateY: any;
  isTop: boolean;
  enabled?: boolean;
}

export function SwipeCard({
  recipe,
  style,
  gestureHandler,
  translateX,
  translateY,
  isTop,
  enabled = true,
}: SwipeCardProps) {
  const cardContent = (
    <Animated.View
      style={[
        style,
        {
          position: 'absolute',
          top: 16,
          width: '90%',
          height: '75%',
          alignSelf: 'center',
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

  if (isTop && gestureHandler) {
    return (
      <PanGestureHandler
        onGestureEvent={gestureHandler}
        enabled={enabled}
      >
        {cardContent}
      </PanGestureHandler>
    );
  }

  return cardContent;
}