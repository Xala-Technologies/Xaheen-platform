/**
 * Session Management Integration
 * Generates JWT and session-based authentication components and services
 */

import * as fs from 'fs';
import * as path from 'path';
import Handlebars from 'handlebars';

export interface GenerationResult {
  success: boolean;
  files: string[];
  errors?: string[];
  warnings?: string[];
}

export interface SessionOptions {
  projectName: string;
  outputPath?: string;
  framework?: 'react' | 'nextjs' | 'remix' | 'svelte' | 'vue';
  typescript?: boolean;
  sessionType?: 'jwt' | 'server-session' | 'hybrid';
  storage?: 'cookie' | 'database' | 'redis' | 'memory';
  tokenExpiry?: number;
  refreshTokenExpiry?: number;
  secureCookies?: boolean;
  sameSite?: 'strict' | 'lax' | 'none';
  gdprCompliant?: boolean;
  auditLogging?: boolean;
  encryptionKey?: string;
}

export interface SessionUser {
  id: string;
  email?: string;
  roles?: string[];
  permissions?: string[];
  lastLogin?: Date;
  sessionId?: string;
  refreshToken?: string;
}

export interface SessionData {
  user: SessionUser;
  createdAt: Date;
  expiresAt: Date;
  lastActivity: Date;
  ipAddress?: string;
  userAgent?: string;
  deviceFingerprint?: string;
}

/**
 * Generate session management components
 */
