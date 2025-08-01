import { PDFGenerator, generatePDFComponent, type DocumentOptions } from './pdf-generator';
import Handlebars from 'handlebars';
import type { NorwegianInvoice } from '../../types';

/**
 * Norwegian Invoice Data Interface
 */
export interface InvoiceData {
  invoiceNumber: string;
  invoiceDate: Date;
  dueDate: Date;
  seller: {
    name: string;
    orgNumber: string;
    mvaNumber?: string;
    address: string;
    postalCode: string;
    city: string;
    country?: string;
    email?: string;
    phone?: string;
  };
  buyer: {
    name: string;
    orgNumber?: string;
    address: string;
    postalCode: string;
    city: string;
    country?: string;
    email?: string;
  };
  items: Array<{
    description: string;
    quantity: number;
    unitPrice: number;
    mvaRate: '0' | '12' | '15' | '25';
    total: number;
  }>;
  subtotal: number;
  mvaAmount: number;
  total: number;
  paymentTerms?: string;
  bankAccount?: string;
  reference?: string;
  notes?: string;
}

/**
 * Norwegian VAT Rates
 */
export const NORWEGIAN_VAT_RATES = {
  '0': 0,    // Exempt from VAT
  '12': 12,  // Reduced rate for food
  '15': 15,  // Reduced rate for transport
  '25': 25,  // Standard rate
} as const;

/**
 * Norwegian Invoice Generator
 * Generates professional Norwegian invoices with MVA (VAT) calculations
 */
export class NorwegianInvoiceGenerator {
  private generator: PDFGenerator;

  constructor() {
    this.generator = new PDFGenerator();
    this.registerNorwegianHelpers();
  }

  /**
   * Generate Norwegian invoice PDF
   * @param data - Invoice data
   * @returns Promise<Buffer> - Generated PDF buffer
   */
  async generateNorwegianInvoice(data: InvoiceData): Promise<Buffer> {
    // Validate invoice data
    this.validateInvoiceData(data);

    // Calculate totals if not provided
    const calculatedData = this.calculateTotals(data);

    const template = this.getNorwegianInvoiceTemplate();
    
    const documentOptions: DocumentOptions = {
      template,
      data: {
        ...calculatedData,
        generatedAt: new Date(),
        // Add Norwegian formatting
        formattedInvoiceDate: this.formatNorwegianDate(calculatedData.invoiceDate),
        formattedDueDate: this.formatNorwegianDate(calculatedData.dueDate),
        formattedSubtotal: this.formatNorwegianCurrency(calculatedData.subtotal),
        formattedMvaAmount: this.formatNorwegianCurrency(calculatedData.mvaAmount),
        formattedTotal: this.formatNorwegianCurrency(calculatedData.total),
      },
      metadata: {
        title: `Faktura ${calculatedData.invoiceNumber}`,
        author: calculatedData.seller.name,
        subject: 'Norsk faktura med MVA',
        keywords: ['faktura', 'invoice', 'norwegian', 'mva', 'vat'],
        creator: 'Xaheen Norwegian Invoice Generator',
        producer: 'Xaheen CLI',
      },
      fonts: {
        supportNorwegian: true,
      },
    };

    const result = await generatePDFComponent(documentOptions);
    
    if (!result.success || !result.buffer) {
      throw new Error(result.error || 'Norwegian invoice generation failed');
    }

    return result.buffer;
  }

  /**
   * Calculate invoice totals and MVA
   * @param data - Invoice data
   * @returns InvoiceData with calculated totals
   */
  private calculateTotals(data: InvoiceData): InvoiceData {
    let subtotal = 0;
    let totalMva = 0;

    // Calculate item totals and MVA
    const calculatedItems = data.items.map(item => {
      const itemTotal = item.quantity * item.unitPrice;
      const mvaRate = NORWEGIAN_VAT_RATES[item.mvaRate] / 100;
      const itemMva = itemTotal * mvaRate;
      
      subtotal += itemTotal;
      totalMva += itemMva;

      return {
        ...item,
        total: itemTotal,
        mvaAmount: itemMva,
      };
    });

    const total = subtotal + totalMva;

    return {
      ...data,
      items: calculatedItems,
      subtotal,
      mvaAmount: totalMva,
      total,
    };
  }

