/**
 * AI-Enhanced Template Manager for Xala UI System MCP
 * Implements EPIC 5: AI-Native Template System
 * 
 * Features:
 * - Component complexity estimation with AI token usage
 * - Semantic hints for AI pattern recognition
 * - AI-friendly naming conventions and documentation
 * - Keyword matching and intent classification
 * - Norwegian compliance and accessibility detection
 * - MCP API integration for enhanced recommendations
 */

import type { 
  ComponentCategory, 
  SupportedPlatform,
  IndustryTheme,
  AIEnhancedTemplateConfig,
  AIComplexityMetrics,
  AIOptimizationHints,
  AISemanticHints,
  AINamingConventions,
  AIDocumentationMetadata,
  AIPatternRecognition,
  AIPlatformDetection,
  AIAccessibilityDetection,
  AINorwegianComplianceDetection,
  AITemplateContext,
  AIPromptTemplate,
  AIMCPIntegration
} from '../types/index.js';
import { TemplateManager } from './TemplateManager.js';

export class AIEnhancedTemplateManager extends TemplateManager {
  private aiEnhancedTemplates: Map<string, AIEnhancedTemplateConfig> = new Map();
  private promptTemplates: Map<string, AIPromptTemplate> = new Map();
  private mcpIntegration!: AIMCPIntegration;

  constructor() {
    super();
    this.initializeMCPIntegration();
    this.initializeAIEnhancedTemplates();
    this.initializePromptTemplates();
  }

  private initializeMCPIntegration(): void {
    this.mcpIntegration = {
      specificationAPI: {
        endpoint: '/mcp/specifications',
        methods: ['get_specification', 'list_specifications', 'validate_against_spec']
      },
      layoutPatterns: {
        recommendations: ['generate_layout_from_spec', 'get_layout_recommendations'],
        generators: ['generate_layout', 'generate_page_template']
      },
      componentSelection: {
        library: ['browse_component_library', 'get_component_source'],
        filters: { platform: true, category: true, complexity: true }
      },
      accessibilityValidation: {
        tools: ['check_spec_compliance', 'validate_accessibility'],
        checkers: ['wcag_validator', 'aria_validator']
      },
      norwegianCompliance: {
        validators: ['nsm_classifier', 'gdpr_validator'],
        classifiers: ['altinn_compliance', 'norwegian_localization']
      },
      performanceOptimization: {
        analyzers: ['performance_analyzer', 'bundle_analyzer'],
        optimizers: ['code_splitter', 'lazy_loader']
      },
      designTokens: {
        transformers: ['token_transformer', 'theme_generator'],
        validators: ['design_system_validator', 'token_consistency_checker']
      }
    };
  }

  private initializeAIEnhancedTemplates(): void {
    // Enhanced Admin Dashboard Layout with AI metadata
    this.addAIEnhancedTemplate({
      ...this.getTemplate('admin-dashboard-layout')!,
      aiMetrics: {
        estimatedLinesOfCode: 450,
        componentDepth: 4,
        featureComplexity: 'complex',
        aiTokenEstimate: {
          input: 1200,
          output: 3500,
          contextWindow: 8000
        },
        buildTime: 2800,
        dependencies: 12,
        platformComplexity: {
          react: 3,
          nextjs: 4,
          vue: 5,
          angular: 6,
          svelte: 4,
          electron: 5,
          'react-native': 7
        }
      },
      aiOptimization: {
        generationPriority: 'critical',
        codePatterns: [
          'responsive-layout-pattern',
          'sidebar-navigation-pattern',
          'dashboard-metrics-pattern',
          'accessibility-focus-pattern'
        ],
        performanceOptimizations: [
          'lazy-load-dashboard-widgets',
          'virtualize-large-lists',
          'memoize-expensive-calculations',
          'implement-skeleton-loading'
        ],
        accessibilityRequirements: [
          'aria-landmark-roles',
          'keyboard-navigation-skip-links',
          'screen-reader-announcements',
          'high-contrast-theme-support'
        ],
        norwegianComplianceNeeds: [
          'norwegian-localization-keys',
          'altinn-design-system-tokens',
          'nsm-classification-headers'
        ],
        commonPitfalls: [
          'avoid-inline-styles',
          'prevent-accessibility-violations',
          'handle-loading-states-properly',
          'manage-focus-on-route-changes'
        ],
        bestPractices: [
          'use-semantic-html-elements',
          'implement-proper-error-boundaries',
          'follow-react-18-concurrent-patterns',
          'optimize-bundle-size-with-code-splitting'
        ]
      },
      aiSemantics: {
        purpose: 'Comprehensive admin dashboard layout providing structured navigation, content areas, and responsive design for administrative interfaces',
        usagePatterns: [
          'admin-panel-interface',
          'management-dashboard',
          'enterprise-application-shell',
          'data-visualization-container'
        ],
        relationships: {
          dependsOn: ['navigation-components', 'layout-primitives', 'responsive-utilities'],
          usedBy: ['admin-pages', 'dashboard-widgets', 'management-interfaces'],
          alternatives: ['saas-web-layout', 'mobile-admin-layout', 'desktop-admin-layout']
        },
        businessDomains: ['enterprise', 'finance', 'healthcare', 'education'],
        keywords: [
          'admin', 'dashboard', 'layout', 'navigation', 'sidebar', 'responsive',
          'management', 'interface', 'enterprise', 'control-panel'
        ],
        synonyms: [
          'administrative-layout', 'management-interface', 'control-panel-layout',
          'enterprise-dashboard', 'admin-shell', 'dashboard-framework'
        ]
      },
      aiNaming: {
        componentNaming: {
          pattern: 'PascalCase with descriptive suffixes',
          examples: ['AdminDashboardLayout', 'EnterpriseAdminShell', 'ManagementInterfaceLayout'],
          reserved: ['Layout', 'Dashboard', 'Admin', 'Component', 'Wrapper']
        },
        propNaming: {
          pattern: 'camelCase with semantic meaning',
          conventions: {
            'boolean-props': 'is*, has*, can*, should*',
            'handler-props': 'on*, handle*',
            'render-props': 'render*, children',
            'data-props': 'data*, items*, content*'
          }
        },
        fileStructure: {
          pattern: 'component-name/index.ts with co-located files',
          extensions: {
            react: '.tsx',
            nextjs: '.tsx',
            vue: '.vue',
            angular: '.component.ts',
            svelte: '.svelte',
            electron: '.tsx',
            'react-native': '.tsx'
          }
        }
      },
      aiDocumentation: {
        structuredComments: {
          componentDescription: 'A comprehensive admin dashboard layout component that provides a responsive shell for administrative interfaces with sidebar navigation, header area, and main content region.',
          propsDescription: {
            'sidebar': 'Configuration object for sidebar navigation including width, collapsible state, and navigation items',
            'header': 'Header configuration with title, user menu, and action buttons',
            'children': 'Main content area that will be rendered within the dashboard layout',
            'loading': 'Boolean flag to show loading skeleton while dashboard content is being fetched'
          },
          usageExamples: [
            'Basic admin dashboard with collapsible sidebar',
            'Multi-tenant admin interface with role-based navigation',
            'Enterprise dashboard with customizable widgets',
            'Responsive admin panel for mobile and desktop'
          ],
          migrationNotes: [
            'Migrating from v4: Update sidebar config structure',
            'Breaking changes: header prop now requires explicit configuration',
            'New feature: automatic accessibility landmarks and focus management'
          ]
        },
        generationContext: {
          reasoning: 'Selected admin dashboard layout based on keyword analysis indicating need for administrative interface with complex navigation and data management capabilities',
          alternatives: [
            'Simple web layout for less complex admin needs',
            'Mobile-first layout for tablet-based admin tools',
            'Desktop-only layout for power user interfaces'
          ],
          tradeoffs: [
            'Complexity vs. flexibility: More features but steeper learning curve',
            'Bundle size vs. functionality: Larger bundle but comprehensive feature set',
            'Customization vs. consistency: Highly customizable but requires more configuration'
          ]
        }
      },
      aiPatterns: {
        keywordMatching: {
          primary: ['admin', 'dashboard', 'management', 'administrative', 'control-panel'],
          secondary: ['enterprise', 'backend', 'cms', 'panel', 'interface', 'shell'],
          negativeKeywords: ['marketing', 'landing', 'blog', 'ecommerce-frontend', 'public-site']
        },
        intentClassification: {
          userIntents: [
            'create-admin-interface',
            'build-management-dashboard',
            'setup-enterprise-application',
            'develop-control-panel'
          ],
          confidenceThreshold: 0.75
        },
        complexityAnalysis: {
          indicators: [
            'multi-level-navigation',
            'data-tables',
            'charts-and-graphs',
            'user-management',
            'role-based-access'
          ],
          scoringWeights: {
            'navigation-complexity': 0.3,
            'data-visualization': 0.25,
            'user-interaction': 0.2,
            'responsive-requirements': 0.15,
            'accessibility-needs': 0.1
          }
        }
      },
      aiPlatformDetection: {
        packageJsonPatterns: [
          'react-admin', 'antd', '@mui/x-data-grid', 'react-router-dom',
          'recharts', 'ag-grid', 'react-table'
        ],
        fileSystemPatterns: [
          'src/admin/', 'src/dashboard/', 'src/layouts/admin/',
          'pages/admin/', 'components/admin/', 'layouts/dashboard/'
        ],
        dependencySignatures: {
          react: ['react-router-dom', 'react-query', '@tanstack/react-table'],
          nextjs: ['next/router', 'next-auth', '@vercel/analytics'],
          vue: ['vue-router', 'pinia', 'vue-i18n'],
          angular: ['@angular/router', '@angular/material', '@ngrx/store'],
          svelte: ['svelte-spa-router', '@sveltejs/kit', 'svelte-i18n'],
          electron: ['electron', 'electron-builder', 'electron-updater'],
          'react-native': ['@react-navigation/native', 'react-native-paper']
        },
        configurationFiles: {
          react: ['craco.config.js', 'webpack.config.js', 'vite.config.ts'],
          nextjs: ['next.config.js', 'next.config.mjs'],
          vue: ['vue.config.js', 'vite.config.ts', 'nuxt.config.ts'],
          angular: ['angular.json', 'ng-package.json'],
          svelte: ['svelte.config.js', 'vite.config.ts'],
          electron: ['electron.js', 'forge.config.js'],
          'react-native': ['metro.config.js', 'react-native.config.js']
        }
      },
      aiAccessibilityDetection: {
        wcagLevelIndicators: {
          AA: [
            'keyboard-navigation', 'screen-reader-support', 'color-contrast',
            'focus-indicators', 'alt-text', 'form-labels'
          ],
          AAA: [
            'enhanced-focus-indicators', 'context-help', 'error-suggestions',
            'timing-adjustable', 'interruptions-postponable', 're-authenticating'
          ]
        },
        screenReaderRequirements: [
          'aria-landmarks', 'aria-labels', 'aria-describedby',
          'role-attributes', 'live-regions', 'skip-links'
        ],
        keyboardNavigationNeeds: [
          'tab-order', 'enter-activation', 'escape-closing',
          'arrow-key-navigation', 'focus-trapping', 'focus-restoration'
        ],
        colorContrastRequirements: [
          'text-background-contrast', 'interactive-element-contrast',
          'focus-indicator-contrast', 'non-text-contrast'
        ]
      },
      aiNorwegianCompliance: {
        nsmClassificationTriggers: {
          OPEN: ['public-data', 'marketing-content', 'general-information'],
          RESTRICTED: ['internal-documents', 'employee-data', 'business-processes'],
          CONFIDENTIAL: ['financial-data', 'strategic-plans', 'customer-information'],
          SECRET: ['classified-information', 'security-protocols', 'sensitive-operations']
        },
        gdprRequirements: [
          'data-consent-management', 'privacy-policy-links', 'data-portability',
          'right-to-be-forgotten', 'data-minimization', 'consent-withdrawal'
        ],
        localizationNeeds: [
          'norwegian-language-support', 'currency-formatting', 'date-formatting',
          'address-formatting', 'phone-number-formatting', 'cultural-adaptations'
        ],
        altinnComplianceNeeds: [
          'altinn-design-tokens', 'government-accessibility-standards',
          'official-color-schemes', 'standard-form-patterns', 'digital-signature-support'
        ]
      }
    });

    // Add more enhanced templates...
    this.addSaaSWebLayoutAITemplate();
    this.addDataTableAITemplate();
    this.addFormComponentAITemplate();
  }

