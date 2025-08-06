#!/usr/bin/env bun
/**
 * Build Registry Script
 * Generates individual JSON files for each registry item
 */

import { readFileSync, writeFileSync, mkdirSync, existsSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const REGISTRY_PATH = join(__dirname, '../registry');
const OUTPUT_PATH = join(__dirname, '../dist/registry');
const PUBLIC_PATH = join(__dirname, '../public/r');

interface RegistryItem {
  name: string;
  type: string;
  title: string;
  description?: string;
  category?: string;
  nsm?: {
    classification: string;
    wcagLevel: string;
    norwegianOptimized?: boolean;
  };
  platforms?: string[];
  dependencies?: string[];
  devDependencies?: string[];
  registryDependencies?: string[];
  files: Array<{
    path: string;
    type: string;
    target?: string;
    content?: string;
    platform?: string;
  }>;
  cssVars?: any;
  config?: any;
  examples?: any[];
}

interface Registry {
  name: string;
  version: string;
  homepage: string;
  description?: string;
  items: RegistryItem[];
}

async function buildRegistry() {
  console.log('🔨 Building Xaheen Component Registry...\n');

  try {
    // Read registry.json
    const registryPath = join(REGISTRY_PATH, 'registry.json');
    const registryContent = readFileSync(registryPath, 'utf-8');
    const registry: Registry = JSON.parse(registryContent);

    // Create output directories
    [OUTPUT_PATH, PUBLIC_PATH].forEach(dir => {
      if (!existsSync(dir)) {
        mkdirSync(dir, { recursive: true });
      }
    });

    // Process registry items from registry.json
    for (const item of registry.items) {
      console.log(`📦 Processing: ${item.name} (${item.type})`);

      // Read file contents
      const processedFiles = await Promise.all(
        item.files.map(async (file) => {
          const filePath = join(REGISTRY_PATH, file.path);
          
          if (existsSync(filePath)) {
            const content = readFileSync(filePath, 'utf-8');
            return {
              ...file,
              content: file.content || content
            };
          }
          
          return file;
        })
      );

      // Create individual item JSON
      const itemData = {
        $schema: 'https://xaheen.io/schemas/registry-item.schema.json',
        ...item,
        files: processedFiles
      };

      // Write to both output locations
      const fileName = `${item.name}.json`;
      
      writeFileSync(
        join(OUTPUT_PATH, fileName),
        JSON.stringify(itemData, null, 2)
      );
      
      writeFileSync(
        join(PUBLIC_PATH, fileName),
        JSON.stringify(itemData, null, 2)
      );

      console.log(`  ✅ Generated: ${fileName}`);
    }

    // Create index file
    const indexData = {
      name: registry.name,
      version: registry.version,
      homepage: registry.homepage,
      description: registry.description,
      items: registry.items.map(item => ({
        name: item.name,
        type: item.type,
        title: item.title,
        description: item.description,
        category: item.category,
        platforms: item.platforms,
        nsm: item.nsm
      }))
    };

    writeFileSync(
      join(OUTPUT_PATH, 'index.json'),
      JSON.stringify(indexData, null, 2)
    );
    
    writeFileSync(
      join(PUBLIC_PATH, 'index.json'),
      JSON.stringify(indexData, null, 2)
    );

    // Also process items directory for v4-style universal items
    const itemsPath = join(REGISTRY_PATH, 'items');
    if (existsSync(itemsPath)) {
      const { readdirSync } = await import('fs');
      const itemFiles = readdirSync(itemsPath).filter(f => f.endsWith('.json'));
      
      console.log('\n📦 Processing universal items...');
      
      for (const itemFile of itemFiles) {
        const itemPath = join(itemsPath, itemFile);
        const itemContent = readFileSync(itemPath, 'utf-8');
        const item = JSON.parse(itemContent);
        
        console.log(`  ✅ Copied: ${item.name}.json`);
        
        // Copy to output directories
        writeFileSync(
          join(OUTPUT_PATH, `${item.name}.json`),
          itemContent
        );
        
        writeFileSync(
          join(PUBLIC_PATH, `${item.name}.json`),
          itemContent
        );
      }
    }

    console.log('\n✨ Registry build completed successfully!');
    console.log(`📁 Output: ${OUTPUT_PATH}`);
    console.log(`🌐 Public: ${PUBLIC_PATH}`);

  } catch (error) {
    console.error('❌ Build failed:', error);
    process.exit(1);
  }
}

// Run the build
buildRegistry();