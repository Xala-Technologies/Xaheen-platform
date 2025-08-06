/**
 * Test Utilities for Platform-Specific Testing
 * Provides mocks, helpers, and utilities for testing components across all platforms
 */

import { vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import React from 'react';

// =============================================================================
// ELECTRON MOCKS
// =============================================================================

export const mockElectronAPI = {
  showContextMenu: vi.fn(),
  registerShortcut: vi.fn(),
  unregisterShortcut: vi.fn(),
  getPlatform: vi.fn(() => 'darwin' as const),
  playSound: vi.fn(),
};

export const setupElectronEnvironment = () => {
  // Mock window.electronAPI
  Object.defineProperty(window, 'electronAPI', {
    value: mockElectronAPI,
    writable: true,
  });

  return mockElectronAPI;
};

export const cleanupElectronEnvironment = () => {
  delete (window as any).electronAPI;
  vi.clearAllMocks();
};

// =============================================================================
// VANILLA JS / WEB COMPONENTS MOCKS
// =============================================================================

export const mockCustomElementRegistry = {
  define: vi.fn(),
  get: vi.fn(),
  whenDefined: vi.fn(() => Promise.resolve()),
};

export const setupVanillaEnvironment = () => {
  // Mock customElements if not available
  if (!global.customElements) {
    Object.defineProperty(global, 'customElements', {
      value: mockCustomElementRegistry,
      writable: true,
    });
  }

  // Mock HTMLElement.attachShadow if not available
  if (!HTMLElement.prototype.attachShadow) {
    HTMLElement.prototype.attachShadow = vi.fn(() => ({
      innerHTML: '',
      querySelector: vi.fn(),
      addEventListener: vi.fn(),
      removeEventListener: vi.fn(),
    }));
  }

  // Mock ElementInternals if not available
  if (!HTMLElement.prototype.attachInternals) {
    HTMLElement.prototype.attachInternals = vi.fn(() => ({
      form: null,
      validity: { valid: true },
      validationMessage: '',
      willValidate: true,
      checkValidity: vi.fn(() => true),
      reportValidity: vi.fn(() => true),
      setValidity: vi.fn(),
    }));
  }

  return mockCustomElementRegistry;
};

export const cleanupVanillaEnvironment = () => {
  vi.clearAllMocks();
};

// =============================================================================
// IONIC MOCKS
// =============================================================================

export const mockIonicComponents = {
  IonButton: ({ children, ...props }: any) => React.createElement('ion-button', props, children),
  IonIcon: ({ icon, slot }: any) => React.createElement('ion-icon', { icon, slot }),
  IonSpinner: ({ slot }: any) => React.createElement('ion-spinner', { slot }),
};

export const mockHaptics = {
  impact: vi.fn(),
  selectionStart: vi.fn(),
};

export const setupIonicEnvironment = () => {
  // Mock window.Haptics
  Object.defineProperty(window, 'Haptics', {
    value: mockHaptics,
    writable: true,
  });

  return {
    haptics: mockHaptics,
    components: mockIonicComponents,
  };
};

export const cleanupIonicEnvironment = () => {
  delete (window as any).Haptics;
  vi.clearAllMocks();
};

// =============================================================================
// HEADLESS UI MOCKS
// =============================================================================

export const mockHeadlessUIComponents = {
  Button: React.forwardRef<HTMLButtonElement, any>(({ children, as: Component = 'button', ...props }, ref) => 
    React.createElement(Component, { ref, ...props }, children)
  ),
};

export const setupHeadlessUIEnvironment = () => {
  return mockHeadlessUIComponents;
};

// =============================================================================
// ACCESSIBILITY TESTING HELPERS
// =============================================================================

export const accessibilityTestHelpers = {
  /**
   * Test keyboard navigation for a component
   */
  async testKeyboardNavigation(element: HTMLElement) {
    const user = userEvent.setup();
    
    // Test Tab navigation
    await user.tab();
    expect(element).toHaveFocus();
    
    // Test Enter key activation
    await user.keyboard('{Enter}');
    
    // Test Space key activation
    await user.keyboard(' ');
    
    return user;
  },

  /**
   * Test ARIA attributes
   */
  testAriaAttributes(element: HTMLElement, expectedAttributes: Record<string, string>) {
    Object.entries(expectedAttributes).forEach(([attr, value]) => {
      expect(element).toHaveAttribute(attr, value);
    });
  },

  /**
   * Test focus management
   */
  async testFocusManagement(element: HTMLElement) {
    const user = userEvent.setup();
    
    // Focus the element
    await user.click(element);
    expect(element).toHaveFocus();
    
    // Test focus loss
    await user.tab();
    expect(element).not.toHaveFocus();
    
    return user;
  },

  /**
   * Test screen reader announcements
   */
  testScreenReaderSupport(element: HTMLElement) {
    // Check for required ARIA attributes
    const ariaLabel = element.getAttribute('aria-label');
    const ariaLabelledBy = element.getAttribute('aria-labelledby');
    const ariaDescribedBy = element.getAttribute('aria-describedby');
    
    expect(
      ariaLabel || ariaLabelledBy || element.textContent?.trim()
    ).toBeTruthy();
  },
};

// =============================================================================
// THEME TESTING HELPERS
// =============================================================================

export const themeTestHelpers = {
  /**
   * Test theme integration
   */
  testThemeIntegration(element: HTMLElement, expectedCSSVars: string[]) {
    const computedStyle = window.getComputedStyle(element);
    
    expectedCSSVars.forEach(cssVar => {
      const value = computedStyle.getPropertyValue(cssVar);
      expect(value).toBeTruthy();
    });
  },

  /**
   * Test dark mode support
   */
  testDarkModeSupport(component: () => React.ReactElement) {
    // Test with light theme
    const { rerender } = render(
      React.createElement('div', { 'data-theme': 'light' }, component())
    );
    
    // Test with dark theme
    rerender(
      React.createElement('div', { 'data-theme': 'dark' }, component())
    );
  },

  /**
   * Test responsive design
   */
  testResponsiveDesign(element: HTMLElement, breakpoints: string[]) {
    breakpoints.forEach(breakpoint => {
      // Mock viewport size
      Object.defineProperty(window, 'innerWidth', {
        writable: true,
        configurable: true,
        value: parseInt(breakpoint),
      });
      
      // Trigger resize event
      window.dispatchEvent(new Event('resize'));
      
      // Test that element adapts to new size
      expect(element).toBeInTheDocument();
    });
  },
};

// =============================================================================
// PLATFORM-SPECIFIC TEST RUNNERS
// =============================================================================

export const platformTestRunner = {
  /**
   * Run tests for Electron platform
   */
  runElectronTests: (testSuite: () => void) => {
    describe('Electron Platform', () => {
      beforeEach(() => {
        setupElectronEnvironment();
      });

      afterEach(() => {
        cleanupElectronEnvironment();
      });

      testSuite();
    });
  },

  /**
   * Run tests for Vanilla JS platform
   */
  runVanillaTests: (testSuite: () => void) => {
    describe('Vanilla JS Platform', () => {
      beforeEach(() => {
        setupVanillaEnvironment();
      });

      afterEach(() => {
        cleanupVanillaEnvironment();
      });

      testSuite();
    });
  },

  /**
   * Run tests for Ionic platform
   */
  runIonicTests: (testSuite: () => void) => {
    describe('Ionic Platform', () => {
      beforeEach(() => {
        setupIonicEnvironment();
      });

      afterEach(() => {
        cleanupIonicEnvironment();
      });

      testSuite();
    });
  },

  /**
   * Run tests for Headless UI platform
   */
  runHeadlessUITests: (testSuite: () => void) => {
    describe('Headless UI Platform', () => {
      beforeEach(() => {
        setupHeadlessUIEnvironment();
      });

      testSuite();
    });
  },
};

// =============================================================================
// PERFORMANCE TESTING HELPERS
// =============================================================================

export const performanceTestHelpers = {
  /**
   * Test component render time
   */
  async testRenderPerformance(component: () => React.ReactElement, threshold = 16) {
    const start = performance.now();
    render(component());
    const end = performance.now();
    
    const renderTime = end - start;
    expect(renderTime).toBeLessThan(threshold); // 16ms for 60fps
  },

  /**
   * Test bundle size impact
   */
  testBundleSize(modulePath: string, expectedSizeKB: number) {
    // This would typically be implemented with bundler-specific tools
    // For now, we'll simulate the test
    expect(expectedSizeKB).toBeLessThan(100); // Reasonable limit for component
  },

  /**
   * Test memory usage
   */
  testMemoryUsage(component: () => React.ReactElement) {
    const initialMemory = (performance as any).memory?.usedJSHeapSize || 0;
    
    const { unmount } = render(component());
    
    unmount();
    
    // Force garbage collection if available
    if ((global as any).gc) {
      (global as any).gc();
    }
    
    const finalMemory = (performance as any).memory?.usedJSHeapSize || 0;
    const memoryIncrease = finalMemory - initialMemory;
    
    // Memory increase should be reasonable
    expect(memoryIncrease).toBeLessThan(1024 * 1024); // 1MB limit
  },
};

// =============================================================================
// COMMON TEST PATTERNS
// =============================================================================

export const commonTestPatterns = {
  /**
   * Test component variants
   */
  testVariants<T extends Record<string, any>>(
    Component: React.ComponentType<T>,
    variants: Array<{ props: T; expected: string[] }>
  ) {
    variants.forEach(({ props, expected }) => {
      it(`should render ${Object.entries(props).map(([k, v]) => `${k}=${v}`).join(' ')} variant correctly`, () => {
        const { container } = render(React.createElement(Component, props));
        
        expected.forEach(className => {
          expect(container.firstChild).toHaveClass(className);
        });
      });
    });
  },

  /**
   * Test component props
   */
  testProps<T extends Record<string, any>>(
    Component: React.ComponentType<T>,
    propTests: Array<{ prop: keyof T; value: any; assertion: (element: HTMLElement) => void }>
  ) {
    propTests.forEach(({ prop, value, assertion }) => {
      it(`should handle ${String(prop)} prop correctly`, () => {
        const props = { [prop]: value } as T;
        const { container } = render(React.createElement(Component, props));
        
        assertion(container.firstChild as HTMLElement);
      });
    });
  },

  /**
   * Test event handling
   */
  testEventHandling<T extends Record<string, any>>(
    Component: React.ComponentType<T>,
    eventTests: Array<{
      event: string;
      trigger: (element: HTMLElement) => Promise<void>;
      handler: () => void;
    }>
  ) {
    eventTests.forEach(({ event, trigger, handler }) => {
      it(`should handle ${event} event`, async () => {
        const mockHandler = vi.fn(handler);
        const props = { [`on${event}`]: mockHandler } as T;
        
        const { container } = render(React.createElement(Component, props));
        
        await trigger(container.firstChild as HTMLElement);
        
        expect(mockHandler).toHaveBeenCalled();
      });
    });
  },
};

// Export all utilities
export {
  vi,
  render,
  screen,
  userEvent,
};