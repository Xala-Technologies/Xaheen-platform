
// Mock problematic imports
import { mock } from 'bun:test';

// Mock @xala-technologies/xala-mcp
mock.module('@xala-technologies/xala-mcp', () => ({
  MCPServer: class MockMCPServer {
    constructor() {}
    start() { return Promise.resolve(); }
    stop() { return Promise.resolve(); }
  },
  MCPClient: class MockMCPClient {
    constructor() {}
    connect() { return Promise.resolve(); }
    disconnect() { return Promise.resolve(); }
  },
  generateComponent: () => Promise.resolve({ success: true }),
  generateLayout: () => Promise.resolve({ success: true }),
  generatePage: () => Promise.resolve({ success: true }),
}));

// Mock other potentially problematic modules
mock.module('playwright', () => ({
  chromium: { launch: () => Promise.resolve({ close: () => {} }) },
  firefox: { launch: () => Promise.resolve({ close: () => {} }) },
  webkit: { launch: () => Promise.resolve({ close: () => {} }) },
}));

mock.module('@opentelemetry/api', () => ({
  trace: { getTracer: () => ({}) },
  metrics: { getMeter: () => ({}) },
}));
