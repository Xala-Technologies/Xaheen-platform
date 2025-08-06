#!/usr/bin/env tsx
/**
 * Build Components Script
 * Validates and builds all platform-specific components
 */

import { existsSync, readdirSync, statSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const REGISTRY_PATH = join(__dirname, '../registry');
const PLATFORMS_PATH = join(REGISTRY_PATH, 'platforms');

const SUPPORTED_PLATFORMS = [
  'react',
  'vue', 
  'angular',
  'svelte',
  'react-native',
  'electron',
  'ionic',
  'vanilla',
  'headless-ui',
  'radix'
];

const REQUIRED_COMPONENTS = [
  'button',
  'input', 
  'card'
];

interface PlatformInfo {
  name: string;
  path: string;
  hasIndex: boolean;
  components: string[];
  missingComponents: string[];
}

async function validatePlatforms(): Promise<PlatformInfo[]> {
  console.log('🔍 Validating platform implementations...\n');
  
  const platformsInfo: PlatformInfo[] = [];
  
  if (!existsSync(PLATFORMS_PATH)) {
    console.error('❌ Platforms directory not found:', PLATFORMS_PATH);
    return [];
  }
  
  const platformDirs = readdirSync(PLATFORMS_PATH).filter(dir => {
    const fullPath = join(PLATFORMS_PATH, dir);
    return statSync(fullPath).isDirectory();
  });
  
  for (const platform of SUPPORTED_PLATFORMS) {
    const platformPath = join(PLATFORMS_PATH, platform);
    const indexPath = join(platformPath, 'index.ts');
    
    const info: PlatformInfo = {
      name: platform,
      path: platformPath,
      hasIndex: existsSync(indexPath),
      components: [],
      missingComponents: []
    };
    
    if (existsSync(platformPath)) {
      // Get all component files
      const files = readdirSync(platformPath).filter(file => 
        (file.endsWith('.tsx') || file.endsWith('.vue') || file.endsWith('.svelte') ||
         file.endsWith('.js') || (file.endsWith('.ts') && file !== 'index.ts'))
      );
      
      info.components = files.map(file => file.replace(/\.(tsx|vue|svelte|js|ts)$/, ''));
      
      // Check for required components
      for (const requiredComponent of REQUIRED_COMPONENTS) {
        const hasComponent = info.components.some(comp => 
          comp.toLowerCase().includes(requiredComponent.toLowerCase())
        );
        
        if (!hasComponent) {
          info.missingComponents.push(requiredComponent);
        }
      }
    } else {
      info.missingComponents = [...REQUIRED_COMPONENTS];
    }
    
    platformsInfo.push(info);
  }
  
  return platformsInfo;
}

function printValidationResults(platformsInfo: PlatformInfo[]): boolean {
  let allValid = true;
  
  for (const platform of platformsInfo) {
    console.log(`📦 Platform: ${platform.name}`);
    
    if (!existsSync(platform.path)) {
      console.log(`  ❌ Directory missing: ${platform.path}`);
      allValid = false;
      continue;
    }
    
    if (!platform.hasIndex) {
      console.log(`  ⚠️  Missing index.ts`);
      allValid = false;
    } else {
      console.log(`  ✅ Has index.ts`);
    }
    
    if (platform.components.length > 0) {
      console.log(`  📁 Components: ${platform.components.join(', ')}`);
    }
    
    if (platform.missingComponents.length > 0) {
      console.log(`  ❌ Missing: ${platform.missingComponents.join(', ')}`);
      allValid = false;
    } else {
      console.log(`  ✅ All required components present`);
    }
    
    console.log('');
  }
  
  return allValid;
}

async function buildPlatformSummary(platformsInfo: PlatformInfo[]): Promise<void> {
  const summary = {
    totalPlatforms: platformsInfo.length,
    validPlatforms: platformsInfo.filter(p => 
      existsSync(p.path) && p.hasIndex && p.missingComponents.length === 0
    ).length,
    platforms: platformsInfo.map(p => ({
      name: p.name,
      valid: existsSync(p.path) && p.hasIndex && p.missingComponents.length === 0,
      componentCount: p.components.length,
      components: p.components,
      missing: p.missingComponents
    })),
    supportedComponents: REQUIRED_COMPONENTS,
    buildDate: new Date().toISOString()
  };
  
  console.log('📊 Platform Summary:');
  console.log(`   Total platforms: ${summary.totalPlatforms}`);
  console.log(`   Valid platforms: ${summary.validPlatforms}`);
  console.log(`   Coverage: ${Math.round((summary.validPlatforms / summary.totalPlatforms) * 100)}%\n`);
  
  const validPlatforms = summary.platforms.filter(p => p.valid);
  if (validPlatforms.length > 0) {
    console.log('✅ Valid platforms:');
    validPlatforms.forEach(p => {
      console.log(`   • ${p.name} (${p.componentCount} components)`);
    });
    console.log('');
  }
  
  const invalidPlatforms = summary.platforms.filter(p => !p.valid);
  if (invalidPlatforms.length > 0) {
    console.log('❌ Invalid platforms:');
    invalidPlatforms.forEach(p => {
      console.log(`   • ${p.name} - Missing: ${p.missing.join(', ')}`);
    });
    console.log('');
  }
}

async function buildComponents(): Promise<void> {
  console.log('🔨 Building Design System Components...\n');
  
  try {
    const platformsInfo = await validatePlatforms();
    const allValid = printValidationResults(platformsInfo);
    
    await buildPlatformSummary(platformsInfo);
    
    if (allValid) {
      console.log('✨ All platforms are valid and ready for build!');
      console.log('📁 Registry path:', REGISTRY_PATH);
      console.log('🌐 Platforms path:', PLATFORMS_PATH);
    } else {
      console.log('⚠️  Some platforms have issues. Please fix them before building.');
      process.exit(1);
    }
    
  } catch (error) {
    console.error('❌ Build validation failed:', error);
    process.exit(1);
  }
}

// Run the build validation
buildComponents();