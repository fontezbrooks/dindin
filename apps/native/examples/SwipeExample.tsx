import React from "react";
import { View, Text, StyleSheet } from "react-native";
import { SwipeCardsContainer } from "@/components/swipe";

// Example recipe data structure
const sampleRecipes = [
  {
    id: "1",
    name: "Spaghetti Carbonara",
    image: require("../assets/images/react-logo.png"), // Replace with your recipe images
    description: "Classic Italian pasta dish",
    cookTime: "30 min",
    difficulty: "Medium",
    ingredients: ["Pasta", "Eggs", "Bacon", "Parmesan"],
  },
  {
    id: "2",
    name: "Chicken Tikka Masala",
    image: require("../assets/images/react-logo.png"),
    description: "Creamy Indian curry",
    cookTime: "45 min",
    difficulty: "Medium",
    ingredients: ["Chicken", "Yogurt", "Tomatoes", "Spices"],
  },
  {
    id: "3",
    name: "Caesar Salad",
    image: require("../assets/images/react-logo.png"),
    description: "Fresh and crispy salad",
    cookTime: "15 min",
    difficulty: "Easy",
    ingredients: ["Lettuce", "Croutons", "Parmesan", "Dressing"],
  },
  // Add more recipes as needed
];

export const SwipeExample = () => {
  const handleSwipeRight = (recipe: any, index: number) => {
    console.log("Liked recipe:", recipe.name, "at index:", index);
    // Handle like action - save to favorites, etc.
  };

  const handleSwipeLeft = (recipe: any, index: number) => {
    console.log("Disliked recipe:", recipe.name, "at index:", index);
    // Handle dislike action
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Swipe to Discover Recipes</Text>

      {/* Basic usage with controls */}
      <SwipeCardsContainer
        recipes={sampleRecipes}
        onSwipeRight={handleSwipeRight}
        onSwipeLeft={handleSwipeLeft}
        showControls={true}
      />

      {/* Alternative: Without controls (gesture-only) */}
      {/*
      <SwipeCardsContainer
        recipes={sampleRecipes}
        onSwipeRight={handleSwipeRight}
        onSwipeLeft={handleSwipeLeft}
        showControls={false}
      />
      */}

      {/* Alternative: With custom styling */}
      {/*
      <SwipeCardsContainer
        recipes={sampleRecipes}
        onSwipeRight={handleSwipeRight}
        onSwipeLeft={handleSwipeLeft}
        showControls={true}
        containerStyle={{ backgroundColor: "#1a1a1a" }}
        buttonsContainerStyle={{ paddingBottom: 20 }}
      />
      */}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#242831",
  },
  title: {
    fontSize: 24,
    fontWeight: "bold",
    color: "white",
    textAlign: "center",
    marginTop: 50,
    marginBottom: 20,
  },
});