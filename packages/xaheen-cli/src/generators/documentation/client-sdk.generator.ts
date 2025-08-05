/**
 * @fileoverview Client SDK Generator
 * @description Generates client SDKs for multiple languages from API specifications
 * @author Xaheen Enterprise
 * @version 1.0.0
 */

import { existsSync, mkdirSync, writeFileSync } from "fs";
import { join } from "path";
import { BaseGenerator } from "../base.generator";
import type {
	DocumentationGeneratorOptions,
	DocumentationResult,
} from "./index";

export interface ClientSDKGeneratorOptions
	extends DocumentationGeneratorOptions {
	readonly targetLanguages: readonly string[];
	readonly packageName?: string;
	readonly packageVersion?: string;
	readonly includeExamples?: boolean;
	readonly includeTests?: boolean;
}

export class ClientSDKGenerator extends BaseGenerator<ClientSDKGeneratorOptions> {
	async generate(
		options: ClientSDKGeneratorOptions,
	): Promise<DocumentationResult> {
		try {
			this.logger.info(`Generating client SDKs for ${options.projectName}`);

			await this.validateOptions(options);

			const outputDir = join(options.outputDir, "sdks");
			this.createDirectoryStructure(outputDir);

			const files: string[] = [];
			const languages = options.targetLanguages || [
				"typescript",
				"python",
				"go",
			];

			for (const language of languages) {
				const langFiles = await this.generateSDKForLanguage(
					language,
					options,
					outputDir,
				);
				files.push(...langFiles);
			}

			this.logger.success(
				`Client SDKs generated for ${languages.length} languages`,
			);

			return {
				success: true,
				message: `Client SDKs generated successfully for ${options.projectName}`,
				files,
				commands: [
					"npm publish # Publish TypeScript SDK",
					"pip upload # Publish Python SDK",
					"go mod publish # Publish Go SDK",
				],
				nextSteps: [
					"Test generated SDKs with example applications",
					"Set up automated publishing pipeline",
					"Create SDK documentation and examples",
					"Add SDK versioning and release management",
				],
			};
		} catch (error) {
			this.logger.error("Failed to generate client SDKs", error);
			return {
				success: false,
				message: `Failed to generate client SDKs: ${error instanceof Error ? error.message : "Unknown error"}`,
				files: [],
				error: error instanceof Error ? error.message : "Unknown error",
			};
		}
	}

	private createDirectoryStructure(outputDir: string): void {
		const dirs = [
			outputDir,
			join(outputDir, "typescript"),
			join(outputDir, "python"),
			join(outputDir, "go"),
			join(outputDir, "java"),
			join(outputDir, "examples"),
		];

		dirs.forEach((dir) => {
			if (!existsSync(dir)) {
				mkdirSync(dir, { recursive: true });
			}
		});
	}

	private async generateSDKForLanguage(
		language: string,
		options: ClientSDKGeneratorOptions,
		outputDir: string,
	): Promise<string[]> {
		const files: string[] = [];
		const langDir = join(outputDir, language);

		switch (language) {
			case "typescript":
				files.push(...(await this.generateTypeScriptSDK(options, langDir)));
				break;
			case "python":
				files.push(...(await this.generatePythonSDK(options, langDir)));
				break;
			case "go":
				files.push(...(await this.generateGoSDK(options, langDir)));
				break;
			case "java":
				files.push(...(await this.generateJavaSDK(options, langDir)));
				break;
		}

		return files;
	}

	private async generateTypeScriptSDK(
		options: ClientSDKGeneratorOptions,
		outputDir: string,
	): Promise<string[]> {
		const files: string[] = [];

		// Generate package.json
		const packageJsonPath = join(outputDir, "package.json");
		const packageJson = {
			name: `${options.packageName || options.projectName}-sdk`,
			version: options.packageVersion || options.version,
			description: `TypeScript SDK for ${options.projectName}`,
			main: "dist/index.js",
			types: "dist/index.d.ts",
			scripts: {
				build: "tsc",
				test: "jest",
				prepublishOnly: "npm run build",
			},
			dependencies: {
				axios: "^1.0.0",
			},
			devDependencies: {
				typescript: "^5.0.0",
				"@types/node": "^20.0.0",
				jest: "^29.0.0",
				"@types/jest": "^29.0.0",
			},
		};
		writeFileSync(packageJsonPath, JSON.stringify(packageJson, null, 2));
		files.push(packageJsonPath);

		// Generate TypeScript configuration
		const tsconfigPath = join(outputDir, "tsconfig.json");
		const tsconfig = {
			compilerOptions: {
				target: "ES2020",
				module: "commonjs",
				lib: ["ES2020"],
				outDir: "./dist",
				rootDir: "./src",
				strict: true,
				esModuleInterop: true,
				skipLibCheck: true,
				forceConsistentCasingInFileNames: true,
				declaration: true,
				declarationMap: true,
			},
			include: ["src/**/*"],
			exclude: ["node_modules", "dist", "tests"],
		};
		writeFileSync(tsconfigPath, JSON.stringify(tsconfig, null, 2));
		files.push(tsconfigPath);

		// Generate main SDK file
		const srcDir = join(outputDir, "src");
		if (!existsSync(srcDir)) {
			mkdirSync(srcDir, { recursive: true });
		}

		const indexPath = join(srcDir, "index.ts");
		const indexContent = this.generateTypeScriptSDKContent(options);
		writeFileSync(indexPath, indexContent);
		files.push(indexPath);

		return files;
	}

