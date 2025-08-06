/**
 * Card Component Stories
 * Container component with NSM classification support
 * Professional elevation and spacing with design tokens
 */

import type { Meta, StoryObj } from '@storybook/react';
import { 
  Card, 
  CardHeader, 
  CardTitle, 
  CardDescription, 
  CardContent, 
  CardFooter 
} from '../../registry/components/card/card';
import { Button } from '../../registry/components/button/button';
import { Input } from '../../registry/components/input/input';
import { colorTokens, spacingTokens, shadowTokens } from '../tokens';

const meta = {
  title: 'Components/Card',
  component: Card,
  parameters: {
    layout: 'centered',
    docs: {
      description: {
        component: `
Professional card component with semantic HTML structure and NSM security classification support.

## Design Specifications
- **Padding variants**: From p-4 (1rem) to p-10 (2.5rem)
- **Border radius**: Configurable from none to full
- **Elevation**: Multiple shadow levels for hierarchy
- **NSM Classification**: Visual indicators for security levels

## Accessibility Features
- Semantic HTML structure
- Proper heading hierarchy
- Screen reader announcements for classifications
- High contrast mode support
        `
      }
    }
  },
  tags: ['autodocs'],
  argTypes: {
    variant: {
      control: 'select',
      options: ['default', 'elevated', 'outline', 'ghost', 'nsmOpen', 'nsmRestricted', 'nsmConfidential', 'nsmSecret'],
      description: 'Visual style variant'
    },
    padding: {
      control: 'select',
      options: ['none', 'sm', 'md', 'lg', 'xl'],
      description: 'Padding size'
    },
    rounded: {
      control: 'select',
      options: ['none', 'sm', 'md', 'lg', 'xl', 'full'],
      description: 'Border radius'
    },
    nsmClassification: {
      control: 'select',
      options: [undefined, 'OPEN', 'RESTRICTED', 'CONFIDENTIAL', 'SECRET'],
      description: 'NSM security classification'
    }
  }
} satisfies Meta<typeof Card>;

export default meta;
type Story = StoryObj<typeof meta>;

// Basic Example
export const Default: Story = {
  render: () => (
    <Card className="w-[350px]">
      <CardHeader>
        <CardTitle>Velkommen</CardTitle>
        <CardDescription>Dette er et eksempel på et kort</CardDescription>
      </CardHeader>
      <CardContent>
        <p>Kortinnhold kan inneholde tekst, bilder, skjemaer eller andre komponenter.</p>
      </CardContent>
      <CardFooter>
        <Button>Handling</Button>
      </CardFooter>
    </Card>
  )
};

// Variants
export const Variants: Story = {
  render: () => (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 max-w-4xl">
      <Card variant="default">
        <CardHeader>
          <CardTitle>Standard</CardTitle>
          <CardDescription>Standard kortvariant med skygge</CardDescription>
        </CardHeader>
        <CardContent>
          <p>Innhold med standard styling</p>
        </CardContent>
      </Card>
      
      <Card variant="elevated">
        <CardHeader>
          <CardTitle>Hevet</CardTitle>
          <CardDescription>Hevet kort med ekstra skygge</CardDescription>
        </CardHeader>
        <CardContent>
          <p>Perfekt for fremhevede elementer</p>
        </CardContent>
      </Card>
      
      <Card variant="outline">
        <CardHeader>
          <CardTitle>Omriss</CardTitle>
          <CardDescription>Kort med kun kantlinje</CardDescription>
        </CardHeader>
        <CardContent>
          <p>Minimalistisk design</p>
        </CardContent>
      </Card>
      
      <Card variant="ghost">
        <CardHeader>
          <CardTitle>Spøkelse</CardTitle>
          <CardDescription>Transparent kort uten skygge</CardDescription>
        </CardHeader>
        <CardContent>
          <p>For subtile grupperinger</p>
        </CardContent>
      </Card>
    </div>
  )
};

