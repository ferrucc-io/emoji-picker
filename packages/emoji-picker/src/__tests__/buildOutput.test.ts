import { execSync } from 'child_process';
import { existsSync, readFileSync, statSync } from 'fs';
import { resolve } from 'path';
import { beforeAll, describe, expect, test } from 'bun:test';

const PACKAGE_ROOT = resolve(import.meta.dir, '../..');
const DIST_DIR = resolve(PACKAGE_ROOT, 'dist');

const EXPECTED_ARTIFACTS = [
  'index.js',
  'index.cjs',
  'lazy.js',
  'lazy.cjs',
  'index.d.ts',
  'lazy.d.ts',
];

describe('Package build artifacts', () => {
  beforeAll(() => {
    execSync('bun run build', { cwd: PACKAGE_ROOT, stdio: 'pipe' });
  });

  test('emits all main and lazy ESM, CJS, and TypeScript declaration files', () => {
    for (const file of EXPECTED_ARTIFACTS) {
      const fullPath = resolve(DIST_DIR, file);
      expect(existsSync(fullPath)).toBe(true);
      expect(statSync(fullPath).size).toBeGreaterThan(0);
    }
  });

  test('keeps dist/lazy.js lightweight (< 10 KB) and dynamically imports ./index.js', () => {
    const lazyJsPath = resolve(DIST_DIR, 'lazy.js');
    const lazySize = statSync(lazyJsPath).size;
    const lazySource = readFileSync(lazyJsPath, 'utf-8');

    expect(lazySize).toBeLessThan(10 * 1024);
    expect(lazySource).toContain('import("./index.js")');
  });

  test('externalizes runtime dependencies while bundling unicode-emoji-json in dist/index.js', () => {
    const indexJsPath = resolve(DIST_DIR, 'index.js');
    const indexSource = readFileSync(indexJsPath, 'utf-8');

    expect(indexSource).toContain('from"jotai"');
    expect(indexSource).toContain('from"@tanstack/react-virtual"');
    expect(indexSource).toContain('from"clsx"');
    expect(indexSource).toContain('from"tailwind-merge"');
    expect(indexSource).not.toContain('from"unicode-emoji-json');
    expect(indexSource).toContain('Smileys & Emotion');
  });

  test('emits relative type imports without @/ path aliases in entry declarations', () => {
    const indexDts = readFileSync(resolve(DIST_DIR, 'index.d.ts'), 'utf-8');
    const lazyDts = readFileSync(resolve(DIST_DIR, 'lazy.d.ts'), 'utf-8');

    expect(indexDts).not.toContain('@/');
    expect(lazyDts).not.toContain('@/');
  });
});
