/**
 * Cross-Platform UI Components Generator
 * Generates UI components for multiple platforms with shared business logic
 */

import type { GeneratedFile } from "../../types/index.js";

export interface UIComponentOptions {
	name: string;
	platform:
		| "react"
		| "react-native"
		| "flutter"
		| "swiftui"
		| "vue"
		| "angular";
	componentType: ComponentType;
	features?: ComponentFeature[];
	styling?: {
		framework:
			| "tailwind"
			| "styled-components"
			| "emotion"
			| "css-modules"
			| "native";
		theme?: string;
		darkMode?: boolean;
	};
	accessibility?: {
		wcag: "A" | "AA" | "AAA";
		screenReader: boolean;
		keyboardNavigation: boolean;
	};
	testing?: {
		unit: boolean;
		integration: boolean;
		e2e: boolean;
		visual: boolean;
	};
}

export type ComponentType =
	| "button"
	| "form"
	| "card"
	| "modal"
	| "navigation"
	| "table"
	| "chart"
	| "list"
	| "grid"
	| "carousel"
	| "accordion"
	| "tabs"
	| "dropdown"
	| "datepicker"
	| "autocomplete";

export type ComponentFeature =
	| "responsive"
	| "animated"
	| "draggable"
	| "sortable"
	| "filterable"
	| "searchable"
	| "paginated"
	| "virtualized"
	| "lazy-loaded"
	| "optimistic-ui"
	| "real-time"
	| "offline-support";

export class UIComponentsGenerator {
	async generate(options: UIComponentOptions): Promise<GeneratedFile[]> {
		const files: GeneratedFile[] = [];

		// Generate platform-specific component
		switch (options.platform) {
			case "react":
				files.push(...(await this.generateReactComponent(options)));
				break;
			case "react-native":
				files.push(...(await this.generateReactNativeComponent(options)));
				break;
			case "flutter":
				files.push(...(await this.generateFlutterComponent(options)));
				break;
			case "swiftui":
				files.push(...(await this.generateSwiftUIComponent(options)));
				break;
			case "vue":
				files.push(...(await this.generateVueComponent(options)));
				break;
			case "angular":
				files.push(...(await this.generateAngularComponent(options)));
				break;
		}

		// Add shared business logic
		files.push(...this.generateSharedLogic(options));

		// Add tests if requested
		if (options.testing?.unit) {
			files.push(...this.generateUnitTests(options));
		}

		return files;
	}

	private async generateReactComponent(
		options: UIComponentOptions,
	): Promise<GeneratedFile[]> {
		const files: GeneratedFile[] = [];
		const componentName = this.toPascalCase(options.name);

		// Main component file
		files.push({
			path: `${options.name}/components/${componentName}.tsx`,
			content: this.generateReactComponentContent(options),
			type: "create",
		});

		// Styles
		if (options.styling?.framework === "tailwind") {
			files.push({
				path: `${options.name}/components/${componentName}.styles.ts`,
				content: this.generateTailwindStyles(options),
				type: "create",
			});
		}

		// Hooks
		files.push({
			path: `${options.name}/hooks/use${componentName}.ts`,
			content: this.generateReactHook(options),
			type: "create",
		});

		// Types
		files.push({
			path: `${options.name}/types/${componentName}.types.ts`,
			content: this.generateTypeDefinitions(options),
			type: "create",
		});

		return files;
	}

	private generateReactComponentContent(options: UIComponentOptions): string {
		const componentName = this.toPascalCase(options.name);
		const wcagLevel = options.accessibility?.wcag || "AA";

		return `import React, { useState, useCallback, useMemo, useRef, useEffect } from 'react';
import { ${componentName}Props, ${componentName}State } from '../types/${componentName}.types';
import { use${componentName} } from '../hooks/use${componentName}';
import { cn } from '../utils/cn';

/**
 * ${componentName} Component
 * ${this.getComponentDescription(options.componentType)}
 * WCAG ${wcagLevel} Compliant
 */
export const ${componentName} = React.forwardRef<
  HTMLDivElement,
  ${componentName}Props
>(({ 
  className,
  children,
  variant = 'default',
  size = 'medium',
  disabled = false,
  loading = false,
  onAction,
  ...props
}, ref) => {
  const {
    state,
    handlers,
    accessibility,
  } = use${componentName}({
    disabled,
    loading,
    onAction,
  });

  ${this.generateComponentBody(options)}

  return (
    <div
      ref={ref}
      className={cn(
        '${this.getBaseClasses(options.componentType)}',
        {
          '${this.getVariantClasses("default")}': variant === 'default',
          '${this.getVariantClasses("primary")}': variant === 'primary',
          '${this.getVariantClasses("secondary")}': variant === 'secondary',
          '${this.getSizeClasses("small")}': size === 'small',
          '${this.getSizeClasses("medium")}': size === 'medium',
          '${this.getSizeClasses("large")}': size === 'large',
          'opacity-50 cursor-not-allowed': disabled,
          'animate-pulse': loading,
        },
        className
      )}
      role="${this.getAriaRole(options.componentType)}"
      aria-disabled={disabled}
      aria-busy={loading}
      aria-label={accessibility.label}
      aria-describedby={accessibility.describedby}
      tabIndex={disabled ? -1 : 0}
      onKeyDown={handlers.onKeyDown}
      onClick={handlers.onClick}
      {...accessibility.attributes}
      {...props}
    >
      ${this.generateComponentContent(options)}
    </div>
  );
});

${componentName}.displayName = '${componentName}';

// Compound components for complex structures
${this.generateCompoundComponents(options)}`;
	}

