import React, { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';

interface NavItem {
  readonly id: string;
  readonly label: string;
  readonly icon: string;
  readonly href: string;
  readonly badge?: string | number;
}

interface DashboardLayoutProps {
  readonly children: React.ReactNode;
}

const navigationItems: readonly NavItem[] = [
  { id: 'dashboard', label: 'Dashboard', icon: '🏠', href: '/dashboard' },
  { id: 'ai', label: 'AI Assistant', icon: '🤖', href: '/dashboard/ai' },
  { id: 'cli', label: 'CLI Tool', icon: '🛠️', href: '/dashboard/cli' },
  { id: 'web', label: 'Web Dashboard', icon: '🌐', href: '/dashboard/web' },
  { id: 'admin', label: 'Admin Portal', icon: '👥', href: '/dashboard/admin' },
  { id: 'mcp', label: 'MCP Server', icon: '🔧', href: '/dashboard/mcp' },
  { id: 'marketplace', label: 'Marketplace', icon: '🏪', href: '/dashboard/marketplace', badge: 47 },
  { id: 'norwegian', label: 'Norwegian', icon: '🇳🇴', href: '/dashboard/norwegian' },
  { id: 'licensing', label: 'Licensing', icon: '🔑', href: '/dashboard/licensing' },
  { id: 'analytics', label: 'Analytics', icon: '🎯', href: '/dashboard/analytics' }
];

const quickActions = [
  { id: 'new', label: 'New Project', icon: '🆕' },
  { id: 'generate', label: 'Generate Code', icon: '📝' },
  { id: 'test', label: 'Run Tests', icon: '🧪' },
  { id: 'report', label: 'View Reports', icon: '📊' }
];

const platformStatus = [
  { id: 'react', name: 'React', status: '✅ 100%' },
  { id: 'nextjs', name: 'Next.js', status: '✅ 100%' },
  { id: 'vue', name: 'Vue', status: '✅ 100%' },
  { id: 'angular', name: 'Angular', status: '✅ 100%' }
];

export function DashboardLayout({ children }: DashboardLayoutProps): JSX.Element {
  const pathname = usePathname();
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  return (
    <div className="min-h-screen bg-neutral-50 dark:bg-neutral-900">
      {/* Header */}
      <header className="fixed top-0 left-0 right-0 z-50 h-16 bg-white dark:bg-neutral-900 border-b border-neutral-200 dark:border-neutral-800">
        <div className="flex items-center justify-between h-full px-4 lg:px-6">
          {/* Logo and Search */}
          <div className="flex items-center gap-4 flex-1">
            <button
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="lg:hidden p-2 hover:bg-neutral-100 dark:hover:bg-neutral-800 rounded-lg"
              aria-label="Toggle mobile menu"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              </svg>
            </button>
            
            <Link href="/" className="flex items-center gap-2">
              <span className="text-2xl" aria-hidden="true">🚀</span>
              <span className="font-bold text-xl">Xaheen</span>
            </Link>
            
            <div className="hidden lg:flex items-center flex-1 max-w-xl">
              <div className="relative w-full">
                <input
                  type="search"
                  placeholder="Search projects, docs, commands... (⌘K)"
                  className="w-full h-10 pl-10 pr-4 bg-neutral-100 dark:bg-neutral-800 border-transparent rounded-lg focus:outline-none focus:ring-2 focus:ring-ring"
                  aria-label="Global search"
                />
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-neutral-500" aria-hidden="true">
                  🔍
                </span>
              </div>
            </div>
          </div>
          
          {/* User Actions */}
          <div className="flex items-center gap-2">
            <Button variant="ghost" size="icon" aria-label="Notifications">
              🔔
            </Button>
            <Button variant="ghost" size="icon" aria-label="Analytics">
              📊
            </Button>
            <Button variant="ghost" size="icon" aria-label="User profile">
              👤
            </Button>
          </div>
        </div>
      </header>

      <div className="flex pt-16">
        {/* Sidebar - Desktop */}
        <aside
          className={cn(
            "hidden lg:block fixed left-0 top-16 bottom-0 bg-white dark:bg-neutral-900 border-r border-neutral-200 dark:border-neutral-800 transition-all duration-300",
            isSidebarOpen ? "w-80" : "w-20"
          )}
        >
          <div className="flex flex-col h-full p-4">
            {/* Navigation */}
            <nav className="flex-1 space-y-1">
              <h2 className={cn("text-xs font-semibold text-neutral-500 uppercase tracking-wider mb-2", !isSidebarOpen && "sr-only")}>
                Navigation
              </h2>
              {navigationItems.map((item) => (
                <Link
                  key={item.id}
                  href={item.href}
                  className={cn(
                    "flex items-center gap-3 px-3 py-2 rounded-lg transition-colors",
                    pathname === item.href
                      ? "bg-primary/10 text-primary"
                      : "hover:bg-neutral-100 dark:hover:bg-neutral-800",
                    !isSidebarOpen && "justify-center"
                  )}
                >
                  <span className="text-xl flex-shrink-0" aria-hidden="true">{item.icon}</span>
                  {isSidebarOpen && (
                    <>
                      <span className="flex-1">{item.label}</span>
                      {item.badge && (
                        <span className="px-2 py-0.5 text-xs bg-primary/10 text-primary rounded-full">
                          {item.badge}
                        </span>
                      )}
                    </>
                  )}
                </Link>
              ))}
            </nav>

            {/* Quick Actions */}
            {isSidebarOpen && (
              <div className="mt-6 mb-4">
                <h2 className="text-xs font-semibold text-neutral-500 uppercase tracking-wider mb-2">
                  Quick Actions
                </h2>
                <div className="space-y-1">
                  {quickActions.map((action) => (
                    <button
                      key={action.id}
                      className="flex items-center gap-3 w-full px-3 py-2 text-left rounded-lg hover:bg-neutral-100 dark:hover:bg-neutral-800 transition-colors"
                    >
                      <span className="text-xl" aria-hidden="true">{action.icon}</span>
                      <span>{action.label}</span>
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Platform Status */}
            {isSidebarOpen && (
              <div className="mb-4">
                <h2 className="text-xs font-semibold text-neutral-500 uppercase tracking-wider mb-2">
                  Platform Status
                </h2>
                <div className="space-y-1">
                  {platformStatus.map((platform) => (
                    <div key={platform.id} className="flex items-center justify-between px-3 py-1">
                      <span className="text-sm">{platform.name}</span>
                      <span className="text-xs font-medium">{platform.status}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Sidebar Toggle */}
            <button
              onClick={() => setIsSidebarOpen(!isSidebarOpen)}
              className="flex items-center justify-center w-full h-10 mt-auto rounded-lg hover:bg-neutral-100 dark:hover:bg-neutral-800 transition-colors"
              aria-label={isSidebarOpen ? "Collapse sidebar" : "Expand sidebar"}
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d={isSidebarOpen ? "M11 19l-7-7 7-7m8 14l-7-7 7-7" : "M13 5l7 7-7 7M5 5l7 7-7 7"}
                />
              </svg>
            </button>
          </div>
        </aside>

        {/* Mobile Menu */}
        {isMobileMenuOpen && (
          <div className="fixed inset-0 z-40 lg:hidden">
            <div className="fixed inset-0 bg-black/50" onClick={() => setIsMobileMenuOpen(false)} />
            <aside className="fixed left-0 top-16 bottom-0 w-80 bg-white dark:bg-neutral-900 border-r border-neutral-200 dark:border-neutral-800">
              <div className="flex flex-col h-full p-4">
                <nav className="flex-1 space-y-1">
                  {navigationItems.map((item) => (
                    <Link
                      key={item.id}
                      href={item.href}
                      onClick={() => setIsMobileMenuOpen(false)}
                      className={cn(
                        "flex items-center gap-3 px-3 py-2 rounded-lg transition-colors",
                        pathname === item.href
                          ? "bg-primary/10 text-primary"
                          : "hover:bg-neutral-100 dark:hover:bg-neutral-800"
                      )}
                    >
                      <span className="text-xl" aria-hidden="true">{item.icon}</span>
                      <span className="flex-1">{item.label}</span>
                      {item.badge && (
                        <span className="px-2 py-0.5 text-xs bg-primary/10 text-primary rounded-full">
                          {item.badge}
                        </span>
                      )}
                    </Link>
                  ))}
                </nav>
              </div>
            </aside>
          </div>
        )}

        {/* Main Content */}
        <main className={cn(
          "flex-1 p-6 lg:p-8 transition-all duration-300",
          isSidebarOpen ? "lg:ml-80" : "lg:ml-20"
        )}>
          {children}
        </main>
      </div>
    </div>
  );
}