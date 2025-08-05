# AI Providers

## Purpose

The AI providers module manages integration with various artificial intelligence services for code generation, analysis, and optimization. It provides a unified interface for different AI models while maintaining Norwegian enterprise compliance and security standards.

## Architecture

```
ai/
├── OpenAIProvider.ts      # OpenAI GPT models integration
├── ClaudeProvider.ts      # Anthropic Claude integration
├── AzureOpenAIProvider.ts # Azure OpenAI service
├── LocalModelProvider.ts  # Local AI models (Ollama, LocalAI)
├── NorwegianAIProvider.ts # Norwegian AI services
├── AIProviderManager.ts   # Provider orchestration
├── types.ts              # AI provider types
└── utils.ts              # AI utilities and helpers
```

### Key Features

- **Multi-Model Support**: GPT-4, Claude, local models
- **Smart Routing**: Automatic model selection based on task
- **Cost Optimization**: Token usage tracking and optimization
- **Norwegian Compliance**: Data residency and privacy controls
- **Fallback Strategy**: Graceful degradation when primary models fail

## Dependencies

- `openai`: Official OpenAI API client
- `@anthropic-ai/sdk`: Claude API integration
- `@azure/openai`: Azure OpenAI service
- `ollama`: Local model management
- `tiktoken`: Token counting for cost estimation

## Usage Examples

### Basic AI Provider Usage

```typescript
import { AIProviderManager } from './AIProviderManager';

const aiManager = new AIProviderManager({
  primaryProvider: 'openai',
  fallbackProvider: 'claude',
  costOptimization: true,
  norwegianCompliance: true
});

// Generate code with AI
const result = await aiManager.generateCode({
  prompt: 'Create a React component for user authentication',
  language: 'typescript',
  framework: 'react',
  compliance: 'nsm'
});
```

### Model-Specific Usage

```typescript
import { OpenAIProvider } from './OpenAIProvider';

const openai = new OpenAIProvider({
  apiKey: process.env.OPENAI_API_KEY,
  model: 'gpt-4',
  maxTokens: 2000,
  temperature: 0.7
});

const response = await openai.complete({
  messages: [
    {
      role: 'system',
      content: 'You are an expert TypeScript developer following Norwegian coding standards.'
    },
    {
      role: 'user',
      content: 'Generate a TypeScript interface for a Norwegian user profile with GDPR compliance.'
    }
  ]
});
```

### Local Model Integration

```typescript
import { LocalModelProvider } from './LocalModelProvider';

const localAI = new LocalModelProvider({
  model: 'codellama:7b',
  endpoint: 'http://localhost:11434',
  privacy: 'on-premise' // Ensures data doesn't leave the organization
});

const code = await localAI.generateCode({
  prompt: 'Create a secure authentication service',
  context: 'Norwegian government application',
  securityLevel: 'SECRET'
});
```

## Provider Implementations

### OpenAI Provider

**Features:**
- GPT-4 and GPT-3.5-turbo support
- Function calling capabilities
- Vision model integration
- Token usage optimization

**Configuration:**
```typescript
interface OpenAIConfig {
  apiKey: string;
  model: 'gpt-4' | 'gpt-3.5-turbo' | 'gpt-4-vision-preview';
  maxTokens: number;
  temperature: number;
  organizationId?: string;
  baseURL?: string; // For Azure OpenAI
}
```

### Claude Provider

**Features:**
- Claude-3 and Claude-2 models
- Large context window (100k+ tokens)
- Code analysis and refactoring
- Constitutional AI safety

**Configuration:**
```typescript
interface ClaudeConfig {
  apiKey: string;
  model: 'claude-3-opus' | 'claude-3-sonnet' | 'claude-2';
  maxTokens: number;
  temperature: number;
  systemPrompt?: string;
}
```

### Azure OpenAI Provider

**Features:**
- Enterprise-grade OpenAI models
- European data residency
- Advanced security controls
- Integration with Azure AD

**Configuration:**
```typescript
interface AzureOpenAIConfig {
  endpoint: string;
  apiKey: string;
  apiVersion: string;
  deploymentName: string;
  resourceName: string;
  region: 'norwayeast' | 'westeurope'; // Norwegian compliance
}
```

### Norwegian AI Provider

**Features:**
- Local Norwegian AI services
- Norwegian language optimization
- Government security clearance
- On-premise deployment options

