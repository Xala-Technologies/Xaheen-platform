<script lang="ts">
  import { cva, type VariantProps } from 'class-variance-authority';
  import { cn } from '../../lib/utils';

  // Label variants
  const labelVariants = cva(
    [
      'text-sm font-medium leading-none',
      'peer-disabled:cursor-not-allowed peer-disabled:opacity-70'
    ],
    {
      variants: {
        size: {
          sm: 'text-xs',
          md: 'text-sm',
          lg: 'text-base',
          xl: 'text-lg'
        },
        variant: {
          default: 'text-foreground',
          muted: 'text-muted-foreground',
          destructive: 'text-destructive',
          success: 'text-green-600 dark:text-green-400'
        }
      },
      defaultVariants: {
        size: 'md',
        variant: 'default'
      }
    }
  );

  type LabelVariant = VariantProps<typeof labelVariants>['variant'];
  type LabelSize = VariantProps<typeof labelVariants>['size'];

  // Props
  export let htmlFor = '';
  export let variant: LabelVariant = 'default';
  export let size: LabelSize = 'md';
  export let required = false;
  export let className = '';

  // Computed
  $: labelClasses = cn(
    labelVariants({ size, variant }),
    className
  );
</script>

<label for={htmlFor} class={labelClasses}>
  <slot />
  {#if required}
    <span class="ml-1 text-destructive" aria-label="required">*</span>
  {/if}
</label>