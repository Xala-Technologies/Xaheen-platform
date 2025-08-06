# 🌐 Web Components Platform Guide

## Overview

The Xaheen Design System Web Components platform provides standards-compliant Custom Elements v1 implementation with zero dependencies. Build truly framework-agnostic components that work in any modern browser or JavaScript framework.

## Table of Contents

- [Platform Benefits](#platform-benefits)
- [Installation](#installation)
- [Basic Usage](#basic-usage)
- [Core Components](#core-components)
- [Advanced Patterns](#advanced-patterns)
- [Platform-Specific Features](#platform-specific-features)
- [Best Practices](#best-practices)
- [Migration Guide](#migration-guide)
- [Troubleshooting](#troubleshooting)

## Platform Benefits

### ✅ Framework Agnostic
- Works with React, Vue, Angular, Svelte, or vanilla JavaScript
- No build tools or compilation required
- Native browser support

### ✅ Standards Compliant
- Custom Elements v1 specification
- Shadow DOM v1 for style encapsulation
- HTML templates and slots
- Form-associated custom elements

### ✅ Zero Dependencies
- No runtime dependencies
- Minimal bundle size (~38KB total)
- Tree-shaking support

### ✅ Progressive Enhancement
- Works without JavaScript (where applicable)
- Graceful degradation
- SEO-friendly server-side rendering

## Installation

### Via NPM

```bash
# Install the complete design system
npm install @xaheen-ai/design-system

# Or with yarn
yarn add @xaheen-ai/design-system

# Or with pnpm
pnpm add @xaheen-ai/design-system
```

### Via CDN

```html
<!-- Import all components -->
<script type="module" src="https://unpkg.com/@xaheen-ai/design-system/registry/platforms/vanilla/index.js"></script>

<!-- Or import individually for better performance -->
<script type="module">
  import 'https://unpkg.com/@xaheen-ai/design-system/registry/platforms/vanilla/button.js';
  import 'https://unpkg.com/@xaheen-ai/design-system/registry/platforms/vanilla/input.js';
  import 'https://unpkg.com/@xaheen-ai/design-system/registry/platforms/vanilla/card.js';
</script>
```

### Local Installation

```javascript
// Import all components
import '@xaheen-ai/design-system/registry/platforms/vanilla';

// Or import individually (recommended)
import '@xaheen-ai/design-system/registry/platforms/vanilla/button.js';
import '@xaheen-ai/design-system/registry/platforms/vanilla/input.js';
import '@xaheen-ai/design-system/registry/platforms/vanilla/card.js';
```

## Basic Usage

### Getting Started

```html
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Xaheen Web Components</title>
  
  <!-- Import design system tokens -->
  <link rel="stylesheet" href="https://unpkg.com/@xaheen-ai/design-system/tokens/css">
  
  <!-- Import components -->
  <script type="module" src="https://unpkg.com/@xaheen-ai/design-system/registry/platforms/vanilla/index.js"></script>
</head>
<body>
  <main>
    <xaheen-card variant="elevated" padding="lg">
      <h2 slot="header">Welcome to Xaheen</h2>
      
      <xaheen-input 
        label="Email Address"
        type="email"
        name="email"
        placeholder="your@email.com"
        required
      ></xaheen-input>
      
      <xaheen-button 
        variant="primary" 
        size="lg"
        type="submit"
      >
        Get Started
      </xaheen-button>
    </xaheen-card>
  </main>

  <script>
    // Handle events
    document.addEventListener('DOMContentLoaded', () => {
      const button = document.querySelector('xaheen-button');
      const input = document.querySelector('xaheen-input');
      
      button.addEventListener('xaheen-click', (event) => {
        console.log('Button clicked:', event.detail);
        if (input.value) {
          console.log('Email:', input.value);
        }
      });
      
      input.addEventListener('xaheen-input', (event) => {
        console.log('Input changed:', event.detail.value);
      });
    });
  </script>
</body>
</html>
```

### Framework Integration

#### React Integration

```jsx
// React doesn't need any special setup for Web Components
import '@xaheen-ai/design-system/registry/platforms/vanilla';

function MyReactApp() {
  const handleButtonClick = (event) => {
    console.log('Custom event:', event.detail);
  };

  return (
    <div>
      <xaheen-card variant="elevated">
        <h2 slot="header">React + Web Components</h2>
        <xaheen-input label="Name" name="name" />
        <xaheen-button 
          variant="primary"
          onClick={handleButtonClick}
        >
          Submit
        </xaheen-button>
      </xaheen-card>
    </div>
  );
}
```

#### Vue Integration

```vue
<template>
  <div>
    <xaheen-card variant="elevated">
      <h2 slot="header">Vue + Web Components</h2>
      <xaheen-input 
        label="Name" 
        name="name"
        @xaheen-input="handleInput"
      />
      <xaheen-button 
        variant="primary"
        @xaheen-click="handleClick"
      >
        Submit
      </xaheen-button>
    </xaheen-card>
  </div>
</template>

<script setup>
import '@xaheen-ai/design-system/registry/platforms/vanilla';

const handleInput = (event) => {
  console.log('Input value:', event.detail.value);
};

const handleClick = (event) => {
  console.log('Button clicked:', event.detail);
};
</script>
```

#### Angular Integration

```typescript
// app.component.ts
import { Component, CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import '@xaheen-ai/design-system/registry/platforms/vanilla';

@Component({
  selector: 'app-root',
  template: `
    <xaheen-card variant="elevated">
      <h2 slot="header">Angular + Web Components</h2>
      <xaheen-input 
        label="Name" 
        name="name"
        (xaheen-input)="handleInput($event)"
      ></xaheen-input>
      <xaheen-button 
        variant="primary"
        (xaheen-click)="handleClick($event)"
      >
        Submit
      </xaheen-button>
    </xaheen-card>
  `,
  schemas: [CUSTOM_ELEMENTS_SCHEMA]
})
export class AppComponent {
  handleInput(event: CustomEvent) {
    console.log('Input value:', event.detail.value);
  }

  handleClick(event: CustomEvent) {
    console.log('Button clicked:', event.detail);
  }
}
```

## Core Components

### XaheenButton (`<xaheen-button>`)

Interactive button element with multiple variants, sizes, and states.

```html
<!-- Basic button -->
<xaheen-button variant="primary" size="md">
  Click me
</xaheen-button>

<!-- Button with loading state -->
<xaheen-button variant="primary" loading>
  Processing...
</xaheen-button>

<!-- Disabled button -->
<xaheen-button disabled>
  Disabled
</xaheen-button>

<!-- Full width button -->
<xaheen-button variant="primary" fullwidth>
  Full Width
</xaheen-button>

<!-- Button with icon -->
<xaheen-button variant="outline">
  <svg slot="startIcon" width="16" height="16" viewBox="0 0 24 24">
    <path fill="currentColor" d="M19 13h-6v6h-2v-6H5v-2h6V5h2v6h6v2z"/>
  </svg>
  Add Item
</xaheen-button>
```

**Attributes:**
- `variant`: `primary` | `secondary` | `outline` | `ghost` | `destructive`
- `size`: `xs` | `sm` | `md` | `lg` | `xl`
- `disabled`: Boolean - Disabled state
- `loading`: Boolean - Loading state with spinner
- `fullwidth`: Boolean - Full width button
- `type`: `button` | `submit` | `reset`
- `aria-label`: String - Accessibility label

**Properties (JavaScript):**
```javascript
const button = document.querySelector('xaheen-button');
button.variant = 'primary';
button.disabled = true;
button.loading = false;
```

**Events:**
- `xaheen-click`: Fired when button is clicked
- `xaheen-focus`: Fired when button receives focus
- `xaheen-blur`: Fired when button loses focus

**Slots:**
- `startIcon`: Icon before text
- `endIcon`: Icon after text
- `default`: Button text content

### XaheenInput (`<xaheen-input>`)

Form-associated text input with validation and error handling.

```html
<!-- Basic input -->
<xaheen-input 
  label="Email Address"
  type="email"
  name="email"
  placeholder="your@email.com"
  required
></xaheen-input>

<!-- Input with error -->
<xaheen-input 
  label="Password"
  type="password" 
  name="password"
  error="Password must be at least 8 characters"
  required
></xaheen-input>

<!-- Input with helper text -->
<xaheen-input 
  label="Username"
  name="username"
  helper-text="Must be unique and 3-20 characters"
></xaheen-input>

<!-- Read-only input -->
<xaheen-input 
  label="User ID"
  value="user123"
  readonly
></xaheen-input>

<!-- Input with custom validation -->
<xaheen-input 
  label="Phone Number"
  type="tel"
  pattern="[0-9]{3}-[0-9]{3}-[0-9]{4}"
  title="Format: 123-456-7890"
></xaheen-input>
```

**Attributes:**
- `type`: `text` | `email` | `password` | `number` | `search` | `tel` | `url`
- `value`: String - Current value
- `placeholder`: String - Placeholder text
- `label`: String - Field label
- `name`: String - Form field name
- `disabled`: Boolean - Disabled state
- `required`: Boolean - Required field
- `readonly`: Boolean - Read-only state
- `error`: String - Error message
- `helper-text`: String - Helper text
- Plus all standard input attributes

**Properties (JavaScript):**
```javascript
const input = document.querySelector('xaheen-input');
input.value = 'new value';
input.error = 'Validation failed';
input.disabled = true;
console.log(input.validity); // ValidityState object
```

**Events:**
- `xaheen-input`: Fired when value changes
- `xaheen-change`: Fired when input loses focus with changed value
- `xaheen-focus`: Fired when input receives focus
- `xaheen-blur`: Fired when input loses focus
- `xaheen-invalid`: Fired when validation fails

### XaheenCard (`<xaheen-card>`)

Flexible container for grouping related content with slots for structure.

```html
<!-- Basic card -->
<xaheen-card variant="default" padding="md">
  <h3 slot="header">Card Title</h3>
  <p>This is the card content area.</p>
  <div slot="footer">
    <xaheen-button size="sm">Action</xaheen-button>
  </div>
</xaheen-card>

<!-- Elevated card -->
<xaheen-card variant="elevated" padding="lg">
  <div slot="header">
    <h3>Advanced Card</h3>
    <p>With subtitle</p>
  </div>
  <p>Card content with more padding.</p>
</xaheen-card>

<!-- Clickable card -->
<xaheen-card 
  variant="outlined" 
  clickable 
  hoverable
  aria-label="View product details"
>
  <h4 slot="header">Product Name</h4>
  <p>Product description goes here.</p>
  <div slot="footer">
    <span>$99.99</span>
  </div>
</xaheen-card>

<!-- Interactive card with keyboard support -->
<xaheen-card 
  clickable
  tabindex="0"
  role="button"
  aria-pressed="false"
>
  <h4 slot="header">Toggle Card</h4>
  <p>Press Enter or Space to toggle.</p>
</xaheen-card>
```

**Attributes:**
- `variant`: `default` | `outlined` | `filled` | `elevated`
- `padding`: `none` | `sm` | `md` | `lg` | `xl`
- `hoverable`: Boolean - Adds hover effects
- `clickable`: Boolean - Makes entire card clickable
- `tabindex`: String - Tab order (for keyboard navigation)
- `role`: String - ARIA role
- `aria-label`: String - Accessibility label

**Properties (JavaScript):**
```javascript
const card = document.querySelector('xaheen-card');
card.variant = 'elevated';
card.clickable = true;
card.hoverable = true;
```

**Events:**
- `xaheen-card-click`: Fired when card is clicked (if clickable)
- `xaheen-card-mouseenter`: Fired on mouse enter
- `xaheen-card-mouseleave`: Fired on mouse leave
- `xaheen-card-focus`: Fired when card receives focus
- `xaheen-card-blur`: Fired when card loses focus
- `xaheen-card-keydown`: Fired on keydown (for keyboard interaction)

**Slots:**
- `header`: Card header content
- `default`: Main card content
- `footer`: Card footer content

## Advanced Patterns

### Custom Component Creation

Extend existing components or create new ones:

```javascript
// Extend existing XaheenButton
class CustomButton extends XaheenButton {
  constructor() {
    super();
    this.addEventListener('xaheen-click', this.handleCustomClick);
  }
  
  handleCustomClick(event) {
    // Add custom behavior
    console.log('Custom button clicked:', this.textContent);
    
    // Add analytics tracking
    if (window.analytics) {
      window.analytics.track('button_click', {
        text: this.textContent,
        variant: this.variant
      });
    }
  }
  
  connectedCallback() {
    super.connectedCallback();
    // Additional setup
    this.setAttribute('data-custom', 'true');
  }
}

// Register custom element
customElements.define('custom-button', CustomButton);
```

### Form Integration

Web Components work seamlessly with native forms:

```html
<form id="registration-form">
  <fieldset>
    <legend>Personal Information</legend>
    
    <xaheen-input 
      name="firstName" 
      label="First Name" 
      required
      autocomplete="given-name"
    ></xaheen-input>
    
    <xaheen-input 
      name="lastName" 
      label="Last Name" 
      required
      autocomplete="family-name"
    ></xaheen-input>
    
    <xaheen-input 
      name="email" 
      type="email" 
      label="Email" 
      required
      autocomplete="email"
    ></xaheen-input>
  </fieldset>
  
  <fieldset>
    <legend>Account Settings</legend>
    
    <xaheen-input 
      name="username" 
      label="Username" 
      required
      minlength="3"
      maxlength="20"
      pattern="[a-zA-Z0-9_]+"
      title="Only letters, numbers, and underscores allowed"
    ></xaheen-input>
    
    <xaheen-input 
      name="password" 
      type="password" 
      label="Password" 
      required
      minlength="8"
      autocomplete="new-password"
    ></xaheen-input>
  </fieldset>
  
  <xaheen-button type="submit" variant="primary" size="lg">
    Create Account
  </xaheen-button>
</form>

<script>
document.getElementById('registration-form').addEventListener('submit', (event) => {
  event.preventDefault();
  
  // Get form data
  const formData = new FormData(event.target);
  const data = Object.fromEntries(formData);
  
  // Validate form
  const inputs = event.target.querySelectorAll('xaheen-input');
  let isValid = true;
  
  inputs.forEach(input => {
    if (!input.checkValidity()) {
      input.error = input.validationMessage;
      isValid = false;
    } else {
      input.error = '';
    }
  });
  
  if (isValid) {
    console.log('Form data:', data);
    // Submit form
    submitRegistration(data);
  } else {
    console.log('Form validation failed');
  }
});

async function submitRegistration(data) {
  try {
    const response = await fetch('/api/register', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    });
    
    if (response.ok) {
      showSuccess('Account created successfully!');
    } else {
      throw new Error('Registration failed');
    }
  } catch (error) {
    showError('Registration failed. Please try again.');
  }
}
</script>
```

### Dynamic Content Management

```html
<div id="card-container"></div>

<script>
class CardManager {
  constructor(container) {
    this.container = container;
    this.cards = [];
  }
  
  addCard(data) {
    const card = document.createElement('xaheen-card');
    card.variant = 'elevated';
    card.clickable = true;
    card.setAttribute('aria-label', `View ${data.title}`);
    
    // Set up slots
    const header = document.createElement('h3');
    header.slot = 'header';
    header.textContent = data.title;
    
    const content = document.createElement('p');
    content.textContent = data.description;
    
    const footer = document.createElement('div');
    footer.slot = 'footer';
    footer.innerHTML = `<span>${data.date}</span>`;
    
    card.appendChild(header);
    card.appendChild(content);
    card.appendChild(footer);
    
    // Add event listener
    card.addEventListener('xaheen-card-click', (event) => {
      this.handleCardClick(event, data);
    });
    
    this.container.appendChild(card);
    this.cards.push({ element: card, data });
    
    return card;
  }
  
  removeCard(index) {
    if (this.cards[index]) {
      this.cards[index].element.remove();
      this.cards.splice(index, 1);
    }
  }
  
  handleCardClick(event, data) {
    console.log('Card clicked:', data);
    // Handle click action
    window.location.href = `/details/${data.id}`;
  }
}

// Usage
const manager = new CardManager(document.getElementById('card-container'));

// Add some cards
const cardData = [
  { id: 1, title: 'First Card', description: 'Description 1', date: '2024-01-01' },
  { id: 2, title: 'Second Card', description: 'Description 2', date: '2024-01-02' },
  { id: 3, title: 'Third Card', description: 'Description 3', date: '2024-01-03' }
];

cardData.forEach(data => manager.addCard(data));
</script>
```

### Event-Driven Architecture

```html
<div id="app-container">
  <xaheen-input 
    id="search-input" 
    label="Search" 
    placeholder="Type to search..."
  ></xaheen-input>
  
  <div id="results-container"></div>
  
  <xaheen-button id="load-more" variant="outline" style="display: none;">
    Load More
  </xaheen-button>
</div>

<script>
class SearchApp {
  constructor() {
    this.searchInput = document.getElementById('search-input');
    this.resultsContainer = document.getElementById('results-container');
    this.loadMoreButton = document.getElementById('load-more');
    
    this.currentQuery = '';
    this.currentPage = 1;
    this.hasMore = false;
    
    this.setupEventListeners();
  }
  
  setupEventListeners() {
    // Debounced search
    let searchTimeout;
    this.searchInput.addEventListener('xaheen-input', (event) => {
      clearTimeout(searchTimeout);
      searchTimeout = setTimeout(() => {
        this.handleSearch(event.detail.value);
      }, 300);
    });
    
    // Load more results
    this.loadMoreButton.addEventListener('xaheen-click', () => {
      this.loadMoreResults();
    });
    
    // Handle keyboard shortcuts
    document.addEventListener('keydown', (event) => {
      if (event.key === '/' && event.ctrlKey) {
        event.preventDefault();
        this.searchInput.focus();
      }
    });
  }
  
  async handleSearch(query) {
    if (query === this.currentQuery) return;
    
    this.currentQuery = query;
    this.currentPage = 1;
    this.resultsContainer.innerHTML = '';
    
    if (!query.trim()) {
      this.loadMoreButton.style.display = 'none';
      return;
    }
    
    try {
      const results = await this.searchAPI(query, 1);
      this.displayResults(results.items);
      this.hasMore = results.hasMore;
      this.toggleLoadMore();
    } catch (error) {
      this.showError('Search failed. Please try again.');
    }
  }
  
  async loadMoreResults() {
    if (!this.hasMore) return;
    
    this.loadMoreButton.loading = true;
    
    try {
      const results = await this.searchAPI(this.currentQuery, this.currentPage + 1);
      this.displayResults(results.items, true);
      this.currentPage++;
      this.hasMore = results.hasMore;
      this.toggleLoadMore();
    } catch (error) {
      this.showError('Failed to load more results.');
    } finally {
      this.loadMoreButton.loading = false;
    }
  }
  
  displayResults(items, append = false) {
    if (!append) {
      this.resultsContainer.innerHTML = '';
    }
    
    items.forEach(item => {
      const card = this.createResultCard(item);
      this.resultsContainer.appendChild(card);
    });
  }
  
  createResultCard(item) {
    const card = document.createElement('xaheen-card');
    card.variant = 'outlined';
    card.clickable = true;
    card.setAttribute('aria-label', `View ${item.title}`);
    
    const header = document.createElement('h4');
    header.slot = 'header';
    header.textContent = item.title;
    
    const content = document.createElement('p');
    content.textContent = item.description;
    
    const footer = document.createElement('div');
    footer.slot = 'footer';
    footer.innerHTML = `<span>${item.category}</span>`;
    
    card.appendChild(header);
    card.appendChild(content);
    card.appendChild(footer);
    
    card.addEventListener('xaheen-card-click', () => {
      this.viewResult(item);
    });
    
    return card;
  }
  
  toggleLoadMore() {
    this.loadMoreButton.style.display = this.hasMore ? 'block' : 'none';
  }
  
  async searchAPI(query, page) {
    const response = await fetch(`/api/search?q=${encodeURIComponent(query)}&page=${page}`);
    if (!response.ok) throw new Error('Search failed');
    return response.json();
  }
  
  viewResult(item) {
    window.location.href = `/item/${item.id}`;
  }
  
  showError(message) {
    // Could create a toast notification component
    console.error(message);
    alert(message); // Simple fallback
  }
}

// Initialize app
document.addEventListener('DOMContentLoaded', () => {
  new SearchApp();
});
</script>
```

## Platform-Specific Features

### Shadow DOM Styling

Style components using CSS custom properties and parts:

```css
/* Global styling via CSS custom properties */
:root {
  --xaheen-color-primary-500: #3b82f6;
  --xaheen-color-primary-600: #2563eb;
  --xaheen-spacing-button-md: 3rem;
  --xaheen-border-radius-lg: 0.75rem;
}

/* Component-specific overrides */
xaheen-button {
  --colors-primary-500: #10b981; /* Custom green */
  --spacing-button-md: 4rem; /* Larger button */
}

/* Style Shadow DOM parts */
xaheen-button::part(button) {
  text-transform: uppercase;
  letter-spacing: 0.05em;
  font-weight: 600;
}

xaheen-input::part(input) {
  font-family: 'JetBrains Mono', monospace;
}

xaheen-input::part(label) {
  font-weight: 500;
  color: #374151;
}

xaheen-input::part(error) {
  font-size: 0.875rem;
  color: #dc2626;
}

xaheen-card::part(card) {
  border: 2px solid transparent;
  transition: border-color 0.2s ease;
}

xaheen-card[hoverable]::part(card):hover {
  border-color: var(--xaheen-color-primary-200);
}

/* State-based styling using data attributes */
xaheen-button[data-variant="primary"] {
  --button-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);
}

xaheen-button[data-size="lg"] {
  --button-font-size: 1.125rem;
  --button-padding: 0.875rem 2rem;
}

xaheen-button[disabled] {
  --button-opacity: 0.5;
  --button-cursor: not-allowed;
}

xaheen-input[data-error="true"] {
  --input-border-color: #dc2626;
  --input-focus-border-color: #dc2626;
}
```

### Custom Element Lifecycle

```javascript
class CustomFormCard extends HTMLElement {
  constructor() {
    super();
    
    // Create shadow root
    this.attachShadow({ mode: 'open' });
    
    // Initialize state
    this.formData = {};
    this.isValid = false;
  }
  
  connectedCallback() {
    this.render();
    this.setupEventListeners();
    
    // Observe attributes
    this.observer = new MutationObserver(this.handleAttributeChanges.bind(this));
    this.observer.observe(this, { attributes: true });
  }
  
  disconnectedCallback() {
    // Cleanup
    if (this.observer) {
      this.observer.disconnect();
    }
    
    // Remove event listeners
    this.removeEventListeners();
  }
  
  attributeChangedCallback(name, oldValue, newValue) {
    if (oldValue !== newValue) {
      this.handleAttributeChange(name, newValue);
    }
  }
  
  static get observedAttributes() {
    return ['title', 'submit-text', 'disabled'];
  }
  
  render() {
    this.shadowRoot.innerHTML = `
      <style>
        :host {
          display: block;
          --card-padding: 1.5rem;
          --card-border-radius: 0.5rem;
          --card-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);
        }
        
        .form-card {
          background: white;
          border-radius: var(--card-border-radius);
          box-shadow: var(--card-shadow);
          padding: var(--card-padding);
        }
        
        .header {
          margin-bottom: 1.5rem;
        }
        
        .header h2 {
          margin: 0;
          font-size: 1.5rem;
          font-weight: 600;
          color: #111827;
        }
        
        .form-content {
          margin-bottom: 1.5rem;
        }
        
        .form-footer {
          display: flex;
          justify-content: flex-end;
          gap: 0.75rem;
        }
      </style>
      
      <div class="form-card">
        <div class="header">
          <h2>${this.getAttribute('title') || 'Form'}</h2>
        </div>
        
        <div class="form-content">
          <slot name="content"></slot>
        </div>
        
        <div class="form-footer">
          <xaheen-button variant="outline" type="button" id="cancel-btn">
            Cancel
          </xaheen-button>
          <xaheen-button 
            variant="primary" 
            type="submit" 
            id="submit-btn"
            ${this.hasAttribute('disabled') ? 'disabled' : ''}
          >
            ${this.getAttribute('submit-text') || 'Submit'}
          </xaheen-button>
        </div>
      </div>
    `;
  }
  
  setupEventListeners() {
    const cancelBtn = this.shadowRoot.getElementById('cancel-btn');
    const submitBtn = this.shadowRoot.getElementById('submit-btn');
    
    cancelBtn.addEventListener('xaheen-click', this.handleCancel.bind(this));
    submitBtn.addEventListener('xaheen-click', this.handleSubmit.bind(this));
    
    // Listen for form input changes in slotted content
    this.addEventListener('xaheen-input', this.handleInputChange.bind(this));
  }
  
  removeEventListeners() {
    // Remove listeners if needed
  }
  
  handleAttributeChanges(mutations) {
    mutations.forEach(mutation => {
      if (mutation.type === 'attributes') {
        this.handleAttributeChange(mutation.attributeName, this.getAttribute(mutation.attributeName));
      }
    });
  }
  
  handleAttributeChange(name, value) {
    switch (name) {
      case 'disabled':
        const submitBtn = this.shadowRoot.getElementById('submit-btn');
        if (submitBtn) {
          if (value !== null) {
            submitBtn.setAttribute('disabled', '');
          } else {
            submitBtn.removeAttribute('disabled');
          }
        }
        break;
      case 'title':
      case 'submit-text':
        this.render();
        this.setupEventListeners();
        break;
    }
  }
  
  handleInputChange(event) {
    const input = event.target;
    this.formData[input.name] = input.value;
    
    // Validate form
    this.validateForm();
  }
  
  validateForm() {
    const inputs = this.querySelectorAll('xaheen-input[required]');
    this.isValid = Array.from(inputs).every(input => input.checkValidity());
    
    // Update submit button state
    const submitBtn = this.shadowRoot.getElementById('submit-btn');
    if (this.isValid) {
      submitBtn.removeAttribute('disabled');
    } else {
      submitBtn.setAttribute('disabled', '');
    }
  }
  
  handleCancel() {
    this.dispatchEvent(new CustomEvent('form-cancel', {
      bubbles: true,
      detail: { formData: this.formData }
    }));
  }
  
  handleSubmit() {
    if (this.isValid) {
      this.dispatchEvent(new CustomEvent('form-submit', {
        bubbles: true,
        detail: { formData: this.formData }
      }));
    }
  }
}

// Register the custom element
customElements.define('custom-form-card', CustomFormCard);
```

### Server-Side Rendering Support

```html
<!-- SSR-friendly markup -->
<xaheen-card variant="elevated" padding="lg">
  <h2 slot="header">Product Details</h2>
  
  <!-- Fallback content for when JavaScript isn't loaded -->
  <noscript>
    <div style="border: 1px solid #e5e7eb; border-radius: 8px; padding: 24px;">
      <h2 style="margin-top: 0;">Product Details</h2>
      <p>JavaScript is required for full functionality.</p>
    </div>
  </noscript>
  
  <div class="product-info">
    <p><strong>Name:</strong> Amazing Product</p>
    <p><strong>Price:</strong> $99.99</p>
    <p><strong>Description:</strong> This is an amazing product.</p>
  </div>
  
  <div slot="footer">
    <!-- Graceful degradation for buttons -->
    <xaheen-button variant="primary">
      Add to Cart
      <!-- Fallback for non-JS -->
      <noscript>
        <button style="background: #3b82f6; color: white; border: none; padding: 8px 16px; border-radius: 4px;">
          Add to Cart
        </button>
      </noscript>
    </xaheen-button>
  </div>
</xaheen-card>

<!-- Progressive enhancement script -->
<script type="module">
  // Only load components when needed
  if ('customElements' in window && 'shadowRoot' in Element.prototype) {
    import('@xaheen-ai/design-system/registry/platforms/vanilla/card.js');
    import('@xaheen-ai/design-system/registry/platforms/vanilla/button.js');
  } else {
    // Polyfill for older browsers
    import('@webcomponents/webcomponentsjs/webcomponents-loader.js');
  }
</script>
```

## Best Practices

### 1. Performance Optimization

```javascript
// Lazy load components only when needed
const LazyComponentLoader = {
  loadedComponents: new Set(),
  
  async loadComponent(tagName) {
    if (this.loadedComponents.has(tagName) || customElements.get(tagName)) {
      return;
    }
    
    const componentMap = {
      'xaheen-button': () => import('@xaheen-ai/design-system/registry/platforms/vanilla/button.js'),
      'xaheen-input': () => import('@xaheen-ai/design-system/registry/platforms/vanilla/input.js'),
      'xaheen-card': () => import('@xaheen-ai/design-system/registry/platforms/vanilla/card.js')
    };
    
    const loader = componentMap[tagName];
    if (loader) {
      await loader();
      this.loadedComponents.add(tagName);
    }
  },
  
  // Load components when they enter viewport
  observeComponents() {
    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          this.loadComponent(entry.target.tagName.toLowerCase());
        }
      });
    });
    
    // Observe all unregistered custom elements
    document.querySelectorAll('[class*="xaheen-"]:not(:defined)').forEach(el => {
      observer.observe(el);
    });
  }
};

// Usage
LazyComponentLoader.observeComponents();
```

### 2. Error Handling

```javascript
class ErrorBoundary {
  constructor(container) {
    this.container = container;
    this.setupErrorHandling();
  }
  
  setupErrorHandling() {
    // Handle component errors
    this.container.addEventListener('error', this.handleComponentError.bind(this));
    
    // Handle custom event errors
    this.container.addEventListener('xaheen-error', this.handleCustomError.bind(this));
    
    // Global error handler
    window.addEventListener('unhandledrejection', this.handlePromiseRejection.bind(this));
  }
  
  handleComponentError(event) {
    console.error('Component error:', event.error);
    
    const errorCard = this.createErrorCard('Component Error', event.error.message);
    event.target.replaceWith(errorCard);
  }
  
  handleCustomError(event) {
    console.error('Custom error:', event.detail);
    this.showErrorToast(event.detail.message);
  }
  
  handlePromiseRejection(event) {
    console.error('Unhandled promise rejection:', event.reason);
    this.showErrorToast('An unexpected error occurred.');
  }
  
  createErrorCard(title, message) {
    const card = document.createElement('xaheen-card');
    card.variant = 'outlined';
    card.style.borderColor = '#dc2626';
    
    const header = document.createElement('h4');
    header.slot = 'header';
    header.textContent = title;
    header.style.color = '#dc2626';
    
    const content = document.createElement('p');
    content.textContent = message;
    content.style.color = '#6b7280';
    
    card.appendChild(header);
    card.appendChild(content);
    
    return card;
  }
  
  showErrorToast(message) {
    // Create a simple toast notification
    const toast = document.createElement('div');
    toast.style.cssText = `
      position: fixed;
      top: 20px;
      right: 20px;
      background: #dc2626;
      color: white;
      padding: 1rem;
      border-radius: 0.5rem;
      z-index: 9999;
      box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);
    `;
    toast.textContent = message;
    
    document.body.appendChild(toast);
    
    setTimeout(() => {
      toast.remove();
    }, 5000);
  }
}

// Initialize error boundary
document.addEventListener('DOMContentLoaded', () => {
  new ErrorBoundary(document.body);
});
```

### 3. Accessibility Best Practices

```html
<!-- Proper semantic structure -->
<main id="main-content" role="main">
  <h1>Page Title</h1>
  
  <!-- Skip link for keyboard users -->
  <a href="#main-content" class="skip-link">Skip to main content</a>
  
  <!-- Form with proper labeling -->
  <form role="form" aria-labelledby="form-title" novalidate>
    <h2 id="form-title">Contact Information</h2>
    
    <fieldset>
      <legend>Personal Details</legend>
      
      <xaheen-input 
        label="Full Name"
        name="fullName"
        required
        aria-describedby="name-help"
        autocomplete="name"
      ></xaheen-input>
      <div id="name-help" class="help-text">
        Enter your first and last name
      </div>
      
      <xaheen-input 
        label="Email Address"
        type="email"
        name="email"
        required
        aria-describedby="email-help"
        autocomplete="email"
      ></xaheen-input>
      <div id="email-help" class="help-text">
        We'll never share your email
      </div>
    </fieldset>
    
    <!-- Error summary -->
    <div id="error-summary" role="alert" aria-live="polite" style="display: none;">
      <h3>Please correct the following errors:</h3>
      <ul id="error-list"></ul>
    </div>
    
    <xaheen-button 
      type="submit" 
      variant="primary"
      aria-describedby="submit-help"
    >
      Submit Form
    </xaheen-button>
    <div id="submit-help" class="help-text">
      Press Enter or click to submit the form
    </div>
  </form>
</main>

<script>
// Accessible form validation
class AccessibleFormValidator {
  constructor(form) {
    this.form = form;
    this.errorSummary = form.querySelector('#error-summary');
    this.errorList = form.querySelector('#error-list');
    this.setupValidation();
  }
  
  setupValidation() {
    this.form.addEventListener('submit', this.handleSubmit.bind(this));
    
    // Real-time validation
    const inputs = this.form.querySelectorAll('xaheen-input');
    inputs.forEach(input => {
      input.addEventListener('xaheen-blur', this.validateField.bind(this));
      input.addEventListener('xaheen-input', this.clearFieldError.bind(this));
    });
  }
  
  handleSubmit(event) {
    event.preventDefault();
    
    const errors = this.validateForm();
    
    if (errors.length > 0) {
      this.showErrors(errors);
      this.focusFirstError();
    } else {
      this.hideErrors();
      this.submitForm();
    }
  }
  
  validateForm() {
    const inputs = this.form.querySelectorAll('xaheen-input[required]');
    const errors = [];
    
    inputs.forEach(input => {
      const error = this.validateField({ target: input });
      if (error) {
        errors.push(error);
      }
    });
    
    return errors;
  }
  
  validateField(event) {
    const input = event.target;
    let error = null;
    
    if (input.required && !input.value.trim()) {
      error = {
        field: input.name,
        message: `${input.label} is required`,
        element: input
      };
    } else if (input.type === 'email' && input.value && !this.isValidEmail(input.value)) {
      error = {
        field: input.name,
        message: `${input.label} must be a valid email address`,
        element: input
      };
    }
    
    if (error) {
      input.error = error.message;
      input.setAttribute('aria-invalid', 'true');
    } else {
      input.error = '';
      input.setAttribute('aria-invalid', 'false');
    }
    
    return error;
  }
  
  clearFieldError(event) {
    const input = event.target;
    if (input.error) {
      input.error = '';
      input.setAttribute('aria-invalid', 'false');
      this.updateErrorSummary();
    }
  }
  
  showErrors(errors) {
    this.errorList.innerHTML = '';
    
    errors.forEach(error => {
      const li = document.createElement('li');
      const link = document.createElement('a');
      link.href = `#${error.element.id}`;
      link.textContent = error.message;
      link.addEventListener('click', (e) => {
        e.preventDefault();
        error.element.focus();
      });
      
      li.appendChild(link);
      this.errorList.appendChild(li);
    });
    
    this.errorSummary.style.display = 'block';
    
    // Announce errors to screen readers
    this.announceToScreenReader(`Form contains ${errors.length} errors. Please review and correct.`);
  }
  
  hideErrors() {
    this.errorSummary.style.display = 'none';
  }
  
  updateErrorSummary() {
    const currentErrors = this.validateForm();
    if (currentErrors.length === 0) {
      this.hideErrors();
    }
  }
  
  focusFirstError() {
    const firstErrorField = this.form.querySelector('xaheen-input[aria-invalid="true"]');
    if (firstErrorField) {
      firstErrorField.focus();
    }
  }
  
  announceToScreenReader(message) {
    const announcement = document.createElement('div');
    announcement.setAttribute('aria-live', 'assertive');
    announcement.setAttribute('aria-atomic', 'true');
    announcement.style.cssText = 'position: absolute; left: -10000px; width: 1px; height: 1px; overflow: hidden;';
    announcement.textContent = message;
    
    document.body.appendChild(announcement);
    
    setTimeout(() => {
      document.body.removeChild(announcement);
    }, 1000);
  }
  
  isValidEmail(email) {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
  }
  
  async submitForm() {
    const formData = new FormData(this.form);
    const data = Object.fromEntries(formData);
    
    try {
      const response = await fetch('/api/contact', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data)
      });
      
      if (response.ok) {
        this.announceToScreenReader('Form submitted successfully!');
        // Handle success
      } else {
        throw new Error('Submission failed');
      }
    } catch (error) {
      this.announceToScreenReader('Form submission failed. Please try again.');
    }
  }
}

// Initialize accessible form validation
document.addEventListener('DOMContentLoaded', () => {
  const forms = document.querySelectorAll('form');
  forms.forEach(form => {
    new AccessibleFormValidator(form);
  });
});
</script>
```

## Migration Guide

### From React Component Libraries

#### From React to Web Components

```javascript
// Before (React)
import { Button, Input, Card } from 'some-react-library';

function MyComponent() {
  const [email, setEmail] = useState('');
  
  return (
    <Card variant="elevated">
      <Card.Header title="Sign In" />
      <Card.Content>
        <Input 
          label="Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />
        <Button variant="primary" onClick={handleSubmit}>
          Sign In
        </Button>
      </Card.Content>
    </Card>
  );
}

// After (Web Components)
import '@xaheen-ai/design-system/registry/platforms/vanilla';

function createSignInCard() {
  const container = document.createElement('div');
  container.innerHTML = `
    <xaheen-card variant="elevated">
      <h3 slot="header">Sign In</h3>
      <xaheen-input label="Email" name="email"></xaheen-input>
      <xaheen-button variant="primary" type="submit">Sign In</xaheen-button>
    </xaheen-card>
  `;
  
  const input = container.querySelector('xaheen-input');
  const button = container.querySelector('xaheen-button');
  
  button.addEventListener('xaheen-click', () => {
    handleSubmit(input.value);
  });
  
  return container;
}
```

### From jQuery to Web Components

```javascript
// Before (jQuery)
$('#my-form').on('submit', function(e) {
  e.preventDefault();
  
  const email = $('#email-input').val();
  const $button = $('#submit-button');
  
  $button.prop('disabled', true).text('Loading...');
  
  $.post('/api/submit', { email })
    .done(() => {
      alert('Success!');
    })
    .fail(() => {
      alert('Error!');
    })
    .always(() => {
      $button.prop('disabled', false).text('Submit');
    });
});

// After (Web Components)
import '@xaheen-ai/design-system/registry/platforms/vanilla';

document.addEventListener('DOMContentLoaded', () => {
  const form = document.getElementById('my-form');
  const emailInput = form.querySelector('xaheen-input[name="email"]');
  const submitButton = form.querySelector('xaheen-button[type="submit"]');
  
  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    
    submitButton.loading = true;
    
    try {
      const response = await fetch('/api/submit', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: emailInput.value })
      });
      
      if (response.ok) {
        showSuccess('Form submitted successfully!');
      } else {
        throw new Error('Submission failed');
      }
    } catch (error) {
      showError('Failed to submit form. Please try again.');
    } finally {
      submitButton.loading = false;
    }
  });
});
```

### Migration Checklist

1. **Replace Library Imports**
   - Remove old component library imports
   - Add Xaheen Web Components imports

2. **Update HTML Structure**
   - Replace JSX/template syntax with HTML
   - Use slots instead of children props
   - Convert event handlers to event listeners

3. **Handle State Management**
   - Replace component state with DOM properties
   - Use custom events for component communication
   - Implement form data handling with FormData

4. **Update Event Handling**
   - Replace framework-specific events with custom events
   - Use addEventListener instead of inline handlers
   - Handle keyboard and mouse events appropriately

5. **Accessibility Review**
   - Ensure proper ARIA attributes
   - Test keyboard navigation
   - Verify screen reader announcements

## Troubleshooting

### Common Issues

#### 1. Components Not Registering

```javascript
// Problem: Custom elements not defined
// Error: "Uncaught DOMException: Failed to construct 'CustomElement'"

