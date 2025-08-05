/**
 * Bundle Size Optimization Utilities
 * Reduces bundle size and improves loading performance
 */

/**
 * Tree-shakable imports for commonly used libraries
 */

// Date-fns tree-shakable imports
export { format, formatDistance, formatRelative } from "date-fns";
export { nb as nbLocale, enUS as enLocale, fr as frLocale } from "date-fns/locale";

// Lucide React optimized imports
export {
  Search,
  Settings,
  User,
  Code,
  Folder,
  File,
  Download,
  Upload,
  Copy,
  Check,
  X,
  ChevronDown,
  ChevronUp,
  ChevronLeft,
  ChevronRight,
  Menu,
  Sun,
  Moon,
  Globe,
  Info,
  AlertTriangle,
  CheckCircle,
  XCircle,
  Loader2,
  Play,
  Pause,
  Stop,
} from "lucide-react";

/**
 * Optimized utility functions
 */

/**
 * Memoized class name utility
 */
import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

let classNameCache = new Map<string, string>();

export function cn(...inputs: ClassValue[]): string {
  const key = JSON.stringify(inputs);
  
  if (classNameCache.has(key)) {
    return classNameCache.get(key)!;
  }
  
  const result = twMerge(clsx(inputs));
  
  // Limit cache size to prevent memory leaks
  if (classNameCache.size > 1000) {
    classNameCache.clear();
  }
  
  classNameCache.set(key, result);
  return result;
}

/**
 * Debounced function utility
 */
export function debounce<T extends (...args: any[]) => any>(
  func: T,
  wait: number,
): (...args: Parameters<T>) => void {
  let timeout: NodeJS.Timeout | null = null;
  
  return (...args: Parameters<T>) => {
    if (timeout) {
      clearTimeout(timeout);
    }
    
    timeout = setTimeout(() => {
      func(...args);
      timeout = null;
    }, wait);
  };
}

/**
 * Throttled function utility
 */
export function throttle<T extends (...args: any[]) => any>(
  func: T,
  limit: number,
): (...args: Parameters<T>) => void {
  let inThrottle = false;
  
  return (...args: Parameters<T>) => {
    if (!inThrottle) {
      func(...args);
      inThrottle = true;
      setTimeout(() => {
        inThrottle = false;
      }, limit);
    }
  };
}

/**
 * Memory-efficient data structures
 */

/**
 * LRU Cache implementation for performance optimization
 */
export class LRUCache<K, V> {
  private cache = new Map<K, V>();
  private maxSize: number;

  constructor(maxSize: number = 100) {
    this.maxSize = maxSize;
  }

  get(key: K): V | undefined {
    if (this.cache.has(key)) {
      // Move to end (most recently used)
      const value = this.cache.get(key)!;
      this.cache.delete(key);
      this.cache.set(key, value);
      return value;
    }
    return undefined;
  }

  set(key: K, value: V): void {
    if (this.cache.has(key)) {
      this.cache.delete(key);
    } else if (this.cache.size >= this.maxSize) {
      // Remove least recently used (first item)
      const firstKey = this.cache.keys().next().value;
      this.cache.delete(firstKey);
    }
    
    this.cache.set(key, value);
  }

  has(key: K): boolean {
    return this.cache.has(key);
  }

  delete(key: K): boolean {
    return this.cache.delete(key);
  }

  clear(): void {
    this.cache.clear();
  }

  get size(): number {
    return this.cache.size;
  }
}

/**
 * Optimized JSON operations
 */
export const JSONUtils = {
  /**
   * Safe JSON parse with default value
   */
  parse<T>(json: string, defaultValue: T): T {
    try {
      return JSON.parse(json) as T;
    } catch {
      return defaultValue;
    }
  },

  /**
   * Compressed JSON stringify for large objects
   */
  stringify(obj: any, space?: number): string {
    // Remove undefined values and functions to reduce size
    return JSON.stringify(obj, (key, value) => {
      if (value === undefined || typeof value === "function") {
        return undefined;
      }
      return value;
    }, space);
  },

  /**
   * Deep clone with optimization
   */
  deepClone<T>(obj: T): T {
    if (obj === null || typeof obj !== "object") {
      return obj;
    }
    
    // Use structuredClone if available (modern browsers)
    if (typeof structuredClone !== "undefined") {
      return structuredClone(obj);
    }
    
    // Fallback to JSON method (with limitations)
    return JSON.parse(JSON.stringify(obj));
  },
};

