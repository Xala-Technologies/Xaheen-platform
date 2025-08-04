#!/usr/bin/env node

/**
 * Documentation Validation Script for Xala UI Component Specifications
 * 
 * This script validates that generated documentation is complete, accurate,
 * and follows the Xala documentation standards.
 */

const fs = require('fs-extra');
const path = require('path');
const glob = require('glob');
const { marked } = require('marked');
const yargs = require('yargs/yargs');
const { hideBin } = require('yargs/helpers');

// Configuration
const DOCS_DIR = path.join(__dirname, '..', 'docs', 'specifications');
const COMPONENTS_DIR = path.join(DOCS_DIR, 'components');
const SPECS_DIR = path.join(__dirname, '..', 'schemas');

/**
 * Validation result structure
 */
class ValidationResult {
  constructor() {
    this.passed = 0;
    this.failed = 0;
    this.warnings = 0;
    this.errors = [];
    this.warningMessages = [];
    this.files = [];
    this.coverage = {
      components: 0,
      totalComponents: 0,
      documentation: {
        overview: 0,
        props: 0,
        examples: 0
      }
    };
  }
  
  addError(file, message, type = 'error') {
    this.errors.push({ file, message, type });
    this.failed++;
  }
  
  addWarning(file, message) {
    this.warningMessages.push({ file, message });
    this.warnings++;
  }
  
  addFile(file, status) {
    this.files.push({ file, status });
    if (status === 'passed') {
      this.passed++;
    }
  }
  
  getScore() {
    const total = this.passed + this.failed;
    return total === 0 ? 0 : Math.round((this.passed / total) * 100);
  }
}

/**
 * Load all component specifications
 */
async function loadSpecifications() {
  try {
    const specFiles = glob.sync('**/*.json', { cwd: SPECS_DIR });
    const specifications = [];
    
    for (const file of specFiles) {
      const filePath = path.join(SPECS_DIR, file);
      
      try {
        const content = await fs.readFile(filePath, 'utf8');
        
        // Skip schema and validation files
        if (file.includes('schema') || file.includes('validation')) {
          continue;
        }
        
        const spec = JSON.parse(content);
        
        // Basic validation - check if it looks like a component spec
        if (spec.metadata && spec.metadata.name) {
          specifications.push({
            ...spec,
            _filePath: filePath,
            _fileName: file
          });
        }
      } catch (parseError) {
        console.warn(`Skipping invalid JSON file: ${file}`);
      }
    }
    
    return specifications;
  } catch (error) {
    console.error('Error loading specifications:', error);
    throw error;
  }
}

/**
 * Validate markdown file structure and content
 */
