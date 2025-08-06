# 🌍 Pure Localization Architecture

## ✅ **Registry Components = Pure & Localization-Agnostic**

Registry components should accept localized text as **props**, not import from constants. This makes them:

- **🎯 Framework Agnostic**: Works with any i18n solution
- **🎯 Consumer Controlled**: Apps provide their own translations  
- **🎯 Runtime Flexible**: Easy language switching
- **🎯 Pure Components**: No dependencies on specific localization systems

## **❌ Old Approach (Dependency on Constants)**

```typescript
// ❌ BAD: Component depends on specific constants
import { LABELS } from '../../lib/constants';

export const SearchBox = () => {
  return (
    <input 
      placeholder={LABELS.searchPlaceholder}  // Hard dependency
      aria-label={LABELS.searchAriaLabel}
    />
  );
};
```

## **✅ New Approach (Props-Based Localization)**

```typescript
// ✅ GOOD: Component accepts localized text as props
export interface SearchBoxProps {
  readonly placeholder?: string;
  readonly ariaLabel?: string;
  readonly searchText?: string;
  readonly clearText?: string;
  readonly noResultsText?: string;
}

export const SearchBox = ({ 
  placeholder = 'Search...',     // English fallback
  ariaLabel = 'Search input',
  searchText = 'Search',
  clearText = 'Clear', 
  noResultsText = 'No results'
}: SearchBoxProps) => {
  return (
    <div>
      <input 
        placeholder={placeholder}
        aria-label={ariaLabel}
      />
      <button>{searchText}</button>
      <button>{clearText}</button>
      {noResults && <p>{noResultsText}</p>}
    </div>
  );
};
```

## **🏗️ Consumer Implementation Examples**

### **With react-i18next**
```typescript
import { useTranslation } from 'react-i18next';
import { SearchBox } from '@xaheen-ai/design-system/registry';

const App = () => {
  const { t } = useTranslation();
  
  return (
    <SearchBox 
      placeholder={t('search.placeholder')}
      ariaLabel={t('search.ariaLabel')}
      searchText={t('search.button')}
      clearText={t('search.clear')}
      noResultsText={t('search.noResults')}
    />
  );
};
```

### **With next-i18next**
```typescript
import { useTranslation } from 'next-i18next';
import { SearchBox } from '@xaheen-ai/design-system/registry';

const HomePage = () => {
  const { t } = useTranslation('common');
  
  return (
    <SearchBox 
      placeholder={t('search.placeholder')}
      ariaLabel={t('search.ariaLabel')}
      searchText={t('search.button')}
    />
  );
};
```

### **With Custom Localization**
```typescript
import { SearchBox } from '@xaheen-ai/design-system/registry';
import { useLocale } from './hooks/useLocale';

const App = () => {
  const { getText } = useLocale();
  
  return (
    <SearchBox 
      placeholder={getText('search.placeholder')}
      ariaLabel={getText('search.ariaLabel')}
      searchText={getText('search.button')}
    />
  );
};
```

### **With Static Norwegian Text**
```typescript
import { SearchBox } from '@xaheen-ai/design-system/registry';

const NorwegianApp = () => {
  return (
    <SearchBox 
      placeholder="Søk etter alt..."
      ariaLabel="Søkefelt"
      searchText="Søk"
      clearText="Tøm"
      noResultsText="Ingen resultater funnet"
    />
  );
};
```

## **🎯 Benefits of This Approach**

### **1. Framework Flexibility**
- ✅ Works with any i18n library (react-i18next, next-i18next, FormatJS, etc.)
- ✅ Works with custom localization solutions
- ✅ Works with static text (no i18n needed)

### **2. Runtime Language Switching**
- ✅ Languages can be changed without rebuilding components
- ✅ Text updates immediately when locale changes
- ✅ No component re-imports needed

### **3. Consumer Control**
- ✅ Apps decide which texts to make translatable
- ✅ Apps control translation keys and structure
- ✅ Apps can override specific texts easily

### **4. Pure Components**
- ✅ No dependencies on specific constants or i18n libraries
- ✅ Easy to test (just pass different text props)
- ✅ Truly reusable across different projects

## **📋 Implementation Guidelines**

### **For Simple Components**
- Accept text as direct props with English fallbacks
- Use descriptive prop names (`submitText`, `cancelText`, etc.)

### **For Complex Components**
- Group related texts in text objects
- Provide comprehensive fallbacks
- Document all text props clearly

### **Example: Complex Component Text Props**
```typescript
export interface ChatInterfaceTexts {
  readonly sendMessage: string;
  readonly typing: string;
  readonly offline: string;
  readonly attachFile: string;
  readonly emojiPicker: string;
  readonly messageDeleted: string;
  readonly editMessage: string;
  readonly today: string;
  readonly yesterday: string;
}

export interface ChatInterfaceProps {
  // ... other props
  readonly texts?: Partial<ChatInterfaceTexts>;
}

const defaultTexts: ChatInterfaceTexts = {
  sendMessage: 'Send message',
  typing: 'typing...',
  offline: 'Offline',
  attachFile: 'Attach file',
  emojiPicker: 'Add emoji',
  messageDeleted: 'Message deleted',
  editMessage: 'Edit message',
  today: 'Today',
  yesterday: 'Yesterday'
};

export const ChatInterface = ({ texts = {}, ...props }: ChatInterfaceProps) => {
  const t = { ...defaultTexts, ...texts };
  
  return (
    <div>
      <button>{t.sendMessage}</button>
      <span>{t.typing}</span>
      {/* Use t.* throughout component */}
    </div>
  );
};
```

## **🚀 Migration Strategy**

1. **✅ Registry components accept text props with English fallbacks**
2. **✅ Remove imports from constants files**  
3. **✅ Update TypeScript interfaces to include text props**
4. **✅ Provide comprehensive prop documentation**
5. **📝 Update Storybook stories to show localization examples**
6. **📝 Create consumer implementation guides**

This architecture makes the design system truly **framework-agnostic** and **consumer-friendly**! 🎉