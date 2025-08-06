/**
 * Angular Card Component
 * Container with professional elevation and spacing standards
 */

import { Component, Input } from '@angular/core';

@Component({
  selector: 'xaheen-card',
  template: `
    <div [class]="cardClasses">
      <ng-content></ng-content>
    </div>
  `
})
export class CardComponent {
  @Input() variant: 'default' | 'elevated' | 'outline' | 'ghost' = 'default';
  @Input() padding: 'none' | 'sm' | 'md' | 'lg' | 'xl' = 'md';
  @Input() rounded: 'none' | 'sm' | 'md' | 'lg' | 'xl' | 'full' = 'lg';
  @Input() className?: string;

  get cardClasses(): string {
    const baseClasses = [
      'bg-card text-card-foreground',
      'border border-border',
      'transition-all duration-200'
    ];

    // Variant classes
    const variantClasses = {
      default: 'shadow-md hover:shadow-lg',
      elevated: 'shadow-lg hover:shadow-xl',
      outline: 'shadow-sm hover:shadow-md',
      ghost: 'shadow-none hover:shadow-sm',
    };

    // Padding classes
    const paddingClasses = {
      none: 'p-0',
      sm: 'p-4',
      md: 'p-6',
      lg: 'p-8',
      xl: 'p-10'
    };

    // Rounded classes
    const roundedClasses = {
      none: 'rounded-none',
      sm: 'rounded-md',
      md: 'rounded-lg',
      lg: 'rounded-xl',
      xl: 'rounded-2xl',
      full: 'rounded-full'
    };

    const classes = [
      ...baseClasses,
      variantClasses[this.variant],
      paddingClasses[this.padding],
      roundedClasses[this.rounded]
    ];

    if (this.className) classes.push(this.className);

    return classes.join(' ');
  }
}

@Component({
  selector: 'xaheen-card-header',
  template: `
    <div [class]="headerClasses">
      <ng-content></ng-content>
    </div>
  `
})
export class CardHeaderComponent {
  @Input() padding: 'none' | 'sm' | 'md' | 'lg' = 'md';
  @Input() className?: string;

  get headerClasses(): string {
    const baseClasses = ['flex flex-col space-y-1.5'];

    const paddingClasses = {
      none: '',
      sm: 'p-4',
      md: 'p-6',
      lg: 'p-8'
    };

    const classes = [
      ...baseClasses,
      paddingClasses[this.padding]
    ];

    if (this.className) classes.push(this.className);

    return classes.join(' ');
  }
}

@Component({
  selector: 'xaheen-card-title',
  template: `
    <ng-container [ngSwitch]="as">
      <h1 *ngSwitchCase="'h1'" [class]="titleClasses"><ng-content></ng-content></h1>
      <h2 *ngSwitchCase="'h2'" [class]="titleClasses"><ng-content></ng-content></h2>
      <h3 *ngSwitchDefault [class]="titleClasses"><ng-content></ng-content></h3>
      <h4 *ngSwitchCase="'h4'" [class]="titleClasses"><ng-content></ng-content></h4>
      <h5 *ngSwitchCase="'h5'" [class]="titleClasses"><ng-content></ng-content></h5>
      <h6 *ngSwitchCase="'h6'" [class]="titleClasses"><ng-content></ng-content></h6>
    </ng-container>
  `
})
export class CardTitleComponent {
  @Input() as: 'h1' | 'h2' | 'h3' | 'h4' | 'h5' | 'h6' = 'h3';
  @Input() className?: string;

  get titleClasses(): string {
    const classes = [
      'text-2xl font-semibold leading-none tracking-tight'
    ];

    if (this.className) classes.push(this.className);

    return classes.join(' ');
  }
}

@Component({
  selector: 'xaheen-card-content',
  template: `
    <div [class]="contentClasses">
      <ng-content></ng-content>
    </div>
  `
})
export class CardContentComponent {
  @Input() padding: 'none' | 'sm' | 'md' | 'lg' = 'md';
  @Input() className?: string;

  get contentClasses(): string {
    const paddingClasses = {
      none: '',
      sm: 'p-4 pt-0',
      md: 'p-6 pt-0',
      lg: 'p-8 pt-0'
    };

    const classes = [paddingClasses[this.padding]];

    if (this.className) classes.push(this.className);

    return classes.join(' ');
  }
}

@Component({
  selector: 'xaheen-card-footer',
  template: `
    <div [class]="footerClasses">
      <ng-content></ng-content>
    </div>
  `
})
export class CardFooterComponent {
  @Input() padding: 'none' | 'sm' | 'md' | 'lg' = 'md';
  @Input() className?: string;

  get footerClasses(): string {
    const baseClasses = ['flex items-center'];

    const paddingClasses = {
      none: '',
      sm: 'p-4 pt-0',
      md: 'p-6 pt-0',
      lg: 'p-8 pt-0'
    };

    const classes = [
      ...baseClasses,
      paddingClasses[this.padding]
    ];

    if (this.className) classes.push(this.className);

    return classes.join(' ');
  }
}