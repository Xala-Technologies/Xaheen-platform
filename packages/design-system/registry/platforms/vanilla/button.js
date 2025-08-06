/**
 * Button Component - Vanilla JS/Web Components Implementation
 * Generated from universal button specification
 * WCAG AAA compliant with full keyboard and screen reader support
 */

import { UniversalTokens } from '../../core/universal-tokens.js';
import { ButtonSpec } from '../../core/component-specs.js';

// =============================================================================
// CSS CUSTOM PROPERTIES FROM TOKENS
// =============================================================================

const cssVariables = UniversalTokens.converters.toCSSVariables({
  colors: UniversalTokens.colors,
  spacing: UniversalTokens.spacing,
  typography: UniversalTokens.typography,
  shadows: UniversalTokens.shadows,
  borders: UniversalTokens.borders,
  animations: UniversalTokens.animations
});

// =============================================================================
// BUTTON WEB COMPONENT
// =============================================================================

class XaheenButton extends HTMLElement {
  static get observedAttributes() {
    return ['variant', 'size', 'disabled', 'loading', 'fullwidth', 'aria-label', 'type'];
  }

  constructor() {
    super();
    this.attachShadow({ mode: 'open' });
    this._internals = this.attachInternals ? this.attachInternals() : null;
    this._onClick = this._onClick.bind(this);
    this._onKeyDown = this._onKeyDown.bind(this);
    this._onKeyUp = this._onKeyUp.bind(this);
  }

  // =============================================================================
  // LIFECYCLE METHODS
  // =============================================================================

  connectedCallback() {
    this.render();
    this.setupEventListeners();
    this.setupAccessibility();
  }

  disconnectedCallback() {
    this.removeEventListeners();
  }

  attributeChangedCallback(name, oldValue, newValue) {
    if (oldValue !== newValue) {
      this.render();
      if (name === 'disabled' || name === 'loading') {
        this.updateAccessibility();
      }
    }
  }

  // =============================================================================
  // GETTERS & SETTERS
  // =============================================================================

  get variant() {
    return this.getAttribute('variant') || 'primary';
  }

  set variant(value) {
    this.setAttribute('variant', value);
  }

  get size() {
    return this.getAttribute('size') || 'md';
  }

  set size(value) {
    this.setAttribute('size', value);
  }

  get disabled() {
    return this.hasAttribute('disabled');
  }

  set disabled(value) {
    if (value) {
      this.setAttribute('disabled', '');
    } else {
      this.removeAttribute('disabled');
    }
  }

  get loading() {
    return this.hasAttribute('loading');
  }

  set loading(value) {
    if (value) {
      this.setAttribute('loading', '');
    } else {
      this.removeAttribute('loading');
    }
  }

  get fullwidth() {
    return this.hasAttribute('fullwidth');
  }

  set fullwidth(value) {
    if (value) {
      this.setAttribute('fullwidth', '');
    } else {
      this.removeAttribute('fullwidth');
    }
  }

  get type() {
    return this.getAttribute('type') || 'button';
  }

  set type(value) {
    this.setAttribute('type', value);
  }

  // =============================================================================
  // RENDER METHOD
  // =============================================================================

  render() {
    const styles = this.createStyles();
    const variantClasses = this.getVariantClasses();
    const sizeClasses = this.getSizeClasses();
    const stateClasses = this.getStateClasses();
    
    const buttonClass = [
      'button',
      `button--${this.variant}`,
      `button--${this.size}`,
      ...stateClasses
    ].filter(Boolean).join(' ');

    this.shadowRoot.innerHTML = `
      <style>${styles}</style>
      <button
        part="button"
        class="${buttonClass}"
        type="${this.type}"
        ${this.disabled || this.loading ? 'disabled' : ''}
        aria-label="${this.getAttribute('aria-label') || ''}"
        aria-busy="${this.loading}"
        aria-disabled="${this.disabled || this.loading}"
        tabindex="${this.disabled || this.loading ? '-1' : '0'}"
      >
        ${this.loading ? this.renderLoadingSpinner() : ''}
        <slot></slot>
      </button>
    `;
  }

  // =============================================================================
  // STYLE GENERATION
  // =============================================================================

