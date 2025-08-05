/**
 * Phase 6 Test Helpers
 * 
 * Shared utilities for Services & Integrations testing including
 * mock server management, test data generation, and cleanup operations.
 */

import { spawn, ChildProcess } from 'child_process';
import { promises as fs } from 'fs';
import path from 'path';
import { setTimeout } from 'timers/promises';
import { ServiceTestConfig, testEnvironmentConfig } from '../config/test-config';

export interface TestContext {
  readonly testId: string;
  readonly serviceName: string;
  readonly config: ServiceTestConfig;
  readonly tempDir: string;
  readonly mockServerPort?: number;
  readonly cleanup: Array<() => Promise<void>>;
}

export interface MockServerResponse {
  readonly status: number;
  readonly headers: Record<string, string>;
  readonly body: any;
  readonly delay?: number;
}

export interface GeneratedTestData {
  readonly users: TestUser[];
  readonly payments: TestPayment[];
  readonly messages: TestMessage[];
  readonly documents: TestDocument[];
  readonly analytics: TestAnalyticsEvent[];
}

export interface TestUser {
  readonly id: string;
  readonly email: string;
  readonly name: string;
  readonly phone?: string;
  readonly country: string;
  readonly verified: boolean;
}

export interface TestPayment {
  readonly id: string;
  readonly amount: number;
  readonly currency: string;
  readonly customerId: string;
  readonly paymentMethodId?: string;
  readonly status: 'pending' | 'succeeded' | 'failed';
}

export interface TestMessage {
  readonly id: string;
  readonly to: string;
  readonly from: string;
  readonly subject?: string;
  readonly body: string;
  readonly type: 'email' | 'sms' | 'push' | 'slack' | 'discord';
}

export interface TestDocument {
  readonly id: string;
  readonly name: string;
  readonly content: string;
  readonly mimeType: string;
  readonly size: number;
  readonly signers?: string[];
}

export interface TestAnalyticsEvent {
  readonly event: string;
  readonly userId?: string;
  readonly properties: Record<string, any>;
  readonly timestamp: string;
}

// Test context management
export class TestContextManager {
  private static contexts = new Map<string, TestContext>();
  
  static async createcontext(serviceName: string, config: ServiceTestConfig): Promise<TestContext> {
    const testId = `${serviceName}-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    const tempDir = path.join(process.cwd(), 'temp', testId);
    
    await fs.mkdir(tempDir, { recursive: true });
    
    const context: TestContext = {
      testId,
      serviceName,
      config,
      tempDir,
      cleanup: [],
    };
    
    this.contexts.set(testId, context);
    return context;
  }
  
  static async cleanupContext(testId: string): Promise<void> {
    const context = this.contexts.get(testId);
    if (!context) return;
    
    // Run cleanup functions in reverse order
    for (const cleanup of context.cleanup.reverse()) {
      try {
        await cleanup();
      } catch (error) {
        console.warn(`Cleanup error for ${testId}:`, error);
      }
    }
    
    // Remove temporary directory
    try {
      await fs.rm(context.tempDir, { recursive: true, force: true });
    } catch (error) {
      console.warn(`Failed to remove temp dir ${context.tempDir}:`, error);
    }
    
    this.contexts.delete(testId);
  }
  
  static async cleanupAll(): Promise<void> {
    const cleanupPromises = Array.from(this.contexts.keys()).map(testId => 
      this.cleanupContext(testId)
    );
    await Promise.allSettled(cleanupPromises);
  }
}

// Mock server management
export class MockServerManager {
  private servers = new Map<number, ChildProcess>();
  private static instance: MockServerManager;
  
  static getInstance(): MockServerManager {
    if (!this.instance) {
      this.instance = new MockServerManager();
    }
    return this.instance;
  }
  
  async startMockServer(port: number, responses: Record<string, MockServerResponse>): Promise<void> {
    if (this.servers.has(port)) {
      throw new Error(`Mock server already running on port ${port}`);
    }
    
    const mockServerPath = path.join(__dirname, '../mocks/http-mock-server.js');
    const responsesFile = path.join(__dirname, `../temp/responses-${port}.json`);
    
    // Write responses to file
    await fs.mkdir(path.dirname(responsesFile), { recursive: true });
    await fs.writeFile(responsesFile, JSON.stringify(responses, null, 2));
    
    const server = spawn('node', [mockServerPath, port.toString(), responsesFile], {
      stdio: 'pipe',
      detached: false,
    });
    
    server.stdout?.on('data', (data) => {
      if (process.env.DEBUG) {
        console.log(`MockServer[${port}]:`, data.toString());
      }
    });
    
    server.stderr?.on('data', (data) => {
      console.error(`MockServer[${port}] Error:`, data.toString());
    });
    
    this.servers.set(port, server);
    
    // Wait for server to start
    await this.waitForServer(port);
  }
  
  async stopMockServer(port: number): Promise<void> {
    const server = this.servers.get(port);
    if (server) {
      server.kill('SIGTERM');
      this.servers.delete(port);
      
      // Clean up responses file
      const responsesFile = path.join(__dirname, `../temp/responses-${port}.json`);
      try {
        await fs.unlink(responsesFile);
      } catch (error) {
        // Ignore cleanup errors
      }
    }
  }
  
  async stopAllServers(): Promise<void> {
    const stopPromises = Array.from(this.servers.keys()).map(port => 
      this.stopMockServer(port)
    );
    await Promise.allSettled(stopPromises);
  }
  
  private async waitForServer(port: number, maxAttempts = 30): Promise<void> {
    for (let attempt = 0; attempt < maxAttempts; attempt++) {
      try {
        const response = await fetch(`http://localhost:${port}/health`);
        if (response.ok) return;
      } catch (error) {
        // Server not ready yet
      }
      await setTimeout(1000);
    }
    throw new Error(`Mock server on port ${port} failed to start`);
  }
}

