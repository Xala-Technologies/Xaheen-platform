/**
 * Toggle Component Stories
 * Showcasing professional toggle button controls with full accessibility
 * WCAG AAA compliant examples with Norwegian text and NSM security features
 */

import type { Meta, StoryObj } from '@storybook/react';
import React, { useState } from 'react';
import { Toggle } from '../registry/components/toggle/toggle';
import { 
  BellIcon,
  EyeIcon,
  EyeSlashIcon,
  LockClosedIcon,
  LockOpenIcon,
  SunIcon,
  MoonIcon,
  SpeakerWaveIcon,
  SpeakerXMarkIcon,
  WifiIcon,
  ShieldCheckIcon
} from '@heroicons/react/24/outline';

const meta: Meta<typeof Toggle> = {
  title: 'Components/Toggle',
  component: Toggle,
  parameters: {
    layout: 'centered',
    docs: {
      description: {
        component: 'Professional toggle button component with WCAG AAA compliance, full keyboard support, and NSM security classifications. Perfect for settings, preferences, and binary state controls.',
      },
    },
  },
  tags: ['autodocs'],
  argTypes: {
    variant: {
      control: 'select',
      options: ['default', 'outline', 'ghost', 'success', 'warning', 'destructive', 'nsmOpen', 'nsmRestricted', 'nsmConfidential', 'nsmSecret'],
      description: 'Visual style variant',
    },
    size: {
      control: 'select',
      options: ['sm', 'md', 'lg', 'xl'],
      description: 'Toggle size',
    },
    pressed: {
      control: 'boolean',
      description: 'Controlled pressed state',
    },
    defaultPressed: {
      control: 'boolean',
      description: 'Default pressed state for uncontrolled use',
    },
    disabled: {
      control: 'boolean',
      description: 'Disable the toggle',
    },
    nsmClassification: {
      control: 'select',
      options: [undefined, 'OPEN', 'RESTRICTED', 'CONFIDENTIAL', 'SECRET'],
      description: 'NSM security classification',
    },
  },
} satisfies Meta<typeof Toggle>;

export default meta;
type Story = StoryObj<typeof meta>;

// Basic Examples
export const Default: Story = {
  args: {
    children: 'Standard toggle',
    defaultPressed: false,
  },
};

export const Pressed: Story = {
  args: {
    children: 'Aktivert toggle',
    defaultPressed: true,
  },
};

export const Disabled: Story = {
  args: {
    children: 'Deaktivert toggle',
    defaultPressed: false,
    disabled: true,
  },
};

// Size Variants
export const Sizes: Story = {
  render: () => (
    <div className="flex flex-col gap-4 items-center">
      <Toggle size="sm" defaultPressed>
        Liten (40px)
      </Toggle>
      
      <Toggle size="md" defaultPressed>
        Medium (48px) - Standard
      </Toggle>
      
      <Toggle size="lg" defaultPressed>
        Stor (56px)
      </Toggle>
      
      <Toggle size="xl" defaultPressed>
        Ekstra stor (64px)
      </Toggle>
    </div>
  ),
};

// Style Variants
export const StyleVariants: Story = {
  render: () => (
    <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
      <Toggle variant="default" defaultPressed>
        Standard
      </Toggle>
      
      <Toggle variant="outline" defaultPressed>
        Omriss
      </Toggle>
      
      <Toggle variant="ghost" defaultPressed>
        Gjennomsiktig
      </Toggle>
      
      <Toggle variant="success" defaultPressed>
        Suksess
      </Toggle>
      
      <Toggle variant="warning" defaultPressed>
        Advarsel
      </Toggle>
      
      <Toggle variant="destructive" defaultPressed>
        Destruktiv
      </Toggle>
    </div>
  ),
};

