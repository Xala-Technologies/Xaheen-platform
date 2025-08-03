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
			<main className="mx-auto px-6 pt-20">
				<div className="mb-12 flex items-center justify-center">
					<div className="flex flex-wrap items-center justify-center gap-4 sm:gap-6 md:gap-8">
						<pre className="ascii-art text-primary text-sm leading-tight sm:text-base md:text-lg">
							{`
██╗  ██╗ █████╗ ██╗  ██╗███████╗███████╗███╗   ██╗
╚██╗██╔╝██╔══██╗██║  ██║██╔════╝██╔════╝████╗  ██║
 ╚███╔╝ ███████║███████║█████╗  █████╗  ██╔██╗ ██║
 ██╔██╗ ██╔══██║██╔══██║██╔══╝  ██╔══╝  ██║╚██╗██║
██╔╝ ██╗██║  ██║██║  ██║███████╗███████╗██║ ╚████║
╚═╝  ╚═╝╚═╝  ╚═╝╚═╝  ╚═╝╚══════╝╚══════╝╚═╝  ╚═══╝`}
						</pre>

						<pre className="ascii-art text-primary text-sm leading-tight sm:text-base md:text-lg">
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

				<div className="mb-10 text-center">
					<p className="mx-auto text-xl font-medium text-muted-foreground">
						Production-ready • Customizable • Best practices included
					</p>
				</div>

				{/* Project Idea Input */}
				<div className="mb-12 rounded-lg border border-border bg-gradient-to-br from-background to-muted/20 p-8">
					<div className="mb-6 text-center">
						<h2 className="mb-3 text-2xl font-semibold">Build something amazing</h2>
						<p className="text-muted-foreground text-base">Describe your project idea and get started instantly</p>
					</div>
					
					<div className="relative mb-8">
						<textarea
							value={projectIdea}
							onChange={(e) => setProjectIdea(e.target.value)}
							placeholder="Ask Xaheen to create a dashboard to..."
							className="w-full min-h-[140px] rounded-lg border border-border bg-background/50 px-5 py-4 text-base placeholder:text-muted-foreground focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20 resize-none"
						/>
						<button 
							type="button"
							className="absolute bottom-4 right-4 rounded-md bg-primary px-5 py-2.5 text-primary-foreground text-sm font-medium hover:bg-primary/90 transition-colors"
						>
							<span className="flex items-center gap-2">
								<Terminal className="h-4 w-4" />
								Generate
							</span>
						</button>
					</div>

					{/* Generated Command Display */}
					{generatedCommand && (
						<div className="mb-6 rounded-lg border border-border bg-muted/30 p-5">
							<div className="mb-3 flex items-center gap-2">
								<Terminal className="h-5 w-5 text-primary" />
								<span className="font-semibold text-base">Generated Command</span>
							</div>
							<div className="flex items-center justify-between rounded border border-border bg-background p-4">
								<div className="flex items-center gap-2 text-base font-mono">
									<span className="text-primary">$</span>
									<span className="text-foreground">{generatedCommand}</span>
								</div>
								<button
									type="button"
									onClick={copyToClipboard}
									className="flex items-center gap-2 rounded border border-border px-3 py-2 text-sm hover:bg-muted/50 transition-colors"
								>
									{copiedCommand ? (
										<Check className="h-4 w-4 text-primary" />
									) : (
										<Copy className="h-4 w-4" />
									)}
									{copiedCommand ? "COPIED!" : "COPY"}
								</button>
							</div>
						</div>
					)}
				</div>

				{/* Quick Presets */}
				<div className="mb-12">
					<div className="mb-8 text-center">
						<h3 className="mb-3 text-2xl font-semibold">Quick Start Templates</h3>
						<p className="text-muted-foreground text-base">Choose from our curated project templates</p>
					</div>
					
					{quickPresets.length === 0 ? (
					<div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
						{Array.from({ length: 9 }).map((_, i) => (
							<div key={i} className="animate-pulse rounded-lg border border-border p-6">
								<div className="mb-3 h-5 bg-muted rounded"></div>
								<div className="mb-4 h-4 bg-muted rounded w-3/4"></div>
								<div className="flex gap-2">
									<div className="h-6 w-14 bg-muted rounded"></div>
									<div className="h-6 w-18 bg-muted rounded"></div>
								</div>
							</div>
						))}
					</div>
				) : (
					<div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
						{quickPresets.slice(0, 12).map((preset) => (
							<button
								key={preset.id}
								type="button"
								onClick={() => handlePresetSelect(preset)}
								className={cn(
									"group relative rounded-lg border p-6 text-left card-hover hover:border-primary/50 hover:bg-muted/30",
									selectedPreset === preset.id
										? "border-primary bg-primary/5"
										: "border-border"
								)}
							>
								<div className="mb-3 flex items-start justify-between">
									<h4 className="font-semibold text-base">{preset.name}</h4>
									{selectedPreset === preset.id && (
										<Check className="h-5 w-5 text-primary" />
									)}
								</div>
								<p className="mb-4 text-muted-foreground text-sm leading-relaxed">
									{preset.description}
								</p>
								<div className="flex flex-wrap gap-2">
									{preset.stack.webFrontend.filter((f: string) => f !== 'none').slice(0, 3).map((tech: string) => (
										<span
											key={tech}
											className="rounded bg-muted px-3 py-1 text-sm font-medium"
										>
											{tech}
										</span>
									))}
									{preset.stack.backend && preset.stack.backend !== 'none' && (
										<span className="rounded bg-muted px-3 py-1 text-sm font-medium">
											{preset.stack.backend}
										</span>
									)}
									{preset.stack.database && preset.stack.database !== 'none' && (
										<span className="rounded bg-muted px-3 py-1 text-sm font-medium">
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
