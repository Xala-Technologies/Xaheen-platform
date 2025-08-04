import { writeFileSync } from 'fs';
import { join } from 'path';
import { logger } from '../utils/logger.js';
import { TemplateEngine } from '../services/template-engine.js';

export interface PlatformConfig {
  readonly name: string;
  readonly platform: string;
  readonly template: string;
  readonly theme: string;
  readonly locale: string;
  readonly compliance: string;
  readonly features: ReadonlyArray<string>;
  readonly outputDir: string;
}

export class MultiPlatformGenerator {
  private readonly templateEngine: TemplateEngine;

  constructor() {
    this.templateEngine = new TemplateEngine();
  }

  async generate(platform: string, config: PlatformConfig): Promise<void> {
    logger.info(`Generating platform-specific files for ${platform}`);

    switch (platform) {
      case 'react':
        await this.generateReactFiles(config);
        break;
      case 'vue':
        await this.generateVueFiles(config);
        break;
      case 'angular':
        await this.generateAngularFiles(config);
        break;
      case 'flutter':
        await this.generateFlutterFiles(config);
        break;
      case 'ios':
        await this.generateiOSFiles(config);
        break;
      case 'android':
        await this.generateAndroidFiles(config);
        break;
      default:
        throw new Error(`Unsupported platform: ${platform}`);
    }
  }

  private async generateReactFiles(config: PlatformConfig): Promise<void> {
    // Generate Next.js app structure
    const appComponent = this.templateEngine.render('react/app.tsx.hbs', config);
    writeFileSync(join(config.outputDir, 'src/app/layout.tsx'), appComponent);

    const pageComponent = this.templateEngine.render('react/page.tsx.hbs', config);
    writeFileSync(join(config.outputDir, 'src/app/page.tsx'), pageComponent);

    // Generate components using only semantic UI components
    const exampleComponent = this.generateCompliantReactComponent(config);
    writeFileSync(join(config.outputDir, 'src/components/ExampleComponent.tsx'), exampleComponent);

    // Generate providers
    const providers = this.templateEngine.render('react/providers.tsx.hbs', config);
    writeFileSync(join(config.outputDir, 'src/providers/index.tsx'), providers);

    // Generate hooks
    const customHook = this.templateEngine.render('react/useExample.ts.hbs', config);
    writeFileSync(join(config.outputDir, 'src/hooks/useExample.ts'), customHook);

    // Generate Tailwind config
    const tailwindConfig = this.templateEngine.render('react/tailwind.config.js.hbs', config);
    writeFileSync(join(config.outputDir, 'tailwind.config.js'), tailwindConfig);

    // Generate global CSS with design tokens
    const globalCSS = this.templateEngine.render('react/globals.css.hbs', config);
    writeFileSync(join(config.outputDir, 'src/styles/globals.css'), globalCSS);
  }

  private generateCompliantReactComponent(config: PlatformConfig): string {
    // Generate React component following mandatory compliance rules
    return `import React from 'react';
import { Card, Stack, Typography, Button } from '@xala-technologies/ui-system';
import { useTokens } from '@xala-technologies/ui-system';
import { useLocalization } from '../hooks/useLocalization';

export interface ExampleComponentProps {
  readonly title?: string;
  readonly onAction?: () => void;
  readonly variant?: 'primary' | 'secondary';
}

export const ExampleComponent = ({
  title,
  onAction,
  variant = 'primary'
}: ExampleComponentProps): JSX.Element => {
  const tokens = useTokens();
  const { t } = useLocalization();

  return (
    <Card 
      padding={tokens.spacing.large}
      borderRadius={tokens.borderRadius.medium}
      backgroundColor={tokens.colors.surface.primary}
    >
      <Stack spacing={tokens.spacing.medium} direction="vertical">
        <Typography
          variant="heading2"
          color={tokens.colors.text.primary}
        >
          {title || t('example.defaultTitle', 'Welcome to Xala')}
        </Typography>
        
        <Typography
          variant="body1"
          color={tokens.colors.text.secondary}
        >
          {t('example.description', 'This component follows all compliance rules')}
        </Typography>
        
        {onAction && (
          <Button
            variant={variant}
            onClick={onAction}
            size="large"
            ariaLabel={t('example.actionLabel', 'Perform action')}
          >
            {t('example.actionText', 'Get Started')}
          </Button>
        )}
      </Stack>
    </Card>
  );
};`;
  }

