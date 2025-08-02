"use client";

import { useMemo, useCallback } from "react";
import { ScrollArea } from "@/components/ui/scroll-area";
import { TooltipProvider } from "@/components/ui/tooltip";
import techOptionsData from "@/data/tech-options.json";
import projectTypesData from "@/data/project-types.json";
import quickPresetsData from "@/data/quick-presets.json";
import type {
	TechCategory,
	TechOptions,
	PresetTemplate,
	StackState,
	ProjectType,
} from "@/lib/types/base";
import { cn } from "@/lib/utils";

// Import modular components
import { TechCategorySection } from "./stack-builder/tech-category-section";
import { StackActions } from "./stack-builder/stack-actions";
import { CommandDisplay } from "./stack-builder/command-display";
import { SelectedStackDisplay } from "./stack-builder/selected-stack-display";
import { QuickPresets } from "./stack-builder/quick-presets";
import { useStackBuilder } from "./stack-builder/use-stack-builder";
import { getBadgeColors, getCategoryDisplayName } from "./stack-builder/utils";
import { analyzeStackCompatibility } from "./stack-builder/compatibility-analysis";
import { generateCommand } from "./stack-builder/command-generator";

const TECH_OPTIONS = techOptionsData as TechOptions;
const PROJECT_TYPES = projectTypesData as unknown as readonly ProjectType[];
const PRESET_TEMPLATES = quickPresetsData as unknown as readonly PresetTemplate[];

const CATEGORY_ORDER = Object.keys(TECH_OPTIONS) as TechCategory[];

/**
 * StackBuilder component - Refactored following SOLID principles
 * 
 * Single Responsibility: Main component only handles layout and coordination
 * Open/Closed: Extensible through modular components
 * Liskov Substitution: Components are interchangeable
 * Interface Segregation: Each component has focused interfaces
 * Dependency Inversion: Depends on abstractions (hooks and utilities)
 */
const StackBuilder: React.FC = () => {
	const {
		// State
		stack,
		setStack,
		projectName,
		setProjectName,
		copied,
		lastSavedStack,
		sectionRefs,
		contentRef,
		
		// Actions
		resetToDefaults,
		getRandomStack,
		loadSavedStack,
		saveCurrentStack,
		shareToTwitter,
		applyPreset,
		handleTechSelect,
		copyToClipboard,
		isOptionCompatible,
	} = useStackBuilder();

	// Analyze stack compatibility
	const compatibilityAnalysis = useMemo(() => 
		analyzeStackCompatibility(stack), [stack]
	);

	// Generate CLI command
	const command = useMemo(() => 
		generateCommand({ ...stack, projectName }), [stack, projectName]
	);

	// Generate selected badges
	const selectedBadges = useMemo(() => {
		const badges: React.ReactNode[] = [];
		
		Object.entries(stack).forEach(([categoryKey, value]) => {
			if (categoryKey === "projectName") return;
			
			const values = Array.isArray(value) ? value : [value];
			const validValues = values.filter(v => v && v !== "none" && v !== "false");
			
			validValues.forEach((val) => {
				const colorClasses = getBadgeColors(categoryKey);
				badges.push(
					<span
						key={`${categoryKey}-${val}`}
						className={cn(
							"inline-flex items-center rounded-full px-2 py-1 text-xs font-medium",
							colorClasses
						)}
					>
						{val}
					</span>
				);
			});
		});
		
		return badges;
	}, [stack]);

	// Memoized ref callback to prevent infinite re-renders
	const setSectionRef = useCallback((categoryKey: string) => {
		return (el: HTMLElement | null) => {
			sectionRefs.current[categoryKey] = el;
		};
	}, []);

	return (
		<TooltipProvider>
			<div className="flex h-full min-h-0 flex-col overflow-hidden lg:flex-row">
				{/* Sidebar */}
				<div className="flex w-full flex-col border-border border-r bg-muted/20 lg:w-80">
					<ScrollArea className="flex-1">
						<div className="flex flex-col gap-4 p-3 sm:p-4">
							{/* Project Name Input */}
							<div>
								<label
									htmlFor="project-name"
									className="mb-1 block font-medium text-foreground text-sm"
								>
									Project Name
								</label>
								<input
									id="project-name"
									type="text"
									value={projectName}
									onChange={(e) => setProjectName(e.target.value)}
									placeholder="my-xaheen-app"
									className="w-full rounded border border-border bg-background px-3 py-2 text-foreground text-sm placeholder:text-muted-foreground focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
								/>
							</div>

							{/* Stack Actions */}
							<StackActions
								onReset={resetToDefaults}
								onRandom={getRandomStack}
								onLoadSaved={loadSavedStack}
								onSave={saveCurrentStack}
								onShare={shareToTwitter}
								hasLastSavedStack={!!lastSavedStack}
							/>

							{/* Command Display */}
							<CommandDisplay
								command={command}
								onCopy={copyToClipboard}
							/>

							{/* Selected Stack Display */}
							<SelectedStackDisplay selectedBadges={selectedBadges} />

							{/* Quick Presets */}
							<QuickPresets
								presets={PRESET_TEMPLATES}
								onApplyPreset={applyPreset}
							/>
						</div>
					</ScrollArea>
				</div>

				{/* Main Content */}
				<div className="flex flex-1 flex-col overflow-hidden">
					<ScrollArea
						ref={contentRef}
						className="flex-1 overflow-hidden scroll-smooth"
					>
						<main className="p-3 sm:p-4">
							{CATEGORY_ORDER.map((categoryKey) => {
								const categoryOptions =
									TECH_OPTIONS[categoryKey as keyof typeof TECH_OPTIONS] || [];
								const categoryDisplayName = getCategoryDisplayName(categoryKey);

								// Filter options (currently no filtering, but can be extended)
								const filteredOptions = categoryOptions.filter(() => true);

								if (filteredOptions.length === 0) return null;

								return (
									<TechCategorySection
										key={categoryKey}
										ref={setSectionRef(categoryKey)}
										categoryKey={categoryKey}
										categoryDisplayName={categoryDisplayName}
										options={filteredOptions}
										stack={stack}
										compatibilityNotes={compatibilityAnalysis.notes[categoryKey]}
										onTechSelect={handleTechSelect}
										isOptionCompatible={isOptionCompatible}
									/>
								);
							})}
							<div className="h-10" />
						</main>
					</ScrollArea>
				</div>
			</div>
		</TooltipProvider>
	);
};

export default StackBuilder;
