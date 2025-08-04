/**
 * @fileoverview Check Command - Quick component and page validation
 * @description Validates individual components/pages against UI system standards  
 */

import { Command } from 'commander';
import path from 'path';
import fs from 'fs/promises';
import { existsSync } from 'fs';
import chalk from 'chalk';
import ora from 'ora';

interface ComponentCheck {
  file: string;
  score: number;
  status: 'excellent' | 'good' | 'needs-work' | 'requires-migration';
  checks: CheckResult[];
  quickFixes: QuickFix[];
  estimatedTime: string;
}

interface CheckResult {
  name: string;
  passed: boolean;
  severity: 'error' | 'warning' | 'info';
  message: string;
  suggestion?: string;
  documentation?: string;
}

interface QuickFix {
  description: string;
  command: string;
  autoApply: boolean;
}

export const check = new Command('check')
  .description('Quick validation of components and pages against UI system standards')
  .argument('<file>', 'Component or page file to check')
  .option('-v, --verbose', 'Show detailed information')
  .option('-f, --fix-suggestions', 'Show specific fix commands') 
  .option('--json', 'Output as JSON')
  .option('--score-only', 'Show only the compatibility score')
  .action(async (file: string, options) => {
    try {
      console.log(chalk.blue(`\n⚡ Quick check: ${file}`));
      
      const result = await performQuickCheck(file, options);
      
      if (options.json) {
        console.log(JSON.stringify(result, null, 2));
        return;
      }
      
      if (options.scoreOnly) {
        console.log(result.score);
        return;
      }
      
      displayCheckResults(result, options);
      
    } catch (error) {
      console.error(chalk.red('\n❌ Check failed:'), error instanceof Error ? error.message : String(error));
      process.exit(1);
    }
  });

async function performQuickCheck(filePath: string, options: any): Promise<ComponentCheck> {
  const spinner = ora('Analyzing component...').start();
  
  try {
    if (!existsSync(filePath)) {
      throw new Error(`File not found: ${filePath}`);
    }
    
    const content = await fs.readFile(filePath, 'utf-8');
    const result = await analyzeComponent(filePath, content, options);
    
    spinner.succeed('Analysis complete');
    return result;
    
  } catch (error) {
    spinner.fail('Analysis failed');
    throw error;
  }
}

async function analyzeComponent(filePath: string, content: string, options: any): Promise<ComponentCheck> {
  const checks: CheckResult[] = [];
  
  // Run all checks
  checks.push(...checkV5Architecture(content));
  checks.push(...checkStyling(content));
  checks.push(...checkTypeScript(content));
  checks.push(...checkAccessibility(content)); 
  checks.push(...checkPerformance(content));
  checks.push(...checkCompliance(content));
  checks.push(...checkNamingConventions(filePath, content));
  checks.push(...checkImports(content));
  
  // Calculate score
  const score = calculateScore(checks);
  
  // Determine status
  const status = determineStatus(score);
  
  // Generate quick fixes
  const quickFixes = generateQuickFixes(checks, content);
  
  // Estimate time needed
  const estimatedTime = estimateFixTime(checks);
  
  return {
    file: filePath,
    score,
    status,
    checks,
    quickFixes,
    estimatedTime
  };
}

