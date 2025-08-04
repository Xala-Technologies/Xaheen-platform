// Generated MCP prompt definitions for Xala-Enterprise UI System (xala-mcp)
// Converted from previous standalone promptHandlers implementation

import { MCPPromptMap, MCPMessage, MCPArguments } from './types/index.js';
import { getFramework } from './utils/framework.js';

/**
 * Map of prompt definitions compatible with xala-mcp server
 */
export const prompts: MCPPromptMap = {
  'build-shadcn-page': {
    description: 'Generate a complete shadcn/ui page using v4 components and blocks',
    args: {
      pageType: { type: 'string', required: true, description: 'Type of page to build (dashboard, login, calendar, sidebar, products, custom)' },
      features: { type: 'string', required: false, description: 'Specific features or components needed (comma-separated)' },
      layout: { type: 'string', required: false, description: 'Layout preference (sidebar, header, full-width, centered)' },
      style: { type: 'string', required: false, description: 'Design style (minimal, modern, enterprise, creative)' },
    },
  },

  'create-dashboard': {
    description: 'Create a comprehensive dashboard using shadcn/ui v4 blocks and components',
    args: {
      dashboardType: { type: 'string', required: true, description: 'Type of dashboard (analytics, admin, user, project, sales)' },
      widgets: { type: 'string', required: false, description: 'Dashboard widgets needed (charts, tables, cards, metrics)' },
      navigation: { type: 'string', required: false, description: 'Navigation style (sidebar, top-nav, breadcrumbs)' },
    },
  },

  'create-auth-flow': {
    description: 'Generate authentication pages using shadcn/ui v4 login blocks',
    args: {
      authType: { type: 'string', required: true, description: 'Authentication type (login, register, forgot-password, two-factor)' },
      providers: { type: 'string', required: false, description: 'Auth providers (email, google, github, apple)' },
      features: { type: 'string', required: false, description: 'Additional features (remember-me, social-login, validation)' },
    },
  },

  'optimize-shadcn-component': {
    description: 'Optimize or enhance existing shadcn/ui components with best practices',
    args: {
      component: { type: 'string', required: true, description: 'Component name to optimize' },
      optimization: { type: 'string', required: false, description: 'Type of optimization (performance, accessibility, responsive, animations)' },
      useCase: { type: 'string', required: false, description: 'Specific use case or context for the component' },
    },
  },

  'create-data-table': {
    description: 'Create advanced data tables with shadcn/ui components',
    args: {
      dataType: { type: 'string', required: true, description: 'Type of data to display (users, products, orders, analytics)' },
      features: { type: 'string', required: false, description: 'Table features (sorting, filtering, pagination, search, selection)' },
      actions: { type: 'string', required: false, description: 'Row actions (edit, delete, view, custom)' },
    },
  },
};

/**
 * Handler implementations for prompts
 */
