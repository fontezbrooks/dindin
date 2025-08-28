import type { NextFunction, Request, Response } from "express";
import { ZodError, type ZodSchema } from "zod";
import logger from "../logger";

// ============================================
// Error Response Types
// ============================================

interface ValidationErrorDetail {
  field: string;
  message: string;
  code?: string;
}

interface StandardErrorResponse {
  success: false;
  error: {
    type: string;
    message: string;
    details?: ValidationErrorDetail[];
    timestamp: string;
    requestId?: string;
  };
}

interface SuccessResponse<T = any> {
  success: true;
  data: T;
  metadata?: {
    timestamp: string;
    requestId?: string;
  };
}

// ============================================
// Error Types
// ============================================

export enum ErrorType {
  VALIDATION_ERROR = "VALIDATION_ERROR",
  AUTHENTICATION_ERROR = "AUTHENTICATION_ERROR",
  AUTHORIZATION_ERROR = "AUTHORIZATION_ERROR",
  NOT_FOUND = "NOT_FOUND",
  CONFLICT = "CONFLICT",
  RATE_LIMIT = "RATE_LIMIT",
  SERVER_ERROR = "SERVER_ERROR",
  BAD_REQUEST = "BAD_REQUEST",
  FORBIDDEN = "FORBIDDEN",
}

// ============================================
// HTTP Status Codes
// ============================================

const ErrorStatusMap: Record<ErrorType, number> = {
  [ErrorType.VALIDATION_ERROR]: 400,
  [ErrorType.BAD_REQUEST]: 400,
  [ErrorType.AUTHENTICATION_ERROR]: 401,
  [ErrorType.AUTHORIZATION_ERROR]: 403,
  [ErrorType.FORBIDDEN]: 403,
  [ErrorType.NOT_FOUND]: 404,
  [ErrorType.CONFLICT]: 409,
  [ErrorType.RATE_LIMIT]: 429,
  [ErrorType.SERVER_ERROR]: 500,
};

// ============================================
// Utility Functions
// ============================================

/**
 * Generate a unique request ID for tracking
 */
