import React from 'react';
import { ErrorBoundary } from './ErrorBoundary';
import { View, Text, Pressable } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import logger from '@/utils/logger';

type FeatureType = 'swipe' | 'partner' | 'browse' | 'profile' | 'matches';

interface FeatureErrorBoundaryProps {
  children: React.ReactNode;
  feature: FeatureType;
  onRetry?: () => void;
}

/**
 * Feature-specific error boundary with custom recovery options
 */
export function FeatureErrorBoundary({ 
  children, 
  feature,
  onRetry 
}: FeatureErrorBoundaryProps) {
  const getFeatureConfig = (type: FeatureType) => {
    switch (type) {
      case 'swipe':
        return {
          name: 'Recipe Swiping',
          icon: 'swap-horizontal' as const,
          message: 'The swipe feature encountered an issue.',
          suggestion: 'Try refreshing the recipe stack or check your connection.',
        };
      case 'partner':
        return {
          name: 'Partner Connection',
          icon: 'people' as const,
          message: 'Unable to connect with your partner.',
          suggestion: 'Check your internet connection and try reconnecting.',
        };
      case 'browse':
        return {
          name: 'Recipe Browser',
          icon: 'search' as const,
          message: 'Could not load the recipe library.',
          suggestion: 'Pull down to refresh or check your connection.',
        };
      case 'profile':
        return {
          name: 'Profile',
          icon: 'person' as const,
          message: 'Your profile information could not be loaded.',
          suggestion: 'Try logging out and back in if the issue persists.',
        };
      case 'matches':
        return {
          name: 'Matches',
          icon: 'heart' as const,
          message: 'Could not load your matched recipes.',
          suggestion: 'Refresh the page to see your latest matches.',
        };
    }
  };

  const config = getFeatureConfig(feature);

  const handleFeatureError = (error: Error, errorInfo: React.ErrorInfo) => {
    logger.error(`[FeatureErrorBoundary] Error in ${config.name}:`, {
      feature,
      error: error.toString(),
      stack: error.stack,
      componentStack: errorInfo.componentStack,
    });

    // Track feature-specific errors for analytics
    // TODO: Send to analytics service
  };

  const FeatureFallback = () => {
    const router = useRouter();
    
    return (
      <View className="flex-1 bg-gray-50">
        <View className="flex-1 items-center justify-center px-6">
          {/* Feature Icon */}
          <View className="w-16 h-16 bg-orange-100 rounded-full items-center justify-center mb-4">
            <Ionicons
              name={config.icon}
              size={32}
              color="#FB923C"
            />
          </View>

          {/* Error Message */}
          <Text className="text-xl font-bold text-gray-900 text-center mb-2">
            {config.message}
          </Text>

          {/* Suggestion */}
          <Text className="text-gray-600 text-center mb-6 px-4">
            {config.suggestion}
          </Text>

          {/* Action Buttons */}
          <View className="flex-col gap-3 w-full max-w-xs">
            {onRetry && (
              <Pressable
                onPress={onRetry}
                className="bg-pink-500 py-3 rounded-full items-center"
              >
                <View className="flex-row items-center">
                  <Ionicons name="refresh" size={20} color="white" />
                  <Text className="text-white font-semibold ml-2">
                    Try Again
                  </Text>
                </View>
              </Pressable>
            )}

            <Pressable
              onPress={() => router.back()}
              className="bg-gray-200 py-3 rounded-full items-center"
            >
              <View className="flex-row items-center">
                <Ionicons name="arrow-back" size={20} color="#374151" />
                <Text className="text-gray-700 font-semibold ml-2">
                  Go Back
                </Text>
              </View>
            </Pressable>
          </View>

          {/* Debug Info in Dev */}
          {__DEV__ && (
            <View className="mt-6 p-3 bg-gray-100 rounded-lg">
              <Text className="text-xs text-gray-600 text-center">
                Feature: {config.name} | Error Boundary Active
              </Text>
            </View>
          )}
        </View>
      </View>
    );
  };

  return (
    <ErrorBoundary
      level="feature"
      featureName={config.name}
      fallback={<FeatureFallback />}
      onError={handleFeatureError}
      showDetails={__DEV__}
    >
      {children}
    </ErrorBoundary>
  );
}

/**
 * HOC to wrap components with feature error boundaries
 */
export function withFeatureErrorBoundary<P extends object>(
  Component: React.ComponentType<P>,
  feature: FeatureType,
  onRetry?: () => void
) {
  return (props: P) => (
    <FeatureErrorBoundary feature={feature} onRetry={onRetry}>
      <Component {...props} />
    </FeatureErrorBoundary>
  );
}