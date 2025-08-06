/**
 * Industry-Specific Theme System
 * Professional themes for different sectors with WCAG AAA compliance
 * Each theme includes light, dark, and high contrast modes
 */

// Removed unused import

export interface ThemeColors {
  // Core brand colors
  primary: Record<string, string>;
  secondary: Record<string, string>;
  accent: {
    primary: string;
    secondary: string;
    tertiary: string;
  };
  
  // Semantic colors
  semantic: {
    success: string;
    warning: string;
    error: string;
    info: string;
  };
  
  // UI colors
  background: {
    primary: string;
    secondary: string;
    tertiary: string;
    inverse: string;
  };
  surface: {
    primary: string;
    secondary: string;
    tertiary: string;
    elevated: string;
  };
  foreground: {
    primary: string;
    secondary: string;
    tertiary: string;
    muted: string;
    inverse: string;
  };
  border: {
    primary: string;
    secondary: string;
    tertiary: string;
    focus: string;
  };
  
  // Special effects
  gradient: {
    primary: string;
    secondary: string;
    accent: string;
  };
}

export interface ThemeMode {
  light: ThemeColors;
  dark: ThemeColors;
  highContrast: ThemeColors;
}

export interface ThemeConfig {
  name: string;
  description: string;
  industry: string;
  colors: ThemeMode;
  typography: {
    headingFont?: string;
    bodyFont?: string;
    codeFont?: string;
    fontScale?: 'default' | 'large' | 'compact';
  };
  spacing: {
    scale?: 'default' | 'comfortable' | 'compact';
  };
  borderRadius: {
    scale?: 'default' | 'rounded' | 'sharp';
  };
  effects: {
    shadowIntensity?: 'default' | 'subtle' | 'strong';
    glassEffect?: boolean;
    animations?: 'default' | 'reduced' | 'enhanced';
  };
}

// High contrast utility - creates maximum contrast theme
const createHighContrastTheme = (): ThemeColors => ({
  primary: {
    50: 'hsl(0, 0%, 0%)',       // Pure black
    100: 'hsl(0, 0%, 10%)',
    200: 'hsl(0, 0%, 20%)',
    300: 'hsl(0, 0%, 30%)',
    400: 'hsl(0, 0%, 40%)',
    500: 'hsl(0, 0%, 0%)',      // Pure black for maximum contrast
    600: 'hsl(0, 0%, 0%)',
    700: 'hsl(0, 0%, 0%)',
    800: 'hsl(0, 0%, 0%)',
    900: 'hsl(0, 0%, 0%)',
    950: 'hsl(0, 0%, 0%)',
  },
  secondary: {
    50: 'hsl(0, 0%, 100%)',     // Pure white
    100: 'hsl(0, 0%, 90%)',
    200: 'hsl(0, 0%, 80%)',
    300: 'hsl(0, 0%, 70%)',
    400: 'hsl(0, 0%, 60%)',
    500: 'hsl(0, 0%, 100%)',    // Pure white for maximum contrast
    600: 'hsl(0, 0%, 100%)',
    700: 'hsl(0, 0%, 100%)',
    800: 'hsl(0, 0%, 100%)',
    900: 'hsl(0, 0%, 100%)',
    950: 'hsl(0, 0%, 100%)',
  },
  accent: {
    primary: 'hsl(0, 0%, 0%)',         // Black
    secondary: 'hsl(0, 0%, 100%)',     // White
    tertiary: 'hsl(0, 0%, 50%)',       // Mid gray
  },
  semantic: {
    success: 'hsl(0, 0%, 0%)',         // Black for maximum contrast
    warning: 'hsl(0, 0%, 0%)',
    error: 'hsl(0, 0%, 0%)',
    info: 'hsl(0, 0%, 0%)',
  },
  background: {
    primary: 'hsl(0, 0%, 100%)',       // Pure white background
    secondary: 'hsl(0, 0%, 95%)',
    tertiary: 'hsl(0, 0%, 90%)',
    inverse: 'hsl(0, 0%, 0%)',         // Pure black
  },
  surface: {
    primary: 'hsl(0, 0%, 100%)',
    secondary: 'hsl(0, 0%, 98%)',
    tertiary: 'hsl(0, 0%, 95%)',
    elevated: 'hsl(0, 0%, 100%)',
  },
  foreground: {
    primary: 'hsl(0, 0%, 0%)',         // Pure black text
    secondary: 'hsl(0, 0%, 15%)',
    tertiary: 'hsl(0, 0%, 25%)',
    muted: 'hsl(0, 0%, 35%)',
    inverse: 'hsl(0, 0%, 100%)',       // Pure white text
  },
  border: {
    primary: 'hsl(0, 0%, 0%)',         // Black borders for maximum contrast
    secondary: 'hsl(0, 0%, 15%)',
    tertiary: 'hsl(0, 0%, 30%)',
    focus: 'hsl(45, 100%, 50%)',       // Yellow focus for visibility
  },
  gradient: {
    primary: 'linear-gradient(135deg, hsl(0, 0%, 0%) 0%, hsl(0, 0%, 15%) 100%)',
    secondary: 'linear-gradient(135deg, hsl(0, 0%, 85%) 0%, hsl(0, 0%, 100%) 100%)',
    accent: 'linear-gradient(135deg, hsl(0, 0%, 0%) 0%, hsl(0, 0%, 100%) 100%)',
  },
});

