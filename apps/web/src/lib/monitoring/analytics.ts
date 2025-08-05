/**
 * Analytics and User Behavior Tracking
 * Comprehensive analytics for Xaheen CLI Ecosystem with GDPR compliance
 */

import { PostHog } from "posthog-js";

/**
 * Analytics service configuration
 */
interface AnalyticsConfig {
  apiKey: string;
  apiHost: string;
  enabledInDevelopment: boolean;
  sessionRecording: boolean;
  capturePageViews: boolean;
  respectDoNotTrack: boolean;
}

/**
 * User analytics events
 */
type AnalyticsEvent = 
  | { name: "page_view"; properties: { path: string; title: string; locale: string } }
  | { name: "component_generated"; properties: { type: string; platform: string; success: boolean } }
  | { name: "ai_assistant_used"; properties: { query: string; response_time: number } }
  | { name: "project_created"; properties: { template: string; platforms: string[] } }
  | { name: "documentation_viewed"; properties: { section: string; page: string } }
  | { name: "error_occurred"; properties: { error_type: string; component: string } }
  | { name: "performance_metric"; properties: { metric: string; value: number; threshold: number } }
  | { name: "user_onboarding"; properties: { step: string; completed: boolean } }
  | { name: "feature_used"; properties: { feature: string; context: string } }
  | { name: "compliance_action"; properties: { type: "gdpr" | "nsm"; action: string } };

/**
 * Analytics service class
 */
class AnalyticsService {
  private posthog: PostHog | null = null;
  private initialized = false;
  private config: AnalyticsConfig | null = null;
  private consentGiven = false;
  private eventQueue: AnalyticsEvent[] = [];

  /**
   * Initialize analytics service
   */
  initialize(config: AnalyticsConfig): void {
    if (typeof window === "undefined") return;
    
    this.config = config;

    // Respect Do Not Track
    if (config.respectDoNotTrack && navigator.doNotTrack === "1") {
      console.log("Analytics disabled due to Do Not Track preference");
      return;
    }

    // Don't initialize in development unless explicitly enabled
    if (process.env.NODE_ENV === "development" && !config.enabledInDevelopment) {
      console.log("Analytics disabled in development");
      return;
    }

    try {
      this.posthog = new PostHog();
      this.posthog.init(config.apiKey, {
        api_host: config.apiHost,
        
        // Privacy settings
        respect_dnt: config.respectDoNotTrack,
        disable_session_recording: !config.sessionRecording,
        disable_persistence: false,
        
        // Performance settings
        capture_pageviews: config.capturePageViews,
        capture_pageleaves: true,
        
        // GDPR compliance
        opt_out_capturing_by_default: true, // Require explicit consent
        
        // Custom configuration
        autocapture: false, // Disable automatic event capture
        session_recording: {
          maskAllInputs: true,
          maskAllText: false,
          recordCrossOriginIframes: false,
        },
        
        // Sampling for performance
        sampling: {
          sessionRecording: process.env.NODE_ENV === "production" ? 0.1 : 1.0,
        },
      });

      this.initialized = true;
      console.log("Analytics initialized successfully");
    } catch (error) {
      console.error("Failed to initialize analytics:", error);
    }
  }

  /**
   * Give consent for analytics tracking (GDPR compliance)
   */
  giveConsent(): void {
    if (!this.posthog || !this.initialized) return;
    
    this.consentGiven = true;
    this.posthog.opt_in_capturing();
    
    // Process queued events
    this.eventQueue.forEach(event => {
      this.trackEvent(event.name, event.properties);
    });
    this.eventQueue = [];
    
    console.log("Analytics consent given, tracking enabled");
  }

  /**
   * Revoke consent for analytics tracking (GDPR compliance)
   */
  revokeConsent(): void {
    if (!this.posthog) return;
    
    this.consentGiven = false;
    this.posthog.opt_out_capturing();
    this.posthog.reset(); // Clear stored data
    
    console.log("Analytics consent revoked, tracking disabled");
  }

  /**
   * Check if consent has been given
   */
  hasConsent(): boolean {
    return this.consentGiven;
  }

  /**
   * Track a custom event
   */
  track<T extends AnalyticsEvent>(event: T): void {
    if (!this.initialized || !this.posthog) {
      console.warn("Analytics not initialized");
      return;
    }

    // Queue events if consent not given
    if (!this.consentGiven) {
      this.eventQueue.push(event);
      return;
    }

    try {
      this.posthog.capture(event.name, {
        ...event.properties,
        timestamp: new Date().toISOString(),
        user_agent: navigator.userAgent,
        url: window.location.href,
        referrer: document.referrer,
      });
    } catch (error) {
      console.error("Failed to track event:", error);
    }
  }

  /**
   * Track page view
   */
  trackPageView(path: string, title: string): void {
    this.track({
      name: "page_view",
      properties: {
        path,
        title,
        locale: document.documentElement.lang || "en",
      },
    });
  }

  /**
   * Identify user
   */
  identifyUser(userId: string, properties?: Record<string, any>): void {
    if (!this.consentGiven || !this.posthog) return;

    try {
      this.posthog.identify(userId, {
        ...properties,
        identified_at: new Date().toISOString(),
      });
    } catch (error) {
      console.error("Failed to identify user:", error);
    }
  }

