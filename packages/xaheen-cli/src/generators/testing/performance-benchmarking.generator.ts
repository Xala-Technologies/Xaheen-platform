import chalk from "chalk";
import * as fs from "fs/promises";
import * as path from "path";
import { z } from "zod";
import { BaseGenerator } from "../base.generator";

// Performance benchmarking configuration schema
const PerformanceBenchmarkingOptionsSchema = z.object({
	projectName: z.string(),
	projectPath: z.string(),
	framework: z.enum(["k6", "locust", "jmeter", "gatling", "artillery", "wrk"]).default("k6"),
	scenarios: z.array(
		z.object({
			name: z.string(),
			description: z.string().optional(),
			endpoint: z.string(),
			method: z.enum(["GET", "POST", "PUT", "DELETE", "PATCH"]).default("GET"),
			headers: z.record(z.string()).optional(),
			body: z.any().optional(),
			auth: z
				.object({
					type: z.enum(["bearer", "basic", "oauth2", "api-key"]),
					credentials: z.string(),
				})
				.optional(),
			load: z.object({
				vus: z.number().min(1).default(10), // Virtual users
				duration: z.string().default("30s"),
				rampUp: z.string().optional(),
				rampDown: z.string().optional(),
				stages: z
					.array(
						z.object({
							duration: z.string(),
							target: z.number(),
						})
					)
					.optional(),
			}),
			thresholds: z
				.object({
					http_req_duration: z.array(z.string()).default(["p(95)<500"]),
					http_req_failed: z.array(z.string()).default(["rate<0.1"]),
					http_reqs: z.array(z.string()).optional(),
					vus: z.array(z.string()).optional(),
					custom: z.record(z.array(z.string())).optional(),
				})
				.optional(),
			checks: z
				.array(
					z.object({
						name: z.string(),
						condition: z.string(),
					})
				)
				.optional(),
		})
	),
	environment: z
		.object({
			baseUrl: z.string(),
			variables: z.record(z.string()).optional(),
			dataFiles: z
				.array(
					z.object({
						name: z.string(),
						path: z.string(),
						format: z.enum(["csv", "json", "yaml"]),
					})
				)
				.optional(),
		})
		.optional(),
	reporting: z
		.object({
			enabled: z.boolean().default(true),
			formats: z.array(z.enum(["html", "json", "junit", "csv"])).default(["html", "json"]),
			output: z.string().default("./reports"),
			realtime: z.boolean().default(false),
			dashboard: z.boolean().default(true),
			grafana: z
				.object({
					enabled: z.boolean().default(false),
					url: z.string().optional(),
					apiKey: z.string().optional(),
				})
				.optional(),
			datadog: z
				.object({
					enabled: z.boolean().default(false),
					apiKey: z.string().optional(),
					site: z.string().optional(),
				})
				.optional(),
		})
		.optional(),
	database: z
		.object({
			enabled: z.boolean().default(false),
			type: z.enum(["influxdb", "prometheus", "timescaledb"]).optional(),
			connection: z.string().optional(),
		})
		.optional(),
	advanced: z
		.object({
			tlsConfig: z
				.object({
					insecureSkipVerify: z.boolean().default(false),
					minVersion: z.string().optional(),
					cipherSuites: z.array(z.string()).optional(),
				})
				.optional(),
			dns: z
				.object({
					ttl: z.string().optional(),
					select: z.enum(["first", "random", "roundRobin"]).optional(),
				})
				.optional(),
			batch: z.number().optional(),
			batchPerHost: z.number().optional(),
			blacklistIPs: z.array(z.string()).optional(),
			blockHostnames: z.array(z.string()).optional(),
			throw: z.boolean().optional(),
			noConnectionReuse: z.boolean().optional(),
			noVUConnectionReuse: z.boolean().optional(),
		})
		.optional(),
});

export type PerformanceBenchmarkingOptions = z.infer<typeof PerformanceBenchmarkingOptionsSchema>;

interface BenchmarkFile {
	name: string;
	content: string;
	path: string;
}

export class PerformanceBenchmarkingGenerator extends BaseGenerator {
	async generate(options: PerformanceBenchmarkingOptions): Promise<void> {
		try {
			// Validate options
			const validatedOptions = PerformanceBenchmarkingOptionsSchema.parse(options);

			console.log(chalk.blue("📊 Generating Performance Benchmarking Configuration..."));

			// Generate benchmark files based on framework
			const files = await this.generateBenchmarkFiles(validatedOptions);

			// Write files to filesystem
			await this.writeFiles(files, validatedOptions.projectPath);

			// Generate Docker configuration for running benchmarks
			await this.generateDockerConfig(validatedOptions);

			// Generate CI/CD integration
			await this.generateCIIntegration(validatedOptions);

			// Generate reporting configuration
			if (validatedOptions.reporting?.enabled) {
				await this.generateReportingConfig(validatedOptions);
			}

			// Generate monitoring integration
			await this.generateMonitoringIntegration(validatedOptions);

			console.log(
				chalk.green("✅ Performance benchmarking configuration generated successfully!")
			);
		} catch (error) {
			console.error(
				chalk.red("❌ Error generating performance benchmarking configuration:"),
				error
			);
			throw error;
		}
	}

	private async generateBenchmarkFiles(
		options: PerformanceBenchmarkingOptions
	): Promise<BenchmarkFile[]> {
		const files: BenchmarkFile[] = [];

		switch (options.framework) {
			case "k6":
				files.push(...(await this.generateK6Files(options)));
				break;
			case "locust":
				files.push(...(await this.generateLocustFiles(options)));
				break;
			case "jmeter":
				files.push(...(await this.generateJMeterFiles(options)));
				break;
			case "gatling":
				files.push(...(await this.generateGatlingFiles(options)));
				break;
			case "artillery":
				files.push(...(await this.generateArtilleryFiles(options)));
				break;
			case "wrk":
				files.push(...(await this.generateWrkFiles(options)));
				break;
		}

		// Generate common configuration files
		files.push(...(await this.generateCommonFiles(options)));

		return files;
	}

	private async generateK6Files(
		options: PerformanceBenchmarkingOptions
	): Promise<BenchmarkFile[]> {
		const files: BenchmarkFile[] = [];

		// Generate main K6 script
		for (const scenario of options.scenarios) {
			files.push({
				name: `${scenario.name}.js`,
				content: this.generateK6Script(scenario, options),
				path: `benchmarks/k6/scenarios/${scenario.name}.js`,
			});
		}

		// Generate K6 configuration
		files.push({
			name: "k6.config.js",
			content: this.generateK6Config(options),
			path: "benchmarks/k6/k6.config.js",
		});

		// Generate helper functions
		files.push({
			name: "helpers.js",
			content: this.generateK6Helpers(options),
			path: "benchmarks/k6/lib/helpers.js",
		});

		// Generate data generator
		files.push({
			name: "data-generator.js",
			content: this.generateK6DataGenerator(options),
			path: "benchmarks/k6/lib/data-generator.js",
		});

		return files;
	}

	private generateK6Script(
		scenario: PerformanceBenchmarkingOptions["scenarios"][0],
		options: PerformanceBenchmarkingOptions
	): string {
		const stages = scenario.load.stages
			? scenario.load.stages
					.map((s) => `    { duration: '${s.duration}', target: ${s.target} },`)
					.join("\n")
			: `    { duration: '${scenario.load.rampUp || "10s"}', target: ${scenario.load.vus} },
    { duration: '${scenario.load.duration}', target: ${scenario.load.vus} },
    { duration: '${scenario.load.rampDown || "10s"}', target: 0 },`;

		const thresholds = scenario.thresholds
			? Object.entries(scenario.thresholds)
					.filter(([_, values]) => values && values.length > 0)
					.map(([key, values]) => `    '${key}': ${JSON.stringify(values)},`)
					.join("\n")
			: `    'http_req_duration': ['p(95)<500'],
    'http_req_failed': ['rate<0.1'],`;

		const checks = scenario.checks
			? scenario.checks
					.map(
						(check) => `    check(response, {
      '${check.name}': ${check.condition},
    });`
					)
					.join("\n")
			: `    check(response, {
      'status is 200': (r) => r.status === 200,
      'response time < 500ms': (r) => r.timings.duration < 500,
    });`;

		const auth = scenario.auth
			? `
  const authHeader = ${this.generateAuthHeader(scenario.auth)};
  params.headers = { ...params.headers, ...authHeader };`
			: "";

		return `import http from 'k6/http';
import { check, sleep } from 'k6';
import { Rate, Trend } from 'k6/metrics';
import { SharedArray } from 'k6/data';
import { randomItem } from 'https://jslib.k6.io/k6-utils/1.2.0/index.js';

// Custom metrics
const errorRate = new Rate('errors');
const apiDuration = new Trend('api_duration');

// Load test data if available
${
	options.environment?.dataFiles
		? `const testData = new SharedArray('test-data', function() {
  return JSON.parse(open('../../data/${options.environment.dataFiles[0]?.name || "test-data.json"}'));
});`
		: "// No test data configured"
}

// Test configuration
export const options = {
  stages: [
${stages}
  ],
  thresholds: {
${thresholds}
  },
  ${
		options.reporting?.realtime
			? `ext: {
    loadimpact: {
      projectID: ${options.projectName},
      name: '${scenario.name}',
    },
  },`
			: ""
	}
};

// Setup function - runs once before the test
export function setup() {
  console.log('Setting up test: ${scenario.name}');
  ${scenario.description ? `console.log('Description: ${scenario.description}');` : ""}
  
  // Perform any setup tasks here
  return {
    baseUrl: '${options.environment?.baseUrl || "http://localhost:3000"}',
    timestamp: new Date().toISOString(),
  };
}

// Main test function
export default function(data) {
  const url = \`\${data.baseUrl}${scenario.endpoint}\`;
  
  const params = {
    headers: {
      'Content-Type': 'application/json',
      ${
				scenario.headers
					? Object.entries(scenario.headers)
							.map(([key, value]) => `'${key}': '${value}',`)
							.join("\n      ")
					: ""
			}
    },
    ${
			scenario.method !== "GET" && scenario.body
				? `body: JSON.stringify(${JSON.stringify(scenario.body)}),`
				: ""
		}
    tags: {
      scenario: '${scenario.name}',
      method: '${scenario.method}',
    },
  };
${auth}

  // Make the request
  const response = http.${scenario.method.toLowerCase()}(url, ${
			scenario.method !== "GET" && scenario.body ? "params.body, " : ""
		}params);

  // Record custom metrics
  apiDuration.add(response.timings.duration);
  errorRate.add(response.status >= 400);

  // Perform checks
  const checkResult = ${checks.replace(/check\(response,/, "check(response,")}

  // Log failures for debugging
  if (!checkResult) {
    console.error(\`Request failed: \${response.status} - \${response.body}\`);
  }

  // Think time between requests
  sleep(Math.random() * 2 + 1);
}

// Teardown function - runs once after the test
export function teardown(data) {
  console.log(\`Test completed at: \${new Date().toISOString()}\`);
  console.log(\`Test duration: \${Date.now() - new Date(data.timestamp).getTime()}ms\`);
  
  // Perform any cleanup tasks here
}

// Custom scenario for spike testing
export function spikeTest() {
  const url = \`\${__ENV.BASE_URL || '${options.environment?.baseUrl || "http://localhost:3000"}'}${
			scenario.endpoint
		}\`;
  
  // Sudden spike in traffic
  for (let i = 0; i < 100; i++) {
    http.get(url);
  }
}

// Custom scenario for stress testing
export function stressTest() {
  const url = \`\${__ENV.BASE_URL || '${options.environment?.baseUrl || "http://localhost:3000"}'}${
			scenario.endpoint
		}\`;
  
  // Gradually increase load until breaking point
  const response = http.get(url);
  
  check(response, {
    'system under stress': (r) => r.status === 200 && r.timings.duration < 2000,
  });
}`;
	}