export const promptHandlers = {
  'build-shadcn-page': (args: MCPArguments<typeof prompts['build-shadcn-page']>): { messages: MCPMessage[] } => {
    const { pageType, features = '', layout = 'sidebar', style = 'modern' } = args;
    const framework = getFramework();
    const isSvelte = framework === 'svelte';

    const text = `Create a complete ${pageType} page using shadcn/ui v4 components and blocks.\n\n` +
      `REQUIREMENTS:\n` +
      `- Page Type: ${pageType}\n` +
      `- Features: ${features || 'Standard features for this page type'}\n` +
      `- Layout: ${layout}\n` +
      `- Design Style: ${style}\n\n` +
      `INSTRUCTIONS:\n` +
      `1. Use the MCP tools to explore available v4 blocks for this page type.\n` +
      `2. Build the page using shadcn/ui v4 and ensure responsive TypeScript best practices.\n` +
      `3. ${getPageTypeSpecificInstructions(pageType)}\n` +
      `4. Create main page component with sub-components, imports, state management (${
        isSvelte ? 'Svelte runes' : 'React hooks'
      }).\n` +
      `5. Styling guidelines following ${style} design with dark/light support.\n`;

    return { messages: [{ role: 'user', content: { type: 'text', text } }] };
  },

  'create-dashboard': (args: MCPArguments<typeof prompts['create-dashboard']>): { messages: MCPMessage[] } => {
    const { dashboardType, widgets = '', navigation = 'sidebar' } = args;
    const framework = getFramework();

    const text = `Create a comprehensive ${dashboardType} dashboard using shadcn/ui v4 blocks and components.\n\n` +
      `REQUIREMENTS:\n` +
      `- Dashboard Type: ${dashboardType}\n` +
      `- Widgets: ${widgets || 'Standard widgets for this dashboard type'}\n` +
      `- Navigation: ${navigation}\n\n` +
      `INSTRUCTIONS:\n` +
      `1. Use appropriate shadcn/ui v4 dashboard blocks and components.\n` +
      `2. Implement responsive grid layout with proper spacing.\n` +
      `3. Add interactive widgets and data visualization components.\n` +
      `4. Include navigation structure (${navigation}).\n` +
      `5. Follow ${framework} best practices for state management and performance.\n`;

    return { messages: [{ role: 'user', content: { type: 'text', text } }] };
  },

  'create-auth-flow': (args: MCPArguments<typeof prompts['create-auth-flow']>): { messages: MCPMessage[] } => {
    const { authType, providers = '', features = '' } = args;

    const text = `Generate ${authType} authentication pages using shadcn/ui v4 login blocks.\n\n` +
      `REQUIREMENTS:\n` +
      `- Auth Type: ${authType}\n` +
      `- Providers: ${providers || 'email'}\n` +
      `- Features: ${features || 'Standard auth features'}\n\n` +
      `INSTRUCTIONS:\n` +
      `1. Use shadcn/ui v4 form components and validation.\n` +
      `2. Implement proper form handling and error states.\n` +
      `3. Add authentication provider integrations if specified.\n` +
      `4. Include proper accessibility and security practices.\n` +
      `5. Create responsive design with modern styling.\n`;

    return { messages: [{ role: 'user', content: { type: 'text', text } }] };
  },

  'optimize-shadcn-component': (args: MCPArguments<typeof prompts['optimize-shadcn-component']>): { messages: MCPMessage[] } => {
    const { component, optimization = '', useCase = '' } = args;

    const text = `Optimize or enhance the ${component} shadcn/ui component with best practices.\n\n` +
      `REQUIREMENTS:\n` +
      `- Component: ${component}\n` +
      `- Optimization: ${optimization || 'General optimization'}\n` +
      `- Use Case: ${useCase || 'General use case'}\n\n` +
      `INSTRUCTIONS:\n` +
      `1. ${getOptimizationInstructions(optimization)}\n` +
      `2. Maintain shadcn/ui v4 compatibility and styling.\n` +
      `3. Add proper TypeScript types and documentation.\n` +
      `4. Include performance improvements and accessibility enhancements.\n` +
      `5. Provide usage examples and migration guide if needed.\n`;

    return { messages: [{ role: 'user', content: { type: 'text', text } }] };
  },

  'create-data-table': (args: MCPArguments<typeof prompts['create-data-table']>): { messages: MCPMessage[] } => {
    const { dataType, features = '', actions = '' } = args;

    const text = `Create advanced data table for ${dataType} using shadcn/ui components.\n\n` +
      `REQUIREMENTS:\n` +
      `- Data Type: ${dataType}\n` +
      `- Features: ${features || 'sorting, pagination'}\n` +
      `- Actions: ${actions || 'view, edit'}\n\n` +
      `INSTRUCTIONS:\n` +
      `1. Use shadcn/ui Table component with proper structure.\n` +
      `2. Implement requested features (sorting, filtering, pagination, etc.).\n` +
      `3. Add row actions and bulk operations.\n` +
      `4. Include proper loading states and error handling.\n` +
      `5. Ensure responsive design and accessibility compliance.\n`;

    return { messages: [{ role: 'user', content: { type: 'text', text } }] };
  },
};

/**
 * Helper functions
 */
function getPageTypeSpecificInstructions(pageType: string): string {
  const instructions: Record<string, string> = {
    dashboard: 'Include metrics cards, charts, and data visualization components.',
    login: 'Focus on form validation, security, and user experience.',
    calendar: 'Implement date navigation, event display, and interaction features.',
    sidebar: 'Create collapsible navigation with proper hierarchy and icons.',
    products: 'Include product grid, filters, search, and detail views.',
    custom: 'Follow the specific requirements provided in features parameter.',
  };
  return instructions[pageType] || 'Implement the requested functionality with best practices.';
}

function getOptimizationInstructions(optimization: string): string {
  const instructions: Record<string, string> = {
    performance: 'Focus on rendering optimization, memoization, and bundle size reduction.',
    accessibility: 'Enhance ARIA labels, keyboard navigation, and screen reader support.',
    responsive: 'Improve mobile and tablet layouts with better breakpoint handling.',
    animations: 'Add smooth transitions and micro-interactions for better UX.',
  };
  return instructions[optimization] || 'Apply general best practices and code quality improvements.';
}