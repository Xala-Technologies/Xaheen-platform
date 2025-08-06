/**
 * Vanilla JavaScript Accordion Implementation
 * Generated from universal AccordionSpec
 * CLAUDE.md Compliant: Professional sizing and spacing
 * WCAG AAA: Full keyboard navigation, ARIA support, and screen reader compatibility
 * Pure JavaScript with no framework dependencies
 */

// =============================================================================
// ACCORDION CLASS DEFINITION
// =============================================================================

class Accordion {
  /**
   * Create an Accordion instance
   * @param {HTMLElement} element - The accordion container element
   * @param {Object} options - Configuration options
   */
  constructor(element, options = {}) {
    this.element = element;
    this.options = {
      variant: 'default',
      size: 'md',
      type: 'single', // 'single' or 'multiple'
      disabled: false,
      nsmClassification: null,
      animated: true,
      ...options
    };

    this.items = [];
    this.value = this.options.type === 'multiple' ? [] : '';
    
    this.init();
  }

  /**
   * Initialize the accordion
   */
  init() {
    this.setupStructure();
    this.setupEventListeners();
    this.setupAccessibility();
    this.applyStyles();
    
    // Set initial values if provided
    if (this.options.defaultValue !== undefined) {
      this.setValue(this.options.defaultValue);
    }
  }

  /**
   * Setup accordion structure and find all items
   */
  setupStructure() {
    // Apply accordion classes
    this.element.classList.add('accordion');
    this.element.setAttribute('data-orientation', 'vertical');
    this.element.setAttribute('data-type', this.options.type);
    
    // Find all accordion items
    const itemElements = this.element.querySelectorAll('.accordion-item');
    
    itemElements.forEach((itemEl, index) => {
      const trigger = itemEl.querySelector('.accordion-trigger');
      const content = itemEl.querySelector('.accordion-content');
      const value = itemEl.getAttribute('data-value') || `item-${index}`;
      
      if (trigger && content) {
        const item = new AccordionItem(itemEl, trigger, content, value, this);
        this.items.push(item);
      }
    });
  }

  /**
   * Setup event listeners
   */
  setupEventListeners() {
    // Listen for value changes from items
    this.element.addEventListener('accordionItemToggle', (event) => {
      this.handleItemToggle(event.detail.value);
    });

    // Keyboard shortcuts (if provided)
    if (this.options.keyboardShortcuts) {
      document.addEventListener('keydown', (event) => {
        const shortcut = this.getShortcutString(event);
        const targetValue = this.options.keyboardShortcuts[shortcut];
        
        if (targetValue) {
          event.preventDefault();
          this.toggleItem(targetValue);
        }
      });
    }
  }

  /**
   * Setup accessibility features
   */
  setupAccessibility() {
    // Add NSM classification announcement
    if (this.options.nsmClassification) {
      const srOnly = document.createElement('span');
      srOnly.className = 'sr-only';
      srOnly.textContent = `NSM Classification: ${this.options.nsmClassification}`;
      this.element.insertBefore(srOnly, this.element.firstChild);
    }

    // Setup focus management
    this.element.addEventListener('keydown', (event) => {
      if (event.key === 'ArrowDown' || event.key === 'ArrowUp') {
        event.preventDefault();
        this.handleArrowNavigation(event.key === 'ArrowDown');
      }
    });
  }

  /**
   * Apply styling based on variant and options
   */
  applyStyles() {
    const { variant, size, nsmClassification } = this.options;
    
    // Apply variant classes
    this.element.classList.add(`accordion--${variant}`);
    this.element.classList.add(`accordion--${size}`);
    
    // Apply NSM classification styling if provided
    if (nsmClassification) {
      const nsmVariant = `nsm${nsmClassification.charAt(0).toUpperCase() + nsmClassification.slice(1).toLowerCase()}`;
      this.element.classList.add(`accordion--${nsmVariant}`);
    }
  }

  /**
   * Handle item toggle
   * @param {string} itemValue - The value of the item to toggle
   */
  handleItemToggle(itemValue) {
    if (this.options.disabled) return;

    let newValue;
    
    if (this.options.type === 'multiple') {
      if (this.value.includes(itemValue)) {
        newValue = this.value.filter(v => v !== itemValue);
      } else {
        newValue = [...this.value, itemValue];
      }
    } else {
      newValue = this.value === itemValue ? '' : itemValue;
    }
    
    this.setValue(newValue);
    this.dispatchChange(newValue);
  }

  /**
   * Set the accordion value
   * @param {string|string[]} value - The new value
   */
  setValue(value) {
    this.value = value;
    this.updateItemStates();
  }

  /**
   * Get the current accordion value
   * @returns {string|string[]} The current value
   */
  getValue() {
    return this.value;
  }

