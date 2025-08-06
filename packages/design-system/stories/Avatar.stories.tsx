/**
 * Avatar Component Stories
 * User profile images with fallbacks and status indicators
 * WCAG AAA compliant examples with Norwegian text
 * CLAUDE.md Compliant: Professional styling and accessibility
 */

import type { Meta, StoryObj } from '@storybook/react';
import React, { useState } from 'react';
import { 
  Avatar, 
  AvatarImage, 
  AvatarFallback,
  AvatarGroup,
  type AvatarProps
} from '../registry/components/avatar/avatar';

// Sample user data
interface User {
  readonly id: number;
  readonly name: string;
  readonly email: string;
  readonly avatar?: string;
  readonly status?: 'online' | 'offline' | 'away' | 'busy';
  readonly role?: string;
  readonly nsmClassification?: 'OPEN' | 'RESTRICTED' | 'CONFIDENTIAL' | 'SECRET';
}

const sampleUsers: readonly User[] = [
  {
    id: 1,
    name: 'Ola Nordmann',
    email: 'ola.nordmann@bedrift.no',
    avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=200&h=200&fit=crop&crop=face',
    status: 'online',
    role: 'Seniorutvikler',
    nsmClassification: 'RESTRICTED'
  },
  {
    id: 2,
    name: 'Kari Hansen',
    email: 'kari.hansen@bedrift.no',
    avatar: 'https://images.unsplash.com/photo-1494790108755-2616b612b786?w=200&h=200&fit=crop&crop=face',
    status: 'away',
    role: 'UX Designer',
    nsmClassification: 'OPEN'
  },
  {
    id: 3,
    name: 'Lars Andersen',
    email: 'lars.andersen@bedrift.no',
    avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=200&h=200&fit=crop&crop=face',
    status: 'busy',
    role: 'Tech Lead',
    nsmClassification: 'CONFIDENTIAL'
  },
  {
    id: 4,
    name: 'Nina Johansen',
    email: 'nina.johansen@bedrift.no',
    status: 'offline',
    role: 'Controller',
    nsmClassification: 'SECRET'
  },
  {
    id: 5,
    name: 'Erik Solberg',
    email: 'erik.solberg@bedrift.no',
    avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=200&h=200&fit=crop&crop=face',
    status: 'online',
    role: 'Salgssjef',
    nsmClassification: 'RESTRICTED'
  }
];

const meta: Meta<typeof Avatar> = {
  title: 'Data Display/Avatar',
  component: Avatar,
  parameters: {
    layout: 'centered',
  },
  tags: ['autodocs'],
  argTypes: {
    size: {
      control: 'select',
      options: ['xs', 'sm', 'md', 'lg', 'xl', '2xl', '3xl', '4xl'],
      description: 'Avatar size variant'
    },
    shape: {
      control: 'select',
      options: ['circle', 'square', 'rounded'],
      description: 'Avatar shape'
    },
    variant: {
      control: 'select',
      options: ['default', 'elevated', 'outline', 'ghost'],
      description: 'Avatar visual variant'
    },
    status: {
      control: 'select',
      options: ['none', 'online', 'offline', 'away', 'busy'],
      description: 'Online status indicator'
    },
    showStatusIndicator: {
      control: 'boolean',
      description: 'Show status indicator'
    },
    loading: {
      control: 'boolean',
      description: 'Show loading state'
    },
    nsmClassification: {
      control: 'select',
      options: [undefined, 'OPEN', 'RESTRICTED', 'CONFIDENTIAL', 'SECRET'],
      description: 'NSM security classification'
    }
  }
} satisfies Meta<typeof Avatar>;

export default meta;
type Story = StoryObj<typeof meta>;

// Basic Examples
export const Default: Story = {
  args: {
    src: sampleUsers[0].avatar,
    name: sampleUsers[0].name,
    alt: `Avatar for ${sampleUsers[0].name}`
  }
};

export const WithFallback: Story = {
  args: {
    name: 'Ola Nordmann',
    alt: 'Avatar for Ola Nordmann'
  }
};