	private generateReactHook(options: UIComponentOptions): string {
		const componentName = this.toPascalCase(options.name);

		return `import { useState, useCallback, useEffect, useRef } from 'react';
import { ${componentName}Props, ${componentName}State } from '../types/${componentName}.types';

export interface Use${componentName}Options {
  disabled?: boolean;
  loading?: boolean;
  onAction?: (action: string, data?: any) => void;
}

export function use${componentName}(options: Use${componentName}Options) {
  const [state, setState] = useState<${componentName}State>({
    isOpen: false,
    selectedIndex: -1,
    focusedIndex: -1,
    error: null,
    data: null,
  });

  const containerRef = useRef<HTMLDivElement>(null);
  const itemRefs = useRef<Map<number, HTMLElement>>(new Map());

  // Keyboard navigation
  const handleKeyDown = useCallback((event: React.KeyboardEvent) => {
    if (options.disabled) return;

    switch (event.key) {
      case 'Enter':
      case ' ':
        event.preventDefault();
        options.onAction?.('select', state.focusedIndex);
        break;
      
      case 'ArrowDown':
        event.preventDefault();
        setState(prev => ({
          ...prev,
          focusedIndex: Math.min(prev.focusedIndex + 1, itemRefs.current.size - 1),
        }));
        break;
      
      case 'ArrowUp':
        event.preventDefault();
        setState(prev => ({
          ...prev,
          focusedIndex: Math.max(prev.focusedIndex - 1, 0),
        }));
        break;
      
      case 'Escape':
        setState(prev => ({ ...prev, isOpen: false }));
        break;
      
      case 'Home':
        event.preventDefault();
        setState(prev => ({ ...prev, focusedIndex: 0 }));
        break;
      
      case 'End':
        event.preventDefault();
        setState(prev => ({ ...prev, focusedIndex: itemRefs.current.size - 1 }));
        break;
    }
  }, [options.disabled, options.onAction, state.focusedIndex]);

  // Click handler
  const handleClick = useCallback((event: React.MouseEvent) => {
    if (options.disabled) return;
    
    setState(prev => ({ ...prev, isOpen: !prev.isOpen }));
    options.onAction?.('click', event);
  }, [options.disabled, options.onAction]);

  // Focus management
  useEffect(() => {
    const element = itemRefs.current.get(state.focusedIndex);
    element?.focus();
  }, [state.focusedIndex]);

  // Accessibility attributes
  const accessibility = {
    label: 'Interactive ${options.componentType} component',
    describedby: \`\${options.name}-description\`,
    attributes: {
      'aria-expanded': state.isOpen,
      'aria-haspopup': ${options.componentType === "dropdown" ? "true" : "false"},
      'aria-controls': \`\${options.name}-content\`,
    },
  };

  return {
    state,
    setState,
    handlers: {
      onKeyDown: handleKeyDown,
      onClick: handleClick,
    },
    refs: {
      containerRef,
      itemRefs,
    },
    accessibility,
  };
}`;
	}

	private generateTypeDefinitions(options: UIComponentOptions): string {
		const componentName = this.toPascalCase(options.name);

		return `import { ReactNode, HTMLAttributes } from 'react';

export interface ${componentName}Props extends HTMLAttributes<HTMLDivElement> {
  readonly variant?: 'default' | 'primary' | 'secondary' | 'outline' | 'ghost';
  readonly size?: 'small' | 'medium' | 'large';
  readonly disabled?: boolean;
  readonly loading?: boolean;
  readonly children?: ReactNode;
  readonly onAction?: (action: string, data?: any) => void;
  readonly className?: string;
  readonly testId?: string;
}

export interface ${componentName}State {
  readonly isOpen: boolean;
  readonly selectedIndex: number;
  readonly focusedIndex: number;
  readonly error: Error | null;
  readonly data: any;
}

export interface ${componentName}Item {
  readonly id: string;
  readonly label: string;
  readonly value: any;
  readonly disabled?: boolean;
  readonly icon?: ReactNode;
  readonly description?: string;
}

export interface ${componentName}Context {
  readonly state: ${componentName}State;
  readonly dispatch: (action: ${componentName}Action) => void;
}

export type ${componentName}Action =
  | { type: 'OPEN' }
  | { type: 'CLOSE' }
  | { type: 'TOGGLE' }
  | { type: 'SELECT'; payload: number }
  | { type: 'FOCUS'; payload: number }
  | { type: 'SET_ERROR'; payload: Error }
  | { type: 'SET_DATA'; payload: any }
  | { type: 'RESET' };`;
	}

