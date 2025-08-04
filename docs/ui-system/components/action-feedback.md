# Action & Feedback Components

Action and feedback components provide user interaction capabilities and system feedback. These components include buttons, alerts, modals, and toast notifications with full Norwegian compliance and accessibility features.

## Components Overview

| Component         | Purpose                      | Norwegian Features           | Accessibility Level |
| ----------------- | ---------------------------- | ---------------------------- | ------------------- |
| [Button](#button) | User actions and navigation  | Classification, Confirmation | WCAG 2.2 AAA        |
| [Alert](#alert)   | System messages and warnings | NSM classification display   | WCAG 2.2 AAA        |
| [Modal](#modal)   | Dialog windows and overlays  | Government form compliance   | WCAG 2.2 AAA        |
| [Toast](#toast)   | Temporary notifications      | Audit logging integration    | WCAG 2.2 AAA        |

## Button

Enterprise-grade button component with Norwegian government compliance features.

### Basic Usage

```tsx
import { Button } from '@xala-technologies/ui-system';

function BasicExample() {
  return (
    <Button variant="primary" size="md">
      Save Changes
    </Button>
  );
}
```

### Props Interface

```typescript
interface ButtonProps {
  // Core properties
  variant?: 'primary' | 'secondary' | 'tertiary' | 'danger' | 'success' | 'warning';
  size?: 'sm' | 'md' | 'lg' | 'xl';
  type?: 'button' | 'submit' | 'reset';
  disabled?: boolean;
  loading?: boolean;

  // Content and styling
  children?: React.ReactNode;
  icon?: React.ReactNode;
  iconPosition?: 'left' | 'right';
  className?: string;
  style?: React.CSSProperties;

  // Accessibility
  ariaLabel?: string;
  ariaDescribedBy?: string;
  testId?: string;

  // Event handlers
  onClick?: (event: React.MouseEvent<HTMLButtonElement>) => void;

  // Norwegian compliance
  norwegian?: {
    classification?: 'ÅPEN' | 'BEGRENSET' | 'KONFIDENSIELT' | 'HEMMELIG';
    requiresConfirmation?: boolean;
    confirmationText?: string;
    auditLevel?: number;
    municipality?: string;
  };

  // Form integration
  labelKey?: string; // For internationalization
}
```

### Variants

#### Primary Button

```tsx
<Button variant="primary" size="md">
  Primary Action
</Button>
```

#### Secondary Button

```tsx
<Button variant="secondary" size="md">
  Secondary Action
</Button>
```

#### Danger Button

```tsx
<Button variant="danger" size="md">
  Delete Item
</Button>
```

### Sizes

```tsx
// Small button
<Button variant="primary" size="sm">Small</Button>

// Medium button (default)
<Button variant="primary" size="md">Medium</Button>

// Large button
<Button variant="primary" size="lg">Large</Button>

// Extra large button
<Button variant="primary" size="xl">Extra Large</Button>
```

### Norwegian Compliance Features

#### Security Classification

```tsx
<Button
  variant="primary"
  norwegian={{
    classification: 'KONFIDENSIELT',
    auditLevel: 3,
  }}
>
  Classified Action
</Button>
```

#### Confirmation Dialog

```tsx
<Button
  variant="danger"
  norwegian={{
    requiresConfirmation: true,
    confirmationText: 'Are you sure you want to delete this item? This action cannot be undone.',
  }}
  onClick={handleDelete}
>
  Delete Item
</Button>
```

#### Municipal Branding

```tsx
<Button
  variant="primary"
  norwegian={{
    municipality: 'Oslo',
    classification: 'ÅPEN',
  }}
>
  Municipal Service
</Button>
```

### Loading State

```tsx
function AsyncButton() {
  const [loading, setLoading] = useState(false);

  const handleClick = async () => {
    setLoading(true);
    try {
      await performAsyncAction();
    } finally {
      setLoading(false);
    }
  };

  return (
    <Button variant="primary" loading={loading} onClick={handleClick}>
      {loading ? 'Processing...' : 'Submit'}
    </Button>
  );
}
```

### Icon Integration

```tsx
import { SaveIcon, TrashIcon } from '@heroicons/react/24/outline';

// Icon on the left
<Button variant="primary" icon={<SaveIcon />} iconPosition="left">
  Save
</Button>

// Icon on the right
<Button variant="danger" icon={<TrashIcon />} iconPosition="right">
  Delete
</Button>

// Icon only button
<Button variant="secondary" icon={<SaveIcon />} ariaLabel="Save document" />
```

### Accessibility Features

```tsx
<Button
  variant="primary"
  ariaLabel="Save document to server"
  ariaDescribedBy="save-button-help"
  testId="save-button"
>
  Save
</Button>

<div id="save-button-help" className="sr-only">
  This will save your document to the server. All changes will be preserved.
</div>
```

### Form Integration

```tsx
import { Form, Input, Button } from '@xala-technologies/ui-system';

function ContactForm() {
  return (
    <Form onSubmit={handleSubmit}>
      <Input labelKey="form.name" required />
      <Input labelKey="form.email" type="email" required />

      <div className="form-actions">
        <Button type="submit" variant="primary">
          Send Message
        </Button>
        <Button type="button" variant="secondary" onClick={handleReset}>
          Reset
        </Button>
      </div>
    </Form>
  );
}
```

## Alert

System alert component for displaying important messages with Norwegian compliance features.

### Basic Usage

```tsx
import { Alert } from '@xala-technologies/ui-system';

function AlertExample() {
  return (
    <Alert variant="info" title="Information">
      This is an informational message for the user.
    </Alert>
  );
}
```

### Props Interface

```typescript
interface AlertProps {
  // Content
  title?: string;
  children: React.ReactNode;

  // Appearance
  variant?: 'info' | 'success' | 'warning' | 'error';
  closable?: boolean;
  icon?: React.ReactNode;

  // Actions
  actions?: React.ReactNode;
  onClose?: () => void;

  // Norwegian compliance
  norwegian?: {
    classification?: SecurityClassification;
    severity?: 'low' | 'medium' | 'high' | 'critical';
    auditRequired?: boolean;
  };

  // Accessibility
  role?: 'alert' | 'alertdialog' | 'status';
  ariaLive?: 'polite' | 'assertive';
  testId?: string;
}
```

### Variants

```tsx
// Information alert
<Alert variant="info" title="Information">
  Your changes have been saved successfully.
</Alert>

// Success alert
<Alert variant="success" title="Success">
  Document uploaded successfully.
</Alert>

// Warning alert
<Alert variant="warning" title="Warning">
  This action will affect multiple records.
</Alert>

// Error alert
<Alert variant="error" title="Error">
  Failed to save changes. Please try again.
</Alert>
```

### Norwegian Compliance

```tsx
<Alert
  variant="warning"
  title="Classified Information Warning"
  norwegian={{
    classification: 'KONFIDENSIELT',
    severity: 'high',
    auditRequired: true,
  }}
>
  You are accessing classified information. All actions are logged.
</Alert>
```

### With Actions

```tsx
<Alert
  variant="error"
  title="Connection Error"
  actions={
    <div className="alert-actions">
      <Button variant="primary" size="sm" onClick={handleRetry}>
        Retry
      </Button>
      <Button variant="secondary" size="sm" onClick={handleCancel}>
        Cancel
      </Button>
    </div>
  }
>
  Failed to connect to the server. Please check your connection and try again.
</Alert>
```

### Closable Alert

```tsx
function DismissibleAlert() {
  const [visible, setVisible] = useState(true);

  if (!visible) return null;

  return (
    <Alert variant="info" title="New Feature Available" closable onClose={() => setVisible(false)}>
      Check out our new document management features in the sidebar.
    </Alert>
  );
}
```

## Modal

Modal dialog component with accessibility and Norwegian compliance features.

### Basic Usage

```tsx
import { Modal, Button } from '@xala-technologies/ui-system';

function ModalExample() {
  const [open, setOpen] = useState(false);

  return (
    <>
      <Button onClick={() => setOpen(true)}>Open Modal</Button>

      <Modal open={open} onClose={() => setOpen(false)} title="Confirm Action">
        <p>Are you sure you want to proceed with this action?</p>

        <div className="modal-actions">
          <Button variant="primary" onClick={handleConfirm}>
            Confirm
          </Button>
          <Button variant="secondary" onClick={() => setOpen(false)}>
            Cancel
          </Button>
        </div>
      </Modal>
    </>
  );
}
```

### Props Interface

```typescript
interface ModalProps {
  // State
  open: boolean;
  onClose: () => void;

  // Content
  title?: string;
  children: React.ReactNode;

  // Appearance
  size?: 'sm' | 'md' | 'lg' | 'xl' | 'full';
  closable?: boolean;

  // Behavior
  closeOnOverlayClick?: boolean;
  closeOnEscape?: boolean;
  preventScroll?: boolean;

  // Norwegian compliance
  norwegian?: {
    classification?: SecurityClassification;
    requiresAudit?: boolean;
    municipality?: string;
    formCompliance?: boolean;
  };

  // Accessibility
  ariaLabel?: string;
  ariaDescribedBy?: string;
  initialFocus?: React.RefObject<HTMLElement>;
  restoreFocus?: boolean;
}
```

### Modal Sizes

```tsx
// Small modal
<Modal size="sm" open={open} onClose={onClose}>
  <p>Small modal content</p>
</Modal>

// Medium modal (default)
<Modal size="md" open={open} onClose={onClose}>
  <p>Medium modal content</p>
</Modal>

// Large modal
<Modal size="lg" open={open} onClose={onClose}>
  <p>Large modal content</p>
</Modal>

// Full screen modal
<Modal size="full" open={open} onClose={onClose}>
  <p>Full screen modal content</p>
</Modal>
```

### Norwegian Government Forms

```tsx
function GovernmentFormModal() {
  return (
    <Modal
      open={open}
      onClose={onClose}
      title="Personal Information Form"
      size="lg"
      norwegian={{
        classification: 'BEGRENSET',
        requiresAudit: true,
        municipality: 'Oslo',
        formCompliance: true,
      }}
    >
      <Form>
        <PersonalNumberInput
          labelKey="form.personalNumber"
          required
          validation={{ personalNumber: true }}
        />

        <Input labelKey="form.firstName" required />

        <Input labelKey="form.lastName" required />

        <div className="form-actions">
          <Button type="submit" variant="primary">
            Submit Application
          </Button>
          <Button type="button" variant="secondary" onClick={onClose}>
            Cancel
          </Button>
        </div>
      </Form>
    </Modal>
  );
}
```

### Accessibility Features

```tsx
function AccessibleModal() {
  const titleRef = useRef<HTMLHeadingElement>(null);

  return (
    <Modal
      open={open}
      onClose={onClose}
      title="Accessible Modal"
      initialFocus={titleRef}
      restoreFocus={true}
      ariaLabel="Modal dialog for user confirmation"
      ariaDescribedBy="modal-description"
    >
      <h2 ref={titleRef} id="modal-title">
        Confirm Your Action
      </h2>

      <p id="modal-description">
        This action will permanently delete the selected items. This cannot be undone.
      </p>

      <div className="modal-actions">
        <Button variant="danger" onClick={handleDelete}>
          Delete
        </Button>
        <Button variant="secondary" onClick={onClose}>
          Cancel
        </Button>
      </div>
    </Modal>
  );
}
```

## Toast

Toast notification component for temporary feedback messages.

### Basic Usage

```tsx
import { Toast, useToast } from '@xala-technologies/ui-system';

function ToastExample() {
  const { showToast } = useToast();

  const handleSuccess = () => {
    showToast({
      variant: 'success',
      title: 'Success',
      message: 'Document saved successfully!',
    });
  };

  return <Button onClick={handleSuccess}>Save Document</Button>;
}
```

### Props Interface

```typescript
interface ToastProps {
  // Content
  title?: string;
  message: string;

  // Appearance
  variant?: 'info' | 'success' | 'warning' | 'error';
  icon?: React.ReactNode;

  // Behavior
  duration?: number; // ms, 0 for permanent
  closable?: boolean;
  position?:
    | 'top-right'
    | 'top-left'
    | 'bottom-right'
    | 'bottom-left'
    | 'top-center'
    | 'bottom-center';

  // Actions
  actions?: React.ReactNode;
  onClose?: () => void;

  // Norwegian compliance
  norwegian?: {
    auditLevel?: number;
    logEvent?: boolean;
    classification?: SecurityClassification;
  };
}
```

### Toast Manager Hook

```tsx
interface ToastManager {
  showToast: (options: ToastOptions) => string;
  hideToast: (id: string) => void;
  hideAllToasts: () => void;
  toasts: Toast[];
}

function useToast(): ToastManager {
  // Implementation
}
```

### Usage Examples

```tsx
function ToastExamples() {
  const { showToast } = useToast();

  const showSuccess = () => {
    showToast({
      variant: 'success',
      title: 'Success',
      message: 'Your changes have been saved.',
      duration: 5000,
    });
  };

  const showError = () => {
    showToast({
      variant: 'error',
      title: 'Error',
      message: 'Failed to save changes. Please try again.',
      duration: 0, // Permanent until manually closed
      actions: (
        <Button variant="primary" size="sm" onClick={handleRetry}>
          Retry
        </Button>
      ),
    });
  };

  const showClassified = () => {
    showToast({
      variant: 'warning',
      title: 'Classified Access',
      message: 'You have accessed classified information.',
      norwegian: {
        auditLevel: 3,
        logEvent: true,
        classification: 'KONFIDENSIELT',
      },
    });
  };

  return (
    <div>
      <Button onClick={showSuccess}>Show Success</Button>
      <Button onClick={showError}>Show Error</Button>
      <Button onClick={showClassified}>Show Classified</Button>
    </div>
  );
}
```

### Toast Provider Setup

```tsx
import { ToastProvider } from '@xala-technologies/ui-system';

function App() {
  return (
    <UISystemProvider>
      <ToastProvider position="top-right" maxToasts={5}>
        <YourApp />
      </ToastProvider>
    </UISystemProvider>
  );
}
```

## Testing Examples

### Button Testing

```typescript
import { render, screen, fireEvent } from '@testing-library/react';
import { axe } from '@testing-library/jest-axe';
import { Button } from '@xala-technologies/ui-system';

describe('Button Component', () => {
  it('should render with correct variant', () => {
    render(<Button variant="primary">Test Button</Button>);
    const button = screen.getByRole('button');
    expect(button).toHaveClass('button--primary');
  });

  it('should handle click events', () => {
    const handleClick = jest.fn();
    render(<Button onClick={handleClick}>Click me</Button>);

    fireEvent.click(screen.getByRole('button'));
    expect(handleClick).toHaveBeenCalledTimes(1);
  });

  it('should meet accessibility standards', async () => {
    const { container } = render(<Button>Accessible Button</Button>);
    const results = await axe(container);
    expect(results).toHaveNoViolations();
  });

  it('should display Norwegian classification', () => {
    render(
      <Button norwegian={{ classification: 'KONFIDENSIELT' }}>
        Classified Button
      </Button>
    );

    expect(screen.getByText('KONFIDENSIELT')).toBeInTheDocument();
  });

  it('should show confirmation dialog when required', async () => {
    const handleClick = jest.fn();
    render(
      <Button
        norwegian={{ requiresConfirmation: true }}
        onClick={handleClick}
      >
        Delete
      </Button>
    );

    fireEvent.click(screen.getByRole('button'));
    expect(screen.getByRole('dialog')).toBeInTheDocument();
    expect(handleClick).not.toHaveBeenCalled();

    fireEvent.click(screen.getByText('Confirm'));
    expect(handleClick).toHaveBeenCalledTimes(1);
  });
});
```

### Modal Testing

```typescript
describe('Modal Component', () => {
  it('should open and close correctly', () => {
    const { rerender } = render(
      <Modal open={false} onClose={jest.fn()}>
        Modal Content
      </Modal>
    );

    expect(screen.queryByRole('dialog')).not.toBeInTheDocument();

    rerender(
      <Modal open={true} onClose={jest.fn()}>
        Modal Content
      </Modal>
    );

    expect(screen.getByRole('dialog')).toBeInTheDocument();
  });

  it('should trap focus within modal', () => {
    render(
      <Modal open={true} onClose={jest.fn()}>
        <Button>First Button</Button>
        <Button>Second Button</Button>
      </Modal>
    );

    const buttons = screen.getAllByRole('button');
    buttons[0].focus();

    // Tab should move to second button
    fireEvent.keyDown(buttons[0], { key: 'Tab' });
    expect(buttons[1]).toHaveFocus();

    // Shift+Tab should move back to first button
    fireEvent.keyDown(buttons[1], { key: 'Tab', shiftKey: true });
    expect(buttons[0]).toHaveFocus();
  });
});
```

## Troubleshooting

### Common Issues

1. **Button not responding to clicks**
   - Check if `disabled` prop is set
   - Verify event handler is passed correctly
   - Ensure button is not inside a form without proper `type` attribute

2. **Modal not closing on Escape key**
   - Verify `closeOnEscape` prop is not set to `false`
   - Check if focus is trapped correctly
   - Ensure modal is properly mounted

3. **Toast notifications not appearing**
   - Verify `ToastProvider` is wrapped around your app
   - Check if `duration` is set to 0 (permanent)
   - Ensure position is not off-screen

4. **Accessibility warnings**
   - Add proper `ariaLabel` for icon-only buttons
   - Ensure sufficient color contrast
   - Provide focus indicators

### Performance Optimization

1. **Button memoization**

   ```tsx
   const MemoizedButton = memo(Button);
   ```

2. **Modal lazy loading**

   ```tsx
   const LazyModal = lazy(() => import('./components/Modal'));
   ```

3. **Toast cleanup**
   ```tsx
   useEffect(() => {
     return () => {
       hideAllToasts();
     };
   }, []);
   ```

---

**Next**: Learn about [Form Components](./form.md) for input handling and validation.
