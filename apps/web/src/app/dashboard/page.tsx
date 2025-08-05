'use client';

import React from 'react';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { AIAssistantPanel } from '@/components/ai-assistant/AIAssistantPanel';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { NSMBadge } from '@/components/ui/nsm-badge';
import { useWebSocketStore, sendGenerationRequest } from '@/services/websocket-service';

interface MetricCardProps {
  readonly title: string;
  readonly value: string | number;
  readonly change?: string;
  readonly icon: string;
}

function MetricCard({ title, value, change, icon }: MetricCardProps): JSX.Element {
  return (
    <Card className="p-6">
      <div className="flex items-center justify-between">
        <div className="space-y-1">
          <p className="text-sm text-muted-foreground">{title}</p>
          <p className="text-2xl font-semibold">{value}</p>
          {change && (
            <p className={`text-sm ${change.startsWith('+') ? 'text-green-600' : 'text-red-600'}`}>
              {change} from last week
            </p>
          )}
        </div>
        <span className="text-3xl opacity-20" aria-hidden="true">{icon}</span>
      </div>
    </Card>
  );
}

export default function DashboardPage(): JSX.Element {
  const { isConnected, connectionStatus, generationProgress } = useWebSocketStore();

  const handleGenerate = (config: any) => {
    sendGenerationRequest(config);
  };

  return (
    <DashboardLayout>
      <div className="space-y-8">
        {/* Header */}
        <div className="space-y-2">
          <h1 className="text-3xl font-bold">Xaheen CLI Ecosystem Dashboard</h1>
          <p className="text-muted-foreground">
            AI-Native Development Platform with Norwegian Compliance
          </p>
        </div>

        {/* Connection Status */}
        <div className="flex items-center gap-4 p-4 rounded-lg bg-neutral-100 dark:bg-neutral-800">
          <span className={`w-3 h-3 rounded-full ${isConnected ? 'bg-green-500' : 'bg-red-500'}`} />
          <span className="text-sm font-medium">
            MCP Server Status: {connectionStatus === 'connected' ? 'Connected' : 'Disconnected'}
          </span>
          {connectionStatus === 'connected' && (
            <span className="text-sm text-muted-foreground">wss://mcp.xaheen.no/v1</span>
          )}
        </div>

        {/* Metrics Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <MetricCard
            title="Total Projects"
            value="156"
            change="+12.5%"
            icon="📁"
          />
          <MetricCard
            title="Components Generated"
            value="3,847"
            change="+23.1%"
            icon="🧩"
          />
          <MetricCard
            title="Active Platforms"
            value="7/7"
            icon="🎯"
          />
          <MetricCard
            title="Templates Available"
            value="191"
            change="+8"
            icon="📋"
          />
        </div>

        {/* Recent Activity & Quick Actions */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Recent Activity */}
          <Card className="lg:col-span-2 p-6">
            <h2 className="text-xl font-semibold mb-4">Recent Activity</h2>
            <div className="space-y-3">
              {[
                { time: '2 min ago', action: 'Generated UserManagement component', platform: 'Next.js', nsm: 'RESTRICTED' },
                { time: '15 min ago', action: 'Created BankID authentication flow', platform: 'React', nsm: 'CONFIDENTIAL' },
                { time: '1 hour ago', action: 'Updated Altinn integration', platform: 'Vue', nsm: 'RESTRICTED' },
                { time: '2 hours ago', action: 'Generated admin dashboard', platform: 'Angular', nsm: 'OPEN' },
                { time: '3 hours ago', action: 'Created data table with NSM compliance', platform: 'Svelte', nsm: 'SECRET' }
              ].map((activity, index) => (
                <div key={index} className="flex items-center justify-between p-3 rounded-lg hover:bg-neutral-100 dark:hover:bg-neutral-800">
                  <div className="space-y-1">
                    <p className="text-sm font-medium">{activity.action}</p>
                    <p className="text-xs text-muted-foreground">{activity.time} • {activity.platform}</p>
                  </div>
                  <NSMBadge classification={activity.nsm as any} size="sm" />
                </div>
              ))}
            </div>
          </Card>

          {/* Quick Actions */}
          <Card className="p-6">
            <h2 className="text-xl font-semibold mb-4">Quick Actions</h2>
            <div className="space-y-3">
              <Button variant="outline" size="lg" fullWidth>
                🆕 New Project
              </Button>
              <Button variant="outline" size="lg" fullWidth>
                🧩 Generate Component
              </Button>
              <Button variant="outline" size="lg" fullWidth>
                📊 View Analytics
              </Button>
              <Button variant="outline" size="lg" fullWidth>
                🏪 Browse Marketplace
              </Button>
              <Button variant="norway" size="lg" fullWidth>
                🇳🇴 Norwegian Setup
              </Button>
            </div>
          </Card>
        </div>

        {/* AI Assistant Panel */}
        <AIAssistantPanel onGenerate={handleGenerate} />

        {/* Generation Progress */}
        {generationProgress.status !== 'idle' && (
          <Card className="p-6">
            <h3 className="text-lg font-semibold mb-4">Generation Progress</h3>
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-sm">{generationProgress.message}</span>
                <span className="text-sm font-medium">{generationProgress.progress}%</span>
              </div>
              <div className="w-full bg-neutral-200 rounded-full h-2">
                <div 
                  className="bg-primary h-2 rounded-full transition-all duration-300"
                  style={{ width: `${generationProgress.progress}%` }}
                />
              </div>
              {generationProgress.generatedFiles && generationProgress.generatedFiles.length > 0 && (
                <div className="mt-4">
                  <p className="text-sm font-medium mb-2">Generated Files:</p>
                  <div className="space-y-1">
                    {generationProgress.generatedFiles.map((file, index) => (
                      <div key={index} className="text-sm text-muted-foreground">
                        ✅ {file}
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </Card>
        )}

        {/* Platform Status */}
        <Card className="p-6">
          <h2 className="text-xl font-semibold mb-4">Platform Support Status</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-7 gap-4">
            {[
              { name: 'Next.js', icon: '▲', status: 'active' },
              { name: 'React', icon: '⚛️', status: 'active' },
              { name: 'Vue', icon: '🟢', status: 'active' },
              { name: 'Angular', icon: '🔴', status: 'active' },
              { name: 'Svelte', icon: '🟠', status: 'active' },
              { name: 'Electron', icon: '🖥️', status: 'active' },
              { name: 'React Native', icon: '📱', status: 'active' }
            ].map(platform => (
              <div key={platform.name} className="text-center p-4 rounded-lg border hover:shadow-md transition-shadow">
                <span className="text-3xl block mb-2" aria-hidden="true">{platform.icon}</span>
                <p className="text-sm font-medium">{platform.name}</p>
                <p className="text-xs text-green-600 mt-1">✓ Active</p>
              </div>
            ))}
          </div>
        </Card>
      </div>
    </DashboardLayout>
  );
}