// Solution: Ensure proper import and registration
import '@xaheen-ai/design-system/registry/platforms/vanilla/button.js';

// Check if component is registered
if (customElements.get('xaheen-button')) {
  console.log('Button component is registered');
} else {
  console.error('Button component not found');
}

// Wait for component definition
customElements.whenDefined('xaheen-button').then(() => {
  console.log('Button component is ready');
  const button = document.createElement('xaheen-button');
  document.body.appendChild(button);
});
```

#### 2. Shadow DOM Style Issues

```css
/* Problem: Styles not applying to Shadow DOM */

/* Solution: Use CSS custom properties */
xaheen-button {
  --button-background: #10b981;
  --button-color: white;
}

/* Or target Shadow DOM parts */
xaheen-button::part(button) {
  background: #10b981;
  color: white;
}

/* Check if Shadow DOM is supported */
if (!('attachShadow' in Element.prototype)) {
  console.warn('Shadow DOM not supported');
  // Load polyfill or provide fallback
}
```

#### 3. Event Handling Problems

```javascript
// Problem: Events not firing
// Solution: Use correct event names and ensure component is loaded

// Wrong
button.addEventListener('click', handler); // Won't work

// Correct
button.addEventListener('xaheen-click', handler);

// Ensure component is ready
customElements.whenDefined('xaheen-button').then(() => {
  const button = document.querySelector('xaheen-button');
  button.addEventListener('xaheen-click', (event) => {
    console.log('Button clicked:', event.detail);
  });
});
```

#### 4. Form Integration Issues

```javascript
// Problem: Form data not submitted
// Solution: Ensure proper form association

