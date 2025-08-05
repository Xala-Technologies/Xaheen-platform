import * as fs from 'fs/promises';
import * as path from 'path';
import { execCommand, writeJsonFile, readJsonFile } from './test-helpers';
import type { Phase5TestConfig } from '../config/test-config';

export interface MonorepoProject {
  name: string;
  path: string;
  type: 'frontend' | 'backend' | 'shared';
  dependencies?: string[];
  devDependencies?: string[];
  scripts?: Record<string, string>;
}

export interface MonorepoWorkspace {
  root: string;
  projects: MonorepoProject[];
  packageManager: 'npm' | 'yarn' | 'pnpm' | 'bun';
}

/**
 * Create a monorepo workspace with the specified configuration
 */
export async function createMonorepoWorkspace(
  baseDir: string,
  config: Phase5TestConfig
): Promise<MonorepoWorkspace> {
  const workspaceRoot = path.join(baseDir, config.workspace.workspaceRoot);
  
  // Create directory structure
  await fs.mkdir(workspaceRoot, { recursive: true });
  
  const projects: MonorepoProject[] = [
    {
      name: '@test-workspace/frontend',
      path: config.workspace.packages.frontend,
      type: 'frontend',
      dependencies: [
        'react',
        'react-dom',
        'next',
        '@test-workspace/shared',
      ],
      devDependencies: [
        '@types/react',
        '@types/react-dom',
        'typescript',
        'eslint',
        'prettier',
      ],
      scripts: {
        dev: 'next dev',
        build: 'next build',
        start: 'next start',
        test: 'bun test',
        lint: 'eslint . --ext .ts,.tsx',
        'type-check': 'tsc --noEmit',
      },
    },
    {
      name: '@test-workspace/backend',
      path: config.workspace.packages.backend,
      type: 'backend',
      dependencies: [
        'express',
        'cors',
        'helmet',
        '@test-workspace/shared',
      ],
      devDependencies: [
        '@types/express',
        '@types/cors',
        'typescript',
        'nodemon',
        'supertest',
        '@types/supertest',
      ],
      scripts: {
        dev: 'nodemon src/index.ts',
        build: 'tsc',
        start: 'node dist/index.js',
        test: 'bun test',
        lint: 'eslint . --ext .ts',
        'type-check': 'tsc --noEmit',
      },
    },
    {
      name: '@test-workspace/shared',
      path: config.workspace.packages.shared,
      type: 'shared',
      dependencies: [
        'zod',
        'date-fns',
      ],
      devDependencies: [
        'typescript',
        '@types/node',
      ],
      scripts: {
        build: 'tsc',
        test: 'bun test',
        lint: 'eslint . --ext .ts',
        'type-check': 'tsc --noEmit',
      },
    },
  ];
  
  // Create workspace root package.json
  const rootPackageJson = {
    name: 'test-workspace',
    version: '1.0.0',
    private: true,
    workspaces: projects.map(p => p.path),
    scripts: {
      'dev:frontend': `cd ${projects[0].path} && bun run dev`,
      'dev:backend': `cd ${projects[1].path} && bun run dev`,
      'build': 'bun run build:shared && bun run build:backend && bun run build:frontend',
      'build:frontend': `cd ${projects[0].path} && bun run build`,
      'build:backend': `cd ${projects[1].path} && bun run build`,
      'build:shared': `cd ${projects[2].path} && bun run build`,
      'test': 'bun run test:all',
      'test:all': projects.map(p => `cd ${p.path} && bun test`).join(' && '),
      'lint': 'bun run lint:all',
      'lint:all': projects.map(p => `cd ${p.path} && bun run lint`).join(' && '),
      'type-check': 'bun run type-check:all',
      'type-check:all': projects.map(p => `cd ${p.path} && bun run type-check`).join(' && '),
      'clean': 'bun run clean:all',
      'clean:all': projects.map(p => `cd ${p.path} && rm -rf dist node_modules .next`).join(' && '),
      'start:dev': 'concurrently "bun run dev:backend" "bun run dev:frontend"',
    },
    devDependencies: {
      'typescript': '^5.0.0',
      '@types/node': '^20.0.0',
      'concurrently': '^8.0.0',
      'rimraf': '^5.0.0',
    },
  };
  
  await writeJsonFile(path.join(workspaceRoot, 'package.json'), rootPackageJson);
  
  // Create TypeScript config for workspace
  const rootTsConfig = {
    compilerOptions: {
      target: 'ES2022',
      module: 'ESNext',
      moduleResolution: 'bundler',
      allowSyntheticDefaultImports: true,
      esModuleInterop: true,
      allowJs: true,
      strict: true,
      noEmit: true,
      skipLibCheck: true,
      resolveJsonModule: true,
      isolatedModules: true,
      incremental: true,
      baseUrl: '.',
      paths: {
        '@test-workspace/shared': ['./packages/shared/src'],
        '@test-workspace/shared/*': ['./packages/shared/src/*'],
      },
    },
    references: [
      { path: './packages/shared' },
      { path: './packages/backend' },
      { path: './packages/frontend' },
    ],
  };
  
  await writeJsonFile(path.join(workspaceRoot, 'tsconfig.json'), rootTsConfig);
  
  // Create individual project packages
  for (const project of projects) {
    await createProjectPackage(workspaceRoot, project);
  }
  
  return {
    root: workspaceRoot,
    projects,
    packageManager: config.workspace.packageManager,
  };
}

