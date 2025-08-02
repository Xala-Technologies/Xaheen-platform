interface PresetTemplate {
	id: string;
	name: string;
	description: string;
}

interface QuickPresetsProps {
	presets: readonly PresetTemplate[];
	onApplyPreset: (presetId: string) => void;
}

/**
 * QuickPresets component for displaying and applying preset configurations
 * Follows Single Responsibility Principle - only handles preset selection
 */
export const QuickPresets: React.FC<QuickPresetsProps> = ({
	presets,
	onApplyPreset,
}) => {
	return (
		<div className="mt-auto hidden border-border border-t pt-4 lg:flex lg:flex-col">
			<h3 className="mb-2 font-medium text-foreground text-sm">
				Quick Presets
			</h3>
			<div className="grid grid-cols-2 gap-2">
				{presets.map((preset) => (
					<button
						type="button"
						key={preset.id}
						onClick={() => onApplyPreset(preset.id)}
						className="rounded border border-border p-2 text-left transition-colors hover:bg-muted"
						title={preset.description}
					>
						<div className="font-medium text-foreground text-sm">
							{preset.name}
						</div>
						<div className="text-muted-foreground text-xs">
							{preset.description}
						</div>
					</button>
				))}
			</div>
		</div>
	);
};
