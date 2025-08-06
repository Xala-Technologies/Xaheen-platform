/**
 * Profile-01 Block - User Profile Display
 * WCAG AAA compliant with comprehensive user information display
 * Norwegian standards with BankID verification and security features
 */

import React, { useState, useCallback } from 'react';
import { cn } from '../../lib/utils';
import { Button } from '../../components/button/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../../components/card/card';

export interface UserProfile {
  readonly id: string;
  readonly firstName: string;
  readonly lastName: string;
  readonly email: string;
  readonly phoneNumber?: string;
  readonly avatar?: string;
  readonly title?: string;
  readonly department?: string;
  readonly organization?: string;
  readonly location?: string;
  readonly bio?: string;
  readonly dateOfBirth?: Date;
  readonly nationalId?: string;
  readonly bankIdVerified?: boolean;
  readonly lastLogin?: Date;
  readonly accountCreated: Date;
  readonly status: 'active' | 'inactive' | 'suspended' | 'pending';
  readonly permissions?: string[];
  readonly preferences?: {
    readonly language?: 'nb' | 'nn' | 'en';
    readonly timezone?: string;
    readonly theme?: 'light' | 'dark' | 'auto';
    readonly notifications?: boolean;
  };
  readonly nsmClassification?: 'OPEN' | 'RESTRICTED' | 'CONFIDENTIAL' | 'SECRET';
}

export interface ProfileTexts {
  readonly profileTitle: string;
  readonly personalInformation: string;
  readonly workInformation: string;
  readonly accountDetails: string;
  readonly securityDetails: string;
  readonly preferences: string;
  readonly editProfile: string;
  readonly changePassword: string;
  readonly verifyBankId: string;
  readonly downloadData: string;
  readonly deactivateAccount: string;
  readonly firstNameLabel: string;
  readonly lastNameLabel: string;
  readonly emailLabel: string;
  readonly phoneLabel: string;
  readonly titleLabel: string;
  readonly departmentLabel: string;
  readonly organizationLabel: string;
  readonly locationLabel: string;
  readonly bioLabel: string;
  readonly dateOfBirthLabel: string;
  readonly nationalIdLabel: string;
  readonly bankIdStatusLabel: string;
  readonly lastLoginLabel: string;
  readonly accountCreatedLabel: string;
  readonly statusLabel: string;
  readonly permissionsLabel: string;
  readonly languageLabel: string;
  readonly timezoneLabel: string;
  readonly themeLabel: string;
  readonly notificationsLabel: string;
  readonly verified: string;
  readonly notVerified: string;
  readonly active: string;
  readonly inactive: string;
  readonly suspended: string;
  readonly pending: string;
  readonly never: string;
  readonly yes: string;
  readonly no: string;
  readonly light: string;
  readonly dark: string;
  readonly auto: string;
  readonly loading: string;
  readonly profileUpdated: string;
  readonly bankIdVerificationStarted: string;
  readonly dataDownloadStarted: string;
  readonly missingInformation: string;
}

export interface ProfileState {
  readonly loading: boolean;
  readonly editing: boolean;
  readonly verifyingBankId: boolean;
  readonly downloadingData: boolean;
  readonly errors: Record<string, string>;
}

export interface ProfileCallbacks {
  readonly onEdit?: () => void;
  readonly onChangePassword?: () => void;
  readonly onVerifyBankId?: () => Promise<void>;
  readonly onDownloadData?: () => Promise<void>;
  readonly onDeactivateAccount?: () => void;
  readonly onAnnounce?: (message: string) => void;
  readonly onUpdatePreferences?: (preferences: UserProfile['preferences']) => Promise<void>;
  readonly onStateChange?: (state: Partial<ProfileState>) => void;
}

export interface Profile01Props {
  readonly profile: UserProfile;
  readonly texts?: Partial<ProfileTexts>;
  readonly callbacks?: ProfileCallbacks;
  readonly state?: Partial<ProfileState>;
  readonly className?: string;
  readonly showPersonalSection?: boolean;
  readonly showWorkSection?: boolean;
  readonly showAccountSection?: boolean;
  readonly showSecuritySection?: boolean;
  readonly showPreferencesSection?: boolean;
  readonly showActions?: boolean;
  readonly readOnly?: boolean;
  readonly compact?: boolean;
}

