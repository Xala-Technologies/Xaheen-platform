/**
 * @fileoverview Scaffold Performance Tests - EPIC 13 Story 13.7 & EPIC 14 Story 14.5
 * @description Performance-test scaffold times and template compile speed
 * @version 1.0.0
 * @compliance Enterprise Security, Norwegian NSM Standards
 */

import { beforeEach, afterEach, describe, expect, it, vi } from 'vitest';
import { join } from 'path';
import fs from 'fs-extra';
import { ComponentGenerator } from "../../generators/component.generator";
import { LayoutGenerator } from "../../generators/layout.generator";
import { PageGenerator } from "../../generators/page.generator";
import { MCPClientService } from "../../services/mcp/mcp-client.service";
import { TestFileSystem, CLITestRunner, PerformanceTracker } from "../test-helpers";

// Performance thresholds in milliseconds
const PERFORMANCE_THRESHOLDS = {
  componentGeneration: {
    simple: 500,      // Simple component should generate within 500ms
    complex: 1500,    // Complex component should generate within 1.5s
    batch10: 3000,    // 10 components should generate within 3s
    batch50: 12000,   // 50 components should generate within 12s
  },
  layoutGeneration: {
    simple: 800,      // Simple layout should generate within 800ms
    admin: 1200,      // Admin layout should generate within 1.2s
    complex: 2000,    // Complex layout should generate within 2s
  },
  pageGeneration: {
    landing: 1000,    // Landing page should generate within 1s
    dashboard: 1500,  // Dashboard page should generate within 1.5s
    complex: 2500,    // Complex page should generate within 2.5s
  },
  templateCompilation: {
    simple: 100,      // Simple template should compile within 100ms
    complex: 300,     // Complex template should compile within 300ms
    cached: 50,       // Cached template should compile within 50ms
  },
  mcpOperations: {
    connection: 2000,     // MCP connection should establish within 2s
    indexing: 5000,       // Context indexing should complete within 5s
    generation: 3000,     // MCP generation should complete within 3s
    largeBatch: 15000,    // Large batch operations within 15s
  },
  memoryUsage: {
    maxHeapIncrease: 100 * 1024 * 1024,  // Max 100MB heap increase
    maxLeakRate: 10 * 1024 * 1024,       // Max 10MB/operation leak rate
  },
};

// Memory profiling utilities
class MemoryProfiler {
  private baselines: Map<string, NodeJS.MemoryUsage> = new Map();
  private measurements: Map<string, NodeJS.MemoryUsage[]> = new Map();

  startProfile(name: string): void {
    if (global.gc) global.gc(); // Force garbage collection if available
    this.baselines.set(name, process.memoryUsage());
    this.measurements.set(name, []);
  }

  measurePoint(name: string): NodeJS.MemoryUsage {
    const memory = process.memoryUsage();
    const measurements = this.measurements.get(name) || [];
    measurements.push(memory);
    this.measurements.set(name, measurements);
    return memory;
  }

  endProfile(name: string): {
    baseline: NodeJS.MemoryUsage;
    peak: NodeJS.MemoryUsage;
    final: NodeJS.MemoryUsage;
    heapGrowth: number;
    rssGrowth: number;
  } {
    const baseline = this.baselines.get(name);
    const measurements = this.measurements.get(name) || [];
    
    if (!baseline) {
      throw new Error(`No baseline found for profile: ${name}`);
    }

    const final = process.memoryUsage();
    const peak = measurements.reduce((max, current) => 
      current.heapUsed > max.heapUsed ? current : max, 
      baseline
    );

    return {
      baseline,
      peak,
      final,
      heapGrowth: final.heapUsed - baseline.heapUsed,
      rssGrowth: final.rss - baseline.rss,
    };
  }

  clear(): void {
    this.baselines.clear();
    this.measurements.clear();
  }
}

