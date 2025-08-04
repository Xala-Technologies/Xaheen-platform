/**
 * @fileoverview Dynamic Onboarding Guide Generator
 * @description Generates personalized onboarding guides based on project configuration and tech stack
 * @author Xaheen Enterprise
 * @version 1.0.0
 */

import { BaseGenerator } from "../base.generator";
import { existsSync, mkdirSync, writeFileSync, readFileSync } from "fs";
import { join, resolve } from "path";
import type {
  OnboardingGuideOptions,
  OnboardingGuideResult,
  LearningStep,
  Prerequisite,
  CodeExample,
  InteractiveDemo,
  StepValidation,
  UserPreference,
} from "./portal-types";

export interface OnboardingTemplate {
  readonly id: string;
  readonly name: string;
  readonly description: string;
  readonly targetAudience: readonly string[];
  readonly steps: readonly LearningStep[];
  readonly estimatedTime: number;
}

export interface PersonalizationData {
  readonly experience: 'beginner' | 'intermediate' | 'advanced';
  readonly role: 'developer' | 'user' | 'contributor' | 'admin';
  readonly interests: readonly string[];
  readonly preferredLanguage: string;
  readonly timeAvailable: number; // minutes
  readonly learningStyle: 'visual' | 'hands-on' | 'reading' | 'mixed';
}

export class OnboardingGuideGenerator extends BaseGenerator<OnboardingGuideOptions> {
  private readonly templates: Map<string, OnboardingTemplate> = new Map();

  constructor() {
    super();
    this.initializeTemplates();
  }

  async generate(options: OnboardingGuideOptions): Promise<OnboardingGuideResult> {
    try {
      this.logger.info(`Generating dynamic onboarding guide for ${options.projectName}`);
      
      await this.validateOptions(options);
      
      const outputDir = join(options.outputDir, 'onboarding');
      this.createDirectoryStructure(outputDir);
      
      // Analyze project to personalize content
      const projectAnalysis = await this.analyzeProject(options);
      
      // Generate personalized learning path
      const learningPath = await this.generateLearningPath(options, projectAnalysis);
      
      // Create onboarding guide files
      const guideFiles = await this.createOnboardingFiles(options, learningPath, outputDir);
      
      // Generate interactive elements
      const interactiveFiles = await this.generateInteractiveElements(options, outputDir);
      
      // Create progress tracking system
      const trackingFiles = await this.generateProgressTracking(options, outputDir);
      
      // Generate personalization system
      const personalizationFiles = await this.generatePersonalizationSystem(options, outputDir);
      
      // Create assessment and validation
      const assessmentFiles = await this.generateAssessments(options, learningPath, outputDir);
      
      const allFiles = [
        ...guideFiles,
        ...interactiveFiles,
        ...trackingFiles,
        ...personalizationFiles,
        ...assessmentFiles,
      ];
      
      const totalSteps = learningPath.length;
      const totalTime = learningPath.reduce((sum, step) => sum + step.estimatedTime, 0);
      const prerequisites = this.extractPrerequisites(options);
      
      this.logger.success(`Dynamic onboarding guide generated with ${totalSteps} steps`);
      
      return {
        success: true,
        message: `Dynamic onboarding guide created successfully for ${options.projectName}`,
        files: allFiles,
        guideUrl: this.generateGuideUrl(options),
        stepsGenerated: totalSteps,
        interactiveElements: this.countInteractiveElements(learningPath),
        estimatedCompletionTime: totalTime,
        prerequisites,
        commands: [
          'cd onboarding',
          'npm install # Install interactive demo dependencies',
          'npm start # Start interactive onboarding server',
          'npm run build # Build static onboarding guide',
        ],
        nextSteps: [
          'Customize the onboarding steps for your specific use case',
          'Add project-specific code examples and demos',
          'Configure progress tracking and analytics',
          'Set up user authentication for personalized experiences',
          'Enable feedback collection and guide improvement',
          'Integrate with your main documentation portal',
        ],
      };
    } catch (error) {
      this.logger.error('Failed to generate onboarding guide', error);
      return {
        success: false,
        message: `Failed to generate onboarding guide: ${error instanceof Error ? error.message : 'Unknown error'}`,
        files: [],
        stepsGenerated: 0,
        interactiveElements: 0,
        estimatedCompletionTime: 0,
        prerequisites: [],
        error: error instanceof Error ? error.message : 'Unknown error',
      };
    }
  }

  private initializeTemplates(): void {
    // Developer onboarding template
    this.templates.set('developer', {
      id: 'developer',
      name: 'Developer Onboarding',
      description: 'Complete onboarding for developers joining the project',
      targetAudience: ['developer', 'contributed'],
      estimatedTime: 120,
      steps: [
        {
          id: 'dev-setup',
          title: 'Development Environment Setup',
          description: 'Set up your local development environment',
          type: 'tutorial',
          estimatedTime: 30,
          difficulty: 'beginner',
          content: {
            markdown: '# Development Environment Setup\n\nLet\'s get your development environment ready.',
          },
        },
        {
          id: 'first-contribution',
          title: 'Your First Contribution',
          description: 'Make your first code contribution to the project',
          type: 'exercise',
          estimatedTime: 45,
          difficulty: 'intermediate',
          prerequisites: ['dev-setup'],
          content: {
            markdown: '# Your First Contribution\n\nTime to make your first code change!',
          },
        },
      ],
    });

    // User onboarding template
    this.templates.set('user', {
      id: 'user',
      name: 'User Onboarding',
      description: 'Getting started guide for end users',
      targetAudience: ['user'],
      estimatedTime: 45,
      steps: [
        {
          id: 'user-setup',
          title: 'Getting Started',
          description: 'Learn the basics of using the application',
          type: 'tutorial',
          estimatedTime: 15,
          difficulty: 'beginner',
          content: {
            markdown: '# Getting Started\n\nWelcome! Let\'s learn how to use the application.',
          },
        },
        {
          id: 'first-task',
          title: 'Complete Your First Task',
          description: 'Walk through completing a common task',
          type: 'exercise',
          estimatedTime: 30,
          difficulty: 'beginner',
          prerequisites: ['user-setup'],
          content: {
            markdown: '# Your First Task\n\nLet\'s complete a typical workflow.',
          },
        },
      ],
    });
  }

  private createDirectoryStructure(outputDir: string): void {
    const dirs = [
      outputDir,
      join(outputDir, 'guides'),
      join(outputDir, 'interactive'),
      join(outputDir, 'assessments'),
      join(outputDir, 'assets'),
      join(outputDir, 'src'),
      join(outputDir, 'src', 'components'),
      join(outputDir, 'src', 'utils'),
      join(outputDir, 'public'),
    ];

    dirs.forEach(dir => {
      if (!existsSync(dir)) {
        mkdirSync(dir, { recursive: true });
      }
    });
  }

  private async analyzeProject(options: OnboardingGuideOptions): Promise<ProjectAnalysis> {
    return {
      complexity: this.assessComplexity(options),
      technologies: this.extractTechnologies(options),
      patterns: this.identifyPatterns(options),
      integrations: options.integrations,
      userTypes: this.identifyUserTypes(options),
      commonTasks: this.identifyCommonTasks(options),
    };
  }

  private async generateLearningPath(
    options: OnboardingGuideOptions,
    analysis: ProjectAnalysis
  ): Promise<readonly LearningStep[]> {
    const baseTemplate = this.templates.get(options.guideType) || this.templates.get('developer')!;
    const steps: LearningStep[] = [...baseTemplate.steps];

    // Customize based on project analysis
    if (analysis.complexity === 'high') {
      steps.push(this.createAdvancedStep(options));
    }

    // Add technology-specific steps
    for (const tech of analysis.technologies) {
      const techStep = this.createTechnologyStep(tech, options);
      if (techStep) {
        steps.push(techStep);
      }
    }

    // Add integration steps
    for (const integration of options.integrations) {
      steps.push(this.createIntegrationStep(integration, options));
    }

    // Personalize based on user preferences
    if (options.customization.allowPersonalization) {
      return this.personalizeSteps(steps, options);
    }

    return steps;
  }

  private async createOnboardingFiles(
    options: OnboardingGuideOptions,
    learningPath: readonly LearningStep[],
    outputDir: string
  ): Promise<string[]> {
    const files: string[] = [];

    // Create main guide index
    const indexPath = join(outputDir, 'index.md');
    writeFileSync(indexPath, this.generateGuideIndex(options, learningPath));
    files.push(indexPath);

    // Create individual step files
    for (const step of learningPath) {
      const stepPath = join(outputDir, 'guides', `${step.id}.md`);
      writeFileSync(stepPath, this.generateStepContent(step, options));
      files.push(stepPath);
    }

    // Create learning path configuration
    const configPath = join(outputDir, 'learning-path.json');
    writeFileSync(configPath, JSON.stringify({
      projectName: options.projectName,
      guideType: options.guideType,
      steps: learningPath.map(step => ({
        id: step.id,
        title: step.title,
        estimatedTime: step.estimatedTime,
        difficulty: step.difficulty,
        prerequisites: step.prerequisites || [],
      })),
      totalTime: learningPath.reduce((sum, step) => sum + step.estimatedTime, 0),
    }, null, 2));
    files.push(configPath);

    return files;
  }

  private async generateInteractiveElements(
    options: OnboardingGuideOptions,
    outputDir: string
  ): Promise<string[]> {
    const files: string[] = [];

    if (options.interactiveElements.enableCodePlayground) {
      const playgroundPath = join(outputDir, 'interactive', 'code-playground.html');
      writeFileSync(playgroundPath, this.generateCodePlayground(options));
      files.push(playgroundPath);
    }

    if (options.interactiveElements.enableProgressBar) {
      const progressPath = join(outputDir, 'src', 'components', 'ProgressBar.tsx');
      writeFileSync(progressPath, this.generateProgressBarComponent(options));
      files.push(progressPath);
    }

    if (options.interactiveElements.enableQuizzes) {
      const quizPath = join(outputDir, 'src', 'components', 'Quiz.tsx');
      writeFileSync(quizPath, this.generateQuizComponent(options));
      files.push(quizPath);
    }

    if (options.interactiveElements.enableFeedback) {
      const feedbackPath = join(outputDir, 'src', 'components', 'Feedback.tsx');
      writeFileSync(feedbackPath, this.generateFeedbackComponent(options));
      files.push(feedbackPath);
    }

    return files;
  }

