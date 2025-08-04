# Xala UI CLI - Implementation Examples

## Complete Real-World Scenarios

### 1. Healthcare SaaS Application

#### Scenario: Building a HIPAA-compliant patient management system

```bash
# Step 1: Create Xaheen project with healthcare template
xaheen create medcare-app --template healthcare --compliance hipaa --features auth,patients,appointments,billing

# Step 2: Navigate to project and integrate Xala UI
cd medcare-app
xala xaheen init --theme healthcare --compliance hipaa,wcag-aaa --interactive

# Interactive prompts:
? Select compliance level: HIPAA + WCAG AAA
? Choose color scheme: Medical Blue (#0066cc)
? Enable audit logging: Yes
? Setup patient data encryption: Yes
? Configure role-based access: Yes (Doctor, Nurse, Admin, Patient)

# Step 3: Generate patient management system
./xaheen-xala.sh generate fullstack PatientManagement

# This creates:
# Backend:
# - models/Patient.js (encrypted fields)
# - controllers/PatientController.js (HIPAA audit logs)
# - routes/patient-routes.js (role-based access)
# - middleware/hipaa-compliance.js

# Frontend:
# - components/PatientList.tsx (accessible table)
# - components/PatientForm.tsx (encrypted form fields)
# - components/PatientProfile.tsx (audit trail display)
# - pages/patients/index.tsx (main patient dashboard)

# Step 4: Generate appointment booking system
./xaheen-xala.sh generate fullstack AppointmentBooking

# Step 5: Start unified development
./xaheen-xala.sh dev
# Starts:
# - NestJS backend on port 3001
# - Next.js frontend on port 3000  
# - Xala UI hot-reload system
# - HIPAA compliance monitoring
```

**Generated Patient Component (Healthcare Theme):**

