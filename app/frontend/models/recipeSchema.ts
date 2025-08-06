// To parse this data:
//
//   import { Convert } from "./file";
//
//   const recipies = Convert.toRecipies(json);

export interface Recipies {
  title: string;
  ingredients: Ingredient[];
  instructions: Instruction[];
  difficulty: Difficulty;
  description: string;
  image_url: string;
  prep_time: number;
  cook_time: number;
  cuisine_type: string;
  dietary_tags: string[];
  nutrition: Nutrition;
  import_metadata: ImportMetadata;
}

export enum Difficulty {
  Easy = "easy",
  Hard = "hard",
  Medium = "medium",
}

export interface ImportMetadata {
  source_url: string;
  scraper_name: ScraperName;
  scraper_version: ScraperVersion;
  confidence_score: number;
  extracted_at: Date;
  notes: string;
}

export enum ScraperName {
  ManualCuration = "manual_curation",
}

export enum ScraperVersion {
  The100 = "1.0.0",
}

export interface Ingredient {
  name: string;
  amount: string;
  unit: string;
}

export interface Instruction {
  step: number;
  description: string;
  duration: number;
}

export interface Nutrition {
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
  fiber: number;
  sugar: number;
}

// Converts JSON strings to/from your types
export class Convert {
  public static toRecipies(json: string): Recipies[] {
    return JSON.parse(json);
  }

  public static recipiesToJson(value: Recipies[]): string {
    return JSON.stringify(value);
  }
}
