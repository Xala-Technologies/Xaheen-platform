/**
 * Test Project Helpers
 * Utilities for creating and managing test projects
 */

import { join } from 'path';
import { mkdir, writeFile, rm } from 'fs/promises';
import { existsSync } from 'fs';
import type { PackageManagerName, TestProjectConfig } from '../config/test-config';
import { executeCommand, installDependencies } from './package-manager-utils';

export interface TestProject {
  readonly name: string;
  readonly path: string;
  readonly packageManager: PackageManagerName;
  readonly framework: string;
  readonly cleanup: () => Promise<void>;
}

export interface CreateTestProjectOptions {
  readonly name: string;
  readonly framework: 'nextjs' | 'express' | 'vue' | 'react' | 'svelte';
  readonly packageManager: PackageManagerName;
  readonly basePath: string;
  readonly features?: string[];
  readonly dependencies?: Record<string, string>;
  readonly devDependencies?: Record<string, string>;
  readonly scripts?: Record<string, string>;
}

/**
 * Create a test project with the specified configuration
 */
export async function createTestProject(options: CreateTestProjectOptions): Promise<TestProject> {
  const projectPath = join(options.basePath, options.name);
  await mkdir(projectPath, { recursive: true });
  
  try {
    // Generate package.json based on framework
    const packageJson = await generatePackageJson(options);
    
    await writeFile(
      join(projectPath, 'package.json'),
      JSON.stringify(packageJson, null, 2)
    );
    
    // Generate framework-specific files
    await generateFrameworkFiles(options, projectPath);
    
    return {
      name: options.name,
      path: projectPath,
      packageManager: options.packageManager,
      framework: options.framework,
      cleanup: async () => {
        if (existsSync(projectPath)) {
          await rm(projectPath, { recursive: true, force: true });
        }
      },
    };
  } catch (error) {
    // Cleanup on error
    if (existsSync(projectPath)) {
      await rm(projectPath, { recursive: true, force: true });
    }
    throw error;
  }
}

/**
 * Generate package.json for different frameworks
 */
async function generatePackageJson(options: CreateTestProjectOptions): Promise<any> {
  const basePackageJson = {
    name: options.name,
    version: '1.0.0',
    private: true,
  };
  
  switch (options.framework) {
    case 'nextjs':
      return {
        ...basePackageJson,
        scripts: {
          dev: 'next dev',
          build: 'next build',
          start: 'next start',
          lint: 'next lint',
          ...options.scripts,
        },
        dependencies: {
          next: '^14.0.0',
          react: '^18.0.0',
          'react-dom': '^18.0.0',
          ...options.dependencies,
        },
        devDependencies: {
          '@types/node': '^20.0.0',
          '@types/react': '^18.0.0',
          '@types/react-dom': '^18.0.0',
          eslint: '^8.0.0',
          'eslint-config-next': '^14.0.0',
          typescript: '^5.0.0',
          ...options.devDependencies,
        },
      };
      
    case 'express':
      return {
        ...basePackageJson,
        main: 'index.js',
        scripts: {
          dev: 'node index.js',
          start: 'node index.js',
          ...options.scripts,
        },
        dependencies: {
          express: '^4.18.0',
          cors: '^2.8.5',
          ...options.dependencies,
        },
        devDependencies: {
          '@types/express': '^4.17.0',
          '@types/cors': '^2.8.0',
          '@types/node': '^20.0.0',
          typescript: '^5.0.0',
          ...options.devDependencies,
        },
      };
      
    case 'vue':
      return {
        ...basePackageJson,
        scripts: {
          dev: 'vite',
          build: 'vite build',
          preview: 'vite preview',
          ...options.scripts,
        },
        dependencies: {
          vue: '^3.3.0',
          ...options.dependencies,
        },
        devDependencies: {
          '@vitejs/plugin-vue': '^4.2.0',
          vite: '^4.4.0',
          typescript: '^5.0.0',
          ...options.devDependencies,
        },
      };
      
    case 'react':
      return {
        ...basePackageJson,
        scripts: {
          dev: 'vite',
          build: 'vite build',
          preview: 'vite preview',
          ...options.scripts,
        },
        dependencies: {
          react: '^18.2.0',
          'react-dom': '^18.2.0',
          ...options.dependencies,
        },
        devDependencies: {
          '@types/react': '^18.2.0',
          '@types/react-dom': '^18.2.0',
          '@vitejs/plugin-react': '^4.0.0',
          vite: '^4.4.0',
          typescript: '^5.0.0',
          ...options.devDependencies,
        },
      };
      
    case 'svelte':
      return {
        ...basePackageJson,
        scripts: {
          dev: 'vite dev',
          build: 'vite build',
          preview: 'vite preview',
          ...options.scripts,
        },
        dependencies: {
          ...options.dependencies,
        },
        devDependencies: {
          '@sveltejs/adapter-auto': '^2.0.0',
          '@sveltejs/kit': '^1.20.4',
          svelte: '^4.0.5',
          typescript: '^5.0.0',
          vite: '^4.4.0',
          ...options.devDependencies,
        },
      };
      
    default:
      throw new Error(`Unsupported framework: ${options.framework}`);
  }
}

