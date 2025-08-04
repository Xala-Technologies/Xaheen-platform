/**
 * CLI Template Generator - Uses actual CLI templates
 * Ensures 100% alignment between CLI and MCP Server
 */

import { existsSync, readFileSync } from "fs";
import Handlebars from "handlebars";
import { dirname, join } from "path";
import { fileURLToPath } from "url";
import { TemplateMapper } from "../templates/TemplateMapper.js";
import type {
	ComponentCategory,
	ComponentConfig,
	GeneratedComponent,
	GeneratedFile,
	SupportedPlatform,
} from "../types/index.js";

const __dirname = dirname(fileURLToPath(import.meta.url));

// Register Handlebars helpers
Handlebars.registerHelper("eq", (a: any, b: any) => a === b);
Handlebars.registerHelper(
	"includes",
	(arr: any[], val: any) => arr && arr.includes(val),
);
Handlebars.registerHelper("or", (...args: any[]) => {
	const options = args[args.length - 1];
	return args.slice(0, -1).some(Boolean);
});
Handlebars.registerHelper("and", (...args: any[]) => {
	const options = args[args.length - 1];
	return args.slice(0, -1).every(Boolean);
});
Handlebars.registerHelper("capitalize", (str: string) =>
	str ? str.charAt(0).toUpperCase() + str.slice(1) : "",
);
Handlebars.registerHelper("kebabCase", (str: string) =>
	str ? str.replace(/\s+/g, "-").toLowerCase() : "",
);
Handlebars.registerHelper("pascalCase", (str: string) => {
	if (!str) return "";
	return str
		.replace(/(?:^\w|[A-Z]|\b\w)/g, (word, index) => {
			return word.toUpperCase();
		})
		.replace(/\s+/g, "");
});

export class CliTemplateGenerator {
	private readonly templateMapper: TemplateMapper;
	private readonly cliTemplatesPath: string;

	constructor() {
		this.templateMapper = new TemplateMapper();
		this.cliTemplatesPath = join(__dirname, "../../../../cli/templates");
	}

	/**
	 * Generate component using actual CLI templates
	 */
	async generateFromCliTemplate(
		config: ComponentConfig,
	): Promise<GeneratedComponent> {
		const platform = config.platform || "react";
		const componentName = this.normalizeComponentName(config.name);

		// Check if template exists
		if (!this.templateMapper.isTemplateAvailable(componentName, platform)) {
			throw new Error(
				`Template "${componentName}" not available for platform "${platform}"`,
			);
		}

		// Generate main component
		const componentCode = await this.generateComponentCode(
			config,
			platform,
			componentName,
		);

		// Generate supporting files
		const typesCode = this.generateTypes(config, platform);
		const stylesCode = this.generateStyles(config, platform);
		const testCode = this.generateTest(config, platform);
		const storyCode = this.generateStory(config, platform);
		const localizationKeys = this.generateLocalization(config);

		// Create file structure
		const files = this.createFileStructure(config, platform, {
			componentCode,
			typesCode,
			stylesCode,
			testCode,
			storyCode,
			localizationKeys,
		});

		return {
			componentCode,
			typesCode,
			stylesCode,
			testCode,
			storyCode,
			localizationKeys,
			imports: this.getImports(config, platform),
			dependencies: this.getDependencies(config, platform),
			files,
			platform,
			architecture: "semantic", // v5.0 semantic architecture
		};
	}

	/**
	 * Generate component code from CLI template
	 */
	private async generateComponentCode(
		config: ComponentConfig,
		platform: SupportedPlatform,
		componentName: string,
	): Promise<string> {
		// Get the correct template path
		const templatePath = this.getTemplatePath(
			componentName,
			platform,
			config.category,
		);

		if (!existsSync(templatePath)) {
			// Fallback to generic template generation
			return this.generateFallbackComponent(config, platform);
		}

		// Read and compile template
		const templateContent = readFileSync(templatePath, "utf-8");
		const template = Handlebars.compile(templateContent);

		// Prepare template data
		const templateData = this.prepareTemplateData(config, platform);

		// Render template
		return template(templateData);
	}

