# Xaheen CLI Web Interface - Detailed Wireframes

## 📋 Analysis of Current Web App Structure

### Current Architecture Analysis:
```
apps/web/src/
├── app/                           # Next.js App Router
│   ├── (home)/                   # Main homepage group
│   │   ├── _components/          # Private components for home
│   │   │   ├── stack-builder/    # Core stack configuration UI
│   │   │   ├── navbar.tsx        # Navigation component
│   │   │   └── footer.tsx        # Footer component
│   │   ├── analytics/            # Analytics dashboard page
│   │   ├── new/                  # Project creation page
│   │   └── showcase/             # Project showcase
│   └── docs/                     # Documentation pages
├── components/
│   ├── agent-dashboard/          # AI agent interface components
│   ├── homepage/                 # Homepage-specific components
│   ├── layout/                   # Layout components
│   └── ui/                       # Reusable UI components
├── lib/
│   ├── services/                 # Business logic services
│   ├── tech-stack/              # Technology stack configurations
│   └── types/                   # TypeScript type definitions
└── data/                        # Static configuration data
```

### Key Components Currently Implemented:
- ✅ **NavigationHeader**: CVA-compliant navbar with theme switching
- ✅ **AgentDashboard**: AI agent integration interface
- ✅ **StackBuilder**: Multi-technology stack configuration
- ✅ **CommandDisplay**: Generated CLI commands visualization
- ✅ **ProjectIdeaSection**: Natural language project input

---

## 🎨 Comprehensive Wireframe Specifications

### 1. Navigation Header (`xala-mcp get_component('navbar-primary')`)

```
┌─────────────────────────────────────────────────────────────────────────┐
│ [Xaheen Logo] [Project Wizard] [Docs] [Showcase]  [🔍 Search] [🌙] [👤] │
└─────────────────────────────────────────────────────────────────────────┘
```

**Component Structure:**
```typescript
// xala-mcp get_component('navbar-primary')
<WebNavbar variant="primary" size="lg" sticky>
  <Container maxWidth="7xl">
    <Stack direction="row" spacing="md" align="center" justify="between">
      <!-- Left Side -->
      <Stack direction="row" spacing="lg" align="center">
        <Brand logo="/logo.svg" href="/" />
        <Navigation items={navItems} variant="horizontal" />
      </Stack>
      
      <!-- Right Side -->
      <Stack direction="row" spacing="md" align="center">
        <GlobalSearch placeholder="Search projects, templates..." />
        <ThemeSwitcher />
        <NotificationBell count={3} />
        <UserMenu avatar="/avatar.jpg" />
      </Stack>
    </Stack>
  </Container>
</WebNavbar>
```

**Xala-MCP Integration:**
```javascript
// Component retrieval
const navbar = await xala-mcp get_component('navbar-primary');
const searchComponent = await xala-mcp get_component('global-search');
const themeToggle = await xala-mcp get_component('theme-switcher');

// Navigation items
const navItems = await xala-mcp list_assets('navigation');
```

---

### 2. Main Landing Page Layout (`xala-mcp get_layout('homepage-hero')`)

