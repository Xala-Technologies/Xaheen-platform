import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

const nsmBadgeVariants = cva(
  "inline-flex items-center gap-1.5 font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2",
  {
    variants: {
      classification: {
        OPEN: [
          "bg-[#F0FDF4] text-[#059669] border-2 border-[#10B981]",
          "dark:bg-[#10B981]/10 dark:text-[#10B981] dark:border-[#10B981]/50"
        ].join(' '),
        RESTRICTED: [
          "bg-[#FFFBEB] text-[#D97706] border-2 border-[#F59E0B]",
          "dark:bg-[#F59E0B]/10 dark:text-[#F59E0B] dark:border-[#F59E0B]/50"
        ].join(' '),
        CONFIDENTIAL: [
          "bg-[#FEF2F2] text-[#DC2626] border-2 border-[#EF4444]",
          "dark:bg-[#EF4444]/10 dark:text-[#EF4444] dark:border-[#EF4444]/50"
        ].join(' '),
        SECRET: [
          "bg-[#FFF1F2] text-[#991B1B] border-2 border-[#7C2D12]",
          "dark:bg-[#7C2D12]/10 dark:text-[#DC2626] dark:border-[#7C2D12]/50"
        ].join(' ')
      },
      size: {
        sm: "px-2 py-0.5 text-xs rounded",
        md: "px-3 py-1 text-sm rounded-md",
        lg: "px-4 py-1.5 text-base rounded-lg"
      },
      showIcon: {
        true: "",
        false: ""
      }
    },
    defaultVariants: {
      classification: "OPEN",
      size: "md",
      showIcon: true
    }
  }
);

interface NSMBadgeProps extends VariantProps<typeof nsmBadgeVariants> {
  readonly className?: string;
  readonly children?: React.ReactNode;
  readonly "aria-label"?: string;
}

const classificationIcons = {
  OPEN: (
    <svg className="w-4 h-4" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M10 2L12.09 7.26L18 8.27L14 12.14L15.18 18.02L10 15.27L4.82 18.02L6 12.14L2 8.27L7.91 7.26L10 2Z" fill="currentColor" opacity="0.3"/>
      <path d="M10 2L12.09 7.26L18 8.27L14 12.14L15.18 18.02L10 15.27L4.82 18.02L6 12.14L2 8.27L7.91 7.26L10 2Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
    </svg>
  ),
  RESTRICTED: (
    <svg className="w-4 h-4" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
      <circle cx="10" cy="10" r="8" fill="currentColor" opacity="0.3"/>
      <path d="M10 6V10M10 14H10.01" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
    </svg>
  ),
  CONFIDENTIAL: (
    <svg className="w-4 h-4" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M12 2L13.09 4.26L15.62 4.61L13.81 6.36L14.24 8.87L12 7.7L9.76 8.87L10.19 6.36L8.38 4.61L10.91 4.26L12 2Z" fill="currentColor" opacity="0.3"/>
      <path d="M5 11V18C5 18.55 5.45 19 6 19H14C14.55 19 15 18.55 15 18V11" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
      <rect x="7" y="11" width="6" height="5" rx="1" fill="currentColor" opacity="0.3"/>
    </svg>
  ),
  SECRET: (
    <svg className="w-4 h-4" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
      <rect x="5" y="11" width="10" height="7" rx="1" fill="currentColor" opacity="0.3"/>
      <path d="M7 11V7C7 5.34315 8.34315 4 10 4C11.6569 4 13 5.34315 13 7V11M5 11H15V18C15 18.55 14.55 19 14 19H6C5.45 19 5 18.55 5 18V11Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
      <circle cx="10" cy="15" r="1" fill="currentColor"/>
    </svg>
  )
};

const classificationLabels = {
  OPEN: "ÅPEN",
  RESTRICTED: "BEGRENSET",
  CONFIDENTIAL: "KONFIDENSIELT",
  SECRET: "HEMMELIG"
};

const classificationDescriptions = {
  OPEN: "Information that can be shared publicly",
  RESTRICTED: "Information with limited distribution",
  CONFIDENTIAL: "Sensitive information requiring protection",
  SECRET: "Highly sensitive classified information"
};

export function NSMBadge({
  classification = "OPEN",
  size,
  showIcon,
  className,
  children,
  "aria-label": ariaLabel,
  ...props
}: NSMBadgeProps): JSX.Element {
  const label = children || classificationLabels[classification];
  const description = classificationDescriptions[classification];
  
  return (
    <span
      className={cn(nsmBadgeVariants({ classification, size }), className)}
      role="status"
      aria-label={ariaLabel || `NSM Security Classification: ${classification} - ${description}`}
      title={description}
      {...props}
    >
      {showIcon && classificationIcons[classification]}
      {label}
    </span>
  );
}

export { nsmBadgeVariants, classificationLabels, classificationDescriptions };