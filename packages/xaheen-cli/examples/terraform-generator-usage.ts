/**
 * Example usage of the Terraform Generator
 * This demonstrates how to use the Terraform infrastructure generator
 * for creating production-ready cloud infrastructure
 */

import { executeFullStackGenerator, GeneratorContext } from '../src/generators/index.js';

/**
 * Example: Generate AWS infrastructure with Terraform
 */
async function generateAWSInfrastructure() {
  const context: GeneratorContext = {
    type: 'terraform',
    name: 'my-web-app',
    options: {
      // Terraform-specific options
      cloudProvider: 'aws',
      region: 'us-west-2',
      environment: 'production',
      
      // Infrastructure components
      networking: {
        vpc: true,
        subnets: 'both',
        availabilityZones: 3,
        enableNatGateway: true,
        enableVpnGateway: false,
      },
      
      compute: {
        instances: [
          {
            name: 'web-server',
            instanceType: 't3.medium',
            minSize: 2,
            maxSize: 10,
            desiredCapacity: 3,
          }
        ],
        loadBalancer: true,
        autoScaling: true,
      },
      
      storage: {
        databases: [
          {
            engine: 'postgresql',
            version: '15.4',
            instanceClass: 'db.t3.micro',
            allocatedStorage: 20,
            multiAZ: true,
            backupRetentionPeriod: 7,
          }
        ],
        objectStorage: true,
        fileSystem: false,
      },
      
      security: {
        waf: true,
        certificateManager: true,
        keyManagement: true,
        secretsManager: true,
        iamRoles: ['WebServerRole', 'DatabaseRole'],
      },
      
      monitoring: {
        cloudWatch: true,
        logging: true,
        alerting: true,
        tracing: false,
      },
      
      compliance: {
        encryption: true,
        backup: true,
        auditLogs: true,
        retention: 365,
      },
      
      // Remote state configuration
      remoteState: {
        backend: 's3',
        bucket: 'my-web-app-terraform-state',
        region: 'us-west-2',
        prefix: 'production',
      },
    },
    projectInfo: {
      name: 'my-web-app',
      version: '1.0.0',
      description: 'Production web application infrastructure',
      author: 'DevOps Team',
      framework: 'terraform',
      language: 'hcl',
    }
  };

  try {
    const result = await executeFullStackGenerator(context);
    
    if (result.success) {
      console.log('✅ Terraform infrastructure generated successfully!');
      console.log(`📝 Generated ${result.files?.length || 0} files`);
      console.log(`🔧 Commands to run:`);
      result.commands?.forEach(cmd => console.log(`   ${cmd}`));
      console.log(`📋 Next steps:`);
      result.nextSteps?.forEach(step => console.log(`   - ${step}`));
    } else {
      console.error('❌ Failed to generate infrastructure:', result.message);
    }
    
    return result;
  } catch (error) {
    console.error('❌ Error generating infrastructure:', error);
    throw error;
  }
}

/**
 * Example: Generate Azure infrastructure with Terraform
 */
async function generateAzureInfrastructure() {
  const context: GeneratorContext = {
    type: 'terraform',
    name: 'azure-app',
    options: {
      cloudProvider: 'azure',
      region: 'East US',
      environment: 'staging',
      
      networking: {
        vpc: true,
        subnets: 'both',
        availabilityZones: 2,
        enableNatGateway: false,
        enableVpnGateway: false,
      },
      
      compute: {
        instances: [
          {
            name: 'app-servers',
            instanceType: 'Standard_B2s',
            minSize: 1,
            maxSize: 5,
            desiredCapacity: 2,
          }
        ],
        loadBalancer: true,
        autoScaling: true,
      },
      
      storage: {
        databases: [
          {
            engine: 'sqlserver',
            version: '2019-latest',
            instanceClass: 'S0',
            allocatedStorage: 10,
            backupRetentionPeriod: 7,
          }
        ],
        objectStorage: true,
        fileSystem: false,
      },
      
      security: {
        keyManagement: true,
        secretsManager: true,
        iamRoles: ['Contributor', 'Reader'],
      },
      
      monitoring: {
        cloudWatch: true,
        logging: true,
        alerting: true,
      },
      
      remoteState: {
        backend: 'azurerm',
        container: 'tfstate',
        prefix: 'staging',
      },
    },
    projectInfo: {
      name: 'azure-app',
      version: '1.0.0',
      description: 'Azure staging environment',
      framework: 'terraform',
      language: 'hcl',
    }
  };

  return await executeFullStackGenerator(context);
}

