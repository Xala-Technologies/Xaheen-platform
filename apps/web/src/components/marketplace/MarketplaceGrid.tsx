import React, { useState, useMemo } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { NSMBadge } from '@/components/ui/nsm-badge';
import { cn } from '@/lib/utils';

interface Plugin {
  readonly id: string;
  readonly name: string;
  readonly description: string;
  readonly author: string;
  readonly icon: string;
  readonly category: string;
  readonly downloads: number;
  readonly rating: number;
  readonly version: string;
  readonly nsmClassification: 'OPEN' | 'RESTRICTED' | 'CONFIDENTIAL' | 'SECRET';
  readonly tags: readonly string[];
  readonly installed?: boolean;
  readonly verified?: boolean;
}

const mockPlugins: readonly Plugin[] = [
  {
    id: 'bankid-auth',
    name: 'BankID Authentication',
    description: 'Complete Norwegian BankID integration with test environment support',
    author: 'Xaheen Official',
    icon: '🏦',
    category: 'Authentication',
    downloads: 12453,
    rating: 4.9,
    version: '2.3.1',
    nsmClassification: 'RESTRICTED',
    tags: ['auth', 'norwegian', 'bankid', 'security'],
    installed: true,
    verified: true
  },
  {
    id: 'altinn-integration',
    name: 'Altinn Services',
    description: 'Seamless integration with Altinn authorization and notification services',
    author: 'Xaheen Official',
    icon: '🏛️',
    category: 'Government',
    downloads: 8932,
    rating: 4.8,
    version: '1.5.0',
    nsmClassification: 'CONFIDENTIAL',
    tags: ['altinn', 'government', 'authorization'],
    verified: true
  },
  {
    id: 'vipps-payment',
    name: 'Vipps Payment Gateway',
    description: 'Accept payments through Vipps with recurring payment support',
    author: 'Community',
    icon: '💳',
    category: 'Payment',
    downloads: 6234,
    rating: 4.7,
    version: '3.1.0',
    nsmClassification: 'RESTRICTED',
    tags: ['payment', 'vipps', 'norwegian'],
    verified: false
  },
  {
    id: 'digipost-integration',
    name: 'Digipost Digital Mailbox',
    description: 'Send secure digital mail to Norwegian citizens via Digipost',
    author: 'Xaheen Official',
    icon: '📮',
    category: 'Communication',
    downloads: 4521,
    rating: 4.6,
    version: '2.0.0',
    nsmClassification: 'CONFIDENTIAL',
    tags: ['mail', 'digipost', 'communication'],
    verified: true
  },
  {
    id: 'gdpr-toolkit',
    name: 'GDPR Compliance Toolkit',
    description: 'Complete GDPR compliance with consent management and data deletion',
    author: 'Privacy Labs',
    icon: '🔒',
    category: 'Compliance',
    downloads: 15678,
    rating: 4.9,
    version: '4.2.0',
    nsmClassification: 'OPEN',
    tags: ['gdpr', 'privacy', 'compliance'],
    installed: true,
    verified: true
  },
  {
    id: 'nsm-security',
    name: 'NSM Security Scanner',
    description: 'Automated security scanning following NSM guidelines',
    author: 'Security Team',
    icon: '🛡️',
    category: 'Security',
    downloads: 3456,
    rating: 4.8,
    version: '1.2.0',
    nsmClassification: 'SECRET',
    tags: ['security', 'nsm', 'scanning'],
    verified: true
  }
];

const categories = [
  'All',
  'Authentication',
  'Government',
  'Payment',
  'Communication',
  'Compliance',
  'Security',
  'Database',
  'Analytics',
  'Testing'
];

