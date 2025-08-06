import React, { useState, useCallback, useMemo } from 'react';
import { Button, Input, Card, CardHeader, CardTitle, CardContent } from '@xaheen/design-system/react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';

// Norwegian phone number validation schema
const norwegianPhoneSchema = z.string()
  .regex(/^(\+47|0047|47)?[2-9]\d{7}$/, 'Must be a valid Norwegian phone number');

// Norwegian postal code validation schema  
const norwegianPostalCodeSchema = z.string()
  .regex(/^\d{4}$/, 'Must be a valid Norwegian postal code (4 digits)');

// User profile validation schema with Norwegian compliance
const userProfileSchema = z.object({
  firstName: z.string().min(2, 'First name must be at least 2 characters'),
  lastName: z.string().min(2, 'Last name must be at least 2 characters'),
  email: z.string().email('Must be a valid email address'),
  phone: norwegianPhoneSchema.optional(),
  postalCode: norwegianPostalCodeSchema.optional(),
  nsmClassification: z.enum(['OPEN', 'RESTRICTED', 'CONFIDENTIAL', 'SECRET']).default('OPEN'),
});

type UserProfileFormData = z.infer<typeof userProfileSchema>;

interface UserProfileFormProps {
  readonly initialData?: Partial<UserProfileFormData>;
  readonly onSubmit: (data: UserProfileFormData) => Promise<void>;
  readonly loading?: boolean;
  readonly nsmCompliant?: boolean;
}

