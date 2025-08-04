import { InfoIcon, Terminal } from "lucide-react";
import { forwardRef } from "react";
import {
	Tooltip,
	TooltipContent,
	TooltipTrigger,
} from "@/components/ui/tooltip";
import type { StackState } from "@/lib/types/index";
import { TechOptionCard } from "./tech-option-card";

interface TechOption {
	id: string;
	name: string;
	description: string;
	icon: string;
	className?: string;
	default?: boolean;
}

interface CompatibilityNote {
	notes: string[];
	hasIssue: boolean;
}

interface TechCategorySectionProps {
	categoryKey: string;
	categoryDisplayName: string;
	options: TechOption[];
	stack: StackState;
	compatibilityNotes?: CompatibilityNote;
	onTechSelect: (categoryKey: string, techId: string) => void;
	isOptionCompatible: (
		stack: StackState,
		category: string,
		techId: string,
	) => boolean;
}

/**
 * TechCategorySection component for displaying a category of technology options
 * Follows Single Responsibility Principle - only handles category display logic
 */
export const TechCategorySection = forwardRef<
	HTMLElement,
	TechCategorySectionProps
>(
	(
		{
			categoryKey,
			categoryDisplayName,
			options,
			stack,
			compatibilityNotes,
			onTechSelect,
			isOptionCompatible,
		},
		ref,
	) => {
		const getIsSelected = (tech: TechOption): boolean => {
			const category = categoryKey as keyof StackState;
			const currentValue = stack[category];

			if (
				category === "addons" ||
				category === "examples" ||
				category === "webFrontend" ||
				category === "nativeFrontend"
			) {
				return ((currentValue as string[]) || []).includes(tech.id);
			} else {
				return currentValue === tech.id;
			}
		};

		if (options.length === 0) return null;

		return (
			<section
				ref={ref}
				id={`section-${categoryKey}`}
				className="mb-6 scroll-mt-4 sm:mb-8"
			>
				<div className="mb-3 flex items-center border-border border-b pb-2 text-muted-foreground">
					<Terminal className="mr-2 h-4 w-4 flex-shrink-0 sm:h-5 sm:w-5" />
					<h2 className="font-semibold text-foreground text-sm sm:text-base">
						{categoryDisplayName}
					</h2>
					{compatibilityNotes?.hasIssue && (
						<Tooltip delayDuration={100}>
							<TooltipTrigger asChild>
								<InfoIcon className="ml-2 h-4 w-4 flex-shrink-0 cursor-help text-muted-foreground" />
							</TooltipTrigger>
							<TooltipContent side="top" align="start">
								<ul className="list-disc space-y-1 pl-4 text-xs">
									{compatibilityNotes.notes.map((note) => (
										<li key={note}>{note}</li>
									))}
								</ul>
							</TooltipContent>
						</Tooltip>
					)}
				</div>

				<div className="grid grid-cols-1 xs:grid-cols-2 gap-2 sm:gap-3 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-3 2xl:grid-cols-4">
					{options.map((tech) => {
						const isSelected = getIsSelected(tech);
						const isDisabled = !isOptionCompatible(stack, categoryKey, tech.id);

						return (
							<TechOptionCard
								key={tech.id}
								tech={tech}
								isSelected={isSelected}
								isDisabled={isDisabled}
								onClick={() => onTechSelect(categoryKey, tech.id)}
							/>
						);
					})}
				</div>
			</section>
		);
	},
);

TechCategorySection.displayName = "TechCategorySection";