export const WithStatus: Story = {
  args: {
    src: sampleUsers[0].avatar,
    name: sampleUsers[0].name,
    status: 'online',
    showStatusIndicator: true
  }
};

export const Loading: Story = {
  args: {
    name: 'Ola Nordmann',
    loading: true
  }
};

// Size Variations
export const Sizes: Story = {
  render: () => (
    <div className="flex items-center gap-6">
      <div className="text-center space-y-2">
        <Avatar size="xs" name="XS" />
        <div className="text-xs text-muted-foreground">XS (24px)</div>
      </div>
      <div className="text-center space-y-2">
        <Avatar size="sm" name="SM" />
        <div className="text-xs text-muted-foreground">SM (32px)</div>
      </div>
      <div className="text-center space-y-2">
        <Avatar size="md" name="MD" />
        <div className="text-xs text-muted-foreground">MD (48px)</div>
      </div>
      <div className="text-center space-y-2">
        <Avatar size="lg" name="LG" />
        <div className="text-xs text-muted-foreground">LG (56px)</div>
      </div>
      <div className="text-center space-y-2">
        <Avatar size="xl" name="XL" />
        <div className="text-xs text-muted-foreground">XL (64px)</div>
      </div>
      <div className="text-center space-y-2">
        <Avatar size="2xl" name="2X" />
        <div className="text-xs text-muted-foreground">2XL (80px)</div>
      </div>
      <div className="text-center space-y-2">
        <Avatar size="3xl" name="3X" />
        <div className="text-xs text-muted-foreground">3XL (96px)</div>
      </div>
      <div className="text-center space-y-2">
        <Avatar size="4xl" name="4X" />
        <div className="text-xs text-muted-foreground">4XL (128px)</div>
      </div>
    </div>
  )
};

// Shape Variations
export const Shapes: Story = {
  render: () => (
    <div className="flex items-center gap-8">
      <div className="text-center space-y-3">
        <Avatar 
          src={sampleUsers[0].avatar} 
          name={sampleUsers[0].name}
          shape="circle"
          size="2xl"
        />
        <div className="text-sm font-medium">Circle (standard)</div>
      </div>
      <div className="text-center space-y-3">
        <Avatar 
          src={sampleUsers[1].avatar} 
          name={sampleUsers[1].name}
          shape="square"
          size="2xl"
        />
        <div className="text-sm font-medium">Square</div>
      </div>
      <div className="text-center space-y-3">
        <Avatar 
          src={sampleUsers[2].avatar} 
          name={sampleUsers[2].name}
          shape="rounded"
          size="2xl"
        />
        <div className="text-sm font-medium">Rounded</div>
      </div>
    </div>
  )
};

// Variant Styles
export const Variants: Story = {
  render: () => (
    <div className="flex items-center gap-8">
      <div className="text-center space-y-3">
        <Avatar 
          src={sampleUsers[0].avatar} 
          name={sampleUsers[0].name}
          variant="default"
          size="xl"
        />
        <div className="text-sm font-medium">Default</div>
      </div>
      <div className="text-center space-y-3">
        <Avatar 
          src={sampleUsers[1].avatar} 
          name={sampleUsers[1].name}
          variant="elevated"
          size="xl"
        />
        <div className="text-sm font-medium">Elevated</div>
      </div>
      <div className="text-center space-y-3">
        <Avatar 
          src={sampleUsers[2].avatar} 
          name={sampleUsers[2].name}
          variant="outline"
          size="xl"
        />
        <div className="text-sm font-medium">Outline</div>
      </div>
      <div className="text-center space-y-3">
        <Avatar 
          src={sampleUsers[4].avatar} 
          name={sampleUsers[4].name}
          variant="ghost"
          size="xl"
        />
        <div className="text-sm font-medium">Ghost</div>
      </div>
    </div>
  )
};

