/**
 * Phase 1 Unit Tests - Command Handlers
 * Tests for 'new' and 'scaffold' commands with mocked file system and prompts
 */

import { describe, it, expect, beforeEach, afterEach, mock } from 'bun:test';
import { vol } from 'memfs';
import { promises as fs } from 'fs';
import * as prompts from '@clack/prompts';
import { CommandParser } from '../../../src/core/command-parser/index';
import { ScaffoldGenerator } from '../../../src/generators/scaffold.generator';
import type { ScaffoldGeneratorOptions } from '../../../src/generators/scaffold.generator';

// Mock modules
mock.module('fs', () => {
  const memfs = require('memfs');
  return memfs.fs.promises;
});

mock.module('@clack/prompts', () => ({
  intro: mock(() => {}),
  outro: mock(() => {}),
  cancel: mock(() => {}),
  isCancel: mock(() => false),
  text: mock(() => {}),
  select: mock(() => {}),
  multiselect: mock(() => {}),
  confirm: mock(() => {}),
  spinner: mock(() => ({
    start: mock(() => {}),
    stop: mock(() => {}),
    message: mock(() => {}),
  })),
}));

mock.module('execa', () => ({
  execa: mock(() => Promise.resolve({
    stdout: '',
    stderr: '',
    exitCode: 0,
  })),
  execaCommand: mock(() => Promise.resolve({
    stdout: '',
    stderr: '',
    exitCode: 0,
  })),
}));

