import { BaseGenerator } from '../base.generator';
import { SingleTenantOptions, GenerationResult } from './types';
import * as fs from 'fs-extra';
import * as path from 'path';
import * as Handlebars from 'handlebars';

/**
 * Single-Tenant Application Generator
 * Generates dedicated single-tenant architecture with isolated infrastructure,
 * custom domains, enhanced security, and enterprise-grade features.
 */
export class SingleTenantGenerator extends BaseGenerator<SingleTenantOptions> {
  async generate(options: SingleTenantOptions): Promise<GenerationResult> {
    try {
      await this.validateOptions(options);
      this.logger.info(`Generating Single-Tenant Application: ${options.name}`);

      const result: GenerationResult = {
        files: [],
        commands: [],
        nextSteps: []
      };

      // Create single-tenant structure
      await this.createSingleTenantStructure(options, result);
      
      // Generate dedicated infrastructure
      await this.generateDedicatedInfrastructure(options, result);
      
      // Generate tenant-specific configuration
      await this.generateTenantConfiguration(options, result);
      
      // Generate enhanced security features
      await this.generateEnhancedSecurity(options, result);
      
      // Generate custom domain handling
      await this.generateCustomDomainHandling(options, result);
      
      // Generate backup and disaster recovery
      await this.generateBackupAndRecovery(options, result);
      
      // Generate compliance and audit features
      await this.generateComplianceFeatures(options, result);
      
      // Generate monitoring and observability
      await this.generateMonitoring(options, result);
      
      // Generate deployment configurations
      await this.generateDeploymentConfigurations(options, result);

      this.logger.success(`Single-Tenant Application generated successfully: ${options.name}`);
      return result;

    } catch (error: any) {
      this.logger.error(`Failed to generate Single-Tenant Application: ${error.message}`, error);
      throw error;
    }
  }

  private async createSingleTenantStructure(
    options: SingleTenantOptions,
    result: GenerationResult
  ): Promise<void> {
    const baseDir = path.join(process.cwd(), `single-tenant-${options.tenantId}`);
    
    // Create directory structure
    const directories = [
      'src/app',
      'src/config/tenant',
      'src/security/tenant',
      'src/customization/branding',
      'src/customization/themes',
      'src/customization/features',
      'src/domain/services',
      'src/infrastructure/dedicated',
      'src/backup/services',
      'src/compliance/services',
      'src/monitoring/tenant',
      'deployments/kubernetes',
      'deployments/docker',
      'deployments/serverless',
      'config/environments',
      'scripts/deployment',
      'docs/tenant'
    ];

    for (const dir of directories) {
      await fs.ensureDir(path.join(baseDir, dir));
    }

    // Generate main application module
    const moduleTemplate = await this.loadTemplate('single-tenant/app.module.ts.hbs');
    const moduleContent = moduleTemplate({
      ...options,
      timestamp: new Date().toISOString()
    });

    const modulePath = path.join(baseDir, 'src/app/AppModule.ts');
    await fs.writeFile(modulePath, moduleContent);
    result.files.push(modulePath);
  }

  private async generateDedicatedInfrastructure(
    options: SingleTenantOptions,
    result: GenerationResult
  ): Promise<void> {
    const baseDir = path.join(process.cwd(), `single-tenant-${options.tenantId}`);

    if (options.infrastructure === 'kubernetes') {
      await this.generateKubernetesInfrastructure(options, baseDir, result);
    } else if (options.infrastructure === 'docker') {
      await this.generateDockerInfrastructure(options, baseDir, result);
    } else if (options.infrastructure === 'serverless') {
      await this.generateServerlessInfrastructure(options, baseDir, result);
    }
  }