// Education Theme - Friendly, approachable, accessible
export const educationTheme: ThemeConfig = {
  name: 'Education',
  description: 'Friendly and accessible theme for educational institutions',
  industry: 'education',
  colors: {
    light: {
      primary: {
        50: 'hsl(211, 100%, 97%)',   // Light sky blue
        100: 'hsl(211, 100%, 94%)',
        200: 'hsl(211, 100%, 87%)',
        300: 'hsl(211, 100%, 77%)',
        400: 'hsl(211, 100%, 65%)',
        500: 'hsl(211, 100%, 50%)',  // Bright blue
        600: 'hsl(211, 100%, 43%)',
        700: 'hsl(211, 100%, 36%)',
        800: 'hsl(211, 100%, 29%)',
        900: 'hsl(211, 100%, 22%)',
        950: 'hsl(211, 100%, 15%)',
      },
      secondary: {
        50: 'hsl(39, 100%, 97%)',    // Light amber
        100: 'hsl(39, 100%, 94%)',
        200: 'hsl(39, 100%, 87%)',
        300: 'hsl(39, 100%, 77%)',
        400: 'hsl(39, 100%, 65%)',
        500: 'hsl(39, 100%, 50%)',   // Warm amber
        600: 'hsl(39, 92%, 43%)',
        700: 'hsl(39, 85%, 36%)',
        800: 'hsl(39, 78%, 29%)',
        900: 'hsl(39, 71%, 22%)',
        950: 'hsl(39, 64%, 15%)',
      },
      accent: {
        primary: 'hsl(161, 79%, 45%)',    // Teal - creativity
        secondary: 'hsl(333, 71%, 51%)',  // Pink - engagement
        tertiary: 'hsl(51, 100%, 50%)',   // Yellow - energy
      },
      semantic: {
        success: 'hsl(142, 71%, 40%)',    // Darker for better contrast
        warning: 'hsl(38, 92%, 45%)',     // Darker for better contrast
        error: 'hsl(0, 72%, 45%)',        // Darker for better contrast
        info: 'hsl(199, 89%, 42%)',       // Darker for better contrast
      },
      background: {
        primary: 'hsl(0, 0%, 100%)',
        secondary: 'hsl(210, 40%, 98%)',
        tertiary: 'hsl(210, 40%, 96%)',
        inverse: 'hsl(211, 100%, 22%)',
      },
      surface: {
        primary: 'hsl(0, 0%, 100%)',
        secondary: 'hsl(210, 40%, 99%)',
        tertiary: 'hsl(210, 40%, 97%)',
        elevated: 'hsl(0, 0%, 100%)',
      },
      foreground: {
        primary: 'hsl(211, 100%, 15%)',
        secondary: 'hsl(211, 50%, 30%)',   // Darker for better contrast
        tertiary: 'hsl(211, 30%, 40%)',    // Darker for better contrast
        muted: 'hsl(211, 20%, 50%)',       // Darker for better contrast
        inverse: 'hsl(0, 0%, 100%)',
      },
      border: {
        primary: 'hsl(211, 30%, 80%)',     // Darker for better contrast
        secondary: 'hsl(211, 20%, 85%)',
        tertiary: 'hsl(211, 10%, 90%)',
        focus: 'hsl(211, 100%, 50%)',
      },
      gradient: {
        primary: 'linear-gradient(135deg, hsl(211, 100%, 50%) 0%, hsl(199, 89%, 48%) 100%)',
        secondary: 'linear-gradient(135deg, hsl(39, 100%, 50%) 0%, hsl(51, 100%, 50%) 100%)',
        accent: 'linear-gradient(135deg, hsl(161, 79%, 45%) 0%, hsl(211, 100%, 50%) 100%)',
      },
    },
    dark: {
      primary: {
        50: 'hsl(211, 100%, 15%)',
        100: 'hsl(211, 100%, 18%)',
        200: 'hsl(211, 100%, 24%)',
        300: 'hsl(211, 100%, 32%)',
        400: 'hsl(211, 100%, 42%)',
        500: 'hsl(211, 100%, 65%)',  // Brighter for dark mode
        600: 'hsl(211, 100%, 75%)',
        700: 'hsl(211, 100%, 82%)',
        800: 'hsl(211, 100%, 88%)',
        900: 'hsl(211, 100%, 94%)',
        950: 'hsl(211, 100%, 97%)',
      },
      secondary: {
        50: 'hsl(39, 64%, 15%)',
        100: 'hsl(39, 71%, 22%)',
        200: 'hsl(39, 78%, 29%)',
        300: 'hsl(39, 85%, 36%)',
        400: 'hsl(39, 92%, 43%)',
        500: 'hsl(39, 100%, 70%)',   // Brighter for dark mode
        600: 'hsl(39, 100%, 80%)',
        700: 'hsl(39, 100%, 87%)',
        800: 'hsl(39, 100%, 92%)',
        900: 'hsl(39, 100%, 96%)',
        950: 'hsl(39, 100%, 98%)',
      },
      accent: {
        primary: 'hsl(161, 79%, 65%)',    // Brighter teal
        secondary: 'hsl(333, 71%, 70%)',  // Brighter pink
        tertiary: 'hsl(51, 100%, 70%)',   // Brighter yellow
      },
      semantic: {
        success: 'hsl(142, 71%, 65%)',
        warning: 'hsl(38, 92%, 70%)',
        error: 'hsl(0, 72%, 70%)',
        info: 'hsl(199, 89%, 70%)',
      },
      background: {
        primary: 'hsl(211, 40%, 8%)',
        secondary: 'hsl(211, 35%, 12%)',
        tertiary: 'hsl(211, 30%, 16%)',
        inverse: 'hsl(0, 0%, 98%)',
      },
      surface: {
        primary: 'hsl(211, 35%, 12%)',
        secondary: 'hsl(211, 30%, 16%)',
        tertiary: 'hsl(211, 25%, 20%)',
        elevated: 'hsl(211, 25%, 24%)',
      },
      foreground: {
        primary: 'hsl(0, 0%, 98%)',
        secondary: 'hsl(211, 20%, 80%)',
        tertiary: 'hsl(211, 20%, 65%)',
        muted: 'hsl(211, 20%, 50%)',
        inverse: 'hsl(211, 100%, 15%)',
      },
      border: {
        primary: 'hsl(211, 20%, 25%)',
        secondary: 'hsl(211, 15%, 20%)',
        tertiary: 'hsl(211, 10%, 16%)',
        focus: 'hsl(211, 100%, 65%)',
      },
      gradient: {
        primary: 'linear-gradient(135deg, hsl(211, 100%, 65%) 0%, hsl(199, 89%, 70%) 100%)',
        secondary: 'linear-gradient(135deg, hsl(39, 100%, 70%) 0%, hsl(51, 100%, 70%) 100%)',
        accent: 'linear-gradient(135deg, hsl(161, 79%, 65%) 0%, hsl(211, 100%, 65%) 100%)',
      },
    },
    highContrast: createHighContrastTheme(),
  },
  typography: {
    headingFont: 'Inter Display',
    bodyFont: 'Inter',
    fontScale: 'large', // Better readability for learning
  },
  spacing: {
    scale: 'comfortable', // More breathing room
  },
  borderRadius: {
    scale: 'rounded', // Friendly appearance
  },
  effects: {
    shadowIntensity: 'subtle',
    glassEffect: false,
    animations: 'default',
  },
};

