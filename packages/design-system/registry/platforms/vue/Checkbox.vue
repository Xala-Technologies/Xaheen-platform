<template>
  <div class="inline-flex items-center">
    <input
      :id="id"
      ref="checkboxRef"
      type="checkbox"
      :class="checkboxClasses"
      :checked="modelValue"
      :disabled="disabled"
      :required="required"
      :aria-label="ariaLabel"
      :aria-describedby="ariaDescribedby"
      :aria-invalid="ariaInvalid"
      @change="handleChange"
    />
    <label
      v-if="label || $slots.default"
      :for="id"
      :class="labelClasses"
    >
      <slot>{{ label }}</slot>
    </label>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import { cva, type VariantProps } from 'class-variance-authority'
import { cn } from '../../lib/utils'

// Generate unique ID
let idCounter = 0
const generateId = () => `checkbox-${++idCounter}`

// Checkbox variants
const checkboxVariants = cva(
  [
    'peer appearance-none rounded border-2 transition-all duration-200',
    'focus:outline-none focus:ring-2 focus:ring-offset-2',
    'disabled:cursor-not-allowed disabled:opacity-50',
    'checked:bg-primary checked:border-primary',
    'checked:before:content-[""] checked:before:absolute checked:before:inset-0',
    'checked:before:flex checked:before:items-center checked:before:justify-center',
    'checked:before:text-primary-foreground',
    'relative cursor-pointer'
  ],
  {
    variants: {
      size: {
        sm: 'h-4 w-4 checked:before:text-xs',
        md: 'h-5 w-5 checked:before:text-sm',
        lg: 'h-6 w-6 checked:before:text-base'
      },
      variant: {
        default: [
          'border-input hover:border-primary/50',
          'focus:ring-primary'
        ],
        destructive: [
          'border-destructive hover:border-destructive/70',
          'checked:bg-destructive checked:border-destructive',
          'focus:ring-destructive'
        ],
        success: [
          'border-green-500 hover:border-green-600',
          'checked:bg-green-500 checked:border-green-500',
          'focus:ring-green-500'
        ]
      }
    },
    defaultVariants: {
      size: 'md',
      variant: 'default'
    }
  }
)

const labelVariants = cva(
  [
    'ml-2 select-none cursor-pointer',
    'peer-disabled:cursor-not-allowed peer-disabled:opacity-50'
  ],
  {
    variants: {
      size: {
        sm: 'text-sm',
        md: 'text-base',
        lg: 'text-lg'
      }
    },
    defaultVariants: {
      size: 'md'
    }
  }
)

// Props
interface Props extends VariantProps<typeof checkboxVariants> {
  modelValue?: boolean
  label?: string
  disabled?: boolean
  required?: boolean
  ariaLabel?: string
  ariaDescribedby?: string
  ariaInvalid?: boolean
  class?: string
  labelClass?: string
}

const props = withDefaults(defineProps<Props>(), {
  modelValue: false,
  disabled: false,
  required: false,
  ariaInvalid: false,
  size: 'md',
  variant: 'default'
})

// Emits
const emit = defineEmits<{
  'update:modelValue': [value: boolean]
  change: [value: boolean]
}>()

// Refs
const checkboxRef = ref<HTMLInputElement>()

// Computed
const id = computed(() => generateId())

const checkboxClasses = computed(() => {
  return cn(
    checkboxVariants({ size: props.size, variant: props.variant }),
    props.class
  )
})

const labelClasses = computed(() => {
  return cn(
    labelVariants({ size: props.size }),
    props.labelClass
  )
})

// Methods
const handleChange = (event: Event) => {
  const target = event.target as HTMLInputElement
  const newValue = target.checked
  emit('update:modelValue', newValue)
  emit('change', newValue)
}

// Expose for parent components
defineExpose({
  checkboxRef
})
</script>

<style scoped>
/* Checkmark icon using CSS */
input[type="checkbox"]:checked::before {
  content: "✓";
}
</style>