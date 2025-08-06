/**
 * Skeleton Component Stories
 * Professional loading state placeholders
 * WCAG AAA compliant examples with Norwegian text
 * CLAUDE.md Compliant: Professional styling and accessibility
 */

import type { Meta, StoryObj } from '@storybook/react';
import React, { useState, useEffect } from 'react';
import { 
  Skeleton,
  SkeletonText,
  SkeletonCard,
  SkeletonTable,
  SkeletonList,
  SkeletonAvatar,
  SkeletonButton,
  SkeletonImage,
  SkeletonPost,
  SkeletonProfile,
  type SkeletonProps
} from '../registry/components/skeleton/skeleton';
import { Button } from '../registry/components/button/button';
import { Card } from '../registry/components/card/card';

const meta: Meta<typeof Skeleton> = {
  title: 'Data Display/Skeleton',
  component: Skeleton,
  parameters: {
    layout: 'padded',
  },
  tags: ['autodocs'],
  argTypes: {
    variant: {
      control: 'select',
      options: ['default', 'card', 'text', 'avatar', 'button', 'image'],
      description: 'Skeleton visual variant'
    },
    animation: {
      control: 'select',
      options: ['pulse', 'shimmer', 'wave', 'none'],
      description: 'Animation type'
    },
    intensity: {
      control: 'select',
      options: ['subtle', 'normal', 'strong'],
      description: 'Animation intensity'
    },
    width: {
      control: 'text',
      description: 'Width (CSS value or number for pixels)'
    },
    height: {
      control: 'text',
      description: 'Height (CSS value or number for pixels)'
    },
    lines: {
      control: 'number',
      description: 'Number of text lines'
    },
    aspectRatio: {
      control: 'select',
      options: ['square', 'video', 'portrait', 'landscape'],
      description: 'Aspect ratio for images'
    }
  }
} satisfies Meta<typeof Skeleton>;

export default meta;
type Story = StoryObj<typeof meta>;

// Basic Examples
export const Default: Story = {
  args: {
    width: 200,
    height: 20,
    ariaLabel: 'Laster innhold'
  }
};

export const TextSkeleton: Story = {
  args: {
    lines: 3,
    ariaLabel: 'Laster tekst'
  }
};

export const AvatarSkeleton: Story = {
  args: {
    variant: 'avatar',
    width: 64,
    height: 64,
    ariaLabel: 'Laster profilbilde'
  }
};

// Variant Examples
export const Variants: Story = {
  render: () => (
    <div className="space-y-8">
      <div>
        <h3 className="text-lg font-semibold mb-4">Grunnleggende former</h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
          <div className="space-y-2">
            <div className="text-sm text-muted-foreground">Standard</div>
            <Skeleton width={120} height={20} />
          </div>
          
          <div className="space-y-2">
            <div className="text-sm text-muted-foreground">Kort</div>
            <Skeleton variant="card" width={120} height={80} />
          </div>
          
          <div className="space-y-2">
            <div className="text-sm text-muted-foreground">Avatar</div>
            <Skeleton variant="avatar" width={64} height={64} />
          </div>
          
          <div className="space-y-2">
            <div className="text-sm text-muted-foreground">Knapp</div>
            <Skeleton variant="button" width={100} height={40} />
          </div>
        </div>
      </div>
      
      <div>
        <h3 className="text-lg font-semibold mb-4">Bildeforhold</h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="space-y-2">
            <div className="text-sm text-muted-foreground">Kvadrat</div>
            <Skeleton variant="image" aspectRatio="square" className="w-24" />
          </div>
          
          <div className="space-y-2">
            <div className="text-sm text-muted-foreground">Video (16:9)</div>
            <Skeleton variant="image" aspectRatio="video" className="w-32" />
          </div>
          
          <div className="space-y-2">
            <div className="text-sm text-muted-foreground">Portrett (3:4)</div>
            <Skeleton variant="image" aspectRatio="portrait" className="w-20" />
          </div>
          
          <div className="space-y-2">
            <div className="text-sm text-muted-foreground">Landskap (4:3)</div>
            <Skeleton variant="image" aspectRatio="landscape" className="w-32" />
          </div>
        </div>
      </div>
    </div>
  )
};

