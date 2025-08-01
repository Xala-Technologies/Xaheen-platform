import { z } from 'zod';
import type { GenerationResult } from '../../types.js';
import { PDFDocument, StandardFonts, rgb, PDFPage } from 'pdf-lib';

/**
 * Contract Document Generation System
 * 
 * Generates Norwegian legal documents with proper formatting,
 * digital signatures, versioning, and compliance validation
 */

// Contract types
export enum ContractType {
  EMPLOYMENT = 'employment',
  SERVICE = 'service',
  RENTAL = 'rental',
  PURCHASE = 'purchase',
  NDA = 'nda',
  PARTNERSHIP = 'partnership',
  LOAN = 'loan',
  CUSTOM = 'custom'
}

// Contract data schema
const contractDataSchema = z.object({
  type: z.nativeEnum(ContractType),
  title: z.string(),
  language: z.enum(['nb', 'nn', 'en']).default('nb'),
  parties: z.array(z.object({
    type: z.enum(['individual', 'company']),
    name: z.string(),
    orgNumber: z.string().optional(),
    personalNumber: z.string().optional(),
    address: z.object({
      street: z.string(),
      postalCode: z.string(),
      city: z.string(),
      country: z.string().default('Norge')
    }),
    role: z.enum(['party1', 'party2', 'witness', 'guarantor']),
    representative: z.object({
      name: z.string(),
      title: z.string()
    }).optional()
  })),
  terms: z.object({
    effectiveDate: z.date(),
    expirationDate: z.date().optional(),
    autoRenewal: z.boolean().default(false),
    renewalPeriod: z.string().optional(),
    terminationNotice: z.string().optional(),
    governingLaw: z.string().default('Norwegian law'),
    jurisdiction: z.string().default('Oslo District Court')
  }),
  clauses: z.array(z.object({
    title: z.string(),
    content: z.string(),
    type: z.enum(['standard', 'custom', 'mandatory']),
    order: z.number()
  })),
  financials: z.object({
    amount: z.number().optional(),
    currency: z.string().default('NOK'),
    vat: z.boolean().default(true),
    vatRate: z.number().default(25),
    paymentTerms: z.string().optional(),
    penalties: z.object({
      latePayment: z.number().optional(),
      breach: z.number().optional()
    }).optional()
  }).optional(),
  signatures: z.array(z.object({
    partyRole: z.string(),
    signatureType: z.enum(['manual', 'digital', 'bankid']),
    signedDate: z.date().optional(),
    signatureData: z.string().optional()
  })),
  metadata: z.object({
    version: z.string().default('1.0'),
    previousVersions: z.array(z.string()).optional(),
    createdBy: z.string(),
    createdDate: z.date().default(new Date()),
    modifiedBy: z.string().optional(),
    modifiedDate: z.date().optional(),
    confidentiality: z.enum(['public', 'internal', 'confidential']).default('confidential'),
    tags: z.array(z.string()).optional()
  })
});

export type ContractData = z.infer<typeof contractDataSchema>;

