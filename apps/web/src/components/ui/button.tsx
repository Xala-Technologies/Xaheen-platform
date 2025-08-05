import { cva, type VariantProps } from "class-variance-authority";
import { Slot as SlotPrimitive } from "radix-ui";
import type * as React from "react";

import { cn } from "@/lib/utils";

const buttonVariants = cva(
	"inline-flex shrink-0 items-center justify-center gap-2 whitespace-nowrap rounded-lg font-medium outline-none transition-all duration-200 focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-ring disabled:pointer-events-none disabled:cursor-not-allowed disabled:opacity-50 aria-invalid:border-destructive aria-invalid:ring-destructive/20 dark:aria-invalid:ring-destructive/40 [&_svg]:pointer-events-none [&_svg]:shrink-0",
	{
		variants: {
			variant: {
				default:
					"bg-primary text-primary-foreground shadow-md hover:bg-primary/90 active:bg-primary/95 border border-primary/20",
				destructive:
					"bg-destructive text-white shadow-md hover:bg-destructive/90 active:bg-destructive/95 focus-visible:ring-destructive/20 border border-destructive/20 dark:bg-destructive/60 dark:focus-visible:ring-destructive/40",
				outline:
					"border-2 bg-background shadow-sm hover:bg-accent hover:text-accent-foreground active:bg-accent/80 dark:border-input dark:bg-input/30 dark:hover:bg-input/50",
				secondary:
					"bg-secondary text-secondary-foreground shadow-sm hover:bg-secondary/80 active:bg-secondary/85 border border-secondary/20",
				ghost:
					"hover:bg-accent hover:text-accent-foreground active:bg-accent/80 shadow-none dark:hover:bg-accent/50",
				link: "text-primary underline-offset-4 hover:underline shadow-none",
				norway:
					"bg-[#0067C5] text-white shadow-md hover:bg-[#1E88E5] active:bg-[#1E88E5]/90 border border-[#1E88E5]/20",
			},
			size: {
				// CLAUDE.md compliant professional sizing
				sm: "h-10 px-4 text-sm gap-2 has-[>svg]:px-3 [&_svg]:size-4", // 40px height
				default: "h-12 px-6 text-base gap-2 has-[>svg]:px-5 [&_svg]:size-5", // 48px height (minimum)
				lg: "h-14 px-8 text-lg gap-3 has-[>svg]:px-6 [&_svg]:size-5", // 56px height (recommended)
				xl: "h-16 px-10 text-xl gap-3 has-[>svg]:px-8 [&_svg]:size-6", // 64px height (premium)
				icon: "size-12 p-0 [&_svg]:size-5", // 48px icon button
			},
			fullWidth: {
				true: "w-full",
				false: "w-auto",
			},
		},
		defaultVariants: {
			variant: "default",
			size: "lg", // Professional default - 56px height
			fullWidth: false,
		},
	},
);

interface ButtonProps extends 
	React.ComponentProps<"button">,
	VariantProps<typeof buttonVariants> {
	readonly asChild?: boolean;
	readonly loading?: boolean;
	readonly leftIcon?: React.ReactNode;
	readonly rightIcon?: React.ReactNode;
}

function Button({
	className,
	variant,
	size,
	fullWidth,
	asChild = false,
	loading = false,
	leftIcon,
	rightIcon,
	children,
	disabled,
	...props
}: ButtonProps): JSX.Element {
	const Comp = asChild ? SlotPrimitive.Slot : "button";

	return (
		<Comp
			data-slot="button"
			className={cn(buttonVariants({ variant, size, fullWidth, className }))}
			disabled={disabled || loading}
			aria-busy={loading}
			{...props}
		>
			{loading ? (
				<>
					<svg
						className="animate-spin"
						xmlns="http://www.w3.org/2000/svg"
						fill="none"
						viewBox="0 0 24 24"
						aria-hidden="true"
					>
						<circle
							className="opacity-25"
							cx="12"
							cy="12"
							r="10"
							stroke="currentColor"
							strokeWidth="4"
						/>
						<path
							className="opacity-75"
							fill="currentColor"
							d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
						/>
					</svg>
					<span className="sr-only">Loading...</span>
				</>
			) : (
				<>
					{leftIcon && <span className="flex-shrink-0" aria-hidden="true">{leftIcon}</span>}
					{children}
					{rightIcon && <span className="flex-shrink-0" aria-hidden="true">{rightIcon}</span>}
				</>
			)}
		</Comp>
	);
}

export { Button, buttonVariants };
