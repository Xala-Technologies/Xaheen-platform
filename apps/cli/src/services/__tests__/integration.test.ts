import { describe, it, expect } from 'vitest';
import { ServiceRegistry } from '../registry/core/enhanced-service-registry';
import { loadBundles, getBundle } from '../registry/bundles';
import { BundleResolver } from '../registry/bundles/bundle-resolver';
import { XalaValidator } from '../ui-compliance/XalaValidator';
import { FragmentRegistry } from '../templates/fragments/fragment-registry';

describe('CLI Restructuring Integration Tests', () => {
  describe('Service Registry Integration', () => {
    it('should load and validate service definitions', async () => {
      const registry = new ServiceRegistry();
      
      // Test loading a service
      const stripeService = await registry.getService('payment', 'stripe');
      expect(stripeService).toBeDefined();
      expect(stripeService?.id).toBe('stripe');
      expect(stripeService?.dependencies.server).toContain('stripe');
    });

    it('should handle service metadata correctly', async () => {
      const registry = new ServiceRegistry();
      
      // Test metadata operations
      await registry.updateMetadata('payment', 'stripe', {
        lastUsed: new Date(),
        usageCount: 1
      });
      
      const metadata = await registry.getMetadata('payment', 'stripe');
      expect(metadata?.usageCount).toBe(1);
    });
  });

  describe('Bundle System Integration', () => {
    it('should load and resolve SaaS bundles', async () => {
      const bundles = await loadBundles();
      expect(bundles.length).toBeGreaterThan(0);
      
      const saasStarter = getBundle('saas-starter');
      expect(saasStarter).toBeDefined();
      expect(saasStarter?.services.core).toContain('postgres');
      expect(saasStarter?.services.auth).toContain('better-auth');
    });

    it('should resolve bundle dependencies correctly', async () => {
      const resolver = new BundleResolver();
      const result = await resolver.resolveBundle('saas-professional');
      
      expect(result.services.length).toBeGreaterThan(10);
      expect(result.deploymentPlan).toBeDefined();
      expect(result.deploymentPlan.steps.length).toBeGreaterThan(0);
    });

    it('should detect bundle conflicts', async () => {
      const resolver = new BundleResolver();
      
      // Test conflicting services
      const conflicts = await resolver.checkCompatibility([
        { category: 'auth', id: 'better-auth' },
        { category: 'auth', id: 'clerk' } // Should conflict
      ]);
      
      expect(conflicts.length).toBeGreaterThan(0);
    });
  });

  describe('UI Compliance Integration', () => {
    it('should validate Xala v5 compliance', () => {
      const validator = new XalaValidator();
      
      // Test valid component
      const validComponent = `
import { Stack, Text, Button } from '@xala-technologies/ui-system';

export const MyComponent = (): JSX.Element => {
  const { t } = useTranslation();
  
  return (
    <Stack spacing="4">
      <Text variant="heading">{t('welcome.title')}</Text>
      <Button variant="primary" onClick={() => {}}>
        {t('button.submit')}
      </Button>
    </Stack>
  );
};`;
      
      const validResult = validator.validateComponent(validComponent, 'MyComponent.tsx');
      expect(validResult.violations.length).toBe(0);
      
      // Test invalid component
      const invalidComponent = `
export const BadComponent = () => {
  return (
    <div style={{ padding: '16px' }}>
      <h1>Hardcoded Title</h1>
      <button className="bg-blue-500">Click me</button>
    </div>
  );
};`;
      
      const invalidResult = validator.validateComponent(invalidComponent, 'BadComponent.tsx');
      expect(invalidResult.violations.length).toBeGreaterThan(0);
      expect(invalidResult.violations.some(v => v.rule === 'no-raw-html')).toBe(true);
      expect(invalidResult.violations.some(v => v.rule === 'no-hardcoded-text')).toBe(true);
    });
  });

  describe('Fragment System Integration', () => {
    it('should compose fragments correctly', async () => {
      const registry = new FragmentRegistry();
      
      // Test fragment composition
      const authFragment = await registry.getFragment('auth', 'providers/oauth-base');
      expect(authFragment).toBeDefined();
      
      const context = {
        projectName: 'test-app',
        auth: 'better-auth',
        uiSystem: 'xala'
      };
      
      const composed = await registry.composeFragments(['auth/providers/oauth-base'], context);
      expect(composed).toContain('OAuthProvider');
    });
  });

  describe('End-to-End SaaS Creation', () => {
    it('should create a complete SaaS project with all services', async () => {
      const resolver = new BundleResolver();
      const validator = new XalaValidator();
      
      // Simulate SaaS project creation
      const bundle = await resolver.resolveBundle('saas-professional');
      
      // Validate all services are included
      expect(bundle.services.some(s => s.category === 'database')).toBe(true);
      expect(bundle.services.some(s => s.category === 'auth')).toBe(true);
      expect(bundle.services.some(s => s.category === 'payment')).toBe(true);
      expect(bundle.services.some(s => s.category === 'cache')).toBe(true);
      expect(bundle.services.some(s => s.category === 'notification')).toBe(true);
      
      // Validate deployment instructions
      expect(bundle.deploymentPlan.preChecks.length).toBeGreaterThan(0);
      expect(bundle.deploymentPlan.postChecks.length).toBeGreaterThan(0);
      
      // Validate UI compliance for generated components
      const mockGeneratedComponent = `
import { Stack, Card, Text } from '@xala-technologies/ui-system';
import { useTranslation } from 'react-i18next';

export const Dashboard = (): JSX.Element => {
  const { t } = useTranslation();
  
  return (
    <Stack spacing="8">
      <Card variant="elevated">
        <Text variant="heading">{t('dashboard.title')}</Text>
      </Card>
    </Stack>
  );
};`;
      
      const complianceResult = validator.validateComponent(mockGeneratedComponent, 'Dashboard.tsx');
      expect(complianceResult.isValid).toBe(true);
    });
  });
});