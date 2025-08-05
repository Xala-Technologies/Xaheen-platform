/**
 * Real-time Dashboard and Performance Monitoring
 * Live metrics and system health monitoring for Xaheen CLI Ecosystem
 */

import { EventEmitter } from "events";

/**
 * Performance metrics interface
 */
export interface PerformanceMetrics {
  // Core Web Vitals
  lcp: number; // Largest Contentful Paint
  fid: number; // First Input Delay
  cls: number; // Cumulative Layout Shift
  fcp: number; // First Contentful Paint
  ttfb: number; // Time to First Byte
  
  // Custom metrics
  bundleSize: number;
  memoryUsage: number;
  renderTime: number;
  apiResponseTime: number;
  errorRate: number;
  
  // User experience
  userSatisfaction: number;
  bounceRate: number;
  sessionDuration: number;
  
  // System health
  uptime: number;
  availability: number;
  throughput: number;
}

/**
 * System health status
 */
export type SystemHealth = "healthy" | "warning" | "critical" | "unknown";

/**
 * Real-time metric update
 */
export interface MetricUpdate {
  metric: keyof PerformanceMetrics;
  value: number;
  timestamp: number;
  threshold?: {
    warning: number;
    critical: number;
  };
}

/**
 * Alert configuration
 */
export interface AlertConfig {
  metric: keyof PerformanceMetrics;
  threshold: number;
  severity: "info" | "warning" | "error" | "critical";
  message: string;
  enabled: boolean;
}

/**
 * Real-time monitoring service
 */
class RealTimeMonitoringService extends EventEmitter {
  private metrics: Partial<PerformanceMetrics> = {};
  private alerts: AlertConfig[] = [];
  private intervalId: NodeJS.Timeout | null = null;
  private observers: PerformanceObserver[] = [];
  private isRunning = false;

  constructor() {
    super();
    this.setupDefaultAlerts();
  }

  /**
   * Start real-time monitoring
   */
  start(): void {
    if (this.isRunning || typeof window === "undefined") return;

    this.isRunning = true;
    this.setupPerformanceObservers();
    this.startMetricsCollection();
    
    console.log("Real-time monitoring started");
  }

  /**
   * Stop real-time monitoring
   */
  stop(): void {
    if (!this.isRunning) return;

    this.isRunning = false;
    
    // Clear interval
    if (this.intervalId) {
      clearInterval(this.intervalId);
      this.intervalId = null;
    }

    // Disconnect observers
    this.observers.forEach(observer => observer.disconnect());
    this.observers = [];
    
    console.log("Real-time monitoring stopped");
  }

  /**
   * Get current metrics
   */
  getMetrics(): Partial<PerformanceMetrics> {
    return { ...this.metrics };
  }

  /**
   * Update a specific metric
   */
  updateMetric(metric: keyof PerformanceMetrics, value: number): void {
    const previousValue = this.metrics[metric];
    this.metrics[metric] = value;

    const update: MetricUpdate = {
      metric,
      value,
      timestamp: Date.now(),
    };

    // Check alerts
    this.checkAlerts(metric, value);

    // Emit update event
    this.emit("metricUpdate", update);
    this.emit(`metric:${metric}`, value, previousValue);
  }

  /**
   * Get system health status
   */
  getSystemHealth(): SystemHealth {
    const criticalMetrics = {
      errorRate: 0.05, // 5%
      apiResponseTime: 5000, // 5 seconds
      memoryUsage: 0.9, // 90%
      availability: 0.95, // 95%
    };

    const warningMetrics = {
      errorRate: 0.02, // 2%
      apiResponseTime: 2000, // 2 seconds
      memoryUsage: 0.7, // 70%
      availability: 0.98, // 98%
    };

    // Check critical thresholds
    for (const [metric, threshold] of Object.entries(criticalMetrics)) {
      const value = this.metrics[metric as keyof PerformanceMetrics];
      if (value !== undefined) {
        if (metric === "availability" && value < threshold) return "critical";
        if (metric !== "availability" && value > threshold) return "critical";
      }
    }

    // Check warning thresholds
    for (const [metric, threshold] of Object.entries(warningMetrics)) {
      const value = this.metrics[metric as keyof PerformanceMetrics];
      if (value !== undefined) {
        if (metric === "availability" && value < threshold) return "warning";
        if (metric !== "availability" && value > threshold) return "warning";
      }
    }

    return "healthy";
  }

  /**
   * Add custom alert
   */
  addAlert(alert: AlertConfig): void {
    this.alerts.push(alert);
  }

  /**
   * Remove alert
   */
  removeAlert(metric: keyof PerformanceMetrics): void {
    this.alerts = this.alerts.filter(alert => alert.metric !== metric);
  }

  /**
   * Get active alerts
   */
  getAlerts(): AlertConfig[] {
    return [...this.alerts];
  }