/**
 * Example: Generate multi-cloud infrastructure with Terraform
 */
async function generateMultiCloudInfrastructure() {
  const context: GeneratorContext = {
    type: 'terraform',
    name: 'multi-cloud-app',
    options: {
      cloudProvider: 'multi-cloud',
      region: 'global',
      environment: 'production',
      
      networking: {
        vpc: true,
        subnets: 'both',
        availabilityZones: 3,
        enableNatGateway: true,
        enableVpnGateway: true,
      },
      
      compute: {
        instances: [
          {
            name: 'aws-servers',
            instanceType: 't3.large',
            provider: 'aws',
            minSize: 2,
            maxSize: 8,
            desiredCapacity: 4,
          },
          {
            name: 'azure-servers',
            instanceType: 'Standard_D2s_v3',
            provider: 'azure',
            minSize: 1,
            maxSize: 4,
            desiredCapacity: 2,
          }
        ],
        loadBalancer: true,
        autoScaling: true,
      },
      
      storage: {
        databases: [
          {
            name: 'primary-db',
            engine: 'postgresql',
            provider: 'aws',
            version: '15.4',
            instanceClass: 'db.r5.large',
            allocatedStorage: 100,
            multiAZ: true,
            backupRetentionPeriod: 30,
          },
          {
            name: 'replica-db',
            engine: 'postgresql',
            provider: 'azure',
            version: '15',
            instanceClass: 'GP_Gen5_2',
            allocatedStorage: 100,
            backupRetentionPeriod: 30,
          }
        ],
        objectStorage: true,
        fileSystem: true,
      },
      
      security: {
        waf: true,
        certificateManager: true,
        keyManagement: true,
        secretsManager: true,
        iamRoles: ['MultiCloudAdmin', 'DatabaseOperator', 'ApplicationUser'],
      },
      
      monitoring: {
        cloudWatch: true,
        logging: true,
        alerting: true,
        tracing: true,
      },
      
      compliance: {
        encryption: true,
        backup: true,
        auditLogs: true,
        retention: 2555, // 7 years
      },
      
      remoteState: {
        backend: 's3',
        bucket: 'multi-cloud-terraform-state',
        region: 'us-west-2',
        prefix: 'production',
      },
    },
    projectInfo: {
      name: 'multi-cloud-app',
      version: '1.0.0',
      description: 'Enterprise multi-cloud infrastructure',
      framework: 'terraform',
      language: 'hcl',
    }
  };

  return await executeFullStackGenerator(context);
}

// Export the example functions for use in tests or CLI
export {
  generateAWSInfrastructure,
  generateAzureInfrastructure,
  generateMultiCloudInfrastructure,
};

// Example CLI usage demonstration
if (require.main === module) {
  console.log('🚀 Terraform Generator Examples\n');
  
  // You can uncomment and run any of these examples:
  
  // generateAWSInfrastructure()
  //   .then(() => console.log('AWS infrastructure generation completed'))
  //   .catch(console.error);
  
  // generateAzureInfrastructure()
  //   .then(() => console.log('Azure infrastructure generation completed'))
  //   .catch(console.error);
  
  // generateMultiCloudInfrastructure()
  //   .then(() => console.log('Multi-cloud infrastructure generation completed'))
  //   .catch(console.error);
}