// NSM Classification Cards
export const NSMClassification: Story = {
  render: () => (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 max-w-4xl">
      <Card nsmClassification="OPEN">
        <CardHeader>
          <CardTitle>Åpen informasjon</CardTitle>
          <CardDescription>NSM klassifisering: ÅPEN</CardDescription>
        </CardHeader>
        <CardContent>
          <p>Informasjon som kan deles offentlig</p>
        </CardContent>
      </Card>
      
      <Card nsmClassification="RESTRICTED">
        <CardHeader>
          <CardTitle>Begrenset informasjon</CardTitle>
          <CardDescription>NSM klassifisering: BEGRENSET</CardDescription>
        </CardHeader>
        <CardContent>
          <p>Intern informasjon med begrenset tilgang</p>
        </CardContent>
      </Card>
      
      <Card nsmClassification="CONFIDENTIAL">
        <CardHeader>
          <CardTitle>Konfidensiell informasjon</CardTitle>
          <CardDescription>NSM klassifisering: KONFIDENSIELL</CardDescription>
        </CardHeader>
        <CardContent>
          <p>Sensitiv informasjon som krever beskyttelse</p>
        </CardContent>
      </Card>
      
      <Card nsmClassification="SECRET">
        <CardHeader>
          <CardTitle>Hemmelig informasjon</CardTitle>
          <CardDescription>NSM klassifisering: HEMMELIG</CardDescription>
        </CardHeader>
        <CardContent>
          <p>Høyeste sikkerhetsnivå</p>
        </CardContent>
      </Card>
    </div>
  )
};

// Padding Sizes
export const PaddingSizes: Story = {
  render: () => (
    <div className="space-y-4 max-w-md">
      <Card padding="none">
        <CardContent padding="none">
          <div className="p-4 bg-muted">
            <p>Ingen polstring (tilpasset innhold)</p>
          </div>
        </CardContent>
      </Card>
      
      <Card padding="sm">
        <CardHeader padding="sm">
          <CardTitle>Liten polstring</CardTitle>
        </CardHeader>
        <CardContent padding="sm">
          <p>p-4 (1rem)</p>
        </CardContent>
      </Card>
      
      <Card padding="md">
        <CardHeader>
          <CardTitle>Medium polstring</CardTitle>
        </CardHeader>
        <CardContent>
          <p>p-6 (1.5rem) - Standard</p>
        </CardContent>
      </Card>
      
      <Card padding="lg">
        <CardHeader padding="lg">
          <CardTitle>Stor polstring</CardTitle>
        </CardHeader>
        <CardContent padding="lg">
          <p>p-8 (2rem)</p>
        </CardContent>
      </Card>
      
      <Card padding="xl">
        <CardHeader padding="lg">
          <CardTitle>Ekstra stor polstring</CardTitle>
        </CardHeader>
        <CardContent padding="lg">
          <p>p-10 (2.5rem)</p>
        </CardContent>
      </Card>
    </div>
  )
};

// Border Radius
export const BorderRadius: Story = {
  render: () => (
    <div className="grid grid-cols-3 gap-4 max-w-3xl">
      <Card rounded="none">
        <CardHeader>
          <CardTitle>Ingen avrunding</CardTitle>
        </CardHeader>
      </Card>
      
      <Card rounded="sm">
        <CardHeader>
          <CardTitle>Liten avrunding</CardTitle>
        </CardHeader>
      </Card>
      
      <Card rounded="md">
        <CardHeader>
          <CardTitle>Medium avrunding</CardTitle>
        </CardHeader>
      </Card>
      
      <Card rounded="lg">
        <CardHeader>
          <CardTitle>Stor avrunding</CardTitle>
        </CardHeader>
      </Card>
      
      <Card rounded="xl">
        <CardHeader>
          <CardTitle>XL avrunding</CardTitle>
        </CardHeader>
      </Card>
      
      <Card rounded="full" className="aspect-square flex items-center justify-center">
        <CardContent>
          <p className="text-center">Full avrunding</p>
        </CardContent>
      </Card>
    </div>
  )
};

