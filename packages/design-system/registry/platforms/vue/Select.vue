<template>
  <div class="relative">
    <select
      :id="id"
      ref="selectRef"
      :value="modelValue"
      :disabled="disabled"
      :required="required"
      :aria-label="ariaLabel"
      :aria-describedby="ariaDescribedby"
      :aria-invalid="ariaInvalid"
      :class="selectClasses"
      @change="handleChange"
    >
      <option v-if="placeholder" value="" disabled>
        {{ placeholder }}
      </option>
      <option
        v-for="option in options"
        :key="option.value"
        :value="option.value"
        :disabled="option.disabled"
      >
        {{ option.label }}
      </option>
    </select>
    <ChevronDownIcon
      class="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 opacity-50"
      aria-hidden="true"
    />
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import { cva, type VariantProps } from 'class-variance-authority'
import { ChevronDownIcon } from '@heroicons/vue/24/outline'
import { cn } from '../../lib/utils'

// Generate unique ID
let idCounter = 0
const generateId = () => `select-${++idCounter}`

// Select variants
const selectVariants = cva(
  [
    'flex w-full appearance-none rounded-lg border bg-transparent',
    'px-3 py-2 pr-10 text-sm ring-offset-background',
    'placeholder:text-muted-foreground',
    'focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2',
    'disabled:cursor-not-allowed disabled:opacity-50',
    'transition-all duration-200'
  ],
  {
    variants: {
      size: {
        sm: 'h-10 text-sm',
        md: 'h-12 text-base',
        lg: 'h-14 text-lg'
      },
      variant: {
        default: [
          'border-input',
          'hover:border-primary/50'
        ],
        destructive: [
          'border-destructive',
          'focus:ring-destructive'
        ],
        success: [
          'border-green-500',
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

// Types
interface SelectOption {
  value: string
  label: string
  disabled?: boolean
}

// Props
interface Props extends VariantProps<typeof selectVariants> {
  modelValue?: string
  options: SelectOption[]
  placeholder?: string
  disabled?: boolean
  required?: boolean
  ariaLabel?: string
  ariaDescribedby?: string
  ariaInvalid?: boolean
  class?: string
}

const props = withDefaults(defineProps<Props>(), {
  modelValue: '',
  disabled: false,
  required: false,
  ariaInvalid: false,
  size: 'md',
  variant: 'default'
})

// Emits
const emit = defineEmits<{
  'update:modelValue': [value: string]
  change: [value: string]
}>()

// Refs
const selectRef = ref<HTMLSelectElement>()

// Computed
const id = computed(() => generateId())

const selectClasses = computed(() => {
  return cn(
    selectVariants({ size: props.size, variant: props.variant }),
    props.class
  )
})

// Methods
const handleChange = (event: Event) => {
  const target = event.target as HTMLSelectElement
  const newValue = target.value
  emit('update:modelValue', newValue)
  emit('change', newValue)
}

// Expose for parent components
defineExpose({
  selectRef
})
</script>