<template>
  <div
    v-if="isVisible"
    :role="ariaRole"
    :aria-live="ariaLive"
    :tabindex="autoFocus ? -1 : undefined"
    :class="alertClasses"
    :data-variant="finalVariant"
    ref="alertRef"
  >
    <!-- Icon -->
    <component
      v-if="shouldShowIcon && iconComponent"
      :is="iconComponent"
      class="h-5 w-5"
    />
    
    <!-- Content -->
    <div class="flex-1 min-w-0">
      <slot />
    </div>

    <!-- Dismiss Button -->
    <button
      v-if="dismissible"
      type="button"
      @click="handleDismiss"
      aria-label="Lukk varsling"
      :class="dismissButtonClasses"
    >
      <XMarkIcon class="h-4 w-4" />
    </button>

    <!-- NSM Classification for screen readers -->
    <span v-if="nsmClassification" class="sr-only">
      NSM-klassifisering: {{ nsmClassification }}
    </span>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, onBeforeUnmount, watch } from 'vue'
import { cva, type VariantProps } from 'class-variance-authority'
import {
  CheckCircleIcon,
  ExclamationTriangleIcon,
  XCircleIcon,
  InformationCircleIcon,
  XMarkIcon
} from '@heroicons/vue/24/outline'
import { cn } from '../../lib/utils'

// Alert variants
const alertVariants = cva(
  [
    'relative w-full rounded-lg border px-6 py-4',
    'text-sm transition-all duration-200',
    '[&>svg~*]:pl-7 [&>svg+div]:translate-y-[-3px] [&>svg]:absolute [&>svg]:left-4 [&>svg]:top-4 [&>svg]:text-foreground',
    'min-h-[3rem] flex items-start gap-3'
  ],
  {
    variants: {
      variant: {
        default: [
          'bg-background text-foreground',
          'border-border'
        ],
        destructive: [
          'border-destructive/50 text-destructive dark:border-destructive',
          'bg-destructive/10 [&>svg]:text-destructive'
        ],
        warning: [
          'border-yellow-500/50 text-yellow-900 dark:text-yellow-100',
          'bg-yellow-50 dark:bg-yellow-900/20 [&>svg]:text-yellow-600 dark:[&>svg]:text-yellow-400'
        ],
        success: [
          'border-green-500/50 text-green-900 dark:text-green-100',
          'bg-green-50 dark:bg-green-900/20 [&>svg]:text-green-600 dark:[&>svg]:text-green-400'
        ],
        info: [
          'border-blue-500/50 text-blue-900 dark:text-blue-100',
          'bg-blue-50 dark:bg-blue-900/20 [&>svg]:text-blue-600 dark:[&>svg]:text-blue-400'
        ],
        nsmOpen: [
          'border-green-600/50 text-green-900 dark:text-green-100',
          'bg-green-50 dark:bg-green-900/20 [&>svg]:text-green-600',
          'border-l-4 border-l-green-600'
        ],
        nsmRestricted: [
          'border-yellow-600/50 text-yellow-900 dark:text-yellow-100',
          'bg-yellow-50 dark:bg-yellow-900/20 [&>svg]:text-yellow-600',
          'border-l-4 border-l-yellow-600'
        ],
        nsmConfidential: [
          'border-red-600/50 text-red-900 dark:text-red-100',
          'bg-red-50 dark:bg-red-900/20 [&>svg]:text-red-600',
          'border-l-4 border-l-red-600'
        ],
        nsmSecret: [
          'border-gray-600/50 text-gray-900 dark:text-gray-100',
          'bg-gray-50 dark:bg-gray-900/20 [&>svg]:text-gray-600',
          'border-l-4 border-l-gray-800'
        ]
      },
      size: {
        sm: 'px-4 py-3 text-sm min-h-[2.5rem]',
        md: 'px-6 py-4 text-base min-h-[3rem]',
        lg: 'px-8 py-5 text-lg min-h-[3.5rem]'
      }
    },
    defaultVariants: {
      variant: 'default',
      size: 'md'
    }
  }
)

// Props
interface Props extends VariantProps<typeof alertVariants> {
  dismissible?: boolean
  icon?: boolean
  nsmClassification?: 'OPEN' | 'RESTRICTED' | 'CONFIDENTIAL' | 'SECRET'
  ariaLive?: 'polite' | 'assertive' | 'off'
  autoFocus?: boolean
  class?: string
}

const props = withDefaults(defineProps<Props>(), {
  variant: 'default',
  size: 'md',
  dismissible: false,
  icon: true,
  ariaLive: 'polite',
  autoFocus: false
})

// Emits
const emit = defineEmits<{
  dismiss: []
}>()

// Icon mapping
const variantIcons = {
  default: InformationCircleIcon,
  destructive: XCircleIcon,
  warning: ExclamationTriangleIcon,
  success: CheckCircleIcon,
  info: InformationCircleIcon,
  nsmOpen: CheckCircleIcon,
  nsmRestricted: ExclamationTriangleIcon,
  nsmConfidential: XCircleIcon,
  nsmSecret: XCircleIcon
} as const

// State
const isVisible = ref(true)
const alertRef = ref<HTMLDivElement>()

// Computed
const finalVariant = computed(() => {
  if (props.nsmClassification) {
    return `nsm${props.nsmClassification.charAt(0).toUpperCase() + props.nsmClassification.slice(1).toLowerCase()}` as keyof typeof variantIcons
  }
  return props.variant as keyof typeof variantIcons
})

const shouldShowIcon = computed(() => props.icon !== false)

const iconComponent = computed(() => {
  if (!shouldShowIcon.value) return null
  return variantIcons[finalVariant.value]
})

const alertClasses = computed(() => {
  return cn(
    alertVariants({ variant: finalVariant.value, size: props.size }),
    props.dismissible && 'pr-12',
    props.class
  )
})

const dismissButtonClasses = computed(() => {
  return cn(
    'absolute right-4 top-4 rounded-md p-1',
    'opacity-70 hover:opacity-100 focus:opacity-100',
    'focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-current',
    'transition-opacity duration-200'
  )
})

const ariaRole = computed(() => {
  switch (finalVariant.value) {
    case 'destructive':
    case 'nsmSecret':
    case 'nsmConfidential':
      return 'alert'
    default:
      return 'status'
  }
})

// Methods
const handleDismiss = () => {
  isVisible.value = false
  emit('dismiss')
}

// Handle escape key
const handleKeyDown = (event: KeyboardEvent) => {
  if (props.dismissible && event.key === 'Escape') {
    handleDismiss()
  }
}

// Auto focus
watch(isVisible, (visible) => {
  if (visible && props.autoFocus && alertRef.value && 
      (finalVariant.value === 'destructive' || finalVariant.value === 'nsmSecret')) {
    alertRef.value.focus()
  }
})

// Lifecycle
onMounted(() => {
  if (props.dismissible) {
    document.addEventListener('keydown', handleKeyDown)
  }
})

onBeforeUnmount(() => {
  if (props.dismissible) {
    document.removeEventListener('keydown', handleKeyDown)
  }
})
</script>