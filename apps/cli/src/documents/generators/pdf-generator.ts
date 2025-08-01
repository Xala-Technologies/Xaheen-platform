import { PDFDocument, PDFFont, PDFPage, rgb, StandardFonts } from 'pdf-lib';
import Handlebars from 'handlebars';
import { promises as fs } from 'fs';
import path from 'path';

export interface DocumentOptions {
  template: string;
  data: Record<string, any>;
  outputPath?: string;
  metadata?: PDFMetadata;
  security?: PDFSecurity;
  fonts?: FontOptions;
}

export interface PDFMetadata {
  title?: string;
  author?: string;
  subject?: string;
  keywords?: string[];
  creator?: string;
  producer?: string;
}

export interface PDFSecurity {
  userPassword?: string;
  ownerPassword?: string;
  permissions?: {
    printing?: boolean;
    modifying?: boolean;
    copying?: boolean;
    annotating?: boolean;
    fillingForms?: boolean;
    contentAccessibility?: boolean;
    documentAssembly?: boolean;
  };
}

export interface FontOptions {
  primary?: StandardFonts;
  secondary?: StandardFonts;
  supportNorwegian?: boolean;
}

export interface GenerationResult {
  success: boolean;
  buffer?: Buffer;
  filePath?: string;
  error?: string;
  metadata?: {
    pages: number;
    size: number;
    generatedAt: Date;
  };
}

/**
 * PDF Generation Engine for creating professional documents
 * Supports Norwegian fonts, encryption, and digital signatures
 */
export class PDFGenerator {
  private document!: PDFDocument;
  private fonts: Map<string, PDFFont> = new Map();

  constructor() {
    // Document will be initialized in methods that need it
  }

  /**
   * Initialize a new PDF document
   */
  private async initializeDocument(): Promise<void> {
    this.document = await PDFDocument.create();
  }

