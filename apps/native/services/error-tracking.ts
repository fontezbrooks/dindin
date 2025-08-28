import { ErrorInfo } from 'react';
import logger from '@/utils/logger';

interface ErrorContext {
  userId?: string;
  partnerId?: string;
  feature?: string;
  action?: string;
  metadata?: Record<string, any>;
}

interface ErrorReport {
  message: string;
  stack?: string;
  componentStack?: string;
  context: ErrorContext;
  timestamp: string;
  environment: 'development' | 'staging' | 'production';
  appVersion?: string;
  platform: 'ios' | 'android';
  deviceInfo?: {
    model?: string;
    osVersion?: string;
  };
}

class ErrorTrackingService {
  private static instance: ErrorTrackingService;
  private errorQueue: ErrorReport[] = [];
  private maxQueueSize = 10;
  private isInitialized = false;

  private constructor() {}

  static getInstance(): ErrorTrackingService {
    if (!ErrorTrackingService.instance) {
      ErrorTrackingService.instance = new ErrorTrackingService();
    }
    return ErrorTrackingService.instance;
  }

  /**
   * Initialize error tracking service with configuration
   */
  async initialize(config?: {
    sentryDsn?: string;
    environment?: 'development' | 'staging' | 'production';
    userId?: string;
  }) {
    if (this.isInitialized) {
      logger.log('[ErrorTracking] Already initialized');
      return;
    }

    try {
      // TODO: Initialize Sentry or other error tracking service
      // import * as Sentry from '@sentry/react-native';
      // Sentry.init({
      //   dsn: config?.sentryDsn,
      //   environment: config?.environment,
      //   beforeSend: this.beforeSendHook,
      // });

      this.isInitialized = true;
      logger.log('[ErrorTracking] Service initialized');
      
      // Process any queued errors
      this.flushErrorQueue();
    } catch (error) {
      logger.error('[ErrorTracking] Failed to initialize:', error);
    }
  }

  /**
   * Report a React component error
   */
  reportComponentError(
    error: Error,
    errorInfo: ErrorInfo,
    context?: ErrorContext
  ): void {
    const report: ErrorReport = {
      message: error.message || 'Component error',
      stack: error.stack,
      componentStack: errorInfo.componentStack,
      context: context || {},
      timestamp: new Date().toISOString(),
      environment: __DEV__ ? 'development' : 'production',
      platform: this.getPlatform(),
    };

    this.sendErrorReport(report);
  }

  /**
   * Report a general JavaScript error
   */
  reportError(
    error: Error | string,
    context?: ErrorContext
  ): void {
    const errorObj = typeof error === 'string' ? new Error(error) : error;
    
    const report: ErrorReport = {
      message: errorObj.message || 'Unknown error',
      stack: errorObj.stack,
      context: context || {},
      timestamp: new Date().toISOString(),
      environment: __DEV__ ? 'development' : 'production',
      platform: this.getPlatform(),
    };

    this.sendErrorReport(report);
  }

  /**
   * Report a network/API error
   */
  reportNetworkError(
    endpoint: string,
    method: string,
    statusCode?: number,
    error?: Error,
    context?: ErrorContext
  ): void {
    const report: ErrorReport = {
      message: `Network error: ${method} ${endpoint} (${statusCode || 'unknown'})`,
      stack: error?.stack,
      context: {
        ...context,
        endpoint,
        method,
        statusCode,
      },
      timestamp: new Date().toISOString(),
      environment: __DEV__ ? 'development' : 'production',
      platform: this.getPlatform(),
    };

    this.sendErrorReport(report);
  }

  /**
   * Report a WebSocket error
   */
  reportWebSocketError(
    event: string,
    error: Error | string,
    context?: ErrorContext
  ): void {
    const errorObj = typeof error === 'string' ? new Error(error) : error;
    
    const report: ErrorReport = {
      message: `WebSocket error in ${event}: ${errorObj.message}`,
      stack: errorObj.stack,
      context: {
        ...context,
        event,
        type: 'websocket',
      },
      timestamp: new Date().toISOString(),
      environment: __DEV__ ? 'development' : 'production',
      platform: this.getPlatform(),
    };

    this.sendErrorReport(report);
  }

