import { build } from 'esbuild';
import type { BuildOptions, Plugin } from 'esbuild';

const EXTERNAL_PACKAGES = [
  'react',
  'react-dom',
  'react/jsx-runtime',
  'react/jsx-dev-runtime',
  '@tanstack/react-virtual',
  'jotai',
  'clsx',
  'tailwind-merge',
];

function externalizeIndexEntryPlugin(targetPath: './index.js' | './index.cjs'): Plugin {
  return {
    name: 'externalize-index-entry',
    setup(pluginBuild) {
      pluginBuild.onResolve({ filter: /^\.\/index$/ }, () => ({
        path: targetPath,
        external: true,
      }));
    },
  };
}

const sharedOptions: BuildOptions = {
  bundle: true,
  minify: true,
  external: EXTERNAL_PACKAGES,
  jsx: 'automatic',
  target: 'es2020',
  logLevel: 'info',
};

async function buildEsm(): Promise<void> {
  await Promise.all([
    build({
      ...sharedOptions,
      entryPoints: ['src/index.ts'],
      format: 'esm',
      outfile: 'dist/index.js',
    }),
    build({
      ...sharedOptions,
      entryPoints: ['src/lazy.tsx'],
      format: 'esm',
      outfile: 'dist/lazy.js',
      plugins: [externalizeIndexEntryPlugin('./index.js')],
    }),
  ]);
}

async function buildCjs(): Promise<void> {
  await Promise.all([
    build({
      ...sharedOptions,
      entryPoints: ['src/index.ts'],
      format: 'cjs',
      outfile: 'dist/index.cjs',
    }),
    build({
      ...sharedOptions,
      entryPoints: ['src/lazy.tsx'],
      format: 'cjs',
      outfile: 'dist/lazy.cjs',
      supported: { 'dynamic-import': false },
      plugins: [externalizeIndexEntryPlugin('./index.cjs')],
    }),
  ]);
}

async function runBuild(): Promise<void> {
  const formatArg = process.argv.find((arg) => arg.startsWith('--format='));
  const format = formatArg?.split('=')[1];

  if (format === 'esm') {
    await buildEsm();
  } else if (format === 'cjs') {
    await buildCjs();
  } else {
    await Promise.all([buildEsm(), buildCjs()]);
  }
}

runBuild().catch((error) => {
  console.error(error);
  process.exit(1);
});
