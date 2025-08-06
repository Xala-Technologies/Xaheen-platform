/**
 * Authentication-02 Block - Alternative Auth Design
 * WCAG AAA compliant with tabbed interface for login/register
 * Norwegian standards with BankID and enhanced security features
 */

import React, { useState, useCallback } from 'react';
import { cn } from '../../lib/utils';
import { Button } from '../../components/button/button';
import { Input } from '../../components/input/input';
import { Card, CardContent } from '../../components/card/card';

export interface AuthUser {
  readonly email: string;
  readonly password?: string;
  readonly firstName?: string;
  readonly lastName?: string;
  readonly phoneNumber?: string;
  readonly termsAccepted?: boolean;
  readonly marketingConsent?: boolean;
}

export interface AuthTexts {
  readonly loginTab: string;
  readonly registerTab: string;
  readonly welcomeBack: string;
  readonly welcomeNew: string;
  readonly loginSubtitle: string;
  readonly registerSubtitle: string;
  readonly emailLabel: string;
  readonly emailPlaceholder: string;
  readonly passwordLabel: string;
  readonly passwordPlaceholder: string;
  readonly confirmPasswordLabel: string;
  readonly confirmPasswordPlaceholder: string;
  readonly firstNameLabel: string;
  readonly firstNamePlaceholder: string;
  readonly lastNameLabel: string;
  readonly lastNamePlaceholder: string;
  readonly phoneLabel: string;
  readonly phonePlaceholder: string;
  readonly loginButton: string;
  readonly registerButton: string;
  readonly bankIdLoginButton: string;
  readonly bankIdRegisterButton: string;
  readonly termsLabel: string;
  readonly termsLinkText: string;
  readonly marketingLabel: string;
  readonly forgotPassword: string;
  readonly loadingLogin: string;
  readonly loadingRegister: string;
  readonly loadingBankId: string;
  readonly emailError: string;
  readonly passwordError: string;
  readonly confirmPasswordError: string;
  readonly nameError: string;
  readonly phoneError: string;
  readonly termsError: string;
  readonly successLogin: string;
  readonly successRegister: string;
  readonly successBankId: string;
}

export interface AuthState {
  readonly activeTab: 'login' | 'register';
  readonly email: string;
  readonly password: string;
  readonly confirmPassword: string;
  readonly firstName: string;
  readonly lastName: string;
  readonly phoneNumber: string;
  readonly termsAccepted: boolean;
  readonly marketingConsent: boolean;
  readonly loading: boolean;
  readonly bankIdLoading: boolean;
  readonly errors: Record<string, string>;
}

export interface AuthCallbacks {
  readonly onLogin: (user: AuthUser) => Promise<void>;
  readonly onRegister: (user: AuthUser) => Promise<void>;
  readonly onBankIdAuth: (mode: 'login' | 'register') => Promise<void>;
  readonly onForgotPassword?: (email: string) => void;
  readonly onTermsClick?: () => void;
  readonly onAnnounce?: (message: string) => void;
  readonly onTabChange?: (tab: 'login' | 'register') => void;
  readonly onStateChange?: (state: Partial<AuthState>) => void;
}

export interface Authentication02Props {
  readonly texts?: Partial<AuthTexts>;
  readonly callbacks: AuthCallbacks;
  readonly state?: Partial<AuthState>;
  readonly className?: string;
  readonly defaultTab?: 'login' | 'register';
  readonly showBankId?: boolean;
  readonly showPhoneField?: boolean;
  readonly showMarketingConsent?: boolean;
  readonly nsmClassification?: 'OPEN' | 'RESTRICTED' | 'CONFIDENTIAL' | 'SECRET';
  readonly requireTerms?: boolean;
}