// Status Indicators
export const StatusIndicators: Story = {
  render: () => (
    <div className="flex items-center gap-8">
      <div className="text-center space-y-3">
        <Avatar 
          src={sampleUsers[0].avatar} 
          name={sampleUsers[0].name}
          status="online"
          showStatusIndicator
          size="xl"
        />
        <div className="text-sm font-medium">Online</div>
      </div>
      <div className="text-center space-y-3">
        <Avatar 
          src={sampleUsers[1].avatar} 
          name={sampleUsers[1].name}
          status="away"
          showStatusIndicator
          size="xl"
        />
        <div className="text-sm font-medium">Away</div>
      </div>
      <div className="text-center space-y-3">
        <Avatar 
          src={sampleUsers[2].avatar} 
          name={sampleUsers[2].name}
          status="busy"
          showStatusIndicator
          size="xl"
        />
        <div className="text-sm font-medium">Busy</div>
      </div>
      <div className="text-center space-y-3">
        <Avatar 
          src={sampleUsers[4].avatar} 
          name={sampleUsers[4].name}
          status="offline"
          showStatusIndicator
          size="xl"
        />
        <div className="text-sm font-medium">Offline</div>
      </div>
    </div>
  )
};

// Fallback Examples
export const FallbackExamples: Story = {
  render: () => (
    <div className="space-y-8">
      <div>
        <h3 className="text-lg font-semibold mb-4">Initialer</h3>
        <div className="flex items-center gap-6">
          {sampleUsers.slice(0, 3).map((user) => (
            <div key={user.id} className="text-center space-y-2">
              <Avatar name={user.name} size="lg" />
              <div className="text-sm text-muted-foreground">{user.name}</div>
            </div>
          ))}
        </div>
      </div>
      
      <div>
        <h3 className="text-lg font-semibold mb-4">Tilpasset fallback</h3>
        <div className="flex items-center gap-6">
          <Avatar size="lg">
            <AvatarFallback>
              <svg className="w-6 h-6" viewBox="0 0 24 24" fill="currentColor">
                <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 3c1.66 0 3 1.34 3 3s-1.34 3-3 3-3-1.34-3-3 1.34-3 3-3zm0 14.2c-2.5 0-4.71-1.28-6-3.22.03-1.99 4-3.08 6-3.08 1.99 0 5.97 1.09 6 3.08-1.29 1.94-3.5 3.22-6 3.22z"/>
              </svg>
            </AvatarFallback>
          </Avatar>
          <Avatar size="lg">
            <AvatarFallback>
              <svg className="w-6 h-6" viewBox="0 0 24 24" fill="currentColor">
                <path d="M19 3H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zM9 17H7v-7h2v7zm4 0h-2V7h2v10zm4 0h-2v-4h2v4z"/>
              </svg>
            </AvatarFallback>
          </Avatar>
          <Avatar size="lg">
            <AvatarFallback>
              <svg className="w-6 h-6" viewBox="0 0 24 24" fill="currentColor">
                <path d="M20 6L9 17l-5-5 1.41-1.41L9 14.17l9.59-9.58L20 6z"/>
              </svg>
            </AvatarFallback>
          </Avatar>
        </div>
      </div>
    </div>
  )
};

