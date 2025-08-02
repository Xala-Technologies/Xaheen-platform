import type { ReactNode } from "react";

interface SelectedStackDisplayProps {
	selectedBadges: ReactNode;
}

/**
 * SelectedStackDisplay component for showing selected technologies
 * Follows Single Responsibility Principle - only handles selected stack display
 */
export const SelectedStackDisplay: React.FC<SelectedStackDisplayProps> = ({
	selectedBadges,
}) => {
	return (
		<div>
			<h3 className="mb-2 font-medium text-foreground text-sm">
				Selected Stack
			</h3>
			<div className="flex flex-wrap gap-1.5">{selectedBadges}</div>
		</div>
	);
};
