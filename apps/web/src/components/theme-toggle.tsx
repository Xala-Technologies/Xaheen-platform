"use client";

import { Moon, Sun } from "lucide-react";
import { useTheme } from "@xala-technologies/ui-system/hooks";
import { Button } from "@xala-technologies/ui-system";
import * as React from "react";

interface ThemeToggleProps {
  className?: string;
}

/**
 * ThemeToggle component for switching between light and dark themes
 * Uses UI System v5.0.0 native theme hooks and components
 * Compliant with accessibility standards and design system rules
 */
export function ThemeToggle({ className }: ThemeToggleProps): React.JSX.Element {
  const { theme, setTheme } = useTheme();

  const isDark = theme === "dark";

  const handleToggle = (): void => {
    setTheme(isDark ? "light" : "dark");
  };

  return (
    <Button
      variant="ghost"
      size="sm"
      onClick={handleToggle}
      className={className}
      aria-label={`Switch to ${isDark ? 'light' : 'dark'} theme`}
    >
      {isDark ? (
        <Sun size={16} />
      ) : (
        <Moon size={16} />
      )}
    </Button>
  );
}
