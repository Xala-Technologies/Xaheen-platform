# Xaheen API Reference - Complete Documentation

## Table of Contents

1. [API Overview](#api-overview)
2. [Core APIs](#core-apis)
3. [Generator APIs](#generator-apis)
4. [Validator APIs](#validator-apis)
5. [Integration APIs](#integration-apis)
6. [AI APIs](#ai-apis)
7. [Document APIs](#document-apis)
8. [Compliance APIs](#compliance-apis)
9. [Utility APIs](#utility-apis)
10. [Error Handling](#error-handling)

## API Overview

The Xaheen platform provides a comprehensive set of APIs for programmatic access to all features.

### API Architecture

```typescript
interface XaheenAPI {
  // Core functionality
  core: {
    project: ProjectAPI;
    config: ConfigAPI;
    template: TemplateAPI;
  };
  
  // Generation
  generators: {
    component: ComponentGeneratorAPI;
    page: PageGeneratorAPI;
    model: ModelGeneratorAPI;
    service: ServiceGeneratorAPI;
  };
  
  // Validation
  validators: {
    gdpr: GDPRValidatorAPI;
    nsm: NSMValidatorAPI;
    wcag: WCAGValidatorAPI;
  };
  
  // AI Services
  ai: {
    nlp: NLPProcessorAPI;
    generator: AIGeneratorAPI;
    suggester: CodeSuggesterAPI;
  };
  
  // Integrations
  integrations: {
    auth: AuthIntegrationAPI;
    payment: PaymentIntegrationAPI;
    communication: CommunicationAPI;
  };
}
```

### Authentication

```typescript
// API Key authentication
const xaheen = new XaheenSDK({
  apiKey: process.env.XAHEEN_API_KEY,
  environment: 'production',
});

// OAuth2 authentication
const xaheen = new XaheenSDK({
  oauth: {
    clientId: process.env.XAHEEN_CLIENT_ID,
    clientSecret: process.env.XAHEEN_CLIENT_SECRET,
    scope: ['read', 'write', 'generate'],
  },
});
```

## Core APIs

### Project API

```typescript
interface ProjectAPI {
  /**
   * Initialize a new project
   * @param options - Project initialization options
   * @returns Project configuration and metadata
   */
  init(options: ProjectInitOptions): Promise<Project>;
  
  /**
   * Load existing project configuration
   * @param path - Project directory path
   * @returns Project configuration
   */
  load(path: string): Promise<Project>;
  
  /**
   * Update project configuration
   * @param updates - Configuration updates
   * @returns Updated project
   */
  update(updates: Partial<ProjectConfig>): Promise<Project>;
  
  /**
   * Validate project structure and configuration
   * @param options - Validation options
   * @returns Validation result
   */
  validate(options?: ValidationOptions): Promise<ValidationResult>;
}

// Types
interface ProjectInitOptions {
  name: string;
  template?: 'default' | 'enterprise' | 'government' | 'healthcare';
  framework?: 'next' | 'nuxt' | 'sveltekit' | 'react';
  ui?: 'default' | 'xala' | 'custom';
  features?: string[];
  integrations?: string[];
  language?: string[];
  compliance?: ('gdpr' | 'nsm' | 'wcag')[];
  packageManager?: 'npm' | 'yarn' | 'pnpm' | 'bun';
}

interface Project {
  id: string;
  name: string;
  version: string;
  config: ProjectConfig;
  metadata: ProjectMetadata;
  createdAt: Date;
  updatedAt: Date;
}
```

#### Examples

```typescript
// Initialize new project
const project = await xaheen.core.project.init({
  name: 'my-norwegian-app',
  template: 'enterprise',
  framework: 'next',
  ui: 'xala',
  features: ['auth', 'payment', 'analytics'],
  integrations: ['vipps', 'bankid', 'altinn'],
  language: ['nb', 'en'],
  compliance: ['gdpr', 'nsm', 'wcag'],
});

// Load existing project
const existingProject = await xaheen.core.project.load('./my-app');

// Update project configuration
const updated = await xaheen.core.project.update({
  features: [...existingProject.config.features, 'chat'],
  integrations: [...existingProject.config.integrations, 'slack'],
});

// Validate project
const validation = await xaheen.core.project.validate({
  checkDependencies: true,
  checkCompliance: true,
  checkSecurity: true,
});
```

### Config API

```typescript
interface ConfigAPI {
  /**
   * Get configuration value
   * @param key - Configuration key
   * @returns Configuration value
   */
  get<T = any>(key: string): T;
  
  /**
   * Set configuration value
   * @param key - Configuration key
   * @param value - Configuration value
   */
  set(key: string, value: any): void;
  
  /**
   * Load configuration from file
   * @param path - Configuration file path
   */
  load(path: string): Promise<void>;
  
  /**
   * Save configuration to file
   * @param path - Output file path
   */
  save(path: string): Promise<void>;
  
  /**
   * Validate configuration
   * @returns Validation result
   */
  validate(): ValidationResult;
  
  /**
   * Get environment-specific configuration
   * @param env - Environment name
   * @returns Environment configuration
   */
  getEnv(env: 'development' | 'staging' | 'production'): EnvConfig;
}
```

#### Examples

```typescript
// Get configuration
const apiKey = xaheen.core.config.get<string>('integrations.vipps.apiKey');
const features = xaheen.core.config.get<string[]>('features');

// Set configuration
xaheen.core.config.set('compliance.gdpr.dataRetention', 90);

// Load custom configuration
await xaheen.core.config.load('./xaheen.config.json');

// Environment-specific config
const prodConfig = xaheen.core.config.getEnv('production');
```

### Template API

```typescript
interface TemplateAPI {
  /**
   * List available templates
   * @param filter - Optional filter criteria
   * @returns List of templates
   */
  list(filter?: TemplateFilter): Promise<Template[]>;
  
  /**
   * Get template by name
   * @param name - Template name
   * @returns Template content and metadata
   */
  get(name: string): Promise<Template>;
  
  /**
   * Process template with context
   * @param name - Template name
   * @param context - Template context
   * @returns Processed content
   */
  process(name: string, context: any): Promise<string>;
  
  /**
   * Register custom template
   * @param template - Template definition
   */
  register(template: CustomTemplate): Promise<void>;
  
  /**
   * Validate template syntax
   * @param content - Template content
   * @returns Validation result
   */
  validate(content: string): ValidationResult;
}

// Types
interface Template {
  name: string;
  category: 'component' | 'page' | 'service' | 'model';
  description: string;
  version: string;
  compliance: string[];
  content: string;
  helpers?: Record<string, Function>;
  partials?: Record<string, string>;
}
```

#### Examples

```typescript
// List available templates
const templates = await xaheen.core.template.list({
  category: 'component',
  compliance: ['gdpr', 'wcag'],
});

// Get specific template
const componentTemplate = await xaheen.core.template.get('component.tsx');

// Process template
const processed = await xaheen.core.template.process('component.tsx', {
  componentName: 'UserCard',
  props: [
    { name: 'name', type: 'string' },
    { name: 'email', type: 'string' },
  ],
  compliance: { gdpr: true, wcag: true },
});

// Register custom template
await xaheen.core.template.register({
  name: 'custom-component',
  category: 'component',
  content: '{{> header}}\nexport const {{componentName}} = () => {};',
  helpers: {
    formatDate: (date) => new Date(date).toLocaleDateString('nb-NO'),
  },
});
```

## Generator APIs

### Component Generator API

```typescript
interface ComponentGeneratorAPI {
  /**
   * Generate a new component
   * @param options - Component generation options
   * @returns Generation result with file paths
   */
  generate(options: ComponentOptions): Promise<GenerationResult>;
  
  /**
   * Generate component from natural language
   * @param description - Natural language description
   * @returns Generated component
   */
  generateFromDescription(description: string): Promise<GenerationResult>;
  
  /**
   * Update existing component
   * @param path - Component file path
   * @param updates - Component updates
   * @returns Updated component
   */
  update(path: string, updates: ComponentUpdates): Promise<GenerationResult>;
  
  /**
   * Add props to component
   * @param path - Component file path
   * @param props - New props to add
   * @returns Updated component
   */
  addProps(path: string, props: ComponentProp[]): Promise<GenerationResult>;
}

// Types
interface ComponentOptions {
  name: string;
  props?: ComponentProp[];
  type?: 'display' | 'form' | 'layout' | 'composite';
  ui?: 'default' | 'xala';
  compliance?: ComplianceConfig;
  features?: string[];
  hooks?: string[];
  state?: StateConfig;
  path?: string;
}

interface ComponentProp {
  name: string;
  type: string;
  optional?: boolean;
  default?: any;
  validation?: string;
  description?: string;
}

interface GenerationResult {
  success: boolean;
  files: GeneratedFile[];
  errors?: string[];
  warnings?: string[];
  metadata?: any;
}
```

#### Examples

```typescript
// Generate basic component
const result = await xaheen.generators.component.generate({
  name: 'UserProfile',
  props: [
    { name: 'user', type: 'User' },
    { name: 'onEdit', type: '(user: User) => void', optional: true },
  ],
  type: 'display',
  ui: 'xala',
  compliance: { gdpr: true, wcag: true },
});

// Generate from description
const aiGenerated = await xaheen.generators.component.generateFromDescription(
  'Create a user profile card with avatar, name, email, and edit button. ' +
  'Should be GDPR compliant and accessible.'
);

// Update component
const updated = await xaheen.generators.component.update(
  './src/components/UserProfile.tsx',
  {
    props: [{ name: 'showAvatar', type: 'boolean', default: true }],
    features: ['loading-state', 'error-handling'],
  }
);

// Add props to existing component
const enhanced = await xaheen.generators.component.addProps(
  './src/components/UserCard.tsx',
  [
    { name: 'role', type: 'UserRole' },
    { name: 'lastActive', type: 'Date', optional: true },
  ]
);
```

### Page Generator API

```typescript
interface PageGeneratorAPI {
  /**
   * Generate a new page
   * @param options - Page generation options
   * @returns Generation result
   */
  generate(options: PageOptions): Promise<GenerationResult>;
  
  /**
   * Generate page with route parameters
   * @param route - Route pattern (e.g., /users/[id])
   * @param options - Page options
   * @returns Generated page
   */
  generateDynamic(route: string, options: PageOptions): Promise<GenerationResult>;
  
  /**
   * Add API route to page
   * @param pagePath - Page file path
   * @param apiOptions - API route options
   * @returns Updated page with API
   */
  addApiRoute(pagePath: string, apiOptions: ApiRouteOptions): Promise<GenerationResult>;
  
  /**
   * Update page metadata
   * @param path - Page file path
   * @param metadata - New metadata
   * @returns Updated page
   */
  updateMetadata(path: string, metadata: PageMetadata): Promise<GenerationResult>;
}

// Types
interface PageOptions {
  name: string;
  route?: string;
  layout?: string;
  auth?: AuthRequirement;
  features?: string[];
  components?: string[];
  seo?: SEOConfig;
  data?: DataFetchingConfig;
}

interface PageMetadata {
  title: string;
  description: string;
  keywords?: string[];
  openGraph?: OpenGraphData;
  twitter?: TwitterCardData;
}
```

#### Examples

```typescript
// Generate static page
const homePage = await xaheen.generators.page.generate({
  name: 'Home',
  route: '/',
  layout: 'public',
  features: ['hero', 'features', 'testimonials'],
  seo: {
    title: 'Velkommen til Xaheen',
    description: 'Norges beste utviklingsplattform',
  },
});

// Generate dynamic page
const userPage = await xaheen.generators.page.generateDynamic(
  '/users/[id]',
  {
    name: 'UserDetail',
    auth: { required: true, role: 'user' },
    features: ['profile', 'activity', 'settings'],
    data: {
      source: 'api',
      endpoint: '/api/users/[id]',
      cache: { ttl: 3600 },
    },
  }
);

// Add API route
const withApi = await xaheen.generators.page.addApiRoute(
  './src/pages/products.tsx',
  {
    method: 'GET',
    handler: 'getProducts',
    auth: false,
    cache: { ttl: 300 },
  }
);
```

### Model Generator API

```typescript
interface ModelGeneratorAPI {
  /**
   * Generate database model
   * @param options - Model generation options
   * @returns Generated model files
   */
  generate(options: ModelOptions): Promise<GenerationResult>;
  
  /**
   * Generate model from existing database
   * @param connection - Database connection
   * @param table - Table name
   * @returns Generated model
   */
  generateFromDatabase(connection: DBConnection, table: string): Promise<GenerationResult>;
  
  /**
   * Add relations to model
   * @param modelPath - Model file path
   * @param relations - Relations to add
   * @returns Updated model
   */
  addRelations(modelPath: string, relations: ModelRelation[]): Promise<GenerationResult>;
  
  /**
   * Generate migration
   * @param models - Models to migrate
   * @returns Migration file
   */
  generateMigration(models: string[]): Promise<GenerationResult>;
}

// Types
interface ModelOptions {
  name: string;
  fields: ModelField[];
  relations?: ModelRelation[];
  indexes?: string[];
  audit?: boolean;
  softDelete?: boolean;
  validation?: boolean;
  compliance?: ComplianceConfig;
}

interface ModelField {
  name: string;
  type: FieldType;
  unique?: boolean;
  required?: boolean;
  default?: any;
  validation?: ValidationRule[];
}
```

#### Examples

```typescript
// Generate model
const userModel = await xaheen.generators.model.generate({
  name: 'User',
  fields: [
    { name: 'id', type: 'uuid', unique: true },
    { name: 'email', type: 'string', unique: true, required: true },
    { name: 'name', type: 'string', required: true },
    { name: 'personalNumber', type: 'string', validation: ['norwegian-ssn'] },
  ],
  relations: [
    { type: 'hasMany', model: 'Order', foreignKey: 'userId' },
  ],
  audit: true,
  compliance: { gdpr: true },
});

// Generate from database
const imported = await xaheen.generators.model.generateFromDatabase(
  { connectionString: process.env.DATABASE_URL },
  'products'
);

// Add relations
const withRelations = await xaheen.generators.model.addRelations(
  './src/models/Product.ts',
  [
    { type: 'belongsTo', model: 'Category', foreignKey: 'categoryId' },
    { type: 'hasMany', model: 'Review', foreignKey: 'productId' },
  ]
);
```

## Validator APIs

### GDPR Validator API

```typescript
interface GDPRValidatorAPI {
  /**
   * Validate GDPR compliance
   * @param target - File, directory, or code to validate
   * @param options - Validation options
   * @returns Validation result
   */
  validate(target: string, options?: GDPRValidationOptions): Promise<GDPRValidationResult>;
  
  /**
   * Check for personal data
   * @param code - Code to analyze
   * @returns Personal data detection result
   */
  detectPersonalData(code: string): Promise<PersonalDataResult>;
  
  /**
   * Validate consent implementation
   * @param projectPath - Project directory
   * @returns Consent validation result
   */
  validateConsent(projectPath: string): Promise<ConsentValidationResult>;
  
  /**
   * Generate GDPR report
   * @param projectPath - Project directory
   * @param format - Report format
   * @returns GDPR compliance report
   */
  generateReport(projectPath: string, format: 'json' | 'html' | 'pdf'): Promise<Report>;
}

// Types
interface GDPRValidationResult {
  compliant: boolean;
  score: number;
  violations: GDPRViolation[];
  warnings: GDPRWarning[];
  recommendations: string[];
}

interface GDPRViolation {
  type: 'missing_consent' | 'unencrypted_data' | 'missing_privacy_policy' | 'data_retention';
  severity: 'high' | 'medium' | 'low';
  file: string;
  line?: number;
  message: string;
  fix?: string;
}
```

#### Examples

```typescript
// Validate project
const gdprResult = await xaheen.validators.gdpr.validate('./src', {
  checkConsent: true,
  checkEncryption: true,
  checkDataRetention: true,
  checkRights: true,
});

// Detect personal data
const personalData = await xaheen.validators.gdpr.detectPersonalData(
  `const user = { name: 'John', email: 'john@example.com', ssn: '12345678901' };`
);

// Validate consent implementation
const consentResult = await xaheen.validators.gdpr.validateConsent('./my-app');

// Generate report
const report = await xaheen.validators.gdpr.generateReport('./my-app', 'pdf');
```

### NSM Validator API

```typescript
interface NSMValidatorAPI {
  /**
   * Validate NSM security compliance
   * @param target - Target to validate
   * @param classification - Security classification
   * @returns Validation result
   */
  validate(target: string, classification: NSMClassification): Promise<NSMValidationResult>;
  
  /**
   * Classify data sensitivity
   * @param data - Data to classify
   * @returns Classification result
   */
  classifyData(data: any): Promise<ClassificationResult>;
  
  /**
   * Validate encryption
   * @param projectPath - Project directory
   * @returns Encryption validation result
   */
  validateEncryption(projectPath: string): Promise<EncryptionValidationResult>;
  
  /**
   * Audit security implementation
   * @param projectPath - Project directory
   * @returns Security audit result
   */
  auditSecurity(projectPath: string): Promise<SecurityAuditResult>;
}
```

#### Examples

```typescript
// Validate NSM compliance
const nsmResult = await xaheen.validators.nsm.validate(
  './src',
  NSMClassification.RESTRICTED
);

// Classify data
const classification = await xaheen.validators.nsm.classifyData({
  users: [{ name: 'John', personalNumber: '12345678901' }],
  products: [{ name: 'Product', price: 100 }],
});

// Security audit
const audit = await xaheen.validators.nsm.auditSecurity('./my-app');
```

### WCAG Validator API

```typescript
interface WCAGValidatorAPI {
  /**
   * Validate WCAG compliance
   * @param target - HTML, component, or project to validate
   * @param level - WCAG level (A, AA, AAA)
   * @returns Validation result
   */
  validate(target: string, level: 'A' | 'AA' | 'AAA'): Promise<WCAGValidationResult>;
  
  /**
   * Check color contrast
   * @param foreground - Foreground color
   * @param background - Background color
   * @returns Contrast validation result
   */
  checkContrast(foreground: string, background: string): Promise<ContrastResult>;
  
  /**
   * Validate keyboard navigation
   * @param componentPath - Component file path
   * @returns Keyboard navigation result
   */
  validateKeyboardNav(componentPath: string): Promise<KeyboardNavResult>;
  
  /**
   * Generate accessibility report
   * @param projectPath - Project directory
   * @returns Accessibility report
   */
  generateReport(projectPath: string): Promise<AccessibilityReport>;
}
```

#### Examples

```typescript
// Validate WCAG AAA
const wcagResult = await xaheen.validators.wcag.validate('./src', 'AAA');

// Check contrast
const contrast = await xaheen.validators.wcag.checkContrast('#333333', '#ffffff');

// Validate keyboard navigation
const keyboardNav = await xaheen.validators.wcag.validateKeyboardNav(
  './src/components/Navigation.tsx'
);
```

## Integration APIs

### Auth Integration API

```typescript
interface AuthIntegrationAPI {
  /**
   * Configure authentication provider
   * @param provider - Provider name
   * @param config - Provider configuration
   */
  configure(provider: AuthProvider, config: AuthConfig): Promise<void>;
  
  /**
   * Authenticate user
   * @param provider - Provider to use
   * @param credentials - User credentials
   * @returns Authentication result
   */
  authenticate(provider: AuthProvider, credentials?: any): Promise<AuthResult>;
  
  /**
   * Get current user
   * @returns Current authenticated user
   */
  getCurrentUser(): Promise<User | null>;
  
  /**
   * Logout user
   * @param provider - Provider to logout from
   */
  logout(provider?: AuthProvider): Promise<void>;
}

// Types
type AuthProvider = 'vipps' | 'bankid' | 'auth0' | 'feide';

interface AuthConfig {
  clientId: string;
  clientSecret?: string;
  redirectUri?: string;
  scope?: string[];
  environment?: 'test' | 'production';
}
```

#### Examples

```typescript
// Configure Vipps
await xaheen.integrations.auth.configure('vipps', {
  clientId: process.env.VIPPS_CLIENT_ID,
  clientSecret: process.env.VIPPS_CLIENT_SECRET,
  redirectUri: 'https://myapp.no/auth/callback',
  scope: ['openid', 'profile', 'email'],
});

// Authenticate with BankID
const authResult = await xaheen.integrations.auth.authenticate('bankid', {
  personalNumber: '12345678901',
});

// Get current user
const user = await xaheen.integrations.auth.getCurrentUser();
```

### Payment Integration API

```typescript
interface PaymentIntegrationAPI {
  /**
   * Create payment
   * @param provider - Payment provider
   * @param options - Payment options
   * @returns Payment result
   */
  createPayment(provider: PaymentProvider, options: PaymentOptions): Promise<PaymentResult>;
  
  /**
   * Capture payment
   * @param provider - Payment provider
   * @param paymentId - Payment ID
   * @param amount - Amount to capture (optional)
   * @returns Capture result
   */
  capturePayment(provider: PaymentProvider, paymentId: string, amount?: number): Promise<CaptureResult>;
  
  /**
   * Refund payment
   * @param provider - Payment provider
   * @param paymentId - Payment ID
   * @param amount - Refund amount
   * @param reason - Refund reason
   * @returns Refund result
   */
  refundPayment(provider: PaymentProvider, paymentId: string, amount: number, reason: string): Promise<RefundResult>;
  
  /**
   * Create subscription
   * @param provider - Payment provider
   * @param options - Subscription options
   * @returns Subscription result
   */
  createSubscription(provider: PaymentProvider, options: SubscriptionOptions): Promise<SubscriptionResult>;
}
```

#### Examples

```typescript
// Create Vipps payment
const payment = await xaheen.integrations.payment.createPayment('vipps', {
  amount: 299.90,
  currency: 'NOK',
  description: 'Order #12345',
  returnUrl: 'https://myapp.no/checkout/success',
});

// Capture payment
const capture = await xaheen.integrations.payment.capturePayment(
  'vipps',
  payment.paymentId
);

// Create subscription
const subscription = await xaheen.integrations.payment.createSubscription('stripe', {
  amount: 99,
  currency: 'NOK',
  interval: 'month',
  productName: 'Premium Plan',
});
```

## AI APIs

### NLP Processor API

```typescript
interface NLPProcessorAPI {
  /**
   * Process natural language input
   * @param input - User input
   * @param context - Conversation context
   * @returns Processed result
   */
  process(input: string, context?: ConversationContext): Promise<NLPResult>;
  
  /**
   * Extract intent from text
   * @param text - Input text
   * @returns Intent classification
   */
  extractIntent(text: string): Promise<Intent>;
  
  /**
   * Extract entities from text
   * @param text - Input text
   * @returns Extracted entities
   */
  extractEntities(text: string): Promise<Entity[]>;
  
  /**
   * Generate command from natural language
   * @param input - Natural language input
   * @returns CLI command
   */
  generateCommand(input: string): Promise<CLICommand>;
}

// Types
interface NLPResult {
  intent: Intent;
  entities: Entity[];
  confidence: number;
  suggestedCommand?: string;
  clarificationNeeded?: string;
}

interface Intent {
  type: 'generate' | 'update' | 'delete' | 'query' | 'help';
  target: 'component' | 'page' | 'model' | 'service' | 'project';
  confidence: number;
}
```

#### Examples

```typescript
// Process natural language
const nlpResult = await xaheen.ai.nlp.process(
  'Create a user profile page with authentication'
);

// Extract intent
const intent = await xaheen.ai.nlp.extractIntent(
  'I need to add payment functionality to my checkout page'
);

// Generate command
const command = await xaheen.ai.nlp.generateCommand(
  'Generate a dashboard with charts and user statistics'
);
// Result: xaheen page Dashboard --features=charts,statistics --layout=authenticated
```

### AI Generator API

```typescript
interface AIGeneratorAPI {
  /**
   * Generate code from description
   * @param description - Natural language description
   * @param type - Type of code to generate
   * @param options - Generation options
   * @returns Generated code
   */
  generate(description: string, type: CodeType, options?: AIGenerationOptions): Promise<AIGenerationResult>;
  
  /**
   * Optimize existing code
   * @param code - Code to optimize
   * @param targets - Optimization targets
   * @returns Optimized code
   */
  optimize(code: string, targets: OptimizationTarget[]): Promise<OptimizationResult>;
  
  /**
   * Explain code functionality
   * @param code - Code to explain
   * @param detail - Level of detail
   * @returns Code explanation
   */
  explain(code: string, detail: 'brief' | 'detailed' | 'technical'): Promise<Explanation>;
  
  /**
   * Debug code issue
   * @param code - Code with issue
   * @param error - Error information
   * @returns Debug result with fix
   */
  debug(code: string, error: ErrorInfo): Promise<DebugResult>;
}
```

#### Examples

```typescript
// Generate from description
const generated = await xaheen.ai.generator.generate(
  'Create a responsive navigation menu with dropdown support and mobile hamburger menu',
  'component',
  { framework: 'react', ui: 'xala', compliance: ['wcag'] }
);

// Optimize code
const optimized = await xaheen.ai.generator.optimize(
  existingCode,
  ['performance', 'bundle-size', 'readability']
);

// Debug issue
const debugResult = await xaheen.ai.generator.debug(
  problematicCode,
  {
    error: 'TypeError: Cannot read property map of undefined',
    line: 45,
    stackTrace: '...',
  }
);
```

## Document APIs

### Document Generator API

```typescript
interface DocumentGeneratorAPI {
  /**
   * Generate document
   * @param type - Document type
   * @param data - Document data
   * @param options - Generation options
   * @returns Generated document
   */
  generate(type: DocumentType, data: any, options?: DocumentOptions): Promise<DocumentResult>;
  
  /**
   * Generate invoice
   * @param invoiceData - Invoice data
   * @param template - Invoice template
   * @returns Generated invoice
   */
  generateInvoice(invoiceData: InvoiceData, template?: string): Promise<DocumentResult>;
  
  /**
   * Generate report
   * @param reportData - Report data
   * @param type - Report type
   * @returns Generated report
   */
  generateReport(reportData: ReportData, type: ReportType): Promise<DocumentResult>;
  
  /**
   * Convert document format
   * @param document - Source document
   * @param targetFormat - Target format
   * @returns Converted document
   */
  convert(document: Buffer, targetFormat: DocumentFormat): Promise<Buffer>;
}

// Types
type DocumentType = 'invoice' | 'contract' | 'report' | 'certificate';
type DocumentFormat = 'pdf' | 'docx' | 'html' | 'csv';

interface DocumentOptions {
  template?: string;
  language?: string;
  format?: DocumentFormat;
  encryption?: boolean;
  signature?: SignatureConfig;
}
```

#### Examples

```typescript
// Generate invoice
const invoice = await xaheen.documents.generateInvoice({
  invoiceNumber: 'INV-2024-001',
  customer: {
    name: 'Norsk Bedrift AS',
    orgNumber: '123456789',
    address: { /* ... */ },
  },
  items: [
    { description: 'Konsulenttime', quantity: 10, unitPrice: 1200, vat: 0.25 },
  ],
  dueDate: new Date('2024-02-01'),
});

// Generate compliance report
const report = await xaheen.documents.generateReport(
  { projectId: 'my-app', period: 'Q1-2024' },
  'compliance'
);
```

## Compliance APIs

### Compliance Manager API

```typescript
interface ComplianceManagerAPI {
  /**
   * Check overall compliance
   * @param projectPath - Project directory
   * @param standards - Standards to check
   * @returns Compliance result
   */
  check(projectPath: string, standards?: ComplianceStandard[]): Promise<ComplianceCheckResult>;
  
  /**
   * Auto-fix compliance issues
   * @param projectPath - Project directory
   * @param issues - Issues to fix
   * @returns Fix result
   */
  autoFix(projectPath: string, issues: ComplianceIssue[]): Promise<FixResult>;
  
  /**
   * Generate compliance documentation
   * @param projectPath - Project directory
   * @param format - Documentation format
   * @returns Generated documentation
   */
  generateDocs(projectPath: string, format: 'md' | 'pdf' | 'html'): Promise<Documentation>;
  
  /**
   * Monitor compliance in real-time
   * @param projectPath - Project directory
   * @param callback - Monitoring callback
   * @returns Monitoring handle
   */
  monitor(projectPath: string, callback: ComplianceCallback): MonitoringHandle;
}
```

#### Examples

```typescript
// Check compliance
const compliance = await xaheen.compliance.check('./my-app', ['gdpr', 'nsm', 'wcag']);

// Auto-fix issues
const fixed = await xaheen.compliance.autoFix('./my-app', compliance.issues);

// Monitor compliance
const monitor = xaheen.compliance.monitor('./my-app', (event) => {
  if (event.type === 'violation') {
    console.error('Compliance violation:', event.violation);
  }
});
```

## Utility APIs

### File System API

```typescript
interface FileSystemAPI {
  /**
   * Read file
   * @param path - File path
   * @param encoding - File encoding
   * @returns File content
   */
  read(path: string, encoding?: BufferEncoding): Promise<string | Buffer>;
  
  /**
   * Write file
   * @param path - File path
   * @param content - File content
   * @param options - Write options
   */
  write(path: string, content: string | Buffer, options?: WriteOptions): Promise<void>;
  
  /**
   * Find files matching pattern
   * @param pattern - Glob pattern
   * @param options - Search options
   * @returns Matching file paths
   */
  find(pattern: string, options?: FindOptions): Promise<string[]>;
  
  /**
   * Watch for file changes
   * @param path - Path to watch
   * @param callback - Change callback
   * @returns Watcher handle
   */
  watch(path: string, callback: FileChangeCallback): WatcherHandle;
}
```

### Logger API

```typescript
interface LoggerAPI {
  /**
   * Log info message
   * @param message - Log message
   * @param meta - Additional metadata
   */
  info(message: string, meta?: any): void;
  
  /**
   * Log warning
   * @param message - Warning message
   * @param meta - Additional metadata
   */
  warn(message: string, meta?: any): void;
  
  /**
   * Log error
   * @param message - Error message
   * @param error - Error object
   * @param meta - Additional metadata
   */
  error(message: string, error?: Error, meta?: any): void;
  
  /**
   * Log debug information
   * @param message - Debug message
   * @param meta - Additional metadata
   */
  debug(message: string, meta?: any): void;
  
  /**
   * Create child logger
   * @param context - Logger context
   * @returns Child logger instance
   */
  child(context: LogContext): Logger;
}
```

## Error Handling

### Error Types

```typescript
// Base error class
class XaheenError extends Error {
  code: string;
  statusCode: number;
  details?: any;
  
  constructor(message: string, code: string, statusCode = 500, details?: any) {
    super(message);
    this.code = code;
    this.statusCode = statusCode;
    this.details = details;
  }
}

// Specific error types
class ValidationError extends XaheenError {
  constructor(message: string, details: ValidationErrorDetail[]) {
    super(message, 'VALIDATION_ERROR', 400, details);
  }
}

class ComplianceError extends XaheenError {
  constructor(message: string, violations: ComplianceViolation[]) {
    super(message, 'COMPLIANCE_ERROR', 422, violations);
  }
}

class IntegrationError extends XaheenError {
  constructor(integration: string, message: string, originalError?: any) {
    super(message, 'INTEGRATION_ERROR', 503, { integration, originalError });
  }
}

class GenerationError extends XaheenError {
  constructor(message: string, type: string, context?: any) {
    super(message, 'GENERATION_ERROR', 500, { type, context });
  }
}
```

### Error Handling Patterns

```typescript
// Global error handler
xaheen.on('error', (error: XaheenError) => {
  console.error(`[${error.code}] ${error.message}`);
  
  if (error.details) {
    console.error('Details:', error.details);
  }
  
  // Report to monitoring
  monitoring.reportError(error);
});

// Try-catch with specific handling
try {
  const result = await xaheen.generators.component.generate(options);
} catch (error) {
  if (error instanceof ValidationError) {
    // Handle validation errors
    console.error('Validation failed:', error.details);
  } else if (error instanceof ComplianceError) {
    // Handle compliance errors
    console.error('Compliance violations:', error.details);
  } else {
    // Generic error handling
    throw error;
  }
}

// Async error boundaries
const withErrorBoundary = async <T>(
  operation: () => Promise<T>,
  fallback?: T
): Promise<T> => {
  try {
    return await operation();
  } catch (error) {
    logger.error('Operation failed', error);
    
    if (fallback !== undefined) {
      return fallback;
    }
    
    throw error;
  }
};
```

### API Response Format

```typescript
// Success response
interface SuccessResponse<T = any> {
  success: true;
  data: T;
  metadata?: {
    timestamp: string;
    version: string;
    requestId: string;
  };
}

// Error response
interface ErrorResponse {
  success: false;
  error: {
    code: string;
    message: string;
    details?: any;
    stackTrace?: string; // Only in development
  };
  metadata?: {
    timestamp: string;
    version: string;
    requestId: string;
  };
}

// Paginated response
interface PaginatedResponse<T> extends SuccessResponse<T[]> {
  pagination: {
    page: number;
    pageSize: number;
    totalPages: number;
    totalItems: number;
    hasNext: boolean;
    hasPrevious: boolean;
  };
}
```

---

> **For Agents**: This API reference provides comprehensive documentation of all programmatic interfaces in the Xaheen platform. Use these APIs to build custom integrations, automate workflows, and extend platform functionality. Always handle errors appropriately and follow the established patterns for consistency.