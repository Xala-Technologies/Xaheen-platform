import { BaseGenerator } from "../base.generator";
import { TemplateManager } from "../../services/templates/template-loader";
import { ProjectAnalyzer } from "../../services/analysis/project-analyzer";
import type {
	DocumentationGeneratorOptions,
	DocumentationResult,
	APIEndpoint,
	APIParameter,
	APISchema,
} from "./index";

export interface APIReferenceGeneratorOptions
	extends DocumentationGeneratorOptions {
	readonly apiTitle?: string;
	readonly apiVersion?: string;
	readonly baseUrl: string;
	readonly authentication: AuthenticationConfig;
	readonly endpoints: readonly APIEndpoint[];
	readonly models: readonly APIModel[];
	readonly errorCodes: readonly ErrorCode[];
	readonly rateLimit: RateLimitConfig;
	readonly sdkLanguages: readonly string[];
	readonly examples: readonly APIExample[];
	readonly changelog: readonly ChangelogEntry[];
	readonly enableInteractiveExamples: boolean;
	readonly enableCodeSamples: boolean;
	readonly enableTryItOut: boolean;
}

export interface AuthenticationConfig {
	readonly type: "bearer" | "apikey" | "oauth2" | "basic";
	readonly description: string;
	readonly tokenUrl?: string;
	readonly authorizationUrl?: string;
	readonly scopes?: Record<string, string>;
	readonly header?: string;
	readonly parameter?: string;
}

export interface APIModel {
	readonly name: string;
	readonly description: string;
	readonly schema: APISchema;
	readonly examples: readonly any[];
	readonly usedIn: readonly string[];
}

export interface ErrorCode {
	readonly code: number;
	readonly name: string;
	readonly description: string;
	readonly example: any;
	readonly resolution: string;
}

export interface RateLimitConfig {
	readonly requests: number;
	readonly window: string;
	readonly headers: readonly string[];
	readonly strategy: "fixed-window" | "sliding-window" | "token-bucket";
}

export interface APIExample {
	readonly name: string;
	readonly description: string;
	readonly endpoint: string;
	readonly method: string;
	readonly request: any;
	readonly response: any;
	readonly language?: string;
}

export interface ChangelogEntry {
	readonly version: string;
	readonly date: string;
	readonly changes: readonly ChangeItem[];
}

export interface ChangeItem {
	readonly type:
		| "added"
		| "changed"
		| "deprecated"
		| "removed"
		| "fixed"
		| "security";
	readonly description: string;
	readonly breaking: boolean;
}

export interface CodeSample {
	readonly language: string;
	readonly label: string;
	readonly code: string;
	readonly description?: string;
}

export class APIReferenceGenerator extends BaseGenerator<APIReferenceGeneratorOptions> {
	private readonly templateManager: TemplateManager;
	private readonly analyzer: ProjectAnalyzer;

	constructor() {
		super();
		this.templateManager = new TemplateManager();
		this.analyzer = new ProjectAnalyzer();
	}

	async generate(
		options: APIReferenceGeneratorOptions,
	): Promise<DocumentationResult> {
		try {
			await this.validateOptions(options);

			const projectContext = await this.analyzer.analyze(process.cwd());

			// Generate main API reference
			await this.generateAPIReference(options, projectContext);

			// Generate authentication guide
			await this.generateAuthenticationGuide(options);

			// Generate endpoint documentation
			await this.generateEndpointDocumentation(options);

			// Generate model documentation
			await this.generateModelDocumentation(options);

			// Generate error handling guide
			await this.generateErrorHandlingGuide(options);

			// Generate rate limiting documentation
			await this.generateRateLimitingDocs(options);

			// Generate code samples
			if (options.enableCodeSamples) {
				await this.generateCodeSamples(options);
			}

			// Generate interactive examples
			if (options.enableInteractiveExamples) {
				await this.generateInteractiveExamples(options);
			}

			// Generate SDK documentation
			await this.generateSDKDocumentation(options);

			// Generate changelog
			await this.generateAPIChangelog(options);

			// Generate testing guide
			await this.generateTestingGuide(options);

			// Generate best practices guide
			await this.generateBestPracticesGuide(options);

			this.logger.success("API reference documentation generated successfully");

			const files = [
				`${options.outputDir}/docs/api-reference/index.md`,
				`${options.outputDir}/docs/api-reference/authentication.md`,
				`${options.outputDir}/docs/api-reference/endpoints/`,
				`${options.outputDir}/docs/api-reference/models/`,
				`${options.outputDir}/docs/api-reference/errors.md`,
				`${options.outputDir}/docs/api-reference/rate-limiting.md`,
				`${options.outputDir}/docs/api-reference/code-samples/`,
				`${options.outputDir}/docs/api-reference/examples/`,
				`${options.outputDir}/docs/api-reference/sdks/`,
				`${options.outputDir}/docs/api-reference/changelog.md`,
				`${options.outputDir}/docs/api-reference/testing.md`,
				`${options.outputDir}/docs/api-reference/best-practices.md`,
				`${options.outputDir}/docs/api-reference/interactive/api-explorer.html`,
				`${options.outputDir}/docs/api-reference/assets/style.css`,
				`${options.outputDir}/docs/api-reference/assets/api-reference.js`,
			];

			const commands = [
				"npm install --save-dev prism-react-renderer",
				"npm install --save-dev @stoplight/elements",
				"npm install --save-dev swagger-ui-react",
			];

			const nextSteps = [
				"Review and customize the generated API reference",
				"Add real examples and use cases",
				"Update authentication configuration",
				"Set up interactive API explorer",
				"Configure automatic reference updates",
				"Add monitoring for API usage patterns",
				"Set up feedback collection from developers",
			];

			return {
				success: true,
				message: `API reference documentation for '${options.projectName}' generated successfully`,
				files,
				commands,
				nextSteps,
			};
		} catch (error) {
			this.logger.error(
				"Failed to generate API reference documentation",
				error,
			);
			return {
				success: false,
				message: "Failed to generate API reference documentation",
				files: [],
				error: error instanceof Error ? error.message : "Unknown error",
			};
		}
	}

	private async validateOptions(
		options: APIReferenceGeneratorOptions,
	): Promise<void> {
		if (!options.projectName) {
			throw new Error("Project name is required");
		}

		if (!options.baseUrl) {
			throw new Error("Base URL is required");
		}

		if (!options.endpoints || options.endpoints.length === 0) {
			throw new Error("At least one endpoint must be defined");
		}
	}