const defaultTexts: AuthTexts = {
  loginTab: 'Logg inn',
  registerTab: 'Registrer',
  welcomeBack: 'Velkommen tilbake',
  welcomeNew: 'Opprett konto',
  loginSubtitle: 'Logg inn på din konto',
  registerSubtitle: 'Opprett en ny konto for å komme i gang',
  emailLabel: 'E-postadresse',
  emailPlaceholder: 'din@epost.no',
  passwordLabel: 'Passord',
  passwordPlaceholder: 'Minimum 8 tegn',
  confirmPasswordLabel: 'Bekreft passord',
  confirmPasswordPlaceholder: 'Gjenta passordet ditt',
  firstNameLabel: 'Fornavn',
  firstNamePlaceholder: 'Ditt fornavn',
  lastNameLabel: 'Etternavn',
  lastNamePlaceholder: 'Ditt etternavn',
  phoneLabel: 'Telefonnummer',
  phonePlaceholder: '+47 123 45 678',
  loginButton: 'Logg inn',
  registerButton: 'Opprett konto',
  bankIdLoginButton: 'BankID innlogging',
  bankIdRegisterButton: 'Registrer med BankID',
  termsLabel: 'Jeg aksepterer',
  termsLinkText: 'vilkår og betingelser',
  marketingLabel: 'Jeg ønsker å motta markedsføringsinformasjon',
  forgotPassword: 'Glemt passord?',
  loadingLogin: 'Logger inn...',
  loadingRegister: 'Oppretter konto...',
  loadingBankId: 'Kobler til BankID...',
  emailError: 'Ugyldig e-postadresse',
  passwordError: 'Passord må være minst 8 tegn',
  confirmPasswordError: 'Passordene stemmer ikke overens',
  nameError: 'Dette feltet er påkrevd',
  phoneError: 'Ugyldig telefonnummer',
  termsError: 'Du må akseptere vilkårene',
  successLogin: 'Innlogging vellykket',
  successRegister: 'Konto opprettet',
  successBankId: 'BankID autentisering vellykket'
};

const defaultState: AuthState = {
  activeTab: 'login',
  email: '',
  password: '',
  confirmPassword: '',
  firstName: '',
  lastName: '',
  phoneNumber: '',
  termsAccepted: false,
  marketingConsent: false,
  loading: false,
  bankIdLoading: false,
  errors: {}
};

