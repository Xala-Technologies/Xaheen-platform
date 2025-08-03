/**
 * Template Migration Example
 * 
 * Demonstrates how to migrate from inline templates to external template files.
 * This shows the transformation needed for the service registry.
 * 
 * @author CLI Template Generator Agent
 * @since 2025-01-03
 */

// OLD: Inline template approach (current)
const oldOpenAIService = {
  name: 'openai',
  type: 'ai',
  provider: 'openai',
  version: '4.0.0',
  description: 'OpenAI API integration for GPT, DALL-E, and embeddings',
  injectionPoints: [
    {
      type: 'file-create',
      target: 'src/lib/ai/openai.ts',
      template: `import OpenAI from 'openai';

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export interface ChatCompletionOptions {
  model?: string;
  temperature?: number;
  maxTokens?: number;
  systemPrompt?: string;
}

export async function generateChatCompletion(
  messages: OpenAI.Chat.ChatCompletionMessageParam[],
  options: ChatCompletionOptions = {}
) {
  // ... very long inline template content
}`,
      priority: 80
    }
  ],
  dependencies: {
    npm: {
      'openai': '^4.0.0'
    }
  },
  environmentVariables: [
    {
      name: 'OPENAI_API_KEY',
      description: 'OpenAI API key',
      required: true,
      type: 'string'
    }
  ]
};

// NEW: External template approach (recommended)
const newOpenAIService = {
  name: 'openai',
  type: 'ai',
  provider: 'openai',
  version: '4.0.0',
  description: 'OpenAI API integration for GPT, DALL-E, and embeddings',
  injectionPoints: [
    {
      type: 'file-create',
      target: 'src/lib/ai/openai.ts',
      // Reference to external template file instead of inline content
      template: 'ai/files/openai.hbs',
      priority: 80
    },
    // Can add multiple template files for the same service
    {
      type: 'file-create',
      target: 'src/types/openai.ts',
      template: 'ai/files/openai-types.hbs',
      priority: 70
    }
  ],
  dependencies: {
    npm: {
      'openai': '^4.0.0'
    }
  },
  environmentVariables: [
    {
      name: 'OPENAI_API_KEY',
      description: 'OpenAI API key',
      required: true,
      type: 'string'
    }
  ]
};

// NEW: Vercel AI SDK service using external templates
const vercelAIService = {
  name: 'vercel-ai',
  type: 'ai-chatbot',
  provider: 'vercel',
  version: '3.0.0',
  description: 'Vercel AI SDK for building AI-powered applications',
  injectionPoints: [
    {
      type: 'file-create',
      target: 'src/components/ai-chat.tsx',
      template: 'ai-chatbot/components/vercel-ai-chat.hbs',
      priority: 90
    },
    {
      type: 'file-create',
      target: 'src/app/api/chat/route.ts',
      template: 'ai-chatbot/files/vercel-ai-api.hbs',
      priority: 80
    },
    {
      type: 'file-create',
      target: 'src/lib/ai/hooks.ts',
      template: 'ai-chatbot/files/vercel-ai-hooks.hbs',
      priority: 70
    }
  ],
  dependencies: {
    npm: {
      'ai': '^3.0.0',
      'openai': '^4.0.0'
    }
  },
  environmentVariables: [
    {
      name: 'OPENAI_API_KEY',
      description: 'OpenAI API key',
      required: true,
      type: 'string'
    }
  ]
};

// Benefits of external templates:
// 1. Better maintainability - templates are in separate files with syntax highlighting
// 2. Reusability - templates can be shared across different services
// 3. Version control - easier to track changes to templates
// 4. Testing - templates can be tested independently
// 5. IDE support - full TypeScript/React/etc. support in template files
// 6. Smaller registry file - service definitions are more concise

export {
  oldOpenAIService,
  newOpenAIService,
  vercelAIService
};