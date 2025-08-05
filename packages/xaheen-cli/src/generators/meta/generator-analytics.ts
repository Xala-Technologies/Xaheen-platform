/**
 * Generator Analytics - Comprehensive analytics and performance tracking system
 * Tracks usage patterns, performance metrics, errors, and user feedback
 */
import { EventEmitter } from 'events';
import { promises as fs } from 'fs';
import path from 'path';
import { 
  GeneratorAnalytics, 
  UsageStats, 
  PerformanceStats,
  ErrorStats,
  FeedbackStats,
  TimeSeriesPoint,
  OptionUsage,
  ErrorFrequency,
  ErrorTrend,
  FeedbackTheme,
  SentimentAnalysis,
  Platform,
  Framework
} from './types';

export interface AnalyticsEvent {
  readonly type: 'generation' | 'error' | 'performance' | 'feedback' | 'usage';
  readonly generatorId: string;
  readonly timestamp: Date;
  readonly data: Record<string, any>;
  readonly userId?: string;
  readonly sessionId?: string;
  readonly platform?: Platform;
  readonly framework?: Framework;
}

export interface GenerationEvent extends AnalyticsEvent {
  readonly type: 'generation';
  readonly data: {
    readonly targetGeneratorId?: string;
    readonly executionTime: number;
    readonly filesGenerated: number;
    readonly success: boolean;
    readonly error?: string;
    readonly options: Record<string, any>;
  };
}

export interface PerformanceEvent extends AnalyticsEvent {
  readonly type: 'performance';
  readonly data: {
    readonly executionTime: number;
    readonly memoryUsage: number;
    readonly cpuUsage: number;
    readonly diskUsage: number;
    readonly cacheHitRate: number;
  };
}

export interface ErrorEvent extends AnalyticsEvent {
  readonly type: 'error';
  readonly data: {
    readonly error: string;
    readonly stack?: string;
    readonly context: Record<string, any>;
    readonly recoverable: boolean;
  };
}

export interface FeedbackEvent extends AnalyticsEvent {
  readonly type: 'feedback';
  readonly data: {
    readonly rating: number; // 1-5
    readonly comment?: string;
    readonly category: 'bug' | 'feature' | 'improvement' | 'praise';
    readonly impact: 'low' | 'medium' | 'high';
  };
}

export interface UsageEvent extends AnalyticsEvent {
  readonly type: 'usage';
  readonly data: {
    readonly action: string;
    readonly options: Record<string, any>;
    readonly duration: number;
    readonly success: boolean;
  };
}

export interface AnalyticsConfiguration {
  readonly enabled: boolean;
  readonly storageBackend: 'file' | 'database' | 'cloud';
  readonly retentionDays: number;
  readonly anonymizeData: boolean;
  readonly realTimeEnabled: boolean;
  readonly aggregationInterval: number; // minutes
  readonly alertThresholds: AlertThresholds;
}

export interface AlertThresholds {
  readonly errorRate: number; // percentage
  readonly performanceDegradation: number; // percentage
  readonly lowRating: number; // rating threshold
  readonly highUsage: number; // requests per minute
}

export class GeneratorAnalytics extends EventEmitter {
  private config: AnalyticsConfiguration;
  private events: AnalyticsEvent[] = [];
  private analytics = new Map<string, GeneratorAnalytics>();
  private aggregationTimer: NodeJS.Timeout | null = null;
  private readonly storageDir: string;

  constructor(config?: Partial<AnalyticsConfiguration>) {
    super();
    
    this.config = {
      enabled: true,
      storageBackend: 'file',
      retentionDays: 90,
      anonymizeData: true,
      realTimeEnabled: true,
      aggregationInterval: 5,
      alertThresholds: {
        errorRate: 5, // 5% error rate triggers alert
        performanceDegradation: 50, // 50% slower than baseline
        lowRating: 3, // ratings below 3
        highUsage: 100 // 100 requests per minute
      },
      ...config
    };

    this.storageDir = path.join(process.cwd(), '.xaheen', 'analytics');
    this.setupAnalytics();
  }