	private generateK6Config(options: PerformanceBenchmarkingOptions): string {
		return `module.exports = {
  // Global configuration for all K6 tests
  projectName: '${options.projectName}',
  
  // Environment configuration
  environment: {
    baseUrl: process.env.BASE_URL || '${options.environment?.baseUrl || "http://localhost:3000"}',
    ${
			options.environment?.variables
				? Object.entries(options.environment.variables)
						.map(([key, value]) => `${key}: process.env.${key} || '${value}',`)
						.join("\n    ")
				: ""
		}
  },

  // Default options for all tests
  defaultOptions: {
    vus: ${Math.min(...options.scenarios.map((s) => s.load.vus))},
    duration: '${options.scenarios[0]?.load.duration || "30s"}',
    thresholds: {
      http_req_duration: ['p(95)<500', 'p(99)<1000'],
      http_req_failed: ['rate<0.1'],
      http_reqs: ['rate>10'],
    },
  },

  // Output configuration
  output: {
    ${
			options.reporting?.formats.includes("json")
				? `json: {
      enabled: true,
      path: '${options.reporting.output}/results.json',
    },`
				: ""
		}
    ${
			options.reporting?.formats.includes("csv")
				? `csv: {
      enabled: true,
      path: '${options.reporting.output}/results.csv',
      saveInterval: '1s',
    },`
				: ""
		}
    ${
			options.database?.enabled
				? `${options.database.type}: {
      enabled: true,
      url: '${options.database.connection}',
      pushInterval: '10s',
    },`
				: ""
		}
    ${
			options.reporting?.grafana?.enabled
				? `grafana: {
      enabled: true,
      url: '${options.reporting.grafana.url}',
      apiKey: process.env.GRAFANA_API_KEY || '${options.reporting.grafana.apiKey}',
    },`
				: ""
		}
    ${
			options.reporting?.datadog?.enabled
				? `datadog: {
      enabled: true,
      apiKey: process.env.DATADOG_API_KEY || '${options.reporting.datadog.apiKey}',
      site: '${options.reporting.datadog.site || "datadoghq.com"}',
    },`
				: ""
		}
  },

  // Scenarios configuration
  scenarios: {
${options.scenarios
	.map(
		(scenario) => `    '${scenario.name}': {
      executor: 'ramping-vus',
      startVUs: 0,
      stages: ${JSON.stringify(
				scenario.load.stages || [
					{ duration: scenario.load.rampUp || "10s", target: scenario.load.vus },
					{ duration: scenario.load.duration, target: scenario.load.vus },
					{ duration: scenario.load.rampDown || "10s", target: 0 },
				]
			)},
      gracefulRampDown: '30s',
    },`
	)
	.join("\n")}
  },

  // Cloud configuration (K6 Cloud)
  cloud: {
    projectID: process.env.K6_CLOUD_PROJECT_ID,
    name: '${options.projectName} Performance Tests',
  },

  // Advanced configuration
  ${
		options.advanced
			? `advanced: ${JSON.stringify(options.advanced, null, 4).replace(/^/gm, "  ").trim()},`
			: ""
	}
};`;
	}

	private generateK6Helpers(options: PerformanceBenchmarkingOptions): string {
		return `import { check } from 'k6';
import http from 'k6/http';
import { randomIntBetween, randomString } from 'https://jslib.k6.io/k6-utils/1.2.0/index.js';

// Authentication helper
export function authenticate(credentials) {
  const response = http.post(\`\${__ENV.BASE_URL}/auth/login\`, JSON.stringify(credentials), {
    headers: { 'Content-Type': 'application/json' },
  });

  check(response, {
    'authentication successful': (r) => r.status === 200,
    'auth token received': (r) => r.json('token') !== undefined,
  });

  return response.json('token');
}

// Request builder helper
export function buildRequest(method, endpoint, options = {}) {
  const defaults = {
    headers: {
      'Content-Type': 'application/json',
      'User-Agent': 'K6-Performance-Test/${options.projectName}',
    },
    timeout: '30s',
    compression: 'gzip',
  };

  return {
    ...defaults,
    ...options,
    headers: {
      ...defaults.headers,
      ...options.headers,
    },
  };
}

// Data generator helpers
export function generateUser() {
  return {
    username: \`user_\${randomString(8)}\`,
    email: \`test_\${randomString(8)}@example.com\`,
    password: randomString(12),
    age: randomIntBetween(18, 65),
  };
}

export function generateProduct() {
  const categories = ['Electronics', 'Clothing', 'Books', 'Food', 'Sports'];
  return {
    name: \`Product \${randomString(6)}\`,
    price: randomIntBetween(10, 1000),
    category: categories[randomIntBetween(0, categories.length - 1)],
    stock: randomIntBetween(0, 100),
  };
}

export function generateOrder() {
  return {
    orderId: randomString(10),
    items: Array.from({ length: randomIntBetween(1, 5) }, generateProduct),
    totalAmount: randomIntBetween(50, 5000),
    status: ['pending', 'processing', 'shipped', 'delivered'][randomIntBetween(0, 3)],
  };
}

// Response validation helpers
export function validateResponse(response, expectedSchema) {
  const checks = {
    'status is success': (r) => r.status >= 200 && r.status < 300,
    'response has body': (r) => r.body !== null && r.body !== undefined,
  };

  if (expectedSchema) {
    Object.keys(expectedSchema).forEach((key) => {
      checks[\`response has \${key}\`] = (r) => {
        try {
          const json = r.json();
          return json.hasOwnProperty(key);
        } catch {
          return false;
        }
      };
    });
  }

  return check(response, checks);
}

// Retry helper with exponential backoff
export function retryRequest(fn, maxRetries = 3, initialDelay = 1000) {
  let lastError;
  
  for (let i = 0; i < maxRetries; i++) {
    try {
      const result = fn();
      if (result.status < 500) {
        return result;
      }
      lastError = new Error(\`Server error: \${result.status}\`);
    } catch (error) {
      lastError = error;
    }
    
    if (i < maxRetries - 1) {
      sleep(initialDelay * Math.pow(2, i) / 1000);
    }
  }
  
  throw lastError;
}

// Batch request helper
export function batchRequests(requests) {
  const responses = http.batch(requests);
  
  responses.forEach((response, index) => {
    check(response, {
      \`request \${index} successful\`: (r) => r.status === 200,
    });
  });
  
  return responses;
}

// Circuit breaker pattern
export class CircuitBreaker {
  constructor(threshold = 5, timeout = 60000) {
    this.failureCount = 0;
    this.threshold = threshold;
    this.timeout = timeout;
    this.state = 'CLOSED';
    this.nextAttempt = Date.now();
  }

  async execute(fn) {
    if (this.state === 'OPEN') {
      if (Date.now() < this.nextAttempt) {
        throw new Error('Circuit breaker is OPEN');
      }
      this.state = 'HALF_OPEN';
    }

    try {
      const result = await fn();
      if (this.state === 'HALF_OPEN') {
        this.state = 'CLOSED';
        this.failureCount = 0;
      }
      return result;
    } catch (error) {
      this.failureCount++;
      if (this.failureCount >= this.threshold) {
        this.state = 'OPEN';
        this.nextAttempt = Date.now() + this.timeout;
      }
      throw error;
    }
  }
}`;
	}

	private generateK6DataGenerator(options: PerformanceBenchmarkingOptions): string {
		return `import { randomString, randomIntBetween, randomItem } from 'https://jslib.k6.io/k6-utils/1.2.0/index.js';
import Papa from 'https://jslib.k6.io/papaparse/5.1.1/index.js';

// Generate test data for different scenarios
export function generateTestData(scenario, count = 100) {
  const data = [];
  
  for (let i = 0; i < count; i++) {
    switch (scenario) {
      case 'users':
        data.push(generateUserData());
        break;
      case 'transactions':
        data.push(generateTransactionData());
        break;
      case 'api-calls':
        data.push(generateApiCallData());
        break;
      default:
        data.push(generateGenericData());
    }
  }
  
  return data;
}

function generateUserData() {
  const firstNames = ['John', 'Jane', 'Bob', 'Alice', 'Charlie', 'Diana'];
  const lastNames = ['Smith', 'Johnson', 'Williams', 'Brown', 'Jones'];
  const domains = ['gmail.com', 'yahoo.com', 'outlook.com', 'example.com'];
  
  return {
    id: randomString(10),
    firstName: randomItem(firstNames),
    lastName: randomItem(lastNames),
    email: \`\${randomString(8)}@\${randomItem(domains)}\`,
    age: randomIntBetween(18, 80),
    country: randomItem(['US', 'UK', 'CA', 'AU', 'DE', 'FR']),
    isActive: Math.random() > 0.5,
    createdAt: new Date(Date.now() - randomIntBetween(0, 365 * 24 * 60 * 60 * 1000)).toISOString(),
  };
}

function generateTransactionData() {
  return {
    transactionId: randomString(16),
    amount: (Math.random() * 10000).toFixed(2),
    currency: randomItem(['USD', 'EUR', 'GBP', 'CAD']),
    type: randomItem(['purchase', 'refund', 'transfer', 'withdrawal']),
    status: randomItem(['pending', 'completed', 'failed', 'cancelled']),
    merchantId: randomString(8),
    customerId: randomString(10),
    timestamp: new Date().toISOString(),
    metadata: {
      ip: \`\${randomIntBetween(1, 255)}.\${randomIntBetween(0, 255)}.\${randomIntBetween(0, 255)}.\${randomIntBetween(0, 255)}\`,
      device: randomItem(['desktop', 'mobile', 'tablet']),
      browser: randomItem(['Chrome', 'Firefox', 'Safari', 'Edge']),
    },
  };
}

function generateApiCallData() {
  const endpoints = [
    '/api/users',
    '/api/products',
    '/api/orders',
    '/api/payments',
    '/api/analytics',
  ];
  
  return {
    endpoint: randomItem(endpoints),
    method: randomItem(['GET', 'POST', 'PUT', 'DELETE']),
    headers: {
      'X-Request-ID': randomString(16),
      'X-Client-Version': \`\${randomIntBetween(1, 5)}.\${randomIntBetween(0, 9)}.\${randomIntBetween(0, 99)}\`,
    },
    queryParams: {
      page: randomIntBetween(1, 100),
      limit: randomItem([10, 25, 50, 100]),
      sort: randomItem(['asc', 'desc']),
    },
    body: generateGenericData(),
  };
}

function generateGenericData() {
  return {
    id: randomString(10),
    value: randomIntBetween(1, 1000),
    timestamp: Date.now(),
    data: {
      field1: randomString(20),
      field2: randomIntBetween(1, 100),
      field3: Math.random() > 0.5,
      field4: Array.from({ length: randomIntBetween(1, 5) }, () => randomString(5)),
    },
  };
}

// Load data from CSV file
export function loadCSVData(filepath) {
  const csvData = open(filepath);
  const parsed = Papa.parse(csvData, {
    header: true,
    dynamicTyping: true,
    skipEmptyLines: true,
  });
  
  if (parsed.errors.length > 0) {
    console.error('CSV parsing errors:', parsed.errors);
  }
  
  return parsed.data;
}

// Load data from JSON file
export function loadJSONData(filepath) {
  const jsonData = open(filepath);
  return JSON.parse(jsonData);
}

// Generate parameterized data for scenarios
export function generateScenarioData(scenarioName, options = {}) {
  const defaults = {
    count: 100,
    randomize: true,
    seed: Date.now(),
  };
  
  const config = { ...defaults, ...options };
  
  switch (scenarioName) {
    case 'load-test':
      return generateLoadTestData(config);
    case 'stress-test':
      return generateStressTestData(config);
    case 'spike-test':
      return generateSpikeTestData(config);
    case 'soak-test':
      return generateSoakTestData(config);
    default:
      return generateTestData('generic', config.count);
  }
}

function generateLoadTestData(config) {
  return {
    users: generateTestData('users', config.count),
    duration: '5m',
    rampUp: '1m',
    steadyState: '3m',
    rampDown: '1m',
  };
}

function generateStressTestData(config) {
  return {
    stages: [
      { duration: '2m', target: 100 },
      { duration: '5m', target: 200 },
      { duration: '2m', target: 300 },
      { duration: '5m', target: 400 },
      { duration: '2m', target: 0 },
    ],
    breakingPoint: null,
  };
}

function generateSpikeTestData(config) {
  return {
    stages: [
      { duration: '10s', target: 10 },
      { duration: '10s', target: 500 },
      { duration: '1m', target: 500 },
      { duration: '10s', target: 10 },
      { duration: '1m', target: 10 },
    ],
  };
}

function generateSoakTestData(config) {
  return {
    duration: '2h',
    vus: 100,
    checkMemoryLeaks: true,
    checkResourceUsage: true,
  };
}

// Export data to different formats
export function exportData(data, format, filepath) {
  switch (format) {
    case 'csv':
      const csv = Papa.unparse(data);
      return csv;
    case 'json':
      return JSON.stringify(data, null, 2);
    case 'ndjson':
      return data.map(item => JSON.stringify(item)).join('\\n');
    default:
      throw new Error(\`Unsupported format: \${format}\`);
  }
}`;
	}

