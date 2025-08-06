<script lang="ts">
  import { cn } from '../../lib/utils';
  
  export let variant: 'default' | 'elevated' | 'outline' | 'ghost' = 'default';
  export let padding: 'none' | 'sm' | 'md' | 'lg' | 'xl' = 'md';
  export let rounded: 'none' | 'sm' | 'md' | 'lg' | 'xl' | 'full' = 'lg';
  export let className: string = '';
  
  const cardVariants = {
    variant: {
      default: 'shadow-md hover:shadow-lg',
      elevated: 'shadow-lg hover:shadow-xl',
      outline: 'shadow-sm hover:shadow-md',
      ghost: 'shadow-none hover:shadow-sm',
    },
    padding: {
      none: 'p-0',
      sm: 'p-4',
      md: 'p-6',
      lg: 'p-8',
      xl: 'p-10'
    },
    rounded: {
      none: 'rounded-none',
      sm: 'rounded-md',
      md: 'rounded-lg',
      lg: 'rounded-xl',
      xl: 'rounded-2xl',
      full: 'rounded-full'
    }
  };
  
  $: cardClasses = cn(
    'bg-card text-card-foreground border border-border transition-all duration-200',
    cardVariants.variant[variant],
    cardVariants.padding[padding],
    cardVariants.rounded[rounded],
    className
  );
</script>

<div class={cardClasses} {...$$restProps}>
  <slot />
</div>