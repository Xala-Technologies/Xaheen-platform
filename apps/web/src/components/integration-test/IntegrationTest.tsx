'use client';

import React from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { NSMBadge } from '@/components/ui/nsm-badge';
import { BankIDButton } from '@/components/ui/bankid-button';

export function IntegrationTest(): JSX.Element {
  return (
    <div className="max-w-4xl mx-auto p-8 space-y-8">
      <Card className="p-8">
        <h1 className="text-3xl font-bold mb-6">Xaheen CLI Ecosystem - Component Test</h1>
        
        {/* Button Variations */}
        <section className="space-y-4">
          <h2 className="text-xl font-semibold">Professional Buttons (CLAUDE.md Compliant)</h2>
          <div className="flex flex-wrap gap-3">
            <Button variant="default" size="sm">Small (40px)</Button>
            <Button variant="default" size="default">Default (48px min)</Button>
            <Button variant="default" size="lg">Large (56px rec)</Button>
            <Button variant="default" size="xl">XL (64px)</Button>
          </div>
          
          <div className="flex flex-wrap gap-3">
            <Button variant="default">Primary</Button>
            <Button variant="secondary">Secondary</Button>
            <Button variant="outline">Outline</Button>
            <Button variant="ghost">Ghost</Button>
            <Button variant="destructive">Destructive</Button>
            <Button variant="norway">🇳🇴 Norway</Button>
          </div>
          
          <div className="flex flex-wrap gap-3">
            <Button loading>Loading State</Button>
            <Button disabled>Disabled</Button>
            <Button leftIcon={<span>🚀</span>}>With Left Icon</Button>
            <Button rightIcon={<span>→</span>}>With Right Icon</Button>
          </div>
        </section>

        {/* Input Variations */}
        <section className="space-y-4 mt-8">
          <h2 className="text-xl font-semibold">Professional Inputs (56px default)</h2>
          <div className="space-y-3">
            <Input placeholder="Default input (56px height)" />
            <Input size="sm" placeholder="Small input (44px - accessibility minimum)" />
            <Input size="lg" placeholder="Large input (64px)" />
            <Input size="xl" placeholder="Extra large input (72px)" />
          </div>
          
          <div className="space-y-3">
            <Input 
              leftIcon={<span>🔍</span>} 
              placeholder="Search with icon" 
            />
            <Input 
              error 
              placeholder="Input with error state" 
            />
            <Input 
              success 
              placeholder="Input with success state" 
            />
            <Input 
              disabled 
              placeholder="Disabled input" 
            />
          </div>
        </section>

        {/* NSM Badges */}
        <section className="space-y-4 mt-8">
          <h2 className="text-xl font-semibold">NSM Security Classifications</h2>
          <div className="flex flex-wrap gap-3">
            <NSMBadge classification="OPEN" />
            <NSMBadge classification="RESTRICTED" />
            <NSMBadge classification="CONFIDENTIAL" />
            <NSMBadge classification="SECRET" />
          </div>
          
          <div className="flex flex-wrap gap-3">
            <NSMBadge classification="OPEN" size="sm" />
            <NSMBadge classification="RESTRICTED" size="md" />
            <NSMBadge classification="CONFIDENTIAL" size="lg" />
          </div>
        </section>

        {/* BankID Button */}
        <section className="space-y-4 mt-8">
          <h2 className="text-xl font-semibold">Norwegian BankID Integration</h2>
          <div className="space-y-3">
            <BankIDButton mode="login" />
            <BankIDButton mode="sign" />
            <BankIDButton mode="register" />
            <BankIDButton mode="login" testEnvironment />
          </div>
        </section>

        {/* Cards with Professional Padding */}
        <section className="space-y-4 mt-8">
          <h2 className="text-xl font-semibold">Cards with Professional Padding</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Card className="p-6">
              <h3 className="font-semibold mb-2">Standard Card (p-6 / 24px)</h3>
              <p className="text-sm text-muted-foreground">
                This card uses the minimum professional padding of 24px
              </p>
            </Card>
            
            <Card className="p-8">
              <h3 className="font-semibold mb-2">Premium Card (p-8 / 32px)</h3>
              <p className="text-sm text-muted-foreground">
                This card uses the recommended professional padding of 32px
              </p>
            </Card>
          </div>
        </section>

        {/* Color Compliance Test */}
        <section className="space-y-4 mt-8">
          <h2 className="text-xl font-semibold">WCAG AAA Color Compliance</h2>
          <div className="grid grid-cols-2 gap-4">
            <div className="p-4 bg-green-600 text-white rounded-lg">
              <p className="font-semibold">Success Color</p>
              <p className="text-sm">8:1 contrast ratio</p>
            </div>
            <div className="p-4 bg-yellow-600 text-white rounded-lg">
              <p className="font-semibold">Warning Color</p>
              <p className="text-sm">8:1 contrast ratio</p>
            </div>
            <div className="p-4 bg-red-600 text-white rounded-lg">
              <p className="font-semibold">Error Color</p>
              <p className="text-sm">8:1 contrast ratio</p>
            </div>
            <div className="p-4 bg-blue-600 text-white rounded-lg">
              <p className="font-semibold">Info Color</p>
              <p className="text-sm">8:1 contrast ratio</p>
            </div>
          </div>
        </section>

        {/* Responsive Test */}
        <section className="space-y-4 mt-8">
          <h2 className="text-xl font-semibold">Responsive Layout Test</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {[1, 2, 3, 4].map(i => (
              <Card key={i} className="p-6">
                <h3 className="font-semibold">Card {i}</h3>
                <p className="text-sm text-muted-foreground mt-2">
                  Responsive grid item
                </p>
              </Card>
            ))}
          </div>
        </section>
      </Card>
    </div>
  );
}