```
┌─────────────────────────────────────────────────────────────────────────┐
│                              NAVBAR                                     │
├─────────────────────────────────────────────────────────────────────────┤
│                         HERO SECTION                                   │
│  ┌─────────────────────────────────────────────────────────────────┐   │
│  │              🚀 Xaheen CLI v3.0.0                               │   │
│  │        AI-Native Full-Stack Development Toolkit                 │   │
│  │                                                                 │   │
│  │  [Get Started] [Watch Demo] [View Docs] [GitHub ⭐]           │   │
│  └─────────────────────────────────────────────────────────────────┘   │
├─────────────────────────────────────────────────────────────────────────┤
│                    PROJECT CREATION WIZARD                             │
│  ┌─────────────────────────────────────────────────────────────────┐   │
│  │ 📝 Describe your project in natural language:                  │   │
│  │ ┌─────────────────────────────────────────────────────────────┐ │   │
│  │ │ "Create a SaaS dashboard with user auth, payments, and     │ │   │
│  │ │  real-time notifications using React and Node.js"          │ │   │  
│  │ └─────────────────────────────────────────────────────────────┘ │   │
│  │                                                                 │   │
│  │                    [✨ Generate Project]                        │   │
│  │                                                                 │   │
│  │                          OR                                     │   │
│  │                                                                 │   │
│  │               [⚙️ Advanced Configuration]                        │   │
│  └─────────────────────────────────────────────────────────────────┘   │
├─────────────────────────────────────────────────────────────────────────┤
│                       QUICK START TEMPLATES                            │
│  ┌─────────┐ ┌─────────┐ ┌─────────┐ ┌─────────┐ ┌─────────┐         │
│  │ [📱]    │ │ [🌐]    │ │ [⚡]    │ │ [🛒]    │ │ [📊]    │         │
│  │ Mobile  │ │ Web App │ │ API     │ │ E-comm  │ │ Dashboard│         │
│  │ App     │ │         │ │ Service │ │ Store   │ │          │         │
│  └─────────┘ └─────────┘ └─────────┘ └─────────┘ └─────────┘         │
└─────────────────────────────────────────────────────────────────────────┘
```

**Component Structure:**
```typescript
// xala-mcp get_layout('homepage-hero')
<Container maxWidth="7xl" spacing="xl">
  <!-- Hero Section -->
  <HeroSection variant="primary" align="center">
    <Typography variant="h1" size="4xl">
      Xaheen CLI v3.0.0
    </Typography>
    <Typography variant="subtitle" size="xl" color="muted">
      AI-Native Full-Stack Development Toolkit
    </Typography>
    <ButtonGroup spacing="md">
      <Button variant="primary" size="lg">Get Started</Button>
      <Button variant="outline" size="lg">Watch Demo</Button>
      <Button variant="ghost" size="lg">View Docs</Button>
    </ButtonGroup>
  </HeroSection>

  <!-- Project Creation Wizard -->
  <Card variant="elevated" padding="xl">
    <ProjectWizard>
      <NaturalLanguageInput 
        placeholder="Describe your project in natural language..."
        onGenerate={handleAIGeneration}
      />
      <Divider text="OR" />
      <Button variant="outline" fullWidth>
        Advanced Configuration
      </Button>
    </ProjectWizard>
  </Card>

  <!-- Quick Start Templates -->
  <TemplateGrid columns={5} spacing="lg">
    {templates.map(template => (
      <TemplateCard key={template.id} {...template} />
    ))}
  </TemplateGrid>
</Container>
```

---

### 3. Project Creation Wizard (`xala-mcp get_block('wizard-stepper')`)

```
┌─────────────────────────────────────────────────────────────────────────┐
│                        PROJECT CREATION WIZARD                         │
├─────────────────────────────────────────────────────────────────────────┤
│  Step 1 of 5: Project Setup                          [❮ Back] [Next ❯] │
│                                                                         │
│  ●━━━━━○━━━━━○━━━━━○━━━━━○   [20% Complete]                              │
│  Setup  Stack   Features  Infra   Review                               │
│                                                                         │
│  ┌─────────────────────────────────────────────────────────────────┐   │
│  │ 📝 Project Name: ┌─────────────────────────────────────────┐    │   │
│  │                  │ my-awesome-project                      │    │   │
│  │                  └─────────────────────────────────────────┘    │   │
│  │                                                                 │   │
│  │ 📁 Project Type:                                                │   │
│  │  ┌─────────┐ ┌─────────┐ ┌─────────┐ ┌─────────┐             │   │
│  │  │ [✓]     │ │ [ ]     │ │ [ ]     │ │ [ ]     │             │   │
│  │  │ Web App │ │ Mobile  │ │ Desktop │ │ API     │             │   │
│  │  └─────────┘ └─────────┘ └─────────┘ └─────────┘             │   │
│  │                                                                 │   │
│  │ 📖 Description (Optional):                                      │   │
│  │  ┌─────────────────────────────────────────────────────────┐   │   │
│  │  │ A modern web application with user authentication,      │   │   │
│  │  │ real-time features, and payment processing             │   │   │
│  │  └─────────────────────────────────────────────────────────┘   │   │
│  └─────────────────────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────────────────────┘
```