// Check form association
const input = document.querySelector('xaheen-input');
console.log('Form:', input.form); // Should reference parent form
console.log('Name:', input.name); // Should have name attribute
console.log('Value:', input.value); // Should have current value

// Manual form data collection if needed
function collectFormData(form) {
  const formData = new FormData();
  const inputs = form.querySelectorAll('xaheen-input');
  
  inputs.forEach(input => {
    if (input.name && input.value) {
      formData.append(input.name, input.value);
    }
  });
  
  return formData;
}
```

#### 5. Browser Compatibility

```javascript
// Check for required features
function checkBrowserSupport() {
  const features = {
    customElements: 'customElements' in window,
    shadowDOM: 'attachShadow' in Element.prototype,
    esModules: 'noModule' in document.createElement('script'),
    cssCustomProperties: CSS.supports('color', 'var(--fake-var)')
  };
  
  const unsupported = Object.entries(features)
    .filter(([name, supported]) => !supported)
    .map(([name]) => name);
  
  if (unsupported.length > 0) {
    console.warn('Unsupported features:', unsupported);
    loadPolyfills(unsupported);
  }
}

function loadPolyfills(missing) {
  const polyfills = [];
  
  if (missing.includes('customElements') || missing.includes('shadowDOM')) {
    polyfills.push('https://unpkg.com/@webcomponents/webcomponentsjs/webcomponents-loader.js');
  }
  
  if (missing.includes('cssCustomProperties')) {
    polyfills.push('https://unpkg.com/css-vars-ponyfill/dist/css-vars-ponyfill.min.js');
  }
  
  // Load polyfills sequentially
  loadPolyfillsSequentially(polyfills);
}