  private async generateKubernetesInfrastructure(
    options: SingleTenantOptions,
    baseDir: string,
    result: GenerationResult
  ): Promise<void> {
    // Generate Kubernetes deployment
    const deploymentTemplate = await this.loadTemplate('single-tenant/kubernetes/deployment.yaml.hbs');
    const deploymentContent = deploymentTemplate({
      ...options,
      timestamp: new Date().toISOString()
    });

    const deploymentPath = path.join(baseDir, 'deployments/kubernetes/deployment.yaml');
    await fs.writeFile(deploymentPath, deploymentContent);
    result.files.push(deploymentPath);

    // Generate service definition
    const serviceTemplate = await this.loadTemplate('single-tenant/kubernetes/service.yaml.hbs');
    const serviceContent = serviceTemplate({
      ...options,
      timestamp: new Date().toISOString()
    });

    const servicePath = path.join(baseDir, 'deployments/kubernetes/service.yaml');
    await fs.writeFile(servicePath, serviceContent);
    result.files.push(servicePath);

    // Generate ingress for custom domain
    if (options.features.includes('custom-domain')) {
      const ingressTemplate = await this.loadTemplate('single-tenant/kubernetes/ingress.yaml.hbs');
      const ingressContent = ingressTemplate({
        ...options,
        timestamp: new Date().toISOString()
      });

      const ingressPath = path.join(baseDir, 'deployments/kubernetes/ingress.yaml');
      await fs.writeFile(ingressPath, ingressContent);
      result.files.push(ingressPath);
    }
  }

  private async generateDockerInfrastructure(
    options: SingleTenantOptions,
    baseDir: string,
    result: GenerationResult
  ): Promise<void> {
    // Generate Dockerfile
    const dockerfileTemplate = await this.loadTemplate('single-tenant/docker/Dockerfile.hbs');
    const dockerfileContent = dockerfileTemplate({
      ...options,
      timestamp: new Date().toISOString()
    });

    const dockerfilePath = path.join(baseDir, 'deployments/docker/Dockerfile');
    await fs.writeFile(dockerfilePath, dockerfileContent);
    result.files.push(dockerfilePath);

    // Generate Docker Compose for local development
    const composeTemplate = await this.loadTemplate('single-tenant/docker/docker-compose.yaml.hbs');
    const composeContent = composeTemplate({
      ...options,
      timestamp: new Date().toISOString()
    });

    const composePath = path.join(baseDir, 'deployments/docker/docker-compose.yaml');
    await fs.writeFile(composePath, composeContent);
    result.files.push(composePath);
  }

  private async generateServerlessInfrastructure(
    options: SingleTenantOptions,
    baseDir: string,
    result: GenerationResult
  ): Promise<void> {
    // Generate serverless configuration
    const serverlessTemplate = await this.loadTemplate('single-tenant/serverless/serverless.yml.hbs');
    const serverlessContent = serverlessTemplate({
      ...options,
      timestamp: new Date().toISOString()
    });

    const serverlessPath = path.join(baseDir, 'deployments/serverless/serverless.yml');
    await fs.writeFile(serverlessPath, serverlessContent);
    result.files.push(serverlessPath);

    result.commands.push('npm install -g serverless');
  }

  private async generateTenantConfiguration(
    options: SingleTenantOptions,
    result: GenerationResult
  ): Promise<void> {
    const baseDir = path.join(process.cwd(), `single-tenant-${options.tenantId}`);

    // Generate tenant-specific configuration
    const configTemplate = await this.loadTemplate('single-tenant/config/tenant.config.ts.hbs');
    const configContent = configTemplate({
      ...options,
      timestamp: new Date().toISOString()
    });

    const configPath = path.join(baseDir, 'src/config/tenant/TenantConfig.ts');
    await fs.writeFile(configPath, configContent);
    result.files.push(configPath);

    // Generate branding configuration
    if (options.customization.branding) {
      const brandingTemplate = await this.loadTemplate('single-tenant/customization/branding.config.ts.hbs');
      const brandingContent = brandingTemplate({
        ...options,
        timestamp: new Date().toISOString()
      });

      const brandingPath = path.join(baseDir, 'src/customization/branding/BrandingConfig.ts');
      await fs.writeFile(brandingPath, brandingContent);
      result.files.push(brandingPath);
    }

    // Generate theme configuration
    if (options.customization.themes) {
      const themeTemplate = await this.loadTemplate('single-tenant/customization/theme.config.ts.hbs');
      const themeContent = themeTemplate({
        ...options,
        timestamp: new Date().toISOString()
      });

      const themePath = path.join(baseDir, 'src/customization/themes/ThemeConfig.ts');
      await fs.writeFile(themePath, themeContent);
      result.files.push(themePath);
    }

    // Generate feature configuration
    if (options.customization.features) {
      const featureTemplate = await this.loadTemplate('single-tenant/customization/feature.config.ts.hbs');
      const featureContent = featureTemplate({
        ...options,
        timestamp: new Date().toISOString()
      });

      const featurePath = path.join(baseDir, 'src/customization/features/FeatureConfig.ts');
      await fs.writeFile(featurePath, featureContent);
      result.files.push(featurePath);
    }
  }