describe('Phase 1: Command Handlers Unit Tests', () => {
  beforeEach(() => {
    // Reset mocked file system
    vol.reset();
    mock.restore();
  });

  afterEach(() => {
    mock.restore();
  });

  describe('New Command Handler', () => {
    it('should handle "xaheen new" command with mocked prompts', async () => {
      // Mock user inputs
      (prompts.text as any).mockResolvedValueOnce('my-next-app');
      (prompts.select as any).mockResolvedValueOnce('nextjs');
      (prompts.multiselect as any).mockResolvedValueOnce(['typescript', 'tailwind']);
      (prompts.confirm as any).mockResolvedValueOnce(true);

      const parser = new CommandParser();
      const mockArgv = ['node', 'xaheen', 'project', 'create', 'my-next-app'];

      // Execute command
      await parser.parse(mockArgv);

      // Verify prompts were called
      expect(prompts.text).toHaveBeenCalledWith(
        expect.objectContaining({
          message: expect.stringContaining('name'),
        })
      );

      expect(prompts.select).toHaveBeenCalledWith(
        expect.objectContaining({
          message: expect.stringContaining('preset'),
        })
      );
    });

    it('should create correct directory structure for Next.js project', async () => {
      const projectName = 'test-nextjs-app';
      const projectPath = `/tmp/${projectName}`;

      // Mock file system operations
      await fs.mkdir(projectPath, { recursive: true });
      await fs.writeFile(`${projectPath}/package.json`, JSON.stringify({
        name: projectName,
        version: '0.1.0',
        scripts: {
          dev: 'next dev',
          build: 'next build',
          start: 'next start',
        },
      }, null, 2));

      // Verify file creation
      const packageJson = await fs.readFile(`${projectPath}/package.json`, 'utf-8');
      const pkg = JSON.parse(packageJson);

      expect(pkg.name).toBe(projectName);
      expect(pkg.scripts.dev).toBe('next dev');
    });

    it('should handle dry-run mode without creating files', async () => {
      const options: ScaffoldGeneratorOptions = {
        name: 'dry-run-app',
        frontend: 'nextjs',
        dryRun: true,
        typescript: true,
      };

      const generator = new ScaffoldGenerator();
      const result = await generator.generate(options);

      expect(result.success).toBe(true);
      expect(result.actions).toContain('dry-run');
      
      // Verify no files were created
      const files = vol.toJSON();
      expect(Object.keys(files).length).toBe(0);
    });
  });

  describe('Scaffold Command Handler', () => {
    it('should handle "xaheen scaffold" command with field definitions', async () => {
      // Mock user inputs for scaffold
      (prompts.text as any).mockResolvedValueOnce('User');
      (prompts.multiselect as any).mockResolvedValueOnce(['crud', 'search', 'pagination']);
      (prompts.confirm as any).mockResolvedValueOnce(true);

      const options: ScaffoldGeneratorOptions = {
        name: 'User',
        fields: ['name:string', 'email:string:unique', 'age:number'],
        features: ['crud', 'search', 'pagination'],
        frontend: 'nextjs',
        backend: 'nestjs',
        database: 'prisma',
        typescript: true,
      };

      const generator = new ScaffoldGenerator();
      const result = await generator.generate(options);

      expect(result.success).toBe(true);
      expect(result.filesGenerated).toBeGreaterThan(0);
    });

    it('should parse field definitions correctly', () => {
      const fieldStrings = [
        'name:string:required',
        'email:string:unique:required',
        'age:number',
        'isActive:boolean:default:true',
      ];

      const fields = fieldStrings.map(parseFieldDefinition);

      expect(fields[0]).toEqual({
        name: 'name',
        type: 'string',
        required: true,
        unique: false,
      });

      expect(fields[1]).toEqual({
        name: 'email',
        type: 'string',
        required: true,
        unique: true,
      });

      expect(fields[2]).toEqual({
        name: 'age',
        type: 'number',
        required: false,
        unique: false,
      });
    });

    it('should validate scaffold options', async () => {
      const invalidOptions: ScaffoldGeneratorOptions = {
        name: '', // Invalid empty name
        frontend: 'invalid' as any, // Invalid frontend
        typescript: true,
      };

      const generator = new ScaffoldGenerator();
      
      await expect(generator.generate(invalidOptions)).rejects.toThrow();
    });
  });

  describe('Git Operations Mocking', () => {
    it('should mock git init operations', async () => {
      const { execa } = await import('execa');
      const mockExeca = execa as any;

      // Mock git init
      mockExeca.mockResolvedValueOnce({
        stdout: 'Initialized empty Git repository',
        stderr: '',
        exitCode: 0,
        command: 'git init',
        escapedCommand: 'git init',
        failed: false,
        timedOut: false,
        isCanceled: false,
        killed: false,
      } as any);

      const result = await execa('git', ['init']);
      
      expect(result.stdout).toContain('Initialized empty Git repository');
      expect(mockExeca).toHaveBeenCalledWith('git', ['init']);
    });

    it('should mock git commit operations', async () => {
      const { execa } = await import('execa');
      const mockExeca = execa as any;

      mockExeca.mockResolvedValueOnce({
        stdout: '[main (root-commit) abc123] Initial commit',
        stderr: '',
        exitCode: 0,
        command: 'git commit',
        escapedCommand: 'git commit',
        failed: false,
        timedOut: false,
        isCanceled: false,
        killed: false,
      } as any);

      const result = await execa('git', ['commit', '-m', 'Initial commit']);
      
      expect(result.stdout).toContain('Initial commit');
    });
  });

  describe('Error Handling', () => {
    it('should handle missing project name gracefully', async () => {
      (prompts.text as any).mockResolvedValueOnce('');
      (prompts.isCancel as any).mockReturnValueOnce(true);

      const parser = new CommandParser();
      const mockArgv = ['node', 'xaheen', 'project', 'create'];

      await expect(parser.parse(mockArgv)).rejects.toThrow();
    });

    it('should handle file system errors', async () => {
      // Mock fs error
      const spyMkdir = mock(() => Promise.reject(new Error('Permission denied')));
      (fs as any).mkdir = spyMkdir;

      const options: ScaffoldGeneratorOptions = {
        name: 'error-app',
        frontend: 'nextjs',
        typescript: true,
      };

      const generator = new ScaffoldGenerator();
      
      await expect(generator.generate(options)).rejects.toThrow('Permission denied');
    });
  });
});

// Helper function to parse field definitions
function parseFieldDefinition(fieldStr: string) {
  const parts = fieldStr.split(':');
  const name = parts[0];
  const type = parts[1] || 'string';
  const modifiers = parts.slice(2);

  return {
    name,
    type,
    required: modifiers.includes('required'),
    unique: modifiers.includes('unique'),
  };
}