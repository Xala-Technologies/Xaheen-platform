<!--
Svelte AccordionTrigger Implementation
Generated from universal AccordionSpec
-->

<script lang="ts">
  import { getContext } from 'svelte';
  import { ChevronDown } from 'lucide-svelte';

  // =============================================================================
  // COMPONENT PROPS
  // =============================================================================

  export let hideChevron = false;
  export let customIcon: any = null;
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
    throw new Error('AccordionTrigger must be used within an AccordionItem');
  }

  // =============================================================================
  // COMPUTED PROPERTIES
  // =============================================================================

  $: finalSize = size || accordionContext.size;

  $: triggerClasses = [
    'flex w-full items-center justify-between',
    'text-left font-medium',
    'transition-all duration-200 ease-in-out',
    'focus:outline-none focus:ring-2 focus:ring-primary/20 focus:ring-offset-2',
    'hover:bg-accent/5 active:bg-accent/10',
    'disabled:cursor-not-allowed disabled:opacity-50',
    // Size-specific classes
    finalSize === 'sm' && 'px-4 py-3 text-sm min-h-[2.5rem]',
    finalSize === 'md' && 'px-6 py-4 text-base min-h-[3rem]',
    finalSize === 'lg' && 'px-8 py-5 text-lg min-h-[3.5rem]',
    className
  ].filter(Boolean).join(' ');

  $: chevronClasses = [
    'ml-2 flex-shrink-0 transition-transform duration-200',
    $itemContext.isOpen && 'rotate-180'
  ].filter(Boolean).join(' ');
</script>

<button
  type="button"
  class={triggerClasses}
  disabled={itemContext.disabled}
  aria-expanded={$itemContext.isOpen}
  aria-controls="accordion-content-{itemContext.value}"
  data-state={$itemContext.isOpen ? 'open' : 'closed'}
  on:click={itemContext.onToggle}
  {...$$restProps}
>
  <span class="text-left">
    <slot />
  </span>
  
  {#if !hideChevron}
    <span 
      class={chevronClasses}
      aria-hidden="true"
    >
      {#if customIcon}
        <svelte:component this={customIcon} class="h-5 w-5" />
      {:else}
        <ChevronDown class="h-5 w-5" />
      {/if}
    </span>
  {/if}
</button>