	private generateTailwindStyles(options: UIComponentOptions): string {
		return `/**
 * Tailwind CSS styles for ${options.name} component
 */

export const styles = {
  base: 'relative inline-flex items-center justify-center font-medium transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2',
  
  variants: {
    default: 'bg-white text-gray-900 border border-gray-300 hover:bg-gray-50',
    primary: 'bg-blue-600 text-white hover:bg-blue-700 focus:ring-blue-500',
    secondary: 'bg-gray-600 text-white hover:bg-gray-700 focus:ring-gray-500',
    outline: 'border-2 border-current bg-transparent hover:bg-gray-50',
    ghost: 'bg-transparent hover:bg-gray-100',
  },
  
  sizes: {
    small: 'h-8 px-3 text-sm rounded-md',
    medium: 'h-10 px-4 text-base rounded-lg',
    large: 'h-12 px-6 text-lg rounded-xl',
  },
  
  states: {
    disabled: 'opacity-50 cursor-not-allowed pointer-events-none',
    loading: 'animate-pulse cursor-wait',
    active: 'ring-2 ring-offset-2',
    error: 'border-red-500 text-red-700',
  },
  
  responsive: {
    mobile: 'w-full sm:w-auto',
    tablet: 'md:px-6 md:py-3',
    desktop: 'lg:px-8 lg:py-4',
  },
};

export const animations = {
  fadeIn: 'animate-in fade-in duration-200',
  fadeOut: 'animate-out fade-out duration-150',
  slideDown: 'animate-in slide-in-from-top-2 duration-200',
  slideUp: 'animate-out slide-out-to-top-2 duration-150',
  scaleIn: 'animate-in zoom-in-95 duration-200',
  scaleOut: 'animate-out zoom-out-95 duration-150',
};`;
	}

	private async generateReactNativeComponent(
		options: UIComponentOptions,
	): Promise<GeneratedFile[]> {
		const files: GeneratedFile[] = [];
		const componentName = this.toPascalCase(options.name);

		files.push({
			path: `${options.name}/components/${componentName}.tsx`,
			content: this.generateReactNativeContent(options),
			type: "create",
		});

		return files;
	}

	private generateReactNativeContent(options: UIComponentOptions): string {
		const componentName = this.toPascalCase(options.name);

		return `import React, { useState, useCallback } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
  AccessibilityInfo,
  Platform,
} from 'react-native';

interface ${componentName}Props {
  onPress?: () => void;
  disabled?: boolean;
  loading?: boolean;
  variant?: 'primary' | 'secondary' | 'outline';
  size?: 'small' | 'medium' | 'large';
  children?: React.ReactNode;
  testID?: string;
}

export const ${componentName}: React.FC<${componentName}Props> = ({
  onPress,
  disabled = false,
  loading = false,
  variant = 'primary',
  size = 'medium',
  children,
  testID,
}) => {
  const [pressed, setPressed] = useState(false);

  const handlePressIn = useCallback(() => {
    setPressed(true);
  }, []);

  const handlePressOut = useCallback(() => {
    setPressed(false);
  }, []);

  const buttonStyles = [
    styles.base,
    styles[variant],
    styles[\`size\${size.charAt(0).toUpperCase() + size.slice(1)}\`],
    pressed && styles.pressed,
    disabled && styles.disabled,
  ];

  return (
    <TouchableOpacity
      style={buttonStyles}
      onPress={onPress}
      onPressIn={handlePressIn}
      onPressOut={handlePressOut}
      disabled={disabled || loading}
      activeOpacity={0.8}
      accessible={true}
      accessibilityRole="button"
      accessibilityState={{
        disabled: disabled || loading,
        busy: loading,
      }}
      testID={testID}
    >
      {loading ? (
        <ActivityIndicator color={variant === 'primary' ? '#fff' : '#000'} />
      ) : (
        <View style={styles.content}>
          {children}
        </View>
      )}
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  base: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 8,
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
      },
      android: {
        elevation: 3,
      },
    }),
  },
  primary: {
    backgroundColor: '#3B82F6',
  },
  secondary: {
    backgroundColor: '#6B7280',
  },
  outline: {
    backgroundColor: 'transparent',
    borderWidth: 2,
    borderColor: '#3B82F6',
  },
  sizeSmall: {
    paddingVertical: 8,
    paddingHorizontal: 12,
  },
  sizeMedium: {
    paddingVertical: 12,
    paddingHorizontal: 16,
  },
  sizeLarge: {
    paddingVertical: 16,
    paddingHorizontal: 24,
  },
  pressed: {
    opacity: 0.8,
    transform: [{ scale: 0.98 }],
  },
  disabled: {
    opacity: 0.5,
  },
  content: {
    flexDirection: 'row',
    alignItems: 'center',
  },
});`;
	}

