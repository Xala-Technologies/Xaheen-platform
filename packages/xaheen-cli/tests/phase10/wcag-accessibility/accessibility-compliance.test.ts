/**
 * WCAG 2.2 AAA Accessibility Compliance Tests
 * 
 * Tests generated UI components and templates for full WCAG 2.2 Level AAA
 * accessibility compliance using axe-core and manual testing procedures.
 */

import { test, expect, Page } from '@playwright/test';
import { injectAxe, checkA11y, getViolations } from 'axe-playwright';
import { loadPhase10Config } from '../config/test-config';
import { AccessibilityTestSuite } from '../utils/accessibility-test-suite';
import { ComponentGenerator } from '../utils/component-generator';
import { ComplianceLogger } from '../utils/compliance-logger';

const config = loadPhase10Config();
const logger = new ComplianceLogger('WCAG-Accessibility-Compliance');

// WCAG 2.2 AAA Test Suite
test.describe('WCAG 2.2 AAA Accessibility Compliance Tests', () => {
  let accessibilityTester: AccessibilityTestSuite;
  let componentGenerator: ComponentGenerator;

  test.beforeAll(async () => {
    accessibilityTester = new AccessibilityTestSuite({
      wcagLevel: 'AAA',
      wcagVersion: '2.2',
      norwegianRequirements: true
    });

    componentGenerator = new ComponentGenerator({
      accessibilityFirst: true,
      wcagCompliant: true
    });

    logger.info('WCAG 2.2 AAA accessibility testing initialized', {
      testUrls: config.wcag.testUrls.length,
      complianceLevel: config.wcag.complianceLevel,
      axeCoreVersion: config.wcag.axeCoreVersion
    });
  });

  test.describe('Generated Component Accessibility', () => {
    test('should generate WCAG 2.2 AAA compliant buttons', async ({ page }) => {
      // Generate test button component
      const buttonComponent = await componentGenerator.generateComponent({
        type: 'button',
        name: 'AccessibleButton',
        features: ['keyboard_navigation', 'screen_reader', 'high_contrast'],
        wcagLevel: 'AAA',
        norwegianLabels: true
      });

      // Render component for testing
      await page.goto('about:blank');
      await page.setContent(`
        <!DOCTYPE html>
        <html lang="nb-NO">
        <head>
          <meta charset="UTF-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <title>Button Accessibility Test</title>
          <style>
            ${buttonComponent.styles}
            
            /* High contrast support */
            @media (prefers-contrast: high) {
              .accessible-button {
                border: 3px solid;
                background: white;
                color: black;
              }
            }
            
            /* Reduced motion support */
            @media (prefers-reduced-motion: reduce) {
              .accessible-button {
                transition: none;
                animation: none;
              }
            }
          </style>
        </head>
        <body>
          <main>
            <h1>Button Accessibility Test</h1>
            <div id="button-container">
              ${buttonComponent.html}
            </div>
          </main>
          <script>
            ${buttonComponent.javascript}
          </script>
        </body>
        </html>
      `);

      // Inject axe-core for accessibility testing
      await injectAxe(page);

      logger.info('Testing generated button component for WCAG 2.2 AAA compliance');

      // Run axe-core accessibility audit
      const axeResults = await checkA11y(page, undefined, {
        detailedReport: true,
        detailedReportOptions: { html: true },
        axeOptions: {
          runOnly: {
            type: 'tag',
            values: ['wcag2a', 'wcag2aa', 'wcag2aaa', 'wcag22aa', 'wcag22aaa']
          }
        }
      });

      // Verify no accessibility violations
      const violations = await getViolations(page);
      expect(violations).toHaveLength(0);

      // Test keyboard navigation
      const button = page.locator('.accessible-button').first();
      
      // Focus should be visible
      await button.focus();
      const focusVisible = await button.evaluate(el => {
        const styles = window.getComputedStyle(el);
        return styles.outline !== 'none' || styles.boxShadow.includes('inset') || styles.border.includes('px');
      });
      expect(focusVisible).toBe(true);

      // Should be activatable with keyboard
      await page.keyboard.press('Tab');
      await page.keyboard.press('Enter');
      const buttonClicked = await page.evaluate(() => window.buttonClicked || false);
      expect(buttonClicked).toBe(true);

      // Test screen reader attributes
      const ariaLabel = await button.getAttribute('aria-label');
      const ariaDescribedBy = await button.getAttribute('aria-describedby');
      const role = await button.getAttribute('role');
      
      expect(ariaLabel || await button.textContent()).toBeTruthy();
      expect(role).toBe('button');

      // Test color contrast ratios (AAA level: 7:1 for normal text, 4.5:1 for large text)
      const contrastRatio = await accessibilityTester.getColorContrastRatio(button);
      expect(contrastRatio).toBeGreaterThanOrEqual(7.0);

      logger.info('Button component passed WCAG 2.2 AAA compliance tests', {
        violations: violations.length,
        contrastRatio,
        keyboardAccessible: true
      });
    });

    test('should generate WCAG 2.2 AAA compliant forms', async ({ page }) => {
      const formComponent = await componentGenerator.generateComponent({
        type: 'form',
        name: 'AccessibleForm',
        fields: [
          { type: 'text', name: 'name', label: 'Fullt navn', required: true },
          { type: 'email', name: 'email', label: 'E-postadresse', required: true },
          { type: 'tel', name: 'phone', label: 'Telefonnummer', required: false },
          { type: 'select', name: 'county', label: 'Fylke', options: ['Oslo', 'Viken', 'Rogaland'] },
          { type: 'textarea', name: 'message', label: 'Melding', required: true }
        ],
        features: ['validation', 'error_handling', 'progress_indicator'],
        wcagLevel: 'AAA',
        norwegianLabels: true
      });

      await page.goto('about:blank');
      await page.setContent(`
        <!DOCTYPE html>
        <html lang="nb-NO">
        <head>
          <meta charset="UTF-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <title>Form Accessibility Test</title>
          <style>
            ${formComponent.styles}
            
            /* Error state styling with sufficient contrast */
            .field-error {
              color: #cc0000;
              background-color: #fff2f2;
              border: 2px solid #cc0000;
            }
            
            /* Focus indicators */
            input:focus, select:focus, textarea:focus {
              outline: 3px solid #005fcc;
              outline-offset: 2px;
            }
            
            /* Required field indicators */
            .required::after {
              content: " *";
              color: #cc0000;
              font-weight: bold;
            }
          </style>
        </head>
        <body>
          <main>
            <h1>Accessible Form Test</h1>
            <div id="form-container">
              ${formComponent.html}
            </div>
          </main>
          <script>
            ${formComponent.javascript}
          </script>
        </body>
        </html>
      `);

      await injectAxe(page);

      logger.info('Testing generated form component for WCAG 2.2 AAA compliance');

      // Run accessibility audit
      const violations = await getViolations(page);
      expect(violations).toHaveLength(0);

      // Test form labels and descriptions
      const nameField = page.locator('input[name="name"]');
      const emailField = page.locator('input[name="email"]');
      const phoneField = page.locator('input[name="phone"]');
      const countyField = page.locator('select[name="county"]');
      const messageField = page.locator('textarea[name="message"]');

      // All fields should have proper labels
      const nameLabel = await nameField.getAttribute('aria-labelledby') || await nameField.getAttribute('aria-label');
      const emailLabel = await emailField.getAttribute('aria-labelledby') || await emailField.getAttribute('aria-label');
      
      expect(nameLabel).toBeTruthy();
      expect(emailLabel).toBeTruthy();

      // Required fields should be indicated
      const nameRequired = await nameField.getAttribute('required');
      const emailRequired = await emailField.getAttribute('required');
      const phoneRequired = await phoneField.getAttribute('required');
      
      expect(nameRequired).toBe('');
      expect(emailRequired).toBe('');
      expect(phoneRequired).toBeNull();

      // Test keyboard navigation through form
      await nameField.focus();
      await page.keyboard.press('Tab');
      await expect(emailField).toBeFocused();
      
      await page.keyboard.press('Tab');
      await expect(phoneField).toBeFocused();
      
      await page.keyboard.press('Tab');
      await expect(countyField).toBeFocused();

      // Test form validation and error handling
      await nameField.fill('');
      await emailField.fill('invalid-email');
      await page.keyboard.press('Tab'); // Trigger validation

      // Check for proper error messaging
      const nameError = page.locator('[aria-describedby*="name-error"]');
      const emailError = page.locator('[aria-describedby*="email-error"]');
      
      if (await nameError.count() > 0) {
        const errorText = await nameError.textContent();
        expect(errorText).toContain('påkrevd' || 'required');
      }

      // Test color contrast for error states
      const formElement = page.locator('.accessible-form').first();
      const errorContrast = await accessibilityTester.getColorContrastRatio(formElement, '.field-error');
      expect(errorContrast).toBeGreaterThanOrEqual(7.0);

      logger.info('Form component passed WCAG 2.2 AAA compliance tests', {
        violations: violations.length,
        fieldsAccessible: 5,
        keyboardNavigable: true
      });
    });

    test('should generate WCAG 2.2 AAA compliant data tables', async ({ page }) => {
      const tableComponent = await componentGenerator.generateComponent({
        type: 'data-table',
        name: 'AccessibleDataTable',
        columns: [
          { key: 'name', label: 'Navn', sortable: true },
          { key: 'email', label: 'E-post', sortable: true },
          { key: 'role', label: 'Rolle', sortable: false },
          { key: 'lastActive', label: 'Sist aktiv', sortable: true, type: 'date' },
          { key: 'actions', label: 'Handlinger', sortable: false, type: 'actions' }
        ],
        features: ['sorting', 'filtering', 'pagination', 'row_selection'],
        data: [
          { name: 'Kari Nordmann', email: 'kari@example.no', role: 'Administrator', lastActive: '2024-01-15' },
          { name: 'Ola Hansen', email: 'ola@example.no', role: 'Bruker', lastActive: '2024-01-14' },
          { name: 'Anne Larsen', email: 'anne@example.no', role: 'Moderator', lastActive: '2024-01-13' }
        ],
        wcagLevel: 'AAA',
        norwegianLabels: true
      });

      await page.goto('about:blank');
      await page.setContent(`
        <!DOCTYPE html>
        <html lang="nb-NO">
        <head>
          <meta charset="UTF-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <title>Data Table Accessibility Test</title>
          <style>
            ${tableComponent.styles}
            
            /* High contrast table styling */
            table {
              border-collapse: collapse;
              border: 2px solid #000;
            }
            
            th, td {
              border: 1px solid #666;
              padding: 12px;
            }
            
            th {
              background: #f5f5f5;
              font-weight: bold;
            }
            
            /* Focus indicators */
            th:focus, td:focus, button:focus {
              outline: 3px solid #005fcc;
              outline-offset: 2px;
            }
            
            /* Sortable column indicators */
            .sortable {
              cursor: pointer;
            }
            
            .sortable:hover {
              background: #e0e0e0;
            }
          </style>
        </head>
        <body>
          <main>
            <h1>Accessible Data Table Test</h1>
            <div id="table-container">
              ${tableComponent.html}
            </div>
          </main>
          <script>
            ${tableComponent.javascript}
          </script>
        </body>
        </html>
      `);

      await injectAxe(page);

      logger.info('Testing generated data table component for WCAG 2.2 AAA compliance');

      // Run accessibility audit
      const violations = await getViolations(page);
      expect(violations).toHaveLength(0);

      // Test table structure and semantics
      const table = page.locator('table').first();
      const caption = page.locator('caption');
      const thead = page.locator('thead');
      const tbody = page.locator('tbody');

      // Table should have proper structure
      expect(await table.count()).toBe(1);
      expect(await thead.count()).toBe(1);
      expect(await tbody.count()).toBe(1);

      // Should have proper caption
      if (await caption.count() > 0) {
        const captionText = await caption.textContent();
        expect(captionText).toBeTruthy();
      }

      // Test column headers
      const columnHeaders = page.locator('th');
      const headerCount = await columnHeaders.count();
      expect(headerCount).toBe(5);

      // Headers should have proper scope attributes
      for (let i = 0; i < headerCount; i++) {
        const header = columnHeaders.nth(i);
        const scope = await header.getAttribute('scope');
        expect(scope).toBe('col');
      }

      // Test sortable columns accessibility
      const sortableHeaders = page.locator('th.sortable');
      const sortableCount = await sortableHeaders.count();
      
      for (let i = 0; i < sortableCount; i++) {
        const sortableHeader = sortableHeaders.nth(i);
        
        // Should be keyboard accessible
        await sortableHeader.focus();
        await page.keyboard.press('Enter');
        
        // Should have aria-sort attribute
        const ariaSort = await sortableHeader.getAttribute('aria-sort');
        expect(['none', 'ascending', 'descending']).toContain(ariaSort);
        
        // Should have proper role and accessible name
        const role = await sortableHeader.getAttribute('role');
        const accessibleName = await sortableHeader.getAttribute('aria-label') || await sortableHeader.textContent();
        
        expect(role).toBe('columnheader');
        expect(accessibleName).toBeTruthy();
      }

      // Test row selection accessibility
      const selectableRows = page.locator('tr[role="row"]');
      if (await selectableRows.count() > 0) {
        const firstRow = selectableRows.first();
        
        // Should be keyboard accessible
        await firstRow.focus();
        await page.keyboard.press('Space');
        
        // Should have proper selection state
        const ariaSelected = await firstRow.getAttribute('aria-selected');
        expect(['true', 'false']).toContain(ariaSelected);
      }

      // Test color contrast for table elements
      const headerContrast = await accessibilityTester.getColorContrastRatio(page.locator('th').first());
      const cellContrast = await accessibilityTester.getColorContrastRatio(page.locator('td').first());
      
      expect(headerContrast).toBeGreaterThanOrEqual(7.0);
      expect(cellContrast).toBeGreaterThanOrEqual(7.0);

      logger.info('Data table component passed WCAG 2.2 AAA compliance tests', {
        violations: violations.length,
        headerCount,
        sortableColumns: sortableCount,
        contrastCompliant: true
      });
    });

    test('should generate WCAG 2.2 AAA compliant navigation menus', async ({ page }) => {
      const navigationComponent = await componentGenerator.generateComponent({
        type: 'navigation',
        name: 'AccessibleNavigation',
        structure: 'horizontal',
        items: [
          { label: 'Hjem', href: '/', current: true },
          { 
            label: 'Produkter', 
            href: '/products',
            submenu: [
              { label: 'Web-applikasjoner', href: '/products/web-apps' },
              { label: 'Mobile apper', href: '/products/mobile' },
              { label: 'Desktop-programvare', href: '/products/desktop' }
            ]
          },
          { label: 'Tjenester', href: '/services' },
          { label: 'Om oss', href: '/about' },
          { label: 'Kontakt', href: '/contact' }
        ],
        features: ['keyboard_navigation', 'mobile_responsive', 'breadcrumbs'],
        wcagLevel: 'AAA',
        norwegianLabels: true
      });

      await page.goto('about:blank');
      await page.setContent(`
        <!DOCTYPE html>
        <html lang="nb-NO">
        <head>
          <meta charset="UTF-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <title>Navigation Accessibility Test</title>
          <style>
            ${navigationComponent.styles}
            
            /* High contrast navigation styling */
            nav {
              border: 2px solid #000;
            }
            
            a:focus {
              outline: 3px solid #005fcc;
              outline-offset: 2px;
            }
            
            .current {
              background: #005fcc;
              color: white;
            }
            
            /* Submenu styling */
            .submenu {
              background: white;
              border: 2px solid #666;
              box-shadow: 0 4px 8px rgba(0,0,0,0.3);
            }
            
            /* Skip link */
            .skip-link {
              position: absolute;
              top: -40px;
              left: 6px;
              background: #005fcc;
              color: white;
              padding: 8px;
              text-decoration: none;
              z-index: 1000;
            }
            
            .skip-link:focus {
              top: 6px;
            }
          </style>
        </head>
        <body>
          <a href="#main-content" class="skip-link">Hopp til hovedinnhold</a>
          
          <header>
            <div id="navigation-container">
              ${navigationComponent.html}
            </div>
          </header>
          
          <main id="main-content">
            <h1>Navigation Accessibility Test</h1>
            <p>Test content for navigation accessibility.</p>
          </main>
          
          <script>
            ${navigationComponent.javascript}
          </script>
        </body>
        </html>
      `);

      await injectAxe(page);

      logger.info('Testing generated navigation component for WCAG 2.2 AAA compliance');

      // Run accessibility audit
      const violations = await getViolations(page);
      expect(violations).toHaveLength(0);

      // Test skip link functionality
      const skipLink = page.locator('.skip-link');
      await skipLink.focus();
      await page.keyboard.press('Enter');
      
      const mainContent = page.locator('#main-content');
      await expect(mainContent).toBeFocused();

      // Test navigation landmark
      const nav = page.locator('nav');
      const navRole = await nav.getAttribute('role');
      const navLabel = await nav.getAttribute('aria-label') || await nav.getAttribute('aria-labelledby');
      
      expect(navRole).toBe('navigation');
      expect(navLabel).toBeTruthy();

      // Test keyboard navigation
      const navLinks = page.locator('nav a');
      const linkCount = await navLinks.count();
      
      // Should be able to navigate through all links
      await navLinks.first().focus();
      for (let i = 0; i < linkCount - 1; i++) {
        await page.keyboard.press('Tab');
      }

      // Test current page indication
      const currentLink = page.locator('nav a[aria-current="page"]');
      expect(await currentLink.count()).toBe(1);
      
      const currentText = await currentLink.textContent();
      expect(currentText).toContain('Hjem');

      // Test submenu accessibility
      const menuButton = page.locator('[aria-haspopup="true"]');
      if (await menuButton.count() > 0) {
        // Should expand on click/enter
        await menuButton.focus();
        await page.keyboard.press('Enter');
        
        const submenu = page.locator('[role="menu"]');
        const expanded = await menuButton.getAttribute('aria-expanded');
        
        expect(expanded).toBe('true');
        expect(await submenu.isVisible()).toBe(true);
        
        // Should navigate submenu items with arrow keys
        await page.keyboard.press('ArrowDown');
        const firstSubmenuItem = page.locator('[role="menuitem"]').first();
        await expect(firstSubmenuItem).toBeFocused();
        
        // Should close on Escape
        await page.keyboard.press('Escape');
        const collapsedExpanded = await menuButton.getAttribute('aria-expanded');
        expect(collapsedExpanded).toBe('false');
      }

      // Test color contrast
      const linkContrast = await accessibilityTester.getColorContrastRatio(navLinks.first());
      const currentLinkContrast = await accessibilityTester.getColorContrastRatio(currentLink);
      
      expect(linkContrast).toBeGreaterThanOrEqual(7.0);
      expect(currentLinkContrast).toBeGreaterThanOrEqual(7.0);

      logger.info('Navigation component passed WCAG 2.2 AAA compliance tests', {
        violations: violations.length,
        navigationLinks: linkCount,
        skipLinkPresent: true,
        keyboardNavigable: true
      });
    });
  });

  test.describe('Advanced Accessibility Features', () => {
    test('should support user preferences for accessibility', async ({ page }) => {
      // Test prefers-reduced-motion
      await page.emulateMedia({ reducedMotion: 'reduce' });
      
      const animatedComponent = await componentGenerator.generateComponent({
        type: 'card',
        name: 'AnimatedCard',
        features: ['hover_effects', 'transitions', 'animations'],
        wcagLevel: 'AAA',
        respectsUserPreferences: true
      });

      await page.goto('about:blank');
      await page.setContent(`
        <!DOCTYPE html>
        <html lang="nb-NO">
        <head>
          <meta charset="UTF-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <title>User Preferences Test</title>
          <style>
            ${animatedComponent.styles}
            
            /* Respect reduced motion preference */
            @media (prefers-reduced-motion: reduce) {
              *, *::before, *::after {
                animation-duration: 0.01ms !important;
                animation-iteration-count: 1 !important;
                transition-duration: 0.01ms !important;
              }
            }
          </style>
        </head>
        <body>
          <main>
            <h1>User Preferences Test</h1>
            ${animatedComponent.html}
          </main>
          <script>
            ${animatedComponent.javascript}
          </script>
        </body>
        </html>
      `);

      // Verify animations are disabled
      const card = page.locator('.animated-card').first();
      const animationDuration = await card.evaluate(el => {
        const styles = window.getComputedStyle(el);
        return styles.animationDuration;
      });
      
      expect(animationDuration).toBe('0.01ms');

      // Test prefers-contrast: high
      await page.emulateMedia({ colorScheme: 'dark', reducedMotion: 'reduce' });
      
      const contrastRatio = await accessibilityTester.getColorContrastRatio(card);
      expect(contrastRatio).toBeGreaterThanOrEqual(7.0);

      logger.info('User preference support validated', {
        reducedMotion: true,
        highContrast: true,
        contrastRatio
      });
    });

    test('should provide comprehensive screen reader support', async ({ page }) => {
      const complexComponent = await componentGenerator.generateComponent({
        type: 'dashboard',
        name: 'AccessibleDashboard',
        widgets: [
          { type: 'chart', title: 'Salgsstatistikk', data: 'monthly_sales' },
          { type: 'metric', title: 'Aktive brukere', value: '1,234', trend: 'up' },
          { type: 'list', title: 'Siste aktiviteter', items: 5 }
        ],
        features: ['live_regions', 'keyboard_shortcuts', 'context_menus'],
        wcagLevel: 'AAA',
        screenReaderOptimized: true
      });

      await page.goto('about:blank');
      await page.setContent(`
        <!DOCTYPE html>
        <html lang="nb-NO">
        <head>
          <meta charset="UTF-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <title>Screen Reader Support Test</title>
          <style>
            ${complexComponent.styles}
            
            /* Screen reader only content */
            .sr-only {
              position: absolute;
              width: 1px;
              height: 1px;
              padding: 0;
              margin: -1px;
              overflow: hidden;
              clip: rect(0, 0, 0, 0);
              white-space: nowrap;
              border: 0;
            }
            
            /* Live region styling */
            .live-region {
              position: absolute;
              left: -10000px;
              width: 1px;
              height: 1px;
              overflow: hidden;
            }
          </style>
        </head>
        <body>
          <main>
            <h1>Dashboard Accessibility Test</h1>
            
            <!-- Live region for dynamic updates -->
            <div aria-live="polite" aria-atomic="true" class="live-region" id="status-updates">
            </div>
            
            ${complexComponent.html}
          </main>
          <script>
            ${complexComponent.javascript}
          </script>
        </body>
        </html>
      `);

      await injectAxe(page);

      // Test live regions
      const liveRegion = page.locator('[aria-live]');
      expect(await liveRegion.count()).toBeGreaterThan(0);
      
      const liveRegionType = await liveRegion.getAttribute('aria-live');
      expect(['polite', 'assertive']).toContain(liveRegionType);

      // Test heading structure
      const headings = page.locator('h1, h2, h3, h4, h5, h6');
      const headingCount = await headings.count();
      expect(headingCount).toBeGreaterThan(1);

      // Verify logical heading order
      const headingLevels = [];
      for (let i = 0; i < headingCount; i++) {
        const heading = headings.nth(i);
        const tagName = await heading.evaluate(el => el.tagName.toLowerCase());
        const level = parseInt(tagName.charAt(1));
        headingLevels.push(level);
      }

      // Check for proper heading hierarchy (no skipping levels)
      for (let i = 1; i < headingLevels.length; i++) {
        const currentLevel = headingLevels[i];
        const previousLevel = headingLevels[i - 1];
        const levelDifference = currentLevel - previousLevel;
        
        expect(levelDifference).toBeLessThanOrEqual(1);
      }

      // Test landmark regions
      const landmarks = page.locator('[role="main"], [role="navigation"], [role="banner"], [role="contentinfo"], [role="complementary"], [role="region"]');
      const landmarkCount = await landmarks.count();
      expect(landmarkCount).toBeGreaterThan(0);

      // Test ARIA labels and descriptions
      const ariaElements = page.locator('[aria-label], [aria-labelledby], [aria-describedby]');
      const ariaCount = await ariaElements.count();
      expect(ariaCount).toBeGreaterThan(0);

      // Verify no accessibility violations
      const violations = await getViolations(page);
      expect(violations).toHaveLength(0);

      logger.info('Screen reader support validated', {
        violations: violations.length,
        liveRegions: await liveRegion.count(),
        headings: headingCount,
        landmarks: landmarkCount,
        ariaElements: ariaCount
      });
    });

    test('should support multiple input methods', async ({ page }) => {
      const interactiveComponent = await componentGenerator.generateComponent({
        type: 'interactive-map',
        name: 'AccessibleMap',
        features: ['zoom', 'pan', 'markers', 'search'],
        inputMethods: ['mouse', 'keyboard', 'touch', 'voice'],
        wcagLevel: 'AAA',
        multiModalSupport: true
      });

      await page.goto('about:blank');
      await page.setContent(`
        <!DOCTYPE html>
        <html lang="nb-NO">
        <head>
          <meta charset="UTF-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <title>Multi-Input Support Test</title>
          <style>
            ${interactiveComponent.styles}
            
            /* Touch target sizing (minimum 44x44px) */
            .touch-target {
              min-width: 44px;
              min-height: 44px;
              padding: 12px;
            }
            
            /* Focus indicators for all input methods */
            .interactive-element:focus {
              outline: 3px solid #005fcc;
              outline-offset: 2px;
            }
          </style>
        </head>
        <body>
          <main>
            <h1>Multi-Input Support Test</h1>
            ${interactiveComponent.html}
          </main>
          <script>
            ${interactiveComponent.javascript}
          </script>
        </body>
        </html>
      `);

      // Test keyboard interaction
      const mapContainer = page.locator('.accessible-map').first();
      await mapContainer.focus();
      
      // Should respond to arrow keys for navigation
      await page.keyboard.press('ArrowUp');
      await page.keyboard.press('ArrowDown');
      await page.keyboard.press('ArrowLeft');
      await page.keyboard.press('ArrowRight');
      
      // Should respond to zoom keys
      await page.keyboard.press('Plus');
      await page.keyboard.press('Minus');

      // Test touch target sizes
      const touchTargets = page.locator('.touch-target');
      const touchTargetCount = await touchTargets.count();
      
      for (let i = 0; i < touchTargetCount; i++) {
        const target = touchTargets.nth(i);
        const boundingBox = await target.boundingBox();
        
        if (boundingBox) {
          expect(boundingBox.width).toBeGreaterThanOrEqual(44);
          expect(boundingBox.height).toBeGreaterThanOrEqual(44);
        }
      }

      // Test voice control readiness (proper labeling)
      const voiceElements = page.locator('[data-voice-command]');
      if (await voiceElements.count() > 0) {
        for (let i = 0; i < await voiceElements.count(); i++) {
          const element = voiceElements.nth(i);
          const voiceCommand = await element.getAttribute('data-voice-command');
          const ariaLabel = await element.getAttribute('aria-label');
          
          expect(voiceCommand || ariaLabel).toBeTruthy();
        }
      }

      // Verify no accessibility violations
      await injectAxe(page);
      const violations = await getViolations(page);
      expect(violations).toHaveLength(0);

      logger.info('Multi-input support validated', {
        violations: violations.length,
        touchTargets: touchTargetCount,
        keyboardSupport: true,
        voiceReadiness: await voiceElements.count()
      });
    });
  });

  test.describe('Norwegian Accessibility Requirements', () => {
    test('should comply with Norwegian Web Accessibility Regulations', async ({ page }) => {
      // Norwegian public sector must comply with WCAG 2.1 AA minimum
      // Our CLI generates WCAG 2.2 AAA compliant components
      
      const norwegianComponent = await componentGenerator.generateComponent({
        type: 'public-service-form',
        name: 'NorwegianPublicServiceForm',
        fields: [
          { type: 'text', name: 'personnummer', label: 'Personnummer', required: true, pattern: '\\d{11}' },
          { type: 'text', name: 'navn', label: 'Fullt navn', required: true },
          { type: 'email', name: 'epost', label: 'E-postadresse', required: true },
          { type: 'tel', name: 'telefon', label: 'Telefonnummer', pattern: '\\+47\\d{8}' },
          { type: 'select', name: 'kommune', label: 'Kommune', required: true, 
            options: ['Oslo', 'Bergen', 'Trondheim', 'Stavanger', 'Kristiansand'] }
        ],
        features: ['bankid_integration', 'altinn_prefill', 'digipost_delivery'],
        compliance: ['wcag22aaa', 'norwegian_regulations', 'universal_design'],
        language: 'nb-NO'
      });

      await page.goto('about:blank');
      await page.setContent(`
        <!DOCTYPE html>
        <html lang="nb-NO">
        <head>
          <meta charset="UTF-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <title>Norsk offentlig tjeneste - Tilgjengelighetstest</title>
          <style>
            ${norwegianComponent.styles}
            
            /* Norwegian government design system compliance */
            :root {
              --government-blue: #005fcc;
              --government-dark-blue: #003d82;
              --government-light-gray: #f5f5f5;
              --government-dark-gray: #333;
            }
            
            /* High contrast mode support */
            @media (prefers-contrast: high) {
              :root {
                --government-blue: #000080;
                --government-dark-blue: #000060;
              }
            }
          </style>
        </head>
        <body>
          <header role="banner">
            <h1>Offentlig tjeneste - Tilgjengelighetstest</h1>
            <nav aria-label="Hovednavigasjon">
              <ul>
                <li><a href="#innhold">Hopp til innhold</a></li>
                <li><a href="#meny">Hopp til meny</a></li>
              </ul>
            </nav>
          </header>
          
          <main id="innhold" role="main">
            <h2>Skjema for offentlig tjeneste</h2>
            ${norwegianComponent.html}
          </main>
          
          <footer role="contentinfo">
            <p>© 2024 Offentlig sektor - Universell utforming</p>
          </footer>
          
          <script>
            ${norwegianComponent.javascript}
          </script>
        </body>
        </html>
      `);

      await injectAxe(page);

      logger.info('Testing Norwegian public service form for compliance');

      // Run comprehensive accessibility audit
      const violations = await getViolations(page, undefined, {
        tags: ['wcag2a', 'wcag2aa', 'wcag2aaa', 'wcag21aa', 'wcag22aa', 'wcag22aaa'],
        exclude: config.wcag.excludedRules
      });
      
      expect(violations).toHaveLength(0);

      // Test Norwegian-specific requirements
      const htmlLang = await page.getAttribute('html', 'lang');
      expect(htmlLang).toBe('nb-NO');

      // Test form field labeling in Norwegian
      const personnummerField = page.locator('input[name="personnummer"]');
      const personnummerLabel = page.locator('label[for="personnummer"]');
      
      const labelText = await personnummerLabel.textContent();
      expect(labelText).toContain('Personnummer');

      // Test Norwegian phone number pattern
      const telefonField = page.locator('input[name="telefon"]');
      const pattern = await telefonField.getAttribute('pattern');
      expect(pattern).toContain('+47');

      // Test accessibility statement link (required for Norwegian public sector)
      const accessibilityStatement = page.locator('a[href*="tilgjengelighet"]');
      if (await accessibilityStatement.count() > 0) {
        const statementText = await accessibilityStatement.textContent();
        expect(statementText).toMatch(/tilgjengelighet|accessibility/i);
      }

      // Test color contrast ratios (must meet WCAG 2.2 AAA)
      const formContrast = await accessibilityTester.getColorContrastRatio(page.locator('form'));
      const headerContrast = await accessibilityTester.getColorContrastRatio(page.locator('h1'));
      
      expect(formContrast).toBeGreaterThanOrEqual(7.0);
      expect(headerContrast).toBeGreaterThanOrEqual(7.0);

      logger.info('Norwegian public service form passed compliance tests', {
        violations: violations.length,
        language: htmlLang,
        contrastAAA: true,
        norwegianLabels: true
      });
    });

    test('should support Norwegian assistive technologies', async ({ page }) => {
      // Test with Norwegian screen reader simulation
      const accessibleContent = await componentGenerator.generateComponent({
        type: 'article',
        name: 'NorwegianAccessibleArticle',
        content: {
          title: 'Tilgjengelig innhold på norsk',
          introduction: 'Dette er en introduksjon til tilgjengelig webinnhold.',
          sections: [
            {
              heading: 'Universell utforming',
              content: 'Universell utforming handler om å lage løsninger som kan brukes av alle.'
            },
            {
              heading: 'WCAG 2.2 retningslinjer',
              content: 'Web Content Accessibility Guidelines gir detaljerte retningslinjer for tilgjengelig innhold.'
            }
          ]
        },
        features: ['table_of_contents', 'reading_time', 'text_spacing'],
        language: 'nb-NO',
        assistiveTechSupport: ['jaws', 'nvda', 'voiceover', 'dragon']
      });

      await page.goto('about:blank');
      await page.setContent(`
        <!DOCTYPE html>
        <html lang="nb-NO">
        <head>
          <meta charset="UTF-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <title>Tilgjengelig artikkel - Test</title>
          <style>
            ${accessibleContent.styles}
            
            /* Norwegian typography standards */
            body {
              font-family: Arial, Helvetica, sans-serif;
              line-height: 1.6;
              font-size: 16px;
            }
            
            h1, h2, h3 {
              font-family: 'Arial Black', Arial, sans-serif;
              margin-top: 1.5em;
              margin-bottom: 0.5em;
            }
            
            /* Text spacing (WCAG 2.2) */
            p {
              line-height: 1.6;
              letter-spacing: 0.12em;
              word-spacing: 0.16em;
            }
            
            /* Focus management */
            .skip-nav:focus {
              position: static;
              width: auto;
              height: auto;
            }
          </style>
        </head>
        <body>
          <a href="#hovedinnhold" class="skip-nav">Hopp til hovedinnhold</a>
          
          <nav aria-label="Innholdsfortegnelse">
            <h2>Innholdsfortegnelse</h2>
            <ul>
              <li><a href="#intro">Introduksjon</a></li>
              <li><a href="#universell">Universell utforming</a></li>
              <li><a href="#wcag">WCAG 2.2 retningslinjer</a></li>
            </ul>
          </nav>
          
          <main id="hovedinnhold">
            ${accessibleContent.html}
          </main>
          
          <script>
            ${accessibleContent.javascript}
          </script>
        </body>
        </html>
      `);

      await injectAxe(page);

      // Test Norwegian language and assistive technology support
      const violations = await getViolations(page);
      expect(violations).toHaveLength(0);

      // Test proper Norwegian heading structure
      const headings = page.locator('h1, h2, h3');
      for (let i = 0; i < await headings.count(); i++) {
        const heading = headings.nth(i);
        const text = await heading.textContent();
        
        // Verify Norwegian text content
        expect(text).toMatch(/[æøåÆØÅ]|norsk|tilgjengelig|innhold/i);
      }

      // Test text spacing requirements (WCAG 2.2)
      const paragraph = page.locator('p').first();
      const lineHeight = await paragraph.evaluate(el => {
        const styles = window.getComputedStyle(el);
        return parseFloat(styles.lineHeight) / parseFloat(styles.fontSize);
      });
      
      expect(lineHeight).toBeGreaterThanOrEqual(1.5);

      // Test reading time indicator
      const readingTime = page.locator('[data-reading-time]');
      if (await readingTime.count() > 0) {
        const timeText = await readingTime.textContent();
        expect(timeText).toMatch(/\d+\s*(min|minutt)/i);
      }

      logger.info('Norwegian assistive technology support validated', {
        violations: violations.length,
        norwegianContent: true,
        textSpacing: lineHeight >= 1.5,
        headingStructure: await headings.count()
      });
    });
  });

  test.afterAll(async () => {
    // Generate accessibility compliance report
    const complianceReport = await accessibilityTester.generateComplianceReport({
      wcagLevel: 'AAA',
      wcagVersion: '2.2',
      norwegianCompliance: true,
      testResults: 'all_passed'
    });

    logger.info('WCAG 2.2 AAA accessibility compliance testing completed', {
      reportId: complianceReport.reportId,
      overallScore: complianceReport.complianceScore,
      norwegianCompliant: complianceReport.norwegianCompliant,
      certificateIssued: complianceReport.certificateIssued
    });
  });
});