**Step-by-Step Wizard Flow:**

#### Step 1: Project Setup
```typescript
// xala-mcp get_block('wizard-stepper')
<WizardStepper currentStep={1} totalSteps={5}>
  <WizardStep title="Project Setup">
    <FormField label="Project Name" required>
      <TextInput 
        placeholder="my-awesome-project"
        validation="project-name"
      />
    </FormField>
    
    <FormField label="Project Type">
      <RadioGroup options={projectTypes} columns={4} />
    </FormField>
    
    <FormField label="Description">
      <TextArea 
        placeholder="Describe your project..."
        rows={3}
      />
    </FormField>
  </WizardStep>
</WizardStepper>
```

#### Step 2: Technology Stack
```
┌─────────────────────────────────────────────────────────────────────────┐
│  Step 2 of 5: Technology Stack                       [❮ Back] [Next ❯] │
│                                                                         │
│  ●━━━━━●━━━━━○━━━━━○━━━━━○   [40% Complete]                              │
│                                                                         │
│  Frontend Framework:                                                    │
│  ┌─────────┐ ┌─────────┐ ┌─────────┐ ┌─────────┐ ┌─────────┐         │
│  │ [✓]     │ │ [ ]     │ │ [ ]     │ │ [ ]     │ │ [ ]     │         │
│  │ React   │ │ Vue.js  │ │ Angular │ │ Svelte  │ │ Next.js │         │
│  │ [⚛️]    │ │ [🟢]    │ │ [🔴]    │ │ [🟠]    │ │ [⚫]    │         │
│  └─────────┘ └─────────┘ └─────────┘ └─────────┘ └─────────┘         │
│                                                                         │
│  Backend Framework:                                                     │
│  ┌─────────┐ ┌─────────┐ ┌─────────┐ ┌─────────┐                     │
│  │ [✓]     │ │ [ ]     │ │ [ ]     │ │ [ ]     │                     │
│  │ Node.js │ │ Python  │ │ Go      │ │ .NET    │                     │
│  │ [🟢]    │ │ [🐍]    │ │ [🔵]    │ │ [🟣]    │                     │
│  └─────────┘ └─────────┘ └─────────┘ └─────────┘                     │
│                                                                         │
│  Database:                                                              │
│  ┌─────────┐ ┌─────────┐ ┌─────────┐ ┌─────────┐                     │
│  │ [✓]     │ │ [ ]     │ │ [ ]     │ │ [ ]     │                     │
│  │ PostgreSQL│ │ MySQL   │ │ MongoDB │ │ SQLite  │                     │
│  │ [🐘]    │ │ [🐬]    │ │ [🍃]    │ │ [📦]    │                     │
│  └─────────┘ └─────────┘ └─────────┘ └─────────┘                     │
│                                                                         │
│  ⚠️ Compatibility Check: ✅ React + Node.js + PostgreSQL              │
│     Estimated setup time: ~5 minutes                                   │
└─────────────────────────────────────────────────────────────────────────┘
```