export async function generateSessionComponent(options: SessionOptions): Promise<GenerationResult> {
  const result: GenerationResult = { success: false, files: [], errors: [], warnings: [] };

  try {
    const {
      projectName,
      outputPath,
      framework = 'react',
      typescript = true,
      sessionType = 'jwt',
      gdprCompliant = true,
    } = options;

    const outputDir = outputPath || path.join(process.cwd(), 'src', 'components', 'auth');
    if (!fs.existsSync(outputDir)) fs.mkdirSync(outputDir, { recursive: true });

    const extension = typescript ? '.tsx' : '.jsx';

    // Session Provider Component
    const providerContent = `import React, { createContext, useContext, useEffect, useState, useCallback } from 'react';
${typescript ? `import type { SessionUser, SessionData } from './session.types';` : ''}

${typescript ? `
interface SessionContextType {
  user: SessionUser | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  login: (credentials: { email: string; password: string }) => Promise<boolean>;
  logout: () => Promise<void>;
  refreshSession: () => Promise<boolean>;
  updateProfile: (data: Partial<SessionUser>) => Promise<boolean>;
  hasPermission: (permission: string) => boolean;
  hasRole: (role: string) => boolean;
}

interface SessionProviderProps {
  children: React.ReactNode;
  autoRefresh?: boolean;
  onSessionExpired?: () => void;
  onSessionError?: (error: Error) => void;
}
` : ''}

const SessionContext = createContext${typescript ? '<SessionContextType | undefined>' : ''}(undefined);

/**
 * Session Provider Component for ${projectName}
 * Manages user authentication state and session lifecycle
 */
export const SessionProvider${typescript ? ': React.FC<SessionProviderProps>' : ''} = ({
  children,
  autoRefresh = true,
  onSessionExpired,
  onSessionError,
}) => {
  const [user, setUser] = useState${typescript ? '<SessionUser | null>' : ''}(null);
  const [isLoading, setIsLoading] = useState(true);
  const [refreshTimer, setRefreshTimer] = useState${typescript ? '<NodeJS.Timeout | null>' : ''}(null);

  const isAuthenticated = !!user;

  // Initialize session on mount
  useEffect(() => {
    initializeSession();
  }, []);

  // Set up auto-refresh if enabled
  useEffect(() => {
    if (autoRefresh && user) {
      const refreshInterval = setInterval(() => {
        refreshSession();
      }, 15 * 60 * 1000); // Refresh every 15 minutes

      setRefreshTimer(refreshInterval);

      return () => {
        if (refreshInterval) clearInterval(refreshInterval);
      };
    }
  }, [user, autoRefresh]);

  const initializeSession = async () => {
    setIsLoading(true);
    try {
      const response = await fetch('/api/auth/session', {
        method: 'GET',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (response.ok) {
        const sessionData = await response.json();
        setUser(sessionData.user);
      } else if (response.status === 401) {
        // Session expired or invalid
        setUser(null);
        ${gdprCompliant ? 'await clearSessionData();' : ''}
        onSessionExpired?.();
      }
    } catch (error) {
      console.error('Session initialization error:', error);
      onSessionError?.(error${typescript ? ' as Error' : ''});
    } finally {
      setIsLoading(false);
    }
  };

  const login = useCallback(async (credentials${typescript ? ': { email: string; password: string }' : ''})${typescript ? ': Promise<boolean>' : ''} => {
    setIsLoading(true);
    try {
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify(credentials),
      });

      if (response.ok) {
        const sessionData = await response.json();
        setUser(sessionData.user);
        
        ${gdprCompliant ? `
        // GDPR compliance: Log authentication event
        await logAuthEvent('login', sessionData.user.id);
        ` : ''}
        
        return true;
      } else {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || 'Login failed');
      }
    } catch (error) {
      console.error('Login error:', error);
      onSessionError?.(error${typescript ? ' as Error' : ''});
      return false;
    } finally {
      setIsLoading(false);
    }
  }, []);

  const logout = useCallback(async ()${typescript ? ': Promise<void>' : ''} => {
    setIsLoading(true);
    try {
      const userId = user?.id;
      
      await fetch('/api/auth/logout', {
        method: 'POST',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      ${gdprCompliant ? `
      // GDPR compliance: Log logout event and clear data
      if (userId) {
        await logAuthEvent('logout', userId);
      }
      await clearSessionData();
      ` : ''}

      setUser(null);

      // Clear refresh timer
      if (refreshTimer) {
        clearInterval(refreshTimer);
        setRefreshTimer(null);
      }

    } catch (error) {
      console.error('Logout error:', error);
      onSessionError?.(error${typescript ? ' as Error' : ''});
    } finally {
      setIsLoading(false);
    }
  }, [user, refreshTimer]);

  const refreshSession = useCallback(async ()${typescript ? ': Promise<boolean>' : ''} => {
    try {
      const response = await fetch('/api/auth/refresh', {
        method: 'POST',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (response.ok) {
        const sessionData = await response.json();
        setUser(sessionData.user);
        return true;
      } else if (response.status === 401) {
        // Refresh token expired
        setUser(null);
        ${gdprCompliant ? 'await clearSessionData();' : ''}
        onSessionExpired?.();
        return false;
      }
    } catch (error) {
      console.error('Session refresh error:', error);
      onSessionError?.(error${typescript ? ' as Error' : ''});
      return false;
    }
    return false;
  }, []);

  const updateProfile = useCallback(async (data${typescript ? ': Partial<SessionUser>' : ''})${typescript ? ': Promise<boolean>' : ''} => {
    if (!user) return false;

    try {
      const response = await fetch('/api/auth/profile', {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify(data),
      });

      if (response.ok) {
        const updatedUser = await response.json();
        setUser({ ...user, ...updatedUser });
        
        ${gdprCompliant ? `
        // GDPR compliance: Log profile update
        await logAuthEvent('profile_update', user.id);
        ` : ''}
        
        return true;
      }
    } catch (error) {
      console.error('Profile update error:', error);
      onSessionError?.(error${typescript ? ' as Error' : ''});
    }
    return false;
  }, [user]);

  const hasPermission = useCallback((permission${typescript ? ': string' : ''})${typescript ? ': boolean' : ''} => {
    return user?.permissions?.includes(permission) || false;
  }, [user]);

  const hasRole = useCallback((role${typescript ? ': string' : ''})${typescript ? ': boolean' : ''} => {
    return user?.roles?.includes(role) || false;
  }, [user]);

  ${gdprCompliant ? `
  // GDPR compliance helper functions
  const logAuthEvent = async (event${typescript ? ': string' : ''}, userId${typescript ? ': string' : ''}) => {
    try {
      await fetch('/api/auth/audit', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify({
          event,
          userId,
          timestamp: new Date().toISOString(),
          ipAddress: window.navigator?.userAgent ? 'client' : undefined,
        }),
      });
    } catch (error) {
      console.warn('Audit logging failed:', error);
    }
  };

  const clearSessionData = async () => {
    try {
      // Clear any client-side stored data
      localStorage.removeItem('session_data');
      sessionStorage.clear();
      
      // Clear any cached user data
      if ('caches' in window) {
        const cacheNames = await caches.keys();
        await Promise.all(
          cacheNames.map(cacheName => caches.delete(cacheName))
        );
      }
    } catch (error) {
      console.warn('Session data cleanup failed:', error);
    }
  };
  ` : ''}

  const contextValue${typescript ? ': SessionContextType' : ''} = {
    user,
    isLoading,
    isAuthenticated,
    login,
    logout,
    refreshSession,
    updateProfile,
    hasPermission,
    hasRole,
  };

  return (
    <SessionContext.Provider value={contextValue}>
      {children}
    </SessionContext.Provider>
  );
};

/**
 * Hook to use session context
 */
export const useSession = ()${typescript ? ': SessionContextType' : ''} => {
  const context = useContext(SessionContext);
  if (context === undefined) {
    throw new Error('useSession must be used within a SessionProvider');
  }
  return context;
};

/**
 * Higher-order component for protecting routes
 */
export const withAuth = ${typescript ? '<P extends object>' : ''}(
  Component${typescript ? ': React.ComponentType<P>' : ''},
  options${typescript ? '?: { roles?: string[]; permissions?: string[]; redirectTo?: string }' : ''} = {}
) => {
  const AuthenticatedComponent = (props${typescript ? ': P' : ''}) => {
    const { isAuthenticated, isLoading, hasRole, hasPermission } = useSession();
    const { roles = [], permissions = [], redirectTo = '/login' } = options;

    useEffect(() => {
      if (!isLoading && !isAuthenticated) {
        window.location.href = redirectTo;
      }
    }, [isAuthenticated, isLoading]);

    if (isLoading) {
      return (
        <div className="flex items-center justify-center min-h-screen">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        </div>
      );
    }

    if (!isAuthenticated) {
      return null; // Will redirect via useEffect
    }

    // Check role-based access
    if (roles.length > 0 && !roles.some(role => hasRole(role))) {
      return (
        <div className="flex items-center justify-center min-h-screen">
          <div className="text-center">
            <h2 className="text-2xl font-bold text-gray-900 mb-2">Access Denied</h2>
            <p className="text-gray-600">You don't have permission to access this page.</p>
          </div>
        </div>
      );
    }

    // Check permission-based access
    if (permissions.length > 0 && !permissions.some(permission => hasPermission(permission))) {
      return (
        <div className="flex items-center justify-center min-h-screen">
          <div className="text-center">
            <h2 className="text-2xl font-bold text-gray-900 mb-2">Access Denied</h2>
            <p className="text-gray-600">You don't have the required permissions.</p>
          </div>
        </div>
      );
    }

    return <Component {...props} />;
  };

  AuthenticatedComponent.displayName = \`withAuth(\${Component.displayName || Component.name})\`;
  return AuthenticatedComponent;
};`;

    fs.writeFileSync(path.join(outputDir, `SessionProvider${extension}`), providerContent, 'utf-8');
    result.files.push(path.join(outputDir, `SessionProvider${extension}`));

    // Login Form Component
    const loginContent = `import React, { useState } from 'react';
import { useSession } from './SessionProvider';
${typescript ? `
interface LoginFormProps {
  onSuccess?: () => void;
  onError?: (error: Error) => void;
  className?: string;
  title?: string;
  showRegisterLink?: boolean;
}
` : ''}

/**
 * Login Form Component for ${projectName}
 * Provides user authentication interface
 */
export const LoginForm${typescript ? ': React.FC<LoginFormProps>' : ''} = ({
  onSuccess,
  onError,
  className = '',
  title = 'Sign In',
  showRegisterLink = true,
}) => {
  const { login, isLoading } = useSession();
  const [formData, setFormData] = useState({
    email: '',
    password: '',
  });
  const [errors, setErrors] = useState${typescript ? '<Record<string, string>>' : ''}({});
  const [rememberMe, setRememberMe] = useState(false);

  const handleSubmit = async (e${typescript ? ': React.FormEvent' : ''}) => {
    e.preventDefault();
    setErrors({});

    // Basic validation
    const newErrors${typescript ? ': Record<string, string>' : ''} = {};
    if (!formData.email) newErrors.email = 'Email is required';
    if (!formData.password) newErrors.password = 'Password is required';
    
    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    try {
      const success = await login(formData);
      if (success) {
        onSuccess?.();
      } else {
        setErrors({ general: 'Invalid email or password' });
      }
    } catch (error) {
      const message = error${typescript ? ' as Error' : ''}.message || 'Login failed';
      setErrors({ general: message });
      onError?.(error${typescript ? ' as Error' : ''});
    }
  };

  const handleInputChange = (e${typescript ? ': React.ChangeEvent<HTMLInputElement>' : ''}) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    // Clear error when user starts typing
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  return (
    <div className={\`login-form max-w-md mx-auto p-6 bg-white rounded-lg shadow-lg \${className}\`}>
      <div className="text-center mb-6">
        <h2 className="text-2xl font-bold text-gray-900 mb-2">{title}</h2>
        <p className="text-gray-600">Enter your credentials to access your account</p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        {errors.general && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-3">
            <p className="text-sm text-red-800">{errors.general}</p>
          </div>
        )}

        <div>
          <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
            Email Address
          </label>
          <input
            id="email"
            name="email"
            type="email"
            value={formData.email}
            onChange={handleInputChange}
            className={\`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent \${
              errors.email ? 'border-red-300' : 'border-gray-300'
            }\`}
            placeholder="your@email.com"
            required
            disabled={isLoading}
          />
          {errors.email && (
            <p className="text-sm text-red-600 mt-1">{errors.email}</p>
          )}
        </div>

        <div>
          <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-2">
            Password
          </label>
          <input
            id="password"
            name="password"
            type="password"
            value={formData.password}
            onChange={handleInputChange}
            className={\`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent \${
              errors.password ? 'border-red-300' : 'border-gray-300'
            }\`}
            placeholder="Your password"
            required
            disabled={isLoading}
          />
          {errors.password && (
            <p className="text-sm text-red-600 mt-1">{errors.password}</p>
          )}
        </div>

        <div className="flex items-center justify-between">
          <label className="flex items-center">
            <input
              type="checkbox"
              checked={rememberMe}
              onChange={(e) => setRememberMe(e.target.checked)}
              className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
              disabled={isLoading}
            />
            <span className="ml-2 text-sm text-gray-600">Remember me</span>
          </label>
          <a href="/forgot-password" className="text-sm text-blue-600 hover:text-blue-700">
            Forgot password?
          </a>
        </div>

        <button
          type="submit"
          disabled={isLoading}
          className="w-full px-4 py-3 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          {isLoading ? (
            <span className="flex items-center justify-center">
              <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              Signing in...
            </span>
          ) : (
            'Sign In'
          )}
        </button>

        ${gdprCompliant ? `
        <div className="text-xs text-gray-500 mt-4">
          By signing in, you agree to our{' '}
          <a href="/privacy" className="text-blue-600 hover:text-blue-700">Privacy Policy</a>
          {' '}and{' '}
          <a href="/terms" className="text-blue-600 hover:text-blue-700">Terms of Service</a>.
          Your data is processed in accordance with GDPR regulations.
        </div>
        ` : ''}

        {showRegisterLink && (
          <div className="text-center pt-4 border-t border-gray-200">
            <p className="text-sm text-gray-600">
              Don't have an account?{' '}
              <a href="/register" className="text-blue-600 hover:text-blue-700 font-medium">
                Sign up
              </a>
            </p>
          </div>
        )}
      </form>
    </div>
  );
};`;

    fs.writeFileSync(path.join(outputDir, `LoginForm${extension}`), loginContent, 'utf-8');
    result.files.push(path.join(outputDir, `LoginForm${extension}`));

    result.success = true;
  } catch (error: any) {
    result.errors?.push(`Session component generation failed: ${error.message}`);
  }

  return result;
}

