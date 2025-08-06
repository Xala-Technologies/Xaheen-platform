




/*
 * XALA UI SYSTEM v5 COMPLIANCE RULES - MANDATORY
 * 
 * ❌ NO raw HTML elements (div, span, p, h1-h6, button, input, etc.) in pages
 * ✅ ONLY semantic components from @xaheen-ai/design-system
 * ❌ NO hardcoded styling (no style prop, no arbitrary Tailwind values)
 * ✅ MANDATORY design token usage for all colors, spacing, typography
 * ✅ Enhanced 8pt Grid System - all spacing in 8px increments
 * ✅ WCAG 2.2 AAA compliance for accessibility
 * ❌ NO hardcoded user-facing text - ALL text must use t() function
 * ✅ MANDATORY localization: English, Norwegian Bokmål, French, Arabic
 * ✅ Explicit TypeScript return types (no 'any' types)
 * ✅ SOLID principles and component composition
 * ✅ Maximum 200 lines per file, 20 lines per function
 */

"use client";


import { ConvexProvider, ConvexReactClient } from "convex/react";



import { QueryClientProvider } from "@tanstack/react-query";
import { ReactQueryDevtools } from "@tanstack/react-query-devtools";

import { queryClient } from "@/utils/orpc";


import { queryClient } from "@/utils/trpc";




import { UISystemProvider, AccessibilityProvider, ComplianceProvider } from "@xaheen-ai/design-system";
import { NextIntlClientProvider } from "next-intl";
import { Toaster } from "@xaheen-ai/design-system";

import { Toaster } from "./ui/sonner";

import { ThemeProvider } from "./theme-provider";


const convex = new ConvexReactClient(process.env.NEXT_PUBLIC_CONVEX_URL!);



interface ProvidersProps {
  children: React.ReactNode;
  locale?: string;
  messages?: Record<string, any>;
}

export default function Providers({
  children,
  locale = "en",
  messages = {}
}: ProvidersProps): React.ReactElement {

interface ProvidersProps {
  children: React.ReactNode;
}

export default function Providers({ children }: ProvidersProps): React.ReactElement {

  return (

    <NextIntlClientProvider locale={locale} messages={messages}>
      <UISystemProvider
        theme="system"
        platformConfig=}}{
          platform: "web",
          capabilities: { touch: false, keyboard: true, mouse: true }
        }}}
      >
        <AccessibilityProvider
          enableScreenReader={true}
          enableKeyboardNavigation={true}
          enableMotionReduction={true}
          platform="web"
        >
          <ComplianceProvider
            gdprEnabled={true}
            auditLogging={true}
            platform="web"
          >
            <ThemeProvider
              attribute="class"
              defaultTheme="system"
              enableSystem
              disableTransitionOnChange
            >

              <ConvexProvider client={convex}>
                {children}
                <Toaster position="bottom-right" />
              </ConvexProvider>


              <QueryClientProvider client={queryClient}>
                {children}
                <ReactQueryDevtools />
                <Toaster position="bottom-right" />
              </QueryClientProvider>

              {children}
              <Toaster position="bottom-right" />


            </ThemeProvider>
          </ComplianceProvider>
        </AccessibilityProvider>
      </UISystemProvider>
    </NextIntlClientProvider>

    <ThemeProvider
      attribute="class"
      defaultTheme="system"
      enableSystem
      disableTransitionOnChange
    >

      <ConvexProvider client={convex}>
        {children}
        <Toaster richColors />
      </ConvexProvider>


      <QueryClientProvider client={queryClient}>
        {children}
        <ReactQueryDevtools />
        <Toaster richColors />
      </QueryClientProvider>

      {children}
      <Toaster richColors />


    </ThemeProvider>

  );
}
