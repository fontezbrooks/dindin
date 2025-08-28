/**
 * Legacy validation middleware - redirects to new validation system
 * @deprecated Use the new validation system from './validation/middleware'
 */
import type { NextFunction, Request, Response } from "express";
import { ZodError, type ZodSchema } from "zod";
import logger from "./logger";
import { validateRequest as newValidateRequest } from "./validation/middleware";

/**
 * @deprecated Use validateRequest from './validation/middleware' instead
 * This is kept for backward compatibility
 */
export const validateRequest = (schema: ZodSchema) => {
	// Use the new validation middleware with default options
	return newValidateRequest(schema, {
		target: "body",
		sanitizeHtml: true,
		stripUnknown: true,
		logErrors: true,
	});
};

// Re-export new validation utilities for gradual migration
export { 
	createErrorResponse,
	createSuccessResponse,
	ErrorType,
	globalErrorHandler,
	validateMultiple,
} from "./validation/middleware";
