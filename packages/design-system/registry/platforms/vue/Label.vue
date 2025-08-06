<template>
  <label
    :for="htmlFor"
    :class="labelClasses"
  >
    <slot />
    <span v-if="required" class="ml-1 text-destructive" aria-label="required">*</span>
  </label>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { cva, type VariantProps } from 'class-variance-authority'
import { cn } from '../../lib/utils'

// Label variants
const labelVariants = cva(
  [
    'text-sm font-medium leading-none',
    'peer-disabled:cursor-not-allowed peer-disabled:opacity-70'
  ],
  {
    variants: {
      size: {
        sm: 'text-xs',
        md: 'text-sm',
        lg: 'text-base',
        xl: 'text-lg'
      },
      variant: {
        default: 'text-foreground',
        muted: 'text-muted-foreground',
        destructive: 'text-destructive',
        success: 'text-green-600 dark:text-green-400'
      }
    },
    defaultVariants: {
      size: 'md',
      variant: 'default'
    }
  }
)

// Props
interface Props extends VariantProps<typeof labelVariants> {
  htmlFor?: string
  required?: boolean
  class?: string
}

const props = withDefaults(defineProps<Props>(), {
  required: false,
  size: 'md',
  variant: 'default'
})

// Computed
const labelClasses = computed(() => {
  return cn(
    labelVariants({ size: props.size, variant: props.variant }),
    props.class
  )
})
</script>