  /**
   * Setup analytics system
   */
  private async setupAnalytics(): Promise<void> {
    if (!this.config.enabled) return;

    await fs.mkdir(this.storageDir, { recursive: true });
    
    // Load existing analytics data
    await this.loadAnalyticsData();
    
    // Start aggregation timer
    if (this.config.realTimeEnabled) {
      this.startAggregation();
    }

    // Setup cleanup timer
    this.setupDataRetention();

    console.log('📊 Generator Analytics system initialized');
  }

  /**
   * Record a generation event
   */
  async recordGeneration(data: GenerationEvent['data']): Promise<void> {
    if (!this.config.enabled) return;

    const event: GenerationEvent = {
      type: 'generation',
      generatorId: data.targetGeneratorId || 'unknown',
      timestamp: new Date(),
      data,
      sessionId: this.generateSessionId()
    };

    await this.recordEvent(event);
  }

  /**
   * Record a performance event
   */
  async recordPerformance(generatorId: string, data: PerformanceEvent['data']): Promise<void> {
    if (!this.config.enabled) return;

    const event: PerformanceEvent = {
      type: 'performance',
      generatorId,
      timestamp: new Date(),
      data,
      sessionId: this.generateSessionId()
    };

    await this.recordEvent(event);
  }

  /**
   * Record an error event
   */
  async recordError(generatorId: string, data: ErrorEvent['data']): Promise<void> {
    if (!this.config.enabled) return;

    const event: ErrorEvent = {
      type: 'error',
      generatorId,
      timestamp: new Date(),
      data,
      sessionId: this.generateSessionId()
    };

    await this.recordEvent(event);

    // Check if alert should be triggered
    await this.checkErrorRateAlert(generatorId);
  }

  /**
   * Record user feedback
   */
  async recordFeedback(generatorId: string, data: FeedbackEvent['data']): Promise<void> {
    if (!this.config.enabled) return;

    const event: FeedbackEvent = {
      type: 'feedback',
      generatorId,
      timestamp: new Date(),
      data,
      sessionId: this.generateSessionId()
    };

    await this.recordEvent(event);

    // Check for low rating alert
    if (data.rating <= this.config.alertThresholds.lowRating) {
      this.emit('alert:low-rating', { generatorId, rating: data.rating, comment: data.comment });
    }
  }

  /**
   * Record usage event
   */
  async recordUsage(generatorId: string, data: UsageEvent['data']): Promise<void> {
    if (!this.config.enabled) return;

    const event: UsageEvent = {
      type: 'usage',
      generatorId,
      timestamp: new Date(),
      data,
      sessionId: this.generateSessionId()
    };

    await this.recordEvent(event);
  }

  /**
   * Get analytics for a specific generator
   */
  async getGeneratorAnalytics(generatorId: string): Promise<GeneratorAnalytics | null> {
    const cached = this.analytics.get(generatorId);
    if (cached) return cached;

    return this.calculateGeneratorAnalytics(generatorId);
  }

  /**
   * Get usage statistics
   */
  async getUsageStats(generatorId: string, timeRange?: { start: Date; end: Date }): Promise<UsageStats> {
    const events = this.getEventsForGenerator(generatorId, timeRange);
    const generationEvents = events.filter(e => e.type === 'generation') as GenerationEvent[];
    const usageEvents = events.filter(e => e.type === 'usage') as UsageEvent[];

    // Calculate total executions
    const totalExecutions = generationEvents.length;

    // Calculate unique users
    const uniqueUsers = new Set(events.map(e => e.userId).filter(Boolean)).size;

    // Analyze popular options
    const optionUsage = new Map<string, Map<string, number>>();
    
    for (const event of [...generationEvents, ...usageEvents]) {
      const options = event.data.options || {};
      
      for (const [key, value] of Object.entries(options)) {
        if (!optionUsage.has(key)) {
          optionUsage.set(key, new Map());
        }
        
        const valueStr = String(value);
        const valueMap = optionUsage.get(key)!;
        valueMap.set(valueStr, (valueMap.get(valueStr) || 0) + 1);
      }
    }

    const popularOptions: OptionUsage[] = Array.from(optionUsage.entries()).map(([option, values]) => ({
      option,
      frequency: Array.from(values.values()).reduce((sum, count) => sum + count, 0),
      values: Object.fromEntries(values.entries())
    }));

    // Platform breakdown
    const platformCounts = new Map<Platform, number>();
    events.forEach(e => {
      if (e.platform) {
        platformCounts.set(e.platform, (platformCounts.get(e.platform) || 0) + 1);
      }
    });
    const platformBreakdown = Object.fromEntries(platformCounts.entries()) as Record<Platform, number>;

    // Framework breakdown
    const frameworkCounts = new Map<Framework, number>();
    events.forEach(e => {
      if (e.framework) {
        frameworkCounts.set(e.framework, (frameworkCounts.get(e.framework) || 0) + 1);
      }
    });
    const frameworkBreakdown = Object.fromEntries(frameworkCounts.entries()) as Record<Framework, number>;

    // Time series data
    const timeSeriesData = this.generateTimeSeriesData(events, timeRange);

    return {
      totalExecutions,
      uniqueUsers,
      popularOptions,
      platformBreakdown,
      frameworkBreakdown,
      timeSeriesData
    };
  }

