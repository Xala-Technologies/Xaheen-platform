/**
 * @fileoverview Test Fixtures - Sample Component Specifications
 * @description Comprehensive test fixtures for component specifications and generation testing
 * @version 1.0.0
 */

export const sampleButtonSpec = {
  id: 'button',
  name: 'Button',
  category: 'action-feedback',
  description: 'Interactive button component with multiple variants and states',
  version: '5.0.0',
  status: 'stable',
  platform: {
    react: true,
    vue: true,
    angular: true,
    svelte: true,
    'react-native': true
  },
  designTokens: {
    colors: {
      primary: 'var(--color-primary)',
      secondary: 'var(--color-secondary)',
      accent: 'var(--color-accent)'
    },
    spacing: {
      padding: 'var(--spacing-md)',
      margin: 'var(--spacing-sm)'
    },
    typography: {
      fontSize: 'var(--font-size-base)',
      fontWeight: 'var(--font-weight-medium)'
    }
  },
  props: {
    children: {
      type: 'ReactNode',
      required: true,
      description: 'Button content'
    },
    variant: {
      type: "'primary' | 'secondary' | 'outline' | 'ghost' | 'destructive'",
      required: false,
      default: 'primary',
      description: 'Visual style variant'
    },
    size: {
      type: "'sm' | 'md' | 'lg' | 'xl'",
      required: false,
      default: 'md',
      description: 'Button size'
    },
    disabled: {
      type: 'boolean',
      required: false,
      default: false,
      description: 'Disabled state'
    },
    loading: {
      type: 'boolean',
      required: false,
      default: false,
      description: 'Loading state with spinner'
    },
    onClick: {
      type: '(event: MouseEvent) => void',
      required: false,
      description: 'Click event handler'
    },
    type: {
      type: "'button' | 'submit' | 'reset'",
      required: false,
      default: 'button',
      description: 'HTML button type'
    }
  },
  accessibility: {
    'aria-label': 'Descriptive label for screen readers',
    'aria-disabled': 'Reflects disabled state',
    role: 'button',
    tabIndex: 0,
    keyboardSupport: ['Enter', 'Space']
  },
  examples: [
    {
      name: 'Primary Button',
      code: '<Button variant="primary">Click me</Button>'
    },
    {
      name: 'Loading Button',
      code: '<Button loading>Loading...</Button>'
    }
  ]
};

export const sampleInputSpec = {
  id: 'input',
  name: 'Input',
  category: 'form',
  description: 'Text input field with validation and various types',
  version: '5.0.0',
  status: 'stable',
  platform: {
    react: true,
    vue: true,
    angular: true,
    svelte: false,
    'react-native': true
  },
  designTokens: {
    colors: {
      border: 'var(--color-border)',
      focus: 'var(--color-focus)',
      error: 'var(--color-error)'
    },
    spacing: {
      padding: 'var(--spacing-sm)',
      height: 'var(--component-height-md)'
    }
  },
  props: {
    label: {
      type: 'string',
      required: false,
      description: 'Input label'
    },
    placeholder: {
      type: 'string',
      required: false,
      description: 'Placeholder text'
    },
    value: {
      type: 'string',
      required: false,
      description: 'Controlled input value'
    },
    defaultValue: {
      type: 'string',
      required: false,
      description: 'Default uncontrolled value'
    },
    onChange: {
      type: '(value: string, event: ChangeEvent) => void',
      required: false,
      description: 'Change event handler'
    },
    type: {
      type: "'text' | 'email' | 'password' | 'number' | 'tel' | 'url'",
      required: false,
      default: 'text',
      description: 'Input type'
    },
    variant: {
      type: "'default' | 'filled' | 'outline'",
      required: false,
      default: 'default',
      description: 'Visual variant'
    },
    size: {
      type: "'sm' | 'md' | 'lg'",
      required: false,
      default: 'md',
      description: 'Input size'
    },
    state: {
      type: "'default' | 'error' | 'success'",
      required: false,
      default: 'default',
      description: 'Validation state'
    },
    disabled: {
      type: 'boolean',
      required: false,
      default: false,
      description: 'Disabled state'
    },
    required: {
      type: 'boolean',
      required: false,
      default: false,
      description: 'Required field indicator'
    },
    helperText: {
      type: 'string',
      required: false,
      description: 'Helper or error text'
    }
  },
  accessibility: {
    'aria-label': 'Descriptive label',
    'aria-describedby': 'Helper text reference',
    'aria-invalid': 'Validation state',
    'aria-required': 'Required field indicator'
  }
};