  private async generateProgressTracking(
    options: OnboardingGuideOptions,
    outputDir: string
  ): Promise<string[]> {
    const files: string[] = [];

    if (!options.progressTracking.enabled) return files;

    // Progress tracking utility
    const progressUtilPath = join(outputDir, 'src', 'utils', 'progress.ts');
    writeFileSync(progressUtilPath, this.generateProgressTrackingUtil(options));
    files.push(progressUtilPath);

    // Progress dashboard component
    const dashboardPath = join(outputDir, 'src', 'components', 'ProgressDashboard.tsx');
    writeFileSync(dashboardPath, this.generateProgressDashboard(options));
    files.push(dashboardPath);

    // Achievement system
    if (options.progressTracking.enableBadges) {
      const badgesPath = join(outputDir, 'src', 'components', 'BadgeSystem.tsx');
      writeFileSync(badgesPath, this.generateBadgeSystem(options));
      files.push(badgesPath);
    }

    return files;
  }

  private async generatePersonalizationSystem(
    options: OnboardingGuideOptions,
    outputDir: string
  ): Promise<string[]> {
    const files: string[] = [];

    if (!options.customization.allowPersonalization) return files;

    // Personalization component
    const personalizationPath = join(outputDir, 'src', 'components', 'Personalization.tsx');
    writeFileSync(personalizationPath, this.generatePersonalizationComponent(options));
    files.push(personalizationPath);

    // User preferences handler
    const preferencesPath = join(outputDir, 'src', 'utils', 'preferences.ts');
    writeFileSync(preferencesPath, this.generatePreferencesUtil(options));
    files.push(preferencesPath);

    return files;
  }

  private async generateAssessments(
    options: OnboardingGuideOptions,
    learningPath: readonly LearningStep[],
    outputDir: string
  ): Promise<string[]> {
    const files: string[] = [];

    // Generate assessments for steps that have validation
    for (const step of learningPath) {
      if (step.validation) {
        const assessmentPath = join(outputDir, 'assessments', `${step.id}-assessment.json`);
        writeFileSync(assessmentPath, this.generateStepAssessment(step, options));
        files.push(assessmentPath);
      }
    }

    // Create assessment runner component
    const runnerPath = join(outputDir, 'src', 'components', 'AssessmentRunner.tsx');
    writeFileSync(runnerPath, this.generateAssessmentRunner(options));
    files.push(runnerPath);

    return files;
  }

  private generateGuideIndex(
    options: OnboardingGuideOptions,
    learningPath: readonly LearningStep[]
  ): string {
    const totalTime = learningPath.reduce((sum, step) => sum + step.estimatedTime, 0);
    const prerequisites = this.extractPrerequisites(options);

    return `---
title: ${options.projectName} Onboarding Guide
description: ${options.guideType} onboarding for ${options.projectName}
estimatedTime: ${totalTime} minutes
---

# ${options.projectName} Onboarding Guide

Welcome to the ${options.projectName} ${options.guideType} onboarding guide! This interactive guide will help you get up to speed quickly and efficiently.

## What You'll Learn

${learningPath.map((step, index) => `${index + 1}. **${step.title}** (${step.estimatedTime} min) - ${step.description}`).join('\n')}

## Prerequisites

${prerequisites.length > 0 ? prerequisites.map(req => `- **${req.name}**: ${req.description}${req.required ? ' (Required)' : ' (Optional)'}`).join('\n') : 'No prerequisites required!'}

## Estimated Time

⏱️ **Total time**: ${Math.ceil(totalTime / 60)} hours (${totalTime} minutes)

## Learning Path

${learningPath.map((step, index) => `
### Step ${index + 1}: [${step.title}](./guides/${step.id}.md)

${step.description}

- **Difficulty**: ${step.difficulty}
- **Time**: ${step.estimatedTime} minutes
- **Type**: ${step.type}
${step.prerequisites ? `- **Prerequisites**: ${step.prerequisites.join(', ')}` : ''}
`).join('\n')}

## Getting Started

1. **Check Prerequisites**: Make sure you have all required tools and knowledge
2. **Set Your Pace**: This guide is self-paced - take your time
3. **Get Help**: If you're stuck, don't hesitate to ask for help
4. **Track Progress**: Your progress is automatically saved

## Interactive Features

${options.interactiveElements.enableCodePlayground ? '- 🖥️ **Code Playground**: Try code examples directly in your browser' : ''}
${options.interactiveElements.enableProgressBar ? '- 📊 **Progress Tracking**: See your progress through the guide' : ''}
${options.interactiveElements.enableQuizzes ? '- 🧠 **Knowledge Checks**: Test your understanding with quizzes' : ''}
${options.interactiveElements.enableFeedback ? '- 💬 **Feedback**: Help us improve this guide with your feedback' : ''}

## Support

- 💬 [Community Discussions](${options.repository || '#'}/discussions)
- 🐛 [Report Issues](${options.repository || '#'}/issues)
- 📧 [Contact Support](mailto:support@example.com)

---

Ready to begin? Start with [Step 1: ${learningPath[0]?.title}](./guides/${learningPath[0]?.id}.md)!
`;
  }

  private generateStepContent(step: LearningStep, options: OnboardingGuideOptions): string {
    const nextStep = step.nextSteps?.[0] ? `[Next: ${step.nextSteps[0]}](${step.nextSteps[0]}.md)` : '';
    const prerequisites = step.prerequisites ? step.prerequisites.map(id => `[${id}](${id}.md)`).join(', ') : 'None';

    return `---
title: ${step.title}
description: ${step.description}
type: ${step.type}
difficulty: ${step.difficulty}
estimatedTime: ${step.estimatedTime}
prerequisites: [${step.prerequisites?.join(', ') || ''}]
---

# ${step.title}

${step.description}

## Overview

**Type**: ${step.type} | **Difficulty**: ${step.difficulty} | **Time**: ${step.estimatedTime} minutes

${step.prerequisites ? `**Prerequisites**: ${prerequisites}` : ''}

## Content

${step.content.markdown || ''}

${step.content.codeExamples ? this.generateCodeExamplesSection(step.content.codeExamples) : ''}

${step.content.interactiveDemo ? this.generateInteractiveDemoSection(step.content.interactiveDemo) : ''}

${step.content.externalLinks ? this.generateExternalLinksSection(step.content.externalLinks) : ''}

${step.validation ? this.generateValidationSection(step.validation) : ''}

## What's Next?

${nextStep || 'Congratulations! You\'ve completed this step.'}

---

${options.interactiveElements.enableFeedback ? '**Feedback**: How was this step? [Rate it here](#feedback)' : ''}
`;
  }

  private generateCodeExamplesSection(examples: readonly CodeExample[]): string {
    return `
## Code Examples

${examples.map((example, index) => `
### ${example.title || `Example ${index + 1}`}

${example.description || ''}

\`\`\`${example.language}
${example.code}
\`\`\`

${example.explanation || ''}

${example.runnable ? '> 💡 **Try it yourself**: This example is runnable in the code playground!' : ''}
`).join('\n')}`;
  }

  private generateInteractiveDemoSection(demo: InteractiveDemo): string {
    return `
## Interactive Demo

<div class="interactive-demo" data-type="${demo.type}">
  <!-- Interactive demo will be loaded here -->
  <p>Loading ${demo.type} demo...</p>
</div>

<script>
  // Demo configuration
  window.demoConfig = ${JSON.stringify(demo.config)};
</script>
`;
  }

  private generateExternalLinksSection(links: readonly any[]): string {
    return `
## Additional Resources

${links.map(link => `- [${link.title}](${link.url}) - ${link.description}`).join('\n')}
`;
  }

  private generateValidationSection(validation: StepValidation): string {
    return `
## Validation

Let's check if you've completed this step successfully.

**Validation Type**: ${validation.type}

${validation.type === 'command' ? `
Run this command to validate:
\`\`\`bash
# Validation command will be shown here
\`\`\`
` : ''}

${validation.type === 'quiz' ? `
**Quick Check**: Answer these questions to validate your understanding.

<div class="validation-quiz">
  <!-- Quiz questions will be loaded here -->
</div>
` : ''}

**Success**: ${validation.successMessage}
**Need Help?**: ${validation.failureMessage}

${validation.hints ? `
### Hints
${validation.hints.map(hint => `- ${hint}`).join('\n')}
` : ''}
`;
  }

  private generateCodePlayground(options: OnboardingGuideOptions): string {
    return `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>${options.projectName} Code Playground</title>
    <style>
        body {
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
            margin: 0;
            padding: 20px;
            background-color: #f5f5f5;
        }
        .playground {
            max-width: 1200px;
            margin: 0 auto;
            background: white;
            border-radius: 8px;
            box-shadow: 0 2px 10px rgba(0,0,0,0.1);
            overflow: hidden;
        }
        .header {
            background: #2d3748;
            color: white;
            padding: 15px 20px;
        }
        .editor-container {
            display: flex;
            height: 500px;
        }
        .editor {
            flex: 1;
            border: none;
            font-family: 'Monaco', 'Consolas', monospace;
            font-size: 14px;
            padding: 15px;
            resize: none;
            outline: none;
            border-right: 1px solid #e2e8f0;
        }
        .output {
            flex: 1;
            padding: 15px;
            background: #1a202c;
            color: #e2e8f0;
            font-family: 'Monaco', 'Consolas', monospace;
            font-size: 14px;
            overflow-y: auto;
        }
        .controls {
            padding: 15px 20px;
            background: #f7fafc;
            border-top: 1px solid #e2e8f0;
        }
        .btn {
            background: #4299e1;
            color: white;
            border: none;
            padding: 8px 16px;
            border-radius: 4px;
            cursor: pointer;
            margin-right: 10px;
        }
        .btn:hover {
            background: #3182ce;
        }
    </style>
</head>
<body>
    <div class="playground">
        <div class="header">
            <h2>🖥️ ${options.projectName} Code Playground</h2>
            <p>Try ${options.projectName} code examples directly in your browser!</p>
        </div>
        
        <div class="editor-container">
            <textarea class="editor" id="code-editor" placeholder="// Write your ${options.runtime} code here...">
// Welcome to ${options.projectName}!
// Try some code examples here

