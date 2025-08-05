/**
 * Test Server Manager
 * Manages test servers for E2E and integration testing
 */

import { spawn, type ChildProcess } from "node:child_process";
import { join } from "node:path";
import { promises as fs } from "node:fs";

export interface ServerConfig {
	readonly projectPath: string;
	readonly framework: "express" | "nestjs" | "fastify" | "hono";
	readonly port: number;
	readonly env?: Record<string, string>;
	readonly startTimeout?: number;
	readonly healthCheckPath?: string;
}

export interface ServerInstance {
	readonly pid: number;
	readonly port: number;
	readonly url: string;
	readonly stop: () => Promise<void>;
	readonly isRunning: () => boolean;
	readonly waitForReady: () => Promise<void>;
}

export class TestServerManager {
	private servers = new Map<string, ServerInstance>();
	private readonly defaultTimeout = 30000; // 30 seconds

	/**
	 * Start a test server for the given project
	 */
	async startServer(config: ServerConfig): Promise<ServerInstance> {
		const serverKey = `${config.framework}:${config.port}`;
		
		// Check if server is already running
		const existing = this.servers.get(serverKey);
		if (existing?.isRunning()) {
			return existing;
		}

		const instance = await this.spawnServer(config);
		this.servers.set(serverKey, instance);
		
		// Wait for server to be ready
		await instance.waitForReady();
		
		return instance;
	}

	/**
	 * Stop a specific server
	 */
	async stopServer(framework: string, port: number): Promise<void> {
		const serverKey = `${framework}:${port}`;
		const server = this.servers.get(serverKey);
		
		if (server) {
			await server.stop();
			this.servers.delete(serverKey);
		}
	}

	/**
	 * Stop all running servers
	 */
	async stopAllServers(): Promise<void> {
		const stopPromises = Array.from(this.servers.values()).map(server => server.stop());
		await Promise.allSettled(stopPromises);
		this.servers.clear();
	}

	/**
	 * Get running server by framework and port
	 */
	getServer(framework: string, port: number): ServerInstance | undefined {
		const serverKey = `${framework}:${port}`;
		return this.servers.get(serverKey);
	}

	/**
	 * Spawn a new server process
	 */
	private async spawnServer(config: ServerConfig): Promise<ServerInstance> {
		const { projectPath, framework, port, env = {}, startTimeout = this.defaultTimeout } = config;

		// Prepare environment variables
		const serverEnv = {
			...process.env,
			PORT: port.toString(),
			NODE_ENV: "test",
			...env,
		};

		// Determine start command based on framework
		const { command, args } = this.getStartCommand(framework, projectPath);

		// Spawn the server process
		const child = spawn(command, args, {
			cwd: projectPath,
			env: serverEnv,
			stdio: ["pipe", "pipe", "pipe"],
			detached: false,
		});

		let isReady = false;
		let isRunning = true;

		// Handle process events
		child.on("error", (error) => {
			console.error(`Server spawn error: ${error.message}`);
			isRunning = false;
		});

		child.on("exit", (code, signal) => {
			console.log(`Server exited with code ${code}, signal ${signal}`);
			isRunning = false;
		});

		// Capture output for debugging
		let output = "";
		child.stdout?.on("data", (data) => {
			const text = data.toString();
			output += text;
			
			// Check for framework-specific ready indicators
			if (this.isServerReady(framework, text)) {
				isReady = true;
			}
		});

		child.stderr?.on("data", (data) => {
			const text = data.toString();
			output += text;
			console.error(`Server stderr: ${text}`);
		});

		const url = `http://localhost:${port}`;

		const stop = async (): Promise<void> => {
			if (isRunning && child.pid) {
				child.kill("SIGTERM");
				
				// Wait for graceful shutdown
				await new Promise<void>((resolve) => {
					const timeout = setTimeout(() => {
						child.kill("SIGKILL");
						resolve();
					}, 5000);

					child.on("exit", () => {
						clearTimeout(timeout);
						resolve();
					});
				});
			}
			isRunning = false;
		};

		const waitForReady = (): Promise<void> => {
			return new Promise((resolve, reject) => {
				if (isReady) {
					resolve();
					return;
				}

				const timeout = setTimeout(() => {
					reject(new Error(`Server failed to start within ${startTimeout}ms. Output: ${output}`));
				}, startTimeout);

				const checkReady = () => {
					if (isReady) {
						clearTimeout(timeout);
						resolve();
					} else if (!isRunning) {
						clearTimeout(timeout);
						reject(new Error(`Server process exited unexpectedly. Output: ${output}`));
					} else {
						setTimeout(checkReady, 100);
					}
				};

				checkReady();
			});
		};

		return {
			pid: child.pid!,
			port,
			url,
			stop,
			isRunning: () => isRunning,
			waitForReady,
		};
	}