  /**
   * Setup default alert configurations
   */
  private setupDefaultAlerts(): void {
    this.alerts = [
      {
        metric: "lcp",
        threshold: 2500,
        severity: "warning",
        message: "Largest Contentful Paint is slower than recommended",
        enabled: true,
      },
      {
        metric: "fid",
        threshold: 100,
        severity: "warning",
        message: "First Input Delay is higher than recommended",
        enabled: true,
      },
      {
        metric: "cls",
        threshold: 0.1,
        severity: "warning",
        message: "Cumulative Layout Shift is higher than recommended",
        enabled: true,
      },
      {
        metric: "errorRate",
        threshold: 0.05,
        severity: "critical",
        message: "Error rate is critically high",
        enabled: true,
      },
      {
        metric: "memoryUsage",
        threshold: 0.8,
        severity: "warning",
        message: "Memory usage is high",
        enabled: true,
      },
      {
        metric: "apiResponseTime",
        threshold: 3000,
        severity: "warning",
        message: "API response time is slower than expected",
        enabled: true,
      },
    ];
  }

  /**
   * Setup performance observers
   */
  private setupPerformanceObservers(): void {
    if (typeof PerformanceObserver === "undefined") return;

    // Core Web Vitals observer
    try {
      const webVitalsObserver = new PerformanceObserver((list) => {
        list.getEntries().forEach((entry) => {
          switch (entry.name) {
            case "largest-contentful-paint":
              this.updateMetric("lcp", entry.startTime);
              break;
            case "first-input":
              this.updateMetric("fid", (entry as any).processingStart - entry.startTime);
              break;
            case "layout-shift":
              if (!(entry as any).hadRecentInput) {
                const currentCLS = this.metrics.cls || 0;
                this.updateMetric("cls", currentCLS + (entry as any).value);
              }
              break;
          }
        });
      });

      webVitalsObserver.observe({ entryTypes: ["largest-contentful-paint", "first-input", "layout-shift"] });
      this.observers.push(webVitalsObserver);
    } catch (error) {
      console.warn("Could not setup Web Vitals observer:", error);
    }

    // Navigation timing observer
    try {
      const navigationObserver = new PerformanceObserver((list) => {
        list.getEntries().forEach((entry) => {
          const navEntry = entry as PerformanceNavigationTiming;
          this.updateMetric("ttfb", navEntry.responseStart - navEntry.requestStart);
          this.updateMetric("fcp", navEntry.loadEventEnd - navEntry.navigationStart);
        });
      });

      navigationObserver.observe({ entryTypes: ["navigation"] });
      this.observers.push(navigationObserver);
    } catch (error) {
      console.warn("Could not setup navigation observer:", error);
    }

    // Resource timing observer
    try {
      const resourceObserver = new PerformanceObserver((list) => {
        const entries = list.getEntries();
        const totalSize = entries.reduce((sum, entry) => {
          return sum + ((entry as any).transferSize || 0);
        }, 0);
        
        if (totalSize > 0) {
          this.updateMetric("bundleSize", totalSize);
        }
      });

      resourceObserver.observe({ entryTypes: ["resource"] });
      this.observers.push(resourceObserver);
    } catch (error) {
      console.warn("Could not setup resource observer:", error);
    }
  }

  /**
   * Start collecting custom metrics
   */
  private startMetricsCollection(): void {
    this.intervalId = setInterval(() => {
      this.collectMemoryMetrics();
      this.collectNetworkMetrics();
      this.collectUserExperienceMetrics();
    }, 5000); // Collect every 5 seconds
  }

  /**
   * Collect memory usage metrics
   */
  private collectMemoryMetrics(): void {
    if ("memory" in performance) {
      const memory = (performance as any).memory;
      const memoryUsage = memory.usedJSHeapSize / memory.jsHeapSizeLimit;
      this.updateMetric("memoryUsage", memoryUsage);
    }
  }

  /**
   * Collect network metrics
   */
  private collectNetworkMetrics(): void {
    if ("connection" in navigator) {
      const connection = (navigator as any).connection;
      // This is a placeholder - in real implementation, you'd collect actual network metrics
      this.updateMetric("throughput", connection.downlink || 0);
    }
  }

  /**
   * Collect user experience metrics
   */
  private collectUserExperienceMetrics(): void {
    // Calculate uptime (time since page load)
    const uptime = Date.now() - (performance.timeOrigin + performance.now());
    this.updateMetric("uptime", uptime);

    // Calculate session duration
    const sessionStart = sessionStorage.getItem("session_start");
    if (sessionStart) {
      const sessionDuration = Date.now() - parseInt(sessionStart);
      this.updateMetric("sessionDuration", sessionDuration);
    } else {
      sessionStorage.setItem("session_start", Date.now().toString());
    }
  }

