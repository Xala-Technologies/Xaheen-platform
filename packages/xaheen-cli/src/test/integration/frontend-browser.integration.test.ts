/**
 * @fileoverview Frontend Browser Integration Tests - EPIC 13 Story 13.7
 * @description Integration-test template output renders in headless browser (Playwright)
 * @version 1.0.0
 * @compliance Enterprise Security, Norwegian NSM Standards
 */

import { beforeAll, afterAll, beforeEach, afterEach, describe, expect, it, vi } from 'vitest';
import { chromium, firefox, webkit, type Browser, type BrowserContext, type Page } from 'playwright';
import { join } from 'path';
import fs from 'fs-extra';
import { ComponentGenerator } from '../../generators/component.generator.js';
import { LayoutGenerator } from '../../generators/layout.generator.js';
import { PageGenerator } from '../../generators/page.generator.js';
import { TestFileSystem, PerformanceTracker } from '../test-helpers.js';

// Mock template files for testing
const MOCK_TEMPLATES = {
  'react-component.hbs': `import React from 'react';

interface {{pascalCase name}}Props {
  readonly variant?: 'primary' | 'secondary' | 'destructive';
  readonly size?: 'sm' | 'md' | 'lg';
  readonly disabled?: boolean;
  readonly children: React.ReactNode;
  readonly onClick?: () => void;
  {{#if features.accessible}}
  readonly ariaLabel?: string;
  {{/if}}
}

export const {{pascalCase name}} = ({
  variant = 'primary',
  size = 'md',
  disabled = false,
  children,
  onClick,
  {{#if features.accessible}}
  ariaLabel,
  {{/if}}
}: {{pascalCase name}}Props): JSX.Element => {
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      {{#if features.accessible}}
      aria-label={ariaLabel || '{{name}} button'}
      {{/if}}
      className={\`inline-flex items-center justify-center rounded-lg font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 \${
        size === 'sm' ? 'h-9 px-3 text-sm' :
        size === 'lg' ? 'h-14 px-8 text-lg' :
        'h-12 px-6 text-base'
      } \${
        variant === 'primary' ? 'bg-blue-600 text-white hover:bg-blue-700 focus:ring-blue-500' :
        variant === 'destructive' ? 'bg-red-600 text-white hover:bg-red-700 focus:ring-red-500' :
        'bg-gray-200 text-gray-900 hover:bg-gray-300 focus:ring-gray-500'
      } \${disabled ? 'opacity-50 cursor-not-allowed' : ''}\`}
    >
      {children}
    </button>
  );
};`,

  'react-layout.hbs': `import React from 'react';

interface {{pascalCase name}}Props {
  readonly children: React.ReactNode;
  {{#if features.sidebar}}
  readonly sidebarContent?: React.ReactNode;
  {{/if}}
  {{#if features.header}}
  readonly headerContent?: React.ReactNode;
  {{/if}}
}

export const {{pascalCase name}} = ({
  children,
  {{#if features.sidebar}}
  sidebarContent,
  {{/if}}
  {{#if features.header}}
  headerContent,
  {{/if}}
}: {{pascalCase name}}Props): JSX.Element => {
  return (
    <div className="min-h-screen bg-gray-50">
      {{#if features.header}}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center">
          {headerContent || <h1 className="text-xl font-semibold">{{name}}</h1>}
        </div>
      </header>
      {{/if}}
      
      <div className="flex">
        {{#if features.sidebar}}
        <aside className="w-64 bg-white shadow-sm">
          <div className="h-full p-4">
            {sidebarContent || (
              <nav className="space-y-2">
                <a href="#" className="block px-3 py-2 rounded-md text-sm font-medium text-gray-900 bg-gray-100">
                  Dashboard
                </a>
                <a href="#" className="block px-3 py-2 rounded-md text-sm font-medium text-gray-600 hover:text-gray-900 hover:bg-gray-50">
                  Settings
                </a>
              </nav>
            )}
          </div>
        </aside>
        {{/if}}
        
        <main className="flex-1 p-6">
          {children}
        </main>
      </div>
    </div>
  );
};`,

  'test-page.html': `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>{{title}}</title>
  <script src="https://unpkg.com/react@18/umd/react.development.js"></script>
  <script src="https://unpkg.com/react-dom@18/umd/react-dom.development.js"></script>
  <script src="https://unpkg.com/@babel/standalone/babel.min.js"></script>
  <script src="https://cdn.tailwindcss.com"></script>
  <style>
    body { margin: 0; padding: 20px; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto', sans-serif; }
    .test-container { max-width: 1200px; margin: 0 auto; }
    .component-showcase { display: grid; grid-template-columns: repeat(auto-fit, minmax(300px, 1fr)); gap: 20px; margin: 20px 0; }
    .showcase-item { padding: 20px; border: 1px solid #e5e7eb; border-radius: 8px; background: white; }
    .showcase-title { font-weight: 600; margin-bottom: 16px; color: #374151; }
  </style>
</head>
<body>
  <div id="root"></div>
  
  <script type="text/babel" id="component-script">
    {{{componentScript}}}
  </script>
  
  <script type="text/babel">
    const App = () => {
      return React.createElement('div', { className: 'test-container' }, [
        React.createElement('h1', { key: 'title' }, '{{title}} Test Page'),
        React.createElement('div', { 
          key: 'showcase', 
          className: 'component-showcase' 
        }, [
          {{{showcaseItems}}}
        ])
      ]);
    };

    const root = ReactDOM.createRoot(document.getElementById('root'));
    root.render(React.createElement(App));
  </script>
</body>
</html>`,
};