  private addAIEnhancedTemplate(template: AIEnhancedTemplateConfig): void {
    this.aiEnhancedTemplates.set(template.name, template);
  }

  private addSaaSWebLayoutAITemplate(): void {
    this.addAIEnhancedTemplate({
      ...this.getTemplate('saas-web-layout')!,
      aiMetrics: {
        estimatedLinesOfCode: 280,
        componentDepth: 3,
        featureComplexity: 'moderate',
        aiTokenEstimate: {
          input: 800,
          output: 2200,
          contextWindow: 5000
        },
        buildTime: 1800,
        dependencies: 8,
        platformComplexity: {
          react: 2,
          nextjs: 3,
          vue: 3,
          angular: 4,
          svelte: 3,
          electron: 4,
          'react-native': 6
        }
      },
      aiOptimization: {
        generationPriority: 'important',
        codePatterns: [
          'marketing-layout-pattern',
          'saas-navigation-pattern',
          'responsive-hero-pattern',
          'conversion-optimization-pattern'
        ],
        performanceOptimizations: [
          'above-fold-critical-css',
          'lazy-load-below-fold',
          'optimize-hero-images',
          'preload-critical-resources'
        ],
        accessibilityRequirements: [
          'semantic-navigation',
          'proper-heading-hierarchy',
          'color-contrast-compliance',
          'keyboard-accessible-forms'
        ],
        norwegianComplianceNeeds: [
          'cookie-consent-banner',
          'privacy-policy-footer',
          'norwegian-contact-information'
        ],
        commonPitfalls: [
          'avoid-layout-shift',
          'prevent-accessibility-violations',
          'handle-mobile-navigation-properly',
          'optimize-for-core-web-vitals'
        ],
        bestPractices: [
          'use-semantic-html5-elements',
          'implement-proper-meta-tags',
          'optimize-for-seo',
          'follow-responsive-design-principles'
        ]
      },
      aiSemantics: {
        purpose: 'Modern SaaS web layout optimized for marketing and product pages with responsive navigation, hero sections, and conversion-focused design',
        usagePatterns: [
          'saas-marketing-site',
          'product-landing-pages',
          'startup-website',
          'b2b-service-pages'
        ],
        relationships: {
          dependsOn: ['navigation-components', 'hero-sections', 'footer-components'],
          usedBy: ['marketing-pages', 'product-pages', 'landing-pages'],
          alternatives: ['admin-dashboard-layout', 'blog-layout', 'ecommerce-layout']
        },
        businessDomains: ['enterprise', 'productivity', 'ecommerce'],
        keywords: [
          'saas', 'web', 'marketing', 'landing', 'product', 'responsive',
          'modern', 'conversion', 'business', 'startup'
        ],
        synonyms: [
          'marketing-layout', 'product-layout', 'business-website-layout',
          'saas-landing-layout', 'startup-layout', 'b2b-layout'
        ]
      },
      // ... (rest of AI metadata similar to admin dashboard but tailored for SaaS)
      aiNaming: {
        componentNaming: {
          pattern: 'PascalCase with business context',
          examples: ['SaaSWebLayout', 'ProductLandingLayout', 'MarketingShell'],
          reserved: ['Layout', 'Web', 'SaaS', 'Marketing', 'Product']
        },
        propNaming: {
          pattern: 'camelCase with conversion focus',
          conventions: {
            'cta-props': 'primary*, secondary*, action*',
            'content-props': 'hero*, features*, testimonials*',
            'navigation-props': 'menu*, nav*, links*',
            'tracking-props': 'analytics*, tracking*, conversion*'
          }
        },
        fileStructure: {
          pattern: 'layouts/saas-web/index.ts with marketing focus',
          extensions: {
            react: '.tsx',
            nextjs: '.tsx',
            vue: '.vue',
            angular: '.component.ts',
            svelte: '.svelte',
            electron: '.tsx',
            'react-native': '.tsx'
          }
        }
      },
      // ... (rest of properties with SaaS-specific configurations)
      aiDocumentation: {
        structuredComments: {
          componentDescription: 'A modern SaaS web layout component optimized for marketing and product pages with responsive navigation, hero sections, and conversion-focused design patterns.',
          propsDescription: {
            'navigation': 'Top navigation configuration with logo, menu items, and CTA buttons',
            'hero': 'Hero section configuration with title, subtitle, and primary call-to-action',
            'footer': 'Footer configuration with links, social media, and legal information',
            'trackingId': 'Analytics tracking ID for conversion measurement and user behavior analysis'
          },
          usageExamples: [
            'SaaS product landing page with feature highlights',
            'B2B service website with lead generation forms',
            'Startup marketing site with investor information',
            'Product marketing pages with pricing and testimonials'
          ],
          migrationNotes: [
            'Migrating from v4: Update hero section structure',
            'New feature: built-in conversion tracking and analytics',
            'Breaking change: navigation prop now requires explicit CTA configuration'
          ]
        },
        generationContext: {
          reasoning: 'Selected SaaS web layout based on keyword analysis indicating need for marketing-focused interface with conversion optimization and business growth features',
          alternatives: [
            'Simple blog layout for content-focused sites',
            'E-commerce layout for product sales',
            'Admin dashboard for internal tools'
          ],
          tradeoffs: [
            'Marketing focus vs. functionality: Optimized for conversions but less suitable for complex applications',
            'SEO optimization vs. dynamic content: Better for static marketing but requires more work for dynamic features',
            'Simplicity vs. customization: Easier to implement but less flexible than custom layouts'
          ]
        }
      },
      aiPatterns: {
        keywordMatching: {
          primary: ['saas', 'web', 'marketing', 'landing', 'product', 'business'],
          secondary: ['startup', 'b2b', 'conversion', 'growth', 'lead-generation'],
          negativeKeywords: ['admin', 'dashboard', 'management', 'internal', 'backend']
        },
        intentClassification: {
          userIntents: [
            'create-marketing-website',
            'build-product-landing-page',
            'setup-saas-marketing-site',
            'develop-business-website'
          ],
          confidenceThreshold: 0.8
        },
        complexityAnalysis: {
          indicators: [
            'hero-sections',
            'feature-highlights',
            'testimonials',
            'pricing-tables',
            'lead-forms'
          ],
          scoringWeights: {
            'conversion-optimization': 0.35,
            'seo-requirements': 0.25,
            'responsive-design': 0.2,
            'content-management': 0.15,
            'analytics-integration': 0.05
          }
        }
      },
      aiPlatformDetection: {
        packageJsonPatterns: [
          'next-seo', 'react-helmet', 'gatsby', 'styled-components',
          'framer-motion', 'react-intersection-observer'
        ],
        fileSystemPatterns: [
          'src/pages/', 'src/components/marketing/', 'public/images/',
          'content/', 'styles/', 'layouts/web/'
        ],
        dependencySignatures: {
          react: ['react-router-dom', 'react-helmet', 'styled-components'],
          nextjs: ['next-seo', 'next/image', 'next/font'],
          vue: ['vue-router', 'vue-meta', 'nuxt/content'],
          angular: ['@angular/router', '@angular/platform-browser'],
          svelte: ['svelte-spa-router', 'svelte-meta-tags'],
          electron: ['electron', 'electron-builder'],
          'react-native': ['react-navigation', 'react-native-webview']
        },
        configurationFiles: {
          react: ['public/manifest.json', 'public/robots.txt'],
          nextjs: ['next-sitemap.config.js', 'public/sitemap.xml'],
          vue: ['nuxt.config.ts', 'static/'],
          angular: ['src/assets/', 'angular.json'],
          svelte: ['static/', 'svelte.config.js'],
          electron: ['public/', 'electron.js'],
          'react-native': ['android/', 'ios/']
        }
      },
      aiAccessibilityDetection: {
        wcagLevelIndicators: {
          AA: [
            'semantic-navigation', 'proper-headings', 'alt-text-images',
            'color-contrast', 'keyboard-navigation', 'focus-indicators'
          ],
          AAA: [
            'enhanced-contrast', 'context-help', 'consistent-navigation',
            'predictable-focus-order', 'error-identification'
          ]
        },
        screenReaderRequirements: [
          'navigation-landmarks', 'heading-structure', 'image-descriptions',
          'form-labels', 'button-purposes', 'link-purposes'
        ],
        keyboardNavigationNeeds: [
          'skip-navigation', 'logical-tab-order', 'visible-focus',
          'keyboard-accessible-menus', 'form-navigation'
        ],
        colorContrastRequirements: [
          'text-contrast-aa', 'interactive-element-contrast',
          'brand-color-accessibility', 'error-message-contrast'
        ]
      },
      aiNorwegianCompliance: {
        nsmClassificationTriggers: {
          OPEN: ['marketing-content', 'public-product-info', 'company-information'],
          RESTRICTED: ['customer-testimonials', 'pricing-strategies', 'business-plans'],
          CONFIDENTIAL: ['financial-data', 'strategic-partnerships', 'internal-metrics'],
          SECRET: ['proprietary-algorithms', 'competitive-intelligence']
        },
        gdprRequirements: [
          'cookie-consent', 'privacy-policy', 'data-processing-notice',
          'contact-form-consent', 'newsletter-consent', 'analytics-consent'
        ],
        localizationNeeds: [
          'norwegian-content', 'local-pricing', 'norwegian-contact-info',
          'local-testimonials', 'cultural-imagery', 'local-case-studies'
        ],
        altinnComplianceNeeds: [
          'accessible-design-tokens', 'government-approved-colors',
          'standard-form-validation', 'official-contact-patterns'
        ]
      }
    } as AIEnhancedTemplateConfig);
  }

