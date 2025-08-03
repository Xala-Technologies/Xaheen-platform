/**
 * Bundle Resolver Implementation
 * 
 * Resolves service bundles and handles dependency management.
 * 
 * @author Backend Expert Agent
 * @since 2025-01-03
 */

import { consola } from 'consola';
import { v4 as uuidv4 } from 'crypto';
import type { 
  IBundleResolver, 
  ServiceBundle, 
  BundleResolutionResult,
  ServiceConfiguration,
  IServiceRegistry 
} from '../../types/index.js';

export class BundleResolver implements IBundleResolver {
  private serviceRegistry: IServiceRegistry;
  private bundles: Map<string, ServiceBundle> = new Map();

  constructor(serviceRegistry: IServiceRegistry) {
    this.serviceRegistry = serviceRegistry;
    this.initializeBundles();
  }

  async resolveBundle(
    bundle: ServiceBundle, 
    options: any = {}
  ): Promise<BundleResolutionResult> {
    const startTime = Date.now();
    consola.debug(`Resolving bundle: ${bundle.name}`);

    const errors: string[] = [];
    const warnings: string[] = [];
    const resolvedServices: ServiceConfiguration[] = [];

    try {
      // Resolve required services
      for (const serviceRef of bundle.services) {
        const template = await this.serviceRegistry.getTemplate(
          serviceRef.serviceType,
          serviceRef.provider
        );

        if (!template) {
          if (serviceRef.required) {
            errors.push(`Required service not found: ${serviceRef.serviceType}:${serviceRef.provider}`);
          } else {
            warnings.push(`Optional service not found: ${serviceRef.serviceType}:${serviceRef.provider}`);
          }
          continue;
        }

        // Check framework compatibility
        if (options.targetFramework && template.frameworks.length > 0) {
          if (!template.frameworks.includes(options.targetFramework)) {
            warnings.push(`Service ${serviceRef.serviceType} may not be compatible with ${options.targetFramework}`);
          }
        }

        const serviceConfig: ServiceConfiguration = {
          serviceId: `${bundle.name}-${serviceRef.serviceType}-${Date.now()}`,
          serviceType: serviceRef.serviceType,
          provider: serviceRef.provider,
          version: serviceRef.version || template.version,
          required: serviceRef.required,
          priority: serviceRef.priority,
          configuration: { ...template, ...serviceRef.config },
          environmentVariables: template.envVariables.map(env => ({
            name: env.name,
            value: env.defaultValue,
            required: env.required
          })),
          dependencies: template.dependencies,
          postInstallSteps: template.postInjectionSteps.map(step => step.description),
          verificationSteps: []
        };

        resolvedServices.push(serviceConfig);
      }

      // Sort services by priority and dependencies
      const sortedServices = this.sortServicesByDependencies(resolvedServices);

      return {
        bundleId: bundle.id,
        bundleName: bundle.name,
        bundleVersion: bundle.version,
        status: errors.length > 0 ? 'failed' : warnings.length > 0 ? 'warning' : 'success',
        resolvedServices: sortedServices,
        dependencies: [],
        configuration: {},
        deploymentInstructions: this.generateDeploymentInstructions(bundle, sortedServices),
        postInstallSteps: this.collectPostInstallSteps(sortedServices),
        verificationSteps: [],
        errors,
        warnings,
        resolutionTime: Date.now() - startTime,
        resolvedAt: new Date()
      };
    } catch (error) {
      return {
        bundleId: bundle.id,
        bundleName: bundle.name, 
        bundleVersion: bundle.version,
        status: 'failed',
        resolvedServices: [],
        dependencies: [],
        configuration: {},
        deploymentInstructions: [],
        postInstallSteps: [],
        verificationSteps: [],
        errors: [error instanceof Error ? error.message : String(error)],
        warnings,
        resolutionTime: Date.now() - startTime,
        resolvedAt: new Date()
      };
    }
  }

  async loadBundleByName(name: string): Promise<ServiceBundle | null> {
    return this.bundles.get(name) || null;
  }

  async createCustomBundle(services: string[]): Promise<ServiceBundle> {
    const bundle: ServiceBundle = {
      id: uuidv4(),
      name: 'custom-bundle',
      displayName: 'Custom Bundle',
      description: 'Custom service bundle',
      version: '1.0.0',
      type: 'custom',
      services: services.map(serviceType => ({
        serviceType: serviceType as any,
        provider: this.getDefaultProvider(serviceType),
        required: true,
        priority: 50,
        config: {}
      })),
      optionalServices: [],
      deploymentTargets: ['cloud-native'],
      tags: ['custom'],
      createdAt: new Date(),
      updatedAt: new Date()
    };

    return bundle;
  }