// Norwegian legal clause templates
const norwegianClauses = {
  employment: {
    position: {
      nb: 'Arbeidstaker ansettes i stillingen som {{position}} med arbeidssted {{workplace}}.',
      en: 'The Employee is hired in the position of {{position}} with workplace at {{workplace}}.'
    },
    salary: {
      nb: 'Arbeidstaker skal ha en årlig bruttolønn på kr {{salary}} som utbetales månedlig.',
      en: 'The Employee shall receive an annual gross salary of NOK {{salary}} paid monthly.'
    },
    workingHours: {
      nb: 'Normal arbeidstid er {{hours}} timer per uke fordelt på {{days}} dager.',
      en: 'Normal working hours are {{hours}} hours per week distributed over {{days}} days.'
    },
    vacation: {
      nb: 'Arbeidstaker har rett til ferie i henhold til ferieloven.',
      en: 'The Employee is entitled to vacation in accordance with the Holiday Act.'
    },
    termination: {
      nb: 'Oppsigelsestid er {{notice}} måneder gjensidig.',
      en: 'Notice period is {{notice}} months mutually.'
    }
  },
  service: {
    scope: {
      nb: 'Leverandøren skal levere følgende tjenester: {{services}}',
      en: 'The Supplier shall deliver the following services: {{services}}'
    },
    payment: {
      nb: 'Kjøper skal betale kr {{amount}} ekskl. mva for tjenestene.',
      en: 'The Buyer shall pay NOK {{amount}} excl. VAT for the services.'
    },
    delivery: {
      nb: 'Tjenestene skal leveres innen {{deadline}}.',
      en: 'The services shall be delivered by {{deadline}}.'
    },
    liability: {
      nb: 'Leverandørens samlede erstatningsansvar er begrenset til kontraktssummen.',
      en: 'The Supplier\'s total liability is limited to the contract sum.'
    }
  },
  rental: {
    property: {
      nb: 'Utleier leier ut {{property}} til leietaker.',
      en: 'The Landlord rents out {{property}} to the Tenant.'
    },
    rent: {
      nb: 'Månedlig leie er kr {{rent}} som betales forskuddsvis.',
      en: 'Monthly rent is NOK {{rent}} payable in advance.'
    },
    deposit: {
      nb: 'Leietaker skal betale et depositum tilsvarende {{months}} måneders leie.',
      en: 'The Tenant shall pay a deposit equal to {{months}} months\' rent.'
    },
    maintenance: {
      nb: 'Utleier er ansvarlig for utvendig vedlikehold. Leietaker er ansvarlig for innvendig vedlikehold.',
      en: 'The Landlord is responsible for external maintenance. The Tenant is responsible for internal maintenance.'
    }
  },
  nda: {
    confidentiality: {
      nb: 'Partene forplikter seg til å behandle all informasjon som konfidensielt.',
      en: 'The Parties undertake to treat all information as confidential.'
    },
    duration: {
      nb: 'Konfidensialitetsforpliktelsen gjelder i {{years}} år etter avtalens opphør.',
      en: 'The confidentiality obligation applies for {{years}} years after termination.'
    },
    exceptions: {
      nb: 'Konfidensialitetsplikten gjelder ikke informasjon som er offentlig kjent.',
      en: 'The confidentiality obligation does not apply to publicly known information.'
    }
  }
};

/**
 * Contract Generator
 */
export class ContractGenerator {
  private translations: Record<string, Record<string, string>> = {
    nb: {
      contract: 'Kontrakt',
      agreement: 'Avtale',
      between: 'mellom',
      and: 'og',
      parties: 'Parter',
      party1: 'Part 1',
      party2: 'Part 2',
      witness: 'Vitne',
      guarantor: 'Garantist',
      terms: 'Vilkår',
      effectiveDate: 'Ikrafttredelse',
      expirationDate: 'Utløpsdato',
      signatures: 'Signaturer',
      place: 'Sted',
      date: 'Dato',
      signature: 'Signatur',
      name: 'Navn',
      title: 'Tittel',
      orgNumber: 'Org.nr',
      personalNumber: 'Personnr',
      address: 'Adresse',
      confidential: 'Konfidensielt',
      version: 'Versjon',
      page: 'Side',
      of: 'av',
      employmentContract: 'Arbeidsavtale',
      serviceContract: 'Tjenesteavtale',
      rentalContract: 'Leieavtale',
      purchaseContract: 'Kjøpsavtale',
      ndaContract: 'Konfidensialitetsavtale',
      partnershipContract: 'Partnerskapsavtale',
      loanContract: 'Låneavtale'
    },
    en: {
      contract: 'Contract',
      agreement: 'Agreement',
      between: 'between',
      and: 'and',
      parties: 'Parties',
      party1: 'Party 1',
      party2: 'Party 2',
      witness: 'Witness',
      guarantor: 'Guarantor',
      terms: 'Terms',
      effectiveDate: 'Effective Date',
      expirationDate: 'Expiration Date',
      signatures: 'Signatures',
      place: 'Place',
      date: 'Date',
      signature: 'Signature',
      name: 'Name',
      title: 'Title',
      orgNumber: 'Org. No.',
      personalNumber: 'Personal No.',
      address: 'Address',
      confidential: 'Confidential',
      version: 'Version',
      page: 'Page',
      of: 'of',
      employmentContract: 'Employment Contract',
      serviceContract: 'Service Contract',
      rentalContract: 'Rental Contract',
      purchaseContract: 'Purchase Contract',
      ndaContract: 'Non-Disclosure Agreement',
      partnershipContract: 'Partnership Agreement',
      loanContract: 'Loan Agreement'
    }
  };

