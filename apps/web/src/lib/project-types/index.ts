/**
 * Project Types Module Index
 * Centralized export for project types functionality
 */

// Data
export { PROJECT_TYPE_DEFINITIONS } from "./data";
// Models
export {
	ProjectTypeDefinition,
	ProjectTypeRegistry,
} from "./models";
// Registry
export {
	createProjectTypeRegistry,
	getLegacyProjectTypes,
	projectTypeRegistry,
} from "./registry";