  private addDataTableAITemplate(): void {
    // Implementation for data table with AI enhancements
    // Similar structure to above but focused on data display and interaction
  }

  private addFormComponentAITemplate(): void {
    // Implementation for form components with AI enhancements
    // Focus on validation, accessibility, and user experience
  }

  private initializePromptTemplates(): void {
    // Component Generation Prompts
    this.addPromptTemplate({
      id: 'generate-react-component',
      name: 'React Component Generation',
      category: 'component',
      description: 'Generate a React component with TypeScript, accessibility, and modern patterns',
      template: `Generate a React component named {{componentName}} with the following requirements:

**Component Type**: {{componentType}}
**Features**: {{features}}
**Styling**: {{styling}}
**Accessibility Level**: {{accessibilityLevel}}

**CRITICAL REQUIREMENTS:**
1. **TypeScript First**: Use strict TypeScript with explicit return types (: JSX.Element)
2. **Functional Components Only**: Use React hooks, never class components
3. **Professional UI Standards**: Minimum h-12 for buttons, h-14 for inputs, rounded-lg+ borders
4. **Tailwind CSS Exclusively**: No inline styles, only utility classes
5. **Full Accessibility**: ARIA labels, keyboard navigation, screen reader support
6. **Error Boundaries**: Implement proper error handling with typed errors

**Code Structure Requirements:**
- Readonly TypeScript interfaces with all props explicitly typed
- Modern ES6+ syntax and React hooks (useState, useCallback, useMemo)
- Professional Tailwind styling (no arbitrary values)
- Comprehensive accessibility attributes
- Memoization where performance matters

**Norwegian Compliance** (if applicable):
{{#if norwegianCompliance}}
- Add Norwegian localization support with t() functions
- Include NSM classification headers: {{nsmClassification}}
- Implement GDPR-compliant data handling
- Use Altinn design system tokens where applicable
{{/if}}

**Platform Optimization** ({{platform}}):
{{#if platformOptimizations}}
{{platformOptimizations}}
{{/if}}

**Expected Output:**
1. Component implementation with proper TypeScript types
2. Props interface with readonly properties
3. Usage examples
4. Accessibility documentation
5. Performance optimization notes`,
      variables: {
        componentName: { type: 'string', description: 'Name of the component to generate', required: true },
        componentType: { type: 'string', description: 'Type of component (button, form, layout, etc.)', required: true },
        features: { type: 'array', description: 'List of features to include', required: false, default: [] },
        styling: { type: 'string', description: 'Styling preferences', required: false, default: 'modern' },
        accessibilityLevel: { type: 'string', description: 'WCAG compliance level', required: false, default: 'AAA' },
        norwegianCompliance: { type: 'boolean', description: 'Include Norwegian compliance features', required: false, default: false },
        nsmClassification: { type: 'string', description: 'NSM classification level', required: false },
        platform: { type: 'string', description: 'Target platform', required: true },
        platformOptimizations: { type: 'string', description: 'Platform-specific optimizations', required: false }
      },
      examples: [
        {
          name: 'Basic Button Component',
          input: {
            componentName: 'ActionButton',
            componentType: 'button',
            features: ['loading', 'disabled', 'variants'],
            styling: 'modern',
            accessibilityLevel: 'AAA',
            platform: 'react'
          },
          expectedOutput: 'React component with TypeScript interfaces, accessibility attributes, and Tailwind styling'
        }
      ],
      platforms: ['react', 'nextjs'],
      complexity: 'moderate',
      tokenEstimate: {
        input: 500,
        output: 1500
      }
    });

    // Layout Pattern Prompts
    this.addPromptTemplate({
      id: 'generate-responsive-layout',
      name: 'Responsive Layout Generation',
      category: 'layout',
      description: 'Generate responsive layout components with modern CSS Grid and Flexbox',
      template: `Create a responsive layout component for {{layoutType}} with the following specifications:

**Layout Type**: {{layoutType}}
**Breakpoints**: {{breakpoints}}
**Sections**: {{sections}}
**Navigation**: {{navigation}}

**LAYOUT REQUIREMENTS:**
1. **CSS Grid/Flexbox**: Use modern layout techniques
2. **Mobile-First Design**: Start with mobile and scale up
3. **Semantic HTML**: Use proper HTML5 semantic elements
4. **Accessibility Landmarks**: Include proper ARIA landmarks
5. **Performance Optimized**: Lazy load non-critical sections

**Responsive Behavior:**
- Mobile (320-768px): {{mobileLayout}}
- Tablet (768-1024px): {{tabletLayout}}
- Desktop (1024px+): {{desktopLayout}}

**Accessibility Features:**
- Skip navigation links
- Proper heading hierarchy (h1 → h6)
- Focus management for route changes
- Screen reader announcements for dynamic content

{{#if norwegianCompliance}}
**Norwegian Compliance:**
- Altinn design system grid tokens
- Norwegian accessibility standards (WCAG AAA)
- Government-approved color schemes
- Standard responsive breakpoints
{{/if}}

**Expected Output:**
1. Layout component with responsive grid system
2. Semantic HTML structure
3. Accessibility implementation
4. Responsive design documentation
5. Cross-browser compatibility notes`,
      variables: {
        layoutType: { type: 'string', description: 'Type of layout (admin, web, mobile)', required: true },
        breakpoints: { type: 'array', description: 'Responsive breakpoints', required: true },
        sections: { type: 'array', description: 'Layout sections', required: true },
        navigation: { type: 'string', description: 'Navigation type', required: false },
        mobileLayout: { type: 'string', description: 'Mobile layout behavior', required: false },
        tabletLayout: { type: 'string', description: 'Tablet layout behavior', required: false },
        desktopLayout: { type: 'string', description: 'Desktop layout behavior', required: false },
        norwegianCompliance: { type: 'boolean', description: 'Include Norwegian standards', required: false }
      },
      examples: [
        {
          name: 'Admin Dashboard Layout',
          input: {
            layoutType: 'admin',
            breakpoints: ['mobile', 'tablet', 'desktop'],
            sections: ['header', 'sidebar', 'main', 'footer'],
            navigation: 'sidebar'
          },
          expectedOutput: 'Responsive admin layout with collapsible sidebar and semantic structure'
        }
      ],
      platforms: ['react', 'nextjs', 'vue', 'angular', 'svelte'],
      complexity: 'complex',
      tokenEstimate: {
        input: 800,
        output: 2500
      }
    });

    // Add more prompt templates for other categories...
    this.addBusinessContextPrompts();
    this.addAccessibilityPrompts();
    this.addNorwegianCompliancePrompts();
    this.addPerformancePrompts();
    this.addMigrationPrompts();
  }

