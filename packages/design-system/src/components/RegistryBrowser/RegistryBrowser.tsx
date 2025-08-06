/**
 * Registry Browser Component
 * Interactive UI for browsing and installing Xaheen components
 */

import React, { useState, useEffect, useMemo } from 'react';
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from '../Card/Card';
import { Button } from '../Button/Button';
import { Input } from '../Input/Input';
import { LoadingSpinner } from '../LoadingSpinner/LoadingSpinner';
import { cn } from '../../utils/cn';

interface RegistryItem {
  name: string;
  type: string;
  title?: string;
  description?: string;
  category?: string;
  categories?: string[];
  nsm?: {
    classification?: string;
    wcagLevel?: string;
    norwegianOptimized?: boolean;
  };
  platforms?: string[];
  author?: string;
}

interface RegistryIndex {
  name: string;
  version: string;
  homepage: string;
  description?: string;
  items: RegistryItem[];
}

export interface RegistryBrowserProps {
  readonly registryUrl?: string;
  readonly onInstall?: (item: RegistryItem) => void;
  readonly className?: string;
}

export const RegistryBrowser = ({
  registryUrl = '/api/registry',
  onInstall,
  className
}: RegistryBrowserProps): JSX.Element => {
  const [index, setIndex] = useState<RegistryIndex | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [selectedPlatform, setSelectedPlatform] = useState<string>('all');
  const [selectedNsm, setSelectedNsm] = useState<string>('all');

  // Fetch registry index
  useEffect(() => {
    const fetchIndex = async () => {
      try {
        setLoading(true);
        const response = await fetch(registryUrl);
        if (!response.ok) {
          throw new Error(`Failed to fetch registry: ${response.statusText}`);
        }
        const data = await response.json();
        setIndex(data);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Unknown error');
      } finally {
        setLoading(false);
      }
    };

    fetchIndex();
  }, [registryUrl]);

  // Extract unique categories, platforms, and NSM classifications
  const filters = useMemo(() => {
    if (!index) return { categories: [], platforms: [], nsmLevels: [] };

    const categories = new Set<string>();
    const platforms = new Set<string>();
    const nsmLevels = new Set<string>();

    index.items.forEach(item => {
      if (item.category) categories.add(item.category);
      if (item.categories) item.categories.forEach(cat => categories.add(cat));
      if (item.platforms) item.platforms.forEach(platform => platforms.add(platform));
      if (item.nsm?.classification) nsmLevels.add(item.nsm.classification);
    });

    return {
      categories: Array.from(categories).sort(),
      platforms: Array.from(platforms).sort(),
      nsmLevels: Array.from(nsmLevels)
    };
  }, [index]);

  // Filter items
  const filteredItems = useMemo(() => {
    if (!index) return [];

    return index.items.filter(item => {
      // Search filter
      if (searchQuery) {
        const query = searchQuery.toLowerCase();
        const matchesSearch = 
          item.name.toLowerCase().includes(query) ||
          item.title?.toLowerCase().includes(query) ||
          item.description?.toLowerCase().includes(query);
        
        if (!matchesSearch) return false;
      }

      // Category filter
      if (selectedCategory !== 'all') {
        const hasCategory = 
          item.category === selectedCategory ||
          item.categories?.includes(selectedCategory);
        
        if (!hasCategory) return false;
      }

      // Platform filter
      if (selectedPlatform !== 'all') {
        if (!item.platforms?.includes(selectedPlatform)) return false;
      }

      // NSM filter
      if (selectedNsm !== 'all') {
        if (item.nsm?.classification !== selectedNsm) return false;
      }

      return true;
    });
  }, [index, searchQuery, selectedCategory, selectedPlatform, selectedNsm]);

  // NSM classification colors
  const getNsmColor = (classification?: string): string => {
    switch (classification) {
      case 'OPEN': return 'text-green-600 bg-green-50 border-green-200';
      case 'RESTRICTED': return 'text-yellow-600 bg-yellow-50 border-yellow-200';
      case 'CONFIDENTIAL': return 'text-red-600 bg-red-50 border-red-200';
      case 'SECRET': return 'text-gray-800 bg-gray-100 border-gray-300';
      default: return '';
    }
  };

  if (loading) {
    return (
      <div className={cn('flex items-center justify-center p-8', className)}>
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  if (error) {
    return (
      <div className={cn('p-8 text-center', className)}>
        <p className="text-red-600 mb-4">Error loading registry: {error}</p>
        <Button onClick={() => window.location.reload()}>
          Retry
        </Button>
      </div>
    );
  }

  return (
    <div className={cn('space-y-6', className)}>
      {/* Header */}
      <div>
        <h2 className="text-2xl font-bold mb-2">Component Registry</h2>
        {index?.description && (
          <p className="text-gray-600">{index.description}</p>
        )}
      </div>

      {/* Filters */}
      <div className="space-y-4">
        {/* Search */}
        <Input
          placeholder="Search components..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="max-w-md"
        />

        {/* Filter buttons */}
        <div className="flex flex-wrap gap-4">
          {/* Category filter */}
          <div>
            <label className="block text-sm font-medium mb-2">Category</label>
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="h-10 px-3 rounded-lg border border-gray-300 focus:border-blue-500 focus:ring-2 focus:ring-blue-200"
            >
              <option value="all">All Categories</option>
              {filters.categories.map(cat => (
                <option key={cat} value={cat}>{cat}</option>
              ))}
            </select>
          </div>

          {/* Platform filter */}
          <div>
            <label className="block text-sm font-medium mb-2">Platform</label>
            <select
              value={selectedPlatform}
              onChange={(e) => setSelectedPlatform(e.target.value)}
              className="h-10 px-3 rounded-lg border border-gray-300 focus:border-blue-500 focus:ring-2 focus:ring-blue-200"
            >
              <option value="all">All Platforms</option>
              {filters.platforms.map(platform => (
                <option key={platform} value={platform}>{platform}</option>
              ))}
            </select>
          </div>

          {/* NSM filter */}
          {filters.nsmLevels.length > 0 && (
            <div>
              <label className="block text-sm font-medium mb-2">NSM Classification</label>
              <select
                value={selectedNsm}
                onChange={(e) => setSelectedNsm(e.target.value)}
                className="h-10 px-3 rounded-lg border border-gray-300 focus:border-blue-500 focus:ring-2 focus:ring-blue-200"
              >
                <option value="all">All Classifications</option>
                {filters.nsmLevels.map(level => (
                  <option key={level} value={level}>{level}</option>
                ))}
              </select>
            </div>
          )}
        </div>
      </div>

      {/* Results count */}
      <div className="text-sm text-gray-600">
        Showing {filteredItems.length} of {index?.items.length || 0} components
      </div>

      {/* Component grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredItems.map(item => (
          <Card key={item.name} className="hover:shadow-lg transition-shadow">
            <CardHeader>
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <CardTitle className="text-lg">
                    {item.title || item.name}
                  </CardTitle>
                  <div className="flex items-center gap-2 mt-1">
                    <span className="text-xs text-gray-500">{item.type}</span>
                    {item.nsm?.classification && (
                      <span className={cn(
                        'text-xs px-2 py-0.5 rounded-full border',
                        getNsmColor(item.nsm.classification)
                      )}>
                        {item.nsm.classification}
                      </span>
                    )}
                  </div>
                </div>
              </div>
              {item.description && (
                <CardDescription className="mt-2">
                  {item.description}
                </CardDescription>
              )}
            </CardHeader>

            <CardContent>
              <div className="space-y-2 text-sm">
                {item.author && (
                  <div>
                    <span className="text-gray-500">Author:</span>{' '}
                    <span>{item.author}</span>
                  </div>
                )}
                {item.platforms && (
                  <div>
                    <span className="text-gray-500">Platforms:</span>{' '}
                    <span>{item.platforms.join(', ')}</span>
                  </div>
                )}
                {item.categories && item.categories.length > 0 && (
                  <div>
                    <span className="text-gray-500">Tags:</span>{' '}
                    {item.categories.map(cat => (
                      <span
                        key={cat}
                        className="inline-block px-2 py-0.5 text-xs bg-gray-100 rounded-full mr-1"
                      >
                        {cat}
                      </span>
                    ))}
                  </div>
                )}
              </div>
            </CardContent>

            <CardFooter>
              <Button
                size="md"
                fullWidth
                onClick={() => onInstall?.(item)}
                aria-label={`Install ${item.title || item.name}`}
              >
                Install
              </Button>
            </CardFooter>
          </Card>
        ))}
      </div>

      {/* No results */}
      {filteredItems.length === 0 && (
        <div className="text-center py-12">
          <p className="text-gray-500">No components found matching your criteria.</p>
        </div>
      )}
    </div>
  );
};