// Icon Toggles
export const IconToggles: Story = {
  render: () => {
    const [notifications, setNotifications] = useState(true);
    const [visibility, setVisibility] = useState(false);
    const [security, setSecurity] = useState(true);
    const [theme, setTheme] = useState(false);
    const [sound, setSound] = useState(true);
    const [wifi, setWifi] = useState(true);

    return (
      <div className="grid grid-cols-2 md:grid-cols-3 gap-6">
        <div className="text-center">
          <Toggle 
            pressed={notifications}
            onPressedChange={setNotifications}
            aria-label="Toggle notifications"
            className="mb-2"
          >
            <BellIcon className="h-5 w-5" />
          </Toggle>
          <p className="text-sm text-muted-foreground">
            Varslinger {notifications ? 'på' : 'av'}
          </p>
        </div>

        <div className="text-center">
          <Toggle 
            pressed={visibility}
            onPressedChange={setVisibility}
            aria-label="Toggle visibility"
            className="mb-2"
          >
            {visibility ? <EyeIcon className="h-5 w-5" /> : <EyeSlashIcon className="h-5 w-5" />}
          </Toggle>
          <p className="text-sm text-muted-foreground">
            {visibility ? 'Synlig' : 'Skjult'}
          </p>
        </div>

        <div className="text-center">
          <Toggle 
            pressed={security}
            onPressedChange={setSecurity}
            variant="success"
            aria-label="Toggle security"
            className="mb-2"
          >
            {security ? <LockClosedIcon className="h-5 w-5" /> : <LockOpenIcon className="h-5 w-5" />}
          </Toggle>
          <p className="text-sm text-muted-foreground">
            Sikkerhet {security ? 'på' : 'av'}
          </p>
        </div>

        <div className="text-center">
          <Toggle 
            pressed={theme}
            onPressedChange={setTheme}
            variant="outline"
            aria-label="Toggle theme"
            className="mb-2"
          >
            {theme ? <MoonIcon className="h-5 w-5" /> : <SunIcon className="h-5 w-5" />}
          </Toggle>
          <p className="text-sm text-muted-foreground">
            {theme ? 'Mørkt' : 'Lyst'} tema
          </p>
        </div>

        <div className="text-center">
          <Toggle 
            pressed={sound}
            onPressedChange={setSound}
            variant="ghost"
            aria-label="Toggle sound"
            className="mb-2"
          >
            {sound ? <SpeakerWaveIcon className="h-5 w-5" /> : <SpeakerXMarkIcon className="h-5 w-5" />}
          </Toggle>
          <p className="text-sm text-muted-foreground">
            Lyd {sound ? 'på' : 'av'}
          </p>
        </div>

        <div className="text-center">
          <Toggle 
            pressed={wifi}
            onPressedChange={setWifi}
            variant={wifi ? 'success' : 'destructive'}
            aria-label="Toggle WiFi"
            className="mb-2"
          >
            <WifiIcon className="h-5 w-5" />
          </Toggle>
          <p className="text-sm text-muted-foreground">
            WiFi {wifi ? 'tilkoblet' : 'frakoblet'}
          </p>
        </div>
      </div>
    );
  },
};

// NSM Security Classifications
export const NSMClassifications: Story = {
  render: () => (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-semibold mb-4">NSM Sikkerhetskategorier</h3>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-4">
            <Toggle nsmClassification="OPEN" defaultPressed size="lg">
              <div className="flex items-center gap-2">
                <ShieldCheckIcon className="h-5 w-5" />
                Åpen tilgang
              </div>
            </Toggle>
            
            <Toggle nsmClassification="RESTRICTED" defaultPressed size="lg">
              <div className="flex items-center gap-2">
                <ShieldCheckIcon className="h-5 w-5" />
                Begrenset tilgang
              </div>
            </Toggle>
          </div>
          
          <div className="space-y-4">
            <Toggle nsmClassification="CONFIDENTIAL" defaultPressed size="lg">
              <div className="flex items-center gap-2">
                <ShieldCheckIcon className="h-5 w-5" />
                Konfidensiell
              </div>
            </Toggle>
            
            <Toggle nsmClassification="SECRET" defaultPressed size="lg">
              <div className="flex items-center gap-2">
                <ShieldCheckIcon className="h-5 w-5" />
                Hemmelig
              </div>
            </Toggle>
          </div>
        </div>
      </div>
    </div>
  ),
};

