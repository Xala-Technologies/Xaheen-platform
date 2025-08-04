"use client";

import { Check, Sparkles } from "lucide-react";
import { useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
	Card,
	CardContent,
	CardDescription,
	CardHeader,
	CardTitle,
} from "@/components/ui/card";
import cliV2Features from "@/data/cli-v2-features.json";
import { cn } from "@/lib/utils";

interface BundleSelectorProps {
	onBundleSelect: (bundleId: string) => void;
	selectedBundle?: string;
}

/**
 * Bundle Selector Component
 * Displays all available CLI v2 bundles with their services and descriptions
 */
export const BundleSelector: React.FC<BundleSelectorProps> = ({
	onBundleSelect,
	selectedBundle,
}) => {
	const [hoveredBundle, setHoveredBundle] = useState<string | null>(null);

	const bundles = cliV2Features.features.intelligentBundling.bundles;

	const handleBundleClick = (bundleId: string) => {
		onBundleSelect(bundleId);
	};

	return (
		<div className="space-y-4">
			<div className="flex items-center gap-2 mb-4">
				<Sparkles className="h-5 w-5 text-chart-4" />
				<h3 className="text-lg font-semibold text-foreground">
					Choose a Bundle
				</h3>
				<Badge variant="secondary" className="text-xs">
					CLI v2
				</Badge>
			</div>

			<p className="text-sm text-muted-foreground mb-6">
				Pre-configured service bundles that include everything you need for
				specific use cases.
			</p>

			<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
				{bundles.map((bundle) => (
					<Card
						key={bundle.id}
						className={cn(
							"cursor-pointer transition-all duration-200 hover:shadow-lg border-2",
							selectedBundle === bundle.id
								? "border-chart-4 bg-chart-4/5"
								: "border-border hover:border-chart-4/50",
							hoveredBundle === bundle.id && "scale-[1.02]",
						)}
						onMouseEnter={() => setHoveredBundle(bundle.id)}
						onMouseLeave={() => setHoveredBundle(null)}
						onClick={() => handleBundleClick(bundle.id)}
					>
						<CardHeader className="pb-3">
							<div className="flex items-start justify-between">
								<div className="flex items-center gap-2">
									<span className="text-2xl">{bundle.emoji}</span>
									<div>
										<CardTitle className="text-base leading-tight">
											{bundle.name}
										</CardTitle>
									</div>
								</div>
								{selectedBundle === bundle.id && (
									<Check className="h-5 w-5 text-chart-4 flex-shrink-0" />
								)}
							</div>
							<CardDescription className="text-xs leading-relaxed">
								{bundle.description}
							</CardDescription>
						</CardHeader>

						<CardContent className="pt-0">
							<div className="space-y-3">
								<div>
									<p className="text-xs font-medium text-muted-foreground mb-2">
										Included Services:
									</p>
									<div className="flex flex-wrap gap-1">
										{bundle.services.slice(0, 4).map((service) => (
											<Badge
												key={service}
												variant="outline"
												className="text-xs px-2 py-0.5"
											>
												{service}
											</Badge>
										))}
										{bundle.services.length > 4 && (
											<Badge
												variant="outline"
												className="text-xs px-2 py-0.5 text-muted-foreground"
											>
												+{bundle.services.length - 4} more
											</Badge>
										)}
									</div>
								</div>

								<Button
									variant={selectedBundle === bundle.id ? "default" : "outline"}
									size="sm"
									className="w-full text-xs"
									onClick={(e) => {
										e.stopPropagation();
										handleBundleClick(bundle.id);
									}}
								>
									{selectedBundle === bundle.id ? "Selected" : "Select Bundle"}
								</Button>
							</div>
						</CardContent>
					</Card>
				))}
			</div>

			{selectedBundle && (
				<div className="mt-6 p-4 bg-chart-4/5 border border-chart-4/20 rounded-lg">
					<div className="flex items-start gap-3">
						<Sparkles className="h-5 w-5 text-chart-4 flex-shrink-0 mt-0.5" />
						<div>
							<p className="text-sm font-medium text-foreground">
								Bundle Selected:{" "}
								{bundles.find((b) => b.id === selectedBundle)?.name}
							</p>
							<p className="text-xs text-muted-foreground mt-1">
								Your CLI v2 command will include all services from this bundle
								automatically.
							</p>
						</div>
					</div>
				</div>
			)}
		</div>
	);
};