/**
 * Create an individual project package within the workspace
 */
async function createProjectPackage(
  workspaceRoot: string,
  project: MonorepoProject
): Promise<void> {
  const projectPath = path.join(workspaceRoot, project.path);
  
  // Create project directory structure
  await fs.mkdir(projectPath, { recursive: true });
  await fs.mkdir(path.join(projectPath, 'src'), { recursive: true });
  
  // Create package.json for the project
  const packageJson = {
    name: project.name,
    version: '1.0.0',
    private: true,
    main: project.type === 'shared' ? 'dist/index.js' : undefined,
    types: project.type === 'shared' ? 'dist/index.d.ts' : undefined,
    scripts: project.scripts,
    dependencies: project.dependencies?.reduce((acc, dep) => {
      acc[dep] = dep.startsWith('@test-workspace/') ? 'workspace:*' : 'latest';
      return acc;
    }, {} as Record<string, string>) || {},
    devDependencies: project.devDependencies?.reduce((acc, dep) => {
      acc[dep] = 'latest';
      return acc;
    }, {} as Record<string, string>) || {},
  };
  
  await writeJsonFile(path.join(projectPath, 'package.json'), packageJson);
  
  // Create TypeScript config for the project
  const tsConfig = {
    extends: project.type === 'frontend' ? 'next/tsconfig.json' : '../../tsconfig.json',
    compilerOptions: {
      ...(project.type === 'shared' && {
        outDir: 'dist',
        declaration: true,
        declarationMap: true,
        composite: true,
      }),
      ...(project.type === 'backend' && {
        outDir: 'dist',
        noEmit: false,
        composite: true,
      }),
      ...(project.type === 'frontend' && {
        jsx: 'preserve',
        allowJs: true,
        plugins: [{ name: 'next' }],
        paths: {
          '@/*': ['./src/*'],
          '@test-workspace/shared': ['../shared/src'],
        },
      }),
    },
    include: [
      'src/**/*',
      ...(project.type === 'frontend' ? ['.next/types/**/*.ts'] : []),
    ],
    exclude: ['node_modules', 'dist'],
  };
  
  await writeJsonFile(path.join(projectPath, 'tsconfig.json'), tsConfig);
  
  // Create project-specific files
  switch (project.type) {
    case 'shared':
      await createSharedPackageFiles(projectPath);
      break;
    case 'backend':
      await createBackendPackageFiles(projectPath);
      break;
    case 'frontend':
      await createFrontendPackageFiles(projectPath);
      break;
  }
}

/**
 * Create files for the shared package
 */