export const UserProfileForm = ({
  initialData,
  onSubmit,
  loading = false,
  nsmCompliant = true
}: UserProfileFormProps): JSX.Element => {
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);

  const {
    register,
    handleSubmit,
    formState: { errors, isValid },
    reset,
  } = useForm<UserProfileFormData>({
    resolver: zodResolver(userProfileSchema),
    defaultValues: initialData,
    mode: 'onChange',
  });

  const handleFormSubmit = useCallback(async (data: UserProfileFormData): Promise<void> => {
    if (isSubmitting) return;
    
    setIsSubmitting(true);
    try {
      await onSubmit(data);
      reset();
    } catch (error) {
      console.error('Form submission error:', error);
    } finally {
      setIsSubmitting(false);
    }
  }, [onSubmit, isSubmitting, reset]);

  const nsmClassificationOptions = useMemo(() => [
    { value: 'OPEN', label: 'Open (Åpen)' },
    { value: 'RESTRICTED', label: 'Restricted (Begrenset)' },
    { value: 'CONFIDENTIAL', label: 'Confidential (Konfidensiell)' },
    { value: 'SECRET', label: 'Secret (Hemmelig)' },
  ], []);

  try {
    return (
      <Card className="max-w-2xl mx-auto shadow-lg">
        <CardHeader>
          <CardTitle className="text-2xl font-bold text-gray-900">
            User Profile {nsmCompliant && '(NSM Compliant)'}
          </CardTitle>
        </CardHeader>
        <CardContent className="p-8">
          <form onSubmit={handleSubmit(handleFormSubmit)} className="space-y-6">
            {/* First Name */}
            <div>
              <label 
                htmlFor="firstName" 
                className="block text-sm font-medium text-gray-700 mb-2"
              >
                First Name (Fornavn) *
              </label>
              <Input
                id="firstName"
                type="text"
                {...register('firstName')}
                className="h-14 w-full"
                aria-describedby={errors.firstName ? 'firstName-error' : undefined}
                aria-invalid={!!errors.firstName}
                disabled={loading || isSubmitting}
              />
              {errors.firstName && (
                <p id="firstName-error" className="mt-2 text-sm text-red-600" role="alert">
                  {errors.firstName.message}
                </p>
              )}
            </div>

            {/* Last Name */}
            <div>
              <label 
                htmlFor="lastName" 
                className="block text-sm font-medium text-gray-700 mb-2"
              >
                Last Name (Etternavn) *
              </label>
              <Input
                id="lastName"
                type="text"
                {...register('lastName')}
                className="h-14 w-full"
                aria-describedby={errors.lastName ? 'lastName-error' : undefined}
                aria-invalid={!!errors.lastName}
                disabled={loading || isSubmitting}
              />
              {errors.lastName && (
                <p id="lastName-error" className="mt-2 text-sm text-red-600" role="alert">
                  {errors.lastName.message}
                </p>
              )}
            </div>

            {/* Email */}
            <div>
              <label 
                htmlFor="email" 
                className="block text-sm font-medium text-gray-700 mb-2"
              >
                Email Address (E-postadresse) *
              </label>
              <Input
                id="email"
                type="email"
                {...register('email')}
                className="h-14 w-full"
                aria-describedby={errors.email ? 'email-error' : undefined}
                aria-invalid={!!errors.email}
                disabled={loading || isSubmitting}
              />
              {errors.email && (
                <p id="email-error" className="mt-2 text-sm text-red-600" role="alert">
                  {errors.email.message}
                </p>
              )}
            </div>

            {/* Norwegian Phone Number */}
            <div>
              <label 
                htmlFor="phone" 
                className="block text-sm font-medium text-gray-700 mb-2"
              >
                Phone Number (Telefonnummer) - Norwegian format
              </label>
              <Input
                id="phone"
                type="tel"
                placeholder="+47 12 34 56 78"
                {...register('phone')}
                className="h-14 w-full"
                aria-describedby={errors.phone ? 'phone-error' : 'phone-help'}
                aria-invalid={!!errors.phone}
                disabled={loading || isSubmitting}
              />
              <p id="phone-help" className="mt-1 text-sm text-gray-500">
                Format: +47 followed by 8 digits
              </p>
              {errors.phone && (
                <p id="phone-error" className="mt-2 text-sm text-red-600" role="alert">
                  {errors.phone.message}
                </p>
              )}
            </div>

            {/* Norwegian Postal Code */}
            <div>
              <label 
                htmlFor="postalCode" 
                className="block text-sm font-medium text-gray-700 mb-2"
              >
                Postal Code (Postnummer)
              </label>
              <Input
                id="postalCode"
                type="text"
                placeholder="0001"
                maxLength={4}
                {...register('postalCode')}
                className="h-14 w-full"
                aria-describedby={errors.postalCode ? 'postalCode-error' : 'postalCode-help'}
                aria-invalid={!!errors.postalCode}
                disabled={loading || isSubmitting}
              />
              <p id="postalCode-help" className="mt-1 text-sm text-gray-500">
                Norwegian postal code (4 digits)
              </p>
              {errors.postalCode && (
                <p id="postalCode-error" className="mt-2 text-sm text-red-600" role="alert">
                  {errors.postalCode.message}
                </p>
              )}
            </div>

            {/* NSM Classification (Norwegian compliance) */}
            {nsmCompliant && (
              <div>
                <label 
                  htmlFor="nsmClassification" 
                  className="block text-sm font-medium text-gray-700 mb-2"
                >
                  NSM Security Classification (Sikkerhetsgradert informasjon) *
                </label>
                <select
                  id="nsmClassification"
                  {...register('nsmClassification')}
                  className="h-14 w-full px-4 border-2 border-gray-300 rounded-lg focus:border-blue-500 focus:ring-2 focus:ring-blue-200 disabled:opacity-50 disabled:cursor-not-allowed"
                  aria-describedby="nsm-help"
                  disabled={loading || isSubmitting}
                >
                  {nsmClassificationOptions.map((option) => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </select>
                <p id="nsm-help" className="mt-1 text-sm text-gray-500">
                  Select the appropriate security classification level
                </p>
              </div>
            )}

            {/* Form Actions */}
            <div className="flex items-center justify-end space-x-4 pt-6">
              <Button
                type="button"
                onClick={() => reset()}
                className="h-12 px-6 bg-gray-200 text-gray-700 hover:bg-gray-300 font-medium rounded-lg transition-colors focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2"
                disabled={loading || isSubmitting}
                aria-label="Reset form to initial values"
              >
                Reset
              </Button>
              <Button
                type="submit"
                className="h-12 px-8 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg shadow-md transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed"
                disabled={loading || isSubmitting || !isValid}
                aria-label="Submit user profile form"
              >
                {isSubmitting ? 'Submitting...' : 'Save Profile'}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    );
  } catch (error) {
    console.error('UserProfileForm error:', error);
    return (
      <Card className="max-w-2xl mx-auto shadow-lg">
        <CardContent className="p-8 text-center">
          <p className="text-red-600 font-medium" role="alert">
            An error occurred while loading the form. Please refresh and try again.
          </p>
        </CardContent>
      </Card>
    );
  }
};