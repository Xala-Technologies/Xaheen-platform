#!/usr/bin/env node

/**
 * Architecture Fix Script
 * Automatically applies architecture rules to all components and blocks
 * Converts shadcn/ui components to Xaheen standards
 */

import fs from 'fs/promises';
import path from 'path';
import { glob } from 'glob';

interface FixOptions {
  dryRun?: boolean;
  verbose?: boolean;
  skipBackup?: boolean;
}

interface ComponentInfo {
  filePath: string;
  content: string;
  type: 'component' | 'block';
  name: string;
}

class ArchitectureFixer {
  private readonly componentsDir = 'registry/components';
  private readonly blocksDir = 'registry/blocks';
  private readonly options: FixOptions;

  constructor(options: FixOptions = {}) {
    this.options = options;
  }

  async run(): Promise<void> {
    console.log('🚀 Starting Architecture Fix Script...\n');

    try {
      // 1. Find all components and blocks
      const files = await this.findAllFiles();
      console.log(`📁 Found ${files.length} files to process\n`);

      // 2. Create backups if not skipped
      if (!this.options.skipBackup) {
        await this.createBackups(files);
      }

      // 3. Process each file
      for (const file of files) {
        await this.processFile(file);
      }

      console.log('\n✅ Architecture fix completed successfully!');
      
    } catch (error) {
      console.error('❌ Error during architecture fix:', error);
      process.exit(1);
    }
  }

  private async findAllFiles(): Promise<ComponentInfo[]> {
    const patterns = [
      `${this.componentsDir}/**/*.tsx`,
      `${this.blocksDir}/**/*.tsx`
    ];

    const files: ComponentInfo[] = [];

    for (const pattern of patterns) {
      const matches = await glob(pattern);
      
      for (const filePath of matches) {
        const content = await fs.readFile(filePath, 'utf-8');
        const type = filePath.includes('/components/') ? 'component' : 'block';
        const name = path.basename(path.dirname(filePath));
        
        files.push({
          filePath,
          content,
          type,
          name
        });
      }
    }

    return files;
  }

  private async createBackups(files: ComponentInfo[]): Promise<void> {
    const backupDir = `backups/${new Date().toISOString().split('T')[0]}`;
    await fs.mkdir(backupDir, { recursive: true });

    console.log(`💾 Creating backups in ${backupDir}...`);

    for (const file of files) {
      const backupPath = path.join(backupDir, file.filePath);
      await fs.mkdir(path.dirname(backupPath), { recursive: true });
      await fs.writeFile(backupPath, file.content);
    }

    console.log('✅ Backups created\n');
  }

  private async processFile(file: ComponentInfo): Promise<void> {
    if (this.options.verbose) {
      console.log(`🔧 Processing ${file.type}: ${file.name}`);
    }

    let fixedContent = file.content;

    // Apply all fixes
    fixedContent = this.fixImports(fixedContent);
    fixedContent = this.fixHardcodedText(fixedContent);
    fixedContent = this.addMissingInterfaces(fixedContent);
    fixedContent = this.fixDesignTokens(fixedContent);
    fixedContent = this.addReadonlyProperties(fixedContent);
    fixedContent = this.fixForwardRefPattern(fixedContent);
    fixedContent = this.addExplicitReturnTypes(fixedContent);
    fixedContent = this.addAriaLabels(fixedContent);

    if (file.type === 'component') {
      fixedContent = this.applyCVAPattern(fixedContent);
      fixedContent = this.removePureComponentHooks(fixedContent);
    } else {
      fixedContent = this.addTextConstants(fixedContent);
    }

    // Write the fixed content
    if (!this.options.dryRun) {
      await fs.writeFile(file.filePath, fixedContent);
    }

    if (this.options.verbose) {
      console.log(`  ✅ Fixed ${file.name}`);
    }
  }