	private generateTypeScriptSDKContent(
		options: ClientSDKGeneratorOptions,
	): string {
		return `/**
 * ${options.projectName} TypeScript SDK
 * Generated automatically - do not edit manually
 */

import axios, { AxiosInstance, AxiosResponse } from 'axios';

export interface ${options.projectName}Config {
  readonly baseURL: string;
  readonly apiKey: string;
  readonly timeout?: number;
}

export interface APIResponse<T = any> {
  readonly success: boolean;
  readonly data: T;
  readonly message?: string;
  readonly timestamp: string;
}

export class ${options.projectName}SDK {
  private client: AxiosInstance;

  constructor(config: ${options.projectName}Config) {
    this.client = axios.create({
      baseURL: config.baseURL,
      timeout: config.timeout || 10000,
      headers: {
        'Authorization': \`Bearer \${config.apiKey}\`,
        'Content-Type': 'application/json',
      },
    });

    // Add response interceptor
    this.client.interceptors.response.use(
      (response) => response,
      (error) => {
        console.error('API Error:', error.response?.data || error.message);
        return Promise.reject(error);
      }
    );
  }

  /**
   * Get system status
   */
  async getStatus(): Promise<APIResponse> {
    const response = await this.client.get('/status');
    return response.data;
  }

  /**
   * List all resources
   */
  async listResources(): Promise<APIResponse<any[]>> {
    const response = await this.client.get('/resources');
    return response.data;
  }

  /**
   * Get resource by ID
   */
  async getResource(id: string): Promise<APIResponse> {
    const response = await this.client.get(\`/resources/\${id}\`);
    return response.data;
  }

  /**
   * Create new resource
   */
  async createResource(data: Record<string, any>): Promise<APIResponse> {
    const response = await this.client.post('/resources', data);
    return response.data;
  }

  /**
   * Update existing resource
   */
  async updateResource(id: string, data: Record<string, any>): Promise<APIResponse> {
    const response = await this.client.put(\`/resources/\${id}\`, data);
    return response.data;
  }

  /**
   * Delete resource
   */
  async deleteResource(id: string): Promise<APIResponse> {
    const response = await this.client.delete(\`/resources/\${id}\`);
    return response.data;
  }
}

export default ${options.projectName}SDK;
`;
	}

	private async generatePythonSDK(
		options: ClientSDKGeneratorOptions,
		outputDir: string,
	): Promise<string[]> {
		const files: string[] = [];

		// Generate setup.py
		const setupPath = join(outputDir, "setup.py");
		const setupContent = `from setuptools import setup, find_packages

setup(
    name="${options.packageName || options.projectName}-sdk",
    version="${options.packageVersion || options.version}",
    description="Python SDK for ${options.projectName}",
    packages=find_packages(),
    install_requires=[
        "requests>=2.25.0",
        "typing-extensions>=4.0.0",
    ],
    python_requires=">=3.7",
    classifiers=[
        "Development Status :: 4 - Beta",
        "Intended Audience :: Developers",
        "License :: OSI Approved :: MIT License",
        "Programming Language :: Python :: 3.7",
        "Programming Language :: Python :: 3.8",
        "Programming Language :: Python :: 3.9",
        "Programming Language :: Python :: 3.10",
    ],
)`;
		writeFileSync(setupPath, setupContent);
		files.push(setupPath);

		// Generate main SDK file
		const packageDir = join(outputDir, options.projectName.toLowerCase());
		if (!existsSync(packageDir)) {
			mkdirSync(packageDir, { recursive: true });
		}

		const initPath = join(packageDir, "__init__.py");
		const initContent = this.generatePythonSDKContent(options);
		writeFileSync(initPath, initContent);
		files.push(initPath);

		return files;
	}

