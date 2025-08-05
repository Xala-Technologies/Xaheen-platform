/**
 * @fileoverview Test Data Factories - EPIC 14 Story 14.5 & EPIC 13 Story 13.7
 * @description Comprehensive test data factories and fixtures for consistent test data generation
 * @version 1.0.0
 * @compliance Enterprise Security, Norwegian NSM Standards
 */

import { join } from 'path';
import fs from 'fs-extra';

/**
 * Base Factory class with common utilities
 */
abstract class BaseFactory<T> {
  protected static sequence = 0;

  /**
   * Generate unique sequence number
   */
  protected static getSequence(): number {
    return ++this.sequence;
  }

  /**
   * Generate random string
   */
  protected static randomString(length: number = 8): string {
    const chars = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
    return Array.from({ length }, () => chars.charAt(Math.floor(Math.random() * chars.length))).join('');
  }

  /**
   * Pick random item from array
   */
  protected static randomChoice<T>(items: T[]): T {
    return items[Math.floor(Math.random() * items.length)];
  }

  /**
   * Generate random boolean with probability
   */
  protected static randomBoolean(probability: number = 0.5): boolean {
    return Math.random() < probability;
  }

  /**
   * Create default instance
   */
  abstract create(overrides?: Partial<T>): T;

  /**
   * Create multiple instances
   */
  createMany(count: number, overrides?: Partial<T>): T[] {
    return Array.from({ length: count }, () => this.create(overrides));
  }

  /**
   * Create instance with specific traits
   */
  createWithTraits(traits: string[], overrides?: Partial<T>): T {
    let instance = this.create(overrides);
    
    traits.forEach(trait => {
      const traitMethod = `with${trait.charAt(0).toUpperCase()}${trait.slice(1)}`;
      if (typeof (this as any)[traitMethod] === 'function') {
        instance = (this as any)[traitMethod](instance);
      }
    });

    return instance;
  }
}

/**
 * MCP Configuration Factory
 */
export class MCPConfigFactory extends BaseFactory<any> {
  create(overrides: any = {}): any {
    const sequence = BaseFactory.getSequence();
    
    return {
      serverUrl: 'https://api.xala.ai/mcp',
      apiKey: `test_api_key_${BaseFactory.randomString(24)}`,
      clientId: `test_client_${sequence}`,
      version: '1.0.0',
      timeout: 30000,
      retryAttempts: 3,
      enableTelemetry: true,
      securityClassification: BaseFactory.randomChoice(['OPEN', 'RESTRICTED', 'CONFIDENTIAL']),
      ...overrides,
    };
  }

  /**
   * Create enterprise configuration
   */
  withEnterprise(config: any): any {
    return {
      ...config,
      securityClassification: 'CONFIDENTIAL',
      timeout: 45000,
      retryAttempts: 5,
      enableTelemetry: false,
      enterpriseFeatures: {
        audit: true,
        compliance: true,
        advancedSecurity: true,
      },
    };
  }

  /**
   * Create development configuration
   */
  withDevelopment(config: any): any {
    return {
      ...config,
      serverUrl: 'http://localhost:3001/mcp',
      securityClassification: 'OPEN',
      enableTelemetry: true,
      debug: true,
    };
  }

  /**
   * Create invalid configuration for error testing
   */
  withInvalidData(config: any): any {
    return {
      ...config,
      serverUrl: 'not-a-valid-url',
      apiKey: 'too-short',
      clientId: '',
      timeout: -1,
    };
  }
}

/**
 * Project Context Factory
 */
export class ProjectContextFactory extends BaseFactory<any> {
  private static frameworks = ['react', 'vue', 'angular', 'svelte', 'next'];
  private static languages = ['typescript', 'javascript'];
  private static packageManagers = ['npm', 'yarn', 'pnpm'];

  create(overrides: any = {}): any {
    const sequence = BaseFactory.getSequence();
    const framework = BaseFactory.randomChoice(ProjectContextFactory.frameworks);
    
    return {
      projectRoot: `/test/project-${sequence}`,
      framework,
      language: BaseFactory.randomChoice(ProjectContextFactory.languages),
      packageManager: BaseFactory.randomChoice(ProjectContextFactory.packageManagers),
      dependencies: this.generateDependencies(framework),
      scripts: this.generateScripts(framework),
      gitBranch: BaseFactory.randomChoice(['main', 'develop', 'feature/test']),
      lastIndexed: new Date(),
      totalFiles: Math.floor(Math.random() * 200) + 50,
      totalSize: Math.floor(Math.random() * 10000000) + 1000000, // 1-10MB
      ...overrides,
    };
  }

