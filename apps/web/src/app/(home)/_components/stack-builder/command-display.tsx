import { useState } from "react";
import { Check, ClipboardCopy } from "lucide-react";
import { cn } from "@/lib/utils";

interface CommandDisplayProps {
	command: string;
	onCopy?: (command: string) => void;
}

/**
 * CommandDisplay component for showing and copying CLI commands
 * Follows Single Responsibility Principle - only handles command display and copy functionality
 */
export const CommandDisplay: React.FC<CommandDisplayProps> = ({
	command,
	onCopy,
}) => {
	const [copied, setCopied] = useState(false);

	const handleCopy = async (): Promise<void> => {
		try {
			await navigator.clipboard.writeText(command);
			setCopied(true);
			onCopy?.(command);
			setTimeout(() => setCopied(false), 2000);
		} catch (error) {
			console.error("Failed to copy command:", error);
		}
	};

	return (
		<div className="relative rounded border border-border p-2">
			<div className="flex">
				<span className="mr-2 select-none text-chart-4">$</span>
				<code className="block break-all text-muted-foreground text-xs sm:text-sm">
					{command}
				</code>
			</div>
			<div className="mt-2 flex justify-end">
				<button
					type="button"
					onClick={handleCopy}
					className={cn(
						"flex items-center gap-1 rounded px-2 py-1 text-xs transition-colors",
						copied
							? "bg-muted text-chart-4"
							: "text-muted-foreground hover:bg-muted hover:text-foreground",
					)}
					title={copied ? "Copied!" : "Copy command"}
				>
					{copied ? (
						<>
							<Check className="h-3 w-3 flex-shrink-0" />
							<span className="">Copied</span>
						</>
					) : (
						<>
							<ClipboardCopy className="h-3 w-3 flex-shrink-0" />
							<span className="">Copy</span>
						</>
					)}
				</button>
			</div>
		</div>
	);
};