	private async generateFlutterComponent(
		options: UIComponentOptions,
	): Promise<GeneratedFile[]> {
		const files: GeneratedFile[] = [];
		const componentName = this.toSnakeCase(options.name);

		files.push({
			path: `${options.name}/lib/widgets/${componentName}.dart`,
			content: this.generateFlutterContent(options),
			type: "create",
		});

		return files;
	}

	private generateFlutterContent(options: UIComponentOptions): string {
		const className = this.toPascalCase(options.name);

		return `import 'package:flutter/material.dart';
import 'package:flutter/semantics.dart';

enum ${className}Variant { primary, secondary, outline }
enum ${className}Size { small, medium, large }

class ${className} extends StatefulWidget {
  final VoidCallback? onPressed;
  final Widget child;
  final ${className}Variant variant;
  final ${className}Size size;
  final bool disabled;
  final bool loading;
  final String? semanticLabel;

  const ${className}({
    Key? key,
    required this.child,
    this.onPressed,
    this.variant = ${className}Variant.primary,
    this.size = ${className}Size.medium,
    this.disabled = false,
    this.loading = false,
    this.semanticLabel,
  }) : super(key: key);

  @override
  _${className}State createState() => _${className}State();
}

class _${className}State extends State<${className}> with SingleTickerProviderStateMixin {
  late AnimationController _animationController;
  late Animation<double> _scaleAnimation;
  bool _isPressed = false;

  @override
  void initState() {
    super.initState();
    _animationController = AnimationController(
      duration: const Duration(milliseconds: 150),
      vsync: this,
    );
    _scaleAnimation = Tween<double>(
      begin: 1.0,
      end: 0.95,
    ).animate(CurvedAnimation(
      parent: _animationController,
      curve: Curves.easeInOut,
    ));
  }

  @override
  void dispose() {
    _animationController.dispose();
    super.dispose();
  }

  void _handleTapDown(TapDownDetails details) {
    setState(() => _isPressed = true);
    _animationController.forward();
  }

  void _handleTapUp(TapUpDetails details) {
    setState(() => _isPressed = false);
    _animationController.reverse();
  }

  void _handleTapCancel() {
    setState(() => _isPressed = false);
    _animationController.reverse();
  }

  @override
  Widget build(BuildContext context) {
    final theme = Theme.of(context);
    final isDisabled = widget.disabled || widget.loading;

    return Semantics(
      button: true,
      enabled: !isDisabled,
      label: widget.semanticLabel,
      child: GestureDetector(
        onTapDown: isDisabled ? null : _handleTapDown,
        onTapUp: isDisabled ? null : _handleTapUp,
        onTapCancel: isDisabled ? null : _handleTapCancel,
        onTap: isDisabled ? null : widget.onPressed,
        child: AnimatedBuilder(
          animation: _scaleAnimation,
          builder: (context, child) {
            return Transform.scale(
              scale: _scaleAnimation.value,
              child: Container(
                padding: _getPadding(),
                decoration: BoxDecoration(
                  color: _getBackgroundColor(theme),
                  borderRadius: BorderRadius.circular(_getBorderRadius()),
                  border: widget.variant == ${className}Variant.outline
                      ? Border.all(color: theme.primaryColor, width: 2)
                      : null,
                  boxShadow: [
                    if (!isDisabled && widget.variant != ${className}Variant.outline)
                      BoxShadow(
                        color: Colors.black.withOpacity(0.1),
                        blurRadius: 4,
                        offset: const Offset(0, 2),
                      ),
                  ],
                ),
                child: widget.loading
                    ? SizedBox(
                        width: _getLoadingSize(),
                        height: _getLoadingSize(),
                        child: CircularProgressIndicator(
                          strokeWidth: 2,
                          valueColor: AlwaysStoppedAnimation<Color>(
                            _getContentColor(theme),
                          ),
                        ),
                      )
                    : DefaultTextStyle(
                        style: TextStyle(
                          color: _getContentColor(theme),
                          fontSize: _getFontSize(),
                          fontWeight: FontWeight.w600,
                        ),
                        child: widget.child,
                      ),
              ),
            );
          },
        ),
      ),
    );
  }

  EdgeInsets _getPadding() {
    switch (widget.size) {
      case ${className}Size.small:
        return const EdgeInsets.symmetric(horizontal: 12, vertical: 8);
      case ${className}Size.medium:
        return const EdgeInsets.symmetric(horizontal: 16, vertical: 12);
      case ${className}Size.large:
        return const EdgeInsets.symmetric(horizontal: 24, vertical: 16);
    }
  }

  double _getBorderRadius() {
    switch (widget.size) {
      case ${className}Size.small:
        return 6;
      case ${className}Size.medium:
        return 8;
      case ${className}Size.large:
        return 12;
    }
  }

  double _getFontSize() {
    switch (widget.size) {
      case ${className}Size.small:
        return 14;
      case ${className}Size.medium:
        return 16;
      case ${className}Size.large:
        return 18;
    }
  }

  double _getLoadingSize() {
    switch (widget.size) {
      case ${className}Size.small:
        return 16;
      case ${className}Size.medium:
        return 20;
      case ${className}Size.large:
        return 24;
    }
  }

  Color _getBackgroundColor(ThemeData theme) {
    if (widget.disabled || widget.loading) {
      return Colors.grey.withOpacity(0.3);
    }
    switch (widget.variant) {
      case ${className}Variant.primary:
        return theme.primaryColor;
      case ${className}Variant.secondary:
        return theme.colorScheme.secondary;
      case ${className}Variant.outline:
        return Colors.transparent;
    }
  }

  Color _getContentColor(ThemeData theme) {
    if (widget.variant == ${className}Variant.outline) {
      return theme.primaryColor;
    }
    return Colors.white;
  }
}`;
	}