	private generatePythonSDKContent(options: ClientSDKGeneratorOptions): string {
		const className =
			options.projectName.charAt(0).toUpperCase() +
			options.projectName.slice(1);

		return `"""
${options.projectName} Python SDK
Generated automatically - do not edit manually
"""

import requests
from typing import Dict, Any, Optional, List
from datetime import datetime

class ${className}Config:
    def __init__(self, base_url: str, api_key: str, timeout: int = 10):
        self.base_url = base_url.rstrip('/')
        self.api_key = api_key
        self.timeout = timeout

class ${className}SDK:
    def __init__(self, config: ${className}Config):
        self.config = config
        self.session = requests.Session()
        self.session.headers.update({
            'Authorization': f'Bearer {config.api_key}',
            'Content-Type': 'application/json',
        })
    
    def _request(self, method: str, endpoint: str, **kwargs) -> Dict[str, Any]:
        """Make HTTP request to API"""
        url = f"{self.config.base_url}{endpoint}"
        
        try:
            response = self.session.request(
                method=method,
                url=url,
                timeout=self.config.timeout,
                **kwargs
            )
            response.raise_for_status()
            return response.json()
        except requests.RequestException as e:
            print(f"API Error: {e}")
            raise
    
    def get_status(self) -> Dict[str, Any]:
        """Get system status"""
        return self._request('GET', '/status')
    
    def list_resources(self) -> Dict[str, Any]:
        """List all resources"""
        return self._request('GET', '/resources')
    
    def get_resource(self, resource_id: str) -> Dict[str, Any]:
        """Get resource by ID"""
        return self._request('GET', f'/resources/{resource_id}')
    
    def create_resource(self, data: Dict[str, Any]) -> Dict[str, Any]:
        """Create new resource"""
        return self._request('POST', '/resources', json=data)
    
    def update_resource(self, resource_id: str, data: Dict[str, Any]) -> Dict[str, Any]:
        """Update existing resource"""
        return self._request('PUT', f'/resources/{resource_id}', json=data)
    
    def delete_resource(self, resource_id: str) -> Dict[str, Any]:
        """Delete resource"""
        return self._request('DELETE', f'/resources/{resource_id}')

# Export main class
__all__ = ['${className}SDK', '${className}Config']
`;
	}

	private async generateGoSDK(
		options: ClientSDKGeneratorOptions,
		outputDir: string,
	): Promise<string[]> {
		const files: string[] = [];

		// Generate go.mod
		const goModPath = join(outputDir, "go.mod");
		const goModContent = `module ${options.packageName || options.projectName}-sdk

go 1.19

require (
    github.com/go-resty/resty/v2 v2.7.0
)
`;
		writeFileSync(goModPath, goModContent);
		files.push(goModPath);

		// Generate main SDK file
		const clientPath = join(outputDir, "client.go");
		const clientContent = this.generateGoSDKContent(options);
		writeFileSync(clientPath, clientContent);
		files.push(clientPath);

		return files;
	}

