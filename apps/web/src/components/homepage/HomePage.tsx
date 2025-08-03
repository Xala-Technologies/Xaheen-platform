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
  Card,
  Grid,
  GridItem,
  Badge,
  Skeleton,
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
  const { colors, spacing } = useTokens();
  
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
        {/* Hero Section */}
        <Card variant="elevated" padding="xl">
          <Stack direction="vertical" gap="lg" align="center">
            {/* ASCII Art Header */}
            <Stack direction="vertical" gap="md" align="center">
              <Stack direction="horizontal" gap="xl" align="center" wrap>
                <pre 
                  style={{ 
                    color: colors.primary?.[500],
                    fontSize: 'clamp(0.75rem, 2vw, 1.3rem)',
                    lineHeight: 1.2,
                    fontFamily: 'monospace'
                  }}
                >{`██╗  ██╗ █████╗ ██╗  ██╗███████╗███████╗███╗   ██╗
╚██╗██╔╝██╔══██╗██║  ██║██╔════╝██╔════╝████╗  ██║
 ╚███╔╝ ███████║███████║█████╗  █████╗  ██╔██╗ ██║
 ██╔██╗ ██╔══██║██╔══██║██╔══╝  ██╔══╝  ██║╚██╗██║
██╔╝ ██╗██║  ██║██║  ██║███████╗███████╗██║ ╚████║
╚═╝  ╚═╝╚═╝  ╚═╝╚═╝  ╚═╝╚══════╝╚══════╝╚═╝  ╚═══╝`}</pre>
                
                <pre 
                  style={{ 
                    color: colors.primary?.[500],
                    fontSize: 'clamp(0.75rem, 2vw, 1.3rem)',
                    lineHeight: 1.2,
                    fontFamily: 'monospace',
                    marginLeft: spacing?.[5] || '1.25rem'
                  }}
                >{`██████╗ ██╗   ██╗██╗██╗     ██████╗ ███████╗██████╗
██╔══██╗██║   ██║██║██║     ██╔══██╗██╔════╝██╔══██╗
██████╔╝██║   ██║██║██║     ██║  ██║█████╗  ██████╔╝
██╔══██╗██║   ██║██║██║     ██║  ██║██╔══╝  ██╔══██╗
██████╔╝╚██████╔╝██║███████╗██████╔╝███████╗██║  ██║
╚═════╝  ╚═════╝ ╚═╝╚══════╝╚═════╝ ╚══════╝╚═╝  ╚═╝`}</pre>
              </Stack>
              
              <Stack direction="vertical" gap="sm" align="center">
                <Typography variant="h4" color="muted" align="center">
                  {t('homepage.subtitle')}
                </Typography>
                <Stack direction="horizontal" gap="sm" align="center">
                  <Badge variant="secondary" size="sm">CLI Tool</Badge>
                  <Badge variant="secondary" size="sm">Full-Stack</Badge>
                  <Badge variant="secondary" size="sm">TypeScript</Badge>
                </Stack>
              </Stack>
            </Stack>
          </Stack>
        </Card>

        {/* Main Content Grid */}
        <Grid columns={12} gap="xl">
          {/* Project Idea Section */}
          <GridItem span={12}>
            <ProjectIdeaSection
              projectIdea={projectIdea}
              onProjectIdeaChange={handleProjectIdeaChange}
              onGenerate={handleGenerate}
            />
          </GridItem>

          {/* Generated Command Display */}
          <GridItem span={12}>
            <CommandDisplay command={generatedCommand} />
          </GridItem>

          {/* Quick Start Templates */}
          <GridItem span={12}>
            <Card variant="outlined" padding="lg">
              <Stack direction="vertical" gap="lg">
                <Stack direction="vertical" gap="sm">
                  <Typography variant="h3">
                    {t('homepage.templates_title') || 'Quick Start Templates'}
                  </Typography>
                  <Typography variant="body" color="muted">
                    {t('homepage.templates_description') || 'Choose from pre-configured project templates to get started quickly.'}
                  </Typography>
                </Stack>
                
                {isLoading ? (
                  <Grid columns={3} gap="md">
                    {Array.from({ length: 6 }).map((_, index) => (
                      <GridItem key={index}>
                        <Card variant="outlined" padding="md">
                          <Stack direction="vertical" gap="sm">
                            <Skeleton width="100%" height={20} variant="text" />
                            <Skeleton width="80%" height={16} variant="text" />
                            <Skeleton width="60%" height={14} variant="text" />
                          </Stack>
                        </Card>
                      </GridItem>
                    ))}
                  </Grid>
                ) : (
                  <QuickStartTemplates
                    presets={quickPresets}
                    selectedPresetId={selectedPreset}
                    onPresetSelect={handlePresetSelect}
                    isLoading={isLoading}
                  />
                )}
              </Stack>
            </Card>
          </GridItem>
        </Grid>
      </Stack>
    </Container>
  );
}
