import path from 'path';
import { z } from 'zod';
import { BaseGenerator, GenerationContext, TemplateFile } from './base-generator.js';
import { logger } from '../utils/logger.js';
import { LocalizationConfig } from '../localization/core.js';

// Page generation input schema
const PageGenerationInputSchema = z.object({
  name: z.string().min(1),
  route: z.string().min(1),
  layout: z.enum(['default', 'auth', 'dashboard', 'minimal']).default('default'),
  authentication: z.object({
    required: z.boolean().default(false),
    roles: z.array(z.string()).default([]),
    redirectTo: z.string().default('/login'),
  }).default({}),
  seo: z.object({
    title: z.string().optional(),
    description: z.string().optional(),
    keywords: z.array(z.string()).default([]),
    ogImage: z.string().optional(),
  }).default({}),
  sections: z.array(z.object({
    name: z.string(),
    component: z.string(),
    props: z.record(z.any()).default({}),
  })).default([]),
  dataFetching: z.object({
    type: z.enum(['static', 'ssr', 'ssg', 'client']).default('client'),
    api: z.string().optional(),
    revalidate: z.number().optional(),
  }).default({}),
  features: z.object({
    loading: z.boolean().default(true),
    error: z.boolean().default(true),
    skeleton: z.boolean().default(false),
    breadcrumbs: z.boolean().default(false),
    search: z.boolean().default(false),
    filters: z.boolean().default(false),
    pagination: z.boolean().default(false),
  }).default({}),
  platform: z.enum(['nextjs', 'react']).default('nextjs'),
  typescript: z.boolean().default(true),
  localization: z.boolean().default(true),
  outputPath: z.string(),
});

type PageGenerationInput = z.infer<typeof PageGenerationInputSchema>;

// Page template data
interface PageTemplateData {
  name: string;
  route: string;
  layout: string;
  imports: string[];
  types: string[];
  hooks: string[];
  handlers: string[];
  seo: SEOData;
  sections: PageSection[];
  dataFetching: DataFetchingData;
  features: PageFeatures;
}

interface SEOData {
  title: string;
  description: string;
  keywords: string[];
  ogImage?: string;
  jsonLd?: any;
}

interface PageSection {
  name: string;
  component: string;
  props: Record<string, any>;
  conditional?: string;
}

interface DataFetchingData {
  type: 'static' | 'ssr' | 'ssg' | 'client';
  functions: string[];
  api?: string;
  revalidate?: number;
}

interface PageFeatures {
  loading: boolean;
  error: boolean;
  skeleton: boolean;
  breadcrumbs: boolean;
  search: boolean;
  filters: boolean;
  pagination: boolean;
}

// Page generator class
export class PageGenerator extends BaseGenerator {
  constructor() {
    super({
      name: 'page-generator',
      description: 'Generate pages with SEO, data fetching, and localization',
      templateDir: path.join(process.cwd(), 'templates', 'pages'),
      outputDir: '',
      overwrite: false,
      backup: true,
      validate: true,
      hooks: {
        beforeGenerate: async (context) => {
          logger.info(`Generating ${context.variables.platform} page: ${context.variables.name}`);
        },
        afterGenerate: async (context, results) => {
          const successCount = results.filter(r => r.success).length;
          logger.info(`Generated ${successCount} files for page ${context.variables.name}`);
        },
      },
    });
  }
  
  // Validate input
  async validateInput(input: any): Promise<PageGenerationInput> {
    const validated = PageGenerationInputSchema.parse(input);
    
    // Validate route format
    if (!validated.route.startsWith('/')) {
      validated.route = `/${validated.route}`;
    }
    
    return validated;
  }
  
  // Prepare generation context
  async prepareContext(input: PageGenerationInput): Promise<GenerationContext> {
    const templateData = await this.generateTemplateData(input);
    
    const variables = {
      // Basic info
      name: input.name,
      route: input.route,
      layout: input.layout,
      platform: input.platform,
      typescript: input.typescript,
      
      // Template data
      ...templateData,
      
      // Configuration
      authentication: input.authentication,
      localization: input.localization,
      
      // Utilities
      kebabCase: (str: string) => str.replace(/([a-z])([A-Z])/g, '$1-$2').toLowerCase(),
      camelCase: (str: string) => str.charAt(0).toLowerCase() + str.slice(1),
      pascalCase: (str: string) => str.charAt(0).toUpperCase() + str.slice(1),
      slugify: (str: string) => str.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, ''),
      
      // Metadata
      generatedAt: new Date().toISOString(),
      generator: 'page-generator',
    };
    
