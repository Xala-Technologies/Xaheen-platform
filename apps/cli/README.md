# Create Xaheen CLI

A comprehensive CLI tool for scaffolding modern, full-stack TypeScript applications with enterprise-grade features, Norwegian compliance, and 140+ technology integrations.

## Quick Start

Run without installing globally:

```bash
# Using npm
npx xaheen@latest

# Using bun (recommended)
bun create xaheen@latest

# Using pnpm
pnpm create xaheen@latest
```

Follow the interactive prompts to configure your project, or use the `--yes` flag for sensible defaults.

## 🚀 Complete Tech Stack Support

### Core Technologies

| Category | Options |
|----------|----------|
| **Frontend Frameworks** | React (TanStack Router, React Router, TanStack Start), Next.js, Angular, Blazor, Nuxt (Vue), SvelteKit, SolidJS, React Native (NativeWind, Unistyles) |
| **Backend Frameworks** | Hono, Express, Fastify, Elysia, .NET, Laravel, Django, Next.js API, Convex |
| **Databases** | SQLite, PostgreSQL, MySQL, MongoDB, SQL Server |
| **ORMs** | Drizzle, Prisma, Mongoose |
| **API Layers** | tRPC, oRPC |
| **Runtimes** | Bun, Node.js, Cloudflare Workers |

### 🛠️ Development & Testing

| Category | Options |
|----------|----------|
| **Testing Frameworks** | Vitest, Jest, Playwright, Cypress, Storybook, Chromatic, MSW |
| **DevOps & CI/CD** | GitHub Actions, GitLab CI, Jenkins, CircleCI, Travis CI |
| **Security Tools** | Helmet, Rate Limiting, CORS, CSP, OAuth Security |
| **Code Quality** | Biome, ESLint, Prettier, Husky, Lint-staged |

### 📧 Communication & Notifications

| Category | Options |
|----------|----------|
| **Email Services** | Resend, SendGrid, Mailgun, Nodemailer, Amazon SES, Postmark, Brevo |
| **Messaging Systems** | RabbitMQ, Redis Pub/Sub, Apache Kafka, AWS SQS, Google Pub/Sub |
| **Real-time Communication** | WebSockets, Server-Sent Events, Socket.io |

### 💳 E-commerce & Payments

| Category | Options |
|----------|----------|
| **Payment Processors** | Stripe, Paddle, LemonSqueezy, PayPal, Square |
| **Subscription Management** | Stripe Billing, Chargebee, Recurly, Paddle Billing, Zuora, RevenueCat |
| **Licensing Systems** | License Key, Software Licensing, Cryptlex, Keygen, Gumroad |

### 📊 Analytics & Monitoring

| Category | Options |
|----------|----------|
| **Analytics Platforms** | Vercel Analytics, Google Analytics, PostHog, Mixpanel, Amplitude |
| **Monitoring Services** | Sentry, DataDog, New Relic, Bugsnag, Rollbar, Honeybadger, Logflare |
| **Performance Tracking** | Web Vitals, Lighthouse CI, Bundle Analyzer |

### 🗄️ Data & Content Management

| Category | Options |
|----------|----------|
| **Document Storage** | UploadThing, Cloudinary, AWS S3, Supabase Storage, Firebase Storage |
| **Content Management** | Strapi, Contentful, Sanity, Ghost, Directus, Payload, Keystatic |
| **Search Services** | Algolia, Elasticsearch, MeiliSearch, Typesense, Solr |
| **Caching Solutions** | Redis, Memcached, Upstash, Cloudflare KV, Vercel KV |

### 🌍 Internationalization & Compliance

| Category | Options |
|----------|----------|
| **i18n Libraries** | Next-intl, React-i18next, Vue-i18n, Svelte-i18n, Lingui |
| **Compliance Standards** | GDPR, Norwegian Government (NSM + GDPR + WCAG), WCAG 2.2 AAA |
| **Supported Languages** | English, Norwegian Bokmål, French, Arabic |