	private async generateLocustFiles(
		options: PerformanceBenchmarkingOptions
	): Promise<BenchmarkFile[]> {
		const files: BenchmarkFile[] = [];

		// Generate main Locust file
		files.push({
			name: "locustfile.py",
			content: this.generateLocustFile(options),
			path: "benchmarks/locust/locustfile.py",
		});

		// Generate configuration file
		files.push({
			name: "locust.conf",
			content: this.generateLocustConfig(options),
			path: "benchmarks/locust/locust.conf",
		});

		// Generate helper functions
		files.push({
			name: "helpers.py",
			content: this.generateLocustHelpers(options),
			path: "benchmarks/locust/helpers.py",
		});

		return files;
	}

	private generateLocustFile(options: PerformanceBenchmarkingOptions): string {
		const scenarios = options.scenarios
			.map(
				(scenario) => `
    @task(${scenario.load.vus || 1})
    def ${scenario.name.replace(/-/g, "_")}(self):
        """${scenario.description || scenario.name}"""
        ${
					scenario.auth
						? `headers = self.get_auth_headers("${scenario.auth.type}", "${scenario.auth.credentials}")`
						: "headers = {}"
				}
        ${
					scenario.headers
						? `headers.update(${JSON.stringify(scenario.headers)})`
						: ""
				}
        
        with self.client.${scenario.method.toLowerCase()}(
            "${scenario.endpoint}",
            ${scenario.body ? `json=${JSON.stringify(scenario.body)},` : ""}
            headers=headers,
            catch_response=True,
            name="${scenario.name}"
        ) as response:
            if response.status_code == 200:
                response.success()
            else:
                response.failure(f"Got status code {response.status_code}")`
			)
			.join("\n");

		return `from locust import HttpUser, task, between, events
from locust.contrib.fasthttp import FastHttpUser
import json
import random
import time
from helpers import *

class PerformanceTestUser(FastHttpUser):
    """Main performance test user class"""
    
    wait_time = between(1, 3)
    host = "${options.environment?.baseUrl || "http://localhost:3000"}"
    
    def on_start(self):
        """Called when a user starts"""
        self.test_data = load_test_data()
        self.user_id = f"user_{random.randint(1000, 9999)}"
        ${
					options.scenarios.some((s) => s.auth)
						? `
        # Authenticate if needed
        self.auth_token = self.authenticate()`
						: ""
				}
    
    def get_auth_headers(self, auth_type, credentials):
        """Generate authentication headers"""
        if auth_type == "bearer":
            return {"Authorization": f"Bearer {self.auth_token}"}
        elif auth_type == "api-key":
            return {"X-API-Key": credentials}
        elif auth_type == "basic":
            import base64
            encoded = base64.b64encode(credentials.encode()).decode()
            return {"Authorization": f"Basic {encoded}"}
        return {}
    
    def authenticate(self):
        """Perform authentication"""
        response = self.client.post("/auth/login", json={
            "username": "test_user",
            "password": "test_password"
        })
        if response.status_code == 200:
            return response.json().get("token")
        return None
${scenarios}

    def on_stop(self):
        """Called when a user stops"""
        pass

class AdminUser(HttpUser):
    """Admin user for administrative tasks"""
    
    wait_time = between(5, 10)
    weight = 1  # Only 1% of users are admins
    
    @task
    def admin_dashboard(self):
        self.client.get("/admin/dashboard")
    
    @task
    def admin_reports(self):
        self.client.get("/admin/reports")

# Event hooks for custom metrics
@events.test_start.add_listener
def on_test_start(environment, **kwargs):
    print(f"Test started with {environment.parsed_options.num_users} users")

@events.test_stop.add_listener
def on_test_stop(environment, **kwargs):
    print(f"Test stopped. Total requests: {environment.stats.total.num_requests}")

# Custom load shape for advanced scenarios
class StagesShape(LoadTestShape):
    """Custom load shape with multiple stages"""
    
    stages = [
        {"duration": 60, "users": 10, "spawn_rate": 1},
        {"duration": 120, "users": 50, "spawn_rate": 5},
        {"duration": 180, "users": 100, "spawn_rate": 10},
        {"duration": 120, "users": 50, "spawn_rate": 5},
        {"duration": 60, "users": 10, "spawn_rate": 1},
    ]
    
    def tick(self):
        run_time = self.get_run_time()
        
        for stage in self.stages:
            if run_time < stage["duration"]:
                return (stage["users"], stage["spawn_rate"])
        
        return None`;
	}

	private generateLocustConfig(options: PerformanceBenchmarkingOptions): string {
		return `# Locust configuration file
# Generated by Xaheen CLI

[runtime]
host = ${options.environment?.baseUrl || "http://localhost:3000"}
users = ${Math.max(...options.scenarios.map((s) => s.load.vus))}
spawn-rate = ${Math.ceil(Math.max(...options.scenarios.map((s) => s.load.vus)) / 10)}
run-time = ${options.scenarios[0]?.load.duration || "30s"}

[ui]
web-host = 0.0.0.0
web-port = 8089

[reporting]
# CSV output
csv = ${options.reporting?.output}/locust
csv-full-history = true

# HTML report
html = ${options.reporting?.output}/report.html

# Only log errors
only-summary = false
print-stats = true

[distributed]
# Master configuration
master = false
master-bind-host = *
master-bind-port = 5557

# Worker configuration
worker = false
master-host = localhost
master-port = 5557

[monitoring]
# Prometheus metrics
prometheus-port = 9646

# InfluxDB export
${
	options.database?.enabled && options.database.type === "influxdb"
		? `influxdb-host = ${options.database.connection}
influxdb-port = 8086
influxdb-database = locust`
		: ""
}

[advanced]
# Connection pooling
connection-timeout = 30.0
network-timeout = 60.0

# Request settings
catch-exceptions = true
stop-on-error = false

# Resource limits
max-workers = 100
max-wait = 5000`;
	}

	private generateLocustHelpers(options: PerformanceBenchmarkingOptions): string {
		return `"""Helper functions for Locust performance tests"""

import json
import csv
import random
import string
import time
from datetime import datetime, timedelta
import requests
from functools import wraps

def load_test_data():
    """Load test data from files"""
    try:
        with open('../../data/test-data.json', 'r') as f:
            return json.load(f)
    except FileNotFoundError:
        return generate_test_data()

def generate_test_data():
    """Generate random test data"""
    return {
        'users': [generate_user() for _ in range(100)],
        'products': [generate_product() for _ in range(50)],
        'orders': [generate_order() for _ in range(200)],
    }

def generate_user():
    """Generate random user data"""
    return {
        'id': random.randint(1000, 9999),
        'username': f"user_{''.join(random.choices(string.ascii_lowercase, k=8))}",
        'email': f"test_{''.join(random.choices(string.ascii_lowercase, k=8))}@example.com",
        'age': random.randint(18, 65),
    }

def generate_product():
    """Generate random product data"""
    categories = ['Electronics', 'Clothing', 'Books', 'Food', 'Sports']
    return {
        'id': random.randint(10000, 99999),
        'name': f"Product {''.join(random.choices(string.ascii_uppercase, k=6))}",
        'price': round(random.uniform(10, 1000), 2),
        'category': random.choice(categories),
        'stock': random.randint(0, 100),
    }

def generate_order():
    """Generate random order data"""
    return {
        'orderId': ''.join(random.choices(string.ascii_uppercase + string.digits, k=10)),
        'customerId': random.randint(1000, 9999),
        'items': [generate_product() for _ in range(random.randint(1, 5))],
        'totalAmount': round(random.uniform(50, 5000), 2),
        'status': random.choice(['pending', 'processing', 'shipped', 'delivered']),
        'createdAt': (datetime.now() - timedelta(days=random.randint(0, 30))).isoformat(),
    }

def retry_on_failure(max_retries=3, delay=1):
    """Decorator to retry failed requests"""
    def decorator(func):
        @wraps(func)
        def wrapper(*args, **kwargs):
            for attempt in range(max_retries):
                try:
                    return func(*args, **kwargs)
                except Exception as e:
                    if attempt == max_retries - 1:
                        raise
                    time.sleep(delay * (2 ** attempt))
            return None
        return wrapper
    return decorator

def validate_response(response, expected_status=200, expected_schema=None):
    """Validate API response"""
    assert response.status_code == expected_status, f"Expected {expected_status}, got {response.status_code}"
    
    if expected_schema:
        data = response.json()
        for key in expected_schema:
            assert key in data, f"Missing required field: {key}"
    
    return True

def measure_time(func):
    """Decorator to measure function execution time"""
    @wraps(func)
    def wrapper(*args, **kwargs):
        start = time.time()
        result = func(*args, **kwargs)
        duration = (time.time() - start) * 1000  # Convert to milliseconds
        print(f"{func.__name__} took {duration:.2f}ms")
        return result
    return wrapper

class DataFeeder:
    """Feed data to test scenarios"""
    
    def __init__(self, data_file=None):
        self.data = self.load_data(data_file) if data_file else []
        self.index = 0
    
    def load_data(self, data_file):
        """Load data from CSV or JSON file"""
        if data_file.endswith('.json'):
            with open(data_file, 'r') as f:
                return json.load(f)
        elif data_file.endswith('.csv'):
            with open(data_file, 'r') as f:
                return list(csv.DictReader(f))
        return []
    
    def next(self):
        """Get next data item"""
        if not self.data:
            return None
        item = self.data[self.index % len(self.data)]
        self.index += 1
        return item
    
    def random(self):
        """Get random data item"""
        return random.choice(self.data) if self.data else None

class MetricsCollector:
    """Collect custom metrics during tests"""
    
    def __init__(self):
        self.metrics = {
            'response_times': [],
            'error_count': 0,
            'success_count': 0,
            'custom_metrics': {},
        }
    
    def record_response_time(self, duration):
        """Record response time"""
        self.metrics['response_times'].append(duration)
    
    def record_error(self):
        """Record error"""
        self.metrics['error_count'] += 1
    
    def record_success(self):
        """Record success"""
        self.metrics['success_count'] += 1
    
    def record_custom(self, name, value):
        """Record custom metric"""
        if name not in self.metrics['custom_metrics']:
            self.metrics['custom_metrics'][name] = []
        self.metrics['custom_metrics'][name].append(value)
    
    def get_summary(self):
        """Get metrics summary"""
        response_times = self.metrics['response_times']
        return {
            'total_requests': len(response_times) + self.metrics['error_count'],
            'success_rate': self.metrics['success_count'] / (self.metrics['success_count'] + self.metrics['error_count']) * 100 if self.metrics['error_count'] > 0 else 100,
            'avg_response_time': sum(response_times) / len(response_times) if response_times else 0,
            'min_response_time': min(response_times) if response_times else 0,
            'max_response_time': max(response_times) if response_times else 0,
            'p95_response_time': sorted(response_times)[int(len(response_times) * 0.95)] if response_times else 0,
            'p99_response_time': sorted(response_times)[int(len(response_times) * 0.99)] if response_times else 0,
            'custom_metrics': self.metrics['custom_metrics'],
        }`;
	}