async function loadPolyfillsSequentially(urls) {
  for (const url of urls) {
    await loadScript(url);
  }
}

function loadScript(url) {
  return new Promise((resolve, reject) => {
    const script = document.createElement('script');
    script.src = url;
    script.onload = resolve;
    script.onerror = reject;
    document.head.appendChild(script);
  });
}

// Initialize
checkBrowserSupport();
```

### Performance Issues

#### Bundle Size Optimization

```javascript
// Problem: Large bundle size
// Solution: Load components lazily

class ComponentLoader {
  constructor() {
    this.loadedComponents = new Set();
    this.componentQueue = new Map();
  }
  
  async loadComponent(tagName) {
    if (this.loadedComponents.has(tagName)) {
      return;
    }
    
    // Check if already loading
    if (this.componentQueue.has(tagName)) {
      return this.componentQueue.get(tagName);
    }
    
    // Start loading
    const loadPromise = this.importComponent(tagName);
    this.componentQueue.set(tagName, loadPromise);
    
    try {
      await loadPromise;
      this.loadedComponents.add(tagName);
    } finally {
      this.componentQueue.delete(tagName);
    }
  }
  
  async importComponent(tagName) {
    const componentMap = {
      'xaheen-button': () => import('@xaheen-ai/design-system/registry/platforms/vanilla/button.js'),
      'xaheen-input': () => import('@xaheen-ai/design-system/registry/platforms/vanilla/input.js'),
      'xaheen-card': () => import('@xaheen-ai/design-system/registry/platforms/vanilla/card.js')
    };
    
    const loader = componentMap[tagName];
    if (!loader) {
      throw new Error(`Unknown component: ${tagName}`);
    }
    
    return loader();
  }
  
