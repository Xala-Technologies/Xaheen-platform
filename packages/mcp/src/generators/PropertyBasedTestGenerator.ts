/**
 * Property-Based Testing Generator for Xala UI System
 * Generates comprehensive property-based tests using Fast-check/Jest
 * Part of EPIC 8 Story 8.5: Advanced Testing Automation
 */

import type { ComponentConfig } from "../types/index.js";

export interface PropertyBasedTestConfig {
	readonly componentName: string;
	readonly specification: any;
	readonly framework: "jest" | "vitest";
	readonly testTypes: readonly (
		| "property-based"
		| "fuzz"
		| "model-based"
		| "invariant"
		| "regression"
	)[];
	readonly properties: readonly PropertyTestDefinition[];
	readonly modelChecking?: ModelCheckingConfig;
	readonly regressionTests?: readonly RegressionTestCase[];
}

export interface PropertyTestDefinition {
	readonly name: string;
	readonly description: string;
	readonly property: string;
	readonly generators: readonly PropertyGenerator[];
	readonly preconditions?: readonly string[];
	readonly postconditions?: readonly string[];
	readonly invariants?: readonly string[];
}

export interface PropertyGenerator {
	readonly name: string;
	readonly type: "primitive" | "object" | "array" | "custom";
	readonly definition: string;
	readonly constraints?: Record<string, any>;
}

export interface ModelCheckingConfig {
	readonly enabled: boolean;
	readonly stateModel: string;
	readonly actions: readonly ModelAction[];
	readonly properties: readonly string[];
}

export interface ModelAction {
	readonly name: string;
	readonly precondition: string;
	readonly effect: string;
	readonly generator: string;
}

export interface RegressionTestCase {
	readonly name: string;
	readonly input: any;
	readonly expectedOutput: any;
	readonly bugDescription: string;
}

export class PropertyBasedTestGenerator {
	/**
	 * Generate comprehensive property-based tests using Fast-check
	 */
	public async generatePropertyBasedTests(
		config: PropertyBasedTestConfig
	): Promise<string> {
		const { componentName, specification, framework, testTypes } = config;

		const imports = this.generateImports(framework, testTypes);
		const generators = this.generatePropertyGenerators(config);
		const propertyTests = this.generatePropertyTests(config);
		const modelTests = this.generateModelBasedTests(config);
		const fuzzTests = this.generateFuzzTests(config);
		const invariantTests = this.generateInvariantTests(config);
		const regressionTests = this.generateRegressionTests(config);

		return `${imports}

/**
 * Property-Based Tests for ${componentName}
 * Framework: ${framework}
 * Test Types: ${testTypes.join(", ")}
 * 
 * Generated using Fast-check for property-based testing
 * Includes fuzz testing, model checking, and invariant verification
 */

${generators}

describe('${componentName} - Property-Based Tests', () => {
  ${testTypes.includes("property-based") ? propertyTests : ""}
  
  ${testTypes.includes("model-based") ? modelTests : ""}
  
  ${testTypes.includes("fuzz") ? fuzzTests : ""}
  
  ${testTypes.includes("invariant") ? invariantTests : ""}
  
  ${testTypes.includes("regression") ? regressionTests : ""}
});

// Norwegian compliance property tests
describe('${componentName} - Norwegian Compliance Properties', () => {
  ${this.generateNorwegianComplianceTests(config)}
});

// Performance property tests
describe('${componentName} - Performance Properties', () => {
  ${this.generatePerformancePropertyTests(config)}
});

// Accessibility property tests  
describe('${componentName} - Accessibility Properties', () => {
  ${this.generateAccessibilityPropertyTests(config)}
});`;
	}

	private generateImports(
		framework: string,
		testTypes: readonly string[]
	): string {
		const baseImports = `
import React from 'react';
import { render, screen, fireEvent, cleanup } from '@testing-library/react';
import * as fc from 'fast-check';`;

		const frameworkImports =
			framework === "vitest"
				? `
import { describe, it, expect, beforeEach, afterEach } from 'vitest';`
				: "";

		const testTypeImports = testTypes.includes("model-based")
			? `
import { StateMachine, interpret } from 'xstate';
import { createMachine } from 'xstate';`
			: "";

		return `${baseImports}${frameworkImports}${testTypeImports}

// Component under test
import { ${this.getComponentName()} } from '../${this.getComponentName()}';

// Test utilities
import { createTestWrapper, generateTestData } from '../__tests__/utils/test-helpers';`;
	}

