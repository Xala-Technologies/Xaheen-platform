/**
 * Enhanced Prompt Templates for Practical MCP Tools
 * Integrates structured prompts with our 10 practical tools for better performance and results
 */

import { getFramework } from "../utils/framework.js";

export interface PromptTemplate {
  name: string;
  description: string;
  arguments: Array<{
    name: string;
    description: string;
    required?: boolean;
    type?: string;
  }>;
  handler: (args: any) => {
    messages: Array<{
      role: string;
      content: {
        type: string;
        text: string;
      };
    }>;
  };
}

/**
 * Enhanced prompts for our 10 practical MCP tools
 */
export const practicalToolPrompts: Record<string, PromptTemplate> = {
  "get-components-enhanced": {
    name: "get-components-enhanced",
    description: "Intelligently retrieve and analyze UI components from design system with contextual recommendations",
    arguments: [
      {
        name: "componentName",
        description: "Specific component name to retrieve (e.g., Button, Card, Modal)",
        required: false
      },
      {
        name: "platform",
        description: "Target platform (react, vue, angular, svelte, nextjs, electron, react-native)",
        required: true
      },
      {
        name: "category",
        description: "Component category (form, navigation, layout, feedback, data-display, input, overlay)",
        required: false
      },
      {
        name: "useCase",
        description: "Specific use case or context for the component",
        required: false
      },
      {
        name: "designStyle",
        description: "Design style preference (minimal, modern, enterprise, creative)",
        required: false
      }
    ],
    handler: ({ componentName = "", platform, category = "", useCase = "general", designStyle = "modern" }) => {
      const framework = getFramework();
      const isSvelte = framework === 'svelte';
      
      return {
        messages: [
          {
            role: "user",
            content: {
              type: "text",
              text: `Retrieve and analyze UI components from our design system with intelligent recommendations.

REQUIREMENTS:
- Component: ${componentName || 'All relevant components'}
- Platform: ${platform}
- Category: ${category || 'All categories'}
- Use Case: ${useCase}
- Design Style: ${designStyle}

INSTRUCTIONS:
1. Use the 'get_components' MCP tool to retrieve components:
   - Search for ${componentName ? `specific component: ${componentName}` : 'components in category: ' + category}
   - Filter by platform: ${platform}
   - Apply category filter: ${category}

2. Analyze retrieved components for ${useCase} use case:
   - Evaluate component variants and their suitability
   - Check accessibility compliance and features
   - Assess responsive design capabilities
   - Review ${isSvelte ? 'Svelte' : platform} specific implementations

3. Provide contextual recommendations:
   - Suggest best component variants for ${useCase}
   - Recommend complementary components
   - Identify potential customization needs
   - Suggest ${designStyle} design adaptations

4. Implementation guidance:
   - Provide usage examples for ${platform}
   - Include proper TypeScript types
   - Add accessibility considerations
   - Suggest performance optimizations

5. Integration patterns:
   - Show how components work together
   - Provide composition examples
   - Include state management patterns
   - Add error handling recommendations

Please provide comprehensive component analysis with practical implementation guidance.`,
            },
          },
        ],
      };
    },
  },

  "generate-component-enhanced": {
    name: "generate-component-enhanced",
    description: "Generate sophisticated custom components using design system principles and best practices",
    arguments: [
      {
        name: "componentName",
        description: "Name of the component to generate",
        required: true
      },
      {
        name: "platform",
        description: "Target platform (react, vue, angular, svelte, nextjs, electron, react-native)",
        required: true
      },
      {
        name: "description",
        description: "Detailed description of component functionality and purpose",
        required: true
      },
      {
        name: "baseComponents",
        description: "Base UI components to use (comma-separated)",
        required: false
      },
      {
        name: "features",
        description: "Required features (comma-separated)",
        required: false
      },
      {
        name: "designStyle",
        description: "Design style (minimal, modern, enterprise, creative)",
        required: false
      },
      {
        name: "accessibility",
        description: "Accessibility requirements (WCAG level, specific needs)",
        required: false
      }
    ],
    handler: ({ 
      componentName, 
      platform, 
      description, 
      baseComponents = "", 
      features = "", 
      designStyle = "modern",
      accessibility = "WCAG 2.1 AA"
    }) => {
      const framework = getFramework();
      const isSvelte = framework === 'svelte';
      
      return {
        messages: [
          {
            role: "user",
            content: {
              type: "text",
              text: `Generate a sophisticated ${componentName} component following design system principles and best practices.

REQUIREMENTS:
- Component Name: ${componentName}
- Platform: ${platform}
- Description: ${description}
- Base Components: ${baseComponents || 'Standard design system components'}
- Features: ${features || 'Standard component features'}
- Design Style: ${designStyle}
- Accessibility: ${accessibility}

INSTRUCTIONS:
1. First, use MCP tools to gather context:
   - Use 'get_components' to analyze similar existing components
   - Use 'get_rules' for design system guidelines and best practices
   - Use 'get_blocks' to see if there are relevant layout patterns

2. Component Architecture:
   - Design component API with proper TypeScript interfaces
   - Plan component composition and prop structure
   - Define state management approach using ${isSvelte ? 'Svelte runes' : platform + ' patterns'}
   - Consider component lifecycle and performance

3. Implementation Strategy:
   - Use base components: ${baseComponents.split(',').map((c: string) => c.trim()).join(', ')}
   - Implement features: ${features.split(',').map((f: string) => f.trim()).join(', ')}
   - Follow ${designStyle} design principles
   - Ensure ${accessibility} compliance

4. Code Generation:
   - Create main component with proper exports
   - Implement sub-components if needed
   - Add comprehensive TypeScript types
   - Include proper error boundaries and validation
   - Add loading and error states

5. Design System Integration:
   - Use consistent design tokens and spacing
   - Follow established naming conventions
   - Implement theme support (light/dark mode)
   - Ensure component fits design system patterns

6. Testing and Documentation:
   - Include usage examples and demos
   - Add prop documentation with examples
   - Suggest test cases for component behavior
   - Include accessibility testing guidelines

7. Performance Considerations:
   - Implement ${isSvelte ? 'Svelte reactivity optimizations' : 'React performance patterns'}
   - Add lazy loading where appropriate
   - Optimize bundle size and dependencies
   - Consider server-side rendering compatibility

Please generate production-ready component code with comprehensive documentation and examples.`,
            },
          },
        ],
      };
    },
  },

  "generate-page-enhanced": {
    name: "generate-page-enhanced",
    description: "Create complete, production-ready pages using components, blocks, and design system patterns",
    arguments: [
      {
        name: "pageName",
        description: "Name of the page to generate",
        required: true
      },
      {
        name: "pageType",
        description: "Type of page (dashboard, profile, settings, landing, auth, admin)",
        required: true
      },
      {
        name: "platform",
        description: "Target platform (react, vue, angular, svelte, nextjs, electron, react-native)",
        required: true
      },
      {
        name: "layout",
        description: "Layout type (sidebar, header, full-width, centered, split)",
        required: false
      },
      {
        name: "features",
        description: "Page features and functionality (comma-separated)",
        required: false
      },
      {
        name: "dataRequirements",
        description: "Data and API requirements for the page",
        required: false
      }
    ],
    handler: ({ 
      pageName, 
      pageType, 
      platform, 
      layout = "sidebar", 
      features = "", 
      dataRequirements = "mock data"
    }) => {
      const framework = getFramework();
      const isSvelte = framework === 'svelte';
      
      return {
        messages: [
          {
            role: "user",
            content: {
              type: "text",
              text: `Create a complete, production-ready ${pageName} page following modern ${platform} best practices.

REQUIREMENTS:
- Page Name: ${pageName}
- Page Type: ${pageType}
- Platform: ${platform}
- Layout: ${layout}
- Features: ${features || 'Standard page features'}
- Data Requirements: ${dataRequirements}

INSTRUCTIONS:
1. Research and Planning:
   - Use 'get_blocks' to find relevant layout blocks for ${pageType} pages
   - Use 'get_components' to identify needed UI components
   - Use 'get_rules' to understand design system guidelines
   - Analyze ${pageType} page patterns and best practices

2. Page Architecture:
   - Design page structure with ${layout} layout
   - Plan component hierarchy and data flow
   - Define routing and navigation patterns
   - Consider SEO and performance requirements

3. Layout Implementation:
   - Implement ${layout} layout using appropriate blocks
   - Create responsive design for all screen sizes
   - Add proper navigation and breadcrumbs
   - Include header, footer, and sidebar components

4. Feature Implementation:
   ${features.split(',').map((feature: string) => 
     `- ${feature.trim()}: Implement ${feature.trim()} with proper state management and user feedback`
   ).join('\n   ')}

5. Data Management:
   - Implement data fetching patterns for ${dataRequirements}
   - Add loading states and error handling
   - Create proper TypeScript interfaces for data
   - Implement ${isSvelte ? 'Svelte stores or runes' : 'state management'} patterns

6. Page-Specific Features for ${pageType}:
   ${getPageTypeEnhancements(pageType)}

7. Performance Optimization:
   - Implement code splitting and lazy loading
   - Optimize images and assets
   - Add proper caching strategies
   - Consider ${platform} specific optimizations

8. Accessibility and UX:
   - Ensure WCAG 2.1 AA compliance
   - Add proper focus management
   - Implement keyboard navigation
   - Include loading and error states

9. Testing Considerations:
   - Add unit tests for page components
   - Include integration tests for user flows
   - Test responsive design across devices
   - Validate accessibility compliance

Please generate complete page implementation with all necessary components, routing, and data management.`,
            },
          },
        ],
      };
    },
  },

  "compliance-validation-enhanced": {
    name: "compliance-validation-enhanced",
    description: "Comprehensive compliance validation with detailed recommendations and fixes",
    arguments: [
      {
        name: "code",
        description: "Code to validate for compliance",
        required: true
      },
      {
        name: "complianceType",
        description: "Type of compliance (norwegian, gdpr, accessibility, security)",
        required: true
      },
      {
        name: "platform",
        description: "Target platform",
        required: true
      },
      {
        name: "strictMode",
        description: "Enable strict compliance checking",
        required: false
      },
      {
        name: "context",
        description: "Context or use case for the code",
        required: false
      }
    ],
    handler: ({ code, complianceType, platform, strictMode = "false", context = "general" }) => {
      return {
        messages: [
          {
            role: "user",
            content: {
              type: "text",
              text: `Perform comprehensive ${complianceType} compliance validation with detailed analysis and recommendations.

REQUIREMENTS:
- Compliance Type: ${complianceType}
- Platform: ${platform}
- Strict Mode: ${strictMode}
- Context: ${context}

CODE TO VALIDATE:
\`\`\`${platform}
${code}
\`\`\`

INSTRUCTIONS:
1. Use appropriate MCP compliance tools:
   - Use '${complianceType}_compliance' tool to validate the code
   - Use 'get_rules' to get relevant compliance guidelines
   - Use 'analyse_code' for additional security and accessibility checks

2. Comprehensive Analysis:
   - Validate against ${complianceType} requirements
   - Check for accessibility violations (WCAG 2.1 AA)
   - Analyze security vulnerabilities
   - Review data handling practices
   - Assess internationalization compliance

3. Detailed Reporting:
   - List all compliance violations with severity levels
   - Provide specific line-by-line feedback
   - Include regulatory references and standards
   - Explain the business impact of violations

4. Remediation Recommendations:
   - Provide specific code fixes for each violation
   - Suggest alternative implementations
   - Include best practice examples
   - Recommend preventive measures

5. ${complianceType.toUpperCase()} Specific Checks:
   ${getComplianceSpecificChecks(complianceType)}

6. Implementation Guidance:
   - Provide step-by-step fix instructions
   - Include updated code examples
   - Suggest testing strategies
   - Recommend monitoring approaches

7. Documentation Requirements:
   - List required documentation updates
   - Suggest compliance documentation templates
   - Include audit trail requirements
   - Recommend regular review processes

Please provide comprehensive compliance analysis with actionable recommendations and code fixes.`,
            },
          },
        ],
      };
    },
  },

  "code-analysis-enhanced": {
    name: "code-analysis-enhanced",
    description: "Deep code analysis with performance, security, and maintainability insights",
    arguments: [
      {
        name: "code",
        description: "Code to analyze",
        required: true
      },
      {
        name: "platform",
        description: "Target platform",
        required: true
      },
      {
        name: "analysisType",
        description: "Type of analysis (performance, security, accessibility, maintainability, all)",
        required: true
      },
      {
        name: "context",
        description: "Context or use case for the code",
        required: false
      }
    ],
    handler: ({ code, platform, analysisType, context = "general" }) => {
      const framework = getFramework();
      const isSvelte = framework === 'svelte';
      
      return {
        messages: [
          {
            role: "user",
            content: {
              type: "text",
              text: `Perform deep ${analysisType} analysis of the provided code with actionable insights and recommendations.

REQUIREMENTS:
- Analysis Type: ${analysisType}
- Platform: ${platform}
- Context: ${context}

CODE TO ANALYZE:
\`\`\`${platform}
${code}
\`\`\`

INSTRUCTIONS:
1. Use MCP analysis tools:
   - Use 'analyse_code' tool for comprehensive analysis
   - Use 'get_rules' to get relevant coding standards
   - Use compliance tools for regulatory checks

2. ${analysisType.toUpperCase()} Analysis Focus:
   ${getAnalysisInstructions(analysisType, isSvelte)}

3. Code Quality Assessment:
   - Evaluate code structure and organization
   - Check for design pattern adherence
   - Assess ${isSvelte ? 'Svelte' : platform} best practices
   - Review error handling and edge cases

4. Performance Analysis:
   - Identify performance bottlenecks
   - Suggest optimization opportunities
   - Analyze bundle size impact
   - Review rendering performance

5. Security Assessment:
   - Check for common vulnerabilities
   - Validate input sanitization
   - Review authentication/authorization
   - Assess data exposure risks

6. Maintainability Review:
   - Evaluate code readability and documentation
   - Check for code duplication
   - Assess testing coverage needs
   - Review dependency management

7. Actionable Recommendations:
   - Provide specific improvement suggestions
   - Include refactored code examples
   - Suggest architectural improvements
   - Recommend tooling and processes

8. Metrics and Scoring:
   - Provide quantitative scores for each area
   - Include before/after comparisons
   - Set improvement targets
   - Track progress indicators

Please provide comprehensive analysis with specific, actionable recommendations and code examples.`,
            },
          },
        ],
      };
    },
  },

  "project-initialization-enhanced": {
    name: "project-initialization-enhanced",
    description: "Initialize comprehensive projects with best practices, tooling, and architecture",
    arguments: [
      {
        name: "projectName",
        description: "Name of the project to initialize",
        required: true
      },
      {
        name: "projectType",
        description: "Type of project (web-app, mobile-app, desktop-app, library, component-library)",
        required: true
      },
      {
        name: "platform",
        description: "Primary platform",
        required: true
      },
      {
        name: "features",
        description: "Required features (comma-separated)",
        required: false
      },
      {
        name: "architecture",
        description: "Architecture preference (monolith, microservices, serverless)",
        required: false
      }
    ],
    handler: ({ 
      projectName, 
      projectType, 
      platform, 
      features = "typescript,testing,linting", 
      architecture = "monolith"
    }) => {
      return {
        messages: [
          {
            role: "user",
            content: {
              type: "text",
              text: `Initialize a comprehensive ${projectType} project with enterprise-grade setup and best practices.

REQUIREMENTS:
- Project Name: ${projectName}
- Project Type: ${projectType}
- Platform: ${platform}
- Features: ${features}
- Architecture: ${architecture}

INSTRUCTIONS:
1. Use MCP initialization tools:
   - Use 'init_project' tool to create base project structure
   - Use 'get_rules' to get project setup guidelines
   - Use 'get_components' to understand design system integration

2. Project Structure:
   - Create comprehensive folder structure
   - Set up proper module organization
   - Configure build and development tools
   - Establish coding standards and conventions

3. Feature Implementation:
   ${features.split(',').map((feature: string) => 
     `- ${feature.trim()}: Configure and integrate ${feature.trim()} with best practices`
   ).join('\n   ')}

4. Development Environment:
   - Configure development server and hot reloading
   - Set up debugging and profiling tools
   - Configure environment variables and secrets
   - Establish development workflows

5. Quality Assurance:
   - Set up comprehensive testing framework
   - Configure code quality tools (ESLint, Prettier)
   - Implement pre-commit hooks
   - Set up continuous integration

6. Architecture Setup for ${architecture}:
   ${getArchitectureSetup(architecture, projectType)}

7. Documentation and Tooling:
   - Create comprehensive README with setup instructions
   - Set up API documentation tools
   - Configure component documentation
   - Establish contribution guidelines

8. Deployment and DevOps:
   - Configure build and deployment pipelines
   - Set up environment management
   - Configure monitoring and logging
   - Establish backup and recovery procedures

9. Security and Compliance:
   - Implement security best practices
   - Configure dependency scanning
   - Set up compliance monitoring
   - Establish security review processes

Please generate complete project initialization with all necessary configuration files, documentation, and setup instructions.`,
            },
          },
        ],
      };
    },
  },
};

