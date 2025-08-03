/**
 * Template Fragment System - Main Export File
 * Provides a unified interface for all fragment system components
 */

// Core interfaces
export type {
  FragmentType,
  TemplateContext,
  SupportedFramework,
  FragmentDependency,
  FragmentFile,
  FragmentConfig,
  FragmentProcessingOptions,
  FragmentProcessingResult,
  FragmentCompositionContext,
  FragmentProcessor,
  FragmentRegistry,
  FragmentCompositionEngine,
} from "./interfaces/fragment-base";

// Core implementations
export { CoreFragmentProcessor } from "./core/fragment-processor";
export { CoreFragmentRegistry } from "./core/fragment-registry";
export { CoreCompositionEngine } from "./core/composition-engine";

// Main service
export { FragmentService, fragmentService } from "./fragment-service";

// Re-export for convenience
export const createFragmentService = (basePath?: string) => new FragmentService(basePath);