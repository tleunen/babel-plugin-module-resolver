import { defineConfig } from 'vite-plus';

export default defineConfig({
  pack: {
    entry: ['src/index.js'],
    format: ['esm', 'cjs'],
    outputOptions: {
      exports: 'named',
    },
    sourcemap: true,
    platform: 'node',
  },
  test: {
    globals: true,
  },
});