	private async generateAPIReference(
		options: APIReferenceGeneratorOptions,
		projectContext: any,
	): Promise<void> {
		const referenceData = {
			projectName: options.projectName,
			apiTitle: options.apiTitle || `${options.projectName} API`,
			apiVersion: options.apiVersion || options.version,
			description: options.description,
			baseUrl: options.baseUrl,
			lastUpdated: new Date().toISOString().split("T")[0],

			overview: {
				description: options.description,
				features: this.extractAPIFeatures(options),
				protocols: ["HTTP/1.1", "HTTP/2"],
				formats: ["JSON", "XML"],
				versioning: this.generateVersioningInfo(options),
			},

			quickStart: this.generateQuickStart(options),
			authentication: options.authentication,
			rateLimit: options.rateLimit,

			endpoints: this.organizeEndpointsByResource(options.endpoints),
			models: options.models,
			errorCodes: options.errorCodes,

			navigation: this.generateNavigation(options),

			contact: {
				name: options.author || "API Team",
				email: "api-support@example.com",
				url: "https://developer.example.com/support",
			},
		};

		await this.templateManager.renderTemplate(
			"documentation/api-reference/index.md.hbs",
			`${options.outputDir}/docs/api-reference/index.md`,
			referenceData,
		);
	}

	private async generateAuthenticationGuide(
		options: APIReferenceGeneratorOptions,
	): Promise<void> {
		const authData = {
			projectName: options.projectName,
			authentication: options.authentication,
			examples: this.generateAuthenticationExamples(options.authentication),
			troubleshooting: this.generateAuthTroubleshooting(options.authentication),
			securityBestPractices: this.generateSecurityBestPractices(),
			tokenManagement: this.generateTokenManagementGuide(
				options.authentication,
			),
			scopes: options.authentication.scopes || {},
		};

		await this.templateManager.renderTemplate(
			"documentation/api-reference/authentication.md.hbs",
			`${options.outputDir}/docs/api-reference/authentication.md`,
			authData,
		);
	}

	private async generateEndpointDocumentation(
		options: APIReferenceGeneratorOptions,
	): Promise<void> {
		const resources = this.organizeEndpointsByResource(options.endpoints);

		for (const [resourceName, endpoints] of Object.entries(resources)) {
			const endpointData = {
				resourceName,
				projectName: options.projectName,
				baseUrl: options.baseUrl,
				endpoints: endpoints.map((endpoint) => ({
					...endpoint,
					codeSamples: this.generateEndpointCodeSamples(endpoint, options),
					examples: this.generateEndpointExamples(endpoint),
					responses: this.enhanceResponses(endpoint.responses),
					parameters: this.enhanceParameters(endpoint.parameters || []),
				})),
			};

			await this.templateManager.renderTemplate(
				"documentation/api-reference/endpoints/resource.md.hbs",
				`${options.outputDir}/docs/api-reference/endpoints/${resourceName.toLowerCase()}.md`,
				endpointData,
			);
		}

		// Generate endpoint index
		await this.templateManager.renderTemplate(
			"documentation/api-reference/endpoints/index.md.hbs",
			`${options.outputDir}/docs/api-reference/endpoints/index.md`,
			{ resources: Object.keys(resources), projectName: options.projectName },
		);
	}

	private async generateModelDocumentation(
		options: APIReferenceGeneratorOptions,
	): Promise<void> {
		for (const model of options.models) {
			const modelData = {
				...model,
				projectName: options.projectName,
				properties: this.extractSchemaProperties(model.schema),
				relationships: this.findModelRelationships(model, options.models),
				validationRules: this.extractValidationRules(model.schema),
				jsonSchema: JSON.stringify(model.schema, null, 2),
			};

			await this.templateManager.renderTemplate(
				"documentation/api-reference/models/model.md.hbs",
				`${options.outputDir}/docs/api-reference/models/${model.name.toLowerCase()}.md`,
				modelData,
			);
		}

		// Generate models index
		await this.templateManager.renderTemplate(
			"documentation/api-reference/models/index.md.hbs",
			`${options.outputDir}/docs/api-reference/models/index.md`,
			{ models: options.models, projectName: options.projectName },
		);
	}

	private async generateErrorHandlingGuide(
		options: APIReferenceGeneratorOptions,
	): Promise<void> {
		const errorData = {
			projectName: options.projectName,
			errorCodes: options.errorCodes.map((error) => ({
				...error,
				httpStatus: this.getHTTPStatusName(error.code),
				category: this.categorizeError(error.code),
			})),
			errorCategories: this.groupErrorsByCategory(options.errorCodes),
			errorHandlingBestPractices: this.generateErrorHandlingBestPractices(),
			retryStrategies: this.generateRetryStrategies(),
			debuggingTips: this.generateDebuggingTips(),
		};

		await this.templateManager.renderTemplate(
			"documentation/api-reference/errors.md.hbs",
			`${options.outputDir}/docs/api-reference/errors.md`,
			errorData,
		);
	}

	private async generateRateLimitingDocs(
		options: APIReferenceGeneratorOptions,
	): Promise<void> {
		const rateLimitData = {
			projectName: options.projectName,
			rateLimit: options.rateLimit,
			headers: this.generateRateLimitHeaders(options.rateLimit),
			strategies: this.explainRateLimitStrategies(),
			handling: this.generateRateLimitHandling(),
			monitoring: this.generateRateLimitMonitoring(),
			bestPractices: this.generateRateLimitBestPractices(),
		};

		await this.templateManager.renderTemplate(
			"documentation/api-reference/rate-limiting.md.hbs",
			`${options.outputDir}/docs/api-reference/rate-limiting.md`,
			rateLimitData,
		);
	}

	private async generateCodeSamples(
		options: APIReferenceGeneratorOptions,
	): Promise<void> {
		const languages =
			options.sdkLanguages.length > 0
				? options.sdkLanguages
				: ["javascript", "python", "curl", "java", "php", "ruby", "go"];

		for (const language of languages) {
			const samples = options.endpoints.map((endpoint) => ({
				endpoint: `${endpoint.method} ${endpoint.path}`,
				sample: this.generateCodeSample(endpoint, language, options),
			}));

			await this.templateManager.renderTemplate(
				"documentation/api-reference/code-samples/language.md.hbs",
				`${options.outputDir}/docs/api-reference/code-samples/${language}.md`,
				{
					language: language.charAt(0).toUpperCase() + language.slice(1),
					samples,
					projectName: options.projectName,
					baseUrl: options.baseUrl,
					authentication: options.authentication,
				},
			);
		}

		// Generate code samples index
		await this.templateManager.renderTemplate(
			"documentation/api-reference/code-samples/index.md.hbs",
			`${options.outputDir}/docs/api-reference/code-samples/index.md`,
			{ languages, projectName: options.projectName },
		);
	}

