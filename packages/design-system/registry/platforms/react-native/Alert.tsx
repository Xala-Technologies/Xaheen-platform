import React, { useState, useCallback, useEffect, useRef } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ViewStyle,
  TextStyle,
  AccessibilityRole,
  Animated,
} from 'react-native';
import Svg, { Path } from 'react-native-svg';

// Alert variant types
type AlertVariant = 'default' | 'destructive' | 'warning' | 'success' | 'info' | 'nsmOpen' | 'nsmRestricted' | 'nsmConfidential' | 'nsmSecret';
type AlertSize = 'sm' | 'md' | 'lg';

// Props interface
interface AlertProps {
  variant?: AlertVariant;
  size?: AlertSize;
  dismissible?: boolean;
  icon?: boolean;
  nsmClassification?: 'OPEN' | 'RESTRICTED' | 'CONFIDENTIAL' | 'SECRET';
  ariaLive?: 'polite' | 'assertive' | 'off';
  autoFocus?: boolean;
  style?: ViewStyle;
  children: React.ReactNode;
  onDismiss?: () => void;
}

// Variant colors
const variantColors = {
  default: {
    background: '#f9fafb',
    border: '#e5e7eb',
    text: '#111827',
    icon: '#6b7280',
  },
  destructive: {
    background: '#fee2e2',
    border: '#ef4444',
    text: '#991b1b',
    icon: '#dc2626',
  },
  warning: {
    background: '#fef3c7',
    border: '#f59e0b',
    text: '#92400e',
    icon: '#d97706',
  },
  success: {
    background: '#d1fae5',
    border: '#10b981',
    text: '#065f46',
    icon: '#059669',
  },
  info: {
    background: '#dbeafe',
    border: '#3b82f6',
    text: '#1e3a8a',
    icon: '#2563eb',
  },
  nsmOpen: {
    background: '#d1fae5',
    border: '#059669',
    text: '#065f46',
    icon: '#059669',
    borderLeft: '#059669',
  },
  nsmRestricted: {
    background: '#fef3c7',
    border: '#d97706',
    text: '#92400e',
    icon: '#d97706',
    borderLeft: '#d97706',
  },
  nsmConfidential: {
    background: '#fee2e2',
    border: '#dc2626',
    text: '#991b1b',
    icon: '#dc2626',
    borderLeft: '#dc2626',
  },
  nsmSecret: {
    background: '#f3f4f6',
    border: '#4b5563',
    text: '#111827',
    icon: '#4b5563',
    borderLeft: '#1f2937',
  },
};

// Size configurations
const sizeConfigs = {
  sm: {
    padding: 12,
    fontSize: 12,
    iconSize: 16,
    minHeight: 40,
  },
  md: {
    padding: 16,
    fontSize: 14,
    iconSize: 20,
    minHeight: 48,
  },
  lg: {
    padding: 20,
    fontSize: 16,
    iconSize: 24,
    minHeight: 56,
  },
};

// Icon paths
const iconPaths = {
  default: 'M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z',
  destructive: 'M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z',
  warning: 'M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z',
  success: 'M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z',
  info: 'M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z',
  nsmOpen: 'M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z',
  nsmRestricted: 'M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z',
  nsmConfidential: 'M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z',
  nsmSecret: 'M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z',
};