  createStyles() {
    return `
      /* CSS Custom Properties */
      :host {
        ${Object.entries(cssVariables).map(([key, value]) => `${key}: ${value};`).join('\n        ')}
        
        display: inline-block;
        font-family: var(--typography-fontFamily-sans);
      }

      /* Base button styles */
      .button {
        display: inline-flex;
        align-items: center;
        justify-content: center;
        gap: var(--spacing-2);
        border: none;
        cursor: pointer;
        font-family: inherit;
        font-weight: var(--typography-fontWeight-medium);
        text-decoration: none;
        white-space: nowrap;
        user-select: none;
        position: relative;
        transition: all var(--animations-duration-fast)ms var(--animations-easing-easeInOut);
        outline: none;
        box-sizing: border-box;
      }

      /* Focus styles - WCAG AAA compliant */
      .button:focus-visible {
        outline: 2px solid var(--colors-primary-500);
        outline-offset: 2px;
      }

      /* Size variants */
      .button--xs {
        min-height: var(--spacing-button-xs);
        padding: 0 var(--spacing-3);
        font-size: var(--typography-fontSize-xs);
        border-radius: var(--borders-radius-md);
      }

      .button--sm {
        min-height: var(--spacing-button-sm);
        padding: 0 var(--spacing-4);
        font-size: var(--typography-fontSize-sm);
        border-radius: var(--borders-radius-md);
      }

      .button--md {
        min-height: var(--spacing-button-md);
        padding: 0 var(--spacing-6);
        font-size: var(--typography-fontSize-base);
        border-radius: var(--borders-radius-lg);
      }

      .button--lg {
        min-height: var(--spacing-button-lg);
        padding: 0 var(--spacing-8);
        font-size: var(--typography-fontSize-lg);
        border-radius: var(--borders-radius-lg);
      }

      .button--xl {
        min-height: var(--spacing-button-xl);
        padding: 0 var(--spacing-10);
        font-size: var(--typography-fontSize-xl);
        border-radius: var(--borders-radius-xl);
      }

      /* Variant styles */
      .button--primary {
        background-color: var(--colors-primary-500);
        color: white;
        box-shadow: var(--shadows-button-idle);
      }

      .button--primary:hover:not(:disabled) {
        background-color: var(--colors-primary-600);
        box-shadow: var(--shadows-button-hover);
      }

      .button--primary:active:not(:disabled) {
        background-color: var(--colors-primary-700);
        box-shadow: var(--shadows-button-active);
      }

      .button--secondary {
        background-color: var(--colors-secondary-100);
        color: var(--colors-secondary-800);
        box-shadow: var(--shadows-button-idle);
      }

      .button--secondary:hover:not(:disabled) {
        background-color: var(--colors-secondary-200);
        box-shadow: var(--shadows-button-hover);
      }

      .button--secondary:active:not(:disabled) {
        background-color: var(--colors-secondary-300);
        box-shadow: var(--shadows-button-active);
      }

      .button--outline {
        background-color: transparent;
        color: var(--colors-primary-600);
        border: 2px solid var(--colors-primary-200);
        box-shadow: none;
      }

      .button--outline:hover:not(:disabled) {
        background-color: var(--colors-primary-50);
        border-color: var(--colors-primary-300);
      }

      .button--outline:active:not(:disabled) {
        background-color: var(--colors-primary-100);
        border-color: var(--colors-primary-400);
      }

      .button--ghost {
        background-color: transparent;
        color: var(--colors-primary-600);
        box-shadow: none;
      }

      .button--ghost:hover:not(:disabled) {
        background-color: var(--colors-primary-50);
      }

      .button--ghost:active:not(:disabled) {
        background-color: var(--colors-primary-100);
      }

      .button--destructive {
        background-color: var(--colors-error-main);
        color: white;
        box-shadow: var(--shadows-button-idle);
      }

      .button--destructive:hover:not(:disabled) {
        background-color: var(--colors-error-dark);
        box-shadow: var(--shadows-button-hover);
      }

      .button--destructive:active:not(:disabled) {
        background-color: var(--colors-error-dark);
        box-shadow: var(--shadows-button-active);
      }

      /* State styles */
      .button--disabled,
      .button:disabled {
        opacity: 0.5;
        cursor: not-allowed;
        pointer-events: none;
      }

      .button--loading {
        color: transparent;
      }

      .button--fullwidth {
        width: 100%;
      }

      /* Loading spinner */
      .spinner {
        position: absolute;
        top: 50%;
        left: 50%;
        transform: translate(-50%, -50%);
        width: 1.2em;
        height: 1.2em;
      }

      .spinner::after {
        content: '';
        display: block;
        width: 100%;
        height: 100%;
        border: 2px solid currentColor;
        border-radius: 50%;
        border-top-color: transparent;
        border-right-color: transparent;
        animation: spin 0.6s linear infinite;
      }

      @keyframes spin {
        to {
          transform: rotate(360deg);
        }
      }

      /* High contrast mode support */
      @media (prefers-contrast: high) {
        .button {
          border: 2px solid currentColor;
        }
        
        .button:focus-visible {
          outline-width: 3px;
        }
      }

      /* Reduced motion support */
      @media (prefers-reduced-motion: reduce) {
        .button {
          transition: none;
        }
        
        .spinner::after {
          animation: none;
          border-color: currentColor;
          border-top-color: transparent;
        }
      }
    `;
  }

