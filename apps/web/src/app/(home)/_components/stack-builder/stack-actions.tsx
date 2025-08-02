import { RefreshCw, Shuffle, Settings, Star, Share2 } from "lucide-react";
import type { StackState } from "@/lib/types/index";

interface StackActionsProps {
	onReset: () => void;
	onRandom: () => void;
	onLoadSaved: () => void;
	onSave: () => void;
	onShare: () => void;
	hasLastSavedStack: boolean;
}

/**
 * StackActions component for stack manipulation actions
 * Follows Single Responsibility Principle - only handles action buttons
 */
export const StackActions: React.FC<StackActionsProps> = ({
	onReset,
	onRandom,
	onLoadSaved,
	onSave,
	onShare,
	hasLastSavedStack,
}) => {
	return (
		<div className="flex flex-wrap gap-1">
			<button
				type="button"
				onClick={onReset}
				className="flex items-center gap-1 rounded border border-border px-2 py-1 text-muted-foreground text-xs transition-colors hover:bg-muted"
				title="Reset to defaults"
			>
				<RefreshCw className="h-3 w-3" />
				<span className="">Reset</span>
			</button>
			<button
				type="button"
				onClick={onRandom}
				className="flex items-center gap-1 rounded border border-border px-2 py-1 text-muted-foreground text-xs transition-colors hover:bg-muted"
				title="Generate a random stack"
			>
				<Shuffle className="h-3 w-3" />
				<span className="">Random</span>
			</button>
			{hasLastSavedStack && (
				<button
					type="button"
					onClick={onLoadSaved}
					className="flex items-center gap-1 rounded border border-border px-2 py-1 text-muted-foreground text-xs transition-colors hover:bg-muted"
					title="Load saved preferences"
				>
					<Settings className="h-3 w-3" />
					<span className="">Load</span>
				</button>
			)}
			<button
				type="button"
				onClick={onSave}
				className="flex items-center gap-1 rounded border border-border px-2 py-1 text-muted-foreground text-xs transition-colors hover:bg-muted"
				title="Save current preferences"
			>
				<Star className="h-3 w-3" />
				<span className="">Save</span>
			</button>
			<button
				type="button"
				onClick={onShare}
				className="flex items-center gap-1 rounded border border-border px-2 py-1 text-muted-foreground text-xs transition-colors hover:bg-muted"
				title="Share to Twitter"
			>
				<Share2 className="h-3 w-3" />
				<span className="">Share</span>
			</button>
		</div>
	);
};
