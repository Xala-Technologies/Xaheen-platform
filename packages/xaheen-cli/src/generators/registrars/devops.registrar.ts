/**
 * DevOps Generator Registrar
 * 
 * Registers all DevOps-related generators with the central GeneratorRegistry.
 * This includes CI/CD pipelines, infrastructure automation, monitoring,
 * and deployment generators.
 */

import { GeneratorRegistry, IGeneratorRegistry, GeneratorDomain } from "../core/index";
import { IGenerator } from "../core/interfaces/IGenerator";

// Generic result type for all generators
type GeneratorResult = { success: boolean; message: string; error?: string };

// Base options for all DevOps generators
type DevOpsGeneratorOptions = {
  name: string;
  repository?: string;
  provider?: string;
  outputDir?: string;
  force?: boolean;
  dryRun?: boolean;
};

// Mock implementation of DevOps generators
class CICDGenerator implements IGenerator<DevOpsGeneratorOptions> {
  async generate(options: DevOpsGeneratorOptions): Promise<GeneratorResult> {
    console.log('CI/CD Generator executed with:', options);
    return { success: true, message: 'CI/CD pipeline configuration generated (mock)' };
  }
}

class GitHubActionsGenerator implements IGenerator<DevOpsGeneratorOptions> {
  async generate(options: DevOpsGeneratorOptions): Promise<GeneratorResult> {
    console.log('GitHub Actions Generator executed with:', options);
    return { success: true, message: 'GitHub Actions workflow generated (mock)' };
  }
}

class GitLabCIGenerator implements IGenerator<DevOpsGeneratorOptions> {
  async generate(options: DevOpsGeneratorOptions): Promise<GeneratorResult> {
    console.log('GitLab CI Generator executed with:', options);
    return { success: true, message: 'GitLab CI configuration generated (mock)' };
  }
}

class AzureDevOpsGenerator implements IGenerator<DevOpsGeneratorOptions> {
  async generate(options: DevOpsGeneratorOptions): Promise<GeneratorResult> {
    console.log('Azure DevOps Generator executed with:', options);
    return { success: true, message: 'Azure DevOps pipeline generated (mock)' };
  }
}

class PrometheusGenerator implements IGenerator<DevOpsGeneratorOptions> {
  async generate(options: DevOpsGeneratorOptions): Promise<GeneratorResult> {
    console.log('Prometheus Generator executed with:', options);
    return { success: true, message: 'Prometheus configuration generated (mock)' };
  }
}

class GrafanaGenerator implements IGenerator<DevOpsGeneratorOptions> {
  async generate(options: DevOpsGeneratorOptions): Promise<GeneratorResult> {
    console.log('Grafana Generator executed with:', options);
    return { success: true, message: 'Grafana dashboards generated (mock)' };
  }
}

class LoggingGenerator implements IGenerator<DevOpsGeneratorOptions> {
  async generate(options: DevOpsGeneratorOptions): Promise<GeneratorResult> {
    console.log('Logging Generator executed with:', options);
    return { success: true, message: 'Logging configuration generated (mock)' };
  }
}

class AlertingGenerator implements IGenerator<DevOpsGeneratorOptions> {
  async generate(options: DevOpsGeneratorOptions): Promise<GeneratorResult> {
    console.log('Alerting Generator executed with:', options);
    return { success: true, message: 'Alerting configuration generated (mock)' };
  }
}

class DeploymentGenerator implements IGenerator<DevOpsGeneratorOptions> {
  async generate(options: DevOpsGeneratorOptions): Promise<GeneratorResult> {
    console.log('Deployment Generator executed with:', options);
    return { success: true, message: 'Deployment configuration generated (mock)' };
  }
}

class ReleaseGenerator implements IGenerator<DevOpsGeneratorOptions> {
  async generate(options: DevOpsGeneratorOptions): Promise<GeneratorResult> {
    console.log('Release Generator executed with:', options);
    return { success: true, message: 'Release configuration generated (mock)' };
  }
}

class CanaryDeploymentGenerator implements IGenerator<DevOpsGeneratorOptions> {
  async generate(options: DevOpsGeneratorOptions): Promise<GeneratorResult> {
    console.log('Canary Deployment Generator executed with:', options);
    return { success: true, message: 'Canary deployment configuration generated (mock)' };
  }
}

class BlueGreenDeploymentGenerator implements IGenerator<DevOpsGeneratorOptions> {
  async generate(options: DevOpsGeneratorOptions): Promise<GeneratorResult> {
    console.log('Blue Green Deployment Generator executed with:', options);
    return { success: true, message: 'Blue green deployment configuration generated (mock)' };
  }
}

/**
 * Register all DevOps generators with the GeneratorRegistry
 * @param registry The central generator registry
 */
export function registerDevOpsGenerators(registry: IGeneratorRegistry): void {
  console.log('Registering DevOps generators...');
  
  // Register CI/CD generators
  registry.registerGenerator(GeneratorDomain.DEVOPS, 'cicd', CICDGenerator);
  registry.registerGenerator(GeneratorDomain.DEVOPS, 'github-actions', GitHubActionsGenerator);
  registry.registerGenerator(GeneratorDomain.DEVOPS, 'gitlab-ci', GitLabCIGenerator);
  registry.registerGenerator(GeneratorDomain.DEVOPS, 'azure-devops', AzureDevOpsGenerator);
  
  // Register monitoring generators
  registry.registerGenerator(GeneratorDomain.DEVOPS, 'prometheus', PrometheusGenerator);
  registry.registerGenerator(GeneratorDomain.DEVOPS, 'grafana', GrafanaGenerator);
  registry.registerGenerator(GeneratorDomain.DEVOPS, 'logging', LoggingGenerator);
  registry.registerGenerator(GeneratorDomain.DEVOPS, 'alerting', AlertingGenerator);
  
  // Register deployment generators
  registry.registerGenerator(GeneratorDomain.DEVOPS, 'deployment', DeploymentGenerator);
  registry.registerGenerator(GeneratorDomain.DEVOPS, 'release', ReleaseGenerator);
  registry.registerGenerator(GeneratorDomain.DEVOPS, 'canary', CanaryDeploymentGenerator);
  registry.registerGenerator(GeneratorDomain.DEVOPS, 'blue-green', BlueGreenDeploymentGenerator);
  
  console.log('DevOps generators registered successfully');
}

// Export default function for dynamic importing
export default registerDevOpsGenerators;
