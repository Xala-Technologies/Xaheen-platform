# AI Pattern Library

## Overview

This pattern library provides pre-built, AI-optimized layout patterns and component compositions designed for rapid, professional application generation. Each pattern is battle-tested, accessible, and optimized for specific use cases.

## 🏗 **Layout Patterns**

### **Dashboard Layouts**

#### **Standard Admin Dashboard**
**Use Case**: Admin panels, business dashboards, analytics interfaces  
**AI Tags**: `admin`, `dashboard`, `analytics`, `management`, `overview`

```typescript
const AdminDashboard = () => (
  <div className="min-h-screen bg-background">
    {/* Header */}
    <header className="border-b border-border bg-background/95 backdrop-blur">
      <Container size="full" padding="md">
        <Stack direction="horizontal" justify="space-between" align="center">
          <Stack direction="horizontal" gap="md" align="center">
            <img src="/logo.svg" alt="Company" className="h-8" />
            <Text variant="h3">Dashboard</Text>
          </Stack>
          <Stack direction="horizontal" gap="sm" align="center">
            <Button variant="outline" size="sm" icon={<BellIcon />}>
              Notifications
            </Button>
            <Button variant="ghost" size="sm" icon={<UserIcon />}>
              Profile
            </Button>
          </Stack>
        </Stack>
      </Container>
    </header>

    <div className="flex">
      {/* Sidebar */}
      <aside className="w-64 bg-muted/50 border-r border-border">
        <nav className="p-4 space-y-2">
          <Button variant="ghost" fullWidth justify="start" icon={<HomeIcon />}>
            Overview
          </Button>
          <Button variant="ghost" fullWidth justify="start" icon={<BarChartIcon />}>
            Analytics
          </Button>
          <Button variant="ghost" fullWidth justify="start" icon={<UsersIcon />}>
            Users
          </Button>
          <Button variant="ghost" fullWidth justify="start" icon={<SettingsIcon />}>
            Settings
          </Button>
        </nav>
      </aside>

      {/* Main Content */}
      <main className="flex-1 p-6">
        <Container size="full" padding="none">
          <Stack direction="vertical" gap="xl">
            {/* Stats Grid */}
            <Grid cols={{ base: 1, sm: 2, lg: 4 }} gap="lg">
              <Card variant="elevated" padding="lg">
                <Stack direction="vertical" gap="sm">
                  <Text variant="caption" color="secondary">Total Revenue</Text>
                  <Text variant="h2">$45,231.89</Text>
                  <Text variant="caption" color="success">+20.1% from last month</Text>
                </Stack>
              </Card>
              <Card variant="elevated" padding="lg">
                <Stack direction="vertical" gap="sm">
                  <Text variant="caption" color="secondary">Subscriptions</Text>
                  <Text variant="h2">+2350</Text>
                  <Text variant="caption" color="success">+180.1% from last month</Text>
                </Stack>
              </Card>
              <Card variant="elevated" padding="lg">
                <Stack direction="vertical" gap="sm">
                  <Text variant="caption" color="secondary">Sales</Text>
                  <Text variant="h2">+12,234</Text>
                  <Text variant="caption" color="success">+19% from last month</Text>
                </Stack>
              </Card>
              <Card variant="elevated" padding="lg">
                <Stack direction="vertical" gap="sm">
                  <Text variant="caption" color="secondary">Active Now</Text>
                  <Text variant="h2">+573</Text>
                  <Text variant="caption" color="success">+201 since last hour</Text>
                </Stack>
              </Card>
            </Grid>

            {/* Charts Section */}
            <Grid cols={{ base: 1, lg: 2 }} gap="lg">
              <Card variant="elevated" padding="lg">
                <Stack direction="vertical" gap="md">
                  <Text variant="h3">Overview</Text>
                  <div className="h-80 bg-muted rounded-lg flex items-center justify-center">
                    <Text variant="body" color="secondary">Chart Component</Text>
                  </div>
                </Stack>
              </Card>
              <Card variant="elevated" padding="lg">
                <Stack direction="vertical" gap="md">
                  <Text variant="h3">Recent Sales</Text>
                  <div className="h-80 bg-muted rounded-lg flex items-center justify-center">
                    <Text variant="body" color="secondary">Table Component</Text>
                  </div>
                </Stack>
              </Card>
            </Grid>
          </Stack>
        </Container>
      </main>
    </div>
  </div>
);
```