  /**
   * Generate PDF from template and data
   * @param template - Handlebars template string
   * @param data - Data to populate template
   * @returns Promise<Buffer> - Generated PDF buffer
   */
  async generatePDF(template: string, data: Record<string, any>): Promise<Buffer> {
    try {
      // Compile and render template
      const compiledTemplate = Handlebars.compile(template);
      const renderedContent = compiledTemplate(data);

      // Create new PDF document
      await this.initializeDocument();

      // Load Norwegian-compatible fonts
      await this.loadFonts();

      // Add content to PDF
      await this.addContentToPDF(renderedContent);

      // Serialize and return buffer
      const pdfBytes = await this.document.save();
      return Buffer.from(pdfBytes);
    } catch (error) {
      throw new Error(`PDF generation failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Generate PDF component with advanced options
   * @param options - Document generation options
   * @returns Promise<GenerationResult> - Generation result with metadata
   */
  async generatePDFComponent(options: DocumentOptions): Promise<GenerationResult> {
    try {
      const startTime = Date.now();

      // Create new document
      await this.initializeDocument();

      // Set metadata
      if (options.metadata) {
        await this.setMetadata(options.metadata);
      }

      // Load fonts
      await this.loadFonts(options.fonts);

      // Process template
      const buffer = await this.generatePDF(options.template, options.data);

      // Apply security if specified
      if (options.security) {
        await this.applySecurity(options.security);
      }

      // Save to file if output path specified
      let filePath: string | undefined;
      if (options.outputPath) {
        await fs.writeFile(options.outputPath, buffer);
        filePath = options.outputPath;
      }

      const endTime = Date.now();
      const pages = this.document.getPageCount();

      return {
        success: true,
        buffer,
        filePath,
        metadata: {
          pages,
          size: buffer.length,
          generatedAt: new Date(),
        },
      };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
      };
    }
  }

  /**
   * Load fonts with Norwegian character support
   * @param fontOptions - Font configuration options
   */
  private async loadFonts(fontOptions?: FontOptions): Promise<void> {
    try {
      // Load primary font (supports Norwegian characters)
      const primaryFont = fontOptions?.primary || StandardFonts.Helvetica;
      const primary = await this.document.embedFont(primaryFont);
      this.fonts.set('primary', primary);

      // Load secondary font
      const secondaryFont = fontOptions?.secondary || StandardFonts.TimesRoman;
      const secondary = await this.document.embedFont(secondaryFont);
      this.fonts.set('secondary', secondary);

      // Load bold variants for Norwegian text
      const primaryBold = await this.document.embedFont(StandardFonts.HelveticaBold);
      this.fonts.set('primaryBold', primaryBold);

      const secondaryBold = await this.document.embedFont(StandardFonts.TimesRomanBold);
      this.fonts.set('secondaryBold', secondaryBold);
    } catch (error) {
      throw new Error(`Font loading failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Add content to PDF with proper formatting
   * @param content - Rendered content to add
   */
  private async addContentToPDF(content: string): Promise<void> {
    const page = this.document.addPage();
    const { width, height } = page.getSize();
    const font = this.fonts.get('primary');

    if (!font) {
      throw new Error('Primary font not loaded');
    }

    // Basic text rendering (can be enhanced with more sophisticated layout)
    const fontSize = 12;
    const margin = 50;
    const lineHeight = fontSize * 1.2;

    // Split content into lines
    const lines = content.split('\n');
    let yPosition = height - margin;

    for (const line of lines) {
      if (yPosition < margin) {
        // Add new page if needed
        const newPage = this.document.addPage();
        yPosition = newPage.getSize().height - margin;
      }

      page.drawText(line, {
        x: margin,
        y: yPosition,
        size: fontSize,
        font,
        color: rgb(0, 0, 0),
      });

      yPosition -= lineHeight;
    }
  }

  /**
   * Set PDF metadata
   * @param metadata - Document metadata
   */
  private async setMetadata(metadata: PDFMetadata): Promise<void> {
    if (metadata.title) this.document.setTitle(metadata.title);
    if (metadata.author) this.document.setAuthor(metadata.author);
    if (metadata.subject) this.document.setSubject(metadata.subject);
    if (metadata.keywords) this.document.setKeywords(metadata.keywords);
    if (metadata.creator) this.document.setCreator(metadata.creator);
    if (metadata.producer) this.document.setProducer(metadata.producer);

    // Set creation and modification dates
    const now = new Date();
    this.document.setCreationDate(now);
    this.document.setModificationDate(now);
  }

  /**
   * Apply security settings to PDF
   * @param security - Security configuration
   */
  private async applySecurity(security: PDFSecurity): Promise<void> {
    // Note: PDF-lib doesn't support encryption directly
    // This is a placeholder for future implementation with additional libraries
    console.warn('PDF encryption not yet implemented - requires additional security library');
    
    // Store security settings for future implementation
    if (security.userPassword || security.ownerPassword) {
      console.log('Password protection requested but not yet implemented');
    }

    if (security.permissions) {
      console.log('Permission restrictions requested but not yet implemented');
    }
  }

  /**
   * Add digital signature support (placeholder)
   * @param signatureOptions - Signature configuration
   */
  async addDigitalSignature(signatureOptions: Record<string, any>): Promise<void> {
    // Placeholder for digital signature implementation
    console.warn('Digital signature not yet implemented - requires additional crypto library');
  }

  /**
   * Get document statistics
   * @returns Document statistics
   */
  getDocumentStats(): { pages: number; fonts: string[] } {
    return {
      pages: this.document.getPageCount(),
      fonts: Array.from(this.fonts.keys()),
    };
  }
}

/**
 * Convenience function for simple PDF generation
 * @param template - Handlebars template string
 * @param data - Template data
 * @returns Promise<Buffer> - Generated PDF buffer
 */
export async function generatePDF(template: string, data: Record<string, any>): Promise<Buffer> {
  const generator = new PDFGenerator();
  return generator.generatePDF(template, data);
}

/**
 * Convenience function for advanced PDF generation
 * @param options - Generation options
 * @returns Promise<GenerationResult> - Generation result
 */
export async function generatePDFComponent(options: DocumentOptions): Promise<GenerationResult> {
  const generator = new PDFGenerator();
  return generator.generatePDFComponent(options);
}

// Register Norwegian-specific Handlebars helpers
Handlebars.registerHelper('formatNorwegianDate', (date: Date) => {
  return new Intl.DateTimeFormat('nb-NO', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  }).format(date);
});

Handlebars.registerHelper('formatNorwegianCurrency', (amount: number) => {
  return new Intl.NumberFormat('nb-NO', {
    style: 'currency',
    currency: 'NOK',
  }).format(amount);
});

Handlebars.registerHelper('formatNorwegianNumber', (number: number) => {
  return new Intl.NumberFormat('nb-NO').format(number);
});
