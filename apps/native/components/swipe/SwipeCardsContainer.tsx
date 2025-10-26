import React, { useCallback, useRef } from "react";
import { StyleSheet, View } from "react-native";
import { AntDesign } from "@expo/vector-icons";
import { PressableScale } from "pressto";
import Animated, { FadeIn, FadeOut } from "react-native-reanimated";
import { SwipeCard } from "./SwipeCard";
import { useSwipeControls } from "./useSwipeControls";

interface SwipeCardsContainerProps {
  recipes: any[];
  onSwipeRight?: (recipe: any, index: number) => void;
  onSwipeLeft?: (recipe: any, index: number) => void;
  showControls?: boolean;
  containerStyle?: any;
  buttonsContainerStyle?: any;
}

export const SwipeCardsContainer: React.FC<SwipeCardsContainerProps> = ({
  recipes,
  onSwipeRight,
  onSwipeLeft,
  showControls = true,
  containerStyle,
  buttonsContainerStyle,
}) => {
  const { activeIndex, refs, swipeRight, swipeLeft, reset } = useSwipeControls({
    recipes,
    onSwipeRight,
    onSwipeLeft,
  });

  const likedCount = useRef(0);
  const dislikedCount = useRef(0);

  const onReset = useCallback(() => {
    likedCount.current = 0;
    dislikedCount.current = 0;
    reset();
  }, [reset]);

  const handleSwipeRight = useCallback(
    (index: number) => {
      return () => {
        likedCount.current += 1;
        if (onSwipeRight) {
          onSwipeRight(recipes[index], index);
        }
      };
    },
    [onSwipeRight, recipes]
  );

  const handleSwipeLeft = useCallback(
    (index: number) => {
      return () => {
        dislikedCount.current += 1;
        if (onSwipeLeft) {
          onSwipeLeft(recipes[index], index);
        }
      };
    },
    [onSwipeLeft, recipes]
  );

  return (
    <View style={[styles.container, containerStyle]}>
      <View style={{ flex: showControls ? 7 : 1 }}>
        <Animated.View
          style={{
            marginTop: 20,
            justifyContent: "center",
            alignItems: "center",
            flex: 1,
          }}
          entering={FadeIn}
          exiting={FadeOut}
        >
          {recipes.map((recipe, index) => (
            <SwipeCard
              key={`recipe-${index}-${recipe.id || index}`}
              index={index}
              activeIndex={activeIndex}
              recipe={recipe}
              ref={refs[index]}
              onSwipeRight={handleSwipeRight(index)}
              onSwipeLeft={handleSwipeLeft(index)}
            />
          ))}
        </Animated.View>
      </View>

      {showControls && (
        <View style={[styles.buttonsContainer, buttonsContainerStyle]}>
          <PressableScale style={styles.button} onPress={swipeLeft}>
            <AntDesign name="close" size={32} color="white" />
          </PressableScale>
          <PressableScale
            style={[styles.button, { height: 60, marginHorizontal: 10 }]}
            onPress={onReset}
          >
            <AntDesign name="reload" size={24} color="white" />
          </PressableScale>
          <PressableScale style={styles.button} onPress={swipeRight}>
            <AntDesign name="heart" size={32} color="white" />
          </PressableScale>
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  button: {
    alignItems: "center",
    aspectRatio: 1,
    backgroundColor: "#3A3D45",
    borderRadius: 40,
    height: 80,
    justifyContent: "center",
    marginHorizontal: 20,
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 5,
  },
  buttonsContainer: {
    alignItems: "center",
    flexDirection: "row",
    flex: 2,
    justifyContent: "center",
  },
  container: {
    backgroundColor: "#242831",
    flex: 1,
  },
});