# Accessibility Compliance Hook

This hook ensures all generated code meets WCAG AAA accessibility standards and Norwegian accessibility requirements.

## WCAG AAA Compliance Requirements

All generated components must meet the highest accessibility standards:

### Level AAA Requirements

1. **Color Contrast**: Text must have contrast ratio of at least 7:1 for normal text, 4.5:1 for large text
2. **Keyboard Navigation**: All interactive elements must be keyboard accessible
3. **Screen Reader Support**: All content must be properly announced by screen readers
4. **Focus Management**: Focus must be clearly visible and logically ordered
5. **Alternative Text**: All images and media must have descriptive alt text
6. **Semantic HTML**: Use proper HTML semantics and ARIA attributes

## Required Accessibility Patterns

### Interactive Elements

All buttons, links, and form controls must include:

```typescript
// Button Accessibility
<Button
  variant="primary"
  size="lg"
  aria-label={t('button.submit', { defaultValue: 'Submit form' })}
  aria-describedby="submit-help"
  disabled={isLoading}
  type="submit"
>
  {isLoading 
    ? t('button.submitting', { defaultValue: 'Submitting...' })
    : t('button.submit', { defaultValue: 'Submit' })
  }
</Button>

// Input Accessibility
<Input
  id="email"
  type="email"
  label={t('form.email.label', { defaultValue: 'Email Address' })}
  required
  aria-required="true"
  aria-describedby="email-error email-help"
  aria-invalid={!!errors.email}
  helperText={t('form.email.help', { defaultValue: 'We will use this to contact you' })}
  error={errors.email}
/>

// Link Accessibility  
<Button
  variant="link"
  aria-label={t('nav.home', { defaultValue: 'Go to homepage' })}
  onClick={() => router.push('/')}
>
  {t('nav.home.text', { defaultValue: 'Home' })}
</Button>
```

### Form Accessibility

Forms must include comprehensive accessibility features:

```typescript
<form
  role="form"
  aria-labelledby="form-title"
  aria-describedby="form-description"
  noValidate
>
  <Text id="form-title" variant="h1">
    {t('form.title', { defaultValue: 'Contact Form' })}
  </Text>
  
  <Text id="form-description" variant="body" color="secondary">
    {t('form.description', { defaultValue: 'Please fill out all required fields' })}
  </Text>

  {/* Required field indicator */}
  <Text variant="caption" color="secondary">
    <span aria-hidden="true">*</span> {t('form.required', { defaultValue: 'Required field' })}
  </Text>

  <Stack direction="vertical" gap="lg" role="group" aria-labelledby="personal-info">
    <Text id="personal-info" variant="h2">
      {t('form.personal_info', { defaultValue: 'Personal Information' })}
    </Text>
    
    {/* Form fields with proper labeling */}
  </Stack>
</form>
```

### Navigation Accessibility

Navigation components must support keyboard and screen reader navigation:

```typescript
<nav role="navigation" aria-label={t('nav.main', { defaultValue: 'Main navigation' })}>
  <Container>
    <Stack direction="horizontal" justify="between" align="center">
      <Button
        variant="link"
        aria-label={t('nav.logo', { defaultValue: 'Go to homepage' })}
        onClick={() => router.push('/')}
      >
        <Text variant="h3">Logo</Text>
      </Button>
      
      <ul role="menubar" className="flex space-x-4">
        <li role="none">
          <Button
            variant="link"
            role="menuitem"
            aria-current={pathname === '/' ? 'page' : undefined}
            onClick={() => router.push('/')}
          >
            {t('nav.home', { defaultValue: 'Home' })}
          </Button>
        </li>
        <li role="none">
          <Button
            variant="link" 
            role="menuitem"
            aria-current={pathname === '/about' ? 'page' : undefined}
            onClick={() => router.push('/about')}
          >
            {t('nav.about', { defaultValue: 'About' })}
          </Button>
        </li>
      </ul>
    </Stack>
  </Container>
</nav>
```

## Norwegian Accessibility Standards

Components must also meet Norwegian government accessibility requirements:

### UU-direktivet Compliance

Norway's accessibility directive requires:

1. **Norwegian Language Support**: All accessibility texts in Norwegian
2. **High Contrast Mode**: Support for high contrast themes
3. **Text Scaling**: Support for 200% text scaling without horizontal scrolling
4. **Keyboard-Only Navigation**: Full functionality without mouse
5. **Screen Reader Testing**: Compatibility with NVDA, JAWS, and VoiceOver

### Norwegian Accessibility Patterns

```typescript
// Norwegian accessibility texts
const norwegianA11yTexts = {
  skipToContent: 'Hopp til hovedinnhold',
  mainContent: 'Hovedinnhold',
  navigation: 'Navigering',
  searchForm: 'Søkeskjema',
  searchButton: 'Søk',
  closeDialog: 'Lukk dialog',
  previousPage: 'Forrige side',
  nextPage: 'Neste side'
};

// Skip link (required for Norwegian government sites)
<Button
  variant="link"
  className="sr-only focus:not-sr-only focus:absolute focus:top-4 focus:left-4 z-50"
  onClick={() => document.getElementById('main-content')?.focus()}
>
  {t('a11y.skip_to_content', { defaultValue: norwegianA11yTexts.skipToContent })}
</Button>

// Main content landmark
<main 
  id="main-content"
  role="main"
  aria-label={t('a11y.main_content', { defaultValue: norwegianA11yTexts.mainContent })}
  tabIndex={-1}
>
  {/* Page content */}
</main>
```

