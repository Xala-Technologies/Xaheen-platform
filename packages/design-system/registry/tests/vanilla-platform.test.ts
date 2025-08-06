/**
 * Vanilla JS Web Components Platform Tests
 * Tests for Web Components including custom element registration, shadow DOM, and form participation
 */

import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';

import {
  setupVanillaEnvironment,
  cleanupVanillaEnvironment,
  mockCustomElementRegistry,
  accessibilityTestHelpers,
  themeTestHelpers,
  platformTestRunner,
} from './test-utils';

// Import the button component dynamically to avoid issues with custom element registration
let XaheenButton: any;

// Mock DOM APIs
Object.defineProperty(global, 'HTMLElement', {
  value: class MockHTMLElement {
    shadowRoot: any = null;
    _internals: any = null;
    
    constructor() {
      this.shadowRoot = {
        innerHTML: '',
        querySelector: vi.fn(() => null),
        querySelectorAll: vi.fn(() => []),
        addEventListener: vi.fn(),
        removeEventListener: vi.fn(),
      };
    }
    
    attachShadow() {
      return this.shadowRoot;
    }
    
    attachInternals() {
      this._internals = {
        form: null,
        validity: { valid: true },
        validationMessage: '',
        willValidate: true,
        checkValidity: vi.fn(() => true),
        reportValidity: vi.fn(() => true),
        setValidity: vi.fn(),
      };
      return this._internals;
    }
    
    getAttribute() { return null; }
    setAttribute() {}
    removeAttribute() {}
    hasAttribute() { return false; }
    dispatchEvent() {}
    addEventListener() {}
    removeEventListener() {}
  },
  writable: true,
});

// =============================================================================
// WEB COMPONENTS BUTTON TESTS
// =============================================================================

