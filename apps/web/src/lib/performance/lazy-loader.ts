/**
 * Dynamic Lazy Loading Utilities for Xaheen CLI Ecosystem
 * Optimizes bundle size and loading performance
 */

import { lazy, ComponentType, LazyExoticComponent } from "react";

/**
 * Lazy load a component with loading state
 */
export function createLazyComponent<T extends ComponentType<any>>(
  importFn: () => Promise<{ default: T }>,
  fallback?: ComponentType,
): LazyExoticComponent<T> {
  return lazy(importFn);
}

/**
 * Preload a lazy component to reduce loading time
 */
export function preloadComponent<T extends ComponentType<any>>(
  importFn: () => Promise<{ default: T }>,
): Promise<{ default: T }> {
  return importFn();
}

/**
 * Create a lazy component with retry logic
 */
export function createRetryableLazyComponent<T extends ComponentType<any>>(
  importFn: () => Promise<{ default: T }>,
  maxRetries: number = 3,
): LazyExoticComponent<T> {
  return lazy(async () => {
    let lastError: Error | null = null;
    
    for (let i = 0; i <= maxRetries; i++) {
      try {
        return await importFn();
      } catch (error) {
        lastError = error as Error;
        
        // Wait before retry (exponential backoff)
        if (i < maxRetries) {
          await new Promise(resolve => setTimeout(resolve, Math.pow(2, i) * 1000));
        }
      }
    }
    
    throw lastError || new Error("Failed to load component after retries");
  });
}

/**
 * Lazy loaded components for the Xaheen CLI Ecosystem
 */
export const LazyComponents = {
  // Dashboard components
  AgentDashboard: createLazyComponent(() => import("@/components/agent-dashboard/AgentDashboard")),
  ProjectWizard: createLazyComponent(() => import("@/components/wizard/ProjectWizard")),
  CodeDiffPreview: createLazyComponent(() => import("@/components/code-diff/CodeDiffPreview")),
  
  // AI components
  AIAssistantPanel: createLazyComponent(() => import("@/components/ai-assistant/AIAssistantPanel")),
  
  // Heavy UI components
  DataTable: createLazyComponent(() => import("@/components/ui/data-table")),
  Chart: createLazyComponent(() => import("@/components/ui/chart")),
  
  // Analytics components
  AnalyticsDashboard: createRetryableLazyComponent(() => import("@/components/analytics/AnalyticsDashboard")),
  
  // Documentation components
  DocsSearch: createLazyComponent(() => import("@/components/docs/DocsSearch")),
  APIReference: createLazyComponent(() => import("@/components/docs/APIReference")),
  
  // Settings and admin
  UserSettings: createLazyComponent(() => import("@/components/settings/UserSettings")),
  AdminPortal: createLazyComponent(() => import("@/components/admin/AdminPortal")),
} as const;

/**
 * Preload critical components on app initialization
 */
export function preloadCriticalComponents(): void {
  // Preload components that are likely to be used soon
  if (typeof window !== "undefined") {
    // Use requestIdleCallback if available, otherwise setTimeout
    const schedulePreload = (fn: () => void) => {
      if ("requestIdleCallback" in window) {
        requestIdleCallback(fn);
      } else {
        setTimeout(fn, 100);
      }
    };
    
    schedulePreload(() => {
      preloadComponent(() => import("@/components/agent-dashboard/AgentDashboard"));
      preloadComponent(() => import("@/components/wizard/ProjectWizard"));
    });
  }
}

/**
 * Component preloader for route-based loading
 */
export class ComponentPreloader {
  private static preloadedComponents = new Set<string>();
  
  static preload(componentPath: string, importFn: () => Promise<any>): void {
    if (this.preloadedComponents.has(componentPath)) {
      return;
    }
    
    this.preloadedComponents.add(componentPath);
    
    // Preload on idle
    if (typeof window !== "undefined" && "requestIdleCallback" in window) {
      requestIdleCallback(() => {
        importFn().catch(() => {
          // Remove from preloaded set if failed
          this.preloadedComponents.delete(componentPath);
        });
      });
    }
  }
  
  static isPreloaded(componentPath: string): boolean {
    return this.preloadedComponents.has(componentPath);
  }
}

/**
 * Hook for intersection-based lazy loading
 */
export function useIntersectionLazyLoad(
  threshold: number = 0.1,
): [React.RefObject<HTMLDivElement>, boolean] {
  const [isIntersecting, setIsIntersecting] = React.useState(false);
  const ref = React.useRef<HTMLDivElement>(null);
  
  React.useEffect(() => {
    const element = ref.current;
    if (!element) return;
    
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsIntersecting(true);
          observer.disconnect();
        }
      },
      { threshold }
    );
    
    observer.observe(element);
    
    return () => observer.disconnect();
  }, [threshold]);
  
  return [ref, isIntersecting];
}

// Export types
export type LazyComponentType = typeof LazyComponents[keyof typeof LazyComponents];