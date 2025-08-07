import React, { useState, useEffect, useCallback } from 'react';
import { View, Text, Image, TouchableOpacity, Dimensions, StyleSheet, Alert, ActivityIndicator, ScrollView } from 'react-native';
import { Heart, X, User, Search, Flame, Star, Clock, Users, ArrowLeft, ChefHat, List } from 'lucide-react-native';
import { Gesture, GestureDetector } from 'react-native-gesture-handler';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
  withTiming,
  runOnJS,
  interpolate,
  Extrapolate,
  cancelAnimation,
  Easing,
} from 'react-native-reanimated';
import { useRecipeStore } from '../../stores/recipeStore';
import { useAuthStore } from '../../stores/authStore';

const { width: screenWidth, height: screenHeight } = Dimensions.get('window');

// Configuration constants
const SWIPE_THRESHOLD_X = screenWidth * 0.25; // 25% of screen width
const SWIPE_VELOCITY_THRESHOLD = 400; // Reduced for better sensitivity
const MAX_ROTATION = 20; // degrees

interface RecipeCardProps {
  recipe: any;
  isTopCard: boolean;
  onSwipeLeft: () => void;
  onSwipeRight: () => void;
  onShowMore: (recipe: any) => void;
  onFlipChange?: (isFlipped: boolean) => void;
}