#### **Mobile-First Dashboard**
**Use Case**: Mobile admin interfaces, on-the-go management  
**AI Tags**: `mobile`, `dashboard`, `responsive`, `touch-friendly`

```typescript
const MobileDashboard = () => (
  <div className="min-h-screen bg-background">
    {/* Mobile Header */}
    <header className="bg-background border-b border-border p-4">
      <Stack direction="horizontal" justify="space-between" align="center">
        <Stack direction="horizontal" gap="sm" align="center">
          <Button variant="ghost" size="sm" icon={<MenuIcon />} />
          <Text variant="h3">Dashboard</Text>
        </Stack>
        <Button variant="ghost" size="sm" icon={<UserIcon />} />
      </Stack>
    </header>

    {/* Mobile Content */}
    <main className="p-4">
      <Stack direction="vertical" gap="lg">
        {/* Quick Stats */}
        <Grid cols={2} gap="md">
          <Card variant="elevated" padding="md">
            <Stack direction="vertical" gap="xs" align="center">
              <Text variant="h2">1,234</Text>
              <Text variant="caption" color="secondary">Total Users</Text>
            </Stack>
          </Card>
          <Card variant="elevated" padding="md">
            <Stack direction="vertical" gap="xs" align="center">
              <Text variant="h2">$5.6k</Text>
              <Text variant="caption" color="secondary">Revenue</Text>
            </Stack>
          </Card>
        </Grid>

        {/* Recent Activity */}
        <Card variant="elevated" padding="lg">
          <Stack direction="vertical" gap="md">
            <Text variant="h4">Recent Activity</Text>
            <Stack direction="vertical" gap="sm">
              {[1, 2, 3].map(i => (
                <Stack key={i} direction="horizontal" gap="md" align="center">
                  <div className="w-10 h-10 bg-primary rounded-full flex items-center justify-center">
                    <Text variant="caption" color="inverse">U</Text>
                  </div>
                  <Stack direction="vertical" gap="xs" className="flex-1">
                    <Text variant="body">New user registered</Text>
                    <Text variant="caption" color="secondary">2 minutes ago</Text>
                  </Stack>
                </Stack>
              ))}
            </Stack>
          </Stack>
        </Card>
      </Stack>
    </main>

    {/* Bottom Navigation */}
    <nav className="fixed bottom-0 left-0 right-0 bg-background border-t border-border">
      <Grid cols={4} gap="none">
        <Button variant="ghost" className="h-16 rounded-none" icon={<HomeIcon />}>
          Home
        </Button>
        <Button variant="ghost" className="h-16 rounded-none" icon={<BarChartIcon />}>
          Stats
        </Button>
        <Button variant="ghost" className="h-16 rounded-none" icon={<UsersIcon />}>
          Users
        </Button>
        <Button variant="ghost" className="h-16 rounded-none" icon={<SettingsIcon />}>
          Settings
        </Button>
      </Grid>
    </nav>
  </div>
);
```

### **Landing Page Patterns**

#### **SaaS Product Landing**
**Use Case**: Software products, B2B services, technical solutions  
**AI Tags**: `landing`, `saas`, `product`, `conversion`, `hero`, `features`