```typescript
// src/components/PatientForm.tsx - Generated with healthcare compliance
import React from 'react';
import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from '@/lib/utils';

const formVariants = cva([
  'w-full',
  'max-w-2xl',
  'mx-auto',
  'p-8',
  'bg-white',
  'rounded-xl',
  'shadow-lg',
  'border',
  'border-medical-200'
], {
  variants: {
    urgency: {
      normal: ['border-medical-200'],
      urgent: ['border-medical-warning-400'],
      critical: ['border-medical-error-500', 'bg-medical-error-50']
    }
  },
  defaultVariants: {
    urgency: 'normal'
  }
});

interface PatientFormProps extends VariantProps<typeof formVariants> {
  readonly patient?: Patient;
  readonly onSubmit: (data: PatientFormData) => Promise<void>;
  readonly readOnly?: boolean;
}

export const PatientForm = React.forwardRef<HTMLFormElement, PatientFormProps>(
  ({ urgency, patient, onSubmit, readOnly, className, ...props }, ref) => {
    return (
      <form
        ref={ref}
        className={cn(formVariants({ urgency }), className)}
        onSubmit={handleSubmit}
        data-testid="patient-form"
        role="form"
        aria-label="Patient information form"
        {...props}
      >
        {/* HIPAA Notice */}
        <div className="mb-6 p-4 bg-medical-info-50 border border-medical-info-200 rounded-lg">
          <div className="flex items-start">
            <Shield className="h-5 w-5 text-medical-info-600 mt-0.5 mr-3" />
            <div>
              <h3 className="text-sm font-semibold text-medical-info-800">
                HIPAA Protected Information
              </h3>
              <p className="text-sm text-medical-info-700 mt-1">
                This form contains protected health information. All access is logged and monitored.
              </p>
            </div>
          </div>
        </div>

        {/* Patient Demographics */}
        <fieldset className="mb-8">
          <legend className="text-lg font-semibold text-medical-900 mb-4">
            Patient Demographics
          </legend>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label 
                htmlFor="firstName" 
                className="block text-sm font-medium text-medical-700 mb-2"
              >
                First Name <span className="text-medical-error-500">*</span>
              </label>
              <input
                id="firstName"
                type="text"
                required
                readOnly={readOnly}
                className={cn(
                  'h-12 w-full px-4 py-3',
                  'border-2 border-medical-300 rounded-lg',
                  'text-medical-900 placeholder-medical-500',
                  'focus:border-medical-primary-500 focus:ring-2 focus:ring-medical-primary-200',
                  'disabled:bg-medical-100 disabled:cursor-not-allowed',
                  'transition-colors duration-200'
                )}
                placeholder="Enter first name"
                aria-describedby="firstName-error"
                data-encrypt="true" // HIPAA encryption marker
              />
            </div>

            <div>
              <label 
                htmlFor="lastName" 
                className="block text-sm font-medium text-medical-700 mb-2"
              >
                Last Name <span className="text-medical-error-500">*</span>
              </label>
              <input
                id="lastName"
                type="text"
                required
                readOnly={readOnly}
                className={cn(
                  'h-12 w-full px-4 py-3',
                  'border-2 border-medical-300 rounded-lg',
                  'text-medical-900 placeholder-medical-500',
                  'focus:border-medical-primary-500 focus:ring-2 focus:ring-medical-primary-200',
                  'transition-colors duration-200'
                )}
                placeholder="Enter last name"
                data-encrypt="true"
              />
            </div>

            <div>
              <label 
                htmlFor="dateOfBirth" 
                className="block text-sm font-medium text-medical-700 mb-2"
              >
                Date of Birth <span className="text-medical-error-500">*</span>
              </label>
              <input
                id="dateOfBirth"
                type="date"
                required
                readOnly={readOnly}
                className={cn(
                  'h-12 w-full px-4 py-3',
                  'border-2 border-medical-300 rounded-lg',
                  'focus:border-medical-primary-500 focus:ring-2 focus:ring-medical-primary-200'
                )}
                data-encrypt="true"
              />
            </div>

            <div>
              <label 
                htmlFor="ssn" 
                className="block text-sm font-medium text-medical-700 mb-2"
              >
                Social Security Number
                <span className="ml-1 text-xs text-medical-500">(Last 4 digits)</span>
              </label>
              <input
                id="ssn"
                type="password"
                pattern="[0-9]{4}"
                maxLength={4}
                readOnly={readOnly}
                className={cn(
                  'h-12 w-full px-4 py-3',
                  'border-2 border-medical-300 rounded-lg',
                  'font-mono tracking-widest',
                  'focus:border-medical-primary-500 focus:ring-2 focus:ring-medical-primary-200'
                )}
                placeholder="••••"
                data-encrypt="true"
                data-pii="true" // Personal Identifiable Information marker
              />
            </div>
          </div>
        </fieldset>

        {/* Medical Information */}
        <fieldset className="mb-8">
          <legend className="text-lg font-semibold text-medical-900 mb-4">
            Medical Information
          </legend>
          
          <div className="space-y-6">
            <div>
              <label 
                htmlFor="allergies" 
                className="block text-sm font-medium text-medical-700 mb-2"
              >
                Known Allergies
              </label>
              <textarea
                id="allergies"
                rows={3}
                readOnly={readOnly}
                className={cn(
                  'w-full px-4 py-3',
                  'border-2 border-medical-300 rounded-lg',
                  'text-medical-900 placeholder-medical-500',
                  'focus:border-medical-primary-500 focus:ring-2 focus:ring-medical-primary-200',
                  'resize-vertical'
                )}
                placeholder="List any known allergies..."
                data-encrypt="true"
              />
            </div>

            <div>
              <label 
                htmlFor="medications" 
                className="block text-sm font-medium text-medical-700 mb-2"
              >
                Current Medications
              </label>
              <textarea
                id="medications"
                rows={3}
                readOnly={readOnly}
                className={cn(
                  'w-full px-4 py-3',
                  'border-2 border-medical-300 rounded-lg',
                  'focus:border-medical-primary-500 focus:ring-2 focus:ring-medical-primary-200',
                  'resize-vertical'
                )}
                placeholder="List current medications..."
                data-encrypt="true"
              />
            </div>
          </div>
        </fieldset>

        {/* Action Buttons */}
        <div className="flex justify-between items-center pt-6 border-t border-medical-200">
          <div className="text-sm text-medical-600">
            <Shield className="inline h-4 w-4 mr-1" />
            All changes are audited and encrypted
          </div>
          
          <div className="flex space-x-4">
            <button
              type="button"
              className={cn(
                'h-12 px-6 py-3',
                'border-2 border-medical-300',
                'text-medical-700 font-medium',
                'rounded-lg',
                'hover:bg-medical-50',
                'focus:ring-2 focus:ring-medical-300',
                'transition-colors duration-200'
              )}
            >
              Cancel
            </button>
            
            <button
              type="submit"
              disabled={readOnly}
              className={cn(
                'h-12 px-8 py-3',
                'bg-medical-primary-600 text-white font-medium',
                'rounded-lg',
                'hover:bg-medical-primary-700',
                'focus:ring-2 focus:ring-medical-primary-300',
                'disabled:opacity-50 disabled:cursor-not-allowed',
                'transition-colors duration-200'
              )}
            >
              {patient ? 'Update Patient' : 'Add Patient'}
            </button>
          </div>
        </div>
      </form>
    );
  }
);

PatientForm.displayName = 'PatientForm';
```

