/**
 * Documentation Template Generator
 * Generates documentation templates with industry themes and design tokens
 */

import { BaseComponentSpec, Platform } from '../core/component-specs';
import { UniversalTheme } from '../core/theme-system';
import { DocumentationGenerator, DocumentationOptions } from './documentation-generator';

// =============================================================================
// INDUSTRY THEME TYPES
// =============================================================================

export type IndustryTheme = 
  | 'enterprise' 
  | 'finance' 
  | 'healthcare' 
  | 'education' 
  | 'ecommerce' 
  | 'productivity'
  | 'government'
  | 'manufacturing'
  | 'retail'
  | 'nonprofit';

export interface IndustryThemeConfig {
  readonly id: IndustryTheme;
  readonly name: string;
  readonly description: string;
  readonly brandColors: BrandColorPalette;
  readonly typography: IndustryTypography;
  readonly componentVariants: ComponentVariantMap;
  readonly designTokens: IndustryDesignTokens;
  readonly complianceRequirements: ComplianceRequirement[];
  readonly useCases: UseCase[];
}

export interface BrandColorPalette {
  readonly primary: string;
  readonly secondary: string;
  readonly accent: string;
  readonly neutral: string;
  readonly semantic: SemanticColors;
}

export interface SemanticColors {
  readonly success: string;
  readonly warning: string;
  readonly error: string;
  readonly info: string;
  readonly critical: string;
}

export interface IndustryTypography {
  readonly headingFont: string;
  readonly bodyFont: string;
  readonly monoFont: string;
  readonly scale: TypographyScale;
  readonly weights: FontWeightMap;
}

export interface TypographyScale {
  readonly xs: string;
  readonly sm: string;
  readonly md: string;
  readonly lg: string;
  readonly xl: string;
  readonly xxl: string;
}

export interface FontWeightMap {
  readonly light: number;
  readonly regular: number;
  readonly medium: number;
  readonly semibold: number;
  readonly bold: number;
}

export interface ComponentVariantMap {
  readonly [componentId: string]: ComponentVariantConfig[];
}

export interface ComponentVariantConfig {
  readonly name: string;
  readonly description: string;
  readonly props: Record<string, any>;
  readonly styling: Record<string, string>;
  readonly useCase: string;
}

export interface IndustryDesignTokens {
  readonly spacing: SpacingTokens;
  readonly shadows: ShadowTokens;
  readonly borders: BorderTokens;
  readonly animations: AnimationTokens;
  readonly breakpoints: BreakpointTokens;
}

export interface SpacingTokens {
  readonly compact: Record<string, string>;
  readonly comfortable: Record<string, string>;
  readonly spacious: Record<string, string>;
}

export interface ShadowTokens {
  readonly subtle: Record<string, string>;
  readonly prominent: Record<string, string>;
  readonly dramatic: Record<string, string>;
}

export interface BorderTokens {
  readonly radius: Record<string, string>;
  readonly width: Record<string, string>;
}

export interface AnimationTokens {
  readonly duration: Record<string, string>;
  readonly easing: Record<string, string>;
}

export interface BreakpointTokens {
  readonly mobile: string;
  readonly tablet: string;
  readonly desktop: string;
  readonly wide: string;
}

export interface ComplianceRequirement {
  readonly type: 'accessibility' | 'security' | 'privacy' | 'regulatory';
  readonly standard: string;
  readonly level: string;
  readonly description: string;
  readonly requirements: string[];
}

export interface UseCase {
  readonly id: string;
  readonly title: string;
  readonly description: string;
  readonly components: string[];
  readonly example: string;
  readonly benefits: string[];
}

// =============================================================================
// INDUSTRY THEME CONFIGURATIONS
// =============================================================================

