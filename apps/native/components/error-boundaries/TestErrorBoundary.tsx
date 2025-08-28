import React, { useState } from 'react';
import { View, Text, Pressable } from 'react-native';
import { ErrorBoundary, FeatureErrorBoundary, AsyncErrorBoundary } from './index';
import logger from '@/utils/logger';

/**
 * Test component for verifying error boundaries work correctly
 * Only available in development mode
 */
export function TestErrorBoundary() {
  const [shouldThrow, setShouldThrow] = useState(false);
  const [errorType, setErrorType] = useState<'sync' | 'async' | 'promise'>('sync');

  if (!__DEV__) {
    return null;
  }

  const triggerSyncError = () => {
    setShouldThrow(true);
    setErrorType('sync');
  };

  const triggerAsyncError = async () => {
    setErrorType('async');
    setTimeout(() => {
      throw new Error('Test async error - setTimeout');
    }, 100);
  };

  const triggerPromiseRejection = () => {
    setErrorType('promise');
    Promise.reject(new Error('Test promise rejection'));
  };

  // Component that throws error on render
  const ErrorComponent = () => {
    if (shouldThrow && errorType === 'sync') {
      throw new Error('Test sync error - component render');
    }
    return <Text>Component rendered successfully</Text>;
  };

  return (
    <View className="p-4 bg-yellow-50 rounded-lg m-4">
      <Text className="text-lg font-bold text-gray-900 mb-2">
        🧪 Error Boundary Test
      </Text>
      <Text className="text-sm text-gray-600 mb-4">
        Development only - Test error handling
      </Text>

      <View className="gap-2">
        <Pressable
          onPress={triggerSyncError}
          className="bg-red-500 px-4 py-2 rounded"
        >
          <Text className="text-white text-center">
            Trigger Sync Error
          </Text>
        </Pressable>

        <Pressable
          onPress={triggerAsyncError}
          className="bg-orange-500 px-4 py-2 rounded"
        >
          <Text className="text-white text-center">
            Trigger Async Error
          </Text>
        </Pressable>

        <Pressable
          onPress={triggerPromiseRejection}
          className="bg-yellow-500 px-4 py-2 rounded"
        >
          <Text className="text-white text-center">
            Trigger Promise Rejection
          </Text>
        </Pressable>

        <Pressable
          onPress={() => {
            setShouldThrow(false);
            logger.log('[TestErrorBoundary] Reset test state');
          }}
          className="bg-gray-500 px-4 py-2 rounded"
        >
          <Text className="text-white text-center">
            Reset
          </Text>
        </Pressable>
      </View>

      {/* Test error boundary wrapping */}
      <ErrorBoundary
        level="component"
        featureName="TestComponent"
        showDetails={true}
      >
        <AsyncErrorBoundary>
          <View className="mt-4 p-2 bg-white rounded">
            <ErrorComponent />
          </View>
        </AsyncErrorBoundary>
      </ErrorBoundary>
    </View>
  );
}

/**
 * HOC to add test error boundary to any screen in development
 */
export function withTestErrorBoundary<P extends object>(
  Component: React.ComponentType<P>
) {
  if (!__DEV__) {
    return Component;
  }

  return (props: P) => (
    <>
      <Component {...props} />
      <TestErrorBoundary />
    </>
  );
}