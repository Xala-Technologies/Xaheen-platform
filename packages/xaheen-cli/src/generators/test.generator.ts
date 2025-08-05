/**
 * Test Generator - Comprehensive test generation for existing code
 *
 * Generates unit, integration, e2e tests with Norwegian compliance testing
 *
 * @author Xaheen CLI Generator System
 * @since 2025-08-05
 */

import { confirm, isCancel, multiselect, select, text } from '@clack/prompts';
import chalk from 'chalk';
import { promises as fs } from 'fs';
import Handlebars from 'handlebars';
import path from 'path';
import {
	BaseGenerator,
	BaseGeneratorOptions,
	GeneratorResult,
} from './base.generator.js';

// Register Handlebars helpers
Handlebars.registerHelper('eq', (a, b) => a === b);
Handlebars.registerHelper('includes', (array, value) => array && array.includes(value));
Handlebars.registerHelper('camelCase', (str: string) => {
	return str.charAt(0).toLowerCase() + str.slice(1).replace(/[-_](.)/g, (_, char) => char.toUpperCase());
});
Handlebars.registerHelper('generatedAt', () => new Date().toISOString());

export interface TestGeneratorOptions extends BaseGeneratorOptions {
	readonly name: string;
	readonly targetFile?: string;
	readonly testTypes?: ('unit' | 'integration' | 'e2e' | 'accessibility' | 'performance' | 'security')[];
	readonly framework?: 'jest' | 'vitest' | 'mocha' | 'playwright' | 'cypress';
	readonly testingLibrary?: 'react-testing-library' | 'vue-testing-library' | 'angular-testing-library' | 'none';
	readonly coverage?: boolean;
	readonly mocks?: boolean;
	readonly fixtures?: boolean;
	readonly norwegian?: boolean;
	readonly accessibility?: boolean;
	readonly typescript?: boolean;
	readonly dryRun?: boolean;
	readonly force?: boolean;
}

export interface TestCase {
	readonly name: string;
	readonly type: 'unit' | 'integration' | 'e2e';
	readonly description: string;
	readonly setup?: string;
	readonly assertion: string;
	readonly cleanup?: string;
}

export interface TestFixture {
	readonly name: string;
	readonly type: 'data' | 'component' | 'api' | 'user';
	readonly content: any;
}

export class TestGenerator extends BaseGenerator<TestGeneratorOptions> {
	private readonly testTypes = [
		{
			value: 'unit',
			label: 'Unit Tests',
			hint: 'Test individual functions and components',
		},
		{
			value: 'integration',
			label: 'Integration Tests',
			hint: 'Test component interactions and API calls',
		},
		{
			value: 'e2e',
			label: 'End-to-End Tests',
			hint: 'Test complete user workflows',
		},
		{
			value: 'accessibility',
			label: 'Accessibility Tests',
			hint: 'Test WCAG compliance and screen reader support',
		},
		{
			value: 'performance',
			label: 'Performance Tests',
			hint: 'Test loading times and resource usage',
		},
		{
			value: 'security',
			label: 'Security Tests',
			hint: 'Test for security vulnerabilities',
		},
	];

	private readonly testFrameworks = [
		{
			value: 'jest',
			label: 'Jest',
			hint: 'Most popular JavaScript testing framework',
		},
		{
			value: 'vitest',
			label: 'Vitest',
			hint: 'Fast Vite-native test framework',
		},
		{
			value: 'mocha',
			label: 'Mocha',
			hint: 'Flexible JavaScript test framework',
		},
		{
			value: 'playwright',
			label: 'Playwright',
			hint: 'Modern e2e testing framework',
		},
		{
			value: 'cypress',
			label: 'Cypress',
			hint: 'Popular e2e testing framework',
		},
	];

