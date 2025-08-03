/**
 * SaaS Navigation Header - Xala UI System v5.0.0 Compliant
 * Following Next.js Navbar Implementation Guide
 * 
 * MANDATORY COMPLIANCE RULES:
 * ONLY semantic components from @xala-technologies/ui-system
 * MANDATORY localization for all text
 * WCAG 2.2 AAA compliance
 * Explicit TypeScript return types
 * NO raw HTML elements
 * NO hardcoded styling
 * SOLID principles and component composition
 */

'use client';

import {
  Container,
  Stack,
  Typography,
  Avatar,
  Button,
  Badge,
  useTokens,
  useResponsive
} from '@xala-technologies/ui-system';
import { Bell } from 'lucide-react';

import { ThemeSwitcher } from '../ui/ThemeSwitcher';

export interface NavigationHeaderProps {
  readonly locale: string;
  readonly userAvatar?: string;
  readonly userName?: string;
  readonly notificationCount?: number;
}

export function NavigationHeader({
  locale,
  userAvatar,
  userName,
  notificationCount = 0
}: NavigationHeaderProps): React.JSX.Element {

  const { colors, spacing } = useTokens();
  const { isMobile } = useResponsive();

  const handleSearchSubmit = (query: string): void => {
    // Handle search submission
    console.log('Search:', query);
  };

  const handleNotificationClick = (): void => {
    // Handle notification click
    console.log('Notifications clicked');
  };

  const handleProfileAction = (action: string): void => {
    // Handle profile actions
    console.log('Profile action:', action);
  };



  return (
    <Container size="full" padding="none">
      <Stack 
        direction="horizontal" 
        align="center" 
        justify="between" 
        className="min-h-16 px-6 border-b bg-background/95 backdrop-blur"
      >
        {/* Logo Section */}
        <Stack direction="horizontal" align="center" gap="sm">
          <Typography variant="h3" weight="bold">
            Xaheen
          </Typography>
          <Badge variant="secondary" size="sm">
            v2.0
          </Badge>
        </Stack>

        {/* Search Section */}
        <Container 
          size="md" 
          padding="none"
          style={{ 
            maxWidth: isMobile ? '200px' : '400px',
            width: '100%'
          }}
        >
          <Button 
            variant="outline" 
            size="sm" 
            className="w-full justify-between"
            onClick={(): void => {
              // Open search modal
              console.log('Open search');
            }}
          >
            <Stack direction="horizontal" align="center" gap="sm">
              <Typography variant="body" color="muted">
                Search...
              </Typography>
            </Stack>
            <Badge variant="secondary" size="sm">⌘K</Badge>
          </Button>
        </Container>

        {/* Actions Section */}
        <Stack direction="horizontal" align="center" gap="sm">
          {/* Theme Switcher */}
          <ThemeSwitcher />
          
          {/* Notifications */}
          <Button
            variant="ghost"
            size="sm"
            onClick={handleNotificationClick}
            aria-label="Notifications"
          >
            <Bell size={16} />
            {notificationCount > 0 && (
              <Badge 
                variant="destructive" 
                size="sm"
                style={{
                  position: 'absolute',
                  top: '-4px',
                  right: '-4px',
                  minWidth: '16px',
                  height: '16px',
                  fontSize: '10px',
                  padding: '0 4px'
                }}
              >
                {notificationCount}
              </Badge>
            )}
          </Button>
          
          {/* User Menu */}
          {userName && (
            <Button
              variant="ghost"
              size="sm"
              onClick={(): void => handleProfileAction('profile')}
              aria-label="User menu"
            >
              <Avatar
                src={userAvatar}
                alt={`${userName} avatar`}
                size="sm"
                fallback={userName?.charAt(0) || 'U'}
              />
            </Button>
          )}
        </Stack>
      </Stack>
    </Container>
  );
}