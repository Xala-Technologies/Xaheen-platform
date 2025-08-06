import { Component, Input, Output, EventEmitter, forwardRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ControlValueAccessor, NG_VALUE_ACCESSOR } from '@angular/forms';

// Checkbox variants using Tailwind classes
const checkboxVariants = {
  default: 'border-input hover:border-primary/50 focus:ring-primary',
  destructive: 'border-destructive hover:border-destructive/70 checked:bg-destructive checked:border-destructive focus:ring-destructive',
  success: 'border-green-500 hover:border-green-600 checked:bg-green-500 checked:border-green-500 focus:ring-green-500'
};

const sizeVariants = {
  sm: 'h-4 w-4',
  md: 'h-5 w-5',
  lg: 'h-6 w-6'
};

const labelSizeVariants = {
  sm: 'text-sm',
  md: 'text-base',
  lg: 'text-lg'
};

type CheckboxVariant = keyof typeof checkboxVariants;
type CheckboxSize = keyof typeof sizeVariants;

let checkboxIdCounter = 0;

@Component({
  selector: 'app-checkbox',
  standalone: true,
  imports: [CommonModule],
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => CheckboxComponent),
      multi: true
    }
  ],
  template: `
    <div class="inline-flex items-center">
      <input
        [id]="inputId"
        type="checkbox"
        [class]="checkboxClasses"
        [checked]="checked"
        [disabled]="disabled"
        [required]="required"
        [attr.aria-label]="ariaLabel"
        [attr.aria-describedby]="ariaDescribedby"
        [attr.aria-invalid]="ariaInvalid"
        (change)="handleChange($event)"
      />
      <label
        *ngIf="label"
        [for]="inputId"
        [class]="labelClasses"
      >
        {{ label }}
      </label>
    </div>
  `,
  styles: [`
    input[type="checkbox"] {
      appearance: none;
      position: relative;
      cursor: pointer;
    }
    
    input[type="checkbox"]:checked::before {
      content: "✓";
      position: absolute;
      inset: 0;
      display: flex;
      align-items: center;
      justify-content: center;
      color: white;
      font-weight: bold;
    }
    
    input[type="checkbox"]:checked.h-4::before {
      font-size: 0.75rem;
    }
    
    input[type="checkbox"]:checked.h-5::before {
      font-size: 0.875rem;
    }
    
    input[type="checkbox"]:checked.h-6::before {
      font-size: 1rem;
    }
  `]
})
export class CheckboxComponent implements ControlValueAccessor {
  @Input() label = '';
  @Input() variant: CheckboxVariant = 'default';
  @Input() size: CheckboxSize = 'md';
  @Input() disabled = false;
  @Input() required = false;
  @Input() ariaLabel = '';
  @Input() ariaDescribedby = '';
  @Input() ariaInvalid = false;
  @Input() class = '';
  @Input() labelClass = '';

  @Output() checkedChange = new EventEmitter<boolean>();

  checked = false;
  inputId = `checkbox-${++checkboxIdCounter}`;

  private onChange: (value: boolean) => void = () => {};
  private onTouched: () => void = () => {};

  get checkboxClasses(): string {
    const baseClasses = 'peer rounded border-2 transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 checked:bg-primary checked:border-primary';
    const variantClass = checkboxVariants[this.variant];
    const sizeClass = sizeVariants[this.size];
    
    return `${baseClasses} ${variantClass} ${sizeClass} ${this.class}`.trim();
  }

  get labelClasses(): string {
    const baseClasses = 'ml-2 select-none cursor-pointer peer-disabled:cursor-not-allowed peer-disabled:opacity-50';
    const sizeClass = labelSizeVariants[this.size];
    
    return `${baseClasses} ${sizeClass} ${this.labelClass}`.trim();
  }

  handleChange(event: Event): void {
    const target = event.target as HTMLInputElement;
    this.checked = target.checked;
    this.onChange(this.checked);
    this.onTouched();
    this.checkedChange.emit(this.checked);
  }

  // ControlValueAccessor implementation
  writeValue(value: boolean): void {
    this.checked = value;
  }

  registerOnChange(fn: (value: boolean) => void): void {
    this.onChange = fn;
  }

  registerOnTouched(fn: () => void): void {
    this.onTouched = fn;
  }

  setDisabledState(isDisabled: boolean): void {
    this.disabled = isDisabled;
  }
}