	private readonly testingLibraries = [
		{
			value: 'react-testing-library',
			label: 'React Testing Library',
			hint: 'Test React components',
		},
		{
			value: 'vue-testing-library',
			label: 'Vue Testing Library',
			hint: 'Test Vue components',
		},
		{
			value: 'angular-testing-library',
			label: 'Angular Testing Library',
			hint: 'Test Angular components',
		},
		{
			value: 'none',
			label: 'None',
			hint: 'Framework-agnostic testing',
		},
	];

	getGeneratorType(): string {
		return 'test';
	}

	async generate(options: TestGeneratorOptions): Promise<GeneratorResult> {
		await this.validateOptions(options);

		this.logger.info(`Generating tests: ${chalk.cyan(options.name)}`);

		// Detect testing framework and library
		const framework = options.framework || await this.detectTestingFramework();
		const testingLibrary = options.testingLibrary || await this.detectTestingLibrary();

		// Interactive prompts for missing options
		const testOptions = await this.promptForMissingTestOptions(options, framework, testingLibrary);

		// Analyze target file if provided
		let targetAnalysis = null;
		if (testOptions.targetFile) {
			targetAnalysis = await this.analyzeTargetFile(testOptions.targetFile);
		}

		// Generate test data
		const naming = this.getNamingConvention(options.name);
		const testData = {
			name: options.name,
			className: naming.className,
			fileName: naming.kebabCase,
			targetFile: testOptions.targetFile,
			targetAnalysis,
			testTypes: testOptions.testTypes || ['unit'],
			framework,
			testingLibrary,
			coverage: testOptions.coverage !== false,
			mocks: testOptions.mocks !== false,
			fixtures: testOptions.fixtures !== false,
			norwegian: testOptions.norwegian || false,
			accessibility: testOptions.accessibility !== false,
			typescript: options.typescript !== false,
			testCases: this.generateTestCases(targetAnalysis, testOptions.testTypes || ['unit']),
			mockData: this.generateMockData(targetAnalysis),
			fixtureData: this.generateFixtureData(targetAnalysis),
			hasTestType: (type: string) => testOptions.testTypes?.includes(type as any) || false,
			...naming,
		};

		const generatedFiles: string[] = [];

		// Generate main test file
		const testFile = await this.generateTestFile(testData, options);
		if (testFile) generatedFiles.push(testFile);

		// Generate test utilities
		const utilsFile = await this.generateTestUtils(testData, options);
		if (utilsFile) generatedFiles.push(utilsFile);

		// Generate mocks if enabled
		if (testData.mocks) {
			const mocksFile = await this.generateMocks(testData, options);
			if (mocksFile) generatedFiles.push(mocksFile);
		}

		// Generate fixtures if enabled
		if (testData.fixtures) {
			const fixturesFile = await this.generateFixtures(testData, options);
			if (fixturesFile) generatedFiles.push(fixturesFile);
		}

		// Generate accessibility tests if enabled
		if (testData.accessibility || testData.hasTestType('accessibility')) {
			const a11yFile = await this.generateAccessibilityTests(testData, options);
			if (a11yFile) generatedFiles.push(a11yFile);
		}

		// Generate Norwegian compliance tests if enabled
		if (testData.norwegian) {
			const complianceFiles = await this.generateNorwegianComplianceTests(testData, options);
			generatedFiles.push(...complianceFiles);
		}

		// Generate e2e tests if enabled
		if (testData.hasTestType('e2e')) {
			const e2eFile = await this.generateE2ETests(testData, options);
			if (e2eFile) generatedFiles.push(e2eFile);
		}

		// Generate performance tests if enabled
		if (testData.hasTestType('performance')) {
			const perfFile = await this.generatePerformanceTests(testData, options);
			if (perfFile) generatedFiles.push(perfFile);
		}

		// Generate security tests if enabled
		if (testData.hasTestType('security')) {
			const securityFile = await this.generateSecurityTests(testData, options);
			if (securityFile) generatedFiles.push(securityFile);
		}

		// Generate test configuration
		const configFile = await this.generateTestConfig(testData, options);
		if (configFile) generatedFiles.push(configFile);

		this.logger.success(`Tests ${chalk.green(options.name)} generated successfully!`);

		return {
			success: true,
			message: `Tests ${options.name} generated successfully`,
			files: generatedFiles,
			commands: this.getRecommendedCommands(testData),
			nextSteps: this.getNextSteps(testData),
		};
	}

