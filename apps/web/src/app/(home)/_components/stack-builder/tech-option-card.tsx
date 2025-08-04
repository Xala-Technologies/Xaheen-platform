import { motion } from "motion/react";
import {
	Tooltip,
	TooltipContent,
	TooltipTrigger,
} from "@/components/ui/tooltip";
import { cn } from "@/lib/utils";
import { TechIcon } from "./tech-icon";

interface TechOption {
	id: string;
	name: string;
	description: string;
	icon: string;
	className?: string;
	default?: boolean;
}

interface TechOptionCardProps {
	tech: TechOption;
	isSelected: boolean;
	isDisabled: boolean;
	onClick: () => void;
}

/**
 * TechOptionCard component for displaying individual technology options
 * Follows Single Responsibility Principle - only handles tech option display and interaction
 */
export const TechOptionCard: React.FC<TechOptionCardProps> = ({
	tech,
	isSelected,
	isDisabled,
	onClick,
}) => {
	return (
		<Tooltip delayDuration={100}>
			<TooltipTrigger asChild>
				<motion.div
					className={cn(
						"relative cursor-pointer rounded border p-2 transition-all sm:p-3",
						isSelected
							? "border-primary bg-primary/10"
							: isDisabled
								? "border-destructive/30 bg-destructive/5 opacity-50 hover:opacity-75"
								: "border-border hover:border-muted hover:bg-muted",
					)}
					whileHover={{ scale: 1.02 }}
					whileTap={{ scale: 0.98 }}
					onClick={onClick}
				>
					<div className="flex items-start">
						<div className="flex-grow">
							<div className="flex items-center justify-between">
								<div className="flex items-center">
									{tech.icon !== "" && (
										<TechIcon
											icon={tech.icon}
											name={tech.name}
											className={cn(
												"mr-1.5 h-3 w-3 sm:h-4 sm:w-4",
												tech.className,
											)}
										/>
									)}
									<span
										className={cn(
											"font-medium text-xs sm:text-sm",
											isSelected ? "text-primary" : "text-foreground",
										)}
									>
										{tech.name}
									</span>
								</div>
							</div>
							<p className="mt-0.5 text-muted-foreground text-xs">
								{tech.description}
							</p>
						</div>
					</div>
					{tech.default && !isSelected && (
						<span className="absolute top-1 right-1 ml-2 flex-shrink-0 rounded bg-muted px-1 py-0.5 text-[10px] text-muted-foreground">
							Default
						</span>
					)}
				</motion.div>
			</TooltipTrigger>
			<TooltipContent side="top" align="start">
				<div className="max-w-xs">
					<p className="font-medium">{tech.name}</p>
					<p className="text-xs text-muted-foreground">{tech.description}</p>
				</div>
			</TooltipContent>
		</Tooltip>
	);
};