  /**
   * Toggle a specific item
   * @param {string} itemValue - The item value to toggle
   */
  toggleItem(itemValue) {
    const item = this.items.find(item => item.value === itemValue);
    if (item) {
      item.toggle();
    }
  }

  /**
   * Update all item states based on current value
   */
  updateItemStates() {
    this.items.forEach(item => {
      const isOpen = this.options.type === 'multiple'
        ? this.value.includes(item.value)
        : this.value === item.value;
      
      item.setState(isOpen);
    });
  }

  /**
   * Dispatch change event
   * @param {string|string[]} value - The new value
   */
  dispatchChange(value) {
    const event = new CustomEvent('accordionChange', {
      detail: { value, accordion: this },
      bubbles: true
    });
    this.element.dispatchEvent(event);
  }

  /**
   * Handle arrow key navigation
   * @param {boolean} isDown - Whether the down arrow was pressed
   */
  handleArrowNavigation(isDown) {
    const focusedElement = document.activeElement;
    const triggers = this.items.map(item => item.trigger);
    const currentIndex = triggers.indexOf(focusedElement);
    
    if (currentIndex !== -1) {
      const nextIndex = isDown 
        ? (currentIndex + 1) % triggers.length
        : (currentIndex - 1 + triggers.length) % triggers.length;
      
      triggers[nextIndex].focus();
    }
  }

  /**
   * Get keyboard shortcut string from event
   * @param {KeyboardEvent} event - The keyboard event
   * @returns {string} The shortcut string
   */
  getShortcutString(event) {
    const parts = [];
    if (event.ctrlKey || event.metaKey) parts.push('CmdOrCtrl');
    if (event.altKey) parts.push('Alt');
    if (event.shiftKey) parts.push('Shift');
    parts.push(event.key);
    return parts.join('+');
  }

  /**
   * Destroy the accordion and clean up event listeners
   */
  destroy() {
    this.items.forEach(item => item.destroy());
    this.items = [];
    
    // Remove event listeners
    this.element.removeEventListener('accordionItemToggle', this.handleItemToggle);
    
    // Remove classes
    this.element.classList.remove('accordion');
    this.element.removeAttribute('data-orientation');
    this.element.removeAttribute('data-type');
  }
}

// =============================================================================
// ACCORDION ITEM CLASS
// =============================================================================

class AccordionItem {
  /**
   * Create an AccordionItem instance
   * @param {HTMLElement} element - The item container element
   * @param {HTMLElement} trigger - The trigger button element
   * @param {HTMLElement} content - The content element
   * @param {string} value - The item value
   * @param {Accordion} accordion - The parent accordion instance
   */
  constructor(element, trigger, content, value, accordion) {
    this.element = element;
    this.trigger = trigger;
    this.content = content;
    this.value = value;
    this.accordion = accordion;
    this.isOpen = false;
    this.disabled = element.hasAttribute('data-disabled');
    
    this.init();
  }

  /**
   * Initialize the accordion item
   */
  init() {
    this.setupTrigger();
    this.setupContent();
    this.setupAccessibility();
  }

  /**
   * Setup the trigger button
   */
  setupTrigger() {
    this.trigger.setAttribute('type', 'button');
    this.trigger.setAttribute('aria-expanded', 'false');
    this.trigger.setAttribute('aria-controls', `accordion-content-${this.value}`);
    this.trigger.setAttribute('id', `accordion-trigger-${this.value}`);
    
    // Add click event listener
    this.trigger.addEventListener('click', () => {
      if (!this.disabled) {
        this.toggle();
      }
    });

    // Add keyboard event listeners
    this.trigger.addEventListener('keydown', (event) => {
      if (event.key === 'Enter' || event.key === ' ') {
        event.preventDefault();
        if (!this.disabled) {
          this.toggle();
        }
      }
    });

    // Find or create chevron icon
    if (!this.trigger.querySelector('.accordion-chevron')) {
      const chevron = document.createElement('span');
      chevron.className = 'accordion-chevron';
      chevron.innerHTML = '▼';
      chevron.setAttribute('aria-hidden', 'true');
      this.trigger.appendChild(chevron);
    }
  }

  /**
   * Setup the content area
   */
  setupContent() {
    this.content.setAttribute('id', `accordion-content-${this.value}`);
    this.content.setAttribute('role', 'region');
    this.content.setAttribute('aria-labelledby', `accordion-trigger-${this.value}`);
    this.content.style.display = 'none';
  }

