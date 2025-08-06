<!--
Vue 3 Accordion Implementation
Generated from universal AccordionSpec
CLAUDE.md Compliant: Professional sizing and spacing
WCAG AAA: Full keyboard navigation, ARIA support, and screen reader compatibility
-->

<template>
  <div
    :class="accordionClasses"
    data-orientation="vertical"
    v-bind="$attrs"
  >
    <!-- NSM Classification for screen readers -->
    <span v-if="nsmClassification" class="sr-only">
      NSM Classification: {{ nsmClassification }}
    </span>
    
    <slot />
  </div>
</template>

<script setup lang="ts">
import { computed, provide, reactive, watch } from 'vue';
import { ChevronDownIcon } from '@heroicons/vue/24/outline';

// =============================================================================
// COMPONENT PROPS
// =============================================================================

export interface AccordionProps {
  /**
   * Visual style variant
   */
  variant?: 'default' | 'elevated' | 'outline' | 'ghost' | 'nsmOpen' | 'nsmRestricted' | 'nsmConfidential' | 'nsmSecret';
  
  /**
   * Size of the accordion
   */
  size?: 'sm' | 'md' | 'lg';
  
  /**
   * Type of accordion behavior
   */
  type?: 'single' | 'multiple';
  
  /**
   * Controlled value
   */
  value?: string | string[];
  
  /**
   * Default value for uncontrolled mode
   */
  defaultValue?: string | string[];
  
  /**
   * Whether the accordion is disabled
   */
  disabled?: boolean;
  
  /**
   * NSM Security Classification
   */
  nsmClassification?: 'OPEN' | 'RESTRICTED' | 'CONFIDENTIAL' | 'SECRET';
}

const props = withDefaults(defineProps<AccordionProps>(), {
  variant: 'default',
  size: 'md',
  type: 'single',
  disabled: false
});

// =============================================================================
// EMITS
// =============================================================================

const emit = defineEmits<{
  'update:value': [value: string | string[]];
}>();

// =============================================================================
// STATE MANAGEMENT
// =============================================================================

const internalValue = ref<string | string[]>(
  props.value ?? props.defaultValue ?? (props.type === 'multiple' ? [] : '')
);

const isControlled = computed(() => props.value !== undefined);
const currentValue = computed(() => isControlled.value ? props.value! : internalValue.value);

// Watch for external value changes
watch(() => props.value, (newValue) => {
  if (newValue !== undefined) {
    internalValue.value = newValue;
  }
}, { immediate: true });

// =============================================================================
// COMPUTED PROPERTIES
// =============================================================================

const finalVariant = computed(() => {
  if (props.nsmClassification) {
    const classification = props.nsmClassification;
    return `nsm${classification.charAt(0).toUpperCase() + classification.slice(1).toLowerCase()}`;
  }
  return props.variant;
});

const accordionClasses = computed(() => {
  const baseClasses = [
    'border border-border rounded-lg',
    'bg-card text-card-foreground',
    'transition-all duration-200 ease-in-out'
  ];

  const variantClasses = {
    default: 'shadow-sm hover:shadow-md',
    elevated: 'shadow-md hover:shadow-lg',
    outline: 'shadow-none',
    ghost: 'border-transparent shadow-none',
    nsmOpen: 'border-l-4 border-l-green-600 shadow-sm',
    nsmRestricted: 'border-l-4 border-l-yellow-600 shadow-sm',
    nsmConfidential: 'border-l-4 border-l-red-600 shadow-sm',
    nsmSecret: 'border-l-4 border-l-gray-800 shadow-sm'
  };

  const sizeClasses = {
    sm: 'text-sm',
    md: 'text-base',
    lg: 'text-lg'
  };

  return [
    ...baseClasses,
    variantClasses[finalVariant.value as keyof typeof variantClasses],
    sizeClasses[props.size]
  ].filter(Boolean);
});

// =============================================================================
// ACCORDION CONTEXT
// =============================================================================

const accordionContext = reactive({
  type: computed(() => props.type),
  value: currentValue,
  size: computed(() => props.size),
  disabled: computed(() => props.disabled),
  onItemToggle: (itemValue: string) => {
    if (props.disabled) return;
    
    let newValue: string | string[];
    
    if (props.type === 'multiple') {
      const currentArray = Array.isArray(currentValue.value) ? currentValue.value : [];
      newValue = currentArray.includes(itemValue)
        ? currentArray.filter(v => v !== itemValue)
        : [...currentArray, itemValue];
    } else {
      newValue = currentValue.value === itemValue ? '' : itemValue;
    }
    
    if (!isControlled.value) {
      internalValue.value = newValue;
    }
    
    emit('update:value', newValue);
  }
});

provide('accordionContext', accordionContext);

// =============================================================================
// ATTRS INHERITANCE
// =============================================================================

defineOptions({
  inheritAttrs: false
});
</script>

<script lang="ts">
import { defineComponent, h, inject, computed, ref, watch } from 'vue';

/**
 * AccordionItem Component
 */