function checkV5Architecture(content: string): CheckResult[] {
  const checks: CheckResult[] = [];
  
  // Check for hooks in UI components
  const hooks = ['useState', 'useEffect', 'useCallback', 'useMemo', 'useTokens'];
  const foundHooks = hooks.filter(hook => content.includes(hook));
  
  if (foundHooks.length > 0) {
    checks.push({
      name: 'v5.0 Pure Components',
      passed: false,
      severity: 'error',
      message: `Found hooks in component: ${foundHooks.join(', ')}`,
      suggestion: 'Move state management to parent component or provider',
      documentation: 'https://docs.xala.dev/v5-architecture'
    });
  } else {
    checks.push({
      name: 'v5.0 Pure Components',
      passed: true,
      severity: 'info',
      message: 'Component follows v5.0 pure component pattern'
    });
  }
  
  // Check for CVA usage
  if (content.includes('className') && !content.includes('cva')) {
    checks.push({
      name: 'CVA Pattern',
      passed: false,
      severity: 'warning',
      message: 'Not using CVA for variant management',
      suggestion: 'Add class-variance-authority for consistent styling variants'
    });
  } else if (content.includes('cva')) {
    checks.push({
      name: 'CVA Pattern',
      passed: true,
      severity: 'info',
      message: 'Using CVA for variant management'
    });
  }
  
  // Check for forwardRef
  if (content.includes('export const') && !content.includes('forwardRef')) {
    checks.push({
      name: 'Ref Forwarding',
      passed: false,
      severity: 'warning',
      message: 'Component not using forwardRef',
      suggestion: 'Add forwardRef for better ref handling'
    });
  } else if (content.includes('forwardRef')) {
    checks.push({
      name: 'Ref Forwarding',
      passed: true,
      severity: 'info',
      message: 'Component properly forwards refs'
    });
  }
  
  return checks;
}

function checkStyling(content: string): CheckResult[] {
  const checks: CheckResult[] = [];
  
  // Check for inline styles
  if (content.includes('style={{')) {
    checks.push({
      name: 'Inline Styles',
      passed: false,
      severity: 'warning',
      message: 'Inline styles detected',
      suggestion: 'Replace with Tailwind CSS utility classes'
    });
  } else {
    checks.push({
      name: 'Inline Styles',
      passed: true,
      severity: 'info',
      message: 'No inline styles found'
    });
  }
  
  // Check for hardcoded colors
  const colorRegex = /#[0-9a-fA-F]{6}|#[0-9a-fA-F]{3}|rgb\(.*?\)|rgba\(.*?\)/g;
  if (colorRegex.test(content)) {
    checks.push({
      name: 'Design Tokens',
      passed: false,
      severity: 'warning',
      message: 'Hardcoded colors detected',
      suggestion: 'Use design tokens from theme system'
    });
  } else {
    checks.push({
      name: 'Design Tokens',
      passed: true,
      severity: 'info',
      message: 'Using design tokens (no hardcoded colors)'
    });
  }
  
  // Check for professional sizing
  const smallSizes = ['p-1', 'p-2', 'h-4', 'h-6', 'text-xs'];
  const foundSmallSizes = smallSizes.filter(size => content.includes(size));
  
  if (foundSmallSizes.length > 0) {
    checks.push({
      name: 'Professional Sizing',
      passed: false,
      severity: 'warning',
      message: `Small sizing detected: ${foundSmallSizes.join(', ')}`,
      suggestion: 'Use professional sizing (min h-12 for buttons, h-14 for inputs)'
    });
  } else {
    checks.push({
      name: 'Professional Sizing',
      passed: true,
      severity: 'info',
      message: 'Using professional sizing standards'
    });
  }
  
  return checks;
}

function checkTypeScript(content: string): CheckResult[] {
  const checks: CheckResult[] = [];
  
  // Check for any types
  if (content.includes(': any') || content.includes('<any>')) {
    checks.push({
      name: 'TypeScript Strictness',
      passed: false,
      severity: 'error',
      message: 'Using "any" type',
      suggestion: 'Replace with specific types for better type safety'
    });
  } else {
    checks.push({
      name: 'TypeScript Strictness',
      passed: true,
      severity: 'info',
      message: 'No "any" types found'
    });
  }
  
  // Check for interface
  if (!content.includes('interface ') && !content.includes('type ')) {
    checks.push({
      name: 'Type Definitions',
      passed: false,
      severity: 'warning',
      message: 'No TypeScript interfaces or types defined',
      suggestion: 'Add proper interfaces for component props'
    });
  } else {
    checks.push({
      name: 'Type Definitions',
      passed: true,
      severity: 'info',
      message: 'Has proper type definitions'
    });
  }
  
  // Check for readonly modifiers
  if (content.includes('interface ') && !content.includes('readonly ')) {
    checks.push({
      name: 'Readonly Props',
      passed: false,
      severity: 'info',
      message: 'Props not marked as readonly',
      suggestion: 'Add readonly modifier to interface properties'
    });
  } else if (content.includes('readonly ')) {
    checks.push({
      name: 'Readonly Props',
      passed: true,
      severity: 'info',
      message: 'Props properly marked as readonly'
    });
  }
  
  return checks;
}

