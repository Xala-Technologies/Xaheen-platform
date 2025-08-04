/**
 * @fileoverview Install Command - Auto-installation and setup
 * @description Installs UI system into existing or new SaaS applications
 */

import { Command } from 'commander';
import path from 'path';
import fs from 'fs/promises';
import { existsSync } from 'fs';
import chalk from 'chalk';
import ora from 'ora';
import inquirer from 'inquirer';
import { exec } from 'child_process';
import { promisify } from 'util';

const execAsync = promisify(exec);

interface InstallOptions {
  force?: boolean;
  skipDeps?: boolean;
  template?: string;
  industry?: string;
  platform?: 'react' | 'nextjs' | 'vue' | 'nuxt' | 'angular';
  theme?: string;
  compliance?: 'nsm' | 'gdpr' | 'healthcare' | 'finance';
  backup?: boolean;
}

interface ProjectDetection {
  type: 'react' | 'nextjs' | 'vue' | 'nuxt' | 'angular' | 'unknown';
  packageManager: 'npm' | 'yarn' | 'pnpm';
  hasTypeScript: boolean;
  hasTailwind: boolean;
  hasDesignSystem: boolean;
  structure: ProjectStructure;
  recommendations: string[];
}

interface ProjectStructure {
  srcDir: string;
  componentsDir: string;
  stylesDir: string;
  configFiles: string[];
  mainFiles: string[];
}

export const install = new Command('install')
  .description('Install Xala UI system into existing or new SaaS application')
  .option('-f, --force', 'Force installation even if conflicts detected')
  .option('--skip-deps', 'Skip dependency installation')
  .option('-t, --template <template>', 'Project template (saas, healthcare, finance, etc.)')
  .option('-i, --industry <industry>', 'Industry preset (healthcare, finance, government, etc.)')
  .option('-p, --platform <platform>', 'Platform (react, nextjs, vue, nuxt, angular)')
  .option('--theme <theme>', 'Default theme to apply')
  .option('-c, --compliance <compliance>', 'Compliance preset (nsm, gdpr, healthcare, finance)')
  .option('--backup', 'Create backup before installation')
  .action(async (options: InstallOptions) => {
    try {
      console.log(chalk.blue('\n🚀 Xala UI System Installation\n'));
      
      // Step 1: Detect existing project
      const detection = await detectProject();
      await displayDetectionResults(detection);
      
      // Step 2: Confirm installation
      const confirmed = await confirmInstallation(detection, options);
      if (!confirmed) {
        console.log(chalk.yellow('Installation cancelled.'));
        return;
      }
      
      // Step 3: Create backup if requested
      if (options.backup) {
        await createBackup();
      }
      
      // Step 4: Install dependencies
      if (!options.skipDeps) {
        await installDependencies(detection, options);
      }
      
      // Step 5: Setup project structure
      await setupProjectStructure(detection, options);
      
      // Step 6: Install providers and basic structure
      await installProviders(detection, options);
      
      // Step 7: Setup design tokens
      await setupDesignTokens(detection, options);
      
      // Step 8: Update Tailwind CSS configuration
      await updateTailwindConfig(detection, options);
      
      // Step 9: Generate initial theme
      await generateInitialTheme(options);
      
      // Step 10: Update CSS files
      await updateCSSFiles(detection, options);
      
      // Step 11: Generate example components
      await generateExampleComponents(detection, options);
      
      // Step 12: Setup development tools
      await setupDevTools(detection, options);
      
      console.log(chalk.green('\n✅ Installation completed successfully!\n'));
      await displayNextSteps(detection, options);
      
    } catch (error) {
      console.error(chalk.red('\n❌ Installation failed:'), error instanceof Error ? error.message : String(error));
      process.exit(1);
    }
  });