/**
 * Bundle size monitoring
 */
export class BundleSizeMonitor {
  private static readonly STORAGE_KEY = "xaheen_bundle_metrics";
  
  static recordMetric(name: string, size: number): void {
    if (typeof window === "undefined") return;
    
    try {
      const metrics = this.getMetrics();
      metrics[name] = {
        size,
        timestamp: Date.now(),
      };
      
      localStorage.setItem(this.STORAGE_KEY, JSON.stringify(metrics));
    } catch {
      // Ignore storage errors
    }
  }
  
  static getMetrics(): Record<string, { size: number; timestamp: number }> {
    if (typeof window === "undefined") return {};
    
    try {
      const stored = localStorage.getItem(this.STORAGE_KEY);
      return stored ? JSON.parse(stored) : {};
    } catch {
      return {};
    }
  }
  
  static getTotalSize(): number {
    const metrics = this.getMetrics();
    return Object.values(metrics).reduce((total, metric) => total + metric.size, 0);
  }
  
  static clearMetrics(): void {
    if (typeof window === "undefined") return;
    
    try {
      localStorage.removeItem(this.STORAGE_KEY);
    } catch {
      // Ignore storage errors
    }
  }
}

/**
 * Resource preloading utilities
 */
export const ResourcePreloader = {
  /**
   * Preload CSS files
   */
  preloadCSS(href: string): void {
    if (typeof document === "undefined") return;
    
    const link = document.createElement("link");
    link.rel = "preload";
    link.as = "style";
    link.href = href;
    link.onload = () => {
      link.rel = "stylesheet";
    };
    document.head.appendChild(link);
  },

  /**
   * Preload JavaScript modules
   */
  preloadScript(src: string): Promise<void> {
    if (typeof document === "undefined") return Promise.resolve();
    
    return new Promise((resolve, reject) => {
      const script = document.createElement("link");
      script.rel = "modulepreload";
      script.href = src;
      script.onload = () => resolve();
      script.onerror = () => reject(new Error(`Failed to preload ${src}`));
      document.head.appendChild(script);
    });
  },

  /**
   * Preload images
   */
  preloadImage(src: string): Promise<void> {
    return new Promise((resolve, reject) => {
      const img = new Image();
      img.onload = () => resolve();
      img.onerror = () => reject(new Error(`Failed to preload image ${src}`));
      img.src = src;
    });
  },

  /**
   * Preload fonts
   */
  preloadFont(href: string, type: string = "font/woff2"): void {
    if (typeof document === "undefined") return;
    
    const link = document.createElement("link");
    link.rel = "preload";
    link.as = "font";
    link.type = type;
    link.crossOrigin = "anonymous";
    link.href = href;
    document.head.appendChild(link);
  },
};

/**
 * Performance monitoring
 */
export const PerformanceMonitor = {
  /**
   * Measure and report component render time
   */
  measureRender(name: string, fn: () => void): void {
    if (typeof performance === "undefined") {
      fn();
      return;
    }
    
    const start = performance.now();
    fn();
    const end = performance.now();
    
    // Report to monitoring service
    console.debug(`[Performance] ${name}: ${(end - start).toFixed(2)}ms`);
  },

  /**
   * Monitor bundle loading performance
   */
  monitorBundleLoad(bundleName: string): () => void {
    if (typeof performance === "undefined") {
      return () => {};
    }
    
    const start = performance.now();
    
    return () => {
      const end = performance.now();
      const duration = end - start;
      
      BundleSizeMonitor.recordMetric(`bundle_load_${bundleName}`, duration);
      console.debug(`[Bundle] ${bundleName} loaded in ${duration.toFixed(2)}ms`);
    };
  },
};