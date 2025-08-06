# 📱 Ionic Platform Guide

## Overview

The Xaheen Design System Ionic platform provides mobile-first components that automatically adapt to iOS and Android design languages while maintaining consistency with the universal design system. Build native-feeling mobile applications with progressive web app capabilities.

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

### ✅ Mobile-First Design
- Optimized for touch interactions and mobile devices
- Native iOS and Android styling with automatic platform detection
- Hardware-accelerated animations and gestures

### ✅ Cross-Platform Compatibility
- Single codebase for iOS, Android, PWA, and desktop
- Platform-specific UI adaptations automatically applied
- Consistent behavior across all platforms

### ✅ Native Device Integration
- Haptic feedback support on supported devices
- Keyboard and status bar management
- Camera, geolocation, and other native capabilities via Capacitor

### ✅ Performance Optimized
- Virtual scrolling for large lists
- Efficient change detection
- Minimal bundle size with tree-shaking

## Installation

### Prerequisites

```bash
# Install Ionic CLI
npm install -g @ionic/cli

# Create new Ionic React project
ionic start myApp tabs --type=react --capacitor
cd myApp
```

### Core Dependencies

```bash
# Install Xaheen Design System with Ionic support
npm install @xaheen-ai/design-system @ionic/react @ionic/core ionicons

# Or with yarn
yarn add @xaheen-ai/design-system @ionic/react @ionic/core ionicons

# Or with pnpm
pnpm add @xaheen-ai/design-system @ionic/react @ionic/core ionicons
```

### Native Development Setup

```bash
# Install Capacitor for native functionality
npm install @capacitor/core @capacitor/cli

# Add platforms
npx cap add ios
npx cap add android

# Install common plugins
npm install @capacitor/haptics @capacitor/keyboard @capacitor/status-bar @capacitor/splash-screen
```

## Basic Usage

### App Setup

```tsx
// App.tsx
import React from 'react';
import { IonApp, IonRouterOutlet, setupIonicReact } from '@ionic/react';
import { IonReactRouter } from '@ionic/react-router';
import { Route } from 'react-router-dom';

// Import Ionic CSS
import '@ionic/react/css/core.css';
import '@ionic/react/css/normalize.css';
import '@ionic/react/css/structure.css';
import '@ionic/react/css/typography.css';

// Optional: Import Ionic theme variables
import '@ionic/react/css/padding.css';
import '@ionic/react/css/float-elements.css';
import '@ionic/react/css/text-alignment.css';
import '@ionic/react/css/text-transformation.css';
import '@ionic/react/css/flex-utils.css';
import '@ionic/react/css/display.css';

// Import Xaheen Ionic components
import { IonicProvider } from '@xaheen-ai/design-system/ionic';

// Import your pages
import Home from './pages/Home';
import Profile from './pages/Profile';

// Setup Ionic
setupIonicReact({
  mode: 'ios', // or 'md' for Material Design
  animated: true,
  rippleEffect: true,
  swipeBackEnabled: true
});

const App: React.FC = () => (
  <IonApp>
    <IonicProvider
      config={{
        mode: 'auto', // Auto-detect platform
        theme: 'auto', // Auto-detect system theme
        haptics: true, // Enable haptic feedback
        animations: true, // Enable animations
        accessibility: {
          announcements: true,
          focusManagement: true
        }
      }}
    >
      <IonReactRouter>
        <IonRouterOutlet>
          <Route exact path="/home" component={Home} />
          <Route exact path="/profile" component={Profile} />
          <Route exact path="/" render={() => <Redirect to="/home" />} />
        </IonRouterOutlet>
      </IonReactRouter>
    </IonicProvider>
  </IonApp>
);

export default App;
```

### Basic Page Structure

```tsx
// pages/Home.tsx
import React, { useState } from 'react';
import {
  IonContent,
  IonHeader,
  IonPage,
  IonTitle,
  IonToolbar,
  IonRefresher,
  IonRefresherContent
} from '@ionic/react';

import {
  Button,
  Input,
  Card,
  SearchInput,
  useIonicPlatform,
  useHaptics
} from '@xaheen-ai/design-system/ionic';

const Home: React.FC = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [email, setEmail] = useState('');
  
  const platform = useIonicPlatform();
  const haptics = useHaptics();

  const handleSearch = async (query: string) => {
    await haptics.impact({ style: 'light' });
    setSearchQuery(query);
    // Perform search
  };

  const handleSubmit = async () => {
    await haptics.impact({ style: 'medium' });
    // Submit form
  };

  const handleRefresh = async (event: CustomEvent) => {
    setTimeout(() => {
      event.detail.complete();
    }, 2000);
  };

  return (
    <IonPage>
      <IonHeader>
        <IonToolbar>
          <IonTitle>Welcome</IonTitle>
        </IonToolbar>
      </IonHeader>
      
      <IonContent fullscreen>
        <IonRefresher slot="fixed" onIonRefresh={handleRefresh}>
          <IonRefresherContent></IonRefresherContent>
        </IonRefresher>

        <div className="p-4 space-y-4">
          {/* Platform detection example */}
          <Card variant="elevated" padding="md">
            <h2>Platform: {platform.platforms.join(', ')}</h2>
            <p>Running on {platform.isIOS ? 'iOS' : platform.isAndroid ? 'Android' : 'Web'}</p>
          </Card>

          {/* Search input */}
          <SearchInput
            placeholder="Search something..."
            value={searchQuery}
            onIonInput={(e) => handleSearch(e.detail.value!)}
            clearInput
            showClearButton="focus"
          />

          {/* Form input */}
          <Input
            label="Email Address"
            type="email"
            labelPlacement="floating"
            value={email}
            onIonInput={(e) => setEmail(e.detail.value!)}
            clearInput
            errorText=""
            helperText="We'll never share your email"
          />

          {/* Action button */}
          <Button
            variant="primary"
            size="lg"
            expand="block"
            haptic="medium"
            onClick={handleSubmit}
          >
            Get Started
          </Button>
        </div>
      </IonContent>
    </IonPage>
  );
};

export default Home;
```

