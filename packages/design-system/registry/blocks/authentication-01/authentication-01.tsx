/**
 * Authentication-01 Block - Modern Login Form
 * WCAG AAA compliant with BankID integration and Norwegian standards
 * Professional spacing and accessibility features
 */

import React, { useState, useCallback } from 'react';
import { cn } from '../../lib/utils';
import { Button } from '../../components/button/button';
import { Input } from '../../components/input/input';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '../../components/card/card';

export interface AuthenticationUser {
  readonly email: string;
  readonly password?: string;
  readonly rememberMe?: boolean;
  readonly bankIdSession?: string;
}

export interface AuthenticationTexts {
  readonly title: string;
  readonly subtitle: string;
  readonly emailLabel: string;
  readonly emailPlaceholder: string;
  readonly passwordLabel: string;
  readonly passwordPlaceholder: string;
  readonly rememberMeLabel: string;
  readonly loginButton: string;
  readonly bankIdButton: string;
  readonly forgotPasswordLink: string;
  readonly signUpLink: string;
  readonly signUpPrompt: string;
  readonly loginWithBankId: string;
  readonly orSeparator: string;
  readonly loadingText: string;
  readonly bankIdLoadingText: string;
  readonly emailValidationError: string;
  readonly passwordValidationError: string;
  readonly loginSuccessMessage: string;
  readonly bankIdSuccessMessage: string;
}

export interface AuthenticationState {
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

export interface AuthenticationCallbacks {
  readonly onLogin: (user: AuthenticationUser) => Promise<void>;
  readonly onBankIdLogin?: () => Promise<void>;
  readonly onForgotPassword?: (email: string) => void;
  readonly onSignUp?: () => void;
  readonly onAnnounce?: (message: string) => void;
  readonly onEmailChange?: (email: string) => void;
  readonly onPasswordChange?: (password: string) => void;
  readonly onRememberMeChange?: (rememberMe: boolean) => void;
  readonly onLoadingChange?: (loading: boolean) => void;
  readonly onErrorsChange?: (errors: AuthenticationState['errors']) => void;
}

export interface Authentication01Props {
  readonly texts?: Partial<AuthenticationTexts>;
  readonly callbacks: AuthenticationCallbacks;
  readonly state?: Partial<AuthenticationState>;
  readonly className?: string;
  readonly showBankId?: boolean;
  readonly showRememberMe?: boolean;
  readonly showSignUpLink?: boolean;
  readonly enableEmailValidation?: boolean;
  readonly nsmClassification?: 'OPEN' | 'RESTRICTED' | 'CONFIDENTIAL' | 'SECRET';
}

const defaultTexts: AuthenticationTexts = {
  title: 'Logg inn',
  subtitle: 'Skriv inn din e-post og passord for å logge inn',
  emailLabel: 'E-postadresse',
  emailPlaceholder: 'din@epost.no',
  passwordLabel: 'Passord',
  passwordPlaceholder: 'Skriv inn ditt passord',
  rememberMeLabel: 'Husk meg',
  loginButton: 'Logg inn',
  bankIdButton: 'Logg inn med BankID',
  forgotPasswordLink: 'Glemt passord?',
  signUpLink: 'Opprett konto',
  signUpPrompt: 'Har du ikke konto?',
  loginWithBankId: 'eller logg inn med',
  orSeparator: 'eller',
  loadingText: 'Logger inn...',
  bankIdLoadingText: 'Kobler til BankID...',
  emailValidationError: 'Skriv inn en gyldig e-postadresse',
  passwordValidationError: 'Passord må være minst 8 tegn',
  loginSuccessMessage: 'Innlogging vellykket',
  bankIdSuccessMessage: 'BankID innlogging vellykket'
};

const defaultState: AuthenticationState = {
  email: '',
  password: '',
  rememberMe: false,
  loading: false,
  bankIdLoading: false,
  errors: {}
};

export const Authentication01: React.FC<Authentication01Props> = ({
  texts = {},
  callbacks,
  state = {},
  className,
  showBankId = true,
  showRememberMe = true,
  showSignUpLink = true,
  enableEmailValidation = true,
  nsmClassification
}) => {
  // Merge with default texts and state
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

  const announce = useCallback((message: string) => {
    callbacks.onAnnounce?.(message);
  }, [callbacks]);

  // Validation functions
  const validateEmail = (emailValue: string): string | undefined => {
    if (!emailValue) return t.emailValidationError;
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(emailValue)) return t.emailValidationError;
    return undefined;
  };

  const validatePassword = (passwordValue: string): string | undefined => {
    if (!passwordValue) return t.passwordValidationError;
    if (passwordValue.length < 8) return t.passwordValidationError;
    return undefined;
  };

  // Event handlers
  const handleEmailChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const newEmail = e.target.value;
    callbacks.onEmailChange?.(newEmail);
    