  /**
   * Create large project context
   */
  withLargeProject(context: any): any {
    return {
      ...context,
      totalFiles: Math.floor(Math.random() * 1000) + 500,
      totalSize: Math.floor(Math.random() * 100000000) + 50000000, // 50-150MB
      dependencies: {
        ...context.dependencies,
        '@types/node': '^20.0.0',
        eslint: '^8.0.0',
        jest: '^29.0.0',
        '@storybook/react': '^7.0.0',
        webpack: '^5.0.0',
      },
    };
  }

  /**
   * Create Next.js project context
   */
  withNextJS(context: any): any {
    return {
      ...context,
      framework: 'next',
      dependencies: {
        next: '^14.0.0',
        react: '^18.2.0',
        'react-dom': '^18.2.0',
        typescript: '^5.0.0',
      },
      scripts: {
        dev: 'next dev',
        build: 'next build',
        start: 'next start',
        lint: 'next lint',
      },
    };
  }

  /**
   * Create Vue.js project context
   */
  withVue(context: any): any {
    return {
      ...context,
      framework: 'vue',
      dependencies: {
        vue: '^3.3.0',
        '@vitejs/plugin-vue': '^4.0.0',
        vite: '^4.0.0',
        typescript: '^5.0.0',
      },
      scripts: {
        dev: 'vite',
        build: 'vue-tsc && vite build',
        preview: 'vite preview',
      },
    };
  }

  private generateDependencies(framework: string): Record<string, string> {
    const baseDependencies = {
      typescript: '^5.0.0',
    };

    const frameworkDependencies = {
      react: {
        react: '^18.2.0',
        'react-dom': '^18.2.0',
      },
      vue: {
        vue: '^3.3.0',
      },
      angular: {
        '@angular/core': '^16.0.0',
        '@angular/common': '^16.0.0',
      },
      svelte: {
        svelte: '^4.0.0',
      },
      next: {
        next: '^14.0.0',
        react: '^18.2.0',
        'react-dom': '^18.2.0',
      },
    };

    return {
      ...baseDependencies,
      ...frameworkDependencies[framework as keyof typeof frameworkDependencies],
    };
  }

  private generateScripts(framework: string): Record<string, string> {
    const baseScripts = {
      test: 'jest',
      lint: 'eslint .',
    };

    const frameworkScripts = {
      react: {
        dev: 'react-scripts start',
        build: 'react-scripts build',
      },
      vue: {
        dev: 'vite',
        build: 'vite build',
      },
      angular: {
        dev: 'ng serve',
        build: 'ng build',
      },
      svelte: {
        dev: 'vite dev',
        build: 'vite build',
      },
      next: {
        dev: 'next dev',
        build: 'next build',
        start: 'next start',
      },
    };

    return {
      ...baseScripts,
      ...frameworkScripts[framework as keyof typeof frameworkScripts],
    };
  }
}

/**
 * Context Item Factory
 */
export class ContextItemFactory extends BaseFactory<any> {
  private static types = ['file', 'component', 'function', 'class'];
  private static extensions = ['tsx', 'ts', 'jsx', 'js', 'vue', 'json'];

  create(overrides: any = {}): any {
    const sequence = BaseFactory.getSequence();
    const type = BaseFactory.randomChoice(ContextItemFactory.types);
    const extension = BaseFactory.randomChoice(ContextItemFactory.extensions);
    const filename = `${type}${sequence}.${extension}`;
    
    return {
      id: `item_${sequence}_${BaseFactory.randomString(8)}`,
      type,
      path: this.generatePath(type, filename),
      content: this.generateContent(type, filename),
      metadata: {
        extension,
        lines: Math.floor(Math.random() * 100) + 10,
        isText: true,
        sizeBytes: Math.floor(Math.random() * 5000) + 100,
      },
      lastModified: new Date(Date.now() - Math.floor(Math.random() * 86400000)),
      size: Math.floor(Math.random() * 5000) + 100,
      encoding: 'utf-8',
      ...overrides,
    };
  }

  /**
   * Create React component context item
   */
  withReactComponent(item: any): any {
    const componentName = `Component${BaseFactory.getSequence()}`;
    
    return {
      ...item,
      type: 'component',
      path: `src/components/${componentName}.tsx`,
      content: `import React from 'react';

interface ${componentName}Props {
  readonly children: React.ReactNode;
}

export const ${componentName} = ({ children }: ${componentName}Props): JSX.Element => {
  return <div className="${componentName.toLowerCase()}">{children}</div>;
};`,
      metadata: {
        ...item.metadata,
        extension: 'tsx',
        componentType: 'functional',
        hasProps: true,
        hasTypeScript: true,
      },
    };
  }

