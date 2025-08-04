/**
 * @fileoverview Jest Test Setup
 * @description Global test configuration and utilities
 */

// Extend Jest matchers
declare global {
  namespace jest {
    interface Matchers<R> {
      toBeBetween(min: number, max: number): R;
    }
  }
}

// Custom matcher for between range
expect.extend({
  toBeBetween(received: number, min: number, max: number) {
    const pass = received >= min && received <= max;
    return {
      pass,
      message: () => 
        pass
          ? `Expected ${received} not to be between ${min} and ${max}`
          : `Expected ${received} to be between ${min} and ${max}`,
    };
  },
});

// Mock console methods for cleaner test output
beforeAll(() => {
  // Mock console.log, console.warn, etc. if needed for tests
  if (process.env.NODE_ENV === 'test') {
    // jest.spyOn(console, 'log').mockImplementation(() => {});
    // jest.spyOn(console, 'warn').mockImplementation(() => {});
  }
});