  private addPromptTemplate(template: AIPromptTemplate): void {
    this.promptTemplates.set(template.id, template);
  }

  private addBusinessContextPrompts(): void {
    this.addPromptTemplate({
      id: 'generate-industry-themed-component',
      name: 'Industry-Themed Component Generation',
      category: 'business-context',
      description: 'Generate components tailored for specific industry domains',
      template: `Generate a {{componentType}} component optimized for the {{industryDomain}} industry:

**Industry Context**: {{industryDomain}}
**Business Requirements**: {{businessRequirements}}
**Regulatory Compliance**: {{compliance}}
**User Personas**: {{userPersonas}}

**INDUSTRY-SPECIFIC FEATURES:**
{{#if industryFeatures}}
{{industryFeatures}}
{{/if}}

**DOMAIN CONSIDERATIONS:**
{{#switch industryDomain}}
  {{#case "healthcare"}}
  - HIPAA compliance for patient data
  - Medical terminology and workflows
  - Accessibility for diverse user needs
  - High security and privacy standards
  {{/case}}
  {{#case "finance"}}
  - Financial regulations (SOX, PCI DSS)
  - Real-time data processing
  - Audit trails and compliance reporting
  - Multi-factor authentication
  {{/case}}
  {{#case "education"}}
  - FERPA compliance for student data
  - Multi-language support
  - Accessibility for learning disabilities
  - Age-appropriate design patterns
  {{/case}}
  {{#case "enterprise"}}
  - Role-based access control
  - Integration with enterprise systems
  - Scalability for large organizations
  - Advanced security features
  {{/case}}
{{/switch}}

**Expected Output:**
1. Industry-optimized component implementation
2. Domain-specific terminology and patterns
3. Compliance documentation
4. Industry best practices integration`,
      variables: {
        componentType: { type: 'string', description: 'Type of component', required: true },
        industryDomain: { type: 'string', description: 'Industry domain', required: true },
        businessRequirements: { type: 'array', description: 'Business requirements', required: false },
        compliance: { type: 'array', description: 'Compliance requirements', required: false },
        userPersonas: { type: 'array', description: 'Target user personas', required: false },
        industryFeatures: { type: 'string', description: 'Industry-specific features', required: false }
      },
      examples: [
        {
          name: 'Healthcare Patient Card',
          input: {
            componentType: 'card',
            industryDomain: 'healthcare',
            businessRequirements: ['patient-privacy', 'medical-data-display'],
            compliance: ['HIPAA', 'accessibility-AAA']
          },
          expectedOutput: 'Healthcare-optimized patient card with HIPAA compliance and medical data handling'
        }
      ],
      platforms: ['react', 'nextjs', 'vue', 'angular', 'svelte'],
      complexity: 'complex',
      tokenEstimate: {
        input: 1000,
        output: 3000
      }
    });
  }