console.log('Hello, ${options.projectName}!');
            </textarea>
            <div class="output" id="output">
                <div>Ready to run your code...</div>
            </div>
        </div>
        
        <div class="controls">
            <button class="btn" onclick="runCode()">▶️ Run Code</button>
            <button class="btn" onclick="clearOutput()">🗑️ Clear Output</button>
            <button class="btn" onclick="loadExample()">📚 Load Example</button>
        </div>
    </div>

    <script>
        function runCode() {
            const code = document.getElementById('code-editor').value;
            const output = document.getElementById('output');
            
            // Simple code execution simulation
            try {
                output.innerHTML = '<div style="color: #68d391;">Running code...</div>';
                setTimeout(() => {
                    output.innerHTML += '<div>Code executed successfully!</div>';
                    output.innerHTML += '<div style="color: #fbd38d;">// Output would appear here in a real environment</div>';
                }, 500);
            } catch (error) {
                output.innerHTML = '<div style="color: #fc8181;">Error: ' + error.message + '</div>';
            }
        }
        
        function clearOutput() {
            document.getElementById('output').innerHTML = '<div>Output cleared.</div>';
        }
        
        function loadExample() {
            const examples = [
                '// Basic ${options.projectName} example\\nconsole.log("Welcome to ${options.projectName}!");',
                '// API call example\\nfetch("/api/status")\\n  .then(r => r.json())\\n  .then(data => console.log(data));'
            ];
            
            const randomExample = examples[Math.floor(Math.random() * examples.length)];
            document.getElementById('code-editor').value = randomExample;
        }
    </script>
</body>
</html>`;
  }

  private generateProgressBarComponent(options: OnboardingGuideOptions): string {
    return `import React from 'react';

interface ProgressBarProps {
  readonly current: number;
  readonly total: number;
  readonly stepTitle?: string;
}