/**
 * Generate session management service
 */
export async function generateSessionService(options: SessionOptions): Promise<GenerationResult> {
  const result: GenerationResult = { success: false, files: [], errors: [], warnings: [] };

  try {
    const {
      projectName,
      outputPath,
      typescript = true,
      sessionType = 'jwt',
      storage = 'cookie',
      tokenExpiry = 15,
      refreshTokenExpiry = 7 * 24 * 60,
      secureCookies = true,
      sameSite = 'strict',
      gdprCompliant = true,
      auditLogging = true,
    } = options;

    const outputDir = outputPath || path.join(process.cwd(), 'src', 'services', 'auth');
    if (!fs.existsSync(outputDir)) fs.mkdirSync(outputDir, { recursive: true });

    const serviceContent = `${typescript ? `import type { SessionUser, SessionData } from './session.types';` : ''}
import crypto from 'crypto';
${sessionType === 'jwt' ? "import jwt from 'jsonwebtoken';" : ''}
${storage === 'redis' ? "import Redis from 'ioredis';" : ''}

/**
 * Session Management Service for ${projectName}
 * Handles ${sessionType} sessions with ${storage} storage
 */
export class SessionService {
  private encryptionKey${typescript ? ': string' : ''};
  ${storage === 'redis' ? `private redis${typescript ? ': Redis' : ''};` : ''}
  ${storage === 'memory' ? `private sessionStore${typescript ? ': Map<string, SessionData>' : ''} = new Map();` : ''}

  constructor(encryptionKey${typescript ? ': string' : ''} = process.env.ENCRYPTION_KEY || 'default-key') {
    this.encryptionKey = encryptionKey;
    ${storage === 'redis' ? `
    this.redis = new Redis({
      host: process.env.REDIS_HOST || 'localhost',
      port: parseInt(process.env.REDIS_PORT || '6379'),
      password: process.env.REDIS_PASSWORD,
      retryDelayOnFailover: 100,
      maxRetriesPerRequest: 3,
    });
    ` : ''}
  }

  /**
   * Create a new session for user
   */
  async createSession(user${typescript ? ': SessionUser' : ''}, metadata${typescript ? '?: { ipAddress?: string; userAgent?: string }' : ''} = {})${typescript ? ': Promise<{ sessionId: string; token?: string; refreshToken?: string }>' : ''} {
    const sessionId = this.generateSessionId();
    const now = new Date();
    const expiresAt = new Date(now.getTime() + ${tokenExpiry} * 60 * 1000);
    const refreshTokenExpiresAt = new Date(now.getTime() + ${refreshTokenExpiry} * 60 * 1000);

    const sessionData${typescript ? ': SessionData' : ''} = {
      user: { ...user, sessionId },
      createdAt: now,
      expiresAt,
      lastActivity: now,
      ipAddress: metadata.ipAddress,
      userAgent: metadata.userAgent,
      deviceFingerprint: this.generateDeviceFingerprint(metadata.userAgent || ''),
    };

    ${sessionType === 'jwt' ? `
    // JWT-based session
    const token = this.generateJWTToken(sessionData);
    const refreshToken = this.generateRefreshToken(user.id, sessionId);
    
    // Store refresh token
    await this.storeRefreshToken(user.id, refreshToken, refreshTokenExpiresAt);
    ` : `
    // Server-side session
    await this.storeSession(sessionId, sessionData);
    `}

    ${auditLogging ? `
    // Audit logging
    await this.logSessionEvent('session_created', user.id, sessionId, metadata);
    ` : ''}

    return {
      sessionId,
      ${sessionType === 'jwt' ? 'token,' : ''}
      ${sessionType === 'jwt' ? 'refreshToken,' : ''}
    };
  }

  /**
   * Validate and retrieve session
   */
  async validateSession(${sessionType === 'jwt' ? 'token' : 'sessionId'}${typescript ? ': string' : ''})${typescript ? ': Promise<SessionData | null>' : ''} {
    try {
      ${sessionType === 'jwt' ? `
      // JWT validation
      const decoded = jwt.verify(token, this.encryptionKey) as any;
      const sessionData = decoded.sessionData;
      
      // Check if session is expired
      if (new Date() > new Date(sessionData.expiresAt)) {
        return null;
      }
      
      // Update last activity
      sessionData.lastActivity = new Date();
      
      return sessionData;
      ` : `
      // Server-side session validation
      const sessionData = await this.getSession(sessionId);
      
      if (!sessionData) {
        return null;
      }
      
      // Check if session is expired
      if (new Date() > sessionData.expiresAt) {
        await this.destroySession(sessionId);
        return null;
      }
      
      // Update last activity
      sessionData.lastActivity = new Date();
      await this.storeSession(sessionId, sessionData);
      
      return sessionData;
      `}
    } catch (error) {
      console.error('Session validation error:', error);
      return null;
    }
  }

  /**
   * Refresh session token
   */
  async refreshSession(refreshToken${typescript ? ': string' : ''})${typescript ? ': Promise<{ sessionId: string; token?: string; refreshToken?: string } | null>' : ''} {
    try {
      const tokenData = await this.validateRefreshToken(refreshToken);
      if (!tokenData) {
        return null;
      }

      const { userId, sessionId } = tokenData;
      
      ${sessionType === 'jwt' ? `
      // Get current session data
      const currentSession = await this.getStoredSession(userId, sessionId);
      if (!currentSession) {
        return null;
      }
      
      // Generate new tokens
      const newToken = this.generateJWTToken(currentSession);
      const newRefreshToken = this.generateRefreshToken(userId, sessionId);
      
      // Store new refresh token and invalidate old one
      await this.storeRefreshToken(userId, newRefreshToken, 
        new Date(Date.now() + ${refreshTokenExpiry} * 60 * 1000));
      await this.invalidateRefreshToken(refreshToken);
      
      return {
        sessionId,
        token: newToken,
        refreshToken: newRefreshToken,
      };
      ` : `
      // For server-side sessions, just extend expiry
      const sessionData = await this.getSession(sessionId);
      if (!sessionData) {
        return null;
      }
      
      sessionData.expiresAt = new Date(Date.now() + ${tokenExpiry} * 60 * 1000);
      await this.storeSession(sessionId, sessionData);
      
      return { sessionId };
      `}
    } catch (error) {
      console.error('Session refresh error:', error);
      return null;
    }
  }

  /**
   * Destroy session
   */
  async destroySession(${sessionType === 'jwt' ? 'token' : 'sessionId'}${typescript ? ': string' : ''}, userId${typescript ? '?: string' : ''})${typescript ? ': Promise<boolean>' : ''} {
    try {
      ${sessionType === 'jwt' ? `
      const decoded = jwt.verify(token, this.encryptionKey) as any;
      const sessionData = decoded.sessionData;
      const actualSessionId = sessionData.user.sessionId;
      const actualUserId = sessionData.user.id;
      
      // Invalidate refresh tokens
      await this.invalidateAllRefreshTokens(actualUserId, actualSessionId);
      ` : `
      // Server-side session destruction
      await this.removeSession(sessionId);
      `}

      ${auditLogging ? `
      // Audit logging
      await this.logSessionEvent('session_destroyed', 
        ${sessionType === 'jwt' ? 'actualUserId' : 'userId'}, 
        ${sessionType === 'jwt' ? 'actualSessionId' : 'sessionId'});
      ` : ''}

      return true;
    } catch (error) {
      console.error('Session destruction error:', error);
      return false;
    }
  }

  /**
   * Update user profile in session
   */
  async updateSessionUser(sessionId${typescript ? ': string' : ''}, updates${typescript ? ': Partial<SessionUser>' : ''})${typescript ? ': Promise<boolean>' : ''} {
    try {
      ${sessionType === 'jwt' ? `
      // For JWT, the client needs to refresh the token
      // Store the update in a temporary cache for next refresh
      await this.storePendingUserUpdate(sessionId, updates);
      ` : `
      // Update server-side session
      const sessionData = await this.getSession(sessionId);
      if (!sessionData) {
        return false;
      }
      
      sessionData.user = { ...sessionData.user, ...updates };
      await this.storeSession(sessionId, sessionData);
      `}

      ${auditLogging ? `
      // Audit logging
      await this.logSessionEvent('profile_updated', updates.id || '', sessionId);
      ` : ''}

      return true;
    } catch (error) {
      console.error('Session user update error:', error);
      return false;
    }
  }

  /**
   * Get all active sessions for user (GDPR compliance)
   */
  async getUserSessions(userId${typescript ? ': string' : ''})${typescript ? ': Promise<SessionData[]>' : ''} {
    try {
      ${storage === 'redis' ? `
      const keys = await this.redis.keys(\`session:\${userId}:*\`);
      const sessions = [];
      
      for (const key of keys) {
        const sessionData = await this.redis.get(key);
        if (sessionData) {
          sessions.push(JSON.parse(sessionData));
        }
      }
      
      return sessions;
      ` : storage === 'memory' ? `
      const sessions = [];
      for (const [sessionId, sessionData] of this.sessionStore.entries()) {
        if (sessionData.user.id === userId) {
          sessions.push(sessionData);
        }
      }
      return sessions;
      ` : `
      // Database implementation would go here
      return [];
      `}
    } catch (error) {
      console.error('Get user sessions error:', error);
      return [];
    }
  }

  /**
   * Destroy all sessions for user
   */
  async destroyAllUserSessions(userId${typescript ? ': string' : ''})${typescript ? ': Promise<boolean>' : ''} {
    try {
      ${storage === 'redis' ? `
      const keys = await this.redis.keys(\`session:\${userId}:*\`);
      if (keys.length > 0) {
        await this.redis.del(...keys);
      }
      
      // Also clear refresh tokens
      const refreshKeys = await this.redis.keys(\`refresh:\${userId}:*\`);
      if (refreshKeys.length > 0) {
        await this.redis.del(...refreshKeys);
      }
      ` : storage === 'memory' ? `
      for (const [sessionId, sessionData] of this.sessionStore.entries()) {
        if (sessionData.user.id === userId) {
          this.sessionStore.delete(sessionId);
        }
      }
      ` : `
      // Database implementation would go here
      `}

      ${auditLogging ? `
      // Audit logging
      await this.logSessionEvent('all_sessions_destroyed', userId);
      ` : ''}

      return true;
    } catch (error) {
      console.error('Destroy all user sessions error:', error);
      return false;
    }
  }

  // Private helper methods
  private generateSessionId()${typescript ? ': string' : ''} {
    return crypto.randomBytes(32).toString('hex');
  }

  private generateDeviceFingerprint(userAgent${typescript ? ': string' : ''})${typescript ? ': string' : ''} {
    return crypto.createHash('sha256').update(userAgent).digest('hex').substring(0, 16);
  }

  ${sessionType === 'jwt' ? `
  private generateJWTToken(sessionData${typescript ? ': SessionData' : ''})${typescript ? ': string' : ''} {
    return jwt.sign(
      { sessionData },
      this.encryptionKey,
      { 
        expiresIn: '${tokenExpiry}m',
        issuer: '${projectName}',
        audience: 'user-session',
      }
    );
  }
  ` : ''}

  private generateRefreshToken(userId${typescript ? ': string' : ''}, sessionId${typescript ? ': string' : ''})${typescript ? ': string' : ''} {
    const payload = { userId, sessionId, type: 'refresh' };
    return crypto.createHmac('sha256', this.encryptionKey)
      .update(JSON.stringify(payload) + Date.now())
      .digest('hex');
  }

  ${storage === 'redis' ? `
  private async storeSession(sessionId${typescript ? ': string' : ''}, sessionData${typescript ? ': SessionData' : ''})${typescript ? ': Promise<void>' : ''} {
    const key = \`session:\${sessionData.user.id}:\${sessionId}\`;
    const ttl = Math.floor((sessionData.expiresAt.getTime() - Date.now()) / 1000);
    await this.redis.setex(key, ttl, JSON.stringify(sessionData));
  }

  private async getSession(sessionId${typescript ? ': string' : ''})${typescript ? ': Promise<SessionData | null>' : ''} {
    const keys = await this.redis.keys(\`session:*:\${sessionId}\`);
    if (keys.length === 0) return null;
    
    const sessionData = await this.redis.get(keys[0]);
    return sessionData ? JSON.parse(sessionData) : null;
  }

  private async removeSession(sessionId${typescript ? ': string' : ''})${typescript ? ': Promise<void>' : ''} {
    const keys = await this.redis.keys(\`session:*:\${sessionId}\`);
    if (keys.length > 0) {
      await this.redis.del(...keys);
    }
  }

  private async storeRefreshToken(userId${typescript ? ': string' : ''}, refreshToken${typescript ? ': string' : ''}, expiresAt${typescript ? ': Date' : ''})${typescript ? ': Promise<void>' : ''} {
    const key = \`refresh:\${userId}:\${refreshToken}\`;
    const ttl = Math.floor((expiresAt.getTime() - Date.now()) / 1000);
    await this.redis.setex(key, ttl, JSON.stringify({ userId, expiresAt }));
  }

  private async validateRefreshToken(refreshToken${typescript ? ': string' : ''})${typescript ? ': Promise<{ userId: string; sessionId: string } | null>' : ''} {
    const keys = await this.redis.keys(\`refresh:*:\${refreshToken}\`);
    if (keys.length === 0) return null;
    
    const data = await this.redis.get(keys[0]);
    if (!data) return null;
    
    const tokenData = JSON.parse(data);
    const userId = keys[0].split(':')[1];
    
    return { userId, sessionId: refreshToken.substring(0, 16) };
  }

  private async invalidateRefreshToken(refreshToken${typescript ? ': string' : ''})${typescript ? ': Promise<void>' : ''} {
    const keys = await this.redis.keys(\`refresh:*:\${refreshToken}\`);
    if (keys.length > 0) {
      await this.redis.del(...keys);
    }
  }

  private async invalidateAllRefreshTokens(userId${typescript ? ': string' : ''}, sessionId${typescript ? '?: string' : ''})${typescript ? ': Promise<void>' : ''} {
    const pattern = sessionId ? \`refresh:\${userId}:\${sessionId}*\` : \`refresh:\${userId}:*\`;
    const keys = await this.redis.keys(pattern);
    if (keys.length > 0) {
      await this.redis.del(...keys);
    }
  }
  ` : storage === 'memory' ? `
  private async storeSession(sessionId${typescript ? ': string' : ''}, sessionData${typescript ? ': SessionData' : ''})${typescript ? ': Promise<void>' : ''} {
    this.sessionStore.set(sessionId, sessionData);
  }

  private async getSession(sessionId${typescript ? ': string' : ''})${typescript ? ': Promise<SessionData | null>' : ''} {
    return this.sessionStore.get(sessionId) || null;
  }

  private async removeSession(sessionId${typescript ? ': string' : ''})${typescript ? ': Promise<void>' : ''} {
    this.sessionStore.delete(sessionId);
  }
  ` : `
  // Database storage methods would be implemented here
  private async storeSession(sessionId${typescript ? ': string' : ''}, sessionData${typescript ? ': SessionData' : ''})${typescript ? ': Promise<void>' : ''} {
    console.log('Store session:', sessionId, sessionData);
  }

  private async getSession(sessionId${typescript ? ': string' : ''})${typescript ? ': Promise<SessionData | null>' : ''} {
    console.log('Get session:', sessionId);
    return null;
  }

  private async removeSession(sessionId${typescript ? ': string' : ''})${typescript ? ': Promise<void>' : ''} {
    console.log('Remove session:', sessionId);
  }
  `}

  ${auditLogging ? `
  private async logSessionEvent(event${typescript ? ': string' : ''}, userId${typescript ? ': string' : ''}, sessionId${typescript ? '?: string' : ''}, metadata${typescript ? '?: any' : ''})${typescript ? ': Promise<void>' : ''} {
    try {
      const logEntry = {
        event,
        userId,
        sessionId,
        timestamp: new Date().toISOString(),
        metadata,
      };
      
      ${storage === 'redis' ? `
      await this.redis.lpush('audit_log', JSON.stringify(logEntry));
      await this.redis.ltrim('audit_log', 0, 9999); // Keep last 10000 entries
      ` : `
      console.log('Audit log:', logEntry);
      `}
    } catch (error) {
      console.error('Audit logging failed:', error);
    }
  }
  ` : ''}

  ${gdprCompliant ? `
  /**
   * Export all session data for user (GDPR compliance)
   */
  async exportUserData(userId${typescript ? ': string' : ''})${typescript ? ': Promise<any>' : ''} {
    try {
      const sessions = await this.getUserSessions(userId);
      
      return {
        userId,
        sessions: sessions.map(session => ({
          sessionId: session.user.sessionId,
          createdAt: session.createdAt,
          lastActivity: session.lastActivity,
          ipAddress: session.ipAddress ? '[REDACTED]' : undefined,
          userAgent: session.userAgent ? '[REDACTED]' : undefined,
        })),
        exportDate: new Date().toISOString(),
      };
    } catch (error) {
      console.error('User data export error:', error);
      return null;
    }
  }

  /**
   * Delete all user data (GDPR compliance)
   */
  async deleteUserData(userId${typescript ? ': string' : ''})${typescript ? ': Promise<boolean>' : ''} {
    try {
      // Destroy all sessions
      await this.destroyAllUserSessions(userId);
      
      ${auditLogging ? `
      // Log the deletion
      await this.logSessionEvent('user_data_deleted', userId);
      ` : ''}
      
      return true;
    } catch (error) {
      console.error('User data deletion error:', error);
      return false;
    }
  }
  ` : ''}

  /**
   * Clean up expired sessions
   */
  async cleanupExpiredSessions()${typescript ? ': Promise<void>' : ''} {
    try {
      ${storage === 'memory' ? `
      const now = new Date();
      for (const [sessionId, sessionData] of this.sessionStore.entries()) {
        if (now > sessionData.expiresAt) {
          this.sessionStore.delete(sessionId);
        }
      }
      ` : `
      // For Redis, expired keys are automatically cleaned up
      console.log('Session cleanup completed');
      `}
    } catch (error) {
      console.error('Session cleanup error:', error);
    }
  }
}

