/**
 * Phase 1 E2E Tests - Next.js with Playwright
 * Tests actual browser rendering of scaffolded Next.js applications
 */

import { describe, it, expect, beforeAll, afterAll, beforeEach, afterEach } from 'vitest';
import { chromium, Browser, Page, BrowserContext } from 'playwright';
import { promises as fs } from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import tmp from 'tmp';
import { execa, execaCommand } from 'execa';
import treeKill from 'tree-kill';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const CLI_PATH = path.resolve(__dirname, '../../../dist/index.js');

// Helper to create temp directory
const createTmpDir = () => new Promise<string>((resolve, reject) => {
  tmp.dir({ unsafeCleanup: true }, (err, dirPath) => {
    if (err) reject(err);
    else resolve(dirPath);
  });
});

// Helper to wait for server to be ready
async function waitForServer(url: string, maxAttempts = 30): Promise<void> {
  for (let i = 0; i < maxAttempts; i++) {
    try {
      const response = await fetch(url);
      if (response.ok) return;
    } catch {
      // Server not ready yet
    }
    await new Promise(resolve => setTimeout(resolve, 1000));
  }
  throw new Error(`Server at ${url} did not start within ${maxAttempts} seconds`);
}

describe('Phase 1: Next.js E2E Tests with Playwright', () => {
  let browser: Browser;
  let context: BrowserContext;
  let page: Page;
  let testDir: string;
  let serverProcess: any;

  beforeAll(async () => {
    // Launch browser
    browser = await chromium.launch({
      headless: true,
      args: ['--no-sandbox', '--disable-setuid-sandbox']
    });

    // Ensure CLI is built
    await execaCommand('bun run build', { 
      cwd: path.resolve(__dirname, '../../..'),
      stdio: 'inherit'
    });
  });

  afterAll(async () => {
    await browser?.close();
  });

  beforeEach(async () => {
    context = await browser.newContext();
    page = await context.newPage();
    testDir = await createTmpDir();
  });

  afterEach(async () => {
    // Close page and context
    await page?.close();
    await context?.close();

    // Kill server process
    if (serverProcess?.pid) {
      await new Promise<void>((resolve) => {
        treeKill(serverProcess.pid, 'SIGKILL', () => {
          resolve();
        });
      });
    }

    // Clean up test directory
    await fs.rm(testDir, { recursive: true, force: true }).catch(() => {});
  });

  describe('Basic Next.js Application', () => {
    it('should render homepage correctly', async () => {
      const projectName = 'e2e-nextjs-app';
      
      // Scaffold project
      await execa('node', [
        CLI_PATH,
        'project',
        'create',
        projectName,
        '--preset=nextjs',
        '--typescript',
        '--no-install',
        '--skip-git'
      ], {
        cwd: testDir,
        env: { XAHEEN_NO_BANNER: 'true' }
      });

      const projectPath = path.join(testDir, projectName);

      // Install dependencies
      await execaCommand('bun install', { cwd: projectPath });

      // Start dev server
      serverProcess = execaCommand('bun run dev --port=4100', {
        cwd: projectPath,
        stdio: 'pipe',
      });

      // Wait for server
      await waitForServer('http://localhost:4100');

      // Navigate to page
      await page.goto('http://localhost:4100');
      await page.waitForLoadState('networkidle');

      // Test page title
      const title = await page.title();
      expect(title).toBeTruthy();

      // Test main heading
      const heading = await page.locator('h1').first();
      expect(await heading.isVisible()).toBe(true);
      
      // Take screenshot for debugging
      await page.screenshot({ 
        path: path.join(testDir, 'homepage.png'),
        fullPage: true 
      });

      // Test navigation links if present
      const links = await page.locator('a').all();
      expect(links.length).toBeGreaterThan(0);

      // Test responsive viewport
      await page.setViewportSize({ width: 375, height: 667 }); // iPhone SE
      await page.waitForTimeout(500);
      
      const mobileHeading = await page.locator('h1').first();
      expect(await mobileHeading.isVisible()).toBe(true);
    }, 60000);

    it('should handle client-side navigation', async () => {
      const projectName = 'e2e-navigation-app';
      
      // Scaffold with additional pages
      await execa('node', [
        CLI_PATH,
        'project',
        'create',
        projectName,
        '--preset=nextjs',
        '--typescript',
        '--no-install',
        '--skip-git'
      ], {
        cwd: testDir,
        env: { XAHEEN_NO_BANNER: 'true' }
      });

      const projectPath = path.join(testDir, projectName);

      // Create about page
      const aboutPageContent = `
export default function AboutPage() {
  return (
    <main className="min-h-screen p-8">
      <h1 className="text-4xl font-bold mb-4">About Us</h1>
      <p>This is the about page.</p>
      <a href="/" className="text-blue-500 hover:underline">Back to Home</a>
    </main>
  );
}`;

      await fs.mkdir(path.join(projectPath, 'src/app/about'), { recursive: true });
      await fs.writeFile(
        path.join(projectPath, 'src/app/about/page.tsx'),
        aboutPageContent
      );

      // Update home page to include navigation
      const homePageContent = `
export default function HomePage() {
  return (
    <main className="min-h-screen p-8">
      <h1 className="text-4xl font-bold mb-4">Welcome to Next.js</h1>
      <nav className="space-x-4">
        <a href="/about" className="text-blue-500 hover:underline">About</a>
      </nav>
    </main>
  );
}`;

      await fs.writeFile(
        path.join(projectPath, 'src/app/page.tsx'),
        homePageContent
      );

      // Install and start server
      await execaCommand('bun install', { cwd: projectPath });
      serverProcess = execaCommand('bun run dev --port=4101', {
        cwd: projectPath,
        stdio: 'pipe',
      });

      await waitForServer('http://localhost:4101');

      // Test navigation
      await page.goto('http://localhost:4101');
      await page.waitForLoadState('networkidle');

      // Click about link
      await page.click('a[href="/about"]');
      await page.waitForURL('**/about');
      
      // Verify about page loaded
      const aboutHeading = await page.locator('h1:has-text("About Us")');
      expect(await aboutHeading.isVisible()).toBe(true);

      // Navigate back
      await page.click('a[href="/"]');
      await page.waitForURL('http://localhost:4101/');
      
      const homeHeading = await page.locator('h1:has-text("Welcome to Next.js")');
      expect(await homeHeading.isVisible()).toBe(true);
    }, 60000);

    it('should handle form interactions', async () => {
      const projectName = 'e2e-form-app';
      
      // Scaffold project
      await execa('node', [
        CLI_PATH,
        'project',
        'create',
        projectName,
        '--preset=nextjs',
        '--typescript',
        '--no-install',
        '--skip-git'
      ], {
        cwd: testDir,
        env: { XAHEEN_NO_BANNER: 'true' }
      });

      const projectPath = path.join(testDir, projectName);

      // Create form page
      const formPageContent = `
'use client';

import { useState } from 'react';

export default function FormPage() {
  const [name, setName] = useState('');
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitted(true);
  };

  return (
    <main className="min-h-screen p-8">
      <h1 className="text-4xl font-bold mb-4">Contact Form</h1>
      
      {!submitted ? (
        <form onSubmit={handleSubmit} className="space-y-4 max-w-md">
          <div>
            <label htmlFor="name" className="block mb-2">Name:</label>
            <input
              id="name"
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full p-2 border rounded"
              required
            />
          </div>
          <button
            type="submit"
            className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
          >
            Submit
          </button>
        </form>
      ) : (
        <div className="p-4 bg-green-100 rounded">
          <p>Thank you, {name}! Form submitted successfully.</p>
        </div>
      )}
    </main>
  );
}`;

      await fs.writeFile(
        path.join(projectPath, 'src/app/page.tsx'),
        formPageContent
      );

      // Install and start server
      await execaCommand('bun install', { cwd: projectPath });
      serverProcess = execaCommand('bun run dev --port=4102', {
        cwd: projectPath,
        stdio: 'pipe',
      });

      await waitForServer('http://localhost:4102');

      // Test form interaction
      await page.goto('http://localhost:4102');
      await page.waitForLoadState('networkidle');

      // Fill form
      await page.fill('#name', 'Test User');
      
      // Submit form
      await page.click('button[type="submit"]');
      
      // Wait for success message
      await page.waitForSelector('text=Thank you, Test User!');
      
      const successMessage = await page.locator('p:has-text("Thank you, Test User!")');
      expect(await successMessage.isVisible()).toBe(true);
    }, 60000);
  });

  describe('Accessibility Testing', () => {
    it('should meet basic accessibility standards', async () => {
      const projectName = 'e2e-a11y-app';
      
      // Scaffold project
      await execa('node', [
        CLI_PATH,
        'project',
        'create',
        projectName,
        '--preset=nextjs',
        '--typescript',
        '--accessibility',
        '--no-install',
        '--skip-git'
      ], {
        cwd: testDir,
        env: { XAHEEN_NO_BANNER: 'true' }
      });

      const projectPath = path.join(testDir, projectName);

      // Install dependencies
      await execaCommand('bun install', { cwd: projectPath });

      // Start server
      serverProcess = execaCommand('bun run dev --port=4103', {
        cwd: projectPath,
        stdio: 'pipe',
      });

      await waitForServer('http://localhost:4103');

      // Navigate to page
      await page.goto('http://localhost:4103');
      await page.waitForLoadState('networkidle');

      // Test keyboard navigation
      await page.keyboard.press('Tab');
      const firstFocusedElement = await page.evaluate(() => document.activeElement?.tagName);
      expect(firstFocusedElement).toBeTruthy();

      // Test for proper heading structure
      const h1Count = await page.locator('h1').count();
      expect(h1Count).toBe(1); // Should have exactly one h1

      // Test for alt text on images (if any)
      const images = await page.locator('img').all();
      for (const img of images) {
        const alt = await img.getAttribute('alt');
        expect(alt).toBeTruthy();
      }

      // Test for proper form labels
      const inputs = await page.locator('input').all();
      for (const input of inputs) {
        const id = await input.getAttribute('id');
        if (id) {
          const label = await page.locator(`label[for="${id}"]`).count();
          expect(label).toBeGreaterThan(0);
        }
      }

      // Test color contrast (basic check)
      const bodyBgColor = await page.evaluate(() => 
        window.getComputedStyle(document.body).backgroundColor
      );
      const bodyTextColor = await page.evaluate(() => 
        window.getComputedStyle(document.body).color
      );
      
      expect(bodyBgColor).not.toBe(bodyTextColor);
    }, 60000);
  });

  describe('Performance Testing', () => {
    it('should load within performance budget', async () => {
      const projectName = 'e2e-perf-app';
      
      // Scaffold and build production version
      await execa('node', [
        CLI_PATH,
        'project',
        'create',
        projectName,
        '--preset=nextjs',
        '--typescript',
        '--no-install',
        '--skip-git'
      ], {
        cwd: testDir,
        env: { XAHEEN_NO_BANNER: 'true' }
      });

      const projectPath = path.join(testDir, projectName);

      // Install and build
      await execaCommand('bun install', { cwd: projectPath });
      await execaCommand('bun run build', { cwd: projectPath });

      // Start production server
      serverProcess = execaCommand('bun run start -- --port 4104', {
        cwd: projectPath,
        stdio: 'pipe',
      });

      await waitForServer('http://localhost:4104');

      // Measure performance
      await page.goto('http://localhost:4104');
      
      const performanceTiming = await page.evaluate(() => {
        const timing = performance.timing;
        return {
          domContentLoaded: timing.domContentLoadedEventEnd - timing.navigationStart,
          loadComplete: timing.loadEventEnd - timing.navigationStart,
        };
      });

      // Check performance metrics
      expect(performanceTiming.domContentLoaded).toBeLessThan(3000); // 3 seconds
      expect(performanceTiming.loadComplete).toBeLessThan(5000); // 5 seconds

      // Check for Web Vitals
      const webVitals = await page.evaluate(() => {
        return new Promise((resolve) => {
          let metrics: any = {};
          
          // First Contentful Paint
          const fcpObserver = new PerformanceObserver((list) => {
            const entries = list.getEntries();
            entries.forEach((entry) => {
              if (entry.name === 'first-contentful-paint') {
                metrics.fcp = entry.startTime;
              }
            });
          });
          fcpObserver.observe({ entryTypes: ['paint'] });

          // Resolve after a short delay to collect metrics
          setTimeout(() => resolve(metrics), 1000);
        });
      });

      if (webVitals.fcp) {
        expect(webVitals.fcp).toBeLessThan(2500); // 2.5 seconds for FCP
      }
    }, 90000);
  });
});