	private async generateSwiftUIComponent(
		options: UIComponentOptions,
	): Promise<GeneratedFile[]> {
		const files: GeneratedFile[] = [];
		const componentName = this.toPascalCase(options.name);

		files.push({
			path: `${options.name}/${componentName}.swift`,
			content: this.generateSwiftUIContent(options),
			type: "create",
		});

		return files;
	}

	private generateSwiftUIContent(options: UIComponentOptions): string {
		const componentName = this.toPascalCase(options.name);

		return `import SwiftUI

struct ${componentName}: View {
    let title: String
    let action: () -> Void
    
    @State private var isPressed = false
    @Environment(\\.isEnabled) private var isEnabled
    
    var variant: Variant = .primary
    var size: Size = .medium
    var isLoading: Bool = false
    
    enum Variant {
        case primary, secondary, outline
    }
    
    enum Size {
        case small, medium, large
        
        var padding: EdgeInsets {
            switch self {
            case .small:
                return EdgeInsets(top: 8, leading: 12, bottom: 8, trailing: 12)
            case .medium:
                return EdgeInsets(top: 12, leading: 16, bottom: 12, trailing: 16)
            case .large:
                return EdgeInsets(top: 16, leading: 24, bottom: 16, trailing: 24)
            }
        }
        
        var fontSize: Font {
            switch self {
            case .small:
                return .subheadline
            case .medium:
                return .body
            case .large:
                return .title3
            }
        }
    }
    
    var body: some View {
        Button(action: action) {
            if isLoading {
                ProgressView()
                    .progressViewStyle(CircularProgressViewStyle())
                    .scaleEffect(size == .small ? 0.8 : 1.0)
            } else {
                Text(title)
                    .font(size.fontSize)
                    .fontWeight(.semibold)
            }
        }
        .padding(size.padding)
        .background(backgroundColor)
        .foregroundColor(foregroundColor)
        .overlay(
            RoundedRectangle(cornerRadius: cornerRadius)
                .stroke(borderColor, lineWidth: variant == .outline ? 2 : 0)
        )
        .cornerRadius(cornerRadius)
        .scaleEffect(isPressed ? 0.95 : 1.0)
        .animation(.easeInOut(duration: 0.15), value: isPressed)
        .onLongPressGesture(minimumDuration: 0, maximumDistance: .infinity, pressing: { pressing in
            isPressed = pressing
        }, perform: {})
        .shadow(color: .black.opacity(isEnabled ? 0.1 : 0), radius: 4, x: 0, y: 2)
        .disabled(isLoading)
        .accessibility(label: Text(title))
        .accessibility(addTraits: .isButton)
    }
    
    private var backgroundColor: Color {
        guard isEnabled && !isLoading else {
            return Color.gray.opacity(0.3)
        }
        switch variant {
        case .primary:
            return Color.blue
        case .secondary:
            return Color.gray
        case .outline:
            return Color.clear
        }
    }
    
    private var foregroundColor: Color {
        guard isEnabled && !isLoading else {
            return Color.gray
        }
        switch variant {
        case .primary, .secondary:
            return .white
        case .outline:
            return .blue
        }
    }
    
    private var borderColor: Color {
        guard isEnabled && !isLoading else {
            return Color.gray.opacity(0.3)
        }
        return variant == .outline ? .blue : .clear
    }
    
    private var cornerRadius: CGFloat {
        switch size {
        case .small:
            return 6
        case .medium:
            return 8
        case .large:
            return 12
        }
    }
}

// Preview Provider
struct ${componentName}_Previews: PreviewProvider {
    static var previews: some View {
        VStack(spacing: 20) {
            ${componentName}(title: "Primary Button", action: {})
            
            ${componentName}(title: "Secondary", action: {}, variant: .secondary)
            
            ${componentName}(title: "Outline", action: {}, variant: .outline)
            
            ${componentName}(title: "Small", action: {}, size: .small)
            
            ${componentName}(title: "Loading", action: {}, isLoading: true)
            
            ${componentName}(title: "Disabled", action: {})
                .disabled(true)
        }
        .padding()
    }
}`;
	}

	private async generateVueComponent(
		options: UIComponentOptions,
	): Promise<GeneratedFile[]> {
		return [];
	}

	private async generateAngularComponent(
		options: UIComponentOptions,
	): Promise<GeneratedFile[]> {
		return [];
	}

