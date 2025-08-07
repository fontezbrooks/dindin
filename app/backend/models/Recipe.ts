// Recipe Model for MongoDB
// Based on schema-dindin-recipes-standardJSON.json

import { Schema, model, Model } from "mongoose";
import type { IRecipe, IRecipeStatics, IIngredient, IInstruction, INutrition, IImportMetadata } from "../types/index.js";

type RecipeModel = Model<IRecipe> & IRecipeStatics;

// Ingredient subdocument schema
const IngredientSchema = new Schema<IIngredient>({
  name: {
    type: String,
    required: true,
    trim: true,
  },
  amount: {
    type: String,
    required: true,
    trim: true,
  },
  unit: {
    type: String,
    default: null,
    trim: true,
  },
});

// Instruction subdocument schema
const InstructionSchema = new Schema<IInstruction>({
  step: {
    type: Number,
    required: true,
    min: 1,
  },
  description: {
    type: String,
    required: true,
    trim: true,
  },
  duration: {
    type: Number,
    default: null,
    min: 0,
  },
});

// Nutrition subdocument schema
const NutritionSchema = new Schema<INutrition>({
  calories: {
    type: Number,
    required: true,
    min: 0,
  },
  protein: {
    type: Number,
    required: true,
    min: 0,
  },
  carbs: {
    type: Number,
    required: true,
    min: 0,
  },
  fat: {
    type: Number,
    required: true,
    min: 0,
  },
  fiber: {
    type: Number,
    required: true,
    min: 0,
  },
  sugar: {
    type: Number,
    required: true,
    min: 0,
  },
});

// Import metadata subdocument schema
const ImportMetadataSchema = new Schema<IImportMetadata>({
  source_url: {
    type: String,
    required: true,
  },
  scraper_name: {
    type: String,
    required: true,
  },
  scraper_version: {
    type: String,
    required: true,
  },
  confidence_score: {
    type: Number,
    required: true,
    min: 0,
    max: 1,
  },
  extracted_at: {
    type: String,
    required: true,
  },
  notes: {
    type: String,
    required: true,
  },
});

// Main Recipe schema
const RecipeSchema = new Schema<IRecipe, RecipeModel>(
  {
    title: {
      type: String,
      required: true,
      trim: true,
      maxlength: 200,
    },
    description: {
      type: String,
      required: true,
      trim: true,
      maxlength: 1000,
    },
    difficulty: {
      type: String,
      required: true,
      enum: ["easy", "medium", "hard"],
      lowercase: true,
    },
    ingredients: {
      type: [IngredientSchema],
      required: true,
      validate: {
        validator: function (v: IIngredient[]): boolean {
          return Array.isArray(v) && v.length > 0;
        },
        message: "Recipe must have at least one ingredient",
      },
    },
    instructions: {
      type: [InstructionSchema],
      required: true,
      validate: {
        validator: function (v: IInstruction[]): boolean {
          return Array.isArray(v) && v.length > 0;
        },
        message: "Recipe must have at least one instruction",
      },
    },

    // Timing fields
    cook_time: {
      type: Number,
      min: 0,
    },
    cookTime: {
      type: Number,
      min: 0,
    },
    prep_time: {
      type: Number,
      min: 0,
    },
    prepTime: {
      type: Number,
      min: 0,
    },

    // Media
    image: {
      type: String,
      trim: true,
    },
    image_url: {
      type: String,
      trim: true,
    },

    // Categories and tags
    cuisine: [
      {
        type: String,
        trim: true,
        lowercase: true,
      },
    ],
    cuisine_type: {
      type: String,
      trim: true,
      lowercase: true,
    },
    dietary: [
      {
        type: String,
        trim: true,
        lowercase: true,
      },
    ],
    dietary_tags: [
      {
        type: String,
        trim: true,
        lowercase: true,
      },
    ],
    tags: [
      {
        type: String,
        trim: true,
        lowercase: true,
      },
    ],

    // Metrics
    likes: {
      type: Number,
      default: 0,
      min: 0,
    },
    dislikes: {
      type: Number,
      default: 0,
      min: 0,
    },
    servings: {
      type: Number,
      min: 1,
      default: 4,
    },

    // Optional nutrition info
    nutrition: NutritionSchema,

    // Import metadata
    import_metadata: ImportMetadataSchema,

    // Status
    isActive: {
      type: Boolean,
      default: true,
    },
  },
  {
    timestamps: true, // Adds createdAt and updatedAt
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

// Indexes for performance
RecipeSchema.index({ title: "text", description: "text" }); // Text search
RecipeSchema.index({ difficulty: 1 });
RecipeSchema.index({ cuisine_type: 1 });
RecipeSchema.index({ dietary_tags: 1 });
RecipeSchema.index({ tags: 1 });
RecipeSchema.index({ isActive: 1 });
RecipeSchema.index({ likes: -1 }); // Sort by popularity
RecipeSchema.index({ createdAt: -1 }); // Sort by newest

// Virtual for total time
RecipeSchema.virtual("totalTime").get(function (this: IRecipe): number {
  const cookTime = this.cook_time || this.cookTime || 0;
  const prepTime = this.prep_time || this.prepTime || 0;
  return cookTime + prepTime;
});

// Virtual for rating calculation
RecipeSchema.virtual("rating").get(function (this: IRecipe): number {
  const total = this.likes + this.dislikes;
  if (total === 0) return 0;
  return (this.likes / total) * 5;
});

// Static method to get random recipes
RecipeSchema.statics.getRandomRecipes = function (
  this: RecipeModel,
  limit = 50,
  filters: Record<string, unknown> = {}
): Promise<IRecipe[]> {
  const matchStage = { isActive: true, ...filters };

  return this.aggregate([{ $match: matchStage }, { $sample: { size: limit } }]);
};

// Static method for text search
RecipeSchema.statics.searchRecipes = function (
  this: RecipeModel,
  searchText: string,
  filters: Record<string, unknown> = {},
  limit = 20
): Promise<IRecipe[]> {
  const matchStage = {
    isActive: true,
    $text: { $search: searchText },
    ...filters,
  };

  return this.find(matchStage, { score: { $meta: "textScore" } })
    .sort({ score: { $meta: "textScore" } })
    .limit(limit);
};

// Instance method to increment likes
RecipeSchema.methods.like = function (this: IRecipe): Promise<IRecipe> {
  this.likes = (this.likes || 0) + 1;
  return this.save();
};

// Instance method to increment dislikes
RecipeSchema.methods.dislike = function (this: IRecipe): Promise<IRecipe> {
  this.dislikes = (this.dislikes || 0) + 1;
  return this.save();
};

// Pre-save middleware to ensure instruction steps are sequential
RecipeSchema.pre<IRecipe>("save", function (next) {
  if (this.isModified("instructions")) {
    this.instructions.sort((a, b) => a.step - b.step);

    // Ensure steps are sequential starting from 1
    this.instructions.forEach((instruction, index) => {
      instruction.step = index + 1;
    });
  }
  next();
});

export default model<IRecipe, RecipeModel>("Recipe", RecipeSchema);