```typescript
const SaaSLanding = () => (
  <div className="min-h-screen">
    {/* Hero Section */}
    <section className="bg-gradient-to-br from-primary/5 to-secondary/5">
      <Container size="lg" padding="xl">
        <Stack direction="vertical" gap="xl" align="center" className="py-20">
          <Stack direction="vertical" gap="lg" align="center" className="max-w-3xl">
            <Text variant="h1" align="center">
              Build Better Products Faster
            </Text>
            <Text variant="bodyLarge" align="center" color="secondary">
              The complete design system for modern applications. Ship professional, 
              accessible interfaces in minutes, not months.
            </Text>
          </Stack>
          
          <Stack direction="horizontal" gap="md" align="center">
            <Button variant="primary" size="xl" icon={<ArrowRightIcon />}>
              Start Free Trial
            </Button>
            <Button variant="outline" size="xl" icon={<PlayIcon />}>
              Watch Demo
            </Button>
          </Stack>

          <Stack direction="horizontal" gap="lg" align="center" className="mt-8">
            <Text variant="caption" color="secondary">Trusted by</Text>
            <div className="flex gap-6 opacity-60">
              <img src="/logo1.svg" alt="Company 1" className="h-6" />
              <img src="/logo2.svg" alt="Company 2" className="h-6" />
              <img src="/logo3.svg" alt="Company 3" className="h-6" />
            </div>
          </Stack>
        </Stack>
      </Container>
    </section>

    {/* Features Section */}
    <section className="py-20">
      <Container size="lg" padding="xl">
        <Stack direction="vertical" gap="xl">
          <Stack direction="vertical" gap="md" align="center">
            <Text variant="h2" align="center">Everything you need</Text>
            <Text variant="bodyLarge" align="center" color="secondary" className="max-w-2xl">
              A comprehensive design system with components, patterns, and tools 
              for building world-class applications.
            </Text>
          </Stack>

          <Grid cols={{ base: 1, md: 3 }} gap="xl">
            <Card variant="elevated" padding="xl">
              <Stack direction="vertical" gap="md" align="center">
                <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center">
                  <ComponentIcon className="w-6 h-6 text-primary" />
                </div>
                <Text variant="h4" align="center">100+ Components</Text>
                <Text variant="body" align="center" color="secondary">
                  Pre-built, accessible components that work perfectly together.
                </Text>
              </Stack>
            </Card>
            
            <Card variant="elevated" padding="xl">
              <Stack direction="vertical" gap="md" align="center">
                <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center">
                  <PaletteIcon className="w-6 h-6 text-primary" />
                </div>
                <Text variant="h4" align="center">Smart Theming</Text>
                <Text variant="body" align="center" color="secondary">
                  Intelligent design tokens that adapt to your brand automatically.
                </Text>
              </Stack>
            </Card>
            
            <Card variant="elevated" padding="xl">
              <Stack direction="vertical" gap="md" align="center">
                <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center">
                  <ZapIcon className="w-6 h-6 text-primary" />
                </div>
                <Text variant="h4" align="center">AI-Powered</Text>
                <Text variant="body" align="center" color="secondary">
                  Generate entire applications with natural language prompts.
                </Text>
              </Stack>
            </Card>
          </Grid>
        </Stack>
      </Container>
    </section>

    {/* CTA Section */}
    <section className="bg-primary text-primary-foreground py-20">
      <Container size="lg" padding="xl">
        <Stack direction="vertical" gap="lg" align="center">
          <Text variant="h2" align="center">Ready to get started?</Text>
          <Text variant="bodyLarge" align="center" className="max-w-2xl opacity-90">
            Join thousands of developers building better products with our design system.
          </Text>
          <Button variant="secondary" size="xl" icon={<ArrowRightIcon />}>
            Start Building Today
          </Button>
        </Stack>
      </Container>
    </section>
  </div>
);
```

### **Form Patterns**

#### **Multi-Step Registration**
**Use Case**: User onboarding, account creation, complex data collection  
**AI Tags**: `form`, `registration`, `onboarding`, `multi-step`, `wizard`