  /**
   * Validate Norwegian invoice data
   * @param data - Invoice data to validate
   */
  private validateInvoiceData(data: InvoiceData): void {
    if (!data.invoiceNumber || data.invoiceNumber.trim().length === 0) {
      throw new Error('Invoice number is required');
    }

    if (!data.seller.name || data.seller.name.trim().length === 0) {
      throw new Error('Seller name is required');
    }

    if (!data.seller.orgNumber || data.seller.orgNumber.length !== 9) {
      throw new Error('Norwegian organization number must be 9 digits');
    }

    if (!data.buyer.name || data.buyer.name.trim().length === 0) {
      throw new Error('Buyer name is required');
    }

    if (!data.items || data.items.length === 0) {
      throw new Error('Invoice must have at least one item');
    }

    // Validate postal codes (Norwegian format: 4 digits)
    if (!/^\d{4}$/.test(data.seller.postalCode)) {
      throw new Error('Norwegian postal code must be 4 digits');
    }

    if (!/^\d{4}$/.test(data.buyer.postalCode)) {
      throw new Error('Norwegian postal code must be 4 digits');
    }

    // Validate items
    data.items.forEach((item, index) => {
      if (!item.description || item.description.trim().length === 0) {
        throw new Error(`Item ${index + 1}: Description is required`);
      }

      if (item.quantity <= 0) {
        throw new Error(`Item ${index + 1}: Quantity must be positive`);
      }

      if (item.unitPrice < 0) {
        throw new Error(`Item ${index + 1}: Unit price cannot be negative`);
      }

      if (!Object.keys(NORWEGIAN_VAT_RATES).includes(item.mvaRate)) {
        throw new Error(`Item ${index + 1}: Invalid MVA rate. Must be 0, 12, 15, or 25`);
      }
    });
  }

  /**
   * Get Norwegian invoice template
   * @returns Handlebars template string
   */
  private getNorwegianInvoiceTemplate(): string {
    return `
# FAKTURA

**Fakturanummer:** {{invoiceNumber}}
**Fakturadato:** {{formattedInvoiceDate}}
**Forfallsdato:** {{formattedDueDate}}

---

## Selger
**{{seller.name}}**
{{#if seller.orgNumber}}Org.nr: {{seller.orgNumber}}{{/if}}
{{#if seller.mvaNumber}}MVA-nr: {{seller.mvaNumber}}{{/if}}
{{seller.address}}
{{seller.postalCode}} {{seller.city}}
{{#if seller.country}}{{seller.country}}{{/if}}
{{#if seller.email}}E-post: {{seller.email}}{{/if}}
{{#if seller.phone}}Telefon: {{seller.phone}}{{/if}}

## Kjøper
**{{buyer.name}}**
{{#if buyer.orgNumber}}Org.nr: {{buyer.orgNumber}}{{/if}}
{{buyer.address}}
{{buyer.postalCode}} {{buyer.city}}
{{#if buyer.country}}{{buyer.country}}{{/if}}
{{#if buyer.email}}E-post: {{buyer.email}}{{/if}}

---

## Fakturalinjer

{{#each items}}
**{{@index}}. {{description}}**
Antall: {{quantity}} × {{formatNorwegianCurrency unitPrice}} = {{formatNorwegianCurrency total}}
MVA-sats: {{mvaRate}}%

{{/each}}

---

## Sammendrag

| Beskrivelse | Beløp |
|-------------|-------|
| Subtotal (eks. MVA) | {{formattedSubtotal}} |
| MVA | {{formattedMvaAmount}} |
| **Total** | **{{formattedTotal}}** |

---

## Betalingsinformasjon

**Betalingsbetingelser:** {{#if paymentTerms}}{{paymentTerms}}{{else}}30 dager{{/if}}
{{#if bankAccount}}**Kontonummer:** {{bankAccount}}{{/if}}
{{#if reference}}**Referanse:** {{reference}}{{/if}}

{{#if notes}}
## Merknader
{{notes}}
{{/if}}

---

*Generert med Xaheen CLI den {{formatNorwegianDate generatedAt}}*
    `.trim();
  }

  /**
   * Register Norwegian-specific Handlebars helpers
   */
  private registerNorwegianHelpers(): void {
    // Norwegian date formatting
    Handlebars.registerHelper('formatNorwegianDate', (date: Date) => {
      return this.formatNorwegianDate(date);
    });

    // Norwegian currency formatting
    Handlebars.registerHelper('formatNorwegianCurrency', (amount: number) => {
      return this.formatNorwegianCurrency(amount);
    });

    // Norwegian number formatting
    Handlebars.registerHelper('formatNorwegianNumber', (number: number) => {
      return this.formatNorwegianNumber(number);
    });

    // Organization number formatting
    Handlebars.registerHelper('formatOrgNumber', (orgNumber: string) => {
      if (orgNumber && orgNumber.length === 9) {
        return `${orgNumber.slice(0, 3)} ${orgNumber.slice(3, 6)} ${orgNumber.slice(6)}`;
      }
      return orgNumber;
    });

    // Bank account formatting
    Handlebars.registerHelper('formatBankAccount', (account: string) => {
      if (account && account.length === 11) {
        return `${account.slice(0, 4)}.${account.slice(4, 6)}.${account.slice(6)}`;
      }
      return account;
    });
  }