#### Step 3: Feature Configuration
```
┌─────────────────────────────────────────────────────────────────────────┐
│  Step 3 of 5: Features & Integrations                [❮ Back] [Next ❯] │
│                                                                         │
│  ●━━━━━●━━━━━●━━━━━○━━━━━○   [60% Complete]                              │
│                                                                         │
│  Authentication & Security:                                             │
│  ┌─────────┐ ┌─────────┐ ┌─────────┐ ┌─────────┐                     │
│  │ [✓]     │ │ [ ]     │ │ [ ]     │ │ [ ]     │                     │
│  │ NextAuth│ │ Auth0   │ │ Firebase│ │ Custom  │                     │
│  │ [🔐]    │ │ [🛡️]    │ │ [🔥]    │ │ [⚙️]    │                     │
│  └─────────┘ └─────────┘ └─────────┘ └─────────┘                     │
│                                                                         │
│  Payments & Billing:                                                   │
│  ┌─────────┐ ┌─────────┐ ┌─────────┐ ┌─────────┐                     │
│  │ [✓]     │ │ [ ]     │ │ [ ]     │ │ [ ]     │                     │
│  │ Stripe  │ │ PayPal  │ │ Paddle  │ │ None    │                     │
│  │ [💳]    │ │ [🟦]    │ │ [🏓]    │ │ [❌]    │                     │
│  └─────────┘ └─────────┘ └─────────┘ └─────────┘                     │
│                                                                         │
│  Monitoring & Analytics:                                                │
│  ┌─────────┐ ┌─────────┐ ┌─────────┐ ┌─────────┐                     │
│  │ [✓]     │ │ [✓]     │ │ [ ]     │ │ [ ]     │                     │
│  │ Sentry  │ │ Vercel  │ │ PostHog │ │ Custom  │                     │
│  │ [🚨]    │ │ [📊]    │ │ [📈]    │ │ [⚙️]    │                     │
│  └─────────┘ └─────────┘ └─────────┘ └─────────┘                     │
│                                                                         │
│  Real-time Features:                                                    │
│  ☐ WebSocket Support    ☐ Server-Sent Events    ☐ Push Notifications  │
│  ☐ Real-time Database   ☐ Live Chat            ☐ Collaborative Editing│
└─────────────────────────────────────────────────────────────────────────┘
```

#### Step 4: Infrastructure & Deployment
```
┌─────────────────────────────────────────────────────────────────────────┐
│  Step 4 of 5: Infrastructure Setup                   [❮ Back] [Next ❯] │
│                                                                         │
│  ●━━━━━●━━━━━●━━━━━●━━━━━○   [80% Complete]                              │
│                                                                         │
│  Deployment Platform:                                                   │
│  ┌─────────┐ ┌─────────┐ ┌─────────┐ ┌─────────┐                     │
│  │ [✓]     │ │ [ ]     │ │ [ ]     │ │ [ ]     │                     │
│  │ Vercel  │ │ Netlify │ │ AWS     │ │ Railway │                     │
│  │ [▲]     │ │ [🌐]    │ │ [☁️]    │ │ [🚂]    │                     │
│  └─────────┘ └─────────┘ └─────────┘ └─────────┘                     │
│                                                                         │
│  Container Configuration:                                               │
│  ☑️ Docker Support           ☑️ Docker Compose                         │
│  ☐ Kubernetes Manifests     ☐ Helm Charts                             │
│                                                                         │
│  CI/CD Pipeline:                                                        │
│  ┌─────────┐ ┌─────────┐ ┌─────────┐ ┌─────────┐                     │
│  │ [✓]     │ │ [ ]     │ │ [ ]     │ │ [ ]     │                     │
│  │ GitHub  │ │ GitLab  │ │ Azure   │ │ Custom  │                     │
│  │ Actions │ │ CI      │ │ DevOps  │ │ Jenkins │                     │
│  │ [🐙]    │ │ [🦊]    │ │ [🔵]    │ │ [⚙️]    │                     │
│  └─────────┘ └─────────┘ └─────────┘ └─────────┘                     │
│                                                                         │
│  Infrastructure as Code:                                                │
│  ☑️ Terraform Configuration  ☐ Pulumi Setup    ☐ CDK Templates        │
│                                                                         │
│  Environment Management:                                                │
│  ☑️ Development    ☑️ Staging    ☑️ Production    ☐ Testing            │
└─────────────────────────────────────────────────────────────────────────┘
```

