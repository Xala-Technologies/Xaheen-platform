/**
 * Registry Service - Component and Service Template Management
 * 
 * Provides access to component templates, service templates, and 
 * integrates with the design system registry.
 */

import * as path from 'path';
import { logger } from '../../utils/logger';

export interface ComponentTemplate {
  id: string;
  name: string;
  description: string;
  platform: string;
  category: 'component' | 'layout' | 'form' | 'page';
  path: string;
  dependencies: string[];
  features: string[];
}

export interface ServiceTemplate {
  id: string;
  name: string;
  description: string;
  provider: string;
  version: string;
  category: 'database' | 'auth' | 'api' | 'storage' | 'monitoring' | 'deployment';
  config: Record<string, any>;
  dependencies: string[];
}

export interface RegistryStats {
  components: number;
  services: number;
  platforms: number;
}

export class RegistryService {
  private static instance: RegistryService;
  private componentTemplates: Map<string, ComponentTemplate[]> = new Map();
  private serviceTemplates: Map<string, ServiceTemplate> = new Map();
  private initialized = false;

  public static getInstance(): RegistryService {
    if (!RegistryService.instance) {
      RegistryService.instance = new RegistryService();
    }
    return RegistryService.instance;
  }

  constructor() {
    if (!this.initialized) {
      this.initializeTemplates();
      this.initialized = true;
    }
  }

  private initializeTemplates(): void {
    // Initialize component templates by platform
    this.initializeComponentTemplates();
    
    // Initialize service templates
    this.initializeServiceTemplates();
    
    logger.debug('Registry service initialized');
  }

  private initializeComponentTemplates(): void {
    // React/Next.js components
    const reactComponents: ComponentTemplate[] = [
      {
        id: 'basic-component',
        name: 'Basic Component',
        description: 'A basic React functional component with TypeScript',
        platform: 'react',
        category: 'component',
        path: 'templates/react/component.tsx',
        dependencies: ['react', 'typescript'],
        features: ['typescript', 'functional']
      },
      {
        id: 'form-component',
        name: 'Form Component',
        description: 'Form component with validation and accessibility',
        platform: 'react',
        category: 'form',
        path: 'templates/react/form.tsx',
        dependencies: ['react', 'react-hook-form', 'zod'],
        features: ['validation', 'accessibility', 'typescript']
      },
      {
        id: 'data-table',
        name: 'Data Table',
        description: 'Data table with sorting, filtering, and pagination',
        platform: 'react',
        category: 'component',
        path: 'templates/react/data-table.tsx',
        dependencies: ['react', 'tanstack-table'],
        features: ['sorting', 'filtering', 'pagination', 'accessibility']
      },
      {
        id: 'dashboard-layout',
        name: 'Dashboard Layout',
        description: 'Complete dashboard layout with sidebar and header',
        platform: 'react',
        category: 'layout',
        path: 'templates/react/dashboard-layout.tsx',
        dependencies: ['react', 'next/navigation'],
        features: ['responsive', 'navigation', 'accessibility']
      }
    ];

    this.componentTemplates.set('react', reactComponents);
    this.componentTemplates.set('nextjs', reactComponents); // Next.js uses React components
  }

  private initializeServiceTemplates(): void {
    const services: ServiceTemplate[] = [
      {
        id: 'database',
        name: 'Database Service',
        description: 'PostgreSQL database with Prisma ORM',
        provider: 'postgresql',
        version: '15',
        category: 'database',
        config: {
          host: 'localhost',
          port: 5432,
          ssl: false,
          poolSize: 10
        },
        dependencies: ['prisma', '@prisma/client', 'pg']
      },
      {
        id: 'auth',
        name: 'Authentication Service',
        description: 'JWT-based authentication with NextAuth.js',
        provider: 'nextauth',
        version: 'latest',
        category: 'auth',
        config: {
          providers: ['credentials', 'google'],
          jwt: true,
          session: { strategy: 'jwt' }
        },
        dependencies: ['next-auth', 'jsonwebtoken']
      },
      {
        id: 'redis',
        name: 'Redis Cache',
        description: 'Redis caching service',
        provider: 'redis',
        version: '7',
        category: 'database',
        config: {
          host: 'localhost',
          port: 6379,
          ttl: 3600
        },
        dependencies: ['redis', 'ioredis']
      },
      {
        id: 'mongodb',
        name: 'MongoDB Database',
        description: 'MongoDB NoSQL database with Mongoose',
        provider: 'mongodb',
        version: '6',
        category: 'database',
        config: {
          connectionString: 'mongodb://localhost:27017',
          useNewUrlParser: true,
          useUnifiedTopology: true
        },
        dependencies: ['mongodb', 'mongoose']
      },
      {
        id: 'swagger',
        name: 'API Documentation',
        description: 'Swagger/OpenAPI documentation',
        provider: 'swagger',
        version: 'latest',
        category: 'api',
        config: {
          title: 'API Documentation',
          version: '1.0.0',
          description: 'API documentation generated by Swagger'
        },
        dependencies: ['swagger-ui-express', '@apidevtools/swagger-parser']
      },
      {
        id: 'prometheus',
        name: 'Monitoring',
        description: 'Prometheus monitoring and metrics',
        provider: 'prometheus',
        version: 'latest',
        category: 'monitoring',
        config: {
          port: 9090,
          metricsPath: '/metrics',
          scrapeInterval: '15s'
        },
        dependencies: ['prom-client']
      }
    ];

    services.forEach(service => {
      this.serviceTemplates.set(service.id, service);
    });
  }