## Core Components

### IonicButton

Enhanced button component with haptic feedback and platform-specific styling.

```tsx
import { Button, FAB, SegmentButton, TabButton } from '@xaheen-ai/design-system/ionic';

function ButtonExamples() {
  return (
    <div className="space-y-4">
      {/* Basic buttons */}
      <Button variant="primary" size="md" haptic="light">
        Primary Button
      </Button>
      
      <Button variant="secondary" size="lg" expand="block">
        Full Width Button
      </Button>
      
      <Button variant="outline" disabled>
        Disabled Button
      </Button>

      {/* Button with icons */}
      <Button 
        variant="primary" 
        startIcon="add" 
        endIcon="chevron-forward"
      >
        Add Item
      </Button>

      {/* Loading button */}
      <Button variant="primary" loading>
        Processing...
      </Button>

      {/* Floating Action Button */}
      <FAB 
        position="bottom-right"
        color="primary"
        onClick={handleFABClick}
      >
        <ion-icon name="add"></ion-icon>
      </FAB>

      {/* Segment button */}
      <div className="flex">
        <SegmentButton selected>Day</SegmentButton>
        <SegmentButton>Week</SegmentButton>
        <SegmentButton>Month</SegmentButton>
      </div>

      {/* Tab button */}
      <div className="flex justify-around">
        <TabButton 
          active 
          icon="home" 
          label="Home" 
          badge="3"
        />
        <TabButton 
          icon="notifications" 
          label="Alerts"
        />
        <TabButton 
          icon="person" 
          label="Profile"
        />
      </div>
    </div>
  );
}
```

**Props:**
- `variant`: `primary` | `secondary` | `tertiary` | `success` | `warning` | `danger` | `clear` | `outline`
- `size`: `small` | `default` | `large`
- `expand`: `full` | `block`
- `fill`: `clear` | `outline` | `solid`
- `shape`: `round`
- `strong`: boolean - Bold text
- `haptic`: `light` | `medium` | `heavy` - Haptic feedback style
- `disabled`: boolean
- `loading`: boolean

### IonicInput

Form input with floating labels and Ionic-specific features.

```tsx
import { 
  Input, 
  SearchInput, 
  TextArea, 
  PinInput,
  CurrencyInput,
  PhoneInput 
} from '@xaheen-ai/design-system/ionic';

function InputExamples() {
  return (
    <div className="space-y-4">
      {/* Basic input with floating label */}
      <Input
        label="Full Name"
        labelPlacement="floating"
        placeholder="Enter your name"
        clearInput
        counter
        maxlength={50}
      />

      {/* Email input with validation */}
      <Input
        type="email"
        label="Email Address"
        labelPlacement="stacked"
        placeholder="your@email.com"
        errorText="Please enter a valid email"
        helperText="We'll never share your email"
        clearInput
      />

      {/* Password input */}
      <Input
        type="password"
        label="Password"
        labelPlacement="floating"
        togglePassword
        minlength={8}
        counter
        helperText="Minimum 8 characters"
      />

      {/* Search input */}
      <SearchInput
        placeholder="Search products..."
        debounce={300}
        showClearButton="focus"
        showCancelButton="focus"
        onIonInput={(e) => handleSearch(e.detail.value!)}
        onIonCancel={() => handleCancelSearch()}
      />

      {/* Textarea */}
      <TextArea
        label="Message"
        labelPlacement="stacked"
        placeholder="Enter your message..."
        rows={4}
        maxlength={500}
        counter
        autoGrow
      />

      {/* PIN input */}
      <PinInput
        label="Enter PIN"
        length={6}
        type="password"
        haptic="light"
        onComplete={(pin) => handlePinComplete(pin)}
      />

      {/* Currency input */}
      <CurrencyInput
        label="Amount"
        currency="USD"
        locale="en-US"
        min={0}
        max={10000}
        helperText="Minimum $10 required"
      />

      {/* Phone input */}
      <PhoneInput
        label="Phone Number"
        defaultCountry="US"
        onCountryChange={(country) => console.log('Country:', country)}
        formatAsTyping
      />
    </div>
  );
}
```

**Props:**
- `type`: Standard HTML input types plus `search`, `tel`, `url`
- `label`: string - Input label
- `labelPlacement`: `start` | `end` | `floating` | `stacked` | `fixed`
- `placeholder`: string
- `clearInput`: boolean - Show clear button
- `togglePassword`: boolean - Show/hide password toggle
- `counter`: boolean - Show character counter
- `debounce`: number - Debounce time for input events
- `errorText`: string - Error message
- `helperText`: string - Helper text