	private async generateInteractiveExamples(
		options: APIReferenceGeneratorOptions,
	): Promise<void> {
		const interactiveData = {
			projectName: options.projectName,
			baseUrl: options.baseUrl,
			authentication: options.authentication,
			endpoints: options.endpoints,
			apiExplorerConfig: {
				enableTryItOut: options.enableTryItOut,
				defaultEnvironment: "production",
				environments: [
					{ name: "production", url: options.baseUrl },
					{
						name: "staging",
						url: options.baseUrl.replace("api.", "staging-api."),
					},
					{ name: "development", url: "http://localhost:3000/api" },
				],
			},
		};

		await this.templateManager.renderTemplate(
			"documentation/api-reference/interactive/api-explorer.html.hbs",
			`${options.outputDir}/docs/api-reference/interactive/api-explorer.html`,
			interactiveData,
		);

		// Generate JavaScript for interactive features
		await this.templateManager.renderTemplate(
			"documentation/api-reference/assets/api-reference.js.hbs",
			`${options.outputDir}/docs/api-reference/assets/api-reference.js`,
			interactiveData,
		);

		// Generate CSS for styling
		await this.templateManager.renderTemplate(
			"documentation/api-reference/assets/style.css.hbs",
			`${options.outputDir}/docs/api-reference/assets/style.css`,
			{ projectName: options.projectName },
		);
	}

	private async generateSDKDocumentation(
		options: APIReferenceGeneratorOptions,
	): Promise<void> {
		for (const language of options.sdkLanguages) {
			const sdkData = {
				language: language.charAt(0).toUpperCase() + language.slice(1),
				projectName: options.projectName,
				installation: this.generateSDKInstallation(language),
				quickStart: this.generateSDKQuickStart(language, options),
				configuration: this.generateSDKConfiguration(language, options),
				examples: this.generateSDKExamples(language, options),
				errorHandling: this.generateSDKErrorHandling(language),
				advancedUsage: this.generateSDKAdvancedUsage(language),
				changelog: this.filterChangelogBySDK(options.changelog, language),
			};

			await this.templateManager.renderTemplate(
				"documentation/api-reference/sdks/sdk.md.hbs",
				`${options.outputDir}/docs/api-reference/sdks/${language}.md`,
				sdkData,
			);
		}

		// Generate SDKs index
		await this.templateManager.renderTemplate(
			"documentation/api-reference/sdks/index.md.hbs",
			`${options.outputDir}/docs/api-reference/sdks/index.md`,
			{ languages: options.sdkLanguages, projectName: options.projectName },
		);
	}

	private async generateAPIChangelog(
		options: APIReferenceGeneratorOptions,
	): Promise<void> {
		const changelogData = {
			projectName: options.projectName,
			changelog: options.changelog.map((entry) => ({
				...entry,
				changes: entry.changes.map((change) => ({
					...change,
					icon: this.getChangeTypeIcon(change.type),
					color: this.getChangeTypeColor(change.type),
				})),
			})),
			breakingChanges: this.extractBreakingChanges(options.changelog),
			migrationGuides: this.generateMigrationGuides(options.changelog),
		};

		await this.templateManager.renderTemplate(
			"documentation/api-reference/changelog.md.hbs",
			`${options.outputDir}/docs/api-reference/changelog.md`,
			changelogData,
		);
	}

	private async generateTestingGuide(
		options: APIReferenceGeneratorOptions,
	): Promise<void> {
		const testingData = {
			projectName: options.projectName,
			baseUrl: options.baseUrl,
			authentication: options.authentication,
			testingStrategies: [
				{
					name: "Unit Testing",
					description: "Test individual API endpoints",
					tools: ["Jest", "Mocha", "pytest"],
					examples: this.generateUnitTestExamples(options),
				},
				{
					name: "Integration Testing",
					description: "Test API workflows and data flow",
					tools: ["Postman", "Newman", "REST Assured"],
					examples: this.generateIntegrationTestExamples(options),
				},
				{
					name: "Load Testing",
					description: "Test API performance under load",
					tools: ["k6", "JMeter", "Artillery"],
					examples: this.generateLoadTestExamples(options),
				},
			],
			testEnvironments: this.generateTestEnvironments(options),
			mockingStrategies: this.generateMockingStrategies(options),
			cicdIntegration: this.generateCICDIntegration(options),
		};

		await this.templateManager.renderTemplate(
			"documentation/api-reference/testing.md.hbs",
			`${options.outputDir}/docs/api-reference/testing.md`,
			testingData,
		);
	}

	private async generateBestPracticesGuide(
		options: APIReferenceGeneratorOptions,
	): Promise<void> {
		const bestPracticesData = {
			projectName: options.projectName,
			sections: [
				{
					title: "Request Best Practices",
					practices: [
						"Use appropriate HTTP methods",
						"Include proper headers",
						"Implement request validation",
						"Handle timeouts gracefully",
						"Use compression when appropriate",
					],
				},
				{
					title: "Error Handling",
					practices: [
						"Implement retry logic for transient errors",
						"Log errors appropriately",
						"Provide meaningful error messages",
						"Use circuit breaker pattern",
						"Handle rate limiting properly",
					],
				},
				{
					title: "Security",
					practices: [
						"Always use HTTPS",
						"Validate all inputs",
						"Implement proper authentication",
						"Use API keys securely",
						"Follow OWASP guidelines",
					],
				},
				{
					title: "Performance",
					practices: [
						"Use caching appropriately",
						"Implement pagination",
						"Optimize payload sizes",
						"Use connection pooling",
						"Monitor API performance",
					],
				},
			],
			codeExamples: this.generateBestPracticeExamples(options),
			antiPatterns: this.generateAntiPatterns(options),
			resources: this.generateAdditionalResources(),
		};

		await this.templateManager.renderTemplate(
			"documentation/api-reference/best-practices.md.hbs",
			`${options.outputDir}/docs/api-reference/best-practices.md`,
			bestPracticesData,
		);
	}

	// Helper methods

	private extractAPIFeatures(options: APIReferenceGeneratorOptions): string[] {
		const features = ["RESTful API design", "JSON responses"];

		if (options.authentication.type === "oauth2") {
			features.push("OAuth 2.0 authentication");
		}

		if (options.rateLimit) {
			features.push("Rate limiting");
		}

		if (options.enableInteractiveExamples) {
			features.push("Interactive API explorer");
		}

		return features;
	}

	private generateVersioningInfo(options: APIReferenceGeneratorOptions): any {
		return {
			current: options.apiVersion || options.version,
			strategy: "URL versioning",
			format: "v{major}",
			deprecationPolicy: "6 months notice for breaking changes",
			supportedVersions: [options.apiVersion || options.version],
		};
	}

	private generateQuickStart(options: APIReferenceGeneratorOptions): any {
		return {
			steps: [
				{
					step: 1,
					title: "Get API Credentials",
					description: "Sign up and get your API key",
					code: null,
				},
				{
					step: 2,
					title: "Make Your First Request",
					description: "Test the API with a simple request",
					code: this.generateQuickStartCode(options),
				},
				{
					step: 3,
					title: "Handle the Response",
					description: "Process the API response",
					code: null,
				},
			],
		};
	}

