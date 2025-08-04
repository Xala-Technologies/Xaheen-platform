/**
 * Template Manager for Xala UI System MCP
 */

import type { ComponentTemplateConfig, ComponentCategory } from '../types/index.js';

export class TemplateManager {
  private templates: Map<string, ComponentTemplateConfig> = new Map();

  constructor() {
    this.initializeTemplates();
  }

  private initializeTemplates(): void {
    // Layout Templates
    this.addTemplate({
      name: 'admin-dashboard-layout',
      description: 'Complete admin dashboard layout with sidebar, topbar, and content area',
      category: 'layouts',
      defaultConfig: {
        name: 'AdminDashboardLayout',
        category: 'layouts',
        features: {
          interactive: true,
          searchable: true,
          collapsible: true,
        },
        styling: {
          variant: 'default',
          spacing: 'comfortable',
        },
        accessibility: {
          level: 'AAA',
          screenReader: true,
          keyboardNavigation: true,
          highContrast: false,
          reducedMotion: false,
          focusManagement: true,
          ariaLabels: true,
        },
        responsive: {
          breakpoints: ['mobile', 'tablet', 'desktop'],
          mobileFirst: true,
          adaptiveLayout: true,
          touchOptimized: true,
          fluidTypography: true,
        },
      },
      requiredFeatures: ['interactive'],
      template: 'admin-layout',
      examples: [
        {
          name: 'Basic Admin Layout',
          description: 'Simple admin layout with navigation',
          config: {} as any,
        },
      ],
    });

    this.addTemplate({
      name: 'saas-web-layout',
      description: 'SaaS application layout with navbar, content, and footer',
      category: 'layouts',
      defaultConfig: {
        name: 'SaaSWebLayout',
        category: 'layouts',
        features: {
          interactive: true,
          searchable: true,
        },
        styling: {
          variant: 'default',
          spacing: 'comfortable',
        },
        accessibility: {
          level: 'AAA',
          screenReader: true,
          keyboardNavigation: true,
          highContrast: false,
          reducedMotion: false,
          focusManagement: true,
          ariaLabels: true,
        },
        responsive: {
          breakpoints: ['mobile', 'tablet', 'desktop'],
          mobileFirst: true,
          adaptiveLayout: true,
          touchOptimized: true,
          fluidTypography: true,
        },
      },
      requiredFeatures: ['interactive'],
      template: 'web-layout',
      examples: [],
    });

    // Navigation Templates
    this.addTemplate({
      name: 'saas-navbar',
      description: 'SaaS application navbar with logo, search, user menu, and theme switcher',
      category: 'navigation',
      defaultConfig: {
        name: 'SaaSNavbar',
        category: 'navigation',
        features: {
          interactive: true,
          searchable: true,
          badges: true,
          tooltips: true,
        },
        styling: {
          variant: 'default',
          spacing: 'comfortable',
        },
        accessibility: {
          level: 'AAA',
          screenReader: true,
          keyboardNavigation: true,
          highContrast: false,
          reducedMotion: false,
          focusManagement: true,
          ariaLabels: true,
        },
        responsive: {
          breakpoints: ['mobile', 'tablet', 'desktop'],
          mobileFirst: true,
          adaptiveLayout: true,
          touchOptimized: true,
          fluidTypography: true,
        },
      },
      requiredFeatures: ['interactive', 'searchable'],
      template: 'saas-navbar',
      examples: [],
    });

    this.addTemplate({
      name: 'admin-sidebar',
      description: 'Admin dashboard sidebar with collapsible navigation',
      category: 'navigation',
      defaultConfig: {
        name: 'AdminSidebar',
        category: 'navigation',
        features: {
          interactive: true,
          collapsible: true,
          badges: true,
        },
        styling: {
          variant: 'default',
          spacing: 'compact',
        },
        accessibility: {
          level: 'AAA',
          screenReader: true,
          keyboardNavigation: true,
          highContrast: false,
          reducedMotion: false,
          focusManagement: true,
          ariaLabels: true,
        },
        responsive: {
          breakpoints: ['mobile', 'tablet', 'desktop'],
          mobileFirst: true,
          adaptiveLayout: true,
          touchOptimized: true,
          fluidTypography: true,
        },
      },
      requiredFeatures: ['interactive', 'collapsible'],
      template: 'admin-sidebar',
      examples: [],
    });

    // Form Templates
    this.addTemplate({
      name: 'contact-form',
      description: 'Contact form with validation and accessibility',
      category: 'form',
      defaultConfig: {
        name: 'ContactForm',
        category: 'form',
        features: {
          validation: true,
          error: true,
          loading: true,
        },
        styling: {
          variant: 'default',
          spacing: 'comfortable',
        },
        accessibility: {
          level: 'AAA',
          screenReader: true,
          keyboardNavigation: true,
          highContrast: false,
          reducedMotion: false,
          focusManagement: true,
          ariaLabels: true,
        },
        responsive: {
          breakpoints: ['mobile', 'tablet', 'desktop'],
          mobileFirst: true,
          adaptiveLayout: true,
          touchOptimized: true,
          fluidTypography: true,
        },
      },
      requiredFeatures: ['validation'],
      template: 'contact-form',
      examples: [],
    });

    this.addTemplate({
      name: 'user-profile-form',
      description: 'User profile form with avatar upload and validation',
      category: 'form',
      defaultConfig: {
        name: 'UserProfileForm',
        category: 'form',
        features: {
          validation: true,
          error: true,
          loading: true,
          interactive: true,
        },
        styling: {
          variant: 'default',
          spacing: 'comfortable',
        },
        accessibility: {
          level: 'AAA',
          screenReader: true,
          keyboardNavigation: true,
          highContrast: false,
          reducedMotion: false,
          focusManagement: true,
          ariaLabels: true,
        },
        responsive: {
          breakpoints: ['mobile', 'tablet', 'desktop'],
          mobileFirst: true,
          adaptiveLayout: true,
          touchOptimized: true,
          fluidTypography: true,
        },
      },
      requiredFeatures: ['validation', 'interactive'],
      template: 'user-profile-form',
      examples: [],
    });

    // Data Display Templates
    this.addTemplate({
      name: 'users-data-table',
      description: 'Users data table with sorting, filtering, and actions',
      category: 'data-display',
      defaultConfig: {
        name: 'UsersDataTable',
        category: 'data-display',
        features: {
          sortable: true,
          filterable: true,
          searchable: true,
          selectable: true,
          paginated: true,
        },
        styling: {
          variant: 'default',
          spacing: 'comfortable',
        },
        accessibility: {
          level: 'AAA',
          screenReader: true,
          keyboardNavigation: true,
          highContrast: false,
          reducedMotion: false,
          focusManagement: true,
          ariaLabels: true,
        },
        responsive: {
          breakpoints: ['mobile', 'tablet', 'desktop'],
          mobileFirst: true,
          adaptiveLayout: true,
          touchOptimized: true,
          fluidTypography: true,
        },
      },
      requiredFeatures: ['sortable', 'filterable'],
      template: 'users-data-table',
      examples: [],
    });

    // Page Templates
    this.addTemplate({
      name: 'dashboard-page',
      description: 'Complete dashboard page with metrics, charts, and tables',
      category: 'page-template',
      defaultConfig: {
        name: 'DashboardPage',
        category: 'page-template',
        features: {
          interactive: true,
          searchable: true,
          loading: true,
        },
        styling: {
          variant: 'default',
          spacing: 'comfortable',
        },
        accessibility: {
          level: 'AAA',
          screenReader: true,
          keyboardNavigation: true,
          highContrast: false,
          reducedMotion: false,
          focusManagement: true,
          ariaLabels: true,
        },
        responsive: {
          breakpoints: ['mobile', 'tablet', 'desktop'],
          mobileFirst: true,
          adaptiveLayout: true,
          touchOptimized: true,
          fluidTypography: true,
        },
      },
      requiredFeatures: ['interactive'],
      template: 'dashboard-page',
      examples: [],
    });

    this.addTemplate({
      name: 'landing-page',
      description: 'Marketing landing page with hero, features, and CTA sections',
      category: 'page-template',
      defaultConfig: {
        name: 'LandingPage',
        category: 'page-template',
        features: {
          interactive: true,
          animated: true,
        },
        styling: {
          variant: 'default',
          spacing: 'spacious',
        },
        accessibility: {
          level: 'AAA',
          screenReader: true,
          keyboardNavigation: true,
          highContrast: false,
          reducedMotion: false,
          focusManagement: true,
          ariaLabels: true,
        },
        responsive: {
          breakpoints: ['mobile', 'tablet', 'desktop'],
          mobileFirst: true,
          adaptiveLayout: true,
          touchOptimized: true,
          fluidTypography: true,
        },
      },
      requiredFeatures: ['interactive'],
      template: 'landing-page',
      examples: [],
    });

    // Interactive Components
    this.addTemplate({
      name: 'search-command-palette',
      description: 'Command palette with search and keyboard navigation',
      category: 'interactive',
      defaultConfig: {
        name: 'SearchCommandPalette',
        category: 'interactive',
        features: {
          interactive: true,
          searchable: true,
          tooltips: true,
        },
        styling: {
          variant: 'default',
          spacing: 'comfortable',
        },
        accessibility: {
          level: 'AAA',
          screenReader: true,
          keyboardNavigation: true,
          highContrast: false,
          reducedMotion: false,
          focusManagement: true,
          ariaLabels: true,
        },
        responsive: {
          breakpoints: ['mobile', 'tablet', 'desktop'],
          mobileFirst: true,
          adaptiveLayout: true,
          touchOptimized: true,
          fluidTypography: true,
        },
      },
      requiredFeatures: ['interactive', 'searchable'],
      template: 'command-palette',
      examples: [],
    });

    // Feedback Components
    this.addTemplate({
      name: 'notification-system',
      description: 'Toast notification system with different variants',
      category: 'feedback',
      defaultConfig: {
        name: 'NotificationSystem',
        category: 'feedback',
        features: {
          interactive: true,
          animated: true,
          icons: true,
        },
        styling: {
          variant: 'default',
          spacing: 'comfortable',
        },
        accessibility: {
          level: 'AAA',
          screenReader: true,
          keyboardNavigation: true,
          highContrast: false,
          reducedMotion: false,
          focusManagement: true,
          ariaLabels: true,
        },
        responsive: {
          breakpoints: ['mobile', 'tablet', 'desktop'],
          mobileFirst: true,
          adaptiveLayout: true,
          touchOptimized: true,
          fluidTypography: true,
        },
      },
      requiredFeatures: ['interactive'],
      template: 'notification-system',
      examples: [],
    });
  }

