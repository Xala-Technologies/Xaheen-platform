import { BaseGenerator } from "../base.generator";
import { TemplateManager } from "../../services/templates/template-loader";
import { ProjectAnalyzer } from "../../services/analysis/project-analyzer";
import type {
	DocumentationGeneratorOptions,
	DocumentationResult,
	APIEndpoint,
	APIParameter,
	APISchema,
	SecurityRequirement,
} from "./index";

export interface OpenAPIGeneratorOptions extends DocumentationGeneratorOptions {
	readonly apiTitle?: string;
	readonly apiVersion?: string;
	readonly apiDescription?: string;
	readonly serverUrls: readonly string[];
	readonly contactInfo?: {
		readonly name?: string;
		readonly url?: string;
		readonly email?: string;
	};
	readonly licenseInfo?: {
		readonly name: string;
		readonly url?: string;
	};
	readonly securitySchemes?: Record<string, SecurityScheme>;
	readonly endpoints: readonly APIEndpoint[];
	readonly tags?: readonly APITag[];
	readonly externalDocs?: {
		readonly description: string;
		readonly url: string;
	};
}

export interface SecurityScheme {
	readonly type: "apiKey" | "http" | "oauth2" | "openIdConnect";
	readonly description?: string;
	readonly name?: string;
	readonly in?: "query" | "header" | "cookie";
	readonly scheme?: string;
	readonly bearerFormat?: string;
	readonly flows?: OAuth2Flows;
	readonly openIdConnectUrl?: string;
}

export interface OAuth2Flows {
	readonly implicit?: OAuth2Flow;
	readonly password?: OAuth2Flow;
	readonly clientCredentials?: OAuth2Flow;
	readonly authorizationCode?: OAuth2Flow;
}

export interface OAuth2Flow {
	readonly authorizationUrl?: string;
	readonly tokenUrl?: string;
	readonly refreshUrl?: string;
	readonly scopes: Record<string, string>;
}

export interface APITag {
	readonly name: string;
	readonly description?: string;
	readonly externalDocs?: {
		readonly description: string;
		readonly url: string;
	};
}

export class OpenAPIGenerator extends BaseGenerator<OpenAPIGeneratorOptions> {
	private readonly templateManager: TemplateManager;
	private readonly analyzer: ProjectAnalyzer;

	constructor() {
		super();
		this.templateManager = new TemplateManager();
		this.analyzer = new ProjectAnalyzer();
	}

	async generate(
		options: OpenAPIGeneratorOptions,
	): Promise<DocumentationResult> {
		try {
			await this.validateOptions(options);

			const projectContext = await this.analyzer.analyze(process.cwd());
			const openAPISpec = await this.generateOpenAPISpec(
				options,
				projectContext,
			);

			// Generate OpenAPI specification file
			await this.generateSpecification(openAPISpec, options);

			// Generate Swagger UI if enabled
			if (options.enableSwaggerUI) {
				await this.generateSwaggerUI(options);
			}

			// Generate Redoc documentation
			await this.generateRedocDocs(options);

			// Generate Postman collection
			await this.generatePostmanCollection(openAPISpec, options);

			// Generate API client examples
			await this.generateClientExamples(openAPISpec, options);

			// Generate validation middleware
			await this.generateValidationMiddleware(openAPISpec, options);

			this.logger.success("OpenAPI documentation generated successfully");

			const files = [
				`${options.outputDir}/docs/api/openapi.yaml`,
				`${options.outputDir}/docs/api/openapi.json`,
				`${options.outputDir}/docs/api/swagger-ui.html`,
				`${options.outputDir}/docs/api/redoc.html`,
				`${options.outputDir}/docs/api/postman-collection.json`,
				`${options.outputDir}/docs/api/examples/curl-examples.md`,
				`${options.outputDir}/docs/api/examples/javascript-examples.md`,
				`${options.outputDir}/docs/api/examples/python-examples.md`,
				`${options.outputDir}/docs/api/validation/openapi-validator.ts`,
				`${options.outputDir}/docs/api/schemas/schemas.md`,
			];

			const commands = [
				"npm install --save-dev swagger-ui-dist",
				"npm install --save-dev redoc-cli",
				"npm install --save-dev @apidevtools/swagger-parser",
				"npm install --save-dev openapi-types",
			];

			const nextSteps = [
				"Review and customize the generated OpenAPI specification",
				"Update server URLs to match your deployment environments",
				"Add authentication and authorization details",
				"Configure CORS settings in Swagger UI",
				"Set up automatic spec generation from code annotations",
				"Integrate with CI/CD to validate API changes",
				"Host the documentation on a public URL",
			];

			return {
				success: true,
				message: `OpenAPI documentation for '${options.projectName}' generated successfully`,
				files,
				commands,
				nextSteps,
			};
		} catch (error) {
			this.logger.error("Failed to generate OpenAPI documentation", error);
			return {
				success: false,
				message: "Failed to generate OpenAPI documentation",
				files: [],
				error: error instanceof Error ? error.message : "Unknown error",
			};
		}
	}

