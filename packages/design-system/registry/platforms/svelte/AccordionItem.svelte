<!--
Svelte AccordionItem Implementation
Generated from universal AccordionSpec
-->

<script lang="ts">
  import { getContext, setContext } from 'svelte';
  import { derived, type Writable } from 'svelte/store';

  // =============================================================================
  // COMPONENT PROPS
  // =============================================================================

  export let value: string;
  export let disabled = false;

  // Additional props
  let className = '';
  export { className as class };

  // =============================================================================
  // CONTEXT MANAGEMENT
  // =============================================================================

  const accordionContext = getContext('accordion') as any;
  
  if (!accordionContext) {
    throw new Error('AccordionItem must be used within an Accordion');
  }

  // =============================================================================
  // STATE MANAGEMENT
  // =============================================================================

  const isDisabled = accordionContext.disabled || disabled;

  const isOpen = derived(accordionContext.value, ($value) => {
    if (accordionContext.type === 'multiple') {
      return Array.isArray($value) && $value.includes(value);
    }
    return $value === value;
  });

  const handleToggle = () => {
    if (!isDisabled) {
      accordionContext.onItemToggle(value);
    }
  };

  // =============================================================================
  // ITEM CONTEXT FOR CHILDREN
  // =============================================================================

  const itemContext = {
    value,
    isOpen,
    disabled: isDisabled,
    onToggle: handleToggle
  };

  setContext('accordionItem', itemContext);

  // =============================================================================
  // COMPUTED CLASSES
  // =============================================================================

  $: itemClasses = [
    'border-b border-border last:border-b-0',
    'transition-colors duration-200',
    isDisabled && 'opacity-50 cursor-not-allowed',
    className
  ].filter(Boolean).join(' ');
</script>

<div 
  class={itemClasses}
  data-state={$isOpen ? 'open' : 'closed'}
  data-disabled={isDisabled || null}
  {...$$restProps}
>
  <slot />
</div>