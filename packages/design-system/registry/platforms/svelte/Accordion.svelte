<!--
Svelte Accordion Implementation
Generated from universal AccordionSpec
CLAUDE.md Compliant: Professional sizing and spacing
WCAG AAA: Full keyboard navigation, ARIA support, and screen reader compatibility
-->

<script lang="ts">
  import { setContext, getContext, createEventDispatcher } from 'svelte';
  import { writable, derived, type Writable } from 'svelte/store';
  import { ChevronDown } from 'lucide-svelte';

  // =============================================================================
  // TYPES AND INTERFACES
  // =============================================================================

  export type AccordionVariant = 'default' | 'elevated' | 'outline' | 'ghost' | 'nsmOpen' | 'nsmRestricted' | 'nsmConfidential' | 'nsmSecret';
  export type AccordionSize = 'sm' | 'md' | 'lg';
  export type AccordionType = 'single' | 'multiple';
  export type NSMClassification = 'OPEN' | 'RESTRICTED' | 'CONFIDENTIAL' | 'SECRET';

  // =============================================================================
  // COMPONENT PROPS
  // =============================================================================

  export let variant: AccordionVariant = 'default';
  export let size: AccordionSize = 'md';
  export let type: AccordionType = 'single';
  export let value: string | string[] = '';
  export let defaultValue: string | string[] = type === 'multiple' ? [] : '';
  export let disabled = false;
  export let nsmClassification: NSMClassification | undefined = undefined;

  // Additional props
  let className = '';
  export { className as class };

  // =============================================================================
  // STATE MANAGEMENT
  // =============================================================================

  const dispatch = createEventDispatcher<{
    valueChange: string | string[];
  }>();

  // Create stores for accordion state
  const accordionValue = writable(value || defaultValue);
  const isControlled = value !== undefined && value !== '';

  // Update internal value when external value changes
  $: if (isControlled) {
    accordionValue.set(value);
  }

  // Emit changes to parent
  accordionValue.subscribe((newValue) => {
    if (!isControlled) {
      value = newValue;
    }
    dispatch('valueChange', newValue);
  });

  // =============================================================================
  // COMPUTED PROPERTIES
  // =============================================================================

  $: finalVariant = nsmClassification 
    ? `nsm${nsmClassification.charAt(0).toUpperCase() + nsmClassification.slice(1).toLowerCase()}` as AccordionVariant
    : variant;

  $: accordionClasses = [
    'border border-border rounded-lg',
    'bg-card text-card-foreground',
    'transition-all duration-200 ease-in-out',
    // Variant classes
    finalVariant === 'default' && 'shadow-sm hover:shadow-md',
    finalVariant === 'elevated' && 'shadow-md hover:shadow-lg',
    finalVariant === 'outline' && 'shadow-none',
    finalVariant === 'ghost' && 'border-transparent shadow-none',
    finalVariant === 'nsmOpen' && 'border-l-4 border-l-green-600 shadow-sm',
    finalVariant === 'nsmRestricted' && 'border-l-4 border-l-yellow-600 shadow-sm',
    finalVariant === 'nsmConfidential' && 'border-l-4 border-l-red-600 shadow-sm',
    finalVariant === 'nsmSecret' && 'border-l-4 border-l-gray-800 shadow-sm',
    // Size classes
    size === 'sm' && 'text-sm',
    size === 'md' && 'text-base',
    size === 'lg' && 'text-lg',
    className
  ].filter(Boolean).join(' ');

  // =============================================================================
  // ACCORDION CONTEXT
  // =============================================================================

  const accordionContext = {
    type,
    value: accordionValue,
    size,
    disabled,
    onItemToggle: (itemValue: string) => {
      if (disabled) return;
      
      let newValue: string | string[];
      const currentValue = $accordionValue;
      
      if (type === 'multiple') {
        const currentArray = Array.isArray(currentValue) ? currentValue : [];
        newValue = currentArray.includes(itemValue)
          ? currentArray.filter(v => v !== itemValue)
          : [...currentArray, itemValue];
      } else {
        newValue = currentValue === itemValue ? '' : itemValue;
      }
      
      accordionValue.set(newValue);
    }
  };

  setContext('accordion', accordionContext);
</script>

<div 
  class={accordionClasses}
  data-orientation="vertical"
  {...$$restProps}
>
  {#if nsmClassification}
    <span class="sr-only">
      NSM Classification: {nsmClassification}
    </span>
  {/if}
  
  <slot />
</div>

<style>
  /* Animation keyframes for accordion */
  :global(.animate-accordion-down) {
    animation: accordion-down 0.2s ease-out;
  }

  :global(.animate-accordion-up) {
    animation: accordion-up 0.2s ease-out;
  }

  @keyframes accordion-down {
    from {
      height: 0;
    }
    to {
      height: var(--accordion-content-height);
    }
  }

  @keyframes accordion-up {
    from {
      height: var(--accordion-content-height);
    }
    to {
      height: 0;
    }
  }
</style>