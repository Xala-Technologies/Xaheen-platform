#!/usr/bin/env node

import { execSync } from 'child_process';
import { rmSync, mkdirSync } from 'fs';

// Clean dist directory
console.log('Cleaning dist directory...');
rmSync('dist', { recursive: true, force: true });
mkdirSync('dist', { recursive: true });

// Run TypeScript compiler
console.log('Compiling TypeScript...');
execSync('tsc', { stdio: 'inherit' });

console.log('Build complete!');