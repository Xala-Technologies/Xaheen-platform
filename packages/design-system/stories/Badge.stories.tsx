/**
 * Badge Component Stories
 * Status indicators and labels with WCAG AAA compliance
 * Norwegian text and NSM security classification examples
 */

import type { Meta, StoryObj } from '@storybook/react';
import React from 'react';
import { 
  Badge,
  NotificationBadge,
  StatusBadge
} from '../registry/components/badge/badge';

const meta: Meta<typeof Badge> = {
  title: 'Components/Badge',
  component: Badge,
  parameters: {
    layout: 'centered',
  },
  tags: ['autodocs']
} satisfies Meta<typeof Badge>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    children: 'Standard merke'
  }
};

export const Variants: Story = {
  render: () => (
    <div className="flex items-center gap-4">
      <Badge variant="default">Standard</Badge>
      <Badge variant="secondary">Sekundær</Badge>
      <Badge variant="destructive">Feil</Badge>
      <Badge variant="success">Suksess</Badge>
      <Badge variant="warning">Advarsel</Badge>
      <Badge variant="info">Info</Badge>
    </div>
  )
};

export const NSMClassification: Story = {
  render: () => (
    <div className="space-y-4">
      <div className="flex items-center gap-4">
        <Badge nsmClassification="OPEN">ÅPEN</Badge>
        <Badge nsmClassification="RESTRICTED">BEGRENSET</Badge>
        <Badge nsmClassification="CONFIDENTIAL">KONFIDENSIELL</Badge>
        <Badge nsmClassification="SECRET">HEMMELIG</Badge>
      </div>
    </div>
  )
};

export const WithDot: Story = {
  render: () => (
    <div className="flex items-center gap-4">
      <Badge dot>Med punkt</Badge>
      <Badge dot pulse variant="success">Pulserende</Badge>
    </div>
  )
};

export const Removable: Story = {
  render: () => {
    const [badges, setBadges] = React.useState([
      { id: 1, label: 'React' },
      { id: 2, label: 'TypeScript' },
      { id: 3, label: 'Tailwind' }
    ]);

    return (
      <div className="flex gap-2">
        {badges.map(badge => (
          <Badge
            key={badge.id}
            removable
            onRemove={() => setBadges(prev => prev.filter(b => b.id !== badge.id))}
          >
            {badge.label}
          </Badge>
        ))}
      </div>
    );
  }
};

export const NotificationBadges: Story = {
  render: () => (
    <div className="flex items-center gap-6">
      <div className="relative">
        <button className="p-2 bg-primary text-primary-foreground rounded-lg">
          Meldinger
        </button>
        <NotificationBadge count={3} className="absolute -top-2 -right-2" />
      </div>
      
      <div className="relative">
        <button className="p-2 bg-secondary text-secondary-foreground rounded-lg">
          Varsler
        </button>
        <NotificationBadge count={99} className="absolute -top-2 -right-2" />
      </div>
      
      <div className="relative">
        <button className="p-2 bg-accent text-accent-foreground rounded-lg">
          Oppgaver
        </button>
        <NotificationBadge count={150} max={99} className="absolute -top-2 -right-2" />
      </div>
    </div>
  )
};

export const StatusBadges: Story = {
  render: () => (
    <div className="space-y-4">
      <div className="flex items-center gap-4">
        <StatusBadge status="online" />
        <StatusBadge status="away" />
        <StatusBadge status="busy" />
        <StatusBadge status="idle" />
        <StatusBadge status="offline" />
      </div>
    </div>
  )
};

export const Playground: Story = {
  args: {
    children: 'Interaktivt merke',
    variant: 'default',
    size: 'md'
  }
};