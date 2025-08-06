const fs = require('fs').promises;
const path = require('path');
const { existsSync, mkdirSync } = require('fs');

async function createFullstackProject() {
  console.log('🚀 Creating full-stack project with Xaheen CLI templates...');
  
  const projectName = 'test-fullstack-generated';
  const projectPath = path.join(__dirname, projectName);
  
  // Clean up existing project
  if (existsSync(projectPath)) {
    await fs.rm(projectPath, { recursive: true, force: true });
  }
  
  // Create project structure
  const appsWebPath = path.join(projectPath, 'apps', 'web');
  const appsApiPath = path.join(projectPath, 'apps', 'api');
  mkdirSync(appsWebPath, { recursive: true });
  mkdirSync(appsApiPath, { recursive: true });
  mkdirSync(path.join(projectPath, 'packages'), { recursive: true });
  
  console.log('📁 Created full-stack project directory structure');
  
  // Frontend template variables
  const frontendVariables = {
    name: 'web',
    title: 'Test Full-Stack App',
    description: 'A test full-stack application generated with Xaheen CLI',
    port: '3000',
    packageManager: 'pnpm'
  };
  
  // Backend template variables
  const backendVariables = {
    name: 'api',
    title: 'Test Full-Stack API',
    description: 'A test backend API for the full-stack application',
    port: '3001',
    packageManager: 'pnpm'
  };
  
  const templatesPath = path.resolve(__dirname, '../packages/xaheen-cli/templates');
  
  // Generate frontend (Next.js)
  console.log('🎨 Generating frontend application...');
  const nextjsTemplatePath = path.join(templatesPath, 'frontend', 'nextjs');
  await generateFromTemplate(nextjsTemplatePath, appsWebPath, frontendVariables);
  
  // Generate backend (Express.js with fallback)
  console.log('🔧 Generating backend API...');
  const backendTemplatePath = path.join(templatesPath, 'backend', 'express');
  
  if (!existsSync(backendTemplatePath)) {
    console.log('   Using basic backend structure generator');
    await createBasicBackendStructure(appsApiPath, backendVariables);
  } else {
    await generateFromTemplate(backendTemplatePath, appsApiPath, backendVariables);
  }
  
  // Create root package.json
  const rootPackageJson = {
    name: projectName,
    private: true,
    workspaces: ['apps/*', 'packages/*'],
    scripts: {
      dev: 'turbo dev',
      'dev:web': 'turbo dev --filter=web',
      'dev:api': 'turbo dev --filter=api',
      build: 'turbo build',
      start: 'turbo start',
      lint: 'turbo lint',
      'type-check': 'turbo type-check',
      test: 'turbo test'
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
  
  // Create turbo.json for full-stack
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
      start: {
        dependsOn: ['build']
      },
      lint: {},
      'type-check': {},
      test: {}
    }
  };
  
  await fs.writeFile(
    path.join(projectPath, 'turbo.json'),
    JSON.stringify(turboJson, null, 2)
  );
  
  // Create full-stack README
  const readme = `# ${projectName}

This is a full-stack monorepo project created with Xaheen CLI v3.0.0.

## Architecture

- **Frontend**: Next.js application (apps/web)
- **Backend**: Express.js API (apps/api)
- **Shared**: Common packages and types (packages/)

## Getting Started

1. Install dependencies:
   \`\`\`bash
   pnpm install
   \`\`\`

2. Start all services:
   \`\`\`bash
   pnpm dev
   \`\`\`

3. Or start services individually:
   \`\`\`bash
   pnpm dev:web    # Frontend only (http://localhost:3000)
   pnpm dev:api    # Backend only (http://localhost:3001)
   \`\`\`

## Project Structure

- \`apps/web/\` - Next.js frontend application
- \`apps/api/\` - Express.js backend API
- \`packages/\` - Shared packages and libraries
- \`turbo.json\` - Turborepo configuration
- \`package.json\` - Root workspace configuration

## API Endpoints

- \`GET http://localhost:3001/\` - Welcome message
- \`GET http://localhost:3001/health\` - Health check

## Frontend Routes

- \`http://localhost:3000/\` - Home page

## Commands

- \`pnpm dev\` - Start all services in development
- \`pnpm build\` - Build all applications
- \`pnpm start\` - Start all applications in production
- \`pnpm lint\` - Lint all applications
- \`pnpm type-check\` - Type check all applications
- \`pnpm test\` - Run tests for all applications

## Development

### Adding New Features
1. Frontend changes: Edit files in \`apps/web/\`
2. Backend changes: Edit files in \`apps/api/\`
3. Shared code: Add to \`packages/\`

### Environment Variables
- Frontend: Create \`apps/web/.env.local\`
- Backend: Create \`apps/api/.env\`

## Deployment

This full-stack application can be deployed to various platforms:
- Frontend: Vercel, Netlify, or any static hosting
- Backend: Railway, Render, Heroku, or any Node.js hosting
- Database: Add database services as needed

## Next Steps

1. Set up database integration
2. Add authentication
3. Implement API endpoints
4. Add testing
5. Set up CI/CD pipeline
`;
  
  await fs.writeFile(path.join(projectPath, 'README.md'), readme);
  
  console.log('✅ Full-stack project generated successfully!');
  console.log('📂 Project location:', projectPath);
  console.log('');
  console.log('🎉 Next steps:');
  console.log(`   cd ${projectName}`);
  console.log('   pnpm install');
  console.log('   pnpm dev');
  console.log('');
  console.log('🌐 Services will be available at:');
  console.log('   Frontend: http://localhost:3000');
  console.log('   Backend:  http://localhost:3001');
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

  // Create TypeScript config
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

  // Create src directory and server
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
app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:3000',
  credentials: true
}));
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
    frontend: process.env.FRONTEND_URL || 'http://localhost:3000'
  });
});

app.get('/health', (req, res) => {
  res.json({ 
    status: 'OK', 
    timestamp: new Date().toISOString(),
    uptime: process.uptime()
  });
});

// API routes
app.get('/api/test', (req, res) => {
  res.json({ 
    message: 'API is working!',
    data: { test: true }
  });
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
  console.log(\`🌐 Frontend expected at: \${process.env.FRONTEND_URL || 'http://localhost:3000'}\`);
});

export default app;
`;

  await fs.writeFile(path.join(srcPath, 'index.ts'), indexContent);
  console.log('   ✨ Generated: package.json');
  console.log('   ✨ Generated: tsconfig.json');
  console.log('   ✨ Generated: src/index.ts');
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

createFullstackProject().catch(console.error);