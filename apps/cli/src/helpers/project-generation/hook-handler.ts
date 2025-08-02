import path from "node:path";
import fs from "fs-extra";
import { consola } from "consola";
import { log, select, confirm, multiselect, text } from "@clack/prompts";
import type { ProjectConfig, UISystem, Compliance, Language, Frontend } from "../../types";
import { detectProjectConfig } from "./detect-project-config";

// Hook types
export type HookType = "state" | "effect" | "custom" | "utility";

// Hook options interface
export interface HookOptions {
	type?: HookType;
	generics?: string[];
	dependencies?: string[];
	memoization?: boolean;
	errorHandling?: boolean;
	testing?: boolean;
	documentation?: boolean;
	performance?: boolean;
	ui?: UISystem;
	compliance?: Compliance;
	locales?: Language[];
	force?: boolean;
}

// Hook context interface
interface HookContext {
	name: string;
	hookName: string; // camelCase with 'use' prefix
	fileName: string; // kebab-case
	type: HookType;
	generics: string[];
	dependencies: string[];
	memoization: boolean;
	errorHandling: boolean;
	testing: boolean;
	documentation: boolean;
	performance: boolean;
	ui: UISystem;
	compliance: Compliance;
	locales: Language[];
	projectRoot: string;
	targetDir: string;
	framework: Frontend;
}

/**
 * Generate a React hook in an existing project
 */
export async function generateHookHandler(
	name: string,
	options: HookOptions = {}
): Promise<void> {
	try {
		// Step 1: Project root detection and validation
		const projectRoot = await detectProjectRoot();
		if (!projectRoot) {
			consola.error("Could not find project root. Are you in a xaheen project?");
			process.exit(1);
		}

		// Step 2: Load project configuration
		const projectConfig = await detectProjectConfig(projectRoot);
		if (!projectConfig) {
			consola.error("Could not detect project configuration. Is this a valid xaheen project?");
			process.exit(1);
		}

		// Step 3: Detect framework
		const framework = detectFramework(projectConfig);
		if (!framework || !["react", "next"].includes(framework)) {
			consola.error("Hook generation is only supported for React-based projects.");
			process.exit(1);
		}

		// Step 4: Hook naming
		const hookName = validateAndNormalizeHookName(name);
		const fileName = toKebabCase(hookName.replace(/^use/, ""));

		// Step 5: Hook type selection
		const hookType = options.type || await promptHookType();

		// Step 6: Generics configuration
		const generics = options.generics || await promptGenerics(hookType);

		// Step 7: Dependencies configuration
		const dependencies = options.dependencies || await promptDependencies(hookType);

		// Step 8: Feature flags
		const memoization = options.memoization ?? await promptFeature("Enable memoization optimization?", true);
		const errorHandling = options.errorHandling ?? await promptFeature("Include error handling?", true);
		const performance = options.performance ?? await promptFeature("Add performance optimizations?", true);
		const testing = options.testing ?? true;
		const documentation = options.documentation ?? true;

		// Step 9: UI and compliance settings
		const ui = options.ui || projectConfig.ui || "default";
		const compliance = options.compliance || projectConfig.compliance || "none";
		const locales = options.locales || projectConfig.locales || ["en"];

		// Step 10: Determine target directory
		const targetDir = await determineTargetDirectory(projectRoot, framework);

		// Step 11: Check for existing hook
		const hookPath = path.join(targetDir, `${fileName}.ts`);
		if (await fs.pathExists(hookPath) && !options.force) {
			const shouldOverwrite = await confirm({
				message: `Hook ${hookName} already exists. Overwrite?`,
				initialValue: false,
			});

			if (!shouldOverwrite) {
				consola.info("Hook generation cancelled.");
				return;
			}
		}

		// Create hook context
		const context: HookContext = {
			name,
			hookName,
			fileName,
			type: hookType,
			generics,
			dependencies,
			memoization,
			errorHandling,
			testing,
			documentation,
			performance,
			ui,
			compliance,
			locales,
			projectRoot,
			targetDir,
			framework,
		};

		// Generate the hook
		log.info(`Generating ${hookType} hook: ${hookName}`);
		
		// Generate hook file
		await generateHookFile(context);

		// Generate hook tests
		if (testing) {
			await generateHookTests(context);
		}

		// Generate hook documentation
		if (documentation) {
			await generateHookDocumentation(context);
		}

		log.success(`Hook ${hookName} generated successfully!`);
		
		// Display next steps
		displayNextSteps(context);

	} catch (error) {
		consola.error("Failed to generate hook:", error);
		process.exit(1);
	}
}

