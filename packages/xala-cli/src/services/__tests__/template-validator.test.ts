/**
 * @fileoverview Template Validator Tests
 * @description Comprehensive tests for the template validation system
 * @version 5.0.0
 * @compliance Jest, TypeScript Strict
 */

import { TemplateValidator } from "../template-validator.js";
import {
	AriaAttributesRule,
	DesignTokenUsageRule,
	NoRawHTMLRule,
	SemanticComponentUsageRule,
	TypeScriptStrictRule,
} from "../validation-rules.js";

describe("TemplateValidator", () => {
	let validator: TemplateValidator;

	beforeEach(() => {
		validator = new TemplateValidator();
	});

	describe("validateContent", () => {
		it("should validate valid CVA component template", async () => {
			const validTemplate = `
/**
 * @fileoverview ValidCard Component - CVA Design System Compliant
 * @description Card component using CVA pattern with semantic tokens
 * @version 5.0.0
 * @compliance WCAG AAA, NSM, CVA Pattern
 */

import React from 'react';
import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from '@xala-technologies/ui-system/utils';

const cardVariants = cva(
  'rounded-lg border bg-card text-card-foreground shadow-md',
  {
    variants: {
      variant: {
        default: 'border-border',
        outlined: 'border-2 border-border bg-transparent',
        elevated: 'border-0 shadow-lg',
      },
      padding: {
        sm: 'p-4',
        md: 'p-6',
        lg: 'p-8',
      },
    },
    defaultVariants: {
      variant: 'default',
      padding: 'md',
    },
  }
);

export interface CardProps
  extends HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof cardVariants> {
  readonly children: React.ReactNode;
  readonly 'data-testid'?: string;
}

export const Card = React.forwardRef<HTMLDivElement, CardProps>(
  ({ children, className, variant, padding, 'data-testid': testId, ...props }, ref) => {
    return (
      <Container
        ref={ref}
        className={cn(cardVariants({ variant, padding }), className)}
        data-testid={testId}
        role="article"
        aria-label="Card content"
        {...props}
      >
        {children}
      </Container>
    );
  }
);

Card.displayName = 'Card';
      `;

			const result = await validator.validateContent(
				validTemplate,
				"test-card.tsx",
			);

			expect(result.isValid).toBe(true);
			expect(result.score).toBeGreaterThan(80);
			expect(
				result.violations.filter((v) => v.severity === "error"),
			).toHaveLength(0);
		});

		it("should detect raw HTML elements", async () => {
			const invalidTemplate = `
export const BadCard = () => {
  return (
    <div className="p-4 border rounded">
      <h2>Title</h2>
      <p>Content</p>
      <button onClick={handleClick}>Click me</button>
    </div>
  );
};
      `;

			const result = await validator.validateContent(
				invalidTemplate,
				"bad-card.tsx",
			);

			expect(result.isValid).toBe(false);
			expect(result.violations.some((v) => v.rule === "no-raw-html")).toBe(
				true,
			);
			expect(result.score).toBeLessThan(50);
		});

		it("should detect missing accessibility attributes", async () => {
			const template = `
import { Button } from '@xala-technologies/ui-system';

export const AccessibilityTest = () => {
  return (
    <Container>
      <Button onClick={handleClick}>Submit</Button>
      <Input type="email" />
      <img src="test.jpg" />
    </Container>
  );
};
      `;

			const result = await validator.validateContent(
				template,
				"accessibility-test.tsx",
			);

			expect(result.violations.some((v) => v.rule === "aria-attributes")).toBe(
				true,
			);
			expect(
				result.violations.some((v) =>
					v.message.includes("missing accessibility label"),
				),
			).toBe(true);
		});

		it("should detect hardcoded values", async () => {
			const template = `
export const HardcodedStyles = () => {
  return (
    <div style={{ color: '#ff0000', padding: '16px', margin: '8px' }}>
      <span className="text-[#00ff00]">Hardcoded green text</span>
    </div>
  );
};
      `;

			const result = await validator.validateContent(
				template,
				"hardcoded-styles.tsx",
			);

			expect(
				result.violations.some((v) => v.rule === "design-token-usage"),
			).toBe(true);
			expect(
				result.violations.some((v) => v.rule === "no-hardcoded-values"),
			).toBe(true);
		});

		it("should validate TypeScript strict compliance", async () => {
			const template = `
export const TypeScriptIssues = (props: any) => {
  const data: any = props.data;
  // @ts-ignore
  const result = data.someProperty!.value;
  
  return <div>{result}</div>;
};
      `;

			const result = await validator.validateContent(
				template,
				"typescript-issues.tsx",
			);

			expect(
				result.violations.some((v) => v.rule === "typescript-strict"),
			).toBe(true);
			expect(result.violations.some((v) => v.rule === "no-any-type")).toBe(
				true,
			);
		});

		it("should validate responsive design patterns", async () => {
			const template = `
export const ResponsiveComponent = () => {
  return (
    <div className="grid grid-cols-4 w-full h-screen">
      <div className="hidden">Navigation</div>
      <div className="flex">Content</div>
    </div>
  );
};
      `;

			const result = await validator.validateContent(
				template,
				"responsive-test.tsx",
			);

			expect(result.warnings.some((w) => w.rule === "responsive-classes")).toBe(
				true,
			);
			expect(result.warnings.some((w) => w.rule === "breakpoint-usage")).toBe(
				true,
			);
		});

		it("should validate Norwegian compliance requirements", async () => {
			const template = `
// @classification KONFIDENSIELT
export const NorwegianForm = () => {
  const handleSubmit = (data: any) => {
    // Handle sensitive Norwegian data
    console.log('Lagrer data...');
  };

  return (
    <form onSubmit={handleSubmit} data-security-level="high">
      <Input type="text" placeholder="Navn" />
      <Input type="email" placeholder="E-post" />
      <Button type="submit">Lagre</Button>
    </form>
  );
};
      `;

			const result = await validator.validateContent(
				template,
				"norwegian-form.tsx",
			);

			// Should have warnings about localization
			expect(
				result.warnings.some((w) => w.rule === "localization-norwegian"),
			).toBe(true);
		});
	});

	describe("generateReport", () => {
		it("should generate comprehensive markdown report", async () => {
			const mockResults = [
				{
					isValid: true,
					filePath: "/valid-template.tsx",
					violations: [],
					warnings: [],
					score: 95,
					compliance: {
						semantic: true,
						accessibility: true,
						designTokens: true,
						responsive: true,
						typeScript: true,
						norwegian: true,
					},
				},
				{
					isValid: false,
					filePath: "/invalid-template.tsx",
					violations: [
						{
							rule: "no-raw-html",
							severity: "error" as const,
							message: "Raw HTML element <div> found",
							line: 5,
							column: 10,
							suggestion: "Replace <div> with Container component",
						},
					],
					warnings: [
						{
							rule: "accessibility",
							message: "Missing ARIA label",
							line: 8,
							suggestion: "Add ariaLabel prop",
						},
					],
					score: 65,
					compliance: {
						semantic: false,
						accessibility: false,
						designTokens: true,
						responsive: true,
						typeScript: true,
						norwegian: true,
					},
				},
			];

			const report = validator.generateReport(mockResults);

			expect(report).toContain("# Template Validation Report");
			expect(report).toContain("**Total Templates**: 2");
			expect(report).toContain("**Valid Templates**: 1");
			expect(report).toContain("**Invalid Templates**: 1");
			expect(report).toContain("## Compliance Overview");
			expect(report).toContain("❌ Templates with Errors");
			expect(report).toContain("no-raw-html");
			expect(report).toContain("Replace <div> with Container component");
		});
	});
});

