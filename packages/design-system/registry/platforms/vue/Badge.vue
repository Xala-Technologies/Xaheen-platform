<template>
  <component
    :is="as"
    :class="badgeClasses"
    :data-variant="variant"
    :data-size="size"
  >
    <slot />
  </component>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { cva, type VariantProps } from 'class-variance-authority'
import { cn } from '../../lib/utils'

// Badge variants
const badgeVariants = cva(
  [
    'inline-flex items-center rounded-full border font-medium',
    'transition-all duration-200',
    'focus:outline-none focus:ring-2 focus:ring-offset-2'
  ],
  {
    variants: {
      variant: {
        default: [
          'border-transparent bg-primary text-primary-foreground',
          'hover:bg-primary/90 focus:ring-primary'
        ],
        secondary: [
          'border-transparent bg-secondary text-secondary-foreground',
          'hover:bg-secondary/80 focus:ring-secondary'
        ],
        destructive: [
          'border-transparent bg-destructive text-destructive-foreground',
          'hover:bg-destructive/90 focus:ring-destructive'
        ],
        outline: [
          'text-foreground border-input',
          'hover:bg-accent hover:text-accent-foreground focus:ring-accent'
        ],
        success: [
          'border-transparent bg-green-100 text-green-800',
          'dark:bg-green-900/20 dark:text-green-400',
          'hover:bg-green-200 dark:hover:bg-green-900/30 focus:ring-green-500'
        ],
        warning: [
          'border-transparent bg-yellow-100 text-yellow-800',
          'dark:bg-yellow-900/20 dark:text-yellow-400',
          'hover:bg-yellow-200 dark:hover:bg-yellow-900/30 focus:ring-yellow-500'
        ],
        info: [
          'border-transparent bg-blue-100 text-blue-800',
          'dark:bg-blue-900/20 dark:text-blue-400',
          'hover:bg-blue-200 dark:hover:bg-blue-900/30 focus:ring-blue-500'
        ]
      },
      size: {
        sm: 'px-2 py-0.5 text-xs h-5',
        md: 'px-2.5 py-0.5 text-sm h-6',
        lg: 'px-3 py-1 text-base h-7',
        xl: 'px-4 py-1.5 text-lg h-8'
      }
    },
    defaultVariants: {
      variant: 'default',
      size: 'md'
    }
  }
)

// Props
interface Props extends VariantProps<typeof badgeVariants> {
  as?: string
  class?: string
}

const props = withDefaults(defineProps<Props>(), {
  as: 'span',
  variant: 'default',
  size: 'md'
})

// Computed
const badgeClasses = computed(() => {
  return cn(
    badgeVariants({ variant: props.variant, size: props.size }),
    props.class
  )
})
</script>