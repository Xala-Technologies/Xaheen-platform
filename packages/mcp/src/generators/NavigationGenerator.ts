/**
 * Navigation Generator for Xala UI System
 */

import type { ComponentConfig } from "../types/index.js";

export class NavigationGenerator {
	public generateNavigation(config: ComponentConfig): string {
		const { name } = config;

		return `
import React from 'react';
import { useTranslation } from 'react-i18next';
import { 
  Navigation, 
  NavigationItem, 
  Stack,
  Button,
  useTokens 
} from '@xala-technologies/ui-system';

export interface ${name}Props {
  items?: Array<{
    key: string;
    label: string;
    href: string;
    icon?: string;
  }>;
  onItemClick?: (key: string) => void;
}

export function ${name}({ items = [], onItemClick }: ${name}Props): JSX.Element {
  const { t } = useTranslation();
  const tokens = useTokens();

  const handleItemClick = (key: string): void => {
    if (onItemClick) {
      onItemClick(key);
    }
  };

  return (
    <Navigation>
      <Stack direction="horizontal" gap={tokens.spacing.sm}>
        {items.map((item) => (
          <NavigationItem key={item.key}>
            <Button
              variant="ghost"
              onClick={() => handleItemClick(item.key)}
            >
              {t(\`navigation.\${item.key}\`)}
            </Button>
          </NavigationItem>
        ))}
      </Stack>
    </Navigation>
  );
}`;
	}

	/**
	 * Generate navigation using WebNavbar, Sidebar, Tabs, or Breadcrumb specifications (async version for MCP tools)
	 */
	public async generateAdvancedNavigation(config: {
		type: "WebNavbar" | "Sidebar" | "Tabs" | "Breadcrumb" | "Pagination";
		name: string;
		items: any[];
		variant?: string;
		norwegianLocale: boolean;
	}): Promise<string> {
		const { type, name, items, variant, norwegianLocale } = config;

		const navCode = `
/**
 * Generated Navigation: ${name}
 * Type: ${type}
 * Norwegian Locale: ${norwegianLocale}
 */

import React from 'react';
import { ${type}, Button, Stack } from '@xala-technologies/ui-system';
import { t } from '@xala-technologies/ui-system/i18n';

interface ${name}Props {
  readonly items?: Array<{
    key: string;
    label: string;
    href?: string;
    icon?: string;
    active?: boolean;
    children?: Array<any>;
  }>;
  readonly onItemClick?: (key: string) => void;
  readonly className?: string;
}

export const ${name}: React.FC<${name}Props> = ({
  items = [],
  onItemClick,
  className
}) => {
  const handleItemClick = (key: string) => {
    onItemClick?.(key);
  };

  return (
    <${type}
      className={className}
      ${variant ? `variant="${variant}"` : ""}
      items={items.map(item => ({
        ...item,
        label: t(\`${name.toLowerCase()}.\${item.key}\`, { defaultValue: item.label }),
        onClick: () => handleItemClick(item.key)
      }))}
      aria-label={t('${name.toLowerCase()}.navigationLabel')}
    />
  );
};

${name}.displayName = '${name}';
`;

		return navCode;
	}
}