// Complex Examples
export const LoginCard: Story = {
  render: () => (
    <Card className="w-[400px]">
      <CardHeader>
        <CardTitle>Logg inn</CardTitle>
        <CardDescription>
          Skriv inn din e-post og passord for å logge inn
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <label htmlFor="email" className="text-sm font-medium">
            E-post
          </label>
          <Input 
            id="email" 
            type="email" 
            placeholder="ola.nordmann@example.no"
          />
        </div>
        <div className="space-y-2">
          <label htmlFor="password" className="text-sm font-medium">
            Passord
          </label>
          <Input 
            id="password" 
            type="password" 
            placeholder="••••••••"
          />
        </div>
      </CardContent>
      <CardFooter className="flex justify-between">
        <Button variant="outline">Avbryt</Button>
        <Button>Logg inn</Button>
      </CardFooter>
    </Card>
  )
};

export const StatsCard: Story = {
  render: () => (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 max-w-4xl">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">
            Totale brukere
          </CardTitle>
          <svg
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth="2"
            className="h-4 w-4 text-muted-foreground"
          >
            <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" />
            <circle cx="9" cy="7" r="4" />
            <path d="M22 21v-2a4 4 0 0 0-3-3.87M16 3.13a4 4 0 0 1 0 7.75" />
          </svg>
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">12.543</div>
          <p className="text-xs text-muted-foreground">
            +20,1% fra forrige måned
          </p>
        </CardContent>
      </Card>
      
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">
            Inntekt
          </CardTitle>
          <svg
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth="2"
            className="h-4 w-4 text-muted-foreground"
          >
            <path d="M12 2v20M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6" />
          </svg>
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">kr 45.231</div>
          <p className="text-xs text-muted-foreground">
            +12% fra forrige måned
          </p>
        </CardContent>
      </Card>
      
      <Card nsmClassification="RESTRICTED">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">
            Systemstatus
          </CardTitle>
          <svg
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth="2"
            className="h-4 w-4 text-muted-foreground"
          >
            <path d="M22 12h-4l-3 9L9 3l-3 9H2" />
          </svg>
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold text-green-600">99,9%</div>
          <p className="text-xs text-muted-foreground">
            Oppetid denne måneden
          </p>
        </CardContent>
      </Card>
    </div>
  )
};

// Design Tokens Showcase
export const DesignTokensShowcase: Story = {
  render: () => (
    <div className="space-y-8 max-w-4xl">
      <div>
        <h3 className="text-lg font-semibold mb-4">Skyggetokens</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Card variant="ghost">
            <CardHeader>
              <CardTitle>Ingen skygge</CardTitle>
              <CardDescription>shadow-none</CardDescription>
            </CardHeader>
          </Card>
          <Card variant="outline">
            <CardHeader>
              <CardTitle>Liten skygge</CardTitle>
              <CardDescription>{shadowTokens.sm}</CardDescription>
            </CardHeader>
          </Card>
          <Card variant="default">
            <CardHeader>
              <CardTitle>Medium skygge</CardTitle>
              <CardDescription>{shadowTokens.md}</CardDescription>
            </CardHeader>
          </Card>
          <Card variant="elevated">
            <CardHeader>
              <CardTitle>Stor skygge</CardTitle>
              <CardDescription>{shadowTokens.lg}</CardDescription>
            </CardHeader>
          </Card>
        </div>
      </div>
      
      <div>
        <h3 className="text-lg font-semibold mb-4">Avstandstokens</h3>
        <Card>
          <CardHeader>
            <CardTitle>Spacing Scale</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {Object.entries(spacingTokens).slice(0, 8).map(([key, value]) => (
                <div key={key} className="flex items-center gap-4">
                  <span className="text-sm font-mono w-12">{key}:</span>
                  <div 
                    className="bg-primary h-4 rounded" 
                    style={{ width: value }}
                  />
                  <span className="text-sm text-muted-foreground">{value}</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
};

// Interactive Playground
export const Playground: Story = {
  args: {
    variant: 'default',
    padding: 'md',
    rounded: 'lg',
    children: (
      <>
        <CardHeader>
          <CardTitle>Interaktivt kort</CardTitle>
          <CardDescription>Prøv forskjellige innstillinger</CardDescription>
        </CardHeader>
        <CardContent>
          <p>Dette kortet kan tilpasses med kontrollene til høyre</p>
        </CardContent>
        <CardFooter>
          <Button>Handling</Button>
        </CardFooter>
      </>
    )
  }
};