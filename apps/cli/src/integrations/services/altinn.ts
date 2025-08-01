/**
 * Altinn Government Services Integration
 * Provides integration with Norwegian government digital services platform
 */

import * as fs from 'fs';
import * as path from 'path';
import Handlebars from 'handlebars';

export interface GenerationResult {
  success: boolean;
  files: string[];
  errors?: string[];
  warnings?: string[];
}

export interface IntegrationOptions {
  projectName: string;
  outputPath?: string;
  framework?: 'react' | 'nextjs' | 'remix' | 'svelte' | 'vue';
  typescript?: boolean;
  environment?: 'test' | 'production';
  organizationNumber?: string;
  apiKey?: string;
  services?: ('authentication' | 'forms' | 'registry' | 'correspondence' | 'authorization')[];
  bankIdIntegration?: boolean;
  gdprCompliant?: boolean;
}

export interface AltinnConfig {
  baseUrl: string;
  apiVersion: string;
  organizationNumber: string;
  apiKey: string;
  environment: 'test' | 'production';
  services: {
    authentication: boolean;
    forms: boolean;
    registry: boolean;
    correspondence: boolean;
    authorization: boolean;
  };
}

/**
 * Altinn SDK Configuration
 */
export class AltinnSdkConfig {
  private config: AltinnConfig;

  constructor(environment: 'test' | 'production' = 'test', organizationNumber: string = '') {
    this.config = this.getEnvironmentConfig(environment, organizationNumber);
  }

  private getEnvironmentConfig(environment: 'test' | 'production', orgNumber: string): AltinnConfig {
    const baseConfigs = {
      test: {
        baseUrl: 'https://platform.tt02.altinn.no',
        apiVersion: 'v1',
        authentication: 'https://platform.tt02.altinn.no/authentication/api/v1',
        forms: 'https://platform.tt02.altinn.no/storage/api/v1',
        registry: 'https://platform.tt02.altinn.no/register/api/v1',
        correspondence: 'https://platform.tt02.altinn.no/correspondence/api/v1',
        authorization: 'https://platform.tt02.altinn.no/authorization/api/v1',
      },
      production: {
        baseUrl: 'https://platform.altinn.no',
        apiVersion: 'v1',
        authentication: 'https://platform.altinn.no/authentication/api/v1',
        forms: 'https://platform.altinn.no/storage/api/v1',
        registry: 'https://platform.altinn.no/register/api/v1',
        correspondence: 'https://platform.altinn.no/correspondence/api/v1',
        authorization: 'https://platform.altinn.no/authorization/api/v1',
      },
    };

    const envConfig = baseConfigs[environment];
    
    return {
      baseUrl: envConfig.baseUrl,
      apiVersion: envConfig.apiVersion,
      organizationNumber: orgNumber,
      apiKey: '',
      environment,
      services: {
        authentication: true,
        forms: true,
        registry: true,
        correspondence: true,
        authorization: true,
      },
    };
  }

  getConfig(): AltinnConfig {
    return this.config;
  }

  getEndpoint(service: keyof typeof this.config.services): string {
    const endpoints = {
      authentication: `${this.config.baseUrl}/authentication/api/${this.config.apiVersion}`,
      forms: `${this.config.baseUrl}/storage/api/${this.config.apiVersion}`,
      registry: `${this.config.baseUrl}/register/api/${this.config.apiVersion}`,
      correspondence: `${this.config.baseUrl}/correspondence/api/${this.config.apiVersion}`,
      authorization: `${this.config.baseUrl}/authorization/api/${this.config.apiVersion}`,
    };
    return endpoints[service];
  }
}

/**
 * Generate Altinn integration component
 */