	private async validateOptions(
		options: OpenAPIGeneratorOptions,
	): Promise<void> {
		if (!options.projectName) {
			throw new Error("Project name is required");
		}

		if (!options.version) {
			throw new Error("API version is required");
		}

		if (!options.serverUrls || options.serverUrls.length === 0) {
			throw new Error("At least one server URL is required");
		}
	}

	private async generateOpenAPISpec(
		options: OpenAPIGeneratorOptions,
		projectContext: any,
	): Promise<any> {
		const spec = {
			openapi: "3.0.3",
			info: {
				title: options.apiTitle || `${options.projectName} API`,
				version: options.apiVersion || options.version,
				description:
					options.apiDescription ||
					`API documentation for ${options.projectName}`,
				contact: options.contactInfo,
				license: options.licenseInfo || {
					name: "MIT",
					url: "https://opensource.org/licenses/MIT",
				},
			},
			servers: options.serverUrls.map((url) => ({
				url,
				description: this.getServerDescription(url),
			})),
			paths: this.generatePaths(options.endpoints),
			components: {
				schemas: this.generateSchemas(options.endpoints),
				securitySchemes:
					options.securitySchemes || this.getDefaultSecuritySchemes(),
				parameters: this.generateCommonParameters(),
				responses: this.generateCommonResponses(),
				examples: this.generateExamples(options.endpoints),
				requestBodies: this.generateCommonRequestBodies(),
				headers: this.generateCommonHeaders(),
				links: this.generateLinks(options.endpoints),
			},
			security: this.generateGlobalSecurity(options.securitySchemes),
			tags: options.tags || this.generateTagsFromEndpoints(options.endpoints),
			externalDocs: options.externalDocs,
		};

		return spec;
	}

	private async generateSpecification(
		spec: any,
		options: OpenAPIGeneratorOptions,
	): Promise<void> {
		// Generate YAML format
		await this.templateManager.renderTemplate(
			"documentation/openapi/openapi-spec.yaml.hbs",
			`${options.outputDir}/docs/api/openapi.yaml`,
			{ spec: spec },
		);

		// Generate JSON format
		await this.templateManager.renderTemplate(
			"documentation/openapi/openapi-spec.json.hbs",
			`${options.outputDir}/docs/api/openapi.json`,
			{ spec: JSON.stringify(spec, null, 2) },
		);
	}

	private async generateSwaggerUI(
		options: OpenAPIGeneratorOptions,
	): Promise<void> {
		const swaggerConfig = {
			specUrl: "./openapi.yaml",
			title: `${options.projectName} API Documentation`,
			favicon: "/favicon.ico",
			customCss: this.getCustomSwaggerCSS(),
			customJs: this.getCustomSwaggerJS(),
			enableFilter: true,
			enableDeepLinking: true,
			displayRequestDuration: true,
			supportedSubmitMethods: ["get", "post", "put", "delete", "patch"],
			oauth: {
				clientId: "your-client-id",
				clientSecret: "your-client-secret",
				realm: options.projectName,
				appName: `${options.projectName} API`,
				scopeSeparator: " ",
				additionalQueryStringParams: {},
			},
		};

		await this.templateManager.renderTemplate(
			"documentation/openapi/swagger-ui.html.hbs",
			`${options.outputDir}/docs/api/swagger-ui.html`,
			swaggerConfig,
		);
	}

