import React from 'react';
import { AppShell } from '@xaheen-ai/design-system';

export interface AppProps {
  readonly children: React.ReactNode;
}

export default function App({ children }: AppProps): JSX.Element {
  // v5.0 Architecture: CSS-only theming via data attributes
  return (
    <AppShell 
      theme="{{theme}}" 
      industry="{{industry}}"
      fullHeight
    >
      {children}
    </AppShell>
  );
}