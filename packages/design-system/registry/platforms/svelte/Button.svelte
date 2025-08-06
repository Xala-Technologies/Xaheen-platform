<script lang="ts">
  import { cn } from '../../lib/utils';
  
  export let variant: 'default' | 'destructive' | 'outline' | 'secondary' | 'ghost' | 'link' = 'default';
  export let size: 'sm' | 'md' | 'lg' | 'xl' = 'md';
  export let disabled: boolean = false;
  export let loading: boolean = false;
  export let className: string = '';
  export let type: 'button' | 'submit' | 'reset' = 'button';

  const buttonVariants = {
    variant: {
      default: 'bg-primary text-primary-foreground hover:bg-primary/90',
      destructive: 'bg-destructive text-destructive-foreground hover:bg-destructive/90',
      outline: 'border border-input bg-background hover:bg-accent hover:text-accent-foreground',
      secondary: 'bg-secondary text-secondary-foreground hover:bg-secondary/80',
      ghost: 'hover:bg-accent hover:text-accent-foreground',
      link: 'text-primary underline-offset-4 hover:underline'
    },
    size: {
      sm: 'h-10 px-4 py-2 text-sm',
      md: 'h-12 px-6 py-3 text-base',
      lg: 'h-14 px-8 py-4 text-lg',
      xl: 'h-16 px-10 py-5 text-xl'
    }
  };

  $: buttonClasses = cn(
    'inline-flex items-center justify-center whitespace-nowrap rounded-lg font-medium',
    'ring-offset-background transition-all duration-200 ease-in-out',
    'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2',
    'disabled:pointer-events-none disabled:opacity-50',
    'shadow-sm hover:shadow-md',
    buttonVariants.variant[variant],
    buttonVariants.size[size],
    className
  );
</script>

<button 
  {type}
  class={buttonClasses}
  {disabled}
  on:click
  {...$$restProps}
>
  {#if loading}
    <svg class="animate-spin -ml-1 mr-3 h-4 w-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
      <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
      <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
    </svg>
  {/if}
  <slot />
</button>