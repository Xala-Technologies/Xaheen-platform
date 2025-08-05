import React, { useState } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { NSMBadge } from '@/components/ui/nsm-badge';
import { cn } from '@/lib/utils';

interface LicenseTier {
  readonly id: string;
  readonly name: string;
  readonly price: string;
  readonly features: readonly string[];
  readonly limits: {
    readonly projects: number | 'unlimited';
    readonly users: number | 'unlimited';
    readonly generations: number | 'unlimited';
    readonly platforms: string[];
  };
  readonly compliance: {
    readonly nsm: readonly ('OPEN' | 'RESTRICTED' | 'CONFIDENTIAL' | 'SECRET')[];
    readonly bankid: boolean;
    readonly altinn: boolean;
  };
  readonly popular?: boolean;
}

const licenseTiers: readonly LicenseTier[] = [
  {
    id: 'free',
    name: 'Free',
    price: '0 NOK',
    features: [
      'Up to 3 projects',
      'Basic components',
      'Community support',
      'Public templates'
    ],
    limits: {
      projects: 3,
      users: 1,
      generations: 100,
      platforms: ['react', 'nextjs']
    },
    compliance: {
      nsm: ['OPEN'],
      bankid: false,
      altinn: false
    }
  },
  {
    id: 'pro',
    name: 'Professional',
    price: '999 NOK/mo',
    features: [
      'Up to 20 projects',
      'All components',
      'Priority support',
      'Private templates',
      'Custom themes',
      'Analytics dashboard'
    ],
    limits: {
      projects: 20,
      users: 5,
      generations: 1000,
      platforms: ['react', 'nextjs', 'vue', 'angular', 'svelte']
    },
    compliance: {
      nsm: ['OPEN', 'RESTRICTED'],
      bankid: true,
      altinn: false
    },
    popular: true
  },
  {
    id: 'enterprise',
    name: 'Enterprise',
    price: 'Custom',
    features: [
      'Unlimited projects',
      'White-label options',
      'Dedicated support',
      'Custom integrations',
      'On-premise deployment',
      'SLA guarantee',
      'Security audits',
      'Custom AI training'
    ],
    limits: {
      projects: 'unlimited',
      users: 'unlimited',
      generations: 'unlimited',
      platforms: ['react', 'nextjs', 'vue', 'angular', 'svelte', 'electron', 'react-native']
    },
    compliance: {
      nsm: ['OPEN', 'RESTRICTED', 'CONFIDENTIAL', 'SECRET'],
      bankid: true,
      altinn: true
    }
  }
];