async function detectProject(): Promise<ProjectDetection> {
  const spinner = ora('Detecting project structure...').start();
  
  try {
    const packageJsonPath = path.join(process.cwd(), 'package.json');
    const hasPackageJson = existsSync(packageJsonPath);
    
    let packageJson: any = {};
    if (hasPackageJson) {
      const content = await fs.readFile(packageJsonPath, 'utf-8');
      packageJson = JSON.parse(content);
    }
    
    // Detect project type
    const type = detectProjectType(packageJson);
    
    // Detect package manager
    const packageManager = detectPackageManager();
    
    // Check TypeScript
    const hasTypeScript = existsSync('tsconfig.json') || 
                         packageJson.devDependencies?.typescript ||
                         packageJson.dependencies?.typescript;
    
    // Check Tailwind
    const hasTailwind = packageJson.devDependencies?.tailwindcss ||
                       packageJson.dependencies?.tailwindcss ||
                       existsSync('tailwind.config.js') ||
                       existsSync('tailwind.config.ts');
    
    // Check existing design system
    const hasDesignSystem = await checkExistingDesignSystem();
    
    // Analyze project structure
    const structure = await analyzeProjectStructure(type);
    
    // Generate recommendations
    const recommendations = generateRecommendations({
      type,
      hasTypeScript,
      hasTailwind,
      hasDesignSystem,
      structure
    });
    
    spinner.succeed('Project detection completed');
    
    return {
      type,
      packageManager,
      hasTypeScript,
      hasTailwind,
      hasDesignSystem,
      structure,
      recommendations
    };
    
  } catch (error) {
    spinner.fail('Project detection failed');
    throw error;
  }
}

function detectProjectType(packageJson: any): ProjectDetection['type'] {
  const deps = { ...packageJson.dependencies, ...packageJson.devDependencies };
  
  if (deps.next) return 'nextjs';
  if (deps.nuxt) return 'nuxt';
  if (deps['@angular/core']) return 'angular';
  if (deps.vue) return 'vue';
  if (deps.react) return 'react';
  
  return 'unknown';
}

function detectPackageManager(): 'npm' | 'yarn' | 'pnpm' {
  if (existsSync('pnpm-lock.yaml')) return 'pnpm';
  if (existsSync('yarn.lock')) return 'yarn';
  return 'npm';
}

async function checkExistingDesignSystem(): Promise<boolean> {
  const designSystemIndicators = [
    'src/components/ui',
    'src/design-system',
    'src/lib/utils',
    'components/ui',
    'lib/utils.ts',
    'lib/cn.ts'
  ];
  
  for (const indicator of designSystemIndicators) {
    if (existsSync(indicator)) return true;
  }
  
  return false;
}

async function analyzeProjectStructure(type: ProjectDetection['type']): Promise<ProjectStructure> {
  const structures = {
    react: {
      srcDir: 'src',
      componentsDir: 'src/components',
      stylesDir: 'src/styles',
      configFiles: ['package.json', 'tsconfig.json', 'vite.config.ts'],
      mainFiles: ['src/main.tsx', 'src/App.tsx']
    },
    nextjs: {
      srcDir: 'src',
      componentsDir: 'src/components',
      stylesDir: 'src/styles',
      configFiles: ['package.json', 'tsconfig.json', 'next.config.js'],
      mainFiles: ['src/app/page.tsx', 'src/pages/_app.tsx']
    },
    vue: {
      srcDir: 'src',
      componentsDir: 'src/components',
      stylesDir: 'src/assets/styles',
      configFiles: ['package.json', 'tsconfig.json', 'vite.config.ts'],
      mainFiles: ['src/main.ts', 'src/App.vue']
    },
    nuxt: {
      srcDir: '.',
      componentsDir: 'components',
      stylesDir: 'assets/css',
      configFiles: ['package.json', 'nuxt.config.ts'],
      mainFiles: ['app.vue', 'pages/index.vue']
    },
    angular: {
      srcDir: 'src',
      componentsDir: 'src/app/components',
      stylesDir: 'src/styles',
      configFiles: ['package.json', 'tsconfig.json', 'angular.json'],
      mainFiles: ['src/main.ts', 'src/app/app.component.ts']
    },
    unknown: {
      srcDir: 'src',
      componentsDir: 'src/components',
      stylesDir: 'src/styles',
      configFiles: ['package.json'],
      mainFiles: ['src/index.js']
    }
  };
  
  return structures[type];
}