	private generatePropertyGenerators(config: PropertyBasedTestConfig): string {
		if (!config.properties?.length) {
			return this.generateDefaultGenerators(config);
		}

		return `
// Property Generators
${config.properties
	.flatMap((prop) => prop.generators)
	.map((gen) => this.generatePropertyGenerator(gen))
	.join("\n")}

// Composite generators for complex props
const componentPropsGenerator = fc.record({
  ${this.generateComponentPropsGenerators(config)}
});

// State generators for stateful components
const componentStateGenerator = fc.record({
  ${this.generateStateGenerators(config)}
});`;
	}

	private generateDefaultGenerators(config: PropertyBasedTestConfig): string {
		return `
// Default Property Generators
const stringProp = fc.string({ minLength: 0, maxLength: 100 });
const numberProp = fc.integer({ min: 0, max: 1000 });
const booleanProp = fc.boolean();
const arrayProp = fc.array(fc.string(), { maxLength: 10 });
const objectProp = fc.record({
  id: fc.uuid(),
  name: stringProp,
  value: numberProp
});

// Component-specific generators
const ${config.componentName.toLowerCase()}Props = fc.record({
  ${this.inferPropsFromSpecification(config.specification)}
});

// Event generators
const eventGenerator = fc.record({
  type: fc.constantFrom('click', 'focus', 'blur', 'keydown', 'keyup'),
  target: fc.record({
    value: stringProp,
    checked: booleanProp
  })
});`;
	}

	private generatePropertyGenerator(generator: PropertyGenerator): string {
		switch (generator.type) {
			case "primitive":
				return `const ${generator.name} = ${generator.definition};`;

			case "object":
				return `const ${generator.name} = fc.record(${generator.definition});`;

			case "array":
				return `const ${generator.name} = fc.array(${generator.definition}, { maxLength: 20 });`;

			case "custom":
				return `const ${generator.name} = ${generator.definition};`;

			default:
				return `const ${generator.name} = fc.anything();`;
		}
	}

	private generatePropertyTests(config: PropertyBasedTestConfig): string {
		if (!config.properties?.length) {
			return this.generateDefaultPropertyTests(config);
		}

		return `
  describe('Property-Based Tests', () => {
    afterEach(() => {
      cleanup();
    });

    ${config.properties
			.map((prop) => this.generatePropertyTest(prop, config))
			.join("\n\n    ")}
  });`;
	}

	private generateDefaultPropertyTests(config: PropertyBasedTestConfig): string {
		return `
  describe('Property-Based Tests', () => {
    afterEach(() => {
      cleanup();
    });

    it('should render with any valid props', () => {
      fc.assert(fc.property(${config.componentName.toLowerCase()}Props, (props) => {
        const { container } = render(<${config.componentName} {...props} />);
        expect(container.firstChild).toBeTruthy();
      }), { numRuns: 100 });
    });

    it('should handle prop changes without crashing', () => {
      fc.assert(fc.property(
        fc.tuple(${config.componentName.toLowerCase()}Props, ${config.componentName.toLowerCase()}Props),
        ([initialProps, newProps]) => {
          const { rerender } = render(<${config.componentName} {...initialProps} />);
          expect(() => {
            rerender(<${config.componentName} {...newProps} />);
          }).not.toThrow();
        }
      ), { numRuns: 50 });
    });

    it('should maintain accessibility with any props', () => {
      fc.assert(fc.property(${config.componentName.toLowerCase()}Props, (props) => {
        render(<${config.componentName} {...props} />);
        const element = screen.getByRole('${this.getDefaultRole(config)}');
        expect(element).toBeInTheDocument();
        expect(element).toBeVisible();
      }), { numRuns: 100 });
    });

    it('should handle events without throwing errors', () => {
      fc.assert(fc.property(
        fc.tuple(${config.componentName.toLowerCase()}Props, eventGenerator),
        ([props, event]) => {
          render(<${config.componentName} {...props} />);
          const element = screen.getByRole('${this.getDefaultRole(config)}');
          
          expect(() => {
            fireEvent(element, event);
          }).not.toThrow();
        }
      ), { numRuns: 50 });
    });`;
	}