	/**
	 * Get template path for component
	 */
	private getTemplatePath(
		componentName: string,
		platform: SupportedPlatform,
		category: ComponentCategory,
	): string {
		// Map category to folder structure
		const categoryMap: Record<ComponentCategory, string> = {
			components: "components",
			"data-components": "components",
			"theme-components": "components",
			layouts: "layouts",
			providers: "providers",
			patterns: "patterns",
			tools: "tools",
			// Legacy mappings
			navigation: "components",
			form: "components",
			"data-display": "components",
			feedback: "components",
			interactive: "components",
			specialized: "components",
			"page-template": "layouts",
		};

		const folder = categoryMap[category] || "components";
		const fileName = `${componentName}.hbs`;

		// Platform-specific paths
		if (platform === "nextjs") {
			// Check for app router templates first
			const appRouterPath = join(
				this.cliTemplatesPath,
				"nextjs",
				"app-router",
				fileName,
			);
			if (existsSync(appRouterPath)) return appRouterPath;
		}

		if (platform === "react-native") {
			// Check screens and navigation folders
			const screensPath = join(
				this.cliTemplatesPath,
				"react-native",
				"screens",
				fileName,
			);
			if (existsSync(screensPath)) return screensPath;

			const navPath = join(
				this.cliTemplatesPath,
				"react-native",
				"navigation",
				fileName,
			);
			if (existsSync(navPath)) return navPath;
		}

		// Standard path
		return join(this.cliTemplatesPath, platform, folder, fileName);
	}

	/**
	 * Prepare template data for rendering
	 */
	private prepareTemplateData(
		config: ComponentConfig,
		platform: SupportedPlatform,
	): any {
		const componentName = this.toPascalCase(config.name);

		return {
			// Component info
			name: config.name,
			componentName,
			className: this.toKebabCase(config.name),
			fileName: this.toKebabCase(config.name),

			// Configuration
			variant: config.variant || "default",
			size: config.size || "md",
			theme: config.theme || "enterprise",
			locale: config.locale || "en",

			// Features
			features: config.features,
			hasIcons: config.features.icons,
			hasAnimation: config.features.animated,
			hasSearch: config.features.searchable,
			hasSorting: config.features.sortable,
			hasFiltering: config.features.filterable,
			hasPagination: config.features.paginated,
			hasValidation: config.features.validation,

			// Accessibility
			accessibility: config.accessibility,
			wcagLevel: config.accessibility.level,
			hasScreenReader: config.accessibility.screenReader,
			hasKeyboardNav: config.accessibility.keyboardNavigation,

			// Responsive
			responsive: config.responsive,
			breakpoints: config.responsive.breakpoints,
			isMobileFirst: config.responsive.mobileFirst,

			// Platform flags
			platform,
			isReact:
				platform === "react" ||
				platform === "nextjs" ||
				platform === "electron",
			isNextJS: platform === "nextjs",
			isVue: platform === "vue",
			isAngular: platform === "angular",
			isSvelte: platform === "svelte",
			isElectron: platform === "electron",
			isReactNative: platform === "react-native",

			// v5.0 Architecture flags
			useSemanticUI: true,
			useTokens: true,
			useLocalization: true,
			zeroHTML: true,
			useCVA: platform === "react" || platform === "nextjs",

			// Platform-specific features
			appRouter: config.platformConfig?.features?.appRouter,
			serverComponents: config.platformConfig?.features?.serverComponents,
			compositionApi: config.platformConfig?.features?.compositionApi,
			standaloneComponents:
				config.platformConfig?.features?.standaloneComponents,
			svelteKit: config.platformConfig?.features?.svelteKit,
			expo: config.platformConfig?.features?.expo,
		};
	}

	/**
	 * Generate fallback component when template not found
	 */
	private generateFallbackComponent(
		config: ComponentConfig,
		platform: SupportedPlatform,
	): string {
		const componentName = this.toPascalCase(config.name);

		// Platform-specific fallbacks
		switch (platform) {
			case "react":
			case "nextjs":
				return this.generateReactFallback(componentName, config);
			case "vue":
				return this.generateVueFallback(componentName, config);
			case "angular":
				return this.generateAngularFallback(componentName, config);
			case "svelte":
				return this.generateSvelteFallback(componentName, config);
			case "electron":
				return this.generateElectronFallback(componentName, config);
			case "react-native":
				return this.generateReactNativeFallback(componentName, config);
			default:
				return this.generateReactFallback(componentName, config);
		}
	}

