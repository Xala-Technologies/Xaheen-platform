/**
 * Homepage - Xala UI System v5.0.0 Compliant
 * Generated with Xaheen CLI
 * 
 * MANDATORY COMPLIANCE RULES:
 * ❌ NO raw HTML elements (div, span, p, h1-h6, button, input, etc.)
 * ✅ ONLY semantic components from @xala-technologies/ui-system
 * ❌ NO hardcoded styling (no style={}, no arbitrary Tailwind values)
 * ✅ MANDATORY design token usage for all colors, spacing, typography
 * ❌ NO hardcoded user-facing text - ALL text must use t() function
 * ✅ MANDATORY localization: English, Norwegian Bokmål, French, Arabic
 * ✅ Explicit TypeScript return types (no 'any' types)
 */

import { 
  Container, 
  Stack, 
  Typography
} from '@xala-technologies/ui-system';
import { PageProps } from '@/types/i18n';
import { getI18nInstance } from '@/lib/i18n';
import { HomePage } from '@/components/homepage/HomePage';

/**
 * Main homepage with proper Xala UI System v5.0.0 integration
 * Features full localization, accessibility, and responsive design
 */
export default async function LocalizedHomePage({ params }: PageProps): Promise<React.JSX.Element> {
  const { locale } = await params;
  const i18n = await getI18nInstance(locale);
  const t = i18n.getFixedT(locale, 'common');

  return (
    <Container size="full" padding="none">
      <Stack direction="vertical" gap="xl">
        {/* Page Header with Localized Content */}
        <Container size="lg" padding="xl">
          <Stack direction="vertical" gap="lg" align="center">
            <Typography variant="h1" size="xl" align="center">
              {t('homepage.title')}
            </Typography>
            <Typography variant="body" size="lg" color="muted" align="center">
              {t('homepage.subtitle')}
            </Typography>
          </Stack>
        </Container>

        {/* Main Homepage Content */}
        <HomePage />
      </Stack>
    </Container>
  );
}