// Healthcare Theme - Clean, trustworthy, calming
export const healthcareTheme: ThemeConfig = {
  name: 'Healthcare',
  description: 'Clean and trustworthy theme for healthcare applications',
  industry: 'healthcare',
  colors: {
    light: {
      primary: {
        50: 'hsl(170, 60%, 97%)',   // Light teal
        100: 'hsl(170, 60%, 94%)',
        200: 'hsl(170, 60%, 87%)',
        300: 'hsl(170, 60%, 77%)',
        400: 'hsl(170, 60%, 65%)',
        500: 'hsl(170, 60%, 50%)',  // Medical teal
        600: 'hsl(170, 60%, 43%)',
        700: 'hsl(170, 60%, 36%)',
        800: 'hsl(170, 60%, 29%)',
        900: 'hsl(170, 60%, 22%)',
        950: 'hsl(170, 60%, 15%)',
      },
      secondary: {
        50: 'hsl(210, 50%, 97%)',   // Light blue-gray
        100: 'hsl(210, 50%, 94%)',
        200: 'hsl(210, 50%, 87%)',
        300: 'hsl(210, 50%, 77%)',
        400: 'hsl(210, 50%, 65%)',
        500: 'hsl(210, 50%, 50%)',
        600: 'hsl(210, 50%, 43%)',
        700: 'hsl(210, 50%, 36%)',
        800: 'hsl(210, 50%, 29%)',
        900: 'hsl(210, 50%, 22%)',
        950: 'hsl(210, 50%, 15%)',
      },
      accent: {
        primary: 'hsl(150, 80%, 40%)',    // Green - health (darker for contrast)
        secondary: 'hsl(200, 70%, 45%)',  // Light blue - trust (darker for contrast)
        tertiary: 'hsl(0, 0%, 45%)',      // Gray - professional (darker for contrast)
      },
      semantic: {
        success: 'hsl(150, 80%, 37%)',
        warning: 'hsl(38, 85%, 50%)',
        error: 'hsl(0, 65%, 46%)',
        info: 'hsl(200, 85%, 45%)',
      },
      background: {
        primary: 'hsl(0, 0%, 100%)',
        secondary: 'hsl(170, 30%, 98%)',
        tertiary: 'hsl(170, 20%, 96%)',
        inverse: 'hsl(170, 60%, 20%)',
      },
      surface: {
        primary: 'hsl(0, 0%, 100%)',
        secondary: 'hsl(170, 15%, 99%)',
        tertiary: 'hsl(170, 10%, 97%)',
        elevated: 'hsl(0, 0%, 100%)',
      },
      foreground: {
        primary: 'hsl(170, 40%, 12%)',    // Darker for better contrast
        secondary: 'hsl(170, 20%, 30%)',   // Darker for better contrast
        tertiary: 'hsl(170, 10%, 40%)',    // Darker for better contrast
        muted: 'hsl(170, 5%, 50%)',        // Darker for better contrast
        inverse: 'hsl(0, 0%, 100%)',
      },
      border: {
        primary: 'hsl(170, 20%, 80%)',     // Darker for better contrast
        secondary: 'hsl(170, 15%, 85%)',
        tertiary: 'hsl(170, 10%, 90%)',
        focus: 'hsl(170, 60%, 50%)',
      },
      gradient: {
        primary: 'linear-gradient(135deg, hsl(170, 60%, 50%) 0%, hsl(150, 80%, 45%) 100%)',
        secondary: 'linear-gradient(135deg, hsl(200, 70%, 50%) 0%, hsl(170, 60%, 50%) 100%)',
        accent: 'linear-gradient(135deg, hsl(170, 60%, 94%) 0%, hsl(200, 70%, 94%) 100%)',
      },
    },
    dark: {
      primary: {
        50: 'hsl(170, 60%, 15%)',
        100: 'hsl(170, 60%, 20%)',
        200: 'hsl(170, 60%, 28%)',
        300: 'hsl(170, 60%, 38%)',
        400: 'hsl(170, 60%, 48%)',
        500: 'hsl(170, 60%, 70%)',  // Brighter for dark mode
        600: 'hsl(170, 60%, 80%)',
        700: 'hsl(170, 60%, 87%)',
        800: 'hsl(170, 60%, 92%)',
        900: 'hsl(170, 60%, 96%)',
        950: 'hsl(170, 60%, 98%)',
      },
      secondary: {
        50: 'hsl(210, 50%, 15%)',
        100: 'hsl(210, 50%, 22%)',
        200: 'hsl(210, 50%, 29%)',
        300: 'hsl(210, 50%, 36%)',
        400: 'hsl(210, 50%, 43%)',
        500: 'hsl(210, 50%, 70%)',  // Brighter for dark mode
        600: 'hsl(210, 50%, 80%)',
        700: 'hsl(210, 50%, 87%)',
        800: 'hsl(210, 50%, 92%)',
        900: 'hsl(210, 50%, 96%)',
        950: 'hsl(210, 50%, 98%)',
      },
      accent: {
        primary: 'hsl(150, 80%, 65%)',    // Brighter green
        secondary: 'hsl(200, 70%, 70%)',  // Brighter blue
        tertiary: 'hsl(0, 0%, 75%)',      // Lighter gray
      },
      semantic: {
        success: 'hsl(150, 80%, 60%)',
        warning: 'hsl(38, 85%, 70%)',
        error: 'hsl(0, 65%, 70%)',
        info: 'hsl(200, 85%, 70%)',
      },
      background: {
        primary: 'hsl(170, 30%, 8%)',
        secondary: 'hsl(170, 25%, 12%)',
        tertiary: 'hsl(170, 20%, 16%)',
        inverse: 'hsl(0, 0%, 98%)',
      },
      surface: {
        primary: 'hsl(170, 25%, 12%)',
        secondary: 'hsl(170, 20%, 16%)',
        tertiary: 'hsl(170, 15%, 20%)',
        elevated: 'hsl(170, 15%, 24%)',
      },
      foreground: {
        primary: 'hsl(0, 0%, 98%)',
        secondary: 'hsl(170, 20%, 80%)',
        tertiary: 'hsl(170, 15%, 65%)',
        muted: 'hsl(170, 10%, 50%)',
        inverse: 'hsl(170, 40%, 15%)',
      },
      border: {
        primary: 'hsl(170, 20%, 25%)',
        secondary: 'hsl(170, 15%, 20%)',
        tertiary: 'hsl(170, 10%, 16%)',
        focus: 'hsl(170, 60%, 70%)',
      },
      gradient: {
        primary: 'linear-gradient(135deg, hsl(170, 60%, 70%) 0%, hsl(150, 80%, 65%) 100%)',
        secondary: 'linear-gradient(135deg, hsl(200, 70%, 70%) 0%, hsl(170, 60%, 70%) 100%)',
        accent: 'linear-gradient(135deg, hsl(170, 60%, 16%) 0%, hsl(200, 70%, 20%) 100%)',
      },
    },
    highContrast: createHighContrastTheme(),
  },
  typography: {
    fontScale: 'default',
  },
  spacing: {
    scale: 'default',
  },
  borderRadius: {
    scale: 'default',
  },
  effects: {
    shadowIntensity: 'subtle',
    glassEffect: false,
    animations: 'reduced', // Calming, minimal motion
  },
};

