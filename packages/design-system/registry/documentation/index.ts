/**
 * Documentation System Exports
 * Complete documentation generation system for universal design components
 */

// Core documentation generator
export * from './documentation-generator';

// Industry themes and template generator
export * from './template-generator';

// Interactive playground generator
export * from './interactive-playground';

// Re-export main classes
export { 
  DocumentationGenerator,
  type DocumentationContext,
  type DocumentationOptions,
  type GeneratedDocumentation
} from './documentation-generator';

export {
  IndustryTemplateGenerator,
  INDUSTRY_THEMES,
  type IndustryTheme,
  type IndustryThemeConfig
} from './template-generator';

export {
  PlaygroundGenerator,
  type PlaygroundContext,
  type PlaygroundOptions,
  type GeneratedPlayground
} from './interactive-playground';