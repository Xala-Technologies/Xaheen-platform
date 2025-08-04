/**
 * @fileoverview Comprehensive Tests for GenerationEngine
 * @description Tests for code generation, natural language processing, and template management
 * @version 1.0.0
 */

import { GenerationEngine } from '../../engines/GenerationEngine.js';
import { 
  createMockProject, 
  mockAnalysisResults, 
  expectAsyncThrow 
} from '../utils/test-helpers.js';
import { 
  sampleButtonSpec, 
  sampleInputSpec, 
  sampleModalSpec,
  sampleGenerationContext 
} from '../fixtures/sample-specs.js';

describe('GenerationEngine', () => {
  let engine: GenerationEngine;
  let mockProject: ReturnType<typeof createMockProject>;
  let generationContext: typeof sampleGenerationContext;

  beforeEach(() => {
    jest.clearAllMocks();
    mockProject = createMockProject('test-generation-project');
    generationContext = {
      ...sampleGenerationContext,
      projectStructure: {
        ...sampleGenerationContext.projectStructure,
        root: mockProject.root
      }
    };
    engine = new GenerationEngine(generationContext);
  });

  afterEach(() => {
    mockProject.cleanup();
  });

  describe('Constructor', () => {
    it('should initialize with generation context', () => {
      expect(engine).toBeInstanceOf(GenerationEngine);
    });

    it('should load templates on initialization', () => {
      // Access private property for testing
      const templates = (engine as any).templates;
      expect(templates).toBeInstanceOf(Map);
    });
  });

  describe('generateFromDescription', () => {
    it('should generate component from natural language description', async () => {
      const description = 'Create a primary button component with loading state and click handler';
      
      const result = await engine.generateFromDescription(description);

      expect(result).toHaveProperty('success', true);
      expect(result).toHaveProperty('files');
      expect(result.files).toHaveLength(1);
      
      const generatedFile = result.files[0];
      expect(generatedFile.path).toMatch(/Button\.(tsx|jsx)$/);
      expect(generatedFile.content).toContain('Button');
      expect(generatedFile.content).toContain('onClick');
      expect(generatedFile.content).toContain('loading');
      expect(generatedFile.type).toBe('component');
    });

    it('should parse requirements from complex descriptions', async () => {
      const description = `
        Generate a data table component with sorting, filtering, and pagination.
        It should accept an array of data, column definitions, and callback functions.
        Include accessibility features like ARIA labels and keyboard navigation.
        The component should be responsive and support both light and dark themes.
      `;

      const result = await engine.generateFromDescription(description);

      expect(result.success).toBe(true);
      expect(result.files).toHaveLength(1);
      
      const generatedFile = result.files[0];
      expect(generatedFile.content).toContain('DataTable');
      expect(generatedFile.content).toContain('data');
      expect(generatedFile.content).toContain('columns');
      expect(generatedFile.content).toContain('aria-label');
      expect(generatedFile.content).toContain('tabIndex');
    });

    it('should handle modal component generation', async () => {
      const description = 'Create a modal dialog with backdrop blur, close button, and escape key support';

      const result = await engine.generateFromDescription(description);

      expect(result.success).toBe(true);
      
      const generatedFile = result.files[0];
      expect(generatedFile.content).toContain('Modal');
      expect(generatedFile.content).toContain('isOpen');
      expect(generatedFile.content).toContain('onClose');
      expect(generatedFile.content).toContain('backdrop');
      expect(generatedFile.content).toContain('Escape');
    });

    it('should generate form components with validation', async () => {
      const description = 'Create a login form with email, password fields, and validation';

      const result = await engine.generateFromDescription(description);

      expect(result.success).toBe(true);
      
      const generatedFile = result.files[0];
      expect(generatedFile.content).toContain('form');
      expect(generatedFile.content).toContain('email');
      expect(generatedFile.content).toContain('password');
      expect(generatedFile.content).toContain('validation');
      expect(generatedFile.content).toContain('onSubmit');
    });

    it('should handle empty or invalid descriptions', async () => {
      const result = await engine.generateFromDescription('');

      expect(result.success).toBe(true);
      expect(result.files).toHaveLength(1);
      expect(result.warnings).toContain('No specific requirements detected, generating basic component');
    });
  });

  describe('generateComponent', () => {
    it('should generate component from specification', async () => {
      const componentSpec = {
        name: 'Button',
        type: 'functional' as const,
        props: [
          { name: 'children', type: 'React.ReactNode', optional: false },
          { name: 'onClick', type: '() => void', optional: true },
          { name: 'variant', type: "'primary' | 'secondary'", optional: true },
          { name: 'disabled', type: 'boolean', optional: true }
        ],
        styling: {
          approach: 'css-modules' as const,
          framework: 'tailwind' as const
        },
        accessibility: {
          includeAriaLabels: true,
          keyboardSupport: true,
          focusManagement: true
        },
        testing: {
          includeTests: true,
          framework: 'jest' as const
        }
      };

      const result = await engine.generateComponent(componentSpec);

      expect(result.success).toBe(true);
      expect(result.files.length).toBeGreaterThanOrEqual(1);

      // Should generate main component file
      const componentFile = result.files.find(f => f.path.includes('Button.tsx'));
      expect(componentFile).toBeDefined();
      expect(componentFile!.content).toContain('interface ButtonProps');
      expect(componentFile!.content).toContain('children: React.ReactNode');
      expect(componentFile!.content).toContain('onClick?:');
      expect(componentFile!.content).toContain('variant?:');
      expect(componentFile!.content).toContain('disabled?:');
      expect(componentFile!.content).toContain('forwardRef');

      // Should include accessibility attributes
      expect(componentFile!.content).toContain('aria-');
      expect(componentFile!.content).toContain('tabIndex');

      // Should generate test file if requested
      const testFile = result.files.find(f => f.path.includes('.test.'));
      expect(testFile).toBeDefined();
      expect(testFile!.content).toContain('describe(\'Button\'');
      expect(testFile!.content).toContain('render');
      expect(testFile!.content).toContain('fireEvent');
    });

    it('should generate complex components with multiple files', async () => {
      const dataTableSpec = {
        name: 'DataTable',
        type: 'functional' as const,
        props: [
          { name: 'data', type: 'Array<Record<string, unknown>>', optional: false },
          { name: 'columns', type: 'ColumnDefinition[]', optional: false },
          { name: 'sortable', type: 'boolean', optional: true },
          { name: 'filterable', type: 'boolean', optional: true },
          { name: 'pagination', type: 'PaginationOptions | false', optional: true }
        ],
        styling: {
          approach: 'styled-components' as const,
          framework: 'emotion' as const
        },
        subComponents: [
          { name: 'TableHeader', type: 'internal' as const },
          { name: 'TableRow', type: 'internal' as const },
          { name: 'TableCell', type: 'internal' as const },
          { name: 'Pagination', type: 'external' as const }
        ],
        hooks: [
          { name: 'useTableSort', purpose: 'sorting logic' },
          { name: 'useTableFilter', purpose: 'filtering logic' },
          { name: 'usePagination', purpose: 'pagination logic' }
        ]
      };

      const result = await engine.generateComponent(dataTableSpec);

      expect(result.success).toBe(true);
      expect(result.files.length).toBeGreaterThan(3); // Main component + subcomponents + hooks

      // Should generate main component
      const mainFile = result.files.find(f => f.path.includes('DataTable.tsx'));
      expect(mainFile).toBeDefined();

      // Should generate hooks
      const sortHook = result.files.find(f => f.path.includes('useTableSort'));
      expect(sortHook).toBeDefined();
      expect(sortHook!.content).toContain('useTableSort');
      expect(sortHook!.content).toContain('useState');
      expect(sortHook!.content).toContain('useCallback');

      // Should generate sub-components
      const headerComponent = result.files.find(f => f.path.includes('TableHeader'));
      expect(headerComponent).toBeDefined();
    });

    it('should handle different styling approaches', async () => {
      const styledComponentsSpec = {
        name: 'StyledButton',
        type: 'functional' as const,
        props: [{ name: 'children', type: 'React.ReactNode', optional: false }],
        styling: {
          approach: 'styled-components' as const,
          framework: 'styled-components' as const
        }
      };

      const cssModulesSpec = {
        name: 'ModuleButton',
        type: 'functional' as const,
        props: [{ name: 'children', type: 'React.ReactNode', optional: false }],
        styling: {
          approach: 'css-modules' as const,
          framework: 'css-modules' as const
        }
      };

      const styledResult = await engine.generateComponent(styledComponentsSpec);
      const modulesResult = await engine.generateComponent(cssModulesSpec);

      // Styled-components approach
      const styledFile = styledResult.files[0];
      expect(styledFile.content).toContain('styled.');
      expect(styledFile.content).toContain('import styled from');

      // CSS Modules approach
      const modulesFile = modulesResult.files[0];
      expect(modulesFile.content).toContain('import styles from');
      expect(modulesFile.content).toContain('className={styles.');

      // Should generate CSS file for modules approach
      const cssFile = modulesResult.files.find(f => f.path.endsWith('.module.css'));
      expect(cssFile).toBeDefined();
    });
  });

  describe('generatePage', () => {
    it('should generate complete page structure', async () => {
      const pageSpec = {
        name: 'HomePage',
        layout: 'main' as const,
        sections: [
          { name: 'hero', component: 'HeroSection' },
          { name: 'features', component: 'FeatureGrid' },
          { name: 'contact', component: 'ContactForm' }
        ],
        components: [
          { name: 'HeroSection', type: 'hero' as const },
          { name: 'FeatureGrid', type: 'grid' as const },
          { name: 'ContactForm', type: 'form' as const }
        ],
        routing: {
          path: '/',
          params: [],
          meta: {
            title: 'Home - My App',
            description: 'Welcome to our application'
          }
        },
        data: {
          sources: ['api/features', 'api/testimonials'],
          caching: 'static' as const
        }
      };

      const result = await engine.generatePage(pageSpec);

      expect(result.success).toBe(true);
      expect(result.files.length).toBeGreaterThan(3);

      // Should generate main page component
      const pageFile = result.files.find(f => f.path.includes('HomePage'));
      expect(pageFile).toBeDefined();
      expect(pageFile!.content).toContain('HomePage');
      expect(pageFile!.content).toContain('HeroSection');
      expect(pageFile!.content).toContain('FeatureGrid');
      expect(pageFile!.content).toContain('ContactForm');

      // Should generate sub-components
      const heroFile = result.files.find(f => f.path.includes('HeroSection'));
      expect(heroFile).toBeDefined();

      const gridFile = result.files.find(f => f.path.includes('FeatureGrid'));
      expect(gridFile).toBeDefined();

      const formFile = result.files.find(f => f.path.includes('ContactForm'));
      expect(formFile).toBeDefined();

      // Should include data fetching logic
      expect(pageFile!.content).toContain('useEffect');
      expect(pageFile!.content).toContain('fetch');
    });

    it('should handle different page layouts', async () => {
      const dashboardPageSpec = {
        name: 'DashboardPage',
        layout: 'dashboard' as const,
        sections: [
          { name: 'sidebar', component: 'Sidebar' },
          { name: 'header', component: 'DashboardHeader' },
          { name: 'main', component: 'DashboardContent' }
        ],
        components: [
          { name: 'Sidebar', type: 'navigation' as const },
          { name: 'DashboardHeader', type: 'header' as const },
          { name: 'DashboardContent', type: 'content' as const }
        ]
      };

      const result = await engine.generatePage(dashboardPageSpec);

      expect(result.success).toBe(true);
      
      const pageFile = result.files.find(f => f.path.includes('DashboardPage'));
      expect(pageFile!.content).toContain('dashboard');
      expect(pageFile!.content).toContain('Sidebar');
      expect(pageFile!.content).toContain('DashboardHeader');
      expect(pageFile!.content).toContain('DashboardContent');

      // Should include layout-specific structure
      expect(pageFile!.content).toContain('grid');
      expect(pageFile!.content).toContain('aside');
      expect(pageFile!.content).toContain('main');
    });
  });

  describe('generateProject', () => {
    it('should generate complete project structure', async () => {
      const projectSpec = {
        name: 'MyApp',
        type: 'spa' as const,
        framework: 'react' as const,
        build: 'vite' as const,
        styling: 'tailwind' as const,
        testing: 'jest' as const,
        structure: {
          src: ['components', 'pages', 'hooks', 'utils', 'assets'],
          public: ['images', 'icons'],
          docs: ['README.md', 'CONTRIBUTING.md']
        },
        features: [
          'typescript',
          'eslint',
          'prettier',
          'husky',
          'lint-staged'
        ],
        initialComponents: [
          { name: 'Button', category: 'ui' },
          { name: 'Input', category: 'form' },
          { name: 'Modal', category: 'overlay' }
        ]
      };

      const result = await engine.generateProject(projectSpec);

      expect(result.success).toBe(true);
      expect(result.files.length).toBeGreaterThan(10);

      // Should generate package.json
      const packageFile = result.files.find(f => f.path === 'package.json');
      expect(packageFile).toBeDefined();
      const packageContent = JSON.parse(packageFile!.content);
      expect(packageContent.name).toBe('MyApp');
      expect(packageContent.dependencies).toHaveProperty('react');
      expect(packageContent.devDependencies).toHaveProperty('typescript');
      expect(packageContent.devDependencies).toHaveProperty('eslint');

      // Should generate configuration files
      const tsConfigFile = result.files.find(f => f.path === 'tsconfig.json');
      expect(tsConfigFile).toBeDefined();

      const eslintFile = result.files.find(f => f.path.includes('eslint'));
      expect(eslintFile).toBeDefined();

      const tailwindFile = result.files.find(f => f.path.includes('tailwind'));
      expect(tailwindFile).toBeDefined();

      // Should generate initial components
      const buttonFile = result.files.find(f => f.path.includes('Button'));
      expect(buttonFile).toBeDefined();

      const inputFile = result.files.find(f => f.path.includes('Input'));
      expect(inputFile).toBeDefined();

      const modalFile = result.files.find(f => f.path.includes('Modal'));
      expect(modalFile).toBeDefined();

      // Should generate README
      const readmeFile = result.files.find(f => f.path === 'README.md');
      expect(readmeFile).toBeDefined();
      expect(readmeFile!.content).toContain('MyApp');
      expect(readmeFile!.content).toContain('Getting Started');
    });

    it('should handle different project types', async () => {
      const nextjsProjectSpec = {
        name: 'NextJSApp',
        type: 'ssr' as const,
        framework: 'nextjs' as const,
        build: 'next' as const,
        styling: 'styled-components' as const,
        features: ['typescript', 'api-routes', 'static-generation']
      };

      const result = await engine.generateProject(nextjsProjectSpec);

      expect(result.success).toBe(true);

      const packageFile = result.files.find(f => f.path === 'package.json');
      const packageContent = JSON.parse(packageFile!.content);
      expect(packageContent.dependencies).toHaveProperty('next');
      expect(packageContent.dependencies).toHaveProperty('styled-components');

      // Should generate Next.js specific files
      const nextConfigFile = result.files.find(f => f.path === 'next.config.js');
      expect(nextConfigFile).toBeDefined();

      const pagesDir = result.files.filter(f => f.path.startsWith('pages/'));
      expect(pagesDir.length).toBeGreaterThan(0);
    });
  });

  describe('Template Processing', () => {
    it('should process templates with variables correctly', () => {
      const template = `
        interface {{componentName}}Props {
          {{#each props}}
          {{name}}{{#if optional}}?{{/if}}: {{type}};
          {{/each}}
        }
        
        export const {{componentName}}: React.FC<{{componentName}}Props> = ({{propsDestructure}}) => {
          return <{{elementType}}>{{content}}</{{elementType}}>;
        };
      `;

      const variables = {
        componentName: 'Button',
        props: [
          { name: 'children', type: 'React.ReactNode', optional: false },
          { name: 'onClick', type: '() => void', optional: true }
        ],
        propsDestructure: '{ children, onClick }',
        elementType: 'button',
        content: '{children}'
      };

      const processed = (engine as any).processTemplate(template, variables);

      expect(processed).toContain('interface ButtonProps');
      expect(processed).toContain('children: React.ReactNode');
      expect(processed).toContain('onClick?: () => void');
      expect(processed).toContain('export const Button: React.FC<ButtonProps>');
      expect(processed).toContain('{ children, onClick }');
      expect(processed).toContain('<button>{children}</button>');
    });

    it('should handle missing template variables gracefully', () => {
      const template = 'Hello {{name}}, your age is {{age}}';
      const variables = { name: 'John' }; // Missing age

      const processed = (engine as any).processTemplate(template, variables);

      expect(processed).toContain('Hello John');
      expect(processed).toContain('{{age}}'); // Unprocessed variable remains
    });
  });

  describe('Requirements Parsing', () => {
    it('should extract component names from descriptions', () => {
      const descriptions = [
        'Create a Button component',
        'Build a DataTable with sorting',
        'Generate a modal dialog',
        'Make a user profile card'
      ];

      descriptions.forEach(desc => {
        const name = (engine as any).extractComponentName(desc);
        expect(name).toMatch(/^[A-Z][a-zA-Z0-9]*$/); // PascalCase
      });

      expect((engine as any).extractComponentName('Create a Button component')).toBe('Button');
      expect((engine as any).extractComponentName('Build a DataTable with sorting')).toBe('DataTable');
      expect((engine as any).extractComponentName('Generate a modal dialog')).toBe('Modal');
    });

    it('should extract component types from descriptions', () => {
      expect((engine as any).extractComponentType('Create a button component')).toBe('button');
      expect((engine as any).extractComponentType('Build a form with validation')).toBe('form');
      expect((engine as any).extractComponentType('Generate a modal dialog')).toBe('modal');
      expect((engine as any).extractComponentType('Make a data table')).toBe('table');
      expect((engine as any).extractComponentType('Create a navigation menu')).toBe('navigation');
    });

    it('should extract props from descriptions', () => {
      const description = `
        Create a user card component with name, email, and avatar.
        It should have an onClick handler and support disabled state.
        Include a size prop with small, medium, large options.
      `;

      const props = (engine as any).extractProps(description);

      expect(props).toContainEqual(
        expect.objectContaining({ name: 'name', type: 'string' })
      );
      expect(props).toContainEqual(
        expect.objectContaining({ name: 'email', type: 'string' })
      );
      expect(props).toContainEqual(
        expect.objectContaining({ name: 'avatar', type: 'string', optional: true })
      );
      expect(props).toContainEqual(
        expect.objectContaining({ name: 'onClick', type: '() => void', optional: true })
      );
      expect(props).toContainEqual(
        expect.objectContaining({ name: 'disabled', type: 'boolean', optional: true })
      );
      expect(props).toContainEqual(
        expect.objectContaining({ name: 'size', type: "'small' | 'medium' | 'large'", optional: true })
      );
    });
  });

  describe('Error Handling', () => {
    it('should handle invalid component specifications', async () => {
      const invalidSpec = {
        // Missing required fields
        props: []
      };

      const result = await engine.generateComponent(invalidSpec as any);

      expect(result.success).toBe(false);
      expect(result.errors).toContain('Component name is required');
    });

    it('should handle template processing errors', async () => {
      // Mock template processing to throw error
      const originalProcessTemplate = (engine as any).processTemplate;
      (engine as any).processTemplate = jest.fn(() => {
        throw new Error('Template processing failed');
      });

      const result = await engine.generateFromDescription('Create a button');

      expect(result.success).toBe(false);
      expect(result.errors).toContain('Template processing failed');

      // Restore original method
      (engine as any).processTemplate = originalProcessTemplate;
    });
  });

  describe('Performance', () => {
    it('should handle large component generation efficiently', async () => {
      const largeComponentSpec = {
        name: 'LargeComponent',
        type: 'functional' as const,
        props: Array.from({ length: 50 }, (_, i) => ({
          name: `prop${i}`,
          type: 'string',
          optional: i % 2 === 0
        })),
        subComponents: Array.from({ length: 10 }, (_, i) => ({
          name: `SubComponent${i}`,
          type: 'internal' as const
        }))
      };

      const startTime = Date.now();
      const result = await engine.generateComponent(largeComponentSpec);
      const endTime = Date.now();

      expect(result.success).toBe(true);
      expect(endTime - startTime).toBeLessThan(3000); // Should complete within 3 seconds
      expect(result.files.length).toBe(11); // Main + 10 sub-components
    });
  });

  describe('Integration', () => {
    it('should generate components compatible with project structure', async () => {
      const result = await engine.generateFromDescription('Create a theme-aware button component');

      expect(result.success).toBe(true);
      
      const generatedFile = result.files[0];
      
      // Should use project's TypeScript configuration
      expect(generatedFile.content).toContain('React.FC');
      expect(generatedFile.content).toContain('interface');
      
      // Should follow project's styling approach
      if (generationContext.projectStructure.framework.features?.includes('tailwind')) {
        expect(generatedFile.content).toContain('className');
      }
      
      // Should be compatible with project structure
      expect(generatedFile.type).toBe('component');
      expect(generatedFile.path).toMatch(/components/);
    });
  });
});