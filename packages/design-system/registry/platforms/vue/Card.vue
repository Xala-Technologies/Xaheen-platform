<template>
  <div
    :class="cn(cardVariants({ variant, padding, rounded }), className)"
    v-bind="$attrs"
  >
    <slot />
  </div>
</template>

<script setup lang="ts">
import { cva } from 'class-variance-authority';
import { cn } from '../../lib/utils';

const cardVariants = cva(
  [
    'bg-card text-card-foreground',
    'border border-border',
    'transition-all duration-200'
  ],
  {
    variants: {
      variant: {
        default: 'shadow-md hover:shadow-lg',
        elevated: 'shadow-lg hover:shadow-xl',
        outline: 'shadow-sm hover:shadow-md',
        ghost: 'shadow-none hover:shadow-sm',
      },
      padding: {
        none: 'p-0',
        sm: 'p-4',
        md: 'p-6',
        lg: 'p-8',
        xl: 'p-10'
      },
      rounded: {
        none: 'rounded-none',
        sm: 'rounded-md',
        md: 'rounded-lg',
        lg: 'rounded-xl',
        xl: 'rounded-2xl',
        full: 'rounded-full'
      }
    },
    defaultVariants: {
      variant: 'default',
      padding: 'md',
      rounded: 'lg'
    }
  }
);

interface Props {
  variant?: 'default' | 'elevated' | 'outline' | 'ghost';
  padding?: 'none' | 'sm' | 'md' | 'lg' | 'xl';
  rounded?: 'none' | 'sm' | 'md' | 'lg' | 'xl' | 'full';
  className?: string;
}

withDefaults(defineProps<Props>(), {
  variant: 'default',
  padding: 'md',
  rounded: 'lg',
});
</script>