describe("Individual Validation Rules", () => {
	describe("NoRawHTMLRule", () => {
		let rule: NoRawHTMLRule;

		beforeEach(() => {
			rule = new NoRawHTMLRule();
		});

		it("should detect raw HTML elements", async () => {
			const content = "<div><span><button>Click</button></span></div>";
			const result = await rule.validate(content, "test.tsx");

			expect(result.passed).toBe(false);
			expect(result.violations).toHaveLength(3);
			expect(result.violations[0]).toContain("Raw HTML element <div> found");
			expect(result.suggestions[0]).toContain("semantic component");
		});

		it("should pass for semantic components", async () => {
			const content =
				"<Container><Typography><Button>Click</Button></Typography></Container>";
			const result = await rule.validate(content, "test.tsx");

			expect(result.passed).toBe(true);
			expect(result.violations).toHaveLength(0);
		});
	});

	describe("DesignTokenUsageRule", () => {
		let rule: DesignTokenUsageRule;

		beforeEach(() => {
			rule = new DesignTokenUsageRule();
		});

		it("should detect hardcoded colors", async () => {
			const content = "color: #ff0000; background: rgb(255, 0, 0);";
			const result = await rule.validate(content, "test.tsx");

			expect(result.passed).toBe(false);
			expect(
				result.violations.some((v) => v.includes("Hardcoded color value")),
			).toBe(true);
		});

		it("should pass for semantic Tailwind classes", async () => {
			const content = 'className="bg-primary text-foreground border-border"';
			const result = await rule.validate(content, "test.tsx");

			expect(result.passed).toBe(true);
		});
	});

	describe("AriaAttributesRule", () => {
		let rule: AriaAttributesRule;

		beforeEach(() => {
			rule = new AriaAttributesRule();
		});

		it("should detect missing ARIA labels", async () => {
			const content = "<Button onClick={handleClick}>Submit</Button>";
			const result = await rule.validate(content, "test.tsx");

			expect(result.passed).toBe(false);
			expect(result.violations[0]).toContain(
				"Button missing accessibility label",
			);
		});

		it("should pass with ARIA labels", async () => {
			const content =
				'<Button ariaLabel="Submit form" onClick={handleClick}>Submit</Button>';
			const result = await rule.validate(content, "test.tsx");

			expect(result.passed).toBe(true);
		});
	});

	describe("TypeScriptStrictRule", () => {
		let rule: TypeScriptStrictRule;

		beforeEach(() => {
			rule = new TypeScriptStrictRule();
		});

		it("should detect any type usage", async () => {
			const content = "const data: any = props;";
			const result = await rule.validate(content, "test.tsx");

			expect(result.passed).toBe(false);
			expect(result.violations[0]).toContain('Usage of "any" type found');
		});

		it("should detect @ts-ignore comments", async () => {
			const content = "// @ts-ignore\nconst result = data.property;";
			const result = await rule.validate(content, "test.tsx");

			expect(result.passed).toBe(false);
			expect(result.violations[0]).toContain("@ts-ignore comment found");
		});
	});
});
