/**
 * DevOps Generator Registrar
 * 
 * Registers all DevOps-related generators with the central GeneratorRegistry.
 * This includes CI/CD pipelines, infrastructure automation, monitoring,
 * and deployment generators.
 */

import { GeneratorRegistry } from '../core/registry';
import { GeneratorDomain } from '../core/types';

// Import DevOps generators
import { CICDGenerator } from '../devops/ci-cd/CICDGenerator';
import { GitHubActionsGenerator } from '../devops/ci-cd/GitHubActionsGenerator';
import { GitLabCIGenerator } from '../devops/ci-cd/GitLabCIGenerator';
import { AzureDevOpsGenerator } from '../devops/ci-cd/AzureDevOpsGenerator';

// Import monitoring generators
import { PrometheusGenerator } from '../devops/monitoring/PrometheusGenerator';
import { GrafanaGenerator } from '../devops/monitoring/GrafanaGenerator';
import { LoggingGenerator } from '../devops/monitoring/LoggingGenerator';
import { AlertingGenerator } from '../devops/monitoring/AlertingGenerator';

// Import deployment generators
import { DeploymentGenerator } from '../devops/deployment/DeploymentGenerator';
import { ReleaseGenerator } from '../devops/deployment/ReleaseGenerator';
import { CanaryDeploymentGenerator } from '../devops/deployment/CanaryDeploymentGenerator';
import { BlueGreenDeploymentGenerator } from '../devops/deployment/BlueGreenDeploymentGenerator';

/**
 * Register all DevOps generators with the GeneratorRegistry
 * 
 * @param registry The central generator registry
 */
export function registerDevOpsGenerators(registry: GeneratorRegistry): void {
  console.log('Registering DevOps generators...');
  
  // Register CI/CD generators
  registry.register(CICDGenerator, GeneratorDomain.DEVOPS);
  registry.register(GitHubActionsGenerator, GeneratorDomain.DEVOPS);
  registry.register(GitLabCIGenerator, GeneratorDomain.DEVOPS);
  registry.register(AzureDevOpsGenerator, GeneratorDomain.DEVOPS);
  
  // Register monitoring generators
  registry.register(PrometheusGenerator, GeneratorDomain.DEVOPS);
  registry.register(GrafanaGenerator, GeneratorDomain.DEVOPS);
  registry.register(LoggingGenerator, GeneratorDomain.DEVOPS);
  registry.register(AlertingGenerator, GeneratorDomain.DEVOPS);
  
  // Register deployment generators
  registry.register(DeploymentGenerator, GeneratorDomain.DEVOPS);
  registry.register(ReleaseGenerator, GeneratorDomain.DEVOPS);
  registry.register(CanaryDeploymentGenerator, GeneratorDomain.DEVOPS);
  registry.register(BlueGreenDeploymentGenerator, GeneratorDomain.DEVOPS);
  
  console.log('DevOps generators registered successfully');
}

// Export default function for dynamic importing
export default registerDevOpsGenerators;