	private async generateRedocDocs(
		options: OpenAPIGeneratorOptions,
	): Promise<void> {
		const redocConfig = {
			specUrl: "./openapi.yaml",
			title: `${options.projectName} API Reference`,
			theme: {
				colors: {
					primary: {
						main: "#1976d2",
					},
				},
				typography: {
					fontSize: "14px",
					lineHeight: "1.5em",
					code: {
						fontSize: "13px",
						fontFamily: "Courier, monospace",
					},
				},
				sidebar: {
					width: "260px",
				},
			},
			options: {
				hideDownloadButton: false,
				disableSearch: false,
				expandDefaultServerVariables: true,
				expandResponses: "all",
				generatedPayloadSamplesMaxDepth: 3,
				hideRequestPayloadSample: false,
				hideResponsePayloadSample: false,
				nativeScrollbars: false,
				pathInMiddlePanel: false,
				requiredPropsFirst: true,
				scrollYOffset: 0,
				showExtensions: true,
				sortPropsAlphabetically: true,
				theme: "light",
			},
		};

		await this.templateManager.renderTemplate(
			"documentation/openapi/redoc.html.hbs",
			`${options.outputDir}/docs/api/redoc.html`,
			redocConfig,
		);
	}

	private async generatePostmanCollection(
		spec: any,
		options: OpenAPIGeneratorOptions,
	): Promise<void> {
		const collection = {
			info: {
				name: `${options.projectName} API`,
				description: spec.info.description,
				version: spec.info.version,
				schema:
					"https://schema.getpostman.com/json/collection/v2.1.0/collection.json",
			},
			auth: this.generatePostmanAuth(options.securitySchemes),
			variable: this.generatePostmanVariables(spec.servers),
			item: this.generatePostmanItems(spec.paths),
		};

		await this.templateManager.renderTemplate(
			"documentation/openapi/postman-collection.json.hbs",
			`${options.outputDir}/docs/api/postman-collection.json`,
			{ collection: JSON.stringify(collection, null, 2) },
		);
	}

	private async generateClientExamples(
		spec: any,
		options: OpenAPIGeneratorOptions,
	): Promise<void> {
		// Generate cURL examples
		await this.templateManager.renderTemplate(
			"documentation/openapi/examples/curl-examples.md.hbs",
			`${options.outputDir}/docs/api/examples/curl-examples.md`,
			{
				spec,
				projectName: options.projectName,
				serverUrl: spec.servers[0]?.url || "https://api.example.com",
			},
		);

		// Generate JavaScript examples
		await this.templateManager.renderTemplate(
			"documentation/openapi/examples/javascript-examples.md.hbs",
			`${options.outputDir}/docs/api/examples/javascript-examples.md`,
			{
				spec,
				projectName: options.projectName,
				serverUrl: spec.servers[0]?.url || "https://api.example.com",
			},
		);

		// Generate Python examples
		await this.templateManager.renderTemplate(
			"documentation/openapi/examples/python-examples.md.hbs",
			`${options.outputDir}/docs/api/examples/python-examples.md`,
			{
				spec,
				projectName: options.projectName,
				serverUrl: spec.servers[0]?.url || "https://api.example.com",
			},
		);
	}

	private async generateValidationMiddleware(
		spec: any,
		options: OpenAPIGeneratorOptions,
	): Promise<void> {
		const validationConfig = {
			spec,
			projectName: options.projectName,
			runtime: options.runtime,
			enableRequestValidation: true,
			enableResponseValidation: true,
			enableSecurityValidation: true,
			validationOptions: {
				allowUnknownQueryParameters: false,
				allowUnknownBodyProperties: false,
				coerceTypes: true,
				removeAdditional: false,
			},
		};

		await this.templateManager.renderTemplate(
			"documentation/openapi/validation/openapi-validator.ts.hbs",
			`${options.outputDir}/docs/api/validation/openapi-validator.ts`,
			validationConfig,
		);
	}

