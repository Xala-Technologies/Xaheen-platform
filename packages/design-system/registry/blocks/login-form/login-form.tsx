/**
 * Login Form Block - Simplified Login Interface
 * WCAG AAA compliant with BankID integration and Norwegian standards
 * Focused on essential login functionality with professional styling
 */

import React, { useState, useCallback, useRef, useEffect } from 'react';
import { cn } from '../../lib/utils';
import { Button } from '../../components/button/button';
import { Input } from '../../components/input/input';
import { Card, CardContent, CardFooter, CardHeader } from '../../components/card/card';

export interface LoginCredentials {
  readonly email: string;
  readonly password: string;
  readonly rememberMe?: boolean;
}

export interface LoginFormTexts {
  readonly heading: string;
  readonly subheading: string;
  readonly emailLabel: string;
  readonly emailPlaceholder: string;
  readonly passwordLabel: string;
  readonly passwordPlaceholder: string;
  readonly rememberMeLabel: string;
  readonly loginButtonText: string;
  readonly bankIdButtonText: string;
  readonly forgotPasswordText: string;
  readonly loadingText: string;
  readonly bankIdLoadingText: string;
  readonly emailRequiredError: string;
  readonly emailInvalidError: string;
  readonly passwordRequiredError: string;
  readonly generalError: string;
  readonly successMessage: string;
  readonly bankIdSuccessMessage: string;
  readonly formDescription: string;
  readonly loginAttemptAnnouncement: string;
  readonly loginSuccessAnnouncement: string;
  readonly loginFailedAnnouncement: string;
}

export interface LoginFormState {
  readonly email: string;
  readonly password: string;
  readonly rememberMe: boolean;
  readonly loading: boolean;
  readonly bankIdLoading: boolean;
  readonly errors: {
    readonly email?: string;
    readonly password?: string;
    readonly general?: string;
  };
}

export interface LoginFormCallbacks {
  readonly onLogin: (credentials: LoginCredentials) => Promise<void>;
  readonly onBankIdLogin?: () => Promise<void>;
  readonly onForgotPassword?: (email: string) => void;
  readonly onAnnounce?: (message: string) => void;
  readonly onStateChange?: (state: Partial<LoginFormState>) => void;
  readonly onFieldChange?: (field: keyof LoginFormState, value: any) => void;
  readonly onValidationError?: (errors: LoginFormState['errors']) => void;
}

export interface LoginFormProps {
  readonly texts?: Partial<LoginFormTexts>;
  readonly callbacks: LoginFormCallbacks;
  readonly state?: Partial<LoginFormState>;
  readonly className?: string;
  readonly showBankId?: boolean;
  readonly showRememberMe?: boolean;
  readonly showForgotPassword?: boolean;
  readonly autoFocus?: boolean;
  readonly validateOnBlur?: boolean;
  readonly nsmClassification?: 'OPEN' | 'RESTRICTED' | 'CONFIDENTIAL' | 'SECRET';
  readonly companyLogo?: React.ReactNode;
  readonly companyName?: string;
}

const defaultTexts: LoginFormTexts = {
  heading: 'Velkommen tilbake',
  subheading: 'Logg inn på din konto for å fortsette',
  emailLabel: 'E-postadresse',
  emailPlaceholder: 'din@epost.no',
  passwordLabel: 'Passord',
  passwordPlaceholder: 'Skriv inn ditt passord',
  rememberMeLabel: 'Husk meg på denne enheten',
  loginButtonText: 'Logg inn',
  bankIdButtonText: 'Logg inn med BankID',
  forgotPasswordText: 'Glemt passord?',
  loadingText: 'Logger inn...',
  bankIdLoadingText: 'Kobler til BankID...',
  emailRequiredError: 'E-postadresse er påkrevd',
  emailInvalidError: 'Ugyldig e-postadresse',
  passwordRequiredError: 'Passord er påkrevd',
  generalError: 'Innlogging feilet. Sjekk dine legitimasjoner.',
  successMessage: 'Innlogging vellykket!',
  bankIdSuccessMessage: 'BankID innlogging vellykket!',
  formDescription: 'Logg inn med dine legitimasjoner eller bruk BankID for sikker autentisering',
  loginAttemptAnnouncement: 'Forsøker å logge inn',
  loginSuccessAnnouncement: 'Innlogging vellykket',
  loginFailedAnnouncement: 'Innlogging feilet'
};

