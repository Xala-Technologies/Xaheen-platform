"use client";

import React, { useState, useEffect } from "react";
import { useLocalization } from "@/hooks/useLocalization";
import { ProjectIdeaSection } from "./ProjectIdeaSection";
import { CommandDisplay } from "./CommandDisplay";
import { QuickStartTemplates } from "./QuickStartTemplates";
import { 
  Container, 
  Stack, 
  Typography,
  useTokens 
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
  const { spacing, colors } = useTokens();
  
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
      <Stack direction="vertical" style={{ gap: spacing[8] }}>
        {/* ASCII Art Header */}
        <Stack direction="vertical" style={{ gap: spacing[6], alignItems: 'center' }}>
          <Stack direction="horizontal" style={{ gap: spacing[6], alignItems: 'center', flexWrap: 'wrap' }}>
            <Typography 
              variant="body"
              style={{ 
                fontFamily: 'monospace',
                lineHeight: 1.2,
                whiteSpace: 'pre',
                fontSize: '0.75rem',
                fontWeight: 500,
                color: colors.primary?.[500]
              }}
            >
              {`██╗  ██╗ █████╗ ██╗  ██╗███████╗███████╗███╗   ██╗
╚██╗██╔╝██╔══██╗██║  ██║██╔════╝██╔════╝████╗  ██║
 ╚███╔╝ ███████║███████║█████╗  █████╗  ██╔██╗ ██║
 ██╔██╗ ██╔══██║██╔══██║██╔══╝  ██╔══╝  ██║╚██╗██║
██╔╝ ██╗██║  ██║██║  ██║███████╗███████╗██║ ╚████║
╚═╝  ╚═╝╚═╝  ╚═╝╚═╝  ╚═╝╚══════╝╚══════╝╚═╝  ╚═══╝`}
            </Typography>
            
            <Typography 
              variant="body"
              style={{ 
                fontFamily: 'monospace',
                lineHeight: 1.2,
                whiteSpace: 'pre',
                fontSize: '0.75rem',
                fontWeight: 500,
                color: colors.primary?.[500]
              }}
            >
              {`██████╗ ██╗   ██╗██╗██╗     ██████╗ ███████╗██████╗
██╔══██╗██║   ██║██║██║     ██╔══██╗██╔════╝██╔══██╗
██████╔╝██║   ██║██║██║     ██║  ██║█████╗  ██████╔╝
██╔══██╗██║   ██║██║██║     ██║  ██║██╔══╝  ██╔══██╗
██████╔╝╚██████╔╝██║███████╗██████╔╝███████╗██║  ██║
╚═════╝  ╚═════╝ ╚═╝╚══════╝╚═════╝ ╚══════╝╚═╝  ╚═╝`}
            </Typography>
          </Stack>
          
          <Typography variant="body" style={{ textAlign: 'center', color: colors.text?.muted }}>
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