	private async detectTestingFramework(): Promise<'jest' | 'vitest' | 'mocha' | 'playwright' | 'cypress'> {
		try {
			const packageJsonPath = path.join(process.cwd(), 'package.json');
			const packageJson = JSON.parse(
				await fs.readFile(packageJsonPath, 'utf-8'),
			);
			const dependencies = {
				...packageJson.dependencies,
				...packageJson.devDependencies,
			};

			if (dependencies['vitest']) return 'vitest';
			if (dependencies['jest']) return 'jest';
			if (dependencies['playwright']) return 'playwright';
			if (dependencies['cypress']) return 'cypress';
			if (dependencies['mocha']) return 'mocha';

			// Interactive selection if no framework detected
			const selectedFramework = await select({
				message: 'Which testing framework would you like to use?',
				options: this.testFrameworks,
			});

			if (isCancel(selectedFramework)) {
				throw new Error('Testing framework selection cancelled');
			}

			return selectedFramework as 'jest' | 'vitest' | 'mocha' | 'playwright' | 'cypress';
		} catch {
			return 'jest'; // Default fallback
		}
	}

	private async detectTestingLibrary(): Promise<'react-testing-library' | 'vue-testing-library' | 'angular-testing-library' | 'none'> {
		try {
			const packageJsonPath = path.join(process.cwd(), 'package.json');
			const packageJson = JSON.parse(
				await fs.readFile(packageJsonPath, 'utf-8'),
			);
			const dependencies = {
				...packageJson.dependencies,
				...packageJson.devDependencies,
			};

			if (dependencies['@testing-library/react']) return 'react-testing-library';
			if (dependencies['@testing-library/vue']) return 'vue-testing-library';
			if (dependencies['@testing-library/angular']) return 'angular-testing-library';

			return 'none';
		} catch {
			return 'none';
		}
	}

	private async promptForMissingTestOptions(
		options: TestGeneratorOptions,
		framework: string,
		testingLibrary: string
	): Promise<TestGeneratorOptions> {
		const result = { ...options, framework, testingLibrary };

		// Test types selection
		if (!result.testTypes) {
			const testTypes = await multiselect({
				message: 'What types of tests would you like to generate?',
				options: this.testTypes,
				required: true,
			});

			if (!isCancel(testTypes)) {
				result.testTypes = testTypes as any;
			}
		}

		// Target file input
		if (!result.targetFile) {
			const targetFile = await text({
				message: 'Target file to test (optional):',
				placeholder: 'src/components/Button.tsx',
			});

			if (!isCancel(targetFile) && targetFile) {
				result.targetFile = targetFile as string;
			}
		}

		// Coverage
		if (result.coverage === undefined) {
			const coverage = await confirm({
				message: 'Generate code coverage reports?',
			});

			if (!isCancel(coverage)) {
				result.coverage = coverage as boolean;
			}
		}

		// Mocks
		if (result.mocks === undefined) {
			const mocks = await confirm({
				message: 'Generate mock data and functions?',
			});

			if (!isCancel(mocks)) {
				result.mocks = mocks as boolean;
			}
		}

		// Fixtures
		if (result.fixtures === undefined) {
			const fixtures = await confirm({
				message: 'Generate test fixtures?',
			});

			if (!isCancel(fixtures)) {
				result.fixtures = fixtures as boolean;
			}
		}

		// Norwegian compliance
		if (result.norwegian === undefined) {
			const norwegian = await confirm({
				message: 'Generate Norwegian compliance tests?',
			});

			if (!isCancel(norwegian)) {
				result.norwegian = norwegian as boolean;
			}
		}

		// Accessibility tests
		if (result.accessibility === undefined && !result.testTypes?.includes('accessibility')) {
			const accessibility = await confirm({
				message: 'Generate accessibility tests?',
			});

			if (!isCancel(accessibility)) {
				result.accessibility = accessibility as boolean;
			}
		}

		return result;
	}