export async function generateAltinnComponent(options: IntegrationOptions): Promise<GenerationResult> {
  const result: GenerationResult = { success: false, files: [], errors: [], warnings: [] };

  try {
    const {
      projectName,
      outputPath,
      framework = 'react',
      typescript = true,
      services = ['authentication', 'forms', 'registry'],
      bankIdIntegration = true,
      gdprCompliant = true,
    } = options;

    const outputDir = outputPath || path.join(process.cwd(), 'src', 'components', 'altinn');
    if (!fs.existsSync(outputDir)) fs.mkdirSync(outputDir, { recursive: true });

    const extension = typescript ? '.tsx' : '.jsx';

    // Altinn Authentication Component
    const authContent = `import React, { useState, useEffect } from 'react';
${typescript ? `import type { AltinnUser, AltinnAuthResult } from './altinn.types';` : ''}
${bankIdIntegration ? `import { BankIDAuth } from '../auth/BankIDAuth';` : ''}

${typescript ? `
interface AltinnAuthProps {
  onSuccess?: (user: AltinnUser) => void;
  onError?: (error: Error) => void;
  organizationNumber?: string;
  requiredRoles?: string[];
  className?: string;
}
` : ''}

/**
 * Altinn Authentication Component
 * Handles authentication with Norwegian government services
 */
export const AltinnAuth${typescript ? ': React.FC<AltinnAuthProps>' : ''} = ({
  onSuccess,
  onError,
  organizationNumber,
  requiredRoles = [],
  className = '',
}) => {
  const [isLoading, setIsLoading] = useState(false);
  const [authMethod, setAuthMethod] = useState${typescript ? `<'bankid' | 'idporten' | null>` : ''}(null);
  const [user, setUser] = useState${typescript ? '<AltinnUser | null>' : ''}(null);
  const [error, setError] = useState('');

  const handleAuthentication = async (method${typescript ? ": 'bankid' | 'idporten'" : ''}) => {
    setIsLoading(true);
    setError('');

    try {
      const response = await fetch('/api/altinn/auth/initiate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          method,
          organizationNumber,
          requiredRoles,
        }),
      });

      if (!response.ok) {
        throw new Error('Authentication initialization failed');
      }

      const { authUrl, sessionId } = await response.json();

      if (method === 'idporten') {
        // Redirect to ID-porten
        window.location.href = authUrl;
      } else {
        // Handle BankID authentication
        setAuthMethod('bankid');
      }
    } catch (error) {
      const message = error${typescript ? ' as Error' : ''}.message || 'Authentication failed';
      setError(message);
      onError?.(error${typescript ? ' as Error' : ''});
    } finally {
      setIsLoading(false);
    }
  };

  const handleBankIDSuccess = async (bankIdUser${typescript ? ': any' : ''}) => {
    try {
      // Exchange BankID token for Altinn session
      const response = await fetch('/api/altinn/auth/bankid-callback', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          bankIdToken: bankIdUser.token,
          organizationNumber,
        }),
      });

      if (!response.ok) {
        throw new Error('BankID to Altinn exchange failed');
      }

      const altinnUser = await response.json();
      setUser(altinnUser);
      onSuccess?.(altinnUser);
    } catch (error) {
      const message = error${typescript ? ' as Error' : ''}.message || 'BankID authentication failed';
      setError(message);
      onError?.(error${typescript ? ' as Error' : ''});
    }
  };

  const checkAuthorization = async (user${typescript ? ': AltinnUser' : ''}) => {
    if (requiredRoles.length === 0) return true;

    try {
      const response = await fetch(\`/api/altinn/authorization/check\`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId: user.id,
          organizationNumber,
          requiredRoles,
        }),
      });

      const { authorized, missingRoles } = await response.json();
      
      if (!authorized) {
        setError(\`Missing required roles: \${missingRoles.join(', ')}\`);
        return false;
      }

      return true;
    } catch (error) {
      console.error('Authorization check failed:', error);
      return false;
    }
  };

  if (authMethod === 'bankid' && bankIdIntegration) {
    return (
      <BankIDAuth
        onSuccess={handleBankIDSuccess}
        onError={onError}
        className={className}
      />
    );
  }

  return (
    <div className={\`altinn-auth max-w-md mx-auto p-6 bg-white rounded-lg shadow-lg \${className}\`}>
      <div className="text-center mb-6">
        <img src="/altinn-logo.svg" alt="Altinn" className="h-12 mx-auto mb-4" />
        <h2 className="text-2xl font-bold text-gray-900 mb-2">Logg inn med Altinn</h2>
        <p className="text-gray-600">Velg innloggingsmetode for å få tilgang til offentlige tjenester</p>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-3 mb-4">
          <p className="text-sm text-red-800">{error}</p>
        </div>
      )}

      {!user ? (
        <div className="space-y-3">
          ${bankIdIntegration ? `
          <button
            onClick={() => handleAuthentication('bankid')}
            disabled={isLoading}
            className="w-full flex items-center justify-center px-4 py-3 bg-[#DA291C] text-white rounded-lg hover:bg-[#C02518] disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            <img src="/bankid-logo.svg" alt="BankID" className="h-5 mr-3" />
            Logg inn med BankID
          </button>
          ` : ''}

          <button
            onClick={() => handleAuthentication('idporten')}
            disabled={isLoading}
            className="w-full flex items-center justify-center px-4 py-3 bg-[#0062BA] text-white rounded-lg hover:bg-[#0052A0] disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            <img src="/idporten-logo.svg" alt="ID-porten" className="h-5 mr-3" />
            Logg inn med ID-porten
          </button>

          <div className="text-center mt-4">
            <a href="https://www.altinn.no/hjelp" className="text-sm text-blue-600 hover:text-blue-700">
              Trenger du hjelp med innlogging?
            </a>
          </div>
        </div>
      ) : (
        <div className="text-center">
          <div className="mb-4">
            <div className="w-16 h-16 mx-auto mb-4 bg-green-100 rounded-full flex items-center justify-center">
              <svg className="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
            </div>
            <h3 className="text-lg font-medium text-gray-900">Innlogget som</h3>
            <p className="text-gray-600">{user.name}</p>
            {user.organizationName && (
              <p className="text-sm text-gray-500 mt-1">{user.organizationName}</p>
            )}
          </div>
        </div>
      )}

      ${gdprCompliant ? `
      <div className="text-xs text-gray-500 mt-6 text-center">
        Ved å logge inn godtar du vår{' '}
        <a href="/privacy" className="text-blue-600 hover:text-blue-700">personvernerklæring</a>.
        Dine data behandles i henhold til GDPR og norsk personvernlovgivning.
      </div>
      ` : ''}
    </div>
  );
};`;

    fs.writeFileSync(path.join(outputDir, `AltinnAuth${extension}`), authContent, 'utf-8');
    result.files.push(path.join(outputDir, `AltinnAuth${extension}`));

    // Altinn Forms Component
    if (services.includes('forms')) {
      const formsContent = `import React, { useState, useEffect } from 'react';
${typescript ? `import type { AltinnForm, AltinnFormSubmission } from './altinn.types';` : ''}

${typescript ? `
interface AltinnFormsProps {
  organizationNumber: string;
  formId?: string;
  onSubmit?: (submission: AltinnFormSubmission) => void;
  onError?: (error: Error) => void;
  className?: string;
}
` : ''}

/**
 * Altinn Forms Component
 * Handles government form submissions
 */
export const AltinnForms${typescript ? ': React.FC<AltinnFormsProps>' : ''} = ({
  organizationNumber,
  formId,
  onSubmit,
  onError,
  className = '',
}) => {
  const [forms, setForms] = useState${typescript ? '<AltinnForm[]>' : ''}([]);
  const [selectedForm, setSelectedForm] = useState${typescript ? '<AltinnForm | null>' : ''}(null);
  const [formData, setFormData] = useState${typescript ? '<Record<string, any>>' : ''}({});
  const [isLoading, setIsLoading] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (formId) {
      loadForm(formId);
    } else {
      loadAvailableForms();
    }
  }, [formId, organizationNumber]);

  const loadAvailableForms = async () => {
    setIsLoading(true);
    try {
      const response = await fetch(\`/api/altinn/forms?org=\${organizationNumber}\`);
      if (!response.ok) throw new Error('Failed to load forms');
      
      const data = await response.json();
      setForms(data.forms);
    } catch (error) {
      console.error('Error loading forms:', error);
      onError?.(error${typescript ? ' as Error' : ''});
    } finally {
      setIsLoading(false);
    }
  };

  const loadForm = async (formId${typescript ? ': string' : ''}) => {
    setIsLoading(true);
    try {
      const response = await fetch(\`/api/altinn/forms/\${formId}\`);
      if (!response.ok) throw new Error('Failed to load form');
      
      const form = await response.json();
      setSelectedForm(form);
      
      // Initialize form data with default values
      const initialData${typescript ? ': Record<string, any>' : ''} = {};
      form.fields.forEach((field${typescript ? ': any' : ''}) => {
        initialData[field.id] = field.defaultValue || '';
      });
      setFormData(initialData);
    } catch (error) {
      console.error('Error loading form:', error);
      onError?.(error${typescript ? ' as Error' : ''});
    } finally {
      setIsLoading(false);
    }
  };

  const handleFieldChange = (fieldId${typescript ? ': string' : ''}, value${typescript ? ': any' : ''}) => {
    setFormData(prev => ({
      ...prev,
      [fieldId]: value,
    }));
  };

  const handleSubmit = async (e${typescript ? ': React.FormEvent' : ''}) => {
    e.preventDefault();
    if (!selectedForm) return;

    setIsSubmitting(true);
    try {
      const submission${typescript ? ': AltinnFormSubmission' : ''} = {
        formId: selectedForm.id,
        organizationNumber,
        data: formData,
        timestamp: new Date().toISOString(),
      };

      const response = await fetch('/api/altinn/forms/submit', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(submission),
      });

      if (!response.ok) throw new Error('Form submission failed');

      const result = await response.json();
      onSubmit?.(result);
      
      // Reset form
      setSelectedForm(null);
      setFormData({});
    } catch (error) {
      console.error('Error submitting form:', error);
      onError?.(error${typescript ? ' as Error' : ''});
    } finally {
      setIsSubmitting(false);
    }
  };

  const renderField = (field${typescript ? ': any' : ''}) => {
    const commonProps = {
      id: field.id,
      name: field.id,
      value: formData[field.id] || '',
      onChange: (e${typescript ? ': any' : ''}) => handleFieldChange(field.id, e.target.value),
      required: field.required,
      disabled: isSubmitting,
      className: 'w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500',
    };

    switch (field.type) {
      case 'text':
      case 'email':
      case 'tel':
        return <input type={field.type} {...commonProps} placeholder={field.placeholder} />;
      
      case 'textarea':
        return <textarea {...commonProps} rows={4} placeholder={field.placeholder} />;
      
      case 'select':
        return (
          <select {...commonProps}>
            <option value="">Velg {field.label}</option>
            {field.options?.map((option${typescript ? ': any' : ''}) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        );
      
      case 'checkbox':
        return (
          <label className="flex items-center">
            <input
              type="checkbox"
              {...commonProps}
              checked={formData[field.id] || false}
              onChange={(e) => handleFieldChange(field.id, e.target.checked)}
              className="mr-2 h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
            />
            <span className="text-sm text-gray-700">{field.label}</span>
          </label>
        );
      
      default:
        return null;
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (!selectedForm && forms.length > 0) {
    return (
      <div className={\`altinn-forms \${className}\`}>
        <h3 className="text-lg font-medium text-gray-900 mb-4">Tilgjengelige skjemaer</h3>
        <div className="space-y-2">
          {forms.map(form => (
            <button
              key={form.id}
              onClick={() => loadForm(form.id)}
              className="w-full text-left p-4 bg-gray-50 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <h4 className="font-medium text-gray-900">{form.title}</h4>
              <p className="text-sm text-gray-600">{form.description}</p>
            </button>
          ))}
        </div>
      </div>
    );
  }

  if (!selectedForm) {
    return (
      <div className="text-center text-gray-500 p-8">
        Ingen skjemaer tilgjengelig
      </div>
    );
  }

  return (
    <div className={\`altinn-forms \${className}\`}>
      <div className="mb-6">
        <h3 className="text-xl font-bold text-gray-900">{selectedForm.title}</h3>
        <p className="text-gray-600">{selectedForm.description}</p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        {selectedForm.fields.map((field${typescript ? ': any' : ''}) => (
          <div key={field.id}>
            {field.type !== 'checkbox' && (
              <label htmlFor={field.id} className="block text-sm font-medium text-gray-700 mb-2">
                {field.label}
                {field.required && <span className="text-red-500 ml-1">*</span>}
              </label>
            )}
            {renderField(field)}
            {field.helpText && (
              <p className="text-sm text-gray-500 mt-1">{field.helpText}</p>
            )}
          </div>
        ))}

        ${gdprCompliant ? `
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <p className="text-sm text-blue-800">
            <strong>Personverninformasjon:</strong> Data du sender inn behandles i henhold til 
            personopplysningsloven og GDPR. Les mer i vår{' '}
            <a href="/privacy" className="underline">personvernerklæring</a>.
          </p>
        </div>
        ` : ''}

        <div className="flex justify-between pt-4">
          <button
            type="button"
            onClick={() => setSelectedForm(null)}
            className="px-4 py-2 text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors"
          >
            Avbryt
          </button>
          <button
            type="submit"
            disabled={isSubmitting}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            {isSubmitting ? 'Sender...' : 'Send inn skjema'}
          </button>
        </div>
      </form>
    </div>
  );
};`;

      fs.writeFileSync(path.join(outputDir, `AltinnForms${extension}`), formsContent, 'utf-8');
      result.files.push(path.join(outputDir, `AltinnForms${extension}`));
    }

    // Business Registry Component
    if (services.includes('registry')) {
      const registryContent = `import React, { useState } from 'react';
${typescript ? `import type { Organization, Person } from './altinn.types';` : ''}

${typescript ? `
interface AltinnRegistryProps {
  onOrganizationSelect?: (org: Organization) => void;
  onPersonSelect?: (person: Person) => void;
  className?: string;
}
` : ''}

/**
 * Altinn Registry Component
 * Searches Norwegian business and person registry
 */
export const AltinnRegistry${typescript ? ': React.FC<AltinnRegistryProps>' : ''} = ({
  onOrganizationSelect,
  onPersonSelect,
  className = '',
}) => {
  const [searchType, setSearchType] = useState${typescript ? "<'organization' | 'person'>" : ''}('organization');
  const [searchQuery, setSearchQuery] = useState('');
  const [results, setResults] = useState${typescript ? '<(Organization | Person)[]>' : ''}([]);
  const [isSearching, setIsSearching] = useState(false);

  const handleSearch = async () => {
    if (!searchQuery.trim()) return;

    setIsSearching(true);
    try {
      const endpoint = searchType === 'organization' 
        ? '/api/altinn/registry/organizations' 
        : '/api/altinn/registry/persons';
      
      const response = await fetch(\`\${endpoint}?q=\${encodeURIComponent(searchQuery)}\`);
      if (!response.ok) throw new Error('Search failed');
      
      const data = await response.json();
      setResults(data.results);
    } catch (error) {
      console.error('Registry search error:', error);
      setResults([]);
    } finally {
      setIsSearching(false);
    }
  };

  const handleKeyPress = (e${typescript ? ': React.KeyboardEvent' : ''}) => {
    if (e.key === 'Enter') {
      handleSearch();
    }
  };

  const formatOrganizationNumber = (orgNumber${typescript ? ': string' : ''}) => {
    // Format: XXX XXX XXX
    return orgNumber.replace(/(\d{3})(\d{3})(\d{3})/, '$1 $2 $3');
  };

  return (
    <div className={\`altinn-registry \${className}\`}>
      <div className="mb-4">
        <div className="flex space-x-2 mb-4">
          <button
            onClick={() => setSearchType('organization')}
            className={\`px-4 py-2 rounded-lg transition-colors \${
              searchType === 'organization'
                ? 'bg-blue-600 text-white'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }\`}
          >
            Organisasjoner
          </button>
          <button
            onClick={() => setSearchType('person')}
            className={\`px-4 py-2 rounded-lg transition-colors \${
              searchType === 'person'
                ? 'bg-blue-600 text-white'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }\`}
          >
            Personer
          </button>
        </div>

        <div className="flex space-x-2">
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            onKeyPress={handleKeyPress}
            placeholder={
              searchType === 'organization'
                ? 'Søk etter organisasjonsnummer eller navn'
                : 'Søk etter fødselsnummer eller navn'
            }
            className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          <button
            onClick={handleSearch}
            disabled={isSearching || !searchQuery.trim()}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            {isSearching ? 'Søker...' : 'Søk'}
          </button>
        </div>
      </div>

      {results.length > 0 && (
        <div className="space-y-2">
          {results.map((result, index) => (
            <div
              key={index}
              onClick={() => {
                if (searchType === 'organization') {
                  onOrganizationSelect?.(result${typescript ? ' as Organization' : ''});
                } else {
                  onPersonSelect?.(result${typescript ? ' as Person' : ''});
                }
              }}
              className="p-4 bg-gray-50 hover:bg-gray-100 rounded-lg cursor-pointer transition-colors"
            >
              {searchType === 'organization' ? (
                <div>
                  <div className="font-medium text-gray-900">
                    {(result${typescript ? ' as Organization' : ''}).name}
                  </div>
                  <div className="text-sm text-gray-600">
                    Org.nr: {formatOrganizationNumber((result${typescript ? ' as Organization' : ''}).organizationNumber)}
                  </div>
                  {(result${typescript ? ' as Organization' : ''}).address && (
                    <div className="text-sm text-gray-500">
                      {(result${typescript ? ' as Organization' : ''}).address.streetAddress},{' '}
                      {(result${typescript ? ' as Organization' : ''}).address.postalCode}{' '}
                      {(result${typescript ? ' as Organization' : ''}).address.city}
                    </div>
                  )}
                </div>
              ) : (
                <div>
                  <div className="font-medium text-gray-900">
                    {(result${typescript ? ' as Person' : ''}).firstName} {(result${typescript ? ' as Person' : ''}).lastName}
                  </div>
                  <div className="text-sm text-gray-600">
                    Fødselsdato: {new Date((result${typescript ? ' as Person' : ''}).birthDate).toLocaleDateString('nb-NO')}
                  </div>
                  {(result${typescript ? ' as Person' : ''}).address && (
                    <div className="text-sm text-gray-500">
                      {(result${typescript ? ' as Person' : ''}).address.streetAddress},{' '}
                      {(result${typescript ? ' as Person' : ''}).address.postalCode}{' '}
                      {(result${typescript ? ' as Person' : ''}).address.city}
                    </div>
                  )}
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {searchQuery && results.length === 0 && !isSearching && (
        <div className="text-center text-gray-500 py-8">
          Ingen resultater funnet for "{searchQuery}"
        </div>
      )}
    </div>
  );
};`;

      fs.writeFileSync(path.join(outputDir, `AltinnRegistry${extension}`), registryContent, 'utf-8');
      result.files.push(path.join(outputDir, `AltinnRegistry${extension}`));
    }

    result.success = true;
  } catch (error: any) {
    result.errors?.push(`Altinn component generation failed: ${error.message}`);
  }

  return result;
}

