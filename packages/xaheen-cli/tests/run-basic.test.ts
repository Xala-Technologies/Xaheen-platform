#!/usr/bin/env bun

/**
 * Basic Test Runner - Run a single test to verify setup
 */

import { describe, it, expect } from 'bun:test';

describe('Basic Test', () => {
  it('should pass a simple test', () => {
    expect(1 + 1).toBe(2);
  });

  it('should verify Bun test runner works', () => {
    const result = { success: true };
    expect(result.success).toBe(true);
  });
});

// Run the test
console.log('Running basic test to verify Bun setup...');