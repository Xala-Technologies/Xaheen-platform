import React from "react";
import { useLocalization } from "@/hooks/useLocalization";
import { PresetCard } from "./PresetCard";
import {
  Card,
  Stack,
  Typography,
  Skeleton,
  Grid,
  Container,
  useTokens,
} from "@xala-technologies/ui-system";

interface PresetStack {
  projectName: string;
  webFrontend: string[];
  nativeFrontend: string[];
  uiSystem: string;
  runtime: string;
  backend: string;
  database: string;
  orm: string;
  auth: string;
  packageManager: string;
  addons: string[];
  examples: string[];
  git: string;
  install: string;
  api: string;
  [key: string]: any;
}

interface Preset {
  id: string;
  name: string;
  description: string;
  projectType: string;
  stack: PresetStack;
  sort_order: number;
}

interface QuickStartTemplatesProps {
  presets: Preset[];
  selectedPresetId: string | null;
  isLoading: boolean;
  onPresetSelect: (preset: Preset) => void;
}

/**
 * QuickStartTemplates component displays preset cards or loading skeletons
 * Uses semantic UI components and localization
 * @param presets - Array of available presets
 * @param selectedPresetId - Currently selected preset ID
 * @param isLoading - Loading state
 * @param onPresetSelect - Callback when preset is selected
 * @returns Quick start templates component
 */
export function QuickStartTemplates({
  presets,
  selectedPresetId,
  isLoading,
  onPresetSelect,
}: QuickStartTemplatesProps): React.JSX.Element {
  const { t } = useLocalization();

  const handlePresetSelect = (preset: Preset): void => {
    onPresetSelect(preset);
  };

  const tokens = useTokens();

  const renderLoadingSkeleton = (): React.JSX.Element => (
    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: tokens.spacing[6] }}>
      {Array.from({ length: 9 }).map((_, index) => (
        <Skeleton
          key={index}
          height={200}
          width="100%"
          variant="text"
        />
      ))}
    </div>
  );

  const renderPresets = (): React.JSX.Element => (
    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: tokens.spacing[6] }}>
      {presets.slice(0, 12).map((preset) => (
        <PresetCard
          key={preset.id}
          preset={preset}
          isSelected={selectedPresetId === preset.id}
          onSelect={handlePresetSelect}
        />
      ))}
    </div>
  );

  return (
    <Stack 
      direction="vertical" 
      style={{ gap: tokens.spacing[8] }}
    >
      <Stack 
        direction="vertical" 
        style={{ gap: tokens.spacing[4], alignItems: 'center', textAlign: 'center' }}
      >
        <Typography variant="h2">
          {t('homepage.quick_templates_title')}
        </Typography>
        <Typography variant="body" style={{ color: tokens.colors.text?.muted }}>
          {t('homepage.quick_templates_description')}
        </Typography>
      </Stack>
      
      {isLoading ? renderLoadingSkeleton() : renderPresets()}
    </Stack>
  );
}