  /**
   * Generate contract document
   */
  async generateContract(
    template: string,
    parties: any[]
  ): Promise<Buffer> {
    // Parse contract data
    const contractData = contractDataSchema.parse({
      type: this.getContractTypeFromTemplate(template),
      title: this.getContractTitle(template),
      parties,
      terms: {
        effectiveDate: new Date(),
        governingLaw: 'Norwegian law'
      },
      clauses: [],
      signatures: parties.map(p => ({
        partyRole: p.role,
        signatureType: 'manual'
      })),
      metadata: {
        createdBy: 'Contract Generator',
        confidentiality: 'confidential'
      }
    });

    // Generate PDF
    return this.generateContractPDF(contractData);
  }

  /**
   * Generate contract PDF
   */
  private async generateContractPDF(data: ContractData): Promise<Buffer> {
    const pdfDoc = await PDFDocument.create();
    
    // Embed fonts
    const helvetica = await pdfDoc.embedFont(StandardFonts.Helvetica);
    const helveticaBold = await pdfDoc.embedFont(StandardFonts.HelveticaBold);
    
    // Set document properties
    pdfDoc.setTitle(data.title);
    pdfDoc.setAuthor(data.metadata.createdBy);
    pdfDoc.setSubject(this.getTranslation(data.type + 'Contract', data.language));
    pdfDoc.setKeywords([data.type, 'contract', 'legal', 'norwegian']);
    pdfDoc.setCreationDate(data.metadata.createdDate);
    
    // Add header page
    await this.addHeaderPage(pdfDoc, data, helvetica, helveticaBold);
    
    // Add party information
    await this.addPartyInformation(pdfDoc, data, helvetica, helveticaBold);
    
    // Add contract clauses
    await this.addContractClauses(pdfDoc, data, helvetica, helveticaBold);
    
    // Add terms and conditions
    await this.addTermsAndConditions(pdfDoc, data, helvetica, helveticaBold);
    
    // Add signature page
    await this.addSignaturePage(pdfDoc, data, helvetica, helveticaBold);
    
    // Add page numbers and headers
    this.addPageNumbersAndHeaders(pdfDoc, data, helvetica);
    
    // Save PDF
    const pdfBytes = await pdfDoc.save();
    return Buffer.from(pdfBytes);
  }

  /**
   * Add header page
   */
  private async addHeaderPage(
    pdfDoc: PDFDocument,
    data: ContractData,
    font: any,
    boldFont: any
  ): Promise<void> {
    const page = pdfDoc.addPage([595, 842]); // A4
    const { width, height } = page.getSize();
    let y = height - 100;
    
    // Contract type
    const contractType = this.getTranslation(data.type + 'Contract', data.language);
    const typeWidth = boldFont.widthOfTextAtSize(contractType.toUpperCase(), 24);
    page.drawText(contractType.toUpperCase(), {
      x: (width - typeWidth) / 2,
      y: y,
      size: 24,
      font: boldFont,
      color: rgb(0.1, 0.2, 0.5)
    });
    y -= 60;
    
    // Title
    const titleWidth = boldFont.widthOfTextAtSize(data.title, 18);
    page.drawText(data.title, {
      x: (width - titleWidth) / 2,
      y: y,
      size: 18,
      font: boldFont,
      color: rgb(0, 0, 0)
    });
    y -= 80;
    
    // Between parties
    const betweenText = this.getTranslation('between', data.language);
    const party1 = data.parties.find(p => p.role === 'party1');
    const party2 = data.parties.find(p => p.role === 'party2');
    
    if (party1 && party2) {
      const betweenWidth = font.widthOfTextAtSize(betweenText, 14);
      page.drawText(betweenText, {
        x: (width - betweenWidth) / 2,
        y: y,
        size: 14,
        font: font,
        color: rgb(0, 0, 0)
      });
      y -= 40;
      
      // Party 1
      const party1Width = boldFont.widthOfTextAtSize(party1.name, 16);
      page.drawText(party1.name, {
        x: (width - party1Width) / 2,
        y: y,
        size: 16,
        font: boldFont,
        color: rgb(0, 0, 0)
      });
      y -= 25;
      
      if (party1.orgNumber) {
        const orgText = `${this.getTranslation('orgNumber', data.language)}: ${party1.orgNumber}`;
        const orgWidth = font.widthOfTextAtSize(orgText, 12);
        page.drawText(orgText, {
          x: (width - orgWidth) / 2,
          y: y,
          size: 12,
          font: font,
          color: rgb(0.3, 0.3, 0.3)
        });
        y -= 40;
      }
      
      // And
      const andText = this.getTranslation('and', data.language);
      const andWidth = font.widthOfTextAtSize(andText, 14);
      page.drawText(andText, {
        x: (width - andWidth) / 2,
        y: y,
        size: 14,
        font: font,
        color: rgb(0, 0, 0)
      });
      y -= 40;
      
      // Party 2
      const party2Width = boldFont.widthOfTextAtSize(party2.name, 16);
      page.drawText(party2.name, {
        x: (width - party2Width) / 2,
        y: y,
        size: 16,
        font: boldFont,
        color: rgb(0, 0, 0)
      });
      y -= 25;
      
      if (party2.orgNumber) {
        const orgText = `${this.getTranslation('orgNumber', data.language)}: ${party2.orgNumber}`;
        const orgWidth = font.widthOfTextAtSize(orgText, 12);
        page.drawText(orgText, {
          x: (width - orgWidth) / 2,
          y: y,
          size: 12,
          font: font,
          color: rgb(0.3, 0.3, 0.3)
        });
      }
    }
    
    // Footer with metadata
    const footerY = 100;
    const metadata = [
      `${this.getTranslation('version', data.language)}: ${data.metadata.version}`,
      `${this.getTranslation('date', data.language)}: ${this.formatDate(data.metadata.createdDate, data.language)}`,
      `${this.getTranslation('confidential', data.language).toUpperCase()}`
    ];
    
    metadata.forEach((text, index) => {
      const textWidth = font.widthOfTextAtSize(text, 10);
      page.drawText(text, {
        x: (width - textWidth) / 2,
        y: footerY - (index * 15),
        size: 10,
        font: index === 2 ? boldFont : font,
        color: index === 2 ? rgb(0.8, 0, 0) : rgb(0.5, 0.5, 0.5)
      });
    });
  }