async function validateMarkdownFile(filePath, expectedContent = {}) {
  const errors = [];
  const warnings = [];
  
  try {
    if (!await fs.pathExists(filePath)) {
      errors.push(`File does not exist: ${filePath}`);
      return { errors, warnings };
    }
    
    const content = await fs.readFile(filePath, 'utf8');
    
    // Parse markdown to extract structure
    const tokens = marked.lexer(content);
    
    // Validate frontmatter
    if (content.startsWith('---')) {
      const frontmatterMatch = content.match(/^---\n([\s\S]*?)\n---/);
      if (frontmatterMatch) {
        const frontmatter = frontmatterMatch[1];
        
        // Check required frontmatter fields
        const requiredFields = ['title', 'lastUpdated'];
        for (const field of requiredFields) {
          if (!frontmatter.includes(`${field}:`)) {
            warnings.push(`Missing frontmatter field: ${field}`);
          }
        }
      }
    } else {
      warnings.push('Missing frontmatter');
    }
    
    // Validate heading structure
    const headings = tokens.filter(token => token.type === 'heading');
    if (headings.length === 0) {
      errors.push('No headings found');
    } else {
      // Check for proper H1
      const h1Headings = headings.filter(h => h.depth === 1);
      if (h1Headings.length === 0) {
        errors.push('Missing H1 heading');
      } else if (h1Headings.length > 1) {
        warnings.push('Multiple H1 headings found');
      }
      
      // Check heading hierarchy
      let lastDepth = 0;
      for (const heading of headings) {
        if (heading.depth > lastDepth + 1) {
          warnings.push(`Heading hierarchy skip: H${lastDepth} to H${heading.depth}`);
        }
        lastDepth = heading.depth;
      }
    }
    
    // Validate links
    const links = tokens
      .filter(token => token.type === 'paragraph' || token.type === 'list')
      .flatMap(token => token.tokens || [])
      .filter(token => token.type === 'link');
    
    for (const link of links) {
      if (link.href.startsWith('./') || link.href.startsWith('../')) {
        // Validate relative links
        const linkPath = path.resolve(path.dirname(filePath), link.href);
        if (!await fs.pathExists(linkPath)) {
          errors.push(`Broken relative link: ${link.href}`);
        }
      }
    }
    
    // Validate code blocks
    const codeBlocks = tokens.filter(token => token.type === 'code');
    for (const codeBlock of codeBlocks) {
      if (!codeBlock.lang) {
        warnings.push('Code block without language specification');
      }
    }
    
    // Content-specific validations
    if (expectedContent.componentName) {
      if (!content.includes(expectedContent.componentName)) {
        errors.push(`Missing component name: ${expectedContent.componentName}`);
      }
    }
    
    if (expectedContent.sections) {
      for (const section of expectedContent.sections) {
        if (!content.toLowerCase().includes(section.toLowerCase())) {
          warnings.push(`Missing expected section: ${section}`);
        }
      }
    }
    
    return { errors, warnings };
    
  } catch (error) {
    errors.push(`Error reading file: ${error.message}`);
    return { errors, warnings };
  }
}

/**
 * Validate component documentation completeness
 */
async function validateComponentDocs(spec, result) {
  const componentName = spec.metadata.name;
  const category = spec.metadata.category || 'uncategorized';
  const categoryDir = path.join(COMPONENTS_DIR, category);
  
  console.log(`Validating documentation for ${componentName}...`);
  
  // Expected files
  const expectedFiles = [
    { 
      path: path.join(categoryDir, `${componentName}.md`), 
      type: 'overview',
      sections: ['Props API', 'Accessibility Features', 'Examples']
    },
    { 
      path: path.join(categoryDir, `${componentName}-props.md`), 
      type: 'props',
      sections: ['Props Overview', 'Detailed Props Reference']
    },
    { 
      path: path.join(categoryDir, `${componentName}-examples.md`), 
      type: 'examples',
      sections: ['Basic Examples', 'Platform-Specific Examples']
    }
  ];
  
  let componentPassed = true;
  
  for (const expectedFile of expectedFiles) {
    const validation = await validateMarkdownFile(expectedFile.path, {
      componentName,
      sections: expectedFile.sections
    });
    
    if (validation.errors.length > 0) {
      componentPassed = false;
      validation.errors.forEach(error => {
        result.addError(expectedFile.path, error);
      });
    }
    
    validation.warnings.forEach(warning => {
      result.addWarning(expectedFile.path, warning);
    });
    
    if (await fs.pathExists(expectedFile.path)) {
      result.coverage.documentation[expectedFile.type]++;
      result.addFile(expectedFile.path, validation.errors.length === 0 ? 'passed' : 'failed');
    } else {
      result.addError(expectedFile.path, 'Documentation file missing');
      componentPassed = false;
    }
  }
  
  if (componentPassed) {
    result.coverage.components++;
    console.log(`✅ ${componentName} documentation is valid`);
  } else {
    console.log(`❌ ${componentName} documentation has issues`);
  }
  
  result.coverage.totalComponents++;
}

/**
 * Validate category indexes
 */
