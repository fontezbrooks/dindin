import { describe, it, expect, beforeEach } from "bun:test";
import { Match, DindinUser, Recipe } from "../index";
import mongoose from "mongoose";

describe("Match Model", () => {
  let user1: any, user2: any, recipe: any;

  beforeEach(async () => {
    // Create test users
    user1 = await DindinUser.create({
      authUserId: "auth-user-1",
      name: "Test User 1",
      email: "user1@test.com",
      likedRecipes: [],
      dislikedRecipes: [],
      cookedRecipes: [],
      dietaryRestrictions: [],
      allergies: [],
      cookingSkill: "intermediate",
      preferences: {
        maxCookTime: 60,
        preferredCuisines: [],
        ingredientsToAvoid: [],
        spiceLevel: "medium"
      },
      stats: {
        totalSwipes: 0,
        totalMatches: 0,
        recipesCooked: 0
      }
    });

    user2 = await DindinUser.create({
      authUserId: "auth-user-2",
      name: "Test User 2",
      email: "user2@test.com",
      likedRecipes: [],
      dislikedRecipes: [],
      cookedRecipes: [],
      dietaryRestrictions: [],
      allergies: [],
      cookingSkill: "beginner",
      preferences: {
        maxCookTime: 45,
        preferredCuisines: [],
        ingredientsToAvoid: [],
        spiceLevel: "mild"
      },
      stats: {
        totalSwipes: 0,
        totalMatches: 0,
        recipesCooked: 0
      }
    });

    // Create test recipe
    recipe = await Recipe.create({
      title: "Test Recipe",
      description: "A delicious test recipe",
      image_url: "https://example.com/image.jpg",
      cook_time: 30,
      prep_time: 15,
      difficulty: "easy",
      cuisine: ["Italian"],
      cuisine_type: "Italian",
      dietary_tags: ["vegetarian"],
      ingredients: [
        { name: "Pasta", amount: "200", unit: "g" },
        { name: "Tomato Sauce", amount: "1", unit: "cup" }
      ],
      instructions: ["Cook pasta", "Add sauce", "Serve"],
      nutritional_info: {
        calories: 400,
        protein: 15,
        carbohydrates: 60,
        fat: 10,
        sugar: 5,
        fiber: 3
      },
      servings: 4,
      isActive: true
    });
  });

  describe("Match Creation", () => {
    it("should create a match between two users", async () => {
      const match = await Match.create({
        users: [user1._id, user2._id],
        recipeId: recipe._id,
        status: "matched"
      });

      expect(match).toBeDefined();
      expect(match.users).toHaveLength(2);
      expect(match.status).toBe("matched");
      expect(match.recipeId.toString()).toBe(recipe._id.toString());
    });

    it("should set default status to 'matched'", async () => {
      const match = await Match.create({
        users: [user1._id, user2._id],
        recipeId: recipe._id
      });

      expect(match.status).toBe("matched");
    });

    it("should set matchedAt to current date", async () => {
      const match = await Match.create({
        users: [user1._id, user2._id],
        recipeId: recipe._id
      });

      const now = new Date();
      const matchedAt = new Date(match.matchedAt);
      const timeDiff = Math.abs(now.getTime() - matchedAt.getTime());
      
      expect(timeDiff).toBeLessThan(1000); // Within 1 second
    });
  });

  describe("Match Methods", () => {
    it("should check if match exists between users", async () => {
      await Match.create({
        users: [user1._id, user2._id],
        recipeId: recipe._id
      });

      const exists = await Match.hasExistingMatch(
        [user1._id, user2._id],
        recipe._id
      );

      expect(exists).toBe(true);
    });

    it("should not find match for different recipe", async () => {
      await Match.create({
        users: [user1._id, user2._id],
        recipeId: recipe._id
      });

      const otherRecipe = await Recipe.create({
        title: "Other Recipe",
        description: "Another test recipe",
        image_url: "https://example.com/other.jpg",
        cook_time: 20,
        prep_time: 10,
        difficulty: "easy",
        cuisine: ["Mexican"],
        cuisine_type: "Mexican",
        dietary_tags: [],
        ingredients: [],
        instructions: [],
        nutritional_info: {
          calories: 300,
          protein: 10,
          carbohydrates: 40,
          fat: 8,
          sugar: 3,
          fiber: 2
        },
        servings: 2,
        isActive: true
      });

      const exists = await Match.hasExistingMatch(
        [user1._id, user2._id],
        otherRecipe._id
      );

      expect(exists).toBe(false);
    });

    it("should check if user is included in match", async () => {
      const match = await Match.create({
        users: [user1._id, user2._id],
        recipeId: recipe._id
      });

      expect(match.includesUser(user1._id)).toBe(true);
      expect(match.includesUser(user2._id)).toBe(true);
      expect(match.includesUser(new mongoose.Types.ObjectId())).toBe(false);
    });

    it("should update match status", async () => {
      const match = await Match.create({
        users: [user1._id, user2._id],
        recipeId: recipe._id
      });

      await match.updateStatus("scheduled");
      expect(match.status).toBe("scheduled");

      await match.updateStatus("cooked");
      expect(match.status).toBe("cooked");
    });

    it("should add rating to match", async () => {
      const match = await Match.create({
        users: [user1._id, user2._id],
        recipeId: recipe._id
      });

      await match.addRating(user1._id, 5);
      
      expect(match.ratings).toHaveLength(1);
      expect(match.ratings[0].userId.toString()).toBe(user1._id.toString());
      expect(match.ratings[0].rating).toBe(5);
    });

    it("should update existing rating", async () => {
      const match = await Match.create({
        users: [user1._id, user2._id],
        recipeId: recipe._id
      });

      await match.addRating(user1._id, 3);
      await match.addRating(user1._id, 5);
      
      expect(match.ratings).toHaveLength(1);
      expect(match.ratings[0].rating).toBe(5);
    });

    it("should calculate average rating", async () => {
      const match = await Match.create({
        users: [user1._id, user2._id],
        recipeId: recipe._id
      });

      await match.addRating(user1._id, 4);
      await match.addRating(user2._id, 5);
      
      const avgRating = match.getAverageRating();
      expect(avgRating).toBe(4.5);
    });
  });

  describe("Match Status Transitions", () => {
    it("should track status history", async () => {
      const match = await Match.create({
        users: [user1._id, user2._id],
        recipeId: recipe._id
      });

      expect(match.statusHistory).toHaveLength(1);
      expect(match.statusHistory[0].status).toBe("matched");

      await match.updateStatus("scheduled");
      expect(match.statusHistory).toHaveLength(2);
      expect(match.statusHistory[1].status).toBe("scheduled");
    });

    it("should expire old matches", async () => {
      const oldDate = new Date();
      oldDate.setDate(oldDate.getDate() - 31); // 31 days ago

      const match = await Match.create({
        users: [user1._id, user2._id],
        recipeId: recipe._id,
        matchedAt: oldDate
      });

      await Match.expireOldMatches();
      
      const updatedMatch = await Match.findById(match._id);
      expect(updatedMatch?.status).toBe("expired");
    });
  });

  describe("Match Analytics", () => {
    it("should track match to cook time", async () => {
      const match = await Match.create({
        users: [user1._id, user2._id],
        recipeId: recipe._id
      });

      // Simulate cooking after 2 days
      const cookDate = new Date();
      cookDate.setDate(cookDate.getDate() + 2);
      
      match.cookDate = cookDate;
      await match.updateStatus("cooked");
      
      expect(match.analytics.matchToCookTime).toBeGreaterThan(0);
    });

    it("should track interaction timestamps", async () => {
      const match = await Match.create({
        users: [user1._id, user2._id],
        recipeId: recipe._id
      });

      const initialActivity = match.interactions.lastActivityAt;
      
      // Wait a bit and add a note
      await new Promise(resolve => setTimeout(resolve, 10));
      
      match.notes.push({
        userId: user1._id,
        note: "Test note",
        createdAt: new Date()
      });
      match.interactions.lastActivityAt = new Date();
      await match.save();
      
      expect(match.interactions.lastActivityAt.getTime())
        .toBeGreaterThan(initialActivity.getTime());
    });
  });
});