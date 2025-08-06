import React from 'react';
import {
  Text,
  StyleSheet,
  TextStyle,
} from 'react-native';

// Label variant types
type LabelVariant = 'default' | 'muted' | 'destructive' | 'success';
type LabelSize = 'sm' | 'md' | 'lg' | 'xl';

// Props interface
interface LabelProps {
  variant?: LabelVariant;
  size?: LabelSize;
  required?: boolean;
  style?: TextStyle;
  children: React.ReactNode;
}

// Variant colors
const variantColors = {
  default: '#111827',
  muted: '#6b7280',
  destructive: '#ef4444',
  success: '#059669',
};

// Size configurations
const sizeConfigs = {
  sm: {
    fontSize: 12,
  },
  md: {
    fontSize: 14,
  },
  lg: {
    fontSize: 16,
  },
  xl: {
    fontSize: 18,
  },
};

export const Label: React.FC<LabelProps> = ({
  variant = 'default',
  size = 'md',
  required = false,
  style,
  children,
}) => {
  const color = variantColors[variant];
  const sizeConfig = sizeConfigs[size];

  return (
    <Text
      style={[
        styles.label,
        {
          color,
          fontSize: sizeConfig.fontSize,
        },
        style,
      ]}
    >
      {children}
      {required && <Text style={styles.required}> *</Text>}
    </Text>
  );
};

const styles = StyleSheet.create({
  label: {
    fontWeight: '500',
    lineHeight: 20,
  },
  required: {
    color: '#ef4444',
  },
});