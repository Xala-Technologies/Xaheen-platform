



'use client';

import React from 'react';
import { WebNavbar, ThemeProvider } from '@xaheen-ai/design-system';
import './globals.css';


export interface RootLayoutProps {
  readonly children: React.ReactNode;
}


export default function RootLayout({ children }: RootLayoutProps{ children }): JSX.Element {
  const navigation = [
    {
      label: 'Home',
      href: '/'
    },
    {
      label: 'Features',
      items: [
        {
          label: 'Dashboard',
          href: '/dashboard',
          description: 'View your analytics and metrics'
        },
        {
          label: 'Settings',
          href: '/settings',
          description: 'Manage your account settings'
        }
      ]
    },
    {
      label: 'About',
      href: '/about'
    }
  ];

  return (
    <html lang="en" suppressHydrationWarning>
      <body>
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
          disableTransitionOnChange
        >
          <div className="relative flex min-h-screen flex-col">
            <WebNavbar
              title="nextjs-improved"
              navigation={navigation}
              showSearch={true}
              showThemeSelector={true}
              showUserMenu={true}
            />
            <main className="flex-1">
              {children}
            </main>
          </div>
        </ThemeProvider>
      </body>
    </html>
  );
}