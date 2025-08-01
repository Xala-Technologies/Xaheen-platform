import { z } from 'zod';
import type { GenerationResult } from '../../types.js';
import { PDFDocument, StandardFonts, rgb, PDFPage } from 'pdf-lib';
import { ChartConfiguration } from 'chart.js';
import { createCanvas } from 'canvas';
import Chart from 'chart.js/auto';

/**
 * Report Generation System
 * 
 * Generates business reports with charts, graphs, and
 * Norwegian formatting support
 */

// Report types
export enum ReportType {
  FINANCIAL = 'financial',
  COMPLIANCE = 'compliance',
  AUDIT = 'audit',
  SALES = 'sales',
  INVENTORY = 'inventory',
  HR = 'hr',
  CUSTOM = 'custom'
}

// Report data schema
const reportDataSchema = z.object({
  type: z.nativeEnum(ReportType),
  title: z.string(),
  subtitle: z.string().optional(),
  period: z.object({
    from: z.date(),
    to: z.date()
  }),
  company: z.object({
    name: z.string(),
    orgNumber: z.string().optional(),
    logo: z.string().optional() // Base64 encoded
  }),
  sections: z.array(z.object({
    title: z.string(),
    type: z.enum(['text', 'table', 'chart', 'summary', 'list']),
    data: z.any(),
    options: z.any().optional()
  })),
  metadata: z.object({
    author: z.string(),
    department: z.string().optional(),
    confidentiality: z.enum(['public', 'internal', 'confidential', 'secret']).default('internal'),
    language: z.enum(['nb', 'nn', 'en']).default('nb'),
    currency: z.string().default('NOK')
  }),
  distribution: z.array(z.string()).optional(),
  schedule: z.object({
    frequency: z.enum(['daily', 'weekly', 'monthly', 'quarterly', 'yearly', 'once']).optional(),
    nextRun: z.date().optional()
  }).optional()
});

export type ReportData = z.infer<typeof reportDataSchema>;

// Chart type definitions
interface ChartData {
  type: 'bar' | 'line' | 'pie' | 'doughnut' | 'radar' | 'polarArea';
  labels: string[];
  datasets: Array<{
    label: string;
    data: number[];
    backgroundColor?: string | string[];
    borderColor?: string | string[];
    borderWidth?: number;
  }>;
  options?: Partial<ChartConfiguration['options']>;
}

// Table data interface
interface TableData {
  headers: string[];
  rows: Array<Array<string | number>>;
  footer?: Array<string | number>;
  styling?: {
    headerBackground?: string;
    alternateRows?: boolean;
    borders?: boolean;
  };
}

/**
 * Report Generator
 */
export class ReportGenerator {
  private translations: Record<string, Record<string, string>> = {
    nb: {
      financialReport: 'Finansrapport',
      complianceReport: 'Etterlevelsesrapport',
      auditReport: 'Revisjonsrapport',
      salesReport: 'Salgsrapport',
      inventoryReport: 'Lagerrapport',
      hrReport: 'HR-rapport',
      period: 'Periode',
      from: 'Fra',
      to: 'Til',
      summary: 'Sammendrag',
      details: 'Detaljer',
      total: 'Total',
      average: 'Gjennomsnitt',
      confidential: 'Konfidensielt',
      internal: 'Intern',
      public: 'Offentlig',
      page: 'Side',
      of: 'av',
      generatedOn: 'Generert',
      author: 'Forfatter',
      department: 'Avdeling'
    },
    en: {
      financialReport: 'Financial Report',
      complianceReport: 'Compliance Report',
      auditReport: 'Audit Report',
      salesReport: 'Sales Report',
      inventoryReport: 'Inventory Report',
      hrReport: 'HR Report',
      period: 'Period',
      from: 'From',
      to: 'To',
      summary: 'Summary',
      details: 'Details',
      total: 'Total',
      average: 'Average',
      confidential: 'Confidential',
      internal: 'Internal',
      public: 'Public',
      page: 'Page',
      of: 'of',
      generatedOn: 'Generated on',
      author: 'Author',
      department: 'Department'
    }
  };

