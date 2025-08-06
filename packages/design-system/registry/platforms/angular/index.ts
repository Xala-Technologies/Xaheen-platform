/**
 * Angular Platform Index
 * Exports all Angular components
 */

export { ButtonComponent } from './button.component';
export { InputComponent } from './input.component';
export { CardComponent, CardHeaderComponent, CardTitleComponent, CardContentComponent, CardFooterComponent } from './card.component';
export { 
  AccordionComponent, 
  AccordionItemComponent, 
  AccordionTriggerComponent, 
  AccordionContentComponent,
  AccordionModule 
} from './accordion.component';

// Platform utilities
export const PlatformInfo = {
  name: 'Angular',
  framework: 'angular',
  features: ['standalone', 'signals', 'typescript', 'dependency-injection'],
  dependencies: ['@angular/core', '@angular/common'],
  devDependencies: ['@angular/cli', 'typescript']
} as const;