	private generateSharedLogic(options: UIComponentOptions): GeneratedFile[] {
		return [
			{
				path: `${options.name}/core/business-logic.ts`,
				content: this.generateBusinessLogic(options),
				type: "create",
			},
			{
				path: `${options.name}/core/validation.ts`,
				content: this.generateValidation(options),
				type: "create",
			},
		];
	}

	private generateBusinessLogic(options: UIComponentOptions): string {
		return `/**
 * Shared business logic for ${options.name} component
 * Platform-agnostic implementation
 */

export class ${this.toPascalCase(options.name)}Logic {
  private state: ComponentState = {
    value: null,
    errors: [],
    touched: false,
    dirty: false,
  };

  private validators: Validator[] = [];
  private subscribers: Set<StateSubscriber> = new Set();

  /**
   * Initialize component logic
   */
  constructor(initialValue?: any) {
    if (initialValue !== undefined) {
      this.state.value = initialValue;
    }
  }

  /**
   * Get current state
   */
  getState(): Readonly<ComponentState> {
    return { ...this.state };
  }

  /**
   * Update value
   */
  setValue(value: any): void {
    const oldValue = this.state.value;
    this.state.value = value;
    this.state.dirty = true;
    
    // Run validation
    this.validate();
    
    // Notify subscribers
    this.notifySubscribers({
      type: 'VALUE_CHANGED',
      oldValue,
      newValue: value,
    });
  }

  /**
   * Add validator
   */
  addValidator(validator: Validator): void {
    this.validators.push(validator);
  }

  /**
   * Validate current value
   */
  validate(): ValidationResult {
    const errors: ValidationError[] = [];
    
    for (const validator of this.validators) {
      const result = validator(this.state.value);
      if (result !== true) {
        errors.push(result);
      }
    }
    
    this.state.errors = errors;
    return {
      valid: errors.length === 0,
      errors,
    };
  }

  /**
   * Subscribe to state changes
   */
  subscribe(subscriber: StateSubscriber): () => void {
    this.subscribers.add(subscriber);
    
    // Return unsubscribe function
    return () => {
      this.subscribers.delete(subscriber);
    };
  }

  /**
   * Notify all subscribers
   */
  private notifySubscribers(event: StateEvent): void {
    this.subscribers.forEach(subscriber => {
      subscriber(this.state, event);
    });
  }

  /**
   * Reset to initial state
   */
  reset(): void {
    this.state = {
      value: null,
      errors: [],
      touched: false,
      dirty: false,
    };
    
    this.notifySubscribers({ type: 'RESET' });
  }

  /**
   * Mark as touched
   */
  touch(): void {
    this.state.touched = true;
    this.notifySubscribers({ type: 'TOUCHED' });
  }
}

// Type definitions
interface ComponentState {
  value: any;
  errors: ValidationError[];
  touched: boolean;
  dirty: boolean;
}

interface ValidationError {
  code: string;
  message: string;
  field?: string;
}

interface ValidationResult {
  valid: boolean;
  errors: ValidationError[];
}

type Validator = (value: any) => true | ValidationError;

type StateSubscriber = (state: ComponentState, event: StateEvent) => void;

interface StateEvent {
  type: 'VALUE_CHANGED' | 'RESET' | 'TOUCHED' | 'VALIDATED';
  oldValue?: any;
  newValue?: any;
}`;
	}

	private generateValidation(options: UIComponentOptions): string {
		return `/**
 * Validation utilities for ${options.name} component
 */

export const validators = {
  required: (message = 'This field is required') => (value: any) => {
    if (value === null || value === undefined || value === '') {
      return { code: 'REQUIRED', message };
    }
    return true;
  },

  minLength: (min: number, message?: string) => (value: string) => {
    if (value && value.length < min) {
      return {
        code: 'MIN_LENGTH',
        message: message || \`Minimum length is \${min}\`,
      };
    }
    return true;
  },

  maxLength: (max: number, message?: string) => (value: string) => {
    if (value && value.length > max) {
      return {
        code: 'MAX_LENGTH',
        message: message || \`Maximum length is \${max}\`,
      };
    }
    return true;
  },

  pattern: (regex: RegExp, message = 'Invalid format') => (value: string) => {
    if (value && !regex.test(value)) {
      return { code: 'PATTERN', message };
    }
    return true;
  },

  email: (message = 'Invalid email address') => (value: string) => {
    const emailRegex = /^[^\\s@]+@[^\\s@]+\\.[^\\s@]+$/;
    if (value && !emailRegex.test(value)) {
      return { code: 'EMAIL', message };
    }
    return true;
  },

  norwegianPhone: (message = 'Invalid Norwegian phone number') => (value: string) => {
    const phoneRegex = /^(\\+47)?[49]\\d{7}$/;
    const cleaned = value?.replace(/[\\s-]/g, '');
    if (cleaned && !phoneRegex.test(cleaned)) {
      return { code: 'PHONE', message };
    }
    return true;
  },

  norwegianSSN: (message = 'Invalid Norwegian SSN') => (value: string) => {
    if (!value || value.length !== 11) {
      return { code: 'SSN', message };
    }
    
    // Validate using MOD11 algorithm
    const weights1 = [3, 7, 6, 1, 8, 9, 4, 5, 2];
    const weights2 = [5, 4, 3, 2, 7, 6, 5, 4, 3, 2];
    
    let sum1 = 0;
    for (let i = 0; i < 9; i++) {
      sum1 += parseInt(value[i]) * weights1[i];
    }
    
    const checkDigit1 = 11 - (sum1 % 11);
    if (checkDigit1 === 11) checkDigit1 = 0;
    
    if (checkDigit1 !== parseInt(value[9])) {
      return { code: 'SSN', message };
    }
    
    return true;
  },

  custom: (validator: (value: any) => boolean, message = 'Validation failed') => (value: any) => {
    if (!validator(value)) {
      return { code: 'CUSTOM', message };
    }
    return true;
  },
};

// Compose multiple validators
export function compose(...validators: any[]) {
  return (value: any) => {
    for (const validator of validators) {
      const result = validator(value);
      if (result !== true) {
        return result;
      }
    }
    return true;
  };
}`;
	}

