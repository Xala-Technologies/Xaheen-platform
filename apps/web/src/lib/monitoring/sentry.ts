/**
 * Sentry Error Tracking and Performance Monitoring
 * Comprehensive error tracking for Xaheen CLI Ecosystem
 */

import * as Sentry from "@sentry/nextjs";
import { BrowserTracing } from "@sentry/tracing";

/**
 * Initialize Sentry for error tracking and performance monitoring
 */
export function initializeSentry(): void {
  if (typeof window === "undefined") return; // Server-side initialization handled separately
  
  Sentry.init({
    dsn: process.env.NEXT_PUBLIC_SENTRY_DSN,
    environment: process.env.NODE_ENV || "development",
    
    // Performance monitoring
    integrations: [
      new BrowserTracing({
        // Set tracing origins to track performance for these domains
        tracingOrigins: [
          "localhost",
          "xaheen.no",
          "api.xaheen.no",
          "mcp.xaheen.no",
          /^\//,
        ],
        
        // Capture interactions and navigation
        routingInstrumentation: Sentry.reactRouterV6BrowserTracingIntegration({
          useEffect: React.useEffect,
        }),
      }),
    ],
    
    // Capture percentage of transactions for performance monitoring
    tracesSampleRate: process.env.NODE_ENV === "production" ? 0.1 : 1.0,
    
    // Capture percentage of the errors
    sampleRate: 1.0,
    
    // Session replay for debugging
    replaysSessionSampleRate: process.env.NODE_ENV === "production" ? 0.1 : 1.0,
    replaysOnErrorSampleRate: 1.0,
    
    // Release tracking
    release: process.env.NEXT_PUBLIC_APP_VERSION || "unknown",
    
    // Additional configuration
    beforeSend(event) {
      // Filter out development errors in production
      if (process.env.NODE_ENV === "production") {
        // Don't send console errors
        if (event.message?.includes("console")) {
          return null;
        }
        
        // Don't send 404 errors
        if (event.message?.includes("404")) {
          return null;
        }
      }
      
      return event;
    },
    
    // Add user context
    initialScope: {
      tags: {
        component: "web-app",
        platform: "next.js",
        version: process.env.NEXT_PUBLIC_APP_VERSION || "unknown",
      },
    },
  });
}

/**
 * Enhanced error boundary with Sentry integration
 */
export class SentryErrorBoundary extends React.Component<
  { children: React.ReactNode; fallback?: React.ComponentType<{ error: Error }> },
  { hasError: boolean; error: Error | null }