### 🏢 Enterprise Features

| Category | Options |
|----------|----------|
| **Admin Interfaces** | React Admin, AdminJS, Refine, Retool, Forest Admin |
| **Access Control** | RBAC (Casbin, Access Control, Permit, AuthZ, OSO) |
| **Multi-tenancy** | Tenant per DB, Shared DB, Hybrid, Schema per Tenant, Row-level Security |
| **Background Jobs** | BullMQ, Agenda, Bee Queue, Kue, Resque |

### 🎨 UI & Design Systems

| Category | Options |
|----------|----------|
| **Design Systems** | Xala UI System v5 (Norwegian compliance), Tailwind CSS, shadcn/ui |
| **Component Libraries** | Headless UI, Radix UI, Mantine, Chakra UI |
| **Styling Solutions** | Tailwind CSS, Styled Components, Emotion, CSS Modules |

## 🎨 Norwegian Compliance & Authentication

### 🇳🇴 Norwegian Government Integration

| Service | Description |
|---------|-------------|
| **BankID** | Norwegian digital identity with highest security level |
| **Vipps Login** | Mobile authentication with 4+ million Norwegian users |
| **Altinn** | Government services and tax data integration |

### 🔐 Modern Authentication Options

| Provider | Features |
|----------|----------|
| **Better Auth** | Modern auth with 2FA, social providers, TypeScript-first |
| **NextAuth.js** | 50+ providers, CSRF protection, Next.js optimized |
| **Clerk** | Pre-built UI, user management, organizations |
| **Supabase Auth** | Row Level Security, real-time, PostgreSQL integration |
| **Firebase Auth** | Google ecosystem, phone verification, anonymous auth |
| **Auth0** | Enterprise SSO, SAML, multi-factor authentication |

## 🛠️ Usage

### Interactive Mode (Recommended)

```bash
npx xaheen@latest
```

This starts an interactive prompt where you can select from 140+ technology options across 36 categories.

### Command Line Options

```bash
npx xaheen@latest [project-name] [options]
```

#### Core Options

- `--yes, -y` - Use sensible defaults for all prompts
- `--no-install` - Skip package installation
- `--no-git` - Skip git initialization
- `--package-manager <manager>` - Package manager (npm, pnpm, bun)

#### Technology Stack Options

```bash
# Core Technologies
--frontend <framework>          # react, nextjs, angular, blazor, nuxt, svelte, solid
--backend <framework>           # hono, express, fastify, dotnet, laravel, django
--database <database>           # sqlite, postgresql, mysql, mongodb, mssql
--orm <orm>                     # drizzle, prisma, mongoose
--api <api>                     # trpc, orpc
--runtime <runtime>             # bun, node, cloudflare-workers

# Authentication & Security
--auth <provider>               # better-auth, nextauth, clerk, supabase, firebase, auth0, bankid, vipps
--security <tools>              # helmet, rate-limiting, cors, csp, oauth-security

# Communication & Notifications
--notifications <service>       # resend, sendgrid, mailgun, nodemailer, ses, postmark
--messaging <system>            # rabbitmq, redis-pubsub, kafka, sqs, google-pubsub

# E-commerce & Business
--payments <processor>          # stripe, paddle, lemonsqueezy, paypal, square
--subscriptions <service>       # stripe-billing, chargebee, recurly, paddle-billing
--licensing <system>            # license-key, software-licensing, cryptlex, keygen

# Data & Content
--documents <storage>           # uploadthing, cloudinary, aws-s3, supabase-storage
--cms <system>                  # strapi, contentful, sanity, ghost, directus
--search <service>              # algolia, elasticsearch, meilisearch, typesense
--caching <solution>            # redis, memcached, upstash, cloudflare-kv

# Analytics & Monitoring
--analytics <platform>          # vercel-analytics, google-analytics, posthog, mixpanel
--monitoring <service>          # sentry, datadog, newrelic, bugsnag, rollbar

# Development & Testing
--testing <framework>           # vitest, jest, playwright, cypress, storybook
--devops <ci>                   # github-actions, gitlab-ci, jenkins, circleci

# Enterprise Features
--saas-admin <interface>        # react-admin, adminjs, refine, retool
--rbac <system>                 # casbin, access-control, permit, authz
--multi-tenancy <strategy>      # tenant-per-db, shared-db, hybrid
--background-jobs <queue>       # bullmq, agenda, bee-queue, kue

# Internationalization & Compliance
--i18n <library>                # next-intl, react-i18next, vue-i18n, svelte-i18n
--compliance <standard>         # gdpr, norwegian, wcag-aaa, iso27001
--languages <locales>           # en,nb,fr,ar (comma-separated)

# UI & Design
--ui <system>                   # xala, tailwind, shadcn, headless-ui
--styling <solution>            # tailwind, styled-components, emotion, css-modules
```

