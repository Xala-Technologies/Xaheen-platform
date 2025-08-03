/**
 * Test Page - Xala UI System v5.0.0 Compliant
 * Generated with Xaheen CLI
 * 
 * MANDATORY COMPLIANCE RULES:
 * ✅ ONLY semantic components from @xala-technologies/ui-system
 * ✅ MANDATORY localization for all text
 * ✅ Explicit TypeScript return types
 */

import { Container, Stack, Typography, Button } from '@xala-technologies/ui-system';
import { LocalePageProps } from '@/types/i18n';
import Link from 'next/link';

/**
 * Test page to verify locale routing and UI System integration
 */
export default async function TestPage({ params }: LocalePageProps): Promise<React.JSX.Element> {
  const { locale } = await params;

  return (
    <Container size="lg" padding="lg">
      <Stack direction="vertical" gap="lg" align="center">
        <Typography variant="h1" color="primary">
          Test Page
        </Typography>
        
        <Typography variant="body" color="muted">
          Current locale: {locale}
        </Typography>
        
        <Typography variant="body">
          This page tests the locale routing and UI System integration.
        </Typography>
        
        <Link href={`/${locale}`}>
          <Button variant="primary" size="lg">
            Back to Homepage
          </Button>
        </Link>
      </Stack>
    </Container>
  );
}
