<!--
Vue 3 Button Implementation
Generated from universal ButtonSpec
-->

<template>
  <button
    :class="buttonClasses"
    :disabled="isDisabled"
    :aria-label="ariaLabel"
    :aria-disabled="isDisabled"
    :type="type"
    @click="handleClick"
    v-bind="$attrs"
  >
    <!-- Loading spinner -->
    <LoadingSpinner 
      v-if="loading" 
      :size="spinnerSize" 
      :class="'mr-2'"
    />
    
    <!-- Prefix icon -->
    <span 
      v-if="!loading && $slots.icon" 
      :class="'shrink-0 mr-2'"
    >
      <slot name="icon" />
    </span>

    <!-- Button content -->
    <span 
      v-if="$slots.default"
      :class="[loading && 'opacity-70']"
    >
      <slot />
    </span>

    <!-- Suffix icon -->
    <span 
      v-if="!loading && $slots.suffixIcon" 
      :class="'shrink-0 ml-2'"
    >
      <slot name="suffixIcon" />
    </span>
  </button>
</template>

<script setup lang="ts">
import { computed, useAttrs } from 'vue';

// =============================================================================
// COMPONENT PROPS
// =============================================================================

export interface ButtonProps {
  /**
   * Visual style variant
   */
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost' | 'destructive';
  
  /**
   * Size of the button
   */
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl';
  
  /**
   * Whether button is disabled
   */
  disabled?: boolean;
  
  /**
   * Whether button is in loading state
   */
  loading?: boolean;
  
  /**
   * Whether button should take full width
   */
  fullWidth?: boolean;
  
  /**
   * Button type attribute
   */
  type?: 'button' | 'submit' | 'reset';
  
  /**
   * Accessibility label
   */
  ariaLabel?: string;
}

const props = withDefaults(defineProps<ButtonProps>(), {
  variant: 'primary',
  size: 'md',
  disabled: false,
  loading: false,
  fullWidth: false,
  type: 'button'
});

// =============================================================================
// EMITS
// =============================================================================

const emit = defineEmits<{
  click: [event: MouseEvent];
}>();

// =============================================================================
// COMPUTED PROPERTIES
// =============================================================================

const isDisabled = computed(() => props.disabled || props.loading);

const spinnerSize = computed(() => {
  if (props.size === 'xs') return 'sm';
  if (props.size === 'xl') return 'lg';
  return 'md';
});

const buttonClasses = computed(() => {
  const baseClasses = [
    'inline-flex items-center justify-center gap-2',
    'rounded-md text-sm font-medium transition-colors',
    'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2',
    'disabled:pointer-events-none disabled:opacity-50',
    'select-none'
  ];

  // Variant classes
  const variantClasses = {
    primary: [
      'bg-primary text-primary-foreground',
      'hover:bg-primary/90',
      'focus-visible:ring-primary'
    ],
    secondary: [
      'bg-secondary text-secondary-foreground',
      'hover:bg-secondary/80',
      'focus-visible:ring-secondary'
    ],
    outline: [
      'border border-input bg-background',
      'hover:bg-accent hover:text-accent-foreground',
      'focus-visible:ring-primary'
    ],
    ghost: [
      'hover:bg-accent hover:text-accent-foreground',
      'focus-visible:ring-primary'
    ],
    destructive: [
      'bg-destructive text-destructive-foreground',
      'hover:bg-destructive/90',
      'focus-visible:ring-destructive'
    ]
  };

  // Size classes
  const sizeClasses = {
    xs: 'h-8 px-3 text-xs',
    sm: 'h-10 px-4 text-sm',
    md: 'h-12 px-6 text-base',
    lg: 'h-14 px-8 text-lg',
    xl: 'h-16 px-10 text-xl'
  };

  return [
    ...baseClasses,
    ...variantClasses[props.variant],
    sizeClasses[props.size],
    props.fullWidth && 'w-full'
  ].filter(Boolean);
});

// =============================================================================
// EVENT HANDLERS
// =============================================================================

const handleClick = (event: MouseEvent) => {
  if (!isDisabled.value) {
    emit('click', event);
  }
};

// =============================================================================
// ATTRS INHERITANCE
// =============================================================================

const attrs = useAttrs();

// Exclude Vue-specific attrs from being passed to the button element
defineOptions({
  inheritAttrs: false
});
</script>

<script lang="ts">
/**
 * Loading Spinner Component
 */
import { defineComponent, h } from 'vue';

const LoadingSpinner = defineComponent({
  name: 'LoadingSpinner',
  props: {
    size: {
      type: String as () => 'sm' | 'md' | 'lg',
      default: 'md'
    }
  },
  setup(props) {
    const sizeClasses = {
      sm: 'h-3 w-3',
      md: 'h-4 w-4',
      lg: 'h-5 w-5'
    };

    return () =>
      h('svg', {
        class: `animate-spin ${sizeClasses[props.size]}`,
        xmlns: 'http://www.w3.org/2000/svg',
        fill: 'none',
        viewBox: '0 0 24 24'
      }, [
        h('circle', {
          class: 'opacity-25',
          cx: '12',
          cy: '12',
          r: '10',
          stroke: 'currentColor',
          'stroke-width': '4'
        }),
        h('path', {
          class: 'opacity-75',
          fill: 'currentColor',
          d: 'm4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z'
        })
      ]);
  }
});

export default LoadingSpinner;
</script>

<style scoped>
/* Component-specific styles if needed */
</style>