  /**
   * Get component templates by platform
   */
  public getComponentTemplatesByPlatform(platform: string): ComponentTemplate[] {
    return this.componentTemplates.get(platform) || [];
  }

  /**
   * Get all component templates
   */
  public getAllComponentTemplates(): ComponentTemplate[] {
    const allTemplates: ComponentTemplate[] = [];
    for (const templates of this.componentTemplates.values()) {
      allTemplates.push(...templates);
    }
    return allTemplates;
  }

  /**
   * Get service template by ID
   */
  public getServiceTemplate(serviceId: string): ServiceTemplate | undefined {
    return this.serviceTemplates.get(serviceId);
  }

  /**
   * Get all service templates
   */
  public getAllServiceTemplates(): ServiceTemplate[] {
    return Array.from(this.serviceTemplates.values());
  }

  /**
   * Get service templates by category
   */
  public getServiceTemplatesByCategory(category: ServiceTemplate['category']): ServiceTemplate[] {
    return Array.from(this.serviceTemplates.values()).filter(
      service => service.category === category
    );
  }

  /**
   * Get registry statistics
   */
  public getRegistryStats(): RegistryStats {
    const componentCount = this.getAllComponentTemplates().length;
    const serviceCount = this.serviceTemplates.size;
    const platformCount = this.componentTemplates.size;

    return {
      components: componentCount,
      services: serviceCount,
      platforms: platformCount
    };
  }

  /**
   * Search templates by name or description
   */
  public searchComponents(query: string, platform?: string): ComponentTemplate[] {
    const templates = platform 
      ? this.getComponentTemplatesByPlatform(platform)
      : this.getAllComponentTemplates();

    const searchTerm = query.toLowerCase();
    return templates.filter(template => 
      template.name.toLowerCase().includes(searchTerm) ||
      template.description.toLowerCase().includes(searchTerm) ||
      template.features.some(feature => feature.toLowerCase().includes(searchTerm))
    );
  }

  /**
   * Search services by name or description
   */
  public searchServices(query: string, category?: ServiceTemplate['category']): ServiceTemplate[] {
    let services = Array.from(this.serviceTemplates.values());
    
    if (category) {
      services = services.filter(service => service.category === category);
    }

    const searchTerm = query.toLowerCase();
    return services.filter(service =>
      service.name.toLowerCase().includes(searchTerm) ||
      service.description.toLowerCase().includes(searchTerm) ||
      service.provider.toLowerCase().includes(searchTerm)
    );
  }

  /**
   * Add custom component template
   */
  public addComponentTemplate(platform: string, template: ComponentTemplate): void {
    const platformTemplates = this.componentTemplates.get(platform) || [];
    platformTemplates.push(template);
    this.componentTemplates.set(platform, platformTemplates);
    logger.debug(`Added component template: ${template.id} for platform: ${platform}`);
  }

  /**
   * Add custom service template
   */
  public addServiceTemplate(template: ServiceTemplate): void {
    this.serviceTemplates.set(template.id, template);
    logger.debug(`Added service template: ${template.id}`);
  }

  /**
   * Get available platforms
   */
  public getAvailablePlatforms(): string[] {
    return Array.from(this.componentTemplates.keys());
  }

  /**
   * Get available service categories
   */
  public getServiceCategories(): ServiceTemplate['category'][] {
    const categories = new Set<ServiceTemplate['category']>();
    for (const service of this.serviceTemplates.values()) {
      categories.add(service.category);
    }
    return Array.from(categories);
  }

  /**
   * Validate template dependencies
   */
  public validateTemplateDependencies(template: ComponentTemplate | ServiceTemplate): {
    valid: boolean;
    missing: string[];
  } {
    // This would check if required dependencies are available
    // For now, we'll assume all dependencies are valid
    return {
      valid: true,
      missing: []
    };
  }
}

// Export singleton instance
export const registryService = RegistryService.getInstance();