export const INDUSTRY_THEMES: Record<IndustryTheme, IndustryThemeConfig> = {
  enterprise: {
    id: 'enterprise',
    name: 'Enterprise',
    description: 'Professional enterprise applications with focus on efficiency and clarity',
    brandColors: {
      primary: '#0066CC',
      secondary: '#4A90E2',
      accent: '#7B68EE',
      neutral: '#6B7280',
      semantic: {
        success: '#10B981',
        warning: '#F59E0B',
        error: '#EF4444',
        info: '#3B82F6',
        critical: '#DC2626'
      }
    },
    typography: {
      headingFont: 'Inter Display',
      bodyFont: 'Inter',
      monoFont: 'JetBrains Mono',
      scale: {
        xs: '0.75rem',
        sm: '0.875rem',
        md: '1rem',
        lg: '1.125rem',
        xl: '1.25rem',
        xxl: '1.5rem'
      },
      weights: {
        light: 300,
        regular: 400,
        medium: 500,
        semibold: 600,
        bold: 700
      }
    },
    componentVariants: {
      button: [
        {
          name: 'executive',
          description: 'Executive-level styling with premium appearance',
          props: { variant: 'primary', size: 'lg' },
          styling: { 
            background: 'gradient-to-r from-blue-600 to-blue-700',
            shadow: 'shadow-lg',
            border: 'border-0'
          },
          useCase: 'Critical actions and executive dashboards'
        },
        {
          name: 'workflow',
          description: 'Optimized for workflow and process management',
          props: { variant: 'secondary', size: 'md' },
          styling: {
            background: 'bg-slate-100',
            border: 'border border-slate-300',
            text: 'text-slate-700'
          },
          useCase: 'Workflow steps and process controls'
        }
      ],
      card: [
        {
          name: 'dashboard',
          description: 'Executive dashboard cards with metrics focus',
          props: { variant: 'elevated', padding: 'lg' },
          styling: {
            background: 'bg-white',
            shadow: 'shadow-xl',
            border: 'border-l-4 border-l-blue-500'
          },
          useCase: 'KPI cards and executive dashboards'
        }
      ]
    },
    designTokens: {
      spacing: {
        compact: { base: '4px', lg: '8px', xl: '16px' },
        comfortable: { base: '8px', lg: '16px', xl: '24px' },
        spacious: { base: '12px', lg: '24px', xl: '32px' }
      },
      shadows: {
        subtle: { sm: '0 1px 2px rgba(0,0,0,0.05)', md: '0 2px 4px rgba(0,0,0,0.1)' },
        prominent: { lg: '0 8px 16px rgba(0,0,0,0.15)', xl: '0 12px 24px rgba(0,0,0,0.2)' },
        dramatic: { '2xl': '0 20px 40px rgba(0,0,0,0.3)' }
      },
      borders: {
        radius: { sm: '4px', md: '8px', lg: '12px' },
        width: { thin: '1px', medium: '2px', thick: '4px' }
      },
      animations: {
        duration: { fast: '150ms', normal: '300ms', slow: '500ms' },
        easing: { standard: 'cubic-bezier(0.4, 0, 0.2, 1)', emphasized: 'cubic-bezier(0.4, 0, 0, 1)' }
      },
      breakpoints: {
        mobile: '768px',
        tablet: '1024px',
        desktop: '1280px',
        wide: '1536px'
      }
    },
    complianceRequirements: [
      {
        type: 'accessibility',
        standard: 'WCAG',
        level: '2.1 AAA',
        description: 'Web Content Accessibility Guidelines compliance',
        requirements: [
          'Color contrast ratio of 7:1 for normal text',
          'Color contrast ratio of 4.5:1 for large text',
          'Keyboard navigation support',
          'Screen reader compatibility',
          'Focus indicators',
          'Alternative text for images'
        ]
      },
      {
        type: 'security',
        standard: 'OWASP',
        level: 'Top 10',
        description: 'Security best practices for web applications',
        requirements: [
          'Input validation and sanitization',
          'Secure data transmission',
          'Authentication and authorization',
          'Session management',
          'Error handling without information disclosure'
        ]
      }
    ],
    useCases: [
      {
        id: 'executive-dashboard',
        title: 'Executive Dashboard',
        description: 'High-level overview dashboard for executives and decision makers',
        components: ['card', 'chart', 'metric', 'navigation', 'header'],
        example: `
<Dashboard>
  <Header variant="executive" />
  <MetricsGrid>
    <MetricCard title="Revenue" value="$2.4M" trend="+12%" />
    <MetricCard title="Users" value="45.2K" trend="+8%" />
    <MetricCard title="Conversion" value="3.2%" trend="-2%" />
  </MetricsGrid>
  <ChartGrid>
    <Chart type="line" title="Monthly Revenue" />
    <Chart type="bar" title="User Growth" />
  </ChartGrid>
</Dashboard>`,
        benefits: [
          'Clear data visualization',
          'Executive-focused metrics',
          'Professional appearance',
          'Mobile responsive'
        ]
      },
      {
        id: 'workflow-management',
        title: 'Workflow Management',
        description: 'Process management interface for business workflows',
        components: ['stepper', 'form', 'button', 'table', 'modal'],
        example: `
<WorkflowManager>
  <ProcessStepper steps={processSteps} current={2} />
  <TaskTable data={tasks} actions={['approve', 'reject', 'reassign']} />
  <ActionBar>
    <Button variant="workflow">Process Next</Button>
    <Button variant="secondary">Save Draft</Button>
  </ActionBar>
</WorkflowManager>`,
        benefits: [
          'Streamlined process management',
          'Clear workflow visualization',
          'Efficient task handling',
          'Audit trail support'
        ]
      }
    ]
  },

  finance: {
    id: 'finance',
    name: 'Finance',
    description: 'Financial services applications with emphasis on trust, security, and precision',
    brandColors: {
      primary: '#1B4332',
      secondary: '#2D5A3D',
      accent: '#52796F',
      neutral: '#74798C',
      semantic: {
        success: '#2E7D32',
        warning: '#F57C00',
        error: '#C62828',
        info: '#1565C0',
        critical: '#B71C1C'
      }
    },
    typography: {
      headingFont: 'IBM Plex Serif',
      bodyFont: 'IBM Plex Sans',
      monoFont: 'IBM Plex Mono',
      scale: {
        xs: '0.75rem',
        sm: '0.875rem',
        md: '1rem',
        lg: '1.125rem',
        xl: '1.25rem',
        xxl: '1.5rem'
      },
      weights: {
        light: 300,
        regular: 400,
        medium: 500,
        semibold: 600,
        bold: 700
      }
    },
    componentVariants: {
      button: [
        {
          name: 'trading',
          description: 'High-contrast buttons for trading interfaces',
          props: { variant: 'primary', size: 'md' },
          styling: {
            background: 'bg-green-600 hover:bg-green-700',
            text: 'text-white font-semibold',
            border: 'border-2 border-green-700'
          },
          useCase: 'Buy/sell actions and critical financial operations'
        },
        {
          name: 'conservative',
          description: 'Conservative styling for traditional banking',
          props: { variant: 'secondary', size: 'md' },
          styling: {
            background: 'bg-slate-50',
            text: 'text-slate-800',
            border: 'border border-slate-300'
          },
          useCase: 'Account management and routine operations'
        }
      ],
      table: [
        {
          name: 'financial',
          description: 'Financial data tables with precision formatting',
          props: { variant: 'striped', density: 'comfortable' },
          styling: {
            background: 'bg-white',
            border: 'border border-slate-200',
            text: 'font-mono text-sm'
          },
          useCase: 'Financial statements and transaction lists'
        }
      ]
    },
    designTokens: {
      spacing: {
        compact: { base: '2px', lg: '4px', xl: '8px' },
        comfortable: { base: '6px', lg: '12px', xl: '20px' },
        spacious: { base: '10px', lg: '20px', xl: '32px' }
      },
      shadows: {
        subtle: { sm: '0 1px 2px rgba(27,67,50,0.1)', md: '0 2px 4px rgba(27,67,50,0.15)' },
        prominent: { lg: '0 8px 16px rgba(27,67,50,0.2)', xl: '0 12px 24px rgba(27,67,50,0.25)' },
        dramatic: { '2xl': '0 20px 40px rgba(27,67,50,0.3)' }
      },
      borders: {
        radius: { sm: '2px', md: '4px', lg: '6px' },
        width: { thin: '1px', medium: '2px', thick: '3px' }
      },
      animations: {
        duration: { fast: '100ms', normal: '200ms', slow: '300ms' },
        easing: { standard: 'cubic-bezier(0.25, 0.46, 0.45, 0.94)', emphasized: 'cubic-bezier(0.4, 0, 0.2, 1)' }
      },
      breakpoints: {
        mobile: '768px',
        tablet: '1024px',
        desktop: '1440px',
        wide: '1920px'
      }
    },
    complianceRequirements: [
      {
        type: 'regulatory',
        standard: 'PCI DSS',
        level: 'Level 1',
        description: 'Payment Card Industry Data Security Standard',
        requirements: [
          'Secure transmission of cardholder data',
          'Encryption of stored data',
          'Access controls and authentication',
          'Regular security testing',
          'Secure coding practices'
        ]
      },
      {
        type: 'regulatory',
        standard: 'SOX',
        level: 'Section 404',
        description: 'Sarbanes-Oxley Act compliance for financial reporting',
        requirements: [
          'Internal controls over financial reporting',
          'Audit trail maintenance',
          'Data integrity controls',
          'Access controls and segregation of duties'
        ]
      }
    ],
    useCases: [
      {
        id: 'trading-dashboard',
        title: 'Trading Dashboard',
        description: 'Real-time trading interface for financial markets',
        components: ['chart', 'table', 'button', 'form', 'alert'],
        example: `
<TradingDashboard>
  <MarketChart symbol="AAPL" interval="1m" />
  <OrderBook bids={bids} asks={asks} />
  <TradingForm>
    <OrderTypeSelector />
    <PriceInput />
    <QuantityInput />
    <Button variant="trading" action="buy">BUY</Button>
    <Button variant="trading" action="sell">SELL</Button>
  </TradingForm>
</TradingDashboard>`,
        benefits: [
          'Real-time market data',
          'Precise order execution',
          'Risk management tools',
          'Regulatory compliance'
        ]
      }
    ]
  },

  healthcare: {
    id: 'healthcare',
    name: 'Healthcare',
    description: 'Healthcare applications prioritizing clarity, safety, and compliance',
    brandColors: {
      primary: '#0369A1',
      secondary: '#0284C7',
      accent: '#06B6D4',
      neutral: '#64748B',
      semantic: {
        success: '#059669',
        warning: '#D97706',
        error: '#DC2626',
        info: '#2563EB',
        critical: '#991B1B'
      }
    },
    typography: {
      headingFont: 'Source Sans Pro',
      bodyFont: 'Source Sans Pro',
      monoFont: 'Source Code Pro',
      scale: {
        xs: '0.875rem',
        sm: '1rem',
        md: '1.125rem',
        lg: '1.25rem',
        xl: '1.375rem',
        xxl: '1.5rem'
      },
      weights: {
        light: 300,
        regular: 400,
        medium: 600,
        semibold: 600,
        bold: 700
      }
    },
    componentVariants: {
      alert: [
        {
          name: 'medical',
          description: 'Medical alerts with clear severity indicators',
          props: { variant: 'critical', icon: true },
          styling: {
            background: 'bg-red-50 border-l-4 border-l-red-500',
            text: 'text-red-900 font-medium',
            icon: 'text-red-500'
          },
          useCase: 'Critical medical alerts and safety warnings'
        }
      ],
      form: [
        {
          name: 'patient',
          description: 'Patient information forms with validation',
          props: { variant: 'medical', validation: true },
          styling: {
            background: 'bg-white',
            border: 'border border-blue-200',
            focus: 'focus:border-blue-500 focus:ring-2 focus:ring-blue-200'
          },
          useCase: 'Patient data collection and medical forms'
        }
      ]
    },
    designTokens: {
      spacing: {
        compact: { base: '4px', lg: '8px', xl: '12px' },
        comfortable: { base: '8px', lg: '16px', xl: '24px' },
        spacious: { base: '12px', lg: '24px', xl: '36px' }
      },
      shadows: {
        subtle: { sm: '0 1px 2px rgba(3,105,161,0.1)', md: '0 2px 4px rgba(3,105,161,0.1)' },
        prominent: { lg: '0 8px 16px rgba(3,105,161,0.15)', xl: '0 12px 24px rgba(3,105,161,0.2)' },
        dramatic: { '2xl': '0 20px 40px rgba(3,105,161,0.25)' }
      },
      borders: {
        radius: { sm: '6px', md: '8px', lg: '12px' },
        width: { thin: '1px', medium: '2px', thick: '4px' }
      },
      animations: {
        duration: { fast: '150ms', normal: '250ms', slow: '400ms' },
        easing: { standard: 'ease-in-out', emphasized: 'cubic-bezier(0.4, 0, 0.2, 1)' }
      },
      breakpoints: {
        mobile: '768px',
        tablet: '1024px',
        desktop: '1280px',
        wide: '1600px'
      }
    },
    complianceRequirements: [
      {
        type: 'privacy',
        standard: 'HIPAA',
        level: 'Full Compliance',
        description: 'Health Insurance Portability and Accountability Act',
        requirements: [
          'Protected Health Information (PHI) security',
          'Access controls and audit logs',
          'Data encryption in transit and at rest',
          'Business Associate Agreements',
          'Breach notification procedures'
        ]
      },
      {
        type: 'regulatory',
        standard: 'FDA',
        level: '21 CFR Part 820',
        description: 'FDA Medical Device Quality System Regulation',
        requirements: [
          'Design controls and documentation',
          'Risk management processes',
          'Clinical evaluation requirements',
          'Post-market surveillance'
        ]
      }
    ],
    useCases: [
      {
        id: 'patient-portal',
        title: 'Patient Portal',
        description: 'Patient-facing portal for appointments, records, and communication',
        components: ['card', 'form', 'calendar', 'message', 'button'],
        example: `
<PatientPortal>
  <HealthSummary>
    <VitalSigns data={vitals} />
    <Medications list={medications} />
    <Appointments upcoming={appointments} />
  </HealthSummary>
  <MessagingCenter>
    <MessageList messages={messages} />
    <ComposeMessage />
  </MessagingCenter>
</PatientPortal>`,
        benefits: [
          'Improved patient engagement',
          'Secure health information access',
          'Appointment management',
          'Provider communication'
        ]
      }
    ]
  },

  // Additional industry themes would be defined here...
  education: {
    id: 'education',
    name: 'Education',
    description: 'Educational platforms focused on learning, accessibility, and engagement',
    brandColors: {
      primary: '#7C3AED',
      secondary: '#8B5CF6',
      accent: '#A78BFA',
      neutral: '#6B7280',
      semantic: {
        success: '#10B981',
        warning: '#F59E0B',
        error: '#EF4444',
        info: '#3B82F6',
        critical: '#DC2626'
      }
    },
    typography: {
      headingFont: 'Nunito',
      bodyFont: 'Open Sans',
      monoFont: 'Fira Code',
      scale: {
        xs: '0.875rem',
        sm: '1rem',
        md: '1.125rem',
        lg: '1.25rem',
        xl: '1.375rem',
        xxl: '1.625rem'
      },
      weights: {
        light: 300,
        regular: 400,
        medium: 500,
        semibold: 600,
        bold: 700
      }
    },
    componentVariants: {},
    designTokens: {
      spacing: {
        compact: { base: '6px', lg: '12px', xl: '18px' },
        comfortable: { base: '10px', lg: '20px', xl: '30px' },
        spacious: { base: '16px', lg: '32px', xl: '48px' }
      },
      shadows: {
        subtle: { sm: '0 1px 3px rgba(124,58,237,0.12)', md: '0 4px 6px rgba(124,58,237,0.15)' },
        prominent: { lg: '0 10px 15px rgba(124,58,237,0.2)', xl: '0 20px 25px rgba(124,58,237,0.25)' },
        dramatic: { '2xl': '0 25px 50px rgba(124,58,237,0.35)' }
      },
      borders: {
        radius: { sm: '8px', md: '12px', lg: '16px' },
        width: { thin: '1px', medium: '2px', thick: '4px' }
      },
      animations: {
        duration: { fast: '200ms', normal: '350ms', slow: '500ms' },
        easing: { standard: 'cubic-bezier(0.25, 0.46, 0.45, 0.94)', emphasized: 'cubic-bezier(0.68, -0.55, 0.265, 1.55)' }
      },
      breakpoints: {
        mobile: '640px',
        tablet: '768px',
        desktop: '1024px',
        wide: '1280px'
      }
    },
    complianceRequirements: [
      {
        type: 'privacy',
        standard: 'FERPA',
        level: 'Full Compliance',
        description: 'Family Educational Rights and Privacy Act',
        requirements: [
          'Educational record privacy protection',
          'Parental consent for disclosure',
          'Student rights to access records',
          'Directory information policies'
        ]
      }
    ],
    useCases: [
      {
        id: 'learning-management',
        title: 'Learning Management System',
        description: 'Comprehensive platform for course delivery and student engagement',
        components: ['course-card', 'progress', 'quiz', 'discussion', 'gradebook'],
        example: `
<LearningDashboard>
  <CourseGrid courses={enrolledCourses} />
  <ProgressOverview assignments={assignments} />
  <UpcomingEvents events={calendar} />
  <RecentActivity activities={activities} />
</LearningDashboard>`,
        benefits: [
          'Engaging learning experience',
          'Progress tracking',
          'Interactive content delivery',
          'Assessment tools'
        ]
      }
    ]
  },

  ecommerce: {
    id: 'ecommerce',
    name: 'E-commerce',
    description: 'E-commerce platforms optimized for conversion and user experience',
    brandColors: {
      primary: '#F59E0B',
      secondary: '#D97706',
      accent: '#92400E',
      neutral: '#6B7280',
      semantic: {
        success: '#10B981',
        warning: '#F59E0B',
        error: '#EF4444',
        info: '#3B82F6',
        critical: '#DC2626'
      }
    },
    typography: {
      headingFont: 'Playfair Display',
      bodyFont: 'Source Sans Pro',
      monoFont: 'Roboto Mono',
      scale: {
        xs: '0.75rem',
        sm: '0.875rem',
        md: '1rem',
        lg: '1.125rem',
        xl: '1.25rem',
        xxl: '1.5rem'
      },
      weights: {
        light: 300,
        regular: 400,
        medium: 500,
        semibold: 600,
        bold: 700
      }
    },
    componentVariants: {},
    designTokens: {
      spacing: {
        compact: { base: '4px', lg: '8px', xl: '16px' },
        comfortable: { base: '8px', lg: '16px', xl: '24px' },
        spacious: { base: '12px', lg: '24px', xl: '32px' }
      },
      shadows: {
        subtle: { sm: '0 1px 2px rgba(245,158,11,0.1)', md: '0 2px 4px rgba(245,158,11,0.15)' },
        prominent: { lg: '0 8px 16px rgba(245,158,11,0.2)', xl: '0 12px 24px rgba(245,158,11,0.25)' },
        dramatic: { '2xl': '0 20px 40px rgba(245,158,11,0.3)' }
      },
      borders: {
        radius: { sm: '4px', md: '8px', lg: '12px' },
        width: { thin: '1px', medium: '2px', thick: '4px' }
      },
      animations: {
        duration: { fast: '150ms', normal: '300ms', slow: '500ms' },
        easing: { standard: 'cubic-bezier(0.4, 0, 0.2, 1)', emphasized: 'cubic-bezier(0.25, 0.46, 0.45, 0.94)' }
      },
      breakpoints: {
        mobile: '375px',
        tablet: '768px',
        desktop: '1024px',
        wide: '1440px'
      }
    },
    complianceRequirements: [
      {
        type: 'security',
        standard: 'PCI DSS',
        level: 'Level 1',
        description: 'Payment Card Industry Data Security Standard',
        requirements: [
          'Secure payment processing',
          'Cardholder data protection',
          'Network security',
          'Regular security testing'
        ]
      }
    ],
    useCases: [
      {
        id: 'product-catalog',
        title: 'Product Catalog',
        description: 'Comprehensive product browsing and shopping experience',
        components: ['product-card', 'filter', 'search', 'cart', 'checkout'],
        example: `
<ProductCatalog>
  <SearchAndFilters />
  <ProductGrid products={products} />
  <ShoppingCart items={cartItems} />
</ProductCatalog>`,
        benefits: [
          'Enhanced product discovery',
          'Streamlined checkout process',
          'Mobile-optimized experience',
          'Conversion optimization'
        ]
      }
    ]
  },

  productivity: {
    id: 'productivity',
    name: 'Productivity',
    description: 'Productivity applications focused on efficiency and workflow optimization',
    brandColors: {
      primary: '#059669',
      secondary: '#10B981',
      accent: '#34D399',
      neutral: '#6B7280',
      semantic: {
        success: '#10B981',
        warning: '#F59E0B',
        error: '#EF4444',
        info: '#3B82F6',
        critical: '#DC2626'
      }
    },
    typography: {
      headingFont: 'Inter',
      bodyFont: 'Inter',
      monoFont: 'JetBrains Mono',
      scale: {
        xs: '0.75rem',
        sm: '0.875rem',
        md: '1rem',
        lg: '1.125rem',
        xl: '1.25rem',
        xxl: '1.5rem'
      },
      weights: {
        light: 300,
        regular: 400,
        medium: 500,
        semibold: 600,
        bold: 700
      }
    },
    componentVariants: {},
    designTokens: {
      spacing: {
        compact: { base: '2px', lg: '4px', xl: '8px' },
        comfortable: { base: '6px', lg: '12px', xl: '18px' },
        spacious: { base: '10px', lg: '20px', xl: '30px' }
      },
      shadows: {
        subtle: { sm: '0 1px 2px rgba(5,150,105,0.1)', md: '0 2px 4px rgba(5,150,105,0.15)' },
        prominent: { lg: '0 8px 16px rgba(5,150,105,0.2)', xl: '0 12px 24px rgba(5,150,105,0.25)' },
        dramatic: { '2xl': '0 20px 40px rgba(5,150,105,0.3)' }
      },
      borders: {
        radius: { sm: '3px', md: '6px', lg: '9px' },
        width: { thin: '1px', medium: '2px', thick: '3px' }
      },
      animations: {
        duration: { fast: '100ms', normal: '200ms', slow: '300ms' },
        easing: { standard: 'ease-out', emphasized: 'cubic-bezier(0.4, 0, 0.2, 1)' }
      },
      breakpoints: {
        mobile: '640px',
        tablet: '768px',
        desktop: '1024px',
        wide: '1280px'
      }
    },
    complianceRequirements: [
      {
        type: 'security',
        standard: 'SOC 2',
        level: 'Type II',
        description: 'Service Organization Control 2 for data security',
        requirements: [
          'Data encryption and protection',
          'Access controls and monitoring',
          'System availability and performance',
          'Processing integrity'
        ]
      }
    ],
    useCases: [
      {
        id: 'task-management',
        title: 'Task Management',
        description: 'Comprehensive task and project management interface',
        components: ['task-list', 'kanban', 'calendar', 'timer', 'analytics'],
        example: `
<TaskManager>
  <ProjectOverview projects={projects} />
  <TaskBoard tasks={tasks} />
  <TimeTracker activeTask={currentTask} />
  <ProgressAnalytics data={analytics} />
</TaskManager>`,
        benefits: [
          'Enhanced productivity tracking',
          'Streamlined workflow management',
          'Team collaboration tools',
          'Performance insights'
        ]
      }
    ]
  }
};

