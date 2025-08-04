# CLI v2 Commands Documentation

Technical reference for all Xaheen CLI v2 commands with implementation details and usage patterns.

## Command Architecture

### Command Registration
```typescript
// src/index.ts
import { Command } from 'commander';
import { createCommand } from './commands/create';
import { addCommand } from './commands/add';
import { removeCommand } from './commands/remove';
import { validateCommand } from './commands/validate';
import { bundleCommand } from './commands/bundle';
import { upgradeCommand } from './commands/upgrade';
import { doctorCommand } from './commands/doctor';

const program = new Command();

program
  .name('xaheen')
  .description('Xaheen CLI v2 - Enterprise development platform')
  .version('2.0.2');

// Register commands
program.addCommand(createCommand);
program.addCommand(addCommand);
program.addCommand(removeCommand);
program.addCommand(validateCommand);
program.addCommand(bundleCommand);
program.addCommand(upgradeCommand);
program.addCommand(doctorCommand);

export { program };
```

---

## create / new

Create new projects with intelligent service bundling.

### Implementation
```typescript
// src/commands/create.ts
export const createCommand = new Command("create")
  .alias("new")
  .description("Create a new project")
  .argument("[name]", "Project name")
  .option("-p, --preset <preset>", "Use a preset bundle")
  .option("-f, --framework <framework>", "Frontend framework")
  .option("-b, --backend <backend>", "Backend framework")
  .option("-d, --database <database>", "Database provider")
  .option("--no-install", "Skip dependency installation")
  .option("--no-git", "Skip git initialization")
  .option("--dry-run", "Preview what would be created")
  .action(async (name, options) => {
    const scaffolder = new ProjectScaffolder(registry, resolver, injector);
    const result = await scaffolder.createProject({ name, ...options });
    return result;
  });
```

### Project Configuration Flow
```typescript
async function getProjectConfig(name: string, options: any): Promise<ProjectConfig> {
  let projectName = name;
  
  // Interactive name prompt if not provided
  if (!projectName) {
    projectName = await text({
      message: "What is your project name?",
      validate: (value) => {
        if (!value) return "Project name is required";
        if (!/^[a-zA-Z0-9-_]+$/.test(value)) return "Invalid characters in project name";
        return;
      }
    });
  }
  
  // Interactive configuration if no preset
  if (!options.preset && !options.framework) {
    const framework = await select({
      message: "Which frontend framework?",
      options: [
        { value: "next", label: "Next.js - React with App Router" },
        { value: "nuxt", label: "Nuxt - Vue.js framework" },
        { value: "remix", label: "Remix - Web standards React" },
        { value: "svelte", label: "SvelteKit - Svelte framework" },
        { value: "angular", label: "Angular - Google's framework" }
      ]
    });
    options.framework = framework;
  }
  
  return {
    name: projectName,
    framework: options.framework,
    backend: options.backend,
    database: options.database,
    preset: options.preset,
    installDependencies: !options.noInstall,
    initGit: !options.noGit,
    dryRun: options.dryRun
  };
}
```

### Bundle Resolution
```typescript
async function resolveBundleForProject(options: ProjectConfig): Promise<ServiceBundle | null> {
  if (options.preset) {
    return await resolver.loadBundleByName(options.preset);
  }
  
  if (options.bundles) {
    return await resolver.createCustomBundle(options.bundles);
  }
  
  // Interactive bundle selection
  const bundleChoice = await select({
    message: "Choose a service bundle:",
    options: [
      { value: "saas-starter", label: "🚀 SaaS Starter - Essential features" },
      { value: "saas-professional", label: "💼 SaaS Professional - Advanced features" },
      { value: "marketing-site", label: "🌐 Marketing Site - Landing page" },
      { value: "dashboard-app", label: "📊 Dashboard App - Admin interface" },
      { value: "norwegian-gov", label: "🇳🇴 Norwegian Government - Compliance" },
      { value: "custom", label: "🔧 Custom - Choose services manually" }
    ]
  });
  
  if (bundleChoice === "custom") {
    return await createCustomBundle();
  }
  
  return await resolver.loadBundleByName(bundleChoice);
}
```

---

## add

Add services to existing projects with dependency resolution.

