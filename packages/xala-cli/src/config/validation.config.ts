/**
 * @fileoverview Validation Configuration
 * @description Configuration file for template validation rules and settings
 * @version 5.0.0
 * @compliance TypeScript Strict
 */

export interface ValidationConfig {
  readonly rules: {
    readonly semantic: {
      readonly enabled: boolean;
      readonly noRawHTML: boolean;
      readonly semanticComponentUsage: boolean;
      readonly componentStructure: boolean;
    };
    readonly designTokens: {
      readonly enabled: boolean;
      readonly designTokenUsage: boolean;
      readonly noHardcodedValues: boolean;
      readonly tokenReference: boolean;
    };
    readonly accessibility: {
      readonly enabled: boolean;
      readonly ariaAttributes: boolean;
      readonly semanticHTML: boolean;
      readonly keyboardNavigation: boolean;
      readonly colorContrast: boolean;
      readonly screenReader: boolean;
    };
    readonly responsive: {
      readonly enabled: boolean;
      readonly breakpointUsage: boolean;
      readonly responsiveClasses: boolean;
      readonly flexboxGrid: boolean;
    };
    readonly typescript: {
      readonly enabled: boolean;
      readonly strictMode: boolean;
      readonly interfaceDefinition: boolean;
      readonly noAnyType: boolean;
      readonly explicitReturnTypes: boolean;
    };
    readonly norwegian: {
      readonly enabled: boolean;
      readonly dataClassification: boolean;
      readonly securityLabels: boolean;
      readonly localizationNorwegian: boolean;
      readonly complianceDocumentation: boolean;
    };
  };
  readonly severity: {
    readonly failOnError: boolean;
    readonly failOnWarning: boolean;
  };
  readonly autofix: {
    readonly enabled: boolean;
    readonly semanticComponents: boolean;
    readonly ariaAttributes: boolean;
    readonly designTokens: boolean;
  };
  readonly exclusions: {
    readonly files: ReadonlyArray<string>;
    readonly directories: ReadonlyArray<string>;
    readonly rules: ReadonlyArray<string>;
  };
  readonly customRules: ReadonlyArray<{
    readonly name: string;
    readonly path: string;
    readonly enabled: boolean;
  }>;
}

export const defaultValidationConfig: ValidationConfig = {
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
      explicitReturnTypes: true,
    },
    norwegian: {
      enabled: false, // Disabled by default, enable for Norwegian projects
      dataClassification: true,
      securityLabels: true,
      localizationNorwegian: true,
      complianceDocumentation: true,
    },
  },
  severity: {
    failOnError: true,
    failOnWarning: false,
  },
  autofix: {
    enabled: false, // Disabled by default for safety
    semanticComponents: true,
    ariaAttributes: true,
    designTokens: true,
  },
  exclusions: {
    files: [
      '**/*.test.{ts,tsx,js,jsx}',
      '**/*.spec.{ts,tsx,js,jsx}',
      '**/node_modules/**',
      '**/dist/**',
      '**/build/**',
    ],
    directories: [
      'node_modules',
      '.git',
      'dist',
      'build',
      '.next',
      '.nuxt',
    ],
    rules: [
      // Add rule names to exclude specific rules globally
    ],
  },
  customRules: [
    // Add custom validation rules here
    // {
    //   name: 'custom-rule',
    //   path: './custom-rules/my-rule.js',
    //   enabled: true,
    // }
  ],
};

/**
 * Configuration for different environments
 */
export const environmentConfigs = {
  development: {
    ...defaultValidationConfig,
    severity: {
      failOnError: false,
      failOnWarning: false,
    },
    autofix: {
      ...defaultValidationConfig.autofix,
      enabled: true,
    },
  },
  
  testing: {
    ...defaultValidationConfig,
    severity: {
      failOnError: true,
      failOnWarning: false,
    },
  },
  
  production: {
    ...defaultValidationConfig,
    severity: {
      failOnError: true,
      failOnWarning: true,
    },
    rules: {
      ...defaultValidationConfig.rules,
      norwegian: {
        ...defaultValidationConfig.rules.norwegian,
        enabled: true, // Enable Norwegian compliance in production
      },
    },
  },
  
  ci: {
    ...defaultValidationConfig,
    severity: {
      failOnError: true,
      failOnWarning: true,
    },
    autofix: {
      ...defaultValidationConfig.autofix,
      enabled: false, // Never auto-fix in CI
    },
  },
} as const;

/**
 * Load validation configuration from file or use defaults
 */
export async function loadValidationConfig(
  configPath?: string,
  environment?: keyof typeof environmentConfigs
): Promise<ValidationConfig> {
  let config = defaultValidationConfig;
  
  // Use environment-specific config if specified
  if (environment && environment in environmentConfigs) {
    config = environmentConfigs[environment];
  }
  
  // Load custom config file if provided
  if (configPath) {
    try {
      const { existsSync } = await import('fs');
      if (existsSync(configPath)) {
        const customConfig = await import(configPath);
        config = {
          ...config,
          ...customConfig.default || customConfig,
        };
      }
    } catch (error) {
      console.warn(`Failed to load validation config from ${configPath}:`, error);
    }
  }
  
  return config;
}

/**
 * Merge multiple validation configurations
 */
export function mergeValidationConfigs(
  base: ValidationConfig,
  override: Partial<ValidationConfig>
): ValidationConfig {
  return {
    rules: {
      semantic: { ...base.rules.semantic, ...override.rules?.semantic },
      designTokens: { ...base.rules.designTokens, ...override.rules?.designTokens },
      accessibility: { ...base.rules.accessibility, ...override.rules?.accessibility },
      responsive: { ...base.rules.responsive, ...override.rules?.responsive },
      typescript: { ...base.rules.typescript, ...override.rules?.typescript },
      norwegian: { ...base.rules.norwegian, ...override.rules?.norwegian },
    },
    severity: { ...base.severity, ...override.severity },
    autofix: { ...base.autofix, ...override.autofix },
    exclusions: {
      files: [...base.exclusions.files, ...(override.exclusions?.files || [])],
      directories: [...base.exclusions.directories, ...(override.exclusions?.directories || [])],
      rules: [...base.exclusions.rules, ...(override.exclusions?.rules || [])],
    },
    customRules: [...base.customRules, ...(override.customRules || [])],
  };
}

/**
 * Validate configuration object
 */
export function validateConfig(config: ValidationConfig): {
  readonly isValid: boolean;
  readonly errors: ReadonlyArray<string>;
} {
  const errors: string[] = [];
  
  // Check that at least one rule category is enabled
  const categories = Object.values(config.rules);
  const enabledCategories = categories.filter(category => category.enabled);
  
  if (enabledCategories.length === 0) {
    errors.push('At least one rule category must be enabled');
  }
  
  // Validate custom rules
  config.customRules.forEach(rule => {
    if (!rule.name) {
      errors.push('Custom rule must have a name');
    }
    if (!rule.path) {
      errors.push(`Custom rule '${rule.name}' must have a path`);
    }
  });
  
  return {
    isValid: errors.length === 0,
    errors,
  };
}