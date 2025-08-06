import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ViewStyle,
  TextStyle,
} from 'react-native';

// Badge variant types
type BadgeVariant = 'default' | 'secondary' | 'destructive' | 'outline' | 'success' | 'warning' | 'info';
type BadgeSize = 'sm' | 'md' | 'lg' | 'xl';

// Props interface
interface BadgeProps {
  variant?: BadgeVariant;
  size?: BadgeSize;
  style?: ViewStyle;
  textStyle?: TextStyle;
  children: React.ReactNode;
}

// Variant colors
const variantColors = {
  default: {
    background: '#3b82f6',
    text: '#ffffff',
    border: '#3b82f6',
  },
  secondary: {
    background: '#6b7280',
    text: '#ffffff',
    border: '#6b7280',
  },
  destructive: {
    background: '#ef4444',
    text: '#ffffff',
    border: '#ef4444',
  },
  outline: {
    background: 'transparent',
    text: '#111827',
    border: '#d1d5db',
  },
  success: {
    background: '#d1fae5',
    text: '#065f46',
    border: '#d1fae5',
  },
  warning: {
    background: '#fef3c7',
    text: '#92400e',
    border: '#fef3c7',
  },
  info: {
    background: '#dbeafe',
    text: '#1e3a8a',
    border: '#dbeafe',
  },
};

// Size configurations
const sizeConfigs = {
  sm: {
    paddingHorizontal: 8,
    paddingVertical: 2,
    fontSize: 10,
    height: 20,
  },
  md: {
    paddingHorizontal: 10,
    paddingVertical: 2,
    fontSize: 12,
    height: 24,
  },
  lg: {
    paddingHorizontal: 12,
    paddingVertical: 4,
    fontSize: 14,
    height: 28,
  },
  xl: {
    paddingHorizontal: 16,
    paddingVertical: 6,
    fontSize: 16,
    height: 32,
  },
};

export const Badge: React.FC<BadgeProps> = ({
  variant = 'default',
  size = 'md',
  style,
  textStyle,
  children,
}) => {
  const colors = variantColors[variant];
  const sizeConfig = sizeConfigs[size];

  return (
    <View
      style={[
        styles.container,
        {
          backgroundColor: colors.background,
          borderColor: colors.border,
          paddingHorizontal: sizeConfig.paddingHorizontal,
          paddingVertical: sizeConfig.paddingVertical,
          height: sizeConfig.height,
        },
        variant === 'outline' && styles.outlineVariant,
        style,
      ]}
    >
      <Text
        style={[
          styles.text,
          {
            color: colors.text,
            fontSize: sizeConfig.fontSize,
          },
          textStyle,
        ]}
      >
        {children}
      </Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 9999,
    borderWidth: 1,
  },
  outlineVariant: {
    borderWidth: 1,
  },
  text: {
    fontWeight: '500',
  },
});