  private async generateVueFiles(config: PlatformConfig): Promise<void> {
    // Generate Vue 3 app structure
    const appVue = this.templateEngine.render('vue/App.vue.hbs', config);
    writeFileSync(join(config.outputDir, 'src/App.vue'), appVue);

    const mainTs = this.templateEngine.render('vue/main.ts.hbs', config);
    writeFileSync(join(config.outputDir, 'src/main.ts'), mainTs);

    // Generate compliant Vue component
    const exampleComponent = this.generateCompliantVueComponent(config);
    writeFileSync(join(config.outputDir, 'src/components/ExampleComponent.vue'), exampleComponent);

    // Generate Vite config
    const viteConfig = this.templateEngine.render('vue/vite.config.ts.hbs', config);
    writeFileSync(join(config.outputDir, 'vite.config.ts'), viteConfig);
  }

  private generateCompliantVueComponent(config: PlatformConfig): string {
    return `<template>
  <Card 
    :padding="tokens.spacing.large"
    :border-radius="tokens.borderRadius.medium"
    :background-color="tokens.colors.surface.primary"
  >
    <Stack 
      :spacing="tokens.spacing.medium" 
      direction="vertical"
    >
      <Typography
        variant="heading2"
        :color="tokens.colors.text.primary"
      >
        {{ title || t('example.defaultTitle', 'Welcome to Xala') }}
      </Typography>
      
      <Typography
        variant="body1"
        :color="tokens.colors.text.secondary"
      >
        {{ t('example.description', 'This component follows all compliance rules') }}
      </Typography>
      
      <Button
        v-if="onAction"
        :variant="variant"
        @click="onAction"
        size="large"
        :aria-label="t('example.actionLabel', 'Perform action')"
      >
        {{ t('example.actionText', 'Get Started') }}
      </Button>
    </Stack>
  </Card>
</template>

<script setup lang="ts">
import { Card, Stack, Typography, Button } from '@xala-technologies/ui-system';
import { useTokens } from '@xala-technologies/ui-system';
import { useLocalization } from '../composables/useLocalization';

export interface Props {
  readonly title?: string;
  readonly variant?: 'primary' | 'secondary';
}

defineProps<Props>();
defineEmits<{
  action: [];
}>();

const tokens = useTokens();
const { t } = useLocalization();
</script>`;
  }

  private async generateAngularFiles(config: PlatformConfig): Promise<void> {
    // Generate Angular app structure
    const appModule = this.templateEngine.render('angular/app.module.ts.hbs', config);
    writeFileSync(join(config.outputDir, 'src/app/app.module.ts'), appModule);

    const appComponent = this.templateEngine.render('angular/app.component.ts.hbs', config);
    writeFileSync(join(config.outputDir, 'src/app/app.component.ts'), appComponent);

    // Generate compliant Angular component
    const exampleComponent = this.generateCompliantAngularComponent(config);
    writeFileSync(join(config.outputDir, 'src/app/components/example/example.component.ts'), exampleComponent);

    // Generate Angular config
    const angularJson = this.templateEngine.render('angular/angular.json.hbs', config);
    writeFileSync(join(config.outputDir, 'angular.json'), angularJson);
  }

