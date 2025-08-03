import Image from "next/image";
import { useTheme } from "@xala-technologies/ui-system/hooks";
import { cn } from "@/lib/utils";

interface TechIconProps {
	icon: string;
	name: string;
	className?: string;
}

/**
 * TechIcon component for displaying technology icons with theme support
 * Follows Single Responsibility Principle - only handles icon display logic
 */
export const TechIcon: React.FC<TechIconProps> = ({
	icon,
	name,
	className,
}) => {
	const { theme } = useTheme();

	if (!icon) return null;

	const isExternalIcon = icon.startsWith("http");
	// Handle icon path - if it already starts with /, use as-is, otherwise add /icon/ prefix
	const iconSrc = isExternalIcon 
		? icon 
		: icon.startsWith("/") 
			? `/icon${icon}` 
			: `/icon/${icon}.svg`;

	return (
		<div className={cn("relative flex-shrink-0", className)}>
			<Image
				src={iconSrc}
				alt={`${name} icon`}
				width={16}
				height={16}
				className="h-full w-full object-contain"
				onError={(e) => {
					const target = e.target as HTMLImageElement;
					target.style.display = "none";
				}}
				style={{
					filter: theme === "dark" && !isExternalIcon ? "brightness(0.9)" : "none",
				}}
			/>
		</div>
	);
};
