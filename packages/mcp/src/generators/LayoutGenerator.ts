/**
 * Layout Generator for Xala UI System
 */

import type { LayoutConfig } from "../types/index.js";

export class LayoutGenerator {
	generateLayout(config: LayoutConfig): string {
		switch (config.layoutType) {
			case "admin":
				return this.generateAdminLayout(config);
			case "web":
				return this.generateWebLayout(config);
			case "desktop":
				return this.generateDesktopLayout(config);
			case "mobile":
				return this.generateMobileLayout(config);
			case "tablet":
				return this.generateTabletLayout(config);
			case "base":
				return this.generateBaseLayout(config);
			default:
				throw new Error(`Unknown layout type: ${config.layoutType}`);
		}
	}

	private generateAdminLayout(config: LayoutConfig): string {
		const componentName = this.toPascalCase(config.name);

		return `// components/layouts/${componentName}.tsx
import {
  AdminLayout,
  AdminSidebar,
  AdminTopBar,
  AdminContent,
  Container,
  Stack,
  Typography,
  useTokens
} from '@xala-technologies/ui-system';
import { useTranslation } from 'react-i18next';
import { ReactNode } from 'react';

export interface ${componentName}Props {
  readonly children: ReactNode;
  readonly title?: string;
  readonly breadcrumbs?: Array<{
    readonly label: string;
    readonly href?: string;
  }>;
  readonly sidebarCollapsed?: boolean;
  readonly onSidebarToggle?: () => void;
}

export function ${componentName}({
  children,
  title,
  breadcrumbs = [],
  sidebarCollapsed = false,
  onSidebarToggle
}: ${componentName}Props): JSX.Element {
  const { t } = useTranslation();
  const { colors, spacing } = useTokens();

  return (
    <AdminLayout
      sidebar={
        <AdminSidebar
          collapsed={sidebarCollapsed}
          onToggle={onSidebarToggle}
          navigation={[
            {
              key: 'dashboard',
              label: t('nav.dashboard'),
              href: '/admin',
              icon: 'Home'
            },
            {
              key: 'users',
              label: t('nav.users'),
              href: '/admin/users',
              icon: 'Users'
            },
            {
              key: 'settings',
              label: t('nav.settings'),
              href: '/admin/settings',
              icon: 'Settings'
            }
          ]}
        />
      }
      topBar={
        <AdminTopBar
          title={title || t('admin.dashboard')}
          breadcrumbs={breadcrumbs}
          actions={
            <Stack direction="horizontal" align="center" gap="sm">
              {/* Add admin actions here */}
            </Stack>
          }
        />
      }
    >
      <AdminContent>
        <Container size="full" padding="lg">
          {children}
        </Container>
      </AdminContent>
    </AdminLayout>
  );
}`;
	}

	private generateWebLayout(config: LayoutConfig): string {
		const componentName = this.toPascalCase(config.name);

		return `// components/layouts/${componentName}.tsx
import {
  WebLayout,
  WebNavbar,
  WebContent,
  WebFooter,
  Container,
  Stack,
  Typography,
  useTokens
} from '@xala-technologies/ui-system';
import { useTranslation } from 'react-i18next';
import { ReactNode } from 'react';

export interface ${componentName}Props {
  readonly children: ReactNode;
  readonly showNavbar?: boolean;
  readonly showFooter?: boolean;
  readonly navbarProps?: any;
  readonly footerProps?: any;
}

export function ${componentName}({
  children,
  showNavbar = true,
  showFooter = true,
  navbarProps = {},
  footerProps = {}
}: ${componentName}Props): JSX.Element {
  const { t } = useTranslation();
  const { colors, spacing } = useTokens();

  return (
    <WebLayout>
      {showNavbar && (
        <WebNavbar
          logo={
            <Typography variant="h3" weight="bold">
              {t('brand.name')}
            </Typography>
          }
          navigation={[
            {
              key: 'home',
              label: t('nav.home'),
              href: '/'
            },
            {
              key: 'about',
              label: t('nav.about'),
              href: '/about'
            },
            {
              key: 'contact',
              label: t('nav.contact'),
              href: '/contact'
            }
          ]}
          {...navbarProps}
        />
      )}
      
      <WebContent>
        <Container size="xl" padding="lg">
          {children}
        </Container>
      </WebContent>
      
      {showFooter && (
        <WebFooter
          links={[
            { label: t('footer.privacy'), href: '/privacy' },
            { label: t('footer.terms'), href: '/terms' },
            { label: t('footer.support'), href: '/support' }
          ]}
          {...footerProps}
        />
      )}
    </WebLayout>
  );
}`;
	}