#### Compliance & Accessibility Options

```bash
# Compliance Standards (can be combined)
--compliance gdpr               # GDPR data protection compliance
--compliance norwegian          # Norwegian government standards (NSM + GDPR + WCAG)
--compliance wcag-aaa           # WCAG 2.2 AAA accessibility
--compliance iso27001           # ISO 27001 security management

# Multi-language Support
--languages en,nb,fr,ar         # English, Norwegian Bokmål, French, Arabic
```

### Examples

```bash
# Norwegian Government Application
npx xaheen@latest gov-app \
  --frontend nextjs \
  --auth bankid \
  --compliance norwegian \
  --languages nb,en \
  --ui xala

# Enterprise SaaS Platform
npx xaheen@latest saas-platform \
  --frontend nextjs \
  --backend hono \
  --database postgresql \
  --orm drizzle \
  --auth clerk \
  --payments stripe \
  --subscriptions stripe-billing \
  --saas-admin react-admin \
  --rbac casbin \
  --multi-tenancy tenant-per-db \
  --compliance gdpr,wcag-aaa

# Modern E-commerce Store
npx xaheen@latest store \
  --frontend nextjs \
  --backend hono \
  --database postgresql \
  --payments stripe \
  --documents cloudinary \
  --analytics vercel-analytics \
  --monitoring sentry \
  --i18n next-intl \
  --languages en,nb,fr

# Full-stack Development Platform
npx xaheen@latest dev-platform \
  --frontend react \
  --backend express \
  --database mongodb \
  --orm mongoose \
  --api trpc \
  --auth nextauth \
  --testing vitest,playwright \
  --devops github-actions \
  --monitoring sentry

# Quick Start with Defaults
npx xaheen@latest my-app --yes

# Norwegian Compliance Project
npx xaheen@latest compliance-app \
  --compliance norwegian,gdpr,wcag-aaa \
  --auth bankid \
  --languages nb,en \
  --ui xala
```

## Compatibility Notes
├── apps/
│   ├── web/                    # Frontend application
│   │   ├── src/
│   │   │   ├── components/         # UI components (Xala UI System)
│   │   │   ├── pages/              # Application pages
│   │   │   ├── hooks/              # Custom React hooks
│   │   │   ├── utils/              # Utility functions
│   │   │   └── styles/             # Global styles
│   │   ├── messages/               # i18n translations
│   │   │   ├── en.json             # English
│   │   │   ├── nb.json             # Norwegian Bokmål
│   │   │   ├── fr.json             # French
│   │   │   └── ar.json             # Arabic
│   │   └── public/                 # Static assets
│   └── api/                     # Backend API (if selected)
│       ├── src/
│       │   ├── routes/             # API routes
│       │   ├── middleware/         # Custom middleware
│       │   ├── services/           # Business logic
│       │   └── utils/              # Server utilities
│       └── integrations/           # Third-party integrations
│           ├── bankid/             # BankID service
│           ├── vipps/              # Vipps integration
│           └── altinn/             # Altinn service
├── packages/
│   ├── ui/                      # Shared UI components
│   ├── database/                # Database schema and utilities
│   ├── auth/                    # Authentication configuration
│   ├── compliance/              # Compliance utilities
│   └── config/                  # Shared configurations
├── docs/                        # Documentation (if selected)
├── config/                      # Root configuration files
│   ├── ui-system.config.ts      # Xala UI System configuration
│   ├── accessibility.config.ts  # WCAG compliance configuration
│   ├── localization.config.ts   # i18n configuration
│   └── compliance.config.ts     # Compliance rules
├── package.json
├── turbo.json                   # Turborepo configuration
├── tsconfig.json               # TypeScript configuration
└── README.md
```

## 🚀 Development

After creating your project:

```bash
cd my-app