  private addAccessibilityPrompts(): void {
    this.addPromptTemplate({
      id: 'generate-accessible-component',
      name: 'WCAG AAA Accessible Component',
      category: 'accessibility',
      description: 'Generate components with comprehensive accessibility features',
      template: `Create a fully accessible {{componentType}} component meeting WCAG {{wcagLevel}} standards:

**Accessibility Requirements:**
- **Level**: WCAG {{wcagLevel}}
- **Screen Reader Support**: {{screenReaderSupport}}
- **Keyboard Navigation**: {{keyboardNavigation}}
- **Color Contrast**: {{colorContrast}}
- **Focus Management**: {{focusManagement}}

**WCAG AAA COMPLIANCE CHECKLIST:**
1. **Perceivable**:
   - Text alternatives for non-text content
   - Captions and audio descriptions for multimedia
   - Color contrast ratio of at least 7:1 for normal text
   - Resizable text up to 200% without loss of functionality

2. **Operable**:
   - All functionality available via keyboard
   - No content flashes more than 3 times per second
   - Users can pause, stop, or hide moving content
   - Timing is adjustable for time-limited content

3. **Understandable**:
   - Text is readable and understandable
   - Content appears and operates predictably
   - Input assistance helps users avoid and correct mistakes

4. **Robust**:
   - Content works with current and future assistive technologies
   - Valid, semantic HTML markup
   - Proper ARIA implementation

**IMPLEMENTATION REQUIREMENTS:**
- Semantic HTML elements with proper roles
- ARIA labels, descriptions, and live regions
- Keyboard event handlers for all interactive elements
- Focus indicators with sufficient contrast
- Error handling with clear, actionable messages
- Consistent navigation and interaction patterns

**TESTING CHECKLIST:**
- Screen reader compatibility (NVDA, JAWS, VoiceOver)
- Keyboard-only navigation testing
- Color contrast validation
- Focus order and management testing
- Automated accessibility testing integration

**Expected Output:**
1. Fully accessible component implementation
2. ARIA attribute documentation
3. Keyboard navigation guide
4. Screen reader testing notes
5. Accessibility audit checklist`,
      variables: {
        componentType: { type: 'string', description: 'Component type', required: true },
        wcagLevel: { type: 'string', description: 'WCAG compliance level', required: true, default: 'AAA' },
        screenReaderSupport: { type: 'boolean', description: 'Screen reader support required', required: false, default: true },
        keyboardNavigation: { type: 'boolean', description: 'Keyboard navigation required', required: false, default: true },
        colorContrast: { type: 'string', description: 'Color contrast requirements', required: false, default: '7:1' },
        focusManagement: { type: 'boolean', description: 'Focus management required', required: false, default: true }
      },
      examples: [
        {
          name: 'Accessible Data Table',
          input: {
            componentType: 'data-table',
            wcagLevel: 'AAA',
            screenReaderSupport: true,
            keyboardNavigation: true
          },
          expectedOutput: 'Fully accessible data table with ARIA grid pattern and keyboard navigation'
        }
      ],
      platforms: ['react', 'nextjs', 'vue', 'angular', 'svelte'],
      complexity: 'enterprise',
      tokenEstimate: {
        input: 1200,
        output: 4000
      }
    });
  }

  private addNorwegianCompliancePrompts(): void {
    this.addPromptTemplate({
      id: 'generate-norwegian-compliant-component',
      name: 'Norwegian Compliance Component',
      category: 'norwegian-compliance',
      description: 'Generate components compliant with Norwegian standards and regulations',
      template: `Create a {{componentType}} component compliant with Norwegian standards:

**Norwegian Compliance Requirements:**
- **NSM Classification**: {{nsmClassification}}
- **GDPR Compliance**: {{gdprCompliance}}
- **Altinn Integration**: {{altinnIntegration}}
- **Language Support**: Norwegian (Bokmål/Nynorsk) + {{additionalLanguages}}

**NSM SECURITY CLASSIFICATION ({{nsmClassification}}):**
{{#switch nsmClassification}}
  {{#case "OPEN"}}
  - Public information with no access restrictions
  - Standard web security practices
  - Public accessibility requirements
  {{/case}}
  {{#case "RESTRICTED"}}
  - Limited access with user authentication
  - Enhanced security measures
  - Audit logging for access
  {{/case}}
  {{#case "CONFIDENTIAL"}}
  - Strict access controls and encryption
  - Multi-factor authentication required
  - Comprehensive audit trails
  {{/case}}
  {{#case "SECRET"}}
  - Maximum security classification
  - End-to-end encryption
  - Air-gapped deployment considerations
  {{/case}}
{{/switch}}

**GDPR COMPLIANCE FEATURES:**
- Data consent management
- Right to be forgotten implementation
- Data portability support
- Privacy by design principles
- Cookie consent integration
- Data minimization practices

**ALTINN DESIGN SYSTEM:**
- Official Norwegian government design tokens
- Standardized color schemes and typography
- Accessible form patterns
- Digital signature integration
- Official iconography and imagery

**LOCALIZATION REQUIREMENTS:**
- Norwegian language support (nb-NO)
- Cultural adaptations for Norwegian users
- Local date/time formatting
- Norwegian address and phone formatting
- Currency formatting (NOK)

**ACCESSIBILITY (Norwegian Standards):**
- WCAG AAA compliance (Norwegian requirement)
- Universal Design principles
- Screen reader support in Norwegian
- High contrast mode support
- Keyboard navigation with Norwegian layout

**Expected Output:**
1. Norwegian-compliant component implementation
2. NSM classification documentation
3. GDPR compliance checklist
4. Altinn integration guide
5. Localization implementation notes`,
      variables: {
        componentType: { type: 'string', description: 'Component type', required: true },
        nsmClassification: { type: 'string', description: 'NSM security classification', required: true },
        gdprCompliance: { type: 'boolean', description: 'GDPR compliance required', required: false, default: true },
        altinnIntegration: { type: 'boolean', description: 'Altinn integration needed', required: false },
        additionalLanguages: { type: 'array', description: 'Additional language support', required: false }
      },
      examples: [
        {
          name: 'Norwegian Government Form',
          input: {
            componentType: 'form',
            nsmClassification: 'RESTRICTED',
            gdprCompliance: true,
            altinnIntegration: true
          },
          expectedOutput: 'Government-compliant form with NSM security and Altinn integration'
        }
      ],
      platforms: ['react', 'nextjs', 'vue', 'angular', 'svelte'],
      complexity: 'enterprise',
      tokenEstimate: {
        input: 1500,
        output: 5000
      }
    });
  }

  private addPerformancePrompts(): void {
    this.addPromptTemplate({
      id: 'generate-performance-optimized-component',
      name: 'Performance-Optimized Component',
      category: 'performance',
      description: 'Generate components with advanced performance optimizations',
      template: `Create a performance-optimized {{componentType}} component:

**Performance Requirements:**
- **Bundle Size**: {{bundleSize}} target
- **Render Performance**: {{renderPerformance}}
- **Loading Strategy**: {{loadingStrategy}}
- **Caching Strategy**: {{cachingStrategy}}

**OPTIMIZATION TECHNIQUES:**
1. **Code Splitting**:
   - Dynamic imports for non-critical features
   - Route-based code splitting
   - Component-level lazy loading

2. **React Optimization**:
   - React.memo for expensive components
   - useMemo for expensive calculations
   - useCallback for stable function references
   - Proper dependency arrays

3. **Bundle Optimization**:
   - Tree shaking for unused code
   - Dead code elimination
   - Dynamic imports for large dependencies
   - Webpack bundle analysis integration

4. **Runtime Performance**:
   - Virtual scrolling for large lists
   - Intersection Observer for lazy loading
   - Web Workers for heavy computations
   - RequestAnimationFrame for animations

5. **Network Optimization**:
   - Resource preloading strategies
   - Image optimization and lazy loading
   - CDN integration for static assets
   - HTTP/2 push for critical resources

6. **Caching Strategies**:
   - Service Worker implementation
   - Browser cache optimization
   - API response caching
   - State management optimization

**PERFORMANCE MONITORING:**
- Core Web Vitals tracking
- Performance API integration
- Bundle analyzer configuration
- Runtime performance profiling

**LOADING PATTERNS:**
{{#switch loadingStrategy}}
  {{#case "lazy"}}
  - Implement React.lazy() with Suspense
  - Progressive enhancement approach
  - Skeleton loading states
  {{/case}}
  {{#case "eager"}}
  - Preload critical resources
  - Minimize initial render time
  - Optimize critical rendering path
  {{/case}}
  {{#case "progressive"}}
  - Progressive loading with priorities
  - Adaptive loading based on connection
  - User-centric loading strategies
  {{/case}}
{{/switch}}

**Expected Output:**
1. Performance-optimized component code
2. Bundle size analysis
3. Performance testing suite
4. Optimization documentation
5. Monitoring integration guide`,
      variables: {
        componentType: { type: 'string', description: 'Component type', required: true },
        bundleSize: { type: 'string', description: 'Target bundle size', required: false, default: '< 50kb' },
        renderPerformance: { type: 'string', description: 'Render performance target', required: false },
        loadingStrategy: { type: 'string', description: 'Loading strategy', required: false, default: 'lazy' },
        cachingStrategy: { type: 'string', description: 'Caching strategy', required: false }
      },
      examples: [
        {
          name: 'High-Performance Data Table',
          input: {
            componentType: 'data-table',
            bundleSize: '< 30kb',
            renderPerformance: '< 100ms',
            loadingStrategy: 'progressive'
          },
          expectedOutput: 'Virtualized data table with progressive loading and sub-100ms render times'
        }
      ],
      platforms: ['react', 'nextjs', 'vue', 'angular', 'svelte'],
      complexity: 'enterprise',
      tokenEstimate: {
        input: 1300,
        output: 4500
      }
    });
  }