### Implementation
```typescript
// src/commands/add.ts
export const addCommand = new Command("add")
  .description("Add services to existing project")
  .argument("<service>", "Service type to add")
  .option("-p, --provider <provider>", "Service provider")
  .option("-c, --config <config>", "Configuration file")
  .option("--no-install", "Skip dependency installation")
  .option("--force", "Override compatibility checks")
  .option("--dry-run", "Preview changes")
  .action(async (service, options) => {
    await addServiceToProject(service, options);
  });

async function addServiceToProject(serviceType: string, options: any): Promise<void> {
  // Analyze current project
  const projectPath = process.cwd();
  const analysis = await analyzer.analyzeProject(projectPath);
  
  // Get available providers for service type
  const providers = await registry.listTemplates(serviceType as ServiceType);
  
  let provider = options.provider;
  if (!provider) {
    provider = await select({
      message: `Which ${serviceType} provider?`,
      options: providers.map(p => ({
        value: p.provider,
        label: `${p.provider} - ${p.description}`
      }))
    });
  }
  
  // Get service template
  const template = await registry.getTemplate(serviceType as ServiceType, provider);
  if (!template) {
    throw new Error(`Service ${serviceType}:${provider} not found`);
  }
  
  // Check compatibility
  if (!options.force) {
    const compatible = await checkCompatibility(template, analysis);
    if (!compatible.isCompatible) {
      consola.warn("Compatibility issues detected:");
      compatible.issues.forEach(issue => consola.warn(`- ${issue}`));
      
      const proceed = await confirm({
        message: "Continue anyway?",
        initialValue: false
      });
      
      if (!proceed) {
        consola.info("Operation cancelled");
        return;
      }
    }
  }
  
  // Create service configuration
  const serviceConfig = createServiceConfiguration(template, options);
  
  // Inject service
  if (options.dryRun) {
    previewServiceInjection(serviceConfig, projectPath);
  } else {
    await injector.injectService(serviceConfig, projectPath);
    consola.success(`Added ${serviceType}:${provider} to project`);
  }
}
```

### Service Compatibility Checking
```typescript
interface CompatibilityResult {
  isCompatible: boolean;
  issues: string[];
  warnings: string[];
  recommendations: string[];
}

async function checkCompatibility(
  template: ServiceTemplate, 
  analysis: ProjectAnalysis
): Promise<CompatibilityResult> {
  const issues: string[] = [];
  const warnings: string[] = [];
  const recommendations: string[] = [];
  
  // Framework compatibility
  if (template.frameworks.length > 0 && analysis.framework) {
    if (!template.frameworks.includes(analysis.framework)) {
      issues.push(`Service ${template.provider} is not compatible with ${analysis.framework}`);
    }
  }
  
  // Dependency conflicts
  for (const dep of template.dependencies) {
    const existingDep = analysis.packageJson.dependencies[dep.name];
    if (existingDep && !semver.satisfies(existingDep, dep.version)) {
      issues.push(`Dependency conflict: ${dep.name} requires ${dep.version}, found ${existingDep}`);
    }
  }
  
  // Service conflicts
  const conflictingServices = analysis.detectedServices.filter(existing => 
    existing.type === template.type && existing.provider !== template.provider
  );
  
  if (conflictingServices.length > 0) {
    warnings.push(`Existing ${template.type} service detected: ${conflictingServices[0].provider}`);
    recommendations.push(`Consider removing existing ${template.type} service first`);
  }
  
  return {
    isCompatible: issues.length === 0,
    issues,
    warnings,
    recommendations
  };
}
```

---

## remove

Remove services with dependency checking and cleanup.

### Implementation
```typescript
// src/commands/remove.ts
export const removeCommand = new Command("remove")
  .alias("rm")
  .description("Remove services from project")
  .argument("<service>", "Service type to remove")
  .option("-p, --provider <provider>", "Specific provider")
  .option("--force", "Force removal ignoring dependencies")
  .option("--clean", "Remove unused dependencies")
  .option("--dry-run", "Preview changes")
  .option("--backup", "Create backup before removal")
  .action(async (service, options) => {
    await removeServiceFromProject(service, options);
  });
```