// Government Theme - Authoritative, accessible, trustworthy
export const governmentTheme: ThemeConfig = {
  name: 'Government',
  description: 'Authoritative and accessible theme for government services',
  industry: 'government',
  colors: {
    light: {
      primary: {
        50: 'hsl(215, 60%, 97%)',   // Light navy
        100: 'hsl(215, 60%, 94%)',
        200: 'hsl(215, 60%, 87%)',
        300: 'hsl(215, 60%, 77%)',
        400: 'hsl(215, 60%, 65%)',
        500: 'hsl(215, 60%, 50%)',  // Government blue
        600: 'hsl(215, 70%, 35%)',  // Dark navy
        700: 'hsl(215, 75%, 28%)',
        800: 'hsl(215, 80%, 21%)',
        900: 'hsl(215, 85%, 14%)',
        950: 'hsl(215, 90%, 10%)',
      },
      secondary: {
        50: 'hsl(0, 65%, 97%)',     // Light red
        100: 'hsl(0, 65%, 94%)',
        200: 'hsl(0, 65%, 87%)',
        300: 'hsl(0, 65%, 77%)',
        400: 'hsl(0, 65%, 65%)',
        500: 'hsl(0, 65%, 50%)',    // Official red
        600: 'hsl(0, 65%, 43%)',
        700: 'hsl(0, 65%, 36%)',
        800: 'hsl(0, 65%, 29%)',
        900: 'hsl(0, 65%, 22%)',
        950: 'hsl(0, 65%, 15%)',
      },
      accent: {
        primary: 'hsl(0, 0%, 40%)',       // Gray - neutral (darker for contrast)
        secondary: 'hsl(215, 60%, 45%)',  // Blue - trust (darker for contrast)
        tertiary: 'hsl(0, 65%, 45%)',     // Red - important (darker for contrast)
      },
      semantic: {
        success: 'hsl(142, 60%, 30%)',    // Darker for better contrast
        warning: 'hsl(38, 85%, 40%)',     // Darker for better contrast
        error: 'hsl(0, 65%, 40%)',        // Darker for better contrast
        info: 'hsl(215, 60%, 45%)',       // Darker for better contrast
      },
      background: {
        primary: 'hsl(0, 0%, 100%)',
        secondary: 'hsl(215, 20%, 98%)',
        tertiary: 'hsl(215, 15%, 96%)',
        inverse: 'hsl(215, 75%, 18%)',
      },
      surface: {
        primary: 'hsl(0, 0%, 100%)',
        secondary: 'hsl(215, 10%, 99%)',
        tertiary: 'hsl(215, 10%, 97%)',
        elevated: 'hsl(0, 0%, 100%)',
      },
      foreground: {
        primary: 'hsl(215, 90%, 8%)',     // Darker for better contrast
        secondary: 'hsl(215, 40%, 20%)',  // Darker for better contrast
        tertiary: 'hsl(215, 20%, 35%)',   // Darker for better contrast
        muted: 'hsl(215, 10%, 50%)',      // Darker for better contrast
        inverse: 'hsl(0, 0%, 100%)',
      },
      border: {
        primary: 'hsl(215, 20%, 75%)',    // Darker for better contrast
        secondary: 'hsl(215, 15%, 80%)',
        tertiary: 'hsl(215, 10%, 85%)',
        focus: 'hsl(215, 60%, 50%)',
      },
      gradient: {
        primary: 'linear-gradient(135deg, hsl(215, 60%, 35%) 0%, hsl(215, 75%, 28%) 100%)',
        secondary: 'linear-gradient(135deg, hsl(0, 65%, 50%) 0%, hsl(0, 65%, 35%) 100%)',
        accent: 'linear-gradient(135deg, hsl(215, 60%, 50%) 0%, hsl(0, 65%, 50%) 100%)',
      },
    },
    dark: {
      primary: {
        50: 'hsl(215, 90%, 10%)',
        100: 'hsl(215, 85%, 14%)',
        200: 'hsl(215, 80%, 21%)',
        300: 'hsl(215, 75%, 28%)',
        400: 'hsl(215, 70%, 35%)',
        500: 'hsl(215, 60%, 70%)',  // Brighter for dark mode
        600: 'hsl(215, 60%, 80%)',
        700: 'hsl(215, 60%, 87%)',
        800: 'hsl(215, 60%, 92%)',
        900: 'hsl(215, 60%, 96%)',
        950: 'hsl(215, 60%, 98%)',
      },
      secondary: {
        50: 'hsl(0, 65%, 15%)',
        100: 'hsl(0, 65%, 22%)',
        200: 'hsl(0, 65%, 29%)',
        300: 'hsl(0, 65%, 36%)',
        400: 'hsl(0, 65%, 43%)',
        500: 'hsl(0, 65%, 70%)',    // Brighter for dark mode
        600: 'hsl(0, 65%, 80%)',
        700: 'hsl(0, 65%, 87%)',
        800: 'hsl(0, 65%, 92%)',
        900: 'hsl(0, 65%, 96%)',
        950: 'hsl(0, 65%, 98%)',
      },
      accent: {
        primary: 'hsl(0, 0%, 75%)',       // Lighter gray
        secondary: 'hsl(215, 60%, 70%)',  // Brighter blue
        tertiary: 'hsl(0, 65%, 70%)',     // Brighter red
      },
      semantic: {
        success: 'hsl(142, 60%, 60%)',
        warning: 'hsl(38, 85%, 70%)',
        error: 'hsl(0, 65%, 70%)',
        info: 'hsl(215, 60%, 70%)',
      },
      background: {
        primary: 'hsl(215, 40%, 6%)',
        secondary: 'hsl(215, 35%, 10%)',
        tertiary: 'hsl(215, 30%, 14%)',
        inverse: 'hsl(0, 0%, 98%)',
      },
      surface: {
        primary: 'hsl(215, 35%, 10%)',
        secondary: 'hsl(215, 30%, 14%)',
        tertiary: 'hsl(215, 25%, 18%)',
        elevated: 'hsl(215, 25%, 22%)',
      },
      foreground: {
        primary: 'hsl(0, 0%, 98%)',
        secondary: 'hsl(215, 20%, 80%)',
        tertiary: 'hsl(215, 15%, 65%)',
        muted: 'hsl(215, 10%, 50%)',
        inverse: 'hsl(215, 90%, 10%)',
      },
      border: {
        primary: 'hsl(215, 20%, 25%)',
        secondary: 'hsl(215, 15%, 20%)',
        tertiary: 'hsl(215, 10%, 16%)',
        focus: 'hsl(215, 60%, 70%)',
      },
      gradient: {
        primary: 'linear-gradient(135deg, hsl(215, 60%, 70%) 0%, hsl(215, 75%, 60%) 100%)',
        secondary: 'linear-gradient(135deg, hsl(0, 65%, 70%) 0%, hsl(0, 65%, 60%) 100%)',
        accent: 'linear-gradient(135deg, hsl(215, 60%, 70%) 0%, hsl(0, 65%, 70%) 100%)',
      },
    },
    highContrast: createHighContrastTheme(),
  },
  typography: {
    fontScale: 'default',
  },
  spacing: {
    scale: 'comfortable', // WCAG AAA accessibility
  },
  borderRadius: {
    scale: 'sharp', // Professional, serious
  },
  effects: {
    shadowIntensity: 'default',
    glassEffect: false,
    animations: 'reduced',
  },
};