### IonicCard

Flexible card component with platform-specific styling and interactions.

```tsx
import { 
  Card, 
  ProductCard, 
  ProfileCard, 
  MediaCard,
  StatCard,
  InteractiveCard 
} from '@xaheen-ai/design-system/ionic';

function CardExamples() {
  return (
    <div className="space-y-4">
      {/* Basic card */}
      <Card 
        variant="elevated"
        padding="md"
        swipeGesture
        onSwipeStart={() => console.log('Swipe started')}
        onSwipeEnd={() => console.log('Swipe ended')}
      >
        <h3>Card Title</h3>
        <p>This is a basic card with content.</p>
      </Card>

      {/* Interactive card */}
      <InteractiveCard
        onClick={() => navigate('/details')}
        haptic="light"
      >
        <div className="flex items-center space-x-4">
          <ion-avatar>
            <img src="avatar.jpg" alt="User" />
          </ion-avatar>
          <div>
            <h4>John Doe</h4>
            <p>Software Engineer</p>
          </div>
        </div>
      </InteractiveCard>

      {/* Product card */}
      <ProductCard
        product={{
          id: '1',
          name: 'iPhone 15 Pro',
          price: '$999.99',
          originalPrice: '$1099.99',
          image: 'iphone.jpg',
          rating: 4.8,
          reviewCount: 1234,
          discount: '-10%',
          inStock: true,
          badges: ['New', 'Popular']
        }}
        onAddToCart={(product) => handleAddToCart(product)}
        onAddToWishlist={(product) => handleAddToWishlist(product)}
        onViewDetails={(product) => handleViewDetails(product)}
      />

      {/* Profile card */}
      <ProfileCard
        profile={{
          id: '1',
          name: 'Jane Smith',
          title: 'UX Designer',
          avatar: 'jane.jpg',
          bio: 'Creating beautiful and intuitive user experiences',
          location: 'San Francisco, CA',
          stats: [
            { label: 'Followers', value: '2.1K' },
            { label: 'Following', value: '483' },
            { label: 'Projects', value: '24' }
          ],
          badges: ['Pro', 'Verified'],
          isFollowing: false
        }}
        onFollow={(profile) => handleFollow(profile)}
        onMessage={(profile) => handleMessage(profile)}
        onViewProfile={(profile) => handleViewProfile(profile)}
      />

      {/* Media card */}
      <MediaCard
        media={{
          type: 'video',
          thumbnail: 'video-thumb.jpg',
          url: 'video.mp4',
          duration: '2:34',
          title: 'How to Build Great Apps',
          description: 'Learn the fundamentals...',
          author: 'Tech Channel',
          views: '15K',
          publishedAt: '2 days ago'
        }}
        onPlay={(media) => handlePlayVideo(media)}
        onShare={(media) => handleShareVideo(media)}
      />

      {/* Stat cards */}
      <div className="grid grid-cols-2 gap-4">
        <StatCard
          label="Monthly Revenue"
          value="$24,567"
          trend="up"
          trendValue="+12.5%"
          color="success"
          icon="trending-up"
        />
        
        <StatCard
          label="Active Users"
          value="1,234"
          trend="down"
          trendValue="-2.1%"
          color="warning"
          icon="people"
        />
      </div>
    </div>
  );
}
```

**Props:**
- `variant`: `default` | `outlined` | `filled` | `elevated`
- `padding`: `none` | `xs` | `sm` | `md` | `lg` | `xl`
- `swipeGesture`: boolean - Enable swipe gestures
- `haptic`: `light` | `medium` | `heavy` - Haptic feedback on interactions
- `onClick`: function - Click handler with haptic feedback
- `onSwipeStart`: function - Swipe gesture started
- `onSwipeEnd`: function - Swipe gesture ended

## Advanced Patterns

### List Management with Virtual Scrolling

