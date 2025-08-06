/**
 * Comprehensive Tests for StackAdapterRegistry and UniversalGenerator
 * 
 * Tests all stack adapter functionality including registration, detection,
 * generation capabilities, and error handling across multiple technology stacks.
 */

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { StackAdapterRegistry, UniversalGenerator } from './index';
import type { StackAdapter, StackType, GeneratorContext, GeneratedFile } from '../../types/index';

// Mock adapters
const createMockAdapter = (name: string): StackAdapter => ({
  generateModel: vi.fn().mockResolvedValue([{
    path: `models/${name}.model.ts`,
    content: `// ${name} model`,
    type: 'model'
  }]),
  generateController: vi.fn().mockResolvedValue([{
    path: `controllers/${name}.controller.ts`,
    content: `// ${name} controller`,
    type: 'controller'
  }]),
  generateService: vi.fn().mockResolvedValue([{
    path: `services/${name}.service.ts`,
    content: `// ${name} service`,
    type: 'service'
  }]),
  generateMigration: vi.fn().mockResolvedValue([{
    path: `migrations/${Date.now()}_${name}.ts`,
    content: `// ${name} migration`,
    type: 'migration'
  }]),
  generateRoute: vi.fn().mockResolvedValue([{
    path: `routes/${name}.routes.ts`,
    content: `// ${name} routes`,
    type: 'route'
  }])
});

// Mock file system operations
vi.mock('fs/promises', () => ({
  access: vi.fn(),
  readFile: vi.fn()
}));

vi.mock('glob', () => ({
  glob: vi.fn()
}));

// Mock built-in adapters
vi.mock('./adapters/nextjs.adapter', () => ({
  NextJsAdapter: vi.fn().mockImplementation(() => createMockAdapter('nextjs'))
}));

vi.mock('./adapters/nestjs.adapter', () => ({
  NestJsAdapter: vi.fn().mockImplementation(() => createMockAdapter('nestjs'))
}));

