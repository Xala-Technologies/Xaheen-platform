/**
 * Project Types Module Index
 * Centralized export for project types functionality
 */

// Models
export {
	ProjectTypeDefinition,
	ProjectTypeRegistry,
} from './models';

// Registry
export {
	projectTypeRegistry,
	createProjectTypeRegistry,
	getLegacyProjectTypes,
} from './registry';

// Data
export { PROJECT_TYPE_DEFINITIONS } from './data';