	private generateNavigation(options: APIReferenceGeneratorOptions): any[] {
		const nav = [
			{ title: "Overview", link: "#overview" },
			{ title: "Authentication", link: "authentication.md" },
			{ title: "Endpoints", link: "endpoints/" },
			{ title: "Models", link: "models/" },
			{ title: "Errors", link: "errors.md" },
			{ title: "Rate Limiting", link: "rate-limiting.md" },
		];

		if (options.enableCodeSamples) {
			nav.push({ title: "Code Samples", link: "code-samples/" });
		}

		if (options.sdkLanguages.length > 0) {
			nav.push({ title: "SDKs", link: "sdks/" });
		}

		nav.push({ title: "Changelog", link: "changelog.md" });

		return nav;
	}

	private organizeEndpointsByResource(
		endpoints: readonly APIEndpoint[],
	): Record<string, APIEndpoint[]> {
		const resources: Record<string, APIEndpoint[]> = {};

		endpoints.forEach((endpoint) => {
			const resourceName = this.extractResourceName(endpoint.path);
			if (!resources[resourceName]) {
				resources[resourceName] = [];
			}
			resources[resourceName].push(endpoint);
		});

		return resources;
	}

	private extractResourceName(path: string): string {
		const segments = path.split("/").filter(Boolean);
		return segments[0] || "root";
	}

	private generateAuthenticationExamples(
		auth: AuthenticationConfig,
	): CodeSample[] {
		const examples: CodeSample[] = [];

		if (auth.type === "bearer") {
			examples.push({
				language: "curl",
				label: "cURL",
				code: `curl -H "Authorization: Bearer YOUR_TOKEN" \\
  ${auth.header ? `-H "${auth.header}: YOUR_TOKEN"` : ""} \\
  https://api.example.com/endpoint`,
			});

			examples.push({
				language: "javascript",
				label: "JavaScript",
				code: `fetch('https://api.example.com/endpoint', {
  headers: {
    'Authorization': 'Bearer YOUR_TOKEN'
  }
})`,
			});
		}

		if (auth.type === "apikey") {
			examples.push({
				language: "curl",
				label: "cURL",
				code: `curl -H "${auth.header || "X-API-Key"}: YOUR_API_KEY" \\
  https://api.example.com/endpoint`,
			});
		}

		return examples;
	}

	private generateAuthTroubleshooting(auth: AuthenticationConfig): any[] {
		return [
			{
				issue: "Invalid token",
				solution: "Ensure your token is valid and not expired",
				code: 401,
			},
			{
				issue: "Missing authorization header",
				solution: `Include the ${auth.header || "Authorization"} header in your request`,
				code: 401,
			},
			{
				issue: "Insufficient permissions",
				solution: "Check that your token has the required scopes",
				code: 403,
			},
		];
	}

	private generateSecurityBestPractices(): string[] {
		return [
			"Never expose API keys in client-side code",
			"Use HTTPS for all API requests",
			"Implement token rotation",
			"Store tokens securely",
			"Use least privilege principle for scopes",
			"Monitor for unusual API usage patterns",
		];
	}

	private generateTokenManagementGuide(auth: AuthenticationConfig): any {
		return {
			refresh:
				auth.type === "oauth2"
					? "Use refresh tokens to get new access tokens"
					: "Generate new API keys when needed",
			expiration:
				auth.type === "oauth2"
					? "Access tokens typically expire in 1 hour"
					: "API keys do not expire unless revoked",
			revocation: "Revoke tokens immediately if compromised",
			storage: "Store tokens in secure, encrypted storage",
		};
	}

	private generateEndpointCodeSamples(
		endpoint: APIEndpoint,
		options: APIReferenceGeneratorOptions,
	): CodeSample[] {
		const samples: CodeSample[] = [];
		const languages = ["curl", "javascript", "python"];

		languages.forEach((lang) => {
			samples.push({
				language: lang,
				label: lang.charAt(0).toUpperCase() + lang.slice(1),
				code: this.generateCodeSample(endpoint, lang, options),
			});
		});

		return samples;
	}

	private generateCodeSample(
		endpoint: APIEndpoint,
		language: string,
		options: APIReferenceGeneratorOptions,
	): string {
		const baseUrl = options.baseUrl;
		const fullUrl = `${baseUrl}${endpoint.path}`;

		switch (language) {
			case "curl":
				return this.generateCurlSample(
					endpoint,
					fullUrl,
					options.authentication,
				);
			case "javascript":
				return this.generateJavaScriptSample(
					endpoint,
					fullUrl,
					options.authentication,
				);
			case "python":
				return this.generatePythonSample(
					endpoint,
					fullUrl,
					options.authentication,
				);
			case "java":
				return this.generateJavaSample(
					endpoint,
					fullUrl,
					options.authentication,
				);
			case "php":
				return this.generatePHPSample(
					endpoint,
					fullUrl,
					options.authentication,
				);
			case "ruby":
				return this.generateRubySample(
					endpoint,
					fullUrl,
					options.authentication,
				);
			case "go":
				return this.generateGoSample(endpoint, fullUrl, options.authentication);
			default:
				return "// Code sample not available for this language";
		}
	}

	private generateCurlSample(
		endpoint: APIEndpoint,
		url: string,
		auth: AuthenticationConfig,
	): string {
		let curl = `curl -X ${endpoint.method} "${url}"`;

		if (auth.type === "bearer") {
			curl += ` \\\n  -H "Authorization: Bearer YOUR_TOKEN"`;
		} else if (auth.type === "apikey") {
			curl += ` \\\n  -H "${auth.header || "X-API-Key"}: YOUR_API_KEY"`;
		}

		curl += ` \\\n  -H "Content-Type: application/json"`;

		if (endpoint.requestBody) {
			curl += ` \\\n  -d '${JSON.stringify(this.generateSampleRequestBody(endpoint.requestBody), null, 2)}'`;
		}

		return curl;
	}

	private generateJavaScriptSample(
		endpoint: APIEndpoint,
		url: string,
		auth: AuthenticationConfig,
	): string {
		const headers: Record<string, string> = {
			"Content-Type": "application/json",
		};

		if (auth.type === "bearer") {
			headers["Authorization"] = "Bearer YOUR_TOKEN";
		} else if (auth.type === "apikey") {
			headers[auth.header || "X-API-Key"] = "YOUR_API_KEY";
		}

		let code = `const response = await fetch('${url}', {\n`;
		code += `  method: '${endpoint.method}',\n`;
		code += `  headers: ${JSON.stringify(headers, null, 4)},\n`;

		if (endpoint.requestBody) {
			code += `  body: JSON.stringify(${JSON.stringify(this.generateSampleRequestBody(endpoint.requestBody), null, 4)})\n`;
		}

		code += `});\n\nconst data = await response.json();\nconsole.log(data);`;

		return code;
	}

