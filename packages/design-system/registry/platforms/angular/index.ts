/**
 * Angular Platform Index
 * Exports all Angular components
 */

// Core components
export { 
  AccordionComponent, 
  AccordionItemComponent, 
  AccordionTriggerComponent, 
  AccordionContentComponent,
  AccordionModule 
} from './accordion.component';
export { AlertComponent } from './alert.component';
export { BadgeComponent } from './badge.component';
export { ButtonComponent } from './button.component';
export { CardComponent, CardHeaderComponent, CardTitleComponent, CardContentComponent, CardFooterComponent } from './card.component';
export { CheckboxComponent } from './checkbox.component';
export { InputComponent } from './input.component';
export { LabelComponent } from './label.component';
export { SelectComponent, type SelectOption } from './select.component';

// Platform utilities
export const PlatformInfo = {
  name: 'Angular',
  framework: 'angular',
  features: ['standalone', 'signals', 'typescript', 'dependency-injection'],
  dependencies: ['@angular/core', '@angular/common'],
  devDependencies: ['@angular/cli', 'typescript']
} as const;