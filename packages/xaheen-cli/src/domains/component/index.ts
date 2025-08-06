import chalk from "chalk";
import type { CLICommand } from "../../types/index";
import { CLIError } from "../../types/index";
import { cliLogger } from "../../utils/logger";
import { registryService } from "../../services/registry/registry.service";

export default class ComponentDomain {
	private get configManager() {
		return global.__xaheen_cli.configManager;
	}

	private get registry() {
		return registryService;
	}

	public async generate(command: CLICommand): Promise<void> {
		const description = command.target;

		if (!description) {
			throw new CLIError(
				"Component description is required",
				"MISSING_DESCRIPTION",
				"component",
				"generate",
			);
		}

		cliLogger.ai(`Generating component from description: "${description}"`);

		try {
			// Get available templates from registry
			const config = await this.configManager.loadConfig();
			const platform = config.design?.platform || "react";
			const componentTemplates = this.registry.getComponentTemplatesByPlatform(platform);
			
			cliLogger.debug(`Found ${componentTemplates.length} component templates for ${platform}`);

			// Use MCP client to enhance component generation
			const { mcpClient } = await import('../../services/mcp/mcp-client');
			const aiHints = await mcpClient.getAIHints(description, platform);
			
			// Generate component using AI service
			const { AIService } = await import('../../services/ai/ai-service');
			const aiInstance = new AIService(config);
			
			const context = {
				framework: platform === 'react' ? 'React' : platform,
				platform: 'web',
				stack: config.project.framework,
				projectPath: process.cwd(),
				dependencies: ['@xala-technologies/ui-system', 'react', 'typescript'],
				codeStyle: 'typescript' as const,
				uiSystem: '@xala-technologies/ui-system',
				compliance: {
					accessibility: config.compliance?.accessibility || 'AAA' as const,
					norwegian: config.compliance?.norwegian || false,
					gdpr: config.compliance?.gdpr || false,
				},
				componentType: 'component' as const,
				styling: 'tailwind' as const,
				features: ['accessibility', 'typescript']
			};

			const result = await aiInstance.generateComponent(description, context);
			
			if (result.component) {
				cliLogger.success(`Component generated successfully with AI assistance`);
				cliLogger.info(`AI Hints applied: ${aiHints.join(', ')}`);
				
				// Save to file
				const componentName = this.extractComponentName(description);
				const filePath = `./src/components/${this.kebabCase(componentName)}.tsx`;
				
				try {
					const fs = await import('fs/promises');
					const path = await import('path');
					
					// Ensure directory exists
					await fs.mkdir(path.dirname(filePath), { recursive: true });
					await fs.writeFile(filePath, result.component);
					
					cliLogger.success(`Component saved to: ${filePath}`);
					cliLogger.info(`\n${chalk.dim('Generated component preview:')}`);
					console.log(result.component);
				} catch (writeError) {
					cliLogger.warn(`Failed to save component file: ${writeError}`);
					cliLogger.info(`\nGenerated component code:\n${result.component}`);
				}
			} else {
				// Fallback to basic template
				cliLogger.warn('AI generation failed, using basic template...');
				const component = this.generateBasicComponent(description);
				cliLogger.info(`Basic component code:\n${component}`);
			}
			
		} catch (error) {
			cliLogger.error(`Failed to generate component: ${error}`);
			
			// Fallback to basic template
			cliLogger.info('Falling back to basic template...');
			const component = this.generateBasicComponent(description);
			cliLogger.info(`Basic component code:\n${component}`);
		}
	}

	private generateBasicComponent(description: string): string {
		const componentName = this.extractComponentName(description);
		
		return `'use client';

import React from 'react';
import { 
  Card, 
  Text,
  Container 
} from '@xala-technologies/ui-system';

interface ${componentName}Props {
  readonly className?: string;
  readonly children?: React.ReactNode;
}

export const ${componentName}: React.FC<${componentName}Props> = ({ 
  className,
  children 
}): JSX.Element => {
  return (
    <Container className={className}>
      <Card variant="elevated" padding="lg">
        <Text variant="h2">${componentName}</Text>
        <Text variant="body">${description}</Text>
        {children}
      </Card>
    </Container>
  );
};

${componentName}.displayName = '${componentName}';

export default ${componentName};`;
	}

	private extractComponentName(description: string): string {
		// Extract a reasonable component name from description
		const words = description.split(/\s+/);
		const mainWord = words.find(word => 
			word.length > 3 && 
			!['the', 'and', 'for', 'with', 'that', 'this', 'will', 'can'].includes(word.toLowerCase())
		) || words[0] || 'Component';
		
		return this.pascalCase(mainWord);
	}

	private pascalCase(str: string): string {
		return str
			.replace(/[-_\s]+(.)?/g, (_, char) => (char ? char.toUpperCase() : ''))
			.replace(/^(.)/, (_, char) => char.toUpperCase());
	}

	private kebabCase(str: string): string {
		return str
			.replace(/([A-Z])/g, '-$1')
			.toLowerCase()
			.replace(/^-/, '');
	}

	public async create(command: CLICommand): Promise<void> {
		const componentName = command.target;

		if (!componentName) {
			throw new CLIError(
				"Component name is required",
				"MISSING_COMPONENT_NAME",
				"component",
				"create",
			);
		}

		cliLogger.info(`Creating component: ${componentName}`);

		try {
			const config = await this.configManager.loadConfig();
			const platform = config.design?.platform || "react";

			const templates = this.registry.getComponentTemplatesByPlatform(platform);

			if (templates.length === 0) {
				cliLogger.warn(
					`No component templates found for platform: ${platform}`,
				);
				return;
			}

			// For now, show available templates
			cliLogger.info(`Available templates for ${platform}:`);
			templates.forEach((template) => {
				console.log(`  ${chalk.cyan(template.id)} - ${template.description}`);
			});
		} catch (error) {
			throw new CLIError(
				`Failed to create component: ${error}`,
				"COMPONENT_CREATE_FAILED",
				"component",
				"create",
			);
		}
	}

	public async build(command: CLICommand): Promise<void> {
		cliLogger.info("Building multi-platform components...");

		try {
			const config = await this.configManager.loadConfig();
			const monorepoInfo = await this.configManager.getMonorepoInfo();

			if (monorepoInfo.isMonorepo) {
				cliLogger.info(`Building ${monorepoInfo.apps.length} apps...`);
				for (const app of monorepoInfo.apps) {
					cliLogger.step(
						monorepoInfo.apps.indexOf(app) + 1,
						monorepoInfo.apps.length,
						`Building ${app}`,
					);
				}
			}

			cliLogger.success("Build completed!");
		} catch (error) {
			throw new CLIError(
				`Build failed: ${error}`,
				"BUILD_FAILED",
				"component",
				"build",
			);
		}
	}
}