// Animation Examples
export const Animations: Story = {
  render: () => (
    <div className="space-y-8">
      <div>
        <h3 className="text-lg font-semibold mb-4">Animasjonstyper</h3>
        <div className="space-y-4">
          <div className="flex items-center gap-4">
            <div className="w-24 text-sm text-muted-foreground">Pulse</div>
            <Skeleton animation="pulse" width={200} height={20} />
          </div>
          
          <div className="flex items-center gap-4">
            <div className="w-24 text-sm text-muted-foreground">Shimmer</div>
            <Skeleton animation="shimmer" width={200} height={20} />
          </div>
          
          <div className="flex items-center gap-4">
            <div className="w-24 text-sm text-muted-foreground">Wave</div>
            <Skeleton animation="wave" width={200} height={20} />
          </div>
          
          <div className="flex items-center gap-4">
            <div className="w-24 text-sm text-muted-foreground">Ingen</div>
            <Skeleton animation="none" width={200} height={20} />
          </div>
        </div>
      </div>
      
      <div>
        <h3 className="text-lg font-semibold mb-4">Intensitet</h3>
        <div className="space-y-4">
          <div className="flex items-center gap-4">
            <div className="w-24 text-sm text-muted-foreground">Svak</div>
            <Skeleton intensity="subtle" width={200} height={20} />
          </div>
          
          <div className="flex items-center gap-4">
            <div className="w-24 text-sm text-muted-foreground">Normal</div>
            <Skeleton intensity="normal" width={200} height={20} />
          </div>
          
          <div className="flex items-center gap-4">
            <div className="w-24 text-sm text-muted-foreground">Sterk</div>
            <Skeleton intensity="strong" width={200} height={20} />
          </div>
        </div>
      </div>
    </div>
  )
};

// Text Skeleton Examples
export const TextSkeletons: Story = {
  render: () => (
    <div className="space-y-8">
      <div>
        <h3 className="text-lg font-semibold mb-4">Tekst størrelser</h3>
        <div className="space-y-4">
          <div>
            <div className="text-sm text-muted-foreground mb-2">Ekstra liten (XS)</div>
            <SkeletonText lines={2} fontSize="xs" />
          </div>
          
          <div>
            <div className="text-sm text-muted-foreground mb-2">Liten (SM)</div>
            <SkeletonText lines={2} fontSize="sm" />
          </div>
          
          <div>
            <div className="text-sm text-muted-foreground mb-2">Normal (Base)</div>
            <SkeletonText lines={2} fontSize="base" />
          </div>
          
          <div>
            <div className="text-sm text-muted-foreground mb-2">Stor (LG)</div>
            <SkeletonText lines={2} fontSize="lg" />
          </div>
          
          <div>
            <div className="text-sm text-muted-foreground mb-2">Ekstra stor (XL)</div>
            <SkeletonText lines={2} fontSize="xl" />
          </div>
        </div>
      </div>
      
      <div>
        <h3 className="text-lg font-semibold mb-4">Forskjellige linjeantall</h3>
        <div className="space-y-4">
          <div>
            <div className="text-sm text-muted-foreground mb-2">1 linje</div>
            <SkeletonText lines={1} />
          </div>
          
          <div>
            <div className="text-sm text-muted-foreground mb-2">3 linjer (standard)</div>
            <SkeletonText lines={3} />
          </div>
          
          <div>
            <div className="text-sm text-muted-foreground mb-2">5 linjer</div>
            <SkeletonText lines={5} />
          </div>
          
          <div>
            <div className="text-sm text-muted-foreground mb-2">Med tilpasset siste linje (60%)</div>
            <SkeletonText lines={4} lastLineWidth="60%" />
          </div>
        </div>
      </div>
    </div>
  )
};

