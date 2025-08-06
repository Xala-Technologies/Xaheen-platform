<script lang="ts">
  import { cn } from '../../lib/utils';
  
  export let value: string | number = '';
  export let type: string = 'text';
  export let variant: 'default' | 'error' | 'success' | 'warning' = 'default';
  export let size: 'md' | 'lg' | 'xl' = 'lg';
  export let fullWidth: boolean = true;
  export let error: boolean = false;
  export let success: boolean = false;
  export let warning: boolean = false;
  export let helperText: string = '';
  export let disabled: boolean = false;
  export let className: string = '';
  export let placeholder: string = '';
  
  let inputElement: HTMLInputElement;
  
  const inputVariants = {
    variant: {
      default: '',
      error: 'border-destructive focus:ring-destructive/20 focus:border-destructive',
      success: 'border-green-600 focus:ring-green-600/20 focus:border-green-600',
      warning: 'border-yellow-600 focus:ring-yellow-600/20 focus:border-yellow-600',
    },
    size: {
      md: 'h-12 px-4 py-3 text-base rounded-lg',
      lg: 'h-14 px-5 py-4 text-lg rounded-lg',
      xl: 'h-16 px-6 py-5 text-xl rounded-xl',
    },
    fullWidth: {
      true: 'w-full',
      false: 'w-auto'
    }
  };
  
  $: stateVariant = error ? 'error' : success ? 'success' : warning ? 'warning' : variant;
  
  $: inputClasses = cn(
    'flex font-medium text-foreground placeholder:text-muted-foreground',
    'bg-background border-2 border-input transition-all duration-200 ease-in-out',
    'disabled:cursor-not-allowed disabled:opacity-50',
    'focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary/20',
    'focus:border-primary file:border-0 file:bg-transparent file:text-sm file:font-medium',
    'autofill:bg-background contrast-more:border-2',
    inputVariants.variant[stateVariant],
    inputVariants.size[size],
    inputVariants.fullWidth[fullWidth.toString() as 'true' | 'false'],
    className
  );
  
  $: helperTextClasses = cn(
    'mt-2 text-sm',
    error && 'text-destructive',
    success && 'text-green-600',
    warning && 'text-yellow-600',
    !error && !success && !warning && 'text-muted-foreground'
  );
  
  function handleInput(event: Event) {
    const target = event.target as HTMLInputElement;
    value = target.value;
  }
</script>

<div class={cn('relative', fullWidth && 'w-full')}>
  <input
    bind:this={inputElement}
    {type}
    class={inputClasses}
    {disabled}
    {placeholder}
    {value}
    aria-invalid={error ? 'true' : undefined}
    aria-describedby={helperText ? 'helper-text' : undefined}
    on:input={handleInput}
    on:change
    on:focus
    on:blur
    {...$$restProps}
  />
  
  {#if helperText}
    <p 
      id="helper-text"
      class={helperTextClasses}
    >
      {helperText}
    </p>
  {/if}
</div>