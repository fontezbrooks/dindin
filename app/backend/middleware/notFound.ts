// 404 Not Found Middleware
// Handles requests to non-existent endpoints

import type { Request, Response, NextFunction } from "express";

const notFound = (req: Request, res: Response, _next: NextFunction): void => {
  res.status(404).json({
    success: false,
    message: `Route ${req.originalUrl} not found`,
    availableEndpoints: {
      recipes: {
        "GET /api/recipes": "Get all recipes",
        "GET /api/recipes/personalized": "Get personalized recipes",
        "GET /api/recipes/search": "Search recipes",
        "GET /api/recipes/:id": "Get recipe by ID",
      },
      swipes: {
        "POST /api/swipes": "Record swipe",
        "GET /api/swipes/history/:userId": "Get swipe history",
      },
      auth: {
        "POST /api/auth/login": "Login",
        "POST /api/auth/register": "Register",
        "POST /api/auth/logout": "Logout",
      },
      documentation: "GET /api",
    },
  });
};

export default notFound;