	private generatePythonSample(
		endpoint: APIEndpoint,
		url: string,
		auth: AuthenticationConfig,
	): string {
		let code = `import requests\n\n`;

		const headers: Record<string, string> = {
			"Content-Type": "application/json",
		};

		if (auth.type === "bearer") {
			headers["Authorization"] = "Bearer YOUR_TOKEN";
		} else if (auth.type === "apikey") {
			headers[auth.header || "X-API-Key"] = "YOUR_API_KEY";
		}

		code += `headers = ${JSON.stringify(headers, null, 4)}\n\n`;

		if (endpoint.requestBody) {
			code += `data = ${JSON.stringify(this.generateSampleRequestBody(endpoint.requestBody), null, 4)}\n\n`;
			code += `response = requests.${endpoint.method.toLowerCase()}('${url}', headers=headers, json=data)\n`;
		} else {
			code += `response = requests.${endpoint.method.toLowerCase()}('${url}', headers=headers)\n`;
		}

		code += `\nprint(response.json())`;

		return code;
	}

	private generateJavaSample(
		endpoint: APIEndpoint,
		url: string,
		auth: AuthenticationConfig,
	): string {
		let code = `import java.net.http.*;\nimport java.net.URI;\n\n`;
		code += `HttpClient client = HttpClient.newHttpClient();\n\n`;

		code += `HttpRequest.Builder requestBuilder = HttpRequest.newBuilder()\n`;
		code += `    .uri(URI.create("${url}"))\n`;
		code += `    .header("Content-Type", "application/json")\n`;

		if (auth.type === "bearer") {
			code += `    .header("Authorization", "Bearer YOUR_TOKEN")\n`;
		} else if (auth.type === "apikey") {
			code += `    .header("${auth.header || "X-API-Key"}", "YOUR_API_KEY")\n`;
		}

		if (endpoint.requestBody) {
			code += `    .${endpoint.method}(HttpRequest.BodyPublishers.ofString("${JSON.stringify(this.generateSampleRequestBody(endpoint.requestBody))}"));\n`;
		} else {
			code += `    .${endpoint.method}(HttpRequest.BodyPublishers.noBody());\n`;
		}

		code += `\nHttpResponse<String> response = client.send(requestBuilder.build(), HttpResponse.BodyHandlers.ofString());\n`;
		code += `System.out.println(response.body());`;

		return code;
	}

	private generatePHPSample(
		endpoint: APIEndpoint,
		url: string,
		auth: AuthenticationConfig,
	): string {
		let code = `<?php\n\n$curl = curl_init();\n\n`;

		const headers = ["Content-Type: application/json"];

		if (auth.type === "bearer") {
			headers.push("Authorization: Bearer YOUR_TOKEN");
		} else if (auth.type === "apikey") {
			headers.push(`${auth.header || "X-API-Key"}: YOUR_API_KEY`);
		}

		code += `curl_setopt_array($curl, [\n`;
		code += `    CURLOPT_URL => '${url}',\n`;
		code += `    CURLOPT_RETURNTRANSFER => true,\n`;
		code += `    CURLOPT_CUSTOMREQUEST => '${endpoint.method}',\n`;
		code += `    CURLOPT_HTTPHEADER => ${JSON.stringify(headers)},\n`;

		if (endpoint.requestBody) {
			code += `    CURLOPT_POSTFIELDS => json_encode(${JSON.stringify(this.generateSampleRequestBody(endpoint.requestBody))}),\n`;
		}

		code += `]);\n\n$response = curl_exec($curl);\ncurl_close($curl);\n\necho $response;`;

		return code;
	}

	private generateRubySample(
		endpoint: APIEndpoint,
		url: string,
		auth: AuthenticationConfig,
	): string {
		let code = `require 'net/http'\nrequire 'json'\n\n`;
		code += `uri = URI('${url}')\nhttp = Net::HTTP.new(uri.host, uri.port)\nhttp.use_ssl = true\n\n`;

		code += `request = Net::HTTP::${endpoint.method.charAt(0) + endpoint.method.slice(1).toLowerCase()}.new(uri)\n`;
		code += `request['Content-Type'] = 'application/json'\n`;

		if (auth.type === "bearer") {
			code += `request['Authorization'] = 'Bearer YOUR_TOKEN'\n`;
		} else if (auth.type === "apikey") {
			code += `request['${auth.header || "X-API-Key"}'] = 'YOUR_API_KEY'\n`;
		}

		if (endpoint.requestBody) {
			code += `request.body = ${JSON.stringify(this.generateSampleRequestBody(endpoint.requestBody))}.to_json\n`;
		}

		code += `\nresponse = http.request(request)\nputs response.body`;

		return code;
	}

	private generateGoSample(
		endpoint: APIEndpoint,
		url: string,
		auth: AuthenticationConfig,
	): string {
		let code = `package main\n\nimport (\n    "bytes"\n    "encoding/json"\n    "fmt"\n    "io/ioutil"\n    "net/http"\n)\n\n`;
		code += `func main() {\n`;

		if (endpoint.requestBody) {
			code += `    data := ${JSON.stringify(this.generateSampleRequestBody(endpoint.requestBody))}\n`;
			code += `    jsonData, _ := json.Marshal(data)\n`;
			code += `    req, _ := http.NewRequest("${endpoint.method}", "${url}", bytes.NewBuffer(jsonData))\n`;
		} else {
			code += `    req, _ := http.NewRequest("${endpoint.method}", "${url}", nil)\n`;
		}

		code += `    req.Header.Set("Content-Type", "application/json")\n`;

		if (auth.type === "bearer") {
			code += `    req.Header.Set("Authorization", "Bearer YOUR_TOKEN")\n`;
		} else if (auth.type === "apikey") {
			code += `    req.Header.Set("${auth.header || "X-API-Key"}", "YOUR_API_KEY")\n`;
		}

		code += `\n    client := &http.Client{}\n`;
		code += `    resp, _ := client.Do(req)\n`;
		code += `    defer resp.Body.Close()\n`;
		code += `\n    body, _ := ioutil.ReadAll(resp.Body)\n`;
		code += `    fmt.Println(string(body))\n}`;

		return code;
	}

	private generateEndpointExamples(endpoint: APIEndpoint): any[] {
		const examples = [];

		// Generate request example
		if (endpoint.requestBody) {
			examples.push({
				type: "request",
				title: "Request Example",
				content: JSON.stringify(
					this.generateSampleRequestBody(endpoint.requestBody),
					null,
					2,
				),
			});
		}

		// Generate response examples
		Object.entries(endpoint.responses).forEach(([statusCode, response]) => {
			if (response.content && response.content["application/json"]) {
				examples.push({
					type: "response",
					title: `${statusCode} Response`,
					content: JSON.stringify(
						this.generateSampleResponse(response),
						null,
						2,
					),
				});
			}
		});

		return examples;
	}

	private enhanceResponses(
		responses: Record<string, any>,
	): Record<string, any> {
		const enhanced: Record<string, any> = {};

		Object.entries(responses).forEach(([statusCode, response]) => {
			enhanced[statusCode] = {
				...response,
				statusName: this.getHTTPStatusName(parseInt(statusCode)),
				category: this.getResponseCategory(parseInt(statusCode)),
			};
		});

		return enhanced;
	}