	/**
	 * Get start command for framework
	 */
	private getStartCommand(framework: string, projectPath: string): { command: string; args: string[] } {
		switch (framework) {
			case "nestjs":
				return {
					command: "npm",
					args: ["run", "start:dev"],
				};
			case "express":
				return {
					command: "npm",
					args: ["run", "dev"],
				};
			case "fastify":
				return {
					command: "npm",
					args: ["run", "dev"],
				};
			case "hono":
				return {
					command: "npm",
					args: ["run", "dev"],
				};
			default:
				throw new Error(`Unsupported framework: ${framework}`);
		}
	}

	/**
	 * Check if server is ready based on output
	 */
	private isServerReady(framework: string, output: string): boolean {
		const lowerOutput = output.toLowerCase();
		
		switch (framework) {
			case "nestjs":
				return lowerOutput.includes("nest application successfully started") ||
					   lowerOutput.includes("application is running on:");
			case "express":
				return lowerOutput.includes("server is running on") ||
					   lowerOutput.includes("listening on port");
			case "fastify":
				return lowerOutput.includes("server listening at") ||
					   lowerOutput.includes("server started successfully");
			case "hono":
				return lowerOutput.includes("server is running on") ||
					   lowerOutput.includes("listening on");
			default:
				return lowerOutput.includes("server") && 
					   (lowerOutput.includes("running") || lowerOutput.includes("listening"));
		}
	}

	/**
	 * Install dependencies if needed
	 */
	async installDependencies(projectPath: string): Promise<void> {
		const packageJsonPath = join(projectPath, "package.json");
		const nodeModulesPath = join(projectPath, "node_modules");

		try {
			// Check if dependencies are already installed
			await fs.access(nodeModulesPath);
			return; // Dependencies already installed
		} catch {
			// Need to install dependencies
		}

		try {
			await fs.access(packageJsonPath);
		} catch {
			throw new Error("package.json not found in project directory");
		}

		// Install dependencies using bun (as specified in requirements)
		const child = spawn("bun", ["install"], {
			cwd: projectPath,
			stdio: "inherit",
		});

		await new Promise<void>((resolve, reject) => {
			child.on("exit", (code) => {
				if (code === 0) {
					resolve();
				} else {
					reject(new Error(`Dependency installation failed with code ${code}`));
				}
			});

			child.on("error", reject);
		});
	}

	/**
	 * Build project if needed
	 */
	async buildProject(projectPath: string): Promise<void> {
		const child = spawn("npm", ["run", "build"], {
			cwd: projectPath,
			stdio: "inherit",
		});

		await new Promise<void>((resolve, reject) => {
			child.on("exit", (code) => {
				if (code === 0) {
					resolve();
				} else {
					reject(new Error(`Build failed with code ${code}`));
				}
			});

			child.on("error", reject);
		});
	}

	/**
	 * Check if port is available
	 */
	async isPortAvailable(port: number): Promise<boolean> {
		return new Promise((resolve) => {
			const server = require("http").createServer();
			
			server.listen(port, () => {
				server.close(() => resolve(true));
			});
			
			server.on("error", () => resolve(false));
		});
	}

	/**
	 * Find an available port starting from the given port
	 */
	async findAvailablePort(startPort: number, maxPort = startPort + 100): Promise<number> {
		for (let port = startPort; port <= maxPort; port++) {
			if (await this.isPortAvailable(port)) {
				return port;
			}
		}
		throw new Error(`No available port found between ${startPort} and ${maxPort}`);
	}
}

/**
 * Global test server manager instance
 */
export const testServerManager = new TestServerManager();

/**
 * Cleanup function for test teardown
 */
export async function cleanupTestServers(): Promise<void> {
	await testServerManager.stopAllServers();
}