export const sampleModalSpec = {
  id: 'modal',
  name: 'Modal',
  category: 'overlay',
  description: 'Modal dialog with backdrop and focus management',
  version: '5.0.0',
  status: 'stable',
  platform: {
    react: true,
    vue: true,
    angular: true,
    svelte: true,
    'react-native': false
  },
  designTokens: {
    colors: {
      backdrop: 'var(--color-backdrop)',
      surface: 'var(--color-surface)',
      border: 'var(--color-border)'
    },
    spacing: {
      padding: 'var(--spacing-lg)',
      gap: 'var(--spacing-md)'
    },
    effects: {
      backdrop: 'var(--backdrop-blur)',
      shadow: 'var(--shadow-lg)'
    }
  },
  props: {
    isOpen: {
      type: 'boolean',
      required: true,
      description: 'Modal visibility state'
    },
    onClose: {
      type: '() => void',
      required: true,
      description: 'Close handler'
    },
    title: {
      type: 'string',
      required: false,
      description: 'Modal title'
    },
    children: {
      type: 'ReactNode',
      required: false,
      description: 'Modal content'
    },
    size: {
      type: "'sm' | 'md' | 'lg' | 'xl' | 'full'",
      required: false,
      default: 'md',
      description: 'Modal size'
    },
    closeOnBackdrop: {
      type: 'boolean',
      required: false,
      default: true,
      description: 'Close on backdrop click'
    },
    closeOnEscape: {
      type: 'boolean',
      required: false,
      default: true,
      description: 'Close on escape key'
    },
    showCloseButton: {
      type: 'boolean',
      required: false,
      default: true,
      description: 'Show close button'
    }
  },
  accessibility: {
    role: 'dialog',
    'aria-modal': true,
    'aria-labelledby': 'Modal title reference',
    'aria-describedby': 'Modal content reference',
    focusManagement: 'Trap focus within modal',
    keyboardSupport: ['Escape']
  }
};

export const sampleFormSpec = {
  id: 'form',
  name: 'Form',
  category: 'form',
  description: 'Form container with validation and submission handling',
  version: '5.0.0',
  status: 'stable',
  platform: {
    react: true,
    vue: true,
    angular: true,
    svelte: true,
    'react-native': true
  },
  props: {
    onSubmit: {
      type: '(data: FormData, event: FormEvent) => void | Promise<void>',
      required: true,
      description: 'Form submission handler'
    },
    validationSchema: {
      type: 'ValidationSchema',
      required: false,
      description: 'Validation schema object'
    },
    initialValues: {
      type: 'Record<string, unknown>',
      required: false,
      description: 'Initial form values'
    },
    children: {
      type: 'ReactNode',
      required: true,
      description: 'Form fields and content'
    },
    disabled: {
      type: 'boolean',
      required: false,
      default: false,
      description: 'Disable all form fields'
    }
  }
};

export const sampleDataTableSpec = {
  id: 'data-table',
  name: 'DataTable',
  category: 'data-display',
  description: 'Advanced data table with sorting, filtering, and pagination',
  version: '5.0.0',
  status: 'stable',
  platform: {
    react: true,
    vue: true,
    angular: true,
    svelte: false,
    'react-native': false
  },
  props: {
    data: {
      type: 'Array<Record<string, unknown>>',
      required: true,
      description: 'Table data array'
    },
    columns: {
      type: 'Array<ColumnDefinition>',
      required: true,
      description: 'Column definitions'
    },
    sortable: {
      type: 'boolean',
      required: false,
      default: true,
      description: 'Enable column sorting'
    },
    filterable: {
      type: 'boolean',
      required: false,
      default: true,
      description: 'Enable filtering'
    },
    pagination: {
      type: 'PaginationOptions | false',
      required: false,
      default: false,
      description: 'Pagination configuration'
    },
    selectable: {
      type: "'single' | 'multiple' | false",
      required: false,
      default: false,
      description: 'Row selection mode'
    },
    onSelectionChange: {
      type: '(selected: Array<unknown>) => void',
      required: false,
      description: 'Selection change handler'
    }
  }
};

export const sampleMigrationContext = {
  sourceFramework: 'React',
  targetFramework: 'Vue',
  projectPath: '/mock/project',
  migrationStrategy: {
    approach: 'incremental' as const,
    phases: [
      {
        id: 'analysis',
        name: 'Project Analysis',
        description: 'Analyze current project structure',
        priority: 1,
        dependencies: [],
        estimatedTime: '5 minutes',
        riskLevel: 'low' as const,
        components: ['*'],
        transformations: []
      },
      {
        id: 'component-migration',
        name: 'Component Migration',
        description: 'Migrate React components to Vue',
        priority: 2,
        dependencies: ['analysis'],
        estimatedTime: '30 minutes',
        riskLevel: 'medium' as const,
        components: ['Button', 'Input', 'Modal'],
        transformations: [
          {
            id: 'react-to-vue',
            type: 'replace' as const,
            source: 'React.FC',
            target: 'defineComponent',
            pattern: /React\.FC<(.+)>/g,
            replacement: 'defineComponent'
          }
        ]
      }
    ],
    rollbackEnabled: true,
    backupStrategy: 'incremental' as const
  },
  preserveOriginal: true,
  dryRun: false
};

export const sampleGenerationContext = {
  projectStructure: {
    root: '/mock/project',
    framework: {
      name: 'Next.js',
      version: '14.0.0',
      type: 'ssr' as const,
      features: ['typescript', 'tailwind']
    },
    architecture: {
      pattern: 'layered' as const,
      complexity: 'medium' as const,
      maintainability: 85
    },
    components: [],
    dependencies: [],
    quality: {
      overall: 90,
      codeQuality: 88,
      security: 95,
      performance: 87,
      accessibility: 92,
      maintainability: 89,
      testCoverage: 85,
      documentation: 80
    }
  },
  targetFramework: 'React',
  outputPath: '/mock/output',
  templateEngine: 'handlebars' as const,
  codeStyle: {
    indentation: 2,
    quotes: 'single' as const,
    semicolons: true,
    typescript: true
  }
};

export const sampleReportingContext = {
  projectPath: '/mock/project',
  outputFormat: 'html' as const,
  includeCharts: true,
  includeSecurity: true,
  includePerformance: true,
  customBranding: {
    logo: '/assets/logo.png',
    colors: {
      primary: '#007acc',
      secondary: '#f0f0f0'
    }
  }
};