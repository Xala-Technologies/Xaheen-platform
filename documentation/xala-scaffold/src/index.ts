import { createRequire } from 'module';

const require = createRequire(import.meta.url);
export const { version } = require('../package.json');

// Re-export main modules
export * from './cli.js';

// Export types
export type { CommandInterface } from './commands/index.js';