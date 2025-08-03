import React, { useState } from "react";
import { Copy, Check, Terminal } from "lucide-react";
import {
  Card,
  Stack,
  Typography,
  Button,
  useTokens,
} from "@xala-technologies/ui-system";
import { useLocalization } from "@/hooks/useLocalization";

interface CommandDisplayProps {
  command: string | null;
}

/**
 * CommandDisplay component shows the generated CLI command with copy functionality
 * Uses semantic UI components and localization
 * @param command - The command string to display
 * @returns Command display component
 */
export function CommandDisplay({ command }: CommandDisplayProps): React.JSX.Element {
  const { t } = useLocalization();
  const { colors, spacing, typography } = useTokens();
  const [copied, setCopied] = useState<boolean>(false);

  const handleCopy = (): void => {
    if (command) {
      navigator.clipboard.writeText(command);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  if (!command) return <></>;

  return (
    <Card
      variant="outlined"
      padding="md"
    >
      <Stack 
        direction="vertical" 
        style={{ gap: spacing[3] }}
      >
        <Stack 
          direction="horizontal" 
          style={{ gap: spacing[2], alignItems: 'center' }}
        >
          <Terminal
            style={{
              width: spacing[5],
              height: spacing[5],
              color: colors.primary[500],
            }}
          />
          <Typography variant="h4">
            {t("homepage.generated_command_title")}
          </Typography>
        </Stack>

        <Card variant="outlined" padding="sm">
          <Stack 
            direction="horizontal" 
            style={{ gap: spacing[2], alignItems: 'center' }}
          >
            <Typography
              variant="body"
              style={{
                flex: 1,
                color: colors.text?.primary,
                fontFamily: typography?.fontFamily?.mono,
              }}
            >
              <span style={{ color: colors.primary[500] }}>$</span>{" "}
              {command}
            </Typography>

            <Button
              variant="ghost"
              size="sm"
              onClick={handleCopy}
            >
              {copied ? (
                <>
                  <Check
                    style={{
                      width: spacing[4],
                      height: spacing[4],
                      color: colors.success?.[500],
                      marginRight: spacing[1],
                    }}
                  />
                  {t("homepage.copied_button")}
                </>
              ) : (
                <>
                  <Copy
                    style={{
                      width: spacing[4],
                      height: spacing[4],
                      marginRight: spacing[1],
                    }}
                  />
                  {t("homepage.copy_button")}
                </>
              )}
            </Button>
          </Stack>
        </Card>
      </Stack>
    </Card>
  );
}
