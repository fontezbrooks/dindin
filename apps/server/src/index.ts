import "dotenv/config";
import { trpcServer } from "@hono/trpc-server";
import { createContext } from "./lib/context";
import { appRouter } from "./routers/index";
import { auth } from "./lib/auth";
import { Hono } from "hono";
import { cors } from "hono/cors";
import { logger } from "hono/logger";
import { createEnhancedWebSocketServer } from "./websocket-enhanced";
import express from 'express';
import { mealPlanningRouter } from './routers/meal-planning.router';
import { shoppingListRouter } from './routers/shopping-list.router';
import { nutrition } from './routers/nutrition.router';

const app = new Hono();
const expressApp = express();

// Express middleware
expressApp.use(express.json());
expressApp.use(express.urlencoded({ extended: true }));

// Express CORS
expressApp.use((req, res, next) => {
  const corsOrigins = process.env.CORS_ORIGIN 
    ? process.env.CORS_ORIGIN.split(',').map(origin => origin.trim())
    : ['http://localhost:8081'];
  
  const origin = req.headers.origin;
  if (corsOrigins.includes(origin || '')) {
    res.header('Access-Control-Allow-Origin', origin);
  }
  res.header('Access-Control-Allow-Methods', 'GET,PUT,POST,DELETE,OPTIONS');
  res.header('Access-Control-Allow-Headers', 'Content-Type, Authorization, Content-Length, X-Requested-With');
  res.header('Access-Control-Allow-Credentials', 'true');
  
  if (req.method === 'OPTIONS') {
    res.sendStatus(200);
  } else {
    next();
  }
});

// Express API routes
expressApp.use('/api/meal-plans', mealPlanningRouter);
expressApp.use('/api/shopping-lists', shoppingListRouter);

// Hono API routes
app.route('/api/nutrition', nutrition);

// Start Enhanced WebSocket server with authentication
const WS_PORT = process.env.WS_PORT ? parseInt(process.env.WS_PORT) : 3001;
const wsServer = createEnhancedWebSocketServer(WS_PORT);

// Export for use in other modules
export { wsServer };

app.use(logger());

// Parse multiple CORS origins from environment variable
const corsOrigins = process.env.CORS_ORIGIN 
  ? process.env.CORS_ORIGIN.split(',').map(origin => origin.trim())
  : ['http://localhost:8081'];

// Hono's CORS middleware accepts an array of origins or a single origin string
app.use(
  "/*",
  cors({
    origin: corsOrigins,  // Pass the array directly
    allowMethods: ["GET", "POST", "OPTIONS"],
    allowHeaders: ["Content-Type", "Authorization"],
    credentials: true,
  })
);

app.on(["POST", "GET"], "/api/auth/**", (c) => auth.handler(c.req.raw));


app.use(
  "/trpc/*",
  trpcServer({
    router: appRouter,
    createContext: (_opts, context) => {
      return createContext({ context });
    },
  })
);



app.get("/", (c) => {
  return c.text("OK");
});

// Mount Express app on Hono
app.all('/api/meal-plans/*', async (c) => {
  return new Promise((resolve) => {
    expressApp(c.req.raw as any, c.res as any, () => {
      resolve(c.text('OK'));
    });
  });
});

app.all('/api/shopping-lists/*', async (c) => {
  return new Promise((resolve) => {
    expressApp(c.req.raw as any, c.res as any, () => {
      resolve(c.text('OK'));
    });
  });
});

// Health check for nutrition API
app.get('/api/nutrition/health', (c) => {
  return c.json({ status: 'healthy', service: 'nutrition-api', timestamp: new Date().toISOString() });
});

export default app;
export { expressApp };