### 2. Financial Trading Platform

#### Scenario: Building a SOX-compliant trading platform

```bash
# Step 1: Create financial trading application
xaheen create tradepro --template fintech --compliance sox --features trading,portfolio,compliance,reporting

# Step 2: Integrate Xala UI with financial theme
cd tradepro
xala xaheen init --theme finance --compliance sox,gdpr --industry fintech

# Step 3: Generate trading dashboard
./xaheen-xala.sh generate fullstack TradingDashboard

# Step 4: Generate portfolio management
./xaheen-xala.sh generate fullstack PortfolioManagement

# Step 5: Generate compliance reporting
./xaheen-xala.sh generate fullstack ComplianceReporting
```

**Generated Trading Dashboard:**

```typescript
// src/components/TradingDashboard.tsx - Financial compliance theme
import React from 'react';
import { cva } from 'class-variance-authority';
import { TrendingUp, TrendingDown, DollarSign, AlertTriangle } from 'lucide-react';

const dashboardVariants = cva([
  'w-full',
  'min-h-screen',
  'bg-finance-background',
  'text-finance-foreground'
]);

const cardVariants = cva([
  'p-6',
  'bg-white',
  'rounded-lg',
  'shadow-finance-card',
  'border',
  'border-finance-border'
], {
  variants: {
    type: {
      metric: ['hover:shadow-finance-card-hover'],
      chart: ['p-4'],
      alert: ['border-finance-warning-400', 'bg-finance-warning-50']
    }
  }
});

interface TradingDashboardProps {
  readonly portfolioValue: number;
  readonly dayChange: number;
  readonly positions: Position[];
  readonly alerts: Alert[];
}

export const TradingDashboard = React.forwardRef<HTMLDivElement, TradingDashboardProps>(
  ({ portfolioValue, dayChange, positions, alerts }, ref) => {
    const isPositive = dayChange >= 0;
    
    return (
      <div ref={ref} className={dashboardVariants()}>
        {/* Header */}
        <header className="bg-white border-b border-finance-border px-8 py-6">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-3xl font-bold text-finance-900">
                Trading Dashboard
              </h1>
              <p className="text-finance-600 mt-1">
                Real-time portfolio monitoring and trading tools
              </p>
            </div>
            
            {/* SOX Compliance Indicator */}
            <div className="flex items-center space-x-4">
              <div className="flex items-center px-3 py-1 bg-finance-success-100 rounded-full">
                <div className="w-2 h-2 bg-finance-success-500 rounded-full mr-2"></div>
                <span className="text-sm text-finance-success-700 font-medium">
                  SOX Compliant
                </span>
              </div>
              
              <div className="text-right">
                <div className="text-sm text-finance-600">Last Update</div>
                <div className="text-sm font-mono text-finance-900">
                  {new Date().toLocaleTimeString()}
                </div>
              </div>
            </div>
          </div>
        </header>

        {/* Main Content */}
        <main className="p-8">
          {/* Key Metrics */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
            <div className={cardVariants({ type: 'metric' })}>
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-finance-600 mb-1">Portfolio Value</p>
                  <p className="text-2xl font-bold text-finance-900">
                    ${portfolioValue.toLocaleString()}
                  </p>
                </div>
                <DollarSign className="h-8 w-8 text-finance-primary-500" />
              </div>
            </div>

            <div className={cardVariants({ type: 'metric' })}>
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-finance-600 mb-1">Day Change</p>
                  <p className={`text-2xl font-bold ${
                    isPositive ? 'text-finance-success-600' : 'text-finance-error-600'
                  }`}>
                    {isPositive ? '+' : ''}${dayChange.toLocaleString()}
                  </p>
                </div>
                {isPositive ? (
                  <TrendingUp className="h-8 w-8 text-finance-success-500" />
                ) : (
                  <TrendingDown className="h-8 w-8 text-finance-error-500" />
                )}
              </div>
            </div>

            <div className={cardVariants({ type: 'metric' })}>
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-finance-600 mb-1">Active Positions</p>
                  <p className="text-2xl font-bold text-finance-900">
                    {positions.length}
                  </p>
                </div>
              </div>
            </div>

            <div className={cardVariants({ type: 'metric' })}>
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-finance-600 mb-1">Alerts</p>
                  <p className="text-2xl font-bold text-finance-warning-600">
                    {alerts.length}
                  </p>
                </div>
                <AlertTriangle className="h-8 w-8 text-finance-warning-500" />
              </div>
            </div>
          </div>

          {/* Charts and Tables Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Portfolio Chart */}
            <div className={`lg:col-span-2 ${cardVariants({ type: 'chart' })}`}>
              <h3 className="text-lg font-semibold text-finance-900 mb-4">
                Portfolio Performance
              </h3>
              <div className="h-80 bg-finance-muted rounded-lg flex items-center justify-center">
                {/* Chart placeholder - would integrate with actual charting library */}
                <p className="text-finance-muted-foreground">
                  Real-time portfolio chart
                </p>
              </div>
            </div>

            {/* Recent Alerts */}
            <div className={cardVariants({ type: 'chart' })}>
              <h3 className="text-lg font-semibold text-finance-900 mb-4">
                Recent Alerts
              </h3>
              <div className="space-y-3">
                {alerts.slice(0, 5).map((alert, index) => (
                  <div key={index} className="flex items-start space-x-3 p-3 bg-finance-warning-50 rounded-lg">
                    <AlertTriangle className="h-4 w-4 text-finance-warning-600 mt-0.5" />
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-finance-900">
                        {alert.title}
                      </p>
                      <p className="text-sm text-finance-600">
                        {alert.message}
                      </p>
                      <p className="text-xs text-finance-500 mt-1">
                        {alert.timestamp}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Positions Table */}
          <div className={`mt-8 ${cardVariants({ type: 'chart' })}`}>
            <h3 className="text-lg font-semibold text-finance-900 mb-4">
              Current Positions
            </h3>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-finance-border">
                    <th className="text-left py-3 px-4 font-medium text-finance-600">Symbol</th>
                    <th className="text-left py-3 px-4 font-medium text-finance-600">Quantity</th>
                    <th className="text-left py-3 px-4 font-medium text-finance-600">Price</th>
                    <th className="text-left py-3 px-4 font-medium text-finance-600">Market Value</th>
                    <th className="text-left py-3 px-4 font-medium text-finance-600">P&L</th>
                    <th className="text-left py-3 px-4 font-medium text-finance-600">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {positions.map((position, index) => (
                    <tr key={index} className="border-b border-finance-border hover:bg-finance-muted/50">
                      <td className="py-4 px-4 font-semibold text-finance-900">
                        {position.symbol}
                      </td>
                      <td className="py-4 px-4 text-finance-900">
                        {position.quantity.toLocaleString()}
                      </td>
                      <td className="py-4 px-4 font-mono text-finance-900">
                        ${position.price.toFixed(2)}
                      </td>
                      <td className="py-4 px-4 font-mono text-finance-900">
                        ${position.marketValue.toLocaleString()}
                      </td>
                      <td className={`py-4 px-4 font-mono font-semibold ${
                        position.pnl >= 0 ? 'text-finance-success-600' : 'text-finance-error-600'
                      }`}>
                        {position.pnl >= 0 ? '+' : ''}${position.pnl.toFixed(2)}
                      </td>
                      <td className="py-4 px-4">
                        <div className="flex space-x-2">
                          <button className="px-3 py-1 text-xs bg-finance-primary-100 text-finance-primary-700 rounded-md hover:bg-finance-primary-200">
                            Trade
                          </button>
                          <button className="px-3 py-1 text-xs bg-finance-muted text-finance-muted-foreground rounded-md hover:bg-finance-muted/80">
                            Details
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </main>
      </div>
    );
  }
);

TradingDashboard.displayName = 'TradingDashboard';
```

