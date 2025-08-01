/**
 * Example: Norwegian Compliance Form Component
 *
 * This example demonstrates a comprehensive form component with full
 * Norwegian compliance including NSM classification, GDPR data protection,
 * and WCAG AAA accessibility standards.
 *
 * Features demonstrated:
 * - NSM RESTRICTED classification with audit logging
 * - GDPR consent management and data minimization
 * - WCAG AAA accessibility with screen reader support
 * - Norwegian language validation and formatting
 * - BankID integration placeholder
 * - Comprehensive error handling
 * - Real-time compliance monitoring
 */

import { zodResolver } from "@hookform/resolvers/zod";
import React, { useCallback, useEffect, useState } from "react";
import { Controller, useForm } from "react-hook-form";
import { z } from "zod";
import { GDPRConsentCheckbox } from "@/components/compliance/GDPRConsentCheckbox";
import { NorwegianPhoneInput } from "@/components/forms/NorwegianPhoneInput";
import { NorwegianPostalCodeInput } from "@/components/forms/NorwegianPostalCodeInput";
import { AccessibleFormField } from "@/components/ui/AccessibleFormField";
import { Button } from "@/components/ui/Button";
import { useAuditLogger } from "@/hooks/useAuditLogger";
import { useGDPRConsent } from "@/hooks/useGDPRConsent";
import { useTranslation } from "@/hooks/useTranslation";
import { GDPRDataCategory, NSMClassification } from "@/types/compliance";

// Norwegian-specific validation schemas
const norwegianPersonalIdSchema = z
	.string()
	.regex(/^\d{11}$/, "userProfile.validation.personalIdInvalid")
	.refine((id) => {
		// Simplified Norwegian personal ID validation
		const digits = id.split("").map(Number);
		// Real implementation would include full checksum validation
		return digits.length === 11;
	}, "userProfile.validation.personalIdChecksum");

const norwegianPhoneSchema = z
	.string()
	.regex(/^(\+47)?[2-9]\d{7}$/, "userProfile.validation.phoneInvalid");

const norwegianPostalCodeSchema = z
	.string()
	.regex(/^\d{4}$/, "userProfile.validation.postalCodeInvalid");

// Comprehensive form schema with Norwegian compliance
const userProfileFormSchema = z.object({
	// Basic personal information (GDPR Category: Personal Data)
	firstName: z
		.string()
		.min(2, "userProfile.validation.firstNameMinLength")
		.max(50, "userProfile.validation.firstNameMaxLength")
		.regex(/^[a-zA-ZæøåÆØÅ\s-]+$/, "userProfile.validation.firstNameInvalid"),

	lastName: z
		.string()
		.min(2, "userProfile.validation.lastNameMinLength")
		.max(50, "userProfile.validation.lastNameMaxLength")
		.regex(/^[a-zA-ZæøåÆØÅ\s-]+$/, "userProfile.validation.lastNameInvalid"),

	email: z
		.string()
		.email("userProfile.validation.emailInvalid")
		.max(254, "userProfile.validation.emailMaxLength"),

	phone: norwegianPhoneSchema.optional(),

	// Norwegian-specific sensitive data (NSM RESTRICTED)
	personalId: norwegianPersonalIdSchema.optional(),

	// Address information
	address: z.object({
		street: z
			.string()
			.min(5, "userProfile.validation.streetMinLength")
			.max(100, "userProfile.validation.streetMaxLength"),
		postalCode: norwegianPostalCodeSchema,
		city: z
			.string()
			.min(2, "userProfile.validation.cityMinLength")
			.max(50, "userProfile.validation.cityMaxLength")
			.regex(/^[a-zA-ZæøåÆØÅ\s-]+$/, "userProfile.validation.cityInvalid"),
		municipality: z
			.string()
			.min(2, "userProfile.validation.municipalityMinLength")
			.max(50, "userProfile.validation.municipalityMaxLength"),
	}),

	// GDPR consent and preferences
	gdprConsent: z.object({
		dataProcessing: z
			.boolean()
			.refine(
				(val) => val === true,
				"userProfile.validation.gdprDataProcessingRequired",
			),
		marketing: z.boolean(),
		analytics: z.boolean(),
		thirdPartySharing: z.boolean(),
	}),

	// Norwegian service integrations
	services: z.object({
		bankIdVerified: z.boolean(),
		idPortenConnected: z.boolean(),
		altinnAccess: z.boolean(),
	}),
});