  /**
   * Check if metric value triggers any alerts
   */
  private checkAlerts(metric: keyof PerformanceMetrics, value: number): void {
    const relevantAlerts = this.alerts.filter(
      alert => alert.metric === metric && alert.enabled
    );

    relevantAlerts.forEach(alert => {
      if (value > alert.threshold) {
        this.emit("alert", {
          ...alert,
          currentValue: value,
          timestamp: Date.now(),
        });
      }
    });
  }
}

// Singleton instance
export const realtimeMonitor = new RealTimeMonitoringService();

/**
 * React hook for real-time monitoring
 */
export function useRealTimeMonitoring() {
  const [metrics, setMetrics] = React.useState<Partial<PerformanceMetrics>>({});
  const [systemHealth, setSystemHealth] = React.useState<SystemHealth>("unknown");
  const [alerts, setAlerts] = React.useState<any[]>([]);

  React.useEffect(() => {
    // Start monitoring
    realtimeMonitor.start();

    // Set up event listeners
    const handleMetricUpdate = (update: MetricUpdate) => {
      setMetrics(prevMetrics => ({
        ...prevMetrics,
        [update.metric]: update.value,
      }));
      setSystemHealth(realtimeMonitor.getSystemHealth());
    };

    const handleAlert = (alert: any) => {
      setAlerts(prevAlerts => [...prevAlerts, alert]);
    };

    realtimeMonitor.on("metricUpdate", handleMetricUpdate);
    realtimeMonitor.on("alert", handleAlert);

    // Initial data
    setMetrics(realtimeMonitor.getMetrics());
    setSystemHealth(realtimeMonitor.getSystemHealth());

    return () => {
      realtimeMonitor.off("metricUpdate", handleMetricUpdate);
      realtimeMonitor.off("alert", handleAlert);
      realtimeMonitor.stop();
    };
  }, []);

  const clearAlerts = React.useCallback(() => {
    setAlerts([]);
  }, []);

  const addAlert = React.useCallback((alert: AlertConfig) => {
    realtimeMonitor.addAlert(alert);
  }, []);

  const removeAlert = React.useCallback((metric: keyof PerformanceMetrics) => {
    realtimeMonitor.removeAlert(metric);
  }, []);

  return {
    metrics,
    systemHealth,
    alerts,
    clearAlerts,
    addAlert,
    removeAlert,
  };
}

/**
 * Performance metrics utility functions
 */
export const MetricsUtils = {
  /**
   * Format metric value for display
   */
  formatMetric(metric: keyof PerformanceMetrics, value: number): string {
    switch (metric) {
      case "lcp":
      case "fid":
      case "fcp":
      case "ttfb":
      case "renderTime":
      case "apiResponseTime":
        return `${Math.round(value)}ms`;
      
      case "cls":
        return value.toFixed(3);
      
      case "bundleSize":
        return `${(value / 1024).toFixed(1)}KB`;
      
      case "memoryUsage":
        return `${(value * 100).toFixed(1)}%`;
      
      case "errorRate":
      case "bounceRate":
        return `${(value * 100).toFixed(2)}%`;
      
      case "uptime":
      case "sessionDuration":
        return `${Math.round(value / 1000)}s`;
      
      case "availability":
        return `${(value * 100).toFixed(2)}%`;
      
      case "throughput":
        return `${value.toFixed(1)} Mbps`;
      
      case "userSatisfaction":
        return `${(value * 100).toFixed(1)}%`;
      
      default:
        return value.toString();
    }
  },

  /**
   * Get metric status based on thresholds
   */
  getMetricStatus(metric: keyof PerformanceMetrics, value: number): "good" | "needs-improvement" | "poor" {
    const thresholds = {
      lcp: { good: 2500, poor: 4000 },
      fid: { good: 100, poor: 300 },
      cls: { good: 0.1, poor: 0.25 },
      fcp: { good: 1800, poor: 3000 },
      ttfb: { good: 600, poor: 1500 },
    };

    const threshold = thresholds[metric as keyof typeof thresholds];
    if (!threshold) return "good";

    if (value <= threshold.good) return "good";
    if (value <= threshold.poor) return "needs-improvement";
    return "poor";
  },

  /**
   * Get Core Web Vitals score
   */
  getCoreWebVitalsScore(metrics: Partial<PerformanceMetrics>): number {
    const { lcp, fid, cls } = metrics;
    if (!lcp || !fid || cls === undefined) return 0;

    const lcpScore = lcp <= 2500 ? 100 : lcp <= 4000 ? 50 : 0;
    const fidScore = fid <= 100 ? 100 : fid <= 300 ? 50 : 0;
    const clsScore = cls <= 0.1 ? 100 : cls <= 0.25 ? 50 : 0;

    return Math.round((lcpScore + fidScore + clsScore) / 3);
  },
};