export const AccordionItem = defineComponent({
  name: 'AccordionItem',
  props: {
    value: {
      type: String,
      required: true
    },
    disabled: {
      type: Boolean,
      default: false
    }
  },
  setup(props, { slots }) {
    const accordionContext = inject('accordionContext') as any;
    
    if (!accordionContext) {
      throw new Error('AccordionItem must be used within an Accordion');
    }

    const isDisabled = computed(() => accordionContext.disabled || props.disabled);
    const isOpen = computed(() => {
      if (accordionContext.type === 'multiple') {
        return Array.isArray(accordionContext.value) && accordionContext.value.includes(props.value);
      }
      return accordionContext.value === props.value;
    });

    const handleToggle = () => {
      if (!isDisabled.value) {
        accordionContext.onItemToggle(props.value);
      }
    };

    const itemContext = {
      value: props.value,
      isOpen,
      disabled: isDisabled,
      onToggle: handleToggle
    };

    // Provide item context
    provide('accordionItemContext', itemContext);

    return () =>
      h('div', {
        class: [
          'border-b border-border last:border-b-0',
          'transition-colors duration-200',
          isDisabled.value && 'opacity-50 cursor-not-allowed'
        ].filter(Boolean),
        'data-state': isOpen.value ? 'open' : 'closed',
        'data-disabled': isDisabled.value || undefined
      }, slots.default?.());
  }
});

/**
 * AccordionTrigger Component
 */
export const AccordionTrigger = defineComponent({
  name: 'AccordionTrigger',
  props: {
    hideChevron: {
      type: Boolean,
      default: false
    },
    customIcon: {
      type: Object,
      default: null
    },
    size: {
      type: String as () => 'sm' | 'md' | 'lg',
      default: undefined
    }
  },
  setup(props, { slots }) {
    const accordionContext = inject('accordionContext') as any;
    const itemContext = inject('accordionItemContext') as any;
    
    if (!accordionContext || !itemContext) {
      throw new Error('AccordionTrigger must be used within an AccordionItem');
    }

    const finalSize = computed(() => props.size || accordionContext.size);

    const triggerClasses = computed(() => {
      const baseClasses = [
        'flex w-full items-center justify-between',
        'px-6 py-4 text-left font-medium',
        'transition-all duration-200 ease-in-out',
        'focus:outline-none focus:ring-2 focus:ring-primary/20 focus:ring-offset-2',
        'hover:bg-accent/5 active:bg-accent/10',
        'disabled:cursor-not-allowed disabled:opacity-50',
        'min-h-[3rem]'
      ];

      const sizeClasses = {
        sm: 'px-4 py-3 text-sm min-h-[2.5rem]',
        md: 'px-6 py-4 text-base min-h-[3rem]',
        lg: 'px-8 py-5 text-lg min-h-[3.5rem]'
      };

      return [
        ...baseClasses,
        sizeClasses[finalSize.value]
      ];
    });

    return () =>
      h('button', {
        type: 'button',
        class: triggerClasses.value,
        disabled: itemContext.disabled,
        'aria-expanded': itemContext.isOpen,
        'aria-controls': `accordion-content-${itemContext.value}`,
        'data-state': itemContext.isOpen ? 'open' : 'closed',
        onClick: itemContext.onToggle
      }, [
        h('span', { class: 'text-left' }, slots.default?.()),
        
        !props.hideChevron && h('span', {
          class: [
            'ml-2 flex-shrink-0 transition-transform duration-200',
            itemContext.isOpen && 'rotate-180'
          ].filter(Boolean),
          'aria-hidden': 'true'
        }, [
          props.customIcon || h(ChevronDownIcon, { class: 'h-5 w-5' })
        ])
      ]);
  }
});

/**
 * AccordionContent Component
 */
export const AccordionContent = defineComponent({
  name: 'AccordionContent',
  props: {
    forceMount: {
      type: Boolean,
      default: false
    },
    size: {
      type: String as () => 'sm' | 'md' | 'lg',
      default: undefined
    }
  },
  setup(props, { slots }) {
    const accordionContext = inject('accordionContext') as any;
    const itemContext = inject('accordionItemContext') as any;
    
    if (!accordionContext || !itemContext) {
      throw new Error('AccordionContent must be used within an AccordionItem');
    }

    const finalSize = computed(() => props.size || accordionContext.size);

    const contentInnerClasses = computed(() => {
      const baseClasses = ['pb-4 pt-0'];
      
      const sizeClasses = {
        sm: 'px-4 pb-3',
        md: 'px-6 pb-4',
        lg: 'px-8 pb-5'
      };

      return [
        ...baseClasses,
        sizeClasses[finalSize.value]
      ];
    });

    return () => {
      if (!props.forceMount && !itemContext.isOpen) {
        return null;
      }

      return h('div', {
        class: [
          'overflow-hidden transition-all duration-200 ease-in-out',
          'data-[state=closed]:animate-accordion-up',
          'data-[state=open]:animate-accordion-down'
        ],
        id: `accordion-content-${itemContext.value}`,
        role: 'region',
        'aria-labelledby': `accordion-trigger-${itemContext.value}`,
        'data-state': itemContext.isOpen ? 'open' : 'closed'
      }, [
        h('div', {
          class: contentInnerClasses.value
        }, slots.default?.())
      ]);
    };
  }
});

export default AccordionItem;
</script>

<style scoped>
/* Animation keyframes for accordion */
@keyframes accordion-down {
  from {
    height: 0;
  }
  to {
    height: var(--radix-accordion-content-height);
  }
}

@keyframes accordion-up {
  from {
    height: var(--radix-accordion-content-height);
  }
  to {
    height: 0;
  }
}

.animate-accordion-down {
  animation: accordion-down 0.2s ease-out;
}

.animate-accordion-up {
  animation: accordion-up 0.2s ease-out;
}
</style>