	private generateGoSDKContent(options: ClientSDKGeneratorOptions): string {
		const packageName = options.projectName.toLowerCase();

		return `// Package ${packageName}sdk provides a Go SDK for ${options.projectName}
// Generated automatically - do not edit manually
package ${packageName}sdk

import (
    "fmt"
    "time"
    
    "github.com/go-resty/resty/v2"
)

// Config holds the SDK configuration
type Config struct {
    BaseURL string
    APIKey  string
    Timeout time.Duration
}

// Client is the main SDK client
type Client struct {
    config Config
    client *resty.Client
}

// APIResponse represents a standard API response
type APIResponse struct {
    Success   bool        \`json:"success"\`
    Data      interface{} \`json:"data"\`
    Message   string      \`json:"message,omitempty"\`
    Timestamp string      \`json:"timestamp"\`
}

// NewClient creates a new SDK client
func NewClient(config Config) *Client {
    if config.Timeout == 0 {
        config.Timeout = 10 * time.Second
    }
    
    client := resty.New()
    client.SetBaseURL(config.BaseURL)
    client.SetHeader("Authorization", "Bearer "+config.APIKey)
    client.SetHeader("Content-Type", "application/json")
    client.SetTimeout(config.Timeout)
    
    return &Client{
        config: config,
        client: client,
    }
}

// GetStatus returns the system status
func (c *Client) GetStatus() (*APIResponse, error) {
    var response APIResponse
    
    resp, err := c.client.R().
        SetResult(&response).
        Get("/status")
    
    if err != nil {
        return nil, fmt.Errorf("failed to get status: %w", err)
    }
    
    if !resp.IsSuccess() {
        return nil, fmt.Errorf("API error: %s", resp.Status())
    }
    
    return &response, nil
}

// ListResources returns all resources
func (c *Client) ListResources() (*APIResponse, error) {
    var response APIResponse
    
    resp, err := c.client.R().
        SetResult(&response).
        Get("/resources")
    
    if err != nil {
        return nil, fmt.Errorf("failed to list resources: %w", err)
    }
    
    if !resp.IsSuccess() {
        return nil, fmt.Errorf("API error: %s", resp.Status())
    }
    
    return &response, nil
}

// GetResource returns a specific resource by ID
func (c *Client) GetResource(id string) (*APIResponse, error) {
    var response APIResponse
    
    resp, err := c.client.R().
        SetResult(&response).
        Get("/resources/" + id)
    
    if err != nil {
        return nil, fmt.Errorf("failed to get resource: %w", err)
    }
    
    if !resp.IsSuccess() {
        return nil, fmt.Errorf("API error: %s", resp.Status())
    }
    
    return &response, nil
}

// CreateResource creates a new resource
func (c *Client) CreateResource(data map[string]interface{}) (*APIResponse, error) {
    var response APIResponse
    
    resp, err := c.client.R().
        SetBody(data).
        SetResult(&response).
        Post("/resources")
    
    if err != nil {
        return nil, fmt.Errorf("failed to create resource: %w", err)
    }
    
    if !resp.IsSuccess() {
        return nil, fmt.Errorf("API error: %s", resp.Status())
    }
    
    return &response, nil
}

// UpdateResource updates an existing resource
func (c *Client) UpdateResource(id string, data map[string]interface{}) (*APIResponse, error) {
    var response APIResponse
    
    resp, err := c.client.R().
        SetBody(data).
        SetResult(&response).
        Put("/resources/" + id)
    
    if err != nil {
        return nil, fmt.Errorf("failed to update resource: %w", err)
    }
    
    if !resp.IsSuccess() {
        return nil, fmt.Errorf("API error: %s", resp.Status())
    }
    
    return &response, nil
}

// DeleteResource deletes a resource
func (c *Client) DeleteResource(id string) (*APIResponse, error) {
    var response APIResponse
    
    resp, err := c.client.R().
        SetResult(&response).
        Delete("/resources/" + id)
    
    if err != nil {
        return nil, fmt.Errorf("failed to delete resource: %w", err)
    }
    
    if !resp.IsSuccess() {
        return nil, fmt.Errorf("API error: %s", resp.Status())
    }
    
    return &response, nil
}
`;
	}

	private async generateJavaSDK(
		options: ClientSDKGeneratorOptions,
		outputDir: string,
	): Promise<string[]> {
		const files: string[] = [];

		// Generate pom.xml
		const pomPath = join(outputDir, "pom.xml");
		const pomContent = `<?xml version="1.0" encoding="UTF-8"?>
<project xmlns="http://maven.apache.org/POM/4.0.0"
         xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance"
         xsi:schemaLocation="http://maven.apache.org/POM/4.0.0 
         http://maven.apache.org/xsd/maven-4.0.0.xsd">
    <modelVersion>4.0.0</modelVersion>
    
    <groupId>com.${options.projectName.toLowerCase()}</groupId>
    <artifactId>${options.projectName.toLowerCase()}-sdk</artifactId>
    <version>${options.packageVersion || options.version}</version>
    <packaging>jar</packaging>
    
    <name>${options.projectName} Java SDK</name>
    <description>Java SDK for ${options.projectName}</description>
    
    <properties>
        <maven.compiler.source>11</maven.compiler.source>
        <maven.compiler.target>11</maven.compiler.target>
        <project.build.sourceEncoding>UTF-8</project.build.sourceEncoding>
    </properties>
    
    <dependencies>
        <dependency>
            <groupId>com.squareup.okhttp3</groupId>
            <artifactId>okhttp</artifactId>
            <version>4.12.0</version>
        </dependency>
        <dependency>
            <groupId>com.fasterxml.jackson.core</groupId>
            <artifactId>jackson-databind</artifactId>
            <version>2.15.2</version>
        </dependency>
    </dependencies>
</project>`;
		writeFileSync(pomPath, pomContent);
		files.push(pomPath);

		return files;
	}
}
