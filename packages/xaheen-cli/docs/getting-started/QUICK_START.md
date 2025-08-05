# Quick Start Guide

Get up and running with Xaheen CLI in under 5 minutes. This guide will walk you through installation, creating your first project, and understanding the core concepts.

## 🚀 Prerequisites

Before you begin, ensure you have:

- **Node.js** 18.0 or higher ([Download](https://nodejs.org/))
- **Git** installed ([Download](https://git-scm.com/))
- A code editor (VS Code recommended)
- Terminal/Command Prompt access

## 📦 Installation

### Using npm (Recommended)

```bash
npm install -g @xala-technologies/xaheen-cli
```

### Using yarn

```bash
yarn global add @xala-technologies/xaheen-cli
```

### Using pnpm

```bash
pnpm add -g @xala-technologies/xaheen-cli
```

### Using bun

```bash
bun add -g @xala-technologies/xaheen-cli
```

### Verify Installation

```bash
xaheen --version
# Should output: Xaheen CLI v3.0.0

xaheen --help
# Shows available commands
```

## 🎯 Create Your First Project

### Interactive Mode (Recommended)

The easiest way to create a new project is using interactive mode:

```bash
xaheen new my-awesome-app
```

You'll be guided through:
1. Choosing a project type (Full-Stack, Frontend, Backend, Mobile)
2. Selecting your tech stack
3. Configuring features (Auth, Database, Styling)
4. Setting up deployment options

### Quick Presets

For faster setup, use predefined presets:

```bash
# Full-stack application with Next.js
xaheen new my-app --preset fullstack

# Frontend-only React app
xaheen new my-app --preset frontend --framework react

# Backend API with Express
xaheen new my-app --preset backend --framework express

# Mobile app with React Native
xaheen new my-app --preset mobile --framework react-native
```

## 🏗️ Project Structure

After creation, your project will have this structure:

```
my-awesome-app/
├── apps/                    # Application packages (monorepo)
│   ├── web/                # Web application
│   ├── api/                # API server (if full-stack)
│   └── mobile/             # Mobile app (if selected)
├── packages/               # Shared packages
│   ├── ui-system/         # Design system components
│   ├── shared/            # Shared utilities
│   └── config/            # Shared configurations
├── xaheen.config.js       # Xaheen configuration
├── turbo.json            # Turbo configuration
├── package.json          # Root package.json
├── .env.example          # Environment variables template
└── README.md             # Project documentation
```

## 🔥 Essential Commands

### Start Development Server

```bash
cd my-awesome-app
npm run dev

# Or start specific apps
npm run dev:web    # Start web app only
npm run dev:api    # Start API only
```

### Generate Components

```bash
# Generate a new React component
xaheen generate component UserCard

# Generate with TypeScript props
xaheen generate component Button --props "onClick:function label:string variant:primary|secondary"

# Generate a page
xaheen generate page dashboard

# Generate an API endpoint
xaheen generate api users --methods get,post,put,delete
```

### AI-Powered Generation

```bash
# Generate with natural language
xaheen ai code "create a responsive navigation bar with mobile menu"

# Refactor existing code
xaheen ai refactor src/components/Header.tsx

# Fix TypeScript errors
xaheen ai fix-types
```

### Build & Deploy

```bash
# Build for production
xaheen build --production

# Run tests
xaheen test

# Deploy to platform
xaheen deploy --platform vercel
```

## 🎨 Working with Bundles

Xaheen includes pre-configured bundles for common use cases:

### SaaS Starter Bundle

Perfect for Software-as-a-Service applications:

```bash
xaheen new my-saas --bundle saas-starter
```

Includes:
- Multi-tenant architecture
- Authentication & authorization
- Subscription management
- Admin dashboard
- User management
- Billing integration

### E-commerce Bundle

For online stores and marketplaces:

```bash
xaheen new my-store --bundle e-commerce
```

Includes:
- Product catalog
- Shopping cart
- Order management
- Payment processing
- Inventory tracking
- Customer accounts

### Analytics Dashboard Bundle

For data visualization applications:

```bash
xaheen new my-analytics --bundle analytics-dashboard
```

Includes:
- Interactive charts
- Real-time data
- Custom metrics
- Report generation
- Data export

## 🔧 Configuration Basics

### Project Configuration

The `xaheen.config.js` file controls project settings:

```javascript
export default {
  name: "my-awesome-app",
  framework: "nextjs",
  
  // Feature flags
  features: {
    ai: true,
    typescript: true,
    testing: true,
  },
  
  // Norwegian compliance
  compliance: {
    norwegian: true,
    gdpr: true,
    accessibility: "WCAG-AA",
  },
  
  // Development settings
  dev: {
    port: 3000,
    https: false,
  },
};
```

### Environment Variables

Create a `.env.local` file for environment-specific settings:

```bash
# Database
DATABASE_URL=postgresql://localhost:5432/myapp

# Authentication
NEXTAUTH_SECRET=your-secret-key
NEXTAUTH_URL=http://localhost:3000

# AI Features
OPENAI_API_KEY=your-openai-key

# Norwegian Services (if enabled)
BANKID_CLIENT_ID=your-client-id
VIPPS_MERCHANT_ID=your-merchant-id
```

## 🏃 Next Steps

### 1. Explore the Generated Code

- Check `apps/web/src` for frontend code
- Review `apps/api/src` for backend code
- Examine `packages/ui-system` for shared components

### 2. Customize Your Stack

```bash
# Add authentication
xaheen service add auth --provider clerk

# Add database
xaheen service add database --provider postgresql --orm prisma

# Add payments
xaheen service add payments --provider stripe
```

### 3. Learn Advanced Features

- Read about [AI Integration](../ai/OVERVIEW.md)
- Explore [Custom Generators](../generators/CUSTOM.md)
- Configure [Norwegian Compliance](../compliance/OVERVIEW.md)

## 💡 Tips for Success

### 1. Use Interactive Mode

When learning, always use interactive mode for better guidance:

```bash
xaheen new          # Interactive project creation
xaheen generate     # Interactive code generation
xaheen ai           # Interactive AI assistance
```

### 2. Enable Debug Mode

For troubleshooting, enable debug logging:

```bash
export XAHEEN_DEBUG=true
xaheen new my-app --verbose
```

### 3. Check Documentation

Access contextual help anytime:

```bash
xaheen help <command>
xaheen <command> --help
```

### 4. Join the Community

- [Discord Community](https://discord.gg/xaheen)
- [GitHub Discussions](https://github.com/xala-technologies/xaheen/discussions)
- [Stack Overflow](https://stackoverflow.com/questions/tagged/xaheen)

## 🎉 Congratulations!

You've successfully:
- ✅ Installed Xaheen CLI
- ✅ Created your first project
- ✅ Learned essential commands
- ✅ Understood the project structure

### What's Next?

1. **Deep Dive**: Read the [First Project Tutorial](./FIRST_PROJECT.md)
2. **Learn Commands**: Explore the [Command Reference](../commands/OVERVIEW.md)
3. **Master AI**: Understand [AI Features](../ai/OVERVIEW.md)
4. **Go Enterprise**: Configure [Norwegian Compliance](../compliance/OVERVIEW.md)

---

**Need Help?** Join our [Discord](https://discord.gg/xaheen) or check [Troubleshooting](../troubleshooting/COMMON.md)