  // =============================================================================
  // HELPER METHODS
  // =============================================================================

  getVariantClasses() {
    const variantMap = {
      primary: 'button--primary',
      secondary: 'button--secondary',
      outline: 'button--outline',
      ghost: 'button--ghost',
      destructive: 'button--destructive'
    };
    return variantMap[this.variant] || 'button--primary';
  }

  getSizeClasses() {
    const sizeMap = {
      xs: 'button--xs',
      sm: 'button--sm',
      md: 'button--md',
      lg: 'button--lg',
      xl: 'button--xl'
    };
    return sizeMap[this.size] || 'button--md';
  }

  getStateClasses() {
    const classes = [];
    if (this.disabled) classes.push('button--disabled');
    if (this.loading) classes.push('button--loading');
    if (this.fullwidth) classes.push('button--fullwidth');
    return classes;
  }

  renderLoadingSpinner() {
    return '<span class="spinner" aria-hidden="true"></span>';
  }

  // =============================================================================
  // EVENT HANDLING
  // =============================================================================

  setupEventListeners() {
    const button = this.shadowRoot.querySelector('button');
    if (button) {
      button.addEventListener('click', this._onClick);
      button.addEventListener('keydown', this._onKeyDown);
      button.addEventListener('keyup', this._onKeyUp);
    }
  }

  removeEventListeners() {
    const button = this.shadowRoot.querySelector('button');
    if (button) {
      button.removeEventListener('click', this._onClick);
      button.removeEventListener('keydown', this._onKeyDown);
      button.removeEventListener('keyup', this._onKeyUp);
    }
  }

  _onClick(event) {
    if (this.disabled || this.loading) {
      event.preventDefault();
      event.stopPropagation();
      return;
    }

    // Dispatch custom event
    this.dispatchEvent(new CustomEvent('xaheen-click', {
      detail: { originalEvent: event },
      bubbles: true,
      composed: true
    }));
  }

  _onKeyDown(event) {
    // Handle space and enter keys for button activation
    if (event.key === ' ' || event.key === 'Enter') {
      event.preventDefault();
      const button = event.target;
      button.classList.add('button--active');
    }
  }

  _onKeyUp(event) {
    // Handle space and enter keys for button activation
    if (event.key === ' ' || event.key === 'Enter') {
      event.preventDefault();
      const button = event.target;
      button.classList.remove('button--active');
      button.click();
    }
  }

  // =============================================================================
  // ACCESSIBILITY
  // =============================================================================

  setupAccessibility() {
    // Set default role if not present
    if (!this.hasAttribute('role')) {
      this.setAttribute('role', 'button');
    }

    // Update ARIA states
    this.updateAccessibility();
  }

  updateAccessibility() {
    const button = this.shadowRoot.querySelector('button');
    if (!button) return;

    // Update ARIA states based on component state
    if (this.disabled || this.loading) {
      button.setAttribute('aria-disabled', 'true');
      button.setAttribute('tabindex', '-1');
    } else {
      button.setAttribute('aria-disabled', 'false');
      button.setAttribute('tabindex', '0');
    }

    if (this.loading) {
      button.setAttribute('aria-busy', 'true');
    } else {
      button.setAttribute('aria-busy', 'false');
    }
  }

  // =============================================================================
  // FORM PARTICIPATION
  // =============================================================================

  static get formAssociated() {
    return true;
  }

  get form() {
    return this._internals?.form;
  }

  get validity() {
    return this._internals?.validity;
  }

  get validationMessage() {
    return this._internals?.validationMessage;
  }

  get willValidate() {
    return this._internals?.willValidate;
  }

  checkValidity() {
    return this._internals?.checkValidity();
  }

  reportValidity() {
    return this._internals?.reportValidity();
  }

  setCustomValidity(message) {
    this._internals?.setValidity({}, message);
  }
}

// =============================================================================
// REGISTER CUSTOM ELEMENT
// =============================================================================

if (!customElements.get('xaheen-button')) {
  customElements.define('xaheen-button', XaheenButton);
}

export default XaheenButton;