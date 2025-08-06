# MCP Configuration & Extension System

## Overview

The MCP (Model Context Protocol) Configuration & Extension system provides advanced configuration management with hierarchical inheritance, custom plugin registration, and comprehensive testing capabilities. This implementation fulfills EPIC 14 Story 14.4 requirements.

## Features

### 🔧 Hierarchical Configuration System
- **Global Configuration**: `~/.xaheenrc`
- **Project Configuration**: `./.xaheenrc`
- **CLI Overrides**: Command-line flags override all other settings
- **Inheritance Priority**: CLI > Project > Global > Defaults

### 🔌 Plugin System
- **Plugin Discovery**: Automatic discovery from multiple directories
- **Lifecycle Management**: Initialize, load, unload, and cleanup plugins
- **Domain-Specific Patterns**: Custom pattern registration for specialized domains
- **Security Validation**: Permission-based access control and sandboxing

### 🧪 Comprehensive Testing
- **Connectivity Tests**: Network, DNS, SSL/TLS certificate validation
- **Authentication Tests**: API key validation, rate limiting, security
- **Response Validation**: JSON format, required fields, error handling
- **Performance Tests**: Response time benchmarking, concurrent requests
- **Security Tests**: SQL injection protection, XSS protection
- **Norwegian Compliance**: GDPR compliance, NSM classification

## Configuration

### Initialize Configuration

```bash
# Initialize project configuration
xaheen mcp config init

# Initialize global configuration
xaheen mcp config init global

# Initialize both with force overwrite
xaheen mcp config init both --force
```

### View Configuration

```bash
# Show current configuration with hierarchy
xaheen mcp config show

# Show with server override
xaheen mcp config show --server https://custom.mcp.server
```

### Configuration Schema

The `.xaheenrc` file follows this comprehensive schema:

```json
{
  "version": "1.0.0",
  "environment": "development",
  "server": {
    "url": "https://api.xala.ai/mcp",
    "apiKey": "your-api-key-here",
    "clientId": "your-client-id",
    "timeout": 30000,
    "retryAttempts": 3,
    "retryDelay": 1000,
    "enableCompression": true,
    "maxConcurrentRequests": 10
  },
  "security": {
    "enableTelemetry": true,
    "securityClassification": "OPEN",
    "enableEncryption": true,
    "enableMutualTLS": false
  },
  "indexing": {
    "maxFileSize": 1048576,
    "includePatterns": [
      "**/*.{ts,tsx,js,jsx,json,md,yml,yaml}"
    ],
    "excludePatterns": [
      "node_modules/**",
      "dist/**",
      ".git/**",
      "*.log",
      "coverage/**"
    ],
    "enableDeepAnalysis": true,
    "analyzeTests": true,
    "analyzeDependencies": true
  },
  "norwegianCompliance": {
    "enableGDPRCompliance": true,
    "enableNSMCompliance": true,
    "dataProcessingBasis": "legitimate_interests",
    "dataRetentionPeriod": 365,
    "enableAuditLogging": true,
    "enableDataMinimization": true,
    "enableRightToErasure": true
  },
  "plugins": {},
  "features": {
    "aiGeneration": true,
    "contextIndexing": true,
    "qualityAnalysis": true,
    "securityScanning": true,
    "performanceMonitoring": true
  }
}
```

## Plugin System

### Plugin Management

```bash
# List all registered plugins
xaheen mcp plugin list

# Filter plugins by category
xaheen mcp plugin list --category norwegian-compliance

# Filter plugins by type
xaheen mcp plugin list --type validator

# Show only enabled plugins
xaheen mcp plugin list --enabled

# Register a new plugin
xaheen mcp plugin register ./path/to/plugin

# Register from npm package
xaheen mcp plugin register @xaheen-ai/compliance-plugin --source npm

# Unregister a plugin
xaheen mcp plugin unregister plugin-name

# Enable/disable plugins
xaheen mcp plugin enable plugin-name
xaheen mcp plugin disable plugin-name
```

### Plugin Development

#### Plugin Manifest (`plugin.json`)

