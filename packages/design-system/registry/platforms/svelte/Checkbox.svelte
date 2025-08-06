<script lang="ts">
  import { createEventDispatcher } from 'svelte';
  import { cva, type VariantProps } from 'class-variance-authority';
  import { cn } from '../../lib/utils';

  // Generate unique ID
  let idCounter = 0;
  const generateId = () => `checkbox-${++idCounter}`;

  // Checkbox variants
  const checkboxVariants = cva(
    [
      'peer appearance-none rounded border-2 transition-all duration-200',
      'focus:outline-none focus:ring-2 focus:ring-offset-2',
      'disabled:cursor-not-allowed disabled:opacity-50',
      'checked:bg-primary checked:border-primary',
      'checked:before:content-[""] checked:before:absolute checked:before:inset-0',
      'checked:before:flex checked:before:items-center checked:before:justify-center',
      'checked:before:text-primary-foreground',
      'relative cursor-pointer'
    ],
    {
      variants: {
        size: {
          sm: 'h-4 w-4 checked:before:text-xs',
          md: 'h-5 w-5 checked:before:text-sm',
          lg: 'h-6 w-6 checked:before:text-base'
        },
        variant: {
          default: [
            'border-input hover:border-primary/50',
            'focus:ring-primary'
          ],
          destructive: [
            'border-destructive hover:border-destructive/70',
            'checked:bg-destructive checked:border-destructive',
            'focus:ring-destructive'
          ],
          success: [
            'border-green-500 hover:border-green-600',
            'checked:bg-green-500 checked:border-green-500',
            'focus:ring-green-500'
          ]
        }
      },
      defaultVariants: {
        size: 'md',
        variant: 'default'
      }
    }
  );

  const labelVariants = cva(
    [
      'ml-2 select-none cursor-pointer',
      'peer-disabled:cursor-not-allowed peer-disabled:opacity-50'
    ],
    {
      variants: {
        size: {
          sm: 'text-sm',
          md: 'text-base',
          lg: 'text-lg'
        }
      },
      defaultVariants: {
        size: 'md'
      }
    }
  );

  type CheckboxVariant = VariantProps<typeof checkboxVariants>['variant'];
  type CheckboxSize = VariantProps<typeof checkboxVariants>['size'];

  // Props
  export let checked = false;
  export let label = '';
  export let variant: CheckboxVariant = 'default';
  export let size: CheckboxSize = 'md';
  export let disabled = false;
  export let required = false;
  export let ariaLabel = '';
  export let ariaDescribedby = '';
  export let ariaInvalid = false;
  export let className = '';
  export let labelClass = '';

  // Event dispatcher
  const dispatch = createEventDispatcher();

  // Computed
  const id = generateId();
  
  $: checkboxClasses = cn(
    checkboxVariants({ size, variant }),
    className
  );

  $: labelClasses = cn(
    labelVariants({ size }),
    labelClass
  );

  // Methods
  function handleChange(event: Event) {
    const target = event.target as HTMLInputElement;
    checked = target.checked;
    dispatch('change', checked);
  }
</script>

<div class="inline-flex items-center">
  <input
    {id}
    type="checkbox"
    class={checkboxClasses}
    bind:checked
    {disabled}
    {required}
    aria-label={ariaLabel}
    aria-describedby={ariaDescribedby}
    aria-invalid={ariaInvalid}
    on:change={handleChange}
  />
  {#if label || $$slots.default}
    <label for={id} class={labelClasses}>
      <slot>{label}</slot>
    </label>
  {/if}
</div>

<style>
  /* Checkmark icon using CSS */
  input[type="checkbox"]:checked::before {
    content: "✓";
  }
</style>