/**
 * Generate framework-specific project files
 */
async function generateFrameworkFiles(options: CreateTestProjectOptions, projectPath: string): Promise<void> {
  switch (options.framework) {
    case 'nextjs':
      await generateNextJsFiles(projectPath);
      break;
      
    case 'express':
      await generateExpressFiles(projectPath);
      break;
      
    case 'vue':
      await generateVueFiles(projectPath);
      break;
      
    case 'react':
      await generateReactFiles(projectPath);
      break;
      
    case 'svelte':
      await generateSvelteFiles(projectPath);
      break;
  }
}

/**
 * Generate Next.js project files
 */
async function generateNextJsFiles(projectPath: string): Promise<void> {
  // Create app directory structure
  await mkdir(join(projectPath, 'app'), { recursive: true });
  await mkdir(join(projectPath, 'public'), { recursive: true });
  
  // app/layout.tsx
  const layoutContent = `import './globals.css'

export const metadata = {
  title: 'Test Next.js App',
  description: 'Generated by Xaheen CLI test suite',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  )
}`;
  
  // app/page.tsx
  const pageContent = `export default function Home() {
  return (
    <main>
      <h1>Test Next.js Application</h1>
      <p>This is a test application generated by Xaheen CLI tests.</p>
    </main>
  )
}`;
  
  // app/globals.css
  const cssContent = `* {
  box-sizing: border-box;
  padding: 0;
  margin: 0;
}

body {
  font-family: system-ui, sans-serif;
  padding: 2rem;
}

main {
  max-width: 800px;
  margin: 0 auto;
}`;
  
  // next.config.js
  const nextConfigContent = `/** @type {import('next').NextConfig} */
const nextConfig = {}

module.exports = nextConfig`;
  
  await writeFile(join(projectPath, 'app', 'layout.tsx'), layoutContent);
  await writeFile(join(projectPath, 'app', 'page.tsx'), pageContent);
  await writeFile(join(projectPath, 'app', 'globals.css'), cssContent);
  await writeFile(join(projectPath, 'next.config.js'), nextConfigContent);
}

/**
 * Generate Express.js project files
 */
async function generateExpressFiles(projectPath: string): Promise<void> {
  const serverContent = `const express = require('express');
const cors = require('cors');

const app = express();
const port = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());

app.get('/', (req, res) => {
  res.json({ 
    message: 'Test Express server running',
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV || 'development'
  });
});

app.get('/health', (req, res) => {
  res.json({ status: 'ok', uptime: process.uptime() });
});

app.listen(port, () => {
  console.log(\`Server running on port \${port}\`);
});`;
  
  await writeFile(join(projectPath, 'index.js'), serverContent);
}

/**
 * Generate Vue project files
 */
async function generateVueFiles(projectPath: string): Promise<void> {
  await mkdir(join(projectPath, 'src'), { recursive: true });
  await mkdir(join(projectPath, 'public'), { recursive: true });
  
  // vite.config.js
  const viteConfigContent = `import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'

export default defineConfig({
  plugins: [vue()],
})`;
  
  // index.html
  const indexHtmlContent = `<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>Test Vue App</title>
  </head>
  <body>
    <div id="app"></div>
    <script type="module" src="/src/main.js"></script>
  </body>
</html>`;
  
  // src/main.js
  const mainJsContent = `import { createApp } from 'vue'
import App from './App.vue'

createApp(App).mount('#app')`;
  
  // src/App.vue
  const appVueContent = `<template>
  <div id="app">
    <h1>Test Vue Application</h1>
    <p>This is a test application generated by Xaheen CLI tests.</p>
  </div>
</template>

<script>
export default {
  name: 'App'
}
</script>

<style>
#app {
  font-family: Avenir, Helvetica, Arial, sans-serif;
  text-align: center;
  color: #2c3e50;
  margin-top: 60px;
}
</style>`;
  
  await writeFile(join(projectPath, 'vite.config.js'), viteConfigContent);
  await writeFile(join(projectPath, 'index.html'), indexHtmlContent);
  await writeFile(join(projectPath, 'src', 'main.js'), mainJsContent);
  await writeFile(join(projectPath, 'src', 'App.vue'), appVueContent);
}

/**
 * Generate React project files
 */