const defaultTexts: ProfileTexts = {
  profileTitle: 'Brukerprofil',
  personalInformation: 'Personlig informasjon',
  workInformation: 'Arbeidsinformasjon',
  accountDetails: 'Kontodetaljer',
  securityDetails: 'Sikkerhetsinformasjon',
  preferences: 'Innstillinger',
  editProfile: 'Rediger profil',
  changePassword: 'Endre passord',
  verifyBankId: 'Verifiser med BankID',
  downloadData: 'Last ned mine data',
  deactivateAccount: 'Deaktiver konto',
  firstNameLabel: 'Fornavn',
  lastNameLabel: 'Etternavn',
  emailLabel: 'E-postadresse',
  phoneLabel: 'Telefonnummer',
  titleLabel: 'Stilling',
  departmentLabel: 'Avdeling',
  organizationLabel: 'Organisasjon',
  locationLabel: 'Lokasjon',
  bioLabel: 'Om meg',
  dateOfBirthLabel: 'Fødselsdato',
  nationalIdLabel: 'Personnummer',
  bankIdStatusLabel: 'BankID status',
  lastLoginLabel: 'Siste innlogging',
  accountCreatedLabel: 'Konto opprettet',
  statusLabel: 'Kontostatus',
  permissionsLabel: 'Tilganger',
  languageLabel: 'Språk',
  timezoneLabel: 'Tidssone',
  themeLabel: 'Tema',
  notificationsLabel: 'Varsler',
  verified: 'Verifisert',
  notVerified: 'Ikke verifisert',
  active: 'Aktiv',
  inactive: 'Inaktiv',
  suspended: 'Suspendert',
  pending: 'Venter',
  never: 'Aldri',
  yes: 'Ja',
  no: 'Nei',
  light: 'Lys',
  dark: 'Mørk',
  auto: 'Automatisk',
  loading: 'Laster...',
  profileUpdated: 'Profil oppdatert',
  bankIdVerificationStarted: 'BankID verifisering startet',
  dataDownloadStarted: 'Datanedlasting startet',
  missingInformation: 'Ikke oppgitt'
};

const defaultState: ProfileState = {
  loading: false,
  editing: false,
  verifyingBankId: false,
  downloadingData: false,
  errors: {}
};