  /**
   * Format date in Norwegian format
   * @param date - Date to format
   * @returns Formatted date string
   */
  private formatNorwegianDate(date: Date): string {
    return new Intl.DateTimeFormat('nb-NO', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    }).format(date);
  }

  /**
   * Format currency in Norwegian format
   * @param amount - Amount to format
   * @returns Formatted currency string
   */
  private formatNorwegianCurrency(amount: number): string {
    return new Intl.NumberFormat('nb-NO', {
      style: 'currency',
      currency: 'NOK',
    }).format(amount);
  }

  /**
   * Format number in Norwegian format
   * @param number - Number to format
   * @returns Formatted number string
   */
  private formatNorwegianNumber(number: number): string {
    return new Intl.NumberFormat('nb-NO').format(number);
  }

  /**
   * Generate invoice from template file
   * @param templatePath - Path to custom template
   * @param data - Invoice data
   * @returns Promise<Buffer> - Generated PDF buffer
   */
  async generateFromTemplate(templatePath: string, data: InvoiceData): Promise<Buffer> {
    const fs = await import('fs/promises');
    const templateContent = await fs.readFile(templatePath, 'utf-8');
    
    const calculatedData = this.calculateTotals(data);
    
    const documentOptions: DocumentOptions = {
      template: templateContent,
      data: {
        ...calculatedData,
        generatedAt: new Date(),
      },
      metadata: {
        title: `Faktura ${calculatedData.invoiceNumber}`,
        author: calculatedData.seller.name,
        subject: 'Norsk faktura',
        creator: 'Xaheen Norwegian Invoice Generator',
      },
    };

    const result = await generatePDFComponent(documentOptions);
    
    if (!result.success || !result.buffer) {
      throw new Error(result.error || 'Invoice generation from template failed');
    }

    return result.buffer;
  }
}

/**
 * Convenience function for generating Norwegian invoices
 * @param data - Invoice data
 * @returns Promise<Buffer> - Generated PDF buffer
 */
export async function generateNorwegianInvoice(data: InvoiceData): Promise<Buffer> {
  const generator = new NorwegianInvoiceGenerator();
  return generator.generateNorwegianInvoice(data);
}

/**
 * Create sample Norwegian invoice data for testing
 * @returns Sample invoice data
 */
export function createSampleInvoiceData(): InvoiceData {
  const invoiceDate = new Date();
  const dueDate = new Date(invoiceDate.getTime() + 30 * 24 * 60 * 60 * 1000); // 30 days later

  return {
    invoiceNumber: `INV-${invoiceDate.getFullYear()}-${String(invoiceDate.getMonth() + 1).padStart(2, '0')}-001`,
    invoiceDate,
    dueDate,
    seller: {
      name: 'Xaheen Technologies AS',
      orgNumber: '123456789',
      mvaNumber: 'NO123456789MVA',
      address: 'Teknologiveien 1',
      postalCode: '0001',
      city: 'Oslo',
      country: 'Norge',
      email: 'faktura@xaheen.no',
      phone: '+47 12 34 56 78',
    },
    buyer: {
      name: 'Kunde AS',
      orgNumber: '987654321',
      address: 'Kundeveien 2',
      postalCode: '0002',
      city: 'Bergen',
      country: 'Norge',
      email: 'kunde@example.no',
    },
    items: [
      {
        description: 'Xaheen CLI Professional License',
        quantity: 1,
        unitPrice: 5000,
        mvaRate: '25',
        total: 5000,
      },
      {
        description: 'Support og vedlikehold (12 måneder)',
        quantity: 12,
        unitPrice: 500,
        mvaRate: '25',
        total: 6000,
      },
    ],
    subtotal: 11000,
    mvaAmount: 2750,
    total: 13750,
    paymentTerms: '30 dager',
    bankAccount: '12345678901',
    reference: 'REF-2025-001',
    notes: 'Takk for din bestilling! Ved spørsmål, kontakt oss på support@xaheen.no',
  };
}
