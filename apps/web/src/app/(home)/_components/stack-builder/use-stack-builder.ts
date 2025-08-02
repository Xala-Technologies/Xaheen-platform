import { useEffect, useMemo, useRef, useState } from "react";
import { useQueryStates } from "nuqs";
import { toast } from "sonner";
import {
	DEFAULT_STACK,
	isStackDefault,
	PRESET_TEMPLATES,
	TECH_OPTIONS,
} from "@/lib";
import {
	getProjectTypeDefaults,
	isOptionCompatible as isCompatible,
} from "@/lib/tech-compatibility";
import type { StackState, ProjectType, TechCategory } from "@/lib/types/index";
import { stackParsers, stackQueryStatesOptions } from "@/lib/stack-url-state";

/**
 * Custom hook for managing stack builder state and logic
 * Follows Single Responsibility Principle - only handles state management
 */
export const useStackBuilder = () => {
	const [stack, setStack] = useQueryStates(stackParsers, stackQueryStatesOptions);
	const [projectName, setProjectName] = useState("");
	const [copied, setCopied] = useState(false);
	const [lastSavedStack, setLastSavedStack] = useState<StackState | null>(null);
	const sectionRefs = useRef<Record<string, HTMLElement | null>>({});
	const contentRef = useRef<HTMLDivElement>(null);

	// Load saved stack from localStorage on mount
	useEffect(() => {
		const saved = localStorage.getItem("xaheen-saved-stack");
		if (saved) {
			try {
				setLastSavedStack(JSON.parse(saved));
			} catch (error) {
				console.error("Failed to parse saved stack:", error);
			}
		}
	}, []);

	const resetToDefaults = (): void => {
		setStack(DEFAULT_STACK);
		toast.success("Stack reset to defaults");
	};

	const getRandomStack = (): void => {
		const randomStack: Partial<StackState> = {};
		
		Object.entries(TECH_OPTIONS).forEach(([category, options]) => {
			if (options.length > 0) {
				const randomOption = options[Math.floor(Math.random() * options.length)];
				if (category === "addons" || category === "examples" || 
					category === "webFrontend" || category === "nativeFrontend") {
					randomStack[category as keyof StackState] = [randomOption.id] as any;
				} else {
					randomStack[category as keyof StackState] = randomOption.id as any;
				}
			}
		});
		
		setStack(randomStack as StackState);
		toast.success("Random stack generated");
	};

	const loadSavedStack = (): void => {
		if (lastSavedStack) {
			setStack(lastSavedStack);
			toast.success("Saved stack loaded");
		}
	};

	const saveCurrentStack = (): void => {
		localStorage.setItem("xaheen-saved-stack", JSON.stringify(stack));
		setLastSavedStack(stack);
		toast.success("Stack saved to preferences");
	};

	const shareToTwitter = (): void => {
		const url = window.location.href;
		const text = "Check out my tech stack configuration!";
		const twitterUrl = `https://twitter.com/intent/tweet?text=${encodeURIComponent(text)}&url=${encodeURIComponent(url)}`;
		window.open(twitterUrl, "_blank");
	};

	const applyPreset = (presetId: string): void => {
		const preset = PRESET_TEMPLATES.find((p) => p.id === presetId);
		if (preset) {
			setStack(preset.stack);
			toast.success(`Applied ${preset.name} preset`);
		}
	};

	const handleTechSelect = (category: keyof typeof TECH_OPTIONS, techId: string): void => {
		const categoryKey = category as keyof StackState;
		
		if (categoryKey === "addons" || categoryKey === "examples" || 
			categoryKey === "webFrontend" || categoryKey === "nativeFrontend") {
			const currentArray = (stack[categoryKey] as string[]) || [];
			const newArray = currentArray.includes(techId)
				? currentArray.filter((id) => id !== techId)
				: [...currentArray, techId];
			setStack({ [categoryKey]: newArray });
		} else {
			const currentValue = stack[categoryKey];
			const newValue = currentValue === techId ? "" : techId;
			setStack({ [categoryKey]: newValue });
		}
	};

	const copyToClipboard = async (command: string): Promise<void> => {
		try {
			await navigator.clipboard.writeText(command);
			setCopied(true);
			toast.success("Command copied to clipboard");
			setTimeout(() => setCopied(false), 2000);
		} catch (error) {
			console.error("Failed to copy command:", error);
			toast.error("Failed to copy command");
		}
	};

	const isOptionCompatible = (stack: StackState, category: string, techId: string): boolean => {
		return isCompatible(category as TechCategory, techId, stack);
	};

	return {
		// State
		stack,
		setStack,
		projectName,
		setProjectName,
		copied,
		lastSavedStack,
		sectionRefs,
		contentRef,
		
		// Actions
		resetToDefaults,
		getRandomStack,
		loadSavedStack,
		saveCurrentStack,
		shareToTwitter,
		applyPreset,
		handleTechSelect,
		copyToClipboard,
		isOptionCompatible,
	};
};