```tsx
import React, { useState, useEffect } from 'react';
import { 
  IonContent, 
  IonList, 
  IonVirtualScroll,
  IonInfiniteScroll,
  IonInfiniteScrollContent,
  IonRefresher,
  IonRefresherContent
} from '@ionic/react';

import { 
  Card, 
  SearchInput, 
  LoadingSpinner,
  useIonicPlatform,
  useHaptics 
} from '@xaheen-ai/design-system/ionic';

interface ListItem {
  id: string;
  title: string;
  description: string;
  image?: string;
  date: string;
}

const VirtualList: React.FC = () => {
  const [items, setItems] = useState<ListItem[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(false);
  const [hasMore, setHasMore] = useState(true);
  
  const platform = useIonicPlatform();
  const haptics = useHaptics();

  useEffect(() => {
    loadInitialItems();
  }, []);

  const loadInitialItems = async () => {
    setLoading(true);
    try {
      const newItems = await fetchItems(0, 50);
      setItems(newItems);
    } catch (error) {
      console.error('Failed to load items:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadMoreItems = async (event: CustomEvent) => {
    try {
      const newItems = await fetchItems(items.length, 25);
      setItems(prev => [...prev, ...newItems]);
      setHasMore(newItems.length === 25);
    } catch (error) {
      console.error('Failed to load more items:', error);
    } finally {
      (event.target as HTMLIonInfiniteScrollElement).complete();
    }
  };

  const handleRefresh = async (event: CustomEvent) => {
    await haptics.impact({ style: 'light' });
    try {
      const refreshedItems = await fetchItems(0, 50);
      setItems(refreshedItems);
    } catch (error) {
      console.error('Failed to refresh:', error);
    } finally {
      (event.target as HTMLIonRefresherElement).complete();
    }
  };

  const handleSearch = async (query: string) => {
    setSearchQuery(query);
    if (query.trim()) {
      setLoading(true);
      try {
        const searchResults = await searchItems(query);
        setItems(searchResults);
        setHasMore(false);
      } catch (error) {
        console.error('Search failed:', error);
      } finally {
        setLoading(false);
      }
    } else {
      loadInitialItems();
    }
  };

  const handleItemClick = async (item: ListItem) => {
    await haptics.impact({ style: 'medium' });
    // Navigate or show details
    console.log('Item clicked:', item);
  };

  const filteredItems = searchQuery 
    ? items.filter(item => 
        item.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.description.toLowerCase().includes(searchQuery.toLowerCase())
      )
    : items;

  return (
    <IonContent>
      <IonRefresher slot="fixed" onIonRefresh={handleRefresh}>
        <IonRefresherContent></IonRefresherContent>
      </IonRefresher>

      <div className="p-4">
        <SearchInput
          placeholder="Search items..."
          value={searchQuery}
          onIonInput={(e) => handleSearch(e.detail.value!)}
          debounce={300}
          clearInput
          showClearButton="focus"
        />
      </div>

      {loading && items.length === 0 ? (
        <div className="flex justify-center p-8">
          <LoadingSpinner size="large" />
        </div>
      ) : (
        <IonList>
          <IonVirtualScroll
            items={filteredItems}
            approxItemHeight={120}
            renderItem={(item, index) => (
              <Card
                key={item.id}
                variant="default"
                padding="md"
                className="mx-4 mb-4"
                onClick={() => handleItemClick(item)}
                haptic="light"
              >
                <div className="flex items-start space-x-4">
                  {item.image && (
                    <img 
                      src={item.image} 
                      alt={item.title}
                      className="w-16 h-16 rounded-lg object-cover"
                    />
                  )}
                  <div className="flex-1">
                    <h3 className="font-semibold text-lg">{item.title}</h3>
                    <p className="text-gray-600 text-sm mt-1">{item.description}</p>
                    <p className="text-gray-500 text-xs mt-2">{item.date}</p>
                  </div>
                </div>
              </Card>
            )}
          />
        </IonList>
      )}

      {!searchQuery && hasMore && (
        <IonInfiniteScroll onIonInfinite={loadMoreItems}>
          <IonInfiniteScrollContent loadingText="Loading more items...">
          </IonInfiniteScrollContent>
        </IonInfiniteScroll>
      )}
    </IonContent>
  );
};

// Mock API functions
async function fetchItems(offset: number, limit: number): Promise<ListItem[]> {
  // Simulate API delay
  await new Promise(resolve => setTimeout(resolve, 1000));
  
  return Array.from({ length: limit }, (_, i) => ({
    id: `item-${offset + i}`,
    title: `Item ${offset + i + 1}`,
    description: `Description for item ${offset + i + 1}`,
    image: `https://picsum.photos/64/64?random=${offset + i}`,
    date: new Date(Date.now() - Math.random() * 30 * 24 * 60 * 60 * 1000).toLocaleDateString()
  }));
}

async function searchItems(query: string): Promise<ListItem[]> {
  await new Promise(resolve => setTimeout(resolve, 500));
  
  // Mock search results
  return Array.from({ length: Math.floor(Math.random() * 20) + 5 }, (_, i) => ({
    id: `search-${i}`,
    title: `${query} Result ${i + 1}`,
    description: `Search result containing "${query}"`,
    image: `https://picsum.photos/64/64?random=search${i}`,
    date: new Date().toLocaleDateString()
  }));
}

export default VirtualList;
```

### Navigation with Tabs and Modals

```tsx
import React, { useState } from 'react';
import {
  IonTabs,
  IonTabBar,
  IonTabButton,
  IonIcon,
  IonLabel,
  IonBadge,
  IonModal,
  IonHeader,
  IonToolbar,
  IonTitle,
  IonContent,
  IonButtons,
  IonButton
} from '@ionic/react';
import {
  home,
  search,
  heart,
  person,
  notifications,
  add
} from 'ionicons/icons';

import {
  Button,
  Input,
  Card,
  FAB,
  useIonicPlatform,
  useHaptics
} from '@xaheen-ai/design-system/ionic';

