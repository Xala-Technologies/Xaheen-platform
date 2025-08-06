/**
 * Universal Component Specifications
 * Framework-agnostic component definitions that work across all platforms
 */

// =============================================================================
// CORE TYPES - PLATFORM AGNOSTIC
// =============================================================================

export type ComponentSize = 'xs' | 'sm' | 'md' | 'lg' | 'xl' | '2xl';
export type ComponentVariant = 'primary' | 'secondary' | 'outline' | 'ghost' | 'destructive';
export type NSMClassification = 'OPEN' | 'RESTRICTED' | 'CONFIDENTIAL' | 'SECRET';

// =============================================================================
// UNIVERSAL COMPONENT INTERFACES
// =============================================================================

/**
 * Base interface for all components across platforms
 */
export interface BaseComponentSpec {
  readonly id: string;
  readonly name: string;
  readonly description: string;
  readonly category: 'atom' | 'molecule' | 'organism';
  readonly platforms: Platform[];
  readonly accessibility: AccessibilitySpec;
  readonly styling: StylingSpec;
  readonly props: PropSpec[];
  readonly variants?: VariantSpec[];
  readonly states?: StateSpec[];
  readonly slots?: SlotSpec[];
}

/**
 * Platform enumeration
 */
export type Platform = 
  | 'react' 
  | 'vue' 
  | 'angular' 
  | 'svelte' 
  | 'electron' 
  | 'nextjs'
  | 'nuxt'
  | 'sveltekit'
  | 'react-native'
  | 'expo'
  | 'ionic'
  | 'radix'
  | 'headless-ui'
  | 'vanilla';

/**
 * Accessibility specification
 */
export interface AccessibilitySpec {
  readonly wcagLevel: 'AA' | 'AAA';
  readonly roles: string[];
  readonly ariaAttributes: string[];
  readonly keyboardNavigation: boolean;
  readonly screenReaderSupport: boolean;
  readonly focusManagement: boolean;
  readonly colorContrastCompliant: boolean;
}

/**
 * Styling specification
 */
export interface StylingSpec {
  readonly approach: 'css-modules' | 'tailwind' | 'styled-components' | 'emotion' | 'vanilla-css';
  readonly tokens: string[];
  readonly responsiveBreakpoints: string[];
  readonly darkModeSupport: boolean;
  readonly animationsOptional: boolean;
}

/**
 * Property specification
 */
export interface PropSpec {
  readonly name: string;
  readonly type: string;
  readonly required: boolean;
  readonly default?: any;
  readonly description: string;
  readonly validation?: ValidationRule[];
}

/**
 * Variant specification
 */
export interface VariantSpec {
  readonly name: string;
  readonly props: Record<string, any>;
  readonly styling: Record<string, string>;
  readonly description: string;
}

/**
 * Component state specification
 */
export interface StateSpec {
  readonly name: string;
  readonly type: string;
  readonly description: string;
  readonly triggers: string[];
}

/**
 * Slot specification for component composition
 */
export interface SlotSpec {
  readonly name: string;
  readonly description: string;
  readonly required: boolean;
  readonly allowedContent: string[];
}

/**
 * Validation rule
 */
export interface ValidationRule {
  readonly type: 'required' | 'minLength' | 'maxLength' | 'pattern' | 'custom';
  readonly value?: any;
  readonly message: string;
}

// =============================================================================
// BUTTON COMPONENT SPECIFICATION
// =============================================================================