// =============================================================================
// INDUSTRY TEMPLATE GENERATOR
// =============================================================================

export class IndustryTemplateGenerator {
  /**
   * Generate industry-specific documentation template
   */
  static generateIndustryTemplate(
    spec: BaseComponentSpec,
    industry: IndustryTheme,
    options: DocumentationOptions
  ): string {
    const industryConfig = INDUSTRY_THEMES[industry];
    
    let template = this.generateIndustryHeader(spec, industryConfig);
    template += this.generateIndustryOverview(spec, industryConfig);
    template += this.generateDesignTokensSection(industryConfig);
    template += this.generateComponentVariantsSection(spec, industryConfig);
    template += this.generateUseCasesSection(industryConfig);
    template += this.generateComplianceSection(industryConfig);
    
    return template;
  }

  /**
   * Generate design tokens documentation
   */
  static generateDesignTokensDoc(industry: IndustryTheme): string {
    const config = INDUSTRY_THEMES[industry];
    
    return `# ${config.name} Design Tokens

Design tokens for ${config.name.toLowerCase()} applications, optimized for ${config.description.toLowerCase()}.

## Color Palette

### Brand Colors

\`\`\`json
{
  "primary": "${config.brandColors.primary}",
  "secondary": "${config.brandColors.secondary}",
  "accent": "${config.brandColors.accent}",
  "neutral": "${config.brandColors.neutral}"
}
\`\`\`

### Semantic Colors

\`\`\`json
${JSON.stringify(config.brandColors.semantic, null, 2)}
\`\`\`

## Typography

### Font Stack

- **Headings**: ${config.typography.headingFont}
- **Body**: ${config.typography.bodyFont}  
- **Monospace**: ${config.typography.monoFont}

### Scale

\`\`\`json
${JSON.stringify(config.typography.scale, null, 2)}
\`\`\`

## Design Tokens

### Spacing

\`\`\`json
${JSON.stringify(config.designTokens.spacing, null, 2)}
\`\`\`

### Shadows

\`\`\`json
${JSON.stringify(config.designTokens.shadows, null, 2)}
\`\`\`

### Borders

\`\`\`json
${JSON.stringify(config.designTokens.borders, null, 2)}
\`\`\`

### Animations

\`\`\`json
${JSON.stringify(config.designTokens.animations, null, 2)}
\`\`\`

## Compliance Requirements

${config.complianceRequirements.map(req => `
### ${req.standard} ${req.level}

**Type**: ${req.type}  
**Description**: ${req.description}

**Requirements**:
${req.requirements.map(r => `- ${r}`).join('\n')}
`).join('\n')}
`;
  }

