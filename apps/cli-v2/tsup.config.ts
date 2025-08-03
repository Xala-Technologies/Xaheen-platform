import { defineConfig } from 'tsup';

export default defineConfig({
  entry: ['src/index.ts'],
  format: ['esm'],
  dts: true,
  sourcemap: true,
  clean: true,
  minify: process.env.NODE_ENV === 'production',
  treeshake: true,
  splitting: false,
  shims: true,
  banner: {
    js: '#!/usr/bin/env node'
  },
  esbuildOptions(options) {
    options.platform = 'node';
    options.target = 'node18';
  },
  // External dependencies that should not be bundled
  external: [
    'node:*',
    'ts-morph'
  ],
  noExternal: [
    '@clack/prompts',
    'consola',
    'chalk'
  ]
});