### Dependency Graph Analysis
```typescript
class DependencyAnalyzer {
  async analyzeDependencies(projectPath: string): Promise<ServiceDependencyGraph> {
    const analysis = await analyzer.analyzeProject(projectPath);
    const graph = new Map<string, ServiceDependency>();
    
    // Build dependency graph
    for (const service of analysis.detectedServices) {
      const template = await registry.getTemplate(service.type, service.provider);
      if (!template) continue;
      
      const dependencies = template.dependencies.map(dep => ({
        serviceType: dep.serviceType,
        provider: dep.provider || 'any',
        required: dep.required || false
      }));
      
      graph.set(`${service.type}:${service.provider}`, {
        service,
        dependencies,
        dependents: []
      });
    }
    
    // Calculate dependents (reverse dependencies)
    for (const [serviceId, serviceDep] of graph.entries()) {
      for (const dep of serviceDep.dependencies) {
        const depId = `${dep.serviceType}:${dep.provider}`;
        const depService = graph.get(depId);
        if (depService) {
          depService.dependents.push(serviceId);
        }
      }
    }
    
    return graph;
  }
  
  async checkRemovalImpact(
    serviceToRemove: string, 
    graph: ServiceDependencyGraph
  ): Promise<RemovalImpact> {
    const service = graph.get(serviceToRemove);
    if (!service) {
      return { canRemove: false, blockers: [], affectedServices: [] };
    }
    
    const blockers: string[] = [];
    const affectedServices: string[] = [];
    
    // Check what depends on this service
    for (const dependent of service.dependents) {
      const dependentService = graph.get(dependent);
      if (dependentService) {
        const requiredDep = dependentService.dependencies.find(
          dep => `${dep.serviceType}:${dep.provider}` === serviceToRemove && dep.required
        );
        
        if (requiredDep) {
          blockers.push(dependent);
        } else {
          affectedServices.push(dependent);
        }
      }
    }
    
    return {
      canRemove: blockers.length === 0,
      blockers,
      affectedServices
    };
  }
}
```

---

## validate

Project health checks with auto-fix capabilities.

### Implementation
```typescript
// src/commands/validate.ts
export const validateCommand = new Command("validate")
  .description("Validate project health")
  .option("--fix", "Automatically fix issues")
  .option("-s, --services <services>", "Validate specific services")
  .option("-r, --report", "Generate detailed report")
  .option("-o, --output <file>", "Report output file")
  .option("--strict", "Enable strict validation")
  .action(async (options) => {
    await validateProject(options);
  });
```

### Validation Engine
```typescript
class ProjectValidator {
  private validators: Map<string, IValidator> = new Map();
  
  constructor() {
    this.registerValidators();
  }
  
  private registerValidators(): void {
    this.validators.set('dependencies', new DependencyValidator());
    this.validators.set('environment', new EnvironmentValidator());
    this.validators.set('configuration', new ConfigurationValidator());
    this.validators.set('security', new SecurityValidator());
    this.validators.set('performance', new PerformanceValidator());
    this.validators.set('compliance', new ComplianceValidator());
  }
  
  async validateProject(projectPath: string, options: ValidateOptions): Promise<ValidationResult> {
    const analysis = await analyzer.analyzeProject(projectPath);
    const results: ValidationResult[] = [];
    const fixes: AutoFix[] = [];
    
    // Run validators
    for (const [name, validator] of this.validators.entries()) {
      if (options.services && !options.services.includes(name)) {
        continue;
      }
      
      const result = await validator.validate(analysis, options);
      results.push(result);
      
      if (options.fix && result.autoFixes.length > 0) {
        fixes.push(...result.autoFixes);
      }
    }
    
    // Apply auto-fixes
    if (options.fix && fixes.length > 0) {
      await this.applyFixes(fixes, projectPath);
    }
    
    return {
      projectPath,
      validationResults: results,
      appliedFixes: fixes,
      healthScore: this.calculateHealthScore(results),
      validatedAt: new Date()
    };
  }
  
  private async applyFixes(fixes: AutoFix[], projectPath: string): Promise<void> {
    const limit = pLimit(3); // Apply fixes with concurrency limit
    
    await Promise.all(
      fixes.map(fix => limit(async () => {
        try {
          await fix.apply(projectPath);
          consola.success(`Applied fix: ${fix.description}`);
        } catch (error) {
          consola.error(`Failed to apply fix: ${fix.description}`, error);
        }
      }))
    );
  }
}
```

