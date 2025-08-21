import { describe, it, expect, beforeEach, afterEach, beforeAll, afterAll } from 'vitest';
import mongoose from 'mongoose';
import { MongoMemoryServer } from 'mongodb-memory-server';
import { CookedRecipe } from '../../src/models/cooked-recipe.model';
import { Recipe } from '../../src/db/models/recipe.model';
import { DindinUser } from '../../src/db/models/user.model';

describe('CookedRecipe Model', () => {
  let mongoServer: MongoMemoryServer;
  let testUserId: mongoose.Types.ObjectId;
  let testRecipeId: mongoose.Types.ObjectId;
  let partnerUserId: mongoose.Types.ObjectId;

  beforeAll(async () => {
    mongoServer = await MongoMemoryServer.create();
    const mongoUri = mongoServer.getUri();
    await mongoose.connect(mongoUri);
  });

  afterAll(async () => {
    await mongoose.disconnect();
    await mongoServer.stop();
  });

  beforeEach(async () => {
    // Create test user
    const testUser = await DindinUser.create({
      authUserId: 'test-auth-user-1',
      name: 'Test User',
      email: 'test@example.com',
      likedRecipes: [],
      dislikedRecipes: [],
      cookedRecipes: [],
    });
    testUserId = testUser._id as mongoose.Types.ObjectId;

    // Create partner user
    const partnerUser = await DindinUser.create({
      authUserId: 'test-auth-user-2',
      name: 'Partner User',
      email: 'partner@example.com',
      likedRecipes: [],
      dislikedRecipes: [],
      cookedRecipes: [],
    });
    partnerUserId = partnerUser._id as mongoose.Types.ObjectId;

    // Create test recipe
    const testRecipe = await Recipe.create({
      title: 'Test Recipe',
      description: 'A test recipe for unit testing',
      image_url: 'https://example.com/test-recipe.jpg',
      cook_time: 30,
      prep_time: 15,
      difficulty: 'easy',
      cuisine: ['Italian'],
      ingredients: [
        { name: 'Pasta', amount: '200g' },
        { name: 'Tomato Sauce', amount: '100ml' }
      ],
      instructions: [
        { step: 1, description: 'Cook pasta' },
        { step: 2, description: 'Add sauce' }
      ],
      servings: 2,
    });
    testRecipeId = testRecipe._id as mongoose.Types.ObjectId;
  });

  afterEach(async () => {
    await CookedRecipe.deleteMany({});
    await Recipe.deleteMany({});
    await DindinUser.deleteMany({});
  });

  describe('Schema Validation', () => {
    it('should create a valid cooked recipe with required fields', async () => {
      const cookedRecipe = new CookedRecipe({
        userId: testUserId,
        recipeId: testRecipeId,
        cookedAt: new Date(),
      });

      const savedRecipe = await cookedRecipe.save();
      expect(savedRecipe._id).toBeDefined();
      expect(savedRecipe.userId.toString()).toBe(testUserId.toString());
      expect(savedRecipe.recipeId.toString()).toBe(testRecipeId.toString());
      expect(savedRecipe.cookedAt).toBeInstanceOf(Date);
    });

    it('should fail to create cooked recipe without required fields', async () => {
      const cookedRecipe = new CookedRecipe({
        userId: testUserId,
        // Missing recipeId
      });

      await expect(cookedRecipe.save()).rejects.toThrow();
    });

    it('should validate rating range', async () => {
      const cookedRecipe = new CookedRecipe({
        userId: testUserId,
        recipeId: testRecipeId,
        rating: 6, // Invalid rating > 5
      });

      await expect(cookedRecipe.save()).rejects.toThrow();
    });

    it('should validate notes max length', async () => {
      const longNotes = 'a'.repeat(1001); // Exceeds 1000 character limit
      const cookedRecipe = new CookedRecipe({
        userId: testUserId,
        recipeId: testRecipeId,
        notes: longNotes,
      });

      await expect(cookedRecipe.save()).rejects.toThrow();
    });

    it('should validate difficulty enum values', async () => {
      const cookedRecipe = new CookedRecipe({
        userId: testUserId,
        recipeId: testRecipeId,
        difficulty: 'invalid_difficulty',
      });

      await expect(cookedRecipe.save()).rejects.toThrow();
    });
  });

  describe('Optional Fields', () => {
    it('should save with all optional fields', async () => {
      const cookedRecipe = new CookedRecipe({
        userId: testUserId,
        recipeId: testRecipeId,
        rating: 5,
        notes: 'Delicious recipe!',
        difficulty: 'easier_than_expected',
        timeSpent: 45,
        modifications: ['Added extra garlic', 'Used whole wheat pasta'],
        wouldCookAgain: true,
        servings: 4,
        cookedWithPartner: true,
        partnerId: partnerUserId,
        cookingMethod: 'modified_slightly',
        mealType: 'dinner',
        occasion: 'date_night',
        tags: ['quick', 'healthy'],
      });

      const savedRecipe = await cookedRecipe.save();
      expect(savedRecipe.rating).toBe(5);
      expect(savedRecipe.notes).toBe('Delicious recipe!');
      expect(savedRecipe.difficulty).toBe('easier_than_expected');
      expect(savedRecipe.timeSpent).toBe(45);
      expect(savedRecipe.modifications).toHaveLength(2);
      expect(savedRecipe.wouldCookAgain).toBe(true);
      expect(savedRecipe.cookedWithPartner).toBe(true);
      expect(savedRecipe.partnerId?.toString()).toBe(partnerUserId.toString());
    });
  });

  describe('Instance Methods', () => {
    it('should calculate days since cooked correctly', async () => {
      const threeDaysAgo = new Date();
      threeDaysAgo.setDate(threeDaysAgo.getDate() - 3);
      
      const cookedRecipe = new CookedRecipe({
        userId: testUserId,
        recipeId: testRecipeId,
        cookedAt: threeDaysAgo,
      });

      const savedRecipe = await cookedRecipe.save();
      const daysSince = savedRecipe.daysSinceCooked();
      expect(daysSince).toBe(3);
    });
  });

  describe('Static Methods', () => {
    beforeEach(async () => {
      // Create multiple cooking sessions for testing
      const sessions = [
        {
          userId: testUserId,
          recipeId: testRecipeId,
          rating: 4,
          timeSpent: 30,
          cookedAt: new Date('2023-01-01'),
        },
        {
          userId: testUserId,
          recipeId: testRecipeId,
          rating: 5,
          timeSpent: 25,
          cookedAt: new Date('2023-01-15'),
        },
        {
          userId: testUserId,
          recipeId: testRecipeId,
          rating: 3,
          timeSpent: 40,
          cookedAt: new Date(), // Recent session
        },
      ];

      await CookedRecipe.insertMany(sessions);
    });

    it('should get user cooking stats', async () => {
      const stats = await CookedRecipe.getUserCookingStats(testUserId.toString());
      
      expect(stats).toHaveLength(1);
      expect(stats[0].totalCookingSessions).toBe(3);
      expect(stats[0].uniqueRecipesCount).toBe(1);
      expect(stats[0].avgRating).toBe(4);
      expect(stats[0].totalTimeSpent).toBe(95);
      expect(stats[0].recentSessions).toBe(1);
    });

    it('should get most cooked recipes', async () => {
      const mostCooked = await CookedRecipe.getMostCookedRecipes(testUserId.toString(), 5);
      
      expect(mostCooked).toHaveLength(1);
      expect(mostCooked[0].cookCount).toBe(3);
      expect(mostCooked[0].avgRating).toBe(4);
      expect(mostCooked[0].recipe.title).toBe('Test Recipe');
    });

    it('should return empty stats for user with no cooking sessions', async () => {
      const newUser = await DindinUser.create({
        authUserId: 'test-auth-user-3',
        name: 'New User',
        email: 'newuser@example.com',
        likedRecipes: [],
        dislikedRecipes: [],
        cookedRecipes: [],
      });

      const stats = await CookedRecipe.getUserCookingStats(newUser._id.toString());
      expect(stats).toHaveLength(0);
    });
  });

  describe('Indexing', () => {
    it('should have proper indexes for efficient querying', async () => {
      const indexes = await CookedRecipe.collection.getIndexes();
      
      // Check that required indexes exist
      const indexNames = Object.keys(indexes);
      expect(indexNames).toContain('userId_1_cookedAt_-1');
      expect(indexNames).toContain('recipeId_1_cookedAt_-1');
      expect(indexNames).toContain('userId_1_recipeId_1_cookedAt_-1');
    });
  });

  describe('Timestamps', () => {
    it('should automatically set createdAt and updatedAt', async () => {
      const cookedRecipe = new CookedRecipe({
        userId: testUserId,
        recipeId: testRecipeId,
      });

      const savedRecipe = await cookedRecipe.save();
      expect(savedRecipe.createdAt).toBeInstanceOf(Date);
      expect(savedRecipe.updatedAt).toBeInstanceOf(Date);
    });

    it('should update updatedAt on modification', async () => {
      const cookedRecipe = await CookedRecipe.create({
        userId: testUserId,
        recipeId: testRecipeId,
      });

      const originalUpdatedAt = cookedRecipe.updatedAt;
      
      // Wait a moment to ensure timestamp difference
      await new Promise(resolve => setTimeout(resolve, 10));
      
      cookedRecipe.rating = 4;
      await cookedRecipe.save();

      expect(cookedRecipe.updatedAt.getTime()).toBeGreaterThan(originalUpdatedAt.getTime());
    });
  });
});