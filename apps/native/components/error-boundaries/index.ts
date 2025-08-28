/**
 * Error Boundary Components for DinDin App
 * Provides comprehensive error handling at multiple levels
 */

export { ErrorBoundary } from './ErrorBoundary';
export { RootErrorBoundary } from './RootErrorBoundary';
export { 
  FeatureErrorBoundary, 
  withFeatureErrorBoundary 
} from './FeatureErrorBoundary';
export { 
  AsyncErrorBoundary,
  useAsyncError 
} from './AsyncErrorBoundary';

// Re-export types
export type { FeatureType } from './FeatureErrorBoundary';