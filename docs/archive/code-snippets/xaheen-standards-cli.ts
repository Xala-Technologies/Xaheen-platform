// apps/cli/src/extensions/xaheen/standards.ts
import { ESLintConfig, PrettierConfig, TypeScriptConfig } from "../types";

export const XaheenDevelopmentStandards = {
	typescript: {
		compilerOptions: {
			// MANDATORY STRICT MODE
			strict: true,
			noImplicitAny: true,
			strictNullChecks: true,
			strictFunctionTypes: true,
			strictBindCallApply: true,
			strictPropertyInitialization: true,
			noImplicitThis: true,
			alwaysStrict: true,

			// Additional strictness
			noUnusedLocals: true,
			noUnusedParameters: true,
			noImplicitReturns: true,
			noFallthroughCasesInSwitch: true,
			noUncheckedIndexedAccess: true,
			noPropertyAccessFromIndexSignature: true,

			// Modern features
			target: "ES2022",
			module: "ESNext",
			moduleResolution: "bundler",
			jsx: "preserve",

			// Type checking
			skipLibCheck: true,
			esModuleInterop: true,
			resolveJsonModule: true,
			isolatedModules: true,
			forceConsistentCasingInFileNames: true,
		},
	} as TypeScriptConfig,

	eslint: {
		extends: [
			"eslint:recommended",
			"plugin:@typescript-eslint/strict-type-checked",
			"plugin:@typescript-eslint/stylistic-type-checked",
			"plugin:react/recommended",
			"plugin:react-hooks/recommended",
			"plugin:jsx-a11y/strict", // WCAG 2.2 AAA compliance
		],
		rules: {
			// TypeScript strict rules
			"@typescript-eslint/no-explicit-any": "error",
			"@typescript-eslint/explicit-function-return-type": [
				"error",
				{
					allowExpressions: false,
					allowTypedFunctionExpressions: false,
					allowHigherOrderFunctions: false,
				},
			],
			"@typescript-eslint/explicit-module-boundary-types": "error",
			"@typescript-eslint/no-unsafe-assignment": "error",
			"@typescript-eslint/no-unsafe-member-access": "error",
			"@typescript-eslint/no-unsafe-call": "error",
			"@typescript-eslint/no-unsafe-return": "error",

			// React component rules
			"react/function-component-definition": [
				"error",
				{
					namedComponents: "arrow-function",
					unnamedComponents: "arrow-function",
				},
			],
			"react/prop-types": "off", // TypeScript handles this
			"react/require-default-props": "off",
			"react/jsx-props-no-spreading": "off",

			// Forbidden patterns
			"no-restricted-syntax": [
				"error",
				{
					selector:
						"JSXElement[openingElement.name.name=/^(div|span|p|h[1-6]|ul|li|ol|section|article|main|header|footer|nav|button|input|form|label|select|textarea|a|img|table|tr|td|th)$/]",
					message:
						"Raw HTML elements are forbidden. Use semantic components from @xaheen-ai/ui-system instead.",
				},
			],

			// Security rules
			"react/no-danger": "error",
			"react/no-danger-with-children": "error",

			// Accessibility rules (WCAG 2.2 AAA)
			"jsx-a11y/no-access-key": "error",
			"jsx-a11y/aria-role": "error",
			"jsx-a11y/lang": "error",
			"jsx-a11y/no-autofocus": "error",

			// Import rules
			"import/order": [
				"error",
				{
					groups: [
						"builtin",
						"external",
						"internal",
						"parent",
						"sibling",
						"index",
					],
					"newlines-between": "always",
					alphabetize: { order: "asc", caseInsensitive: true },
				},
			],
		},
	} as ESLintConfig,

	prettier: {
		semi: true,
		singleQuote: true,
		tabWidth: 2,
		trailingComma: "all",
		printWidth: 100,
		arrowParens: "always",
		endOfLine: "lf",
	} as PrettierConfig,

	gitignore: [
		"node_modules/",
		"dist/",
		"build/",
		".next/",
		".turbo/",
		"*.log",
		".env*",
		"!.env.example",
		".DS_Store",
		"coverage/",
		".nyc_output/",
		"*.tsbuildinfo",
	],

	vscode: {
		"editor.defaultFormatter": "esbenp.prettier-vscode",
		"editor.formatOnSave": true,
		"editor.codeActionsOnSave": {
			"source.fixAll.eslint": true,
			"source.organizeImports": true,
		},
		"typescript.tsdk": "node_modules/typescript/lib",
		"typescript.enablePromptUseWorkspaceTsdk": true,
		"css.validate": false, // Using Tailwind
		"tailwindCSS.emmetCompletions": false, // No raw HTML
	},
};

