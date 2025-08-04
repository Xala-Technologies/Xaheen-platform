/**
 * Page Template Generator for Xala UI System
 */

import type { PageTemplateConfig } from '../types/index.js';

export class PageTemplateGenerator {
  
  generatePageTemplate(config: PageTemplateConfig): string {
    switch (config.template) {
      case 'dashboard':
        return this.generateDashboardPage(config);
      case 'landing':
        return this.generateLandingPage(config);
      case 'auth':
        return this.generateAuthPage(config);
      case 'profile':
        return this.generateProfilePage(config);
      case 'settings':
        return this.generateSettingsPage(config);
      case 'analytics':
        return this.generateAnalyticsPage(config);
      case 'user-management':
        return this.generateUserManagementPage(config);
      case 'content-management':
        return this.generateContentManagementPage(config);
      case 'e-commerce':
        return this.generateECommercePage(config);
      case 'blog':
        return this.generateBlogPage(config);
      default:
        throw new Error(`Unknown page template: ${config.template}`);
    }
  }

  private generateDashboardPage(config: PageTemplateConfig): string {
    const componentName = this.toPascalCase(config.name);
    
    return `// pages/${config.template}/${componentName}.tsx
import {
  AdminLayout,
  Container,
  Stack,
  Grid,
  GridItem,
  Typography,
  Card,
  CardHeader,
  CardContent,
  DataTable,
  Badge,
  Button,
  useTokens
} from '@xala-technologies/ui-system';
import { BarChart3, Users, TrendingUp, DollarSign } from 'lucide-react';
import { useTranslation } from 'react-i18next';

export interface ${componentName}Props {
  readonly data?: {
    readonly metrics?: Array<{
      readonly title: string;
      readonly value: string;
      readonly change: string;
      readonly trend: 'up' | 'down' | 'neutral';
    }>;
    readonly recentActivity?: Array<{
      readonly id: string;
      readonly user: string;
      readonly action: string;
      readonly timestamp: string;
    }>;
  };
}

export function ${componentName}({ data }: ${componentName}Props): JSX.Element {
  const { t } = useTranslation();
  const { colors, spacing } = useTokens();

  const defaultMetrics = [
    {
      title: t('dashboard.metrics.totalUsers'),
      value: '12,345',
      change: '+12%',
      trend: 'up' as const,
      icon: <Users size={24} />
    },
    {
      title: t('dashboard.metrics.revenue'),
      value: '$45,678',
      change: '+8%',
      trend: 'up' as const,
      icon: <DollarSign size={24} />
    },
    {
      title: t('dashboard.metrics.growth'),
      value: '23.5%',
      change: '+2.1%',
      trend: 'up' as const,
      icon: <TrendingUp size={24} />
    },
    {
      title: t('dashboard.metrics.analytics'),
      value: '89.2%',
      change: '-1.2%',
      trend: 'down' as const,
      icon: <BarChart3 size={24} />
    }
  ];

  const metrics = data?.metrics || defaultMetrics;
  const recentActivity = data?.recentActivity || [];

  return (
    <AdminLayout>
      <Container size="full" padding="lg">
        <Stack direction="vertical" gap="xl">
          {/* Page Header */}
          <Stack direction="horizontal" justify="between" align="center">
            <Stack direction="vertical" gap="xs">
              <Typography variant="h1" weight="bold">
                {t('dashboard.title')}
              </Typography>
              <Typography variant="body" color="muted">
                {t('dashboard.subtitle')}
              </Typography>
            </Stack>
            <Button variant="primary">
              {t('dashboard.actions.refresh')}
            </Button>
          </Stack>

          {/* Metrics Grid */}
          <Grid columns={4} gap="lg">
            {metrics.map((metric, index) => (
              <GridItem key={index}>
                <Card>
                  <CardContent>
                    <Stack direction="vertical" gap="md">
                      <Stack direction="horizontal" justify="between" align="center">
                        <Typography variant="body" color="muted">
                          {metric.title}
                        </Typography>
                        {metric.icon}
                      </Stack>
                      <Typography variant="h2" weight="bold">
                        {metric.value}
                      </Typography>
                      <Badge 
                        variant={metric.trend === 'up' ? 'success' : metric.trend === 'down' ? 'destructive' : 'secondary'}
                        size="sm"
                      >
                        {metric.change}
                      </Badge>
                    </Stack>
                  </CardContent>
                </Card>
              </GridItem>
            ))}
          </Grid>

          {/* Content Grid */}
          <Grid columns={2} gap="lg">
            {/* Chart Section */}
            <GridItem>
              <Card>
                <CardHeader>
                  <Typography variant="h3" weight="semibold">
                    {t('dashboard.charts.title')}
                  </Typography>
                </CardHeader>
                <CardContent>
                  <Stack direction="vertical" align="center" justify="center" style={{ minHeight: '300px' }}>
                    <BarChart3 size={48} style={{ color: colors.text.muted }} />
                    <Typography variant="body" color="muted">
                      {t('dashboard.charts.placeholder')}
                    </Typography>
                  </Stack>
                </CardContent>
              </Card>
            </GridItem>

            {/* Recent Activity */}
            <GridItem>
              <Card>
                <CardHeader>
                  <Typography variant="h3" weight="semibold">
                    {t('dashboard.activity.title')}
                  </Typography>
                </CardHeader>
                <CardContent>
                  {recentActivity.length > 0 ? (
                    <DataTable
                      columns={[
                        { key: 'user', label: t('dashboard.activity.user'), type: 'text' },
                        { key: 'action', label: t('dashboard.activity.action'), type: 'text' },
                        { key: 'timestamp', label: t('dashboard.activity.time'), type: 'date' }
                      ]}
                      data={recentActivity}
                      features={{
                        sorting: false,
                        filtering: false,
                        pagination: false,
                        selection: false,
                        search: false,
                        export: false
                      }}
                    />
                  ) : (
                    <Stack direction="vertical" align="center" justify="center" style={{ minHeight: '200px' }}>
                      <Typography variant="body" color="muted">
                        {t('dashboard.activity.noData')}
                      </Typography>
                    </Stack>
                  )}
                </CardContent>
              </Card>
            </GridItem>
          </Grid>
        </Stack>
      </Container>
    </AdminLayout>
  );
}`;
  }

