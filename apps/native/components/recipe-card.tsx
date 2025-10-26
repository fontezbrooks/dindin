import React, { useState, useCallback, useEffect } from "react";
import { Dimensions } from "react-native";
import Animated, {
  cancelAnimation,
  interpolate,
  type SharedValue,
  useAnimatedStyle,
  useSharedValue,
  withSpring,
} from "react-native-reanimated";

// Import extracted components
import { CollapsedView } from "./recipe-card/CollapsedView";
import { ExpandedView } from "./recipe-card/ExpandedView";

const { width: screenWidth } = Dimensions.get("window");

interface RecipeCardProps {
  recipe: {
    _id: string;
    title: string;
    description?: string;
    image_url: string;
    cook_time: number;
    prep_time?: number;
    difficulty: string;
    cuisine: string[];
    cuisine_type?: string;
    dietary_tags?: string[];
    servings: number;
    ingredients: Array<{ name: string; amount: string; unit?: string }>;
    instructions?: Array<{ step: number; description: string }>;
    nutrition?: {
      calories?: number;
      protein?: number;
      carbs?: number;
      fat?: number;
      fiber?: number;
      sugar?: number;
    };
    tags?: string[];
  };
  translateX: SharedValue<number>;
  translateY: SharedValue<number>;
  isTop: boolean;
}

// Memoized component for optimal performance
export const RecipeCard = React.memo<RecipeCardProps>(({
  recipe,
  translateX,
  translateY,
  isTop,
}) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const expandAnimation = useSharedValue(0);

  // Cleanup animations on unmount to prevent memory leaks
  useEffect(() => {
    return () => {
      cancelAnimation(expandAnimation);
    };
  }, [expandAnimation]);

  // Memoized animation style for the card
  const animatedStyle = useAnimatedStyle(() => {
    const rotate = interpolate(
      translateX.value,
      [-screenWidth / 2, 0, screenWidth / 2],
      [-15, 0, 15]
    );

    return {
      transform: [
        { translateX: translateX.value },
        { translateY: translateY.value },
        { rotate: `${rotate}deg` },
      ],
    };
  });

  // Memoized like indicator opacity
  const likeOpacityStyle = useAnimatedStyle(() => {
    return {
      opacity: interpolate(translateX.value, [0, screenWidth / 4], [0, 1]),
    };
  });

  // Memoized nope indicator opacity
  const nopeOpacityStyle = useAnimatedStyle(() => {
    return {
      opacity: interpolate(translateX.value, [-screenWidth / 4, 0], [1, 0]),
    };
  });

  // Memoized toggle function to prevent recreation
  const handleToggleExpanded = useCallback(() => {
    expandAnimation.value = withSpring(isExpanded ? 0 : 1);
    setIsExpanded((prev) => !prev);
  }, [isExpanded, expandAnimation]);

  return (
    <Animated.View
      style={[animatedStyle]}
      className="absolute w-[90vw] h-[70vh] bg-white rounded-3xl shadow-2xl"
    >
      {isExpanded ? (
        <ExpandedView
          recipe={recipe}
          onToggleExpanded={handleToggleExpanded}
        />
      ) : (
        <CollapsedView
          recipe={recipe}
          isTop={isTop}
          isExpanded={isExpanded}
          likeOpacityStyle={likeOpacityStyle}
          nopeOpacityStyle={nopeOpacityStyle}
          onToggleExpanded={handleToggleExpanded}
        />
      )}
    </Animated.View>
  );
});

RecipeCard.displayName = "RecipeCard";

// Default export for backward compatibility
export default RecipeCard;