  /**
   * Add party information page
   */
  private async addPartyInformation(
    pdfDoc: PDFDocument,
    data: ContractData,
    font: any,
    boldFont: any
  ): Promise<void> {
    const page = pdfDoc.addPage([595, 842]);
    const { width, height } = page.getSize();
    const margins = { top: 80, bottom: 60, left: 50, right: 50 };
    let y = height - margins.top;
    
    // Title
    page.drawText(this.getTranslation('parties', data.language), {
      x: margins.left,
      y: y,
      size: 20,
      font: boldFont,
      color: rgb(0.1, 0.2, 0.5)
    });
    y -= 50;
    
    // Draw each party
    data.parties.forEach((party, index) => {
      // Party role
      const roleText = `${this.getTranslation(party.role, data.language)}:`;
      page.drawText(roleText, {
        x: margins.left,
        y: y,
        size: 14,
        font: boldFont,
        color: rgb(0, 0, 0)
      });
      y -= 25;
      
      // Party name
      page.drawText(party.name, {
        x: margins.left + 20,
        y: y,
        size: 12,
        font: boldFont,
        color: rgb(0, 0, 0)
      });
      y -= 20;
      
      // Org/Personal number
      if (party.orgNumber) {
        page.drawText(`${this.getTranslation('orgNumber', data.language)}: ${party.orgNumber}`, {
          x: margins.left + 20,
          y: y,
          size: 11,
          font: font,
          color: rgb(0.3, 0.3, 0.3)
        });
        y -= 18;
      }
      
      if (party.personalNumber) {
        page.drawText(`${this.getTranslation('personalNumber', data.language)}: ${party.personalNumber}`, {
          x: margins.left + 20,
          y: y,
          size: 11,
          font: font,
          color: rgb(0.3, 0.3, 0.3)
        });
        y -= 18;
      }
      
      // Address
      page.drawText(`${this.getTranslation('address', data.language)}:`, {
        x: margins.left + 20,
        y: y,
        size: 11,
        font: font,
        color: rgb(0.3, 0.3, 0.3)
      });
      y -= 15;
      
      page.drawText(party.address.street, {
        x: margins.left + 40,
        y: y,
        size: 11,
        font: font,
        color: rgb(0, 0, 0)
      });
      y -= 15;
      
      page.drawText(`${party.address.postalCode} ${party.address.city}`, {
        x: margins.left + 40,
        y: y,
        size: 11,
        font: font,
        color: rgb(0, 0, 0)
      });
      y -= 15;
      
      page.drawText(party.address.country, {
        x: margins.left + 40,
        y: y,
        size: 11,
        font: font,
        color: rgb(0, 0, 0)
      });
      y -= 20;
      
      // Representative if exists
      if (party.representative) {
        page.drawText(`${this.getTranslation('representedBy', data.language)}:`, {
          x: margins.left + 20,
          y: y,
          size: 11,
          font: font,
          color: rgb(0.3, 0.3, 0.3)
        });
        y -= 15;
        
        page.drawText(`${party.representative.name}, ${party.representative.title}`, {
          x: margins.left + 40,
          y: y,
          size: 11,
          font: font,
          color: rgb(0, 0, 0)
        });
        y -= 15;
      }
      
      y -= 20; // Space between parties
      
      // Add new page if needed
      if (y < 150 && index < data.parties.length - 1) {
        const newPage = pdfDoc.addPage([595, 842]);
        y = height - margins.top;
      }
    });
  }