// Create and export service instance
export const sessionService = new SessionService();

// Export utility functions
export const SessionUtils = {
  /**
   * Generate secure session ID
   */
  generateSecureId()${typescript ? ': string' : ''} {
    return crypto.randomBytes(32).toString('hex');
  },

  /**
   * Hash sensitive data
   */
  hashData(data${typescript ? ': string' : ''})${typescript ? ': string' : ''} {
    return crypto.createHash('sha256').update(data).digest('hex');
  },

  /**
   * Validate session token format
   */
  isValidTokenFormat(token${typescript ? ': string' : ''})${typescript ? ': boolean' : ''} {
    ${sessionType === 'jwt' ? `
    // JWT format validation
    const parts = token.split('.');
    return parts.length === 3;
    ` : `
    // Session ID format validation
    return /^[a-f0-9]{64}$/i.test(token);
    `}
  },
};`;

    const extension = typescript ? '.ts' : '.js';
    fs.writeFileSync(path.join(outputDir, `session${extension}`), serviceContent, 'utf-8');
    result.files.push(path.join(outputDir, `session${extension}`));

    if (typescript) {
      const typesContent = `export interface SessionUser {
  id: string;
  email?: string;
  name?: string;
  roles?: string[];
  permissions?: string[];
  lastLogin?: Date;
  sessionId?: string;
  refreshToken?: string;
  profile?: {
    firstName?: string;
    lastName?: string;
    avatar?: string;
    phone?: string;
    timezone?: string;
    locale?: string;
  };
}