  private addTemplate(template: ComponentTemplateConfig): void {
    this.templates.set(template.name, template);
  }

  listTemplates(category?: ComponentCategory | 'all'): ComponentTemplateConfig[] {
    const allTemplates = Array.from(this.templates.values());
    
    if (!category || category === 'all') {
      return allTemplates;
    }
    
    return allTemplates.filter(template => template.category === category);
  }

  getTemplate(name: string): ComponentTemplateConfig | undefined {
    return this.templates.get(name);
  }

  getTemplatesByCategory(category: ComponentCategory): ComponentTemplateConfig[] {
    return Array.from(this.templates.values()).filter(
      template => template.category === category
    );
  }

  searchTemplates(query: string): ComponentTemplateConfig[] {
    const lowercaseQuery = query.toLowerCase();
    return Array.from(this.templates.values()).filter(
      template =>
        template.name.toLowerCase().includes(lowercaseQuery) ||
        template.description.toLowerCase().includes(lowercaseQuery)
    );
  }

  getTemplateConfig(name: string): any {
    const template = this.getTemplate(name);
    return template?.defaultConfig;
  }

  validateTemplateConfig(name: string, config: any): boolean {
    const template = this.getTemplate(name);
    if (!template) {
      return false;
    }

    // Check if all required features are present
    return template.requiredFeatures.every(feature => 
      config.features && config.features[feature]
    );
  }
}
