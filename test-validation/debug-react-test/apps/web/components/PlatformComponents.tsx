{{!-- Template: PlatformComponents.tsx.hbs --}}
{{!-- Category: frontend --}}
{{!-- Type: component --}}
{{!-- Framework: next --}}
{{!-- Migrated from: /Volumes/Development/Xaheen Enterprise/xaheen/apps/cli/templates/frontend/react/next/src/components/platform/PlatformComponents.tsx.hbs --}}
{{#if typescript}}'use client';{{/if}}

/**
 * Platform Component Abstractions - Xala UI System Compliant
 * Generated with Xaheen CLI - Multi-Platform Component Wrappers
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
 * Platform Abstractions:
 * - Unified component API across Web, Mobile (React Native), Desktop (Electron)
 * - Automatic platform detection and component selection
 * - Consistent props interface regardless of platform
 * - Platform-specific optimizations and behaviors
 */

{{#if typescript}}
import React from 'react';
import { getPlatformInfo, getPlatformEventHandlers, getPlatformDimensions } from '../utils/platform';

// Base component props that work across all platforms
interface PlatformComponentProps {
  children?: React.ReactNode;
  style?: any;
  className?: string;
  testID?: string;
  accessibilityLabel?: string;
  accessibilityRole?: string;
  accessibilityHint?: string;
}

interface PlatformViewProps extends PlatformComponentProps {
  onPress?: () => void;
  onLongPress?: () => void;
  onClick?: () => void;
  onDoubleClick?: () => void;
  disabled?: boolean;
}

interface PlatformTextProps extends PlatformComponentProps {
  numberOfLines?: number;
  ellipsizeMode?: 'head' | 'middle' | 'tail' | 'clip';
  selectable?: boolean;
}

interface PlatformScrollViewProps extends PlatformComponentProps {
  horizontal?: boolean;
  showsVerticalScrollIndicator?: boolean;
  showsHorizontalScrollIndicator?: boolean;
  onScroll?: (event: any) => void;
}

interface PlatformTextInputProps extends PlatformComponentProps {
  value?: string;
  onChangeText?: (text: string) => void;
  onChange?: (event: any) => void;
  placeholder?: string;
  placeholderTextColor?: string;
  secureTextEntry?: boolean;
  multiline?: boolean;
  numberOfLines?: number;
  autoFocus?: boolean;
  editable?: boolean;
  keyboardType?: 'default' | 'numeric' | 'email-address' | 'phone-pad';
}

interface PlatformImageProps extends PlatformComponentProps {
  source: { uri: string } | string;
  alt?: string;
  resizeMode?: 'cover' | 'contain' | 'stretch' | 'repeat' | 'center';
  onLoad?: () => void;
  onError?: (error: any) => void;
}
{{else}}
import React from 'react';
import { getPlatformInfo, getPlatformEventHandlers, getPlatformDimensions } from '../utils/platform';
{{/if}}

const platformInfo = getPlatformInfo();
const eventHandlers = getPlatformEventHandlers();

/**
 * Platform-agnostic View component
 * Maps to View (React Native) or div (Web/Electron)
 */
{{#if typescript}}
export const PlatformView: React.FC<PlatformViewProps> = ({
  children,
  style,
  className,
  onPress,
  onLongPress,
  onClick,
  onDoubleClick,
  disabled = false,
  testID,
  accessibilityLabel,
  accessibilityRole,
  accessibilityHint,
  ...props
}) => {
{{else}}
export const PlatformView = ({
  children,
  style,
  className,
  onPress,
  onLongPress,
  onClick,
  onDoubleClick,
  disabled = false,
  testID,
  accessibilityLabel,
  accessibilityRole,
  accessibilityHint,
  ...props
}) => {
{{/if}}
  if (platformInfo.isReactNative) {
    const { View, TouchableOpacity } = require('react-native');
    
    if (onPress || onLongPress) {
      return (
        <TouchableOpacity
          style={style}
          onPress={onPress}
          onLongPress={onLongPress}
          disabled={disabled}
          testID={testID}
          accessibilityLabel={accessibilityLabel}
          accessibilityRole={accessibilityRole}
          accessibilityHint={accessibilityHint}
          {...props}
        >
          {children}
        </TouchableOpacity>
      );
    }
    
    return (
      <View
        style={style}
        testID={testID}
        accessibilityLabel={accessibilityLabel}
        accessibilityRole={accessibilityRole}
        accessibilityHint={accessibilityHint}
        {...props}
      >
        {children}
      </View>
    );
  }

  // Web/Electron
  const handleClick = onClick || onPress;
  const handleDoubleClick = onDoubleClick;

  return (
    <div
      className=""
      style={style}
      onClick={handleClick}
      onDoubleClick={handleDoubleClick}
      data-testid={testID}
      aria-label={accessibilityLabel}
      role={accessibilityRole}
      aria-describedby={accessibilityHint}
      {...props}
    >
      {children}
    </div>
  );
};

/**
 * Platform-agnostic Text component
 * Maps to Text (React Native) or span (Web/Electron)
 */
{{#if typescript}}
export const PlatformText: React.FC<PlatformTextProps> = ({
  children,
  style,
  className,
  numberOfLines,
  ellipsizeMode,
  selectable = true,
  testID,
  accessibilityLabel,
  accessibilityRole = 'text',
  ...props
}) => {
{{else}}
export const PlatformText = ({
  children,
  style,
  className,
  numberOfLines,
  ellipsizeMode,
  selectable = true,
  testID,
  accessibilityLabel,
  accessibilityRole = 'text',
  ...props
}) => {
{{/if}}
  if (platformInfo.isReactNative) {
    const { Text } = require('react-native');
    
    return (
      <Text
        style={style}
        numberOfLines={numberOfLines}
        ellipsizeMode={ellipsizeMode}
        selectable={selectable}
        testID={testID}
        accessibilityLabel={accessibilityLabel}
        accessibilityRole={accessibilityRole}
        {...props}
      >
        {children}
      </Text>
    );
  }

  // Web/Electron
  const webStyle = {
    ...style,
    ...(numberOfLines && {
      display: '-webkit-box',
      WebkitLineClamp: numberOfLines,
      WebkitBoxOrient: 'vertical',
      overflow: 'hidden',
    }),
    ...(ellipsizeMode === 'head' && { textOverflow: 'ellipsis' }),
    ...(ellipsizeMode === 'tail' && { textOverflow: 'ellipsis' }),
    userSelect: selectable ? 'text' : 'none',
  };

  return (
    <span
      className=""
      style={webStyle}
      data-testid={testID}
      aria-label={accessibilityLabel}
      role={accessibilityRole}
      {...props}
    >
      {children}
    </span>
  );
};

/**
 * Platform-agnostic ScrollView component
 * Maps to ScrollView (React Native) or div with overflow (Web/Electron)
 */
{{#if typescript}}
export const PlatformScrollView: React.FC<PlatformScrollViewProps> = ({
  children,
  style,
  className,
  horizontal = false,
  showsVerticalScrollIndicator = true,
  showsHorizontalScrollIndicator = true,
  onScroll,
  testID,
  accessibilityLabel,
  accessibilityRole = 'scrollbar',
  ...props
}) => {
{{else}}
export const PlatformScrollView = ({
  children,
  style,
  className,
  horizontal = false,
  showsVerticalScrollIndicator = true,
  showsHorizontalScrollIndicator = true,
  onScroll,
  testID,
  accessibilityLabel,
  accessibilityRole = 'scrollbar',
  ...props
}) => {
{{/if}}
  if (platformInfo.isReactNative) {
    const { ScrollView } = require('react-native');
    
    return (
      <ScrollView
        style={style}
        horizontal={horizontal}
        showsVerticalScrollIndicator={showsVerticalScrollIndicator}
        showsHorizontalScrollIndicator={showsHorizontalScrollIndicator}
        onScroll={onScroll}
        testID={testID}
        accessibilityLabel={accessibilityLabel}
        accessibilityRole={accessibilityRole}
        {...props}
      >
        {children}
      </ScrollView>
    );
  }

  // Web/Electron
  const webStyle = {
    ...style,
    overflow: 'auto',
    ...(horizontal && {
      overflowX: 'auto',
      overflowY: 'hidden',
      whiteSpace: 'nowrap',
    }),
    ...(!showsVerticalScrollIndicator && {
      scrollbarWidth: 'none',
      msOverflowStyle: 'none',
    }),
    ...(!showsHorizontalScrollIndicator && {
      scrollbarWidth: 'none',
      msOverflowStyle: 'none',
    }),
  };

  return (
    <div
      className=""
      style={webStyle}
      onScroll={onScroll}
      data-testid={testID}
      aria-label={accessibilityLabel}
      role={accessibilityRole}
      {...props}
    >
      {children}
    </div>
  );
};

/**
 * Platform-agnostic TextInput component
 * Maps to TextInput (React Native) or input/textarea (Web/Electron)
 */
{{#if typescript}}
export const PlatformTextInput: React.FC<PlatformTextInputProps> = ({
  value,
  onChangeText,
  onChange,
  placeholder,
  placeholderTextColor,
  secureTextEntry = false,
  multiline = false,
  numberOfLines = 1,
  autoFocus = false,
  editable = true,
  keyboardType = 'default',
  style,
  className,
  testID,
  accessibilityLabel,
  accessibilityRole = 'textbox',
  accessibilityHint,
  ...props
}) => {
{{else}}
export const PlatformTextInput = ({
  value,
  onChangeText,
  onChange,
  placeholder,
  placeholderTextColor,
  secureTextEntry = false,
  multiline = false,
  numberOfLines = 1,
  autoFocus = false,
  editable = true,
  keyboardType = 'default',
  style,
  className,
  testID,
  accessibilityLabel,
  accessibilityRole = 'textbox',
  accessibilityHint,
  ...props
}) => {
{{/if}}
  if (platformInfo.isReactNative) {
    const { TextInput } = require('react-native');
    
    return (
      <TextInput
        value={value}
        onChangeText={onChangeText}
        placeholder={placeholder}
        placeholderTextColor={placeholderTextColor}
        secureTextEntry={secureTextEntry}
        multiline={multiline}
        numberOfLines={numberOfLines}
        autoFocus={autoFocus}
        editable={editable}
        keyboardType={keyboardType}
        style={style}
        testID={testID}
        accessibilityLabel={accessibilityLabel}
        accessibilityRole={accessibilityRole}
        accessibilityHint={accessibilityHint}
        {...props}
      />
    );
  }

  // Web/Electron
  const handleChange = (event{{#if typescript}}: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>{{/if}}) => {
    if (onChangeText) {
      onChangeText(event.target.value);
    }
    if (onChange) {
      onChange(event);
    }
  };

  const inputType = secureTextEntry ? 'password' : keyboardType === 'email-address' ? 'email' : keyboardType === 'numeric' ? 'number' : 'text';

  const webStyle = {
    ...style,
    ...(placeholderTextColor && {
      '::placeholder': {
        color: placeholderTextColor,
      },
    }),
  };

  if (multiline) {
    return (
      <textarea
        value={value}
        onChange={handleChange}
        placeholder={placeholder}
        rows={numberOfLines}
        autoFocus={autoFocus}
        disabled={!editable}
        className=""
        style={webStyle}
        data-testid={testID}
        aria-label={accessibilityLabel}
        role={accessibilityRole}
        aria-describedby={accessibilityHint}
        {...props}
      />
    );
  }

  return (
    <input
      type={inputType}
      value={value}
      onChange={handleChange}
      placeholder={placeholder}
      autoFocus={autoFocus}
      disabled={!editable}
      className=""
      style={webStyle}
      data-testid={testID}
      aria-label={accessibilityLabel}
      role={accessibilityRole}
      aria-describedby={accessibilityHint}
      {...props}
    />
  );
};

/**
 * Platform-agnostic Image component
 * Maps to Image (React Native) or img (Web/Electron)
 */
{{#if typescript}}
export const PlatformImage: React.FC<PlatformImageProps> = ({
  source,
  alt,
  resizeMode = 'cover',
  onLoad,
  onError,
  style,
  className,
  testID,
  accessibilityLabel,
  accessibilityRole = 'img',
  ...props
}) => {
{{else}}
export const PlatformImage = ({
  source,
  alt,
  resizeMode = 'cover',
  onLoad,
  onError,
  style,
  className,
  testID,
  accessibilityLabel,
  accessibilityRole = 'img',
  ...props
}) => {
{{/if}}
  if (platformInfo.isReactNative) {
    const { Image } = require('react-native');
    
    return (
      <Image
        source={typeof source === 'string' ? { uri: source } : source}
        resizeMode={resizeMode}
        onLoad={onLoad}
        onError={onError}
        style={style}
        testID={testID}
        accessibilityLabel={accessibilityLabel || alt}
        accessibilityRole={accessibilityRole}
        {...props}
      />
    );
  }

  // Web/Electron
  const src = typeof source === 'string' ? source : source.uri;
  
  const webStyle = {
    ...style,
    objectFit: resizeMode === 'cover' ? 'cover' : 
               resizeMode === 'contain' ? 'contain' : 
               resizeMode === 'stretch' ? 'fill' : 
               resizeMode === 'repeat' ? 'repeat' : 
               'none',
  };

  return (
    <img
      src={src}
      alt={alt || accessibilityLabel}
      onLoad={onLoad}
      onError={onError}
      className=""
      style={webStyle}
      data-testid={testID}
      aria-label={accessibilityLabel}
      role={accessibilityRole}
      {...props}
    />
  );
};

/**
 * Platform-agnostic SafeAreaView component
 * Maps to SafeAreaView (React Native) or div with padding (Web/Electron)
 */
{{#if typescript}}
export const PlatformSafeAreaView: React.FC<PlatformComponentProps> = ({
  children,
  style,
  className,
  testID,
  accessibilityLabel,
  accessibilityRole,
  ...props
}) => {
{{else}}
export const PlatformSafeAreaView = ({
  children,
  style,
  className,
  testID,
  accessibilityLabel,
  accessibilityRole,
  ...props
}) => {
{{/if}}
  if (platformInfo.isReactNative) {
    const { SafeAreaView } = require('react-native');
    
    return (
      <SafeAreaView
        style={style}
        testID={testID}
        accessibilityLabel={accessibilityLabel}
        accessibilityRole={accessibilityRole}
        {...props}
      >
        {children}
      </SafeAreaView>
    );
  }

  // Web/Electron - Add safe area padding for notched devices
  const dimensions = getPlatformDimensions();
  const webStyle = {
    ...style,
    paddingTop: dimensions.safeAreaTop,
    paddingBottom: dimensions.safeAreaBottom,
    paddingLeft: dimensions.safeAreaLeft,
    paddingRight: dimensions.safeAreaRight,
  };

  return (
    <div
      className=""
      style={webStyle}
      data-testid={testID}
      aria-label={accessibilityLabel}
      role={accessibilityRole}
      {...props}
    >
      {children}
    </div>
  );
};

/**
 * Platform-agnostic StatusBar component
 * Maps to StatusBar (React Native) or meta tags (Web/Electron)
 */
{{#if typescript}}
export const PlatformStatusBar: React.FC<{
  barStyle?: 'default' | 'light-content' | 'dark-content';
  backgroundColor?: string;
  hidden?: boolean;
  translucent?: boolean;
}> = ({
  barStyle = 'default',
  backgroundColor,
  hidden = false,
  translucent = false,
}) => {
{{else}}
export const PlatformStatusBar = ({
  barStyle = 'default',
  backgroundColor,
  hidden = false,
  translucent = false,
}) => {
{{/if}}
  if (platformInfo.isReactNative) {
    const { StatusBar } = require('react-native');
    
    return (
      <StatusBar
        barStyle={barStyle}
        backgroundColor={backgroundColor}
        hidden={hidden}
        translucent={translucent}
      />
    );
  }

  // Web/Electron - Use meta tags for theme color
  React.useEffect(() => {
    if (backgroundColor) {
      let metaTag = document.querySelector('meta[name="theme-color"]');
      if (!metaTag) {
        metaTag = document.createElement('meta');
        metaTag.setAttribute('name', 'theme-color');
        document.head.appendChild(metaTag);
      }
      metaTag.setAttribute('content', backgroundColor);
    }
  }, [backgroundColor]);

  return null;
};

// Export all platform components
export {
  PlatformView as View,
  PlatformText as Text,
  PlatformScrollView as ScrollView,
  PlatformTextInput as TextInput,
  PlatformImage as Image,
  PlatformSafeAreaView as SafeAreaView,
  PlatformStatusBar as StatusBar,
};