	private async generateJMeterFiles(
		options: PerformanceBenchmarkingOptions
	): Promise<BenchmarkFile[]> {
		const files: BenchmarkFile[] = [];

		// Generate JMeter test plan
		files.push({
			name: "test-plan.jmx",
			content: this.generateJMeterTestPlan(options),
			path: "benchmarks/jmeter/test-plan.jmx",
		});

		// Generate properties file
		files.push({
			name: "user.properties",
			content: this.generateJMeterProperties(options),
			path: "benchmarks/jmeter/user.properties",
		});

		return files;
	}

	private generateJMeterTestPlan(options: PerformanceBenchmarkingOptions): string {
		// This is a simplified JMX structure - in reality, it would be much more complex
		return `<?xml version="1.0" encoding="UTF-8"?>
<jmeterTestPlan version="1.2" properties="5.0" jmeter="5.5">
  <hashTree>
    <TestPlan guiclass="TestPlanGui" testclass="TestPlan" testname="${
			options.projectName
		} Performance Test Plan" enabled="true">
      <stringProp name="TestPlan.comments">Generated by Xaheen CLI</stringProp>
      <boolProp name="TestPlan.functional_mode">false</boolProp>
      <boolProp name="TestPlan.tearDown_on_shutdown">true</boolProp>
      <boolProp name="TestPlan.serialize_threadgroups">false</boolProp>
      <elementProp name="TestPlan.user_defined_variables" elementType="Arguments" guiclass="ArgumentsPanel" testclass="Arguments" testname="User Defined Variables" enabled="true">
        <collectionProp name="Arguments.arguments">
          <elementProp name="BASE_URL" elementType="Argument">
            <stringProp name="Argument.name">BASE_URL</stringProp>
            <stringProp name="Argument.value">${
							options.environment?.baseUrl || "http://localhost:3000"
						}</stringProp>
          </elementProp>
        </collectionProp>
      </elementProp>
    </TestPlan>
    <hashTree>
${options.scenarios
	.map(
		(scenario) => `      <ThreadGroup guiclass="ThreadGroupGui" testclass="ThreadGroup" testname="${
			scenario.name
		} Thread Group" enabled="true">
        <stringProp name="ThreadGroup.on_sample_error">continue</stringProp>
        <elementProp name="ThreadGroup.main_controller" elementType="LoopController" guiclass="LoopControlPanel" testclass="LoopController" testname="Loop Controller" enabled="true">
          <boolProp name="LoopController.continue_forever">false</boolProp>
          <intProp name="LoopController.loops">-1</intProp>
        </elementProp>
        <stringProp name="ThreadGroup.num_threads">${scenario.load.vus}</stringProp>
        <stringProp name="ThreadGroup.ramp_time">${this.parseDurationToSeconds(
					scenario.load.rampUp || "10s"
				)}</stringProp>
        <stringProp name="ThreadGroup.duration">${this.parseDurationToSeconds(
					scenario.load.duration
				)}</stringProp>
        <stringProp name="ThreadGroup.delay">0</stringProp>
      </ThreadGroup>
      <hashTree>
        <HTTPSamplerProxy guiclass="HttpTestSampleGui" testclass="HTTPSamplerProxy" testname="${
					scenario.name
				} Request" enabled="true">
          <elementProp name="HTTPsampler.Arguments" elementType="Arguments" guiclass="HTTPArgumentsPanel" testclass="Arguments" testname="User Defined Variables" enabled="true">
            ${
							scenario.body
								? `<collectionProp name="Arguments.arguments">
              <elementProp name="" elementType="HTTPArgument">
                <boolProp name="HTTPArgument.always_encode">false</boolProp>
                <stringProp name="Argument.value">${JSON.stringify(scenario.body)}</stringProp>
                <stringProp name="Argument.metadata">=</stringProp>
              </elementProp>
            </collectionProp>`
								: ""
						}
          </elementProp>
          <stringProp name="HTTPSampler.domain">\${BASE_URL}</stringProp>
          <stringProp name="HTTPSampler.port"></stringProp>
          <stringProp name="HTTPSampler.protocol"></stringProp>
          <stringProp name="HTTPSampler.contentEncoding"></stringProp>
          <stringProp name="HTTPSampler.path">${scenario.endpoint}</stringProp>
          <stringProp name="HTTPSampler.method">${scenario.method}</stringProp>
          <boolProp name="HTTPSampler.follow_redirects">true</boolProp>
          <boolProp name="HTTPSampler.auto_redirects">false</boolProp>
          <boolProp name="HTTPSampler.use_keepalive">true</boolProp>
          <boolProp name="HTTPSampler.DO_MULTIPART_POST">false</boolProp>
        </HTTPSamplerProxy>
        <hashTree>
          <ResponseAssertion guiclass="AssertionGui" testclass="ResponseAssertion" testname="Response Assertion" enabled="true">
            <collectionProp name="Asserion.test_strings">
              <stringProp name="49586">200</stringProp>
            </collectionProp>
            <stringProp name="Assertion.custom_message"></stringProp>
            <stringProp name="Assertion.test_field">Assertion.response_code</stringProp>
            <boolProp name="Assertion.assume_success">false</boolProp>
            <intProp name="Assertion.test_type">2</intProp>
          </ResponseAssertion>
        </hashTree>
      </hashTree>`
	)
	.join("\n")}
      <ResultCollector guiclass="ViewResultsFullVisualizer" testclass="ResultCollector" testname="View Results Tree" enabled="true">
        <boolProp name="ResultCollector.error_logging">false</boolProp>
        <objProp>
          <name>saveConfig</name>
          <value class="SampleSaveConfiguration">
            <time>true</time>
            <latency>true</latency>
            <timestamp>true</timestamp>
            <success>true</success>
            <label>true</label>
            <code>true</code>
            <message>true</message>
            <threadName>true</threadName>
            <dataType>true</dataType>
            <encoding>false</encoding>
            <assertions>true</assertions>
            <subresults>true</subresults>
            <responseData>false</responseData>
            <samplerData>false</samplerData>
            <xml>false</xml>
            <fieldNames>true</fieldNames>
            <responseHeaders>false</responseHeaders>
            <requestHeaders>false</requestHeaders>
            <responseDataOnError>false</responseDataOnError>
            <saveAssertionResultsFailureMessage>true</saveAssertionResultsFailureMessage>
            <assertionsResultsToSave>0</assertionsResultsToSave>
            <bytes>true</bytes>
            <sentBytes>true</sentBytes>
            <url>true</url>
            <threadCounts>true</threadCounts>
            <idleTime>true</idleTime>
            <connectTime>true</connectTime>
          </value>
        </objProp>
        <stringProp name="filename">${options.reporting?.output}/results.jtl</stringProp>
      </ResultCollector>
    </hashTree>
  </hashTree>
</jmeterTestPlan>`;
	}

	private generateJMeterProperties(options: PerformanceBenchmarkingOptions): string {
		return `# JMeter User Properties
# Generated by Xaheen CLI

# Test Configuration
project.name=${options.projectName}
base.url=${options.environment?.baseUrl || "http://localhost:3000"}

# Thread Groups
${options.scenarios
	.map(
		(scenario) => `${scenario.name}.threads=${scenario.load.vus}
${scenario.name}.rampup=${this.parseDurationToSeconds(scenario.load.rampUp || "10s")}
${scenario.name}.duration=${this.parseDurationToSeconds(scenario.load.duration)}
${scenario.name}.delay=0`
	)
	.join("\n")}

# HTTP Request Defaults
httpclient.timeout=30000
httpclient4.retrycount=1
httpclient4.idletimeout=30000
httpclient4.validate_after_inactivity=2000
httpclient4.time_to_live=60000

# Results Configuration
jmeter.save.saveservice.output_format=csv
jmeter.save.saveservice.assertion_results_failure_message=true
jmeter.save.saveservice.data_type=true
jmeter.save.saveservice.label=true
jmeter.save.saveservice.response_code=true
jmeter.save.saveservice.response_data.on_error=false
jmeter.save.saveservice.response_message=true
jmeter.save.saveservice.successful=true
jmeter.save.saveservice.thread_name=true
jmeter.save.saveservice.time=true
jmeter.save.saveservice.connect_time=true
jmeter.save.saveservice.assertions=true
jmeter.save.saveservice.latency=true
jmeter.save.saveservice.bytes=true
jmeter.save.saveservice.sent_bytes=true
jmeter.save.saveservice.url=true

# Reporting
jmeter.reportgenerator.overall_granularity=60000
jmeter.reportgenerator.apdex_satisfied_threshold=500
jmeter.reportgenerator.apdex_tolerated_threshold=1500
${
	options.reporting?.formats.includes("html")
		? `jmeter.reportgenerator.report_title=${options.projectName} Performance Test Report`
		: ""
}`;
	}

	private async generateGatlingFiles(
		options: PerformanceBenchmarkingOptions
	): Promise<BenchmarkFile[]> {
		const files: BenchmarkFile[] = [];

		// Generate Gatling simulation
		for (const scenario of options.scenarios) {
			files.push({
				name: `${scenario.name}Simulation.scala`,
				content: this.generateGatlingSimulation(scenario, options),
				path: `benchmarks/gatling/simulations/${scenario.name}Simulation.scala`,
			});
		}

		// Generate configuration
		files.push({
			name: "gatling.conf",
			content: this.generateGatlingConfig(options),
			path: "benchmarks/gatling/gatling.conf",
		});

		return files;
	}

	private generateGatlingSimulation(
		scenario: PerformanceBenchmarkingOptions["scenarios"][0],
		options: PerformanceBenchmarkingOptions
	): string {
		return `package performance

import io.gatling.core.Predef._
import io.gatling.http.Predef._
import scala.concurrent.duration._

class ${scenario.name.replace(/-/g, "")}Simulation extends Simulation {

  val httpProtocol = http
    .baseUrl("${options.environment?.baseUrl || "http://localhost:3000"}")
    .acceptHeader("application/json")
    .acceptEncodingHeader("gzip, deflate")
    .userAgentHeader("Gatling/${options.projectName}")
    ${
			scenario.headers
				? Object.entries(scenario.headers)
						.map(([key, value]) => `.header("${key}", "${value}")`)
						.join("\n    ")
				: ""
		}

  val scn = scenario("${scenario.name}")
    .exec(
      http("${scenario.name} Request")
        .${scenario.method.toLowerCase()}("${scenario.endpoint}")
        ${scenario.body ? `.body(StringBody("""${JSON.stringify(scenario.body)}""")).asJson` : ""}
        ${
					scenario.auth
						? `.header("Authorization", session => s"Bearer \${session("token").as[String]}")`
						: ""
				}
        .check(status.is(200))
        ${
					scenario.checks
						? scenario.checks
								.map((check) => `.check(${this.convertToGatlingCheck(check)})`)
								.join("\n        ")
						: ""
				}
    )
    .pause(1, 3)

  setUp(
    scn.inject(
      ${
				scenario.load.stages
					? scenario.load.stages
							.map(
								(stage) =>
									`rampUsers(${stage.target}) during (${this.parseDurationToSeconds(
										stage.duration
									)} seconds)`
							)
							.join(",\n      ")
					: `rampUsers(${scenario.load.vus}) during (${this.parseDurationToSeconds(
							scenario.load.rampUp || "10s"
					  )} seconds),
      constantUsersPerSec(${scenario.load.vus}) during (${this.parseDurationToSeconds(
							scenario.load.duration
					  )} seconds)`
			}
    )
  ).protocols(httpProtocol)
    .assertions(
      global.responseTime.max.lt(2000),
      global.successfulRequests.percent.gt(95),
      ${
				scenario.thresholds?.http_req_duration
					? `global.responseTime.percentile3.lt(${this.extractThresholdValue(
							scenario.thresholds.http_req_duration[0]
					  )}),`
					: ""
			}
      global.failedRequests.percent.lt(5)
    )
}`;
	}

	private generateGatlingConfig(options: PerformanceBenchmarkingOptions): string {
		return `gatling {
  core {
    outputDirectoryBaseName = "${options.projectName}"
    runDescription = "${options.projectName} Performance Tests"
    encoding = "utf-8"
    simulationClass = ""
    elFileBodiesCacheMaxCapacity = 200
    rawFileBodiesCacheMaxCapacity = 200
    rawFileBodiesInMemoryMaxSize = 1000
    pebbleFileBodiesCacheMaxCapacity = 200
    feederAdaptiveLoadModeThreshold = 100
    shutdownTimeout = 10000
    
    extract {
      regex {
        cacheMaxCapacity = 200
      }
      xpath {
        cacheMaxCapacity = 200
      }
      jsonPath {
        cacheMaxCapacity = 200
        preferJackson = false
      }
      css {
        cacheMaxCapacity = 200
      }
    }
    
    directory {
      simulations = benchmarks/gatling/simulations
      resources = benchmarks/gatling/resources
      reportsOnly = ""
      binaries = ""
      results = ${options.reporting?.output}/gatling
    }
  }
  
  socket {
    connectTimeout = 10000
    tcpNoDelay = true
    soKeepAlive = false
    soReuseAddress = false
  }
  
  netty {
    useNativeTransport = true
    allocator = "pooled"
    maxThreadLocalCharBufferSize = 200000
  }
  
  ssl {
    useOpenSsl = true
    useOpenSslFinalizers = false
    handshakeTimeout = 10000
    useInsecureTrustManager = false
    enabledProtocols = []
    enabledCipherSuites = []
    sessionCacheSize = 0
    sessionTimeout = 0
    enableSni = true
    keyManagerFactory {
      algorithm = ""
    }
    trustManagerFactory {
      algorithm = ""
    }
  }
  
  charting {
    noReports = false
    maxPlotPerSeries = 1000
    useGroupDurationMetric = false
    indicators {
      lowerBound = 800
      higherBound = 1200
      percentile1 = 50
      percentile2 = 75
      percentile3 = 95
      percentile4 = 99
    }
  }
  
  http {
    fetchedCssCacheMaxCapacity = 200
    fetchedHtmlCacheMaxCapacity = 200
    perUserCacheMaxCapacity = 200
    warmUpUrl = ""
    enableGA = false
    pooledConnectionIdleTimeout = 60000
    requestTimeout = 60000
    enableHostnameVerification = false
    dns {
      queryTimeout = 5000
      maxQueriesPerResolve = 6
    }
  }
  
  data {
    writers = [console, file]
    console {
      light = false
      writePeriod = 5
    }
    file {
      bufferSize = 8192
    }
    leak {
      noActivityTimeout = 30
    }
    graphite {
      light = false
      host = "localhost"
      port = 2003
      protocol = "tcp"
      rootPathPrefix = "gatling"
      bufferSize = 8192
      writePeriod = 1
    }
  }
}`;
	}

	private async generateArtilleryFiles(
		options: PerformanceBenchmarkingOptions
	): Promise<BenchmarkFile[]> {
		const files: BenchmarkFile[] = [];

		// Generate Artillery configuration
		files.push({
			name: "artillery.yml",
			content: this.generateArtilleryConfig(options),
			path: "benchmarks/artillery/artillery.yml",
		});

		// Generate processor file
		files.push({
			name: "processor.js",
			content: this.generateArtilleryProcessor(options),
			path: "benchmarks/artillery/processor.js",
		});

		return files;
	}

	private generateArtilleryConfig(options: PerformanceBenchmarkingOptions): string {
		const phases = options.scenarios[0]?.load.stages
			? options.scenarios[0].load.stages.map((stage) => ({
					duration: this.parseDurationToSeconds(stage.duration),
					arrivalRate: Math.ceil(stage.target / 60),
					rampTo: Math.ceil(stage.target / 30),
			  }))
			: [
					{
						duration: this.parseDurationToSeconds(options.scenarios[0]?.load.duration || "30s"),
						arrivalRate: Math.ceil(options.scenarios[0]?.load.vus / 60 || 1),
					},
			  ];

		return `config:
  target: "${options.environment?.baseUrl || "http://localhost:3000"}"
  phases:
${phases
	.map(
		(phase) => `    - duration: ${phase.duration}
      arrivalRate: ${phase.arrivalRate}${phase.rampTo ? `\n      rampTo: ${phase.rampTo}` : ""}`
	)
	.join("\n")}
  
  processor: "./processor.js"
  
  payload:
    path: "../../data/test-data.csv"
    fields:
      - "userId"
      - "username"
      - "email"
  
  variables:
    ${
			options.environment?.variables
				? Object.entries(options.environment.variables)
						.map(([key, value]) => `${key}: "${value}"`)
						.join("\n    ")
				: 'projectName: "' + options.projectName + '"'
		}
  
  plugins:
    publish-metrics:
      - type: datadog
        apiKey: "${options.reporting?.datadog?.apiKey || "YOUR_API_KEY"}"
        appKey: "${options.reporting?.datadog?.site || "YOUR_APP_KEY"}"
        prefix: "artillery."
        tags:
          - "project:${options.projectName}"
  
  ensure:
    p95: ${
			options.scenarios[0]?.thresholds?.http_req_duration
				? this.extractThresholdValue(options.scenarios[0].thresholds.http_req_duration[0])
				: 500
		}
    p99: ${
			options.scenarios[0]?.thresholds?.http_req_duration?.[1]
				? this.extractThresholdValue(options.scenarios[0].thresholds.http_req_duration[1])
				: 1000
		}
    maxErrorRate: ${
			options.scenarios[0]?.thresholds?.http_req_failed
				? parseFloat(
						options.scenarios[0].thresholds.http_req_failed[0]
							.match(/rate<([\d.]+)/)?.[1] || "0.1"
				  ) * 100
				: 10
		}

scenarios:
${options.scenarios
	.map(
		(scenario) => `  - name: "${scenario.name}"
    flow:
      - ${scenario.method.toLowerCase()}:
          url: "${scenario.endpoint}"${
			scenario.headers
				? `
          headers:${Object.entries(scenario.headers)
						.map(([key, value]) => `
            ${key}: "${value}"`)
						.join("")}`
				: ""
		}${
			scenario.body
				? `
          json: ${JSON.stringify(scenario.body, null, 12)
						.split("\n")
						.map((line, i) => (i === 0 ? line : `            ${line}`))
						.join("\n")}`
				: ""
		}${
			scenario.auth
				? `
          beforeRequest: "setAuth"`
				: ""
		}
          capture:
            - json: "$.id"
              as: "responseId"
          expect:
            - statusCode: 200${
							scenario.checks
								? scenario.checks
										.map((check) => `
            - ${this.convertToArtilleryCheck(check)}`)
										.join("")
								: ""
						}`
	)
	.join("\n")}`;
	}

	private generateArtilleryProcessor(options: PerformanceBenchmarkingOptions): string {
		return `/**
 * Artillery Processor Functions
 * Generated by Xaheen CLI
 */

module.exports = {
  setAuth,
  generateData,
  validateResponse,
  logMetrics,
};

/**
 * Set authentication headers
 */
function setAuth(requestParams, context, ee, next) {
  const authType = "${options.scenarios[0]?.auth?.type || "bearer"}";
  const credentials = context.vars.authToken || "${options.scenarios[0]?.auth?.credentials || ""}";
  
  switch (authType) {
    case "bearer":
      requestParams.headers = requestParams.headers || {};
      requestParams.headers["Authorization"] = \`Bearer \${credentials}\`;
      break;
    case "basic":
      const encoded = Buffer.from(credentials).toString("base64");
      requestParams.headers = requestParams.headers || {};
      requestParams.headers["Authorization"] = \`Basic \${encoded}\`;
      break;
    case "api-key":
      requestParams.headers = requestParams.headers || {};
      requestParams.headers["X-API-Key"] = credentials;
      break;
  }
  
  return next();
}

/**
 * Generate random test data
 */
function generateData(context, events, done) {
  context.vars.randomUser = {
    username: \`user_\${Math.random().toString(36).substring(7)}\`,
    email: \`test_\${Math.random().toString(36).substring(7)}@example.com\`,
    age: Math.floor(Math.random() * 50) + 18,
  };
  
  context.vars.randomProduct = {
    name: \`Product \${Math.random().toString(36).substring(7).toUpperCase()}\`,
    price: (Math.random() * 1000).toFixed(2),
    category: ["Electronics", "Clothing", "Books", "Food", "Sports"][Math.floor(Math.random() * 5)],
    stock: Math.floor(Math.random() * 100),
  };
  
  return done();
}

/**
 * Validate response data
 */
function validateResponse(requestParams, response, context, ee, next) {
  if (response.statusCode !== 200) {
    ee.emit("error", \`Status code \${response.statusCode}\`);
  }
  
  try {
    const body = JSON.parse(response.body);
    
    // Custom validation logic
    if (!body.id || !body.status) {
      ee.emit("error", "Missing required fields in response");
    }
    
    // Store response data for later use
    context.vars.lastResponseId = body.id;
    context.vars.lastResponseStatus = body.status;
  } catch (error) {
    ee.emit("error", \`Failed to parse response: \${error.message}\`);
  }
  
  return next();
}

/**
 * Log custom metrics
 */
function logMetrics(requestParams, response, context, ee, next) {
  const latency = response.timings.phases.firstByte;
  const totalTime = response.timings.phases.total;
  
  // Emit custom metrics
  ee.emit("customStat", {
    stat: "api.latency",
    value: latency,
  });
  
  ee.emit("customStat", {
    stat: "api.total_time",
    value: totalTime,
  });
  
  // Log slow requests
  if (totalTime > 1000) {
    console.log(\`Slow request detected: \${requestParams.url} took \${totalTime}ms\`);
  }
  
  return next();
}`;
	}

	private async generateWrkFiles(
		options: PerformanceBenchmarkingOptions
	): Promise<BenchmarkFile[]> {
		const files: BenchmarkFile[] = [];

		// Generate wrk Lua scripts
		for (const scenario of options.scenarios) {
			files.push({
				name: `${scenario.name}.lua`,
				content: this.generateWrkScript(scenario, options),
				path: `benchmarks/wrk/${scenario.name}.lua`,
			});
		}

		// Generate run script
		files.push({
			name: "run-benchmarks.sh",
			content: this.generateWrkRunScript(options),
			path: "benchmarks/wrk/run-benchmarks.sh",
		});

		return files;
	}

	private generateWrkScript(
		scenario: PerformanceBenchmarkingOptions["scenarios"][0],
		options: PerformanceBenchmarkingOptions
	): string {
		return `-- wrk script for ${scenario.name}
-- Generated by Xaheen CLI

local counter = 0
local threads = {}

function setup(thread)
  thread:set("id", counter)
  table.insert(threads, thread)
  counter = counter + 1
end

function init(args)
  requests = 0
  responses = 0
  
  -- Initialize random seed
  math.randomseed(os.time())
end

function request()
  requests = requests + 1
  
  local headers = {}
  ${
		scenario.headers
			? Object.entries(scenario.headers)
					.map(([key, value]) => `headers["${key}"] = "${value}"`)
					.join("\n  ")
			: ""
	}
  ${
		scenario.auth
			? `headers["Authorization"] = "${
					scenario.auth.type === "bearer"
						? `Bearer ${scenario.auth.credentials}`
						: scenario.auth.credentials
			  }"`
			: ""
	}
  
  ${
		scenario.body
			? `local body = '${JSON.stringify(scenario.body)}'
  return wrk.format("${scenario.method}", "${scenario.endpoint}", headers, body)`
			: `return wrk.format("${scenario.method}", "${scenario.endpoint}", headers)`
	}