  /**
   * Create utility function context item
   */
  withUtilityFunction(item: any): any {
    const functionName = `utility${BaseFactory.getSequence()}`;
    
    return {
      ...item,
      type: 'function',
      path: `src/utils/${functionName}.ts`,
      content: `export const ${functionName} = (input: string): string => {
  return input.toLowerCase().trim();
};

export const ${functionName}Async = async (input: string): Promise<string> => {
  return new Promise(resolve => {
    setTimeout(() => resolve(${functionName}(input)), 100);
  });
};`,
      metadata: {
        ...item.metadata,
        extension: 'ts',
        functionCount: 2,
        hasAsync: true,
        hasTypeScript: true,
      },
    };
  }

  /**
   * Create large file context item
   */
  withLargeFile(item: any): any {
    return {
      ...item,
      content: Array.from({ length: 1000 }, (_, i) => `// Line ${i + 1}`).join('\n'),
      metadata: {
        ...item.metadata,
        lines: 1000,
        sizeBytes: 50000,
      },
      size: 50000,
    };
  }

  private generatePath(type: string, filename: string): string {
    const directories = {
      component: 'src/components',
      function: 'src/utils',
      class: 'src/services',
      file: 'src',
    };

    return join(directories[type as keyof typeof directories] || 'src', filename);
  }

  private generateContent(type: string, filename: string): string {
    const templates = {
      component: `export const ${filename.split('.')[0]} = () => <div>Component</div>;`,
      function: `export const ${filename.split('.')[0]} = () => 'function';`,
      class: `export class ${filename.split('.')[0]} { }`,
      file: `// ${filename}`,
    };

    return templates[type as keyof typeof templates] || `// ${filename}`;
  }
}

/**
 * Component Configuration Factory
 */
export class ComponentConfigFactory extends BaseFactory<any> {
  private static types = ['button', 'input', 'modal', 'card', 'table', 'form'];
  private static platforms = ['react', 'vue', 'angular', 'svelte'];
  private static variants = ['primary', 'secondary', 'destructive', 'outline', 'ghost'];
  private static sizes = ['sm', 'md', 'lg', 'xl'];

  create(overrides: any = {}): any {
    const sequence = BaseFactory.getSequence();
    const type = BaseFactory.randomChoice(ComponentConfigFactory.types);
    
    return {
      name: `Component${sequence}`,
      type,
      platform: BaseFactory.randomChoice(ComponentConfigFactory.platforms),
      features: this.generateFeatures(),
      styling: {
        variant: BaseFactory.randomChoice(ComponentConfigFactory.variants),
        size: BaseFactory.randomChoice(ComponentConfigFactory.sizes),
        borderRadius: BaseFactory.randomChoice(['sm', 'md', 'lg', 'xl']),
        shadow: BaseFactory.randomChoice(['none', 'sm', 'md', 'lg']),
      },
      props: this.generateProps(type),
      ...overrides,
    };
  }

  /**
   * Create accessible component configuration
   */
  withAccessible(config: any): any {
    return {
      ...config,
      features: {
        ...config.features,
        accessible: true,
        keyboardNavigation: true,
        screenReaderSupport: true,
        focusManagement: true,
      },
      props: [
        ...config.props,
        { name: 'ariaLabel', type: 'string', required: false },
        { name: 'ariaDescribedBy', type: 'string', required: false },
        { name: 'role', type: 'string', required: false },
      ],
    };
  }

  /**
   * Create interactive component configuration
   */
  withInteractive(config: any): any {
    return {
      ...config,
      features: {
        ...config.features,
        interactive: true,
        clickable: true,
        hoverable: true,
        focusable: true,
      },
      props: [
        ...config.props,
        { name: 'onClick', type: '() => void', required: false },
        { name: 'onHover', type: '() => void', required: false },
        { name: 'onFocus', type: '() => void', required: false },
        { name: 'onBlur', type: '() => void', required: false },
      ],
    };
  }

  /**
   * Create form component configuration
   */
  withFormComponent(config: any): any {
    return {
      ...config,
      type: 'form',
      features: {
        ...config.features,
        validation: true,
        submission: true,
        fieldManagement: true,
      },
      fields: [
        { name: 'email', type: 'email', required: true, validation: { pattern: '^[^@]+@[^@]+\\.[^@]+$' } },
        { name: 'password', type: 'password', required: true, validation: { minLength: 8 } },
        { name: 'confirmPassword', type: 'password', required: true },
        { name: 'newsletter', type: 'checkbox', required: false },
      ],
    };
  }

