import { defineConfig } from 'vite';
export default defineConfig({
  base: './',
  build: { target: 'es2020' },
  server: { port: 5173 },
  test: { include: ['tests/**/*.test.ts'] },
} as any);