/**
 * Detect the project root
 */
async function detectProjectRoot(): Promise<string | null> {
	let currentDir = process.cwd();
	const root = path.parse(currentDir).root;

	while (currentDir !== root) {
		const packageJsonPath = path.join(currentDir, "package.json");
		const xaheenConfigPath = path.join(currentDir, "xaheen.config.json");
		const btsstackConfigPath = path.join(currentDir, "btsstack.config.json");

		if (await fs.pathExists(packageJsonPath)) {
			if (await fs.pathExists(xaheenConfigPath) || await fs.pathExists(btsstackConfigPath)) {
				return currentDir;
			}

			try {
				const packageJson = await fs.readJson(packageJsonPath);
				if (packageJson.dependencies?.["@xaheen/cli"] || 
					packageJson.devDependencies?.["@xaheen/cli"] ||
					packageJson.dependencies?.["xaheenstack"] ||
					packageJson.devDependencies?.["xaheenstack"]) {
					return currentDir;
				}
			} catch (error) {
				// Continue searching
			}
		}

		currentDir = path.dirname(currentDir);
	}

	return null;
}

/**
 * Detect the framework from project configuration
 */
function detectFramework(config: any): Frontend | null {
	if (config.frontend && Array.isArray(config.frontend) && config.frontend.length > 0) {
		return config.frontend[0];
	}
	return null;
}

/**
 * Validate and normalize hook name
 */
function validateAndNormalizeHookName(name: string): string {
	const cleanName = name.replace(/\.(ts|tsx|js|jsx)$/, "");

	if (!/^[a-zA-Z][a-zA-Z0-9-_]*$/.test(cleanName)) {
		throw new Error(
			"Hook name must start with a letter and contain only letters, numbers, hyphens, and underscores"
		);
	}

	// Ensure hook name starts with 'use'
	const hookName = cleanName.startsWith("use") ? cleanName : `use${toPascalCase(cleanName)}`;
	return toCamelCase(hookName);
}

/**
 * Convert to PascalCase
 */
function toPascalCase(str: string): string {
	return str
		.replace(/[-_](.)/g, (_, char) => char.toUpperCase())
		.replace(/^(.)/, (_, char) => char.toUpperCase());
}

/**
 * Convert to camelCase
 */
function toCamelCase(str: string): string {
	return str
		.replace(/[-_](.)/g, (_, char) => char.toUpperCase())
		.replace(/^(.)/, (_, char) => char.toLowerCase());
}

/**
 * Convert to kebab-case
 */
function toKebabCase(str: string): string {
	return str
		.replace(/([a-z])([A-Z])/g, "$1-$2")
		.toLowerCase();
}

/**
 * Prompt for hook type
 */
async function promptHookType(): Promise<HookType> {
	const type = await select({
		message: "What type of hook are you creating?",
		options: [
			{ value: "state", label: "State Hook - Manages component state with useState" },
			{ value: "effect", label: "Effect Hook - Side effects with useEffect" },
			{ value: "custom", label: "Custom Hook - Complex business logic composition" },
			{ value: "utility", label: "Utility Hook - Reusable helper functions" },
		],
	});

	return type as HookType;
}

/**
 * Prompt for generics
 */