# Install dependencies (if not done automatically)
npm install

# Start development servers
npm run dev

# Build for production
npm run build

# Run tests
npm run test

# Run compliance checks
npm run compliance:check

# Run accessibility tests
npm run a11y:test

# Generate documentation
npm run docs:build
```

### Available Scripts

```bash
# Development
npm run dev                     # Start development servers
npm run dev:web                 # Start frontend only
npm run dev:api                 # Start backend only

# Building
npm run build                   # Build all applications
npm run build:web               # Build frontend
npm run build:api               # Build backend

# Testing
npm run test                    # Run all tests
npm run test:unit               # Unit tests
npm run test:integration        # Integration tests
npm run test:e2e                # End-to-end tests

# Code Quality
npm run lint                    # Lint code
npm run format                  # Format code
npm run type-check              # TypeScript type checking

# Compliance & Accessibility
npm run compliance:check        # Check compliance rules
npm run a11y:test               # Accessibility testing
npm run security:audit          # Security audit

# Database
npm run db:generate             # Generate database schema
npm run db:migrate              # Run database migrations
npm run db:seed                 # Seed database with test data

# Deployment
npm run deploy                  # Deploy to production
npm run deploy:preview          # Deploy preview environment
```

## 🌐 Multi-Platform Support

Xaheen supports deployment across multiple platforms:

- **Vercel** - Optimized for Next.js with Norwegian compliance headers
- **Netlify** - GDPR-compliant with Norwegian redirects
- **Docker** - Multi-stage builds with security hardening
- **AWS** - Complete infrastructure with compliance
- **Azure** - Microsoft cloud with Norwegian data residency
- **Google Cloud** - Global deployment with localization

## 📈 Enterprise Features

### Norwegian Government Compliance
- **NSM Guidelines** - Norwegian National Security Authority standards
- **Digdir Principles** - Norwegian Digitalisation Agency requirements
- **GDPR Compliance** - European data protection regulation
- **WCAG 2.2 AAA** - Web accessibility standards

### Security & Authentication
- **BankID Integration** - Norwegian digital identity
- **Vipps Authentication** - Mobile payment and login
- **Multi-factor Authentication** - Enhanced security
- **Role-based Access Control** - Enterprise permissions

### Internationalization
- **Multi-language Support** - English, Norwegian, French, Arabic
- **RTL Support** - Right-to-left languages (Arabic)
- **Cultural Adaptation** - Local formatting and conventions
- **Government Integration** - Altinn and public services

## 🤝 Contributing

We welcome contributions! Please see our [Contributing Guide](CONTRIBUTING.md) for details.

### Development Setup

```bash
# Clone the repository
git clone https://github.com/xala-technologies/xaheen.git
cd xaheen

# Install dependencies
bun install

# Start development
bun run dev

# Run tests
bun run test
```

## 📜 Documentation

- [Getting Started Guide](docs/getting-started.md)
- [Technology Stack Guide](docs/tech-stack.md)
- [Norwegian Compliance Guide](docs/norwegian-compliance.md)
- [Deployment Guide](docs/deployment.md)
- [API Reference](docs/api-reference.md)
- [Contributing Guide](CONTRIBUTING.md)

## 📝 License

MIT License - see [LICENSE](LICENSE) for details.

---

**Built with ❤️ by [Xala Technologies](https://xala.no) - Empowering Norwegian digital transformation**