  /**
   * Add contract clauses
   */
  private async addContractClauses(
    pdfDoc: PDFDocument,
    data: ContractData,
    font: any,
    boldFont: any
  ): Promise<void> {
    const page = pdfDoc.addPage([595, 842]);
    const { width, height } = page.getSize();
    const margins = { top: 80, bottom: 60, left: 50, right: 50 };
    let y = height - margins.top;
    let clauseNumber = 1;
    
    // Get default clauses for contract type
    const defaultClauses = this.getDefaultClauses(data.type, data.language);
    const allClauses = [...defaultClauses, ...data.clauses].sort((a, b) => a.order - b.order);
    
    allClauses.forEach(clause => {
      // Check if we need a new page
      if (y < 200) {
        const newPage = pdfDoc.addPage([595, 842]);
        y = height - margins.top;
      }
      
      // Clause title
      page.drawText(`${clauseNumber}. ${clause.title}`, {
        x: margins.left,
        y: y,
        size: 14,
        font: boldFont,
        color: rgb(0.1, 0.2, 0.5)
      });
      y -= 25;
      
      // Clause content (wrapped)
      y = this.drawWrappedText(page, clause.content, font, margins, y, width, 11);
      y -= 20;
      
      clauseNumber++;
    });
  }

  /**
   * Add terms and conditions
   */
  private async addTermsAndConditions(
    pdfDoc: PDFDocument,
    data: ContractData,
    font: any,
    boldFont: any
  ): Promise<void> {
    const page = pdfDoc.addPage([595, 842]);
    const { width, height } = page.getSize();
    const margins = { top: 80, bottom: 60, left: 50, right: 50 };
    let y = height - margins.top;
    
    // Title
    page.drawText(this.getTranslation('terms', data.language), {
      x: margins.left,
      y: y,
      size: 18,
      font: boldFont,
      color: rgb(0.1, 0.2, 0.5)
    });
    y -= 40;
    
    // Effective date
    page.drawText(`${this.getTranslation('effectiveDate', data.language)}:`, {
      x: margins.left,
      y: y,
      size: 12,
      font: boldFont,
      color: rgb(0, 0, 0)
    });
    
    page.drawText(this.formatDate(data.terms.effectiveDate, data.language), {
      x: margins.left + 150,
      y: y,
      size: 12,
      font: font,
      color: rgb(0, 0, 0)
    });
    y -= 25;
    
    // Expiration date if exists
    if (data.terms.expirationDate) {
      page.drawText(`${this.getTranslation('expirationDate', data.language)}:`, {
        x: margins.left,
        y: y,
        size: 12,
        font: boldFont,
        color: rgb(0, 0, 0)
      });
      
      page.drawText(this.formatDate(data.terms.expirationDate, data.language), {
        x: margins.left + 150,
        y: y,
        size: 12,
        font: font,
        color: rgb(0, 0, 0)
      });
      y -= 25;
    }
    
    // Governing law
    page.drawText(`${this.getTranslation('governingLaw', data.language)}:`, {
      x: margins.left,
      y: y,
      size: 12,
      font: boldFont,
      color: rgb(0, 0, 0)
    });
    
    page.drawText(data.terms.governingLaw, {
      x: margins.left + 150,
      y: y,
      size: 12,
      font: font,
      color: rgb(0, 0, 0)
    });
    y -= 25;
    
    // Jurisdiction
    page.drawText(`${this.getTranslation('jurisdiction', data.language)}:`, {
      x: margins.left,
      y: y,
      size: 12,
      font: boldFont,
      color: rgb(0, 0, 0)
    });
    
    page.drawText(data.terms.jurisdiction, {
      x: margins.left + 150,
      y: y,
      size: 12,
      font: font,
      color: rgb(0, 0, 0)
    });
  }

