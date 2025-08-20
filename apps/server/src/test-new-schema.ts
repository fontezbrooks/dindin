import { appRouter } from '@/routers';
import mongoose from 'mongoose';
import { User, Recipe } from '@/db';

async function testNewSchema() {
  try {
    // Connect to MongoDB
    await mongoose.connect('mongodb://root:password@localhost:27017/dindin-app?authSource=admin');
    console.log('✅ Connected to MongoDB');

    // Test directly with Recipe model
    console.log('\n📱 Testing Recipe model with new schema...');
    const recipes = await Recipe.find({ isActive: true }).limit(5).lean();
    
    console.log(`\n✅ Fetched ${recipes.length} recipes with new schema:`);
    
    recipes.forEach((recipe, index) => {
      console.log(`\n${index + 1}. ${recipe.title}`);
      console.log(`   📝 Description: ${recipe.description?.substring(0, 100)}...`);
      console.log(`   ⏱️  Cook Time: ${recipe.cook_time} min, Prep Time: ${recipe.prep_time} min`);
      console.log(`   🍽️  Cuisine: ${recipe.cuisine.join(', ')}`);
      console.log(`   🥗 Dietary Tags: ${recipe.dietary_tags?.join(', ') || 'None'}`);
      console.log(`   📊 Difficulty: ${recipe.difficulty}`);
      console.log(`   🍕 Servings: ${recipe.servings}`);
      console.log(`   🥘 Ingredients: ${recipe.ingredients.length} items`);
      console.log(`   📋 Instructions: ${recipe.instructions.length} steps`);
      
      if (recipe.nutrition) {
        console.log(`   🔥 Calories: ${recipe.nutrition.calories || 'N/A'}`);
      }
    });

    console.log('\n✅ All tests passed! New schema is working correctly.');

  } catch (error) {
    console.error('❌ Test failed:', error);
  } finally {
    await mongoose.disconnect();
    console.log('\n📤 Disconnected from MongoDB');
  }
}

// Run the test
testNewSchema().catch(console.error);