// Controlled vs Uncontrolled
export const ControlledState: Story = {
  render: () => <ControlledDemo />,
};

const ControlledDemo: React.FC = (): JSX.Element => {
  const [controlledPressed, setControlledPressed] = useState(false);
  const [showControls, setShowControls] = useState(true);

  return (
    <div className="space-y-8">
      <div className="space-y-4">
        <h4 className="text-base font-semibold">Ukontrollerte toggles</h4>
        <div className="flex gap-4">
          <Toggle defaultPressed={false}>
            Standard av
          </Toggle>
          <Toggle defaultPressed={true}>
            Standard på
          </Toggle>
        </div>
        <p className="text-sm text-muted-foreground">
          Disse håndterer sin egen tilstand internt.
        </p>
      </div>
      
      <div className="space-y-4">
        <h4 className="text-base font-semibold">Kontrollert toggle</h4>
        <div className="space-y-4">
          <Toggle 
            pressed={controlledPressed}
            onPressedChange={setControlledPressed}
            variant={controlledPressed ? 'success' : 'outline'}
          >
            {controlledPressed ? 'Aktivert' : 'Deaktivert'}
          </Toggle>
          
          {showControls && (
            <div className="flex gap-3">
              <button 
                onClick={() => setControlledPressed(true)}
                className="h-10 px-4 bg-green-600 text-white rounded-lg hover:bg-green-700 text-sm"
              >
                Sett på
              </button>
              <button 
                onClick={() => setControlledPressed(false)}
                className="h-10 px-4 bg-red-600 text-white rounded-lg hover:bg-red-700 text-sm"
              >
                Sett av
              </button>
              <button 
                onClick={() => setControlledPressed(!controlledPressed)}
                className="h-10 px-4 bg-purple-600 text-white rounded-lg hover:bg-purple-700 text-sm"
              >
                Toggle
              </button>
            </div>
          )}
          
          <div className="flex items-center gap-3">
            <span className="text-sm">Vis kontroller:</span>
            <Toggle 
              pressed={showControls}
              onPressedChange={setShowControls}
              size="sm"
            >
              {showControls ? 'Skjul' : 'Vis'}
            </Toggle>
          </div>
        </div>
        
        <p className="text-sm text-muted-foreground">
          Tilstand: <code>{controlledPressed ? 'true' : 'false'}</code>
        </p>
      </div>
    </div>
  );
};

// Settings Panel Example
export const SettingsPanel: Story = {
  render: () => <SettingsDemo />,
};

