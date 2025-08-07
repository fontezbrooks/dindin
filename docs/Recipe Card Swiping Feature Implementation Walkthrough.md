Based on my analysis of the codebase, here's a comprehensive walkthrough of how the recipe card swiping feature works. This
  implementation uses a sophisticated combination of React Native Reanimated for smooth animations, gesture handling, and a
  full-stack architecture for managing swipes and matches.

  Architecture Overview

  The swiping feature is built with these key components:
  1. Frontend UI Layer: RecipeSwiper + RecipeCard components
  2. State Management: Zustand stores for recipes and authentication
  3. API Layer: RESTful backend services
  4. Database Layer: MongoDB with SwipeHistory and Match models
  5. Business Logic: Matching algorithm and partnership system

  Frontend Implementation

  6. RecipeSwiper Component (Main Swipe Interface)

  The RecipeSwiper is the core component that handles all swipe interactions:

  Key Features:
  - Gesture Detection: Uses react-native-gesture-handler for pan gestures
  - Smooth Animations: React Native Reanimated 3 for 60fps animations
  - Card Stack: Shows current card + next card preview with depth effect
  - Visual Feedback: Dynamic overlays ("LIKE"/"NOPE") that appear during swipes
  - Haptic Feedback: iOS/Android haptic responses for better UX

  Animation System:
  // Shared values for animations
  ```
const translateX = useSharedValue(0);
  const translateY = useSharedValue(0);
  const rotate = useSharedValue(0);
  const scale = useSharedValue(1);
  const nextCardScale = useSharedValue(0.95);
  const nextCardOpacity = useSharedValue(0.8);

  Gesture Handling:
  const panGesture = Gesture.Pan()
    .onUpdate((event) => {
      translateX.value = event.translationX;
      rotate.value = interpolate(
        event.translationX,
        [-screenWidth, 0, screenWidth],
        [-15, 0, 15],
        Extrapolate.CLAMP
      );
    })
    .onEnd((event) => {
      const shouldSwipe = Math.abs(event.translationX) > SWIPE_THRESHOLD ||
                         Math.abs(event.velocityX) > 1000;

      if (shouldSwipe) {
        const direction = event.translationX > 0 ? 'right' : 'left';
        animateSwipe(direction);
      } else {
        // Snap back to center
        translateX.value = withSpring(0);
      }
    });

  Animation Sequences:
  const animateSwipe = (direction: 'left' | 'right') => {
    const toValue = direction === 'right' ? screenWidth + 100 : -screenWidth - 100;

    // Parallel animations for smooth exit
    translateX.value = withTiming(toValue, { duration: 300 });
    rotate.value = withTiming(direction === 'right' ? 15 : -15, { duration: 300 });
    scale.value = withTiming(0.8, { duration: 300 });

    // Next card comes forward
    nextCardScale.value = withTiming(1, { duration: 300 });
    nextCardOpacity.value = withTiming(1, { duration: 300 },
      (finished) => {
        if (finished) {
          runOnJS(handleSwipeComplete)(direction);
        }
      }
    );
  };
```

  2. RecipeCard Component (Individual Cards)

  Displays recipe information with two modes:
  - Swipe Mode: Condensed view showing title, image, basic info, tags
  - Detail Mode: Full scrollable view with ingredients and instructions

  ```
Responsive Design:
  const styles = StyleSheet.create({
    card: {
      width: screenWidth - 32,
      height: showFullDetails ? screenHeight - 200 : screenHeight - 250,
      // Card styling with shadows and rounded corners
    },
    imageContainer: {
      height: showFullDetails ? '40%' : '60%',
    },
  });
```

  3. State Management (Zustand Store)

  The useRecipeStore manages all recipe-related state:

  ```
interface RecipeState {
    recipes: Recipe[];
    isLoading: boolean;
    isSwipeLoading: boolean;
    swipeHistory: any[];
    lastMatch: any;

    // Actions
    loadRecipes: (isPersonalized?: boolean) => Promise<void>;
    swipeRecipe: (recipeId: string, direction: 'left' | 'right') => Promise<boolean>;
    removeRecipeFromDeck: (recipeId: string) => void;
  }

  Key Store Functions:

  Loading Recipes:
  loadRecipes: async (isPersonalized = true, loadMore = false) => {
    const response = isPersonalized
      ? await recipeService.getPersonalizedRecipes(pagination)
      : await recipeService.getRecipes(state.filters, pagination);

    if (response.success) {
      set({
        recipes: loadMore ? [...state.recipes, ...newRecipes] : newRecipes,
        hasMore: response.data.currentPage < response.data.totalPages,
      });
    }
  }

  Handling Swipes:
  swipeRecipe: async (recipeId: string, direction: 'left' | 'right') => {
    const response = await recipeService.swipeRecipe(recipeId, direction);

    if (response.success) {
      // Remove from deck
      get().removeRecipeFromDeck(recipeId);

      // Handle matches
      if (response.isMatch && response.match) {
        set({ lastMatch: response.match });
      }
      return true;
    }
    return false;
  }
```

  Backend Implementation

  4. API Routes (/routes/swipes.ts)

  The swipe routes handle recording swipes and retrieving history:

  ```
// POST /api/swipes - Record a swipe
  router.post('/',
    verifyBetterAuthSession,
    swipeLimiter,
    validateSwipe,
    async (req, res) => {
      const { recipeId, swipeDirection } = req.body;

      const result = await SwipeService.recordSwipe({
        userId: req.user.id,
        recipeId,
        swipeDirection,
      });

      const statusCode = result.isMatch ? 200 : 201;
      res.status(statusCode).json(result);
    }
  );
```

  5. SwipeService (Business Logic)

  The SwipeService contains the core swipe logic and matching algorithm:

  Recording Swipes:
  
  ```
static async recordSwipe(swipeData: SwipeData): Promise<SwipeResult> {
    // 1. Validate input
    if (!mongoose.Types.ObjectId.isValid(userId) ||
        !mongoose.Types.ObjectId.isValid(recipeId)) {
      return { success: false, message: "Invalid IDs" };
    }

    // 2. Check for duplicate swipes
    const existingSwipe = await SwipeHistory.findOne({
      userId: new mongoose.Types.ObjectId(userId),
      recipeId: new mongoose.Types.ObjectId(recipeId),
    });

    if (existingSwipe) {
      return { success: false, message: "Already swiped" };
    }

    // 3. Save the swipe
    const swipe = new SwipeHistory({
      userId: new mongoose.Types.ObjectId(userId),
      recipeId: new mongoose.Types.ObjectId(recipeId),
      swipeDirection,
    });
    await swipe.save();

    // 4. Update recipe statistics
    await RecipeService.updateRecipeStats(recipeId, swipeDirection === "right");

    // 5. Check for matches (if right swipe)
    if (swipeDirection === "right") {
      const matchResult = await this.checkForMatches(userId, recipeId);
      if (matchResult) {
        return {
          success: true,
          message: "Swipe recorded and match found!",
          match: matchResult,
          isMatch: true,
        };
      }
    }

    return { success: true, message: "Swipe recorded", isMatch: false };
  }
```
  Matching Algorithm:
  
  ```
static async checkForMatches(userId: string, recipeId: string): Promise<IMatch | null> {
    // 1. Get user's active partnerships
    const user = await User.findById(userId);
    const activePartners = user.partnerships
      .filter(p => p.status === "active")
      .map(p => p.partnerId);

    if (activePartners.length === 0) return null;

    // 2. Find partners who also swiped right on same recipe
    const partnerSwipes = await SwipeHistory.find({
      userId: { $in: activePartners },
      recipeId: new mongoose.Types.ObjectId(recipeId),
      swipeDirection: "right",
    });

    // 3. Create matches for each partner
    const matches = [];
    for (const partnerSwipe of partnerSwipes) {
      // Check if match already exists
      const existingMatch = await Match.findOne({
        $or: [
          { user1Id: userId, user2Id: partnerSwipe.userId, recipeId },
          { user1Id: partnerSwipe.userId, user2Id: userId, recipeId }
        ],
      });

      if (!existingMatch) {
        const match = new Match({
          user1Id: new mongoose.Types.ObjectId(userId),
          user2Id: partnerSwipe.userId,
          recipeId: new mongoose.Types.ObjectId(recipeId),
          status: "active",
        });
        matches.push(await match.save());
      }
    }

    return matches.length > 0 ? matches[0] : null;
  }
```
  6. Database Models

  ```
SwipeHistory Model:
  interface ISwipeHistory {
    _id: mongoose.Types.ObjectId;
    userId: mongoose.Types.ObjectId;
    recipeId: mongoose.Types.ObjectId;
    swipeDirection: "left" | "right";
    createdAt: Date;
  }

  // Indexes for performance
  SwipeHistorySchema.index({ userId: 1, recipeId: 1 }, { unique: true }); // Prevent duplicates
  SwipeHistorySchema.index({ userId: 1, createdAt: -1 }); // User history
  SwipeHistorySchema.index({ recipeId: 1, swipeDirection: 1 }); // Recipe analytics

  Match Model:
  interface IMatch {
    _id: mongoose.Types.ObjectId;
    user1Id: mongoose.Types.ObjectId;
    user2Id: mongoose.Types.ObjectId;
    recipeId: mongoose.Types.ObjectId;
    status: "active" | "dismissed" | "cooked";
    cookedAt?: Date;
    notes?: string;
    rating?: number;
    createdAt: Date;
  }

  // Middleware to ensure consistent user ordering
  MatchSchema.pre("save", function (next) {
    if (this.user1Id.toString() > this.user2Id.toString()) {
      const temp = this.user1Id;
      this.user1Id = this.user2Id;
      this.user2Id = temp;
    }
    next();
  });

  Integration Flow

  7. Main App Integration (index.tsx)

  The main discover screen orchestrates everything:

  export default function DiscoverScreen() {
    const { isAuthenticated } = useAuthStore();
    const { recipes, loadRecipes, swipeRecipe, lastMatch } = useRecipeStore();

    // Load recipes on mount
    useEffect(() => {
      loadRecipes(isAuthenticated);
    }, [isAuthenticated]);

    // Show match notifications
    useEffect(() => {
      if (lastMatch) {
        Alert.alert('🎉 It\'s a Match!',
          'You and your partner both love this recipe!');
      }
    }, [lastMatch]);

    const handleSwipeRight = async (recipe: Recipe) => {
      if (!isAuthenticated) {
        Alert.alert('Sign In Required', 'Please sign in to match with others.');
        return;
      }

      const success = await swipeRecipe(recipe._id, 'right', isAuthenticated);
      if (!success && error) {
        Alert.alert('Error', error);
      }
    };

    return (
      <RecipeSwiper
        recipes={recipes}
        onSwipeLeft={handleSwipeLeft}
        onSwipeRight={handleSwipeRight}
        onShowMore={handleShowMore}
        isLoading={isLoading}
      />
    );
  }
```

  8. Complete Data Flow

  9. User swipes card → Gesture detected in RecipeSwiper
  10. Animation plays → Card animates off screen, next card scales up
  11. API call made → Frontend calls /api/swipes endpoint
  12. Swipe recorded → Backend saves to SwipeHistory collection
  13. Match check → If right swipe, check for partner matches
  14. Match created → If partner also liked, create Match record
  15. Response sent → API returns success + match data if applicable
  16. UI updated → Frontend removes card from deck, shows match alert
  17. Auto-reload → If cards running low, automatically load more

  Key Implementation Details

  Performance Optimizations

  18. Gesture Performance: Uses runOnJS to ensure animations run on UI thread
  19. Memory Management: Removes swiped cards from state to prevent memory leaks
  20. Lazy Loading: Loads more recipes when deck gets low (< 5 cards)
  21. Database Indexes: Optimized queries for swipe history and matching

  UX Enhancements

  22. Visual Feedback: Real-time overlays showing swipe direction
  23. Haptic Feedback: Native haptic responses for better tactile experience
  24. Smooth Animations: 60fps animations with spring physics
  25. Error Handling: Graceful fallbacks and user-friendly error messages
  26. Offline Support: Basic error handling for network issues

  Security & Data Integrity

  27. Authentication Required: Must be signed in to record swipes
  28. Rate Limiting: Prevents spam swiping
  29. Duplicate Prevention: Database constraints prevent duplicate swipes
  30. Input Validation: Validates all swipe data before processing
  31. User Partnerships: Only creates matches between active partners

  This implementation provides a robust, performant, and user-friendly swiping experience similar to popular dating apps, but
  optimized for recipe discovery and partner matching.