// NSM Security Classifications
export const NSMClassifications: Story = {
  render: () => (
    <div className="space-y-6">
      <div className="bg-yellow-50 border-l-4 border-yellow-400 p-4 rounded">
        <div className="flex">
          <div className="flex-shrink-0">
            <svg className="h-5 w-5 text-yellow-400" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
            </svg>
          </div>
          <div className="ml-3">
            <p className="text-sm text-yellow-700">
              NSM-klassifisering vises med fargekodet ramme i henhold til sikkerhetsnivå.
            </p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
        <div className="text-center space-y-3">
          <Avatar 
            src={sampleUsers[1].avatar} 
            name="Åpen info"
            nsmClassification="OPEN"
            size="xl"
          />
          <div>
            <div className="text-sm font-medium">ÅPEN</div>
            <div className="text-xs text-muted-foreground">Offentlig tilgjengelig</div>
          </div>
        </div>
        
        <div className="text-center space-y-3">
          <Avatar 
            src={sampleUsers[0].avatar} 
            name="Begrenset info"
            nsmClassification="RESTRICTED"
            size="xl"
          />
          <div>
            <div className="text-sm font-medium">BEGRENSET</div>
            <div className="text-xs text-muted-foreground">Intern bruk</div>
          </div>
        </div>
        
        <div className="text-center space-y-3">
          <Avatar 
            src={sampleUsers[2].avatar} 
            name="Konfidensiell info"
            nsmClassification="CONFIDENTIAL"
            size="xl"
          />
          <div>
            <div className="text-sm font-medium">KONFIDENSIELL</div>
            <div className="text-xs text-muted-foreground">Sensitiv informasjon</div>
          </div>
        </div>
        
        <div className="text-center space-y-3">
          <Avatar 
            name="Hemmelig info"
            nsmClassification="SECRET"
            size="xl"
          />
          <div>
            <div className="text-sm font-medium">HEMMELIG</div>
            <div className="text-xs text-muted-foreground">Høyeste sikkerhet</div>
          </div>
        </div>
      </div>
    </div>
  )
};

// Avatar Groups
export const AvatarGroups: Story = {
  render: () => (
    <div className="space-y-8">
      <div>
        <h3 className="text-lg font-semibold mb-4">Standard gruppe (maks 5)</h3>
        <AvatarGroup>
          {sampleUsers.map((user) => (
            <Avatar
              key={user.id}
              src={user.avatar}
              name={user.name}
              size="md"
            />
          ))}
        </AvatarGroup>
      </div>
      
      <div>
        <h3 className="text-lg font-semibold mb-4">Liten gruppe</h3>
        <AvatarGroup size="sm" spacing="tight">
          {sampleUsers.slice(0, 3).map((user) => (
            <Avatar
              key={user.id}
              src={user.avatar}
              name={user.name}
              size="sm"
            />
          ))}
        </AvatarGroup>
      </div>
      
      <div>
        <h3 className="text-lg font-semibold mb-4">Stor gruppe med status</h3>
        <AvatarGroup size="lg" max={4}>
          {sampleUsers.map((user) => (
            <Avatar
              key={user.id}
              src={user.avatar}
              name={user.name}
              status={user.status}
              showStatusIndicator
              size="lg"
            />
          ))}
        </AvatarGroup>
      </div>
      
      <div>
        <h3 className="text-lg font-semibold mb-4">Mange brukere (maks 3)</h3>
        <AvatarGroup max={3} spacing="normal">
          {[...sampleUsers, ...sampleUsers.slice(0, 3)].map((user, index) => (
            <Avatar
              key={`${user.id}-${index}`}
              src={user.avatar}
              name={user.name}
              size="md"
            />
          ))}
        </AvatarGroup>
      </div>
    </div>
  )
};

// Profile Cards with Avatars
export const ProfileCards: Story = {
  render: () => (
    <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
      {sampleUsers.slice(0, 3).map((user) => (
        <div 
          key={user.id} 
          className="bg-card rounded-lg border border-border p-6 space-y-4"
        >
          <div className="flex items-center gap-4">
            <Avatar
              src={user.avatar}
              name={user.name}
              size="xl"
              status={user.status}
              showStatusIndicator
              nsmClassification={user.nsmClassification}
            />
            <div className="flex-1">
              <h3 className="font-semibold text-foreground">{user.name}</h3>
              <p className="text-sm text-muted-foreground">{user.role}</p>
              <p className="text-xs text-muted-foreground">{user.email}</p>
            </div>
          </div>
          
          <div className="pt-2 border-t border-border">
            <div className="flex items-center justify-between text-sm">
              <span className="text-muted-foreground">Status:</span>
              <span className={`font-medium capitalize ${
                user.status === 'online' ? 'text-green-600' :
                user.status === 'away' ? 'text-yellow-600' :
                user.status === 'busy' ? 'text-red-600' : 'text-gray-500'
              }`}>
                {user.status === 'online' ? 'Tilgjengelig' :
                 user.status === 'away' ? 'Borte' :
                 user.status === 'busy' ? 'Opptatt' : 'Frakoblet'}
              </span>
            </div>
            
            {user.nsmClassification && (
              <div className="flex items-center justify-between text-sm mt-2">
                <span className="text-muted-foreground">Klassifisering:</span>
                <span className="font-medium">{user.nsmClassification}</span>
              </div>
            )}
          </div>
        </div>
      ))}
    </div>
  )
};

