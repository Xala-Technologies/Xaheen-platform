/**
 * React Native Input Component
 * Mobile-optimized text input with touch accessibility
 */

import React from 'react';
import { TextInput, View, Text, StyleSheet, TextInputProps } from 'react-native';

const inputStyles = StyleSheet.create({
  container: {
    width: '100%',
  },
  input: {
    fontSize: 16,
    paddingHorizontal: 16,
    paddingVertical: 14,
    borderWidth: 2,
    borderColor: '#e2e8f0',
    borderRadius: 8,
    backgroundColor: '#ffffff',
    color: '#0f172a',
  },
  inputFocused: {
    borderColor: '#3b82f6',
    shadowColor: '#3b82f6',
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  inputError: {
    borderColor: '#ef4444',
  },
  inputSuccess: {
    borderColor: '#10b981',
  },
  inputWarning: {
    borderColor: '#f59e0b',
  },
  inputDisabled: {
    opacity: 0.5,
    backgroundColor: '#f8fafc',
  },
  sizeSmall: {
    fontSize: 14,
    paddingVertical: 10,
  },
  sizeLarge: {
    fontSize: 18,
    paddingVertical: 18,
  },
  helperText: {
    fontSize: 14,
    marginTop: 6,
    color: '#64748b',
  },
  helperTextError: {
    color: '#ef4444',
  },
  helperTextSuccess: {
    color: '#10b981',
  },
  helperTextWarning: {
    color: '#f59e0b',
  },
});

export interface ReactNativeInputProps extends TextInputProps {
  readonly variant?: 'default' | 'error' | 'success' | 'warning';
  readonly size?: 'sm' | 'md' | 'lg';
  readonly error?: boolean;
  readonly success?: boolean;
  readonly warning?: boolean;
  readonly helperText?: string;
  readonly disabled?: boolean;
}

export const Input = React.forwardRef<TextInput, ReactNativeInputProps>(
  ({ 
    variant = 'default',
    size = 'md',
    error = false,
    success = false,
    warning = false,
    helperText,
    disabled = false,
    style,
    ...props 
  }, ref) => {
    const [isFocused, setIsFocused] = React.useState(false);
    
    const stateVariant = error ? 'error' : success ? 'success' : warning ? 'warning' : variant;
    
    const inputStyle = [
      inputStyles.input,
      size === 'sm' && inputStyles.sizeSmall,
      size === 'lg' && inputStyles.sizeLarge,
      isFocused && inputStyles.inputFocused,
      stateVariant === 'error' && inputStyles.inputError,
      stateVariant === 'success' && inputStyles.inputSuccess,
      stateVariant === 'warning' && inputStyles.inputWarning,
      disabled && inputStyles.inputDisabled,
      style,
    ];
    
    const helperTextStyle = [
      inputStyles.helperText,
      error && inputStyles.helperTextError,
      success && inputStyles.helperTextSuccess,
      warning && inputStyles.helperTextWarning,
    ];
    
    return (
      <View style={inputStyles.container}>
        <TextInput
          ref={ref}
          style={inputStyle}
          editable={!disabled}
          accessible={true}
          accessibilityRole="text"
          accessibilityState={{
            disabled,
            invalid: error,
          }}
          onFocus={(e) => {
            setIsFocused(true);
            props.onFocus?.(e);
          }}
          onBlur={(e) => {
            setIsFocused(false);
            props.onBlur?.(e);
          }}
          {...props}
        />
        {helperText && (
          <Text 
            style={helperTextStyle}
            accessible={true}
            accessibilityRole="text"
          >
            {helperText}
          </Text>
        )}
      </View>
    );
  }
);

Input.displayName = 'ReactNativeInput';