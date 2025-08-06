import { Component, Input, Output, EventEmitter, forwardRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ControlValueAccessor, NG_VALUE_ACCESSOR } from '@angular/forms';

// Select variants using Tailwind classes
const selectVariants = {
  default: 'border-input hover:border-primary/50',
  destructive: 'border-destructive focus:ring-destructive',
  success: 'border-green-500 focus:ring-green-500'
};

const sizeVariants = {
  sm: 'h-10 text-sm',
  md: 'h-12 text-base',
  lg: 'h-14 text-lg'
};

type SelectVariant = keyof typeof selectVariants;
type SelectSize = keyof typeof sizeVariants;

export interface SelectOption {
  value: string;
  label: string;
  disabled?: boolean;
}

let selectIdCounter = 0;

@Component({
  selector: 'app-select',
  standalone: true,
  imports: [CommonModule],
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => SelectComponent),
      multi: true
    }
  ],
  template: `
    <div class="relative">
      <select
        [id]="inputId"
        [value]="value"
        [disabled]="disabled"
        [required]="required"
        [attr.aria-label]="ariaLabel"
        [attr.aria-describedby]="ariaDescribedby"
        [attr.aria-invalid]="ariaInvalid"
        [class]="selectClasses"
        (change)="handleChange($event)"
      >
        <option *ngIf="placeholder" value="" disabled>
          {{ placeholder }}
        </option>
        <option
          *ngFor="let option of options"
          [value]="option.value"
          [disabled]="option.disabled"
        >
          {{ option.label }}
        </option>
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
  `,
  styles: [`
    select {
      appearance: none;
    }
  `]
})
export class SelectComponent implements ControlValueAccessor {
  @Input() options: SelectOption[] = [];
  @Input() placeholder = '';
  @Input() variant: SelectVariant = 'default';
  @Input() size: SelectSize = 'md';
  @Input() disabled = false;
  @Input() required = false;
  @Input() ariaLabel = '';
  @Input() ariaDescribedby = '';
  @Input() ariaInvalid = false;
  @Input() class = '';

  @Output() valueChange = new EventEmitter<string>();

  value = '';
  inputId = `select-${++selectIdCounter}`;

  private onChange: (value: string) => void = () => {};
  private onTouched: () => void = () => {};

  get selectClasses(): string {
    const baseClasses = 'flex w-full appearance-none rounded-lg border bg-transparent px-3 py-2 pr-10 ring-offset-background placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 transition-all duration-200';
    const variantClass = selectVariants[this.variant];
    const sizeClass = sizeVariants[this.size];
    
    return `${baseClasses} ${variantClass} ${sizeClass} ${this.class}`.trim();
  }

  handleChange(event: Event): void {
    const target = event.target as HTMLSelectElement;
    this.value = target.value;
    this.onChange(this.value);
    this.onTouched();
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