```typescript
const MultiStepRegistration = () => {
  const [currentStep, setCurrentStep] = useState(1);
  const totalSteps = 3;

  return (
    <Container size="md" padding="xl" className="min-h-screen flex items-center justify-center">
      <Card variant="elevated" padding="xl" className="w-full max-w-md">
        <Stack direction="vertical" gap="xl">
          {/* Progress */}
          <Stack direction="vertical" gap="md">
            <Stack direction="horizontal" justify="space-between" align="center">
              <Text variant="h3">Create Account</Text>
              <Text variant="caption" color="secondary">
                Step {currentStep} of {totalSteps}
              </Text>
            </Stack>
            <div className="w-full bg-muted rounded-full h-2">
              <div 
                className="bg-primary h-2 rounded-full transition-all duration-300"
                style={{ width: `${(currentStep / totalSteps) * 100}%` }}
              />
            </div>
          </Stack>

          {/* Step Content */}
          {currentStep === 1 && (
            <Stack direction="vertical" gap="md">
              <Text variant="h4">Basic Information</Text>
              <Input label="Full Name" placeholder="Enter your full name" required />
              <Input type="email" label="Email" placeholder="Enter your email" required />
              <Input type="password" label="Password" placeholder="Choose a password" required />
            </Stack>
          )}

          {currentStep === 2 && (
            <Stack direction="vertical" gap="md">
              <Text variant="h4">Company Details</Text>
              <Input label="Company Name" placeholder="Enter company name" required />
              <Select 
                label="Company Size" 
                options={[
                  { value: '1-10', label: '1-10 employees' },
                  { value: '11-50', label: '11-50 employees' },
                  { value: '51-200', label: '51-200 employees' },
                  { value: '200+', label: '200+ employees' }
                ]} 
                required 
              />
              <Select 
                label="Industry" 
                options={[
                  { value: 'tech', label: 'Technology' },
                  { value: 'finance', label: 'Finance' },
                  { value: 'healthcare', label: 'Healthcare' },
                  { value: 'other', label: 'Other' }
                ]} 
                required 
              />
            </Stack>
          )}

          {currentStep === 3 && (
            <Stack direction="vertical" gap="md">
              <Text variant="h4">Almost Done!</Text>
              <Alert 
                variant="success" 
                title="Account Created" 
                description="We've sent a verification email to your inbox."
              />
              <Stack direction="vertical" gap="sm">
                <Text variant="body">What happens next:</Text>
                <Stack direction="vertical" gap="xs" className="ml-4">
                  <Text variant="body" color="secondary">• Check your email for verification</Text>
                  <Text variant="body" color="secondary">• Complete your profile setup</Text>
                  <Text variant="body" color="secondary">• Start building amazing products</Text>
                </Stack>
              </Stack>
            </Stack>
          )}

          {/* Navigation */}
          <Stack direction="horizontal" justify="space-between">
            <Button 
              variant="outline" 
              disabled={currentStep === 1}
              onClick={() => setCurrentStep(currentStep - 1)}
            >
              Previous
            </Button>
            
            {currentStep < totalSteps ? (
              <Button 
                variant="primary"
                onClick={() => setCurrentStep(currentStep + 1)}
              >
                Next Step
              </Button>
            ) : (
              <Button variant="primary" icon={<CheckIcon />}>
                Get Started
              </Button>
            )}
          </Stack>
        </Stack>
      </Card>
    </Container>
  );
};
```

### **E-commerce Patterns**

#### **Product Listing**
**Use Case**: Online stores, marketplaces, product catalogs  
**AI Tags**: `ecommerce`, `products`, `shopping`, `catalog`, `grid`

```typescript
const ProductListing = () => (
  <Container size="lg" padding="xl">
    <Stack direction="vertical" gap="xl">
      {/* Header */}
      <Stack direction="horizontal" justify="space-between" align="center">
        <Stack direction="vertical" gap="sm">
          <Text variant="h2">Products</Text>
          <Text variant="body" color="secondary">
            Discover our latest collection of premium products
          </Text>
        </Stack>
        
        <Stack direction="horizontal" gap="sm">
          <Select 
            options={[
              { value: 'newest', label: 'Newest First' },
              { value: 'price-low', label: 'Price: Low to High' },
              { value: 'price-high', label: 'Price: High to Low' },
              { value: 'popular', label: 'Most Popular' }
            ]}
            value="newest"
            placeholder="Sort by"
          />
          <Button variant="outline" icon={<FilterIcon />}>
            Filters
          </Button>
        </Stack>
      </Stack>

      {/* Filters Bar */}
      <Card variant="outlined" padding="md">
        <Stack direction="horizontal" gap="md" align="center">
          <Text variant="label">Filter by:</Text>
          <Button variant="ghost" size="sm">Category</Button>
          <Button variant="ghost" size="sm">Price Range</Button>
          <Button variant="ghost" size="sm">Brand</Button>
          <Button variant="ghost" size="sm">Rating</Button>
        </Stack>
      </Card>

      {/* Product Grid */}
      <Grid cols={{ base: 1, sm: 2, md: 3, lg: 4 }} gap="lg">
        {Array.from({ length: 12 }).map((_, i) => (
          <Card key={i} variant="elevated" interactive className="group">
            <Stack direction="vertical" gap="md">
              {/* Product Image */}
              <div className="aspect-square bg-muted rounded-lg relative overflow-hidden">
                <img 
                  src={`/product-${i + 1}.jpg`} 
                  alt={`Product ${i + 1}`}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                />
                <Button 
                  variant="secondary" 
                  size="sm" 
                  icon={<HeartIcon />}
                  className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity"
                />
              </div>

              {/* Product Info */}
              <Stack direction="vertical" gap="sm" className="p-4">
                <Stack direction="horizontal" justify="space-between" align="start">
                  <Stack direction="vertical" gap="xs">
                    <Text variant="h5">Premium Headphones</Text>
                    <Text variant="caption" color="secondary">Electronics</Text>
                  </Stack>
                  <Stack direction="horizontal" gap="xs" align="center">
                    <StarIcon className="w-4 h-4 text-warning fill-current" />
                    <Text variant="caption">4.8</Text>
                  </Stack>
                </Stack>

                <Text variant="body" color="secondary" className="line-clamp-2">
                  High-quality wireless headphones with noise cancellation
                </Text>

                <Stack direction="horizontal" justify="space-between" align="center">
                  <Stack direction="horizontal" gap="sm" align="center">
                    <Text variant="h4">$299</Text>
                    <Text variant="body" color="secondary" className="line-through">$399</Text>
                  </Stack>
                  <Button variant="primary" size="sm" icon={<ShoppingCartIcon />}>
                    Add to Cart
                  </Button>
                </Stack>
              </Stack>
            </Stack>
          </Card>
        ))}
      </Grid>

      {/* Load More */}
      <div className="flex justify-center">
        <Button variant="outline" size="lg">
          Load More Products
        </Button>
      </div>
    </Stack>
  </Container>
);
```