const SettingsDemo: React.FC = (): JSX.Element => {
  const [settings, setSettings] = useState({
    notifications: true,
    autoSave: false,
    darkMode: false,
    analytics: true,
    publicProfile: false,
    emailUpdates: true,
    smsNotifications: false,
    betaFeatures: false,
    locationSharing: false,
    dataCollection: true
  });

  const updateSetting = (key: keyof typeof settings) => {
    setSettings(prev => ({ ...prev, [key]: !prev[key] }));
  };

  const settingGroups = [
    {
      title: 'Varslinger',
      settings: [
        { key: 'notifications' as const, label: 'Push-varslinger', description: 'Motta varslinger om ny aktivitet' },
        { key: 'emailUpdates' as const, label: 'E-post oppdateringer', description: 'Ukentlige oppsummeringer og viktige nyheter' },
        { key: 'smsNotifications' as const, label: 'SMS-varslinger', description: 'Kritiske sikkerhetsmeldinger via SMS' },
      ]
    },
    {
      title: 'Applikasjon',
      settings: [
        { key: 'autoSave' as const, label: 'Automatisk lagring', description: 'Lagre endringer automatisk', variant: 'success' as const },
        { key: 'darkMode' as const, label: 'Mørkt tema', description: 'Bruk mørk fargeskjema' },
        { key: 'betaFeatures' as const, label: 'Beta-funksjoner', description: 'Få tilgang til eksperimentelle funksjoner', variant: 'warning' as const },
      ]
    },
    {
      title: 'Personvern',
      settings: [
        { key: 'publicProfile' as const, label: 'Offentlig profil', description: 'Gjør profilen synlig for andre brukere' },
        { key: 'locationSharing' as const, label: 'Lokasjonsdeling', description: 'Del din posisjon for bedre tjenester', variant: 'destructive' as const },
        { key: 'analytics' as const, label: 'Bruksanalyse', description: 'Hjelp oss forbedre produktet med anonymiserte data' },
        { key: 'dataCollection' as const, label: 'Datainnsamling', description: 'Tillat innsamling av bruksstatistikk', nsmClassification: 'RESTRICTED' as const },
      ]
    }
  ];

  return (
    <div className="max-w-2xl space-y-8">
      <div className="text-center">
        <h3 className="text-xl font-bold">Innstillinger</h3>
        <p className="text-muted-foreground">Tilpass applikasjonen etter dine preferanser</p>
      </div>

      {settingGroups.map((group, groupIndex) => (
        <div key={group.title} className="space-y-4">
          <h4 className="text-lg font-semibold border-b pb-2">{group.title}</h4>
          
          <div className="space-y-4">
            {group.settings.map((setting) => (
              <div key={setting.key} className="flex items-start justify-between p-4 bg-card rounded-lg border">
                <div className="flex-1 mr-4">
                  <div className="flex items-center gap-2 mb-1">
                    <label htmlFor={setting.key} className="font-medium cursor-pointer">
                      {setting.label}
                    </label>
                    {setting.nsmClassification && (
                      <span className="text-xs px-2 py-1 bg-yellow-100 text-yellow-800 rounded">
                        {setting.nsmClassification}
                      </span>
                    )}
                  </div>
                  <p className="text-sm text-muted-foreground">
                    {setting.description}
                  </p>
                </div>
                
                <Toggle
                  id={setting.key}
                  pressed={settings[setting.key]}
                  onPressedChange={() => updateSetting(setting.key)}
                  variant={setting.variant || 'default'}
                  nsmClassification={setting.nsmClassification}
                  aria-describedby={`${setting.key}-description`}
                />
              </div>
            ))}
          </div>
        </div>
      ))}
      
      <div className="p-4 bg-muted rounded-lg">
        <h5 className="font-medium mb-2">Gjeldende innstillinger:</h5>
        <pre className="text-xs bg-background p-3 rounded border overflow-x-auto">
          {JSON.stringify(settings, null, 2)}
        </pre>
      </div>
    </div>
  );
};