	private generateDesktopLayout(config: LayoutConfig): string {
		const componentName = this.toPascalCase(config.name);

		return `// components/layouts/${componentName}.tsx
import {
  DesktopLayout,
  DesktopHeader,
  DesktopSidebar,
  DesktopMainContent,
  DesktopToolbar,
  DesktopStatusBar,
  Container,
  Stack,
  Typography,
  useTokens
} from '@xala-technologies/ui-system';
import { useTranslation } from 'react-i18next';
import { ReactNode } from 'react';

export interface ${componentName}Props {
  readonly children: ReactNode;
  readonly showSidebar?: boolean;
  readonly showToolbar?: boolean;
  readonly showStatusBar?: boolean;
}

export function ${componentName}({
  children,
  showSidebar = true,
  showToolbar = true,
  showStatusBar = true
}: ${componentName}Props): JSX.Element {
  const { t } = useTranslation();
  const { colors, spacing } = useTokens();

  return (
    <DesktopLayout>
      <DesktopHeader>
        <Container size="full" padding="md">
          <Stack direction="horizontal" justify="between" align="center">
            <Typography variant="h2" weight="bold">
              {t('app.title')}
            </Typography>
            <Stack direction="horizontal" gap="sm">
              {/* Header actions */}
            </Stack>
          </Stack>
        </Container>
      </DesktopHeader>
      
      {showSidebar && (
        <DesktopSidebar>
          {/* Sidebar content */}
        </DesktopSidebar>
      )}
      
      {showToolbar && (
        <DesktopToolbar>
          {/* Toolbar content */}
        </DesktopToolbar>
      )}
      
      <DesktopMainContent>
        <Container size="full" padding="lg">
          {children}
        </Container>
      </DesktopMainContent>
      
      {showStatusBar && (
        <DesktopStatusBar>
          {/* Status bar content */}
        </DesktopStatusBar>
      )}
    </DesktopLayout>
  );
}`;
	}

	private generateMobileLayout(config: LayoutConfig): string {
		const componentName = this.toPascalCase(config.name);

		return `// components/layouts/${componentName}.tsx
import {
  MobileLayout,
  MobileHeader,
  MobileContent,
  MobileBottomNavigation,
  Container,
  Stack,
  Typography,
  IconButton,
  useTokens
} from '@xala-technologies/ui-system';
import { Menu } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { ReactNode, useState } from 'react';

export interface ${componentName}Props {
  readonly children: ReactNode;
  readonly showBottomNav?: boolean;
  readonly title?: string;
}

export function ${componentName}({
  children,
  showBottomNav = true,
  title
}: ${componentName}Props): JSX.Element {
  const { t } = useTranslation();
  const { colors, spacing } = useTokens();
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  return (
    <MobileLayout>
      <MobileHeader>
        <Container size="full" padding="md">
          <Stack direction="horizontal" justify="between" align="center">
            <IconButton
              variant="ghost"
              size="sm"
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              aria-label={t('navigation.toggleMenu')}
            >
              <Menu size={20} />
            </IconButton>
            
            <Typography variant="h4" weight="bold">
              {title || t('app.title')}
            </Typography>
            
            <div style={{ width: '40px' }} /> {/* Spacer for centering */}
          </Stack>
        </Container>
      </MobileHeader>
      
      <MobileContent>
        <Container size="full" padding="md">
          {children}
        </Container>
      </MobileContent>
      
      {showBottomNav && (
        <MobileBottomNavigation
          items={[
            {
              key: 'home',
              label: t('nav.home'),
              icon: 'Home',
              href: '/'
            },
            {
              key: 'search',
              label: t('nav.search'),
              icon: 'Search',
              href: '/search'
            },
            {
              key: 'profile',
              label: t('nav.profile'),
              icon: 'User',
              href: '/profile'
            }
          ]}
        />
      )}
    </MobileLayout>
  );
}`;
	}

	private generateTabletLayout(config: LayoutConfig): string {
		const componentName = this.toPascalCase(config.name);

		return `// components/layouts/${componentName}.tsx
import {
  TabletLayout,
  TabletHeader,
  TabletSidebar,
  Container,
  Stack,
  Typography,
  useTokens
} from '@xala-technologies/ui-system';
import { useTranslation } from 'react-i18next';
import { ReactNode } from 'react';

export interface ${componentName}Props {
  readonly children: ReactNode;
  readonly showSidebar?: boolean;
  readonly sidebarPosition?: 'left' | 'right';
}

export function ${componentName}({
  children,
  showSidebar = true,
  sidebarPosition = 'left'
}: ${componentName}Props): JSX.Element {
  const { t } = useTranslation();
  const { colors, spacing } = useTokens();

  return (
    <TabletLayout>
      <TabletHeader>
        <Container size="full" padding="lg">
          <Stack direction="horizontal" justify="between" align="center">
            <Typography variant="h2" weight="bold">
              {t('app.title')}
            </Typography>
            <Stack direction="horizontal" gap="md">
              {/* Header actions */}
            </Stack>
          </Stack>
        </Container>
      </TabletHeader>
      
      <Stack direction="horizontal" style={{ flex: 1 }}>
        {showSidebar && sidebarPosition === 'left' && (
          <TabletSidebar position="left">
            {/* Left sidebar content */}
          </TabletSidebar>
        )}
        
        <Container size="full" padding="lg" style={{ flex: 1 }}>
          {children}
        </Container>
        
        {showSidebar && sidebarPosition === 'right' && (
          <TabletSidebar position="right">
            {/* Right sidebar content */}
          </TabletSidebar>
        )}
      </Stack>
    </TabletLayout>
  );
}`;
	}

