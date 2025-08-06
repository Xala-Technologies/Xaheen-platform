import { Component, Input, Output, EventEmitter, OnInit, OnDestroy, ViewChild, ElementRef } from '@angular/core';
import { CommonModule } from '@angular/common';

// Alert variants using Tailwind classes
const alertVariants = {
  default: 'bg-background text-foreground border-border',
  destructive: 'border-destructive/50 text-destructive dark:border-destructive bg-destructive/10',
  warning: 'border-yellow-500/50 text-yellow-900 dark:text-yellow-100 bg-yellow-50 dark:bg-yellow-900/20',
  success: 'border-green-500/50 text-green-900 dark:text-green-100 bg-green-50 dark:bg-green-900/20',
  info: 'border-blue-500/50 text-blue-900 dark:text-blue-100 bg-blue-50 dark:bg-blue-900/20',
  nsmOpen: 'border-green-600/50 text-green-900 dark:text-green-100 bg-green-50 dark:bg-green-900/20 border-l-4 border-l-green-600',
  nsmRestricted: 'border-yellow-600/50 text-yellow-900 dark:text-yellow-100 bg-yellow-50 dark:bg-yellow-900/20 border-l-4 border-l-yellow-600',
  nsmConfidential: 'border-red-600/50 text-red-900 dark:text-red-100 bg-red-50 dark:bg-red-900/20 border-l-4 border-l-red-600',
  nsmSecret: 'border-gray-600/50 text-gray-900 dark:text-gray-100 bg-gray-50 dark:bg-gray-900/20 border-l-4 border-l-gray-800'
};

const sizeVariants = {
  sm: 'px-4 py-3 text-sm min-h-[2.5rem]',
  md: 'px-6 py-4 text-base min-h-[3rem]',
  lg: 'px-8 py-5 text-lg min-h-[3.5rem]'
};

type AlertVariant = keyof typeof alertVariants;
type AlertSize = keyof typeof sizeVariants;

@Component({
  selector: 'app-alert',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div
      *ngIf="isVisible"
      #alertRef
      [attr.role]="ariaRole"
      [attr.aria-live]="ariaLive"
      [attr.tabindex]="autoFocus ? -1 : null"
      [class]="alertClasses"
      [attr.data-variant]="finalVariant"
    >
      <!-- Icon -->
      <svg
        *ngIf="showIcon"
        class="h-5 w-5 absolute left-4 top-4"
        fill="none"
        stroke="currentColor"
        viewBox="0 0 24 24"
        aria-hidden="true"
      >
        <path 
          *ngIf="iconPath"
          [attr.d]="iconPath"
          stroke-linecap="round"
          stroke-linejoin="round"
          stroke-width="2"
        />
      </svg>
      
      <!-- Content -->
      <div class="flex-1 min-w-0" [class.pl-7]="showIcon">
        <ng-content></ng-content>
      </div>

      <!-- Dismiss Button -->
      <button
        *ngIf="dismissible"
        type="button"
        (click)="handleDismiss()"
        aria-label="Lukk varsling"
        class="absolute right-4 top-4 rounded-md p-1 opacity-70 hover:opacity-100 focus:opacity-100 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-current transition-opacity duration-200"
      >
        <svg class="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
        </svg>
      </button>

      <!-- NSM Classification for screen readers -->
      <span *ngIf="nsmClassification" class="sr-only">
        NSM-klassifisering: {{ nsmClassification }}
      </span>
    </div>
  `,
  styles: []
})
export class AlertComponent implements OnInit, OnDestroy {
  @Input() variant: AlertVariant = 'default';
  @Input() size: AlertSize = 'md';
  @Input() dismissible = false;
  @Input() icon = true;
  @Input() nsmClassification?: 'OPEN' | 'RESTRICTED' | 'CONFIDENTIAL' | 'SECRET';
  @Input() ariaLive: 'polite' | 'assertive' | 'off' = 'polite';
  @Input() autoFocus = false;
  @Input() class = '';

  @Output() dismiss = new EventEmitter<void>();

  @ViewChild('alertRef') alertRef?: ElementRef<HTMLDivElement>;

  isVisible = true;
  showIcon = true;
  iconPath = '';

  private keydownListener?: (event: KeyboardEvent) => void;

  ngOnInit(): void {
    this.showIcon = this.icon !== false;
    this.updateIcon();

    if (this.dismissible) {
      this.keydownListener = (event: KeyboardEvent) => {
        if (event.key === 'Escape') {
          this.handleDismiss();
        }
      };
      document.addEventListener('keydown', this.keydownListener);
    }

    // Auto focus if needed
    if (this.autoFocus && this.alertRef && (this.finalVariant === 'destructive' || this.finalVariant === 'nsmSecret')) {
      setTimeout(() => {
        this.alertRef?.nativeElement.focus();
      });
    }
  }

  ngOnDestroy(): void {
    if (this.keydownListener) {
      document.removeEventListener('keydown', this.keydownListener);
    }
  }

  get finalVariant(): AlertVariant {
    if (this.nsmClassification) {
      const classification = this.nsmClassification.charAt(0).toUpperCase() + this.nsmClassification.slice(1).toLowerCase();
      return (`nsm${classification}` as AlertVariant);
    }
    return this.variant;
  }

  get alertClasses(): string {
    const baseClasses = 'relative w-full rounded-lg border px-6 py-4 text-sm transition-all duration-200 min-h-[3rem] flex items-start gap-3';
    const variantClass = alertVariants[this.finalVariant];
    const sizeClass = sizeVariants[this.size];
    const dismissibleClass = this.dismissible ? 'pr-12' : '';
    
    return `${baseClasses} ${variantClass} ${sizeClass} ${dismissibleClass} ${this.class}`.trim();
  }

  get ariaRole(): string {
    switch (this.finalVariant) {
      case 'destructive':
      case 'nsmSecret':
      case 'nsmConfidential':
        return 'alert';
      default:
        return 'status';
    }
  }

  handleDismiss(): void {
    this.isVisible = false;
    this.dismiss.emit();
  }

  private updateIcon(): void {
    // Icon paths for different variants
    const iconPaths: Record<AlertVariant, string> = {
      default: 'M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z', // Info
      destructive: 'M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z', // X Circle
      warning: 'M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z', // Warning
      success: 'M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z', // Check Circle
      info: 'M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z', // Info
      nsmOpen: 'M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z', // Check Circle
      nsmRestricted: 'M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z', // Warning
      nsmConfidential: 'M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z', // X Circle
      nsmSecret: 'M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z' // X Circle
    };
    
    this.iconPath = iconPaths[this.finalVariant];
  }
}