export const ProgressBar = ({ current, total, stepTitle }: ProgressBarProps): JSX.Element => {
  const percentage = Math.round((current / total) * 100);
  
  return (
    <div className="progress-container" style={{
      background: '#f7fafc',
      padding: '1rem',
      borderRadius: '8px',
      marginBottom: '2rem',
      border: '1px solid #e2e8f0'
    }}>
      <div className="progress-info" style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: '0.5rem'
      }}>
        <span style={{ fontWeight: 600, color: '#2d3748' }}>
          {stepTitle || 'Progress'}
        </span>
        <span style={{ color: '#4a5568', fontSize: '0.9rem' }}>
          {current} / {total} steps ({percentage}%)
        </span>
      </div>
      
      <div className="progress-bar" style={{
        background: '#e2e8f0',
        borderRadius: '4px',
        overflow: 'hidden',
        height: '8px'
      }}>
        <div 
          className="progress-fill"
          style={{
            background: 'linear-gradient(90deg, #4299e1 0%, #3182ce 100%)',
            height: '100%',
            width: \`\${percentage}%\`,
            transition: 'width 0.3s ease'
          }}
        />
      </div>
      
      {percentage === 100 && (
        <div style={{
          marginTop: '0.5rem',
          color: '#38a169',
          fontSize: '0.9rem',
          fontWeight: 500
        }}>
          🎉 Congratulations! You've completed all steps!
        </div>
      )}
    </div>
  );
};`;
  }

  private generateQuizComponent(options: OnboardingGuideOptions): string {
    return `import React, { useState } from 'react';

interface QuizQuestion {
  readonly question: string;
  readonly options: readonly string[];
  readonly correctAnswer: number;
  readonly explanation?: string;
}

interface QuizProps {
  readonly questions: readonly QuizQuestion[];
  readonly onComplete?: (score: number) => void;
}

export const Quiz = ({ questions, onComplete }: QuizProps): JSX.Element => {
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState<number | null>(null);
  const [showExplanation, setShowExplanation] = useState(false);
  const [score, setScore] = useState(0);
  const [completed, setCompleted] = useState(false);

  const handleAnswerSelect = (answerIndex: number) => {
    setSelectedAnswer(answerIndex);
  };

  const handleNext = () => {
    if (selectedAnswer !== null) {
      const isCorrect = selectedAnswer === questions[currentQuestion].correctAnswer;
      if (isCorrect) {
        setScore(score + 1);
      }
      
      setShowExplanation(true);
      
      setTimeout(() => {
        if (currentQuestion < questions.length - 1) {
          setCurrentQuestion(currentQuestion + 1);
          setSelectedAnswer(null);
          setShowExplanation(false);
        } else {
          setCompleted(true);
          onComplete?.(score + (isCorrect ? 1 : 0));
        }
      }, 2000);
    }
  };

  if (completed) {
    const percentage = Math.round((score / questions.length) * 100);
    return (
      <div className="quiz-complete" style={{
        textAlign: 'center',
        padding: '2rem',
        background: '#f0fff4',
        border: '1px solid #68d391',
        borderRadius: '8px'
      }}>
        <h3>🎉 Quiz Complete!</h3>
        <p>Your score: {score} / {questions.length} ({percentage}%)</p>
        {percentage >= 80 ? (
          <p style={{ color: '#38a169' }}>Excellent work! You're ready to move on.</p>
        ) : (
          <p style={{ color: '#d69e2e' }}>Good effort! Consider reviewing the material.</p>
        )}
      </div>
    );
  }

  const question = questions[currentQuestion];
  
  return (
    <div className="quiz-container" style={{
      background: '#ffffff',
      border: '1px solid #e2e8f0',
      borderRadius: '8px',
      padding: '1.5rem',
      marginBottom: '2rem'
    }}>
      <div className="quiz-header" style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: '1rem'
      }}>
        <h4>Knowledge Check</h4>
        <span style={{ color: '#4a5568', fontSize: '0.9rem' }}>
          {currentQuestion + 1} / {questions.length}
        </span>
      </div>
      
      <div className="question" style={{ marginBottom: '1rem' }}>
        <p style={{ fontWeight: 500, marginBottom: '1rem' }}>
          {question.question}
        </p>
        
        <div className="options">
          {question.options.map((option, index) => (
            <label
              key={index}
              style={{
                display: 'block',
                padding: '0.75rem',
                margin: '0.5rem 0',
                background: selectedAnswer === index ? '#ebf8ff' : '#f7fafc',
                border: \`1px solid \${selectedAnswer === index ? '#4299e1' : '#e2e8f0'}\`,
                borderRadius: '4px',
                cursor: 'pointer',
                transition: 'all 0.2s'
              }}
            >
              <input
                type="radio"
                name="quiz-answer"
                value={index}
                checked={selectedAnswer === index}
                onChange={() => handleAnswerSelect(index)}
                style={{ marginRight: '0.5rem' }}
              />
              {option}
            </label>
          ))}
        </div>
      </div>
      
      {showExplanation && question.explanation && (
        <div className="explanation" style={{
          background: selectedAnswer === question.correctAnswer ? '#f0fff4' : '#fff5f5',
          border: \`1px solid \${selectedAnswer === question.correctAnswer ? '#68d391' : '#fc8181'}\`,
          borderRadius: '4px',
          padding: '1rem',
          marginBottom: '1rem'
        }}>
          <strong>
            {selectedAnswer === question.correctAnswer ? '✅ Correct!' : '❌ Incorrect'}
          </strong>
          <p>{question.explanation}</p>
        </div>
      )}
      
      <button
        onClick={handleNext}
        disabled={selectedAnswer === null}
        style={{
          background: selectedAnswer !== null ? '#4299e1' : '#a0aec0',
          color: 'white',
          border: 'none',
          padding: '0.5rem 1rem',
          borderRadius: '4px',
          cursor: selectedAnswer !== null ? 'pointer' : 'not-allowed'
        }}
      >
        {currentQuestion < questions.length - 1 ? 'Next Question' : 'Complete Quiz'}
      </button>
    </div>
  );
};`;
  }

  private generateFeedbackComponent(options: OnboardingGuideOptions): string {
    return `import React, { useState } from 'react';

interface FeedbackProps {
  readonly stepId: string;
  readonly onSubmit?: (feedback: FeedbackData) => void;
}

interface FeedbackData {
  readonly stepId: string;
  readonly rating: number;
  readonly comment: string;
  readonly suggestions: string;
  readonly timestamp: Date;
}

export const Feedback = ({ stepId, onSubmit }: FeedbackProps): JSX.Element => {
  const [rating, setRating] = useState(0);
  const [comment, setComment] = useState('');
  const [suggestions, setSuggestions] = useState('');
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    const feedbackData: FeedbackData = {
      stepId,
      rating,
      comment,
      suggestions,
      timestamp: new Date()
    };
    
    onSubmit?.(feedbackData);
    setSubmitted(true);
    
    // Reset form after 3 seconds
    setTimeout(() => {
      setSubmitted(false);
      setRating(0);
      setComment('');
      setSuggestions('');
    }, 3000);
  };

  if (submitted) {
    return (
      <div style={{
        background: '#f0fff4',
        border: '1px solid #68d391',
        borderRadius: '8px',
        padding: '1rem',
        textAlign: 'center'
      }}>
        <h4>🙏 Thank you for your feedback!</h4>
        <p>Your input helps us improve the onboarding experience.</p>
      </div>
    );
  }

  return (
    <div className="feedback-container" style={{
      background: '#f7fafc',
      border: '1px solid #e2e8f0',
      borderRadius: '8px',
      padding: '1.5rem',
      marginTop: '2rem'
    }}>
      <h4>💬 How was this step?</h4>
      <p style={{ color: '#4a5568', marginBottom: '1rem' }}>
        Your feedback helps us improve the onboarding experience.
      </p>
      
      <form onSubmit={handleSubmit}>
        <div style={{ marginBottom: '1rem' }}>
          <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 500 }}>
            Rating:
          </label>
          <div style={{ display: 'flex', gap: '0.25rem' }}>
            {[1, 2, 3, 4, 5].map(star => (
              <button
                key={star}
                type="button"
                onClick={() => setRating(star)}
                style={{
                  background: 'none',
                  border: 'none',
                  fontSize: '1.5rem',
                  cursor: 'pointer',
                  color: star <= rating ? '#f6e05e' : '#e2e8f0'
                }}
              >
                ⭐
              </button>
            ))}
          </div>
        </div>
        
        <div style={{ marginBottom: '1rem' }}>
          <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 500 }}>
            Comments:
          </label>
          <textarea
            value={comment}
            onChange={(e) => setComment(e.target.value)}
            placeholder="What did you think about this step?"
            style={{
              width: '100%',
              padding: '0.5rem',
              border: '1px solid #e2e8f0',
              borderRadius: '4px',
              minHeight: '80px',
              resize: 'vertical'
            }}
          />
        </div>
        
        <div style={{ marginBottom: '1rem' }}>
          <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 500 }}>
            Suggestions for improvement:
          </label>
          <textarea
            value={suggestions}
            onChange={(e) => setSuggestions(e.target.value)}
            placeholder="How could we make this step better?"
            style={{
              width: '100%',
              padding: '0.5rem',
              border: '1px solid #e2e8f0',
              borderRadius: '4px',
              minHeight: '60px',
              resize: 'vertical'
            }}
          />
        </div>
        
        <button
          type="submit"
          disabled={rating === 0}
          style={{
            background: rating > 0 ? '#4299e1' : '#a0aec0',
            color: 'white',
            border: 'none',
            padding: '0.5rem 1rem',
            borderRadius: '4px',
            cursor: rating > 0 ? 'pointer' : 'not-allowed'
          }}
        >
          Submit Feedback
        </button>
      </form>
    </div>
  );
};`;
  }

  private generateProgressTrackingUtil(options: OnboardingGuideOptions): string {
    return `/**
 * Progress Tracking Utility
 * Handles user progress through the onboarding guide
 */

export interface StepProgress {
  readonly stepId: string;
  readonly completed: boolean;
  readonly startedAt?: Date;
  readonly completedAt?: Date;
  readonly timeSpent?: number; // seconds
  readonly score?: number;
}

export interface UserProgress {
  readonly userId?: string;
  readonly sessionId: string;
  readonly startedAt: Date;
  readonly lastUpdated: Date;
  readonly steps: Record<string, StepProgress>;
  readonly totalSteps: number;
  readonly completedSteps: number;
  readonly currentStep: string;
  readonly estimatedTimeRemaining: number;
}

class ProgressTracker {
  private storageKey = '${options.projectName.toLowerCase()}-onboarding-progress';
  private sessionId: string;

  constructor() {
    this.sessionId = this.generateSessionId();
  }

  /**
   * Initialize or load user progress
   */
  initializeProgress(totalSteps: number, firstStepId: string): UserProgress {
    const existing = this.loadProgress();
    
    if (existing) {
      return existing;
    }

    const progress: UserProgress = {
      sessionId: this.sessionId,
      startedAt: new Date(),
      lastUpdated: new Date(),
      steps: {},
      totalSteps,
      completedSteps: 0,
      currentStep: firstStepId,
      estimatedTimeRemaining: 0,
    };

    this.saveProgress(progress);
    return progress;
  }

  /**
   * Start a step
   */
  startStep(stepId: string): void {
    const progress = this.loadProgress();
    if (!progress) return;

    progress.steps[stepId] = {
      stepId,
      completed: false,
      startedAt: new Date(),
    };

    progress.currentStep = stepId;
    progress.lastUpdated = new Date();
    
    this.saveProgress(progress);
  }

  /**
   * Complete a step
   */
  completeStep(stepId: string, score?: number): void {
    const progress = this.loadProgress();
    if (!progress) return;

    const stepProgress = progress.steps[stepId];
    if (!stepProgress) return;

    const now = new Date();
    const timeSpent = stepProgress.startedAt 
      ? Math.round((now.getTime() - stepProgress.startedAt.getTime()) / 1000)
      : 0;

    progress.steps[stepId] = {
      ...stepProgress,
      completed: true,
      completedAt: now,
      timeSpent,
      score,
    };

    progress.completedSteps = Object.values(progress.steps).filter(s => s.completed).length;
    progress.lastUpdated = now;
    
    this.saveProgress(progress);
    this.trackEvent('step_completed', { stepId, timeSpent, score });
  }

  /**
   * Get current progress
   */
  getProgress(): UserProgress | null {
    return this.loadProgress();
  }

  /**
   * Get progress percentage
   */
  getProgressPercentage(): number {
    const progress = this.loadProgress();
    if (!progress) return 0;
    
    return Math.round((progress.completedSteps / progress.totalSteps) * 100);
  }

  /**
   * Check if step is completed
   */
  isStepCompleted(stepId: string): boolean {
    const progress = this.loadProgress();
    return progress?.steps[stepId]?.completed || false;
  }

  /**
   * Get step progress
   */
  getStepProgress(stepId: string): StepProgress | null {
    const progress = this.loadProgress();
    return progress?.steps[stepId] || null;
  }

  /**
   * Reset progress
   */
  resetProgress(): void {
    ${options.progressTracking.persistenceMethod === 'localStorage' 
      ? 'localStorage.removeItem(this.storageKey);'
      : 'sessionStorage.removeItem(this.storageKey);'
    }
    this.sessionId = this.generateSessionId();
  }

  /**
   * Export progress data
   */
  exportProgress(): string {
    const progress = this.loadProgress();
    return JSON.stringify(progress, null, 2);
  }

  private loadProgress(): UserProgress | null {
    try {
      const stored = ${options.progressTracking.persistenceMethod === 'localStorage' 
        ? 'localStorage.getItem(this.storageKey)'
        : 'sessionStorage.getItem(this.storageKey)'
      };
      
      if (stored) {
        const progress = JSON.parse(stored);
        // Convert date strings back to Date objects
        progress.startedAt = new Date(progress.startedAt);
        progress.lastUpdated = new Date(progress.lastUpdated);
        
        Object.values(progress.steps).forEach((step: any) => {
          if (step.startedAt) step.startedAt = new Date(step.startedAt);
          if (step.completedAt) step.completedAt = new Date(step.completedAt);
        });
        
        return progress;
      }
    } catch (error) {
      console.warn('Failed to load progress:', error);
    }
    
    return null;
  }

  private saveProgress(progress: UserProgress): void {
    try {
      ${options.progressTracking.persistenceMethod === 'localStorage' 
        ? 'localStorage.setItem(this.storageKey, JSON.stringify(progress));'
        : 'sessionStorage.setItem(this.storageKey, JSON.stringify(progress));'
      }
    } catch (error) {
      console.warn('Failed to save progress:', error);
    }
  }

  private generateSessionId(): string {
    return Math.random().toString(36).substring(2) + Date.now().toString(36);
  }

  private trackEvent(eventName: string, data: any): void {
    // Integration with analytics
    if (typeof gtag !== 'undefined') {
      gtag('event', eventName, {
        custom_parameter_1: data.stepId,
        custom_parameter_2: data.timeSpent,
        custom_parameter_3: data.score,
      });
    }
    
    console.log('Progress Event:', eventName, data);
  }
}

export const progressTracker = new ProgressTracker();`;
  }

  private generateProgressDashboard(options: OnboardingGuideOptions): string {
    return `import React, { useEffect, useState } from 'react';
import { progressTracker, UserProgress } from '../utils/progress';

export const ProgressDashboard = (): JSX.Element => {
  const [progress, setProgress] = useState<UserProgress | null>(null);

  useEffect(() => {
    const currentProgress = progressTracker.getProgress();
    setProgress(currentProgress);

    // Update progress every 30 seconds
    const interval = setInterval(() => {
      const updatedProgress = progressTracker.getProgress();
      setProgress(updatedProgress);
    }, 30000);

    return () => clearInterval(interval);
  }, []);

  if (!progress) {
    return (
      <div style={{ textAlign: 'center', padding: '2rem' }}>
        <p>No progress data available</p>
      </div>
    );
  }

  const percentage = Math.round((progress.completedSteps / progress.totalSteps) * 100);
  const timeSpent = Object.values(progress.steps)
    .reduce((total, step) => total + (step.timeSpent || 0), 0);
  
  const formatTime = (seconds: number): string => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    return hours > 0 ? \`\${hours}h \${minutes}m\` : \`\${minutes}m\`;
  };

  return (
    <div className="progress-dashboard" style={{
      background: '#ffffff',
      border: '1px solid #e2e8f0',
      borderRadius: '8px',
      padding: '1.5rem',
      marginBottom: '2rem'
    }}>
      <h3 style={{ marginTop: 0, marginBottom: '1.5rem' }}>
        📊 Your Progress
      </h3>
      
      {/* Overall Progress */}
      <div style={{ marginBottom: '2rem' }}>
        <div style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          marginBottom: '0.5rem'
        }}>
          <span style={{ fontWeight: 600 }}>Overall Progress</span>
          <span>{progress.completedSteps} / {progress.totalSteps} steps</span>
        </div>
        
        <div style={{
          background: '#e2e8f0',
          borderRadius: '8px',
          overflow: 'hidden',
          height: '12px',
          marginBottom: '0.5rem'
        }}>
          <div style={{
            background: 'linear-gradient(90deg, #4299e1 0%, #3182ce 100%)',
            height: '100%',
            width: \`\${percentage}%\`,
            transition: 'width 0.3s ease'
          }} />
        </div>
        
        <div style={{
          display: 'flex',
          justifyContent: 'space-between',
          fontSize: '0.9rem',
          color: '#4a5568'
        }}>
          <span>{percentage}% complete</span>
          <span>Time spent: {formatTime(timeSpent)}</span>
        </div>
      </div>

      {/* Step Details */}
      <div>
        <h4 style={{ marginBottom: '1rem' }}>Step Progress</h4>
        <div style={{ display: 'grid', gap: '0.5rem' }}>
          {Object.entries(progress.steps).map(([stepId, stepProgress]) => (
            <div
              key={stepId}
              style={{
                display: 'flex',
                alignItems: 'center',
                padding: '0.75rem',
                background: stepProgress.completed ? '#f0fff4' : '#f7fafc',
                border: \`1px solid \${stepProgress.completed ? '#68d391' : '#e2e8f0'}\`,
                borderRadius: '4px'
              }}
            >
              <div style={{ marginRight: '0.75rem' }}>
                {stepProgress.completed ? '✅' : 
                 progress.currentStep === stepId ? '🔄' : '⭕'}
              </div>
              
              <div style={{ flex: 1 }}>
                <div style={{ fontWeight: 500 }}>{stepId}</div>
                {stepProgress.timeSpent && (
                  <div style={{ fontSize: '0.8rem', color: '#4a5568' }}>
                    Time: {formatTime(stepProgress.timeSpent)}
                    {stepProgress.score && \` • Score: \${stepProgress.score}\`}
                  </div>
                )}
              </div>
              
              {stepProgress.completed && stepProgress.completedAt && (
                <div style={{ fontSize: '0.8rem', color: '#4a5568' }}>
                  {new Date(stepProgress.completedAt).toLocaleDateString()}
                </div>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Actions */}
      <div style={{
        marginTop: '1.5rem',
        paddingTop: '1.5rem',
        borderTop: '1px solid #e2e8f0',
        display: 'flex',
        gap: '0.5rem'
      }}>
        <button
          onClick={() => {
            const exported = progressTracker.exportProgress();
            const blob = new Blob([exported], { type: 'application/json' });
            const url = URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = '${options.projectName.toLowerCase()}-progress.json';
            a.click();
            URL.revokeObjectURL(url);
          }}
          style={{
            background: '#4299e1',
            color: 'white',
            border: 'none',
            padding: '0.5rem 1rem',
            borderRadius: '4px',
            cursor: 'pointer',
            fontSize: '0.9rem'
          }}
        >
          📥 Export Progress
        </button>
        
        <button
          onClick={() => {
            if (confirm('Are you sure you want to reset your progress?')) {
              progressTracker.resetProgress();
              setProgress(null);
            }
          }}
          style={{
            background: '#e53e3e',
            color: 'white',
            border: 'none',
            padding: '0.5rem 1rem',
            borderRadius: '4px',
            cursor: 'pointer',
            fontSize: '0.9rem'
          }}
        >
          🔄 Reset Progress
        </button>
      </div>
    </div>
  );
};`;
  }

  private generateBadgeSystem(options: OnboardingGuideOptions): string {
    return `import React, { useEffect, useState } from 'react';
import { progressTracker } from '../utils/progress';

interface Badge {
  readonly id: string;
  readonly name: string;
  readonly description: string;
  readonly icon: string;
  readonly condition: (progress: any) => boolean;
  readonly rarity: 'common' | 'rare' | 'legendary';
}

const badges: readonly Badge[] = [
  {
    id: 'first-step',
    name: 'Getting Started',
    description: 'Complete your first onboarding step',
    icon: '🌟',
    rarity: 'common',
    condition: (progress) => progress.completedSteps >= 1
  },
  {
    id: 'halfway',
    name: 'Halfway Hero',
    description: 'Complete 50% of the onboarding',
    icon: '🏃',
    rarity: 'common',
    condition: (progress) => (progress.completedSteps / progress.totalSteps) >= 0.5
  },
  {
    id: 'completionist',
    name: 'Completionist',
    description: 'Complete all onboarding steps',
    icon: '🏆',
    rarity: 'rare',
    condition: (progress) => progress.completedSteps === progress.totalSteps
  },
  {
    id: 'speed-runner',
    name: 'Speed Runner',
    description: 'Complete onboarding in under 2 hours',
    icon: '⚡',
    rarity: 'rare',
    condition: (progress) => {
      const totalTime = Object.values(progress.steps)
        .reduce((sum: number, step: any) => sum + (step.timeSpent || 0), 0);
      return progress.completedSteps === progress.totalSteps && totalTime < 7200;
    }
  },
  {
    id: 'perfectionist',
    name: 'Perfectionist',
    description: 'Complete all steps with perfect scores',
    icon: '🎯',
    rarity: 'legendary',
    condition: (progress) => {
      const steps = Object.values(progress.steps);
      return steps.length > 0 && steps.every((step: any) => 
        step.completed && (!step.score || step.score === 100)
      );
    }
  }
];

export const BadgeSystem = (): JSX.Element => {
  const [earnedBadges, setEarnedBadges] = useState<Badge[]>([]);
  const [recentBadge, setRecentBadge] = useState<Badge | null>(null);

  useEffect(() => {
    const checkBadges = () => {
      const progress = progressTracker.getProgress();
      if (!progress) return;

      const newlyEarned = badges.filter(badge => 
        badge.condition(progress) && !earnedBadges.find(earned => earned.id === badge.id)
      );

      if (newlyEarned.length > 0) {
        setEarnedBadges(prev => [...prev, ...newlyEarned]);
        setRecentBadge(newlyEarned[0]);
        
        // Show notification
        setTimeout(() => setRecentBadge(null), 5000);
      }
    };

    checkBadges();
    const interval = setInterval(checkBadges, 5000);
    return () => clearInterval(interval);
  }, [earnedBadges]);

  const getRarityColor = (rarity: Badge['rarity']): string => {
    switch (rarity) {
      case 'common': return '#38a169';
      case 'rare': return '#3182ce';
      case 'legendary': return '#d69e2e';
      default: return '#4a5568';
    }
  };

  const getRarityBackground = (rarity: Badge['rarity']): string => {
    switch (rarity) {
      case 'common': return '#f0fff4';
      case 'rare': return '#ebf8ff';
      case 'legendary': return '#fffaf0';
      default: return '#f7fafc';
    }
  };

  return (
    <div className="badge-system">
      {/* Recent Badge Notification */}
      {recentBadge && (
        <div style={{
          position: 'fixed',
          top: '20px',
          right: '20px',
          background: getRarityBackground(recentBadge.rarity),
          border: \`2px solid \${getRarityColor(recentBadge.rarity)}\`,
          borderRadius: '8px',
          padding: '1rem',
          zIndex: 1000,
          minWidth: '250px',
          boxShadow: '0 4px 12px rgba(0, 0, 0, 0.15)',
          animation: 'slideIn 0.3s ease'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', marginBottom: '0.5rem' }}>
            <span style={{ fontSize: '1.5rem', marginRight: '0.5rem' }}>
              {recentBadge.icon}
            </span>
            <strong style={{ color: getRarityColor(recentBadge.rarity) }}>
              Badge Earned!
            </strong>
          </div>
          <div style={{ fontWeight: 600, marginBottom: '0.25rem' }}>
            {recentBadge.name}
          </div>
          <div style={{ fontSize: '0.9rem', color: '#4a5568' }}>
            {recentBadge.description}
          </div>
        </div>
      )}

      {/* Badge Collection */}
      <div style={{
        background: '#ffffff',
        border: '1px solid #e2e8f0',
        borderRadius: '8px',
        padding: '1.5rem',
        marginBottom: '2rem'
      }}>
        <h3 style={{ marginTop: 0, marginBottom: '1.5rem' }}>
          🏅 Your Badges ({earnedBadges.length}/{badges.length})
        </h3>

        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))',
          gap: '1rem'
        }}>
          {badges.map(badge => {
            const earned = earnedBadges.find(e => e.id === badge.id);
            
            return (
              <div
                key={badge.id}
                style={{
                  background: earned ? getRarityBackground(badge.rarity) : '#f7fafc',
                  border: \`1px solid \${earned ? getRarityColor(badge.rarity) : '#e2e8f0'}\`,
                  borderRadius: '6px',
                  padding: '1rem',
                  textAlign: 'center',
                  opacity: earned ? 1 : 0.5,
                  transition: 'all 0.3s ease'
                }}
              >
                <div style={{ fontSize: '2rem', marginBottom: '0.5rem' }}>
                  {badge.icon}
                </div>
                
                <div style={{
                  fontWeight: 600,
                  marginBottom: '0.25rem',
                  color: earned ? getRarityColor(badge.rarity) : '#4a5568'
                }}>
                  {badge.name}
                </div>
                
                <div style={{
                  fontSize: '0.8rem',
                  color: '#4a5568',
                  marginBottom: '0.5rem'
                }}>
                  {badge.description}
                </div>
                
                <div style={{
                  fontSize: '0.7rem',
                  textTransform: 'uppercase',
                  fontWeight: 600,
                  color: getRarityColor(badge.rarity)
                }}>
                  {badge.rarity}
                </div>
                
                {earned && (
                  <div style={{
                    fontSize: '0.7rem',
                    color: '#4a5568',
                    marginTop: '0.5rem'
                  }}>
                    ✅ Earned
                  </div>
                )}
              </div>
            );
          })}
        </div>

        {earnedBadges.length === badges.length && (
          <div style={{
            textAlign: 'center',
            marginTop: '2rem',
            padding: '1rem',
            background: '#fffaf0',
            border: '1px solid #d69e2e',
            borderRadius: '6px'
          }}>
            <div style={{ fontSize: '2rem', marginBottom: '0.5rem' }}>🎉</div>
            <strong style={{ color: '#d69e2e' }}>
              Congratulations! You've earned all badges!
            </strong>
          </div>
        )}
      </div>

      <style>
        {\`
          @keyframes slideIn {
            from {
              transform: translateX(100%);
              opacity: 0;
            }
            to {
              transform: translateX(0);
              opacity: 1;
            }
          }
        \`}
      </style>
    </div>
  );
};`;
  }

  private generatePersonalizationComponent(options: OnboardingGuideOptions): string {
    return `import React, { useState, useEffect } from 'react';

interface PersonalizationData {
  readonly experience: 'beginner' | 'intermediate' | 'advanced';
  readonly role: 'developer' | 'user' | 'contributor' | 'admin';
  readonly interests: readonly string[];
  readonly preferredLanguage: string;
  readonly timeAvailable: number;
  readonly learningStyle: 'visual' | 'hands-on' | 'reading' | 'mixed';
}

interface PersonalizationProps {
  readonly onComplete: (data: PersonalizationData) => void;
}

const availableInterests = [
  'Frontend Development',
  'Backend Development',
  'DevOps',
  'Testing',
  'Documentation',
  'API Design',
  'Performance',
  'Security',
  'Mobile Development',
  'Data Analysis'
];

export const Personalization = ({ onComplete }: PersonalizationProps): JSX.Element => {
  const [experience, setExperience] = useState<PersonalizationData['experience']>('beginner');
  const [role, setRole] = useState<PersonalizationData['role']>('user');
  const [interests, setInterests] = useState<string[]>([]);
  const [preferredLanguage, setPreferredLanguage] = useState('typescript');
  const [timeAvailable, setTimeAvailable] = useState(60);
  const [learningStyle, setLearningStyle] = useState<PersonalizationData['learningStyle']>('mixed');
  const [currentStep, setCurrentStep] = useState(1);
  const totalSteps = 5;

  const handleInterestToggle = (interest: string) => {
    setInterests(prev => 
      prev.includes(interest)
        ? prev.filter(i => i !== interest)
        : [...prev, interest]
    );
  };

  const handleNext = () => {
    if (currentStep < totalSteps) {
      setCurrentStep(currentStep + 1);
    } else {
      onComplete({
        experience,
        role,
        interests,
        preferredLanguage,
        timeAvailable,
        learningStyle
      });
    }
  };

  const handlePrevious = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  };

  const renderStep = () => {
    switch (currentStep) {
      case 1:
        return (
          <div>
            <h3>What's your experience level?</h3>
            <p style={{ color: '#4a5568', marginBottom: '1.5rem' }}>
              This helps us customize the content complexity for you.
            </p>
            
            {(['beginner', 'intermediate', 'advanced'] as const).map(level => (
              <label
                key={level}
                style={{
                  display: 'block',
                  padding: '1rem',
                  margin: '0.5rem 0',
                  background: experience === level ? '#ebf8ff' : '#f7fafc',
                  border: \`2px solid \${experience === level ? '#4299e1' : '#e2e8f0'}\`,
                  borderRadius: '8px',
                  cursor: 'pointer',
                  transition: 'all 0.2s'
                }}
              >
                <input
                  type="radio"
                  name="experience"
                  value={level}
                  checked={experience === level}
                  onChange={() => setExperience(level)}
                  style={{ marginRight: '0.5rem' }}
                />
                <strong style={{ textTransform: 'capitalize' }}>{level}</strong>
                <div style={{ fontSize: '0.9rem', color: '#4a5568', marginTop: '0.25rem' }}>
                  {level === 'beginner' && 'New to ${options.projectName} and similar technologies'}
                  {level === 'intermediate' && 'Some experience with similar tools and concepts'}
                  {level === 'advanced' && 'Experienced developer looking for specific features'}
                </div>
              </label>
            ))}
          </div>
        );

      case 2:
        return (
          <div>
            <h3>What's your primary role?</h3>
            <p style={{ color: '#4a5568', marginBottom: '1.5rem' }}>
              We'll focus on the most relevant content for your role.
            </p>
            
            {(['developer', 'user', 'contributor', 'admin'] as const).map(roleOption => (
              <label
                key={roleOption}
                style={{
                  display: 'block',
                  padding: '1rem',
                  margin: '0.5rem 0',
                  background: role === roleOption ? '#ebf8ff' : '#f7fafc',
                  border: \`2px solid \${role === roleOption ? '#4299e1' : '#e2e8f0'}\`,
                  borderRadius: '8px',
                  cursor: 'pointer',
                  transition: 'all 0.2s'
                }}
              >
                <input
                  type="radio"
                  name="role"
                  value={roleOption}
                  checked={role === roleOption}
                  onChange={() => setRole(roleOption)}
                  style={{ marginRight: '0.5rem' }}
                />
                <strong style={{ textTransform: 'capitalize' }}>{roleOption}</strong>
                <div style={{ fontSize: '0.9rem', color: '#4a5568', marginTop: '0.25rem' }}>
                  {roleOption === 'developer' && 'Building applications with ${options.projectName}'}
                  {roleOption === 'user' && 'Using ${options.projectName} as an end user'}
                  {roleOption === 'contributor' && 'Contributing to ${options.projectName} development'}
                  {roleOption === 'admin' && 'Managing ${options.projectName} deployments'}
                </div>
              </label>
            ))}
          </div>
        );

      case 3:
        return (
          <div>
            <h3>What interests you most?</h3>
            <p style={{ color: '#4a5568', marginBottom: '1.5rem' }}>
              Select any topics you'd like to focus on (optional).
            </p>
            
            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
              gap: '0.5rem'
            }}>
              {availableInterests.map(interest => (
                <label
                  key={interest}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    padding: '0.75rem',
                    background: interests.includes(interest) ? '#ebf8ff' : '#f7fafc',
                    border: \`1px solid \${interests.includes(interest) ? '#4299e1' : '#e2e8f0'}\`,
                    borderRadius: '6px',
                    cursor: 'pointer',
                    transition: 'all 0.2s'
                  }}
                >
                  <input
                    type="checkbox"
                    checked={interests.includes(interest)}
                    onChange={() => handleInterestToggle(interest)}
                    style={{ marginRight: '0.5rem' }}
                  />
                  <span style={{ fontSize: '0.9rem' }}>{interest}</span>
                </label>
              ))}
            </div>
          </div>
        );

      case 4:
        return (
          <div>
            <h3>How much time do you have?</h3>
            <p style={{ color: '#4a5568', marginBottom: '1.5rem' }}>
              We'll recommend a learning path that fits your schedule.
            </p>
            
            <div style={{ marginBottom: '1.5rem' }}>
              <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 500 }}>
                Available time: {timeAvailable} minutes
              </label>
              <input
                type="range"
                min="15"
                max="240"
                step="15"
                value={timeAvailable}
                onChange={(e) => setTimeAvailable(Number(e.target.value))}
                style={{ width: '100%', marginBottom: '0.5rem' }}
              />
              <div style={{
                display: 'flex',
                justifyContent: 'space-between',
                fontSize: '0.8rem',
                color: '#4a5568'
              }}>
                <span>15 min</span>
                <span>4 hours</span>
              </div>
            </div>

            <div style={{
              padding: '1rem',
              background: '#f0fff4',
              border: '1px solid #68d391',
              borderRadius: '6px'
            }}>
              <strong>Recommendation:</strong>
              {timeAvailable < 30 && ' Quick overview with key concepts'}
              {timeAvailable >= 30 && timeAvailable < 90 && ' Essential features with hands-on examples'}
              {timeAvailable >= 90 && timeAvailable < 180 && ' Comprehensive walkthrough with practice exercises'}
              {timeAvailable >= 180 && ' Complete deep-dive with advanced topics'}
            </div>
          </div>
        );

      case 5:
        return (
          <div>
            <h3>How do you prefer to learn?</h3>
            <p style={{ color: '#4a5568', marginBottom: '1.5rem' }}>
              We'll adapt the content format to match your learning style.
            </p>
            
            {(['visual', 'hands-on', 'reading', 'mixed'] as const).map(style => (
              <label
                key={style}
                style={{
                  display: 'block',
                  padding: '1rem',
                  margin: '0.5rem 0',
                  background: learningStyle === style ? '#ebf8ff' : '#f7fafc',
                  border: \`2px solid \${learningStyle === style ? '#4299e1' : '#e2e8f0'}\`,
                  borderRadius: '8px',
                  cursor: 'pointer',
                  transition: 'all 0.2s'
                }}
              >
                <input
                  type="radio"
                  name="learningStyle"
                  value={style}
                  checked={learningStyle === style}
                  onChange={() => setLearningStyle(style)}
                  style={{ marginRight: '0.5rem' }}
                />
                <strong style={{ textTransform: 'capitalize' }}>{style}</strong>
                <div style={{ fontSize: '0.9rem', color: '#4a5568', marginTop: '0.25rem' }}>
                  {style === 'visual' && 'Diagrams, screenshots, and visual examples'}
                  {style === 'hands-on' && 'Interactive exercises and code playgrounds'}
                  {style === 'reading' && 'Detailed explanations and comprehensive guides'}
                  {style === 'mixed' && 'Combination of all formats'}
                </div>
              </label>
            ))}
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <div style={{
      maxWidth: '600px',
      margin: '0 auto',
      background: '#ffffff',
      border: '1px solid #e2e8f0',
      borderRadius: '8px',
      padding: '2rem'
    }}>
      <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
        <h2>🎯 Personalize Your Experience</h2>
        <p style={{ color: '#4a5568' }}>
          Help us create the perfect onboarding experience for you
        </p>
        
        {/* Progress indicator */}
        <div style={{
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          gap: '0.5rem',
          marginTop: '1rem'
        }}>
          {Array.from({ length: totalSteps }, (_, i) => (
            <div
              key={i}
              style={{
                width: '10px',
                height: '10px',
                borderRadius: '50%',
                background: i + 1 <= currentStep ? '#4299e1' : '#e2e8f0',
                transition: 'background 0.3s ease'
              }}
            />
          ))}
        </div>
        <div style={{ fontSize: '0.9rem', color: '#4a5568', marginTop: '0.5rem' }}>
          Step {currentStep} of {totalSteps}
        </div>
      </div>

      {renderStep()}

      <div style={{
        display: 'flex',
        justifyContent: 'space-between',
        marginTop: '2rem',
        paddingTop: '1.5rem',
        borderTop: '1px solid #e2e8f0'
      }}>
        <button
          onClick={handlePrevious}
          disabled={currentStep === 1}
          style={{
            background: currentStep === 1 ? '#a0aec0' : '#e2e8f0',
            color: currentStep === 1 ? 'white' : '#4a5568',
            border: 'none',
            padding: '0.75rem 1.5rem',
            borderRadius: '6px',
            cursor: currentStep === 1 ? 'not-allowed' : 'pointer',
            transition: 'all 0.2s'
          }}
        >
          ← Previous
        </button>

        <button
          onClick={handleNext}
          style={{
            background: '#4299e1',
            color: 'white',
            border: 'none',
            padding: '0.75rem 1.5rem',
            borderRadius: '6px',
            cursor: 'pointer',
            transition: 'all 0.2s'
          }}
        >
          {currentStep === totalSteps ? 'Start Learning →' : 'Next →'}
        </button>
      </div>
    </div>
  );
};`;
  }

  private generatePreferencesUtil(options: OnboardingGuideOptions): string {
    return `/**
 * User Preferences Utility
 * Manages user preferences and personalization data
 */

export interface UserPreferences {
  readonly experience: 'beginner' | 'intermediate' | 'advanced';
  readonly role: 'developer' | 'user' | 'contributor' | 'admin';
  readonly interests: readonly string[];
  readonly preferredLanguage: string;
  readonly timeAvailable: number;
  readonly learningStyle: 'visual' | 'hands-on' | 'reading' | 'mixed';
  readonly completedPersonalization: boolean;
  readonly createdAt: Date;
  readonly updatedAt: Date;
}

class PreferencesManager {
  private storageKey = '${options.projectName.toLowerCase()}-preferences';

  /**
   * Save user preferences
   */
  savePreferences(preferences: Omit<UserPreferences, 'completedPersonalization' | 'createdAt' | 'updatedAt'>): void {
    const existing = this.loadPreferences();
    
    const fullPreferences: UserPreferences = {
      ...preferences,
      completedPersonalization: true,
      createdAt: existing?.createdAt || new Date(),
      updatedAt: new Date(),
    };

    try {
      localStorage.setItem(this.storageKey, JSON.stringify(fullPreferences));
      console.log('Preferences saved successfully');
    } catch (error) {
      console.warn('Failed to save preferences:', error);
    }
  }

  /**
   * Load user preferences
   */
  loadPreferences(): UserPreferences | null {
    try {
      const stored = localStorage.getItem(this.storageKey);
      
      if (stored) {
        const preferences = JSON.parse(stored);
        // Convert date strings back to Date objects
        preferences.createdAt = new Date(preferences.createdAt);
        preferences.updatedAt = new Date(preferences.updatedAt);
        return preferences;
      }
    } catch (error) {
      console.warn('Failed to load preferences:', error);
    }
    
    return null;
  }

  /**
   * Check if user has completed personalization
   */
  hasCompletedPersonalization(): boolean {
    const preferences = this.loadPreferences();
    return preferences?.completedPersonalization || false;
  }

  /**
   * Clear user preferences
   */
  clearPreferences(): void {
    try {
      localStorage.removeItem(this.storageKey);
      console.log('Preferences cleared');
    } catch (error) {
      console.warn('Failed to clear preferences:', error);
    }
  }

  /**
   * Get recommended learning path based on preferences
   */
  getRecommendedPath(): {
    readonly skipBasics: boolean;
    readonly focusAreas: readonly string[];
    readonly timePerStep: number;
    readonly contentFormat: 'visual' | 'hands-on' | 'reading' | 'mixed';
  } {
    const preferences = this.loadPreferences();
    
    if (!preferences) {
      return {
        skipBasics: false,
        focusAreas: [],
        timePerStep: 15,
        contentFormat: 'mixed',
      };
    }

    return {
      skipBasics: preferences.experience === 'advanced',
      focusAreas: preferences.interests,
      timePerStep: Math.max(10, preferences.timeAvailable / 8), // Assume 8 steps average
      contentFormat: preferences.learningStyle,
    };
  }

  /**
   * Filter content based on user preferences
   */
  filterContent<T extends { difficulty?: string; tags?: readonly string[]; estimatedTime?: number }>(
    content: readonly T[]
  ): readonly T[] {
    const preferences = this.loadPreferences();
    
    if (!preferences) {
      return content;
    }

    return content.filter(item => {
      // Filter by difficulty
      if (item.difficulty) {
        const difficulties = ['beginner', 'intermediate', 'advanced'];
        const userLevel = difficulties.indexOf(preferences.experience);
        const itemLevel = difficulties.indexOf(item.difficulty);
        
        // Don't show content that's too advanced, but allow easier content
        if (itemLevel > userLevel + 1) {
          return false;
        }
      }

      // Filter by interests
      if (preferences.interests.length > 0 && item.tags) {
        const hasMatchingTag = item.tags.some(tag => 
          preferences.interests.some(interest => 
            interest.toLowerCase().includes(tag.toLowerCase()) ||
            tag.toLowerCase().includes(interest.toLowerCase())
          )
        );
        
        // Include content with matching tags or general content (no tags)
        if (item.tags.length > 0 && !hasMatchingTag) {
          return false;
        }
      }

      // Filter by available time
      if (item.estimatedTime && item.estimatedTime > preferences.timeAvailable) {
        return false;
      }

      return true;
    });
  }

  /**
   * Get personalized welcome message
   */
  getWelcomeMessage(): string {
    const preferences = this.loadPreferences();
    
    if (!preferences) {
      return 'Welcome to ${options.projectName}! Let\\'s get you started.';
    }

    const roleMessages = {
      developer: 'Ready to build something amazing with ${options.projectName}?',
      user: 'Let\\'s explore what ${options.projectName} can do for you!',
      contributor: 'Thanks for contributing to ${options.projectName}! Let\\'s get you set up.',
      admin: 'Welcome, admin! Let\\'s configure ${options.projectName} for your organization.',
    };

    return roleMessages[preferences.role] || 'Welcome back to ${options.projectName}!';
  }

  /**
   * Export preferences for backup
   */
  exportPreferences(): string {
    const preferences = this.loadPreferences();
    return JSON.stringify(preferences, null, 2);
  }

  /**
   * Import preferences from backup
   */
  importPreferences(data: string): boolean {
    try {
      const preferences = JSON.parse(data);
      
      // Validate the data structure
      if (this.validatePreferences(preferences)) {
        localStorage.setItem(this.storageKey, data);
        return true;
      }
    } catch (error) {
      console.warn('Failed to import preferences:', error);
    }
    
    return false;
  }

  private validatePreferences(data: any): boolean {
    const requiredFields = ['experience', 'role', 'interests', 'preferredLanguage', 'timeAvailable', 'learningStyle'];
    
    return requiredFields.every(field => field in data) &&
           ['beginner', 'intermediate', 'advanced'].includes(data.experience) &&
           ['developer', 'user', 'contributor', 'admin'].includes(data.role) &&
           Array.isArray(data.interests) &&
           typeof data.timeAvailable === 'number' &&
           ['visual', 'hands-on', 'reading', 'mixed'].includes(data.learningStyle);
  }
}

export const preferencesManager = new PreferencesManager();`;
  }

  private generateAssessmentRunner(options: OnboardingGuideOptions): string {
    return `import React, { useState } from 'react';

interface Assessment {
  readonly stepId: string;
  readonly type: 'quiz' | 'command' | 'file-check' | 'manual';
  readonly title: string;
  readonly instructions: string;
  readonly questions?: readonly AssessmentQuestion[];
  readonly commands?: readonly string[];
  readonly expectedFiles?: readonly string[];
  readonly manualChecklist?: readonly string[];
}

interface AssessmentQuestion {
  readonly question: string;
  readonly type: 'multiple-choice' | 'text' | 'code';
  readonly options?: readonly string[];
  readonly correctAnswer?: string | number;
  readonly hint?: string;
}

interface AssessmentRunnerProps {
  readonly assessment: Assessment;
  readonly onComplete: (passed: boolean, score?: number) => void;
  readonly onSkip?: () => void;
}

export const AssessmentRunner = ({ assessment, onComplete, onSkip }: AssessmentRunnerProps): JSX.Element => {
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [answers, setAnswers] = useState<Record<number, any>>({});
  const [showResults, setShowResults] = useState(false);
  const [score, setScore] = useState(0);
  const [commandOutput, setCommandOutput] = useState<string>('');
  const [manualChecklist, setManualChecklist] = useState<Record<number, boolean>>({});

  const handleAnswer = (questionIndex: number, answer: any) => {
    setAnswers(prev => ({ ...prev, [questionIndex]: answer }));
  };

  const handleNext = () => {
    if (assessment.questions && currentQuestion < assessment.questions.length - 1) {
      setCurrentQuestion(currentQuestion + 1);
    } else {
      calculateResults();
    }
  };

  const calculateResults = () => {
    let correctCount = 0;
    
    if (assessment.questions) {
      assessment.questions.forEach((question, index) => {
        const userAnswer = answers[index];
        const correctAnswer = question.correctAnswer;
        
        if (question.type === 'multiple-choice' && userAnswer === correctAnswer) {
          correctCount++;
        } else if (question.type === 'text' && userAnswer?.toLowerCase().trim() === correctAnswer?.toString().toLowerCase()) {
          correctCount++;
        }
      });
      
      const finalScore = Math.round((correctCount / assessment.questions.length) * 100);
      setScore(finalScore);
      setShowResults(true);
      
      const passed = finalScore >= 70; // 70% pass rate
      setTimeout(() => onComplete(passed, finalScore), 2000);
    }
  };

  const handleCommandRun = async (command: string) => {
    setCommandOutput('Running command...\\n');
    
    // Simulate command execution
    setTimeout(() => {
      setCommandOutput(prev => 
        prev + \`$ \${command}\\n\` +
        'Command executed successfully!\\n' +
        'Output: Success\\n'
      );
    }, 1000);
  };

  const handleManualCheck = (index: number, checked: boolean) => {
    setManualChecklist(prev => ({ ...prev, [index]: checked }));
  };

  const renderQuizAssessment = () => {
    if (!assessment.questions) return null;
    
    if (showResults) {
      return (
        <div style={{
          textAlign: 'center',
          padding: '2rem',
          background: score >= 70 ? '#f0fff4' : '#fff5f5',
          border: \`1px solid \${score >= 70 ? '#68d391' : '#fc8181'}\`,
          borderRadius: '8px'
        }}>
          <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>
            {score >= 70 ? '🎉' : '📚'}
          </div>
          <h3>{score >= 70 ? 'Great job!' : 'Keep learning!'}</h3>
          <p>Your score: {score}%</p>
          <p>
            {score >= 70 
              ? 'You\\'ve mastered this step!' 
              : 'Review the material and try again when ready.'
            }
          </p>
        </div>
      );
    }

    const question = assessment.questions[currentQuestion];
    
    return (
      <div>
        <div style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          marginBottom: '1.5rem'
        }}>
          <h4>Assessment Question</h4>
          <span style={{ color: '#4a5568', fontSize: '0.9rem' }}>
            {currentQuestion + 1} / {assessment.questions.length}
          </span>
        </div>
        
        <div style={{
          background: '#f7fafc',
          padding: '1.5rem',
          borderRadius: '8px',
          marginBottom: '1.5rem'
        }}>
          <p style={{ fontWeight: 500, marginBottom: '1rem' }}>
            {question.question}
          </p>
          
          {question.type === 'multiple-choice' && question.options && (
            <div>
              {question.options.map((option, index) => (
                <label
                  key={index}
                  style={{
                    display: 'block',
                    padding: '0.75rem',
                    margin: '0.5rem 0',
                    background: answers[currentQuestion] === index ? '#ebf8ff' : 'white',
                    border: \`1px solid \${answers[currentQuestion] === index ? '#4299e1' : '#e2e8f0'}\`,
                    borderRadius: '4px',
                    cursor: 'pointer'
                  }}
                >
                  <input
                    type="radio"
                    name={`question-\${currentQuestion}`}
                    checked={answers[currentQuestion] === index}
                    onChange={() => handleAnswer(currentQuestion, index)}
                    style={{ marginRight: '0.5rem' }}
                  />
                  {option}
                </label>
              ))}
            </div>
          )}
          
          {question.type === 'text' && (
            <input
              type="text"
              value={answers[currentQuestion] || ''}
              onChange={(e) => handleAnswer(currentQuestion, e.target.value)}
              placeholder="Enter your answer..."
              style={{
                width: '100%',
                padding: '0.75rem',
                border: '1px solid #e2e8f0',
                borderRadius: '4px',
                fontSize: '1rem'
              }}
            />
          )}
          
          {question.type === 'code' && (
            <textarea
              value={answers[currentQuestion] || ''}
              onChange={(e) => handleAnswer(currentQuestion, e.target.value)}
              placeholder="Write your code here..."
              style={{
                width: '100%',
                padding: '0.75rem',
                border: '1px solid #e2e8f0',
                borderRadius: '4px',
                fontFamily: 'monospace',
                minHeight: '120px',
                resize: 'vertical'
              }}
            />
          )}
          
          {question.hint && (
            <div style={{
              marginTop: '1rem',
              padding: '0.75rem',
              background: '#fffaf0',
              border: '1px solid #f6e05e',
              borderRadius: '4px',
              fontSize: '0.9rem'
            }}>
              <strong>💡 Hint:</strong> {question.hint}
            </div>
          )}
        </div>
        
        <div style={{ display: 'flex', justifyContent: 'space-between' }}>
          <button
            onClick={() => setCurrentQuestion(Math.max(0, currentQuestion - 1))}
            disabled={currentQuestion === 0}
            style={{
              background: currentQuestion === 0 ? '#a0aec0' : '#e2e8f0',
              color: currentQuestion === 0 ? 'white' : '#4a5568',
              border: 'none',
              padding: '0.75rem 1.5rem',
              borderRadius: '4px',
              cursor: currentQuestion === 0 ? 'not-allowed' : 'pointer'
            }}
          >
            Previous
          </button>
          
          <button
            onClick={handleNext}
            disabled={!(currentQuestion in answers)}
            style={{
              background: currentQuestion in answers ? '#4299e1' : '#a0aec0',
              color: 'white',
              border: 'none',
              padding: '0.75rem 1.5rem',
              borderRadius: '4px',
              cursor: currentQuestion in answers ? 'pointer' : 'not-allowed'
            }}
          >
            {currentQuestion === assessment.questions.length - 1 ? 'Complete' : 'Next'}
          </button>
        </div>
      </div>
    );
  };

  const renderCommandAssessment = () => {
    return (
      <div>
        <h4>Command Validation</h4>
        <p style={{ color: '#4a5568', marginBottom: '1.5rem' }}>
          {assessment.instructions}
        </p>
        
        {assessment.commands?.map((command, index) => (
          <div
            key={index}
            style={{
              background: '#f7fafc',
              padding: '1rem',
              borderRadius: '8px',
              marginBottom: '1rem'
            }}
          >
            <div style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              marginBottom: '0.5rem'
            }}>
              <code style={{ background: '#2d3748', color: 'white', padding: '0.25rem 0.5rem', borderRadius: '4px' }}>
                {command}
              </code>
              <button
                onClick={() => handleCommandRun(command)}
                style={{
                  background: '#4299e1',
                  color: 'white',
                  border: 'none',
                  padding: '0.5rem 1rem',
                  borderRadius: '4px',
                  cursor: 'pointer'
                }}
              >
                Run
              </button>
            </div>
          </div>
        ))}
        
        {commandOutput && (
          <div style={{
            background: '#1a202c',
            color: '#e2e8f0',
            padding: '1rem',
            borderRadius: '8px',
            fontFamily: 'monospace',
            fontSize: '0.9rem',
            whiteSpace: 'pre-wrap',
            marginBottom: '1rem'
          }}>
            {commandOutput}
          </div>
        )}
        
        <button
          onClick={() => onComplete(true)}
          style={{
            background: '#38a169',
            color: 'white',
            border: 'none',
            padding: '0.75rem 1.5rem',
            borderRadius: '4px',
            cursor: 'pointer'
          }}
        >
          Mark as Complete
        </button>
      </div>
    );
  };

  const renderManualAssessment = () => {
    const allChecked = assessment.manualChecklist?.every((_, index) => manualChecklist[index]) || false;
    
    return (
      <div>
        <h4>Manual Verification</h4>
        <p style={{ color: '#4a5568', marginBottom: '1.5rem' }}>
          {assessment.instructions}
        </p>
        
        <div style={{ marginBottom: '1.5rem' }}>
          {assessment.manualChecklist?.map((item, index) => (
            <label
              key={index}
              style={{
                display: 'flex',
                alignItems: 'flex-start',
                padding: '0.75rem',
                margin: '0.5rem 0',
                background: manualChecklist[index] ? '#f0fff4' : '#f7fafc',
                border: \`1px solid \${manualChecklist[index] ? '#68d391' : '#e2e8f0'}\`,
                borderRadius: '4px',
                cursor: 'pointer'
              }}
            >
              <input
                type="checkbox"
                checked={manualChecklist[index] || false}
                onChange={(e) => handleManualCheck(index, e.target.checked)}
                style={{ marginRight: '0.75rem', marginTop: '0.125rem' }}
              />
              <span>{item}</span>
            </label>
          ))}
        </div>
        
        <button
          onClick={() => onComplete(allChecked)}
          disabled={!allChecked}
          style={{
            background: allChecked ? '#38a169' : '#a0aec0',
            color: 'white',
            border: 'none',
            padding: '0.75rem 1.5rem',
            borderRadius: '4px',
            cursor: allChecked ? 'pointer' : 'not-allowed'
          }}
        >
          Complete Step
        </button>
      </div>
    );
  };

  return (
    <div style={{
      background: '#ffffff',
      border: '1px solid #e2e8f0',
      borderRadius: '8px',
      padding: '1.5rem',
      marginTop: '2rem'
    }}>
      <div style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: '1.5rem'
      }}>
        <h3>📝 {assessment.title}</h3>
        {onSkip && (
          <button
            onClick={onSkip}
            style={{
              background: 'none',
              border: '1px solid #e2e8f0',
              color: '#4a5568',
              padding: '0.5rem 1rem',
              borderRadius: '4px',
              cursor: 'pointer'
            }}
          >
            Skip Assessment
          </button>
        )}
      </div>
      
      {assessment.type === 'quiz' && renderQuizAssessment()}
      {assessment.type === 'command' && renderCommandAssessment()}
      {assessment.type === 'manual' && renderManualAssessment()}
    </div>
  );
};`;
  }

  private generateStepAssessment(step: LearningStep, options: OnboardingGuideOptions): string {
    // Generate a sample assessment based on step type and content
    const assessment = {
      stepId: step.id,
      type: step.validation?.type || 'quiz',
      title: `${step.title} Assessment`,
      instructions: step.validation?.successMessage || `Verify that you've completed: ${step.title}`,
    };

    if (step.validation?.type === 'quiz') {
      // Generate sample quiz questions based on step content
      assessment.questions = [
        {
          question: `What is the main objective of the "${step.title}" step?`,
          type: 'multiple-choice',
          options: [
            step.description,
            'Learn advanced concepts',
            'Complete the entire course',
            'Set up development tools'
          ],
          correctAnswer: 0,
          hint: 'Review the step description for the answer.'
        }
      ];
    }

    return JSON.stringify(assessment, null, 2);
  }

  // Helper methods for analysis and generation
  private assessComplexity(options: OnboardingGuideOptions): 'low' | 'medium' | 'high' {
    let complexity = 0;
    
    if (options.integrations.length > 3) complexity++;
    if (options.databases.length > 1) complexity++;
    if (options.framework) complexity++;
    if (['microservice', 'fullstack'].includes(options.projectType)) complexity++;
    
    if (complexity <= 1) return 'low';
    if (complexity <= 3) return 'medium';
    return 'high';
  }

  private extractTechnologies(options: OnboardingGuideOptions): string[] {
    const technologies = [options.runtime];
    
    if (options.framework) technologies.push(options.framework);
    technologies.push(...options.databases);
    technologies.push(...options.integrations);
    
    return [...new Set(technologies)];
  }

  private identifyPatterns(options: OnboardingGuideOptions): string[] {
    const patterns = [];
    
    if (options.projectType === 'microservice') patterns.push('microservices');
    if (options.integrations.length > 0) patterns.push('integration');
    if (options.databases.length > 0) patterns.push('data-persistence');
    
    return patterns;
  }

  private identifyUserTypes(options: OnboardingGuideOptions): string[] {
    const userTypes = [options.guideType];
    
    if (options.targetAudience.length > 0) {
      userTypes.push(...options.targetAudience);
    }
    
    return [...new Set(userTypes)];
  }

  private identifyCommonTasks(options: OnboardingGuideOptions): string[] {
    const tasks = ['setup', 'configuration'];
    
    if (options.projectType === 'api') tasks.push('api-testing');
    if (options.databases.length > 0) tasks.push('database-setup');
    if (options.integrations.length > 0) tasks.push('integration-setup');
    
    return tasks;
  }

  private createAdvancedStep(options: OnboardingGuideOptions): LearningStep {
    return {
      id: 'advanced-concepts',
      title: 'Advanced Concepts',
      description: 'Explore advanced features and best practices',
      type: 'concept',
      estimatedTime: 45,
      difficulty: 'advanced',
      content: {
        markdown: `# Advanced ${options.projectName} Concepts\n\nNow that you've mastered the basics, let's explore advanced features.`,
      },
    };
  }

  private createTechnologyStep(tech: string, options: OnboardingGuideOptions): LearningStep | null {
    const techSteps: Record<string, Partial<LearningStep>> = {
      docker: {
        title: 'Docker Integration',
        description: 'Learn how to containerize your application',
        type: 'tutorial',
        estimatedTime: 30,
      },
      kubernetes: {
        title: 'Kubernetes Deployment',
        description: 'Deploy your application to Kubernetes',
        type: 'tutorial',
        estimatedTime: 45,
      },
      redis: {
        title: 'Redis Caching',
        description: 'Implement caching with Redis',
        type: 'tutorial',
        estimatedTime: 25,
      },
    };

    const stepTemplate = techSteps[tech.toLowerCase()];
    if (!stepTemplate) return null;

    return {
      id: `${tech.toLowerCase()}-integration`,
      difficulty: 'intermediate',
      content: {
        markdown: `# ${stepTemplate.title}\n\n${stepTemplate.description}`,
      },
      ...stepTemplate,
    } as LearningStep;
  }

  private createIntegrationStep(integration: string, options: OnboardingGuideOptions): LearningStep {
    return {
      id: `${integration.toLowerCase()}-integration`,
      title: `${integration} Integration`,
      description: `Learn how to integrate with ${integration}`,
      type: 'tutorial',
      estimatedTime: 35,
      difficulty: 'intermediate',
      content: {
        markdown: `# ${integration} Integration\n\nIntegrate your ${options.projectName} application with ${integration}.`,
      },
    };
  }

  private personalizeSteps(steps: LearningStep[], options: OnboardingGuideOptions): LearningStep[] {
    // This would implement actual personalization logic
    // For now, return steps as-is
    return steps;
  }

  private extractPrerequisites(options: OnboardingGuideOptions): readonly string[] {
    const prerequisites: Prerequisite[] = [];
    
    prerequisites.push({
      name: options.runtime,
      description: `${options.runtime} runtime environment`,
      type: 'tool',
      required: true,
    });

    if (options.databases.length > 0) {
      prerequisites.push({
        name: 'Database',
        description: `${options.databases[0]} database`,
        type: 'tool',
        required: true,
      });
    }

    return prerequisites.map(p => p.name);
  }

  private countInteractiveElements(learningPath: readonly LearningStep[]): number {
    return learningPath.reduce((count, step) => {
      let elementCount = 0;
      if (step.content.codeExamples?.length) elementCount += step.content.codeExamples.length;
      if (step.content.interactiveDemo) elementCount += 1;
      if (step.validation) elementCount += 1;
      return count + elementCount;
    }, 0);
  }

  private generateGuideUrl(options: OnboardingGuideOptions): string {
    return `${options.outputDir}/onboarding/index.html`;
  }
}

interface ProjectAnalysis {
  readonly complexity: 'low' | 'medium' | 'high';
  readonly technologies: readonly string[];
  readonly patterns: readonly string[];
  readonly integrations: readonly string[];
  readonly userTypes: readonly string[];
  readonly commonTasks: readonly string[];
}