	private enhanceParameters(parameters: readonly APIParameter[]): any[] {
		return parameters.map((param) => ({
			...param,
			example: this.generateParameterExample(param),
			validation: this.extractParameterValidation(param.schema),
		}));
	}

	private extractSchemaProperties(schema: APISchema): any[] {
		if (!schema.properties) return [];

		return Object.entries(schema.properties).map(([name, propSchema]) => ({
			name,
			type: propSchema.type,
			description: propSchema.description,
			required: schema.required?.includes(name) || false,
			example: propSchema.example || this.generateExampleValue(propSchema),
		}));
	}

	private findModelRelationships(
		model: APIModel,
		allModels: readonly APIModel[],
	): any[] {
		const relationships: any[] = [];

		// Find references to other models in this model's schema
		this.findSchemaReferences(model.schema, allModels).forEach((ref) => {
			relationships.push({
				type: "references",
				model: ref,
				description: `References ${ref} model`,
			});
		});

		// Find models that reference this model
		allModels.forEach((otherModel) => {
			if (otherModel.name !== model.name) {
				const refs = this.findSchemaReferences(otherModel.schema, [model]);
				if (refs.length > 0) {
					relationships.push({
						type: "referenced_by",
						model: otherModel.name,
						description: `Referenced by ${otherModel.name} model`,
					});
				}
			}
		});

		return relationships;
	}

	private findSchemaReferences(
		schema: APISchema,
		models: readonly APIModel[],
	): string[] {
		const references: string[] = [];

		// This is a simplified implementation - in a real scenario,
		// you'd parse $ref properties and object structures
		if (schema.properties) {
			Object.values(schema.properties).forEach((prop) => {
				models.forEach((model) => {
					if (
						prop.type === "object" &&
						prop.description?.includes(model.name)
					) {
						references.push(model.name);
					}
				});
			});
		}

		return references;
	}

	private extractValidationRules(schema: APISchema): string[] {
		const rules: string[] = [];

		if (schema.required?.length) {
			rules.push(`Required fields: ${schema.required.join(", ")}`);
		}

		if (schema.properties) {
			Object.entries(schema.properties).forEach(([name, prop]) => {
				if (prop.format) {
					rules.push(`${name} must be in ${prop.format} format`);
				}
				if (prop.type === "string" && (prop as any).minLength) {
					rules.push(`${name} minimum length: ${(prop as any).minLength}`);
				}
				if (prop.type === "string" && (prop as any).maxLength) {
					rules.push(`${name} maximum length: ${(prop as any).maxLength}`);
				}
			});
		}

		return rules;
	}

	private getHTTPStatusName(code: number): string {
		const statusNames: Record<number, string> = {
			200: "OK",
			201: "Created",
			204: "No Content",
			400: "Bad Request",
			401: "Unauthorized",
			403: "Forbidden",
			404: "Not Found",
			409: "Conflict",
			422: "Unprocessable Entity",
			429: "Too Many Requests",
			500: "Internal Server Error",
		};

		return statusNames[code] || "Unknown Status";
	}

	private categorizeError(code: number): string {
		if (code >= 400 && code < 500) return "Client Error";
		if (code >= 500) return "Server Error";
		return "Other";
	}

	private groupErrorsByCategory(
		errors: readonly ErrorCode[],
	): Record<string, ErrorCode[]> {
		const groups: Record<string, ErrorCode[]> = {};

		errors.forEach((error) => {
			const category = this.categorizeError(error.code);
			if (!groups[category]) {
				groups[category] = [];
			}
			groups[category].push(error);
		});

		return groups;
	}

	private generateErrorHandlingBestPractices(): string[] {
		return [
			"Always check the HTTP status code",
			"Parse error response bodies for detailed information",
			"Implement exponential backoff for retries",
			"Log errors with sufficient context",
			"Handle rate limiting gracefully",
			"Provide user-friendly error messages",
		];
	}

	private generateRetryStrategies(): any[] {
		return [
			{
				scenario: "Network timeout",
				strategy: "Exponential backoff with jitter",
				maxRetries: 3,
				initialDelay: "1s",
			},
			{
				scenario: "5xx server errors",
				strategy: "Linear backoff",
				maxRetries: 5,
				initialDelay: "2s",
			},
			{
				scenario: "429 rate limit",
				strategy: "Respect Retry-After header",
				maxRetries: 10,
				initialDelay: "As specified in header",
			},
		];
	}

	private generateDebuggingTips(): string[] {
		return [
			"Use API logs to trace request flow",
			"Check request headers and body format",
			"Verify authentication credentials",
			"Test with different HTTP clients",
			"Use API monitoring tools",
			"Check for service status updates",
		];
	}

	private generateRateLimitHeaders(rateLimit: RateLimitConfig): any[] {
		return rateLimit.headers.map((header) => ({
			name: header,
			description: this.getRateLimitHeaderDescription(header),
			example: this.getRateLimitHeaderExample(header, rateLimit),
		}));
	}

	private getRateLimitHeaderDescription(header: string): string {
		const descriptions: Record<string, string> = {
			"X-RateLimit-Limit":
				"Total number of requests allowed in the time window",
			"X-RateLimit-Remaining":
				"Number of requests remaining in the current window",
			"X-RateLimit-Reset": "Time when the rate limit window resets",
			"Retry-After": "Number of seconds to wait before making another request",
		};

		return descriptions[header] || "Rate limit information";
	}

	private getRateLimitHeaderExample(
		header: string,
		rateLimit: RateLimitConfig,
	): string {
		const examples: Record<string, string> = {
			"X-RateLimit-Limit": rateLimit.requests.toString(),
			"X-RateLimit-Remaining": Math.floor(rateLimit.requests * 0.7).toString(),
			"X-RateLimit-Reset": (Date.now() + 60000).toString(),
			"Retry-After": "60",
		};

		return examples[header] || "100";
	}

	private explainRateLimitStrategies(): any[] {
		return [
			{
				name: "Fixed Window",
				description: "Fixed time windows with request quotas",
				pros: ["Simple to implement", "Predictable behavior"],
				cons: ["Allows bursts at window boundaries"],
			},
			{
				name: "Sliding Window",
				description: "Rolling time window for smoother rate limiting",
				pros: ["Smoother request distribution", "No burst issues"],
				cons: ["More complex to implement", "Higher memory usage"],
			},
			{
				name: "Token Bucket",
				description: "Tokens consumed per request, replenished over time",
				pros: ["Allows controlled bursts", "Flexible"],
				cons: ["Complex configuration", "Harder to understand"],
			},
		];
	}

	private generateRateLimitHandling(): any {
		return {
			detection: "Check for 429 status code",
			headers: "Read rate limit headers from response",
			backoff: "Implement exponential backoff",
			monitoring: "Track rate limit usage patterns",
		};
	}