const RecipeCard: React.FC<RecipeCardProps> = ({
  recipe,
  isTopCard,
  onSwipeLeft,
  onSwipeRight,
  onShowMore,
  onFlipChange
}) => {
  // Animated values
  const translateX = useSharedValue(0);
  const translateY = useSharedValue(0);
  const scale = useSharedValue(isTopCard ? 1 : 0.95);
  const opacity = useSharedValue(1);
  const flipRotation = useSharedValue(0);
  const [isFlipped, setIsFlipped] = useState(false);

  // Reset flip state when card changes or is no longer the top card
  useEffect(() => {
    if (!isTopCard && isFlipped) {
      setIsFlipped(false);
      flipRotation.value = 0;
    }
  }, [isTopCard, isFlipped, flipRotation]);

  // Logging helper that works in both worklet and JS contexts
  const log = useCallback((message: string, data?: any) => {
    console.log(`[RecipeCard ${recipe.id}] ${message}`, data || '');
  }, [recipe.id]);

  // Handle swipe completion
  const onSwipeComplete = useCallback((direction: 'left' | 'right') => {
    log(`Swipe completed: ${direction}`);

    // Call the appropriate callback
    if (direction === 'right') {
      onSwipeRight();
    } else {
      onSwipeLeft();
    }
  }, [onSwipeLeft, onSwipeRight, log]);

  // Animate the card off screen
  const animateCardOut = useCallback((velocityX: number) => {
    'worklet';
    const direction = velocityX > 0 ? 'right' : 'left';
    const finalX = direction === 'right' ? screenWidth + 200 : -screenWidth - 200;

    // Calculate duration based on velocity for natural feel
    const duration = Math.max(150, Math.min(300, Math.abs((finalX - translateX.value) / velocityX) * 1000));

    translateX.value = withTiming(finalX, { duration }, (finished) => {
      'worklet';
      if (finished) {
        runOnJS(onSwipeComplete)(direction);
      }
    });

    opacity.value = withTiming(0, { duration: duration * 0.8 });
    scale.value = withTiming(0.8, { duration });
  }, [onSwipeComplete]);

  // Reset card position
  const resetCard = useCallback(() => {
    'worklet';
    translateX.value = withSpring(0, {
      damping: 15,
      stiffness: 100,
      mass: 1,
    });
    translateY.value = withSpring(0, {
      damping: 15,
      stiffness: 100,
      mass: 1,
    });
  }, []);

  // Handle flip animation
  const handleFlip = useCallback(() => {
    const newRotation = isFlipped ? 0 : 180;
    const newFlippedState = !isFlipped;

    flipRotation.value = withTiming(newRotation, {
      duration: 600,
      easing: Easing.inOut(Easing.ease),
    });

    // Delay the state change to sync with the animation midpoint
    setTimeout(() => {
      setIsFlipped(newFlippedState);
      onFlipChange?.(newFlippedState);
    }, 300);
  }, [isFlipped, flipRotation, onFlipChange]);

  // Create pan gesture
  const gesture = Gesture.Pan()
    .enabled(isTopCard && !isFlipped) // Disable swipe when card is flipped
    .onBegin(() => {
      'worklet';
      // Cancel any ongoing animations
      cancelAnimation(translateX);
      cancelAnimation(translateY);
    })
    .onUpdate((event) => {
      'worklet';
      translateX.value = event.translationX;
      translateY.value = event.translationY * 0.5; // Reduce vertical movement
    })
    .onEnd((event) => {
      'worklet';
      const { translationX, velocityX } = event;

      // Check swipe threshold
      const shouldSwipe =
        Math.abs(translationX) > SWIPE_THRESHOLD_X ||
        Math.abs(velocityX) > SWIPE_VELOCITY_THRESHOLD;

      if (shouldSwipe) {
        // Use velocity to determine direction if ambiguous
        const effectiveVelocity = Math.abs(velocityX) > 100 ? velocityX :
          (translationX > 0 ? 500 : -500);
        animateCardOut(effectiveVelocity);
      } else {
        resetCard();
      }
    });

  // Card style
  const cardStyle = useAnimatedStyle(() => {
    const rotate = interpolate(
      translateX.value,
      [-screenWidth / 2, 0, screenWidth / 2],
      [-MAX_ROTATION, 0, MAX_ROTATION],
      Extrapolate.CLAMP
    );

    return {
      transform: [
        { translateX: translateX.value },
        { translateY: translateY.value },
        { rotate: `${rotate}deg` },
        { scale: scale.value },
      ],
      opacity: opacity.value,
    };
  });

  // Front side style
  const frontStyle = useAnimatedStyle(() => {
    const rotateY = flipRotation.value;
    return {
      backfaceVisibility: 'hidden',
      transform: [
        { rotateY: `${rotateY}deg` },
      ],
      opacity: rotateY > 90 ? 0 : 1,
    };
  });

  // Back side style
  const backStyle = useAnimatedStyle(() => {
    const rotateY = flipRotation.value;
    return {
      backfaceVisibility: 'hidden',
      transform: [
        { rotateY: `${rotateY - 180}deg` },
      ],
      opacity: rotateY > 90 ? 1 : 0,
    };
  });

  // Like overlay style
  const likeOverlayStyle = useAnimatedStyle(() => {
    const opacity = interpolate(
      translateX.value,
      [0, SWIPE_THRESHOLD_X],
      [0, 1],
      Extrapolate.CLAMP
    );
    return { opacity };
  });

  // Nope overlay style
  const nopeOverlayStyle = useAnimatedStyle(() => {
    const opacity = interpolate(
      translateX.value,
      [-SWIPE_THRESHOLD_X, 0],
      [1, 0],
      Extrapolate.CLAMP
    );
    return { opacity };
  });

  if (!isTopCard) {
    // Background card - no gestures, just display
    return (
      <Animated.View style={[styles.recipeCard, cardStyle]}>
        <Image
          source={{ uri: recipe.image }}
          style={styles.recipeImage}
          resizeMode="cover"
        />
        <View style={styles.recipeInfo}>
          <Text style={styles.recipeTitle}>{recipe.title}</Text>
        </View>
      </Animated.View>
    );
  }

  return (
    <GestureDetector gesture={gesture}>
      <Animated.View style={[styles.recipeCard, cardStyle]}>
        {/* Front of card */}
        <Animated.View style={[styles.cardSide, styles.cardFront, frontStyle]}>
          <Image
            source={{ uri: recipe.image }}
            style={styles.recipeImage}
            resizeMode="cover"
          />

          {/* Like Overlay */}
          <Animated.View style={[styles.overlay, styles.likeOverlay, likeOverlayStyle]}>
            <Text style={styles.overlayText}>LIKE</Text>
          </Animated.View>

          {/* Nope Overlay */}
          <Animated.View style={[styles.overlay, styles.nopeOverlay, nopeOverlayStyle]}>
            <Text style={styles.overlayText}>NOPE</Text>
          </Animated.View>

          <View style={styles.recipeInfo}>
            <View style={styles.recipeHeader}>
              <Text style={styles.recipeTitle}>{recipe.title}</Text>
              <View style={styles.ratingContainer}>
                <Star color="#f59e0b" fill="#f59e0b" size={16} />
                <Text style={styles.ratingText}>{recipe.rating}</Text>
              </View>
            </View>

            <Text style={styles.recipeDescription}>{recipe.description}</Text>

            <View style={styles.recipeMeta}>
              <View style={styles.metaItem}>
                <Clock color="#6b7280" size={14} />
                <Text style={styles.metaText}>{recipe.cookTime}</Text>
              </View>
              <Text style={styles.metaSeparator}>•</Text>
              <Text style={styles.metaText}>{recipe.difficulty}</Text>
              <Text style={styles.metaSeparator}>•</Text>
              <View style={styles.metaItem}>
                <Users color="#6b7280" size={14} />
                <Text style={styles.metaText}>{recipe.matches} matches</Text>
              </View>
            </View>

            <View style={styles.tagsContainer}>
              {recipe.tags.map((tag: string, index: number) => (
                <View key={index} style={styles.tag}>
                  <Text style={styles.tagText}>{tag}</Text>
                </View>
              ))}
            </View>

            <TouchableOpacity
              style={styles.showMoreButton}
              onPress={handleFlip}
            >
              <Text style={styles.showMoreText}>Show More</Text>
            </TouchableOpacity>
          </View>
        </Animated.View>

        {/* Back of card */}
        <Animated.View style={[styles.cardSide, styles.cardBack, backStyle]}>
          <View style={styles.cardBackHeader}>
            <TouchableOpacity style={styles.goBackButton} onPress={handleFlip}>
              <ArrowLeft color="#f97316" size={20} />
              <Text style={styles.goBackText}>Go Back</Text>
            </TouchableOpacity>
            <Text style={styles.cardBackTitle}>{recipe.title}</Text>
          </View>

          <ScrollView style={styles.cardBackContent} showsVerticalScrollIndicator={false}>
            {/* Ingredients Section */}
            <View style={styles.section}>
              <View style={styles.sectionHeader}>
                <List color="#f97316" size={20} />
                <Text style={styles.sectionTitle}>Ingredients</Text>
              </View>
              <View style={styles.ingredientsList}>
                {recipe.ingredients.map((ingredient: string, index: number) => (
                  <View key={index} style={styles.ingredientItem}>
                    <View style={styles.ingredientBullet} />
                    <Text style={styles.ingredientText}>{ingredient}</Text>
                  </View>
                ))}
              </View>
            </View>

            {/* Instructions Section */}
            <View style={styles.section}>
              <View style={styles.sectionHeader}>
                <ChefHat color="#f97316" size={20} />
                <Text style={styles.sectionTitle}>Instructions</Text>
              </View>
              <View style={styles.instructionsList}>
                <View style={styles.instructionStep}>
                  <View style={styles.stepNumber}>
                    <Text style={styles.stepNumberText}>1</Text>
                  </View>
                  <Text style={styles.instructionText}>
                    Prep all ingredients according to the list above. Make sure everything is measured and ready.
                  </Text>
                </View>
                <View style={styles.instructionStep}>
                  <View style={styles.stepNumber}>
                    <Text style={styles.stepNumberText}>2</Text>
                  </View>
                  <Text style={styles.instructionText}>
                    {recipe.description} Heat your cooking surface to the appropriate temperature.
                  </Text>
                </View>
                <View style={styles.instructionStep}>
                  <View style={styles.stepNumber}>
                    <Text style={styles.stepNumberText}>3</Text>
                  </View>
                  <Text style={styles.instructionText}>
                    Cook according to the recipe timing, stirring or flipping as needed for even cooking.
                  </Text>
                </View>
                <View style={styles.instructionStep}>
                  <View style={styles.stepNumber}>
                    <Text style={styles.stepNumberText}>4</Text>
                  </View>
                  <Text style={styles.instructionText}>
                    Season to taste and serve immediately while hot. Enjoy your delicious meal!
                  </Text>
                </View>
              </View>
            </View>

            {/* Additional Info */}
            <View style={styles.section}>
              <View style={styles.sectionHeader}>
                <Clock color="#f97316" size={20} />
                <Text style={styles.sectionTitle}>Cooking Info</Text>
              </View>
              <View style={styles.cookingInfo}>
                <View style={styles.infoItem}>
                  <Text style={styles.infoLabel}>Prep Time</Text>
                  <Text style={styles.infoValue}>10 mins</Text>
                </View>
                <View style={styles.infoItem}>
                  <Text style={styles.infoLabel}>Cook Time</Text>
                  <Text style={styles.infoValue}>{recipe.cookTime}</Text>
                </View>
                <View style={styles.infoItem}>
                  <Text style={styles.infoLabel}>Difficulty</Text>
                  <Text style={styles.infoValue}>{recipe.difficulty}</Text>
                </View>
                <View style={styles.infoItem}>
                  <Text style={styles.infoLabel}>Servings</Text>
                  <Text style={styles.infoValue}>2-4 people</Text>
                </View>
              </View>
            </View>
          </ScrollView>

          {/* Action Buttons for Card Back */}
          <View style={styles.cardBackActions}>
            <TouchableOpacity
              style={[styles.cardBackActionButton, styles.rejectButton]}
              onPress={onSwipeLeft}
            >
              <X color="#ef4444" size={24} />
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.cardBackActionButton, styles.likeButton]}
              onPress={onSwipeRight}
            >
              <Heart color="#10b981" fill="#10b981" size={24} />
            </TouchableOpacity>
          </View>
        </Animated.View>
      </Animated.View>
    </GestureDetector>
  );
};