const generateRequestId = (): string => {
  return `req_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
};

/**
 * Sanitize error messages to prevent information leakage
 */
const sanitizeErrorMessage = (message: string, isDevelopment: boolean): string => {
  if (isDevelopment) {
    return message;
  }
  
  // In production, don't expose internal details
  const sensitivePatterns = [
    /mongodb:\/\/[^/]+/gi, // MongoDB connection strings
    /\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Z|a-z]{2,}\b/g, // Email addresses
    /Bearer\s+[A-Za-z0-9\-._~+/]+=*/gi, // Bearer tokens
    /[a-f0-9]{32,}/gi, // API keys or tokens
  ];
  
  let sanitized = message;
  for (const pattern of sensitivePatterns) {
    sanitized = sanitized.replace(pattern, "[REDACTED]");
  }
  
  return sanitized;
};

/**
 * Format Zod validation errors into a consistent structure
 */
const formatZodErrors = (error: ZodError): ValidationErrorDetail[] => {
  return error.errors.map((err) => ({
    field: err.path.join("."),
    message: err.message,
    code: err.code,
  }));
};

// ============================================
// Response Builders
// ============================================

/**
 * Create a standardized error response
 */
export const createErrorResponse = (
  type: ErrorType,
  message: string,
  details?: ValidationErrorDetail[],
  requestId?: string,
): StandardErrorResponse => {
  const isDevelopment = process.env.NODE_ENV === "development";
  
  return {
    success: false,
    error: {
      type,
      message: sanitizeErrorMessage(message, isDevelopment),
      details: details?.map(d => ({
        ...d,
        message: sanitizeErrorMessage(d.message, isDevelopment),
      })),
      timestamp: new Date().toISOString(),
      requestId: requestId || generateRequestId(),
    },
  };
};

/**
 * Create a standardized success response
 */
export const createSuccessResponse = <T>(
  data: T,
  requestId?: string,
): SuccessResponse<T> => {
  return {
    success: true,
    data,
    metadata: {
      timestamp: new Date().toISOString(),
      requestId: requestId || generateRequestId(),
    },
  };
};

// ============================================
// Validation Middleware
// ============================================

interface ValidationOptions {
  /**
   * Which part of the request to validate
   */
  target?: "body" | "query" | "params" | "headers";
  /**
   * Whether to sanitize HTML from string inputs
   */
  sanitizeHtml?: boolean;
  /**
   * Whether to strip unknown fields
   */
  stripUnknown?: boolean;
  /**
   * Custom error message
   */
  errorMessage?: string;
  /**
   * Whether to log validation errors
   */
  logErrors?: boolean;
}

/**
 * Enhanced validation middleware with sanitization and standardized error responses
 */
export const validateRequest = (
  schema: ZodSchema,
  options: ValidationOptions = {},
) => {
  const {
    target = "body",
    sanitizeHtml = true,
    stripUnknown = true,
    errorMessage = "Validation failed",
    logErrors = true,
  } = options;

  return async (req: Request, res: Response, next: NextFunction) => {
    const requestId = generateRequestId();
    
    // Attach request ID to the request object for tracking
    (req as any).requestId = requestId;
    
    try {
      // Get the data to validate based on target
      const dataToValidate = req[target];
      
      // Parse and validate the data
      let validatedData = await schema.parseAsync(dataToValidate);
      
      // Apply HTML sanitization if enabled
      if (sanitizeHtml && typeof validatedData === "object" && validatedData !== null) {
        validatedData = sanitizeObjectStrings(validatedData);
      }
      
      // Replace the original data with validated and sanitized data
      req[target] = validatedData;
      
      next();
    } catch (error) {
      if (error instanceof ZodError) {
        const errorDetails = formatZodErrors(error);
        
        if (logErrors) {
          logger.warn("Validation failed", {
            requestId,
            path: req.path,
            method: req.method,
            errors: errorDetails,
          });
        }
        
        const errorResponse = createErrorResponse(
          ErrorType.VALIDATION_ERROR,
          errorMessage,
          errorDetails,
          requestId,
        );
        
        return res.status(ErrorStatusMap[ErrorType.VALIDATION_ERROR]).json(errorResponse);
      }
      
      // Handle unexpected errors
      logger.error("Unexpected validation error", {
        requestId,
        path: req.path,
        method: req.method,
        error: error instanceof Error ? error.message : "Unknown error",
      });
      
      const errorResponse = createErrorResponse(
        ErrorType.SERVER_ERROR,
        "An unexpected error occurred during validation",
        undefined,
        requestId,
      );
      
      return res.status(ErrorStatusMap[ErrorType.SERVER_ERROR]).json(errorResponse);
    }
  };
};

/**
 * Sanitize HTML from all string values in an object
 */
const sanitizeObjectStrings = (obj: any): any => {
  if (typeof obj === "string") {
    return sanitizeHtmlString(obj);
  }
  
  if (Array.isArray(obj)) {
    return obj.map(sanitizeObjectStrings);
  }
  
  if (typeof obj === "object" && obj !== null) {
    const sanitized: any = {};
    for (const [key, value] of Object.entries(obj)) {
      sanitized[key] = sanitizeObjectStrings(value);
    }
    return sanitized;
  }
  
  return obj;
};

/**
 * Remove potentially dangerous HTML and script tags from strings
 */
const sanitizeHtmlString = (str: string): string => {
  return str
    // Remove script tags and their content
    .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, "")
    // Remove on* event handlers
    .replace(/on\w+\s*=\s*"[^"]*"/gi, "")
    .replace(/on\w+\s*=\s*'[^']*'/gi, "")
    // Remove javascript: protocol
    .replace(/javascript:/gi, "")
    // Remove data: protocol (can be used for XSS)
    .replace(/data:text\/html[^,]*,/gi, "")
    // Remove HTML tags (optional - uncomment if you want to strip all HTML)
    // .replace(/<[^>]+>/g, "")
    .trim();
};

// ============================================
// Composite Validation Middleware
// ============================================

/**
 * Validate multiple parts of the request at once
 */
export const validateMultiple = (validations: {
  body?: ZodSchema;
  query?: ZodSchema;
  params?: ZodSchema;
  headers?: ZodSchema;
}) => {
  return async (req: Request, res: Response, next: NextFunction) => {
    const requestId = generateRequestId();
    (req as any).requestId = requestId;
    
    const errors: ValidationErrorDetail[] = [];
    
    // Validate each part of the request
    for (const [target, schema] of Object.entries(validations)) {
      if (!schema) continue;
      
      try {
        const dataToValidate = req[target as keyof Request];
        const validatedData = await schema.parseAsync(dataToValidate);
        
        // Apply sanitization
        const sanitizedData = sanitizeObjectStrings(validatedData);
        (req as any)[target] = sanitizedData;
      } catch (error) {
        if (error instanceof ZodError) {
          const targetErrors = formatZodErrors(error).map(err => ({
            ...err,
            field: `${target}.${err.field}`,
          }));
          errors.push(...targetErrors);
        }
      }
    }
    
    if (errors.length > 0) {
      logger.warn("Multiple validation failures", {
        requestId,
        path: req.path,
        method: req.method,
        errors,
      });
      
      const errorResponse = createErrorResponse(
        ErrorType.VALIDATION_ERROR,
        "Multiple validation errors occurred",
        errors,
        requestId,
      );
      
      return res.status(ErrorStatusMap[ErrorType.VALIDATION_ERROR]).json(errorResponse);
    }
    
    next();
  };
};

// ============================================
// Error Handler Middleware
// ============================================

/**
 * Global error handler middleware
 */
export const globalErrorHandler = (
  err: Error,
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  const requestId = (req as any).requestId || generateRequestId();
  const isDevelopment = process.env.NODE_ENV === "development";
  
  // Log the error
  logger.error("Unhandled error", {
    requestId,
    path: req.path,
    method: req.method,
    error: err.message,
    stack: isDevelopment ? err.stack : undefined,
  });
  
  // Determine error type and status code
  let errorType = ErrorType.SERVER_ERROR;
  let statusCode = 500;
  let message = "An unexpected error occurred";
  
  if (err.name === "ValidationError") {
    errorType = ErrorType.VALIDATION_ERROR;
    statusCode = 400;
    message = "Validation failed";
  } else if (err.name === "UnauthorizedError") {
    errorType = ErrorType.AUTHENTICATION_ERROR;
    statusCode = 401;
    message = "Authentication required";
  } else if (err.name === "ForbiddenError") {
    errorType = ErrorType.FORBIDDEN;
    statusCode = 403;
    message = "Access forbidden";
  } else if (err.name === "NotFoundError") {
    errorType = ErrorType.NOT_FOUND;
    statusCode = 404;
    message = "Resource not found";
  } else if (err.name === "ConflictError") {
    errorType = ErrorType.CONFLICT;
    statusCode = 409;
    message = "Resource conflict";
  }
  
  const errorResponse = createErrorResponse(
    errorType,
    isDevelopment ? err.message : message,
    undefined,
    requestId,
  );
  
  res.status(statusCode).json(errorResponse);
};

// ============================================
// Export All
// ============================================

export default {
  validateRequest,
  validateMultiple,
  globalErrorHandler,
  createErrorResponse,
  createSuccessResponse,
  ErrorType,
};