	private async analyzeTargetFile(targetFile: string): Promise<any> {
		try {
			const fullPath = path.resolve(process.cwd(), targetFile);
			const content = await fs.readFile(fullPath, 'utf-8');
			
			// Basic analysis of the target file
			const analysis = {
				filePath: fullPath,
				fileName: path.basename(fullPath),
				extension: path.extname(fullPath),
				isTypeScript: fullPath.endsWith('.ts') || fullPath.endsWith('.tsx'),
				isReact: content.includes('React') || fullPath.endsWith('.tsx'),
				isVue: content.includes('Vue') || fullPath.endsWith('.vue'),
				functions: this.extractFunctions(content),
				classes: this.extractClasses(content),
				exports: this.extractExports(content),
				imports: this.extractImports(content),
				hasAsync: content.includes('async'),
				hasProps: content.includes('Props') || content.includes('props'),
				hasState: content.includes('useState') || content.includes('state'),
				hasEffects: content.includes('useEffect') || content.includes('effect'),
			};

			return analysis;
		} catch (error) {
			this.logger.warn(`Could not analyze target file: ${error}`);
			return null;
		}
	}

	private extractFunctions(content: string): string[] {
		const functionRegex = /(?:function\s+(\w+)|const\s+(\w+)\s*=.*?(?:function|\(.*?\)\s*=>))/g;
		const functions = [];
		let match;
		
		while ((match = functionRegex.exec(content)) !== null) {
			functions.push(match[1] || match[2]);
		}
		
		return functions;
	}

	private extractClasses(content: string): string[] {
		const classRegex = /class\s+(\w+)/g;
		const classes = [];
		let match;
		
		while ((match = classRegex.exec(content)) !== null) {
			classes.push(match[1]);
		}
		
		return classes;
	}

	private extractExports(content: string): string[] {
		const exportRegex = /export\s+(?:default\s+)?(?:class|function|const|let|var)?\s*(\w+)/g;
		const exports = [];
		let match;
		
		while ((match = exportRegex.exec(content)) !== null) {
			exports.push(match[1]);
		}
		
		return exports;
	}

	private extractImports(content: string): string[] {
		const importRegex = /import.*?from\s+['"]([^'"]+)['"]/g;
		const imports = [];
		let match;
		
		while ((match = importRegex.exec(content)) !== null) {
			imports.push(match[1]);
		}
		
		return imports;
	}

	private generateTestCases(targetAnalysis: any, testTypes: string[]): TestCase[] {
		const testCases: TestCase[] = [];

		if (!targetAnalysis) {
			// Generic test cases
			testCases.push({
				name: 'basic functionality',
				type: 'unit',
				description: 'should work correctly',
				assertion: 'expect(result).toBeDefined()',
			});
			return testCases;
		}

		// Generate test cases based on analysis
		if (targetAnalysis.functions) {
			for (const func of targetAnalysis.functions) {
				testCases.push({
					name: `${func} function`,
					type: 'unit',
					description: `should execute ${func} correctly`,
					assertion: `expect(${func}).toBeDefined()`,
				});

				if (targetAnalysis.hasAsync) {
					testCases.push({
						name: `${func} async behavior`,
						type: 'unit',
						description: `should handle async operations in ${func}`,
						assertion: `await expect(${func}()).resolves.toBeDefined()`,
					});
				}
			}
		}

		if (targetAnalysis.isReact && targetAnalysis.hasProps) {
			testCases.push({
				name: 'component props',
				type: 'unit',
				description: 'should render with correct props',
				assertion: 'expect(component).toHaveTextContent(expectedText)',
			});
		}

		if (targetAnalysis.hasState) {
			testCases.push({
				name: 'state management',
				type: 'integration',
				description: 'should manage state correctly',
				assertion: 'expect(stateValue).toBe(expectedValue)',
			});
		}

		return testCases;
	}