/**
 * Helper functions for generating context-specific instructions
 */

function getPageTypeEnhancements(pageType: string): string {
  const enhancements = {
    dashboard: `
   - Implement real-time data updates and refresh mechanisms
   - Add customizable widget layouts and user preferences
   - Include data export and reporting functionality
   - Create interactive charts and visualizations
   - Add notification and alert systems`,
    
    profile: `
   - Implement user avatar upload and management
   - Add form validation with real-time feedback
   - Include privacy settings and data management
   - Create activity timeline and history
   - Add social features and connections`,
    
    settings: `
   - Create tabbed or sectioned settings organization
   - Implement preference persistence and sync
   - Add import/export functionality
   - Include theme and appearance customization
   - Create backup and restore features`,
    
    auth: `
   - Implement secure authentication flows
   - Add multi-factor authentication support
   - Include password strength validation
   - Create account recovery mechanisms
   - Add social login integrations`,
    
    admin: `
   - Implement role-based access control
   - Add user management and permissions
   - Include system monitoring and health checks
   - Create audit logs and activity tracking
   - Add bulk operations and data management`
  };
  
  return enhancements[pageType as keyof typeof enhancements] || 
         'Implement standard page features with proper state management and user experience patterns.';
}

function getComplianceSpecificChecks(complianceType: string): string {
  const checks = {
    norwegian: `
   - Verify Norwegian language support and localization
   - Check NSM security classification compliance
   - Validate data residency requirements
   - Ensure accessibility compliance with Norwegian standards
   - Review privacy and data protection measures`,
    
    gdpr: `
   - Validate consent management mechanisms
   - Check data minimization principles
   - Verify right to erasure implementation
   - Ensure data portability features
   - Review privacy by design principles`,
    
    accessibility: `
   - Validate WCAG 2.1 AA compliance
   - Check keyboard navigation support
   - Verify screen reader compatibility
   - Ensure color contrast requirements
   - Test with assistive technologies`,
    
    security: `
   - Check for common vulnerabilities (OWASP Top 10)
   - Validate input sanitization and validation
   - Review authentication and authorization
   - Check for sensitive data exposure
   - Verify secure communication protocols`
  };
  
  return checks[complianceType as keyof typeof checks] || 
         'Perform general compliance validation with industry best practices.';
}