describe('StackAdapterRegistry', () => {
  let registry: StackAdapterRegistry;
  let mockFs: any;
  let mockGlob: any;

  beforeEach(() => {
    vi.clearAllMocks();
    
    // Reset singleton instance
    (StackAdapterRegistry as any).instance = undefined;
    
    // Setup mocks
    mockFs = vi.mocked(require('fs/promises'));
    mockGlob = vi.mocked(require('glob'));
    
    // Default mock implementations
    mockFs.access.mockRejectedValue(new Error('File not found'));
    mockFs.readFile.mockResolvedValue(JSON.stringify({}));
    mockGlob.glob.mockResolvedValue([]);
    
    registry = StackAdapterRegistry.getInstance();
  });

  afterEach(() => {
    vi.resetAllMocks();
  });

  describe('Singleton Pattern', () => {
    it('should return the same instance', () => {
      const registry1 = StackAdapterRegistry.getInstance();
      const registry2 = StackAdapterRegistry.getInstance();
      
      expect(registry1).toBe(registry2);
    });

    it('should initialize with default adapters', () => {
      const availableStacks = registry.getAvailableStacks();
      
      expect(availableStacks).toContain('nextjs');
      expect(availableStacks).toContain('nestjs');
    });

    it('should set default stack to nextjs', () => {
      expect(registry.getCurrentStack()).toBe('nextjs');
    });
  });

  describe('Adapter Registration', () => {
    it('should register new adapter', () => {
      const mockAdapter = createMockAdapter('custom');
      registry.registerAdapter('django' as StackType, mockAdapter);
      
      const availableStacks = registry.getAvailableStacks();
      expect(availableStacks).toContain('django');
    });

    it('should replace existing adapter when re-registering', () => {
      const newMockAdapter = createMockAdapter('new-nextjs');
      registry.registerAdapter('nextjs', newMockAdapter);
      
      const adapter = registry.getAdapter('nextjs');
      expect(adapter).toBe(newMockAdapter);
    });

    it('should get registered adapter', () => {
      const mockAdapter = createMockAdapter('vue');
      registry.registerAdapter('vue' as StackType, mockAdapter);
      
      const retrievedAdapter = registry.getAdapter('vue' as StackType);
      expect(retrievedAdapter).toBe(mockAdapter);
    });

    it('should throw error for unregistered adapter', () => {
      expect(() => registry.getAdapter('unknown' as StackType))
        .toThrow('No adapter found for stack: unknown');
    });
  });

  describe('Stack Management', () => {
    it('should set current stack', () => {
      registry.setCurrentStack('nestjs');
      expect(registry.getCurrentStack()).toBe('nestjs');
    });

    it('should throw error when setting unregistered stack', () => {
      expect(() => registry.setCurrentStack('unknown' as StackType))
        .toThrow('Stack type "unknown" is not registered');
    });

    it('should get adapter for current stack when no type specified', () => {
      registry.setCurrentStack('nestjs');
      const adapter = registry.getAdapter();
      
      expect(adapter).toBeDefined();
      // Should be the nestjs adapter
    });

    it('should list all available stacks', () => {
      const customAdapter = createMockAdapter('custom');
      registry.registerAdapter('django' as StackType, customAdapter);
      
      const stacks = registry.getAvailableStacks();
      
      expect(stacks).toContain('nextjs');
      expect(stacks).toContain('nestjs');
      expect(stacks).toContain('django');
    });
  });

  describe('Stack Detection', () => {
    describe('Next.js Detection', () => {
      it('should detect Next.js from next.config.js', async () => {
        mockFs.access.mockImplementation((path) => {
          if (path.includes('next.config.js')) return Promise.resolve();
          return Promise.reject(new Error('Not found'));
        });
        
        const stackType = await registry.detectStack('/test/project');
        expect(stackType).toBe('nextjs');
      });

      it('should detect Next.js from next.config.ts', async () => {
        mockFs.access.mockImplementation((path) => {
          if (path.includes('next.config.ts')) return Promise.resolve();
          return Promise.reject(new Error('Not found'));
        });
        
        const stackType = await registry.detectStack('/test/project');
        expect(stackType).toBe('nextjs');
      });
    });

    describe('NestJS Detection', () => {
      it('should detect NestJS from nest-cli.json', async () => {
        mockFs.access.mockImplementation((path) => {
          if (path.includes('nest-cli.json')) return Promise.resolve();
          return Promise.reject(new Error('Not found'));
        });
        
        const stackType = await registry.detectStack('/test/project');
        expect(stackType).toBe('nestjs');
      });
    });

    describe('Django Detection', () => {
      it('should detect Django from manage.py and requirements.txt', async () => {
        mockFs.access.mockImplementation((path) => {
          if (path.includes('manage.py') || path.includes('requirements.txt')) {
            return Promise.resolve();
          }
          return Promise.reject(new Error('Not found'));
        });
        
        const stackType = await registry.detectStack('/test/project');
        expect(stackType).toBe('django');
      });

      it('should not detect Django with only manage.py', async () => {
        mockFs.access.mockImplementation((path) => {
          if (path.includes('manage.py')) return Promise.resolve();
          return Promise.reject(new Error('Not found'));
        });
        
        const stackType = await registry.detectStack('/test/project');
        expect(stackType).not.toBe('django');
      });
    });

    describe('.NET Detection', () => {
      it('should detect .NET from .csproj files', async () => {
        mockGlob.glob.mockImplementation((pattern) => {
          if (pattern.includes('*.csproj')) return Promise.resolve(['project.csproj']);
          return Promise.resolve([]);
        });
        
        const stackType = await registry.detectStack('/test/project');
        expect(stackType).toBe('dotnet');
      });

      it('should detect .NET from .sln files', async () => {
        mockGlob.glob.mockImplementation((pattern) => {
          if (pattern.includes('*.sln')) return Promise.resolve(['solution.sln']);
          return Promise.resolve([]);
        });
        
        const stackType = await registry.detectStack('/test/project');
        expect(stackType).toBe('dotnet');
      });
    });

    describe('Angular Detection', () => {
      it('should detect Angular from angular.json', async () => {
        mockFs.access.mockImplementation((path) => {
          if (path.includes('angular.json')) return Promise.resolve();
          return Promise.reject(new Error('Not found'));
        });
        
        const stackType = await registry.detectStack('/test/project');
        expect(stackType).toBe('angular');
      });
    });

    describe('Vue Detection', () => {
      it('should detect Vue from vue.config.js', async () => {
        mockFs.access.mockImplementation((path) => {
          if (path.includes('vue.config.js')) return Promise.resolve();
          return Promise.reject(new Error('Not found'));
        });
        
        const stackType = await registry.detectStack('/test/project');
        expect(stackType).toBe('vue');
      });
    });

    describe('Laravel Detection', () => {
      it('should detect Laravel from artisan and composer.json', async () => {
        mockFs.access.mockImplementation((path) => {
          if (path.includes('artisan') || path.includes('composer.json')) {
            return Promise.resolve();
          }
          return Promise.reject(new Error('Not found'));
        });
        
        const stackType = await registry.detectStack('/test/project');
        expect(stackType).toBe('laravel');
      });
    });

    describe('React Detection', () => {
      it('should detect React from package.json dependencies', async () => {
        mockFs.access.mockImplementation((path) => {
          if (path.includes('package.json')) return Promise.resolve();
          return Promise.reject(new Error('Not found'));
        });
        
        mockFs.readFile.mockResolvedValue(JSON.stringify({
          dependencies: { react: '^18.0.0' }
        }));
        
        const stackType = await registry.detectStack('/test/project');
        expect(stackType).toBe('react');
      });
    });

    describe('Default Detection', () => {
      it('should default to nextjs when no stack detected', async () => {
        mockFs.access.mockRejectedValue(new Error('Not found'));
        mockGlob.glob.mockResolvedValue([]);
        
        const stackType = await registry.detectStack('/test/project');
        expect(stackType).toBe('nextjs');
      });
    });

    describe('Detection with Custom Project Path', () => {
      it('should use custom project path for detection', async () => {
        const customPath = '/custom/project/path';
        
        mockFs.access.mockImplementation((path) => {
          if (path.startsWith(customPath) && path.includes('next.config.js')) {
            return Promise.resolve();
          }
          return Promise.reject(new Error('Not found'));
        });
        
        const stackType = await registry.detectStack(customPath);
        expect(stackType).toBe('nextjs');
      });

      it('should use default path when none provided', async () => {
        mockFs.access.mockImplementation((path) => {
          if (path.startsWith('.') && path.includes('nest-cli.json')) {
            return Promise.resolve();
          }
          return Promise.reject(new Error('Not found'));
        });
        
        const stackType = await registry.detectStack();
        expect(stackType).toBe('nestjs');
      });
    });

    describe('File Existence Checking', () => {
      it('should handle glob patterns', async () => {
        mockGlob.glob.mockImplementation((pattern) => {
          if (pattern.includes('*.csproj')) return Promise.resolve(['test.csproj']);
          return Promise.resolve([]);
        });
        
        const stackType = await registry.detectStack('/test/project');
        expect(stackType).toBe('dotnet');
        expect(mockGlob.glob).toHaveBeenCalledWith('/test/project/*.csproj');
      });

      it('should handle direct file checks', async () => {
        mockFs.access.mockImplementation((path) => {
          if (path.includes('nest-cli.json')) return Promise.resolve();
          throw new Error('Not found');
        });
        
        const stackType = await registry.detectStack('/test/project');
        expect(stackType).toBe('nestjs');
        expect(mockFs.access).toHaveBeenCalledWith('/test/project/nest-cli.json');
      });

      it('should handle file access errors gracefully', async () => {
        mockFs.access.mockRejectedValue(new Error('Permission denied'));
        mockGlob.glob.mockRejectedValue(new Error('Permission denied'));
        
        const stackType = await registry.detectStack('/test/project');
        expect(stackType).toBe('nextjs'); // Default fallback
      });
    });

    describe('Priority Order', () => {
      it('should detect Next.js over React when both are present', async () => {
        mockFs.access.mockImplementation((path) => {
          if (path.includes('next.config.js') || path.includes('package.json')) {
            return Promise.resolve();
          }
          throw new Error('Not found');
        });
        
        mockFs.readFile.mockResolvedValue(JSON.stringify({
          dependencies: { next: '^14.0.0', react: '^18.0.0' }
        }));
        
        const stackType = await registry.detectStack('/test/project');
        expect(stackType).toBe('nextjs');
      });

      it('should detect framework-specific config over generic React', async () => {
        mockFs.access.mockImplementation((path) => {
          if (path.includes('angular.json') || path.includes('package.json')) {
            return Promise.resolve();
          }
          throw new Error('Not found');
        });
        
        mockFs.readFile.mockResolvedValue(JSON.stringify({
          dependencies: { '@angular/core': '^17.0.0', react: '^18.0.0' }
        }));
        
        const stackType = await registry.detectStack('/test/project');
        expect(stackType).toBe('angular');
      });
    });
  });

  describe('Error Handling', () => {
    it('should handle file system errors during detection', async () => {
      mockFs.access.mockRejectedValue(new Error('File system error'));
      mockFs.readFile.mockRejectedValue(new Error('Read error'));
      mockGlob.glob.mockRejectedValue(new Error('Glob error'));
      
      const stackType = await registry.detectStack('/test/project');
      expect(stackType).toBe('nextjs'); // Should fall back to default
    });

    it('should handle malformed package.json', async () => {
      mockFs.access.mockImplementation((path) => {
        if (path.includes('package.json')) return Promise.resolve();
        throw new Error('Not found');
      });
      
      mockFs.readFile.mockResolvedValue('{ invalid json }');
      
      const stackType = await registry.detectStack('/test/project');
      expect(stackType).toBe('nextjs'); // Should fall back to default
    });
  });
});