import fs from "fs-extra";
import { glob } from "glob";
import path from "path";
// apps/cli/src/extensions/xaheen/validators.ts
import { z } from "zod";

export class XaheenCodeValidator {
	private static readonly FORBIDDEN_PATTERNS = [
		// Raw HTML elements
		/<(div|span|p|h[1-6]|ul|li|ol|section|article|main|header|footer|nav|button|input|form|label|select|textarea|a|img|table|tr|td|th)[^>]*>/g,

		// Inline styles
		/style\s*=\s*{/g,

		// Hardcoded styling values
		/className\s*=\s*["'].*?(p-\d+|m-\d+|text-\[|bg-\[|w-\d+|h-\d+)/g,

		// Any type usage
		/:\s*any\b/g,

		// Missing return types
		/const\s+\w+\s*=\s*\([^)]*\)\s*=>\s*{/g,

		// Class components
		/class\s+\w+\s+extends\s+(React\.)?Component/g,
	];

	static async validateProject(projectPath: string): Promise<ValidationResult> {
		const errors: ValidationError[] = [];
		const warnings: ValidationWarning[] = [];

		// Find all TypeScript/React files
		const files = await glob("**/*.{ts,tsx}", {
			cwd: projectPath,
			ignore: ["node_modules/**", "dist/**", "build/**"],
		});

		for (const file of files) {
			const filePath = path.join(projectPath, file);
			const content = await fs.readFile(filePath, "utf-8");

			// Check for forbidden patterns
			for (const pattern of this.FORBIDDEN_PATTERNS) {
				const matches = content.match(pattern);
				if (matches) {
					errors.push({
						file,
						line: this.getLineNumber(content, matches[0]),
						message: `Forbidden pattern found: ${matches[0]}`,
						severity: "error",
					});
				}
			}

			// Validate imports
			const importErrors = this.validateImports(content, file);
			errors.push(...importErrors);

			// Check for proper typing
			const typingErrors = this.validateTyping(content, file);
			errors.push(...typingErrors);
		}

		return { errors, warnings, isValid: errors.length === 0 };
	}

	private static validateImports(
		content: string,
		file: string,
	): ValidationError[] {
		const errors: ValidationError[] = [];
		const lines = content.split("\n");

		lines.forEach((line, index) => {
			// Check for non-semantic imports
			if (line.includes("from 'react'") && !line.includes("React")) {
				if (line.match(/<div|<span|<p|<h[1-6]/)) {
					errors.push({
						file,
						line: index + 1,
						message:
							"Importing HTML elements is forbidden. Use @xaheen-ai/ui-system components.",
						severity: "error",
					});
				}
			}
		});

		return errors;
	}

	private static validateTyping(
		content: string,
		file: string,
	): ValidationError[] {
		const errors: ValidationError[] = [];

		// Check for components without explicit return types
		const componentPattern =
			/export\s+const\s+(\w+)\s*=\s*\([^)]*\)\s*=>\s*[^:]/g;
		const matches = content.matchAll(componentPattern);

		for (const match of matches) {
			if (
				!match[0].includes(": JSX.Element") &&
				!match[0].includes(": React.ReactElement")
			) {
				errors.push({
					file,
					line: this.getLineNumber(content, match[0]),
					message: `Component ${match[1]} must have explicit return type: JSX.Element or React.ReactElement`,
					severity: "error",
				});
			}
		}

		return errors;
	}

	private static getLineNumber(content: string, match: string): number {
		const index = content.indexOf(match);
		return content.substring(0, index).split("\n").length;
	}
}

// apps/cli/src/extensions/xaheen/generators/component-generator.ts
export class XaheenComponentGenerator {
	static generateComponent(config: ComponentConfig): string {
		const { name, props = [], hooks = [], children = false } = config;

		return `import React${hooks.length > 0 ? `, { ${hooks.join(", ")} }` : ""} from 'react';
import { 
  Stack,
  Card,
  Text,
  Button,
  type StackProps 
} from '@xaheen-ai/ui-system';
import type { Result } from '@xaheen-ai/shared';

${props.length > 0 ? this.generatePropsInterface(name, props, children) : ""}

/**
 * ${name} component following Xaheen development standards
 * 
 * @component
 * @example
 * <${name} />
 */
export const ${name} = (${
			props.length > 0 || children
				? `{ 
  ${[...props.map((p) => p.name), children ? "children" : ""].filter(Boolean).join(",\n  ")} 
}: ${name}Props`
				: ""
		}): JSX.Element => {
  ${hooks.length > 0 ? this.generateHooks(hooks) : ""}
  
  return (
    <Card variant="elevated" size="lg">
      <Stack spacing="8" align="stretch">
        <Text variant="heading" size="xl">${name}</Text>
        ${children ? "{children}" : ""}
      </Stack>
    </Card>
  );
};

${name}.displayName = '${name}';
`;
	}

