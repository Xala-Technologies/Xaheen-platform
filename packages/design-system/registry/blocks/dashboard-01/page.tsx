/**
 * Dashboard Page - Enterprise Dashboard with Sidebar
 * WCAG AAA compliant with Norwegian enterprise features
 * Responsive design with professional components
 */

import React from 'react';
import { AppSidebar } from './components/app-sidebar';
import { DashboardHeader } from './components/dashboard-header';
import { DashboardContent } from './components/dashboard-content';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/card/card';
// TODO: Replace with context/provider pattern
// import { useResponsive } from '@/hooks/use-responsive';
// import { useAccessibility } from '@/hooks/use-accessibility';

export default function DashboardPage(): JSX.Element {
  React.useEffect(() => {
    document.title = 'Dashboard';
    console.log('Announce:', 'Dashboard lastet');
  }, []);

  const isAtLeast = (_: string) => window.innerWidth >= 1024;

  return (
    <div className="flex h-screen bg-background">
      {/* Sidebar - Hidden on mobile, visible on desktop */}
      {isAtLeast('lg') && <AppSidebar />}
      
      {/* Main Content Area */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Header */}
        <DashboardHeader />
        
        {/* Main Content */}
        <main 
          id="main-content"
          className="flex-1 overflow-y-auto p-4 md:p-6 lg:p-8"
          role="main"
          aria-label="Dashboard hovedinnhold"
        >
          <div className="max-w-7xl mx-auto">
            {/* Page Title */}
            <div className="mb-8">
              <h1 className="text-3xl font-bold text-foreground">
                Velkommen tilbake
              </h1>
              <p className="text-muted-foreground mt-2">
                Her er en oversikt over din aktivitet
              </p>
            </div>

            {/* Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">
                    Totale brukere
                  </CardTitle>
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    className="h-4 w-4 text-muted-foreground"
                  >
                    <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" />
                    <circle cx="9" cy="7" r="4" />
                    <path d="M22 21v-2a4 4 0 0 0-3-3.87M16 3.13a4 4 0 0 1 0 7.75" />
                  </svg>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">12.543</div>
                  <p className="text-xs text-muted-foreground">
                    +20,1% fra forrige måned
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">
                    Aktive økter
                  </CardTitle>
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    className="h-4 w-4 text-muted-foreground"
                  >
                    <path d="M22 12h-4l-3 9L9 3l-3 9H2" />
                  </svg>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">1.234</div>
                  <p className="text-xs text-muted-foreground">
                    +15% fra forrige time
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">
                    Transaksjoner
                  </CardTitle>
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    className="h-4 w-4 text-muted-foreground"
                  >
                    <rect width="20" height="14" x="2" y="5" rx="2" />
                    <path d="M2 10h20" />
                  </svg>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">kr 45.231</div>
                  <p className="text-xs text-muted-foreground">
                    +12% fra forrige uke
                  </p>
                </CardContent>
              </Card>

              <Card nsmClassification="RESTRICTED">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">
                    Systemstatus
                  </CardTitle>
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    className="h-4 w-4 text-muted-foreground"
                  >
                    <circle cx="12" cy="12" r="10" />
                    <path d="M12 6v6l4 2" />
                  </svg>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-green-600">99,9%</div>
                  <p className="text-xs text-muted-foreground">
                    Oppetid denne måneden
                  </p>
                </CardContent>
              </Card>
            </div>

            {/* Main Dashboard Content */}
            <DashboardContent />
          </div>
        </main>
      </div>
    </div>
  );
}