  /**
   * Generate report
   */
  async generateReport(type: string, data: any): Promise<Buffer> {
    // Validate and parse data
    const reportData = reportDataSchema.parse({ ...data, type });
    
    // Create PDF document
    const pdfDoc = await PDFDocument.create();
    
    // Embed fonts
    const helvetica = await pdfDoc.embedFont(StandardFonts.Helvetica);
    const helveticaBold = await pdfDoc.embedFont(StandardFonts.HelveticaBold);
    
    // Add cover page
    await this.addCoverPage(pdfDoc, reportData, helvetica, helveticaBold);
    
    // Add content pages
    for (const section of reportData.sections) {
      await this.addSection(pdfDoc, section, reportData, helvetica, helveticaBold);
    }
    
    // Add page numbers
    this.addPageNumbers(pdfDoc, helvetica, reportData.metadata.language);
    
    // Set document metadata
    pdfDoc.setTitle(reportData.title);
    pdfDoc.setAuthor(reportData.metadata.author);
    pdfDoc.setSubject(this.getTranslation(type + 'Report', reportData.metadata.language));
    pdfDoc.setKeywords([type, 'report', reportData.company.name]);
    pdfDoc.setCreationDate(new Date());
    
    // Add security if needed
    if (reportData.metadata.confidentiality !== 'public') {
      // Note: pdf-lib doesn't support encryption directly
      // This would need additional library or post-processing
      pdfDoc.setProducer(`${reportData.company.name} - ${reportData.metadata.confidentiality.toUpperCase()}`);
    }
    
    // Save PDF
    const pdfBytes = await pdfDoc.save();
    return Buffer.from(pdfBytes);
  }

  /**
   * Add cover page
   */
  private async addCoverPage(
    pdfDoc: PDFDocument,
    data: ReportData,
    font: any,
    boldFont: any
  ): Promise<void> {
    const page = pdfDoc.addPage([595, 842]); // A4
    const { width, height } = page.getSize();
    let y = height - 100;
    
    // Add logo if provided
    if (data.company.logo) {
      try {
        const logoImage = await pdfDoc.embedPng(Buffer.from(data.company.logo, 'base64'));
        const logoDims = logoImage.scale(0.5);
        page.drawImage(logoImage, {
          x: (width - logoDims.width) / 2,
          y: y - logoDims.height,
          width: logoDims.width,
          height: logoDims.height
        });
        y -= logoDims.height + 50;
      } catch (error) {
        console.warn('Failed to embed logo:', error);
      }
    }
    
    // Company name
    page.drawText(data.company.name, {
      x: 50,
      y: y,
      size: 24,
      font: boldFont,
      color: rgb(0, 0, 0)
    });
    y -= 80;
    
    // Report title
    const reportTypeText = this.getTranslation(data.type + 'Report', data.metadata.language);
    page.drawText(reportTypeText, {
      x: 50,
      y: y,
      size: 32,
      font: boldFont,
      color: rgb(0.1, 0.2, 0.5)
    });
    y -= 40;
    
    // Report subtitle
    if (data.subtitle) {
      page.drawText(data.subtitle, {
        x: 50,
        y: y,
        size: 18,
        font: font,
        color: rgb(0.3, 0.3, 0.3)
      });
      y -= 60;
    } else {
      y -= 40;
    }
    
    // Period
    const periodText = `${this.getTranslation('period', data.metadata.language)}: ${this.formatDate(data.period.from, data.metadata.language)} - ${this.formatDate(data.period.to, data.metadata.language)}`;
    page.drawText(periodText, {
      x: 50,
      y: y,
      size: 14,
      font: font,
      color: rgb(0, 0, 0)
    });
    
    // Metadata at bottom
    const metadataY = 100;
    const metadata = [
      `${this.getTranslation('author', data.metadata.language)}: ${data.metadata.author}`,
      data.metadata.department ? `${this.getTranslation('department', data.metadata.language)}: ${data.metadata.department}` : null,
      `${this.getTranslation('generatedOn', data.metadata.language)}: ${this.formatDate(new Date(), data.metadata.language)}`
    ].filter(Boolean);
    
    metadata.forEach((text, index) => {
      if (text) {
        page.drawText(text, {
          x: 50,
          y: metadataY - (index * 20),
          size: 10,
          font: font,
          color: rgb(0.5, 0.5, 0.5)
        });
      }
    });
    
    // Confidentiality marking
    if (data.metadata.confidentiality !== 'public') {
      const confidentialityText = this.getTranslation(data.metadata.confidentiality, data.metadata.language).toUpperCase();
      page.drawText(confidentialityText, {
        x: width - 150,
        y: height - 50,
        size: 14,
        font: boldFont,
        color: rgb(0.8, 0, 0)
      });
    }
  }