	private static generatePropsInterface(
		name: string,
		props: PropDefinition[],
		children: boolean,
	): string {
		return `interface ${name}Props {
  ${props.map((prop) => `readonly ${prop.name}${prop.required ? "" : "?"}: ${prop.type};`).join("\n  ")}
  ${children ? "readonly children?: React.ReactNode;" : ""}
}`;
	}

	private static generateHooks(hooks: string[]): string {
		const hookImplementations: Record<string, string> = {
			useState: "const [state, setState] = useState<string>('');",
			useCallback:
				"const handleAction = useCallback(() => {\n    // Implementation\n  }, []);",
			useMemo:
				"const computedValue = useMemo(() => {\n    return 'computed';\n  }, []);",
			useEffect: "useEffect(() => {\n    // Side effect\n  }, []);",
		};

		return hooks.map((hook) => hookImplementations[hook] || "").join("\n  ");
	}
}

// apps/cli/src/extensions/xaheen/templates/xaheen-app.template.ts
export const XaheenAppTemplate = {
	"src/app/layout.tsx": `import React from 'react';
import { 
  DesignSystemProvider,
  SSRProvider,
  HydrationProvider,
  ThemeProvider,
  LocaleProvider
} from '@xaheen-ai/ui-system';
import { Inter } from 'next/font/google';
import './globals.css';

const inter = Inter({ subsets: ['latin'] });

export const metadata = {
  title: 'Xaheen Application',
  description: 'AI-powered SaaS Factory Platform',
};

export default function RootLayout({
  children,
}: {
  readonly children: React.ReactNode;
}): JSX.Element {
  return (
    <html lang="en-GB">
      <body className={inter.className}>
        <DesignSystemProvider 
          theme="light" 
          platform="web"
          locale="en-GB"
          fallbackLocale="nb-NO"
        >
          <SSRProvider>
            <HydrationProvider>
              <ThemeProvider
                defaultTheme="system"
                storageKey="xaheenheme"
              >
                <LocaleProvider defaultLocale="en-GB">
                  {children}
                </LocaleProvider>
              </ThemeProvider>
            </HydrationProvider>
          </SSRProvider>
        </DesignSystemProvider>
      </body>
    </html>
  );
}`,

	"src/app/page.tsx": `import React from 'react';
import { 
  PageLayout,
  Section,
  Container,
  Stack,
  Text,
  Button,
  Card,
  Grid
} from '@xaheen-ai/ui-system';
import { XaheenLogo } from '@/components/brand/XaheenLogo';

export default function HomePage(): JSX.Element {
  return (
    <PageLayout>
      <Section variant="hero" spacing="20">
        <Container size="xl">
          <Stack direction="col" spacing="12" align="center">
            <XaheenLogo variant="full" size="lg" />
            <Stack direction="col" spacing="6" align="center">
              <Text variant="heading" size="3xl" align="center">
                AI-Powered SaaS Factory
              </Text>
              <Text variant="body" size="lg" color="secondary" align="center">
                Transform ideas into production-ready software with orchestrated AI agents
              </Text>
            </Stack>
            <Stack direction="row" spacing="6">
              <Button variant="primary" size="xl">
                Start Building
              </Button>
              <Button variant="outline" size="xl">
                Watch Demo
              </Button>
            </Stack>
          </Stack>
        </Container>
      </Section>

      <Section spacing="16">
        <Container size="xl">
          <Stack direction="col" spacing="12">
            <Text variant="heading" size="2xl" align="center">
              Core Features
            </Text>
            <Grid cols={{ base: 1, md: 2, lg: 3 }} spacing="8">
              <Card variant="elevated" size="lg">
                <Stack direction="col" spacing="6">
                  <Text variant="heading" size="lg">10x Faster Development</Text>
                  <Text variant="body" color="secondary">
                    From idea to MVP in 2-4 weeks with AI agent orchestration
                  </Text>
                </Stack>
              </Card>
              <Card variant="elevated" size="lg">
                <Stack direction="col" spacing="6">
                  <Text variant="heading" size="lg">Enterprise Quality</Text>
                  <Text variant="body" color="secondary">
                    Built-in best practices, WCAG AAA compliance, and zero technical debt
                  </Text>
                </Stack>
              </Card>
              <Card variant="elevated" size="lg">
                <Stack direction="col" spacing="6">
                  <Text variant="heading" size="lg">Global Ready</Text>
                  <Text variant="body" color="secondary">
                    Multi-language support with RTL, accessibility, and compliance built-in
                  </Text>
                </Stack>
              </Card>
            </Grid>
          </Stack>
        </Container>
      </Section>
    </PageLayout>
  );
}`,

	"src/components/brand/XaheenLogo.tsx": `import React from 'react';
import { Stack, Text, type StackProps } from '@xaheen-ai/ui-system';

interface XaheenLogoProps {
  readonly variant?: 'full' | 'icon' | 'text';
  readonly size?: 'sm' | 'md' | 'lg';
}

export const XaheenLogo = ({ 
  variant = 'full', 
  size = 'md' 
}: XaheenLogoProps): JSX.Element => {
  const sizeMap = {
    sm: { icon: 'xl', text: 'lg' },
    md: { icon: '2xl', text: 'xl' },
    lg: { icon: '3xl', text: '2xl' },
  };

  if (variant === 'icon') {
    return (
      <Text size={sizeMap[size].icon} role="img" aria-label="Xaheen brain logo">
        🧠✨
      </Text>
    );
  }

  if (variant === 'text') {
    return (
      <Text variant="heading" size={sizeMap[size].text} weight="bold">
        Xaheen
      </Text>
    );
  }

  return (
    <Stack direction="row" spacing="3" align="center">
      <Text size={sizeMap[size].icon} role="img" aria-label="Xaheen brain logo">
        🧠✨
      </Text>
      <Text variant="heading" size={sizeMap[size].text} weight="bold">
        Xaheen
      </Text>
    </Stack>
  );
};

XaheenLogo.displayName = 'XaheenLogo';`,

	".eslintrc.js": `module.exports = ${JSON.stringify(XaheenDevelopmentStandards.eslint, null, 2)};`,

	"tsconfig.json": JSON.stringify(
		{
			...XaheenDevelopmentStandards.typescript,
			include: ["**/*.ts", "**/*.tsx"],
			exclude: ["node_modules", "dist", "build"],
		},
		null,
		2,
	),

	".prettierrc": JSON.stringify(XaheenDevelopmentStandards.prettier, null, 2),

	".vscode/settings.json": JSON.stringify(
		XaheenDevelopmentStandards.vscode,
		null,
		2,
	),

	"src/utils/result.ts": `/**
 * Result type for proper error handling
 * Following Xaheen's functional programming patterns
 */
export type Result<T, E = Error> = Success<T> | Failure<E>;

export class Success<T> {
  readonly isSuccess = true;
  readonly isFailure = false;
  
  constructor(public readonly value: T) {}
  
  map<U>(fn: (value: T) => U): Result<U, never> {
    return new Success(fn(this.value));
  }
  
  mapError<F>(_fn: (error: never) => F): Result<T, F> {
    return this as unknown as Result<T, F>;
  }
  
  unwrap(): T {
    return this.value;
  }
}

export class Failure<E> {
  readonly isSuccess = false;
  readonly isFailure = true;
  
  constructor(public readonly error: E) {}
  
  map<U>(_fn: (value: never) => U): Result<U, E> {
    return this as unknown as Result<U, E>;
  }
  
  mapError<F>(fn: (error: E) => F): Result<never, F> {
    return new Failure(fn(this.error));
  }
  
  unwrap(): never {
    throw this.error;
  }
}

export const success = <T>(value: T): Success<T> => new Success(value);
export const failure = <E>(error: E): Failure<E> => new Failure(error);`,
};

// Type definitions
interface ValidationError {
	file: string;
	line: number;
	message: string;
	severity: "error" | "warning";
}

interface ValidationWarning {
	file: string;
	message: string;
}

interface ValidationResult {
	errors: ValidationError[];
	warnings: ValidationWarning[];
	isValid: boolean;
}

interface PropDefinition {
	name: string;
	type: string;
	required: boolean;
	defaultValue?: string;
}

interface ComponentConfig {
	name: string;
	props?: PropDefinition[];
	hooks?: string[];
	children?: boolean;
}
