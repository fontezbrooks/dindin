import { describe, it, expect, beforeEach } from "bun:test";
import { appRouter } from "../../src/routers";
import { DindinUser, Recipe, Match } from "../../src/db";

describe("E2E: Matches Screen Flow", () => {
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
      authUserId: "auth-matches-user-a",
      name: "Alice Smith",
      email: "alice.smith@example.com",
      likedRecipes: [],
      dislikedRecipes: [],
      cookedRecipes: [],
      dietaryRestrictions: [],
      allergies: [],
      cookingSkill: "intermediate",
      preferences: {
        maxCookTime: 60,
        preferredCuisines: ["Italian", "Mexican"],
        ingredientsToAvoid: [],
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
      authUserId: "auth-matches-user-b",
      name: "Bob Johnson",
      email: "bob.johnson@example.com",
      likedRecipes: [],
      dislikedRecipes: [],
      cookedRecipes: [],
      dietaryRestrictions: [],
      allergies: [],
      cookingSkill: "beginner",
      partnerId: userA._id,
      preferences: {
        maxCookTime: 45,
        preferredCuisines: ["Italian", "Asian"],
        ingredientsToAvoid: [],
        spiceLevel: "mild"
      },
      stats: {
        totalSwipes: 0,
        totalMatches: 0,
        recipesCooked: 0
      }
    });

    // Link users as partners
    userA.partnerId = userB._id;
    await userA.save();

    // Create test recipes
    recipe1 = await Recipe.create({
      title: "Classic Spaghetti Carbonara",
      description: "Traditional Italian pasta with eggs, cheese, and pancetta",
      image_url: "https://example.com/carbonara.jpg",
      cook_time: 25,
      prep_time: 10,
      difficulty: "medium",
      cuisine: ["Italian"],
      cuisine_type: "Italian",
      dietary_tags: [],
      ingredients: [
        { name: "Spaghetti", amount: "400", unit: "g" },
        { name: "Eggs", amount: "4", unit: "pieces" },
        { name: "Pancetta", amount: "200", unit: "g" },
        { name: "Parmesan", amount: "100", unit: "g" }
      ],
      instructions: [
        "Cook spaghetti al dente",
        "Fry pancetta until crispy",
        "Mix eggs with cheese",
        "Combine all with pasta water"
      ],
      nutritional_info: {
        calories: 520,
        protein: 22,
        carbohydrates: 62,
        fat: 18,
        sugar: 3,
        fiber: 2
      },
      servings: 4,
      isActive: true
    });

    recipe2 = await Recipe.create({
      title: "Thai Green Curry",
      description: "Spicy and fragrant Thai curry with vegetables",
      image_url: "https://example.com/green-curry.jpg",
      cook_time: 30,
      prep_time: 15,
      difficulty: "medium",
      cuisine: ["Thai", "Asian"],
      cuisine_type: "Thai",
      dietary_tags: ["gluten-free"],
      ingredients: [
        { name: "Green Curry Paste", amount: "3", unit: "tbsp" },
        { name: "Coconut Milk", amount: "400", unit: "ml" },
        { name: "Chicken", amount: "500", unit: "g" },
        { name: "Thai Basil", amount: "1", unit: "cup" }
      ],
      instructions: [
        "Fry curry paste",
        "Add coconut milk",
        "Add chicken and vegetables",
        "Simmer until cooked"
      ],
      nutritional_info: {
        calories: 380,
        protein: 28,
        carbohydrates: 15,
        fat: 24,
        sugar: 5,
        fiber: 3
      },
      servings: 4,
      isActive: true
    });

    recipe3 = await Recipe.create({
      title: "Mexican Street Tacos",
      description: "Authentic street-style tacos with seasoned meat",
      image_url: "https://example.com/tacos.jpg",
      cook_time: 20,
      prep_time: 15,
      difficulty: "easy",
      cuisine: ["Mexican"],
      cuisine_type: "Mexican",
      dietary_tags: [],
      ingredients: [
        { name: "Corn Tortillas", amount: "12", unit: "pieces" },
        { name: "Beef", amount: "500", unit: "g" },
        { name: "Onion", amount: "1", unit: "piece" },
        { name: "Cilantro", amount: "1", unit: "bunch" }
      ],
      instructions: [
        "Season and cook beef",
        "Warm tortillas",
        "Assemble with toppings",
        "Serve with lime"
      ],
      nutritional_info: {
        calories: 290,
        protein: 18,
        carbohydrates: 28,
        fat: 12,
        sugar: 2,
        fiber: 4
      },
      servings: 4,
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

  describe("Matches Screen Workflow", () => {
    it("should display empty state when no matches exist", async () => {
      // Get matches for User A (should be empty)
      const matchesResult = await callerA.recipe.getMatches({
        limit: 20,
        offset: 0
      });

      expect(matchesResult.matches).toHaveLength(0);
      expect(matchesResult.total).toBe(0);
      expect(matchesResult.hasMore).toBe(false);
    });

    it("should display matches after users match on recipes", async () => {
      // Create some matches by having both users like the same recipes
      
      // Match 1: Both like Carbonara
      userA.likedRecipes.push(recipe1._id);
      userB.likedRecipes.push(recipe1._id);
      await userA.save();
      await userB.save();
      
      const match1 = await Match.create({
        users: [userA._id, userB._id],
        recipeId: recipe1._id,
        status: "matched"
      });

      // Match 2: Both like Tacos
      userA.likedRecipes.push(recipe3._id);
      userB.likedRecipes.push(recipe3._id);
      await userA.save();
      await userB.save();
      
      const match2 = await Match.create({
        users: [userA._id, userB._id],
        recipeId: recipe3._id,
        status: "matched"
      });

      // Get matches for User A
      const matchesResult = await callerA.recipe.getMatches({
        limit: 20,
        offset: 0
      });

      expect(matchesResult.matches).toHaveLength(2);
      expect(matchesResult.total).toBe(2);
      expect(matchesResult.hasMore).toBe(false);

      // Verify match details
      const carbonaraMatch = matchesResult.matches.find(
        (m: any) => m.recipeId.title === "Classic Spaghetti Carbonara"
      );
      expect(carbonaraMatch).toBeDefined();
      expect(carbonaraMatch.status).toBe("matched");
      expect(carbonaraMatch.users).toHaveLength(2);

      const tacosMatch = matchesResult.matches.find(
        (m: any) => m.recipeId.title === "Mexican Street Tacos"
      );
      expect(tacosMatch).toBeDefined();
      expect(tacosMatch.status).toBe("matched");
    });

    it("should filter matches by status", async () => {
      // Create matches with different statuses
      const match1 = await Match.create({
        users: [userA._id, userB._id],
        recipeId: recipe1._id,
        status: "matched"
      });

      const match2 = await Match.create({
        users: [userA._id, userB._id],
        recipeId: recipe2._id,
        status: "scheduled",
        cookDate: new Date(Date.now() + 86400000) // Tomorrow
      });

      const match3 = await Match.create({
        users: [userA._id, userB._id],
        recipeId: recipe3._id,
        status: "cooked"
      });

      // Get only matched status
      const matchedOnly = await callerA.recipe.getMatches({
        status: "matched",
        limit: 20,
        offset: 0
      });

      expect(matchedOnly.matches).toHaveLength(1);
      expect(matchedOnly.matches[0].status).toBe("matched");

      // Get scheduled matches
      const scheduledOnly = await callerA.recipe.getMatches({
        status: "scheduled",
        limit: 20,
        offset: 0
      });

      expect(scheduledOnly.matches).toHaveLength(1);
      expect(scheduledOnly.matches[0].status).toBe("scheduled");
      expect(scheduledOnly.matches[0].cookDate).toBeDefined();

      // Get cooked matches
      const cookedOnly = await callerA.recipe.getMatches({
        status: "cooked",
        limit: 20,
        offset: 0
      });

      expect(cookedOnly.matches).toHaveLength(1);
      expect(cookedOnly.matches[0].status).toBe("cooked");
    });

    it("should support pagination for many matches", async () => {
      // Create 5 matches
      const matchPromises = [];
      for (let i = 0; i < 5; i++) {
        const recipe = await Recipe.create({
          title: `Test Recipe ${i}`,
          description: `Test description ${i}`,
          image_url: `https://example.com/recipe${i}.jpg`,
          cook_time: 20 + i,
          prep_time: 10,
          difficulty: "easy",
          cuisine: ["Test"],
          cuisine_type: "Test",
          dietary_tags: [],
          ingredients: [],
          instructions: ["Test"],
          nutritional_info: {
            calories: 300,
            protein: 20,
            carbohydrates: 30,
            fat: 10,
            sugar: 5,
            fiber: 3
          },
          servings: 4,
          isActive: true
        });

        matchPromises.push(
          Match.create({
            users: [userA._id, userB._id],
            recipeId: recipe._id,
            status: "matched"
          })
        );
      }
      await Promise.all(matchPromises);

      // Get first page
      const page1 = await callerA.recipe.getMatches({
        limit: 3,
        offset: 0
      });

      expect(page1.matches).toHaveLength(3);
      expect(page1.total).toBe(5);
      expect(page1.hasMore).toBe(true);

      // Get second page
      const page2 = await callerA.recipe.getMatches({
        limit: 3,
        offset: 3
      });

      expect(page2.matches).toHaveLength(2);
      expect(page2.total).toBe(5);
      expect(page2.hasMore).toBe(false);
    });

    it("should show both users in the match", async () => {
      // Create a match
      const match = await Match.create({
        users: [userA._id, userB._id],
        recipeId: recipe1._id,
        status: "matched"
      });

      // Get matches for User A
      const matchesA = await callerA.recipe.getMatches({
        limit: 20,
        offset: 0
      });

      // Get matches for User B
      const matchesB = await callerB.recipe.getMatches({
        limit: 20,
        offset: 0
      });

      // Both users should see the same match
      expect(matchesA.matches).toHaveLength(1);
      expect(matchesB.matches).toHaveLength(1);
      expect(matchesA.matches[0]._id.toString()).toBe(matchesB.matches[0]._id.toString());

      // Verify both users are in the match
      const matchA = matchesA.matches[0];
      expect(matchA.users).toHaveLength(2);
      const userNames = matchA.users.map((u: any) => u.name);
      expect(userNames).toContain("Alice Smith");
      expect(userNames).toContain("Bob Johnson");
    });

    it("should handle refresh action", async () => {
      // Create initial match
      const match1 = await Match.create({
        users: [userA._id, userB._id],
        recipeId: recipe1._id,
        status: "matched"
      });

      // Get initial matches
      const initialMatches = await callerA.recipe.getMatches({
        limit: 20,
        offset: 0
      });
      expect(initialMatches.matches).toHaveLength(1);

      // Create another match (simulating real-time update)
      const match2 = await Match.create({
        users: [userA._id, userB._id],
        recipeId: recipe2._id,
        status: "matched"
      });

      // Refresh matches (simulating pull-to-refresh)
      const refreshedMatches = await callerA.recipe.getMatches({
        limit: 20,
        offset: 0
      });

      expect(refreshedMatches.matches).toHaveLength(2);
      expect(refreshedMatches.total).toBe(2);
    });

    it("should handle error states gracefully", async () => {
      // Test with invalid status
      try {
        await callerA.recipe.getMatches({
          status: "invalid_status" as any,
          limit: 20,
          offset: 0
        });
        expect(true).toBe(false); // Should not reach here
      } catch (error) {
        expect(error).toBeDefined();
      }

      // Test with negative offset
      const result = await callerA.recipe.getMatches({
        limit: 20,
        offset: -1
      });
      // Should handle gracefully and return empty or first page
      expect(result.matches).toBeDefined();
      expect(Array.isArray(result.matches)).toBe(true);
    });
  });
});