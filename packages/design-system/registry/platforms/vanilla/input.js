/**
 * Input Component - Vanilla JS/Web Components Implementation
 * Generated from universal input specification
 * WCAG AAA compliant with full keyboard and screen reader support
 */

import { UniversalTokens } from '../../core/universal-tokens.js';
import { InputSpec } from '../../core/component-specs.js';

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
// INPUT WEB COMPONENT
// =============================================================================

class XaheenInput extends HTMLElement {
  static get observedAttributes() {
    return [
      'type', 'value', 'placeholder', 'disabled', 'required',
      'error', 'label', 'name', 'id', 'autocomplete', 'pattern',
      'minlength', 'maxlength', 'min', 'max', 'step', 'readonly',
      'aria-label', 'aria-describedby', 'aria-invalid'
    ];
  }

  constructor() {
    super();
    this.attachShadow({ mode: 'open' });
    this._internals = this.attachInternals ? this.attachInternals() : null;
    this._value = '';
    this._onChange = this._onChange.bind(this);
    this._onInput = this._onInput.bind(this);
    this._onFocus = this._onFocus.bind(this);
    this._onBlur = this._onBlur.bind(this);
    this._onKeyDown = this._onKeyDown.bind(this);
  }

  // =============================================================================
  // LIFECYCLE METHODS
  // =============================================================================

  connectedCallback() {
    this.render();
    this.setupEventListeners();
    this.setupAccessibility();
    this.updateFormValue();
  }

  disconnectedCallback() {
    this.removeEventListeners();
  }

  attributeChangedCallback(name, oldValue, newValue) {
    if (oldValue !== newValue) {
      if (name === 'value') {
        this._value = newValue || '';
        this.updateInputValue();
        this.updateFormValue();
      } else {
        this.render();
      }
      
      if (name === 'disabled' || name === 'required' || name === 'error') {
        this.updateAccessibility();
        this.updateValidity();
      }
    }
  }

  // =============================================================================
  // GETTERS & SETTERS
  // =============================================================================

  get type() {
    return this.getAttribute('type') || 'text';
  }

  set type(value) {
    this.setAttribute('type', value);
  }

  get value() {
    return this._value;
  }

  set value(val) {
    this._value = val || '';
    this.setAttribute('value', this._value);
    this.updateInputValue();
    this.updateFormValue();
  }

  get placeholder() {
    return this.getAttribute('placeholder') || '';
  }

