import { describe, it, expect, beforeEach } from "bun:test";
import { appRouter } from "../../src/routers";
import { DindinUser, Recipe, Match } from "../../src/db";

describe("E2E: Recipe Matching Flow", () => {
  let userA: any, userB: any;
  let recipe1: any, recipe2: any, recipe3: any;
  let contextA: any, contextB: any;
  let callerA: any, callerB: any;

  beforeEach(async () => {
    // Setup test data
    await setupTestData();
    
    // Create API callers for both users
    callerA = appRouter.createCaller(contextA);
    callerB = appRouter.createCaller(contextB);
  });

  async function setupTestData() {
    // Create User A
    userA = await DindinUser.create({
      authUserId: "auth-user-a",
      name: "Alice",
      email: "alice@example.com",
      likedRecipes: [],
      dislikedRecipes: [],
      cookedRecipes: [],
      dietaryRestrictions: ["vegetarian"],
      allergies: [],
      cookingSkill: "intermediate",
      preferences: {
        maxCookTime: 60,
        preferredCuisines: ["Italian", "Asian"],
        ingredientsToAvoid: ["meat"],
        spiceLevel: "medium"
      },
      stats: {
        totalSwipes: 0,
        totalMatches: 0,
        recipesCooked: 0
      }
    });

    // Create User B
    userB = await DindinUser.create({
      authUserId: "auth-user-b",
      name: "Bob",
      email: "bob@example.com",
      likedRecipes: [],
      dislikedRecipes: [],
      cookedRecipes: [],
      dietaryRestrictions: [],
      allergies: ["nuts"],
      cookingSkill: "beginner",
      preferences: {
        maxCookTime: 45,
        preferredCuisines: ["Italian", "Mexican"],
        ingredientsToAvoid: ["nuts"],
        spiceLevel: "mild"
      },
      stats: {
        totalSwipes: 0,
        totalMatches: 0,
        recipesCooked: 0
      }
    });

    // Create recipes
    recipe1 = await Recipe.create({
      title: "Margherita Pizza",
      imageUrl: "https://example.com/pizza.jpg",
      cookTime: 30,
      difficulty: "easy",
      cuisine: "Italian",
      ingredients: [
        { name: "Pizza Dough", amount: "1", unit: "piece" },
        { name: "Tomato Sauce", amount: "1", unit: "cup" },
        { name: "Mozzarella", amount: "200", unit: "g" },
        { name: "Basil", amount: "10", unit: "leaves" }
      ],
      steps: [
        "Roll out dough",
        "Spread sauce",
        "Add cheese",
        "Bake at 220°C for 12-15 minutes"
      ],
      tags: ["vegetarian", "italian", "classic"],
      nutritionInfo: {
        calories: 450,
        protein: 18,
        carbs: 55,
        fat: 18
      },
      isActive: true
    });

    recipe2 = await Recipe.create({
      title: "Beef Tacos",
      imageUrl: "https://example.com/tacos.jpg",
      cookTime: 25,
      difficulty: "easy",
      cuisine: "Mexican",
      ingredients: [
        { name: "Ground Beef", amount: "500", unit: "g" },
        { name: "Taco Shells", amount: "8", unit: "pieces" },
        { name: "Lettuce", amount: "1", unit: "cup" },
        { name: "Cheese", amount: "100", unit: "g" }
      ],
      steps: [
        "Cook beef",
        "Warm taco shells",
        "Assemble tacos"
      ],
      tags: ["mexican", "quick"],
      nutritionInfo: {
        calories: 380,
        protein: 28,
        carbs: 35,
        fat: 15
      },
      isActive: true
    });

    recipe3 = await Recipe.create({
      title: "Pad Thai",
      imageUrl: "https://example.com/padthai.jpg",
      cookTime: 35,
      difficulty: "medium",
      cuisine: "Thai",
      ingredients: [
        { name: "Rice Noodles", amount: "200", unit: "g" },
        { name: "Tofu", amount: "200", unit: "g" },
        { name: "Bean Sprouts", amount: "1", unit: "cup" },
        { name: "Peanuts", amount: "50", unit: "g" }
      ],
      steps: [
        "Soak noodles",
        "Stir fry tofu",
        "Add noodles and sauce",
        "Garnish with peanuts"
      ],
      tags: ["asian", "vegetarian"],
      nutritionInfo: {
        calories: 420,
        protein: 16,
        carbs: 58,
        fat: 14
      },
      isActive: true
    });

    // Create contexts for API calls
    contextA = {
      session: {
        user: {
          id: userA.authUserId,
          name: userA.name,
          email: userA.email
        }
      }
    };

    contextB = {
      session: {
        user: {
          id: userB.authUserId,
          name: userB.name,
          email: userB.email
        }
      }
    };
  }

  describe("Complete Matching Flow", () => {
    it("should complete full matching flow from partner connection to match creation", async () => {
      // Step 1: User A generates partner code
      const { code } = await callerA.user.generatePartnerCode();
      expect(code).toBeDefined();
      expect(code).toHaveLength(6);

      // Step 2: User B connects using partner code
      const connectResult = await callerB.user.connectPartner({ 
        partnerCode: code 
      });
      expect(connectResult.success).toBe(true);

      // Verify both users are now partners
      const userAUpdated = await DindinUser.findById(userA._id);
      const userBUpdated = await DindinUser.findById(userB._id);
      expect(userAUpdated?.partnerId?.toString()).toBe(userB._id.toString());
      expect(userBUpdated?.partnerId?.toString()).toBe(userA._id.toString());

      // Step 3: Both users get recipe stacks
      const stackA = await callerA.recipe.getRecipeStack({ limit: 10 });
      const stackB = await callerB.recipe.getRecipeStack({ limit: 10 });
      
      expect(stackA.length).toBeGreaterThan(0);
      expect(stackB.length).toBeGreaterThan(0);

      // Step 4: User A swipes on recipes
      // Alice likes Pizza (vegetarian friendly)
      const swipeA1 = await callerA.recipe.likeRecipe({
        recipeId: recipe1._id.toString(),
        isLike: true
      });
      expect(swipeA1.success).toBe(true);
      expect(swipeA1.matched).toBe(false);

      // Alice dislikes Beef Tacos (not vegetarian)
      const swipeA2 = await callerA.recipe.likeRecipe({
        recipeId: recipe2._id.toString(),
        isLike: false
      });
      expect(swipeA2.success).toBe(true);
      expect(swipeA2.matched).toBe(false);

      // Step 5: User B swipes on recipes
      // Bob dislikes Pad Thai (contains nuts)
      const swipeB1 = await callerB.recipe.likeRecipe({
        recipeId: recipe3._id.toString(),
        isLike: false
      });
      expect(swipeB1.success).toBe(true);
      expect(swipeB1.matched).toBe(false);

      // Bob likes Pizza (no nuts, Italian cuisine he prefers)
      const swipeB2 = await callerB.recipe.likeRecipe({
        recipeId: recipe1._id.toString(),
        isLike: true
      });
      
      // Step 6: Match should be created!
      expect(swipeB2.success).toBe(true);
      expect(swipeB2.matched).toBe(true);
      expect(swipeB2.matchId).toBeDefined();
      expect(swipeB2.recipe).toBeDefined();
      expect(swipeB2.recipe.title).toBe("Margherita Pizza");

      // Step 7: Both users should see the match
      const matchesA = await callerA.recipe.getMatches({ 
        limit: 10, 
        offset: 0 
      });
      const matchesB = await callerB.recipe.getMatches({ 
        limit: 10, 
        offset: 0 
      });

      expect(matchesA.total).toBe(1);
      expect(matchesB.total).toBe(1);
      expect(matchesA.matches[0]._id.toString()).toBe(swipeB2.matchId.toString());
      expect(matchesB.matches[0]._id.toString()).toBe(swipeB2.matchId.toString());

      // Step 8: Verify match details
      const match = await Match.findById(swipeB2.matchId)
        .populate('recipeId')
        .populate('users');
      
      expect(match).toBeDefined();
      expect(match?.status).toBe("matched");
      expect(match?.users).toHaveLength(2);
      expect(match?.recipeId.title).toBe("Margherita Pizza");

      // Step 9: Verify user stats were updated
      const finalUserA = await DindinUser.findById(userA._id);
      const finalUserB = await DindinUser.findById(userB._id);
      
      expect(finalUserA?.stats.totalSwipes).toBe(2);
      expect(finalUserA?.stats.totalMatches).toBe(1);
      expect(finalUserB?.stats.totalSwipes).toBe(2);
      expect(finalUserB?.stats.totalMatches).toBe(1);
    });

    it("should handle match status updates through cooking lifecycle", async () => {
      // Setup: Create partners and a match
      userA.partnerId = userB._id;
      userB.partnerId = userA._id;
      await userA.save();
      await userB.save();

      // Both users like the same recipe to create a match
      userA.likedRecipes.push(recipe1._id);
      userB.likedRecipes.push(recipe1._id);
      await userA.save();
      await userB.save();

      const match = await Match.create({
        users: [userA._id, userB._id],
        recipeId: recipe1._id,
        status: "matched"
      });

      // Step 1: Schedule the recipe for cooking
      const scheduleDate = new Date();
      scheduleDate.setDate(scheduleDate.getDate() + 3); // 3 days from now

      const callerMatch = appRouter.createCaller(contextA);
      const updateResult = await callerMatch.match.updateMatchStatus({
        matchId: match._id.toString(),
        status: "scheduled",
        cookDate: scheduleDate
      });

      expect(updateResult.status).toBe("scheduled");
      expect(updateResult.cookDate).toBeDefined();

      // Step 2: Mark as cooked
      const cookedResult = await callerMatch.match.updateMatchStatus({
        matchId: match._id.toString(),
        status: "cooked"
      });

      expect(cookedResult.status).toBe("cooked");

      // Step 3: Add ratings from both users
      const ratingA = await callerMatch.match.addRating({
        matchId: match._id.toString(),
        rating: 5
      });
      expect(ratingA.success).toBe(true);

      const callerMatchB = appRouter.createCaller(contextB);
      const ratingB = await callerMatchB.match.addRating({
        matchId: match._id.toString(),
        rating: 4
      });
      expect(ratingB.success).toBe(true);

      // Step 4: Add notes about the cooking experience
      const noteResult = await callerMatch.match.addNote({
        matchId: match._id.toString(),
        note: "Delicious! Added extra basil as suggested."
      });
      expect(noteResult.success).toBe(true);

      // Step 5: Verify the complete match history
      const finalMatch = await Match.findById(match._id);
      expect(finalMatch?.status).toBe("cooked");
      expect(finalMatch?.ratings).toHaveLength(2);
      expect(finalMatch?.getAverageRating()).toBe(4.5);
      expect(finalMatch?.notes).toHaveLength(1);
      expect(finalMatch?.statusHistory).toHaveLength(3); // matched -> scheduled -> cooked

      // Step 6: Check cooked history
      const cookedHistory = await callerMatch.match.getCookedHistory({
        limit: 10,
        offset: 0
      });
      
      expect(cookedHistory.total).toBe(1);
      expect(cookedHistory.matches[0]._id.toString()).toBe(match._id.toString());
    });

    it("should handle edge cases in matching flow", async () => {
      // Edge case 1: User tries to swipe on already swiped recipe
      userA.likedRecipes.push(recipe1._id);
      await userA.save();

      try {
        await callerA.recipe.likeRecipe({
          recipeId: recipe1._id.toString(),
          isLike: true
        });
        expect(true).toBe(false); // Should not reach here
      } catch (error: any) {
        expect(error.message).toContain("already swiped");
      }

      // Edge case 2: User without partner likes recipe
      const swipeResult = await callerA.recipe.likeRecipe({
        recipeId: recipe2._id.toString(),
        isLike: true
      });
      
      expect(swipeResult.success).toBe(true);
      expect(swipeResult.matched).toBe(false); // No match without partner

      // Edge case 3: Invalid partner code
      try {
        await callerB.user.connectPartner({
          partnerCode: "INVALID"
        });
        expect(true).toBe(false); // Should not reach here
      } catch (error: any) {
        expect(error.message).toContain("Invalid partner code");
      }

      // Edge case 4: Recipe doesn't exist
      try {
        await callerA.recipe.likeRecipe({
          recipeId: "507f1f77bcf86cd799439011", // Valid ObjectId format but doesn't exist
          isLike: true
        });
        expect(true).toBe(false); // Should not reach here
      } catch (error: any) {
        expect(error.message).toContain("not found");
      }
    });
  });
});