  private static generateIndustryHeader(spec: BaseComponentSpec, config: IndustryThemeConfig): string {
    return `# ${spec.name} - ${config.name} Theme

${spec.description} optimized for ${config.description.toLowerCase()}.

## Industry Context

${config.description}

### Key Characteristics

- **Trust & Reliability**: Professional appearance that builds confidence
- **Compliance Ready**: Meets industry-specific regulatory requirements  
- **Workflow Optimized**: Designed for efficient task completion
- **Brand Aligned**: Colors and typography that reinforce brand identity

---

`;
  }

  private static generateIndustryOverview(spec: BaseComponentSpec, config: IndustryThemeConfig): string {
    return `## ${config.name} Overview

This component variant is specifically designed for ${config.name.toLowerCase()} applications with the following considerations:

### Brand Colors

| Color | Value | Usage |
|-------|--------|-------|
| Primary | \`${config.brandColors.primary}\` | Main brand color, primary actions |
| Secondary | \`${config.brandColors.secondary}\` | Supporting elements, secondary actions |
| Accent | \`${config.brandColors.accent}\` | Highlights, call-to-action elements |
| Neutral | \`${config.brandColors.neutral}\` | Text, borders, subtle elements |

### Typography

- **Headings**: ${config.typography.headingFont} - Professional and readable
- **Body Text**: ${config.typography.bodyFont} - Optimized for extended reading  
- **Code/Data**: ${config.typography.monoFont} - Clear monospace for technical content

`;
  }