function checkAccessibility(content: string): CheckResult[] {
  const checks: CheckResult[] = [];
  
  // Check for ARIA labels
  const hasAriaLabels = content.includes('aria-label') || content.includes('aria-labelledby');
  if (!hasAriaLabels && (content.includes('<button') || content.includes('<input'))) {
    checks.push({
      name: 'ARIA Labels',
      passed: false,
      severity: 'error',
      message: 'Interactive elements missing ARIA labels',
      suggestion: 'Add aria-label or aria-labelledby attributes'
    });
  } else if (hasAriaLabels) {
    checks.push({
      name: 'ARIA Labels',
      passed: true,
      severity: 'info',
      message: 'Has proper ARIA labels'
    });
  }
  
  // Check for alt text on images
  if (content.includes('<img') && !content.includes('alt=')) {
    checks.push({
      name: 'Image Alt Text',
      passed: false,
      severity: 'error',
      message: 'Images missing alt text',
      suggestion: 'Add descriptive alt text to all images'
    });
  } else if (content.includes('<img')) {
    checks.push({
      name: 'Image Alt Text',
      passed: true,
      severity: 'info',
      message: 'Images have alt text'
    });
  }
  
  // Check for semantic HTML
  if (content.includes('<div') && !content.includes('<button') && content.includes('onClick')) {
    checks.push({
      name: 'Semantic HTML',
      passed: false,
      severity: 'warning',
      message: 'Using div for interactive elements',
      suggestion: 'Use semantic HTML elements (button, input, etc.)'
    });
  }
  
  return checks;
}

function checkPerformance(content: string): CheckResult[] {
  const checks: CheckResult[] = [];
  
  // Check for React.memo
  if (content.includes('export const') && !content.includes('memo(') && !content.includes('React.memo')) {
    checks.push({
      name: 'Component Memoization',
      passed: false,
      severity: 'info',
      message: 'Component not memoized',
      suggestion: 'Consider using React.memo for performance optimization'
    });
  } else if (content.includes('memo(')) {
    checks.push({
      name: 'Component Memoization',
      passed: true,
      severity: 'info',
      message: 'Component is memoized'
    });
  }
  
  // Check for large inline objects
  if (content.includes('style={{') && content.match(/\{[\s\S]{100,}\}/)) {
    checks.push({
      name: 'Object Creation',
      passed: false,
      severity: 'warning',
      message: 'Large inline objects detected',
      suggestion: 'Extract objects to avoid re-creation on each render'
    });
  }
  
  return checks;
}

function checkCompliance(content: string): CheckResult[] {
  const checks: CheckResult[] = [];
  
  // Check for test IDs
  if (!content.includes('data-testid')) {
    checks.push({
      name: 'Test Identifiers',
      passed: false,
      severity: 'info',
      message: 'Missing test identifiers',
      suggestion: 'Add data-testid attributes for better testing'
    });
  } else {
    checks.push({
      name: 'Test Identifiers',
      passed: true,
      severity: 'info',
      message: 'Has test identifiers'
    });
  }
  
  // Check for display name
  if (content.includes('export const') && !content.includes('.displayName')) {
    checks.push({
      name: 'Display Name',
      passed: false,
      severity: 'info',
      message: 'Missing displayName for debugging',
      suggestion: 'Add displayName after component definition'
    });
  } else if (content.includes('.displayName')) {
    checks.push({
      name: 'Display Name',
      passed: true,
      severity: 'info',
      message: 'Has displayName for debugging'
    });
  }
  
  return checks;
}

