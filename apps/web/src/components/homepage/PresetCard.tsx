import React from "react";
import { Check } from "lucide-react";
import { useLocalization } from "@/hooks/useLocalization";
import { 
  Card, 
  Stack, 
  Typography, 
  Badge, 
  useTokens 
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

interface PresetCardProps {
  preset: Preset;
  isSelected: boolean;
  onSelect: (preset: Preset) => void;
}

/**
 * PresetCard component displays a project preset with its details
 * Uses semantic UI components and localization
 * @param preset - The preset data to display
 * @param isSelected - Whether this preset is currently selected
 * @param onSelect - Callback when preset is selected
 * @returns Preset card component
 */
export function PresetCard({
  preset,
  isSelected,
  onSelect,
}: PresetCardProps): React.JSX.Element {
  const { t } = useLocalization();
  const { colors, spacing } = useTokens();

  const handleClick = (): void => {
    onSelect(preset);
  };

  return (
    <Card
      variant={isSelected ? "elevated" : "default"}
      padding="md"
      onClick={handleClick}
      style={{
        cursor: "pointer",
      }}
    >
      <Stack 
        direction="vertical" 
        style={{ gap: spacing[3] }}
      >
        <Stack 
          direction="horizontal" 
          style={{ gap: spacing[2], alignItems: 'center' }}
        >
          <Typography 
            variant="h4"
            style={{ color: isSelected ? colors.primary[500] : undefined }}
          >
            {preset.name}
          </Typography>
          {isSelected && (
            <Check
              style={{
                width: spacing[5],
                height: spacing[5],
                color: colors.primary[500],
              }}
            />
          )}
        </Stack>

        <Typography variant="body" style={{ color: colors.text?.muted }}>
          {preset.description}
        </Typography>

        <Stack 
          direction="horizontal" 
          style={{ gap: spacing[2], flexWrap: 'wrap' }}
        >
          {preset.stack.webFrontend
            .filter((tech: string) => tech !== "none")
            .slice(0, 3)
            .map((tech: string) => (
              <Badge key={tech} variant="secondary">
                {tech}
              </Badge>
            ))}
          {preset.stack.backend && preset.stack.backend !== "none" && (
            <Badge variant="secondary">{preset.stack.backend}</Badge>
          )}
          {preset.stack.database && preset.stack.database !== "none" && (
            <Badge variant="secondary">{preset.stack.database}</Badge>
          )}
        </Stack>
      </Stack>
    </Card>
  );
}
