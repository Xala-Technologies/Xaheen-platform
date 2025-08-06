<!--
Svelte Button Implementation
Generated from universal ButtonSpec
-->

<script lang="ts">
  import { createEventDispatcher } from 'svelte';
  
  // =============================================================================
  // COMPONENT PROPS
  // =============================================================================
  
  export let variant: 'primary' | 'secondary' | 'outline' | 'ghost' | 'destructive' = 'primary';
  export let size: 'xs' | 'sm' | 'md' | 'lg' | 'xl' = 'md';
  export let disabled: boolean = false;
  export let loading: boolean = false;
  export let fullWidth: boolean = false;
  export let type: 'button' | 'submit' | 'reset' = 'button';
  export let ariaLabel: string | undefined = undefined;
  export let className: string = '';
  
  // =============================================================================
  // EVENT DISPATCHER
  // =============================================================================
  
  const dispatch = createEventDispatcher<{
    click: MouseEvent;
  }>();
  
  // =============================================================================
  // COMPUTED VALUES
  // =============================================================================
  
  $: isDisabled = disabled || loading;
  $: spinnerSize = size === 'xs' ? 'sm' : size === 'xl' ? 'lg' : 'md';
  
  $: buttonClasses = [
    // Base classes
    'inline-flex items-center justify-center gap-2',
    'rounded-md text-sm font-medium transition-colors',
    'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2',
    'disabled:pointer-events-none disabled:opacity-50',
    'select-none',
    
    // Variant classes
    ...(variant === 'primary' ? [
      'bg-primary text-primary-foreground',
      'hover:bg-primary/90',
      'focus-visible:ring-primary'
    ] : []),
    
    ...(variant === 'secondary' ? [
      'bg-secondary text-secondary-foreground', 
      'hover:bg-secondary/80',
      'focus-visible:ring-secondary'
    ] : []),
    
    ...(variant === 'outline' ? [
      'border border-input bg-background',
      'hover:bg-accent hover:text-accent-foreground',
      'focus-visible:ring-primary'
    ] : []),
    
    ...(variant === 'ghost' ? [
      'hover:bg-accent hover:text-accent-foreground',
      'focus-visible:ring-primary'
    ] : []),
    
    ...(variant === 'destructive' ? [
      'bg-destructive text-destructive-foreground',
      'hover:bg-destructive/90', 
      'focus-visible:ring-destructive'
    ] : []),
    
    // Size classes
    ...(size === 'xs' ? ['h-8 px-3 text-xs'] : []),
    ...(size === 'sm' ? ['h-10 px-4 text-sm'] : []),
    ...(size === 'md' ? ['h-12 px-6 text-base'] : []),
    ...(size === 'lg' ? ['h-14 px-8 text-lg'] : []),
    ...(size === 'xl' ? ['h-16 px-10 text-xl'] : []),
    
    // Full width
    ...(fullWidth ? ['w-full'] : []),
    
    // Custom className
    className
  ].filter(Boolean).join(' ');
  
  // =============================================================================
  // EVENT HANDLERS
  // =============================================================================
  
  function handleClick(event: MouseEvent) {
    if (!isDisabled) {
      dispatch('click', event);
    }
  }
</script>

<!-- 
=============================================================================
LOADING SPINNER COMPONENT
=============================================================================
-->
<script lang="ts" context="module">
  export interface LoadingSpinnerProps {
    size?: 'sm' | 'md' | 'lg';
  }
</script>

<!-- 
=============================================================================
MAIN BUTTON TEMPLATE
=============================================================================
-->
<button
  class={buttonClasses}
  {disabled}
  aria-label={ariaLabel}
  aria-disabled={isDisabled}
  {type}
  on:click={handleClick}
  {...$$restProps}
>
  <!-- Loading spinner -->
  {#if loading}
    <LoadingSpinner size={spinnerSize} />
  {/if}
  
  <!-- Prefix icon slot -->
  {#if !loading && $$slots.icon}
    <span class="shrink-0">
      <slot name="icon" />
    </span>
  {/if}
  
  <!-- Button content -->
  {#if $$slots.default}
    <span class:opacity-70={loading}>
      <slot />
    </span>
  {/if}
  
  <!-- Suffix icon slot -->
  {#if !loading && $$slots.suffixIcon}
    <span class="shrink-0">
      <slot name="suffixIcon" />
    </span>
  {/if}
</button>

<!-- 
=============================================================================
LOADING SPINNER COMPONENT
=============================================================================
-->
{#snippet LoadingSpinner(size: 'sm' | 'md' | 'lg' = 'md')}
  {@const sizeClasses = {
    sm: 'h-3 w-3',
    md: 'h-4 w-4', 
    lg: 'h-5 w-5'
  }}
  
  <svg
    class="animate-spin {sizeClasses[size]}"
    xmlns="http://www.w3.org/2000/svg"
    fill="none"
    viewBox="0 0 24 24"
  >
    <circle
      class="opacity-25"
      cx="12"
      cy="12"
      r="10"
      stroke="currentColor"
      stroke-width="4"
    />
    <path
      class="opacity-75"
      fill="currentColor"
      d="m4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
    />
  </svg>
{/snippet}

<style>
  /* 
   * Component-specific styles 
   * Note: Most styling comes from Tailwind classes
   */
</style>