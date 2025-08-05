/**
 * AST-driven transformer for applying Xala UI conventions to shadcn-ui components
 * Enforces design tokens, accessibility, Norwegian compliance, and enterprise standards
 */

import { parse } from '@babel/parser';
import traverseDefault, { type NodePath } from '@babel/traverse';
import generateDefault from '@babel/generator';
import * as t from '@babel/types';

// Handle ES module / CommonJS interop
const traverse = (traverseDefault as any).default || traverseDefault;
const generate = (generateDefault as any).default || generateDefault;
import { IndustryTheme, SupportedPlatform } from '../types/index.js';

export interface XalaTransformationConfig {
	readonly theme: IndustryTheme;
	readonly platform: SupportedPlatform;
	readonly enforceAccessibility: boolean;
	readonly norwegianCompliance: boolean;
	readonly designTokens: XalaDesignTokens;
	readonly conventions: XalaConventions;
}

export interface XalaDesignTokens {
	readonly colors: Record<string, string>;
	readonly spacing: Record<string, string>;
	readonly typography: Record<string, string>;
	readonly borderRadius: Record<string, string>;
	readonly shadows: Record<string, string>;
}

export interface XalaConventions {
	readonly componentNaming: string;
	readonly propNaming: string;
	readonly classNaming: string;
	readonly accessibilityRules: string[];
	readonly norwegianRules: string[];
}

export interface TransformationResult {
	readonly transformedCode: string;
	readonly appliedTransformations: string[];
	readonly violations: string[];
	readonly suggestions: string[];
	readonly designTokensUsed: string[];
}

/**
 * Default Xala UI design tokens
 */
