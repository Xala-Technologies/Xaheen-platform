# Xaheen Platform - Real-World Examples

## Table of Contents

1. [Norwegian E-commerce Platform](#norwegian-e-commerce-platform)
2. [Government Service Portal](#government-service-portal)
3. [Healthcare Management System](#healthcare-management-system)
4. [Financial Services Application](#financial-services-application)
5. [Educational Platform](#educational-platform)
6. [Multi-tenant SaaS Application](#multi-tenant-saas-application)
7. [Real Estate Platform](#real-estate-platform)
8. [Event Management System](#event-management-system)
9. [IoT Dashboard](#iot-dashboard)
10. [Social Platform](#social-platform)

## Norwegian E-commerce Platform

A complete e-commerce solution with Vipps payment, Norwegian compliance, and multi-language support.

### Project Setup

```bash
# Initialize the project
xaheen init norwegian-ecommerce \
  --template=ecommerce \
  --framework=next \
  --ui=xala \
  --features=cart,checkout,inventory,search,reviews \
  --integrations=vipps,stripe,altinn,postnord \
  --language=nb,en \
  --compliance=gdpr,wcag \
  --auth=vipps \
  --database=postgres \
  --payment=vipps,stripe

cd norwegian-ecommerce
```

### Database Models

```bash
# Product model with Norwegian VAT
xaheen model Product \
  id:uuid! \
  sku:string! \
  name:string \
  nameEn:string? \
  description:text \
  descriptionEn:text? \
  price:decimal@positive \
  vat:decimal@enum:0,0.12,0.15,0.25 \
  stock:integer@min:0 \
  category:Category \
  images:"string[]" \
  weight:decimal? \
  dimensions:json? \
  --relations="category:belongsTo,reviews:hasMany,orderItems:hasMany" \
  --indexes=sku,category \
  --audit \
  --soft-delete

# Order model with KID reference
xaheen model Order \
  id:uuid! \
  orderNumber:string! \
  kid:string! \
  customerId:string \
  status:"pending"|"processing"|"shipped"|"delivered"|"cancelled" \
  subtotal:decimal \
  vat:decimal \
  shipping:decimal \
  total:decimal \
  shippingAddress:json \
  billingAddress:json \
  items:"OrderItem[]" \
  --relations="customer:belongsTo,items:hasMany,payment:hasOne" \
  --audit \
  --compliance=gdpr

# Customer model with GDPR compliance
xaheen model Customer \
  id:uuid! \
  email:string!@email \
  phone:string?@norwegianPhone \
  name:string \
  organizationNumber:string?@orgNumber \
  addresses:"Address[]" \
  consents:"Consent[]" \
  --relations="orders:hasMany,reviews:hasMany,consents:hasMany" \
  --audit \
  --compliance=gdpr \
  --soft-delete
```

### Components

```bash
# Product card with multi-language support
xaheen component ProductCard \
  product:Product \
  language:"nb"|"en" \
  onAddToCart:"(product: Product) => void" \
  onQuickView:"(product: Product) => void"? \
  showStock:boolean? \
  --type=display \
  --features=image-lazy-loading,price-formatting,vat-display \
  --compliance=wcag

# Shopping cart with Vipps Express
xaheen component ShoppingCart \
  items:"CartItem[]" \
  onUpdateQuantity:"(itemId: string, quantity: number) => void" \
  onRemoveItem:"(itemId: string) => void" \
  onCheckout:"() => void" \
  onVippsExpress:"() => void" \
  --type=composite \
  --features=persistent-storage,price-calculation,vat-breakdown \
  --compliance=gdpr,wcag

# Checkout form with Norwegian address
xaheen component CheckoutForm \
  cart:Cart \
  customer:Customer? \
  onSubmit:"(order: OrderData) => Promise<void>" \
  paymentMethods:"PaymentMethod[]" \
  shippingMethods:"ShippingMethod[]" \
  --type=form \
  --features=address-autocomplete,postnumber-lookup,org-number-validation \
  --compliance=gdpr,pci,wcag

# Order confirmation with KID
xaheen component OrderConfirmation \
  order:Order \
  showDownloadInvoice:boolean \
  showTrackingInfo:boolean \
  --type=display \
  --features=pdf-generation,email-sending,kid-display
```

### Pages

```bash
# Product listing with filters
xaheen page Products \
  --route=/products \
  --features=filtering,sorting,pagination,search,infinite-scroll \
  --components=ProductCard,FilterSidebar,SortDropdown \
  --api \
  --isr=3600

# Product detail page
xaheen page ProductDetail \
  --route=/products/[slug] \
  --features=image-gallery,reviews,related-products,stock-status \
  --components=ImageGallery,ReviewList,AddToCart,ProductSpecs \
  --api

# Checkout page with authentication
xaheen page Checkout \
  --route=/checkout \
  --layout=minimal \
  --auth=optional \
  --features=guest-checkout,vipps-express,address-validation \
  --components=CheckoutForm,OrderSummary,PaymentMethods
```

### Services

```bash
# Vipps payment service
xaheen service VippsPaymentService \
  --type=integration \
  --methods=createPayment,capturePayment,refundPayment,checkStatus \
  --retry \
  --circuit-breaker \
  --test

# Inventory management service
xaheen service InventoryService \
  --type=business \
  --methods=checkStock,reserveStock,releaseStock,updateStock \
  --cache \
  --events=stock-low,out-of-stock

# Norwegian VAT calculation
xaheen service VATService \
  --type=business \
  --methods=calculateVAT,getVATRate,formatPrice,generateReport
```

### Integration Examples

```typescript
// Vipps Express Checkout implementation
export async function handleVippsExpress(cart: Cart) {
  const vipps = new VippsPaymentService();
  
  // Create express payment
  const payment = await vipps.createPayment({
    amount: cart.total,
    orderLines: cart.items.map(item => ({
      name: item.product.name,
      unitPrice: item.product.price,
      quantity: item.quantity,
      vatRate: item.product.vat,
    })),
    userFlow: 'EXPRESS',
    returnUrl: `${process.env.NEXT_PUBLIC_URL}/checkout/success`,
    callbackUrl: `${process.env.NEXT_PUBLIC_URL}/api/vipps/callback`,
  });
  
  // Redirect to Vipps
  window.location.href = payment.url;
}

// PostNord shipping integration
export async function calculateShipping(
  address: Address,
  items: CartItem[]
): Promise<ShippingOption[]> {
  const postnord = new PostNordService();
  
  const weight = items.reduce((sum, item) => 
    sum + (item.product.weight || 0) * item.quantity, 0
  );
  
  const options = await postnord.getShippingOptions({
    fromPostalCode: '0001', // Oslo warehouse
    toPostalCode: address.postalCode,
    weight,
    services: ['pickup', 'home-delivery', 'express'],
  });
  
  return options.map(opt => ({
    ...opt,
    price: opt.price * 1.25, // Add VAT
  }));
}
```

### Compliance Implementation

```typescript
// GDPR consent management
export function CookieConsent() {
  const { t } = useTranslation();
  const [show, setShow] = useState(true);
  
  return (
    <GDPRConsentBanner
      show={show}
      onAccept={async (preferences) => {
        await consentManager.savePreferences(preferences);
        if (preferences.analytics) {
          analytics.enable();
        }
        if (preferences.marketing) {
          marketing.enable();
        }
        setShow(false);
      }}
      options={{
        necessary: { required: true, description: t('cookies.necessary') },
        analytics: { required: false, description: t('cookies.analytics') },
        marketing: { required: false, description: t('cookies.marketing') },
      }}
    />
  );
}

// Order data anonymization for GDPR
export async function anonymizeOldOrders() {
  const threeYearsAgo = new Date();
  threeYearsAgo.setFullYear(threeYearsAgo.getFullYear() - 3);
  
  await db.order.updateMany({
    where: {
      createdAt: { lt: threeYearsAgo },
      anonymized: false,
    },
    data: {
      customerEmail: 'anonymous@example.com',
      customerName: 'Anonymous Customer',
      shippingAddress: null,
      billingAddress: null,
      anonymized: true,
      anonymizedAt: new Date(),
    },
  });
}
```

## Government Service Portal

A secure portal for Norwegian government services with BankID authentication and Altinn integration.

### Project Setup

```bash
xaheen init gov-service-portal \
  --template=government \
  --framework=next \
  --ui=xala \
  --features=forms,documents,messaging,appointments \
  --integrations=bankid,altinn,digipost \
  --language=nb,nn,en \
  --compliance=gdpr,nsm,wcag \
  --auth=bankid \
  --database=postgres \
  --security-level=restricted
```

### Authentication Setup

```typescript
// BankID authentication with NSM compliance
export class SecureAuthService {
  private bankid: BankIDClient;
  private sessionManager: SessionManager;
  
  async authenticate(personalNumber?: string): Promise<AuthResult> {
    // Log authentication attempt
    await auditLog.record({
      action: 'auth_attempt',
      classification: NSMClassification.RESTRICTED,
      timestamp: new Date(),
    });
    
    try {
      // Start BankID authentication
      const authSession = await this.bankid.authenticate({
        personalNumber,
        requirement: {
          certificatePolicies: ['2.16.578.1.26.1.3.3'], // BankID on mobile
          pinCode: true,
        },
      });
      
      // Create secure session
      const session = await this.sessionManager.createSession({
        userId: authSession.userId,
        personalNumber: encrypt(authSession.personalNumber),
        securityLevel: NSMClassification.RESTRICTED,
        expires: new Date(Date.now() + 30 * 60 * 1000), // 30 minutes
      });
      
      return { success: true, session };
    } catch (error) {
      await this.handleAuthError(error);
      throw error;
    }
  }
}
```

### Altinn Integration

```typescript
// Service for government form submission
export class AltinnFormService {
  async submitForm(
    formData: any,
    formType: string,
    organizationNumber: string
  ): Promise<SubmissionResult> {
    // Validate user authorization
    const roles = await altinn.getRoles({
      subject: getCurrentUser().personalNumber,
      reportee: organizationNumber,
    });
    
    if (!roles.some(r => r.type === formType)) {
      throw new Error('Insufficient permissions');
    }
    
    // Create Altinn instance
    const instance = await altinn.createInstance({
      org: 'skatteetaten',
      app: formType,
      instanceOwner: {
        organisationNumber: organizationNumber,
      },
    });
    
    // Upload form data
    await altinn.uploadData(instance.id, 'default', {
      ...formData,
      submittedBy: getCurrentUser().id,
      submittedAt: new Date(),
    });
    
    // Complete submission
    await altinn.completeProcess(instance.id);
    
    return {
      instanceId: instance.id,
      receipt: await this.generateReceipt(instance),
    };
  }
}
```

### Secure Document Handling

```bash
# Document model with NSM classification
xaheen model Document \
  id:uuid! \
  title:string \
  type:"form"|"report"|"certificate"|"letter" \
  classification:"OPEN"|"INTERNAL"|"RESTRICTED"|"CONFIDENTIAL" \
  content:binary \
  metadata:json \
  owner:string \
  sharedWith:"string[]"? \
  validFrom:datetime \
  validTo:datetime? \
  signature:json? \
  --audit \
  --compliance=gdpr,nsm \
  --encryption=at-rest

# Secure document viewer component
xaheen component SecureDocumentViewer \
  documentId:string \
  onDownload:"(document: Document) => void"? \
  onShare:"(document: Document) => void"? \
  --features=watermark,copy-protection,audit-logging \
  --compliance=nsm,wcag
```

### Multi-language Forms

```typescript
// Dynamic form with Norwegian/Nynorsk/English support
export function GovernmentForm({ 
  schema, 
  onSubmit 
}: { 
  schema: FormSchema;
  onSubmit: (data: any) => Promise<void>;
}) {
  const { t, i18n } = useTranslation();
  const [formData, setFormData] = useState({});
  const [errors, setErrors] = useState({});
  
  return (
    <form 
      onSubmit={handleSubmit}
      className="max-w-2xl mx-auto p-8 bg-white rounded-xl shadow-lg"
    >
      <h1 className="text-2xl font-bold mb-6">
        {t(`forms.${schema.id}.title`)}
      </h1>
      
      {schema.fields.map(field => (
        <FormField
          key={field.id}
          field={field}
          value={formData[field.id]}
          error={errors[field.id]}
          onChange={(value) => updateField(field.id, value)}
          language={i18n.language}
          required={field.required}
          help={t(`forms.${schema.id}.help.${field.id}`)}
        />
      ))}
      
      <div className="mt-8 flex gap-4">
        <button
          type="submit"
          className="px-6 py-3 bg-blue-600 text-white rounded-lg"
        >
          {t('common.submit')}
        </button>
        
        <button
          type="button"
          onClick={() => saveAsDraft(formData)}
          className="px-6 py-3 bg-gray-200 text-gray-800 rounded-lg"
        >
          {t('common.saveAsDraft')}
        </button>
      </div>
    </form>
  );
}
```

## Healthcare Management System

A GDPR-compliant healthcare system with patient management and appointment scheduling.

### Project Setup

```bash
xaheen init healthcare-system \
  --template=healthcare \
  --framework=next \
  --ui=xala \
  --features=appointments,records,messaging,prescriptions \
  --integrations=bankid,helsenorge,dips \
  --language=nb,en \
  --compliance=gdpr,nsm,wcag \
  --auth=bankid \
  --database=postgres \
  --security-level=confidential
```

### Patient Data Models

```bash
# Patient model with special GDPR category
xaheen model Patient \
  id:uuid! \
  personalNumber:string!@encrypted \
  name:string \
  dateOfBirth:date \
  gender:"male"|"female"|"other" \
  contactInfo:json@encrypted \
  medicalHistory:"MedicalRecord[]" \
  appointments:"Appointment[]" \
  consents:"HealthConsent[]" \
  --relations="appointments:hasMany,records:hasMany,consents:hasMany" \
  --audit \
  --compliance=gdpr-health \
  --retention=10years

# Medical record with audit trail
xaheen model MedicalRecord \
  id:uuid! \
  patientId:string \
  type:"consultation"|"test"|"procedure"|"prescription" \
  date:datetime \
  practitionerId:string \
  diagnosis:text?@encrypted \
  notes:text@encrypted \
  attachments:"string[]"? \
  classification:"CONFIDENTIAL" \
  accessLog:"AccessLogEntry[]" \
  --relations="patient:belongsTo,practitioner:belongsTo" \
  --audit \
  --compliance=gdpr-health,nsm-confidential
```

### Appointment Booking System

```typescript
// Appointment booking with availability check
export class AppointmentService {
  async bookAppointment(
    patientId: string,
    practitionerId: string,
    dateTime: Date,
    type: AppointmentType
  ): Promise<Appointment> {
    // Check practitioner availability
    const isAvailable = await this.checkAvailability(
      practitionerId,
      dateTime,
      type
    );
    
    if (!isAvailable) {
      throw new Error('Time slot not available');
    }
    
    // Create appointment
    const appointment = await db.appointment.create({
      data: {
        patientId,
        practitionerId,
        dateTime,
        type,
        duration: this.getAppointmentDuration(type),
        status: 'scheduled',
        remindersSent: [],
      },
    });
    
    // Send confirmation
    await this.sendConfirmation(appointment);
    
    // Schedule reminders
    await this.scheduleReminders(appointment);
    
    // Update calendar
    await this.updatePractitionerCalendar(appointment);
    
    return appointment;
  }
  
  async rescheduleAppointment(
    appointmentId: string,
    newDateTime: Date,
    reason: string
  ): Promise<Appointment> {
    // Audit log for compliance
    await auditLog.record({
      action: 'appointment_rescheduled',
      appointmentId,
      oldDateTime: appointment.dateTime,
      newDateTime,
      reason,
      performedBy: getCurrentUser().id,
    });
    
    // Update appointment
    return await db.appointment.update({
      where: { id: appointmentId },
      data: {
        dateTime: newDateTime,
        rescheduledAt: new Date(),
        rescheduledReason: reason,
      },
    });
  }
}
```

### Patient Portal

```bash
# Patient dashboard page
xaheen page PatientDashboard \
  --route=/patient/dashboard \
  --layout=authenticated \
  --auth=bankid \
  --features=appointments,medical-records,prescriptions,messages \
  --components=UpcomingAppointments,HealthSummary,QuickActions

# Medical records viewer
xaheen component MedicalRecordsViewer \
  patientId:string \
  records:"MedicalRecord[]" \
  onViewRecord:"(record: MedicalRecord) => void" \
  onDownload:"(record: MedicalRecord) => void"? \
  onShare:"(record: MedicalRecord, recipient: string) => void"? \
  --features=timeline-view,filtering,search,export \
  --compliance=gdpr-health,wcag

# Appointment calendar
xaheen component AppointmentCalendar \
  appointments:"Appointment[]" \
  onSelectDate:"(date: Date) => void" \
  onBookAppointment:"(slot: TimeSlot) => void" \
  onReschedule:"(appointment: Appointment) => void" \
  viewMode:"month"|"week"|"day" \
  --features=availability-display,conflict-detection,reminder-settings \
  --compliance=wcag-aaa
```

### Health Data Compliance

```typescript
// GDPR-compliant health data handling
export class HealthDataProtection {
  // Special category data encryption
  async encryptHealthData(data: any): Promise<EncryptedData> {
    // Use stronger encryption for health data
    const key = await this.getHealthDataKey();
    const encrypted = await crypto.encrypt(data, {
      algorithm: 'aes-256-gcm',
      key,
      additionalData: {
        category: 'health',
        timestamp: new Date(),
      },
    });
    
    return encrypted;
  }
  
  // Consent management for health data
  async requestHealthConsent(
    patientId: string,
    purpose: HealthDataPurpose
  ): Promise<Consent> {
    const consent = await db.healthConsent.create({
      data: {
        patientId,
        purpose: purpose.type,
        scope: purpose.scope,
        description: purpose.description,
        lawfulBasis: 'explicit_consent', // Required for health data
        duration: purpose.duration || 365, // days
        canWithdraw: true,
        givenAt: new Date(),
      },
    });
    
    // Send confirmation to patient
    await this.sendConsentConfirmation(consent);
    
    return consent;
  }
  
  // Data retention for health records
  async enforceRetentionPolicy(): Promise<void> {
    // Norwegian law: 10 years after last treatment
    const retentionDate = new Date();
    retentionDate.setFullYear(retentionDate.getFullYear() - 10);
    
    // Find records to archive
    const recordsToArchive = await db.medicalRecord.findMany({
      where: {
        lastAccessedAt: { lt: retentionDate },
        archived: false,
      },
    });
    
    // Archive records (not delete)
    for (const record of recordsToArchive) {
      await this.archiveHealthRecord(record);
    }
  }
}
```

### Integration with Norwegian Health Services

```typescript
// Helsenorge integration
export class HelsenorgeIntegration {
  async syncPatientData(personalNumber: string): Promise<void> {
    // Authenticate with Helsenorge
    const token = await this.authenticate();
    
    // Fetch patient data
    const helsenorgeData = await this.fetchPatientData(
      personalNumber,
      token
    );
    
    // Map to local format
    const mappedData = this.mapHelsenorgeData(helsenorgeData);
    
    // Update local records
    await db.patient.update({
      where: { personalNumber },
      data: {
        helsenorgeId: helsenorgeData.id,
        lastSyncedAt: new Date(),
        externalData: mappedData,
      },
    });
  }
  
  async sendPrescription(
    prescription: Prescription
  ): Promise<PrescriptionResult> {
    // Validate prescription
    await this.validatePrescription(prescription);
    
    // Send to e-resept
    const result = await this.ereseptClient.send({
      patient: {
        personalNumber: prescription.patient.personalNumber,
        name: prescription.patient.name,
      },
      medication: prescription.medication,
      dosage: prescription.dosage,
      prescribedBy: prescription.practitioner,
      validUntil: prescription.validUntil,
    });
    
    return result;
  }
}
```

## Financial Services Application

A secure financial platform with transaction management and regulatory compliance.

### Project Setup

```bash
xaheen init financial-platform \
  --template=financial \
  --framework=next \
  --ui=xala \
  --features=accounts,transactions,reporting,kyc \
  --integrations=bankid,vipps,stripe,sbm \
  --language=nb,en \
  --compliance=gdpr,pci,nsm \
  --auth=bankid \
  --database=postgres \
  --security-level=confidential
```

### Financial Models

```bash
# Account model with balance tracking
xaheen model Account \
  id:uuid! \
  accountNumber:string! \
  customerId:string \
  type:"checking"|"savings"|"investment" \
  currency:"NOK"|"EUR"|"USD" \
  balance:decimal@precision:2 \
  availableBalance:decimal@precision:2 \
  status:"active"|"frozen"|"closed" \
  transactions:"Transaction[]" \
  --relations="customer:belongsTo,transactions:hasMany" \
  --audit \
  --compliance=pci,nsm

# Transaction model with double-entry
xaheen model Transaction \
  id:uuid! \
  referenceNumber:string! \
  fromAccountId:string \
  toAccountId:string \
  amount:decimal@precision:2 \
  currency:"NOK"|"EUR"|"USD" \
  type:"transfer"|"payment"|"withdrawal"|"deposit" \
  status:"pending"|"completed"|"failed"|"reversed" \
  description:string \
  metadata:json? \
  executedAt:datetime? \
  --relations="fromAccount:belongsTo,toAccount:belongsTo" \
  --audit \
  --compliance=pci
```

### KYC Implementation

```typescript
// Know Your Customer compliance
export class KYCService {
  async performKYC(
    customer: CustomerData
  ): Promise<KYCResult> {
    const checks: KYCCheck[] = [];
    
    // Identity verification
    const identityCheck = await this.verifyIdentity({
      personalNumber: customer.personalNumber,
      name: customer.name,
      dateOfBirth: customer.dateOfBirth,
    });
    checks.push(identityCheck);
    
    // Address verification
    const addressCheck = await this.verifyAddress({
      address: customer.address,
      postalCode: customer.postalCode,
      city: customer.city,
    });
    checks.push(addressCheck);
    
    // Sanctions screening
    const sanctionsCheck = await this.screenSanctions({
      name: customer.name,
      personalNumber: customer.personalNumber,
      nationality: customer.nationality,
    });
    checks.push(sanctionsCheck);
    
    // PEP check (Politically Exposed Person)
    const pepCheck = await this.checkPEP(customer);
    checks.push(pepCheck);
    
    // Calculate risk score
    const riskScore = this.calculateRiskScore(checks);
    
    // Store KYC result
    const result = await db.kycResult.create({
      data: {
        customerId: customer.id,
        checks,
        riskScore,
        status: riskScore < 50 ? 'approved' : 'manual_review',
        performedAt: new Date(),
        expiresAt: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000),
      },
    });
    
    return result;
  }
}
```

### Transaction Processing

```typescript
// Secure transaction processing
export class TransactionProcessor {
  async processTransaction(
    transaction: TransactionRequest
  ): Promise<TransactionResult> {
    // Start distributed transaction
    const dbTx = await db.$transaction(async (tx) => {
      // Lock accounts
      const [fromAccount, toAccount] = await Promise.all([
        tx.account.findUnique({
          where: { id: transaction.fromAccountId },
          lock: true,
        }),
        tx.account.findUnique({
          where: { id: transaction.toAccountId },
          lock: true,
        }),
      ]);
      
      // Validate transaction
      await this.validateTransaction(transaction, fromAccount, toAccount);
      
      // Check compliance
      await this.checkCompliance(transaction);
      
      // Update balances
      await tx.account.update({
        where: { id: fromAccount.id },
        data: {
          balance: fromAccount.balance - transaction.amount,
          availableBalance: fromAccount.availableBalance - transaction.amount,
        },
      });
      
      await tx.account.update({
        where: { id: toAccount.id },
        data: {
          balance: toAccount.balance + transaction.amount,
          availableBalance: toAccount.availableBalance + transaction.amount,
        },
      });
      
      // Create transaction record
      const txRecord = await tx.transaction.create({
        data: {
          ...transaction,
          status: 'completed',
          executedAt: new Date(),
        },
      });
      
      // Audit log
      await tx.auditLog.create({
        data: {
          action: 'transaction_processed',
          entityId: txRecord.id,
          entityType: 'transaction',
          performedBy: getCurrentUser().id,
          details: {
            amount: transaction.amount,
            fromAccount: fromAccount.accountNumber,
            toAccount: toAccount.accountNumber,
          },
        },
      });
      
      return txRecord;
    });
    
    // Send notifications
    await this.sendTransactionNotifications(dbTx);
    
    // Report to authorities if required
    if (this.requiresReporting(dbTx)) {
      await this.reportToAuthorities(dbTx);
    }
    
    return dbTx;
  }
}
```

### Financial Dashboard

```bash
# Account overview component
xaheen component AccountOverview \
  accounts:"Account[]" \
  onSelectAccount:"(account: Account) => void" \
  onTransfer:"() => void" \
  currency:"NOK"|"EUR"|"USD" \
  --features=balance-display,quick-actions,mini-charts \
  --compliance=pci

# Transaction history with filtering
xaheen component TransactionHistory \
  accountId:string \
  transactions:"Transaction[]" \
  onFilter:"(filters: TransactionFilters) => void" \
  onExport:"(format: 'csv'|'pdf') => void" \
  onViewDetails:"(transaction: Transaction) => void" \
  --features=date-range,search,categorization,export \
  --compliance=pci,gdpr

# Financial reports
xaheen page FinancialReports \
  --route=/reports \
  --auth=required \
  --features=income-statement,balance-sheet,cash-flow,custom-reports \
  --components=ReportBuilder,ChartViewer,ExportOptions
```

## Educational Platform

A comprehensive e-learning platform with course management and student tracking.

### Project Setup

```bash
xaheen init edu-platform \
  --template=education \
  --framework=next \
  --ui=xala \
  --features=courses,assignments,grading,discussions \
  --integrations=feide,canvas,zoom \
  --language=nb,en,ar \
  --compliance=gdpr,wcag \
  --auth=feide \
  --database=postgres
```

### Course Management

```bash
# Course model with modules
xaheen model Course \
  id:uuid! \
  code:string! \
  title:string \
  titleEn:string? \
  titleAr:string? \
  description:text \
  credits:integer \
  level:"bachelor"|"master"|"phd" \
  language:"nb"|"en"|"ar" \
  startDate:date \
  endDate:date \
  modules:"Module[]" \
  enrollments:"Enrollment[]" \
  --relations="modules:hasMany,enrollments:hasMany,instructors:manyToMany" \
  --audit

# Assignment with submissions
xaheen model Assignment \
  id:uuid! \
  courseId:string \
  title:string \
  description:text \
  dueDate:datetime \
  points:integer \
  type:"individual"|"group" \
  submissions:"Submission[]" \
  rubric:json? \
  --relations="course:belongsTo,submissions:hasMany" \
  --features=file-upload,plagiarism-check,peer-review
```

### Student Portal

```typescript
// Course enrollment system
export class EnrollmentService {
  async enrollStudent(
    studentId: string,
    courseId: string
  ): Promise<Enrollment> {
    // Check prerequisites
    const prerequisites = await this.checkPrerequisites(
      studentId,
      courseId
    );
    
    if (!prerequisites.met) {
      throw new Error(
        `Missing prerequisites: ${prerequisites.missing.join(', ')}`
      );
    }
    
    // Check capacity
    const enrolled = await db.enrollment.count({
      where: { courseId, status: 'active' },
    });
    
    const course = await db.course.findUnique({
      where: { id: courseId },
    });
    
    if (enrolled >= course.capacity) {
      // Add to waiting list
      return await this.addToWaitingList(studentId, courseId);
    }
    
    // Create enrollment
    const enrollment = await db.enrollment.create({
      data: {
        studentId,
        courseId,
        status: 'active',
        enrolledAt: new Date(),
      },
    });
    
    // Grant course access
    await this.grantCourseAccess(enrollment);
    
    // Send confirmation
    await this.sendEnrollmentConfirmation(enrollment);
    
    return enrollment;
  }
}
```

### Multi-language Course Content

```tsx
// RTL-aware course viewer
export function CourseContent({ 
  module, 
  language 
}: { 
  module: Module;
  language: 'nb' | 'en' | 'ar';
}) {
  const isRTL = language === 'ar';
  const content = module.content[language] || module.content.nb;
  
  return (
    <div
      dir={isRTL ? 'rtl' : 'ltr'}
      className={`max-w-4xl mx-auto p-8 ${isRTL ? 'text-right' : 'text-left'}`}
    >
      <h1 className="text-3xl font-bold mb-6">
        {module.title[language] || module.title.nb}
      </h1>
      
      <div className="prose prose-lg">
        <MDXContent content={content} />
      </div>
      
      {module.videos && (
        <div className="mt-8">
          <VideoPlayer
            src={module.videos[language] || module.videos.nb}
            subtitles={module.subtitles}
            rtl={isRTL}
          />
        </div>
      )}
      
      {module.resources && (
        <ResourceList
          resources={module.resources}
          language={language}
          rtl={isRTL}
        />
      )}
    </div>
  );
}
```

### Assignment Submission

```bash
# Assignment submission component
xaheen component AssignmentSubmission \
  assignment:Assignment \
  studentId:string \
  onSubmit:"(submission: SubmissionData) => Promise<void>" \
  onSaveDraft:"(draft: DraftData) => void" \
  --features=file-upload,rich-text-editor,auto-save,submission-history \
  --compliance=gdpr

# Grading interface
xaheen component GradingInterface \
  submissions:"Submission[]" \
  rubric:Rubric \
  onGrade:"(submissionId: string, grade: Grade) => Promise<void>" \
  onFeedback:"(submissionId: string, feedback: string) => void" \
  --features=inline-comments,rubric-grading,bulk-actions,export
```

## Multi-tenant SaaS Application

A scalable SaaS platform with tenant isolation and subscription management.

### Project Setup

```bash
xaheen init saas-platform \
  --template=saas \
  --framework=next \
  --ui=xala \
  --features=multitenancy,billing,analytics,api \
  --integrations=stripe,slack,segment \
  --language=nb,en,fr \
  --compliance=gdpr,soc2 \
  --auth=auth0 \
  --database=postgres
```

### Multi-tenancy Implementation

```typescript
// Tenant isolation middleware
export class TenantMiddleware {
  async handle(req: Request, res: Response, next: NextFunction) {
    // Extract tenant from subdomain or header
    const tenant = this.extractTenant(req);
    
    if (!tenant) {
      return res.status(404).json({ error: 'Tenant not found' });
    }
    
    // Verify tenant status
    const tenantData = await db.tenant.findUnique({
      where: { slug: tenant },
    });
    
    if (!tenantData || tenantData.status !== 'active') {
      return res.status(403).json({ error: 'Tenant inactive' });
    }
    
    // Set tenant context
    req.tenant = tenantData;
    
    // Apply row-level security
    db.$use(async (params, next) => {
      if (params.model && this.isTenantScoped(params.model)) {
        if (params.action === 'create') {
          params.args.data.tenantId = tenantData.id;
        } else if (['findMany', 'findFirst', 'findUnique', 'update', 'delete'].includes(params.action)) {
          params.args.where = {
            ...params.args.where,
            tenantId: tenantData.id,
          };
        }
      }
      
      return next(params);
    });
    
    next();
  }
  
  private extractTenant(req: Request): string | null {
    // From subdomain: tenant.app.com
    const subdomain = req.hostname.split('.')[0];
    if (subdomain !== 'app' && subdomain !== 'www') {
      return subdomain;
    }
    
    // From header: X-Tenant-ID
    return req.headers['x-tenant-id'] as string || null;
  }
}
```

### Subscription Management

```typescript
// Subscription service with Stripe
export class SubscriptionService {
  async createSubscription(
    tenantId: string,
    planId: string,
    paymentMethodId: string
  ): Promise<Subscription> {
    const tenant = await db.tenant.findUnique({
      where: { id: tenantId },
      include: { stripeCustomer: true },
    });
    
    // Create or retrieve Stripe customer
    let customerId = tenant.stripeCustomerId;
    if (!customerId) {
      const customer = await stripe.customers.create({
        email: tenant.email,
        name: tenant.name,
        metadata: { tenantId },
      });
      customerId = customer.id;
      
      await db.tenant.update({
        where: { id: tenantId },
        data: { stripeCustomerId: customerId },
      });
    }
    
    // Attach payment method
    await stripe.paymentMethods.attach(paymentMethodId, {
      customer: customerId,
    });
    
    // Create subscription
    const stripeSubscription = await stripe.subscriptions.create({
      customer: customerId,
      items: [{ price: planId }],
      payment_behavior: 'default_incomplete',
      expand: ['latest_invoice.payment_intent'],
    });
    
    // Store subscription
    const subscription = await db.subscription.create({
      data: {
        tenantId,
        stripeSubscriptionId: stripeSubscription.id,
        stripePriceId: planId,
        status: stripeSubscription.status,
        currentPeriodStart: new Date(stripeSubscription.current_period_start * 1000),
        currentPeriodEnd: new Date(stripeSubscription.current_period_end * 1000),
      },
    });
    
    // Update tenant limits
    await this.updateTenantLimits(tenantId, planId);
    
    return subscription;
  }
  
  async enforceUsageLimits(
    tenantId: string,
    resource: string
  ): Promise<boolean> {
    const usage = await db.usage.findFirst({
      where: {
        tenantId,
        resource,
        period: this.getCurrentPeriod(),
      },
    });
    
    const limits = await this.getTenantLimits(tenantId);
    
    if (usage && usage.count >= limits[resource]) {
      // Send notification about limit
      await this.notifyLimitReached(tenantId, resource);
      return false;
    }
    
    // Increment usage
    await db.usage.upsert({
      where: {
        tenantId_resource_period: {
          tenantId,
          resource,
          period: this.getCurrentPeriod(),
        },
      },
      update: { count: { increment: 1 } },
      create: {
        tenantId,
        resource,
        period: this.getCurrentPeriod(),
        count: 1,
      },
    });
    
    return true;
  }
}
```

### Tenant Dashboard

```bash
# Tenant admin dashboard
xaheen page TenantDashboard \
  --route=/admin \
  --layout=admin \
  --auth=required \
  --features=usage-metrics,team-management,billing,settings \
  --components=UsageChart,TeamList,BillingOverview,SettingsForm

# Usage analytics component
xaheen component UsageAnalytics \
  tenantId:string \
  dateRange:DateRange \
  metrics:"MetricData[]" \
  onExport:"(data: MetricData[]) => void" \
  --features=real-time-updates,comparison,predictions,alerts

# Team management
xaheen component TeamManagement \
  tenantId:string \
  members:"TeamMember[]" \
  onInvite:"(email: string, role: Role) => Promise<void>" \
  onUpdateRole:"(memberId: string, role: Role) => Promise<void>" \
  onRemove:"(memberId: string) => Promise<void>" \
  --features=bulk-invite,role-management,activity-log
```

## Real Estate Platform

A property listing and management platform with virtual tours and document handling.

### Project Setup

```bash
xaheen init real-estate-platform \
  --template=marketplace \
  --framework=next \
  --ui=xala \
  --features=listings,search,tours,documents,messaging \
  --integrations=finn,google-maps,calendly \
  --language=nb,en \
  --compliance=gdpr,wcag \
  --auth=vipps \
  --database=postgres
```

### Property Listings

```bash
# Property model with location
xaheen model Property \
  id:uuid! \
  finnCode:string? \
  title:string \
  description:text \
  type:"apartment"|"house"|"cabin"|"commercial" \
  price:decimal \
  size:decimal \
  rooms:integer \
  bedrooms:integer \
  bathrooms:integer \
  yearBuilt:integer \
  address:json \
  coordinates:json \
  images:"PropertyImage[]" \
  virtualTour:string? \
  features:"string[]" \
  --relations="owner:belongsTo,viewings:hasMany,documents:hasMany" \
  --indexes=price,size,location \
  --features=geospatial-search

# Property search component
xaheen component PropertySearch \
  onSearch:"(filters: SearchFilters) => void" \
  onMapUpdate:"(bounds: MapBounds) => void" \
  savedSearches:"SavedSearch[]"? \
  --features=location-autocomplete,price-slider,map-integration,saved-searches
```

### Virtual Tours

```typescript
// 360° virtual tour component
export function VirtualTour({ 
  propertyId, 
  tourUrl 
}: { 
  propertyId: string;
  tourUrl: string;
}) {
  const [viewer, setViewer] = useState(null);
  const [hotspots, setHotspots] = useState<Hotspot[]>([]);
  
  useEffect(() => {
    // Initialize 360 viewer
    const viewer = new Viewer({
      container: 'tour-container',
      panorama: tourUrl,
      autorotate: true,
      hotspots: hotspots,
    });
    
    setViewer(viewer);
    
    // Track viewing analytics
    analytics.track('virtual_tour_started', {
      propertyId,
      timestamp: new Date(),
    });
    
    return () => viewer.destroy();
  }, [tourUrl]);
  
  const addHotspot = (position: Position, info: HotspotInfo) => {
    const hotspot = {
      id: generateId(),
      position,
      info,
      icon: 'info',
    };
    
    setHotspots([...hotspots, hotspot]);
    viewer.addHotspot(hotspot);
  };
  
  return (
    <div className="relative w-full h-[600px]">
      <div id="tour-container" className="w-full h-full" />
      
      <div className="absolute top-4 left-4 space-y-2">
        <button
          onClick={() => viewer.toggleAutorotate()}
          className="px-4 py-2 bg-white rounded-lg shadow-md"
        >
          Auto-rotate
        </button>
        
        <button
          onClick={() => viewer.toggleFullscreen()}
          className="px-4 py-2 bg-white rounded-lg shadow-md"
        >
          Fullscreen
        </button>
      </div>
      
      <TourNavigation
        rooms={property.rooms}
        onNavigate={(room) => viewer.goToRoom(room)}
      />
    </div>
  );
}
```

### Document Management

```bash
# Property documents
xaheen model PropertyDocument \
  id:uuid! \
  propertyId:string \
  type:"energy-certificate"|"floor-plan"|"regulation"|"inspection" \
  title:string \
  fileUrl:string \
  validUntil:date? \
  public:boolean \
  --relations="property:belongsTo" \
  --audit \
  --compliance=gdpr

# Document viewer component
xaheen component DocumentViewer \
  documents:"PropertyDocument[]" \
  onView:"(document: PropertyDocument) => void" \
  onDownload:"(document: PropertyDocument) => void" \
  onShare:"(document: PropertyDocument) => void"? \
  userRole:"buyer"|"seller"|"agent" \
  --features=pdf-viewer,download-protection,watermark
```

### Viewing Scheduler

```typescript
// Property viewing scheduling
export class ViewingScheduler {
  async scheduleViewing(
    propertyId: string,
    requestorId: string,
    preferredTimes: Date[]
  ): Promise<Viewing> {
    const property = await db.property.findUnique({
      where: { id: propertyId },
      include: { agent: true },
    });
    
    // Check agent availability
    const availableSlot = await this.findAvailableSlot(
      property.agentId,
      preferredTimes
    );
    
    if (!availableSlot) {
      throw new Error('No available time slots');
    }
    
    // Create viewing
    const viewing = await db.viewing.create({
      data: {
        propertyId,
        requestorId,
        agentId: property.agentId,
        scheduledAt: availableSlot,
        status: 'scheduled',
        meetingPoint: property.address,
      },
    });
    
    // Send confirmations
    await Promise.all([
      this.sendViewingConfirmation(viewing, 'requestor'),
      this.sendViewingConfirmation(viewing, 'agent'),
      this.addToCalendar(viewing),
    ]);
    
    // Set reminder
    await this.scheduleReminder(viewing);
    
    return viewing;
  }
}
```

## Event Management System

A comprehensive event platform with ticketing and attendee management.

### Project Setup

```bash
xaheen init event-platform \
  --template=events \
  --framework=next \
  --ui=xala \
  --features=events,tickets,check-in,analytics \
  --integrations=vipps,ticketmaster,mailgun \
  --language=nb,en \
  --compliance=gdpr,wcag \
  --auth=vipps \
  --database=postgres
```

### Event Management

```bash
# Event model
xaheen model Event \
  id:uuid! \
  title:string \
  slug:string! \
  description:text \
  startDate:datetime \
  endDate:datetime \
  venue:json \
  capacity:integer \
  price:decimal \
  earlyBirdPrice:decimal? \
  earlyBirdDeadline:datetime? \
  status:"draft"|"published"|"sold-out"|"cancelled" \
  tickets:"Ticket[]" \
  --relations="organizer:belongsTo,tickets:hasMany,sponsors:manyToMany" \
  --features=recurring-events,waitlist

# Ticket purchase flow
xaheen component TicketPurchase \
  event:Event \
  onSelectTickets:"(tickets: TicketSelection[]) => void" \
  onPurchase:"(order: OrderData) => Promise<void>" \
  availableTickets:number \
  --features=seat-selection,group-booking,promo-codes,countdown
```

### QR Code Check-in

```typescript
// Mobile check-in system
export function CheckInScanner({ eventId }: { eventId: string }) {
  const [scanning, setScanning] = useState(false);
  const [lastScan, setLastScan] = useState<CheckInResult | null>(null);
  
  const handleScan = async (code: string) => {
    try {
      const result = await checkInService.processCheckIn({
        eventId,
        ticketCode: code,
        checkInTime: new Date(),
        checkInBy: getCurrentUser().id,
      });
      
      setLastScan(result);
      
      // Play sound based on result
      if (result.success) {
        playSound('success');
      } else {
        playSound('error');
      }
      
      // Auto-reset after 3 seconds
      setTimeout(() => setLastScan(null), 3000);
    } catch (error) {
      console.error('Check-in failed:', error);
      playSound('error');
    }
  };
  
  return (
    <div className="min-h-screen bg-gray-100 p-4">
      <div className="max-w-md mx-auto">
        <h1 className="text-2xl font-bold mb-4">Event Check-in</h1>
        
        {scanning ? (
          <QRScanner
            onScan={handleScan}
            onError={(error) => console.error(error)}
          />
        ) : (
          <button
            onClick={() => setScanning(true)}
            className="w-full h-48 bg-blue-600 text-white rounded-xl flex items-center justify-center"
          >
            <Camera className="w-12 h-12 mr-2" />
            <span className="text-xl">Start Scanning</span>
          </button>
        )}
        
        {lastScan && (
          <CheckInResult
            result={lastScan}
            onDismiss={() => setLastScan(null)}
          />
        )}
        
        <CheckInStats eventId={eventId} />
      </div>
    </div>
  );
}
```

### Event Analytics

```bash
# Analytics dashboard
xaheen page EventAnalytics \
  --route=/events/[id]/analytics \
  --auth=required \
  --features=ticket-sales,attendance,revenue,demographics \
  --components=SalesChart,AttendeeMap,RevenueBreakdown,ExportOptions

# Real-time attendee tracking
xaheen component AttendeeTracker \
  eventId:string \
  attendees:"Attendee[]" \
  capacity:number \
  onRefresh:"() => void" \
  --features=real-time-updates,check-in-progress,no-shows,statistics
```

## IoT Dashboard

A real-time IoT monitoring dashboard with device management.

### Project Setup

```bash
xaheen init iot-dashboard \
  --template=dashboard \
  --framework=next \
  --ui=xala \
  --features=devices,monitoring,alerts,automation \
  --integrations=mqtt,webhook,grafana \
  --language=nb,en \
  --compliance=gdpr,nsm \
  --auth=auth0 \
  --database=postgres \
  --realtime=websocket
```

### Device Management

```typescript
// IoT device model and service
export class DeviceService {
  private mqtt: MQTTClient;
  private devices: Map<string, DeviceConnection>;
  
  async registerDevice(device: DeviceRegistration): Promise<Device> {
    // Generate device credentials
    const credentials = await this.generateDeviceCredentials(device);
    
    // Create device record
    const registered = await db.device.create({
      data: {
        ...device,
        apiKey: credentials.apiKey,
        secret: encrypt(credentials.secret),
        status: 'registered',
        lastSeen: null,
      },
    });
    
    // Set up MQTT topic
    this.mqtt.subscribe(`devices/${registered.id}/+`, (topic, message) => {
      this.handleDeviceMessage(registered.id, topic, message);
    });
    
    return registered;
  }
  
  async handleDeviceMessage(
    deviceId: string,
    topic: string,
    message: Buffer
  ): Promise<void> {
    const data = JSON.parse(message.toString());
    const messageType = topic.split('/').pop();
    
    switch (messageType) {
      case 'telemetry':
        await this.processTelemetry(deviceId, data);
        break;
      case 'status':
        await this.updateDeviceStatus(deviceId, data);
        break;
      case 'alert':
        await this.processAlert(deviceId, data);
        break;
    }
    
    // Update last seen
    await db.device.update({
      where: { id: deviceId },
      data: { lastSeen: new Date() },
    });
  }
  
  async sendCommand(
    deviceId: string,
    command: DeviceCommand
  ): Promise<void> {
    // Validate device is online
    const device = await this.getDevice(deviceId);
    if (device.status !== 'online') {
      throw new Error('Device is offline');
    }
    
    // Send command
    await this.mqtt.publish(
      `devices/${deviceId}/commands`,
      JSON.stringify({
        id: generateId(),
        command: command.type,
        params: command.params,
        timestamp: new Date(),
      })
    );
    
    // Log command
    await db.deviceCommand.create({
      data: {
        deviceId,
        command: command.type,
        params: command.params,
        sentBy: getCurrentUser().id,
        sentAt: new Date(),
      },
    });
  }
}
```

### Real-time Monitoring

```tsx
// Real-time device monitoring dashboard
export function DeviceMonitor({ devices }: { devices: Device[] }) {
  const [telemetry, setTelemetry] = useState<Map<string, TelemetryData>>(new Map());
  const [alerts, setAlerts] = useState<Alert[]>([]);
  
  useEffect(() => {
    // Connect to WebSocket
    const ws = new WebSocket(process.env.NEXT_PUBLIC_WS_URL!);
    
    ws.on('telemetry', (data: TelemetryUpdate) => {
      setTelemetry(prev => new Map(prev).set(data.deviceId, data.telemetry));
    });
    
    ws.on('alert', (alert: Alert) => {
      setAlerts(prev => [alert, ...prev].slice(0, 50)); // Keep last 50
      
      // Show notification for critical alerts
      if (alert.severity === 'critical') {
        showNotification({
          title: 'Critical Alert',
          message: alert.message,
          type: 'error',
        });
      }
    });
    
    return () => ws.close();
  }, []);
  
  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      {/* Device List */}
      <div className="lg:col-span-1">
        <DeviceList
          devices={devices}
          telemetry={telemetry}
          onSelectDevice={setSelectedDevice}
        />
      </div>
      
      {/* Main Display */}
      <div className="lg:col-span-2 space-y-6">
        {selectedDevice && (
          <>
            <DeviceTelemetry
              device={selectedDevice}
              data={telemetry.get(selectedDevice.id)}
            />
            
            <DeviceControls
              device={selectedDevice}
              onSendCommand={sendCommand}
            />
            
            <DeviceHistory
              deviceId={selectedDevice.id}
              timeRange={timeRange}
            />
          </>
        )}
      </div>
      
      {/* Alerts Sidebar */}
      <div className="lg:col-span-3">
        <AlertsList
          alerts={alerts}
          onAcknowledge={acknowledgeAlert}
          onResolve={resolveAlert}
        />
      </div>
    </div>
  );
}
```

### Automation Rules

```bash
# Automation rule builder
xaheen component AutomationBuilder \
  devices:"Device[]" \
  onSave:"(rule: AutomationRule) => Promise<void>" \
  existingRules:"AutomationRule[]" \
  --features=condition-builder,action-selector,schedule-config,testing

# Rule engine implementation
xaheen service AutomationEngine \
  --type=business \
  --methods=evaluateRules,executeActions,scheduleRules,testRule \
  --features=event-driven,time-based,threshold-based
```

## Social Platform

A social networking platform with content moderation and engagement features.

### Project Setup

```bash
xaheen init social-platform \
  --template=social \
  --framework=next \
  --ui=xala \
  --features=posts,comments,messaging,notifications \
  --integrations=cloudinary,pusher,openai \
  --language=nb,en \
  --compliance=gdpr,wcag \
  --auth=auth0 \
  --database=postgres \
  --cache=redis
```

### Content Management

```typescript
// Content moderation service
export class ModerationService {
  private openai: OpenAIClient;
  
  async moderateContent(
    content: string,
    type: 'post' | 'comment' | 'message'
  ): Promise<ModerationResult> {
    // AI moderation
    const aiResult = await this.openai.moderate(content);
    
    // Custom rules
    const customResult = await this.applyCustomRules(content);
    
    // Combine results
    const violations = [
      ...aiResult.violations,
      ...customResult.violations,
    ];
    
    if (violations.length > 0) {
      // Auto-hide if severe
      const severity = Math.max(...violations.map(v => v.severity));
      if (severity >= 8) {
        return {
          allowed: false,
          reason: 'Content violates community guidelines',
          violations,
        };
      }
      
      // Flag for review
      await this.flagForReview({
        content,
        type,
        violations,
        timestamp: new Date(),
      });
    }
    
    return {
      allowed: true,
      violations,
      warnings: this.generateWarnings(violations),
    };
  }
  
  async applyCustomRules(content: string): Promise<CustomRuleResult> {
    const violations = [];
    
    // Norwegian-specific rules
    if (this.containsNorwegianProfanity(content)) {
      violations.push({
        type: 'profanity',
        severity: 5,
        match: 'Norwegian profanity detected',
      });
    }
    
    // Personal information
    if (this.containsPersonalInfo(content)) {
      violations.push({
        type: 'personal_info',
        severity: 7,
        match: 'Personal information detected',
      });
    }
    
    return { violations };
  }
}
```

### Real-time Features

```tsx
// Real-time chat with typing indicators
export function ChatRoom({ roomId }: { roomId: string }) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [typing, setTyping] = useState<Map<string, User>>(new Map());
  const pusher = usePusher();
  
  useEffect(() => {
    // Subscribe to room channel
    const channel = pusher.subscribe(`chat-${roomId}`);
    
    channel.bind('message', (data: Message) => {
      setMessages(prev => [...prev, data]);
    });
    
    channel.bind('typing', (data: TypingEvent) => {
      setTyping(prev => {
        const updated = new Map(prev);
        if (data.isTyping) {
          updated.set(data.userId, data.user);
        } else {
          updated.delete(data.userId);
        }
        return updated;
      });
    });
    
    return () => {
      pusher.unsubscribe(`chat-${roomId}`);
    };
  }, [roomId]);
  
  const sendMessage = async (content: string) => {
    // Moderate content
    const moderation = await moderationService.moderateContent(
      content,
      'message'
    );
    
    if (!moderation.allowed) {
      showError(moderation.reason);
      return;
    }
    
    // Send message
    await api.sendMessage({
      roomId,
      content,
      attachments: [],
    });
  };
  
  return (
    <div className="flex flex-col h-full">
      <MessageList messages={messages} />
      
      {typing.size > 0 && (
        <TypingIndicator users={Array.from(typing.values())} />
      )}
      
      <MessageInput
        onSend={sendMessage}
        onTyping={(isTyping) => {
          pusher.trigger(`chat-${roomId}`, 'typing', {
            userId: getCurrentUser().id,
            user: getCurrentUser(),
            isTyping,
          });
        }}
      />
    </div>
  );
}
```

### Engagement Features

```bash
# Content recommendation engine
xaheen service RecommendationEngine \
  --type=ai \
  --methods=getForYou,getSimilar,getTrending,getPersonalized \
  --features=collaborative-filtering,content-based,hybrid

# Notification system
xaheen component NotificationCenter \
  notifications:"Notification[]" \
  onMarkRead:"(ids: string[]) => void" \
  onSettings:"() => void" \
  preferences:NotificationPreferences \
  --features=real-time,grouping,actions,preferences
```

---

> **For Agents**: These real-world examples demonstrate comprehensive implementations of various application types using the Xaheen platform. Each example showcases proper use of commands, integrations, compliance features, and best practices. Use these as templates when helping users build similar applications, adapting the patterns to their specific requirements.