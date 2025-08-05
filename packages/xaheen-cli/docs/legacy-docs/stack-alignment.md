# Stack Alignment Review

## Our Core Technology Stack

### Frontend Stack
- **Framework**: Next.js 14+ (App Router)
- **UI Library**: @xala-technologies/ui-system
- **Styling**: Tailwind CSS
- **State Management**: React Context / Zustand
- **Data Fetching**: SWR / React Query
- **Forms**: React Hook Form + Zod
- **Icons**: Lucide React

### Backend Stack
- **API Layer**: Next.js API Routes (App Router)
- **Backend Services**: NestJS (for microservices)
- **Database ORM**: Prisma
- **Database**: PostgreSQL
- **Validation**: Zod
- **Authentication**: NextAuth.js
- **File Storage**: S3-compatible

### Development Stack
- **Language**: TypeScript (strict mode)
- **Package Manager**: Bun
- **Testing**: Jest / Vitest
- **Linting**: ESLint
- **Formatting**: Prettier
- **Build Tool**: Next.js / Turbo

### Infrastructure Stack
- **Monorepo**: Turborepo
- **CI/CD**: GitHub Actions
- **Deployment**: Vercel / Docker
- **Monitoring**: OpenTelemetry
- **MCP Integration**: Claude MCP Servers

## Component Alignment Check

### 1. ✅ Unified CLI (xaheen-unified-cli)
**Status**: Aligned with stack

**Current Implementation**:
- ✅ TypeScript with strict mode
- ✅ Bun as package manager
- ✅ Generates Prisma models
- ✅ Creates Next.js API routes (App Router)
- ✅ Uses @xala-technologies/ui-system
- ✅ Generates Zod validation schemas
- ✅ Creates React components with TypeScript

**Areas to Improve**:
- [ ] Add NestJS service generation for microservices
- [ ] Include NextAuth.js authentication templates
- [ ] Add Turborepo workspace configuration
- [ ] Include OpenTelemetry instrumentation

### 2. ✅ Make Domain
**Status**: Mostly aligned

**Well Aligned**:
```typescript
// Generates correct Next.js App Router structure
src/app/api/users/route.ts         // ✅ Correct
src/app/users/page.tsx             // ✅ Correct
src/components/user-form.tsx       // ✅ Correct
src/lib/validations/user.ts        // ✅ Correct (Zod)
prisma/schema.prisma               // ✅ Correct
```

**Needs Update**:
- [ ] Should use `@/lib/prisma` instead of inline prisma client
- [ ] Add proper error handling with Next.js error boundaries
- [ ] Include loading.tsx and error.tsx for pages
- [ ] Add metadata exports for SEO

### 3. ✅ Model Domain
**Status**: Well aligned

**Correctly Generates**:
- Prisma models with proper types
- TypeScript interfaces from Prisma
- Zod validation schemas
- Next.js API routes with proper NextRequest/NextResponse
- React hooks with SWR/React Query patterns

### 4. ⚠️ Stack Adapter Architecture
**Status**: Needs refinement

**Current Issues**:
1. NextJS adapter should focus on frontend
2. Need separate NestJS adapter for backend services
3. Missing integration patterns between Next.js and NestJS

**Proposed Structure**:
```
Stack Adapters/
├── frontend/
│   ├── nextjs.adapter.ts    (Next.js App Router)
│   ├── remix.adapter.ts     (Future)
│   └── angular.adapter.ts   (Future)
├── backend/
│   ├── nestjs.adapter.ts    (NestJS microservices)
│   ├── express.adapter.ts   (Future)
│   └── fastapi.adapter.ts   (Future)
└── fullstack/
    ├── nextjs-nestjs.adapter.ts  (Combined)
    └── t3-stack.adapter.ts       (Future)
```

### 5. ⚠️ Service Layer
**Status**: Needs clarification

**Current Confusion**:
- Services in Next.js context (server components/actions)
- Services in NestJS context (dependency injection)
- Need clear separation

**Proposed Approach**:
```typescript
// Next.js Server Actions (src/app/actions/user.actions.ts)
'use server';
export async function createUser(data: UserInput) {
  // Direct Prisma calls or API calls to NestJS
}

// NestJS Services (services/user/src/user.service.ts)
@Injectable()
export class UserService {
  // Business logic for microservice
}
```