#### Step 5: Review & Generation
```
┌─────────────────────────────────────────────────────────────────────────┐
│  Step 5 of 5: Review & Generate                      [❮ Back] [Generate]│
│                                                                         │
│  ●━━━━━●━━━━━●━━━━━●━━━━━●   [100% Complete]                             │
│                                                                         │
│  📋 PROJECT SUMMARY                                                     │
│  ┌─────────────────────────────────────────────────────────────────┐   │
│  │ Project Name: my-awesome-project                                │   │
│  │ Type: Web Application                                           │   │
│  │                                                                 │   │
│  │ 🔧 Technology Stack:                                            │   │
│  │   Frontend: React with TypeScript                              │   │
│  │   Backend: Node.js with Express                                │   │
│  │   Database: PostgreSQL with Prisma ORM                        │   │
│  │                                                                 │   │
│  │ 🎯 Features:                                                    │   │  
│  │   ✅ NextAuth Authentication                                    │   │
│  │   ✅ Stripe Payments                                            │   │
│  │   ✅ Sentry Error Monitoring                                    │   │
│  │   ✅ Vercel Analytics                                           │   │
│  │                                                                 │   │
│  │ 🚀 Infrastructure:                                              │   │
│  │   ✅ Vercel Deployment                                          │   │
│  │   ✅ Docker Support                                             │   │
│  │   ✅ GitHub Actions CI/CD                                       │   │
│  │   ✅ Terraform IaC                                              │   │
│  │                                                                 │   │
│  │ ⏱️ Estimated Setup Time: 5-8 minutes                           │   │
│  │ 📦 Generated Files: ~47 files                                   │   │
│  └─────────────────────────────────────────────────────────────────┘   │
│                                                                         │
│  [📋 Save Configuration] [🚀 Generate Project] [📤 Export Config]      │
└─────────────────────────────────────────────────────────────────────────┘
```

---

### 4. AI Assistant Panel (`xala-mcp get_component('ai-chat-interface')`)

```
┌─────────────────────────────────────────────────────────────────────────┐
│                          🤖 AI ASSISTANT                               │
├─────────────────────────────────────────────────────────────────────────┤
│  💬 Chat History                                    [🗑️] [⚙️] [❌]    │
│                                                                         │
│  ┌─────────────────────────────────────────────────────────────────┐   │
│  │ 👤 You: "Add user authentication to my React app"              │   │
│  │                                                                 │   │
│  │ 🤖 Assistant: I'll help you add user authentication using      │   │
│  │    NextAuth.js. Here's what I'll generate:                     │   │
│  │                                                                 │   │
│  │    📁 Files to be created:                                      │   │
│  │    ├── pages/api/auth/[...nextauth].ts                         │   │
│  │    ├── components/LoginButton.tsx                              │   │
│  │    ├── components/UserProfile.tsx                              │   │
│  │    └── lib/auth.ts                                             │   │
│  │                                                                 │   │
│  │    📝 Files to be modified:                                     │   │
│  │    ├── package.json (add next-auth dependency)                 │   │
│  │    └── pages/_app.tsx (wrap with SessionProvider)              │   │
│  │                                                                 │   │
│  │    [👁️ Preview Changes] [✅ Apply Changes] [❌ Cancel]          │   │
│  └─────────────────────────────────────────────────────────────────┘   │
│                                                                         │
│  ┌─────────────────────────────────────────────────────────────────┐   │
│  │ 💬 Type your request...                                         │   │
│  │ "Add real-time notifications using WebSockets"                 │   │
│  └─────────────────────────────────────────────────────────────────┘   │
│                                                   [📎] [🎤] [🚀]      │
└─────────────────────────────────────────────────────────────────────────┘
```

**AI Assistant Features:**
```typescript
// xala-mcp get_component('ai-chat-interface')
<AIChatInterface>
  <ChatHistory messages={messages} />
  <CodePreviewPanel 
    changes={pendingChanges}
    onApprove={handleApproveChanges}
    onReject={handleRejectChanges}
  />
  <ChatInput 
    placeholder="Describe what you want to add or modify..."
    onSubmit={handleAIRequest}
    features={['file-upload', 'voice-input', 'suggestions']}
  />
</AIChatInterface>
```

---

### 5. Code Diff Preview (`xala-mcp get_component('code-diff-viewer')`)

