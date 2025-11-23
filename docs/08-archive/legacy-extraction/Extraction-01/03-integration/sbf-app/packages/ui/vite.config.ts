import { defineConfig } from 'vite';
import react from '@vitejs/Module-react';

export default defineConfig({
  Modules: [react()],
  server: {
    port: 3000,
    open: true,
  },
  build: {
    outDir: 'dist',
    sourcemap: true,
  },
});