	private generatePropertyTest(
		property: PropertyTestDefinition,
		config: PropertyBasedTestConfig
	): string {
		const generators = property.generators
			.map((gen) => gen.name)
			.join(", ");
		const preconditions = property.preconditions?.join(" && ") || "true";
		const postconditions = property.postconditions?.join(" && ") || "true";

		return `it('Property: ${property.name}', () => {
      // ${property.description}
      fc.assert(fc.property(
        fc.tuple(${generators}),
        (args) => {
          fc.pre(${preconditions}); // Preconditions
          
          ${property.property}
          
          // Postconditions
          expect(${postconditions}).toBe(true);
        }
      ), { 
        numRuns: 100,
        verbose: true,
        examples: []
      });
    });`;
	}

	private generateModelBasedTests(config: PropertyBasedTestConfig): string {
		if (!config.modelChecking?.enabled) {
			return "";
		}

		return `
  describe('Model-Based Tests', () => {
    ${this.generateStateMachineModel(config)}
    
    ${this.generateModelPropertyTests(config)}
  });`;
	}

	private generateStateMachineModel(config: PropertyBasedTestConfig): string {
		const { modelChecking } = config;
		if (!modelChecking) return "";

		return `
    const componentMachine = createMachine({
      id: '${config.componentName}',
      initial: 'idle',
      states: {
        ${modelChecking.stateModel}
      }
    });

    const actionGenerators = {
      ${modelChecking.actions
				.map(
					(action) => `
      ${action.name}: ${action.generator}`
				)
				.join(",")}
    };`;
	}

	private generateModelPropertyTests(config: PropertyBasedTestConfig): string {
		const { modelChecking } = config;
		if (!modelChecking) return "";

		return `
    it('should satisfy model properties under all action sequences', () => {
      fc.assert(fc.property(
        fc.array(fc.oneof(...Object.values(actionGenerators)), { maxLength: 20 }),
        (actions) => {
          const service = interpret(componentMachine);
          service.start();
          
          let currentState = service.state;
          
          for (const action of actions) {
            service.send(action);
            currentState = service.state;
            
            // Check model properties
            ${modelChecking.properties
							.map((prop) => `expect(${prop}).toBe(true);`)
							.join("\n            ")}
          }
          
          service.stop();
        }
      ), { numRuns: 50 });
    });`;
	}

	private generateFuzzTests(config: PropertyBasedTestConfig): string {
		return `
  describe('Fuzz Tests', () => {
    it('should handle random string inputs without crashing', () => {
      fc.assert(fc.property(
        fc.record({
          randomString: fc.string({ minLength: 0, maxLength: 1000 }),
          randomNumber: fc.float({ min: -1000, max: 1000 }),
          randomArray: fc.array(fc.anything(), { maxLength: 100 }),
          randomObject: fc.object({ maxDepth: 5 })
        }),
        (fuzzData) => {
          expect(() => {
            render(<${config.componentName} {...fuzzData} />);
          }).not.toThrow();
        }
      ), { numRuns: 200 });
    });

    it('should handle malformed event objects', () => {
      fc.assert(fc.property(
        fc.record({
          type: fc.string(),
          target: fc.object(),
          currentTarget: fc.object(),
          detail: fc.anything()
        }),
        (malformedEvent) => {
          render(<${config.componentName} />);
          const element = screen.getByRole('${this.getDefaultRole(config)}');
          
          expect(() => {
            fireEvent(element, malformedEvent);
          }).not.toThrow();
        }
      ), { numRuns: 100 });
    });

    it('should handle extreme prop values', () => {
      fc.assert(fc.property(
        fc.record({
          veryLongString: fc.string({ minLength: 10000, maxLength: 50000 }),
          veryLargeNumber: fc.float({ min: 1e10, max: 1e20 }),
          verySmallNumber: fc.float({ min: -1e20, max: -1e10 }),
          emptyArray: fc.constant([]),
          hugeArray: fc.array(fc.string(), { minLength: 1000, maxLength: 5000 }),
          nullValue: fc.constant(null),
          undefinedValue: fc.constant(undefined)
        }),
        (extremeProps) => {
          expect(() => {
            render(<${config.componentName} {...extremeProps} />);
          }).not.toThrow();
        }
      ), { numRuns: 50 });
    });
  });`;
	}