  /**
   * Set user context for error tracking
   */
  setUserContext(userId: string, partnerId?: string): void {
    // TODO: Set user context in Sentry
    // Sentry.setUser({ id: userId, partnerId });
    logger.log('[ErrorTracking] User context set:', { userId, partnerId });
  }

  /**
   * Clear user context (on logout)
   */
  clearUserContext(): void {
    // TODO: Clear user context in Sentry
    // Sentry.setUser(null);
    logger.log('[ErrorTracking] User context cleared');
  }

  /**
   * Add breadcrumb for better error context
   */
  addBreadcrumb(
    message: string,
    category: string,
    data?: Record<string, any>
  ): void {
    // TODO: Add breadcrumb to Sentry
    // Sentry.addBreadcrumb({
    //   message,
    //   category,
    //   level: 'info',
    //   data,
    // });
    
    if (__DEV__) {
      logger.log('[ErrorTracking] Breadcrumb:', { message, category, data });
    }
  }

  /**
   * Private: Send error report to tracking service
   */
  private sendErrorReport(report: ErrorReport): void {
    if (!this.isInitialized) {
      // Queue errors if service not initialized
      this.queueError(report);
      return;
    }

    // Log in development
    if (__DEV__) {
      logger.error('[ErrorTracking] Error Report:', report);
    }

    // TODO: Send to actual error tracking service
    // Sentry.captureException(new Error(report.message), {
    //   contexts: {
    //     error: report,
    //   },
    // });

    // For now, just log
    logger.error('[ErrorTracking] Would send to service:', {
      message: report.message,
      context: report.context,
      timestamp: report.timestamp,
    });
  }

  /**
   * Private: Queue errors when service not initialized
   */
  private queueError(report: ErrorReport): void {
    if (this.errorQueue.length >= this.maxQueueSize) {
      this.errorQueue.shift(); // Remove oldest
    }
    this.errorQueue.push(report);
  }

  /**
   * Private: Process queued errors
   */
  private flushErrorQueue(): void {
    while (this.errorQueue.length > 0) {
      const report = this.errorQueue.shift();
      if (report) {
        this.sendErrorReport(report);
      }
    }
  }

  /**
   * Private: Get platform information
   */
  private getPlatform(): 'ios' | 'android' {
    // TODO: Use Platform.OS from React Native
    return 'ios'; // Default for now
  }

  /**
   * Private: Hook for filtering sensitive data before sending
   */
  private beforeSendHook(event: any): any {
    // Filter out sensitive data
    if (event.request?.cookies) {
      delete event.request.cookies;
    }
    if (event.request?.headers?.authorization) {
      event.request.headers.authorization = '[REDACTED]';
    }
    
    return event;
  }
}

// Export singleton instance
export const errorTracking = ErrorTrackingService.getInstance();

// Export helper functions for common error tracking
export const trackError = (error: Error | string, context?: ErrorContext) => {
  errorTracking.reportError(error, context);
};

export const trackComponentError = (
  error: Error,
  errorInfo: ErrorInfo,
  context?: ErrorContext
) => {
  errorTracking.reportComponentError(error, errorInfo, context);
};

export const trackNetworkError = (
  endpoint: string,
  method: string,
  statusCode?: number,
  error?: Error
) => {
  errorTracking.reportNetworkError(endpoint, method, statusCode, error);
};

export const trackWebSocketError = (
  event: string,
  error: Error | string
) => {
  errorTracking.reportWebSocketError(event, error);
};

export const addErrorBreadcrumb = (
  message: string,
  category: string,
  data?: Record<string, any>
) => {
  errorTracking.addBreadcrumb(message, category, data);
};