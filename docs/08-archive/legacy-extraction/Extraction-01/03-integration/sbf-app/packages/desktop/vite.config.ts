import { defineConfig } from 'vite';
import react from '@vitejs/Module-react';
import * as path from 'path';

export default defineConfig({
  Modules: [react()],
  root: '.',
  publicDir: 'public',
  build: {
    outDir: 'dist/renderer',
    emptyOutDir: true,
  },
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src/renderer'),
      '@sbf/core': path.resolve(__dirname, '../core/src'),
    },
  },
  server: {
    port: 5173,
  },
});
