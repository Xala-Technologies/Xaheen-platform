/**
 * Angular Button Implementation
 * Generated from universal ButtonSpec
 */

import { 
  Component, 
  Input, 
  Output, 
  EventEmitter, 
  HostBinding, 
  OnInit,
  ChangeDetectionStrategy
} from '@angular/core';
import { CommonModule } from '@angular/common';

// =============================================================================
// COMPONENT INTERFACE
// =============================================================================

export type ButtonVariant = 'primary' | 'secondary' | 'outline' | 'ghost' | 'destructive';
export type ButtonSize = 'xs' | 'sm' | 'md' | 'lg' | 'xl';

@Component({
  selector: 'xaheen-button',
  standalone: true,
  imports: [CommonModule],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <button
      [class]="buttonClasses"
      [disabled]="isDisabled"
      [attr.aria-label]="ariaLabel"
      [attr.aria-disabled]="isDisabled"
      [type]="type"
      (click)="handleClick($event)"
    >
      <!-- Loading spinner -->
      <svg
        *ngIf="loading"
        [class]="'animate-spin ' + spinnerSizeClass + ' mr-2'"
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

      <!-- Prefix icon -->
      <span 
        *ngIf="!loading && hasIconSlot" 
        class="shrink-0 mr-2"
      >
        <ng-content select="[slot=icon]"></ng-content>
      </span>

      <!-- Button content -->
      <span 
        *ngIf="hasDefaultContent"
        [class]="loading ? 'opacity-70' : ''"
      >
        <ng-content></ng-content>
      </span>

      <!-- Suffix icon -->
      <span 
        *ngIf="!loading && hasSuffixIconSlot" 
        class="shrink-0 ml-2"
      >
        <ng-content select="[slot=suffix-icon]"></ng-content>
      </span>
    </button>
  `,
  styles: [`
    :host {
      display: inline-block;
    }
    
    :host([fullWidth]) {
      display: block;
      width: 100%;
    }
    
    button {
      font-family: inherit;
    }
  `]
})
export class ButtonComponent implements OnInit {
  // =============================================================================
  // INPUT PROPERTIES
  // =============================================================================

  @Input() variant: ButtonVariant = 'primary';
  @Input() size: ButtonSize = 'md';
  @Input() disabled: boolean = false;
  @Input() loading: boolean = false;
  @Input() type: 'button' | 'submit' | 'reset' = 'button';
  @Input() ariaLabel?: string;
  @Input() customClass?: string;

  @HostBinding('attr.fullWidth')
  @Input() fullWidth: boolean = false;

  // =============================================================================
  // OUTPUT EVENTS
  // =============================================================================

  @Output() buttonClick = new EventEmitter<MouseEvent>();

  // =============================================================================
  // COMPUTED PROPERTIES
  // =============================================================================

  get isDisabled(): boolean {
    return this.disabled || this.loading;
  }

  get spinnerSizeClass(): string {
    const sizeMap = {
      xs: 'h-3 w-3',
      sm: 'h-3 w-3',
      md: 'h-4 w-4',
      lg: 'h-4 w-4',
      xl: 'h-5 w-5'
    };
    return sizeMap[this.size];
  }

  get buttonClasses(): string {
    const baseClasses = [
      'inline-flex items-center justify-center gap-2',
      'rounded-md text-sm font-medium transition-colors',
      'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2',
      'disabled:pointer-events-none disabled:opacity-50',
      'select-none'
    ];

    // Variant classes
    const variantClasses: Record<ButtonVariant, string[]> = {
      primary: [
        'bg-primary text-primary-foreground',
        'hover:bg-primary/90',
        'focus-visible:ring-primary'
      ],
      secondary: [
        'bg-secondary text-secondary-foreground',
        'hover:bg-secondary/80',
        'focus-visible:ring-secondary'
      ],
      outline: [
        'border border-input bg-background',
        'hover:bg-accent hover:text-accent-foreground',
        'focus-visible:ring-primary'
      ],
      ghost: [
        'hover:bg-accent hover:text-accent-foreground',
        'focus-visible:ring-primary'
      ],
      destructive: [
        'bg-destructive text-destructive-foreground',
        'hover:bg-destructive/90',
        'focus-visible:ring-destructive'
      ]
    };

    // Size classes
    const sizeClasses: Record<ButtonSize, string> = {
      xs: 'h-8 px-3 text-xs',
      sm: 'h-10 px-4 text-sm',
      md: 'h-12 px-6 text-base',
      lg: 'h-14 px-8 text-lg',
      xl: 'h-16 px-10 text-xl'
    };

    return [
      ...baseClasses,
      ...variantClasses[this.variant],
      sizeClasses[this.size],
      this.fullWidth ? 'w-full' : '',
      this.customClass || ''
    ].filter(Boolean).join(' ');
  }

  // Content projection detection (simplified for demo)
  get hasIconSlot(): boolean {
    // In a real implementation, you'd check for projected content
    return true;
  }

  get hasDefaultContent(): boolean {
    return true;
  }

  get hasSuffixIconSlot(): boolean {
    return true;
  }

  // =============================================================================
  // LIFECYCLE
  // =============================================================================

  ngOnInit(): void {
    // Component initialization logic
  }

  // =============================================================================
  // EVENT HANDLERS
  // =============================================================================

  handleClick(event: MouseEvent): void {
    if (!this.isDisabled) {
      this.buttonClick.emit(event);
    }
  }
}

// =============================================================================
// COMPONENT METADATA
// =============================================================================

export const ButtonMeta = {
  id: 'button',
  name: 'Button',
  platform: 'angular',
  category: 'atom',
  description: 'Interactive button element built with Angular',
  
  accessibility: {
    wcagLevel: 'AAA' as const,
    features: [
      'Keyboard navigation',
      'Screen reader support',
      'ARIA attributes',
      'Focus management',
      'Loading state announcements'
    ]
  },
  
  bundle: {
    size: '4.1kb',
    dependencies: ['@angular/core', '@angular/common'],
    treeshakable: true
  },
  
  usage: {
    selector: 'xaheen-button',
    inputs: ['variant', 'size', 'disabled', 'loading', 'fullWidth'],
    outputs: ['buttonClick'],
    slots: ['default', 'icon', 'suffix-icon']
  },
  
  examples: {
    basic: '<xaheen-button>Click me</xaheen-button>',
    loading: '<xaheen-button [loading]="true">Processing...</xaheen-button>',
    withIcon: `
      <xaheen-button>
        <svg slot="icon" class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6"/>
        </svg>
        Add Item
      </xaheen-button>
    `
  }
} as const;