## Focus Management

Proper focus management is critical for accessibility:

### Focus Patterns

```typescript
// Focus trap for modals
const focusTrap = useFocusTrap(modalRef, {
  initialFocus: true,
  returnFocusOnDeactivate: true,
  escapeDeactivates: true
});

// Focus management for dynamic content
const handleAddItem = useCallback(() => {
  const newItem = addItem();
  // Focus the newly added item
  setTimeout(() => {
    document.getElementById(`item-${newItem.id}`)?.focus();
  }, 0);
}, [addItem]);

// Focus restoration after navigation
useEffect(() => {
  if (shouldRestoreFocus) {
    const element = document.getElementById(focusTargetId);
    element?.focus();
  }
}, [shouldRestoreFocus, focusTargetId]);
```

### Focus Indicators

All interactive elements must have visible focus indicators:

```typescript
// Focus styles are handled by UI System components
<Button
  variant="primary"
  // UI System automatically includes:
  // focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2
>
  Action
</Button>

// Custom focus styles when needed
<div
  tabIndex={0}
  className="focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2 rounded-md"
  onKeyDown={handleKeyDown}
>
  Custom interactive element
</div>
```

## Screen Reader Support

### ARIA Labels and Descriptions

All components must include proper ARIA attributes:

```typescript
// Complex interactive elements
<div
  role="tabpanel"
  id="panel-1"
  aria-labelledby="tab-1"
  aria-describedby="panel-description"
  tabIndex={0}
>
  <Text id="panel-description" className="sr-only">
    {t('tabs.panel_description', { defaultValue: 'Tab panel content' })}
  </Text>
  {/* Panel content */}
</div>

// Status announcements
<div 
  role="status" 
  aria-live="polite"
  aria-atomic="true"
  className="sr-only"
>
  {statusMessage}
</div>

// Error announcements  
<div
  role="alert"
  aria-live="assertive"
  className="sr-only"
>
  {errorMessage}
</div>
```

### Screen Reader Testing

Components must be tested with:

1. **NVDA** (Windows) - Primary Norwegian screen reader
2. **JAWS** (Windows) - Common enterprise screen reader  
3. **VoiceOver** (macOS/iOS) - Apple ecosystem
4. **TalkBack** (Android) - Mobile accessibility

## Color and Contrast

### Color Requirements

1. **Never rely on color alone** to convey information
2. **Include text labels** alongside color coding
3. **Use patterns or icons** to supplement color
4. **Test with color blindness simulators**

```typescript
// Status indicators with color and text
<Badge 
  variant={status === 'success' ? 'success' : 'error'}
  icon={status === 'success' ? CheckIcon : ErrorIcon}
>
  {status === 'success' 
    ? t('status.approved', { defaultValue: 'Approved' })
    : t('status.rejected', { defaultValue: 'Rejected' })
  }
</Badge>

// Form validation with multiple indicators
<Input
  label="Email"
  error={errors.email}
  aria-invalid={!!errors.email}
  aria-describedby="email-error"
  // Visual error styling handled by UI System
/>
{errors.email && (
  <Text id="email-error" variant="caption" color="error" role="alert">
    <ErrorIcon aria-hidden="true" />
    {errors.email}
  </Text>
)}
```

## Keyboard Navigation

### Keyboard Support Requirements

All interactive elements must support:

1. **Tab navigation** - Move between elements
2. **Enter/Space** - Activate buttons and links
3. **Arrow keys** - Navigate within components (lists, tabs, etc.)
4. **Escape** - Close modals and dropdowns
5. **Home/End** - Navigate to start/end of lists

```typescript
// Keyboard event handling
const handleKeyDown = useCallback((event: KeyboardEvent) => {
  switch (event.key) {
    case 'Enter':
    case ' ':
      event.preventDefault();
      handleActivate();
      break;
    case 'Escape':
      event.preventDefault();
      handleClose();
      break;
    case 'ArrowDown':
      event.preventDefault();
      focusNext();
      break;
    case 'ArrowUp':
      event.preventDefault();
      focusPrevious();
      break;
    case 'Home':
      event.preventDefault();
      focusFirst();
      break;
    case 'End':
      event.preventDefault();
      focusLast();
      break;
  }
}, [handleActivate, handleClose, focusNext, focusPrevious, focusFirst, focusLast]);
```

## Validation and Testing

### Automated Accessibility Testing

All generated components must pass:

1. **axe-core** automated testing
2. **Lighthouse** accessibility audit
3. **WAVE** web accessibility evaluation
4. **Color contrast analyzers**

### Manual Testing Checklist

- [ ] Keyboard-only navigation works completely
- [ ] Screen reader announces all content properly
- [ ] Focus indicators are clearly visible
- [ ] Color contrast meets AAA standards
- [ ] Text scales to 200% without issues
- [ ] Works in high contrast mode
- [ ] Alternative text is descriptive
- [ ] Error messages are clear and helpful

### Norwegian Compliance Testing

- [ ] Norwegian language accessibility texts
- [ ] UU-direktivet requirements met
- [ ] Government accessibility standards followed
- [ ] Compatible with Norwegian assistive technologies