end

function response(status, headers, body)
  responses = responses + 1
  
  if status ~= 200 then
    print("Error: Status " .. status)
  end
  
  -- Parse and validate response if needed
  ${
		scenario.checks
			? `local success, data = pcall(function() return json.decode(body) end)
  if success then
    -- Perform checks
    ${scenario.checks
			.map(
				(check) => `if not (${this.convertToLuaCheck(check)}) then
      print("Check failed: ${check.name}")
    end`
			)
			.join("\n    ")}
  end`
			: ""
	}
end

function done(summary, latency, requests)
  print("========================================")
  print("Test: ${scenario.name}")
  print("========================================")
  print(string.format("Requests:     %d", summary.requests))
  print(string.format("Duration:     %.2fs", summary.duration / 1000000))
  print(string.format("Req/Sec:      %.2f", summary.requests / (summary.duration / 1000000)))
  print(string.format("Latency Avg:  %.2fms", latency.mean / 1000))
  print(string.format("Latency Stdev:%.2fms", latency.stdev / 1000))
  print(string.format("Latency Max:  %.2fms", latency.max / 1000))
  print(string.format("Latency P50:  %.2fms", latency:percentile(50) / 1000))
  print(string.format("Latency P90:  %.2fms", latency:percentile(90) / 1000))
  print(string.format("Latency P95:  %.2fms", latency:percentile(95) / 1000))
  print(string.format("Latency P99:  %.2fms", latency:percentile(99) / 1000))
  
  local errors = summary.errors
  if errors.status > 0 then
    print(string.format("Status Errors: %d", errors.status))
  end
  if errors.read > 0 then
    print(string.format("Read Errors:   %d", errors.read))
  end
  if errors.write > 0 then
    print(string.format("Write Errors:  %d", errors.write))
  end
  if errors.timeout > 0 then
    print(string.format("Timeouts:      %d", errors.timeout))
  end
  
  print("========================================")
  
  -- Write results to file
  local file = io.open("${options.reporting?.output}/wrk-${scenario.name}.json", "w")
  if file then
    local results = {
      test = "${scenario.name}",
      requests = summary.requests,
      duration_sec = summary.duration / 1000000,
      req_per_sec = summary.requests / (summary.duration / 1000000),
      latency = {
        mean_ms = latency.mean / 1000,
        stdev_ms = latency.stdev / 1000,
        max_ms = latency.max / 1000,
        p50_ms = latency:percentile(50) / 1000,
        p90_ms = latency:percentile(90) / 1000,
        p95_ms = latency:percentile(95) / 1000,
        p99_ms = latency:percentile(99) / 1000
      },
      errors = errors
    }
    file:write(json.encode(results))
    file:close()
  end
