// components/layouts/DashboardLayout.tsx
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

export interface DashboardLayoutProps {
  readonly children: ReactNode;
  readonly showNavbar?: boolean;
  readonly showFooter?: boolean;
  readonly navbarProps?: any;
  readonly footerProps?: any;
}

export function DashboardLayout({
  children,
  showNavbar = true,
  showFooter = true,
  navbarProps = {},
  footerProps = {}
}: DashboardLayoutProps): JSX.Element {
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
}