## 🎯 **Component Composition Patterns**

### **Data Display Patterns**

#### **Statistics Dashboard**
```typescript
const StatsDashboard = ({ stats }) => (
  <Grid cols={{ base: 1, sm: 2, lg: 4 }} gap="lg">
    {stats.map(stat => (
      <Card key={stat.id} variant="elevated" padding="lg">
        <Stack direction="vertical" gap="sm">
          <Stack direction="horizontal" justify="space-between" align="center">
            <Text variant="caption" color="secondary">{stat.label}</Text>
            <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${stat.bgColor}`}>
              <stat.icon className="w-4 h-4" />
            </div>
          </Stack>
          <Text variant="h2">{stat.value}</Text>
          <Stack direction="horizontal" gap="xs" align="center">
            <TrendingUpIcon className="w-4 h-4 text-success" />
            <Text variant="caption" color="success">{stat.change}</Text>
            <Text variant="caption" color="secondary">vs last month</Text>
          </Stack>
        </Stack>
      </Card>
    ))}
  </Grid>
);
```

#### **Data Table with Actions**
```typescript
const DataTable = ({ data, columns }) => (
  <Card variant="elevated">
    <Stack direction="vertical" gap="none">
      {/* Table Header */}
      <div className="p-6 border-b border-border">
        <Stack direction="horizontal" justify="space-between" align="center">
          <Stack direction="vertical" gap="sm">
            <Text variant="h4">Users</Text>
            <Text variant="body" color="secondary">
              Manage your team members and their permissions
            </Text>
          </Stack>
          <Stack direction="horizontal" gap="sm">
            <Button variant="outline" icon={<FilterIcon />}>Filter</Button>
            <Button variant="primary" icon={<PlusIcon />}>Add User</Button>
          </Stack>
        </Stack>
      </div>

      {/* Table Content */}
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead className="border-b border-border">
            <tr>
              {columns.map(column => (
                <th key={column.key} className="text-left p-4">
                  <Text variant="label" color="secondary">{column.label}</Text>
                </th>
              ))}
              <th className="text-right p-4">
                <Text variant="label" color="secondary">Actions</Text>
              </th>
            </tr>
          </thead>
          <tbody>
            {data.map(row => (
              <tr key={row.id} className="border-b border-border hover:bg-muted/50">
                {columns.map(column => (
                  <td key={column.key} className="p-4">
                    <Text variant="body">{row[column.key]}</Text>
                  </td>
                ))}
                <td className="p-4 text-right">
                  <Stack direction="horizontal" gap="xs" justify="end">
                    <Button variant="ghost" size="sm" icon={<EditIcon />} />
                    <Button variant="ghost" size="sm" icon={<TrashIcon />} />
                  </Stack>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </Stack>
  </Card>
);
```

### **Navigation Patterns**

#### **Application Shell**
```typescript
const AppShell = ({ children }) => (
  <div className="flex h-screen bg-background">
    {/* Sidebar */}
    <aside className="w-64 bg-muted/30 border-r border-border flex flex-col">
      {/* Logo */}
      <div className="p-6 border-b border-border">
        <Stack direction="horizontal" gap="sm" align="center">
          <img src="/logo.svg" alt="Logo" className="w-8 h-8" />
          <Text variant="h4">Dashboard</Text>
        </Stack>
      </div>

      {/* Navigation */}
      <nav className="flex-1 p-4">
        <Stack direction="vertical" gap="xs">
          {navigationItems.map(item => (
            <Button
              key={item.id}
              variant={item.active ? "secondary" : "ghost"}
              fullWidth
              justify="start"
              icon={<item.icon />}
            >
              {item.label}
            </Button>
          ))}
        </Stack>
      </nav>

      {/* User Profile */}
      <div className="p-4 border-t border-border">
        <Stack direction="horizontal" gap="sm" align="center">
          <div className="w-8 h-8 bg-primary rounded-full flex items-center justify-center">
            <Text variant="caption" color="inverse">JD</Text>
          </div>
          <Stack direction="vertical" gap="none" className="flex-1">
            <Text variant="body">John Doe</Text>
            <Text variant="caption" color="secondary">john@example.com</Text>
          </Stack>
          <Button variant="ghost" size="sm" icon={<SettingsIcon />} />
        </Stack>
      </div>
    </aside>

    {/* Main Content */}
    <main className="flex-1 flex flex-col overflow-hidden">
      {/* Header */}
      <header className="border-b border-border bg-background/95 backdrop-blur">
        <Container size="full" padding="md">
          <Stack direction="horizontal" justify="space-between" align="center">
            <Stack direction="horizontal" gap="md" align="center">
              <Button variant="ghost" size="sm" icon={<MenuIcon />} className="lg:hidden" />
              <Text variant="h3">Overview</Text>
            </Stack>
            <Stack direction="horizontal" gap="sm">
              <Button variant="outline" size="sm" icon={<SearchIcon />}>
                Search
              </Button>
              <Button variant="ghost" size="sm" icon={<BellIcon />} />
            </Stack>
          </Stack>
        </Container>
      </header>

      {/* Content */}
      <div className="flex-1 overflow-auto">
        {children}
      </div>
    </main>
  </div>
);
```

## 🎨 **Responsive Patterns**

### **Mobile-First Approach**
```typescript
// Always start with mobile layout, then enhance for larger screens
const ResponsiveCard = () => (
  <Card variant="elevated" className="p-4 md:p-6 lg:p-8">
    <Stack 
      direction={{ base: "vertical", md: "horizontal" }} 
      gap={{ base: "md", md: "lg" }}
      align={{ base: "stretch", md: "center" }}
    >
      <div className="w-full md:w-24 lg:w-32 aspect-square bg-muted rounded-lg" />
      <Stack direction="vertical" gap="sm" className="flex-1">
        <Text variant={{ base: "h4", lg: "h3" }}>Product Title</Text>
        <Text variant="body" color="secondary" className="hidden sm:block">
          Detailed description that only shows on larger screens
        </Text>
        <Stack 
          direction={{ base: "vertical", sm: "horizontal" }} 
          gap="sm" 
          justify={{ sm: "space-between" }}
          align={{ base: "stretch", sm: "center" }}
        >
          <Text variant="h4">$299</Text>
          <Button 
            variant="primary" 
            size={{ base: "lg", sm: "md" }}
            fullWidth={{ base: true, sm: false }}
          >
            Add to Cart
          </Button>
        </Stack>
      </Stack>
    </Stack>
  </Card>
);
```

## 🚀 **Performance Patterns**

### **Optimized Loading States**
```typescript
const OptimizedList = () => {
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState([]);

  return (
    <Stack direction="vertical" gap="lg">
      {loading ? (
        // Skeleton states match final layout
        <Stack direction="vertical" gap="md">
          {Array.from({ length: 5 }).map((_, i) => (
            <Card key={i} variant="elevated" padding="lg">
              <Stack direction="horizontal" gap="md" align="center">
                <Skeleton className="w-12 h-12 rounded-full" />
                <Stack direction="vertical" gap="xs" className="flex-1">
                  <Skeleton className="h-4 w-32" />
                  <Skeleton className="h-3 w-24" />
                </Stack>
                <Skeleton className="h-8 w-20" />
              </Stack>
            </Card>
          ))}
        </Stack>
      ) : (
        // Actual content
        <Stack direction="vertical" gap="md">
          {data.map(item => (
            <Card key={item.id} variant="elevated" padding="lg">
              <ItemContent item={item} />
            </Card>
          ))}
        </Stack>
      )}
    </Stack>
  );
};
```

---

**These patterns provide a solid foundation for AI tools to generate professional, accessible, and performant applications across all platforms and use cases.**