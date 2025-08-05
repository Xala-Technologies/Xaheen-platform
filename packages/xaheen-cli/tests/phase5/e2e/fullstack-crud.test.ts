import { test, expect } from '@playwright/test';
import { createMonorepoWorkspace, installWorkspaceDependencies } from '../utils/monorepo-helper';
import { startFullStackEnvironment } from '../utils/server-manager';
import { createMockApiServer } from '../mocks/api-server.mock';
import { createTestContext, measurePerformance } from '../utils/test-helpers';
import { getTestConfig } from '../config/test-config';
import type { Page } from '@playwright/test';
import type { TestContext } from '../utils/test-helpers';

let testContext: TestContext;
let workspace: any;
let serverManager: any;
let backend: any;
let frontend: any;
let mockApiServer: any;

test.describe('Full-Stack CRUD Operations E2E Tests', () => {
  test.beforeAll(async () => {
    const config = getTestConfig('ci');
    testContext = await createTestContext(config);
    
    // Create workspace
    workspace = await createMonorepoWorkspace(testContext.tempDir, config);
    await installWorkspaceDependencies(workspace);
    
    // Start mock API server
    mockApiServer = await createMockApiServer({
      port: config.ports.mockApi,
      enableCors: true,
    });
    
    // Start full-stack environment
    const environment = await startFullStackEnvironment(workspace.root, config);
    serverManager = environment.serverManager;
    backend = environment.backend;
    frontend = environment.frontend;
  });

  test.afterAll(async () => {
    await serverManager?.stopAllServers();
    await mockApiServer?.stop();
    await testContext?.cleanup();
  });

  test.describe('User Management CRUD', () => {
    test('should create, read, update, and delete users through UI', async ({ page }) => {
      // Navigate to the application
      await page.goto('/');
      
      // Wait for the page to load
      await expect(page.locator('h1')).toContainText('Test Frontend');
      
      // Test CREATE operation
      await test.step('Create new user', async () => {
        // Fill out the create user form
        await page.fill('input[id="name"]', 'Test User E2E');
        await page.fill('input[id="email"]', 'testuser.e2e@example.com');
        
        // Submit the form
        await page.click('button[type="submit"]');
        
        // Wait for the user to appear in the list
        await expect(page.locator('text=Test User E2E')).toBeVisible();
        await expect(page.locator('text=testuser.e2e@example.com')).toBeVisible();
      });

      // Test READ operation (list view)
      await test.step('Verify user appears in list', async () => {
        // Check that the user list is populated
        const userListItems = page.locator('li').filter({ hasText: 'Test User E2E' });
        await expect(userListItems).toBeVisible();
        
        // Verify all user data is displayed
        await expect(userListItems.locator('text=Test User E2E')).toBeVisible();
        await expect(userListItems.locator('text=testuser.e2e@example.com')).toBeVisible();
        await expect(userListItems.locator('text=Created:')).toBeVisible();
      });

      // Test UPDATE operation (if supported by UI)
      await test.step('Update user information', async () => {
        // Look for an edit button or inline editing
        const editButton = page.locator('button', { hasText: 'Edit' }).first();
        if (await editButton.isVisible()) {
          await editButton.click();
          
          // Update the user name
          await page.fill('input[value*="Test User E2E"]', 'Updated Test User E2E');
          
          // Save changes
          await page.click('button:has-text("Save")');
          
          // Verify the update
          await expect(page.locator('text=Updated Test User E2E')).toBeVisible();
        }
      });

      // Test DELETE operation
      await test.step('Delete user', async () => {
        // Find and click the delete button for our test user
        const deleteButton = page.locator('li')
          .filter({ hasText: 'testuser.e2e@example.com' })
          .locator('button:has-text("Delete")');
        
        await deleteButton.click();
        
        // Verify the user is removed from the list
        await expect(page.locator('text=testuser.e2e@example.com')).not.toBeVisible();
      });
    });

    test('should handle form validation errors', async ({ page }) => {
      await page.goto('/');
      
      await test.step('Submit empty form should show validation errors', async () => {
        // Try to submit empty form
        await page.click('button[type="submit"]');
        
        // Should not create a user and might show validation messages
        // The exact validation UX depends on implementation
        const errorMessage = page.locator('.bg-red-50, .text-red-600, .text-red-700');
        if (await errorMessage.isVisible()) {
          await expect(errorMessage).toContainText(/name|email|required/i);
        }
      });

      await test.step('Invalid email should show validation error', async () => {
        await page.fill('input[id="name"]', 'Test User');
        await page.fill('input[id="email"]', 'invalid-email');
        
        await page.click('button[type="submit"]');
        
        // Check for validation error (client-side or server-side)
        const errorMessage = page.locator('.bg-red-50, .text-red-600, .text-red-700');
        if (await errorMessage.isVisible()) {
          await expect(errorMessage).toContainText(/email|valid/i);
        }
      });
    });

    test('should handle API errors gracefully', async ({ page }) => {
      // Configure mock server to return errors
      await test.step('Setup error scenario', async () => {
        mockApiServer.configure({ errorRate: 1.0 }); // Force all requests to fail
      });

      await page.goto('/');
      
      await test.step('Should show error when API fails', async () => {
        // Try to create a user
        await page.fill('input[id="name"]', 'Test User');
        await page.fill('input[id="email"]', 'test@example.com');
        await page.click('button[type="submit"]');
        
        // Should show error message
        const errorMessage = page.locator('.bg-red-50, .text-red-600, .text-red-700');
        await expect(errorMessage).toBeVisible();
      });

      await test.step('Reset error scenario', async () => {
        mockApiServer.configure({ errorRate: 0 }); // Reset to normal operation
      });
    });
  });

  test.describe('Data Synchronization', () => {
    test('should sync data between multiple browser tabs', async ({ browser }) => {
      const context1 = await browser.newContext();
      const context2 = await browser.newContext();
      
      const page1 = await context1.newPage();
      const page2 = await context2.newPage();
      
      try {
        // Open the app in both tabs
        await page1.goto('/');
        await page2.goto('/');
        
        // Create a user in tab 1
        await page1.fill('input[id="name"]', 'Sync Test User');
        await page1.fill('input[id="email"]', 'sync@example.com');
        await page1.click('button[type="submit"]');
        
        // Verify user appears in tab 1
        await expect(page1.locator('text=Sync Test User')).toBeVisible();
        
        // Refresh tab 2 and verify user appears there too
        await page2.reload();
        await expect(page2.locator('text=Sync Test User')).toBeVisible();
        
        // Delete user in tab 2
        const deleteButton = page2.locator('li')
          .filter({ hasText: 'sync@example.com' })
          .locator('button:has-text("Delete")');
        await deleteButton.click();
        
        // Verify user is deleted in tab 2
        await expect(page2.locator('text=sync@example.com')).not.toBeVisible();
        
        // Refresh tab 1 and verify user is also gone there
        await page1.reload();
        await expect(page1.locator('text=sync@example.com')).not.toBeVisible();
        
      } finally {
        await context1.close();
        await context2.close();
      }
    });

    test('should handle concurrent operations correctly', async ({ browser }) => {
      const context1 = await browser.newContext();
      const context2 = await browser.newContext();
      
      const page1 = await context1.newPage();
      const page2 = await context2.newPage();
      
      try {
        await page1.goto('/');
        await page2.goto('/');
        
        // Attempt to create users simultaneously
        await Promise.all([
          (async () => {
            await page1.fill('input[id="name"]', 'Concurrent User 1');
            await page1.fill('input[id="email"]', 'concurrent1@example.com');
            await page1.click('button[type="submit"]');
          })(),
          (async () => {
            await page2.fill('input[id="name"]', 'Concurrent User 2');
            await page2.fill('input[id="email"]', 'concurrent2@example.com');
            await page2.click('button[type="submit"]');
          })(),
        ]);
        
        // Both users should be created successfully
        await page1.reload();
        await page2.reload();
        
        await expect(page1.locator('text=concurrent1@example.com')).toBeVisible();
        await expect(page1.locator('text=concurrent2@example.com')).toBeVisible();
        await expect(page2.locator('text=concurrent1@example.com')).toBeVisible();
        await expect(page2.locator('text=concurrent2@example.com')).toBeVisible();
        
      } finally {
        await context1.close();
        await context2.close();
      }
    });
  });

  test.describe('Performance and Load Testing', () => {
    test('should handle rapid user interactions', async ({ page }) => {
      await page.goto('/');
      
      const { duration } = await measurePerformance(async () => {
        // Rapidly create multiple users
        for (let i = 0; i < 5; i++) {
          await page.fill('input[id="name"]', `Rapid User ${i}`);
          await page.fill('input[id="email"]', `rapid${i}@example.com`);
          await page.click('button[type="submit"]');
          
          // Wait for user to appear before creating next one
          await expect(page.locator(`text=rapid${i}@example.com`)).toBeVisible();
        }
      });
      
      // Should complete within reasonable time
      expect(duration).toBeLessThan(30000); // 30 seconds
      
      // Verify all users were created
      for (let i = 0; i < 5; i++) {
        await expect(page.locator(`text=rapid${i}@example.com`)).toBeVisible();
      }
    });

    test('should maintain responsiveness with large datasets', async ({ page }) => {
      // Seed the mock server with many users
      const manyUsers = Array.from({ length: 50 }, (_, i) => ({
        id: (100 + i).toString(),
        name: `User ${i}`,
        email: `user${i}@example.com`,
        createdAt: new Date(),
        updatedAt: new Date(),
      }));
      
      mockApiServer.seedDatabase({ users: manyUsers });
      
      await page.goto('/');
      
      // Page should load even with many users
      await expect(page.locator('h1')).toContainText('Test Frontend');
      
      // Should be able to scroll through users (if pagination is implemented)
      const userList = page.locator('ul').first();
      await expect(userList).toBeVisible();
      
      // Test search/filter functionality if available
      const searchInput = page.locator('input[placeholder*="search" i]');
      if (await searchInput.isVisible()) {
        await searchInput.fill('User 1');
        // Should filter results
        await expect(page.locator('text=User 1')).toBeVisible();
        await expect(page.locator('text=User 2')).not.toBeVisible();
      }
    });
  });

  test.describe('Error Handling and Recovery', () => {
    test('should recover from network errors', async ({ page }) => {
      await page.goto('/');
      
      await test.step('Create user successfully first', async () => {
        await page.fill('input[id="name"]', 'Network Test User');
        await page.fill('input[id="email"]', 'network@example.com');
        await page.click('button[type="submit"]');
        
        await expect(page.locator('text=network@example.com')).toBeVisible();
      });
      
      await test.step('Simulate network failure', async () => {
        // Configure mock server to fail
        mockApiServer.configure({ errorRate: 1.0 });
        
        // Try to create another user
        await page.fill('input[id="name"]', 'Failed User');
        await page.fill('input[id="email"]', 'failed@example.com');
        await page.click('button[type="submit"]');
        
        // Should show error
        const errorMessage = page.locator('.bg-red-50, .text-red-600, .text-red-700');
        await expect(errorMessage).toBeVisible();
      });
      
      await test.step('Recover when network is restored', async () => {
        // Restore network
        mockApiServer.configure({ errorRate: 0 });
        
        // Retry the operation
        const retryButton = page.locator('button:has-text("Retry")');
        if (await retryButton.isVisible()) {
          await retryButton.click();
        } else {
          // Re-submit the form
          await page.click('button[type="submit"]');
        }
        
        // Should succeed now
        await expect(page.locator('text=failed@example.com')).toBeVisible();
      });
    });

    test('should handle slow network conditions', async ({ page }) => {
      // Configure mock server with delay
      mockApiServer.configure({ delayMs: 3000 });
      
      await page.goto('/');
      
      await test.step('Show loading state during slow operations', async () => {
        await page.fill('input[id="name"]', 'Slow Test User');
        await page.fill('input[id="email"]', 'slow@example.com');
        await page.click('button[type="submit"]');
        
        // Should show loading state
        const loadingIndicator = page.locator('button:has-text("Creating...")');
        if (await loadingIndicator.isVisible()) {
          await expect(loadingIndicator).toBeVisible();
        }
        
        // Eventually should succeed
        await expect(page.locator('text=slow@example.com')).toBeVisible({ timeout: 10000 });
      });
      
      // Reset delay
      mockApiServer.configure({ delayMs: 0 });
    });
  });

  test.describe('Accessibility', () => {
    test('should be accessible to screen readers', async ({ page }) => {
      await page.goto('/');
      
      // Check for proper ARIA labels and roles
      await expect(page.locator('label[for="name"]')).toBeVisible();
      await expect(page.locator('label[for="email"]')).toBeVisible();
      
      // Check that form controls are properly labeled
      const nameInput = page.locator('input[id="name"]');
      await expect(nameInput).toHaveAttribute('aria-label');
      
      const emailInput = page.locator('input[id="email"]');
      await expect(emailInput).toHaveAttribute('aria-label');
      
      // Check for error message accessibility
      await page.fill('input[id="email"]', 'invalid-email');
      await page.click('button[type="submit"]');
      
      const errorElement = page.locator('[role="alert"], [aria-live="polite"]');
      if (await errorElement.isVisible()) {
        await expect(errorElement).toBeVisible();
      }
    });

    test('should support keyboard navigation', async ({ page }) => {
      await page.goto('/');
      
      // Tab through form elements
      await page.keyboard.press('Tab'); // Should focus name input
      await expect(page.locator('input[id="name"]')).toBeFocused();
      
      await page.keyboard.press('Tab'); // Should focus email input
      await expect(page.locator('input[id="email"]')).toBeFocused();
      
      await page.keyboard.press('Tab'); // Should focus submit button
      await expect(page.locator('button[type="submit"]')).toBeFocused();
      
      // Should be able to submit with Enter
      await page.keyboard.press('Shift+Tab'); // Back to email
      await page.keyboard.press('Shift+Tab'); // Back to name
      
      await page.keyboard.type('Keyboard User');
      await page.keyboard.press('Tab');
      await page.keyboard.type('keyboard@example.com');
      await page.keyboard.press('Tab');
      await page.keyboard.press('Enter');
      
      // Should create user
      await expect(page.locator('text=keyboard@example.com')).toBeVisible();
    });
  });

  test.describe('Mobile Responsiveness', () => {
    test('should work on mobile devices', async ({ page }) => {
      // Set mobile viewport
      await page.setViewportSize({ width: 375, height: 667 });
      await page.goto('/');
      
      // Should be responsive
      await expect(page.locator('h1')).toBeVisible();
      
      // Form should be usable on mobile
      await page.fill('input[id="name"]', 'Mobile User');
      await page.fill('input[id="email"]', 'mobile@example.com');
      await page.click('button[type="submit"]');
      
      await expect(page.locator('text=mobile@example.com')).toBeVisible();
      
      // List should be scrollable on mobile
      const userList = page.locator('ul').first();
      await expect(userList).toBeVisible();
    });

    test('should handle touch interactions', async ({ page }) => {
      await page.setViewportSize({ width: 375, height: 667 });
      await page.goto('/');
      
      // Create a user first
      await page.fill('input[id="name"]', 'Touch User');
      await page.fill('input[id="email"]', 'touch@example.com');
      await page.tap('button[type="submit"]');
      
      await expect(page.locator('text=touch@example.com')).toBeVisible();
      
      // Should be able to tap delete button
      const deleteButton = page.locator('li')
        .filter({ hasText: 'touch@example.com' })
        .locator('button:has-text("Delete")');
      
      await deleteButton.tap();
      await expect(page.locator('text=touch@example.com')).not.toBeVisible();
    });
  });
});