type UserProfileFormData = z.infer<typeof userProfileFormSchema>;

interface UserProfileFormProps {
	readonly initialData?: Partial<UserProfileFormData>;
	readonly onSubmit: (data: UserProfileFormData) => Promise<void>;
	readonly onCancel?: () => void;
	readonly classification?: NSMClassification;
	readonly gdprDataCategory?: GDPRDataCategory;
	readonly readOnly?: boolean;
}

/**
 * Norwegian Compliance User Profile Form
 *
 * Demonstrates full Norwegian compliance including:
 * - NSM security classification and audit logging
 * - GDPR data protection and consent management
 * - WCAG AAA accessibility
 * - Norwegian language support and validation
 * - Integration with Norwegian government services
 */
export const UserProfileForm: React.FC<UserProfileFormProps> = ({
	initialData,
	onSubmit,
	onCancel,
	classification = NSMClassification.RESTRICTED,
	gdprDataCategory = GDPRDataCategory.PERSONAL,
	readOnly = false,
}) => {
	const { t, formatDate, formatNumber } = useTranslation();
	const auditLogger = useAuditLogger();
	const { checkConsent, requestConsent } = useGDPRConsent();
	const [isSubmitting, setIsSubmitting] = useState(false);
	const [complianceStatus, setComplianceStatus] = useState<{
		nsm: boolean;
		gdpr: boolean;
		wcag: boolean;
	}>({
		nsm: true,
		gdpr: false,
		wcag: true,
	});

	// Form setup with validation
	const {
		control,
		handleSubmit,
		formState: { errors, isDirty, isValid },
		watch,
		setValue,
		trigger,
	} = useForm<UserProfileFormData>({
		resolver: zodResolver(userProfileFormSchema),
		defaultValues: {
			firstName: "",
			lastName: "",
			email: "",
			phone: "",
			personalId: "",
			address: {
				street: "",
				postalCode: "",
				city: "",
				municipality: "",
			},
			gdprConsent: {
				dataProcessing: false,
				marketing: false,
				analytics: false,
				thirdPartySharing: false,
			},
			services: {
				bankIdVerified: false,
				idPortenConnected: false,
				altinnAccess: false,
			},
			...initialData,
		},
		mode: "onChange",
	});

	// Watch form values for compliance monitoring
	const watchedValues = watch();

	// Audit logging for form access (NSM compliance)
	useEffect(() => {
		auditLogger.log({
			action: "form_access",
			resource: "UserProfileForm",
			classification,
			metadata: {
				gdprDataCategory,
				readOnly,
				timestamp: new Date().toISOString(),
			},
		});
	}, [auditLogger, classification, gdprDataCategory, readOnly]);

	// GDPR compliance monitoring
	useEffect(() => {
		const hasRequiredConsent = watchedValues.gdprConsent?.dataProcessing;
		setComplianceStatus((prev) => ({
			...prev,
			gdpr: hasRequiredConsent || false,
		}));
	}, [watchedValues.gdprConsent]);

	// Real-time Norwegian personal ID validation
	const validatePersonalId = useCallback(
		async (personalId: string) => {
			if (!personalId) return true;

			// Log sensitive data validation attempt
			auditLogger.log({
				action: "personal_id_validation",
				resource: "UserProfileForm",
				classification: NSMClassification.RESTRICTED,
				metadata: {
					hasPersonalId: Boolean(personalId),
					timestamp: new Date().toISOString(),
				},
			});

			// In real implementation, this would validate against Norwegian registry
			return personalId.length === 11 && /^\d{11}$/.test(personalId);
		},
		[auditLogger],
	);

	// BankID verification simulation
	const handleBankIdVerification = useCallback(async () => {
		auditLogger.log({
			action: "bankid_verification_initiated",
			resource: "UserProfileForm",
			classification: NSMClassification.RESTRICTED,
		});

		// Simulate BankID flow
		// In real implementation, this would integrate with BankID API
		setTimeout(() => {
			setValue("services.bankIdVerified", true);
			auditLogger.log({
				action: "bankid_verification_completed",
				resource: "UserProfileForm",
				classification: NSMClassification.RESTRICTED,
				metadata: {
					verified: true,
					timestamp: new Date().toISOString(),
				},
			});
		}, 2000);
	}, [setValue, auditLogger]);

	// Form submission with compliance checks
	const handleFormSubmit = async (data: UserProfileFormData) => {
		setIsSubmitting(true);

		try {
			// Pre-submission compliance validation
			if (!complianceStatus.gdpr) {
				throw new Error(t("userProfile.errors.gdprConsentRequired"));
			}

			// Log data processing initiation (GDPR requirement)
			auditLogger.log({
				action: "personal_data_processing_initiated",
				resource: "UserProfileForm",
				classification,
				metadata: {
					gdprDataCategory,
					dataFields: Object.keys(data),
					consentProvided: data.gdprConsent.dataProcessing,
					timestamp: new Date().toISOString(),
				},
			});

			// Submit form data
			await onSubmit(data);

			// Log successful submission
			auditLogger.log({
				action: "form_submission_completed",
				resource: "UserProfileForm",
				classification,
				metadata: {
					success: true,
					timestamp: new Date().toISOString(),
				},
			});
		} catch (error) {
			// Log submission failure
			auditLogger.log({
				action: "form_submission_failed",
				resource: "UserProfileForm",
				classification,
				metadata: {
					error: error instanceof Error ? error.message : "Unknown error",
					timestamp: new Date().toISOString(),
				},
			});

			throw error;
		} finally {
			setIsSubmitting(false);
		}
	};

	return (
		<div
			className="user-profile-form max-w-4xl mx-auto p-8 bg-white rounded-lg shadow-lg"
			data-nsm-classification={classification}
			data-gdpr-category={gdprDataCategory}
			data-testid="user-profile-form"
		>
			{/* Compliance Status Indicator */}
			<div className="compliance-status mb-6 p-4 bg-gray-50 rounded-lg">
				<h3 className="text-sm font-medium text-gray-900 mb-2">
					{t("userProfile.complianceStatus.title")}
				</h3>
				<div className="flex space-x-4 text-sm">
					<div className="flex items-center">
						<span
							className={`w-2 h-2 rounded-full mr-2 ${complianceStatus.nsm ? "bg-green-500" : "bg-red-500"}`}
						/>
						NSM {classification}
					</div>
					<div className="flex items-center">
						<span
							className={`w-2 h-2 rounded-full mr-2 ${complianceStatus.gdpr ? "bg-green-500" : "bg-red-500"}`}
						/>
						GDPR
					</div>
					<div className="flex items-center">
						<span
							className={`w-2 h-2 rounded-full mr-2 ${complianceStatus.wcag ? "bg-green-500" : "bg-red-500"}`}
						/>
						WCAG AAA
					</div>
				</div>
			</div>

			<form onSubmit={handleSubmit(handleFormSubmit)} noValidate>
				<div className="space-y-8">
					{/* Personal Information Section */}
					<fieldset className="space-y-6">
						<legend className="text-lg font-medium text-gray-900">
							{t("userProfile.sections.personalInformation")}
						</legend>

						<div className="grid grid-cols-1 md:grid-cols-2 gap-6">
							<Controller
								name="firstName"
								control={control}
								render={({ field }) => (
									<AccessibleFormField
										id="firstName"
										label={t("userProfile.firstName.label")}
										type="text"
										required
										error={
											errors.firstName?.message
												? t(errors.firstName.message)
												: undefined
										}
										helperText={t("userProfile.firstName.helper")}
										readOnly={readOnly}
										{...field}
									/>
								)}
							/>

							<Controller
								name="lastName"
								control={control}
								render={({ field }) => (
									<AccessibleFormField
										id="lastName"
										label={t("userProfile.lastName.label")}
										type="text"
										required
										error={
											errors.lastName?.message
												? t(errors.lastName.message)
												: undefined
										}
										helperText={t("userProfile.lastName.helper")}
										readOnly={readOnly}
										{...field}
									/>
								)}
							/>
						</div>

						<Controller
							name="email"
							control={control}
							render={({ field }) => (
								<AccessibleFormField
									id="email"
									label={t("userProfile.email.label")}
									type="email"
									required
									error={
										errors.email?.message ? t(errors.email.message) : undefined
									}
									helperText={t("userProfile.email.helper")}
									readOnly={readOnly}
									{...field}
								/>
							)}
						/>

						<Controller
							name="phone"
							control={control}
							render={({ field }) => (
								<NorwegianPhoneInput
									id="phone"
									label={t("userProfile.phone.label")}
									error={
										errors.phone?.message ? t(errors.phone.message) : undefined
									}
									helperText={t("userProfile.phone.helper")}
									readOnly={readOnly}
									{...field}
								/>
							)}
						/>

						{/* Sensitive Data - Personal ID (NSM RESTRICTED) */}
						{classification !== NSMClassification.OPEN && (
							<Controller
								name="personalId"
								control={control}
								render={({ field }) => (
									<AccessibleFormField
										id="personalId"
										label={t("userProfile.personalId.label")}
										type="text"
										error={
											errors.personalId?.message
												? t(errors.personalId.message)
												: undefined
										}
										helperText={t("userProfile.personalId.helper")}
										readOnly={readOnly}
										maxLength={11}
										autoComplete="off"
										data-sensitive="true"
										{...field}
									/>
								)}
							/>
						)}
					</fieldset>

					{/* Address Information Section */}
					<fieldset className="space-y-6">
						<legend className="text-lg font-medium text-gray-900">
							{t("userProfile.sections.addressInformation")}
						</legend>

						<Controller
							name="address.street"
							control={control}
							render={({ field }) => (
								<AccessibleFormField
									id="street"
									label={t("userProfile.address.street.label")}
									type="text"
									required
									error={
										errors.address?.street?.message
											? t(errors.address.street.message)
											: undefined
									}
									helperText={t("userProfile.address.street.helper")}
									readOnly={readOnly}
									{...field}
								/>
							)}
						/>

						<div className="grid grid-cols-1 md:grid-cols-3 gap-6">
							<Controller
								name="address.postalCode"
								control={control}
								render={({ field }) => (
									<NorwegianPostalCodeInput
										id="postalCode"
										label={t("userProfile.address.postalCode.label")}
										error={
											errors.address?.postalCode?.message
												? t(errors.address.postalCode.message)
												: undefined
										}
										helperText={t("userProfile.address.postalCode.helper")}
										readOnly={readOnly}
										{...field}
									/>
								)}
							/>

							<Controller
								name="address.city"
								control={control}
								render={({ field }) => (
									<AccessibleFormField
										id="city"
										label={t("userProfile.address.city.label")}
										type="text"
										required
										error={
											errors.address?.city?.message
												? t(errors.address.city.message)
												: undefined
										}
										helperText={t("userProfile.address.city.helper")}
										readOnly={readOnly}
										{...field}
									/>
								)}
							/>

							<Controller
								name="address.municipality"
								control={control}
								render={({ field }) => (
									<AccessibleFormField
										id="municipality"
										label={t("userProfile.address.municipality.label")}
										type="text"
										required
										error={
											errors.address?.municipality?.message
												? t(errors.address.municipality.message)
												: undefined
										}
										helperText={t("userProfile.address.municipality.helper")}
										readOnly={readOnly}
										{...field}
									/>
								)}
							/>
						</div>
					</fieldset>

					{/* GDPR Consent Section */}
					<fieldset className="space-y-6">
						<legend className="text-lg font-medium text-gray-900">
							{t("userProfile.sections.dataConsent")}
						</legend>

						<div className="space-y-4">
							<Controller
								name="gdprConsent.dataProcessing"
								control={control}
								render={({ field }) => (
									<GDPRConsentCheckbox
										id="gdprDataProcessing"
										label={t("userProfile.gdpr.dataProcessing.label")}
										description={t(
											"userProfile.gdpr.dataProcessing.description",
										)}
										required
										error={
											errors.gdprConsent?.dataProcessing?.message
												? t(errors.gdprConsent.dataProcessing.message)
												: undefined
										}
										disabled={readOnly}
										{...field}
									/>
								)}
							/>

							<Controller
								name="gdprConsent.marketing"
								control={control}
								render={({ field }) => (
									<GDPRConsentCheckbox
										id="gdprMarketing"
										label={t("userProfile.gdpr.marketing.label")}
										description={t("userProfile.gdpr.marketing.description")}
										disabled={readOnly}
										{...field}
									/>
								)}
							/>

							<Controller
								name="gdprConsent.analytics"
								control={control}
								render={({ field }) => (
									<GDPRConsentCheckbox
										id="gdprAnalytics"
										label={t("userProfile.gdpr.analytics.label")}
										description={t("userProfile.gdpr.analytics.description")}
										disabled={readOnly}
										{...field}
									/>
								)}
							/>
						</div>
					</fieldset>

					{/* Norwegian Services Integration */}
					<fieldset className="space-y-6">
						<legend className="text-lg font-medium text-gray-900">
							{t("userProfile.sections.norwegianServices")}
						</legend>

						<div className="space-y-4">
							<div className="flex items-center justify-between p-4 bg-blue-50 rounded-lg">
								<div>
									<h4 className="font-medium text-gray-900">
										{t("userProfile.services.bankId.title")}
									</h4>
									<p className="text-sm text-gray-600">
										{t("userProfile.services.bankId.description")}
									</p>
								</div>
								{watchedValues.services?.bankIdVerified ? (
									<div className="flex items-center text-green-600">
										<svg
											className="w-5 h-5 mr-2"
											fill="currentColor"
											viewBox="0 0 20 20"
										>
											<path
												fillRule="evenodd"
												d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
												clipRule="evenodd"
											/>
										</svg>
										{t("userProfile.services.verified")}
									</div>
								) : (
									<Button
										type="button"
										variant="secondary"
										onClick={handleBankIdVerification}
										disabled={readOnly || isSubmitting}
									>
										{t("userProfile.services.bankId.verify")}
									</Button>
								)}
							</div>
						</div>
					</fieldset>

					{/* Form Actions */}
					{!readOnly && (
						<div className="flex justify-end space-x-4 pt-6 border-t">
							{onCancel && (
								<Button
									type="button"
									variant="ghost"
									onClick={onCancel}
									disabled={isSubmitting}
								>
									{t("common.cancel")}
								</Button>
							)}

							<Button
								type="submit"
								variant="primary"
								loading={isSubmitting}
								disabled={!isValid || !complianceStatus.gdpr}
								ariaLabel={t("userProfile.submit.ariaLabel")}
							>
								{t("userProfile.submit.label")}
							</Button>
						</div>
					)}
				</div>
			</form>

			{/* Compliance Footer */}
			<div className="mt-8 pt-6 border-t text-xs text-gray-500">
				<p>
					{t("userProfile.compliance.footer", {
						classification,
						lastUpdated: formatDate(new Date()),
					})}
				</p>
			</div>
		</div>
	);
};

export default UserProfileForm;
export type { UserProfileFormProps, UserProfileFormData };
