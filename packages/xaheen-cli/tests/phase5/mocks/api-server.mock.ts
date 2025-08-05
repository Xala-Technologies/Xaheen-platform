import express from 'express';
import cors from 'cors';
import { Server } from 'http';
import type { User, CreateUserRequest, UpdateUserRequest, ApiResponse, PaginatedResponse } from '@test-workspace/shared';

export interface MockApiServerConfig {
  port: number;
  host?: string;
  enableCors?: boolean;
  delayMs?: number;
  errorRate?: number; // 0-1, rate of random errors for testing
}

export interface MockDatabase {
  users: User[];
  posts: any[];
  nextUserId: number;
  nextPostId: number;
}

/**
 * Mock API server for testing frontend-backend integration
 */
export class MockApiServer {
  private app: express.Application;
  private server: Server | null = null;
  private config: MockApiServerConfig;
  private database: MockDatabase;

  constructor(config: MockApiServerConfig) {
    this.config = {
      host: 'localhost',
      enableCors: true,
      delayMs: 0,
      errorRate: 0,
      ...config,
    };

    this.database = {
      users: [
        {
          id: '1',
          name: 'John Doe',
          email: 'john@example.com',
          createdAt: new Date('2023-01-01'),
          updatedAt: new Date('2023-01-01'),
        },
        {
          id: '2',
          name: 'Jane Smith',
          email: 'jane@example.com',
          createdAt: new Date('2023-01-02'),
          updatedAt: new Date('2023-01-02'),
        },
      ],
      posts: [
        {
          id: '1',
          title: 'First Post',
          content: 'This is the first post',
          authorId: '1',
          createdAt: new Date('2023-01-01'),
          updatedAt: new Date('2023-01-01'),
        },
      ],
      nextUserId: 3,
      nextPostId: 2,
    };

    this.app = express();
    this.setupMiddleware();
    this.setupRoutes();
    this.setupErrorHandling();
  }

  private setupMiddleware(): void {
    if (this.config.enableCors) {
      this.app.use(cors());
    }

    this.app.use(express.json());
    this.app.use(express.urlencoded({ extended: true }));

    // Add artificial delay for testing
    if (this.config.delayMs > 0) {
      this.app.use((req, res, next) => {
        setTimeout(next, this.config.delayMs);
      });
    }

    // Random error injection for testing error handling
    if (this.config.errorRate > 0) {
      this.app.use((req, res, next) => {
        if (Math.random() < this.config.errorRate) {
          return res.status(500).json({
            success: false,
            error: 'Random server error for testing',
          });
        }
        next();
      });
    }

    // Request logging
    this.app.use((req, res, next) => {
      console.log(`[MockAPI] ${req.method} ${req.path}`, req.body || '');
      next();
    });
  }

  private setupRoutes(): void {
    // Health check
    this.app.get('/health', (req, res) => {
      res.json({
        success: true,
        message: 'Mock API server is healthy',
        timestamp: new Date().toISOString(),
        uptime: process.uptime(),
      });
    });

    // Authentication routes
    this.setupAuthRoutes();

    // User routes
    this.setupUserRoutes();

    // Post routes
    this.setupPostRoutes();

    // Generic CRUD routes for testing
    this.setupGenericRoutes();
  }

  private setupAuthRoutes(): void {
    this.app.post('/api/auth/login', (req, res) => {
      const { email, password } = req.body;

      if (!email || !password) {
        return res.status(400).json({
          success: false,
          error: 'Email and password are required',
        } as ApiResponse);
      }

      // Mock authentication - any password works
      const user = this.database.users.find(u => u.email === email);
      if (!user) {
        return res.status(401).json({
          success: false,
          error: 'Invalid credentials',
        } as ApiResponse);
      }

      res.json({
        success: true,
        data: {
          token: 'mock-jwt-token-' + Date.now(),
          user,
        },
        message: 'Authentication successful',
      } as ApiResponse);
    });

    this.app.post('/api/auth/logout', (req, res) => {
      res.json({
        success: true,
        message: 'Logged out successfully',
      } as ApiResponse);
    });

    this.app.get('/api/auth/me', (req, res) => {
      const authHeader = req.headers.authorization;
      if (!authHeader || !authHeader.startsWith('Bearer ')) {
        return res.status(401).json({
          success: false,
          error: 'Authorization token required',
        } as ApiResponse);
      }

      // Mock user from token
      const mockUser = this.database.users[0];
      res.json({
        success: true,
        data: mockUser,
      } as ApiResponse);
    });
  }