// Enterprise Theme - Professional, modern, sophisticated
export const enterpriseTheme: ThemeConfig = {
  name: 'Enterprise',
  description: 'Professional and sophisticated theme for enterprise applications',
  industry: 'enterprise',
  colors: {
    light: {
      primary: {
        50: 'hsl(220, 60%, 97%)',   // Light slate
        100: 'hsl(220, 60%, 94%)',
        200: 'hsl(220, 60%, 87%)',
        300: 'hsl(220, 60%, 77%)',
        400: 'hsl(220, 60%, 65%)',
        500: 'hsl(220, 60%, 50%)',  // Corporate blue
        600: 'hsl(220, 65%, 40%)',
        700: 'hsl(220, 70%, 32%)',
        800: 'hsl(220, 75%, 24%)',
        900: 'hsl(220, 80%, 16%)',
        950: 'hsl(220, 85%, 12%)',
      },
      secondary: {
        50: 'hsl(0, 0%, 97%)',      // Light gray
        100: 'hsl(0, 0%, 94%)',
        200: 'hsl(0, 0%, 87%)',
        300: 'hsl(0, 0%, 77%)',
        400: 'hsl(0, 0%, 65%)',
        500: 'hsl(0, 0%, 50%)',     // Medium gray
        600: 'hsl(0, 0%, 40%)',
        700: 'hsl(0, 0%, 30%)',
        800: 'hsl(0, 0%, 20%)',
        900: 'hsl(0, 0%, 10%)',
        950: 'hsl(0, 0%, 5%)',
      },
      accent: {
        primary: 'hsl(160, 100%, 30%)',   // Green - growth (darker for contrast)
        secondary: 'hsl(280, 60%, 45%)',  // Purple - innovation (darker for contrast)
        tertiary: 'hsl(40, 100%, 45%)',   // Gold - premium (darker for contrast)
      },
      semantic: {
        success: 'hsl(160, 100%, 30%)',
        warning: 'hsl(40, 100%, 45%)',
        error: 'hsl(0, 70%, 45%)',
        info: 'hsl(220, 60%, 45%)',
      },
      background: {
        primary: 'hsl(0, 0%, 100%)',
        secondary: 'hsl(220, 20%, 98%)',
        tertiary: 'hsl(220, 15%, 96%)',
        inverse: 'hsl(220, 80%, 16%)',
      },
      surface: {
        primary: 'hsl(0, 0%, 100%)',
        secondary: 'hsl(220, 10%, 99%)',
        tertiary: 'hsl(220, 10%, 97%)',
        elevated: 'hsl(0, 0%, 100%)',
      },
      foreground: {
        primary: 'hsl(220, 80%, 10%)',    // Darker for better contrast
        secondary: 'hsl(220, 40%, 25%)',  // Darker for better contrast
        tertiary: 'hsl(220, 20%, 40%)',   // Darker for better contrast
        muted: 'hsl(220, 10%, 55%)',      // Darker for better contrast
        inverse: 'hsl(0, 0%, 100%)',
      },
      border: {
        primary: 'hsl(220, 20%, 75%)',    // Darker for better contrast
        secondary: 'hsl(220, 15%, 80%)',
        tertiary: 'hsl(220, 10%, 85%)',
        focus: 'hsl(220, 60%, 50%)',
      },
      gradient: {
        primary: 'linear-gradient(135deg, hsl(220, 60%, 50%) 0%, hsl(220, 75%, 32%) 100%)',
        secondary: 'linear-gradient(135deg, hsl(280, 60%, 50%) 0%, hsl(220, 60%, 50%) 100%)',
        accent: 'linear-gradient(135deg, hsl(160, 100%, 35%) 0%, hsl(40, 100%, 50%) 100%)',
      },
    },
    dark: {
      primary: {
        50: 'hsl(220, 85%, 12%)',
        100: 'hsl(220, 80%, 16%)',
        200: 'hsl(220, 75%, 24%)',
        300: 'hsl(220, 70%, 32%)',
        400: 'hsl(220, 65%, 40%)',
        500: 'hsl(220, 60%, 70%)',  // Brighter for dark mode
        600: 'hsl(220, 60%, 80%)',
        700: 'hsl(220, 60%, 87%)',
        800: 'hsl(220, 60%, 92%)',
        900: 'hsl(220, 60%, 96%)',
        950: 'hsl(220, 60%, 98%)',
      },
      secondary: {
        50: 'hsl(0, 0%, 5%)',
        100: 'hsl(0, 0%, 10%)',
        200: 'hsl(0, 0%, 20%)',
        300: 'hsl(0, 0%, 30%)',
        400: 'hsl(0, 0%, 40%)',
        500: 'hsl(0, 0%, 65%)',     // Lighter for dark mode
        600: 'hsl(0, 0%, 75%)',
        700: 'hsl(0, 0%, 82%)',
        800: 'hsl(0, 0%, 88%)',
        900: 'hsl(0, 0%, 94%)',
        950: 'hsl(0, 0%, 98%)',
      },
      accent: {
        primary: 'hsl(160, 100%, 55%)',   // Brighter green
        secondary: 'hsl(280, 60%, 70%)',  // Brighter purple
        tertiary: 'hsl(40, 100%, 70%)',   // Brighter gold
      },
      semantic: {
        success: 'hsl(160, 100%, 55%)',
        warning: 'hsl(40, 100%, 70%)',
        error: 'hsl(0, 70%, 70%)',
        info: 'hsl(220, 60%, 70%)',
      },
      background: {
        primary: 'hsl(220, 40%, 8%)',
        secondary: 'hsl(220, 35%, 12%)',
        tertiary: 'hsl(220, 30%, 16%)',
        inverse: 'hsl(0, 0%, 98%)',
      },
      surface: {
        primary: 'hsl(220, 35%, 12%)',
        secondary: 'hsl(220, 30%, 16%)',
        tertiary: 'hsl(220, 25%, 20%)',
        elevated: 'hsl(220, 25%, 24%)',
      },
      foreground: {
        primary: 'hsl(0, 0%, 98%)',
        secondary: 'hsl(220, 20%, 80%)',
        tertiary: 'hsl(220, 15%, 65%)',
        muted: 'hsl(220, 10%, 50%)',
        inverse: 'hsl(220, 80%, 12%)',
      },
      border: {
        primary: 'hsl(220, 20%, 25%)',
        secondary: 'hsl(220, 15%, 20%)',
        tertiary: 'hsl(220, 10%, 16%)',
        focus: 'hsl(220, 60%, 70%)',
      },
      gradient: {
        primary: 'linear-gradient(135deg, hsl(220, 60%, 70%) 0%, hsl(220, 75%, 55%) 100%)',
        secondary: 'linear-gradient(135deg, hsl(280, 60%, 70%) 0%, hsl(220, 60%, 70%) 100%)',
        accent: 'linear-gradient(135deg, hsl(160, 100%, 55%) 0%, hsl(40, 100%, 70%) 100%)',
      },
    },
    highContrast: createHighContrastTheme(),
  },
  typography: {
    fontScale: 'default',
  },
  spacing: {
    scale: 'default',
  },
  borderRadius: {
    scale: 'default',
  },
  effects: {
    shadowIntensity: 'strong',
    glassEffect: true,
    animations: 'enhanced',
  },
};

