/**
 * Ionic React Hooks
 * Custom hooks for Ionic-specific functionality
 */

import { useEffect, useState, useCallback, useRef } from 'react';
import { 
  getPlatforms, 
  isPlatform,
  IonPlatform 
} from '@ionic/react';

// =============================================================================
// PLATFORM DETECTION HOOK
// =============================================================================

export interface PlatformInfo {
  platforms: string[];
  isIOS: boolean;
  isAndroid: boolean;
  isMobile: boolean;
  isDesktop: boolean;
  isPWA: boolean;
  isCapacitor: boolean;
  isCordova: boolean;
  isElectron: boolean;
}

/**
 * Hook to detect current platform and capabilities
 */
export function useIonicPlatform(): PlatformInfo {
  const [platformInfo, setPlatformInfo] = useState<PlatformInfo>({
    platforms: [],
    isIOS: false,
    isAndroid: false,
    isMobile: false,
    isDesktop: false,
    isPWA: false,
    isCapacitor: false,
    isCordova: false,
    isElectron: false
  });

  useEffect(() => {
    const platforms = getPlatforms();
    
    setPlatformInfo({
      platforms,
      isIOS: isPlatform('ios'),
      isAndroid: isPlatform('android'),
      isMobile: isPlatform('mobile'),
      isDesktop: isPlatform('desktop'),
      isPWA: isPlatform('pwa'),
      isCapacitor: isPlatform('capacitor'),
      isCordova: isPlatform('cordova'),
      isElectron: isPlatform('electron')
    });
  }, []);

  return platformInfo;
}

// =============================================================================
// HAPTICS HOOK
// =============================================================================

export interface HapticsOptions {
  style?: 'light' | 'medium' | 'heavy';
  duration?: number;
}

export interface HapticsHook {
  impact: (options?: HapticsOptions) => Promise<void>;
  notification: (type: 'success' | 'warning' | 'error') => Promise<void>;
  selectionStart: () => Promise<void>;
  selectionEnd: () => Promise<void>;
  selectionChanged: () => Promise<void>;
  isAvailable: boolean;
}

/**
 * Hook for haptic feedback functionality
 */
export function useHaptics(): HapticsHook {
  const [isAvailable, setIsAvailable] = useState(false);

  useEffect(() => {
    // Check if Haptics plugin is available
    if (typeof window !== 'undefined' && 'Haptics' in window) {
      setIsAvailable(true);
    }
  }, []);

  const impact = useCallback(async (options: HapticsOptions = {}) => {
    if (!isAvailable) return;

    try {
      // @ts-ignore - Capacitor Haptics
      await window.Haptics?.impact({
        style: options.style || 'medium',
        duration: options.duration
      });
    } catch (error) {
      console.warn('Haptic impact failed:', error);
    }
  }, [isAvailable]);

  const notification = useCallback(async (type: 'success' | 'warning' | 'error') => {
    if (!isAvailable) return;

    try {
      // @ts-ignore - Capacitor Haptics
      await window.Haptics?.notification({ type });
    } catch (error) {
      console.warn('Haptic notification failed:', error);
    }
  }, [isAvailable]);

  const selectionStart = useCallback(async () => {
    if (!isAvailable) return;

    try {
      // @ts-ignore - Capacitor Haptics
      await window.Haptics?.selectionStart();
    } catch (error) {
      console.warn('Haptic selection start failed:', error);
    }
  }, [isAvailable]);

  const selectionEnd = useCallback(async () => {
    if (!isAvailable) return;

    try {
      // @ts-ignore - Capacitor Haptics
      await window.Haptics?.selectionEnd();
    } catch (error) {
      console.warn('Haptic selection end failed:', error);
    }
  }, [isAvailable]);

  const selectionChanged = useCallback(async () => {
    if (!isAvailable) return;

    try {
      // @ts-ignore - Capacitor Haptics
      await window.Haptics?.selectionChanged();
    } catch (error) {
      console.warn('Haptic selection changed failed:', error);
    }
  }, [isAvailable]);

  return {
    impact,
    notification,
    selectionStart,
    selectionEnd,
    selectionChanged,
    isAvailable
  };
}