  private generateCompliantAngularComponent(config: PlatformConfig): string {
    return `import { Component, Input, Output, EventEmitter } from '@angular/core';
import { TokensService } from '@xala-technologies/ui-system';
import { LocalizationService } from '../services/localization.service';

@Component({
  selector: 'app-example',
  template: \`
    <xala-card 
      [padding]="tokens.spacing.large"
      [borderRadius]="tokens.borderRadius.medium"
      [backgroundColor]="tokens.colors.surface.primary"
    >
      <xala-stack 
        [spacing]="tokens.spacing.medium" 
        direction="vertical"
      >
        <xala-typography
          variant="heading2"
          [color]="tokens.colors.text.primary"
        >
          {{ title || localization.t('example.defaultTitle', 'Welcome to Xala') }}
        </xala-typography>
        
        <xala-typography
          variant="body1"
          [color]="tokens.colors.text.secondary"
        >
          {{ localization.t('example.description', 'This component follows all compliance rules') }}
        </xala-typography>
        
        <xala-button
          *ngIf="onAction.observed"
          [variant]="variant"
          (click)="onAction.emit()"
          size="large"
          [ariaLabel]="localization.t('example.actionLabel', 'Perform action')"
        >
          {{ localization.t('example.actionText', 'Get Started') }}
        </xala-button>
      </xala-stack>
    </xala-card>
  \`
})
export class ExampleComponent {
  @Input() readonly title?: string;
  @Input() readonly variant: 'primary' | 'secondary' = 'primary';
  @Output() readonly onAction = new EventEmitter<void>();

  constructor(
    public readonly tokens: TokensService,
    public readonly localization: LocalizationService
  ) {}
}`;
  }

  private async generateFlutterFiles(config: PlatformConfig): Promise<void> {
    // Generate Flutter app structure
    const mainDart = this.templateEngine.render('flutter/main.dart.hbs', config);
    writeFileSync(join(config.outputDir, 'lib/main.dart'), mainDart);

    // Generate compliant Flutter widget
    const exampleWidget = this.generateCompliantFlutterWidget(config);
    writeFileSync(join(config.outputDir, 'lib/widgets/example_widget.dart'), exampleWidget);

    // Generate pubspec.yaml
    const pubspec = this.templateEngine.render('flutter/pubspec.yaml.hbs', config);
    writeFileSync(join(config.outputDir, 'pubspec.yaml'), pubspec);
  }

  private generateCompliantFlutterWidget(config: PlatformConfig): string {
    return `import 'package:flutter/material.dart';
import 'package:xala_ui_system/xala_ui_system.dart';
import '../services/localization_service.dart';
import '../services/tokens_service.dart';

class ExampleWidget extends StatelessWidget {
  final String? title;
  final VoidCallback? onAction;
  final String variant;

  const ExampleWidget({
    Key? key,
    this.title,
    this.onAction,
    this.variant = 'primary',
  }) : super(key: key);

  @override
  Widget build(BuildContext context) {
    final tokens = TokensService.of(context);
    final localization = LocalizationService.of(context);

    return XalaCard(
      padding: tokens.spacing.large,
      borderRadius: tokens.borderRadius.medium,
      backgroundColor: tokens.colors.surface.primary,
      child: XalaStack(
        spacing: tokens.spacing.medium,
        direction: StackDirection.vertical,
        children: [
          XalaTypography(
            text: title ?? localization.t('example.defaultTitle', 'Welcome to Xala'),
            variant: TypographyVariant.heading2,
            color: tokens.colors.text.primary,
          ),
          XalaTypography(
            text: localization.t('example.description', 'This component follows all compliance rules'),
            variant: TypographyVariant.body1,
            color: tokens.colors.text.secondary,
          ),
          if (onAction != null)
            XalaButton(
              onPressed: onAction,
              variant: variant,
              size: ButtonSize.large,
              semanticLabel: localization.t('example.actionLabel', 'Perform action'),
              child: Text(localization.t('example.actionText', 'Get Started')),
            ),
        ],
      ),
    );
  }
}`;
  }

  private async generateiOSFiles(config: PlatformConfig): Promise<void> {
    // Generate iOS Swift files
    const appDelegate = this.templateEngine.render('ios/AppDelegate.swift.hbs', config);
    writeFileSync(join(config.outputDir, 'Sources/AppDelegate.swift'), appDelegate);

    // Generate compliant SwiftUI view
    const exampleView = this.generateComplianiOSView(config);
    writeFileSync(join(config.outputDir, 'Sources/Views/ExampleView.swift'), exampleView);

    // Generate Package.swift
    const packageSwift = this.templateEngine.render('ios/Package.swift.hbs', config);
    writeFileSync(join(config.outputDir, 'Package.swift'), packageSwift);
  }