export function LicenseManagement(): JSX.Element {
  const [currentPlan] = useState('pro');
  const [licenseKey, setLicenseKey] = useState('');
  const [showActivation, setShowActivation] = useState(false);

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="space-y-2">
        <h1 className="text-3xl font-bold">License Management</h1>
        <p className="text-muted-foreground">
          Manage your subscription and access enterprise features
        </p>
      </div>

      {/* Current Plan Status */}
      <Card className="p-6 bg-primary/5 border-primary/20">
        <div className="flex items-center justify-between">
          <div className="space-y-1">
            <p className="text-sm text-muted-foreground">Current Plan</p>
            <h2 className="text-2xl font-bold">Professional</h2>
            <p className="text-sm text-muted-foreground">Valid until December 31, 2024</p>
          </div>
          <div className="text-right space-y-2">
            <p className="text-sm text-muted-foreground">Usage This Month</p>
            <p className="text-xl font-semibold">847 / 1000 generations</p>
            <div className="w-48 bg-neutral-200 rounded-full h-2">
              <div className="bg-primary h-2 rounded-full" style={{ width: '84.7%' }} />
            </div>
          </div>
        </div>
      </Card>

      {/* License Tiers */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {licenseTiers.map(tier => (
          <Card 
            key={tier.id} 
            className={cn(
              "p-6 relative",
              tier.popular && "border-primary shadow-lg",
              currentPlan === tier.id && "bg-primary/5"
            )}
          >
            {tier.popular && (
              <span className="absolute -top-3 left-1/2 -translate-x-1/2 px-3 py-1 bg-primary text-white text-sm rounded-full">
                Most Popular
              </span>
            )}
            
            <div className="space-y-4">
              <div>
                <h3 className="text-xl font-bold">{tier.name}</h3>
                <p className="text-2xl font-bold mt-2">{tier.price}</p>
              </div>

              <ul className="space-y-2">
                {tier.features.map((feature, index) => (
                  <li key={index} className="flex items-start gap-2">
                    <span className="text-green-600 mt-0.5">✓</span>
                    <span className="text-sm">{feature}</span>
                  </li>
                ))}
              </ul>

              <div className="pt-4 border-t space-y-3">
                <div>
                  <p className="text-xs font-medium text-muted-foreground mb-1">Projects</p>
                  <p className="font-semibold">
                    {typeof tier.limits.projects === 'number' 
                      ? `Up to ${tier.limits.projects}` 
                      : 'Unlimited'}
                  </p>
                </div>
                
                <div>
                  <p className="text-xs font-medium text-muted-foreground mb-1">NSM Classifications</p>
                  <div className="flex flex-wrap gap-1">
                    {tier.compliance.nsm.map(level => (
                      <NSMBadge key={level} classification={level} size="sm" />
                    ))}
                  </div>
                </div>

                <div>
                  <p className="text-xs font-medium text-muted-foreground mb-1">Norwegian Services</p>
                  <div className="flex gap-2">
                    {tier.compliance.bankid && (
                      <span className="text-xs bg-blue-100 text-blue-700 px-2 py-1 rounded">BankID</span>
                    )}
                    {tier.compliance.altinn && (
                      <span className="text-xs bg-blue-100 text-blue-700 px-2 py-1 rounded">Altinn</span>
                    )}
                    {!tier.compliance.bankid && !tier.compliance.altinn && (
                      <span className="text-xs text-muted-foreground">Not available</span>
                    )}
                  </div>
                </div>
              </div>

              <Button 
                variant={currentPlan === tier.id ? "outline" : tier.popular ? "default" : "outline"}
                size="lg"
                fullWidth
                disabled={currentPlan === tier.id}
              >
                {currentPlan === tier.id ? 'Current Plan' : 
                 tier.id === 'enterprise' ? 'Contact Sales' : 'Upgrade'}
              </Button>
            </div>
          </Card>
        ))}
      </div>

      {/* License Key Activation */}
      <Card className="p-6">
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-semibold">License Key Activation</h3>
            <Button 
              variant="outline" 
              size="default"
              onClick={() => setShowActivation(!showActivation)}
            >
              {showActivation ? 'Hide' : 'Show'} Activation
            </Button>
          </div>

          {showActivation && (
            <div className="space-y-4 pt-4 border-t">
              <p className="text-sm text-muted-foreground">
                Enter your license key to activate enterprise features
              </p>
              <div className="flex gap-3">
                <Input
                  value={licenseKey}
                  onChange={(e) => setLicenseKey(e.target.value)}
                  placeholder="XXXX-XXXX-XXXX-XXXX"
                  className="flex-1"
                />
                <Button variant="default" size="lg">
                  Activate License
                </Button>
              </div>
            </div>
          )}
        </div>
      </Card>

      {/* Feature Comparison */}
      <Card className="p-6">
        <h3 className="text-lg font-semibold mb-4">Feature Comparison</h3>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b">
                <th className="text-left py-3 px-4">Feature</th>
                <th className="text-center py-3 px-4">Free</th>
                <th className="text-center py-3 px-4">Professional</th>
                <th className="text-center py-3 px-4">Enterprise</th>
              </tr>
            </thead>
            <tbody>
              {[
                ['Projects', '3', '20', 'Unlimited'],
                ['Team Members', '1', '5', 'Unlimited'],
                ['Monthly Generations', '100', '1,000', 'Unlimited'],
                ['Platform Support', '2', '5', 'All 7'],
                ['Custom Themes', '❌', '✅', '✅'],
                ['Private Templates', '❌', '✅', '✅'],
                ['BankID Integration', '❌', '✅', '✅'],
                ['Altinn Services', '❌', '❌', '✅'],
                ['On-Premise Deploy', '❌', '❌', '✅'],
                ['SLA Guarantee', '❌', '❌', '✅'],
                ['Custom AI Training', '❌', '❌', '✅']
              ].map(([feature, free, pro, enterprise]) => (
                <tr key={feature} className="border-b">
                  <td className="py-3 px-4 font-medium">{feature}</td>
                  <td className="py-3 px-4 text-center">{free}</td>
                  <td className="py-3 px-4 text-center">{pro}</td>
                  <td className="py-3 px-4 text-center">{enterprise}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
}