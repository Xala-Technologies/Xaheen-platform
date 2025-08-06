/**
 * Switch Component Stories
 * Showcasing all variants, sizes, and states with Norwegian localization
 * WCAG AAA compliant examples with accessibility features
 */

import type { Meta, StoryObj } from '@storybook/react';
import React from 'react';
import { Switch } from '../registry/components/switch/switch';
import { Label } from '../registry/components/label/label';

const meta: Meta<typeof Switch> = {
  title: 'Form/Switch',
  component: Switch,
  parameters: {
    layout: 'padded',
    docs: {
      description: {
        component: 'Profesjonell toggle-bryter for av/på-valg med norsk lokalisering, WCAG AAA-kompatibilitet og NSM-klassifisering.'
      }
    }
  },
  tags: ['autodocs'],
  argTypes: {
    size: {
      control: 'select',
      options: ['sm', 'md', 'lg', 'xl'],
      description: 'Size of the switch (professional minimum heights)'
    },
    variant: {
      control: 'select',
      options: ['default', 'success', 'warning', 'destructive'],
      description: 'Visual variant of the switch'
    },
    disabled: {
      control: 'boolean',
      description: 'Disable the switch'
    },
    checked: {
      control: 'boolean',
      description: 'Checked state of the switch'
    },
    nsmClassification: {
      control: 'select',
      options: [undefined, 'OPEN', 'RESTRICTED', 'CONFIDENTIAL', 'SECRET'],
      description: 'NSM security classification'
    }
  }
} satisfies Meta<typeof Switch>;

export default meta;
type Story = StoryObj<typeof meta>;

// Basic Examples
export const Default: Story = {
  args: {}
};

export const WithLabel: Story = {
  render: () => (
    <div className="flex items-center space-x-3">
      <Switch id="notifications" />
      <Label htmlFor="notifications">Motta varsler</Label>
    </div>
  )
};

export const WithDescription: Story = {
  render: () => (
    <div className="space-y-2">
      <div className="flex items-center space-x-3">
        <Switch id="email-notifications" />
        <Label htmlFor="email-notifications">E-postvarsler</Label>
      </div>
      <p className="text-sm text-muted-foreground ml-12">
        Motta viktige oppdateringer via e-post
      </p>
    </div>
  )
};

export const DefaultChecked: Story = {
  render: () => (
    <div className="flex items-center space-x-3">
      <Switch id="auto-save" defaultChecked />
      <Label htmlFor="auto-save">Automatisk lagring</Label>
    </div>
  )
};

// Size Variants
export const Sizes: Story = {
  render: () => (
    <div className="space-y-6">
      <div>
        <h3 className="text-sm font-medium mb-4">Størrelser</h3>
        <div className="space-y-4">
          <div className="flex items-center space-x-3">
            <Switch size="sm" id="small-switch" />
            <Label htmlFor="small-switch">Liten størrelse - h-10 (40px)</Label>
          </div>
          <div className="flex items-center space-x-3">
            <Switch size="md" id="medium-switch" />
            <Label htmlFor="medium-switch">Medium størrelse - h-12 (48px) - Standard</Label>
          </div>
          <div className="flex items-center space-x-3">
            <Switch size="lg" id="large-switch" />
            <Label htmlFor="large-switch">Stor størrelse - h-14 (56px)</Label>
          </div>
          <div className="flex items-center space-x-3">
            <Switch size="xl" id="xl-switch" />
            <Label htmlFor="xl-switch">Ekstra stor størrelse - h-16 (64px)</Label>
          </div>
        </div>
      </div>
    </div>
  )
};