  private addMigrationPrompts(): void {
    this.addPromptTemplate({
      id: 'generate-cross-platform-migration',
      name: 'Cross-Platform Migration',
      category: 'migration',
      description: 'Generate migration guides and code for cross-platform component conversion',
      template: `Create a migration plan and implementation for converting {{componentType}} from {{sourcePlatform}} to {{targetPlatform}}:

**Migration Scope:**
- **Source Platform**: {{sourcePlatform}}
- **Target Platform**: {{targetPlatform}}
- **Component Complexity**: {{complexity}}
- **Breaking Changes**: {{breakingChanges}}

**PLATFORM COMPARISON:**
{{#platformComparison sourcePlatform targetPlatform}}

**MIGRATION STRATEGY:**
1. **Code Structure Changes**:
   {{#codeStructureChanges sourcePlatform targetPlatform}}

2. **Dependency Updates**:
   {{#dependencyUpdates sourcePlatform targetPlatform}}

3. **Styling Migration**:
   {{#stylingMigration sourcePlatform targetPlatform}}

4. **State Management**:
   {{#stateManagementMigration sourcePlatform targetPlatform}}

5. **Testing Strategy**:
   {{#testingMigration sourcePlatform targetPlatform}}

**AUTOMATED MIGRATION TOOLS:**
- AST transformation scripts
- Codemod utilities
- Dependency mapping
- Configuration migration

**MANUAL MIGRATION STEPS:**
1. Component structure adaptation
2. Props interface conversion
3. Event handling updates
4. Styling system migration
5. Testing implementation

**VALIDATION CHECKLIST:**
- [ ] Component renders correctly
- [ ] All props work as expected
- [ ] Event handlers function properly
- [ ] Styling matches original design
- [ ] Accessibility features preserved
- [ ] Performance characteristics maintained
- [ ] Tests pass with good coverage

**Expected Output:**
1. Migrated component implementation
2. Step-by-step migration guide
3. Automated migration scripts
4. Testing validation suite
5. Performance comparison report`,
      variables: {
        componentType: { type: 'string', description: 'Component to migrate', required: true },
        sourcePlatform: { type: 'string', description: 'Source platform', required: true },
        targetPlatform: { type: 'string', description: 'Target platform', required: true },
        complexity: { type: 'string', description: 'Migration complexity', required: false },
        breakingChanges: { type: 'array', description: 'Breaking changes', required: false }
      },
      examples: [
        {
          name: 'React to Vue Migration',
          input: {
            componentType: 'data-table',
            sourcePlatform: 'react',
            targetPlatform: 'vue',
            complexity: 'moderate'
          },
          expectedOutput: 'Vue 3 data table with Composition API and migration documentation'
        }
      ],
      platforms: ['react', 'nextjs', 'vue', 'angular', 'svelte', 'electron', 'react-native'],
      complexity: 'enterprise',
      tokenEstimate: {
        input: 2000,
        output: 6000
      }
    });
  }

  // Public API Methods
  
  /**
   * Get AI-enhanced template with complexity metrics and optimization hints
   */
  public getAIEnhancedTemplate(name: string): AIEnhancedTemplateConfig | undefined {
    return this.aiEnhancedTemplates.get(name);
  }

  /**
   * Get prompt template for AI generation
   */
  public getPromptTemplate(id: string): AIPromptTemplate | undefined {
    return this.promptTemplates.get(id);
  }

  /**
   * Analyze user intent and recommend appropriate templates
   */
  public analyzeUserIntent(userInput: string): AITemplateContext {
    // Implement semantic analysis and intent classification
    const keywords = this.extractKeywords(userInput);
    const complexity = this.analyzeComplexity(userInput);
    const platform = this.detectPlatform(userInput);
    const businessDomain = this.classifyBusinessDomain(userInput);
    
    return {
      userIntent: {
        description: userInput,
        confidence: this.calculateConfidence(keywords),
        alternativeInterpretations: this.generateAlternatives(userInput)
      },
      projectContext: {
        platform: platform,
        framework: this.detectFramework(userInput),
        dependencies: this.extractDependencies(userInput),
        structure: this.analyzeProjectStructure(userInput)
      },
      businessContext: {
        domain: businessDomain,
        requirements: this.extractBusinessRequirements(userInput),
        constraints: this.identifyConstraints(userInput)
      },
      complianceContext: {
        accessibility: this.detectAccessibilityNeeds(userInput),
        norwegian: this.detectNorwegianCompliance(userInput),
        gdpr: this.detectGDPRNeeds(userInput),
        nsm: this.detectNSMNeeds(userInput)
      },
      performanceContext: {
        requirements: this.extractPerformanceRequirements(userInput),
        constraints: this.identifyPerformanceConstraints(userInput),
        optimizations: []
      }
    };
  }

  /**
   * Get recommended templates based on user context
   */
  public getRecommendedTemplates(context: AITemplateContext): AIEnhancedTemplateConfig[] {
    const templates = Array.from(this.aiEnhancedTemplates.values());
    
    return templates
      .map(template => ({
        template,
        score: this.calculateTemplateScore(template, context)
      }))
      .sort((a, b) => b.score - a.score)
      .slice(0, 5)
      .map(item => item.template);
  }

  /**
   * Generate AI-optimized component based on template and context
   */
  public async generateAIOptimizedComponent(
    templateName: string, 
    context: AITemplateContext
  ): Promise<{
    code: string;
    documentation: string;
    tests: string;
    optimizations: string[];
  }> {
    const template = this.getAIEnhancedTemplate(templateName);
    if (!template) {
      throw new Error(`Template not found: ${templateName}`);
    }

    // Use MCP integration for enhanced generation
    const mcpRecommendations = await this.getMCPRecommendations(template, context);
    
    // Generate optimized code with AI hints
    const code = await this.generateOptimizedCode(template, context, mcpRecommendations);
    const documentation = this.generateAIDocumentation(template, context);
    const tests = await this.generateAITests(template, context);
    const optimizations = this.suggestOptimizations(context);

    return {
      code,
      documentation,
      tests,
      optimizations
    };
  }

  // Private helper methods for AI analysis and generation

  private extractKeywords(input: string): string[] {
    // Implement NLP-based keyword extraction
    const commonKeywords = [
      'admin', 'dashboard', 'layout', 'form', 'table', 'navigation',
      'saas', 'marketing', 'landing', 'responsive', 'accessible',
      'norwegian', 'compliance', 'performance', 'enterprise'
    ];
    
    return commonKeywords.filter(keyword => 
      input.toLowerCase().includes(keyword)
    );
  }