```
┌─────────────────────────────────────────────────────────────────────────┐
│                        📝 CODE PREVIEW & DIFF                          │
├─────────────────────────────────────────────────────────────────────────┤
│  📁 components/LoginButton.tsx                             [NEW FILE]   │
│                                                                         │
│  ┌─────────────────────────────────────────────────────────────────┐   │
│  │ + import { signIn, signOut, useSession } from 'next-auth/react' │   │
│  │ + import { Button } from '@/components/ui/button'               │   │
│  │ +                                                               │   │
│  │ + export function LoginButton(): JSX.Element {                 │   │
│  │ +   const { data: session, status } = useSession()             │   │
│  │ +                                                               │   │
│  │ +   if (status === 'loading') {                                │   │
│  │ +     return <Button disabled>Loading...</Button>              │   │
│  │ +   }                                                           │   │
│  │ +                                                               │   │
│  │ +   if (session) {                                              │   │
│  │ +     return (                                                  │   │
│  │ +       <Button onClick={() => signOut()}>                     │   │
│  │ +         Sign out ({session.user?.name})                      │   │
│  │ +       </Button>                                               │   │
│  │ +     )                                                         │   │
│  │ +   }                                                           │   │
│  │ +                                                               │   │
│  │ +   return (                                                    │   │
│  │ +     <Button onClick={() => signIn()}>                        │   │
│  │ +       Sign in                                                 │   │
│  │ +     </Button>                                                 │   │
│  │ +   )                                                           │   │
│  │ + }                                                             │   │
│  └─────────────────────────────────────────────────────────────────┘   │
│                                                                         │
│  📁 package.json                                          [MODIFIED]    │
│                                                                         │
│  ┌─────────────────────────────────────────────────────────────────┐   │
│  │   "dependencies": {                                             │   │
│  │     "next": "14.0.0",                                          │   │
│  │     "react": "18.2.0",                                         │   │
│  │ +   "next-auth": "^4.24.5",                                    │   │
│  │     "typescript": "5.3.0"                                      │   │
│  │   }                                                             │   │
│  └─────────────────────────────────────────────────────────────────┘   │
│                                                                         │
│  [✅ Apply All Changes] [❌ Reject All] [📋 Copy Code] [💾 Save Draft] │
└─────────────────────────────────────────────────────────────────────────┘
```

---

### 6. Project Dashboard (`xala-mcp get_layout('dashboard-grid')`)

```
┌─────────────────────────────────────────────────────────────────────────┐
│                              NAVBAR                                     │
├─────────────────────────────────────────────────────────────────────────┤
│ [📁 my-awesome-project] [⚙️ Settings] [🚀 Deploy] [📊 Analytics]        │
├─────────────────────────────────────────────────────────────────────────┤
│                                                                         │
│  ┌─────────────────────┐ ┌─────────────────────┐ ┌─────────────────────┐ │
│  │   📊 PROJECT STATS  │ │   🚀 DEPLOYMENT     │ │   🔧 QUICK ACTIONS  │ │
│  │                     │ │                     │ │                     │ │
│  │  Files: 47          │ │  Status: ✅ Live    │ │  [➕] Add Component │ │
│  │  Components: 12     │ │  URL: my-app.vercel │ │  [🎨] Generate UI   │ │
│  │  Tests: 23 ✅       │ │  Last: 2 min ago    │ │  [🔒] Add Auth      │ │
│  │  Coverage: 89%      │ │  Build: #42         │ │  [💳] Add Payments  │ │
│  └─────────────────────┘ └─────────────────────┘ └─────────────────────┘ │
│                                                                         │
│  ┌─────────────────────────────────────────────────────────────────┐   │
│  │                      📁 PROJECT STRUCTURE                       │   │
│  │                                                                 │   │
│  │  src/                                                           │   │
│  │  ├── components/                                                │   │
│  │  │   ├── ui/                    [12 components]                 │   │
│  │  │   ├── forms/                 [3 components]                  │   │
│  │  │   └── layout/                [4 components]                  │   │
│  │  ├── pages/                                                     │   │
│  │  │   ├── api/                   [8 endpoints]                   │   │
│  │  │   ├── auth/                  [3 pages]                       │   │
│  │  │   └── dashboard/             [5 pages]                       │   │
│  │  ├── lib/                                                       │   │
│  │  │   ├── auth.ts                                                │   │
│  │  │   ├── db.ts                                                  │   │
│  │  │   └── utils.ts                                               │   │
│  │  └── styles/                                                    │   │
│  │      └── globals.css                                            │   │
│  └─────────────────────────────────────────────────────────────────┘   │
│                                                                         │
│  ┌─────────────────────────────────────────────────────────────────┐   │
│  │                        🤖 AI SUGGESTIONS                        │   │
│  │                                                                 │   │
│  │  💡 Based on your project, I suggest:                          │   │
│  │                                                                 │   │
│  │  • Add API rate limiting for production security               │   │
│  │  • Implement user role management system                       │   │
│  │  • Add real-time notifications with WebSockets                 │   │
│  │  • Set up automated testing with GitHub Actions               │   │
│  │                                                                 │   │
│  │  [✨ Apply Suggestions] [💬 Chat with AI] [❌ Dismiss]         │   │
│  └─────────────────────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────────────────────┘
```

