"use client";
import {
	Check,
	Copy,
	Terminal,
} from "lucide-react";
import { useState, useEffect } from "react";
import { cn } from "@/lib/utils";

type PresetStack = {
	projectName: string;
	webFrontend: string[];
	nativeFrontend: string[];
	uiSystem: string;
	runtime: string;
	backend: string;
	database: string;
	orm: string;
	auth: string;
	packageManager: string;
	addons: string[];
	examples: string[];
	git: string;
	install: string;
	api: string;
	[key: string]: any;
};

type Preset = {
	id: string;
	name: string;
	description: string;
	projectType: string;
	stack: PresetStack;
	sort_order: number;
};

export default function HomePage() {
	const [projectIdea, setProjectIdea] = useState("");
	const [selectedPreset, setSelectedPreset] = useState<string | null>(null);
	const [generatedCommand, setGeneratedCommand] = useState<string | null>(null);
	const [copiedCommand, setCopiedCommand] = useState<boolean>(false);
	const [quickPresets, setQuickPresets] = useState<Preset[]>([]);

	useEffect(() => {
		// Dynamic import to ensure fresh data
		const loadPresets = async () => {
			try {
				const presetsModule = await import('@/data/quick-presets.json');
				const presets = presetsModule.default as Preset[];
				setQuickPresets(presets);
			} catch (error) {
				console.error('Failed to load presets:', error);
			}
		};
		loadPresets();
	}, []);

	const generateCommand = (preset: Preset): string => {
		const stack = preset.stack;
		const flags = [];
		
		flags.push(`--frontend ${stack.webFrontend.join(' ')}`);
		if (stack.backend && stack.backend !== 'none') flags.push(`--backend ${stack.backend}`);
		if (stack.database && stack.database !== 'none') flags.push(`--database ${stack.database}`);
		if (stack.orm && stack.orm !== 'none') flags.push(`--orm ${stack.orm}`);
		if (stack.auth && stack.auth !== 'none') flags.push(`--auth`);
		if (stack.uiSystem) flags.push(`--ui ${stack.uiSystem}`);
		if (stack.packageManager) flags.push(`--package-manager ${stack.packageManager}`);
		
		return `xaheen init ${stack.projectName} ${flags.join(' ')}`;
	};

	const handlePresetSelect = (preset: Preset): void => {
		setSelectedPreset(preset.id);
		const command = generateCommand(preset);
		setGeneratedCommand(command);
	};

	const copyToClipboard = (): void => {
		if (generatedCommand) {
			navigator.clipboard.writeText(generatedCommand);
			setCopiedCommand(true);
			setTimeout(() => setCopiedCommand(false), 2000);
		}
	};

	return (
		<div className="mx-auto min-h-svh max-w-[1280px]">
			<main className="mx-auto px-4 pt-16">
				<div className="mb-8 flex items-center justify-center">
					<div className="flex flex-wrap items-center justify-center gap-2 sm:gap-4 md:gap-6">
						<pre className="ascii-art text-primary text-xs leading-tight sm:text-sm">
							{`
██╗  ██╗ █████╗ ██╗  ██╗███████╗███████╗███╗   ██╗
╚██╗██╔╝██╔══██╗██║  ██║██╔════╝██╔════╝████╗  ██║
 ╚███╔╝ ███████║███████║█████╗  █████╗  ██╔██╗ ██║
 ██╔██╗ ██╔══██║██╔══██║██╔══╝  ██╔══╝  ██║╚██╗██║
██╔╝ ██╗██║  ██║██║  ██║███████╗███████╗██║ ╚████║
╚═╝  ╚═╝╚═╝  ╚═╝╚═╝  ╚═╝╚══════╝╚══════╝╚═╝  ╚═══╝`}
						</pre>

						<pre className="ascii-art text-primary text-xs leading-tight sm:text-sm">
							{`
██████╗ ██╗   ██╗██╗██╗     ██████╗ ███████╗██████╗
██╔══██╗██║   ██║██║██║     ██╔══██╗██╔════╝██╔══██╗
██████╔╝██║   ██║██║██║     ██║  ██║█████╗  ██████╔╝
██╔══██╗██║   ██║██║██║     ██║  ██║██╔══╝  ██╔══██╗
██████╔╝╚██████╔╝██║███████╗██████╔╝███████╗██║  ██║
╚═════╝  ╚═════╝ ╚═╝╚══════╝╚═════╝ ╚══════╝╚═╝  ╚═╝`}
						</pre>
					</div>
				</div>

				<div className="mb-6 text-center">
					<p className="mx-auto text-lg text-muted-foreground">
						Production-ready • Customizable • Best practices included
					</p>
				</div>

				{/* Project Idea Input */}
				<div className="mb-8 rounded-lg border border-border bg-gradient-to-br from-background to-muted/20 p-6">
					<div className="mb-4 text-center">
						<h2 className="mb-2 text-xl font-semibold">Build something amazing</h2>
						<p className="text-muted-foreground text-sm">Describe your project idea and get started instantly</p>
					</div>
					
					<div className="relative mb-6">
						<textarea
							value={projectIdea}
							onChange={(e) => setProjectIdea(e.target.value)}
							placeholder="Ask Xaheen to create a dashboard to..."
							className="w-full min-h-[120px] rounded-lg border border-border bg-background/50 px-4 py-3 text-sm placeholder:text-muted-foreground focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20 resize-none"
						/>
						<button 
							type="button"
							className="absolute bottom-3 right-3 rounded-md bg-primary px-4 py-2 text-primary-foreground text-xs font-medium hover:bg-primary/90 transition-colors"
						>
							<span className="flex items-center gap-1">
								<Terminal className="h-3 w-3" />
								Generate
							</span>
						</button>
					</div>

					{/* Generated Command Display */}
					{generatedCommand && (
						<div className="mb-4 rounded-lg border border-border bg-muted/30 p-4">
							<div className="mb-2 flex items-center gap-2">
								<Terminal className="h-4 w-4 text-primary" />
								<span className="font-semibold text-sm">Generated Command</span>
							</div>
							<div className="flex items-center justify-between rounded border border-border bg-background p-3">
								<div className="flex items-center gap-2 text-sm font-mono">
									<span className="text-primary">$</span>
									<span className="text-foreground">{generatedCommand}</span>
								</div>
								<button
									type="button"
									onClick={copyToClipboard}
									className="flex items-center gap-1 rounded border border-border px-2 py-1 text-xs hover:bg-muted/50 transition-colors"
								>
									{copiedCommand ? (
										<Check className="h-3 w-3 text-primary" />
									) : (
										<Copy className="h-3 w-3" />
									)}
									{copiedCommand ? "COPIED!" : "COPY"}
								</button>
							</div>
						</div>
					)}
				</div>

				{/* Quick Presets */}
				<div className="mb-8">
					<div className="mb-6 text-center">
						<h3 className="mb-2 text-lg font-semibold">Quick Start Templates</h3>
						<p className="text-muted-foreground text-sm">Choose from our curated project templates</p>
					</div>
					
					{quickPresets.length === 0 ? (
					<div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
						{Array.from({ length: 9 }).map((_, i) => (
							<div key={i} className="animate-pulse rounded-lg border border-border p-4">
								<div className="mb-2 h-4 bg-muted rounded"></div>
								<div className="mb-3 h-3 bg-muted rounded w-3/4"></div>
								<div className="flex gap-1">
									<div className="h-5 w-12 bg-muted rounded"></div>
									<div className="h-5 w-16 bg-muted rounded"></div>
								</div>
							</div>
						))}
					</div>
				) : (
					<div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
						{quickPresets.slice(0, 12).map((preset) => (
							<button
								key={preset.id}
								type="button"
								onClick={() => handlePresetSelect(preset)}
								className={cn(
									"group relative rounded-lg border p-4 text-left transition-all hover:border-primary/50 hover:bg-muted/30",
									selectedPreset === preset.id
										? "border-primary bg-primary/5"
										: "border-border"
								)}
							>
								<div className="mb-2 flex items-start justify-between">
									<h4 className="font-semibold text-sm">{preset.name}</h4>
									{selectedPreset === preset.id && (
										<Check className="h-4 w-4 text-primary" />
									)}
								</div>
								<p className="mb-3 text-muted-foreground text-xs leading-relaxed">
									{preset.description}
								</p>
								<div className="flex flex-wrap gap-1">
									{preset.stack.webFrontend.filter((f: string) => f !== 'none').slice(0, 3).map((tech: string) => (
										<span
											key={tech}
											className="rounded bg-muted px-2 py-0.5 text-xs font-medium"
										>
											{tech}
										</span>
									))}
									{preset.stack.backend && preset.stack.backend !== 'none' && (
										<span className="rounded bg-muted px-2 py-0.5 text-xs font-medium">
											{preset.stack.backend}
										</span>
									)}
									{preset.stack.database && preset.stack.database !== 'none' && (
										<span className="rounded bg-muted px-2 py-0.5 text-xs font-medium">
											{preset.stack.database}
										</span>
									)}
								</div>
							</button>
						))}
					</div>
				)}
			</div>
		</main>
		</div>
	);
}