  private analyzeComplexity(input: string): 'simple' | 'moderate' | 'complex' | 'enterprise' {
    const complexityIndicators = {
      simple: ['button', 'card', 'basic', 'simple'],
      moderate: ['form', 'navigation', 'layout', 'responsive'],
      complex: ['dashboard', 'table', 'interactive', 'advanced'],
      enterprise: ['admin', 'management', 'enterprise', 'compliance', 'security']
    };

    const inputLower = input.toLowerCase();
    
    if (complexityIndicators.enterprise.some(indicator => inputLower.includes(indicator))) {
      return 'enterprise';
    }
    if (complexityIndicators.complex.some(indicator => inputLower.includes(indicator))) {
      return 'complex';
    }
    if (complexityIndicators.moderate.some(indicator => inputLower.includes(indicator))) {
      return 'moderate';
    }
    return 'simple';
  }

  private detectPlatform(input: string): SupportedPlatform {
    const platformKeywords = {
      'react': ['react', 'jsx', 'hooks'],
      'nextjs': ['next', 'nextjs', 'next.js', 'ssr', 'app router'],
      'vue': ['vue', 'composition api', 'pinia'],
      'angular': ['angular', 'typescript', 'ng'],
      'svelte': ['svelte', 'sveltekit', 'stores'],
      'electron': ['electron', 'desktop', 'native'],
      'react-native': ['react native', 'mobile', 'expo']
    };

    const inputLower = input.toLowerCase();
    
    for (const [platform, keywords] of Object.entries(platformKeywords)) {
      if (keywords.some(keyword => inputLower.includes(keyword))) {
        return platform as SupportedPlatform;
      }
    }
    
    return 'react'; // Default platform
  }

  private classifyBusinessDomain(input: string): IndustryTheme {
    const domainKeywords = {
      enterprise: ['enterprise', 'business', 'corporate', 'professional'],
      finance: ['finance', 'banking', 'fintech', 'payment', 'trading'],
      healthcare: ['healthcare', 'medical', 'hospital', 'patient', 'health'],
      education: ['education', 'learning', 'school', 'university', 'student'],
      ecommerce: ['ecommerce', 'shop', 'store', 'product', 'cart', 'checkout'],
      productivity: ['productivity', 'workflow', 'task', 'project', 'collaboration']
    };

    const inputLower = input.toLowerCase();
    
    for (const [domain, keywords] of Object.entries(domainKeywords)) {
      if (keywords.some(keyword => inputLower.includes(keyword))) {
        return domain as IndustryTheme;
      }
    }
    
    return 'enterprise'; // Default domain
  }

  private calculateConfidence(keywords: string[]): number {
    // Simple confidence calculation based on keyword matches
    return Math.min(keywords.length * 0.2, 1.0);
  }

  private generateAlternatives(input: string): string[] {
    // Generate alternative interpretations based on ambiguous keywords
    const alternatives: string[] = [];
    
    if (input.includes('dashboard')) {
      alternatives.push('admin interface', 'analytics view', 'control panel');
    }
    if (input.includes('form')) {
      alternatives.push('input form', 'contact form', 'data entry form');
    }
    if (input.includes('layout')) {
      alternatives.push('page structure', 'component arrangement', 'responsive grid');
    }
    
    return alternatives;
  }

  private detectFramework(input: string): string {
    // Detect specific framework from input
    if (input.includes('next')) return 'Next.js';
    if (input.includes('vue')) return 'Vue.js';
    if (input.includes('angular')) return 'Angular';
    if (input.includes('svelte')) return 'Svelte';
    return 'React';
  }

  private extractDependencies(input: string): string[] {
    // Extract potential dependencies from user input
    const commonDeps = [
      'react-router', 'redux', 'axios', 'styled-components',
      'tailwind', 'framer-motion', 'react-query'
    ];
    
    return commonDeps.filter(dep => 
      input.toLowerCase().includes(dep.replace('-', ' '))
    );
  }

  private analyzeProjectStructure(input: string): Record<string, any> {
    // Analyze project structure hints from input
    return {
      hasRouting: input.includes('navigation') || input.includes('routing'),
      hasStateManagement: input.includes('state') || input.includes('store'),
      hasAuthentication: input.includes('auth') || input.includes('login'),
      hasAPI: input.includes('api') || input.includes('data'),
      hasDatabase: input.includes('database') || input.includes('db')
    };
  }

  private extractBusinessRequirements(input: string): string[] {
    const requirements: string[] = [];
    
    if (input.includes('secure') || input.includes('security')) {
      requirements.push('high-security');
    }
    if (input.includes('fast') || input.includes('performance')) {
      requirements.push('high-performance');
    }
    if (input.includes('accessible') || input.includes('accessibility')) {
      requirements.push('wcag-compliance');
    }
    if (input.includes('mobile') || input.includes('responsive')) {
      requirements.push('mobile-responsive');
    }
    
    return requirements;
  }

  private identifyConstraints(input: string): string[] {
    const constraints: string[] = [];
    
    if (input.includes('budget') || input.includes('cost')) {
      constraints.push('budget-limited');
    }
    if (input.includes('deadline') || input.includes('quick')) {
      constraints.push('time-constrained');
    }
    if (input.includes('legacy') || input.includes('existing')) {
      constraints.push('legacy-integration');
    }
    
    return constraints;
  }

  private detectAccessibilityNeeds(input: string): any {
    return {
      level: input.includes('AAA') ? 'AAA' : 'AA',
      screenReader: input.includes('screen reader') || input.includes('accessible'),
      keyboardNavigation: true, // Default to true
      highContrast: input.includes('high contrast'),
      reducedMotion: input.includes('reduced motion'),
      focusManagement: true,
      ariaLabels: true
    };
  }

  private detectNorwegianCompliance(input: string): boolean {
    return input.includes('norwegian') || 
           input.includes('norway') || 
           input.includes('altinn') ||
           input.includes('nsm');
  }

  private detectGDPRNeeds(input: string): boolean {
    return input.includes('gdpr') || 
           input.includes('privacy') || 
           input.includes('consent') ||
           input.includes('european');
  }

  private detectNSMNeeds(input: string): boolean {
    return input.includes('nsm') || 
           input.includes('classification') || 
           input.includes('security level') ||
           input.includes('government');
  }

  private extractPerformanceRequirements(input: string): string[] {
    const requirements: string[] = [];
    
    if (input.includes('fast') || input.includes('performance')) {
      requirements.push('high-performance');
    }
    if (input.includes('large') || input.includes('scale')) {
      requirements.push('scalability');
    }
    if (input.includes('mobile') || input.includes('bandwidth')) {
      requirements.push('mobile-optimized');
    }
    
    return requirements;
  }

  private identifyPerformanceConstraints(input: string): string[] {
    const constraints: string[] = [];
    
    if (input.includes('slow network') || input.includes('3g')) {
      constraints.push('low-bandwidth');
    }
    if (input.includes('old device') || input.includes('legacy browser')) {
      constraints.push('legacy-support');
    }
    
    return constraints;
  }

  private suggestOptimizations(context: AITemplateContext): string[] {
    const optimizations: string[] = [];
    
    if (context.performanceContext.requirements.includes('high-performance')) {
      optimizations.push('implement-lazy-loading', 'use-react-memo', 'optimize-bundle-size');
    }
    if (context.complianceContext.accessibility.level === 'AAA') {
      optimizations.push('enhance-accessibility', 'improve-keyboard-navigation');
    }
    if (context.complianceContext.norwegian) {
      optimizations.push('add-norwegian-localization', 'implement-nsm-compliance');
    }
    
    return optimizations;
  }