async function promptGenerics(hookType: HookType): Promise<string[]> {
	let defaultGenerics: string[] = [];

	switch (hookType) {
		case "state":
			defaultGenerics = ["T"];
			break;
		case "custom":
			defaultGenerics = ["T", "R"];
			break;
		case "utility":
			defaultGenerics = ["T"];
			break;
	}

	const genericsInput = await text({
		message: "TypeScript generics (comma-separated):",
		placeholder: defaultGenerics.join(", "),
		initialValue: defaultGenerics.join(", "),
	});

	return genericsInput?.split(",").map(g => g.trim()).filter(Boolean) || defaultGenerics;
}

/**
 * Prompt for dependencies
 */
async function promptDependencies(hookType: HookType): Promise<string[]> {
	const availableDependencies = [
		"useState",
		"useEffect",
		"useCallback",
		"useMemo",
		"useRef",
		"useContext",
		"useReducer",
		"useImperativeHandle",
		"useLayoutEffect",
		"useDeferredValue",
		"useTransition",
		"useId",
	];

	let defaultSelected: string[] = [];

	switch (hookType) {
		case "state":
			defaultSelected = ["useState", "useCallback"];
			break;
		case "effect":
			defaultSelected = ["useEffect", "useCallback"];
			break;
		case "custom":
			defaultSelected = ["useState", "useEffect", "useCallback", "useMemo"];
			break;
		case "utility":
			defaultSelected = ["useCallback", "useMemo"];
			break;
	}

	const selectedDeps = await multiselect({
		message: "Select React hooks to use:",
		options: availableDependencies.map(dep => ({
			value: dep,
			label: dep,
			selected: defaultSelected.includes(dep)
		})),
		required: false,
	});

	return Array.isArray(selectedDeps) ? selectedDeps : defaultSelected;
}

/**
 * Prompt for feature enabling
 */
async function promptFeature(message: string, defaultValue: boolean): Promise<boolean> {
	const result = await confirm({
		message,
		initialValue: defaultValue,
	});

	return result === true;
}

/**
 * Determine target directory
 */
async function determineTargetDirectory(
	projectRoot: string,
	framework: Frontend
): Promise<string> {
	let baseDir = path.join(projectRoot, "src", "hooks");

	await fs.ensureDir(baseDir);
	return baseDir;
}

/**
 * Generate hook file
 */
async function generateHookFile(context: HookContext): Promise<void> {
	const { hookName, fileName, targetDir } = context;
	const hookPath = path.join(targetDir, `${fileName}.ts`);

	const imports = generateHookImports(context);
	const interfaces = generateHookInterfaces(context);
	const hookImplementation = generateHookImplementation(context);

	const content = `${imports}

${interfaces}

${hookImplementation}
`;

	await fs.writeFile(hookPath, content);
}

/**
 * Generate hook imports
 */
function generateHookImports(context: HookContext): string {
	const imports = new Set<string>(["React"]);

	// Add React hook imports
	context.dependencies.forEach(dep => {
		imports.add(dep);
	});

	// Add additional imports based on features
	if (context.errorHandling) {
		imports.add("useCallback");
	}

	const reactImports = Array.from(imports);
	const importString = `import { ${reactImports.join(", ")} } from 'react';`;

	const additionalImports: string[] = [];

	// Add type imports
	if (context.generics.length > 0) {
		additionalImports.push(`import type { ${context.hookName}Options, ${context.hookName}Result } from './types';`);
	}

	return [importString, ...additionalImports].join("\n");
}

/**
 * Generate hook interfaces
 */
