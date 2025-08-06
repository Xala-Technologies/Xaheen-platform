/**
 * Test Isolation Utilities
 * 
 * Provides utilities for proper test isolation to prevent
 * command registration conflicts and memory leaks
 */

import { beforeEach, afterEach } from 'vitest';
import { CommandParser } from '../core/command-parser/index.js';

export function setupTestIsolation() {
  beforeEach(() => {
    // Reset CommandParser singleton
    CommandParser.reset();
    
    // Reset process listeners to prevent memory leaks
    process.removeAllListeners('unhandledRejection');
    process.removeAllListeners('uncaughtException');
    process.setMaxListeners(15);
  });

  afterEach(() => {
    // Clean up CommandParser singleton
    CommandParser.reset();
    
    // Reset process listeners
    process.removeAllListeners('unhandledRejection');
    process.removeAllListeners('uncaughtException');
  });
}