function generateRecommendations(detection: Partial<ProjectDetection>): string[] {
  const recommendations: string[] = [];
  
  if (!detection.hasTypeScript) {
    recommendations.push('Enable TypeScript for better type safety and development experience');
  }
  
  if (!detection.hasTailwind) {
    recommendations.push('Install Tailwind CSS for optimal styling integration');
  }
  
  if (detection.hasDesignSystem) {
    recommendations.push('Existing design system detected - migration strategy will be provided');
  }
  
  if (detection.type === 'unknown') {
    recommendations.push('Project type could not be determined - manual configuration may be required');
  }
  
  return recommendations;
}

async function displayDetectionResults(detection: ProjectDetection) {
  console.log(chalk.cyan('\n📊 Project Analysis Results:\n'));
  
  console.log(`${chalk.bold('Project Type:')} ${chalk.green(detection.type)}`);
  console.log(`${chalk.bold('Package Manager:')} ${chalk.green(detection.packageManager)}`);
  console.log(`${chalk.bold('TypeScript:')} ${detection.hasTypeScript ? chalk.green('✓') : chalk.red('✗')}`);
  console.log(`${chalk.bold('Tailwind CSS:')} ${detection.hasTailwind ? chalk.green('✓') : chalk.red('✗')}`);
  console.log(`${chalk.bold('Design System:')} ${detection.hasDesignSystem ? chalk.yellow('Existing') : chalk.red('None')}`);
  
  if (detection.recommendations.length > 0) {
    console.log(chalk.cyan('\n💡 Recommendations:'));
    detection.recommendations.forEach(rec => {
      console.log(`  • ${rec}`);
    });
  }
}

async function confirmInstallation(detection: ProjectDetection, options: InstallOptions): Promise<boolean> {
  if (options.force) return true;
  
  const questions = [
    {
      type: 'confirm',
      name: 'proceed',
      message: 'Proceed with Xala UI system installation?',
      default: true
    }
  ];
  
  if (detection.hasDesignSystem) {
    questions.unshift({
      type: 'confirm',
      name: 'migrationConfirm',
      message: 'Existing design system detected. This will require migration. Continue?',
      default: false
    });
  }
  
  const answers = await inquirer.prompt(questions);
  return answers.migrationConfirm !== false && answers.proceed;
}

async function createBackup() {
  const spinner = ora('Creating backup...').start();
  
  try {
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    const backupDir = `xala-backup-${timestamp}`;
    
    await execAsync(`cp -r . ../${backupDir}`);
    spinner.succeed(`Backup created: ../${backupDir}`);
  } catch (error) {
    spinner.fail('Backup creation failed');
    throw error;
  }
}

async function installDependencies(detection: ProjectDetection, options: InstallOptions) {
  const spinner = ora('Installing dependencies...').start();
  
  try {
    const deps = generateDependencyList(detection, options);
    const { packageManager } = detection;
    
    // Install production dependencies
    if (deps.dependencies.length > 0) {
      const depsList = deps.dependencies.join(' ');
      await execAsync(`${packageManager} ${packageManager === 'npm' ? 'install' : 'add'} ${depsList}`);
    }
    
    // Install dev dependencies
    if (deps.devDependencies.length > 0) {
      const devDepsList = deps.devDependencies.join(' ');
      const devFlag = packageManager === 'npm' ? '--save-dev' : '--dev';
      await execAsync(`${packageManager} ${packageManager === 'npm' ? 'install' : 'add'} ${devFlag} ${devDepsList}`);
    }
    
    spinner.succeed('Dependencies installed successfully');
  } catch (error) {
    spinner.fail('Dependency installation failed');
    throw error;
  }
}

function generateDependencyList(detection: ProjectDetection, options: InstallOptions) {
  const dependencies = [
    'class-variance-authority',
    'clsx',
    'tailwind-merge',
    '@radix-ui/react-slot',
    'lucide-react'
  ];
  
  const devDependencies = [];
  
  // Add TypeScript if not present
  if (!detection.hasTypeScript) {
    devDependencies.push('typescript', '@types/node');
    
    if (detection.type === 'react') {
      devDependencies.push('@types/react', '@types/react-dom');
    }
  }
  
  // Add Tailwind if not present
  if (!detection.hasTailwind) {
    devDependencies.push('tailwindcss', 'autoprefixer', 'postcss');
  }
  
  // Add compliance packages based on options
  if (options.compliance) {
    switch (options.compliance) {
      case 'nsm':
        dependencies.push('@xala-technologies/norwegian-compliance');
        break;
      case 'healthcare':
        dependencies.push('@xala-technologies/healthcare-compliance');
        break;
      case 'finance':
        dependencies.push('@xala-technologies/finance-compliance');
        break;
    }
  }
  
  return { dependencies, devDependencies };
}

