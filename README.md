# 🚀 Xaheen Platform

**Enterprise-grade CLI for scaffolding modern TypeScript applications with Norwegian compliance, AI-powered generation, and 140+ technology integrations.**

[![Version](https://img.shields.io/npm/v/xaheen.svg)](https://www.npmjs.com/package/xaheen)
[![License](https://img.shields.io/npm/l/xaheen.svg)](https://github.com/XaheenEnterprise/xaheen/blob/main/LICENSE)
[![Downloads](https://img.shields.io/npm/dm/xaheen.svg)](https://www.npmjs.com/package/xaheen)

## 🌟 Quick Start

```bash
# Create a new project (recommended)
pnpm create xaheen@latest my-app

# Alternative package managers
npx xaheen@latest my-app
pnpm create xaheen@latest my-app

# Interactive mode
xaheen create
```

## ✨ Key Features

### 🏢 **Enterprise-Ready**
- **Norwegian Government Compliance** - BankID, Altinn, NSM standards
- **GDPR & Privacy by Design** - Built-in consent management
- **WCAG 2.2 AAA Accessibility** - Full accessibility compliance
- **ISO 27001 Security** - Enterprise security standards
- **Multi-language Support** - English, Norwegian Bokmål, French, Arabic

### 🎨 **Xala UI System v5 Integration**
- **Zero Raw HTML** - Only semantic components allowed
- **Design Token System** - Consistent styling across platforms
- **Enhanced 8pt Grid** - Professional spacing standards
- **Component-First Architecture** - Modular and maintainable

### 🛠️ **140+ Technology Integrations**
- **6 Frontend Frameworks** - Next.js, Nuxt, SvelteKit, Solid.js, Vue, React Native
- **10 Authentication Providers** - BankID, Vipps, Better Auth, NextAuth, Clerk, Auth0
- **8 Backend Frameworks** - Hono, Express, Fastify, Elysia, .NET, Laravel, Django
- **5 Databases** - PostgreSQL, MySQL, SQLite, MongoDB, SQL Server
- **19 Integration Categories** - Payments, Analytics, Monitoring, Messaging, and more

### 🤖 **AI-Powered Generation**
- **Intelligent Code Generation** - Context-aware component creation
- **Compliance Validation** - Automatic rule enforcement
- **Template System** - 35+ production-ready templates
- **Multi-Platform Support** - Consistent experience across all platforms

## 🏗️ Architecture

### **Monorepo Structure**
```
xaheen/
├── apps/
│   ├── cli/                    # 🛠️ CLI Tool (Node.js, TypeScript)
│   │   ├── src/                # Core CLI logic and generators
│   │   └── templates/          # 500+ template files
│   └── web/                    # 🌐 Documentation Website (Next.js 15)
├── documentation/              # 📚 Comprehensive documentation
│   ├── agent-knowledge-base/   # AI agent training data
│   ├── ui-system/             # Xala UI System integration
│   └── planned/               # Implementation roadmaps
└── packages/                   # Shared utilities and types
```

### **CLI Capabilities**
- **Project Generation** - Full-stack applications with compliance
- **Component Generation** - Individual components with Xala UI System
- **Page Generation** - Complete pages with layouts and routing
- **Model Generation** - Database models with validation
- **Multi-Mode Support** - Legacy, Token, Xala, and Xaheen modes

## 🇳🇴 Norwegian Compliance

### **Government Integration**
- **BankID** - Digital identity authentication
- **Altinn** - Government services integration
- **Vipps** - Norwegian mobile payments
- **NSM Standards** - National Security Authority compliance
- **Digdir Principles** - Norwegian Digitalisation Agency guidelines

### **Legal Compliance**
- **GDPR Article 25** - Privacy by design implementation
- **Norwegian Personal Data Act** - Local privacy law compliance
- **Universal Design** - Norwegian accessibility requirements
- **Data Localization** - Norwegian data residency support

## 🎯 Technology Stack

### **Core Technologies**
| Category | Options |
|----------|----------|
| **Frontend** | Next.js, Nuxt.js, SvelteKit, Solid.js, Vue.js, React Native |
| **Backend** | Hono, Express, Fastify, Elysia, .NET, Laravel, Django |
| **Database** | PostgreSQL, MySQL, SQLite, MongoDB, SQL Server |
| **ORM** | Drizzle, Prisma, Entity Framework, Mongoose |
| **Auth** | BankID, Vipps, Better Auth, NextAuth, Clerk, Auth0 |

### **Enterprise Integrations**
| Category | Services |
|----------|----------|
| **Payments** | Stripe, Vipps, PayPal, Klarna, Square, Adyen |
| **Analytics** | Vercel Analytics, Google Analytics, PostHog, Mixpanel |
| **Monitoring** | Sentry, Datadog, New Relic, Grafana, Azure App Insights |
| **Messaging** | RabbitMQ, Apache Kafka, Redis Pub/Sub, Azure Service Bus |
| **Email** | Resend, SendGrid, Mailgun, Postmark, Amazon SES |

## 🚀 Getting Started

### **1. Create New Project**
```bash
# Interactive project creation
xaheen create my-enterprise-app

# With specific options
xaheen create my-app \
  --ui=xala \
  --compliance=norwegian \
  --auth=bankid \
  --db=postgresql \
  --payments=vipps
```

### **2. Add Components**
```bash
# Generate compliant component
xaheen component UserProfile --ui=xala --compliance=norwegian

# Generate page with layout
xaheen page dashboard --layout=admin --compliance=gdpr

# Generate data model
xaheen model User --db=postgresql --validation=zod
```

### **3. Development Workflow**
```bash
# Install dependencies
pnpm install

# Start development
pnpm dev

# Run compliance checks
pnpm check:compliance

# Build for production
pnpm build
```

## 📚 Documentation

- **🌐 Website**: [xaheen.dev](https://xaheen.dev)
- **📖 CLI Guide**: [apps/cli/README.md](apps/cli/README.md)
- **🏛️ Norwegian Compliance**: [documentation/compliance/](documentation/compliance/)
- **🎨 UI System**: [documentation/ui-system/](documentation/ui-system/)
- **🤖 AI Integration**: [documentation/ai/](documentation/ai/)

## 🛠️ Development

### **Prerequisites**
- Node.js 20+
- Bun 1.2+ (recommended)
- Git

### **Local Development**
```bash
# Clone repository
git clone https://github.com/XaheenEnterprise/xaheen.git
cd xaheen

# Install dependencies
pnpm install

# Start CLI development
pnpm dev:cli

# Start web development
pnpm dev:web

# Run tests
pnpm test

# Build all packages
pnpm build
```

### **Project Scripts**
```bash
pnpm dev:cli          # CLI development with hot reload
pnpm dev:web          # Website development server
pnpm build:cli        # Build CLI for production
pnpm build:web        # Build website for deployment
bun check            # Type checking across all packages
bun format           # Code formatting with Biome
bun publish-packages # Publish CLI to npm
```

## 🤝 Contributing

We welcome contributions! Please see our [Contributing Guide](CONTRIBUTING.md) for details.

### **Development Standards**
- **TypeScript Strict Mode** - Explicit return types, no 'any'
- **SOLID Principles** - Component composition and single responsibility
- **Xala UI System** - Only semantic components, no raw HTML
- **Mandatory Localization** - All text must use t() function
- **Compliance First** - GDPR, WCAG AAA, Norwegian standards

## 📄 License

MIT License - see [LICENSE](LICENSE) for details.

## 🏢 Enterprise Support

For enterprise support, Norwegian compliance consulting, or custom integrations:
- **Email**: enterprise@xaheen-ai.dev
- **Website**: [xaheen.dev/enterprise](https://xaheen.dev/enterprise)
- **Documentation**: [Norwegian Compliance Guide](documentation/compliance/norwegian.md)