	private generatePaths(
		endpoints: readonly APIEndpoint[],
	): Record<string, any> {
		const paths: Record<string, any> = {};

		for (const endpoint of endpoints) {
			if (!paths[endpoint.path]) {
				paths[endpoint.path] = {};
			}

			paths[endpoint.path][endpoint.method.toLowerCase()] = {
				summary: endpoint.summary,
				description: endpoint.description,
				tags: endpoint.tags,
				parameters: endpoint.parameters,
				requestBody: endpoint.requestBody,
				responses: endpoint.responses,
				security: endpoint.security,
			};
		}

		return paths;
	}

	private generateSchemas(
		endpoints: readonly APIEndpoint[],
	): Record<string, APISchema> {
		const schemas: Record<string, APISchema> = {};

		// Extract schemas from endpoints
		for (const endpoint of endpoints) {
			if (endpoint.requestBody?.content) {
				Object.values(endpoint.requestBody.content).forEach((mediaType) => {
					if (mediaType.schema && this.isComplexSchema(mediaType.schema)) {
						const schemaName = this.getSchemaName(endpoint, "Request");
						schemas[schemaName] = mediaType.schema;
					}
				});
			}

			Object.values(endpoint.responses).forEach((response, index) => {
				if (response.content) {
					Object.values(response.content).forEach((mediaType) => {
						if (mediaType.schema && this.isComplexSchema(mediaType.schema)) {
							const schemaName = this.getSchemaName(endpoint, "Response");
							schemas[schemaName] = mediaType.schema;
						}
					});
				}
			});
		}

		// Add common schemas
		schemas["Error"] = {
			type: "object",
			properties: {
				code: { type: "integer", format: "int32" },
				message: { type: "string" },
				details: { type: "string" },
			},
			required: ["code", "message"],
		};

		schemas["PaginationMeta"] = {
			type: "object",
			properties: {
				page: { type: "integer", minimum: 1 },
				limit: { type: "integer", minimum: 1, maximum: 100 },
				total: { type: "integer", minimum: 0 },
				totalPages: { type: "integer", minimum: 0 },
			},
			required: ["page", "limit", "total", "totalPages"],
		};

		return schemas;
	}

	private getDefaultSecuritySchemes(): Record<string, SecurityScheme> {
		return {
			bearerAuth: {
				type: "http",
				scheme: "bearer",
				bearerFormat: "JWT",
				description: "JWT Bearer token authentication",
			},
			apiKeyAuth: {
				type: "apiKey",
				in: "header",
				name: "X-API-Key",
				description: "API key authentication",
			},
			oauth2: {
				type: "oauth2",
				description: "OAuth2 authentication",
				flows: {
					authorizationCode: {
						authorizationUrl: "https://example.com/oauth/authorize",
						tokenUrl: "https://example.com/oauth/token",
						scopes: {
							read: "Read access",
							write: "Write access",
							admin: "Admin access",
						},
					},
				},
			},
		};
	}

	private generateCommonParameters(): Record<string, APIParameter> {
		return {
			PageParam: {
				name: "page",
				in: "query",
				description: "Page number for pagination",
				required: false,
				schema: { type: "integer", minimum: 1, default: 1 },
			},
			LimitParam: {
				name: "limit",
				in: "query",
				description: "Number of items per page",
				required: false,
				schema: { type: "integer", minimum: 1, maximum: 100, default: 20 },
			},
			SortParam: {
				name: "sort",
				in: "query",
				description: "Sort field and direction",
				required: false,
				schema: { type: "string", example: "createdAt:desc" },
			},
		};
	}

	private generateCommonResponses(): Record<string, any> {
		return {
			UnauthorizedError: {
				description: "Authentication information is missing or invalid",
				content: {
					"application/json": {
						schema: { $ref: "#/components/schemas/Error" },
					},
				},
			},
			ForbiddenError: {
				description: "Access to the resource is forbidden",
				content: {
					"application/json": {
						schema: { $ref: "#/components/schemas/Error" },
					},
				},
			},
			NotFoundError: {
				description: "The requested resource was not found",
				content: {
					"application/json": {
						schema: { $ref: "#/components/schemas/Error" },
					},
				},
			},
			ValidationError: {
				description: "Invalid input data",
				content: {
					"application/json": {
						schema: { $ref: "#/components/schemas/Error" },
					},
				},
			},
			InternalServerError: {
				description: "Internal server error",
				content: {
					"application/json": {
						schema: { $ref: "#/components/schemas/Error" },
					},
				},
			},
		};
	}