async function validateCategoryIndexes(specifications, result) {
  console.log('Validating category indexes...');
  
  const categories = [...new Set(specifications.map(spec => spec.metadata.category || 'uncategorized'))];
  
  for (const category of categories) {
    const indexPath = path.join(COMPONENTS_DIR, category, 'README.md');
    const categorySpecs = specifications.filter(spec => (spec.metadata.category || 'uncategorized') === category);
    
    const validation = await validateMarkdownFile(indexPath, {
      sections: ['Components in this category', 'Quick Start']
    });
    
    // Check if all components in category are listed
    if (await fs.pathExists(indexPath)) {
      const content = await fs.readFile(indexPath, 'utf8');
      
      for (const spec of categorySpecs) {
        if (!content.includes(spec.metadata.name)) {
          result.addWarning(indexPath, `Component ${spec.metadata.name} not listed in category index`);
        }
      }
    }
    
    validation.errors.forEach(error => {
      result.addError(indexPath, error);
    });
    
    validation.warnings.forEach(warning => {
      result.addWarning(indexPath, warning);
    });
    
    result.addFile(indexPath, validation.errors.length === 0 ? 'passed' : 'failed');
  }
}

/**
 * Validate main documentation structure
 */
async function validateMainStructure(result) {
  console.log('Validating main documentation structure...');
  
  const mainFiles = [
    path.join(DOCS_DIR, 'README.md'),
    path.join(DOCS_DIR, 'getting-started.md'),
    path.join(DOCS_DIR, 'schema-reference.md'),
    path.join(COMPONENTS_DIR, 'README.md'),
    path.join(DOCS_DIR, 'api', 'specification-api.md')
  ];
  
  for (const filePath of mainFiles) {
    const validation = await validateMarkdownFile(filePath);
    
    validation.errors.forEach(error => {
      result.addError(filePath, error);
    });
    
    validation.warnings.forEach(warning => {
      result.addWarning(filePath, warning);
    });
    
    result.addFile(filePath, validation.errors.length === 0 ? 'passed' : 'failed');
  }
}

/**
 * Validate cross-references and navigation
 */
async function validateCrossReferences(specifications, result) {
  console.log('Validating cross-references...');
  
  // Get all documentation files
  const docFiles = glob.sync('**/*.md', { cwd: DOCS_DIR });
  
  for (const docFile of docFiles) {
    const filePath = path.join(DOCS_DIR, docFile);
    
    try {
      const content = await fs.readFile(filePath, 'utf8');
      
      // Find internal links
      const linkRegex = /\[([^\]]+)\]\(([^)]+)\)/g;
      let match;
      
      while ((match = linkRegex.exec(content)) !== null) {
        const linkText = match[1];
        const linkHref = match[2];
        
        // Skip external links
        if (linkHref.startsWith('http') || linkHref.startsWith('mailto:')) {
          continue;
        }
        
        // Resolve relative links
        const resolvedPath = path.resolve(path.dirname(filePath), linkHref);
        
        // Check if target exists
        if (!await fs.pathExists(resolvedPath)) {
          result.addError(filePath, `Broken link: ${linkHref} (${linkText})`);
        }
      }
      
    } catch (error) {
      result.addError(filePath, `Error reading file for cross-reference validation: ${error.message}`);
    }
  }
}

/**
 * Generate validation report
 */
function generateReport(result, options = {}) {
  const score = result.getScore();
  const coveragePercent = result.coverage.totalComponents === 0 ? 0 : 
    Math.round((result.coverage.components / result.coverage.totalComponents) * 100);
  
  console.log('\n📊 Validation Report');
  console.log('=' .repeat(50));
  console.log(`Overall Score: ${score}%`);
  console.log(`Coverage: ${coveragePercent}% (${result.coverage.components}/${result.coverage.totalComponents} components)`);
  console.log(`Files Passed: ${result.passed}`);
  console.log(`Files Failed: ${result.failed}`);
  console.log(`Warnings: ${result.warnings}`);
  
  if (result.errors.length > 0) {
    console.log('\n❌ Errors:');
    result.errors.forEach((error, index) => {
      console.log(`${index + 1}. ${path.relative(DOCS_DIR, error.file)}: ${error.message}`);
    });
  }
  
  if (result.warningMessages.length > 0 && options.showWarnings) {
    console.log('\n⚠️  Warnings:');
    result.warningMessages.forEach((warning, index) => {
      console.log(`${index + 1}. ${path.relative(DOCS_DIR, warning.file)}: ${warning.message}`);
    });
  }
  
  console.log('\n📈 Coverage Details:');
  console.log(`- Component Overviews: ${result.coverage.documentation.overview}`);
  console.log(`- Props Documentation: ${result.coverage.documentation.props}`);
  console.log(`- Usage Examples: ${result.coverage.documentation.examples}`);
  
  if (options.outputFile) {
    const reportData = {
      timestamp: new Date().toISOString(),
      score,
      coverage: {
        percent: coveragePercent,
        components: result.coverage.components,
        total: result.coverage.totalComponents,
        documentation: result.coverage.documentation
      },
      summary: {
        passed: result.passed,
        failed: result.failed,
        warnings: result.warnings
      },
      errors: result.errors,
      warnings: result.warningMessages,
      files: result.files
    };
    
    fs.writeFileSync(options.outputFile, JSON.stringify(reportData, null, 2));
    console.log(`\n📄 Report saved to: ${options.outputFile}`);
  }
  
  return {
    score,
    coverage: coveragePercent,
    passed: result.passed,
    failed: result.failed,
    warnings: result.warnings
  };
}

