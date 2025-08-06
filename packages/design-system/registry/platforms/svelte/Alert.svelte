<script lang="ts">
  import { createEventDispatcher, onMount, onDestroy } from 'svelte';
  import { cva, type VariantProps } from 'class-variance-authority';
  import { cn } from '../../lib/utils';

  // Alert variants
  const alertVariants = cva(
    [
      'relative w-full rounded-lg border px-6 py-4',
      'text-sm transition-all duration-200',
      '[&>svg~*]:pl-7 [&>svg+div]:translate-y-[-3px] [&>svg]:absolute [&>svg]:left-4 [&>svg]:top-4 [&>svg]:text-foreground',
      'min-h-[3rem] flex items-start gap-3'
    ],
    {
      variants: {
        variant: {
          default: [
            'bg-background text-foreground',
            'border-border'
          ],
          destructive: [
            'border-destructive/50 text-destructive dark:border-destructive',
            'bg-destructive/10 [&>svg]:text-destructive'
          ],
          warning: [
            'border-yellow-500/50 text-yellow-900 dark:text-yellow-100',
            'bg-yellow-50 dark:bg-yellow-900/20 [&>svg]:text-yellow-600 dark:[&>svg]:text-yellow-400'
          ],
          success: [
            'border-green-500/50 text-green-900 dark:text-green-100',
            'bg-green-50 dark:bg-green-900/20 [&>svg]:text-green-600 dark:[&>svg]:text-green-400'
          ],
          info: [
            'border-blue-500/50 text-blue-900 dark:text-blue-100',
            'bg-blue-50 dark:bg-blue-900/20 [&>svg]:text-blue-600 dark:[&>svg]:text-blue-400'
          ],
          nsmOpen: [
            'border-green-600/50 text-green-900 dark:text-green-100',
            'bg-green-50 dark:bg-green-900/20 [&>svg]:text-green-600',
            'border-l-4 border-l-green-600'
          ],
          nsmRestricted: [
            'border-yellow-600/50 text-yellow-900 dark:text-yellow-100',
            'bg-yellow-50 dark:bg-yellow-900/20 [&>svg]:text-yellow-600',
            'border-l-4 border-l-yellow-600'
          ],
          nsmConfidential: [
            'border-red-600/50 text-red-900 dark:text-red-100',
            'bg-red-50 dark:bg-red-900/20 [&>svg]:text-red-600',
            'border-l-4 border-l-red-600'
          ],
          nsmSecret: [
            'border-gray-600/50 text-gray-900 dark:text-gray-100',
            'bg-gray-50 dark:bg-gray-900/20 [&>svg]:text-gray-600',
            'border-l-4 border-l-gray-800'
          ]
        },
        size: {
          sm: 'px-4 py-3 text-sm min-h-[2.5rem]',
          md: 'px-6 py-4 text-base min-h-[3rem]',
          lg: 'px-8 py-5 text-lg min-h-[3.5rem]'
        }
      },
      defaultVariants: {
        variant: 'default',
        size: 'md'
      }
    }
  );

  type AlertVariant = VariantProps<typeof alertVariants>['variant'];
  type AlertSize = VariantProps<typeof alertVariants>['size'];

  // Props
  export let variant: AlertVariant = 'default';
  export let size: AlertSize = 'md';
  export let dismissible = false;
  export let icon = true;
  export let nsmClassification: 'OPEN' | 'RESTRICTED' | 'CONFIDENTIAL' | 'SECRET' | undefined = undefined;
  export let ariaLive: 'polite' | 'assertive' | 'off' = 'polite';
  export let autoFocus = false;
  export let className = '';

  // State
  let isVisible = true;
  let alertElement: HTMLDivElement;

  // Event dispatcher
  const dispatch = createEventDispatcher();

  // Icon paths for different variants
  const iconPaths = {
    default: 'M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z',
    destructive: 'M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z',
    warning: 'M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z',
    success: 'M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z',
    info: 'M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z',
    nsmOpen: 'M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z',
    nsmRestricted: 'M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z',
    nsmConfidential: 'M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z',
    nsmSecret: 'M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z'
  };

  // Computed
  $: finalVariant = nsmClassification 
    ? `nsm${nsmClassification.charAt(0).toUpperCase() + nsmClassification.slice(1).toLowerCase()}` as AlertVariant
    : variant;
  
  $: shouldShowIcon = icon !== false;
  $: iconPath = iconPaths[finalVariant || 'default'];
  
  $: alertClasses = cn(
    alertVariants({ variant: finalVariant, size }),
    dismissible && 'pr-12',
    className
  );

  $: ariaRole = (() => {
    switch (finalVariant) {
      case 'destructive':
      case 'nsmSecret':
      case 'nsmConfidential':
        return 'alert';
      default:
        return 'status';
    }
  })();

  // Methods
  function handleDismiss() {
    isVisible = false;
    dispatch('dismiss');
  }

  function handleKeyDown(event: KeyboardEvent) {
    if (dismissible && event.key === 'Escape') {
      handleDismiss();
    }
  }

  // Lifecycle
  onMount(() => {
    if (dismissible) {
      document.addEventListener('keydown', handleKeyDown);
    }

    if (autoFocus && alertElement && (finalVariant === 'destructive' || finalVariant === 'nsmSecret')) {
      alertElement.focus();
    }
  });

  onDestroy(() => {
    if (dismissible) {
      document.removeEventListener('keydown', handleKeyDown);
    }
  });
</script>

{#if isVisible}
  <div
    bind:this={alertElement}
    role={ariaRole}
    aria-live={ariaLive}
    tabindex={autoFocus ? -1 : undefined}
    class={alertClasses}
    data-variant={finalVariant}
  >
    <!-- Icon -->
    {#if shouldShowIcon}
      <svg
        class="h-5 w-5"
        fill="none"
        stroke="currentColor"
        viewBox="0 0 24 24"
        aria-hidden="true"
      >
        <path
          d={iconPath}
          stroke-linecap="round"
          stroke-linejoin="round"
          stroke-width="2"
        />
      </svg>
    {/if}
    
    <!-- Content -->
    <div class="flex-1 min-w-0">
      <slot />
    </div>

    <!-- Dismiss Button -->
    {#if dismissible}
      <button
        type="button"
        on:click={handleDismiss}
        aria-label="Lukk varsling"
        class="absolute right-4 top-4 rounded-md p-1 opacity-70 hover:opacity-100 focus:opacity-100 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-current transition-opacity duration-200"
      >
        <svg class="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
        </svg>
      </button>
    {/if}

    <!-- NSM Classification for screen readers -->
    {#if nsmClassification}
      <span class="sr-only">
        NSM-klassifisering: {nsmClassification}
      </span>
    {/if}
  </div>
{/if}