	private generateMockData(targetAnalysis: any): any {
		if (!targetAnalysis) {
			return {
				mockUser: {
					id: 1,
					name: 'Test User',
					email: 'test@example.com',
				},
			};
		}

		const mocks: any = {};

		if (targetAnalysis.isReact) {
			mocks.mockProps = {
				title: 'Test Title',
				onClick: 'jest.fn()',
				disabled: false,
			};
		}

		if (targetAnalysis.imports?.includes('axios')) {
			mocks.mockAxios = {
				get: 'jest.fn()',
				post: 'jest.fn()',
				put: 'jest.fn()',
				delete: 'jest.fn()',
			};
		}

		return mocks;
	}

	private generateFixtureData(targetAnalysis: any): TestFixture[] {
		const fixtures: TestFixture[] = [];

		if (targetAnalysis?.isReact) {
			fixtures.push({
				name: 'componentProps',
				type: 'component',
				content: {
					title: 'Fixture Title',
					description: 'Test description',
					variant: 'primary',
				},
			});
		}

		fixtures.push({
			name: 'userData',
			type: 'data',
			content: {
				id: 1,
				name: 'Ola Nordmann',
				email: 'ola@example.no',
				role: 'user',
			},
		});

		fixtures.push({
			name: 'apiResponse',
			type: 'api',
			content: {
				data: { success: true },
				status: 200,
				message: 'OK',
			},
		});

		return fixtures;
	}

	private async generateTestFile(testData: any, options: TestGeneratorOptions): Promise<string | null> {
		const templateName = this.getTestTemplate(testData.framework, testData.testingLibrary);
		const filePath = this.getTestFilePath(testData);
		
		try {
			return await this.generateFile(
				templateName,
				filePath,
				testData,
				{ dryRun: options.dryRun, force: options.force }
			);
		} catch (error) {
			this.logger.warn(`Failed to generate test file: ${error}`);
			return null;
		}
	}

	private async generateTestUtils(testData: any, options: TestGeneratorOptions): Promise<string | null> {
		const templateName = 'test/test-utils.hbs';
		const filePath = path.join(process.cwd(), 'src', '__tests__', 'utils', 'test-utils.ts');
		
		try {
			return await this.generateFile(
				templateName,
				filePath,
				testData,
				{ dryRun: options.dryRun, force: options.force }
			);
		} catch (error) {
			this.logger.warn(`Failed to generate test utils: ${error}`);
			return null;
		}
	}

	private async generateMocks(testData: any, options: TestGeneratorOptions): Promise<string | null> {
		const templateName = 'test/mocks.hbs';
		const filePath = path.join(process.cwd(), 'src', '__tests__', '__mocks__', `${testData.fileName}.mock.ts`);
		
		try {
			return await this.generateFile(
				templateName,
				filePath,
				testData,
				{ dryRun: options.dryRun, force: options.force }
			);
		} catch (error) {
			this.logger.warn(`Failed to generate mocks: ${error}`);
			return null;
		}
	}

	private async generateFixtures(testData: any, options: TestGeneratorOptions): Promise<string | null> {
		const templateName = 'test/fixtures.hbs';
		const filePath = path.join(process.cwd(), 'src', '__tests__', 'fixtures', `${testData.fileName}.fixture.ts`);
		
		try {
			return await this.generateFile(
				templateName,
				filePath,
				testData,
				{ dryRun: options.dryRun, force: options.force }
			);
		} catch (error) {
			this.logger.warn(`Failed to generate fixtures: ${error}`);
			return null;
		}
	}

