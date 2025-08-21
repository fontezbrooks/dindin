import { describe, it, expect, beforeEach, afterEach, beforeAll, afterAll } from 'vitest';
import mongoose from 'mongoose';
import { MongoMemoryServer } from 'mongodb-memory-server';
import request from 'supertest';
import { app } from '../../src/index';
import { CookedRecipe } from '../../src/models/cooked-recipe.model';
import { Recipe } from '../../src/db/models/recipe.model';
import { DindinUser } from '../../src/db/models/user.model';

describe('Cooked Recipes E2E Tests', () => {
  let mongoServer: MongoMemoryServer;
  let testUser: any;
  let testRecipe: any;
  let authToken: string;

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
    // Clear all collections
    await CookedRecipe.deleteMany({});
    await Recipe.deleteMany({});
    await DindinUser.deleteMany({});

    // Create test user
    testUser = await DindinUser.create({
      authUserId: 'test-auth-user-1',
      name: 'Test User',
      email: 'test@example.com',
      likedRecipes: [],
      dislikedRecipes: [],
      cookedRecipes: [],
      stats: { recipesCooked: 0, totalSwipes: 0, totalMatches: 0 },
    });

    // Create test recipe
    testRecipe = await Recipe.create({
      title: 'Test Recipe',
      description: 'A delicious test recipe',
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

    // Mock authentication token (in real app, this would come from auth service)
    authToken = 'mock-auth-token-for-test';
  });

  afterEach(async () => {
    await CookedRecipe.deleteMany({});
    await Recipe.deleteMany({});
    await DindinUser.deleteMany({});
  });

  describe('POST /trpc/cookedRecipes.markAsCooked', () => {
    it('should mark recipe as cooked successfully', async () => {
      const response = await request(app)
        .post('/trpc/cookedRecipes.markAsCooked')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          recipeId: testRecipe._id.toString(),
          rating: 4,
          notes: 'Delicious recipe!',
          timeSpent: 45,
          wouldCookAgain: true,
          mealType: 'dinner',
          occasion: 'weekday',
        });

      expect(response.status).toBe(200);
      expect(response.body.result.data.success).toBe(true);
      expect(response.body.result.data.cookedRecipe.rating).toBe(4);

      // Verify database state
      const cookedRecipe = await CookedRecipe.findOne({
        userId: testUser._id,
        recipeId: testRecipe._id,
      });
      expect(cookedRecipe).toBeTruthy();
      expect(cookedRecipe!.notes).toBe('Delicious recipe!');
      expect(cookedRecipe!.mealType).toBe('dinner');
    });

    it('should return 400 for invalid recipe ID', async () => {
      const response = await request(app)
        .post('/trpc/cookedRecipes.markAsCooked')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          recipeId: 'invalid-recipe-id',
          rating: 4,
        });

      expect(response.status).toBe(400);
      expect(response.body.error.message).toContain('Invalid recipe ID');
    });

    it('should return 404 for non-existent recipe', async () => {
      const fakeRecipeId = new mongoose.Types.ObjectId().toString();
      
      const response = await request(app)
        .post('/trpc/cookedRecipes.markAsCooked')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          recipeId: fakeRecipeId,
          rating: 4,
        });

      expect(response.status).toBe(404);
      expect(response.body.error.message).toBe('Recipe not found');
    });

    it('should validate input data correctly', async () => {
      const response = await request(app)
        .post('/trpc/cookedRecipes.markAsCooked')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          recipeId: testRecipe._id.toString(),
          rating: 6, // Invalid rating > 5
          notes: 'a'.repeat(1001), // Exceeds max length
        });

      expect(response.status).toBe(400);
      expect(response.body.error.message).toContain('validation');
    });
  });

  describe('GET /trpc/cookedRecipes.getRecentlyCooked', () => {
    beforeEach(async () => {
      // Create test cooking sessions
      const sessions = [
        {
          userId: testUser._id,
          recipeId: testRecipe._id,
          rating: 4,
          notes: 'Great recipe!',
          cookedAt: new Date('2023-12-01'),
          timeSpent: 30,
          mealType: 'dinner',
        },
        {
          userId: testUser._id,
          recipeId: testRecipe._id,
          rating: 5,
          notes: 'Even better the second time!',
          cookedAt: new Date('2023-12-15'),
          timeSpent: 25,
          occasion: 'date_night',
        },
        {
          userId: testUser._id,
          recipeId: testRecipe._id,
          rating: 3,
          cookedAt: new Date('2023-12-30'),
          timeSpent: 35,
        },
      ];

      await CookedRecipe.insertMany(sessions);
    });

    it('should get recently cooked recipes with default pagination', async () => {
      const response = await request(app)
        .get('/trpc/cookedRecipes.getRecentlyCooked')
        .set('Authorization', `Bearer ${authToken}`)
        .query({
          input: JSON.stringify({
            limit: 20,
            offset: 0,
          }),
        });

      expect(response.status).toBe(200);
      expect(response.body.result.data.cookedRecipes).toHaveLength(3);
      expect(response.body.result.data.total).toBe(3);
      expect(response.body.result.data.hasMore).toBe(false);

      // Should be sorted by most recent first
      const recipes = response.body.result.data.cookedRecipes;
      expect(new Date(recipes[0].cookedAt).getTime())
        .toBeGreaterThan(new Date(recipes[1].cookedAt).getTime());

      // Should include recipe details and cooking frequency
      expect(recipes[0].recipe.title).toBe('Test Recipe');
      expect(recipes[0].cookingFrequency).toBe(3);
    });

    it('should filter by date range', async () => {
      const response = await request(app)
        .get('/trpc/cookedRecipes.getRecentlyCooked')
        .set('Authorization', `Bearer ${authToken}`)
        .query({
          input: JSON.stringify({
            dateFrom: '2023-12-10',
            dateTo: '2023-12-20',
          }),
        });

      expect(response.status).toBe(200);
      expect(response.body.result.data.cookedRecipes).toHaveLength(1);
      expect(response.body.result.data.cookedRecipes[0].occasion).toBe('date_night');
    });

    it('should filter by minimum rating', async () => {
      const response = await request(app)
        .get('/trpc/cookedRecipes.getRecentlyCooked')
        .set('Authorization', `Bearer ${authToken}`)
        .query({
          input: JSON.stringify({
            minRating: 4,
          }),
        });

      expect(response.status).toBe(200);
      expect(response.body.result.data.cookedRecipes).toHaveLength(2);
      expect(
        response.body.result.data.cookedRecipes.every(
          (recipe: any) => recipe.rating >= 4
        )
      ).toBe(true);
    });

    it('should paginate correctly', async () => {
      const response = await request(app)
        .get('/trpc/cookedRecipes.getRecentlyCooked')
        .set('Authorization', `Bearer ${authToken}`)
        .query({
          input: JSON.stringify({
            limit: 2,
            offset: 1,
          }),
        });

      expect(response.status).toBe(200);
      expect(response.body.result.data.cookedRecipes).toHaveLength(2);
      expect(response.body.result.data.total).toBe(3);
      expect(response.body.result.data.hasMore).toBe(false);
    });

    it('should sort by rating when specified', async () => {
      const response = await request(app)
        .get('/trpc/cookedRecipes.getRecentlyCooked')
        .set('Authorization', `Bearer ${authToken}`)
        .query({
          input: JSON.stringify({
            sortBy: 'rating',
          }),
        });

      expect(response.status).toBe(200);
      const recipes = response.body.result.data.cookedRecipes;
      expect(recipes[0].rating).toBe(5);
      expect(recipes[1].rating).toBe(4);
      expect(recipes[2].rating).toBe(3);
    });
  });

  describe('GET /trpc/cookedRecipes.getCookingStats', () => {
    beforeEach(async () => {
      // Create another recipe for better stats
      const recipe2 = await Recipe.create({
        title: 'Second Recipe',
        description: 'Another test recipe',
        image_url: 'https://example.com/recipe2.jpg',
        cook_time: 20,
        prep_time: 10,
        difficulty: 'medium',
        cuisine: ['Mexican'],
        ingredients: [{ name: 'Beans', amount: '100g' }],
        instructions: [{ step: 1, description: 'Cook beans' }],
        servings: 3,
      });

      const sessions = [
        // Multiple sessions of first recipe
        {
          userId: testUser._id,
          recipeId: testRecipe._id,
          rating: 4,
          timeSpent: 30,
          cookedAt: new Date('2023-12-01'),
        },
        {
          userId: testUser._id,
          recipeId: testRecipe._id,
          rating: 5,
          timeSpent: 25,
          cookedAt: new Date('2023-12-15'),
        },
        // One session of second recipe
        {
          userId: testUser._id,
          recipeId: recipe2._id,
          rating: 3,
          timeSpent: 20,
          cookedAt: new Date('2023-12-20'),
        },
        // Recent session (today)
        {
          userId: testUser._id,
          recipeId: testRecipe._id,
          rating: 4,
          timeSpent: 28,
          cookedAt: new Date(),
        },
      ];

      await CookedRecipe.insertMany(sessions);
    });

    it('should return comprehensive cooking statistics', async () => {
      const response = await request(app)
        .get('/trpc/cookedRecipes.getCookingStats')
        .set('Authorization', `Bearer ${authToken}`);

      expect(response.status).toBe(200);
      
      const stats = response.body.result.data;
      expect(stats.basicStats.totalCookingSessions).toBe(4);
      expect(stats.basicStats.uniqueRecipesCount).toBe(2);
      expect(stats.basicStats.avgRating).toBe(4);
      expect(stats.basicStats.totalTimeSpent).toBe(103);
      expect(stats.basicStats.recentSessions).toBe(1);

      expect(stats.mostCookedRecipes).toHaveLength(2);
      expect(stats.mostCookedRecipes[0].cookCount).toBe(3);
      expect(stats.mostCookedRecipes[0].recipe.title).toBe('Test Recipe');

      expect(stats.recentActivity).toBeDefined();
      expect(stats.currentStreak).toBeGreaterThanOrEqual(1);
    });
  });

  describe('GET /trpc/cookedRecipes.getCookingHistory', () => {
    beforeEach(async () => {
      const sessions = [
        {
          userId: testUser._id,
          recipeId: testRecipe._id,
          rating: 4,
          notes: 'First attempt',
          cookedAt: new Date('2023-11-01'),
        },
        {
          userId: testUser._id,
          recipeId: testRecipe._id,
          rating: 5,
          notes: 'Much improved!',
          cookedAt: new Date('2023-12-01'),
        },
        {
          userId: testUser._id,
          recipeId: testRecipe._id,
          rating: 5,
          notes: 'Perfect execution',
          cookedAt: new Date('2023-12-15'),
        },
      ];

      await CookedRecipe.insertMany(sessions);
    });

    it('should return cooking history for specific recipe', async () => {
      const response = await request(app)
        .get('/trpc/cookedRecipes.getCookingHistory')
        .set('Authorization', `Bearer ${authToken}`)
        .query({
          input: JSON.stringify({
            recipeId: testRecipe._id.toString(),
          }),
        });

      expect(response.status).toBe(200);
      expect(response.body.result.data.history).toHaveLength(3);
      expect(response.body.result.data.total).toBe(3);
      expect(response.body.result.data.hasMore).toBe(false);

      // Should be sorted by most recent first
      const history = response.body.result.data.history;
      expect(history[0].notes).toBe('Perfect execution');
      expect(history[2].notes).toBe('First attempt');
    });

    it('should paginate cooking history correctly', async () => {
      const response = await request(app)
        .get('/trpc/cookedRecipes.getCookingHistory')
        .set('Authorization', `Bearer ${authToken}`)
        .query({
          input: JSON.stringify({
            recipeId: testRecipe._id.toString(),
            limit: 2,
            offset: 1,
          }),
        });

      expect(response.status).toBe(200);
      expect(response.body.result.data.history).toHaveLength(2);
      expect(response.body.result.data.total).toBe(3);
      expect(response.body.result.data.hasMore).toBe(false);
    });
  });

  describe('PUT /trpc/cookedRecipes.updateCookingSession', () => {
    let testSessionId: string;

    beforeEach(async () => {
      const session = await CookedRecipe.create({
        userId: testUser._id,
        recipeId: testRecipe._id,
        rating: 3,
        notes: 'Original notes',
        timeSpent: 30,
      });
      testSessionId = session._id.toString();
    });

    it('should update cooking session successfully', async () => {
      const response = await request(app)
        .put('/trpc/cookedRecipes.updateCookingSession')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          sessionId: testSessionId,
          rating: 5,
          notes: 'Updated notes after reflection',
          wouldCookAgain: true,
          tags: ['favorite', 'easy'],
        });

      expect(response.status).toBe(200);
      expect(response.body.result.data.success).toBe(true);
      expect(response.body.result.data.session.rating).toBe(5);
      expect(response.body.result.data.session.notes).toBe('Updated notes after reflection');
      expect(response.body.result.data.session.wouldCookAgain).toBe(true);

      // Verify database state
      const updatedSession = await CookedRecipe.findById(testSessionId);
      expect(updatedSession!.rating).toBe(5);
      expect(updatedSession!.tags).toContain('favorite');
    });

    it('should return 404 for non-existent session', async () => {
      const fakeSessionId = new mongoose.Types.ObjectId().toString();

      const response = await request(app)
        .put('/trpc/cookedRecipes.updateCookingSession')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          sessionId: fakeSessionId,
          rating: 4,
        });

      expect(response.status).toBe(404);
      expect(response.body.error.message).toBe('Cooking session not found');
    });
  });

  describe('DELETE /trpc/cookedRecipes.deleteCookingSession', () => {
    let testSessionId: string;

    beforeEach(async () => {
      const session = await CookedRecipe.create({
        userId: testUser._id,
        recipeId: testRecipe._id,
        rating: 4,
        timeSpent: 30,
      });
      testSessionId = session._id.toString();

      // Update user stats
      testUser.stats.recipesCooked = 1;
      testUser.cookedRecipes.push({
        recipeId: testRecipe._id,
        cookedAt: session.cookedAt,
        rating: 4,
      });
      await testUser.save();
    });

    it('should delete cooking session successfully', async () => {
      const response = await request(app)
        .delete('/trpc/cookedRecipes.deleteCookingSession')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          sessionId: testSessionId,
        });

      expect(response.status).toBe(200);
      expect(response.body.result.data.success).toBe(true);

      // Verify session was deleted from database
      const deletedSession = await CookedRecipe.findById(testSessionId);
      expect(deletedSession).toBe(null);

      // Verify user stats were updated
      const updatedUser = await DindinUser.findById(testUser._id);
      expect(updatedUser!.stats.recipesCooked).toBe(0);
    });

    it('should return 404 for non-existent session', async () => {
      const fakeSessionId = new mongoose.Types.ObjectId().toString();

      const response = await request(app)
        .delete('/trpc/cookedRecipes.deleteCookingSession')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          sessionId: fakeSessionId,
        });

      expect(response.status).toBe(404);
      expect(response.body.error.message).toBe('Cooking session not found');
    });
  });

  describe('Authentication and Authorization', () => {
    it('should return 401 for unauthenticated requests', async () => {
      const response = await request(app)
        .post('/trpc/cookedRecipes.markAsCooked')
        .send({
          recipeId: testRecipe._id.toString(),
          rating: 4,
        });

      expect(response.status).toBe(401);
      expect(response.body.error.message).toContain('UNAUTHORIZED');
    });

    it('should return 403 when trying to access other user data', async () => {
      // Create another user
      const otherUser = await DindinUser.create({
        authUserId: 'other-auth-user',
        name: 'Other User',
        email: 'other@example.com',
        likedRecipes: [],
        dislikedRecipes: [],
        cookedRecipes: [],
        stats: { recipesCooked: 0, totalSwipes: 0, totalMatches: 0 },
      });

      // Create session for other user
      const otherSession = await CookedRecipe.create({
        userId: otherUser._id,
        recipeId: testRecipe._id,
        rating: 4,
      });

      // Try to update other user's session
      const response = await request(app)
        .put('/trpc/cookedRecipes.updateCookingSession')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          sessionId: otherSession._id.toString(),
          rating: 5,
        });

      expect(response.status).toBe(404);
      expect(response.body.error.message).toBe('Cooking session not found');
    });
  });

  describe('Error Handling', () => {
    it('should handle database connection errors gracefully', async () => {
      // Simulate database disconnect
      await mongoose.disconnect();

      const response = await request(app)
        .get('/trpc/cookedRecipes.getRecentlyCooked')
        .set('Authorization', `Bearer ${authToken}`);

      expect(response.status).toBe(500);
      expect(response.body.error.message).toContain('database');

      // Reconnect for cleanup
      await mongoose.connect(mongoServer.getUri());
    });

    it('should validate input schemas correctly', async () => {
      const response = await request(app)
        .post('/trpc/cookedRecipes.markAsCooked')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          recipeId: 'not-a-valid-id',
          rating: 'not-a-number',
          timeSpent: -5, // Invalid negative value
        });

      expect(response.status).toBe(400);
      expect(response.body.error.data.zodError).toBeDefined();
    });
  });
});