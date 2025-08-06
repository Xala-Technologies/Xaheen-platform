import React, { useState, useCallback } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ViewStyle,
  TextStyle,
  AccessibilityRole,
} from 'react-native';
import Svg, { Path } from 'react-native-svg';

// Checkbox variant types
type CheckboxVariant = 'default' | 'destructive' | 'success';
type CheckboxSize = 'sm' | 'md' | 'lg';

// Props interface
interface CheckboxProps {
  checked?: boolean;
  label?: string;
  variant?: CheckboxVariant;
  size?: CheckboxSize;
  disabled?: boolean;
  required?: boolean;
  style?: ViewStyle;
  labelStyle?: TextStyle;
  onCheckedChange?: (checked: boolean) => void;
}

// Variant colors
const variantColors = {
  default: {
    unchecked: '#d1d5db',
    checked: '#3b82f6',
    checkmark: '#ffffff',
  },
  destructive: {
    unchecked: '#fecaca',
    checked: '#ef4444',
    checkmark: '#ffffff',
  },
  success: {
    unchecked: '#bbf7d0',
    checked: '#10b981',
    checkmark: '#ffffff',
  },
};

// Size configurations
const sizeConfigs = {
  sm: {
    box: 16,
    checkmark: 10,
    fontSize: 14,
    gap: 8,
  },
  md: {
    box: 20,
    checkmark: 14,
    fontSize: 16,
    gap: 10,
  },
  lg: {
    box: 24,
    checkmark: 16,
    fontSize: 18,
    gap: 12,
  },
};

export const Checkbox: React.FC<CheckboxProps> = ({
  checked = false,
  label,
  variant = 'default',
  size = 'md',
  disabled = false,
  required = false,
  style,
  labelStyle,
  onCheckedChange,
}) => {
  const [isChecked, setIsChecked] = useState(checked);

  const colors = variantColors[variant];
  const sizeConfig = sizeConfigs[size];

  const handlePress = useCallback(() => {
    if (disabled) return;
    
    const newChecked = !isChecked;
    setIsChecked(newChecked);
    onCheckedChange?.(newChecked);
  }, [isChecked, disabled, onCheckedChange]);

  return (
    <TouchableOpacity
      style={[
        styles.container,
        { opacity: disabled ? 0.5 : 1 },
        style,
      ]}
      onPress={handlePress}
      disabled={disabled}
      accessibilityRole="checkbox" as AccessibilityRole
      accessibilityState={{ checked: isChecked, disabled }}
      accessibilityLabel={label}
    >
      <View
        style={[
          styles.checkbox,
          {
            width: sizeConfig.box,
            height: sizeConfig.box,
            backgroundColor: isChecked ? colors.checked : 'transparent',
            borderColor: isChecked ? colors.checked : colors.unchecked,
          },
        ]}
      >
        {isChecked && (
          <Svg
            width={sizeConfig.checkmark}
            height={sizeConfig.checkmark}
            viewBox="0 0 24 24"
            fill="none"
          >
            <Path
              d="M20 6L9 17L4 12"
              stroke={colors.checkmark}
              strokeWidth={3}
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </Svg>
        )}
      </View>
      
      {label && (
        <Text
          style={[
            styles.label,
            {
              fontSize: sizeConfig.fontSize,
              marginLeft: sizeConfig.gap,
              opacity: disabled ? 0.5 : 1,
            },
            labelStyle,
          ]}
        >
          {label}
          {required && <Text style={styles.required}> *</Text>}
        </Text>
      )}
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  checkbox: {
    borderWidth: 2,
    borderRadius: 4,
    alignItems: 'center',
    justifyContent: 'center',
  },
  label: {
    color: '#111827',
  },
  required: {
    color: '#ef4444',
  },
});