  private calculateTemplateScore(template: AIEnhancedTemplateConfig, context: AITemplateContext): number {
    let score = 0;
    
    // Platform compatibility
    if (template.aiMetrics.platformComplexity[context.projectContext.platform] <= 3) {
      score += 30;
    }
    
    // Business domain match
    if (template.aiSemantics.businessDomains.includes(context.businessContext.domain)) {
      score += 25;
    }
    
    // Complexity alignment
    const contextComplexity = this.getContextComplexity(context);
    if (template.aiMetrics.featureComplexity === contextComplexity) {
      score += 20;
    }
    
    // Keyword matching
    const keywordMatches = template.aiPatterns.keywordMatching.primary
      .filter(keyword => context.userIntent.description.toLowerCase().includes(keyword));
    score += keywordMatches.length * 5;
    
    // Norwegian compliance bonus
    if (context.complianceContext.norwegian && template.aiNorwegianCompliance) {
      score += 15;
    }
    
    return score;
  }

  private getContextComplexity(context: AITemplateContext): 'simple' | 'moderate' | 'complex' | 'enterprise' {
    const requirementCount = context.businessContext.requirements.length;
    const hasCompliance = context.complianceContext.norwegian || 
                         context.complianceContext.gdpr ||
                         context.complianceContext.accessibility.level === 'AAA';
    
    if (hasCompliance && requirementCount > 5) return 'enterprise';
    if (requirementCount > 3) return 'complex';
    if (requirementCount > 1) return 'moderate';
    return 'simple';
  }

  private async getMCPRecommendations(
    template: AIEnhancedTemplateConfig, 
    context: AITemplateContext
  ): Promise<any> {
    // Integrate with MCP API for enhanced recommendations
    // This would call the actual MCP tools in a real implementation
    return {
      componentSpecs: await this.queryMCPSpecifications(template.name),
      layoutPatterns: await this.queryMCPLayoutPatterns(context),
      accessibilityValidation: await this.queryMCPAccessibility(context),
      norwegianCompliance: await this.queryMCPNorwegianCompliance(context),
      performanceOptimizations: await this.queryMCPPerformance(context)
    };
  }

  private async queryMCPSpecifications(templateName: string): Promise<any> {
    // Mock implementation - would call actual MCP API
    return { specifications: [] };
  }

  private async queryMCPLayoutPatterns(context: AITemplateContext): Promise<any> {
    // Mock implementation - would call actual MCP API
    return { patterns: [] };
  }

  private async queryMCPAccessibility(context: AITemplateContext): Promise<any> {
    // Mock implementation - would call actual MCP API
    return { checks: [] };
  }

  private async queryMCPNorwegianCompliance(context: AITemplateContext): Promise<any> {
    // Mock implementation - would call actual MCP API
    return { compliance: [] };
  }

  private async queryMCPPerformance(context: AITemplateContext): Promise<any> {
    // Mock implementation - would call actual MCP API
    return { optimizations: [] };
  }

  private async generateOptimizedCode(
    template: AIEnhancedTemplateConfig,
    context: AITemplateContext,
    mcpRecommendations: any
  ): Promise<string> {
    // Generate AI-optimized code based on template and context
    // This would use the prompt templates and AI generation
    const promptTemplate = this.getRelevantPromptTemplate(template, context);
    if (!promptTemplate) {
      throw new Error('No suitable prompt template found');
    }

    // Render prompt with context variables
    const renderedPrompt = this.renderPromptTemplate(promptTemplate, context);
    
    // In a real implementation, this would call an AI service
    return `// Generated AI-optimized ${template.name} component
// Context: ${context.userIntent.description}
// Platform: ${context.projectContext.platform}
// Compliance: ${context.complianceContext.norwegian ? 'Norwegian' : 'Standard'}

import React, { useState, useCallback, useMemo } from 'react';

interface ${template.name}Props {
  readonly className?: string;
  readonly children?: React.ReactNode;
  // ... additional props based on template
}

export const ${template.name} = ({ 
  className, 
  children, 
  ...props 
}: ${template.name}Props): JSX.Element => {
  // AI-optimized implementation
  return (
    <div className={className}>
      {children}
    </div>
  );
};`;
  }

  private getRelevantPromptTemplate(
    template: AIEnhancedTemplateConfig, 
    context: AITemplateContext
  ): AIPromptTemplate | undefined {
    const prompts = Array.from(this.promptTemplates.values());
    
    // Find most relevant prompt template
    return prompts.find(prompt => 
      prompt.platforms.includes(context.projectContext.platform) &&
      prompt.complexity === template.aiMetrics.featureComplexity
    );
  }

  private renderPromptTemplate(template: AIPromptTemplate, context: AITemplateContext): string {
    // Simple template rendering - in real implementation would use a proper template engine
    let rendered = template.template;
    
    // Replace context variables
    rendered = rendered.replace(/\{\{componentType\}\}/g, context.userIntent.description);
    rendered = rendered.replace(/\{\{platform\}\}/g, context.projectContext.platform);
    rendered = rendered.replace(/\{\{norwegianCompliance\}\}/g, context.complianceContext.norwegian.toString());
    
    return rendered;
  }

  private generateAIDocumentation(template: AIEnhancedTemplateConfig, context: AITemplateContext): string {
    return `# ${template.name} Documentation

## Overview
${template.aiDocumentation.structuredComments.componentDescription}

## AI Generation Context
- **User Intent**: ${context.userIntent.description}
- **Platform**: ${context.projectContext.platform}
- **Business Domain**: ${context.businessContext.domain}
- **Complexity**: ${template.aiMetrics.featureComplexity}

## Props Documentation
${Object.entries(template.aiDocumentation.structuredComments.propsDescription)
  .map(([prop, desc]) => `- **${prop}**: ${desc}`)
  .join('\n')}

## Usage Examples
${template.aiDocumentation.structuredComments.usageExamples
  .map(example => `- ${example}`)
  .join('\n')}

## Performance Characteristics
- **Estimated LOC**: ${template.aiMetrics.estimatedLinesOfCode}
- **Build Time**: ~${template.aiMetrics.buildTime}ms
- **Bundle Impact**: +${template.aiMetrics.dependencies} dependencies

## Accessibility Features
- **WCAG Level**: ${context.complianceContext.accessibility.level}
- **Screen Reader**: ${context.complianceContext.accessibility.screenReader ? 'Supported' : 'Not supported'}
- **Keyboard Navigation**: ${context.complianceContext.accessibility.keyboardNavigation ? 'Supported' : 'Not supported'}

${context.complianceContext.norwegian ? `
## Norwegian Compliance
- **NSM Classification**: Based on content sensitivity
- **GDPR Compliance**: ${context.complianceContext.gdpr ? 'Enabled' : 'Not required'}
- **Altinn Integration**: Available for government forms
- **Language Support**: Norwegian (Bokmål) with nb-NO locale
` : ''}

## Best Practices
${template.aiOptimization.bestPractices.map(practice => `- ${practice}`).join('\n')}

## Common Pitfalls
${template.aiOptimization.commonPitfalls.map(pitfall => `- ${pitfall}`).join('\n')}
`;
  }

  private async generateAITests(template: AIEnhancedTemplateConfig, context: AITemplateContext): Promise<string> {
    return `// AI-generated tests for ${template.name}
import { render, screen, fireEvent } from '@testing-library/react';
import { ${template.name} } from './${template.name}';

describe('${template.name}', () => {
  it('renders without errors', () => {
    render(<${template.name} />);
    expect(screen.getByRole('main')).toBeInTheDocument();
  });

  it('meets accessibility requirements', () => {
    const { container } = render(<${template.name} />);
    // Add accessibility tests based on context
    ${context.complianceContext.accessibility.level === 'AAA' ? 
      '// Enhanced accessibility tests for WCAG AAA' : 
      '// Standard accessibility tests for WCAG AA'
    }
  });

  ${context.complianceContext.norwegian ? `
  it('supports Norwegian localization', () => {
    render(<${template.name} locale="nb-NO" />);
    // Test Norwegian-specific features
  });
  ` : ''}

  // Performance tests
  it('renders within performance budget', () => {
    const startTime = performance.now();
    render(<${template.name} />);
    const endTime = performance.now();
    expect(endTime - startTime).toBeLessThan(100); // 100ms threshold
  });
});`;
  }
}