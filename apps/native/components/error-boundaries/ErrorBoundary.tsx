import React, { Component, ErrorInfo, ReactNode } from 'react';
import {
  View,
  Text,
  ScrollView,
  Pressable,
  Alert,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import logger from '@/utils/logger';

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
  onError?: (error: Error, errorInfo: ErrorInfo) => void;
  level?: 'root' | 'feature' | 'component';
  featureName?: string;
  showDetails?: boolean;
  canRetry?: boolean;
}

interface State {
  hasError: boolean;
  error: Error | null;
  errorInfo: ErrorInfo | null;
  errorCount: number;
}

/**
 * Base Error Boundary component for catching React component errors
 * Provides customizable fallback UI and error reporting
 */
export class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = {
      hasError: false,
      error: null,
      errorInfo: null,
      errorCount: 0,
    };
  }

  static getDerivedStateFromError(error: Error): Partial<State> {
    // Update state so the next render will show the fallback UI
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    const { onError, level = 'component', featureName } = this.props;
    
    // Log error details for debugging
    logger.error(`[ErrorBoundary] ${level} error in ${featureName || 'unknown'}:`, {
      error: error.toString(),
      stack: error.stack,
      componentStack: errorInfo.componentStack,
      level,
      featureName,
    });

    // Call custom error handler if provided
    if (onError) {
      onError(error, errorInfo);
    }

    // Report to error tracking service (e.g., Sentry)
    this.reportErrorToService(error, errorInfo);

    // Update state with error details
    this.setState({
      errorInfo,
      errorCount: this.state.errorCount + 1,
    });
  }

  reportErrorToService = (error: Error, errorInfo: ErrorInfo) => {
    // TODO: Integrate with Sentry or other error tracking service
    // For now, just log to development console
    if (__DEV__) {
      logger.error('[ErrorTracking] Would report to service:', {
        message: error.message,
        stack: error.stack,
        componentStack: errorInfo.componentStack,
        level: this.props.level,
        feature: this.props.featureName,
        timestamp: new Date().toISOString(),
      });
    }
  };

  handleReset = () => {
    // Reset error boundary state
    this.setState({
      hasError: false,
      error: null,
      errorInfo: null,
    });
  };

  handleReport = () => {
    const { error, errorInfo } = this.state;
    if (error) {
      Alert.alert(
        'Error Report',
        'Would you like to send an error report to help us fix this issue?',
        [
          {
            text: 'Cancel',
            style: 'cancel',
          },
          {
            text: 'Send Report',
            onPress: () => {
              this.reportErrorToService(error, errorInfo!);
              Alert.alert('Thank you', 'Error report has been sent.');
            },
          },
        ],
      );
    }
  };

  render() {
    const { hasError, error, errorInfo, errorCount } = this.state;
    const {
      children,
      fallback,
      level = 'component',
      featureName,
      showDetails = __DEV__,
      canRetry = true,
    } = this.props;

    if (hasError) {
      // Use custom fallback if provided
      if (fallback) {
        return <>{fallback}</>;
      }

      // Default fallback UI based on error level
      return (
        <View className="flex-1 bg-gray-50">
          <ScrollView
            className="flex-1"
            contentContainerStyle={{ flexGrow: 1 }}
          >
            <View className="flex-1 items-center justify-center px-6 py-8">
              {/* Error Icon */}
              <View className="w-20 h-20 bg-red-100 rounded-full items-center justify-center mb-4">
                <Ionicons
                  name={level === 'root' ? 'alert-circle' : 'warning'}
                  size={40}
                  color="#EF4444"
                />
              </View>

              {/* Error Title */}
              <Text className="text-2xl font-bold text-gray-900 text-center mb-2">
                {level === 'root'
                  ? 'Oops! Something went wrong'
                  : `Error in ${featureName || 'this feature'}`}
              </Text>

              {/* Error Message */}
              <Text className="text-gray-600 text-center mb-6">
                {level === 'root'
                  ? "We're sorry, but the app encountered an unexpected error."
                  : `The ${featureName || 'feature'} encountered an issue and couldn't complete.`}
              </Text>

              {/* Error Details (Development Only) */}
              {showDetails && error && (
                <View className="bg-gray-100 rounded-lg p-4 mb-6 w-full">
                  <Text className="text-sm font-semibold text-gray-700 mb-2">
                    Error Details:
                  </Text>
                  <Text className="text-xs text-gray-600 font-mono">
                    {error.toString()}
                  </Text>
                  {errorInfo && (
                    <ScrollView
                      className="mt-2 max-h-32"
                      showsVerticalScrollIndicator={true}
                    >
                      <Text className="text-xs text-gray-500 font-mono">
                        {errorInfo.componentStack}
                      </Text>
                    </ScrollView>
                  )}
                </View>
              )}

              {/* Error Count Warning */}
              {errorCount > 2 && (
                <View className="bg-yellow-50 border border-yellow-200 rounded-lg p-3 mb-4 w-full">
                  <Text className="text-sm text-yellow-800 text-center">
                    This error has occurred {errorCount} times. Consider restarting the app if the issue persists.
                  </Text>
                </View>
              )}

              {/* Action Buttons */}
              <View className="flex-row gap-3">
                {canRetry && (
                  <Pressable
                    onPress={this.handleReset}
                    className="bg-pink-500 px-6 py-3 rounded-full flex-row items-center"
                  >
                    <Ionicons name="refresh" size={20} color="white" />
                    <Text className="text-white font-semibold ml-2">
                      Try Again
                    </Text>
                  </Pressable>
                )}

                {level === 'root' && (
                  <Pressable
                    onPress={this.handleReport}
                    className="bg-gray-200 px-6 py-3 rounded-full flex-row items-center"
                  >
                    <Ionicons name="bug" size={20} color="#374151" />
                    <Text className="text-gray-700 font-semibold ml-2">
                      Report
                    </Text>
                  </Pressable>
                )}
              </View>

              {/* Help Text */}
              {level === 'root' && (
                <Text className="text-xs text-gray-500 mt-4 text-center">
                  If this problem persists, please restart the app or contact support.
                </Text>
              )}
            </View>
          </ScrollView>
        </View>
      );
    }

    return children;
  }
}