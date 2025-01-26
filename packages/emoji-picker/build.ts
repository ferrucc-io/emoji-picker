import type { BuildConfig } from 'bun';
import { spawnSync } from 'child_process';

const defaultBuildConfig: BuildConfig = {
  entrypoints: ['./src/index.ts'],
  outdir: './dist',
  external: ['react', 'react-dom'],
  minify: true,
  root: './src',
};

// Build JS bundles
await Promise.all([
  Bun.build({
    ...defaultBuildConfig,
    format: 'esm',
    naming: '[name].js',
  }),
  Bun.build({
    ...defaultBuildConfig,
    format: 'cjs',
    naming: '[name].cjs',
  }),
]);

// Generate type declarations
spawnSync('tsc', ['--project', 'tsconfig.build.json'], { stdio: 'inherit' });