// AI/Tech Theme - Futuristic, innovative, dynamic
export const aiTheme: ThemeConfig = {
  name: 'AI & Technology',
  description: 'Futuristic and innovative theme for AI and tech applications',
  industry: 'ai',
  colors: {
    light: {
      primary: {
        50: 'hsl(250, 100%, 97%)',  // Light purple
        100: 'hsl(250, 100%, 94%)',
        200: 'hsl(250, 100%, 87%)',
        300: 'hsl(250, 100%, 77%)',
        400: 'hsl(250, 100%, 65%)',
        500: 'hsl(250, 100%, 50%)', // Electric purple (darker for light mode)
        600: 'hsl(250, 100%, 45%)',
        700: 'hsl(250, 100%, 38%)',
        800: 'hsl(250, 100%, 30%)',
        900: 'hsl(250, 100%, 22%)',
        950: 'hsl(250, 100%, 14%)',
      },
      secondary: {
        50: 'hsl(180, 100%, 97%)',  // Light cyan
        100: 'hsl(180, 100%, 94%)',
        200: 'hsl(180, 100%, 87%)',
        300: 'hsl(180, 100%, 77%)',
        400: 'hsl(180, 100%, 65%)',
        500: 'hsl(180, 100%, 35%)', // Electric cyan (darker for light mode)
        600: 'hsl(180, 100%, 30%)',
        700: 'hsl(180, 100%, 25%)',
        800: 'hsl(180, 100%, 20%)',
        900: 'hsl(180, 100%, 15%)',
        950: 'hsl(180, 100%, 8%)',
      },
      accent: {
        primary: 'hsl(290, 100%, 50%)',   // Magenta - innovation (darker for contrast)
        secondary: 'hsl(140, 100%, 40%)', // Neon green - technology (darker for contrast)
        tertiary: 'hsl(30, 100%, 50%)',   // Orange - energy (darker for contrast)
      },
      semantic: {
        success: 'hsl(140, 100%, 40%)',
        warning: 'hsl(30, 100%, 50%)',
        error: 'hsl(350, 100%, 50%)',
        info: 'hsl(180, 100%, 35%)',
      },
      background: {
        primary: 'hsl(0, 0%, 100%)',
        secondary: 'hsl(250, 20%, 98%)',
        tertiary: 'hsl(250, 15%, 96%)',
        inverse: 'hsl(240, 20%, 8%)',
      },
      surface: {
        primary: 'hsl(0, 0%, 100%)',
        secondary: 'hsl(250, 10%, 99%)',
        tertiary: 'hsl(250, 10%, 97%)',
        elevated: 'hsl(0, 0%, 100%)',
      },
      foreground: {
        primary: 'hsl(250, 100%, 12%)',   // Darker for better contrast
        secondary: 'hsl(250, 50%, 25%)',  // Darker for better contrast
        tertiary: 'hsl(250, 30%, 40%)',   // Darker for better contrast
        muted: 'hsl(250, 20%, 55%)',      // Darker for better contrast
        inverse: 'hsl(0, 0%, 100%)',
      },
      border: {
        primary: 'hsl(250, 50%, 75%)',    // Darker for better contrast
        secondary: 'hsl(250, 30%, 80%)',
        tertiary: 'hsl(250, 20%, 85%)',
        focus: 'hsl(180, 100%, 35%)',
      },
      gradient: {
        primary: 'linear-gradient(135deg, hsl(250, 100%, 50%) 0%, hsl(180, 100%, 35%) 100%)',
        secondary: 'linear-gradient(135deg, hsl(290, 100%, 50%) 0%, hsl(140, 100%, 40%) 100%)',
        accent: 'linear-gradient(135deg, hsl(250, 100%, 50%) 0%, hsl(290, 100%, 50%) 50%, hsl(180, 100%, 35%) 100%)',
      },
    },
    dark: {
      primary: {
        50: 'hsl(250, 100%, 16%)',
        100: 'hsl(250, 100%, 24%)',
        200: 'hsl(250, 100%, 32%)',
        300: 'hsl(250, 100%, 40%)',
        400: 'hsl(250, 100%, 48%)',
        500: 'hsl(250, 100%, 70%)', // Brighter for dark mode
        600: 'hsl(250, 100%, 80%)',
        700: 'hsl(250, 100%, 87%)',
        800: 'hsl(250, 100%, 92%)',
        900: 'hsl(250, 100%, 96%)',
        950: 'hsl(250, 100%, 98%)',
      },
      secondary: {
        50: 'hsl(180, 100%, 10%)',
        100: 'hsl(180, 100%, 17%)',
        200: 'hsl(180, 100%, 24%)',
        300: 'hsl(180, 100%, 31%)',
        400: 'hsl(180, 100%, 38%)',
        500: 'hsl(180, 100%, 60%)', // Brighter for dark mode
        600: 'hsl(180, 100%, 70%)',
        700: 'hsl(180, 100%, 80%)',
        800: 'hsl(180, 100%, 87%)',
        900: 'hsl(180, 100%, 94%)',
        950: 'hsl(180, 100%, 98%)',
      },
      accent: {
        primary: 'hsl(290, 100%, 75%)',   // Brighter magenta
        secondary: 'hsl(140, 100%, 65%)', // Brighter green
        tertiary: 'hsl(30, 100%, 70%)',   // Brighter orange
      },
      semantic: {
        success: 'hsl(140, 100%, 65%)',
        warning: 'hsl(30, 100%, 70%)',
        error: 'hsl(350, 100%, 75%)',
        info: 'hsl(180, 100%, 60%)',
      },
      background: {
        primary: 'hsl(240, 20%, 6%)',     // Dark background
        secondary: 'hsl(240, 20%, 10%)',
        tertiary: 'hsl(240, 20%, 14%)',
        inverse: 'hsl(0, 0%, 100%)',
      },
      surface: {
        primary: 'hsl(240, 20%, 10%)',
        secondary: 'hsl(240, 20%, 14%)',
        tertiary: 'hsl(240, 20%, 18%)',
        elevated: 'hsl(240, 20%, 22%)',
      },
      foreground: {
        primary: 'hsl(0, 0%, 98%)',
        secondary: 'hsl(240, 20%, 80%)',
        tertiary: 'hsl(240, 20%, 65%)',
        muted: 'hsl(240, 20%, 50%)',
        inverse: 'hsl(240, 20%, 8%)',
      },
      border: {
        primary: 'hsl(250, 100%, 60%, 0.4)',
        secondary: 'hsl(250, 50%, 35%, 0.3)',
        tertiary: 'hsl(250, 30%, 25%, 0.2)',
        focus: 'hsl(180, 100%, 60%)',
      },
      gradient: {
        primary: 'linear-gradient(135deg, hsl(250, 100%, 70%) 0%, hsl(180, 100%, 60%) 100%)',
        secondary: 'linear-gradient(135deg, hsl(290, 100%, 75%) 0%, hsl(140, 100%, 65%) 100%)',
        accent: 'linear-gradient(135deg, hsl(250, 100%, 70%) 0%, hsl(290, 100%, 75%) 50%, hsl(180, 100%, 60%) 100%)',
      },
    },
    highContrast: createHighContrastTheme(),
  },
  typography: {
    headingFont: 'JetBrains Mono',
    bodyFont: 'Inter',
    codeFont: 'JetBrains Mono',
    fontScale: 'default',
  },
  spacing: {
    scale: 'compact',
  },
  borderRadius: {
    scale: 'sharp',
  },
  effects: {
    shadowIntensity: 'strong',
    glassEffect: true,
    animations: 'enhanced',
  },
};

