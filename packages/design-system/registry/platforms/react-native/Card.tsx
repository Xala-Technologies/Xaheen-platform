/**
 * React Native Card Component
 * Mobile-optimized container with elevation and spacing
 */

import React from 'react';
import { View, ViewProps, StyleSheet } from 'react-native';

const cardStyles = StyleSheet.create({
  card: {
    backgroundColor: '#ffffff',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#e2e8f0',
  },
  // Variants
  default: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  elevated: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 6,
  },
  outline: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  ghost: {
    shadowColor: 'transparent',
    elevation: 0,
    borderColor: 'transparent',
  },
  // Padding
  paddingNone: {
    padding: 0,
  },
  paddingSm: {
    padding: 12,
  },
  paddingMd: {
    padding: 16,
  },
  paddingLg: {
    padding: 24,
  },
  paddingXl: {
    padding: 32,
  },
  // Rounded corners
  roundedNone: {
    borderRadius: 0,
  },
  roundedSm: {
    borderRadius: 4,
  },
  roundedMd: {
    borderRadius: 6,
  },
  roundedLg: {
    borderRadius: 8,
  },
  roundedXl: {
    borderRadius: 12,
  },
  rounded2xl: {
    borderRadius: 16,
  },
});

export interface ReactNativeCardProps extends ViewProps {
  readonly variant?: 'default' | 'elevated' | 'outline' | 'ghost';
  readonly padding?: 'none' | 'sm' | 'md' | 'lg' | 'xl';
  readonly rounded?: 'none' | 'sm' | 'md' | 'lg' | 'xl' | '2xl';
}

export const Card = React.forwardRef<View, ReactNativeCardProps>(
  ({ 
    variant = 'default',
    padding = 'md',
    rounded = 'lg',
    style,
    children,
    ...props 
  }, ref) => {
    const cardStyle = [
      cardStyles.card,
      cardStyles[variant as keyof typeof cardStyles],
      cardStyles[`padding${padding.charAt(0).toUpperCase() + padding.slice(1)}` as keyof typeof cardStyles],
      cardStyles[`rounded${rounded === '2xl' ? '2xl' : rounded.charAt(0).toUpperCase() + rounded.slice(1)}` as keyof typeof cardStyles],
      style,
    ];
    
    return (
      <View
        ref={ref}
        style={cardStyle}
        accessible={true}
        accessibilityRole="group"
        {...props}
      >
        {children}
      </View>
    );
  }
);

Card.displayName = 'ReactNativeCard';

// Header Component
export interface CardHeaderProps extends ViewProps {
  readonly padding?: 'none' | 'sm' | 'md' | 'lg';
}

export const CardHeader = React.forwardRef<View, CardHeaderProps>(
  ({ padding = 'md', style, children, ...props }, ref) => {
    const headerStyle = [
      {
        paddingBottom: 8,
      },
      cardStyles[`padding${padding.charAt(0).toUpperCase() + padding.slice(1)}` as keyof typeof cardStyles],
      style,
    ];
    
    return (
      <View
        ref={ref}
        style={headerStyle}
        accessible={true}
        accessibilityRole="header"
        {...props}
      >
        {children}
      </View>
    );
  }
);

CardHeader.displayName = 'CardHeader';

// Content Component
export interface CardContentProps extends ViewProps {
  readonly padding?: 'none' | 'sm' | 'md' | 'lg';
}

export const CardContent = React.forwardRef<View, CardContentProps>(
  ({ padding = 'md', style, children, ...props }, ref) => {
    const contentStyle = [
      cardStyles[`padding${padding.charAt(0).toUpperCase() + padding.slice(1)}` as keyof typeof cardStyles],
      { paddingTop: 0 },
      style,
    ];
    
    return (
      <View
        ref={ref}
        style={contentStyle}
        accessible={true}
        {...props}
      >
        {children}
      </View>
    );
  }
);

CardContent.displayName = 'CardContent';

// Footer Component
export interface CardFooterProps extends ViewProps {
  readonly padding?: 'none' | 'sm' | 'md' | 'lg';
}

export const CardFooter = React.forwardRef<View, CardFooterProps>(
  ({ padding = 'md', style, children, ...props }, ref) => {
    const footerStyle = [
      {
        flexDirection: 'row' as const,
        alignItems: 'center' as const,
        paddingTop: 0,
      },
      cardStyles[`padding${padding.charAt(0).toUpperCase() + padding.slice(1)}` as keyof typeof cardStyles],
      style,
    ];
    
    return (
      <View
        ref={ref}
        style={footerStyle}
        accessible={true}
        {...props}
      >
        {children}
      </View>
    );
  }
);

CardFooter.displayName = 'CardFooter';