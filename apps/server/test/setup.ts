import { beforeAll, afterAll, beforeEach } from "bun:test";
import mongoose from "mongoose";

// Test database URL - use a different database name for tests
const TEST_DATABASE_URL = process.env.TEST_DATABASE_URL || 
  "mongodb://root:password@localhost:27017/dindin-test?authSource=admin";

// Connect to test database before all tests
beforeAll(async () => {
  // Disconnect from any existing connection first
  if (mongoose.connection.readyState !== 0) {
    await mongoose.disconnect();
  }
  
  await mongoose.connect(TEST_DATABASE_URL);
  console.log("✅ Connected to test database");
});

// Clean up database before each test
beforeEach(async () => {
  if (mongoose.connection.db) {
    const collections = await mongoose.connection.db.collections();
    for (const collection of collections) {
      await collection.deleteMany({});
    }
  }
});

// Disconnect after all tests
afterAll(async () => {
  if (mongoose.connection.readyState !== 0) {
    await mongoose.disconnect();
    console.log("✅ Disconnected from test database");
  }
});

// Mock environment variables for testing
process.env.BETTER_AUTH_SECRET = "test-secret-key";
process.env.CORS_ORIGIN = "http://localhost:3000";