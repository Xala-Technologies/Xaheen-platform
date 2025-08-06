import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';

// Label variants using Tailwind classes
const labelVariants = {
  default: 'text-foreground',
  muted: 'text-muted-foreground',
  destructive: 'text-destructive',
  success: 'text-green-600 dark:text-green-400'
};

const sizeVariants = {
  sm: 'text-xs',
  md: 'text-sm',
  lg: 'text-base',
  xl: 'text-lg'
};

type LabelVariant = keyof typeof labelVariants;
type LabelSize = keyof typeof sizeVariants;

@Component({
  selector: 'app-label',
  standalone: true,
  imports: [CommonModule],
  template: `
    <label
      [attr.for]="htmlFor"
      [class]="labelClasses"
    >
      <ng-content></ng-content>
      <span *ngIf="required" class="ml-1 text-destructive" aria-label="required">*</span>
    </label>
  `,
  styles: []
})
export class LabelComponent {
  @Input() htmlFor = '';
  @Input() variant: LabelVariant = 'default';
  @Input() size: LabelSize = 'md';
  @Input() required = false;
  @Input() class = '';

  get labelClasses(): string {
    const baseClasses = 'font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70';
    const variantClass = labelVariants[this.variant];
    const sizeClass = sizeVariants[this.size];
    
    return `${baseClasses} ${variantClass} ${sizeClass} ${this.class}`.trim();
  }
}