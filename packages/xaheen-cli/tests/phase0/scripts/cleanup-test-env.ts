/**
 * Global Test Environment Cleanup
 * 
 * This script runs after all Phase 0 tests to clean up resources,
 * remove temporary files, and generate final reports.
 */

import { promises as fs } from 'fs';
import { join } from 'path';
import { tmpdir } from 'os';

export default async function cleanup() {
  console.log('🧹 Cleaning up Phase 0 test environment...');
  
  try {
    // Clean up temporary directories
    await cleanupTempDirectories();
    
    // Generate test summary
    await generateTestSummary();
    
    // Clean up environment variables
    await cleanupEnvironmentVariables();
    
    // Archive test artifacts if requested
    await archiveTestArtifacts();
    
    console.log('✅ Phase 0 test environment cleanup complete');
    
  } catch (error) {
    console.error('❌ Test environment cleanup failed:', error);
    // Don't exit with error code - cleanup failures shouldn't fail the build
  }
}

async function cleanupTempDirectories() {
  if (process.env.CLEANUP_ON_EXIT === 'false') {
    console.log('⏭️  Skipping temp directory cleanup (CLEANUP_ON_EXIT=false)');
    return;
  }
  
  const tempDirPrefix = 'xaheen-test';
  const systemTempDir = tmpdir();
  
  try {
    const entries = await fs.readdir(systemTempDir);
    const testDirs = entries.filter(entry => entry.startsWith(tempDirPrefix));
    
    let cleanedCount = 0;
    
    for (const testDir of testDirs) {
      try {
        const fullPath = join(systemTempDir, testDir);
        await fs.rm(fullPath, { recursive: true, force: true });
        cleanedCount++;
      } catch (error) {
        console.warn(`⚠️  Could not clean temp directory ${testDir}: ${error}`);
      }
    }
    
    if (cleanedCount > 0) {
      console.log(`✅ Cleaned up ${cleanedCount} temporary test directories`);
    }
    
  } catch (error) {
    console.warn(`⚠️  Could not clean temp directories: ${error}`);
  }
}

async function generateTestSummary() {
  const outputDir = join(process.cwd(), 'test-output');
  const summaryPath = join(outputDir, 'phase0-summary.json');
  
  try {
    const summary = {
      phase: 'Phase 0: Documentation & Distribution Validation',
      timestamp: new Date().toISOString(),
      environment: {
        nodeVersion: process.version,
        platform: process.platform,
        arch: process.arch,
        cwd: process.cwd(),
      },
      configuration: {
        packageManager: process.env.TEST_PACKAGE_MANAGER || 'bun',
        timeout: process.env.TEST_TIMEOUT || '30000',
        cleanupEnabled: process.env.CLEANUP_ON_EXIT !== 'false',
      },
      testCategories: [
        'Documentation Build & Lint',
        'Package Distribution',
        'Installation Validation',
        'CLI Smoke Tests',
      ],
      notes: [
        'Phase 0 validates documentation and distribution before functional testing',
        'All tests focus on build artifacts and basic CLI behavior',
        'No external dependencies or complex integrations tested in this phase',
      ],
    };
    
    await fs.mkdir(outputDir, { recursive: true });
    await fs.writeFile(summaryPath, JSON.stringify(summary, null, 2));
    
    console.log(`✅ Test summary generated: ${summaryPath}`);
    
  } catch (error) {
    console.warn(`⚠️  Could not generate test summary: ${error}`);
  }
}

async function cleanupEnvironmentVariables() {
  // Clean up test-specific environment variables
  const testEnvVars = [
    'TEST_PHASE',
    'TEST_TYPE',
    'TEST_TEMP_DIR',
  ];
  
  for (const envVar of testEnvVars) {
    delete process.env[envVar];
  }
  
  console.log('✅ Test environment variables cleaned up');
}

async function archiveTestArtifacts() {
  if (process.env.ARCHIVE_TEST_ARTIFACTS !== 'true') {
    return;
  }
  
  const outputDir = join(process.cwd(), 'test-output');
  const archiveDir = join(outputDir, 'archives');
  const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
  const archiveName = `phase0-${timestamp}`;
  const archivePath = join(archiveDir, archiveName);
  
  try {
    await fs.mkdir(archiveDir, { recursive: true });
    await fs.mkdir(archivePath, { recursive: true });
    
    // Copy test results and artifacts
    const artifactPaths = [
      join(outputDir, 'phase0-summary.json'),
      join(outputDir, 'phase0-junit.xml'),
      join(outputDir, 'phase0-results.json'),
    ];
    
    let archivedCount = 0;
    
    for (const artifactPath of artifactPaths) {
      try {
        await fs.access(artifactPath);
        const fileName = artifactPath.split('/').pop();
        await fs.copyFile(artifactPath, join(archivePath, fileName!));
        archivedCount++;
      } catch {
        // Artifact doesn't exist, skip
      }
    }
    
    if (archivedCount > 0) {
      console.log(`✅ Archived ${archivedCount} test artifacts to ${archivePath}`);
    }
    
  } catch (error) {
    console.warn(`⚠️  Could not archive test artifacts: ${error}`);
  }
}

// Handle direct execution
if (require.main === module) {
  cleanup().catch((error) => {
    console.error('Cleanup failed:', error);
    process.exit(1);
  });
}