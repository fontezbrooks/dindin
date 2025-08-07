// DinDin Backend Server - TypeScript version
// Main entry point for the Express API server

import express, { json, urlencoded, Request, Response } from "express";
import mongoose from "mongoose";
const { connect, connection } = mongoose;
import cors from "cors";
import helmet from "helmet";
import compression from "compression";
import rateLimit from "express-rate-limit";
import morgan from "morgan";
import dotenv from "dotenv";

dotenv.config();

// Import routes
import recipeRoutes from "./routes/recipes.js";
import swipeRoutes from "./routes/swipes.js";
import userRoutes from "./routes/users.js";
import authRoutes from "./routes/auth.js";

// Import middleware
import errorHandler from "./middleware/errorHandler.js";
import notFound from "./middleware/notFound.js";

// Initialize Express app
const app = express();

// Environment variables with type safety
const PORT = parseInt(process.env.PORT || "3001", 10);
const NODE_ENV = process.env.NODE_ENV || "development";
const MONGODB_URI = process.env.MONGODB_URI || "mongodb://localhost:27017/";
const DATABASE_NAME = process.env.DATABASE_NAME || "dindin";
const CORS_ORIGIN = process.env.CORS_ORIGIN || "http://localhost:8081";

// Security middleware
app.use(
  helmet({
    crossOriginEmbedderPolicy: false,
  })
);

// Rate limiting
const limiter = rateLimit({
  windowMs: parseInt(process.env.RATE_LIMIT_WINDOW_MS || "900000", 10), // 15 minutes
  max: parseInt(process.env.RATE_LIMIT_MAX_REQUESTS || "100", 10), // limit each IP to 100 requests per windowMs
  message: {
    error: "Too many requests from this IP, please try again later.",
    statusCode: 429,
  },
  standardHeaders: true,
  legacyHeaders: false,
});
app.use(limiter);

// CORS configuration
app.use(
  cors({
    origin: CORS_ORIGIN.split(",").map((origin) => origin.trim()),
    methods: ["GET", "POST", "PUT", "DELETE", "PATCH"],
    allowedHeaders: ["Content-Type", "Authorization"],
    credentials: true,
  })
);

// Compression middleware
app.use(compression());

// Body parsing middleware
app.use(json({ limit: "10mb" }));
app.use(urlencoded({ extended: true, limit: "10mb" }));

// Logging middleware
if (NODE_ENV === "development") {
  app.use(morgan("dev"));
} else {
  app.use(morgan("combined"));
}

// MongoDB connection
connect(`${MONGODB_URI}${DATABASE_NAME}`)
  .then(() => {
    console.log(`✅ Connected to MongoDB database: ${DATABASE_NAME}`);
  })
  .catch((error: Error) => {
    console.error("❌ MongoDB connection error:", error);
    process.exit(1);
  });

// Health check endpoint
app.get("/health", (_req: Request, res: Response) => {
  res.json({
    status: "OK",
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    environment: NODE_ENV,
    database: connection.readyState === 1 ? "connected" : "disconnected",
  });
});

// API routes
app.use("/api/recipes", recipeRoutes);
app.use("/api/swipes", swipeRoutes);
app.use("/api/users", userRoutes);
app.use("/api/auth", authRoutes);

// API documentation endpoint
app.get("/api", (_req: Request, res: Response) => {
  res.json({
    name: "DinDin API",
    version: "1.0.0",
    description: "Recipe matching and swipe tracking API",
    endpoints: {
      recipes: {
        "GET /api/recipes": "Get all recipes with optional filtering",
        "GET /api/recipes/personalized": "Get personalized recipes",
        "GET /api/recipes/search": "Search recipes by text",
        "GET /api/recipes/:id": "Get recipe by ID",
        "POST /api/recipes": "Create new recipe (admin)",
        "PUT /api/recipes/:id": "Update recipe (admin)",
        "DELETE /api/recipes/:id": "Delete recipe (admin)",
      },
      swipes: {
        "POST /api/swipes": "Record a swipe action",
        "GET /api/swipes/history/:userId": "Get user swipe history",
      },
      users: {
        "GET /api/users/:id": "Get user profile",
        "PUT /api/users/:id": "Update user profile",
      },
      auth: {
        "POST /api/auth/register": "Register new user",
        "POST /api/auth/login": "User login",
        "POST /api/auth/logout": "User logout",
        "POST /api/auth/refresh": "Refresh auth token",
      },
    },
    documentation: "/api/docs",
  });
});

// 404 handler
app.use(notFound);

// Global error handler
app.use(errorHandler);

// Start server
const server = app.listen(PORT, () => {
  console.log(`🚀 DinDin API server running on port ${PORT}`);
  console.log(`📱 Frontend CORS origin: ${CORS_ORIGIN}`);
  console.log(`🌍 Environment: ${NODE_ENV}`);
  console.log(`📚 API Documentation: http://localhost:${PORT}/api`);
});

// Graceful shutdown
process.on("SIGTERM", () => {
  console.log("SIGTERM received. Shutting down gracefully...");
  server.close(() => {
    connection.close().then(() => {
      console.log("MongoDB connection closed.");
      process.exit(0);
    });
  });
});

process.on("SIGINT", () => {
  console.log("SIGINT received. Shutting down gracefully...");
  server.close(() => {
    connection.close().then(() => {
      console.log("MongoDB connection closed.");
      process.exit(0);
    });
  });
});

export default app;
