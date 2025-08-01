# @xaheen/core

Core service infrastructure for Xaheen Enterprise applications.

## Features

- **Service Discovery**: Automatic service registration and discovery with dependency management
- **Event System**: Unified event bus with patterns, interceptors, and history
- **Base Architecture**: SOLID principles-based service architecture
- **Type Safety**: Full TypeScript support with strict mode

## Installation

```bash
bun add @xaheen/core
```

## Usage

### Service Discovery

```typescript
import { ServiceDiscoveryManager, ServiceResolver, BaseService } from '@xaheen/core';

// Create discovery manager
const discovery = new ServiceDiscoveryManager();
const resolver = new ServiceResolver(discovery);

// Register services
await discovery.register(new DatabaseService(), {
  name: "DatabaseService",
  version: "1.0.0",
  tags: ["database", "storage"],
  priority: 10
});

// Resolve services
const db = resolver.resolve<DatabaseService>("DatabaseService");
```

### Event System

```typescript
import { EventBus, getGlobalEventBus } from '@xaheen/core/events';

// Create event bus
const eventBus = new EventBus("AppEventBus");

// Subscribe to events
eventBus.on("user.created", async (data) => {
  console.log("User created:", data);
});

// Emit events
await eventBus.emit("user.created", { id: "123", name: "John" });

// Use patterns
eventBus.onAny(({ event, data }) => {
  if (event.startsWith("user.")) {
    console.log("User event:", event, data);
  }
});
```

### Base Service

```typescript
import { BaseService } from '@xaheen/core/architecture';

export class MyService extends BaseService {
  constructor() {
    super("MyService", "1.0.0");
  }

  protected async doInitialize(): Promise<void> {
    // Initialize your service
  }

  protected async doDispose(): Promise<void> {
    // Clean up resources
  }
}
```

## API Reference

### Service Discovery

- `ServiceDiscoveryManager`: Main service registry with dependency management
- `ServiceResolver`: Dependency injection resolver
- `ServiceStatus`: Enum for service lifecycle states
- `IServiceMetadata`: Interface for service registration

### Event System

- `EventBus`: Main event bus with history and interceptors
- `EventEmitter`: Basic event emitter
- `EventPattern`: Wildcard pattern matching
- `EventRegistry`: Event metadata and validation

### Architecture

- `BaseService`: Abstract base class for all services
- `BaseServiceFactory`: Factory pattern for service creation
- `IBaseService`: Service interface

## License

MIT