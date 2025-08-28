import { z } from "zod";

// Define the environment variables schema for the native app
const envSchema = z.object({
  // API Configuration
  EXPO_PUBLIC_SERVER_URL: z.string().url().default("http://localhost:3000"),
  EXPO_PUBLIC_API_URL: z.string().url().default("http://localhost:3000"),
  
  // WebSocket Configuration
  EXPO_PUBLIC_WS_URL: z.string().default("ws://localhost:3001"),
  
  // Better Auth Configuration
  EXPO_PUBLIC_APP_URL: z.string().url().default("http://localhost:8081"),
  EXPO_PUBLIC_AUTH_URL: z.string().url().default("http://localhost:3000"),
  
  // App Configuration
  EXPO_PUBLIC_APP_NAME: z.string().default("DinDin"),
  EXPO_PUBLIC_APP_SCHEME: z.string().default("dindin"),
  EXPO_PUBLIC_BUNDLE_IDENTIFIER: z.string().default("com.dindin.app"),
  
  // Feature Flags
  EXPO_PUBLIC_ENABLE_WEBSOCKET: z.string().default("true").transform((val) => val === "true"),
  EXPO_PUBLIC_ENABLE_OFFLINE_MODE: z.string().default("true").transform((val) => val === "true"),
  EXPO_PUBLIC_ENABLE_PUSH_NOTIFICATIONS: z.string().default("false").transform((val) => val === "true"),
  EXPO_PUBLIC_ENABLE_ANALYTICS: z.string().default("false").transform((val) => val === "true"),
  
  // Development
  EXPO_PUBLIC_DEBUG_MODE: z.string().default("true").transform((val) => val === "true"),
  EXPO_PUBLIC_LOG_LEVEL: z.enum(["error", "warn", "info", "debug"]).default("info"),
  
  // External Services (optional)
  EXPO_PUBLIC_SENTRY_DSN: z.string().url().optional(),
  EXPO_PUBLIC_ANALYTICS_ID: z.string().optional(),
  
  // API Keys (client-safe only)
  EXPO_PUBLIC_MAPS_API_KEY: z.string().optional(),
});

// Type for the validated environment
export type AppEnv = z.infer<typeof envSchema>;

// Validate environment variables
let appConfig: AppEnv;

try {
  // In React Native/Expo, we need to handle the process.env differently
  const env = {
    EXPO_PUBLIC_SERVER_URL: process.env.EXPO_PUBLIC_SERVER_URL,
    EXPO_PUBLIC_API_URL: process.env.EXPO_PUBLIC_API_URL,
    EXPO_PUBLIC_WS_URL: process.env.EXPO_PUBLIC_WS_URL,
    EXPO_PUBLIC_APP_URL: process.env.EXPO_PUBLIC_APP_URL,
    EXPO_PUBLIC_AUTH_URL: process.env.EXPO_PUBLIC_AUTH_URL,
    EXPO_PUBLIC_APP_NAME: process.env.EXPO_PUBLIC_APP_NAME,
    EXPO_PUBLIC_APP_SCHEME: process.env.EXPO_PUBLIC_APP_SCHEME,
    EXPO_PUBLIC_BUNDLE_IDENTIFIER: process.env.EXPO_PUBLIC_BUNDLE_IDENTIFIER,
    EXPO_PUBLIC_ENABLE_WEBSOCKET: process.env.EXPO_PUBLIC_ENABLE_WEBSOCKET,
    EXPO_PUBLIC_ENABLE_OFFLINE_MODE: process.env.EXPO_PUBLIC_ENABLE_OFFLINE_MODE,
    EXPO_PUBLIC_ENABLE_PUSH_NOTIFICATIONS: process.env.EXPO_PUBLIC_ENABLE_PUSH_NOTIFICATIONS,
    EXPO_PUBLIC_ENABLE_ANALYTICS: process.env.EXPO_PUBLIC_ENABLE_ANALYTICS,
    EXPO_PUBLIC_DEBUG_MODE: process.env.EXPO_PUBLIC_DEBUG_MODE,
    EXPO_PUBLIC_LOG_LEVEL: process.env.EXPO_PUBLIC_LOG_LEVEL,
    EXPO_PUBLIC_SENTRY_DSN: process.env.EXPO_PUBLIC_SENTRY_DSN,
    EXPO_PUBLIC_ANALYTICS_ID: process.env.EXPO_PUBLIC_ANALYTICS_ID,
    EXPO_PUBLIC_MAPS_API_KEY: process.env.EXPO_PUBLIC_MAPS_API_KEY,
  };
  
  appConfig = envSchema.parse(env);
} catch (error) {
  if (error instanceof z.ZodError) {
    const errorMessage = error.errors
      .map((err) => `${err.path.join(".")}: ${err.message}`)
      .join("\n");
    
    if (__DEV__) {
      console.warn("⚠️ Environment validation warnings:\n", errorMessage);
      console.warn("📋 Using default values. Check your .env file against .env.example");
    }
    
    // Use defaults in development
    appConfig = envSchema.parse({});
  } else {
    throw error;
  }
}

// Helper functions
export function isDebugMode(): boolean {
  return appConfig.EXPO_PUBLIC_DEBUG_MODE;
}

export function getServerUrl(): string {
  return appConfig.EXPO_PUBLIC_SERVER_URL;
}

export function getWsUrl(): string {
  return appConfig.EXPO_PUBLIC_WS_URL;
}

export function isWebSocketEnabled(): boolean {
  return appConfig.EXPO_PUBLIC_ENABLE_WEBSOCKET;
}

export function isOfflineModeEnabled(): boolean {
  return appConfig.EXPO_PUBLIC_ENABLE_OFFLINE_MODE;
}

// Log configuration in debug mode
if (__DEV__ && appConfig.EXPO_PUBLIC_DEBUG_MODE) {
  console.log("📱 App Configuration:");
  console.log(`  Server: ${appConfig.EXPO_PUBLIC_SERVER_URL}`);
  console.log(`  WebSocket: ${appConfig.EXPO_PUBLIC_WS_URL}`);
  console.log(`  Features: WS=${appConfig.EXPO_PUBLIC_ENABLE_WEBSOCKET}, Offline=${appConfig.EXPO_PUBLIC_ENABLE_OFFLINE_MODE}`);
}

// Export the validated configuration
export default appConfig;