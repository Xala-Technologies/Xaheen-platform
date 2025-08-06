# Xaheen Platform - Troubleshooting Guide

## Table of Contents

1. [Common Installation Issues](#common-installation-issues)
2. [CLI Command Errors](#cli-command-errors)
3. [Build and Compilation Errors](#build-and-compilation-errors)
4. [Runtime Errors](#runtime-errors)
5. [Integration Issues](#integration-issues)
6. [Compliance Validation Errors](#compliance-validation-errors)
7. [Performance Issues](#performance-issues)
8. [Deployment Problems](#deployment-problems)
9. [Database Issues](#database-issues)
10. [Debugging Techniques](#debugging-techniques)

## Common Installation Issues

### Issue: Installation fails with permission errors

**Error Message:**
```
Error: EACCES: permission denied, mkdir '/usr/local/lib/node_modules/@xaheen'
```

**Solution:**
```bash
# Option 1: Use a Node version manager (recommended)
curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.39.0/install.sh | bash
nvm install 20
nvm use 20
npm install -g @xaheen-ai/cli

# Option 2: Change npm's default directory
mkdir ~/.npm-global
npm config set prefix '~/.npm-global'
echo 'export PATH=~/.npm-global/bin:$PATH' >> ~/.profile
source ~/.profile
npm install -g @xaheen-ai/cli

# Option 3: Use npx (no installation needed)
npx @xaheen-ai/cli init my-app
```

### Issue: Bun installation fails

**Error Message:**
```
Command 'bun' not found
```

**Solution:**
```bash
# Install Bun
curl -fsSL https://bun.sh/install | bash

# Add to PATH (if not automatically added)
echo 'export BUN_INSTALL="$HOME/.bun"' >> ~/.bashrc
echo 'export PATH="$BUN_INSTALL/bin:$PATH"' >> ~/.bashrc
source ~/.bashrc

# Verify installation
bun --version
```

### Issue: Node version incompatibility

**Error Message:**
```
Error: The module was compiled against a different Node.js version
```

**Solution:**
```bash
# Check current Node version
node --version

# Install correct version (20+)
nvm install 20
nvm use 20

# Rebuild dependencies
rm -rf node_modules package-lock.json
npm install

# Or with Bun
rm -rf node_modules bun.lockb
bun install
```

## CLI Command Errors

### Issue: Command not found

**Error Message:**
```
bash: xaheen: command not found
```

**Solution:**
```bash
# Check if installed globally
npm list -g @xaheen-ai/cli

# If not installed, install it
npm install -g @xaheen-ai/cli

# Or use with npx
npx @xaheen-ai/cli [command]

# Check PATH
echo $PATH
# Ensure npm global bin is in PATH
```

### Issue: "Project not initialized" error

**Error Message:**
```
Error: No xaheen.config.json found. Are you in a Xaheen project?
```

**Solution:**
```bash
# Initialize project
xaheen init

# Or if in wrong directory
cd /path/to/your/project
xaheen [command]

# Check for config file
ls -la xaheen.config.json
```

### Issue: Invalid command syntax

**Error Message:**
```
Error: Invalid props format. Use: name:type[?][@validation]
```

**Solution:**
```bash
# Correct syntax examples:

# Component with props
xaheen component UserCard \
  name:string \
  email:string \
  age:number? \
  role:"admin"|"user"

# With validation
xaheen component ContactForm \
  email:string@email \
  phone:string@norwegianPhone \
  message:string@min:10@max:500

# Model with fields
xaheen model User \
  id:uuid! \
  email:string!@email \
  createdAt:datetime
```

## Build and Compilation Errors

### Issue: TypeScript compilation errors

**Error Message:**
```
error TS2322: Type 'string' is not assignable to type 'number'.
```

**Solution:**
```typescript
// 1. Fix type errors
// Before:
const age: number = "25"; // Error

// After:
const age: number = 25;
// Or:
const age: number = parseInt("25", 10);

// 2. Check tsconfig.json
{
  "compilerOptions": {
    "strict": true,
    "skipLibCheck": true,
    "forceConsistentCasingInFileNames": true
  }
}

// 3. Update type definitions
npm install --save-dev @types/node @types/react
```

### Issue: Module resolution errors

**Error Message:**
```
Cannot find module '@/components/Button' or its corresponding type declarations.
```

**Solution:**
```typescript
// 1. Check tsconfig.json paths
{
  "compilerOptions": {
    "baseUrl": ".",
    "paths": {
      "@/*": ["src/*"],
      "@/components/*": ["src/components/*"]
    }
  }
}

// 2. For Next.js projects
// next.config.js
module.exports = {
  webpack: (config) => {
    config.resolve.alias = {
      ...config.resolve.alias,
      '@': path.resolve(__dirname, 'src'),
    };
    return config;
  },
};

// 3. Install missing dependencies
npm install missing-package
```

### Issue: ESLint/Biome errors blocking build

**Error Message:**
```
Error: Lint errors found
  Unused variable 'data' at line 10
```

**Solution:**
```bash
# Fix automatically
npm run lint:fix
# or
bun run lint:fix

# Ignore specific rules (biome.json)
{
  "linter": {
    "rules": {
      "correctness": {
        "noUnusedVariables": "warn"
      }
    }
  }
}

# Disable for specific line
// biome-ignore lint/correctness/noUnusedVariables: Will be used later
const data = fetchData();
```

## Runtime Errors

### Issue: Hydration mismatch in Next.js

**Error Message:**
```
Error: Hydration failed because the initial UI does not match what was rendered on the server.
```

**Solution:**
```typescript
// 1. Use useEffect for client-only code
const [isClient, setIsClient] = useState(false);

useEffect(() => {
  setIsClient(true);
}, []);

if (!isClient) {
  return <LoadingState />;
}

// 2. Use dynamic imports with ssr: false
const DynamicComponent = dynamic(
  () => import('../components/ClientOnlyComponent'),
  { ssr: false }
);

// 3. Ensure consistent data
// Bad:
<div>{new Date().toLocaleString()}</div>

// Good:
<div>{format(date, 'PP', { locale: nb })}</div>
```

### Issue: Memory leaks

**Error Message:**
```
Warning: Can't perform a React state update on an unmounted component.
```

**Solution:**
```typescript
// Use cleanup in useEffect
useEffect(() => {
  let mounted = true;
  
  async function fetchData() {
    const data = await api.getData();
    if (mounted) {
      setData(data);
    }
  }
  
  fetchData();
  
  return () => {
    mounted = false;
  };
}, []);

// Or use AbortController
useEffect(() => {
  const controller = new AbortController();
  
  async function fetchData() {
    try {
      const data = await api.getData({ 
        signal: controller.signal 
      });
      setData(data);
    } catch (error) {
      if (error.name !== 'AbortError') {
        setError(error);
      }
    }
  }
  
  fetchData();
  
  return () => {
    controller.abort();
  };
}, []);
```

### Issue: CORS errors

**Error Message:**
```
Access to fetch at 'https://api.example.com' from origin 'http://localhost:3000' has been blocked by CORS policy.
```

**Solution:**
```typescript
// 1. Next.js API Route Proxy
// pages/api/proxy/[...path].ts
export default async function handler(req, res) {
  const { path } = req.query;
  const url = `https://api.example.com/${path.join('/')}`;
  
  const response = await fetch(url, {
    method: req.method,
    headers: {
      'Content-Type': 'application/json',
      // Forward auth headers
      Authorization: req.headers.authorization,
    },
    body: req.method !== 'GET' ? JSON.stringify(req.body) : undefined,
  });
  
  const data = await response.json();
  res.status(response.status).json(data);
}

// 2. Configure CORS on server
// middleware/cors.ts
export const corsMiddleware = {
  origin: process.env.ALLOWED_ORIGINS?.split(',') || '*',
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
};

// 3. Development proxy (next.config.js)
module.exports = {
  async rewrites() {
    return [
      {
        source: '/api/external/:path*',
        destination: 'https://api.example.com/:path*',
      },
    ];
  },
};
```

## Integration Issues

### Issue: Vipps integration not working

**Error Message:**
```
Error: Vipps API error: Invalid client credentials
```

**Solution:**
```bash
# 1. Check environment variables
cat .env.local | grep VIPPS

# Should have:
VIPPS_CLIENT_ID=your-client-id
VIPPS_CLIENT_SECRET=your-client-secret
VIPPS_SUBSCRIPTION_KEY=your-subscription-key
VIPPS_MSN=your-merchant-serial-number

# 2. Verify environment
# Test environment uses different endpoints
VIPPS_API_URL=https://apitest.vipps.no
# Production:
VIPPS_API_URL=https://api.vipps.no

# 3. Check certificate (for BankID)
openssl x509 -in cert.pem -text -noout

# 4. Test connection
curl -X POST https://apitest.vipps.no/accesstoken/get \
  -H "client_id: $VIPPS_CLIENT_ID" \
  -H "client_secret: $VIPPS_CLIENT_SECRET" \
  -H "Ocp-Apim-Subscription-Key: $VIPPS_SUBSCRIPTION_KEY"
```

### Issue: BankID authentication fails

**Error Message:**
```
Error: BankID error: INVALID_CERTIFICATE
```

**Solution:**
```typescript
// 1. Check certificate configuration
const bankIdConfig = {
  // Use test environment
  environment: process.env.NODE_ENV === 'production' ? 'prod' : 'test',
  
  // Correct certificate format
  certificates: {
    client: {
      cert: fs.readFileSync('./certs/bankid-client.crt', 'utf8'),
      key: fs.readFileSync('./certs/bankid-client.key', 'utf8'),
      passphrase: process.env.BANKID_CERT_PASSPHRASE,
    },
    ca: fs.readFileSync('./certs/bankid-ca.crt', 'utf8'),
  },
};

// 2. Test environment uses different personal numbers
// Test personal numbers: 
// 01010100968 - Success
// 01010100976 - User cancel
// 01010100984 - Expired transaction

// 3. Handle certificate renewal
// BankID certificates expire after 2 years
// Check expiry:
openssl x509 -enddate -noout -in bankid-client.crt
```

### Issue: Database connection errors

**Error Message:**
```
Error: P1001: Can't reach database server at `localhost:5432`
```

**Solution:**
```bash
# 1. Check if database is running
docker ps | grep postgres
# or
pg_isready -h localhost -p 5432

# 2. Start database
docker-compose up -d postgres
# or
brew services start postgresql@14

# 3. Check connection string
echo $DATABASE_URL
# Should be: postgresql://user:password@localhost:5432/dbname

# 4. Run migrations
npx prisma migrate dev
# or
npx prisma db push # for development

# 5. Check firewall/security groups (production)
# Ensure port 5432 is open for your IP
```

## Compliance Validation Errors

### Issue: GDPR validation failures

**Error Message:**
```
Error: GDPR Compliance Failed
- Missing consent mechanism
- Personal data not encrypted
- No data retention policy
```

**Solution:**
```typescript
// 1. Implement consent management
export function ConsentManager() {
  return (
    <ConsentBanner
      categories={{
        necessary: { required: true },
        analytics: { required: false },
        marketing: { required: false },
      }}
      onAccept={handleConsentUpdate}
      privacyPolicyUrl="/privacy"
    />
  );
}

// 2. Encrypt personal data
import { encrypt, decrypt } from '@/lib/crypto';

const user = {
  email: email, // Public data
  personalNumber: encrypt(personalNumber), // Encrypted
};

// 3. Implement data retention
// lib/gdpr/retention.ts
export async function enforceDataRetention() {
  const retentionPeriod = 3 * 365; // 3 years
  const cutoffDate = new Date();
  cutoffDate.setDate(cutoffDate.getDate() - retentionPeriod);
  
  await db.user.updateMany({
    where: {
      lastActiveAt: { lt: cutoffDate },
      deleted: false,
    },
    data: {
      deleted: true,
      deletedAt: new Date(),
      personalData: null, // Remove personal data
    },
  });
}
```

### Issue: WCAG accessibility failures

**Error Message:**
```
Error: WCAG 2.2 AAA Compliance Failed
- Color contrast ratio 3.5:1 (minimum 7:1)
- Missing alt text on images
- Form inputs without labels
```

**Solution:**
```typescript
// 1. Fix color contrast
// Use Xaheen's design tokens
import { colors } from '@/design-tokens';

// Bad:
<p className="text-gray-500 bg-gray-100">Low contrast text</p>

// Good:
<p className="text-gray-900 bg-white">High contrast text</p>

// 2. Add alt text
// Bad:
<img src="/logo.png" />

// Good:
<img src="/logo.png" alt="Xaheen company logo" />

// 3. Label form inputs
// Bad:
<input type="email" placeholder="Email" />

// Good:
<label htmlFor="email" className="sr-only">
  Email address
</label>
<input 
  id="email"
  type="email" 
  placeholder="Email"
  aria-label="Email address"
  aria-required="true"
/>

// 4. Test with tools
npm install --save-dev @axe-core/react
```

### Issue: NSM security validation failures

**Error Message:**
```
Error: NSM Security Requirements Not Met
- Unencrypted sensitive data transmission
- Missing audit logs
- Incorrect data classification
```

**Solution:**
```typescript
// 1. Implement proper encryption
export async function transmitSensitiveData(data: any, classification: NSMLevel) {
  if (classification >= NSMLevel.RESTRICTED) {
    // Encrypt before transmission
    const encrypted = await encrypt(data, {
      algorithm: 'aes-256-gcm',
      key: await getClassificationKey(classification),
    });
    
    // Use secure transport
    return await secureTransport.send(encrypted, {
      protocol: 'https',
      tlsVersion: '1.3',
    });
  }
}

// 2. Implement audit logging
export async function auditLog(event: AuditEvent) {
  await db.auditLog.create({
    data: {
      timestamp: new Date(),
      userId: getCurrentUser()?.id,
      action: event.action,
      resourceId: event.resourceId,
      classification: event.classification,
      ipAddress: getClientIP(),
      userAgent: getUserAgent(),
    },
  });
}

// 3. Classify data correctly
export function classifyData(data: any): NSMClassification {
  if (containsPersonalNumber(data)) {
    return NSMClassification.CONFIDENTIAL;
  }
  if (containsFinancialData(data)) {
    return NSMClassification.RESTRICTED;
  }
  if (containsInternalData(data)) {
    return NSMClassification.INTERNAL;
  }
  return NSMClassification.OPEN;
}
```

## Performance Issues

### Issue: Slow page load times

**Diagnosis:**
```bash
# Run Lighthouse audit
npm run lighthouse

# Check bundle size
npm run analyze
```

**Solution:**
```typescript
// 1. Implement code splitting
const HeavyComponent = dynamic(() => import('./HeavyComponent'), {
  loading: () => <Skeleton />,
  ssr: false,
});

// 2. Optimize images
import Image from 'next/image';

<Image
  src="/hero.jpg"
  alt="Hero image"
  width={1200}
  height={600}
  priority
  placeholder="blur"
  blurDataURL={heroBlurData}
/>

// 3. Implement caching
export async function getStaticProps() {
  const data = await fetchData();
  
  return {
    props: { data },
    revalidate: 3600, // Revalidate every hour
  };
}

// 4. Use React.memo for expensive components
export const ExpensiveComponent = React.memo(({ data }) => {
  // Component implementation
}, (prevProps, nextProps) => {
  // Custom comparison
  return prevProps.data.id === nextProps.data.id;
});
```

### Issue: Memory leaks in production

**Diagnosis:**
```javascript
// Add memory monitoring
if (process.env.NODE_ENV === 'production') {
  setInterval(() => {
    const usage = process.memoryUsage();
    console.log('Memory Usage:', {
      rss: `${Math.round(usage.rss / 1024 / 1024)}MB`,
      heapUsed: `${Math.round(usage.heapUsed / 1024 / 1024)}MB`,
      heapTotal: `${Math.round(usage.heapTotal / 1024 / 1024)}MB`,
    });
  }, 60000);
}
```

**Solution:**
```typescript
// 1. Clean up event listeners
useEffect(() => {
  const handleResize = () => setWidth(window.innerWidth);
  window.addEventListener('resize', handleResize);
  
  return () => {
    window.removeEventListener('resize', handleResize);
  };
}, []);

// 2. Clear timers
useEffect(() => {
  const timer = setTimeout(() => {
    doSomething();
  }, 1000);
  
  return () => {
    clearTimeout(timer);
  };
}, []);

// 3. Unsubscribe from observables
useEffect(() => {
  const subscription = dataStream.subscribe(data => {
    setData(data);
  });
  
  return () => {
    subscription.unsubscribe();
  };
}, []);

// 4. Limit cache size
const cache = new Map();
const MAX_CACHE_SIZE = 1000;

function addToCache(key: string, value: any) {
  if (cache.size >= MAX_CACHE_SIZE) {
    const firstKey = cache.keys().next().value;
    cache.delete(firstKey);
  }
  cache.set(key, value);
}
```

## Deployment Problems

### Issue: Build fails on Vercel

**Error Message:**
```
Error: Cannot find module '@/components/Header'
```

**Solution:**
```json
// 1. Check case sensitivity (Linux is case-sensitive)
// Wrong: import Header from '@/components/header';
// Right: import Header from '@/components/Header';

// 2. Update build command (vercel.json)
{
  "buildCommand": "npm run build",
  "outputDirectory": ".next",
  "framework": "nextjs",
  "env": {
    "NODE_ENV": "production"
  }
}

// 3. Install dependencies correctly
{
  "scripts": {
    "vercel-build": "npm ci && npm run build"
  }
}

// 4. Check environment variables
// Vercel dashboard > Settings > Environment Variables
// Ensure all required vars are set
```

### Issue: Docker build fails

**Error Message:**
```
ERROR: failed to solve: process "/bin/sh -c bun install" did not complete successfully
```

**Solution:**
```dockerfile
# Dockerfile
FROM oven/bun:1.2.16-alpine AS deps
WORKDIR /app

# Copy package files
COPY package.json bun.lockb* ./

# Install dependencies
RUN bun install --frozen-lockfile

FROM oven/bun:1.2.16-alpine AS builder
WORKDIR /app

# Copy dependencies
COPY --from=deps /app/node_modules ./node_modules
COPY . .

# Build application
ENV NEXT_TELEMETRY_DISABLED=1
RUN bun run build

FROM oven/bun:1.2.16-alpine AS runner
WORKDIR /app

ENV NODE_ENV=production
ENV NEXT_TELEMETRY_DISABLED=1

# Copy necessary files
COPY --from=builder /app/public ./public
COPY --from=builder /app/.next/standalone ./
COPY --from=builder /app/.next/static ./.next/static

EXPOSE 3000
ENV PORT=3000

CMD ["bun", "server.js"]
```

## Database Issues

### Issue: Prisma migration fails

**Error Message:**
```
Error: P3009: migrate found failed migrations in the target database
```

**Solution:**
```bash
# 1. Check migration status
npx prisma migrate status

# 2. Resolve failed migrations
npx prisma migrate resolve --applied "20240101120000_migration_name"

# 3. Reset database (development only!)
npx prisma migrate reset

# 4. Create migration without applying
npx prisma migrate dev --create-only

# 5. Apply migrations manually
npx prisma migrate deploy
```

### Issue: Connection pool exhausted

**Error Message:**
```
Error: P2024: Timed out fetching a new connection from the connection pool
```

**Solution:**
```typescript
// 1. Configure connection pool (prisma/schema.prisma)
datasource db {
  provider = "postgresql"
  url      = env("DATABASE_URL")
  // Add connection limit
  connectionLimit = 10
}

// 2. Use singleton pattern
// lib/prisma.ts
import { PrismaClient } from '@prisma/client';

const globalForPrisma = global as unknown as {
  prisma: PrismaClient | undefined;
};

export const prisma =
  globalForPrisma.prisma ??
  new PrismaClient({
    log: ['error', 'warn'],
    connectionTimeout: 20000, // 20 seconds
  });

if (process.env.NODE_ENV !== 'production') {
  globalForPrisma.prisma = prisma;
}

// 3. Close connections properly
export async function handler(req: Request) {
  try {
    // Your logic
  } finally {
    await prisma.$disconnect();
  }
}
```

## Debugging Techniques

### Enable Debug Logging

```bash
# Enable all debug logs
DEBUG=* npm run dev

# Specific modules
DEBUG=xaheen:* npm run dev
DEBUG=prisma:client npm run dev
DEBUG=next:* npm run dev

# Multiple modules
DEBUG=xaheen:*,prisma:* npm run dev
```

### Use Chrome DevTools

```javascript
// 1. Add debugger statements
export function complexFunction(data) {
  debugger; // Execution will pause here
  
  const processed = processData(data);
  return processed;
}

// 2. Use console methods effectively
console.time('DataProcessing');
const result = processLargeDataset(data);
console.timeEnd('DataProcessing');

console.table(users); // Display data in table format

console.group('User Processing');
users.forEach(user => {
  console.log('Processing:', user.name);
  console.dir(user, { depth: null }); // Show all properties
});
console.groupEnd();

// 3. Conditional breakpoints
if (user.role === 'admin' && data.length > 1000) {
  debugger;
}
```

### Network Debugging

```typescript
// 1. Log all API calls
const originalFetch = window.fetch;
window.fetch = async (...args) => {
  console.log('Fetch:', args);
  const response = await originalFetch(...args);
  console.log('Response:', response.status);
  return response;
};

// 2. Use request interceptors
import axios from 'axios';

axios.interceptors.request.use(
  config => {
    console.log('Request:', config);
    return config;
  },
  error => {
    console.error('Request Error:', error);
    return Promise.reject(error);
  }
);

axios.interceptors.response.use(
  response => {
    console.log('Response:', response);
    return response;
  },
  error => {
    console.error('Response Error:', error);
    return Promise.reject(error);
  }
);
```

### Performance Profiling

```typescript
// 1. React DevTools Profiler
import { Profiler } from 'react';

function onRenderCallback(
  id: string,
  phase: 'mount' | 'update',
  actualDuration: number,
  baseDuration: number,
  startTime: number,
  commitTime: number
) {
  console.log(`${id} (${phase}) took ${actualDuration}ms`);
}

<Profiler id="Navigation" onRender={onRenderCallback}>
  <Navigation />
</Profiler>

// 2. Custom performance marks
performance.mark('myFunction-start');
await complexOperation();
performance.mark('myFunction-end');

performance.measure(
  'myFunction',
  'myFunction-start',
  'myFunction-end'
);

const measure = performance.getEntriesByName('myFunction')[0];
console.log(`Operation took ${measure.duration}ms`);
```

### Memory Leak Detection

```javascript
// 1. Track component mounts/unmounts
let mountCount = 0;

export function MyComponent() {
  useEffect(() => {
    mountCount++;
    console.log(`Component mounted. Total mounts: ${mountCount}`);
    
    return () => {
      mountCount--;
      console.log(`Component unmounted. Active mounts: ${mountCount}`);
    };
  }, []);
}

// 2. Monitor object creation
class TrackedObject {
  static instances = new Set();
  
  constructor() {
    TrackedObject.instances.add(this);
  }
  
  destroy() {
    TrackedObject.instances.delete(this);
  }
  
  static getInstanceCount() {
    return TrackedObject.instances.size;
  }
}

// Periodically check
setInterval(() => {
  console.log('Active instances:', TrackedObject.getInstanceCount());
}, 10000);
```

---

> **For Agents**: This troubleshooting guide covers the most common issues encountered when working with the Xaheen platform. Always start with the error message, understand the root cause, and apply the appropriate solution. When debugging, use the built-in tools and techniques to isolate and resolve issues efficiently.