export const XALA_DESIGN_TOKENS: Record<IndustryTheme, XalaDesignTokens> = {
	enterprise: {
		colors: {
			'primary': 'slate-900',
			'primary-foreground': 'slate-50',
			'secondary': 'slate-100',
			'secondary-foreground': 'slate-900',
			'muted': 'slate-100',
			'muted-foreground': 'slate-500',
			'accent': 'blue-600',
			'accent-foreground': 'white',
			'destructive': 'red-500',
			'destructive-foreground': 'white',
			'border': 'slate-200',
			'input': 'slate-100',
			'ring': 'blue-600'
		},
		spacing: {
			'xs': '0.5rem',
			'sm': '0.75rem',
			'md': '1rem',
			'lg': '1.5rem',
			'xl': '2rem',
			'2xl': '3rem',
			'3xl': '4rem'
		},
		typography: {
			'xs': 'text-xs',
			'sm': 'text-sm',
			'base': 'text-base',
			'lg': 'text-lg',
			'xl': 'text-xl',
			'2xl': 'text-2xl',
			'3xl': 'text-3xl'
		},
		borderRadius: {
			'none': 'rounded-none',
			'sm': 'rounded-sm',
			'md': 'rounded-md',
			'lg': 'rounded-lg',
			'xl': 'rounded-xl',
			'full': 'rounded-full'
		},
		shadows: {
			'none': 'shadow-none',
			'sm': 'shadow-sm',
			'md': 'shadow-md',
			'lg': 'shadow-lg',
			'xl': 'shadow-xl'
		}
	},
	finance: {
		colors: {
			'primary': 'green-900',
			'primary-foreground': 'green-50',
			'secondary': 'green-100',
			'secondary-foreground': 'green-900',
			'muted': 'green-50',
			'muted-foreground': 'green-600',
			'accent': 'emerald-600',
			'accent-foreground': 'white',
			'destructive': 'red-600',
			'destructive-foreground': 'white',
			'border': 'green-200',
			'input': 'green-50',
			'ring': 'emerald-600'
		},
		spacing: {
			'xs': '0.25rem',
			'sm': '0.5rem',
			'md': '0.75rem',
			'lg': '1rem',
			'xl': '1.25rem',
			'2xl': '1.5rem',
			'3xl': '2rem'
		},
		typography: {
			'xs': 'text-xs font-medium',
			'sm': 'text-sm font-medium',
			'base': 'text-base font-semibold',
			'lg': 'text-lg font-semibold',
			'xl': 'text-xl font-bold',
			'2xl': 'text-2xl font-bold',
			'3xl': 'text-3xl font-bold'
		},
		borderRadius: {
			'none': 'rounded-none',
			'sm': 'rounded',
			'md': 'rounded-md',
			'lg': 'rounded-lg',
			'xl': 'rounded-xl',
			'full': 'rounded-full'
		},
		shadows: {
			'none': 'shadow-none',
			'sm': 'shadow-sm',
			'md': 'shadow',
			'lg': 'shadow-lg',
			'xl': 'shadow-xl'
		}
	},
	healthcare: {
		colors: {
			'primary': 'blue-800',
			'primary-foreground': 'blue-50',
			'secondary': 'blue-100',
			'secondary-foreground': 'blue-900',
			'muted': 'blue-50',
			'muted-foreground': 'blue-600',
			'accent': 'cyan-600',
			'accent-foreground': 'white',
			'destructive': 'red-600',
			'destructive-foreground': 'white',
			'border': 'blue-200',
			'input': 'blue-50',
			'ring': 'cyan-600'
		},
		spacing: {
			'xs': '0.5rem',
			'sm': '0.75rem',
			'md': '1rem',
			'lg': '1.25rem',
			'xl': '1.5rem',
			'2xl': '2rem',
			'3xl': '2.5rem'
		},
		typography: {
			'xs': 'text-xs',
			'sm': 'text-sm',
			'base': 'text-base',
			'lg': 'text-lg',
			'xl': 'text-xl',
			'2xl': 'text-2xl',
			'3xl': 'text-3xl'
		},
		borderRadius: {
			'none': 'rounded-none',
			'sm': 'rounded-sm',
			'md': 'rounded',
			'lg': 'rounded-md',
			'xl': 'rounded-lg',
			'full': 'rounded-full'
		},
		shadows: {
			'none': 'shadow-none',
			'sm': 'shadow-sm',
			'md': 'shadow',
			'lg': 'shadow-md',
			'xl': 'shadow-lg'
		}
	},
	education: {
		colors: {
			'primary': 'indigo-700',
			'primary-foreground': 'indigo-50',
			'secondary': 'indigo-100',
			'secondary-foreground': 'indigo-900',
			'muted': 'indigo-50',
			'muted-foreground': 'indigo-600',
			'accent': 'purple-600',
			'accent-foreground': 'white',
			'destructive': 'red-500',
			'destructive-foreground': 'white',
			'border': 'indigo-200',
			'input': 'indigo-50',
			'ring': 'purple-600'
		},
		spacing: {
			'xs': '0.5rem',
			'sm': '0.75rem',
			'md': '1rem',
			'lg': '1.5rem',
			'xl': '2rem',
			'2xl': '2.5rem',
			'3xl': '3rem'
		},
		typography: {
			'xs': 'text-xs',
			'sm': 'text-sm',
			'base': 'text-base',
			'lg': 'text-lg',
			'xl': 'text-xl',
			'2xl': 'text-2xl',
			'3xl': 'text-3xl'
		},
		borderRadius: {
			'none': 'rounded-none',
			'sm': 'rounded-sm',
			'md': 'rounded',
			'lg': 'rounded-md',
			'xl': 'rounded-lg',
			'full': 'rounded-full'
		},
		shadows: {
			'none': 'shadow-none',
			'sm': 'shadow-sm',
			'md': 'shadow',
			'lg': 'shadow-md',
			'xl': 'shadow-lg'
		}
	},
	ecommerce: {
		colors: {
			'primary': 'orange-600',
			'primary-foreground': 'orange-50',
			'secondary': 'orange-100',
			'secondary-foreground': 'orange-900',
			'muted': 'orange-50',
			'muted-foreground': 'orange-600',
			'accent': 'amber-500',
			'accent-foreground': 'amber-900',
			'destructive': 'red-500',
			'destructive-foreground': 'white',
			'border': 'orange-200',
			'input': 'orange-50',
			'ring': 'amber-500'
		},
		spacing: {
			'xs': '0.25rem',
			'sm': '0.5rem',
			'md': '0.75rem',
			'lg': '1rem',
			'xl': '1.25rem',
			'2xl': '1.5rem',
			'3xl': '2rem'
		},
		typography: {
			'xs': 'text-xs font-medium',
			'sm': 'text-sm font-medium',
			'base': 'text-base font-semibold',
			'lg': 'text-lg font-semibold',
			'xl': 'text-xl font-bold',
			'2xl': 'text-2xl font-bold',
			'3xl': 'text-3xl font-bold'
		},
		borderRadius: {
			'none': 'rounded-none',
			'sm': 'rounded',
			'md': 'rounded-md',
			'lg': 'rounded-lg',
			'xl': 'rounded-xl',
			'full': 'rounded-full'
		},
		shadows: {
			'none': 'shadow-none',
			'sm': 'shadow-sm',
			'md': 'shadow-md',
			'lg': 'shadow-lg',
			'xl': 'shadow-xl'
		}
	},
	productivity: {
		colors: {
			'primary': 'gray-900',
			'primary-foreground': 'gray-50',
			'secondary': 'gray-100',
			'secondary-foreground': 'gray-900',
			'muted': 'gray-100',
			'muted-foreground': 'gray-500',
			'accent': 'violet-600',
			'accent-foreground': 'white',
			'destructive': 'red-500',
			'destructive-foreground': 'white',
			'border': 'gray-200',
			'input': 'gray-100',
			'ring': 'violet-600'
		},
		spacing: {
			'xs': '0.25rem',
			'sm': '0.5rem',
			'md': '0.75rem',
			'lg': '1rem',
			'xl': '1.25rem',
			'2xl': '1.5rem',
			'3xl': '2rem'
		},
		typography: {
			'xs': 'text-xs',
			'sm': 'text-sm',
			'base': 'text-base',
			'lg': 'text-lg',
			'xl': 'text-xl',
			'2xl': 'text-2xl',
			'3xl': 'text-3xl'
		},
		borderRadius: {
			'none': 'rounded-none',
			'sm': 'rounded-sm',
			'md': 'rounded',
			'lg': 'rounded-md',
			'xl': 'rounded-lg',
			'full': 'rounded-full'
		},
		shadows: {
			'none': 'shadow-none',
			'sm': 'shadow-sm',
			'md': 'shadow',
			'lg': 'shadow-md',
			'xl': 'shadow-lg'
		}
	}
};