export const ButtonSpec: BaseComponentSpec = {
  id: 'button',
  name: 'Button',
  description: 'Interactive button element with multiple variants and sizes',
  category: 'atom',
  platforms: ['react', 'vue', 'angular', 'svelte', 'electron', 'nextjs', 'react-native', 'expo', 'radix', 'headless-ui', 'vanilla'],
  
  accessibility: {
    wcagLevel: 'AAA',
    roles: ['button'],
    ariaAttributes: ['aria-label', 'aria-disabled', 'aria-pressed'],
    keyboardNavigation: true,
    screenReaderSupport: true,
    focusManagement: true,
    colorContrastCompliant: true
  },
  
  styling: {
    approach: 'tailwind',
    tokens: ['colors', 'spacing', 'typography', 'shadows', 'borders'],
    responsiveBreakpoints: ['sm', 'md', 'lg'],
    darkModeSupport: true,
    animationsOptional: true
  },
  
  props: [
    {
      name: 'variant',
      type: "'primary' | 'secondary' | 'outline' | 'ghost' | 'destructive'",
      required: false,
      default: 'primary',
      description: 'Visual style variant of the button'
    },
    {
      name: 'size',
      type: "'xs' | 'sm' | 'md' | 'lg' | 'xl'",
      required: false,
      default: 'md',
      description: 'Size of the button affecting padding and font size'
    },
    {
      name: 'disabled',
      type: 'boolean',
      required: false,
      default: false,
      description: 'Whether the button is disabled'
    },
    {
      name: 'loading',
      type: 'boolean',
      required: false,
      default: false,
      description: 'Whether the button is in loading state'
    },
    {
      name: 'fullWidth',
      type: 'boolean',
      required: false,
      default: false,
      description: 'Whether the button should take full width of container'
    },
    {
      name: 'onClick',
      type: '() => void',
      required: false,
      description: 'Click event handler'
    }
  ],
  
  variants: [
    {
      name: 'primary',
      props: { variant: 'primary' },
      styling: { 
        background: 'bg-primary',
        text: 'text-primary-foreground',
        hover: 'hover:bg-primary/90'
      },
      description: 'Primary action button with solid background'
    },
    {
      name: 'secondary',
      props: { variant: 'secondary' },
      styling: {
        background: 'bg-secondary',
        text: 'text-secondary-foreground',
        hover: 'hover:bg-secondary/80'
      },
      description: 'Secondary action button with muted styling'
    },
    {
      name: 'outline',
      props: { variant: 'outline' },
      styling: {
        background: 'bg-transparent',
        text: 'text-foreground',
        border: 'border border-input',
        hover: 'hover:bg-accent hover:text-accent-foreground'
      },
      description: 'Outlined button with transparent background'
    }
  ],
  
  states: [
    {
      name: 'idle',
      type: 'default',
      description: 'Default state of the button',
      triggers: ['mount', 'blur']
    },
    {
      name: 'hover',
      type: 'interactive',
      description: 'Button is being hovered',
      triggers: ['mouseenter', 'focus']
    },
    {
      name: 'active',
      type: 'interactive',
      description: 'Button is being pressed',
      triggers: ['mousedown', 'keydown:space', 'keydown:enter']
    },
    {
      name: 'disabled',
      type: 'conditional',
      description: 'Button is disabled and non-interactive',
      triggers: ['props.disabled']
    },
    {
      name: 'loading',
      type: 'conditional',
      description: 'Button is in loading state',
      triggers: ['props.loading']
    }
  ],
  
  slots: [
    {
      name: 'default',
      description: 'Main content of the button (text, icons)',
      required: true,
      allowedContent: ['text', 'icon', 'mixed']
    },
    {
      name: 'icon',
      description: 'Icon slot for button icons',
      required: false,
      allowedContent: ['icon']
    }
  ]
};

// =============================================================================
// INPUT COMPONENT SPECIFICATION  
// =============================================================================

