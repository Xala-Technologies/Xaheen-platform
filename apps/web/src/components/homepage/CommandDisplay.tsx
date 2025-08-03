import React, { useState } from "react";
import { Copy, Check, Terminal } from "lucide-react";
import {
  Card,
  Stack,
  Typography,
  Button,
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
        gap="md"
      >
        <Stack 
          direction="horizontal" 
          gap="sm"
          align="center"
        >
          <Terminal size={20} />
          <Typography variant="h4">
            {t("homepage.generated_command_title")}
          </Typography>
        </Stack>
        <Card variant="outlined" padding="sm">
          <Stack 
            direction="horizontal" 
            gap="sm"
            align="center"
          >
            <Typography
              variant="code"
              style={{ flex: 1 }}
            >
              <span>$</span>{" "}
              {command}
            </Typography>

            <Button
              variant="ghost"
              size="sm"
              onClick={handleCopy}
            >
              {copied ? (
                <>
                  <Check size={16} />
                  {t("homepage.copied_button")}
                </>
              ) : (
                <>
                  <Copy size={16} />
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
