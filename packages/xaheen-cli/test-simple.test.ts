import { test, expect } from 'bun:test';

test('simple test', () => {
  expect(2 + 2).toBe(4);
});

test('string test', () => {
  expect('hello').toBe('hello');
});

test('array test', () => {
  expect([1, 2, 3]).toEqual([1, 2, 3]);
});