describe('UniversalGenerator', () => {
  let generator: UniversalGenerator;
  let registry: StackAdapterRegistry;
  let mockContext: GeneratorContext;

  beforeEach(() => {
    vi.clearAllMocks();
    
    // Reset singleton instance
    (StackAdapterRegistry as any).instance = undefined;
    
    registry = StackAdapterRegistry.getInstance();
    generator = new UniversalGenerator();
    
    mockContext = {
      stackType: 'nextjs',
      entityName: 'User',
      fields: [
        { name: 'id', type: 'string', required: true },
        { name: 'email', type: 'string', required: true },
        { name: 'name', type: 'string', required: false }
      ],
      options: {
        typescript: true,
        auth: true
      }
    };
  });

  describe('Model Generation', () => {
    it('should generate model using correct adapter', async () => {
      const files = await generator.generateModel(mockContext);
      
      expect(files).toHaveLength(1);
      expect(files[0].path).toContain('models/nextjs.model.ts');
      expect(files[0].content).toContain('// nextjs model');
      expect(files[0].type).toBe('model');
      
      const adapter = registry.getAdapter('nextjs');
      expect(adapter.generateModel).toHaveBeenCalledWith(mockContext);
    });

    it('should handle different stack types', async () => {
      const nestjsContext = { ...mockContext, stackType: 'nestjs' as StackType };
      
      const files = await generator.generateModel(nestjsContext);
      
      expect(files[0].content).toContain('// nestjs model');
      
      const adapter = registry.getAdapter('nestjs');
      expect(adapter.generateModel).toHaveBeenCalledWith(nestjsContext);
    });

    it('should throw error for unregistered stack', async () => {
      const invalidContext = { ...mockContext, stackType: 'unknown' as StackType };
      
      await expect(generator.generateModel(invalidContext))
        .rejects.toThrow('No adapter found for stack: unknown');
    });
  });

  describe('Controller Generation', () => {
    it('should generate controller using correct adapter', async () => {
      const files = await generator.generateController(mockContext);
      
      expect(files).toHaveLength(1);
      expect(files[0].path).toContain('controllers/nextjs.controller.ts');
      expect(files[0].content).toContain('// nextjs controller');
      expect(files[0].type).toBe('controller');
    });

    it('should pass context correctly to adapter', async () => {
      await generator.generateController(mockContext);
      
      const adapter = registry.getAdapter('nextjs');
      expect(adapter.generateController).toHaveBeenCalledWith(mockContext);
    });
  });

  describe('Service Generation', () => {
    it('should generate service using correct adapter', async () => {
      const files = await generator.generateService(mockContext);
      
      expect(files).toHaveLength(1);
      expect(files[0].path).toContain('services/nextjs.service.ts');
      expect(files[0].content).toContain('// nextjs service');
      expect(files[0].type).toBe('service');
    });

    it('should handle complex context options', async () => {
      const complexContext = {
        ...mockContext,
        options: {
          typescript: true,
          auth: true,
          database: 'postgres',
          cache: 'redis'
        }
      };
      
      await generator.generateService(complexContext);
      
      const adapter = registry.getAdapter('nextjs');
      expect(adapter.generateService).toHaveBeenCalledWith(complexContext);
    });
  });

  describe('Migration Generation', () => {
    it('should generate migration using correct adapter', async () => {
      const files = await generator.generateMigration(mockContext);
      
      expect(files).toHaveLength(1);
      expect(files[0].path).toContain('migrations/');
      expect(files[0].path).toContain('nextjs.ts');
      expect(files[0].content).toContain('// nextjs migration');
      expect(files[0].type).toBe('migration');
    });

    it('should handle different entity types', async () => {
      const orderContext = { ...mockContext, entityName: 'Order' };
      
      await generator.generateMigration(orderContext);
      
      const adapter = registry.getAdapter('nextjs');
      expect(adapter.generateMigration).toHaveBeenCalledWith(orderContext);
    });
  });

  describe('Route Generation', () => {
    it('should generate route using correct adapter', async () => {
      const files = await generator.generateRoute(mockContext);
      
      expect(files).toHaveLength(1);
      expect(files[0].path).toContain('routes/nextjs.routes.ts');
      expect(files[0].content).toContain('// nextjs routes');
      expect(files[0].type).toBe('route');
    });

    it('should handle route generation for different HTTP methods', async () => {
      const routeContext = {
        ...mockContext,
        options: {
          ...mockContext.options,
          methods: ['GET', 'POST', 'PUT', 'DELETE']
        }
      };
      
      await generator.generateRoute(routeContext);
      
      const adapter = registry.getAdapter('nextjs');
      expect(adapter.generateRoute).toHaveBeenCalledWith(routeContext);
    });
  });

  describe('Cross-Stack Generation', () => {
    it('should generate for multiple stacks', async () => {
      const stacks: StackType[] = ['nextjs', 'nestjs'];
      const results: GeneratedFile[][] = [];
      
      for (const stack of stacks) {
        const context = { ...mockContext, stackType: stack };
        const files = await generator.generateModel(context);
        results.push(files);
      }
      
      expect(results).toHaveLength(2);
      expect(results[0][0].content).toContain('// nextjs model');
      expect(results[1][0].content).toContain('// nestjs model');
    });

    it('should maintain context integrity across generations', async () => {
      const contextWithFields = {
        ...mockContext,
        fields: [
          { name: 'id', type: 'number', required: true },
          { name: 'title', type: 'string', required: true },
          { name: 'completed', type: 'boolean', required: false }
        ]
      };
      
      await generator.generateModel(contextWithFields);
      await generator.generateController(contextWithFields);
      await generator.generateService(contextWithFields);
      
      const adapter = registry.getAdapter('nextjs');
      expect(adapter.generateModel).toHaveBeenCalledWith(contextWithFields);
      expect(adapter.generateController).toHaveBeenCalledWith(contextWithFields);
      expect(adapter.generateService).toHaveBeenCalledWith(contextWithFields);
    });
  });

  describe('Error Propagation', () => {
    it('should propagate adapter errors', async () => {
      const adapter = registry.getAdapter('nextjs');
      const error = new Error('Adapter generation failed');
      vi.mocked(adapter.generateModel).mockRejectedValue(error);
      
      await expect(generator.generateModel(mockContext))
        .rejects.toThrow('Adapter generation failed');
    });

    it('should handle adapter method failures gracefully', async () => {
      const adapter = registry.getAdapter('nestjs');
      vi.mocked(adapter.generateController).mockRejectedValue(new Error('Controller generation failed'));
      
      const context = { ...mockContext, stackType: 'nestjs' as StackType };
      
      await expect(generator.generateController(context))
        .rejects.toThrow('Controller generation failed');
    });
  });

  describe('Integration Testing', () => {
    it('should work with registry stack switching', async () => {
      // Start with nextjs
      let files = await generator.generateModel(mockContext);
      expect(files[0].content).toContain('// nextjs model');
      
      // Switch to nestjs
      registry.setCurrentStack('nestjs');
      const nestjsContext = { ...mockContext, stackType: 'nestjs' as StackType };
      files = await generator.generateModel(nestjsContext);
      expect(files[0].content).toContain('// nestjs model');
    });

    it('should handle custom registered adapters', async () => {
      const customAdapter = createMockAdapter('custom');
      registry.registerAdapter('django' as StackType, customAdapter);
      
      const djangoContext = { ...mockContext, stackType: 'django' as StackType };
      const files = await generator.generateModel(djangoContext);
      
      expect(files[0].content).toContain('// custom model');
      expect(customAdapter.generateModel).toHaveBeenCalledWith(djangoContext);
    });
  });
});