export const Alert: React.FC<AlertProps> = ({
  variant = 'default',
  size = 'md',
  dismissible = false,
  icon = true,
  nsmClassification,
  ariaLive = 'polite',
  autoFocus = false,
  style,
  children,
  onDismiss,
}) => {
  const [isVisible, setIsVisible] = useState(true);
  const fadeAnim = useRef(new Animated.Value(1)).current;

  // Determine final variant
  const finalVariant = nsmClassification
    ? (`nsm${nsmClassification.charAt(0).toUpperCase() + nsmClassification.slice(1).toLowerCase()}` as AlertVariant)
    : variant;

  const colors = variantColors[finalVariant];
  const sizeConfig = sizeConfigs[size];
  const iconPath = iconPaths[finalVariant];

  // Determine accessibility role
  const getAccessibilityRole = (): AccessibilityRole => {
    switch (finalVariant) {
      case 'destructive':
      case 'nsmSecret':
      case 'nsmConfidential':
        return 'alert';
      default:
        return 'none';
    }
  };

  const handleDismiss = useCallback(() => {
    Animated.timing(fadeAnim, {
      toValue: 0,
      duration: 200,
      useNativeDriver: true,
    }).start(() => {
      setIsVisible(false);
      onDismiss?.();
    });
  }, [fadeAnim, onDismiss]);

  if (!isVisible) {
    return null;
  }

  return (
    <Animated.View
      style={[
        styles.container,
        {
          backgroundColor: colors.background,
          borderColor: colors.border,
          borderLeftColor: colors.borderLeft || colors.border,
          borderLeftWidth: colors.borderLeft ? 4 : 1,
          minHeight: sizeConfig.minHeight,
          padding: sizeConfig.padding,
          opacity: fadeAnim,
        },
        style,
      ]}
      accessibilityRole={getAccessibilityRole()}
      accessibilityLiveRegion={ariaLive}
    >
      {/* Icon */}
      {icon && (
        <View style={styles.iconContainer}>
          <Svg
            width={sizeConfig.iconSize}
            height={sizeConfig.iconSize}
            viewBox="0 0 24 24"
            fill="none"
            stroke={colors.icon}
            strokeWidth={2}
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <Path d={iconPath} />
          </Svg>
        </View>
      )}

      {/* Content */}
      <View style={styles.content}>
        {typeof children === 'string' ? (
          <Text style={[styles.text, { color: colors.text, fontSize: sizeConfig.fontSize }]}>
            {children}
          </Text>
        ) : (
          children
        )}
      </View>

      {/* Dismiss Button */}
      {dismissible && (
        <TouchableOpacity
          style={styles.dismissButton}
          onPress={handleDismiss}
          accessibilityLabel="Lukk varsling"
          accessibilityRole="button"
        >
          <Svg
            width={16}
            height={16}
            viewBox="0 0 24 24"
            fill="none"
            stroke={colors.icon}
            strokeWidth={2}
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <Path d="M6 18L18 6M6 6l12 12" />
          </Svg>
        </TouchableOpacity>
      )}

      {/* NSM Classification for screen readers */}
      {nsmClassification && (
        <Text accessibilityElementsHidden={false} style={styles.srOnly}>
          NSM-klassifisering: {nsmClassification}
        </Text>
      )}
    </Animated.View>
  );
};

// Alert Title Component
interface AlertTitleProps {
  size?: AlertSize;
  style?: TextStyle;
  children: React.ReactNode;
}

export const AlertTitle: React.FC<AlertTitleProps> = ({ size = 'md', style, children }) => {
  const sizeConfig = sizeConfigs[size];
  
  return (
    <Text
      style={[
        styles.title,
        { fontSize: sizeConfig.fontSize + 2 },
        style,
      ]}
    >
      {children}
    </Text>
  );
};

// Alert Description Component
interface AlertDescriptionProps {
  size?: AlertSize;
  style?: TextStyle;
  children: React.ReactNode;
}

export const AlertDescription: React.FC<AlertDescriptionProps> = ({ size = 'md', style, children }) => {
  const sizeConfig = sizeConfigs[size];
  
  return (
    <Text
      style={[
        styles.description,
        { fontSize: sizeConfig.fontSize - 1 },
        style,
      ]}
    >
      {children}
    </Text>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    borderWidth: 1,
    borderRadius: 8,
    overflow: 'hidden',
  },
  iconContainer: {
    marginRight: 12,
  },
  content: {
    flex: 1,
  },
  text: {
    fontWeight: '400',
  },
  title: {
    fontWeight: '600',
    marginBottom: 4,
  },
  description: {
    fontWeight: '400',
    opacity: 0.9,
  },
  dismissButton: {
    position: 'absolute',
    top: 12,
    right: 12,
    padding: 4,
  },
  srOnly: {
    position: 'absolute',
    width: 1,
    height: 1,
    padding: 0,
    margin: -1,
    overflow: 'hidden',
  },
});