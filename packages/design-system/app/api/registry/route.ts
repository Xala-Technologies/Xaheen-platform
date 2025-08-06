import { NextRequest, NextResponse } from 'next/server';
import { existsSync, readFileSync } from 'fs';
import { join } from 'path';

/**
 * Registry Index API Route
 * Returns the registry index with all available items
 */

interface RegistryIndex {
  name: string;
  version: string;
  homepage: string;
  description?: string;
  items: Array<{
    name: string;
    type: string;
    title?: string;
    description?: string;
    category?: string;
    platforms?: string[];
    nsm?: {
      classification?: string;
      wcagLevel?: string;
      norwegianOptimized?: boolean;
    };
    categories?: string[];
    author?: string;
  }>;
}

export async function GET(request: NextRequest) {
  try {
    // Try multiple index paths
    const indexPaths = [
      join(process.cwd(), 'registry/index.json'),
      join(process.cwd(), 'public/r/index.json'),
      join(process.cwd(), 'dist/registry/index.json')
    ];

    let indexPath: string | null = null;

    for (const path of indexPaths) {
      if (existsSync(path)) {
        indexPath = path;
        break;
      }
    }

    if (!indexPath) {
      // If no index found, try to read registry.json and generate index
      const registryPath = join(process.cwd(), 'registry/registry.json');
      if (existsSync(registryPath)) {
        const registryContent = readFileSync(registryPath, 'utf-8');
        const registry = JSON.parse(registryContent);
        
        const index: RegistryIndex = {
          name: registry.name,
          version: registry.version,
          homepage: registry.homepage,
          description: registry.description,
          items: registry.items.map((item: any) => ({
            name: item.name,
            type: item.type,
            title: item.title,
            description: item.description,
            category: item.category,
            platforms: item.platforms,
            nsm: item.nsm,
            categories: item.categories,
            author: item.author
          }))
        };

        return NextResponse.json(index, {
          headers: {
            'Access-Control-Allow-Origin': '*',
            'Access-Control-Allow-Methods': 'GET',
            'Cache-Control': 'public, max-age=3600',
          }
        });
      }

      return NextResponse.json(
        { error: 'Registry index not found' },
        { status: 404 }
      );
    }

    const content = readFileSync(indexPath, 'utf-8');
    const index = JSON.parse(content);

    return NextResponse.json(index, {
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'GET',
        'Cache-Control': 'public, max-age=3600',
      }
    });

  } catch (error) {
    console.error('Registry index API error:', error);
    return NextResponse.json(
      { error: 'Failed to load registry index' },
      { status: 500 }
    );
  }
}

export const dynamic = 'force-dynamic';
export const revalidate = 3600;