import React, { forwardRef, useCallback, useImperativeHandle, useMemo } from "react";
import { View, useWindowDimensions } from "react-native";
import { Gesture, GestureDetector } from "react-native-gesture-handler";
import Animated, {
  cancelAnimation,
  Extrapolation,
  interpolate,
  useAnimatedStyle,
  useDerivedValue,
  useSharedValue,
  withSpring,
  withTiming,
  SharedValue,
} from "react-native-reanimated";
import { scheduleOnRN } from "react-native-worklets";
import { RecipeCard } from "@/components/recipe-card";

export type SwipeCardRefType = {
  swipeRight: () => void;
  swipeLeft: () => void;
  reset: () => void;
};

interface SwipeCardProps {
  recipe: any;
  index: number;
  activeIndex: SharedValue<number>;
  onSwipeRight?: () => void;
  onSwipeLeft?: () => void;
  enabled?: boolean;
}

export const SwipeCard = forwardRef<SwipeCardRefType, SwipeCardProps>(
  ({ recipe, index, activeIndex, onSwipeLeft, onSwipeRight, enabled = true }, ref) => {
    const translateX = useSharedValue(0);
    const translateY = useSharedValue(0);
    const currentActiveIndex = useSharedValue(Math.floor(activeIndex.value));
    const nextActiveIndex = useSharedValue(Math.floor(activeIndex.value));

    const { width } = useWindowDimensions();
    const maxCardTranslation = width * 1.5;

    const swipeRight = useCallback(() => {
      onSwipeRight?.();
      translateX.value = withSpring(maxCardTranslation);
      activeIndex.value = activeIndex.value + 1;
    }, [activeIndex, maxCardTranslation, onSwipeRight, translateX]);

    const swipeLeft = useCallback(() => {
      onSwipeLeft?.();
      translateX.value = withSpring(-maxCardTranslation);
      activeIndex.value = activeIndex.value + 1;
    }, [activeIndex, maxCardTranslation, onSwipeLeft, translateX]);

    const reset = useCallback(() => {
      if (translateX.value !== 0) {
        cancelAnimation(translateX);
        translateX.value = withSpring(0);
      }
      if (translateY.value !== 0) {
        cancelAnimation(translateY);
        translateY.value = withSpring(0);
      }
    }, [translateX, translateY]);

    useImperativeHandle(ref, () => {
      return {
        swipeLeft,
        swipeRight,
        reset,
      };
    }, [swipeLeft, swipeRight, reset]);

    const inputRange = useMemo(() => {
      return [-width / 3, 0, width / 3];
    }, [width]);

    const rotate = useDerivedValue(() => {
      return interpolate(
        translateX.value,
        inputRange,
        [-Math.PI / 20, 0, Math.PI / 20],
        Extrapolation.CLAMP
      );
    }, [inputRange]);

    const gesture = Gesture.Pan()
      .enabled(enabled && currentActiveIndex.value === index)
      .onBegin(() => {
        currentActiveIndex.value = Math.floor(activeIndex.value);
      })
      .onUpdate((event) => {
        if (currentActiveIndex.value !== index) return;
        translateX.value = event.translationX;
        translateY.value = event.translationY;

        nextActiveIndex.value = interpolate(
          translateX.value,
          inputRange,
          [
            currentActiveIndex.value + 1,
            currentActiveIndex.value,
            currentActiveIndex.value + 1,
          ],
          Extrapolation.CLAMP
        );
      })
      .onFinalize((event) => {
        if (currentActiveIndex.value !== index) return;

        if (nextActiveIndex.value === activeIndex.value + 1) {
          const sign = Math.sign(event.translationX);
          if (sign === 1) {
            scheduleOnRN(swipeRight);
          } else {
            scheduleOnRN(swipeLeft);
          }
        } else {
          translateX.value = withSpring(0);
          translateY.value = withSpring(0);
        }
      });

    const rCardStyle = useAnimatedStyle(() => {
      const isActive = index - activeIndex.value < 5;
      const opacity = withTiming(isActive ? 1 : 0);
      const transY = withTiming((index - activeIndex.value) * 23);
      const scale = withTiming(1 - 0.07 * (index - activeIndex.value));

      return {
        opacity,
        transform: [
          { rotate: `${rotate.value}rad` },
          { translateY: transY },
          { scale: scale },
          { translateX: translateX.value },
          { translateY: translateY.value },
        ],
      };
    });

    return (
      <GestureDetector gesture={gesture}>
        <Animated.View
          style={[
            {
              position: "absolute",
              height: "75%",
              width: "90%",
              zIndex: -index,
              alignSelf: "center",
              top: 16,
            },
            rCardStyle,
          ]}
          pointerEvents={index === Math.floor(activeIndex.value) ? "auto" : "none"}
        >
          <View
            style={{
              flex: 1,
              borderRadius: 25,
              overflow: "hidden",
            }}
          >
            <RecipeCard
              recipe={recipe}
              translateX={translateX}
              translateY={translateY}
              isTop={index === Math.floor(activeIndex.value)}
            />
          </View>
        </Animated.View>
      </GestureDetector>
    );
  }
);

SwipeCard.displayName = "SwipeCard";