// Card Skeleton Examples
export const CardSkeletons: Story = {
  render: () => (
    <div className="space-y-8">
      <div>
        <h3 className="text-lg font-semibold mb-4">Kort varianter</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <div className="space-y-2">
            <div className="text-sm text-muted-foreground">Enkelt kort</div>
            <SkeletonCard textLines={2} />
          </div>
          
          <div className="space-y-2">
            <div className="text-sm text-muted-foreground">Med avatar</div>
            <SkeletonCard showAvatar textLines={3} />
          </div>
          
          <div className="space-y-2">
            <div className="text-sm text-muted-foreground">Med bilde</div>
            <SkeletonCard showImage textLines={2} />
          </div>
          
          <div className="space-y-2">
            <div className="text-sm text-muted-foreground">Med handlinger</div>
            <SkeletonCard showAvatar showActions textLines={3} />
          </div>
          
          <div className="space-y-2">
            <div className="text-sm text-muted-foreground">Komplett kort</div>
            <SkeletonCard 
              showAvatar 
              showImage 
              showActions 
              textLines={4}
              imageAspectRatio="landscape"
            />
          </div>
          
          <div className="space-y-2">
            <div className="text-sm text-muted-foreground">Post-stil</div>
            <SkeletonPost />
          </div>
        </div>
      </div>
    </div>
  )
};

// List Skeleton Examples
export const ListSkeletons: Story = {
  render: () => (
    <div className="space-y-8">
      <div>
        <h3 className="text-lg font-semibold mb-4">Liste varianter</h3>
        <div className="space-y-6">
          <div>
            <div className="text-sm text-muted-foreground mb-4">Enkel liste</div>
            <SkeletonList items={3} showAvatar={false} showMeta={false} />
          </div>
          
          <div>
            <div className="text-sm text-muted-foreground mb-4">Med avatarer</div>
            <SkeletonList items={3} showAvatar showMeta={false} />
          </div>
          
          <div>
            <div className="text-sm text-muted-foreground mb-4">Med metadata</div>
            <SkeletonList items={3} showAvatar showMeta />
          </div>
          
          <div>
            <div className="text-sm text-muted-foreground mb-4">Lang liste</div>
            <SkeletonList items={5} />
          </div>
        </div>
      </div>
    </div>
  )
};

// Table Skeleton Examples
export const TableSkeletons: Story = {
  render: () => (
    <div className="space-y-8">
      <div>
        <h3 className="text-lg font-semibold mb-4">Tabell varianter</h3>
        <div className="space-y-6">
          <div>
            <div className="text-sm text-muted-foreground mb-4">Standard tabell (4x5)</div>
            <SkeletonTable columns={4} rows={5} />
          </div>
          
          <div>
            <div className="text-sm text-muted-foreground mb-4">Uten header</div>
            <SkeletonTable columns={3} rows={4} showHeader={false} />
          </div>
          
          <div>
            <div className="text-sm text-muted-foreground mb-4">Stor tabell (6x8)</div>
            <SkeletonTable columns={6} rows={8} />
          </div>
        </div>
      </div>
    </div>
  )
};

// Composed Patterns
export const ComposedPatterns: Story = {
  render: () => (
    <div className="space-y-8">
      <div>
        <h3 className="text-lg font-semibold mb-4">Sammensatte mønstre</h3>
        <div className="space-y-8">
          <div>
            <div className="text-sm text-muted-foreground mb-4">Profil</div>
            <SkeletonProfile />
          </div>
          
          <div>
            <div className="text-sm text-muted-foreground mb-4">Dashboard layout</div>
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <div className="lg:col-span-2">
                <SkeletonCard 
                  showImage 
                  imageAspectRatio="video"
                  textLines={4}
                  showActions
                />
              </div>
              <div className="space-y-4">
                <SkeletonCard showAvatar textLines={2} />
                <SkeletonCard showAvatar textLines={2} />
                <SkeletonCard showAvatar textLines={2} />
              </div>
            </div>
          </div>
          
          <div>
            <div className="text-sm text-muted-foreground mb-4">Innhold feed</div>
            <div className="space-y-6">
              <SkeletonPost />
              <SkeletonPost />
              <SkeletonPost />
            </div>
          </div>
        </div>
      </div>
    </div>
  )
};