/**
 * Generate Altinn service
 */
export async function generateAltinnService(options: IntegrationOptions): Promise<GenerationResult> {
  const result: GenerationResult = { success: false, files: [], errors: [], warnings: [] };

  try {
    const {
      projectName,
      outputPath,
      typescript = true,
      environment = 'test',
      organizationNumber = '',
      services = ['authentication', 'forms', 'registry'],
      gdprCompliant = true,
    } = options;

    const outputDir = outputPath || path.join(process.cwd(), 'src', 'services', 'altinn');
    if (!fs.existsSync(outputDir)) fs.mkdirSync(outputDir, { recursive: true });

    const serviceContent = `${typescript ? `import type { 
  AltinnUser, 
  AltinnForm, 
  Organization, 
  Person,
  AltinnCorrespondence,
  AltinnAuthorization 
} from './altinn.types';` : ''}
import crypto from 'crypto';

/**
 * Altinn Service
 * Handles integration with Norwegian government digital services
 */
export class AltinnService {
  private baseUrl${typescript ? ': string' : ''};
  private apiKey${typescript ? ': string' : ''};
  private organizationNumber${typescript ? ': string' : ''};
  private environment${typescript ? ": 'test' | 'production'" : ''};

  constructor(config${typescript ? ': { apiKey: string; organizationNumber: string; environment?: "test" | "production" }' : ''}) {
    this.apiKey = config.apiKey;
    this.organizationNumber = config.organizationNumber;
    this.environment = config.environment || 'test';
    this.baseUrl = this.environment === 'production' 
      ? 'https://platform.altinn.no'
      : 'https://platform.tt02.altinn.no';
  }

  /**
   * Authentication Methods
   */
  async authenticateWithIdPorten(code${typescript ? ': string' : ''}, state${typescript ? ': string' : ''})${typescript ? ': Promise<AltinnUser>' : ''} {
    try {
      const response = await fetch(\`\${this.baseUrl}/authentication/api/v1/exchange\`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'ApiKey': this.apiKey,
        },
        body: JSON.stringify({
          code,
          state,
          provider: 'idporten',
        }),
      });

      if (!response.ok) {
        throw new Error('ID-porten authentication failed');
      }

      const authResult = await response.json();
      
      // Get user profile
      const userResponse = await fetch(\`\${this.baseUrl}/authentication/api/v1/profile\`, {
        headers: {
          'Authorization': \`Bearer \${authResult.accessToken}\`,
          'ApiKey': this.apiKey,
        },
      });

      const userProfile = await userResponse.json();
      
      return {
        id: userProfile.userId,
        name: userProfile.name,
        personalNumber: userProfile.ssn,
        email: userProfile.email,
        phone: userProfile.phoneNumber,
        organizationName: userProfile.organizationName,
        organizationNumber: userProfile.organizationNumber,
        roles: userProfile.roles || [],
        accessToken: authResult.accessToken,
        refreshToken: authResult.refreshToken,
      };
    } catch (error) {
      console.error('Altinn authentication error:', error);
      throw error;
    }
  }

  async authenticateWithBankID(bankIdToken${typescript ? ': string' : ''})${typescript ? ': Promise<AltinnUser>' : ''} {
    try {
      // Exchange BankID token for Altinn token
      const response = await fetch(\`\${this.baseUrl}/authentication/api/v1/bankid/exchange\`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'ApiKey': this.apiKey,
        },
        body: JSON.stringify({
          bankIdToken,
          organizationNumber: this.organizationNumber,
        }),
      });

      if (!response.ok) {
        throw new Error('BankID to Altinn exchange failed');
      }

      const authResult = await response.json();
      
      // Get user profile
      const userResponse = await fetch(\`\${this.baseUrl}/authentication/api/v1/profile\`, {
        headers: {
          'Authorization': \`Bearer \${authResult.accessToken}\`,
          'ApiKey': this.apiKey,
        },
      });

      const userProfile = await userResponse.json();
      
      return {
        id: userProfile.userId,
        name: userProfile.name,
        personalNumber: userProfile.ssn,
        email: userProfile.email,
        phone: userProfile.phoneNumber,
        organizationName: userProfile.organizationName,
        organizationNumber: userProfile.organizationNumber,
        roles: userProfile.roles || [],
        accessToken: authResult.accessToken,
        refreshToken: authResult.refreshToken,
      };
    } catch (error) {
      console.error('BankID authentication error:', error);
      throw error;
    }
  }

  /**
   * Forms and Storage Methods
   */
  async getAvailableForms(userId${typescript ? ': string' : ''})${typescript ? ': Promise<AltinnForm[]>' : ''} {
    try {
      const response = await fetch(
        \`\${this.baseUrl}/storage/api/v1/applications/\${this.organizationNumber}/forms\`,
        {
          headers: {
            'ApiKey': this.apiKey,
            'UserId': userId,
          },
        }
      );

      if (!response.ok) {
        throw new Error('Failed to fetch forms');
      }

      const forms = await response.json();
      return forms;
    } catch (error) {
      console.error('Get forms error:', error);
      throw error;
    }
  }

  async getFormById(formId${typescript ? ': string' : ''})${typescript ? ': Promise<AltinnForm>' : ''} {
    try {
      const response = await fetch(
        \`\${this.baseUrl}/storage/api/v1/applications/\${this.organizationNumber}/forms/\${formId}\`,
        {
          headers: {
            'ApiKey': this.apiKey,
          },
        }
      );

      if (!response.ok) {
        throw new Error('Failed to fetch form');
      }

      const form = await response.json();
      return form;
    } catch (error) {
      console.error('Get form error:', error);
      throw error;
    }
  }

  async submitForm(formId${typescript ? ': string' : ''}, data${typescript ? ': any' : ''}, userId${typescript ? ': string' : ''})${typescript ? ': Promise<{ instanceId: string; receiptId: string }>' : ''} {
    try {
      ${gdprCompliant ? `
      // GDPR compliance: Log data processing
      await this.logDataProcessing('form_submission', userId, {
        formId,
        timestamp: new Date().toISOString(),
        dataCategories: this.extractDataCategories(data),
      });
      ` : ''}

      const response = await fetch(
        \`\${this.baseUrl}/storage/api/v1/applications/\${this.organizationNumber}/instances\`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'ApiKey': this.apiKey,
            'UserId': userId,
          },
          body: JSON.stringify({
            appId: formId,
            instanceOwner: {
              personNumber: userId,
              organisationNumber: this.organizationNumber,
            },
            dataValues: data,
          }),
        }
      );

      if (!response.ok) {
        throw new Error('Form submission failed');
      }

      const instance = await response.json();
      
      return {
        instanceId: instance.id,
        receiptId: instance.data?.receiptId || instance.id,
      };
    } catch (error) {
      console.error('Form submission error:', error);
      throw error;
    }
  }

  /**
   * Registry Methods
   */
  async searchOrganizations(query${typescript ? ': string' : ''})${typescript ? ': Promise<Organization[]>' : ''} {
    try {
      const response = await fetch(
        \`\${this.baseUrl}/register/api/v1/organizations?query=\${encodeURIComponent(query)}\`,
        {
          headers: {
            'ApiKey': this.apiKey,
          },
        }
      );

      if (!response.ok) {
        throw new Error('Organization search failed');
      }

      const results = await response.json();
      return results.organizations || [];
    } catch (error) {
      console.error('Organization search error:', error);
      throw error;
    }
  }

  async getOrganizationByNumber(orgNumber${typescript ? ': string' : ''})${typescript ? ': Promise<Organization>' : ''} {
    try {
      const response = await fetch(
        \`\${this.baseUrl}/register/api/v1/organizations/\${orgNumber}\`,
        {
          headers: {
            'ApiKey': this.apiKey,
          },
        }
      );

      if (!response.ok) {
        throw new Error('Organization not found');
      }

      const organization = await response.json();
      return organization;
    } catch (error) {
      console.error('Get organization error:', error);
      throw error;
    }
  }

  async searchPersons(query${typescript ? ': string' : ''}, includeAddress${typescript ? ': boolean' : ''} = false)${typescript ? ': Promise<Person[]>' : ''} {
    try {
      ${gdprCompliant ? `
      // GDPR compliance: Person search requires special authorization
      const authorized = await this.checkPersonSearchAuthorization();
      if (!authorized) {
        throw new Error('Not authorized to search persons');
      }
      ` : ''}

      const response = await fetch(
        \`\${this.baseUrl}/register/api/v1/persons?query=\${encodeURIComponent(query)}&includeAddress=\${includeAddress}\`,
        {
          headers: {
            'ApiKey': this.apiKey,
            'X-GDPR-Purpose': 'legitimate-interest',
          },
        }
      );

      if (!response.ok) {
        throw new Error('Person search failed');
      }

      const results = await response.json();
      return results.persons || [];
    } catch (error) {
      console.error('Person search error:', error);
      throw error;
    }
  }

  /**
   * Correspondence Methods
   */
  async sendCorrespondence(correspondence${typescript ? ': AltinnCorrespondence' : ''})${typescript ? ': Promise<{ correspondenceId: string }>' : ''} {
    try {
      const response = await fetch(
        \`\${this.baseUrl}/correspondence/api/v1/correspondence\`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'ApiKey': this.apiKey,
          },
          body: JSON.stringify({
            serviceCode: correspondence.serviceCode,
            serviceEdition: correspondence.serviceEdition,
            reportee: correspondence.recipientNumber,
            content: {
              title: correspondence.title,
              body: correspondence.body,
              summary: correspondence.summary,
              attachments: correspondence.attachments,
            },
            visibleDateTime: correspondence.visibleDateTime || new Date().toISOString(),
            allowSystemDeleteDateTime: correspondence.allowSystemDeleteDateTime,
            dueDateTime: correspondence.dueDateTime,
            notification: correspondence.sendNotification,
            ${gdprCompliant ? `
            gdprMetadata: {
              purpose: correspondence.gdprPurpose || 'service-delivery',
              legalBasis: correspondence.legalBasis || 'contract',
              dataCategories: correspondence.dataCategories || ['contact-info'],
            },
            ` : ''}
          }),
        }
      );

      if (!response.ok) {
        throw new Error('Failed to send correspondence');
      }

      const result = await response.json();
      return {
        correspondenceId: result.correspondenceId,
      };
    } catch (error) {
      console.error('Send correspondence error:', error);
      throw error;
    }
  }

  /**
   * Authorization Methods
   */
  async checkAuthorization(userId${typescript ? ': string' : ''}, resource${typescript ? ': string' : ''}, action${typescript ? ': string' : ''})${typescript ? ': Promise<boolean>' : ''} {
    try {
      const response = await fetch(
        \`\${this.baseUrl}/authorization/api/v1/decision\`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'ApiKey': this.apiKey,
          },
          body: JSON.stringify({
            subject: {
              type: 'person',
              id: userId,
            },
            resource: {
              type: 'app',
              id: resource,
              org: this.organizationNumber,
            },
            action: action,
          }),
        }
      );

      if (!response.ok) {
        return false;
      }

      const decision = await response.json();
      return decision.decision === 'permit';
    } catch (error) {
      console.error('Authorization check error:', error);
      return false;
    }
  }

  async getUserRoles(userId${typescript ? ': string' : ''})${typescript ? ': Promise<string[]>' : ''} {
    try {
      const response = await fetch(
        \`\${this.baseUrl}/authorization/api/v1/roles?subject=\${userId}&org=\${this.organizationNumber}\`,
        {
          headers: {
            'ApiKey': this.apiKey,
          },
        }
      );

      if (!response.ok) {
        throw new Error('Failed to fetch user roles');
      }

      const roles = await response.json();
      return roles.map((role${typescript ? ': any' : ''}) => role.code);
    } catch (error) {
      console.error('Get user roles error:', error);
      throw error;
    }
  }

  ${gdprCompliant ? `
  /**
   * GDPR Compliance Methods
   */
  private async logDataProcessing(activity${typescript ? ': string' : ''}, userId${typescript ? ': string' : ''}, metadata${typescript ? ': any' : ''})${typescript ? ': Promise<void>' : ''} {
    try {
      await fetch(\`\${this.baseUrl}/gdpr/api/v1/audit\`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'ApiKey': this.apiKey,
        },
        body: JSON.stringify({
          activity,
          userId,
          organizationNumber: this.organizationNumber,
          timestamp: new Date().toISOString(),
          metadata,
        }),
      });
    } catch (error) {
      console.warn('GDPR audit logging failed:', error);
    }
  }

  private extractDataCategories(data${typescript ? ': any' : ''})${typescript ? ': string[]' : ''} {
    const categories${typescript ? ': string[]' : ''} = [];
    
    if (data.personalNumber || data.ssn) categories.push('national-id');
    if (data.email) categories.push('contact-info');
    if (data.phone || data.mobile) categories.push('contact-info');
    if (data.address) categories.push('location-data');
    if (data.bankAccount) categories.push('financial-data');
    
    return [...new Set(categories)];
  }

  private async checkPersonSearchAuthorization()${typescript ? ': Promise<boolean>' : ''} {
    // Check if the organization has authorization to search persons
    // This would typically check specific roles or permissions
    return true;
  }
  ` : ''}

  /**
   * Utility Methods
   */
  generateStateParameter()${typescript ? ': string' : ''} {
    return crypto.randomBytes(32).toString('hex');
  }

  getAuthorizationUrl(state${typescript ? ': string' : ''}, redirectUri${typescript ? ': string' : ''})${typescript ? ': string' : ''} {
    const baseAuthUrl = this.environment === 'production'
      ? 'https://idporten.difi.no/authorize'
      : 'https://idporten-ver2.difi.no/authorize';
    
    const params = new URLSearchParams({
      response_type: 'code',
      client_id: this.organizationNumber,
      redirect_uri: redirectUri,
      scope: 'openid profile altinn:organizations altinn:instances.read',
      state: state,
      nonce: crypto.randomBytes(16).toString('hex'),
      ui_locales: 'nb',
      acr_values: 'Level4',
    });

    return \`\${baseAuthUrl}?\${params.toString()}\`;
  }
}

// Create and export service instance
export const altinnService = new AltinnService({
  apiKey: process.env.ALTINN_API_KEY || '',
  organizationNumber: process.env.ALTINN_ORGANIZATION_NUMBER || '',
  environment: (process.env.ALTINN_ENVIRONMENT || 'test')${typescript ? " as 'test' | 'production'" : ''},
});

// Export configuration utilities
export const AltinnConfig = {
  /**
   * Validate organization number format
   */
  isValidOrganizationNumber(orgNumber${typescript ? ': string' : ''})${typescript ? ': boolean' : ''} {
    return /^\d{9}$/.test(orgNumber);
  },

  /**
   * Format organization number for display
   */
  formatOrganizationNumber(orgNumber${typescript ? ': string' : ''})${typescript ? ': string' : ''} {
    return orgNumber.replace(/(\d{3})(\d{3})(\d{3})/, '$1 $2 $3');
  },

  /**
   * Get service endpoints
   */
  getEndpoints(environment${typescript ? ": 'test' | 'production'" : ''} = 'test') {
    const base = environment === 'production' 
      ? 'https://platform.altinn.no'
      : 'https://platform.tt02.altinn.no';
    
    return {
      authentication: \`\${base}/authentication/api/v1\`,
      storage: \`\${base}/storage/api/v1\`,
      register: \`\${base}/register/api/v1\`,
      correspondence: \`\${base}/correspondence/api/v1\`,
      authorization: \`\${base}/authorization/api/v1\`,
    };
  },
};`;

    const extension = typescript ? '.ts' : '.js';
    fs.writeFileSync(path.join(outputDir, `altinn${extension}`), serviceContent, 'utf-8');
    result.files.push(path.join(outputDir, `altinn${extension}`));

    if (typescript) {
      const typesContent = `export interface AltinnUser {
  id: string;
  name: string;
  personalNumber?: string;
  email?: string;
  phone?: string;
  organizationName?: string;
  organizationNumber?: string;
  roles: string[];
  accessToken: string;
  refreshToken?: string;
}

export interface AltinnForm {
  id: string;
  title: string;
  description?: string;
  version: string;
  dataType: string;
  fields: AltinnFormField[];
  validationRules?: AltinnValidationRule[];
  processSteps?: string[];
}

export interface AltinnFormField {
  id: string;
  type: 'text' | 'email' | 'tel' | 'number' | 'date' | 'textarea' | 'select' | 'checkbox' | 'radio' | 'file';
  label: string;
  placeholder?: string;
  helpText?: string;
  required: boolean;
  defaultValue?: any;
  options?: { value: string; label: string }[];
  validation?: {
    pattern?: string;
    min?: number;
    max?: number;
    minLength?: number;
    maxLength?: number;
  };
}

export interface AltinnValidationRule {
  field: string;
  type: 'required' | 'pattern' | 'custom';
  message: string;
  value?: any;
}

export interface AltinnFormSubmission {
  formId: string;
  organizationNumber: string;
  data: Record<string, any>;
  timestamp: string;
  userId?: string;
  instanceId?: string;
  attachments?: AltinnAttachment[];
}

export interface AltinnAttachment {
  id: string;
  fileName: string;
  fileType: string;
  fileSize: number;
  dataType: string;
  url?: string;
}

export interface Organization {
  organizationNumber: string;
  name: string;
  organizationForm: string;
  status: string;
  type: string;
  parentOrganizationNumber?: string;
  address?: Address;
  phoneNumber?: string;
  emailAddress?: string;
  internetAddress?: string;
  mailingAddress?: Address;
  businessAddress?: Address;
  registrationDate?: string;
  employeeCount?: number;
  industryCodes?: IndustryCode[];
}

export interface Person {
  personalNumber: string;
  firstName: string;
  middleName?: string;
  lastName: string;
  birthDate: string;
  gender?: 'M' | 'F';
  address?: Address;
  phoneNumber?: string;
  emailAddress?: string;
  citizenship?: string;
  maritalStatus?: string;
}

export interface Address {
  streetAddress: string;
  postalCode: string;
  city: string;
  country?: string;
}

export interface IndustryCode {
  code: string;
  description: string;
  isPrimary: boolean;
}

export interface AltinnCorrespondence {
  serviceCode: string;
  serviceEdition: string;
  recipientNumber: string;
  title: string;
  summary: string;
  body: string;
  attachments?: AltinnAttachment[];
  visibleDateTime?: string;
  dueDateTime?: string;
  allowSystemDeleteDateTime?: string;
  sendNotification?: boolean;
  notificationEmail?: string;
  notificationSms?: string;
  gdprPurpose?: string;
  legalBasis?: string;
  dataCategories?: string[];
}

export interface AltinnAuthorization {
  subject: {
    type: 'person' | 'organization';
    id: string;
  };
  resource: {
    type: 'app' | 'service';
    id: string;
    org?: string;
  };
  action: string;
  decision: 'permit' | 'deny';
  obligations?: string[];
}

export interface AltinnAuthResult {
  user: AltinnUser;
  expiresAt: Date;
  refreshExpiresAt?: Date;
  sessionId: string;
}

export interface AltinnConfig {
  baseUrl: string;
  apiVersion: string;
  organizationNumber: string;
  apiKey: string;
  environment: 'test' | 'production';
  services: {
    authentication: boolean;
    forms: boolean;
    registry: boolean;
    correspondence: boolean;
    authorization: boolean;
  };
}`;

      fs.writeFileSync(path.join(outputDir, 'altinn.types.ts'), typesContent, 'utf-8');
      result.files.push(path.join(outputDir, 'altinn.types.ts'));
    }

    result.success = true;
  } catch (error: any) {
    result.errors?.push(`Altinn service generation failed: ${error.message}`);
  }

  return result;
}