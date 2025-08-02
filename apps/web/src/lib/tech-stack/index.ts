/**
 * Tech Stack Module Index
 * Centralized export for tech stack functionality
 */

// Models
export {
	TechStackOption,
	TechStackCategory,
	TechStackRegistry,
} from './models';

// Registry
export {
	techStackRegistry,
	createTechStackRegistry,
	getLegacyTechOptions,
} from './registry';

// Data exports for specific categories
export { API_OPTIONS } from './data/api';
export { WEB_FRONTEND_OPTIONS, NATIVE_FRONTEND_OPTIONS } from './data/frontend';
export { BACKEND_OPTIONS } from './data/backend';
export { DATABASE_OPTIONS, ORM_OPTIONS } from './data/database';
export { AUTH_OPTIONS } from './data/auth';