// Loading Simulation
export const LoadingSimulation: Story = {
  render: () => {
    const [isLoading, setIsLoading] = useState(true);
    const [content, setContent] = useState<any>(null);

    useEffect(() => {
      if (isLoading) {
        const timer = setTimeout(() => {
          setContent({
            title: 'Velkommen til Xaheen Design System',
            description: 'Et omfattende designsystem bygget for norske bedrifter med fokus på tilgjengelighet og brukervennlighet.',
            author: {
              name: 'Ola Nordmann',
              avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=64&h=64&fit=crop&crop=face',
              role: 'Seniorutvikler'
            },
            publishedAt: '2 timer siden',
            readTime: '5 min lesing',
            tags: ['Design System', 'React', 'TypeScript', 'Tailwind']
          });
          setIsLoading(false);
        }, 3000);

        return () => clearTimeout(timer);
      }
    }, [isLoading]);

    const handleReload = () => {
      setIsLoading(true);
      setContent(null);
    };

    if (isLoading) {
      return (
        <div className="space-y-6">
          <div className="text-center">
            <h3 className="text-lg font-semibold mb-2">Laster innhold...</h3>
            <p className="text-sm text-muted-foreground mb-4">
              Dette vil laste i 3 sekunder for å demonstrere skeleton loading
            </p>
          </div>
          
          <div className="max-w-2xl mx-auto">
            <div className="space-y-6">
              {/* Header skeleton */}
              <div className="space-y-4">
                <Skeleton height={32} width="70%" />
                <Skeleton lines={2} />
              </div>
              
              {/* Author skeleton */}
              <div className="flex items-center gap-4">
                <SkeletonAvatar width={48} height={48} />
                <div className="space-y-2 flex-1">
                  <Skeleton width="30%" height={16} />
                  <Skeleton width="50%" height={14} />
                </div>
              </div>
              
              {/* Content skeleton */}
              <SkeletonImage aspectRatio="video" />
              <SkeletonText lines={4} />
              
              {/* Tags skeleton */}
              <div className="flex gap-2">
                <SkeletonButton width={80} height={24} />
                <SkeletonButton width={60} height={24} />
                <SkeletonButton width={90} height={24} />
              </div>
            </div>
          </div>
        </div>
      );
    }

    return (
      <div className="space-y-6">
        <div className="text-center">
          <Button onClick={handleReload} variant="outline">
            Last på nytt for å se skeleton
          </Button>
        </div>
        
        <div className="max-w-2xl mx-auto">
          <article className="space-y-6">
            {/* Header */}
            <div className="space-y-4">
              <h1 className="text-3xl font-bold text-foreground">
                {content.title}
              </h1>
              <p className="text-lg text-muted-foreground">
                {content.description}
              </p>
            </div>
            
            {/* Author */}
            <div className="flex items-center gap-4">
              <img 
                src={content.author.avatar}
                alt={content.author.name}
                className="w-12 h-12 rounded-full"
              />
              <div>
                <div className="font-medium">{content.author.name}</div>
                <div className="text-sm text-muted-foreground">
                  {content.author.role} • {content.publishedAt} • {content.readTime}
                </div>
              </div>
            </div>
            
            {/* Content */}
            <div className="aspect-video bg-gradient-to-r from-blue-100 to-purple-100 rounded-lg flex items-center justify-center">
              <div className="text-center text-muted-foreground">
                <svg className="w-16 h-16 mx-auto mb-4" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M21 19V5c0-1.1-.9-2-2-2H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2zM8.5 13.5l2.5 3.01L14.5 12l4.5 6H5l3.5-4.5z"/>
                </svg>
                <p>Innholdsbilde</p>
              </div>
            </div>
            
            <div className="prose prose-gray max-w-none">
              <p>
                Designsystemet vårt er bygget med fokus på norske standarder og krav, 
                inkludert WCAG AAA tilgjengelighet og NSM sikkerhetskrav. Alle komponenter 
                er testet og optimalisert for beste ytelse.
              </p>
              <p>
                Med over 50 komponenter og omfattende dokumentasjon, gir systemet 
                utviklere alt de trenger for å bygge moderne, tilgjengelige applikasjoner 
                raskt og effektivt.
              </p>
            </div>
            
            {/* Tags */}
            <div className="flex flex-wrap gap-2">
              {content.tags.map((tag: string, index: number) => (
                <span 
                  key={index}
                  className="px-3 py-1 bg-primary/10 text-primary rounded-full text-sm"
                >
                  {tag}
                </span>
              ))}
            </div>
          </article>
        </div>
      </div>
    );
  }
};