  /**
   * Add signature page
   */
  private async addSignaturePage(
    pdfDoc: PDFDocument,
    data: ContractData,
    font: any,
    boldFont: any
  ): Promise<void> {
    const page = pdfDoc.addPage([595, 842]);
    const { width, height } = page.getSize();
    const margins = { top: 80, bottom: 60, left: 50, right: 50 };
    let y = height - margins.top;
    
    // Title
    page.drawText(this.getTranslation('signatures', data.language), {
      x: margins.left,
      y: y,
      size: 18,
      font: boldFont,
      color: rgb(0.1, 0.2, 0.5)
    });
    y -= 60;
    
    // Signature blocks
    const signatureParties = data.parties.filter(p => 
      data.signatures.some(s => s.partyRole === p.role)
    );
    
    signatureParties.forEach((party, index) => {
      if (index > 0 && index % 2 === 0) {
        y -= 100; // New row
      }
      
      const x = index % 2 === 0 ? margins.left : width / 2 + 20;
      
      // Signature line
      page.drawLine({
        start: { x: x, y: y },
        end: { x: x + 200, y: y },
        thickness: 1,
        color: rgb(0, 0, 0)
      });
      
      // Name and role
      page.drawText(party.name, {
        x: x,
        y: y - 20,
        size: 11,
        font: font,
        color: rgb(0, 0, 0)
      });
      
      page.drawText(this.getTranslation(party.role, data.language), {
        x: x,
        y: y - 35,
        size: 10,
        font: font,
        color: rgb(0.5, 0.5, 0.5)
      });
      
      // Date and place fields
      page.drawText(`${this.getTranslation('place', data.language)}: _________________`, {
        x: x,
        y: y - 60,
        size: 10,
        font: font,
        color: rgb(0, 0, 0)
      });
      
      page.drawText(`${this.getTranslation('date', data.language)}: _________________`, {
        x: x,
        y: y - 75,
        size: 10,
        font: font,
        color: rgb(0, 0, 0)
      });
    });
  }

  /**
   * Add page numbers and headers
   */
  private addPageNumbersAndHeaders(
    pdfDoc: PDFDocument,
    data: ContractData,
    font: any
  ): void {
    const pages = pdfDoc.getPages();
    const totalPages = pages.length;
    
    pages.forEach((page, index) => {
      const { width, height } = page.getSize();
      const pageNumber = index + 1;
      
      // Skip numbering on first page
      if (index === 0) return;
      
      // Header
      page.drawLine({
        start: { x: 50, y: height - 40 },
        end: { x: width - 50, y: height - 40 },
        thickness: 0.5,
        color: rgb(0.8, 0.8, 0.8)
      });
      
      page.drawText(data.title, {
        x: 50,
        y: height - 35,
        size: 8,
        font: font,
        color: rgb(0.5, 0.5, 0.5)
      });
      
      const versionText = `${this.getTranslation('version', data.language)} ${data.metadata.version}`;
      const versionWidth = font.widthOfTextAtSize(versionText, 8);
      page.drawText(versionText, {
        x: width - 50 - versionWidth,
        y: height - 35,
        size: 8,
        font: font,
        color: rgb(0.5, 0.5, 0.5)
      });
      
      // Footer
      page.drawLine({
        start: { x: 50, y: 40 },
        end: { x: width - 50, y: 40 },
        thickness: 0.5,
        color: rgb(0.8, 0.8, 0.8)
      });
      
      // Page number
      const pageText = `${this.getTranslation('page', data.language)} ${pageNumber} ${this.getTranslation('of', data.language)} ${totalPages}`;
      const pageTextWidth = font.widthOfTextAtSize(pageText, 8);
      page.drawText(pageText, {
        x: (width - pageTextWidth) / 2,
        y: 25,
        size: 8,
        font: font,
        color: rgb(0.5, 0.5, 0.5)
      });
      
      // Confidentiality marking
      if (data.metadata.confidentiality !== 'public') {
        const confidentialText = this.getTranslation(data.metadata.confidentiality, data.language).toUpperCase();
        page.drawText(confidentialText, {
          x: 50,
          y: 25,
          size: 8,
          font: font,
          color: rgb(0.7, 0, 0)
        });
      }
    });
  }

