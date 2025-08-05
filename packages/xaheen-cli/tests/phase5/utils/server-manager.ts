import { spawn, ChildProcess } from 'child_process';
import { EventEmitter } from 'events';
import { waitForPort, isPortInUse, findAvailablePort } from './test-helpers';
import type { Phase5TestConfig } from '../config/test-config';

export interface ServerInstance {
  id: string;
  name: string;
  port: number;
  process: ChildProcess;
  status: 'starting' | 'running' | 'stopping' | 'stopped' | 'error';
  logs: string[];
  url: string;
}

export interface ServerConfig {
  name: string;
  command: string;
  args: string[];
  cwd: string;
  env?: Record<string, string>;
  port: number;
  healthEndpoint?: string;
  startupTimeout?: number;
  gracefulShutdownTimeout?: number;
}

/**
 * Manager for starting, stopping, and monitoring multiple server processes
 */
export class ServerManager extends EventEmitter {
  private servers: Map<string, ServerInstance> = new Map();
  private config: Phase5TestConfig;

  constructor(config: Phase5TestConfig) {
    super();
    this.config = config;
  }

  /**
   * Start a server instance
   */
  async startServer(serverConfig: ServerConfig): Promise<ServerInstance> {
    const serverId = `${serverConfig.name}-${Date.now()}`;
    
    // Check if port is available
    if (await isPortInUse(serverConfig.port)) {
      const availablePort = await findAvailablePort(serverConfig.port + 1);
      console.warn(`Port ${serverConfig.port} is in use, using ${availablePort} instead`);
      serverConfig.port = availablePort;
    }

    const serverInstance: ServerInstance = {
      id: serverId,
      name: serverConfig.name,
      port: serverConfig.port,
      process: null as any, // Will be set below
      status: 'starting',
      logs: [],
      url: `http://localhost:${serverConfig.port}`,
    };

    // Spawn the server process
    const childProcess = spawn(serverConfig.command, serverConfig.args, {
      cwd: serverConfig.cwd,
      env: {
        ...process.env,
        ...serverConfig.env,
        PORT: serverConfig.port.toString(),
      },
      stdio: 'pipe',
      detached: false,
    });

    serverInstance.process = childProcess;

    // Handle process events
    childProcess.stdout?.on('data', (data) => {
      const message = data.toString();
      serverInstance.logs.push(`[${new Date().toISOString()}] [STDOUT] ${message}`);
      this.emit('log', serverId, 'stdout', message);
    });

    childProcess.stderr?.on('data', (data) => {
      const message = data.toString();
      serverInstance.logs.push(`[${new Date().toISOString()}] [STDERR] ${message}`);
      this.emit('log', serverId, 'stderr', message);
    });

    childProcess.on('error', (error) => {
      serverInstance.status = 'error';
      serverInstance.logs.push(`[${new Date().toISOString()}] [ERROR] ${error.message}`);
      this.emit('error', serverId, error);
    });

    childProcess.on('exit', (code, signal) => {
      serverInstance.status = 'stopped';
      const message = `Process exited with code ${code} and signal ${signal}`;
      serverInstance.logs.push(`[${new Date().toISOString()}] [EXIT] ${message}`);
      this.emit('exit', serverId, code, signal);
    });

    this.servers.set(serverId, serverInstance);

    // Wait for server to be ready
    const startupTimeout = serverConfig.startupTimeout || 30000;
    const isReady = await this.waitForServerReady(serverInstance, startupTimeout);

    if (isReady) {
      serverInstance.status = 'running';
      this.emit('ready', serverId, serverInstance);
    } else {
      serverInstance.status = 'error';
      this.emit('error', serverId, new Error(`Server failed to start within ${startupTimeout}ms`));
    }

    return serverInstance;
  }

  /**
   * Stop a server instance
   */
  async stopServer(serverId: string): Promise<void> {
    const serverInstance = this.servers.get(serverId);
    if (!serverInstance) {
      throw new Error(`Server with ID ${serverId} not found`);
    }

    if (serverInstance.status === 'stopped' || serverInstance.status === 'stopping') {
      return;
    }

    serverInstance.status = 'stopping';
    this.emit('stopping', serverId);

    // Attempt graceful shutdown
    serverInstance.process.kill('SIGTERM');

    // Wait for graceful shutdown with timeout
    const gracefulTimeout = 5000;
    const forceKillTimer = setTimeout(() => {
      if (serverInstance.status !== 'stopped') {
        serverInstance.process.kill('SIGKILL');
      }
    }, gracefulTimeout);

    // Wait for process to exit
    await new Promise<void>((resolve) => {
      const checkStopped = () => {
        if (serverInstance.status === 'stopped') {
          clearTimeout(forceKillTimer);
          resolve();
        } else {
          setTimeout(checkStopped, 100);
        }
      };
      checkStopped();
    });

    this.emit('stopped', serverId);
  }

  /**
   * Stop all servers
   */
  async stopAllServers(): Promise<void> {
    const stopPromises = Array.from(this.servers.keys()).map(serverId => 
      this.stopServer(serverId)
    );
    
    await Promise.all(stopPromises);
    this.servers.clear();
  }

  /**
   * Get server instance by ID
   */
  getServer(serverId: string): ServerInstance | undefined {
    return this.servers.get(serverId);
  }

  /**
   * Get server instance by name
   */
  getServerByName(name: string): ServerInstance | undefined {
    for (const server of this.servers.values()) {
      if (server.name === name) {
        return server;
      }
    }
    return undefined;
  }

