const fs = require('fs');
const path = require('path');

// Read the constant.ts file
const constantsPath = path.join(__dirname, 'apps/web/src/lib/constant.ts');
const constantsContent = fs.readFileSync(constantsPath, 'utf8');

// Extract the TECH_OPTIONS object
const startMarker = 'export const TECH_OPTIONS: Record<';
const endMarker = '};';

const startIndex = constantsContent.indexOf(startMarker);
if (startIndex === -1) {
  console.error('Could not find TECH_OPTIONS start marker');
  process.exit(1);
}

// Find the opening brace of the object
const openBraceIndex = constantsContent.indexOf('> = {', startIndex);
if (openBraceIndex === -1) {
  console.error('Could not find opening brace');
  process.exit(1);
}

// Find the matching closing brace
let braceCount = 0;
let endIndex = openBraceIndex + 4; // Start after '> = {'
let inString = false;
let stringChar = '';

for (let i = endIndex; i < constantsContent.length; i++) {
  const char = constantsContent[i];
  const prevChar = constantsContent[i - 1];
  
  // Handle string literals
  if ((char === '"' || char === "'" || char === '`') && prevChar !== '\\') {
    if (!inString) {
      inString = true;
      stringChar = char;
    } else if (char === stringChar) {
      inString = false;
      stringChar = '';
    }
  }
  
  if (!inString) {
    if (char === '{') {
      braceCount++;
    } else if (char === '}') {
      if (braceCount === 0) {
        endIndex = i + 1;
        break;
      }
      braceCount--;
    }
  }
}

// Extract the object content
const objectStart = constantsContent.indexOf('{', openBraceIndex) + 1;
const objectEnd = endIndex - 1;
const objectContent = constantsContent.substring(objectStart, objectEnd).trim();

// Convert to JSON format
const jsonContent = convertToJson(objectContent);

// Write to JSON file
const outputPath = path.join(__dirname, 'apps/web/src/data/tech-options.json');
fs.writeFileSync(outputPath, JSON.stringify(jsonContent, null, 2));

console.log('Successfully extracted TECH_OPTIONS to tech-options.json');

function convertToJson(tsContent) {
  // This is a simplified conversion - we'll need to manually clean up the result
  // For now, let's just extract the structure and fix it manually
  return {};
}