// Real-world Examples
export const RealWorldExamples: Story = {
  render: () => (
    <div className="space-y-12">
      <div>
        <h3 className="text-xl font-semibold mb-6">E-handel produktside</h3>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <div className="space-y-4">
            <SkeletonImage aspectRatio="square" />
            <div className="grid grid-cols-4 gap-2">
              <SkeletonImage aspectRatio="square" />
              <SkeletonImage aspectRatio="square" />
              <SkeletonImage aspectRatio="square" />
              <SkeletonImage aspectRatio="square" />
            </div>
          </div>
          
          <div className="space-y-6">
            <div className="space-y-4">
              <Skeleton height={32} width="80%" />
              <div className="flex items-center gap-4">
                <Skeleton width={60} height={24} />
                <Skeleton width={100} height={20} />
              </div>
              <Skeleton height={28} width="40%" />
            </div>
            
            <SkeletonText lines={3} />
            
            <div className="space-y-3">
              <Skeleton width="100%" height={48} />
              <Skeleton width="100%" height={48} />
            </div>
            
            <div className="flex gap-2">
              <SkeletonButton width={80} height={32} />
              <SkeletonButton width={80} height={32} />
              <SkeletonButton width={80} height={32} />
            </div>
          </div>
        </div>
      </div>
      
      <div>
        <h3 className="text-xl font-semibold mb-6">Sosial medie feed</h3>
        <div className="max-w-2xl space-y-6">
          {[1, 2, 3].map((index) => (
            <div key={index} className="p-6 bg-card rounded-lg border">
              <div className="flex items-center gap-4 mb-4">
                <SkeletonAvatar width={48} height={48} />
                <div className="flex-1 space-y-2">
                  <Skeleton width="40%" height={16} />
                  <Skeleton width="60%" height={14} />
                </div>
              </div>
              
              <SkeletonText lines={2} className="mb-4" />
              <SkeletonImage aspectRatio="landscape" className="mb-4" />
              
              <div className="flex items-center justify-between">
                <div className="flex gap-4">
                  <SkeletonButton width={24} height={24} />
                  <SkeletonButton width={24} height={24} />
                  <SkeletonButton width={24} height={24} />
                </div>
                <Skeleton width={80} height={14} />
              </div>
            </div>
          ))}
        </div>
      </div>
      
      <div>
        <h3 className="text-xl font-semibold mb-6">Administratorpanel</h3>
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            {[1, 2, 3, 4].map((index) => (
              <div key={index} className="p-6 bg-card rounded-lg border">
                <div className="flex items-center justify-between mb-4">
                  <Skeleton width={60} height={16} />
                  <SkeletonButton width={24} height={24} />
                </div>
                <Skeleton height={32} width="60%" className="mb-2" />
                <Skeleton width="40%" height={14} />
              </div>
            ))}
          </div>
          
          <SkeletonTable columns={5} rows={8} />
        </div>
      </div>
    </div>
  )
};

// Playground
export const Playground: Story = {
  args: {
    width: 200,
    height: 20,
    variant: 'default',
    animation: 'shimmer',
    intensity: 'normal',
    lines: 1
  }
};