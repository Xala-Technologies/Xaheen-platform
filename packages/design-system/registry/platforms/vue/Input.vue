<template>
  <div :class="cn('relative', fullWidth && 'w-full')" v-if="leadingIcon || trailingIcon || helperText">
    <div 
      v-if="leadingIcon" 
      class="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground pointer-events-none" 
      aria-hidden="true"
    >
      <slot name="leading-icon" />
    </div>
    
    <input
      :type="type"
      :class="cn(
        inputVariants({ variant: stateVariant, size, fullWidth }),
        leadingIcon && 'pl-12',
        trailingIcon && 'pr-12',
        className
      )"
      :disabled="disabled"
      :aria-invalid="error ? 'true' : undefined"
      :aria-describedby="combinedAriaDescribedBy"
      v-bind="$attrs"
      v-model="modelValue"
      @input="$emit('update:modelValue', ($event.target as HTMLInputElement).value)"
    />
    
    <div 
      v-if="trailingIcon" 
      class="absolute right-4 top-1/2 -translate-y-1/2 text-muted-foreground pointer-events-none" 
      aria-hidden="true"
    >
      <slot name="trailing-icon" />
    </div>
    
    <p 
      v-if="helperText"
      :id="helperTextId"
      :class="cn(
        'mt-2 text-sm',
        error && 'text-destructive',
        success && 'text-green-600',
        warning && 'text-yellow-600',
        !error && !success && !warning && 'text-muted-foreground'
      )"
    >
      {{ helperText }}
    </p>
  </div>
  
  <input
    v-else
    :type="type"
    :class="cn(
      inputVariants({ variant: stateVariant, size, fullWidth }),
      className
    )"
    :disabled="disabled"
    :aria-invalid="error ? 'true' : undefined"
    :aria-describedby="combinedAriaDescribedBy"
    v-bind="$attrs"
    v-model="modelValue"
    @input="$emit('update:modelValue', ($event.target as HTMLInputElement).value)"
  />
</template>

<script setup lang="ts">
import { computed, useId } from 'vue';
import { cva } from 'class-variance-authority';
import { cn } from '../../lib/utils';

const inputVariants = cva(
  [
    'flex w-full',
    'font-medium text-foreground placeholder:text-muted-foreground',
    'bg-background',
    'border-2 border-input',
    'transition-all duration-200 ease-in-out',
    'disabled:cursor-not-allowed disabled:opacity-50',
    'focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary/20',
    'focus:border-primary',
    'file:border-0 file:bg-transparent file:text-sm file:font-medium',
    'autofill:bg-background',
    'contrast-more:border-2'
  ],
  {
    variants: {
      variant: {
        default: '',
        error: 'border-destructive focus:ring-destructive/20 focus:border-destructive',
        success: 'border-green-600 focus:ring-green-600/20 focus:border-green-600',
        warning: 'border-yellow-600 focus:ring-yellow-600/20 focus:border-yellow-600',
      },
      size: {
        md: 'h-12 px-4 py-3 text-base rounded-lg',
        lg: 'h-14 px-5 py-4 text-lg rounded-lg',
        xl: 'h-16 px-6 py-5 text-xl rounded-xl',
      },
      fullWidth: {
        true: 'w-full',
        false: 'w-auto'
      }
    },
    defaultVariants: {
      variant: 'default',
      size: 'lg',
      fullWidth: true
    }
  }
);

interface Props {
  modelValue?: string | number;
  type?: string;
  variant?: 'default' | 'error' | 'success' | 'warning';
  size?: 'md' | 'lg' | 'xl';
  fullWidth?: boolean;
  error?: boolean;
  success?: boolean;
  warning?: boolean;
  helperText?: string;
  leadingIcon?: boolean;
  trailingIcon?: boolean;
  disabled?: boolean;
  className?: string;
}

const props = withDefaults(defineProps<Props>(), {
  type: 'text',
  variant: 'default',
  size: 'lg',
  fullWidth: true,
  error: false,
  success: false,
  warning: false,
  disabled: false,
});

defineEmits<{
  'update:modelValue': [value: string | number];
}>();

const stateVariant = computed(() => {
  if (props.error) return 'error';
  if (props.success) return 'success';
  if (props.warning) return 'warning';
  return props.variant;
});

const helperId = useId();
const helperTextId = computed(() => props.helperText ? `${helperId}-helper` : undefined);
const combinedAriaDescribedBy = computed(() => {
  const parts = [];
  if (helperTextId.value) parts.push(helperTextId.value);
  return parts.length > 0 ? parts.join(' ') : undefined;
});
</script>