  private static generateDesignTokensSection(config: IndustryThemeConfig): string {
    return `## Design Tokens

### Spacing System

The ${config.name.toLowerCase()} theme uses a carefully calibrated spacing system:

\`\`\`css
/* Compact - for dense interfaces */
--spacing-compact-base: ${config.designTokens.spacing.compact.base};
--spacing-compact-lg: ${config.designTokens.spacing.compact.lg};
--spacing-compact-xl: ${config.designTokens.spacing.compact.xl};

/* Comfortable - for general use */  
--spacing-comfortable-base: ${config.designTokens.spacing.comfortable.base};
--spacing-comfortable-lg: ${config.designTokens.spacing.comfortable.lg};
--spacing-comfortable-xl: ${config.designTokens.spacing.comfortable.xl};

/* Spacious - for marketing and presentation */
--spacing-spacious-base: ${config.designTokens.spacing.spacious.base};
--spacing-spacious-lg: ${config.designTokens.spacing.spacious.lg};
--spacing-spacious-xl: ${config.designTokens.spacing.spacious.xl};
\`\`\`

### Shadow System

\`\`\`css
/* Subtle shadows */
--shadow-subtle-sm: ${config.designTokens.shadows.subtle.sm};
--shadow-subtle-md: ${config.designTokens.shadows.subtle.md};

/* Prominent shadows */
--shadow-prominent-lg: ${config.designTokens.shadows.prominent.lg};
--shadow-prominent-xl: ${config.designTokens.shadows.prominent.xl};
\`\`\`

### Animation Tokens

\`\`\`css
--animation-fast: ${config.designTokens.animations.duration.fast};
--animation-normal: ${config.designTokens.animations.duration.normal};
--animation-slow: ${config.designTokens.animations.duration.slow};

--easing-standard: ${config.designTokens.animations.easing.standard};
--easing-emphasized: ${config.designTokens.animations.easing.emphasized};
\`\`\`

`;
  }