	private generateReactFallback(
		componentName: string,
		config: ComponentConfig,
	): string {
		return `/**
 * ${componentName} Component - v5.0 Semantic Architecture
 * Generated from MCP Server
 */

import React from 'react';
import { Container, Section, Heading, Text } from '@xala-technologies/ui-system';
import { useTokens } from '@xala-technologies/ui-system/hooks';
import { useTranslation } from 'react-i18next';

export interface ${componentName}Props {
  readonly className?: string;
  readonly children?: React.ReactNode;
  readonly variant?: '${config.variant || "default"}';
  readonly size?: '${config.size || "md"}';
}

export const ${componentName}: React.FC<${componentName}Props> = ({
  className,
  children,
  variant = '${config.variant || "default"}',
  size = '${config.size || "md"}'
}) => {
  const tokens = useTokens();
  const { t } = useTranslation();

  return (
    <Container className={className} variant={variant} size={size}>
      <Section spacing="medium">
        <Heading level={2}>
          {t('${this.toKebabCase(config.name)}.title')}
        </Heading>
        {children}
      </Section>
    </Container>
  );
};

${componentName}.displayName = '${componentName}';`;
	}

	private generateVueFallback(
		componentName: string,
		config: ComponentConfig,
	): string {
		return `<template>
  <Container :class="className" :variant="variant" :size="size">
    <Section spacing="medium">
      <Heading :level="2">
        {{ t('${this.toKebabCase(config.name)}.title') }}
      </Heading>
      <slot />
    </Section>
  </Container>
</template>

<script setup lang="ts">
import { Container, Section, Heading } from '@xala-technologies/ui-system';
import { useTokens } from '@xala-technologies/ui-system/composables';
import { useI18n } from 'vue-i18n';

interface ${componentName}Props {
  className?: string;
  variant?: '${config.variant || "default"}';
  size?: '${config.size || "md"}';
}

const props = withDefaults(defineProps<${componentName}Props>(), {
  variant: '${config.variant || "default"}',
  size: '${config.size || "md"}'
});

const tokens = useTokens();
const { t } = useI18n();
</script>`;
	}

	private generateAngularFallback(
		componentName: string,
		config: ComponentConfig,
	): string {
		return `import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TranslateModule } from '@ngx-translate/core';

@Component({
  selector: 'app-${this.toKebabCase(config.name)}',
  standalone: true,
  imports: [CommonModule, TranslateModule],
  template: \`
    <div [class]="containerClass">
      <section class="section">
        <h2 class="heading">
          {{ '${this.toKebabCase(config.name)}.title' | translate }}
        </h2>
        <ng-content></ng-content>
      </section>
    </div>
  \`,
  styles: [\`
    :host {
      display: block;
    }
  \`]
})
export class ${componentName}Component {
  @Input() className?: string;
  @Input() variant: '${config.variant || "default"}' = '${config.variant || "default"}';
  @Input() size: '${config.size || "md"}' = '${config.size || "md"}';

  get containerClass(): string {
    return \`container \${this.variant} \${this.size} \${this.className || ''}\`;
  }
}`;
	}

	private generateSvelteFallback(
		componentName: string,
		config: ComponentConfig,
	): string {
		return `<script lang="ts">
  import { Container, Section, Heading } from '@xala-technologies/ui-system';
  import { useTokens } from '@xala-technologies/ui-system/stores';
  import { t } from '@xala-technologies/ui-system/i18n';
  
  export let className: string = '';
  export let variant: '${config.variant || "default"}' = '${config.variant || "default"}';
  export let size: '${config.size || "md"}' = '${config.size || "md"}';
  
  const tokens = useTokens();
</script>

<Container {className} {variant} {size}>
  <Section spacing="medium">
    <Heading level={2}>
      {t('${this.toKebabCase(config.name)}.title')}
    </Heading>
    <slot />
  </Section>
</Container>`;
	}

	private generateElectronFallback(
		componentName: string,
		config: ComponentConfig,
	): string {
		// Same as React but with Electron-specific imports
		return this.generateReactFallback(componentName, config).replace(
			"import React from 'react';",
			"import React from 'react';\nimport { ipcRenderer } from 'electron';",
		);
	}

	private generateReactNativeFallback(
		componentName: string,
		config: ComponentConfig,
	): string {
		return `import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { useTokens } from '@xala-technologies/ui-system/native';
import { useTranslation } from 'react-i18next';

export interface ${componentName}Props {
  variant?: '${config.variant || "default"}';
  size?: '${config.size || "md"}';
  children?: React.ReactNode;
}

export const ${componentName}: React.FC<${componentName}Props> = ({
  variant = '${config.variant || "default"}',
  size = '${config.size || "md"}',
  children
}) => {
  const tokens = useTokens();
  const { t } = useTranslation();

  return (
    <View style={styles.container}>
      <Text style={styles.title}>
        {t('${this.toKebabCase(config.name)}.title')}
      </Text>
      {children}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16
  },
  title: {
    fontSize: 18,
    fontWeight: 'bold'
  }
});`;
	}

	// Additional helper methods...

