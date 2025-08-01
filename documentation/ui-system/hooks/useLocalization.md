# useLocalization Hook

## Purpose
`useLocalization` is a custom hook for accessing and switching the current locale in the Xala UI System. It enables localization of all user-facing text and supports runtime language switching.

## Usage
```typescript
import { useLocalization } from '@xala-technologies/ui-system';

const { locale, setLocale, t } = useLocalization();

// Example: t('button.submit')
```

## Returns
```typescript
interface LocalizationContext {
  locale: 'en' | 'nb' | 'fr' | 'ar';
  setLocale: (locale: 'en' | 'nb' | 'fr' | 'ar') => void;
  t: (key: string) => string;
}
```

## Best Practices
- Never hardcode user-facing text
- Use `t(key)` for all labels, placeholders, and messages
- Supports English (fallback), Norwegian Bokmål, French, Arabic

## Compliance
- Ensures WCAG, GDPR, NSM compliance for multilingual support

## Further Reading
- [Localization Guide](../localization.md)
- [UISystemProvider](../components/uisystemprovider.md)
