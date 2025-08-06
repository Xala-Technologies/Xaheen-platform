/**
 * Dashboard Content Component
 * Main content area for dashboard layouts
 */

import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../../../components/card/card';
import { Button } from '../../../components/button/button';

export interface DashboardContentProps {
  readonly className?: string;
}

export const DashboardContent: React.FC<DashboardContentProps> = ({
  className
}) => {
  return (
    <div className={className}>
      {/* Recent Activity */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        <Card>
          <CardHeader>
            <CardTitle>Siste aktivitet</CardTitle>
            <CardDescription>Oversikt over nylige handlinger</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {[
                { action: 'Dokument opprettet', time: '2 timer siden', user: 'Ola Nordmann' },
                { action: 'Bruker logget inn', time: '3 timer siden', user: 'Kari Hansen' },
                { action: 'Rapport generert', time: '5 timer siden', user: 'System' },
                { action: 'Backup fullført', time: '8 timer siden', user: 'System' }
              ].map((item, index) => (
                <div key={index} className="flex items-center justify-between p-3 rounded-lg bg-muted/50">
                  <div>
                    <p className="text-sm font-medium">{item.action}</p>
                    <p className="text-xs text-muted-foreground">{item.user}</p>
                  </div>
                  <span className="text-xs text-muted-foreground">{item.time}</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Systemstatus</CardTitle>
            <CardDescription>Oversikt over systemytelse</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {[
                { metric: 'CPU-bruk', value: '23%', status: 'normal' },
                { metric: 'Minnebruk', value: '67%', status: 'warning' },
                { metric: 'Diskplass', value: '45%', status: 'normal' },
                { metric: 'Nettverkstrafikk', value: '12 MB/s', status: 'normal' }
              ].map((item, index) => (
                <div key={index} className="flex items-center justify-between">
                  <span className="text-sm">{item.metric}</span>
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-medium">{item.value}</span>
                    <div 
                      className={`h-2 w-2 rounded-full ${
                        item.status === 'normal' ? 'bg-green-500' : 
                        item.status === 'warning' ? 'bg-yellow-500' : 'bg-red-500'
                      }`}
                    />
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Quick Actions */}
      <Card>
        <CardHeader>
          <CardTitle>Hurtighandlinger</CardTitle>
          <CardDescription>Vanlige oppgaver og snarveier</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {[
              { label: 'Ny bruker', icon: '👤' },
              { label: 'Generer rapport', icon: '📊' },
              { label: 'Backup data', icon: '💾' },
              { label: 'Innstillinger', icon: '⚙️' }
            ].map((action, index) => (
              <Button
                key={index}
                variant="outline"
                className="h-20 flex-col gap-2"
              >
                <span className="text-2xl">{action.icon}</span>
                <span className="text-sm">{action.label}</span>
              </Button>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};