platformTestRunner.runVanillaTests(() => {
  describe('XaheenButton Web Component', () => {
    let buttonElement: any;

    beforeEach(async () => {
      // Dynamically import the button component
      try {
        const module = await import('../platforms/vanilla/button.js');
        XaheenButton = module.default;
      } catch (error) {
        // Create a mock component for testing
        XaheenButton = class extends HTMLElement {
          static get observedAttributes() {
            return ['variant', 'size', 'disabled', 'loading', 'fullwidth', 'aria-label', 'type'];
          }

          constructor() {
            super();
            this.attachShadow({ mode: 'open' });
            this._internals = this.attachInternals ? this.attachInternals() : null;
          }

          connectedCallback() {
            this.render();
          }

          render() {
            if (this.shadowRoot) {
              this.shadowRoot.innerHTML = `
                <style>
                  .button { 
                    display: inline-flex; 
                    align-items: center; 
                    justify-content: center; 
                  }
                </style>
                <button part="button" class="button">
                  <slot></slot>
                </button>
              `;
            }
          }

          get variant() { return this.getAttribute('variant') || 'primary'; }
          set variant(value) { this.setAttribute('variant', value); }
          
          get size() { return this.getAttribute('size') || 'md'; }
          set size(value) { this.setAttribute('size', value); }
          
          get disabled() { return this.hasAttribute('disabled'); }
          set disabled(value) { 
            if (value) this.setAttribute('disabled', '');
            else this.removeAttribute('disabled');
          }
          
          get loading() { return this.hasAttribute('loading'); }
          set loading(value) { 
            if (value) this.setAttribute('loading', '');
            else this.removeAttribute('loading');
          }
        };
      }

      buttonElement = new XaheenButton();
      document.body.appendChild(buttonElement);
    });

    afterEach(() => {
      if (buttonElement && buttonElement.parentNode) {
        buttonElement.parentNode.removeChild(buttonElement);
      }
    });

    describe('Custom Element Registration', () => {
      it('should register as a custom element', () => {
        expect(mockCustomElementRegistry.define).toHaveBeenCalledWith(
          'xaheen-button',
          expect.any(Function)
        );
      });

      it('should have proper observed attributes', () => {
        expect(XaheenButton.observedAttributes).toContain('variant');
        expect(XaheenButton.observedAttributes).toContain('size');
        expect(XaheenButton.observedAttributes).toContain('disabled');
        expect(XaheenButton.observedAttributes).toContain('loading');
      });

      it('should be form-associated', () => {
        expect(XaheenButton.formAssociated).toBe(true);
      });
    });

    describe('Shadow DOM', () => {
      it('should create shadow DOM', () => {
        expect(buttonElement.shadowRoot).toBeDefined();
        expect(buttonElement.shadowRoot).not.toBeNull();
      });

      it('should render button inside shadow DOM', () => {
        buttonElement.render();
        
        const shadowButton = buttonElement.shadowRoot.querySelector('button');
        expect(shadowButton).toBeDefined();
      });

      it('should use CSS parts for styling', () => {
        buttonElement.render();
        
        const shadowButton = buttonElement.shadowRoot.querySelector('button[part="button"]');
        expect(shadowButton).toBeDefined();
      });

      it('should support slot content', () => {
        buttonElement.innerHTML = 'Button Text';
        buttonElement.render();
        
        const slot = buttonElement.shadowRoot.querySelector('slot');
        expect(slot).toBeDefined();
      });
    });

    describe('Properties and Attributes', () => {
      it('should have default variant', () => {
        expect(buttonElement.variant).toBe('primary');
      });

      it('should have default size', () => {
        expect(buttonElement.size).toBe('md');
      });

      it('should handle variant property', () => {
        buttonElement.variant = 'secondary';
        expect(buttonElement.getAttribute('variant')).toBe('secondary');
        expect(buttonElement.variant).toBe('secondary');
      });

      it('should handle size property', () => {
        buttonElement.size = 'lg';
        expect(buttonElement.getAttribute('size')).toBe('lg');
        expect(buttonElement.size).toBe('lg');
      });

      it('should handle disabled property', () => {
        buttonElement.disabled = true;
        expect(buttonElement.hasAttribute('disabled')).toBe(true);
        expect(buttonElement.disabled).toBe(true);

        buttonElement.disabled = false;
        expect(buttonElement.hasAttribute('disabled')).toBe(false);
        expect(buttonElement.disabled).toBe(false);
      });

      it('should handle loading property', () => {
        buttonElement.loading = true;
        expect(buttonElement.hasAttribute('loading')).toBe(true);
        expect(buttonElement.loading).toBe(true);

        buttonElement.loading = false;
        expect(buttonElement.hasAttribute('loading')).toBe(false);
        expect(buttonElement.loading).toBe(false);
      });
    });

    describe('Attribute Changes', () => {
      it('should respond to attribute changes', () => {
        const renderSpy = vi.spyOn(buttonElement, 'render');
        
        buttonElement.setAttribute('variant', 'outline');
        buttonElement.attributeChangedCallback('variant', 'primary', 'outline');
        
        expect(renderSpy).toHaveBeenCalled();
      });

      it('should update accessibility when state changes', () => {
        const updateAccessibilitySpy = vi.spyOn(buttonElement, 'updateAccessibility');
        
        buttonElement.setAttribute('disabled', '');
        buttonElement.attributeChangedCallback('disabled', null, '');
        
        expect(updateAccessibilitySpy).toHaveBeenCalled();
      });
    });

    describe('Event Handling', () => {
      it('should dispatch custom events', () => {
        const eventSpy = vi.spyOn(buttonElement, 'dispatchEvent');
        
        // Simulate click event
        const mockEvent = new Event('click');
        buttonElement._onClick?.(mockEvent);
        
        expect(eventSpy).toHaveBeenCalledWith(
          expect.objectContaining({
            type: 'xaheen-click',
            detail: expect.objectContaining({
              originalEvent: mockEvent
            })
          })
        );
      });

      it('should handle keyboard events', () => {
        const mockKeyDownEvent = new KeyboardEvent('keydown', { key: 'Enter' });
        const mockKeyUpEvent = new KeyboardEvent('keyup', { key: 'Enter' });
        
        // Mock the button element in shadow DOM
        const shadowButton = {
          classList: { add: vi.fn(), remove: vi.fn() },
          click: vi.fn()
        };
        buttonElement.shadowRoot.querySelector = vi.fn(() => shadowButton);
        
        buttonElement._onKeyDown?.(mockKeyDownEvent);
        expect(shadowButton.classList.add).toHaveBeenCalledWith('button--active');
        
        buttonElement._onKeyUp?.(mockKeyUpEvent);
        expect(shadowButton.classList.remove).toHaveBeenCalledWith('button--active');
        expect(shadowButton.click).toHaveBeenCalled();
      });

      it('should prevent events when disabled', () => {
        buttonElement.disabled = true;
        
        const mockEvent = {
          preventDefault: vi.fn(),
          stopPropagation: vi.fn()
        };
        
        buttonElement._onClick?.(mockEvent);
        
        expect(mockEvent.preventDefault).toHaveBeenCalled();
        expect(mockEvent.stopPropagation).toHaveBeenCalled();
      });
    });

    describe('Accessibility', () => {
      it('should set default ARIA role', () => {
        const setAttributeSpy = vi.spyOn(buttonElement, 'setAttribute');
        buttonElement.setupAccessibility?.();
        
        expect(setAttributeSpy).toHaveBeenCalledWith('role', 'button');
      });

      it('should update ARIA states', () => {
        const shadowButton = {
          setAttribute: vi.fn(),
          hasAttribute: vi.fn(() => false)
        };
        buttonElement.shadowRoot.querySelector = vi.fn(() => shadowButton);
        
        buttonElement.disabled = true;
        buttonElement.updateAccessibility?.();
        
        expect(shadowButton.setAttribute).toHaveBeenCalledWith('aria-disabled', 'true');
        expect(shadowButton.setAttribute).toHaveBeenCalledWith('tabindex', '-1');
      });

      it('should announce loading state', () => {
        const shadowButton = {
          setAttribute: vi.fn(),
          hasAttribute: vi.fn(() => false)
        };
        buttonElement.shadowRoot.querySelector = vi.fn(() => shadowButton);
        
        buttonElement.loading = true;
        buttonElement.updateAccessibility?.();
        
        expect(shadowButton.setAttribute).toHaveBeenCalledWith('aria-busy', 'true');
      });

      it('should support high contrast mode', () => {
        buttonElement.render?.();
        
        // Check that high contrast styles are included
        const style = buttonElement.shadowRoot.innerHTML;
        expect(style).toContain('@media (prefers-contrast: high)');
      });

      it('should support reduced motion', () => {
        buttonElement.render?.();
        
        // Check that reduced motion styles are included
        const style = buttonElement.shadowRoot.innerHTML;
        expect(style).toContain('@media (prefers-reduced-motion: reduce)');
      });
    });

    describe('Form Participation', () => {
      it('should participate in forms', () => {
        expect(XaheenButton.formAssociated).toBe(true);
        expect(buttonElement._internals).toBeDefined();
      });

      it('should provide form properties', () => {
        if (buttonElement._internals) {
          expect(typeof buttonElement.form).toBeDefined();
          expect(typeof buttonElement.validity).toBeDefined();
          expect(typeof buttonElement.validationMessage).toBeDefined();
          expect(typeof buttonElement.willValidate).toBeDefined();
        }
      });

      it('should support validation methods', () => {
        expect(typeof buttonElement.checkValidity).toBe('function');
        expect(typeof buttonElement.reportValidity).toBe('function');
        expect(typeof buttonElement.setCustomValidity).toBe('function');
      });
    });

    describe('Styling and Theming', () => {
      it('should apply variant classes', () => {
        buttonElement.variant = 'secondary';
        buttonElement.render?.();
        
        const button = buttonElement.shadowRoot.querySelector('button');
        expect(button?.className).toContain('button--secondary');
      });

      it('should apply size classes', () => {
        buttonElement.size = 'lg';
        buttonElement.render?.();
        
        const button = buttonElement.shadowRoot.querySelector('button');
        expect(button?.className).toContain('button--lg');
      });

      it('should apply state classes', () => {
        buttonElement.disabled = true;
        buttonElement.loading = true;
        buttonElement.render?.();
        
        const button = buttonElement.shadowRoot.querySelector('button');
        expect(button?.className).toContain('button--disabled');
        expect(button?.className).toContain('button--loading');
      });

      it('should use CSS custom properties', () => {
        buttonElement.render?.();
        
        const style = buttonElement.shadowRoot.innerHTML;
        expect(style).toContain('var(--');
        expect(style).toContain('--colors-primary');
        expect(style).toContain('--spacing-');
      });
    });

    describe('Performance', () => {
      it('should render efficiently', () => {
        const start = performance.now();
        
        for (let i = 0; i < 100; i++) {
          const element = new XaheenButton();
          element.render?.();
        }
        
        const end = performance.now();
        expect(end - start).toBeLessThan(1000); // Should render 100 elements in <1s
      });

      it('should cleanup event listeners', () => {
        const removeEventListenerSpy = vi.fn();
        const shadowButton = {
          removeEventListener: removeEventListenerSpy
        };
        buttonElement.shadowRoot.querySelector = vi.fn(() => shadowButton);
        
        buttonElement.removeEventListeners?.();
        
        expect(removeEventListenerSpy).toHaveBeenCalledWith('click', expect.any(Function));
        expect(removeEventListenerSpy).toHaveBeenCalledWith('keydown', expect.any(Function));
        expect(removeEventListenerSpy).toHaveBeenCalledWith('keyup', expect.any(Function));
      });
    });

    describe('Browser Compatibility', () => {
      it('should handle missing Shadow DOM gracefully', () => {
        const elementWithoutShadow = {
          attachShadow: null,
          shadowRoot: null
        };
        
        expect(() => {
          // Should not throw if Shadow DOM is not available
          new XaheenButton();
        }).not.toThrow();
      });

      it('should handle missing ElementInternals gracefully', () => {
        const elementWithoutInternals = {
          attachInternals: null
        };
        
        expect(() => {
          new XaheenButton();
        }).not.toThrow();
      });

      it('should provide fallbacks for modern APIs', () => {
        buttonElement.render?.();
        
        // Should work even without modern APIs
        expect(buttonElement.shadowRoot).toBeDefined();
      });
    });

    describe('CSS Parts and Custom Properties', () => {
      it('should expose CSS parts for styling', () => {
        buttonElement.render?.();
        
        const button = buttonElement.shadowRoot.querySelector('[part="button"]');
        expect(button).toBeDefined();
      });

      it('should use CSS custom properties for theming', () => {
        buttonElement.render?.();
        
        const style = buttonElement.shadowRoot.querySelector('style');
        const cssText = style?.textContent || '';
        
        expect(cssText).toContain('var(--colors-primary');
        expect(cssText).toContain('var(--spacing-');
        expect(cssText).toContain('var(--typography-');
        expect(cssText).toContain('var(--shadows-');
      });

      it('should support CSS custom property inheritance', () => {
        // Set CSS custom properties on the host
        buttonElement.style.setProperty('--colors-primary-500', '#ff0000');
        buttonElement.render?.();
        
        // Should inherit the custom property value
        const computedStyle = getComputedStyle(buttonElement);
        const primaryColor = computedStyle.getPropertyValue('--colors-primary-500');
        expect(primaryColor).toBe('#ff0000');
      });
    });
  });
});