  // Preload components that will be needed soon
  preloadComponents(tagNames) {
    return Promise.all(tagNames.map(tagName => this.loadComponent(tagName)));
  }
  
  // Load components when they enter the viewport
  observeComponents() {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach(entry => {
          if (entry.isIntersecting) {
            this.loadComponent(entry.target.tagName.toLowerCase());
          }
        });
      },
      { rootMargin: '100px' } // Start loading 100px before entering viewport
    );
    
    // Observe undefined custom elements
    const undefinedElements = document.querySelectorAll(':not(:defined)');
    undefinedElements.forEach(el => {
      if (el.tagName.toLowerCase().startsWith('xaheen-')) {
        observer.observe(el);
      }
    });
  }
}

// Usage
const loader = new ComponentLoader();

// Preload critical components
loader.preloadComponents(['xaheen-button', 'xaheen-input']);

// Lazy load others
loader.observeComponents();
```

### Development Tips

1. **Use Browser DevTools**: Inspect Shadow DOM in Elements panel
2. **Check Console**: Watch for registration errors and warnings
3. **Test Accessibility**: Use screen readers and keyboard navigation
4. **Performance Monitoring**: Monitor bundle size and load times
5. **Cross-Browser Testing**: Test on different browsers and devices

For more help:
- [Web Components Documentation](https://developer.mozilla.org/en-US/docs/Web/Web_Components)
- [Custom Elements v1](https://developers.google.com/web/fundamentals/web-components/customelements)
- [Shadow DOM v1](https://developers.google.com/web/fundamentals/web-components/shadowdom)
- [Xaheen GitHub Issues](https://github.com/xaheen-org/design-system/issues)

## Conclusion

The Xaheen Design System Web Components platform provides a powerful, standards-compliant solution for building framework-agnostic user interfaces. With zero dependencies, excellent performance, and full accessibility support, Web Components offer a future-proof approach to component-based development.

The platform excels in:
- **Universal Compatibility**: Works everywhere JavaScript runs
- **Progressive Enhancement**: Graceful degradation for older browsers  
- **Performance**: Minimal runtime overhead and excellent tree-shaking
- **Standards Compliance**: Built on stable web standards
- **Developer Experience**: TypeScript support and comprehensive tooling

Whether you're building a simple website or a complex application, Xaheen Web Components provide the building blocks for creating accessible, performant, and maintainable user interfaces.