const TabsExample: React.FC = () => {
  const [selectedTab, setSelectedTab] = useState('home');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [notificationCount, setNotificationCount] = useState(3);
  
  const platform = useIonicPlatform();
  const haptics = useHaptics();

  const handleTabChange = async (tab: string) => {
    await haptics.impact({ style: 'light' });
    setSelectedTab(tab);
  };

  const handleFABClick = async () => {
    await haptics.impact({ style: 'medium' });
    setIsModalOpen(true);
  };

  const handleModalDismiss = async () => {
    await haptics.impact({ style: 'light' });
    setIsModalOpen(false);
  };

  return (
    <>
      <IonTabs>
        <IonTabBar 
          slot="bottom" 
          selectedTab={selectedTab}
          onIonTabsDidChange={(e) => handleTabChange(e.detail.tab)}
        >
          <IonTabButton tab="home" href="/home">
            <IonIcon icon={home} />
            <IonLabel>Home</IonLabel>
          </IonTabButton>

          <IonTabButton tab="search" href="/search">
            <IonIcon icon={search} />
            <IonLabel>Search</IonLabel>
          </IonTabButton>

          <IonTabButton tab="favorites" href="/favorites">
            <IonIcon icon={heart} />
            <IonLabel>Favorites</IonLabel>
          </IonTabButton>

          <IonTabButton tab="notifications" href="/notifications">
            <IonIcon icon={notifications} />
            <IonLabel>Notifications</IonLabel>
            {notificationCount > 0 && (
              <IonBadge color="danger">{notificationCount}</IonBadge>
            )}
          </IonTabButton>

          <IonTabButton tab="profile" href="/profile">
            <IonIcon icon={person} />
            <IonLabel>Profile</IonLabel>
          </IonTabButton>
        </IonTabBar>
      </IonTabs>

      {/* Floating Action Button */}
      <FAB
        position="bottom-right"
        color="primary"
        onClick={handleFABClick}
        className="mb-16" // Space above tab bar
      >
        <IonIcon icon={add} />
      </FAB>

      {/* Modal */}
      <IonModal 
        isOpen={isModalOpen} 
        onDidDismiss={handleModalDismiss}
        initialBreakpoint={0.5}
        breakpoints={[0, 0.5, 0.75, 1]}
        backdropBreakpoint={0.5}
      >
        <IonHeader>
          <IonToolbar>
            <IonTitle>Create New</IonTitle>
            <IonButtons slot="end">
              <IonButton onClick={handleModalDismiss}>Close</IonButton>
            </IonButtons>
          </IonToolbar>
        </IonHeader>
        
        <IonContent className="p-4">
          <Card variant="default" padding="lg">
            <h3 className="text-xl font-bold mb-4">Add New Item</h3>
            
            <div className="space-y-4">
              <Input
                label="Title"
                labelPlacement="stacked"
                placeholder="Enter title"
                clearInput
              />
              
              <Input
                label="Description"
                labelPlacement="stacked"
                placeholder="Enter description"
                clearInput
              />
              
              <div className="flex space-x-4 pt-4">
                <Button 
                  variant="outline" 
                  expand="block"
                  onClick={handleModalDismiss}
                >
                  Cancel
                </Button>
                <Button 
                  variant="primary" 
                  expand="block"
                  haptic="medium"
                >
                  Create
                </Button>
              </div>
            </div>
          </Card>
        </IonContent>
      </IonModal>
    </>
  );
};

export default TabsExample;
```

### Camera and File Integration

```tsx
import React, { useState } from 'react';
import { Camera, CameraResultType, CameraSource } from '@capacitor/camera';
import { Filesystem, Directory } from '@capacitor/filesystem';
import { 
  IonContent, 
  IonActionSheet, 
  IonAlert,
  isPlatform 
} from '@ionic/react';

import {
  Button,
  Card,
  useHaptics,
  useIonicPlatform
} from '@xaheen-ai/design-system/ionic';

