import React from 'react';
import { ErrorBoundary } from './ErrorBoundary';
import { View, Text, Pressable } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import * as Updates from 'expo-updates';
import logger from '@/utils/logger';

interface RootErrorBoundaryProps {
  children: React.ReactNode;
}

/**
 * Root-level error boundary for the entire application
 * Provides app restart capabilities and comprehensive error reporting
 */
export function RootErrorBoundary({ children }: RootErrorBoundaryProps) {
  const handleRootError = (error: Error, errorInfo: React.ErrorInfo) => {
    // Log critical error
    logger.error('[RootErrorBoundary] Application crashed:', {
      error: error.toString(),
      stack: error.stack,
      componentStack: errorInfo.componentStack,
      timestamp: new Date().toISOString(),
    });

    // TODO: Send to crash reporting service (e.g., Sentry, Crashlytics)
  };

  const handleAppRestart = async () => {
    try {
      if (!__DEV__) {
        // In production, reload the app
        await Updates.reloadAsync();
      } else {
        // In development, show alert
        logger.log('[RootErrorBoundary] Would restart app in production');
      }
    } catch (e) {
      logger.error('[RootErrorBoundary] Failed to restart app:', e);
    }
  };

  const rootFallback = (
    <View className="flex-1 bg-white">
      <View className="flex-1 items-center justify-center px-8">
        {/* Logo or App Icon */}
        <View className="w-24 h-24 bg-pink-100 rounded-full items-center justify-center mb-6">
          <Ionicons name="restaurant" size={48} color="#EC4899" />
        </View>

        {/* Error Title */}
        <Text className="text-3xl font-bold text-gray-900 text-center mb-3">
          DinDin Encountered an Error
        </Text>

        {/* Error Description */}
        <Text className="text-gray-600 text-center mb-8 text-base">
          We apologize for the inconvenience. The app needs to restart to continue working properly.
        </Text>

        {/* Restart Button */}
        <Pressable
          onPress={handleAppRestart}
          className="bg-pink-500 px-8 py-4 rounded-full shadow-lg"
        >
          <View className="flex-row items-center">
            <Ionicons name="refresh-circle" size={24} color="white" />
            <Text className="text-white font-bold text-lg ml-2">
              Restart DinDin
            </Text>
          </View>
        </Pressable>

        {/* Additional Help */}
        <View className="mt-8 p-4 bg-gray-50 rounded-lg">
          <Text className="text-sm text-gray-700 text-center mb-2">
            If this problem continues:
          </Text>
          <View className="ml-4">
            <Text className="text-sm text-gray-600">• Force close and reopen the app</Text>
            <Text className="text-sm text-gray-600">• Check for app updates</Text>
            <Text className="text-sm text-gray-600">• Clear app cache in settings</Text>
          </View>
        </View>

        {/* Version Info */}
        {__DEV__ && (
          <Text className="text-xs text-gray-400 mt-4">
            Development Build - Error boundaries active
          </Text>
        )}
      </View>
    </View>
  );

  return (
    <ErrorBoundary
      level="root"
      featureName="Application"
      fallback={rootFallback}
      onError={handleRootError}
      canRetry={false}
      showDetails={__DEV__}
    >
      {children}
    </ErrorBoundary>
  );
}