### 3. Government Platform (Norwegian Compliance)

#### Scenario: Building an NSM-classified government application

```bash
# Step 1: Create government application with NSM compliance
xaheen create gov-portal --template government --compliance nsm --features citizens,documents,services

# Step 2: Integrate with Norwegian compliance
cd gov-portal
xala xaheen init --theme government --compliance nsm,gdpr,wcag-aaa --industry government

# The CLI automatically:
# - Configures NSM RESTRICTED classification
# - Enables Norwegian language support (nb-NO)
# - Sets up GDPR consent management
# - Configures WCAG AAA accessibility
# - Enables audit logging for all operations

# Step 3: Generate citizen services module
./xaheen-xala.sh generate fullstack CitizenServices

# Step 4: Generate document management
./xaheen-xala.sh generate fullstack SecureDocuments
```

**Generated Norwegian Government Component:**

```typescript
// src/components/CitizenServiceForm.tsx - Norwegian Government Theme
import React from 'react';
import { cva } from 'class-variance-authority';
import { Shield, Lock, Eye, FileText } from 'lucide-react';

const formVariants = cva([
  'w-full',
  'max-w-4xl',
  'mx-auto',
  'p-8',
  'bg-white',
  'rounded-lg',
  'shadow-gov-card',
  'border-2',
  'border-gov-primary-200'
]);

interface CitizenServiceFormProps {
  readonly serviceType: 'passport' | 'tax' | 'benefits' | 'housing';
  readonly classification: 'OPEN' | 'RESTRICTED' | 'CONFIDENTIAL';
  readonly onSubmit: (data: ServiceFormData) => Promise<void>;
}

export const CitizenServiceForm = React.forwardRef<HTMLFormElement, CitizenServiceFormProps>(
  ({ serviceType, classification, onSubmit }, ref) => {
    return (
      <form
        ref={ref}
        className={formVariants()}
        onSubmit={handleSubmit}
        data-nsm-classification={classification}
        data-testid="citizen-service-form"
        role="form"
        aria-label={`${serviceType} tjeneste skjema`} // Norwegian accessibility
      >
        {/* NSM Classification Header */}
        <div className="mb-6 p-4 bg-gov-info-50 border-l-4 border-gov-info-400 rounded-r-lg">
          <div className="flex items-center">
            <Shield className="h-6 w-6 text-gov-info-600 mr-3" />
            <div>
              <h3 className="text-lg font-semibold text-gov-info-800">
                NSM Klassifisering: {classification}
              </h3>
              <p className="text-sm text-gov-info-700 mt-1">
                Denne tjenesten håndterer {classification.toLowerCase()} informasjon i henhold til NSM sikkerhetsstandarder.
              </p>
            </div>
          </div>
        </div>

        {/* Service Information */}
        <fieldset className="mb-8">
          <legend className="text-xl font-bold text-gov-900 mb-4 flex items-center">
            <FileText className="h-6 w-6 mr-2" />
            Tjenesteinformasjon
          </legend>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label 
                htmlFor="nationalId" 
                className="block text-sm font-medium text-gov-700 mb-2"
              >
                Fødselsnummer <span className="text-gov-error-500">*</span>
              </label>
              <input
                id="nationalId"
                type="password"
                pattern="[0-9]{11}"
                maxLength={11}
                required
                className={cn(
                  'h-14 w-full px-4 py-3',
                  'border-2 border-gov-border rounded-lg',
                  'text-gov-900 font-mono tracking-wider',
                  'focus:border-gov-primary-500 focus:ring-4 focus:ring-gov-primary-100',
                  'transition-all duration-200'
                )}
                placeholder="••••••••••••"
                data-encrypt="true"
                data-nsm-pii="true"
                aria-describedby="nationalId-help"
              />
              <p id="nationalId-help" className="text-xs text-gov-600 mt-1">
                11-sifret fødselsnummer. All informasjon krypteres.
              </p>
            </div>

            <div>
              <label 
                htmlFor="serviceCategory" 
                className="block text-sm font-medium text-gov-700 mb-2"
              >
                Tjenestekategori <span className="text-gov-error-500">*</span>
              </label>
              <select
                id="serviceCategory"
                required
                className={cn(
                  'h-14 w-full px-4 py-3',
                  'border-2 border-gov-border rounded-lg',
                  'text-gov-900',
                  'focus:border-gov-primary-500 focus:ring-4 focus:ring-gov-primary-100'
                )}
              >
                <option value="">Velg tjeneste...</option>
                <option value="passport">Pass og ID</option>
                <option value="tax">Skatt og avgifter</option>
                <option value="benefits">Stønader og ytelser</option>
                <option value="housing">Bolig og eiendom</option>
              </select>
            </div>

            <div className="md:col-span-2">
              <label 
                htmlFor="description" 
                className="block text-sm font-medium text-gov-700 mb-2"
              >
                Beskrivelse av henvendelse <span className="text-gov-error-500">*</span>
              </label>
              <textarea
                id="description"
                rows={4}
                required
                className={cn(
                  'w-full px-4 py-3',
                  'border-2 border-gov-border rounded-lg',
                  'text-gov-900',
                  'focus:border-gov-primary-500 focus:ring-4 focus:ring-gov-primary-100',
                  'resize-vertical'
                )}
                placeholder="Beskriv din henvendelse detaljert..."
                data-encrypt="true"
              />
            </div>
          </div>
        </fieldset>

        {/* Contact Information */}
        <fieldset className="mb-8">
          <legend className="text-xl font-bold text-gov-900 mb-4">
            Kontaktinformasjon
          </legend>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label 
                htmlFor="email" 
                className="block text-sm font-medium text-gov-700 mb-2"
              >
                E-postadresse <span className="text-gov-error-500">*</span>
              </label>
              <input
                id="email"
                type="email"
                required
                className={cn(
                  'h-14 w-full px-4 py-3',
                  'border-2 border-gov-border rounded-lg',
                  'focus:border-gov-primary-500 focus:ring-4 focus:ring-gov-primary-100'
                )}
                placeholder="din.epost@eksempel.no"
                data-encrypt="true"
              />
            </div>

            <div>
              <label 
                htmlFor="phone" 
                className="block text-sm font-medium text-gov-700 mb-2"
              >
                Telefonnummer
              </label>
              <input
                id="phone"
                type="tel"
                pattern="[0-9+\s-]+"
                className={cn(
                  'h-14 w-full px-4 py-3',
                  'border-2 border-gov-border rounded-lg',
                  'focus:border-gov-primary-500 focus:ring-4 focus:ring-gov-primary-100'
                )}
                placeholder="+47 123 45 678"
                data-encrypt="true"
              />
            </div>
          </div>
        </fieldset>

        {/* GDPR Consent */}
        <fieldset className="mb-8 p-4 bg-gov-muted-50 rounded-lg border border-gov-border">
          <legend className="text-lg font-semibold text-gov-900 mb-4">
            Samtykke og personvern (GDPR)
          </legend>
          
          <div className="space-y-4">
            <div className="flex items-start">
              <input
                id="gdprConsent"
                type="checkbox"
                required
                className="mt-1 h-4 w-4 text-gov-primary-600 focus:ring-gov-primary-500 border-gov-300 rounded"
              />
              <label htmlFor="gdprConsent" className="ml-3 text-sm text-gov-700">
                Jeg samtykker til at mine personopplysninger behandles i henhold til{' '}
                <a href="/privacy" className="text-gov-primary-600 hover:text-gov-primary-800 underline">
                  personvernerklæringen
                </a>
                . Jeg forstår at jeg kan trekke tilbake samtykket når som helst.
              </label>
            </div>

            <div className="flex items-start">
              <input
                id="communicationConsent"
                type="checkbox"
                className="mt-1 h-4 w-4 text-gov-primary-600 focus:ring-gov-primary-500 border-gov-300 rounded"
              />
              <label htmlFor="communicationConsent" className="ml-3 text-sm text-gov-700">
                Jeg ønsker å motta oppdateringer om min sak via e-post og SMS.
              </label>
            </div>
          </div>
        </fieldset>

        {/* Security Notice */}
        <div className="mb-6 p-4 bg-gov-success-50 border border-gov-success-200 rounded-lg">
          <div className="flex items-start">
            <Lock className="h-5 w-5 text-gov-success-600 mt-0.5 mr-3" />
            <div className="text-sm">
              <h4 className="font-semibold text-gov-success-800 mb-1">
                Sikkerhet og kryptering
              </h4>
              <ul className="text-gov-success-700 space-y-1">
                <li>• All informasjon krypteres med AES-256 standard</li>
                <li>• Tilgang logges i henhold til NSM retningslinjer</li>
                <li>• Data lagres på servere lokalisert i Norge</li>
                <li>• Automatisk sletting av sensitive data etter 7 år</li>
              </ul>
            </div>
          </div>
        </div>

        {/* Submit Actions */}
        <div className="flex justify-between items-center pt-6 border-t-2 border-gov-border">
          <div className="flex items-center text-sm text-gov-600">
            <Eye className="h-4 w-4 mr-2" />
            Saks-ID vil bli generert ved innsending
          </div>
          
          <div className="flex space-x-4">
            <button
              type="button"
              className={cn(
                'h-14 px-8 py-3',
                'border-2 border-gov-border',
                'text-gov-700 font-medium',
                'rounded-lg',
                'hover:bg-gov-muted-50',
                'focus:ring-4 focus:ring-gov-muted-200',
                'transition-all duration-200'
              )}
            >
              Avbryt
            </button>
            
            <button
              type="submit"
              className={cn(
                'h-14 px-10 py-3',
                'bg-gov-primary-600 text-white font-semibold',
                'rounded-lg',
                'hover:bg-gov-primary-700',
                'focus:ring-4 focus:ring-gov-primary-200',
                'transition-all duration-200',
                'shadow-lg hover:shadow-xl'
              )}
            >
              Send inn henvendelse
            </button>
          </div>
        </div>
      </form>
    );
  }
);

CitizenServiceForm.displayName = 'CitizenServiceForm';
```