```json
{
  "name": "my-custom-plugin",
  "version": "1.0.0",
  "description": "Custom MCP plugin for specialized validation",
  "type": "validator",
  "category": "quality-assurance",
  "permissions": [
    "read:project",
    "mcp:analyze"
  ],
  "domainPatterns": {
    "validation": [
      "custom-rule-1",
      "custom-rule-2"
    ]
  },
  "hooks": {
    "beforeAnalyze": "validateInput",
    "afterGenerate": "auditOutput"
  },
  "config": {
    "defaults": {
      "strictMode": true
    }
  }
}
```

#### Plugin Implementation (`index.js`)

```javascript
class MyCustomPlugin {
  constructor(config) {
    this.config = config;
  }

  async validateInput(context, data) {
    // Custom validation logic
    return {
      valid: true,
      issues: [],
      recommendations: []
    };
  }

  async auditOutput(context, data) {
    // Custom audit logic
    return {
      score: 95,
      violations: [],
      suggestions: []
    };
  }

  async cleanup() {
    // Cleanup resources
  }
}

module.exports = MyCustomPlugin;
```

### Plugin Categories

- **component**: Component generation and validation
- **architecture**: Architecture pattern analysis
- **security**: Security scanning and validation
- **performance**: Performance analysis and optimization
- **accessibility**: Accessibility compliance checking
- **norwegian-compliance**: Norwegian-specific compliance
- **quality-assurance**: Code quality analysis

### Plugin Types

- **generator**: Generates code or components
- **transformer**: Transforms existing code
- **analyzer**: Analyzes code for patterns or issues
- **validator**: Validates code against rules
- **pattern**: Provides reusable patterns

## Testing System

### Run Tests

```bash
# Run all default test suites
xaheen mcp test

# Run specific test suites
xaheen mcp test --suites connectivity,authentication,security

# Run with custom timeout
xaheen mcp test --timeout 60000

# Enable verbose output
xaheen mcp test --verbose

# Run in dry-run mode
xaheen mcp test --dry-run

# Generate coverage report
xaheen mcp test --coverage

# Enable benchmarking
xaheen mcp test --benchmark

# Output to file
xaheen mcp test --format json --output ./test-results.json
```

### Test Suites

#### Connectivity Tests
- Basic server connectivity
- DNS resolution
- SSL/TLS certificate validation
- Network latency measurement

#### Authentication Tests
- API key validation
- Client ID verification
- Invalid credential handling
- Rate limiting protection

#### API Endpoint Tests
- Health check endpoint
- Version endpoint
- Generation endpoints
- Analysis endpoints
- Custom endpoint testing

#### Response Validation Tests
- JSON response format
- Required response fields
- Error response format
- Content-Type validation

#### Performance Tests
- Response time benchmarking
- Concurrent request handling
- Throughput measurement
- Resource utilization

#### Security Tests
- SQL injection protection
- XSS protection
- Input sanitization
- Authentication bypass attempts

#### Norwegian Compliance Tests
- GDPR compliance validation
- NSM security classification
- Data retention policies
- Privacy controls

### Test Configuration

Test behavior can be customized through options:

```bash
# Custom test configuration
xaheen mcp test \
  --suites connectivity,authentication,api-endpoints \
  --timeout 45000 \
  --retry 3 \
  --format html \
  --output ./reports/mcp-test-report.html \
  --coverage \
  --benchmark \
  --verbose
```

### Test Reports

The system generates comprehensive test reports including:

- **Test Summary**: Pass/fail counts, duration, scores
- **Suite Results**: Individual test suite performance
- **System Information**: Node.js version, platform, resources
- **Compliance Assessment**: Norwegian compliance status
- **Security Scoring**: Overall security assessment
- **Performance Metrics**: Response times, throughput

## Norwegian Compliance Features

### GDPR Compliance
- **Data Processing Basis**: Configurable legal basis
- **Data Retention**: Automatic retention period management
- **Right to Erasure**: Built-in data deletion capabilities
- **Data Minimization**: Automatic PII detection and minimization
- **Audit Logging**: Comprehensive audit trail

### NSM Security Classification
- **Classification Levels**: OPEN, RESTRICTED, CONFIDENTIAL, SECRET
- **Automatic Validation**: Classification-aware security controls
- **Encryption Requirements**: Automatic encryption based on classification
- **Access Controls**: Permission-based access management

## Command Reference

### Configuration Commands
```bash
xaheen mcp config init [target]     # Initialize configuration
xaheen mcp config show              # Show current configuration
```