	private generateUnitTests(options: UIComponentOptions): GeneratedFile[] {
		return [
			{
				path: `${options.name}/__tests__/${options.name}.test.tsx`,
				content: this.generateTestContent(options),
				type: "create",
			},
		];
	}

	private generateTestContent(options: UIComponentOptions): string {
		const componentName = this.toPascalCase(options.name);

		return `import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { ${componentName} } from '../components/${componentName}';
import { ${componentName}Logic } from '../core/business-logic';
import { validators } from '../core/validation';

describe('${componentName}', () => {
  describe('Rendering', () => {
    it('should render with default props', () => {
      render(<${componentName} />);
      expect(screen.getByRole('${this.getAriaRole(options.componentType)}')).toBeInTheDocument();
    });

    it('should render with custom className', () => {
      render(<${componentName} className="custom-class" />);
      expect(screen.getByRole('${this.getAriaRole(options.componentType)}')).toHaveClass('custom-class');
    });

    it('should render in disabled state', () => {
      render(<${componentName} disabled />);
      expect(screen.getByRole('${this.getAriaRole(options.componentType)}')).toHaveAttribute('aria-disabled', 'true');
    });

    it('should render in loading state', () => {
      render(<${componentName} loading />);
      expect(screen.getByRole('${this.getAriaRole(options.componentType)}')).toHaveAttribute('aria-busy', 'true');
    });
  });

  describe('Interactions', () => {
    it('should handle click events', async () => {
      const handleAction = jest.fn();
      render(<${componentName} onAction={handleAction} />);
      
      await userEvent.click(screen.getByRole('${this.getAriaRole(options.componentType)}'));
      expect(handleAction).toHaveBeenCalledWith('click', expect.any(Object));
    });

    it('should handle keyboard navigation', async () => {
      const handleAction = jest.fn();
      render(<${componentName} onAction={handleAction} />);
      
      const element = screen.getByRole('${this.getAriaRole(options.componentType)}');
      element.focus();
      
      fireEvent.keyDown(element, { key: 'Enter' });
      expect(handleAction).toHaveBeenCalledWith('select', expect.any(Number));
      
      fireEvent.keyDown(element, { key: 'Escape' });
      fireEvent.keyDown(element, { key: 'ArrowDown' });
      fireEvent.keyDown(element, { key: 'ArrowUp' });
    });

    it('should not trigger actions when disabled', async () => {
      const handleAction = jest.fn();
      render(<${componentName} disabled onAction={handleAction} />);
      
      await userEvent.click(screen.getByRole('${this.getAriaRole(options.componentType)}'));
      expect(handleAction).not.toHaveBeenCalled();
    });
  });

  describe('Accessibility', () => {
    it('should have proper ARIA attributes', () => {
      render(<${componentName} />);
      const element = screen.getByRole('${this.getAriaRole(options.componentType)}');
      
      expect(element).toHaveAttribute('tabIndex', '0');
      expect(element).toHaveAttribute('aria-label');
    });

    it('should support keyboard focus', () => {
      render(<${componentName} />);
      const element = screen.getByRole('${this.getAriaRole(options.componentType)}');
      
      element.focus();
      expect(element).toHaveFocus();
    });

    it('should have -1 tabIndex when disabled', () => {
      render(<${componentName} disabled />);
      const element = screen.getByRole('${this.getAriaRole(options.componentType)}');
      
      expect(element).toHaveAttribute('tabIndex', '-1');
    });
  });

  describe('Business Logic', () => {
    let logic: ${componentName}Logic;

    beforeEach(() => {
      logic = new ${componentName}Logic();
    });

    it('should update value', () => {
      logic.setValue('test value');
      expect(logic.getState().value).toBe('test value');
      expect(logic.getState().dirty).toBe(true);
    });

    it('should validate required field', () => {
      logic.addValidator(validators.required());
      
      const result1 = logic.validate();
      expect(result1.valid).toBe(false);
      
      logic.setValue('value');
      const result2 = logic.validate();
      expect(result2.valid).toBe(true);
    });

    it('should notify subscribers on state change', () => {
      const subscriber = jest.fn();
      logic.subscribe(subscriber);
      
      logic.setValue('new value');
      expect(subscriber).toHaveBeenCalledWith(
        expect.objectContaining({ value: 'new value' }),
        expect.objectContaining({ type: 'VALUE_CHANGED' })
      );
    });

    it('should reset state', () => {
      logic.setValue('value');
      logic.touch();
      logic.reset();
      
      const state = logic.getState();
      expect(state.value).toBeNull();
      expect(state.touched).toBe(false);
      expect(state.dirty).toBe(false);
    });
  });
});`;
	}

