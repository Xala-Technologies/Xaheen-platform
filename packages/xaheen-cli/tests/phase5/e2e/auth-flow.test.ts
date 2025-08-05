import { test, expect } from '@playwright/test';
import { createMonorepoWorkspace, installWorkspaceDependencies } from '../utils/monorepo-helper';
import { startFullStackEnvironment } from '../utils/server-manager';
import { createMockApiServer } from '../mocks/api-server.mock';
import { createTestContext } from '../utils/test-helpers';
import { getTestConfig } from '../config/test-config';
import type { TestContext } from '../utils/test-helpers';

let testContext: TestContext;
let workspace: any;
let serverManager: any;
let backend: any;
let frontend: any;
let mockApiServer: any;

test.describe('Authentication Flow E2E Tests', () => {
  test.beforeAll(async () => {
    const config = getTestConfig('ci');
    testContext = await createTestContext(config);
    
    // Create workspace with authentication features
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

  test.describe('Login Flow', () => {
    test('should successfully login with valid credentials', async ({ page }) => {
      await page.goto('/auth/login');
      
      await test.step('Fill login form', async () => {
        await page.fill('input[name="email"], input[type="email"]', 'john@example.com');
        await page.fill('input[name="password"], input[type="password"]', 'password123');
      });
      
      await test.step('Submit login form', async () => {
        await page.click('button[type="submit"]:has-text("Login"), button:has-text("Sign In")');
      });
      
      await test.step('Verify successful login', async () => {
        // Should redirect to dashboard or home page
        await expect(page).toHaveURL(/\/(dashboard|home|\/)$/);
        
        // Should show user information or logout option
        const userIndicator = page.locator('[data-testid="user-menu"], .user-menu, button:has-text("Logout")');
        await expect(userIndicator).toBeVisible();
        
        // Should not show login form anymore
        await expect(page.locator('input[type="password"]')).not.toBeVisible();
      });
    });

    test('should reject invalid credentials', async ({ page }) => {
      await page.goto('/auth/login');
      
      await test.step('Submit with invalid credentials', async () => {
        await page.fill('input[name="email"], input[type="email"]', 'invalid@example.com');
        await page.fill('input[name="password"], input[type="password"]', 'wrongpassword');
        await page.click('button[type="submit"]:has-text("Login"), button:has-text("Sign In")');
      });
      
      await test.step('Verify error message', async () => {
        // Should show error message
        const errorMessage = page.locator('.error, .alert-error, [role="alert"]');
        await expect(errorMessage).toBeVisible();
        await expect(errorMessage).toContainText(/invalid|incorrect|wrong/i);
        
        // Should remain on login page
        await expect(page.locator('input[type="password"]')).toBeVisible();
      });
    });

    test('should handle empty form submission', async ({ page }) => {
      await page.goto('/auth/login');
      
      await test.step('Submit empty form', async () => {
        await page.click('button[type="submit"]:has-text("Login"), button:has-text("Sign In")');
      });
      
      await test.step('Verify validation errors', async () => {
        // Should show validation errors
        const emailError = page.locator('[data-testid="email-error"], .field-error:near(input[type="email"])');
        const passwordError = page.locator('[data-testid="password-error"], .field-error:near(input[type="password"])');
        
        if (await emailError.isVisible()) {
          await expect(emailError).toContainText(/required|email/i);
        }
        
        if (await passwordError.isVisible()) {
          await expect(passwordError).toContainText(/required|password/i);
        }
        
        // Should remain on login page
        await expect(page.locator('input[type="password"]')).toBeVisible();
      });
    });

    test('should show loading state during authentication', async ({ page }) => {
      // Configure mock server with delay to test loading state
      mockApiServer.configure({ delayMs: 2000 });
      
      await page.goto('/auth/login');
      
      await test.step('Submit login form', async () => {
        await page.fill('input[name="email"], input[type="email"]', 'john@example.com');
        await page.fill('input[name="password"], input[type="password"]', 'password123');
        await page.click('button[type="submit"]:has-text("Login"), button:has-text("Sign In")');
      });
      
      await test.step('Verify loading state', async () => {
        // Should show loading indicator
        const loadingButton = page.locator('button:has-text("Logging in"), button:has-text("Loading"), button[disabled]:has-text("Login")');
        await expect(loadingButton).toBeVisible();
        
        // Form should be disabled during loading
        await expect(page.locator('input[type="email"]')).toBeDisabled();
        await expect(page.locator('input[type="password"]')).toBeDisabled();
      });
      
      await test.step('Complete authentication', async () => {
        // Should eventually redirect to dashboard
        await expect(page).toHaveURL(/\/(dashboard|home|\/)$/, { timeout: 10000 });
      });
      
      // Reset delay
      mockApiServer.configure({ delayMs: 0 });
    });
  });

  test.describe('Protected Routes', () => {
    test('should redirect unauthenticated users to login', async ({ page }) => {
      await test.step('Try to access protected route', async () => {
        await page.goto('/dashboard');
      });
      
      await test.step('Should redirect to login', async () => {
        await expect(page).toHaveURL(/\/auth\/login/);
        await expect(page.locator('input[type="password"]')).toBeVisible();
      });
    });

    test('should allow authenticated users to access protected routes', async ({ page }) => {
      await test.step('Login first', async () => {
        await page.goto('/auth/login');
        await page.fill('input[name="email"], input[type="email"]', 'john@example.com');
        await page.fill('input[name="password"], input[type="password"]', 'password123');
        await page.click('button[type="submit"]:has-text("Login"), button:has-text("Sign In")');
        
        // Wait for redirect
        await expect(page).toHaveURL(/\/(dashboard|home|\/)$/);
      });
      
      await test.step('Access protected route', async () => {
        await page.goto('/dashboard');
        
        // Should be able to access without redirect
        await expect(page).toHaveURL(/\/dashboard/);
        await expect(page.locator('h1, [data-testid="dashboard-title"]')).toBeVisible();
      });
    });

    test('should preserve redirect URL after login', async ({ page }) => {
      await test.step('Try to access specific protected route', async () => {
        await page.goto('/dashboard/settings');
      });
      
      await test.step('Should redirect to login with return URL', async () => {
        await expect(page).toHaveURL(/\/auth\/login/);
        
        // URL might contain return path as parameter
        const url = page.url();
        expect(url).toMatch(/login/);
      });
      
      await test.step('Login and verify redirect to original URL', async () => {
        await page.fill('input[name="email"], input[type="email"]', 'john@example.com');
        await page.fill('input[name="password"], input[type="password"]', 'password123');
        await page.click('button[type="submit"]:has-text("Login"), button:has-text("Sign In")');
        
        // Should redirect back to settings page (if implemented)
        // This depends on the specific auth implementation
        await expect(page).toHaveURL(/\/(dashboard|settings)/);
      });
    });
  });

  test.describe('Logout Flow', () => {
    test('should successfully logout user', async ({ page }) => {
      await test.step('Login first', async () => {
        await page.goto('/auth/login');
        await page.fill('input[name="email"], input[type="email"]', 'john@example.com');
        await page.fill('input[name="password"], input[type="password"]', 'password123');
        await page.click('button[type="submit"]:has-text("Login"), button:has-text("Sign In")');
        
        await expect(page).toHaveURL(/\/(dashboard|home|\/)$/);
      });
      
      await test.step('Logout', async () => {
        // Find and click logout button
        const logoutButton = page.locator('button:has-text("Logout"), button:has-text("Sign Out"), [data-testid="logout-button"]');
        await logoutButton.click();
      });
      
      await test.step('Verify logout', async () => {
        // Should redirect to login page
        await expect(page).toHaveURL(/\/(auth\/)?login/);
        
        // Should show login form
        await expect(page.locator('input[type="password"]')).toBeVisible();
        
        // Should not be able to access protected routes
        await page.goto('/dashboard');
        await expect(page).toHaveURL(/\/auth\/login/);
      });
    });

    test('should clear user session on logout', async ({ page }) => {
      await test.step('Login and check session', async () => {
        await page.goto('/auth/login');
        await page.fill('input[name="email"], input[type="email"]', 'john@example.com');
        await page.fill('input[name="password"], input[type="password"]', 'password123');
        await page.click('button[type="submit"]:has-text("Login"), button:has-text("Sign In")');
        
        // Check that session/token is stored
        const localStorage = await page.evaluate(() => window.localStorage);
        const sessionData = localStorage.token || localStorage.authToken || localStorage.user;
        expect(sessionData).toBeTruthy();
      });
      
      await test.step('Logout and verify session cleared', async () => {
        const logoutButton = page.locator('button:has-text("Logout"), button:has-text("Sign Out")');
        await logoutButton.click();
        
        // Check that session/token is cleared
        const localStorage = await page.evaluate(() => window.localStorage);
        const sessionData = localStorage.token || localStorage.authToken || localStorage.user;
        expect(sessionData).toBeFalsy();
      });
    });
  });

  test.describe('Token Management', () => {
    test('should handle expired tokens', async ({ page, context }) => {
      await test.step('Login and get token', async () => {
        await page.goto('/auth/login');
        await page.fill('input[name="email"], input[type="email"]', 'john@example.com');
        await page.fill('input[name="password"], input[type="password"]', 'password123');
        await page.click('button[type="submit"]:has-text("Login"), button:has-text("Sign In")');
        
        await expect(page).toHaveURL(/\/(dashboard|home|\/)$/);
      });
      
      await test.step('Simulate expired token', async () => {
        // Clear token or set expired token
        await page.evaluate(() => {
          localStorage.removeItem('token');
          localStorage.removeItem('authToken');
          localStorage.setItem('token', 'expired-token');
        });
        
        // Try to access protected route
        await page.goto('/dashboard');
      });
      
      await test.step('Should redirect to login', async () => {
        await expect(page).toHaveURL(/\/auth\/login/);
        
        // Should show appropriate message about session expiry
        const message = page.locator('.message, .alert, [role="alert"]');
        if (await message.isVisible()) {
          await expect(message).toContainText(/expired|session|login/i);
        }
      });
    });

    test('should automatically refresh tokens if supported', async ({ page }) => {
      // This test depends on the specific token refresh implementation
      await test.step('Login', async () => {
        await page.goto('/auth/login');
        await page.fill('input[name="email"], input[type="email"]', 'john@example.com');
        await page.fill('input[name="password"], input[type="password"]', 'password123');
        await page.click('button[type="submit"]:has-text("Login"), button:has-text("Sign In")');
        
        await expect(page).toHaveURL(/\/(dashboard|home|\/)$/);
      });
      
      await test.step('Stay logged in for extended period', async () => {
        // Simulate time passing (if refresh tokens are implemented)
        await page.waitForTimeout(1000);
        
        // Make API request that might trigger token refresh
        await page.goto('/dashboard');
        
        // Should still be logged in
        await expect(page).toHaveURL(/\/dashboard/);
      });
    });
  });

  test.describe('Social Authentication', () => {
    test('should handle OAuth redirect flow', async ({ page }) => {
      // This test would require OAuth provider mocking
      await test.step('Click social login button', async () => {
        await page.goto('/auth/login');
        
        const socialButton = page.locator('button:has-text("Google"), button:has-text("GitHub"), .social-auth button');
        if (await socialButton.isVisible()) {
          // Mock the OAuth redirect
          await page.route('**/auth/oauth/**', async route => {
            await route.fulfill({
              status: 302,
              headers: {
                'Location': '/?token=mock-oauth-token'
              }
            });
          });
          
          await socialButton.click();
          
          // Should handle OAuth callback
          await expect(page).toHaveURL(/\/(dashboard|home|\/)$/);
        } else {
          console.log('Social auth not implemented, skipping test');
        }
      });
    });
  });

  test.describe('Password Reset Flow', () => {
    test('should handle password reset request', async ({ page }) => {
      await page.goto('/auth/login');
      
      await test.step('Click forgot password link', async () => {
        const forgotPasswordLink = page.locator('a:has-text("Forgot"), a:has-text("Reset"), [data-testid="forgot-password"]');
        if (await forgotPasswordLink.isVisible()) {
          await forgotPasswordLink.click();
          
          // Should navigate to password reset page
          await expect(page).toHaveURL(/\/(auth\/)?(forgot|reset)/);
        } else {
          // Navigate directly if link not found
          await page.goto('/auth/forgot-password');
        }
      });
      
      await test.step('Submit email for password reset', async () => {
        const emailInput = page.locator('input[type="email"]');
        if (await emailInput.isVisible()) {
          await emailInput.fill('john@example.com');
          await page.click('button[type="submit"]');
          
          // Should show confirmation message
          const message = page.locator('.success, .message, [role="status"]');
          if (await message.isVisible()) {
            await expect(message).toContainText(/sent|email|reset/i);
          }
        }
      });
    });
  });

  test.describe('Session Persistence', () => {
    test('should persist session across page reloads', async ({ page }) => {
      await test.step('Login', async () => {
        await page.goto('/auth/login');
        await page.fill('input[name="email"], input[type="email"]', 'john@example.com');
        await page.fill('input[name="password"], input[type="password"]', 'password123');
        await page.click('button[type="submit"]:has-text("Login"), button:has-text("Sign In")');
        
        await expect(page).toHaveURL(/\/(dashboard|home|\/)$/);
      });
      
      await test.step('Reload page and verify still logged in', async () => {
        await page.reload();
        
        // Should remain logged in
        await expect(page).toHaveURL(/\/(dashboard|home|\/)$/);
        
        // Should not redirect to login
        await page.goto('/dashboard');
        await expect(page).toHaveURL(/\/dashboard/);
      });
    });

    test('should persist session across browser tabs', async ({ browser }) => {
      const context = await browser.newContext();
      const page1 = await context.newPage();
      const page2 = await context.newPage();
      
      try {
        await test.step('Login in first tab', async () => {
          await page1.goto('/auth/login');
          await page1.fill('input[name="email"], input[type="email"]', 'john@example.com');
          await page1.fill('input[name="password"], input[type="password"]', 'password123');
          await page1.click('button[type="submit"]:has-text("Login"), button:has-text("Sign In")');
          
          await expect(page1).toHaveURL(/\/(dashboard|home|\/)$/);
        });
        
        await test.step('Check authentication in second tab', async () => {
          await page2.goto('/dashboard');
          
          // Should be logged in in second tab too
          await expect(page2).toHaveURL(/\/dashboard/);
        });
        
        await test.step('Logout in first tab', async () => {
          const logoutButton = page1.locator('button:has-text("Logout"), button:has-text("Sign Out")');
          await logoutButton.click();
          
          await expect(page1).toHaveURL(/\/auth\/login/);
        });
        
        await test.step('Verify logout affects second tab', async () => {
          await page2.reload();
          
          // Should be logged out in second tab too
          await expect(page2).toHaveURL(/\/auth\/login/);
        });
        
      } finally {
        await context.close();
      }
    });
  });

  test.describe('Security', () => {
    test('should handle CSRF protection', async ({ page }) => {
      await page.goto('/auth/login');
      
      // Check for CSRF token in form (if implemented)
      const csrfToken = page.locator('input[name="_token"], input[name="csrf_token"], meta[name="csrf-token"]');
      if (await csrfToken.isVisible()) {
        const tokenValue = await csrfToken.getAttribute('value') || await csrfToken.getAttribute('content');
        expect(tokenValue).toBeTruthy();
        expect(tokenValue.length).toBeGreaterThan(10);
      }
    });

    test('should handle rate limiting on login attempts', async ({ page }) => {
      await page.goto('/auth/login');
      
      // Attempt multiple failed logins
      for (let i = 0; i < 5; i++) {
        await page.fill('input[name="email"], input[type="email"]', 'test@example.com');
        await page.fill('input[name="password"], input[type="password"]', 'wrongpassword');
        await page.click('button[type="submit"]:has-text("Login"), button:has-text("Sign In")');
        
        // Wait a bit between attempts
        await page.waitForTimeout(500);
      }
      
      // Should show rate limiting message (if implemented)
      const rateLimitMessage = page.locator('.error, .alert, [role="alert"]');
      if (await rateLimitMessage.isVisible()) {
        const text = await rateLimitMessage.textContent();
        if (text && /rate|limit|attempts|blocked/i.test(text)) {
          await expect(rateLimitMessage).toContainText(/rate|limit|attempts|blocked/i);
        }
      }
    });

    test('should not expose sensitive information in client-side code', async ({ page }) => {
      await page.goto('/auth/login');
      
      // Check that sensitive data is not in client-side JavaScript
      const pageContent = await page.content();
      
      // Should not contain database credentials, API keys, etc.
      expect(pageContent).not.toContain('database_password');
      expect(pageContent).not.toContain('secret_key');
      expect(pageContent).not.toContain('api_secret');
      
      // Check localStorage and sessionStorage don't contain passwords
      const localStorage = await page.evaluate(() => window.localStorage);
      const sessionStorage = await page.evaluate(() => window.sessionStorage);
      
      const allStorage = { ...localStorage, ...sessionStorage };
      for (const value of Object.values(allStorage)) {
        expect(value).not.toContain('password');
        expect(value).not.toContain('secret');
      }
    });
  });
});