// Loading States
export const LoadingStates: Story = {
  render: () => (
    <div className="flex items-center gap-8">
      <div className="text-center space-y-3">
        <Avatar name="Loading User" loading size="xl" />
        <div className="text-sm font-medium">Loading Avatar</div>
      </div>
      
      <div className="text-center space-y-3">
        <Avatar 
          src={sampleUsers[0].avatar} 
          name={sampleUsers[0].name}
          loading 
          size="xl"
          status="online"
          showStatusIndicator
        />
        <div className="text-sm font-medium">Loading with Image</div>
      </div>
      
      <div className="text-center space-y-3">
        <AvatarGroup>
          {sampleUsers.slice(0, 3).map((user) => (
            <Avatar
              key={user.id}
              src={user.avatar}
              name={user.name}
              loading
              size="md"
            />
          ))}
        </AvatarGroup>
        <div className="text-sm font-medium">Loading Group</div>
      </div>
    </div>
  )
};

// Interactive Example
export const Interactive: Story = {
  render: () => {
    const [selectedUser, setSelectedUser] = useState<User | null>(null);

    return (
      <div className="space-y-6">
        <div className="text-center">
          <h3 className="text-lg font-semibold mb-4">Velg en bruker</h3>
          <div className="flex justify-center gap-4">
            {sampleUsers.map((user) => (
              <button
                key={user.id}
                onClick={() => setSelectedUser(user)}
                className={`p-2 rounded-lg transition-colors ${
                  selectedUser?.id === user.id 
                    ? 'bg-primary/10 ring-2 ring-primary' 
                    : 'hover:bg-accent'
                }`}
              >
                <Avatar
                  src={user.avatar}
                  name={user.name}
                  size="lg"
                  status={user.status}
                  showStatusIndicator
                />
              </button>
            ))}
          </div>
        </div>
        
        {selectedUser && (
          <div className="bg-card rounded-lg border border-border p-6 mx-auto max-w-md">
            <div className="text-center space-y-4">
              <Avatar
                src={selectedUser.avatar}
                name={selectedUser.name}
                size="3xl"
                status={selectedUser.status}
                showStatusIndicator
                nsmClassification={selectedUser.nsmClassification}
              />
              <div>
                <h4 className="text-xl font-semibold text-foreground">
                  {selectedUser.name}
                </h4>
                <p className="text-muted-foreground">{selectedUser.role}</p>
                <p className="text-sm text-muted-foreground">{selectedUser.email}</p>
              </div>
              
              <div className="pt-4 border-t border-border space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Status:</span>
                  <span className={`font-medium capitalize ${
                    selectedUser.status === 'online' ? 'text-green-600' :
                    selectedUser.status === 'away' ? 'text-yellow-600' :
                    selectedUser.status === 'busy' ? 'text-red-600' : 'text-gray-500'
                  }`}>
                    {selectedUser.status === 'online' ? 'Tilgjengelig' :
                     selectedUser.status === 'away' ? 'Borte' :
                     selectedUser.status === 'busy' ? 'Opptatt' : 'Frakoblet'}
                  </span>
                </div>
                
                {selectedUser.nsmClassification && (
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Sikkerhet:</span>
                    <span className="font-medium">{selectedUser.nsmClassification}</span>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    );
  }
};

// Playground
export const Playground: Story = {
  args: {
    src: sampleUsers[0].avatar,
    name: sampleUsers[0].name,
    size: 'lg',
    shape: 'circle',
    variant: 'default',
    status: 'online',
    showStatusIndicator: true,
    loading: false
  }
};