  /**
   * Create data table configuration
   */
  withDataTable(config: any): any {
    return {
      ...config,
      type: 'data-table',
      features: {
        ...config.features,
        sortable: true,
        filterable: true,
        paginated: true,
        selectable: true,
        exportable: true,
      },
      columns: [
        { key: 'id', label: 'ID', type: 'number', sortable: true },
        { key: 'name', label: 'Name', type: 'text', sortable: true, filterable: true },
        { key: 'email', label: 'Email', type: 'email', filterable: true },
        { key: 'status', label: 'Status', type: 'badge', filterable: true },
        { key: 'createdAt', label: 'Created', type: 'date', sortable: true },
        { key: 'actions', label: 'Actions', type: 'actions', sortable: false },
      ],
    };
  }

  private generateFeatures(): Record<string, boolean> {
    return {
      accessible: BaseFactory.randomBoolean(0.8),
      interactive: BaseFactory.randomBoolean(0.6),
      responsive: BaseFactory.randomBoolean(0.9),
      themeable: BaseFactory.randomBoolean(0.4),
      animations: BaseFactory.randomBoolean(0.3),
      validation: BaseFactory.randomBoolean(0.2),
    };
  }

  private generateProps(type: string): any[] {
    const baseProps = [
      { name: 'children', type: 'React.ReactNode', required: false },
      { name: 'className', type: 'string', required: false },
    ];

    const typeSpecificProps = {
      button: [
        { name: 'onClick', type: '() => void', required: false },
        { name: 'disabled', type: 'boolean', required: false },
        { name: 'type', type: '"button" | "submit" | "reset"', required: false },
      ],
      input: [
        { name: 'value', type: 'string', required: false },
        { name: 'onChange', type: '(value: string) => void', required: false },
        { name: 'placeholder', type: 'string', required: false },
        { name: 'disabled', type: 'boolean', required: false },
      ],
      modal: [
        { name: 'isOpen', type: 'boolean', required: true },
        { name: 'onClose', type: '() => void', required: true },
        { name: 'title', type: 'string', required: false },
      ],
    };

    return [
      ...baseProps,
      ...(typeSpecificProps[type as keyof typeof typeSpecificProps] || []),
    ];
  }
}

/**
 * MCP Response Factory
 */
export class MCPResponseFactory extends BaseFactory<any> {
  create(overrides: any = {}): any {
    return {
      success: true,
      timestamp: new Date().toISOString(),
      requestId: `req_${BaseFactory.randomString(16)}`,
      ...overrides,
    };
  }

  /**
   * Create generation response
   */
  withGeneration(response: any): any {
    const fileCount = Math.floor(Math.random() * 5) + 1;
    
    return {
      ...response,
      files: Array.from({ length: fileCount }, (_, i) => ({
        path: `src/components/Generated${i}.tsx`,
        content: `export const Generated${i} = () => <div>Generated Component ${i}</div>;`,
        encoding: 'utf-8',
        size: Math.floor(Math.random() * 2000) + 500,
      })),
      linesGenerated: Math.floor(Math.random() * 200) + 50,
      filesGenerated: fileCount,
      generationTime: Math.floor(Math.random() * 3000) + 500,
      tokens: {
        input: Math.floor(Math.random() * 1000) + 200,
        output: Math.floor(Math.random() * 800) + 100,
      },
      metadata: {
        platform: BaseFactory.randomChoice(['react', 'vue', 'angular']),
        features: ['accessible', 'responsive'],
        complexity: BaseFactory.randomChoice(['simple', 'medium', 'complex']),
      },
    };
  }

  /**
   * Create context indexing response
   */
  withIndexing(response: any): any {
    const itemCount = Math.floor(Math.random() * 100) + 20;
    
    return {
      ...response,
      indexId: `idx_${BaseFactory.randomString(12)}`,
      itemsIndexed: itemCount,
      totalSize: Math.floor(Math.random() * 10000000) + 1000000,
      indexingTime: Math.floor(Math.random() * 5000) + 1000,
      searchIndex: {
        components: Math.floor(itemCount * 0.3),
        functions: Math.floor(itemCount * 0.4),
        classes: Math.floor(itemCount * 0.2),
        files: Math.floor(itemCount * 0.1),
      },
      categories: {
        'ui-components': Math.floor(itemCount * 0.25),
        'business-logic': Math.floor(itemCount * 0.35),
        'utilities': Math.floor(itemCount * 0.25),
        'configuration': Math.floor(itemCount * 0.15),
      },
    };
  }