  /**
   * Get performance statistics
   */
  async getPerformanceStats(generatorId: string, timeRange?: { start: Date; end: Date }): Promise<PerformanceStats> {
    const events = this.getEventsForGenerator(generatorId, timeRange);
    const performanceEvents = events.filter(e => e.type === 'performance') as PerformanceEvent[];
    const generationEvents = events.filter(e => e.type === 'generation') as GenerationEvent[];

    // Execution time statistics
    const executionTimes = [
      ...performanceEvents.map(e => e.data.executionTime),
      ...generationEvents.map(e => e.data.executionTime)
    ].filter(Boolean);

    const averageExecutionTime = executionTimes.length > 0 
      ? executionTimes.reduce((sum, time) => sum + time, 0) / executionTimes.length 
      : 0;

    const sortedTimes = [...executionTimes].sort((a, b) => a - b);
    const p95ExecutionTime = sortedTimes[Math.floor(sortedTimes.length * 0.95)] || 0;
    const p99ExecutionTime = sortedTimes[Math.floor(sortedTimes.length * 0.99)] || 0;

    // Memory usage statistics
    const memoryUsages = performanceEvents.map(e => e.data.memoryUsage).filter(Boolean);
    const memoryUsageStats = {
      average: memoryUsages.length > 0 ? memoryUsages.reduce((sum, mem) => sum + mem, 0) / memoryUsages.length : 0,
      peak: Math.max(...memoryUsages, 0),
      min: Math.min(...memoryUsages, 0),
      max: Math.max(...memoryUsages, 0)
    };

    // Throughput (requests per minute)
    const timeSpanMinutes = timeRange 
      ? (timeRange.end.getTime() - timeRange.start.getTime()) / (1000 * 60)
      : 60;
    const throughput = executionTimes.length / Math.max(timeSpanMinutes, 1);

    return {
      averageExecutionTime,
      p95ExecutionTime,
      p99ExecutionTime,
      memoryUsage: memoryUsageStats,
      throughput
    };
  }

  /**
   * Get error statistics
   */
  async getErrorStats(generatorId: string, timeRange?: { start: Date; end: Date }): Promise<ErrorStats> {
    const events = this.getEventsForGenerator(generatorId, timeRange);
    const errorEvents = events.filter(e => e.type === 'error') as ErrorEvent[];
    const generationEvents = events.filter(e => e.type === 'generation') as GenerationEvent[];

    const totalErrors = errorEvents.length + generationEvents.filter(e => !e.data.success).length;
    const totalRequests = generationEvents.length;
    const errorRate = totalRequests > 0 ? (totalErrors / totalRequests) * 100 : 0;

    // Common errors
    const errorCounts = new Map<string, number>();
    const errorLastSeen = new Map<string, Date>();

    errorEvents.forEach(e => {
      const error = e.data.error;
      errorCounts.set(error, (errorCounts.get(error) || 0) + 1);
      
      const currentDate = errorLastSeen.get(error);
      if (!currentDate || e.timestamp > currentDate) {
        errorLastSeen.set(error, e.timestamp);
      }
    });

    const commonErrors: ErrorFrequency[] = Array.from(errorCounts.entries())
      .map(([error, count]) => ({
        error,
        count,
        percentage: (count / totalErrors) * 100,
        lastOccurrence: errorLastSeen.get(error)!
      }))
      .sort((a, b) => b.count - a.count);

    // Error trends (daily aggregation)
    const errorTrends = this.generateErrorTrends(errorEvents, timeRange);

    return {
      totalErrors,
      errorRate,
      commonErrors,
      errorTrends
    };
  }