  private static generateComponentVariantsSection(spec: BaseComponentSpec, config: IndustryThemeConfig): string {
    const variants = config.componentVariants[spec.id];
    if (!variants || variants.length === 0) {
      return '';
    }

    let section = `## ${config.name} Component Variants\n\n`;

    variants.forEach(variant => {
      section += `### ${variant.name}\n\n`;
      section += `${variant.description}\n\n`;
      section += `**Use Case**: ${variant.useCase}\n\n`;
      
      section += `**Props**:\n\`\`\`json\n${JSON.stringify(variant.props, null, 2)}\n\`\`\`\n\n`;
      
      section += `**Styling**:\n\`\`\`json\n${JSON.stringify(variant.styling, null, 2)}\n\`\`\`\n\n`;
    });

    return section;
  }

  private static generateUseCasesSection(config: IndustryThemeConfig): string {
    let section = `## ${config.name} Use Cases\n\n`;

    config.useCases.forEach(useCase => {
      section += `### ${useCase.title}\n\n`;
      section += `${useCase.description}\n\n`;
      
      section += `**Components Used**: ${useCase.components.join(', ')}\n\n`;
      
      section += `**Example**:\n\`\`\`tsx${useCase.example}\`\`\`\n\n`;
      
      section += `**Benefits**:\n${useCase.benefits.map(benefit => `- ${benefit}`).join('\n')}\n\n`;
    });

    return section;
  }

  private static generateComplianceSection(config: IndustryThemeConfig): string {
    let section = `## Compliance Requirements\n\n`;
    section += `This ${config.name.toLowerCase()} theme addresses the following compliance requirements:\n\n`;

    config.complianceRequirements.forEach(req => {
      section += `### ${req.standard} (${req.level})\n\n`;
      section += `**Type**: ${req.type}\n`;
      section += `**Description**: ${req.description}\n\n`;
      section += `**Requirements**:\n${req.requirements.map(r => `- ${r}`).join('\n')}\n\n`;
    });

    return section;
  }

  /**
   * Get available industry themes
   */
  static getAvailableIndustries(): IndustryTheme[] {
    return Object.keys(INDUSTRY_THEMES) as IndustryTheme[];
  }

  /**
   * Get industry theme configuration
   */
  static getIndustryConfig(industry: IndustryTheme): IndustryThemeConfig {
    return INDUSTRY_THEMES[industry];
  }
}