end

-- JSON library (simplified)
json = {
  decode = function(str)
    -- Simple JSON decode implementation
    return loadstring("return " .. str)()
  end,
  encode = function(obj)
    -- Simple JSON encode implementation
    local function serialize(o)
      if type(o) == "number" then
        return tostring(o)
      elseif type(o) == "string" then
        return string.format("%q", o)
      elseif type(o) == "table" then
        local parts = {}
        for k, v in pairs(o) do
          local key = type(k) == "number" and "" or k .. ":"
          table.insert(parts, key .. serialize(v))
        end
        return "{" .. table.concat(parts, ",") .. "}"
      end
    end
    return serialize(obj)
  end
}`;
	}

	private generateWrkRunScript(options: PerformanceBenchmarkingOptions): string {
		return `#!/bin/bash

# wrk Benchmark Runner
# Generated by Xaheen CLI

set -e

BASE_URL="${options.environment?.baseUrl || "http://localhost:3000"}"
OUTPUT_DIR="${options.reporting?.output}"

# Create output directory
mkdir -p "$OUTPUT_DIR"

echo "Starting performance benchmarks..."
echo "Target: $BASE_URL"
echo "=================================="

# Run each scenario
${options.scenarios
	.map(
		(scenario) => `
echo "Running scenario: ${scenario.name}"
wrk -t${Math.min(scenario.load.vus, 10)} \\
    -c${scenario.load.vus} \\
    -d${scenario.load.duration} \\
    -s ${scenario.name}.lua \\
    --latency \\
    "$BASE_URL" > "$OUTPUT_DIR/wrk-${scenario.name}.txt"
echo "Completed: ${scenario.name}"
echo "=================================="
`
	)
	.join("")}

echo "All benchmarks completed!"
echo "Results saved to: $OUTPUT_DIR"

# Generate summary report
echo "Generating summary report..."
cat "$OUTPUT_DIR"/wrk-*.txt > "$OUTPUT_DIR/summary.txt"

echo "Summary report generated: $OUTPUT_DIR/summary.txt"`;
	}

	private async generateCommonFiles(
		options: PerformanceBenchmarkingOptions
	): Promise<BenchmarkFile[]> {
		const files: BenchmarkFile[] = [];

		// Generate README
		files.push({
			name: "README.md",
			content: this.generateReadme(options),
			path: "benchmarks/README.md",
		});

		// Generate Docker Compose for running tests
		files.push({
			name: "docker-compose.yml",
			content: this.generateDockerCompose(options),
			path: "benchmarks/docker-compose.yml",
		});

		// Generate Makefile
		files.push({
			name: "Makefile",
			content: this.generateMakefile(options),
			path: "benchmarks/Makefile",
		});

		return files;
	}

	private generateReadme(options: PerformanceBenchmarkingOptions): string {
		return `# ${options.projectName} Performance Benchmarks

Generated by Xaheen CLI

## Overview

This directory contains performance benchmarking configurations for ${options.projectName}.

Framework: **${options.framework.toUpperCase()}**

## Scenarios

${options.scenarios
	.map(
		(scenario) => `### ${scenario.name}
${scenario.description || "No description provided"}
- **Endpoint**: ${scenario.method} ${scenario.endpoint}
- **Virtual Users**: ${scenario.load.vus}
- **Duration**: ${scenario.load.duration}
- **Ramp Up**: ${scenario.load.rampUp || "10s"}
- **Ramp Down**: ${scenario.load.rampDown || "10s"}`
	)
	.join("\n\n")}

## Running the Tests

### Using Docker

\`\`\`bash
docker-compose up
\`\`\`

### Using Make

\`\`\`bash
# Run all tests
make test

# Run specific scenario
make test-${options.scenarios[0]?.name || "scenario"}

# Generate reports
make report

# Clean up
make clean
\`\`\`

### Direct Execution

#### ${options.framework.toUpperCase()}

\`\`\`bash
${this.getRunCommand(options)}
\`\`\`

## Configuration

Edit the following files to modify test parameters:
- \`${options.framework}/\` - Test scenarios and configurations
- \`.env\` - Environment variables
- \`data/\` - Test data files

## Reports

Reports are generated in the \`${options.reporting?.output}\` directory.

### Available Formats
${options.reporting?.formats.map((format) => `- ${format.toUpperCase()}`).join("\n")}

${
	options.reporting?.grafana?.enabled
		? `### Grafana Dashboard
Access the Grafana dashboard at: ${options.reporting.grafana.url}`
		: ""
}

${
	options.reporting?.datadog?.enabled
		? `### Datadog Integration
Metrics are automatically sent to Datadog.`
		: ""
}

## Thresholds

The following performance thresholds are configured:

${options.scenarios
	.map(
		(scenario) => `### ${scenario.name}