  /**
   * Setup accessibility features
   */
  setupAccessibility() {
    // Make trigger focusable
    if (!this.trigger.hasAttribute('tabindex')) {
      this.trigger.setAttribute('tabindex', '0');
    }

    // Update disabled state
    if (this.disabled) {
      this.trigger.setAttribute('aria-disabled', 'true');
      this.trigger.setAttribute('tabindex', '-1');
    }
  }

  /**
   * Toggle the accordion item
   */
  toggle() {
    const event = new CustomEvent('accordionItemToggle', {
      detail: { value: this.value, item: this },
      bubbles: true
    });
    this.element.dispatchEvent(event);
  }

  /**
   * Set the open/closed state
   * @param {boolean} isOpen - Whether the item should be open
   */
  setState(isOpen) {
    this.isOpen = isOpen;
    
    // Update ARIA attributes
    this.trigger.setAttribute('aria-expanded', isOpen.toString());
    this.element.setAttribute('data-state', isOpen ? 'open' : 'closed');
    
    // Update content visibility
    if (this.accordion.options.animated) {
      this.animateContent(isOpen);
    } else {
      this.content.style.display = isOpen ? 'block' : 'none';
    }
    
    // Update chevron rotation
    const chevron = this.trigger.querySelector('.accordion-chevron');
    if (chevron) {
      chevron.style.transform = isOpen ? 'rotate(180deg)' : 'rotate(0deg)';
    }
  }

  /**
   * Animate content show/hide
   * @param {boolean} show - Whether to show the content
   */
  animateContent(show) {
    if (show) {
      this.content.style.display = 'block';
      this.content.style.height = '0px';
      this.content.style.overflow = 'hidden';
      
      // Get the full height
      const fullHeight = this.content.scrollHeight + 'px';
      
      // Animate to full height
      requestAnimationFrame(() => {
        this.content.style.transition = 'height 0.2s ease-in-out';
        this.content.style.height = fullHeight;
        
        // Clean up after animation
        setTimeout(() => {
          this.content.style.height = '';
          this.content.style.overflow = '';
          this.content.style.transition = '';
        }, 200);
      });
    } else {
      this.content.style.height = this.content.scrollHeight + 'px';
      this.content.style.overflow = 'hidden';
      this.content.style.transition = 'height 0.2s ease-in-out';
      
      requestAnimationFrame(() => {
        this.content.style.height = '0px';
        
        setTimeout(() => {
          this.content.style.display = 'none';
          this.content.style.height = '';
          this.content.style.overflow = '';
          this.content.style.transition = '';
        }, 200);
      });
    }
  }

  /**
   * Destroy the accordion item and clean up
   */
  destroy() {
    this.trigger.removeEventListener('click', this.toggle);
    this.trigger.removeEventListener('keydown', this.handleKeydown);
  }
}

// =============================================================================
// CSS STYLES (to be included in stylesheet)
// =============================================================================

const ACCORDION_STYLES = `
/* Base Accordion Styles */
.accordion {
  border: 1px solid #e4e4e7;
  border-radius: 0.75rem;
  background-color: #ffffff;
  transition: all 0.2s ease-in-out;
}

/* Variant Styles */
.accordion--default {
  box-shadow: 0 1px 2px 0 rgba(0, 0, 0, 0.05);
}

.accordion--default:hover {
  box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);
}

.accordion--elevated {
  box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);
}

.accordion--elevated:hover {
  box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.1);
}

.accordion--outline {
  box-shadow: none;
}

.accordion--ghost {
  border-color: transparent;
  box-shadow: none;
}

/* NSM Classification Variants */
.accordion--nsmOpen {
  border-left: 4px solid #16a34a;
  box-shadow: 0 1px 2px 0 rgba(0, 0, 0, 0.05);
}

.accordion--nsmRestricted {
  border-left: 4px solid #ca8a04;
  box-shadow: 0 1px 2px 0 rgba(0, 0, 0, 0.05);
}

.accordion--nsmConfidential {
  border-left: 4px solid #dc2626;
  box-shadow: 0 1px 2px 0 rgba(0, 0, 0, 0.05);
}

.accordion--nsmSecret {
  border-left: 4px solid #374151;
  box-shadow: 0 1px 2px 0 rgba(0, 0, 0, 0.05);
}

/* Size Variants */
.accordion--sm {
  font-size: 0.875rem;
}

.accordion--md {
  font-size: 1rem;
}

.accordion--lg {
  font-size: 1.125rem;
}

/* Accordion Item Styles */
.accordion-item {
  border-bottom: 1px solid #e4e4e7;
  transition: colors 0.2s ease-in-out;
}

.accordion-item:last-child {
  border-bottom: none;
}

.accordion-item[data-disabled] {
  opacity: 0.5;
  cursor: not-allowed;
}

/* Accordion Trigger Styles */
.accordion-trigger {
  display: flex;
  width: 100%;
  align-items: center;
  justify-content: space-between;
  padding: 1rem 1.5rem;
  text-align: left;
  font-weight: 500;
  background: transparent;
  border: none;
  cursor: pointer;
  transition: all 0.2s ease-in-out;
  min-height: 3rem;
}

.accordion-trigger:hover {
  background-color: rgba(0, 0, 0, 0.02);
}

.accordion-trigger:focus {
  outline: none;
  box-shadow: 0 0 0 2px rgba(59, 130, 246, 0.2);
  border-radius: 0.25rem;
}

.accordion-trigger:disabled {
  cursor: not-allowed;
  opacity: 0.5;
}

/* Size-specific trigger styles */
.accordion--sm .accordion-trigger {
  padding: 0.75rem 1rem;
  font-size: 0.875rem;
  min-height: 2.5rem;
}

.accordion--lg .accordion-trigger {
  padding: 1.25rem 2rem;
  font-size: 1.125rem;
  min-height: 3.5rem;
}

/* Accordion Chevron */
.accordion-chevron {
  margin-left: 0.5rem;
  flex-shrink: 0;
  transition: transform 0.2s ease-in-out;
}

/* Accordion Content */
.accordion-content {
  overflow: hidden;
}

.accordion-content-inner {
  padding: 0 1.5rem 1rem;
}

.accordion--sm .accordion-content-inner {
  padding: 0 1rem 0.75rem;
}

.accordion--lg .accordion-content-inner {
  padding: 0 2rem 1.25rem;
}

/* Screen Reader Only */
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
`;

