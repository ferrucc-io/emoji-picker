import { existsSync, readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { spawnSync } from 'node:child_process';
import React from 'react';
import { atom } from 'jotai';
import { beforeAll, describe, expect, mock, test } from 'bun:test';
import { fireEvent, render } from '@testing-library/react';
import { mockEmojiData, mockFilteredEmojis } from './testData';
import type { EmojiMetadata, SkinTone } from '../../types/emoji';

const testSearchAtom = atom('');
const testSkinToneAtom = atom<SkinTone>('default');
const testHoveredEmojiAtom = atom<EmojiMetadata | null>(null);
const testSelectedEmojiAtom = atom<string | null>(null);
const testSelectedPositionAtom = atom<{ row: number; column: number } | null>(null);

beforeAll(() => {
  mock.module('@tanstack/react-virtual', () => ({
    useVirtualizer: (opts: { count: number; estimateSize: (index: number) => number }) => {
      const items = Array.from({ length: opts.count }, (_, index) => {
        const size = opts.estimateSize(index);
        return {
          index,
          start: index * 32,
          size,
          key: String(index),
          measureElement: null,
        };
      });
      return {
        getVirtualItems: () => items,
        getTotalSize: () => items.length * 32,
        scrollToIndex: () => {},
        range: items.length > 0 ? { startIndex: 0, endIndex: items.length - 1 } : null,
      };
    },
    defaultRangeExtractor: (range: { startIndex: number; endIndex: number }) => {
      const result: number[] = [];
      for (let i = range.startIndex; i <= range.endIndex; i++) {
        result.push(i);
      }
      return result;
    },
  }));

  mock.module('unicode-emoji-json/data-by-group.json', () => mockEmojiData);

  mock.module('../../utils/supportedEmojis', () => ({
    filterSupportedEmojis: () => mockFilteredEmojis,
  }));

  mock.module('../../atoms/emoji', () => ({
    searchAtom: testSearchAtom,
    skinToneAtom: testSkinToneAtom,
    skinToneOnlyAtom: atom((get) => get(testSkinToneAtom)),
    filteredEmojisAtom: atom((get) => {
      const query = get(testSearchAtom).trim().toLowerCase();
      if (!query) {
        return mockFilteredEmojis;
      }
      if (query === 'no-such-emoji-xyz') {
        return [];
      }
      return mockFilteredEmojis;
    }),
    hoveredEmojiAtom: testHoveredEmojiAtom,
    selectedEmojiAtom: testSelectedEmojiAtom,
    selectedPositionAtom: testSelectedPositionAtom,
  }));
});

import * as pkgExports from '../../index';
import { EmojiPicker } from '../EmojiPicker';

const packageRoot = resolve(import.meta.dir, '../../..');
const repoRoot = resolve(packageRoot, '../..');

describe('Semantic data-slot attributes & CSS variables', () => {
  test('renders all data-slot targets, CSS custom properties, and merges style prop', () => {
    const { container } = render(
      <EmojiPicker
        emojisPerRow={10}
        emojiSize={34}
        style={{ maxWidth: '360px' }}
        onEmojiSelect={() => {}}
      >
        <EmojiPicker.Header>
          <EmojiPicker.Input placeholder="Search emoji" />
        </EmojiPicker.Header>
        <EmojiPicker.Group>
          <EmojiPicker.List />
        </EmojiPicker.Group>
        <EmojiPicker.Preview>
          {({ previewedEmoji }) => (
            <>
              {previewedEmoji ? <EmojiPicker.Content /> : <span>Hover an emoji</span>}
              <EmojiPicker.SkinTone />
            </>
          )}
        </EmojiPicker.Preview>
      </EmojiPicker>
    );

    const root = container.querySelector('[data-slot="emoji-picker"]') as HTMLElement;
    expect(root).not.toBeNull();
    expect(root.className).toInclude('bg-white');
    expect(root.className).toInclude('dark:bg-zinc-950');
    expect(root.className).toInclude('border-zinc-200');
    expect(root.className).toInclude('dark:border-zinc-800');
    expect(root.className).not.toInclude('bg-background');
    expect(root.className).not.toInclude('border-border');

    // CSS custom properties & merged inline style
    expect(root.style.getPropertyValue('--emoji-picker-cols')).toBe('10');
    expect(root.style.getPropertyValue('--emoji-picker-size')).toBe('34px');
    expect(root.style.maxWidth).toBe('360px');

    // Header, search wrapper, input
    expect(container.querySelector('[data-slot="emoji-picker-header"]')).not.toBeNull();
    expect(container.querySelector('[data-slot="emoji-picker-search-wrapper"]')).not.toBeNull();
    const input = container.querySelector('[data-slot="emoji-picker-input"]') as HTMLInputElement;
    expect(input).not.toBeNull();

    // Group, viewport, list, row, sticky header label, emoji button
    expect(container.querySelector('[data-slot="emoji-picker-group"]')).not.toBeNull();
    expect(container.querySelector('[data-slot="emoji-picker-viewport"]')).not.toBeNull();
    expect(container.querySelector('[data-slot="emoji-picker-list"]')).not.toBeNull();
    expect(container.querySelector('[data-slot="emoji-picker-row"]')).not.toBeNull();

    const headerLabels = container.querySelectorAll('[data-slot="emoji-picker-header-label"]');
    expect(headerLabels.length).toBeGreaterThan(0);
    expect(headerLabels[0].hasAttribute('data-sticky')).toBe(true);

    const emojiButton = container.querySelector(
      '[data-slot="emoji-picker-button"]'
    ) as HTMLButtonElement;
    expect(emojiButton).not.toBeNull();
    expect(emojiButton.hasAttribute('data-selected')).toBe(false);

    // Hover & click emoji button -> preview content & data-selected state
    fireEvent.mouseEnter(emojiButton);
    expect(container.querySelector('[data-slot="emoji-picker-preview"]')).not.toBeNull();
    expect(container.querySelector('[data-slot="emoji-picker-content"]')).not.toBeNull();

    fireEvent.click(emojiButton);
    expect(emojiButton.hasAttribute('data-selected')).toBe(true);

    // Skin tone trigger and expanded selector both expose data-slot="emoji-picker-skin-tone"
    const skinToneTrigger = container.querySelector(
      '[data-slot="emoji-picker-skin-tone"]'
    ) as HTMLElement;
    expect(skinToneTrigger).not.toBeNull();
    expect(skinToneTrigger.tagName).toBe('BUTTON');
    fireEvent.click(skinToneTrigger);
    const skinToneOpen = container.querySelector(
      '[data-slot="emoji-picker-skin-tone"]'
    ) as HTMLElement;
    expect(skinToneOpen).not.toBeNull();
    expect(skinToneOpen.tagName).toBe('DIV');

    // Search clear button & empty state data-slot
    fireEvent.change(input, { target: { value: 'no-such-emoji-xyz' } });
    const clearButton = container.querySelector(
      '[data-slot="emoji-picker-clear"]'
    ) as HTMLButtonElement;
    expect(clearButton).not.toBeNull();
    expect(container.querySelector('[data-slot="emoji-picker-empty"]')).not.toBeNull();

    fireEvent.click(clearButton);
    expect(container.querySelector('[data-slot="emoji-picker-clear"]')).toBeNull();
  });

  test('supports custom emoji buttons and custom preview content with data-slot attributes', () => {
    const { container } = render(
      <EmojiPicker
        customSections={[
          {
            id: 'custom',
            name: 'Custom',
            emojis: [{ id: 'party', name: 'party', imageUrl: '/party.png' }],
          },
        ]}
      >
        <EmojiPicker.Group>
          <EmojiPicker.List hideStickyHeader />
        </EmojiPicker.Group>
        <EmojiPicker.Preview>{() => <EmojiPicker.Content />}</EmojiPicker.Preview>
      </EmojiPicker>
    );

    const customBtn = container.querySelector(
      '[data-slot="emoji-picker-button"][data-custom-emoji="true"]'
    ) as HTMLButtonElement;
    expect(customBtn).not.toBeNull();

    const headerLabel = container.querySelector('[data-slot="emoji-picker-header-label"]');
    expect(headerLabel?.hasAttribute('data-sticky')).toBe(false);

    fireEvent.mouseEnter(customBtn);
    fireEvent.click(customBtn);
    expect(customBtn.hasAttribute('data-selected')).toBe(true);
    expect(container.querySelector('[data-slot="emoji-picker-content"]')).not.toBeNull();
  });
});

describe('Standalone zero-Tailwind stylesheet & package metadata', () => {
  test('src/styles.css uses zero-specificity :where(...) selectors and covers all data-slot targets', () => {
    const cssPath = resolve(packageRoot, 'src/styles.css');
    const css = readFileSync(cssPath, 'utf8');

    const expectedSlots = [
      'emoji-picker',
      'emoji-picker-header',
      'emoji-picker-search-wrapper',
      'emoji-picker-input',
      'emoji-picker-clear',
      'emoji-picker-group',
      'emoji-picker-viewport',
      'emoji-picker-list',
      'emoji-picker-row',
      'emoji-picker-header-label',
      'emoji-picker-button',
      'emoji-picker-preview',
      'emoji-picker-content',
      'emoji-picker-skin-tone',
      'emoji-picker-empty',
    ];

    for (const slot of expectedSlots) {
      expect(css).toContain(`data-slot='${slot}'`);
    }

    expect(css).toContain('@media (prefers-color-scheme: dark)');
    expect(css).toContain('.dark');
    expect(css).toContain('--emoji-hover-color');
    expect(css).toContain('backdrop-filter');
    expect(css).toContain('[data-sticky]');
    expect(css).toContain('[data-selected]');

    // Strip block comments, then inspect every selector header before `{`
    const withoutComments = css.replace(/\/\*[\s\S]*?\*\//g, '');
    const selectorHeaders = [...withoutComments.matchAll(/([^{}]+)\{/g)]
      .map((match) => match[1].trim())
      .filter((header) => !header.startsWith('@'));

    expect(selectorHeaders.length).toBeGreaterThan(0);

    for (const selectorGroup of selectorHeaders) {
      // Every selector in a comma-separated selector list must begin with :where(...)
      // and contain no non-:where class/attribute/id selectors outside :where(...)
      let depth = 0;
      let current = '';
      const topLevelSelectors: string[] = [];
      for (const ch of selectorGroup) {
        if (ch === '(') depth++;
        if (ch === ')') depth--;
        if (ch === ',' && depth === 0) {
          topLevelSelectors.push(current.trim());
          current = '';
        } else {
          current += ch;
        }
      }
      if (current.trim()) {
        topLevelSelectors.push(current.trim());
      }

      for (const sel of topLevelSelectors) {
        expect(sel.startsWith(':where(')).toBe(true);
        // Strip balanced :where(...) groups; only combinators/whitespace or pseudo-elements should remain
        let stripped = '';
        let parenDepth = 0;
        for (let i = 0; i < sel.length; i++) {
          if (sel.startsWith(':where(', i) && parenDepth === 0) {
            parenDepth = 1;
            i += ':where('.length - 1;
            continue;
          }
          if (parenDepth > 0) {
            if (sel[i] === '(') parenDepth++;
            if (sel[i] === ')') parenDepth--;
            continue;
          }
          stripped += sel[i];
        }
        expect(stripped.trim()).toMatch(/^(::(before|after|placeholder))?$/);
      }
    }
  });

  test('package.json exports ./styles.css, marks tailwindcss optional, and build outputs dist/styles.css', () => {
    const pkgJson = JSON.parse(readFileSync(resolve(packageRoot, 'package.json'), 'utf8'));

    expect(pkgJson.exports['./styles.css']).toBe('./dist/styles.css');
    expect(pkgJson.peerDependenciesMeta?.tailwindcss?.optional).toBe(true);
    expect(pkgJson.scripts['build:css']).toBeDefined();
    expect(pkgJson.scripts.build).toContain('build:css');

    const distCssPath = resolve(packageRoot, 'dist/styles.css');
    if (!existsSync(distCssPath)) {
      const res = spawnSync('bun', ['run', 'build:css'], { cwd: packageRoot });
      expect(res.status).toBe(0);
    }

    expect(existsSync(distCssPath)).toBe(true);
    expect(readFileSync(distCssPath, 'utf8')).toBe(
      readFileSync(resolve(packageRoot, 'src/styles.css'), 'utf8')
    );
  });
});

describe('shadcn/ui registry endpoints', () => {
  const indexSource = readFileSync(resolve(packageRoot, 'src/index.ts'), 'utf8');

  test('demo/public/r/emoji-picker.json conforms to registry:ui schema and references only real exports', () => {
    const raw = readFileSync(resolve(repoRoot, 'demo/public/r/emoji-picker.json'), 'utf8');
    const item = JSON.parse(raw);

    expect(item.$schema).toBe('https://ui.shadcn.com/schema/registry-item.json');
    expect(item.name).toBe('emoji-picker');
    expect(item.type).toBe('registry:ui');
    expect(item.dependencies).toContain('@ferrucc-io/emoji-picker');
    expect(Array.isArray(item.files)).toBe(true);
    expect(item.files.length).toBe(1);
    expect(item.files[0].path).toBe('components/ui/emoji-picker.tsx');
    expect(item.files[0].type).toBe('registry:ui');

    const content: string = item.files[0].content;
    expect(content).toContain('bg-popover');
    expect(content).toContain('text-popover-foreground');
    expect(content).toContain('border-border');
    expect(content).toContain('bg-muted');
    expect(content).toContain('text-muted-foreground');
    expect(content).not.toContain('.Loading');

    // Verify all named imports from @ferrucc-io/emoji-picker exist in src/index.ts
    const importMatch = content.match(
      /import\s*\{([\s\S]*?)\}\s*from\s*["']@ferrucc-io\/emoji-picker["']/
    );
    expect(importMatch).not.toBeNull();
    const specifiers = importMatch![1]
      .split(',')
      .map((s) => s.trim())
      .filter(Boolean);

    const runtimeExports = new Set(Object.keys(pkgExports));
    for (const spec of specifiers) {
      if (spec.startsWith('type ')) {
        const typeName = spec
          .replace(/^type\s+/, '')
          .split(/\s+as\s+/)[0]
          .trim();
        expect(indexSource).toContain(typeName);
      } else {
        const importedName = spec.split(/\s+as\s+/)[0].trim();
        expect(runtimeExports.has(importedName)).toBe(true);
      }
    }

    // Verify all EmojiPickerPrimitive.<Sub> compound members exist on EmojiPicker
    const subMatches = [...content.matchAll(/EmojiPickerPrimitive\.([A-Za-z]+)/g)];
    expect(subMatches.length).toBeGreaterThan(0);
    for (const m of subMatches) {
      const subName = m[1] as keyof typeof EmojiPicker;
      expect(EmojiPicker[subName]).toBeDefined();
    }
  });

  test('demo/public/r/emoji-picker-popover.json conforms to registry:component schema', () => {
    const raw = readFileSync(resolve(repoRoot, 'demo/public/r/emoji-picker-popover.json'), 'utf8');
    const item = JSON.parse(raw);

    expect(item.$schema).toBe('https://ui.shadcn.com/schema/registry-item.json');
    expect(item.name).toBe('emoji-picker-popover');
    expect(item.type).toBe('registry:component');
    expect(item.registryDependencies).toEqual([
      'popover',
      'button',
      'https://emoji.ferrucc.io/r/emoji-picker.json',
    ]);
    expect(Array.isArray(item.files)).toBe(true);
    expect(item.files.length).toBe(1);
    expect(item.files[0].path).toBe('components/emoji-picker-popover.tsx');
    expect(item.files[0].type).toBe('registry:component');
    expect(item.files[0].content).toContain('@/components/ui/popover');
    expect(item.files[0].content).toContain('@/components/ui/button');
    expect(item.files[0].content).toContain('@/components/ui/emoji-picker');
  });
});
