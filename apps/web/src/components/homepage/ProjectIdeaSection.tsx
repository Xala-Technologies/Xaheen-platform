import React from "react";
import { Terminal } from "lucide-react";
import {
  Card,
  Stack,
  Typography,
  Button,
  Textarea,
  useTokens,
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
  const tokens = useTokens();

  const handleTextareaChange = (event: React.ChangeEvent<HTMLTextAreaElement>): void => {
    onProjectIdeaChange(event.target.value);
  };

  const handleGenerateClick = (): void => {
    onGenerate();
  };

  return (
    <Card variant="elevated" padding="lg" suppressHydrationWarning>
      <Stack direction="vertical" style={{ gap: tokens.spacing[6], alignItems: 'center' }}>
        <Stack direction="vertical" style={{ gap: tokens.spacing[3], alignItems: 'center', textAlign: 'center' }}>
          <Typography variant="h2">
            {t("homepage.build_title")}
          </Typography>
          <Typography variant="body" style={{ color: tokens.colors.text?.muted }}>
            {t("homepage.build_description")}
          </Typography>
        </Stack>

        <Stack 
          direction="vertical" 
          style={{ gap: tokens.spacing[4], width: "100%", maxWidth: tokens.spacing[96] }}
        >
          <Textarea
            value={projectIdea}
            onChange={handleTextareaChange}
            placeholder={t("homepage.textarea_placeholder")}
            rows={4}
            style={{
              minHeight: tokens.spacing[32],
              resize: "none",
            }}
          />

          <Button
            variant="primary"
            size="lg"
            onClick={handleGenerateClick}
            style={{ alignSelf: "flex-end" }}
          >
            <Terminal
              style={{
                width: tokens.spacing[4],
                height: tokens.spacing[4],
                marginRight: tokens.spacing[2],
              }}
            />
            {t("homepage.generate_button")}
          </Button>
        </Stack>
      </Stack>
    </Card>
  );
}
