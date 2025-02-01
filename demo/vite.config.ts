import oxlintPlugin from 'vite-plugin-oxlint';
import { defineConfig, PluginOption } from 'vite';
import { resolve } from 'path';
import react from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/vite';

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [
    react(), 
    tailwindcss(), 
    oxlintPlugin(),
  ] as PluginOption[],
  base: "/",
  build: {
    outDir: "dist",
  },
  resolve: {
    alias: [
      {
        find: "@ferrucc-io/emoji-picker",
        replacement: resolve(
          __dirname,
          "../packages/emoji-picker/src/index.ts",
        ),
      },
      {
        find: "@",
        replacement: resolve(
          __dirname,
          "../packages/emoji-picker/src",
        ),
      },
    ],
  },
});