export interface SessionData {
  user: SessionUser;
  createdAt: Date;
  expiresAt: Date;
  lastActivity: Date;
  ipAddress?: string;
  userAgent?: string;
  deviceFingerprint?: string;
  metadata?: {
    loginMethod?: 'password' | 'oauth' | 'mfa' | 'passwordless';
    twoFactorEnabled?: boolean;
    rememberMe?: boolean;
  };
}

export interface SessionConfig {
  tokenExpiry: number;
  refreshTokenExpiry: number;
  secureCookies: boolean;
  sameSite: 'strict' | 'lax' | 'none';
  domain?: string;
  httpOnly: boolean;
  encrypt: boolean;
}

export interface RefreshTokenData {
  userId: string;
  sessionId: string;
  expiresAt: Date;
  deviceFingerprint?: string;
}

export interface AuditLogEntry {
  event: string;
  userId: string;
  sessionId?: string;
  timestamp: string;
  ipAddress?: string;
  userAgent?: string;
  metadata?: any;
}

export type SessionEventType = 
  | 'session_created'
  | 'session_destroyed'
  | 'session_refreshed'
  | 'login_attempt'
  | 'login_success'
  | 'login_failure'
  | 'logout'
  | 'profile_updated'
  | 'password_changed'
  | 'mfa_enabled'
  | 'mfa_disabled'
  | 'all_sessions_destroyed'
  | 'user_data_exported'
  | 'user_data_deleted';`;

      fs.writeFileSync(path.join(outputDir, 'session.types.ts'), typesContent, 'utf-8');
      result.files.push(path.join(outputDir, 'session.types.ts'));
    }

    result.success = true;
  } catch (error: any) {
    result.errors?.push(`Session service generation failed: ${error.message}`);
  }

  return result;
}