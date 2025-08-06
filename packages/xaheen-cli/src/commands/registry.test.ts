/**
 * Comprehensive Tests for Registry Commands
 * 
 * Tests all registry functionality including add, list, info, search,
 * build, serve commands with various options and error scenarios.
 */

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { existsSync, mkdirSync, readFileSync, writeFileSync } from 'fs';
import { RegistryCommand } from './registry';
import { Command } from 'commander';

// Mock all external dependencies
vi.mock('fs', () => ({
  existsSync: vi.fn(),
  mkdirSync: vi.fn(),
  readFileSync: vi.fn(),
  writeFileSync: vi.fn()
}));

vi.mock('path', () => ({
  join: vi.fn((...paths) => paths.join('/')),
  resolve: vi.fn((...paths) => '/' + paths.filter(p => p !== '.').join('/')),
  dirname: vi.fn(path => path.split('/').slice(0, -1).join('/'))
}));

vi.mock('node-fetch', () => ({
  default: vi.fn()
}));

vi.mock('ora', () => ({
  default: vi.fn(() => ({
    start: vi.fn().mockReturnThis(),
    stop: vi.fn().mockReturnThis(),
    succeed: vi.fn().mockReturnThis(),
    fail: vi.fn().mockReturnThis(),
    text: ''
  }))
}));

vi.mock('chalk', () => ({
  default: {
    blue: vi.fn(str => str),
    green: vi.fn(str => str),
    yellow: vi.fn(str => str),
    red: vi.fn(str => str),
    gray: vi.fn(str => str)
  }
}));

vi.mock('../services/configuration.service', () => ({
  ConfigurationService: vi.fn().mockImplementation(() => ({
    load: vi.fn().mockResolvedValue({
      framework: 'react',
      paths: {
        components: 'src/components',
        aliases: {
          '@/components': './components',
          '@/utils': './utils'
        }
      }
    })
  }))
}));

vi.mock('../utils/logger', () => ({
  logger: {
    info: vi.fn(),
    warn: vi.fn(),
    success: vi.fn(),
    error: vi.fn()
  }
}));

vi.mock('../utils/error-handler', () => ({
  handleError: vi.fn()
}));

vi.mock('child_process', () => ({
  execSync: vi.fn()
}));

