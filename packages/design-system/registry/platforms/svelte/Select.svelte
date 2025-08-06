<script lang="ts">
  import { createEventDispatcher } from 'svelte';
  import { cva, type VariantProps } from 'class-variance-authority';
  import { cn } from '../../lib/utils';

  // Generate unique ID
  let idCounter = 0;
  const generateId = () => `select-${++idCounter}`;

  // Select variants
  const selectVariants = cva(
    [
      'flex w-full appearance-none rounded-lg border bg-transparent',
      'px-3 py-2 pr-10 text-sm ring-offset-background',
      'placeholder:text-muted-foreground',
      'focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2',
      'disabled:cursor-not-allowed disabled:opacity-50',
      'transition-all duration-200'
    ],
    {
      variants: {
        size: {
          sm: 'h-10 text-sm',
          md: 'h-12 text-base',
          lg: 'h-14 text-lg'
        },
        variant: {
          default: [
            'border-input',
            'hover:border-primary/50'
          ],
          destructive: [
            'border-destructive',
            'focus:ring-destructive'
          ],
          success: [
            'border-green-500',
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

  type SelectVariant = VariantProps<typeof selectVariants>['variant'];
  type SelectSize = VariantProps<typeof selectVariants>['size'];

  // Types
  export interface SelectOption {
    value: string;
    label: string;
    disabled?: boolean;
  }

  // Props
  export let value = '';
  export let options: SelectOption[] = [];
  export let placeholder = '';
  export let variant: SelectVariant = 'default';
  export let size: SelectSize = 'md';
  export let disabled = false;
  export let required = false;
  export let ariaLabel = '';
  export let ariaDescribedby = '';
  export let ariaInvalid = false;
  export let className = '';

  // Event dispatcher
  const dispatch = createEventDispatcher();

  // Computed
  const id = generateId();
  
  $: selectClasses = cn(
    selectVariants({ size, variant }),
    className
  );

  // Methods
  function handleChange(event: Event) {
    const target = event.target as HTMLSelectElement;
    value = target.value;
    dispatch('change', value);
  }
</script>

<div class="relative">
  <select
    {id}
    bind:value
    {disabled}
    {required}
    aria-label={ariaLabel}
    aria-describedby={ariaDescribedby}
    aria-invalid={ariaInvalid}
    class={selectClasses}
    on:change={handleChange}
  >
    {#if placeholder}
      <option value="" disabled>
        {placeholder}
      </option>
    {/if}
    {#each options as option}
      <option value={option.value} disabled={option.disabled}>
        {option.label}
      </option>
    {/each}
  </select>
  <svg
    class="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 opacity-50"
    fill="none"
    stroke="currentColor"
    viewBox="0 0 24 24"
    aria-hidden="true"
  >
    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7" />
  </svg>
</div>