// =============================================================================
// KEYBOARD HOOK
// =============================================================================

export interface KeyboardInfo {
  isVisible: boolean;
  height: number;
}

export interface KeyboardHook extends KeyboardInfo {
  show: () => Promise<void>;
  hide: () => Promise<void>;
  setAccessoryBarVisible: (visible: boolean) => Promise<void>;
  setScroll: (scroll: boolean) => Promise<void>;
  setStyle: (style: 'light' | 'dark') => Promise<void>;
  setResizeMode: (mode: 'native' | 'ionic' | 'body' | 'none') => Promise<void>;
}

/**
 * Hook for keyboard functionality
 */
export function useKeyboard(): KeyboardHook {
  const [keyboardInfo, setKeyboardInfo] = useState<KeyboardInfo>({
    isVisible: false,
    height: 0
  });

  useEffect(() => {
    if (typeof window === 'undefined' || !('Keyboard' in window)) return;

    const handleShow = (info: any) => {
      setKeyboardInfo({
        isVisible: true,
        height: info.keyboardHeight || 0
      });
    };

    const handleHide = () => {
      setKeyboardInfo({
        isVisible: false,
        height: 0
      });
    };

    // @ts-ignore - Capacitor Keyboard
    window.Keyboard?.addListener('keyboardWillShow', handleShow);
    // @ts-ignore - Capacitor Keyboard
    window.Keyboard?.addListener('keyboardDidShow', handleShow);
    // @ts-ignore - Capacitor Keyboard
    window.Keyboard?.addListener('keyboardWillHide', handleHide);
    // @ts-ignore - Capacitor Keyboard
    window.Keyboard?.addListener('keyboardDidHide', handleHide);

    return () => {
      // @ts-ignore - Capacitor Keyboard
      window.Keyboard?.removeAllListeners();
    };
  }, []);

  const show = useCallback(async () => {
    try {
      // @ts-ignore - Capacitor Keyboard
      await window.Keyboard?.show();
    } catch (error) {
      console.warn('Failed to show keyboard:', error);
    }
  }, []);

  const hide = useCallback(async () => {
    try {
      // @ts-ignore - Capacitor Keyboard
      await window.Keyboard?.hide();
    } catch (error) {
      console.warn('Failed to hide keyboard:', error);
    }
  }, []);

  const setAccessoryBarVisible = useCallback(async (visible: boolean) => {
    try {
      // @ts-ignore - Capacitor Keyboard
      await window.Keyboard?.setAccessoryBarVisible({ isVisible: visible });
    } catch (error) {
      console.warn('Failed to set accessory bar visible:', error);
    }
  }, []);

  const setScroll = useCallback(async (scroll: boolean) => {
    try {
      // @ts-ignore - Capacitor Keyboard
      await window.Keyboard?.setScroll({ isDisabled: !scroll });
    } catch (error) {
      console.warn('Failed to set keyboard scroll:', error);
    }
  }, []);

  const setStyle = useCallback(async (style: 'light' | 'dark') => {
    try {
      // @ts-ignore - Capacitor Keyboard
      await window.Keyboard?.setStyle({ style });
    } catch (error) {
      console.warn('Failed to set keyboard style:', error);
    }
  }, []);

  const setResizeMode = useCallback(async (mode: 'native' | 'ionic' | 'body' | 'none') => {
    try {
      // @ts-ignore - Capacitor Keyboard
      await window.Keyboard?.setResizeMode({ mode });
    } catch (error) {
      console.warn('Failed to set keyboard resize mode:', error);
    }
  }, []);

  return {
    ...keyboardInfo,
    show,
    hide,
    setAccessoryBarVisible,
    setScroll,
    setStyle,
    setResizeMode
  };
}

// =============================================================================
// GESTURE HOOK
// =============================================================================

