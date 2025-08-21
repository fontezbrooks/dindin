import { beforeAll, afterAll } from 'vitest';
import mongoose from 'mongoose';

/**
 * Global test setup for favorites-related tests
 * Handles database connection and cleanup
 */

const MONGODB_TEST_URI = process.env.MONGODB_TEST_URI || 'mongodb://localhost:27017/dindin_favorites_test';

beforeAll(async () => {
  // Connect to test database
  try {
    await mongoose.connect(MONGODB_TEST_URI);
    console.log('Connected to test database for favorites tests');
    
    // Ensure clean state
    await mongoose.connection.db.dropDatabase();
    console.log('Test database cleaned');
    
  } catch (error) {
    console.error('Failed to connect to test database:', error);
    process.exit(1);
  }
});

afterAll(async () => {
  try {
    // Clean up test database
    await mongoose.connection.db.dropDatabase();
    console.log('Test database cleaned up');
    
    // Close connection
    await mongoose.connection.close();
    console.log('Disconnected from test database');
    
  } catch (error) {
    console.error('Failed to cleanup test database:', error);
  }
});

/**
 * Helper function to create test data
 */
export const createTestUser = async (overrides = {}) => {
  const { DindinUser } = await import('../../src/db');
  
  return await DindinUser.create({
    authUserId: 'test-auth-user-' + Date.now(),
    name: 'Test User',
    email: `test-${Date.now()}@example.com`,
    likedRecipes: [],
    dislikedRecipes: [],
    cookedRecipes: [],
    dietaryRestrictions: [],
    allergies: [],
    cookingSkill: 'beginner',
    ...overrides,
  });
};

export const createTestRecipe = async (overrides = {}) => {
  const { Recipe } = await import('../../src/db');
  
  return await Recipe.create({
    title: 'Test Recipe ' + Date.now(),
    description: 'A test recipe for unit testing',
    image_url: 'https://example.com/test-image.jpg',
    cook_time: 30,
    prep_time: 15,
    difficulty: 'easy',
    cuisine: ['Test'],
    ingredients: [
      { name: 'Test Ingredient', amount: '1', unit: 'cup' }
    ],
    instructions: [
      { step: 1, description: 'Test instruction' }
    ],
    tags: ['test'],
    servings: 2,
    likes: 0,
    ...overrides,
  });
};

/**
 * Helper function to clean up specific collections
 */
export const cleanupCollections = async (...collections: string[]) => {
  for (const collectionName of collections) {
    const collection = mongoose.connection.collection(collectionName);
    await collection.deleteMany({});
  }
};

/**
 * Helper function to wait for database operations to complete
 */
export const waitForDatabase = async (ms = 100) => {
  return new Promise(resolve => setTimeout(resolve, ms));
};