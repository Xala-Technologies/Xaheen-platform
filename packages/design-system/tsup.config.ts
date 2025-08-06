import { defineConfig } from 'tsup';

export default defineConfig({
  entry: ['src/index.ts'],
  format: ['cjs', 'esm'],
  dts: {
    // Skip type checking for faster builds
    // We'll validate types separately
    only: true,
  },
  external: [
    'react',
    'react-dom',
    '@radix-ui/*',
    '@heroicons/react',
    'class-variance-authority',
    'clsx',
    'tailwind-merge',
  ],
  clean: true,
  sourcemap: true,
  splitting: false,
  treeshake: true,
  outDir: 'dist',
  target: 'es2022',
  skipNodeModulesBundle: true,
  esbuildOptions(options) {
    options.banner = {
      js: '"use client";', // For Next.js compatibility
    };
  },
});