	private generateInvariantTests(config: PropertyBasedTestConfig): string {
		return `
  describe('Invariant Tests', () => {
    it('should maintain DOM structure invariants', () => {
      fc.assert(fc.property(
        ${config.componentName.toLowerCase()}Props,
        (props) => {
          const { container } = render(<${config.componentName} {...props} />);
          
          // Invariant: Component always renders at least one element
          expect(container.children.length).toBeGreaterThan(0);
          
          // Invariant: Component maintains proper ARIA structure
          const element = container.firstChild as HTMLElement;
          expect(element).toHaveAttribute('role');
          
          // Invariant: No duplicate IDs in the DOM
          const ids = Array.from(container.querySelectorAll('[id]'))
            .map(el => el.getAttribute('id'))
            .filter(Boolean);
          expect(new Set(ids).size).toBe(ids.length);
        }
      ), { numRuns: 100 });
    });

    it('should maintain accessibility invariants', () => {
      fc.assert(fc.property(
        ${config.componentName.toLowerCase()}Props,
        (props) => {
          render(<${config.componentName} {...props} />);
          const element = screen.getByRole('${this.getDefaultRole(config)}');
          
          // Invariant: Element is always focusable if interactive
          if (element.tagName === 'BUTTON' || element.tagName === 'INPUT') {
            expect(element).not.toHaveAttribute('tabindex', '-1');
          }
          
          // Invariant: Element has accessible name
          expect(
            element.getAttribute('aria-label') || 
            element.getAttribute('aria-labelledby') ||
            element.textContent
          ).toBeTruthy();
        }
      ), { numRuns: 100 });
    });

    it('should maintain performance invariants', () => {
      fc.assert(fc.property(
        ${config.componentName.toLowerCase()}Props,
        (props) => {
          const startTime = performance.now();
          render(<${config.componentName} {...props} />);
          const endTime = performance.now();
          
          // Invariant: Render time should be under 16ms (60fps)
          expect(endTime - startTime).toBeLessThan(16);
        }
      ), { numRuns: 50 });
    });
  });`;
	}

	private generateRegressionTests(config: PropertyBasedTestConfig): string {
		if (!config.regressionTests?.length) {
			return "";
		}

		return `
  describe('Regression Tests', () => {
    ${config.regressionTests
			.map((test) => this.generateRegressionTest(test))
			.join("\n\n    ")}
  });`;
	}

	private generateRegressionTest(test: RegressionTestCase): string {
		return `it('Regression: ${test.name}', () => {
      // Bug: ${test.bugDescription}
      const input = ${JSON.stringify(test.input, null, 2)};
      const expectedOutput = ${JSON.stringify(test.expectedOutput, null, 2)};
      
      render(<${this.getComponentName()} {...input} />);
      // Add specific assertions based on the regression case
      expect(screen.getByRole('${this.getDefaultRole()}')).toBeInTheDocument();
    });`;
	}

	private generateNorwegianComplianceTests(
		config: PropertyBasedTestConfig
	): string {
		return `
  it('should handle Norwegian characters correctly', () => {
    fc.assert(fc.property(
      fc.record({
        text: fc.stringOf(fc.constantFrom('æ', 'ø', 'å', 'Æ', 'Ø', 'Å'), { minLength: 1, maxLength: 50 }),
        title: fc.string().filter(s => /[æøåÆØÅ]/.test(s))
      }),
      (norwegianProps) => {
        render(<${config.componentName} {...norwegianProps} />);
        
        // Should render Norwegian characters without issues
        if (norwegianProps.text) {
          expect(screen.getByText(norwegianProps.text)).toBeInTheDocument();
        }
      }
    ), { numRuns: 50 });
  });

  it('should comply with NSM classification requirements', () => {
    fc.assert(fc.property(
      fc.record({
        classification: fc.constantFrom('OPEN', 'RESTRICTED', 'CONFIDENTIAL', 'SECRET'),
        content: fc.string()
      }),
      (classificationProps) => {
        render(<${config.componentName} {...classificationProps} />);
        
        // Should display classification appropriately
        expect(screen.getByRole('${this.getDefaultRole(config)}')).toBeInTheDocument();
      }
    ), { numRuns: 25 });
  });`;
	}