async function createSharedPackageFiles(projectPath: string): Promise<void> {
  // Create index.ts
  const indexContent = `export * from './types';
export * from './utils';
export * from './constants';
`;
  await fs.writeFile(path.join(projectPath, 'src', 'index.ts'), indexContent);
  
  // Create types.ts
  const typesContent = `export interface User {
  id: string;
  name: string;
  email: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface CreateUserRequest {
  name: string;
  email: string;
}

export interface UpdateUserRequest {
  name?: string;
  email?: string;
}

export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}

export interface PaginatedResponse<T = any> extends ApiResponse<T[]> {
  pagination: {
    page: number;
    limit: number;
    total: number;
    pages: number;
  };
}
`;
  await fs.writeFile(path.join(projectPath, 'src', 'types.ts'), typesContent);
  
  // Create utils.ts
  const utilsContent = `import { z } from 'zod';

export const userSchema = z.object({
  id: z.string().uuid(),
  name: z.string().min(1).max(100),
  email: z.string().email(),
  createdAt: z.date(),
  updatedAt: z.date(),
});

export const createUserSchema = z.object({
  name: z.string().min(1).max(100),
  email: z.string().email(),
});

export const updateUserSchema = z.object({
  name: z.string().min(1).max(100).optional(),
  email: z.string().email().optional(),
});

export function isValidEmail(email: string): boolean {
  return z.string().email().safeParse(email).success;
}

export function formatDate(date: Date): string {
  return date.toISOString().split('T')[0];
}
`;
  await fs.writeFile(path.join(projectPath, 'src', 'utils.ts'), utilsContent);
  
  // Create constants.ts
  const constantsContent = `export const API_ENDPOINTS = {
  USERS: '/api/users',
  USER_BY_ID: (id: string) => \`/api/users/\${id}\`,
  AUTH: '/api/auth',
  HEALTH: '/api/health',
} as const;

export const HTTP_STATUS = {
  OK: 200,
  CREATED: 201,
  NO_CONTENT: 204,
  BAD_REQUEST: 400,
  UNAUTHORIZED: 401,
  FORBIDDEN: 403,
  NOT_FOUND: 404,
  INTERNAL_SERVER_ERROR: 500,
} as const;

export const DEFAULT_PAGE_SIZE = 10;
export const MAX_PAGE_SIZE = 100;
`;
  await fs.writeFile(path.join(projectPath, 'src', 'constants.ts'), constantsContent);
}

/**
 * Create files for the backend package
 */
