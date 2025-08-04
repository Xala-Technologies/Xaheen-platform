/**
 * Tech Stack Module Index
 * Centralized export for tech stack functionality
 */

// Data exports for specific categories
export { API_OPTIONS } from "./data/api";
export { AUTH_OPTIONS } from "./data/auth";
export { BACKEND_OPTIONS } from "./data/backend";
export { DATABASE_OPTIONS, ORM_OPTIONS } from "./data/database";
export { NATIVE_FRONTEND_OPTIONS, WEB_FRONTEND_OPTIONS } from "./data/frontend";
// Models
export {
	TechStackCategory,
	TechStackOption,
	TechStackRegistry,
} from "./models";
// Registry
export {
	createTechStackRegistry,
	getLegacyTechOptions,
	techStackRegistry,
} from "./registry";