export const InputSpec: BaseComponentSpec = {
  id: 'input',
  name: 'Input',
  description: 'Text input field with validation and accessibility features',
  category: 'atom',
  platforms: ['react', 'vue', 'angular', 'svelte', 'electron', 'nextjs', 'react-native', 'expo', 'radix', 'vanilla'],
  
  accessibility: {
    wcagLevel: 'AAA',
    roles: ['textbox'],
    ariaAttributes: ['aria-label', 'aria-describedby', 'aria-invalid', 'aria-required'],
    keyboardNavigation: true,
    screenReaderSupport: true,
    focusManagement: true,
    colorContrastCompliant: true
  },
  
  styling: {
    approach: 'tailwind',
    tokens: ['colors', 'spacing', 'typography', 'borders', 'shadows'],
    responsiveBreakpoints: ['sm', 'md', 'lg'],
    darkModeSupport: true,
    animationsOptional: true
  },
  
  props: [
    {
      name: 'type',
      type: "'text' | 'email' | 'password' | 'number' | 'search' | 'tel' | 'url'",
      required: false,
      default: 'text',
      description: 'HTML input type'
    },
    {
      name: 'value',
      type: 'string',
      required: false,
      description: 'Current value of the input'
    },
    {
      name: 'placeholder',
      type: 'string',
      required: false,
      description: 'Placeholder text when input is empty'
    },
    {
      name: 'disabled',
      type: 'boolean',
      required: false,
      default: false,
      description: 'Whether the input is disabled'
    },
    {
      name: 'required',
      type: 'boolean',
      required: false,
      default: false,
      description: 'Whether the input is required'
    },
    {
      name: 'error',
      type: 'string',
      required: false,
      description: 'Error message to display'
    },
    {
      name: 'label',
      type: 'string',
      required: false,
      description: 'Label for the input'
    },
    {
      name: 'onChange',
      type: '(value: string) => void',
      required: false,
      description: 'Change event handler'
    }
  ],
  
  states: [
    {
      name: 'idle',
      type: 'default',
      description: 'Default state of the input',
      triggers: ['mount', 'blur']
    },
    {
      name: 'focused',
      type: 'interactive',
      description: 'Input has keyboard focus',
      triggers: ['focus', 'click']
    },
    {
      name: 'error',
      type: 'conditional',
      description: 'Input has validation error',
      triggers: ['props.error']
    },
    {
      name: 'disabled',
      type: 'conditional',
      description: 'Input is disabled',
      triggers: ['props.disabled']
    }
  ],
  
  slots: [
    {
      name: 'label',
      description: 'Label content for the input',
      required: false,
      allowedContent: ['text', 'mixed']
    },
    {
      name: 'prefix',
      description: 'Content before the input field',
      required: false,
      allowedContent: ['icon', 'text']
    },
    {
      name: 'suffix',
      description: 'Content after the input field',
      required: false,
      allowedContent: ['icon', 'text', 'button']
    },
    {
      name: 'error',
      description: 'Error message content',
      required: false,
      allowedContent: ['text']
    }
  ]
};

// =============================================================================
// GLOBAL SEARCH SPECIFICATION
// =============================================================================

export const GlobalSearchSpec: BaseComponentSpec = {
  id: 'global-search',
  name: 'GlobalSearch',
  description: 'Comprehensive search interface with AI suggestions and filtering',
  category: 'organism',
  platforms: ['react', 'vue', 'angular', 'svelte', 'electron', 'nextjs'],
  
  accessibility: {
    wcagLevel: 'AAA',
    roles: ['search', 'dialog', 'listbox', 'option'],
    ariaAttributes: ['aria-label', 'aria-expanded', 'aria-activedescendant', 'aria-live'],
    keyboardNavigation: true,
    screenReaderSupport: true,
    focusManagement: true,
    colorContrastCompliant: true
  },
  
  styling: {
    approach: 'tailwind',
    tokens: ['colors', 'spacing', 'typography', 'shadows', 'borders', 'animations'],
    responsiveBreakpoints: ['sm', 'md', 'lg', 'xl'],
    darkModeSupport: true,
    animationsOptional: true
  },
  
  props: [
    {
      name: 'onSearch',
      type: '(query: string, filters?: SearchFilters) => Promise<SearchResult[]>',
      required: true,
      description: 'Search function provided by consuming application'
    },
    {
      name: 'texts',
      type: 'GlobalSearchTexts',
      required: false,
      description: 'Localized text strings for the interface'
    },
    {
      name: 'showFilters',
      type: 'boolean',
      required: false,
      default: true,
      description: 'Whether to show the filter panel'
    },
    {
      name: 'showAISuggestions',
      type: 'boolean',
      required: false,
      default: true,
      description: 'Whether to show AI-powered suggestions'
    },
    {
      name: 'maxResults',
      type: 'number',
      required: false,
      default: 50,
      description: 'Maximum number of results to display'
    }
  ],
  
  states: [
    {
      name: 'closed',
      type: 'default',
      description: 'Search interface is closed',
      triggers: ['mount', 'escape', 'clickOutside']
    },
    {
      name: 'open',
      type: 'interactive',
      description: 'Search interface is open and ready for input',
      triggers: ['keydown:cmd+k', 'click:trigger', 'focus:input']
    },
    {
      name: 'searching',
      type: 'loading',
      description: 'Search is being performed',
      triggers: ['onSearch:start']
    },
    {
      name: 'results',
      type: 'data',
      description: 'Search results are displayed',
      triggers: ['onSearch:success']
    }
  ]
};

