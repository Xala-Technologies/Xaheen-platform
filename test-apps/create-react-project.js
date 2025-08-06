const fs = require('fs').promises;
const path = require('path');
const { existsSync, mkdirSync } = require('fs');

async function createReactProject() {
  console.log('🚀 Creating React project with Xaheen CLI templates...');
  
  const projectName = 'test-react-generated';
  const projectPath = path.join(__dirname, projectName);
  
  // Clean up existing project
  if (existsSync(projectPath)) {
    await fs.rm(projectPath, { recursive: true, force: true });
  }
  
  // Create project structure
  const appsWebPath = path.join(projectPath, 'apps', 'web');
  mkdirSync(appsWebPath, { recursive: true });
  mkdirSync(path.join(projectPath, 'packages'), { recursive: true });
  
  console.log('📁 Created project directory structure');
  
  // Template variables
  const variables = {
    name: 'web',
    title: 'Test React App',
    description: 'A test React application generated with Xaheen CLI',
    port: '3000',
    packageManager: 'pnpm'
  };
  
  // Generate from templates
  const templatesPath = path.resolve(__dirname, '../packages/xaheen-cli/templates');
  const reactTemplatePath = path.join(templatesPath, 'frontend', 'react');
  
  console.log('📂 Looking for React template at:', reactTemplatePath);
  
  if (!existsSync(reactTemplatePath)) {
    console.error('❌ React template not found, templates need to be created');
    return;
  }
  
  await generateFromTemplate(reactTemplatePath, appsWebPath, variables);
  
  // Create root package.json
  const rootPackageJson = {
    name: projectName,
    private: true,
    workspaces: ['apps/*', 'packages/*'],
    scripts: {
      dev: 'turbo dev',
      build: 'turbo build',
      lint: 'turbo lint',
      'type-check': 'turbo type-check'
    },
    devDependencies: {
      turbo: '^2.5.5',
      typescript: '^5.7.2',
      '@xala-technologies/ui-system': '^6.1.0'
    },
    packageManager: 'pnpm@latest'
  };
  
  await fs.writeFile(
    path.join(projectPath, 'package.json'),
    JSON.stringify(rootPackageJson, null, 2)
  );
  
  console.log('✅ React project generated successfully!');
  console.log('📂 Project location:', projectPath);
}

async function generateFromTemplate(templatePath, targetPath, variables) {
  const entries = await fs.readdir(templatePath, { withFileTypes: true });
  
  for (const entry of entries) {
    const sourcePath = path.join(templatePath, entry.name);
    
    if (entry.isDirectory()) {
      const targetDir = path.join(targetPath, entry.name);
      mkdirSync(targetDir, { recursive: true });
      await generateFromTemplate(sourcePath, targetDir, variables);
    } else if (entry.isFile()) {
      const content = await fs.readFile(sourcePath, 'utf-8');
      const isTemplate = entry.name.endsWith('.hbs');
      
      let processedContent = content;
      if (isTemplate) {
        // Simple template replacement
        for (const [key, value] of Object.entries(variables)) {
          const regex = new RegExp(`{{${key}}}`, 'g');
          processedContent = processedContent.replace(regex, String(value));
        }
      }
      
      const finalName = isTemplate ? entry.name.replace(/\.hbs$/, '') : entry.name;
      const targetFilePath = path.join(targetPath, finalName);
      
      await fs.writeFile(targetFilePath, processedContent);
      console.log('   ✨ Generated:', path.relative(targetPath, targetFilePath));
    }
  }
}

createReactProject().catch(console.error);