### Validation Types
```typescript
// Dependency validation
class DependencyValidator implements IValidator {
  async validate(analysis: ProjectAnalysis, options: ValidateOptions): Promise<ValidationResult> {
    const issues: ValidationIssue[] = [];
    const autoFixes: AutoFix[] = [];
    
    // Check for outdated dependencies
    const outdated = await this.checkOutdatedDependencies(analysis);
    for (const dep of outdated) {
      issues.push({
        type: 'warning',
        category: 'dependencies',
        message: `Dependency ${dep.name} is outdated (${dep.current} -> ${dep.latest})`,
        file: 'package.json',
        fix: new UpdateDependencyFix(dep.name, dep.latest)
      });
    }
    
    // Check for security vulnerabilities
    const vulnerabilities = await this.checkSecurityVulnerabilities(analysis);
    for (const vuln of vulnerabilities) {
      issues.push({
        type: 'error',
        category: 'security',
        message: `Security vulnerability in ${vuln.package}: ${vuln.description}`,
        severity: vuln.severity,
        fix: new FixVulnerabilityFix(vuln.package, vuln.fixVersion)
      });
    }
    
    return {
      validator: 'dependencies',
      status: issues.length === 0 ? 'passed' : 'failed',
      issues,
      autoFixes
    };
  }
}

// Environment validation
class EnvironmentValidator implements IValidator {
  async validate(analysis: ProjectAnalysis, options: ValidateOptions): Promise<ValidationResult> {
    const issues: ValidationIssue[] = [];
    const autoFixes: AutoFix[] = [];
    
    // Check for missing environment variables
    const requiredEnvVars = this.getRequiredEnvVars(analysis.detectedServices);
    const missingVars = requiredEnvVars.filter(env => !process.env[env.name]);
    
    for (const envVar of missingVars) {
      issues.push({
        type: 'error',
        category: 'environment',
        message: `Missing required environment variable: ${envVar.name}`,
        description: envVar.description,
        fix: new AddEnvironmentVariableFix(envVar.name, envVar.defaultValue)
      });
    }
    
    return {
      validator: 'environment',
      status: issues.length === 0 ? 'passed' : 'failed',
      issues,
      autoFixes
    };
  }
}
```

---

## bundle

Bundle management operations and custom bundle creation.

### Implementation
```typescript
// src/commands/bundle.ts
export const bundleCommand = new Command("bundle")
  .description("Manage service bundles")
  .addCommand(
    new Command("list")
      .description("List available bundles")
      .action(listBundles)
  )
  .addCommand(
    new Command("show")
      .description("Show bundle details")
      .argument("<name>", "Bundle name")
      .action(showBundle)
  )
  .addCommand(
    new Command("create")
      .description("Create custom bundle")
      .argument("<name>", "Bundle name")
      .option("-s, --services <services>", "Services to include")
      .option("-d, --description <desc>", "Bundle description")
      .action(createBundle)
  );
```