> {
  constructor(props: { children: React.ReactNode; fallback?: React.ComponentType<{ error: Error }> }) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error): { hasError: boolean; error: Error } {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo): void {
    // Log error to Sentry
    Sentry.withScope((scope) => {
      scope.setTag("errorBoundary", true);
      scope.setContext("errorInfo", errorInfo);
      Sentry.captureException(error);
    });
    
    console.error("Error Boundary caught an error:", error, errorInfo);
  }

  render(): React.ReactNode {
    if (this.state.hasError && this.state.error) {
      if (this.props.fallback) {
        const FallbackComponent = this.props.fallback;
        return <FallbackComponent error={this.state.error} />;
      }
      
      return (
        <div className="flex min-h-screen items-center justify-center p-4">
          <div className="max-w-md rounded-lg border border-red-200 bg-red-50 p-6 text-center">
            <h2 className="mb-2 text-lg font-semibold text-red-800">
              Something went wrong
            </h2>
            <p className="mb-4 text-red-600">
              An unexpected error occurred. Our team has been notified.
            </p>
            <button
              onClick={() => window.location.reload()}
              className="rounded bg-red-600 px-4 py-2 text-white hover:bg-red-700"
            >
              Reload Page
            </button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

/**
 * Custom error reporting functions
 */
export const ErrorReporter = {
  /**
   * Report a user action error
   */
  reportUserError(error: Error, context: Record<string, any> = {}): void {
    Sentry.withScope((scope) => {
      scope.setTag("errorType", "user-action");
      scope.setLevel("error");
      scope.setContext("userAction", context);
      Sentry.captureException(error);
    });
  },

  /**
   * Report an API error
   */
  reportAPIError(error: Error, endpoint: string, method: string, statusCode?: number): void {
    Sentry.withScope((scope) => {
      scope.setTag("errorType", "api");
      scope.setTag("endpoint", endpoint);
      scope.setTag("method", method);
      if (statusCode) {
        scope.setTag("statusCode", statusCode.toString());
      }
      scope.setLevel("error");
      Sentry.captureException(error);
    });
  },

  /**
   * Report a performance issue
   */
  reportPerformanceIssue(metric: string, value: number, threshold: number): void {
    if (value > threshold) {
      Sentry.withScope((scope) => {
        scope.setTag("issueType", "performance");
        scope.setTag("metric", metric);
        scope.setLevel("warning");
        scope.setContext("performance", {
          metric,
          value,
          threshold,
          exceeded: value - threshold,
        });
        Sentry.captureMessage(`Performance threshold exceeded: ${metric}`);
      });
    }
  },

  /**
   * Report a Norwegian compliance issue
   */
  reportComplianceIssue(type: "gdpr" | "nsm" | "accessibility", details: string): void {
    Sentry.withScope((scope) => {
      scope.setTag("issueType", "compliance");
      scope.setTag("complianceType", type);
      scope.setLevel("warning");
      scope.setContext("compliance", {
        type,
        details,
        timestamp: new Date().toISOString(),
      });
      Sentry.captureMessage(`Compliance issue detected: ${type}`);
    });
  },
};

/**
 * Performance monitoring utilities
 */
export const PerformanceTracker = {
  /**
   * Track component render performance
   */
  trackComponentRender(componentName: string, renderTime: number): void {
    Sentry.addBreadcrumb({
      category: "performance",
      message: `Component ${componentName} rendered`,
      level: "info",
      data: {
        componentName,
        renderTime,
      },
    });

    // Report slow renders
    if (renderTime > 100) {
      ErrorReporter.reportPerformanceIssue("component-render", renderTime, 100);
    }
  },

  /**
   * Track API call performance
   */
  trackAPICall(endpoint: string, duration: number, success: boolean): void {
    Sentry.addBreadcrumb({
      category: "api",
      message: `API call to ${endpoint}`,
      level: success ? "info" : "error",
      data: {
        endpoint,
        duration,
        success,
      },
    });

    // Report slow API calls
    if (duration > 2000) {
      ErrorReporter.reportPerformanceIssue("api-response", duration, 2000);
    }
  },

  /**
   * Track user interactions
   */
  trackUserInteraction(action: string, element: string, metadata?: Record<string, any>): void {
    Sentry.addBreadcrumb({
      category: "user",
      message: `User ${action} on ${element}`,
      level: "info",
      data: {
        action,
        element,
        ...metadata,
      },
    });
  },
};

/**
 * User context management
 */
export const UserContextManager = {
  /**
   * Set user information for error tracking
   */
  setUser(user: {
    id: string;
    email?: string;
    username?: string;
    locale?: string;
    plan?: string;
  }): void {
    Sentry.setUser({
      id: user.id,
      email: user.email,
      username: user.username,
      locale: user.locale,
      subscription: user.plan,
    });
  },

  /**
   * Clear user information
   */
  clearUser(): void {
    Sentry.setUser(null);
  },

  /**
   * Add custom context
   */
  setContext(key: string, context: Record<string, any>): void {
    Sentry.setContext(key, context);
  },

  /**
   * Add tags for filtering
   */
  setTags(tags: Record<string, string>): void {
    Sentry.setTags(tags);
  },
};

/**
 * React hook for error tracking
 */
export function useErrorTracking(): {
  reportError: (error: Error, context?: Record<string, any>) => void;
  reportPerformance: (metric: string, value: number) => void;
} {
  const reportError = React.useCallback((error: Error, context: Record<string, any> = {}) => {
    ErrorReporter.reportUserError(error, context);
  }, []);

  const reportPerformance = React.useCallback((metric: string, value: number) => {
    PerformanceTracker.trackComponentRender(metric, value);
  }, []);

  return { reportError, reportPerformance };
}

/**
 * HOC for automatic error tracking
 */
export function withErrorTracking<P extends object>(
  Component: React.ComponentType<P>,
  componentName?: string,
): React.ComponentType<P> {
  const WrappedComponent = (props: P) => {
    const startTime = React.useRef(Date.now());
    
    React.useEffect(() => {
      const renderTime = Date.now() - startTime.current;
      PerformanceTracker.trackComponentRender(
        componentName || Component.name || "UnknownComponent",
        renderTime
      );
    });

    return (
      <SentryErrorBoundary>
        <Component {...props} />
      </SentryErrorBoundary>
    );
  };

  WrappedComponent.displayName = `withErrorTracking(${componentName || Component.name || "Component"})`;
  
  return WrappedComponent;
}