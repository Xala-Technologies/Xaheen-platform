# Localization Guide

## Overview
Localization in the Xala UI System enables all user-facing text to be translated and adapted for multiple languages and regions, supporting accessibility and compliance.

## Supported Languages
- English (primary, fallback)
- Norwegian Bokmål
- French
- Arabic

## How It Works
- All components use the `useLocalization` hook or context
- Text keys are defined in localization files (see `/src/localization`)
- The `UISystemProvider` sets the global locale
- Language can be switched at runtime

## Usage Example
```typescript
import { useLocalization } from '@xala-technologies/ui-system';

const { t } = useLocalization();

<Button>{t('button.submit')}</Button>
```

## Adding/Extending Languages
- Add new locale files in `/src/localization`
- Update language keys and translations
- Register new locale in provider and hooks

## Best Practices
- Never hardcode user-facing text
- Always use the `t(key)` function
- Validate translations for accessibility and clarity

## Compliance
- Fully GDPR, NSM, and WCAG 2.2 AA compliant

## Further Reading
- [useLocalization Hook](./hooks/useLocalization.md)
- [UISystemProvider](./components/uisystemprovider.md)
- [Architecture Principles](./architecture.md)
