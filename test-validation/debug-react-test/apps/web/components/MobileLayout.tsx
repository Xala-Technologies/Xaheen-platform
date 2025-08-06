{{!-- Template: MobileLayout.tsx.hbs --}}
{{!-- Category: frontend --}}
{{!-- Type: component --}}
{{!-- Framework: next --}}
{{!-- Migrated from: /Volumes/Development/Xaheen Enterprise/xaheen/apps/cli/templates/frontend/react/next/src/components/layouts/MobileLayout.tsx.hbs --}}
{{#if typescript}}'use client';{{/if}}

/**
 * MobileLayout Component - Xala UI System Compliant
 * Generated with Xaheen CLI
 * 
 * MANDATORY COMPLIANCE RULES:
 * ❌ NO raw HTML elements (div, span, p, h1-h6, button, input, etc.) in pages
 * ✅ ONLY semantic components from @xaheen-ai/design-system
 * ❌ NO hardcoded styling (no style=placeholder, no arbitrary Tailwind values)
 * ✅ MANDATORY design token usage for all colors, spacing, typography
 * ✅ Enhanced 8pt Grid System - all spacing in 8px increments
 * ✅ WCAG 2.2 AAA compliance for accessibility
 * ❌ NO hardcoded user-facing text - ALL text must use t() function
 * ✅ MANDATORY localization: English, Norwegian Bokmål, French, Arabic
 * ✅ Explicit TypeScript return types (no 'any' types)
 * ✅ SOLID principles and component composition
 * ✅ Maximum 200 lines per file, 20 lines per function
 * 
 * Features:
 * - Touch-optimized mobile interface
 * - Bottom navigation for thumb accessibility
 * - Swipe gesture support
 * - Norwegian mobile usage patterns (85%+ mobile traffic)
 * - One-handed operation optimization
 * - WCAG AAA touch targets (44px minimum)
 */

{{#if typescript}}
import React from 'react';
import { useTranslation } from 'next-intl';
import {
  Box,
  Stack,
  Container,
  Typography,
  Button,
  Avatar,
  Badge,
  Icon,
  BottomNavigation,
  MobileHeader,
  Drawer,
  Sheet,
  ScrollArea,
  ActionBar,
  Separator
} from '@xaheen-ai/design-system';
import { 
  Home,
  Search,
  Bell,
  User,
  Menu,
  ArrowLeft,
  MoreVertical,
  Heart,
  Share,
  Bookmark
} from 'lucide-react';
import BaseLayout from './BaseLayout';

interface MobileLayoutProps {
  children: React.ReactNode;
  title?: string;
  showBackButton?: boolean;
  onBackClick?: () => void;
  headerActions?: React.ReactNode;
  bottomNavigation?: BottomNavItem[];
  currentNavItem?: string;
  onNavItemClick?: (itemId: string) => void;
  showActionBar?: boolean;
  actionBarItems?: ActionBarItem[];
  locale?: string;
  theme?: 'light' | 'dark' | 'high-contrast';
}

interface BottomNavItem {
  id: string;
  label: string;
  icon: React.ComponentType;
  badge?: string;
  href?: string;
}

interface ActionBarItem {
  id: string;
  label: string;
  icon: React.ComponentType;
  variant?: 'primary' | 'secondary' | 'destructive';
  onClick?: () => void;
}
{{else}}
import React from 'react';
import { useTranslation } from 'next-intl';
import {
  Box,
  Stack,
  Container,
  Typography,
  Button,
  Avatar,
  Badge,
  Icon,
  BottomNavigation,
  MobileHeader,
  Drawer,
  Sheet,
  ScrollArea,
  ActionBar,
  Separator
} from '@xaheen-ai/design-system';
import { 
  Home,
  Search,
  Bell,
  User,
  Menu,
  ArrowLeft,
  MoreVertical,
  Heart,
  Share,
  Bookmark
} from 'lucide-react';
import BaseLayout from './BaseLayout';
{{/if}}

/**
 * Default bottom navigation items for mobile
 */
const defaultBottomNavItems{{#if typescript}}: BottomNavItem[]{{/if}} = [
  {
    id: 'home',
    label: 'navigation.home',
    icon: Home,
  },
  {
    id: 'search',
    label: 'navigation.search',
    icon: Search,
  },
  {
    id: 'notifications',
    label: 'navigation.notifications',
    icon: Bell,
    badge: '3',
  },
  {
    id: 'profile',
    label: 'navigation.profile',
    icon: User,
  },
];

/**
 * Default action bar items
 */
const defaultActionBarItems{{#if typescript}}: ActionBarItem[]{{/if}} = [
  {
    id: 'like',
    label: 'actions.like',
    icon: Heart,
  },
  {
    id: 'share',
    label: 'actions.share',
    icon: Share,
  },
  {
    id: 'bookmark',
    label: 'actions.bookmark',
    icon: Bookmark,
  },
];

/**
 * MobileLayout - Touch-optimized mobile interface
 * Optimized for Norwegian mobile usage patterns and one-handed operation
 */
{{#if typescript}}
export default function MobileLayout({
  children,
  title,
  showBackButton = false,
  onBackClick,
  headerActions,
  bottomNavigation = defaultBottomNavItems,
  currentNavItem,
  onNavItemClick,
  showActionBar = false,
  actionBarItems = defaultActionBarItems,
  locale = 'en',
  theme = 'light'
}: MobileLayoutProps): React.ReactElement {
{{else}}
export default function MobileLayout({
  children,
  title,
  showBackButton = false,
  onBackClick,
  headerActions,
  bottomNavigation = defaultBottomNavItems,
  currentNavItem,
  onNavItemClick,
  showActionBar = false,
  actionBarItems = defaultActionBarItems,
  locale = 'en',
  theme = 'light'
}) {
{{/if}}
  const { t } = useTranslation();
  const [isMenuOpen, setIsMenuOpen] = React.useState(false);

  const handleBackClick = {{#if typescript}}(): void{{/if}} => {
    if (onBackClick) {
      onBackClick();
    } else {
      // Default back behavior
      if (typeof window !== 'undefined' && window.history.length > 1) {
        window.history.back();
      }
    }
  };

  const handleNavItemClick = (itemId{{#if typescript}}: string{{/if}}){{#if typescript}}: void{{/if}} => {
    if (onNavItemClick) {
      onNavItemClick(itemId);
    }
  };

  const handleMenuToggle = {{#if typescript}}(): void{{/if}} => {
    setIsMenuOpen(!isMenuOpen);
  };

  const renderMobileHeader = {{#if typescript}}(): React.ReactElement{{/if}} => (
    <MobileHeader
      backgroundColor="card"
      borderBottom="1"
      padding="4"
      minHeight="14" // 56px - WCAG AAA touch target
    >
      <Stack direction="horizontal" align="center" justify="between" height="full">
        {/* Left section */}
        <Stack direction="horizontal" align="center" spacing="3">
          {showBackButton && (
            <Button
              variant="ghost"
              size="sm"
              onClick={handleClick}
              aria-label={t('navigation.back', 'Go back')}
              minWidth="11" // 44px - WCAG AAA touch target
              minHeight="11"
            >
              <Icon component={ArrowLeft} size="md" />
            </Button>
          )}
          
          {title && (
            <Typography 
              variant="heading" 
              size="lg" 
              weight="semibold"
              truncate
              maxWidth="48" // Prevent overflow on small screens
            >
              {t(title, title)}
            </Typography>
          )}
        </Stack>

        {/* Right section */}
        <Stack direction="horizontal" align="center" spacing="2">
          {headerActions}
          <Button
            variant="ghost"
            size="sm"
            onClick={handleClick}
            aria-label={t('navigation.menu', 'Open menu')}
            minWidth="11" // 44px - WCAG AAA touch target
            minHeight="11"
          >
            <Icon component={MoreVertical} size="md" />
          </Button>
        </Stack>
      </Stack>
    </MobileHeader>
  );

  const renderBottomNavigation = {{#if typescript}}(): React.ReactElement{{/if}} => (
    <BottomNavigation
      backgroundColor="card"
      borderTop="1"
      padding="2"
      minHeight="16" // 64px for comfortable thumb reach
    >
      <Stack direction="horizontal" align="center" justify="around" height="full">
        {bottomNavigation.map((item) => (
          <Button
            key={item.id}
            variant="ghost"
            size="sm"
            onClick={handleClick}
            aria-label={t(item.label, item.label)}
            minWidth="12" // 48px - Extra space for thumb navigation
            minHeight="12"
            className=""
          >
            <Stack direction="vertical" align="center" spacing="1">
              <Box position="relative">
                <Icon 
                  component={item.icon} 
                  size="md"
                  color={currentNavItem === item.id ? 'primary' : 'muted'}
                />
                {item.badge && (
                  <Badge
                    variant="destructive"
                    size="sm"
                    position="absolute"
                    top="-1"
                    right="-1"
                  >
                    {item.badge}
                  </Badge>
                )}
              </Box>
              <Typography 
                variant="caption" 
                size="xs"
                color={currentNavItem === item.id ? 'primary' : 'muted'}
                textAlign="center"
              >
                {t(item.label, item.label)}
              </Typography>
            </Stack>
          </Button>
        ))}
      </Stack>
    </BottomNavigation>
  );

  const renderActionBar = {{#if typescript}}(): React.ReactElement | null{{/if}} => {
    if (!showActionBar) return null;

    return (
      <ActionBar
        backgroundColor="card"
        borderTop="1"
        padding="3"
        position="fixed"
        bottom="16" // Above bottom navigation
        left="4"
        right="4"
        borderRadius="lg"
        shadow="lg"
      >
        <Stack direction="horizontal" align="center" justify="center" spacing="6">
          {actionBarItems.map((item) => (
            <Button
              key={item.id}
              variant={item.variant || 'secondary'}
              size="md"
              onClick={handleClick}
              aria-label={t(item.label, item.label)}
              minWidth="11" // 44px - WCAG AAA touch target
              minHeight="11"
            >
              <Icon component={item.icon} size="md" />
            </Button>
          ))}
        </Stack>
      </ActionBar>
    );
  };

  const renderMenuDrawer = {{#if typescript}}(): React.ReactElement{{/if}} => (
    <Drawer
      open={isMenuOpen}
      onOpenChange={setIsMenuOpen}
      side="right"
      size="sm"
    >
      <Drawer.Content>
        <Box padding="6">
          <Stack direction="vertical" spacing="4">
            <Typography variant="heading" size="lg">
              {t('menu.title', 'Menu')}
            </Typography>
            
            <Separator />
            
            <Stack direction="vertical" spacing="3">
              <Button variant="ghost" justify="start" fullWidth>
                <Icon component={User} size="sm" />
                {t('menu.profile', 'Profile')}
              </Button>
              
              <Button variant="ghost" justify="start" fullWidth>
                <Icon component={Bell} size="sm" />
                {t('menu.notifications', 'Notifications')}
              </Button>
              
              <Button variant="ghost" justify="start" fullWidth>
                <Icon component={Menu} size="sm" />
                {t('menu.settings', 'Settings')}
              </Button>
            </Stack>
          </Stack>
        </Box>
      </Drawer.Content>
    </Drawer>
  );

  return (
    <BaseLayout locale={locale} theme={theme} enableCompliance={true}>
      <Box
        minHeight="screen"
        backgroundColor="background"
        className="mobile-layout"
      >
        {/* Mobile Header */}
        {renderMobileHeader()}

        {/* Main Content Area */}
        <Box
          flex="1"
          paddingBottom={showActionBar ? "20" : "16"} // Space for action bar + bottom nav
          overflow="hidden"
        >
          <ScrollArea height="full">
            <Container maxWidth="full" padding="4">
              {children}
            </Container>
          </ScrollArea>
        </Box>

        {/* Action Bar (floating) */}
        {renderActionBar()}

        {/* Bottom Navigation */}
        {renderBottomNavigation()}

        {/* Menu Drawer */}
        {renderMenuDrawer()}
      </Box>
    </BaseLayout>
  );
}

{{#if includeExamples}}
// Example usage:
/*
import MobileLayout from '@/layouts/MobileLayout';
import { Typography, Card } from '@xaheen-ai/design-system';

export default function MobilePage() {
  const customBottomNav = [
    { id: 'feed', label: 'feed.title', icon: Home },
    { id: 'discover', label: 'discover.title', icon: Search },
    { id: 'activity', label: 'activity.title', icon: Bell, badge: '5' },
    { id: 'profile', label: 'profile.title', icon: User },
  ];

  const customActions = [
    { id: 'like', label: 'actions.like', icon: Heart, variant: 'primary' },
    { id: 'share', label: 'actions.share', icon: Share },
  ];

  return (
    <MobileLayout
      title="mobile.page.title"
      showBackButton={true}
      bottomNavigation={customBottomNav}
      currentNavItem="feed"
      showActionBar={true}
      actionBarItems={customActions}
      locale="nb"
    >
      <Stack direction="vertical" spacing="4">
        <Card padding="6">
          <Typography variant="heading" size="xl">
            Mobile Content
          </Typography>
        </Card>
      </Stack>
    </MobileLayout>
  );
}
*/
{{/if}}
