import type { Meta, StoryObj } from '@storybook/react-vite';

const Test = ({ text }: { text: string }) => <div>{text}</div>;

const meta: Meta<typeof Test> = {
  title: 'Test/Simple',
  component: Test,
};

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    text: 'Hello Storybook!',
  },
};