  /**
   * Helper methods
   */
  
  private drawWrappedText(
    page: PDFPage,
    text: string,
    font: any,
    margins: any,
    startY: number,
    pageWidth: number,
    fontSize: number
  ): number {
    const maxWidth = pageWidth - margins.left - margins.right;
    const words = text.split(' ');
    let line = '';
    let y = startY;
    
    words.forEach(word => {
      const testLine = line + word + ' ';
      const testWidth = font.widthOfTextAtSize(testLine, fontSize);
      
      if (testWidth > maxWidth && line !== '') {
        page.drawText(line.trim(), {
          x: margins.left,
          y: y,
          size: fontSize,
          font: font,
          color: rgb(0, 0, 0)
        });
        y -= fontSize + 5;
        line = word + ' ';
      } else {
        line = testLine;
      }
    });
    
    if (line.trim()) {
      page.drawText(line.trim(), {
        x: margins.left,
        y: y,
        size: fontSize,
        font: font,
        color: rgb(0, 0, 0)
      });
      y -= fontSize + 5;
    }
    
    return y;
  }

  private formatDate(date: Date, language: string): string {
    const locale = language === 'nb' ? 'nb-NO' : language === 'nn' ? 'nn-NO' : 'en-US';
    return new Intl.DateTimeFormat(locale, {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    }).format(date);
  }

  private getTranslation(key: string, language: string): string {
    return this.translations[language]?.[key] || this.translations['nb'][key] || key;
  }

  private getContractTypeFromTemplate(template: string): ContractType {
    const typeMap: Record<string, ContractType> = {
      'employment': ContractType.EMPLOYMENT,
      'service': ContractType.SERVICE,
      'rental': ContractType.RENTAL,
      'purchase': ContractType.PURCHASE,
      'nda': ContractType.NDA,
      'partnership': ContractType.PARTNERSHIP,
      'loan': ContractType.LOAN
    };
    
    return typeMap[template.toLowerCase()] || ContractType.CUSTOM;
  }

  private getContractTitle(template: string): string {
    const titles: Record<string, string> = {
      'employment': 'Employment Agreement',
      'service': 'Service Agreement',
      'rental': 'Rental Agreement',
      'purchase': 'Purchase Agreement',
      'nda': 'Non-Disclosure Agreement',
      'partnership': 'Partnership Agreement',
      'loan': 'Loan Agreement'
    };
    
    return titles[template.toLowerCase()] || 'Contract Agreement';
  }

  private getDefaultClauses(type: ContractType, language: string): any[] {
    const clauses: any[] = [];
    const clauseTemplates = norwegianClauses[type as keyof typeof norwegianClauses];
    
    if (clauseTemplates) {
      let order = 1;
      Object.entries(clauseTemplates).forEach(([key, template]) => {
        clauses.push({
          title: this.getClauseTitle(key, language),
          content: template[language as 'nb' | 'en'] || template.nb,
          type: 'standard',
          order: order++
        });
      });
    }
    
    return clauses;
  }

  private getClauseTitle(key: string, language: string): string {
    const titles: Record<string, Record<string, string>> = {
      position: { nb: 'Stilling og arbeidssted', en: 'Position and Workplace' },
      salary: { nb: 'Lønn', en: 'Salary' },
      workingHours: { nb: 'Arbeidstid', en: 'Working Hours' },
      vacation: { nb: 'Ferie', en: 'Vacation' },
      termination: { nb: 'Oppsigelse', en: 'Termination' },
      scope: { nb: 'Omfang', en: 'Scope' },
      payment: { nb: 'Betaling', en: 'Payment' },
      delivery: { nb: 'Levering', en: 'Delivery' },
      liability: { nb: 'Ansvar', en: 'Liability' },
      property: { nb: 'Eiendom', en: 'Property' },
      rent: { nb: 'Leie', en: 'Rent' },
      deposit: { nb: 'Depositum', en: 'Deposit' },
      maintenance: { nb: 'Vedlikehold', en: 'Maintenance' },
      confidentiality: { nb: 'Konfidensialitet', en: 'Confidentiality' },
      duration: { nb: 'Varighet', en: 'Duration' },
      exceptions: { nb: 'Unntak', en: 'Exceptions' }
    };
    
    return titles[key]?.[language] || titles[key]?.['nb'] || key;
  }
}

