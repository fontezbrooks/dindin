// Global Error Handler Middleware
// Handles all errors and provides consistent error responses

import type { Request, Response, NextFunction } from "express";
import type { ValidationError } from "../types/index.js";

interface ErrorWithStatusCode extends Error {
  statusCode?: number;
  code?: number;
  keyValue?: Record<string, unknown>;
  errors?: Record<string, { path: string; message: string }>;
}

const errorHandler = (
  err: ErrorWithStatusCode,
  req: Request,
  res: Response,
  _next: NextFunction
): void => {
  const error = { ...err };
  error.message = err.message;

  // Log error
  console.error("Error:", {
    message: error.message,
    stack: process.env.NODE_ENV === "development" ? err.stack : undefined,
    url: req.originalUrl,
    method: req.method,
    ip: req.ip,
    timestamp: new Date().toISOString(),
  });

  // Mongoose bad ObjectId
  if (err.name === "CastError") {
    const message = "Resource not found";
    res.status(404).json({
      success: false,
      message,
      error: "Invalid ID format",
    });
    return;
  }

  // Mongoose duplicate key
  if (err.code === 11000) {
    const field = Object.keys(err.keyValue || {})[0] || 'unknown';
    const message = `Duplicate field value for ${field}`;
    res.status(409).json({
      success: false,
      message,
      error: `${field} already exists`,
    });
    return;
  }

  // Mongoose validation error
  if (err.name === "ValidationError" && err.errors) {
    const message = "Validation Error";
    const errors: ValidationError[] = Object.values(err.errors).map((val) => ({
      field: val.path,
      message: val.message,
    }));

    res.status(400).json({
      success: false,
      message,
      errors,
    });
    return;
  }

  // JWT errors
  if (err.name === "JsonWebTokenError") {
    res.status(401).json({
      success: false,
      message: "Invalid token",
    });
    return;
  }

  if (err.name === "TokenExpiredError") {
    res.status(401).json({
      success: false,
      message: "Token expired",
    });
    return;
  }

  // Default error
  res.status(error.statusCode || 500).json({
    success: false,
    message: error.message || "Server Error",
    error: process.env.NODE_ENV === "development" ? error.stack : undefined,
  });
};

export default errorHandler;
