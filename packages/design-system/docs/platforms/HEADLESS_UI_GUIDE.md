# 🧠 Headless UI Platform Guide

## Overview

The Xaheen Design System Headless UI platform provides fully accessible, unstyled components built with [Headless UI](https://headlessui.com/) primitives. These components offer complete accessibility compliance, advanced interaction patterns, and maximum styling flexibility while maintaining consistency with the universal design system.

## Table of Contents

- [Platform Benefits](#platform-benefits)
- [Installation](#installation)
- [Basic Usage](#basic-usage)
- [Core Components](#core-components)
- [Advanced Patterns](#advanced-patterns)
- [Platform-Specific Features](#platform-specific-features)
- [Best Practices](#best-practices)
- [Migration Guide](#migration-guide)
- [Troubleshooting](#troubleshooting)

## Platform Benefits

### ✅ Full Accessibility
- WCAG AAA compliant out of the box
- Complete keyboard navigation support
- Automatic focus management and trapping
- Screen reader optimized with proper ARIA attributes

### ✅ Advanced Interactions
- Built-in state management for complex UI patterns
- Sophisticated event handling and lifecycle management
- Render props and compound component patterns
- Flexible composition with hooks and utilities

### ✅ Maximum Flexibility
- Unstyled components with full design control
- CVA (class-variance-authority) integration
- Data attribute-based styling hooks
- Compatible with any CSS framework or styling solution

### ✅ Performance Optimized
- Minimal runtime overhead
- Tree-shaking friendly exports
- Optimized re-rendering patterns
- Built-in virtualization support

## Installation

### Prerequisites

```bash
# React 18+ required
npm install react@^18.0.0 react-dom@^18.0.0

# TypeScript (recommended)
npm install -D typescript @types/react @types/react-dom
```

### Core Dependencies

```bash
# Install Xaheen Design System with Headless UI support
npm install @xaheen/design-system @headlessui/react

# Or with yarn
yarn add @xaheen/design-system @headlessui/react

# Or with pnpm
pnpm add @xaheen/design-system @headlessui/react
```

### Optional Dependencies

```bash
# For advanced styling (recommended)
npm install clsx tailwind-merge class-variance-authority

# For icons
npm install @heroicons/react lucide-react

# For animations
npm install framer-motion @tailwindcss/forms
```

## Basic Usage

### Setup and Configuration

```tsx
// app.tsx or main.tsx
import React from 'react';
import { HeadlessUIProvider } from '@xaheen/design-system/headless-ui';

// Import design tokens CSS
import '@xaheen/design-system/tokens/css';

function App() {
  return (
    <HeadlessUIProvider
      config={{
        // Global accessibility settings
        accessibility: {
          announcements: true,
          focusManagement: true,
          reducedMotion: false
        },
        // Global styling configuration
        styling: {
          colorScheme: 'auto',
          density: 'comfortable',
          borderRadius: 'md'
        }
      }}
    >
      <YourApp />
    </HeadlessUIProvider>
  );
}

export default App;
```

### Basic Component Usage

```tsx
import React, { useState } from 'react';
import {
  Button,
  Input,
  Card,
  CardHeader,
  CardContent,
  CardFooter
} from '@xaheen/design-system/headless-ui';

function BasicExample() {
  const [email, setEmail] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async () => {
    setIsSubmitting(true);
    
    try {
      await submitForm({ email });
      console.log('Form submitted successfully');
    } catch (error) {
      console.error('Submission failed:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="max-w-md mx-auto p-6">
      <Card variant="elevated" className="space-y-4">
        <CardHeader 
          title="Get Started"
          subtitle="Enter your email to begin"
        />
        
        <CardContent className="space-y-4">
          <Input
            label="Email Address"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="your@email.com"
            required
            error={!email && isSubmitting ? 'Email is required' : ''}
            helperText="We'll never share your email with anyone"
          />
        </CardContent>
        
        <CardFooter className="flex justify-end space-x-3">
          <Button variant="outline" disabled={isSubmitting}>
            Cancel
          </Button>
          <Button 
            variant="primary" 
            onClick={handleSubmit}
            loading={isSubmitting}
            disabled={!email}
          >
            Continue
          </Button>
        </CardFooter>
      </Card>
    </div>
  );
}

async function submitForm(data: { email: string }) {
  // Mock API call
  return new Promise(resolve => setTimeout(resolve, 2000));
}
```

## Core Components

### HeadlessButton

Enhanced button component with advanced state management and accessibility.

```tsx
import React, { useState } from 'react';
import {
  Button,
  ButtonGroup,
  ToggleButton,
  MenuButton,
  SplitButton
} from '@xaheen/design-system/headless-ui';
import { Menu } from '@headlessui/react';

function ButtonExamples() {
  const [isToggled, setIsToggled] = useState(false);
  const [selectedOption, setSelectedOption] = useState('option1');

  return (
    <div className="space-y-6 p-6">
      {/* Basic buttons with variants */}
      <div className="space-y-4">
        <h3 className="text-lg font-semibold">Basic Buttons</h3>
        <div className="flex flex-wrap gap-3">
          <Button variant="primary" size="md">
            Primary
          </Button>
          <Button variant="secondary" size="md">
            Secondary
          </Button>
          <Button variant="outline" size="md">
            Outline
          </Button>
          <Button variant="ghost" size="md">
            Ghost
          </Button>
          <Button variant="destructive" size="md">
            Destructive
          </Button>
        </div>
      </div>

      {/* Button sizes */}
      <div className="space-y-4">
        <h3 className="text-lg font-semibold">Button Sizes</h3>
        <div className="flex items-center gap-3">
          <Button size="xs">Extra Small</Button>
          <Button size="sm">Small</Button>
          <Button size="md">Medium</Button>
          <Button size="lg">Large</Button>
          <Button size="xl">Extra Large</Button>
        </div>
      </div>

      {/* Button states */}
      <div className="space-y-4">
        <h3 className="text-lg font-semibold">Button States</h3>
        <div className="flex gap-3">
          <Button loading>Loading</Button>
          <Button disabled>Disabled</Button>
          <Button variant="primary" className="w-full">
            Full Width
          </Button>
        </div>
      </div>

      {/* Button with icons */}
      <div className="space-y-4">
        <h3 className="text-lg font-semibold">Buttons with Icons</h3>
        <div className="flex gap-3">
          <Button 
            variant="primary"
            startIcon={<PlusIcon className="h-4 w-4" />}
          >
            Add Item
          </Button>
          <Button 
            variant="outline"
            endIcon={<ArrowRightIcon className="h-4 w-4" />}
          >
            Continue
          </Button>
          <Button 
            variant="ghost" 
            size="sm"
            aria-label="Settings"
          >
            <CogIcon className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {/* Toggle button */}
      <div className="space-y-4">
        <h3 className="text-lg font-semibold">Toggle Button</h3>
        <ToggleButton
          pressed={isToggled}
          onPressedChange={setIsToggled}
          variant="outline"
          aria-label="Toggle notifications"
        >
          {isToggled ? (
            <>
              <BellSlashIcon className="h-4 w-4 mr-2" />
              Notifications Off
            </>
          ) : (
            <>
              <BellIcon className="h-4 w-4 mr-2" />
              Notifications On
            </>
          )}
        </ToggleButton>
      </div>

      {/* Button group */}
      <div className="space-y-4">
        <h3 className="text-lg font-semibold">Button Group</h3>
        <ButtonGroup>
          <Button 
            variant={selectedOption === 'option1' ? 'primary' : 'outline'}
            onClick={() => setSelectedOption('option1')}
          >
            Option 1
          </Button>
          <Button 
            variant={selectedOption === 'option2' ? 'primary' : 'outline'}
            onClick={() => setSelectedOption('option2')}
          >
            Option 2
          </Button>
          <Button 
            variant={selectedOption === 'option3' ? 'primary' : 'outline'}
            onClick={() => setSelectedOption('option3')}
          >
            Option 3
          </Button>
        </ButtonGroup>
      </div>

      {/* Menu button with Headless UI Menu */}
      <div className="space-y-4">
        <h3 className="text-lg font-semibold">Menu Button</h3>
        <Menu as="div" className="relative inline-block text-left">
          <Menu.Button as={MenuButton} variant="outline">
            Options
            <ChevronDownIcon className="h-4 w-4 ml-2" />
          </Menu.Button>
          
          <Menu.Items className="absolute right-0 mt-2 w-56 origin-top-right bg-white border border-gray-200 rounded-md shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none">
            <div className="py-1">
              <Menu.Item>
                {({ active }) => (
                  <button
                    className={`${
                      active ? 'bg-gray-100' : ''
                    } group flex items-center w-full px-4 py-2 text-sm text-gray-700`}
                  >
                    Edit
                  </button>
                )}
              </Menu.Item>
              <Menu.Item>
                {({ active }) => (
                  <button
                    className={`${
                      active ? 'bg-gray-100' : ''
                    } group flex items-center w-full px-4 py-2 text-sm text-gray-700`}
                  >
                    Delete
                  </button>
                )}
              </Menu.Item>
            </div>
          </Menu.Items>
        </Menu>
      </div>

      {/* Split button */}
      <div className="space-y-4">
        <h3 className="text-lg font-semibold">Split Button</h3>
        <SplitButton
          primaryAction={{
            label: 'Save',
            onClick: () => console.log('Save clicked')
          }}
          secondaryActions={[
            { label: 'Save as Draft', onClick: () => console.log('Save as Draft') },
            { label: 'Save and Publish', onClick: () => console.log('Save and Publish') },
            { type: 'separator' },
            { label: 'Save Template', onClick: () => console.log('Save Template') }
          ]}
        />
      </div>
    </div>
  );
}

// Icon components (using Heroicons as example)
import {
  PlusIcon,
  ArrowRightIcon,
  CogIcon,
  BellIcon,
  BellSlashIcon,
  ChevronDownIcon
} from '@heroicons/react/24/outline';
```

### HeadlessInput

Advanced input component with Combobox functionality and validation.

```tsx
import React, { useState } from 'react';
import {
  Input,
  SearchInput,
  PasswordInput,
  ComboboxInput,
  TextareaInput,
  NumberInput,
  DateInput
} from '@xaheen/design-system/headless-ui';

function InputExamples() {
  const [basicValue, setBasicValue] = useState('');
  const [searchValue, setSearchValue] = useState('');
  const [selectedCountry, setSelectedCountry] = useState('');
  const [message, setMessage] = useState('');
  const [amount, setAmount] = useState(0);
  const [selectedDate, setSelectedDate] = useState('');

  // Mock data for combobox
  const countries = [
    'United States',
    'Canada',
    'United Kingdom',
    'Germany',
    'France',
    'Japan',
    'Australia',
    'Norway',
    'Sweden',
    'Denmark'
  ];

  const filteredCountries = countries.filter(country =>
    country.toLowerCase().includes(selectedCountry.toLowerCase())
  );

  return (
    <div className="max-w-2xl mx-auto p-6 space-y-8">
      {/* Basic input */}
      <div className="space-y-4">
        <h3 className="text-lg font-semibold">Basic Input</h3>
        <Input
          label="Full Name"
          placeholder="Enter your full name"
          value={basicValue}
          onChange={(e) => setBasicValue(e.target.value)}
          helperText="This will be displayed on your profile"
          required
        />
      </div>

      {/* Input with validation */}
      <div className="space-y-4">
        <h3 className="text-lg font-semibold">Input with Validation</h3>
        <Input
          label="Email Address"
          type="email"
          placeholder="your@email.com"
          value={basicValue}
          onChange={(e) => setBasicValue(e.target.value)}
          error={basicValue && !isValidEmail(basicValue) ? 'Please enter a valid email address' : ''}
          helperText="We'll use this to send you important updates"
          required
        />
      </div>

      {/* Search input */}
      <div className="space-y-4">
        <h3 className="text-lg font-semibold">Search Input</h3>
        <SearchInput
          placeholder="Search for anything..."
          value={searchValue}
          onChange={(e) => setSearchValue(e.target.value)}
          onClear={() => setSearchValue('')}
          loading={false}
          suggestions={[
            'React components',
            'TypeScript guides',
            'Accessibility best practices',
            'Design systems'
          ].filter(item => 
            item.toLowerCase().includes(searchValue.toLowerCase())
          )}
          onSuggestionSelect={(suggestion) => setSearchValue(suggestion)}
        />
      </div>

      {/* Password input */}
      <div className="space-y-4">
        <h3 className="text-lg font-semibold">Password Input</h3>
        <PasswordInput
          label="Password"
          placeholder="Enter a secure password"
          helperText="Must be at least 8 characters with uppercase, lowercase, and number"
          strengthIndicator
          requirements={[
            { label: 'At least 8 characters', regex: /.{8,}/ },
            { label: 'One uppercase letter', regex: /[A-Z]/ },
            { label: 'One lowercase letter', regex: /[a-z]/ },
            { label: 'One number', regex: /\d/ },
            { label: 'One special character', regex: /[!@#$%^&*(),.?":{}|<>]/ }
          ]}
        />
      </div>

      {/* Combobox input */}
      <div className="space-y-4">
        <h3 className="text-lg font-semibold">Combobox Input</h3>
        <ComboboxInput
          label="Country"
          placeholder="Select or type a country"
          value={selectedCountry}
          onChange={setSelectedCountry}
          options={filteredCountries}
          displayValue={(country) => country}
          filterFunction={(query, options) =>
            options.filter(option =>
              option.toLowerCase().includes(query.toLowerCase())
            )
          }
          createNewOption={(query) => ({
            label: `Create "${query}"`,
            value: query
          })}
          allowCustomValue
          helperText="Start typing to see suggestions"
        />
      </div>

      {/* Textarea */}
      <div className="space-y-4">
        <h3 className="text-lg font-semibold">Textarea</h3>
        <TextareaInput
          label="Message"
          placeholder="Enter your message..."
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          rows={4}
          maxLength={500}
          showCharacterCount
          helperText="Tell us about your project requirements"
          resize="vertical"
        />
      </div>

      {/* Number input */}
      <div className="space-y-4">
        <h3 className="text-lg font-semibold">Number Input</h3>
        <NumberInput
          label="Amount"
          value={amount}
          onChange={setAmount}
          min={0}
          max={10000}
          step={0.01}
          prefix="$"
          suffix="USD"
          thousandSeparator=","
          decimalScale={2}
          helperText="Enter amount in US dollars"
        />
      </div>

      {/* Date input */}
      <div className="space-y-4">
        <h3 className="text-lg font-semibold">Date Input</h3>
        <DateInput
          label="Preferred Date"
          value={selectedDate}
          onChange={setSelectedDate}
          min="2024-01-01"
          max="2025-12-31"
          helperText="Select your preferred appointment date"
          showCalendar
        />
      </div>
    </div>
  );
}

function isValidEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}
```

### HeadlessCard

Flexible card component with collapsible functionality using Disclosure.

```tsx
import React, { useState } from 'react';
import {
  Card,
  CardHeader,
  CardContent,
  CardFooter,
  CollapsibleCard,
  InteractiveCard,
  FeatureCard,
  StatCard,
  MediaCard
} from '@xaheen/design-system/headless-ui';
import { Disclosure } from '@headlessui/react';
import { ChevronDownIcon, PlayIcon } from '@heroicons/react/24/outline';

function CardExamples() {
  const [selectedCard, setSelectedCard] = useState<string | null>(null);

  return (
    <div className="max-w-4xl mx-auto p-6 space-y-8">
      {/* Basic cards */}
      <div className="space-y-4">
        <h3 className="text-lg font-semibold">Basic Cards</h3>
        <div className="grid md:grid-cols-2 gap-4">
          <Card variant="default" padding="lg">
            <CardHeader 
              title="Default Card"
              subtitle="A simple card with default styling"
            />
            <CardContent>
              <p className="text-gray-600">
                This is a basic card with default variant and large padding.
                It's perfect for displaying simple content.
              </p>
            </CardContent>
            <CardFooter className="flex justify-end">
              <Button variant="outline" size="sm">Learn More</Button>
            </CardFooter>
          </Card>

          <Card variant="elevated" padding="lg">
            <CardHeader 
              title="Elevated Card"
              subtitle="With shadow and elevation"
              actions={
                <Button variant="ghost" size="sm" aria-label="Options">
                  <EllipsisHorizontalIcon className="h-4 w-4" />
                </Button>
              }
            />
            <CardContent>
              <p className="text-gray-600">
                This card uses the elevated variant with a shadow effect
                and includes header actions.
              </p>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Collapsible cards */}
      <div className="space-y-4">
        <h3 className="text-lg font-semibold">Collapsible Cards</h3>
        <CollapsibleCard defaultOpen>
          <Disclosure>
            {({ open }) => (
              <>
                <Disclosure.Button className="w-full">
                  <CardHeader 
                    title="Expandable Section"
                    subtitle="Click to expand or collapse"
                    collapsible
                    expanded={open}
                  />
                </Disclosure.Button>
                <Disclosure.Panel>
                  <CardContent>
                    <div className="space-y-4">
                      <p className="text-gray-600">
                        This content can be toggled by clicking the header.
                        The expansion state is managed automatically.
                      </p>
                      <div className="bg-gray-50 p-4 rounded-md">
                        <h4 className="font-medium mb-2">Additional Content</h4>
                        <p className="text-sm text-gray-600">
                          You can put any content inside collapsible cards,
                          including forms, lists, images, or other components.
                        </p>
                      </div>
                    </div>
                  </CardContent>
                </Disclosure.Panel>
              </>
            )}
          </Disclosure>
        </CollapsibleCard>
      </div>

      {/* Interactive cards */}
      <div className="space-y-4">
        <h3 className="text-lg font-semibold">Interactive Cards</h3>
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
          {[1, 2, 3].map((id) => (
            <InteractiveCard
              key={id}
              selected={selectedCard === `card-${id}`}
              onClick={() => setSelectedCard(selectedCard === `card-${id}` ? null : `card-${id}`)}
              className="transition-all duration-200"
            >
              <CardContent className="text-center p-6">
                <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <span className="text-blue-600 font-semibold">{id}</span>
                </div>
                <h4 className="font-medium mb-2">Option {id}</h4>
                <p className="text-sm text-gray-600">
                  Click to select this option. Only one can be selected at a time.
                </p>
              </CardContent>
            </InteractiveCard>
          ))}
        </div>
      </div>

      {/* Feature cards */}
      <div className="space-y-4">
        <h3 className="text-lg font-semibold">Feature Cards</h3>
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
          <FeatureCard
            icon={<RocketIcon className="h-8 w-8" />}
            title="Fast Performance"
            description="Optimized for speed with minimal bundle size and efficient rendering patterns."
            href="/features/performance"
          />
          
          <FeatureCard
            icon={<ShieldIcon className="h-8 w-8" />}
            title="Accessibility First"
            description="WCAG AAA compliant with full keyboard navigation and screen reader support."
            href="/features/accessibility"
          />
          
          <FeatureCard
            icon={<PaintBrushIcon className="h-8 w-8" />}
            title="Customizable"
            description="Flexible styling with CSS variables, data attributes, and design tokens."
            href="/features/customization"
          />
        </div>
      </div>

      {/* Stat cards */}
      <div className="space-y-4">
        <h3 className="text-lg font-semibold">Statistics Cards</h3>
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <StatCard
            label="Total Users"
            value="12,345"
            trend="up"
            trendValue="+12.5%"
            color="primary"
            icon={<UsersIcon className="h-5 w-5" />}
          />
          
          <StatCard
            label="Monthly Revenue"
            value="$54,321"
            trend="up"
            trendValue="+8.2%"
            color="success"
            icon={<CurrencyDollarIcon className="h-5 w-5" />}
          />
          
          <StatCard
            label="Conversion Rate"
            value="3.24%"
            trend="down"
            trendValue="-2.1%"
            color="warning"
            icon={<ChartBarIcon className="h-5 w-5" />}
          />
          
          <StatCard
            label="Active Sessions"
            value="1,834"
            trend="neutral"
            trendValue="0.0%"
            color="neutral"
            icon={<DevicePhoneMobileIcon className="h-5 w-5" />}
          />
        </div>
      </div>

      {/* Media cards */}
      <div className="space-y-4">
        <h3 className="text-lg font-semibold">Media Cards</h3>
        <div className="grid md:grid-cols-2 gap-4">
          <MediaCard
            media={{
              type: 'video',
              thumbnail: 'https://picsum.photos/400/225',
              duration: '5:32',
              title: 'Getting Started with Headless UI',
              description: 'Learn how to build accessible React components with Headless UI primitives.',
              author: 'Design System Team',
              publishedAt: '2 days ago',
              views: '1.2K views'
            }}
            onPlay={() => console.log('Play video')}
            onBookmark={() => console.log('Bookmark video')}
            className="max-w-md"
          />

          <MediaCard
            media={{
              type: 'image',
              src: 'https://picsum.photos/400/300',
              title: 'Component Architecture',
              description: 'Visual guide to our component architecture and design principles.',
              author: 'UX Team',
              publishedAt: '1 week ago',
              likes: 47
            }}
            onLike={() => console.log('Like image')}
            onShare={() => console.log('Share image')}
            className="max-w-md"
          />
        </div>
      </div>
    </div>
  );
}

// Import necessary icons
import {
  EllipsisHorizontalIcon,
  RocketIcon,
  ShieldIcon,
  PaintBrushIcon,
  UsersIcon,
  CurrencyDollarIcon,
  ChartBarIcon,
  DevicePhoneMobileIcon
} from '@heroicons/react/24/outline';
```

## Advanced Patterns

### Complex Forms with Validation

```tsx
import React, { useState } from 'react';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import {
  Card,
  CardHeader,
  CardContent,
  CardFooter,
  Input,
  ComboboxInput,
  TextareaInput,
  Button,
  FieldSet,
  FormField,
  FormMessage
} from '@xaheen/design-system/headless-ui';

// Form schema
const profileSchema = z.object({
  firstName: z.string().min(1, 'First name is required').max(50),
  lastName: z.string().min(1, 'Last name is required').max(50),
  email: z.string().email('Invalid email address'),
  phone: z.string().regex(/^\+?[\d\s-()]+$/, 'Invalid phone number').optional(),
  country: z.string().min(1, 'Please select a country'),
  bio: z.string().max(500, 'Bio must be 500 characters or less').optional(),
  website: z.string().url('Invalid website URL').optional(),
  notifications: z.object({
    email: z.boolean(),
    push: z.boolean(),
    sms: z.boolean()
  })
});

type ProfileFormData = z.infer<typeof profileSchema>;

const countries = [
  'United States', 'Canada', 'United Kingdom', 'Germany', 
  'France', 'Japan', 'Australia', 'Norway', 'Sweden'
];

function ComplexForm() {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitResult, setSubmitResult] = useState<string | null>(null);

  const {
    control,
    handleSubmit,
    formState: { errors, isValid, isDirty },
    watch,
    reset
  } = useForm<ProfileFormData>({
    resolver: zodResolver(profileSchema),
    defaultValues: {
      firstName: '',
      lastName: '',
      email: '',
      phone: '',
      country: '',
      bio: '',
      website: '',
      notifications: {
        email: true,
        push: false,
        sms: false
      }
    },
    mode: 'onBlur'
  });

  const watchedValues = watch();

  const onSubmit = async (data: ProfileFormData) => {
    setIsSubmitting(true);
    setSubmitResult(null);

    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 2000));
      console.log('Form submitted:', data);
      setSubmitResult('Profile updated successfully!');
      reset(data); // Reset form with new values to clear isDirty
    } catch (error) {
      setSubmitResult('Failed to update profile. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto p-6">
      <form onSubmit={handleSubmit(onSubmit)} noValidate>
        <Card variant="elevated" className="space-y-6">
          <CardHeader
            title="Profile Settings"
            subtitle="Update your personal information and preferences"
          />

          <CardContent className="space-y-6">
            {/* Personal Information */}
            <FieldSet legend="Personal Information">
              <div className="grid md:grid-cols-2 gap-4">
                <FormField>
                  <Controller
                    name="firstName"
                    control={control}
                    render={({ field }) => (
                      <Input
                        {...field}
                        label="First Name"
                        placeholder="John"
                        error={errors.firstName?.message}
                        required
                      />
                    )}
                  />
                </FormField>

                <FormField>
                  <Controller
                    name="lastName"
                    control={control}
                    render={({ field }) => (
                      <Input
                        {...field}
                        label="Last Name"
                        placeholder="Doe"
                        error={errors.lastName?.message}
                        required
                      />
                    )}
                  />
                </FormField>
              </div>

              <FormField>
                <Controller
                  name="email"
                  control={control}
                  render={({ field }) => (
                    <Input
                      {...field}
                      type="email"
                      label="Email Address"
                      placeholder="john.doe@example.com"
                      error={errors.email?.message}
                      helperText="This will be your primary contact email"
                      required
                    />
                  )}
                />
              </FormField>

              <FormField>
                <Controller
                  name="phone"
                  control={control}
                  render={({ field }) => (
                    <Input
                      {...field}
                      type="tel"
                      label="Phone Number"
                      placeholder="+1 (555) 123-4567"
                      error={errors.phone?.message}
                      helperText="Include country code for international numbers"
                    />
                  )}
                />
              </FormField>

              <FormField>
                <Controller
                  name="country"
                  control={control}
                  render={({ field: { value, onChange } }) => (
                    <ComboboxInput
                      label="Country"
                      placeholder="Select your country"
                      value={value}
                      onChange={onChange}
                      options={countries}
                      error={errors.country?.message}
                      filterFunction={(query, options) =>
                        options.filter(option =>
                          option.toLowerCase().includes(query.toLowerCase())
                        )
                      }
                      required
                    />
                  )}
                />
              </FormField>
            </FieldSet>

            {/* Additional Information */}
            <FieldSet legend="Additional Information">
              <FormField>
                <Controller
                  name="bio"
                  control={control}
                  render={({ field }) => (
                    <TextareaInput
                      {...field}
                      label="Bio"
                      placeholder="Tell us about yourself..."
                      rows={4}
                      maxLength={500}
                      showCharacterCount
                      error={errors.bio?.message}
                      helperText="This will be displayed on your public profile"
                    />
                  )}
                />
              </FormField>

              <FormField>
                <Controller
                  name="website"
                  control={control}
                  render={({ field }) => (
                    <Input
                      {...field}
                      type="url"
                      label="Website"
                      placeholder="https://your-website.com"
                      error={errors.website?.message}
                      helperText="Your personal or professional website"
                    />
                  )}
                />
              </FormField>
            </FieldSet>

            {/* Notification Preferences */}
            <FieldSet legend="Notification Preferences">
              <div className="space-y-3">
                <Controller
                  name="notifications.email"
                  control={control}
                  render={({ field: { value, onChange } }) => (
                    <CheckboxField
                      checked={value}
                      onCheckedChange={onChange}
                      label="Email Notifications"
                      description="Receive updates and announcements via email"
                    />
                  )}
                />

                <Controller
                  name="notifications.push"
                  control={control}
                  render={({ field: { value, onChange } }) => (
                    <CheckboxField
                      checked={value}
                      onCheckedChange={onChange}
                      label="Push Notifications"
                      description="Receive real-time notifications in your browser"
                    />
                  )}
                />

                <Controller
                  name="notifications.sms"
                  control={control}
                  render={({ field: { value, onChange } }) => (
                    <CheckboxField
                      checked={value}
                      onCheckedChange={onChange}
                      label="SMS Notifications"
                      description="Receive important alerts via text message"
                    />
                  )}
                />
              </div>
            </FieldSet>
          </CardContent>

          <CardFooter className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <div className="flex-1">
              {submitResult && (
                <FormMessage 
                  type={submitResult.includes('successfully') ? 'success' : 'error'}
                >
                  {submitResult}
                </FormMessage>
              )}
            </div>
            
            <div className="flex gap-3">
              <Button
                type="button"
                variant="outline"
                onClick={() => reset()}
                disabled={isSubmitting || !isDirty}
              >
                Reset
              </Button>
              
              <Button
                type="submit"
                variant="primary"
                loading={isSubmitting}
                disabled={!isValid || isSubmitting}
              >
                {isSubmitting ? 'Saving...' : 'Save Profile'}
              </Button>
            </div>
          </CardFooter>
        </Card>
      </form>

      {/* Debug panel (remove in production) */}
      {process.env.NODE_ENV === 'development' && (
        <Card className="mt-6">
          <CardHeader title="Debug Info" />
          <CardContent>
            <pre className="text-xs bg-gray-100 p-4 rounded overflow-auto">
              {JSON.stringify({ 
                values: watchedValues, 
                errors,
                isValid,
                isDirty
              }, null, 2)}
            </pre>
          </CardContent>
        </Card>
      )}
    </div>
  );
}

// Checkbox field component
interface CheckboxFieldProps {
  checked: boolean;
  onCheckedChange: (checked: boolean) => void;
  label: string;
  description?: string;
}

function CheckboxField({ checked, onCheckedChange, label, description }: CheckboxFieldProps) {
  return (
    <div className="flex items-start gap-3">
      <input
        type="checkbox"
        checked={checked}
        onChange={(e) => onCheckedChange(e.target.checked)}
        className="mt-1 h-4 w-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
      />
      <div className="flex-1">
        <label className="text-sm font-medium text-gray-700">
          {label}
        </label>
        {description && (
          <p className="text-sm text-gray-500 mt-1">{description}</p>
        )}
      </div>
    </div>
  );
}

export default ComplexForm;
```

### Data Tables with Sorting and Filtering

```tsx
import React, { useState, useMemo } from 'react';
import {
  Table,
  TableHeader,
  TableBody,
  TableRow,
  TableHead,
  TableCell,
  Button,
  Input,
  Card,
  Badge,
  Pagination
} from '@xaheen/design-system/headless-ui';

interface User {
  id: string;
  name: string;
  email: string;
  role: 'admin' | 'user' | 'moderator';
  status: 'active' | 'inactive' | 'pending';
  lastLogin: Date;
  createdAt: Date;
}

// Mock data
const generateUsers = (count: number): User[] => {
  const roles: User['role'][] = ['admin', 'user', 'moderator'];
  const statuses: User['status'][] = ['active', 'inactive', 'pending'];
  const names = [
    'John Doe', 'Jane Smith', 'Bob Johnson', 'Alice Brown', 'Charlie Wilson',
    'Diana Prince', 'Edward Norton', 'Fiona Apple', 'George Lucas', 'Helen Troy'
  ];

  return Array.from({ length: count }, (_, i) => ({
    id: `user-${i + 1}`,
    name: names[i % names.length] + ` ${i + 1}`,
    email: `user${i + 1}@example.com`,
    role: roles[Math.floor(Math.random() * roles.length)],
    status: statuses[Math.floor(Math.random() * statuses.length)],
    lastLogin: new Date(Date.now() - Math.random() * 30 * 24 * 60 * 60 * 1000),
    createdAt: new Date(Date.now() - Math.random() * 365 * 24 * 60 * 60 * 1000)
  }));
};

type SortField = keyof User;
type SortDirection = 'asc' | 'desc';

function DataTableExample() {
  const [users] = useState(() => generateUsers(100));
  const [searchQuery, setSearchQuery] = useState('');
  const [sortField, setSortField] = useState<SortField>('name');
  const [sortDirection, setSortDirection] = useState<SortDirection>('asc');
  const [statusFilter, setStatusFilter] = useState<User['status'] | 'all'>('all');
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [selectedUsers, setSelectedUsers] = useState<Set<string>>(new Set());

  // Filtering and sorting logic
  const filteredAndSortedUsers = useMemo(() => {
    let filtered = users.filter(user => {
      const matchesSearch = 
        user.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        user.email.toLowerCase().includes(searchQuery.toLowerCase());
      
      const matchesStatus = statusFilter === 'all' || user.status === statusFilter;
      
      return matchesSearch && matchesStatus;
    });

    // Sort the filtered results
    filtered.sort((a, b) => {
      let aValue: any = a[sortField];
      let bValue: any = b[sortField];
      
      // Handle date fields
      if (aValue instanceof Date) {
        aValue = aValue.getTime();
        bValue = bValue.getTime();
      }
      
      // Handle string fields
      if (typeof aValue === 'string') {
        aValue = aValue.toLowerCase();
        bValue = bValue.toLowerCase();
      }
      
      const result = aValue < bValue ? -1 : aValue > bValue ? 1 : 0;
      return sortDirection === 'asc' ? result : -result;
    });

    return filtered;
  }, [users, searchQuery, statusFilter, sortField, sortDirection]);

  // Pagination
  const totalItems = filteredAndSortedUsers.length;
  const totalPages = Math.ceil(totalItems / pageSize);
  const startIndex = (currentPage - 1) * pageSize;
  const endIndex = Math.min(startIndex + pageSize, totalItems);
  const paginatedUsers = filteredAndSortedUsers.slice(startIndex, endIndex);

  const handleSort = (field: SortField) => {
    if (field === sortField) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortDirection('asc');
    }
  };

  const handleSelectUser = (userId: string, selected: boolean) => {
    const newSelection = new Set(selectedUsers);
    if (selected) {
      newSelection.add(userId);
    } else {
      newSelection.delete(userId);
    }
    setSelectedUsers(newSelection);
  };

  const handleSelectAll = (selected: boolean) => {
    if (selected) {
      setSelectedUsers(new Set(paginatedUsers.map(user => user.id)));
    } else {
      setSelectedUsers(new Set());
    }
  };

  const isAllSelected = paginatedUsers.length > 0 && 
    paginatedUsers.every(user => selectedUsers.has(user.id));
  const isSomeSelected = paginatedUsers.some(user => selectedUsers.has(user.id));

  return (
    <div className="p-6 space-y-6">
      <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Users</h1>
          <p className="text-gray-600">Manage user accounts and permissions</p>
        </div>
        
        <div className="flex gap-3">
          <Button variant="outline">
            Export ({selectedUsers.size})
          </Button>
          <Button variant="primary">
            Add User
          </Button>
        </div>
      </div>

      {/* Filters */}
      <Card className="p-4">
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="flex-1">
            <Input
              placeholder="Search users..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              startIcon={<SearchIcon className="h-4 w-4" />}
            />
          </div>
          
          <div className="flex gap-3">
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value as User['status'] | 'all')}
              className="px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="all">All Status</option>
              <option value="active">Active</option>
              <option value="inactive">Inactive</option>
              <option value="pending">Pending</option>
            </select>
            
            <select
              value={pageSize}
              onChange={(e) => setPageSize(Number(e.target.value))}
              className="px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            >
              <option value={5}>5 per page</option>
              <option value={10}>10 per page</option>
              <option value={25}>25 per page</option>
              <option value={50}>50 per page</option>
            </select>
          </div>
        </div>

        {selectedUsers.size > 0 && (
          <div className="mt-4 p-3 bg-blue-50 border border-blue-200 rounded-md">
            <div className="flex items-center justify-between">
              <span className="text-blue-700">
                {selectedUsers.size} user{selectedUsers.size === 1 ? '' : 's'} selected
              </span>
              <div className="flex gap-2">
                <Button variant="outline" size="sm">
                  Activate
                </Button>
                <Button variant="outline" size="sm">
                  Deactivate
                </Button>
                <Button variant="destructive" size="sm">
                  Delete
                </Button>
              </div>
            </div>
          </div>
        )}
      </Card>

      {/* Table */}
      <Card>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-12">
                <input
                  type="checkbox"
                  checked={isAllSelected}
                  ref={input => {
                    if (input) input.indeterminate = isSomeSelected && !isAllSelected;
                  }}
                  onChange={(e) => handleSelectAll(e.target.checked)}
                  className="h-4 w-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                />
              </TableHead>
              
              <SortableTableHead
                field="name"
                currentField={sortField}
                direction={sortDirection}
                onSort={handleSort}
              >
                Name
              </SortableTableHead>
              
              <SortableTableHead
                field="email"
                currentField={sortField}
                direction={sortDirection}
                onSort={handleSort}
              >
                Email
              </SortableTableHead>
              
              <SortableTableHead
                field="role"
                currentField={sortField}
                direction={sortDirection}
                onSort={handleSort}
              >
                Role
              </SortableTableHead>
              
              <SortableTableHead
                field="status"
                currentField={sortField}
                direction={sortDirection}
                onSort={handleSort}
              >
                Status
              </SortableTableHead>
              
              <SortableTableHead
                field="lastLogin"
                currentField={sortField}
                direction={sortDirection}
                onSort={handleSort}
              >
                Last Login
              </SortableTableHead>
              
              <TableHead>Actions</TableHead>
            </TableRow>
          </TableHeader>
          
          <TableBody>
            {paginatedUsers.map((user) => (
              <TableRow key={user.id}>
                <TableCell>
                  <input
                    type="checkbox"
                    checked={selectedUsers.has(user.id)}
                    onChange={(e) => handleSelectUser(user.id, e.target.checked)}
                    className="h-4 w-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                  />
                </TableCell>
                
                <TableCell>
                  <div className="flex items-center gap-3">
                    <div className="h-8 w-8 bg-gray-300 rounded-full flex items-center justify-center text-sm font-medium">
                      {user.name.split(' ').map(n => n[0]).join('')}
                    </div>
                    <span className="font-medium">{user.name}</span>
                  </div>
                </TableCell>
                
                <TableCell className="text-gray-600">
                  {user.email}
                </TableCell>
                
                <TableCell>
                  <Badge variant={
                    user.role === 'admin' ? 'destructive' :
                    user.role === 'moderator' ? 'warning' : 'default'
                  }>
                    {user.role}
                  </Badge>
                </TableCell>
                
                <TableCell>
                  <Badge variant={
                    user.status === 'active' ? 'success' :
                    user.status === 'pending' ? 'warning' : 'destructive'
                  }>
                    {user.status}
                  </Badge>
                </TableCell>
                
                <TableCell className="text-gray-600">
                  {user.lastLogin.toLocaleDateString()}
                </TableCell>
                
                <TableCell>
                  <div className="flex gap-2">
                    <Button variant="ghost" size="sm">
                      Edit
                    </Button>
                    <Button variant="ghost" size="sm">
                      Delete
                    </Button>
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>

        {paginatedUsers.length === 0 && (
          <div className="text-center py-12">
            <div className="text-gray-500">
              {searchQuery || statusFilter !== 'all' 
                ? 'No users match your filters'
                : 'No users found'
              }
            </div>
          </div>
        )}
      </Card>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-between">
          <div className="text-sm text-gray-600">
            Showing {startIndex + 1} to {endIndex} of {totalItems} results
          </div>
          
          <Pagination
            currentPage={currentPage}
            totalPages={totalPages}
            onPageChange={setCurrentPage}
            showFirstLast
            showPrevNext
            maxVisiblePages={5}
          />
        </div>
      )}
    </div>
  );
}

// Sortable table head component
interface SortableTableHeadProps {
  field: SortField;
  currentField: SortField;
  direction: SortDirection;
  onSort: (field: SortField) => void;
  children: React.ReactNode;
}

function SortableTableHead({ 
  field, 
  currentField, 
  direction, 
  onSort, 
  children 
}: SortableTableHeadProps) {
  const isActive = currentField === field;
  
  return (
    <TableHead>
      <button
        onClick={() => onSort(field)}
        className="flex items-center gap-2 font-medium hover:text-blue-600 transition-colors"
      >
        {children}
        <div className="flex flex-col">
          <ChevronUpIcon 
            className={`h-3 w-3 ${isActive && direction === 'asc' ? 'text-blue-600' : 'text-gray-400'}`}
          />
          <ChevronDownIcon 
            className={`h-3 w-3 -mt-1 ${isActive && direction === 'desc' ? 'text-blue-600' : 'text-gray-400'}`}
          />
        </div>
      </button>
    </TableHead>
  );
}

// Import icons
import {
  SearchIcon,
  ChevronUpIcon,
  ChevronDownIcon
} from '@heroicons/react/24/outline';

export default DataTableExample;
```

## Platform-Specific Features

### Data Attribute Styling

Headless UI components expose data attributes for advanced styling:

```css
/* Button states */
[data-headlessui-state~="open"] { }
[data-headlessui-state~="active"] { }
[data-headlessui-state~="selected"] { }
[data-headlessui-state~="disabled"] { }

/* Custom data attributes from Xaheen components */
[data-variant="primary"] { }
[data-size="lg"] { }
[data-loading="true"] { }

/* Example: Style based on component state */
.xaheen-button[data-variant="primary"][data-headlessui-state~="active"] {
  @apply bg-blue-700 transform scale-95 transition-all;
}

.xaheen-input[data-invalid="true"] {
  @apply border-red-500 ring-red-500;
}

.xaheen-card[data-interactive="true"]:hover {
  @apply shadow-lg transform -translate-y-1 transition-all;
}
```

### Advanced Accessibility Features

```tsx
// Live region announcements
import { useLiveAnnouncer } from '@xaheen/design-system/headless-ui';

function AccessibleForm() {
  const { announce } = useLiveAnnouncer();
  
  const handleSubmit = async () => {
    try {
      await submitForm();
      announce('Form submitted successfully', 'polite');
    } catch (error) {
      announce('Form submission failed', 'assertive');
    }
  };
  
  return (
    <form onSubmit={handleSubmit}>
      {/* Form content */}
    </form>
  );
}

// Focus management
import { useFocusTrap, useFocusReturn } from '@xaheen/design-system/headless-ui';

function Modal({ isOpen, onClose }) {
  const focusTrapRef = useFocusTrap(isOpen);
  useFocusReturn(isOpen);
  
  if (!isOpen) return null;
  
  return (
    <div ref={focusTrapRef} className="modal">
      {/* Modal content with trapped focus */}
    </div>
  );
}

// Keyboard navigation
import { useKeyboardNav } from '@xaheen/design-system/headless-ui';

function NavigableList({ items }) {
  const { activeIndex, keyboardProps } = useKeyboardNav({
    items,
    loop: true,
    orientation: 'vertical',
    onSelect: (index) => handleItemSelect(items[index])
  });
  
  return (
    <ul {...keyboardProps}>
      {items.map((item, index) => (
        <li 
          key={item.id}
          data-active={index === activeIndex}
          className="data-[active=true]:bg-blue-100"
        >
          {item.label}
        </li>
      ))}
    </ul>
  );
}
```

### Integration with Headless UI Primitives

```tsx
import React from 'react';
import { 
  Dialog, 
  Transition, 
  Menu,
  Popover,
  Switch,
  RadioGroup,
  Listbox
} from '@headlessui/react';
import {
  Button,
  Input,
  Card,
  CardHeader,
  CardContent,
  CardFooter
} from '@xaheen/design-system/headless-ui';

// Modal dialog with Xaheen components
function ModalExample() {
  const [isOpen, setIsOpen] = useState(false);
  
  return (
    <>
      <Button onClick={() => setIsOpen(true)}>
        Open Modal
      </Button>

      <Transition appear show={isOpen} as={React.Fragment}>
        <Dialog as="div" className="relative z-10" onClose={() => setIsOpen(false)}>
          <Transition.Child
            as={React.Fragment}
            enter="ease-out duration-300"
            enterFrom="opacity-0"
            enterTo="opacity-100"
            leave="ease-in duration-200"
            leaveFrom="opacity-100"
            leaveTo="opacity-0"
          >
            <div className="fixed inset-0 bg-black bg-opacity-25" />
          </Transition.Child>

          <div className="fixed inset-0 overflow-y-auto">
            <div className="flex min-h-full items-center justify-center p-4 text-center">
              <Transition.Child
                as={React.Fragment}
                enter="ease-out duration-300"
                enterFrom="opacity-0 scale-95"
                enterTo="opacity-100 scale-100"
                leave="ease-in duration-200"
                leaveFrom="opacity-100 scale-100"
                leaveTo="opacity-0 scale-95"
              >
                <Dialog.Panel className="w-full max-w-md">
                  <Card variant="elevated">
                    <CardHeader title="Confirm Action" />
                    <CardContent>
                      <p>Are you sure you want to proceed with this action?</p>
                    </CardContent>
                    <CardFooter className="flex justify-end space-x-3">
                      <Button variant="outline" onClick={() => setIsOpen(false)}>
                        Cancel
                      </Button>
                      <Button variant="primary" onClick={() => setIsOpen(false)}>
                        Confirm
                      </Button>
                    </CardFooter>
                  </Card>
                </Dialog.Panel>
              </Transition.Child>
            </div>
          </div>
        </Dialog>
      </Transition>
    </>
  );
}

// Dropdown menu with Xaheen button
function DropdownMenu() {
  return (
    <Menu as="div" className="relative inline-block text-left">
      <div>
        <Menu.Button as={Button} variant="outline">
          Options
          <ChevronDownIcon className="h-4 w-4 ml-2" />
        </Menu.Button>
      </div>

      <Transition
        as={React.Fragment}
        enter="transition ease-out duration-100"
        enterFrom="transform opacity-0 scale-95"
        enterTo="transform opacity-100 scale-100"
        leave="transition ease-in duration-75"
        leaveFrom="transform opacity-100 scale-100"
        leaveTo="transform opacity-0 scale-95"
      >
        <Menu.Items className="absolute right-0 mt-2 w-56 origin-top-right bg-white rounded-md shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none">
          <div className="py-1">
            <Menu.Item>
              {({ active }) => (
                <a
                  href="#"
                  className={`${
                    active ? 'bg-gray-100 text-gray-900' : 'text-gray-700'
                  } block px-4 py-2 text-sm`}
                >
                  Account settings
                </a>
              )}
            </Menu.Item>
            <Menu.Item>
              {({ active }) => (
                <a
                  href="#"
                  className={`${
                    active ? 'bg-gray-100 text-gray-900' : 'text-gray-700'
                  } block px-4 py-2 text-sm`}
                >
                  Support
                </a>
              )}
            </Menu.Item>
          </div>
        </Menu.Items>
      </Transition>
    </Menu>
  );
}

// Form with Headless UI form elements
function HeadlessUIForm() {
  const [selectedPlan, setSelectedPlan] = useState('starter');
  const [notifications, setNotifications] = useState(true);
  
  const plans = [
    { id: 'starter', name: 'Starter', price: '$9/month' },
    { id: 'professional', name: 'Professional', price: '$29/month' },
    { id: 'enterprise', name: 'Enterprise', price: '$99/month' }
  ];

  return (
    <Card className="max-w-md mx-auto">
      <CardHeader title="Subscription Settings" />
      <CardContent className="space-y-6">
        {/* Radio group */}
        <div>
          <label className="text-sm font-medium text-gray-700 mb-3 block">
            Choose Plan
          </label>
          <RadioGroup value={selectedPlan} onChange={setSelectedPlan}>
            <div className="space-y-2">
              {plans.map((plan) => (
                <RadioGroup.Option
                  key={plan.id}
                  value={plan.id}
                  className={({ active, checked }) =>
                    `${active ? 'ring-2 ring-blue-500' : ''}
                     ${checked ? 'bg-blue-50 border-blue-500' : 'bg-white border-gray-300'}
                     relative flex cursor-pointer rounded-lg px-5 py-4 shadow-md border focus:outline-none`
                  }
                >
                  {({ checked }) => (
                    <>
                      <div className="flex w-full items-center justify-between">
                        <div className="flex items-center">
                          <div className="text-sm">
                            <RadioGroup.Label
                              as="p"
                              className={`font-medium ${
                                checked ? 'text-blue-900' : 'text-gray-900'
                              }`}
                            >
                              {plan.name}
                            </RadioGroup.Label>
                            <RadioGroup.Description
                              as="span"
                              className={`inline ${
                                checked ? 'text-blue-700' : 'text-gray-500'
                              }`}
                            >
                              {plan.price}
                            </RadioGroup.Description>
                          </div>
                        </div>
                        {checked && (
                          <div className="shrink-0 text-blue-600">
                            <CheckIcon className="h-6 w-6" />
                          </div>
                        )}
                      </div>
                    </>
                  )}
                </RadioGroup.Option>
              ))}
            </div>
          </RadioGroup>
        </div>

        {/* Switch */}
        <div className="flex items-center justify-between">
          <span className="text-sm font-medium text-gray-700">
            Email Notifications
          </span>
          <Switch
            checked={notifications}
            onChange={setNotifications}
            className={`${notifications ? 'bg-blue-600' : 'bg-gray-200'}
              relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2`}
          >
            <span
              className={`${notifications ? 'translate-x-6' : 'translate-x-1'}
                inline-block h-4 w-4 transform rounded-full bg-white transition-transform`}
            />
          </Switch>
        </div>

        {/* Input field */}
        <Input
          label="Billing Email"
          type="email"
          placeholder="billing@company.com"
          helperText="Invoices will be sent to this email address"
        />
      </CardContent>
      
      <CardFooter>
        <Button variant="primary" className="w-full">
          Update Subscription
        </Button>
      </CardFooter>
    </Card>
  );
}

import { CheckIcon, ChevronDownIcon } from '@heroicons/react/24/outline';
```

## Best Practices

### 1. Accessibility First

```tsx
// Always provide proper labels and descriptions
<Input
  label="Email Address"
  aria-describedby="email-help"
  required
  error={emailError}
/>
<div id="email-help" className="sr-only">
  We'll use this to send you important updates
</div>

// Use semantic HTML elements
<main role="main">
  <section aria-labelledby="main-heading">
    <h1 id="main-heading">Dashboard</h1>
    {/* Content */}
  </section>
</main>

// Provide keyboard navigation
<Card
  clickable
  onKeyDown={(e) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      handleCardClick();
    }
  }}
  tabIndex={0}
  role="button"
  aria-label="View product details"
>
```

### 2. Composition over Configuration

```tsx
// ✅ Good - Flexible composition
<Card variant="elevated">
  <CardHeader 
    title="User Profile"
    actions={<EditButton />}
  />
  <CardContent>
    <UserDetails user={user} />
  </CardContent>
  <CardFooter>
    <SaveButton />
    <CancelButton />
  </CardFooter>
</Card>

// ❌ Avoid - Too many props
<Card 
  title="User Profile"
  showEditButton
  userDetails={user}
  onSave={handleSave}
  onCancel={handleCancel}
  saveButtonText="Save"
  cancelButtonText="Cancel"
/>
```

### 3. Performance Optimization

```tsx
// Use React.memo for expensive components
const ExpensiveCard = React.memo(({ data }) => {
  const processedData = useMemo(() => {
    return processExpensiveData(data);
  }, [data]);

  return (
    <Card>
      {/* Render processed data */}
    </Card>
  );
});

// Lazy load heavy components
const HeavyModal = lazy(() => import('./HeavyModal'));

function App() {
  return (
    <Suspense fallback={<LoadingSpinner />}>
      <HeavyModal />
    </Suspense>
  );
}
```

### 4. Type Safety

```tsx
// Define strict types for component props
interface UserCardProps {
  user: {
    id: string;
    name: string;
    email: string;
    role: 'admin' | 'user' | 'moderator';
  };
  onEdit?: (user: UserCardProps['user']) => void;
  onDelete?: (userId: string) => void;
}

const UserCard: React.FC<UserCardProps> = ({ user, onEdit, onDelete }) => {
  return (
    <Card>
      {/* Component content */}
    </Card>
  );
};

// Use generic types for reusable components
interface DataTableProps<T> {
  data: T[];
  columns: Column<T>[];
  onRowClick?: (item: T) => void;
}

function DataTable<T>({ data, columns, onRowClick }: DataTableProps<T>) {
  // Implementation
}
```

## Migration Guide

### From Headless UI Components to Xaheen Headless UI

```tsx
// Before (Plain Headless UI)
import { Dialog, Transition } from '@headlessui/react';

function MyModal({ isOpen, onClose, title, children }) {
  return (
    <Transition appear show={isOpen}>
      <Dialog onClose={onClose}>
        <Transition.Child>
          <div className="fixed inset-0 bg-black bg-opacity-25" />
        </Transition.Child>
        <Transition.Child>
          <Dialog.Panel className="...custom-styles...">
            <Dialog.Title>{title}</Dialog.Title>
            {children}
          </Dialog.Panel>
        </Transition.Child>
      </Dialog>
    </Transition>
  );
}

// After (Xaheen Headless UI)
import { Dialog } from '@headlessui/react';
import { Card, CardHeader, CardContent } from '@xaheen/design-system/headless-ui';

function MyModal({ isOpen, onClose, title, children }) {
  return (
    <Dialog open={isOpen} onClose={onClose}>
      <div className="fixed inset-0 bg-black bg-opacity-25" />
      <div className="fixed inset-0 overflow-y-auto">
        <div className="flex min-h-full items-center justify-center p-4">
          <Dialog.Panel as={Card} variant="elevated" className="max-w-md">
            <CardHeader title={title} />
            <CardContent>
              {children}
            </CardContent>
          </Dialog.Panel>
        </div>
      </div>
    </Dialog>
  );
}
```

### From Styled Component Libraries

```tsx
// Before (Material-UI)
import { 
  Button, 
  TextField, 
  Card, 
  CardContent, 
  CardActions 
} from '@mui/material';

function MyForm() {
  return (
    <Card>
      <CardContent>
        <TextField label="Email" variant="outlined" fullWidth />
      </CardContent>
      <CardActions>
        <Button variant="contained" color="primary">
          Submit
        </Button>
      </CardActions>
    </Card>
  );
}

// After (Xaheen Headless UI)
import {
  Button,
  Input,
  Card,
  CardContent,
  CardFooter
} from '@xaheen/design-system/headless-ui';

function MyForm() {
  return (
    <Card variant="elevated">
      <CardContent>
        <Input label="Email" required />
      </CardContent>
      <CardFooter>
        <Button variant="primary">
          Submit
        </Button>
      </CardFooter>
    </Card>
  );
}
```

### Migration Checklist

1. **Update Imports**
   - Replace component library imports with Xaheen Headless UI
   - Add HeadlessUIProvider wrapper

2. **Convert Props**
   - Map existing props to Xaheen equivalents
   - Update event handlers and callbacks

3. **Styling Migration**
   - Remove theme providers and custom styling
   - Use CVA variants and data attributes
   - Apply design tokens and CSS variables

4. **Accessibility Audit**
   - Verify ARIA attributes are properly set
   - Test keyboard navigation
   - Validate screen reader compatibility

## Troubleshooting

### Common Issues

#### 1. TypeScript Errors with Headless UI Integration

```typescript
// Problem: Type conflicts between Headless UI and Xaheen components
// Solution: Use proper type assertions and component composition

// ❌ This might cause type issues
<Menu.Button as={Button} variant="primary" />

// ✅ Use proper composition
<Menu.Button as="div">
  <Button variant="primary">Menu</Button>
</Menu.Button>

// ✅ Or use forwarded refs
const MenuButton = forwardRef<HTMLButtonElement, ButtonProps>(
  (props, ref) => <Button ref={ref} {...props} />
);

<Menu.Button as={MenuButton} variant="primary" />
```

#### 2. Focus Management Issues

```typescript
// Problem: Focus not properly managed in complex components
// Solution: Use focus management hooks

import { useFocusManager } from '@xaheen/design-system/headless-ui';

function ComplexComponent() {
  const { focusFirst, focusLast, focusNext, focusPrevious } = useFocusManager({
    selector: '[data-focusable="true"]',
    wrap: true
  });

  useEffect(() => {
    // Focus first focusable element on mount
    focusFirst();
  }, [focusFirst]);

  return (
    <div onKeyDown={handleKeyDown}>
      {/* Focusable elements with data-focusable="true" */}
    </div>
  );
}
```

#### 3. Styling Not Applied Correctly

```css
/* Problem: CVA styles not working as expected */
/* Solution: Ensure proper class name composition */

/* ❌ Conflicting classes */
.button.bg-blue-500.bg-red-500 {
  /* red wins due to source order */
}

/* ✅ Use CVA properly */
.button-primary {
  @apply bg-blue-500;
}

.button-danger {
  @apply bg-red-500;
}
```

#### 4. Event Handler Conflicts

```typescript
// Problem: Event handlers not working with compound components
// Solution: Proper event delegation and bubbling

function InteractiveCard({ onClick, children }) {
  const handleClick = (event) => {
    // Don't trigger if click is on interactive element
    if (event.target.closest('button, a, input')) {
      return;
    }
    
    onClick?.(event);
  };

  return (
    <Card onClick={handleClick}>
      {children}
    </Card>
  );
}
```

### Performance Issues

#### Bundle Size Optimization

```typescript
// Use dynamic imports for large components
const LazyDataTable = lazy(() => 
  import('@xaheen/design-system/headless-ui').then(module => ({
    default: module.DataTable
  }))
);

// Tree-shake unused components
import { Button } from '@xaheen/design-system/headless-ui/button';
import { Input } from '@xaheen/design-system/headless-ui/input';

// Instead of importing everything
// import * as UI from '@xaheen/design-system/headless-ui';
```

For more help:
- [Headless UI Documentation](https://headlessui.com/)
- [React Hook Form](https://react-hook-form.com/)
- [CVA Documentation](https://cva.style/)
- [Xaheen GitHub Issues](https://github.com/xaheen-org/design-system/issues)

## Conclusion

The Xaheen Design System Headless UI platform provides the most accessible and flexible component solution available. By combining Headless UI's accessibility expertise with Xaheen's design consistency, you get components that are both fully accessible and completely customizable.

Key advantages include:
- **Maximum Accessibility**: WCAG AAA compliance out of the box
- **Complete Flexibility**: Style components exactly as needed
- **Advanced Interactions**: Sophisticated state management and event handling
- **Type Safety**: Full TypeScript support with strict typing
- **Performance**: Optimized rendering and minimal bundle size

Whether building a simple website or a complex application, Xaheen Headless UI components provide the foundation for creating inclusive, performant, and maintainable user interfaces that work for everyone.