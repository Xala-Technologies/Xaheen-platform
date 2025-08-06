# Xaheen Web Components (Vanilla JS)

Standards-compliant Web Components implementation of the Xaheen Design System with zero dependencies.

## Features

- ✅ **Pure Web Components** - No framework dependencies
- ✅ **Shadow DOM** - Style encapsulation and composition
- ✅ **CSS Custom Properties** - Dynamic theming support
- ✅ **WCAG AAA Compliant** - Full accessibility support
- ✅ **Form Associated** - Native form participation
- ✅ **TypeScript Support** - Full type definitions
- ✅ **Cross-Browser** - Works in all modern browsers

## Components

### Button (`<xaheen-button>`)

Interactive button element with multiple variants and sizes.

```html
<xaheen-button 
  variant="primary" 
  size="md"
  aria-label="Submit form"
>
  Submit
</xaheen-button>
```

**Attributes:**
- `variant` - Visual style: `primary` | `secondary` | `outline` | `ghost` | `destructive`
- `size` - Button size: `xs` | `sm` | `md` | `lg` | `xl`
- `disabled` - Disabled state
- `loading` - Loading state with spinner
- `fullwidth` - Full width button
- `type` - Button type: `button` | `submit` | `reset`

**Events:**
- `xaheen-click` - Custom click event with detail

### Input (`<xaheen-input>`)

Form-associated text input with validation and error handling.

```html
<xaheen-input 
  label="Email Address"
  type="email"
  name="email"
  placeholder="your@email.com"
  required
  error="Please enter a valid email"
></xaheen-input>
```

**Attributes:**
- `type` - Input type: `text` | `email` | `password` | `number` | `search` | `tel` | `url`
- `value` - Current value
- `placeholder` - Placeholder text
- `label` - Field label
- `name` - Form field name
- `disabled` - Disabled state
- `required` - Required field
- `error` - Error message
- `readonly` - Read-only state
- Plus all standard input attributes

**Events:**
- `xaheen-input` - Value changed
- `xaheen-change` - Change event
- `xaheen-focus` - Focus event
- `xaheen-blur` - Blur event

### Card (`<xaheen-card>`)

Flexible container for grouping related content.

```html
<xaheen-card 
  variant="elevated" 
  clickable
  aria-label="View details"
>
  <h4 slot="header">Card Title</h4>
  <p>Card content goes here</p>
  <div slot="footer">
    <xaheen-button size="sm">Action</xaheen-button>
  </div>
</xaheen-card>
```

**Attributes:**
- `variant` - Visual style: `default` | `outlined` | `filled` | `elevated`
- `padding` - Internal padding: `none` | `sm` | `md` | `lg` | `xl`
- `hoverable` - Hover effects
- `clickable` - Makes entire card clickable

**Slots:**
- `header` - Card header content
- `default` - Main card content
- `footer` - Card footer content

**Events:**
- `xaheen-card-click` - Card clicked (when clickable)
- `xaheen-card-mouseenter` - Mouse enter
- `xaheen-card-mouseleave` - Mouse leave
- `xaheen-card-focus` - Focus event
- `xaheen-card-blur` - Blur event

## Installation

### Via NPM

```bash
npm install @xaheen-ai/design-system
```

```javascript
// Import all components
import '@xaheen-ai/design-system/registry/platforms/vanilla';

// Or import individually
import '@xaheen-ai/design-system/registry/platforms/vanilla/button.js';
import '@xaheen-ai/design-system/registry/platforms/vanilla/input.js';
import '@xaheen-ai/design-system/registry/platforms/vanilla/card.js';
```

### Via CDN

```html
<!-- Import all components -->
<script type="module" src="https://unpkg.com/@xaheen-ai/design-system/registry/platforms/vanilla/index.js"></script>

<!-- Or import individually -->
<script type="module">
  import 'https://unpkg.com/@xaheen-ai/design-system/registry/platforms/vanilla/button.js';
  import 'https://unpkg.com/@xaheen-ai/design-system/registry/platforms/vanilla/input.js';
  import 'https://unpkg.com/@xaheen-ai/design-system/registry/platforms/vanilla/card.js';
</script>
```

## Browser Support

- Chrome/Edge 88+
- Firefox 78+
- Safari 14+
- iOS Safari 14+
- Chrome Android 88+

All browsers must support:
- Custom Elements v1
- Shadow DOM v1
- ES Modules
- CSS Custom Properties

## Customization

### CSS Custom Properties

Components use CSS custom properties for theming:

```css
/* Override design tokens */
xaheen-button {
  --colors-primary-500: #your-color;
  --spacing-button-md: 3.5rem;
  --borders-radius-lg: 12px;
}

/* Target Shadow DOM parts */
xaheen-button::part(button) {
  text-transform: uppercase;
}

xaheen-input::part(input) {
  font-family: monospace;
}

xaheen-card::part(header) {
  background-color: #f0f0f0;
}
```

### Extending Components

```javascript
// Extend existing component
class MyButton extends XaheenButton {
  constructor() {
    super();
    // Custom initialization
  }
  
  connectedCallback() {
    super.connectedCallback();
    // Additional setup
  }
}

customElements.define('my-button', MyButton);
```

## Form Integration

Input components are form-associated and work with native forms:

```html
<form id="my-form">
  <xaheen-input 
    name="username" 
    label="Username" 
    required
  ></xaheen-input>
  
  <xaheen-input 
    name="email" 
    type="email" 
    label="Email" 
    required
  ></xaheen-input>
  
  <xaheen-button type="submit">Submit</xaheen-button>
</form>

<script>
document.getElementById('my-form').addEventListener('submit', (e) => {
  e.preventDefault();
  const formData = new FormData(e.target);
  console.log(Object.fromEntries(formData));
});
</script>
```

## Accessibility

All components follow WCAG AAA guidelines:

- **Keyboard Navigation** - Full keyboard support with visible focus indicators
- **Screen Readers** - Proper ARIA labels and live regions
- **Color Contrast** - AAA compliant color ratios
- **Motion** - Respects `prefers-reduced-motion`
- **High Contrast** - Enhanced borders in high contrast mode

## TypeScript Support

Type definitions are included:

```typescript
import { XaheenButton, XaheenInput, XaheenCard } from '@xaheen-ai/design-system/vanilla';

// Type-safe event handling
const button = document.querySelector<XaheenButton>('xaheen-button');
button?.addEventListener('xaheen-click', (event: CustomEvent) => {
  console.log(event.detail);
});

// Type-safe property access
const input = document.querySelector<XaheenInput>('xaheen-input');
if (input) {
  input.value = 'typed value';
  input.error = 'Validation error';
}
```

## Performance

- **Lazy Loading** - Components register only when used
- **Shadow DOM** - Isolated rendering and styling
- **Minimal Size** - ~15KB per component (uncompressed)
- **No Dependencies** - Zero runtime dependencies

## License

MIT License - See LICENSE file for details