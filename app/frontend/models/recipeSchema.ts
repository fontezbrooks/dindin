// MongoDB Recipe Schema for DinDin App
// Based on schema-dindin-recipes-standardJSON.json

export interface Recipe {
  _id?: string;
  __v?: number;
  title: string;
  description: string;
  difficulty: string;
  ingredients: Ingredient[];
  instructions: Instruction[];
  
  // Timing fields
  cook_time?: number;
  cookTime?: number;
  prep_time?: number;
  prepTime?: number;
  
  // Media
  image?: string;
  image_url?: string;
  
  // Categories and tags
  cuisine?: string[];
  cuisine_type?: string;
  dietary?: string[];
  dietary_tags?: string[];
  tags?: string[];
  
  // Metrics
  likes?: number;
  dislikes?: number;
  servings?: number;
  
  // Optional nutrition info
  nutrition?: Nutrition;
  
  // Import metadata
  import_metadata?: ImportMetadata;
  
  // Status
  isActive?: boolean;
  
  // Timestamps
  createdAt?: Date;
  updatedAt?: Date;
}

export interface Ingredient {
  _id?: string;
  name: string;
  amount: string;
  unit: string | null;
}

export interface Instruction {
  _id?: string;
  step: number;
  description: string;
  duration?: number;
}

export interface Nutrition {
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
  fiber: number;
  sugar: number;
}

export interface ImportMetadata {
  source_url: string;
  scraper_name: string;
  scraper_version: string;
  confidence_score: number;
  extracted_at: string;
  notes: string;
}

// Frontend-specific interface for the recipe store
// Maps MongoDB fields to UI-friendly format
export interface RecipeUI {
  id: string; // maps from _id
  title: string;
  cookTime: string; // formatted string like "25 mins"
  difficulty: string;
  image: string; // maps from image_url or image
  description: string;
  rating: number; // calculated from likes/dislikes
  matches: number; // simulated for now
  ingredients: string[]; // simplified for UI display
  tags: string[];
}

// Utility class for converting between MongoDB and UI formats
export class RecipeConverter {
  public static toUI(mongoRecipe: Recipe): RecipeUI {
    const totalTime = (mongoRecipe.cook_time || mongoRecipe.cookTime || 0) + 
                     (mongoRecipe.prep_time || mongoRecipe.prepTime || 0);
    
    // Calculate rating from likes/dislikes (default to random for now)
    const likes = mongoRecipe.likes || 0;
    const dislikes = mongoRecipe.dislikes || 0;
    const total = likes + dislikes;
    const rating = total > 0 ? (likes / total) * 5 : Math.random() * 2 + 3.5;

    return {
      id: mongoRecipe._id || '',
      title: mongoRecipe.title,
      cookTime: totalTime > 0 ? `${totalTime} mins` : '30 mins',
      difficulty: mongoRecipe.difficulty,
      image: mongoRecipe.image_url || mongoRecipe.image || '',
      description: mongoRecipe.description,
      rating: Math.round(rating * 10) / 10,
      matches: Math.floor(Math.random() * 2000 + 500), // simulated for now
      ingredients: mongoRecipe.ingredients.map(ing => 
        `${ing.amount}${ing.unit ? ' ' + ing.unit : ''} ${ing.name}`
      ),
      tags: mongoRecipe.tags || mongoRecipe.dietary_tags || []
    };
  }

  public static fromUI(uiRecipe: RecipeUI): Partial<Recipe> {
    return {
      title: uiRecipe.title,
      description: uiRecipe.description,
      difficulty: uiRecipe.difficulty,
      image_url: uiRecipe.image,
      tags: uiRecipe.tags,
      // Note: ingredients and instructions would need more complex parsing
      // from simplified UI format back to structured format
    };
  }
}

// JSON conversion utilities
export class Convert {
  public static toRecipes(json: string): Recipe[] {
    return JSON.parse(json);
  }

  public static recipesToJson(value: Recipe[]): string {
    return JSON.stringify(value);
  }
}