  set placeholder(value) {
    this.setAttribute('placeholder', value);
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

  get required() {
    return this.hasAttribute('required');
  }

  set required(value) {
    if (value) {
      this.setAttribute('required', '');
    } else {
      this.removeAttribute('required');
    }
  }

  get error() {
    return this.getAttribute('error') || '';
  }

  set error(value) {
    if (value) {
      this.setAttribute('error', value);
    } else {
      this.removeAttribute('error');
    }
  }

  get label() {
    return this.getAttribute('label') || '';
  }

  set label(value) {
    this.setAttribute('label', value);
  }

  get name() {
    return this.getAttribute('name') || '';
  }

  set name(value) {
    this.setAttribute('name', value);
  }

  // =============================================================================
  // RENDER METHOD
  // =============================================================================

  render() {
    const styles = this.createStyles();
    const hasError = !!this.error;
    const inputId = this.getAttribute('id') || `input-${Math.random().toString(36).substr(2, 9)}`;
    const errorId = `${inputId}-error`;
    const labelId = `${inputId}-label`;

    this.shadowRoot.innerHTML = `
      <style>${styles}</style>
      <div class="input-container">
        ${this.label ? `
          <label 
            id="${labelId}"
            for="${inputId}" 
            class="input-label"
            part="label"
          >
            ${this.label}
            ${this.required ? '<span class="required-indicator" aria-label="required">*</span>' : ''}
          </label>
        ` : ''}
        
        <div class="input-wrapper ${hasError ? 'input-wrapper--error' : ''}">
          <slot name="prefix" class="input-prefix"></slot>
          
          <input
            id="${inputId}"
            part="input"
            class="input ${hasError ? 'input--error' : ''}"
            type="${this.type}"
            placeholder="${this.placeholder}"
            ${this.disabled ? 'disabled' : ''}
            ${this.required ? 'required' : ''}
            ${this.getAttribute('readonly') ? 'readonly' : ''}
            ${this.getAttribute('pattern') ? `pattern="${this.getAttribute('pattern')}"` : ''}
            ${this.getAttribute('minlength') ? `minlength="${this.getAttribute('minlength')}"` : ''}
            ${this.getAttribute('maxlength') ? `maxlength="${this.getAttribute('maxlength')}"` : ''}
            ${this.getAttribute('min') ? `min="${this.getAttribute('min')}"` : ''}
            ${this.getAttribute('max') ? `max="${this.getAttribute('max')}"` : ''}
            ${this.getAttribute('step') ? `step="${this.getAttribute('step')}"` : ''}
            ${this.getAttribute('autocomplete') ? `autocomplete="${this.getAttribute('autocomplete')}"` : ''}
            aria-label="${this.getAttribute('aria-label') || this.label || ''}"
            aria-labelledby="${this.label ? labelId : ''}"
            aria-describedby="${hasError ? errorId : ''}"
            aria-invalid="${hasError}"
            aria-required="${this.required}"
            value="${this._value}"
          />
          
          <slot name="suffix" class="input-suffix"></slot>
        </div>
        
        ${hasError ? `
          <div 
            id="${errorId}" 
            class="input-error" 
            role="alert"
            aria-live="polite"
            part="error"
          >
            ${this.error}
          </div>
        ` : ''}
      </div>
    `;

    // Update input value after render
    this.updateInputValue();
  }

  // =============================================================================
  // STYLE GENERATION
  // =============================================================================

  createStyles() {
    return `
      /* CSS Custom Properties */
      :host {
        ${Object.entries(cssVariables).map(([key, value]) => `${key}: ${value};`).join('\n        ')}
        
        display: block;
        font-family: var(--typography-fontFamily-sans);
      }

      /* Container */
      .input-container {
        display: flex;
        flex-direction: column;
        gap: var(--spacing-2);
      }

      /* Label styles */
      .input-label {
        display: block;
        font-size: var(--typography-fontSize-sm);
        font-weight: var(--typography-fontWeight-medium);
        color: var(--colors-secondary-700);
        margin-bottom: var(--spacing-1);
      }

      .required-indicator {
        color: var(--colors-error-main);
        margin-left: var(--spacing-1);
      }

      /* Input wrapper */
      .input-wrapper {
        position: relative;
        display: flex;
        align-items: center;
        width: 100%;
        transition: all var(--animations-duration-fast)ms var(--animations-easing-easeInOut);
      }

      /* Input styles */
      .input {
        flex: 1;
        min-height: var(--spacing-input-md);
        padding: 0 var(--spacing-4);
        font-size: var(--typography-fontSize-base);
        font-family: inherit;
        color: var(--colors-secondary-900);
        background-color: white;
        border: 2px solid var(--colors-secondary-300);
        border-radius: var(--borders-radius-lg);
        outline: none;
        transition: all var(--animations-duration-fast)ms var(--animations-easing-easeInOut);
        box-sizing: border-box;
        width: 100%;
      }

      /* Prefix and suffix slots */
      .input-prefix,
      .input-suffix {
        display: flex;
        align-items: center;
        color: var(--colors-secondary-500);
      }

      .input-prefix {
        margin-right: var(--spacing-3);
      }

      .input-suffix {
        margin-left: var(--spacing-3);
      }

      /* Focus styles - WCAG AAA compliant */
      .input:focus {
        border-color: var(--colors-primary-500);
        box-shadow: 0 0 0 3px var(--colors-primary-100);
      }

      /* Hover styles */
      .input:hover:not(:disabled):not(:focus) {
        border-color: var(--colors-secondary-400);
      }

      /* Disabled styles */
      .input:disabled {
        background-color: var(--colors-secondary-100);
        color: var(--colors-secondary-500);
        cursor: not-allowed;
        opacity: 0.6;
      }

      /* Readonly styles */
      .input:read-only {
        background-color: var(--colors-secondary-50);
        cursor: default;
      }

      /* Error styles */
      .input--error,
      .input-wrapper--error .input {
        border-color: var(--colors-error-main);
      }

      .input--error:focus,
      .input-wrapper--error .input:focus {
        border-color: var(--colors-error-main);
        box-shadow: 0 0 0 3px rgba(239, 68, 68, 0.1);
      }

      .input-error {
        font-size: var(--typography-fontSize-sm);
        color: var(--colors-error-main);
        margin-top: var(--spacing-1);
      }

      /* Placeholder styles */
      .input::placeholder {
        color: var(--colors-secondary-400);
        opacity: 1;
      }

      /* Type-specific styles */
      .input[type="number"] {
        -moz-appearance: textfield;
      }

      .input[type="number"]::-webkit-outer-spin-button,
      .input[type="number"]::-webkit-inner-spin-button {
        -webkit-appearance: none;
        margin: 0;
      }

      .input[type="search"]::-webkit-search-decoration,
      .input[type="search"]::-webkit-search-cancel-button {
        -webkit-appearance: none;
      }

      /* High contrast mode support */
      @media (prefers-contrast: high) {
        .input {
          border-width: 3px;
        }
        
        .input:focus {
          outline: 3px solid currentColor;
          outline-offset: 2px;
          box-shadow: none;
        }
      }

      /* Reduced motion support */
      @media (prefers-reduced-motion: reduce) {
        .input,
        .input-wrapper {
          transition: none;
        }
      }

      /* Dark mode support */
      @media (prefers-color-scheme: dark) {
        :host {
          --input-bg: var(--colors-secondary-800);
          --input-border: var(--colors-secondary-600);
          --input-color: var(--colors-secondary-100);
        }

        .input {
          background-color: var(--input-bg);
          border-color: var(--input-border);
          color: var(--input-color);
        }

        .input-label {
          color: var(--colors-secondary-300);
        }

        .input::placeholder {
          color: var(--colors-secondary-500);
        }
      }
    `;
  }

  // =============================================================================
  // EVENT HANDLING
  // =============================================================================

  setupEventListeners() {
    const input = this.shadowRoot.querySelector('input');
    if (input) {
      input.addEventListener('input', this._onInput);
      input.addEventListener('change', this._onChange);
      input.addEventListener('focus', this._onFocus);
      input.addEventListener('blur', this._onBlur);
      input.addEventListener('keydown', this._onKeyDown);
    }
  }

  removeEventListeners() {
    const input = this.shadowRoot.querySelector('input');
    if (input) {
      input.removeEventListener('input', this._onInput);
      input.removeEventListener('change', this._onChange);
      input.removeEventListener('focus', this._onFocus);
      input.removeEventListener('blur', this._onBlur);
      input.removeEventListener('keydown', this._onKeyDown);
    }
  }

  _onInput(event) {
    this._value = event.target.value;
    this.updateFormValue();
    
    // Dispatch custom input event
    this.dispatchEvent(new CustomEvent('xaheen-input', {
      detail: { value: this._value },
      bubbles: true,
      composed: true
    }));

    // Validate on input
    this.updateValidity();
  }

  _onChange(event) {
    this._value = event.target.value;
    
    // Dispatch custom change event
    this.dispatchEvent(new CustomEvent('xaheen-change', {
      detail: { value: this._value },
      bubbles: true,
      composed: true
    }));
  }

  _onFocus(event) {
    // Dispatch custom focus event
    this.dispatchEvent(new CustomEvent('xaheen-focus', {
      detail: { value: this._value },
      bubbles: true,
      composed: true
    }));
  }

  _onBlur(event) {
    // Dispatch custom blur event
    this.dispatchEvent(new CustomEvent('xaheen-blur', {
      detail: { value: this._value },
      bubbles: true,
      composed: true
    }));

    // Validate on blur
    this.updateValidity();
  }

  _onKeyDown(event) {
    // Handle enter key for form submission
    if (event.key === 'Enter' && this.type !== 'textarea') {
      const form = this.closest('form');
      if (form) {
        // Check if there are other inputs in the form
        const inputs = form.querySelectorAll('input, textarea, select');
        const currentIndex = Array.from(inputs).indexOf(this);
        
        if (currentIndex < inputs.length - 1) {
          // Focus next input
          event.preventDefault();
          inputs[currentIndex + 1].focus();
        }
      }
    }
  }

  // =============================================================================
  // HELPER METHODS
  // =============================================================================

  updateInputValue() {
    const input = this.shadowRoot.querySelector('input');
    if (input && input.value !== this._value) {
      input.value = this._value;
    }
  }

  updateFormValue() {
    if (this._internals) {
      this._internals.setFormValue(this._value);
    }
  }

  // =============================================================================
  // ACCESSIBILITY
  // =============================================================================

  setupAccessibility() {
    // Set default role if needed
    if (!this.hasAttribute('role')) {
      this.setAttribute('role', 'textbox');
    }

    this.updateAccessibility();
  }

  updateAccessibility() {
    const input = this.shadowRoot.querySelector('input');
    if (!input) return;

    // Update ARIA states
    input.setAttribute('aria-invalid', this.error ? 'true' : 'false');
    input.setAttribute('aria-required', this.required ? 'true' : 'false');
    
    if (this.disabled) {
      input.setAttribute('aria-disabled', 'true');
    } else {
      input.removeAttribute('aria-disabled');
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
    return this._internals?.checkValidity() ?? true;
  }

  reportValidity() {
    return this._internals?.reportValidity() ?? true;
  }

  setCustomValidity(message) {
    if (this._internals) {
      if (message) {
        this._internals.setValidity({ customError: true }, message);
      } else {
        this._internals.setValidity({});
      }
    }
  }

  updateValidity() {
    if (!this._internals) return;

    const input = this.shadowRoot.querySelector('input');
    if (!input) return;

    // Check native validity
    if (!input.checkValidity()) {
      this._internals.setValidity(
        { customError: true },
        input.validationMessage
      );
    } else if (this.error) {
      this._internals.setValidity(
        { customError: true },
        this.error
      );
    } else {
      this._internals.setValidity({});
    }
  }
}

// =============================================================================
// REGISTER CUSTOM ELEMENT
// =============================================================================

if (!customElements.get('xaheen-input')) {
  customElements.define('xaheen-input', XaheenInput);
}

export default XaheenInput;