### Bundle Operations
```typescript
async function listBundles(): Promise<void> {
  const bundles = await resolver.getAllBundles();
  
  consola.info("Available Service Bundles:\n");
  
  const bundlesByCategory = groupBy(bundles, 'type');
  
  for (const [category, categoryBundles] of Object.entries(bundlesByCategory)) {
    consola.info(`${category.toUpperCase()}:`);
    
    for (const bundle of categoryBundles) {
      const serviceCount = bundle.services.length;
      const emoji = getBundleEmoji(bundle.type);
      
      console.log(`  ${emoji} ${bundle.displayName}`);
      console.log(`    ${bundle.description}`);
      console.log(`    Services: ${serviceCount} | Target: ${bundle.deploymentTargets.join(', ')}`);
      console.log();
    }
  }
}

async function showBundle(name: string): Promise<void> {
  const bundle = await resolver.loadBundleByName(name);
  if (!bundle) {
    consola.error(`Bundle '${name}' not found`);
    return;
  }
  
  const resolution = await resolver.resolveBundle(bundle);
  
  console.log(`${bundle.displayName}`);
  console.log(`${'-'.repeat(bundle.displayName.length)}`);
  console.log(`Description: ${bundle.description}`);
  console.log(`Version: ${bundle.version}`);
  console.log(`Type: ${bundle.type}`);
  console.log(`Services: ${bundle.services.length}`);
  console.log(`Deployment: ${bundle.deploymentTargets.join(', ')}`);
  
  if (bundle.compliance && bundle.compliance.length > 0) {
    console.log(`Compliance: ${bundle.compliance.join(', ')}`);
  }
  
  console.log('\nServices:');
  for (const service of resolution.resolvedServices) {
    console.log(`  • ${service.serviceType}: ${service.provider} v${service.version}`);
  }
  
  if (resolution.errors.length > 0) {
    console.log('\nErrors:');
    for (const error of resolution.errors) {
      consola.error(`  ${error}`);
    }
  }
  
  if (resolution.warnings.length > 0) {
    console.log('\nWarnings:');
    for (const warning of resolution.warnings) {
      consola.warn(`  ${warning}`);
    }
  }
}

async function createBundle(name: string, options: any): Promise<void> {
  let services = options.services;
  
  if (!services) {
    services = await multiselect({
      message: "Select services for the bundle:",
      options: await getAvailableServices()
    });
  } else {
    services = services.split(',');
  }
  
  const description = options.description || await text({
    message: "Bundle description:",
    validate: value => value ? undefined : "Description is required"
  });
  
  const bundle = await resolver.createCustomBundle(services);
  bundle.name = name;
  bundle.displayName = name.replace(/-/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
  bundle.description = description;
  
  await resolver.saveBundle(bundle);
  
  consola.success(`Created bundle '${name}' with ${services.length} services`);
}
```

---

## upgrade

Upgrade dependencies and services to latest versions.

### Implementation
```typescript
// src/commands/upgrade.ts
export const upgradeCommand = new Command("upgrade")
  .alias("up")
  .description("Upgrade dependencies and services")
  .argument("[service]", "Specific service to upgrade")
  .option("-a, --all", "Upgrade all services")
  .option("-i, --interactive", "Interactive upgrade")
  .option("--to <version>", "Target version")
  .option("--dry-run", "Preview upgrades")
  .option("--backup", "Create backup first")
  .action(async (service, options) => {
    await upgradeProject(service, options);
  });
```

### Upgrade Strategies
```typescript
class UpgradeManager {
  async analyzeUpgrades(projectPath: string): Promise<UpgradeAnalysis> {
    const analysis = await analyzer.analyzeProject(projectPath);
    const upgrades: ServiceUpgrade[] = [];
    
    for (const service of analysis.detectedServices) {
      const template = await registry.getTemplate(service.type, service.provider);
      if (!template) continue;
      
      const currentVersion = service.version || '0.0.0';
      const latestVersion = template.version;
      
      if (semver.gt(latestVersion, currentVersion)) {
        const upgrade: ServiceUpgrade = {
          serviceType: service.type,
          provider: service.provider,
          currentVersion,
          latestVersion,
          breaking: await this.hasBreakingChanges(service, currentVersion, latestVersion),
          dependencies: await this.getUpgradeDependencies(service, latestVersion)
        };
        
        upgrades.push(upgrade);
      }
    }
    
    return {
      projectPath,
      availableUpgrades: upgrades,
      totalUpgrades: upgrades.length,
      breakingChanges: upgrades.filter(u => u.breaking).length
    };
  }
  
  async performUpgrade(upgrade: ServiceUpgrade, options: UpgradeOptions): Promise<UpgradeResult> {
    const startTime = Date.now();
    
    try {
      // Create backup if requested
      if (options.backup) {
        await this.createBackup(options.projectPath, upgrade);
      }
      
      // Update service configuration
      await this.updateServiceConfiguration(upgrade, options);
      
      // Update dependencies
      await this.updateDependencies(upgrade.dependencies, options);
      
      // Run migration scripts if needed
      if (upgrade.breaking) {
        await this.runMigrationScripts(upgrade, options);
      }
      
      // Validate upgrade
      const validation = await this.validateUpgrade(upgrade, options);
      
      return {
        upgrade,
        success: validation.success,
        duration: Date.now() - startTime,
        changes: validation.changes,
        errors: validation.errors
      };
      
    } catch (error) {
      return {
        upgrade,
        success: false,
        duration: Date.now() - startTime,
        changes: [],
        errors: [error.message]
      };
    }
  }
}
```

