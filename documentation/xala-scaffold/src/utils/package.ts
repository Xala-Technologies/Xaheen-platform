import { createRequire } from 'module';
import path from 'path';
import { fileURLToPath } from 'url';
import { fileExists } from './fs.js';

// Package.json interface
interface PackageJson {
  name: string;
  version: string;
  description?: string;
  [key: string]: any;
}

// Cache for package.json
let packageJsonCache: PackageJson | null = null;

// Get package.json
export async function getPackageJson(): Promise<PackageJson> {
  if (packageJsonCache) {
    return packageJsonCache;
  }
  
  const require = createRequire(import.meta.url);
  const __dirname = path.dirname(fileURLToPath(import.meta.url));
  
  // Try multiple paths to find package.json
  const possiblePaths = [
    path.resolve(__dirname, '../../package.json'),
    path.resolve(process.cwd(), 'package.json'),
    path.resolve(__dirname, '../package.json'),
    path.resolve(__dirname, '../../../package.json'),
  ];
  
  for (const packagePath of possiblePaths) {
    if (await fileExists(packagePath)) {
      try {
        packageJsonCache = require(packagePath);
        return packageJsonCache;
      } catch (error) {
        // Continue to next path
      }
    }
  }
  
  // Fallback to default values
  packageJsonCache = {
    name: '@xala-technologies/scaffold-cli',
    version: '1.0.0-alpha.1',
    description: 'Enterprise-grade frontend scaffolding CLI',
  };
  
  return packageJsonCache;
}

// Get package version
export async function getVersion(): Promise<string> {
  const pkg = await getPackageJson();
  return pkg.version;
}

// Get package name
export async function getName(): Promise<string> {
  const pkg = await getPackageJson();
  return pkg.name;
}

// Get package description
export async function getDescription(): Promise<string> {
  const pkg = await getPackageJson();
  return pkg.description || 'Enterprise-grade frontend scaffolding';
}