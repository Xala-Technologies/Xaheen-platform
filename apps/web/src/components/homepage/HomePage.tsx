"use client";

import React, { useState, useEffect } from "react";
import { useLocalization } from "@/hooks/useLocalization";
import { ProjectIdeaSection } from "./ProjectIdeaSection";
import { CommandDisplay } from "./CommandDisplay";
import { QuickStartTemplates } from "./QuickStartTemplates";
import { 
  Container, 
  Stack, 
  Typography
} from "@xala-technologies/ui-system";

interface PresetStack {
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
}

interface Preset {
  id: string;
  name: string;
  description: string;
  projectType: string;
  stack: PresetStack;
  sort_order: number;
}

export function HomePage(): React.JSX.Element {
  const { t } = useLocalization();
  
  const [projectIdea, setProjectIdea] = useState<string>("");
  const [selectedPreset, setSelectedPreset] = useState<string | null>(null);
  const [generatedCommand, setGeneratedCommand] = useState<string | null>(null);
  const [copiedCommand, setCopiedCommand] = useState<boolean>(false);
  const [quickPresets, setQuickPresets] = useState<Preset[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  useEffect(() => {
    const loadPresets = async (): Promise<void> => {
      try {
        setIsLoading(true);
        const presetsModule = await import('@/data/quick-presets.json');
        const presets = presetsModule.default as Preset[];
        setQuickPresets(presets);
      } catch (error) {
        console.error('Failed to load presets:', error);
      } finally {
        setIsLoading(false);
      }
    };
    
    loadPresets();
  }, []);

  const generateCommand = (preset: Preset): string => {
    const stack = preset.stack;
    const flags: string[] = [];
    
    flags.push(`--frontend ${stack.webFrontend.join(' ')}`);
    if (stack.backend && stack.backend !== 'none') {
      flags.push(`--backend ${stack.backend}`);
    }
    if (stack.database && stack.database !== 'none') {
      flags.push(`--database ${stack.database}`);
    }
    if (stack.orm && stack.orm !== 'none') {
      flags.push(`--orm ${stack.orm}`);
    }
    if (stack.auth && stack.auth !== 'none') {
      flags.push(`--auth`);
    }
    if (stack.uiSystem) {
      flags.push(`--ui ${stack.uiSystem}`);
    }
    if (stack.packageManager) {
      flags.push(`--package-manager ${stack.packageManager}`);
    }
    
    return `xaheen init ${stack.projectName} ${flags.join(' ')}`;
  };

  const handlePresetSelect = (preset: Preset): void => {
    setSelectedPreset(preset.id);
    const command = generateCommand(preset);
    setGeneratedCommand(command);
  };

  const handleCopyToClipboard = (): void => {
    if (generatedCommand) {
      navigator.clipboard.writeText(generatedCommand);
      setCopiedCommand(true);
      setTimeout(() => setCopiedCommand(false), 2000);
    }
  };

  const handleProjectIdeaChange = (value: string): void => {
    setProjectIdea(value);
  };

  const handleGenerate = (): void => {
    // TODO: Implement AI generation logic
    console.log('Generate project from idea:', projectIdea);
  };

  return (
    <Container maxWidth="xl" padding="xl">
      <Stack direction="vertical" gap="xl">
        {/* ASCII Art Header */}
        <Stack direction="vertical" gap="lg" align="center">
          <Stack direction="horizontal" gap="xl" align="center" wrap>
            <pre>{`██╗  ██╗ █████╗ ██╗  ██╗███████╗███████╗███╗   ██╗
╚██╗██╔╝██╔══██╗██║  ██║██╔════╝██╔════╝████╗  ██║
 ╚███╔╝ ███████║███████║█████╗  █████╗  ██╔██╗ ██║
 ██╔██╗ ██╔══██║██╔══██║██╔══╝  ██╔══╝  ██║╚██╗██║
██╔╝ ██╗██║  ██║██║  ██║███████╗███████╗██║ ╚████║
╚═╝  ╚═╝╚═╝  ╚═╝╚═╝  ╚═╝╚══════╝╚══════╝╚═╝  ╚═══╝`}</pre>
            
            <pre>{`██████╗ ██╗   ██╗██╗██╗     ██████╗ ███████╗██████╗
██╔══██╗██║   ██║██║██║     ██╔══██╗██╔════╝██╔══██╗
██████╔╝██║   ██║██║██║     ██║  ██║█████╗  ██████╔╝
██╔══██╗██║   ██║██║██║     ██║  ██║██╔══╝  ██╔══██╗
██████╔╝╚██████╔╝██║███████╗██████╔╝███████╗██║  ██║
╚═════╝  ╚═════╝ ╚═╝╚══════╝╚═════╝ ╚══════╝╚═╝  ╚═╝`}</pre>
          </Stack>
          
          <Typography variant="body" color="muted" align="center">
            {t('homepage.subtitle')}
          </Typography>
        </Stack>

        {/* Project Idea Section */}
        <ProjectIdeaSection
          projectIdea={projectIdea}
          onProjectIdeaChange={handleProjectIdeaChange}
          onGenerate={handleGenerate}
        />

        {/* Generated Command Display */}
        <CommandDisplay command={generatedCommand} />

        {/* Quick Start Templates */}
        <QuickStartTemplates
          presets={quickPresets}
          selectedPresetId={selectedPreset}
          onPresetSelect={handlePresetSelect}
          isLoading={isLoading}
        />
      </Stack>
    </Container>
  );
}
