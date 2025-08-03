"use client";

import { useState } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Sparkles, Blocks, Zap } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { BundleSelector } from "./bundle-selector";
import type { StackState } from "@/lib/types/index";

interface StackBuilderTabsProps {
  stack: StackState;
  onStackChange: (stack: StackState) => void;
  onBundleSelect: (bundleId: string) => void;
  selectedBundle?: string;
  children: React.ReactNode; // The existing tech stack content
}

/**
 * Stack Builder Tabs Component
 * Provides tabbed interface between Bundle selection and Tech Stack configuration
 */
export const StackBuilderTabs: React.FC<StackBuilderTabsProps> = ({
  stack,
  onStackChange,
  onBundleSelect,
  selectedBundle,
  children,
}) => {
  const [activeTab, setActiveTab] = useState<string>("bundles");

  const handleBundleSelect = (bundleId: string) => {
    onBundleSelect(bundleId);
    // Optionally switch to tech stack tab after bundle selection
    // setActiveTab("tech-stack");
  };

  return (
    <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full h-full">
      <div className="border-b border-border px-3 sm:px-4 py-3">
        <TabsList className="grid w-full grid-cols-2 gap-1">
          <TabsTrigger 
            value="bundles" 
            className="flex items-center gap-2 text-sm data-[state=active]:bg-chart-4/20 data-[state=active]:text-chart-4"
          >
            <Sparkles className="h-4 w-4" />
            <span>Smart Bundles</span>
            <Badge variant="secondary" className="text-xs px-1.5 py-0.5">
              New
            </Badge>
          </TabsTrigger>
          <TabsTrigger 
            value="tech-stack" 
            className="flex items-center gap-2 text-sm"
          >
            <Blocks className="h-4 w-4" />
            <span>Tech Stack</span>
            <Badge variant="outline" className="text-xs px-1.5 py-0.5">
              Custom
            </Badge>
          </TabsTrigger>
        </TabsList>
      </div>

      <div className="flex-1 overflow-hidden">
        <TabsContent value="bundles" className="h-full m-0 overflow-auto">
          <div className="p-3 sm:p-4 space-y-4">
            {/* Bundle Selection Header */}
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <Zap className="h-5 w-5 text-chart-4" />
                <h2 className="text-xl font-semibold text-foreground">
                  Choose Your Bundle
                </h2>
                <Badge className="bg-chart-4/20 text-chart-4 border-chart-4/20">
                  CLI v2
                </Badge>
              </div>
              <p className="text-sm text-muted-foreground">
                Get started faster with pre-configured service bundles. Each bundle includes 
                everything you need for specific use cases - from simple landing pages to 
                complex enterprise applications.
              </p>
            </div>

            {/* Bundle Benefits */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 p-4 bg-chart-4/5 border border-chart-4/20 rounded-lg">
              <div className="text-center">
                <div className="text-2xl mb-2">⚡</div>
                <h3 className="text-sm font-medium text-foreground">Faster Setup</h3>
                <p className="text-xs text-muted-foreground">
                  Skip manual configuration
                </p>
              </div>
              <div className="text-center">
                <div className="text-2xl mb-2">🎯</div>
                <h3 className="text-sm font-medium text-foreground">Best Practices</h3>
                <p className="text-xs text-muted-foreground">
                  Curated service combinations
                </p>
              </div>
              <div className="text-center">
                <div className="text-2xl mb-2">🇳🇴</div>
                <h3 className="text-sm font-medium text-foreground">Norwegian Ready</h3>
                <p className="text-xs text-muted-foreground">
                  Built-in compliance features
                </p>
              </div>
            </div>

            {/* Bundle Selector */}
            <BundleSelector
              onBundleSelect={handleBundleSelect}
              selectedBundle={selectedBundle}
            />

            {/* Call to Action */}
            {selectedBundle && (
              <div className="mt-6 p-4 bg-muted/50 border border-border rounded-lg">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-foreground">
                      Ready to build with your selected bundle?
                    </p>
                    <p className="text-xs text-muted-foreground">
                      Or switch to Tech Stack tab for custom configuration
                    </p>
                  </div>
                  <button
                    onClick={() => setActiveTab("tech-stack")}
                    className="text-xs px-3 py-1.5 bg-primary text-primary-foreground rounded hover:bg-primary/90 transition-colors"
                  >
                    Customize →
                  </button>
                </div>
              </div>
            )}
          </div>
        </TabsContent>

        <TabsContent value="tech-stack" className="h-full m-0 overflow-hidden">
          <div className="h-full flex flex-col">
            {/* Tech Stack Header */}
            <div className="border-b border-border px-3 sm:px-4 py-3 bg-muted/20">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Blocks className="h-5 w-5 text-foreground" />
                  <h2 className="text-lg font-semibold text-foreground">
                    Custom Tech Stack
                  </h2>
                  {selectedBundle && (
                    <Badge variant="outline" className="text-xs">
                      Bundle: {selectedBundle}
                    </Badge>
                  )}
                </div>
                
                {selectedBundle && (
                  <button
                    onClick={() => {
                      onBundleSelect("");
                      setActiveTab("bundles");
                    }}
                    className="text-xs px-2 py-1 text-muted-foreground hover:text-foreground border border-border rounded hover:bg-muted/50 transition-colors"
                  >
                    ← Back to Bundles
                  </button>
                )}
              </div>
              
              <p className="text-sm text-muted-foreground mt-1">
                {selectedBundle 
                  ? "Fine-tune your bundle selection or build from scratch"
                  : "Configure your tech stack manually with full control over each component"
                }
              </p>
            </div>

            {/* Tech Stack Content */}
            <div className="flex-1 overflow-hidden">
              {children}
            </div>
          </div>
        </TabsContent>
      </div>
    </Tabs>
  );
};