  private async generateEnhancedSecurity(
    options: SingleTenantOptions,
    result: GenerationResult
  ): Promise<void> {
    if (!options.features.includes('enhanced-security')) return;

    const baseDir = path.join(process.cwd(), `single-tenant-${options.tenantId}`);

    // Generate security service
    const securityTemplate = await this.loadTemplate('single-tenant/security/enhanced-security.service.ts.hbs');
    const securityContent = securityTemplate({
      ...options,
      timestamp: new Date().toISOString()
    });

    const securityPath = path.join(baseDir, 'src/security/tenant/EnhancedSecurityService.ts');
    await fs.writeFile(securityPath, securityContent);
    result.files.push(securityPath);

    // Generate security policies
    const policyTemplate = await this.loadTemplate('single-tenant/security/security-policies.ts.hbs');
    const policyContent = policyTemplate({
      ...options,
      timestamp: new Date().toISOString()
    });

    const policyPath = path.join(baseDir, 'src/security/tenant/SecurityPolicies.ts');
    await fs.writeFile(policyPath, policyContent);
    result.files.push(policyPath);
  }

  private async generateCustomDomainHandling(
    options: SingleTenantOptions,
    result: GenerationResult
  ): Promise<void> {
    if (!options.features.includes('custom-domain')) return;

    const baseDir = path.join(process.cwd(), `single-tenant-${options.tenantId}`);

    // Generate domain service
    const domainTemplate = await this.loadTemplate('single-tenant/services/custom-domain.service.ts.hbs');
    const domainContent = domainTemplate({
      ...options,
      timestamp: new Date().toISOString()
    });

    const domainPath = path.join(baseDir, 'src/domain/services/CustomDomainService.ts');
    await fs.writeFile(domainPath, domainContent);
    result.files.push(domainPath);
  }

  private async generateBackupAndRecovery(
    options: SingleTenantOptions,
    result: GenerationResult
  ): Promise<void> {
    const baseDir = path.join(process.cwd(), `single-tenant-${options.tenantId}`);

    // Generate backup service
    const backupTemplate = await this.loadTemplate('single-tenant/backup/backup.service.ts.hbs');
    const backupContent = backupTemplate({
      ...options,
      timestamp: new Date().toISOString()
    });

    const backupPath = path.join(baseDir, 'src/backup/services/BackupService.ts');
    await fs.writeFile(backupPath, backupContent);
    result.files.push(backupPath);

    // Generate backup configuration
    const backupConfigTemplate = await this.loadTemplate('single-tenant/backup/backup.config.ts.hbs');
    const backupConfigContent = backupConfigTemplate({
      ...options,
      timestamp: new Date().toISOString()
    });

    const backupConfigPath = path.join(baseDir, 'src/backup/BackupConfig.ts');
    await fs.writeFile(backupConfigPath, backupConfigContent);
    result.files.push(backupConfigPath);
  }

  private async generateComplianceFeatures(
    options: SingleTenantOptions,
    result: GenerationResult
  ): Promise<void> {
    if (!options.features.includes('compliance-reporting')) return;

    const baseDir = path.join(process.cwd(), `single-tenant-${options.tenantId}`);

    // Generate compliance service
    const complianceTemplate = await this.loadTemplate('single-tenant/compliance/compliance.service.ts.hbs');
    const complianceContent = complianceTemplate({
      ...options,
      timestamp: new Date().toISOString()
    });

    const compliancePath = path.join(baseDir, 'src/compliance/services/ComplianceService.ts');
    await fs.writeFile(compliancePath, complianceContent);
    result.files.push(compliancePath);
  }

