# Xaheen CLI - Complete Command Reference

## Table of Contents

1. [Global Options](#global-options)
2. [Project Commands](#project-commands)
3. [Generation Commands](#generation-commands)
4. [Integration Commands](#integration-commands)
5. [Document Commands](#document-commands)
6. [AI Commands](#ai-commands)
7. [Validation Commands](#validation-commands)
8. [Development Commands](#development-commands)
9. [Deployment Commands](#deployment-commands)
10. [Advanced Commands](#advanced-commands)

## Global Options

These options can be used with any command:

```bash
--help, -h                 # Show help for command
--version, -v              # Show CLI version
--verbose                  # Enable verbose output
--quiet, -q               # Suppress non-error output
--no-color                # Disable colored output
--no-analytics            # Disable analytics tracking
--config <path>           # Use custom config file
--cwd <path>             # Set working directory
--mode <mode>            # CLI mode: legacy|token|xala|xaheen
--language <lang>        # Output language: nb|en|fr|ar
```

## Project Commands

### `xaheen init`

Create a new Xaheen project with intelligent scaffolding.

#### Syntax
```bash
xaheen init [project-name] [options]
```

#### Options
```bash
--template, -t <name>      # Project template
--framework <name>         # Framework: next|nuxt|sveltekit|solid|react
--ui <system>             # UI system: default|xala|custom
--features <list>         # Comma-separated features
--integrations <list>     # Comma-separated integrations
--language <list>         # Supported languages: nb,en,fr,ar
--compliance <list>       # Compliance: gdpr,nsm,wcag
--auth <provider>         # Auth provider: vipps|bankid|auth0
--database <type>         # Database: postgres|mysql|mongo|supabase
--payment <provider>      # Payment: vipps|stripe|paypal
--skip-install            # Skip dependency installation
--skip-git               # Skip git initialization
--use-npm               # Use npm (default: bun)
--use-pnpm              # Use pnpm
--use-yarn              # Use yarn
```

#### Examples

##### Basic Next.js Project
```bash
xaheen init my-app
# Interactive prompts will guide you
```

##### Norwegian E-commerce Project
```bash
xaheen init norwegian-shop \
  --template=ecommerce \
  --framework=next \
  --ui=xala \
  --features=cart,checkout,inventory \
  --integrations=vipps,stripe,altinn \
  --language=nb,en \
  --compliance=gdpr,wcag \
  --auth=vipps \
  --database=postgres \
  --payment=vipps
```

##### Government Service Portal
```bash
xaheen init gov-portal \
  --template=government \
  --framework=next \
  --ui=xala \
  --features=forms,documents,messaging \
  --integrations=bankid,altinn \
  --language=nb,en \
  --compliance=gdpr,nsm,wcag \
  --auth=bankid \
  --database=postgres
```

##### Multi-tenant SaaS
```bash
xaheen init saas-platform \
  --template=saas \
  --framework=next \
  --ui=xala \
  --features=multitenancy,billing,analytics \
  --integrations=stripe,slack,teams \
  --language=nb,en,fr,ar \
  --compliance=gdpr,wcag \
  --auth=auth0 \
  --database=postgres
```

#### Real-World Use Cases

1. **Financial Services App**
```bash
xaheen init fintech-app \
  --template=financial \
  --compliance=gdpr,pci,nsm \
  --auth=bankid \
  --integrations=vipps,stripe \
  --features=kyc,transactions,reporting
```

2. **Healthcare Platform**
```bash
xaheen init health-platform \
  --template=healthcare \
  --compliance=gdpr,wcag \
  --auth=bankid \
  --features=appointments,records,messaging \
  --integrations=altinn,helsenorge
```

3. **Educational System**
```bash
xaheen init edu-system \
  --template=education \
  --features=courses,assignments,grading \
  --language=nb,en,ar \
  --auth=feide \
  --compliance=gdpr,wcag
```

## Generation Commands

### `xaheen component`

Generate a type-safe, accessible, compliant React component.

#### Syntax
```bash
xaheen component <ComponentName> [props] [options]
```

#### Prop Syntax
```
name:type[?][@validation]
```
- `?` marks optional props
- `@` adds validation rules

#### Options
```bash
--type, -t <type>         # Component type: display|form|layout|composite
--ui <system>            # UI system: default|xala
--compliance <list>      # Compliance features: gdpr|nsm|wcag
--features <list>        # Component features
--hooks <list>          # Custom hooks to include
--state <type>          # State management: local|global|context
--test                  # Generate test file
--story                 # Generate Storybook story
--docs                  # Generate documentation
--path <path>          # Custom output path
--force                # Overwrite existing files
```

#### Examples

##### Basic Component
```bash
xaheen component Button
# Creates: src/components/Button.tsx
```

##### Component with Props
```bash
xaheen component UserCard \
  name:string \
  email:string \
  avatar:string? \
  role:Role \
  onEdit:"(user: User) => void"?
```

##### Form Component with Validation
```bash
xaheen component RegistrationForm \
  email:string@email \
  password:string@min:8 \
  age:number@min:18@max:120 \
  consent:boolean@required \
  --type=form \
  --compliance=gdpr,wcag \
  --features=validation,error-handling
```

##### Norwegian Payment Component
```bash
xaheen component PaymentForm \
  amount:number@positive \
  currency:"NOK"|"EUR"|"USD" \
  method:"vipps"|"card"|"invoice" \
  customerInfo:CustomerInfo \
  --type=form \
  --compliance=gdpr,pci \
  --integrations=vipps,stripe \
  --features=validation,3ds,webhooks
```

##### Data Display Component
```bash
xaheen component DataTable \
  data:"T[]" \
  columns:"Column<T>[]" \
  onSort:"(column: string, direction: 'asc'|'desc') => void"? \
  onFilter:"(filters: Filter[]) => void"? \
  --type=display \
  --features=sorting,filtering,pagination,export \
  --compliance=wcag
```

#### Real-World Component Examples

1. **User Authentication Card**
```bash
xaheen component AuthCard \
  provider:"vipps"|"bankid"|"email" \
  onSuccess:"(user: User) => void" \
  onError:"(error: Error) => void" \
  rememberMe:boolean? \
  --compliance=gdpr,wcag \
  --features=mfa,session-management
```

2. **Invoice Generator**
```bash
xaheen component InvoiceForm \
  customer:Customer \
  items:"InvoiceItem[]" \
  vat:number \
  dueDate:Date \
  --type=form \
  --compliance=gdpr \
  --features=pdf-generation,email-sending \
  --integrations=altinn
```

3. **Accessibility Settings**
```bash
xaheen component AccessibilityPanel \
  fontSize:"small"|"medium"|"large" \
  contrast:"normal"|"high" \
  reducedMotion:boolean \
  screenReader:boolean \
  --compliance=wcag \
  --features=persistence,live-preview
```

### `xaheen page`

Generate a complete page with routing, layout, and SEO.

#### Syntax
```bash
xaheen page <PageName> [options]
```

#### Options
```bash
--route <path>           # Route path (default: /page-name)
--layout <name>          # Layout: default|auth|admin|custom
--auth <level>          # Auth requirement: public|user|admin
--title <title>         # Page title for SEO
--description <desc>    # Meta description
--features <list>       # Page features
--components <list>     # Components to include
--api                   # Generate API route
--static                # Static generation (SSG)
--isr <seconds>        # Incremental Static Regeneration
--middleware           # Add middleware
```

#### Examples

##### Basic Page
```bash
xaheen page About
# Creates: app/about/page.tsx
```

##### Dashboard Page
```bash
xaheen page Dashboard \
  --route=/dashboard \
  --layout=auth \
  --auth=user \
  --features=charts,widgets,notifications \
  --components=StatsCard,ActivityFeed,QuickActions
```

##### Product Listing Page
```bash
xaheen page Products \
  --route=/products \
  --features=filtering,sorting,pagination,search \
  --api \
  --isr=3600
```

##### User Profile Page
```bash
xaheen page Profile \
  --route=/profile/[id] \
  --layout=auth \
  --auth=user \
  --features=edit-mode,avatar-upload,activity-history \
  --compliance=gdpr
```

#### Real-World Page Examples

1. **Norwegian Tax Return Page**
```bash
xaheen page TaxReturn \
  --route=/tax/return \
  --layout=auth \
  --auth=bankid \
  --features=form-wizard,validation,preview \
  --integrations=altinn,skatteetaten \
  --compliance=gdpr,nsm
```

2. **E-commerce Checkout**
```bash
xaheen page Checkout \
  --route=/checkout \
  --features=cart-summary,shipping,payment \
  --integrations=vipps,posten \
  --compliance=gdpr,pci
```

3. **Admin Analytics**
```bash
xaheen page Analytics \
  --route=/admin/analytics \
  --layout=admin \
  --auth=admin \
  --features=charts,export,date-range,real-time \
  --components=LineChart,BarChart,MetricCard
```

### `xaheen model`

Generate database models with validation and types.

#### Syntax
```bash
xaheen model <ModelName> [fields] [options]
```

#### Field Syntax
```
fieldName:type[@validation][!][?]
```
- `!` marks unique fields
- `?` marks optional fields

#### Options
```bash
--orm <name>            # ORM: prisma|drizzle|typeorm
--database <type>       # Database type
--relations <list>      # Model relations
--indexes <list>        # Database indexes
--audit                 # Add audit fields
--soft-delete          # Add soft delete
--validation           # Generate Zod schema
--seed                 # Generate seed data
--migration           # Create migration
--api                  # Generate CRUD API
```

#### Examples

##### Basic User Model
```bash
xaheen model User \
  id:uuid! \
  email:string!@email \
  name:string \
  createdAt:datetime \
  updatedAt:datetime
```

##### E-commerce Product Model
```bash
xaheen model Product \
  id:uuid! \
  sku:string! \
  name:string \
  description:text? \
  price:decimal@positive \
  vat:decimal \
  stock:integer@min:0 \
  category:Category \
  images:"string[]" \
  --relations="category:belongsTo,reviews:hasMany" \
  --indexes=sku,category \
  --audit
```

##### Norwegian Invoice Model
```bash
xaheen model Invoice \
  id:uuid! \
  invoiceNumber:string! \
  customerOrg:string@orgNumber \
  amount:decimal@positive \
  vat:decimal \
  dueDate:date \
  status:"draft"|"sent"|"paid"|"overdue" \
  items:"InvoiceItem[]" \
  --audit \
  --soft-delete \
  --validation \
  --api
```

#### Real-World Model Examples

1. **Healthcare Appointment**
```bash
xaheen model Appointment \
  id:uuid! \
  patientId:string \
  doctorId:string \
  dateTime:datetime \
  duration:integer@min:15@max:120 \
  type:"consultation"|"examination"|"procedure" \
  status:"scheduled"|"confirmed"|"completed"|"cancelled" \
  notes:text? \
  --relations="patient:belongsTo,doctor:belongsTo" \
  --audit \
  --compliance=gdpr
```

2. **Financial Transaction**
```bash
xaheen model Transaction \
  id:uuid! \
  accountId:string \
  amount:decimal \
  currency:"NOK"|"EUR"|"USD" \
  type:"debit"|"credit"|"transfer" \
  status:"pending"|"completed"|"failed" \
  reference:string! \
  metadata:json? \
  --indexes="accountId,status,createdAt" \
  --audit \
  --compliance=gdpr,pci
```

### `xaheen service`

Generate business logic services with proper patterns.

#### Syntax
```bash
xaheen service <ServiceName> [options]
```

#### Options
```bash
--type <type>           # Service type: api|business|repository|integration
--pattern <pattern>     # Pattern: singleton|factory|strategy
--methods <list>        # Service methods
--auth                  # Add authentication
--cache                 # Add caching layer
--retry                 # Add retry logic
--circuit-breaker      # Add circuit breaker
--test                 # Generate tests
--mock                 # Generate mocks
```

#### Examples

##### User Service
```bash
xaheen service UserService \
  --type=business \
  --methods=create,update,delete,find,search \
  --auth \
  --cache \
  --test
```

##### Payment Service
```bash
xaheen service PaymentService \
  --type=integration \
  --methods=charge,refund,verify,webhook \
  --retry \
  --circuit-breaker \
  --test
```

##### Norwegian Tax Service
```bash
xaheen service SkattService \
  --type=integration \
  --methods=calculateTax,submitReturn,getStatus \
  --auth=bankid \
  --retry \
  --compliance=gdpr,nsm
```

### `xaheen hook`

Generate custom React hooks.

#### Syntax
```bash
xaheen hook <HookName> [options]
```

#### Options
```bash
--type <type>          # Hook type: state|effect|ref|memo|callback
--deps <list>         # Dependencies
--return <type>       # Return type
--generic            # Make hook generic
--test              # Generate tests
--docs              # Generate documentation
```

#### Examples

##### Data Fetching Hook
```bash
xaheen hook useApiData \
  --type=effect \
  --return="{data: T, loading: boolean, error: Error}" \
  --generic \
  --test
```

##### Form State Hook
```bash
xaheen hook useFormState \
  --type=state \
  --return="{values: T, errors: Errors, handleChange: Function}" \
  --generic
```

##### Norwegian Phone Validation
```bash
xaheen hook useNorwegianPhone \
  --type=callback \
  --return="{isValid: boolean, format: Function}"
```

### `xaheen layout`

Generate application layouts.

#### Syntax
```bash
xaheen layout <LayoutName> [options]
```

#### Options
```bash
--type <type>         # Layout type: app|page|component
--components <list>   # Components to include
--responsive         # Add responsive behavior
--theme             # Add theme support
--a11y              # Enhanced accessibility
```

#### Examples

##### Admin Layout
```bash
xaheen layout AdminLayout \
  --type=app \
  --components=Sidebar,Header,Footer \
  --responsive \
  --theme
```

##### Dashboard Layout
```bash
xaheen layout DashboardLayout \
  --components=Navigation,Sidebar,MainContent,RightPanel \
  --responsive
```

### `xaheen feature`

Generate complete features with multiple components.

#### Syntax
```bash
xaheen feature <FeatureName> [options]
```

#### Options
```bash
--components <list>    # Components to generate
--pages <list>        # Pages to generate
--services <list>     # Services to generate
--models <list>       # Models to generate
--api                # Generate API routes
--docs               # Generate documentation
```

#### Examples

##### User Management Feature
```bash
xaheen feature UserManagement \
  --components=UserList,UserForm,UserCard \
  --pages=Users,UserDetail,UserEdit \
  --services=UserService,AuthService \
  --models=User,Role,Permission \
  --api
```

##### E-commerce Cart Feature
```bash
xaheen feature ShoppingCart \
  --components=CartItem,CartSummary,CartButton \
  --pages=Cart,Checkout \
  --services=CartService,CheckoutService \
  --models=Cart,CartItem \
  --api
```

## Integration Commands

### `xaheen add`

Add integrations to your project.

#### Syntax
```bash
xaheen add <integration> [options]
```

#### Available Integrations
- **Authentication**: vipps, bankid, auth0, feide
- **Payment**: vipps, stripe, paypal, klarna
- **Government**: altinn, skatteetaten, nav
- **Communication**: slack, teams, sendgrid, twilio
- **Analytics**: posthog, plausible, umami
- **Database**: postgres, mysql, mongodb, redis
- **Storage**: s3, cloudinary, uploadthing

#### Options
```bash
--config <path>        # Custom config file
--env <environment>    # Environment: dev|staging|prod
--skip-env            # Skip .env file update
--example             # Add example usage
```

#### Examples

##### Add Vipps Authentication
```bash
xaheen add vipps \
  --config=auth \
  --example

# Creates:
# - lib/auth/vipps.ts
# - components/VippsLogin.tsx
# - api/auth/vipps/route.ts
# - Updates .env with VIPPS_* variables
```

##### Add Altinn Integration
```bash
xaheen add altinn \
  --env=prod \
  --example

# Creates:
# - lib/integrations/altinn.ts
# - services/AltinnService.ts
# - Example API routes
```

##### Add Multiple Integrations
```bash
# Payment providers
xaheen add vipps stripe --config=payment

# Communication
xaheen add slack teams --config=notifications
```

## Document Commands

### `xaheen document`

Generate various document types.

#### Syntax
```bash
xaheen document <type> [options]
```

#### Document Types
- **invoice**: Norwegian invoices with MVA
- **contract**: Legal contracts
- **report**: Business reports
- **pdf**: Generic PDF generation

#### Options
```bash
--template <name>      # Document template
--format <type>       # Output format: pdf|html|docx
--data <path>        # Data source file
--output <path>      # Output file path
--language <lang>    # Document language
--sign              # Add digital signature
--encrypt          # Encrypt document
```

#### Examples

##### Generate Invoice
```bash
xaheen document invoice \
  --template=standard \
  --data=invoice-data.json \
  --output=INV-2024-001.pdf \
  --language=nb \
  --sign
```

##### Generate Contract
```bash
xaheen document contract \
  --template=employment \
  --data=contract-data.json \
  --output=employment-contract.pdf \
  --sign \
  --encrypt
```

##### Generate Report
```bash
xaheen document report \
  --template=quarterly \
  --data=q4-data.json \
  --format=pdf \
  --language=en
```

## AI Commands

### `xaheen ai`

AI-powered development assistance.

#### Syntax
```bash
xaheen ai <command> [options]
```

#### Subcommands

##### `xaheen ai generate`
Generate code from natural language.

```bash
xaheen ai generate "create a user dashboard with charts and notifications"

# Options:
--context            # Use project context
--optimize          # Optimize generated code
--test             # Generate tests
```

##### `xaheen ai suggest`
Get AI suggestions for current code.

```bash
xaheen ai suggest \
  --file=src/components/UserCard.tsx \
  --type=performance

# Suggestion types:
# - performance: Performance optimizations
# - security: Security improvements
# - accessibility: A11y enhancements
# - refactor: Code refactoring
# - test: Test suggestions
```

##### `xaheen ai optimize`
Optimize existing code.

```bash
xaheen ai optimize \
  --file=src/pages/Dashboard.tsx \
  --targets=performance,bundle-size
```

##### `xaheen ai explain`
Explain code functionality.

```bash
xaheen ai explain \
  --file=src/services/PaymentService.ts \
  --detail=high
```

##### `xaheen ai debug`
Debug code issues.

```bash
xaheen ai debug \
  --error="TypeError: Cannot read property 'map' of undefined" \
  --file=src/components/List.tsx \
  --line=45
```

#### Real-World AI Examples

1. **Generate Norwegian E-commerce Site**
```bash
xaheen ai generate \
  "Create a Norwegian e-commerce site with Vipps payment, \
   product catalog, shopping cart, and Altinn integration \
   for business customers"
```

2. **Optimize Performance**
```bash
xaheen ai optimize \
  --file=src/pages/ProductList.tsx \
  --targets=performance,seo,accessibility
```

3. **Debug Complex Issue**
```bash
xaheen ai debug \
  --error="GDPR compliance validation failed" \
  --context=user-registration \
  --suggest-fix
```

## Validation Commands

### `xaheen validate`

Validate code against compliance standards.

#### Syntax
```bash
xaheen validate [options]
```

#### Options
```bash
--compliance <list>    # Standards: gdpr|nsm|wcag|all
--files <pattern>     # File pattern to validate
--fix                # Auto-fix issues
--report <format>    # Report format: json|html|pdf
--fail-on-error     # Exit with error code
```

#### Examples

##### Validate GDPR Compliance
```bash
xaheen validate \
  --compliance=gdpr \
  --files="src/**/*.{ts,tsx}" \
  --report=html
```

##### Full Compliance Check
```bash
xaheen validate \
  --compliance=all \
  --fix \
  --fail-on-error
```

##### Accessibility Validation
```bash
xaheen validate \
  --compliance=wcag \
  --files="src/components/**/*.tsx" \
  --report=json
```

## Development Commands

### `xaheen dev`

Start development server with hot reload.

#### Syntax
```bash
xaheen dev [options]
```

#### Options
```bash
--port <number>       # Port number (default: 3000)
--host <host>        # Host address
--https             # Enable HTTPS
--open              # Open browser
--turbo             # Use Turbopack
--compliance-check  # Real-time compliance validation
--ai-assist        # Enable AI assistance
```

#### Examples

```bash
# Basic dev server
xaheen dev

# With compliance checking
xaheen dev --compliance-check --port=3001

# With HTTPS and AI
xaheen dev --https --ai-assist --open
```

### `xaheen build`

Build project for production.

#### Syntax
```bash
xaheen build [options]
```

#### Options
```bash
--mode <mode>        # Build mode: production|staging
--analyze           # Bundle analysis
--source-maps      # Generate source maps
--compliance-report # Generate compliance report
--optimize         # Advanced optimizations
```

#### Examples

```bash
# Production build
xaheen build --mode=production

# Build with analysis
xaheen build --analyze --compliance-report
```

### `xaheen test`

Run tests with coverage.

#### Syntax
```bash
xaheen test [options]
```

#### Options
```bash
--coverage          # Generate coverage report
--watch            # Watch mode
--compliance       # Include compliance tests
--e2e              # Run E2E tests
--unit             # Run unit tests only
```

#### Examples

```bash
# Run all tests
xaheen test --coverage

# Watch mode
xaheen test --watch --unit

# Compliance tests
xaheen test --compliance --e2e
```

## Deployment Commands

### `xaheen deploy`

Deploy to various platforms.

#### Syntax
```bash
xaheen deploy <target> [options]
```

#### Targets
- **vercel**: Deploy to Vercel
- **netlify**: Deploy to Netlify
- **cloudflare**: Deploy to Cloudflare
- **azure**: Deploy to Azure
- **custom**: Custom deployment

#### Options
```bash
--env <environment>   # Environment: prod|staging
--preview           # Preview deployment
--skip-build       # Skip build step
--compliance-check # Pre-deploy compliance
```

#### Examples

```bash
# Deploy to Vercel
xaheen deploy vercel --env=prod

# Preview deployment
xaheen deploy netlify --preview

# Custom deployment
xaheen deploy custom \
  --script=./deploy.sh \
  --compliance-check
```

## Advanced Commands

### `xaheen migrate`

Migrate between versions or frameworks.

#### Syntax
```bash
xaheen migrate <target> [options]
```

#### Examples

```bash
# Migrate to latest version
xaheen migrate latest --backup

# Migrate from CRA to Next.js
xaheen migrate next --from=cra
```

### `xaheen analyze`

Analyze codebase for improvements.

#### Syntax
```bash
xaheen analyze [options]
```

#### Options
```bash
--target <list>      # Analysis targets
--report <format>   # Report format
--suggest          # Include suggestions
--auto-fix        # Apply fixes
```

#### Examples

```bash
# Full analysis
xaheen analyze \
  --target=performance,security,accessibility \
  --report=html \
  --suggest

# Security analysis
xaheen analyze \
  --target=security \
  --auto-fix
```

### `xaheen plugin`

Manage Xaheen plugins.

#### Syntax
```bash
xaheen plugin <command> [options]
```

#### Subcommands
- **install**: Install plugin
- **remove**: Remove plugin
- **list**: List installed plugins
- **create**: Create new plugin

#### Examples

```bash
# Install plugin
xaheen plugin install @xaheen/plugin-analytics

# Create plugin
xaheen plugin create my-plugin
```

## Command Composition

### Chaining Commands

```bash
# Initialize project and add integrations
xaheen init my-app && \
cd my-app && \
xaheen add vipps bankid && \
xaheen component Header --compliance=wcag && \
xaheen dev
```

### Using with Scripts

```json
// package.json
{
  "scripts": {
    "create:component": "xaheen component",
    "create:page": "xaheen page",
    "validate:all": "xaheen validate --compliance=all --fix",
    "ai:optimize": "xaheen ai optimize --targets=all"
  }
}
```

### CI/CD Integration

```yaml
# .github/workflows/xaheen.yml
- name: Validate Compliance
  run: xaheen validate --compliance=all --fail-on-error

- name: Build
  run: xaheen build --mode=production --compliance-report

- name: Deploy
  run: xaheen deploy vercel --env=prod
```

---

> **For Agents**: This command reference provides comprehensive documentation of all Xaheen CLI commands. Use these detailed examples and options to construct appropriate commands based on user requirements. Pay special attention to the real-world examples as they demonstrate practical applications of the commands.