const defaultState: LoginFormState = {
  email: '',
  password: '',
  rememberMe: false,
  loading: false,
  bankIdLoading: false,
  errors: {}
};

export const LoginForm: React.FC<LoginFormProps> = ({
  texts = {},
  callbacks,
  state = {},
  className,
  showBankId = true,
  showRememberMe = true,
  showForgotPassword = true,
  autoFocus = true,
  validateOnBlur = true,
  nsmClassification,
  companyLogo,
  companyName
}) => {
  const t = { ...defaultTexts, ...texts };
  const currentState = { ...defaultState, ...state };
  
  const {
    email,
    password,
    rememberMe,
    loading,
    bankIdLoading,
    errors
  } = currentState;

  const emailRef = useRef<HTMLInputElement>(null);
  const passwordRef = useRef<HTMLInputElement>(null);

  // Auto-focus email field
  useEffect(() => {
    if (autoFocus && emailRef.current) {
      emailRef.current.focus();
    }
  }, [autoFocus]);

  // Update state helper
  const updateState = useCallback((updates: Partial<LoginFormState>) => {
    callbacks.onStateChange?.(updates);
  }, [callbacks]);

  const announce = useCallback((message: string) => {
    callbacks.onAnnounce?.(message);
  }, [callbacks]);

  // Validation functions
  const validateEmail = (emailValue: string): string | undefined => {
    if (!emailValue.trim()) {
      return t.emailRequiredError;
    }
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(emailValue)) {
      return t.emailInvalidError;
    }
    return undefined;
  };

  const validatePassword = (passwordValue: string): string | undefined => {
    if (!passwordValue.trim()) {
      return t.passwordRequiredError;
    }
    return undefined;
  };

  const validateForm = (): LoginFormState['errors'] => {
    return {
      ...(validateEmail(email) && { email: validateEmail(email) }),
      ...(validatePassword(password) && { password: validatePassword(password) })
    };
  };

  // Event handlers
  const handleFieldChange = useCallback((field: keyof LoginFormState, value: any) => {
    callbacks.onFieldChange?.(field, value);
    updateState({ [field]: value });
    
    // Clear field-specific errors when user starts typing
    if (errors[field as keyof typeof errors]) {
      const newErrors = { ...errors };
      delete newErrors[field as keyof typeof errors];
      updateState({ errors: newErrors });
    }
  }, [callbacks, updateState, errors]);

  const handleEmailChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    handleFieldChange('email', e.target.value);
  }, [handleFieldChange]);

  const handlePasswordChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    handleFieldChange('password', e.target.value);
  }, [handleFieldChange]);

  const handleRememberMeChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    handleFieldChange('rememberMe', e.target.checked);
  }, [handleFieldChange]);

  const handleEmailBlur = useCallback(() => {
    if (validateOnBlur && email) {
      const emailError = validateEmail(email);
      if (emailError) {
        const newErrors = { ...errors, email: emailError };
        updateState({ errors: newErrors });
        callbacks.onValidationError?.(newErrors);
      }
    }
  }, [validateOnBlur, email, errors, updateState, callbacks]);

  const handlePasswordBlur = useCallback(() => {
    if (validateOnBlur && password) {
      const passwordError = validatePassword(password);
      if (passwordError) {
        const newErrors = { ...errors, password: passwordError };
        updateState({ errors: newErrors });
        callbacks.onValidationError?.(newErrors);
      }
    }
  }, [validateOnBlur, password, errors, updateState, callbacks]);

  const handleSubmit = useCallback(async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    
    if (loading || bankIdLoading) return;

    // Validate form
    const validationErrors = validateForm();
    if (Object.keys(validationErrors).length > 0) {
      updateState({ errors: validationErrors });
      callbacks.onValidationError?.(validationErrors);
      announce(`${t.loginFailedAnnouncement}: ${Object.values(validationErrors).join(', ')}`);
      
      // Focus first field with error
      if (validationErrors.email && emailRef.current) {
        emailRef.current.focus();
      } else if (validationErrors.password && passwordRef.current) {
        passwordRef.current.focus();
      }
      return;
    }

    try {
      updateState({ loading: true, errors: {} });
      announce(t.loginAttemptAnnouncement);

      await callbacks.onLogin({
        email: email.trim(),
        password,
        rememberMe
      });

      announce(t.loginSuccessAnnouncement);
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : t.generalError;
      const newErrors = { general: errorMessage };
      updateState({ errors: newErrors });
      callbacks.onValidationError?.(newErrors);
      announce(`${t.loginFailedAnnouncement}: ${errorMessage}`);
    } finally {
      updateState({ loading: false });
    }
  }, [
    email, password, rememberMe, loading, bankIdLoading,
    callbacks, updateState, announce, t, validateForm
  ]);

  const handleBankIdLogin = useCallback(async () => {
    if (loading || bankIdLoading || !callbacks.onBankIdLogin) return;

    try {
      updateState({ bankIdLoading: true, errors: {} });
      announce('Starter BankID autentisering');

      await callbacks.onBankIdLogin();
      announce(t.bankIdSuccessMessage);
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'BankID innlogging feilet';
      const newErrors = { general: errorMessage };
      updateState({ errors: newErrors });
      callbacks.onValidationError?.(newErrors);
      announce(`BankID feil: ${errorMessage}`);
    } finally {
      updateState({ bankIdLoading: false });
    }
  }, [loading, bankIdLoading, callbacks, updateState, announce, t]);

  const handleForgotPassword = useCallback(() => {
    if (callbacks.onForgotPassword) {
      callbacks.onForgotPassword(email);
      announce('Navigerer til glemt passord');
    }
  }, [callbacks, email, announce]);

  const handleKeyDown = useCallback((e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && e.currentTarget === emailRef.current) {
      e.preventDefault();
      passwordRef.current?.focus();
    }
  }, []);

  return (
    <div className={cn('w-full max-w-md mx-auto', className)}>
      <Card
        variant="elevated"
        nsmClassification={nsmClassification}
        className="overflow-hidden"
      >
        <CardHeader className="text-center pb-6">
          {/* Company Logo */}
          {companyLogo && (
            <div className="flex justify-center mb-4">
              {companyLogo}
            </div>
          )}
          
          <div className="space-y-2">
            <h1 className="text-2xl font-bold tracking-tight">
              {t.heading}
            </h1>
            <p className="text-muted-foreground">
              {t.subheading}
            </p>
          </div>
        </CardHeader>

        <CardContent>
          {/* General Error Alert */}
          {errors.general && (
            <div
              role="alert"
              aria-live="polite"
              className="mb-6 p-4 rounded-lg bg-destructive/10 border border-destructive/20 text-destructive text-sm font-medium"
            >
              {errors.general}
            </div>
          )}

          {/* Login Form */}
          <form 
            onSubmit={handleSubmit} 
            className="space-y-6"
            noValidate
            aria-describedby="form-description"
          >
            <p id="form-description" className="sr-only">
              {t.formDescription}
            </p>

            {/* Email Field */}
            <div className="space-y-2">
              <label
                htmlFor="login-email"
                className="text-sm font-medium text-foreground block"
              >
                {t.emailLabel}
              </label>
              <Input
                ref={emailRef}
                id="login-email"
                name="email"
                type="email"
                value={email}
                onChange={handleEmailChange}
                onBlur={handleEmailBlur}
                onKeyDown={handleKeyDown}
                placeholder={t.emailPlaceholder}
                error={!!errors.email}
                helperText={errors.email}
                disabled={loading || bankIdLoading}
                required
                autoComplete="email"
                norwegianFormat="phone" // Support for Norwegian phone number format as email alternative
                size="lg"
                leadingIcon={
                  <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 12a4 4 0 10-8 0 4 4 0 008 0zm0 0v1.5a2.5 2.5 0 005 0V12a9 9 0 10-9 9m4.5-1.206a8.959 8.959 0 01-4.5 1.207" />
                  </svg>
                }
              />
            </div>

            {/* Password Field */}
            <div className="space-y-2">
              <label
                htmlFor="login-password"
                className="text-sm font-medium text-foreground block"
              >
                {t.passwordLabel}
              </label>
              <Input
                ref={passwordRef}
                id="login-password"
                name="password"
                type="password"
                value={password}
                onChange={handlePasswordChange}
                onBlur={handlePasswordBlur}
                placeholder={t.passwordPlaceholder}
                error={!!errors.password}
                helperText={errors.password}
                disabled={loading || bankIdLoading}
                required
                autoComplete="current-password"
                size="lg"
                leadingIcon={
                  <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                  </svg>
                }
              />
            </div>

            {/* Remember Me Checkbox */}
            {showRememberMe && (
              <div className="flex items-center">
                <input
                  id="login-remember"
                  name="remember-me"
                  type="checkbox"
                  checked={rememberMe}
                  onChange={handleRememberMeChange}
                  disabled={loading || bankIdLoading}
                  className="h-4 w-4 text-primary focus:ring-primary border-gray-300 rounded"
                />
                <label 
                  htmlFor="login-remember" 
                  className="ml-3 text-sm text-foreground select-none"
                >
                  {t.rememberMeLabel}
                </label>
              </div>
            )}

            {/* Login Button */}
            <Button
              type="submit"
              fullWidth
              loading={loading}
              loadingText={t.loadingText}
              disabled={loading || bankIdLoading}
              size="lg"
              variant="primary"
              className="font-semibold"
            >
              {t.loginButtonText}
            </Button>
          </form>

          {/* BankID Login */}
          {showBankId && callbacks.onBankIdLogin && (
            <div className="mt-6">
              {/* Divider */}
              <div className="relative my-6">
                <div className="absolute inset-0 flex items-center">
                  <span className="w-full border-t border-border" />
                </div>
                <div className="relative flex justify-center text-sm">
                  <span className="bg-card px-4 text-muted-foreground font-medium">eller</span>
                </div>
              </div>

              {/* BankID Button */}
              <Button
                type="button"
                fullWidth
                variant="outline"
                size="lg"
                onClick={handleBankIdLogin}
                loading={bankIdLoading}
                loadingText={t.bankIdLoadingText}
                disabled={loading || bankIdLoading}
                className="font-semibold border-2"
                leftIcon={
                  <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                  </svg>
                }
              >
                {t.bankIdButtonText}
              </Button>
            </div>
          )}
        </CardContent>

        {/* Footer with Forgot Password */}
        {showForgotPassword && callbacks.onForgotPassword && (
          <CardFooter className="justify-center">
            <button
              type="button"
              onClick={handleForgotPassword}
              disabled={loading || bankIdLoading}
              className="text-sm text-primary hover:text-primary/80 transition-colors focus:outline-none focus:ring-2 focus:ring-primary/20 rounded px-3 py-2 font-medium disabled:opacity-50"
            >
              {t.forgotPasswordText}
            </button>
          </CardFooter>
        )}
      </Card>

      {/* Company Name Footer */}
      {companyName && (
        <div className="text-center mt-6">
          <p className="text-sm text-muted-foreground">
            © 2024 {companyName}
          </p>
        </div>
      )}
    </div>
  );
};