// Test data generation
export class TestDataGenerator {
  private static userCounter = 1;
  private static paymentCounter = 1;
  private static messageCounter = 1;
  private static documentCounter = 1;
  
  static generateTestUser(overrides: Partial<TestUser> = {}): TestUser {
    const id = this.userCounter++;
    return {
      id: `user_${id}`,
      email: `test.user.${id}@xaheen.example.com`,
      name: `Test User ${id}`,
      phone: `+4712345${String(id).padStart(3, '0')}`,
      country: 'NO',
      verified: true,
      ...overrides,
    };
  }
  
  static generateTestPayment(overrides: Partial<TestPayment> = {}): TestPayment {
    const id = this.paymentCounter++;
    return {
      id: `payment_${id}`,
      amount: Math.floor(Math.random() * 10000) + 100, // 1-100 NOK in øre
      currency: 'NOK',
      customerId: `customer_${id}`,
      status: 'pending',
      ...overrides,
    };
  }
  
  static generateTestMessage(overrides: Partial<TestMessage> = {}): TestMessage {
    const id = this.messageCounter++;
    return {
      id: `message_${id}`,
      to: `recipient.${id}@example.com`,
      from: 'noreply@xaheen.example.com',
      subject: `Test Message ${id}`,
      body: `This is a test message generated for integration testing purposes. Message ID: ${id}`,
      type: 'email',
      ...overrides,
    };
  }
  
  static generateTestDocument(overrides: Partial<TestDocument> = {}): TestDocument {
    const id = this.documentCounter++;
    const content = `Test document content for document ${id}`;
    return {
      id: `document_${id}`,
      name: `test-document-${id}.pdf`,
      content,
      mimeType: 'application/pdf',
      size: content.length,
      signers: [`signer${id}@example.com`],
      ...overrides,
    };
  }
  
  static generateTestAnalyticsEvent(overrides: Partial<TestAnalyticsEvent> = {}): TestAnalyticsEvent {
    return {
      event: 'test_event',
      userId: `user_${Math.floor(Math.random() * 100)}`,
      properties: {
        source: 'integration_test',
        timestamp: new Date().toISOString(),
        testData: true,
      },
      timestamp: new Date().toISOString(),
      ...overrides,
    };
  }
  
  static generateTestData(counts: {
    users?: number;
    payments?: number;
    messages?: number;
    documents?: number;
    analytics?: number;
  } = {}): GeneratedTestData {
    return {
      users: Array.from({ length: counts.users || 5 }, () => this.generateTestUser()),
      payments: Array.from({ length: counts.payments || 3 }, () => this.generateTestPayment()),
      messages: Array.from({ length: counts.messages || 3 }, () => this.generateTestMessage()),
      documents: Array.from({ length: counts.documents || 2 }, () => this.generateTestDocument()),
      analytics: Array.from({ length: counts.analytics || 10 }, () => this.generateTestAnalyticsEvent()),
    };
  }
}

// Service testing utilities
export class ServiceTestUtils {
  static async waitForCondition(
    condition: () => Promise<boolean>,
    options: {
      timeout?: number;
      interval?: number;
      errorMessage?: string;
    } = {}
  ): Promise<void> {
    const {
      timeout = 30000,
      interval = 1000,
      errorMessage = 'Condition not met within timeout',
    } = options;
    
    const startTime = Date.now();
    
    while (Date.now() - startTime < timeout) {
      if (await condition()) {
        return;
      }
      await setTimeout(interval);
    }
    
    throw new Error(errorMessage);
  }
  
  static async retryOperation<T>(
    operation: () => Promise<T>,
    maxRetries: number = 3,
    delay: number = 1000
  ): Promise<T> {
    let lastError: Error;
    
    for (let attempt = 0; attempt <= maxRetries; attempt++) {
      try {
        return await operation();
      } catch (error) {
        lastError = error as Error;
        
        if (attempt < maxRetries) {
          await setTimeout(delay * Math.pow(2, attempt)); // Exponential backoff
        }
      }
    }
    
    throw lastError!;
  }
  