	private generateBaseLayout(config: LayoutConfig): string {
		const componentName = this.toPascalCase(config.name);

		return `// components/layouts/${componentName}.tsx
import {
  BaseLayout,
  Header,
  MainContent,
  Footer,
  Sidebar,
  Container,
  Stack,
  Typography,
  useTokens
} from '@xala-technologies/ui-system';
import { useTranslation } from 'react-i18next';
import { ReactNode } from 'react';

export interface ${componentName}Props {
  readonly children: ReactNode;
  readonly showHeader?: boolean;
  readonly showFooter?: boolean;
  readonly showSidebar?: boolean;
  readonly sidebarPosition?: 'left' | 'right';
}

export function ${componentName}({
  children,
  showHeader = true,
  showFooter = true,
  showSidebar = false,
  sidebarPosition = 'left'
}: ${componentName}Props): JSX.Element {
  const { t } = useTranslation();
  const { colors, spacing } = useTokens();

  return (
    <BaseLayout>
      {showHeader && (
        <Header>
          <Container size="xl" padding="lg">
            <Stack direction="horizontal" justify="between" align="center">
              <Typography variant="h2" weight="bold">
                {t('app.title')}
              </Typography>
              <Stack direction="horizontal" gap="md">
                {/* Header content */}
              </Stack>
            </Stack>
          </Container>
        </Header>
      )}
      
      <Stack direction="horizontal" style={{ flex: 1 }}>
        {showSidebar && sidebarPosition === 'left' && (
          <Sidebar position="left">
            {/* Left sidebar content */}
          </Sidebar>
        )}
        
        <MainContent>
          <Container size="xl" padding="lg">
            {children}
          </Container>
        </MainContent>
        
        {showSidebar && sidebarPosition === 'right' && (
          <Sidebar position="right">
            {/* Right sidebar content */}
          </Sidebar>
        )}
      </Stack>
      
      {showFooter && (
        <Footer>
          <Container size="xl" padding="lg">
            <Stack direction="horizontal" justify="center" align="center">
              <Typography variant="body" color="muted">
                {t('footer.copyright', { year: new Date().getFullYear() })}
              </Typography>
            </Stack>
          </Container>
        </Footer>
      )}
    </BaseLayout>
  );
}`;
	}

	private toPascalCase(str: string): string {
		return str
			.replace(/(?:^\w|[A-Z]|\b\w)/g, (word, index) => {
				return index === 0 ? word.toLowerCase() : word.toUpperCase();
			})
			.replace(/\s+/g, "")
			.replace(/^./, (str) => str.toUpperCase());
	}

	/**
	 * Generate layout using Container, Grid, and Stack specifications (async version for MCP tools)
	 */
	public async generateAdvancedLayout(config: {
		name: string;
		structure: {
			container?: any;
			grid?: any;
			stacks?: any[];
		};
		responsive: boolean;
		semanticHTML: boolean;
	}): Promise<string> {
		const { name, structure, responsive, semanticHTML } = config;

		const layoutCode = `
/**
 * Generated Layout: ${name}
 * Responsive: ${responsive}
 * Semantic HTML: ${semanticHTML}
 */

import React from 'react';
import { Container, Grid, Stack } from '@xala-technologies/ui-system';
import { t } from '@xala-technologies/ui-system/i18n';

interface ${name}Props {
  readonly children?: React.ReactNode;
  readonly className?: string;
}

export const ${name}: React.FC<${name}Props> = ({
  children,
  className
}) => {
  return (
    <${semanticHTML ? "main" : "div"} className={className}>
      <Container 
        ${structure.container ? `size="${structure.container.size || "full"}"` : 'size="full"'}
        ${structure.container ? `padding="${structure.container.padding || "lg"}"` : 'padding="lg"'}
      >
        ${
					structure.grid
						? `
        <Grid
          columns={${structure.grid.columns || 12}}
          gap="${structure.grid.gap || "md"}"
          ${responsive ? "responsive" : ""}
        >
          ${
						structure.stacks
							?.map(
								(stack, index) => `
          <Stack
            direction="${stack.direction || "vertical"}"
            gap="${stack.gap || "md"}"
            align="${stack.align || "start"}"
            justify="${stack.justify || "start"}"
            className="grid-item"
          >
            {/* Stack ${index + 1} content */}
          </Stack>
          `,
							)
							.join("") || ""
					}
        </Grid>
        `
						: `
        <Stack
          direction="vertical"
          gap="lg"
          className="layout-main"
        >
          {children}
        </Stack>
        `
				}
      </Container>
    </${semanticHTML ? "main" : "div"}>
  );
};

${name}.displayName = '${name}';
`;

		return layoutCode;
	}
}
