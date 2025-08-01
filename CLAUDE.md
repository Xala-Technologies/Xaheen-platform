# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

This is the **Xaheen Platform** - a comprehensive transformation of create-better-t-stack into an AI-powered, enterprise-grade development platform. The project consists of:

- **Main CLI**: `apps/cli` - Modern CLI tool for scaffolding TypeScript projects
- **Documentation Website**: `apps/web` - Official website and documentation
- **Monorepo Structure**: Managed by Turborepo with Bun as package manager

## Build and Development Commands

### Monorepo Commands
```bash
# Install dependencies (use bun)
bun install

# Run development for all apps
bun dev

# Run development for CLI only
bun dev:cli

# Run development for website only  
bun dev:web

# Build all packages
bun build

# Build CLI only
bun build:cli

# Build website only
bun build:web

# Format code with Biome
bun format

# Run Biome checks
bun check

# Publish packages
bun publish-packages

# Deploy website
bun deploy:web
```

### CLI Development Commands
```bash
# From root directory
cd apps/cli

# Build the CLI
bun build

# Run in development mode with watch
bun dev

# Test the CLI locally
node dist/index.js

# Run type checking
bun check-types
```

### Website Development Commands
```bash
# From root directory  
cd apps/web

# Run development server with Turbopack
bun dev

# Build for production
bun build

# Deploy to Cloudflare Workers
bun deploy

# Generate analytics data
bun generate-analytics

# Generate schema
bun generate-schema
```

## High-Level Architecture

### Technology Stack

#### Monorepo Infrastructure
- **Turborepo** for monorepo management
- **Bun** as primary package manager (v1.2.16)
- **Biome** for linting and formatting
- **TypeScript 5.8.3** with strict mode
- **Changesets** for version management

#### CLI Package (`apps/cli`)
- **trpc-cli** for command-line interface
- **@clack/prompts** for interactive prompts  
- **Handlebars** for template processing
- **ts-morph** for TypeScript AST manipulation
- **Zod** for schema validation
- **PostHog** for analytics
- **Multiple template frameworks**: React, Next.js, Nuxt, Svelte, Solid, React Native

#### Website Package (`apps/web`)
- **Next.js 15.3.5** with App Router
- **Fumadocs** for documentation
- **Cloudflare Workers** deployment with OpenNext
- **Tailwind CSS v4** with PostCSS
- **React 19** with React Compiler
- **Motion** for animations
- **Recharts** for analytics visualization

### Directory Structure

```
.
├── apps/
│   ├── cli/                    # CLI tool package
│   │   ├── src/               # Source code
│   │   │   ├── helpers/       # Project generation helpers
│   │   │   ├── prompts/       # Interactive prompts
│   │   │   ├── utils/         # Utility functions
│   │   │   └── validation.ts  # Input validation
│   │   ├── templates/         # Project templates
│   │   │   ├── addons/        # Optional addons
│   │   │   ├── api/           # API templates (tRPC, oRPC)
│   │   │   ├── auth/          # Authentication templates
│   │   │   ├── backend/       # Backend frameworks
│   │   │   ├── db/            # Database templates
│   │   │   ├── deploy/        # Deployment configs
│   │   │   ├── examples/      # Example apps
│   │   │   └── frontend/      # Frontend frameworks
│   │   └── tsdown.config.ts   # Build configuration
│   │
│   └── web/                   # Documentation website
│       ├── content/           # MDX documentation
│       ├── src/
│       │   ├── app/           # Next.js App Router
│       │   ├── components/    # React components
│       │   └── lib/           # Utilities
│       └── open-next.config.ts # Cloudflare deployment
│
├── documentation/             # Project documentation
│   ├── brainstorming/        # Initial ideas & research
│   ├── code-snippets/        # Implementation examples
│   ├── planned/              # Future implementation plans
│   ├── in-progress/          # Current work items
│   ├── completed/            # Finished deliverables
│   ├── report/               # Status reports
│   └── xala-scaffold/        # Foundation AI scaffold system
│
├── turbo.json                # Turborepo configuration
├── biome.json               # Biome linting/formatting
└── package.json             # Root package configuration
```

### CLI Architecture

The CLI uses a **command-based architecture** with tRPC for type-safe command handling:

- **Commands**: `init` (default), `add`, `sponsors`, `docs`, `builder`
- **Template System**: Handlebars templates with `.hbs` extension
- **Project Types**: Supports multiple frameworks, databases, ORMs, and deployment targets
- **Addon System**: Modular addons like PWA, Tauri, Starlight, Biome, etc.

### Template Processing

Templates are processed using:
1. **Handlebars** for dynamic content generation
2. **ts-morph** for TypeScript AST manipulation
3. **Conditional rendering** based on project configuration
4. **File name templating** with `{{variable}}` syntax

## Development Guidelines

### Code Style with Biome