	private generateRateLimitMonitoring(): string[] {
		return [
			"Monitor rate limit header values",
			"Track 429 response frequency",
			"Set up alerts for approaching limits",
			"Analyze usage patterns over time",
			"Monitor per-user rate limit usage",
		];
	}

	private generateRateLimitBestPractices(): string[] {
		return [
			"Respect rate limit headers",
			"Implement client-side rate limiting",
			"Use request queuing for high-volume applications",
			"Cache responses to reduce API calls",
			"Monitor your rate limit usage",
			"Consider upgrading limits for production use",
		];
	}

	private generateSDKInstallation(language: string): any {
		const installations: Record<string, any> = {
			javascript: {
				npm: "npm install api-client",
				yarn: "yarn add api-client",
				cdn: '<script src="https://cdn.example.com/api-client.js"></script>',
			},
			python: {
				pip: "pip install api-client",
				conda: "conda install api-client",
				requirements: "api-client>=1.0.0",
			},
			java: {
				maven:
					"<dependency><groupId>com.example</groupId><artifactId>api-client</artifactId><version>1.0.0</version></dependency>",
				gradle: 'implementation "com.example:api-client:1.0.0"',
			},
			php: {
				composer: "composer require example/api-client",
			},
			ruby: {
				gem: "gem install api-client",
				bundler: 'gem "api-client"',
			},
			go: {
				"go get": "go get github.com/example/api-client",
			},
		};

		return (
			installations[language] || {
				note: "Installation instructions not available",
			}
		);
	}

	private generateSDKQuickStart(
		language: string,
		options: APIReferenceGeneratorOptions,
	): string {
		const quickStarts: Record<string, string> = {
			javascript: `
import ApiClient from 'api-client';

const client = new ApiClient({
  apiKey: 'YOUR_API_KEY',
  baseURL: '${options.baseUrl}'
});

const data = await client.get('/endpoint');
console.log(data);
      `,
			python: `
from api_client import ApiClient

client = ApiClient(
    api_key='YOUR_API_KEY',
    base_url='${options.baseUrl}'
)

data = client.get('/endpoint')
print(data)
      `,
			java: `
ApiClient client = new ApiClient.Builder()
    .apiKey("YOUR_API_KEY")
    .baseUrl("${options.baseUrl}")
    .build();

ApiResponse response = client.get("/endpoint");
System.out.println(response.getData());
      `,
		};

		return quickStarts[language] || "// SDK quick start not available";
	}

	private generateSDKConfiguration(
		language: string,
		options: APIReferenceGeneratorOptions,
	): any {
		return {
			authentication: `Configure ${options.authentication.type} authentication`,
			baseUrl: `Set base URL to ${options.baseUrl}`,
			timeout: "Configure request timeout (default: 30s)",
			retries: "Configure retry policy (default: 3 retries)",
			userAgent: "Set custom User-Agent header",
			logging: "Enable debug logging for development",
		};
	}

	private generateSDKExamples(
		language: string,
		options: APIReferenceGeneratorOptions,
	): any[] {
		return [
			{
				title: "Basic GET Request",
				code: this.generateSDKExample(language, "GET", "/users", null, options),
			},
			{
				title: "POST with Data",
				code: this.generateSDKExample(
					language,
					"POST",
					"/users",
					{ name: "John Doe" },
					options,
				),
			},
			{
				title: "Error Handling",
				code: this.generateSDKErrorHandlingExample(language),
			},
		];
	}

	private generateSDKExample(
		language: string,
		method: string,
		path: string,
		data: any,
		options: APIReferenceGeneratorOptions,
	): string {
		// Simplified SDK example generation
		switch (language) {
			case "javascript":
				return data
					? `const result = await client.${method.toLowerCase()}('${path}', ${JSON.stringify(data)});`
					: `const result = await client.${method.toLowerCase()}('${path}');`;
			case "python":
				return data
					? `result = client.${method.toLowerCase()}('${path}', ${JSON.stringify(data)})`
					: `result = client.${method.toLowerCase()}('${path}')`;
			default:
				return `// ${method} ${path} example not available`;
		}
	}

	private generateSDKErrorHandling(language: string): string {
		const errorHandling: Record<string, string> = {
			javascript: `
try {
  const data = await client.get('/endpoint');
  console.log(data);
} catch (error) {
  if (error.status === 404) {
    console.log('Resource not found');
  } else if (error.status === 429) {
    console.log('Rate limit exceeded');
  } else {
    console.error('API error:', error.message);
  }
}
      `,
			python: `
try:
    data = client.get('/endpoint')
    print(data)
except ApiException as e:
    if e.status == 404:
        print('Resource not found')
    elif e.status == 429:
        print('Rate limit exceeded')
    else:
        print(f'API error: {e.message}')
      `,
		};

		return errorHandling[language] || "// Error handling example not available";
	}

	private generateSDKErrorHandlingExample(language: string): string {
		return this.generateSDKErrorHandling(language);
	}

	private generateSDKAdvancedUsage(language: string): any[] {
		return [
			{
				title: "Custom Headers",
				description: "How to add custom headers to requests",
			},
			{
				title: "Request Interceptors",
				description: "Modify requests before they are sent",
			},
			{
				title: "Response Interceptors",
				description: "Process responses before they are returned",
			},
			{
				title: "Pagination",
				description: "Handle paginated responses automatically",
			},
		];
	}

	private filterChangelogBySDK(
		changelog: readonly ChangelogEntry[],
		language: string,
	): ChangelogEntry[] {
		// Filter changelog entries relevant to the specific SDK
		return changelog.filter((entry) =>
			entry.changes.some(
				(change) =>
					change.description.toLowerCase().includes(language) ||
					change.description.toLowerCase().includes("sdk"),
			),
		);
	}

	private getChangeTypeIcon(type: string): string {
		const icons: Record<string, string> = {
			added: "✨",
			changed: "🔄",
			deprecated: "⚠️",
			removed: "🗑️",
			fixed: "🐛",
			security: "🔒",
		};

		return icons[type] || "📝";
	}

	private getChangeTypeColor(type: string): string {
		const colors: Record<string, string> = {
			added: "green",
			changed: "blue",
			deprecated: "orange",
			removed: "red",
			fixed: "purple",
			security: "red",
		};

		return colors[type] || "gray";
	}

	private extractBreakingChanges(
		changelog: readonly ChangelogEntry[],
	): ChangelogEntry[] {
		return changelog
			.map((entry) => ({
				...entry,
				changes: entry.changes.filter((change) => change.breaking),
			}))
			.filter((entry) => entry.changes.length > 0);
	}

	private generateMigrationGuides(changelog: readonly ChangelogEntry[]): any[] {
		const breakingChanges = this.extractBreakingChanges(changelog);

		return breakingChanges.map((entry) => ({
			version: entry.version,
			title: `Migration Guide for v${entry.version}`,
			description: `Guide for migrating from previous version to v${entry.version}`,
			changes: entry.changes.map((change) => ({
				...change,
				migrationSteps: this.generateMigrationSteps(change),
			})),
		}));
	}

