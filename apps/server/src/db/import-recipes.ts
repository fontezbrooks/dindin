import * as fs from 'fs';
import mongoose from 'mongoose';
import * as path from 'path';
import { Recipe } from './models/recipe.model';
import logger from '../lib/logger';

async function importRecipes() {
  try {
    // Connect to MongoDB
    await mongoose.connect('mongodb://root:password@localhost:27017/dindin-app?authSource=admin');
    logger.log('✅ Connected to MongoDB');

    // Drop existing indexes to handle schema changes
    try {
      await Recipe.collection.dropIndexes();
      logger.log('🔧 Dropped existing indexes');
    } catch (err) {
      logger.log('ℹ️  No indexes to drop or error dropping indexes');
    }

    // Ensure indexes are created with the new schema
    await Recipe.ensureIndexes();
    logger.log('📇 Created new indexes');

    // Clear existing recipes
    const deleteResult = await Recipe.deleteMany({});
    logger.log(`🗑️  Cleared ${deleteResult.deletedCount} existing recipes`);

    // Read the JSON file
    const jsonPath = path.join(__dirname, '../../../../../docs/LATESTdindin.recipes.json');
    const jsonContent = fs.readFileSync(jsonPath, 'utf-8');
    const recipesData = JSON.parse(jsonContent);
    
    logger.log(`📄 Found ${recipesData.length} recipes to import`);

    // Process and import each recipe
    const importedRecipes = [];
    for (const recipeData of recipesData) {
      // Transform the data to match our schema
      const transformedRecipe = {
        title: recipeData.title,
        description: recipeData.description,
        image_url: recipeData.image_url,
        cook_time: recipeData.cook_time,
        prep_time: recipeData.prep_time,
        difficulty: recipeData.difficulty?.toLowerCase() || 'medium',
        cuisine: recipeData.cuisine || [],
        cuisine_type: recipeData.cuisine_type,
        dietary_tags: recipeData.dietary_tags || [],
        ingredients: recipeData.ingredients || [],
        instructions: recipeData.instructions || [],
        tags: recipeData.tags || [],
        nutrition: recipeData.nutrition || {},
        servings: recipeData.servings || 2,
        isActive: recipeData.isActive !== false,
        likes: recipeData.likes || 0,
        import_metadata: recipeData.import_metadata || {},
        __v: recipeData.__v || 0,
      };

      // Create the recipe
      const recipe = await Recipe.create(transformedRecipe);
      importedRecipes.push(recipe);
      logger.log(`✅ Imported: ${recipe.title}`);
    }

    logger.log(`\n🎉 Successfully imported ${importedRecipes.length} recipes!`);

    // Show sample of imported data
    const sampleRecipe = await Recipe.findOne();
    logger.log('\n📝 Sample imported recipe:');
    logger.log({
      title: sampleRecipe?.title,
      description: sampleRecipe?.description?.substring(0, 100) + '...',
      cook_time: sampleRecipe?.cook_time,
      difficulty: sampleRecipe?.difficulty,
      cuisine: sampleRecipe?.cuisine,
      dietary_tags: sampleRecipe?.dietary_tags,
      ingredients_count: sampleRecipe?.ingredients?.length,
      instructions_count: sampleRecipe?.instructions?.length,
    });

  } catch (error) {
    logger.error('❌ Import failed:', error);
  } finally {
    await mongoose.disconnect();
    logger.log('📤 Disconnected from MongoDB');
  }
}

// Run the import
importRecipes().catch(console.error);