- **Indentation**: Tabs (not spaces)
- **Quotes**: Double quotes for strings
- **Imports**: Auto-organized with Biome
- **Line length**: No hard limit, but keep reasonable
- **Unused code**: Errors on unused imports/variables

### CLI Development Best Practices

- Use Zod schemas for all input validation
- Keep prompts in `src/prompts/` directory
- Template files use `.hbs` extension
- Use `consola` for consistent logging
- Handle errors gracefully with user-friendly messages
- Track analytics with PostHog for usage insights

### Website Development Best Practices

- Use Fumadocs for documentation pages
- Keep content in MDX format in `content/docs/`
- Use server components by default
- Implement proper loading states
- Optimize for Cloudflare Workers deployment

### Template Guidelines

- Support multiple package managers (npm, pnpm, bun)
- Include proper TypeScript configurations
- Provide sensible defaults with override options
- Ensure templates work across different environments
- Include comprehensive examples when applicable

## Documentation Guidelines

### Documentation Structure

The `documentation/` folder follows a **lifecycle-based organization**:

1. **`brainstorming/`** - Initial research and ideas
2. **`code-snippets/`** - Implementation examples and patterns
3. **`planned/`** - Future implementation plans and strategies
4. **`in-progress/`** - Active work items and tasks
5. **`completed/`** - Finished deliverables and implementations
6. **`report/`** - Status reports and progress tracking
7. **`xala-scaffold/`** - Foundation AI-powered scaffold system

### Documentation Rules

#### When Creating Documentation
- **Location**: Place new documentation in the appropriate lifecycle folder
- **Format**: Use Markdown (`.md`) for documentation, TypeScript (`.ts`) for code examples
- **Naming**: Use kebab-case for file names (e.g., `xaheen-strategy.md`)
- **Structure**: Include clear headers, code blocks with language tags, and timestamps
- **Links**: Use relative paths within the documentation folder

#### When Updating Documentation
- **Movement**: Move documents through lifecycle stages as work progresses
- **Tracking**: Update `report/` folder with status changes
- **Timestamps**: Add "Last Updated" timestamps to significant changes
- **Preservation**: Don't delete old documentation - move to `completed/` with notes

#### Documentation Standards
- **Headers**: Use consistent markdown hierarchy (# ## ### etc.)
- **Code Blocks**: Always specify the language (```typescript, ```bash, etc.)
- **Examples**: Include practical, runnable examples where possible
- **Context**: Provide background and rationale for decisions
- **Cross-references**: Link to related documentation and external resources

### When NOT to Create Documentation
- Don't create documentation unless explicitly requested by the user
- Don't proactively generate README files or guides
- Don't duplicate existing documentation
- Focus on implementation unless documentation is specifically requested

## Critical Reminders

### Testing Changes
1. **Build the project**: Run `bun build` in the appropriate directory
2. **Check types**: Run `bun check-types` for TypeScript verification
3. **Format code**: Run `bun format` to ensure consistent style
4. **Test locally**: For CLI, use `node dist/index.js` after building

### Version Management
- Use changesets for version bumping
- Follow semantic versioning
- Update CHANGELOG.md with changes
- Test packages before publishing

### Common Pitfalls to Avoid
- Don't mix package managers - use Bun consistently
- Don't edit generated files in `dist/` or `.next/`
- Don't commit without running format checks
- Don't ignore TypeScript errors
- Don't modify templates without testing the output

## AI-Specific Instructions

When implementing features or making changes:

1. **Understand the Context**: Review existing code patterns in the relevant package
2. **Follow Template Patterns**: Use existing templates as reference for new ones
3. **Maintain Type Safety**: Ensure all inputs/outputs are properly typed with Zod
4. **Test Template Generation**: Verify templates produce valid, working code
5. **Document Complex Logic**: Add comments for non-obvious template processing
6. **Consider Multi-Framework**: Ensure changes work across all supported frameworks

### For Template Development
- Test with all supported package managers
- Verify conditional blocks render correctly
- Ensure proper escaping in Handlebars templates
- Validate generated TypeScript compiles successfully

### For CLI Commands
- Use consistent prompt patterns from `@clack/prompts`
- Implement proper error handling and user feedback
- Add appropriate analytics tracking
- Update command documentation in website

## Project-Specific Context

### Xaheen Platform Goals
- Transform create-better-t-stack into enterprise-grade platform
- Integrate AI-powered scaffolding capabilities
- Support Norwegian compliance requirements
- Implement multi-mode CLI (legacy, token, xala, xaheen)
- Maintain backward compatibility while adding advanced features

### Current Status
- Foundation analysis complete
- Leveraging existing xala-scaffold system
- Planning 10-week implementation timeline
- Focus on CLI enhancement and AI integration

### Key Decisions
- Use xala-scaffold as foundation (50% time reduction)
- Implement multi-mode CLI for flexibility
- Prioritize enterprise features and compliance
- Maintain create-better-t-stack compatibility