---

## 🎨 Component Library Integration

### Xala-MCP Component Mapping:

```javascript
// Navigation Components
const navbar = await xala-mcp.get_component('navbar-primary');
const sidebar = await xala-mcp.get_component('sidebar-navigation');
const breadcrumbs = await xala-mcp.get_component('breadcrumb-trail');

// Layout Components  
const heroSection = await xala-mcp.get_layout('homepage-hero');
const dashboardGrid = await xala-mcp.get_layout('dashboard-grid');
const wizardLayout = await xala-mcp.get_layout('wizard-stepper');

// Form Components
const projectForm = await xala-mcp.get_component('project-creation-form');
const stackSelector = await xala-mcp.get_component('technology-selector');
const featureToggles = await xala-mcp.get_component('feature-toggles');

// AI Components
const chatInterface = await xala-mcp.get_component('ai-chat-interface');
const codePreview = await xala-mcp.get_component('code-diff-viewer');
const suggestionPanel = await xala-mcp.get_component('ai-suggestions');

// Data Display
const projectStats = await xala-mcp.get_component('stats-cards');
const fileTree = await xala-mcp.get_component('file-tree-viewer');
const deploymentStatus = await xala-mcp.get_component('deployment-badge');

// Interactive Elements
const wizardStepper = await xala-mcp.get_block('wizard-stepper');
const progressBar = await xala-mcp.get_component('progress-indicator');
const confirmModal = await xala-mcp.get_component('confirmation-modal');
```

### Design Token Integration:
```javascript
// Theme Management
const tokens = await xala-mcp.get_design_tokens('primary-theme');
const darkTheme = await xala-mcp.get_design_tokens('dark-theme');
const highContrast = await xala-mcp.get_design_tokens('high-contrast');

// Responsive Breakpoints
const breakpoints = await xala-mcp.get_responsive_config();

// Accessibility Settings
const a11yConfig = await xala-mcp.get_accessibility_config();
```

---

## 📱 Responsive Design Specifications

### Mobile Layout (320px - 768px):
```
┌─────────────────────────┐
│    [☰] Xaheen [🔍] [👤] │
├─────────────────────────┤
│                         │
│      🚀 Xaheen CLI      │
│   AI-Native Toolkit     │
│                         │
│  [Get Started]          │
│  [View Docs]            │
│                         │
├─────────────────────────┤
│  📝 Natural Language    │
│  ┌─────────────────────┐ │
│  │ "Create a React app │ │
│  │  with auth..."      │ │
│  └─────────────────────┘ │
│                         │
│    [✨ Generate]        │
│                         │
├─────────────────────────┤
│     Quick Templates     │
│  ┌─────┐ ┌─────┐       │
│  │ 📱  │ │ 🌐  │       │
│  │Mobile│ │ Web │       │
│  └─────┘ └─────┘       │
│  ┌─────┐ ┌─────┐       │
│  │ ⚡  │ │ 🛒  │       │
│  │ API │ │E-com│       │
│  └─────┘ └─────┘       │
└─────────────────────────┘
```

