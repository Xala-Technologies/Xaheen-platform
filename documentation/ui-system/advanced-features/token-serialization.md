# Token Serialization & Deserialization

The Token Serialization system in UI System v5 provides comprehensive import/export capabilities for design tokens, supporting multiple formats and enabling seamless token sharing across projects, teams, and tools.

## Overview

The serialization system supports:
- Multiple formats (JSON, YAML, TOML, Binary)
- Compression and optimization
- Format conversion utilities
- Validation on import/export
- Incremental updates
- Version compatibility
- Cross-platform support

## Supported Formats

### 1. JSON Format (Default)

```typescript
import { serializeTokens } from '@xala-technologies/ui-system/tokens/serialization';

const tokens = useTokens();
const jsonString = serializeTokens(tokens, { format: 'json' });

// Pretty printed JSON
const prettyJson = serializeTokens(tokens, { 
  format: 'json',
  pretty: true,
  indent: 2
});

// Minified JSON
const minifiedJson = serializeTokens(tokens, {
  format: 'json',
  minify: true
});
```

Example output:
```json
{
  "version": "1.0.0",
  "metadata": {
    "created": "2024-01-20T10:00:00Z",
    "generator": "ui-system-v5"
  },
  "tokens": {
    "colors": {
      "primary": {
        "50": "#f0f9ff",
        "500": "#3b82f6",
        "900": "#1e3a8a"
      }
    },
    "spacing": {
      "4": "1rem",
      "8": "2rem"
    }
  }
}
```

### 2. YAML Format

```typescript
import { serializeTokens } from '@xala-technologies/ui-system/tokens/serialization';

const yamlString = serializeTokens(tokens, { format: 'yaml' });
```

Example output:
```yaml
version: "1.0.0"
metadata:
  created: "2024-01-20T10:00:00Z"
  generator: "ui-system-v5"
tokens:
  colors:
    primary:
      50: "#f0f9ff"
      500: "#3b82f6"
      900: "#1e3a8a"
  spacing:
    4: "1rem"
    8: "2rem"
```

### 3. TOML Format

```typescript
const tomlString = serializeTokens(tokens, { format: 'toml' });
```

Example output:
```toml
version = "1.0.0"

[metadata]
created = "2024-01-20T10:00:00Z"
generator = "ui-system-v5"

[tokens.colors.primary]
50 = "#f0f9ff"
500 = "#3b82f6"
900 = "#1e3a8a"

[tokens.spacing]
4 = "1rem"
8 = "2rem"
```

### 4. Binary Format (MessagePack)

```typescript
// For efficient storage and transmission
const binaryData = serializeTokens(tokens, { 
  format: 'binary',
  compress: true 
});

// Returns Uint8Array
const sizeInBytes = binaryData.byteLength;
```

## Basic Operations

### Serialization

```typescript
import { serializeTokens, SerializationOptions } from '@xala-technologies/ui-system/tokens/serialization';

const options: SerializationOptions = {
  format: 'json',
  pretty: true,
  includeMetadata: true,
  includeComments: true,
  version: '1.0.0'
};

const serialized = serializeTokens(tokens, options);

// Save to file
fs.writeFileSync('tokens.json', serialized);
```

### Deserialization

```typescript
import { deserializeTokens, DeserializationOptions } from '@xala-technologies/ui-system/tokens/serialization';

const options: DeserializationOptions = {
  validate: true,
  merge: false,
  strict: true
};

// From file
const fileContent = fs.readFileSync('tokens.json', 'utf-8');
const tokens = deserializeTokens(fileContent, options);

// From API response
const response = await fetch('/api/tokens');
const data = await response.text();
const tokens = deserializeTokens(data, { format: 'auto' });
```

## Advanced Features

### 1. Selective Serialization

```typescript
// Serialize only specific token categories
const colorTokens = serializeTokens(tokens, {
  format: 'json',
  include: ['colors', 'gradients'],
  exclude: ['animation', 'transition']
});

// Serialize with filters
const productionTokens = serializeTokens(tokens, {
  format: 'json',
  filter: (key, value) => {
    // Exclude development-only tokens
    if (key.startsWith('dev_')) return false;
    // Exclude deprecated tokens
    if (value?.deprecated) return false;
    return true;
  }
});
```

### 2. Format Conversion

```typescript
import { convertTokenFormat } from '@xala-technologies/ui-system/tokens/serialization';

// Convert between formats
const jsonTokens = fs.readFileSync('tokens.json', 'utf-8');
const yamlTokens = convertTokenFormat(jsonTokens, {
  from: 'json',
  to: 'yaml',
  preserveComments: true
});

// Batch conversion
const files = ['tokens.json', 'theme.json', 'brand.json'];
files.forEach(file => {
  const content = fs.readFileSync(file, 'utf-8');
  const yaml = convertTokenFormat(content, { from: 'json', to: 'yaml' });
  fs.writeFileSync(file.replace('.json', '.yaml'), yaml);
});
```