describe('Scaffold Performance Tests', () => {
  let testFs: TestFileSystem;
  let testDir: string;
  let perfTracker: PerformanceTracker;
  let memoryProfiler: MemoryProfiler;
  let cliRunner: CLITestRunner;

  beforeEach(async () => {
    testFs = new TestFileSystem();
    testDir = await testFs.createTempDir('perf-test-');
    perfTracker = new PerformanceTracker();
    memoryProfiler = new MemoryProfiler();
    cliRunner = new CLITestRunner();

    // Setup realistic template files
    await setupPerformanceTestTemplates(testDir);

    // Mock console to reduce noise during performance tests
    vi.spyOn(console, 'log').mockImplementation(() => {});
    vi.spyOn(console, 'info').mockImplementation(() => {});
  });

  afterEach(async () => {
    await testFs.restore();
    perfTracker.clear();
    memoryProfiler.clear();
    vi.restoreAllMocks();
  });

  describe('Component Generation Performance', () => {
    let generator: ComponentGenerator;

    beforeEach(() => {
      generator = new ComponentGenerator({
        templatePath: join(testDir, 'templates'),
        outputPath: join(testDir, 'output'),
      });
    });

    it('should generate simple components within performance threshold', async () => {
      const endMeasurement = perfTracker.startMeasurement('simple-component');
      memoryProfiler.startProfile('simple-component');

      const options = {
        name: 'SimpleButton',
        type: 'button',
        platform: 'react',
      };

      const result = await generator.generate(options);
      
      const duration = endMeasurement();
      const memoryResult = memoryProfiler.endProfile('simple-component');

      expect(result.success).toBe(true);
      expect(duration).toBeLessThan(PERFORMANCE_THRESHOLDS.componentGeneration.simple);
      expect(memoryResult.heapGrowth).toBeLessThan(PERFORMANCE_THRESHOLDS.memoryUsage.maxHeapIncrease);
    });

    it('should generate complex components within performance threshold', async () => {
      const endMeasurement = perfTracker.startMeasurement('complex-component');
      memoryProfiler.startProfile('complex-component');

      const options = {
        name: 'ComplexDataTable',
        type: 'data-table',
        platform: 'react',
        features: {
          sortable: true,
          filterable: true,
          paginated: true,
          selectable: true,
          exportable: true,
          accessible: true,
          responsive: true,
          virtualized: true,
        },
        styling: {
          variant: 'default',
          size: 'md',
          borderRadius: 'lg',
          shadow: 'md',
        },
        columns: Array.from({ length: 20 }, (_, i) => ({
          key: `column${i}`,
          label: `Column ${i}`,
          type: i % 3 === 0 ? 'number' : i % 3 === 1 ? 'date' : 'text',
          sortable: true,
          filterable: true,
        })),
      };

      const result = await generator.generate(options);
      
      const duration = endMeasurement();
      const memoryResult = memoryProfiler.endProfile('complex-component');

      expect(result.success).toBe(true);
      expect(duration).toBeLessThan(PERFORMANCE_THRESHOLDS.componentGeneration.complex);
      expect(memoryResult.heapGrowth).toBeLessThan(PERFORMANCE_THRESHOLDS.memoryUsage.maxHeapIncrease);
    });

    it('should handle batch generation efficiently', async () => {
      const batchSizes = [10, 50];

      for (const batchSize of batchSizes) {
        const endMeasurement = perfTracker.startMeasurement(`batch-${batchSize}`);
        memoryProfiler.startProfile(`batch-${batchSize}`);

        const batchPromises = [];
        for (let i = 0; i < batchSize; i++) {
          batchPromises.push(
            generator.generate({
              name: `BatchComponent${i}`,
              type: 'button',
              platform: 'react',
              features: {
                accessible: i % 2 === 0,
                interactive: true,
              },
            })
          );
        }

        const results = await Promise.all(batchPromises);
        
        const duration = endMeasurement();
        const memoryResult = memoryProfiler.endProfile(`batch-${batchSize}`);

        // All should succeed
        expect(results.every(r => r.success)).toBe(true);
        
        // Performance thresholds
        const threshold = batchSize === 10 
          ? PERFORMANCE_THRESHOLDS.componentGeneration.batch10
          : PERFORMANCE_THRESHOLDS.componentGeneration.batch50;
        
        expect(duration).toBeLessThan(threshold);
        
        // Memory should scale linearly, not exponentially
        const expectedMaxMemory = PERFORMANCE_THRESHOLDS.memoryUsage.maxHeapIncrease * (batchSize / 10);
        expect(memoryResult.heapGrowth).toBeLessThan(expectedMaxMemory);
      }
    });

    it('should demonstrate template caching performance benefits', async () => {
      // First generation (cold cache)
      const coldStartMeasurement = perfTracker.startMeasurement('cold-generation');
      await generator.generate({
        name: 'CacheTest1',
        type: 'button',
        platform: 'react',
      });
      const coldDuration = coldStartMeasurement();

      // Subsequent generations (warm cache)
      const warmTimes = [];
      for (let i = 0; i < 5; i++) {
        const warmMeasurement = perfTracker.startMeasurement(`warm-generation-${i}`);
        await generator.generate({
          name: `CacheTest${i + 2}`,
          type: 'button', // Same type, should use cached template
          platform: 'react',
        });
        warmTimes.push(warmMeasurement());
      }

      const averageWarmTime = warmTimes.reduce((sum, time) => sum + time, 0) / warmTimes.length;
      
      // Warm generations should be significantly faster
      expect(averageWarmTime).toBeLessThan(coldDuration * 0.7);
      expect(averageWarmTime).toBeLessThan(PERFORMANCE_THRESHOLDS.templateCompilation.cached);
    });
  });

  describe('Layout Generation Performance', () => {
    let generator: LayoutGenerator;

    beforeEach(() => {
      generator = new LayoutGenerator({
        templatePath: join(testDir, 'templates'),
        outputPath: join(testDir, 'output'),
      });
    });

    it('should generate simple layouts within performance threshold', async () => {
      const endMeasurement = perfTracker.startMeasurement('simple-layout');
      memoryProfiler.startProfile('simple-layout');

      const result = await generator.generate({
        name: 'SimpleLayout',
        layoutType: 'web',
        features: {
          header: true,
          footer: true,
        },
      });

      const duration = endMeasurement();
      const memoryResult = memoryProfiler.endProfile('simple-layout');

      expect(result.success).toBe(true);
      expect(duration).toBeLessThan(PERFORMANCE_THRESHOLDS.layoutGeneration.simple);
      expect(memoryResult.heapGrowth).toBeLessThan(PERFORMANCE_THRESHOLDS.memoryUsage.maxHeapIncrease);
    });

    it('should generate admin layouts within performance threshold', async () => {
      const endMeasurement = perfTracker.startMeasurement('admin-layout');
      memoryProfiler.startProfile('admin-layout');

      const result = await generator.generate({
        name: 'AdminLayout',
        layoutType: 'admin',
        features: {
          header: true,
          sidebar: true,
          footer: true,
          breadcrumbs: true,
          notifications: true,
        },
        navigation: {
          type: 'vertical',
          items: Array.from({ length: 20 }, (_, i) => ({
            key: `nav-item-${i}`,
            label: `Navigation Item ${i}`,
            href: `/page/${i}`,
            icon: i % 4 === 0 ? 'dashboard' : i % 4 === 1 ? 'users' : i % 4 === 2 ? 'settings' : 'help',
          })),
        },
      });

      const duration = endMeasurement();
      const memoryResult = memoryProfiler.endProfile('admin-layout');

      expect(result.success).toBe(true);
      expect(duration).toBeLessThan(PERFORMANCE_THRESHOLDS.layoutGeneration.admin);
      expect(memoryResult.heapGrowth).toBeLessThan(PERFORMANCE_THRESHOLDS.memoryUsage.maxHeapIncrease);
    });

    it('should generate complex responsive layouts efficiently', async () => {
      const endMeasurement = perfTracker.startMeasurement('complex-layout');
      memoryProfiler.startProfile('complex-layout');

      const result = await generator.generate({
        name: 'ComplexResponsiveLayout',
        layoutType: 'admin',
        features: {
          header: true,
          sidebar: true,
          footer: true,
          breadcrumbs: true,
          notifications: true,
          search: true,
          userMenu: true,
          themeToggle: true,
          responsive: true,
          collapsibleSidebar: true,
        },
        breakpoints: {
          mobile: '480px',
          tablet: '768px',
          desktop: '1024px',
          wide: '1200px',
        },
        navigation: {
          type: 'vertical',
          collapsible: true,
          items: Array.from({ length: 50 }, (_, i) => ({
            key: `nav-item-${i}`,
            label: `Navigation Item ${i}`,
            href: `/page/${i}`,
            children: i % 5 === 0 ? Array.from({ length: 3 }, (_, j) => ({
              key: `sub-item-${i}-${j}`,
              label: `Sub Item ${j}`,
              href: `/page/${i}/${j}`,
            })) : undefined,
          })),
        },
      });

      const duration = endMeasurement();
      const memoryResult = memoryProfiler.endProfile('complex-layout');

      expect(result.success).toBe(true);
      expect(duration).toBeLessThan(PERFORMANCE_THRESHOLDS.layoutGeneration.complex);
      expect(memoryResult.heapGrowth).toBeLessThan(PERFORMANCE_THRESHOLDS.memoryUsage.maxHeapIncrease);
    });
  });

  describe('Page Generation Performance', () => {
    let generator: PageGenerator;

    beforeEach(() => {
      generator = new PageGenerator({
        templatePath: join(testDir, 'templates'),
        outputPath: join(testDir, 'output'),
      });
    });

    it('should generate landing pages within performance threshold', async () => {
      const endMeasurement = perfTracker.startMeasurement('landing-page');
      memoryProfiler.startProfile('landing-page');

      const result = await generator.generate({
        name: 'LandingPage',
        template: 'landing',
        sections: [
          'hero',
          'features',
          'testimonials',
          'pricing',
          'faq',
          'cta',
        ],
        features: {
          seo: true,
          analytics: true,
          responsive: true,
        },
      });

      const duration = endMeasurement();
      const memoryResult = memoryProfiler.endProfile('landing-page');

      expect(result.success).toBe(true);
      expect(duration).toBeLessThan(PERFORMANCE_THRESHOLDS.pageGeneration.landing);
      expect(memoryResult.heapGrowth).toBeLessThan(PERFORMANCE_THRESHOLDS.memoryUsage.maxHeapIncrease);
    });

    it('should generate dashboard pages within performance threshold', async () => {
      const endMeasurement = perfTracker.startMeasurement('dashboard-page');
      memoryProfiler.startProfile('dashboard-page');

      const result = await generator.generate({
        name: 'DashboardPage',
        template: 'dashboard',
        sections: [
          'header',
          'stats',
          'charts',
          'tables',
          'notifications',
          'recent-activity',
        ],
        widgets: Array.from({ length: 12 }, (_, i) => ({
          type: i % 4 === 0 ? 'chart' : i % 4 === 1 ? 'table' : i % 4 === 2 ? 'stats' : 'list',
          title: `Widget ${i}`,
          size: i % 3 === 0 ? 'large' : 'medium',
        })),
        features: {
          realtime: true,
          exportable: true,
          customizable: true,
        },
      });

      const duration = endMeasurement();
      const memoryResult = memoryProfiler.endProfile('dashboard-page');

      expect(result.success).toBe(true);
      expect(duration).toBeLessThan(PERFORMANCE_THRESHOLDS.pageGeneration.dashboard);
      expect(memoryResult.heapGrowth).toBeLessThan(PERFORMANCE_THRESHOLDS.memoryUsage.maxHeapIncrease);
    });

    it('should generate complex multi-section pages efficiently', async () => {
      const endMeasurement = perfTracker.startMeasurement('complex-page');
      memoryProfiler.startProfile('complex-page');

      const result = await generator.generate({
        name: 'ComplexApplicationPage',
        template: 'application',
        sections: Array.from({ length: 20 }, (_, i) => `section-${i}`),
        components: Array.from({ length: 30 }, (_, i) => ({
          name: `Component${i}`,
          type: i % 5 === 0 ? 'form' : i % 5 === 1 ? 'table' : i % 5 === 2 ? 'chart' : i % 5 === 3 ? 'card' : 'modal',
          props: {
            title: `Component ${i}`,
            data: Array.from({ length: 10 }, (_, j) => ({ id: j, value: `Data ${j}` })),
          },
        })),
        features: {
          seo: true,
          analytics: true,
          responsive: true,
          accessible: true,
          internationalization: true,
          theming: true,
          lazyLoading: true,
        },
      });

      const duration = endMeasurement();
      const memoryResult = memoryProfiler.endProfile('complex-page');

      expect(result.success).toBe(true);
      expect(duration).toBeLessThan(PERFORMANCE_THRESHOLDS.pageGeneration.complex);
      expect(memoryResult.heapGrowth).toBeLessThan(PERFORMANCE_THRESHOLDS.memoryUsage.maxHeapIncrease);
    });
  });

  describe('Template Compilation Performance', () => {
    let generator: ComponentGenerator;

    beforeEach(() => {
      generator = new ComponentGenerator({
        templatePath: join(testDir, 'templates'),
        outputPath: join(testDir, 'output'),
      });
    });

    it('should compile simple templates within performance threshold', async () => {
      const simpleTemplate = `export const {{name}} = (): JSX.Element => {
  return <div>{{name}}</div>;
};`;

      const endMeasurement = perfTracker.startMeasurement('simple-template-compilation');
      
      const result = await generator.renderTemplate(simpleTemplate, { name: 'SimpleComponent' });
      
      const duration = endMeasurement();

      expect(result).toContain('SimpleComponent');
      expect(duration).toBeLessThan(PERFORMANCE_THRESHOLDS.templateCompilation.simple);
    });

    it('should compile complex templates within performance threshold', async () => {
      const complexTemplate = await fs.readFile(
        join(testDir, 'templates', 'complex-component.hbs'),
        'utf-8'
      );

      const endMeasurement = perfTracker.startMeasurement('complex-template-compilation');
      
      const result = await generator.renderTemplate(complexTemplate, {
        name: 'ComplexComponent',
        features: {
          accessible: true,
          responsive: true,
          interactive: true,
          themeable: true,
        },
        props: Array.from({ length: 20 }, (_, i) => ({
          name: `prop${i}`,
          type: i % 3 === 0 ? 'string' : i % 3 === 1 ? 'number' : 'boolean',
          required: i % 4 === 0,
        })),
        methods: Array.from({ length: 10 }, (_, i) => ({
          name: `method${i}`,
          params: [`param${i}`],
          returnType: 'void',
        })),
      });
      
      const duration = endMeasurement();

      expect(result).toContain('ComplexComponent');
      expect(duration).toBeLessThan(PERFORMANCE_THRESHOLDS.templateCompilation.complex);
    });

    it('should demonstrate significant caching performance improvements', async () => {
      const template = `export const {{name}} = (): JSX.Element => {
  return <div className="{{className}}">{{content}}</div>;
};`;

      // First compilation (no cache)
      const firstCompilationMeasurement = perfTracker.startMeasurement('first-compilation');
      await generator.renderTemplate(template, { 
        name: 'FirstComponent', 
        className: 'test-class',
        content: 'First content'
      });
      const firstDuration = firstCompilationMeasurement();

      // Multiple subsequent compilations (should use cache)
      const cachedCompilationTimes = [];
      for (let i = 0; i < 10; i++) {
        const cachedMeasurement = perfTracker.startMeasurement(`cached-compilation-${i}`);
        await generator.renderTemplate(template, { 
          name: `CachedComponent${i}`, 
          className: 'cached-class',
          content: `Cached content ${i}`
        });
        cachedCompilationTimes.push(cachedMeasurement());
      }

      const averageCachedTime = cachedCompilationTimes.reduce((sum, time) => sum + time, 0) / cachedCompilationTimes.length;

      // Cached compilations should be significantly faster
      expect(averageCachedTime).toBeLessThan(firstDuration * 0.3);
      expect(averageCachedTime).toBeLessThan(PERFORMANCE_THRESHOLDS.templateCompilation.cached);
    });
  });

  describe('MCP Operations Performance', () => {
    let mcpClient: MCPClientService;

    beforeEach(async () => {
      // Setup MCP configuration
      await fs.ensureDir(join(testDir, '.xaheen'));
      await fs.writeFile(
        join(testDir, '.xaheen', 'mcp.config.json'),
        JSON.stringify({
          serverUrl: 'https://api.xala.ai/mcp',
          apiKey: 'performance_test_api_key_32_chars',
          clientId: 'performance_test_client',
          timeout: 10000,
          retryAttempts: 2,
          enableTelemetry: false, // Disable for performance testing
        })
      );

      mcpClient = new MCPClientService({
        configPath: join(testDir, '.xaheen', 'mcp.config.json'),
        enterpriseMode: true,
        debug: false,
      });
    });

    afterEach(async () => {
      if (mcpClient?.isClientConnected()) {
        await mcpClient.disconnect();
      }
    });

    it('should establish MCP connection within performance threshold', async () => {
      const endMeasurement = perfTracker.startMeasurement('mcp-connection');
      memoryProfiler.startProfile('mcp-connection');

      await mcpClient.initialize(testDir);

      const duration = endMeasurement();
      const memoryResult = memoryProfiler.endProfile('mcp-connection');

      expect(mcpClient.isClientConnected()).toBe(true);
      expect(duration).toBeLessThan(PERFORMANCE_THRESHOLDS.mcpOperations.connection);
      expect(memoryResult.heapGrowth).toBeLessThan(PERFORMANCE_THRESHOLDS.memoryUsage.maxHeapIncrease);
    });

    it('should perform context indexing within performance threshold', async () => {
      await mcpClient.initialize(testDir);
      
      // Create realistic project context
      await createLargeProjectContext(testDir);

      const endMeasurement = perfTracker.startMeasurement('mcp-context-indexing');
      memoryProfiler.startProfile('mcp-context-indexing');

      await mcpClient.loadProjectContext(testDir);
      await mcpClient.loadContextItems({
        includePatterns: ['**/*.{ts,tsx,js,jsx,json}'],
        excludePatterns: ['node_modules/**', 'dist/**'],
      });
      await mcpClient.indexProjectContext();

      const duration = endMeasurement();
      const memoryResult = memoryProfiler.endProfile('mcp-context-indexing');

      expect(duration).toBeLessThan(PERFORMANCE_THRESHOLDS.mcpOperations.indexing);
      expect(memoryResult.heapGrowth).toBeLessThan(PERFORMANCE_THRESHOLDS.memoryUsage.maxHeapIncrease);
    });

    it('should perform component generation within performance threshold', async () => {
      await mcpClient.initialize(testDir);
      await mcpClient.loadProjectContext(testDir);

      const endMeasurement = perfTracker.startMeasurement('mcp-component-generation');
      memoryProfiler.startProfile('mcp-component-generation');

      const result = await mcpClient.generateComponent('PerformanceTestButton', 'button', {
        platform: 'react',
        features: {
          accessible: true,
          interactive: true,
          responsive: true,
        },
      });

      const duration = endMeasurement();
      const memoryResult = memoryProfiler.endProfile('mcp-component-generation');

      expect(result.success).toBe(true);
      expect(duration).toBeLessThan(PERFORMANCE_THRESHOLDS.mcpOperations.generation);
      expect(memoryResult.heapGrowth).toBeLessThan(PERFORMANCE_THRESHOLDS.memoryUsage.maxHeapIncrease);
    });

    it('should handle large batch operations efficiently', async () => {
      await mcpClient.initialize(testDir);
      await mcpClient.loadProjectContext(testDir);

      const endMeasurement = perfTracker.startMeasurement('mcp-large-batch');
      memoryProfiler.startProfile('mcp-large-batch');

      const batchPromises = [];
      for (let i = 0; i < 20; i++) {
        batchPromises.push(
          mcpClient.generateComponent(`BatchComponent${i}`, 'button', {
            platform: 'react',
            features: {
              accessible: i % 2 === 0,
              interactive: true,
            },
          })
        );
      }

      const results = await Promise.all(batchPromises);

      const duration = endMeasurement();
      const memoryResult = memoryProfiler.endProfile('mcp-large-batch');

      expect(results.every(r => r.success)).toBe(true);
      expect(duration).toBeLessThan(PERFORMANCE_THRESHOLDS.mcpOperations.largeBatch);
      expect(memoryResult.heapGrowth).toBeLessThan(PERFORMANCE_THRESHOLDS.memoryUsage.maxHeapIncrease * 2);
    });
  });

  describe('CLI Command Performance', () => {
    it('should execute scaffold commands within performance threshold', async () => {
      const endMeasurement = perfTracker.startMeasurement('cli-scaffold-command');
      memoryProfiler.startProfile('cli-scaffold-command');

      const result = await cliRunner.runCommand([
        'scaffold', 'frontend', 'cli-perf-test',
        '--framework', 'react',
        '--typescript',
        '--no-install'
      ], {
        cwd: testDir,
        env: {
          XAHEEN_NO_INTERACTIVE: 'true',
        },
      });

      const duration = endMeasurement();
      const memoryResult = memoryProfiler.endProfile('cli-scaffold-command');

      expect(result.exitCode).toBe(0);
      expect(duration).toBeLessThan(15000); // 15 seconds
      expect(memoryResult.heapGrowth).toBeLessThan(PERFORMANCE_THRESHOLDS.memoryUsage.maxHeapIncrease);
    });

    it('should execute generation commands within performance threshold', async () => {
      // First scaffold a project
      await cliRunner.runCommand([
        'scaffold', 'frontend', 'gen-perf-test',
        '--no-install'
      ], {
        cwd: testDir,
        env: { XAHEEN_NO_INTERACTIVE: 'true' },
      });

      const projectPath = join(testDir, 'gen-perf-test');

      const endMeasurement = perfTracker.startMeasurement('cli-generate-command');
      memoryProfiler.startProfile('cli-generate-command');

      const result = await cliRunner.runCommand([
        'generate', 'component', 'CLIPerfButton',
        '--type', 'button',
        '--features', 'accessible,responsive'
      ], {
        cwd: projectPath,
      });

      const duration = endMeasurement();
      const memoryResult = memoryProfiler.endProfile('cli-generate-command');

      expect(result.exitCode).toBe(0);
      expect(duration).toBeLessThan(5000); // 5 seconds
      expect(memoryResult.heapGrowth).toBeLessThan(PERFORMANCE_THRESHOLDS.memoryUsage.maxHeapIncrease);
    });
  });

  describe('Memory Leak Detection', () => {
    it('should not leak memory during repeated operations', async () => {
      const generator = new ComponentGenerator({
        templatePath: join(testDir, 'templates'),
        outputPath: join(testDir, 'output'),
      });

      memoryProfiler.startProfile('memory-leak-test');
      const initialMemory = process.memoryUsage();

      // Perform many operations
      for (let i = 0; i < 100; i++) {
        await generator.generate({
          name: `LeakTest${i}`,
          type: 'button',
          platform: 'react',
        });

        // Sample memory every 10 operations
        if (i % 10 === 0) {
          memoryProfiler.measurePoint('memory-leak-test');
        }
      }

      // Force garbage collection if available
      if (global.gc) {
        global.gc();
        global.gc(); // Run twice to be thorough
      }

      const finalMemory = process.memoryUsage();
      const memoryGrowth = finalMemory.heapUsed - initialMemory.heapUsed;
      const leakRate = memoryGrowth / 100; // Per operation

      expect(leakRate).toBeLessThan(PERFORMANCE_THRESHOLDS.memoryUsage.maxLeakRate);
    });

    it('should handle MCP operations without memory leaks', async () => {
      const mcpClient = new MCPClientService({
        configPath: join(testDir, '.xaheen', 'mcp.config.json'),
        enterpriseMode: true,
        debug: false,
      });

      await mcpClient.initialize(testDir);
      await mcpClient.loadProjectContext(testDir);

      memoryProfiler.startProfile('mcp-memory-leak-test');
      const initialMemory = process.memoryUsage();

      // Perform many MCP operations
      for (let i = 0; i < 50; i++) {
        await mcpClient.generateComponent(`MCPLeakTest${i}`, 'button');

        if (i % 10 === 0) {
          memoryProfiler.measurePoint('mcp-memory-leak-test');
        }
      }

      await mcpClient.disconnect();

      if (global.gc) {
        global.gc();
        global.gc();
      }

      const finalMemory = process.memoryUsage();
      const memoryGrowth = finalMemory.heapUsed - initialMemory.heapUsed;
      const leakRate = memoryGrowth / 50;

      expect(leakRate).toBeLessThan(PERFORMANCE_THRESHOLDS.memoryUsage.maxLeakRate * 2); // Allow some overhead for MCP
    });
  });

  // Helper functions
  async function setupPerformanceTestTemplates(baseDir: string): Promise<void> {
    const templatesDir = join(baseDir, 'templates');
    await fs.ensureDir(templatesDir);

    // Simple component template
    await fs.writeFile(
      join(templatesDir, 'simple-component.hbs'),
      `import React from 'react';

export const {{name}} = (): JSX.Element => {
  return <div className="simple-component">{{name}}</div>;
};`
    );

    // Complex component template
    await fs.writeFile(
      join(templatesDir, 'complex-component.hbs'),
      `import React, { useState, useCallback, useMemo, useEffect } from 'react';

interface {{name}}Props {
  {{#each props}}
  readonly {{name}}{{#unless required}}?{{/unless}}: {{type}};
  {{/each}}
  {{#if features.accessible}}
  readonly ariaLabel?: string;
  readonly ariaDescribedBy?: string;
  {{/if}}
  {{#if features.interactive}}
  readonly onClick?: () => void;
  readonly onFocus?: () => void;
  readonly onBlur?: () => void;
  {{/if}}
}

export const {{name}} = ({
  {{#each props}}
  {{name}},
  {{/each}}
  {{#if features.accessible}}
  ariaLabel,
  ariaDescribedBy,
  {{/if}}
  {{#if features.interactive}}
  onClick,
  onFocus,
  onBlur,
  {{/if}}
}: {{name}}Props): JSX.Element => {
  {{#if features.interactive}}
  const [isActive, setIsActive] = useState(false);
  const [isFocused, setIsFocused] = useState(false);
  {{/if}}

  {{#each methods}}
  const {{name}} = useCallback(({{#each params}}{{this}}: any{{#unless @last}}, {{/unless}}{{/each}}) => {
    // Method implementation
  }, []);
  {{/each}}

  {{#if features.responsive}}
  const breakpoint = useMemo(() => {
    return window.innerWidth < 768 ? 'mobile' : window.innerWidth < 1024 ? 'tablet' : 'desktop';
  }, []);
  {{/if}}

  {{#if features.themeable}}
  useEffect(() => {
    // Theme initialization
  }, []);
  {{/if}}

  return (
    <div
      className={\`complex-component \${isActive ? 'active' : ''} \${isFocused ? 'focused' : ''}\`}
      {{#if features.accessible}}
      aria-label={ariaLabel}
      aria-describedby={ariaDescribedBy}
      {{/if}}
      {{#if features.interactive}}
      onClick={onClick}
      onFocus={() => { setIsFocused(true); onFocus?.(); }}
      onBlur={() => { setIsFocused(false); onBlur?.(); }}
      {{/if}}
    >
      <h1>{{name}}</h1>
      {{#if features.responsive}}
      <p>Current breakpoint: {breakpoint}</p>
      {{/if}}
    </div>
  );
};`
    );
  }

  async function createLargeProjectContext(baseDir: string): Promise<void> {
    const srcDir = join(baseDir, 'src');
    await fs.ensureDir(srcDir);

    // Create many files to simulate large project
    for (let i = 0; i < 100; i++) {
      await fs.writeFile(
        join(srcDir, `component${i}.tsx`),
        `export const Component${i} = () => <div>Component ${i}</div>;`
      );
    }

    // Create package.json
    await fs.writeFile(
      join(baseDir, 'package.json'),
      JSON.stringify({
        name: 'large-test-project',
        version: '1.0.0',
        dependencies: {
          react: '^18.0.0',
          'react-dom': '^18.0.0',
          next: '^14.0.0',
        },
      })
    );
  }
});