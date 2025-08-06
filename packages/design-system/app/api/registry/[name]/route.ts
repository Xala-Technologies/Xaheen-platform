import { NextRequest, NextResponse } from 'next/server';
import { existsSync, readFileSync } from 'fs';
import { join } from 'path';

/**
 * Registry API Route Handler
 * Serves registry items dynamically from the registry directory
 * Compatible with shadcn CLI and supports v0 integration
 */

interface RegistryItem {
  $schema: string;
  name: string;
  type: string;
  title?: string;
  description?: string;
  category?: string;
  author?: string;
  nsm?: {
    classification?: string;
    wcagLevel?: string;
    norwegianOptimized?: boolean;
  };
  platforms?: string[];
  dependencies?: string[];
  devDependencies?: string[];
  registryDependencies?: string[];
  files: Array<{
    path: string;
    type: string;
    target?: string;
    content?: string;
    platform?: string;
  }>;
  cssVars?: {
    theme?: Record<string, string>;
    light?: Record<string, string>;
    dark?: Record<string, string>;
  };
  tailwind?: {
    config?: any;
  };
  config?: any;
  docs?: string;
  categories?: string[];
  meta?: Record<string, any>;
}

export async function GET(
  request: NextRequest,
  { params }: { params: { name: string } }
) {
  const { name } = params;

  // Security: Validate name to prevent path traversal
  if (!name || name.includes('..') || name.includes('/')) {
    return NextResponse.json(
      { error: 'Invalid registry item name' },
      { status: 400 }
    );
  }

  try {
    // Try multiple registry paths
    const registryPaths = [
      join(process.cwd(), 'registry', `${name}.json`),
      join(process.cwd(), 'public/r', `${name}.json`),
      join(process.cwd(), 'dist/registry', `${name}.json`)
    ];

    let registryItem: RegistryItem | null = null;
    let itemPath: string | null = null;

    for (const path of registryPaths) {
      if (existsSync(path)) {
        itemPath = path;
        break;
      }
    }

    if (!itemPath) {
      return NextResponse.json(
        { error: 'Registry item not found' },
        { status: 404 }
      );
    }

    // Read and parse registry item
    const content = readFileSync(itemPath, 'utf-8');
    registryItem = JSON.parse(content);

    // Process files to include content if not already included
    if (registryItem.files) {
      registryItem.files = await Promise.all(
        registryItem.files.map(async (file) => {
          if (!file.content && file.path) {
            const filePath = join(process.cwd(), 'registry', file.path);
            if (existsSync(filePath)) {
              file.content = readFileSync(filePath, 'utf-8');
            }
          }
          return file;
        })
      );
    }

    // Add CORS headers for cross-origin access
    const headers = {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET',
      'Cache-Control': 'public, max-age=3600', // Cache for 1 hour
    };

    return NextResponse.json(registryItem, { headers });

  } catch (error) {
    console.error('Registry API error:', error);
    return NextResponse.json(
      { error: 'Failed to load registry item' },
      { status: 500 }
    );
  }
}

// Export route segment config for Next.js App Router
export const dynamic = 'force-dynamic';
export const revalidate = 3600; // Revalidate every hour