  private initializeBundles(): void {
    // SaaS Starter Bundle
    this.bundles.set('saas-starter', {
      id: uuidv4(),
      name: 'saas-starter',
      displayName: 'SaaS Starter',
      description: 'Essential SaaS features for getting started',
      version: '1.0.0',
      type: 'saas-starter',
      services: [
        { serviceType: 'auth', provider: 'better-auth', required: true, priority: 100, config: {} },
        { serviceType: 'database', provider: 'postgresql', required: true, priority: 90, config: {} },
        { serviceType: 'payments', provider: 'stripe', required: true, priority: 80, config: {} },
        { serviceType: 'email', provider: 'resend', required: true, priority: 70, config: {} },
        { serviceType: 'analytics', provider: 'posthog', required: true, priority: 60, config: {} }
      ],
      optionalServices: [],
      deploymentTargets: ['vercel', 'netlify', 'cloudflare'],
      pricing: {
        tier: 'starter',
        monthlyPrice: '$0',
        features: ['Authentication', 'Database', 'Payments', 'Email', 'Analytics']
      },
      tags: ['saas', 'starter'],
      createdAt: new Date(),
      updatedAt: new Date()
    });

    // SaaS Professional Bundle
    this.bundles.set('saas-professional', {
      id: uuidv4(),
      name: 'saas-professional',
      displayName: 'SaaS Professional',
      description: 'Full-featured SaaS platform with advanced capabilities',
      version: '1.0.0',
      type: 'saas-professional',
      services: [
        { serviceType: 'auth', provider: 'clerk', required: true, priority: 100, config: {} },
        { serviceType: 'database', provider: 'postgresql', required: true, priority: 90, config: {} },
        { serviceType: 'cache', provider: 'redis', required: true, priority: 85, config: {} },
        { serviceType: 'payments', provider: 'stripe', required: true, priority: 80, config: {} },
        { serviceType: 'email', provider: 'resend', required: true, priority: 70, config: {} },
        { serviceType: 'sms', provider: 'twilio', required: false, priority: 65, config: {} },
        { serviceType: 'storage', provider: 'uploadthing', required: true, priority: 60, config: {} },
        { serviceType: 'analytics', provider: 'posthog', required: true, priority: 55, config: {} },
        { serviceType: 'monitoring', provider: 'sentry', required: true, priority: 50, config: {} },
        { serviceType: 'search', provider: 'algolia', required: false, priority: 45, config: {} },
        { serviceType: 'queue', provider: 'bullmq', required: true, priority: 40, config: {} }
      ],
      optionalServices: [
        { serviceType: 'ai', provider: 'openai', condition: 'feature:ai' },
        { serviceType: 'realtime', provider: 'pusher', condition: 'feature:realtime' }
      ],
      deploymentTargets: ['vercel', 'aws', 'gcp'],
      compliance: ['gdpr', 'ccpa'],
      pricing: {
        tier: 'professional',
        monthlyPrice: '$99',
        features: ['Everything in Starter', 'Advanced Auth', 'Caching', 'File Storage', 'Job Queue', 'Search', 'Monitoring']
      },
      tags: ['saas', 'professional', 'enterprise-ready'],
      createdAt: new Date(),
      updatedAt: new Date()
    });

    // Add more bundles as needed...
  }

  private getDefaultProvider(serviceType: string): string {
    const defaults: Record<string, string> = {
      auth: 'better-auth',
      payments: 'stripe',
      database: 'postgresql',
      cache: 'redis',
      email: 'resend',
      sms: 'twilio',
      storage: 'uploadthing',
      analytics: 'posthog',
      monitoring: 'sentry',
      search: 'algolia',
      queue: 'bullmq',
      realtime: 'pusher',
      ai: 'openai'
    };

    return defaults[serviceType] || 'default';
  }

  private sortServicesByDependencies(services: ServiceConfiguration[]): ServiceConfiguration[] {
    // Simple priority-based sort for now
    return [...services].sort((a, b) => (b.priority || 0) - (a.priority || 0));
  }

  private generateDeploymentInstructions(
    bundle: ServiceBundle,
    services: ServiceConfiguration[]
  ): string[] {
    return [
      `# Deployment Instructions for ${bundle.displayName}`,
      '',
      '## Services to Deploy',
      ...services.map(s => `- ${s.serviceType}: ${s.provider} v${s.version}`),
      '',
      '## Environment Variables',
      ...services.flatMap(s => 
        s.environmentVariables.map(env => `- ${env.name}: ${env.required ? 'Required' : 'Optional'}`)
      ),
      '',
      '## Deployment Order',
      ...services.map((s, i) => `${i + 1}. ${s.serviceType}`)
    ];
  }

  private collectPostInstallSteps(services: ServiceConfiguration[]): string[] {
    const steps: string[] = [];
    
    for (const service of services) {
      steps.push(...service.postInstallSteps);
    }

    return [...new Set(steps)]; // Remove duplicates
  }
}