// Accessibility Features
export const AccessibilityFeatures: Story = {
  render: () => (
    <div className="space-y-8">
      <div>
        <h3 className="text-lg font-semibold mb-4">WCAG AAA Tilgjengelighetsfunksjoner</h3>
        
        <div className="space-y-6">
          <div>
            <h4 className="text-base font-medium mb-3">Tastaturnavigasjon</h4>
            <div className="flex gap-4">
              <Toggle defaultPressed>
                Tab til meg
              </Toggle>
              <Toggle defaultPressed variant="success">
                Bruk Space for å toggle
              </Toggle>
              <Toggle defaultPressed variant="outline">
                Enter fungerer også
              </Toggle>
            </div>
            <p className="text-sm text-muted-foreground mt-2">
              Bruk Tab for å navigere, Space eller Enter for å toggle.
            </p>
          </div>
          
          <div>
            <h4 className="text-base font-medium mb-3">ARIA-merking</h4>
            <div className="space-y-4">
              <Toggle 
                defaultPressed
                aria-label="Aktivér mørkt tema"
                description="Skifter mellom lyst og mørkt fargeskjema"
              >
                <SunIcon className="h-5 w-5" />
              </Toggle>
              
              <Toggle 
                defaultPressed={false}
                aria-label="Slå på varslinger"
                helperText="Motta push-varslinger om ny aktivitet"
              >
                <BellIcon className="h-5 w-5" />
              </Toggle>
            </div>
          </div>
          
          <div>
            <h4 className="text-base font-medium mb-3">Fokusindikatorer</h4>
            <div className="flex gap-4">
              <Toggle defaultPressed size="lg" className="focus:ring-4 focus:ring-blue-500/20">
                Tydelig fokus
              </Toggle>
              <Toggle defaultPressed variant="success" size="lg">
                Standard fokus
              </Toggle>
            </div>
            <p className="text-sm text-muted-foreground mt-2">
              Alle toggles har tydelige fokusindikatorer som oppfyller WCAG kontrastkrav.
            </p>
          </div>
        </div>
        
        <div className="mt-6 p-4 bg-muted rounded-lg">
          <h4 className="font-medium mb-2">Fullstendig tilgjengelighetsstøtte:</h4>
          <ul className="text-sm text-muted-foreground space-y-1">
            <li>• Semantisk button-element med riktig rolle</li>
            <li>• <code>aria-pressed</code> attributt for tilstand</li>
            <li>• Støtte for <code>aria-label</code> og <code>aria-describedby</code></li>
            <li>• Tastaturnavigasjon med Tab, Space og Enter</li>
            <li>• WCAG AAA kontrastnivåer for alle varianter</li>
            <li>• Tydelige fokusindikatorer</li>
            <li>• Responsive design for berøringsskjermer</li>
            <li>• NSM-klassifisering annonseres for skjermlesere</li>
          </ul>
        </div>
      </div>
    </div>
  ),
};

// Enterprise Scenarios
export const EnterpriseScenarios: Story = {
  render: () => <EnterpriseDemo />,
};