async function createBackendPackageFiles(projectPath: string): Promise<void> {
  // Create main index.ts
  const indexContent = `import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import { userRouter } from './routes/users';
import { authRouter } from './routes/auth';
import { healthRouter } from './routes/health';

const app = express();
const PORT = process.env.PORT || 8000;

// Middleware
app.use(helmet());
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Routes
app.use('/api/health', healthRouter);
app.use('/api/auth', authRouter);
app.use('/api/users', userRouter);

// Error handling middleware
app.use((err: Error, req: express.Request, res: express.Response, next: express.NextFunction) => {
  console.error(err.stack);
  res.status(500).json({ success: false, error: 'Internal server error' });
});

// 404 handler
app.use('*', (req, res) => {
  res.status(404).json({ success: false, error: 'Route not found' });
});

if (require.main === module) {
  app.listen(PORT, () => {
    console.log(\`Server running on port \${PORT}\`);
  });
}

export default app;
`;
  await fs.writeFile(path.join(projectPath, 'src', 'index.ts'), indexContent);
  
  // Create routes directory
  await fs.mkdir(path.join(projectPath, 'src', 'routes'), { recursive: true });
  
  // Create health router
  const healthRouterContent = `import { Router } from 'express';

const router = Router();

router.get('/', (req, res) => {
  res.json({ 
    success: true, 
    message: 'Server is healthy',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
  });
});

export { router as healthRouter };
`;
  await fs.writeFile(path.join(projectPath, 'src', 'routes', 'health.ts'), healthRouterContent);
  
  // Create auth router
  const authRouterContent = `import { Router } from 'express';
import type { ApiResponse } from '@test-workspace/shared';

const router = Router();

interface AuthResponse extends ApiResponse<{ token: string; user: any }> {}

router.post('/login', (req, res) => {
  const { email, password } = req.body;
  
  // Mock authentication logic
  if (!email || !password) {
    return res.status(400).json({
      success: false,
      error: 'Email and password are required',
    } as ApiResponse);
  }
  
  // Mock successful authentication
  const response: AuthResponse = {
    success: true,
    data: {
      token: 'mock-jwt-token',
      user: {
        id: '1',
        name: 'Test User',
        email,
      },
    },
    message: 'Authentication successful',
  };
  
  res.json(response);
});

router.post('/logout', (req, res) => {
  res.json({
    success: true,
    message: 'Logged out successfully',
  } as ApiResponse);
});

export { router as authRouter };
`;
  await fs.writeFile(path.join(projectPath, 'src', 'routes', 'auth.ts'), authRouterContent);
  
  // Create users router
  const usersRouterContent = `import { Router } from 'express';
import type { User, CreateUserRequest, UpdateUserRequest, ApiResponse, PaginatedResponse } from '@test-workspace/shared';
import { createUserSchema, updateUserSchema } from '@test-workspace/shared';

const router = Router();

// Mock database
let users: User[] = [
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
];

let nextId = 3;

// GET /api/users
router.get('/', (req, res) => {
  const page = parseInt(req.query.page as string) || 1;
  const limit = parseInt(req.query.limit as string) || 10;
  const offset = (page - 1) * limit;
  
  const paginatedUsers = users.slice(offset, offset + limit);
  
  const response: PaginatedResponse<User> = {
    success: true,
    data: paginatedUsers,
    pagination: {
      page,
      limit,
      total: users.length,
      pages: Math.ceil(users.length / limit),
    },
  };
  
  res.json(response);
});

// GET /api/users/:id
router.get('/:id', (req, res) => {
  const user = users.find(u => u.id === req.params.id);
  
  if (!user) {
    return res.status(404).json({
      success: false,
      error: 'User not found',
    } as ApiResponse);
  }
  
  const response: ApiResponse<User> = {
    success: true,
    data: user,
  };
  
  res.json(response);
});

// POST /api/users
router.post('/', (req, res) => {
  const validation = createUserSchema.safeParse(req.body);
  
  if (!validation.success) {
    return res.status(400).json({
      success: false,
      error: 'Invalid user data',
      message: validation.error.errors.map(e => e.message).join(', '),
    } as ApiResponse);
  }
  
  const userData = validation.data;
  const newUser: User = {
    id: nextId.toString(),
    name: userData.name,
    email: userData.email,
    createdAt: new Date(),
    updatedAt: new Date(),
  };
  
  users.push(newUser);
  nextId++;
  
  const response: ApiResponse<User> = {
    success: true,
    data: newUser,
    message: 'User created successfully',
  };
  
  res.status(201).json(response);
});

// PUT /api/users/:id
router.put('/:id', (req, res) => {
  const userIndex = users.findIndex(u => u.id === req.params.id);
  
  if (userIndex === -1) {
    return res.status(404).json({
      success: false,
      error: 'User not found',
    } as ApiResponse);
  }
  
  const validation = updateUserSchema.safeParse(req.body);
  
  if (!validation.success) {
    return res.status(400).json({
      success: false,
      error: 'Invalid user data',
      message: validation.error.errors.map(e => e.message).join(', '),
    } as ApiResponse);
  }
  
  const userData = validation.data;
  const updatedUser = {
    ...users[userIndex],
    ...userData,
    updatedAt: new Date(),
  };
  
  users[userIndex] = updatedUser;
  
  const response: ApiResponse<User> = {
    success: true,
    data: updatedUser,
    message: 'User updated successfully',
  };
  
  res.json(response);
});

// DELETE /api/users/:id
router.delete('/:id', (req, res) => {
  const userIndex = users.findIndex(u => u.id === req.params.id);
  
  if (userIndex === -1) {
    return res.status(404).json({
      success: false,
      error: 'User not found',
    } as ApiResponse);
  }
  
  users.splice(userIndex, 1);
  
  const response: ApiResponse = {
    success: true,
    message: 'User deleted successfully',
  };
  
  res.json(response);
});

export { router as userRouter };
`;
  await fs.writeFile(path.join(projectPath, 'src', 'routes', 'users.ts'), usersRouterContent);
}

/**
 * Create files for the frontend package
 */
