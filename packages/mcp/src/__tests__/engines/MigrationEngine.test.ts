/**
 * @fileoverview Comprehensive Tests for MigrationEngine
 * @description Tests for framework migration, code transformation, and rollback functionality
 * @version 1.0.0
 */

import { MigrationEngine } from '../../engines/MigrationEngine.js';
import { 
  createMockProject, 
  createMockFileSystem, 
  expectAsyncThrow 
} from '../utils/test-helpers.js';
import { sampleMigrationContext } from '../fixtures/sample-specs.js';

// Mock fs module
jest.mock('fs', () => ({
  readFileSync: jest.fn(),
  writeFileSync: jest.fn(),
  existsSync: jest.fn(),
  mkdirSync: jest.fn(),
  copyFileSync: jest.fn(),
}));

// Mock child_process
jest.mock('child_process', () => ({
  execSync: jest.fn(),
}));

describe('MigrationEngine', () => {
  let engine: MigrationEngine;
  let mockProject: ReturnType<typeof createMockProject>;
  let migrationContext: typeof sampleMigrationContext;

  beforeEach(() => {
    jest.clearAllMocks();
    mockProject = createMockProject('test-migration-project');
    migrationContext = {
      ...sampleMigrationContext,
      projectPath: mockProject.root
    };
    engine = new MigrationEngine(migrationContext);
  });

  afterEach(() => {
    mockProject.cleanup();
  });

  describe('Constructor', () => {
    it('should initialize with migration context', () => {
      expect(engine).toBeInstanceOf(MigrationEngine);
    });

    it('should set backup path correctly', () => {
      const backupPath = (engine as any).backupPath;
      expect(backupPath).toBe(`${mockProject.root}/.migration-backup`);
    });

    it('should initialize transformation map', () => {
      const transformationMap = (engine as any).transformationMap;
      expect(transformationMap).toBeInstanceOf(Map);
    });
  });

  describe('executeMigration', () => {
    it('should execute complete migration successfully', async () => {
      const mockFs = createMockFileSystem();
      
      // Mock React component to migrate
      mockFs.files.set(`${mockProject.root}/src/components/Button.tsx`, `
        import React from 'react';
        
        interface ButtonProps {
          children: React.ReactNode;
          onClick?: () => void;
        }
        
        export const Button: React.FC<ButtonProps> = ({ children, onClick }) => {
          return <button onClick={onClick}>{children}</button>;
        };
      `);

      // Mock file system operations
      require('fs').readFileSync.mockImplementation(mockFs.readFileSync);
      require('fs').writeFileSync.mockImplementation(mockFs.writeFileSync);
      require('fs').existsSync.mockImplementation(mockFs.existsSync);
      require('fs').mkdirSync.mockImplementation(mockFs.mkdirSync);
      require('fs').copyFileSync.mockImplementation(mockFs.copyFileSync);

      const result = await engine.executeMigration();

      expect(result.success).toBe(true);
      expect(result.completedPhases).toContain('analysis');
      expect(result.completedPhases).toContain('component-migration');
      expect(result.failedPhases).toHaveLength(0);
      expect(result.modifiedFiles.length).toBeGreaterThan(0);
      expect(result.errors).toHaveLength(0);
    });

    it('should handle dry run mode', async () => {
      const dryRunContext = {
        ...migrationContext,
        dryRun: true
      };
      const dryRunEngine = new MigrationEngine(dryRunContext);

      const mockFs = createMockFileSystem();
      mockFs.files.set(`${mockProject.root}/src/components/Button.tsx`, `
        import React from 'react';
        export const Button: React.FC = () => <button>Click</button>;
      `);

      require('fs').readFileSync.mockImplementation(mockFs.readFileSync);
      require('fs').writeFileSync.mockImplementation(mockFs.writeFileSync);
      require('fs').existsSync.mockImplementation(mockFs.existsSync);

      const result = await dryRunEngine.executeMigration();

      expect(result.success).toBe(true);
      expect(result.warnings).toContain('Dry run mode - no files were modified');
      // writeFileSync should not be called in dry run mode
      expect(require('fs').writeFileSync).not.toHaveBeenCalled();
    });

    it('should create backup before migration', async () => {
      const mockFs = createMockFileSystem();
      mockFs.files.set(`${mockProject.root}/src/components/Button.tsx`, 'test content');

      require('fs').readFileSync.mockImplementation(mockFs.readFileSync);
      require('fs').writeFileSync.mockImplementation(mockFs.writeFileSync);
      require('fs').existsSync.mockImplementation(mockFs.existsSync);
      require('fs').mkdirSync.mockImplementation(mockFs.mkdirSync);
      require('fs').copyFileSync.mockImplementation(mockFs.copyFileSync);

      const result = await engine.executeMigration();

      expect(result.backupLocation).toBeDefined();
      expect(require('fs').mkdirSync).toHaveBeenCalledWith(
        expect.stringContaining('.migration-backup'),
        expect.objectContaining({ recursive: true })
      );
    });

    it('should handle phase dependencies correctly', async () => {
      const dependentContext = {
        ...migrationContext,
        migrationStrategy: {
          ...migrationContext.migrationStrategy,
          phases: [
            {
              id: 'phase1',
              name: 'Phase 1',
              description: 'First phase',
              priority: 1,
              dependencies: [],
              estimatedTime: '5 minutes',
              riskLevel: 'low' as const,
              components: ['Button'],
              transformations: []
            },
            {
              id: 'phase2',
              name: 'Phase 2',
              description: 'Second phase',
              priority: 2,
              dependencies: ['phase1'], // Depends on phase1
              estimatedTime: '10 minutes',
              riskLevel: 'medium' as const,
              components: ['Input'],
              transformations: []
            }
          ]
        }
      };

      const dependentEngine = new MigrationEngine(dependentContext);
      
      const mockFs = createMockFileSystem();
      require('fs').readFileSync.mockImplementation(mockFs.readFileSync);
      require('fs').writeFileSync.mockImplementation(mockFs.writeFileSync);
      require('fs').existsSync.mockImplementation(mockFs.existsSync);
      require('fs').mkdirSync.mockImplementation(mockFs.mkdirSync);

      const result = await dependentEngine.executeMigration();

      expect(result.success).toBe(true);
      expect(result.completedPhases).toEqual(['phase1', 'phase2']);
    });

    it('should stop on high-risk phase failure', async () => {
      const highRiskContext = {
        ...migrationContext,
        migrationStrategy: {
          ...migrationContext.migrationStrategy,
          phases: [
            {
              id: 'safe-phase',
              name: 'Safe Phase',
              description: 'Low risk phase',
              priority: 1,
              dependencies: [],
              estimatedTime: '5 minutes',
              riskLevel: 'low' as const,
              components: ['Button'],
              transformations: []
            },
            {
              id: 'risky-phase',
              name: 'Risky Phase',
              description: 'High risk phase',
              priority: 2,
              dependencies: [],
              estimatedTime: '10 minutes',
              riskLevel: 'high' as const,
              components: ['ComplexComponent'],
              transformations: [{
                id: 'failing-transform',
                type: 'replace' as const,
                source: 'nonexistent',
                target: 'replacement'
              }]
            }
          ]
        }
      };

      const riskEngine = new MigrationEngine(highRiskContext);
      
      const mockFs = createMockFileSystem();
      mockFs.files.set(`${mockProject.root}/src/components/Button.tsx`, 'button content');
      // Don't set ComplexComponent file to cause failure

      require('fs').readFileSync.mockImplementation(mockFs.readFileSync);
      require('fs').writeFileSync.mockImplementation(mockFs.writeFileSync);
      require('fs').existsSync.mockImplementation(mockFs.existsSync);
      require('fs').mkdirSync.mockImplementation(mockFs.mkdirSync);

      const result = await riskEngine.executeMigration();

      expect(result.completedPhases).toContain('safe-phase');
      expect(result.failedPhases).toContain('risky-phase');
      // Should stop execution after high-risk failure
    });
  });

  describe('executePhase', () => {
    it('should execute individual phase successfully', async () => {
      const phase = migrationContext.migrationStrategy.phases[0];
      const mockFs = createMockFileSystem();

      require('fs').readFileSync.mockImplementation(mockFs.readFileSync);
      require('fs').writeFileSync.mockImplementation(mockFs.writeFileSync);
      require('fs').existsSync.mockImplementation(mockFs.existsSync);

      const result = await engine.executePhase(phase);

      expect(result.success).toBe(true);
      expect(result.modifiedFiles).toBeDefined();
      expect(result.errors).toHaveLength(0);
    });

    it('should handle phase with unsatisfied dependencies', async () => {
      const dependentPhase = {
        id: 'dependent-phase',
        name: 'Dependent Phase',
        description: 'Phase with dependencies',
        priority: 2,
        dependencies: ['missing-phase'],
        estimatedTime: '10 minutes',
        riskLevel: 'medium' as const,
        components: [],
        transformations: []
      };

      const result = await engine.executePhase(dependentPhase);

      expect(result.success).toBe(false);
      expect(result.errors).toContain('Phase dependencies not satisfied: missing-phase');
    });

    it('should execute transformations in phase', async () => {
      const transformationPhase = {
        id: 'transform-phase',
        name: 'Transformation Phase',
        description: 'Phase with transformations',
        priority: 1,
        dependencies: [],
        estimatedTime: '15 minutes',
        riskLevel: 'low' as const,
        components: ['Button'],
        transformations: [{
          id: 'react-to-vue',
          type: 'replace' as const,
          source: 'React.FC',
          target: 'defineComponent'
        }]
      };

      const mockFs = createMockFileSystem();
      mockFs.files.set(`${mockProject.root}/src/components/Button.tsx`, `
        import React from 'react';
        export const Button: React.FC = () => <button>Click</button>;
      `);

      require('fs').readFileSync.mockImplementation(mockFs.readFileSync);
      require('fs').writeFileSync.mockImplementation(mockFs.writeFileSync);
      require('fs').existsSync.mockImplementation(mockFs.existsSync);

      const result = await engine.executePhase(transformationPhase);

      expect(result.success).toBe(true);
      expect(result.modifiedFiles).toContain(`${mockProject.root}/src/components/Button.tsx`);
    });
  });

  describe('executeTransformation', () => {
    it('should execute transformation on target components', async () => {
      const transformation = {
        id: 'react-to-vue',
        type: 'replace' as const,
        source: 'React.FC',
        target: 'defineComponent'
      };

      const mockFs = createMockFileSystem();
      mockFs.files.set(`${mockProject.root}/src/components/Button.tsx`, `
        import React from 'react';
        export const Button: React.FC = () => <button>Click</button>;
      `);

      require('fs').readFileSync.mockImplementation(mockFs.readFileSync);
      require('fs').writeFileSync.mockImplementation(mockFs.writeFileSync);
      require('fs').existsSync.mockImplementation(mockFs.existsSync);

      const result = await engine.executeTransformation(transformation, ['Button']);

      expect(result.success).toBe(true);
      expect(result.transformedFiles).toContain(`${mockProject.root}/src/components/Button.tsx`);
      expect(result.errors).toHaveLength(0);

      // Check that transformation was applied
      const transformedContent = mockFs.files.get(`${mockProject.root}/src/components/Button.tsx`);
      expect(transformedContent).toContain('defineComponent');
      expect(transformedContent).not.toContain('React.FC');
    });

    it('should handle transformation with regex pattern', async () => {
      const transformation = {
        id: 'props-interface',
        type: 'replace' as const,
        source: '',
        target: '',
        pattern: /interface\s+(\w+)Props/g,
        replacement: 'interface $1Configuration'
      };

      const mockFs = createMockFileSystem();
      mockFs.files.set(`${mockProject.root}/src/components/Button.tsx`, `
        interface ButtonProps {
          onClick: () => void;
        }
        export const Button = (props: ButtonProps) => <button />;
      `);

      require('fs').readFileSync.mockImplementation(mockFs.readFileSync);
      require('fs').writeFileSync.mockImplementation(mockFs.writeFileSync);
      require('fs').existsSync.mockImplementation(mockFs.existsSync);

      const result = await engine.executeTransformation(transformation, ['Button']);

      expect(result.success).toBe(true);
      
      const transformedContent = mockFs.files.get(`${mockProject.root}/src/components/Button.tsx`);
      expect(transformedContent).toContain('interface ButtonConfiguration');
      expect(transformedContent).not.toContain('interface ButtonProps');
    });

    it('should skip files that do not exist', async () => {
      const transformation = {
        id: 'test-transform',
        type: 'replace' as const,
        source: 'old',
        target: 'new'
      };

      const mockFs = createMockFileSystem();
      // Don't add the file to mockFs

      require('fs').readFileSync.mockImplementation(mockFs.readFileSync);
      require('fs').existsSync.mockImplementation(mockFs.existsSync);

      const result = await engine.executeTransformation(transformation, ['NonExistentComponent']);

      expect(result.success).toBe(true);
      expect(result.skippedFiles).toContain(`${mockProject.root}/src/components/NonExistentComponent.tsx`);
    });

    it('should handle transformation validation', async () => {
      const transformation = {
        id: 'validated-transform',
        type: 'replace' as const,
        source: 'React.FC',
        target: 'defineComponent',
        validator: (content: string) => content.includes('import Vue')
      };

      const mockFs = createMockFileSystem();
      mockFs.files.set(`${mockProject.root}/src/components/Button.tsx`, `
        import React from 'react';
        export const Button: React.FC = () => <button>Click</button>;
      `);

      require('fs').readFileSync.mockImplementation(mockFs.readFileSync);
      require('fs').writeFileSync.mockImplementation(mockFs.writeFileSync);
      require('fs').existsSync.mockImplementation(mockFs.existsSync);

      const result = await engine.executeTransformation(transformation, ['Button']);

      // Should fail validation (no 'import Vue' in result)
      expect(result.errors.length).toBeGreaterThan(0);
      expect(result.errors[0].message).toContain('Validation failed');
    });
  });

  describe('transformFile', () => {
    it('should transform file with replace operation', async () => {
      const transformation = {
        id: 'replace-test',
        type: 'replace' as const,
        source: 'oldText',
        target: 'newText'
      };

      const filePath = `${mockProject.root}/src/test.tsx`;
      const mockFs = createMockFileSystem();
      mockFs.files.set(filePath, 'This contains oldText that should be replaced.');

      require('fs').readFileSync.mockImplementation(mockFs.readFileSync);
      require('fs').writeFileSync.mockImplementation(mockFs.writeFileSync);

      const result = await engine.transformFile(filePath, transformation);

      expect(result.success).toBe(true);
      expect(result.errors).toHaveLength(0);

      const transformedContent = mockFs.files.get(filePath);
      expect(transformedContent).toContain('newText');
      expect(transformedContent).not.toContain('oldText');
    });

    it('should handle modify operation', async () => {
      const transformation = {
        id: 'modify-test',
        type: 'modify' as const,
        source: '',
        target: ''
      };

      const filePath = `${mockProject.root}/src/test.tsx`;
      const mockFs = createMockFileSystem();
      mockFs.files.set(filePath, 'original content');

      require('fs').readFileSync.mockImplementation(mockFs.readFileSync);
      require('fs').writeFileSync.mockImplementation(mockFs.writeFileSync);

      const result = await engine.transformFile(filePath, transformation);

      expect(result.success).toBe(true);
      // Modify operation should return original content (placeholder implementation)
      expect(mockFs.files.get(filePath)).toBe('original content');
    });

    it('should handle add operation', async () => {
      const transformation = {
        id: 'add-test',
        type: 'add' as const,
        source: '',
        target: 'new content to add'
      };

      const filePath = `${mockProject.root}/src/test.tsx`;
      const mockFs = createMockFileSystem();
      mockFs.files.set(filePath, 'existing content');

      require('fs').readFileSync.mockImplementation(mockFs.readFileSync);
      require('fs').writeFileSync.mockImplementation(mockFs.writeFileSync);

      const result = await engine.transformFile(filePath, transformation);

      expect(result.success).toBe(true);
      const transformedContent = mockFs.files.get(filePath);
      expect(transformedContent).toContain('existing content');
      expect(transformedContent).toContain('new content to add');
    });

    it('should handle remove operation', async () => {
      const transformation = {
        id: 'remove-test',
        type: 'remove' as const,
        source: 'content to remove',
        target: ''
      };

      const filePath = `${mockProject.root}/src/test.tsx`;
      const mockFs = createMockFileSystem();
      mockFs.files.set(filePath, 'keep this content to remove and this');

      require('fs').readFileSync.mockImplementation(mockFs.readFileSync);
      require('fs').writeFileSync.mockImplementation(mockFs.writeFileSync);

      const result = await engine.transformFile(filePath, transformation);

      expect(result.success).toBe(true);
      const transformedContent = mockFs.files.get(filePath);
      expect(transformedContent).toBe('keep this  and this');
      expect(transformedContent).not.toContain('content to remove');
    });

    it('should handle rename operation', async () => {
      const transformation = {
        id: 'rename-test',
        type: 'rename' as const,
        source: 'OldName',
        target: 'NewName'
      };

      const filePath = `${mockProject.root}/src/test.tsx`;
      const mockFs = createMockFileSystem();
      mockFs.files.set(filePath, 'const OldName = () => { return <OldName />; };');

      require('fs').readFileSync.mockImplementation(mockFs.readFileSync);
      require('fs').writeFileSync.mockImplementation(mockFs.writeFileSync);

      const result = await engine.transformFile(filePath, transformation);

      expect(result.success).toBe(true);
      const transformedContent = mockFs.files.get(filePath);
      expect(transformedContent).toContain('NewName');
      expect(transformedContent).not.toContain('OldName');
    });

    it('should handle file read errors', async () => {
      const transformation = {
        id: 'error-test',
        type: 'replace' as const,
        source: 'old',
        target: 'new'
      };

      const filePath = `${mockProject.root}/src/test.tsx`;
      
      require('fs').readFileSync.mockImplementation(() => {
        throw new Error('Permission denied');
      });

      const result = await engine.transformFile(filePath, transformation);

      expect(result.success).toBe(false);
      expect(result.errors).toHaveLength(1);
      expect(result.errors[0].message).toContain('Permission denied');
    });
  });

  describe('rollback', () => {
    it('should rollback changes from backup', async () => {
      const backupLocation = `${mockProject.root}/.migration-backup`;
      const mockFs = createMockFileSystem();
      
      // Mock backup files
      mockFs.files.set(`${backupLocation}/src/components/Button.tsx`, 'original button content');
      mockFs.files.set(`${backupLocation}/src/components/Input.tsx`, 'original input content');
      
      // Mock current modified files
      mockFs.files.set(`${mockProject.root}/src/components/Button.tsx`, 'modified button content');
      mockFs.files.set(`${mockProject.root}/src/components/Input.tsx`, 'modified input content');

      require('fs').existsSync.mockImplementation(mockFs.existsSync);
      require('fs').copyFileSync.mockImplementation((src: string, dest: string) => {
        const content = mockFs.files.get(src);
        if (content) {
          mockFs.files.set(dest, content);
        }
      });

      // Mock getBackupFiles to return backup files
      (engine as any).getBackupFiles = jest.fn(() => [
        `${backupLocation}/src/components/Button.tsx`,
        `${backupLocation}/src/components/Input.tsx`
      ]);

      const result = await engine.rollback(backupLocation);

      expect(result.success).toBe(true);
      expect(result.restoredFiles).toContain(`${mockProject.root}/src/components/Button.tsx`);
      expect(result.restoredFiles).toContain(`${mockProject.root}/src/components/Input.tsx`);
      expect(result.errors).toHaveLength(0);

      // Check that files were restored
      expect(mockFs.files.get(`${mockProject.root}/src/components/Button.tsx`)).toBe('original button content');
      expect(mockFs.files.get(`${mockProject.root}/src/components/Input.tsx`)).toBe('original input content');
    });

    it('should handle missing backup location', async () => {
      const backupLocation = `${mockProject.root}/.nonexistent-backup`;
      
      require('fs').existsSync.mockImplementation(() => false);

      const result = await engine.rollback(backupLocation);

      expect(result.success).toBe(false);
      expect(result.errors).toContain('Backup location not found');
    });

    it('should handle individual file restore errors', async () => {
      const backupLocation = `${mockProject.root}/.migration-backup`;
      const mockFs = createMockFileSystem();
      
      mockFs.files.set(`${backupLocation}/src/components/Button.tsx`, 'backup content');

      require('fs').existsSync.mockImplementation(mockFs.existsSync);
      require('fs').copyFileSync.mockImplementation(() => {
        throw new Error('Copy failed');
      });

      (engine as any).getBackupFiles = jest.fn(() => [
        `${backupLocation}/src/components/Button.tsx`
      ]);

      const result = await engine.rollback(backupLocation);

      expect(result.success).toBe(false);
      expect(result.errors.length).toBeGreaterThan(0);
      expect(result.errors[0]).toContain('Copy failed');
    });
  });

  describe('generateComponentMapping', () => {
    it('should generate mapping for React to Vue migration', () => {
      const mappings = engine.generateComponentMapping('React', 'Vue');

      expect(mappings).toContainEqual(
        expect.objectContaining({
          source: 'React.FC',
          target: 'defineComponent',
          importPath: 'vue'
        })
      );

      expect(mappings).toContainEqual(
        expect.objectContaining({
          source: 'useState',
          target: 'ref',
          importPath: 'vue'
        })
      );

      expect(mappings).toContainEqual(
        expect.objectContaining({
          source: 'useEffect',
          target: 'onMounted',
          importPath: 'vue'
        })
      );
    });

    it('should generate mapping for React to Angular migration', () => {
      const mappings = engine.generateComponentMapping('React', 'Angular');

      expect(mappings).toContainEqual(
        expect.objectContaining({
          source: 'React.FC',
          target: '@Component',
          importPath: '@angular/core'
        })
      );

      expect(mappings).toContainEqual(
        expect.objectContaining({
          source: 'useState',
          target: 'signal',
          importPath: '@angular/core'
        })
      );
    });

    it('should return empty array for unknown frameworks', () => {
      const mappings = engine.generateComponentMapping('UnknownFramework', 'AnotherUnknown');
      expect(mappings).toHaveLength(0);
    });
  });

  describe('createCodemods', () => {
    it('should create codemods from mappings', async () => {
      const mappings = [
        {
          source: 'React.FC',
          target: 'defineComponent',
          importPath: 'vue',
          props: {}
        }
      ];

      const codemods = await engine.createCodemods(mappings);

      expect(codemods).toHaveLength(1);
      expect(codemods[0]).toContain('React.FC');
      expect(codemods[0]).toContain('defineComponent');
    });
  });

  describe('Error Recovery', () => {
    it('should continue migration after non-critical errors', async () => {
      const mockFs = createMockFileSystem();
      
      // Add multiple files, one that will cause an error
      mockFs.files.set(`${mockProject.root}/src/components/Button.tsx`, 'valid content');
      mockFs.files.set(`${mockProject.root}/src/components/Input.tsx`, 'valid content');

      require('fs').readFileSync.mockImplementation((path: string) => {
        if (path.includes('Button.tsx')) {
          throw new Error('File read error');
        }
        return mockFs.readFileSync(path);
      });

      require('fs').writeFileSync.mockImplementation(mockFs.writeFileSync);
      require('fs').existsSync.mockImplementation(mockFs.existsSync);
      require('fs').mkdirSync.mockImplementation(mockFs.mkdirSync);

      const result = await engine.executeMigration();

      // Should continue despite individual file errors
      expect(result.completedPhases.length).toBeGreaterThan(0);
      expect(result.warnings.length).toBeGreaterThan(0);
    });

    it('should provide detailed error information', async () => {
      const mockFs = createMockFileSystem();
      
      require('fs').readFileSync.mockImplementation(() => {
        const error = new Error('Detailed error message');
        (error as any).code = 'ENOENT';
        (error as any).path = '/missing/file.tsx';
        throw error;
      });

      require('fs').existsSync.mockImplementation(mockFs.existsSync);
      require('fs').mkdirSync.mockImplementation(mockFs.mkdirSync);

      const result = await engine.executeMigration();

      expect(result.errors.length).toBeGreaterThan(0);
      expect(result.errors[0]).toContain('Detailed error message');
    });
  });

  describe('Performance', () => {
    it('should handle large projects efficiently', async () => {
      const mockFs = createMockFileSystem();
      
      // Create many files to simulate large project
      for (let i = 0; i < 20; i++) {
        mockFs.files.set(`${mockProject.root}/src/components/Component${i}.tsx`, `
          import React from 'react';
          export const Component${i}: React.FC = () => <div>Component ${i}</div>;
        `);
      }

      require('fs').readFileSync.mockImplementation(mockFs.readFileSync);
      require('fs').writeFileSync.mockImplementation(mockFs.writeFileSync);
      require('fs').existsSync.mockImplementation(mockFs.existsSync);
      require('fs').mkdirSync.mockImplementation(mockFs.mkdirSync);

      const startTime = Date.now();
      const result = await engine.executeMigration();
      const endTime = Date.now();

      expect(result.success).toBe(true);
      expect(endTime - startTime).toBeLessThan(10000); // Should complete within 10 seconds
      expect(result.modifiedFiles.length).toBe(20);
    });
  });

  describe('Integration', () => {
    it('should integrate with real project structure', async () => {
      const realProjectContext = {
        ...migrationContext,
        migrationStrategy: {
          ...migrationContext.migrationStrategy,
          phases: [
            {
              id: 'component-analysis',
              name: 'Component Analysis',
              description: 'Analyze existing React components',
              priority: 1,
              dependencies: [],
              estimatedTime: '5 minutes',
              riskLevel: 'low' as const,
              components: ['*'],
              transformations: []
            },
            {
              id: 'react-to-vue-migration',
              name: 'React to Vue Migration',
              description: 'Convert React components to Vue 3 Composition API',
              priority: 2,
              dependencies: ['component-analysis'],
              estimatedTime: '30 minutes',
              riskLevel: 'medium' as const,
              components: ['Button', 'Input', 'Modal'],
              transformations: [
                {
                  id: 'convert-fc',
                  type: 'replace' as const,
                  source: 'React.FC',
                  target: 'defineComponent'
                },
                {
                  id: 'convert-hooks',
                  type: 'replace' as const,
                  source: 'useState',
                  target: 'ref'
                },
                {
                  id: 'convert-jsx',
                  type: 'replace' as const,
                  source: '.tsx',
                  target: '.vue'
                }
              ]
            }
          ]
        }
      };

      const realEngine = new MigrationEngine(realProjectContext);
      const mockFs = createMockFileSystem();

      // Mock realistic React components
      mockFs.files.set(`${mockProject.root}/src/components/Button.tsx`, `
        import React, { useState } from 'react';
        
        interface ButtonProps {
          children: React.ReactNode;
          onClick?: () => void;
          variant?: 'primary' | 'secondary';
          disabled?: boolean;
        }
        
        export const Button: React.FC<ButtonProps> = ({ 
          children, 
          onClick, 
          variant = 'primary',
          disabled = false 
        }) => {
          const [isPressed, setIsPressed] = useState(false);
          
          return (
            <button 
              onClick={onClick}
              disabled={disabled}
              className={\`btn btn-\${variant} \${isPressed ? 'pressed' : ''}\`}
              onMouseDown={() => setIsPressed(true)}
              onMouseUp={() => setIsPressed(false)}
            >
              {children}
            </button>
          );
        };
      `);

      require('fs').readFileSync.mockImplementation(mockFs.readFileSync);
      require('fs').writeFileSync.mockImplementation(mockFs.writeFileSync);
      require('fs').existsSync.mockImplementation(mockFs.existsSync);
      require('fs').mkdirSync.mockImplementation(mockFs.mkdirSync);

      const result = await realEngine.executeMigration();

      expect(result.success).toBe(true);
      expect(result.completedPhases).toContain('component-analysis');
      expect(result.completedPhases).toContain('react-to-vue-migration');
      
      const transformedContent = mockFs.files.get(`${mockProject.root}/src/components/Button.tsx`);
      expect(transformedContent).toContain('defineComponent');
      expect(transformedContent).toContain('ref');
      expect(transformedContent).not.toContain('React.FC');
      expect(transformedContent).not.toContain('useState');
    });
  });
});