export default function Home() {
  const { isAuthenticated } = useAuthStore();
  const {
    recipes,
    isLoading,
    isSwipeLoading,
    currentIndex,
    matches,
    lastMatch,
    loadRecipes,
    swipeRecipe,
    resetSwipes,
    setCurrentIndex
  } = useRecipeStore();

  const [isProcessing, setIsProcessing] = useState(false);
  const [isCardFlipped, setIsCardFlipped] = useState(false);

  // Load recipes on mount
  useEffect(() => {
    loadRecipes(isAuthenticated);
  }, [isAuthenticated]);

  // Reset flip state when current card changes
  useEffect(() => {
    setIsCardFlipped(false);
  }, [currentIndex]);

  // Show match notifications
  useEffect(() => {
    if (lastMatch) {
      Alert.alert(
        '🎉 It\'s a Match!',
        `You and ${lastMatch.partnerName} both love this recipe!`,
        [{ text: 'OK' }]
      );
    }
  }, [lastMatch]);

  const handleSwipeLeft = useCallback(async () => {
    if (isProcessing) return;

    const recipe = recipes[currentIndex];
    console.log('Swiped left on recipe:', recipe.id);

    if (!isAuthenticated) {
      Alert.alert('Sign In Required', 'Please sign in to record your preferences.');
      return;
    }

    setIsProcessing(true);
    const success = await swipeRecipe(recipe.id, 'left');
    if (success) {
      setCurrentIndex(currentIndex + 1);
    }
    setIsProcessing(false);
  }, [currentIndex, recipes, isAuthenticated, swipeRecipe, setCurrentIndex, isProcessing]);

  const handleSwipeRight = useCallback(async () => {
    if (isProcessing) return;

    const recipe = recipes[currentIndex];
    console.log('Swiped right on recipe:', recipe.id);

    if (!isAuthenticated) {
      Alert.alert('Sign In Required', 'Please sign in to match with others.');
      return;
    }

    setIsProcessing(true);
    const success = await swipeRecipe(recipe.id, 'right');
    if (success) {
      setCurrentIndex(currentIndex + 1);
    }
    setIsProcessing(false);
  }, [currentIndex, recipes, isAuthenticated, swipeRecipe, setCurrentIndex, isProcessing]);

  const handleShowMore = useCallback((recipe: any) => {
    // This is now handled by the flip animation
    console.log('Show more for recipe:', recipe.id);
  }, []);

  const handleFlipChange = useCallback((isFlipped: boolean) => {
    setIsCardFlipped(isFlipped);
  }, []);

  const handleResetSwipes = useCallback(() => {
    resetSwipes();
  }, [resetSwipes]);

  const currentRecipe = recipes[currentIndex];
  const nextRecipe = recipes[currentIndex + 1];

  if (isLoading) {
    return (
      <View style={styles.container}>
        <View style={styles.header}>
          <View style={styles.headerContent}>
            <TouchableOpacity style={styles.headerButton}>
              <User color="white" size={24} />
            </TouchableOpacity>

            <View style={styles.logoContainer}>
              <Flame color="white" size={24} />
              <Text style={styles.logoText}>DinDin</Text>
            </View>

            <TouchableOpacity style={styles.headerButton}>
              <Search color="white" size={24} />
            </TouchableOpacity>
          </View>
        </View>

        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#f97316" />
          <Text style={styles.loadingText}>Loading recipes...</Text>
        </View>
      </View>
    );
  }

  if (currentIndex >= recipes.length) {
    return (
      <View style={styles.container}>
        <View style={styles.header}>
          <View style={styles.headerContent}>
            <TouchableOpacity style={styles.headerButton}>
              <User color="white" size={24} />
            </TouchableOpacity>

            <View style={styles.logoContainer}>
              <Flame color="white" size={24} />
              <Text style={styles.logoText}>DinDin</Text>
            </View>

            <TouchableOpacity style={styles.headerButton}>
              <Search color="white" size={24} />
            </TouchableOpacity>
          </View>
        </View>

        {/* Match Summary Screen */}
        <View style={styles.summaryContainer}>
          <View style={styles.summaryCard}>
            <Flame color="#f97316" size={48} />
            <Text style={styles.summaryTitle}>Your Matches</Text>
            <Text style={styles.summarySubtitle}>
              You've matched with {matches.length} delicious recipes!
            </Text>

            <View style={styles.matchesList}>
              {matches.map((id) => {
                const recipe = recipes.find(r => r.id === id);
                return recipe ? (
                  <View key={id} style={styles.matchItem}>
                    <Image
                      source={{ uri: recipe.image }}
                      style={styles.matchImage}
                    />
                    <Text style={styles.matchTitle}>{recipe.title}</Text>
                  </View>
                ) : null;
              })}
            </View>

            <TouchableOpacity
              style={styles.resetButton}
              onPress={handleResetSwipes}
            >
              <Text style={styles.resetButtonText}>Swipe Again</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <View style={styles.headerContent}>
          <TouchableOpacity style={styles.headerButton}>
            <User color="white" size={24} />
          </TouchableOpacity>

          <View style={styles.logoContainer}>
            <Flame color="white" size={24} />
            <Text style={styles.logoText}>DinDin</Text>
          </View>

          <TouchableOpacity style={styles.headerButton}>
            <Search color="white" size={24} />
          </TouchableOpacity>
        </View>
      </View>

      {/* Main Content */}
      <View style={styles.mainContent}>
        <View style={styles.recipeContainer}>
          {/* Recipe Card Stack - render next card behind current */}
          {nextRecipe && (
            <RecipeCard
              key={nextRecipe.id}
              recipe={nextRecipe}
              isTopCard={false}
              onSwipeLeft={handleSwipeLeft}
              onSwipeRight={handleSwipeRight}
              onShowMore={handleShowMore}
            />
          )}
          {currentRecipe && (
            <RecipeCard
              key={currentRecipe.id}
              recipe={currentRecipe}
              isTopCard={true}
              onSwipeLeft={handleSwipeLeft}
              onSwipeRight={handleSwipeRight}
              onShowMore={handleShowMore}
              onFlipChange={handleFlipChange}
            />
          )}

          {/* Action Buttons - only show when card is not flipped */}
          {currentRecipe && !isCardFlipped && (
            <View style={styles.actionButtons}>
              <TouchableOpacity
                style={[styles.actionButton, (isSwipeLoading || isProcessing) && styles.actionButtonDisabled]}
                onPress={handleSwipeLeft}
                disabled={isSwipeLoading || isProcessing}
              >
                <X color="#ef4444" size={32} />
              </TouchableOpacity>

              <TouchableOpacity
                style={[styles.actionButton, (isSwipeLoading || isProcessing) && styles.actionButtonDisabled]}
                onPress={handleSwipeRight}
                disabled={isSwipeLoading || isProcessing}
              >
                <Heart color="#10b981" fill="#10b981" size={32} />
              </TouchableOpacity>
            </View>
          )}
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fef3c7',
  },
  header: {
    backgroundColor: '#f97316',
    paddingTop: 48,
    paddingBottom: 24,
    paddingHorizontal: 16,
  },
  headerContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  headerButton: {
    padding: 8,
  },
  logoContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  logoText: {
    color: 'white',
    fontSize: 20,
    fontWeight: 'bold',
    marginLeft: 8,
  },
  mainContent: {
    flex: 1,
    backgroundColor: '#fef3c7',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#fef3c7',
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    color: '#6b7280',
  },
  recipeContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 16,
    backgroundColor: '#fef3c7',
  },
  recipeCard: {
    position: 'absolute',
    width: screenWidth - 32,
    height: screenHeight - 250,
    borderRadius: 24,
    overflow: 'hidden',
    backgroundColor: 'white',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  cardSide: {
    position: 'absolute',
    width: '100%',
    height: '100%',
  },
  cardFront: {
    backgroundColor: 'transparent',
  },
  cardBack: {
    backgroundColor: 'white',
  },
  recipeImage: {
    width: '100%',
    height: '60%',
  },
  overlay: {
    position: 'absolute',
    top: 50,
    padding: 10,
    borderRadius: 10,
    borderWidth: 3,
    transform: [{ rotate: '-15deg' }],
  },
  likeOverlay: {
    right: 20,
    backgroundColor: '#10b981',
    borderColor: '#10b981',
  },
  nopeOverlay: {
    left: 20,
    backgroundColor: '#ef4444',
    borderColor: '#ef4444',
  },
  overlayText: {
    color: 'white',
    fontSize: 32,
    fontWeight: 'bold',
  },
  recipeInfo: {
    padding: 16,
    height: '40%',
  },
  recipeHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 8,
  },
  recipeTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#1f2937',
    flex: 1,
  },
  ratingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  ratingText: {
    color: '#374151',
    marginLeft: 4,
  },
  recipeDescription: {
    color: '#4b5563',
    marginBottom: 12,
    fontSize: 14,
  },
  recipeMeta: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  metaItem: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  metaText: {
    color: '#6b7280',
    fontSize: 14,
    marginLeft: 4,
  },
  metaSeparator: {
    color: '#9ca3af',
    marginHorizontal: 8,
  },
  tagsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginBottom: 12,
  },
  tag: {
    backgroundColor: '#fef3c7',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    marginRight: 6,
    marginBottom: 4,
  },
  tagText: {
    color: '#f97316',
    fontSize: 12,
    fontWeight: '500',
  },
  showMoreButton: {
    alignSelf: 'flex-start',
    paddingVertical: 6,
    paddingHorizontal: 12,
    backgroundColor: '#f97316',
    borderRadius: 16,
  },
  showMoreText: {
    color: 'white',
    fontSize: 12,
    fontWeight: '600',
  },
  // Card back styles
  cardBackHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#f3f4f6',
  },
  goBackButton: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 8,
  },
  goBackText: {
    color: '#f97316',
    fontSize: 14,
    fontWeight: '600',
    marginLeft: 4,
  },
  cardBackTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1f2937',
    flex: 1,
    textAlign: 'center',
    marginRight: 40, // Compensate for go back button
  },
  cardBackContent: {
    flex: 1,
    padding: 16,
  },
  section: {
    marginBottom: 24,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#1f2937',
    marginLeft: 8,
  },
  ingredientsList: {
    gap: 8,
  },
  ingredientItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
  },
  ingredientBullet: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: '#f97316',
    marginTop: 6,
    marginRight: 12,
  },
  ingredientText: {
    color: '#374151',
    fontSize: 14,
    flex: 1,
    lineHeight: 20,
  },
  instructionsList: {
    gap: 16,
  },
  instructionStep: {
    flexDirection: 'row',
    alignItems: 'flex-start',
  },
  stepNumber: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: '#f97316',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
    marginTop: 2,
  },
  stepNumberText: {
    color: 'white',
    fontSize: 12,
    fontWeight: 'bold',
  },
  instructionText: {
    color: '#374151',
    fontSize: 14,
    lineHeight: 20,
    flex: 1,
  },
  cookingInfo: {
    gap: 8,
  },
  infoItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 4,
  },
  infoLabel: {
    color: '#6b7280',
    fontSize: 14,
  },
  infoValue: {
    color: '#1f2937',
    fontSize: 14,
    fontWeight: '600',
  },
  actionButtons: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginTop: 32,
    gap: 32,
  },
  actionButton: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: 'white',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
    alignItems: 'center',
    justifyContent: 'center',
  },
  actionButtonDisabled: {
    opacity: 0.5,
  },
  cardBackActions: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderTopWidth: 1,
    borderTopColor: '#f3f4f6',
    backgroundColor: 'white',
    gap: 24,
  },
  cardBackActionButton: {
    width: 52,
    height: 52,
    borderRadius: 26,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 1,
    },
    shadowOpacity: 0.2,
    shadowRadius: 2,
    elevation: 3,
  },
  rejectButton: {
    backgroundColor: '#fef2f2',
    borderWidth: 1,
    borderColor: '#fecaca',
  },
  likeButton: {
    backgroundColor: '#f0fdf4',
    borderWidth: 1,
    borderColor: '#bbf7d0',
  },
  summaryContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 32,
    backgroundColor: '#fef3c7',
  },
  summaryCard: {
    backgroundColor: 'white',
    borderRadius: 24,
    padding: 32,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
    width: '100%',
  },
  summaryTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#1f2937',
    marginTop: 16,
  },
  summarySubtitle: {
    color: '#4b5563',
    marginTop: 8,
    textAlign: 'center',
  },
  matchesList: {
    marginTop: 24,
    width: '100%',
  },
  matchItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#f3f4f6',
  },
  matchImage: {
    width: 48,
    height: 48,
    borderRadius: 8,
  },
  matchTitle: {
    marginLeft: 12,
    fontWeight: '500',
    color: '#1f2937',
  },
  resetButton: {
    marginTop: 32,
    paddingVertical: 12,
    paddingHorizontal: 24,
    backgroundColor: '#f97316',
    borderRadius: 24,
  },
  resetButtonText: {
    color: 'white',
    fontWeight: 'bold',
  },
});