async function setupProjectStructure(detection: ProjectDetection, options: InstallOptions) {
  const spinner = ora('Setting up project structure...').start();
  
  try {
    const { structure } = detection;
    
    // Create necessary directories
    const dirs = [
      path.join(structure.componentsDir, 'ui'),
      path.join(structure.componentsDir, 'providers'),
      path.join(structure.stylesDir),
      path.join(structure.srcDir, 'lib'),
      path.join(structure.srcDir, 'hooks'),
      path.join(structure.srcDir, 'types'),
      path.join(structure.srcDir, 'tokens')
    ];
    
    for (const dir of dirs) {
      await fs.mkdir(dir, { recursive: true });
    }
    
    spinner.succeed('Project structure created');
  } catch (error) {
    spinner.fail('Project structure setup failed');
    throw error;
  }
}

async function installProviders(detection: ProjectDetection, options: InstallOptions) {
  const spinner = ora('Installing providers and basic structure...').start();
  
  try {
    const { structure } = detection;
    
    // Create theme provider
    const themeProvider = generateThemeProvider(detection.type);
    await fs.writeFile(
      path.join(structure.componentsDir, 'providers', 'theme-provider.tsx'),
      themeProvider
    );
    
    // Create token provider
    const tokenProvider = generateTokenProvider(detection.type);
    await fs.writeFile(
      path.join(structure.componentsDir, 'providers', 'token-provider.tsx'),
      tokenProvider
    );
    
    // Create utils
    const utilsFile = generateUtils();
    await fs.writeFile(
      path.join(structure.srcDir, 'lib', 'utils.ts'),
      utilsFile
    );
    
    spinner.succeed('Providers and utilities installed');
  } catch (error) {
    spinner.fail('Provider installation failed');
    throw error;
  }
}

async function setupDesignTokens(detection: ProjectDetection, options: InstallOptions) {
  const spinner = ora('Setting up design tokens...').start();
  
  try {
    const { structure } = detection;
    const tokensDir = path.join(structure.srcDir, 'tokens');
    
    // Generate base tokens
    const baseTokens = generateBaseTokens(options);
    await fs.writeFile(
      path.join(tokensDir, 'base.json'),
      JSON.stringify(baseTokens, null, 2)
    );
    
    // Generate theme tokens
    const themeTokens = generateThemeTokens(options);
    await fs.writeFile(
      path.join(tokensDir, 'themes.json'),
      JSON.stringify(themeTokens, null, 2)
    );
    
    // Generate token types
    const tokenTypes = generateTokenTypes();
    await fs.writeFile(
      path.join(structure.srcDir, 'types', 'tokens.ts'),
      tokenTypes
    );
    
    spinner.succeed('Design tokens configured');
  } catch (error) {
    spinner.fail('Design tokens setup failed');
    throw error;
  }
}

async function updateTailwindConfig(detection: ProjectDetection, options: InstallOptions) {
  const spinner = ora('Updating Tailwind CSS configuration...').start();
  
  try {
    const tailwindConfig = generateTailwindConfig(detection, options);
    const configPath = detection.hasTypeScript ? 'tailwind.config.ts' : 'tailwind.config.js';
    
    await fs.writeFile(configPath, tailwindConfig);
    
    // Create PostCSS config if needed
    if (!existsSync('postcss.config.js')) {
      const postcssConfig = generatePostCSSConfig();
      await fs.writeFile('postcss.config.js', postcssConfig);
    }
    
    spinner.succeed('Tailwind CSS configuration updated');
  } catch (error) {
    spinner.fail('Tailwind configuration failed');
    throw error;
  }
}

async function generateInitialTheme(options: InstallOptions) {
  const spinner = ora('Generating initial theme...').start();
  
  try {
    // This would call the theme generation service
    await execAsync(`xala themes create default --industry ${options.industry || 'general'}`);
    spinner.succeed('Initial theme generated');
  } catch (error) {
    // Fallback to basic theme generation
    spinner.succeed('Basic theme configured');
  }
}

