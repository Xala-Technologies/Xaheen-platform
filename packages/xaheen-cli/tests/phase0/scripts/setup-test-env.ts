/**
 * Global Test Environment Setup
 * 
 * This script runs before all Phase 0 tests to set up the test environment,
 * validate prerequisites, and prepare necessary resources.
 */

import { promises as fs } from 'fs';
import { join } from 'path';
import { execaCommand } from 'execa';

const SETUP_TIMEOUT = 60000; // 1 minute

export default async function setup() {
  console.log('🚀 Setting up Phase 0 test environment...');
  
  try {
    // Validate Node.js version
    await validateNodeVersion();
    
    // Ensure CLI is built
    await ensureCliBuild();
    
    // Validate test directories
    await validateTestDirectories();
    
    // Set up environment variables
    await setupEnvironmentVariables();
    
    // Create test output directory
    await createTestOutputDirectory();
    
    console.log('✅ Phase 0 test environment setup complete');
    
  } catch (error) {
    console.error('❌ Phase 0 test environment setup failed:', error);
    process.exit(1);
  }
}

async function validateNodeVersion() {
  const nodeVersion = process.version;
  const majorVersion = parseInt(nodeVersion.slice(1).split('.')[0]);
  
  if (majorVersion < 18) {
    throw new Error(`Node.js 18+ required, got ${nodeVersion}`);
  }
  
  console.log(`✅ Node.js version: ${nodeVersion}`);
}

async function ensureCliBuild() {
  const packageRoot = process.cwd();
  const distPath = join(packageRoot, 'dist');
  const packageJsonPath = join(packageRoot, 'package.json');
  
  // Check if package.json exists
  try {
    await fs.access(packageJsonPath);
  } catch {
    throw new Error('package.json not found - ensure running from package root');
  }
  
  // Check if dist directory exists
  try {
    await fs.access(distPath);
    console.log('✅ CLI build directory exists');
  } catch {
    console.log('🔨 Building CLI...');
    
    try {
      const result = await execaCommand('bun run build', {
        cwd: packageRoot,
        timeout: SETUP_TIMEOUT,
      });
      
      if (result.exitCode !== 0) {
        throw new Error(`Build failed: ${result.stderr}`);
      }
      
      console.log('✅ CLI build completed');
    } catch (error) {
      throw new Error(`Failed to build CLI: ${error}`);
    }
  }
  
  // Validate main entry file exists
  const packageJson = JSON.parse(await fs.readFile(packageJsonPath, 'utf-8'));
  if (packageJson.main) {
    const mainPath = join(packageRoot, packageJson.main);
    try {
      await fs.access(mainPath);
      console.log('✅ CLI main entry file exists');
    } catch {
      throw new Error(`CLI main entry file not found: ${packageJson.main}`);
    }
  }
}

async function validateTestDirectories() {
  const requiredDirs = [
    'tests/phase0',
    'tests/phase0/config',
    'tests/phase0/docs',
    'tests/phase0/distribution',
    'tests/phase0/smoke',
    'tests/phase0/utils',
    'tests/phase0/scripts',
  ];
  
  for (const dir of requiredDirs) {
    try {
      await fs.access(dir);
      console.log(`✅ Test directory exists: ${dir}`);
    } catch {
      throw new Error(`Required test directory not found: ${dir}`);
    }
  }
}

async function setupEnvironmentVariables() {
  // Set test-specific environment variables
  process.env.NODE_ENV = 'test';
  process.env.TEST_PHASE = '0';
  process.env.FORCE_COLOR = '1'; // Ensure colored output in tests
  
  // Set default values for optional environment variables
  if (!process.env.TEST_TIMEOUT) {
    process.env.TEST_TIMEOUT = '30000';
  }
  
  if (!process.env.CLEANUP_ON_EXIT) {
    process.env.CLEANUP_ON_EXIT = 'true';
  }
  
  // Validate required environment variables for full testing
  const optionalEnvVars = [
    'GITHUB_TOKEN',
    'GITHUB_REGISTRY',
  ];
  
  const missingOptional = optionalEnvVars.filter(env => !process.env[env]);
  
  if (missingOptional.length > 0) {
    console.warn(`⚠️  Optional environment variables not set: ${missingOptional.join(', ')}`);
    console.warn('Some tests may be skipped or run in mock mode');
  }
  
  console.log('✅ Environment variables configured');
}

async function createTestOutputDirectory() {
  const outputDir = join(process.cwd(), 'test-output');
  
  try {
    await fs.mkdir(outputDir, { recursive: true });
    console.log('✅ Test output directory created');
  } catch (error) {
    console.warn(`⚠️  Could not create test output directory: ${error}`);
  }
  
  // Create subdirectories for different types of output
  const subDirs = [
    'coverage',
    'reports',
    'artifacts',
  ];
  
  for (const subDir of subDirs) {
    try {
      await fs.mkdir(join(outputDir, subDir), { recursive: true });
    } catch {
      // Non-critical
    }
  }
}

// Handle direct execution
if (require.main === module) {
  setup().catch((error) => {
    console.error('Setup failed:', error);
    process.exit(1);
  });
}