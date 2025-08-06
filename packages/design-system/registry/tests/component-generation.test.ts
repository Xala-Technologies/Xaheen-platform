/**
 * Component Generation Test Suite
 * Tests the generation templates and output quality
 */

import { describe, it, expect } from 'vitest';
import { ComponentGenerator, PlatformTemplates } from '../templates/component-generator';
import { COMPONENT_REGISTRY } from '../core/component-specs';

describe('Component Generation Quality', () => {
  describe('React Template', () => {
    it('should generate valid React components', () => {
      const buttonSpec = COMPONENT_REGISTRY.button;
      const files = ComponentGenerator.generateComponent(buttonSpec, 'react');
      const componentFile = files[0];

      expect(componentFile.content).toContain('import React');
      expect(componentFile.content).toContain('forwardRef');
      expect(componentFile.content).toContain('export const Button');
      expect(componentFile.content).toContain('Button.displayName');
      expect(componentFile.content).toContain('interface ButtonProps');
    });

    it('should include proper TypeScript types', () => {
      const buttonSpec = COMPONENT_REGISTRY.button;
      const files = ComponentGenerator.generateComponent(buttonSpec, 'react');
      const componentFile = files[0];

      expect(componentFile.content).toContain('interface');
      expect(componentFile.content).toContain('readonly');
      expect(componentFile.content).toMatch(/: JSX\.Element|: React\.JSX\.Element/);
    });

    it('should generate tests when requested', () => {
      const buttonSpec = COMPONENT_REGISTRY.button;
      const files = ComponentGenerator.generateComponent(buttonSpec, 'react', {
        includeTests: true
      });

      const testFile = files.find(f => f.type === 'test');
      expect(testFile).toBeDefined();
      expect(testFile!.content).toContain("import { render, screen } from '@testing-library/react'");
      expect(testFile!.content).toContain('describe(');
      expect(testFile!.content).toContain('test(');
    });

    it('should generate Storybook stories when requested', () => {
      const buttonSpec = COMPONENT_REGISTRY.button;
      const files = ComponentGenerator.generateComponent(buttonSpec, 'react', {
        includeStories: true
      });

      const storyFile = files.find(f => f.type === 'story');
      expect(storyFile).toBeDefined();
      expect(storyFile!.content).toContain("import type { Meta, StoryObj } from '@storybook/react'");
      expect(storyFile!.content).toContain('const meta: Meta');
      expect(storyFile!.content).toContain('export default meta');
    });
  });

  describe('Vue Template', () => {
    it('should generate valid Vue components', () => {
      const buttonSpec = COMPONENT_REGISTRY.button;
      const files = ComponentGenerator.generateComponent(buttonSpec, 'vue');
      const componentFile = files[0];

      expect(componentFile.content).toContain('<template>');
      expect(componentFile.content).toContain('<script setup lang="ts">');
      expect(componentFile.content).toContain('</template>');
      expect(componentFile.content).toContain('defineProps');
      expect(componentFile.content).toContain('defineEmits');
    });

    it('should include proper Vue 3 patterns', () => {
      const buttonSpec = COMPONENT_REGISTRY.button;
      const files = ComponentGenerator.generateComponent(buttonSpec, 'vue');
      const componentFile = files[0];

      expect(componentFile.content).toContain('computed(');
      expect(componentFile.content).toContain('withDefaults(');
      expect(componentFile.content).toContain('defineOptions');
    });
  });

  describe('Angular Template', () => {
    it('should generate valid Angular components', () => {
      const buttonSpec = COMPONENT_REGISTRY.button;
      const files = ComponentGenerator.generateComponent(buttonSpec, 'angular');
      const componentFile = files[0];

      expect(componentFile.content).toContain('@Component(');
      expect(componentFile.content).toContain('@Input()');
      expect(componentFile.content).toContain('@Output()');
      expect(componentFile.content).toContain('export class');
      expect(componentFile.content).toContain('standalone: true');
    });

    it('should include proper Angular patterns', () => {
      const buttonSpec = COMPONENT_REGISTRY.button;
      const files = ComponentGenerator.generateComponent(buttonSpec, 'angular');
      const componentFile = files[0];

      expect(componentFile.content).toContain('ChangeDetectionStrategy.OnPush');
      expect(componentFile.content).toContain('EventEmitter');
      expect(componentFile.content).toContain('CommonModule');
    });
  });

  describe('Svelte Template', () => {
    it('should generate valid Svelte components', () => {
      const buttonSpec = COMPONENT_REGISTRY.button;
      const files = ComponentGenerator.generateComponent(buttonSpec, 'svelte');
      const componentFile = files[0];

      expect(componentFile.content).toContain('<script lang="ts">');
      expect(componentFile.content).toContain('export let');
      expect(componentFile.content).toContain('createEventDispatcher');
      expect(componentFile.content).toContain('$:');
    });

    it('should include proper Svelte patterns', () => {
      const buttonSpec = COMPONENT_REGISTRY.button;
      const files = ComponentGenerator.generateComponent(buttonSpec, 'svelte');
      const componentFile = files[0];

      expect(componentFile.content).toContain('dispatch(');
      expect(componentFile.content).toContain('{...$$restProps}');
      expect(componentFile.content).toContain('<style>');
    });
  });

  describe('React Native Template', () => {
    it('should generate valid React Native components', () => {
      const buttonSpec = COMPONENT_REGISTRY.button;
      const files = ComponentGenerator.generateComponent(buttonSpec, 'react-native');
      const componentFile = files[0];

      expect(componentFile.content).toContain('import React from');
      expect(componentFile.content).toContain('TouchableOpacity');
      expect(componentFile.content).toContain('StyleSheet');
      expect(componentFile.content).toContain('export const');
    });

    it('should include proper React Native patterns', () => {
      const buttonSpec = COMPONENT_REGISTRY.button;
      const files = ComponentGenerator.generateComponent(buttonSpec, 'react-native');
      const componentFile = files[0];

      expect(componentFile.content).toContain('StyleSheet.create');
      expect(componentFile.content).toContain('ViewStyle');
      expect(componentFile.content).toContain('testID');
    });
  });

  describe('Radix UI Template', () => {
    it('should generate enhanced Radix components', () => {
      const buttonSpec = COMPONENT_REGISTRY.button;
      const files = ComponentGenerator.generateComponent(buttonSpec, 'radix');
      const componentFile = files[0];

      expect(componentFile.content).toContain('@radix-ui/react-slot');
      expect(componentFile.content).toContain('asChild');
      expect(componentFile.content).toContain('Slot.Slot');
      expect(componentFile.content).toContain('class-variance-authority');
    });
  });

  describe('Headless UI Template', () => {
    it('should generate enhanced Headless UI components', () => {
      const buttonSpec = COMPONENT_REGISTRY.button;
      const files = ComponentGenerator.generateComponent(buttonSpec, 'headless-ui');
      const componentFile = files[0];

      expect(componentFile.content).toContain('@headlessui/react');
      expect(componentFile.content).toContain('data-[');
      expect(componentFile.content).toContain('HeadlessButton');
    });
  });

  describe('Web Components Template', () => {
    it('should generate valid Web Components', () => {
      const buttonSpec = COMPONENT_REGISTRY.button;
      const files = ComponentGenerator.generateComponent(buttonSpec, 'vanilla');
      const componentFile = files[0];

      expect(componentFile.content).toContain('class ButtonElement extends HTMLElement');
      expect(componentFile.content).toContain('customElements.define');
      expect(componentFile.content).toContain('shadowRoot');
      expect(componentFile.content).toContain('observedAttributes');
    });

    it('should include proper Web Component patterns', () => {
      const buttonSpec = COMPONENT_REGISTRY.button;
      const files = ComponentGenerator.generateComponent(buttonSpec, 'vanilla');
      const componentFile = files[0];

      expect(componentFile.content).toContain('connectedCallback');
      expect(componentFile.content).toContain('attributeChangedCallback');
      expect(componentFile.content).toContain('CustomEvent');
    });
  });

  describe('All Platform Generation', () => {
    it('should generate for all supported platforms', () => {
      const buttonSpec = COMPONENT_REGISTRY.button;
      const allFiles = ComponentGenerator.generateForAllPlatforms(buttonSpec);

      expect(Object.keys(allFiles)).toEqual(
        expect.arrayContaining(buttonSpec.platforms)
      );

      // Each platform should have at least one file
      Object.values(allFiles).forEach(files => {
        expect(files.length).toBeGreaterThan(0);
      });
    });

    it('should handle generation errors gracefully', () => {
      const buttonSpec = COMPONENT_REGISTRY.button;
      
      // Mock a template that throws an error
      const originalTemplate = PlatformTemplates.react;
      PlatformTemplates.react = {
        ...originalTemplate,
        generateComponent: () => {
          throw new Error('Test error');
        }
      };

      const allFiles = ComponentGenerator.generateForAllPlatforms(buttonSpec);
      
      // Should still return results for other platforms
      expect(Object.keys(allFiles).length).toBeGreaterThan(0);
      expect(allFiles.react).toEqual([]); // Failed platform should have empty array

      // Restore original template
      PlatformTemplates.react = originalTemplate;
    });
  });

  describe('Code Quality Checks', () => {
    const platforms = ['react', 'vue', 'angular', 'svelte', 'react-native', 'radix', 'headless-ui', 'vanilla'] as const;

    platforms.forEach(platform => {
      describe(`${platform} code quality`, () => {
        it('should not contain TODO or FIXME comments', () => {
          const buttonSpec = COMPONENT_REGISTRY.button;
          const files = ComponentGenerator.generateComponent(buttonSpec, platform);
          
          files.forEach(file => {
            expect(file.content).not.toMatch(/TODO|FIXME|XXX/i);
          });
        });

        it('should include proper accessibility attributes', () => {
          const buttonSpec = COMPONENT_REGISTRY.button;
          const files = ComponentGenerator.generateComponent(buttonSpec, platform);
          const componentFile = files[0];

          if (platform !== 'react-native' && platform !== 'vanilla') {
            // Most platforms should include aria attributes
            expect(componentFile.content).toMatch(/aria-|role=/);
          }
        });

        it('should include the component name in the output', () => {
          const buttonSpec = COMPONENT_REGISTRY.button;
          const files = ComponentGenerator.generateComponent(buttonSpec, platform);
          
          files.forEach(file => {
            expect(file.content).toContain(buttonSpec.name);
          });
        });

        it('should have consistent file extensions', () => {
          const buttonSpec = COMPONENT_REGISTRY.button;
          const files = ComponentGenerator.generateComponent(buttonSpec, platform);
          const template = PlatformTemplates[platform];
          
          files.forEach(file => {
            if (file.type === 'component') {
              expect(file.path).toMatch(new RegExp(`\\${template.fileExtension}$`));
            }
          });
        });
      });
    });
  });
});