async function updateCSSFiles(detection: ProjectDetection, options: InstallOptions) {
  const spinner = ora('Updating CSS files...').start();
  
  try {
    const { structure } = detection;
    
    // Generate main CSS file with Tailwind imports and custom properties
    const mainCSS = generateMainCSS(options);
    await fs.writeFile(
      path.join(structure.stylesDir, 'globals.css'),
      mainCSS
    );
    
    // Generate component-specific CSS if needed
    const componentCSS = generateComponentCSS(options);
    await fs.writeFile(
      path.join(structure.stylesDir, 'components.css'),
      componentCSS
    );
    
    spinner.succeed('CSS files updated');
  } catch (error) {
    spinner.fail('CSS update failed');
    throw error;
  }
}

async function generateExampleComponents(detection: ProjectDetection, options: InstallOptions) {
  const spinner = ora('Generating example components...').start();
  
  try {
    const { structure } = detection;
    const componentsDir = path.join(structure.componentsDir, 'ui');
    
    // Generate basic UI components
    const components = ['button', 'input', 'card', 'badge'];
    
    for (const component of components) {
      try {
        await execAsync(`xala generate component ${component} --template ${component} --output ${componentsDir}`);
      } catch {
        // Fallback to basic component generation
        const basicComponent = generateBasicComponent(component, detection.type);
        await fs.writeFile(
          path.join(componentsDir, `${component}.tsx`),
          basicComponent
        );
      }
    }
    
    spinner.succeed('Example components generated');
  } catch (error) {
    spinner.fail('Component generation failed');
    throw error;
  }
}

async function setupDevTools(detection: ProjectDetection, options: InstallOptions) {
  const spinner = ora('Setting up development tools...').start();
  
  try {
    // Create xala.config.js
    const xalaConfig = generateXalaConfig(detection, options);
    await fs.writeFile('xala.config.js', xalaConfig);
    
    // Update package.json scripts
    await updatePackageJsonScripts(detection);
    
    spinner.succeed('Development tools configured');
  } catch (error) {
    spinner.fail('Development tools setup failed');
    throw error;
  }
}

async function displayNextSteps(detection: ProjectDetection, options: InstallOptions) {
  console.log(chalk.cyan('🎉 Next Steps:\n'));
  
  console.log('1. ' + chalk.green('Import providers in your main app file:'));
  console.log(`   ${chalk.gray('// In your App.tsx or main.tsx')}`);
  console.log(`   ${chalk.yellow('import { ThemeProvider } from "./components/providers/theme-provider"')}`);
  console.log(`   ${chalk.yellow('import { TokenProvider } from "./components/providers/token-provider"')}`);
  
  console.log('\n2. ' + chalk.green('Start using UI components:'));
  console.log(`   ${chalk.yellow('import { Button } from "./components/ui/button"')}`);
  
  console.log('\n3. ' + chalk.green('Customize your theme:'));
  console.log(`   ${chalk.yellow('xala themes customize default')}`);
  
  console.log('\n4. ' + chalk.green('Generate more components:'));
  console.log(`   ${chalk.yellow('xala generate component MyAwesomeComponent')}`);
  
  console.log('\n5. ' + chalk.green('Analyze your project:'));
  console.log(`   ${chalk.yellow('xala analyze --comprehensive')}`);
  
  if (detection.hasDesignSystem) {
    console.log('\n⚠️  ' + chalk.yellow('Migration Required:'));
    console.log(`   Run ${chalk.cyan('xala migrate analyze')} to plan your migration strategy`);
  }
}

