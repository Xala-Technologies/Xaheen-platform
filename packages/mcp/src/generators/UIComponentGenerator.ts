/**
 * UI Component Generator for Xala UI System
 */

import type { ComponentConfig } from '../types/index.js';

export class UIComponentGenerator {
  
  generateUIComponent(config: ComponentConfig): string {
    const componentName = this.toPascalCase(config.name);
    const propsInterface = `${componentName}Props`;
    
    return `/**
 * @fileoverview ${componentName} Component - CVA Design System Compliant
 * @description ${componentName} component using CVA pattern with semantic tokens
 * @version 5.0.0
 * @compliance CVA-based, SSR-safe, Framework-agnostic, Token-based
 */

import React from 'react';
import { cva, type VariantProps } from 'class-variance-authority';
import { ${this.getSemanticImports(config)}, cn } from '@xala-technologies/ui-system';
${config.features.icons ? "import { Loader2 } from 'lucide-react';" : ''}

// =============================================================================
// ${componentName.toUpperCase()} VARIANTS USING CVA
// =============================================================================

const ${config.name.toLowerCase()}Variants = cva(
  // Base classes using semantic tokens
  '${this.generateBaseClasses(config)}',
  {
    variants: {
      variant: {
        ${this.generateVariantClasses(config)}
      },
      size: {
        ${this.generateSizeClasses(config)}
      },
    },
    defaultVariants: {
      variant: '${config.styling.variant}',
      size: '${config.size || 'md'}',
    },
  }
);

// =============================================================================
// ${componentName.toUpperCase()} COMPONENT INTERFACE
// =============================================================================

export interface ${propsInterface}
  extends React.HTMLAttributes<HTMLElement>,
    VariantProps<typeof ${config.name.toLowerCase()}Variants> {
  readonly children?: React.ReactNode;
  readonly loading?: boolean;
  readonly disabled?: boolean;
  readonly intent?: ${this.getIntentType(config)};
  readonly semanticElement?: ${this.getSemanticElementType(config)};
  readonly nsmLevel?: 'OPEN' | 'RESTRICTED' | 'CONFIDENTIAL' | 'SECRET';
  readonly 'data-testid'?: string;
}

// =============================================================================
// ${componentName.toUpperCase()} COMPONENT
// =============================================================================

export const ${componentName} = React.forwardRef<HTMLElement, ${propsInterface}>(
  ({
    className,
    variant = '${config.styling.variant}',
    size = '${config.size || 'md'}',
    intent,
    semanticElement,
    loading = false,
    disabled = false,
    nsmLevel,
    children,
    'data-testid': testId,
    ...props
  }, ref) => {
    const isDisabled = disabled || loading;
    const SemanticComponent = ${this.getSemanticComponent(config)};

    return (
      <SemanticComponent
        as={semanticElement}
        intent={intent}
        variant={variant}
        className={cn(${config.name.toLowerCase()}Variants({ variant, size }), className)}
        ref={ref}
        data-testid={testId}
        data-nsm-level={nsmLevel}
        aria-disabled={isDisabled}
        {...props}
      >
        ${this.generateSemanticComponentContent(config)}
      </SemanticComponent>
    );
  }
);

${componentName}.displayName = '${componentName}';
`;
  }

  private generateBaseClasses(config: ComponentConfig): string {
    const baseClasses = [
      'relative',
      'inline-flex',
      'items-center',
      'justify-center',
      'gap-2',
      'rounded-lg',
      'border',
      'bg-card',
      'text-card-foreground',
      'transition-colors',
      'focus-visible:outline-none',
      'focus-visible:ring-2',
      'focus-visible:ring-ring',
      'focus-visible:ring-offset-2',
      'disabled:pointer-events-none',
      'disabled:opacity-50'
    ];

    // Add category-specific base classes
    switch (config.category) {
      case 'layouts':
        baseClasses.push('w-full', 'flex-col');
        break;
      case 'interactive':
        baseClasses.push('cursor-pointer', 'hover:bg-accent');
        break;
      case 'data-display':
        baseClasses.push('p-4', 'shadow-sm');
        break;
    }

    return baseClasses.join(' ');
  }

  private generateVariantClasses(config: ComponentConfig): string {
    const variants = {
      default: 'border-border bg-background hover:bg-accent hover:text-accent-foreground',
      primary: 'border-transparent bg-primary text-primary-foreground hover:bg-primary/90',
      secondary: 'border-transparent bg-secondary text-secondary-foreground hover:bg-secondary/80',
      outline: 'border-border bg-transparent hover:bg-accent hover:text-accent-foreground',
      ghost: 'border-transparent bg-transparent hover:bg-accent hover:text-accent-foreground',
      destructive: 'border-transparent bg-destructive text-destructive-foreground hover:bg-destructive/90',
      success: 'border-transparent bg-success text-success-foreground hover:bg-success/90',
      warning: 'border-transparent bg-warning text-warning-foreground hover:bg-warning/90',
    };

    return Object.entries(variants)
      .map(([key, value]) => `${key}: '${value}'`)
      .join(',\n        ');
  }

