#!/usr/bin/env node

import { readFileSync, writeFileSync } from 'fs';
import { glob } from 'glob';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Find all TypeScript files in src directory
const files = glob.sync('src/**/*.ts', { cwd: __dirname });

console.log(`Found ${files.length} TypeScript files to fix...`);

for (const file of files) {
  const filePath = join(__dirname, file);
  let content = readFileSync(filePath, 'utf8');
  
  // Fix relative imports that don't end with .js
  content = content.replace(
    /from\s+['"](\.\/.+?)(?<!\.js)['"];/g,
    "from '$1.js';"
  );
  
  // Fix relative imports in import statements
  content = content.replace(
    /import\s+(.+?)\s+from\s+['"](\.\/.+?)(?<!\.js)['"];/g,
    "import $1 from '$2.js';"
  );
  
  writeFileSync(filePath, content);
  console.log(`Fixed imports in ${file}`);
}

console.log('All imports fixed!');