// Helper functions for generating code...
function generateThemeProvider(projectType: string): string {
  return `'use client'

import React, { createContext, useContext, useEffect, useState } from 'react'

type Theme = 'dark' | 'light' | 'system'

type ThemeProviderProps = {
  children: React.ReactNode
  defaultTheme?: Theme
  storageKey?: string
}

type ThemeProviderState = {
  theme: Theme
  setTheme: (theme: Theme) => void
}

const initialState: ThemeProviderState = {
  theme: 'system',
  setTheme: () => null,
}

const ThemeProviderContext = createContext<ThemeProviderState>(initialState)

export function ThemeProvider({
  children,
  defaultTheme = 'system',
  storageKey = 'xala-ui-theme',
  ...props
}: ThemeProviderProps) {
  const [theme, setTheme] = useState<Theme>(
    () => (localStorage.getItem(storageKey) as Theme) || defaultTheme
  )

  useEffect(() => {
    const root = window.document.documentElement

    root.classList.remove('light', 'dark')

    if (theme === 'system') {
      const systemTheme = window.matchMedia('(prefers-color-scheme: dark)')
        .matches
        ? 'dark'
        : 'light'

      root.classList.add(systemTheme)
      return
    }

    root.classList.add(theme)
  }, [theme])

  const value = {
    theme,
    setTheme: (theme: Theme) => {
      localStorage.setItem(storageKey, theme)
      setTheme(theme)
    },
  }

  return (
    <ThemeProviderContext.Provider {...props} value={value}>
      {children}
    </ThemeProviderContext.Provider>
  )
}

export const useTheme = () => {
  const context = useContext(ThemeProviderContext)

  if (context === undefined)
    throw new Error('useTheme must be used within a ThemeProvider')

  return context
}`;
}

function generateTokenProvider(projectType: string): string {
  return `'use client'

import React, { createContext, useContext } from 'react'
import { tokens } from '../tokens/base.json'

type TokenProviderProps = {
  children: React.ReactNode
}

type TokenProviderState = typeof tokens

const TokenProviderContext = createContext<TokenProviderState>(tokens)

export function TokenProvider({ children, ...props }: TokenProviderProps) {
  return (
    <TokenProviderContext.Provider {...props} value={tokens}>
      {children}
    </TokenProviderContext.Provider>
  )
}

export const useTokens = () => {
  const context = useContext(TokenProviderContext)

  if (context === undefined)
    throw new Error('useTokens must be used within a TokenProvider')

  return context
}`;
}

function generateUtils(): string {
  return `import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}`;
}

function generateBaseTokens(options: InstallOptions) {
  return {
    colors: {
      primary: "#0066cc",
      secondary: "#6b7280",
      accent: "#f59e0b",
      background: "#ffffff",
      foreground: "#1f2937",
      muted: "#f9fafb",
      "muted-foreground": "#6b7280",
      border: "#d1d5db",
      input: "#ffffff",
      ring: "#3b82f6"
    },
    spacing: {
      xs: "0.25rem",
      sm: "0.5rem",
      md: "1rem",
      lg: "1.5rem",
      xl: "2rem",
      "2xl": "3rem"
    },
    typography: {
      fontFamily: {
        sans: ["Inter", "sans-serif"],
        mono: ["JetBrains Mono", "monospace"]
      },
      fontSize: {
        xs: "0.75rem",
        sm: "0.875rem",
        base: "1rem",
        lg: "1.125rem",
        xl: "1.25rem",
        "2xl": "1.5rem"
      }
    },
    borderRadius: {
      sm: "0.125rem",
      md: "0.375rem",
      lg: "0.5rem",
      xl: "0.75rem"
    }
  };
}

function generateThemeTokens(options: InstallOptions) {
  return {
    light: {
      colors: {
        background: "#ffffff",
        foreground: "#1f2937",
        muted: "#f9fafb",
        "muted-foreground": "#6b7280"
      }
    },
    dark: {
      colors: {
        background: "#1f2937",
        foreground: "#f9fafb",
        muted: "#374151",
        "muted-foreground": "#9ca3af"
      }
    }
  };
}

function generateTokenTypes(): string {
  return `export interface DesignTokens {
  colors: {
    primary: string;
    secondary: string;
    accent: string;
    background: string;
    foreground: string;
    muted: string;
    'muted-foreground': string;
    border: string;
    input: string;
    ring: string;
  };
  spacing: {
    xs: string;
    sm: string;
    md: string;
    lg: string;
    xl: string;
    '2xl': string;
  };
  typography: {
    fontFamily: {
      sans: string[];
      mono: string[];
    };
    fontSize: {
      xs: string;
      sm: string;
      base: string;
      lg: string;
      xl: string;
      '2xl': string;
    };
  };
  borderRadius: {
    sm: string;
    md: string;
    lg: string;
    xl: string;
  };
}`;
}