function generateHookInterfaces(context: HookContext): string {
	const { hookName, generics, type, errorHandling } = context;

	const interfaces: string[] = [];

	// Options interface
	if (type === "custom" || type === "utility") {
		const genericString = generics.length > 0 ? `<${generics.join(", ")}>` : "";
		interfaces.push(`export interface ${hookName}Options${genericString} {
  // Configuration options for the hook
  enabled?: boolean;
  ${errorHandling ? "onError?: (error: Error) => void;" : ""}
  ${type === "custom" ? "initialValue?: T;" : ""}
}`);
	}

	// Result interface
	const genericString = generics.length > 0 ? `<${generics.join(", ")}>` : "";
	let resultInterface = `export interface ${hookName}Result${genericString} {`;

	switch (type) {
		case "state":
			resultInterface += `
  value: ${generics[0] || "any"};
  setValue: (value: ${generics[0] || "any"}) => void;
  reset: () => void;`;
			break;
		case "effect":
			resultInterface += `
  isLoading: boolean;
  data: ${generics[0] || "any"} | null;
  refetch: () => void;`;
			break;
		case "custom":
			resultInterface += `
  data: ${generics[1] || "any"} | null;
  isLoading: boolean;
  execute: (input: ${generics[0] || "any"}) => Promise<void>;`;
			break;
		case "utility":
			resultInterface += `
  result: ${generics[0] || "any"} | null;
  execute: (...args: any[]) => ${generics[0] || "any"};`;
			break;
	}

	if (errorHandling) {
		resultInterface += `
  error: Error | null;
  clearError: () => void;`;
	}

	resultInterface += `
}`;

	interfaces.push(resultInterface);

	return interfaces.join("\n\n");
}

/**
 * Generate hook implementation
 */
function generateHookImplementation(context: HookContext): string {
	const { hookName, generics, type, dependencies, memoization, errorHandling, performance } = context;

	const genericString = generics.length > 0 ? `<${generics.join(", ")}>` : "";
	const paramsString = type === "custom" || type === "utility" ? 
		`options: ${hookName}Options${genericString} = {}` : 
		`initialValue${generics.length > 0 ? `: ${generics[0]}` : ""} = null`;

	let implementation = `export const ${hookName} = ${genericString}(${paramsString}): ${hookName}Result${genericString} => {`;

	// State declarations
	implementation += generateStateDeclarations(context);

	// Hook logic based on type
	implementation += generateHookLogic(context);

	// Memoized values
	if (memoization) {
		implementation += generateMemoizedValues(context);
	}

	// Return statement
	implementation += generateReturnStatement(context);

	implementation += "\n};";

	return implementation;
}

/**
 * Generate state declarations
 */
function generateStateDeclarations(context: HookContext): string {
	const { type, errorHandling, dependencies } = context;

	let declarations = "\n";

	switch (type) {
		case "state":
			declarations += "  const [value, setValue] = useState(initialValue);\n";
			break;
		case "effect":
			declarations += "  const [isLoading, setIsLoading] = useState(false);\n";
			declarations += "  const [data, setData] = useState(null);\n";
			break;
		case "custom":
			declarations += "  const [data, setData] = useState(null);\n";
			declarations += "  const [isLoading, setIsLoading] = useState(false);\n";
			break;
		case "utility":
			declarations += "  const [result, setResult] = useState(null);\n";
			break;
	}

	if (errorHandling) {
		declarations += "  const [error, setError] = useState<Error | null>(null);\n";
	}

	return declarations;
}

/**
 * Generate hook logic
 */
function generateHookLogic(context: HookContext): string {
	const { type, dependencies, errorHandling } = context;

	let logic = "\n";

	// Error handling wrapper
	const wrapWithErrorHandling = (code: string) => {
		if (!errorHandling) return code;
		return `    try {
      ${code.replace(/\n/g, "\n      ")}
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Unknown error'));
    }`;
	};

	switch (type) {
		case "state":
			logic += `  const reset = useCallback(() => {
${wrapWithErrorHandling("setValue(initialValue);")}
  }, [initialValue]);\n`;
			break;

		case "effect":
			if (dependencies.includes("useEffect")) {
				logic += `  const refetch = useCallback(async () => {
    setIsLoading(true);
${wrapWithErrorHandling(`
    // TODO: Implement data fetching logic
    const result = await fetchData();
    setData(result);
`)}
    setIsLoading(false);
  }, []);

  useEffect(() => {
    refetch();
  }, [refetch]);\n`;
			}
			break;

		case "custom":
			logic += `  const execute = useCallback(async (input) => {
    setIsLoading(true);
${wrapWithErrorHandling(`
    // TODO: Implement custom hook logic
    const result = await processInput(input);
    setData(result);
`)}
    setIsLoading(false);
  }, []);\n`;
			break;

		case "utility":
			logic += `  const execute = useCallback((...args) => {
${wrapWithErrorHandling(`
    // TODO: Implement utility function logic
    const computed = computeResult(...args);
    setResult(computed);
    return computed;
`)}
  }, []);\n`;
			break;
	}

	// Error clearing function
	if (errorHandling) {
		logic += `
  const clearError = useCallback(() => {
    setError(null);
  }, []);\n`;
	}

	return logic;
}