// State Variants
export const States: Story = {
  render: () => (
    <div className="space-y-6">
      <div className="space-y-4">
        <div>
          <h3 className="text-sm font-medium mb-2">Grunnleggende tilstander</h3>
          <div className="space-y-3">
            <div className="flex items-center space-x-3">
              <Switch id="unchecked" />
              <Label htmlFor="unchecked">Ikke aktivert</Label>
            </div>
            <div className="flex items-center space-x-3">
              <Switch id="checked" defaultChecked />
              <Label htmlFor="checked">Aktivert</Label>
            </div>
            <div className="flex items-center space-x-3">
              <Switch id="disabled-off" disabled />
              <Label htmlFor="disabled-off">Deaktivert (av)</Label>
            </div>
            <div className="flex items-center space-x-3">
              <Switch id="disabled-on" disabled defaultChecked />
              <Label htmlFor="disabled-on">Deaktivert (på)</Label>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
};

// Variant Colors
export const Variants: Story = {
  render: () => (
    <div className="space-y-6">
      <div>
        <h3 className="text-sm font-medium mb-4">Fargvarianter</h3>
        <div className="space-y-4">
          <div className="flex items-center space-x-3">
            <Switch variant="default" id="default-variant" defaultChecked />
            <Label htmlFor="default-variant">Standard variant (blå)</Label>
          </div>
          <div className="flex items-center space-x-3">
            <Switch variant="success" id="success-variant" defaultChecked />
            <Label htmlFor="success-variant">Suksess variant (grønn)</Label>
          </div>
          <div className="flex items-center space-x-3">
            <Switch variant="warning" id="warning-variant" defaultChecked />
            <Label htmlFor="warning-variant">Advarsel variant (gul)</Label>
          </div>
          <div className="flex items-center space-x-3">
            <Switch variant="destructive" id="destructive-variant" defaultChecked />
            <Label htmlFor="destructive-variant">Destruktiv variant (rød)</Label>
          </div>
        </div>
      </div>
    </div>
  )
};

// NSM Classification
export const NSMClassification: Story = {
  render: () => (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-semibold mb-4">NSM Sikkerhetsklassifisering</h3>
        <div className="space-y-4">
          <div className="flex items-center space-x-3">
            <Switch nsmClassification="OPEN" id="nsm-open" defaultChecked />
            <div>
              <Label htmlFor="nsm-open">Åpen informasjon</Label>
              <p className="text-sm text-muted-foreground">Kan deles offentlig uten begrensninger</p>
            </div>
          </div>
          <div className="flex items-center space-x-3">
            <Switch nsmClassification="RESTRICTED" id="nsm-restricted" defaultChecked />
            <div>
              <Label htmlFor="nsm-restricted">Begrenset tilgang</Label>
              <p className="text-sm text-muted-foreground">Kun for autorisert personell</p>
            </div>
          </div>
          <div className="flex items-center space-x-3">
            <Switch nsmClassification="CONFIDENTIAL" id="nsm-confidential" defaultChecked />
            <div>
              <Label htmlFor="nsm-confidential">Konfidensiell informasjon</Label>
              <p className="text-sm text-muted-foreground">Høyt sikkerhetsnivå påkrevd</p>
            </div>
          </div>
          <div className="flex items-center space-x-3">
            <Switch nsmClassification="SECRET" id="nsm-secret" defaultChecked />
            <div>
              <Label htmlFor="nsm-secret">Hemmelig informasjon</Label>
              <p className="text-sm text-muted-foreground">Strengt sikkerhetsnivå</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
};

// Settings Panel Examples
export const SettingsPanel: Story = {
  render: () => {
    const [settings, setSettings] = React.useState({
      notifications: true,
      darkMode: false,
      autoSave: true,
      analytics: false,
      marketing: false,
      location: true,
      twoFactor: false
    });

    const updateSetting = (key: keyof typeof settings, value: boolean) => {
      setSettings(prev => ({ ...prev, [key]: value }));
    };

    return (
      <div className="max-w-2xl space-y-8">
        <div>
          <h3 className="text-lg font-semibold mb-4">Brukerinnstillinger</h3>
          <div className="space-y-6">
            
            {/* General Settings */}
            <div className="space-y-4">
              <h4 className="text-base font-semibold">Generelt</h4>
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <div>
                    <Label htmlFor="notifications-setting">Push-varsler</Label>
                    <p className="text-sm text-muted-foreground">Motta varsler fra appen</p>
                  </div>
                  <Switch 
                    id="notifications-setting"
                    checked={settings.notifications}
                    onCheckedChange={(checked) => updateSetting('notifications', checked)}
                  />
                </div>
                
                <div className="flex items-center justify-between">
                  <div>
                    <Label htmlFor="dark-mode-setting">Mørkt tema</Label>
                    <p className="text-sm text-muted-foreground">Bytt til mørk modus</p>
                  </div>
                  <Switch 
                    id="dark-mode-setting"
                    checked={settings.darkMode}
                    onCheckedChange={(checked) => updateSetting('darkMode', checked)}
                  />
                </div>
                
                <div className="flex items-center justify-between">
                  <div>
                    <Label htmlFor="auto-save-setting">Automatisk lagring</Label>
                    <p className="text-sm text-muted-foreground">Lagre arbeid automatisk</p>
                  </div>
                  <Switch 
                    id="auto-save-setting"
                    variant="success"
                    checked={settings.autoSave}
                    onCheckedChange={(checked) => updateSetting('autoSave', checked)}
                  />
                </div>
              </div>
            </div>

            {/* Privacy Settings */}
            <div className="space-y-4">
              <h4 className="text-base font-semibold">Personvern</h4>
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <div>
                    <Label htmlFor="analytics-setting">Analysedata</Label>
                    <p className="text-sm text-muted-foreground">Hjelp oss forbedre produktet</p>
                  </div>
                  <Switch 
                    id="analytics-setting"
                    variant="warning"
                    checked={settings.analytics}
                    onCheckedChange={(checked) => updateSetting('analytics', checked)}
                  />
                </div>
                
                <div className="flex items-center justify-between">
                  <div>
                    <Label htmlFor="marketing-setting">Markedsføring</Label>
                    <p className="text-sm text-muted-foreground">Motta tilpassede annonser</p>
                  </div>
                  <Switch 
                    id="marketing-setting"
                    variant="warning"
                    checked={settings.marketing}
                    onCheckedChange={(checked) => updateSetting('marketing', checked)}
                  />
                </div>
                
                <div className="flex items-center justify-between">
                  <div>
                    <Label htmlFor="location-setting">Posisjonstjenester</Label>
                    <p className="text-sm text-muted-foreground">Tillat posisjonsbaserte funksjoner</p>
                  </div>
                  <Switch 
                    id="location-setting"
                    checked={settings.location}
                    onCheckedChange={(checked) => updateSetting('location', checked)}
                  />
                </div>
              </div>
            </div>

            {/* Security Settings */}
            <div className="space-y-4">
              <h4 className="text-base font-semibold">Sikkerhet</h4>
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <div>
                    <Label htmlFor="two-factor-setting">Tofaktor-autentisering</Label>
                    <p className="text-sm text-muted-foreground">Ekstra sikkerhetslag for kontoen din</p>
                  </div>
                  <Switch 
                    id="two-factor-setting"
                    variant="success"
                    size="lg"
                    checked={settings.twoFactor}
                    onCheckedChange={(checked) => updateSetting('twoFactor', checked)}
                  />
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }
};

// Feature Toggles
export const FeatureToggles: Story = {
  render: () => {
    const [features, setFeatures] = React.useState({
      betaFeatures: false,
      advancedEditor: true,
      collaboration: false,
      realTimeSync: true,
      offlineMode: false
    });

    const updateFeature = (key: keyof typeof features, value: boolean) => {
      setFeatures(prev => ({ ...prev, [key]: value }));
    };

    return (
      <div className="max-w-2xl space-y-6">
        <div>
          <h3 className="text-lg font-semibold mb-4">Funksjonsbrytere</h3>
          <div className="space-y-4">
            <div className="p-4 border border-border rounded-lg">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <Label htmlFor="beta-features" className="text-base font-medium">
                    Beta-funksjoner
                  </Label>
                  <p className="text-sm text-muted-foreground mt-1">
                    Få tilgang til nye funksjoner før de lanseres offentlig. 
                    Kan være ustabile.
                  </p>
                </div>
                <Switch 
                  id="beta-features"
                  variant="warning"
                  size="lg"
                  checked={features.betaFeatures}
                  onCheckedChange={(checked) => updateFeature('betaFeatures', checked)}
                />
              </div>
            </div>

            <div className="p-4 border border-border rounded-lg">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <Label htmlFor="advanced-editor" className="text-base font-medium">
                    Avansert editor
                  </Label>
                  <p className="text-sm text-muted-foreground mt-1">
                    Aktiver avanserte redigeringsfunksjoner og snarveier.
                  </p>
                </div>
                <Switch 
                  id="advanced-editor"
                  variant="success"
                  checked={features.advancedEditor}
                  onCheckedChange={(checked) => updateFeature('advancedEditor', checked)}
                />
              </div>
            </div>

            <div className="p-4 border border-border rounded-lg">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <Label htmlFor="collaboration" className="text-base font-medium">
                    Sanntidssamarbeid
                  </Label>
                  <p className="text-sm text-muted-foreground mt-1">
                    Tillat flere brukere å redigere samme dokument samtidig.
                  </p>
                </div>
                <Switch 
                  id="collaboration"
                  checked={features.collaboration}
                  onCheckedChange={(checked) => updateFeature('collaboration', checked)}
                />
              </div>
            </div>

            <div className="p-4 border border-border rounded-lg">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <Label htmlFor="real-time-sync" className="text-base font-medium">
                    Sanntidssynkronisering
                  </Label>
                  <p className="text-sm text-muted-foreground mt-1">
                    Synkroniser endringer automatisk på tvers av enheter.
                  </p>
                </div>
                <Switch 
                  id="real-time-sync"
                  variant="success"
                  checked={features.realTimeSync}
                  onCheckedChange={(checked) => updateFeature('realTimeSync', checked)}
                />
              </div>
            </div>

            <div className="p-4 border border-border rounded-lg">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <Label htmlFor="offline-mode" className="text-base font-medium">
                    Frakoblet modus
                  </Label>
                  <p className="text-sm text-muted-foreground mt-1">
                    Jobb uten internettforbindelse. Synkroniseres når tilkoblet.
                  </p>
                </div>
                <Switch 
                  id="offline-mode"
                  checked={features.offlineMode}
                  onCheckedChange={(checked) => updateFeature('offlineMode', checked)}
                />
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }
};

// Form Integration
export const FormIntegration: Story = {
  render: () => {
    const [formData, setFormData] = React.useState({
      name: '',
      email: '',
      terms: false,
      newsletter: true,
      notifications: true,
      marketing: false
    });

    return (
      <div className="max-w-2xl space-y-6">
        <div>
          <h3 className="text-lg font-semibold mb-4">Registreringsskjema</h3>
          <form className="space-y-6">
            {/* Basic Info */}
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="name-input" required>Navn</Label>
                <input 
                  id="name-input"
                  className="flex h-12 w-full rounded-lg border-2 border-input bg-background px-4 py-3 text-base"
                  placeholder="Ditt navn"
                  value={formData.name}
                  onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="email-input" required>E-postadresse</Label>
                <input 
                  id="email-input"
                  type="email"
                  className="flex h-12 w-full rounded-lg border-2 border-input bg-background px-4 py-3 text-base"
                  placeholder="din@epost.no"
                  value={formData.email}
                  onChange={(e) => setFormData(prev => ({ ...prev, email: e.target.value }))}
                  required
                />
              </div>
            </div>

            {/* Switch Options */}
            <div className="space-y-4">
              <h4 className="text-base font-semibold">Preferanser</h4>
              
              <div className="space-y-4">
                <div className="flex items-center justify-between p-3 border border-border rounded-lg">
                  <div>
                    <Label htmlFor="newsletter-switch">Nyhetsbrev</Label>
                    <p className="text-sm text-muted-foreground">
                      Motta månedlige oppdateringer og nyheter
                    </p>
                  </div>
                  <Switch 
                    id="newsletter-switch"
                    variant="success"
                    checked={formData.newsletter}
                    onCheckedChange={(checked) => 
                      setFormData(prev => ({ ...prev, newsletter: checked }))
                    }
                  />
                </div>

                <div className="flex items-center justify-between p-3 border border-border rounded-lg">
                  <div>
                    <Label htmlFor="notifications-switch">Push-varsler</Label>
                    <p className="text-sm text-muted-foreground">
                      Motta varsler om viktige aktiviteter
                    </p>
                  </div>
                  <Switch 
                    id="notifications-switch"
                    checked={formData.notifications}
                    onCheckedChange={(checked) => 
                      setFormData(prev => ({ ...prev, notifications: checked }))
                    }
                  />
                </div>

                <div className="flex items-center justify-between p-3 border border-border rounded-lg">
                  <div>
                    <Label htmlFor="marketing-switch">Markedsføring</Label>
                    <p className="text-sm text-muted-foreground">
                      Motta tilpassede tilbud og annonser
                    </p>
                  </div>
                  <Switch 
                    id="marketing-switch"
                    variant="warning"
                    checked={formData.marketing}
                    onCheckedChange={(checked) => 
                      setFormData(prev => ({ ...prev, marketing: checked }))
                    }
                  />
                </div>
              </div>
            </div>

            {/* Required Terms */}
            <div className="p-4 bg-muted rounded-lg">
              <div className="flex items-start space-x-3">
                <Switch 
                  id="terms-switch"
                  variant={formData.terms ? 'success' : 'destructive'}
                  size="lg"
                  checked={formData.terms}
                  onCheckedChange={(checked) => 
                    setFormData(prev => ({ ...prev, terms: checked }))
                  }
                />
                <div>
                  <Label htmlFor="terms-switch" required>
                    Jeg godkjenner vilkårene og betingelsene
                  </Label>
                  <p className="text-sm text-muted-foreground mt-1">
                    Du må godkjenne våre vilkår for å opprette en konto
                  </p>
                  {!formData.terms && (
                    <p className="text-sm text-destructive mt-1">
                      Dette feltet er påkrevd
                    </p>
                  )}
                </div>
              </div>
            </div>

            <div className="text-sm text-muted-foreground">
              <strong>Valgte innstillinger:</strong>
              <ul className="list-disc list-inside mt-1 space-y-1">
                <li>Nyhetsbrev: {formData.newsletter ? 'Aktivert' : 'Deaktivert'}</li>
                <li>Varsler: {formData.notifications ? 'Aktivert' : 'Deaktivert'}</li>
                <li>Markedsføring: {formData.marketing ? 'Aktivert' : 'Deaktivert'}</li>
                <li>Vilkår: {formData.terms ? 'Godkjent' : 'Ikke godkjent'}</li>
              </ul>
            </div>
          </form>
        </div>
      </div>
    );
  }
};

// Accessibility Features
export const AccessibilityFeatures: Story = {
  render: () => (
    <div className="space-y-8">
      <div>
        <h3 className="text-lg font-semibold mb-4">Tilgjengelighetsfunksjoner</h3>
        
        <div className="space-y-6">
          <div>
            <h4 className="text-base font-semibold mb-3">Tastaturnavigasjon</h4>
            <div className="space-y-3">
              <div className="flex items-center space-x-3">
                <Switch id="keyboard-focus" />
                <Label htmlFor="keyboard-focus">
                  Tab for å fokusere, Space/Enter for å veksle
                </Label>
              </div>
              <div className="flex items-center space-x-3">
                <Switch id="escape-key" />
                <Label htmlFor="escape-key">
                  Esc-tasten for å fjerne fokus
                </Label>
              </div>
            </div>
          </div>

          <div>
            <h4 className="text-base font-semibold mb-3">Skjermleser-støtte</h4>
            <div className="space-y-3">
              <div className="flex items-center space-x-3">
                <Switch id="aria-support" defaultChecked />
                <Label htmlFor="aria-support">
                  ARIA switch rolle for riktig annonsering
                </Label>
              </div>
              <div className="flex items-center space-x-3">
                <Switch 
                  id="state-announcement" 
                  aria-label="Tilstandsannonsering for skjermlesere"
                  defaultChecked 
                />
                <Label htmlFor="state-announcement">
                  Automatisk annonsering av på/av-tilstand
                </Label>
              </div>
            </div>
          </div>

          <div>
            <h4 className="text-base font-semibold mb-3">Visuell tilgjengelighet</h4>
            <div className="space-y-3">
              <div className="flex items-center space-x-3">
                <Switch id="high-contrast" size="lg" />
                <Label htmlFor="high-contrast">
                  Høy kontrast for bedre synlighet
                </Label>
              </div>
              <div className="flex items-center space-x-3">
                <Switch id="large-targets" size="xl" />
                <Label htmlFor="large-targets">
                  Store berøringsmål (minimum 44px)
                </Label>
              </div>
              <div className="flex items-center space-x-3">
                <Switch id="focus-indicators" />
                <Label htmlFor="focus-indicators">
                  Tydelige fokusindikatorer
                </Label>
              </div>
            </div>
          </div>

          <div>
            <h4 className="text-base font-semibold mb-3">Tilleggsinformasjon</h4>
            <div className="space-y-3">
              <div className="flex items-center space-x-3">
                <Switch 
                  id="with-description" 
                  description="Ekstra kontekst for skjermlesere"
                />
                <Label htmlFor="with-description">
                  Med beskrivelse for utvidet kontekst
                </Label>
              </div>
              <div className="flex items-center space-x-3">
                <Switch 
                  id="with-helper" 
                  helperText="Hjelpetekst som leses opp av skjermlesere"
                />
                <Label htmlFor="with-helper">
                  Med hjelpetekst for veiledning
                </Label>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
};

// Interactive Playground
export const Playground: Story = {
  args: {
    size: 'md',
    variant: 'default',
    disabled: false,
    defaultChecked: false
  }
};