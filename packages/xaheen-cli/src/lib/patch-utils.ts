/**
 * @fileoverview Patch utilities for AI-driven code modifications
 * @version 1.0.0
 * @author Xala Technologies
 */

import { execSync, spawn } from 'child_process';
import { readFileSync, writeFileSync } from 'fs';
import { join } from 'path';
import chalk from 'chalk';
import inquirer from 'inquirer';

export interface PatchOptions {
  readonly cwd: string;
  readonly autoCommit?: boolean;
  readonly commitMessage?: string;
  readonly dryRun?: boolean;
}

export interface PatchResult {
  readonly success: boolean;
  readonly filesChanged: readonly string[];
  readonly linesAdded: number;
  readonly linesRemoved: number;
  readonly error?: string;
}

/**
 * Shows an interactive diff preview and asks for user confirmation
 */
export async function diffPreview(patch: string, options: PatchOptions = { cwd: process.cwd() }): Promise<boolean> {
  console.log(chalk.blue('\n📋 Patch Preview:\n'));
  
  // Parse patch to show file-by-file changes
  const patchLines = patch.split('\n');
  let currentFile = '';
  let addedLines = 0;
  let removedLines = 0;
  
  for (const line of patchLines) {
    if (line.startsWith('diff --git')) {
      const match = line.match(/diff --git a\/(.*) b\/(.*)/);
      if (match) {
        currentFile = match[1];
        console.log(chalk.yellow(`\n📄 ${currentFile}`));
      }
    } else if (line.startsWith('+++') || line.startsWith('---')) {
      // Skip file headers
      continue;
    } else if (line.startsWith('@@')) {
      console.log(chalk.cyan(line));
    } else if (line.startsWith('+')) {
      console.log(chalk.green(line));
      addedLines++;
    } else if (line.startsWith('-')) {
      console.log(chalk.red(line));
      removedLines++;
    } else if (line.trim()) {
      console.log(chalk.gray(line));
    }
  }
  
  console.log(chalk.blue(`\n📊 Summary: +${addedLines} lines, -${removedLines} lines\n`));
  
  if (options.dryRun) {
    console.log(chalk.yellow('🔍 Dry run mode - no changes will be applied'));
    return false;
  }
  
  const { confirmed } = await inquirer.prompt([
    {
      type: 'confirm',
      name: 'confirmed',
      message: 'Apply these changes?',
      default: false
    }
  ]);
  
  return confirmed;
}

/**
 * Applies a Git patch to the current working directory
 */
export async function applyPatch(patch: string, options: PatchOptions): Promise<PatchResult> {
  const { cwd, autoCommit = true, commitMessage = 'AI-generated changes via Codebuff' } = options;
  
  try {
    // Write patch to temporary file
    const patchFile = join(cwd, '.xaheen-temp.patch');
    writeFileSync(patchFile, patch);
    
    // Apply the patch
    execSync(`git apply --whitespace=fix "${patchFile}"`, { 
      cwd,
      stdio: 'pipe'
    });
    
    // Get list of changed files
    const statusOutput = execSync('git diff --name-only', { 
      cwd, 
      encoding: 'utf8' 
    });
    const filesChanged = statusOutput.trim().split('\n').filter(f => f.length > 0);
    
    // Get line count changes
    const diffStats = execSync('git diff --numstat', { 
      cwd, 
      encoding: 'utf8' 
    });
    
    let linesAdded = 0;
    let linesRemoved = 0;
    
    for (const line of diffStats.trim().split('\n')) {
      if (line) {
        const [added, removed] = line.split('\t').map(n => parseInt(n) || 0);
        linesAdded += added;
        linesRemoved += removed;
      }
    }
    
    // Auto-commit if requested
    if (autoCommit && filesChanged.length > 0) {
      execSync('git add .', { cwd });
      execSync(`git commit -m "${commitMessage}"`, { cwd });
      console.log(chalk.green(`✅ Changes committed: ${commitMessage}`));
    }
    
    // Clean up temp file
    try {
      execSync(`rm "${patchFile}"`, { cwd });
    } catch {
      // Ignore cleanup errors
    }
    
    return {
      success: true,
      filesChanged,
      linesAdded,
      linesRemoved
    };
    
  } catch (error) {
    return {
      success: false,
      filesChanged: [],
      linesAdded: 0,
      linesRemoved: 0,
      error: error instanceof Error ? error.message : String(error)
    };
  }
}

/**
 * Creates a Codebuff index for the current project
 */
export async function createCodebuffIndex(cwd: string): Promise<boolean> {
  try {
    console.log(chalk.blue('🔍 Creating Codebuff index...'));
    
    execSync('codebuff index --output ./.codebuff', { 
      cwd,
      stdio: 'inherit'
    });
    
    console.log(chalk.green('✅ Codebuff index created successfully'));
    return true;
    
  } catch (error) {
    console.error(chalk.red('❌ Failed to create Codebuff index:'), error);
    return false;
  }
}

/**
 * Validates that Git is available and the directory is a Git repository
 */
export function validateGitRepository(cwd: string): boolean {
  try {
    execSync('git rev-parse --git-dir', { cwd, stdio: 'pipe' });
    return true;
  } catch {
    return false;
  }
}

/**
 * Gets the current Git branch name
 */
export function getCurrentBranch(cwd: string): string {
  try {
    return execSync('git rev-parse --abbrev-ref HEAD', { 
      cwd, 
      encoding: 'utf8' 
    }).trim();
  } catch {
    return 'main';
  }
}

/**
 * Checks if there are uncommitted changes
 */
export function hasUncommittedChanges(cwd: string): boolean {
  try {
    const status = execSync('git status --porcelain', { 
      cwd, 
      encoding: 'utf8' 
    });
    return status.trim().length > 0;
  } catch {
    return false;
  }
}
