import React, { useEffect, useState } from 'react';
import { View, Text, Pressable, ActivityIndicator } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import logger from '@/utils/logger';

interface AsyncErrorBoundaryProps {
  children: React.ReactNode;
  fallback?: React.ReactNode;
  onError?: (error: Error) => void;
  timeout?: number;
}

/**
 * Error boundary specifically for async operations and data fetching
 * Handles loading states, timeouts, and network errors
 */
export function AsyncErrorBoundary({
  children,
  fallback,
  onError,
  timeout = 30000, // 30 seconds default timeout
}: AsyncErrorBoundaryProps) {
  const [error, setError] = useState<Error | null>(null);
  const [isTimeout, setIsTimeout] = useState(false);

  useEffect(() => {
    // Setup timeout handler
    const timer = setTimeout(() => {
      setIsTimeout(true);
      const timeoutError = new Error('Operation timed out');
      setError(timeoutError);
      onError?.(timeoutError);
    }, timeout);

    // Cleanup
    return () => clearTimeout(timer);
  }, [timeout, onError]);

  useEffect(() => {
    // Global promise rejection handler
    const handleUnhandledRejection = (event: PromiseRejectionEvent) => {
      logger.error('[AsyncErrorBoundary] Unhandled promise rejection:', event.reason);
      setError(new Error(event.reason?.toString() || 'Async operation failed'));
      event.preventDefault();
    };

    window.addEventListener('unhandledrejection', handleUnhandledRejection);

    return () => {
      window.removeEventListener('unhandledrejection', handleUnhandledRejection);
    };
  }, []);

  const handleRetry = () => {
    setError(null);
    setIsTimeout(false);
  };

  if (error) {
    if (fallback) {
      return <>{fallback}</>;
    }

    return (
      <View className="flex-1 bg-gray-50 items-center justify-center px-6">
        <View className="w-16 h-16 bg-yellow-100 rounded-full items-center justify-center mb-4">
          <Ionicons
            name={isTimeout ? 'time-outline' : 'cloud-offline-outline'}
            size={32}
            color="#EAB308"
          />
        </View>

        <Text className="text-xl font-bold text-gray-900 text-center mb-2">
          {isTimeout ? 'Request Timed Out' : 'Connection Error'}
        </Text>

        <Text className="text-gray-600 text-center mb-6">
          {isTimeout
            ? 'The operation took too long to complete. Please try again.'
            : 'Unable to complete the request. Please check your connection.'}
        </Text>

        <Pressable
          onPress={handleRetry}
          className="bg-pink-500 px-6 py-3 rounded-full"
        >
          <View className="flex-row items-center">
            <Ionicons name="refresh" size={20} color="white" />
            <Text className="text-white font-semibold ml-2">Retry</Text>
          </View>
        </Pressable>

        {__DEV__ && error.message && (
          <View className="mt-4 p-3 bg-gray-100 rounded-lg">
            <Text className="text-xs text-gray-600">{error.message}</Text>
          </View>
        )}
      </View>
    );
  }

  return <>{children}</>;
}

/**
 * Hook to handle async errors in functional components
 */
export function useAsyncError() {
  const [_, setError] = useState();

  return (error: Error) => {
    setError(() => {
      throw error;
    });
  };
}