  private setupUserRoutes(): void {
    // GET /api/users - List users with pagination
    this.app.get('/api/users', (req, res) => {
      const page = parseInt(req.query.page as string) || 1;
      const limit = parseInt(req.query.limit as string) || 10;
      const search = req.query.search as string;
      const sortBy = req.query.sortBy as string || 'createdAt';
      const sortOrder = req.query.sortOrder as string || 'desc';

      let filteredUsers = [...this.database.users];

      // Apply search filter
      if (search) {
        filteredUsers = filteredUsers.filter(user =>
          user.name.toLowerCase().includes(search.toLowerCase()) ||
          user.email.toLowerCase().includes(search.toLowerCase())
        );
      }

      // Apply sorting
      filteredUsers.sort((a, b) => {
        const aValue = (a as any)[sortBy];
        const bValue = (b as any)[sortBy];
        const order = sortOrder === 'asc' ? 1 : -1;
        
        if (aValue < bValue) return -1 * order;
        if (aValue > bValue) return 1 * order;
        return 0;
      });

      // Apply pagination
      const offset = (page - 1) * limit;
      const paginatedUsers = filteredUsers.slice(offset, offset + limit);

      const response: PaginatedResponse<User> = {
        success: true,
        data: paginatedUsers,
        pagination: {
          page,
          limit,
          total: filteredUsers.length,
          pages: Math.ceil(filteredUsers.length / limit),
        },
      };

      res.json(response);
    });

    // GET /api/users/:id - Get single user
    this.app.get('/api/users/:id', (req, res) => {
      const user = this.database.users.find(u => u.id === req.params.id);

      if (!user) {
        return res.status(404).json({
          success: false,
          error: 'User not found',
        } as ApiResponse);
      }

      res.json({
        success: true,
        data: user,
      } as ApiResponse<User>);
    });

    // POST /api/users - Create user
    this.app.post('/api/users', (req, res) => {
      const userData = req.body as CreateUserRequest;

      // Validate required fields
      if (!userData.name || !userData.email) {
        return res.status(400).json({
          success: false,
          error: 'Name and email are required',
        } as ApiResponse);
      }

      // Check if email already exists
      const existingUser = this.database.users.find(u => u.email === userData.email);
      if (existingUser) {
        return res.status(409).json({
          success: false,
          error: 'Email already exists',
        } as ApiResponse);
      }

      // Create new user
      const newUser: User = {
        id: this.database.nextUserId.toString(),
        name: userData.name,
        email: userData.email,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      this.database.users.push(newUser);
      this.database.nextUserId++;

      res.status(201).json({
        success: true,
        data: newUser,
        message: 'User created successfully',
      } as ApiResponse<User>);
    });

    // PUT /api/users/:id - Update user
    this.app.put('/api/users/:id', (req, res) => {
      const userIndex = this.database.users.findIndex(u => u.id === req.params.id);

      if (userIndex === -1) {
        return res.status(404).json({
          success: false,
          error: 'User not found',
        } as ApiResponse);
      }

      const updateData = req.body as UpdateUserRequest;
      const updatedUser = {
        ...this.database.users[userIndex],
        ...updateData,
        updatedAt: new Date(),
      };

      this.database.users[userIndex] = updatedUser;

      res.json({
        success: true,
        data: updatedUser,
        message: 'User updated successfully',
      } as ApiResponse<User>);
    });

    // DELETE /api/users/:id - Delete user
    this.app.delete('/api/users/:id', (req, res) => {
      const userIndex = this.database.users.findIndex(u => u.id === req.params.id);

      if (userIndex === -1) {
        return res.status(404).json({
          success: false,
          error: 'User not found',
        } as ApiResponse);
      }

      this.database.users.splice(userIndex, 1);

      res.json({
        success: true,
        message: 'User deleted successfully',
      } as ApiResponse);
    });
  }

  private setupPostRoutes(): void {
    // GET /api/posts
    this.app.get('/api/posts', (req, res) => {
      const page = parseInt(req.query.page as string) || 1;
      const limit = parseInt(req.query.limit as string) || 10;
      const authorId = req.query.authorId as string;

      let filteredPosts = [...this.database.posts];

      if (authorId) {
        filteredPosts = filteredPosts.filter(post => post.authorId === authorId);
      }

      const offset = (page - 1) * limit;
      const paginatedPosts = filteredPosts.slice(offset, offset + limit);

      res.json({
        success: true,
        data: paginatedPosts,
        pagination: {
          page,
          limit,
          total: filteredPosts.length,
          pages: Math.ceil(filteredPosts.length / limit),
        },
      });
    });

    // GET /api/posts/:id
    this.app.get('/api/posts/:id', (req, res) => {
      const post = this.database.posts.find(p => p.id === req.params.id);

      if (!post) {
        return res.status(404).json({
          success: false,
          error: 'Post not found',
        });
      }

      res.json({
        success: true,
        data: post,
      });
    });

    // POST /api/posts
    this.app.post('/api/posts', (req, res) => {
      const { title, content, authorId } = req.body;

      if (!title || !content || !authorId) {
        return res.status(400).json({
          success: false,
          error: 'Title, content, and authorId are required',
        });
      }

      const newPost = {
        id: this.database.nextPostId.toString(),
        title,
        content,
        authorId,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      this.database.posts.push(newPost);
      this.database.nextPostId++;

      res.status(201).json({
        success: true,
        data: newPost,
        message: 'Post created successfully',
      });
    });
  }

  private setupGenericRoutes(): void {
    // Generic endpoints for testing different response types
    this.app.get('/api/test/success', (req, res) => {
      res.json({ success: true, message: 'Test successful' });
    });

    this.app.get('/api/test/error', (req, res) => {
      res.status(500).json({ success: false, error: 'Test error' });
    });

    this.app.get('/api/test/slow', (req, res) => {
      setTimeout(() => {
        res.json({ success: true, message: 'Slow response' });
      }, 2000);
    });

    this.app.get('/api/test/large-response', (req, res) => {
      const largeData = Array.from({ length: 1000 }, (_, i) => ({
        id: i,
        data: `Item ${i}`,
        timestamp: new Date().toISOString(),
      }));

      res.json({
        success: true,
        data: largeData,
      });
    });

    // File upload endpoint
    this.app.post('/api/upload', (req, res) => {
      // Mock file upload
      res.json({
        success: true,
        data: {
          filename: 'mock-file.txt',
          size: 1024,
          url: '/files/mock-file.txt',
        },
        message: 'File uploaded successfully',
      });
    });

    // WebSocket-like long polling endpoint
    this.app.get('/api/poll', (req, res) => {
      const timeout = parseInt(req.query.timeout as string) || 30000;
      
      setTimeout(() => {
        res.json({
          success: true,
          data: {
            timestamp: new Date().toISOString(),
            message: 'Polling response',
          },
        });
      }, Math.min(timeout, 30000));
    });
  }

  private setupErrorHandling(): void {
    // 404 handler
    this.app.use('*', (req, res) => {
      res.status(404).json({
        success: false,
        error: 'Endpoint not found',
        path: req.originalUrl,
      });
    });

    // Error handler
    this.app.use((err: Error, req: express.Request, res: express.Response, next: express.NextFunction) => {
      console.error('[MockAPI Error]', err);
      
      res.status(500).json({
        success: false,
        error: 'Internal server error',
        message: err.message,
      });
    });
  }

  /**
   * Start the mock server
   */
  async start(): Promise<void> {
    return new Promise((resolve, reject) => {
      this.server = this.app.listen(this.config.port, this.config.host, () => {
        console.log(`Mock API server running on http://${this.config.host}:${this.config.port}`);
        resolve();
      });

      this.server.on('error', reject);
    });
  }

  /**
   * Stop the mock server
   */
  async stop(): Promise<void> {
    if (this.server) {
      return new Promise((resolve) => {
        this.server!.close(() => {
          console.log('Mock API server stopped');
          resolve();
        });
      });
    }
  }

  /**
   * Reset the database to initial state
   */
  resetDatabase(): void {
    this.database = {
      users: [
        {
          id: '1',
          name: 'John Doe',
          email: 'john@example.com',
          createdAt: new Date('2023-01-01'),
          updatedAt: new Date('2023-01-01'),
        },
        {
          id: '2',
          name: 'Jane Smith',
          email: 'jane@example.com',
          createdAt: new Date('2023-01-02'),
          updatedAt: new Date('2023-01-02'),
        },
      ],
      posts: [],
      nextUserId: 3,
      nextPostId: 1,
    };
  }

  /**
   * Add test data to the database
   */
  seedDatabase(data: Partial<MockDatabase>): void {
    if (data.users) {
      this.database.users = [...this.database.users, ...data.users];
    }
    if (data.posts) {
      this.database.posts = [...this.database.posts, ...data.posts];
    }
    if (data.nextUserId !== undefined) {
      this.database.nextUserId = data.nextUserId;
    }
    if (data.nextPostId !== undefined) {
      this.database.nextPostId = data.nextPostId;
    }
  }

  /**
   * Get current database state
   */
  getDatabase(): MockDatabase {
    return { ...this.database };
  }

  /**
   * Get the server URL
   */
  getUrl(): string {
    return `http://${this.config.host}:${this.config.port}`;
  }

  /**
   * Configure server behavior
   */
  configure(config: Partial<MockApiServerConfig>): void {
    Object.assign(this.config, config);
  }
}

/**
 * Create and start a mock API server
 */
export async function createMockApiServer(config: MockApiServerConfig): Promise<MockApiServer> {
  const server = new MockApiServer(config);
  await server.start();
  return server;
}

/**
 * Create a mock server with predefined test scenarios
 */
export async function createTestScenarioServer(
  port: number,
  scenario: 'success' | 'slow' | 'error' | 'mixed'
): Promise<MockApiServer> {
  const config: MockApiServerConfig = {
    port,
    enableCors: true,
  };

  switch (scenario) {
    case 'slow':
      config.delayMs = 1000;
      break;
    case 'error':
      config.errorRate = 0.3; // 30% error rate
      break;
    case 'mixed':
      config.delayMs = 500;
      config.errorRate = 0.1; // 10% error rate
      break;
    default:
      // success scenario - default config
      break;
  }

  return createMockApiServer(config);
}