const CameraExample: React.FC = () => {
  const [photos, setPhotos] = useState<string[]>([]);
  const [isActionSheetOpen, setIsActionSheetOpen] = useState(false);
  const [isAlertOpen, setIsAlertOpen] = useState(false);
  const [alertMessage, setAlertMessage] = useState('');
  
  const haptics = useHaptics();
  const platform = useIonicPlatform();

  const takePicture = async (source: CameraSource) => {
    try {
      await haptics.impact({ style: 'light' });
      
      const photo = await Camera.getPhoto({
        resultType: CameraResultType.Uri,
        source,
        quality: 90,
        width: 800,
        height: 600
      });

      if (photo.webPath) {
        // Save photo if on mobile
        if (isPlatform('capacitor')) {
          await savePhoto(photo.webPath);
        }
        
        setPhotos(prev => [...prev, photo.webPath!]);
        showAlert('Photo captured successfully!');
      }
    } catch (error) {
      console.error('Error taking picture:', error);
      showAlert('Failed to capture photo');
    } finally {
      setIsActionSheetOpen(false);
    }
  };

  const savePhoto = async (photoPath: string) => {
    try {
      const response = await fetch(photoPath);
      const blob = await response.blob();
      const base64 = await convertBlobToBase64(blob);
      
      const fileName = `photo_${Date.now()}.jpeg`;
      await Filesystem.writeFile({
        path: fileName,
        data: base64,
        directory: Directory.Data
      });
      
      console.log('Photo saved:', fileName);
    } catch (error) {
      console.error('Error saving photo:', error);
    }
  };

  const convertBlobToBase64 = (blob: Blob): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onerror = reject;
      reader.onload = () => {
        const result = reader.result as string;
        resolve(result.split(',')[1]); // Remove data:image/jpeg;base64, prefix
      };
      reader.readAsDataURL(blob);
    });
  };

  const deletePhoto = async (index: number) => {
    await haptics.impact({ style: 'medium' });
    setPhotos(prev => prev.filter((_, i) => i !== index));
    showAlert('Photo deleted');
  };

  const showAlert = (message: string) => {
    setAlertMessage(message);
    setIsAlertOpen(true);
  };

  const handleCameraButtonClick = async () => {
    await haptics.impact({ style: 'light' });
    setIsActionSheetOpen(true);
  };

  return (
    <IonContent className="p-4">
      <Card variant="elevated" padding="lg">
        <h2 className="text-xl font-bold mb-4">Camera Integration</h2>
        
        <p className="text-gray-600 mb-6">
          Capture photos using your device camera or photo library.
          Platform: {platform.isIOS ? 'iOS' : platform.isAndroid ? 'Android' : 'Web'}
        </p>
        
        <Button
          variant="primary"
          size="lg"
          expand="block"
          startIcon="camera"
          onClick={handleCameraButtonClick}
        >
          Take Photo
        </Button>

        {photos.length > 0 && (
          <div className="mt-6">
            <h3 className="text-lg font-semibold mb-4">Captured Photos</h3>
            
            <div className="grid grid-cols-2 gap-4">
              {photos.map((photo, index) => (
                <Card 
                  key={index} 
                  variant="outlined" 
                  padding="sm"
                  className="relative"
                >
                  <img
                    src={photo}
                    alt={`Photo ${index + 1}`}
                    className="w-full h-32 object-cover rounded-lg"
                  />
                  
                  <Button
                    variant="danger"
                    size="small"
                    className="absolute top-2 right-2"
                    onClick={() => deletePhoto(index)}
                  >
                    <ion-icon name="trash" />
                  </Button>
                </Card>
              ))}
            </div>
          </div>
        )}
      </Card>

      {/* Action Sheet for camera options */}
      <IonActionSheet
        isOpen={isActionSheetOpen}
        onDidDismiss={() => setIsActionSheetOpen(false)}
        header="Select Photo Source"
        buttons={[
          {
            text: 'Camera',
            icon: 'camera',
            handler: () => takePicture(CameraSource.Camera)
          },
          {
            text: 'Photo Library',
            icon: 'images',
            handler: () => takePicture(CameraSource.Photos)
          },
          {
            text: 'Cancel',
            icon: 'close',
            role: 'cancel'
          }
        ]}
      />

      {/* Alert for messages */}
      <IonAlert
        isOpen={isAlertOpen}
        onDidDismiss={() => setIsAlertOpen(false)}
        header="Camera"
        message={alertMessage}
        buttons={['OK']}
      />
    </IonContent>
  );
};

export default CameraExample;
```

## Platform-Specific Features

### iOS-Specific Features

```tsx
import React from 'react';
import { IonActionSheet, IonPopover } from '@ionic/react';
import { 
  Button, 
  Card,
  useHaptics,
  useIonicPlatform 
} from '@xaheen-ai/design-system/ionic';

const iOSFeatures: React.FC = () => {
  const platform = useIonicPlatform();
  const haptics = useHaptics();

  // iOS-specific haptic patterns
  const iosHapticDemo = async () => {
    if (platform.isIOS) {
      // Selection feedback
      await haptics.selectionStart();
      await new Promise(resolve => setTimeout(resolve, 100));
      await haptics.selectionChanged();
      await new Promise(resolve => setTimeout(resolve, 100));
      await haptics.selectionEnd();
      
      // Notification feedback
      setTimeout(() => haptics.notification('success'), 500);
    }
  };

  return (
    <div className="space-y-4">
      {platform.isIOS && (
        <Card variant="elevated" padding="lg">
          <h3 className="text-lg font-bold mb-4">iOS Features</h3>
          
          {/* Cupertino-style buttons */}
          <div className="space-y-3 mb-4">
            <Button 
              variant="primary" 
              size="large"
              className="ios-cupertino-style"
            >
              iOS Primary Button
            </Button>
            
            <Button 
              variant="outline" 
              size="large"
              className="ios-cupertino-style"
            >
              iOS Outline Button
            </Button>
          </div>

          {/* iOS haptic feedback demo */}
          <Button
            variant="secondary"
            onClick={iosHapticDemo}
            expand="block"
          >
            Demo iOS Haptics
          </Button>
        </Card>
      )}
    </div>
  );
};
```

### Android-Specific Features

```tsx
import React from 'react';
import { 
  Button, 
  Card,
  useHaptics,
  useIonicPlatform 
} from '@xaheen-ai/design-system/ionic';

const AndroidFeatures: React.FC = () => {
  const platform = useIonicPlatform();
  const haptics = useHaptics();

  // Material Design ripple effect
  const materialRippleDemo = async () => {
    if (platform.isAndroid) {
      await haptics.impact({ style: 'light' });
      // Material Design interactions
    }
  };

  return (
    <div className="space-y-4">
      {platform.isAndroid && (
        <Card variant="elevated" padding="lg">
          <h3 className="text-lg font-bold mb-4">Android Features</h3>
          
          {/* Material Design buttons */}
          <div className="space-y-3 mb-4">
            <Button 
              variant="primary" 
              size="large"
              className="md-material-style"
            >
              Material Primary Button
            </Button>
            
            <Button 
              variant="outline" 
              size="large"  
              className="md-material-style"
            >
              Material Outline Button
            </Button>
          </div>

          {/* Material Design ripple demo */}
          <Button
            variant="secondary"
            onClick={materialRippleDemo}
            expand="block"
          >
            Demo Material Ripple
          </Button>
        </Card>
      )}
    </div>
  );
};
```

### Capacitor Integration

```tsx
import React, { useState, useEffect } from 'react';
import { Network } from '@capacitor/network';
import { Device } from '@capacitor/device';
import { StatusBar, Style } from '@capacitor/status-bar';
import { SplashScreen } from '@capacitor/splash-screen';