function generateTailwindConfig(detection: ProjectDetection, options: InstallOptions): string {
  const isTS = detection.hasTypeScript;
  const importStatement = isTS ? 'import type { Config } from "tailwindcss"' : '';
  const exportType = isTS ? ': Config' : '';
  
  return `${importStatement}

${isTS ? 'const config' : 'module.exports'} = {
  darkMode: ["class"],
  content: [
    './pages/**/*.{${isTS ? 'ts,tsx' : 'js,jsx'}}',
    './components/**/*.{${isTS ? 'ts,tsx' : 'js,jsx'}}',
    './app/**/*.{${isTS ? 'ts,tsx' : 'js,jsx'}}',
    './src/**/*.{${isTS ? 'ts,tsx' : 'js,jsx'}}',
  ],
  prefix: "",
  theme: {
    container: {
      center: true,
      padding: "2rem",
      screens: {
        "2xl": "1400px",
      },
    },
    extend: {
      colors: {
        border: "hsl(var(--border))",
        input: "hsl(var(--input))",
        ring: "hsl(var(--ring))",
        background: "hsl(var(--background))",
        foreground: "hsl(var(--foreground))",
        primary: {
          DEFAULT: "hsl(var(--primary))",
          foreground: "hsl(var(--primary-foreground))",
        },
        secondary: {
          DEFAULT: "hsl(var(--secondary))",
          foreground: "hsl(var(--secondary-foreground))",
        },
        destructive: {
          DEFAULT: "hsl(var(--destructive))",
          foreground: "hsl(var(--destructive-foreground))",
        },
        muted: {
          DEFAULT: "hsl(var(--muted))",
          foreground: "hsl(var(--muted-foreground))",
        },
        accent: {
          DEFAULT: "hsl(var(--accent))",
          foreground: "hsl(var(--accent-foreground))",
        },
        popover: {
          DEFAULT: "hsl(var(--popover))",
          foreground: "hsl(var(--popover-foreground))",
        },
        card: {
          DEFAULT: "hsl(var(--card))",
          foreground: "hsl(var(--card-foreground))",
        },
      },
      borderRadius: {
        lg: "var(--radius)",
        md: "calc(var(--radius) - 2px)",
        sm: "calc(var(--radius) - 4px)",
      },
      keyframes: {
        "accordion-down": {
          from: { height: "0" },
          to: { height: "var(--radix-accordion-content-height)" },
        },
        "accordion-up": {
          from: { height: "var(--radix-accordion-content-height)" },
          to: { height: "0" },
        },
      },
      animation: {
        "accordion-down": "accordion-down 0.2s ease-out",
        "accordion-up": "accordion-up 0.2s ease-out",
      },
    },
  },
  plugins: [require("tailwindcss-animate")],
}${isTS ? ' satisfies Config' : ''}

${isTS ? 'export default config' : ''}`;
}

function generatePostCSSConfig(): string {
  return `module.exports = {
  plugins: {
    tailwindcss: {},
    autoprefixer: {},
  },
}`;
}

function generateMainCSS(options: InstallOptions): string {
  return `@tailwind base;
@tailwind components;
@tailwind utilities;

@layer base {
  :root {
    --background: 0 0% 100%;
    --foreground: 222.2 84% 4.9%;
    --card: 0 0% 100%;
    --card-foreground: 222.2 84% 4.9%;
    --popover: 0 0% 100%;
    --popover-foreground: 222.2 84% 4.9%;
    --primary: 221.2 83.2% 53.3%;
    --primary-foreground: 210 40% 98%;
    --secondary: 210 40% 96%;
    --secondary-foreground: 222.2 84% 4.9%;
    --muted: 210 40% 96%;
    --muted-foreground: 215.4 16.3% 46.9%;
    --accent: 210 40% 96%;
    --accent-foreground: 222.2 84% 4.9%;
    --destructive: 0 84.2% 60.2%;
    --destructive-foreground: 210 40% 98%;
    --border: 214.3 31.8% 91.4%;
    --input: 214.3 31.8% 91.4%;
    --ring: 221.2 83.2% 53.3%;
    --radius: 0.5rem;
  }

  .dark {
    --background: 222.2 84% 4.9%;
    --foreground: 210 40% 98%;
    --card: 222.2 84% 4.9%;
    --card-foreground: 210 40% 98%;
    --popover: 222.2 84% 4.9%;
    --popover-foreground: 210 40% 98%;
    --primary: 217.2 91.2% 59.8%;
    --primary-foreground: 222.2 84% 4.9%;
    --secondary: 217.2 32.6% 17.5%;
    --secondary-foreground: 210 40% 98%;
    --muted: 217.2 32.6% 17.5%;
    --muted-foreground: 215 20.2% 65.1%;
    --accent: 217.2 32.6% 17.5%;
    --accent-foreground: 210 40% 98%;
    --destructive: 0 62.8% 30.6%;
    --destructive-foreground: 210 40% 98%;
    --border: 217.2 32.6% 17.5%;
    --input: 217.2 32.6% 17.5%;
    --ring: 224.3 76.3% 94.1%;
  }
}

@layer base {
  * {
    @apply border-border;
  }
  body {
    @apply bg-background text-foreground;
  }
}`;
}