**Configuration:**
```typescript
interface NorwegianAIConfig {
  provider: 'nais' | 'uninett' | 'custom';
  endpoint: string;
  credentials: NorwegianCredentials;
  securityLevel: NSMSecurityLevel;
  dataResidency: 'norway-only';
}
```

## Norwegian Enterprise Features

### NSM Security Classification

```typescript
interface AIRequest {
  prompt: string;
  securityLevel: 'OPEN' | 'RESTRICTED' | 'CONFIDENTIAL' | 'SECRET';
  dataClassification: NSMDataClassification;
  processingLocation: 'norway' | 'eu' | 'global';
}

class SecureAIProvider {
  async processRequest(request: AIRequest): Promise<AIResponse> {
    // Validate security requirements
    if (request.securityLevel === 'SECRET') {
      // Route to Norwegian-only providers
      return this.routeToSecureProvider(request);
    }
    
    // Apply data masking for sensitive information
    const maskedPrompt = this.maskSensitiveData(request.prompt);
    
    return this.processWithAppropriateProvider(maskedPrompt);
  }
}
```

### GDPR Compliance

```typescript
class GDPRCompliantAIProvider {
  async processPersonalData(
    prompt: string, 
    personalDataConsent: ConsentRecord
  ): Promise<AIResponse> {
    // Validate consent before processing
    if (!this.validateConsent(personalDataConsent)) {
      throw new Error('Valid consent required for personal data processing');
    }
    
    // Log processing activity
    await this.auditLogger.logPersonalDataProcessing({
      userId: personalDataConsent.userId,
      purpose: 'AI code generation',
      legalBasis: 'consent',
      timestamp: new Date()
    });
    
    const response = await this.aiProvider.complete(prompt);
    
    // Ensure no personal data in response
    return this.sanitizePersonalData(response);
  }
}
```

## Cost Optimization

### Token Management

```typescript
class TokenOptimizer {
  async optimizePrompt(prompt: string, model: string): Promise<string> {
    // Count tokens
    const tokenCount = this.countTokens(prompt, model);
    
    if (tokenCount > this.costThresholds[model]) {
      // Compress prompt while maintaining context
      return this.compressPrompt(prompt);
    }
    
    return prompt;
  }
  
  async estimateCost(
    prompt: string, 
    model: string, 
    maxTokens: number
  ): Promise<CostEstimate> {
    const inputTokens = this.countTokens(prompt, model);
    const outputTokens = maxTokens;
    
    return {
      inputCost: inputTokens * this.pricing[model].input,
      outputCost: outputTokens * this.pricing[model].output,
      totalCost: (inputTokens * this.pricing[model].input) + 
                 (outputTokens * this.pricing[model].output),
      currency: 'USD'
    };
  }
}
```

### Model Selection Strategy

```typescript
class SmartModelSelector {
  selectOptimalModel(task: AITask): string {
    const requirements = this.analyzeRequirements(task);
    
    // For simple tasks, use cost-effective models
    if (requirements.complexity === 'low') {
      return 'gpt-3.5-turbo';
    }
    
    // For complex reasoning, use advanced models
    if (requirements.reasoning === 'high') {
      return 'gpt-4';
    }
    
    // For large context, use Claude
    if (requirements.contextSize > 8000) {
      return 'claude-3-sonnet';
    }
    
    // For Norwegian language tasks
    if (requirements.language === 'norwegian') {
      return 'norwegian-ai';
    }
    
    return 'gpt-4'; // Default fallback
  }
}
```

## Testing

### Unit Tests

```typescript
describe('OpenAIProvider', () => {
  let provider: OpenAIProvider;
  
  beforeEach(() => {
    provider = new OpenAIProvider({
      apiKey: 'test-key',
      model: 'gpt-4',
      maxTokens: 1000
    });
  });
  
  it('should generate code with Norwegian compliance', async () => {
    const result = await provider.generateCode({
      prompt: 'Create a GDPR-compliant user service',
      compliance: 'gdpr'
    });
    
    expect(result.code).toContain('ConsentRecord');
    expect(result.metadata.compliance).toEqual(['gdpr', 'nsm']);
  });
});
```

### Integration Tests

