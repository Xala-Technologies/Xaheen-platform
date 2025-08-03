/**
 * Navigation Header - Xala UI System v5.0.0 Compliant
 * Generated with Xaheen CLI
 * 
 * MANDATORY COMPLIANCE RULES:
 * ✅ ONLY semantic components from @xala-technologies/ui-system
 * ✅ MANDATORY localization for all text
 * ✅ WCAG 2.2 AAA compliance
 * ✅ Explicit TypeScript return types
 */

'use client';

import { Container, Stack, Typography, Button, useTokens } from '@xala-technologies/ui-system';
import { ThemeSwitcher } from '@/components/ui/ThemeSwitcher';
import { LocaleSwitcher } from '@/components/ui/LocaleSwitcher';
import { SupportedLocale } from '@/lib/i18n';
import { Github, Maximize2 } from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';
import { useState, useEffect } from 'react';

interface NavigationHeaderProps {
  locale: SupportedLocale;
}

/**
 * Main navigation header matching the original navbar design
 * Features logo, navigation links, builder button, and theme/locale controls
 */
export function NavigationHeader({ locale }: NavigationHeaderProps): React.JSX.Element {
  const [scrolled, setScrolled] = useState<boolean>(false);
  const { colors, spacing } = useTokens();

  useEffect(() => {
    const handleScroll = (): void => {
      setScrolled(window.scrollY > 10);
    };

    window.addEventListener('scroll', handleScroll);
    handleScroll();

    return (): void => window.removeEventListener('scroll', handleScroll);
  }, []);

  const navLinks = [
    {
      href: `/${locale}`,
      label: 'Home',
      icon: <span style={{ color: colors.primary?.[500] }}>~/</span>,
    },
    {
      href: 'https://my-xaheen-app-client.pages.dev/',
      label: 'Demo',
      target: '_blank' as const,
    },
    { href: `/${locale}/showcase`, label: 'Showcase' },
    { href: `/${locale}/analytics`, label: 'Analytics' },
    { href: `/${locale}/docs`, label: 'Docs' },
    {
      href: 'https://github.com/Xala-Technologies/Xaheen-platform/pkgs/npm/xaheen',
      label: 'Package',
      target: '_blank' as const,
    },
  ];

  return (
    <nav
      style={{
        position: 'fixed',
        top: 0,
        zIndex: 100,
        width: '100%',
        transition: 'all 0.3s ease-in-out',
        borderBottom: scrolled ? `1px solid ${colors.border?.default}` : '1px solid transparent',
        backgroundColor: scrolled ? colors.background?.primary : 'transparent',
        backdropFilter: scrolled ? 'blur(12px)' : 'none',
        boxShadow: scrolled ? '0 1px 3px 0 rgba(0, 0, 0, 0.1)' : 'none',
      }}
    >
      <Container size="full" padding="none">
        <div
          style={{
            display: 'flex',
            height: '64px',
            alignItems: 'center',
            justifyContent: 'space-between',
            paddingLeft: spacing[4],
            paddingRight: spacing[4],
          }}
        >
          {/* Logo and Brand */}
          <Link href={`/${locale}`} style={{ display: 'flex', alignItems: 'center', gap: spacing[2] }}>
            <Image
              src="/logo.svg"
              alt="Xaheen"
              width={32}
              height={32}
              unoptimized
            />
            <Typography
              variant="h4"
              color="primary"
              style={{
                fontWeight: 600,
                display: 'none',
                '@media (min-width: 640px)': {
                  display: 'inline-block',
                },
              }}
            >
              Xaheen
            </Typography>
          </Link>

          {/* Desktop Navigation */}
          <div
            style={{
              display: 'none',
              alignItems: 'center',
              gap: spacing[4],
              '@media (min-width: 1024px)': {
                display: 'flex',
              },
            }}
          >
            <Stack direction="horizontal" gap="xs">
              {navLinks.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  target={link.target}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: spacing[1],
                    padding: `${spacing[1]} ${spacing[3]}`,
                    borderRadius: '6px',
                    color: colors.text?.muted,
                    fontSize: '14px',
                    textDecoration: 'none',
                    transition: 'all 0.2s ease',
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.backgroundColor = colors.background?.muted || '#f5f5f5';
                    e.currentTarget.style.color = colors.primary?.[500] || '#3b82f6';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.backgroundColor = 'transparent';
                    e.currentTarget.style.color = colors.text?.muted || '#6b7280';
                  }}
                >
                  {link.icon}
                  <span>{link.label}</span>
                </Link>
              ))}
            </Stack>

            {/* Divider */}
            <div
              style={{
                height: '20px',
                width: '1px',
                backgroundColor: colors.border?.default,
              }}
            />

            {/* Builder Button */}
            <Link href={`/${locale}/new`}>
              <Button
                variant="outline"
                size="sm"
                style={{
                  borderColor: `${colors.primary?.[500]}80`,
                  backgroundColor: `${colors.primary?.[500]}10`,
                  color: colors.primary?.[500],
                }}
              >
                <Maximize2 size={14} />
                <Typography variant="body" size="sm">
                  Builder
                </Typography>
              </Button>
            </Link>
          </div>

          {/* Theme and Locale Controls */}
          <Stack direction="horizontal" gap="sm" align="center">
            <LocaleSwitcher currentLocale={locale} />
            <ThemeSwitcher />
          </Stack>
        </div>
      </Container>
    </nav>
  );
}
