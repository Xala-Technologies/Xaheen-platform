import React from "react";
import { Check } from "lucide-react";
import { useLocalization } from "@/hooks/useLocalization";
import { 
  Card, 
  Stack, 
  Typography, 
  Badge
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
    >
      <Stack 
        direction="vertical" 
        gap="md"
      >
        <Stack 
          direction="horizontal" 
          gap="sm"
          align="center"
        >
          <Typography 
            variant="h4"
            color={isSelected ? "primary" : "default"}
          >
            {preset.name}
          </Typography>
          {isSelected && (
            <Check
              size={20}
            />
          )}
        </Stack>

        <Typography variant="body" color="muted">
          {preset.description}
        </Typography>

        <Stack 
          direction="horizontal" 
          gap="sm"
          wrap
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
