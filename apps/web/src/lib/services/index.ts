/**
 * Services Module Index
 * Centralized export for all services
 */

// Stack Configuration Service
export {
	StackConfigurationService,
	stackConfigurationService,
} from './stack-service';

// Compatibility Service
export {
	CompatibilityService,
	compatibilityService,
	createCompatibilityService,
	PWACompatibilityRule,
	TauriCompatibilityRule,
} from './compatibility-service';

export type {
	CompatibilityRule,
	CompatibilityValidationResult,
} from './compatibility-service';

// Command Generator Service
export {
	CommandGeneratorService,
	commandGeneratorService,
} from './command-generator';