export interface GestureConfig {
  el: React.RefObject<HTMLElement>;
  threshold?: number;
  gestureName?: string;
  onStart?: () => void;
  onMove?: (detail: any) => void;
  onEnd?: (detail: any) => void;
}

/**
 * Hook for gesture handling
 */
export function useGesture(config: GestureConfig) {
  const gestureRef = useRef<any>(null);

  useEffect(() => {
    if (!config.el.current) return;

    const initGesture = async () => {
      try {
        // @ts-ignore - Ionic Gesture
        const { createGesture } = await import('@ionic/react');
        
        gestureRef.current = createGesture({
          el: config.el.current!,
          threshold: config.threshold || 15,
          gestureName: config.gestureName || 'custom-gesture',
          onStart: config.onStart,
          onMove: config.onMove,
          onEnd: config.onEnd
        });

        gestureRef.current.enable();
      } catch (error) {
        console.warn('Failed to create gesture:', error);
      }
    };

    initGesture();

    return () => {
      if (gestureRef.current) {
        gestureRef.current.destroy();
      }
    };
  }, [config]);

  return gestureRef.current;
}

// =============================================================================
// STORAGE HOOK
// =============================================================================

export interface StorageHook {
  get: (key: string) => Promise<string | null>;
  set: (key: string, value: string) => Promise<void>;
  remove: (key: string) => Promise<void>;
  clear: () => Promise<void>;
  keys: () => Promise<string[]>;
}

/**
 * Hook for secure storage functionality
 */
export function useStorage(): StorageHook {
  const get = useCallback(async (key: string): Promise<string | null> => {
    try {
      // @ts-ignore - Capacitor Storage
      const result = await window.Storage?.get({ key });
      return result?.value || null;
    } catch (error) {
      console.warn('Failed to get storage item:', error);
      return null;
    }
  }, []);

  const set = useCallback(async (key: string, value: string): Promise<void> => {
    try {
      // @ts-ignore - Capacitor Storage
      await window.Storage?.set({ key, value });
    } catch (error) {
      console.warn('Failed to set storage item:', error);
    }
  }, []);

  const remove = useCallback(async (key: string): Promise<void> => {
    try {
      // @ts-ignore - Capacitor Storage
      await window.Storage?.remove({ key });
    } catch (error) {
      console.warn('Failed to remove storage item:', error);
    }
  }, []);

  const clear = useCallback(async (): Promise<void> => {
    try {
      // @ts-ignore - Capacitor Storage
      await window.Storage?.clear();
    } catch (error) {
      console.warn('Failed to clear storage:', error);
    }
  }, []);

  const keys = useCallback(async (): Promise<string[]> => {
    try {
      // @ts-ignore - Capacitor Storage
      const result = await window.Storage?.keys();
      return result?.keys || [];
    } catch (error) {
      console.warn('Failed to get storage keys:', error);
      return [];
    }
  }, []);

  return { get, set, remove, clear, keys };
}

// =============================================================================
// NETWORK STATUS HOOK
// =============================================================================

export interface NetworkStatus {
  connected: boolean;
  connectionType: string;
}

/**
 * Hook for network status monitoring
 */
export function useNetworkStatus(): NetworkStatus {
  const [status, setStatus] = useState<NetworkStatus>({
    connected: true,
    connectionType: 'unknown'
  });

  useEffect(() => {
    if (typeof window === 'undefined' || !('Network' in window)) return;

    const checkStatus = async () => {
      try {
        // @ts-ignore - Capacitor Network
        const networkStatus = await window.Network?.getStatus();
        setStatus({
          connected: networkStatus?.connected || false,
          connectionType: networkStatus?.connectionType || 'unknown'
        });
      } catch (error) {
        console.warn('Failed to get network status:', error);
      }
    };

    checkStatus();

    // @ts-ignore - Capacitor Network
    const listener = window.Network?.addListener('networkStatusChange', (status: any) => {
      setStatus({
        connected: status.connected,
        connectionType: status.connectionType
      });
    });

    return () => {
      listener?.remove();
    };
  }, []);

  return status;
}