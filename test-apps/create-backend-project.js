const fs = require('fs').promises;
const path = require('path');
const { existsSync, mkdirSync } = require('fs');

async function createBackendProject() {
  console.log('🚀 Creating backend project with Xaheen CLI templates...');
  
  const projectName = 'test-backend-generated';
  const projectPath = path.join(__dirname, projectName);
  
  // Clean up existing project
  if (existsSync(projectPath)) {
    await fs.rm(projectPath, { recursive: true, force: true });
  }
  
  // Create project structure
  const appsApiPath = path.join(projectPath, 'apps', 'api');
  mkdirSync(appsApiPath, { recursive: true });
  mkdirSync(path.join(projectPath, 'packages'), { recursive: true });
  
  console.log('📁 Created project directory structure');
  
  // Template variables
  const variables = {
    name: 'api',
    title: 'Test Backend API',
    description: 'A test backend API generated with Xaheen CLI',
    port: '3001',
    packageManager: 'pnpm'
  };
  
  // Generate from templates
  const templatesPath = path.resolve(__dirname, '../packages/xaheen-cli/templates');
  const backendTemplatePath = path.join(templatesPath, 'backend', 'express');
  
  console.log('📂 Looking for Express template at:', backendTemplatePath);
  
  if (!existsSync(backendTemplatePath)) {
    console.log('⚠️  Express template not found, using basic structure generator');
    
    // Create basic backend structure
    await createBasicBackendStructure(appsApiPath, variables);
  } else {
    await generateFromTemplate(backendTemplatePath, appsApiPath, variables);
  }
  
  // Create root package.json
  const rootPackageJson = {
    name: projectName,
    private: true,
    workspaces: ['apps/*', 'packages/*'],
    scripts: {
      dev: 'turbo dev',
      build: 'turbo build',
      start: 'turbo start',
      test: 'turbo test'
    },
    devDependencies: {
      turbo: '^2.5.5',
      typescript: '^5.7.2'
    },
    packageManager: 'pnpm@latest'
  };
  
  await fs.writeFile(
    path.join(projectPath, 'package.json'),
    JSON.stringify(rootPackageJson, null, 2)
  );
  
  console.log('✅ Backend project generated successfully!');
  console.log('📂 Project location:', projectPath);
}

async function createBasicBackendStructure(targetPath, variables) {
  // Create basic package.json
  const packageJson = {
    name: variables.name,
    version: '0.1.0',
    description: variables.description,
    main: 'dist/index.js',
    scripts: {
      start: 'node dist/index.js',
      dev: 'nodemon src/index.ts',
      build: 'tsc',
      test: 'jest'
    },
    dependencies: {
      express: '^4.18.2',
      cors: '^2.8.5',
      helmet: '^7.0.0',
      'express-rate-limit': '^6.7.0'
    },
    devDependencies: {
      '@types/express': '^4.17.17',
      '@types/cors': '^2.8.13',
      '@types/node': '^20.0.0',
      typescript: '^5.0.0',
      nodemon: '^3.0.0',
      'ts-node': '^10.9.0',
      jest: '^29.0.0',
      '@types/jest': '^29.0.0'
    }
  };

  await fs.writeFile(
    path.join(targetPath, 'package.json'),
    JSON.stringify(packageJson, null, 2)
  );

  // Create basic TypeScript config
  const tsConfig = {
    compilerOptions: {
      target: 'ES2020',
      module: 'commonjs',
      lib: ['ES2020'],
      outDir: './dist',
      rootDir: './src',
      strict: true,
      esModuleInterop: true,
      skipLibCheck: true,
      forceConsistentCasingInFileNames: true,
      resolveJsonModule: true
    },
    include: ['src/**/*'],
    exclude: ['node_modules', 'dist']
  };

  await fs.writeFile(
    path.join(targetPath, 'tsconfig.json'),
    JSON.stringify(tsConfig, null, 2)
  );

  // Create src directory and basic server
  const srcPath = path.join(targetPath, 'src');
  mkdirSync(srcPath, { recursive: true });

  const indexContent = `import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';

const app = express();
const port = process.env.PORT || ${variables.port || 3001};

// Middleware
app.use(helmet());
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // limit each IP to 100 requests per windowMs
});
app.use(limiter);

// Routes
app.get('/', (req, res) => {
  res.json({
    message: 'Welcome to ${variables.title}',
    version: '1.0.0',
    framework: 'Express.js',
  });
});

app.get('/health', (req, res) => {
  res.json({ status: 'OK', timestamp: new Date().toISOString() });
});

// 404 handler
app.use('*', (req, res) => {
  res.status(404).json({ error: 'Route not found' });
});

// Error handler
app.use((err: any, req: any, res: any, next: any) => {
  console.error(err.stack);
  res.status(500).json({ error: 'Something went wrong!' });
});

app.listen(port, () => {
  console.log(\`🚀 ${variables.title} server running on http://localhost:\${port}\`);
});

export default app;
`;

  await fs.writeFile(path.join(srcPath, 'index.ts'), indexContent);

  // Create README
  const readme = `# ${variables.title}

${variables.description}

## Getting Started

1. Install dependencies:
   \`\`\`bash
   ${variables.packageManager} install
   \`\`\`

2. Start development server:
   \`\`\`bash
   ${variables.packageManager} run dev
   \`\`\`

3. Build for production:
   \`\`\`bash
   ${variables.packageManager} run build
   ${variables.packageManager} start
   \`\`\`

## API Endpoints

- \`GET /\` - Welcome message
- \`GET /health\` - Health check

## Environment Variables

Create a \`.env\` file in the root directory:

\`\`\`
PORT=${variables.port || 3001}
NODE_ENV=development
\`\`\`

## Features

- ✅ **Express.js** - Fast, unopinionated web framework
- ✅ **TypeScript** - Strict type safety
- ✅ **CORS** - Cross-origin resource sharing
- ✅ **Helmet** - Security middleware
- ✅ **Rate Limiting** - Request rate limiting
- ✅ **Health Check** - API health endpoint
`;

  await fs.writeFile(path.join(targetPath, 'README.md'), readme);
  
  console.log('   ✨ Generated: package.json');
  console.log('   ✨ Generated: tsconfig.json');
  console.log('   ✨ Generated: src/index.ts');
  console.log('   ✨ Generated: README.md');
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

createBackendProject().catch(console.error);