export const Authentication02: React.FC<Authentication02Props> = ({
  texts = {},
  callbacks,
  state = {},
  className,
  defaultTab = 'login',
  showBankId = true,
  showPhoneField = true,
  showMarketingConsent = true,
  nsmClassification,
  requireTerms = true
}) => {
  const t = { ...defaultTexts, ...texts };
  const currentState = { ...defaultState, activeTab: defaultTab, ...state };
  
  const {
    activeTab,
    email,
    password,
    confirmPassword,
    firstName,
    lastName,
    phoneNumber,
    termsAccepted,
    marketingConsent,
    loading,
    bankIdLoading,
    errors
  } = currentState;

  const announce = useCallback((message: string) => {
    callbacks.onAnnounce?.(message);
  }, [callbacks]);

  // Update state helper
  const updateState = useCallback((updates: Partial<AuthState>) => {
    callbacks.onStateChange?.(updates);
  }, [callbacks]);

  // Validation functions
  const validateEmail = (value: string): string | undefined => {
    if (!value) return t.emailError;
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)) return t.emailError;
    return undefined;
  };

  const validatePassword = (value: string): string | undefined => {
    if (!value || value.length < 8) return t.passwordError;
    return undefined;
  };

  const validateConfirmPassword = (value: string): string | undefined => {
    if (value !== password) return t.confirmPasswordError;
    return undefined;
  };

  const validateRequired = (value: string): string | undefined => {
    if (!value.trim()) return t.nameError;
    return undefined;
  };

  const validatePhone = (value: string): string | undefined => {
    if (!value) return undefined; // Optional field
    if (!/^(\+47)?[\s]?[2-9]\d{7}$/.test(value)) return t.phoneError;
    return undefined;
  };

  // Event handlers
  const handleTabChange = useCallback((tab: 'login' | 'register') => {
    updateState({ activeTab: tab, errors: {} });
    callbacks.onTabChange?.(tab);
    announce(`Switched to ${tab === 'login' ? 'login' : 'registration'} form`);
  }, [updateState, callbacks, announce]);

  const handleInputChange = useCallback((field: keyof AuthState, value: any) => {
    updateState({ [field]: value });
    // Clear field error when user starts typing
    if (errors[field]) {
      const newErrors = { ...errors };
      delete newErrors[field];
      updateState({ errors: newErrors });
    }
  }, [updateState, errors]);

  const handleSubmit = useCallback(async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (loading || bankIdLoading) return;

    const validationErrors: Record<string, string> = {};

    // Common validations
    const emailError = validateEmail(email);
    if (emailError) validationErrors.email = emailError;

    const passwordError = validatePassword(password);
    if (passwordError) validationErrors.password = passwordError;

    if (activeTab === 'register') {
      // Registration-specific validations
      const confirmPasswordError = validateConfirmPassword(confirmPassword);
      if (confirmPasswordError) validationErrors.confirmPassword = confirmPasswordError;

      const firstNameError = validateRequired(firstName);
      if (firstNameError) validationErrors.firstName = firstNameError;

      const lastNameError = validateRequired(lastName);
      if (lastNameError) validationErrors.lastName = lastNameError;

      if (showPhoneField) {
        const phoneError = validatePhone(phoneNumber);
        if (phoneError) validationErrors.phoneNumber = phoneError;
      }

      if (requireTerms && !termsAccepted) {
        validationErrors.terms = t.termsError;
      }
    }

    if (Object.keys(validationErrors).length > 0) {
      updateState({ errors: validationErrors });
      announce(`Validation errors found`);
      return;
    }

    try {
      updateState({ loading: true });
      
      if (activeTab === 'login') {
        await callbacks.onLogin({ email, password });
        announce(t.successLogin);
      } else {
        await callbacks.onRegister({
          email,
          password,
          firstName,
          lastName,
          phoneNumber: showPhoneField ? phoneNumber : undefined,
          termsAccepted,
          marketingConsent: showMarketingConsent ? marketingConsent : false
        });
        announce(t.successRegister);
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Operation failed';
      updateState({ errors: { general: errorMessage } });
      announce(`Error: ${errorMessage}`);
    } finally {
      updateState({ loading: false });
    }
  }, [
    activeTab, email, password, confirmPassword, firstName, lastName, 
    phoneNumber, termsAccepted, marketingConsent, loading, bankIdLoading,
    showPhoneField, showMarketingConsent, requireTerms,
    callbacks, updateState, announce, t
  ]);

  const handleBankIdAuth = useCallback(async () => {
    if (loading || bankIdLoading) return;

    try {
      updateState({ bankIdLoading: true });
      await callbacks.onBankIdAuth(activeTab);
      announce(t.successBankId);
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'BankID authentication failed';
      updateState({ errors: { general: errorMessage } });
      announce(`BankID error: ${errorMessage}`);
    } finally {
      updateState({ bankIdLoading: false });
    }
  }, [activeTab, loading, bankIdLoading, callbacks, updateState, announce, t]);

  return (
    <div className={cn('w-full max-w-lg mx-auto', className)}>
      <Card
        variant="elevated"
        nsmClassification={nsmClassification}
        className="overflow-hidden"
      >
        {/* Tab Navigation */}
        <div className="flex border-b border-border">
          <button
            onClick={() => handleTabChange('login')}
            disabled={loading || bankIdLoading}
            className={cn(
              'flex-1 px-6 py-4 text-lg font-medium transition-all duration-200',
              'focus:outline-none focus:ring-2 focus:ring-primary/20 focus:ring-inset',
              'disabled:opacity-50 disabled:cursor-not-allowed',
              activeTab === 'login' 
                ? 'bg-primary/5 text-primary border-b-2 border-b-primary' 
                : 'text-muted-foreground hover:text-foreground hover:bg-accent/50'
            )}
            role="tab"
            aria-selected={activeTab === 'login'}
          >
            {t.loginTab}
          </button>
          <button
            onClick={() => handleTabChange('register')}
            disabled={loading || bankIdLoading}
            className={cn(
              'flex-1 px-6 py-4 text-lg font-medium transition-all duration-200',
              'focus:outline-none focus:ring-2 focus:ring-primary/20 focus:ring-inset',
              'disabled:opacity-50 disabled:cursor-not-allowed',
              activeTab === 'register' 
                ? 'bg-primary/5 text-primary border-b-2 border-b-primary' 
                : 'text-muted-foreground hover:text-foreground hover:bg-accent/50'
            )}
            role="tab"
            aria-selected={activeTab === 'register'}
          >
            {t.registerTab}
          </button>
        </div>

        <CardContent className="p-8">
          {/* Tab Content */}
          <div role="tabpanel" aria-labelledby={`${activeTab}-tab`}>
            {/* Header */}
            <div className="text-center mb-8">
              <h1 className="text-3xl font-bold tracking-tight mb-2">
                {activeTab === 'login' ? t.welcomeBack : t.welcomeNew}
              </h1>
              <p className="text-muted-foreground">
                {activeTab === 'login' ? t.loginSubtitle : t.registerSubtitle}
              </p>
            </div>

            {/* General Error */}
            {errors.general && (
              <div
                role="alert"
                className="mb-6 p-4 rounded-lg bg-destructive/10 border border-destructive/20 text-destructive text-sm"
              >
                {errors.general}
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Registration-only fields */}
              {activeTab === 'register' && (
                <div className="grid grid-cols-2 gap-4">
                  {/* First Name */}
                  <div>
                    <label htmlFor="firstName" className="text-sm font-medium text-foreground block mb-2">
                      {t.firstNameLabel}
                    </label>
                    <Input
                      id="firstName"
                      name="firstName"
                      value={firstName}
                      onChange={(e) => handleInputChange('firstName', e.target.value)}
                      placeholder={t.firstNamePlaceholder}
                      error={!!errors.firstName}
                      helperText={errors.firstName}
                      disabled={loading || bankIdLoading}
                      required
                      autoComplete="given-name"
                    />
                  </div>

                  {/* Last Name */}
                  <div>
                    <label htmlFor="lastName" className="text-sm font-medium text-foreground block mb-2">
                      {t.lastNameLabel}
                    </label>
                    <Input
                      id="lastName"
                      name="lastName"
                      value={lastName}
                      onChange={(e) => handleInputChange('lastName', e.target.value)}
                      placeholder={t.lastNamePlaceholder}
                      error={!!errors.lastName}
                      helperText={errors.lastName}
                      disabled={loading || bankIdLoading}
                      required
                      autoComplete="family-name"
                    />
                  </div>
                </div>
              )}

              {/* Email */}
              <div>
                <label htmlFor="email" className="text-sm font-medium text-foreground block mb-2">
                  {t.emailLabel}
                </label>
                <Input
                  id="email"
                  name="email"
                  type="email"
                  value={email}
                  onChange={(e) => handleInputChange('email', e.target.value)}
                  placeholder={t.emailPlaceholder}
                  error={!!errors.email}
                  helperText={errors.email}
                  disabled={loading || bankIdLoading}
                  required
                  autoComplete="email"
                  leadingIcon={
                    <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 12a4 4 0 10-8 0 4 4 0 008 0zm0 0v1.5a2.5 2.5 0 005 0V12a9 9 0 10-9 9m4.5-1.206a8.959 8.959 0 01-4.5 1.207" />
                    </svg>
                  }
                />
              </div>

              {/* Phone Number (Registration only and if enabled) */}
              {activeTab === 'register' && showPhoneField && (
                <div>
                  <label htmlFor="phone" className="text-sm font-medium text-foreground block mb-2">
                    {t.phoneLabel}
                  </label>
                  <Input
                    id="phone"
                    name="phone"
                    type="tel"
                    value={phoneNumber}
                    onChange={(e) => handleInputChange('phoneNumber', e.target.value)}
                    placeholder={t.phonePlaceholder}
                    error={!!errors.phoneNumber}
                    helperText={errors.phoneNumber}
                    disabled={loading || bankIdLoading}
                    norwegianFormat="phone"
                    autoComplete="tel"
                    leadingIcon={
                      <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                      </svg>
                    }
                  />
                </div>
              )}

              {/* Password */}
              <div>
                <label htmlFor="password" className="text-sm font-medium text-foreground block mb-2">
                  {t.passwordLabel}
                </label>
                <Input
                  id="password"
                  name="password"
                  type="password"
                  value={password}
                  onChange={(e) => handleInputChange('password', e.target.value)}
                  placeholder={t.passwordPlaceholder}
                  error={!!errors.password}
                  helperText={errors.password}
                  disabled={loading || bankIdLoading}
                  required
                  autoComplete={activeTab === 'login' ? 'current-password' : 'new-password'}
                  leadingIcon={
                    <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                    </svg>
                  }
                />
              </div>

              {/* Confirm Password (Registration only) */}
              {activeTab === 'register' && (
                <div>
                  <label htmlFor="confirmPassword" className="text-sm font-medium text-foreground block mb-2">
                    {t.confirmPasswordLabel}
                  </label>
                  <Input
                    id="confirmPassword"
                    name="confirmPassword"
                    type="password"
                    value={confirmPassword}
                    onChange={(e) => handleInputChange('confirmPassword', e.target.value)}
                    placeholder={t.confirmPasswordPlaceholder}
                    error={!!errors.confirmPassword}
                    helperText={errors.confirmPassword}
                    disabled={loading || bankIdLoading}
                    required
                    autoComplete="new-password"
                    leadingIcon={
                      <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                      </svg>
                    }
                  />
                </div>
              )}

              {/* Terms and Marketing (Registration only) */}
              {activeTab === 'register' && (
                <div className="space-y-4">
                  {/* Terms Checkbox */}
                  {requireTerms && (
                    <div>
                      <div className="flex items-start">
                        <input
                          id="terms"
                          name="terms"
                          type="checkbox"
                          checked={termsAccepted}
                          onChange={(e) => handleInputChange('termsAccepted', e.target.checked)}
                          disabled={loading || bankIdLoading}
                          className="h-4 w-4 text-primary focus:ring-primary border-gray-300 rounded mt-1"
                        />
                        <label htmlFor="terms" className="ml-3 text-sm text-foreground">
                          {t.termsLabel}{' '}
                          <button
                            type="button"
                            onClick={callbacks.onTermsClick}
                            className="text-primary hover:text-primary/80 underline focus:outline-none focus:ring-2 focus:ring-primary/20 rounded"
                          >
                            {t.termsLinkText}
                          </button>
                        </label>
                      </div>
                      {errors.terms && (
                        <p className="mt-1 text-sm text-destructive">{errors.terms}</p>
                      )}
                    </div>
                  )}

                  {/* Marketing Checkbox */}
                  {showMarketingConsent && (
                    <div className="flex items-start">
                      <input
                        id="marketing"
                        name="marketing"
                        type="checkbox"
                        checked={marketingConsent}
                        onChange={(e) => handleInputChange('marketingConsent', e.target.checked)}
                        disabled={loading || bankIdLoading}
                        className="h-4 w-4 text-primary focus:ring-primary border-gray-300 rounded mt-1"
                      />
                      <label htmlFor="marketing" className="ml-3 text-sm text-muted-foreground">
                        {t.marketingLabel}
                      </label>
                    </div>
                  )}
                </div>
              )}

              {/* Submit Button */}
              <Button
                type="submit"
                fullWidth
                loading={loading}
                loadingText={activeTab === 'login' ? t.loadingLogin : t.loadingRegister}
                disabled={loading || bankIdLoading}
                size="lg"
                variant="primary"
                className="font-semibold"
              >
                {activeTab === 'login' ? t.loginButton : t.registerButton}
              </Button>

              {/* BankID Button */}
              {showBankId && (
                <Button
                  type="button"
                  fullWidth
                  variant="outline"
                  size="lg"
                  onClick={handleBankIdAuth}
                  loading={bankIdLoading}
                  loadingText={t.loadingBankId}
                  disabled={loading || bankIdLoading}
                  className="font-semibold"
                  leftIcon={
                    <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                    </svg>
                  }
                >
                  {activeTab === 'login' ? t.bankIdLoginButton : t.bankIdRegisterButton}
                </Button>
              )}

              {/* Forgot Password (Login only) */}
              {activeTab === 'login' && callbacks.onForgotPassword && (
                <div className="text-center">
                  <button
                    type="button"
                    onClick={() => callbacks.onForgotPassword?.(email)}
                    disabled={loading || bankIdLoading}
                    className="text-sm text-primary hover:text-primary/80 transition-colors focus:outline-none focus:ring-2 focus:ring-primary/20 rounded px-2 py-1"
                  >
                    {t.forgotPassword}
                  </button>
                </div>
              )}
            </form>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};