/**
 * Generate contract component
 */
export async function generateContractComponent(
  options: z.infer<typeof contractComponentOptionsSchema>
): Promise<GenerationResult> {
  const files = new Map<string, string>();
  
  // Generate contract service
  const serviceContent = `
${options.typescript ? `
import type { ContractData, ContractType } from '../types/contracts';
` : ''}
import { ContractGenerator } from '../lib/contract-generator';
import { PDFDocument } from 'pdf-lib';

/**
 * Contract Service for ${options.projectName}
 * Handles contract generation, versioning, and management
 */
export class ContractService {
  private generator = new ContractGenerator();
  private storage = new Map<string, ContractData>();

  /**
   * Generate contract
   */
  async generateContract(
    template${options.typescript ? ': string' : ''},
    parties${options.typescript ? ': any[]' : ''}
  )${options.typescript ? ': Promise<Buffer>' : ''} {
    return this.generator.generateContract(template, parties);
  }

  /**
   * Store contract with versioning
   */
  async storeContract(
    contractId${options.typescript ? ': string' : ''},
    data${options.typescript ? ': ContractData' : ''},
    pdf${options.typescript ? ': Buffer' : ''}
  )${options.typescript ? ': Promise<void>' : ''} {
    // Store contract data
    this.storage.set(contractId, data);
    
    // TODO: Implement file storage (S3, Azure Blob, etc.)
    console.log(\`Storing contract \${contractId} version \${data.metadata.version}\`);
  }

  /**
   * Track contract changes
   */
  async trackChanges(
    contractId${options.typescript ? ': string' : ''},
    changes${options.typescript ? ': any[]' : ''},
    modifiedBy${options.typescript ? ': string' : ''}
  )${options.typescript ? ': Promise<void>' : ''} {
    const contract = this.storage.get(contractId);
    if (!contract) throw new Error('Contract not found');
    
    // Update version
    const [major, minor] = contract.metadata.version.split('.');
    contract.metadata.version = \`\${major}.\${parseInt(minor) + 1}\`;
    contract.metadata.modifiedBy = modifiedBy;
    contract.metadata.modifiedDate = new Date();
    
    // Store updated contract
    await this.storeContract(contractId, contract, await this.generateContract(
      contract.type,
      contract.parties
    ));
  }

  /**
   * Add digital signature
   */
  async addDigitalSignature(
    contractId${options.typescript ? ': string' : ''},
    partyRole${options.typescript ? ': string' : ''},
    signatureData${options.typescript ? ': string' : ''}
  )${options.typescript ? ': Promise<void>' : ''} {
    const contract = this.storage.get(contractId);
    if (!contract) throw new Error('Contract not found');
    
    // Update signature
    const signature = contract.signatures.find(s => s.partyRole === partyRole);
    if (signature) {
      signature.signatureType = 'digital';
      signature.signedDate = new Date();
      signature.signatureData = signatureData;
    }
    
    // Check if all required signatures are complete
    const allSigned = contract.signatures.every(s => s.signedDate);
    if (allSigned) {
      console.log(\`Contract \${contractId} is fully executed\`);
    }
  }

  /**
   * Handle contract expiration
   */
  async checkExpiration()${options.typescript ? ': Promise<void>' : ''} {
    const now = new Date();
    
    this.storage.forEach((contract, contractId) => {
      if (contract.terms.expirationDate && contract.terms.expirationDate < now) {
        if (contract.terms.autoRenewal) {
          console.log(\`Auto-renewing contract \${contractId}\`);
          // TODO: Implement auto-renewal logic
        } else {
          console.log(\`Contract \${contractId} has expired\`);
          // TODO: Send expiration notifications
        }
      }
    });
  }
}

// Export singleton instance
export const contractService = new ContractService();`;

  files.set('services/contract-service.ts', serviceContent);
  
  return {
    success: true,
    files,
    message: 'Contract generator created successfully'
  };
}

// Component options schema
const contractComponentOptionsSchema = z.object({
  typescript: z.boolean().default(true),
  projectName: z.string(),
  outputPath: z.string()
});

// Export generator instance
export const contractGenerator = new ContractGenerator();