	private async generateAccessibilityTests(testData: any, options: TestGeneratorOptions): Promise<string | null> {
		const templateName = 'test/accessibility-tests.hbs';
		const filePath = path.join(process.cwd(), 'src', '__tests__', 'accessibility', `${testData.fileName}.a11y.test.ts`);
		
		try {
			return await this.generateFile(
				templateName,
				filePath,
				testData,
				{ dryRun: options.dryRun, force: options.force }
			);
		} catch (error) {
			this.logger.warn(`Failed to generate accessibility tests: ${error}`);
			return null;
		}
	}

	private async generateNorwegianComplianceTests(testData: any, options: TestGeneratorOptions): Promise<string[]> {
		const files: string[] = [];

		// Generate UU compliance tests
		try {
			const uuFile = await this.generateFile(
				'test/norwegian/uu-compliance.hbs',
				path.join(process.cwd(), 'src', '__tests__', 'compliance', `${testData.fileName}.uu.test.ts`),
				testData,
				{ dryRun: options.dryRun, force: options.force }
			);
			if (uuFile) files.push(uuFile);
		} catch (error) {
			this.logger.warn(`Failed to generate UU compliance tests: ${error}`);
		}

		// Generate GDPR compliance tests
		try {
			const gdprFile = await this.generateFile(
				'test/norwegian/gdpr-compliance.hbs',
				path.join(process.cwd(), 'src', '__tests__', 'compliance', `${testData.fileName}.gdpr.test.ts`),
				testData,
				{ dryRun: options.dryRun, force: options.force }
			);
			if (gdprFile) files.push(gdprFile);
		} catch (error) {
			this.logger.warn(`Failed to generate GDPR compliance tests: ${error}`);
		}

		return files;
	}

	private async generateE2ETests(testData: any, options: TestGeneratorOptions): Promise<string | null> {
		const templateName = `test/e2e/${testData.framework}-e2e.hbs`;
		const filePath = path.join(process.cwd(), 'e2e', `${testData.fileName}.e2e.ts`);
		
		try {
			return await this.generateFile(
				templateName,
				filePath,
				testData,
				{ dryRun: options.dryRun, force: options.force }
			);
		} catch (error) {
			// Fallback to generic e2e template
			try {
				return await this.generateFile(
					'test/e2e/generic-e2e.hbs',
					filePath,
					testData,
					{ dryRun: options.dryRun, force: options.force }
				);
			} catch (fallbackError) {
				this.logger.warn(`Failed to generate e2e tests: ${fallbackError}`);
				return null;
			}
		}
	}

	private async generatePerformanceTests(testData: any, options: TestGeneratorOptions): Promise<string | null> {
		const templateName = 'test/performance-tests.hbs';
		const filePath = path.join(process.cwd(), 'src', '__tests__', 'performance', `${testData.fileName}.perf.test.ts`);
		
		try {
			return await this.generateFile(
				templateName,
				filePath,
				testData,
				{ dryRun: options.dryRun, force: options.force }
			);
		} catch (error) {
			this.logger.warn(`Failed to generate performance tests: ${error}`);
			return null;
		}
	}

	private async generateSecurityTests(testData: any, options: TestGeneratorOptions): Promise<string | null> {
		const templateName = 'test/security-tests.hbs';
		const filePath = path.join(process.cwd(), 'src', '__tests__', 'security', `${testData.fileName}.security.test.ts`);
		
		try {
			return await this.generateFile(
				templateName,
				filePath,
				testData,
				{ dryRun: options.dryRun, force: options.force }
			);
		} catch (error) {
			this.logger.warn(`Failed to generate security tests: ${error}`);
			return null;
		}
	}

	private async generateTestConfig(testData: any, options: TestGeneratorOptions): Promise<string | null> {
		const templateName = `test/config/${testData.framework}-config.hbs`;
		const configFileName = testData.framework === 'jest' ? 'jest.config.js' : 
							 testData.framework === 'vitest' ? 'vitest.config.ts' : 
							 `${testData.framework}.config.js`;
		const filePath = path.join(process.cwd(), configFileName);
		
		try {
			return await this.generateFile(
				templateName,
				filePath,
				testData,
				{ dryRun: options.dryRun, force: options.force }
			);
		} catch (error) {
			this.logger.warn(`Failed to generate test config: ${error}`);
			return null;
		}
	}

