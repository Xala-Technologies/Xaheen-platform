import { PDFGenerator, generatePDF, generatePDFComponent } from './pdf-generator';
import { promises as fs } from 'fs';
import path from 'path';

/**
 * Test suite for PDF Generator
 * This file demonstrates the PDF generation capabilities
 */

async function testBasicPDFGeneration(): Promise<void> {
  console.log('Testing basic PDF generation...');
  
  const template = `
# {{title}}

**Author:** {{author}}
**Date:** {{formatNorwegianDate generatedAt}}

## Content

{{content}}

## Norwegian Text Test
Dette er en test av norske tegn: æøå ÆØÅ

**Pris:** {{formatNorwegianCurrency 1500}}
**Antall:** {{formatNorwegianNumber 1234567}}
  `.trim();

  const data = {
    title: 'Test Document',
    author: 'Xaheen CLI',
    content: 'This is a test PDF document with Norwegian character support.',
    generatedAt: new Date(),
  };

  try {
    const pdfBuffer = await generatePDF(template, data);
    console.log(`✓ Basic PDF generated successfully (${pdfBuffer.length} bytes)`);
    
    // Save test PDF
    const outputPath = path.join(process.cwd(), 'test-basic.pdf');
    await fs.writeFile(outputPath, pdfBuffer);
    console.log(`✓ PDF saved to: ${outputPath}`);
  } catch (error) {
    console.error('✗ Basic PDF generation failed:', error);
  }
}

async function testAdvancedPDFGeneration(): Promise<void> {
  console.log('\nTesting advanced PDF generation...');
  
  const template = `
# {{title}}

**Forfatter:** {{author}}
**Opprettet:** {{formatNorwegianDate generatedAt}}

## Innhold

{{content}}

## Metadata
- Emne: {{metadata.subject}}
- Nøkkelord: {{#each metadata.keywords}}{{this}}{{#unless @last}}, {{/unless}}{{/each}}

## Norsk formatering
- Dato: {{formatNorwegianDate generatedAt}}
- Valuta: {{formatNorwegianCurrency 2500}}
- Tall: {{formatNorwegianNumber 9876543}}

Dette dokumentet inneholder norske tegn: æøå ÆØÅ
  `.trim();

  const data = {
    title: 'Avansert Test Dokument',
    author: 'Xaheen CLI Generator',
    content: 'Dette er et avansert PDF-dokument med norsk språkstøtte og metadata.',
    generatedAt: new Date(),
    metadata: {
      subject: 'Test av PDF-generering',
      keywords: ['test', 'pdf', 'norsk', 'xaheen'],
    },
  };

  try {
    const result = await generatePDFComponent({
      template,
      data,
      outputPath: path.join(process.cwd(), 'test-advanced.pdf'),
      metadata: {
        title: data.title,
        author: data.author,
        subject: 'Avansert PDF test',
        keywords: ['test', 'pdf', 'norwegian', 'xaheen'],
        creator: 'Xaheen PDF Generator',
        producer: 'Xaheen CLI v2.28.5',
      },
      fonts: {
        supportNorwegian: true,
      },
    });

    if (result.success) {
      console.log(`✓ Advanced PDF generated successfully`);
      console.log(`  - Pages: ${result.metadata?.pages}`);
      console.log(`  - Size: ${result.metadata?.size} bytes`);
      console.log(`  - Generated at: ${result.metadata?.generatedAt}`);
      console.log(`  - File: ${result.filePath}`);
    } else {
      console.error('✗ Advanced PDF generation failed:', result.error);
    }
  } catch (error) {
    console.error('✗ Advanced PDF generation failed:', error);
  }
}

