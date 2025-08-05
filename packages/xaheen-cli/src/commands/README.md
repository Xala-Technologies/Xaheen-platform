# Commands Module

## Overview

The Commands module is the entry point for all CLI interactions in the Xaheen CLI. It implements a comprehensive command handling system that supports over 20 different command types, from code generation to enterprise monitoring and compliance reporting.

## Architecture

The commands module follows a modular, extensible architecture with:

- **Command Registration**: Automatic discovery and registration of command handlers
- **Validation**: Input validation and sanitization
- **Error Handling**: Comprehensive error handling with user-friendly messages
- **Middleware Support**: Pluggable middleware for cross-cutting concerns
- **Handler Pattern**: Clean separation between command interface and business logic

## Core Components

### Command Types

#### Code Generation Commands
- `generate.ts` - Core code generation command
- `create.ts` - Project and component creation
- `add.ts` - Add components to existing projects
- `scaffold.ts` - Full-stack scaffolding

#### AI-Powered Commands
- `ai.ts` - AI-powered code generation and analysis
- `ai-generate.ts` - Specialized AI generation workflows
- `ai-model-training.ts` - Custom model training capabilities

#### Enterprise Commands
- `enterprise-auth.ts` - Enterprise authentication setup
- `compliance-report.ts` - Generate compliance reports
- `security-audit.ts` - Security auditing and scanning
- `license-compliance.ts` - License compliance checking

#### DevOps & Deployment
- `deploy.ts` - Deployment orchestration
- `bundle.ts` - Bundle management and optimization
- `docker.ts` - Container management (via generators)

#### Developer Experience
- `docs.ts` - Documentation generation
- `doctor.ts` - Health check and diagnostics
- `validate.ts` - Project validation
- `refactor.ts` - Code refactoring assistance

#### Community & Plugins
- `plugin.ts` - Plugin management
- `community.ts` - Community features
- `team-templates.ts` - Team template sharing

#### Advanced Features
- `mcp.ts` - Model Context Protocol integration
- `modernize-templates.ts` - Template modernization
- `upgrade.ts` - CLI and project upgrades

## Command Structure

Each command follows a consistent structure:

```typescript
interface CommandConfig {
  readonly name: string;
  readonly description: string;
  readonly options: CommandOption[];
  readonly handler: CommandHandler;
  readonly middleware?: MiddlewareFunction[];
}

interface CommandHandler {
  execute(args: CommandArgs, context: CommandContext): Promise<CommandResult>;
}
```

### Example Implementation

```typescript
// generate.ts
export const generateCommand: CommandConfig = {
  name: 'generate',
  description: 'Generate code components and structures',
  options: [
    {
      name: 'type',
      type: 'string',
      required: true,
      description: 'Type of component to generate'
    },
    {
      name: 'name',
      type: 'string',
      required: true,
      description: 'Name of the component'
    }
  ],
  handler: {
    async execute(args, context) {
      // Implementation logic
      return { success: true, message: 'Component generated successfully' };
    }
  }
};
```

## Command Registration

Commands are automatically registered through the command registry:

```typescript
// In core/command-parser/index.ts
export class CommandRegistry {
  private commands = new Map<string, CommandConfig>();

  register(command: CommandConfig): void {
    this.commands.set(command.name, command);
  }

  resolve(commandName: string): CommandConfig | undefined {
    return this.commands.get(commandName);
  }
}
```

## Middleware System

The commands module supports middleware for cross-cutting concerns:

### Available Middleware
- **Validation Middleware**: Input validation and sanitization
- **Authentication Middleware**: User authentication for enterprise features
- **Logging Middleware**: Command execution logging
- **Performance Middleware**: Execution time tracking
- **Error Handling Middleware**: Centralized error handling

### Custom Middleware

```typescript
interface MiddlewareFunction {
  (context: CommandContext, next: NextFunction): Promise<void>;
}

const loggingMiddleware: MiddlewareFunction = async (context, next) => {
  console.log(`Executing command: ${context.command.name}`);
  await next();
  console.log(`Command completed: ${context.command.name}`);
};
```

## Error Handling

Commands implement comprehensive error handling:

```typescript
try {
  const result = await handler.execute(args, context);
  return result;
} catch (error) {
  if (error instanceof ValidationError) {
    return { success: false, error: 'Invalid input parameters' };
  } else if (error instanceof NetworkError) {
    return { success: false, error: 'Network connectivity issue' };
  } else {
    return { success: false, error: 'An unexpected error occurred' };
  }
}
```

## Testing Strategy

### Unit Tests
Each command has corresponding unit tests:
- `create.unit.test.ts` - Tests for create command
- `ai.unit.test.ts` - Tests for AI commands
- `validate.test.ts` - Tests for validation command

### Integration Tests
Commands are tested in integration scenarios:
- End-to-end workflow testing
- Multi-command orchestration
- Error scenario testing

### Test Structure

```typescript
describe('GenerateCommand', () => {
  it('should generate React component successfully', async () => {
    const args = { type: 'component', name: 'TestComponent' };
    const result = await generateCommand.handler.execute(args, mockContext);
    
    expect(result.success).toBe(true);
    expect(result.files).toContain('TestComponent.tsx');
  });
});
```

## Adding New Commands

### Step 1: Create Command File

```typescript
// new-command.ts
export const newCommand: CommandConfig = {
  name: 'new-feature',
  description: 'Description of the new feature',
  options: [
    // Command options
  ],
  handler: {
    async execute(args, context) {
      // Implementation
    }
  }
};
```

### Step 2: Register Command

```typescript
// In main CLI entry point
import { newCommand } from './commands/new-command';

commandRegistry.register(newCommand);
```

### Step 3: Add Tests

```typescript
// new-command.test.ts
describe('NewCommand', () => {
  // Test cases
});
```

## Configuration

Commands can be configured through:

- **CLI Arguments**: Runtime arguments and flags
- **Configuration Files**: Project-level configuration
- **Environment Variables**: Environment-specific settings
- **Default Values**: Sensible defaults for all options

## Dependencies

The commands module depends on:

- **Core Services**: File system, logging, template engine
- **Generators**: Code generation engines
- **Validators**: Input and project validation
- **External APIs**: For AI and enterprise features

## Best Practices

1. **Single Responsibility**: Each command should have a single, well-defined purpose
2. **Error Handling**: Always implement comprehensive error handling
3. **Validation**: Validate all inputs before processing
4. **Testing**: Write unit and integration tests for all commands
5. **Documentation**: Document command options and behavior
6. **Backwards Compatibility**: Maintain compatibility when modifying existing commands

## Performance Considerations

- **Lazy Loading**: Commands are loaded on-demand
- **Caching**: Results are cached where appropriate
- **Async Operations**: All I/O operations are asynchronous
- **Resource Cleanup**: Proper cleanup of resources after command execution

## Security

- **Input Sanitization**: All user inputs are sanitized
- **Path Validation**: File paths are validated to prevent directory traversal
- **Permission Checks**: File system permissions are verified
- **Audit Logging**: Security-relevant operations are logged

## Future Enhancements

- **Plugin Commands**: Dynamic command loading from plugins
- **Interactive Mode**: Interactive command-line interfaces
- **Command Aliases**: Support for command aliases and shortcuts
- **Command History**: Command execution history and replay
- **Parallel Execution**: Support for parallel command execution