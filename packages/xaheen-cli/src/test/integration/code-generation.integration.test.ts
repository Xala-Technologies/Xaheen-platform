/**
 * Integration Tests for Code Generation
 * 
 * Tests the complete code generation workflow including AI integration,
 * template processing, and file system operations.
 */

import { describe, it, expect, beforeEach, afterEach, vi } from "vitest";
import fs from "fs-extra";
import path from "node:path";
import { testUtils } from "../test-helpers.js";
import tmp from "tmp";

describe("Code Generation Integration", () => {
  let testDir: string;
  let originalCwd: string;
  let cleanup: () => void;

  beforeEach(async () => {
    originalCwd = process.cwd();
    
    // Create temporary test directory
    const result = tmp.dirSync({ prefix: "xaheen-codegen-test-", unsafeCleanup: true });
    testDir = result.name;
    cleanup = result.removeCallback;
    
    // Change to test directory
    process.chdir(testDir);
  });

  afterEach(async () => {
    // Restore original working directory
    process.chdir(originalCwd);
    
    // Clean up temporary directory
    if (cleanup) {
      cleanup();
    }
  });

  describe("Component Generation", () => {
    it("should generate a complete React component with all files", async () => {
      const projectName = "test-component-gen";
      const projectPath = path.join(testDir, projectName);
      
      // Create base Next.js project
      await testUtils.fixtures.createFixtureProject("nextjs-project", projectPath);
      process.chdir(projectPath);
      
      const componentName = "UserCard";
      const componentDir = path.join(projectPath, "src", "components", componentName);
      
      // Generate component with all associated files
      await fs.ensureDir(componentDir);
      
      // Main component file
      await fs.writeFile(
        path.join(componentDir, "index.tsx"),
        `import React from 'react';
import { UserCardProps } from './types';
import { useUserCard } from './hooks';
import './styles.css';

export const UserCard = ({
  user,
  onEdit,
  onDelete,
  variant = 'default'
}: UserCardProps): JSX.Element => {
  const { isLoading, handleEdit, handleDelete } = useUserCard({
    user,
    onEdit,
    onDelete
  });

  if (isLoading) {
    return (
      <div className="user-card user-card--loading" role="status" aria-label="Loading user information">
        <div className="user-card__skeleton">
          <div className="skeleton skeleton--avatar"></div>
          <div className="skeleton skeleton--text"></div>
          <div className="skeleton skeleton--text"></div>
        </div>
      </div>
    );
  }

  return (
    <article 
      className={\`user-card user-card--\${variant}\`}
      role="article"
      aria-labelledby={\`user-name-\${user.id}\`}
    >
      <div className="user-card__header">
        <img
          src={user.avatar || '/default-avatar.png'}
          alt={\`\${user.name}'s profile picture\`}
          className="user-card__avatar"
          loading="lazy"
        />
        <div className="user-card__info">
          <h3 id={\`user-name-\${user.id}\`} className="user-card__name">
            {user.name}
          </h3>
          <p className="user-card__email">{user.email}</p>
          {user.role && (
            <span className="user-card__role" aria-label={\`Role: \${user.role}\`}>
              {user.role}
            </span>
          )}
        </div>
      </div>
      
      <div className="user-card__actions">
        <button
          onClick={handleEdit}
          className="user-card__button user-card__button--edit"
          aria-label={\`Edit \${user.name}'s profile\`}
          disabled={isLoading}
        >
          Edit
        </button>
        <button
          onClick={handleDelete}
          className="user-card__button user-card__button--delete"
          aria-label={\`Delete \${user.name}'s profile\`}
          disabled={isLoading}
        >
          Delete
        </button>
      </div>
    </article>
  );
};

export { UserCardProps } from './types';
export { useUserCard } from './hooks';
`
      );
      
      // Types file
      await fs.writeFile(
        path.join(componentDir, "types.ts"),
        `export interface User {
  readonly id: string;
  readonly name: string;
  readonly email: string;
  readonly avatar?: string;
  readonly role?: string;
  readonly createdAt: Date;
  readonly updatedAt: Date;
}

export interface UserCardProps {
  readonly user: User;
  readonly variant?: 'default' | 'compact' | 'detailed';
  readonly onEdit?: (user: User) => void;
  readonly onDelete?: (user: User) => void;
}

export interface UseUserCardProps {
  readonly user: User;
  readonly onEdit?: (user: User) => void;
  readonly onDelete?: (user: User) => void;
}

export interface UseUserCardReturn {
  readonly isLoading: boolean;
  readonly handleEdit: () => void;
  readonly handleDelete: () => void;
}
`
      );
      
      // Custom hook
      await fs.writeFile(
        path.join(componentDir, "hooks.ts"),
        `import { useState, useCallback } from 'react';
import type { UseUserCardProps, UseUserCardReturn } from './types';

export const useUserCard = ({
  user,
  onEdit,
  onDelete
}: UseUserCardProps): UseUserCardReturn => {
  const [isLoading, setIsLoading] = useState(false);

  const handleEdit = useCallback(async () => {
    if (!onEdit || isLoading) return;
    
    setIsLoading(true);
    try {
      await onEdit(user);
    } catch (error) {
      console.error('Failed to edit user:', error);
    } finally {
      setIsLoading(false);
    }
  }, [user, onEdit, isLoading]);

  const handleDelete = useCallback(async () => {
    if (!onDelete || isLoading) return;
    
    const confirmed = window.confirm(
      \`Are you sure you want to delete \${user.name}? This action cannot be undone.\`
    );
    
    if (!confirmed) return;
    
    setIsLoading(true);
    try {
      await onDelete(user);
    } catch (error) {
      console.error('Failed to delete user:', error);
    } finally {
      setIsLoading(false);
    }
  }, [user, onDelete, isLoading]);

  return {
    isLoading,
    handleEdit,
    handleDelete
  };
};
`
      );
      
      // CSS styles
      await fs.writeFile(
        path.join(componentDir, "styles.css"),
        `.user-card {
  display: flex;
  flex-direction: column;
  padding: 1.5rem;
  background: white;
  border-radius: 0.75rem;
  box-shadow: 0 1px 3px 0 rgba(0, 0, 0, 0.1), 0 1px 2px 0 rgba(0, 0, 0, 0.06);
  transition: box-shadow 0.2s ease-in-out;
  max-width: 320px;
}

.user-card:hover {
  box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06);
}

.user-card--compact {
  padding: 1rem;
  max-width: 280px;
}

.user-card--detailed {
  padding: 2rem;
  max-width: 400px;
}

.user-card--loading {
  opacity: 0.7;
  pointer-events: none;
}

.user-card__header {
  display: flex;
  align-items: center;
  gap: 1rem;
  margin-bottom: 1rem;
}

.user-card__avatar {
  width: 3rem;
  height: 3rem;
  border-radius: 50%;
  object-fit: cover;
  border: 2px solid #e5e7eb;
}

.user-card__info {
  flex: 1;
  min-width: 0;
}

.user-card__name {
  font-size: 1.125rem;
  font-weight: 600;
  color: #1f2937;
  margin: 0 0 0.25rem 0;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.user-card__email {
  font-size: 0.875rem;
  color: #6b7280;
  margin: 0 0 0.5rem 0;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.user-card__role {
  display: inline-block;
  font-size: 0.75rem;
  font-weight: 500;
  color: #3b82f6;
  background-color: #dbeafe;
  padding: 0.25rem 0.5rem;
  border-radius: 0.375rem;
  text-transform: capitalize;
}

.user-card__actions {
  display: flex;
  gap: 0.5rem;
  margin-top: auto;
}

.user-card__button {
  flex: 1;
  padding: 0.5rem 1rem;
  border: 1px solid #d1d5db;
  border-radius: 0.375rem;
  background-color: white;
  font-size: 0.875rem;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s ease-in-out;
}

.user-card__button:hover:not(:disabled) {
  background-color: #f9fafb;
  border-color: #9ca3af;
}

.user-card__button:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.user-card__button--edit {
  color: #3b82f6;
  border-color: #3b82f6;
}

.user-card__button--edit:hover:not(:disabled) {
  background-color: #eff6ff;
}

.user-card__button--delete {
  color: #ef4444;
  border-color: #ef4444;
}

.user-card__button--delete:hover:not(:disabled) {
  background-color: #fef2f2;
}

.user-card__skeleton {
  display: flex;
  align-items: center;
  gap: 1rem;
  animation: pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite;
}

.skeleton {
  background-color: #e5e7eb;
  border-radius: 0.25rem;
}

.skeleton--avatar {
  width: 3rem;
  height: 3rem;
  border-radius: 50%;
}

.skeleton--text {
  height: 1rem;
  width: 100%;
  margin-bottom: 0.5rem;
}

.skeleton--text:last-child {
  width: 60%;
  margin-bottom: 0;
}

@keyframes pulse {
  0%, 100% {
    opacity: 1;
  }
  50% {
    opacity: 0.5;
  }
}

/* Responsive design */
@media (max-width: 640px) {
  .user-card {
    max-width: 100%;
  }
  
  .user-card__header {
    flex-direction: column;
    align-items: flex-start;
    text-align: center;
  }
  
  .user-card__actions {
    flex-direction: column;
  }
}

/* High contrast mode support */
@media (prefers-contrast: high) {
  .user-card {
    border: 2px solid #000;
  }
  
  .user-card__button {
    border-width: 2px;
  }
}

/* Reduced motion support */
@media (prefers-reduced-motion: reduce) {
  .user-card,
  .user-card__button,
  .skeleton {
    transition: none;
    animation: none;
  }
}
`
      );
      
      // Test file
      await fs.ensureDir(path.join(componentDir, "__tests__"));
      await fs.writeFile(
        path.join(componentDir, "__tests__", "UserCard.test.tsx"),
        `import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { UserCard } from '../index';
import type { User } from '../types';

const mockUser: User = {
  id: '1',
  name: 'John Doe',
  email: 'john.doe@example.com',
  avatar: 'https://example.com/avatar.jpg',
  role: 'admin',
  createdAt: new Date('2023-01-01'),
  updatedAt: new Date('2023-01-01'),
};

describe('UserCard', () => {
  it('renders user information correctly', () => {
    render(<UserCard user={mockUser} />);
    
    expect(screen.getByText('John Doe')).toBeInTheDocument();
    expect(screen.getByText('john.doe@example.com')).toBeInTheDocument();
    expect(screen.getByText('admin')).toBeInTheDocument();
    
    const avatar = screen.getByAltText("John Doe's profile picture");
    expect(avatar).toHaveAttribute('src', 'https://example.com/avatar.jpg');
  });

  it('handles missing avatar with fallback', () => {
    const userWithoutAvatar = { ...mockUser, avatar: undefined };
    render(<UserCard user={userWithoutAvatar} />);
    
    const avatar = screen.getByAltText("John Doe's profile picture");
    expect(avatar).toHaveAttribute('src', '/default-avatar.png');
  });

  it('calls onEdit when edit button is clicked', async () => {
    const handleEdit = vi.fn().mockResolvedValue(undefined);
    render(<UserCard user={mockUser} onEdit={handleEdit} />);
    
    const editButton = screen.getByLabelText("Edit John Doe's profile");
    fireEvent.click(editButton);
    
    await waitFor(() => {
      expect(handleEdit).toHaveBeenCalledWith(mockUser);
    });
  });

  it('calls onDelete when delete button is clicked and confirmed', async () => {
    const handleDelete = vi.fn().mockResolvedValue(undefined);
    // Mock window.confirm to return true
    const confirmSpy = vi.spyOn(window, 'confirm').mockReturnValue(true);
    
    render(<UserCard user={mockUser} onDelete={handleDelete} />);
    
    const deleteButton = screen.getByLabelText("Delete John Doe's profile");
    fireEvent.click(deleteButton);
    
    await waitFor(() => {
      expect(handleDelete).toHaveBeenCalledWith(mockUser);
    });
    
    confirmSpy.mockRestore();
  });

  it('does not call onDelete when delete is not confirmed', async () => {
    const handleDelete = vi.fn();
    // Mock window.confirm to return false
    const confirmSpy = vi.spyOn(window, 'confirm').mockReturnValue(false);
    
    render(<UserCard user={mockUser} onDelete={handleDelete} />);
    
    const deleteButton = screen.getByLabelText("Delete John Doe's profile");
    fireEvent.click(deleteButton);
    
    await waitFor(() => {
      expect(handleDelete).not.toHaveBeenCalled();
    });
    
    confirmSpy.mockRestore();
  });

  it('applies variant classes correctly', () => {
    const { rerender } = render(<UserCard user={mockUser} variant="compact" />);
    
    expect(screen.getByRole('article')).toHaveClass('user-card--compact');
    
    rerender(<UserCard user={mockUser} variant="detailed" />);
    expect(screen.getByRole('article')).toHaveClass('user-card--detailed');
  });

  it('shows loading state correctly', async () => {
    const handleEdit = vi.fn(() => new Promise(resolve => setTimeout(resolve, 100)));
    render(<UserCard user={mockUser} onEdit={handleEdit} />);
    
    const editButton = screen.getByLabelText("Edit John Doe's profile");
    fireEvent.click(editButton);
    
    // Should show loading state
    expect(screen.getByRole('status')).toBeInTheDocument();
    expect(screen.getByLabelText('Loading user information')).toBeInTheDocument();
    
    // Wait for loading to complete
    await waitFor(() => {
      expect(screen.queryByRole('status')).not.toBeInTheDocument();
    });
  });

  it('handles edit errors gracefully', async () => {
    const consoleErrorSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
    const handleEdit = vi.fn().mockRejectedValue(new Error('Edit failed'));
    
    render(<UserCard user={mockUser} onEdit={handleEdit} />);
    
    const editButton = screen.getByLabelText("Edit John Doe's profile");
    fireEvent.click(editButton);
    
    await waitFor(() => {
      expect(consoleErrorSpy).toHaveBeenCalledWith('Failed to edit user:', expect.any(Error));
    });
    
    consoleErrorSpy.mockRestore();
  });

  it('has proper accessibility attributes', () => {
    render(<UserCard user={mockUser} />);
    
    const article = screen.getByRole('article');
    expect(article).toHaveAttribute('aria-labelledby', 'user-name-1');
    
    const name = screen.getByText('John Doe');
    expect(name).toHaveAttribute('id', 'user-name-1');
    
    const role = screen.getByText('admin');
    expect(role).toHaveAttribute('aria-label', 'Role: admin');
  });

  it('handles keyboard navigation', () => {
    render(<UserCard user={mockUser} onEdit={vi.fn()} onDelete={vi.fn()} />);
    
    const editButton = screen.getByLabelText("Edit John Doe's profile");
    const deleteButton = screen.getByLabelText("Delete John Doe's profile");
    
    // Buttons should be focusable
    editButton.focus();
    expect(editButton).toHaveFocus();
    
    deleteButton.focus();
    expect(deleteButton).toHaveFocus();
  });
});
`
      );
      
      // Storybook story
      await fs.ensureDir(path.join(projectPath, "src", "stories"));
      await fs.writeFile(
        path.join(projectPath, "src", "stories", "UserCard.stories.tsx"),
        `import type { Meta, StoryObj } from '@storybook/react';
import { UserCard } from '../components/UserCard';
import type { User } from '../components/UserCard/types';

const mockUser: User = {
  id: '1',
  name: 'John Doe',
  email: 'john.doe@example.com',
  avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&h=150&fit=crop&crop=face',
  role: 'admin',
  createdAt: new Date('2023-01-01'),
  updatedAt: new Date('2023-06-01'),
};

const meta: Meta<typeof UserCard> = {
  title: 'Components/UserCard',
  component: UserCard,
  parameters: {
    layout: 'centered',
    docs: {
      description: {
        component: 'A versatile user card component with support for different variants and interactive actions.',
      },
    },
  },
  tags: ['autodocs'],
  argTypes: {
    variant: {
      control: { type: 'select' },
      options: ['default', 'compact', 'detailed'],
    },
    onEdit: { action: 'onEdit' },
    onDelete: { action: 'onDelete' },
  },
};

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    user: mockUser,
  },
};

export const Compact: Story = {
  args: {
    user: mockUser,
    variant: 'compact',
  },
};

export const Detailed: Story = {
  args: {
    user: mockUser,
    variant: 'detailed',
  },
};

export const WithoutAvatar: Story = {
  args: {
    user: {
      ...mockUser,
      avatar: undefined,
    },
  },
};

export const WithoutRole: Story = {
  args: {
    user: {
      ...mockUser,
      role: undefined,
    },
  },
};

export const LongContent: Story = {
  args: {
    user: {
      ...mockUser,
      name: 'Dr. Alexander von Humboldt-Wellington III',
      email: 'alexander.von.humboldt.wellington.the.third@very-long-domain-name-company.international',
      role: 'senior principal distinguished architect',
    },
  },
};

export const Interactive: Story = {
  args: {
    user: mockUser,
    onEdit: (user) => {
      alert(\`Editing user: \${user.name}\`);
    },
    onDelete: (user) => {
      alert(\`Deleting user: \${user.name}\`);
    },
  },
};
`
      );
      
      // Verify all files were generated
      await testUtils.assert.assertFileExists(path.join(componentDir, "index.tsx"));
      await testUtils.assert.assertFileExists(path.join(componentDir, "types.ts"));
      await testUtils.assert.assertFileExists(path.join(componentDir, "hooks.ts"));
      await testUtils.assert.assertFileExists(path.join(componentDir, "styles.css"));
      await testUtils.assert.assertFileExists(path.join(componentDir, "__tests__", "UserCard.test.tsx"));
      await testUtils.assert.assertFileExists(path.join(projectPath, "src", "stories", "UserCard.stories.tsx"));
      
      // Verify TypeScript interfaces are properly defined
      await testUtils.assert.assertFileContains(
        path.join(componentDir, "types.ts"),
        "export interface UserCardProps"
      );
      await testUtils.assert.assertFileContains(
        path.join(componentDir, "types.ts"),
        "readonly user: User"
      );
      
      // Verify accessibility attributes
      await testUtils.assert.assertFileContains(
        path.join(componentDir, "index.tsx"),
        "aria-label"
      );
      await testUtils.assert.assertFileContains(
        path.join(componentDir, "index.tsx"),
        "role=\"article\""
      );
      
      // Verify comprehensive testing
      await testUtils.assert.assertFileContains(
        path.join(componentDir, "__tests__", "UserCard.test.tsx"),
        "accessibility attributes"
      );
      await testUtils.assert.assertFileContains(
        path.join(componentDir, "__tests__", "UserCard.test.tsx"),
        "keyboard navigation"
      );
    });

    it("should generate API routes with proper validation", async () => {
      const projectName = "test-api-gen";
      const projectPath = path.join(testDir, projectName);
      
      // Create base Next.js project
      await testUtils.fixtures.createFixtureProject("nextjs-project", projectPath);
      process.chdir(projectPath);
      
      const apiDir = path.join(projectPath, "src", "app", "api", "users");
      await fs.ensureDir(apiDir);
      
      // Generate API route with validation
      await fs.writeFile(
        path.join(apiDir, "route.ts"),
        `import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';

// Validation schemas
const createUserSchema = z.object({
  name: z.string().min(1, 'Name is required').max(100, 'Name too long'),
  email: z.string().email('Invalid email format'),
  role: z.enum(['user', 'admin', 'moderator']).optional().default('user'),
});

const updateUserSchema = createUserSchema.partial().extend({
  id: z.string().uuid('Invalid user ID'),
});

// Types
type CreateUserInput = z.infer<typeof createUserSchema>;
type UpdateUserInput = z.infer<typeof updateUserSchema>;

// GET /api/users - List users with pagination
export async function GET(request: NextRequest): Promise<NextResponse> {
  try {
    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get('page') || '1', 10);
    const limit = parseInt(searchParams.get('limit') || '10', 10);
    const search = searchParams.get('search') || '';
    
    // Validate pagination parameters
    if (page < 1 || limit < 1 || limit > 100) {
      return NextResponse.json(
        { error: 'Invalid pagination parameters' },
        { status: 400 }
      );
    }
    
    // Mock data - in real app, fetch from database
    const users = [
      { id: '1', name: 'John Doe', email: 'john@example.com', role: 'admin' },
      { id: '2', name: 'Jane Smith', email: 'jane@example.com', role: 'user' },
    ].filter(user => 
      search === '' || 
      user.name.toLowerCase().includes(search.toLowerCase()) ||
      user.email.toLowerCase().includes(search.toLowerCase())
    );
    
    const startIndex = (page - 1) * limit;
    const endIndex = startIndex + limit;
    const paginatedUsers = users.slice(startIndex, endIndex);
    
    return NextResponse.json({
      users: paginatedUsers,
      pagination: {
        page,
        limit,
        total: users.length,
        totalPages: Math.ceil(users.length / limit),
      },
    });
  } catch (error) {
    console.error('Error fetching users:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// POST /api/users - Create new user
export async function POST(request: NextRequest): Promise<NextResponse> {
  try {
    const body = await request.json();
    
    // Validate request body
    const validationResult = createUserSchema.safeParse(body);
    if (!validationResult.success) {
      return NextResponse.json(
        { 
          error: 'Validation failed', 
          details: validationResult.error.format() 
        },
        { status: 400 }
      );
    }
    
    const userData: CreateUserInput = validationResult.data;
    
    // Check if user already exists (mock implementation)
    const existingUser = null; // In real app: await db.user.findUnique({ where: { email: userData.email } })
    if (existingUser) {
      return NextResponse.json(
        { error: 'User with this email already exists' },
        { status: 409 }
      );
    }
    
    // Create user (mock implementation)
    const newUser = {
      id: crypto.randomUUID(),
      ...userData,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    
    return NextResponse.json(
      { user: newUser, message: 'User created successfully' },
      { status: 201 }
    );
  } catch (error) {
    console.error('Error creating user:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
`
      );
      
      // Generate dynamic route for individual users
      const userIdDir = path.join(apiDir, "[id]");
      await fs.ensureDir(userIdDir);
      
      await fs.writeFile(
        path.join(userIdDir, "route.ts"),
        `import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';

const userIdSchema = z.string().uuid('Invalid user ID');

// GET /api/users/[id] - Get user by ID
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
): Promise<NextResponse> {
  try {
    // Validate user ID
    const validationResult = userIdSchema.safeParse(params.id);
    if (!validationResult.success) {
      return NextResponse.json(
        { error: 'Invalid user ID format' },
        { status: 400 }
      );
    }
    
    const userId = validationResult.data;
    
    // Mock user lookup - in real app, fetch from database
    const user = userId === '1' ? {
      id: '1',
      name: 'John Doe',
      email: 'john@example.com',
      role: 'admin',
      createdAt: '2023-01-01T00:00:00.000Z',
      updatedAt: '2023-06-01T00:00:00.000Z',
    } : null;
    
    if (!user) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      );
    }
    
    return NextResponse.json({ user });
  } catch (error) {
    console.error('Error fetching user:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// PUT /api/users/[id] - Update user
export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
): Promise<NextResponse> {
  try {
    // Validate user ID
    const userIdValidation = userIdSchema.safeParse(params.id);
    if (!userIdValidation.success) {
      return NextResponse.json(
        { error: 'Invalid user ID format' },
        { status: 400 }
      );
    }
    
    const body = await request.json();
    const updateData = { ...body, id: userIdValidation.data };
    
    // Validate update data
    const validationResult = updateUserSchema.safeParse(updateData);
    if (!validationResult.success) {
      return NextResponse.json(
        { 
          error: 'Validation failed', 
          details: validationResult.error.format() 
        },
        { status: 400 }
      );
    }
    
    const userData = validationResult.data;
    
    // Check if user exists (mock implementation)
    const existingUser = userData.id === '1' ? {
      id: '1',
      name: 'John Doe',
      email: 'john@example.com',
      role: 'admin',
    } : null;
    
    if (!existingUser) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      );
    }
    
    // Update user (mock implementation)
    const updatedUser = {
      ...existingUser,
      ...userData,
      updatedAt: new Date().toISOString(),
    };
    
    return NextResponse.json({
      user: updatedUser,
      message: 'User updated successfully',
    });
  } catch (error) {
    console.error('Error updating user:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// DELETE /api/users/[id] - Delete user
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
): Promise<NextResponse> {
  try {
    // Validate user ID
    const validationResult = userIdSchema.safeParse(params.id);
    if (!validationResult.success) {
      return NextResponse.json(
        { error: 'Invalid user ID format' },
        { status: 400 }
      );
    }
    
    const userId = validationResult.data;
    
    // Check if user exists (mock implementation)
    const existingUser = userId === '1' ? { id: '1', name: 'John Doe' } : null;
    
    if (!existingUser) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      );
    }
    
    // Delete user (mock implementation)
    // In real app: await db.user.delete({ where: { id: userId } })
    
    return NextResponse.json({
      message: 'User deleted successfully',
    });
  } catch (error) {
    console.error('Error deleting user:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
`
      );
      
      // Generate API tests
      await fs.ensureDir(path.join(projectPath, "src", "__tests__", "api"));
      await fs.writeFile(
        path.join(projectPath, "src", "__tests__", "api", "users.test.ts"),
        `import { createMocks } from 'node-mocks-http';
import { GET, POST } from '../../app/api/users/route';

describe('/api/users', () => {
  describe('GET', () => {
    it('should return paginated users', async () => {
      const { req } = createMocks({
        method: 'GET',
        url: '/api/users?page=1&limit=10',
      });
      
      const response = await GET(req as any);
      const data = await response.json();
      
      expect(response.status).toBe(200);
      expect(data).toHaveProperty('users');
      expect(data).toHaveProperty('pagination');
      expect(Array.isArray(data.users)).toBe(true);
    });
    
    it('should handle search parameter', async () => {
      const { req } = createMocks({
        method: 'GET',
        url: '/api/users?search=john',
      });
      
      const response = await GET(req as any);
      const data = await response.json();
      
      expect(response.status).toBe(200);
      expect(data.users.every((user: any) => 
        user.name.toLowerCase().includes('john') ||
        user.email.toLowerCase().includes('john')
      )).toBe(true);
    });
    
    it('should validate pagination parameters', async () => {
      const { req } = createMocks({
        method: 'GET',
        url: '/api/users?page=0&limit=101',
      });
      
      const response = await GET(req as any);
      const data = await response.json();
      
      expect(response.status).toBe(400);
      expect(data.error).toContain('Invalid pagination parameters');
    });
  });
  
  describe('POST', () => {
    it('should create a new user with valid data', async () => {
      const userData = {
        name: 'Test User',
        email: 'test@example.com',
        role: 'user',
      };
      
      const { req } = createMocks({
        method: 'POST',
        body: userData,
      });
      
      const response = await POST(req as any);
      const data = await response.json();
      
      expect(response.status).toBe(201);
      expect(data.user).toMatchObject(userData);
      expect(data.user.id).toBeDefined();
    });
    
    it('should validate required fields', async () => {
      const { req } = createMocks({
        method: 'POST',
        body: { email: 'invalid-email' },
      });
      
      const response = await POST(req as any);
      const data = await response.json();
      
      expect(response.status).toBe(400);
      expect(data.error).toBe('Validation failed');
      expect(data.details).toBeDefined();
    });
    
    it('should reject invalid email format', async () => {
      const { req } = createMocks({
        method: 'POST',
        body: {
          name: 'Test User',
          email: 'not-an-email',
        },
      });
      
      const response = await POST(req as any);
      const data = await response.json();
      
      expect(response.status).toBe(400);
      expect(data.details.email).toBeDefined();
    });
  });
});
`
      );
      
      // Verify API route generation
      await testUtils.assert.assertFileExists(path.join(apiDir, "route.ts"));
      await testUtils.assert.assertFileExists(path.join(userIdDir, "route.ts"));
      await testUtils.assert.assertFileExists(
        path.join(projectPath, "src", "__tests__", "api", "users.test.ts")
      );
      
      // Verify proper validation schemas
      await testUtils.assert.assertFileContains(
        path.join(apiDir, "route.ts"),
        "createUserSchema"
      );
      await testUtils.assert.assertFileContains(
        path.join(apiDir, "route.ts"),
        "z.string().email"
      );
      
      // Verify error handling
      await testUtils.assert.assertFileContains(
        path.join(apiDir, "route.ts"),
        "Internal server error"
      );
      await testUtils.assert.assertFileContains(
        path.join(userIdDir, "route.ts"),
        "User not found"
      );
    });
  });

  describe("AI-Powered Generation", () => {
    it("should integrate with AI services for intelligent code generation", async () => {
      const projectName = "test-ai-integration";
      const projectPath = path.join(testDir, projectName);
      
      // Create base project
      await testUtils.fixtures.createFixtureProject("nextjs-project", projectPath);
      process.chdir(projectPath);
      
      // Mock AI-generated component based on natural language prompt
      const prompt = "Create a responsive data table with sorting, filtering, and pagination";
      const aiGeneratedCode = `import React, { useState, useMemo } from 'react';

interface DataTableProps<T> {
  readonly data: T[];
  readonly columns: Column<T>[];
  readonly pageSize?: number;
  readonly searchable?: boolean;
  readonly sortable?: boolean;
}

interface Column<T> {
  readonly key: keyof T;
  readonly header: string;
  readonly sortable?: boolean;
  readonly render?: (value: T[keyof T], row: T) => React.ReactNode;
}

export const DataTable = <T extends Record<string, any>>({
  data,
  columns,
  pageSize = 10,
  searchable = true,
  sortable = true,
}: DataTableProps<T>): JSX.Element => {
  const [currentPage, setCurrentPage] = useState(1);
  const [searchTerm, setSearchTerm] = useState('');
  const [sortConfig, setSortConfig] = useState<{
    key: keyof T;
    direction: 'asc' | 'desc';
  } | null>(null);

  // Filter data based on search term
  const filteredData = useMemo(() => {
    if (!searchTerm) return data;
    
    return data.filter(row =>
      Object.values(row).some(value =>
        String(value).toLowerCase().includes(searchTerm.toLowerCase())
      )
    );
  }, [data, searchTerm]);

  // Sort data
  const sortedData = useMemo(() => {
    if (!sortConfig) return filteredData;
    
    return [...filteredData].sort((a, b) => {
      const aValue = a[sortConfig.key];
      const bValue = b[sortConfig.key];
      
      if (aValue < bValue) {
        return sortConfig.direction === 'asc' ? -1 : 1;
      }
      if (aValue > bValue) {
        return sortConfig.direction === 'asc' ? 1 : -1;
      }
      return 0;
    });
  }, [filteredData, sortConfig]);

  // Paginate data
  const paginatedData = useMemo(() => {
    const startIndex = (currentPage - 1) * pageSize;
    return sortedData.slice(startIndex, startIndex + pageSize);
  }, [sortedData, currentPage, pageSize]);

  const totalPages = Math.ceil(sortedData.length / pageSize);

  const handleSort = (key: keyof T) => {
    if (!sortable) return;
    
    setSortConfig(current => {
      if (current?.key === key) {
        return current.direction === 'asc' 
          ? { key, direction: 'desc' }
          : null;
      }
      return { key, direction: 'asc' };
    });
  };

  return (
    <div className="data-table" role="region" aria-label="Data table">
      {searchable && (
        <div className="data-table__search">
          <label htmlFor="table-search" className="sr-only">
            Search table
          </label>
          <input
            id="table-search"
            type="text"
            placeholder="Search..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="data-table__search-input"
          />
        </div>
      )}
      
      <table className="data-table__table" role="table">
        <thead>
          <tr role="row">
            {columns.map((column) => (
              <th
                key={String(column.key)}
                role="columnheader"
                className={sortable && column.sortable !== false ? 'sortable' : ''}
                onClick={() => sortable && column.sortable !== false && handleSort(column.key)}
                aria-sort={
                  sortConfig?.key === column.key
                    ? sortConfig.direction === 'asc' ? 'ascending' : 'descending'
                    : 'none'
                }
              >
                {column.header}
                {sortable && column.sortable !== false && (
                  <span className="sort-indicator" aria-hidden="true">
                    {sortConfig?.key === column.key
                      ? sortConfig.direction === 'asc' ? '↑' : '↓'
                      : '↕'
                    }
                  </span>
                )}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {paginatedData.map((row, index) => (
            <tr key={index} role="row">
              {columns.map((column) => (
                <td key={String(column.key)} role="gridcell">
                  {column.render 
                    ? column.render(row[column.key], row)
                    : String(row[column.key])
                  }
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
      
      {totalPages > 1 && (
        <div className="data-table__pagination" role="navigation" aria-label="Table pagination">
          <button
            onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
            disabled={currentPage === 1}
            aria-label="Go to previous page"
          >
            Previous
          </button>
          
          <span aria-live="polite">
            Page {currentPage} of {totalPages}
          </span>
          
          <button
            onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
            disabled={currentPage === totalPages}
            aria-label="Go to next page"
          >
            Next
          </button>
        </div>
      )}
    </div>
  );
};`;
      
      // Save AI-generated component
      const componentPath = path.join(projectPath, "src", "components", "DataTable.tsx");
      await fs.ensureDir(path.dirname(componentPath));
      await fs.writeFile(componentPath, aiGeneratedCode);
      
      // Verify AI-generated component has expected features
      await testUtils.assert.assertFileExists(componentPath);
      await testUtils.assert.assertFileContains(componentPath, "DataTableProps");
      await testUtils.assert.assertFileContains(componentPath, "searchable");
      await testUtils.assert.assertFileContains(componentPath, "sortable");
      await testUtils.assert.assertFileContains(componentPath, "pagination");
      await testUtils.assert.assertFileContains(componentPath, "aria-label");
      await testUtils.assert.assertFileContains(componentPath, "role=\"table\"");
      
      // Verify TypeScript generics are used correctly
      await testUtils.assert.assertFileContains(componentPath, "<T extends Record<string, any>>");
      await testUtils.assert.assertFileContains(componentPath, "Column<T>");
    });
  });
});