  private generateSizeClasses(config: ComponentConfig): string {
    const sizes = {
      sm: 'h-9 px-3 text-sm',
      md: 'h-10 px-4 py-2',
      lg: 'h-11 px-8',
      xl: 'h-12 px-12 text-base',
    };

    return Object.entries(sizes)
      .map(([key, value]) => `${key}: '${value}'`)
      .join(',\n        ');
  }

  private generateEventHandlers(config: ComponentConfig): string {
    const handlers: string[] = [];

    if (config.features.interactive) {
      handlers.push(`  const handleClick = (): void => {
    if (onClick && !disabled && !loading) {
      onClick();
    }
  };`);
    }

    if (config.features.searchable) {
      handlers.push(`  const handleSearch = (query: string): void => {
    // Handle search functionality
    console.log('Search:', query);
  };`);
    }

    if (config.features.collapsible) {
      handlers.push(`  const [isExpanded, setIsExpanded] = useState(false);
  
  const handleToggle = (): void => {
    setIsExpanded(!isExpanded);
  };`);
    }

    return handlers.join('\n\n');
  }

  private generateComponentContent(config: ComponentConfig): string {
    const content: string[] = [];

    if (config.features.loading) {
      content.push(`{loading && (
          <div className="animate-spin rounded-full border-2 border-transparent border-t-current h-4 w-4" />
        )}`);
    }

    if (config.features.interactive) {
      content.push(`{children && (
          <span className="flex-1">
            {children}
          </span>
        )}`);
    } else {
      content.push(`{children}`);
    }

    return content.join('\n        ');
  }

  private getSemanticImports(config: ComponentConfig): string {
    const imports = ['Container']; // Use Container instead of Box
    
    // Add category-specific semantic components
    switch (config.category) {
      case 'layouts':
        imports.push('Stack', 'Grid', 'Section', 'Header', 'Footer');
        break;
      case 'interactive':
        imports.push('Button');
        break;
      case 'form':
        imports.push('Input', 'Button', 'Form');
        break;
      case 'navigation':
        imports.push('Navigation', 'Breadcrumb');
        break;
      case 'feedback':
        imports.push('Alert');
        break;
      case 'data-display':
        imports.push('Typography', 'Card', 'DataTable');
        break;
    }
    
    return imports.join(', ');
  }

  private getSemanticComponent(config: ComponentConfig): string {
    // Return the appropriate semantic component based on category
    switch (config.category) {
      case 'layouts':
        return 'Container';
      case 'interactive':
        return 'Button';
      case 'form':
        return 'Container';
      case 'navigation':
        return 'Navigation';
      case 'feedback':
        return 'Alert';
      case 'data-display':
        return 'Container';
      default:
        return 'Container';
    }
  }

  private getIntentType(config: ComponentConfig): string {
    // Return intent type based on category
    switch (config.category) {
      case 'layouts':
        return "'page' | 'content' | 'sidebar' | 'card' | 'modal'";
      case 'interactive':
        return "'primary' | 'secondary' | 'outline' | 'ghost' | 'destructive'";
      case 'navigation':
        return "'primary' | 'secondary' | 'sidebar' | 'tabs' | 'breadcrumb'";
      case 'feedback':
        return "'info' | 'success' | 'warning' | 'error' | 'loading'";
      case 'data-display':
        return "'body' | 'caption' | 'label' | 'code' | 'emphasis'";
      default:
        return "string";
    }
  }

  private getSemanticElementType(config: ComponentConfig): string {
    // Return semantic element type based on category
    switch (config.category) {
      case 'layouts':
        return "'div' | 'section' | 'article' | 'main' | 'aside' | 'header' | 'footer'";
      case 'interactive':
        return "'button' | 'a'";
      case 'form':
        return "'input' | 'textarea' | 'select' | 'button'";
      case 'navigation':
        return "'nav' | 'ul' | 'ol'";
      case 'data-display':
        return "'div' | 'span' | 'p' | 'h1' | 'h2' | 'h3' | 'h4' | 'h5' | 'h6'";
      default:
        return "'div' | 'span'";
    }
  }

  private generateSemanticComponentContent(config: ComponentConfig): string {
    const content: string[] = [];

    if (config.features.loading) {
      content.push(`{loading && (
          <div className="animate-spin rounded-full border-2 border-transparent border-t-current h-4 w-4" />
        )}`);
    }

    content.push(`{children}`);

    return content.join('\n        ');
  }

  private toPascalCase(str: string): string {
    return str
      .replace(/(?:^\w|[A-Z]|\b\w)/g, (word, index) => {
        return index === 0 ? word.toLowerCase() : word.toUpperCase();
      })
      .replace(/\s+/g, '')
      .replace(/^./, str => str.toUpperCase());
  }
}