---

## doctor

System and project diagnostics for troubleshooting.

### Implementation
```typescript
// src/commands/doctor.ts
export const doctorCommand = new Command("doctor")
  .alias("health")
  .description("System and project diagnostics")
  .option("-c, --check <checks>", "Specific checks to run")
  .option("--fix", "Auto-fix issues")
  .option("-r, --report", "Generate report")
  .option("-o, --output <file>", "Report output file")
  .option("--system", "System-wide checks")
  .option("--project", "Project-specific checks")
  .action(async (options) => {
    await runDiagnostics(options);
  });
```

### Diagnostic System
```typescript
class DiagnosticEngine {
  private diagnostics: Map<string, IDiagnostic> = new Map();
  
  constructor() {
    this.registerDiagnostics();
  }
  
  private registerDiagnostics(): void {
    // System diagnostics
    this.diagnostics.set('system', new SystemDiagnostic());
    this.diagnostics.set('registry', new RegistryDiagnostic());
    this.diagnostics.set('templates', new TemplateDiagnostic());
    
    // Project diagnostics
    this.diagnostics.set('dependencies', new DependencyDiagnostic());
    this.diagnostics.set('configuration', new ConfigurationDiagnostic());
    this.diagnostics.set('environment', new EnvironmentDiagnostic());
    this.diagnostics.set('permissions', new PermissionsDiagnostic());
  }
  
  async runDiagnostics(options: DiagnosticOptions): Promise<DiagnosticReport> {
    const results: DiagnosticResult[] = [];
    const fixes: DiagnosticFix[] = [];
    
    // Determine which diagnostics to run
    const toRun = this.getDiagnosticsToRun(options);
    
    // Run diagnostics
    for (const [name, diagnostic] of toRun) {
      const result = await diagnostic.run(options);
      results.push(result);
      
      if (options.fix && result.fixes.length > 0) {
        fixes.push(...result.fixes);
      }
    }
    
    // Apply fixes
    if (options.fix && fixes.length > 0) {
      await this.applyFixes(fixes);
    }
    
    // Generate report
    const report: DiagnosticReport = {
      timestamp: new Date(),
      system: await this.getSystemInfo(),
      project: await this.getProjectInfo(options.projectPath),
      results,
      appliedFixes: fixes,
      summary: this.generateSummary(results)
    };
    
    // Output report
    if (options.report) {
      await this.outputReport(report, options.output);
    }
    
    return report;
  }
}

class SystemDiagnostic implements IDiagnostic {
  async run(options: DiagnosticOptions): Promise<DiagnosticResult> {
    const checks: DiagnosticCheck[] = [];
    
    // Node.js version
    const nodeVersion = process.version;
    const minNodeVersion = '18.0.0';
    checks.push({
      name: 'Node.js Version',
      status: semver.gte(nodeVersion, minNodeVersion) ? 'pass' : 'fail',
      message: `Node.js ${nodeVersion} (minimum: ${minNodeVersion})`,
      fix: semver.gte(nodeVersion, minNodeVersion) ? undefined : {
        description: `Upgrade Node.js to version ${minNodeVersion} or higher`,
        action: async () => {
          consola.warn('Please upgrade Node.js manually');
        }
      }
    });
    
    // Package manager availability
    const packageManagers = ['npm', 'pnpm', 'bun', 'yarn'];
    for (const pm of packageManagers) {
      const available = await this.checkCommandExists(pm);
      checks.push({
        name: `${pm} Available`,
        status: available ? 'pass' : 'info',
        message: available ? `${pm} is installed` : `${pm} not found`
      });
    }
    
    // Git availability
    const gitAvailable = await this.checkCommandExists('git');
    checks.push({
      name: 'Git Available',
      status: gitAvailable ? 'pass' : 'warn',
      message: gitAvailable ? 'Git is installed' : 'Git not found',
      fix: gitAvailable ? undefined : {
        description: 'Install Git for version control support',
        action: async () => {
          consola.info('Install Git from https://git-scm.com/');
        }
      }
    });
    
    return {
      diagnostic: 'system',
      status: checks.every(c => c.status === 'pass') ? 'healthy' : 'issues',
      checks,
      fixes: checks.filter(c => c.fix).map(c => c.fix!)
    };
  }
  
  private async checkCommandExists(command: string): Promise<boolean> {
    try {
      await execa(command, ['--version']);
      return true;
    } catch {
      return false;
    }
  }
}
```

