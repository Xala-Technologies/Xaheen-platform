import { existsSync, mkdirSync, writeFileSync } from "fs";
import { join } from "path";
import { logger } from "../../utils/logger.js";
import type { GenerationOptions, ThemeConfig } from "../theme-generator.js";

export class ThemeTokenGenerator {
	async generate(
		config: ThemeConfig,
		options: GenerationOptions,
	): Promise<void> {
		const tokensDir = join(options.outputDir, "themes", config.name, "tokens");
		if (!existsSync(tokensDir)) {
			mkdirSync(tokensDir, { recursive: true });
		}

		// Generate CSS custom properties
		await this.generateCSSTokens(config, tokensDir);

		// Generate TypeScript tokens
		await this.generateTypeScriptTokens(config, tokensDir);

		// Generate JSON tokens
		await this.generateJSONTokens(config, tokensDir);

		logger.info(`Design tokens generated for theme: ${config.name}`);
	}

	private async generateCSSTokens(
		config: ThemeConfig,
		tokensDir: string,
	): Promise<void> {
		const cssContent = this.createCSSContent(config);
		const cssPath = join(tokensDir, "tokens.css");
		writeFileSync(cssPath, cssContent);
	}

	private async generateTypeScriptTokens(
		config: ThemeConfig,
		tokensDir: string,
	): Promise<void> {
		const tsContent = this.createTypeScriptContent(config);
		const tsPath = join(tokensDir, "tokens.ts");
		writeFileSync(tsPath, tsContent);
	}

	private async generateJSONTokens(
		config: ThemeConfig,
		tokensDir: string,
	): Promise<void> {
		const jsonContent = this.createJSONContent(config);
		const jsonPath = join(tokensDir, "tokens.json");
		writeFileSync(jsonPath, JSON.stringify(jsonContent, null, 2));
	}

	private createCSSContent(config: ThemeConfig): string {
		return `:root {
  /* Brand Colors */
  --color-primary: ${config.colors.primary || "#0ea5e9"};
  --color-secondary: ${config.colors.secondary || "#64748b"};
  
  /* Spacing (8pt Grid) */
  --spacing-0: 0px;
  --spacing-1: 4px;
  --spacing-2: 8px;
  --spacing-3: 12px;
  --spacing-4: 16px;
  --spacing-6: 24px;
  --spacing-8: 32px;
  --spacing-12: 48px;
  --spacing-16: 64px;
  --spacing-20: 80px;
  
  /* Typography */
  --font-size-xs: 12px;
  --font-size-sm: 14px;
  --font-size-base: 16px;
  --font-size-lg: 18px;
  --font-size-xl: 20px;
  --font-size-2xl: 24px;
  
  /* Elevation */
  --shadow-sm: 0 1px 2px 0 rgba(0, 0, 0, 0.05);
  --shadow-md: 0 4px 6px -1px rgba(0, 0, 0, 0.1);
  --shadow-lg: 0 10px 15px -3px rgba(0, 0, 0, 0.1);
}`;
	}

	private createTypeScriptContent(config: ThemeConfig): string {
		return `export const ${config.name}Tokens = {
  colors: {
    primary: '${config.colors.primary || "#0ea5e9"}',
    secondary: '${config.colors.secondary || "#64748b"}',
  },
  spacing: {
    0: '0px',
    1: '4px',
    2: '8px',
    3: '12px',
    4: '16px',
    6: '24px',
    8: '32px',
    12: '48px',
    16: '64px',
    20: '80px',
  },
  typography: {
    fontSize: {
      xs: '12px',
      sm: '14px',
      base: '16px',
      lg: '18px',
      xl: '20px',
      '2xl': '24px',
    },
  },
  elevation: {
    sm: '0 1px 2px 0 rgba(0, 0, 0, 0.05)',
    md: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
    lg: '0 10px 15px -3px rgba(0, 0, 0, 0.1)',
  },
} as const;

export type ${config.name.charAt(0).toUpperCase() + config.name.slice(1)}Tokens = typeof ${config.name}Tokens;`;
	}

	private createJSONContent(config: ThemeConfig): Record<string, unknown> {
		return {
			colors: {
				primary: config.colors.primary || "#0ea5e9",
				secondary: config.colors.secondary || "#64748b",
			},
			spacing: {
				0: "0px",
				1: "4px",
				2: "8px",
				3: "12px",
				4: "16px",
				6: "24px",
				8: "32px",
				12: "48px",
				16: "64px",
				20: "80px",
			},
			typography: {
				fontSize: {
					xs: "12px",
					sm: "14px",
					base: "16px",
					lg: "18px",
					xl: "20px",
					"2xl": "24px",
				},
			},
			elevation: {
				sm: "0 1px 2px 0 rgba(0, 0, 0, 0.05)",
				md: "0 4px 6px -1px rgba(0, 0, 0, 0.1)",
				lg: "0 10px 15px -3px rgba(0, 0, 0, 0.1)",
			},
		};
	}
}