const EnterpriseDemo: React.FC = (): JSX.Element => {
  const [systemSettings, setSystemSettings] = useState({
    bankIdEnabled: true,
    altinnSync: false,
    auditLogging: true,
    encryptionEnabled: true,
    multiFactorAuth: true,
    sessionTimeout: false,
    dataRetention: true,
    complianceMode: false,
    emergencyAccess: false,
    maintenanceMode: false
  });

  const updateSystemSetting = (key: keyof typeof systemSettings) => {
    setSystemSettings(prev => ({ ...prev, [key]: !prev[key] }));
  };

  return (
    <div className="max-w-4xl space-y-8">
      <div className="text-center">
        <h3 className="text-xl font-bold">Bedriftssystem Kontrollpanel</h3>
        <p className="text-muted-foreground">Administrer kritiske systeminnstillinger</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <div className="space-y-6">
          <div>
            <h4 className="text-lg font-semibold mb-4">Integrasjoner</h4>
            
            <div className="space-y-4">
              <div className="flex items-center justify-between p-4 border rounded-lg">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center">
                    <span className="text-green-600 font-bold text-sm">B</span>
                  </div>
                  <div>
                    <div className="font-medium">BankID Integrasjon</div>
                    <div className="text-sm text-muted-foreground">Norsk eID-tjeneste</div>
                  </div>
                </div>
                <Toggle 
                  pressed={systemSettings.bankIdEnabled}
                  onPressedChange={() => updateSystemSetting('bankIdEnabled')}
                  variant="success"
                  nsmClassification="RESTRICTED"
                />
              </div>
              
              <div className="flex items-center justify-between p-4 border rounded-lg">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                    <span className="text-blue-600 font-bold text-sm">A</span>
                  </div>
                  <div>
                    <div className="font-medium">Altinn Synkronisering</div>
                    <div className="text-sm text-muted-foreground">Automatisk rapportering</div>
                  </div>
                </div>
                <Toggle 
                  pressed={systemSettings.altinnSync}
                  onPressedChange={() => updateSystemSetting('altinnSync')}
                  variant="warning"
                  nsmClassification="CONFIDENTIAL"
                />
              </div>
            </div>
          </div>
          
          <div>
            <h4 className="text-lg font-semibold mb-4">Sikkerhet</h4>
            
            <div className="space-y-4">
              <div className="flex items-center justify-between p-4 border rounded-lg">
                <div>
                  <div className="font-medium">Kryptering</div>
                  <div className="text-sm text-muted-foreground">AES-256 datakryptering</div>
                </div>
                <Toggle 
                  pressed={systemSettings.encryptionEnabled}
                  onPressedChange={() => updateSystemSetting('encryptionEnabled')}
                  variant="success"
                  nsmClassification="SECRET"
                />
              </div>
              
              <div className="flex items-center justify-between p-4 border rounded-lg">
                <div>
                  <div className="font-medium">To-faktor autentisering</div>
                  <div className="text-sm text-muted-foreground">Ekstra sikkerhetslag</div>
                </div>
                <Toggle 
                  pressed={systemSettings.multiFactorAuth}
                  onPressedChange={() => updateSystemSetting('multiFactorAuth')}
                  variant="success"
                  nsmClassification="RESTRICTED"
                />
              </div>
            </div>
          </div>
        </div>
        
        <div className="space-y-6">
          <div>
            <h4 className="text-lg font-semibold mb-4">Overvåkning</h4>
            
            <div className="space-y-4">
              <div className="flex items-center justify-between p-4 border rounded-lg">
                <div>
                  <div className="font-medium">Revisjonslogging</div>
                  <div className="text-sm text-muted-foreground">Detaljert aktivitetslogg</div>
                </div>
                <Toggle 
                  pressed={systemSettings.auditLogging}
                  onPressedChange={() => updateSystemSetting('auditLogging')}
                  variant="default"
                  nsmClassification="OPEN"
                />
              </div>
              
              <div className="flex items-center justify-between p-4 border rounded-lg">
                <div>
                  <div className="font-medium">Dataoppbevaring</div>
                  <div className="text-sm text-muted-foreground">GDPR-kompatibel lagring</div>
                </div>
                <Toggle 
                  pressed={systemSettings.dataRetention}
                  onPressedChange={() => updateSystemSetting('dataRetention')}
                  variant="default"
                />
              </div>
            </div>
          </div>
          
          <div>
            <h4 className="text-lg font-semibold mb-4">System</h4>
            
            <div className="space-y-4">
              <div className="flex items-center justify-between p-4 border rounded-lg">
                <div>
                  <div className="font-medium">Vedlikeholdsmodus</div>
                  <div className="text-sm text-muted-foreground">Midlertidig utilgjengelig</div>
                </div>
                <Toggle 
                  pressed={systemSettings.maintenanceMode}
                  onPressedChange={() => updateSystemSetting('maintenanceMode')}
                  variant="destructive"
                />
              </div>
              
              <div className="flex items-center justify-between p-4 border rounded-lg">
                <div>
                  <div className="font-medium">Nødtilgang</div>
                  <div className="text-sm text-muted-foreground">Bypass normal autentisering</div>
                </div>
                <Toggle 
                  pressed={systemSettings.emergencyAccess}
                  onPressedChange={() => updateSystemSetting('emergencyAccess')}
                  variant="destructive"
                  nsmClassification="SECRET"
                />
              </div>
            </div>
          </div>
        </div>
      </div>
      
      <div className="p-4 bg-muted rounded-lg">
        <h5 className="font-medium mb-2">Systemstatus oversikt:</h5>
        <div className="grid grid-cols-2 md:grid-cols-5 gap-4 text-sm">
          {Object.entries(systemSettings).map(([key, value]) => (
            <div key={key} className="flex items-center gap-2">
              <div className={`w-2 h-2 rounded-full ${value ? 'bg-green-500' : 'bg-gray-300'}`} />
              <span className="capitalize">{key.replace(/([A-Z])/g, ' $1').trim()}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

// Interactive Playground
export const Playground: Story = {
  args: {
    children: 'Interaktiv toggle',
    variant: 'default',
    size: 'md',
    pressed: undefined,
    defaultPressed: false,
    disabled: false,
  },
};