/**
 * Generate memoized values
 */
function generateMemoizedValues(context: HookContext): string {
	const { type, dependencies } = context;

	if (!dependencies.includes("useMemo")) return "";

	let memoized = "\n";

	switch (type) {
		case "custom":
		case "utility":
			memoized += `  const memoizedResult = useMemo(() => {
    // TODO: Add expensive computation here
    return data;
  }, [data]);\n`;
			break;
	}

	return memoized;
}

/**
 * Generate return statement
 */
function generateReturnStatement(context: HookContext): string {
	const { type, errorHandling, memoization, dependencies } = context;

	let returnObj = "\n  return {";

	switch (type) {
		case "state":
			returnObj += `
    value,
    setValue,
    reset`;
			break;
		case "effect":
			returnObj += `
    isLoading,
    data,
    refetch`;
			break;
		case "custom":
			returnObj += `
    data: ${memoization && dependencies.includes("useMemo") ? "memoizedResult" : "data"},
    isLoading,
    execute`;
			break;
		case "utility":
			returnObj += `
    result: ${memoization && dependencies.includes("useMemo") ? "memoizedResult" : "result"},
    execute`;
			break;
	}

	if (errorHandling) {
		returnObj += `,
    error,
    clearError`;
	}

	returnObj += `
  };`;

	return returnObj;
}

/**
 * Generate hook tests
 */
async function generateHookTests(context: HookContext): Promise<void> {
	const { hookName, fileName, projectRoot, type } = context;
	const testsDir = path.join(projectRoot, "src", "__tests__", "hooks");
	await fs.ensureDir(testsDir);

	const testPath = path.join(testsDir, `${fileName}.test.ts`);

	const imports = [
		"import { renderHook, act } from '@testing-library/react';",
		`import { ${hookName} } from '../hooks/${fileName}';`
	];

	const testCases = generateTestCases(context);

	const content = `${imports.join("\n")}

describe('${hookName}', () => {
${testCases}
});
`;

	await fs.writeFile(testPath, content);
}

/**
 * Generate test cases based on hook type
 */
function generateTestCases(context: HookContext): string {
	const { hookName, type, errorHandling } = context;

	let testCases = "";

	switch (type) {
		case "state":
			testCases = `  it('should initialize with initial value', () => {
    const { result } = renderHook(() => ${hookName}('initial'));
    expect(result.current.value).toBe('initial');
  });

  it('should update value', () => {
    const { result } = renderHook(() => ${hookName}('initial'));
    
    act(() => {
      result.current.setValue('updated');
    });
    
    expect(result.current.value).toBe('updated');
  });

  it('should reset to initial value', () => {
    const { result } = renderHook(() => ${hookName}('initial'));
    
    act(() => {
      result.current.setValue('updated');
      result.current.reset();
    });
    
    expect(result.current.value).toBe('initial');
  });`;
			break;

		case "effect":
			testCases = `  it('should start with loading state', () => {
    const { result } = renderHook(() => ${hookName}());
    expect(result.current.isLoading).toBe(true);
  });

  it('should refetch data', () => {
    const { result } = renderHook(() => ${hookName}());
    
    act(() => {
      result.current.refetch();
    });
    
    expect(result.current.isLoading).toBe(true);
  });`;
			break;

		case "custom":
			testCases = `  it('should initialize correctly', () => {
    const { result } = renderHook(() => ${hookName}());
    expect(result.current.data).toBe(null);
    expect(result.current.isLoading).toBe(false);
  });

  it('should execute function', async () => {
    const { result } = renderHook(() => ${hookName}());
    
    await act(async () => {
      await result.current.execute('test input');
    });
    
    // TODO: Add specific assertions based on your hook logic
  });`;
			break;

		case "utility":
			testCases = `  it('should execute utility function', () => {
    const { result } = renderHook(() => ${hookName}());
    
    act(() => {
      const output = result.current.execute('test input');
      // TODO: Add specific assertions based on your utility logic
    });
  });`;
			break;
	}

	if (errorHandling) {
		testCases += `

  it('should handle errors', () => {
    const { result } = renderHook(() => ${hookName}());
    
    // TODO: Trigger an error condition and test error handling
    expect(result.current.error).toBe(null);
  });

  it('should clear errors', () => {
    const { result } = renderHook(() => ${hookName}());
    
    act(() => {
      result.current.clearError();
    });
    
    expect(result.current.error).toBe(null);
  });`;
	}

	return testCases;
}

