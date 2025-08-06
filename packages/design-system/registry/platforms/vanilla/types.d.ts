/**
 * TypeScript definitions for Xaheen Web Components
 */

declare module '@xaheen/design-system/vanilla' {
  // Button Component
  export interface XaheenButtonElement extends HTMLElement {
    variant: 'primary' | 'secondary' | 'outline' | 'ghost' | 'destructive';
    size: 'xs' | 'sm' | 'md' | 'lg' | 'xl';
    disabled: boolean;
    loading: boolean;
    fullwidth: boolean;
    type: 'button' | 'submit' | 'reset';
  }

  export interface XaheenButtonEventMap {
    'xaheen-click': CustomEvent<{ originalEvent: MouseEvent }>;
  }

  export interface XaheenButton extends XaheenButtonElement {
    addEventListener<K extends keyof XaheenButtonEventMap>(
      type: K,
      listener: (this: XaheenButtonElement, ev: XaheenButtonEventMap[K]) => any,
      options?: boolean | AddEventListenerOptions
    ): void;
    removeEventListener<K extends keyof XaheenButtonEventMap>(
      type: K,
      listener: (this: XaheenButtonElement, ev: XaheenButtonEventMap[K]) => any,
      options?: boolean | EventListenerOptions
    ): void;
  }

  // Input Component
  export interface XaheenInputElement extends HTMLElement {
    type: 'text' | 'email' | 'password' | 'number' | 'search' | 'tel' | 'url';
    value: string;
    placeholder: string;
    disabled: boolean;
    required: boolean;
    error: string;
    label: string;
    name: string;
    readonly: boolean;
    pattern?: string;
    minlength?: number;
    maxlength?: number;
    min?: string;
    max?: string;
    step?: string;
    autocomplete?: string;
    
    // Form associated methods
    readonly form: HTMLFormElement | null;
    readonly validity: ValidityState;
    readonly validationMessage: string;
    readonly willValidate: boolean;
    checkValidity(): boolean;
    reportValidity(): boolean;
    setCustomValidity(message: string): void;
  }

  export interface XaheenInputEventMap {
    'xaheen-input': CustomEvent<{ value: string }>;
    'xaheen-change': CustomEvent<{ value: string }>;
    'xaheen-focus': CustomEvent<{ value: string }>;
    'xaheen-blur': CustomEvent<{ value: string }>;
  }

  export interface XaheenInput extends XaheenInputElement {
    addEventListener<K extends keyof XaheenInputEventMap>(
      type: K,
      listener: (this: XaheenInputElement, ev: XaheenInputEventMap[K]) => any,
      options?: boolean | AddEventListenerOptions
    ): void;
    removeEventListener<K extends keyof XaheenInputEventMap>(
      type: K,
      listener: (this: XaheenInputElement, ev: XaheenInputEventMap[K]) => any,
      options?: boolean | EventListenerOptions
    ): void;
  }

  // Card Component
  export interface XaheenCardElement extends HTMLElement {
    variant: 'default' | 'outlined' | 'filled' | 'elevated';
    padding: 'none' | 'sm' | 'md' | 'lg' | 'xl';
    hoverable: boolean;
    clickable: boolean;
  }

  export interface XaheenCardEventMap {
    'xaheen-card-click': CustomEvent<{ originalEvent: MouseEvent }>;
    'xaheen-card-mouseenter': CustomEvent<{ originalEvent: MouseEvent }>;
    'xaheen-card-mouseleave': CustomEvent<{ originalEvent: MouseEvent }>;
    'xaheen-card-focus': CustomEvent<{ originalEvent: FocusEvent }>;
    'xaheen-card-blur': CustomEvent<{ originalEvent: FocusEvent }>;
  }

  export interface XaheenCard extends XaheenCardElement {
    addEventListener<K extends keyof XaheenCardEventMap>(
      type: K,
      listener: (this: XaheenCardElement, ev: XaheenCardEventMap[K]) => any,
      options?: boolean | AddEventListenerOptions
    ): void;
    removeEventListener<K extends keyof XaheenCardEventMap>(
      type: K,
      listener: (this: XaheenCardElement, ev: XaheenCardEventMap[K]) => any,
      options?: boolean | EventListenerOptions
    ): void;
  }

  // Platform utilities
  export interface PlatformInfo {
    readonly name: string;
    readonly framework: string;
    readonly features: ReadonlyArray<string>;
    readonly dependencies: ReadonlyArray<string>;
    readonly devDependencies: ReadonlyArray<string>;
    readonly components: {
      readonly button: string;
      readonly input: string;
      readonly card: string;
    };
  }

  export const XaheenButton: {
    new(): XaheenButton;
    prototype: XaheenButton;
  };

  export const XaheenInput: {
    new(): XaheenInput;
    prototype: XaheenInput;
  };

  export const XaheenCard: {
    new(): XaheenCard;
    prototype: XaheenCard;
  };

  export const ButtonElement: typeof XaheenButton;
  export const InputElement: typeof XaheenInput;
  export const CardElement: typeof XaheenCard;

  export const PlatformInfo: PlatformInfo;
  export function areComponentsRegistered(): boolean;
  export function registerComponents(): void;
}

// Augment global HTML element tag map
declare global {
  interface HTMLElementTagNameMap {
    'xaheen-button': XaheenButtonElement;
    'xaheen-input': XaheenInputElement;
    'xaheen-card': XaheenCardElement;
  }

  namespace JSX {
    interface IntrinsicElements {
      'xaheen-button': Partial<XaheenButtonElement> & {
        children?: any;
      };
      'xaheen-input': Partial<XaheenInputElement>;
      'xaheen-card': Partial<XaheenCardElement> & {
        children?: any;
      };
    }
  }
}

export {};