	private generatePerformancePropertyTests(
		config: PropertyBasedTestConfig
	): string {
		return `
  it('should maintain consistent performance across prop variations', () => {
    fc.assert(fc.property(
      ${config.componentName.toLowerCase()}Props,
      (props) => {
        const measurements: number[] = [];
        
        // Measure multiple renders
        for (let i = 0; i < 5; i++) {
          const startTime = performance.now();
          const { unmount } = render(<${config.componentName} {...props} />);
          const endTime = performance.now();
          measurements.push(endTime - startTime);
          unmount();
        }
        
        const avgTime = measurements.reduce((a, b) => a + b, 0) / measurements.length;
        const maxTime = Math.max(...measurements);
        
        // Performance invariants
        expect(avgTime).toBeLessThan(8); // Average under 8ms
        expect(maxTime).toBeLessThan(16); // Max under 16ms (60fps)
        
        // Consistency: standard deviation should be low
        const stdDev = Math.sqrt(
          measurements.reduce((sum, time) => sum + Math.pow(time - avgTime, 2), 0) / measurements.length
        );
        expect(stdDev).toBeLessThan(5); // Low variance
      }
    ), { numRuns: 20 });
  });`;
	}

	private generateAccessibilityPropertyTests(
		config: PropertyBasedTestConfig
	): string {
		return `
  it('should maintain accessibility with any valid prop combination', () => {
    fc.assert(fc.property(
      ${config.componentName.toLowerCase()}Props,
      (props) => {
        render(<${config.componentName} {...props} />);
        const element = screen.getByRole('${this.getDefaultRole(config)}');
        
        // Should always be accessible
        expect(element).toBeVisible();
        expect(element).not.toHaveAttribute('aria-hidden', 'true');
        
        // Should have proper focus management
        if (element.tabIndex >= 0) {
          element.focus();
          expect(document.activeElement).toBe(element);
        }
      }
    ), { numRuns: 100 });
  });

  it('should maintain proper ARIA relationships', () => {
    fc.assert(fc.property(
      fc.record({
        id: fc.uuid(),
        labelId: fc.uuid(),
        describedById: fc.uuid()
      }),
      (ariaProps) => {
        render(<${config.componentName} {...ariaProps} />);
        
        // ARIA relationships should be valid
        const element = screen.getByRole('${this.getDefaultRole(config)}');
        const labelledBy = element.getAttribute('aria-labelledby');
        const describedBy = element.getAttribute('aria-describedby');
        
        if (labelledBy) {
          expect(document.getElementById(labelledBy)).toBeTruthy();
        }
        if (describedBy) {
          expect(document.getElementById(describedBy)).toBeTruthy();
        }
      }
    ), { numRuns: 50 });
  });`;
	}

	private getComponentName(): string {
		return "TestComponent";
	}

	private getDefaultRole(config?: PropertyBasedTestConfig): string {
		return config?.specification?.accessibility?.role || "generic";
	}

	private generateComponentPropsGenerators(
		config: PropertyBasedTestConfig
	): string {
		// Generate based on component specification
		return `
  title: fc.string({ minLength: 1, maxLength: 100 }),
  disabled: fc.boolean(),
  variant: fc.constantFrom('primary', 'secondary', 'destructive'),
  size: fc.constantFrom('sm', 'md', 'lg'),
  children: fc.oneof(fc.string(), fc.constant(null))`;
	}

	private generateStateGenerators(config: PropertyBasedTestConfig): string {
		return `
  isLoading: fc.boolean(),
  isOpen: fc.boolean(),
  selectedIndex: fc.integer({ min: -1, max: 10 }),
  value: fc.oneof(fc.string(), fc.integer(), fc.constant(null))`;
	}

	private inferPropsFromSpecification(specification: any): string {
		if (!specification?.props?.schema) {
			return `
  title: stringProp,
  disabled: booleanProp,
  onClick: fc.func()`;
		}

		return Object.entries(specification.props.schema)
			.map(([propName, propDef]: [string, any]) => {
				const generator = this.getGeneratorForPropType(propDef);
				return `  ${propName}: ${generator}`;
			})
			.join(",\n");
	}

	private getGeneratorForPropType(propDef: any): string {
		if (propDef.type?.primitive === "string") return "stringProp";
		if (propDef.type?.primitive === "number") return "numberProp";
		if (propDef.type?.primitive === "boolean") return "booleanProp";
		if (propDef.type?.complex === "function") return "fc.func()";
		if (propDef.type?.complex === "array") return "arrayProp";
		if (propDef.type?.complex === "object") return "objectProp";
		return "fc.anything()";
	}
}