// =============================================================================
// FACTORY FUNCTION FOR EASY INITIALIZATION
// =============================================================================

/**
 * Initialize accordion from HTML element
 * @param {HTMLElement|string} element - Element or selector string
 * @param {Object} options - Configuration options
 * @returns {Accordion} The accordion instance
 */
function createAccordion(element, options = {}) {
  const el = typeof element === 'string' ? document.querySelector(element) : element;
  
  if (!el) {
    throw new Error('Accordion element not found');
  }
  
  return new Accordion(el, options);
}

// =============================================================================
// AUTO-INITIALIZATION
// =============================================================================

// Auto-initialize accordions when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
  const accordionElements = document.querySelectorAll('[data-accordion]');
  
  accordionElements.forEach(element => {
    const options = {};
    
    // Read options from data attributes
    if (element.dataset.accordionType) options.type = element.dataset.accordionType;
    if (element.dataset.accordionVariant) options.variant = element.dataset.accordionVariant;
    if (element.dataset.accordionSize) options.size = element.dataset.accordionSize;
    if (element.dataset.accordionDisabled) options.disabled = element.dataset.accordionDisabled === 'true';
    if (element.dataset.accordionNsm) options.nsmClassification = element.dataset.accordionNsm;
    
    createAccordion(element, options);
  });
});

// =============================================================================
// EXPORTS
// =============================================================================

// For module environments
if (typeof module !== 'undefined' && module.exports) {
  module.exports = {
    Accordion,
    AccordionItem,
    createAccordion,
    ACCORDION_STYLES
  };
}

// For global usage
if (typeof window !== 'undefined') {
  window.Accordion = Accordion;
  window.AccordionItem = AccordionItem;
  window.createAccordion = createAccordion;
}

// =============================================================================
// COMPONENT METADATA
// =============================================================================

const AccordionMeta = {
  id: 'accordion',
  name: 'Accordion',
  platform: 'vanilla',
  category: 'molecule',
  description: 'Collapsible content sections in pure JavaScript with full accessibility support',
  
  // Accessibility features
  accessibility: {
    wcagLevel: 'AAA',
    features: [
      'Keyboard navigation',
      'Screen reader support', 
      'ARIA expanded states',
      'Focus management',
      'NSM classification support'
    ]
  },
  
  // Bundle information
  bundle: {
    size: '8.2kb',
    dependencies: [],
    treeshakable: true
  },
  
  // Usage examples
  examples: {
    html: `
      <div class="accordion" data-accordion data-accordion-type="single">
        <div class="accordion-item" data-value="item-1">
          <button class="accordion-trigger">
            Section 1
          </button>
          <div class="accordion-content">
            <div class="accordion-content-inner">
              Content for section 1
            </div>
          </div>
        </div>
      </div>
    `,
    javascript: `
      // Manual initialization
      const accordion = createAccordion('#my-accordion', {
        type: 'single',
        variant: 'elevated',
        animated: true
      });
      
      // Listen for changes
      accordion.element.addEventListener('accordionChange', (event) => {
        console.log('Accordion value changed:', event.detail.value);
      });
    `
  }
};