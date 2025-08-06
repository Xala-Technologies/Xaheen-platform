<!--
Svelte AccordionContent Implementation
Generated from universal AccordionSpec
-->

<script lang="ts">
  import { getContext } from 'svelte';

  // =============================================================================
  // COMPONENT PROPS
  // =============================================================================

  export let forceMount = false;
  export let size: 'sm' | 'md' | 'lg' | undefined = undefined;

  // Additional props
  let className = '';
  export { className as class };

  // =============================================================================
  // CONTEXT MANAGEMENT
  // =============================================================================

  const accordionContext = getContext('accordion') as any;
  const itemContext = getContext('accordionItem') as any;
  
  if (!accordionContext || !itemContext) {
    throw new Error('AccordionContent must be used within an AccordionItem');
  }

  // =============================================================================
  // COMPUTED PROPERTIES
  // =============================================================================

  $: finalSize = size || accordionContext.size;

  $: contentClasses = [
    'overflow-hidden transition-all duration-200 ease-in-out',
    'data-[state=closed]:animate-accordion-up',
    'data-[state=open]:animate-accordion-down',
    className
  ].filter(Boolean).join(' ');

  $: contentInnerClasses = [
    'pb-4 pt-0',
    // Size-specific classes
    finalSize === 'sm' && 'px-4 pb-3',
    finalSize === 'md' && 'px-6 pb-4',
    finalSize === 'lg' && 'px-8 pb-5'
  ].filter(Boolean).join(' ');

  $: shouldMount = forceMount || $itemContext.isOpen;
</script>

{#if shouldMount}
  <div
    class={contentClasses}
    id="accordion-content-{itemContext.value}"
    role="region"
    aria-labelledby="accordion-trigger-{itemContext.value}"
    data-state={$itemContext.isOpen ? 'open' : 'closed'}
    {...$$restProps}
  >
    <div class={contentInnerClasses}>
      <slot />
    </div>
  </div>
{/if}