### 6. ✅ UI System Integration
**Status**: Correctly aligned

**Using Correct Components**:
- Card, Button, Badge, Input, Select
- Container, Flex, Text
- Table, Modal
- All from @xala-technologies/ui-system

**Note**: Some components reported as missing need to be verified

### 7. ⚠️ Database Layer
**Status**: Needs consistency

**Issues**:
- Mixed migration approaches (Prisma vs SQL)
- Need consistent Prisma client singleton
- Missing seed data generation

**Standard Approach**:
```typescript
// src/lib/prisma.ts
import { PrismaClient } from '@prisma/client';

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
};

export const prisma = globalForPrisma.prisma ?? new PrismaClient();

if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prisma;
```

### 8. ✅ Monorepo Structure
**Status**: Aligned with Turborepo

**Correct Structure**:
```
xaheen/
├── apps/
│   ├── web/           (Next.js frontend)
│   ├── admin/         (Admin dashboard)
│   └── mobile/        (React Native)
├── packages/
│   ├── ui-system/     (Shared UI components)
│   ├── database/      (Prisma schemas)
│   ├── config/        (Shared configs)
│   └── utils/         (Shared utilities)
└── services/
    ├── auth/          (NestJS auth service)
    ├── email/         (NestJS email service)
    └── notification/  (NestJS notification service)
```

## Action Items for Full Alignment

### High Priority
1. **Create NestJS Adapter** for backend service generation
2. **Update Make Domain** to use proper Next.js patterns:
   - Server Components vs Client Components
   - Server Actions for mutations
   - Proper loading/error states
3. **Standardize Prisma Usage**:
   - Single client instance
   - Consistent migration approach
   - Seed data generation

### Medium Priority
4. **Add Authentication Templates**:
   - NextAuth.js configuration
   - Protected routes
   - Session management
5. **Improve Error Handling**:
   - Next.js error boundaries
   - Proper API error responses
   - Client-side error states

### Low Priority
6. **Add Testing Templates**:
   - Jest unit tests
   - React Testing Library
   - E2E with Playwright
7. **Add Monitoring**:
   - OpenTelemetry setup
   - Performance monitoring
   - Error tracking

## Command Examples (Aligned with Stack)

```bash
# Generate a Next.js page with proper structure
xaheen make:page users
# Creates:
# - app/users/page.tsx (server component)
# - app/users/loading.tsx
# - app/users/error.tsx
# - app/users/layout.tsx

# Generate a NestJS service
xaheen make:service user --stack nestjs
# Creates:
# - services/user/src/user.service.ts
# - services/user/src/user.controller.ts
# - services/user/src/user.module.ts

# Generate full-stack feature
xaheen make:feature blog --fullstack
# Creates:
# - Prisma model
# - Next.js pages and API routes
# - NestJS microservice (optional)
# - UI components
# - Validation schemas
# - Tests

# Generate with specific UI system components
xaheen make:component UserCard --ui-system
# Uses only @xala-technologies/ui-system components
```

## Configuration File (xaheen.config.ts)

```typescript
export default {
  stack: {
    frontend: 'nextjs',
    backend: 'nestjs',
    database: 'prisma',
    ui: '@xala-technologies/ui-system',
  },
  paths: {
    apps: './apps',
    packages: './packages',
    services: './services',
  },
  features: {
    authentication: 'nextauth',
    payments: 'stripe',
    email: 'resend',
    storage: 's3',
  },
  conventions: {
    components: 'PascalCase',
    files: 'kebab-case',
    api: 'RESTful',
  }
};
```

## Conclusion

Our unified CLI is well-aligned with the core stack but needs some refinements:

1. **Clear separation** between Next.js frontend and NestJS backend generation
2. **Consistent patterns** for Server Components vs Client Components
3. **Proper monorepo support** with workspace-aware generation
4. **Stack-specific adapters** that respect framework conventions

The architecture is solid and extensible. With these adjustments, we'll have a powerful, stack-aligned CLI that accelerates development while maintaining best practices.