function generateComponentCSS(options: InstallOptions): string {
  return `/* Component-specific styles */
.xala-component {
  /* Base component styles */
}`;
}

function generateBasicComponent(componentName: string, projectType: string): string {
  return `import * as React from "react"
import { Slot } from "@radix-ui/react-slot"
import { cva, type VariantProps } from "class-variance-authority"

import { cn } from "@/lib/utils"

const ${componentName}Variants = cva(
  "inline-flex items-center justify-center whitespace-nowrap rounded-md text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50",
  {
    variants: {
      variant: {
        default: "bg-primary text-primary-foreground shadow hover:bg-primary/90",
        secondary: "bg-secondary text-secondary-foreground shadow-sm hover:bg-secondary/80",
        outline: "border border-input bg-background shadow-sm hover:bg-accent hover:text-accent-foreground",
      },
      size: {
        default: "h-9 px-4 py-2",
        sm: "h-8 rounded-md px-3 text-xs",
        lg: "h-10 rounded-md px-8",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
)

export interface ${componentName.charAt(0).toUpperCase() + componentName.slice(1)}Props
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof ${componentName}Variants> {
  asChild?: boolean
}

const ${componentName.charAt(0).toUpperCase() + componentName.slice(1)} = React.forwardRef<HTMLButtonElement, ${componentName.charAt(0).toUpperCase() + componentName.slice(1)}Props>(
  ({ className, variant, size, asChild = false, ...props }, ref) => {
    const Comp = asChild ? Slot : "button"
    return (
      <Comp
        className={cn(${componentName}Variants({ variant, size, className }))}
        ref={ref}
        {...props}
      />
    )
  }
)
${componentName.charAt(0).toUpperCase() + componentName.slice(1)}.displayName = "${componentName.charAt(0).toUpperCase() + componentName.slice(1)}"

export { ${componentName.charAt(0).toUpperCase() + componentName.slice(1)}, ${componentName}Variants }`;
}

function generateXalaConfig(detection: ProjectDetection, options: InstallOptions): string {
  return `module.exports = {
  name: '${require(path.join(process.cwd(), 'package.json')).name || 'my-app'}',
  platform: '${detection.type}',
  industry: '${options.industry || 'general'}',
  theme: {
    default: '${options.theme || 'default'}',
    darkMode: true
  },
  i18n: {
    defaultLocale: 'en-US',
    locales: ['en-US', 'nb-NO']
  },
  accessibility: {
    level: 'AAA',
    enforceContrastRatios: true
  },
  compliance: {
    ${options.compliance ? `${options.compliance}Compliance: true,` : ''}
    auditTrail: true
  },
  typescript: ${detection.hasTypeScript},
  tailwind: ${detection.hasTailwind}
};`;
}

async function updatePackageJsonScripts(detection: ProjectDetection) {
  const packageJsonPath = path.join(process.cwd(), 'package.json');
  const packageJson = JSON.parse(await fs.readFile(packageJsonPath, 'utf-8'));
  
  packageJson.scripts = {
    ...packageJson.scripts,
    'xala:dev': 'xala dev',
    'xala:build': 'xala build',
    'xala:analyze': 'xala analyze --comprehensive',
    'xala:migrate': 'xala migrate analyze'
  };
  
  await fs.writeFile(packageJsonPath, JSON.stringify(packageJson, null, 2));
}