  /**
   * Add section to report
   */
  private async addSection(
    pdfDoc: PDFDocument,
    section: any,
    data: ReportData,
    font: any,
    boldFont: any
  ): Promise<void> {
    const page = pdfDoc.addPage([595, 842]); // A4
    const { width, height } = page.getSize();
    const margins = { top: 50, bottom: 50, left: 50, right: 50 };
    let y = height - margins.top;
    
    // Section title
    page.drawText(section.title, {
      x: margins.left,
      y: y,
      size: 18,
      font: boldFont,
      color: rgb(0.1, 0.2, 0.5)
    });
    y -= 40;
    
    // Draw content based on type
    switch (section.type) {
      case 'text':
        y = this.drawText(page, section.data, font, margins, y, width);
        break;
        
      case 'table':
        y = this.drawTable(page, section.data, font, boldFont, margins, y, width);
        break;
        
      case 'chart':
        y = await this.drawChart(pdfDoc, page, section.data, margins, y, width);
        break;
        
      case 'summary':
        y = this.drawSummary(page, section.data, font, boldFont, margins, y, width, data.metadata.language);
        break;
        
      case 'list':
        y = this.drawList(page, section.data, font, margins, y);
        break;
    }
  }

  /**
   * Draw text content
   */
  private drawText(
    page: PDFPage,
    text: string | string[],
    font: any,
    margins: any,
    startY: number,
    pageWidth: number
  ): number {
    let y = startY;
    const texts = Array.isArray(text) ? text : [text];
    const maxWidth = pageWidth - margins.left - margins.right;
    
    texts.forEach(paragraph => {
      const words = paragraph.split(' ');
      let line = '';
      
      words.forEach(word => {
        const testLine = line + word + ' ';
        const testWidth = font.widthOfTextAtSize(testLine, 11);
        
        if (testWidth > maxWidth && line !== '') {
          page.drawText(line.trim(), {
            x: margins.left,
            y: y,
            size: 11,
            font: font,
            color: rgb(0, 0, 0)
          });
          y -= 18;
          line = word + ' ';
        } else {
          line = testLine;
        }
      });
      
      if (line.trim()) {
        page.drawText(line.trim(), {
          x: margins.left,
          y: y,
          size: 11,
          font: font,
          color: rgb(0, 0, 0)
        });
        y -= 18;
      }
      
      y -= 10; // Paragraph spacing
    });
    
    return y;
  }

  /**
   * Draw table
   */
  private drawTable(
    page: PDFPage,
    tableData: TableData,
    font: any,
    boldFont: any,
    margins: any,
    startY: number,
    pageWidth: number
  ): number {
    let y = startY;
    const cellPadding = 5;
    const rowHeight = 25;
    const tableWidth = pageWidth - margins.left - margins.right;
    const columnWidth = tableWidth / tableData.headers.length;
    
    // Draw header background
    if (tableData.styling?.headerBackground !== false) {
      page.drawRectangle({
        x: margins.left,
        y: y - rowHeight,
        width: tableWidth,
        height: rowHeight,
        color: rgb(0.9, 0.9, 0.9)
      });
    }
    
    // Draw headers
    tableData.headers.forEach((header, index) => {
      page.drawText(header, {
        x: margins.left + (index * columnWidth) + cellPadding,
        y: y - rowHeight + cellPadding,
        size: 10,
        font: boldFont,
        color: rgb(0, 0, 0)
      });
    });
    
    y -= rowHeight;
    
    // Draw rows
    tableData.rows.forEach((row, rowIndex) => {
      // Alternate row background
      if (tableData.styling?.alternateRows && rowIndex % 2 === 1) {
        page.drawRectangle({
          x: margins.left,
          y: y - rowHeight,
          width: tableWidth,
          height: rowHeight,
          color: rgb(0.95, 0.95, 0.95)
        });
      }
      
      row.forEach((cell, cellIndex) => {
        const text = this.formatCellValue(cell, tableData.headers[cellIndex]);
        page.drawText(text, {
          x: margins.left + (cellIndex * columnWidth) + cellPadding,
          y: y - rowHeight + cellPadding,
          size: 9,
          font: font,
          color: rgb(0, 0, 0)
        });
      });
      
      y -= rowHeight;
    });
    
    // Draw footer if exists
    if (tableData.footer) {
      page.drawLine({
        start: { x: margins.left, y: y },
        end: { x: margins.left + tableWidth, y: y },
        thickness: 1,
        color: rgb(0, 0, 0)
      });
      
      y -= 5;
      
      tableData.footer.forEach((cell, index) => {
        const text = this.formatCellValue(cell, tableData.headers[index]);
        page.drawText(text, {
          x: margins.left + (index * columnWidth) + cellPadding,
          y: y - rowHeight + cellPadding,
          size: 10,
          font: boldFont,
          color: rgb(0, 0, 0)
        });
      });
      
      y -= rowHeight;
    }
    
    return y - 20;
  }