describe('Frontend Browser Integration Tests', () => {
  let browser: Browser;
  let context: BrowserContext;
  let page: Page;
  let testFs: TestFileSystem;
  let testDir: string;
  let perfTracker: PerformanceTracker;

  beforeAll(async () => {
    // Launch browser for testing
    browser = await chromium.launch({
      headless: true,
      args: ['--no-sandbox', '--disable-setuid-sandbox'],
    });
  });

  afterAll(async () => {
    await browser?.close();
  });

  beforeEach(async () => {
    testFs = new TestFileSystem();
    testDir = await testFs.createTempDir('frontend-browser-test-');
    perfTracker = new PerformanceTracker();

    // Create new browser context for each test
    context = await browser.newContext({
      viewport: { width: 1200, height: 800 },
      deviceScaleFactor: 1,
    });

    page = await context.newPage();

    // Setup mock template files
    await setupMockTemplates(testDir);

    // Mock console errors for better debugging
    page.on('console', (msg) => {
      if (msg.type() === 'error') {
        console.error('Browser console error:', msg.text());
      }
    });

    page.on('pageerror', (error) => {
      console.error('Browser page error:', error);
    });
  });

  afterEach(async () => {
    await context?.close();
    await testFs.restore();
    vi.clearAllMocks();
  });

  describe('Component Rendering Tests', () => {
    it('should render React button component correctly', async () => {
      const generator = new ComponentGenerator({
        templatePath: join(testDir, 'templates'),
        outputPath: join(testDir, 'output'),
      });

      const options = {
        name: 'TestButton',
        type: 'button',
        platform: 'react',
        features: {
          accessible: true,
          interactive: true,
        },
        styling: {
          variant: 'primary',
          size: 'md',
        },
      };

      // Generate component
      const result = await generator.generate(options);
      expect(result.success).toBe(true);

      // Create test page
      const testPageContent = await createTestPage('TestButton Component', result.files[0].content, [
        `React.createElement(TestButton, { 
          key: 'primary', 
          variant: 'primary',
          children: 'Primary Button'
        })`,
        `React.createElement(TestButton, { 
          key: 'secondary', 
          variant: 'secondary',
          children: 'Secondary Button'
        })`,
        `React.createElement(TestButton, { 
          key: 'disabled', 
          disabled: true,
          children: 'Disabled Button'
        })`,
      ]);

      const testPagePath = join(testDir, 'test-button.html');
      await fs.writeFile(testPagePath, testPageContent);

      // Load page in browser
      await page.goto(`file://${testPagePath}`);

      // Wait for React to render
      await page.waitForSelector('button', { timeout: 5000 });

      // Test button rendering
      const buttons = await page.$$('button');
      expect(buttons).toHaveLength(3);

      // Test primary button
      const primaryButton = buttons[0];
      const primaryClasses = await primaryButton.getAttribute('class');
      expect(primaryClasses).toContain('bg-blue-600');
      expect(primaryClasses).toContain('text-white');

      // Test secondary button
      const secondaryButton = buttons[1];
      const secondaryClasses = await secondaryButton.getAttribute('class');
      expect(secondaryClasses).toContain('bg-gray-200');
      expect(secondaryClasses).toContain('text-gray-900');

      // Test disabled button
      const disabledButton = buttons[2];
      const isDisabled = await disabledButton.isDisabled();
      expect(isDisabled).toBe(true);

      const disabledClasses = await disabledButton.getAttribute('class');
      expect(disabledClasses).toContain('opacity-50');
    });

    it('should handle component interactions correctly', async () => {
      const generator = new ComponentGenerator({
        templatePath: join(testDir, 'templates'),
        outputPath: join(testDir, 'output'),
      });

      const result = await generator.generate({
        name: 'InteractiveButton',
        type: 'button',
        platform: 'react',
        features: {
          interactive: true,
          accessible: true,
        },
      });

      // Create interactive test page
      const testPageContent = await createTestPage(
        'Interactive Button Test',
        result.files[0].content,
        [`React.createElement(InteractiveButton, { 
          key: 'interactive',
          onClick: () => {
            const counter = document.getElementById('click-counter');
            const count = parseInt(counter.textContent) + 1;
            counter.textContent = count;
          },
          children: 'Click Me'
        })`],
        `
        const Counter = () => React.createElement('div', {}, [
          React.createElement('p', { key: 'label' }, 'Click count: '),
          React.createElement('span', { key: 'counter', id: 'click-counter' }, '0')
        ]);
        `
      );

      const testPagePath = join(testDir, 'test-interactive.html');
      await fs.writeFile(testPagePath, testPageContent);

      await page.goto(`file://${testPagePath}`);
      await page.waitForSelector('button');

      // Test click interaction
      const button = await page.$('button');
      const counter = await page.$('#click-counter');

      // Initial state
      expect(await counter?.textContent()).toBe('0');

      // Click button multiple times
      for (let i = 1; i <= 5; i++) {
        await button?.click();
        expect(await counter?.textContent()).toBe(i.toString());
      }
    });

    it('should validate accessibility features', async () => {
      const generator = new ComponentGenerator({
        templatePath: join(testDir, 'templates'),
        outputPath: join(testDir, 'output'),
      });

      const result = await generator.generate({
        name: 'AccessibleButton',
        type: 'button',
        platform: 'react',
        features: {
          accessible: true,
        },
      });

      const testPageContent = await createTestPage(
        'Accessibility Test',
        result.files[0].content,
        [`React.createElement(AccessibleButton, { 
          key: 'accessible',
          ariaLabel: 'Custom accessibility label',
          children: 'Accessible Button'
        })`]
      );

      const testPagePath = join(testDir, 'test-accessibility.html');
      await fs.writeFile(testPagePath, testPageContent);

      await page.goto(`file://${testPagePath}`);
      await page.waitForSelector('button');

      // Test accessibility attributes
      const button = await page.$('button');
      const ariaLabel = await button?.getAttribute('aria-label');
      expect(ariaLabel).toBe('Custom accessibility label');

      // Test keyboard navigation
      await page.keyboard.press('Tab');
      const focusedElement = await page.evaluateHandle(() => document.activeElement);
      const isFocused = await page.evaluate(
        (button, focused) => button === focused,
        button,
        focusedElement
      );
      expect(isFocused).toBe(true);

      // Test focus styles
      const focusClasses = await button?.getAttribute('class');
      expect(focusClasses).toContain('focus:ring-2');
    });

    it('should render components responsively', async () => {
      const generator = new ComponentGenerator({
        templatePath: join(testDir, 'templates'),
        outputPath: join(testDir, 'output'),
      });

      const result = await generator.generate({
        name: 'ResponsiveCard',
        type: 'card',
        platform: 'react',
        features: {
          responsive: true,
        },
      });

      const testPageContent = await createTestPage(
        'Responsive Test',
        result.files[0].content,
        [`React.createElement(ResponsiveCard, { 
          key: 'responsive',
          children: 'Responsive Card Content'
        })`]
      );

      const testPagePath = join(testDir, 'test-responsive.html');
      await fs.writeFile(testPagePath, testPageContent);

      await page.goto(`file://${testPagePath}`);
      await page.waitForSelector('[class*="ResponsiveCard"]', { timeout: 5000 });

      // Test desktop layout
      await page.setViewportSize({ width: 1200, height: 800 });
      const desktopCard = await page.$('[class*="ResponsiveCard"]');
      const desktopBounds = await desktopCard?.boundingBox();
      expect(desktopBounds?.width).toBeGreaterThan(300);

      // Test tablet layout
      await page.setViewportSize({ width: 768, height: 600 });
      await page.waitForTimeout(100); // Allow layout to adjust
      const tabletCard = await page.$('[class*="ResponsiveCard"]');
      const tabletBounds = await tabletCard?.boundingBox();
      expect(tabletBounds?.width).toBeLessThan(desktopBounds?.width!);

      // Test mobile layout
      await page.setViewportSize({ width: 375, height: 667 });
      await page.waitForTimeout(100);
      const mobileCard = await page.$('[class*="ResponsiveCard"]');
      const mobileBounds = await mobileCard?.boundingBox();
      expect(mobileBounds?.width).toBeLessThan(tabletBounds?.width!);
    });
  });

  describe('Layout Rendering Tests', () => {
    it('should render admin layout correctly', async () => {
      const generator = new LayoutGenerator({
        templatePath: join(testDir, 'templates'),
        outputPath: join(testDir, 'output'),
      });

      const result = await generator.generate({
        name: 'AdminLayout',
        layoutType: 'admin',
        features: {
          sidebar: true,
          header: true,
        },
      });

      const testPageContent = await createTestPage(
        'Admin Layout Test',
        result.files[0].content,
        [`React.createElement(AdminLayout, { 
          key: 'admin-layout',
          headerContent: React.createElement('h1', {}, 'Admin Dashboard'),
          sidebarContent: React.createElement('nav', {}, 'Navigation'),
          children: React.createElement('div', { className: 'p-4' }, 'Main Content')
        })`]
      );

      const testPagePath = join(testDir, 'test-admin-layout.html');
      await fs.writeFile(testPagePath, testPageContent);

      await page.goto(`file://${testPagePath}`);

      // Wait for layout to render
      await page.waitForSelector('header');
      await page.waitForSelector('aside');
      await page.waitForSelector('main');

      // Test header
      const header = await page.$('header');
      expect(header).toBeTruthy();
      const headerText = await header?.textContent();
      expect(headerText).toContain('Admin Dashboard');

      // Test sidebar
      const sidebar = await page.$('aside');
      expect(sidebar).toBeTruthy();
      const sidebarText = await sidebar?.textContent();
      expect(sidebarText).toContain('Navigation');

      // Test main content
      const main = await page.$('main');
      expect(main).toBeTruthy();
      const mainText = await main?.textContent();
      expect(mainText).toContain('Main Content');

      // Test layout structure
      const layoutBounds = await page.evaluate(() => {
        const header = document.querySelector('header');
        const sidebar = document.querySelector('aside');
        const main = document.querySelector('main');
        
        return {
          header: header?.getBoundingClientRect(),
          sidebar: sidebar?.getBoundingClientRect(),
          main: main?.getBoundingClientRect(),
        };
      });

      expect(layoutBounds.header?.top).toBe(0); // Header at top
      expect(layoutBounds.sidebar?.left).toBe(0); // Sidebar at left
      expect(layoutBounds.main?.left).toBeGreaterThan(layoutBounds.sidebar?.width || 0); // Main content next to sidebar
    });

    it('should handle layout navigation correctly', async () => {
      const generator = new LayoutGenerator({
        templatePath: join(testDir, 'templates'),
        outputPath: join(testDir, 'output'),
      });

      const result = await generator.generate({
        name: 'NavigationLayout',
        layoutType: 'admin',
        features: {
          sidebar: true,
          navigation: true,
        },
      });

      const testPageContent = await createTestPage(
        'Navigation Layout Test',
        result.files[0].content,
        [`React.createElement(NavigationLayout, { 
          key: 'nav-layout',
          children: 'Content Area'
        })`]
      );

      const testPagePath = join(testDir, 'test-navigation.html');
      await fs.writeFile(testPagePath, testPageContent);

      await page.goto(`file://${testPagePath}`);
      await page.waitForSelector('nav');

      // Test navigation links
      const navLinks = await page.$$('nav a');
      expect(navLinks.length).toBeGreaterThan(0);

      // Test link interactions
      const firstLink = navLinks[0];
      const initialClasses = await firstLink.getAttribute('class');
      
      await firstLink.hover();
      await page.waitForTimeout(100);
      
      const hoverClasses = await firstLink.getAttribute('class');
      expect(hoverClasses).toContain('hover:');
    });
  });

  describe('Cross-Browser Compatibility', () => {
    const browsers = [
      { name: 'Chromium', browserType: chromium },
      { name: 'Firefox', browserType: firefox },
      { name: 'WebKit', browserType: webkit },
    ];

    browsers.forEach(({ name, browserType }) => {
      it(`should render correctly in ${name}`, async () => {
        const testBrowser = await browserType.launch({ headless: true });
        const testContext = await testBrowser.newContext();
        const testPage = await testContext.newPage();

        try {
          const generator = new ComponentGenerator({
            templatePath: join(testDir, 'templates'),
            outputPath: join(testDir, 'output'),
          });

          const result = await generator.generate({
            name: 'CrossBrowserButton',
            type: 'button',
            platform: 'react',
          });

          const testPageContent = await createTestPage(
            `${name} Compatibility Test`,
            result.files[0].content,
            [`React.createElement(CrossBrowserButton, { 
              key: 'cross-browser',
              children: '${name} Button'
            })`]
          );

          const testPagePath = join(testDir, `test-${name.toLowerCase()}.html`);
          await fs.writeFile(testPagePath, testPageContent);

          await testPage.goto(`file://${testPagePath}`);
          await testPage.waitForSelector('button', { timeout: 10000 });

          // Test button exists and has correct text
          const button = await testPage.$('button');
          expect(button).toBeTruthy();

          const buttonText = await button?.textContent();
          expect(buttonText).toBe(`${name} Button`);

          // Test CSS classes are applied
          const buttonClasses = await button?.getAttribute('class');
          expect(buttonClasses).toContain('inline-flex');
          expect(buttonClasses).toContain('rounded-lg');

        } finally {
          await testContext.close();
          await testBrowser.close();
        }
      });
    });
  });

  describe('Performance Testing', () => {
    it('should render components within performance budget', async () => {
      const generator = new ComponentGenerator({
        templatePath: join(testDir, 'templates'),
        outputPath: join(testDir, 'output'),
      });

      const result = await generator.generate({
        name: 'PerformanceButton',
        type: 'button',
        platform: 'react',
      });

      const testPageContent = await createTestPage(
        'Performance Test',
        result.files[0].content,
        // Create many buttons to test performance
        Array.from({ length: 100 }, (_, i) => 
          `React.createElement(PerformanceButton, { 
            key: 'perf-${i}',
            children: 'Button ${i}'
          })`
        )
      );

      const testPagePath = join(testDir, 'test-performance.html');
      await fs.writeFile(testPagePath, testPageContent);

      // Measure page load time
      const loadStartTime = Date.now();
      await page.goto(`file://${testPagePath}`);
      await page.waitForSelector('button:nth-child(100)', { timeout: 10000 });
      const loadTime = Date.now() - loadStartTime;

      expect(loadTime).toBeLessThan(5000); // Should load within 5 seconds

      // Measure interaction performance
      const interactionStartTime = Date.now();
      await page.click('button:first-child');
      const interactionTime = Date.now() - interactionStartTime;

      expect(interactionTime).toBeLessThan(100); // Should respond within 100ms

      // Test memory usage doesn't grow excessively
      const initialMemory = await page.evaluate(() => (performance as any).memory?.usedJSHeapSize || 0);
      
      // Interact with multiple buttons
      for (let i = 0; i < 50; i++) {
        await page.click(`button:nth-child(${i + 1})`);
      }

      const finalMemory = await page.evaluate(() => (performance as any).memory?.usedJSHeapSize || 0);
      const memoryIncrease = finalMemory - initialMemory;

      // Memory increase should be reasonable (less than 10MB for simple interactions)
      expect(memoryIncrease).toBeLessThan(10 * 1024 * 1024);
    });

    it('should handle large component trees efficiently', async () => {
      const generator = new LayoutGenerator({
        templatePath: join(testDir, 'templates'),
        outputPath: join(testDir, 'output'),
      });

      const result = await generator.generate({
        name: 'LargeLayout',
        layoutType: 'admin',
        features: {
          sidebar: true,
          header: true,
        },
      });

      // Create test page with nested components
      const nestedComponents = Array.from({ length: 50 }, (_, i) => 
        `React.createElement('div', { 
          key: 'nested-${i}',
          className: 'p-2 border border-gray-200 m-1'
        }, [
          React.createElement('h3', { key: 'title' }, 'Component ${i}'),
          React.createElement('p', { key: 'content' }, 'Content for component ${i}')
        ])`
      ).join(',');

      const testPageContent = await createTestPage(
        'Large Layout Test',
        result.files[0].content,
        [`React.createElement(LargeLayout, { 
          key: 'large-layout',
          children: React.createElement('div', { className: 'grid grid-cols-5 gap-2' }, [
            ${nestedComponents}
          ])
        })`]
      );

      const testPagePath = join(testDir, 'test-large-layout.html');
      await fs.writeFile(testPagePath, testPageContent);

      const renderStartTime = Date.now();
      await page.goto(`file://${testPagePath}`);
      await page.waitForSelector('div[class*="grid"]');
      const renderTime = Date.now() - renderStartTime;

      expect(renderTime).toBeLessThan(8000); // Should render within 8 seconds

      // Test scrolling performance
      const scrollStartTime = Date.now();
      await page.evaluate(() => {
        window.scrollTo(0, document.body.scrollHeight);
      });
      await page.waitForTimeout(100);
      const scrollTime = Date.now() - scrollStartTime;

      expect(scrollTime).toBeLessThan(500); // Should scroll smoothly
    });
  });

  describe('Error Handling', () => {
    it('should handle JavaScript errors gracefully', async () => {
      const generator = new ComponentGenerator({
        templatePath: join(testDir, 'templates'),
        outputPath: join(testDir, 'output'),
      });

      // Generate component with intentional error
      const result = await generator.generate({
        name: 'ErrorButton',
        type: 'button',
        platform: 'react',
      });

      // Create test page with error-inducing code
      let testPageContent = await createTestPage(
        'Error Handling Test',
        result.files[0].content,
        [`React.createElement(ErrorButton, { 
          key: 'error-button',
          onClick: () => {
            throw new Error('Intentional test error');
          },
          children: 'Error Button'
        })`]
      );

      // Add error boundary
      testPageContent = testPageContent.replace(
        'const App = () => {',
        `
        class ErrorBoundary extends React.Component {
          constructor(props) {
            super(props);
            this.state = { hasError: false };
          }
          
          static getDerivedStateFromError(error) {
            return { hasError: true };
          }
          
          componentDidCatch(error, errorInfo) {
            console.log('Error caught:', error, errorInfo);
          }
          
          render() {
            if (this.state.hasError) {
              return React.createElement('div', { 
                className: 'p-4 bg-red-100 border border-red-400 text-red-700 rounded' 
              }, 'Something went wrong.');
            }
            return this.props.children;
          }
        }
        
        const App = () => {`
      );

      testPageContent = testPageContent.replace(
        'React.createElement(\'div\', { className: \'test-container\' },',
        'React.createElement(ErrorBoundary, {}, React.createElement(\'div\', { className: \'test-container\' },'
      );

      const testPagePath = join(testDir, 'test-error-handling.html');
      await fs.writeFile(testPagePath, testPageContent);

      await page.goto(`file://${testPagePath}`);
      await page.waitForSelector('button');

      // Button should render initially
      const button = await page.$('button');
      expect(button).toBeTruthy();

      // Click button to trigger error
      let errorOccurred = false;
      page.on('pageerror', () => {
        errorOccurred = true;
      });

      await button?.click();
      await page.waitForTimeout(100);

      // Error boundary should catch the error
      const errorMessage = await page.$('div[class*="bg-red-100"]');
      expect(errorMessage).toBeTruthy();

      const errorText = await errorMessage?.textContent();
      expect(errorText).toContain('Something went wrong');
    });

    it('should handle CSS rendering failures', async () => {
      const generator = new ComponentGenerator({
        templatePath: join(testDir, 'templates'),
        outputPath: join(testDir, 'output'),
      });

      const result = await generator.generate({
        name: 'CSSErrorButton',
        type: 'button',
        platform: 'react',
      });

      // Create test page without Tailwind CSS
      const testPageContent = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>CSS Error Test</title>
  <script src="https://unpkg.com/react@18/umd/react.development.js"></script>
  <script src="https://unpkg.com/react-dom@18/umd/react-dom.development.js"></script>
  <script src="https://unpkg.com/@babel/standalone/babel.min.js"></script>
  <!-- Intentionally not loading Tailwind CSS -->
</head>
<body>
  <div id="root"></div>
  <script type="text/babel">
    ${result.files[0].content}
    
    const App = () => {
      return React.createElement('div', {}, 
        React.createElement(CSSErrorButton, { children: 'Button with Missing CSS' })
      );
    };

    const root = ReactDOM.createRoot(document.getElementById('root'));
    root.render(React.createElement(App));
  </script>
</body>
</html>`;

      const testPagePath = join(testDir, 'test-css-error.html');
      await fs.writeFile(testPagePath, testPageContent);

      await page.goto(`file://${testPagePath}`);
      await page.waitForSelector('button');

      // Component should still render even without CSS
      const button = await page.$('button');
      expect(button).toBeTruthy();

      const buttonText = await button?.textContent();
      expect(buttonText).toBe('Button with Missing CSS');

      // Button should be functional even without styles
      let clicked = false;
      await button?.evaluate((btn) => {
        btn.onclick = () => { (window as any).clicked = true; };
      });

      await button?.click();
      clicked = await page.evaluate(() => (window as any).clicked);
      expect(clicked).toBe(true);
    });
  });

  // Helper functions
  async function setupMockTemplates(baseDir: string): Promise<void> {
    const templatesDir = join(baseDir, 'templates');
    await fs.ensureDir(templatesDir);

    for (const [filename, content] of Object.entries(MOCK_TEMPLATES)) {
      await fs.writeFile(join(templatesDir, filename), content);
    }
  }

  async function createTestPage(
    title: string,
    componentCode: string,
    showcaseItems: string[],
    additionalScript: string = ''
  ): Promise<string> {
    const showcaseItemsCode = showcaseItems
      .map((item, index) => `React.createElement('div', { 
        key: 'showcase-${index}',
        className: 'showcase-item' 
      }, [
        React.createElement('div', { 
          key: 'title',
          className: 'showcase-title' 
        }, 'Variant ${index + 1}'),
        ${item}
      ])`)
      .join(',');

    return MOCK_TEMPLATES['test-page.html']
      .replace(/\{\{\{componentScript\}\}\}/g, componentCode + '\n' + additionalScript)
      .replace(/\{\{\{showcaseItems\}\}\}/g, showcaseItemsCode)
      .replace(/\{\{title\}\}/g, title);
  }
});