export const Profile01: React.FC<Profile01Props> = ({
  profile,
  texts = {},
  callbacks = {},
  state = {},
  className,
  showPersonalSection = true,
  showWorkSection = true,
  showAccountSection = true,
  showSecuritySection = true,
  showPreferencesSection = true,
  showActions = true,
  readOnly = false,
  compact = false
}) => {
  const t = { ...defaultTexts, ...texts };
  const currentState = { ...defaultState, ...state };
  
  const {
    loading,
    editing,
    verifyingBankId,
    downloadingData,
    errors
  } = currentState;

  // Update state helper
  const updateState = useCallback((updates: Partial<ProfileState>) => {
    callbacks.onStateChange?.(updates);
  }, [callbacks]);

  const announce = useCallback((message: string) => {
    callbacks.onAnnounce?.(message);
  }, [callbacks]);

  // Format date helper
  const formatDate = useCallback((date: Date, includeTime = false): string => {
    const options: Intl.DateTimeFormatOptions = {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      ...(includeTime && {
        hour: '2-digit',
        minute: '2-digit'
      })
    };
    return new Intl.DateTimeFormat('nb-NO', options).format(date);
  }, []);

  // Event handlers
  const handleEdit = useCallback(() => {
    callbacks.onEdit?.();
    announce('Åpner redigeringsmodus');
  }, [callbacks, announce]);

  const handleChangePassword = useCallback(() => {
    callbacks.onChangePassword?.();
    announce('Åpner passordendring');
  }, [callbacks, announce]);

  const handleVerifyBankId = useCallback(async () => {
    if (verifyingBankId || !callbacks.onVerifyBankId) return;

    try {
      updateState({ verifyingBankId: true });
      await callbacks.onVerifyBankId();
      announce(t.bankIdVerificationStarted);
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'BankID verifisering feilet';
      announce(`Feil: ${errorMessage}`);
    } finally {
      updateState({ verifyingBankId: false });
    }
  }, [verifyingBankId, callbacks, updateState, announce, t]);

  const handleDownloadData = useCallback(async () => {
    if (downloadingData || !callbacks.onDownloadData) return;

    try {
      updateState({ downloadingData: true });
      await callbacks.onDownloadData();
      announce(t.dataDownloadStarted);
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Datanedlasting feilet';
      announce(`Feil: ${errorMessage}`);
    } finally {
      updateState({ downloadingData: false });
    }
  }, [downloadingData, callbacks, updateState, announce, t]);

  const handleDeactivateAccount = useCallback(() => {
    callbacks.onDeactivateAccount?.();
    announce('Åpner kontodeaktivering');
  }, [callbacks, announce]);

  // Render helpers
  const renderInfoItem = useCallback((
    label: string, 
    value: string | React.ReactNode | undefined, 
    icon?: React.ReactNode
  ) => (
    <div className={cn('space-y-1', compact && 'space-y-0')}>
      <dt className="text-sm font-medium text-muted-foreground flex items-center gap-2">
        {icon && <span aria-hidden="true">{icon}</span>}
        {label}
      </dt>
      <dd className={cn('text-foreground', compact ? 'text-sm' : 'text-base')}>
        {value || <span className="italic text-muted-foreground">{t.missingInformation}</span>}
      </dd>
    </div>
  ), [compact, t]);

  const renderStatusBadge = useCallback((status: UserProfile['status']) => {
    const statusConfig = {
      active: { color: 'bg-green-100 text-green-800', text: t.active },
      inactive: { color: 'bg-gray-100 text-gray-800', text: t.inactive },
      suspended: { color: 'bg-red-100 text-red-800', text: t.suspended },
      pending: { color: 'bg-yellow-100 text-yellow-800', text: t.pending }
    };

    const config = statusConfig[status];
    return (
      <span className={cn('inline-flex px-2 py-1 text-xs font-medium rounded-full', config.color)}>
        {config.text}
      </span>
    );
  }, [t]);

  const fullName = `${profile.firstName} ${profile.lastName}`;

  return (
    <div className={cn('space-y-6', className)}>
      {/* Profile Header */}
      <Card nsmClassification={profile.nsmClassification}>
        <CardHeader className="pb-6">
          <div className="flex items-start gap-6">
            {/* Avatar */}
            <div className="relative">
              <div className="h-24 w-24 rounded-full bg-muted flex items-center justify-center overflow-hidden">
                {profile.avatar ? (
                  <img
                    src={profile.avatar}
                    alt={`${fullName} profilbilde`}
                    className="h-full w-full object-cover"
                  />
                ) : (
                  <span className="text-2xl font-semibold text-muted-foreground">
                    {profile.firstName.charAt(0)}
                    {profile.lastName.charAt(0)}
                  </span>
                )}
              </div>
              
              {/* Verification Badge */}
              {profile.bankIdVerified && (
                <div 
                  className="absolute -bottom-1 -right-1 h-8 w-8 bg-green-600 rounded-full flex items-center justify-center"
                  title={t.verified}
                >
                  <svg className="h-4 w-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                </div>
              )}
            </div>

            {/* Basic Info */}
            <div className="flex-1">
              <CardTitle className="text-2xl">{fullName}</CardTitle>
              <CardDescription className="text-lg mt-1">
                {profile.title && profile.department 
                  ? `${profile.title} - ${profile.department}`
                  : profile.title || profile.department}
              </CardDescription>
              
              {profile.organization && (
                <p className="text-muted-foreground mt-2">{profile.organization}</p>
              )}
              
              {profile.location && (
                <p className="text-muted-foreground flex items-center gap-1 mt-1">
                  <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                  </svg>
                  {profile.location}
                </p>
              )}
            </div>

            {/* Status */}
            <div className="text-right">
              {renderStatusBadge(profile.status)}
              {profile.lastLogin && (
                <p className="text-sm text-muted-foreground mt-2">
                  {t.lastLoginLabel}: {formatDate(profile.lastLogin, true)}
                </p>
              )}
            </div>
          </div>
        </CardHeader>

        {/* Bio */}
        {profile.bio && (
          <CardContent className="pt-0 pb-6 border-b">
            <p className="text-foreground leading-relaxed">{profile.bio}</p>
          </CardContent>
        )}

        {/* Action Buttons */}
        {showActions && !readOnly && (
          <CardContent className="pt-0">
            <div className="flex flex-wrap gap-3">
              {callbacks.onEdit && (
                <Button
                  variant="primary"
                  onClick={handleEdit}
                  disabled={loading || editing}
                  leftIcon={
                    <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                    </svg>
                  }
                >
                  {t.editProfile}
                </Button>
              )}

              {callbacks.onChangePassword && (
                <Button
                  variant="outline"
                  onClick={handleChangePassword}
                  disabled={loading}
                  leftIcon={
                    <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                    </svg>
                  }
                >
                  {t.changePassword}
                </Button>
              )}

              {callbacks.onVerifyBankId && !profile.bankIdVerified && (
                <Button
                  variant="outline"
                  onClick={handleVerifyBankId}
                  loading={verifyingBankId}
                  disabled={loading || verifyingBankId}
                  leftIcon={
                    <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                    </svg>
                  }
                >
                  {t.verifyBankId}
                </Button>
              )}

              {callbacks.onDownloadData && (
                <Button
                  variant="ghost"
                  onClick={handleDownloadData}
                  loading={downloadingData}
                  disabled={loading || downloadingData}
                  leftIcon={
                    <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                    </svg>
                  }
                >
                  {t.downloadData}
                </Button>
              )}
            </div>
          </CardContent>
        )}
      </Card>

      <div className="grid gap-6 md:grid-cols-2">
        {/* Personal Information */}
        {showPersonalSection && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                </svg>
                {t.personalInformation}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <dl className={cn('space-y-4', compact && 'space-y-3')}>
                {renderInfoItem(t.firstNameLabel, profile.firstName)}
                {renderInfoItem(t.lastNameLabel, profile.lastName)}
                {renderInfoItem(t.emailLabel, profile.email, '📧')}
                {renderInfoItem(t.phoneLabel, profile.phoneNumber, '📞')}
                {profile.dateOfBirth && renderInfoItem(
                  t.dateOfBirthLabel, 
                  formatDate(profile.dateOfBirth),
                  '🎂'
                )}
                {profile.nationalId && renderInfoItem(
                  t.nationalIdLabel,
                  profile.nationalId.replace(/(\d{6})(\d{5})/, '$1 $2'),
                  '🆔'
                )}
              </dl>
            </CardContent>
          </Card>
        )}

        {/* Work Information */}
        {showWorkSection && (profile.title || profile.department || profile.organization) && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2-2v2m8 0H8m8 0v2a2 2 0 002 2v8a2 2 0 01-2 2H6a2 2 0 01-2-2v-8a2 2 0 012-2V8z" />
                </svg>
                {t.workInformation}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <dl className={cn('space-y-4', compact && 'space-y-3')}>
                {renderInfoItem(t.titleLabel, profile.title, '💼')}
                {renderInfoItem(t.departmentLabel, profile.department, '🏢')}
                {renderInfoItem(t.organizationLabel, profile.organization, '🏛️')}
                {renderInfoItem(t.locationLabel, profile.location, '📍')}
              </dl>
            </CardContent>
          </Card>
        )}

        {/* Account Details */}
        {showAccountSection && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
                {t.accountDetails}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <dl className={cn('space-y-4', compact && 'space-y-3')}>
                {renderInfoItem(t.statusLabel, renderStatusBadge(profile.status))}
                {renderInfoItem(
                  t.accountCreatedLabel, 
                  formatDate(profile.accountCreated),
                  '📅'
                )}
                {profile.lastLogin ? renderInfoItem(
                  t.lastLoginLabel, 
                  formatDate(profile.lastLogin, true),
                  '⏰'
                ) : renderInfoItem(t.lastLoginLabel, t.never, '⏰')}
                {profile.permissions && profile.permissions.length > 0 && renderInfoItem(
                  t.permissionsLabel,
                  profile.permissions.join(', '),
                  '🔑'
                )}
              </dl>
            </CardContent>
          </Card>
        )}

        {/* Security Details */}
        {showSecuritySection && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                </svg>
                {t.securityDetails}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <dl className={cn('space-y-4', compact && 'space-y-3')}>
                {renderInfoItem(
                  t.bankIdStatusLabel,
                  profile.bankIdVerified ? (
                    <span className="inline-flex items-center gap-2 text-green-600">
                      <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                      </svg>
                      {t.verified}
                    </span>
                  ) : (
                    <span className="inline-flex items-center gap-2 text-muted-foreground">
                      <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                      </svg>
                      {t.notVerified}
                    </span>
                  ),
                  '🔒'
                )}
                {profile.nsmClassification && renderInfoItem(
                  'NSM Klassifisering',
                  <span className={cn(
                    'inline-flex px-2 py-1 text-xs font-medium rounded',
                    profile.nsmClassification === 'OPEN' && 'bg-green-100 text-green-700',
                    profile.nsmClassification === 'RESTRICTED' && 'bg-yellow-100 text-yellow-700',
                    profile.nsmClassification === 'CONFIDENTIAL' && 'bg-red-100 text-red-700',
                    profile.nsmClassification === 'SECRET' && 'bg-gray-100 text-gray-700'
                  )}>
                    {profile.nsmClassification}
                  </span>,
                  '🏛️'
                )}
              </dl>
            </CardContent>
          </Card>
        )}

        {/* Preferences */}
        {showPreferencesSection && profile.preferences && (
          <Card className="md:col-span-2">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-6 8a2 2 0 100-4m0 4a2 2 0 100 4m0-4v2m0-6V4m6 6v10m6-2a2 2 0 100-4m0 4a2 2 0 100 4m0-4v2m0-6V4" />
                </svg>
                {t.preferences}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <dl className={cn('grid gap-4 sm:grid-cols-2', compact && 'gap-3')}>
                {profile.preferences.language && renderInfoItem(
                  t.languageLabel,
                  profile.preferences.language === 'nb' ? 'Bokmål' : 
                  profile.preferences.language === 'nn' ? 'Nynorsk' : 'English',
                  '🌍'
                )}
                {profile.preferences.timezone && renderInfoItem(
                  t.timezoneLabel,
                  profile.preferences.timezone,
                  '⏰'
                )}
                {profile.preferences.theme && renderInfoItem(
                  t.themeLabel,
                  profile.preferences.theme === 'light' ? t.light :
                  profile.preferences.theme === 'dark' ? t.dark : t.auto,
                  '🎨'
                )}
                {profile.preferences.notifications !== undefined && renderInfoItem(
                  t.notificationsLabel,
                  profile.preferences.notifications ? t.yes : t.no,
                  '🔔'
                )}
              </dl>
            </CardContent>
          </Card>
        )}
      </div>

      {/* Danger Zone */}
      {callbacks.onDeactivateAccount && !readOnly && (
        <Card className="border-destructive/20">
          <CardHeader>
            <CardTitle className="text-destructive">Fareområde</CardTitle>
            <CardDescription>
              Irreversible og destruktive handlinger
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button
              variant="destructive"
              onClick={handleDeactivateAccount}
              disabled={loading}
              leftIcon={
                <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
                </svg>
              }
            >
              {t.deactivateAccount}
            </Button>
          </CardContent>
        </Card>
      )}
    </div>
  );
};