async function testNorwegianInvoiceTemplate(): Promise<void> {
  console.log('\nTesting Norwegian invoice template...');
  
  const invoiceTemplate = `
# FAKTURA

**Fakturanummer:** {{invoiceNumber}}
**Fakturadato:** {{formatNorwegianDate invoiceDate}}
**Forfallsdato:** {{formatNorwegianDate dueDate}}

## Selger
{{seller.name}}
Org.nr: {{seller.orgNumber}}
{{#if seller.mvaNumber}}MVA-nr: {{seller.mvaNumber}}{{/if}}
{{seller.address}}
{{seller.postalCode}} {{seller.city}}
{{seller.country}}

## Kjøper
{{buyer.name}}
{{#if buyer.orgNumber}}Org.nr: {{buyer.orgNumber}}{{/if}}
{{buyer.address}}
{{buyer.postalCode}} {{buyer.city}}
{{buyer.country}}

## Fakturalinjer

{{#each items}}
{{@index}}. {{description}}
   Antall: {{quantity}} × {{formatNorwegianCurrency unitPrice}} = {{formatNorwegianCurrency total}}
   MVA: {{mvaRate}}%

{{/each}}

---

**Subtotal:** {{formatNorwegianCurrency subtotal}}
**MVA:** {{formatNorwegianCurrency mvaAmount}}
**Total:** {{formatNorwegianCurrency total}}

**Betalingsbetingelser:** {{paymentTerms}}
{{#if bankAccount}}**Kontonummer:** {{bankAccount}}{{/if}}
{{#if reference}}**Referanse:** {{reference}}{{/if}}

{{#if notes}}
## Merknader
{{notes}}
{{/if}}
  `.trim();

  const invoiceData = {
    invoiceNumber: 'INV-2025-001',
    invoiceDate: new Date(),
    dueDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 days from now
    seller: {
      name: 'Xaheen Technologies AS',
      orgNumber: '123456789',
      mvaNumber: 'NO123456789MVA',
      address: 'Teknologiveien 1',
      postalCode: '0001',
      city: 'Oslo',
      country: 'Norge',
    },
    buyer: {
      name: 'Test Kunde AS',
      orgNumber: '987654321',
      address: 'Kundeveien 2',
      postalCode: '0002',
      city: 'Bergen',
      country: 'Norge',
    },
    items: [
      {
        description: 'Xaheen CLI Lisens',
        quantity: 1,
        unitPrice: 5000,
        mvaRate: '25',
        total: 5000,
      },
      {
        description: 'Support og vedlikehold',
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
    bankAccount: '1234.56.78901',
    reference: 'REF-2025-001',
    notes: 'Takk for din bestilling!',
  };

  try {
    const result = await generatePDFComponent({
      template: invoiceTemplate,
      data: invoiceData,
      outputPath: path.join(process.cwd(), 'test-invoice.pdf'),
      metadata: {
        title: `Faktura ${invoiceData.invoiceNumber}`,
        author: invoiceData.seller.name,
        subject: 'Norsk faktura',
        keywords: ['faktura', 'invoice', 'norwegian', 'mva'],
        creator: 'Xaheen PDF Generator',
      },
      fonts: {
        supportNorwegian: true,
      },
    });

    if (result.success) {
      console.log(`✓ Norwegian invoice generated successfully`);
      console.log(`  - File: ${result.filePath}`);
      console.log(`  - Total amount: ${invoiceData.total} NOK`);
    } else {
      console.error('✗ Norwegian invoice generation failed:', result.error);
    }
  } catch (error) {
    console.error('✗ Norwegian invoice generation failed:', error);
  }
}

// Main test function
export async function runPDFTests(): Promise<void> {
  console.log('🔧 Running PDF Generator Tests\n');
  
  await testBasicPDFGeneration();
  await testAdvancedPDFGeneration();
  await testNorwegianInvoiceTemplate();
  
  console.log('\n✅ PDF Generator tests completed!');
  console.log('\nGenerated test files:');
  console.log('- test-basic.pdf');
  console.log('- test-advanced.pdf');
  console.log('- test-invoice.pdf');
}

// Run tests if this file is executed directly
if (import.meta.url === `file://${process.argv[1]}`) {
  runPDFTests().catch(console.error);
}
