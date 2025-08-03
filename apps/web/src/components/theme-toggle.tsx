"use client";

import * as SwitchPrimitives from "@radix-ui/react-switch";
import { Moon, Sun } from "lucide-react";
import { useTheme, useThemeTransition } from "@xala-technologies/ui-system/hooks";
import * as React from "react";
import { cn } from "@/lib/utils";

export function ThemeToggle({ className }: { className?: string }) {
	const { theme } = useTheme();
	const { transitionTheme } = useThemeTransition();

	const isChecked = theme === "dark";

	const handleCheckedChange = (checked: boolean) => {
		transitionTheme(checked ? "dark" : "light");
	};

	return (
		<SwitchPrimitives.Root
			checked={isChecked}
			onCheckedChange={handleCheckedChange}
			className={cn(
				"peer inline-flex h-4 w-9 shrink-0 cursor-pointer items-center rounded-full border-2 border-transparent transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background disabled:cursor-not-allowed disabled:opacity-50 data-[state=checked]:bg-primary data-[state=unchecked]:bg-input",
				className,
			)}
			aria-label="Toggle theme between light and dark"
		>
			<SwitchPrimitives.Thumb
				className={cn(
					"pointer-events-none flex h-3 w-3 items-center justify-center rounded-full shadow-lg ring-0 transition-transform data-[state=checked]:translate-x-5 data-[state=unchecked]:translate-x-0",
				)}
			>
				{isChecked ? (
					<Moon className="size-2 text-foreground" />
				) : (
					<Sun className="size-2 text-foreground" />
				)}
			</SwitchPrimitives.Thumb>
		</SwitchPrimitives.Root>
	);
}
