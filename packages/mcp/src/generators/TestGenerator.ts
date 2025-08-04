/**
 * Test Generator for Xala UI System
 */

import type { ComponentConfig } from "../types/index.js";

export class TestGenerator {
	public generateTest(config: ComponentConfig): string {
		const { name, category } = config;

		return `
import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { ${name} } from './${name}.js';

describe('${name}', () => {
  it('renders without crashing', () => {
    render(<${name} />);
    expect(screen.getByRole('${this.getRoleByCategory(category)}')).toBeInTheDocument();
  });

  it('handles user interactions', () => {
    const handleClick = jest.fn();
    render(<${name} onClick={handleClick} />);
    
    const element = screen.getByRole('${this.getRoleByCategory(category)}');
    fireEvent.click(element);
    
    expect(handleClick).toHaveBeenCalledTimes(1);
  });

  it('applies correct accessibility attributes', () => {
    render(<${name} />);
    const element = screen.getByRole('${this.getRoleByCategory(category)}');
    
    expect(element).toHaveAttribute('aria-label');
    expect(element).toBeVisible();
  });

  it('supports keyboard navigation', () => {
    render(<${name} />);
    const element = screen.getByRole('${this.getRoleByCategory(category)}');
    
    fireEvent.keyDown(element, { key: 'Enter' });
    fireEvent.keyDown(element, { key: ' ' });
    
    expect(element).toHaveFocus();
  });
});`;
	}

	private getRoleByCategory(category: string): string {
		switch (category) {
			case "form":
				return "form";
			case "navigation":
				return "navigation";
			case "data-display":
				return "table";
			case "interactive":
				return "button";
			default:
				return "generic";
		}
	}