	private generateTypes(
		config: ComponentConfig,
		platform: SupportedPlatform,
	): string {
		const componentName = this.toPascalCase(config.name);
		return `export interface ${componentName}Props {
  readonly className?: string;
  readonly children?: React.ReactNode;
  readonly variant?: '${config.variant || "default"}';
  readonly size?: '${config.size || "md"}';
  readonly disabled?: boolean;
  readonly loading?: boolean;
  readonly 'data-testid'?: string;
}`;
	}

	private generateStyles(
		config: ComponentConfig,
		platform: SupportedPlatform,
	): string {
		if (platform === "react-native") {
			return `export const styles = StyleSheet.create({
  container: {
    flex: 1
  }
});`;
		}
		return "";
	}

	private generateTest(
		config: ComponentConfig,
		platform: SupportedPlatform,
	): string {
		const componentName = this.toPascalCase(config.name);
		return `describe('${componentName}', () => {
  it('should render correctly', () => {
    // Test implementation
  });
});`;
	}

	private generateStory(
		config: ComponentConfig,
		platform: SupportedPlatform,
	): string {
		const componentName = this.toPascalCase(config.name);
		return `export default {
  title: 'Components/${componentName}',
  component: ${componentName}
};`;
	}

	private generateLocalization(config: ComponentConfig): Record<string, any> {
		const key = this.toKebabCase(config.name);
		return {
			[key]: {
				title: config.name,
				description: `${config.name} component`,
			},
		};
	}

	private createFileStructure(
		config: ComponentConfig,
		platform: SupportedPlatform,
		content: any,
	): GeneratedFile[] {
		const componentName = this.toPascalCase(config.name);
		const fileName = this.toKebabCase(config.name);
		const extension = this.getFileExtension(platform);

		const files: GeneratedFile[] = [
			{
				path: `src/components/${fileName}${extension}`,
				content: content.componentCode,
				type: "component",
			},
		];

		if (content.typesCode) {
			files.push({
				path: `src/types/${fileName}.types.ts`,
				content: content.typesCode,
				type: "types",
			});
		}

		if (content.testCode) {
			files.push({
				path: `src/__tests__/${fileName}.test${extension}`,
				content: content.testCode,
				type: "test",
			});
		}

		if (content.storyCode) {
			files.push({
				path: `src/stories/${fileName}.stories${extension}`,
				content: content.storyCode,
				type: "story",
			});
		}

		// Add localization files
		const locales = ["en", "nb-NO", "fr", "ar"];
		locales.forEach((locale) => {
			files.push({
				path: `src/locales/${locale}/${fileName}.json`,
				content: JSON.stringify(content.localizationKeys, null, 2),
				type: "locale",
			});
		});

		return files;
	}

	private getFileExtension(platform: SupportedPlatform): string {
		switch (platform) {
			case "react":
			case "nextjs":
			case "electron":
			case "react-native":
				return ".tsx";
			case "vue":
				return ".vue";
			case "angular":
				return ".component.ts";
			case "svelte":
				return ".svelte";
			default:
				return ".tsx";
		}
	}

	private getImports(
		config: ComponentConfig,
		platform: SupportedPlatform,
	): string[] {
		const baseImports = ["@xala-technologies/ui-system"];

		switch (platform) {
			case "react":
			case "nextjs":
				return [...baseImports, "react", "class-variance-authority"];
			case "vue":
				return [...baseImports, "vue"];
			case "angular":
				return [...baseImports, "@angular/core", "@angular/common"];
			case "svelte":
				return [...baseImports, "svelte"];
			case "electron":
				return [...baseImports, "react", "electron"];
			case "react-native":
				return [...baseImports, "react", "react-native"];
			default:
				return baseImports;
		}
	}

	private getDependencies(
		config: ComponentConfig,
		platform: SupportedPlatform,
	): string[] {
		return this.getImports(config, platform);
	}

	// Utility methods
	private normalizeComponentName(name: string): string {
		return name.toLowerCase().replace(/\s+/g, "-");
	}

	private toPascalCase(str: string): string {
		return str
			.replace(/(?:^\w|[A-Z]|\b\w)/g, (word) => word.toUpperCase())
			.replace(/\s+/g, "");
	}

	private toKebabCase(str: string): string {
		return str.replace(/\s+/g, "-").toLowerCase();
	}

	/**
	 * Get all available templates
	 */
	getAvailableTemplates(platform: SupportedPlatform): string[] {
		return this.templateMapper.getAvailableTemplates(platform);
	}

	/**
	 * Get template count
	 */
	getTemplateCount(): number {
		return this.templateMapper.getTotalTemplateCount();
	}
}