  /**
   * Get feedback statistics
   */
  async getFeedbackStats(generatorId: string, timeRange?: { start: Date; end: Date }): Promise<FeedbackStats> {
    const events = this.getEventsForGenerator(generatorId, timeRange);
    const feedbackEvents = events.filter(e => e.type === 'feedback') as FeedbackEvent[];

    if (feedbackEvents.length === 0) {
      return {
        averageRating: 0,
        totalReviews: 0,
        ratingDistribution: {},
        commonFeedback: [],
        sentimentAnalysis: { positive: 0, negative: 0, neutral: 0, confidence: 0 }
      };
    }

    // Average rating
    const ratings = feedbackEvents.map(e => e.data.rating);
    const averageRating = ratings.reduce((sum, rating) => sum + rating, 0) / ratings.length;

    // Rating distribution
    const ratingDistribution: Record<number, number> = {};
    ratings.forEach(rating => {
      ratingDistribution[rating] = (ratingDistribution[rating] || 0) + 1;
    });

    // Analyze feedback themes
    const feedbackThemes = this.analyzeFeedbackThemes(feedbackEvents);

    // Sentiment analysis
    const sentimentAnalysis = this.analyzeSentiment(feedbackEvents);

    return {
      averageRating,
      totalReviews: feedbackEvents.length,
      ratingDistribution,
      commonFeedback: feedbackThemes,
      sentimentAnalysis
    };
  }

  /**
   * Generate comprehensive analytics report
   */
  async generateReport(generatorId: string, timeRange?: { start: Date; end: Date }): Promise<{
    generatorId: string;
    timeRange: { start: Date; end: Date };
    usage: UsageStats;
    performance: PerformanceStats;
    errors: ErrorStats;
    feedback: FeedbackStats;
    insights: string[];
    recommendations: string[];
  }> {
    const effectiveTimeRange = timeRange || {
      start: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000), // 30 days ago
      end: new Date()
    };

    const [usage, performance, errors, feedback] = await Promise.all([
      this.getUsageStats(generatorId, effectiveTimeRange),
      this.getPerformanceStats(generatorId, effectiveTimeRange),
      this.getErrorStats(generatorId, effectiveTimeRange),
      this.getFeedbackStats(generatorId, effectiveTimeRange)
    ]);

    // Generate insights
    const insights = this.generateInsights(usage, performance, errors, feedback);
    
    // Generate recommendations
    const recommendations = this.generateRecommendations(usage, performance, errors, feedback);