  private fixImports(content: string): string {
    const fixes = [
      // Fix @/ alias imports to relative imports
      {
        pattern: /import { cn } from ['"]@\/.*?utils['"];?/g,
        replacement: "import { cn } from '../../lib/utils';"
      },
      {
        pattern: /import.*?from ['"]@\/components\/.*?['"];?/g,
        replacement: (match: string) => {
          // Extract component name and convert to relative import
          const componentMatch = match.match(/from ['"]@\/components\/(.*?)['"];?/);
          if (componentMatch) {
            const componentName = componentMatch[1];
            return match.replace(
              `@/components/${componentName}`,
              `../${componentName}/${componentName}`
            );
          }
          return match;
        }
      },
      {
        pattern: /import.*?from ['"]@\/hooks\/.*?['"];?/g,
        replacement: ''  // Remove hook imports for pure components
      }
    ];

    let result = content;
    fixes.forEach(fix => {
      if (typeof fix.replacement === 'string') {
        result = result.replace(fix.pattern, fix.replacement);
      } else {
        result = result.replace(fix.pattern, fix.replacement);
      }
    });

    return result;
  }

  private fixHardcodedText(content: string): string {
    const textReplacements = {
      // Common hardcoded text patterns
      '"Close"': 'LABELS.close',
      '"Open"': 'LABELS.open', 
      '"Save"': 'LABELS.save',
      '"Cancel"': 'LABELS.cancel',
      '"Search"': 'LABELS.search',
      '"Filter"': 'LABELS.filter',
      '"Loading"': 'LABELS.loading',
      '"Apply"': 'LABELS.apply',
      '"Reset"': 'LABELS.reset',
      // Placeholders
      '"Search..."': 'PLACEHOLDERS.searchEverything',
      '"Type here..."': 'PLACEHOLDERS.typeHere',
      '"Enter email"': 'PLACEHOLDERS.enterEmail'
    };

    let result = content;
    
    // Add import for constants if text replacements are made
    let hasReplacements = false;
    
    Object.entries(textReplacements).forEach(([pattern, replacement]) => {
      const regex = new RegExp(pattern, 'g');
      if (regex.test(result)) {
        hasReplacements = true;
        result = result.replace(regex, replacement);
      }
    });

    // Add constants import if needed
    if (hasReplacements && !result.includes('from \'../../lib/constants\'')) {
      const importMatch = result.match(/(import.*?from.*?;)/);
      if (importMatch) {
        const lastImport = importMatch[0];
        result = result.replace(
          lastImport,
          `${lastImport}\nimport { LABELS, PLACEHOLDERS, ARIA_LABELS } from '../../lib/constants';`
        );
      }
    }

    return result;
  }

  private addMissingInterfaces(content: string): string {
    // Add readonly to interface properties
    return content.replace(
      /interface\s+(\w+)\s*{[^}]*}/g,
      (match) => {
        return match.replace(
          /(\s+)(\w+)(\??):\s/g,
          '$1readonly $2$3: '
        );
      }
    );
  }

  private fixDesignTokens(content: string): string {
    const tokenFixes = [
      // Color fixes
      { pattern: /bg-blue-500/g, replacement: 'bg-primary' },
      { pattern: /bg-blue-600/g, replacement: 'bg-primary' },
      { pattern: /text-white/g, replacement: 'text-primary-foreground' },
      { pattern: /bg-gray-100/g, replacement: 'bg-muted' },
      { pattern: /text-gray-600/g, replacement: 'text-muted-foreground' },
      { pattern: /bg-red-500/g, replacement: 'bg-destructive' },
      { pattern: /text-red-500/g, replacement: 'text-destructive' },
      { pattern: /border-gray-300/g, replacement: 'border-border' },
      { pattern: /bg-white/g, replacement: 'bg-background' },
      { pattern: /text-black/g, replacement: 'text-foreground' },
      
      // Remove hardcoded hex colors
      { pattern: /#[0-9a-fA-F]{6}/g, replacement: 'currentColor' },
      { pattern: /#[0-9a-fA-F]{3}/g, replacement: 'currentColor' },
      
      // Professional sizing
      { pattern: /h-8(?!\d)/g, replacement: 'h-12' }, // Minimum 48px buttons
      { pattern: /h-9(?!\d)/g, replacement: 'h-12' },
      { pattern: /h-10(?!\d)/g, replacement: 'h-12' },
      { pattern: /px-2(?!\d)/g, replacement: 'px-4' }, // Minimum padding
      { pattern: /py-1(?!\d)/g, replacement: 'py-3' },
      { pattern: /text-xs/g, replacement: 'text-sm' }, // Minimum readable text
    ];

    let result = content;
    tokenFixes.forEach(fix => {
      result = result.replace(fix.pattern, fix.replacement);
    });

    return result;
  }

  private addReadonlyProperties(content: string): string {
    // Already handled in addMissingInterfaces
    return content;
  }

  private fixForwardRefPattern(content: string): string {
    // Find component exports that don't use forwardRef
    const componentPattern = /export const (\w+) = \(([^)]*)\):\s*JSX\.Element =>/g;
    
    return content.replace(componentPattern, (match, componentName, props) => {
      if (match.includes('forwardRef')) {
        return match; // Already using forwardRef
      }
      
      return `export const ${componentName} = React.forwardRef<HTMLDivElement, ${componentName}Props>(
  (${props}, ref): JSX.Element =>`;
    });
  }

  private addExplicitReturnTypes(content: string): string {
    // Add JSX.Element return type where missing
    return content.replace(
      /= \(([^)]*)\) => \{/g,
      '= ($1): JSX.Element => {'
    ).replace(
      /= \(([^)]*)\) =>/g,
      '= ($1): JSX.Element =>'
    );
  }

  private addAriaLabels(content: string): string {
    const ariaFixes = [
      // Add aria-label to buttons without labels
      {
        pattern: /<button([^>]*?)>/g,
        replacement: (match: string) => {
          if (!match.includes('aria-label') && !match.includes('aria-labelledby')) {
            return match.replace('>', ' aria-label="Button">');
          }
          return match;
        }
      },
      // Add role to divs that act like buttons
      {
        pattern: /<div([^>]*?)onClick/g,
        replacement: (match: string) => {
          if (!match.includes('role=')) {
            return match.replace('onClick', 'role="button" onClick');
          }
          return match;
        }
      }
    ];

    let result = content;
    ariaFixes.forEach(fix => {
      result = result.replace(fix.pattern, fix.replacement);
    });

    return result;
  }

  private applyCVAPattern(content: string): string {
    // Check if already has CVA
    if (content.includes('cva(') && content.includes('VariantProps')) {
      return content;
    }

    // Add CVA import if missing
    if (!content.includes('class-variance-authority')) {
      content = content.replace(
        "import React from 'react';",
        `import React from 'react';\nimport { cva, type VariantProps } from 'class-variance-authority';`
      );
    }

    // Basic CVA pattern for components without it
    if (!content.includes('cva(')) {
      const componentMatch = content.match(/export const (\w+)/);
      if (componentMatch) {
        const componentName = componentMatch[1].toLowerCase();
        const cvaPattern = `
const ${componentName}Variants = cva(
  [
    'transition-all duration-200'
  ],
  {
    variants: {
      variant: {
        default: 'bg-background text-foreground border border-border'
      },
      size: {
        md: 'h-12 px-4 py-3 text-base',
        lg: 'h-14 px-6 py-4 text-lg'
      }
    },
    defaultVariants: {
      variant: 'default',
      size: 'md'
    }
  }
);

export interface ${componentMatch[1]}Props
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof ${componentName}Variants> {}
`;
        
        content = content.replace(
          /export interface.*?Props.*?\{.*?\}/s,
          cvaPattern
        );
      }
    }

    return content;
  }

  private removePureComponentHooks(content: string): string {
    // Remove React hooks from pure components
    const hooksToRemove = [
      'useState',
      'useEffect', 
      'useCallback',
      'useMemo',
      'useReducer',
      'useContext'
    ];

    let result = content;

    // Remove hook imports
    hooksToRemove.forEach(hook => {
      result = result.replace(new RegExp(`${hook},?\\s*`, 'g'), '');
      result = result.replace(new RegExp(`,\\s*${hook}`, 'g'), '');
    });

    // Remove hook usage (basic patterns)
    result = result.replace(/const \[.*?\] = useState.*?;/g, '');
    result = result.replace(/useEffect\([^}]*\}[^;]*;/g, '');
    result = result.replace(/const \w+ = useCallback\([^}]*\}[^;]*;/g, '');

    return result;
  }

  private addTextConstants(content: string): string {
    // For blocks, ensure text constants are used
    return this.fixHardcodedText(content);
  }
}

// CLI Usage
async function main(): Promise<void> {
  const args = process.argv.slice(2);
  
  const options: FixOptions = {
    dryRun: args.includes('--dry-run'),
    verbose: args.includes('--verbose') || args.includes('-v'),
    skipBackup: args.includes('--skip-backup')
  };

  if (args.includes('--help') || args.includes('-h')) {
    console.log(`
🏗️  Architecture Fix Script

Usage: npm run fix-architecture [options]

Options:
  --dry-run       Show what would be changed without making changes
  --verbose, -v   Show detailed output
  --skip-backup   Skip creating backup files
  --help, -h      Show this help message

Examples:
  npm run fix-architecture                    # Fix all files
  npm run fix-architecture --dry-run          # Preview changes
  npm run fix-architecture --verbose          # Detailed output
  npm run fix-architecture --skip-backup -v   # No backup, verbose
    `);
    return;
  }

  const fixer = new ArchitectureFixer(options);
  await fixer.run();
}

// Export for programmatic use
export { ArchitectureFixer };

// Run if called directly
if (require.main === module) {
  main().catch(console.error);
}