/**
 * Universal Design System Specifications
 * Central registry for all component specifications across all platforms
 */

// Core specifications
export * from './core/button.spec';
export * from './core/input.spec';
export * from './core/card.spec';
export * from './core/modal.spec';
export * from './core/select.spec';
export * from './core/checkbox.spec';
export * from './core/radio.spec';
export * from './core/switch.spec';
export * from './core/textarea.spec';
export * from './core/slider.spec';

// Layout specifications
export * from './layouts/container.spec';
export * from './layouts/grid.spec';
export * from './layouts/stack.spec';
export * from './layouts/divider.spec';
export * from './layouts/sidebar.spec';

// Navigation specifications
export * from './navigation/navbar.spec';
export * from './navigation/tabs.spec';
export * from './navigation/breadcrumb.spec';
export * from './navigation/pagination.spec';
export * from './navigation/stepper.spec';

// Data display specifications
export * from './data/table.spec';
export * from './data/list.spec';
export * from './data/tree.spec';
export * from './data/timeline.spec';
export * from './data/chart.spec';

// Feedback specifications
export * from './feedback/alert.spec';
export * from './feedback/toast.spec';
export * from './feedback/loading.spec';
export * from './feedback/progress.spec';
export * from './feedback/skeleton.spec';

// Media specifications
export * from './media/avatar.spec';
export * from './media/image.spec';
export * from './media/video.spec';
export * from './media/icon.spec';

// Typography specifications
export * from './typography/heading.spec';
export * from './typography/text.spec';
export * from './typography/link.spec';
export * from './typography/badge.spec';

// Advanced specifications
export * from './advanced/date-picker.spec';
export * from './advanced/time-picker.spec';
export * from './advanced/color-picker.spec';
export * from './advanced/file-upload.spec';
export * from './advanced/drag-drop.spec';

// Specification utilities
export { SpecificationRegistry } from './registry';
export { SpecificationValidator } from './validator';
export { SpecificationGenerator } from './generator';
export { SpecificationCompiler } from './compiler';

// Type exports
export type {
  ComponentSpecification,
  SpecificationMetadata,
  SpecificationVariant,
  SpecificationProp,
  SpecificationExample,
  SpecificationCompliance
} from './types';