import {
  Card,
  Button,
  useHaptics,
  useIonicPlatform
} from '@xaheen-ai/design-system/ionic';

const CapacitorFeatures: React.FC = () => {
  const [deviceInfo, setDeviceInfo] = useState<any>(null);
  const [networkStatus, setNetworkStatus] = useState<any>(null);
  
  const platform = useIonicPlatform();
  const haptics = useHaptics();

  useEffect(() => {
    initializeCapacitorFeatures();
  }, []);

  const initializeCapacitorFeatures = async () => {
    try {
      // Get device info
      const info = await Device.getInfo();
      setDeviceInfo(info);

      // Get network status
      const status = await Network.getStatus();
      setNetworkStatus(status);

      // Listen for network changes
      Network.addListener('networkStatusChange', (status) => {
        setNetworkStatus(status);
      });

      // Hide splash screen after initialization
      await SplashScreen.hide();

    } catch (error) {
      console.error('Capacitor initialization error:', error);
    }
  };

  const toggleStatusBar = async () => {
    try {
      await haptics.impact({ style: 'light' });
      
      if (platform.isIOS || platform.isAndroid) {
        await StatusBar.setStyle({ style: Style.Dark });
        setTimeout(async () => {
          await StatusBar.setStyle({ style: Style.Light });
        }, 2000);
      }
    } catch (error) {
      console.error('Status bar error:', error);
    }
  };

  return (
    <div className="space-y-4">
      {/* Device Information */}
      <Card variant="elevated" padding="lg">
        <h3 className="text-lg font-bold mb-4">Device Information</h3>
        {deviceInfo ? (
          <div className="space-y-2 text-sm">
            <p><strong>Platform:</strong> {deviceInfo.platform}</p>
            <p><strong>Model:</strong> {deviceInfo.model}</p>
            <p><strong>OS Version:</strong> {deviceInfo.osVersion}</p>
            <p><strong>Web View Version:</strong> {deviceInfo.webViewVersion}</p>
            <p><strong>Manufacturer:</strong> {deviceInfo.manufacturer}</p>
          </div>
        ) : (
          <p>Loading device information...</p>
        )}
      </Card>

      {/* Network Status */}
      <Card variant="elevated" padding="lg">
        <h3 className="text-lg font-bold mb-4">Network Status</h3>
        {networkStatus ? (
          <div className="space-y-2 text-sm">
            <p><strong>Connected:</strong> {networkStatus.connected ? 'Yes' : 'No'}</p>
            <p><strong>Connection Type:</strong> {networkStatus.connectionType}</p>
            {networkStatus.connected && (
              <div className="flex items-center">
                <div className="w-3 h-3 bg-green-500 rounded-full mr-2"></div>
                <span className="text-green-600">Online</span>
              </div>
            )}
          </div>
        ) : (
          <p>Loading network status...</p>
        )}
      </Card>

      {/* Native Features Demo */}
      <Card variant="elevated" padding="lg">
        <h3 className="text-lg font-bold mb-4">Native Features</h3>
        
        <div className="space-y-3">
          <Button
            variant="primary"
            expand="block"
            onClick={toggleStatusBar}
          >
            Toggle Status Bar Style
          </Button>
          
          <Button
            variant="secondary"
            expand="block"
            onClick={() => haptics.vibrate(500)}
          >
            Vibrate Device
          </Button>
          
          <Button
            variant="outline"
            expand="block"
            onClick={() => haptics.impact({ style: 'heavy' })}
          >
            Heavy Haptic Feedback
          </Button>
        </div>
      </Card>
    </div>
  );
};

export default CapacitorFeatures;
```

## Best Practices

### 1. Platform-Specific Styling

```scss
// Use CSS variables for theming
:root {
  // iOS-specific variables
  --ios-background-color: #f2f2f7;
  --ios-toolbar-background: rgba(248, 248, 248, 0.8);
  
  // Material Design variables
  --md-background-color: #ffffff;
  --md-toolbar-background: #ffffff;
}

// Platform-specific styles
.ios {
  ion-toolbar {
    --background: var(--ios-toolbar-background);
    backdrop-filter: blur(20px);
  }
}

.md {
  ion-toolbar {
    --background: var(--md-toolbar-background);
    box-shadow: 0 2px 4px rgba(0,0,0,0.1);
  }
}
```

### 2. Performance Optimization

```tsx
// Use React.memo for expensive components
const ExpensiveCard = React.memo<CardProps>(({ product }) => {
  return (
    <Card variant="elevated">
      {/* Heavy computation here */}
    </Card>
  );
});

// Implement virtual scrolling for large lists
const LargeList: React.FC = () => {
  const [items] = useState(generateLargeDataSet());
  
  return (
    <IonVirtualScroll
      items={items}
      approxItemHeight={120}
      renderItem={(item, index) => (
        <ExpensiveCard key={item.id} product={item} />
      )}
    />
  );
};