---

## Error Handling

### Command Error Types
```typescript
export abstract class CommandError extends Error {
  abstract readonly code: string;
  abstract readonly category: 'user' | 'system' | 'network';
  
  constructor(message: string, public readonly details?: any) {
    super(message);
    this.name = this.constructor.name;
  }
}

export class InvalidProjectNameError extends CommandError {
  readonly code = 'E001';
  readonly category = 'user';
}

export class ServiceNotFoundError extends CommandError {
  readonly code = 'E002';
  readonly category = 'user';
}

export class IncompatibleServicesError extends CommandError {
  readonly code = 'E003';
  readonly category = 'user';
}

export class TemplateProcessingError extends CommandError {
  readonly code = 'E004';
  readonly category = 'system';
}

export class DependencyConflictError extends CommandError {
  readonly code = 'E005';
  readonly category = 'system';
}

export class RegistryAccessError extends CommandError {
  readonly code = 'E006';
  readonly category = 'network';
}
```

### Global Error Handler
```typescript
export function setupGlobalErrorHandler(): void {
  process.on('uncaughtException', (error) => {
    consola.error('Uncaught Exception:', error);
    process.exit(1);
  });
  
  process.on('unhandledRejection', (reason, promise) => {
    consola.error('Unhandled Promise Rejection:', reason);
    process.exit(1);
  });
}

export function handleCommandError(error: unknown): void {
  if (error instanceof CommandError) {
    consola.error(`[${error.code}] ${error.message}`);
    
    if (error.details) {
      consola.debug('Error details:', error.details);
    }
    
    // Provide helpful suggestions based on error type
    switch (error.category) {
      case 'user':
        consola.info('Check your command arguments and try again');
        break;
      case 'system':
        consola.info('Run `xaheen doctor` to diagnose system issues');
        break;
      case 'network':
        consola.info('Check your internet connection and registry access');
        break;
    }
  } else {
    consola.error('Unexpected error:', error);
  }
  
  process.exit(1);
}
```

---

## Performance Monitoring

### Command Performance Tracking
```typescript
class CommandPerformanceMonitor {
  private metrics: Map<string, PerformanceMetric[]> = new Map();
  
  startCommand(command: string): PerformanceTracker {
    const start = process.hrtime.bigint();
    const startMemory = process.memoryUsage();
    
    return {
      command,
      startTime: start,
      startMemory,
      end: () => {
        const end = process.hrtime.bigint();
        const endMemory = process.memoryUsage();
        const duration = Number(end - start) / 1000000; // Convert to milliseconds
        
        const metric: PerformanceMetric = {
          command,
          duration,
          memoryDelta: {
            rss: endMemory.rss - startMemory.rss,
            heapUsed: endMemory.heapUsed - startMemory.heapUsed,
            external: endMemory.external - startMemory.external
          },
          timestamp: new Date()
        };
        
        this.recordMetric(metric);
        return metric;
      }
    };
  }
  
  private recordMetric(metric: PerformanceMetric): void {
    if (!this.metrics.has(metric.command)) {
      this.metrics.set(metric.command, []);
    }
    
    const commandMetrics = this.metrics.get(metric.command)!;
    commandMetrics.push(metric);
    
    // Keep only last 50 measurements per command
    if (commandMetrics.length > 50) {
      commandMetrics.shift();
    }
  }
  
  getMetrics(command?: string): PerformanceMetric[] {
    if (command) {
      return this.metrics.get(command) || [];
    }
    
    return Array.from(this.metrics.values()).flat();
  }
}
```

---

**Last Updated:** January 2025  
**Commands Version:** 2.0.2  
**Author:** Xala Technologies