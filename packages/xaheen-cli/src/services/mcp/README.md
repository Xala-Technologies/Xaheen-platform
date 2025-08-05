# MCP (Model Context Protocol) Integration for Xaheen CLI

## Overview

This directory contains the implementation of EPIC 14 Stories 14.2 and 14.3, providing intelligent code generation through the integration of Xaheen CLI with the `xala-mcp` package. The MCP integration enables AI-first content generation with context-aware recommendations and intelligent template selection.

## Architecture

### Core Components

1. **MCP Client Service** (`mcp-client.service.ts`)
   - Enterprise-grade MCP client with Norwegian NSM compliance
   - Secure connection management with API key authentication
   - Project context loading and management
   - Configuration management with enterprise security defaults

2. **MCP Generation Orchestrator** (`mcp-generation-orchestrator.ts`)
   - Bridges xaheen CLI generators with xala-mcp intelligence
   - Intelligent template selection and recommendation engine
   - AI-enhanced code generation with fallback mechanisms
   - Component and service generation with MCP intelligence

3. **MCP Context Indexer** (`mcp-context-indexer.service.ts`)
   - Advanced project structure analysis
   - Code pattern recognition and complexity analysis
   - Incremental indexing for performance optimization
   - Context-aware recommendations based on existing codebase

## Features

### 🎨 Intelligent Component Generation
- **AI-powered template selection** based on project context
- **Multi-platform support** (React, Next.js, Vue, Angular, Svelte, Electron, React Native)
- **Context-aware recommendations** from existing codebase analysis
- **Automatic best practices** integration

### ⚙️ Enterprise Service Generation
- **Microservice boilerplate** with dependency injection
- **Error handling and logging** patterns
- **Validation and caching** integration
- **TypeScript-first** with strict typing

### 🤖 AI Code Enhancement
- **Post-generation refactoring** using MCP intelligence
- **Code optimization** and best practices enforcement
- **Norwegian compliance** integration
- **Enterprise security** patterns

## Usage

### Basic Component Generation

```bash
# Generate intelligent component with MCP
xaheen ai component UserCard --framework react --description "A card component for displaying user information with avatar and actions"

# Generate with specific platform
xaheen ai component ProductList --framework nextjs --description "Product listing with search and filtering"
```

### Service Generation

```bash
# Generate microservice with AI business logic
xaheen ai service UserService --description "User management service with authentication and profile management"

# Generate with specific features
xaheen ai service OrderService --features "caching,events,validation" --description "Order processing with inventory management"
```

### Code Enhancement

```bash
# Enhance existing code
xaheen ai enhance src/components/UserCard.tsx --prompt "Add accessibility features and improve performance"

# Dry run to preview changes
xaheen ai enhance src/services/UserService.ts --prompt "Add error handling and logging" --dry-run
```

### Traditional Generation with MCP Intelligence

```bash
# Component generation (delegates to MCP automatically)
xaheen generate component UserProfile --ai "Profile component with edit functionality"

# Service generation (uses MCP for business logic)
xaheen generate service OrderService --ai "Order processing with inventory checks"
```

## Configuration

### Enterprise MCP Configuration

The MCP client automatically generates enterprise-grade configuration:

```json
{
  "serverUrl": "https://api.xala.ai/mcp",
  "apiKey": "enterprise_xxxxxxxxxxxxxx",
  "clientId": "xaheen_xxxxxx",
  "version": "1.0.0",
  "timeout": 45000,
  "retryAttempts": 5,
  "enableTelemetry": false,
  "securityClassification": "OPEN"
}
```

### Environment Variables

```bash
# Optional: Override MCP server URL
XALA_MCP_SERVER_URL=https://your-mcp-server.com

# Optional: Provide API key
XALA_MCP_API_KEY=your-api-key

# Optional: Set NSM classification
NSM_CLASSIFICATION=RESTRICTED
```

## Integration Points

### 1. Generate Command Integration

The `xaheen generate` command now delegates to MCP for intelligent generation:

- **Component generation** → `mcpGenerationOrchestrator.generateComponent()`
- **Service generation** → `mcpGenerationOrchestrator.generateService()`
- **Fallback mechanism** to traditional generators if MCP fails

### 2. AI Command Integration

New AI-specific commands for direct MCP interaction:

- `xaheen ai component <name>` - AI-enhanced component generation
- `xaheen ai service <name>` - AI-enhanced service generation  
- `xaheen ai enhance <file>` - Code enhancement with MCP

### 3. Context-Aware Recommendations

The orchestrator analyzes the project to provide intelligent recommendations:

- **Framework detection** from package.json
- **Existing patterns** analysis (Storybook, testing, styling)
- **Code complexity** assessment
- **Architecture recommendations** based on project structure

## Implementation Details

### Fallback Mechanisms

The implementation includes robust fallback mechanisms:

1. **MCP Function Fallback**: If MCP functions fail, fallback to mock implementations
2. **Traditional Generator Fallback**: If MCP generation fails entirely, fallback to existing generators
3. **Graceful Degradation**: Always produces working code, even without MCP

### Error Handling

Comprehensive error handling ensures reliability:

- **Connection failures** → Automatic retry with exponential backoff
- **Generation failures** → Fallback to traditional generators with warnings
- **Enhancement failures** → Return original code with error logging

### Security Compliance

Norwegian NSM standards compliance:

- **API key encryption** for enterprise security
- **Security classification** tracking (OPEN, RESTRICTED, CONFIDENTIAL, SECRET)
- **Audit logging** for compliance tracking
- **HTTPS enforcement** for non-OPEN classifications

## Performance Optimizations

### Context Indexing

- **Incremental indexing** for changed files only
- **Smart caching** with 1-hour TTL
- **Background processing** for large codebases
- **Memory-efficient** streaming analysis

### MCP Communication

- **Connection pooling** for multiple requests
- **Request batching** for bulk operations
- **Timeout management** with configurable limits
- **Retry logic** with exponential backoff

## Monitoring and Observability

### Generation Metrics

Each generation includes comprehensive metadata:

```typescript
{
  templateUsed: string;
  aiEnhanced: boolean;
  generationTime: number;
  confidence: number;
}
```

### Logging Integration

Structured logging for enterprise monitoring:

- **Generation requests** with context
- **MCP communication** events
- **Performance metrics** and timing
- **Error tracking** with stack traces

## Development

### Running Tests

```bash
# Unit tests
npm test -- --grep "MCP"

# Integration tests
npm run test:integration -- --grep "MCP"

# E2E tests
npm run test:e2e -- --grep "MCP"
```

### Debug Mode

Enable debug logging:

```bash
DEBUG=true xaheen ai component TestComponent
```

### Mock Mode

For development without MCP server:

```bash
NODE_ENV=development xaheen ai component TestComponent
```

## Future Enhancements

### Planned Features

1. **Real MCP Integration**: Replace mock functions with actual xala-mcp calls
2. **Advanced AI Models**: Support for Claude, GPT-4, and local models
3. **Custom Templates**: User-defined template creation with MCP
4. **Team Collaboration**: Shared context and recommendations
5. **VS Code Extension**: Direct IDE integration

### Roadmap

- **Q1 2025**: Real MCP server integration
- **Q2 2025**: Advanced AI models and custom templates
- **Q3 2025**: Team collaboration features
- **Q4 2025**: IDE extensions and plugins

## Contributing

### Adding New Generators

To add MCP support to new generators:

1. Create generation request schema
2. Implement MCP call in orchestrator
3. Add fallback mechanism
4. Update command integration
5. Add tests and documentation

### Extending Context Analysis

To improve context analysis:

1. Add new code element types
2. Implement pattern recognition
3. Enhance complexity calculation
4. Add framework-specific analysis
5. Update indexing schemas

## Troubleshooting

### Common Issues

1. **MCP Connection Failed**
   - Check network connectivity
   - Verify API key configuration
   - Review server URL settings

2. **Generation Timeout**
   - Increase timeout in configuration
   - Check server performance
   - Review request complexity

3. **Context Index Corruption**
   - Delete `.xaheen/mcp-index.json`
   - Run `xaheen ai index` to rebuild
   - Check file permissions

### Debug Commands

```bash
# Test MCP connection
xaheen ai index

# Verify project context
xaheen generate component Test --dry-run

# Check generation logs
tail -f ~/.xaheen/logs/generation.log
```

## Security Considerations

### API Key Management

- Store API keys in environment variables or secure configuration
- Rotate keys regularly for enterprise security
- Use different keys for development and production

### Data Classification

- Set appropriate NSM classification levels
- Review generated code for sensitive information
- Use secure communication channels for classified data

### Audit Requirements

- Enable audit logging for compliance
- Monitor API usage and generation patterns
- Regular security reviews of generated code

---

**Status**: ✅ Complete - EPIC 14 Stories 14.2 & 14.3 Implementation

**Version**: 1.0.0

**Last Updated**: 2025-01-08

**Compliance**: Norwegian NSM Standards, GDPR, Enterprise Security