// Use useMemo for expensive calculations
const ExpensiveComputation: React.FC<{ data: any[] }> = ({ data }) => {
  const processedData = useMemo(() => {
    return data.map(item => ({
      ...item,
      processed: heavyComputation(item)
    }));
  }, [data]);

  return (
    <div>
      {processedData.map(item => (
        <Card key={item.id}>...</Card>
      ))}
    </div>
  );
};
```

### 3. Accessibility Best Practices

```tsx
// Proper ARIA attributes and keyboard navigation
const AccessibleCard: React.FC = () => {
  return (
    <Card
      clickable
      role="button"
      tabIndex={0}
      aria-label="Product details"
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          handleCardClick();
        }
      }}
    >
      <h3 id="product-title">Product Name</h3>
      <p aria-describedby="product-title">Product description</p>
    </Card>
  );
};

// Announce dynamic content changes
const LiveRegionExample: React.FC = () => {
  const [status, setStatus] = useState('');
  
  return (
    <div>
      <Button onClick={() => setStatus('Loading...')}>
        Start Process
      </Button>
      
      {/* Screen reader will announce status changes */}
      <div 
        aria-live="polite" 
        aria-atomic="true"
        className="sr-only"
      >
        {status}
      </div>
    </div>
  );
};
```

## Migration Guide

### From Ionic Components to Xaheen Ionic

```tsx
// Before (Standard Ionic)
import { IonButton, IonInput, IonCard } from '@ionic/react';

const OldComponent = () => {
  return (
    <IonCard>
      <IonInput 
        label="Email" 
        type="email" 
        fill="outline"
      />
      <IonButton color="primary" expand="block">
        Submit
      </IonButton>
    </IonCard>
  );
};

// After (Xaheen Ionic)
import { Button, Input, Card } from '@xaheen-ai/design-system/ionic';

const NewComponent = () => {
  return (
    <Card variant="elevated">
      <Input 
        label="Email" 
        type="email" 
        labelPlacement="floating"
        haptic="light"
      />
      <Button 
        variant="primary" 
        expand="block"
        haptic="medium"
      >
        Submit
      </Button>
    </Card>
  );
};
```

### Migration Checklist

1. **Replace Component Imports**
   - Update import statements to use Xaheen components
   - Wrap app with `IonicProvider`

2. **Update Props and Attributes**
   - Convert `color` to `variant`
   - Add `haptic` feedback where appropriate
   - Update event handlers to use Xaheen conventions

3. **Add Accessibility Features**
   - Ensure proper ARIA attributes
   - Test keyboard navigation
   - Verify screen reader compatibility

4. **Platform-Specific Optimizations**
   - Use platform detection hooks
   - Implement platform-specific features
   - Test on actual devices

## Troubleshooting

### Common Issues

#### 1. Haptic Feedback Not Working

```typescript
// Check if haptics are available
import { Haptics, ImpactStyle } from '@capacitor/haptics';

const checkHapticsAvailability = async () => {
  try {
    await Haptics.impact({ style: ImpactStyle.Light });
    console.log('Haptics available');
  } catch (error) {
    console.log('Haptics not available:', error);
  }
};
```

#### 2. Platform Detection Issues

```typescript
// Verify platform detection
import { isPlatform } from '@ionic/react';

console.log('Platform info:');
console.log('iOS:', isPlatform('ios'));
console.log('Android:', isPlatform('android'));
console.log('Mobile:', isPlatform('mobile'));
console.log('Desktop:', isPlatform('desktop'));
```

#### 3. Styling Conflicts

```scss
// Resolve styling conflicts
// Ensure Ionic CSS is loaded before custom styles
@import '@ionic/react/css/core.css';
@import '@ionic/react/css/normalize.css';
@import '@ionic/react/css/structure.css';

// Your custom styles after Ionic styles
.custom-button {
  // Custom styles here
}
```

### Performance Issues

#### Bundle Size Optimization

```typescript
// Use dynamic imports for heavy components
const HeavyComponent = lazy(() => import('./HeavyComponent'));

// Implement code splitting
const loadPage = (pageName: string) => {
  return import(`./pages/${pageName}`);
};
```

For more help:
- [Ionic Documentation](https://ionicframework.com/docs)
- [Capacitor Documentation](https://capacitorjs.com/docs)
- [Xaheen GitHub Issues](https://github.com/xaheen-org/design-system/issues)

## Conclusion

The Xaheen Design System Ionic platform provides a comprehensive solution for building mobile-first applications with native iOS and Android experiences. By leveraging Ionic's powerful mobile optimizations and adding Xaheen's consistent design language, you can create applications that feel truly native on each platform while maintaining a unified codebase.

Key advantages include:
- **Native Feel**: Automatic platform-specific styling and interactions
- **Performance**: Optimized for mobile with virtual scrolling and efficient rendering
- **Developer Experience**: Rich TypeScript support and comprehensive tooling
- **Device Integration**: Full access to native capabilities through Capacitor
- **Cross-Platform**: Single codebase for iOS, Android, and web

Whether building a consumer mobile app or an enterprise solution, Xaheen Ionic components provide the foundation for creating accessible, performant, and engaging mobile experiences.