import 'dotenv/config';
import mongoose from 'mongoose';
import { auth } from '../lib/auth';

async function createTestUser() {
  try {
    // Connect to MongoDB
    await mongoose.connect(process.env.DATABASE_URL || 'mongodb://root:password@localhost:27017/dindin-app?authSource=admin');
    console.log('Connected to MongoDB');

    // Create test user credentials
    const testEmail = 'test@dindin.app';
    const testPassword = 'test123';
    const testName = 'Test User';

    console.log('\n📧 Test User Credentials:');
    console.log('Email:', testEmail);
    console.log('Password:', testPassword);
    console.log('Name:', testName);
    
    console.log('\n✨ You can now sign in with these credentials in the app!');

  } catch (error) {
    console.error('Error creating test user:', error);
  } finally {
    await mongoose.disconnect();
    console.log('\nDisconnected from MongoDB');
  }
}

createTestUser();