// Private/Luxury Theme - Elegant, premium, exclusive
export const privateTheme: ThemeConfig = {
  name: 'Private & Luxury',
  description: 'Elegant and premium theme for private sector and luxury brands',
  industry: 'private',
  colors: {
    light: {
      primary: {
        50: 'hsl(30, 40%, 97%)',    // Light gold
        100: 'hsl(30, 40%, 94%)',
        200: 'hsl(30, 40%, 87%)',
        300: 'hsl(30, 40%, 77%)',
        400: 'hsl(30, 40%, 65%)',
        500: 'hsl(30, 40%, 45%)',   // Luxury gold (darker for light mode)
        600: 'hsl(30, 45%, 35%)',
        700: 'hsl(30, 50%, 25%)',
        800: 'hsl(30, 55%, 18%)',
        900: 'hsl(30, 60%, 8%)',
        950: 'hsl(30, 65%, 4%)',
      },
      secondary: {
        50: 'hsl(0, 0%, 97%)',      // Near white
        100: 'hsl(0, 0%, 94%)',
        200: 'hsl(0, 0%, 87%)',
        300: 'hsl(0, 0%, 77%)',
        400: 'hsl(0, 0%, 65%)',
        500: 'hsl(0, 0%, 15%)',     // Near black (darker for light mode)
        600: 'hsl(0, 0%, 12%)',
        700: 'hsl(0, 0%, 8%)',
        800: 'hsl(0, 0%, 5%)',
        900: 'hsl(0, 0%, 2%)',
        950: 'hsl(0, 0%, 0%)',      // Pure black
      },
      accent: {
        primary: 'hsl(0, 0%, 15%)',       // Black - elegance (darker for contrast)
        secondary: 'hsl(30, 40%, 45%)',   // Gold - luxury (darker for contrast)
        tertiary: 'hsl(0, 0%, 90%)',      // White - purity
      },
      semantic: {
        success: 'hsl(120, 30%, 35%)',
        warning: 'hsl(30, 60%, 45%)',
        error: 'hsl(0, 40%, 45%)',
        info: 'hsl(210, 30%, 45%)',
      },
      background: {
        primary: 'hsl(0, 0%, 100%)',
        secondary: 'hsl(30, 20%, 98%)',
        tertiary: 'hsl(30, 15%, 96%)',
        inverse: 'hsl(0, 0%, 5%)',
      },
      surface: {
        primary: 'hsl(0, 0%, 100%)',
        secondary: 'hsl(0, 0%, 99%)',
        tertiary: 'hsl(30, 10%, 98%)',
        elevated: 'hsl(0, 0%, 100%)',
      },
      foreground: {
        primary: 'hsl(0, 0%, 5%)',        // Darker for better contrast
        secondary: 'hsl(0, 0%, 15%)',     // Darker for better contrast
        tertiary: 'hsl(0, 0%, 30%)',      // Darker for better contrast
        muted: 'hsl(0, 0%, 45%)',         // Darker for better contrast
        inverse: 'hsl(0, 0%, 98%)',
      },
      border: {
        primary: 'hsl(30, 20%, 75%)',     // Darker for better contrast
        secondary: 'hsl(30, 15%, 80%)',
        tertiary: 'hsl(30, 10%, 85%)',
        focus: 'hsl(30, 40%, 45%)',
      },
      gradient: {
        primary: 'linear-gradient(135deg, hsl(30, 40%, 45%) 0%, hsl(30, 60%, 25%) 100%)',
        secondary: 'linear-gradient(135deg, hsl(0, 0%, 15%) 0%, hsl(0, 0%, 5%) 100%)',
        accent: 'linear-gradient(135deg, hsl(30, 40%, 94%) 0%, hsl(30, 40%, 87%) 100%)',
      },
    },
    dark: {
      primary: {
        50: 'hsl(30, 65%, 5%)',
        100: 'hsl(30, 60%, 10%)',
        200: 'hsl(30, 55%, 20%)',
        300: 'hsl(30, 50%, 30%)',
        400: 'hsl(30, 45%, 40%)',
        500: 'hsl(30, 40%, 70%)',   // Brighter gold for dark mode
        600: 'hsl(30, 40%, 80%)',
        700: 'hsl(30, 40%, 87%)',
        800: 'hsl(30, 40%, 92%)',
        900: 'hsl(30, 40%, 96%)',
        950: 'hsl(30, 40%, 98%)',
      },
      secondary: {
        50: 'hsl(0, 0%, 0%)',       // Pure black
        100: 'hsl(0, 0%, 4%)',
        200: 'hsl(0, 0%, 8%)',
        300: 'hsl(0, 0%, 12%)',
        400: 'hsl(0, 0%, 16%)',
        500: 'hsl(0, 0%, 85%)',     // Near white for dark mode
        600: 'hsl(0, 0%, 90%)',
        700: 'hsl(0, 0%, 94%)',
        800: 'hsl(0, 0%, 97%)',
        900: 'hsl(0, 0%, 99%)',
        950: 'hsl(0, 0%, 100%)',    // Pure white
      },
      accent: {
        primary: 'hsl(0, 0%, 85%)',       // White - elegance
        secondary: 'hsl(30, 40%, 70%)',   // Bright gold
        tertiary: 'hsl(0, 0%, 8%)',       // Black - depth
      },
      semantic: {
        success: 'hsl(120, 30%, 60%)',
        warning: 'hsl(30, 60%, 70%)',
        error: 'hsl(0, 40%, 70%)',
        info: 'hsl(210, 30%, 70%)',
      },
      background: {
        primary: 'hsl(0, 0%, 2%)',
        secondary: 'hsl(30, 20%, 6%)',
        tertiary: 'hsl(30, 15%, 10%)',
        inverse: 'hsl(0, 0%, 98%)',
      },
      surface: {
        primary: 'hsl(0, 0%, 6%)',
        secondary: 'hsl(0, 0%, 10%)',
        tertiary: 'hsl(30, 10%, 14%)',
        elevated: 'hsl(30, 10%, 18%)',
      },
      foreground: {
        primary: 'hsl(0, 0%, 98%)',
        secondary: 'hsl(0, 0%, 85%)',
        tertiary: 'hsl(0, 0%, 70%)',
        muted: 'hsl(0, 0%, 55%)',
        inverse: 'hsl(0, 0%, 8%)',
      },
      border: {
        primary: 'hsl(30, 20%, 20%)',
        secondary: 'hsl(30, 15%, 16%)',
        tertiary: 'hsl(30, 10%, 12%)',
        focus: 'hsl(30, 40%, 70%)',
      },
      gradient: {
        primary: 'linear-gradient(135deg, hsl(30, 40%, 70%) 0%, hsl(30, 60%, 50%) 100%)',
        secondary: 'linear-gradient(135deg, hsl(0, 0%, 85%) 0%, hsl(0, 0%, 65%) 100%)',
        accent: 'linear-gradient(135deg, hsl(30, 40%, 18%) 0%, hsl(30, 40%, 10%) 100%)',
      },
    },
    highContrast: createHighContrastTheme(),
  },
  typography: {
    headingFont: 'Playfair Display',
    bodyFont: 'Inter',
    fontScale: 'large',
  },
  spacing: {
    scale: 'comfortable',
  },
  borderRadius: {
    scale: 'sharp',
  },
  effects: {
    shadowIntensity: 'subtle',
    glassEffect: false,
    animations: 'default',
  },
};