  private generateLandingPage(config: PageTemplateConfig): string {
    const componentName = this.toPascalCase(config.name);
    
    return `// pages/${config.template}/${componentName}.tsx
import {
  WebLayout,
  Container,
  Stack,
  Grid,
  GridItem,
  Typography,
  Button,
  Card,
  CardContent,
  Badge,
  useTokens
} from '@xala-technologies/ui-system';
import { ArrowRight, Check, Star } from 'lucide-react';
import { useTranslation } from 'react-i18next';

export interface ${componentName}Props {
  readonly onGetStarted?: () => void;
  readonly onLearnMore?: () => void;
}

export function ${componentName}({ onGetStarted, onLearnMore }: ${componentName}Props): JSX.Element {
  const { t } = useTranslation();
  const { colors, spacing } = useTokens();

  const features = [
    {
      title: t('landing.features.accessibility.title'),
      description: t('landing.features.accessibility.description'),
      icon: <Check size={24} />
    },
    {
      title: t('landing.features.responsive.title'),
      description: t('landing.features.responsive.description'),
      icon: <Check size={24} />
    },
    {
      title: t('landing.features.localization.title'),
      description: t('landing.features.localization.description'),
      icon: <Check size={24} />
    }
  ];

  return (
    <WebLayout>
      <Container size="xl" padding="none">
        <Stack direction="vertical" gap="4xl">
          {/* Hero Section */}
          <Container size="lg" padding="4xl">
            <Stack direction="vertical" align="center" gap="xl" style={{ textAlign: 'center' }}>
              <Badge variant="secondary" size="lg">
                {t('landing.hero.badge')}
              </Badge>
              
              <Typography variant="h1" weight="bold" style={{ fontSize: '3.5rem', lineHeight: 1.1 }}>
                {t('landing.hero.title')}
              </Typography>
              
              <Typography variant="h4" color="muted" style={{ maxWidth: '600px' }}>
                {t('landing.hero.subtitle')}
              </Typography>
              
              <Stack direction="horizontal" gap="lg">
                <Button 
                  variant="primary" 
                  size="lg"
                  onClick={onGetStarted}
                >
                  {t('landing.hero.cta')}
                  <ArrowRight size={20} />
                </Button>
                <Button 
                  variant="outline" 
                  size="lg"
                  onClick={onLearnMore}
                >
                  {t('landing.hero.learnMore')}
                </Button>
              </Stack>
            </Stack>
          </Container>

          {/* Features Section */}
          <Container size="lg" padding="2xl">
            <Stack direction="vertical" align="center" gap="xl">
              <Stack direction="vertical" align="center" gap="md" style={{ textAlign: 'center' }}>
                <Typography variant="h2" weight="bold">
                  {t('landing.features.title')}
                </Typography>
                <Typography variant="h5" color="muted">
                  {t('landing.features.subtitle')}
                </Typography>
              </Stack>
              
              <Grid columns={3} gap="xl">
                {features.map((feature, index) => (
                  <GridItem key={index}>
                    <Card style={{ height: '100%' }}>
                      <CardContent>
                        <Stack direction="vertical" gap="lg">
                          <div style={{ 
                            width: '48px', 
                            height: '48px', 
                            borderRadius: '12px',
                            backgroundColor: colors.primary[100],
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            color: colors.primary[600]
                          }}>
                            {feature.icon}
                          </div>
                          <Stack direction="vertical" gap="sm">
                            <Typography variant="h4" weight="semibold">
                              {feature.title}
                            </Typography>
                            <Typography variant="body" color="muted">
                              {feature.description}
                            </Typography>
                          </Stack>
                        </Stack>
                      </CardContent>
                    </Card>
                  </GridItem>
                ))}
              </Grid>
            </Stack>
          </Container>

          {/* CTA Section */}
          <Container size="lg" padding="4xl">
            <Card style={{ 
              background: \`linear-gradient(135deg, \${colors.primary[600]} 0%, \${colors.primary[700]} 100%)\`,
              color: colors.white
            }}>
              <CardContent>
                <Stack direction="vertical" align="center" gap="xl" style={{ textAlign: 'center' }}>
                  <Stack direction="vertical" gap="md">
                    <Typography variant="h2" weight="bold" style={{ color: 'inherit' }}>
                      {t('landing.cta.title')}
                    </Typography>
                    <Typography variant="h5" style={{ color: 'inherit', opacity: 0.9 }}>
                      {t('landing.cta.subtitle')}
                    </Typography>
                  </Stack>
                  
                  <Button 
                    variant="secondary" 
                    size="lg"
                    onClick={onGetStarted}
                  >
                    {t('landing.cta.button')}
                    <ArrowRight size={20} />
                  </Button>
                </Stack>
              </CardContent>
            </Card>
          </Container>
        </Stack>
      </Container>
    </WebLayout>
  );
}`;
  }