	// Helper methods
	private toPascalCase(str: string): string {
		return str
			.split(/[-_\s]/)
			.map((word) => word.charAt(0).toUpperCase() + word.slice(1))
			.join("");
	}

	private toSnakeCase(str: string): string {
		return str
			.replace(/[A-Z]/g, (letter) => `_${letter.toLowerCase()}`)
			.slice(1);
	}

	private getComponentDescription(type: ComponentType): string {
		const descriptions: Record<ComponentType, string> = {
			button: "Interactive button component with multiple variants",
			form: "Form component with validation and submission handling",
			card: "Card component for displaying content",
			modal: "Modal dialog component",
			navigation: "Navigation component with routing support",
			table: "Data table with sorting and filtering",
			chart: "Chart component for data visualization",
			list: "List component with virtualization support",
			grid: "Grid layout component",
			carousel: "Carousel component for image/content sliding",
			accordion: "Accordion component for collapsible content",
			tabs: "Tabs component for content organization",
			dropdown: "Dropdown select component",
			datepicker: "Date picker component",
			autocomplete: "Autocomplete input component",
		};
		return descriptions[type] || "UI component";
	}

	private getBaseClasses(type: ComponentType): string {
		const classes: Record<ComponentType, string> = {
			button: "inline-flex items-center justify-center font-medium rounded-lg",
			form: "w-full space-y-4",
			card: "bg-white rounded-xl shadow-lg p-6",
			modal: "fixed inset-0 z-50 flex items-center justify-center",
			navigation: "flex items-center space-x-4",
			table: "w-full divide-y divide-gray-200",
			chart: "w-full h-64",
			list: "divide-y divide-gray-200",
			grid: "grid gap-4",
			carousel: "relative overflow-hidden",
			accordion: "divide-y divide-gray-200",
			tabs: "border-b border-gray-200",
			dropdown: "relative inline-block text-left",
			datepicker: "relative",
			autocomplete: "relative",
		};
		return classes[type] || "";
	}

	private getVariantClasses(variant: string): string {
		const classes: Record<string, string> = {
			default: "bg-white text-gray-900 border border-gray-300 hover:bg-gray-50",
			primary: "bg-blue-600 text-white hover:bg-blue-700",
			secondary: "bg-gray-600 text-white hover:bg-gray-700",
		};
		return classes[variant] || "";
	}

	private getSizeClasses(size: string): string {
		const classes: Record<string, string> = {
			small: "h-8 px-3 text-sm",
			medium: "h-10 px-4 text-base",
			large: "h-12 px-6 text-lg",
		};
		return classes[size] || "";
	}

	private getAriaRole(type: ComponentType): string {
		const roles: Record<ComponentType, string> = {
			button: "button",
			form: "form",
			card: "article",
			modal: "dialog",
			navigation: "navigation",
			table: "table",
			chart: "img",
			list: "list",
			grid: "grid",
			carousel: "region",
			accordion: "region",
			tabs: "tablist",
			dropdown: "combobox",
			datepicker: "textbox",
			autocomplete: "combobox",
		};
		return roles[type] || "region";
	}

	private generateComponentBody(options: UIComponentOptions): string {
		// Generate component-specific body based on type
		return `  // Component state and logic
  const [internalState, setInternalState] = useState(state);

  // Effects
  useEffect(() => {
    // Component initialization
  }, []);`;
	}

	private generateComponentContent(options: UIComponentOptions): string {
		// Generate component-specific content
		return `{loading && <span className="animate-spin">⟳</span>}
      {children}`;
	}

	private generateCompoundComponents(options: UIComponentOptions): string {
		// Generate compound components for complex structures
		if (options.componentType === "card") {
			return `
export const ${this.toPascalCase(options.name)}Header = ({ children, ...props }: any) => (
  <div className="border-b border-gray-200 pb-4 mb-4" {...props}>
    {children}
  </div>
);

export const ${this.toPascalCase(options.name)}Body = ({ children, ...props }: any) => (
  <div className="py-4" {...props}>
    {children}
  </div>
);

export const ${this.toPascalCase(options.name)}Footer = ({ children, ...props }: any) => (
  <div className="border-t border-gray-200 pt-4 mt-4" {...props}>
    {children}
  </div>
);`;
		}
		return "";
	}
}
