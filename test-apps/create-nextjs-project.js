const fs = require('fs').promises;
const path = require('path');
const { existsSync, mkdirSync } = require('fs');

async function createNextjsProject() {
  console.log('🚀 Creating Next.js project with Xaheen CLI templates...');
  
  const projectName = 'test-nextjs-generated';
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
    title: 'Test Next.js App',
    description: 'A test Next.js application generated with Xaheen CLI',
    port: '3000',
    packageManager: 'pnpm'
  };
  
  // Generate from templates
  const templatesPath = path.resolve(__dirname, '../packages/xaheen-cli/templates');
  const nextjsTemplatePath = path.join(templatesPath, 'frontend', 'nextjs');
  
  await generateFromTemplate(nextjsTemplatePath, appsWebPath, variables);
  
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
  
  // Create turbo.json
  const turboJson = {
    $schema: 'https://turbo.build/schema.json',
    tasks: {
      dev: {
        cache: false,
        persistent: true
      },
      build: {
        dependsOn: ['^build'],
        outputs: ['.next/**', '!.next/cache/**', 'dist/**']
      },
      lint: {},
      'type-check': {}
    }
  };
  
  await fs.writeFile(
    path.join(projectPath, 'turbo.json'),
    JSON.stringify(turboJson, null, 2)
  );
  
  // Create README
  const readme = `# ${projectName}

This is a monorepo project created with Xaheen CLI v3.0.0.

## Getting Started

1. Install dependencies:
   \`\`\`bash
   pnpm install
   \`\`\`

2. Start development servers:
   \`\`\`bash
   pnpm dev
   \`\`\`

3. Add more apps:
   \`\`\`bash
   xaheen add app <name> --platform <web|mobile|desktop>
   \`\`\`

## Project Structure

- \`apps/\` - Applications (web, mobile, desktop)
- \`packages/\` - Shared packages and libraries
- \`xaheen.config.json\` - Unified CLI configuration

## Commands

- \`xaheen service add <service>\` - Add a service
- \`xaheen component generate "<description>"\` - Generate AI components
- \`xaheen add app <name>\` - Add new application
- \`xaheen validate\` - Validate project structure
`;
  
  await fs.writeFile(path.join(projectPath, 'README.md'), readme);
  
  console.log('✅ Next.js project generated successfully!');
  console.log('📂 Project location:', projectPath);
  console.log('');
  console.log('🎉 Next steps:');
  console.log(`   cd ${projectName}`);
  console.log('   pnpm install');
  console.log('   pnpm dev');
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

createNextjsProject().catch(console.error);