/**
 * Generate hook documentation
 */
async function generateHookDocumentation(context: HookContext): Promise<void> {
	const { hookName, fileName, projectRoot, type, generics, dependencies } = context;
	const docsDir = path.join(projectRoot, "docs", "hooks");
	await fs.ensureDir(docsDir);

	const docPath = path.join(docsDir, `${fileName}.md`);

	const content = `# ${hookName}

## Overview

${getHookDescription(type)}

## Usage

\`\`\`typescript
import { ${hookName} } from '@/hooks/${fileName}';

function MyComponent() {
  const ${getUsageExample(context)};

  return (
    <div>
      {/* Use the hook result in your component */}
    </div>
  );
}
\`\`\`

## API

### Parameters

${getParameterDocumentation(context)}

### Return Value

Returns a \`${hookName}Result\` object with the following properties:

${getReturnValueDocumentation(context)}

## Examples

### Basic Usage

\`\`\`typescript
${getBasicExample(context)}
\`\`\`

${context.errorHandling ? `### Error Handling

\`\`\`typescript
${getErrorHandlingExample(context)}
\`\`\`
` : ""}

## TypeScript

${generics.length > 0 ? `This hook supports TypeScript generics:

\`\`\`typescript
${getGenericExample(context)}
\`\`\`
` : "This hook is fully typed with TypeScript."}

## Testing

The hook includes comprehensive tests. Run them with:

\`\`\`bash
npm test -- ${fileName}.test.ts
\`\`\`

## Dependencies

${dependencies.length > 0 ? `This hook uses the following React hooks:
${dependencies.map(dep => `- \`${dep}\``).join("\n")}` : "This hook has no external dependencies."}
`;

	await fs.writeFile(docPath, content);
}

/**
 * Get hook description based on type
 */
function getHookDescription(type: HookType): string {
	switch (type) {
		case "state":
			return "A custom hook for managing component state with additional utilities.";
		case "effect":
			return "A custom hook for handling side effects and data fetching.";
		case "custom":
			return "A custom hook that encapsulates complex business logic and state management.";
		case "utility":
			return "A utility hook that provides reusable functionality across components.";
		default:
			return "A custom React hook for specialized functionality.";
	}
}

/**
 * Get usage example based on context
 */
function getUsageExample(context: HookContext): string {
	const { hookName, type } = context;

	switch (type) {
		case "state":
			return `{ value, setValue, reset } = ${hookName}('initial')`;
		case "effect":
			return `{ data, isLoading, refetch } = ${hookName}()`;
		case "custom":
			return `{ data, isLoading, execute } = ${hookName}()`;
		case "utility":
			return `{ result, execute } = ${hookName}()`;
		default:
			return `result = ${hookName}()`;
	}
}

/**
 * Get parameter documentation
 */