```typescript
describe('AI Provider Integration', () => {
  it('should handle provider failover', async () => {
    const manager = new AIProviderManager({
      primaryProvider: 'openai',
      fallbackProvider: 'claude'
    });
    
    // Mock primary provider failure
    jest.spyOn(manager.openaiProvider, 'complete')
        .mockRejectedValueOnce(new Error('API limit exceeded'));
    
    const result = await manager.generateCode({
      prompt: 'Create a simple component'
    });
    
    expect(result.provider).toBe('claude');
    expect(result.success).toBe(true);
  });
});
```

## Security Considerations

### Data Protection

```typescript
class SecureAIProcessor {
  private sensitivePatterns = [
    /\b\d{11}\b/g, // Norwegian personal numbers
    /\b\d{4}\s\d{4}\s\d{4}\s\d{4}\b/g, // Credit card numbers
    /\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Z|a-z]{2,}\b/g // Email addresses
  ];
  
  maskSensitiveData(text: string): string {
    let maskedText = text;
    
    this.sensitivePatterns.forEach(pattern => {
      maskedText = maskedText.replace(pattern, '[REDACTED]');
    });
    
    return maskedText;
  }
  
  async auditRequest(request: AIRequest): Promise<void> {
    await this.auditLogger.log({
      action: 'ai_request',
      provider: request.provider,
      model: request.model,
      tokenCount: this.countTokens(request.prompt),
      securityLevel: request.securityLevel,
      timestamp: new Date(),
      userId: request.userId
    });
  }
}
```

### Access Control

```typescript
class AIAccessController {
  async validateAccess(
    userId: string, 
    aiModel: string, 
    securityLevel: string
  ): Promise<boolean> {
    const user = await this.userService.getUser(userId);
    const permissions = await this.permissionService.getUserPermissions(userId);
    
    // Check if user has access to specific AI model
    if (!permissions.aiModels.includes(aiModel)) {
      return false;
    }
    
    // Check security clearance for classified operations
    if (securityLevel === 'SECRET' && user.securityClearance !== 'SECRET') {
      return false;
    }
    
    return true;
  }
}
```

## Performance Optimization

### Caching Strategy

```typescript
class AIResponseCache {
  private cache = new Map<string, CachedResponse>();
  
  async getCachedResponse(prompt: string, model: string): Promise<AIResponse | null> {
    const key = this.generateCacheKey(prompt, model);
    const cached = this.cache.get(key);
    
    if (cached && !this.isExpired(cached)) {
      return cached.response;
    }
    
    return null;
  }
  
  async cacheResponse(
    prompt: string, 
    model: string, 
    response: AIResponse
  ): Promise<void> {
    const key = this.generateCacheKey(prompt, model);
    
    this.cache.set(key, {
      response,
      timestamp: Date.now(),
      ttl: 3600000 // 1 hour
    });
  }
}
```

### Rate Limiting

```typescript
class AIRateLimiter {
  private limits = new Map<string, RateLimit>();
  
  async checkRateLimit(userId: string, model: string): Promise<boolean> {
    const key = `${userId}:${model}`;
    const limit = this.limits.get(key);
    
    if (!limit) {
      this.limits.set(key, {
        requests: 1,
        windowStart: Date.now(),
        maxRequests: this.getModelLimit(model)
      });
      return true;
    }
    
    // Reset window if expired
    if (Date.now() - limit.windowStart > 3600000) { // 1 hour
      limit.requests = 1;
      limit.windowStart = Date.now();
      return true;
    }
    
    // Check if under limit
    if (limit.requests < limit.maxRequests) {
      limit.requests++;
      return true;
    }
    
    return false; // Rate limit exceeded
  }
}
```

## Contributing

### Adding New AI Providers

1. **Implement Provider Interface**:
   ```typescript
   export class NewAIProvider implements AIProvider {
     async complete(request: AIRequest): Promise<AIResponse> {
       // Implementation
     }
   }
   ```

2. **Add Provider Configuration**:
   ```typescript
   interface NewAIConfig extends AIProviderConfig {
     // Provider-specific configuration
   }
   ```

3. **Register Provider**:
   ```typescript
   providerManager.register('new-ai', NewAIProvider);
   ```

### Development Guidelines

- Follow Norwegian data protection laws
- Implement proper error handling and fallbacks
- Add comprehensive logging for audit trails
- Include cost estimation and optimization
- Provide clear documentation and examples
- Add unit and integration tests
- Consider security implications of AI model usage