  /**
   * Draw chart
   */
  private async drawChart(
    pdfDoc: PDFDocument,
    page: PDFPage,
    chartData: ChartData,
    margins: any,
    startY: number,
    pageWidth: number
  ): Promise<number> {
    const chartWidth = 400;
    const chartHeight = 300;
    
    // Create canvas for chart
    const canvas = createCanvas(chartWidth, chartHeight);
    const ctx = canvas.getContext('2d');
    
    // Create chart configuration
    const chartConfig: ChartConfiguration = {
      type: chartData.type,
      data: {
        labels: chartData.labels,
        datasets: chartData.datasets
      },
      options: {
        responsive: false,
        maintainAspectRatio: false,
        plugins: {
          legend: {
            position: 'bottom'
          }
        },
        ...chartData.options
      }
    };
    
    // Render chart
    new Chart(ctx as any, chartConfig);
    
    // Convert canvas to PNG and embed in PDF
    const chartImage = await pdfDoc.embedPng(canvas.toBuffer('image/png'));
    const x = (pageWidth - chartWidth) / 2;
    
    page.drawImage(chartImage, {
      x: x,
      y: startY - chartHeight,
      width: chartWidth,
      height: chartHeight
    });
    
    return startY - chartHeight - 40;
  }

  /**
   * Draw summary section
   */
  private drawSummary(
    page: PDFPage,
    summaryData: Record<string, any>,
    font: any,
    boldFont: any,
    margins: any,
    startY: number,
    pageWidth: number,
    language: string
  ): number {
    let y = startY;
    const boxWidth = (pageWidth - margins.left - margins.right - 20) / 3;
    const boxHeight = 80;
    const boxSpacing = 10;
    
    // Draw summary boxes
    Object.entries(summaryData).slice(0, 3).forEach(([ key, value], index) => {
      const x = margins.left + (index * (boxWidth + boxSpacing));
      
      // Draw box
      page.drawRectangle({
        x: x,
        y: y - boxHeight,
        width: boxWidth,
        height: boxHeight,
        borderColor: rgb(0.8, 0.8, 0.8),
        borderWidth: 1
      });
      
      // Draw label
      page.drawText(this.getTranslation(key, language) || key, {
        x: x + 10,
        y: y - 25,
        size: 10,
        font: font,
        color: rgb(0.5, 0.5, 0.5)
      });
      
      // Draw value
      const formattedValue = this.formatValue(value, key);
      page.drawText(formattedValue, {
        x: x + 10,
        y: y - 50,
        size: 16,
        font: boldFont,
        color: rgb(0, 0, 0)
      });
    });
    
    return y - boxHeight - 40;
  }

  /**
   * Draw list
   */
  private drawList(
    page: PDFPage,
    items: string[],
    font: any,
    margins: any,
    startY: number
  ): number {
    let y = startY;
    
    items.forEach(item => {
      page.drawText(`• ${item}`, {
        x: margins.left + 10,
        y: y,
        size: 11,
        font: font,
        color: rgb(0, 0, 0)
      });
      y -= 20;
    });
    
    return y - 20;
  }