  private async generateMonitoring(
    options: SingleTenantOptions,
    result: GenerationResult
  ): Promise<void> {
    if (!options.monitoring) return;

    const baseDir = path.join(process.cwd(), `single-tenant-${options.tenantId}`);

    // Generate monitoring service
    const monitoringTemplate = await this.loadTemplate('single-tenant/monitoring/tenant-monitoring.service.ts.hbs');
    const monitoringContent = monitoringTemplate({
      ...options,
      timestamp: new Date().toISOString()
    });

    const monitoringPath = path.join(baseDir, 'src/monitoring/tenant/TenantMonitoringService.ts');
    await fs.writeFile(monitoringPath, monitoringContent);
    result.files.push(monitoringPath);
  }

  private async generateDeploymentConfigurations(
    options: SingleTenantOptions,
    result: GenerationResult
  ): Promise<void> {
    const baseDir = path.join(process.cwd(), `single-tenant-${options.tenantId}`);

    // Generate deployment script
    const deployScriptTemplate = await this.loadTemplate('single-tenant/scripts/deploy.sh.hbs');
    const deployScriptContent = deployScriptTemplate({
      ...options,
      timestamp: new Date().toISOString()
    });

    const deployScriptPath = path.join(baseDir, 'scripts/deployment/deploy.sh');
    await fs.writeFile(deployScriptPath, deployScriptContent);
    await fs.chmod(deployScriptPath, 0o755);
    result.files.push(deployScriptPath);

    // Generate environment configurations
    const environments = ['development', 'staging', 'production'];
    for (const env of environments) {
      const envTemplate = await this.loadTemplate('single-tenant/config/env.hbs');
      const envContent = envTemplate({
        ...options,
        environment: env,
        timestamp: new Date().toISOString()
      });

      const envPath = path.join(baseDir, `config/environments/.env.${env}`);
      await fs.writeFile(envPath, envContent);
      result.files.push(envPath);
    }

    result.nextSteps.push(`Configure tenant-specific settings in config/environments/.env.${options.tenantId || 'production'}`);
    result.nextSteps.push('Set up custom domain DNS configuration if enabled');
    result.nextSteps.push('Configure backup storage and retention policies');
    result.nextSteps.push('Deploy dedicated infrastructure using provided scripts');
    result.nextSteps.push('Set up monitoring and alerting for tenant-specific metrics');
    result.nextSteps.push('Configure compliance reporting if enabled');
  }

  private async loadTemplate(templatePath: string): Promise<HandlebarsTemplateDelegate> {
    const fullPath = path.join(__dirname, '../../templates', templatePath);
    
    if (!await fs.pathExists(fullPath)) {
      const basicTemplate = this.createBasicTemplate(templatePath);
      await fs.ensureDir(path.dirname(fullPath));
      await fs.writeFile(fullPath, basicTemplate);
    }
    
    const templateContent = await fs.readFile(fullPath, 'utf-8');
    return Handlebars.compile(templateContent);
  }

  private createBasicTemplate(templatePath: string): string {
    if (templatePath.includes('app.module.ts.hbs')) {
      return `import { Module } from '@nestjs/common';
import { TenantConfig } from '../config/tenant/TenantConfig';

@Module({
  imports: [],
  providers: [TenantConfig],
  exports: [TenantConfig],
})
export class AppModule {
  constructor() {
    console.log('Single-tenant application {{name}} for tenant {{tenantId}} started');
  }
}`;
    }

    return `// Generated template for ${templatePath}
// Single-tenant application: {{name}}
// Tenant ID: {{tenantId}}
// Infrastructure: {{infrastructure}}
// Generated at: {{timestamp}}

export class SingleTenantService {
  // TODO: Implement single-tenant logic for ${templatePath}
}`;
  }

  protected async validateOptions(options: SingleTenantOptions): Promise<void> {
    if (!options.name) {
      throw new Error('Single-tenant application name is required');
    }

    if (!options.tenantId) {
      throw new Error('Tenant ID is required');
    }

    if (!options.database) {
      throw new Error('Database type is required');
    }

    if (!options.backend) {
      throw new Error('Backend framework is required');
    }

    if (!options.infrastructure) {
      throw new Error('Infrastructure type is required');
    }
  }
}