### 3. Compression & Optimization

```typescript
// Compress tokens for storage
const compressed = serializeTokens(tokens, {
  format: 'json',
  compress: true,
  optimization: {
    removeDefaults: true,
    deduplicateValues: true,
    minifyColorValues: true, // #ffffff -> #fff
    roundNumbers: 2 // Round to 2 decimal places
  }
});

// Size comparison
const uncompressed = serializeTokens(tokens, { format: 'json' });
const ratio = compressed.length / uncompressed.length;
console.log(`Compression ratio: ${(ratio * 100).toFixed(1)}%`);
```

### 4. Incremental Updates

```typescript
import { mergeTokens, diffTokens } from '@xala-technologies/ui-system/tokens/serialization';

// Load base tokens
const baseTokens = deserializeTokens(baseTokensJson);

// Load updates
const updates = deserializeTokens(updatesJson);

// Merge tokens
const merged = mergeTokens(baseTokens, updates, {
  strategy: 'deep', // or 'shallow'
  conflictResolution: 'useLatest', // or 'useBase', 'error'
  arrays: 'concat' // or 'replace'
});

// Calculate diff
const diff = diffTokens(baseTokens, merged);
console.log('Changed tokens:', diff.changed);
console.log('Added tokens:', diff.added);
console.log('Removed tokens:', diff.removed);
```

### 5. Validation

```typescript
import { validateTokens, TokenValidationSchema } from '@xala-technologies/ui-system/tokens/serialization';

// Built-in validation
const validation = validateTokens(tokens, {
  schema: 'strict', // or 'loose', 'custom'
  checkReferences: true,
  checkColorContrast: true,
  checkNaming: true
});

if (!validation.valid) {
  console.error('Validation errors:', validation.errors);
}

// Custom validation schema
const customSchema: TokenValidationSchema = {
  colors: {
    required: true,
    properties: {
      primary: { required: true, type: 'colorScale' },
      neutral: { required: true, type: 'colorScale' }
    }
  },
  spacing: {
    required: true,
    pattern: /^\d+(\.\d+)?(rem|px|em)$/
  }
};

const customValidation = validateTokens(tokens, {
  schema: customSchema
});
```

## Import/Export Workflows

### 1. Design Tool Integration

```typescript
// Export for Figma Tokens plugin
const figmaTokens = serializeTokens(tokens, {
  format: 'json',
  transformer: 'figma',
  includeMetadata: {
    version: true,
    description: true,
    category: true
  }
});

// Import from Style Dictionary
const styleDictionaryTokens = fs.readFileSync('tokens.json', 'utf-8');
const tokens = deserializeTokens(styleDictionaryTokens, {
  format: 'style-dictionary',
  transformers: ['color', 'dimension']
});
```

### 2. CI/CD Pipeline Integration

```typescript
// GitHub Action example
async function publishTokens() {
  const tokens = await loadTokens();
  
  // Serialize for different targets
  const formats = ['json', 'yaml', 'css', 'scss'];
  
  for (const format of formats) {
    const serialized = serializeTokens(tokens, { format });
    const filename = `tokens.${format}`;
    
    // Upload to CDN
    await uploadToCDN(filename, serialized);
    
    // Create GitHub release asset
    await createReleaseAsset(filename, serialized);
  }
}
```

### 3. Team Collaboration

```typescript
// Token sharing service
class TokenSharingService {
  async shareTokens(tokens: TokenSystem, options: ShareOptions) {
    const serialized = serializeTokens(tokens, {
      format: 'json',
      compress: true,
      includeMetadata: {
        author: options.author,
        created: new Date().toISOString(),
        expires: options.expiresIn
      }
    });
    
    const shareId = await this.upload(serialized);
    return `https://tokens.share/${shareId}`;
  }
  
  async importSharedTokens(shareId: string) {
    const data = await this.download(shareId);
    return deserializeTokens(data, {
      validate: true,
      checkExpiry: true
    });
  }
}
```

## Platform-Specific Formats

### 1. CSS Custom Properties

```typescript
const cssTokens = serializeTokens(tokens, {
  format: 'css',
  selector: ':root',
  prefix: '--ui-'
});

// Output:
// :root {
//   --ui-color-primary-500: #3b82f6;
//   --ui-spacing-4: 1rem;
// }
```

### 2. SCSS Variables

```typescript
const scssTokens = serializeTokens(tokens, {
  format: 'scss',
  prefix: '$ui-'
});

// Output:
// $ui-color-primary-500: #3b82f6;
// $ui-spacing-4: 1rem;
```

### 3. JavaScript/TypeScript

```typescript
const jsTokens = serializeTokens(tokens, {
  format: 'js',
  exportType: 'esm' // or 'cjs', 'umd'
});