/**
 * Main validation function
 */
async function validateDocs(options = {}) {
  console.log('🔍 Starting documentation validation...');
  
  const result = new ValidationResult();
  
  try {
    // Load specifications
    console.log('📋 Loading specifications...');
    const specifications = await loadSpecifications();
    console.log(`Found ${specifications.length} specifications`);
    
    if (specifications.length === 0) {
      console.warn('⚠️  No specifications found. Cannot validate documentation.');
      return result;
    }
    
    // Validate main structure
    await validateMainStructure(result);
    
    // Validate component documentation
    for (const spec of specifications) {
      if (options.component && spec.metadata.name !== options.component) {
        continue;
      }
      
      await validateComponentDocs(spec, result);
    }
    
    // Validate category indexes
    await validateCategoryIndexes(specifications, result);
    
    // Validate cross-references
    if (!options.skipCrossRefs) {
      await validateCrossReferences(specifications, result);
    }
    
    console.log('✅ Documentation validation complete!');
    
    return result;
    
  } catch (error) {
    console.error('❌ Documentation validation failed:', error);
    throw error;
  }
}

/**
 * CLI setup
 */
function setupCLI() {
  return yargs(hideBin(process.argv))
    .command(
      '$0 [options]',
      'Validate component documentation',
      (yargs) => {
        return yargs
          .option('component', {
            alias: 'c',
            describe: 'Validate specific component only',
            type: 'string'
          })
          .option('skip-cross-refs', {
            describe: 'Skip cross-reference validation',
            type: 'boolean',
            default: false
          })
          .option('show-warnings', {
            alias: 'w',
            describe: 'Show warnings in output',
            type: 'boolean',
            default: false
          })
          .option('output', {
            alias: 'o',
            describe: 'Output JSON report file',
            type: 'string'
          })
          .option('fail-threshold', {
            describe: 'Fail if score below threshold (0-100)',
            type: 'number',
            default: 80
          })
          .option('verbose', {
            alias: 'v',
            describe: 'Verbose output',
            type: 'boolean',
            default: false
          });
      },
      async (argv) => {
        try {
          if (argv.verbose) {
            console.log('Options:', argv);
          }
          
          const result = await validateDocs({
            component: argv.component,
            skipCrossRefs: argv.skipCrossRefs,
            verbose: argv.verbose
          });
          
          const report = generateReport(result, {
            showWarnings: argv.showWarnings,
            outputFile: argv.output
          });
          
          // Check if validation passes threshold
          if (report.score < argv.failThreshold) {
            console.error(`\n❌ Validation failed: Score ${report.score}% is below threshold ${argv.failThreshold}%`);
            process.exit(1);
          }
          
          console.log(`\n✅ Validation passed: Score ${report.score}% meets threshold ${argv.failThreshold}%`);
          process.exit(0);
          
        } catch (error) {
          console.error('Validation failed:', error);
          process.exit(1);
        }
      }
    )
    .help()
    .alias('help', 'h')
    .version()
    .alias('version', 'V');
}

// Run CLI if this file is executed directly
if (require.main === module) {
  setupCLI().argv;
}

module.exports = {
  validateDocs,
  validateMarkdownFile,
  validateComponentDocs,
  generateReport
};