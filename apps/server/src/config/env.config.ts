import { z } from "zod";
import dotenv from "dotenv";

// Load environment variables
dotenv.config();

// Define the environment variables schema
const envSchema = z.object({
  // Database
  DATABASE_URL: z.string().min(1, "DATABASE_URL is required"),
  
  // Server
  PORT: z.string().default("3000").transform(Number),
  NODE_ENV: z.enum(["development", "test", "production", "staging"]).default("development"),
  
  // WebSocket
  WS_PORT: z.string().default("3001").transform(Number),
  
  // CORS
  CORS_ORIGIN: z.string().default("http://localhost:8081"),
  
  // Authentication
  BETTER_AUTH_SECRET: z.string().min(32, "BETTER_AUTH_SECRET must be at least 32 characters"),
  BETTER_AUTH_URL: z.string().url().default("http://localhost:3000"),
  BETTER_AUTH_COOKIE_SECURE: z.string().default("false").transform((val) => val === "true"),
  
  // External APIs (optional)
  SPOONACULAR_API_KEY: z.string().optional(),
  
  // Logging
  LOG_LEVEL: z.enum(["error", "warn", "info", "debug"]).default("info"),
  LOG_FORMAT: z.enum(["json", "pretty"]).default("json"),
  
  // Security
  JWT_SECRET: z.string().min(32, "JWT_SECRET must be at least 32 characters").optional(),
  SESSION_SECRET: z.string().min(32, "SESSION_SECRET must be at least 32 characters").optional(),
  
  // Rate Limiting
  RATE_LIMIT_WINDOW_MS: z.string().default("900000").transform(Number),
  RATE_LIMIT_MAX_REQUESTS: z.string().default("100").transform(Number),
  
  // Email Service (optional)
  EMAIL_SERVICE: z.string().optional(),
  EMAIL_USER: z.string().email().optional(),
  EMAIL_PASS: z.string().optional(),
  
  // Redis (optional)
  REDIS_URL: z.string().url().optional(),
  
  // Monitoring (optional)
  SENTRY_DSN: z.string().url().optional(),
  
  // Feature Flags
  ENABLE_WEBSOCKET: z.string().default("true").transform((val) => val === "true"),
  ENABLE_EMAIL_NOTIFICATIONS: z.string().default("false").transform((val) => val === "true"),
  ENABLE_PUSH_NOTIFICATIONS: z.string().default("false").transform((val) => val === "true"),
});

// Type for the validated environment
export type Env = z.infer<typeof envSchema>;

// Validate environment variables
let config: Env;

try {
  config = envSchema.parse(process.env);
} catch (error) {
  if (error instanceof z.ZodError) {
    const errorMessage = error.errors
      .map((err) => `${err.path.join(".")}: ${err.message}`)
      .join("\n");
    
    console.error("❌ Environment validation failed:\n");
    console.error(errorMessage);
    console.error("\n📋 Please check your .env file against .env.example");
    
    // Only exit in production, allow development to continue with warnings
    if (process.env.NODE_ENV === "production") {
      process.exit(1);
    }
  }
  throw error;
}

// Helper function to get CORS origins as array
export function getCorsOrigins(): string[] {
  return config.CORS_ORIGIN.split(",").map((origin) => origin.trim());
}

// Helper function to check if running in production
export function isProduction(): boolean {
  return config.NODE_ENV === "production";
}

// Helper function to check if running in development
export function isDevelopment(): boolean {
  return config.NODE_ENV === "development";
}

// Helper function to check if running in test
export function isTest(): boolean {
  return config.NODE_ENV === "test";
}

// Log configuration status (without sensitive data)
if (isDevelopment()) {
  console.log("✅ Environment configuration loaded successfully");
  console.log(`📍 Environment: ${config.NODE_ENV}`);
  console.log(`🚀 Server Port: ${config.PORT}`);
  console.log(`🔌 WebSocket Port: ${config.WS_PORT}`);
  console.log(`🌐 CORS Origins: ${getCorsOrigins().join(", ")}`);
  console.log(`🔧 Features: WebSocket=${config.ENABLE_WEBSOCKET}, Email=${config.ENABLE_EMAIL_NOTIFICATIONS}`);
}

// Export the validated configuration
export default config;