function checkNamingConventions(filePath: string, content: string): CheckResult[] {
  const checks: CheckResult[] = [];
  
  const fileName = path.basename(filePath, path.extname(filePath));
  
  // Check file naming (PascalCase for components)
  if (!/^[A-Z][a-zA-Z0-9]*$/.test(fileName)) {
    checks.push({
      name: 'File Naming',
      passed: false,
      severity: 'warning',
      message: 'File name should be PascalCase',
      suggestion: `Rename to use PascalCase (e.g., ${fileName.charAt(0).toUpperCase() + fileName.slice(1)})`
    });
  } else {
    checks.push({
      name: 'File Naming',
      passed: true,
      severity: 'info',
      message: 'File follows PascalCase naming convention'
    });
  }
  
  // Check component name matches file name
  const componentMatch = content.match(/export const (\w+)/);
  if (componentMatch) {
    const componentName = componentMatch[1];
    if (componentName !== fileName) {
      checks.push({
        name: 'Component Naming',
        passed: false,
        severity: 'warning',
        message: 'Component name should match file name',
        suggestion: `Rename component to ${fileName} or file to ${componentName}`
      });
    } else {
      checks.push({
        name: 'Component Naming',
        passed: true,
        severity: 'info',
        message: 'Component name matches file name'
      });
    }
  }
  
  return checks;
}

function checkImports(content: string): CheckResult[] {
  const checks: CheckResult[] = [];
  
  // Check for required imports
  if (content.includes('className') && !content.includes('cn(')) {
    checks.push({
      name: 'Utility Imports',
      passed: false,
      severity: 'warning',
      message: 'Missing cn utility for class merging',
      suggestion: 'Import cn from @/lib/utils'
    });
  } else if (content.includes('cn(')) {
    checks.push({
      name: 'Utility Imports',
      passed: true,
      severity: 'info',
      message: 'Has proper utility imports'
    });
  }
  
  // Check for React import
  if (content.includes('forwardRef') && !content.includes('import React')) {
    checks.push({
      name: 'React Imports',
      passed: false,
      severity: 'error',
      message: 'Missing React import for forwardRef',
      suggestion: 'Import React from "react"'
    });
  }
  
  return checks;
}

function calculateScore(checks: CheckResult[]): number {
  let totalPoints = 0;
  let maxPoints = 0;
  
  for (const check of checks) {
    const weight = check.severity === 'error' ? 3 : check.severity === 'warning' ? 2 : 1;
    maxPoints += weight;
    if (check.passed) {
      totalPoints += weight;
    }
  }
  
  return maxPoints > 0 ? Math.round((totalPoints / maxPoints) * 100) : 100;
}

function determineStatus(score: number): ComponentCheck['status'] {
  if (score >= 90) return 'excellent';
  if (score >= 75) return 'good';  
  if (score >= 50) return 'needs-work';
  return 'requires-migration';
}

function generateQuickFixes(checks: CheckResult[], content: string): QuickFix[] {
  const fixes: QuickFix[] = [];
  
  for (const check of checks) {
    if (!check.passed && check.suggestion) {
      switch (check.name) {
        case 'TypeScript Strictness':
          fixes.push({
            description: 'Fix TypeScript any types',
            command: 'xala migrate convert --fix-types',
            autoApply: false
          });
          break;
        case 'ARIA Labels':
          fixes.push({
            description: 'Add ARIA labels automatically',
            command: 'xala migrate convert --fix-accessibility',
            autoApply: true
          });
          break;
        case 'Inline Styles':
          fixes.push({
            description: 'Convert to Tailwind classes',
            command: 'xala migrate convert --fix-styling',
            autoApply: true
          });
          break;
        case 'CVA Pattern':
          fixes.push({
            description: 'Add CVA for variant management',
            command: 'xala migrate convert --add-cva',
            autoApply: false
          });
          break;
      }
    }
  }
  
  return fixes;
}