  /**
   * Add page numbers
   */
  private addPageNumbers(
    pdfDoc: PDFDocument,
    font: any,
    language: string
  ): void {
    const pages = pdfDoc.getPages();
    const totalPages = pages.length;
    
    pages.forEach((page, index) => {
      const { width, height } = page.getSize();
      const pageNumber = index + 1;
      const text = `${this.getTranslation('page', language)} ${pageNumber} ${this.getTranslation('of', language)} ${totalPages}`;
      
      page.drawText(text, {
        x: width - 100,
        y: 30,
        size: 9,
        font: font,
        color: rgb(0.5, 0.5, 0.5)
      });
    });
  }

  /**
   * Format date based on language
   */
  private formatDate(date: Date, language: string): string {
    const locale = language === 'nb' ? 'nb-NO' : language === 'nn' ? 'nn-NO' : 'en-US';
    return new Intl.DateTimeFormat(locale, {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    }).format(date);
  }

  /**
   * Format cell value
   */
  private formatCellValue(value: any, header: string): string {
    if (typeof value === 'number') {
      // Check if it's currency
      if (header.toLowerCase().includes('amount') || header.toLowerCase().includes('beløp')) {
        return new Intl.NumberFormat('nb-NO', {
          style: 'currency',
          currency: 'NOK'
        }).format(value);
      }
      // Check if it's percentage
      if (header.includes('%')) {
        return `${value}%`;
      }
      // Regular number
      return new Intl.NumberFormat('nb-NO').format(value);
    }
    
    return String(value);
  }

  /**
   * Format summary value
   */
  private formatValue(value: any, key: string): string {
    if (typeof value === 'number') {
      if (key.toLowerCase().includes('amount') || key.toLowerCase().includes('total')) {
        return new Intl.NumberFormat('nb-NO', {
          style: 'currency',
          currency: 'NOK',
          minimumFractionDigits: 0,
          maximumFractionDigits: 0
        }).format(value);
      }
      if (key.includes('%') || key.toLowerCase().includes('rate')) {
        return `${value}%`;
      }
      return new Intl.NumberFormat('nb-NO').format(value);
    }
    
    return String(value);
  }

  /**
   * Get translation
   */
  private getTranslation(key: string, language: string): string {
    return this.translations[language]?.[key] || this.translations['nb'][key] || key;
  }
}

/**
 * Generate report component
 */
export async function generateReportComponent(
  options: z.infer<typeof reportComponentOptionsSchema>
): Promise<GenerationResult> {
  const files = new Map<string, string>();
  
  // Generate report service
  const serviceContent = `
${options.typescript ? `
import type { ReportData, ReportType } from '../types/reports';
` : ''}
import { ReportGenerator } from '../lib/report-generator';

/**
 * Report Service for ${options.projectName}
 * Handles report generation and distribution
 */
export class ReportService {
  private generator = new ReportGenerator();

  /**
   * Generate report
   */
  async generateReport(
    type${options.typescript ? ': ReportType' : ''},
    data${options.typescript ? ': ReportData' : ''}
  )${options.typescript ? ': Promise<Buffer>' : ''} {
    return this.generator.generateReport(type, data);
  }

  /**
   * Schedule report generation
   */
  async scheduleReport(
    reportConfig${options.typescript ? ': ReportData' : ''},
    cronExpression${options.typescript ? ': string' : ''}
  )${options.typescript ? ': Promise<void>' : ''} {
    // TODO: Implement report scheduling
    console.log('Scheduling report:', reportConfig.title);
  }

  /**
   * Distribute report
   */
  async distributeReport(
    report${options.typescript ? ': Buffer' : ''},
    recipients${options.typescript ? ': string[]' : ''},
    method${options.typescript ? ': "email" | "slack" | "teams"' : ''} = 'email'
  )${options.typescript ? ': Promise<void>' : ''} {
    // TODO: Implement report distribution
    console.log(\`Distributing report to \${recipients.length} recipients via \${method}\`);
  }
}

// Export singleton instance
export const reportService = new ReportService();`;

  files.set('services/report-service.ts', serviceContent);
  
  return {
    success: true,
    files,
    message: 'Report generator created successfully'
  };
}

// Component options schema
const reportComponentOptionsSchema = z.object({
  typescript: z.boolean().default(true),
  projectName: z.string(),
  outputPath: z.string()
});

// Export generator instance
export const reportGenerator = new ReportGenerator();