    return {
      templatePath: this.config.templateDir,
      outputPath: input.outputPath,
      variables,
      config: this.config,
      metadata: {
        timestamp: new Date().toISOString(),
        generator: this.config.name,
        version: '1.0.0',
      },
    };
  }
  
  // Get template files
  async getTemplateFiles(): Promise<TemplateFile[]> {
    const allFiles = await this.scanTemplateDirectory(this.config.templateDir);
    return this.loadTemplateFiles(allFiles);
  }
  
  // Generate template data for page
  private async generateTemplateData(input: PageGenerationInput): Promise<PageTemplateData> {
    const imports = this.generateImports(input);
    const types = this.generateTypes(input);
    const hooks = this.generateHooks(input);
    const handlers = this.generateHandlers(input);
    const seo = this.generateSEOData(input);
    const sections = this.generateSections(input);
    const dataFetching = this.generateDataFetching(input);
    
    return {
      name: input.name,
      route: input.route,
      layout: input.layout,
      imports,
      types,
      hooks,
      handlers,
      seo,
      sections,
      dataFetching,
      features: input.features,
    };
  }
  
  // Generate imports
  private generateImports(input: PageGenerationInput): string[] {
    const imports: string[] = [];
    
    // React imports
    const reactImports: string[] = ['React'];
    
    if (input.features.loading || input.features.error) {
      reactImports.push('useState', 'useEffect');
    }
    
    imports.push(`import { ${reactImports.join(', ')} } from 'react';`);
    
    // Platform-specific imports
    if (input.platform === 'nextjs') {
      imports.push("import Head from 'next/head';");
      
      if (input.dataFetching.type === 'ssr') {
        imports.push("import type { GetServerSideProps } from 'next';");
      } else if (input.dataFetching.type === 'ssg') {
        imports.push("import type { GetStaticProps } from 'next';");
      }
      
      if (input.authentication.required) {
        imports.push("import { useSession } from 'next-auth/react';");
      }
    } else {
      imports.push("import { Helmet } from 'react-helmet-async';");
      
      if (input.authentication.required) {
        imports.push("import { useAuth } from '../hooks/useAuth';");
      }
    }
    
    // Localization imports
    if (input.localization) {
      imports.push("import { useTranslation } from 'react-i18next';");
    }
    
    // Layout imports
    if (input.layout !== 'minimal') {
      imports.push(`import { ${input.layout === 'default' ? 'Default' : input.layout}Layout } from '../layouts';`);
    }
    
    // Component imports for sections
    for (const section of input.sections) {
      imports.push(`import { ${section.component} } from '../components';`);
    }
    
    // Feature imports
    if (input.features.loading) {
      imports.push("import { LoadingSpinner } from '../components/LoadingSpinner';");
    }
    
    if (input.features.error) {
      imports.push("import { ErrorBoundary } from '../components/ErrorBoundary';");
    }
    
    if (input.features.skeleton) {
      imports.push("import { PageSkeleton } from '../components/PageSkeleton';");
    }
    
    if (input.features.breadcrumbs) {
      imports.push("import { Breadcrumbs } from '../components/Breadcrumbs';");
    }
    
    return imports;
  }
  
  // Generate TypeScript types
  private generateTypes(input: PageGenerationInput): string[] {
    const types: string[] = [];
    
    if (input.typescript) {
      // Page props type
      let propsType = 'interface PageProps {\n';
      
      if (input.dataFetching.api) {
        propsType += '  data?: any;\n';
      }
      
      if (input.features.search) {
        propsType += '  searchQuery?: string;\n';
      }
      
      if (input.features.filters) {
        propsType += '  filters?: Record<string, any>;\n';
      }
      
      if (input.features.pagination) {
        propsType += '  page?: number;\n';
        propsType += '  limit?: number;\n';
      }
      
      propsType += '}';
      types.push(propsType);
      
      // Data fetching types
      if (input.dataFetching.type === 'ssr' || input.dataFetching.type === 'ssg') {
        if (input.platform === 'nextjs') {
          types.push(`
interface PageData {
  data: any;
  error?: string;
}`);
        }
      }
    }
    
    return types;
  }
  
  // Generate hooks
  private generateHooks(input: PageGenerationInput): string[] {
    const hooks: string[] = [];
    
    if (input.localization) {
      hooks.push("const { t } = useTranslation();");
    }
    
    if (input.authentication.required) {
      if (input.platform === 'nextjs') {
        hooks.push("const { data: session, status } = useSession();");
      } else {
        hooks.push("const { user, loading: authLoading } = useAuth();");
      }
    }
    
    if (input.features.loading) {
      hooks.push("const [loading, setLoading] = useState(false);");
    }
    
    if (input.features.error) {
      hooks.push("const [error, setError] = useState<string | null>(null);");
    }
    
    if (input.dataFetching.type === 'client' && input.dataFetching.api) {
      hooks.push("const [data, setData] = useState<any>(null);");
    }
    
    if (input.features.search) {
      hooks.push("const [searchQuery, setSearchQuery] = useState('');");
    }
    
    if (input.features.filters) {
      hooks.push("const [filters, setFilters] = useState<Record<string, any>>({});");
    }
    
    if (input.features.pagination) {
      hooks.push("const [currentPage, setCurrentPage] = useState(1);");
    }
    
    return hooks;
  }
  
  // Generate event handlers
  private generateHandlers(input: PageGenerationInput): string[] {
    const handlers: string[] = [];
    
    if (input.dataFetching.type === 'client' && input.dataFetching.api) {
      handlers.push(`
  const fetchData = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await fetch('${input.dataFetching.api}');
      if (!response.ok) throw new Error('Failed to fetch data');
      
      const result = await response.json();
      setData(result);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setLoading(false);
    }
  };
  
  useEffect(() => {
    fetchData();
  }, []);`);
    }
    
    if (input.features.search) {
      handlers.push(`
  const handleSearch = (query: string) => {
    setSearchQuery(query);
    // Implement search logic
  };`);
    }
    
    if (input.features.filters) {
      handlers.push(`
  const handleFilterChange = (key: string, value: any) => {
    setFilters(prev => ({ ...prev, [key]: value }));
  };`);
    }
    
    if (input.features.pagination) {
      handlers.push(`
  const handlePageChange = (page: number) => {
    setCurrentPage(page);
    // Implement pagination logic
  };`);
    }
    
    return handlers;
  }
  
  // Generate SEO data
  private generateSEOData(input: PageGenerationInput): SEOData {
    const title = input.seo.title || `${input.name} | App`;
    const description = input.seo.description || `${input.name} page description`;
    
    return {
      title,
      description,
      keywords: input.seo.keywords,
      ogImage: input.seo.ogImage,
      jsonLd: {
        '@context': 'https://schema.org',
        '@type': 'WebPage',
        name: title,
        description,
        url: input.route,
      },
    };
  }
  
  // Generate page sections
  private generateSections(input: PageGenerationInput): PageSection[] {
    const sections: PageSection[] = [];
    
    // Add user-defined sections
    for (const section of input.sections) {
      sections.push({
        name: section.name,
        component: section.component,
        props: section.props,
      });
    }
    
    // Add default sections based on features
    if (input.features.breadcrumbs) {
      sections.unshift({
        name: 'breadcrumbs',
        component: 'Breadcrumbs',
        props: {
          items: [
            { label: 'Home', href: '/' },
            { label: input.name, href: input.route, current: true },
          ],
        },
      });
    }
    
    return sections;
  }
  
  // Generate data fetching configuration
  private generateDataFetching(input: PageGenerationInput): DataFetchingData {
    const functions: string[] = [];
    
    if (input.dataFetching.type === 'ssr' && input.platform === 'nextjs') {
      functions.push(`
export const getServerSideProps: GetServerSideProps = async (context) => {
  try {
    ${input.dataFetching.api ? `
    const response = await fetch('${input.dataFetching.api}');
    const data = await response.json();
    ` : 'const data = null;'}
    
    return {
      props: {
        data,
      },
    };
  } catch (error) {
    return {
      props: {
        data: null,
        error: 'Failed to load data',
      },
    };
  }
};`);
    }
    
    if (input.dataFetching.type === 'ssg' && input.platform === 'nextjs') {
      functions.push(`
export const getStaticProps: GetStaticProps = async () => {
  try {
    ${input.dataFetching.api ? `
    const response = await fetch('${input.dataFetching.api}');
    const data = await response.json();
    ` : 'const data = null;'}
    
    return {
      props: {
        data,
      },
      ${input.dataFetching.revalidate ? `revalidate: ${input.dataFetching.revalidate},` : ''}
    };
  } catch (error) {
    return {
      props: {
        data: null,
        error: 'Failed to load data',
      },
    };
  }
};`);
    }
    
    return {
      type: input.dataFetching.type,
      functions,
      api: input.dataFetching.api,
      revalidate: input.dataFetching.revalidate,
    };
  }
}

// Export convenience function
export async function generatePage(input: PageGenerationInput): Promise<void> {
  const generator = new PageGenerator();
  await generator.generate(input);
}