import mongoose from "mongoose";

const { Schema, model } = mongoose;

const recipeSchema = new Schema(
	{
		title: {
			type: String,
			required: true,
			trim: true,
		},
		description: {
			type: String,
			required: true,
			trim: true,
		},
		image_url: {
			type: String,
			required: true,
		},
		cook_time: {
			type: Number,
			required: true,
			min: 0,
			max: 1440, // 24 hours max
		},
		prep_time: {
			type: Number,
			required: true,
			min: 0,
			max: 1440, // 24 hours max
		},
		difficulty: {
			type: String,
			enum: ["easy", "Easy", "medium", "Medium", "hard", "Hard"],
			required: true,
			lowercase: true,
		},
		cuisine: [
			{
				type: String,
				trim: true,
			},
		],
		cuisine_type: {
			type: String,
			trim: true,
		},
		dietary_tags: [
			{
				type: String,
				trim: true,
			},
		],
		ingredients: [
			{
				name: {
					type: String,
					required: true,
				},
				amount: {
					type: String,
					required: true,
				},
				unit: {
					type: String,
				},
			},
		],
		instructions: [
			{
				step: {
					type: Number,
					required: true,
				},
				description: {
					type: String,
					required: true,
				},
			},
		],
		tags: [
			{
				type: String,
				lowercase: true,
				trim: true,
			},
		],
		nutrition: {
			calories: {
				type: Number,
				min: 0,
			},
			protein: {
				type: Number,
				min: 0,
			},
			carbs: {
				type: Number,
				min: 0,
			},
			fat: {
				type: Number,
				min: 0,
			},
			fiber: {
				type: Number,
				min: 0,
			},
			sugar: {
				type: Number,
				min: 0,
			},
		},
		servings: {
			type: Number,
			default: 2,
			min: 1,
			max: 100,
		},
		isActive: {
			type: Boolean,
			default: true,
		},
		likes: {
			type: Number,
			default: 0,
			min: 0,
		},
		import_metadata: {
			source_url: String,
			scraper_name: String,
			scraper_version: String,
			confidence_score: Number,
			extracted_at: Date,
			notes: String,
		},
		__v: {
			type: Number,
			default: 0,
		},
	},
	{
		collection: "recipes",
		timestamps: false, // The new JSON has createdAt/updatedAt explicitly
	},
);

// Index for efficient querying
recipeSchema.index({ title: "text" });
recipeSchema.index({ cuisine: 1 });
recipeSchema.index({ difficulty: 1 });
recipeSchema.index({ cook_time: 1 });
recipeSchema.index({ tags: 1 });
recipeSchema.index({ dietary_tags: 1 });
recipeSchema.index({ isActive: 1 });

const Recipe = model("Recipe", recipeSchema);

export { Recipe };