  /**
   * Get all server instances
   */
  getAllServers(): ServerInstance[] {
    return Array.from(this.servers.values());
  }

  /**
   * Get server logs
   */
  getServerLogs(serverId: string): string[] {
    const server = this.servers.get(serverId);
    return server ? server.logs : [];
  }

  /**
   * Wait for a server to be ready
   */
  private async waitForServerReady(
    server: ServerInstance,
    timeout: number
  ): Promise<boolean> {
    const startTime = Date.now();
    
    while (Date.now() - startTime < timeout) {
      if (server.status === 'error' || server.status === 'stopped') {
        return false;
      }

      // Check if port is listening
      const isPortReady = await waitForPort(server.port, 'localhost', 1000);
      if (isPortReady) {
        return true;
      }

      await new Promise(resolve => setTimeout(resolve, 500));
    }

    return false;
  }

  /**
   * Create a backend server configuration
   */
  static createBackendConfig(
    workspacePath: string,
    port: number,
    env: Record<string, string> = {}
  ): ServerConfig {
    return {
      name: 'backend',
      command: 'bun',
      args: ['run', 'dev'],
      cwd: `${workspacePath}/packages/backend`,
      port,
      env: {
        NODE_ENV: 'test',
        ...env,
      },
      healthEndpoint: '/api/health',
      startupTimeout: 30000,
      gracefulShutdownTimeout: 5000,
    };
  }

  /**
   * Create a frontend server configuration
   */
  static createFrontendConfig(
    workspacePath: string,
    port: number,
    apiUrl: string,
    env: Record<string, string> = {}
  ): ServerConfig {
    return {
      name: 'frontend',
      command: 'bun',
      args: ['run', 'dev'],
      cwd: `${workspacePath}/packages/frontend`,
      port,
      env: {
        NODE_ENV: 'test',
        NEXT_PUBLIC_API_URL: apiUrl,
        ...env,
      },
      healthEndpoint: '/',
      startupTimeout: 60000, // Next.js takes longer to start
      gracefulShutdownTimeout: 10000,
    };
  }

  /**
   * Create a mock API server configuration
   */
  static createMockApiConfig(
    mockServerPath: string,
    port: number,
    env: Record<string, string> = {}
  ): ServerConfig {
    return {
      name: 'mock-api',
      command: 'node',
      args: ['index.js'],
      cwd: mockServerPath,
      port,
      env: {
        NODE_ENV: 'test',
        ...env,
      },
      healthEndpoint: '/health',
      startupTimeout: 15000,
      gracefulShutdownTimeout: 3000,
    };
  }
}

/**
 * Utility function to start a full-stack test environment
 */
export async function startFullStackEnvironment(
  workspacePath: string,
  config: Phase5TestConfig
): Promise<{
  serverManager: ServerManager;
  backend: ServerInstance;
  frontend: ServerInstance;
}> {
  const serverManager = new ServerManager(config);

  // Start backend first
  const backendConfig = ServerManager.createBackendConfig(
    workspacePath,
    config.ports.backend
  );
  const backend = await serverManager.startServer(backendConfig);

  // Start frontend with backend URL
  const frontendConfig = ServerManager.createFrontendConfig(
    workspacePath,
    config.ports.frontend,
    backend.url
  );
  const frontend = await serverManager.startServer(frontendConfig);

  return {
    serverManager,
    backend,
    frontend,
  };
}

/**
 * Utility function to create and start a mock API server
 */
export async function createMockApiServer(
  config: Phase5TestConfig,
  endpoints: Record<string, any>
): Promise<ServerInstance> {
  const serverManager = new ServerManager(config);
  
  // Create a temporary mock server directory
  const mockServerPath = `/tmp/mock-api-${Date.now()}`;
  const fs = await import('fs/promises');
  await fs.mkdir(mockServerPath, { recursive: true });

  // Create mock server implementation
  const mockServerCode = `
const express = require('express');
const cors = require('cors');

const app = express();
const PORT = process.env.PORT || ${config.ports.mockApi};

app.use(cors());
app.use(express.json());

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// Mock endpoints
${Object.entries(endpoints).map(([path, response]) => `
app.all('${path}', (req, res) => {
  console.log(\`\${req.method} ${path}\`, req.body);
  res.json(${JSON.stringify(response)});
});
`).join('\n')}

// 404 handler
app.use('*', (req, res) => {
  res.status(404).json({ error: 'Endpoint not found' });
});

app.listen(PORT, () => {
  console.log(\`Mock API server running on port \${PORT}\`);
});
`;

  await fs.writeFile(`${mockServerPath}/index.js`, mockServerCode);
  
  // Create package.json for the mock server
  const packageJson = {
    name: 'mock-api-server',
    version: '1.0.0',
    main: 'index.js',
    dependencies: {
      express: '^4.18.0',
      cors: '^2.8.5',
    },
  };
  
  await fs.writeFile(
    `${mockServerPath}/package.json`,
    JSON.stringify(packageJson, null, 2)
  );

  // Install dependencies
  const { execCommand } = await import('./test-helpers');
  await execCommand('npm install', { cwd: mockServerPath });

  // Start the mock server
  const mockConfig = ServerManager.createMockApiConfig(mockServerPath, config.ports.mockApi);
  return await serverManager.startServer(mockConfig);
}