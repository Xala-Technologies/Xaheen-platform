/**
 * Storybook Story Generator for Xala UI System
 */

import type { ComponentConfig } from "../types/index.js";

export class StoryGenerator {
	public generateStory(config: ComponentConfig): string {
		const { name, category, variant } = config;

		return `
import type { Meta, StoryObj } from '@storybook/react';
import { ${name} } from './${name}.js';

const meta: Meta<typeof ${name}> = {
  title: '${this.getCategoryTitle(category)}/${name}',
  component: ${name},
  parameters: {
    layout: 'centered',
    docs: {
      description: {
        component: 'A ${category} component built with Xala UI System.'
      }
    }
  },
  tags: ['autodocs'],
  argTypes: {
    variant: {
      control: { type: 'select' },
      options: ['default', 'outline', 'ghost', 'destructive']
    },
    size: {
      control: { type: 'select' },
      options: ['sm', 'md', 'lg']
    }
  }
};

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    variant: '${variant || "default"}',
    size: 'md'
  }
};

export const Small: Story = {
  args: {
    ...Default.args,
    size: 'sm'
  }
};

export const Large: Story = {
  args: {
    ...Default.args,
    size: 'lg'
  }
};

export const Interactive: Story = {
  args: {
    ...Default.args
  },
  play: async ({ canvasElement }) => {
    // Add interaction tests here
  }
};`;
	}

	private getCategoryTitle(category: string): string {
		switch (category) {
			case "form":
				return "Forms";
			case "navigation":
				return "Navigation";
			case "data-display":
				return "Data Display";
			case "interactive":
				return "Interactive";
			case "feedback":
				return "Feedback";
			case "layout":
				return "Layout";
			default:
				return "Components";
		}
	}
}