    // Clear email error when user starts typing
    if (errors.email) {
      const newErrors = { ...errors };
      delete newErrors.email;
      callbacks.onErrorsChange?.(newErrors);
    }
  }, [callbacks, errors]);

  const handlePasswordChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const newPassword = e.target.value;
    callbacks.onPasswordChange?.(newPassword);
    
    // Clear password error when user starts typing
    if (errors.password) {
      const newErrors = { ...errors };
      delete newErrors.password;
      callbacks.onErrorsChange?.(newErrors);
    }
  }, [callbacks, errors]);

  const handleRememberMeChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const checked = e.target.checked;
    callbacks.onRememberMeChange?.(checked);
  }, [callbacks]);

  const handleSubmit = useCallback(async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (loading || bankIdLoading) return;

    // Validation
    const emailError = enableEmailValidation ? validateEmail(email) : undefined;
    const passwordError = validatePassword(password);
    
    const validationErrors = {
      ...(emailError && { email: emailError }),
      ...(passwordError && { password: passwordError })
    };

    if (Object.keys(validationErrors).length > 0) {
      callbacks.onErrorsChange?.(validationErrors);
      announce(`Validation errors: ${Object.values(validationErrors).join(', ')}`);
      return;
    }

    try {
      callbacks.onLoadingChange?.(true);
      await callbacks.onLogin({
        email,
        password,
        rememberMe
      });
      announce(t.loginSuccessMessage);
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Login failed';
      callbacks.onErrorsChange?.({ general: errorMessage });
      announce(`Login error: ${errorMessage}`);
    } finally {
      callbacks.onLoadingChange?.(false);
    }
  }, [email, password, rememberMe, loading, bankIdLoading, enableEmailValidation, callbacks, announce, t]);

  const handleBankIdLogin = useCallback(async () => {
    if (loading || bankIdLoading || !callbacks.onBankIdLogin) return;

    try {
      callbacks.onLoadingChange?.(true);
      await callbacks.onBankIdLogin();
      announce(t.bankIdSuccessMessage);
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'BankID login failed';
      callbacks.onErrorsChange?.({ general: errorMessage });
      announce(`BankID error: ${errorMessage}`);
    } finally {
      callbacks.onLoadingChange?.(false);
    }
  }, [loading, bankIdLoading, callbacks, announce, t]);

  const handleForgotPassword = useCallback(() => {
    callbacks.onForgotPassword?.(email);
  }, [callbacks, email]);

  return (
    <div className={cn('w-full max-w-md mx-auto', className)}>
      <Card
        variant="elevated"
        nsmClassification={nsmClassification}
        className="backdrop-blur-sm"
      >
        <CardHeader className="text-center">
          <CardTitle className="text-3xl font-bold tracking-tight">
            {t.title}
          </CardTitle>
          <CardDescription className="text-lg">
            {t.subtitle}
          </CardDescription>
        </CardHeader>

        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* General Error */}
            {errors.general && (
              <div
                role="alert"
                className="p-4 rounded-lg bg-destructive/10 border border-destructive/20 text-destructive text-sm"
              >
                {errors.general}
              </div>
            )}

            {/* Email Field */}
            <div className="space-y-2">
              <label
                htmlFor="auth-email"
                className="text-sm font-medium text-foreground"
              >
                {t.emailLabel}
              </label>
              <Input
                id="auth-email"
                name="email"
                type="email"
                value={email}
                onChange={handleEmailChange}
                placeholder={t.emailPlaceholder}
                error={!!errors.email}
                helperText={errors.email}
                disabled={loading || bankIdLoading}
                required
                autoComplete="email"
                norwegianFormat="phone"
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
                htmlFor="auth-password"
                className="text-sm font-medium text-foreground"
              >
                {t.passwordLabel}
              </label>
              <Input
                id="auth-password"
                name="password"
                type="password"
                value={password}
                onChange={handlePasswordChange}
                placeholder={t.passwordPlaceholder}
                error={!!errors.password}
                helperText={errors.password}
                disabled={loading || bankIdLoading}
                required
                autoComplete="current-password"
                leadingIcon={
                  <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                  </svg>
                }
              />
            </div>

            {/* Remember Me */}
            {showRememberMe && (
              <div className="flex items-center">
                <input
                  id="auth-remember"
                  name="remember-me"
                  type="checkbox"
                  checked={rememberMe}
                  onChange={handleRememberMeChange}
                  disabled={loading || bankIdLoading}
                  className="h-4 w-4 text-primary focus:ring-primary border-gray-300 rounded"
                />
                <label htmlFor="auth-remember" className="ml-3 text-sm text-foreground">
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
              {t.loginButton}
            </Button>
          </form>

          {/* BankID Login */}
          {showBankId && callbacks.onBankIdLogin && (
            <div className="mt-6">
              <div className="relative">
                <div className="absolute inset-0 flex items-center">
                  <span className="w-full border-t border-border" />
                </div>
                <div className="relative flex justify-center text-sm">
                  <span className="bg-card px-4 text-muted-foreground">{t.orSeparator}</span>
                </div>
              </div>

              <Button
                type="button"
                fullWidth
                variant="outline"
                size="lg"
                onClick={handleBankIdLogin}
                loading={bankIdLoading}
                loadingText={t.bankIdLoadingText}
                disabled={loading || bankIdLoading}
                className="mt-4 font-semibold"
                leftIcon={
                  <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                  </svg>
                }
              >
                {t.bankIdButton}
              </Button>
            </div>
          )}
        </CardContent>

        <CardFooter className="flex flex-col space-y-4">
          {/* Forgot Password Link */}
          <button
            type="button"
            onClick={handleForgotPassword}
            disabled={loading || bankIdLoading}
            className="text-sm text-primary hover:text-primary/80 transition-colors focus:outline-none focus:ring-2 focus:ring-primary/20 rounded px-2 py-1"
          >
            {t.forgotPasswordLink}
          </button>

          {/* Sign Up Link */}
          {showSignUpLink && callbacks.onSignUp && (
            <div className="text-center text-sm">
              <span className="text-muted-foreground">{t.signUpPrompt} </span>
              <button
                type="button"
                onClick={callbacks.onSignUp}
                disabled={loading || bankIdLoading}
                className="text-primary hover:text-primary/80 transition-colors focus:outline-none focus:ring-2 focus:ring-primary/20 rounded px-2 py-1 font-medium"
              >
                {t.signUpLink}
              </button>
            </div>
          )}
        </CardFooter>
      </Card>
    </div>
  );
};