    return {
      generatorId,
      timeRange: effectiveTimeRange,
      usage,
      performance,
      errors,
      feedback,
      insights,
      recommendations
    };
  }

  /**
   * Record an event
   */
  private async recordEvent(event: AnalyticsEvent): Promise<void> {
    // Anonymize data if configured
    if (this.config.anonymizeData) {
      event = this.anonymizeEvent(event);
    }

    this.events.push(event);

    // Persist event
    await this.persistEvent(event);

    // Emit for real-time processing
    if (this.config.realTimeEnabled) {
      this.emit('event', event);
    }
  }

  /**
   * Calculate generator analytics
   */
  private async calculateGeneratorAnalytics(generatorId: string): Promise<GeneratorAnalytics> {
    const [usage, performance, errors, feedback] = await Promise.all([
      this.getUsageStats(generatorId),
      this.getPerformanceStats(generatorId),
      this.getErrorStats(generatorId),
      this.getFeedbackStats(generatorId)
    ]);

    const analytics: GeneratorAnalytics = {
      generatorId,
      usage,
      performance,
      errors,
      feedback
    };

    this.analytics.set(generatorId, analytics);
    return analytics;
  }

  /**
   * Get events for a specific generator within time range
   */
  private getEventsForGenerator(
    generatorId: string, 
    timeRange?: { start: Date; end: Date }
  ): AnalyticsEvent[] {
    let events = this.events.filter(e => e.generatorId === generatorId);

    if (timeRange) {
      events = events.filter(e => 
        e.timestamp >= timeRange.start && e.timestamp <= timeRange.end
      );
    }

    return events;
  }

  /**
   * Generate time series data
   */
  private generateTimeSeriesData(
    events: AnalyticsEvent[], 
    timeRange?: { start: Date; end: Date }
  ): TimeSeriesPoint[] {
    const points = new Map<string, { executions: number; errors: number; users: Set<string> }>();

    events.forEach(event => {
      const dateKey = event.timestamp.toISOString().split('T')[0]; // YYYY-MM-DD
      
      if (!points.has(dateKey)) {
        points.set(dateKey, { executions: 0, errors: 0, users: new Set() });
      }

      const point = points.get(dateKey)!;
      
      if (event.type === 'generation' || event.type === 'usage') {
        point.executions++;
      }
      
      if (event.type === 'error' || (event.type === 'generation' && !(event as GenerationEvent).data.success)) {
        point.errors++;
      }
      
      if (event.userId) {
        point.users.add(event.userId);
      }
    });

    return Array.from(points.entries())
      .map(([date, data]) => ({
        timestamp: new Date(date),
        executions: data.executions,
        errors: data.errors,
        users: data.users.size
      }))
      .sort((a, b) => a.timestamp.getTime() - b.timestamp.getTime());
  }

  /**
   * Generate error trends
   */
  private generateErrorTrends(
    errorEvents: ErrorEvent[], 
    timeRange?: { start: Date; end: Date }
  ): ErrorTrend[] {
    const trends = new Map<string, { errors: number; total: number }>();

    errorEvents.forEach(event => {
      const dateKey = event.timestamp.toISOString().split('T')[0];
      
      if (!trends.has(dateKey)) {
        trends.set(dateKey, { errors: 0, total: 0 });
      }

      const trend = trends.get(dateKey)!;
      trend.errors++;
      trend.total++;
    });

    return Array.from(trends.entries())
      .map(([date, data]) => ({
        date: new Date(date),
        errors: data.errors,
        rate: data.total > 0 ? (data.errors / data.total) * 100 : 0
      }))
      .sort((a, b) => a.date.getTime() - b.date.getTime());
  }

  /**
   * Analyze feedback themes
   */
  private analyzeFeedbackThemes(feedbackEvents: FeedbackEvent[]): FeedbackTheme[] {
    const themes = new Map<string, { count: number; sentiment: 'positive' | 'negative' | 'neutral'; examples: string[] }>();

    feedbackEvents.forEach(event => {
      if (event.data.comment) {
        // Simple theme extraction (would use NLP in production)
        const theme = event.data.category;
        
        if (!themes.has(theme)) {
          themes.set(theme, { count: 0, sentiment: 'neutral', examples: [] });
        }

        const themeData = themes.get(theme)!;
        themeData.count++;
        themeData.examples.push(event.data.comment);

        // Simple sentiment analysis based on rating
        if (event.data.rating >= 4) {
          themeData.sentiment = 'positive';
        } else if (event.data.rating <= 2) {
          themeData.sentiment = 'negative';
        }
      }
    });

    return Array.from(themes.entries())
      .map(([theme, data]) => ({
        theme,
        count: data.count,
        sentiment: data.sentiment,
        examples: data.examples.slice(0, 3) // Top 3 examples
      }))
      .sort((a, b) => b.count - a.count);
  }

  /**
   * Analyze sentiment
   */
  private analyzeSentiment(feedbackEvents: FeedbackEvent[]): SentimentAnalysis {
    let positive = 0;
    let negative = 0;
    let neutral = 0;

    feedbackEvents.forEach(event => {
      if (event.data.rating >= 4) {
        positive++;
      } else if (event.data.rating <= 2) {
        negative++;
      } else {
        neutral++;
      }
    });

    const total = feedbackEvents.length;
    const confidence = total > 10 ? 0.8 : total > 5 ? 0.6 : 0.4;

    return {
      positive: total > 0 ? (positive / total) * 100 : 0,
      negative: total > 0 ? (negative / total) * 100 : 0,
      neutral: total > 0 ? (neutral / total) * 100 : 0,
      confidence
    };
  }

  /**
   * Generate insights from analytics data
   */
  private generateInsights(
    usage: UsageStats,
    performance: PerformanceStats,
    errors: ErrorStats,
    feedback: FeedbackStats
  ): string[] {
    const insights: string[] = [];

    // Usage insights
    if (usage.totalExecutions > 100) {
      insights.push(`High usage detected: ${usage.totalExecutions} executions with ${usage.uniqueUsers} unique users`);
    }

    if (usage.popularOptions.length > 0) {
      const topOption = usage.popularOptions[0];
      insights.push(`Most popular option: ${topOption.option} (used ${topOption.frequency} times)`);
    }

    // Performance insights
    if (performance.averageExecutionTime > 5000) {
      insights.push(`Slow performance detected: average execution time is ${Math.round(performance.averageExecutionTime)}ms`);
    }

    if (performance.p95ExecutionTime > performance.averageExecutionTime * 2) {
      insights.push(`Performance inconsistency: 95th percentile is significantly slower than average`);
    }

    // Error insights
    if (errors.errorRate > 5) {
      insights.push(`High error rate detected: ${errors.errorRate.toFixed(1)}% of executions fail`);
    }

    if (errors.commonErrors.length > 0) {
      const topError = errors.commonErrors[0];
      insights.push(`Most common error: ${topError.error} (${topError.percentage.toFixed(1)}% of errors)`);
    }

    // Feedback insights
    if (feedback.averageRating < 3) {
      insights.push(`Low user satisfaction: average rating is ${feedback.averageRating.toFixed(1)}/5`);
    }

    if (feedback.sentimentAnalysis.negative > 30) {
      insights.push(`Negative sentiment detected in ${feedback.sentimentAnalysis.negative.toFixed(1)}% of feedback`);
    }

    return insights;
  }

  /**
   * Generate recommendations
   */
  private generateRecommendations(
    usage: UsageStats,
    performance: PerformanceStats,
    errors: ErrorStats,
    feedback: FeedbackStats
  ): string[] {
    const recommendations: string[] = [];

    // Performance recommendations
    if (performance.averageExecutionTime > 5000) {
      recommendations.push('Consider optimizing template rendering or reducing file I/O operations');
    }

    if (performance.memoryUsage.peak > 100) {
      recommendations.push('Monitor memory usage - peak usage is high, consider implementing memory optimization');
    }

    // Error recommendations
    if (errors.errorRate > 5) {
      recommendations.push('Investigate and fix common errors to improve reliability');
    }

    if (errors.commonErrors.length > 3) {
      recommendations.push('Add better error handling and validation for common failure scenarios');
    }

    // Usage recommendations
    if (usage.uniqueUsers < usage.totalExecutions * 0.1) {
      recommendations.push('Low user diversity - consider improving discoverability or documentation');
    }

    // Feedback recommendations
    if (feedback.averageRating < 4 && feedback.totalReviews > 10) {
      recommendations.push('Address user feedback themes to improve satisfaction');
    }

    if (feedback.commonFeedback.some(f => f.theme === 'bug')) {
      recommendations.push('Prioritize bug fixes based on user feedback');
    }

    return recommendations;
  }

  /**
   * Anonymize event data
   */
  private anonymizeEvent(event: AnalyticsEvent): AnalyticsEvent {
    return {
      ...event,
      userId: event.userId ? this.hashUserId(event.userId) : undefined,
      data: this.anonymizeEventData(event.data)
    };
  }

  /**
   * Anonymize event data
   */
  private anonymizeEventData(data: Record<string, any>): Record<string, any> {
    const anonymized = { ...data };
    
    // Remove or hash sensitive fields
    const sensitiveFields = ['email', 'name', 'path', 'filename'];
    
    for (const field of sensitiveFields) {
      if (anonymized[field]) {
        anonymized[field] = this.hashValue(String(anonymized[field]));
      }
    }

    return anonymized;
  }

  /**
   * Hash user ID
   */
  private hashUserId(userId: string): string {
    // Simple hash function - would use proper crypto in production
    let hash = 0;
    for (let i = 0; i < userId.length; i++) {
      const char = userId.charCodeAt(i);
      hash = ((hash << 5) - hash) + char;
      hash = hash & hash; // Convert to 32-bit integer
    }
    return `user_${Math.abs(hash)}`;
  }

  /**
   * Hash sensitive value
   */
  private hashValue(value: string): string {
    return `hash_${value.length}_${value.charAt(0)}***`;
  }

  /**
   * Generate session ID
   */
  private generateSessionId(): string {
    return `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  /**
   * Start aggregation timer
   */
  private startAggregation(): void {
    this.aggregationTimer = setInterval(async () => {
      await this.aggregateAnalytics();
    }, this.config.aggregationInterval * 60 * 1000);
  }

  /**
   * Aggregate analytics data
   */
  private async aggregateAnalytics(): Promise<void> {
    // Clear cached analytics to force recalculation
    this.analytics.clear();
    
    console.log('📊 Aggregating analytics data...');
  }

  /**
   * Setup data retention
   */
  private setupDataRetention(): void {
    setInterval(async () => {
      await this.cleanupOldData();
    }, 24 * 60 * 60 * 1000); // Daily cleanup
  }

  /**
   * Cleanup old data
   */
  private async cleanupOldData(): Promise<void> {
    const cutoffDate = new Date(Date.now() - this.config.retentionDays * 24 * 60 * 60 * 1000);
    
    this.events = this.events.filter(event => event.timestamp > cutoffDate);
    
    console.log(`🧹 Cleaned up analytics data older than ${this.config.retentionDays} days`);
  }

  /**
   * Load analytics data from storage
   */
  private async loadAnalyticsData(): Promise<void> {
    try {
      const dataFile = path.join(this.storageDir, 'events.json');
      const data = JSON.parse(await fs.readFile(dataFile, 'utf-8'));
      
      this.events = data.events.map((e: any) => ({
        ...e,
        timestamp: new Date(e.timestamp)
      }));
      
      console.log(`📊 Loaded ${this.events.length} analytics events`);
    } catch {
      console.log('📊 No existing analytics data found, starting fresh');
    }
  }

  /**
   * Persist event to storage
   */
  private async persistEvent(event: AnalyticsEvent): Promise<void> {
    // In production, this would batch writes for efficiency
    if (this.config.storageBackend === 'file') {
      const dataFile = path.join(this.storageDir, 'events.json');
      const data = { events: this.events };
      await fs.writeFile(dataFile, JSON.stringify(data, null, 2));
    }
  }

  /**
   * Check error rate alert
   */
  private async checkErrorRateAlert(generatorId: string): Promise<void> {
    const recentEvents = this.getEventsForGenerator(generatorId, {
      start: new Date(Date.now() - 60 * 60 * 1000), // Last hour
      end: new Date()
    });

    const errors = recentEvents.filter(e => 
      e.type === 'error' || 
      (e.type === 'generation' && !(e as GenerationEvent).data.success)
    ).length;

    const total = recentEvents.filter(e => 
      e.type === 'generation' || e.type === 'usage'
    ).length;

    if (total > 0) {
      const errorRate = (errors / total) * 100;
      
      if (errorRate > this.config.alertThresholds.errorRate) {
        this.emit('alert:error-rate', { generatorId, errorRate, threshold: this.config.alertThresholds.errorRate });
      }
    }
  }

  /**
   * Dispose analytics system
   */
  async dispose(): Promise<void> {
    if (this.aggregationTimer) {
      clearInterval(this.aggregationTimer);
    }

    // Final data persistence
    if (this.events.length > 0) {
      await this.persistEvent(this.events[0]); // Trigger final save
    }

    console.log('📊 Generator Analytics system disposed');
  }
}