async function createFrontendPackageFiles(projectPath: string): Promise<void> {
  // Create Next.js config
  const nextConfigContent = `/** @type {import('next').NextConfig} */
const nextConfig = {
  experimental: {
    transpilePackages: ['@test-workspace/shared'],
  },
  env: {
    NEXT_PUBLIC_API_URL: process.env.API_URL || 'http://localhost:8000',
  },
};

module.exports = nextConfig;
`;
  await fs.writeFile(path.join(projectPath, 'next.config.js'), nextConfigContent);
  
  // Create app directory for Next.js 13+ app router
  await fs.mkdir(path.join(projectPath, 'src', 'app'), { recursive: true });
  
  // Create layout.tsx
  const layoutContent = `import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Test Frontend App',
  description: 'A test frontend application for Phase 5 testing',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>
        <div className="min-h-screen bg-gray-50">
          <header className="bg-white shadow">
            <div className="max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8">
              <h1 className="text-3xl font-bold text-gray-900">
                Test Frontend
              </h1>
            </div>
          </header>
          <main className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
            {children}
          </main>
        </div>
      </body>
    </html>
  );
}
`;
  await fs.writeFile(path.join(projectPath, 'src', 'app', 'layout.tsx'), layoutContent);
  
  // Create page.tsx
  const pageContent = `'use client';

import { useEffect, useState } from 'react';
import { UserList } from '../components/UserList';
import { CreateUserForm } from '../components/CreateUserForm';
import type { User } from '@test-workspace/shared';

export default function HomePage() {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchUsers = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await fetch(\`\${process.env.NEXT_PUBLIC_API_URL}/api/users\`);
      const data = await response.json();
      
      if (data.success) {
        setUsers(data.data);
      } else {
        setError(data.error || 'Failed to fetch users');
      }
    } catch (error) {
      setError('Network error occurred');
      console.error('Error fetching users:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const handleUserCreated = (newUser: User) => {
    setUsers(prev => [...prev, newUser]);
  };

  const handleUserDeleted = (userId: string) => {
    setUsers(prev => prev.filter(user => user.id !== userId));
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-gray-900"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded relative">
        <strong className="font-bold">Error: </strong>
        <span className="block sm:inline">{error}</span>
        <button
          onClick={fetchUsers}
          className="mt-2 bg-red-100 hover:bg-red-200 text-red-800 px-3 py-1 rounded text-sm"
        >
          Retry
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <div>
        <h2 className="text-2xl font-bold text-gray-900 mb-4">Create New User</h2>
        <CreateUserForm onUserCreated={handleUserCreated} />
      </div>
      
      <div>
        <h2 className="text-2xl font-bold text-gray-900 mb-4">Users</h2>
        <UserList users={users} onUserDeleted={handleUserDeleted} />
      </div>
    </div>
  );
}
`;
  await fs.writeFile(path.join(projectPath, 'src', 'app', 'page.tsx'), pageContent);
  
  // Create components directory
  await fs.mkdir(path.join(projectPath, 'src', 'components'), { recursive: true });
  
  // Create UserList component
  const userListContent = `'use client';

import type { User } from '@test-workspace/shared';

interface UserListProps {
  users: User[];
  onUserDeleted: (userId: string) => void;
}

export function UserList({ users, onUserDeleted }: UserListProps) {
  const deleteUser = async (userId: string) => {
    try {
      const response = await fetch(\`\${process.env.NEXT_PUBLIC_API_URL}/api/users/\${userId}\`, {
        method: 'DELETE',
      });
      
      const data = await response.json();
      
      if (data.success) {
        onUserDeleted(userId);
      } else {
        alert(\`Failed to delete user: \${data.error}\`);
      }
    } catch (error) {
      alert('Network error occurred while deleting user');
      console.error('Error deleting user:', error);
    }
  };

  if (users.length === 0) {
    return (
      <div className="text-center py-8 text-gray-500">
        No users found. Create one to get started.
      </div>
    );
  }

  return (
    <div className="bg-white shadow overflow-hidden sm:rounded-md">
      <ul className="divide-y divide-gray-200">
        {users.map((user) => (
          <li key={user.id} className="px-6 py-4">
            <div className="flex items-center justify-between">
              <div className="flex-1">
                <div className="text-sm font-medium text-gray-900">
                  {user.name}
                </div>
                <div className="text-sm text-gray-500">
                  {user.email}
                </div>
                <div className="text-xs text-gray-400">
                  Created: {new Date(user.createdAt).toLocaleDateString()}
                </div>
              </div>
              <button
                onClick={() => deleteUser(user.id)}
                className="ml-4 bg-red-600 hover:bg-red-700 text-white px-3 py-1 rounded text-sm"
              >
                Delete
              </button>
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
}
`;
  await fs.writeFile(path.join(projectPath, 'src', 'components', 'UserList.tsx'), userListContent);
  
  // Create CreateUserForm component
  const createUserFormContent = `'use client';

import { useState } from 'react';
import type { User, CreateUserRequest } from '@test-workspace/shared';
import { isValidEmail } from '@test-workspace/shared';

interface CreateUserFormProps {
  onUserCreated: (user: User) => void;
}

export function CreateUserForm({ onUserCreated }: CreateUserFormProps) {
  const [formData, setFormData] = useState<CreateUserRequest>({
    name: '',
    email: '',
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Client-side validation
    if (!formData.name.trim()) {
      setError('Name is required');
      return;
    }
    
    if (!formData.email.trim()) {
      setError('Email is required');
      return;
    }
    
    if (!isValidEmail(formData.email)) {
      setError('Please enter a valid email address');
      return;
    }
    
    setIsSubmitting(true);
    setError(null);
    
    try {
      const response = await fetch(\`\${process.env.NEXT_PUBLIC_API_URL}/api/users\`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });
      
      const data = await response.json();
      
      if (data.success) {
        onUserCreated(data.data);
        setFormData({ name: '', email: '' });
      } else {
        setError(data.error || 'Failed to create user');
      }
    } catch (error) {
      setError('Network error occurred');
      console.error('Error creating user:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="bg-white shadow sm:rounded-lg p-6">
      {error && (
        <div className="mb-4 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
          {error}
        </div>
      )}
      
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <div>
          <label htmlFor="name" className="block text-sm font-medium text-gray-700">
            Name
          </label>
          <input
            type="text"
            id="name"
            value={formData.name}
            onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
            className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
            placeholder="Enter user name"
            disabled={isSubmitting}
          />
        </div>
        
        <div>
          <label htmlFor="email" className="block text-sm font-medium text-gray-700">
            Email
          </label>
          <input
            type="email"
            id="email"
            value={formData.email}
            onChange={(e) => setFormData(prev => ({ ...prev, email: e.target.value }))}
            className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
            placeholder="Enter email address"
            disabled={isSubmitting}
          />
        </div>
      </div>
      
      <div className="mt-4">
        <button
          type="submit"
          disabled={isSubmitting}
          className="inline-flex justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50"
        >
          {isSubmitting ? 'Creating...' : 'Create User'}
        </button>
      </div>
    </form>
  );
}
`;
  await fs.writeFile(path.join(projectPath, 'src', 'components', 'CreateUserForm.tsx'), createUserFormContent);
  
  // Create Tailwind CSS config
  const tailwindConfigContent = `/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {},
  },
  plugins: [],
};
`;
  await fs.writeFile(path.join(projectPath, 'tailwind.config.js'), tailwindConfigContent);
  
  // Create global CSS
  await fs.mkdir(path.join(projectPath, 'src', 'styles'), { recursive: true });
  const globalCssContent = `@tailwind base;
@tailwind components;
@tailwind utilities;

@layer base {
  html {
    font-family: system-ui, sans-serif;
  }
}
`;
  await fs.writeFile(path.join(projectPath, 'src', 'styles', 'globals.css'), globalCssContent);
}