	private getTestTemplate(framework: string, testingLibrary: string): string {
		const templates = {
			jest: {
				'react-testing-library': 'test/jest/react-test.hbs',
				'vue-testing-library': 'test/jest/vue-test.hbs',
				'angular-testing-library': 'test/jest/angular-test.hbs',
				'none': 'test/jest/generic-test.hbs',
			},
			vitest: {
				'react-testing-library': 'test/vitest/react-test.hbs',
				'vue-testing-library': 'test/vitest/vue-test.hbs',
				'angular-testing-library': 'test/vitest/angular-test.hbs',
				'none': 'test/vitest/generic-test.hbs',
			},
			mocha: {
				'none': 'test/mocha/generic-test.hbs',
			},
			playwright: {
				'none': 'test/playwright/e2e-test.hbs',
			},
			cypress: {
				'none': 'test/cypress/e2e-test.hbs',
			},
		};

		return templates[framework as keyof typeof templates]?.[testingLibrary as keyof typeof templates.jest] 
			|| 'test/generic-test.hbs';
	}

	private getTestFilePath(testData: any): string {
		const extension = testData.typescript ? 'ts' : 'js';
		const testExtension = testData.framework === 'cypress' ? 'cy' : 
							  testData.framework === 'playwright' ? 'spec' : 'test';
		
		if (testData.framework === 'cypress') {
			return path.join(process.cwd(), 'cypress', 'e2e', `${testData.fileName}.${testExtension}.${extension}`);
		}
		
		if (testData.framework === 'playwright') {
			return path.join(process.cwd(), 'tests', `${testData.fileName}.${testExtension}.${extension}`);
		}
		
		return path.join(process.cwd(), 'src', '__tests__', `${testData.fileName}.${testExtension}.${extension}`);
	}

	private getRecommendedCommands(testData: any): string[] {
		const commands = [];
		
		switch (testData.framework) {
			case 'jest':
				commands.push('npm test');
				if (testData.coverage) commands.push('npm run test:coverage');
				break;
			case 'vitest':
				commands.push('npm run test');
				if (testData.coverage) commands.push('npm run test:coverage');
				break;
			case 'mocha':
				commands.push('npm run test');
				break;
			case 'playwright':
				commands.push('npx playwright test');
				commands.push('npx playwright test --ui');
				break;
			case 'cypress':
				commands.push('npx cypress open');
				commands.push('npx cypress run');
				break;
		}
		
		if (testData.hasTestType('accessibility')) {
			commands.push('npm run test:a11y');
		}
		
		if (testData.hasTestType('performance')) {
			commands.push('npm run test:performance');
		}
		
		if (testData.norwegian) {
			commands.push('npm run test:compliance');
		}

		return commands;
	}

	private getNextSteps(testData: any): string[] {
		const steps = [
			'Review and customize the generated test cases',
			'Run the tests to ensure they pass',
		];

		if (testData.targetFile) {
			steps.push('Verify that all functions and components are properly tested');
		}

		if (testData.mocks) {
			steps.push('Update mock data to match your actual data structures');
		}

		if (testData.fixtures) {
			steps.push('Customize test fixtures with realistic data');
		}

		if (testData.hasTestType('e2e')) {
			steps.push('Configure e2e testing environment and browser settings');
		}

		if (testData.accessibility) {
			steps.push('Test with actual screen readers and accessibility tools');
		}

		if (testData.norwegian) {
			steps.push('Verify Norwegian compliance with official UU validation tools');
			steps.push('Test GDPR compliance features');
		}

		if (testData.coverage) {
			steps.push('Set up code coverage thresholds and reporting');
		}

		steps.push('Integrate tests into your CI/CD pipeline');
		steps.push('Set up test reporting and failure notifications');

		return steps;
	}
}