function estimateFixTime(checks: CheckResult[]): string {
  const failedChecks = checks.filter(c => !c.passed);
  const errorCount = failedChecks.filter(c => c.severity === 'error').length;
  const warningCount = failedChecks.filter(c => c.severity === 'warning').length;
  
  if (errorCount > 3 || warningCount > 5) return '2-4 hours';
  if (errorCount > 1 || warningCount > 2) return '30-60 minutes';
  if (failedChecks.length > 0) return '10-15 minutes';
  return '0 minutes';
}

function displayCheckResults(result: ComponentCheck, options: any) {
  console.log();
  
  // Status header
  const statusColor = {
    'excellent': chalk.green,
    'good': chalk.blue,
    'needs-work': chalk.yellow,
    'requires-migration': chalk.red
  }[result.status];
  
  const statusIcon = {
    'excellent': '🎉',
    'good': '👍', 
    'needs-work': '⚠️',
    'requires-migration': '🚨'
  }[result.status];
  
  console.log(`${statusIcon} ${statusColor.bold(result.status.toUpperCase())} - Score: ${statusColor(result.score + '%')}`);
  console.log(`⏱️  Estimated fix time: ${result.estimatedTime}`);
  console.log();
  
  // Results summary
  const passed = result.checks.filter(c => c.passed).length;
  const failed = result.checks.length - passed;
  const errors = result.checks.filter(c => !c.passed && c.severity === 'error').length;
  const warnings = result.checks.filter(c => !c.passed && c.severity === 'warning').length;
  
  console.log(chalk.cyan('📊 Results Summary:'));
  console.log(`   ✅ Passed: ${chalk.green(passed)}`);
  console.log(`   ❌ Failed: ${chalk.red(failed)}`);
  if (errors > 0) console.log(`   🔴 Errors: ${chalk.red(errors)}`);
  if (warnings > 0) console.log(`   🟡 Warnings: ${chalk.yellow(warnings)}`);
  console.log();
  
  // Detailed results
  if (options.verbose || failed > 0) {
    console.log(chalk.cyan('📋 Detailed Results:'));
    
    for (const check of result.checks) {
      const icon = check.passed ? '✅' : 
                   check.severity === 'error' ? '❌' : 
                   check.severity === 'warning' ? '⚠️' : 'ℹ️';
      
      console.log(`${icon} ${check.name}: ${check.message}`);
      
      if (!check.passed && check.suggestion && options.verbose) {
        console.log(chalk.gray(`   💡 ${check.suggestion}`));
      }
      
      if (check.documentation && options.verbose) {
        console.log(chalk.blue(`   📖 ${check.documentation}`));
      }
    }
    console.log();
  }
  
  // Quick fixes
  if (options.fixSuggestions && result.quickFixes.length > 0) {
    console.log(chalk.green('🔧 Quick Fixes Available:'));
    for (const fix of result.quickFixes) {
      const autoIcon = fix.autoApply ? '🤖' : '👤';
      console.log(`${autoIcon} ${fix.description}`);
      console.log(chalk.yellow(`   ${fix.command}`));
    }
    console.log();
  }
  
  // Recommendations
  console.log(chalk.cyan('🎯 Recommendations:'));
  
  if (result.status === 'excellent') {
    console.log('   🎉 Great job! This component follows all UI system standards.');
    console.log('   📝 Consider adding it as an example in your component library.');
  } else if (result.status === 'good') {
    console.log('   👍 Good work! Just a few minor improvements needed.');
    console.log(`   🔧 Run: ${chalk.yellow('xala migrate convert --interactive')}`);
  } else if (result.status === 'needs-work') {
    console.log('   ⚠️  This component needs some work to meet UI system standards.');
    console.log(`   🔧 Run: ${chalk.yellow('xala migrate convert --guided')}`);
    console.log('   📖 Review the v5.0 architecture guide');
  } else {
    console.log('   🚨 This component requires significant migration work.');
    console.log(`   🔄 Consider: ${chalk.yellow('xala migrate analyze')} first`);
    console.log(`   🆕 Or generate new: ${chalk.yellow('xala generate component NewComponent')}`);
  }
}