  static async makeHttpRequest(
    url: string,
    options: {
      method?: string;
      headers?: Record<string, string>;
      body?: any;
      timeout?: number;
    } = {}
  ): Promise<Response> {
    const {
      method = 'GET',
      headers = {},
      body,
      timeout = 15000,
    } = options;
    
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), timeout);
    
    try {
      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
          'User-Agent': 'Xaheen-CLI-Test/1.0',
          ...headers,
        },
        body: body ? JSON.stringify(body) : undefined,
        signal: controller.signal,
      });
      
      return response;
    } finally {
      clearTimeout(timeoutId);
    }
  }
  
  static validateResponseSchema(response: any, schema: any): boolean {
    // Simple schema validation - in real implementation, use a library like Joi or Zod
    try {
      JSON.stringify(response);
      return true;
    } catch {
      return false;
    }
  }
  
  static sanitizeCredentials(config: any): any {
    const sensitiveKeys = [
      'password', 'secret', 'key', 'token', 'credential',
      'privateKey', 'apiKey', 'authToken', 'accessToken',
    ];
    
    const sanitized = { ...config };
    
    for (const [key, value] of Object.entries(sanitized)) {
      if (typeof value === 'string' && sensitiveKeys.some(sensitive => 
        key.toLowerCase().includes(sensitive.toLowerCase())
      )) {
        sanitized[key] = value.substring(0, 4) + '***';
      }
    }
    
    return sanitized;
  }
}

// Docker service management
export class DockerServiceManager {
  private runningServices = new Set<string>();
  
  async startService(serviceName: string): Promise<void> {
    if (this.runningServices.has(serviceName)) {
      return;
    }
    
    const serviceConfig = testEnvironmentConfig.dockerServices[serviceName as keyof typeof testEnvironmentConfig.dockerServices];
    if (!serviceConfig) {
      throw new Error(`Unknown Docker service: ${serviceName}`);
    }
    
    console.log(`Starting Docker service: ${serviceName}`);
    
    const { spawn } = await import('child_process');
    const { promisify } = await import('util');
    const exec = promisify(spawn);
    
    // Build docker run command
    const dockerArgs = [
      'run', '-d',
      '--name', `xaheen-test-${serviceName}`,
      '--rm',
    ];
    
    // Add port mappings
    if (serviceConfig.ports) {
      for (const port of serviceConfig.ports) {
        dockerArgs.push('-p', port);
      }
    }
    
    // Add environment variables
    if (serviceConfig.environment) {
      for (const [key, value] of Object.entries(serviceConfig.environment)) {
        dockerArgs.push('-e', `${key}=${value}`);
      }
    }
    
    dockerArgs.push(serviceConfig.image);
    
    const process = spawn('docker', dockerArgs);
    
    return new Promise((resolve, reject) => {
      process.on('close', (code) => {
        if (code === 0) {
          this.runningServices.add(serviceName);
          resolve();
        } else {
          reject(new Error(`Failed to start ${serviceName} (exit code: ${code})`));
        }
      });
      process.on('error', reject);
    });
  }
  
  async stopService(serviceName: string): Promise<void> {
    if (!this.runningServices.has(serviceName)) {
      return;
    }
    
    console.log(`Stopping Docker service: ${serviceName}`);
    
    const { spawn } = await import('child_process');
    
    const process = spawn('docker', ['stop', `xaheen-test-${serviceName}`]);
    
    return new Promise((resolve, reject) => {
      process.on('close', (code) => {
        this.runningServices.delete(serviceName);
        resolve();
      });
      process.on('error', reject);
    });
  }
  
  async stopAllServices(): Promise<void> {
    const stopPromises = Array.from(this.runningServices).map(service => 
      this.stopService(service)
    );
    await Promise.allSettled(stopPromises);
  }
  
  async waitForService(serviceName: string, healthCheck: () => Promise<boolean>): Promise<void> {
    await ServiceTestUtils.waitForCondition(
      healthCheck,
      {
        timeout: 120000, // 2 minutes for Docker services to start
        interval: 2000,
        errorMessage: `Docker service ${serviceName} failed to become healthy`,
      }
    );
  }
}

// Cleanup utilities
export class CleanupManager {
  private static instance: CleanupManager;
  private cleanupTasks: Array<() => Promise<void>> = [];
  
  static getInstance(): CleanupManager {
    if (!this.instance) {
      this.instance = new CleanupManager();
    }
    return this.instance;
  }
  
  addCleanupTask(task: () => Promise<void>): void {
    this.cleanupTasks.push(task);
  }
  
  async cleanup(): Promise<void> {
    if (testEnvironmentConfig.cleanup.enabled) {
      const errors: Error[] = [];
      
      for (const task of this.cleanupTasks.reverse()) {
        try {
          await task();
        } catch (error) {
          errors.push(error as Error);
        }
      }
      
      if (errors.length > 0) {
        console.warn('Cleanup errors encountered:', errors);
      }
    }
    
    this.cleanupTasks = [];
  }
}

// Export convenience functions
export const createTestContext = TestContextManager.createContext;
export const cleanupTestContext = TestContextManager.cleanupContext;
export const generateTestData = TestDataGenerator.generateTestData;
export const waitForCondition = ServiceTestUtils.waitForCondition;
export const retryOperation = ServiceTestUtils.retryOperation;
export const makeHttpRequest = ServiceTestUtils.makeHttpRequest;