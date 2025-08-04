/**
 * @fileoverview Xala Template Validation Configuration
 * @description Custom validation configuration for your project
 * @version 5.0.0
 */

module.exports = {
  // Enable/disable rule categories
  rules: {
    semantic: {
      enabled: true,
      noRawHTML: true,
      semanticComponentUsage: true,
      componentStructure: true,
    },
    designTokens: {
      enabled: true,
      designTokenUsage: true,
      noHardcodedValues: true,
      tokenReference: true,
    },
    accessibility: {
      enabled: true,
      ariaAttributes: true,
      semanticHTML: true,
      keyboardNavigation: true,
      colorContrast: true,
      screenReader: true,
    },
    responsive: {
      enabled: true,
      breakpointUsage: true,
      responsiveClasses: true,
      flexboxGrid: true,
    },
    typescript: {
      enabled: true,
      strictMode: true,
      interfaceDefinition: true,
      noAnyType: true,
      explicitReturnTypes: false, // Set to false for gradual adoption
    },
    norwegian: {
      enabled: false, // Enable for Norwegian government projects
      dataClassification: true,
      securityLabels: true,
      localizationNorwegian: true,
      complianceDocumentation: true,
    },
  },

  // Severity settings
  severity: {
    failOnError: true,
    failOnWarning: false, // Set to true for strict validation
  },

  // Auto-fix settings
  autofix: {
    enabled: false, // Enable with caution - always review changes
    semanticComponents: true,
    ariaAttributes: true,
    designTokens: true,
  },

  // File and rule exclusions
  exclusions: {
    files: [
      '**/*.test.{ts,tsx,js,jsx}',
      '**/*.spec.{ts,tsx,js,jsx}',
      '**/*.stories.{ts,tsx,js,jsx}',
      '**/node_modules/**',
      '**/dist/**',
      '**/build/**',
      '**/.next/**',
      '**/.nuxt/**',
    ],
    directories: [
      'node_modules',
      '.git',
      'dist',
      'build',
      '.next',
      '.nuxt',
      'coverage',
    ],
    rules: [
      // Exclude specific rules globally
      // 'explicit-return-types', // Uncomment to disable return type checking
    ],
  },

  // Custom validation rules
  customRules: [
    // Add your custom validation rules here
    // {
    //   name: 'company-branding',
    //   path: './validation-rules/company-branding.js',
    //   enabled: true,
    // },
  ],
};

// Environment-specific overrides
const environmentOverrides = {
  development: {
    severity: {
      failOnError: false,
      failOnWarning: false,
    },
    autofix: {
      enabled: true, // More permissive in development
    },
  },
  
  production: {
    rules: {
      norwegian: {
        enabled: process.env.COUNTRY === 'NO', // Enable based on environment
      },
    },
    severity: {
      failOnError: true,
      failOnWarning: true,
    },
    autofix: {
      enabled: false, // Never auto-fix in production
    },
  },
  
  ci: {
    severity: {
      failOnError: true,
      failOnWarning: true,
    },
    autofix: {
      enabled: false,
    },
  },
};

// Apply environment-specific configuration
const environment = process.env.NODE_ENV || 'development';
if (environmentOverrides[environment]) {
  Object.assign(module.exports, environmentOverrides[environment]);
}