	private generateExamples(
		endpoints: readonly APIEndpoint[],
	): Record<string, any> {
		const examples: Record<string, any> = {};

		// Generate examples from endpoint schemas
		for (const endpoint of endpoints) {
			const exampleName = `${endpoint.method}${endpoint.path.replace(/[^a-zA-Z0-9]/g, "")}Example`;
			examples[exampleName] = {
				summary: `Example for ${endpoint.method} ${endpoint.path}`,
				value: this.generateExampleFromSchema(endpoint),
			};
		}

		return examples;
	}

	private generateCommonRequestBodies(): Record<string, any> {
		return {
			JsonBody: {
				description: "JSON request body",
				content: {
					"application/json": {
						schema: { type: "object" },
					},
				},
			},
			FormDataBody: {
				description: "Form data request body",
				content: {
					"multipart/form-data": {
						schema: { type: "object" },
					},
				},
			},
		};
	}

	private generateCommonHeaders(): Record<string, any> {
		return {
			"X-Request-ID": {
				description: "Unique request identifier",
				schema: { type: "string", format: "uuid" },
			},
			"X-Rate-Limit-Remaining": {
				description: "Number of requests remaining in the current window",
				schema: { type: "integer" },
			},
			"X-Rate-Limit-Reset": {
				description: "Time when the rate limit window resets",
				schema: { type: "integer", format: "timestamp" },
			},
		};
	}

	private generateLinks(
		endpoints: readonly APIEndpoint[],
	): Record<string, any> {
		const links: Record<string, any> = {};

		// Generate HATEOAS links between related endpoints
		for (const endpoint of endpoints) {
			if (endpoint.method === "GET" && endpoint.path.includes("{id}")) {
				const resourceName = this.extractResourceName(endpoint.path);
				links[`${resourceName}Update`] = {
					operationId: `update${resourceName}`,
					parameters: {
						id: "$response.body#/id",
					},
				};
				links[`${resourceName}Delete`] = {
					operationId: `delete${resourceName}`,
					parameters: {
						id: "$response.body#/id",
					},
				};
			}
		}

		return links;
	}

	private generateGlobalSecurity(
		securitySchemes?: Record<string, SecurityScheme>,
	): SecurityRequirement[] {
		if (!securitySchemes) {
			return [{ bearerAuth: [] }];
		}

		return Object.keys(securitySchemes).map((scheme) => ({ [scheme]: [] }));
	}

	private generateTagsFromEndpoints(
		endpoints: readonly APIEndpoint[],
	): APITag[] {
		const tagSet = new Set<string>();

		endpoints.forEach((endpoint) => {
			if (endpoint.tags) {
				endpoint.tags.forEach((tag) => tagSet.add(tag));
			} else {
				// Auto-generate tag from path
				const pathSegments = endpoint.path.split("/").filter(Boolean);
				if (pathSegments.length > 0) {
					tagSet.add(pathSegments[0]);
				}
			}
		});

		return Array.from(tagSet).map((tag) => ({
			name: tag,
			description: `Operations related to ${tag}`,
		}));
	}

	private getServerDescription(url: string): string {
		if (url.includes("localhost") || url.includes("127.0.0.1")) {
			return "Local development server";
		}
		if (url.includes("staging")) {
			return "Staging environment";
		}
		if (url.includes("dev")) {
			return "Development environment";
		}
		return "Production server";
	}

	private getCustomSwaggerCSS(): string {
		return `
      .swagger-ui .topbar { display: none; }
      .swagger-ui .info { margin: 50px 0; }
      .swagger-ui .scheme-container { margin: 50px 0; padding: 30px 0; }
    `;
	}

	private getCustomSwaggerJS(): string {
		return `
      window.onload = function() {
        const ui = SwaggerUIBundle({
          url: './openapi.yaml',
          dom_id: '#swagger-ui',
          deepLinking: true,
          presets: [SwaggerUIBundle.presets.apis, SwaggerUIBundle.presets.standalone],
          plugins: [SwaggerUIBundle.plugins.DownloadUrl],
          layout: "StandaloneLayout"
        });
      };
    `;
	}