// Output:
// export const tokens = {
//   colors: { primary: { 500: '#3b82f6' } },
//   spacing: { 4: '1rem' }
// };
```

### 4. iOS (Swift)

```typescript
const swiftTokens = serializeTokens(tokens, {
  format: 'swift',
  enumName: 'DesignTokens'
});

// Output:
// enum DesignTokens {
//   enum Colors {
//     static let primary500 = UIColor(hex: "#3b82f6")
//   }
// }
```

### 5. Android (XML)

```typescript
const androidTokens = serializeTokens(tokens, {
  format: 'android-xml'
});

// Output:
// <resources>
//   <color name="primary_500">#3b82f6</color>
//   <dimen name="spacing_4">16dp</dimen>
// </resources>
```

## Error Handling

### 1. Serialization Errors

```typescript
try {
  const serialized = serializeTokens(tokens, options);
} catch (error) {
  if (error instanceof SerializationError) {
    console.error('Serialization failed:', error.message);
    console.error('Token path:', error.tokenPath);
    console.error('Value:', error.value);
  }
}
```

### 2. Deserialization Errors

```typescript
try {
  const tokens = deserializeTokens(data, options);
} catch (error) {
  if (error instanceof DeserializationError) {
    console.error('Deserialization failed:', error.message);
    console.error('Line:', error.line);
    console.error('Column:', error.column);
    
    // Attempt recovery
    const recovered = deserializeTokens(data, {
      ...options,
      strict: false,
      recover: true
    });
  }
}
```

## Best Practices

### 1. Version Control

```typescript
// Always include version information
const serialized = serializeTokens(tokens, {
  format: 'json',
  includeMetadata: {
    version: packageJson.version,
    schema: '1.0.0',
    compatible: '^1.0.0'
  }
});

// Check version compatibility on import
const tokens = deserializeTokens(data, {
  checkVersion: true,
  minVersion: '1.0.0',
  maxVersion: '2.0.0'
});
```

### 2. Backup and Recovery

```typescript
// Create backups before updates
async function updateTokens(newTokens: TokenSystem) {
  const current = await loadCurrentTokens();
  
  // Backup current tokens
  const backup = serializeTokens(current, {
    format: 'json',
    includeMetadata: {
      backupDate: new Date().toISOString(),
      reason: 'pre-update-backup'
    }
  });
  
  await saveBackup(backup);
  
  // Apply updates
  await saveTokens(newTokens);
}
```

### 3. Performance Optimization

```typescript
// Use streaming for large token sets
import { createTokenStream } from '@xala-technologies/ui-system/tokens/serialization';

const stream = createTokenStream(tokens, {
  format: 'json',
  chunkSize: 1024 * 16 // 16KB chunks
});

stream.pipe(fs.createWriteStream('large-tokens.json'));

// Lazy loading
const tokenLoader = {
  async loadColors() {
    const data = await fetch('/tokens/colors.json');
    return deserializeTokens(await data.text());
  },
  
  async loadTypography() {
    const data = await fetch('/tokens/typography.json');
    return deserializeTokens(await data.text());
  }
};
```

## Testing Serialization

```typescript
import { testSerialization } from '@xala-technologies/ui-system/test-utils';

describe('Token Serialization', () => {
  it('should round-trip without data loss', () => {
    const original = createTestTokens();
    const serialized = serializeTokens(original, { format: 'json' });
    const deserialized = deserializeTokens(serialized);
    
    expect(deserialized).toEqual(original);
  });
  
  it('should handle all formats', () => {
    const formats = ['json', 'yaml', 'toml', 'binary'];
    
    formats.forEach(format => {
      const result = testSerialization(tokens, { format });
      expect(result.roundTrip).toBe(true);
      expect(result.dataLoss).toBe(false);
    });
  });
});
```

## Migration Guide

### From Custom Format to Standard

```typescript
// Legacy format converter
function convertLegacyTokens(legacyData: any): TokenSystem {
  const converter = createLegacyConverter({
    colorMapping: {
      'brand.primary': 'colors.primary.500',
      'brand.secondary': 'colors.secondary.500'
    },
    valueTransformers: {
      spacing: (value) => `${value / 16}rem`
    }
  });
  
  return converter.convert(legacyData);
}

// Usage
const legacyTokens = JSON.parse(fs.readFileSync('old-tokens.json', 'utf-8'));
const modernTokens = convertLegacyTokens(legacyTokens);
const serialized = serializeTokens(modernTokens, { format: 'json' });
```

## Next Steps

- [Token Versioning](./token-versioning.md)
- [Token Diffing](./token-diffing.md)
- [Platform-Specific Tokens](./platform-specific-tokens.md)