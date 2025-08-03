"use client";

import { useState } from "react";
import { Check, ClipboardCopy, Sparkles, Info } from "lucide-react";
import { cn } from "@/lib/utils";
import { Switch } from "@/components/ui/switch";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

interface CommandDisplayV2Props {
  command: string;
  commandV2?: string;
  onCopy?: (command: string) => void;
  defaultToCLIv2?: boolean;
}

/**
 * Enhanced CommandDisplay component supporting both CLI v1 and v2
 * Allows users to switch between legacy and new CLI commands
 */
export const CommandDisplayV2: React.FC<CommandDisplayV2Props> = ({
  command,
  commandV2,
  onCopy,
  defaultToCLIv2 = true,
}) => {
  const [copied, setCopied] = useState(false);
  const [useCLIv2, setUseCLIv2] = useState(defaultToCLIv2 && !!commandV2);

  const displayCommand = useCLIv2 && commandV2 ? commandV2 : command;

  const handleCopy = async (): Promise<void> => {
    try {
      await navigator.clipboard.writeText(displayCommand);
      setCopied(true);
      onCopy?.(displayCommand);
      setTimeout(() => setCopied(false), 2000);
    } catch (error) {
      console.error("Failed to copy command:", error);
    }
  };

  return (
    <div className="space-y-3">
      {commandV2 && (
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <label
              htmlFor="cli-version"
              className="text-sm font-medium text-foreground"
            >
              Use New CLI v2
            </label>
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <button
                    type="button"
                    className="text-muted-foreground hover:text-foreground"
                  >
                    <Info className="h-4 w-4" />
                  </button>
                </TooltipTrigger>
                <TooltipContent className="max-w-sm">
                  <p className="text-sm">
                    <strong>CLI v2 Features:</strong>
                  </p>
                  <ul className="mt-1 space-y-1 text-xs">
                    <li>• Service-based architecture</li>
                    <li>• Intelligent bundling</li>
                    <li>• Better TypeScript support</li>
                    <li>• Norwegian compliance built-in</li>
                    <li>• SOLID principles</li>
                  </ul>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          </div>
          <div className="flex items-center gap-2">
            <Switch
              id="cli-version"
              checked={useCLIv2}
              onCheckedChange={setUseCLIv2}
            />
            {useCLIv2 && (
              <span className="flex items-center gap-1 text-xs text-chart-4">
                <Sparkles className="h-3 w-3" />
                New
              </span>
            )}
          </div>
        </div>
      )}

      <div className="relative rounded border border-border bg-white p-3">
        <div className="flex items-start gap-2">
          <span className="select-none text-chart-4 font-mono">$</span>
          <code className="flex-1 break-all font-mono text-xs sm:text-sm text-muted-foreground">
            {displayCommand}
          </code>
        </div>
        
        <div className="mt-3 flex items-center justify-between">
          {useCLIv2 && (
            <span className="flex items-center gap-1 text-xs text-muted-foreground">
              <Sparkles className="h-3 w-3" />
              Using CLI v2 with service architecture
            </span>
          )}
          <button
            type="button"
            onClick={handleCopy}
            className={cn(
              "ml-auto flex items-center gap-1 rounded px-2 py-1 text-xs transition-colors",
              copied
                ? "bg-muted text-chart-4"
                : "text-muted-foreground hover:bg-muted hover:text-foreground",
            )}
            title={copied ? "Copied!" : "Copy command"}
          >
            {copied ? (
              <>
                <Check className="h-3 w-3 flex-shrink-0" />
                <span>Copied</span>
              </>
            ) : (
              <>
                <ClipboardCopy className="h-3 w-3 flex-shrink-0" />
                <span>Copy</span>
              </>
            )}
          </button>
        </div>
      </div>

      {useCLIv2 && (
        <div className="rounded-lg bg-chart-4/5 border border-chart-4/20 p-3">
          <p className="text-xs text-muted-foreground">
            <strong className="text-foreground">💡 Tip:</strong> CLI v2 uses intelligent service bundling.
            Try <code className="mx-1 rounded bg-white/50 px-1 py-0.5 font-mono">--preset saas-starter</code>
            for a complete SaaS setup with auth, database, payments, and more!
          </p>
        </div>
      )}
    </div>
  );
};