// =============================================================================
// CARD COMPONENT SPECIFICATION
// =============================================================================

export const CardSpec: BaseComponentSpec = {
  id: 'card',
  name: 'Card',
  description: 'Flexible container for grouping related content with optional header, body, and footer',
  category: 'molecule',
  platforms: ['react', 'vue', 'angular', 'svelte', 'electron', 'nextjs', 'react-native', 'expo', 'radix', 'headless-ui', 'vanilla'],
  
  accessibility: {
    wcagLevel: 'AAA',
    roles: ['article', 'section'],
    ariaAttributes: ['aria-label', 'aria-describedby'],
    keyboardNavigation: false,
    screenReaderSupport: true,
    colorContrast: 'AAA'
  },

  styling: {
    baseClasses: ['rounded-lg', 'border', 'bg-card', 'text-card-foreground', 'shadow-sm'],
    responsiveDesign: true,
    darkModeSupport: true,
    customizableSpacing: true
  },

  props: [
    {
      name: 'variant',
      type: "'default' | 'outlined' | 'filled' | 'elevated'",
      required: false,
      default: 'default',
      description: 'Visual style variant of the card'
    },
    {
      name: 'padding',
      type: "'none' | 'sm' | 'md' | 'lg' | 'xl'",
      required: false,
      default: 'md',
      description: 'Internal padding of the card content'
    },
    {
      name: 'hoverable',
      type: 'boolean',
      required: false,
      default: false,
      description: 'Whether the card should have hover effects'
    },
    {
      name: 'clickable',
      type: 'boolean',
      required: false,
      default: false,
      description: 'Whether the card is interactive/clickable'
    },
    {
      name: 'className',
      type: 'string',
      required: false,
      description: 'Additional CSS classes'
    }
  ],

  variants: [
    {
      name: 'default',
      description: 'Standard card with subtle border and shadow',
      styling: {
        border: 'border',
        background: 'bg-card',
        shadow: 'shadow-sm'
      }
    },
    {
      name: 'outlined',
      description: 'Card with prominent border, no shadow',
      styling: {
        border: 'border-2',
        background: 'bg-card',
        shadow: 'shadow-none'
      }
    },
    {
      name: 'filled',
      description: 'Card with solid background, no border',
      styling: {
        border: 'border-0',
        background: 'bg-muted',
        shadow: 'shadow-none'
      }
    },
    {
      name: 'elevated',
      description: 'Card with prominent shadow for elevated appearance',
      styling: {
        border: 'border-0',
        background: 'bg-card',
        shadow: 'shadow-lg'
      }
    }
  ],

  slots: ['header', 'default', 'footer'],
  
  nsmClassification: 'OPEN',
  version: '1.0.0'
};

// =============================================================================
// FORM COMPONENT SPECIFICATION
// =============================================================================