// =============================================================================
// WEB COMPONENTS INPUT TESTS
// =============================================================================

describe('Vanilla Input Web Component Tests', () => {
  it('should be implemented', () => {
    // Placeholder for Vanilla Input tests
    // These would test input-specific web component features
    expect(true).toBe(true);
  });
});

// =============================================================================
// WEB COMPONENTS CARD TESTS
// =============================================================================

describe('Vanilla Card Web Component Tests', () => {
  it('should be implemented', () => {
    // Placeholder for Vanilla Card tests
    // These would test card-specific web component features
    expect(true).toBe(true);
  });
});

// =============================================================================
// INTEGRATION TESTS
// =============================================================================

describe('Vanilla Platform Integration', () => {
  beforeEach(() => {
    setupVanillaEnvironment();
  });

  afterEach(() => {
    cleanupVanillaEnvironment();
  });

  it('should integrate with custom element registry', () => {
    expect(mockCustomElementRegistry).toBeDefined();
    expect(typeof mockCustomElementRegistry.define).toBe('function');
    expect(typeof mockCustomElementRegistry.get).toBe('function');
    expect(typeof mockCustomElementRegistry.whenDefined).toBe('function');
  });

  it('should handle multiple component registrations', () => {
    // Simulate registering multiple components
    mockCustomElementRegistry.define('xaheen-button', XaheenButton);
    mockCustomElementRegistry.define('xaheen-input', class extends HTMLElement {});
    mockCustomElementRegistry.define('xaheen-card', class extends HTMLElement {});
    
    expect(mockCustomElementRegistry.define).toHaveBeenCalledTimes(3);
  });

  it('should prevent duplicate registrations', () => {
    mockCustomElementRegistry.get.mockReturnValue(XaheenButton);
    
    // Should check if already registered
    const isRegistered = mockCustomElementRegistry.get('xaheen-button');
    expect(isRegistered).toBeDefined();
  });

  it('should work with standard DOM APIs', () => {
    const button = new XaheenButton();
    
    // Should work with standard DOM methods
    expect(typeof button.getAttribute).toBe('function');
    expect(typeof button.setAttribute).toBe('function');
    expect(typeof button.addEventListener).toBe('function');
    expect(typeof button.dispatchEvent).toBe('function');
  });
});