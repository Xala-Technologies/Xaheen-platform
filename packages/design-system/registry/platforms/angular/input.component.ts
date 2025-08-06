/**
 * Angular Input Component
 * Norwegian-optimized text input with full accessibility support
 */

import { Component, Input, Output, EventEmitter, forwardRef } from '@angular/core';
import { ControlValueAccessor, NG_VALUE_ACCESSOR } from '@angular/forms';

@Component({
  selector: 'xaheen-input',
  template: `
    <div [class]="containerClasses" *ngIf="leadingIcon || trailingIcon || helperText; else simpleInput">
      <div 
        *ngIf="leadingIcon"
        class="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground pointer-events-none"
        aria-hidden="true"
      >
        <ng-content select="[slot=leading-icon]"></ng-content>
      </div>
      
      <input
        [type]="type"
        [class]="inputClasses"
        [disabled]="disabled"
        [attr.aria-invalid]="error ? 'true' : null"
        [attr.aria-describedby]="combinedAriaDescribedBy"
        [value]="value"
        (input)="onInput($event)"
        (blur)="onTouched()"
      />
      
      <div 
        *ngIf="trailingIcon"
        class="absolute right-4 top-1/2 -translate-y-1/2 text-muted-foreground pointer-events-none"
        aria-hidden="true"
      >
        <ng-content select="[slot=trailing-icon]"></ng-content>
      </div>
      
      <p 
        *ngIf="helperText"
        [id]="helperTextId"
        [class]="helperTextClasses"
      >
        {{ helperText }}
      </p>
    </div>
    
    <ng-template #simpleInput>
      <input
        [type]="type"
        [class]="inputClasses"
        [disabled]="disabled"
        [attr.aria-invalid]="error ? 'true' : null"
        [attr.aria-describedby]="combinedAriaDescribedBy"
        [value]="value"
        (input)="onInput($event)"
        (blur)="onTouched()"
      />
    </ng-template>
  `,
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => InputComponent),
      multi: true
    }
  ]
})
export class InputComponent implements ControlValueAccessor {
  @Input() type: string = 'text';
  @Input() variant: 'default' | 'error' | 'success' | 'warning' = 'default';
  @Input() size: 'md' | 'lg' | 'xl' = 'lg';
  @Input() fullWidth: boolean = true;
  @Input() error: boolean = false;
  @Input() success: boolean = false;
  @Input() warning: boolean = false;
  @Input() helperText?: string;
  @Input() leadingIcon: boolean = false;
  @Input() trailingIcon: boolean = false;
  @Input() disabled: boolean = false;
  @Input() className?: string;

  @Output() valueChange = new EventEmitter<string>();

  value: string = '';
  private helperId = `input-${Math.random().toString(36).substr(2, 9)}`;

  private onChange = (value: string) => {};
  onTouched = () => {};

  get stateVariant(): string {
    if (this.error) return 'error';
    if (this.success) return 'success';
    if (this.warning) return 'warning';
    return this.variant;
  }

  get containerClasses(): string {
    const classes = ['relative'];
    if (this.fullWidth) classes.push('w-full');
    return classes.join(' ');
  }

  get inputClasses(): string {
    const baseClasses = [
      'flex w-full',
      'font-medium text-foreground placeholder:text-muted-foreground',
      'bg-background',
      'border-2 border-input',
      'transition-all duration-200 ease-in-out',
      'disabled:cursor-not-allowed disabled:opacity-50',
      'focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary/20',
      'focus:border-primary',
      'file:border-0 file:bg-transparent file:text-sm file:font-medium',
      'autofill:bg-background',
      'contrast-more:border-2'
    ];

    // Size variants
    const sizeClasses = {
      md: 'h-12 px-4 py-3 text-base rounded-lg',
      lg: 'h-14 px-5 py-4 text-lg rounded-lg',
      xl: 'h-16 px-6 py-5 text-xl rounded-xl',
    };

    // State variants
    const stateClasses = {
      default: '',
      error: 'border-destructive focus:ring-destructive/20 focus:border-destructive',
      success: 'border-green-600 focus:ring-green-600/20 focus:border-green-600',
      warning: 'border-yellow-600 focus:ring-yellow-600/20 focus:border-yellow-600',
    };

    const classes = [
      ...baseClasses,
      sizeClasses[this.size],
      stateClasses[this.stateVariant as keyof typeof stateClasses]
    ];

    if (this.leadingIcon) classes.push('pl-12');
    if (this.trailingIcon) classes.push('pr-12');
    if (!this.fullWidth) classes.push('w-auto');
    if (this.className) classes.push(this.className);

    return classes.join(' ');
  }

  get helperTextClasses(): string {
    const classes = ['mt-2 text-sm'];
    
    if (this.error) classes.push('text-destructive');
    else if (this.success) classes.push('text-green-600');
    else if (this.warning) classes.push('text-yellow-600');
    else classes.push('text-muted-foreground');

    return classes.join(' ');
  }

  get helperTextId(): string {
    return this.helperText ? `${this.helperId}-helper` : '';
  }

  get combinedAriaDescribedBy(): string | null {
    const parts = [];
    if (this.helperTextId) parts.push(this.helperTextId);
    return parts.length > 0 ? parts.join(' ') : null;
  }

  onInput(event: Event): void {
    const target = event.target as HTMLInputElement;
    this.value = target.value;
    this.onChange(this.value);
    this.valueChange.emit(this.value);
  }

  // ControlValueAccessor implementation
  writeValue(value: string): void {
    this.value = value || '';
  }

  registerOnChange(fn: (value: string) => void): void {
    this.onChange = fn;
  }

  registerOnTouched(fn: () => void): void {
    this.onTouched = fn;
  }

  setDisabledState(isDisabled: boolean): void {
    this.disabled = isDisabled;
  }
}