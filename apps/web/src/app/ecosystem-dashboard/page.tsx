/**
 * Xaheen Ecosystem Dashboard Page
 * Using @xala-technologies/ui-system components
 * Based on UX Design from @ux-design/XAHEEN_ECOSYSTEM_WIREFRAMES.md
 */

import { 
  Button, 
  Card, 
  Stack, 
  Typography,
  Badge,
  Container
} from "@xala-technologies/ui-system";
import { 
  LayoutDashboard, 
  Terminal, 
  Package, 
  Store, 
  Key, 
  Bot, 
  Globe, 
  Settings,
  Activity,
  Shield,
  Code,
  Zap
} from 'lucide-react';

export default function EcosystemDashboardPage(): JSX.Element {
  // Dashboard metrics data
  const metrics = [
    { 
      id: 'projects', 
      label: 'Active Projects', 
      value: '24', 
      change: '+12%', 
      trend: 'up', 
      icon: <Code className="h-6 w-6" /> 
    },
    { 
      id: 'components', 
      label: 'Components', 
      value: '1,482', 
      change: '+23%', 
      trend: 'up', 
      icon: <Package className="h-6 w-6" /> 
    },
    { 
      id: 'performance', 
      label: 'Performance', 
      value: '98.5%', 
      change: '+2.1%', 
      trend: 'up', 
      icon: <Zap className="h-6 w-6" /> 
    },
    { 
      id: 'compliance', 
      label: 'NSM Compliance', 
      value: '100%', 
      trend: 'neutral', 
      icon: <Shield className="h-6 w-6" /> 
    }
  ];

  const navigationItems = [
    { id: 'overview', label: 'Overview', icon: <LayoutDashboard className="h-5 w-5" />, href: '/dashboard' },
    { id: 'cli', label: 'CLI Tool', icon: <Terminal className="h-5 w-5" />, href: '/cli', badge: 'v6.2.0' },
    { id: 'packages', label: 'Packages', icon: <Package className="h-5 w-5" />, href: '/packages', badge: '7' },
    { id: 'marketplace', label: 'Marketplace', icon: <Store className="h-5 w-5" />, href: '/marketplace' },
    { id: 'licenses', label: 'Licenses', icon: <Key className="h-5 w-5" />, href: '/licenses' },
    { id: 'ai-agent', label: 'AI Agent', icon: <Bot className="h-5 w-5" />, href: '/ai-agent' },
    { id: 'mcp-server', label: 'MCP Server', icon: <Globe className="h-5 w-5" />, href: '/mcp-server', badge: 'Active' },
    { id: 'settings', label: 'Settings', icon: <Settings className="h-5 w-5" />, href: '/settings' }
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      <Container className="py-8">
        {/* Page Header */}
        <Stack spacing="lg" className="mb-8">
          <Typography variant="h1" className="text-4xl font-bold">
            Xaheen Ecosystem Dashboard
          </Typography>
          <Typography variant="body1" className="text-gray-600">
            Welcome to your complete development ecosystem control center
          </Typography>
        </Stack>

        {/* Metrics Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {metrics.map((metric) => (
            <Card key={metric.id} className="p-6">
              <Stack spacing="md">
                <div className="flex items-center justify-between">
                  <div className="p-3 bg-blue-50 rounded-lg text-blue-600">
                    {metric.icon}
                  </div>
                  {metric.change && (
                    <Typography 
                      variant="caption" 
                      className={
                        metric.trend === 'up' ? 'text-green-600' : 
                        metric.trend === 'down' ? 'text-red-600' : 
                        'text-gray-600'
                      }
                    >
                      {metric.change}
                    </Typography>
                  )}
                </div>
                <div>
                  <Typography variant="h2" className="text-2xl font-bold">
                    {metric.value}
                  </Typography>
                  <Typography variant="body2" className="text-gray-600">
                    {metric.label}
                  </Typography>
                </div>
              </Stack>
            </Card>
          ))}
        </div>

        {/* Main Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Navigation */}
          <Card className="lg:col-span-1 p-6">
            <Typography variant="h3" className="text-xl font-bold mb-6">
              Navigation
            </Typography>
            <Stack spacing="sm">
              {navigationItems.map((item) => (
                <Button
                  key={item.id}
                  variant="ghost"
                  size="lg"
                  className="w-full justify-start"
                  leftIcon={item.icon}
                >
                  <span className="flex-1 text-left">{item.label}</span>
                  {item.badge && (
                    <Badge variant="primary" size="sm">
                      {item.badge}
                    </Badge>
                  )}
                </Button>
              ))}
            </Stack>
          </Card>

          {/* Recent Activity */}
          <Card className="lg:col-span-2 p-6">
            <Typography variant="h3" className="text-xl font-bold mb-6">
              Recent Activity
            </Typography>
            <Stack spacing="md">
              <div className="flex items-center gap-4 p-4 rounded-lg hover:bg-gray-50">
                <Activity className="h-5 w-5 text-blue-600" />
                <div className="flex-1">
                  <Typography variant="body1" className="font-medium">
                    New component generated
                  </Typography>
                  <Typography variant="body2" className="text-gray-600">
                    Button component for Next.js project
                  </Typography>
                </div>
                <Typography variant="caption" className="text-gray-500">
                  2 min ago
                </Typography>
              </div>
              <div className="flex items-center gap-4 p-4 rounded-lg hover:bg-gray-50">
                <Package className="h-5 w-5 text-green-600" />
                <div className="flex-1">
                  <Typography variant="body1" className="font-medium">
                    Package published
                  </Typography>
                  <Typography variant="body2" className="text-gray-600">
                    @xaheen/ui-components v1.2.0
                  </Typography>
                </div>
                <Typography variant="caption" className="text-gray-500">
                  1 hour ago
                </Typography>
              </div>
              <div className="flex items-center gap-4 p-4 rounded-lg hover:bg-gray-50">
                <Bot className="h-5 w-5 text-purple-600" />
                <div className="flex-1">
                  <Typography variant="body1" className="font-medium">
                    AI Agent completed task
                  </Typography>
                  <Typography variant="body2" className="text-gray-600">
                    Generated 15 test cases for authentication module
                  </Typography>
                </div>
                <Typography variant="caption" className="text-gray-500">
                  3 hours ago
                </Typography>
              </div>
            </Stack>
          </Card>
        </div>

        {/* Quick Actions */}
        <Card className="mt-6 p-6">
          <Typography variant="h3" className="text-xl font-bold mb-6">
            Quick Actions
          </Typography>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Button size="lg" leftIcon={<Terminal className="h-5 w-5" />}>
              Open CLI
            </Button>
            <Button size="lg" variant="secondary" leftIcon={<Package className="h-5 w-5" />}>
              Create Component
            </Button>
            <Button size="lg" variant="outline" leftIcon={<Bot className="h-5 w-5" />}>
              Launch AI Agent
            </Button>
          </div>
        </Card>

        {/* Norwegian Compliance Status */}
        <Card className="mt-6 p-6">
          <Typography variant="h3" className="text-xl font-bold mb-6">
            Norwegian Compliance Status
          </Typography>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div>
              <Typography variant="body2" className="text-gray-600 mb-2">
                NSM Classification
              </Typography>
              <Badge variant="success" size="lg">OPEN</Badge>
            </div>
            <div>
              <Typography variant="body2" className="text-gray-600 mb-2">
                WCAG Level
              </Typography>
              <Typography variant="h4" className="text-lg font-semibold">
                AAA
              </Typography>
            </div>
            <div>
              <Typography variant="body2" className="text-gray-600 mb-2">
                GDPR Status
              </Typography>
              <Typography variant="h4" className="text-lg font-semibold text-green-600">
                Compliant
              </Typography>
            </div>
          </div>
        </Card>
      </Container>
    </div>
  );
}