### 4. E-commerce Platform Migration

#### Scenario: Migrating an existing e-commerce site to Xala UI system

```bash
# Step 1: Navigate to existing e-commerce project
cd existing-ecommerce-site

# Step 2: Analyze existing codebase for migration
xala migrate analyze src/ --detailed --output migration-report.html

# Analysis Results:
# Overall Score: 45% (Requires Migration)
# Issues Found: 127
# - 23 components using inline styles
# - 15 components with accessibility issues
# - 8 components using deprecated patterns
# - 12 hardcoded color values
# - 34 TypeScript 'any' types

# Step 3: Install Xala UI system
xala install --platform react --template ecommerce --backup

# Step 4: Convert existing components batch by batch
xala migrate convert src/components/ProductCard.jsx --interactive
xala migrate convert src/components/ShoppingCart.jsx --backup
xala migrate convert src/components/CheckoutForm.jsx --guided

# Step 5: Generate missing components
xala ai generate "Product review system with ratings and comments"
xala ai generate "Advanced search filters with faceted navigation"
xala ai generate "Order tracking dashboard with status timeline"

# Step 6: Validate all migrated components
xala check src/components/ --recursive --fix-suggestions
```

**Migration Progress Example:**

```bash
# Before Migration - Old ProductCard component
xala check src/components/ProductCard.jsx

🚨 REQUIRES MIGRATION - Score: 32%
⏱️  Estimated fix time: 2-4 hours

📊 Results Summary:
   ✅ Passed: 3
   ❌ Failed: 12
   🔴 Errors: 5
   🟡 Warnings: 7

📋 Detailed Results:
❌ v5.0 Pure Components: Found hooks in component: useState, useEffect
❌ CVA Pattern: Not using CVA for variant management
❌ TypeScript Strictness: Using "any" type
❌ ARIA Labels: Interactive elements missing ARIA labels
⚠️  Professional Sizing: Small sizing detected: p-2, h-6, text-xs
⚠️  Inline Styles: Inline styles detected
⚠️  Design Tokens: Hardcoded colors detected

🔧 Quick Fixes Available:
🤖 Add ARIA labels automatically
   xala migrate convert --fix-accessibility
🤖 Convert to Tailwind classes  
   xala migrate convert --fix-styling
👤 Add CVA for variant management
   xala migrate convert --add-cva

# After Migration - Converted ProductCard component
xala check src/components/ProductCard.tsx

🎉 EXCELLENT - Score: 94%
⏱️  Estimated fix time: 0 minutes

📊 Results Summary:
   ✅ Passed: 14
   ❌ Failed: 1
   🟡 Warnings: 1

🎯 Recommendations:
   🎉 Great job! This component follows all UI system standards.
   📝 Consider adding it as an example in your component library.
```

### 5. Multi-Platform Component Generation

#### Scenario: Creating components for React, Vue, and Angular simultaneously

```bash
# Generate a data table component for multiple platforms
xala generate DataTable --platforms react,vue,angular --theme enterprise

# Output structure:
# components/
# ├── react/
# │   ├── DataTable.tsx
# │   ├── DataTable.stories.tsx
# │   └── DataTable.test.tsx
# ├── vue/
# │   ├── DataTable.vue
# │   ├── DataTable.stories.js
# │   └── DataTable.spec.js
# └── angular/
#     ├── data-table.component.ts
#     ├── data-table.component.html
#     ├── data-table.component.scss
#     ├── data-table.component.spec.ts
#     └── data-table.stories.ts

# Generate with different compliance requirements
xala generate UserForm --platforms react,vue --compliance hipaa --theme healthcare

# AI-powered multi-platform generation
xala ai generate "Advanced calendar component with recurring events" --platforms react,vue,angular
```

These comprehensive implementation examples demonstrate how the Xala UI CLI handles real-world scenarios across different industries, compliance requirements, and technical stacks. Each example shows the complete workflow from project creation through component generation, with actual code outputs that follow the v5.0 architecture and industry-specific compliance requirements.