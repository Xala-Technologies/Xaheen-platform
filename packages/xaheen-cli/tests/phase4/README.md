# Phase 4 Backend MVP Testing

This directory contains comprehensive tests for Phase 4 (Backend MVP) functionality of the Xaheen CLI.

## Test Structure

```
phase4/
├── unit/           # Unit tests for individual components
│   ├── model.test.ts        # Model generation tests
│   ├── endpoint.test.ts     # Endpoint generation tests
│   └── service.test.ts      # Service generation tests
├── integration/    # Integration tests for full workflows
│   ├── express.test.ts      # Express scaffolding tests
│   ├── nestjs.test.ts       # NestJS scaffolding tests
│   ├── fastify.test.ts      # Fastify scaffolding tests
│   └── hono.test.ts         # Hono scaffolding tests
├── e2e/           # End-to-end tests with real APIs
│   ├── crud.test.ts         # CRUD operations testing
│   └── api-health.test.ts   # API health checks
├── performance/   # Performance and benchmark tests
│   ├── cold-start.test.ts   # Cold start performance
│   └── latency.test.ts      # API latency benchmarks
├── utils/         # Test utilities and helpers
│   ├── test-helpers.ts      # Common test utilities
│   ├── server-manager.ts    # Test server management
│   └── database-helper.ts   # Database test utilities
├── fixtures/      # Test data and configurations
│   ├── models/              # Model fixtures
│   ├── endpoints/           # Endpoint fixtures
│   └── services/            # Service fixtures
└── mocks/         # Mock implementations
    ├── template-engine.mock.ts    # Template engine mocks
    └── file-system.mock.ts        # File system mocks
```

## Test Requirements

### Unit Tests
- Test all backend generation commands (model, endpoint, service)
- Mock template engines for isolated testing
- Verify correct file generation and content
- Test error handling and validation

### Integration Tests
- Test complete scaffolding workflows for each framework
- Verify proper project structure creation
- Test dependency installation
- Validate generated configuration files

### E2E Tests
- Generate complete CRUD applications
- Test with real database connections
- Verify API endpoints work correctly
- Test authentication and authorization

### Performance Tests
- Cold-start time < 2 seconds
- Establish latency baselines for each framework
- Memory usage monitoring
- Concurrent request handling

## Running Tests

```bash
# Run all Phase 4 tests
npm run test:phase4

# Run specific test categories
npm run test:phase4:unit
npm run test:phase4:integration
npm run test:phase4:e2e
npm run test:phase4:performance

# Run tests for specific frameworks
npm run test:phase4:express
npm run test:phase4:nestjs
npm run test:phase4:fastify
npm run test:phase4:hono
```

## Test Configuration

- Uses Bun for all operations
- Supertest for API testing
- Mock database connections for unit tests
- Real database connections for E2E tests
- Performance monitoring with custom metrics

## Coverage Requirements

- Unit tests: 90%+ coverage
- Integration tests: 85%+ coverage
- E2E tests: Critical path coverage
- Performance tests: Baseline establishment