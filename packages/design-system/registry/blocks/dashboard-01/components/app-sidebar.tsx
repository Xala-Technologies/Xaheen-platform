/**
 * App Sidebar Component - Navigation sidebar for dashboard
 * WCAG AAA compliant with keyboard navigation
 * Norwegian language labels and NSM classification support
 */

import React from 'react';
import { cn } from '@/utils/cn';
import { Button } from '@/components/button';
import { useAccessibility } from '@/hooks/use-accessibility';

interface NavItem {
  readonly id: string;
  readonly label: string;
  readonly icon: React.ReactNode;
  readonly href: string;
  readonly badge?: string | number;
  readonly nsmClassification?: 'OPEN' | 'RESTRICTED' | 'CONFIDENTIAL' | 'SECRET';
}

const navItems: NavItem[] = [
  {
    id: 'dashboard',
    label: 'Oversikt',
    href: '/dashboard',
    icon: (
      <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
      </svg>
    )
  },
  {
    id: 'users',
    label: 'Brukere',
    href: '/users',
    badge: 12,
    icon: (
      <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
      </svg>
    )
  },
  {
    id: 'analytics',
    label: 'Analyser',
    href: '/analytics',
    nsmClassification: 'RESTRICTED',
    icon: (
      <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
      </svg>
    )
  },
  {
    id: 'settings',
    label: 'Innstillinger',
    href: '/settings',
    icon: (
      <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
      </svg>
    )
  }
];

interface AppSidebarProps {
  readonly className?: string;
  readonly collapsed?: boolean;
  readonly onCollapsedChange?: (collapsed: boolean) => void;
}

export const AppSidebar: React.FC<AppSidebarProps> = ({ 
  className, 
  collapsed = false,
  onCollapsedChange 
}) => {
  const [currentPath, setCurrentPath] = React.useState('/dashboard');
  const [_, { getAriaLabel }] = useAccessibility();

  return (
    <aside
      className={cn(
        'flex flex-col h-full bg-card border-r border-border transition-all duration-300',
        collapsed ? 'w-16' : 'w-64',
        className
      )}
      aria-label={getAriaLabel('navigation')}
    >
      {/* Logo/Brand */}
      <div className="flex items-center h-16 px-4 border-b border-border">
        <div className="flex items-center gap-3">
          <div className="h-8 w-8 rounded-lg bg-primary flex items-center justify-center text-primary-foreground font-bold">
            X
          </div>
          {!collapsed && (
            <span className="font-semibold text-lg">Xaheen</span>
          )}
        </div>
      </div>

      {/* Navigation */}
      <nav 
        className="flex-1 p-4 space-y-2"
        role="navigation"
        aria-label="Hovednavigasjon"
      >
        {navItems.map((item) => {
          const isActive = currentPath === item.href;
          
          return (
            <Button
              key={item.id}
              variant={isActive ? 'secondary' : 'ghost'}
              className={cn(
                'w-full justify-start gap-3 relative',
                collapsed && 'justify-center px-2'
              )}
              onClick={() => setCurrentPath(item.href)}
              aria-current={isActive ? 'page' : undefined}
              aria-label={collapsed ? item.label : undefined}
              nsmClassification={item.nsmClassification}
            >
              {item.icon}
              {!collapsed && (
                <>
                  <span className="flex-1 text-left">{item.label}</span>
                  {item.badge && (
                    <span className="inline-flex items-center justify-center h-5 px-2 text-xs font-medium bg-primary text-primary-foreground rounded-full">
                      {item.badge}
                    </span>
                  )}
                </>
              )}
            </Button>
          );
        })}
      </nav>

      {/* User Section */}
      <div className="p-4 border-t border-border">
        <Button
          variant="ghost"
          className={cn(
            'w-full justify-start gap-3',
            collapsed && 'justify-center px-2'
          )}
          aria-label={collapsed ? 'Brukermeny' : undefined}
        >
          <div className="h-8 w-8 rounded-full bg-muted" />
          {!collapsed && (
            <div className="flex-1 text-left">
              <p className="text-sm font-medium">Ola Nordmann</p>
              <p className="text-xs text-muted-foreground">ola@example.no</p>
            </div>
          )}
        </Button>
      </div>

      {/* Collapse Toggle */}
      <div className="p-4 border-t border-border">
        <Button
          variant="ghost"
          size="icon"
          onClick={() => onCollapsedChange?.(!collapsed)}
          aria-label={collapsed ? 'Utvid sidemeny' : 'Kollaps sidemeny'}
          className="w-full"
        >
          <svg 
            className={cn('h-5 w-5 transition-transform', collapsed && 'rotate-180')} 
            fill="none" 
            viewBox="0 0 24 24" 
            stroke="currentColor"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 19l-7-7 7-7m8 14l-7-7 7-7" />
          </svg>
        </Button>
      </div>
    </aside>
  );
};