async function generateReactFiles(projectPath: string): Promise<void> {
  await mkdir(join(projectPath, 'src'), { recursive: true });
  await mkdir(join(projectPath, 'public'), { recursive: true });
  
  // vite.config.js
  const viteConfigContent = `import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
})`;
  
  // index.html
  const indexHtmlContent = `<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>Test React App</title>
  </head>
  <body>
    <div id="root"></div>
    <script type="module" src="/src/main.tsx"></script>
  </body>
</html>`;
  
  // src/main.tsx
  const mainTsxContent = `import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App'

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
)`;
  
  // src/App.tsx
  const appTsxContent = `import React from 'react'

function App() {
  return (
    <div style={{ padding: '2rem', textAlign: 'center' }}>
      <h1>Test React Application</h1>
      <p>This is a test application generated by Xaheen CLI tests.</p>
    </div>
  )
}

export default App`;
  
  await writeFile(join(projectPath, 'vite.config.js'), viteConfigContent);
  await writeFile(join(projectPath, 'index.html'), indexHtmlContent);
  await writeFile(join(projectPath, 'src', 'main.tsx'), mainTsxContent);
  await writeFile(join(projectPath, 'src', 'App.tsx'), appTsxContent);
}

/**
 * Generate Svelte project files
 */
async function generateSvelteFiles(projectPath: string): Promise<void> {
  await mkdir(join(projectPath, 'src'), { recursive: true });
  await mkdir(join(projectPath, 'static'), { recursive: true });
  
  // svelte.config.js
  const svelteConfigContent = `import adapter from '@sveltejs/adapter-auto';

const config = {
  kit: {
    adapter: adapter()
  }
};

export default config;`;
  
  // vite.config.js
  const viteConfigContent = `import { sveltekit } from '@sveltejs/kit/vite';
import { defineConfig } from 'vite';

export default defineConfig({
  plugins: [sveltekit()]
});`;
  
  // src/app.html
  const appHtmlContent = `<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="utf-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1" />
    <title>Test Svelte App</title>
    %sveltekit.head%
  </head>
  <body data-sveltekit-preload-data="hover">
    <div style="display: contents">%sveltekit.body%</div>
  </body>
</html>`;
  
  // src/routes/+page.svelte
  await mkdir(join(projectPath, 'src', 'routes'), { recursive: true });
  const pageContent = `<h1>Test Svelte Application</h1>
<p>This is a test application generated by Xaheen CLI tests.</p>

<style>
  h1 {
    text-align: center;
    color: #333;
    font-family: system-ui, sans-serif;
  }
  
  p {
    text-align: center;
    margin-top: 1rem;
  }
</style>`;
  
  await writeFile(join(projectPath, 'svelte.config.js'), svelteConfigContent);
  await writeFile(join(projectPath, 'vite.config.js'), viteConfigContent);
  await writeFile(join(projectPath, 'src', 'app.html'), appHtmlContent);
  await writeFile(join(projectPath, 'src', 'routes', '+page.svelte'), pageContent);
}

/**
 * Install dependencies for a test project
 */
export async function installTestProjectDependencies(
  project: TestProject, 
  timeout = 60000
): Promise<{ success: boolean; duration: number; error?: string }> {
  const startTime = Date.now();
  
  try {
    const result = await installDependencies(project.packageManager, project.path, timeout);
    const duration = Date.now() - startTime;
    
    return {
      success: result.exitCode === 0,
      duration,
      error: result.exitCode !== 0 ? result.stderr : undefined,
    };
  } catch (error) {
    const duration = Date.now() - startTime;
    return {
      success: false,
      duration,
      error: error instanceof Error ? error.message : String(error),
    };
  }
}

/**
 * Build a test project
 */
export async function buildTestProject(
  project: TestProject,
  timeout = 120000
): Promise<{ success: boolean; duration: number; error?: string }> {
  const startTime = Date.now();
  
  try {
    const result = await executeCommand('npm run build', project.path, timeout);
    const duration = Date.now() - startTime;
    
    return {
      success: result.exitCode === 0,
      duration,
      error: result.exitCode !== 0 ? result.stderr : undefined,
    };
  } catch (error) {
    const duration = Date.now() - startTime;
    return {
      success: false,
      duration,
      error: error instanceof Error ? error.message : String(error),
    };
  }
}

/**
 * Create multiple test projects with different configurations
 */
export async function createTestProjectMatrix(
  basePath: string,
  configurations: Array<{
    framework: CreateTestProjectOptions['framework'];
    packageManager: PackageManagerName;
  }>
): Promise<TestProject[]> {
  const projects: TestProject[] = [];
  
  for (const [index, config] of configurations.entries()) {
    const projectName = `test-project-${config.framework}-${config.packageManager}-${index}`;
    
    const project = await createTestProject({
      name: projectName,
      framework: config.framework,
      packageManager: config.packageManager,
      basePath,
    });
    
    projects.push(project);
  }
  
  return projects;
}

/**
 * Cleanup multiple test projects
 */
export async function cleanupTestProjects(projects: TestProject[]): Promise<void> {
  await Promise.all(projects.map(project => project.cleanup()));
}