	/**
	 * Generate comprehensive tests based on component specification (async version for MCP tools)
	 */
	public async generateTests(config: {
		componentName: string;
		specification: any;
		testTypes: Array<
			"unit" | "integration" | "accessibility" | "visual" | "performance"
		>;
		framework: "jest" | "vitest" | "cypress" | "playwright";
	}): Promise<string> {
		const { componentName, specification, testTypes, framework } = config;

		const testCode = `
/**
 * Generated Tests for ${componentName}
 * Framework: ${framework}
 * Test Types: ${testTypes.join(", ")}
 */

import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { axe, toHaveNoViolations } from 'jest-axe';
import { ${componentName} } from '../${componentName}';

expect.extend(toHaveNoViolations);

describe('${componentName}', () => {
  ${
		testTypes.includes("unit")
			? `
  describe('Unit Tests', () => {
    it('renders without crashing', () => {
      render(<${componentName} />);
      expect(screen.getByRole('${this.getTestRole(specification)}')).toBeInTheDocument();
    });

    ${
			specification.props?.schema
				? Object.entries(specification.props.schema)
						.map(
							([propName, propDef]: [string, any]) => `
    it('handles ${propName} prop correctly', () => {
      const testValue = ${this.getTestValue(propDef)};
      render(<${componentName} ${propName}={testValue} />);
      ${this.getTestAssertion(propName, propDef)}
    });`,
						)
						.join("\n")
				: ""
		}

    it('handles user interactions', () => {
      const mockHandler = jest.fn();
      render(<${componentName} onClick={mockHandler} />);
      
      const element = screen.getByRole('${this.getTestRole(specification)}');
      fireEvent.click(element);
      
      expect(mockHandler).toHaveBeenCalledTimes(1);
    });
  });
  `
			: ""
	}

  ${
		testTypes.includes("accessibility")
			? `
  describe('Accessibility Tests', () => {
    it('has no accessibility violations', async () => {
      const { container } = render(<${componentName} />);
      const results = await axe(container);
      expect(results).toHaveNoViolations();
    });

    it('supports keyboard navigation', () => {
      render(<${componentName} />);
      const element = screen.getByRole('${this.getTestRole(specification)}');
      
      element.focus();
      expect(element).toHaveFocus();
      
      fireEvent.keyDown(element, { key: 'Tab' });
      fireEvent.keyDown(element, { key: 'Enter', code: 'Enter' });
      fireEvent.keyDown(element, { key: ' ', code: 'Space' });
    });

    it('has proper ARIA attributes', () => {
      render(<${componentName} />);
      const element = screen.getByRole('${this.getTestRole(specification)}');
      
      ${
				specification.accessibility?.ariaAttributes
					? Object.keys(specification.accessibility.ariaAttributes)
							.map((attr) => `expect(element).toHaveAttribute('${attr}');`)
							.join("\n      ")
					: "expect(element).toHaveAttribute('aria-label');"
			}
    });

    it('supports screen readers', () => {
      render(<${componentName} />);
      const element = screen.getByRole('${this.getTestRole(specification)}');
      
      expect(element).toBeVisible();
      expect(element).not.toHaveAttribute('aria-hidden', 'true');
    });
  });
  `
			: ""
	}

  ${
		testTypes.includes("performance")
			? `
  describe('Performance Tests', () => {
    it('renders within performance budget', async () => {
      const startTime = performance.now();
      render(<${componentName} />);
      const endTime = performance.now();
      
      expect(endTime - startTime).toBeLessThan(16); // 16ms for 60fps
    });

    it('handles large datasets efficiently', async () => {
      const largeData = Array.from({ length: 1000 }, (_, i) => ({ id: i, value: \`Item \${i}\` }));
      
      const startTime = performance.now();
      render(<${componentName} data={largeData} />);
      const endTime = performance.now();
      
      expect(endTime - startTime).toBeLessThan(100); // 100ms threshold
    });
  });
  `
			: ""
	}

  ${
		testTypes.includes("visual")
			? `
  describe('Visual Tests', () => {
    it('matches visual snapshot', () => {
      const { container } = render(<${componentName} />);
      expect(container.firstChild).toMatchSnapshot();
    });

    ${
			specification.variants?.simple
				? Object.keys(specification.variants.simple)
						.map(
							(variantName) => `
    it('renders ${variantName} variant correctly', () => {
      const { container } = render(<${componentName} ${variantName}="primary" />);
      expect(container.firstChild).toMatchSnapshot('${variantName}-variant');
    });`,
						)
						.join("\n")
				: ""
		}
  });
  `
			: ""
	}

  ${
		testTypes.includes("integration")
			? `
  describe('Integration Tests', () => {
    it('integrates with form context', () => {
      const FormWrapper = ({ children }: { children: React.ReactNode }) => (
        <form onSubmit={(e) => e.preventDefault()}>
          {children}
        </form>
      );

      render(
        <FormWrapper>
          <${componentName} name="testField" />
        </FormWrapper>
      );

      expect(screen.getByRole('${this.getTestRole(specification)}')).toBeInTheDocument();
    });

    it('works with theme provider', () => {
      const ThemeProvider = ({ children }: { children: React.ReactNode }) => (
        <div data-theme="dark">{children}</div>
      );

      render(
        <ThemeProvider>
          <${componentName} />
        </ThemeProvider>
      );

      expect(screen.getByRole('${this.getTestRole(specification)}')).toBeInTheDocument();
    });
  });
  `
			: ""
	}
});

// Norwegian compliance test
describe('${componentName} Norwegian Compliance', () => {
  it('displays Norwegian text correctly', () => {
    render(<${componentName} />);
    // Add Norwegian-specific assertions
  });

  it('respects NSM classification', () => {
    const nsmLevel = '${specification.compliance?.norwegian?.nsmClassification || "OPEN"}';
    render(<${componentName} />);
    
    if (nsmLevel !== 'OPEN') {
      expect(screen.getByText(new RegExp(nsmLevel, 'i'))).toBeInTheDocument();
    }
  });
});
`;

		return testCode;
	}

	private getTestRole(specification: any): string {
		if (specification.accessibility?.role) {
			return specification.accessibility.role;
		}

		switch (specification.metadata?.category) {
			case "form":
				return "form";
			case "navigation":
				return "navigation";
			case "data-display":
				return "table";
			case "action-feedback":
				return "button";
			default:
				return "generic";
		}
	}

	private getTestValue(propDef: any): string {
		if (propDef.type?.primitive === "string") return '"test value"';
		if (propDef.type?.primitive === "number") return "42";
		if (propDef.type?.primitive === "boolean") return "true";
		if (propDef.type?.complex === "function") return "jest.fn()";
		return "undefined";
	}

	private getTestAssertion(propName: string, propDef: any): string {
		if (propDef.type?.primitive === "string") {
			return `expect(screen.getByText('test value')).toBeInTheDocument();`;
		}
		if (propDef.type?.primitive === "boolean") {
			return `expect(screen.getByRole('${this.getTestRole({})}')).toBeInTheDocument();`;
		}
		return `expect(screen.getByRole('${this.getTestRole({})}')).toBeInTheDocument();`;
	}
}
