# Xaheen Platform - Best Practices Guide

## Table of Contents

1. [Project Organization](#project-organization)
2. [Code Quality Standards](#code-quality-standards)
3. [TypeScript Best Practices](#typescript-best-practices)
4. [Component Architecture](#component-architecture)
5. [State Management](#state-management)
6. [Performance Optimization](#performance-optimization)
7. [Security Best Practices](#security-best-practices)
8. [Compliance Implementation](#compliance-implementation)
9. [Testing Strategies](#testing-strategies)
10. [Deployment Guidelines](#deployment-guidelines)

## Project Organization

### Directory Structure

```
src/
├── components/          # Reusable UI components
│   ├── common/         # Shared components
│   ├── features/       # Feature-specific components
│   └── layouts/        # Layout components
├── pages/              # Next.js pages (routes)
├── services/           # Business logic and API calls
├── hooks/              # Custom React hooks
├── utils/              # Utility functions
├── types/              # TypeScript type definitions
├── constants/          # Application constants
├── contexts/           # React contexts
├── store/              # State management
├── styles/             # Global styles
├── locales/            # Internationalization
└── __tests__/          # Test files
```

### File Naming Conventions

```typescript
// Components: PascalCase
UserProfile.tsx
PaymentForm.tsx
NavigationMenu.tsx

// Hooks: camelCase with 'use' prefix
useAuth.ts
useLocalStorage.ts
useNorwegianPhone.ts

// Services: camelCase with 'Service' suffix
authService.ts
paymentService.ts
analyticsService.ts

// Types: PascalCase with descriptive names
User.ts
PaymentMethod.ts
ComplianceResult.ts

// Constants: UPPER_SNAKE_CASE
API_ENDPOINTS.ts
VALIDATION_RULES.ts
COMPLIANCE_LEVELS.ts
```

### Module Organization

```typescript
// Good: Clear module boundaries
// services/payment/index.ts
export { PaymentService } from './PaymentService';
export { VippsProvider } from './providers/VippsProvider';
export { StripeProvider } from './providers/StripeProvider';
export type { PaymentOptions, PaymentResult } from './types';

// Bad: Everything in one file
// services/payment.ts
export class PaymentService { /* ... */ }
export class VippsProvider { /* ... */ }
export class StripeProvider { /* ... */ }
```

## Code Quality Standards

### Clean Code Principles

```typescript
// Good: Self-documenting code
export function calculateNorwegianVAT(
  amount: number,
  vatRate: VATRate = VATRate.STANDARD
): VATCalculation {
  const vatAmount = amount * vatRate;
  const totalAmount = amount + vatAmount;
  
  return {
    netAmount: amount,
    vatAmount,
    vatRate,
    totalAmount,
  };
}

// Bad: Unclear naming and magic numbers
export function calc(a: number, r: number = 0.25): any {
  const v = a * r;
  return {
    n: a,
    v: v,
    t: a + v,
  };
}
```

### Error Handling

```typescript
// Good: Comprehensive error handling
export async function processPayment(
  payment: PaymentRequest
): Promise<PaymentResult> {
  try {
    // Validate input
    const validation = validatePaymentRequest(payment);
    if (!validation.isValid) {
      throw new ValidationError('Invalid payment request', validation.errors);
    }
    
    // Process payment
    const result = await paymentProvider.charge(payment);
    
    // Audit log
    await auditLog.record({
      action: 'payment_processed',
      amount: payment.amount,
      status: result.status,
    });
    
    return result;
  } catch (error) {
    // Log error
    logger.error('Payment processing failed', {
      error,
      payment,
      userId: getCurrentUser()?.id,
    });
    
    // Handle specific errors
    if (error instanceof ValidationError) {
      throw new BadRequestError(error.message, error.details);
    }
    
    if (error instanceof PaymentProviderError) {
      throw new ServiceUnavailableError('Payment service temporarily unavailable');
    }
    
    // Generic error
    throw new InternalServerError('Payment processing failed');
  }
}

// Bad: Poor error handling
export async function processPayment(payment: any) {
  try {
    return await paymentProvider.charge(payment);
  } catch (e) {
    console.log('Error:', e);
    throw e;
  }
}
```

### Code Documentation

```typescript
/**
 * Validates a Norwegian organization number (organisasjonsnummer)
 * 
 * @param orgNumber - The organization number to validate
 * @returns True if valid, false otherwise
 * 
 * @example
 * validateOrgNumber('123456789') // returns true
 * validateOrgNumber('12345678') // returns false (wrong length)
 * 
 * @see https://www.brreg.no/om-oss/oppgavene-vare/alle-registrene-vare/om-enhetsregisteret/organisasjonsnummeret/
 */
export function validateOrgNumber(orgNumber: string): boolean {
  // Remove any whitespace
  const cleaned = orgNumber.replace(/\s/g, '');
  
  // Check length
  if (cleaned.length !== 9) {
    return false;
  }
  
  // Check if all characters are digits
  if (!/^\d{9}$/.test(cleaned)) {
    return false;
  }
  
  // Validate using modulo 11 algorithm
  const weights = [3, 2, 7, 6, 5, 4, 3, 2];
  let sum = 0;
  
  for (let i = 0; i < 8; i++) {
    sum += parseInt(cleaned[i]) * weights[i];
  }
  
  const remainder = sum % 11;
  const checkDigit = remainder === 0 ? 0 : 11 - remainder;
  
  return checkDigit === parseInt(cleaned[8]);
}
```

## TypeScript Best Practices

### Strict Type Safety

```typescript
// Good: Strict types with no 'any'
interface UserProfile {
  readonly id: string;
  readonly email: string;
  readonly name: string;
  readonly preferences: UserPreferences;
  readonly createdAt: Date;
  readonly updatedAt: Date;
}

interface UserPreferences {
  readonly language: 'nb' | 'en' | 'fr' | 'ar';
  readonly theme: 'light' | 'dark' | 'auto';
  readonly notifications: NotificationSettings;
}

export function updateUserProfile(
  userId: string,
  updates: Partial<Omit<UserProfile, 'id' | 'createdAt' | 'updatedAt'>>
): Promise<UserProfile> {
  // Implementation
}

// Bad: Using 'any' and loose types
interface UserProfile {
  id: any;
  email: string;
  data: any;
}

export function updateUserProfile(userId: any, updates: any): any {
  // Implementation
}
```

### Type Guards and Assertions

```typescript
// Good: Type guards for runtime safety
interface VippsPayment {
  type: 'vipps';
  vippsReference: string;
  phoneNumber: string;
}

interface StripePayment {
  type: 'stripe';
  paymentIntentId: string;
  customerId: string;
}

type Payment = VippsPayment | StripePayment;

function isVippsPayment(payment: Payment): payment is VippsPayment {
  return payment.type === 'vipps';
}

function isStripePayment(payment: Payment): payment is StripePayment {
  return payment.type === 'stripe';
}

export function processPayment(payment: Payment): Promise<PaymentResult> {
  if (isVippsPayment(payment)) {
    return vippsService.process(payment);
  }
  
  if (isStripePayment(payment)) {
    return stripeService.process(payment);
  }
  
  // TypeScript knows this is unreachable
  const exhaustiveCheck: never = payment;
  throw new Error(`Unhandled payment type: ${exhaustiveCheck}`);
}
```

### Generic Types

```typescript
// Good: Reusable generic types
interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: ApiError;
  metadata: {
    timestamp: string;
    requestId: string;
  };
}

interface PaginatedResponse<T> extends ApiResponse<T[]> {
  pagination: {
    page: number;
    pageSize: number;
    totalPages: number;
    totalItems: number;
  };
}

async function fetchPaginated<T>(
  endpoint: string,
  params: PaginationParams
): Promise<PaginatedResponse<T>> {
  const response = await api.get<PaginatedResponse<T>>(endpoint, params);
  return response;
}

// Usage
const users = await fetchPaginated<User>('/api/users', { page: 1, pageSize: 20 });
const orders = await fetchPaginated<Order>('/api/orders', { page: 1, pageSize: 50 });
```

## Component Architecture

### Component Design Principles

```typescript
// Good: Single responsibility, clear props
interface UserCardProps {
  readonly user: User;
  readonly variant?: 'default' | 'compact' | 'detailed';
  readonly onEdit?: (user: User) => void;
  readonly showActions?: boolean;
}

export const UserCard = ({
  user,
  variant = 'default',
  onEdit,
  showActions = true,
}: UserCardProps): JSX.Element => {
  return (
    <Card variant={variant === 'compact' ? 'flat' : 'elevated'}>
      <Stack spacing="4">
        <UserAvatar user={user} size={variant === 'compact' ? 'sm' : 'md'} />
        <UserInfo user={user} detailed={variant === 'detailed'} />
        {showActions && (
          <UserActions user={user} onEdit={onEdit} />
        )}
      </Stack>
    </Card>
  );
};

// Bad: Too many responsibilities
export const UserCard = ({ user, onEdit, onDelete, onMessage, showAvatar, showInfo, showActions, size, color, ...props }) => {
  // Too complex
};
```

### Composition over Inheritance

```typescript
// Good: Component composition
export const PageLayout = ({ children }: { children: React.ReactNode }) => (
  <div className="min-h-screen bg-gray-50">
    {children}
  </div>
);

export const AuthenticatedLayout = ({ children }: { children: React.ReactNode }) => (
  <PageLayout>
    <Navigation />
    <main className="container mx-auto py-8">
      {children}
    </main>
    <Footer />
  </PageLayout>
);

export const DashboardLayout = ({ children }: { children: React.ReactNode }) => (
  <AuthenticatedLayout>
    <div className="grid grid-cols-12 gap-6">
      <aside className="col-span-3">
        <DashboardSidebar />
      </aside>
      <div className="col-span-9">
        {children}
      </div>
    </div>
  </AuthenticatedLayout>
);
```

### Custom Hooks

```typescript
// Good: Reusable custom hooks
export function useNorwegianAddress() {
  const [address, setAddress] = useState<Address | null>(null);
  const [postalCode, setPostalCode] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  const lookupPostalCode = useCallback(async (code: string) => {
    if (!/^\d{4}$/.test(code)) {
      setError('Postnummer må være 4 siffer');
      return;
    }
    
    setLoading(true);
    setError(null);
    
    try {
      const response = await fetch(`/api/postal-codes/${code}`);
      const data = await response.json();
      
      setAddress({
        postalCode: code,
        city: data.city,
        municipality: data.municipality,
        county: data.county,
      });
    } catch (err) {
      setError('Kunne ikke hente adresse');
    } finally {
      setLoading(false);
    }
  }, []);
  
  useEffect(() => {
    if (postalCode.length === 4) {
      lookupPostalCode(postalCode);
    }
  }, [postalCode, lookupPostalCode]);
  
  return {
    address,
    postalCode,
    setPostalCode,
    loading,
    error,
    lookupPostalCode,
  };
}
```

## State Management

### Local State Management

```typescript
// Good: Appropriate state management
export function CheckoutForm() {
  // Form state
  const [formData, setFormData] = useState<CheckoutData>({
    customer: {},
    shipping: {},
    payment: {},
  });
  
  // UI state
  const [currentStep, setCurrentStep] = useState(0);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errors, setErrors] = useState<ValidationErrors>({});
  
  // Derived state
  const isValid = useMemo(() => {
    return Object.keys(errors).length === 0 && 
           isStepComplete(currentStep, formData);
  }, [errors, currentStep, formData]);
  
  // State updates
  const updateFormData = useCallback((
    section: keyof CheckoutData,
    data: Partial<CheckoutData[typeof section]>
  ) => {
    setFormData(prev => ({
      ...prev,
      [section]: { ...prev[section], ...data },
    }));
  }, []);
  
  return (
    <CheckoutProvider value={{ formData, updateFormData, errors }}>
      {/* Checkout UI */}
    </CheckoutProvider>
  );
}
```

### Global State Management

```typescript
// Good: Context for cross-cutting concerns
interface AuthContextValue {
  user: User | null;
  loading: boolean;
  login: (credentials: LoginCredentials) => Promise<void>;
  logout: () => Promise<void>;
  updateProfile: (updates: Partial<User>) => Promise<void>;
}

const AuthContext = React.createContext<AuthContextValue | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  
  useEffect(() => {
    // Check for existing session
    checkSession()
      .then(setUser)
      .finally(() => setLoading(false));
  }, []);
  
  const value = useMemo(() => ({
    user,
    loading,
    login: async (credentials) => {
      const user = await authService.login(credentials);
      setUser(user);
    },
    logout: async () => {
      await authService.logout();
      setUser(null);
    },
    updateProfile: async (updates) => {
      const updated = await userService.updateProfile(updates);
      setUser(updated);
    },
  }), [user, loading]);
  
  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  return context;
}
```

## Performance Optimization

### Code Splitting

```typescript
// Good: Lazy load heavy components
const ChartDashboard = lazy(() => import('./components/ChartDashboard'));
const PDFViewer = lazy(() => import('./components/PDFViewer'));
const VideoPlayer = lazy(() => import('./components/VideoPlayer'));

export function Dashboard() {
  const [showCharts, setShowCharts] = useState(false);
  
  return (
    <div>
      <button onClick={() => setShowCharts(true)}>
        Show Analytics
      </button>
      
      {showCharts && (
        <Suspense fallback={<LoadingSpinner />}>
          <ChartDashboard />
        </Suspense>
      )}
    </div>
  );
}
```

### Memoization

```typescript
// Good: Optimize expensive calculations
export function ProductList({ products, filters }: ProductListProps) {
  // Memoize filtered products
  const filteredProducts = useMemo(() => {
    return products
      .filter(product => {
        if (filters.category && product.category !== filters.category) {
          return false;
        }
        if (filters.priceRange) {
          if (product.price < filters.priceRange.min ||
              product.price > filters.priceRange.max) {
            return false;
          }
        }
        return true;
      })
      .sort((a, b) => {
        switch (filters.sortBy) {
          case 'price-asc':
            return a.price - b.price;
          case 'price-desc':
            return b.price - a.price;
          case 'name':
            return a.name.localeCompare(b.name, 'nb-NO');
          default:
            return 0;
        }
      });
  }, [products, filters]);
  
  // Memoize callbacks
  const handleAddToCart = useCallback((product: Product) => {
    cartService.addItem(product);
    analytics.track('add_to_cart', {
      productId: product.id,
      price: product.price,
    });
  }, []);
  
  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
      {filteredProducts.map(product => (
        <ProductCard
          key={product.id}
          product={product}
          onAddToCart={handleAddToCart}
        />
      ))}
    </div>
  );
}
```

### Image Optimization

```typescript
// Good: Optimize images
import Image from 'next/image';

export function ProductImage({ 
  product 
}: { 
  product: Product 
}) {
  return (
    <div className="relative aspect-square">
      <Image
        src={product.imageUrl}
        alt={product.name}
        fill
        sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
        priority={product.featured}
        placeholder="blur"
        blurDataURL={product.imagePlaceholder}
        className="object-cover rounded-lg"
      />
      {product.discount && (
        <div className="absolute top-2 right-2 bg-red-600 text-white px-2 py-1 rounded">
          -{product.discount}%
        </div>
      )}
    </div>
  );
}
```

## Security Best Practices

### Input Validation

```typescript
// Good: Comprehensive input validation
import { z } from 'zod';

const norwegianPhoneRegex = /^(?:\+47|0047|47)?[2-9]\d{7}$/;
const organizationNumberRegex = /^\d{9}$/;

export const UserRegistrationSchema = z.object({
  email: z.string().email('Invalid email address'),
  password: z.string()
    .min(12, 'Password must be at least 12 characters')
    .regex(/[A-Z]/, 'Password must contain uppercase letter')
    .regex(/[a-z]/, 'Password must contain lowercase letter')
    .regex(/[0-9]/, 'Password must contain number')
    .regex(/[^A-Za-z0-9]/, 'Password must contain special character'),
  name: z.string()
    .min(2, 'Name too short')
    .max(100, 'Name too long')
    .regex(/^[a-zA-ZæøåÆØÅ\s-]+$/, 'Invalid characters in name'),
  phone: z.string()
    .regex(norwegianPhoneRegex, 'Invalid Norwegian phone number')
    .optional(),
  organizationNumber: z.string()
    .regex(organizationNumberRegex, 'Invalid organization number')
    .refine(validateOrgNumber, 'Invalid organization number checksum')
    .optional(),
  consent: z.object({
    terms: z.literal(true, { 
      errorMap: () => ({ message: 'You must accept terms' }) 
    }),
    marketing: z.boolean().optional(),
  }),
});

export async function registerUser(
  data: unknown
): Promise<User> {
  // Validate input
  const validated = UserRegistrationSchema.parse(data);
  
  // Sanitize data
  const sanitized = {
    ...validated,
    name: sanitizeHtml(validated.name),
    email: validated.email.toLowerCase().trim(),
  };
  
  // Additional security checks
  if (await isDisposableEmail(sanitized.email)) {
    throw new ValidationError('Disposable emails not allowed');
  }
  
  // Process registration
  return userService.create(sanitized);
}
```

### Authentication & Authorization

```typescript
// Good: Secure authentication flow
export class AuthService {
  async authenticate(
    credentials: LoginCredentials
  ): Promise<AuthResult> {
    // Rate limiting
    const attempts = await this.getLoginAttempts(credentials.email);
    if (attempts >= 5) {
      throw new TooManyAttemptsError('Too many login attempts');
    }
    
    // Find user
    const user = await userRepository.findByEmail(credentials.email);
    if (!user) {
      await this.recordFailedAttempt(credentials.email);
      throw new InvalidCredentialsError();
    }
    
    // Verify password
    const isValid = await bcrypt.compare(
      credentials.password,
      user.passwordHash
    );
    
    if (!isValid) {
      await this.recordFailedAttempt(credentials.email);
      throw new InvalidCredentialsError();
    }
    
    // Check if account is locked
    if (user.lockedUntil && user.lockedUntil > new Date()) {
      throw new AccountLockedError();
    }
    
    // Generate tokens
    const accessToken = await this.generateAccessToken(user);
    const refreshToken = await this.generateRefreshToken(user);
    
    // Clear failed attempts
    await this.clearFailedAttempts(credentials.email);
    
    // Audit log
    await auditLog.record({
      action: 'login_success',
      userId: user.id,
      ipAddress: getClientIP(),
      userAgent: getUserAgent(),
    });
    
    return { user, accessToken, refreshToken };
  }
  
  private async generateAccessToken(user: User): Promise<string> {
    return jwt.sign(
      {
        sub: user.id,
        email: user.email,
        roles: user.roles,
      },
      process.env.JWT_SECRET!,
      {
        expiresIn: '15m',
        issuer: 'xaheen',
        audience: 'xaheen-api',
      }
    );
  }
}
```

### Data Protection

```typescript
// Good: Encrypt sensitive data
export class DataProtectionService {
  private readonly algorithm = 'aes-256-gcm';
  private readonly keyDerivationIterations = 100000;
  
  async encryptPersonalData(
    data: any,
    context: EncryptionContext
  ): Promise<EncryptedData> {
    // Generate unique key for this data
    const salt = crypto.randomBytes(32);
    const key = await this.deriveKey(
      process.env.MASTER_KEY!,
      salt,
      context
    );
    
    // Encrypt
    const iv = crypto.randomBytes(16);
    const cipher = crypto.createCipheriv(this.algorithm, key, iv);
    
    const encrypted = Buffer.concat([
      cipher.update(JSON.stringify(data), 'utf8'),
      cipher.final(),
    ]);
    
    const tag = cipher.getAuthTag();
    
    // Store encryption metadata
    await this.storeEncryptionMetadata({
      dataId: context.dataId,
      algorithm: this.algorithm,
      keyDerivation: 'pbkdf2',
      iterations: this.keyDerivationIterations,
      purpose: context.purpose,
    });
    
    return {
      encrypted: encrypted.toString('base64'),
      salt: salt.toString('base64'),
      iv: iv.toString('base64'),
      tag: tag.toString('base64'),
    };
  }
  
  private async deriveKey(
    masterKey: string,
    salt: Buffer,
    context: EncryptionContext
  ): Promise<Buffer> {
    // Use context for key derivation
    const info = Buffer.from(
      `${context.userId}:${context.purpose}:${context.dataType}`
    );
    
    return crypto.pbkdf2Sync(
      masterKey,
      Buffer.concat([salt, info]),
      this.keyDerivationIterations,
      32,
      'sha256'
    );
  }
}
```

## Compliance Implementation

### GDPR Compliance

```typescript
// Good: GDPR-compliant data handling
export class GDPRService {
  async handleDataRequest(
    userId: string,
    requestType: 'access' | 'portability' | 'erasure'
  ): Promise<DataRequestResult> {
    // Verify user identity
    await this.verifyUserIdentity(userId);
    
    // Log request
    const request = await this.logDataRequest({
      userId,
      type: requestType,
      requestedAt: new Date(),
      ipAddress: getClientIP(),
    });
    
    switch (requestType) {
      case 'access':
        return this.handleAccessRequest(userId);
      case 'portability':
        return this.handlePortabilityRequest(userId);
      case 'erasure':
        return this.handleErasureRequest(userId);
    }
  }
  
  private async handleAccessRequest(
    userId: string
  ): Promise<DataAccessResult> {
    // Collect all user data
    const userData = await this.collectUserData(userId);
    
    // Generate report
    const report = {
      generatedAt: new Date(),
      user: this.sanitizeUserData(userData.user),
      activities: userData.activities,
      consents: userData.consents,
      dataProcessing: await this.getDataProcessingInfo(userId),
    };
    
    // Create secure download
    const download = await this.createSecureDownload(report, {
      format: 'pdf',
      password: generateSecurePassword(),
      expiry: 7 * 24 * 60 * 60 * 1000, // 7 days
    });
    
    // Notify user
    await this.notifyDataReady(userId, download);
    
    return { success: true, downloadUrl: download.url };
  }
  
  private async handleErasureRequest(
    userId: string
  ): Promise<DataErasureResult> {
    // Check if erasure is allowed
    const canErase = await this.checkErasureEligibility(userId);
    if (!canErase.eligible) {
      return {
        success: false,
        reason: canErase.reason,
        alternativeAction: 'anonymization',
      };
    }
    
    // Start erasure process
    const erasureLog = await db.$transaction(async (tx) => {
      // Delete personal data
      await tx.user.update({
        where: { id: userId },
        data: {
          email: `deleted-${userId}@example.com`,
          name: 'Deleted User',
          phone: null,
          personalNumber: null,
          deletedAt: new Date(),
        },
      });
      
      // Delete or anonymize related data
      await this.anonymizeUserContent(tx, userId);
      
      // Create erasure log
      return await tx.erasureLog.create({
        data: {
          userId,
          requestId: request.id,
          erasedData: ['profile', 'activities', 'preferences'],
          retainedData: ['anonymized_orders', 'legal_records'],
          completedAt: new Date(),
        },
      });
    });
    
    return { success: true, erasureLog };
  }
}
```

### NSM Security Implementation

```typescript
// Good: NSM-compliant security
export class NSMSecurityService {
  async classifyAndProtectData(
    data: any,
    context: SecurityContext
  ): Promise<ProtectedData> {
    // Classify data
    const classification = await this.classifyData(data);
    
    // Apply security controls based on classification
    let protectedData = data;
    
    switch (classification) {
      case NSMClassification.CONFIDENTIAL:
        protectedData = await this.applyConfidentialProtection(data);
        break;
      case NSMClassification.RESTRICTED:
        protectedData = await this.applyRestrictedProtection(data);
        break;
      case NSMClassification.INTERNAL:
        protectedData = await this.applyInternalProtection(data);
        break;
      // OPEN requires no additional protection
    }
    
    // Audit log
    await this.logDataAccess({
      classification,
      userId: context.userId,
      action: 'data_protection_applied',
      timestamp: new Date(),
    });
    
    return {
      data: protectedData,
      classification,
      protectionLevel: this.getProtectionLevel(classification),
      accessControl: this.getAccessControl(classification),
    };
  }
  
  private async applyConfidentialProtection(
    data: any
  ): Promise<any> {
    // Double encryption
    const firstLayer = await this.encrypt(data, 'layer1');
    const secondLayer = await this.encrypt(firstLayer, 'layer2');
    
    // Store in HSM-protected storage
    const storageKey = await this.hsm.generateKey();
    await this.secureStorage.store(storageKey, secondLayer);
    
    return {
      type: 'hsm_protected',
      reference: storageKey,
      classification: NSMClassification.CONFIDENTIAL,
    };
  }
}
```

### WCAG Accessibility

```typescript
// Good: WCAG AAA compliant component
export function AccessibleDataTable({
  data,
  columns,
  caption,
  onSort,
  onFilter,
}: AccessibleDataTableProps) {
  const [sortConfig, setSortConfig] = useState<SortConfig | null>(null);
  const [announcement, setAnnouncement] = useState('');
  const tableId = useId();
  
  // Announce changes to screen readers
  const announce = useCallback((message: string) => {
    setAnnouncement(message);
    setTimeout(() => setAnnouncement(''), 100);
  }, []);
  
  // Keyboard navigation
  const handleKeyDown = useCallback((e: KeyboardEvent<HTMLTableElement>) => {
    const target = e.target as HTMLElement;
    const cell = target.closest('td, th');
    if (!cell) return;
    
    switch (e.key) {
      case 'ArrowRight':
        (cell.nextElementSibling as HTMLElement)?.focus();
        break;
      case 'ArrowLeft':
        (cell.previousElementSibling as HTMLElement)?.focus();
        break;
      case 'ArrowDown':
        const nextRow = cell.parentElement?.nextElementSibling;
        if (nextRow) {
          const index = Array.from(cell.parentElement!.children).indexOf(cell);
          (nextRow.children[index] as HTMLElement)?.focus();
        }
        break;
      case 'ArrowUp':
        const prevRow = cell.parentElement?.previousElementSibling;
        if (prevRow && prevRow.tagName === 'TR') {
          const index = Array.from(cell.parentElement!.children).indexOf(cell);
          (prevRow.children[index] as HTMLElement)?.focus();
        }
        break;
    }
  }, []);
  
  return (
    <>
      {/* Screen reader announcements */}
      <div className="sr-only" role="status" aria-live="polite">
        {announcement}
      </div>
      
      <table
        id={tableId}
        className="w-full border-collapse"
        role="table"
        aria-label={caption}
        onKeyDown={handleKeyDown}
      >
        <caption className="text-lg font-semibold mb-4">
          {caption}
          <span className="sr-only">
            . Use arrow keys to navigate between cells.
          </span>
        </caption>
        
        <thead>
          <tr role="row">
            {columns.map((column) => (
              <th
                key={column.key}
                role="columnheader"
                aria-sort={getSortDirection(column.key, sortConfig)}
                tabIndex={0}
                className="px-4 py-2 text-left font-semibold"
              >
                {column.sortable ? (
                  <button
                    onClick={() => handleSort(column.key)}
                    className="flex items-center gap-2 hover:underline"
                    aria-label={`Sort by ${column.label}`}
                  >
                    {column.label}
                    <SortIcon direction={getSortDirection(column.key, sortConfig)} />
                  </button>
                ) : (
                  column.label
                )}
              </th>
            ))}
          </tr>
        </thead>
        
        <tbody>
          {data.map((row, rowIndex) => (
            <tr key={row.id} role="row">
              {columns.map((column) => (
                <td
                  key={column.key}
                  role="cell"
                  tabIndex={0}
                  className="px-4 py-2 border-t"
                >
                  {column.render ? column.render(row) : row[column.key]}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
      
      {/* Keyboard instructions for screen reader users */}
      <div className="sr-only" id={`${tableId}-instructions`}>
        Table navigation instructions: Use arrow keys to move between cells.
        Press Enter or Space on sortable column headers to change sort order.
      </div>
    </>
  );
}
```

## Testing Strategies

### Unit Testing

```typescript
// Good: Comprehensive unit tests
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { validateOrgNumber } from '../validateOrgNumber';
import { PaymentService } from '../PaymentService';

describe('validateOrgNumber', () => {
  it('should validate correct organization numbers', () => {
    expect(validateOrgNumber('920 966 837')).toBe(true); // With spaces
    expect(validateOrgNumber('920966837')).toBe(true);   // Without spaces
  });
  
  it('should reject invalid organization numbers', () => {
    expect(validateOrgNumber('12345678')).toBe(false);   // Too short
    expect(validateOrgNumber('1234567890')).toBe(false); // Too long
    expect(validateOrgNumber('123456789')).toBe(false);  // Invalid checksum
    expect(validateOrgNumber('abc123789')).toBe(false);  // Non-numeric
  });
  
  it('should handle edge cases', () => {
    expect(validateOrgNumber('')).toBe(false);
    expect(validateOrgNumber(' ')).toBe(false);
    expect(validateOrgNumber(null as any)).toBe(false);
    expect(validateOrgNumber(undefined as any)).toBe(false);
  });
});

describe('PaymentService', () => {
  let paymentService: PaymentService;
  let mockVippsClient: any;
  let mockAuditLog: any;
  
  beforeEach(() => {
    mockVippsClient = {
      createPayment: vi.fn(),
      capturePayment: vi.fn(),
    };
    
    mockAuditLog = {
      record: vi.fn(),
    };
    
    paymentService = new PaymentService(mockVippsClient, mockAuditLog);
  });
  
  describe('processPayment', () => {
    it('should process valid payment successfully', async () => {
      const payment = {
        amount: 299.90,
        currency: 'NOK',
        description: 'Test payment',
      };
      
      mockVippsClient.createPayment.mockResolvedValue({
        paymentId: 'pay_123',
        status: 'authorized',
      });
      
      const result = await paymentService.processPayment(payment);
      
      expect(result.paymentId).toBe('pay_123');
      expect(mockAuditLog.record).toHaveBeenCalledWith({
        action: 'payment_processed',
        amount: 299.90,
        status: 'authorized',
      });
    });
    
    it('should handle payment failures gracefully', async () => {
      mockVippsClient.createPayment.mockRejectedValue(
        new Error('Insufficient funds')
      );
      
      await expect(
        paymentService.processPayment({ amount: 100 })
      ).rejects.toThrow('Payment failed');
      
      expect(mockAuditLog.record).toHaveBeenCalledWith({
        action: 'payment_failed',
        error: 'Insufficient funds',
      });
    });
  });
});
```

### Integration Testing

```typescript
// Good: Integration tests
import { test, expect } from '@playwright/test';

test.describe('Checkout Flow', () => {
  test.beforeEach(async ({ page }) => {
    // Set up test data
    await page.goto('/products');
    await page.click('[data-testid="add-to-cart-123"]');
    await page.goto('/checkout');
  });
  
  test('should complete checkout with Vipps', async ({ page }) => {
    // Fill customer information
    await page.fill('[name="email"]', 'test@example.com');
    await page.fill('[name="phone"]', '98765432');
    
    // Fill shipping address
    await page.fill('[name="address"]', 'Testgata 1');
    await page.fill('[name="postalCode"]', '0001');
    
    // Wait for postal code lookup
    await expect(page.locator('[name="city"]')).toHaveValue('Oslo');
    
    // Select Vipps payment
    await page.click('[data-payment-method="vipps"]');
    
    // Complete order
    await page.click('[data-testid="complete-order"]');
    
    // Should redirect to Vipps
    await expect(page).toHaveURL(/vipps\.no/);
  });
  
  test('should validate Norwegian phone numbers', async ({ page }) => {
    await page.fill('[name="phone"]', '123'); // Invalid
    await page.click('[data-testid="complete-order"]');
    
    await expect(
      page.locator('[data-error="phone"]')
    ).toContainText('Ugyldig norsk telefonnummer');
    
    // Fix phone number
    await page.fill('[name="phone"]', '98765432');
    await expect(
      page.locator('[data-error="phone"]')
    ).not.toBeVisible();
  });
  
  test('should handle accessibility', async ({ page }) => {
    // Check for accessibility violations
    const accessibilityScanResults = await page.accessibility.snapshot();
    expect(accessibilityScanResults).toBeTruthy();
    
    // Test keyboard navigation
    await page.keyboard.press('Tab'); // Focus first input
    await expect(page.locator(':focus')).toHaveAttribute('name', 'email');
    
    await page.keyboard.type('test@example.com');
    await page.keyboard.press('Tab'); // Move to next field
    await expect(page.locator(':focus')).toHaveAttribute('name', 'phone');
  });
});
```

### Performance Testing

```typescript
// Good: Performance benchmarks
import { bench, describe } from 'vitest';

describe('Performance Benchmarks', () => {
  bench('Organization number validation', () => {
    validateOrgNumber('920966837');
  });
  
  bench('Norwegian phone validation', () => {
    validateNorwegianPhone('98765432');
  });
  
  bench('Product filtering (1000 items)', () => {
    const products = generateProducts(1000);
    filterProducts(products, {
      category: 'electronics',
      priceRange: { min: 0, max: 5000 },
    });
  });
  
  bench('VAT calculation', () => {
    calculateNorwegianVAT(1000, VATRate.STANDARD);
  });
});

// Load testing
describe('Load Tests', () => {
  test('should handle concurrent checkouts', async () => {
    const checkoutPromises = Array(100).fill(null).map((_, i) => 
      processCheckout({
        orderId: `test-${i}`,
        amount: 299.90,
        paymentMethod: 'vipps',
      })
    );
    
    const results = await Promise.allSettled(checkoutPromises);
    const successful = results.filter(r => r.status === 'fulfilled');
    
    expect(successful.length).toBeGreaterThan(95); // 95% success rate
  });
});
```

## Deployment Guidelines

### Environment Configuration

```typescript
// Good: Environment-specific configuration
interface EnvironmentConfig {
  production: {
    apiUrl: string;
    cdnUrl: string;
    analyticsId: string;
    features: FeatureFlags;
  };
  staging: {
    apiUrl: string;
    cdnUrl: string;
    analyticsId: string;
    features: FeatureFlags;
  };
  development: {
    apiUrl: string;
    cdnUrl: string;
    analyticsId: string;
    features: FeatureFlags;
  };
}

const config: EnvironmentConfig = {
  production: {
    apiUrl: 'https://api.xaheen.no',
    cdnUrl: 'https://cdn.xaheen.no',
    analyticsId: process.env.NEXT_PUBLIC_ANALYTICS_ID!,
    features: {
      vippsPayment: true,
      bankIdAuth: true,
      betaFeatures: false,
    },
  },
  staging: {
    apiUrl: 'https://staging-api.xaheen.no',
    cdnUrl: 'https://staging-cdn.xaheen.no',
    analyticsId: process.env.NEXT_PUBLIC_ANALYTICS_ID!,
    features: {
      vippsPayment: true,
      bankIdAuth: true,
      betaFeatures: true,
    },
  },
  development: {
    apiUrl: 'http://localhost:3001',
    cdnUrl: 'http://localhost:3001',
    analyticsId: 'dev-analytics',
    features: {
      vippsPayment: true,
      bankIdAuth: false, // Use mock in dev
      betaFeatures: true,
    },
  },
};

export function getConfig(): EnvironmentConfig[keyof EnvironmentConfig] {
  const env = process.env.NODE_ENV as keyof EnvironmentConfig;
  return config[env] || config.development;
}
```

### CI/CD Pipeline

```yaml
# Good: Comprehensive CI/CD
name: Deploy Production

on:
  push:
    branches: [main]

jobs:
  quality:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      
      - name: Setup Node.js
        uses: actions/setup-node@v3
        with:
          node-version: '20'
          
      - name: Install dependencies
        run: bun install --frozen-lockfile
        
      - name: Type check
        run: bun run type-check
        
      - name: Lint
        run: bun run lint
        
      - name: Test
        run: bun run test:ci
        
      - name: Build
        run: bun run build
        
  security:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      
      - name: Security scan
        uses: snyk/actions/node@master
        env:
          SNYK_TOKEN: ${{ secrets.SNYK_TOKEN }}
          
      - name: OWASP dependency check
        uses: dependency-check/Dependency-Check_Action@main
        
  compliance:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      
      - name: GDPR compliance check
        run: bun run compliance:gdpr
        
      - name: Accessibility check
        run: bun run compliance:wcag
        
      - name: NSM security check
        run: bun run compliance:nsm
        
  deploy:
    needs: [quality, security, compliance]
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      
      - name: Deploy to production
        run: |
          bun run deploy:prod
        env:
          VERCEL_TOKEN: ${{ secrets.VERCEL_TOKEN }}
          
      - name: Run smoke tests
        run: bun run test:smoke
        
      - name: Notify deployment
        uses: 8398a7/action-slack@v3
        with:
          status: ${{ job.status }}
          text: 'Production deployment completed'
```

### Monitoring and Observability

```typescript
// Good: Comprehensive monitoring
import { trace, context, SpanStatusCode } from '@opentelemetry/api';

const tracer = trace.getTracer('xaheen-api', '1.0.0');

export function instrumentedHandler(
  handler: RequestHandler
): RequestHandler {
  return async (req, res) => {
    const span = tracer.startSpan(`${req.method} ${req.path}`);
    
    try {
      // Add request metadata
      span.setAttributes({
        'http.method': req.method,
        'http.path': req.path,
        'http.user_agent': req.headers['user-agent'],
        'user.id': req.user?.id,
        'tenant.id': req.tenant?.id,
      });
      
      // Execute handler with context
      const result = await context.with(
        trace.setSpan(context.active(), span),
        () => handler(req, res)
      );
      
      // Record success
      span.setStatus({
        code: SpanStatusCode.OK,
      });
      
      return result;
    } catch (error) {
      // Record error
      span.recordException(error as Error);
      span.setStatus({
        code: SpanStatusCode.ERROR,
        message: error.message,
      });
      
      // Alert on critical errors
      if (isCriticalError(error)) {
        await alerting.sendAlert({
          severity: 'critical',
          title: 'Critical Error in Production',
          error,
          context: {
            path: req.path,
            user: req.user?.id,
          },
        });
      }
      
      throw error;
    } finally {
      span.end();
    }
  };
}

// Metrics collection
export class MetricsCollector {
  private readonly counters = new Map<string, number>();
  private readonly histograms = new Map<string, number[]>();
  
  incrementCounter(name: string, tags?: Record<string, string>): void {
    const key = this.buildKey(name, tags);
    this.counters.set(key, (this.counters.get(key) || 0) + 1);
  }
  
  recordHistogram(name: string, value: number, tags?: Record<string, string>): void {
    const key = this.buildKey(name, tags);
    const values = this.histograms.get(key) || [];
    values.push(value);
    this.histograms.set(key, values);
  }
  
  async flush(): Promise<void> {
    // Send to monitoring service
    await Promise.all([
      this.flushCounters(),
      this.flushHistograms(),
    ]);
    
    // Clear local data
    this.counters.clear();
    this.histograms.clear();
  }
}
```

---

> **For Agents**: This best practices guide provides comprehensive guidelines for building high-quality applications with the Xaheen platform. Follow these patterns to ensure your code is maintainable, performant, secure, and compliant. Always prioritize code quality, user experience, and regulatory compliance in all implementations.