  /**
   * Create error response
   */
  withError(response: any): any {
    const errorTypes = [
      'ValidationError',
      'NetworkError', 
      'AuthenticationError',
      'RateLimitError',
      'ServerError',
    ];
    
    const errorType = BaseFactory.randomChoice(errorTypes);
    
    return {
      ...response,
      success: false,
      error: {
        type: errorType,
        message: this.getErrorMessage(errorType),
        code: this.getErrorCode(errorType),
        details: this.getErrorDetails(errorType),
        timestamp: new Date().toISOString(),
        requestId: response.requestId,
      },
    };
  }

  private getErrorMessage(type: string): string {
    const messages = {
      ValidationError: 'Invalid request parameters',
      NetworkError: 'Network connection failed',
      AuthenticationError: 'Authentication failed: Invalid API key',
      RateLimitError: 'Rate limit exceeded: Too many requests',
      ServerError: 'Internal server error occurred',
    };
    
    return messages[type as keyof typeof messages] || 'Unknown error occurred';
  }

  private getErrorCode(type: string): string {
    const codes = {
      ValidationError: 'E_VALIDATION',
      NetworkError: 'E_NETWORK',
      AuthenticationError: 'E_AUTH',
      RateLimitError: 'E_RATE_LIMIT',
      ServerError: 'E_SERVER',
    };
    
    return codes[type as keyof typeof codes] || 'E_UNKNOWN';
  }

  private getErrorDetails(type: string): any {
    const details = {
      ValidationError: {
        field: 'name',
        constraint: 'required',
        received: null,
      },
      NetworkError: {
        endpoint: 'https://api.xala.ai/mcp',
        timeout: 30000,
        retryAttempt: 3,
      },
      AuthenticationError: {
        apiKeyLength: 24,
        requiredLength: 32,
      },
      RateLimitError: {
        limit: 100,
        window: '1h',
        retryAfter: 3600,
      },
      ServerError: {
        statusCode: 500,
        serverTime: new Date().toISOString(),
      },
    };
    
    return details[type as keyof typeof details] || {};
  }
}

/**
 * Performance Data Factory
 */
export class PerformanceDataFactory extends BaseFactory<any> {
  create(overrides: any = {}): any {
    return {
      operation: 'test-operation',
      startTime: Date.now() - Math.floor(Math.random() * 5000),
      endTime: Date.now(),
      duration: Math.floor(Math.random() * 5000) + 100,
      memory: {
        heapUsed: Math.floor(Math.random() * 100000000) + 10000000,
        heapTotal: Math.floor(Math.random() * 150000000) + 50000000,
        external: Math.floor(Math.random() * 10000000) + 1000000,
        rss: Math.floor(Math.random() * 200000000) + 100000000,
      },
      cpu: {
        user: Math.floor(Math.random() * 1000000),
        system: Math.floor(Math.random() * 500000),
      },
      ...overrides,
    };
  }

  /**
   * Create slow performance data
   */
  withSlowOperation(data: any): any {
    return {
      ...data,
      duration: Math.floor(Math.random() * 10000) + 5000, // 5-15 seconds
      memory: {
        ...data.memory,
        heapUsed: data.memory.heapUsed * 2,
      },
      issues: [
        'Operation exceeded performance threshold',
        'High memory usage detected',
      ],
    };
  }

  /**
   * Create fast performance data
   */
  withFastOperation(data: any): any {
    return {
      ...data,
      duration: Math.floor(Math.random() * 200) + 10, // 10-210ms
      memory: {
        ...data.memory,
        heapUsed: Math.floor(data.memory.heapUsed * 0.5),
      },
      optimizations: [
        'Template caching enabled',
        'Efficient memory usage',
      ],
    };
  }
}

// Export all factories
export const Factories = {
  MCPConfig: new MCPConfigFactory(),
  ProjectContext: new ProjectContextFactory(),
  ContextItem: new ContextItemFactory(),
  ComponentConfig: new ComponentConfigFactory(),
  MCPResponse: new MCPResponseFactory(),
  PerformanceData: new PerformanceDataFactory(),
};

// Export factory classes for direct instantiation
export {
  MCPConfigFactory,
  ProjectContextFactory,
  ContextItemFactory,
  ComponentConfigFactory,
  MCPResponseFactory,
  PerformanceDataFactory,
};