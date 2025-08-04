import { vi } from 'vitest';

// Mock process.exit to prevent tests from actually exiting
const mockExit = vi.spyOn(process, 'exit').mockImplementation((code?: number) => {
  throw new Error(`Process exit called with code: ${code}`);
});

// Mock console methods for cleaner test output
const mockConsole = {
  log: vi.spyOn(console, 'log').mockImplementation(() => {}),
  warn: vi.spyOn(console, 'warn').mockImplementation(() => {}),
  error: vi.spyOn(console, 'error').mockImplementation(() => {})
};

// Setup global CLI context for tests
beforeEach(() => {
  // Clear all mocks before each test
  vi.clearAllMocks();
  
  // Reset process.env
  process.env.NODE_ENV = 'test';
  process.env.XAHEEN_NO_BANNER = 'true'; // Disable banner in tests
});

// Cleanup after tests
afterEach(() => {
  // Clean up any global state
  delete (global as any).__xaheen_cli;
});

// Export mocks for use in tests
export { mockExit, mockConsole };