	private generateMigrationSteps(change: ChangeItem): string[] {
		// This would typically be more sophisticated based on the change type
		return [
			"Review the breaking change description",
			"Update your code according to the new API",
			"Test your integration thoroughly",
			"Update your documentation",
		];
	}

	private generateUnitTestExamples(
		options: APIReferenceGeneratorOptions,
	): any[] {
		return [
			{
				framework: "Jest",
				language: "JavaScript",
				code: `
test('should fetch user data', async () => {
  const response = await fetch('${options.baseUrl}/users/1', {
    headers: { 'Authorization': 'Bearer test-token' }
  });
  
  expect(response.status).toBe(200);
  const user = await response.json();
  expect(user).toHaveProperty('id', 1);
});
        `,
			},
		];
	}

	private generateIntegrationTestExamples(
		options: APIReferenceGeneratorOptions,
	): any[] {
		return [
			{
				tool: "Postman",
				description: "Collection for testing API workflows",
				example: "Import the Postman collection and run the test suite",
			},
		];
	}

	private generateLoadTestExamples(
		options: APIReferenceGeneratorOptions,
	): any[] {
		return [
			{
				tool: "k6",
				code: `
import http from 'k6/http';
import { check } from 'k6';

export let options = {
  stages: [
    { duration: '2m', target: 100 },
    { duration: '5m', target: 200 },
    { duration: '2m', target: 0 }
  ]
};

export default function() {
  let response = http.get('${options.baseUrl}/users');
  check(response, {
    'status is 200': (r) => r.status === 200,
    'response time < 500ms': (r) => r.timings.duration < 500
  });
}
        `,
			},
		];
	}

	private generateTestEnvironments(
		options: APIReferenceGeneratorOptions,
	): any[] {
		return [
			{
				name: "Development",
				url: "http://localhost:3000/api",
				description: "Local development environment",
			},
			{
				name: "Staging",
				url: options.baseUrl.replace("api.", "staging-api."),
				description: "Staging environment for testing",
			},
			{
				name: "Production",
				url: options.baseUrl,
				description: "Live production environment",
			},
		];
	}

	private generateMockingStrategies(
		options: APIReferenceGeneratorOptions,
	): any[] {
		return [
			{
				strategy: "JSON Server",
				description: "Quick REST API mocking",
				setup: "npm install -g json-server",
			},
			{
				strategy: "Prism",
				description: "OpenAPI-based mocking",
				setup: "npm install -g @stoplight/prism-cli",
			},
			{
				strategy: "WireMock",
				description: "Flexible API mocking",
				setup: "Download WireMock standalone JAR",
			},
		];
	}

	private generateCICDIntegration(options: APIReferenceGeneratorOptions): any {
		return {
			githubActions: {
				name: "GitHub Actions",
				example: `
name: API Tests
on: [push, pull_request]
jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v2
      - name: Run API Tests
        run: npm run test:api
        `,
			},
			jenkins: {
				name: "Jenkins",
				example: "Configure pipeline to run API tests on every build",
			},
		};
	}

	private generateBestPracticeExamples(
		options: APIReferenceGeneratorOptions,
	): any[] {
		return [
			{
				practice: "Request Validation",
				good: "Validate input parameters before processing",
				bad: "Process requests without validation",
			},
			{
				practice: "Error Handling",
				good: "Return structured error responses with details",
				bad: "Return generic error messages",
			},
		];
	}

	private generateAntiPatterns(options: APIReferenceGeneratorOptions): any[] {
		return [
			{
				antiPattern: "Ignoring HTTP Status Codes",
				description: "Not checking response status codes",
				solution:
					"Always check and handle different status codes appropriately",
			},
			{
				antiPattern: "Hardcoding API Keys",
				description: "Storing API keys in source code",
				solution: "Use environment variables or secure vaults",
			},
		];
	}

	private generateAdditionalResources(): any[] {
		return [
			{
				title: "REST API Design Guidelines",
				url: "https://restfulapi.net/",
				description: "Best practices for RESTful API design",
			},
			{
				title: "OpenAPI Specification",
				url: "https://swagger.io/specification/",
				description: "Official OpenAPI documentation",
			},
			{
				title: "HTTP Status Codes",
				url: "https://httpstatuses.com/",
				description: "Complete list of HTTP status codes",
			},
		];
	}

	private generateQuickStartCode(
		options: APIReferenceGeneratorOptions,
	): string {
		return `curl -H "Authorization: Bearer YOUR_TOKEN" \\
  ${options.baseUrl}/users`;
	}

	private generateSampleRequestBody(requestBody: any): any {
		// Generate a sample request body based on the schema
		return {
			name: "John Doe",
			email: "john.doe@example.com",
			age: 30,
		};
	}

	private generateSampleResponse(response: any): any {
		// Generate a sample response based on the schema
		return {
			id: 1,
			name: "John Doe",
			email: "john.doe@example.com",
			createdAt: "2024-01-01T00:00:00Z",
		};
	}

	private generateParameterExample(param: APIParameter): any {
		switch (param.schema.type) {
			case "string":
				return param.schema.format === "date" ? "2024-01-01" : "example-value";
			case "integer":
			case "number":
				return 42;
			case "boolean":
				return true;
			default:
				return "example";
		}
	}

	private extractParameterValidation(schema: APISchema): string[] {
		const validations: string[] = [];

		if (schema.format) {
			validations.push(`Format: ${schema.format}`);
		}

		if ((schema as any).minLength) {
			validations.push(`Minimum length: ${(schema as any).minLength}`);
		}

		if ((schema as any).maxLength) {
			validations.push(`Maximum length: ${(schema as any).maxLength}`);
		}

		if ((schema as any).minimum) {
			validations.push(`Minimum value: ${(schema as any).minimum}`);
		}

		if ((schema as any).maximum) {
			validations.push(`Maximum value: ${(schema as any).maximum}`);
		}

		return validations;
	}

	private generateExampleValue(schema: APISchema): any {
		if (schema.example) return schema.example;

		switch (schema.type) {
			case "string":
				if (schema.format === "email") return "user@example.com";
				if (schema.format === "date") return "2024-01-01";
				if (schema.format === "date-time") return "2024-01-01T00:00:00Z";
				return "string-value";
			case "integer":
			case "number":
				return 42;
			case "boolean":
				return true;
			case "array":
				return [];
			case "object":
				return {};
			default:
				return null;
		}
	}

	private getResponseCategory(statusCode: number): string {
		if (statusCode >= 200 && statusCode < 300) return "Success";
		if (statusCode >= 300 && statusCode < 400) return "Redirection";
		if (statusCode >= 400 && statusCode < 500) return "Client Error";
		if (statusCode >= 500) return "Server Error";
		return "Informational";
	}
}