export function MarketplaceGrid(): JSX.Element {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [showInstalledOnly, setShowInstalledOnly] = useState(false);

  const filteredPlugins = useMemo(() => {
    return mockPlugins.filter(plugin => {
      const matchesSearch = plugin.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          plugin.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          plugin.tags.some(tag => tag.toLowerCase().includes(searchQuery.toLowerCase()));
      
      const matchesCategory = selectedCategory === 'All' || plugin.category === selectedCategory;
      const matchesInstalled = !showInstalledOnly || plugin.installed;
      
      return matchesSearch && matchesCategory && matchesInstalled;
    });
  }, [searchQuery, selectedCategory, showInstalledOnly]);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="space-y-2">
        <h1 className="text-3xl font-bold">Plugin Marketplace</h1>
        <p className="text-muted-foreground">
          Browse and install from 47+ community and official plugins
        </p>
      </div>

      {/* Filters */}
      <div className="flex flex-col lg:flex-row gap-4">
        <Input
          type="search"
          placeholder="Search plugins..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          leftIcon={<span>🔍</span>}
          className="flex-1"
        />
        
        <div className="flex gap-2 flex-wrap">
          {categories.map(category => (
            <Button
              key={category}
              variant={selectedCategory === category ? 'default' : 'outline'}
              size="default"
              onClick={() => setSelectedCategory(category)}
            >
              {category}
            </Button>
          ))}
        </div>
        
        <Button
          variant={showInstalledOnly ? 'default' : 'outline'}
          size="default"
          onClick={() => setShowInstalledOnly(!showInstalledOnly)}
        >
          {showInstalledOnly ? '✅ Installed' : '📦 Installed'}
        </Button>
      </div>

      {/* Plugin Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredPlugins.map(plugin => (
          <Card key={plugin.id} className="p-6 hover:shadow-lg transition-shadow">
            <div className="space-y-4">
              {/* Header */}
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-3">
                  <span className="text-4xl" aria-hidden="true">{plugin.icon}</span>
                  <div>
                    <h3 className="font-semibold flex items-center gap-2">
                      {plugin.name}
                      {plugin.verified && <span className="text-blue-500" title="Verified plugin">✓</span>}
                    </h3>
                    <p className="text-sm text-muted-foreground">by {plugin.author}</p>
                  </div>
                </div>
                <NSMBadge classification={plugin.nsmClassification} size="sm" />
              </div>

              {/* Description */}
              <p className="text-sm text-muted-foreground line-clamp-2">
                {plugin.description}
              </p>

              {/* Stats */}
              <div className="flex items-center gap-4 text-sm text-muted-foreground">
                <span className="flex items-center gap-1">
                  ⬇️ {plugin.downloads.toLocaleString()}
                </span>
                <span className="flex items-center gap-1">
                  ⭐ {plugin.rating}
                </span>
                <span className="flex items-center gap-1">
                  v{plugin.version}
                </span>
              </div>

              {/* Tags */}
              <div className="flex flex-wrap gap-1">
                {plugin.tags.map(tag => (
                  <span
                    key={tag}
                    className="px-2 py-0.5 text-xs bg-neutral-100 dark:bg-neutral-800 rounded-full"
                  >
                    {tag}
                  </span>
                ))}
              </div>

              {/* Actions */}
              <div className="flex gap-2 pt-2">
                {plugin.installed ? (
                  <>
                    <Button variant="outline" size="default" className="flex-1">
                      ⚙️ Configure
                    </Button>
                    <Button variant="outline" size="default" className="flex-1">
                      🗑️ Uninstall
                    </Button>
                  </>
                ) : (
                  <>
                    <Button variant="default" size="default" className="flex-1">
                      📦 Install
                    </Button>
                    <Button variant="outline" size="default" className="flex-1">
                      📖 Details
                    </Button>
                  </>
                )}
              </div>
            </div>
          </Card>
        ))}
      </div>

      {/* Empty State */}
      {filteredPlugins.length === 0 && (
        <div className="text-center py-12">
          <p className="text-muted-foreground">No plugins found matching your criteria.</p>
        </div>
      )}
    </div>
  );
}