// Theme registry
export const themes = {
  education: educationTheme,
  healthcare: healthcareTheme,
  government: governmentTheme,
  enterprise: enterpriseTheme,
  ai: aiTheme,
  private: privateTheme,
} as const;

// Theme type
export type ThemeName = keyof typeof themes;

// Helper function to get theme
export const getTheme = (themeName: ThemeName): ThemeConfig => {
  return themes[themeName];
};

// Helper function to apply theme CSS variables
export const applyTheme = (theme: ThemeConfig, mode: 'light' | 'dark' | 'highContrast' = 'light'): Record<string, string> => {
  const colors = theme.colors[mode];
  
  return {
    // Primary colors
    '--color-primary-50': colors.primary[50],
    '--color-primary-100': colors.primary[100],
    '--color-primary-200': colors.primary[200],
    '--color-primary-300': colors.primary[300],
    '--color-primary-400': colors.primary[400],
    '--color-primary-500': colors.primary[500],
    '--color-primary-600': colors.primary[600],
    '--color-primary-700': colors.primary[700],
    '--color-primary-800': colors.primary[800],
    '--color-primary-900': colors.primary[900],
    '--color-primary-950': colors.primary[950],
    
    // Secondary colors
    '--color-secondary-50': colors.secondary[50],
    '--color-secondary-100': colors.secondary[100],
    '--color-secondary-200': colors.secondary[200],
    '--color-secondary-300': colors.secondary[300],
    '--color-secondary-400': colors.secondary[400],
    '--color-secondary-500': colors.secondary[500],
    '--color-secondary-600': colors.secondary[600],
    '--color-secondary-700': colors.secondary[700],
    '--color-secondary-800': colors.secondary[800],
    '--color-secondary-900': colors.secondary[900],
    '--color-secondary-950': colors.secondary[950],
    
    // Accent colors
    '--color-accent-primary': colors.accent.primary,
    '--color-accent-secondary': colors.accent.secondary,
    '--color-accent-tertiary': colors.accent.tertiary,
    
    // Semantic colors
    '--color-success': colors.semantic.success,
    '--color-warning': colors.semantic.warning,
    '--color-error': colors.semantic.error,
    '--color-info': colors.semantic.info,
    
    // Background colors
    '--color-background': colors.background.primary,
    '--color-background-secondary': colors.background.secondary,
    '--color-background-tertiary': colors.background.tertiary,
    '--color-background-inverse': colors.background.inverse,
    
    // Surface colors
    '--color-surface': colors.surface.primary,
    '--color-surface-secondary': colors.surface.secondary,
    '--color-surface-tertiary': colors.surface.tertiary,
    '--color-surface-elevated': colors.surface.elevated,
    
    // Foreground colors
    '--color-foreground': colors.foreground.primary,
    '--color-foreground-secondary': colors.foreground.secondary,
    '--color-foreground-tertiary': colors.foreground.tertiary,
    '--color-foreground-muted': colors.foreground.muted,
    '--color-foreground-inverse': colors.foreground.inverse,
    
    // Border colors
    '--color-border': colors.border.primary,
    '--color-border-secondary': colors.border.secondary,
    '--color-border-tertiary': colors.border.tertiary,
    '--color-border-focus': colors.border.focus,
    
    // Gradients
    '--gradient-primary': colors.gradient.primary,
    '--gradient-secondary': colors.gradient.secondary,
    '--gradient-accent': colors.gradient.accent,
    
    // Typography
    '--font-family-heading': theme.typography.headingFont || 'var(--font-family-display)',
    '--font-family-body': theme.typography.bodyFont || 'var(--font-family-sans)',
    '--font-family-code': theme.typography.codeFont || 'var(--font-family-mono)',
    
    // Effects
    '--shadow-intensity': theme.effects.shadowIntensity || 'default',
    '--glass-effect': theme.effects.glassEffect ? '1' : '0',
    '--animation-speed': theme.effects.animations === 'enhanced' ? '1.2' : theme.effects.animations === 'reduced' ? '0.5' : '1',
  };
};

// Types are already exported above with interface definitions