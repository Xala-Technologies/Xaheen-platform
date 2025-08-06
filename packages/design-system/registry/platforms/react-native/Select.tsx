import React, { useState, useCallback } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  Modal,
  FlatList,
  StyleSheet,
  ViewStyle,
  TextStyle,
  SafeAreaView,
} from 'react-native';
import Svg, { Path } from 'react-native-svg';

// Select variant types
type SelectVariant = 'default' | 'destructive' | 'success';
type SelectSize = 'sm' | 'md' | 'lg';

// Select option interface
export interface SelectOption {
  value: string;
  label: string;
  disabled?: boolean;
}

// Props interface
interface SelectProps {
  value?: string;
  options: SelectOption[];
  placeholder?: string;
  variant?: SelectVariant;
  size?: SelectSize;
  disabled?: boolean;
  required?: boolean;
  style?: ViewStyle;
  onValueChange?: (value: string) => void;
}

// Variant colors
const variantColors = {
  default: {
    border: '#d1d5db',
    background: '#ffffff',
    text: '#111827',
    placeholder: '#6b7280',
  },
  destructive: {
    border: '#ef4444',
    background: '#fef2f2',
    text: '#991b1b',
    placeholder: '#ef4444',
  },
  success: {
    border: '#10b981',
    background: '#f0fdf4',
    text: '#065f46',
    placeholder: '#10b981',
  },
};

// Size configurations
const sizeConfigs = {
  sm: {
    height: 40,
    fontSize: 14,
    paddingHorizontal: 12,
  },
  md: {
    height: 48,
    fontSize: 16,
    paddingHorizontal: 16,
  },
  lg: {
    height: 56,
    fontSize: 18,
    paddingHorizontal: 20,
  },
};

export const Select: React.FC<SelectProps> = ({
  value = '',
  options,
  placeholder = 'Select an option',
  variant = 'default',
  size = 'md',
  disabled = false,
  required = false,
  style,
  onValueChange,
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [selectedValue, setSelectedValue] = useState(value);

  const colors = variantColors[variant];
  const sizeConfig = sizeConfigs[size];

  const selectedOption = options.find(opt => opt.value === selectedValue);

  const handleSelect = useCallback((option: SelectOption) => {
    if (option.disabled) return;
    
    setSelectedValue(option.value);
    onValueChange?.(option.value);
    setIsOpen(false);
  }, [onValueChange]);

  const renderOption = ({ item }: { item: SelectOption }) => (
    <TouchableOpacity
      style={[
        styles.option,
        {
          opacity: item.disabled ? 0.5 : 1,
          backgroundColor: item.value === selectedValue ? colors.background : 'transparent',
        },
      ]}
      onPress={() => handleSelect(item)}
      disabled={item.disabled}
    >
      <Text
        style={[
          styles.optionText,
          {
            color: colors.text,
            fontSize: sizeConfig.fontSize,
          },
        ]}
      >
        {item.label}
      </Text>
    </TouchableOpacity>
  );

  return (
    <>
      <TouchableOpacity
        style={[
          styles.container,
          {
            height: sizeConfig.height,
            borderColor: colors.border,
            backgroundColor: colors.background,
            paddingHorizontal: sizeConfig.paddingHorizontal,
            opacity: disabled ? 0.5 : 1,
          },
          style,
        ]}
        onPress={() => !disabled && setIsOpen(true)}
        disabled={disabled}
      >
        <Text
          style={[
            styles.text,
            {
              color: selectedOption ? colors.text : colors.placeholder,
              fontSize: sizeConfig.fontSize,
            },
          ]}
        >
          {selectedOption?.label || placeholder}
        </Text>
        
        <Svg
          width={16}
          height={16}
          viewBox="0 0 24 24"
          fill="none"
          stroke={colors.text}
          strokeWidth={2}
          strokeLinecap="round"
          strokeLinejoin="round"
          style={styles.icon}
        >
          <Path d="M19 9l-7 7-7-7" />
        </Svg>
      </TouchableOpacity>

      <Modal
        visible={isOpen}
        transparent
        animationType="fade"
        onRequestClose={() => setIsOpen(false)}
      >
        <TouchableOpacity
          style={styles.modalOverlay}
          activeOpacity={1}
          onPress={() => setIsOpen(false)}
        >
          <SafeAreaView style={styles.modalContent}>
            <View style={[styles.optionsContainer, { backgroundColor: colors.background }]}>
              <FlatList
                data={options}
                renderItem={renderOption}
                keyExtractor={item => item.value}
                style={styles.optionsList}
              />
            </View>
          </SafeAreaView>
        </TouchableOpacity>
      </Modal>
    </>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderWidth: 1,
    borderRadius: 8,
    paddingRight: 40,
  },
  text: {
    flex: 1,
  },
  icon: {
    position: 'absolute',
    right: 12,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    width: '90%',
    maxHeight: '70%',
  },
  optionsContainer: {
    borderRadius: 8,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  optionsList: {
    maxHeight: 300,
  },
  option: {
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#e5e7eb',
  },
  optionText: {
    fontWeight: '400',
  },
});