function getAnalysisInstructions(analysisType: string, isSvelte: boolean): string {
  const instructions = {
    performance: isSvelte ? `
   - Analyze Svelte reactivity patterns and rune usage
   - Check for unnecessary reactive statements
   - Evaluate component lifecycle optimization
   - Review bundle size and tree-shaking effectiveness
   - Assess server-side rendering performance`
    : `
   - Analyze rendering performance and re-render patterns
   - Check for memory leaks and cleanup issues
   - Evaluate bundle size and code splitting
   - Review lazy loading and virtualization opportunities
   - Assess server-side rendering and hydration`,
   
    security: `
   - Check for XSS and injection vulnerabilities
   - Validate input sanitization and validation
   - Review authentication and session management
   - Assess data exposure and privacy risks
   - Check for insecure dependencies`,
   
    accessibility: `
   - Validate semantic HTML structure
   - Check ARIA labels and roles
   - Test keyboard navigation patterns
   - Verify color contrast and visual design
   - Assess screen reader compatibility`,
   
    maintainability: `
   - Evaluate code organization and structure
   - Check for code duplication and reusability
   - Review documentation and comments
   - Assess testing coverage and quality
   - Analyze dependency management`,
   
    all: `
   - Perform comprehensive analysis across all dimensions
   - Prioritize issues by impact and effort
   - Provide holistic improvement roadmap
   - Consider cross-cutting concerns and trade-offs
   - Generate actionable improvement plan`
  };
  
  return instructions[analysisType as keyof typeof instructions] || 
         'Perform general code analysis with focus on quality and best practices.';
}

function getArchitectureSetup(architecture: string, projectType: string): string {
  const setups = {
    monolith: `
   - Create single deployable application structure
   - Set up modular architecture within monolith
   - Configure shared services and utilities
   - Establish clear module boundaries
   - Plan for future microservices extraction`,
    
    microservices: `
   - Design service boundaries and communication patterns
   - Set up API gateway and service discovery
   - Configure inter-service communication
   - Establish data consistency patterns
   - Plan deployment and orchestration`,
    
    serverless: `
   - Design function-based architecture
   - Configure event-driven communication
   - Set up serverless deployment pipeline
   - Establish monitoring and observability
   - Plan for cold start optimization`
  };
  
  return setups[architecture as keyof typeof setups] || 
         'Set up standard application architecture with scalability considerations.';
}

export default practicalToolPrompts;