	private generatePostmanAuth(
		securitySchemes?: Record<string, SecurityScheme>,
	): any {
		if (!securitySchemes) {
			return {
				type: "bearer",
				bearer: [{ key: "token", value: "{{bearerToken}}", type: "string" }],
			};
		}

		const firstScheme = Object.values(securitySchemes)[0];
		if (firstScheme.type === "http" && firstScheme.scheme === "bearer") {
			return {
				type: "bearer",
				bearer: [{ key: "token", value: "{{bearerToken}}", type: "string" }],
			};
		}

		if (firstScheme.type === "apiKey") {
			return {
				type: "apikey",
				apikey: [
					{
						key: "key",
						value: firstScheme.name || "X-API-Key",
						type: "string",
					},
					{ key: "value", value: "{{apiKey}}", type: "string" },
					{ key: "in", value: firstScheme.in || "header", type: "string" },
				],
			};
		}

		return {};
	}

	private generatePostmanVariables(servers: any[]): any[] {
		const variables = [
			{
				key: "baseUrl",
				value: servers[0]?.url || "https://api.example.com",
				type: "string",
			},
		];

		return variables;
	}

	private generatePostmanItems(paths: Record<string, any>): any[] {
		const items: any[] = [];

		for (const [path, methods] of Object.entries(paths)) {
			for (const [method, operation] of Object.entries(
				methods as Record<string, any>,
			)) {
				items.push({
					name: operation.summary || `${method.toUpperCase()} ${path}`,
					request: {
						method: method.toUpperCase(),
						header: this.generatePostmanHeaders(operation),
						url: {
							raw: `{{baseUrl}}${path}`,
							host: ["{{baseUrl}}"],
							path: path.split("/").filter(Boolean),
						},
						body: this.generatePostmanBody(operation),
					},
					response: [],
				});
			}
		}

		return items;
	}

	private generatePostmanHeaders(operation: any): any[] {
		const headers = [
			{ key: "Content-Type", value: "application/json" },
			{ key: "Accept", value: "application/json" },
		];

		return headers;
	}

	private generatePostmanBody(operation: any): any {
		if (operation.requestBody?.content?.["application/json"]) {
			return {
				mode: "raw",
				raw: JSON.stringify(
					this.generateExampleFromSchema(
						operation.requestBody.content["application/json"].schema,
					),
					null,
					2,
				),
				options: {
					raw: {
						language: "json",
					},
				},
			};
		}

		return {};
	}

	private isComplexSchema(schema: APISchema): boolean {
		return schema.type === "object" && !!schema.properties;
	}

	private getSchemaName(endpoint: APIEndpoint, suffix: string): string {
		const pathParts = endpoint.path.split("/").filter(Boolean);
		const resourceName = pathParts[0] || "Resource";
		return `${resourceName.charAt(0).toUpperCase() + resourceName.slice(1)}${suffix}`;
	}

	private extractResourceName(path: string): string {
		const pathParts = path.split("/").filter(Boolean);
		return pathParts[0] || "Resource";
	}

	private generateExampleFromSchema(schema: any): any {
		if (!schema) return {};

		if (schema.example) return schema.example;

		if (schema.type === "object" && schema.properties) {
			const example: any = {};
			for (const [prop, propSchema] of Object.entries(
				schema.properties as Record<string, any>,
			)) {
				example[prop] = this.generateExampleFromSchema(propSchema);
			}
			return example;
		}

		if (schema.type === "array" && schema.items) {
			return [this.generateExampleFromSchema(schema.items)];
		}

		// Generate example based on type
		switch (schema.type) {
			case "string":
				if (schema.format === "email") return "user@example.com";
				if (schema.format === "date-time") return new Date().toISOString();
				if (schema.format === "date")
					return new Date().toISOString().split("T")[0];
				if (schema.format === "uuid")
					return "123e4567-e89b-12d3-a456-426614174000";
				return "string";
			case "integer":
			case "number":
				return 42;
			case "boolean":
				return true;
			default:
				return null;
		}
	}
}
