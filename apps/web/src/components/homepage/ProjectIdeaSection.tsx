import React from "react";
import { Terminal } from "lucide-react";
import {
  Card,
  Stack,
  Typography,
  Button,
  Textarea,
} from "@xala-technologies/ui-system";
import { useLocalization } from "@/hooks/useLocalization";

interface ProjectIdeaSectionProps {
  projectIdea: string;
  onProjectIdeaChange: (value: string) => void;
  onGenerate: () => void;
}

/**
 * ProjectIdeaSection component for user input and project generation
 * Uses semantic UI components and localization
 * @param projectIdea - Current project idea text
 * @param onProjectIdeaChange - Callback when project idea changes
 * @param onGenerate - Callback when generate button is clicked
 * @returns Project idea section component
 */
export function ProjectIdeaSection({
  projectIdea,
  onProjectIdeaChange,
  onGenerate,
}: ProjectIdeaSectionProps): React.JSX.Element {
  const { t } = useLocalization();

  const handleTextareaChange = (event: React.ChangeEvent<HTMLTextAreaElement>): void => {
    onProjectIdeaChange(event.target.value);
  };

  const handleGenerateClick = (): void => {
    onGenerate();
  };

  return (
    <Card variant="elevated" padding="lg" suppressHydrationWarning>
      <Stack direction="vertical" gap="xl" align="center">
        <Stack direction="vertical" gap="md" align="center">
          <Typography variant="h2">
            {t("homepage.build_title")}
          </Typography>
          <Typography variant="body" color="muted">
            {t("homepage.build_description")}
          </Typography>
        </Stack>

        <Stack direction="vertical" gap="lg">
          <Textarea
            value={projectIdea}
            onChange={handleTextareaChange}
            placeholder={t("homepage.textarea_placeholder")}
            rows={4}
          />

          <Button
            variant="primary"
            size="lg"
            onClick={handleGenerateClick}
          >
            <Terminal size={16} />
            {t("homepage.generate_button")}
          </Button>
        </Stack>
      </Stack>
    </Card>
  );
}