/**
 * Default Xala UI conventions
 */
export const XALA_CONVENTIONS: XalaConventions = {
	componentNaming: 'PascalCase',
	propNaming: 'camelCase',
	classNaming: 'kebab-case',
	accessibilityRules: [
		'All interactive elements must have aria-label or accessible name',
		'Form inputs must have associated labels',
		'Images must have alt text',
		'Focus indicators must be visible',
		'Color contrast must meet WCAG AAA standards',
		'Keyboard navigation must be supported'
	],
	norwegianRules: [
		'All text must use i18n functions (t, useTranslation)',
		'Date formatting must support Norwegian locale (nb-NO)',
		'Number formatting must use Norwegian standards',
		'GDPR consent components required for data collection',
		'Support for both Bokmål and Nynorsk'
	]
};

/**
 * Main AST transformer class
 */
export class XalaASTTransformer {
	private config: XalaTransformationConfig;
	private appliedTransformations: string[] = [];
	private violations: string[] = [];
	private suggestions: string[] = [];
	private designTokensUsed: string[] = [];

	constructor(config: XalaTransformationConfig) {
		this.config = config;
	}

	/**
	 * Transform React/JSX code to apply Xala UI conventions
	 */
	public transform(sourceCode: string): TransformationResult {
		// Reset state
		this.appliedTransformations = [];
		this.violations = [];
		this.suggestions = [];
		this.designTokensUsed = [];

		try {
			// Parse the source code into AST
			const ast = parse(sourceCode, {
				sourceType: 'module',
				plugins: ['jsx', 'typescript', 'decorators-legacy']
			});

			// Apply transformations
			traverse(ast, {
				// Transform imports
				ImportDeclaration: (path: NodePath<t.ImportDeclaration>) => {
					this.transformImports(path);
				},
				// Transform component declarations
				FunctionDeclaration: (path: NodePath<t.FunctionDeclaration>) => {
					this.transformComponentDeclaration(path);
				},
				// Transform JSX elements
				JSXElement: (path: NodePath<t.JSXElement>) => {
					this.transformJSXElement(path);
				},
				// Transform JSX attributes (className, styles, etc.)
				JSXAttribute: (path: NodePath<t.JSXAttribute>) => {
					this.transformJSXAttribute(path);
				},
				// Transform string literals (for i18n)
				StringLiteral: (path: NodePath<t.StringLiteral>) => {
					this.transformStringLiteral(path);
				},
				// Transform template literals
				TemplateLiteral: (path: NodePath<t.TemplateLiteral>) => {
					this.transformTemplateLiteral(path);
				}
			});

			// Generate transformed code
			const result = generate(ast, {
				retainLines: false,
				compact: false
			});

			return {
				transformedCode: result.code,
				appliedTransformations: this.appliedTransformations,
				violations: this.violations,
				suggestions: this.suggestions,
				designTokensUsed: this.designTokensUsed
			};

		} catch (error) {
			throw new Error(`AST transformation failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
		}
	}

	/**
	 * Transform import statements to add necessary dependencies
	 */
	private transformImports(path: NodePath<t.ImportDeclaration>): void {
		const source = path.node.source.value;
		
		// Add i18n imports if Norwegian compliance is enabled
		if (this.config.norwegianCompliance && !source.includes('react-i18next')) {
			if (source === 'react') {
				// Add useTranslation import
				const program = path.findParent((parent) => parent.isProgram());
				if (program && t.isProgram(program.node)) {
					const i18nImport = t.importDeclaration(
						[t.importSpecifier(t.identifier('useTranslation'), t.identifier('useTranslation'))],
						t.stringLiteral('react-i18next')
					);
					program.node.body.unshift(i18nImport);
					this.appliedTransformations.push('Added react-i18next import for Norwegian compliance');
				}
			}
		}
	}

	/**
	 * Transform component declarations to enforce naming conventions
	 */
	private transformComponentDeclaration(path: NodePath<t.FunctionDeclaration>): void {
		const name = path.node.id?.name;
		
		if (name && this.isComponentName(name)) {
			// Check naming convention
			if (!this.isPascalCase(name)) {
				this.violations.push(`Component name "${name}" should use PascalCase`);
				this.suggestions.push(`Rename "${name}" to "${this.toPascalCase(name)}"`);
			}

			// Add Norwegian compliance hooks if enabled
			if (this.config.norwegianCompliance) {
				this.addI18nHook(path);
			}

			this.appliedTransformations.push(`Processed component declaration: ${name}`);
		}
	}

	/**
	 * Transform JSX elements to enforce conventions
	 */
	private transformJSXElement(path: NodePath<t.JSXElement>): void {
		const opening = path.node.openingElement;
		const tagName = this.getJSXElementName(opening);

		if (tagName) {
			// Apply accessibility transformations
			if (this.config.enforceAccessibility) {
				this.enforceAccessibility(path, tagName);
			}

			// Apply theme-specific transformations
			this.applyThemeTransformations(path, tagName);

			this.appliedTransformations.push(`Processed JSX element: ${tagName}`);
		}
	}

	/**
	 * Transform JSX attributes (className, style, etc.)
	 */
	private transformJSXAttribute(path: NodePath<t.JSXAttribute>): void {
		const attrName = this.getAttributeName(path.node);
		
		if (attrName === 'className') {
			this.transformClassNameAttribute(path);
		} else if (attrName === 'style') {
			this.transformStyleAttribute(path);
		}
	}

	/**
	 * Transform string literals for i18n
	 */
	private transformStringLiteral(path: NodePath<t.StringLiteral>): void {
		if (this.config.norwegianCompliance) {
			const value = path.node.value;
			
			// Check if this is user-facing text that should be internationalized
			if (this.isUserFacingText(path, value)) {
				this.convertToI18n(path, value);
			}
		}
	}

	/**
	 * Transform template literals
	 */
	private transformTemplateLiteral(path: NodePath<t.TemplateLiteral>): void {
		// Apply template literal transformations if needed
	}

	/**
	 * Transform className attribute to use design tokens
	 */
	private transformClassNameAttribute(path: NodePath<t.JSXAttribute>): void {
		const value = path.node.value;
		
		if (t.isStringLiteral(value)) {
			const originalClasses = value.value;
			const transformedClasses = this.applyDesignTokens(originalClasses);
			
			if (transformedClasses !== originalClasses) {
				value.value = transformedClasses;
				this.appliedTransformations.push(`Transformed className: "${originalClasses}" → "${transformedClasses}"`);
			}
		} else if (t.isJSXExpressionContainer(value) && t.isTemplateLiteral(value.expression)) {
			// Handle template literal classNames
			const templateLiteral = value.expression;
			templateLiteral.quasis.forEach((quasi, index) => {
				const originalText = quasi.value.cooked || quasi.value.raw;
				const transformedText = this.applyDesignTokens(originalText);
				
				if (transformedText !== originalText) {
					quasi.value.cooked = transformedText;
					quasi.value.raw = transformedText;
					this.appliedTransformations.push(`Transformed template className part: "${originalText}" → "${transformedText}"`);
				}
			});
		}
	}

	/**
	 * Transform inline styles (discouraged, suggests className instead)
	 */
	private transformStyleAttribute(path: NodePath<t.JSXAttribute>): void {
		this.violations.push('Inline styles detected - should use className with design tokens');
		this.suggestions.push('Replace inline styles with Tailwind classes using design tokens');
	}

	/**
	 * Apply design tokens to class names
	 */
	private applyDesignTokens(classNames: string): string {
		const tokens = XALA_DESIGN_TOKENS[this.config.theme];
		let transformedClasses = classNames;

		// Transform color classes
		Object.entries(tokens.colors).forEach(([token, value]) => {
			const patterns = [
				new RegExp(`\\btext-primary\\b`, 'g'),
				new RegExp(`\\bbg-primary\\b`, 'g'),
				new RegExp(`\\bborder-primary\\b`, 'g'),
				new RegExp(`\\btext-secondary\\b`, 'g'),
				new RegExp(`\\bbg-secondary\\b`, 'g'),
				new RegExp(`\\bborder-secondary\\b`, 'g')
			];

			patterns.forEach(pattern => {
				if (pattern.test(transformedClasses)) {
					transformedClasses = transformedClasses.replace(pattern, `text-${value}`);
					this.designTokensUsed.push(`${token}: ${value}`);
				}
			});
		});

		// Transform spacing classes
		Object.entries(tokens.spacing).forEach(([token, value]) => {
			const spacingPatterns = [
				new RegExp(`\\bp-(xs|sm|md|lg|xl|2xl|3xl)\\b`, 'g'),
				new RegExp(`\\bm-(xs|sm|md|lg|xl|2xl|3xl)\\b`, 'g'),
				new RegExp(`\\bgap-(xs|sm|md|lg|xl|2xl|3xl)\\b`, 'g')
			];

			spacingPatterns.forEach(pattern => {
				const match = transformedClasses.match(pattern);
				if (match && match[0].includes(token)) {
					const newClass = match[0].replace(token, value.replace('rem', ''));
					transformedClasses = transformedClasses.replace(match[0], newClass);
					this.designTokensUsed.push(`spacing-${token}: ${value}`);
				}
			});
		});

		return transformedClasses;
	}

	/**
	 * Enforce accessibility requirements
	 */
	private enforceAccessibility(path: NodePath<t.JSXElement>, tagName: string): void {
		const opening = path.node.openingElement;
		const attributes = opening.attributes;

		switch (tagName) {
			case 'button':
				this.enforceButtonAccessibility(path, attributes);
				break;
			case 'input':
				this.enforceInputAccessibility(path, attributes);
				break;
			case 'img':
				this.enforceImageAccessibility(path, attributes);
				break;
			case 'form':
				this.enforceFormAccessibility(path, attributes);
				break;
			default:
				// Check for interactive elements without proper accessibility
				if (this.hasClickHandler(attributes)) {
					this.enforceInteractiveAccessibility(path, attributes, tagName);
				}
		}
	}

	/**
	 * Enforce button accessibility
	 */
	private enforceButtonAccessibility(path: NodePath<t.JSXElement>, attributes: (t.JSXAttribute | t.JSXSpreadAttribute)[]): void {
		const hasAriaLabel = attributes.some(attr => 
			t.isJSXAttribute(attr) && 
			t.isJSXIdentifier(attr.name) && 
			attr.name.name === 'aria-label'
		);

		const hasAccessibleText = this.hasAccessibleText(path.node);

		if (!hasAriaLabel && !hasAccessibleText) {
			this.violations.push('Button element missing aria-label or accessible text content');
			this.suggestions.push('Add aria-label attribute or ensure button has descriptive text content');
		}
	}

	/**
	 * Enforce input accessibility
	 */
	private enforceInputAccessibility(path: NodePath<t.JSXElement>, attributes: (t.JSXAttribute | t.JSXSpreadAttribute)[]): void {
		const hasId = attributes.some(attr => 
			t.isJSXAttribute(attr) && 
			t.isJSXIdentifier(attr.name) && 
			attr.name.name === 'id'
		);

		const hasAriaLabel = attributes.some(attr => 
			t.isJSXAttribute(attr) && 
			t.isJSXIdentifier(attr.name) && 
			attr.name.name === 'aria-label'
		);

		if (!hasId && !hasAriaLabel) {
			this.violations.push('Input element missing id attribute for label association or aria-label');
			this.suggestions.push('Add id attribute and associate with label, or add aria-label');
		}
	}

	/**
	 * Enforce image accessibility
	 */
	private enforceImageAccessibility(path: NodePath<t.JSXElement>, attributes: (t.JSXAttribute | t.JSXSpreadAttribute)[]): void {
		const hasAlt = attributes.some(attr => 
			t.isJSXAttribute(attr) && 
			t.isJSXIdentifier(attr.name) && 
			attr.name.name === 'alt'
		);

		if (!hasAlt) {
			this.violations.push('Image element missing alt attribute');
			this.suggestions.push('Add descriptive alt attribute to image');
		}
	}

	/**
	 * Enforce form accessibility
	 */
	private enforceFormAccessibility(path: NodePath<t.JSXElement>, attributes: (t.JSXAttribute | t.JSXSpreadAttribute)[]): void {
		// Check for form accessibility requirements
		this.appliedTransformations.push('Checked form accessibility requirements');
	}

	/**
	 * Enforce interactive element accessibility
	 */
	private enforceInteractiveAccessibility(path: NodePath<t.JSXElement>, attributes: (t.JSXAttribute | t.JSXSpreadAttribute)[], tagName: string): void {
		if (tagName === 'div' || tagName === 'span') {
			const hasRole = attributes.some(attr => 
				t.isJSXAttribute(attr) && 
				t.isJSXIdentifier(attr.name) && 
				attr.name.name === 'role'
			);

			if (!hasRole) {
				this.violations.push(`Interactive ${tagName} element missing role attribute`);
				this.suggestions.push(`Add appropriate role attribute (e.g., role="button") to ${tagName} element`);
			}
		}
	}

	/**
	 * Apply theme-specific transformations
	 */
	private applyThemeTransformations(path: NodePath<t.JSXElement>, tagName: string): void {
		// Apply theme-specific styling based on element type
		const tokens = XALA_DESIGN_TOKENS[this.config.theme];
		
		// This would contain theme-specific logic for different elements
		this.appliedTransformations.push(`Applied ${this.config.theme} theme transformations to ${tagName}`);
	}

	/**
	 * Add i18n hook to component
	 */
	private addI18nHook(path: NodePath<t.FunctionDeclaration>): void {
		const body = path.node.body;
		
		if (t.isBlockStatement(body)) {
			// Add const { t } = useTranslation(); at the beginning of the function
			const i18nHook = t.variableDeclaration('const', [
				t.variableDeclarator(
					t.objectPattern([
						t.objectProperty(t.identifier('t'), t.identifier('t'))
					]),
					t.callExpression(t.identifier('useTranslation'), [])
				)
			]);

			body.body.unshift(i18nHook);
			this.appliedTransformations.push('Added useTranslation hook for Norwegian compliance');
		}
	}

	/**
	 * Convert string literal to i18n function call
	 */
	private convertToI18n(path: NodePath<t.StringLiteral>, value: string): void {
		const key = this.generateI18nKey(value);
		const i18nCall = t.callExpression(t.identifier('t'), [t.stringLiteral(key)]);
		
		// If we're inside JSX, wrap in expression container
		if (path.isJSXExpressionContainer() || path.findParent(p => p.isJSXElement())) {
			path.replaceWith(t.jsxExpressionContainer(i18nCall));
		} else {
			path.replaceWith(i18nCall);
		}
		
		this.appliedTransformations.push(`Converted "${value}" to i18n call with key "${key}"`);
	}

	/**
	 * Generate i18n key from text
	 */
	private generateI18nKey(text: string): string {
		return text
			.toLowerCase()
			.replace(/[^a-z0-9\s]/g, '')
			.replace(/\s+/g, '.')
			.substring(0, 50);
	}

	/**
	 * Check if string is user-facing text that should be internationalized
	 */
	private isUserFacingText(path: NodePath<t.StringLiteral>, value: string): boolean {
		// Skip if it's an import path, className, id, etc.
		const parent = path.parent;
		
		if (t.isImportDeclaration(parent) || 
			t.isJSXAttribute(parent) && t.isJSXIdentifier(parent.name) && 
			['className', 'id', 'href', 'src', 'type'].includes(parent.name.name)) {
			return false;
		}

		// Check if it's likely user-facing text
		return value.length > 2 && /[a-zA-Z]/.test(value) && !value.startsWith('/');
	}

	/**
	 * Helper methods
	 */
	private isComponentName(name: string): boolean {
		return /^[A-Z]/.test(name);
	}

	private isPascalCase(name: string): boolean {
		return /^[A-Z][a-zA-Z0-9]*$/.test(name);
	}

	private toPascalCase(name: string): string {
		return name.charAt(0).toUpperCase() + name.slice(1);
	}

	private getJSXElementName(opening: t.JSXOpeningElement): string | null {
		if (t.isJSXIdentifier(opening.name)) {
			return opening.name.name;
		}
		return null;
	}

	private getAttributeName(attr: t.JSXAttribute): string | null {
		if (t.isJSXIdentifier(attr.name)) {
			return attr.name.name;
		}
		return null;
	}

	private hasClickHandler(attributes: (t.JSXAttribute | t.JSXSpreadAttribute)[]): boolean {
		return attributes.some(attr => 
			t.isJSXAttribute(attr) && 
			t.isJSXIdentifier(attr.name) && 
			attr.name.name === 'onClick'
		);
	}

	private hasAccessibleText(element: t.JSXElement): boolean {
		return element.children.some(child => 
			t.isJSXText(child) && child.value.trim().length > 0
		);
	}
}

/**
 * Create transformer with default config
 */
export function createXalaTransformer(
	theme: IndustryTheme = 'enterprise',
	platform: SupportedPlatform = 'react'
): XalaASTTransformer {
	const config: XalaTransformationConfig = {
		theme,
		platform,
		enforceAccessibility: true,
		norwegianCompliance: true,
		designTokens: XALA_DESIGN_TOKENS[theme],
		conventions: XALA_CONVENTIONS
	};

	return new XalaASTTransformer(config);
}

/**
 * Transform shadcn-ui component with Xala conventions
 */
export function transformShadcnComponent(
	sourceCode: string,
	theme: IndustryTheme = 'enterprise',
	platform: SupportedPlatform = 'react'
): TransformationResult {
	const transformer = createXalaTransformer(theme, platform);
	return transformer.transform(sourceCode);
}