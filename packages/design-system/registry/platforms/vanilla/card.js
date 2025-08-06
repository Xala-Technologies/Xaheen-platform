/**
 * Card Component - Vanilla JS/Web Components Implementation
 * Generated from universal card specification
 * WCAG AAA compliant with semantic HTML structure
 */

import { UniversalTokens } from '../../core/universal-tokens.js';
import { CardSpec } from '../../core/component-specs.js';

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
// CARD WEB COMPONENT
// =============================================================================

class XaheenCard extends HTMLElement {
  static get observedAttributes() {
    return ['variant', 'padding', 'hoverable', 'clickable', 'aria-label', 'role'];
  }

  constructor() {
    super();
    this.attachShadow({ mode: 'open' });
    this._onClick = this._onClick.bind(this);
    this._onKeyDown = this._onKeyDown.bind(this);
    this._onMouseEnter = this._onMouseEnter.bind(this);
    this._onMouseLeave = this._onMouseLeave.bind(this);
    this._onFocus = this._onFocus.bind(this);
    this._onBlur = this._onBlur.bind(this);
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
      if (name === 'clickable' || name === 'role') {
        this.setupAccessibility();
      }
    }
  }

  // =============================================================================
  // GETTERS & SETTERS
  // =============================================================================

  get variant() {
    return this.getAttribute('variant') || 'default';
  }

  set variant(value) {
    this.setAttribute('variant', value);
  }

  get padding() {
    return this.getAttribute('padding') || 'md';
  }

  set padding(value) {
    this.setAttribute('padding', value);
  }

  get hoverable() {
    return this.hasAttribute('hoverable');
  }

  set hoverable(value) {
    if (value) {
      this.setAttribute('hoverable', '');
    } else {
      this.removeAttribute('hoverable');
    }
  }

  get clickable() {
    return this.hasAttribute('clickable');
  }

  set clickable(value) {
    if (value) {
      this.setAttribute('clickable', '');
    } else {
      this.removeAttribute('clickable');
    }
  }

  // =============================================================================
  // RENDER METHOD
  // =============================================================================

  render() {
    const styles = this.createStyles();
    const variantClass = `card--${this.variant}`;
    const paddingClass = `card--padding-${this.padding}`;
    const stateClasses = this.getStateClasses();
    
    const cardClass = [
      'card',
      variantClass,
      paddingClass,
      ...stateClasses
    ].filter(Boolean).join(' ');

    const hasHeader = this.querySelector('[slot="header"]');
    const hasFooter = this.querySelector('[slot="footer"]');

    this.shadowRoot.innerHTML = `
      <style>${styles}</style>
      <article 
        class="${cardClass}"
        part="card"
        ${this.clickable ? 'tabindex="0"' : ''}
        ${this.getAttribute('aria-label') ? `aria-label="${this.getAttribute('aria-label')}"` : ''}
        ${this.getAttribute('aria-describedby') ? `aria-describedby="${this.getAttribute('aria-describedby')}"` : ''}
      >
        ${hasHeader ? `
          <header class="card__header" part="header">
            <slot name="header"></slot>
          </header>
        ` : ''}
        
        <div class="card__content" part="content">
          <slot></slot>
        </div>
        
        ${hasFooter ? `
          <footer class="card__footer" part="footer">
            <slot name="footer"></slot>
          </footer>
        ` : ''}
      </article>
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
        
        display: block;
        font-family: var(--typography-fontFamily-sans);
      }

      /* Base card styles */
      .card {
        position: relative;
        display: flex;
        flex-direction: column;
        border-radius: var(--borders-radius-lg);
        transition: all var(--animations-duration-normal)ms var(--animations-easing-easeInOut);
        box-sizing: border-box;
        overflow: hidden;
      }

      /* Variant styles */
      .card--default {
        background-color: white;
        border: 1px solid var(--colors-secondary-200);
        box-shadow: var(--shadows-card-default);
      }

      .card--outlined {
        background-color: white;
        border: 2px solid var(--colors-secondary-300);
        box-shadow: none;
      }

      .card--filled {
        background-color: var(--colors-secondary-100);
        border: none;
        box-shadow: none;
      }

      .card--elevated {
        background-color: white;
        border: none;
        box-shadow: var(--shadows-elevation-4);
      }

      /* Padding variants */
      .card--padding-none {
        padding: 0;
      }

      .card--padding-sm {
        padding: var(--spacing-4);
      }

      .card--padding-md {
        padding: var(--spacing-6);
      }

      .card--padding-lg {
        padding: var(--spacing-8);
      }

      .card--padding-xl {
        padding: var(--spacing-10);
      }

      /* Header and footer styles */
      .card__header,
      .card__footer {
        margin: calc(var(--spacing-6) * -1);
        padding: var(--spacing-4) var(--spacing-6);
      }

      .card__header {
        margin-bottom: var(--spacing-6);
        border-bottom: 1px solid var(--colors-secondary-200);
        font-weight: var(--typography-fontWeight-semibold);
      }

      .card__footer {
        margin-top: var(--spacing-6);
        margin-bottom: calc(var(--spacing-6) * -1);
        border-top: 1px solid var(--colors-secondary-200);
      }

      /* Content area */
      .card__content {
        flex: 1;
        min-height: 0;
      }

      /* Padding adjustments for header/footer */
      .card--padding-none .card__header,
      .card--padding-none .card__footer {
        margin: 0;
        padding: var(--spacing-4);
      }

      .card--padding-sm .card__header,
      .card--padding-sm .card__footer {
        margin: calc(var(--spacing-4) * -1);
        margin-bottom: var(--spacing-4);
        padding: var(--spacing-3) var(--spacing-4);
      }

      .card--padding-sm .card__footer {
        margin-top: var(--spacing-4);
        margin-bottom: calc(var(--spacing-4) * -1);
      }

      /* State styles */
      .card--hoverable {
        cursor: default;
      }

      .card--hoverable:hover {
        transform: translateY(-2px);
        box-shadow: var(--shadows-card-hover);
      }

      .card--clickable {
        cursor: pointer;
        user-select: none;
      }

      .card--clickable:hover {
        transform: translateY(-2px);
        box-shadow: var(--shadows-card-hover);
      }

      .card--clickable:active {
        transform: translateY(0);
        box-shadow: var(--shadows-card-default);
      }

      /* Focus styles - WCAG AAA compliant */
      .card--clickable:focus {
        outline: 3px solid var(--colors-primary-500);
        outline-offset: 2px;
      }

      .card--clickable:focus:not(:focus-visible) {
        outline: none;
      }

      /* High contrast mode support */
      @media (prefers-contrast: high) {
        .card {
          border: 2px solid currentColor;
        }
        
        .card--clickable:focus {
          outline-width: 4px;
        }
      }

      /* Reduced motion support */
      @media (prefers-reduced-motion: reduce) {
        .card {
          transition: none;
        }
        
        .card--hoverable:hover,
        .card--clickable:hover,
        .card--clickable:active {
          transform: none;
        }
      }

      /* Dark mode support */
      @media (prefers-color-scheme: dark) {
        .card--default,
        .card--outlined,
        .card--elevated {
          background-color: var(--colors-secondary-800);
          border-color: var(--colors-secondary-700);
          color: var(--colors-secondary-100);
        }

        .card--filled {
          background-color: var(--colors-secondary-900);
          color: var(--colors-secondary-100);
        }

        .card__header,
        .card__footer {
          border-color: var(--colors-secondary-700);
        }
      }

      /* Print styles */
      @media print {
        .card {
          box-shadow: none !important;
          border: 1px solid #000 !important;
          break-inside: avoid;
        }
      }

      /* Responsive adjustments */
      @media (max-width: 640px) {
        .card--padding-lg {
          padding: var(--spacing-6);
        }

        .card--padding-xl {
          padding: var(--spacing-8);
        }
      }
    `;
  }

  // =============================================================================
  // HELPER METHODS
  // =============================================================================

  getStateClasses() {
    const classes = [];
    if (this.hoverable) classes.push('card--hoverable');
    if (this.clickable) classes.push('card--clickable');
    return classes;
  }

  // =============================================================================
  // EVENT HANDLING
  // =============================================================================

  setupEventListeners() {
    const card = this.shadowRoot.querySelector('.card');
    if (!card) return;

    if (this.clickable) {
      card.addEventListener('click', this._onClick);
      card.addEventListener('keydown', this._onKeyDown);
    }

    if (this.hoverable || this.clickable) {
      card.addEventListener('mouseenter', this._onMouseEnter);
      card.addEventListener('mouseleave', this._onMouseLeave);
      card.addEventListener('focus', this._onFocus);
      card.addEventListener('blur', this._onBlur);
    }
  }

  removeEventListeners() {
    const card = this.shadowRoot.querySelector('.card');
    if (!card) return;

    card.removeEventListener('click', this._onClick);
    card.removeEventListener('keydown', this._onKeyDown);
    card.removeEventListener('mouseenter', this._onMouseEnter);
    card.removeEventListener('mouseleave', this._onMouseLeave);
    card.removeEventListener('focus', this._onFocus);
    card.removeEventListener('blur', this._onBlur);
  }

  _onClick(event) {
    if (!this.clickable) return;

    // Dispatch custom click event
    this.dispatchEvent(new CustomEvent('xaheen-card-click', {
      detail: { originalEvent: event },
      bubbles: true,
      composed: true
    }));
  }

  _onKeyDown(event) {
    if (!this.clickable) return;

    // Handle enter and space for activation
    if (event.key === 'Enter' || event.key === ' ') {
      event.preventDefault();
      this._onClick(event);
    }
  }

  _onMouseEnter(event) {
    // Dispatch custom mouse enter event
    this.dispatchEvent(new CustomEvent('xaheen-card-mouseenter', {
      detail: { originalEvent: event },
      bubbles: true,
      composed: true
    }));
  }

  _onMouseLeave(event) {
    // Dispatch custom mouse leave event
    this.dispatchEvent(new CustomEvent('xaheen-card-mouseleave', {
      detail: { originalEvent: event },
      bubbles: true,
      composed: true
    }));
  }

  _onFocus(event) {
    // Dispatch custom focus event
    this.dispatchEvent(new CustomEvent('xaheen-card-focus', {
      detail: { originalEvent: event },
      bubbles: true,
      composed: true
    }));
  }

  _onBlur(event) {
    // Dispatch custom blur event
    this.dispatchEvent(new CustomEvent('xaheen-card-blur', {
      detail: { originalEvent: event },
      bubbles: true,
      composed: true
    }));
  }

  // =============================================================================
  // ACCESSIBILITY
  // =============================================================================

  setupAccessibility() {
    const card = this.shadowRoot.querySelector('.card');
    if (!card) return;

    // Set appropriate role based on usage
    if (!this.hasAttribute('role')) {
      if (this.clickable) {
        this.setAttribute('role', 'button');
        card.setAttribute('role', 'button');
      } else {
        this.setAttribute('role', 'article');
        card.setAttribute('role', 'article');
      }
    }

    // Ensure proper keyboard navigation for clickable cards
    if (this.clickable) {
      if (!card.hasAttribute('tabindex')) {
        card.setAttribute('tabindex', '0');
      }
      card.setAttribute('aria-pressed', 'false');
    }

    // Add live region for dynamic content
    const content = this.shadowRoot.querySelector('.card__content');
    if (content && this.hasAttribute('data-live-region')) {
      content.setAttribute('aria-live', 'polite');
      content.setAttribute('aria-atomic', 'true');
    }
  }
}

// =============================================================================
// REGISTER CUSTOM ELEMENT
// =============================================================================

if (!customElements.get('xaheen-card')) {
  customElements.define('xaheen-card', XaheenCard);
}

export default XaheenCard;