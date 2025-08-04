/**
 * Template Registry
 * 
 * Maps service configurations to their external template files.
 * This replaces inline templates with file-based templates for better maintainability.
 * 
 * @author CLI Template Generator Agent
 * @since 2025-01-03
 */

export interface ServiceTemplateMapping {
  serviceType: string;
  provider: string;
  templates: {
    [key: string]: string; // injection point name -> template file path
  };
}

export const SERVICE_TEMPLATE_MAPPINGS: ServiceTemplateMapping[] = [
  // Frontend Framework Templates
  {
    serviceType: 'frontend',
    provider: 'next',
    templates: {
      'package-json': 'frontend/next/configs/package.json.hbs',
      'next-config': 'frontend/next/configs/next.config.ts.hbs',
      'tailwind-config': 'frontend/next/configs/tailwind.config.ts.hbs',
      'tsconfig': 'frontend/next/configs/tsconfig.json.hbs',
      'layout': 'frontend/next/components/layout.tsx.hbs',
      'page': 'frontend/next/components/page.tsx.hbs',
      'middleware': 'frontend/next/files/middleware.ts.hbs',
      'providers': 'frontend/next/components/providers.tsx.hbs',
      'theme-provider': 'frontend/next/components/theme-provider.tsx.hbs',
      'error-boundary': 'frontend/next/components/ErrorBoundary.tsx.hbs'
    }
  },
  {
    serviceType: 'frontend',
    provider: 'react',
    templates: {
      'package-json': 'frontend/react/configs/package.json.hbs',
      'vite-config': 'frontend/react/configs/vite.config.ts.hbs',
      'tsconfig': 'frontend/react/configs/tsconfig.json.hbs',
      'root': 'frontend/react/components/root.tsx.hbs',
      'router': 'frontend/react/components/router.tsx.hbs',
      'main': 'frontend/react/components/main.tsx.hbs'
    }
  },
  {
    serviceType: 'frontend',
    provider: 'svelte',
    templates: {
      'package-json': 'frontend/svelte/configs/package.json.hbs',
      'svelte-config': 'frontend/svelte/configs/svelte.config.js.hbs',
      'tailwind-config': 'frontend/svelte/configs/tailwind.config.ts.hbs',
      'tsconfig': 'frontend/svelte/configs/tsconfig.json.hbs',
      'layout': 'frontend/svelte/files/+layout.svelte.hbs',
      'page': 'frontend/svelte/files/+page.svelte.hbs'
    }
  },
  {
    serviceType: 'frontend',
    provider: 'nuxt',
    templates: {
      'package-json': 'frontend/nuxt/configs/package.json.hbs',
      'nuxt-config': 'frontend/nuxt/configs/nuxt.config.ts.hbs',
      'tailwind-config': 'frontend/nuxt/configs/tailwind.config.ts.hbs',
      'tsconfig': 'frontend/nuxt/configs/tsconfig.json.hbs',
      'layout': 'frontend/nuxt/components/default.vue.hbs',
      'page': 'frontend/nuxt/components/index.vue.hbs'
    }
  },
  {
    serviceType: 'frontend',
    provider: 'solid',
    templates: {
      'package-json': 'frontend/solid/configs/package.json.hbs',
      'vite-config': 'frontend/solid/configs/vite.config.ts.hbs',
      'tailwind-config': 'frontend/solid/configs/tailwind.config.ts.hbs',
      'tsconfig': 'frontend/solid/configs/tsconfig.json.hbs',
      'root': 'frontend/solid/components/__root.tsx.hbs',
      'index': 'frontend/solid/components/index.tsx.hbs',
      'main': 'frontend/solid/components/main.tsx.hbs'
    }
  },
  {
    serviceType: 'frontend',
    provider: 'angular',
    templates: {
      'package-json': 'frontend/angular/configs/package.json.hbs',
      'angular-config': 'frontend/angular/configs/angular.json.hbs',
      'tsconfig': 'frontend/angular/configs/tsconfig.json.hbs',
      'app-component': 'frontend/angular/components/app.component.ts.hbs',
      'app-routes': 'frontend/angular/files/app.routes.ts.hbs',
      'main': 'frontend/angular/files/main.ts.hbs',
      'index': 'frontend/angular/files/index.html.hbs'
    }
  },
  {
    serviceType: 'frontend',
    provider: 'vue',
    templates: {
      'package-json': 'frontend/vue/configs/package.json.hbs',
      'vite-config': 'frontend/vue/configs/vite.config.ts.hbs',
      'tailwind-config': 'frontend/vue/configs/tailwind.config.ts.hbs'
    }
  },

  // Backend Framework Templates
  {
    serviceType: 'backend',
    provider: 'express',
    templates: {
      'server': 'backend/express/files/index.ts.hbs'
    }
  },
  {
    serviceType: 'backend',
    provider: 'fastify',
    templates: {
      'server': 'backend/fastify/files/index.ts.hbs'
    }
  },
  {
    serviceType: 'backend',
    provider: 'next',
    templates: {
      'package-json': 'backend/next/configs/package.json.hbs',
      'tsconfig': 'backend/next/configs/tsconfig.json.hbs'
    }
  },
  {
    serviceType: 'backend',
    provider: 'django',
    templates: {
      'manage': 'backend/django/files/manage.py.hbs',
      'requirements': 'backend/django/files/requirements.txt.hbs',
      'settings': 'backend/django/files/settings.py.hbs',
      'urls': 'backend/django/files/urls.py.hbs',
      'views': 'backend/django/files/views.py.hbs'
    }
  },
  {
    serviceType: 'backend',
    provider: 'dotnet',
    templates: {
      'program': 'backend/dotnet/files/Program.cs.hbs',
      'appsettings': 'backend/dotnet/configs/appsettings.json.hbs',
      'project': 'backend/dotnet/files/{{projectName}}.csproj.hbs',
      'controller': 'backend/dotnet/files/WeatherController.cs.hbs',
      'service': 'backend/dotnet/files/WeatherService.cs.hbs',
      'interface': 'backend/dotnet/files/IWeatherService.cs.hbs',
      'model': 'backend/dotnet/files/WeatherForecast.cs.hbs'
    }
  },
  {
    serviceType: 'backend',
    provider: 'laravel',
    templates: {
      'composer': 'backend/laravel/configs/composer.json.hbs',
      'routes': 'backend/laravel/files/api.php.hbs',
      'controller': 'backend/laravel/files/WeatherController.php.hbs',
      'base-controller': 'backend/laravel/files/Controller.php.hbs'
    }
  },

  // Database Templates
  {
    serviceType: 'database',
    provider: 'prisma',
    templates: {
      'schema-postgres': 'database/prisma/files/schema.prisma.hbs',
      'config-postgres': 'database/prisma/configs/prisma.config.ts.hbs',
      'client': 'database/prisma/files/index.ts.hbs'
    }
  },
  {
    serviceType: 'database',
    provider: 'drizzle',
    templates: {
      'config-postgres': 'database/drizzle/configs/drizzle.config.ts.hbs',
      'client': 'database/drizzle/files/index.ts.hbs'
    }
  },
  {
    serviceType: 'database',
    provider: 'mongoose',
    templates: {
      'client': 'database/mongoose/files/index.ts.hbs'
    }
  },

  // API Templates
  {
    serviceType: 'api',
    provider: 'trpc',
    templates: {
      'client': 'api/trpc/files/trpc.ts.hbs',
      'context': 'api/trpc/files/context.ts.hbs',
      'router': 'api/trpc/files/trpc.ts.hbs'
    }
  },
  {
    serviceType: 'api',
    provider: 'orpc',
    templates: {
      'client': 'api/orpc/files/orpc.ts.hbs',
      'context': 'api/orpc/files/context.ts.hbs',
      'server': 'api/orpc/files/orpc.ts.hbs',
      'route': 'api/orpc/files/route.ts.hbs'
    }
  },

  // Auth Templates
  {
    serviceType: 'auth',
    provider: 'default',
    templates: {
      'auth-client': 'auth/files/auth-client.ts.hbs',
      'auth-config': 'auth/files/auth.ts.hbs',
      'signin': 'auth/components/sign-in.tsx.hbs',
      'signup': 'auth/components/sign-up.tsx.hbs',
      'dashboard': 'auth/components/dashboard.tsx.hbs',
      'user-menu': 'auth/components/user-menu.tsx.hbs'
    }
  },

  // Examples Templates
  {
    serviceType: 'examples',
    provider: 'default',
    templates: {
      'todo-page': 'examples/components/todos.tsx.hbs',
      'todo-router': 'examples/files/todo.ts.hbs',
      'ai-page': 'examples/components/ai.tsx.hbs'
    }
  },

  // Integration Templates
  {
    serviceType: 'integrations',
    provider: 'default',
    templates: {
      'vipps-service': 'integrations/files/vipps-service.ts.hbs',
      'bankid-service': 'integrations/files/bankid-service.ts.hbs',
      'altinn-service': 'integrations/files/altinn-service.ts.hbs',
      'stripe-service': 'integrations/files/stripe-service.ts.hbs',
      'oauth-service': 'integrations/files/oauth-service.ts.hbs',
      'mfa-service': 'integrations/files/mfa-service.ts.hbs',
      'session-service': 'integrations/files/session-service.ts.hbs',
      'webhook-handler': 'integrations/files/webhook-handler.ts.hbs',
      'teams-client': 'integrations/files/teams-client.ts.hbs',
      'slack-client': 'integrations/files/slack-client.ts.hbs'
    }
  },

  // Component Templates
  {
    serviceType: 'components',
    provider: 'default',
    templates: {
      'xala-advanced': 'components/files/xala-advanced.hbs',
      'xala-error-boundary': 'components/files/xala-error-boundary.hbs',
      'xala-form-norwegian': 'components/files/xala-form-norwegian.hbs',
      'xala-display-norwegian': 'components/files/xala-display-norwegian.hbs',
      'xala-display-gdpr': 'components/files/xala-display-gdpr.hbs',
      'xala-display-wcag-aaa': 'components/files/xala-display-wcag-aaa.hbs',
      'xala-display-iso27001': 'components/files/xala-display-iso27001.hbs'
    }
  },

  // Localization Templates
  {
    serviceType: 'localization',
    provider: 'default',
    templates: {
      'rtl-layout': 'localization/components/rtl-layout.tsx.hbs',
      'rtl-card': 'localization/components/rtl-card.tsx.hbs',
      'rtl-button': 'localization/components/rtl-button.tsx.hbs',
      'rtl-styles': 'localization/files/rtl-styles.css.hbs'
    }
  },

  // AI Services (keeping existing structure for compatibility)
  {
    serviceType: 'ai',
    provider: 'openai',
    templates: {
      'openai-client': 'ai/files/openai.hbs',
      'openai-types': 'ai/files/openai-types.hbs',
      'openai-config': 'ai/configs/openai-config.hbs'
    }
  },
  {
    serviceType: 'ai',
    provider: 'anthropic',
    templates: {
      'anthropic-client': 'ai/files/anthropic.hbs',
      'anthropic-types': 'ai/files/anthropic-types.hbs'
    }
  },
  {
    serviceType: 'ai',
    provider: 'google',
    templates: {
      'google-ai-client': 'ai/files/google-ai.hbs',
      'google-ai-types': 'ai/files/google-ai-types.hbs'
    }
  },

  // Vector Database Services
  {
    serviceType: 'vector-database',
    provider: 'pinecone',
    templates: {
      'pinecone-client': 'vector-database/files/pinecone.hbs',
      'pinecone-utils': 'vector-database/files/pinecone-utils.hbs'
    }
  },

  // Deployment Services
  {
    serviceType: 'deployment',
    provider: 'vercel',
    templates: {
      'vercel-config': 'deployment/configs/vercel.hbs',
      'build-script': 'deployment/files/vercel-build.hbs'
    }
  },
  {
    serviceType: 'deployment',
    provider: 'docker',
    templates: {
      'dockerfile': 'deployment/files/dockerfile.hbs',
      'docker-compose': 'deployment/configs/docker-compose.hbs',
      'dockerignore': 'deployment/configs/dockerignore.hbs'
    }
  }
];

/**
 * Get template file path for a service and injection point
 */
export function getTemplateFilePath(
  serviceType: string,
  provider: string,
  injectionPointName: string
): string | null {
  const mapping = SERVICE_TEMPLATE_MAPPINGS.find(
    m => m.serviceType === serviceType && m.provider === provider
  );

  if (!mapping) {
    return null;
  }

  return mapping.templates[injectionPointName] || null;
}

/**
 * Get all template mappings for a service
 */
export function getServiceTemplates(
  serviceType: string,
  provider: string
): Record<string, string> | null {
  const mapping = SERVICE_TEMPLATE_MAPPINGS.find(
    m => m.serviceType === serviceType && m.provider === provider
  );

  return mapping?.templates || null;
}

/**
 * Check if service has file-based templates
 */
export function hasFileBasedTemplates(
  serviceType: string,
  provider: string
): boolean {
  return SERVICE_TEMPLATE_MAPPINGS.some(
    m => m.serviceType === serviceType && m.provider === provider
  );
}