export const FormSpec: BaseComponentSpec = {
  id: 'form',
  name: 'Form',
  description: 'Form container with built-in validation and submission handling',
  category: 'organism',
  platforms: ['react', 'vue', 'angular', 'svelte', 'electron', 'nextjs', 'radix', 'headless-ui', 'vanilla'],
  
  accessibility: {
    wcagLevel: 'AAA',
    roles: ['form'],
    ariaAttributes: ['aria-label', 'aria-describedby', 'aria-invalid'],
    keyboardNavigation: true,
    screenReaderSupport: true,
    colorContrast: 'AAA'
  },

  styling: {
    baseClasses: ['space-y-4'],
    responsiveDesign: true,
    darkModeSupport: true,
    customizableSpacing: true
  },

  props: [
    {
      name: 'method',
      type: "'GET' | 'POST' | 'PUT' | 'DELETE'",
      required: false,
      default: 'POST',
      description: 'HTTP method for form submission'
    },
    {
      name: 'action',
      type: 'string',
      required: false,
      description: 'Form submission URL'
    },
    {
      name: 'validation',
      type: 'boolean',
      required: false,
      default: true,
      description: 'Enable client-side validation'
    },
    {
      name: 'loading',
      type: 'boolean',
      required: false,
      default: false,
      description: 'Loading state during submission'
    },
    {
      name: 'disabled',
      type: 'boolean',
      required: false,
      default: false,
      description: 'Disable all form fields'
    },
    {
      name: 'onSubmit',
      type: '(data: FormData) => void | Promise<void>',
      required: false,
      description: 'Form submission handler'
    }
  ],

  variants: [
    {
      name: 'default',
      description: 'Standard form with normal spacing',
      styling: {
        spacing: 'space-y-4'
      }
    },
    {
      name: 'compact',
      description: 'Compact form with reduced spacing',
      styling: {
        spacing: 'space-y-2'
      }
    },
    {
      name: 'spacious',
      description: 'Form with generous spacing',
      styling: {
        spacing: 'space-y-6'
      }
    }
  ],

  slots: ['default'],
  
  nsmClassification: 'OPEN',
  version: '1.0.0'
};

// =============================================================================
// TEXTAREA COMPONENT SPECIFICATION
// =============================================================================

export const TextareaSpec: BaseComponentSpec = {
  id: 'textarea',
  name: 'Textarea',
  description: 'Multi-line text input with automatic resizing and validation',
  category: 'atom',
  platforms: ['react', 'vue', 'angular', 'svelte', 'electron', 'nextjs', 'react-native', 'expo', 'radix', 'headless-ui', 'vanilla'],
  
  accessibility: {
    wcagLevel: 'AAA',
    roles: ['textbox'],
    ariaAttributes: ['aria-label', 'aria-describedby', 'aria-invalid', 'aria-required'],
    keyboardNavigation: true,
    screenReaderSupport: true,
    colorContrast: 'AAA'
  },

  styling: {
    baseClasses: ['flex', 'min-h-[80px]', 'w-full', 'rounded-md', 'border', 'px-3', 'py-2', 'text-sm'],
    responsiveDesign: true,
    darkModeSupport: true,
    customizableSpacing: true
  },

  props: [
    {
      name: 'value',
      type: 'string',
      required: false,
      description: 'Current value of the textarea'
    },
    {
      name: 'placeholder',
      type: 'string',
      required: false,
      description: 'Placeholder text'
    },
    {
      name: 'disabled',
      type: 'boolean',
      required: false,
      default: false,
      description: 'Whether the textarea is disabled'
    },
    {
      name: 'required',
      type: 'boolean',
      required: false,
      default: false,
      description: 'Whether the textarea is required'
    },
    {
      name: 'rows',
      type: 'number',
      required: false,
      default: 4,
      description: 'Initial number of rows'
    },
    {
      name: 'maxLength',
      type: 'number',
      required: false,
      description: 'Maximum number of characters'
    },
    {
      name: 'autoResize',
      type: 'boolean',
      required: false,
      default: false,
      description: 'Automatically resize based on content'
    },
    {
      name: 'error',
      type: 'boolean',
      required: false,
      default: false,
      description: 'Whether the textarea has an error state'
    }
  ],

  variants: [
    {
      name: 'default',
      description: 'Standard textarea styling',
      styling: {
        border: 'border-input',
        background: 'bg-background',
        focus: 'focus-visible:ring-2 focus-visible:ring-ring'
      }
    },
    {
      name: 'error',
      description: 'Error state with red border',
      styling: {
        border: 'border-destructive',
        background: 'bg-background',
        focus: 'focus-visible:ring-2 focus-visible:ring-destructive'
      }
    }
  ],

  slots: [],
  
  nsmClassification: 'OPEN',
  version: '1.0.0'
};

// =============================================================================
// COMPONENT REGISTRY
// =============================================================================

export const COMPONENT_REGISTRY = {
  button: ButtonSpec,
  input: InputSpec,
  textarea: TextareaSpec,
  card: CardSpec,
  form: FormSpec,
  'global-search': GlobalSearchSpec
} as const;

export type ComponentId = keyof typeof COMPONENT_REGISTRY;