function getParameterDocumentation(context: HookContext): string {
	const { type, generics } = context;

	switch (type) {
		case "state":
			return `- \`initialValue\`: ${generics[0] || "any"} - The initial state value`;
		case "custom":
		case "utility":
			return `- \`options\`: \`${context.hookName}Options\` - Configuration options for the hook`;
		default:
			return "This hook takes no parameters.";
	}
}

/**
 * Get return value documentation
 */
function getReturnValueDocumentation(context: HookContext): string {
	const { type, errorHandling } = context;

	let docs = "";

	switch (type) {
		case "state":
			docs = `- \`value\`: The current state value
- \`setValue\`: Function to update the state value
- \`reset\`: Function to reset to initial value`;
			break;
		case "effect":
			docs = `- \`data\`: The fetched data
- \`isLoading\`: Loading state boolean
- \`refetch\`: Function to refetch data`;
			break;
		case "custom":
			docs = `- \`data\`: The processed data
- \`isLoading\`: Loading state boolean
- \`execute\`: Function to execute the hook logic`;
			break;
		case "utility":
			docs = `- \`result\`: The computed result
- \`execute\`: Function to execute the utility logic`;
			break;
	}

	if (errorHandling) {
		docs += `
- \`error\`: Error object if an error occurred
- \`clearError\`: Function to clear the error state`;
	}

	return docs;
}

/**
 * Get basic example
 */
function getBasicExample(context: HookContext): string {
	const { hookName, type } = context;

	switch (type) {
		case "state":
			return `const { value, setValue, reset } = ${hookName}('Hello World');

// Update the value
setValue('New Value');

// Reset to initial
reset();`;

		case "effect":
			return `const { data, isLoading, refetch } = ${hookName}();

if (isLoading) {
  return <div>Loading...</div>;
}

// Refetch data
refetch();`;

		case "custom":
			return `const { data, isLoading, execute } = ${hookName}();

// Execute the hook logic
await execute(inputData);`;

		case "utility":
			return `const { result, execute } = ${hookName}();

// Execute the utility function
const output = execute(inputValue);`;

		default:
			return `const result = ${hookName}();`;
	}
}

/**
 * Get error handling example
 */
function getErrorHandlingExample(context: HookContext): string {
	const { hookName, type } = context;

	return `const { ${getUsageExample(context).split(" = ")[0]}, error, clearError } = ${hookName}();

if (error) {
  return (
    <div>
      <p>Error: {error.message}</p>
      <button onClick={clearError}>Clear Error</button>
    </div>
  );
}`;
}

/**
 * Get generic example
 */
function getGenericExample(context: HookContext): string {
	const { hookName, generics } = context;

	if (generics.length === 0) return "";

	return `interface User {
  id: string;
  name: string;
  email: string;
}

const { ${getUsageExample(context).split(" = ")[0]} } = ${hookName}<User${generics.length > 1 ? ", UserResponse" : ""}>();`;
}

/**
 * Display next steps
 */
function displayNextSteps(context: HookContext): void {
	const { hookName, type, testing, documentation } = context;

	const steps = [
		`Hook ${hookName} created successfully!`,
		"",
		"Generated files:",
		`  - ${context.fileName}.ts (main hook)`,
	];

	if (testing) {
		steps.push(`  - __tests__/hooks/${context.fileName}.test.ts`);
	}

	if (documentation) {
		steps.push(`  - docs/hooks/${context.fileName}.md`);
	}

	steps.push("", "Next steps:");
	steps.push("1. Implement the hook logic with your specific requirements");
	steps.push("2. Add proper TypeScript types for your use case");
	
	if (testing) {
		steps.push("3. Write comprehensive tests for all hook behaviors");
	}

	steps.push(`${testing ? "4" : "3"}. Import and use the hook in your components`);

	if (context.performance) {
		steps.push(`${steps.length - 5}. Optimize performance with memoization where needed`);
	}

	if (context.errorHandling) {
		steps.push(`${steps.length - 5}. Handle errors appropriately in your components`);
	}

	consola.box(steps.join("\n"));
}