  private generateAuthPage(config: PageTemplateConfig): string {
    const componentName = this.toPascalCase(config.name);
    
    return `// pages/${config.template}/${componentName}.tsx
import {
  Container,
  Stack,
  Typography,
  Card,
  CardHeader,
  CardContent,
  Form,
  Input,
  Button,
  Divider,
  useTokens
} from '@xala-technologies/ui-system';
import { useTranslation } from 'react-i18next';
import { useState } from 'react';

export interface ${componentName}Props {
  readonly mode?: 'login' | 'register' | 'forgot-password';
  readonly onSubmit?: (data: any) => void;
  readonly onModeChange?: (mode: 'login' | 'register' | 'forgot-password') => void;
}

export function ${componentName}({ 
  mode = 'login', 
  onSubmit,
  onModeChange 
}: ${componentName}Props): JSX.Element {
  const { t } = useTranslation();
  const { colors, spacing } = useTokens();
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (data: any): Promise<void> => {
    setLoading(true);
    try {
      if (onSubmit) {
        await onSubmit(data);
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <Container size="sm" padding="xl" style={{ 
      minHeight: '100vh',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center'
    }}>
      <Card style={{ width: '100%', maxWidth: '400px' }}>
        <CardHeader>
          <Stack direction="vertical" align="center" gap="md">
            <Typography variant="h2" weight="bold">
              {mode === 'login' && t('auth.login.title')}
              {mode === 'register' && t('auth.register.title')}
              {mode === 'forgot-password' && t('auth.forgotPassword.title')}
            </Typography>
            <Typography variant="body" color="muted" style={{ textAlign: 'center' }}>
              {mode === 'login' && t('auth.login.subtitle')}
              {mode === 'register' && t('auth.register.subtitle')}
              {mode === 'forgot-password' && t('auth.forgotPassword.subtitle')}
            </Typography>
          </Stack>
        </CardHeader>
        
        <CardContent>
          <Form onSubmit={handleSubmit}>
            <Stack direction="vertical" gap="lg">
              {mode === 'register' && (
                <Input
                  name="name"
                  label={t('auth.fields.name')}
                  placeholder={t('auth.fields.namePlaceholder')}
                  required
                />
              )}
              
              <Input
                name="email"
                type="email"
                label={t('auth.fields.email')}
                placeholder={t('auth.fields.emailPlaceholder')}
                required
              />
              
              {mode !== 'forgot-password' && (
                <Input
                  name="password"
                  type="password"
                  label={t('auth.fields.password')}
                  placeholder={t('auth.fields.passwordPlaceholder')}
                  required
                />
              )}
              
              {mode === 'register' && (
                <Input
                  name="confirmPassword"
                  type="password"
                  label={t('auth.fields.confirmPassword')}
                  placeholder={t('auth.fields.confirmPasswordPlaceholder')}
                  required
                />
              )}
              
              <Button 
                type="submit" 
                variant="primary" 
                size="lg" 
                loading={loading}
                style={{ width: '100%' }}
              >
                {mode === 'login' && t('auth.login.submit')}
                {mode === 'register' && t('auth.register.submit')}
                {mode === 'forgot-password' && t('auth.forgotPassword.submit')}
              </Button>
              
              <Divider />
              
              <Stack direction="vertical" gap="sm" align="center">
                {mode === 'login' && (
                  <>
                    <Button 
                      variant="ghost" 
                      size="sm"
                      onClick={() => onModeChange?.('forgot-password')}
                    >
                      {t('auth.login.forgotPassword')}
                    </Button>
                    <Typography variant="body" color="muted">
                      {t('auth.login.noAccount')}{' '}
                      <Button 
                        variant="ghost" 
                        size="sm"
                        onClick={() => onModeChange?.('register')}
                        style={{ padding: 0, height: 'auto' }}
                      >
                        {t('auth.login.signUp')}
                      </Button>
                    </Typography>
                  </>
                )}
                
                {mode === 'register' && (
                  <Typography variant="body" color="muted">
                    {t('auth.register.hasAccount')}{' '}
                    <Button 
                      variant="ghost" 
                      size="sm"
                      onClick={() => onModeChange?.('login')}
                      style={{ padding: 0, height: 'auto' }}
                    >
                      {t('auth.register.signIn')}
                    </Button>
                  </Typography>
                )}
                
                {mode === 'forgot-password' && (
                  <Button 
                    variant="ghost" 
                    size="sm"
                    onClick={() => onModeChange?.('login')}
                  >
                    {t('auth.forgotPassword.backToLogin')}
                  </Button>
                )}
              </Stack>
            </Stack>
          </Form>
        </CardContent>
      </Card>
    </Container>
  );
}`;
  }

  // Add other page template generators here (profile, settings, etc.)
  private generateProfilePage(config: PageTemplateConfig): string {
    return `// Profile page template - implementation would go here`;
  }

  private generateSettingsPage(config: PageTemplateConfig): string {
    return `// Settings page template - implementation would go here`;
  }

  private generateAnalyticsPage(config: PageTemplateConfig): string {
    return `// Analytics page template - implementation would go here`;
  }

  private generateUserManagementPage(config: PageTemplateConfig): string {
    return `// User management page template - implementation would go here`;
  }

  private generateContentManagementPage(config: PageTemplateConfig): string {
    return `// Content management page template - implementation would go here`;
  }

  private generateECommercePage(config: PageTemplateConfig): string {
    return `// E-commerce page template - implementation would go here`;
  }

  private generateBlogPage(config: PageTemplateConfig): string {
    return `// Blog page template - implementation would go here`;
  }

  private toPascalCase(str: string): string {
    return str
      .replace(/(?:^\w|[A-Z]|\b\w)/g, (word, index) => {
        return index === 0 ? word.toLowerCase() : word.toUpperCase();
      })
      .replace(/\s+/g, '')
      .replace(/^./, str => str.toUpperCase());
  }
}