  /**
   * Reset user session
   */
  reset(): void {
    if (!this.posthog) return;

    try {
      this.posthog.reset();
    } catch (error) {
      console.error("Failed to reset analytics:", error);
    }
  }

  /**
   * Set user properties
   */
  setUserProperties(properties: Record<string, any>): void {
    if (!this.consentGiven || !this.posthog) return;

    try {
      this.posthog.people.set(properties);
    } catch (error) {
      console.error("Failed to set user properties:", error);
    }
  }

  /**
   * Track feature flag usage
   */
  trackFeatureFlag(flag: string, value: boolean | string): void {
    this.track({
      name: "feature_used",
      properties: {
        feature: flag,
        context: `flag_${value}`,
      },
    });
  }

  /**
   * Get analytics instance (for advanced usage)
   */
  getInstance(): PostHog | null {
    return this.posthog;
  }
}

// Singleton instance
export const analytics = new AnalyticsService();

/**
 * Initialize analytics with environment configuration
 */
export function initializeAnalytics(): void {
  const config: AnalyticsConfig = {
    apiKey: process.env.NEXT_PUBLIC_POSTHOG_KEY || "",
    apiHost: process.env.NEXT_PUBLIC_POSTHOG_HOST || "https://us.i.posthog.com",
    enabledInDevelopment: false,
    sessionRecording: process.env.NODE_ENV === "production",
    capturePageViews: true,
    respectDoNotTrack: true,
  };

  if (config.apiKey) {
    analytics.initialize(config);
  } else {
    console.warn("Analytics API key not configured");
  }
}

/**
 * React hook for analytics
 */
export function useAnalytics() {
  const trackEvent = React.useCallback((event: AnalyticsEvent) => {
    analytics.track(event);
  }, []);

  const trackPageView = React.useCallback((path: string, title: string) => {
    analytics.trackPageView(path, title);
  }, []);

  const identifyUser = React.useCallback((userId: string, properties?: Record<string, any>) => {
    analytics.identifyUser(userId, properties);
  }, []);

  const giveConsent = React.useCallback(() => {
    analytics.giveConsent();
  }, []);

  const revokeConsent = React.useCallback(() => {
    analytics.revokeConsent();
  }, []);

  return {
    track: trackEvent,
    trackPageView,
    identifyUser,
    giveConsent,
    revokeConsent,
    hasConsent: analytics.hasConsent(),
  };
}

/**
 * HOC for automatic page view tracking
 */
export function withPageTracking<P extends object>(
  Component: React.ComponentType<P>,
  pageName?: string,
): React.ComponentType<P> {
  const WrappedComponent = (props: P) => {
    const { trackPageView } = useAnalytics();
    
    React.useEffect(() => {
      if (typeof window !== "undefined") {
        const title = pageName || document.title;
        trackPageView(window.location.pathname, title);
      }
    }, [trackPageView]);

    return <Component {...props} />;
  };

  WrappedComponent.displayName = `withPageTracking(${Component.name || "Component"})`;
  
  return WrappedComponent;
}

/**
 * Custom analytics events for Xaheen CLI Ecosystem
 */
export const XaheenAnalytics = {
  /**
   * Track component generation
   */
  trackComponentGeneration(type: string, platform: string, success: boolean): void {
    analytics.track({
      name: "component_generated",
      properties: { type, platform, success },
    });
  },

  /**
   * Track AI assistant usage
   */
  trackAIAssistant(query: string, responseTime: number): void {
    analytics.track({
      name: "ai_assistant_used",
      properties: { 
        query: query.substring(0, 100), // Truncate for privacy
        response_time: responseTime,
      },
    });
  },

  /**
   * Track project creation
   */
  trackProjectCreation(template: string, platforms: string[]): void {
    analytics.track({
      name: "project_created",
      properties: { template, platforms },
    });
  },

  /**
   * Track documentation usage
   */
  trackDocumentationView(section: string, page: string): void {
    analytics.track({
      name: "documentation_viewed",
      properties: { section, page },
    });
  },

  /**
   * Track compliance actions
   */
  trackComplianceAction(type: "gdpr" | "nsm", action: string): void {
    analytics.track({
      name: "compliance_action",
      properties: { type, action },
    });
  },

  /**
   * Track onboarding progress
   */
  trackOnboarding(step: string, completed: boolean): void {
    analytics.track({
      name: "user_onboarding",
      properties: { step, completed },
    });
  },
};

/**
 * GDPR consent management
 */
export const ConsentManager = {
  /**
   * Check if consent has been given
   */
  hasConsent(): boolean {
    if (typeof window === "undefined") return false;
    return localStorage.getItem("analytics_consent") === "true";
  },

  /**
   * Store consent preference
   */
  setConsent(consent: boolean): void {
    if (typeof window === "undefined") return;
    
    localStorage.setItem("analytics_consent", consent.toString());
    
    if (consent) {
      analytics.giveConsent();
    } else {
      analytics.revokeConsent();
    }
  },

  /**
   * Get consent timestamp
   */
  getConsentTimestamp(): Date | null {
    if (typeof window === "undefined") return null;
    
    const timestamp = localStorage.getItem("analytics_consent_timestamp");
    return timestamp ? new Date(timestamp) : null;
  },

  /**
   * Set consent timestamp
   */
  setConsentTimestamp(date: Date = new Date()): void {
    if (typeof window === "undefined") return;
    
    localStorage.setItem("analytics_consent_timestamp", date.toISOString());
  },
};