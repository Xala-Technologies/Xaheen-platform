import { createRequire } from "node:module";
import { dirname, join } from "node:path";
import type { StorybookConfig } from '@storybook/react-vite';

const require = createRequire(import.meta.url);

const config: StorybookConfig = {
  stories: [
    '../src/**/*.stories.@(js|jsx|ts|tsx|mdx)',
    '../stories/**/*.stories.@(js|jsx|ts|tsx|mdx)'
  ],
  
  addons: [
    getAbsolutePath("@storybook/addon-essentials"),
    getAbsolutePath("@storybook/addon-a11y"),
    getAbsolutePath("@storybook/addon-links"),
    getAbsolutePath("@storybook/addon-docs")
  ],

  framework: {
    name: getAbsolutePath("@storybook/react-vite"),
    options: {}
  },

  typescript: {
    check: false,
    reactDocgen: 'react-docgen-typescript',
    reactDocgenTypescriptOptions: {
      shouldExtractLiteralValuesFromEnum: true,
      propFilter: (prop) => (prop.parent ? !/node_modules/.test(prop.parent.fileName) : true),
    },
  },


  docs: {
    defaultName: 'Documentation'
  },

  viteFinal: async (config) => {
    // Add resolve alias for cleaner imports
    config.resolve = {
      ...config.resolve,
      alias: {
        ...config.resolve?.alias,
        '@': '/Volumes/Development/Xaheen Enterprise/xaheen/packages/design-system',
      },
    };
    return config;
  },
};

export default config;

function getAbsolutePath(value: string): any {
  return dirname(require.resolve(join(value, "package.json")));
}