### Plugin Commands
```bash
xaheen mcp plugin list              # List registered plugins
xaheen mcp plugin register <path>   # Register new plugin
xaheen mcp plugin unregister <name> # Unregister plugin
xaheen mcp plugin enable <name>     # Enable plugin
xaheen mcp plugin disable <name>    # Disable plugin
```

### Testing Commands
```bash
xaheen mcp test [suite]             # Run comprehensive tests
```

### Existing MCP Commands
```bash
xaheen mcp connect                  # Connect to MCP server
xaheen mcp index                    # Index project context
xaheen mcp analyze                  # Analyze project
xaheen mcp generate <name>          # Generate components
xaheen mcp suggestions              # Get AI suggestions
xaheen mcp context                  # Show project context
xaheen mcp info                     # Show client information
xaheen mcp deploy                   # Deploy with quality gates
xaheen mcp disconnect               # Disconnect from server
```

## Configuration Hierarchy Examples

### Example 1: Global Defaults
**~/.xaheenrc**:
```json
{
  "server": {
    "url": "https://corporate.mcp.server",
    "timeout": 45000
  },
  "security": {
    "securityClassification": "RESTRICTED"
  }
}
```

### Example 2: Project Override
**./.xaheenrc**:
```json
{
  "server": {
    "timeout": 60000
  },
  "indexing": {
    "enableDeepAnalysis": false
  }
}
```

### Example 3: CLI Override
```bash
xaheen mcp test --server https://test.mcp.server --timeout 30000
```

**Final Configuration**:
- `server.url`: `https://test.mcp.server` (CLI override)
- `server.timeout`: `30000` (CLI override)
- `security.securityClassification`: `RESTRICTED` (Global)
- `indexing.enableDeepAnalysis`: `false` (Project)

## Security Considerations

### API Key Management
- Store API keys in environment variables when possible
- Use separate keys for different environments
- Rotate keys regularly
- Never commit keys to version control

### Plugin Security
- Only install plugins from trusted sources
- Review plugin permissions before installation
- Use sandboxing for untrusted plugins
- Regular security audits of installed plugins

### Network Security
- Use HTTPS for all MCP connections
- Validate SSL certificates
- Implement proper retry logic with exponential backoff
- Monitor for unusual network activity

## Troubleshooting

### Common Issues

#### Configuration Not Found
```
Error: MCP configuration not found. Run 'xaheen mcp config init' first.
```
**Solution**: Initialize configuration with `xaheen mcp config init`

#### Plugin Registration Failed
```
Error: Plugin main file not found: index.js
```
**Solution**: Ensure plugin has valid `plugin.json` and main file

#### Test Connection Failed
```
Error: Request failed: ECONNREFUSED
```
**Solution**: Check server URL and network connectivity

#### Authentication Failed
```
Error: Invalid API key should return 401/403
```
**Solution**: Verify API key in configuration

### Debug Mode

Enable debug mode for detailed logging:

```bash
export NODE_ENV=development
xaheen mcp test --verbose
```

## Best Practices

### Configuration Management
1. Use environment-specific configurations
2. Keep sensitive data in environment variables
3. Document configuration changes
4. Regular configuration validation

### Plugin Development
1. Follow the plugin manifest schema strictly
2. Implement proper error handling
3. Provide comprehensive documentation
4. Include unit tests for plugin logic

### Testing Strategy
1. Run tests regularly in CI/CD pipeline
2. Monitor test results for performance regression
3. Use appropriate test suites for different environments
4. Maintain test coverage above 80%

### Norwegian Compliance
1. Regular compliance audits
2. Keep data retention policies up to date
3. Document all data processing activities
4. Implement privacy by design principles

## API Integration

The MCP Configuration & Extension system integrates seamlessly with existing MCP functionality:

```typescript
import { mcpConfigService } from './services/mcp/mcp-config.service.js';
import { mcpPluginManager } from './services/mcp/mcp-plugin-manager.service.js';
import { mcpTestService } from './services/mcp/mcp-test.service.js';

// Load configuration with CLI overrides
const config = await mcpConfigService.getConfig(cliOverrides);

// Initialize plugin manager
await mcpPluginManager.initialize();

// Run comprehensive tests
const report = await mcpTestService.runTests(config, testConfig);
```

This comprehensive system provides enterprise-grade MCP configuration management with Norwegian compliance support, making it suitable for government and enterprise deployments requiring strict security and compliance standards.