  private generateComplianiOSView(config: PlatformConfig): string {
    return `import SwiftUI
import XalaUISystem

struct ExampleView: View {
    let title: String?
    let onAction: (() -> Void)?
    let variant: String
    
    @StateObject private var tokens = TokensService.shared
    @StateObject private var localization = LocalizationService.shared
    
    init(title: String? = nil, onAction: (() -> Void)? = nil, variant: String = "primary") {
        self.title = title
        self.onAction = onAction
        self.variant = variant
    }
    
    var body: some View {
        XalaCard(
            padding: tokens.spacing.large,
            borderRadius: tokens.borderRadius.medium,
            backgroundColor: tokens.colors.surface.primary
        ) {
            XalaStack(spacing: tokens.spacing.medium, direction: .vertical) {
                XalaTypography(
                    text: title ?? localization.t("example.defaultTitle", defaultValue: "Welcome to Xala"),
                    variant: .heading2,
                    color: tokens.colors.text.primary
                )
                
                XalaTypography(
                    text: localization.t("example.description", defaultValue: "This component follows all compliance rules"),
                    variant: .body1,
                    color: tokens.colors.text.secondary
                )
                
                if let onAction = onAction {
                    XalaButton(
                        action: onAction,
                        variant: variant,
                        size: .large,
                        accessibilityLabel: localization.t("example.actionLabel", defaultValue: "Perform action")
                    ) {
                        Text(localization.t("example.actionText", defaultValue: "Get Started"))
                    }
                }
            }
        }
    }
}`;
  }

  private async generateAndroidFiles(config: PlatformConfig): Promise<void> {
    // Generate Android files
    const mainActivity = this.templateEngine.render('android/MainActivity.kt.hbs', config);
    writeFileSync(join(config.outputDir, 'app/src/main/java/MainActivity.kt'), mainActivity);

    // Generate compliant Compose component
    const exampleComposable = this.generateCompliantAndroidComposable(config);
    writeFileSync(join(config.outputDir, 'app/src/main/java/components/ExampleComponent.kt'), exampleComposable);

    // Generate build.gradle
    const buildGradle = this.templateEngine.render('android/build.gradle.hbs', config);
    writeFileSync(join(config.outputDir, 'app/build.gradle'), buildGradle);
  }

  private generateCompliantAndroidComposable(config: PlatformConfig): string {
    return `package com.example.${config.name.toLowerCase().replace(/[^a-z0-9]/g, '')}.components

import androidx.compose.runtime.Composable
import androidx.compose.ui.semantics.semantics
import androidx.compose.ui.semantics.contentDescription
import com.xala.ui.system.*
import com.xala.ui.system.tokens.TokensProvider
import com.xala.ui.system.localization.LocalizationProvider

@Composable
fun ExampleComponent(
    title: String? = null,
    onAction: (() -> Unit)? = null,
    variant: String = "primary"
) {
    val tokens = TokensProvider.current
    val localization = LocalizationProvider.current
    
    XalaCard(
        padding = tokens.spacing.large,
        borderRadius = tokens.borderRadius.medium,
        backgroundColor = tokens.colors.surface.primary,
        modifier = Modifier.semantics {
            contentDescription = localization.t("example.cardDescription", "Example component card")
        }
    ) {
        XalaStack(
            spacing = tokens.spacing.medium,
            direction = StackDirection.Vertical
        ) {
            XalaTypography(
                text = title ?: localization.t("example.defaultTitle", "Welcome to Xala"),
                variant = TypographyVariant.Heading2,
                color = tokens.colors.text.primary
            )
            
            XalaTypography(
                text = localization.t("example.description", "This component follows all compliance rules"),
                variant = TypographyVariant.Body1,
                color = tokens.colors.text.secondary
            )
            
            onAction?.let { action ->
                XalaButton(
                    onClick = action,
                    variant = variant,
                    size = ButtonSize.Large,
                    modifier = Modifier.semantics {
                        contentDescription = localization.t("example.actionLabel", "Perform action")
                    }
                ) {
                    XalaTypography(
                        text = localization.t("example.actionText", "Get Started"),
                        variant = TypographyVariant.Button
                    )
                }
            }
        }
    }
}`;
  }
}