${
	scenario.thresholds
		? Object.entries(scenario.thresholds)
				.map(([key, values]) => `- **${key}**: ${values.join(", ")}`)
				.join("\n")
		: "No specific thresholds configured"
}`
	)
	.join("\n\n")}

## Troubleshooting

### Common Issues

1. **Connection refused**: Ensure the target application is running
2. **Timeout errors**: Increase timeout values in configuration
3. **Out of memory**: Reduce the number of virtual users or increase Docker memory

## Contributing

To add new scenarios:
1. Create a new scenario file in \`${options.framework}/scenarios/\`
2. Add the scenario to the configuration
3. Update this README

## License

Copyright (c) ${new Date().getFullYear()} ${options.projectName}`;
	}

	private generateDockerCompose(options: PerformanceBenchmarkingOptions): string {
		const services: Record<string, any> = {};

		// Add main test service based on framework
		switch (options.framework) {
			case "k6":
				services.k6 = {
					image: "grafana/k6:latest",
					volumes: ["./k6:/scripts", "./data:/data", "./reports:/reports"],
					environment: {
						BASE_URL: options.environment?.baseUrl || "http://host.docker.internal:3000",
					},
					command: "run /scripts/scenarios/${options.scenarios[0]?.name || "main"}.js",
					network_mode: "host",
				};
				break;
			case "locust":
				services.locust = {
					image: "locustio/locust",
					ports: ["8089:8089"],
					volumes: ["./locust:/mnt/locust", "./data:/data", "./reports:/reports"],
					environment: {
						LOCUST_HOST:
							options.environment?.baseUrl || "http://host.docker.internal:3000",
					},
					command: "-f /mnt/locust/locustfile.py --web-host 0.0.0.0",
				};
				break;
			case "jmeter":
				services.jmeter = {
					image: "justb4/jmeter:latest",
					volumes: ["./jmeter:/tests", "./data:/data", "./reports:/reports"],
					environment: {
						JVM_ARGS: "-Xms1g -Xmx2g",
					},
					command:
						"-n -t /tests/test-plan.jmx -l /reports/results.jtl -e -o /reports/html",
				};
				break;
			case "gatling":
				services.gatling = {
					image: "denvazh/gatling",
					volumes: ["./gatling:/opt/gatling", "./data:/data", "./reports:/reports"],
					environment: {
						JAVA_OPTS: "-Xms1g -Xmx2g",
					},
					command: "-s ${options.scenarios[0]?.name || "Main"}Simulation",
				};
				break;
		}

		// Add monitoring services if enabled
		if (options.database?.enabled) {
			if (options.database.type === "influxdb") {
				services.influxdb = {
					image: "influxdb:2.7",
					ports: ["8086:8086"],
					environment: {
						DOCKER_INFLUXDB_INIT_MODE: "setup",
						DOCKER_INFLUXDB_INIT_USERNAME: "admin",
						DOCKER_INFLUXDB_INIT_PASSWORD: "admin123",
						DOCKER_INFLUXDB_INIT_ORG: options.projectName,
						DOCKER_INFLUXDB_INIT_BUCKET: "performance",
					},
					volumes: ["influxdb-data:/var/lib/influxdb2"],
				};
			} else if (options.database.type === "prometheus") {
				services.prometheus = {
					image: "prom/prometheus",
					ports: ["9090:9090"],
					volumes: ["./prometheus.yml:/etc/prometheus/prometheus.yml"],
					command: "--config.file=/etc/prometheus/prometheus.yml",
				};
			}
		}

		if (options.reporting?.grafana?.enabled) {
			services.grafana = {
				image: "grafana/grafana",
				ports: ["3000:3000"],
				environment: {
					GF_SECURITY_ADMIN_PASSWORD: "admin",
					GF_INSTALL_PLUGINS: "redis-datasource",
				},
				volumes: [
					"grafana-data:/var/lib/grafana",
					"./grafana/dashboards:/etc/grafana/provisioning/dashboards",
					"./grafana/datasources:/etc/grafana/provisioning/datasources",
				],
				depends_on: options.database?.enabled ? [options.database.type] : [],
			};
		}

		return `version: '3.8'

services:
${Object.entries(services)
	.map(
		([name, config]) => `  ${name}:
${Object.entries(config)
	.map(([key, value]) => {
		if (key === "environment") {
			return `    ${key}:
${Object.entries(value as Record<string, string>)
	.map(([k, v]) => `      ${k}: "${v}"`)
	.join("\n")}`;
		} else if (Array.isArray(value)) {
			return `    ${key}:
${value.map((v) => `      - ${v}`).join("\n")}`;
		} else {
			return `    ${key}: ${value}`;
		}
	})
	.join("\n")}`
	)
	.join("\n\n")}

${
	services.influxdb || services.grafana
		? `volumes:
${services.influxdb ? "  influxdb-data:\n" : ""}${
				services.grafana ? "  grafana-data:\n" : ""
		  }`
		: ""
}

networks:
  default:
    driver: bridge`;
	}

	private generateMakefile(options: PerformanceBenchmarkingOptions): string {
		const framework = options.framework;
		const scenarios = options.scenarios.map((s) => s.name);

		return `.PHONY: all test report clean install help

# Variables
FRAMEWORK := ${framework}
OUTPUT_DIR := ${options.reporting?.output}
BASE_URL := ${options.environment?.baseUrl || "http://localhost:3000"}

# Default target
all: install test report

# Install dependencies
install:
	@echo "Installing dependencies for $(FRAMEWORK)..."
${this.getInstallCommand(framework)}

# Run all tests
test:
	@echo "Running all performance tests..."
${scenarios.map((scenario) => `\t@$(MAKE) test-${scenario}`).join("\n")}

# Individual test targets
${scenarios
	.map(
		(scenario) => `test-${scenario}:
	@echo "Running ${scenario} scenario..."
${this.getTestCommand(framework, scenario, options)}`
	)
	.join("\n\n")}

# Generate reports
report:
	@echo "Generating performance reports..."
${this.getReportCommand(framework, options)}

# Clean up
clean:
	@echo "Cleaning up..."
	@rm -rf $(OUTPUT_DIR)/*
	@rm -rf *.log
	@rm -rf *.jtl
	@echo "Clean complete!"

# Docker commands
docker-build:
	@docker-compose build

docker-up:
	@docker-compose up -d

docker-down:
	@docker-compose down

docker-test: docker-up
	@sleep 5
	@$(MAKE) test
	@$(MAKE) docker-down

# Help
help:
	@echo "Available targets:"
	@echo "  install       - Install dependencies"
	@echo "  test         - Run all tests"
${scenarios.map((s) => `\t@echo "  test-${s}  - Run ${s} scenario"`).join("\n")}
	@echo "  report       - Generate reports"
	@echo "  clean        - Clean up artifacts"
	@echo "  docker-build - Build Docker images"
	@echo "  docker-test  - Run tests in Docker"
	@echo "  help         - Show this help message"`;
	}

	private async generateDockerConfig(options: PerformanceBenchmarkingOptions): Promise<void> {
		const dockerPath = path.join(options.projectPath, "benchmarks", "docker");
		await fs.mkdir(dockerPath, { recursive: true });

		// Generate Dockerfile for test runner
		const dockerfile = `FROM alpine:latest

# Install required tools based on framework
RUN apk add --no-cache \\
    curl \\
    bash \\
    git \\
    ${options.framework === "k6" ? "ca-certificates" : ""} \\
    ${options.framework === "locust" ? "python3 py3-pip" : ""} \\
    ${options.framework === "jmeter" ? "openjdk11-jre" : ""} \\
    ${options.framework === "gatling" ? "openjdk11-jre" : ""} \\
    ${options.framework === "artillery" ? "nodejs npm" : ""} \\
    ${options.framework === "wrk" ? "build-base openssl-dev" : ""}

# Install framework
${this.getDockerInstallCommand(options.framework)}

# Copy test files
WORKDIR /tests
COPY benchmarks/${options.framework}/ .
COPY data/ ./data/

# Set entrypoint
ENTRYPOINT [${this.getDockerEntrypoint(options.framework)}]
CMD [${this.getDockerCmd(options.framework)}]`;

		await fs.writeFile(path.join(dockerPath, "Dockerfile"), dockerfile);
	}

	private async generateCIIntegration(options: PerformanceBenchmarkingOptions): Promise<void> {
		const ciPath = path.join(options.projectPath, ".github", "workflows");
		await fs.mkdir(ciPath, { recursive: true });

		// Generate GitHub Actions workflow
		const workflow = `name: Performance Tests

on:
  push:
    branches: [main]
  pull_request:
    branches: [main]
  schedule:
    - cron: '0 2 * * *'  # Run daily at 2 AM
  workflow_dispatch:

jobs:
  performance-test:
    runs-on: ubuntu-latest
    
    steps:
    - uses: actions/checkout@v3
    
    - name: Setup ${options.framework}
      run: |
${this.getCISetupCommand(options.framework)}
    
    - name: Start application
      run: |
        # Start your application here
        # docker-compose up -d app
        # or npm start &
        sleep 10  # Wait for app to be ready
    
    - name: Run performance tests
      run: |
        cd benchmarks
        make test
    
    - name: Generate reports
      if: always()
      run: |
        cd benchmarks
        make report
    
    - name: Upload results
      if: always()
      uses: actions/upload-artifact@v3
      with:
        name: performance-results
        path: ${options.reporting?.output}
    
    - name: Comment on PR
      if: github.event_name == 'pull_request'
      uses: actions/github-script@v6
      with:
        script: |
          const fs = require('fs');
          const results = fs.readFileSync('${options.reporting?.output}/summary.json', 'utf8');
          const data = JSON.parse(results);
          
          const comment = \`## Performance Test Results
          
          | Metric | Value |
          |--------|-------|
          | Total Requests | \${data.requests} |
          | Success Rate | \${data.successRate}% |
          | Avg Response Time | \${data.avgResponseTime}ms |
          | P95 Response Time | \${data.p95ResponseTime}ms |
          | P99 Response Time | \${data.p99ResponseTime}ms |
          \`;
          
          github.rest.issues.createComment({
            issue_number: context.issue.number,
            owner: context.repo.owner,
            repo: context.repo.repo,
            body: comment
          });
    
    - name: Check thresholds
      run: |
        cd benchmarks
        # Add threshold checking logic here
        # Exit with non-zero if thresholds are exceeded`;

		await fs.writeFile(path.join(ciPath, "performance-tests.yml"), workflow);
	}

	private async generateReportingConfig(
		options: PerformanceBenchmarkingOptions
	): Promise<void> {
		const reportingPath = path.join(options.projectPath, options.reporting?.output || "reports");
		await fs.mkdir(reportingPath, { recursive: true });

		// Generate HTML report template
		const htmlTemplate = `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>${options.projectName} Performance Report</title>
    <script src="https://cdn.jsdelivr.net/npm/chart.js"></script>
    <style>
        body {
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
            margin: 0;
            padding: 20px;
            background: #f5f5f5;
        }
        .container {
            max-width: 1200px;
            margin: 0 auto;
            background: white;
            padding: 30px;
            border-radius: 8px;
            box-shadow: 0 2px 4px rgba(0,0,0,0.1);
        }
        h1 {
            color: #333;
            border-bottom: 2px solid #4CAF50;
            padding-bottom: 10px;
        }
        .metrics {
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
            gap: 20px;
            margin: 30px 0;
        }
        .metric {
            padding: 20px;
            background: #f9f9f9;
            border-radius: 8px;
            border-left: 4px solid #4CAF50;
        }
        .metric-value {
            font-size: 2em;
            font-weight: bold;
            color: #333;
        }
        .metric-label {
            color: #666;
            margin-top: 5px;
        }
        .chart-container {
            margin: 30px 0;
            padding: 20px;
            background: #f9f9f9;
            border-radius: 8px;
        }
        table {
            width: 100%;
            border-collapse: collapse;
            margin: 20px 0;
        }
        th, td {
            padding: 12px;
            text-align: left;
            border-bottom: 1px solid #ddd;
        }
        th {
            background: #4CAF50;
            color: white;
        }
        .status-pass {
            color: #4CAF50;
            font-weight: bold;
        }
        .status-fail {
            color: #f44336;
            font-weight: bold;
        }
    </style>
</head>
<body>
    <div class="container">
        <h1>${options.projectName} Performance Report</h1>
        <p>Generated: <span id="timestamp"></span></p>
        
        <div class="metrics">
            <div class="metric">
                <div class="metric-value" id="total-requests">-</div>
                <div class="metric-label">Total Requests</div>
            </div>
            <div class="metric">
                <div class="metric-value" id="success-rate">-</div>
                <div class="metric-label">Success Rate</div>
            </div>
            <div class="metric">
                <div class="metric-value" id="avg-response">-</div>
                <div class="metric-label">Avg Response Time</div>
            </div>
            <div class="metric">
                <div class="metric-value" id="p95-response">-</div>
                <div class="metric-label">P95 Response Time</div>
            </div>
        </div>
        
        <div class="chart-container">
            <h2>Response Time Distribution</h2>
            <canvas id="response-chart"></canvas>
        </div>
        
        <div class="chart-container">
            <h2>Requests Per Second</h2>
            <canvas id="rps-chart"></canvas>
        </div>
        
        <h2>Scenario Results</h2>
        <table id="scenario-table">
            <thead>
                <tr>
                    <th>Scenario</th>
                    <th>Requests</th>
                    <th>Failures</th>
                    <th>Avg Response</th>
                    <th>P95</th>
                    <th>P99</th>
                    <th>Status</th>
                </tr>
            </thead>
            <tbody></tbody>
        </table>
        
        <h2>Threshold Results</h2>
        <table id="threshold-table">
            <thead>
                <tr>
                    <th>Metric</th>
                    <th>Threshold</th>
                    <th>Actual</th>
                    <th>Status</th>
                </tr>
            </thead>
            <tbody></tbody>
        </table>
    </div>
    
    <script>
        // Load and display results
        fetch('results.json')
            .then(response => response.json())
            .then(data => {
                // Update metrics
                document.getElementById('timestamp').textContent = new Date().toLocaleString();
                document.getElementById('total-requests').textContent = data.totalRequests.toLocaleString();
                document.getElementById('success-rate').textContent = data.successRate.toFixed(2) + '%';
                document.getElementById('avg-response').textContent = data.avgResponseTime.toFixed(0) + 'ms';
                document.getElementById('p95-response').textContent = data.p95ResponseTime.toFixed(0) + 'ms';
                
                // Create charts
                createResponseChart(data.responseTimeDistribution);
                createRPSChart(data.requestsPerSecond);
                
                // Populate tables
                populateScenarioTable(data.scenarios);
                populateThresholdTable(data.thresholds);
            })
            .catch(error => {
                console.error('Error loading results:', error);
            });
        
        function createResponseChart(data) {
            const ctx = document.getElementById('response-chart').getContext('2d');
            new Chart(ctx, {
                type: 'line',
                data: {
                    labels: data.labels,
                    datasets: [{
                        label: 'Response Time (ms)',
                        data: data.values,
                        borderColor: '#4CAF50',
                        tension: 0.1
                    }]
                },
                options: {
                    responsive: true,
                    maintainAspectRatio: false
                }
            });
        }
        
        function createRPSChart(data) {
            const ctx = document.getElementById('rps-chart').getContext('2d');
            new Chart(ctx, {
                type: 'line',
                data: {
                    labels: data.labels,
                    datasets: [{
                        label: 'Requests/sec',
                        data: data.values,
                        borderColor: '#2196F3',
                        tension: 0.1
                    }]
                },
                options: {
                    responsive: true,
                    maintainAspectRatio: false
                }
            });
        }
        
        function populateScenarioTable(scenarios) {
            const tbody = document.querySelector('#scenario-table tbody');
            scenarios.forEach(scenario => {
                const row = tbody.insertRow();
                row.innerHTML = \`
                    <td>\${scenario.name}</td>
                    <td>\${scenario.requests}</td>
                    <td>\${scenario.failures}</td>
                    <td>\${scenario.avgResponse}ms</td>
                    <td>\${scenario.p95}ms</td>
                    <td>\${scenario.p99}ms</td>
                    <td class="\${scenario.passed ? 'status-pass' : 'status-fail'}">
                        \${scenario.passed ? 'PASS' : 'FAIL'}
                    </td>
                \`;
            });
        }
        
        function populateThresholdTable(thresholds) {
            const tbody = document.querySelector('#threshold-table tbody');
            thresholds.forEach(threshold => {
                const row = tbody.insertRow();
                row.innerHTML = \`
                    <td>\${threshold.metric}</td>
                    <td>\${threshold.threshold}</td>
                    <td>\${threshold.actual}</td>
                    <td class="\${threshold.passed ? 'status-pass' : 'status-fail'}">
                        \${threshold.passed ? 'PASS' : 'FAIL'}
                    </td>
                \`;
            });
        }
    </script>
</body>
</html>`;

		await fs.writeFile(path.join(reportingPath, "report-template.html"), htmlTemplate);
	}

	private async generateMonitoringIntegration(
		options: PerformanceBenchmarkingOptions
	): Promise<void> {
		if (!options.reporting?.grafana?.enabled && !options.reporting?.datadog?.enabled) {
			return;
		}

		const monitoringPath = path.join(options.projectPath, "monitoring");
		await fs.mkdir(monitoringPath, { recursive: true });

		// Generate Grafana dashboard
		if (options.reporting?.grafana?.enabled) {
			const dashboard = {
				dashboard: {
					title: `${options.projectName} Performance Dashboard`,
					panels: [
						{
							title: "Request Rate",
							type: "graph",
							targets: [
								{
									expr: 'rate(http_requests_total[5m])',
									legendFormat: "{{method}} {{endpoint}}",
								},
							],
						},
						{
							title: "Response Time",
							type: "graph",
							targets: [
								{
									expr: 'histogram_quantile(0.95, rate(http_request_duration_seconds_bucket[5m]))',
									legendFormat: "P95",
								},
								{
									expr: 'histogram_quantile(0.99, rate(http_request_duration_seconds_bucket[5m]))',
									legendFormat: "P99",
								},
							],
						},
						{
							title: "Error Rate",
							type: "graph",
							targets: [
								{
									expr: 'rate(http_requests_failed_total[5m])',
									legendFormat: "{{method}} {{endpoint}}",
								},
							],
						},
						{
							title: "Active Users",
							type: "stat",
							targets: [
								{
									expr: 'sum(vus)',
								},
							],
						},
					],
				},
			};

			await fs.writeFile(
				path.join(monitoringPath, "grafana-dashboard.json"),
				JSON.stringify(dashboard, null, 2)
			);
		}

		// Generate Datadog configuration
		if (options.reporting?.datadog?.enabled) {
			const datadogConfig = `# Datadog Agent Configuration
# Generated by Xaheen CLI

api_key: ${options.reporting.datadog.apiKey}
site: ${options.reporting.datadog.site || "datadoghq.com"}

logs_enabled: true

tags:
  - project:${options.projectName}
  - framework:${options.framework}
  - environment:performance-test

# APM Configuration
apm_config:
  enabled: true
  env: performance-test

# Process Agent
process_config:
  enabled: true

# Custom metrics
dogstatsd_mapper_profiles:
  - name: performance_tests
    prefix: "perf."
    mappings:
      - match: "perf.*.response_time"
        name: "performance.response_time"
        tags:
          endpoint: "$1"
      - match: "perf.*.error_rate"
        name: "performance.error_rate"
        tags:
          endpoint: "$1"`;

			await fs.writeFile(path.join(monitoringPath, "datadog.yaml"), datadogConfig);
		}
	}

	private async writeFiles(files: BenchmarkFile[], projectPath: string): Promise<void> {
		for (const file of files) {
			const filePath = path.join(projectPath, file.path);
			const dir = path.dirname(filePath);

			await fs.mkdir(dir, { recursive: true });
			await fs.writeFile(filePath, file.content);

			// Make shell scripts executable
			if (file.name.endsWith(".sh")) {
				await fs.chmod(filePath, 0o755);
			}

			console.log(chalk.gray(`  Created: ${file.path}`));
		}
	}

	// Helper methods
	private generateAuthHeader(auth: any): string {
		switch (auth.type) {
			case "bearer":
				return `{ Authorization: 'Bearer ${auth.credentials}' }`;
			case "basic":
				return `{ Authorization: 'Basic ${Buffer.from(auth.credentials).toString("base64")}' }`;
			case "api-key":
				return `{ 'X-API-Key': '${auth.credentials}' }`;
			case "oauth2":
				return `{ Authorization: 'Bearer ${auth.credentials}' }`;
			default:
				return "{}";
		}
	}

	private parseDurationToSeconds(duration: string): number {
		const match = duration.match(/^(\d+)([smh])$/);
		if (!match) return 30;

		const value = parseInt(match[1]);
		const unit = match[2];

		switch (unit) {
			case "s":
				return value;
			case "m":
				return value * 60;
			case "h":
				return value * 3600;
			default:
				return 30;
		}
	}

	private extractThresholdValue(threshold: string): number {
		const match = threshold.match(/p\((\d+)\)<(\d+)/);
		if (match) {
			return parseInt(match[2]);
		}
		return 500;
	}

	private convertToGatlingCheck(check: any): string {
		// Convert check to Gatling format
		return `jsonPath("$.${check.name}").exists`;
	}

	private convertToArtilleryCheck(check: any): string {
		// Convert check to Artillery format
		return `hasProperty: "${check.name}"`;
	}

	private convertToLuaCheck(check: any): string {
		// Convert check to Lua format
		return `data.${check.name} ~= nil`;
	}

	private getRunCommand(options: PerformanceBenchmarkingOptions): string {
		switch (options.framework) {
			case "k6":
				return `k6 run k6/scenarios/${options.scenarios[0]?.name || "main"}.js`;
			case "locust":
				return "locust -f locust/locustfile.py --host http://localhost:3000";
			case "jmeter":
				return "jmeter -n -t jmeter/test-plan.jmx -l results.jtl";
			case "gatling":
				return "gatling.sh -s ${ScenarioName}Simulation";
			case "artillery":
				return "artillery run artillery/artillery.yml";
			case "wrk":
				return "wrk -t10 -c100 -d30s -s wrk/script.lua http://localhost:3000";
			default:
				return "# Run your performance tests here";
		}
	}

	private getInstallCommand(framework: string): string {
		switch (framework) {
			case "k6":
				return "\t@brew install k6 || apt-get install k6 || echo 'Please install k6'";
			case "locust":
				return "\t@pip install locust";
			case "jmeter":
				return "\t@brew install jmeter || echo 'Please install JMeter'";
			case "gatling":
				return "\t@echo 'Please download Gatling from https://gatling.io'";
			case "artillery":
				return "\t@npm install -g artillery";
			case "wrk":
				return "\t@brew install wrk || apt-get install wrk || echo 'Please install wrk'";
			default:
				return "\t@echo 'No installation required'";
		}
	}

	private getTestCommand(
		framework: string,
		scenario: string,
		options: PerformanceBenchmarkingOptions
	): string {
		switch (framework) {
			case "k6":
				return `\tk6 run k6/scenarios/${scenario}.js -o json=$(OUTPUT_DIR)/${scenario}.json`;
			case "locust":
				return `\tlocust -f locust/locustfile.py --headless -u ${
					options.scenarios.find((s) => s.name === scenario)?.load.vus || 10
				} -r 1 -t ${
					options.scenarios.find((s) => s.name === scenario)?.load.duration || "30s"
				} --host $(BASE_URL) --html $(OUTPUT_DIR)/${scenario}.html`;
			case "jmeter":
				return `\tjmeter -n -t jmeter/test-plan.jmx -l $(OUTPUT_DIR)/${scenario}.jtl`;
			case "gatling":
				return `\tgatling.sh -s ${scenario.replace(/-/g, "")}Simulation -rf $(OUTPUT_DIR)`;
			case "artillery":
				return `\tartillery run artillery/artillery.yml --output $(OUTPUT_DIR)/${scenario}.json`;
			case "wrk":
				return `\twrk -t10 -c${
					options.scenarios.find((s) => s.name === scenario)?.load.vus || 100
				} -d${
					options.scenarios.find((s) => s.name === scenario)?.load.duration || "30s"
				} -s wrk/${scenario}.lua $(BASE_URL) > $(OUTPUT_DIR)/${scenario}.txt`;
			default:
				return `\t@echo "Running ${scenario}"`;
		}
	}

	private getReportCommand(
		framework: string,
		options: PerformanceBenchmarkingOptions
	): string {
		switch (framework) {
			case "k6":
				return options.reporting?.formats.includes("html")
					? "\tk6-reporter $(OUTPUT_DIR)/*.json --output $(OUTPUT_DIR)/report.html"
					: "\t@echo 'K6 JSON reports generated'";
			case "locust":
				return "\t@echo 'Locust HTML reports generated'";
			case "jmeter":
				return "\tjmeter -g $(OUTPUT_DIR)/*.jtl -o $(OUTPUT_DIR)/html-report";
			case "gatling":
				return "\t@echo 'Gatling reports generated in $(OUTPUT_DIR)'";
			case "artillery":
				return "\tartillery report $(OUTPUT_DIR)/*.json --output $(OUTPUT_DIR)/report.html";
			case "wrk":
				return "\t@cat $(OUTPUT_DIR)/*.txt > $(OUTPUT_DIR)/summary.txt";
			default:
				return "\t@echo 'Reports generated'";
		}
	}

	private getDockerInstallCommand(framework: string): string {
		switch (framework) {
			case "k6":
				return "RUN wget https://github.com/grafana/k6/releases/download/v0.47.0/k6-v0.47.0-linux-amd64.tar.gz && \\\n    tar -xzf k6-*.tar.gz && \\\n    mv k6-*/k6 /usr/local/bin/ && \\\n    rm -rf k6-*";
			case "locust":
				return "RUN pip3 install locust";
			case "jmeter":
				return "RUN wget https://downloads.apache.org/jmeter/binaries/apache-jmeter-5.6.2.tgz && \\\n    tar -xzf apache-jmeter-*.tgz && \\\n    mv apache-jmeter-* /opt/jmeter && \\\n    rm apache-jmeter-*.tgz";
			case "gatling":
				return "RUN wget https://repo1.maven.org/maven2/io/gatling/highcharts/gatling-charts-highcharts-bundle/3.9.5/gatling-charts-highcharts-bundle-3.9.5-bundle.zip && \\\n    unzip gatling-*.zip && \\\n    mv gatling-* /opt/gatling && \\\n    rm gatling-*.zip";
			case "artillery":
				return "RUN npm install -g artillery";
			case "wrk":
				return "RUN git clone https://github.com/wg/wrk.git && \\\n    cd wrk && \\\n    make && \\\n    mv wrk /usr/local/bin/ && \\\n    cd .. && \\\n    rm -rf wrk";
			default:
				return "# No specific installation required";
		}
	}

	private getDockerEntrypoint(framework: string): string {
		switch (framework) {
			case "k6":
				return '"k6"';
			case "locust":
				return '"locust"';
			case "jmeter":
				return '"/opt/jmeter/bin/jmeter"';
			case "gatling":
				return '"/opt/gatling/bin/gatling.sh"';
			case "artillery":
				return '"artillery"';
			case "wrk":
				return '"wrk"';
			default:
				return '"/bin/sh"';
		}
	}

	private getDockerCmd(framework: string): string {
		switch (framework) {
			case "k6":
				return '"run", "/tests/scenarios/main.js"';
			case "locust":
				return '"-f", "/tests/locustfile.py"';
			case "jmeter":
				return '"-n", "-t", "/tests/test-plan.jmx"';
			case "gatling":
				return '"-s", "MainSimulation"';
			case "artillery":
				return '"run", "/tests/artillery.yml"';
			case "wrk":
				return '"-t10", "-c100", "-d30s"';
			default:
				return '"-c", "echo Ready"';
		}
	}

	private getCISetupCommand(framework: string): string {
		switch (framework) {
			case "k6":
				return "        sudo apt-key adv --keyserver hkp://keyserver.ubuntu.com:80 --recv-keys C5AD17C747E3415A3642D57D77C6C491D6AC1D69\n        echo 'deb https://dl.k6.io/deb stable main' | sudo tee /etc/apt/sources.list.d/k6.list\n        sudo apt-get update\n        sudo apt-get install k6";
			case "locust":
				return "        pip install locust";
			case "jmeter":
				return "        wget https://downloads.apache.org/jmeter/binaries/apache-jmeter-5.6.2.tgz\n        tar -xzf apache-jmeter-*.tgz\n        echo \"export PATH=$PATH:$(pwd)/apache-jmeter-*/bin\" >> $GITHUB_ENV";
			case "gatling":
				return "        wget https://repo1.maven.org/maven2/io/gatling/highcharts/gatling-charts-highcharts-bundle/3.9.5/gatling-charts-highcharts-bundle-3.9.5-bundle.zip\n        unzip gatling-*.zip\n        echo \"export PATH=$PATH:$(pwd)/gatling-*/bin\" >> $GITHUB_ENV";
			case "artillery":
				return "        npm install -g artillery";
			case "wrk":
				return "        sudo apt-get update\n        sudo apt-get install -y build-essential libssl-dev git\n        git clone https://github.com/wg/wrk.git\n        cd wrk && make && sudo mv wrk /usr/local/bin/";
			default:
				return "        echo 'No setup required'";
		}
	}
}

// Export factory function
export function createPerformanceBenchmarkingGenerator(): PerformanceBenchmarkingGenerator {
	return new PerformanceBenchmarkingGenerator();
}