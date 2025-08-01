# Mobile Applications Quick Start Guide

> **Build modern mobile applications with Xala UI System using React Native and Expo**

## Table of Contents

- [Mobile Setup](#mobile-setup)
- [Touch-First Layout](#touch-first-layout)
- [Mobile Navigation](#mobile-navigation)
- [Responsive Components](#responsive-components)
- [Touch Interactions](#touch-interactions)
- [Mobile Forms](#mobile-forms)
- [Performance Optimization](#performance-optimization)
- [Platform-Specific Features](#platform-specific-features)

## Mobile Setup

### React Native with Expo

```bash
# Create new Expo app
npx create-expo-app@latest MyXalaApp --template typescript

# Install UI System
cd MyXalaApp
expo install @xala-technologies/ui-system

# Install dependencies
expo install react-native-svg react-native-gesture-handler
```

**App.tsx**

```tsx
import { DesignSystemProvider, MobileLayout } from '@xala-technologies/ui-system';
import { StatusBar } from 'expo-status-bar';
import { MainNavigator } from './src/navigation/MainNavigator';

export default function App(): React.ReactElement {
  return (
    <DesignSystemProvider platform="mobile" locale="nb-NO" theme="norwegian-mobile">
      <MobileLayout>
        <StatusBar style="auto" />
        <MainNavigator />
      </MobileLayout>
    </DesignSystemProvider>
  );
}
```

### Bare React Native

```bash
# Create React Native app
npx react-native init MyXalaApp --template react-native-template-typescript

# Install UI System
cd MyXalaApp
npm install @xala-technologies/ui-system

# iOS setup
cd ios && pod install && cd ..

# Android setup (automatic)
```

**index.js**

```tsx
import { AppRegistry } from 'react-native';
import { DesignSystemProvider, MobileLayout } from '@xala-technologies/ui-system';
import { App } from './src/App';

function AppWrapper(): React.ReactElement {
  return (
    <DesignSystemProvider platform="mobile" locale="nb-NO">
      <MobileLayout>
        <App />
      </MobileLayout>
    </DesignSystemProvider>
  );
}

AppRegistry.registerComponent('MyXalaApp', () => AppWrapper);
```

## Touch-First Layout

### Mobile Page Structure

```tsx
import {
  MobileLayout,
  MobileHeader,
  MobileContent,
  BottomNavigation,
  Stack,
  Container,
  ScrollArea,
  SafeArea,
} from '@xala-technologies/ui-system';

export function MobileHomeScreen(): React.ReactElement {
  return (
    <MobileLayout>
      <SafeArea>
        <MobileHeader
          title="Xala Enterprise"
          leftAction={{
            icon: 'menu',
            onPress: openDrawer,
            label: 'Åpne meny',
          }}
          rightAction={{
            icon: 'notifications',
            onPress: showNotifications,
            label: 'Varsler',
          }}
        />

        <MobileContent>
          <ScrollArea>
            <Container size="mobile" px="4">
              <Stack direction="col" gap="6" py="4">
                <WelcomeSection />
                <QuickActionsGrid />
                <RecentActivity />
                <NorwegianCompliance />
              </Stack>
            </Container>
          </ScrollArea>
        </MobileContent>

        <BottomNavigation
          items={[
            { key: 'home', label: 'Hjem', icon: 'home' },
            { key: 'dashboard', label: 'Dashboard', icon: 'chart' },
            { key: 'profile', label: 'Profil', icon: 'user' },
            { key: 'settings', label: 'Innstillinger', icon: 'settings' },
          ]}
          activeKey="home"
          onTabPress={handleTabPress}
        />
      </SafeArea>
    </MobileLayout>
  );
}
```

### Touch-Friendly Grids

```tsx
import { Grid, GridItem, Card, CardContent, Stack, Text } from '@xala-technologies/ui-system';

export function QuickActionsGrid(): React.ReactElement {
  return (
    <Grid cols={{ base: 2, sm: 3 }} gap="4" px="2">
      <GridItem>
        <Card
          variant="elevated"
          touchable
          onPress={() => navigateToAction('documents')}
          minH="120px"
        >
          <CardContent p="4">
            <Stack direction="col" gap="2" align="center" justify="center" h="full">
              <Icon name="document" size="24" color="primary" />
              <Text size="sm" weight="medium" align="center">
                Dokumenter
              </Text>
            </Stack>
          </CardContent>
        </Card>
      </GridItem>

      <GridItem>
        <Card variant="elevated" touchable onPress={() => navigateToAction('forms')} minH="120px">
          <CardContent p="4">
            <Stack direction="col" gap="2" align="center" justify="center" h="full">
              <Icon name="form" size="24" color="primary" />
              <Text size="sm" weight="medium" align="center">
                Skjemaer
              </Text>
            </Stack>
          </CardContent>
        </Card>
      </GridItem>

      <GridItem colSpan="full">
        <Card variant="outline" touchable onPress={() => navigateToAction('emergency')}>
          <CardContent p="4">
            <Stack direction="row" gap="4" align="center">
              <Icon name="alert" size="24" color="destructive" />
              <Stack direction="col" gap="1" flex="1">
                <Text weight="medium" color="destructive">
                  Nødsituasjon
                </Text>
                <Text size="xs" color="muted-foreground">
                  Kun for kritiske hendelser
                </Text>
              </Stack>
            </Stack>
          </CardContent>
        </Card>
      </GridItem>
    </Grid>
  );
}
```

## Mobile Navigation

### Stack Navigator with Header

```tsx
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { MobileHeader } from '@xala-technologies/ui-system';

const Stack = createNativeStackNavigator();

export function MainNavigator(): React.ReactElement {
  return (
    <NavigationContainer>
      <Stack.Navigator
        screenOptions={{
          header: ({ navigation, route, options }) => (
            <MobileHeader
              title={options.title || route.name}
              leftAction={{
                icon: 'arrow-left',
                onPress: navigation.goBack,
                label: 'Tilbake',
              }}
              rightAction={options.headerRight}
            />
          ),
        }}
      >
        <Stack.Screen name="Home" component={HomeScreen} options={{ title: 'Hjem' }} />
        <Stack.Screen
          name="Profile"
          component={ProfileScreen}
          options={{
            title: 'Min Profil',
            headerRight: {
              icon: 'edit',
              onPress: handleEditProfile,
              label: 'Rediger',
            },
          }}
        />
      </Stack.Navigator>
    </NavigationContainer>
  );
}
```

### Drawer Navigation

```tsx
import { createDrawerNavigator } from '@react-navigation/drawer';
import { MobileDrawer } from '@xala-technologies/ui-system';

const Drawer = createDrawerNavigator();

export function DrawerNavigator(): React.ReactElement {
  return (
    <Drawer.Navigator
      drawerContent={props => (
        <MobileDrawer
          navigation={props.navigation}
          items={[
            { key: 'home', label: 'Hjem', icon: 'home', screen: 'Home' },
            { key: 'documents', label: 'Dokumenter', icon: 'document', screen: 'Documents' },
            { key: 'forms', label: 'Skjemaer', icon: 'form', screen: 'Forms' },
            { key: 'profile', label: 'Profil', icon: 'user', screen: 'Profile' },
            { key: 'settings', label: 'Innstillinger', icon: 'settings', screen: 'Settings' },
          ]}
          user={{
            name: 'Ola Nordmann',
            email: 'ola@example.no',
            avatar: '/images/avatar.jpg',
          }}
          classification="ÅPEN"
        />
      )}
    >
      <Drawer.Screen name="Home" component={HomeScreen} />
      <Drawer.Screen name="Documents" component={DocumentsScreen} />
      <Drawer.Screen name="Forms" component={FormsScreen} />
    </Drawer.Navigator>
  );
}
```

## Responsive Components

### Mobile-First Cards

```tsx
import {
  Card,
  CardContent,
  Stack,
  Text,
  Badge,
  IconButton,
  Divider,
} from '@xala-technologies/ui-system';

export function MobileUserCard({ user }: { user: User }): React.ReactElement {
  return (
    <Card variant="elevated" w="full">
      <CardContent p="4">
        <Stack direction="col" gap="3">
          {/* Header */}
          <Stack direction="row" gap="3" align="center">
            <Avatar src={user.avatar} fallback={user.initials} size="md" />
            <Stack direction="col" gap="1" flex="1">
              <Text weight="medium" size="base">
                {user.fullName}
              </Text>
              <Text size="sm" color="muted-foreground">
                {user.email}
              </Text>
            </Stack>
            <IconButton
              icon="more-vertical"
              label="Flere handlinger"
              size="sm"
              variant="ghost"
              onPress={() => showUserActions(user.id)}
            />
          </Stack>

          <Divider />

          {/* Status and Info */}
          <Stack direction="row" gap="2" align="center" justify="between">
            <Badge variant={user.status === 'active' ? 'success' : 'secondary'} size="sm">
              {user.status === 'active' ? 'Aktiv' : 'Inaktiv'}
            </Badge>
            <Text size="xs" color="muted-foreground">
              Sist aktiv: {formatRelativeTime(user.lastSeen)}
            </Text>
          </Stack>

          {/* Action Buttons */}
          <Stack direction="row" gap="2" pt="2">
            <Button variant="primary" size="sm" flex="1" onPress={() => contactUser(user.id)}>
              Kontakt
            </Button>
            <Button variant="outline" size="sm" flex="1" onPress={() => viewProfile(user.id)}>
              Vis profil
            </Button>
          </Stack>
        </Stack>
      </CardContent>
    </Card>
  );
}
```

### List with Pull-to-Refresh

```tsx
import {
  MobileContent,
  ScrollArea,
  Stack,
  Text,
  Skeleton,
  RefreshControl,
} from '@xala-technologies/ui-system';

export function MobileUsersList(): React.ReactElement {
  const [users, setUsers] = useState<User[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);

  const handleRefresh = useCallback(async (): Promise<void> => {
    setIsRefreshing(true);
    try {
      const freshUsers = await fetchUsers();
      setUsers(freshUsers);
    } catch (error) {
      showErrorToast('Kunne ikke oppdatere listen');
    } finally {
      setIsRefreshing(false);
    }
  }, []);

  if (isLoading) {
    return (
      <MobileContent>
        <Stack direction="col" gap="4" p="4">
          {Array.from({ length: 5 }).map((_, index) => (
            <Skeleton key={index} variant="userCard" />
          ))}
        </Stack>
      </MobileContent>
    );
  }

  return (
    <MobileContent>
      <ScrollArea
        refreshControl={
          <RefreshControl refreshing={isRefreshing} onRefresh={handleRefresh} tintColor="primary" />
        }
      >
        <Stack direction="col" gap="4" p="4">
          {users.map(user => (
            <MobileUserCard key={user.id} user={user} />
          ))}

          {users.length === 0 && (
            <Stack direction="col" gap="4" align="center" py="8">
              <Icon name="users" size="48" color="muted-foreground" />
              <Text align="center" color="muted-foreground">
                Ingen brukere funnet
              </Text>
            </Stack>
          )}
        </Stack>
      </ScrollArea>
    </MobileContent>
  );
}
```

## Touch Interactions

### Gesture-Enabled Cards

```tsx
import {
  Card,
  CardContent,
  Stack,
  Text,
  IconButton,
  GestureHandler,
} from '@xala-technologies/ui-system';

export function SwipeableMessageCard({ message }: { message: Message }): React.ReactElement {
  const handleSwipeLeft = (): void => {
    // Archive message
    archiveMessage(message.id);
  };

  const handleSwipeRight = (): void => {
    // Mark as important
    markAsImportant(message.id);
  };

  return (
    <GestureHandler
      onSwipeLeft={handleSwipeLeft}
      onSwipeRight={handleSwipeRight}
      leftAction={{
        icon: 'archive',
        color: 'warning',
        label: 'Arkiver',
      }}
      rightAction={{
        icon: 'star',
        color: 'primary',
        label: 'Viktig',
      }}
    >
      <Card variant="elevated" touchable onPress={() => openMessage(message.id)}>
        <CardContent p="4">
          <Stack direction="row" gap="3" align="start">
            <Avatar src={message.sender.avatar} fallback={message.sender.initials} size="sm" />
            <Stack direction="col" gap="2" flex="1">
              <Stack direction="row" gap="2" align="center" justify="between">
                <Text weight="medium" size="sm">
                  {message.sender.name}
                </Text>
                <Text size="xs" color="muted-foreground">
                  {formatTime(message.createdAt)}
                </Text>
              </Stack>
              <Text size="sm" numberOfLines={2}>
                {message.content}
              </Text>
              {message.classification && (
                <ClassificationIndicator level={message.classification} size="xs" />
              )}
            </Stack>
          </Stack>
        </CardContent>
      </Card>
    </GestureHandler>
  );
}
```

### Long Press Actions

```tsx
import { Card, CardContent, ActionSheet, useLongPress } from '@xala-technologies/ui-system';

export function LongPressCard({ item }: { item: Item }): React.ReactElement {
  const [showActions, setShowActions] = useState(false);

  const longPressHandlers = useLongPress(() => {
    setShowActions(true);
    // Haptic feedback
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
  });

  const actions = [
    {
      key: 'edit',
      label: 'Rediger',
      icon: 'edit',
      onPress: () => editItem(item.id),
    },
    {
      key: 'share',
      label: 'Del',
      icon: 'share',
      onPress: () => shareItem(item.id),
    },
    {
      key: 'delete',
      label: 'Slett',
      icon: 'trash',
      variant: 'destructive',
      onPress: () => deleteItem(item.id),
    },
  ];

  return (
    <>
      <Card variant="elevated" touchable onPress={() => openItem(item.id)} {...longPressHandlers}>
        <CardContent p="4">
          <ItemContent item={item} />
        </CardContent>
      </Card>

      <ActionSheet
        isOpen={showActions}
        onClose={() => setShowActions(false)}
        title={`Handlinger for ${item.name}`}
        actions={actions}
      />
    </>
  );
}
```

## Mobile Forms

### Touch-Optimized Form

```tsx
import {
  Form,
  Input,
  PersonalNumberInput,
  Select,
  Textarea,
  Button,
  Stack,
  KeyboardAvoidingView,
  ScrollArea,
} from '@xala-technologies/ui-system';

export function MobileRegistrationForm(): React.ReactElement {
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    personalNumber: '',
    email: '',
    municipality: '',
    message: '',
  });

  return (
    <KeyboardAvoidingView behavior="padding">
      <ScrollArea keyboardShouldPersistTaps="handled">
        <Form onSubmit={handleSubmit}>
          <Stack direction="col" gap="6" p="4">
            <Stack direction="col" gap="1">
              <Heading level={2} size="xl">
                Registrering
              </Heading>
              <Text color="muted-foreground">Fyll ut skjemaet for å registrere deg</Text>
            </Stack>

            {/* Touch-friendly inputs with larger targets */}
            <Stack direction="col" gap="4">
              <Input
                name="firstName"
                label="Fornavn"
                placeholder="Skriv inn fornavn"
                required
                size="lg"
                autoComplete="given-name"
              />

              <Input
                name="lastName"
                label="Etternavn"
                placeholder="Skriv inn etternavn"
                required
                size="lg"
                autoComplete="family-name"
              />

              <PersonalNumberInput
                name="personalNumber"
                label="Fødselsnummer"
                placeholder="11 siffer"
                validation="strict"
                required
                size="lg"
                keyboardType="numeric"
              />

              <Input
                name="email"
                type="email"
                label="E-post"
                placeholder="din@epost.no"
                required
                size="lg"
                autoComplete="email"
                keyboardType="email-address"
              />

              <Select
                name="municipality"
                label="Kommune"
                placeholder="Velg din kommune"
                required
                size="lg"
                options={norwegianMunicipalities}
              />

              <Textarea
                name="message"
                label="Melding"
                placeholder="Skriv din melding her..."
                rows={4}
                size="lg"
              />
            </Stack>

            {/* GDPR Consent */}
            <Card variant="outline">
              <CardContent p="4">
                <Stack direction="col" gap="3">
                  <Checkbox
                    name="gdprConsent"
                    label="Jeg samtykker til behandling av personopplysninger"
                    description="I henhold til GDPR og norsk personvernlovgivning"
                    required
                    size="lg"
                  />
                  <Text size="xs" color="muted-foreground">
                    Les mer om våre personvernregler
                  </Text>
                </Stack>
              </CardContent>
            </Card>

            {/* Submit Buttons */}
            <Stack direction="col" gap="3" pt="4">
              <Button variant="primary" size="lg" type="submit" w="full">
                Send registrering
              </Button>

              <Button variant="outline" size="lg" w="full" onPress={() => navigation.goBack()}>
                Avbryt
              </Button>
            </Stack>
          </Stack>
        </Form>
      </ScrollArea>
    </KeyboardAvoidingView>
  );
}
```

### Picker Components

```tsx
import { DatePicker, TimePicker, Select, Button, Stack, Modal } from '@xala-technologies/ui-system';

export function NorwegianDateTimeForm(): React.ReactElement {
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [selectedTime, setSelectedTime] = useState<string>('');
  const [showDatePicker, setShowDatePicker] = useState(false);

  return (
    <Stack direction="col" gap="4">
      {/* Date Selection */}
      <Button variant="outline" size="lg" onPress={() => setShowDatePicker(true)} justify="between">
        <Text>{selectedDate ? formatNorwegianDate(selectedDate) : 'Velg dato'}</Text>
        <Icon name="calendar" size="20" />
      </Button>

      <Modal isOpen={showDatePicker} onClose={() => setShowDatePicker(false)}>
        <DatePicker
          value={selectedDate}
          onChange={setSelectedDate}
          locale="nb-NO"
          minimumDate={new Date()}
          maximumDate={addYears(new Date(), 2)}
          norwegianHolidays={true}
          mode="date"
        />
      </Modal>

      {/* Time Selection */}
      <TimePicker
        label="Velg tid"
        value={selectedTime}
        onChange={setSelectedTime}
        format="24h"
        minuteInterval={15}
        size="lg"
      />

      {/* Municipality Selection */}
      <Select
        label="Kommune"
        placeholder="Velg din kommune"
        options={norwegianMunicipalities}
        searchable={true}
        searchPlaceholder="Søk etter kommune..."
        size="lg"
      />
    </Stack>
  );
}
```

## Performance Optimization

### Lazy Loading and Virtualization

```tsx
import { VirtualizedList, LazyComponent, Skeleton } from '@xala-technologies/ui-system';

export function OptimizedUsersList(): React.ReactElement {
  const renderItem = ({ item }: { item: User }): React.ReactElement => (
    <LazyComponent fallback={<Skeleton variant="userCard" />} threshold={100}>
      <MobileUserCard user={item} />
    </LazyComponent>
  );

  return (
    <VirtualizedList
      data={users}
      renderItem={renderItem}
      keyExtractor={item => item.id}
      initialNumToRender={10}
      windowSize={10}
      removeClippedSubviews={true}
      getItemLayout={(data, index) => ({
        length: 120, // Estimated item height
        offset: 120 * index,
        index,
      })}
    />
  );
}
```

### Image Optimization

```tsx
import { Image, ImageBackground, Skeleton } from '@xala-technologies/ui-system';

export function OptimizedImageCard({ item }: { item: ImageItem }): React.ReactElement {
  return (
    <Card variant="elevated">
      <Image
        src={item.imageUrl}
        alt={item.title}
        placeholder={<Skeleton variant="image" aspectRatio="16:9" />}
        lazy={true}
        quality="auto"
        resize="cover"
        w="full"
        h="200px"
        borderRadius="md"
      />
      <CardContent p="4">
        <Text weight="medium">{item.title}</Text>
      </CardContent>
    </Card>
  );
}
```

## Platform-Specific Features

### iOS Specific

```tsx
import { SafeAreaProvider, ActionSheet, HapticFeedback } from '@xala-technologies/ui-system';

export function iOSSpecificFeatures(): React.ReactElement {
  const handleActionPress = (): void => {
    HapticFeedback.impactAsync(HapticFeedback.ImpactFeedbackStyle.Heavy);

    ActionSheet.showActionSheetWithOptions(
      {
        title: 'Velg handling',
        options: ['Rediger', 'Del', 'Slett', 'Avbryt'],
        destructiveButtonIndex: 2,
        cancelButtonIndex: 3,
      },
      buttonIndex => {
        if (buttonIndex === 0) editItem();
        if (buttonIndex === 1) shareItem();
        if (buttonIndex === 2) deleteItem();
      }
    );
  };

  return (
    <SafeAreaProvider>
      <Button onPress={handleActionPress}>Vis handlinger</Button>
    </SafeAreaProvider>
  );
}
```

### Android Specific

```tsx
import { FloatingActionButton, SnackBar, BackHandler } from '@xala-technologies/ui-system';

export function AndroidSpecificFeatures(): React.ReactElement {
  useEffect(() => {
    const backAction = (): boolean => {
      SnackBar.show({
        text: 'Trykk igjen for å avslutte',
        duration: 2000,
      });
      return true;
    };

    BackHandler.addEventListener('hardwareBackPress', backAction);
    return () => BackHandler.removeEventListener('hardwareBackPress', backAction);
  }, []);

  return (
    <Box position="relative" h="full">
      <MainContent />

      <FloatingActionButton
        icon="plus"
        label="Legg til ny"
        position="bottom-right"
        onPress={addNewItem}
        variant="primary"
      />
    </Box>
  );
}
```

## Best Practices

1. **Touch targets minimum 44px** - Ensure accessibility compliance
2. **Use safe areas** - Respect device notches and home indicators
3. **Optimize for gestures** - Implement swipe actions and long press
4. **Consider keyboard** - Use KeyboardAvoidingView for forms
5. **Norwegian localization** - Date formats, number formats, text direction
6. **Offline support** - Handle network states gracefully
7. **Performance first** - Use virtualization for large lists
8. **Platform conventions** - Follow iOS and Android design guidelines

## Next Steps

- **[Desktop Applications Guide](./desktop-applications.md)** - Extend to desktop platforms
- **[Chat Interface Guide](./chat-interfaces.md)** - Build AI chat features
- **[Component Reference](../components/README.md)** - Explore mobile-specific components
- **[Performance Guide](../performance.md)** - Advanced optimization techniques