describe('RegistryCommand', () => {
  let registryCommand: RegistryCommand;
  let mockConsoleLog: any;
  let mockFetch: any;
  let mockOra: any;

  const mockRegistryIndex = {
    items: [
      {
        name: 'button',
        type: 'registry:component',
        title: 'Button Component',
        description: 'A customizable button component',
        category: 'ui',
        platforms: ['react', 'nextjs'],
        dependencies: ['clsx'],
        devDependencies: ['@types/react'],
        registryDependencies: ['icon'],
        nsm: {
          classification: 'OPEN',
          wcagLevel: 'AAA',
          norwegianOptimized: true
        },
        files: [
          {
            path: 'button.tsx',
            type: 'component',
            content: 'import React from "react";\nexport const Button = () => <button>Click me</button>;'
          }
        ],
        cssVars: {
          '--button-bg': '#007bff'
        },
        config: {
          typescript: true
        }
      },
      {
        name: 'card',
        type: 'registry:component',
        title: 'Card Component',
        description: 'A flexible card component',
        category: 'layout',
        platforms: ['react', 'vue'],
        dependencies: [],
        files: [
          {
            path: 'card.tsx',
            type: 'component',
            content: 'import React from "react";\nexport const Card = ({ children }) => <div className="card">{children}</div>;'
          }
        ]
      }
    ]
  };

  const mockRegistryItem = mockRegistryIndex.items[0];

  beforeEach(() => {
    vi.clearAllMocks();
    
    registryCommand = new RegistryCommand();
    mockConsoleLog = vi.fn();
    console.log = mockConsoleLog;

    // Setup mocks
    mockOra = require('ora').default;
    mockFetch = require('node-fetch').default;
    
    // Mock process.cwd
    vi.spyOn(process, 'cwd').mockReturnValue('/test/project');
  });

  afterEach(() => {
    vi.resetAllMocks();
  });

  describe('Command Setup', () => {
    it('should create registry command with correct structure', () => {
      const command = registryCommand.getCommand();
      
      expect(command).toBeInstanceOf(Command);
      expect(command.name()).toBe('registry');
      expect(command.alias()).toBe('reg');
      expect(command.description()).toBe('Manage Xaheen component registry');
      
      // Check subcommands exist
      const subcommands = command.commands.map(cmd => cmd.name());
      expect(subcommands).toContain('add');
      expect(subcommands).toContain('list');
      expect(subcommands).toContain('info');
      expect(subcommands).toContain('search');
    });

    it('should have proper command options', () => {
      const command = registryCommand.getCommand();
      const options = command.options.map(opt => opt.long);
      
      expect(options).toContain('--local');
      expect(options).toContain('--url');
    });
  });

  describe('Registry Add Command', () => {
    beforeEach(() => {
      vi.mocked(existsSync).mockReturnValue(true);
      vi.mocked(mkdirSync).mockImplementation(() => undefined);
      vi.mocked(writeFileSync).mockImplementation(() => undefined);
      mockFetch.mockResolvedValue({
        ok: true,
        json: () => Promise.resolve(mockRegistryItem)
      });
    });

    it('should add components from remote registry', async () => {
      await registryCommand['handleAdd'](['button'], {
        path: 'src/components',
        platform: 'react'
      });

      // Verify fetch was called for registry item
      expect(mockFetch).toHaveBeenCalledWith(
        expect.stringContaining('/button.json')
      );

      // Verify file was written
      expect(writeFileSync).toHaveBeenCalledWith(
        expect.stringContaining('button.tsx'),
        expect.stringContaining('export const Button')
      );

      // Verify success messages
      expect(mockConsoleLog).toHaveBeenCalledWith(
        expect.stringContaining('Installation completed successfully')
      );
    });

    it('should add components from local registry', async () => {
      vi.mocked(readFileSync).mockReturnValue(JSON.stringify(mockRegistryItem));
      
      await registryCommand['handleAdd'](['button'], {
        local: '/local/registry',
        platform: 'react'
      });

      // Verify local file was read
      expect(readFileSync).toHaveBeenCalledWith(
        expect.stringContaining('button.json'),
        'utf-8'
      );
      
      expect(writeFileSync).toHaveBeenCalled();
    });

    it('should handle platform-specific files', async () => {
      const multiPlatformItem = {
        ...mockRegistryItem,
        files: [
          {
            path: 'button.tsx',
            type: 'component',
            platform: 'react',
            content: 'React button'
          },
          {
            path: 'button.vue',
            type: 'component',
            platform: 'vue',
            content: 'Vue button'
          }
        ]
      };

      mockFetch.mockResolvedValue({
        ok: true,
        json: () => Promise.resolve(multiPlatformItem)
      });

      await registryCommand['handleAdd'](['button'], {
        platform: 'react'
      });

      // Should only write React file
      expect(writeFileSync).toHaveBeenCalledWith(
        expect.any(String),
        'React button'
      );
      expect(writeFileSync).not.toHaveBeenCalledWith(
        expect.any(String),
        'Vue button'
      );
    });

    it('should handle registry dependencies recursively', async () => {
      const buttonWithDeps = {
        ...mockRegistryItem,
        registryDependencies: ['icon']
      };

      const iconItem = {
        name: 'icon',
        type: 'registry:component',
        files: [
          {
            path: 'icon.tsx',
            type: 'component',
            content: 'Icon component'
          }
        ]
      };

      mockFetch
        .mockResolvedValueOnce({
          ok: true,
          json: () => Promise.resolve(buttonWithDeps)
        })
        .mockResolvedValueOnce({
          ok: true,
          json: () => Promise.resolve(iconItem)
        });

      await registryCommand['handleAdd'](['button'], {});

      // Should fetch both button and icon
      expect(mockFetch).toHaveBeenCalledTimes(2);
      expect(mockFetch).toHaveBeenCalledWith(
        expect.stringContaining('/button.json')
      );
      expect(mockFetch).toHaveBeenCalledWith(
        expect.stringContaining('/icon.json')
      );
    });

    it('should skip unsupported platforms with warning', async () => {
      const { logger } = require('../utils/logger');

      await registryCommand['handleAdd'](['button'], {
        platform: 'angular' // Not supported by button
      });

      expect(logger.warn).toHaveBeenCalledWith(
        expect.stringContaining('does not support platform: angular')
      );
    });

    it('should handle file existence without overwrite', async () => {
      const { logger } = require('../utils/logger');
      
      vi.mocked(existsSync).mockImplementation((path) => 
        path.toString().includes('button.tsx') ? true : false
      );

      await registryCommand['handleAdd'](['button'], {
        overwrite: false
      });

      expect(logger.warn).toHaveBeenCalledWith(
        expect.stringContaining('File already exists')
      );
      expect(writeFileSync).not.toHaveBeenCalled();
    });

    it('should overwrite existing files when specified', async () => {
      vi.mocked(existsSync).mockImplementation((path) => 
        path.toString().includes('button.tsx') ? true : false
      );

      await registryCommand['handleAdd'](['button'], {
        overwrite: true
      });

      expect(writeFileSync).toHaveBeenCalled();
    });

    it('should install dependencies with different package managers', async () => {
      const { execSync } = require('child_process');
      
      const itemWithDeps = {
        ...mockRegistryItem,
        dependencies: ['clsx', 'framer-motion'],
        devDependencies: ['@types/react']
      };

      mockFetch.mockResolvedValue({
        ok: true,
        json: () => Promise.resolve(itemWithDeps)
      });

      await registryCommand['handleAdd'](['button'], {
        npm: true
      });

      expect(execSync).toHaveBeenCalledWith(
        'npm install clsx framer-motion',
        { stdio: 'inherit' }
      );
      expect(execSync).toHaveBeenCalledWith(
        'npm install --save-dev @types/react',
        { stdio: 'inherit' }
      );
    });

    it('should skip dependency installation when specified', async () => {
      const { execSync } = require('child_process');

      await registryCommand['handleAdd'](['button'], {
        noDeps: true
      });

      expect(execSync).not.toHaveBeenCalled();
    });

    it('should transform import paths', async () => {
      const contentWithImports = 'import { cn } from "@/utils/cn";\nimport Button from "@/components/button";';
      
      const result = registryCommand['transformImports'](contentWithImports, {
        paths: {
          aliases: {
            '@/utils': './lib/utils',
            '@/components': './components'
          }
        }
      });

      expect(result).toContain('from \'./lib/utils');
      expect(result).toContain('from \'./components');
    });

    it('should handle registry add errors', async () => {
      const { handleError } = require('../utils/error-handler');
      
      mockFetch.mockRejectedValue(new Error('Network error'));

      await registryCommand['handleAdd'](['button'], {});

      expect(handleError).toHaveBeenCalledWith(expect.any(Error));
      expect(mockOra().fail).toHaveBeenCalledWith('Installation failed');
    });

    it('should handle local registry path not found', async () => {
      vi.mocked(existsSync).mockReturnValue(false);

      await expect(
        registryCommand['handleAdd'](['button'], {
          local: '/nonexistent/path'
        })
      ).rejects.toThrow('Local registry path not found');
    });

    it('should display NSM classification information', async () => {
      const { logger } = require('../utils/logger');

      await registryCommand['handleAdd'](['button'], {});

      expect(logger.info).toHaveBeenCalledWith(
        expect.stringContaining('NSM Classification: OPEN')
      );
    });
  });

  describe('Registry List Command', () => {
    beforeEach(() => {
      mockFetch.mockResolvedValue({
        ok: true,
        json: () => Promise.resolve(mockRegistryIndex)
      });
    });

    it('should list all registry items', async () => {
      await registryCommand['handleList']({});

      expect(mockFetch).toHaveBeenCalledWith(
        expect.stringContaining('/index.json')
      );
      
      expect(mockConsoleLog).toHaveBeenCalledWith(
        expect.stringContaining('Available Registry Items')
      );
      expect(mockConsoleLog).toHaveBeenCalledWith(
        expect.stringContaining('button')
      );
      expect(mockConsoleLog).toHaveBeenCalledWith(
        expect.stringContaining('card')
      );
    });

    it('should filter by category', async () => {
      await registryCommand['handleList']({ category: 'ui' });

      // Should display button (category: ui) but not card (category: layout)
      const logCalls = mockConsoleLog.mock.calls.map(call => call[0]);
      const hasButton = logCalls.some(call => 
        typeof call === 'string' && call.includes('button')
      );
      const hasCard = logCalls.some(call => 
        typeof call === 'string' && call.includes('card') && call.includes('Card Component')
      );

      expect(hasButton).toBe(true);
      // Card should not be displayed in detail since it's not in 'ui' category
    });

    it('should filter by platform', async () => {
      await registryCommand['handleList']({ platform: 'vue' });

      // Should display card (supports vue) but button details should be filtered
      expect(mockConsoleLog).toHaveBeenCalledWith(
        expect.stringContaining('card')
      );
    });

    it('should filter by NSM classification', async () => {
      await registryCommand['handleList']({ nsm: 'OPEN' });

      expect(mockConsoleLog).toHaveBeenCalledWith(
        expect.stringContaining('button')
      );
    });

    it('should handle empty results gracefully', async () => {
      mockFetch.mockResolvedValue({
        ok: true,
        json: () => Promise.resolve({ items: [] })
      });

      await registryCommand['handleList']({});

      expect(mockConsoleLog).toHaveBeenCalledWith(
        expect.stringContaining('Available Registry Items')
      );
    });

    it('should use local registry when specified', async () => {
      vi.mocked(readFileSync).mockReturnValue(JSON.stringify(mockRegistryIndex));

      await registryCommand['handleList']({ local: '/local/registry' });

      expect(readFileSync).toHaveBeenCalledWith(
        expect.stringContaining('index.json'),
        'utf-8'
      );
      expect(mockFetch).not.toHaveBeenCalled();
    });

    it('should handle registry fetch errors', async () => {
      const { handleError } = require('../utils/error-handler');
      
      mockFetch.mockRejectedValue(new Error('Network error'));

      await registryCommand['handleList']({});

      expect(handleError).toHaveBeenCalledWith(expect.any(Error));
      expect(mockOra().fail).toHaveBeenCalledWith('Failed to fetch registry');
    });
  });

  describe('Registry Info Command', () => {
    beforeEach(() => {
      mockFetch.mockResolvedValue({
        ok: true,
        json: () => Promise.resolve(mockRegistryItem)
      });
    });

    it('should show detailed component information', async () => {
      await registryCommand['handleInfo']('button');

      expect(mockFetch).toHaveBeenCalledWith(
        expect.stringContaining('/button.json')
      );

      expect(mockConsoleLog).toHaveBeenCalledWith(
        expect.stringContaining('Button Component')
      );
      expect(mockConsoleLog).toHaveBeenCalledWith(
        expect.stringContaining('A customizable button component')
      );
      expect(mockConsoleLog).toHaveBeenCalledWith(
        expect.stringContaining('Type: registry:component')
      );
      expect(mockConsoleLog).toHaveBeenCalledWith(
        expect.stringContaining('Category: ui')
      );
      expect(mockConsoleLog).toHaveBeenCalledWith(
        expect.stringContaining('Platforms: react, nextjs')
      );
    });

    it('should display Norwegian compliance information', async () => {
      await registryCommand['handleInfo']('button');

      expect(mockConsoleLog).toHaveBeenCalledWith(
        expect.stringContaining('Norwegian Compliance')
      );
      expect(mockConsoleLog).toHaveBeenCalledWith(
        expect.stringContaining('NSM Classification: OPEN')
      );
      expect(mockConsoleLog).toHaveBeenCalledWith(
        expect.stringContaining('WCAG Level: AAA')
      );
      expect(mockConsoleLog).toHaveBeenCalledWith(
        expect.stringContaining('Norwegian Optimized: Yes')
      );
    });

    it('should display dependencies', async () => {
      await registryCommand['handleInfo']('button');

      expect(mockConsoleLog).toHaveBeenCalledWith(
        expect.stringContaining('Dependencies:')
      );
      expect(mockConsoleLog).toHaveBeenCalledWith(
        expect.stringContaining('- clsx')
      );
    });

    it('should display registry dependencies', async () => {
      await registryCommand['handleInfo']('button');

      expect(mockConsoleLog).toHaveBeenCalledWith(
        expect.stringContaining('Registry Dependencies:')
      );
      expect(mockConsoleLog).toHaveBeenCalledWith(
        expect.stringContaining('- icon')
      );
    });

    it('should display file information', async () => {
      await registryCommand['handleInfo']('button');

      expect(mockConsoleLog).toHaveBeenCalledWith(
        expect.stringContaining('Files:')
      );
      expect(mockConsoleLog).toHaveBeenCalledWith(
        expect.stringContaining('- button.tsx (component)')
      );
    });

    it('should show installation command', async () => {
      await registryCommand['handleInfo']('button');

      expect(mockConsoleLog).toHaveBeenCalledWith(
        expect.stringContaining('To install: xaheen registry add button')
      );
    });

    it('should handle component not found', async () => {
      const { handleError } = require('../utils/error-handler');
      
      mockFetch.mockResolvedValue({
        ok: false,
        statusText: 'Not Found'
      });

      await registryCommand['handleInfo']('nonexistent');

      expect(handleError).toHaveBeenCalledWith(expect.any(Error));
      expect(mockOra().fail).toHaveBeenCalledWith('Failed to fetch component info');
    });
  });

  describe('Registry Search Command', () => {
    beforeEach(() => {
      mockFetch.mockResolvedValue({
        ok: true,
        json: () => Promise.resolve(mockRegistryIndex)
      });
    });

    it('should search by component name', async () => {
      await registryCommand['handleSearch']('button');

      expect(mockConsoleLog).toHaveBeenCalledWith(
        expect.stringContaining('Search Results for "button"')
      );
      expect(mockConsoleLog).toHaveBeenCalledWith(
        expect.stringContaining('button')
      );
    });

    it('should search by title', async () => {
      await registryCommand['handleSearch']('Button Component');

      expect(mockConsoleLog).toHaveBeenCalledWith(
        expect.stringContaining('Search Results')
      );
      expect(mockConsoleLog).toHaveBeenCalledWith(
        expect.stringContaining('button')
      );
    });

    it('should search by description', async () => {
      await registryCommand['handleSearch']('customizable');

      expect(mockConsoleLog).toHaveBeenCalledWith(
        expect.stringContaining('button')
      );
    });

    it('should handle no results found', async () => {
      await registryCommand['handleSearch']('nonexistent');

      expect(mockConsoleLog).toHaveBeenCalledWith(
        expect.stringContaining('No results found')
      );
    });

    it('should handle search errors', async () => {
      const { handleError } = require('../utils/error-handler');
      
      mockFetch.mockRejectedValue(new Error('Network error'));

      await registryCommand['handleSearch']('button');

      expect(handleError).toHaveBeenCalledWith(expect.any(Error));
      expect(mockOra().fail).toHaveBeenCalledWith('Search failed');
    });
  });

  describe('Utility Methods', () => {
    describe('fetchRegistryIndex', () => {
      it('should fetch from remote registry', async () => {
        mockFetch.mockResolvedValue({
          ok: true,
          json: () => Promise.resolve(mockRegistryIndex)
        });

        const result = await registryCommand['fetchRegistryIndex']();

        expect(mockFetch).toHaveBeenCalledWith(
          expect.stringContaining('/index.json')
        );
        expect(result).toEqual(mockRegistryIndex);
      });

      it('should read from local registry', async () => {
        (registryCommand as any).localRegistryPath = '/local/registry';
        vi.mocked(readFileSync).mockReturnValue(JSON.stringify(mockRegistryIndex));

        const result = await registryCommand['fetchRegistryIndex']();

        expect(readFileSync).toHaveBeenCalledWith(
          expect.stringContaining('index.json'),
          'utf-8'
        );
        expect(result).toEqual(mockRegistryIndex);
        expect(mockFetch).not.toHaveBeenCalled();
      });

      it('should handle fetch errors', async () => {
        mockFetch.mockResolvedValue({
          ok: false,
          statusText: 'Internal Server Error'
        });

        await expect(
          registryCommand['fetchRegistryIndex']()
        ).rejects.toThrow('Failed to fetch registry index: Internal Server Error');
      });
    });

    describe('fetchRegistryItem', () => {
      it('should validate registry item schema', async () => {
        const invalidItem = {
          name: 'invalid',
          type: 'invalid-type' // Invalid enum value
        };

        mockFetch.mockResolvedValue({
          ok: true,
          json: () => Promise.resolve(invalidItem)
        });

        await expect(
          registryCommand['fetchRegistryItem']('invalid')
        ).rejects.toThrow();
      });

      it('should handle local item not found', async () => {
        (registryCommand as any).localRegistryPath = '/local/registry';
        vi.mocked(existsSync).mockReturnValue(false);

        await expect(
          registryCommand['fetchRegistryItem']('nonexistent')
        ).rejects.toThrow('Registry item not found: nonexistent');
      });
    });

    describe('installDependencies', () => {
      it('should install with different package managers', async () => {
        const { execSync } = require('child_process');
        const packageManagers = [
          { option: 'npm', command: 'npm install' },
          { option: 'yarn', command: 'yarn add' },
          { option: 'pnpm', command: 'pnpm add' },
          { option: 'bun', command: 'bun add' } // default
        ];

        for (const pm of packageManagers) {
          const options = pm.option === 'bun' ? {} : { [pm.option]: true };
          
          await registryCommand['installDependencies'](
            ['lodash'],
            ['@types/lodash'],
            options
          );

          expect(execSync).toHaveBeenCalledWith(
            `${pm.command} lodash`,
            { stdio: 'inherit' }
          );
        }
      });

      it('should handle installation errors', async () => {
        const { execSync } = require('child_process');
        execSync.mockImplementation(() => {
          throw new Error('Installation failed');
        });

        await expect(
          registryCommand['installDependencies'](['lodash'], [], {})
        ).rejects.toThrow('Installation failed');

        expect(mockOra().fail).toHaveBeenCalledWith('Failed to install dependencies');
      });
    });

    describe('applyCssVariables', () => {
      it('should log CSS variables application', async () => {
        const { logger } = require('../utils/logger');
        
        await registryCommand['applyCssVariables']({
          '--primary-color': '#007bff'
        });

        expect(logger.info).toHaveBeenCalledWith(
          'CSS variables would be applied to your styles'
        );
      });
    });

    describe('applyConfiguration', () => {
      it('should log configuration application', async () => {
        const { logger } = require('../utils/logger');
        
        await registryCommand['applyConfiguration']({
          typescript: true
        });

        expect(logger.info).toHaveBeenCalledWith(
          'Configuration would be applied to your project'
        );
      });
    });
  });

  describe('Edge Cases and Error Handling', () => {
    it('should handle malformed registry index', async () => {
      mockFetch.mockResolvedValue({
        ok: true,
        json: () => Promise.resolve({ malformed: 'data' })
      });

      await registryCommand['handleList']({});

      // Should handle gracefully without crashing
      expect(mockConsoleLog).toHaveBeenCalled();
    });

    it('should handle file write permissions errors', async () => {
      const { handleError } = require('../utils/error-handler');
      
      vi.mocked(writeFileSync).mockImplementation(() => {
        throw new Error('Permission denied');
      });

      mockFetch.mockResolvedValue({
        ok: true,
        json: () => Promise.resolve(mockRegistryItem)
      });

      await registryCommand['handleAdd'](['button'], {});

      expect(handleError).toHaveBeenCalledWith(expect.any(Error));
    });

    it('should handle network timeouts gracefully', async () => {
      const { handleError } = require('../utils/error-handler');
      
      mockFetch.mockRejectedValue(new Error('Network timeout'));

      await registryCommand['handleInfo']('button');

      expect(handleError).toHaveBeenCalledWith(
        expect.objectContaining({ message: 'Network timeout' })
      );
    });

    it('should handle circular registry dependencies', async () => {
      const circularItem1 = {
        ...mockRegistryItem,
        name: 'circular1',
        registryDependencies: ['circular2']
      };

      const circularItem2 = {
        ...mockRegistryItem,
        name: 'circular2',
        registryDependencies: ['circular1']
      };

      mockFetch
        .mockResolvedValueOnce({
          ok: true,
          json: () => Promise.resolve(circularItem1)
        })
        .mockResolvedValueOnce({
          ok: true,
          json: () => Promise.resolve(circularItem2)
        });

      // Should not cause infinite loop
      await registryCommand['handleAdd'](['circular1'], {});
      
      expect(mockFetch).toHaveBeenCalledTimes(2);
    });
  });
});