### Tablet Layout (768px - 1024px):
```
┌───────────────────────────────────────────────┐
│  [☰] Xaheen CLI      [🔍 Search] [🌙] [👤]   │
├───────────────────────────────────────────────┤
│                                               │
│          🚀 Xaheen CLI v3.0.0                 │
│       AI-Native Development Toolkit          │
│                                               │
│     [Get Started] [Watch Demo] [Docs]        │
│                                               │
├───────────────────────────────────────────────┤
│              Project Creation                 │
│  ┌─────────────────────────────────────────┐  │
│  │ 📝 Describe your project:              │  │
│  │ ┌─────────────────────────────────────┐ │  │
│  │ │ "Create a SaaS dashboard with..."   │ │  │
│  │ └─────────────────────────────────────┘ │  │
│  │           [✨ Generate]                │  │
│  └─────────────────────────────────────────┘  │
│                                               │
├───────────────────────────────────────────────┤
│              Quick Templates                  │
│  ┌─────────┐ ┌─────────┐ ┌─────────┐        │
│  │ [📱]    │ │ [🌐]    │ │ [⚡]    │        │
│  │ Mobile  │ │ Web App │ │ API     │        │
│  └─────────┘ └─────────┘ └─────────┘        │
│  ┌─────────┐ ┌─────────┐                    │
│  │ [🛒]    │ │ [📊]    │                    │
│  │ E-comm  │ │Dashboard│                    │
│  └─────────┘ └─────────┘                    │
└───────────────────────────────────────────────┘
```

---

## ♿ Accessibility Features

### Keyboard Navigation:
```
Tab Order Flow:
1. Skip to main content link
2. Logo (Xaheen)
3. Navigation menu items
4. Search input
5. Theme toggle
6. User menu
7. Main content area
8. AI assistant toggle
9. Footer links

Keyboard Shortcuts:
- Alt + 1: Skip to main content
- Alt + 2: Open search
- Alt + 3: Toggle theme
- Alt + 4: Open AI assistant
- Esc: Close modals/overlays
- Enter/Space: Activate buttons
- Arrow keys: Navigate radio groups
```

### Screen Reader Support:
```html
<!-- Example ARIA implementation -->
<nav aria-label="Main navigation" role="navigation">
  <ul role="menubar">
    <li role="none">
      <a href="/" role="menuitem" aria-current="page">
        Home
      </a>
    </li>
  </ul>
</nav>

<main role="main" aria-labelledby="main-heading">
  <h1 id="main-heading">Project Creation Wizard</h1>
  
  <div role="tabpanel" aria-labelledby="step-1-tab">
    <fieldset>
      <legend>Project Type Selection</legend>
      <div role="radiogroup" aria-labelledby="project-type-label">
        <label>
          <input type="radio" role="radio" aria-checked="true">
          Web Application
        </label>
      </div>
    </fieldset>
  </div>
</main>
```

### Color Contrast & Themes:
```javascript
// High contrast theme tokens
const highContrastTokens = {
  background: '#000000',
  foreground: '#FFFFFF', 
  primary: '#FFFF00',
  secondary: '#00FFFF',
  border: '#FFFFFF',
  // Ensures 7:1 contrast ratio (WCAG AAA)
};

// Focus indicators
const focusStyles = {
  outline: '3px solid var(--focus-color)',
  outlineOffset: '2px',
  borderRadius: '4px',
};
```

---

## 🚀 Performance Optimizations

### Code Splitting Strategy:
```typescript
// Route-based splitting
const ProjectWizard = lazy(() => import('./ProjectWizard'));
const AIDashboard = lazy(() => import('./AIDashboard'));
const ProjectManager = lazy(() => import('./ProjectManager'));

// Component-based splitting
const CodeEditor = lazy(() => import('./CodeEditor'));
const FileTreeViewer = lazy(() => import('./FileTreeViewer'));
```

### Image Optimization:
```typescript
// Next.js Image optimization
<Image
  src="/icons/react.svg"
  alt="React framework icon"
  width={48}
  height={48}
  priority={false}
  loading="lazy"
  placeholder="blur"
  blurDataURL="data:image/svg+xml;base64,..."
/>
```

### Bundle Analysis:
```
Expected Bundle Sizes:
- Main bundle: ~85KB (gzipped)
- Vendor bundle: ~120KB (gzipped)  
- Wizard chunk: ~45KB (gzipped)
- AI components: ~35KB (gzipped)
- Total FCP: < 1.2s on 3G
- Total LCP: < 2.5s on 3G
```

---

This comprehensive wireframe specification provides your engineering team with detailed blueprints for implementing the Xaheen CLI web interface. Each component includes specific xala-mcp integration points, accessibility requirements, and responsive design considerations for a production-ready implementation.