/**
 * Install dependencies for the workspace
 */
export async function installWorkspaceDependencies(
  workspace: MonorepoWorkspace
): Promise<void> {
  const { packageManager } = workspace;
  
  // Install root dependencies
  const installCommand = packageManager === 'npm' 
    ? 'npm install' 
    : packageManager === 'yarn'
    ? 'yarn install'
    : packageManager === 'pnpm'
    ? 'pnpm install'
    : 'bun install';
  
  await execCommand(installCommand, { cwd: workspace.root });
}

/**
 * Build all packages in the workspace
 */
export async function buildWorkspace(workspace: MonorepoWorkspace): Promise<void> {
  await execCommand('bun run build', { cwd: workspace.root });
}

/**
 * Run tests for all packages in the workspace
 */
export async function testWorkspace(workspace: MonorepoWorkspace): Promise<void> {
  await execCommand('bun run test', { cwd: workspace.root });
}

/**
 * Start development servers for frontend and backend
 */
export async function startWorkspaceDev(
  workspace: MonorepoWorkspace
): Promise<{ frontend: any; backend: any }> {
  const frontendProcess = await execCommand('bun run dev:frontend', { 
    cwd: workspace.root,
  });
  
  const backendProcess = await execCommand('bun run dev:backend', { 
    cwd: workspace.root,
  });
  
  return {
    frontend: frontendProcess,
    backend: backendProcess,
  };
}